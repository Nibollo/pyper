'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import StoreCard from '@/components/StoreCard';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the map to avoid SSR issues with Leaflet
const StoreMap = dynamic(() => import('@/components/StoreMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-3xl" />
});

export default function TiendasPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [filteredStores, setFilteredStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        city: 'Todas las ciudades',
        category: 'Todas las categorías'
    });

    const [cities, setCities] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('stores')
                .select('*')
                .eq('active', true)
                .order('name');
            
            if (error) throw error;
            if (data) {
                setStores(data);
                setFilteredStores(data);
                
                // Extract unique cities and categories
                const uniqueCities = Array.from(new Set(data.filter((s: any) => s.city).map((s: any) => s.city))) as string[];
                const uniqueCategories = Array.from(new Set(data.filter((s: any) => s.category).map((s: any) => s.category))) as string[];
                setCities(uniqueCities);
                setCategories(uniqueCategories);
            }
        } catch (err) {
            console.error('Error fetching stores:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = stores;
        if (filters.city !== 'Todas las ciudades') {
            result = result.filter(s => s.city === filters.city);
        }
        if (filters.category !== 'Todas las categorías') {
            result = result.filter(s => s.category === filters.category);
        }
        setFilteredStores(result);
    }, [filters, stores]);

    const handleViewInMap = (id: string) => {
        setSelectedStoreId(id);
        // Scroll to map on mobile
        if (window.innerWidth < 768) {
            document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark">
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-0.5 w-12 bg-primary"></div>
                            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Red de Alianzas</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                            Locales <span className="text-primary">Asociados</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-xl text-lg">
                            Descubre nuestra red de empresas y locales que forman parte del ecosistema PYPER. Encuentra el aliado más cercano a ti.
                        </p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="relative md:col-span-1">
                        <select 
                            title="Filtrar por ciudad"
                            className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 text-slate-700 dark:text-slate-200 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        >
                            <option>Todas las ciudades</option>
                            {cities.map(city => <option key={city}>{city}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                    </div>

                    <div className="relative md:col-span-1">
                        <select 
                            title="Filtrar por categoría"
                            className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 text-slate-700 dark:text-slate-200 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option>Todas las categorías</option>
                            {categories.map(cat => <option key={cat}>{cat}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end">
                        <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {filteredStores.length} Locales Encontrados
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content: List & Map */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* List Section */}
                    <div className="lg:col-span-4 space-y-4 max-h-[800px] lg:max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-40 bg-white dark:bg-slate-900/50 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />
                            ))
                        ) : filteredStores.length > 0 ? (
                            filteredStores.map(store => (
                                <StoreCard 
                                    key={store.id} 
                                    store={store} 
                                    onViewInMap={handleViewInMap}
                                    isSelected={selectedStoreId === store.id}
                                />
                            ))
                        ) : (
                            <div className="bg-white dark:bg-slate-900/50 p-12 rounded-3xl text-center border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl text-slate-300">location_off</span>
                                </div>
                                <p className="text-slate-500 font-bold">No se encontraron locales.</p>
                                <button 
                                    onClick={() => setFilters({ city: 'Todas las ciudades', category: 'Todas las categorías' })}
                                    className="text-primary text-xs font-black mt-4 uppercase tracking-widest hover:underline"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Map Section */}
                    <div id="map-section" className="lg:col-span-8 h-[450px] lg:h-[700px] sticky top-24 z-10">
                        <div className="h-full w-full rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl relative group/map">
                            <StoreMap 
                                stores={filteredStores} 
                                selectedStoreId={selectedStoreId}
                            />
                            
                            {/* Map Floating UI */}
                            <div className="absolute top-6 left-6 z-[1000] pointer-events-none transition-transform duration-500 group-hover/map:scale-105">
                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping absolute"></div>
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full relative"></div>
                                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Mapa de Alianzas PYPER</span>
                                    </div>
                                </div>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute bottom-6 right-6 z-[1000] pointer-events-none">
                                <div className="bg-primary/95 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                                    V1.2.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
