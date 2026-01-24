-- Create reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_id UUID REFERENCES pins(id) ON DELETE CASCADE,
    drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT one_target CHECK (
        (pin_id IS NOT NULL AND drawing_id IS NULL) OR
        (pin_id IS NULL AND drawing_id IS NOT NULL)
    ),
    CONSTRAINT unique_reaction UNIQUE (pin_id, user_id, type)
);

CREATE INDEX idx_reactions_pin_id ON reactions(pin_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
