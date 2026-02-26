-- 1. Crear tabla de productos si no existe
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    category TEXT,
    is_featured_home BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar los 3 kits destacados iniciales (según diseño)
INSERT INTO products (name, description, price, is_featured_home, category) VALUES
('Kit Primaria Premium', 'Todo lo necesario para 1er a 6to grado.', 450000, true, 'Kits'),
('Kit Tech Secundaria', 'Incluye tablet y periféricos básicos.', 1250000, true, 'Kits'),
('Kit Universitario', 'Cuadernos inteligentes y resaltadores.', 320000, true, 'Kits')
ON CONFLICT DO NOTHING;

-- 3. Agregar configuración para el título y subtítulo de la sección
INSERT INTO site_settings (key, value, type) VALUES
('featured_kits_title', 'KITS ESCOLARES DESTACADOS', 'text'),
('featured_kits_subtitle', 'SELECCIÓN ESPECIAL', 'text'),
('featured_kits_button_text', 'Ver todos los kits', 'text'),
('featured_kits_button_link', '/kits', 'text')
ON CONFLICT (key) DO NOTHING;
