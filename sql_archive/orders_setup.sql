
-- 1. Orders table for both store and institutional requests
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    institution_name TEXT, -- For institutional requests
    request_type TEXT DEFAULT 'Venta Minorista', -- 'Venta Minorista', 'Venta Mayorista', 'Kits Escolares por Grado', 'Convenio Educativo'
    items JSONB DEFAULT '[]'::jsonb, -- Store orders items
    total_amount DECIMAL(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, En Proceso, Completado
    message TEXT, -- For institutional requests
    active BOOLEAN DEFAULT true
);

-- 2. Initial data for testing
INSERT INTO orders (customer_name, total_amount, status, request_type, items) VALUES
('Carlos Mendoza', 150000, 'Pendiente', 'Venta Minorista', '[{"name": "Cuaderno", "quantity": 2}, {"name": "Lápices", "quantity": 1}]'::jsonb),
('María González', 45000, 'Completado', 'Venta Minorista', '[{"name": "Carpeta", "quantity": 1}]'::jsonb),
('Colegio Santa Ana', 2500000, 'En Proceso', 'Kits Escolares por Grado', '[{"name": "Kit 1er Grado", "quantity": 10}]'::jsonb)
ON CONFLICT DO NOTHING;
