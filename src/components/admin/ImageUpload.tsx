'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    currentImage?: string;
    label?: string;
}

export default function ImageUpload({ onUploadComplete, currentImage, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setProgress(10);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debes seleccionar una imagen para subir.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `blog/${fileName}`;

            setProgress(30);

            let { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setProgress(80);

            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            onUploadComplete(data.publicUrl);
            setProgress(100);

            setTimeout(() => setProgress(0), 1000);
        } catch (error: any) {
            alert('Error subiendo imagen: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const inputId = `image-input-${label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).substring(7)}`;

    return (
        <div className="space-y-4">
            {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>}

            <div className="relative group block">
                <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    title={`Subir ${label || 'imagen'}`}
                />

                <label htmlFor={inputId} className="cursor-pointer block">
                    <div className={`
                        relative w-full aspect-square md:aspect-video rounded-[32px] 
                        border-2 border-dashed transition-all duration-500
                        flex flex-col items-center justify-center overflow-hidden
                        ${uploading ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10'}
                    `}>
                        {currentImage && !uploading ? (
                            <>
                                <img
                                    src={currentImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-white">sync</span>
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Click para cambiar</span>
                                </div>
                            </>
                        ) : uploading ? (
                            <div className="text-center space-y-4 p-4 w-full">
                                <div className="text-[10px] font-black uppercase tracking-[4px] text-primary animate-pulse">
                                    Subiendo... {progress}%
                                </div>
                                <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 group-hover:scale-110 transition-transform duration-500">
                                <span className="material-symbols-outlined text-5xl text-white opacity-20 group-hover:opacity-100 group-hover:text-primary mb-4 transition-all">
                                    add_a_photo
                                </span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Seleccionar Imagen
                                </p>
                            </div>
                        )}
                    </div>
                </label>

                {currentImage && !uploading && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onUploadComplete('');
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-20"
                        title="Eliminar imagen"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                )}
            </div>

            {currentImage && !uploading && (
                <p className="text-[10px] text-center text-slate-400 font-medium">Click para cambiar imagen</p>
            )}
        </div>
    );
}
