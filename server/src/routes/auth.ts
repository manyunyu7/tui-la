import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import { authRateLimit } from '../middleware/rateLimit.js'
import * as authService from '../services/auth.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// POST /api/auth/register
router.post(
  '/register',
  authRateLimit,
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const { email, password, displayName } = req.body
      const result = await authService.registerUser(email, password, displayName)

      res.status(201).json({ data: result })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/auth/login
router.post(
  '/login',
  authRateLimit,
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body
      const result = await authService.loginUser(email, password)

      res.json({ data: result })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/auth/refresh
router.post(
  '/refresh',
  validateBody(refreshSchema),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      const tokens = await authService.refreshTokens(refreshToken)

      res.json({ data: tokens })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/auth/logout
router.post(
  '/logout',
  validateBody(refreshSchema),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      await authService.logoutUser(refreshToken)

      res.json({ data: { message: 'Logged out successfully' } })
    } catch (error) {
      next(error)
    }
  }
)

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const user = await authService.getUserById(req.user!.userId)

      if (!user) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'User not found' }
        })
        return
      }

      res.json({ data: { user } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
