'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HomeSection } from '@/types';
import { useConfig } from '@/context/ConfigContext';

export default function StatsManager() {
    const { refreshConfig } = useConfig();
    const [stats, setStats] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<HomeSection> | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('home_sections')
            .select('*')
            .eq('category', 'stats')
            .order('order', { ascending: true });

        if (data) setStats(data);
        setLoading(false);
    };

    const handleSaveItem = async () => {
        if (!editingItem) return;
        setSaving(true);

        const { error } = await supabase
            .from('home_sections')
            .upsert({ ...editingItem, category: 'stats' });

        if (!error) {
            setEditingItem(null);
            fetchStats();
            refreshConfig();
            alert('¡Marcador guardado correctamente!');
        } else {
            console.error('Error saving stat:', error);
            alert('Error al guardar: ' + error.message);
        }
        setSaving(false);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este marcador?')) return;
        const { error } = await supabase.from('home_sections').delete().eq('id', id);
        if (!error) {
            fetchStats();
            refreshConfig();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Marcadores de Confianza (Estadísticas)
                </h3>
                <button
                    onClick={() => setEditingItem({
                        title: '',
                        description: '',
                        icon: 'star',
                        order: stats.length,
                        active: true
                    })}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nuevo Marcador
                </button>
            </div>

            {loading ? (
                <p>Cargando marcadores...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map(item => (
                        <div key={item.id} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-center relative group border border-slate-100 dark:border-slate-700">
                            <p className="text-4xl font-black text-primary mb-1">{item.title}</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.description}</p>

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-1.5 bg-white shadow-md hover:bg-slate-50 rounded-lg text-slate-600"
                                    title="Editar"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600"
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
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="text-lg font-bold">Editar Marcador</h4>
                            <button onClick={() => setEditingItem(null)} className="material-symbols-outlined text-slate-400">close</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Número / Texto Principal</label>
                                <input
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-2xl font-black text-primary text-center"
                                    placeholder="Ej: 15k+, 120, 24h"
                                    value={editingItem.title || ''}
                                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Etiqueta / Descripción Corta</label>
                                <input
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl uppercase tracking-widest font-bold text-sm"
                                    placeholder="Ej: CLIENTES FELICES"
                                    value={editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Icono (Opcional)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        placeholder=" Ej: person, school"
                                        value={editingItem.icon || ''}
                                        onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Orden</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        value={editingItem.order || 0}
                                        onChange={e => setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setEditingItem(null)} className="px-6 py-2 font-bold text-slate-500">Cancelar</button>
                            <button
                                onClick={handleSaveItem}
                                disabled={saving}
                                className="bg-primary text-white px-8 py-2 rounded-xl font-bold disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Marcador'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
