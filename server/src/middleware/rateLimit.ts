import type { Request, Response, NextFunction } from 'express'
import { redis } from '../config/redis.js'
import { TooManyRequestsError } from '../utils/errors.js'

interface RateLimitOptions {
  windowMs: number
  max: number
  keyPrefix?: string
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = 'rl' } = options
  const windowSeconds = Math.ceil(windowMs / 1000)

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Use IP address as identifier
      const identifier = req.ip || req.socket.remoteAddress || 'unknown'
      const key = `${keyPrefix}:${identifier}`

      const current = await redis.incr(key)

      if (current === 1) {
        await redis.expire(key, windowSeconds)
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current))

      if (current > max) {
        const ttl = await redis.ttl(key)
        res.setHeader('Retry-After', ttl)
        throw new TooManyRequestsError('Too many requests, please try again later')
      }

      next()
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        next(error)
      } else {
        // If Redis fails, allow the request
        console.error('Rate limit Redis error:', error)
        next()
      }
    }
  }
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyPrefix: 'rl:auth',
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyPrefix: 'rl:api',
})
