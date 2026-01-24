import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { Pin } from '@/types'

interface Point {
  x: number
  y: number
}

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
  onStrokeStarted?: (data: { userId: string; strokeId: string; color: string; width: number }) => void
  onStrokeUpdated?: (data: { userId: string; strokeId: string; points: Point[] }) => void
  onStrokeEnded?: (data: { userId: string; strokeId: string }) => void
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
  onStrokeStarted,
  onStrokeUpdated,
  onStrokeEnded,
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
    socket.on('stroke_started', onStrokeStarted || (() => {}))
    socket.on('stroke_updated', onStrokeUpdated || (() => {}))
    socket.on('stroke_ended', onStrokeEnded || (() => {}))

    return () => {
      socket.emit('leave_map', mapId)
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, mapId, onPinCreated, onPinUpdated, onPinDeleted, onPinMoved, onPartnerCursor, onPartnerJoined, onPartnerLeft, onStrokeStarted, onStrokeUpdated, onStrokeEnded])

  // Debounced cursor move - throttle to max 10 updates per second
  const lastCursorEmitRef = useRef<number>(0)
  const pendingCursorRef = useRef<{ lat: number; lng: number } | null>(null)
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const emitCursorMove = useCallback((lat: number, lng: number) => {
    const now = Date.now()
    const timeSinceLastEmit = now - lastCursorEmitRef.current
    const THROTTLE_MS = 100 // Max 10 updates per second

    if (timeSinceLastEmit >= THROTTLE_MS) {
      // Enough time has passed, emit immediately
      socketRef.current?.emit('cursor_move', { mapId, lat, lng })
      lastCursorEmitRef.current = now
      pendingCursorRef.current = null
    } else {
      // Store pending cursor and schedule emit
      pendingCursorRef.current = { lat, lng }

      if (!cursorTimeoutRef.current) {
        cursorTimeoutRef.current = setTimeout(() => {
          if (pendingCursorRef.current) {
            socketRef.current?.emit('cursor_move', {
              mapId,
              lat: pendingCursorRef.current.lat,
              lng: pendingCursorRef.current.lng
            })
            lastCursorEmitRef.current = Date.now()
            pendingCursorRef.current = null
          }
          cursorTimeoutRef.current = null
        }, THROTTLE_MS - timeSinceLastEmit)
      }
    }
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

  const emitStrokeStart = useCallback((strokeId: string, color: string, width: number) => {
    socketRef.current?.emit('stroke_start', { mapId, strokeId, color, width })
  }, [mapId])

  const emitStrokeUpdate = useCallback((strokeId: string, points: Point[]) => {
    socketRef.current?.emit('stroke_update', { mapId, strokeId, points })
  }, [mapId])

  const emitStrokeEnd = useCallback((strokeId: string) => {
    socketRef.current?.emit('stroke_end', { mapId, strokeId })
  }, [mapId])

  return {
    isConnected,
    emitCursorMove,
    emitPinCreate,
    emitPinUpdate,
    emitPinDelete,
    emitPinMove,
    emitStrokeStart,
    emitStrokeUpdate,
    emitStrokeEnd,
  }
}
