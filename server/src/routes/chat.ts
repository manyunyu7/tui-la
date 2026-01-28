import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as chatService from '../services/chat.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

router.use(authenticate)

const mapIdParams = z.object({
  mapId: z.string().uuid(),
})

const messageIdParams = z.object({
  mapId: z.string().uuid(),
  messageId: z.string().uuid(),
})

const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'system']).optional(),
  metadata: z.record(z.unknown()).optional(),
})

const messagesQuery = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  before: z.string().optional(),
})

// GET /api/maps/:mapId/chat
router.get(
  '/:mapId/chat',
  validateParams(mapIdParams),
  validateQuery(messagesQuery),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const { limit, before } = req.query as z.infer<typeof messagesQuery>
      const messages = await chatService.getMessages(
        req.params.mapId,
        req.user.coupleId,
        limit,
        before as string | undefined
      )
      res.json({ data: messages })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/maps/:mapId/chat
router.post(
  '/:mapId/chat',
  validateParams(mapIdParams),
  validateBody(createMessageSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const message = await chatService.createMessage(
        {
          mapId: req.params.mapId,
          userId: req.user.userId,
          content: req.body.content,
          messageType: req.body.messageType,
          metadata: req.body.metadata,
        },
        req.user.coupleId
      )

      res.status(201).json({ data: message })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/maps/:mapId/chat/:messageId
router.delete(
  '/:mapId/chat/:messageId',
  validateParams(messageIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      await chatService.deleteMessage(
        req.params.messageId,
        req.user.userId,
        req.user.coupleId
      )
      res.json({ data: { message: 'Message deleted successfully' } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
