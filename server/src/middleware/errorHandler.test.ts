import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { ZodError, z } from 'zod'
import { errorHandler } from './errorHandler.js'
import { AppError, NotFoundError, BadRequestError } from '../utils/errors.js'

// Mock env to avoid dotenv loading
vi.mock('../config/env.js', () => ({
  env: {
    NODE_ENV: 'development',
  },
}))

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as unknown as Response
}

describe('errorHandler', () => {
  const req = {} as Request
  const next = vi.fn() as NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error in tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('handles ZodError with 422 status', () => {
    const schema = z.object({ name: z.string() })
    let zodError: ZodError
    try {
      schema.parse({ name: 123 })
    } catch (e) {
      zodError = e as ZodError
    }

    const res = createMockRes()
    errorHandler(zodError!, req, res, next)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: expect.any(Object),
      },
    })
  })

  it('handles AppError with custom status', () => {
    const error = new NotFoundError('Pin not found')
    const res = createMockRes()

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Pin not found',
        details: undefined,
      },
    })
  })

  it('handles BadRequestError', () => {
    const error = new BadRequestError('Invalid input')
    const res = createMockRes()

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('handles AppError with details', () => {
    const error = new AppError('Custom', 418, 'TEAPOT', { field: 'email' })
    const res = createMockRes()

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(418)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'TEAPOT',
        message: 'Custom',
        details: { field: 'email' },
      },
    })
  })

  it('handles unknown errors with 500 status', () => {
    const error = new Error('Something broke')
    const res = createMockRes()

    errorHandler(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something broke',
      },
    })
  })
})
