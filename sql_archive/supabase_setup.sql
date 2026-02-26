
-- 1. Configuracion Global
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usar ON CONFLICT DO NOTHING para evitar errores si ya existen los datos
INSERT INTO site_settings (key, value, type) VALUES
('business_name', 'PYPER PARAGUAY', 'text'),
('business_slogan', 'Especialistas en soluciones educativas, útiles escolares y tecnología de vanguardia en Paraguay.', 'text'),
('address', 'Asunción, Paraguay', 'text'),
('phone', '+595 9XX XXX XXX', 'text'),
('whatsapp', '5959XXXXXXXX', 'text'),
('email', 'info@pyper.com.py', 'text'),
('opening_hours', 'Lun - Vie: 08:00 - 18:00', 'text'),
('footer_text', 'Tu librería moderna y centro de soluciones educativas. Calidad, compromiso y tecnología para tu educación.', 'text'),
('copyright', 'Pyper Paraguay. Todos los derechos reservados.', 'text'),
('meta_title', 'PYPER PARAGUAY - Librería y Tecnología Educativa', 'text'),
('meta_description', 'Especialistas en soluciones educativas, útiles escolares y tecnología de vanguardia en Paraguay.', 'text'),
('logo_header_text', 'PYPER', 'text'),
('logo_header_subtext', 'PARAGUAY', 'text')
ON CONFLICT (key) DO NOTHING;

-- 2. Navegación
CREATE TABLE IF NOT EXISTS navigation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    link TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO navigation_items (label, link, "order") VALUES
('Librería', '/libreria', 1),
('Tecnología', '/tecnologia', 2),
('Kits Escolares', '/kits', 3),
('Servicios', '/servicios', 4),
('Institucional', '/institucional', 5)
ON CONFLICT DO NOTHING;

-- 3. Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    button_1_text TEXT,
    button_1_link TEXT,
    button_2_text TEXT,
    button_2_link TEXT,
    image_url TEXT,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO hero_slides (title, subtitle, button_1_text, button_1_link, button_2_text, button_2_link) VALUES
('Todo para tu educación en un solo lugar', 'Desde útiles escolares básicos hasta la tecnología educativa más avanzada. Todo lo que necesitas para aprender y crecer.', 'Ver Librería', '/libreria', 'Ver Tecnología', '/tecnologia')
ON CONFLICT DO NOTHING;

-- 4. Secciones del Home
CREATE TABLE IF NOT EXISTS home_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    icon TEXT,
    description TEXT,
    link TEXT,
    category TEXT, -- 'soluciones' o 'extras'
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO home_sections (title, subtitle, icon, description, link, category, "order") VALUES
('Librería y Útiles', 'Explora nuestras principales categorías', '📓', 'Todo en papelería, mochilas y materiales para todos los niveles escolares.', '/libreria', 'soluciones', 1),
('Tecnología Educativa', 'Explora nuestras principales categorías', '💻', 'Notebooks, impresoras y accesorios diseñados para estudiar mejor.', '/tecnologia', 'soluciones', 2),
('Servicio Técnico', NULL, '🛠️', 'Mantenimiento y reparación de equipos informáticos.', '/servicios', 'extras', 3),
('Impresión y Copias', NULL, '🖨️', 'Calidad profesional para tus trabajos y proyectos.', '/servicios', 'extras', 4),
('Kits Escolares', NULL, '📦', 'Armado dinámico de kits según el grado o colegio.', '/kits', 'extras', 5),
('Mayorista', NULL, '🏫', 'Presupuestos y convenios exclusivos para instituciones.', '/institucional', 'extras', 6)
ON CONFLICT DO NOTHING;

-- 5. Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
    feature_name TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO feature_flags (feature_name, enabled) VALUES
('hero_slider', true),
('home_solutions', true),
('home_services', true),
('trust_banner', true)
ON CONFLICT (feature_name) DO NOTHING;

-- 6. Footer Columns y Links
CREATE TABLE IF NOT EXISTS footer_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS footer_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID REFERENCES footer_columns(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    link TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);
