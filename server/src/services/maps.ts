import { query } from '../config/database.js'
import { NotFoundError, ForbiddenError } from '../utils/errors.js'
import type { MapData } from '../types/index.js'

export interface CreateMapInput {
  coupleId: string
  ownerId?: string
  name: string
  description?: string
  type?: 'shared' | 'solo_trip' | 'memory_collection'
  centerLat?: number
  centerLng?: number
  zoomLevel?: number
}

export interface UpdateMapInput {
  name?: string
  description?: string
  coverPath?: string
  centerLat?: number
  centerLng?: number
  zoomLevel?: number
  isArchived?: boolean
  settings?: Record<string, unknown>
}

export interface MapWithPinCount extends Omit<MapData, 'deletedAt'> {
  pinCount: number
}

export async function getMapsByCouple(coupleId: string): Promise<MapWithPinCount[]> {
  const result = await query<MapData & { pin_count: string }>(
    `SELECT m.*, COUNT(p.id) as pin_count
     FROM maps m
     LEFT JOIN pins p ON p.map_id = m.id AND p.deleted_at IS NULL
     WHERE m.couple_id = $1 AND m.deleted_at IS NULL
     GROUP BY m.id
     ORDER BY m.created_at DESC`,
    [coupleId]
  )

  return result.rows.map(toMapWithPinCount)
}

export async function getMapById(mapId: string, coupleId: string): Promise<MapWithPinCount> {
  const result = await query<MapData & { pin_count: string }>(
    `SELECT m.*, COUNT(p.id) as pin_count
     FROM maps m
     LEFT JOIN pins p ON p.map_id = m.id AND p.deleted_at IS NULL
     WHERE m.id = $1 AND m.deleted_at IS NULL
     GROUP BY m.id`,
    [mapId]
  )

  if (result.rows.length === 0) {
    throw new NotFoundError('Map not found')
  }

  const map = result.rows[0]

  if (map.coupleId !== coupleId) {
    throw new ForbiddenError('Access denied')
  }

  return toMapWithPinCount(map)
}

export async function createMap(input: CreateMapInput): Promise<MapWithPinCount> {
  const {
    coupleId,
    ownerId,
    name,
    description,
    type = 'shared',
    centerLat = 0,
    centerLng = 0,
    zoomLevel = 10,
  } = input

  const result = await query<MapData>(
    `INSERT INTO maps (couple_id, owner_id, name, description, type, center_lat, center_lng, zoom_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [coupleId, ownerId, name, description, type, centerLat, centerLng, zoomLevel]
  )

  return {
    ...toMap(result.rows[0]),
    pinCount: 0,
  }
}

export async function updateMap(
  mapId: string,
  coupleId: string,
  input: UpdateMapInput
): Promise<MapWithPinCount> {
  // Verify access
  await getMapById(mapId, coupleId)

  const updates: string[] = []
  const values: unknown[] = []
  let paramCount = 0

  if (input.name !== undefined) {
    updates.push(`name = $${++paramCount}`)
    values.push(input.name)
  }
  if (input.description !== undefined) {
    updates.push(`description = $${++paramCount}`)
    values.push(input.description)
  }
  if (input.coverPath !== undefined) {
    updates.push(`cover_path = $${++paramCount}`)
    values.push(input.coverPath)
  }
  if (input.centerLat !== undefined) {
    updates.push(`center_lat = $${++paramCount}`)
    values.push(input.centerLat)
  }
  if (input.centerLng !== undefined) {
    updates.push(`center_lng = $${++paramCount}`)
    values.push(input.centerLng)
  }
  if (input.zoomLevel !== undefined) {
    updates.push(`zoom_level = $${++paramCount}`)
    values.push(input.zoomLevel)
  }
  if (input.isArchived !== undefined) {
    updates.push(`is_archived = $${++paramCount}`)
    values.push(input.isArchived)
  }
  if (input.settings !== undefined) {
    updates.push(`settings = $${++paramCount}`)
    values.push(input.settings)
  }

  if (updates.length === 0) {
    return getMapById(mapId, coupleId)
  }

  updates.push(`updated_at = NOW()`)
  values.push(mapId)

  await query(
    `UPDATE maps SET ${updates.join(', ')} WHERE id = $${++paramCount}`,
    values
  )

  return getMapById(mapId, coupleId)
}

export async function deleteMap(mapId: string, coupleId: string): Promise<void> {
  // Verify access
  await getMapById(mapId, coupleId)

  await query(
    'UPDATE maps SET deleted_at = NOW() WHERE id = $1',
    [mapId]
  )
}

function toMap(row: MapData): Omit<MapWithPinCount, 'pinCount'> {
  return {
    id: row.id,
    coupleId: row.coupleId,
    ownerId: row.ownerId,
    name: row.name,
    description: row.description,
    type: row.type,
    coverPath: row.coverPath,
    centerLat: Number(row.centerLat),
    centerLng: Number(row.centerLng),
    zoomLevel: row.zoomLevel,
    isArchived: row.isArchived,
    settings: row.settings,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toMapWithPinCount(row: MapData & { pin_count?: string }): MapWithPinCount {
  return {
    ...toMap(row),
    pinCount: parseInt(row.pin_count || '0', 10),
  }
}
