-- Create ads table
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    link_url TEXT,
    start_time TIME NOT NULL, -- Format: HH:MM:SS
    end_time TIME NOT NULL,   -- Format: HH:MM:SS
    is_active BOOLEAN DEFAULT true,
    days_of_week TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow anyone to read active ads
CREATE POLICY "Allow public read-only of ads" 
ON public.ads FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to perform all actions
-- Note: Assuming you have an admin role or specific email-based logic
CREATE POLICY "Allow all actions for authenticated users" 
ON public.ads FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
