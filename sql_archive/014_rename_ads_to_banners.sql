-- Rename table ads to banners to avoid ad-blockers blocking requests
ALTER TABLE IF EXISTS public.ads RENAME TO banners;

-- Ensure all columns are present (in case the user hasn't run previous migrations)
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS placement TEXT DEFAULT 'home_top',
ADD COLUMN IF NOT EXISTS always_active BOOLEAN DEFAULT false;
