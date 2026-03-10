'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const initialCat = searchParams.get('cat') || 'Todos';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(initialCat);
    const [sortBy, setSortBy] = useState('relevant');
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                let dbQuery = supabase
                    .from('products')
                    .select('*')
                    .eq('active', true);

                if (query) {
                    dbQuery = dbQuery.ilike('name', `%${query}%`);
                }

                if (category !== 'Todos') {
                    dbQuery = dbQuery.ilike('category', `%${category}%`);
                }

                if (sortBy === 'price_asc') {
                    dbQuery = dbQuery.order('price', { ascending: true });
                } else if (sortBy === 'price_desc') {
                    dbQuery = dbQuery.order('price', { ascending: false });
                } else {
                    dbQuery = dbQuery.order('created_at', { ascending: false });
                }

                const { data, error } = await dbQuery;
                if (data) setProducts(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, category, sortBy]);

    return (
        <div className="min-h-screen bg-white">
            <header className="py-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block">Resultados de búsqueda</span>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
                        {query ? `"${query}"` : 'Todos los productos'}
                    </h1>
                    <p className="text-slate-500 mt-4 font-medium">
                        Hemos encontrado {products.length} productos que coinciden con tu búsqueda.
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex flex-wrap gap-4 items-center">
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Filtrar por:</span>
                        {['Todos', 'Libreria', 'Tecnologia', 'Kits'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${category === cat
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Ordenar:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border-none rounded-xl text-sm font-bold px-4 py-2 ring-1 ring-slate-200 focus:ring-primary"
                            aria-label="Ordenar por"
                        >
                            <option value="relevant">Más recientes</option>
                            <option value="price_asc">Menor precio</option>
                            <option value="price_desc">Mayor precio</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="animate-pulse bg-slate-50 h-[400px] rounded-[2.5rem]"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all border border-slate-100 hover:-translate-y-2">
                                <Link href={`/productos/${product.slug}`} className="block mb-6 relative aspect-square bg-slate-50 rounded-[2rem] overflow-hidden">
                                    {(product.main_image || product.image_url) ? (
                                        <OptimizedImage
                                            src={product.main_image || product.image_url}
                                            alt={product.name}
                                            width={400}
                                            height={400}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-5xl text-slate-200">inventory_2</span>
                                        </div>
                                    )}
                                </Link>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{product.category}</span>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 min-h-[3rem]">{product.name}</h4>
                                    <div className="flex items-center justify-between pt-4">
                                        <span className="text-xl font-black text-slate-900">Gs. {product.price.toLocaleString('es-PY')}</span>
                                        <button
                                            onClick={() => addToCart({
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                image: product.main_image || product.image_url || '',
                                                category: product.category || 'Resultado'
                                            })}
                                            className="bg-primary text-white p-3 rounded-2xl hover:rotate-12 transition-all shadow-lg shadow-primary/20"
                                        >
                                            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <span className="material-symbols-outlined text-7xl text-slate-300 mb-6">search_off</span>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">No encontramos nada</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Lo sentimos, no pudimos encontrar productos que coincidan con "{query}". Intenta buscar algo diferente.</p>
                        <Link href="/" className="inline-block mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
                            Volver al inicio
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BuscarPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SearchContent />
        </Suspense>
    );
}
