-- Create pins table
CREATE TABLE pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    pin_type VARCHAR(50) DEFAULT 'memory',
    icon VARCHAR(50) DEFAULT '📍',
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
