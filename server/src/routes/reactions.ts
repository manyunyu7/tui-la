import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as reactionsService from '../services/reactions.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

router.use(authenticate)

const pinIdParams = z.object({
  pinId: z.string().uuid(),
})

const reactionSchema = z.object({
  type: z.string().min(1).max(20),
})

// GET /api/pins/:pinId/reactions
router.get(
  '/:pinId/reactions',
  validateParams(pinIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const reactions = await reactionsService.getReactionsForPin(
        req.params.pinId,
        req.user.coupleId
      )
      res.json({ data: reactions })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/pins/:pinId/reactions
router.post(
  '/:pinId/reactions',
  validateParams(pinIdParams),
  validateBody(reactionSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const reaction = await reactionsService.addReaction(
        req.params.pinId,
        req.user.userId,
        req.body.type,
        req.user.coupleId
      )
      res.status(201).json({ data: reaction })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/pins/:pinId/reactions/:type
router.delete(
  '/:pinId/reactions/:type',
  validateParams(z.object({
    pinId: z.string().uuid(),
    type: z.string().min(1).max(20),
  })),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      await reactionsService.removeReaction(
        req.params.pinId,
        req.user.userId,
        req.params.type,
        req.user.coupleId
      )
      res.json({ data: { message: 'Reaction removed' } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
