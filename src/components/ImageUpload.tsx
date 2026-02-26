'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    onUploadStart?: () => void;
    currentUrl?: string;
    bucket?: string;
    label?: string;
}

export default function ImageUpload({ onUpload, onUploadStart, currentUrl, bucket = 'site-assets', label = 'Imagen' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (onUploadStart) onUploadStart();
            console.log('--- Iniciando Subida de Imagen ---');

            // Check session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error('No hay sesión activa en Supabase');
                throw new Error('No tienes una sesión activa. Por favor, asegúrate de haber iniciado sesión correctamente (no modo mock) para subir archivos.');
            }

            // Check if Supabase URL is still the placeholder
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
                throw new Error('Debes configurar NEXT_PUBLIC_SUPABASE_URL en tu archivo .env.local para que la subida funcione.');
            }

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debes seleccionar una imagen para subir.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            console.log('Subiendo archivo:', file.name, 'como', filePath, 'al bucket:', bucket);

            // Attempt upload
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error de Supabase Storage:', uploadError);
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error(`El bucket "${bucket}" no existe. Debes crearlo en Supabase Storage y hacerlo público.`);
                }
                throw uploadError;
            }

            console.log('Subida exitosa:', uploadData);

            // Get public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            console.log('URL pública generada:', data.publicUrl);
            onUpload(data.publicUrl);
        } catch (error: any) {
            console.error('Upload error detail:', error);
            alert('Error subiendo imagen: ' + (error.message || 'Error desconocido'));
        } finally {
            setUploading(false);
            console.log('--- Fin del Proceso de Subida ---');
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
            <div className="flex items-center gap-4">
                {currentUrl && (
                    <div className="relative w-16 h-16 border rounded bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={currentUrl} alt="Preview" className="object-contain w-full h-full" />
                    </div>
                )}
                <div className="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        title={label}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary file:text-white
                            hover:file:bg-primary/90
                            disabled:opacity-50 cursor-pointer"
                    />
                    {uploading && <p className="text-xs text-primary mt-1 animate-pulse font-medium">Subiendo archivo...</p>}
                </div>
            </div>
        </div>
    );
}
