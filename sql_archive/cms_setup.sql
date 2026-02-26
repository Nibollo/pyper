-- 1. Create cms_pages table
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Stores text or HTML content
    header_image TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Seed initial data for existing pages
INSERT INTO cms_pages (slug, title, content) VALUES
('sobre-nosotros', 'Sobre Nosotros', 'Transformando la educación en Paraguay a través de la innovación y el compromiso con la excelencia.'),
('terminos', 'Términos de Servicio', 'Al utilizar el sitio web de PYPER PARAGUAY, el usuario acepta de manera expresa y sin reservas todos los términos y condiciones aquí descritos.'),
('politicas', 'Políticas de Envío', 'Información sobre plazos de entrega, costos de envío y áreas de cobertura en todo el territorio nacional.'),
('ayuda', 'Centro de Ayuda', 'Encuentra respuestas a tus dudas sobre el uso de la plataforma, pedidos y servicios.'),
('faq', 'Preguntas Frecuentes', 'Respuestas rápidas a las consultas más comunes de nuestros clientes.'),
('sucursales', 'Sucursales', 'Visita nuestras tiendas físicas en los puntos estratégicos de Paraguay.'),
('empleo', 'Trabaja con Pyper', 'Únete a nuestro equipo y sé parte del futuro de la educación y tecnología en el país.')
ON CONFLICT (slug) DO NOTHING;

-- 3. Ensure Footer tables exist (re-running from supabase_setup.sql if needed)
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

-- 4. Seed Footer Columns
DO $$
DECLARE
    id_cia UUID;
    id_sop UUID;
BEGIN
    INSERT INTO footer_columns (title, "order") VALUES ('Compañía', 1) RETURNING id INTO id_cia;
    INSERT INTO footer_columns (title, "order") VALUES ('Soporte', 2) RETURNING id INTO id_sop;

    -- Seed links for Compañía
    INSERT INTO footer_links (column_id, label, link, "order") VALUES 
    (id_cia, 'Sobre Nosotros', '/sobre-nosotros', 1),
    (id_cia, 'Sucursales', '/sucursales', 2),
    (id_cia, 'Trabaja con Pyper', '/empleo', 3),
    (id_cia, 'Blog Educativo', '/blog', 4);

    -- Seed links for Soporte
    INSERT INTO footer_links (column_id, label, link, "order") VALUES 
    (id_sop, 'Centro de Ayuda', '/ayuda', 1),
    (id_sop, 'Preguntas Frecuentes', '/faq', 2),
    (id_sop, 'Términos de Servicio', '/terminos', 3),
    (id_sop, 'Políticas de Envío', '/politicas', 4);
END $$;
