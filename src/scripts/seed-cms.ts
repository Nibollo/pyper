
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const pages = [
    { title: 'Sobre Nosotros', slug: 'sobre-nosotros', column: 'Compañía', type: 'dynamic' },
    { title: 'Sucursales', slug: 'sucursales', column: 'Compañía', type: 'dynamic' },
    { title: 'Trabaja con Pyper', slug: 'empleo', column: 'Compañía', type: 'dynamic' },
    { title: 'Blog Educativo', slug: 'blog', column: 'Compañía', type: 'static' },
    { title: 'Centro de Ayuda', slug: 'ayuda', column: 'Soporte', type: 'dynamic' },
    { title: 'Preguntas Frecuentes', slug: 'faq', column: 'Soporte', type: 'dynamic' },
    { title: 'Términos de Servicio', slug: 'terminos', column: 'Soporte', type: 'dynamic' },
    { title: 'Políticas de Envío', slug: 'politicas', column: 'Soporte', type: 'dynamic' },
];

async function seed() {
    console.log('Starting CMS pages seeding & restoration...');

    // 1. Seed CMS Pages (Only dynamic ones)
    for (const page of pages.filter(p => p.type === 'dynamic')) {
        const { data: existing } = await supabase
            .from('cms_pages')
            .select('*')
            .eq('slug', page.slug)
            .maybeSingle();

        let hasContent = false;
        try {
            hasContent = existing && existing.content && JSON.parse(existing.content).length > 0;
        } catch (e) {
            hasContent = false;
        }

        if (existing && hasContent) {
            console.log(`Page "${page.title}" already exists with content.`);
        } else {
            console.log(`${existing ? 'Restoring' : 'Creating'} page "${page.title}"...`);
            const initialContent = [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'hero',
                    title: page.title,
                    subtitle: `Bienvenido a la sección de ${page.title}.`,
                    theme: 'dark'
                },
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'rich-text',
                    title: 'Información Próximamente',
                    body: 'Muy pronto encontrarás aquí todo el contenido detallado de esta sección.',
                    icon: 'info',
                    imagePosition: 'right'
                }
            ];

            const { error } = await supabase
                .from('cms_pages')
                .upsert({
                    id: existing?.id,
                    title: page.title,
                    slug: page.slug,
                    content: JSON.stringify(initialContent),
                    active: true,
                    updated_at: new Date().toISOString()
                });

            if (error) console.error(`Error with "${page.title}":`, error.message);
        }
    }

    // 2. Ensure Footer Columns
    const columns = ['Compañía', 'Soporte'];
    for (let i = 0; i < columns.length; i++) {
        const colTitle = columns[i];
        let { data: col } = await supabase.from('footer_columns').select('*').eq('title', colTitle).maybeSingle();

        if (!col) {
            console.log(`Creating column "${colTitle}"...`);
            const { data: newCol, error } = await supabase.from('footer_columns').insert({ title: colTitle, order: i }).select().single();
            if (error) console.error(`Error column "${colTitle}":`, error.message);
            col = newCol;
        }

        // 3. Ensure links for this column
        const columnLinks = pages.filter(p => p.column === colTitle);
        for (const link of columnLinks) {
            const { data: existingLink } = await supabase
                .from('footer_links')
                .select('*')
                .eq('column_id', col.id)
                .eq('label', link.title)
                .maybeSingle();

            if (!existingLink) {
                console.log(`Creating link "${link.title}" in "${colTitle}"...`);
                await supabase.from('footer_links').insert({
                    column_id: col.id,
                    label: link.title,
                    link: `/${link.slug}`
                });
            }
        }
    }

    console.log('Seeding finished!');
}

seed();
