import { query } from '../config/database.js'
import { NotFoundError, ForbiddenError } from '../utils/errors.js'
import * as mapsService from './maps.js'
import type { Pin, PinMedia } from '../types/index.js'

export interface CreatePinInput {
  mapId: string
  createdBy: string
  title: string
  description?: string
  lat: number
  lng: number
  pinType?: 'memory' | 'wishlist' | 'milestone' | 'trip'
  icon?: string
  color?: string
  memoryDate?: string
  isPrivate?: boolean
  metadata?: Record<string, unknown>
}

export interface UpdatePinInput {
  title?: string
  description?: string
  lat?: number
  lng?: number
  pinType?: 'memory' | 'wishlist' | 'milestone' | 'trip'
  icon?: string
  color?: string
  memoryDate?: string
  isPrivate?: boolean
  metadata?: Record<string, unknown>
}

export interface PinWithMedia extends Omit<Pin, 'deletedAt'> {
  media: PinMedia[]
}

export async function getPinsByMap(
  mapId: string,
  coupleId: string,
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): Promise<PinWithMedia[]> {
  // Verify map access
  await mapsService.getMapById(mapId, coupleId)

  let sql = `
    SELECT p.*
    FROM pins p
    WHERE p.map_id = $1 AND p.deleted_at IS NULL
  `
  const params: unknown[] = [mapId]

  if (bounds) {
    sql += ` AND p.lat BETWEEN $2 AND $3 AND p.lng BETWEEN $4 AND $5`
    params.push(bounds.minLat, bounds.maxLat, bounds.minLng, bounds.maxLng)
  }

  sql += ` ORDER BY p.created_at DESC`

  const result = await query<Pin>(sql, params)

  // Get media for all pins
  const pinIds = result.rows.map(p => p.id)
  const mediaResult = pinIds.length > 0
    ? await query<PinMedia>(
        `SELECT * FROM pin_media WHERE pin_id = ANY($1) ORDER BY sort_order ASC`,
        [pinIds]
      )
    : { rows: [] }

  // Group media by pin
  const mediaByPin = new Map<string, PinMedia[]>()
  for (const media of mediaResult.rows) {
    const existing = mediaByPin.get(media.pinId) || []
    existing.push(toMedia(media))
    mediaByPin.set(media.pinId, existing)
  }

  return result.rows.map(pin => ({
    ...toPin(pin),
    media: mediaByPin.get(pin.id) || [],
  }))
}

export async function getPinById(
  pinId: string,
  coupleId: string
): Promise<PinWithMedia> {
  const result = await query<Pin & { couple_id: string }>(
    `SELECT p.*, m.couple_id
     FROM pins p
     JOIN maps m ON m.id = p.map_id
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [pinId]
  )

  if (result.rows.length === 0) {
    throw new NotFoundError('Pin not found')
  }

  const pin = result.rows[0]

  if (pin.couple_id !== coupleId) {
    throw new ForbiddenError('Access denied')
  }

  // Get media
  const mediaResult = await query<PinMedia>(
    'SELECT * FROM pin_media WHERE pin_id = $1 ORDER BY sort_order ASC',
    [pinId]
  )

  return {
    ...toPin(pin),
    media: mediaResult.rows.map(toMedia),
  }
}

export async function createPin(
  input: CreatePinInput,
  coupleId: string
): Promise<PinWithMedia> {
  // Verify map access
  await mapsService.getMapById(input.mapId, coupleId)

  const {
    mapId,
    createdBy,
    title,
    description,
    lat,
    lng,
    pinType = 'memory',
    icon = '📍',
    color = '#E11D48',
    memoryDate,
    isPrivate = false,
    metadata = {},
  } = input

  const result = await query<Pin>(
    `INSERT INTO pins (
      map_id, created_by, title, description, lat, lng,
      location, pin_type, icon, color, memory_date, is_private, metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography,
      $7, $8, $9, $10, $11, $12
    ) RETURNING *`,
    [mapId, createdBy, title, description, lat, lng, pinType, icon, color, memoryDate, isPrivate, metadata]
  )

  return {
    ...toPin(result.rows[0]),
    media: [],
  }
}

export async function updatePin(
  pinId: string,
  coupleId: string,
  input: UpdatePinInput
): Promise<PinWithMedia> {
  // Verify access
  await getPinById(pinId, coupleId)

  const updates: string[] = []
  const values: unknown[] = []
  let paramCount = 0

  if (input.title !== undefined) {
    updates.push(`title = $${++paramCount}`)
    values.push(input.title)
  }
  if (input.description !== undefined) {
    updates.push(`description = $${++paramCount}`)
    values.push(input.description)
  }
  if (input.lat !== undefined && input.lng !== undefined) {
    updates.push(`lat = $${++paramCount}`)
    values.push(input.lat)
    updates.push(`lng = $${++paramCount}`)
    values.push(input.lng)
    updates.push(`location = ST_SetSRID(ST_MakePoint($${paramCount}, $${paramCount - 1}), 4326)::geography`)
  }
  if (input.pinType !== undefined) {
    updates.push(`pin_type = $${++paramCount}`)
    values.push(input.pinType)
  }
  if (input.icon !== undefined) {
    updates.push(`icon = $${++paramCount}`)
    values.push(input.icon)
  }
  if (input.color !== undefined) {
    updates.push(`color = $${++paramCount}`)
    values.push(input.color)
  }
  if (input.memoryDate !== undefined) {
    updates.push(`memory_date = $${++paramCount}`)
    values.push(input.memoryDate)
  }
  if (input.isPrivate !== undefined) {
    updates.push(`is_private = $${++paramCount}`)
    values.push(input.isPrivate)
  }
  if (input.metadata !== undefined) {
    updates.push(`metadata = $${++paramCount}`)
    values.push(input.metadata)
  }

  if (updates.length === 0) {
    return getPinById(pinId, coupleId)
  }

  updates.push(`updated_at = NOW()`)
  values.push(pinId)

  await query(
    `UPDATE pins SET ${updates.join(', ')} WHERE id = $${++paramCount}`,
    values
  )

  return getPinById(pinId, coupleId)
}

export async function deletePin(pinId: string, coupleId: string): Promise<void> {
  // Verify access
  await getPinById(pinId, coupleId)

  await query(
    'UPDATE pins SET deleted_at = NOW() WHERE id = $1',
    [pinId]
  )
}

export async function addMediaToPin(
  pinId: string,
  coupleId: string,
  media: {
    type: 'image' | 'audio' | 'video'
    filePath: string
    thumbnailPath?: string
    originalName?: string
    fileSize?: number
    mimeType?: string
    width?: number
    height?: number
    duration?: number
  }
): Promise<PinMedia> {
  // Verify access
  await getPinById(pinId, coupleId)

  // Get next sort order
  const orderResult = await query<{ max_order: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 as max_order FROM pin_media WHERE pin_id = $1',
    [pinId]
  )

  const result = await query<PinMedia>(
    `INSERT INTO pin_media (
      pin_id, type, file_path, thumbnail_path, original_name,
      file_size, mime_type, width, height, duration, sort_order
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      pinId,
      media.type,
      media.filePath,
      media.thumbnailPath,
      media.originalName,
      media.fileSize,
      media.mimeType,
      media.width,
      media.height,
      media.duration,
      orderResult.rows[0].max_order,
    ]
  )

  return toMedia(result.rows[0])
}

export async function removeMediaFromPin(
  mediaId: string,
  pinId: string,
  coupleId: string
): Promise<void> {
  // Verify access
  await getPinById(pinId, coupleId)

  await query(
    'DELETE FROM pin_media WHERE id = $1 AND pin_id = $2',
    [mediaId, pinId]
  )
}

function toPin(row: Pin): Omit<PinWithMedia, 'media'> {
  return {
    id: row.id,
    mapId: row.mapId,
    createdBy: row.createdBy,
    title: row.title,
    description: row.description,
    lat: Number(row.lat),
    lng: Number(row.lng),
    pinType: row.pinType,
    icon: row.icon,
    color: row.color,
    memoryDate: row.memoryDate,
    isPrivate: row.isPrivate,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toMedia(row: PinMedia): PinMedia {
  return {
    id: row.id,
    pinId: row.pinId,
    type: row.type,
    filePath: row.filePath,
    thumbnailPath: row.thumbnailPath,
    originalName: row.originalName,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    duration: row.duration,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }
}
