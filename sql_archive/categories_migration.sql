-- Migration to add category sections
-- We use 'categories' as category name in home_sections

-- Insert initial categories to match the design if they don't exist
INSERT INTO home_sections (title, description, icon, category, "order", active, bg_color)
VALUES 
('Librería', 'Desde lápices hasta arte profesional.', 'edit_note', 'categories', 0, true, '#f59e0b'),
('Tecnología', 'Equipos de alto rendimiento escolar.', 'laptop_mac', 'categories', 1, true, '#2563eb'),
('Kits Escolares', 'Personalizados según tu grado.', 'backpack', 'categories', 2, true, '#e11d48'),
('Servicios', 'Impresiones, soporte y más.', 'support_agent', 'categories', 3, true, '#059669')
ON CONFLICT DO NOTHING;

-- Add bg_color column to home_sections if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'home_sections' AND column_name = 'bg_color') THEN
        ALTER TABLE home_sections ADD COLUMN bg_color TEXT DEFAULT '#2563eb';
    END IF;
END $$;
