# Development Checklist

## Legend
- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked

---

## Phase 1: Foundation

### Project Setup
- [ ] Create client directory with Vite + React + TypeScript
- [ ] Create server directory with Express + TypeScript
- [ ] Setup Tailwind CSS with custom config
- [ ] Create docker-compose.yml with PostgreSQL + Redis
- [ ] Create .env.example and .env files
- [ ] Setup ESLint + Prettier for both client/server
- [ ] Setup path aliases (@/ for src)
- [ ] Create shared types package (optional)

### Database
- [ ] Create docker-compose services for postgres + redis
- [ ] Enable PostGIS extension
- [ ] Setup node-pg-migrate
- [ ] Migration: create_users_table
- [ ] Migration: create_couples_table
- [ ] Migration: create_maps_table
- [ ] Migration: create_pins_table
- [ ] Migration: create_pin_media_table
- [ ] Migration: create_drawings_table
- [ ] Migration: create_reactions_table
- [ ] Migration: create_comments_table
- [ ] Seed: test users
- [ ] Seed: test couple
- [ ] Seed: sample map with pins

### Authentication (Server)
- [ ] POST /api/auth/register
  - [ ] Validate email format
  - [ ] Check email uniqueness
  - [ ] Hash password (bcrypt, 12 rounds)
  - [ ] Generate invite code
  - [ ] Create user + couple
  - [ ] Return tokens + user data
- [ ] POST /api/auth/login
  - [ ] Validate credentials
  - [ ] Compare password hash
  - [ ] Generate tokens
  - [ ] Return tokens + user data
- [ ] POST /api/auth/refresh
  - [ ] Validate refresh token
  - [ ] Generate new access token
  - [ ] Rotate refresh token
- [ ] POST /api/auth/logout
  - [ ] Invalidate refresh token
- [ ] GET /api/auth/me
  - [ ] Return current user + couple data
- [ ] Auth middleware
  - [ ] Verify JWT
  - [ ] Attach user to request
  - [ ] Handle expired tokens
- [ ] Rate limiter middleware

### Couple Pairing (Server)
- [ ] POST /api/couple/join
  - [ ] Validate invite code
  - [ ] Check code not already used
  - [ ] Link user to couple
  - [ ] Notify partner (socket)
- [ ] GET /api/couple/status
  - [ ] Return couple info
  - [ ] Return partner info (if paired)
- [ ] DELETE /api/couple/unpair
  - [ ] Require confirmation
  - [ ] Remove partner from couple
  - [ ] Handle data ownership

### UI Components (Client)
- [ ] Tailwind config with romantic colors
- [ ] Font setup (Inter or similar friendly font)
- [ ] components/ui/Button.tsx
  - [ ] Variants: primary, secondary, ghost, danger
  - [ ] Sizes: sm, md, lg
  - [ ] Loading state
  - [ ] Chunky 3D effect
- [ ] components/ui/Input.tsx
  - [ ] Label support
  - [ ] Error state
  - [ ] Icon support (left/right)
- [ ] components/ui/Card.tsx
- [ ] components/ui/Modal.tsx
  - [ ] Portal rendering
  - [ ] Close on backdrop click
  - [ ] Close on Escape
  - [ ] Animation
- [ ] components/ui/Toast.tsx
  - [ ] Toast context/provider
  - [ ] Variants: success, error, info
  - [ ] Auto dismiss
- [ ] components/ui/Spinner.tsx
  - [ ] Heart pulse animation
- [ ] components/ui/Avatar.tsx
  - [ ] Image support
  - [ ] Fallback initials
  - [ ] Online indicator
- [ ] components/ui/EmptyState.tsx
- [ ] components/ui/Dropdown.tsx
- [ ] components/ui/EmojiPicker.tsx

### Auth Pages (Client)
- [ ] contexts/AuthContext.tsx
  - [ ] User state
  - [ ] Login/logout methods
  - [ ] Token management
  - [ ] Auto refresh
- [ ] pages/Landing.tsx
  - [ ] Hero section
  - [ ] Feature highlights
  - [ ] CTA buttons
- [ ] pages/Register.tsx
  - [ ] Form validation
  - [ ] Loading state
  - [ ] Error handling
  - [ ] Redirect after success
- [ ] pages/Login.tsx
  - [ ] Form validation
  - [ ] Remember me option
  - [ ] Forgot password link (future)
- [ ] pages/Pairing.tsx
  - [ ] Show invite code
  - [ ] Copy code button
  - [ ] Enter partner code input
  - [ ] Waiting for partner state
- [ ] Protected route wrapper

---

## Phase 2: Map Core

### Map Setup (Client)
- [ ] Install react-leaflet + leaflet
- [ ] components/map/MapContainer.tsx
  - [ ] OpenStreetMap tile layer
  - [ ] Custom styling/attribution
  - [ ] Zoom controls
  - [ ] Center on user location
- [ ] components/map/MapControls.tsx
  - [ ] Zoom in/out buttons
  - [ ] Center on me button
  - [ ] Drawing toggle
- [ ] contexts/MapContext.tsx
  - [ ] Current map state
  - [ ] Viewport state
  - [ ] Selected pin state

### Pin System (Server)
- [ ] POST /api/maps/:mapId/pins
  - [ ] Validate map ownership
  - [ ] Create pin with location
  - [ ] Return created pin
- [ ] GET /api/maps/:mapId/pins
  - [ ] Filter by bounds (optional)
  - [ ] Include pin media
- [ ] GET /api/pins/:pinId
  - [ ] Validate access
  - [ ] Include all details
- [ ] PUT /api/pins/:pinId
  - [ ] Validate ownership
  - [ ] Update fields
- [ ] DELETE /api/pins/:pinId
  - [ ] Soft delete
  - [ ] Remove from map

### Pin System (Client)
- [ ] components/map/PinMarker.tsx
  - [ ] Custom icon based on type
  - [ ] Emoji support
  - [ ] Color support
  - [ ] Click handler
- [ ] components/map/PinPopup.tsx
  - [ ] Title and date
  - [ ] Thumbnail preview
  - [ ] Quick actions
- [ ] components/pin/PinEditor.tsx
  - [ ] Title input
  - [ ] Description textarea
  - [ ] Date picker
  - [ ] Type selector
  - [ ] Emoji picker for icon
  - [ ] Color picker
  - [ ] Photo upload section
  - [ ] Save/cancel buttons
- [ ] components/pin/PinDetail.tsx
  - [ ] Full pin view
  - [ ] Photo gallery
  - [ ] Edit/delete buttons
  - [ ] Comments section
- [ ] hooks/usePins.ts
  - [ ] Fetch pins
  - [ ] Create pin
  - [ ] Update pin
  - [ ] Delete pin
  - [ ] Optimistic updates

### Photo Upload (Server)
- [ ] POST /api/upload
  - [ ] Multer middleware
  - [ ] File type validation
  - [ ] Size limit (10MB)
  - [ ] Process with sharp
  - [ ] Store original + thumbnail
  - [ ] Return file info
- [ ] GET /api/uploads/:path
  - [ ] Serve static files
  - [ ] Validate access
- [ ] DELETE /api/uploads/:id
  - [ ] Remove file
  - [ ] Update database

### Photo Upload (Client)
- [ ] components/upload/PhotoUploader.tsx
  - [ ] Drag and drop zone
  - [ ] File input fallback
  - [ ] Preview thumbnails
  - [ ] Progress indicator
  - [ ] Remove photo button
- [ ] components/ui/Lightbox.tsx
  - [ ] Full screen image view
  - [ ] Navigation arrows
  - [ ] Close button
- [ ] services/upload.ts
  - [ ] Upload function
  - [ ] Progress callback

### Map Management (Server)
- [ ] POST /api/maps
  - [ ] Create map for couple
  - [ ] Set default center/zoom
- [ ] GET /api/maps
  - [ ] List couple's maps
  - [ ] Include pin counts
- [ ] GET /api/maps/:mapId
  - [ ] Full map details
- [ ] PUT /api/maps/:mapId
  - [ ] Update name, cover, settings
- [ ] DELETE /api/maps/:mapId
  - [ ] Soft delete/archive

### Map Management (Client)
- [ ] pages/Maps.tsx (list view)
  - [ ] Map cards grid
  - [ ] Create new map button
  - [ ] Empty state
- [ ] pages/Map.tsx (single map)
  - [ ] Map container
  - [ ] Sidebar with pins list
  - [ ] Toolbar
- [ ] components/map/MapCard.tsx
  - [ ] Cover image
  - [ ] Name and stats
  - [ ] Last updated
- [ ] components/map/CreateMapModal.tsx
  - [ ] Name input
  - [ ] Type selector
  - [ ] Cover upload

---

## Phase 3: Real-time

### Socket Setup (Server)
- [ ] Socket.io server initialization
- [ ] Socket authentication middleware
- [ ] Room management helpers
- [ ] Redis adapter setup
- [ ] Connection logging
- [ ] Disconnect cleanup

### Socket Events (Server)
- [ ] Handle: join_map
  - [ ] Join room: map_{mapId}
  - [ ] Broadcast partner joined
- [ ] Handle: leave_map
  - [ ] Leave room
  - [ ] Broadcast partner left
- [ ] Handle: cursor_move
  - [ ] Broadcast to room (debounced)
- [ ] Handle: pin_create
  - [ ] Validate and save
  - [ ] Broadcast to partner
- [ ] Handle: pin_update
  - [ ] Validate and save
  - [ ] Broadcast to partner
- [ ] Handle: pin_delete
  - [ ] Validate and delete
  - [ ] Broadcast to partner
- [ ] Handle: pin_move
  - [ ] Validate and update coords
  - [ ] Broadcast to partner
- [ ] Handle: stroke_start
  - [ ] Broadcast to partner
- [ ] Handle: stroke_update
  - [ ] Broadcast points to partner
- [ ] Handle: stroke_end
  - [ ] Save to database
  - [ ] Broadcast completion

### Socket Client (Client)
- [ ] contexts/SocketContext.tsx
  - [ ] Connection management
  - [ ] Auto reconnection
  - [ ] Event handlers
- [ ] hooks/useSocket.ts
  - [ ] Connect/disconnect
  - [ ] Emit helpers
  - [ ] Event listeners
- [ ] hooks/useRealtimePins.ts
  - [ ] Merge local and remote changes
  - [ ] Optimistic updates
- [ ] hooks/usePartnerPresence.ts
  - [ ] Partner online status
  - [ ] Partner cursor position
- [ ] components/map/PartnerCursor.tsx
  - [ ] Avatar following cursor
  - [ ] Smooth animation
- [ ] components/ui/OnlineIndicator.tsx

### Drawing System (Client)
- [ ] components/map/DrawingCanvas.tsx
  - [ ] Canvas overlay on map
  - [ ] Touch/mouse events
  - [ ] Coordinate mapping
- [ ] components/map/DrawingToolbar.tsx
  - [ ] Pen tool
  - [ ] Eraser tool
  - [ ] Color picker
  - [ ] Width slider
  - [ ] Clear all button
- [ ] hooks/useDrawing.ts
  - [ ] Current tool state
  - [ ] Stroke history
  - [ ] Undo/redo
- [ ] services/drawing.ts
  - [ ] Path optimization
  - [ ] Path serialization

### Drawing Sync
- [ ] Emit strokes in real-time
- [ ] Receive and render partner strokes
- [ ] Persist completed strokes
- [ ] Load existing drawings

---

## Phase 4: Enhanced Features

### Reactions & Comments
- [ ] POST /api/pins/:pinId/reactions
- [ ] DELETE /api/pins/:pinId/reactions/:reactionId
- [ ] POST /api/pins/:pinId/comments
- [ ] GET /api/pins/:pinId/comments
- [ ] DELETE /api/comments/:commentId
- [ ] Reaction picker UI
- [ ] Reaction display on pins
- [ ] Comment thread UI
- [ ] Real-time sync

### Solo Trip Maps
- [ ] Map type: solo_trip
- [ ] Owner permission checks
- [ ] Partner view-only UI
- [ ] "I'm here!" quick action
- [ ] Notification to partner

### Place Search
- [ ] Nominatim API integration
- [ ] Search input with debounce
- [ ] Results dropdown
- [ ] Select to navigate
- [ ] Quick pin from search

### Themes
- [ ] Theme configuration
- [ ] Theme switcher UI
- [ ] Implement 5 preset themes
- [ ] Custom color picker
- [ ] Save to user preferences
- [ ] Apply theme globally

---

## Phase 5: Polish

### Performance
- [ ] Lazy load images
- [ ] Pin clustering (react-leaflet-cluster)
- [ ] Drawing path simplification
- [ ] Bundle analysis and optimization
- [ ] Code splitting by route

### UX Improvements
- [ ] Onboarding tour
- [ ] Keyboard shortcuts
- [ ] Better error messages
- [ ] Improved loading states
- [ ] Animations and transitions
- [ ] Mobile responsive design

### Additional Features
- [ ] Pin filtering
- [ ] Timeline view
- [ ] Map export
- [ ] Voice notes
- [ ] Anniversary reminders

---

## Phase 6: Production

### Security
- [ ] Helmet.js setup
- [ ] CORS configuration
- [ ] Rate limiting audit
- [ ] Input sanitization
- [ ] Dependency audit

### Testing
- [ ] Server unit tests
- [ ] Server integration tests
- [ ] Client component tests
- [ ] E2E tests (Playwright)

### DevOps
- [ ] Production Dockerfiles
- [ ] Nginx configuration
- [ ] SSL setup
- [ ] Backup scripts
- [ ] CI/CD pipeline

### Documentation
- [ ] Complete API docs
- [ ] Deployment guide
- [ ] User guide

---

## Notes

### Decisions Made
-

### Blockers
-

### Ideas for Later
-
