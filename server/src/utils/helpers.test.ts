import { describe, it, expect } from 'vitest'
import {
  generateInviteCode,
  generateRandomString,
  hashToken,
  camelToSnake,
  snakeToCamel,
  toSnakeCase,
  toCamelCase,
} from './helpers.js'

describe('generateInviteCode', () => {
  it('generates a 6-character code', () => {
    const code = generateInviteCode()
    expect(code).toHaveLength(6)
  })

  it('only contains allowed characters', () => {
    const allowed = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode()
      for (const char of code) {
        expect(allowed).toContain(char)
      }
    }
  })

  it('generates unique codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) {
      codes.add(generateInviteCode())
    }
    // With 6 chars from 32-char alphabet, collisions are very unlikely in 100 attempts
    expect(codes.size).toBeGreaterThan(95)
  })
})

describe('generateRandomString', () => {
  it('generates a string of default length', () => {
    const str = generateRandomString()
    // 32 bytes = 64 hex chars
    expect(str).toHaveLength(64)
  })

  it('generates a string of specified length', () => {
    const str = generateRandomString(16)
    // 16 bytes = 32 hex chars
    expect(str).toHaveLength(32)
  })

  it('generates hex characters only', () => {
    const str = generateRandomString()
    expect(str).toMatch(/^[0-9a-f]+$/)
  })
})

describe('hashToken', () => {
  it('produces consistent hash for same input', () => {
    const hash1 = hashToken('test-token')
    const hash2 = hashToken('test-token')
    expect(hash1).toBe(hash2)
  })

  it('produces different hash for different input', () => {
    const hash1 = hashToken('token-a')
    const hash2 = hashToken('token-b')
    expect(hash1).not.toBe(hash2)
  })

  it('produces a 64-character hex string', () => {
    const hash = hashToken('test')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })
})

describe('camelToSnake', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnake('createdAt')).toBe('created_at')
    expect(camelToSnake('pinType')).toBe('pin_type')
    expect(camelToSnake('isPrivate')).toBe('is_private')
  })

  it('handles already lowercase strings', () => {
    expect(camelToSnake('name')).toBe('name')
  })

  it('handles multiple uppercase letters', () => {
    expect(camelToSnake('mapCenterLat')).toBe('map_center_lat')
  })
})

describe('snakeToCamel', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('created_at')).toBe('createdAt')
    expect(snakeToCamel('pin_type')).toBe('pinType')
    expect(snakeToCamel('is_private')).toBe('isPrivate')
  })

  it('handles already camelCase strings', () => {
    expect(snakeToCamel('name')).toBe('name')
  })
})

describe('toSnakeCase', () => {
  it('transforms all keys in an object', () => {
    const result = toSnakeCase({
      createdAt: '2024-01-01',
      pinType: 'memory',
      isPrivate: false,
    })
    expect(result).toEqual({
      created_at: '2024-01-01',
      pin_type: 'memory',
      is_private: false,
    })
  })

  it('handles nested objects', () => {
    const result = toSnakeCase({
      mapData: {
        centerLat: 0,
        centerLng: 0,
      },
    })
    expect(result).toEqual({
      map_data: {
        center_lat: 0,
        center_lng: 0,
      },
    })
  })
})

describe('toCamelCase', () => {
  it('transforms all keys in an object', () => {
    const result = toCamelCase({
      created_at: '2024-01-01',
      pin_type: 'memory',
      is_private: false,
    })
    expect(result).toEqual({
      createdAt: '2024-01-01',
      pinType: 'memory',
      isPrivate: false,
    })
  })
})
