'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from './kits.module.css';

export default function KitsPage() {
    const { addToCart } = useCart();
    const { settings } = useConfig();
    const [kits, setKits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');

    useEffect(() => {
        fetchKits();
    }, []);

    const fetchKits = async () => {
        setLoading(true);
        try {
            // Buscamos productos de categoría 'Kits' con sus items
            const { data, error } = await supabase
                .from('products')
                .select('*, kit_items!kit_id(*, product:products!product_id(*))')
                .order('created_at', { ascending: false });

            if (data) {
                // Filtramos en JS para mayor robustez
                const filteredKits = data.filter((p: any) => {
                    const isKitCategory = p.category?.toLowerCase().includes('kit');
                    const hasItems = p.kit_items && p.kit_items.length > 0;
                    const isActive = p.active !== false;
                    return (isKitCategory || hasItems) && isActive;
                });
                setKits(filteredKits);
                console.log('Kits detectados:', filteredKits);
            }
            if (error) console.error('Supabase error:', error.message || error);
        } catch (err) {
            console.error('Error fetching kits:', err);
        } finally {
            setLoading(false);
        }
    };

    const addFullKitToCart = (kit: any) => {
        // Añadir el kit como producto principal
        addToCart({
            id: kit.id,
            name: kit.name,
            price: kit.price,
            image: kit.main_image || kit.image_url || '',
            category: kit.category || 'Kits'
        });
        alert(`¡El kit "${kit.name}" ha sido añadido al carrito!`);
    };

    return (
        <div className={styles.kits}>
            <header className={styles.header}>
                <div className="container">
                    <h1 className="text-6xl font-black tracking-tighter uppercase mb-4">Kits Escolares {new Date().getFullYear()}</h1>
                    <p className="text-xl font-medium opacity-90">Selecciona el paquete ideal para el inicio de clases de tus hijos.</p>
                </div>
            </header>

            <section className={`container ${styles.results}`}>
                <div className={styles.resultsHeader}>
                    <h2>Kits Recomendados de PYPER</h2>
                    <p className="text-slate-500">Listas completas preparadas para garantizar el mejor rendimiento académico.</p>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest">Cargando los mejores kits...</p>
                    </div>
                ) : kits.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">package_2</span>
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Aún no hay kits publicados. ¡Vuelve pronto!</p>
                    </div>
                ) : (
                    <div className={styles.kitGrid}>
                        {kits.map((kit: any) => (
                            <div key={kit.id} className={styles.kitItem}>
                                <Link href={`/productos/${kit.slug || kit.id}`} className={styles.kitLink}>
                                    <div className={styles.itemIcon}>
                                        {(kit.main_image || kit.image_url) ? (
                                            <img src={kit.main_image || kit.image_url} alt={kit.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-4xl text-slate-300">🎒</span>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 block">Kit Escolar</span>
                                        <h4>{kit.name}</h4>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{kit.description}</p>

                                        <div className="bg-blue-50 p-3 rounded-xl mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-slate-500">Contenido:</span>
                                                <span className="text-xs font-bold text-blue-600">{kit.kit_items?.length || 0} artículos</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {kit.kit_items?.slice(0, 3).map((item: any) => (
                                                    <span key={item.id} className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-100">
                                                        {item.product?.name}
                                                    </span>
                                                ))}
                                                {(kit.kit_items?.length || 0) > 3 && (
                                                    <span className="text-[10px] bg-white text-slate-400 px-2 py-0.5 rounded-full">+{(kit.kit_items?.length || 0) - 3}</span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-2xl font-black text-slate-900 mb-4">{kit.price.toLocaleString('es-PY')} Gs.</p>
                                    </div>
                                </Link>
                                <div className={styles.kitActions}>
                                    <button
                                        className={styles.buyBtn}
                                        onClick={() => addFullKitToCart(kit)}
                                    >
                                        Comprar Kit
                                    </button>
                                    <a
                                        href={`https://wa.me/${settings.whatsapp || '5959XXXXXXXX'}?text=Hola,%20me%20interesa%20el%20kit:%20${kit.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.wsBtn}
                                        title="Consultar por WhatsApp"
                                    >
                                        💬
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
