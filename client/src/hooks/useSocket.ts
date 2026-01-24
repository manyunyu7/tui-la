import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { Pin } from '@/types'

interface UseSocketOptions {
  mapId: string
  accessToken: string | null
  onPinCreated?: (data: { userId: string; pin: Pin }) => void
  onPinUpdated?: (data: { userId: string; pin: Pin }) => void
  onPinDeleted?: (data: { userId: string; pinId: string }) => void
  onPinMoved?: (data: { userId: string; pinId: string; lat: number; lng: number }) => void
  onPartnerCursor?: (data: { userId: string; lat: number; lng: number }) => void
  onPartnerJoined?: (data: { userId: string; email: string }) => void
  onPartnerLeft?: (data: { userId: string }) => void
}

export function useSocket({
  mapId,
  accessToken,
  onPinCreated,
  onPinUpdated,
  onPinDeleted,
  onPinMoved,
  onPartnerCursor,
  onPartnerJoined,
  onPartnerLeft,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!accessToken) return

    const socket = io({
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('join_map', mapId)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('pin_created', onPinCreated || (() => {}))
    socket.on('pin_updated', onPinUpdated || (() => {}))
    socket.on('pin_deleted', onPinDeleted || (() => {}))
    socket.on('pin_moved', onPinMoved || (() => {}))
    socket.on('partner_cursor', onPartnerCursor || (() => {}))
    socket.on('partner_joined', onPartnerJoined || (() => {}))
    socket.on('partner_left', onPartnerLeft || (() => {}))

    return () => {
      socket.emit('leave_map', mapId)
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, mapId, onPinCreated, onPinUpdated, onPinDeleted, onPinMoved, onPartnerCursor, onPartnerJoined, onPartnerLeft])

  const emitCursorMove = useCallback((lat: number, lng: number) => {
    socketRef.current?.emit('cursor_move', { mapId, lat, lng })
  }, [mapId])

  const emitPinCreate = useCallback((pin: Pin) => {
    socketRef.current?.emit('pin_create', { mapId, pin })
  }, [mapId])

  const emitPinUpdate = useCallback((pin: Pin) => {
    socketRef.current?.emit('pin_update', { mapId, pin })
  }, [mapId])

  const emitPinDelete = useCallback((pinId: string) => {
    socketRef.current?.emit('pin_delete', { mapId, pinId })
  }, [mapId])

  const emitPinMove = useCallback((pinId: string, lat: number, lng: number) => {
    socketRef.current?.emit('pin_move', { mapId, pinId, lat, lng })
  }, [mapId])

  return {
    isConnected,
    emitCursorMove,
    emitPinCreate,
    emitPinUpdate,
    emitPinDelete,
    emitPinMove,
  }
}
