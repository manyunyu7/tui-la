# Database Schema

## Overview

Love Map uses PostgreSQL with the PostGIS extension for spatial data handling.

---

## Tables

### users

Stores user account information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_path VARCHAR(500),
    role VARCHAR(20) DEFAULT 'partner', -- partner_1, partner_2
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_couple_id ON users(couple_id);
```

### couples

Stores couple relationship data.

```sql
CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    anniversary_date DATE,
    theme JSONB DEFAULT '{"name": "rose_garden", "primary": "#E11D48"}',
    settings JSONB DEFAULT '{}',
    paired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_couples_invite_code ON couples(invite_code);
```

### maps

Stores map collections.

```sql
CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL, -- for solo maps
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'shared', -- shared, solo_trip, memory_collection
    cover_path VARCHAR(500),
    center_lat DECIMAL(10, 8) DEFAULT 0,
    center_lng DECIMAL(11, 8) DEFAULT 0,
    zoom_level INTEGER DEFAULT 10,
    is_archived BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_maps_couple_id ON maps(couple_id);
CREATE INDEX idx_maps_type ON maps(type);
```

### pins

Stores map markers/pins.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326), -- PostGIS spatial column
    pin_type VARCHAR(50) DEFAULT 'memory', -- memory, wishlist, milestone, trip
    icon VARCHAR(50) DEFAULT '📍', -- emoji or icon name
    color VARCHAR(20) DEFAULT '#E11D48',
    memory_date DATE,
    is_private BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_pins_map_id ON pins(map_id);
CREATE INDEX idx_pins_created_by ON pins(created_by);
CREATE INDEX idx_pins_location ON pins USING GIST(location);
CREATE INDEX idx_pins_memory_date ON pins(memory_date);
```

### pin_media

Stores media attached to pins.

```sql
CREATE TABLE pin_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- image, audio, video
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    original_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- for audio/video
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pin_media_pin_id ON pin_media(pin_id);
```

### drawings

Stores freehand drawings on maps.

```sql
CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_data JSONB NOT NULL, -- [{x, y}, ...] or SVG path
    bounds JSONB, -- {minLat, maxLat, minLng, maxLng}
    stroke_color VARCHAR(20) DEFAULT '#E11D48',
    stroke_width INTEGER DEFAULT 3,
    opacity DECIMAL(3, 2) DEFAULT 1.0,
    layer_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_drawings_map_id ON drawings(map_id);
```

### reactions

Stores reactions on pins.

```sql
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_id UUID REFERENCES pins(id) ON DELETE CASCADE,
    drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- emoji code: heart, kiss, miss_you, etc.
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT one_target CHECK (
        (pin_id IS NOT NULL AND drawing_id IS NULL) OR
        (pin_id IS NULL AND drawing_id IS NOT NULL)
    ),
    CONSTRAINT unique_reaction UNIQUE (pin_id, user_id, type)
);

CREATE INDEX idx_reactions_pin_id ON reactions(pin_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
```

### comments

Stores comments on pins.

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_pin_id ON comments(pin_id);
```

### refresh_tokens

Stores refresh tokens for auth.

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

---

## Migrations

### Migration Naming Convention

```
{timestamp}_{action}_{table}.sql

Examples:
20240124_001_create_users_table.sql
20240124_002_create_couples_table.sql
20240124_003_add_avatar_to_users.sql
```

### Running Migrations

```bash
# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Create new migration
npm run db:create-migration create_maps_table
```

---

## Spatial Queries

### Find pins within radius

```sql
SELECT * FROM pins
WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
    $radius_meters
);
```

### Find pins within bounding box

```sql
SELECT * FROM pins
WHERE lat BETWEEN $min_lat AND $max_lat
  AND lng BETWEEN $min_lng AND $max_lng;
```

---

## JSON Schema Examples

### Couple Theme

```json
{
  "name": "rose_garden",
  "primary": "#E11D48",
  "secondary": "#FB7185",
  "accent": "#831843",
  "background": "#FFF1F2"
}
```

### Drawing Path Data

```json
{
  "points": [
    {"x": 51.505, "y": -0.09},
    {"x": 51.506, "y": -0.08}
  ],
  "bounds": {
    "north": 51.51,
    "south": 51.50,
    "east": -0.08,
    "west": -0.10
  }
}
```

### Pin Metadata

```json
{
  "weather": "sunny",
  "mood": "happy",
  "song": "Our Song - Taylor Swift",
  "tags": ["first_date", "restaurant"]
}
```

---

## Backup Strategy

```bash
# Daily backup
pg_dump -Fc love_map > backup_$(date +%Y%m%d).dump

# Restore
pg_restore -d love_map backup_20240124.dump
```
