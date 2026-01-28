import { query } from '../config/database.js'
import { NotFoundError, ConflictError } from '../utils/errors.js'
import type { Reaction } from '../types/index.js'

export interface ReactionWithUser extends Reaction {
  displayName: string
}

export async function getReactionsForPin(
  pinId: string,
  coupleId: string
): Promise<ReactionWithUser[]> {
  // Verify pin access via map couple_id
  const pinCheck = await query(
    `SELECT p.id FROM pins p JOIN maps m ON m.id = p.map_id
     WHERE p.id = $1 AND m.couple_id = $2 AND p.deleted_at IS NULL`,
    [pinId, coupleId]
  )
  if (pinCheck.rows.length === 0) {
    throw new NotFoundError('Pin not found')
  }

  const result = await query<ReactionWithUser>(
    `SELECT r.*, u.display_name
     FROM reactions r
     JOIN users u ON u.id = r.user_id
     WHERE r.pin_id = $1
     ORDER BY r.created_at ASC`,
    [pinId]
  )

  return result.rows.map(toReaction)
}

export async function addReaction(
  pinId: string,
  userId: string,
  type: string,
  coupleId: string
): Promise<ReactionWithUser> {
  // Verify pin access
  const pinCheck = await query(
    `SELECT p.id FROM pins p JOIN maps m ON m.id = p.map_id
     WHERE p.id = $1 AND m.couple_id = $2 AND p.deleted_at IS NULL`,
    [pinId, coupleId]
  )
  if (pinCheck.rows.length === 0) {
    throw new NotFoundError('Pin not found')
  }

  // Check for duplicate
  const existing = await query(
    'SELECT id FROM reactions WHERE pin_id = $1 AND user_id = $2 AND type = $3',
    [pinId, userId, type]
  )
  if (existing.rows.length > 0) {
    throw new ConflictError('Reaction already exists')
  }

  const result = await query<ReactionWithUser>(
    `WITH inserted AS (
      INSERT INTO reactions (pin_id, user_id, type)
      VALUES ($1, $2, $3)
      RETURNING *
    )
    SELECT inserted.*, u.display_name
    FROM inserted
    JOIN users u ON u.id = inserted.user_id`,
    [pinId, userId, type]
  )

  return toReaction(result.rows[0])
}

export async function removeReaction(
  pinId: string,
  userId: string,
  type: string,
  coupleId: string
): Promise<void> {
  // Verify pin access
  const pinCheck = await query(
    `SELECT p.id FROM pins p JOIN maps m ON m.id = p.map_id
     WHERE p.id = $1 AND m.couple_id = $2 AND p.deleted_at IS NULL`,
    [pinId, coupleId]
  )
  if (pinCheck.rows.length === 0) {
    throw new NotFoundError('Pin not found')
  }

  const result = await query(
    'DELETE FROM reactions WHERE pin_id = $1 AND user_id = $2 AND type = $3',
    [pinId, userId, type]
  )

  if (result.rowCount === 0) {
    throw new NotFoundError('Reaction not found')
  }
}

function toReaction(row: ReactionWithUser): ReactionWithUser {
  return {
    id: row.id,
    pinId: row.pinId,
    drawingId: row.drawingId,
    userId: row.userId,
    type: row.type,
    createdAt: row.createdAt,
    displayName: row.displayName,
  }
}
