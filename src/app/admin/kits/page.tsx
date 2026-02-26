'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './kits.module.css';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { Product, KitItem } from '@/types';

export default function KitsPage() {
    const [kits, setKits] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKit, setEditingKit] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        main_image: '',
        category: 'Kits',
        is_featured_home: false,
        active: true,
        kit_items: [] as any[]
    });

    useEffect(() => {
        fetchKits();
        fetchInventory();
    }, []);

    async function fetchKits() {
        setLoading(true);
        try {
            // Fetch products, joining kit_items to identify kits even if category name varies
            const { data, error } = await supabase
                .from('products')
                .select('*, kit_items!kit_id(*, product:products!product_id(*))')
                .order('created_at', { ascending: false });

            if (data) {
                // Robust filtering: Category contains "kit" OR has kit items
                const filteredKits = data.filter((p: any) => {
                    const isKitCategory = p.category?.toLowerCase().includes('kit');
                    const hasItems = p.kit_items && p.kit_items.length > 0;
                    return isKitCategory || hasItems;
                });
                setKits(filteredKits);
            }
        } catch (err) {
            console.error('Error fetching kits:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchInventory() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .neq('category', 'Kits')
                .order('name', { ascending: true });

            if (data) setAllProducts(data);
        } catch (err) {
            console.error('Error fetching inventory');
        }
    }

    const handleOpenModal = async (kit: any = null) => {
        if (kit) {
            setEditingKit(kit);

            // Si el kit ya tiene kit_items cargados del fetchKits, los usamos
            // Si no, podríamos necesitarlos (aunque fetchKits ya los trae con el join)
            const items = kit.kit_items || [];

            setFormData({
                name: kit.name,
                description: kit.description || '',
                price: kit.price.toString(),
                main_image: kit.main_image || kit.image_url || '',
                category: kit.category || 'Kits',
                is_featured_home: kit.is_featured_home || false,
                active: kit.active !== false,
                kit_items: items.map((item: any) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    name: item.product?.name,
                    price: item.product?.price
                }))
            });
        } else {
            setEditingKit(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                main_image: '',
                category: 'Kits',
                is_featured_home: false,
                active: true,
                kit_items: []
            });
        }
        setIsModalOpen(true);
    };

    async function handleSubmit(e: any) {
        e.preventDefault();
        const payload = {
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            main_image: formData.main_image,
            category: formData.category,
            is_featured_home: formData.is_featured_home,
            active: formData.active
        };

        let currentKitId = editingKit?.id;

        if (editingKit) {
            const { error: err } = await supabase
                .from('products')
                .update(payload)
                .eq('id', editingKit.id);
            if (err) {
                alert('Error al actualizar: ' + err.message);
                return;
            }
        } else {
            const { data, error: err } = await supabase
                .from('products')
                .insert([payload])
                .select();

            if (err) {
                alert('Error al crear: ' + err.message);
                return;
            }
            currentKitId = data[0].id;
        }

        // Manejar los kit_items
        // 1. Borrar existentes
        await supabase.from('kit_items').delete().eq('kit_id', currentKitId);

        // 2. Insertar nuevos
        if (formData.kit_items.length > 0) {
            const itemsToInsert = formData.kit_items.map(item => ({
                kit_id: currentKitId,
                product_id: item.product_id,
                quantity: item.quantity
            }));
            const { error: itemErr } = await supabase.from('kit_items').insert(itemsToInsert);
            if (itemErr) {
                console.error('Error saving kit items:', itemErr);
            }
        }

        setIsModalOpen(false);
        fetchKits();
    }

    async function handleDelete(id: any) {
        if (confirm('¿Estás seguro de eliminar este kit?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) fetchKits();
        }
    }

    const addItemToKit = (product: Product) => {
        const exists = formData.kit_items.find(item => item.product_id === product.id);
        if (exists) {
            setFormData({
                ...formData,
                kit_items: formData.kit_items.map(item =>
                    item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            });
        } else {
            setFormData({
                ...formData,
                kit_items: [...formData.kit_items, {
                    product_id: product.id,
                    quantity: 1,
                    name: product.name,
                    price: product.price
                }]
            });
        }
    };

    const removeItemFromKit = (productId: string) => {
        setFormData({
            ...formData,
            kit_items: formData.kit_items.filter(item => item.product_id !== productId)
        });
    };

    const updateItemQuantity = (productId: string, quantity: number) => {
        setFormData({
            ...formData,
            kit_items: formData.kit_items.map(item =>
                item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        });
    };

    const filteredInventory = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.kitsPage}>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div>
                        <h2>🎒 Gestión de Kits Educativos</h2>
                        <p className="text-slate-500 text-sm">Crea y administra paquetes escolares por grado o institución.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Nuevo Kit</button>
                </header>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Nombre del Kit</th>
                                    <th>Precio</th>
                                    <th>Productos</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6}>Cargando kits...</td></tr>
                                ) : kits.length === 0 ? (
                                    <tr><td colSpan={6}>No hay kits registrados.</td></tr>
                                ) : kits.map((kit: any) => (
                                    <tr key={kit.id}>
                                        <td>
                                            <img
                                                src={kit.main_image || kit.image_url || 'https://via.placeholder.com/50'}
                                                alt={kit.name}
                                                className={styles.kitImage}
                                            />
                                        </td>
                                        <td>
                                            <strong>{kit.name}</strong>
                                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{kit.description}</p>
                                        </td>
                                        <td>{Number(kit.price).toLocaleString('es-PY')} Gs.</td>
                                        <td>
                                            <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                                {kit.kit_items?.length || 0} productos
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${kit.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {kit.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className={styles.actions}>
                                            <button className={styles.editBtn} onClick={() => handleOpenModal(kit)}>✏️</button>
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(kit.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>{editingKit ? 'Editar Kit' : 'Nuevo Kit Educativo'}</h3>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className={styles.formGroup}>
                                        <label>Nombre del Kit</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Ej: Kit Primaria 1er Grado"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Precio Final del Paquete (Gs.)</label>
                                        <input
                                            type="number"
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Descripción</label>
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="¿Qué incluye este kit?"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <ImageUpload
                                        label="Imagen del Kit"
                                        currentUrl={formData.main_image}
                                        onUpload={(url: string) => setFormData({ ...formData, main_image: url })}
                                    />
                                    <div className="flex flex-col gap-4 mt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_featured_home}
                                                onChange={(e) => setFormData({ ...formData, is_featured_home: e.target.checked })}
                                            />
                                            <span className="text-sm font-semibold">Destacar en Inicio</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.active}
                                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            />
                                            <span className="text-sm font-semibold">Kit Activo</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.kitItemsSection}>
                                <h4>📦 Composición del Paquete</h4>
                                <p className="text-xs text-slate-500 mb-4">Selecciona los productos que integran este kit.</p>

                                <div className={styles.kitItemsGrid}>
                                    <div className={styles.productList}>
                                        <div className={styles.listHeader}>
                                            <span>Inventario</span>
                                            <input
                                                type="text"
                                                placeholder="Buscar..."
                                                className={styles.searchInput}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.listContent}>
                                            {filteredInventory.map(product => (
                                                <div key={product.id} className={styles.productItem}>
                                                    <div className={styles.productInfo}>
                                                        <span>{product.name}</span>
                                                        <span className={styles.productPrice}>{product.price.toLocaleString('es-PY')} Gs.</span>
                                                    </div>
                                                    <button type="button" className={styles.addBtn} onClick={() => addItemToKit(product)}>+</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.selectedItems}>
                                        <div className={styles.listHeader}>
                                            <span>Productos en el Kit</span>
                                            <span>{formData.kit_items.length}</span>
                                        </div>
                                        <div className={styles.listContent}>
                                            {formData.kit_items.length === 0 ? (
                                                <p className="p-4 text-center text-sm text-slate-400">No hay productos añadidos.</p>
                                            ) : (
                                                formData.kit_items.map(item => (
                                                    <div key={item.product_id} className={styles.productItem}>
                                                        <div className={styles.productInfo}>
                                                            <span>{item.name}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <input
                                                                    id={`quantity-${item.product_id}`}
                                                                    title="Cantidad de productos"
                                                                    type="number"
                                                                    className={styles.quantityInput}
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItemQuantity(item.product_id, parseInt(e.target.value))}
                                                                />
                                                                <span className="text-xs text-slate-500">unids.</span>
                                                            </div>
                                                        </div>
                                                        <button type="button" className={styles.removeBtn} onClick={() => removeItemFromKit(item.product_id)}>🗑️</button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Kit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
