-- 1. Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content JSONB NOT NULL DEFAULT '[]', -- Section-based content
    cover_image TEXT,
    category TEXT DEFAULT 'General',
    author TEXT DEFAULT 'Admin',
    published_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    active BOOLEAN DEFAULT true,
    
    -- SEO Fields
    meta_title TEXT,
    meta_description TEXT,
    focus_keyword TEXT,
    seo_score INTEGER DEFAULT 0,
    seo_results JSONB DEFAULT '{}'
);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_active_published_idx ON blogs(active, published_at DESC);

-- 3. Initial Demo Post
INSERT INTO blogs (slug, title, excerpt, content, focus_keyword, meta_title, meta_description)
VALUES (
    'futuro-educacion-paraguay',
    'El Futuro de la Educación en Paraguay',
    'Exploramos cómo la tecnología y la innovación están transformando las aulas paraguayas.',
    '[
        {
            "id": "b1",
            "type": "hero",
            "title": "El Futuro de la Educación",
            "subtitle": "Tecnología, Innovación y Compromiso",
            "theme": "dark"
        },
        {
            "id": "b2",
            "type": "rich-text",
            "body": "La educación en Paraguay está atravesando una transformación sin precedentes. La integración de herramientas digitales y el acceso a kits escolares inteligentes están nivelando el campo de juego para miles de estudiantes.\n\nEn este artículo analizamos las tendencias clave para el 2026...",
            "icon": "school"
        }
    ]',
    'educación en Paraguay',
    'El Futuro de la Educación en Paraguay | Blog Pyper',
    'Descubre cómo la tecnología está cambiando el panorama educativo en Paraguay y qué herramientas son fundamentales para el éxito escolar.'
) ON CONFLICT DO NOTHING;
