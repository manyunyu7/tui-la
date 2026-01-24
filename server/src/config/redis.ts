import { createClient } from 'redis'
import { env } from './env.js'

const redisUrl = env.REDIS_URL || `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`

export const redis = createClient({
  url: redisUrl,
})

redis.on('error', (err) => {
  console.error('Redis Client Error', err)
})

redis.on('connect', () => {
  console.log('Redis connected')
})

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect()
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis.isOpen) {
    await redis.disconnect()
  }
}
