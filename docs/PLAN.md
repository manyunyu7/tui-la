# Implementation Plan

## Overview

**Twy** is a real-time collaborative mapping application for couples. This document outlines the phased implementation approach.

> App name is configurable via `APP_NAME` env variable.

---

## Phase 1: Foundation (MVP Core)

### 1.1 Project Setup
- [x] Initialize project structure
- [x] Setup client (React + Vite + Tailwind)
- [x] Setup server (Node.js + Express + TypeScript)
- [x] Configure Docker Compose (PostgreSQL + Redis)
- [x] Setup environment configuration
- [x] Configure ESLint + Prettier

### 1.2 Database Setup
- [x] Install and configure PostgreSQL with PostGIS
- [x] Create migration system (custom TypeScript runner)
- [x] Create initial schema migrations
  - [x] users table
  - [x] couples table
  - [x] maps table
  - [x] pins table
  - [x] pin_media table
  - [x] drawings table
- [x] Create seed data for development

### 1.3 Authentication System
- [x] User registration endpoint
- [x] User login endpoint
- [x] JWT token generation (access + refresh)
- [x] Token refresh endpoint
- [x] Logout endpoint
- [x] Password hashing with bcrypt
- [x] Auth middleware for protected routes
- [x] Rate limiting on auth endpoints

### 1.4 Couple Pairing System
- [x] Generate unique invite code on registration
- [x] Join couple via invite code endpoint
- [x] Couple status check endpoint
- [x] Unpair couple endpoint (with confirmation)

### 1.5 Basic UI Components (Duolingo-style)
- [x] Design system setup (Tailwind config)
- [x] Button component (chunky, 3D effect)
- [x] Input component (rounded, friendly)
- [x] Card component
- [x] Modal component
- [x] Toast/notification component
- [x] Loading spinner (heart animation)
- [x] Avatar component
- [x] Empty state component

### 1.6 Auth Pages
- [x] Landing page
- [x] Registration page
- [x] Login page
- [x] Pairing page (enter/share invite code)
- [x] Auth context and hooks

---

## Phase 2: Map Core Features

### 2.1 Map Integration
- [x] Leaflet.js setup with OpenStreetMap
- [x] Map component with zoom controls
- [ ] Custom map styling (romantic feel)
- [x] Geolocation support (show current location)
- [x] Map bounds and center state management

### 2.2 Pin System
- [x] Create pin on map click
- [x] Pin data model and API endpoints
  - [x] POST /api/maps/:mapId/pins
  - [x] GET /api/maps/:mapId/pins
  - [x] PUT /api/pins/:pinId
  - [x] DELETE /api/pins/:pinId
- [x] Pin marker component with custom icons
- [x] Pin popup with details
- [x] Pin editor modal
  - [x] Title and description
  - [x] Date picker
  - [x] Category/type selector
  - [x] Emoji icon picker
  - [x] Color picker
- [x] Drag to reposition pin

### 2.3 Photo Uploads
- [x] File upload middleware (multer)
- [x] Image validation (type, size)
- [x] Image processing pipeline (sharp)
  - [x] Resize to max dimensions
  - [x] Convert to WebP
  - [x] Generate thumbnail
  - [x] Strip EXIF data
- [x] Upload endpoint
- [x] Photo gallery in pin editor
- [x] Photo viewer/lightbox

### 2.4 Map Management
- [x] Create new map
- [x] List user's maps
- [x] Map settings (name, cover, description)
- [x] Archive/delete map
- [x] Map selector/switcher UI

---

## Phase 3: Real-time Collaboration

### 3.1 Socket.io Setup
- [x] Socket.io server configuration
- [x] Authentication middleware for sockets
- [x] Room management (couple_mapId)
- [x] Connection/disconnection handling
- [ ] Redis adapter for scaling

### 3.2 Real-time Pin Sync
- [x] Emit pin:create event
- [x] Emit pin:update event
- [x] Emit pin:delete event
- [x] Emit pin:move event
- [x] Handle incoming pin events
- [x] Optimistic UI updates
- [ ] Conflict resolution

### 3.3 Partner Presence
- [x] Track online status
- [x] Cursor position sharing
- [x] "Partner is viewing" indicator
- [x] Partner avatar on map
- [x] Debounced cursor updates

### 3.4 Drawing System
- [x] Canvas overlay on map
- [x] Freehand drawing tool
- [x] Stroke color picker
- [x] Stroke width selector
- [x] Eraser tool
- [x] Clear drawing option
- [x] Drawing data model (vector paths)
- [x] Real-time stroke sync
  - [x] stroke:start event
  - [x] stroke:update event (points)
  - [x] stroke:end event
- [x] Persist drawings to database
- [x] Load existing drawings on map load

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
- [x] Nominatim integration (free geocoding)
- [x] Search places input
- [x] Search results dropdown
- [x] Navigate to place on map
- [x] Quick add pin from search

### 4.4 Theme Customization
- [x] Theme context
- [x] Theme selector UI
- [x] Predefined themes:
  - [x] Rose Garden (pink)
  - [x] Sunset Love (coral/orange)
  - [x] Midnight Romance (purple/navy)
  - [x] Cherry Blossom (soft pink)
  - [x] Lavender Dreams (purple/lilac)
- [ ] Custom color picker
- [x] Save theme preference

---

## Phase 5: Polish & Optimization

### 5.1 Performance
- [x] Image lazy loading
- [x] Pin clustering for many markers
- [ ] Drawing path optimization
- [ ] Virtualized pin list
- [ ] Bundle size optimization
- [ ] Service worker for caching

### 5.2 UX Improvements
- [x] Onboarding flow for new users
- [x] Keyboard shortcuts
- [x] Undo/redo for drawings
- [ ] Bulk pin management
- [x] Map zoom to fit all pins
- [x] Better loading states
- [x] Error boundaries

### 5.3 Additional Features
- [x] Pin filters (by date, type, creator)
- [x] Timeline view of pins
- [ ] Anniversary date & reminders
- [ ] Export map as image
- [ ] Share map preview (public link)
- [ ] Voice notes on pins

---

## Phase 6: Production Ready

### 6.1 Security Hardening
- [x] Security headers (helmet.js)
- [x] CORS configuration
- [x] Rate limiting review
- [x] Input sanitization audit (zod validation on all inputs)
- [x] SQL injection prevention check (parameterized queries)
- [x] File upload security review (multer + sharp + mime validation)

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
- [x] Health check endpoints
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
