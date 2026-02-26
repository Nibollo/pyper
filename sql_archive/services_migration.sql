-- 1. Agregar configuración para el encabezado e imagen de la sección de servicios
INSERT INTO site_settings (key, value, type) VALUES
('services_title', 'Mucho más que una Librería', 'text'),
('services_subtitle', 'Ofrecemos soluciones integrales para que solo te preocupes por aprender.', 'text'),
('services_image', '', 'text')
ON CONFLICT (key) DO NOTHING;

-- 2. Actualizar iconos de las secciones 'extras' para usar Material Symbols en lugar de emojis
UPDATE home_sections SET icon = 'build_circle' WHERE title = 'Servicio Técnico';
UPDATE home_sections SET icon = 'print' WHERE title = 'Impresión y Copias';
UPDATE home_sections SET icon = 'inventory_2' WHERE title = 'Kits Escolares';
UPDATE home_sections SET icon = 'school' WHERE title = 'Mayorista';
