-- Add placement and always_active fields to ads table
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS placement TEXT DEFAULT 'home_top',
ADD COLUMN IF NOT EXISTS always_active BOOLEAN DEFAULT false;

-- Comment for the user
-- Run this if you already created the table, otherwise the migration 013 already has the basic structure.
