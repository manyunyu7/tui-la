import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as pinsService from '../services/pins.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

router.use(authenticate)

// Photo schema for bulk operations
const photoSchema = z.object({
  filePath: z.string().min(1),
  thumbnailPath: z.string().min(1),
  originalName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  width: z.number(),
  height: z.number(),
})

// Validation schemas
const createPinSchema = z.object({
  mapId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  pinType: z.enum(['memory', 'wishlist', 'milestone', 'trip']).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  memoryDate: z.string().optional(),
  isPrivate: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  photos: z.array(photoSchema).optional(),
})

const updatePinSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  pinType: z.enum(['memory', 'wishlist', 'milestone', 'trip']).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  memoryDate: z.string().optional(),
  isPrivate: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  photos: z.array(photoSchema).optional(),
})

const boundsQuery = z.object({
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),
})

const mapIdParams = z.object({
  mapId: z.string().uuid(),
})

const pinIdParams = z.object({
  pinId: z.string().uuid(),
})

const pinMediaParams = z.object({
  pinId: z.string().uuid(),
  mediaId: z.string().uuid(),
})

const addMediaSchema = z.object({
  type: z.enum(['image', 'audio', 'video']).default('image'),
  filePath: z.string().min(1),
  thumbnailPath: z.string().optional(),
  originalName: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
})

// GET /api/pins/map/:mapId
router.get(
  '/map/:mapId',
  validateParams(mapIdParams),
  validateQuery(boundsQuery),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const { minLat, maxLat, minLng, maxLng } = req.query as z.infer<typeof boundsQuery>
      const bounds = minLat !== undefined && maxLat !== undefined &&
                     minLng !== undefined && maxLng !== undefined
        ? { minLat, maxLat, minLng, maxLng }
        : undefined

      const pins = await pinsService.getPinsByMap(req.params.mapId, req.user.coupleId, bounds)
      res.json({ data: pins })
    } catch (error) {
      next(error)
    }
  }
)

// GET /api/pins/:pinId
router.get(
  '/:pinId',
  validateParams(pinIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const pin = await pinsService.getPinById(req.params.pinId, req.user.coupleId)
      res.json({ data: pin })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/pins
router.post(
  '/',
  validateBody(createPinSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const pin = await pinsService.createPin(
        {
          ...req.body,
          createdBy: req.user.userId,
        },
        req.user.coupleId
      )

      res.status(201).json({ data: pin })
    } catch (error) {
      next(error)
    }
  }
)

// PUT /api/pins/:pinId
router.put(
  '/:pinId',
  validateParams(pinIdParams),
  validateBody(updatePinSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const pin = await pinsService.updatePin(req.params.pinId, req.user.coupleId, req.body, req.user.userId)
      res.json({ data: pin })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/pins/:pinId
router.delete(
  '/:pinId',
  validateParams(pinIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      await pinsService.deletePin(req.params.pinId, req.user.coupleId, req.user.userId)
      res.json({ data: { message: 'Pin deleted successfully' } })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/pins/:pinId/media
router.post(
  '/:pinId/media',
  validateParams(pinIdParams),
  validateBody(addMediaSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const media = await pinsService.addMediaToPin(
        req.params.pinId,
        req.user.coupleId,
        req.body
      )
      res.status(201).json({ data: media })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/pins/:pinId/media/:mediaId
router.delete(
  '/:pinId/media/:mediaId',
  validateParams(pinMediaParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      await pinsService.removeMediaFromPin(
        req.params.mediaId,
        req.params.pinId,
        req.user.coupleId
      )
      res.json({ data: { message: 'Media removed successfully' } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
