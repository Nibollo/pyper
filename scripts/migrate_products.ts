import { supabase } from '../src/lib/supabase';

const LIBRERIA_PRODUCTS = [
    { name: 'Cuaderno Universitario 100 Hojas', price: 15000, category: 'Cuadernos', stock: 100 },
    { name: 'Mochila Ergonómica Primaria', price: 185000, category: 'Mochilas', stock: 50 },
    { name: 'Kit Escolar 1er Grado (Completo)', price: 250000, category: 'Kits escolares', stock: 30 },
    { name: 'Caja de Lápices de Colores x24', price: 35000, category: 'Útiles escolares', stock: 80 },
    { name: 'Diccionario Castellano Ilustrado', price: 45000, category: 'Libros escolares', stock: 40 },
    { name: 'Carpeta A4 Tapa Dura', price: 22000, category: 'Papelería', stock: 120 },
];

const TECH_PRODUCTS = [
    { name: 'Notebook Lenovo IdeaPad 3', price: 3500000, category: 'Notebooks', stock: 10 },
    { name: 'Impresora HP DeskJet Ink Advantage', price: 750000, category: 'Impresoras', stock: 15 },
    { name: 'Mouse Inalámbrico Ergonómico Logitech', price: 120000, category: 'Accesorios', stock: 40 },
    { name: 'Licencia Microsoft Office Home & Student', price: 450000, category: 'Licencias originales', stock: 100 },
    { name: 'Cartucho de Tinta HP 667 Negro', price: 95000, category: 'Insumos informáticos', stock: 60 },
    { name: 'Servicio de Mantenimiento Preventivo', price: 150000, category: 'Servicio técnico', stock: 999 },
];

async function migrate() {
    console.log('--- MIGRACIÓN INICIADA ---');

    const allProducts = [...LIBRERIA_PRODUCTS, ...TECH_PRODUCTS];

    for (const p of allProducts) {
        console.log(`Migrando: ${p.name}...`);
        const { error } = await supabase.from('products').insert([p]);
        if (error) {
            console.error(`Error migrando ${p.name}:`, error.message);
        } else {
            console.log(`✅ ${p.name} migrado con éxito.`);
        }
    }

    console.log('--- MIGRACIÓN FINALIZADA ---');
}

migrate();
