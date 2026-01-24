import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/errors.js'
import { env } from '../config/env.js'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err)

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.reduce((acc, error) => {
          const path = error.path.join('.')
          acc[path] = error.message
          return acc
        }, {} as Record<string, string>),
      },
    })
    return
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    })
    return
  }

  // Handle unknown errors
  const statusCode = 500
  const message = env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message

  res.status(statusCode).json({
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  })
}
