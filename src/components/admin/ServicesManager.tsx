'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HomeSection } from '@/types';
import { useConfig } from '@/context/ConfigContext';
import ImageUpload from '@/components/ImageUpload';

export default function ServicesManager() {
    const { settings, refreshConfig } = useConfig();
    const [extras, setExtras] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<HomeSection> | null>(null);
    const [imageUploading, setImageUploading] = useState(false);

    // Header settings
    const [headerSettings, setHeaderSettings] = useState({
        services_title: '',
        services_subtitle: '',
        services_image: ''
    });

    useEffect(() => {
        fetchExtras();
        if (settings) {
            setHeaderSettings({
                services_title: settings.services_title || 'Mucho más que una Librería',
                services_subtitle: settings.services_subtitle || 'Ofrecemos soluciones integrales para que solo te preocupes por aprender.',
                services_image: settings.services_image || ''
            });
        }
    }, [settings]);

    const fetchExtras = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('home_sections')
            .select('*')
            .eq('category', 'extras')
            .order('order', { ascending: true });

        if (data) setExtras(data);
        setLoading(false);
    };

    const handleSaveHeader = async () => {
        setSaving(true);
        try {
            const updates = Object.entries(headerSettings).map(([key, value]) => ({
                key,
                value: value || '', // Asegurar que no sea nulo
                type: 'text'
            }));

            const { error } = await supabase.from('site_settings').upsert(updates);
            if (error) throw error;

            await refreshConfig();
            alert('¡Configuración de la sección actualizada correctamente!');
        } catch (error: any) {
            console.error('Error saving services header:', error);
            alert('Error al guardar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveItem = async () => {
        if (!editingItem) return;
        setSaving(true);

        const { error } = await supabase
            .from('home_sections')
            .upsert({ ...editingItem, category: 'extras' });

        if (!error) {
            setEditingItem(null);
            fetchExtras();
        } else {
            alert('Error al guardar: ' + error.message);
        }
        setSaving(false);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
        const { error } = await supabase.from('home_sections').delete().eq('id', id);
        if (!error) fetchExtras();
    };

    return (
        <div className="space-y-10">
            {/* Header & Image */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    Encabezado e Imagen Lateral
                </h3>
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">Título de la Sección</label>
                            <input
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                value={headerSettings.services_title}
                                onChange={e => setHeaderSettings({ ...headerSettings, services_title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">Descripción / Subtítulo</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-24"
                                value={headerSettings.services_subtitle}
                                onChange={e => setHeaderSettings({ ...headerSettings, services_subtitle: e.target.value })}
                            />
                        </div>
                        <button
                            onClick={handleSaveHeader}
                            disabled={saving || imageUploading}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : imageUploading ? 'Subiendo Imagen...' : 'Guardar Encabezado e Imagen'}
                        </button>
                    </div>
                    <div>
                        <ImageUpload
                            label="Imagen Lateral (Izquierda)"
                            currentUrl={headerSettings.services_image}
                            onUploadStart={() => setImageUploading(true)}
                            onUpload={(url) => {
                                setHeaderSettings({ ...headerSettings, services_image: url });
                                setImageUploading(false);
                            }}
                        />
                        <p className="text-[10px] text-slate-400 mt-2 italic">Recomendado: Imagen con fondo transparente o estilo collage.</p>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Services List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">list_alt</span>
                        Lista de Servicios
                    </h3>
                    <button
                        onClick={() => setEditingItem({ title: '', description: '', icon: 'star', order: extras.length, active: true })}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nuevo Servicio
                    </button>
                </div>

                {loading ? (
                    <p>Cargando servicios...</p>
                ) : (
                    <div className="grid gap-3">
                        {extras.map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditingItem(item)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Item Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="text-lg font-bold">Editar Servicio</h4>
                            <button onClick={() => setEditingItem(null)} className="material-symbols-outlined text-slate-400">close</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Título</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        value={editingItem.title || ''}
                                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Icono (Material Symbol)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        placeholder="Ej: print, construction, rocket"
                                        value={editingItem.icon || ''}
                                        onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Descripción</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-24"
                                    value={editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setEditingItem(null)} className="px-6 py-2 font-bold text-slate-500">Cancelar</button>
                            <button
                                onClick={handleSaveItem}
                                disabled={saving}
                                className="bg-primary text-white px-8 py-2 rounded-xl font-bold disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Servicio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
