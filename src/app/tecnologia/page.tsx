'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from './tecnologia.module.css';

const TECH_CATEGORIES = [
    'Notebooks',
    'Impresoras',
    'Accesorios',
    'Licencias originales',
    'Insumos informáticos',
    'Servicio técnico'
];

const MOCK_TECH_PRODUCTS = [
    { id: 101, name: 'Notebook Lenovo IdeaPad 3 - Ideal para estudiar', price: 3500000, category: 'Notebooks', image: '💻' },
    { id: 102, name: 'Impresora HP DeskJet Ink Advantage', price: 750000, category: 'Impresoras', image: '🖨️' },
    { id: 103, name: 'Mouse Inalámbrico Ergonómico Logitech', price: 120000, category: 'Accesorios', image: '🖱️' },
    { id: 104, name: 'Licencia Microsoft Office Home & Student', price: 450000, category: 'Licencias originales', image: '🔑' },
    { id: 105, name: 'Cartucho de Tinta HP 667 Negro', price: 95000, category: 'Insumos informáticos', image: '💧' },
    { id: 106, name: 'Servicio de Mantenimiento Preventivo', price: 150000, category: 'Servicio técnico', image: '🛠️' },
];

export default function TecnologiaPage() {
    const { addToCart } = useCart();
    const { settings } = useConfig();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const TECH_FILTER_CATEGORIES = ['Todos', ...TECH_CATEGORIES];

    useEffect(() => {
        fetchTechProducts();
    }, []);

    const fetchTechProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_tech', true)
                .is('active', true)
                .order('created_at', { ascending: false });

            if (data) {
                setProducts(data);
            }
        } catch (err) {
            console.error('Error fetching tech products:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = selectedCategory === 'Todos'
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className={styles.tecnologia}>
            <header className={styles.header}>
                <div className="container">
                    <span className={styles.badge}>Tecnología para estudiar mejor</span>
                    <h1 className="text-6xl font-black tracking-tighter uppercase mb-4">Soluciones Tecnológicas</h1>
                    <p className="text-xl font-medium opacity-90">Potenciamos tu educación con las mejores herramientas del mercado.</p>
                </div>
            </header>

            <div className={`container ${styles.content}`}>
                <nav className={styles.techNav}>
                    {TECH_FILTER_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.navItem} ${cat === selectedCategory ? styles.activeNav : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>

                <section className={styles.gridSection}>
                    {loading && <p className="container text-slate-400 font-bold uppercase tracking-widest py-10">Cargando productos de tecnología...</p>}

                    <div className={styles.techGrid}>
                        {filteredProducts.map(product => (
                            <div key={product.id} className={styles.techCard}>
                                <Link href={`/productos/${product.slug || product.id}`} className={styles.linkWrapper}>
                                    <div className={styles.imageArea}>
                                        {product.main_image ? (
                                            <img src={product.main_image} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className={styles.emoji}>💻</span>
                                        )}
                                    </div>
                                    <div className={styles.infoArea}>
                                        <span className={styles.catName}>{product.category}</span>
                                        <h3>{product.name}</h3>
                                        <p className={styles.price}>{product.price.toLocaleString('es-PY')} Gs.</p>
                                    </div>
                                </Link>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.buyBtn}
                                        onClick={() => addToCart({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.main_image || product.image_url || '',
                                            category: product.category || 'Tecnología'
                                        })}
                                    >
                                        Comprar ahora
                                    </button>
                                    <a href={`https://wa.me/${settings.whatsapp || '5959XXXXXXXX'}?text=Hola,%20me%20interesa%20el%20producto:%20${product.name}`} target="_blank" rel="noopener noreferrer" className={styles.infoBtn} title="Consultar por WhatsApp">
                                        Consultar
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && !loading && (
                        <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">computer</span>
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No hay tecnología disponible en esta categoría</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
