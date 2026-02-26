'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './inventario.module.css';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

export default function InventarioPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: 'Librería',
        description: '',
        main_image: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        focus_keyword: '',
        is_tech: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setProducts(data);
        } catch (err) {
            console.error('Error fetching products');
        } finally {
            setLoading(false);
        }
    }

    const openModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                price: product.price?.toString() || '',
                stock: product.stock?.toString() || '',
                category: product.category || 'Librería',
                description: product.description || '',
                main_image: product.main_image || product.image_url || '',
                slug: product.slug || '',
                meta_title: product.meta_title || '',
                meta_description: product.meta_description || '',
                focus_keyword: product.focus_keyword || '',
                is_tech: product.is_tech || false
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                stock: '',
                category: 'Librería',
                description: '',
                main_image: '',
                slug: '',
                meta_title: '',
                meta_description: '',
                focus_keyword: '',
                is_tech: false
            });
        }
        setIsModalOpen(true);
    };

    async function handleSaveProduct(e: any) {
        e.preventDefault();
        const payload = {
            name: formData.name,
            price: Number(formData.price),
            stock: Number(formData.stock),
            category: formData.category,
            description: formData.description,
            main_image: formData.main_image,
            slug: formData.slug || formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            focus_keyword: formData.focus_keyword,
            is_tech: TECH_CATEGORIES.includes(formData.category),
            seo_score: seoAnalysis.score
        };

        let result;
        if (editingProduct) {
            result = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        } else {
            result = await supabase.from('products').insert([payload]);
        }

        if (!result.error) {
            setIsModalOpen(false);
            fetchProducts();
        } else {
            alert('Error al guardar: ' + result.error.message);
        }
    }

    async function handleDelete(id: any) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) fetchProducts();
        }
    }

    // --- SEO ENGINE --- 
    const seoAnalysis = useMemo(() => {
        if (!formData.focus_keyword) return { score: 0, results: [] };

        const normalize = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const kw = normalize(formData.focus_keyword);
        const name = normalize(formData.name);
        const metaDesc = normalize(formData.meta_description);
        const slug = normalize(formData.slug);
        const description = normalize(formData.description);

        const checks = [
            { id: 'kw-name', label: 'Keyword en Nombre', desc: 'Aparece en el nombre del producto.', pass: name.includes(kw), points: 20 },
            { id: 'meta-len', label: 'Meta Descripción', desc: 'Extensión ideal (120-160 car.)', pass: metaDesc.length >= 120 && metaDesc.length <= 160, points: 15 },
            { id: 'kw-meta', label: 'Keyword en Meta', desc: 'Ayuda al clic desde Google.', pass: metaDesc.includes(kw), points: 15 },
            { id: 'kw-slug', label: 'Keyword en URL', desc: 'URL amigable y optimizada.', pass: slug.includes(kw.replace(/\s+/g, '-')), points: 15 },
            { id: 'kw-desc', label: 'Keyword en Descrip.', desc: 'Mención en la descripción detallada.', pass: description.includes(kw), points: 20 },
            { id: 'has-img', label: 'Imagen de Producto', desc: 'El producto tiene una foto principal.', pass: !!formData.main_image, points: 15 }
        ];

        const score = checks.reduce((acc, curr) => acc + (curr.pass ? curr.points : 0), 0);
        return { score, results: checks };
    }, [formData]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return styles.score_excellent;
        if (score >= 50) return styles.score_good;
        return styles.score_poor;
    };

    const ALL_CATEGORIES = [
        'Útiles escolares', 'Cuadernos', 'Libros escolares', 'Papelería',
        'Mochilas', 'Material didáctico', 'Artículos universitarios',
        'Notebooks', 'Impresoras', 'Accesorios', 'Licencias originales',
        'Insumos informáticos', 'Servicio técnico', 'Kits Escolares', 'Servicios'
    ];

    const TECH_CATEGORIES = ['Notebooks', 'Impresoras', 'Accesorios', 'Licencias originales', 'Insumos informáticos', 'Servicio técnico'];

    // --- AI OPTIMIZER 2.0 ---
    const runAIInventorySuitcase = async () => {
        setIsAILoading(true);
        setTimeout(() => {
            const name = formData.name.toLowerCase();
            const originalKw = formData.focus_keyword;
            const kw = originalKw || formData.name.split(' ')[0];

            // 1. Categorización Inteligente Refinada
            let suggestedCategory = 'Útiles escolares';
            if (name.includes('notebook') || name.includes('laptop')) suggestedCategory = 'Notebooks';
            else if (name.includes('impresora')) suggestedCategory = 'Impresoras';
            else if (name.includes('mouse') || name.includes('teclado') || name.includes('auricular') || name.includes('webcam') || name.includes('monitor') || name.includes('cable') || name.includes('adaptador')) suggestedCategory = 'Accesorios';
            else if (name.includes('tablet') || name.includes('ipad') || name.includes('chromebook') || name.includes('kindle')) suggestedCategory = 'Notebooks'; // O 'Tablets' si existiera
            else if (name.includes('licencia') || name.includes('windows') || name.includes('office')) suggestedCategory = 'Licencias originales';
            else if (name.includes('tinta') || name.includes('toner') || name.includes('cartucho')) suggestedCategory = 'Insumos informáticos';
            else if (name.includes('tecnico') || name.includes('reparacion') || name.includes('mantenimiento')) suggestedCategory = 'Servicio técnico';
            else if (name.includes('cuaderno')) suggestedCategory = 'Cuadernos';
            else if (name.includes('libro') || name.includes('diccionario')) suggestedCategory = 'Libros escolares';
            else if (name.includes('papel') || name.includes('resma') || name.includes('cartulina')) suggestedCategory = 'Papelería';
            else if (name.includes('mochila') || name.includes('cartuchera')) suggestedCategory = 'Mochilas';
            else if (name.includes('didactico') || name.includes('juego') || name.includes('educativo')) suggestedCategory = 'Material didáctico';
            else if (name.includes('kit') || name.includes('combo') || name.includes('paquete')) suggestedCategory = 'Kits Escolares';

            // 2. Generador de Meta-Datos Dinámicos
            const titles = [
                `${formData.name} - Mejor Precio en Paraguay | PYPER`,
                `Comprar ${formData.name} | Calidad garantizada en PYPER`,
                `${formData.name} | Oferta especial en ${suggestedCategory}`
            ];
            const optimizedMetaTitle = titles[Math.floor(Math.random() * titles.length)].slice(0, 60);

            const descs = [
                `¿Buscando ${formData.name}? En Pyper te ofrecemos la mejor calidad en ${suggestedCategory}. Ideal para potenciar tu productividad y proyectos de ${kw}. ¡Envíos a todo el país!`,
                `Descubre el nuevo ${formData.name}. Un producto esencial de nuestra línea de ${suggestedCategory}, diseñado para durar. Compra online de forma segura en Pyper Paraguay.`,
                `Consigue tu ${formData.name} al precio más competitivo. En Pyper somos especialistas en ${suggestedCategory} y ${kw}. Calidad certificada y atención personalizada.`
            ];
            const optimizedMetaDesc = descs[Math.floor(Math.random() * descs.length)].slice(0, 160);

            const optimizedSlug = formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // 3. Generador de Descripción Dinámica (Cuerpo del Producto)
            const isEscolar = suggestedCategory === 'Útiles escolares' || suggestedCategory === 'Cuadernos' || suggestedCategory === 'Libros escolares' || suggestedCategory === 'Mochilas';
            const isTech = TECH_CATEGORIES.includes(suggestedCategory);

            const bodyTemplates = isTech ? [
                `El ${formData.name} potencia tu productividad técnica en el área de ${suggestedCategory}. Este dispositivo ha sido seleccionado por PYPER para ofrecer el máximo rendimiento en tareas de ${kw}, asegurando compatibilidad y durabilidad. Un complemento indispensable para tu ecosistema digital en Paraguay.`,
                `Lleva tu trabajo al siguiente nivel con el ${formData.name}. Diseñado para entusiastas de la tecnología, este artículo de la categoría ${suggestedCategory} destaca por su eficiencia y diseño vanguardista. Perfectamente adaptado para ${kw}, el ${formData.name} redefine la relación entre calidad y precio con el respaldo de PYPER.`,
                `Innovación y potencia se unen en el ${formData.name}. Como parte de nuestra línea premium de ${suggestedCategory}, este modelo ofrece soluciones robustas para ${kw}. Su construcción de alta calidad garantiza una inversión duradera para profesionales y estudiantes exigentes en todo Paraguay.`
            ] : isEscolar ? [
                `Prepara el regreso a clases con el mejor ${formData.name}. Este artículo esencial de ${suggestedCategory} ha sido diseñado para acompañar el aprendizaje diario, ofreciendo resistencia y estilo. Con el ${formData.name}, cada tarea se vuelve más sencilla, garantizando que el estudiante tenga lo mejor para ${kw}.`,
                `Calidad educativa en cada detalle: el ${formData.name} de PYPER es la elección ideal para el año lectivo. Dentro de nuestra gama de ${suggestedCategory}, destaca por su practicidad y ergonomía. Diseñado para resistir el uso intenso, este ${formData.name} es el aliado perfecto para ${kw}.`,
                `El ${formData.name} combina funcionalidad y durabilidad para el mundo escolar. Como especialistas en ${suggestedCategory}, en PYPER seleccionamos productos que inspiran el estudio y facilitan ${kw}. Un elemento básico que no puede faltar en la mochila de cualquier estudiante paraguayo.`
            ] : [
                `El ${formData.name} representa la excelencia en su categoría dentro de ${suggestedCategory}. Este producto ha sido seleccionado cuidadosamente para ofrecer un rendimiento superior y durabilidad en todas sus aplicaciones de ${kw}. En Pyper nos comprometemos con la calidad en cada detalle.`,
                `Optimiza tus tareas con el ${formData.name}. Diseñado específicamente para quienes buscan eficiencia en el área de ${suggestedCategory}, este producto destaca por su versatilidad y acabado premium. Ya sea para uso profesional o educativo, se adapta perfectamente a tus necesidades de ${kw}.`,
                `Si buscas confiabilidad, el ${formData.name} es tu mejor opción en ${suggestedCategory}. Con un enfoque en la innovación y la practicidad, este modelo se posiciona como un referente para proyectos relacionados con ${kw}. Su diseño garantiza una larga vida con el respaldo de PYPER.`
            ];

            // Variar la descripción cada vez
            const optimizedDescription = (formData.description && formData.description.length > 50)
                ? formData.description
                : bodyTemplates[Math.floor(Math.random() * bodyTemplates.length)];

            setFormData({
                ...formData,
                focus_keyword: kw,
                category: suggestedCategory,
                is_tech: TECH_CATEGORIES.includes(suggestedCategory),
                meta_title: optimizedMetaTitle,
                meta_description: optimizedMetaDesc,
                slug: optimizedSlug,
                description: optimizedDescription
            });

            setIsAILoading(false);
        }, 1200);
    };

    return (
        <div className={styles.inventario}>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase">Inventario Inteligente</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Gestión de productos y optimización de ventas</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Nuevo Producto</button>
                </header>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>SEO</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6}>Cargando inventario...</td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan={6}>No hay productos registrados.</td></tr>
                                ) : products.map(product => (
                                    <tr key={product.id}>
                                        <td className="flex items-center gap-4">
                                            {product.main_image ? (
                                                <img src={product.main_image} alt="" className="w-12 h-12 object-cover rounded-xl" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-300">inventory_2</span>
                                                </div>
                                            )}
                                            <strong>{product.name}</strong>
                                        </td>
                                        <td>
                                            <span className="bg-slate-100 text-[10px] font-black uppercase px-3 py-1.5 rounded-full text-slate-500">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${getScoreColor(product.seo_score || 0)} border-2`}>
                                                {product.seo_score || 0}
                                            </div>
                                        </td>
                                        <td className="font-bold">{product.price.toLocaleString('es-PY')} Gs.</td>
                                        <td>
                                            <span className={`${(product.stock || 0) < 20 ? styles.lowStock : 'text-slate-500'} font-bold`}>
                                                {product.stock || 0} unid.
                                            </span>
                                        </td>
                                        <td className={styles.actions}>
                                            <button className={styles.editBtn} onClick={() => openModal(product)}>✏️</button>
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(product.id)}>🗑️</button>
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
                    <div className={styles.modalWide}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">
                                    {editingProduct ? 'Editar Producto' : 'Añadir Producto'}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editor de Inventario & SEO Intelligence</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form className={styles.form} onSubmit={handleSaveProduct}>
                            <div className={styles.modalBody}>
                                <div className="space-y-8">
                                    <div className={styles.formGroup}>
                                        <label>Nombre del Producto</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Kit Escolar Completo Primaria"
                                            title="Nombre del producto"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>Precio (Gs.)</label>
                                            <input
                                                type="number"
                                                value={formData.price || ''}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="Precio en Guaraníes"
                                                title="Precio del producto"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Stock</label>
                                            <input
                                                type="number"
                                                value={formData.stock || ''}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                placeholder="Cantidad disponible"
                                                title="Stock del producto"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Descripción Detallada</label>
                                        <textarea
                                            rows={6}
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe tu producto para convencer a tus clientes..."
                                            title="Descripción detallada"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Imagen Principal</label>
                                        <ImageUpload
                                            onUploadComplete={(url) => setFormData({ ...formData, main_image: url })}
                                            currentImage={formData.main_image}
                                            label="Foto del Producto"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className={styles.aiSuitcase}>
                                        <div>
                                            <span className={styles.aiBadge}>AI Optimizer</span>
                                            <h4 className="font-black mt-2">Optimización Mágica</h4>
                                            <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest">Generar meta-datos automáticos</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={runAIInventorySuitcase}
                                            disabled={isAILoading}
                                            className="bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <span className={`material-symbols-outlined ${isAILoading ? 'animate-spin' : ''}`}>
                                                {isAILoading ? 'sync' : 'magic_button'}
                                            </span>
                                        </button>
                                    </div>

                                    <div className={styles.seoPanel}>
                                        <div className={styles.seoScore}>
                                            <div className={`${styles.scoreCircle} ${getScoreColor(seoAnalysis.score)}`}>
                                                <span className={styles.scoreVal}>{seoAnalysis.score}</span>
                                                <span className={styles.scoreLabel}>SEO Score</span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40">Salud de tu producto en Google</p>
                                        </div>

                                        <div className={styles.checkList}>
                                            <div className={styles.formGroup}>
                                                <label>Categoría de Producto</label>
                                                <select
                                                    value={formData.category || 'Librería'}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value, is_tech: TECH_CATEGORIES.includes(e.target.value) })}
                                                    title="Seleccionar categoría de producto"
                                                    required
                                                >
                                                    {ALL_CATEGORIES.sort().map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>Palabra Clave Objetivo</label>
                                                <input
                                                    type="text"
                                                    value={formData.focus_keyword || ''}
                                                    onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                                                    placeholder="Ej: kits escolares paraguay"
                                                    title="Palabra clave SEO"
                                                />
                                            </div>

                                            {seoAnalysis.results.map(check => (
                                                <div key={check.id} className={styles.checkItem}>
                                                    <span className={styles.checkStatus}>{check.pass ? '✅' : '❌'}</span>
                                                    <div className={styles.checkInfo}>
                                                        <h4>{check.label}</h4>
                                                        <p>{check.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 space-y-4 pt-6 border-t border-slate-200">
                                            <div className={styles.formGroup}>
                                                <label>URL Slug</label>
                                                <input
                                                    type="text"
                                                    value={formData.slug || ''}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Meta Descripción (Google)</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.meta_description || ''}
                                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary px-10 py-4 font-black uppercase text-sm">
                                    {editingProduct ? 'Actualizar Producto' : 'Lanzar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
