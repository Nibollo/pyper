'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '@/app/admin/inventario/inventario.module.css';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminInventarioPage() {
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '', price: '', stock: '', category: 'Librería',
        description: '', main_image: '', slug: '', meta_title: '',
        meta_description: '', focus_keyword: '', is_tech: false
    });

    useEffect(() => {
        setMounted(true);
        fetchProducts();
    }, []);

    if (!mounted) return null;

    async function fetchProducts() {
        setLoading(true);
        try {
            const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (data) setProducts(data);
        } catch (err) { console.error('Error fetching products'); }
        finally { setLoading(false); }
    }

    const openModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '', price: product.price?.toString() || '',
                stock: product.stock?.toString() || '', category: product.category || 'Librería',
                description: product.description || '', main_image: product.main_image || '',
                slug: product.slug || '', meta_title: product.meta_title || '',
                meta_description: product.meta_description || '', focus_keyword: product.focus_keyword || '',
                is_tech: product.is_tech || false
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', price: '', stock: '', category: 'Librería',
                description: '', main_image: '', slug: '', meta_title: '',
                meta_description: '', focus_keyword: '', is_tech: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e: any) => {
        e.preventDefault();
        const payload = {
            ...formData, price: Number(formData.price), stock: Number(formData.stock),
            slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        };
        const { error } = editingProduct 
            ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
            : await supabase.from('products').insert([payload]);
        if (!error) { setIsModalOpen(false); fetchProducts(); }
    };

    return (
        <div className={styles.inventario}>
            <header className={styles.header}>
                <h2 className="text-4xl font-black uppercase">Inventario</h2>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Nuevo Producto</button>
            </header>
            <section className={styles.tableSection}>
                <table className={styles.table}>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.price}</td>
                                <td><button onClick={() => openModal(p)}>Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
