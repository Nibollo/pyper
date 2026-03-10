'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { PARAGUAY_LOCATIONS } from '@/lib/paraguay-locations';
import ImageUpload from './ImageUpload';

interface MapPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}

// Dynamically import the map for picking coordinates
const MapPicker = dynamic<MapPickerProps>(() => import('./MapPicker'), { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-3xl" />
});

export default function StoreManager() {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStore, setEditingStore] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setLoading(true);
        const { data } = await supabase.from('stores').select('*').order('name');
        if (data) setStores(data);
        setLoading(false);
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        const { id, ...storeData } = editingStore;
        
        let error;
        if (id) {
            const { error: err } = await supabase.from('stores').update(storeData).eq('id', id);
            error = err;
        } else {
            const { error: err } = await supabase.from('stores').insert(storeData);
            error = err;
        }

        if (!error) {
            setIsModalOpen(false);
            fetchStores();
            alert('Cambios guardados correctamente');
        } else {
            alert('Error al guardar: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este local?')) return;
        const { error } = await supabase.from('stores').delete().eq('id', id);
        if (!error) fetchStores();
    };

    const openModal = (store: any = null) => {
        setEditingStore(store || {
            name: '',
            address: '',
            city: 'Asunción',
            category: 'Sucursal',
            whatsapp: '',
            phone: '',
            email: '',
            schedule: 'Lun - Sab: 08:00 - 19:00',
            lat: -25.3006,
            lng: -57.6359,
            active: true,
            image_url: ''
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Locales Asociados</h2>
                    <p className="text-slate-500 text-sm mt-1">Administra las empresas asociadas y su ubicación en el mapa interactivo.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    + Nuevo Local
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse border border-slate-100 dark:border-slate-800" />
                    ))
                ) : stores.map(store => (
                    <div key={store.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${store.active ? 'bg-primary/5 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                <span className="material-symbols-outlined text-2xl">storefront</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openModal(store)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    <span className="material-symbols-outlined text-slate-400">edit</span>
                                </button>
                                <button onClick={() => handleDelete(store.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-1">{store.name}</h4>
                        <p className="text-slate-500 text-xs mb-4 line-clamp-1">{store.address}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <span className={`w-2 h-2 rounded-full ${store.active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                            <span className={store.active ? 'text-green-600' : 'text-slate-400'}>{store.active ? 'Activa' : 'Inactiva'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {editingStore.id ? 'Editar Local' : 'Nuevo Local'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-600 transition-colors">close</button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 overflow-y-auto">
                            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                <ImageUpload 
                                    label="Logo de la Empresa"
                                    currentImage={editingStore.image_url}
                                    onUploadComplete={(url) => setEditingStore({...editingStore, image_url: url})}
                                    bucket="blog-images"
                                    path="stores"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2" htmlFor="store-name">Nombre Comercial</label>
                                        <input 
                                            id="store-name"
                                            title="Nombre Comercial"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={editingStore.name}
                                            onChange={e => setEditingStore({...editingStore, name: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2" htmlFor="store-address">Dirección Física</label>
                                        <input 
                                            id="store-address"
                                            title="Dirección Física"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={editingStore.address}
                                            onChange={e => setEditingStore({...editingStore, address: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2" htmlFor="store-city">Ciudad</label>
                                            <input 
                                                id="store-city"
                                                title="Ciudad"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                                value={editingStore.city}
                                                onChange={e => setEditingStore({...editingStore, city: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2" htmlFor="store-category">Categoría</label>
                                            <input 
                                                id="store-category"
                                                title="Categoría"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="Sucursal, Depósito, etc."
                                                value={editingStore.category}
                                                onChange={e => setEditingStore({...editingStore, category: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">WhatsApp Directo</label>
                                        <input 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="5959..."
                                            value={editingStore.whatsapp}
                                            onChange={e => setEditingStore({...editingStore, whatsapp: e.target.value})}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 px-2">
                                        <input 
                                            type="checkbox" 
                                            id="store-active"
                                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20"
                                            checked={editingStore.active}
                                            onChange={e => setEditingStore({...editingStore, active: e.target.checked})}
                                        />
                                        <label htmlFor="store-active" className="text-sm font-bold text-slate-600">Local Activo (Visible en la web)</label>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ubicación Precisa (Click en el mapa)</label>
                                        <div className="h-[300px] border-4 border-slate-50 dark:border-slate-800 rounded-3xl overflow-hidden shadow-inner">
                                            <MapPicker 
                                                lat={editingStore.lat} 
                                                lng={editingStore.lng} 
                                                onChange={(lat: number, lng: number) => setEditingStore({...editingStore, lat, lng})} 
                                            />
                                        </div>
                                        <div className="flex gap-4 text-[10px] font-mono text-slate-400 px-2 uppercase">
                                            <span>Lat: {editingStore.lat?.toFixed(6)}</span>
                                            <span>Lng: {editingStore.lng?.toFixed(6)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2" htmlFor="store-schedule">Horario de Atención</label>
                                        <input 
                                            id="store-schedule"
                                            title="Horario de Atención"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={editingStore.schedule}
                                            onChange={e => setEditingStore({...editingStore, schedule: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-end gap-4 shrink-0">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:text-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-primary text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Guardar Cambios Premium
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
