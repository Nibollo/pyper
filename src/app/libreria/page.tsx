'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from './libreria.module.css';

const CATEGORIES = [
    'Todos',
    'Útiles escolares',
    'Cuadernos',
    'Libros escolares',
    'Papelería',
    'Mochilas',
    'Material didáctico',
    'Artículos universitarios',
    'Kits escolares'
];

const MOCK_PRODUCTS = [
    { id: '1', name: 'Cuaderno Universitario 100 Hojas', price: 15000, category: 'Cuadernos', image: '📓' },
    { id: '2', name: 'Mochila Ergonómica Primaria', price: 185000, category: 'Mochilas', image: '🎒' },
    { id: '3', name: 'Kit Escolar 1er Grado (Completo)', price: 250000, category: 'Kits escolares', image: '📦' },
    { id: '4', name: 'Caja de Lápices de Colores x24', price: 35000, category: 'Útiles escolares', image: '✏️' },
    { id: '5', name: 'Diccionario Castellano Ilustrado', price: 45000, category: 'Libros escolares', image: '📖' },
    { id: '6', name: 'Carpeta A4 Tapa Dura', price: 22000, category: 'Papelería', image: '📂' },
];

export default function LibreriaPage() {
    const { addToCart } = useCart();
    const { settings } = useConfig();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, kit_items!kit_id(id)')
                .eq('is_tech', false)
                .is('active', true)
                .order('created_at', { ascending: false });

            if (data) {
                // Filtramos en JS para excluir kits
                const nonKits = data.filter((p: any) => {
                    const isKit = p.category?.toLowerCase().includes('kit');
                    const hasItems = p.kit_items && p.kit_items.length > 0;
                    return !isKit && !hasItems;
                });
                setProducts(nonKits);
            }
            if (error) console.error('Supabase error Librería:', error.message || error);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = selectedCategory === 'Todos'
        ? products
        : products.filter((p: any) => p.category === selectedCategory);

    return (
        <div className={styles.libreria}>
            <header className={styles.header}>
                <div className="container">
                    <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Librería Educativa</h1>
                    <p className="text-xl opacity-90 font-medium">Todo lo necesario para el éxito académico de tus hijos.</p>
                </div>
            </header>

            <div className={`container ${styles.content}`}>
                <aside className={styles.sidebar}>
                    <div className={styles.filterGroup}>
                        <h3>Categorías</h3>
                        <ul>
                            {CATEGORIES.map((cat: any) => (
                                <li key={cat}>
                                    <button
                                        className={cat === selectedCategory ? styles.activeFilter : ''}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <main className={styles.productsArea}>
                    <div className={styles.topBar}>
                        <p>Mostrando <strong>{filteredProducts.length}</strong> productos {loading && '(Cargando...)'}</p>
                    </div>

                    <div className={styles.productGrid}>
                        {filteredProducts.map((product: any) => (
                            <div key={product.id} className={styles.productCard}>
                                <Link href={`/productos/${product.slug || product.id}`} className={styles.productLink}>
                                    <div className={styles.productImage}>
                                        {(product.main_image || product.image_url) ? (
                                            <img src={product.main_image || product.image_url} alt={product.name} />
                                        ) : (
                                            <span className={styles.emoji}>📓</span>
                                        )}
                                    </div>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productCat}>{product.category}</span>
                                        <h4>{product.name}</h4>
                                        <div className={styles.priceContainer}>
                                            <span className={styles.price}>{product.price.toLocaleString('es-PY')} Gs.</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className={styles.productActions}>
                                    <button
                                        className={styles.addToCartBtn}
                                        onClick={() => addToCart({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.main_image || product.image_url || '',
                                            category: product.category || 'Librería'
                                        })}
                                    >
                                        Agregar al carrito
                                    </button>
                                    <a href={`https://wa.me/${settings.whatsapp || '5959XXXXXXXX'}?text=Hola,%20me%20interesa%20el%20producto:%20${product.name}`} target="_blank" rel="noopener noreferrer" className={styles.wsBtn} title="Consultar por WhatsApp">
                                        Consultar
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && !loading && (
                        <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inventory_2</span>
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No hay productos en esta categoría</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
