import { pool } from '../config/database.js'

export interface DrawingData {
  mapId: string
  createdBy: string
  pathData: Array<{ lat: number; lng: number }>
  strokeColor?: string
  strokeWidth?: number
  opacity?: number
}

export interface Drawing {
  id: string
  mapId: string
  createdBy: string
  pathData: Array<{ lat: number; lng: number }>
  strokeColor: string
  strokeWidth: number
  opacity: number
  layerOrder: number
  createdAt: Date
  updatedAt: Date
}

export async function createDrawing(data: DrawingData): Promise<Drawing> {
  const result = await pool.query(
    `INSERT INTO drawings (map_id, created_by, path_data, stroke_color, stroke_width, opacity)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, map_id as "mapId", created_by as "createdBy", path_data as "pathData",
               stroke_color as "strokeColor", stroke_width as "strokeWidth", opacity,
               layer_order as "layerOrder", created_at as "createdAt", updated_at as "updatedAt"`,
    [
      data.mapId,
      data.createdBy,
      JSON.stringify(data.pathData),
      data.strokeColor || '#E11D48',
      data.strokeWidth || 3,
      data.opacity || 1.0,
    ]
  )
  return result.rows[0]
}

export async function getDrawingsByMap(mapId: string, coupleId: string): Promise<Drawing[]> {
  // Verify map belongs to couple before returning drawings
  const mapCheck = await pool.query(
    'SELECT id FROM maps WHERE id = $1 AND couple_id = $2 AND deleted_at IS NULL',
    [mapId, coupleId]
  )

  if (mapCheck.rows.length === 0) {
    throw new Error('Map not found')
  }

  const result = await pool.query(
    `SELECT id, map_id as "mapId", created_by as "createdBy", path_data as "pathData",
            stroke_color as "strokeColor", stroke_width as "strokeWidth", opacity,
            layer_order as "layerOrder", created_at as "createdAt", updated_at as "updatedAt"
     FROM drawings
     WHERE map_id = $1 AND deleted_at IS NULL
     ORDER BY layer_order ASC, created_at ASC`,
    [mapId]
  )
  return result.rows
}

export async function deleteDrawing(drawingId: string, coupleId: string): Promise<boolean> {
  // Soft delete with couple ownership check
  const result = await pool.query(
    `UPDATE drawings SET deleted_at = NOW()
     WHERE id = $1 AND map_id IN (SELECT id FROM maps WHERE couple_id = $2)
     RETURNING id`,
    [drawingId, coupleId]
  )
  return result.rows.length > 0
}

export async function clearDrawingsByMap(mapId: string, coupleId: string): Promise<number> {
  // Verify map belongs to couple before clearing
  const mapCheck = await pool.query(
    'SELECT id FROM maps WHERE id = $1 AND couple_id = $2 AND deleted_at IS NULL',
    [mapId, coupleId]
  )

  if (mapCheck.rows.length === 0) {
    throw new Error('Map not found')
  }

  const result = await pool.query(
    `UPDATE drawings SET deleted_at = NOW()
     WHERE map_id = $1 AND deleted_at IS NULL`,
    [mapId]
  )
  return result.rowCount || 0
}
