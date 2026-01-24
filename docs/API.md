# API Reference

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John",
  "inviteCode": "ABC12345"  // optional - to join existing couple
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John",
    "avatarUrl": null,
    "coupleId": "uuid",
    "createdAt": "2024-01-24T10:00:00Z"
  },
  "couple": {
    "id": "uuid",
    "inviteCode": "XYZ98765",
    "isPaired": false
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already registered

---

### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "couple": { ... },
  "partner": {
    "id": "uuid",
    "displayName": "Jane",
    "avatarUrl": "/uploads/avatars/...",
    "isOnline": true
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Errors:**
- `401` - Invalid credentials

---

### POST /auth/refresh

Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."  // rotated
}
```

---

### POST /auth/logout

Logout and invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### GET /auth/me

Get current user info.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": { ... },
  "couple": { ... },
  "partner": { ... }
}
```

---

## Couple Endpoints

### POST /couple/join

Join a couple with invite code.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "inviteCode": "ABC12345"
}
```

**Response:** `200 OK`
```json
{
  "couple": {
    "id": "uuid",
    "isPaired": true,
    "pairedAt": "2024-01-24T10:00:00Z"
  },
  "partner": {
    "id": "uuid",
    "displayName": "Jane",
    "avatarUrl": null
  }
}
```

**Errors:**
- `400` - Invalid code format
- `404` - Code not found
- `409` - Already paired / Code already used

---

### GET /couple

Get couple info and settings.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "inviteCode": "ABC12345",
  "isPaired": true,
  "anniversaryDate": "2023-06-15",
  "theme": {
    "name": "rose_garden",
    "primary": "#E11D48"
  },
  "partner": { ... },
  "stats": {
    "mapsCount": 3,
    "pinsCount": 47,
    "daysTogether": 256
  }
}
```

---

### PUT /couple

Update couple settings.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "anniversaryDate": "2023-06-15",
  "theme": {
    "name": "sunset_love",
    "primary": "#F97316"
  }
}
```

**Response:** `200 OK`

---

## Map Endpoints

### GET /maps

List all maps for the couple.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `type` - Filter by type (shared, solo_trip, memory_collection)
- `archived` - Include archived (default: false)

**Response:** `200 OK`
```json
{
  "maps": [
    {
      "id": "uuid",
      "name": "Our Journey",
      "type": "shared",
      "coverUrl": "/uploads/maps/cover.jpg",
      "pinsCount": 24,
      "lastActivity": "2024-01-24T10:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### POST /maps

Create a new map.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Japan Trip 2024",
  "type": "solo_trip",
  "description": "My solo adventure",
  "centerLat": 35.6762,
  "centerLng": 139.6503,
  "zoomLevel": 10
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Japan Trip 2024",
  "type": "solo_trip",
  ...
}
```

---

### GET /maps/:mapId

Get map details with pins.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `includePins` - Include pins (default: true)
- `includeDrawings` - Include drawings (default: true)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Our Journey",
  "type": "shared",
  "centerLat": 51.5074,
  "centerLng": -0.1278,
  "zoomLevel": 10,
  "pins": [ ... ],
  "drawings": [ ... ]
}
```

---

### PUT /maps/:mapId

Update map.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Updated Name",
  "centerLat": 51.5,
  "centerLng": -0.1
}
```

---

### DELETE /maps/:mapId

Archive/delete map.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `permanent` - Permanently delete (default: false = archive)

**Response:** `204 No Content`

---

## Pin Endpoints

### GET /maps/:mapId/pins

Get all pins for a map.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `type` - Filter by pin type
- `createdBy` - Filter by creator
- `from` - Date range start
- `to` - Date range end
- `bounds` - Geo bounds "minLat,minLng,maxLat,maxLng"

**Response:** `200 OK`
```json
{
  "pins": [
    {
      "id": "uuid",
      "title": "First Date",
      "description": "The Italian restaurant downtown",
      "lat": 51.5074,
      "lng": -0.1278,
      "pinType": "memory",
      "icon": "❤️",
      "color": "#E11D48",
      "memoryDate": "2023-06-15",
      "createdBy": {
        "id": "uuid",
        "displayName": "John"
      },
      "media": [
        {
          "id": "uuid",
          "type": "image",
          "url": "/uploads/pins/photo.webp",
          "thumbnailUrl": "/uploads/pins/photo_thumb.webp"
        }
      ],
      "reactionsCount": { "❤️": 2 },
      "commentsCount": 3,
      "createdAt": "2024-01-24T10:00:00Z"
    }
  ]
}
```

---

### POST /maps/:mapId/pins

Create a new pin.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Our Favorite Cafe",
  "description": "Best coffee in town",
  "lat": 51.5074,
  "lng": -0.1278,
  "pinType": "memory",
  "icon": "☕",
  "color": "#E11D48",
  "memoryDate": "2024-01-20",
  "mediaIds": ["uuid", "uuid"]  // uploaded media IDs
}
```

**Response:** `201 Created`

---

### GET /pins/:pinId

Get pin details.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "First Date",
  ...
  "comments": [
    {
      "id": "uuid",
      "content": "Best night ever!",
      "user": { ... },
      "createdAt": "..."
    }
  ],
  "reactions": [
    {
      "type": "❤️",
      "users": [{ "id": "uuid", "displayName": "John" }]
    }
  ]
}
```

---

### PUT /pins/:pinId

Update pin.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Updated Title",
  "lat": 51.5,
  "lng": -0.1
}
```

---

### DELETE /pins/:pinId

Delete pin.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### POST /pins/:pinId/reactions

Add reaction to pin.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "type": "❤️"
}
```

---

### DELETE /pins/:pinId/reactions/:type

Remove reaction.

---

### POST /pins/:pinId/comments

Add comment to pin.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "content": "I love this place!"
}
```

---

## Chat Endpoints

### GET /chat/messages

Get chat messages for the couple.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `limit` - Number of messages (default: 50)
- `before` - Cursor for pagination (message ID)
- `after` - Get messages after this ID

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "uuid",
      "type": "text",
      "content": "Hey love! 💕",
      "sender": {
        "id": "uuid",
        "displayName": "John"
      },
      "readAt": "2024-01-24T10:01:00Z",
      "createdAt": "2024-01-24T10:00:00Z"
    },
    {
      "id": "uuid",
      "type": "image",
      "mediaUrl": "/uploads/chat/photo.webp",
      "thumbnailUrl": "/uploads/chat/photo_thumb.webp",
      "sender": { ... },
      "createdAt": "..."
    },
    {
      "id": "uuid",
      "type": "pin_share",
      "pinId": "uuid",
      "pinTitle": "Check out this place!",
      "pinThumbnail": "...",
      "sender": { ... },
      "createdAt": "..."
    }
  ],
  "hasMore": true,
  "nextCursor": "uuid"
}
```

---

### POST /chat/messages

Send a message (REST fallback, prefer WebSocket).

**Headers:** `Authorization: Bearer <token>`

**Request (text):**
```json
{
  "type": "text",
  "content": "Miss you! 💕"
}
```

**Request (image):**
```json
{
  "type": "image",
  "mediaId": "uuid"
}
```

**Request (pin share):**
```json
{
  "type": "pin_share",
  "pinId": "uuid"
}
```

---

### PUT /chat/messages/:messageId/read

Mark message as read.

---

### POST /chat/messages/:messageId/reactions

React to a message.

**Request:**
```json
{
  "type": "❤️"
}
```

---

## Upload Endpoints

### POST /upload

Upload a file.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` - The file to upload
- `type` - Type: `pin_media`, `chat`, `avatar`, `map_cover`

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "url": "/uploads/pins/uuid.webp",
  "thumbnailUrl": "/uploads/pins/uuid_thumb.webp",
  "mimeType": "image/webp",
  "width": 1920,
  "height": 1080,
  "size": 245000
}
```

---

## Drawing Endpoints

### GET /maps/:mapId/drawings

Get all drawings for a map.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "drawings": [
    {
      "id": "uuid",
      "pathData": {
        "points": [{"x": 51.5, "y": -0.1}, ...]
      },
      "strokeColor": "#E11D48",
      "strokeWidth": 3,
      "createdBy": { ... },
      "createdAt": "..."
    }
  ]
}
```

---

### POST /maps/:mapId/drawings

Save a drawing (called after stroke ends).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "pathData": {
    "points": [{"x": 51.5, "y": -0.1}, ...]
  },
  "strokeColor": "#E11D48",
  "strokeWidth": 3,
  "bounds": {
    "north": 51.51,
    "south": 51.50,
    "east": -0.08,
    "west": -0.10
  }
}
```

---

### DELETE /drawings/:drawingId

Delete a drawing.

---

## Search Endpoints

### GET /search/places

Search for places using Nominatim.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `q` - Search query
- `limit` - Max results (default: 5)

**Response:** `200 OK`
```json
{
  "places": [
    {
      "name": "Eiffel Tower",
      "displayName": "Eiffel Tower, Paris, France",
      "lat": 48.8584,
      "lng": 2.2945,
      "type": "attraction"
    }
  ]
}
```

---

## WebSocket Events

### Connection

```javascript
const socket = io('wss://yourdomain.com', {
  auth: { token: 'access_token' }
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_map` | `{ mapId }` | Join map room |
| `leave_map` | `{ mapId }` | Leave map room |
| `cursor_move` | `{ mapId, lat, lng }` | Update cursor position |
| `pin_create` | `{ mapId, ...pinData }` | Create new pin |
| `pin_update` | `{ pinId, ...changes }` | Update pin |
| `pin_delete` | `{ pinId }` | Delete pin |
| `pin_move` | `{ pinId, lat, lng }` | Move pin |
| `stroke_start` | `{ mapId, color, width }` | Start drawing |
| `stroke_update` | `{ mapId, points }` | Drawing points |
| `stroke_end` | `{ mapId, pathData }` | Finish drawing |
| `chat_message` | `{ content, type }` | Send chat message |
| `chat_typing` | `{ isTyping }` | Typing indicator |
| `message_read` | `{ messageId }` | Mark message read |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `partner_joined` | `{ user }` | Partner joined map |
| `partner_left` | `{ userId }` | Partner left map |
| `partner_cursor` | `{ lat, lng }` | Partner cursor position |
| `partner_online` | `{ userId }` | Partner came online |
| `partner_offline` | `{ userId }` | Partner went offline |
| `pin_created` | `{ pin }` | New pin created |
| `pin_updated` | `{ pin }` | Pin updated |
| `pin_deleted` | `{ pinId }` | Pin deleted |
| `stroke_started` | `{ userId, color, width }` | Partner started drawing |
| `stroke_updated` | `{ userId, points }` | Partner drawing points |
| `stroke_ended` | `{ drawing }` | Partner finished drawing |
| `chat_received` | `{ message }` | New chat message |
| `partner_typing` | `{ isTyping }` | Partner typing |
| `message_read` | `{ messageId, readAt }` | Message read receipt |

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "constraint": "isEmail"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Auth endpoints | 5 req/min |
| Upload | 10 req/min |
| Other | 100 req/min |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706097600
```
