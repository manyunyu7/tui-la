# Development Checklist

## Legend
- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked

---

## Phase 1: Foundation

### Project Setup
- [x] Create client directory with Vite + React + TypeScript
- [x] Create server directory with Express + TypeScript
- [x] Setup Tailwind CSS with custom config
- [x] Create docker-compose.yml with PostgreSQL + Redis
- [x] Create .env.example and .env files
- [x] Setup ESLint + Prettier for both client/server
- [x] Setup path aliases (@/ for src)
- [ ] Create shared types package (optional)

### Database
- [x] Create docker-compose services for postgres + redis
- [x] Enable PostGIS extension
- [x] Setup migration runner (custom TypeScript)
- [x] Migration: create_users_table
- [x] Migration: create_couples_table
- [x] Migration: create_maps_table
- [x] Migration: create_pins_table
- [x] Migration: create_pin_media_table
- [x] Migration: create_drawings_table
- [x] Migration: create_reactions_table
- [x] Migration: create_comments_table
- [x] Migration: create_chat_messages_table
- [x] Seed: test users
- [x] Seed: test couple
- [x] Seed: sample map with pins

### Authentication (Server)
- [x] POST /api/auth/register
  - [x] Validate email format
  - [x] Check email uniqueness
  - [x] Hash password (bcrypt, 12 rounds)
  - [x] Generate invite code
  - [x] Create user + couple
  - [x] Return tokens + user data
- [x] POST /api/auth/login
  - [x] Validate credentials
  - [x] Compare password hash
  - [x] Generate tokens
  - [x] Return tokens + user data
- [x] POST /api/auth/refresh
  - [x] Validate refresh token
  - [x] Generate new access token
  - [x] Rotate refresh token
- [x] POST /api/auth/logout
  - [x] Invalidate refresh token
- [x] GET /api/auth/me
  - [x] Return current user + couple data
- [x] Auth middleware
  - [x] Verify JWT
  - [x] Attach user to request
  - [x] Handle expired tokens
- [x] Rate limiter middleware

### Couple Pairing (Server)
- [x] POST /api/couple/join
  - [x] Validate invite code
  - [x] Check code not already used
  - [x] Link user to couple
  - [x] Notify partner (socket)
- [x] GET /api/couple/status
  - [x] Return couple info
  - [x] Return partner info (if paired)
- [x] DELETE /api/couple/unpair
  - [x] Require confirmation
  - [x] Remove partner from couple
  - [x] Handle data ownership

### UI Components (Client)
- [x] Tailwind config with romantic colors
- [x] Font setup (system font stack)
- [x] components/ui/Button.tsx
  - [x] Variants: primary, secondary, ghost, danger
  - [x] Sizes: sm, md, lg
  - [x] Loading state
  - [x] Chunky 3D effect
- [x] components/ui/Input.tsx
  - [x] Label support
  - [x] Error state
  - [x] Icon support (left/right)
- [x] components/ui/Card.tsx
- [x] components/ui/Modal.tsx
  - [x] Portal rendering
  - [x] Close on backdrop click
  - [x] Close on Escape
  - [x] Animation
- [x] components/ui/Toast.tsx
  - [x] Toast context/provider
  - [x] Variants: success, error, info
  - [x] Auto dismiss
- [x] components/ui/Spinner.tsx
  - [x] Heart pulse animation
- [x] components/ui/Avatar.tsx
  - [x] Image support
  - [x] Fallback initials
  - [x] Online indicator
- [x] components/ui/EmptyState.tsx
- [x] components/ui/Dropdown.tsx
- [x] components/ui/EmojiPicker.tsx

### Auth Pages (Client)
- [x] contexts/AuthContext.tsx
  - [x] User state
  - [x] Login/logout methods
  - [x] Token management
  - [x] Auto refresh
- [x] pages/Landing.tsx
  - [x] Hero section
  - [x] Feature highlights
  - [x] CTA buttons
- [x] pages/Register.tsx
  - [x] Form validation
  - [x] Loading state
  - [x] Error handling
  - [x] Redirect after success
- [x] pages/Login.tsx
  - [x] Form validation
  - [x] Remember me option
  - [x] Forgot password link (future)
- [x] pages/Pairing.tsx
  - [x] Show invite code
  - [x] Copy code button
  - [x] Enter partner code input
  - [x] Waiting for partner state
- [x] Protected route wrapper

---

## Phase 2: Map Core

### Map Setup (Client)
- [x] Install react-leaflet + leaflet
- [x] components/map/MapContainer.tsx
  - [x] OpenStreetMap tile layer
  - [x] Custom styling/attribution
  - [x] Zoom controls
  - [x] Center on user location
- [x] components/map/MapControls.tsx
  - [x] Zoom in/out buttons
  - [x] Center on me button
  - [x] Drawing toggle
- [x] Map state management (zustand)

### Pin System (Server)
- [x] POST /api/maps/:mapId/pins
  - [x] Validate map ownership
  - [x] Create pin with location
  - [x] Return created pin
- [x] GET /api/maps/:mapId/pins
  - [x] Filter by bounds (optional)
  - [x] Include pin media
- [x] GET /api/pins/:pinId
  - [x] Validate access
  - [x] Include all details
- [x] PUT /api/pins/:pinId
  - [x] Validate ownership
  - [x] Update fields
- [x] DELETE /api/pins/:pinId
  - [x] Soft delete
  - [x] Remove from map

### Pin System (Client)
- [x] components/map/PinMarker.tsx
  - [x] Custom icon based on type
  - [x] Emoji support
  - [x] Color support
  - [x] Click handler
- [x] components/map/PinPopup.tsx
  - [x] Title and date
  - [x] Thumbnail preview
  - [x] Quick actions
- [x] components/pin/PinEditor.tsx
  - [x] Title input
  - [x] Description textarea
  - [x] Date picker
  - [x] Type selector
  - [x] Emoji picker for icon
  - [x] Color picker
  - [x] Photo upload section
  - [x] Save/cancel buttons
- [x] components/pin/PinDetail.tsx
  - [x] Full pin view
  - [x] Photo gallery
  - [x] Edit/delete buttons
  - [x] Reactions section
  - [x] Comments section
- [x] hooks/usePins.ts
  - [x] Fetch pins
  - [x] Create pin
  - [x] Update pin
  - [x] Delete pin
  - [x] Optimistic updates

### Photo Upload (Server)
- [x] POST /api/upload
  - [x] Multer middleware
  - [x] File type validation
  - [x] Size limit (10MB)
  - [x] Process with sharp
  - [x] Store original + thumbnail
  - [x] Return file info
- [x] GET /api/uploads/:path
  - [x] Serve static files
  - [x] Validate access
- [x] DELETE /api/uploads/:id
  - [x] Remove file
  - [x] Update database

### Photo Upload (Client)
- [x] components/upload/PhotoUploader.tsx
  - [x] Drag and drop zone
  - [x] File input fallback
  - [x] Preview thumbnails
  - [x] Progress indicator
  - [x] Remove photo button
- [x] components/ui/Lightbox.tsx
  - [x] Full screen image view
  - [x] Navigation arrows
  - [x] Close button
- [x] services/upload.ts
  - [x] Upload function
  - [x] Progress callback

### Map Management (Server)
- [x] POST /api/maps
  - [x] Create map for couple
  - [x] Set default center/zoom
- [x] GET /api/maps
  - [x] List couple's maps
  - [x] Include pin counts
- [x] GET /api/maps/:mapId
  - [x] Full map details
- [x] PUT /api/maps/:mapId
  - [x] Update name, cover, settings
- [x] DELETE /api/maps/:mapId
  - [x] Soft delete/archive

### Map Management (Client)
- [x] pages/Maps.tsx (list view)
  - [x] Map cards grid
  - [x] Create new map button
  - [x] Empty state
- [x] pages/Map.tsx (single map)
  - [x] Map container
  - [x] Sidebar with pins list
  - [x] Toolbar
- [x] components/map/MapCard.tsx
  - [x] Cover image
  - [x] Name and stats
  - [x] Last updated
- [x] components/map/CreateMapModal.tsx
  - [x] Name input
  - [x] Type selector
  - [x] Cover upload

---

## Phase 3: Real-time

### Socket Setup (Server)
- [x] Socket.io server initialization
- [x] Socket authentication middleware
- [x] Room management helpers
- [ ] Redis adapter setup
- [x] Connection logging (pino structured logs)
- [x] Disconnect cleanup

### Socket Events (Server)
- [x] Handle: join_map
  - [x] Join room: map_{mapId}
  - [x] Broadcast partner joined
- [x] Handle: leave_map
  - [x] Leave room
  - [x] Broadcast partner left
- [x] Handle: cursor_move
  - [x] Broadcast to room (debounced)
- [x] Handle: pin_create
  - [x] Validate and save
  - [x] Broadcast to partner
- [x] Handle: pin_update
  - [x] Validate and save
  - [x] Broadcast to partner
- [x] Handle: pin_delete
  - [x] Validate and delete
  - [x] Broadcast to partner
- [x] Handle: pin_move
  - [x] Validate and update coords
  - [x] Broadcast to partner
- [x] Handle: stroke_start
  - [x] Broadcast to partner
- [x] Handle: stroke_update
  - [x] Broadcast points to partner
- [x] Handle: stroke_end
  - [x] Save to database
  - [x] Broadcast completion
- [x] Handle: chat_message
  - [x] Persist to database
  - [x] Broadcast to partner
- [x] Handle: chat_typing
  - [x] Broadcast to partner

### Socket Client (Client)
- [x] contexts/SocketContext.tsx
  - [x] Connection management
  - [x] Auto reconnection
  - [x] Event handlers
- [x] hooks/useSocket.ts
  - [x] Connect/disconnect
  - [x] Emit helpers
  - [x] Event listeners
  - [x] Chat events (emitChatMessage, emitChatTyping, onChatReceived, onPartnerTyping)
- [x] hooks/useRealtimePins.ts
  - [x] Merge local and remote changes
  - [x] Optimistic updates
- [x] hooks/usePartnerPresence.ts
  - [x] Partner online status
  - [x] Partner cursor position
- [x] components/map/PartnerCursor.tsx
  - [x] Avatar following cursor
  - [x] Smooth animation
- [x] components/ui/OnlineIndicator.tsx

### Drawing System (Client)
- [x] components/map/DrawingCanvas.tsx
  - [x] Canvas overlay on map
  - [x] Touch/mouse events
  - [x] Coordinate mapping
- [x] components/map/DrawingToolbar.tsx
  - [x] Pen tool
  - [x] Eraser tool
  - [x] Color picker
  - [x] Width slider
  - [x] Clear all button
- [x] hooks/useDrawing.ts
  - [x] Current tool state
  - [x] Stroke history
  - [x] Undo/redo
- [x] services/drawing.ts
  - [x] Path optimization (Douglas-Peucker)
  - [x] Path serialization

### Drawing Sync
- [x] Emit strokes in real-time
- [x] Receive and render partner strokes
- [x] Persist completed strokes
- [x] Load existing drawings

---

## Phase 4: Enhanced Features

### Chat System
- [x] Chat messages table (migration 011)
- [x] Chat service (create, get with pagination, soft delete)
- [x] Chat API routes (GET/POST/DELETE /api/maps/:mapId/chat)
- [x] ChatWindow component
- [x] Typing indicator
- [x] Unread message badge
- [x] Auto-scroll to latest message

### Reactions & Comments
- [x] POST /api/pins/:pinId/reactions
- [x] DELETE /api/pins/:pinId/reactions/:reactionId
- [x] POST /api/pins/:pinId/comments
- [x] GET /api/pins/:pinId/comments
- [x] DELETE /api/comments/:commentId
- [x] Reaction picker UI (emoji grid)
- [x] Reaction display on pins (grouped counts)
- [x] Comment thread UI
- [ ] Real-time sync for reactions/comments

### Solo Trip Maps
- [x] Map type: solo_trip
- [x] Owner permission checks (server-side ForbiddenError)
- [x] Partner view-only UI (client-side restrictions)
- [x] "I'm here!" quick action (geolocation)
- [x] Solo Trip badge in header

### Place Search
- [x] Nominatim API integration
- [x] Search input with debounce
- [x] Results dropdown
- [x] Select to navigate
- [x] Quick pin from search

### Themes
- [x] Theme configuration
- [x] Theme switcher UI
- [x] Implement 5 preset themes
- [x] Custom color picker
- [x] Save to user preferences
- [x] Apply theme globally

---

## Phase 5: Polish

### Performance
- [x] Lazy load images
- [x] Pin clustering (react-leaflet-cluster)
- [x] Drawing path simplification (Douglas-Peucker algorithm)
- [ ] Bundle analysis and optimization
- [ ] Code splitting by route

### UX Improvements
- [x] Onboarding tour
- [x] Keyboard shortcuts
- [x] Better error messages
- [x] Improved loading states
- [x] Animations and transitions
- [x] Mobile responsive design

### Additional Features
- [x] Pin filtering (by type, date, creator)
- [x] Timeline view
- [x] Map export as image
- [x] Bulk pin management
- [x] Map zoom to fit all pins
- [x] Drag to reposition pins
- [x] Undo/redo for drawings
- [ ] Voice notes
- [ ] Anniversary reminders

---

## Phase 6: Production

### Security
- [x] Helmet.js setup
- [x] CORS configuration
- [x] Rate limiting audit
- [x] Input sanitization (zod on all endpoints)
- [x] SQL injection prevention (parameterized queries)
- [x] File upload security (multer + sharp + MIME validation)

### Testing
- [x] Server unit tests (49 tests: utilities, errors, middleware)
- [x] Client component tests (38 tests: Avatar, Button, cn, pathSimplify)
- [ ] Server integration tests (API endpoints)
- [ ] Socket event tests
- [ ] E2E tests (Playwright)

### DevOps
- [x] Production Dockerfiles (multi-stage builds)
- [x] Nginx configuration (SPA routing, gzip, asset caching)
- [x] Production docker-compose.prod.yml
- [x] Structured logging (pino with redaction)
- [x] Health check endpoints
- [ ] SSL setup (Let's Encrypt)
- [ ] Backup scripts
- [ ] CI/CD pipeline
- [ ] Monitoring setup

### Documentation
- [x] API documentation (docs/API.md)
- [x] Database schema docs (docs/DATABASE.md)
- [x] Security guide (docs/SECURITY.md)
- [x] Deployment guide (docs/DEPLOYMENT.md)
- [x] Config guide (docs/CONFIG.md)
- [x] Testing guide (docs/TESTING.md)
- [x] Features spec (docs/FEATURES.md)
- [ ] User guide
- [ ] Contributing guide

---

## Notes

### Decisions Made
- Using happy-dom instead of jsdom for client tests (ESM compatibility)
- Using pino for structured logging with sensitive data redaction
- Multi-stage Docker builds for optimized production images
- Douglas-Peucker algorithm for drawing path simplification

### Blockers
- Redis adapter for Socket.io not yet configured (horizontal scaling)

### Ideas for Later
- Voice notes on pins
- Anniversary reminders
- Share map preview (public link)
- Service worker for offline caching
- CI/CD pipeline (GitHub Actions)
