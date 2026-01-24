/**
 * Ramer-Douglas-Peucker algorithm for path simplification
 * Reduces the number of points in a path while maintaining its shape
 */

interface Point {
  x: number
  y: number
}

/**
 * Calculate the perpendicular distance from a point to a line segment
 */
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y

  // If line segment is a point, return distance to that point
  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) +
      Math.pow(point.y - lineStart.y, 2)
    )
  }

  const t = Math.max(0, Math.min(1,
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
    (dx * dx + dy * dy)
  ))

  const projX = lineStart.x + t * dx
  const projY = lineStart.y + t * dy

  return Math.sqrt(
    Math.pow(point.x - projX, 2) +
    Math.pow(point.y - projY, 2)
  )
}

/**
 * Simplify a path using the Ramer-Douglas-Peucker algorithm
 * @param points - Array of points to simplify
 * @param epsilon - Maximum distance tolerance (higher = more simplification)
 * @returns Simplified array of points
 */
export function simplifyPath<T extends Point>(points: T[], epsilon: number = 1): T[] {
  if (points.length < 3) {
    return points
  }

  // Find the point with maximum distance from the line between first and last
  let maxDistance = 0
  let maxIndex = 0

  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], first, last)
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDistance > epsilon) {
    const leftPart = simplifyPath(points.slice(0, maxIndex + 1), epsilon)
    const rightPart = simplifyPath(points.slice(maxIndex), epsilon)

    // Combine results, removing duplicate point at junction
    return [...leftPart.slice(0, -1), ...rightPart]
  }

  // Otherwise, return just the endpoints
  return [first, last]
}

/**
 * Simplify a path for geo coordinates
 * Uses a smaller epsilon since geo coordinates are typically small numbers
 */
export function simplifyGeoPath<T extends { lat: number; lng: number }>(
  points: T[],
  epsilon: number = 0.00001
): T[] {
  if (points.length < 3) {
    return points
  }

  // Convert to x/y format for the algorithm
  const xyPoints = points.map((p, i) => ({ x: p.lat, y: p.lng, original: points[i] }))

  // Run simplification
  const simplified = simplifyPath(xyPoints, epsilon)

  // Return original points
  return simplified.map(p => p.original)
}

/**
 * Calculate compression ratio after simplification
 */
export function getCompressionRatio(originalLength: number, simplifiedLength: number): number {
  if (originalLength === 0) return 0
  return Math.round((1 - simplifiedLength / originalLength) * 100)
}
