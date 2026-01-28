import pino from 'pino'
import { env } from './env.js'

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV === 'development'
    ? {
        target: 'pino/file',
        options: { destination: 1 }, // stdout
      }
    : undefined,
  formatters: {
    level(label) {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'password', 'passwordHash', 'token', 'refreshToken'],
    censor: '[REDACTED]',
  },
})

export function createChildLogger(name: string): pino.Logger {
  return logger.child({ module: name })
}
