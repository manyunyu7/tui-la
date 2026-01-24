import { Router } from 'express'
import { pool } from '../config/database.js'
import { redis } from '../config/redis.js'

const router = Router()

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: { status: 'up' | 'down'; latency?: number; error?: string }
    redis: { status: 'up' | 'down'; latency?: number; error?: string }
  }
}

// GET /health - Basic health check (for load balancers)
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// GET /health/ready - Readiness check (for k8s)
router.get('/ready', async (_req, res) => {
  const checks: HealthStatus['checks'] = {
    database: { status: 'down' },
    redis: { status: 'down' },
  }

  // Check database
  try {
    const dbStart = Date.now()
    await pool.query('SELECT 1')
    checks.database = {
      status: 'up',
      latency: Date.now() - dbStart,
    }
  } catch (error) {
    checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Check Redis
  try {
    const redisStart = Date.now()
    await redis.ping()
    checks.redis = {
      status: 'up',
      latency: Date.now() - redisStart,
    }
  } catch (error) {
    checks.redis = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  const allUp = checks.database.status === 'up' && checks.redis.status === 'up'
  const allDown = checks.database.status === 'down' && checks.redis.status === 'down'

  const status: HealthStatus = {
    status: allUp ? 'healthy' : allDown ? 'unhealthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks,
  }

  res.status(allUp ? 200 : 503).json(status)
})

// GET /health/live - Liveness check (for k8s)
router.get('/live', (_req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

export default router
