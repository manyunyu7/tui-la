import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'
import { validateBody, validateQuery, validateParams } from './validate.js'

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as Request
}

function createMockRes(): Response {
  return {} as Response
}

describe('validateBody', () => {
  const schema = z.object({
    title: z.string().min(1),
    count: z.number().positive(),
  })

  it('passes valid body to next()', () => {
    const req = createMockReq({ body: { title: 'Test', count: 5 } })
    const res = createMockRes()
    const next = vi.fn()

    validateBody(schema)(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.body).toEqual({ title: 'Test', count: 5 })
  })

  it('calls next with error on invalid body', () => {
    const req = createMockReq({ body: { title: '', count: -1 } })
    const res = createMockRes()
    const next = vi.fn()

    validateBody(schema)(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(z.ZodError))
  })

  it('calls next with error on missing fields', () => {
    const req = createMockReq({ body: {} })
    const res = createMockRes()
    const next = vi.fn()

    validateBody(schema)(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(z.ZodError))
  })
})

describe('validateQuery', () => {
  const schema = z.object({
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  })

  it('passes valid query to next()', () => {
    const req = createMockReq({ query: { page: '1', limit: '10' } as Record<string, string> })
    const res = createMockRes()
    const next = vi.fn()

    validateQuery(schema)(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('passes with empty query (optional fields)', () => {
    const req = createMockReq({ query: {} })
    const res = createMockRes()
    const next = vi.fn()

    validateQuery(schema)(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })
})

describe('validateParams', () => {
  const schema = z.object({
    id: z.string().uuid(),
  })

  it('passes valid params to next()', () => {
    const req = createMockReq({
      params: { id: '123e4567-e89b-12d3-a456-426614174000' } as Record<string, string>,
    })
    const res = createMockRes()
    const next = vi.fn()

    validateParams(schema)(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('calls next with error on invalid UUID', () => {
    const req = createMockReq({
      params: { id: 'not-a-uuid' } as Record<string, string>,
    })
    const res = createMockRes()
    const next = vi.fn()

    validateParams(schema)(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(z.ZodError))
  })
})
