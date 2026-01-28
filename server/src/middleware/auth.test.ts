import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import { authenticate, optionalAuth } from './auth.js'
import type { AuthRequest } from '../types/index.js'

const TEST_SECRET = 'test-secret-key-that-is-at-least-32-chars-long'

// Mock env
vi.mock('../config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-chars-long',
  },
}))

function createMockReq(token?: string): AuthRequest {
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
  } as AuthRequest
}

function createMockRes(): Response {
  return {} as Response
}

describe('authenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('authenticates a valid token', () => {
    const payload = { userId: 'user-1', coupleId: 'couple-1', email: 'test@test.com' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' })

    const req = createMockReq(token)
    const res = createMockRes()
    const next = vi.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.user).toBeDefined()
    expect(req.user?.userId).toBe('user-1')
    expect(req.user?.coupleId).toBe('couple-1')
    expect(req.user?.email).toBe('test@test.com')
  })

  it('rejects request without authorization header', () => {
    const req = createMockReq()
    const res = createMockRes()
    const next = vi.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No token provided',
        statusCode: 401,
      })
    )
  })

  it('rejects request with invalid token', () => {
    const req = createMockReq('invalid-token')
    const res = createMockRes()
    const next = vi.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        statusCode: 401,
      })
    )
  })

  it('rejects expired token', () => {
    const payload = { userId: 'user-1', coupleId: 'couple-1', email: 'test@test.com' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '0s' })

    // Wait a moment so the token expires
    const req = createMockReq(token)
    const res = createMockRes()
    const next = vi.fn()

    // Need to tick time forward slightly for expiry
    setTimeout(() => {
      authenticate(req, res, next)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        })
      )
    }, 10)
  })

  it('rejects token signed with wrong secret', () => {
    const payload = { userId: 'user-1', coupleId: 'couple-1', email: 'test@test.com' }
    const token = jwt.sign(payload, 'wrong-secret-key-that-is-32-chars-long!!', { expiresIn: '1h' })

    const req = createMockReq(token)
    const res = createMockRes()
    const next = vi.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      })
    )
  })
})

describe('optionalAuth', () => {
  it('attaches user when valid token provided', () => {
    const payload = { userId: 'user-1', coupleId: 'couple-1', email: 'test@test.com' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' })

    const req = createMockReq(token)
    const res = createMockRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.user?.userId).toBe('user-1')
  })

  it('continues without user when no token', () => {
    const req = createMockReq()
    const res = createMockRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.user).toBeUndefined()
  })

  it('continues without user when invalid token', () => {
    const req = createMockReq('bad-token')
    const res = createMockRes()
    const next = vi.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.user).toBeUndefined()
  })
})
