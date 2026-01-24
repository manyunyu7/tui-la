import crypto from 'crypto'

export function generateInviteCode(): string {
  // Generate a 6-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(crypto.randomInt(chars.length))
  }
  return code
}

export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function transformKeys<T extends Record<string, unknown>>(
  obj: T,
  transformer: (key: string) => string
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const newKey = transformer(key)
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[newKey] = transformKeys(value as Record<string, unknown>, transformer)
    } else {
      result[newKey] = value
    }
  }
  return result
}

export function toSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return transformKeys(obj, camelToSnake)
}

export function toCamelCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return transformKeys(obj, snakeToCamel)
}
