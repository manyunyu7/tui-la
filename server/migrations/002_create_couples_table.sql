-- Create couples table
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
