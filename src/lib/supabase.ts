import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Valida si la URL es válida para prevenir el error de "Invalid supabaseUrl"
const isValidUrl = supabaseUrl.startsWith('http');
const finalUrl = isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co';

export const supabase = createClient(finalUrl, supabaseAnonKey);
