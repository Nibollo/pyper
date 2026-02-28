-- Analytics Table to track page views and visitor sessions
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id UUID NOT NULL,
    session_id UUID NOT NULL,
    page_path TEXT NOT NULL,
    referrer TEXT,
    device_type TEXT,
    is_new_visitor BOOLEAN DEFAULT FALSE,
    is_new_session BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (since we track visitor page views from the client)
CREATE POLICY "Allow public insert to analytics" 
ON public.analytics FOR INSERT 
WITH CHECK (true);

-- Allow admins to view analytics
CREATE POLICY "Allow authenticated read to analytics" 
ON public.analytics FOR SELECT 
USING (auth.role() = 'authenticated');

-- Indices for performance
CREATE INDEX IF NOT EXISTS analytics_visitor_id_idx ON public.analytics(visitor_id);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON public.analytics(created_at);
CREATE INDEX IF NOT EXISTS analytics_page_path_idx ON public.analytics(page_path);

-- Commentary for the table
COMMENT ON TABLE public.analytics IS 'Stores anonymized page view and session data for business intelligence.';
