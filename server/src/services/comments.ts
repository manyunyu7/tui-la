import { query } from '../config/database.js'
import { NotFoundError, ForbiddenError } from '../utils/errors.js'
import type { Comment } from '../types/index.js'

export interface CommentWithUser extends Comment {
  displayName: string
  avatarPath: string | null
}

export async function getComments(
  pinId: string,
  coupleId: string
): Promise<CommentWithUser[]> {
  // Verify pin access via map couple_id
  const pinCheck = await query(
    `SELECT p.id FROM pins p JOIN maps m ON m.id = p.map_id
     WHERE p.id = $1 AND m.couple_id = $2 AND p.deleted_at IS NULL`,
    [pinId, coupleId]
  )
  if (pinCheck.rows.length === 0) {
    throw new NotFoundError('Pin not found')
  }

  const result = await query<CommentWithUser>(
    `SELECT c.*, u.display_name, u.avatar_path
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.pin_id = $1 AND c.deleted_at IS NULL
     ORDER BY c.created_at ASC`,
    [pinId]
  )

  return result.rows.map(toComment)
}

export async function createComment(
  pinId: string,
  userId: string,
  content: string,
  coupleId: string
): Promise<CommentWithUser> {
  // Verify pin access
  const pinCheck = await query(
    `SELECT p.id FROM pins p JOIN maps m ON m.id = p.map_id
     WHERE p.id = $1 AND m.couple_id = $2 AND p.deleted_at IS NULL`,
    [pinId, coupleId]
  )
  if (pinCheck.rows.length === 0) {
    throw new NotFoundError('Pin not found')
  }

  const result = await query<CommentWithUser>(
    `WITH inserted AS (
      INSERT INTO comments (pin_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    )
    SELECT inserted.*, u.display_name, u.avatar_path
    FROM inserted
    JOIN users u ON u.id = inserted.user_id`,
    [pinId, userId, content]
  )

  return toComment(result.rows[0])
}

export async function deleteComment(
  commentId: string,
  userId: string,
  coupleId: string
): Promise<void> {
  const result = await query<Comment & { couple_id: string }>(
    `SELECT c.*, m.couple_id
     FROM comments c
     JOIN pins p ON p.id = c.pin_id
     JOIN maps m ON m.id = p.map_id
     WHERE c.id = $1 AND c.deleted_at IS NULL`,
    [commentId]
  )

  if (result.rows.length === 0) {
    throw new NotFoundError('Comment not found')
  }

  const comment = result.rows[0]

  if (comment.couple_id !== coupleId) {
    throw new ForbiddenError('Access denied')
  }

  if (comment.userId !== userId) {
    throw new ForbiddenError('Can only delete your own comments')
  }

  await query(
    'UPDATE comments SET deleted_at = NOW() WHERE id = $1',
    [commentId]
  )
}

function toComment(row: CommentWithUser): CommentWithUser {
  return {
    id: row.id,
    pinId: row.pinId,
    userId: row.userId,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    displayName: row.displayName,
    avatarPath: row.avatarPath,
  }
}
