import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    console.error('❌ Error: Variables de entorno no configuradas correctamente en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    console.log('--- CREANDO USUARIO ADMINISTRADOR ---');

    const email = 'admin@pyper.com.py';
    const password = 'admin'; // Contraseña temporal

    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true // Confirmar automáticamente
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ El usuario admin@pyper.com.py ya existe.');

            // Intentar actualizar la contraseña por si acaso
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id || '',
                { password: password }
            );

            if (updateError) console.error('❌ Error actualizando contraseña:', updateError.message);
            else console.log('🔄 Contraseña reseteada a: admin');
        } else {
            console.error('❌ Error creando usuario:', error.message);
        }
    } else {
        console.log('✨ Usuario creado exitosamente!');
        console.log('📧 Email:', email);
        console.log('🔑 Contraseña temporal:', password);
    }

    console.log('\n--- PROCESO FINALIZADO ---');
    console.log('Ya puedes intentar iniciar sesión en el panel.');
}

createAdmin();
