import { supabase } from '../src/lib/supabase';

async function setup() {
    console.log('--- SETUP DINÁMICO INICIADO ---');

    console.log('Insertando Site Settings...');
    const settings = [
        { key: 'business_name', value: 'PYPER PARAGUAY' },
        { key: 'business_slogan', value: 'Especialistas en soluciones educativas, útiles escolares y tecnología de vanguardia en Paraguay.' },
        { key: 'address', value: 'Asunción, Paraguay' },
        { key: 'phone', value: '+595 9XX XXX XXX' },
        { key: 'whatsapp', value: '5959XXXXXXXX' },
        { key: 'email', value: 'info@pyper.com.py' },
        { key: 'opening_hours', value: 'Lun - Vie: 08:00 - 18:00' },
        { key: 'footer_text', value: 'Tu librería moderna y centro de soluciones educativas. Calidad, compromiso y tecnología para tu educación.' },
        { key: 'copyright', value: 'Pyper Paraguay. Todos los derechos reservados.' },
        { key: 'meta_title', value: 'PYPER PARAGUAY - Librería y Tecnología Educativa' },
        { key: 'meta_description', value: 'Especialistas en soluciones educativas, útiles escolares y tecnología de vanguardia en Paraguay.' },
        { key: 'logo_header_text', value: 'PYPER' },
        { key: 'logo_header_subtext', value: 'PARAGUAY' }
    ];

    for (const s of settings) {
        await supabase.from('site_settings').upsert(s);
    }

    console.log('--- SETUP DINÁMICO FINALIZADO ---');
}

setup();
