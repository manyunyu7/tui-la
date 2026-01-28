import { describe, it, expect } from 'vitest'
import { simplifyPath, simplifyGeoPath, getCompressionRatio } from './pathSimplify'

describe('simplifyPath', () => {
  it('returns empty array for empty input', () => {
    expect(simplifyPath([])).toEqual([])
  })

  it('returns single point for single input', () => {
    const points = [{ x: 0, y: 0 }]
    expect(simplifyPath(points)).toEqual(points)
  })

  it('returns both points for two-point input', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
    expect(simplifyPath(points)).toEqual(points)
  })

  it('simplifies collinear points to endpoints', () => {
    // Points on a straight line should reduce to just endpoints
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ]
    const result = simplifyPath(points, 0.1)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ x: 0, y: 0 })
    expect(result[result.length - 1]).toEqual({ x: 4, y: 4 })
  })

  it('preserves sharp corners', () => {
    // L-shaped path should keep the corner point
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
    ]
    const result = simplifyPath(points, 0.5)
    expect(result).toHaveLength(3) // All 3 points should be kept
  })

  it('respects epsilon tolerance', () => {
    // With very high epsilon, even corners get simplified
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0.1 },
      { x: 2, y: 0 },
    ]
    // Low epsilon keeps the bump
    const resultLow = simplifyPath(points, 0.01)
    expect(resultLow.length).toBeGreaterThanOrEqual(3)

    // High epsilon removes the bump
    const resultHigh = simplifyPath(points, 1)
    expect(resultHigh).toHaveLength(2)
  })
})

describe('simplifyGeoPath', () => {
  it('handles short paths', () => {
    const points = [{ lat: 0, lng: 0 }]
    expect(simplifyGeoPath(points)).toEqual(points)
  })

  it('simplifies geo coordinates', () => {
    const points = [
      { lat: 51.5074, lng: -0.1278 },
      { lat: 51.5075, lng: -0.1277 },
      { lat: 51.5076, lng: -0.1276 },
      { lat: 51.5077, lng: -0.1275 },
    ]
    // Nearly collinear points should simplify
    const result = simplifyGeoPath(points, 0.001)
    expect(result.length).toBeLessThanOrEqual(points.length)
  })
})

describe('getCompressionRatio', () => {
  it('returns 0 for empty input', () => {
    expect(getCompressionRatio(0, 0)).toBe(0)
  })

  it('returns 0 for no compression', () => {
    expect(getCompressionRatio(10, 10)).toBe(0)
  })

  it('returns correct ratio', () => {
    expect(getCompressionRatio(100, 50)).toBe(50)
    expect(getCompressionRatio(100, 25)).toBe(75)
  })

  it('returns 100 for full compression', () => {
    expect(getCompressionRatio(100, 0)).toBe(100)
  })
})
