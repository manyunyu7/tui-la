# Twy (tui-la)

A real-time collaborative map application for couples to create, share, and preserve their memories together.

> **Repository**: [github.com/manyunyu7/tui-la](https://github.com/manyunyu7/tui-la)
> **App name**: Configurable via `APP_NAME` env variable (currently "Twy")

## Features

- **Interactive Map** - OpenStreetMap-based with pins, drawings, and photos
- **Real-time Sync** - See your partner's actions live via WebSocket
- **Memory Pins** - Mark special places with photos, notes, and dates
- **Collaborative Drawing** - Doodle on the map together
- **Multiple Maps** - Create themed collections (trips, dates, wishlist)
- **Solo Trip Mode** - Share your journey with your partner
- **Romantic Themes** - Customizable color schemes
- **Self-Hosted** - No third-party dependencies, full data ownership

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Map | Leaflet.js + OpenStreetMap |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| Database | PostgreSQL + PostGIS |
| Cache | Redis |
| File Storage | Local filesystem |
| Containerization | Docker + Docker Compose |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd love_map

# Copy environment files
cp .env.example .env

# Start database services
docker-compose up -d postgres redis

# Install dependencies
cd server && npm install
cd ../client && npm install

# Run database migrations
cd ../server && npm run db:migrate

# Start development servers (in separate terminals)
cd server && npm run dev
cd client && npm run dev
```

### Production Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d
```

## Project Structure

```
love_map/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & socket services
│   │   └── utils/          # Utility functions
│   └── ...
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # WebSocket handlers
│   │   └── utils/          # Utility functions
│   └── uploads/            # File storage
├── docs/                   # Documentation
├── docker/                 # Docker configurations
└── docker-compose.yml
```

## Documentation

- [Implementation Plan](./docs/PLAN.md)
- [Checklist](./docs/CHECKLIST.md)
- [Database Schema](./docs/DATABASE.md)
- [API Reference](./docs/API.md)
- [Testing Guide](./docs/TESTING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## UI Design

Duolingo-inspired design with:
- Rounded corners and chunky buttons
- Playful, friendly typography
- Romantic color palette (customizable)
- Smooth micro-interactions
- Partner presence indicators

### Default Theme (Rose Garden)

```
Primary:    #E11D48 (rose-600)
Secondary:  #FB7185 (rose-400)
Accent:     #831843 (rose-900)
Background: #FFF1F2 (rose-50)
Surface:    #FFFFFF
Text:       #44403C (stone-700)
```

## License

Private - All rights reserved
