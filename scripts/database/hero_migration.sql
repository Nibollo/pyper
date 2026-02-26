-- 1. Actualizar la tabla hero_slides con los nuevos campos
ALTER TABLE IF EXISTS hero_slides 
ADD COLUMN IF NOT EXISTS badge_text TEXT,
ADD COLUMN IF NOT EXISTS trust_text TEXT,
ADD COLUMN IF NOT EXISTS trust_images JSONB;

-- 2. Actualizar el registro inicial con el contenido de alta fidelidad
UPDATE hero_slides 
SET 
    title = 'Todo para tu educación en un solo lugar',
    subtitle = 'Desde útiles escolares básicos hasta la tecnología educativa más avanzada. Todo lo que necesitas para aprender y crecer.',
    button_1_text = 'Ver Librería',
    button_1_link = '/libreria',
    button_2_text = 'Ver Tecnología',
    button_2_link = '/tecnologia',
    badge_text = 'NUEVA TEMPORADA ESCOLAR 2024',
    trust_text = '+5,000 estudiantes confían en nosotros',
    active = true
WHERE title LIKE '%Todo para tu educación%';
