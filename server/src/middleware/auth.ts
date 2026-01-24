import type { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { UnauthorizedError } from '../utils/errors.js'
import type { AuthRequest, JWTPayload } from '../types/index.js'

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }

    const token = authHeader.substring(7)

    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    req.user = payload

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'))
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'))
    } else {
      next(error)
    }
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload
      req.user = payload
    }

    next()
  } catch {
    // Token invalid but continue without user
    next()
  }
}
