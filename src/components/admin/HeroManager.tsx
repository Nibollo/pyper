'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HeroSlide } from '@/types';
import ImageUpload from '@/components/ImageUpload';

export default function HeroManager() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('order', { ascending: true });

        if (data) setSlides(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingSlide) return;
        setSaving(true);

        const { error } = await supabase
            .from('hero_slides')
            .upsert(editingSlide);

        if (!error) {
            setEditingSlide(null);
            fetchSlides();
        } else {
            alert('Error al guardar: ' + error.message);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este banner?')) return;

        const { error } = await supabase
            .from('hero_slides')
            .delete()
            .eq('id', id);

        if (!error) fetchSlides();
    };

    const toggleActive = async (slide: HeroSlide) => {
        const { error } = await supabase
            .from('hero_slides')
            .update({ active: !slide.active })
            .eq('id', slide.id);

        if (!error) fetchSlides();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Banners del Hero</h3>
                <button
                    onClick={() => setEditingSlide({ title: '', subtitle: '', active: true, order: slides.length })}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nuevo Banner
                </button>
            </div>

            {loading ? (
                <p>Cargando banners...</p>
            ) : (
                <div className="grid gap-4">
                    {slides.map(slide => (
                        <div key={slide.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-12 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                                    {slide.image_url ? (
                                        <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-300">image</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{slide.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-1">{slide.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(slide)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${slide.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {slide.active ? 'Activo' : 'Inactivo'}
                                </button>
                                <button onClick={() => setEditingSlide(slide)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button onClick={() => handleDelete(slide.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingSlide && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h4 className="text-lg font-bold">Editar Banner</h4>
                            <button onClick={() => setEditingSlide(null)} className="material-symbols-outlined text-slate-400">close</button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Título Principal</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        value={editingSlide.title || ''}
                                        onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Subtítulo / Descripción</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-24"
                                        value={editingSlide.subtitle || ''}
                                        onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Texto del Badge (Arriba)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        placeholder="Ej: NUEVA TEMPORADA 2024"
                                        value={editingSlide.badge_text || ''}
                                        onChange={e => setEditingSlide({ ...editingSlide, badge_text: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Texto de Confianza (Abajo)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        placeholder="Ej: +5,000 alumnos"
                                        value={editingSlide.trust_text || ''}
                                        onChange={e => setEditingSlide({ ...editingSlide, trust_text: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Texto Botón 1</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        value={editingSlide.button_1_text || ''}
                                        onChange={e => setEditingSlide({ ...editingSlide, button_1_text: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Link Botón 1</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        value={editingSlide.button_1_link || ''}
                                        onChange={e => setEditingSlide({ ...editingSlide, button_1_link: e.target.value })}
                                    />
                                </div>
                            </div>

                            <ImageUpload
                                label="Imagen del Banner (Lado derecho)"
                                currentUrl={editingSlide.image_url}
                                onUpload={(url) => setEditingSlide({ ...editingSlide, image_url: url })}
                            />
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                            <button onClick={() => setEditingSlide(null)} className="px-6 py-2 font-bold text-slate-500">Cancelar</button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-primary text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Banner'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
