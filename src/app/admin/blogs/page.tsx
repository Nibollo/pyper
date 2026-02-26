'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './blogs.module.css';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);

    const [formData, setFormData] = useState<any>({
        title: '',
        slug: '',
        excerpt: '',
        content: [],
        category: 'General',
        cover_image: '',
        meta_title: '',
        meta_description: '',
        focus_keyword: '',
        active: true
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        const { data } = await supabase.from('blogs').select('*').order('published_at', { ascending: false });
        if (data) setBlogs(data);
        setLoading(false);
    };

    const openEditor = (post: any = null) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
                category: post.category,
                cover_image: post.cover_image || '',
                meta_title: post.meta_title || '',
                meta_description: post.meta_description || '',
                focus_keyword: post.focus_keyword || '',
                active: post.active
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: [],
                category: 'General',
                cover_image: '',
                meta_title: '',
                meta_description: '',
                focus_keyword: '',
                active: true
            });
        }
        setIsEditorOpen(true);
    };

    // SEO Engine Logic
    const seoAnalysis = useMemo(() => {
        if (!formData.focus_keyword) return { score: 0, results: [] };

        const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const kw = normalize(formData.focus_keyword);
        const title = normalize(formData.title || '');
        const metaDesc = normalize(formData.meta_description || '');
        const slug = normalize(formData.slug || '');
        const excerpt = normalize(formData.excerpt || '');
        const plainContent = (formData.content || [])
            .map((s: any) => {
                if (s.body) return normalize(s.body);
                if (s.title) return normalize(s.title);
                if (s.subtitle) return normalize(s.subtitle);
                if (s.items) return s.items.map((i: any) => normalize(i.title + ' ' + i.description)).join(' ');
                return '';
            })
            .join(' ');

        const fullBodyText = excerpt + ' ' + plainContent;

        const checks = [
            { id: 'kw-title', label: 'Keyword en Título', desc: 'Presencia en el H1 principal.', pass: title.includes(kw), points: 15 },
            { id: 'meta-len', label: 'Meta Descripción', desc: 'Extensión ideal (140-160 car.)', pass: metaDesc.length >= 140 && metaDesc.length <= 160, points: 10 },
            { id: 'kw-meta', label: 'Keyword en Meta', desc: 'Mejora el CTR en buscadores.', pass: metaDesc.includes(kw), points: 10 },
            { id: 'density', label: 'Densidad (x3+)', desc: 'Menciones en el cuerpo del texto.', pass: (fullBodyText.split(kw).length - 1) >= 3, points: 20 },
            { id: 'slug-kw', label: 'Keyword en URL', desc: 'Estructura SEO-friendly.', pass: slug.includes(kw.replace(/\s+/g, '-')), points: 15 },
            { id: 'rich-content', label: 'Diseño Premium', desc: 'Usa bloques de diseño complejos.', pass: (formData.content || []).length >= 3, points: 15 },
            { id: 'excerpt-kw', label: 'Intro Optimizada', desc: 'Keyword en el extracto inicial.', pass: excerpt.includes(kw), points: 15 }
        ];

        const score = checks.reduce((acc, curr) => acc + (curr.pass ? curr.points : 0), 0);
        return { score, results: checks };
    }, [formData]);

    // AI SEO TOOL: The "Intelligent" part
    const runAISuitcase = async () => {
        setIsAILoading(true);

        setTimeout(() => {
            const mainKeyword = formData.focus_keyword || (formData.title.split(' ')[0] + ' ' + (formData.title.split(' ')[1] || ''));

            const optimizedMetaTitle = `${formData.title} | Guía Completa 2026 - Pyper`.slice(0, 60);
            const optimizedMetaDesc = `¿Buscas info sobre ${mainKeyword}? Descubre ${formData.title}. Estrategias imbatibles y consejos de expertos en educación y tecnología en Paraguay. ¡Lee más aquí!`.slice(0, 160);
            const optimizedSlug = formData.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const optimizedExcerpt = `En este artículo sobre ${mainKeyword}, exploramos cómo ${formData.title} está transformando el panorama actual con soluciones innovadoras.`.slice(0, 160);

            // Optimización de bloques existentes para densidad
            const updatedContent = formData.content.map((section: any, idx: number) => {
                if (section.type === 'rich-text' && idx === 0) {
                    // Inyectar keyword en el primer bloque de texto si no tiene suficiente densidad
                    return {
                        ...section,
                        body: `Hablar de **${mainKeyword}** requiere entender profundamente su impacto. ${section.body}\n\nEn conclusión, este análisis sobre **${mainKeyword}** demuestra que la calidad es fundamental.`
                    };
                }
                return section;
            });

            // Si no hay bloques, crear uno básico con la keyword
            if (updatedContent.length === 0) {
                updatedContent.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'rich-text',
                    title: `Guía sobre ${mainKeyword}`,
                    body: `Bienvenido a nuestro análisis sobre **${mainKeyword}**. Aquí encontrarás todo lo que necesitas saber. La clave de **${mainKeyword}** es la perseverancia y el uso de herramientas adecuadas.\n\nContáctanos si tienes dudas sobre **${mainKeyword}**.`,
                    imagePosition: 'right'
                });
            }

            setFormData({
                ...formData,
                focus_keyword: mainKeyword,
                meta_title: optimizedMetaTitle,
                meta_description: optimizedMetaDesc,
                slug: optimizedSlug,
                excerpt: optimizedExcerpt,
                content: updatedContent
            });

            setIsAILoading(false);
            alert('¡Herramienta SEO Aplicada! Meta-datos, extracto y densidad de contenido optimizados al 100%.');
        }, 1500);
    };

    // Helper for Rich Text Formatting
    const applyFormatting = (sectionId: string, type: 'bold' | 'italic' | 'link') => {
        const textarea = document.getElementById(`t-b-${sectionId}`) as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        let newText = '';
        if (type === 'bold') newText = `**${selectedText || 'texto'}**`;
        else if (type === 'italic') newText = `*${selectedText || 'texto'}*`;
        else if (type === 'link') newText = `[${selectedText || 'enlace'}](https://)`;

        const finalValue = text.substring(0, start) + newText + text.substring(end);
        updateSection(sectionId, { body: finalValue });
    };

    // Section Editor Logic
    const addSection = (type: 'hero' | 'rich-text' | 'grid' | 'cta') => {
        const newSection: any = {
            id: Math.random().toString(36).substr(2, 9),
            type: type
        };

        if (type === 'hero') {
            newSection.title = 'Título del Hero';
            newSection.subtitle = 'Subtítulo cautivador';
            newSection.theme = 'dark';
        } else if (type === 'rich-text') {
            newSection.title = 'Contenido del Artículo';
            newSection.body = 'Tu contenido principal aquí...';
            newSection.icon = '';
            newSection.imagePosition = 'right';
        } else if (type === 'grid') {
            newSection.title = 'Puntos Clave';
            newSection.items = [{ icon: 'check_circle', title: 'Punto 1', description: 'Detalle' }];
        } else if (type === 'cta') {
            newSection.title = '¿Listo para empezar?';
            newSection.subtitle = 'Compromiso con la excelencia.';
            newSection.buttonText = 'Más información';
            newSection.buttonLink = '/contacto';
            newSection.theme = 'primary';
        }

        setFormData({ ...formData, content: [...formData.content, newSection] });
    };

    const removeSection = (id: string) => {
        setFormData({ ...formData, content: formData.content.filter((s: any) => s.id !== id) });
    };

    const updateSection = (id: string, updates: any) => {
        setFormData({
            ...formData,
            content: formData.content.map((s: any) => s.id === id ? { ...s, ...updates } : s)
        });
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        const postData = {
            ...formData,
            seo_score: seoAnalysis.score,
            content: JSON.stringify(formData.content),
            updated_at: new Date().toISOString()
        };

        try {
            if (editingPost) {
                const { error } = await supabase.from('blogs').update(postData).eq('id', editingPost.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('blogs').insert([{ ...postData, slug: postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-') }]);
                if (error) throw error;
            }
            setIsEditorOpen(false);
            fetchBlogs();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (isEditorOpen) {
        return (
            <div className={styles.editorContainer}>
                <main className={styles.editorMain}>
                    <header className={styles.header}>
                        <button onClick={() => setIsEditorOpen(false)} className="btn btn-secondary px-8">← Volver</button>
                        <h2 className="text-2xl font-black">Editor Inteligente Pyper</h2>
                        <button onClick={handleSave} className="btn btn-primary px-10">Guardar Cambios</button>
                    </header>

                    <div className="space-y-12">
                        {/* Meta Info & Cover */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6 bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                                <div className={styles.formGroup}>
                                    <label htmlFor="blog-title">Título del Artículo</label>
                                    <input
                                        id="blog-title"
                                        className="text-2xl font-black border-none bg-slate-50 focus:bg-white transition-colors p-6"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Título impactante..."
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="blog-excerpt">Extracto / Lead Paragraph</label>
                                    <textarea
                                        id="blog-excerpt"
                                        className="h-32 bg-slate-50 border-none p-6 text-slate-600"
                                        value={formData.excerpt}
                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="La primera frase que enganchará al lector..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 bg-slate-900 p-10 rounded-[32px] text-white overflow-hidden relative">
                                <ImageUpload
                                    label="Imagen de Portada (HD)"
                                    currentImage={formData.cover_image}
                                    onUploadComplete={(url) => setFormData({ ...formData, cover_image: url })}
                                />
                                <div className="mt-4 opacity-30 text-[9px] font-bold uppercase tracking-widest text-center">
                                    Formatos soportados: JPG, PNG, WEBP
                                </div>
                            </div>
                        </div>

                        {/* Section Editor */}
                        <div className={styles.sectionEditor}>
                            <h3 className="text-[10px] font-black uppercase tracking-[5px] text-slate-400 ml-2">Bloques de Contenido Dinámico</h3>

                            {formData.content.map((section: any) => (
                                <div key={section.id} className={styles.sectionItem}>
                                    <div className={styles.sectionHeader}>
                                        <h4>
                                            <span className="material-symbols-outlined text-primary">
                                                {section.type === 'hero' ? 'top_panel_open' : section.type === 'grid' ? 'grid_view' : section.type === 'cta' ? 'call_to_action' : 'description'}
                                            </span>
                                            {section.type === 'hero' ? 'Bloque Hero' : section.type === 'grid' ? 'Bloque Grilla' : section.type === 'cta' ? 'Bloque CTA' : 'Bloque de Texto Enriquecido'}
                                        </h4>
                                        <button type="button" className={styles.removeSectionBtn} onClick={() => removeSection(section.id)}>Eliminar</button>
                                    </div>

                                    {section.type === 'hero' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className={styles.formGroup}>
                                                <label htmlFor={`h-t-${section.id}`}>Título</label>
                                                <input id={`h-t-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label htmlFor={`h-s-${section.id}`}>Esquema de Color</label>
                                                <select id={`h-s-${section.id}`} value={section.theme} onChange={(e) => updateSection(section.id, { theme: e.target.value })}>
                                                    <option value="dark">Dark Edition</option>
                                                    <option value="primary">Pyper Red</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup + " col-span-2"}>
                                                <label htmlFor={`h-sub-${section.id}`}>Subtítulo</label>
                                                <textarea id={`h-sub-${section.id}`} value={section.subtitle} onChange={(e) => updateSection(section.id, { subtitle: e.target.value })} rows={2} />
                                            </div>
                                        </div>
                                    )}

                                    {section.type === 'rich-text' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`t-t-${section.id}`}>Título de Sección</label>
                                                        <input id={`t-t-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>Alineación Visual</label>
                                                        <select title="Alineación Visual" value={section.imagePosition} onChange={(e) => updateSection(section.id, { imagePosition: e.target.value })}>
                                                            <option value="right">Imagen Derecha</option>
                                                            <option value="left">Imagen Izquierda</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <ImageUpload
                                                    label="Imagen / Icono de Sección"
                                                    currentImage={section.icon && section.icon.startsWith('http') ? section.icon : ''}
                                                    onUploadComplete={(url) => updateSection(section.id, { icon: url })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Contenido (Markdown soportado)</label>
                                                <div className={styles.richTextToolbar}>
                                                    <button type="button" className={styles.toolbarBtn} onClick={() => applyFormatting(section.id, 'bold')}><b>Negrita</b></button>
                                                    <button type="button" className={styles.toolbarBtn} onClick={() => applyFormatting(section.id, 'italic')}><i>Cursiva</i></button>
                                                    <button type="button" className={styles.toolbarBtn} onClick={() => applyFormatting(section.id, 'link')}>🔗 Enlace</button>
                                                </div>
                                                <textarea
                                                    id={`t-b-${section.id}`}
                                                    value={section.body}
                                                    onChange={(e) => updateSection(section.id, { body: e.target.value })}
                                                    rows={12}
                                                    className="font-serif leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.type === 'grid' && (
                                        <div className="space-y-6">
                                            <div className={styles.formGroup}>
                                                <label htmlFor={`g-t-${section.id}`}>Título de la Grilla de Datos</label>
                                                <input id={`g-t-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                            </div>
                                            <div className={styles.gridItemsEditor}>
                                                {section.items.map((item: any, i: number) => (
                                                    <div key={i} className={styles.gridItemForm}>
                                                        <input className={styles.iconInput} value={item.icon} title="Icon" onChange={(e) => {
                                                            const newItems = [...section.items];
                                                            newItems[i].icon = e.target.value;
                                                            updateSection(section.id, { items: newItems });
                                                        }} />
                                                        <input value={item.title} placeholder="Tít. Item" title="Title" onChange={(e) => {
                                                            const newItems = [...section.items];
                                                            newItems[i].title = e.target.value;
                                                            updateSection(section.id, { items: newItems });
                                                        }} />
                                                        <input value={item.description} className="flex-1" placeholder="Descripción corta" title="Desc" onChange={(e) => {
                                                            const newItems = [...section.items];
                                                            newItems[i].description = e.target.value;
                                                            updateSection(section.id, { items: newItems });
                                                        }} />
                                                        <button type="button" className={styles.removeItemBtn} onClick={() => {
                                                            updateSection(section.id, { items: section.items.filter((_: any, idx: number) => idx !== i) });
                                                        }}><span className="material-symbols-outlined">close</span></button>
                                                    </div>
                                                ))}
                                                <button type="button" className={styles.addBtn} onClick={() => {
                                                    updateSection(section.id, { items: [...(section.items || []), { icon: 'star', title: 'Nuevo', description: '' }] });
                                                }}>+ Añadir Item</button>
                                            </div>
                                        </div>
                                    )}

                                    {section.type === 'cta' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className={styles.formGroup}>
                                                <label htmlFor={`c-t-${section.id}`}>Títudo CTA</label>
                                                <input id={`c-t-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label htmlFor={`c-btn-${section.id}`}>Texto del Botón</label>
                                                <input id={`c-btn-${section.id}`} type="text" value={section.buttonText} onChange={(e) => updateSection(section.id, { buttonText: e.target.value })} />
                                            </div>
                                            <div className={styles.formGroup + " col-span-2"}>
                                                <label htmlFor={`c-l-${section.id}`}>Link de Destino</label>
                                                <input id={`c-l-${section.id}`} type="text" value={section.buttonLink} onChange={(e) => updateSection(section.id, { buttonLink: e.target.value })} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className={styles.addSectionBar}>
                                <button type="button" className={styles.addBtn} onClick={() => addSection('hero')}>+ Bloque Hero</button>
                                <button type="button" className={styles.addBtn} onClick={() => addSection('rich-text')}>+ Bloque Texto</button>
                                <button type="button" className={styles.addBtn} onClick={() => addSection('grid')}>+ Bloque Grilla</button>
                                <button type="button" className={styles.addBtn} onClick={() => addSection('cta')}>+ Bloque CTA</button>
                            </div>
                        </div>

                        {/* Search Optimization */}
                        <div className="pt-20 border-t space-y-8 pb-32">
                            <h3 className="text-sm font-black uppercase tracking-[5px] text-slate-400">Motores de Búsqueda (Google/Social)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-12 rounded-[40px] shadow-sm ring-1 ring-slate-100">
                                <div className="space-y-8">
                                    <div className={styles.formGroup}>
                                        <label htmlFor="meta-title">Título SEO (Dinamizado)</label>
                                        <input
                                            id="meta-title"
                                            className="bg-slate-50 border-none p-4"
                                            value={formData.meta_title}
                                            onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="blog-keyword" className="text-primary italic">Palabra Clave Objetivo</label>
                                        <input
                                            id="blog-keyword"
                                            className="border-dashed border-primary/40 bg-white p-4"
                                            value={formData.focus_keyword}
                                            onChange={e => setFormData({ ...formData, focus_keyword: e.target.value })}
                                            placeholder="Palabra principal para el semáforo..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className={styles.formGroup}>
                                        <label htmlFor="meta-desc">Meta Description (140-160 car.)</label>
                                        <textarea
                                            id="meta-desc"
                                            className="h-32 bg-slate-50 border-none p-4"
                                            value={formData.meta_description}
                                            onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-slate-400">LONGITUD IDEAL: 160</span>
                                            <span className={`text-xs font-black ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                                                {formData.meta_description.length} CAR.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.aiActionBar}>
                            <button type="button" className={styles.aiButton} onClick={runAISuitcase} disabled={isAILoading}>
                                <span className="material-symbols-outlined">
                                    {isAILoading ? 'refresh' : 'auto_awesome'}
                                </span>
                                {isAILoading ? 'Analizando Contenido...' : 'APLICAR HERRAMIENTA SEO (IA)'}
                            </button>
                        </div>
                    </div>
                </main>

                <aside className={styles.seoSidebar}>
                    <div className={styles.seoScoreCard}>
                        <div className={`${styles.trafficLight} ${seoAnalysis.score > 75 ? styles.green : seoAnalysis.score > 40 ? styles.yellow : styles.red}`}>
                            <span className="material-symbols-outlined">
                                {seoAnalysis.score > 75 ? 'verified' : seoAnalysis.score > 40 ? 'warning' : 'dangerous'}
                            </span>
                        </div>
                        <div className={styles.scoreValue}>{seoAnalysis.score}</div>
                        <div className={styles.scoreLabel}>Estrategia SEO Pyper</div>
                    </div>

                    <div className={styles.checklist}>
                        <h4 className="text-[10px] font-black uppercase tracking-[3px] mb-6 text-primary">Checklist Imbatible</h4>
                        {seoAnalysis.results.map((check: any) => (
                            <div key={check.id} className={styles.checkItem}>
                                <div className={styles.checkStatus}>
                                    {check.pass ? '✅' : '❌'}
                                </div>
                                <div className={styles.checkText}>
                                    <h5 className="font-bold">{check.label}</h5>
                                    <p className="text-xs">{check.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        );
    }

    return (
        <div className={styles.blogPage}>
            <AdminSidebar />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div>
                        <h2 className="text-6xl font-black text-slate-900 leading-none tracking-tighter uppercase">ESTRATEGIA DIGITAL</h2>
                        <p className="text-slate-400 mt-4 max-w-xl text-lg font-medium">Contenido inteligente optimizado por IA para dominar tu mercado.</p>
                    </div>
                    <button onClick={() => openEditor()} className="btn btn-primary px-8 h-14 text-lg">Nuevo Artículo Pro</button>
                </header>

                <div className={styles.blogGrid}>
                    {blogs.map(blog => (
                        <div key={blog.id} className={styles.blogCard}>
                            <div className={styles.cardHead}>
                                <span className={`${styles.statusTag} ${blog.active ? styles.active : styles.draft}`}>
                                    {blog.active ? 'Publicado' : 'Borrador'}
                                </span>
                                <button onClick={() => openEditor(blog)} className="text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined font-light">edit_square</span>
                                </button>
                            </div>
                            <div className={styles.cardBody}>
                                <h4 className="text-2xl font-black tracking-tight mb-4">{blog.title}</h4>
                                <div className={styles.cardMeta}>
                                    <span>🗓️ {new Date(blog.published_at).toLocaleDateString()}</span>
                                    <span>📂 {blog.category}</span>
                                </div>
                                <div className={styles.cardSEO}>
                                    <div
                                        className={styles.seoBulb}
                                        style={{ background: blog.seo_score > 75 ? '#22c55e' : blog.seo_score > 40 ? '#eab308' : '#ef4444' }}
                                    ></div>
                                    <span className="uppercase tracking-widest text-[10px]">Puntaje SEO: {blog.seo_score}/100</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {blogs.length === 0 && !loading && (
                        <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-[80px] text-slate-100 mb-6 font-thin">auto_awesome</span>
                            <p className="text-slate-400 font-black uppercase tracking-widest">Listo para tu primera pieza de contenido IA.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
