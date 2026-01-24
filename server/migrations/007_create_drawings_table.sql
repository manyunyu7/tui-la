-- Create drawings table
CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_data JSONB NOT NULL,
    bounds JSONB,
    stroke_color VARCHAR(20) DEFAULT '#E11D48',
    stroke_width INTEGER DEFAULT 3,
    opacity DECIMAL(3, 2) DEFAULT 1.0,
    layer_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_drawings_map_id ON drawings(map_id);
