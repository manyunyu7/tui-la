import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { env } from './config/env.js'
import { connectRedis } from './config/redis.js'
import { pool } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import coupleRoutes from './routes/couple.js'
import mapRoutes from './routes/maps.js'
import pinRoutes from './routes/pins.js'
import uploadRoutes from './routes/upload.js'
import healthRoutes from './routes/health.js'
import drawingsRoutes from './routes/drawings.js'
import chatRoutes from './routes/chat.js'
import reactionsRoutes from './routes/reactions.js'
import commentsRoutes from './routes/comments.js'
import { setupSocketHandlers } from './socket/index.js'

const app = express()
const httpServer = createServer(app)
const io = new SocketServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check routes
app.use('/health', healthRoutes)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/couple', coupleRoutes)
app.use('/api/maps', mapRoutes)
app.use('/api/pins', pinRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/maps', drawingsRoutes)
app.use('/api/maps', chatRoutes)
app.use('/api/pins', reactionsRoutes)
app.use('/api/pins', commentsRoutes)

// Static files for uploads
app.use('/uploads', express.static(env.UPLOAD_DIR))

// Error handler
app.use(errorHandler)

// Socket.io
setupSocketHandlers(io)

// Start server
async function start(): Promise<void> {
  try {
    // Test database connection
    await pool.query('SELECT 1')
    console.log('Database connected')

    // Connect to Redis
    await connectRedis()

    httpServer.listen(env.PORT, () => {
      console.log(`${env.APP_NAME} server running on port ${env.PORT}`)
      console.log(`Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  httpServer.close()
  await pool.end()
  process.exit(0)
})

start()

export { app, io }
