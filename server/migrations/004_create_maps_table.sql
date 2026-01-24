-- Create maps table
CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'shared',
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
