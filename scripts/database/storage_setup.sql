-- SCRIPT DE CONFIGURACIÓN DE STORAGE PARA PYPER -- MEJORADO
-- Ejecutar esto en el SQL Editor de tu Dashboard de Supabase

-- 1. Crear el bucket 'site-assets' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpiar políticas antiguas para evitar errores de "already exists"
DROP POLICY IF EXISTS "Acceso Público de Lectura" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida a todos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización a todos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir borrado a todos" ON storage.objects;

-- 3. Habilitar acceso de lectura público para el bucket 'site-assets'
CREATE POLICY "Acceso Público de Lectura"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- 4. Permitir subida (Para desarrollo)
CREATE POLICY "Permitir subida a todos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'site-assets' );

-- 5. Permitir actualizar y borrar
CREATE POLICY "Permitir actualización a todos"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'site-assets' );

CREATE POLICY "Permitir borrado a todos"
ON storage.objects FOR DELETE
USING ( bucket_id = 'site-assets' );
