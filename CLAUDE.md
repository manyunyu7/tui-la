# Twy - AI Agent Instructions

> This file provides context for Claude Code to work autonomously on this project.

## Project Overview

**Twy** is a real-time collaborative map application for couples. Partners can:
- Place memory pins on a shared map
- Draw doodles together in real-time
- Chat with each other
- Share photos and moments
- Customize themes

**Target users**: Couples who want to preserve and share their journey together.

**UI Style**: Duolingo-inspired (playful, chunky buttons, rounded corners, friendly).

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React 18 + Vite + TypeScript | Not started |
| Styling | Tailwind CSS | Not started |
| Map | mapcn (MapLibre-based) | Not started |
| UI Components | Custom (Duolingo-style) | Not started |
| Backend | Node.js + Express + TypeScript | Not started |
| Real-time | Socket.io | Not started |
| Database | PostgreSQL + PostGIS | Docker ready |
| Cache | Redis | Docker ready |
| File Storage | Local filesystem | Not started |

---

## Git & Repository

### Remote Repository
```
https://github.com/manyunyu7/tui-la
```

### Initial Setup (if not done)
```bash
git init
git remote add origin https://github.com/manyunyu7/tui-la.git
```

### Push Milestones

Push to remote after completing these milestones:

| Milestone | When to Push | Branch |
|-----------|--------------|--------|
| **M1: Scaffolding** | Project structure + configs ready | `main` |
| **M2: UI Components** | All base components built | `main` |
| **M3: Auth System** | Register/login working | `main` |
| **M4: Couple Pairing** | Pairing flow complete | `main` |
| **M5: Map Basic** | Map displays with pins | `main` |
| **M6: Real-time** | Socket sync working | `main` |

### Commit Convention

```
feat: add user registration
fix: correct password validation
docs: update API documentation
style: improve button hover states
refactor: extract auth middleware
test: add pin creation tests
chore: update dependencies
```

### Push Commands
```bash
# After completing a milestone
git add .
git commit -m "feat: complete [milestone description]

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### Branch Strategy (Simple)
- `main` - stable, working code
- Feature branches optional for large features

---

## Commands

### Development

```bash
# Start database services
docker-compose up -d

# Install dependencies (once project is scaffolded)
cd server && npm install
cd ../client && npm install

# Run server (once created)
cd server && npm run dev

# Run client (once created)
cd client && npm run dev

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run typecheck
```

### Database

```bash
# Run migrations
cd server && npm run db:migrate

# Rollback
cd server && npm run db:rollback

# Create migration
cd server && npm run db:create-migration <name>
```

---

## Project Structure (Target)

```
love_map/
├── client/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Button, Input, Card, Modal, etc.
│   │   │   ├── map/         # MapContainer, Pin, Drawing
│   │   │   ├── chat/        # ChatWindow, Message
│   │   │   └── layout/      # Navbar, Sidebar
│   │   ├── config/          # constants, themes, api config
│   │   ├── contexts/        # AuthContext, SocketContext, ThemeContext
│   │   ├── hooks/           # useAuth, usePins, useSocket, etc.
│   │   ├── pages/           # Landing, Login, Register, Maps, Map
│   │   ├── services/        # api.ts, socket.ts
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # helpers
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── config/          # database, redis, env
│   │   ├── controllers/     # route handlers
│   │   ├── middleware/      # auth, validate, rateLimit
│   │   ├── models/          # database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # business logic
│   │   ├── socket/          # WebSocket handlers
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # helpers
│   │   └── app.ts           # Express app
│   ├── migrations/          # Database migrations
│   ├── uploads/             # File uploads
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                     # Documentation
├── docker/                   # Docker configs
├── docker-compose.yml
├── .env.example
├── CLAUDE.md                 # This file
└── README.md
```

---

## Coding Standards

### TypeScript
- Strict mode enabled
- Explicit return types on functions
- Use `type` for objects, `interface` for extendable
- No `any` - use `unknown` if truly unknown

### React
- Functional components only
- Custom hooks for logic reuse
- Props interface above component
- Destructure props in function signature

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  onClick,
}: ButtonProps) {
  // ...
}
```

### Styling (Tailwind)
- Use design tokens from theme
- Duolingo-style: rounded-2xl, rounded-3xl
- Chunky buttons with border-b-4 for 3D effect
- Romantic color palette (rose as primary)

```tsx
// Good - Duolingo style button
<button className="
  bg-rose-500 text-white font-bold
  py-3 px-6 rounded-2xl
  border-b-4 border-rose-700
  active:border-b-0 active:translate-y-1
  hover:bg-rose-400
  transition-all duration-150
">

// Bad - flat, boring
<button className="bg-red-500 text-white p-2 rounded">
```

### Backend
- Controllers handle HTTP, services handle logic
- Always validate input (zod or similar)
- Always check couple ownership on resources
- Use async/await, not callbacks
- Structured error responses

```typescript
// Good
const getMap = async (req: Request, res: Response) => {
  const { mapId } = req.params;
  const { coupleId } = req.user;

  const map = await mapService.getMapForCouple(mapId, coupleId);
  if (!map) {
    throw new NotFoundError('Map not found');
  }

  res.json({ map });
};
```

### Naming
- Files: kebab-case (`pin-editor.tsx`)
- Components: PascalCase (`PinEditor`)
- Functions/variables: camelCase (`createPin`)
- Constants: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- Database: snake_case (`created_at`)

---

## Current Phase: Foundation (MVP)

### Priority Order

1. **Project Scaffolding** (FIRST)
   - Create client with Vite + React + TypeScript
   - Create server with Express + TypeScript
   - Setup Tailwind with romantic theme
   - Setup ESLint + Prettier

2. **UI Components** (SECOND)
   - Button, Input, Card, Modal, Toast
   - Make them Duolingo-style (chunky, playful)

3. **Database & Auth** (THIRD)
   - Migrations for all tables
   - Register/Login endpoints
   - JWT middleware

4. **Couple Pairing** (FOURTH)
   - Invite code generation
   - Join couple endpoint
   - Pairing UI

5. **Map Integration** (FIFTH)
   - Setup mapcn
   - Basic map display
   - Pin CRUD

6. **Real-time** (SIXTH)
   - Socket.io setup
   - Pin sync
   - Presence

---

## Autonomy Guidelines

### You CAN (without asking):
- Create new files and folders
- Install npm packages
- Write and run tests
- Fix bugs you discover
- Refactor for better patterns
- Add helpful comments
- Update CHECKLIST.md when completing tasks
- Add new tasks to PLAN.md if discovered
- Create example/seed data
- Improve error handling
- Add TypeScript types

### You SHOULD:
- Follow existing patterns once established
- Test your code works before moving on
- Update docs when adding features
- Commit after completing each feature
- **Push to remote after each milestone** (see Git section)
- Leave TODO comments for unclear decisions
- Log what you completed in this file (bottom)

### You SHOULD NOT:
- Change the tech stack
- Remove features from the plan
- Skip security measures (see Security section below)
- Use `any` types
- Leave broken code
- Ignore TypeScript errors
- Log sensitive data (passwords, tokens, personal info)
- Use string concatenation for SQL queries
- Trust user input without validation
- Store passwords in plain text
- Expose internal errors to users

### If blocked:
- Leave a clear TODO comment
- Document the blocker in BLOCKERS section below
- Move to the next task
- Return to it later if resolved

---

## Security Requirements (CRITICAL)

> Read [docs/SECURITY.md](./docs/SECURITY.md) for full details.

### Non-Negotiable Rules

1. **Passwords**: Always bcrypt with cost 12+
2. **SQL**: Always parameterized queries, NEVER string concat
3. **Input**: Always validate with zod before processing
4. **Couple Isolation**: EVERY query must filter by `couple_id`
5. **Files**: Validate MIME via magic bytes, strip EXIF, random filenames
6. **Tokens**: Short-lived access (15m), rotate refresh tokens
7. **Errors**: Never expose internal details to client

### Security Patterns

```typescript
// ALWAYS do this for couple resources
const map = await db.maps.findOne({
  id: mapId,
  couple_id: coupleId  // NEVER skip this!
});

// ALWAYS validate input
const validated = createPinSchema.parse(req.body);

// ALWAYS hash passwords
const hash = await bcrypt.hash(password, 12);

// ALWAYS use parameterized queries
await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Security Middleware Stack

```typescript
app.use(helmet());           // Security headers
app.use(cors(corsOptions));  // CORS
app.use(rateLimiter);        // Rate limiting
app.use(validateInput);      // Input validation
app.use(authenticate);       // Auth check
app.use(ensureCoupleAccess); // Couple isolation
```

---

## Design Tokens

### Colors (Rose Garden Theme - Default)

```javascript
colors: {
  primary: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',  // Main
    600: '#E11D48',  // Darker
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  // Use stone for neutrals (warmer than gray)
  neutral: 'stone',
}
```

### Spacing/Sizing
- Buttons: `py-3 px-6` (comfortable touch targets)
- Cards: `p-6` or `p-8`
- Border radius: `rounded-2xl` or `rounded-3xl`
- Shadows: `shadow-lg shadow-rose-100/50`

### Typography
- Font: System font stack or Inter
- Headings: `font-bold`
- Body: `text-stone-700`
- Muted: `text-stone-500`

---

## API Patterns

### Response Format

```typescript
// Success
{
  "data": { ... }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { ... }
  }
}
```

### Authentication
- JWT in Authorization header: `Bearer <token>`
- Access token: 15 minutes
- Refresh token: 7 days (HTTP-only cookie or body)

---

## Socket Events Reference

```typescript
// Client -> Server
'join_map'       // Join a map room
'leave_map'      // Leave map room
'cursor_move'    // Cursor position
'pin_create'     // Create pin
'pin_update'     // Update pin
'pin_delete'     // Delete pin
'stroke_start'   // Start drawing
'stroke_update'  // Drawing points
'stroke_end'     // End drawing
'chat_message'   // Send message
'chat_typing'    // Typing indicator

// Server -> Client
'partner_joined' // Partner entered map
'partner_left'   // Partner left map
'partner_cursor' // Partner's cursor
'pin_created'    // New pin
'pin_updated'    // Pin changed
'pin_deleted'    // Pin removed
'stroke_*'       // Drawing events
'chat_received'  // New message
'partner_typing' // Partner typing
```

---

## Important Links

- [Implementation Plan](./docs/PLAN.md)
- [Checklist](./docs/CHECKLIST.md)
- [Features Spec](./docs/FEATURES.md)
- [API Reference](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Security Guide](./docs/SECURITY.md) **(READ THIS)**
- [Testing Guide](./docs/TESTING.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Config Guide](./docs/CONFIG.md)

---

## Dependencies to Install

### Client
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "socket.io-client": "^4.x",
    "zustand": "^4.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x"
  }
}
```

### Server
```json
{
  "dependencies": {
    "express": "^4.x",
    "socket.io": "^4.x",
    "pg": "^8.x",
    "redis": "^4.x",
    "bcrypt": "^5.x",
    "jsonwebtoken": "^9.x",
    "zod": "^3.x",
    "multer": "^1.x",
    "sharp": "^0.33.x",
    "helmet": "^7.x",
    "cors": "^2.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "@types/express": "^4.x",
    "@types/node": "^20.x",
    "@types/bcrypt": "^5.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/multer": "^1.x",
    "typescript": "^5.x",
    "tsx": "^4.x",
    "vitest": "^1.x",
    "supertest": "^6.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

---

## Blockers

<!-- Add blockers here as you encounter them -->

---

## Session Log

<!-- The agent should log progress here -->

### Session: 2026-01-24
- [x] Pin filtering by type, date, creator - PinFilters component
- [x] Drawing persistence to database - drawings service, API routes, frontend integration
- [x] Timeline view for pins - Timeline component with sorting/grouping
- [x] Pin clustering for performance - react-leaflet-cluster integration
- [x] Map zoom to fit all pins - FitBounds component
- [x] Drag to reposition pins - Draggable markers with API persistence
- All TypeScript checks pass
- All beads closed (28 total)
- PLAN.md updated: 102 completed, 46 remaining

### Session: 2026-01-28
- [x] Chat system - persistence (migration 011, chat service, API routes) + UI (ChatWindow, typing indicator, unread badge)
- [x] Reactions & Comments - API (reactions/comments services + routes) + UI (ReactionPicker, CommentThread in PinDetail)
- [x] Solo trip maps - server permission checks (ForbiddenError) + client restrictions + "I'm here!" geolocation pin + Solo Trip badge
- [x] Server tests - 49 tests (helpers, errors, validate, errorHandler, auth middleware) using vitest
- [x] Client tests - 38 tests (Avatar, Button, cn utility, pathSimplify) using vitest + happy-dom + @testing-library/react
- [x] Structured logging - pino with sensitive data redaction, replaced all console.log/error
- [x] Production Docker - multi-stage Dockerfiles for server + client, nginx.conf, docker-compose.prod.yml
- [x] Updated CHECKLIST.md and PLAN.md to reflect all completed work
- All beads closed (10 created, 10 closed)
- Total: 87 server tests + client tests passing
