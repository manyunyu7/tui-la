import { Router } from 'express'
import { z } from 'zod'
import { validateBody, validateParams } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as mapsService from '../services/maps.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

router.use(authenticate)

// Validation schemas
const createMapSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['shared', 'solo_trip', 'memory_collection']).default('shared'),
  centerLat: z.number().min(-90).max(90).optional(),
  centerLng: z.number().min(-180).max(180).optional(),
  zoomLevel: z.number().min(1).max(20).optional(),
})

const updateMapSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  coverPath: z.string().optional(),
  centerLat: z.number().min(-90).max(90).optional(),
  centerLng: z.number().min(-180).max(180).optional(),
  zoomLevel: z.number().min(1).max(20).optional(),
  isArchived: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
})

const mapIdParams = z.object({
  mapId: z.string().uuid(),
})

// GET /api/maps
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.coupleId) {
      res.status(400).json({
        error: { code: 'NO_COUPLE', message: 'User has no couple' }
      })
      return
    }

    const maps = await mapsService.getMapsByCouple(req.user.coupleId)
    res.json({ data: maps })
  } catch (error) {
    next(error)
  }
})

// GET /api/maps/:mapId
router.get(
  '/:mapId',
  validateParams(mapIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const map = await mapsService.getMapById(req.params.mapId, req.user.coupleId)
      res.json({ data: map })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/maps
router.post(
  '/',
  validateBody(createMapSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const map = await mapsService.createMap({
        coupleId: req.user.coupleId,
        ownerId: req.body.type === 'solo_trip' ? req.user.userId : undefined,
        ...req.body,
      })

      res.status(201).json({ data: map })
    } catch (error) {
      next(error)
    }
  }
)

// PUT /api/maps/:mapId
router.put(
  '/:mapId',
  validateParams(mapIdParams),
  validateBody(updateMapSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      const map = await mapsService.updateMap(req.params.mapId, req.user.coupleId, req.body)
      res.json({ data: map })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/maps/:mapId
router.delete(
  '/:mapId',
  validateParams(mapIdParams),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user?.coupleId) {
        res.status(400).json({
          error: { code: 'NO_COUPLE', message: 'User has no couple' }
        })
        return
      }

      await mapsService.deleteMap(req.params.mapId, req.user.coupleId)
      res.json({ data: { message: 'Map deleted successfully' } })
    } catch (error) {
      next(error)
    }
  }
)

export default router
