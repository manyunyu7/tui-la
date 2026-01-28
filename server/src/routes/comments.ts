import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as commentsService from '../services/comments.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

router.use(authenticate)

const pinIdParams = z.object({
  pinId: z.string().uuid(),
})

const commentIdParams = z.object({
  pinId: z.string().uuid(),
  commentId: z.string().uuid(),
})

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
})

// GET /api/pins/:pinId/comments
router.get(
  '/:pinId/comments',
  validateParams(pinIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const comments = await commentsService.getComments(
        req.params.pinId,
        req.user.coupleId
      )
      res.json({ data: comments })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/pins/:pinId/comments
router.post(
  '/:pinId/comments',
  validateParams(pinIdParams),
  validateBody(createCommentSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const comment = await commentsService.createComment(
        req.params.pinId,
        req.user.userId,
        req.body.content,
        req.user.coupleId
      )
      res.status(201).json({ data: comment })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/pins/:pinId/comments/:commentId
router.delete(
  '/:pinId/comments/:commentId',
  validateParams(commentIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      await commentsService.deleteComment(
        req.params.commentId,
        req.user.userId,
        req.user.coupleId
      )
      res.json({ data: { message: 'Comment deleted successfully' } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
