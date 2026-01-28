import { query } from '../config/database.js'
import { NotFoundError, ForbiddenError } from '../utils/errors.js'
import * as mapsService from './maps.js'

export interface ChatMessage {
  id: string
  mapId: string
  userId: string
  content: string
  messageType: string
  metadata: Record<string, unknown>
  createdAt: Date
  deletedAt: Date | null
}

export interface ChatMessageWithUser extends ChatMessage {
  displayName: string
  avatarPath: string | null
}

export interface CreateMessageInput {
  mapId: string
  userId: string
  content: string
  messageType?: string
  metadata?: Record<string, unknown>
}

export async function getMessages(
  mapId: string,
  coupleId: string,
  limit: number = 50,
  before?: string
): Promise<ChatMessageWithUser[]> {
  await mapsService.getMapById(mapId, coupleId)

  let sql = `
    SELECT cm.*, u.display_name, u.avatar_path
    FROM chat_messages cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.map_id = $1 AND cm.deleted_at IS NULL
  `
  const params: unknown[] = [mapId]

  if (before) {
    sql += ` AND cm.created_at < $2`
    params.push(before)
  }

  sql += ` ORDER BY cm.created_at DESC LIMIT $${params.length + 1}`
  params.push(limit)

  const result = await query<ChatMessageWithUser>(sql, params)

  return result.rows.map(toMessage).reverse()
}

export async function createMessage(
  input: CreateMessageInput,
  coupleId: string
): Promise<ChatMessageWithUser> {
  await mapsService.getMapById(input.mapId, coupleId)

  const result = await query<ChatMessageWithUser>(
    `WITH inserted AS (
      INSERT INTO chat_messages (map_id, user_id, content, message_type, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    )
    SELECT inserted.*, u.display_name, u.avatar_path
    FROM inserted
    JOIN users u ON u.id = inserted.user_id`,
    [
      input.mapId,
      input.userId,
      input.content,
      input.messageType || 'text',
      input.metadata || {},
    ]
  )

  return toMessage(result.rows[0])
}

export async function deleteMessage(
  messageId: string,
  userId: string,
  coupleId: string
): Promise<void> {
  const result = await query<ChatMessage & { couple_id: string }>(
    `SELECT cm.*, m.couple_id
     FROM chat_messages cm
     JOIN maps m ON m.id = cm.map_id
     WHERE cm.id = $1 AND cm.deleted_at IS NULL`,
    [messageId]
  )

  if (result.rows.length === 0) {
    throw new NotFoundError('Message not found')
  }

  const message = result.rows[0]

  if (message.couple_id !== coupleId) {
    throw new ForbiddenError('Access denied')
  }

  if (message.userId !== userId) {
    throw new ForbiddenError('Can only delete your own messages')
  }

  await query(
    'UPDATE chat_messages SET deleted_at = NOW() WHERE id = $1',
    [messageId]
  )
}

function toMessage(row: ChatMessageWithUser): ChatMessageWithUser {
  return {
    id: row.id,
    mapId: row.mapId,
    userId: row.userId,
    content: row.content,
    messageType: row.messageType,
    metadata: row.metadata,
    createdAt: row.createdAt,
    deletedAt: row.deletedAt,
    displayName: row.displayName,
    avatarPath: row.avatarPath,
  }
}
