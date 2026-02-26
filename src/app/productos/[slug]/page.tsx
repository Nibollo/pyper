'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import Link from 'next/link';

export default function ProductDetail() {
    const params = useParams();
    const { addToCart } = useCart();
    const { settings } = useConfig();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleAddToCart = () => {
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.main_image || product.image_url || '',
                category: product.category || 'General'
            });
            // Optional: Show a toast or notification
        }
    };

    useEffect(() => {
        async function fetchProduct() {
            if (!params.slug) return;
            setLoading(true);
            try {
                // Optimized search for slugs or UUIDs
                const identifier = params.slug as string;
                let query = supabase
                    .from('products')
                    .select('*, kit_items!kit_id(*, product:products!product_id(*))');

                // If it looks like a UUID, we can filter by ID too
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(identifier)) {
                    query = query.or(`slug.eq."${identifier}",id.eq."${identifier}"`);
                } else {
                    query = query.eq('slug', identifier);
                }

                const { data, error } = await query.maybeSingle();

                if (error) throw error;
                if (data) setProduct(data);
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Producto no encontrado</h1>
                    <Link href="/" className="text-primary font-bold hover:underline">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Premium Product Header / Landing */}
            <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* Visual Side */}
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-primary/5 rounded-[60px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-slate-50 rounded-[60px] aspect-square overflow-hidden border border-slate-100 shadow-2xl">
                            {(product.main_image || product.image_url) ? (
                                <img
                                    src={product.main_image || product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[150px] text-slate-200">inventory_2</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Side */}
                    <div className="space-y-10">
                        <div>
                            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[4px] mb-8 inline-block">
                                {product.category}
                            </span>
                            <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] mb-6">
                                {product.name}
                            </h1>
                            {!product.category?.toLowerCase().includes('kit') && (
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {product.stock > 0 ? `Stock Disponible: ${product.stock}` : 'Agotado'}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 relative">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-2">Precio de Lanzamiento</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-slate-900">{product.price.toLocaleString('es-PY')}</span>
                                <span className="text-2xl font-black text-primary uppercase">GS.</span>
                            </div>

                            {/* Kit Counter Badge */}
                            {(product.category?.toLowerCase().includes('kit') || (product.kit_items && product.kit_items.length > 0)) && (
                                <div className="absolute top-4 right-8 bg-blue-600 text-white px-4 py-2 rounded-2xl flex flex-col items-center">
                                    <span className="text-xl font-black">{product.kit_items?.length || 0}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Artículos</span>
                                </div>
                            )}
                        </div>

                        <div className="prose prose-slate prose-xl max-w-none text-slate-600 leading-relaxed font-light italic-serif-support">
                            {product.description || 'Sin descripción disponible todavía.'}
                        </div>

                        {(product.category?.toLowerCase().includes('kit') || (product.kit_items && product.kit_items.length > 0)) && (
                            <div className="pt-8 border-t border-slate-100">
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                                    Incluye en este Kit:
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.kit_items && product.kit_items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-colors">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl overflow-hidden shadow-sm">
                                                {item.product?.main_image ? (
                                                    <img src={item.product.main_image} alt={item.product.name} className="w-full h-full object-contain" />
                                                ) : '📓'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black uppercase tracking-widest text-primary/60">{item.quantity} x</p>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{item.product?.name || 'Producto sin nombre'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-10 flex flex-wrap gap-4">
                            <button
                                className="bg-slate-900 text-white px-12 py-5 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase tracking-tighter"
                                onClick={handleAddToCart}
                            >
                                Añadir al Carrito
                            </button>
                            <a
                                href={`https://wa.me/${settings.whatsapp || '5959XXXXXXXX'}?text=Hola,%20quisiera%20consultar%20sobre%20este%20producto:%20${product.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-500 text-white px-8 py-5 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-100 uppercase tracking-tighter flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">chat</span>
                                Consultar
                            </a>
                            <Link
                                href={product.category === 'Kits' ? '/kits' : '/libreria'}
                                className="px-8 py-5 rounded-full border-2 border-slate-100 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Volver
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tech Badge for internal linking if needed */}
            {product.is_tech && (
                <div className="bg-slate-900 py-20 px-6 text-center text-white mt-20">
                    <div className="max-w-4xl mx-auto">
                        <span className="material-symbols-outlined text-6xl text-primary mb-6">memory</span>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Tecnología Certificada</h2>
                        <p className="text-slate-400 font-medium">Este producto forma parte de nuestra exclusiva línea tecnológica con soporte técnico incluido.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
