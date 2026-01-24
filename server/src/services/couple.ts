import { query, transaction } from '../config/database.js'
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors.js'
import type { Couple, User, UserPublic } from '../types/index.js'

export interface CoupleWithPartner {
  id: string
  inviteCode: string
  anniversaryDate: string | null
  theme: Couple['theme']
  settings: Record<string, unknown>
  pairedAt: string | null
  partner: UserPublic | null
  createdAt: string
  updatedAt: string
}

export async function getCoupleStatus(userId: string, coupleId: string): Promise<CoupleWithPartner> {
  // Get couple data
  const coupleResult = await query<Couple>(
    'SELECT * FROM couples WHERE id = $1 AND deleted_at IS NULL',
    [coupleId]
  )

  if (coupleResult.rows.length === 0) {
    throw new NotFoundError('Couple not found')
  }

  const couple = coupleResult.rows[0]

  // Get partner data
  const partnerResult = await query<User>(
    `SELECT * FROM users
     WHERE couple_id = $1 AND id != $2 AND deleted_at IS NULL`,
    [coupleId, userId]
  )

  const partner = partnerResult.rows.length > 0 ? toPublicUser(partnerResult.rows[0]) : null

  return {
    id: couple.id,
    inviteCode: couple.inviteCode,
    anniversaryDate: couple.anniversaryDate?.toISOString() || null,
    theme: couple.theme,
    settings: couple.settings,
    pairedAt: couple.pairedAt?.toISOString() || null,
    partner,
    createdAt: couple.createdAt.toISOString(),
    updatedAt: couple.updatedAt.toISOString(),
  }
}

export async function joinCouple(userId: string, inviteCode: string): Promise<CoupleWithPartner> {
  // Get user's current couple
  const userResult = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  )

  if (userResult.rows.length === 0) {
    throw new NotFoundError('User not found')
  }

  const user = userResult.rows[0]

  // Find couple by invite code
  const coupleResult = await query<Couple>(
    'SELECT * FROM couples WHERE invite_code = $1 AND deleted_at IS NULL',
    [inviteCode.toUpperCase()]
  )

  if (coupleResult.rows.length === 0) {
    throw new NotFoundError('Invalid invite code')
  }

  const couple = coupleResult.rows[0]

  // Check if this is the user's own couple
  if (couple.id === user.coupleId) {
    throw new BadRequestError('This is your own invite code')
  }

  // Check if couple already has 2 partners
  const partnersResult = await query<{ count: string }>(
    'SELECT COUNT(*) FROM users WHERE couple_id = $1 AND deleted_at IS NULL',
    [couple.id]
  )

  if (parseInt(partnersResult.rows[0].count, 10) >= 2) {
    throw new ConflictError('This couple is already complete')
  }

  // Check if already paired
  if (couple.pairedAt) {
    throw new ConflictError('This couple is already paired')
  }

  // Join couple
  await transaction(async (client) => {
    // Delete user's old empty couple
    if (user.coupleId) {
      // Check if the old couple has other members
      const oldCoupleMembers = await client.query(
        'SELECT COUNT(*) FROM users WHERE couple_id = $1 AND id != $2 AND deleted_at IS NULL',
        [user.coupleId, userId]
      )

      if (parseInt(oldCoupleMembers.rows[0].count, 10) === 0) {
        // No other members, soft delete the old couple
        await client.query(
          'UPDATE couples SET deleted_at = NOW() WHERE id = $1',
          [user.coupleId]
        )
      }
    }

    // Update user to join new couple
    await client.query(
      `UPDATE users SET couple_id = $1, role = 'partner_2', updated_at = NOW()
       WHERE id = $2`,
      [couple.id, userId]
    )

    // Mark couple as paired
    await client.query(
      'UPDATE couples SET paired_at = NOW(), updated_at = NOW() WHERE id = $1',
      [couple.id]
    )

    // Create default shared map for the couple
    await client.query(
      `INSERT INTO maps (couple_id, name, type)
       VALUES ($1, 'Our Map', 'shared')`,
      [couple.id]
    )
  })

  // Return updated couple status
  return getCoupleStatus(userId, couple.id)
}

export async function unpairCouple(userId: string, coupleId: string): Promise<{ message: string }> {
  // Get the user and verify they belong to this couple
  const userResult = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND couple_id = $2 AND deleted_at IS NULL',
    [userId, coupleId]
  )

  if (userResult.rows.length === 0) {
    throw new NotFoundError('User or couple not found')
  }

  const coupleResult = await query<Couple>(
    'SELECT * FROM couples WHERE id = $1 AND deleted_at IS NULL',
    [coupleId]
  )

  if (coupleResult.rows.length === 0) {
    throw new NotFoundError('Couple not found')
  }

  if (!coupleResult.rows[0].pairedAt) {
    throw new BadRequestError('Couple is not paired')
  }

  // Create a new couple for the leaving user
  await transaction(async (client) => {
    // Create new couple for the leaving user
    const newCoupleResult = await client.query<{ id: string }>(
      `INSERT INTO couples (invite_code, theme)
       SELECT
         UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
         theme
       FROM couples WHERE id = $1
       RETURNING id`,
      [coupleId]
    )

    const newCoupleId = newCoupleResult.rows[0].id

    // Move user to new couple
    await client.query(
      `UPDATE users SET couple_id = $1, role = 'partner_1', updated_at = NOW()
       WHERE id = $2`,
      [newCoupleId, userId]
    )

    // Update remaining user's role if they're partner_2
    await client.query(
      `UPDATE users SET role = 'partner_1', updated_at = NOW()
       WHERE couple_id = $1 AND id != $2 AND deleted_at IS NULL`,
      [coupleId, userId]
    )

    // Mark couple as unpaired
    await client.query(
      'UPDATE couples SET paired_at = NULL, updated_at = NOW() WHERE id = $1',
      [coupleId]
    )
  })

  return { message: 'Successfully unpaired from couple' }
}

export async function updateCoupleTheme(
  coupleId: string,
  theme: Couple['theme']
): Promise<Couple['theme']> {
  await query(
    `UPDATE couples SET theme = $1, updated_at = NOW() WHERE id = $2`,
    [theme, coupleId]
  )

  return theme
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
