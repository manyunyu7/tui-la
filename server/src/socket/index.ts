import type { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { JWTPayload } from '../types/index.js'

interface AuthenticatedSocket extends Socket {
  user?: JWTPayload
}

export function setupSocketHandlers(io: Server): void {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload
      socket.user = payload
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user!
    console.log(`User connected: ${user.userId}`)

    // Join couple room
    if (user.coupleId) {
      socket.join(`couple:${user.coupleId}`)
    }

    // Handle joining a map
    socket.on('join_map', (mapId: string) => {
      if (!user.coupleId) return

      const room = `map:${mapId}`
      socket.join(room)

      // Notify partner
      socket.to(room).emit('partner_joined', {
        userId: user.userId,
        email: user.email,
      })

      console.log(`User ${user.userId} joined map ${mapId}`)
    })

    // Handle leaving a map
    socket.on('leave_map', (mapId: string) => {
      const room = `map:${mapId}`
      socket.leave(room)

      // Notify partner
      socket.to(room).emit('partner_left', {
        userId: user.userId,
      })

      console.log(`User ${user.userId} left map ${mapId}`)
    })

    // Handle cursor movement
    socket.on('cursor_move', (data: { mapId: string; lat: number; lng: number }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('partner_cursor', {
        userId: user.userId,
        lat: data.lat,
        lng: data.lng,
      })
    })

    // Handle pin creation
    socket.on('pin_create', (data: { mapId: string; pin: unknown }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('pin_created', {
        userId: user.userId,
        pin: data.pin,
      })
    })

    // Handle pin update
    socket.on('pin_update', (data: { mapId: string; pin: unknown }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('pin_updated', {
        userId: user.userId,
        pin: data.pin,
      })
    })

    // Handle pin deletion
    socket.on('pin_delete', (data: { mapId: string; pinId: string }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('pin_deleted', {
        userId: user.userId,
        pinId: data.pinId,
      })
    })

    // Handle pin movement
    socket.on('pin_move', (data: { mapId: string; pinId: string; lat: number; lng: number }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('pin_moved', {
        userId: user.userId,
        pinId: data.pinId,
        lat: data.lat,
        lng: data.lng,
      })
    })

    // Handle drawing stroke start
    socket.on('stroke_start', (data: { mapId: string; strokeId: string; color: string; width: number }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('stroke_started', {
        userId: user.userId,
        strokeId: data.strokeId,
        color: data.color,
        width: data.width,
      })
    })

    // Handle drawing stroke update
    socket.on('stroke_update', (data: { mapId: string; strokeId: string; points: Array<{ x: number; y: number }> }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('stroke_updated', {
        userId: user.userId,
        strokeId: data.strokeId,
        points: data.points,
      })
    })

    // Handle drawing stroke end
    socket.on('stroke_end', (data: { mapId: string; strokeId: string }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('stroke_ended', {
        userId: user.userId,
        strokeId: data.strokeId,
      })
    })

    // Handle chat message
    socket.on('chat_message', (data: { mapId: string; message: string }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('chat_received', {
        userId: user.userId,
        message: data.message,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle typing indicator
    socket.on('chat_typing', (data: { mapId: string; isTyping: boolean }) => {
      const room = `map:${data.mapId}`
      socket.to(room).emit('partner_typing', {
        userId: user.userId,
        isTyping: data.isTyping,
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.userId}`)

      // Notify all rooms the user was in
      if (user.coupleId) {
        io.to(`couple:${user.coupleId}`).emit('partner_offline', {
          userId: user.userId,
        })
      }
    })
  })
}
