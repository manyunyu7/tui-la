import { describe, it, expect } from 'vitest'
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
} from './errors.js'

describe('AppError', () => {
  it('creates an error with default values', () => {
    const error = new AppError('Something went wrong')
    expect(error.message).toBe('Something went wrong')
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.name).toBe('AppError')
  })

  it('creates an error with custom values', () => {
    const error = new AppError('Custom', 418, 'TEAPOT', { brewing: true })
    expect(error.statusCode).toBe(418)
    expect(error.code).toBe('TEAPOT')
    expect(error.details).toEqual({ brewing: true })
  })

  it('is an instance of Error', () => {
    const error = new AppError('test')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })
})

describe('BadRequestError', () => {
  it('has 400 status code', () => {
    const error = new BadRequestError()
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('BAD_REQUEST')
    expect(error.message).toBe('Bad request')
  })

  it('accepts custom message', () => {
    const error = new BadRequestError('Invalid input')
    expect(error.message).toBe('Invalid input')
  })
})

describe('UnauthorizedError', () => {
  it('has 401 status code', () => {
    const error = new UnauthorizedError()
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
  })
})

describe('ForbiddenError', () => {
  it('has 403 status code', () => {
    const error = new ForbiddenError()
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('FORBIDDEN')
  })
})

describe('NotFoundError', () => {
  it('has 404 status code', () => {
    const error = new NotFoundError()
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
  })

  it('accepts custom message', () => {
    const error = new NotFoundError('Pin not found')
    expect(error.message).toBe('Pin not found')
  })
})

describe('ConflictError', () => {
  it('has 409 status code', () => {
    const error = new ConflictError()
    expect(error.statusCode).toBe(409)
    expect(error.code).toBe('CONFLICT')
  })
})

describe('ValidationError', () => {
  it('has 422 status code', () => {
    const error = new ValidationError()
    expect(error.statusCode).toBe(422)
    expect(error.code).toBe('VALIDATION_ERROR')
  })
})

describe('TooManyRequestsError', () => {
  it('has 429 status code', () => {
    const error = new TooManyRequestsError()
    expect(error.statusCode).toBe(429)
    expect(error.code).toBe('TOO_MANY_REQUESTS')
  })
})
