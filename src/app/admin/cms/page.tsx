'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './cms.module.css';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminCMSPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [footerColumns, setFooterColumns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [modalType, setModalType] = useState<'page' | 'link' | 'new-page' | null>(null);

    const [formData, setFormData] = useState<any>({
        title: '',
        sections: [],
        label: '',
        link: '',
        column_id: '',
        slug: ''
    });

    useEffect(() => {
        fetchCMSData();
    }, []);

    async function fetchCMSData() {
        setLoading(true);
        try {
            const { data: pagesData } = await supabase
                .from('cms_pages')
                .select('*')
                .order('title', { ascending: true });

            const { data: columnsData } = await supabase
                .from('footer_columns')
                .select('*, footer_links(*)')
                .order('order', { ascending: true });

            if (pagesData) setPages(pagesData);
            if (columnsData) setFooterColumns(columnsData);
        } catch (err) {
            console.error('Error fetching CMS data');
        } finally {
            setLoading(false);
        }
    }

    const openEditModal = (type: 'page' | 'link' | 'new-page', item: any = null) => {
        setModalType(type);
        setEditingItem(item);
        if (type === 'page' && item) {
            let sections = [];
            try {
                sections = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
                if (!Array.isArray(sections)) sections = [];
            } catch (e) {
                sections = [{ id: 'old-1', type: 'rich-text', body: item.content }];
            }
            setFormData({
                title: item.title,
                sections: sections,
                slug: item.slug
            });
        } else if (type === 'new-page') {
            setFormData({
                title: '',
                slug: '',
                sections: [
                    { id: '1', type: 'hero', title: 'Nueva Página', subtitle: 'Subtítulo descriptivo', theme: 'dark' },
                    { id: '2', type: 'rich-text', title: 'Sobre este tema', body: 'Empieza a escribir aquí...', icon: 'edit', imagePosition: 'right' }
                ]
            });
        } else {
            setFormData({
                label: item?.label || '',
                link: item?.link || '',
                column_id: item?.column_id || ''
            });
        }
    };

    const addSection = (type: 'hero' | 'rich-text' | 'grid' | 'cta') => {
        const newSection: any = {
            id: Math.random().toString(36).substr(2, 9),
            type: type
        };

        if (type === 'hero') {
            newSection.title = 'Nuevo Título';
            newSection.subtitle = 'Subtítulo descriptivo';
            newSection.theme = 'dark';
        } else if (type === 'rich-text') {
            newSection.title = 'Sección de Texto';
            newSection.body = 'Contenido aquí...';
            newSection.icon = 'edit_document';
            newSection.imagePosition = 'right';
        } else if (type === 'grid') {
            newSection.title = 'Nuestras Características';
            newSection.items = [{ icon: 'star', title: 'Característica 1', description: 'Descripción breve' }];
        } else if (type === 'cta') {
            newSection.title = '¡Contáctanos!';
            newSection.subtitle = 'Estamos listos para ayudarte.';
            newSection.buttonText = 'Escribir ahora';
            newSection.buttonLink = '/contacto';
            newSection.theme = 'primary';
        }

        setFormData({
            ...formData,
            sections: [...formData.sections, newSection]
        });
    };

    const removeSection = (id: string) => {
        setFormData({
            ...formData,
            sections: formData.sections.filter((s: any) => s.id !== id)
        });
    };

    const updateSection = (id: string, updates: any) => {
        setFormData({
            ...formData,
            sections: formData.sections.map((s: any) => s.id === id ? { ...s, ...updates } : s)
        });
    };

    const addGridItem = (sectionId: string) => {
        setFormData({
            ...formData,
            sections: formData.sections.map((s: any) =>
                s.id === sectionId ? { ...s, items: [...(s.items || []), { icon: 'star', title: 'Nuevo Item', description: '' }] } : s
            )
        });
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        try {
            if (modalType === 'page') {
                const { error } = await supabase
                    .from('cms_pages')
                    .update({
                        title: formData.title,
                        slug: formData.slug,
                        content: JSON.stringify(formData.sections),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else if (modalType === 'new-page') {
                const { error } = await supabase
                    .from('cms_pages')
                    .insert({
                        title: formData.title,
                        slug: formData.slug,
                        content: JSON.stringify(formData.sections),
                        active: true,
                        updated_at: new Date().toISOString()
                    });
                if (error) throw error;
            } else if (modalType === 'link') {
                const { error } = await supabase
                    .from('footer_links')
                    .update({
                        label: formData.label,
                        link: formData.link
                    })
                    .eq('id', editingItem.id);
                if (error) throw error;
            }
            fetchCMSData();
            setModalType(null);
        } catch (err: any) {
            alert('Error al guardar: ' + err.message);
        }
    };

    const handleDeletePage = async (id: string, title: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la página "${title}"? esta acción no se puede deshacer.`)) return;

        try {
            const { error } = await supabase
                .from('cms_pages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchCMSData();
        } catch (err: any) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    return (
        <div className={styles.cmsPage}>
            <AdminSidebar />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 leading-none">Gestión Premium de Contenidos</h2>
                        <p className="text-slate-500 mt-2 italic text-sm">Diseño basado en secciones para máximo control estético.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openEditModal('new-page')}>
                        + Crear Nueva Página
                    </button>
                </header>

                <section className={styles.section}>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-6 pb-2 border-b">Páginas Estáticas</h3>
                    <div className={styles.grid}>
                        {pages.map(page => (
                            <div key={page.id} className={styles.pageCard}>
                                <div className={styles.pageInfo}>
                                    <h4 className="font-bold text-slate-900">{page.title}</h4>
                                    <span className="text-xs text-slate-400 font-mono">/{page.slug}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-primary btn-sm" onClick={() => openEditModal('page', page)}>Editar Diseño</button>
                                    <button className="btn btn-sm border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleDeletePage(page.id, page.title)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-6 pb-2 border-b">Enlaces del Pie de Página</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {footerColumns.map(column => (
                            <div key={column.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h4 className="font-bold mb-4 text-slate-700 uppercase tracking-wider text-[10px]">{column.title}</h4>
                                <div className="space-y-3">
                                    {column.footer_links?.map((link: any) => (
                                        <div key={link.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{link.label}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{link.link}</span>
                                            </div>
                                            <button className="text-primary hover:underline text-xs font-black uppercase" onClick={() => openEditModal('link', link)}>Editar</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {modalType && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${modalType === 'page' || modalType === 'new-page' ? styles.largeModal : ''}`}>
                        <h3 className="text-2xl font-black mb-8">
                            {modalType === 'new-page' ? 'Crear Nueva Página' : (modalType === 'page' ? `Diseño de Página: ${formData.title}` : 'Editar Enlace')}
                        </h3>
                        <form className={styles.form} onSubmit={handleSave}>
                            {(modalType === 'page' || modalType === 'new-page') ? (
                                <div className={styles.sectionEditor}>
                                    <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-2xl border mb-6">
                                        <div className={styles.formGroup}>
                                            <label className="font-bold text-xs text-slate-500 uppercase">Título de la Página</label>
                                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className="font-bold text-xs text-slate-500 uppercase">Slug (URL)</label>
                                            <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="ej: sobre-nosotros" required />
                                        </div>
                                    </div>
                                    {formData.sections.map((section: any) => (
                                        <div key={section.id} className={styles.sectionItem}>
                                            <div className={styles.sectionHeader}>
                                                <h4 className="font-black text-xs uppercase flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">
                                                        {section.type === 'hero' ? 'top_panel_open' : section.type === 'grid' ? 'grid_view' : section.type === 'cta' ? 'call_to_action' : 'description'}
                                                    </span>
                                                    {section.type}
                                                </h4>
                                                <button type="button" className={styles.removeSectionBtn} onClick={() => removeSection(section.id)}>Eliminar Bloque</button>
                                            </div>

                                            {section.type === 'hero' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`hero-title-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Título Hero</label>
                                                        <input id={`hero-title-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`hero-theme-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Tema Visual</label>
                                                        <select id={`hero-theme-${section.id}`} value={section.theme} onChange={(e) => updateSection(section.id, { theme: e.target.value })}>
                                                            <option value="dark">Oscuro (Slate 900)</option>
                                                            <option value="primary">Primario (Rojo Marca)</option>
                                                        </select>
                                                    </div>
                                                    <div className={styles.formGroup + " col-span-2"}>
                                                        <label htmlFor={`hero-sub-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Subtítulo Descriptivo</label>
                                                        <textarea id={`hero-sub-${section.id}`} value={section.subtitle} onChange={(e) => updateSection(section.id, { subtitle: e.target.value })} rows={2} />
                                                    </div>
                                                </div>
                                            )}

                                            {section.type === 'rich-text' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`text-title-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Título Sección</label>
                                                        <input id={`text-title-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`text-icon-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Icono (Material Symbol)</label>
                                                        <input id={`text-icon-${section.id}`} type="text" value={section.icon} onChange={(e) => updateSection(section.id, { icon: e.target.value })} placeholder="Ej: school, rocket, verified" />
                                                    </div>
                                                    <div className={styles.formGroup + " col-span-2"}>
                                                        <label htmlFor={`text-body-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Cuerpo del Texto</label>
                                                        <textarea id={`text-body-${section.id}`} value={section.body} onChange={(e) => updateSection(section.id, { body: e.target.value })} rows={6} />
                                                    </div>
                                                </div>
                                            )}

                                            {section.type === 'grid' && (
                                                <div className="space-y-6">
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`grid-title-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Título de la Grilla</label>
                                                        <input id={`grid-title-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                                    </div>
                                                    <div className={styles.gridItemsEditor}>
                                                        {section.items.map((item: any, i: number) => (
                                                            <div key={i} className={styles.gridItemForm}>
                                                                <input className={styles.iconInput} type="text" value={item.icon} title="Icono" placeholder="Icon" onChange={(e) => {
                                                                    const newItems = [...section.items];
                                                                    newItems[i].icon = e.target.value;
                                                                    updateSection(section.id, { items: newItems });
                                                                }} />
                                                                <input type="text" value={item.title} title="Título" placeholder="Título Item" onChange={(e) => {
                                                                    const newItems = [...section.items];
                                                                    newItems[i].title = e.target.value;
                                                                    updateSection(section.id, { items: newItems });
                                                                }} />
                                                                <div className="flex gap-2">
                                                                    <input type="text" value={item.description} title="Descripción" className="flex-1" placeholder="Descripción breve..." onChange={(e) => {
                                                                        const newItems = [...section.items];
                                                                        newItems[i].description = e.target.value;
                                                                        updateSection(section.id, { items: newItems });
                                                                    }} />
                                                                    <button type="button" className={styles.removeItemBtn} onClick={() => {
                                                                        const newItems = section.items.filter((_: any, idx: number) => idx !== i);
                                                                        updateSection(section.id, { items: newItems });
                                                                    }}>×</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button type="button" className={styles.addBtn} onClick={() => addGridItem(section.id)}>+ Añadir Fila</button>
                                                    </div>
                                                </div>
                                            )}

                                            {section.type === 'cta' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`cta-title-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Título CTA</label>
                                                        <input id={`cta-title-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`cta-theme-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Tema Visual</label>
                                                        <select id={`cta-theme-${section.id}`} value={section.theme} onChange={(e) => updateSection(section.id, { theme: e.target.value })}>
                                                            <option value="dark">Oscuro (Slate 900)</option>
                                                            <option value="primary">Primario (Rojo Marca)</option>
                                                        </select>
                                                    </div>
                                                    <div className={styles.formGroup + " col-span-2"}>
                                                        <label htmlFor={`cta-sub-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Subtítulo</label>
                                                        <textarea id={`cta-sub-${section.id}`} value={section.subtitle} onChange={(e) => updateSection(section.id, { subtitle: e.target.value })} rows={2} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`cta-btn-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Texto Botón</label>
                                                        <input id={`cta-btn-${section.id}`} type="text" value={section.buttonText} onChange={(e) => updateSection(section.id, { buttonText: e.target.value })} />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label htmlFor={`cta-link-${section.id}`} className="font-bold text-xs text-slate-500 uppercase">Enlace (URL/Mailto)</label>
                                                        <input id={`cta-link-${section.id}`} type="text" value={section.buttonLink} onChange={(e) => updateSection(section.id, { buttonLink: e.target.value })} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className={styles.addSectionBar}>
                                        <button type="button" className={styles.addBtn} onClick={() => addSection('hero')}>+ Añadir Hero</button>
                                        <button type="button" className={styles.addBtn} onClick={() => addSection('rich-text')}>+ Añadir Texto/Icono</button>
                                        <button type="button" className={styles.addBtn} onClick={() => addSection('grid')}>+ Añadir Grilla</button>
                                        <button type="button" className={styles.addBtn} onClick={() => addSection('cta')}>+ Añadir CTA</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className={styles.formGroup}>
                                        <label htmlFor="link-label" className="font-bold text-sm text-slate-700">Etiqueta del Enlace</label>
                                        <input
                                            id="link-label"
                                            className="p-4 border rounded-xl"
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="link-url" className="font-bold text-sm text-slate-700">Enlace (URL)</label>
                                        <input
                                            id="link-url"
                                            className="p-4 border rounded-xl"
                                            value={formData.link}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setModalType(null)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary px-10">Guardar Cambios Premium</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
