-- 016_create_stores_table.sql
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    whatsapp TEXT,
    lat FLOAT,
    lng FLOAT,
    image_url TEXT,
    schedule TEXT,
    phone TEXT,
    email TEXT,
    city TEXT,
    country TEXT DEFAULT 'Paraguay',
    category TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on stores" 
ON stores FOR SELECT 
USING (active = true);

-- Create policy for admin full access (assuming authenticated users are admins for simplicity in this dev environment, 
-- but normally you'd check a role or use a service role)
CREATE POLICY "Allow authenticated full access on stores" 
ON stores FOR ALL 
USING (auth.role() = 'authenticated');
