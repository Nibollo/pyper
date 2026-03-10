-- Add timing and WhatsApp message columns to banners table
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS display_duration INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS appearance_frequency INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'He visto tu anuncio en pyper.com.py';

-- Update existing banners with defaults if needed
UPDATE banners 
SET 
  display_duration = COALESCE(display_duration, 8),
  appearance_frequency = COALESCE(appearance_frequency, 25),
  whatsapp_message = COALESCE(whatsapp_message, 'He visto tu anuncio en pyper.com.py');
