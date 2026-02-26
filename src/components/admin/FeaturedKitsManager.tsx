'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import { useConfig } from '@/context/ConfigContext';

export default function FeaturedKitsManager() {
    const { settings, refreshConfig } = useConfig();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

    // Header settings
    const [headerSettings, setHeaderSettings] = useState({
        featured_kits_title: '',
        featured_kits_subtitle: '',
        featured_kits_button_text: '',
        featured_kits_button_link: ''
    });

    useEffect(() => {
        fetchProducts();
        if (settings) {
            setHeaderSettings({
                featured_kits_title: settings.featured_kits_title || 'KITS ESCOLARES DESTACADOS',
                featured_kits_subtitle: settings.featured_kits_subtitle || 'SELECCIÓN ESPECIAL',
                featured_kits_button_text: settings.featured_kits_button_text || 'Ver todos los kits',
                featured_kits_button_link: settings.featured_kits_button_link || '/kits'
            });
        }
    }, [settings]);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setProducts(data);
        setLoading(false);
    };

    const handleSaveHeader = async () => {
        setSaving(true);
        const updates = Object.entries(headerSettings).map(([key, value]) => ({
            key,
            value,
            type: 'text'
        }));

        const { error } = await supabase.from('site_settings').upsert(updates);
        if (!error) {
            refreshConfig();
            alert('Encabezados actualizados!');
        }
        setSaving(false);
    };

    const handleSaveProduct = async () => {
        if (!editingProduct) return;
        setSaving(true);

        const { error } = await supabase
            .from('products')
            .upsert(editingProduct);

        if (!error) {
            setEditingProduct(null);
            fetchProducts();
        } else {
            alert('Error al guardar: ' + error.message);
        }
        setSaving(false);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) fetchProducts();
    };

    const toggleFeatured = async (product: Product) => {
        const { error } = await supabase
            .from('products')
            .update({ is_featured_home: !product.is_featured_home })
            .eq('id', product.id);

        if (!error) fetchProducts();
    };

    return (
        <div className="space-y-10">
            {/* Header Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined">settings_suggest</span>
                    Configuración de la Sección
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">Subtítulo (Roja/Top)</label>
                        <input
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                            value={headerSettings.featured_kits_subtitle}
                            onChange={e => setHeaderSettings({ ...headerSettings, featured_kits_subtitle: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">Título Principal</label>
                        <input
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                            value={headerSettings.featured_kits_title}
                            onChange={e => setHeaderSettings({ ...headerSettings, featured_kits_title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">Texto Botón</label>
                        <input
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                            value={headerSettings.featured_kits_button_text}
                            onChange={e => setHeaderSettings({ ...headerSettings, featured_kits_button_text: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2 flex items-end">
                        <button
                            onClick={handleSaveHeader}
                            disabled={saving}
                            className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Actualizar Encabezado'}
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Products List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined">inventory_2</span>
                        Gestión de Kits/Productos
                    </h3>
                    <button
                        onClick={() => setEditingProduct({ name: '', price: 0, is_featured_home: false, active: true })}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nuevo Producto
                    </button>
                </div>

                {loading ? (
                    <p>Cargando productos...</p>
                ) : (
                    <div className="grid gap-3">
                        {products.map(product => (
                            <div key={product.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 italic font-black text-primary text-xs">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            'KIT'
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {product.name}
                                            {product.is_featured_home && (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] uppercase font-black">Destacado</span>
                                            )}
                                        </h4>
                                        <p className="text-sm font-black text-primary">Gs. {product.price.toLocaleString('es-PY')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleFeatured(product)}
                                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${product.is_featured_home ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {product.is_featured_home ? 'star' : 'star_outline'}
                                        </span>
                                        {product.is_featured_home ? 'Destacado' : 'Destacar'}
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setEditingProduct(product)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="text-lg font-bold">Editar Producto</h4>
                            <button onClick={() => setEditingProduct(null)} className="material-symbols-outlined text-slate-400">close</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Nombre del Producto</label>
                                <input
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                    value={editingProduct.name || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Precio (Gs.)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        value={editingProduct.price || 0}
                                        onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Categoría</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        value={editingProduct.category || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Descripción Corta</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-20"
                                    value={editingProduct.description || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                />
                            </div>
                            <ImageUpload
                                label="Imagen del Producto"
                                currentUrl={editingProduct.image_url}
                                onUpload={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                            />
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setEditingProduct(null)} className="px-6 py-2 font-bold text-slate-500">Cancelar</button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={saving}
                                className="bg-primary text-white px-8 py-2 rounded-xl font-bold disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Guardar Producto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
