import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as drawingsService from '../services/drawings.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

router.use(authenticate)

// Validation schemas
const mapIdParams = z.object({
  mapId: z.string().uuid(),
})

const drawingIdParams = z.object({
  drawingId: z.string().uuid(),
})

const createDrawingSchema = z.object({
  pathData: z.array(z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })).min(2),
  strokeColor: z.string().max(20).optional(),
  strokeWidth: z.number().min(1).max(20).optional(),
  opacity: z.number().min(0).max(1).optional(),
})

// GET /api/maps/:mapId/drawings
router.get(
  '/:mapId/drawings',
  validateParams(mapIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const drawings = await drawingsService.getDrawingsByMap(req.params.mapId, req.user.coupleId)
      res.json({ data: drawings })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/maps/:mapId/drawings
router.post(
  '/:mapId/drawings',
  validateParams(mapIdParams),
  validateBody(createDrawingSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const drawing = await drawingsService.createDrawing({
        mapId: req.params.mapId,
        createdBy: req.user.userId,
        ...req.body,
      })

      res.status(201).json({ data: drawing })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/maps/:mapId/drawings (clear all)
router.delete(
  '/:mapId/drawings',
  validateParams(mapIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const count = await drawingsService.clearDrawingsByMap(req.params.mapId, req.user.coupleId)
      res.json({ data: { message: `Cleared ${count} drawings` } })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/drawings/:drawingId
router.delete(
  '/drawings/:drawingId',
  validateParams(drawingIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const deleted = await drawingsService.deleteDrawing(req.params.drawingId, req.user.coupleId)
      if (!deleted) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Drawing not found' }
        })
        return
      }

      res.json({ data: { message: 'Drawing deleted' } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
