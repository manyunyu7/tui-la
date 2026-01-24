import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'
import { query, transaction } from '../config/database.js'
import { redis } from '../config/redis.js'
import { generateInviteCode, generateRandomString, hashToken } from '../utils/helpers.js'
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js'
import type { User, JWTPayload, UserPublic } from '../types/index.js'

const BCRYPT_ROUNDS = 12

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<{ user: UserPublic; tokens: { accessToken: string; refreshToken: string } }> {
  // Check if email exists
  const existing = await query<User>(
    'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email.toLowerCase()]
  )

  if (existing.rows.length > 0) {
    throw new ConflictError('Email already registered')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  // Generate invite code
  let inviteCode: string
  let isUnique = false

  while (!isUnique) {
    inviteCode = generateInviteCode()
    const check = await query('SELECT id FROM couples WHERE invite_code = $1', [inviteCode])
    isUnique = check.rows.length === 0
  }

  // Create couple and user in transaction
  const result = await transaction(async (client) => {
    // Create couple first
    const coupleResult = await client.query<{ id: string }>(
      `INSERT INTO couples (invite_code, theme)
       VALUES ($1, $2)
       RETURNING id`,
      [inviteCode!, { name: 'rose_garden', primary: '#E11D48' }]
    )
    const coupleId = coupleResult.rows[0].id

    // Create user
    const userResult = await client.query<User>(
      `INSERT INTO users (couple_id, email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [coupleId, email.toLowerCase(), passwordHash, displayName, 'partner_1']
    )

    return userResult.rows[0]
  })

  // Generate tokens
  const tokens = await generateTokens(result)

  return {
    user: toPublicUser(result),
    tokens,
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: UserPublic; tokens: { accessToken: string; refreshToken: string } }> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email.toLowerCase()]
  )

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password')
  }

  const user = result.rows[0]

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password')
  }

  // Update last login
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  )

  // Generate tokens
  const tokens = await generateTokens(user)

  return {
    user: toPublicUser(user),
    tokens,
  }
}

export async function refreshTokens(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenHash = hashToken(refreshToken)

  // Find valid refresh token
  const result = await query<{ user_id: string }>(
    `SELECT user_id FROM refresh_tokens
     WHERE token_hash = $1 AND expires_at > NOW() AND revoked_at IS NULL`,
    [tokenHash]
  )

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  // Revoke old token
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
    [tokenHash]
  )

  // Get user
  const userResult = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [result.rows[0].user_id]
  )

  if (userResult.rows.length === 0) {
    throw new NotFoundError('User not found')
  }

  // Generate new tokens
  return generateTokens(userResult.rows[0])
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken)
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
    [tokenHash]
  )
}

export async function getUserById(userId: string): Promise<UserPublic | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  )

  if (result.rows.length === 0) {
    return null
  }

  return toPublicUser(result.rows[0])
}

async function generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
  const payload: JWTPayload = {
    userId: user.id,
    coupleId: user.coupleId,
    email: user.email,
  }

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as SignOptions)

  // Generate refresh token
  const refreshToken = generateRandomString(32)
  const tokenHash = hashToken(refreshToken)

  // Parse expiry (e.g., '7d' -> 7 days)
  const expiryMatch = env.JWT_REFRESH_EXPIRES.match(/^(\d+)([smhd])$/)
  let expiryMs = 7 * 24 * 60 * 60 * 1000 // default 7 days

  if (expiryMatch) {
    const value = parseInt(expiryMatch[1], 10)
    const unit = expiryMatch[2]
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }
    expiryMs = value * multipliers[unit]
  }

  const expiresAt = new Date(Date.now() + expiryMs)

  // Store refresh token
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt]
  )

  // Also cache user data in Redis for quick lookups
  await redis.setEx(
    `user:${user.id}`,
    3600, // 1 hour
    JSON.stringify(toPublicUser(user))
  )

  return { accessToken, refreshToken }
}

function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarPath: user.avatarPath,
    coupleId: user.coupleId,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
