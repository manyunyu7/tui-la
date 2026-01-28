// User types
export interface User {
  id: string
  email: string
  displayName: string
  avatarPath?: string
  coupleId?: string
  role: 'partner_1' | 'partner_2'
  createdAt: string
  updatedAt: string
}

// Couple types
export interface Couple {
  id: string
  inviteCode: string
  anniversaryDate?: string
  theme: Theme
  settings: CoupleSettings
  pairedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Theme {
  name: string
  primary: string
  secondary?: string
  accent?: string
  background?: string
}

export interface CoupleSettings {
  [key: string]: unknown
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  displayName: string
}

// Map types
export interface MapData {
  id: string
  coupleId: string
  ownerId?: string
  name: string
  description?: string
  type: 'shared' | 'solo_trip' | 'memory_collection'
  coverPath?: string
  centerLat: number
  centerLng: number
  zoomLevel: number
  isArchived: boolean
  settings: MapSettings
  createdAt: string
  updatedAt: string
}

export interface MapSettings {
  [key: string]: unknown
}

// Pin types
export interface Pin {
  id: string
  mapId: string
  createdBy: string
  title: string
  description?: string
  lat: number
  lng: number
  pinType: 'memory' | 'wishlist' | 'milestone' | 'trip'
  icon: string
  color: string
  memoryDate?: string
  isPrivate: boolean
  metadata: PinMetadata
  media: PinMedia[]
  createdAt: string
  updatedAt: string
}

export interface PinMetadata {
  weather?: string
  mood?: string
  song?: string
  tags?: string[]
  [key: string]: unknown
}

export interface PinMedia {
  id: string
  pinId: string
  type: 'image' | 'audio' | 'video'
  filePath: string
  thumbnailPath?: string
  originalName?: string
  fileSize?: number
  mimeType?: string
  width?: number
  height?: number
  duration?: number
  sortOrder: number
  createdAt: string
}

// Drawing types
export interface Drawing {
  id: string
  mapId: string
  createdBy: string
  pathData: PathData
  bounds?: DrawingBounds
  strokeColor: string
  strokeWidth: number
  opacity: number
  layerOrder: number
  createdAt: string
  updatedAt: string
}

export interface PathData {
  points: Array<{ x: number; y: number }>
}

export interface DrawingBounds {
  north: number
  south: number
  east: number
  west: number
}

// Reaction types
export interface Reaction {
  id: string
  pinId?: string
  drawingId?: string
  userId: string
  type: string
  createdAt: string
}

// Comment types
export interface Comment {
  id: string
  pinId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
}

// Chat message types
export interface ChatMessage {
  id: string
  mapId: string
  userId: string
  content: string
  messageType: string
  metadata: Record<string, unknown>
  displayName: string
  avatarPath?: string
  createdAt: string
}

// Reaction with user info
export interface ReactionWithUser extends Reaction {
  displayName: string
}

// Comment with user info
export interface CommentWithUser extends Comment {
  displayName: string
  avatarPath?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
