import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as coupleService from '../services/couple.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

// All couple routes require authentication
router.use(authenticate)

// Validation schemas
const joinSchema = z.object({
  inviteCode: z.string().length(6, 'Invite code must be 6 characters'),
})

const themeSchema = z.object({
  name: z.string().min(1),
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

// GET /api/couple/status
router.get('/status', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.coupleId) {
      res.status(400).json({
        error: { code: 'NO_COUPLE', message: 'User has no couple' }
      })
      return
    }

    const status = await coupleService.getCoupleStatus(req.user.userId, req.user.coupleId)
    res.json({ data: status })
  } catch (error) {
    next(error)
  }
})

// POST /api/couple/join
router.post(
  '/join',
  validateBody(joinSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { inviteCode } = req.body
      const result = await coupleService.joinCouple(req.user!.userId, inviteCode)

      res.json({ data: result })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/couple/unpair
router.delete('/unpair', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.coupleId) {
      res.status(400).json({
        error: { code: 'NO_COUPLE', message: 'User has no couple' }
      })
      return
    }

    const result = await coupleService.unpairCouple(req.user.userId, req.user.coupleId)
    res.json({ data: result })
  } catch (error) {
    next(error)
  }
})

// PUT /api/couple/theme
router.put(
  '/theme',
  validateBody(themeSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const theme = await coupleService.updateCoupleTheme(req.user.coupleId, req.body)
      res.json({ data: { theme } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
