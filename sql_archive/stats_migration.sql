-- Migration to add trust/stats markers
-- Ensures table existence and proper schema

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS home_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    icon TEXT,
    description TEXT,
    link TEXT,
    category TEXT,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add bg_color column if it doesn't exist (needed for other sections but good to have here)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'home_sections' AND column_name = 'bg_color') THEN
        ALTER TABLE home_sections ADD COLUMN bg_color TEXT DEFAULT '#2563eb';
    END IF;
END $$;

-- 3. Insert initial stats
INSERT INTO home_sections (title, description, icon, category, "order", active)
VALUES 
('15k+', 'Clientes Felices', 'person', 'stats', 0, true),
('120', 'Colegios Aliados', 'school', 'stats', 1, true),
('24h', 'Delivery Express', 'local_shipping', 'stats', 2, true),
('100%', 'Garantía Real', 'verified', 'stats', 3, true)
ON CONFLICT DO NOTHING;
