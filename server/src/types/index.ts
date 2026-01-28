import type { Request } from 'express'

// User types
export interface User {
  id: string
  coupleId: string | null
  email: string
  passwordHash: string
  displayName: string
  avatarPath: string | null
  role: 'partner_1' | 'partner_2'
  emailVerifiedAt: Date | null
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface UserPublic {
  id: string
  email: string
  displayName: string
  avatarPath: string | null
  coupleId: string | null
  role: 'partner_1' | 'partner_2'
  createdAt: string
  updatedAt: string
}

// Couple types
export interface Couple {
  id: string
  inviteCode: string
  anniversaryDate: Date | null
  theme: Theme
  settings: Record<string, unknown>
  pairedAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface Theme {
  name: string
  primary: string
  secondary?: string
  accent?: string
  background?: string
}

// Map types
export interface MapData {
  id: string
  coupleId: string
  ownerId: string | null
  name: string
  description: string | null
  type: 'shared' | 'solo_trip' | 'memory_collection'
  coverPath: string | null
  centerLat: number
  centerLng: number
  zoomLevel: number
  isArchived: boolean
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

// Pin types
export interface Pin {
  id: string
  mapId: string
  createdBy: string
  title: string
  description: string | null
  lat: number
  lng: number
  pinType: 'memory' | 'wishlist' | 'milestone' | 'trip'
  icon: string
  color: string
  memoryDate: Date | null
  isPrivate: boolean
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

// Pin media types
export interface PinMedia {
  id: string
  pinId: string
  type: 'image' | 'audio' | 'video'
  filePath: string
  thumbnailPath: string | null
  originalName: string | null
  fileSize: number | null
  mimeType: string | null
  width: number | null
  height: number | null
  duration: number | null
  sortOrder: number
  createdAt: Date
}

// Drawing types
export interface Drawing {
  id: string
  mapId: string
  createdBy: string
  pathData: PathData
  bounds: DrawingBounds | null
  strokeColor: string
  strokeWidth: number
  opacity: number
  layerOrder: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface PathData {
  points: Array<{ x: number; y: number }>
}

export interface DrawingBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

// Reaction types
export interface Reaction {
  id: string
  pinId: string | null
  drawingId: string | null
  userId: string
  type: string
  createdAt: Date
}

// Comment types
export interface Comment {
  id: string
  pinId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

// Chat message types
export interface ChatMessage {
  id: string
  mapId: string
  userId: string
  content: string
  messageType: string
  metadata: Record<string, unknown>
  createdAt: Date
  deletedAt: Date | null
}

// Refresh token types
export interface RefreshToken {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  revokedAt: Date | null
}

// Auth types
export interface JWTPayload {
  userId: string
  coupleId: string | null
  email: string
}

export interface AuthRequest extends Request {
  user?: JWTPayload
}

// API Response types
export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
