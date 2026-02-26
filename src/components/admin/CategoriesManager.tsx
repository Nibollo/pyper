'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HomeSection } from '@/types';
import { useConfig } from '@/context/ConfigContext';

export default function CategoriesManager() {
    const { refreshConfig } = useConfig();
    const [categories, setCategories] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<HomeSection> | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('home_sections')
            .select('*')
            .eq('category', 'categories')
            .order('order', { ascending: true });

        if (data) setCategories(data);
        setLoading(false);
    };

    const handleSaveItem = async () => {
        if (!editingItem) return;
        setSaving(true);

        const { error } = await supabase
            .from('home_sections')
            .upsert({ ...editingItem, category: 'categories' });

        if (!error) {
            setEditingItem(null);
            fetchCategories();
            refreshConfig();
            alert('¡Categoría guardada correctamente!');
        } else {
            console.error('Error saving category:', error);
            alert('Error al guardar: ' + error.message);
        }
        setSaving(false);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
        const { error } = await supabase.from('home_sections').delete().eq('id', id);
        if (!error) {
            fetchCategories();
            refreshConfig();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">grid_view</span>
                    Explora por Categorías
                </h3>
                <button
                    onClick={() => setEditingItem({
                        title: '',
                        description: '',
                        icon: 'category',
                        order: categories.length,
                        active: true,
                        bg_color: '#2563eb',
                        link: '/libreria'
                    })}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nueva Categoría
                </button>
            </div>

            {loading ? (
                <p>Cargando categorías...</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map(item => (
                        <div
                            key={item.id}
                            className="p-6 rounded-2xl text-white flex flex-col justify-between h-48 relative overflow-hidden group shadow-lg"
                            style={{ backgroundColor: item.bg_color || '#2563eb' }}
                        >
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{item.title}</h4>
                                <p className="text-xs text-white/80 line-clamp-2">{item.description}</p>
                            </div>

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm"
                                    title="Editar"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1.5 bg-red-500/50 hover:bg-red-500/80 rounded-lg backdrop-blur-sm"
                                    title="Eliminar"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Item Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="text-lg font-bold">Editar Categoría</h4>
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
                                        placeholder="Ej: edit_note, backpack"
                                        value={editingItem.icon || ''}
                                        onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Color de Fondo (HEX)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="w-12 h-12 p-1 bg-slate-50 border-none rounded-xl cursor-pointer"
                                            value={editingItem.bg_color || '#2563eb'}
                                            onChange={e => setEditingItem({ ...editingItem, bg_color: e.target.value })}
                                        />
                                        <input
                                            className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-center font-mono uppercase"
                                            value={editingItem.bg_color || ''}
                                            onChange={e => setEditingItem({ ...editingItem, bg_color: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Enlace (Link)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        placeholder="/tecnologia"
                                        value={editingItem.link || ''}
                                        onChange={e => setEditingItem({ ...editingItem, link: e.target.value })}
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
                                {saving ? 'Guardando...' : 'Guardar Categoría'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
