# Implementation Plan

## Overview

**Twy** is a real-time collaborative mapping application for couples. This document outlines the phased implementation approach.

> App name is configurable via `APP_NAME` env variable.

---

## Phase 1: Foundation (MVP Core)

### 1.1 Project Setup
- [x] Initialize project structure
- [ ] Setup client (React + Vite + Tailwind)
- [ ] Setup server (Node.js + Express + TypeScript)
- [ ] Configure Docker Compose (PostgreSQL + Redis)
- [ ] Setup environment configuration
- [ ] Configure ESLint + Prettier

### 1.2 Database Setup
- [ ] Install and configure PostgreSQL with PostGIS
- [ ] Create migration system (node-pg-migrate)
- [ ] Create initial schema migrations
  - [ ] users table
  - [ ] couples table
  - [ ] maps table
  - [ ] pins table
  - [ ] pin_media table
  - [ ] drawings table
- [ ] Create seed data for development

### 1.3 Authentication System
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] JWT token generation (access + refresh)
- [ ] Token refresh endpoint
- [ ] Logout endpoint
- [ ] Password hashing with bcrypt
- [ ] Auth middleware for protected routes
- [ ] Rate limiting on auth endpoints

### 1.4 Couple Pairing System
- [ ] Generate unique invite code on registration
- [ ] Join couple via invite code endpoint
- [ ] Couple status check endpoint
- [ ] Unpair couple endpoint (with confirmation)

### 1.5 Basic UI Components (Duolingo-style)
- [ ] Design system setup (Tailwind config)
- [ ] Button component (chunky, 3D effect)
- [ ] Input component (rounded, friendly)
- [ ] Card component
- [ ] Modal component
- [ ] Toast/notification component
- [ ] Loading spinner (heart animation)
- [ ] Avatar component
- [ ] Empty state component

### 1.6 Auth Pages
- [ ] Landing page
- [ ] Registration page
- [ ] Login page
- [ ] Pairing page (enter/share invite code)
- [ ] Auth context and hooks

---

## Phase 2: Map Core Features

### 2.1 Map Integration
- [ ] Leaflet.js setup with OpenStreetMap
- [ ] Map component with zoom controls
- [ ] Custom map styling (romantic feel)
- [ ] Geolocation support (show current location)
- [ ] Map bounds and center state management

### 2.2 Pin System
- [ ] Create pin on map click
- [ ] Pin data model and API endpoints
  - [ ] POST /api/maps/:mapId/pins
  - [ ] GET /api/maps/:mapId/pins
  - [ ] PUT /api/pins/:pinId
  - [ ] DELETE /api/pins/:pinId
- [ ] Pin marker component with custom icons
- [ ] Pin popup with details
- [ ] Pin editor modal
  - [ ] Title and description
  - [ ] Date picker
  - [ ] Category/type selector
  - [ ] Emoji icon picker
  - [ ] Color picker
- [ ] Drag to reposition pin

### 2.3 Photo Uploads
- [ ] File upload middleware (multer)
- [ ] Image validation (type, size)
- [ ] Image processing pipeline (sharp)
  - [ ] Resize to max dimensions
  - [ ] Convert to WebP
  - [ ] Generate thumbnail
  - [ ] Strip EXIF data
- [ ] Upload endpoint
- [ ] Photo gallery in pin editor
- [ ] Photo viewer/lightbox

### 2.4 Map Management
- [ ] Create new map
- [ ] List user's maps
- [ ] Map settings (name, cover, type)
- [ ] Archive/delete map
- [ ] Map selector/switcher UI

---

## Phase 3: Real-time Collaboration

### 3.1 Socket.io Setup
- [ ] Socket.io server configuration
- [ ] Authentication middleware for sockets
- [ ] Room management (couple_mapId)
- [ ] Connection/disconnection handling
- [ ] Redis adapter for scaling

### 3.2 Real-time Pin Sync
- [ ] Emit pin:create event
- [ ] Emit pin:update event
- [ ] Emit pin:delete event
- [ ] Emit pin:move event
- [ ] Handle incoming pin events
- [ ] Optimistic UI updates
- [ ] Conflict resolution

### 3.3 Partner Presence
- [ ] Track online status
- [ ] Cursor position sharing
- [ ] "Partner is viewing" indicator
- [ ] Partner avatar on map
- [ ] Debounced cursor updates

### 3.4 Drawing System
- [ ] Canvas overlay on map
- [ ] Freehand drawing tool
- [ ] Stroke color picker
- [ ] Stroke width selector
- [ ] Eraser tool
- [ ] Clear drawing option
- [ ] Drawing data model (vector paths)
- [ ] Real-time stroke sync
  - [ ] stroke:start event
  - [ ] stroke:update event (points)
  - [ ] stroke:end event
- [ ] Persist drawings to database
- [ ] Load existing drawings on map load

---

## Phase 4: Enhanced Features

### 4.1 Reactions & Comments
- [ ] Reaction data model
- [ ] Add reaction to pin
- [ ] Reaction display on pins
- [ ] Comment data model
- [ ] Add comment to pin
- [ ] Comment thread UI
- [ ] Real-time reaction/comment sync

### 4.2 Solo Trip Maps
- [ ] Solo map type implementation
- [ ] Owner-only edit permissions
- [ ] Partner view-only mode
- [ ] "I'm here!" quick pin
- [ ] Partner notification on new pin

### 4.3 Search & Places
- [ ] Nominatim integration (free geocoding)
- [ ] Search places input
- [ ] Search results dropdown
- [ ] Navigate to place on map
- [ ] Quick add pin from search

### 4.4 Theme Customization
- [ ] Theme context
- [ ] Theme selector UI
- [ ] Predefined themes:
  - [ ] Rose Garden (pink)
  - [ ] Sunset Love (coral/orange)
  - [ ] Midnight Romance (purple/navy)
  - [ ] Cherry Blossom (soft pink)
  - [ ] Lavender Dreams (purple/lilac)
- [ ] Custom color picker
- [ ] Save theme preference

---

## Phase 5: Polish & Optimization

### 5.1 Performance
- [ ] Image lazy loading
- [ ] Pin clustering for many markers
- [ ] Drawing path optimization
- [ ] Virtualized pin list
- [ ] Bundle size optimization
- [ ] Service worker for caching

### 5.2 UX Improvements
- [ ] Onboarding flow for new users
- [ ] Keyboard shortcuts
- [ ] Undo/redo for drawings
- [ ] Bulk pin management
- [ ] Map zoom to fit all pins
- [ ] Better loading states
- [ ] Error boundaries

### 5.3 Additional Features
- [ ] Pin filters (by date, type, creator)
- [ ] Timeline view of pins
- [ ] Anniversary date & reminders
- [ ] Export map as image
- [ ] Share map preview (public link)
- [ ] Voice notes on pins

---

## Phase 6: Production Ready

### 6.1 Security Hardening
- [ ] Security headers (helmet.js)
- [ ] CORS configuration
- [ ] Rate limiting review
- [ ] Input sanitization audit
- [ ] SQL injection prevention check
- [ ] File upload security review

### 6.2 Testing
- [ ] Unit tests for utilities
- [ ] API endpoint tests
- [ ] Socket event tests
- [ ] Component tests
- [ ] E2E tests (critical flows)

### 6.3 DevOps
- [ ] Production Docker images
- [ ] Nginx configuration
- [ ] SSL/TLS setup (Let's Encrypt)
- [ ] Database backup strategy
- [ ] Logging (structured logs)
- [ ] Health check endpoints
- [ ] Monitoring setup

### 6.4 Documentation
- [ ] API documentation
- [ ] Deployment guide
- [ ] User guide
- [ ] Contributing guide

---

## Technical Decisions

### Why PostgreSQL + PostGIS?
- Spatial queries for map features (find pins within radius)
- ACID compliance for data integrity
- JSON support for flexible schemas
- Proven scalability

### Why Socket.io over raw WebSockets?
- Automatic reconnection
- Room/namespace support
- Fallback transports
- Redis adapter for scaling
- Better DX with acknowledgments

### Why local file storage over S3?
- No third-party dependency (user requirement)
- Simpler setup for VPS deployment
- Can migrate to MinIO later if needed

### Why JWT over sessions?
- Stateless authentication
- Works well with WebSockets
- Easy to validate on both REST and Socket
- Refresh token rotation for security

---

## Milestones

| Milestone | Target | Description |
|-----------|--------|-------------|
| M1 | Phase 1 complete | Users can register, login, pair with partner |
| M2 | Phase 2 complete | Basic map with pins and photos working |
| M3 | Phase 3 complete | Real-time sync and drawing working |
| M4 | Phase 4 complete | Full feature set implemented |
| M5 | Phase 5 complete | Polished, optimized application |
| M6 | Phase 6 complete | Production deployed on VPS |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Real-time conflicts | Data inconsistency | Last-write-wins + optimistic UI + conflict detection |
| Large file uploads | Server overload | Size limits + chunked uploads + queue processing |
| WebSocket disconnects | Lost updates | Event queue + reconnection sync |
| Database bottleneck | Slow queries | Proper indexing + Redis caching + query optimization |
