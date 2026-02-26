'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useConfig } from '@/context/ConfigContext';
import styles from './settings.module.css';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import HeroManager from '@/components/admin/HeroManager';
import FeaturedKitsManager from '@/components/admin/FeaturedKitsManager';
import ServicesManager from '@/components/admin/ServicesManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import StatsManager from '@/components/admin/StatsManager';

export default function GeneralSettings() {
    const { settings, refreshConfig } = useConfig();
    const [localSettings, setLocalSettings] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleChange = (key: string, value: string) => {
        setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e: any) => {
        if (e) e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const updates = Object.entries(localSettings).map(([key, value]) => ({
                key,
                value: String(value || '')
            }));

            const { error } = await supabase.from('site_settings').upsert(updates);

            if (error) throw error;

            await refreshConfig();
            setMessage('Configuración guardada exitosamente.');
        } catch (err: any) {
            setMessage('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.adminPage}>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div>
                        <h2>⚙️ Configuración General</h2>
                        <p className="text-slate-500 text-sm">Gestiona la identidad visual, contacto y presencia online de Pyper.</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </header>

                {message && (
                    <div className={`${styles.alert} ${message.includes('Error') ? 'bg-red-100 text-red-700 border-red-200' : ''}`}>
                        {message}
                    </div>
                )}

                <section className={styles.formSection}>
                    {/* Identidad Visual */}
                    <div className={styles.card}>
                        <h3>Identidad Visual</h3>
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <ImageUpload
                                label="Logo Principal (Header)"
                                currentUrl={localSettings.logo_url}
                                onUpload={(url) => handleChange('logo_url', url)}
                            />
                            <ImageUpload
                                label="Logo Footer"
                                currentUrl={localSettings.footer_logo_url}
                                onUpload={(url) => handleChange('footer_logo_url', url)}
                            />
                            <ImageUpload
                                label="Favicon (.ico, .png)"
                                currentUrl={localSettings.favicon_url}
                                onUpload={(url) => handleChange('favicon_url', url)}
                            />
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Texto Logo (Principal)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: PYPER"
                                    value={localSettings.logo_header_text || ''}
                                    onChange={(e) => handleChange('logo_header_text', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Texto Logo (Subtítulo)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: PARAGUAY"
                                    value={localSettings.logo_header_subtext || ''}
                                    onChange={(e) => handleChange('logo_header_subtext', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contacto y Negocio */}
                    <div className={styles.card}>
                        <h3>Información de Contacto y Negocio</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>RUC / Registro Comercial</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 1234567-8"
                                    value={localSettings.business_ruc || ''}
                                    onChange={(e) => handleChange('business_ruc', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Horario de Atención</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Lun-Vie 08:00 - 18:00"
                                    value={localSettings.opening_hours || ''}
                                    onChange={(e) => handleChange('opening_hours', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>WhatsApp (Sin +, solo números)</label>
                                <input
                                    type="text"
                                    value={localSettings.whatsapp || ''}
                                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Teléfono Fijo / Alternativo</label>
                                <input
                                    type="text"
                                    value={localSettings.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email de contacto</label>
                                <input
                                    type="email"
                                    value={localSettings.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Dirección física</label>
                                <input
                                    type="text"
                                    value={localSettings.address || ''}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modo de Tienda y Mercaderías */}
                    <div className={styles.card}>
                        <h3>💻 Modo de Tienda y Mercaderías</h3>
                        <p className="text-slate-500 text-sm mb-6">Configura cómo quieres que tus clientes finalicen sus compras.</p>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Modo de Checkout</label>
                                <select
                                    value={localSettings.checkout_mode || 'whatsapp'}
                                    onChange={(e) => handleChange('checkout_mode', e.target.value)}
                                    title="Seleccionar modo de checkout"
                                >
                                    <option value="whatsapp">💬 WhatsApp Lead (Solo consulta)</option>
                                    <option value="direct">🛒 Direct Checkout (Venta Directa)</option>
                                </select>
                                <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                                    {localSettings.checkout_mode === 'direct' ? 'Los pedidos se guardarán directamente en el panel.' : 'Los pedidos se enviarán por WhatsApp.'}
                                </span>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Métodos de Pago Aceptados</label>
                                <div className="flex flex-col gap-2 mt-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.accepted_payment_methods?.includes('cash_on_delivery') || false}
                                            onChange={(e) => {
                                                const current = localSettings.accepted_payment_methods?.split(',') || [];
                                                const news = e.target.checked
                                                    ? [...current, 'cash_on_delivery']
                                                    : current.filter((m: string) => m !== 'cash_on_delivery');
                                                handleChange('accepted_payment_methods', news.join(','));
                                            }}
                                        />
                                        <span>💵 Pago contra entrega</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.accepted_payment_methods?.includes('transfer') || false}
                                            onChange={(e) => {
                                                const current = localSettings.accepted_payment_methods?.split(',') || [];
                                                const news = e.target.checked
                                                    ? [...current, 'transfer']
                                                    : current.filter((m: string) => m !== 'transfer');
                                                handleChange('accepted_payment_methods', news.join(','));
                                            }}
                                        />
                                        <span>🏦 Transferencia Bancaria</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.accepted_payment_methods?.includes('direct_pay') || false}
                                            onChange={(e) => {
                                                const current = localSettings.accepted_payment_methods?.split(',') || [];
                                                const news = e.target.checked
                                                    ? [...current, 'direct_pay']
                                                    : current.filter((m: string) => m !== 'direct_pay');
                                                handleChange('accepted_payment_methods', news.join(','));
                                            }}
                                        />
                                        <span>💳 Pago Directo (API)</span>
                                    </label>
                                </div>
                            </div>

                            {localSettings.accepted_payment_methods?.includes('direct_pay') && (
                                <div className={`${styles.formGroup} col-span-2`}>
                                    <label>API Key de Pasarela de Pagos</label>
                                    <input
                                        type="password"
                                        placeholder="sk_live_..."
                                        value={localSettings.direct_payment_api_key || ''}
                                        onChange={(e) => handleChange('direct_payment_api_key', e.target.value)}
                                    />
                                    <span className="text-[10px] text-blue-500 mt-1 uppercase font-bold">Se requiere para procesar pagos automáticos.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gestión de Página Principal */}
                    <div className={styles.card}>
                        <HeroManager />
                    </div>

                    <div className={styles.card}>
                        <FeaturedKitsManager />
                    </div>

                    <div className={styles.card}>
                        <ServicesManager />
                    </div>

                    <div className={styles.card}>
                        <CategoriesManager />
                    </div>

                    <div className={styles.card}>
                        <StatsManager />
                    </div>

                    {/* Presencia Digital */}
                    <div className={styles.card}>
                        <h3>Presencia Digital (Social & SEO)</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Facebook URL</label>
                                <input
                                    type="text"
                                    placeholder="https://facebook.com/..."
                                    value={localSettings.facebook_url || ''}
                                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Instagram URL</label>
                                <input
                                    type="text"
                                    placeholder="https://instagram.com/..."
                                    value={localSettings.instagram_url || ''}
                                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>TikTok URL</label>
                                <input
                                    type="text"
                                    placeholder="https://tiktok.com/@..."
                                    value={localSettings.tiktok_url || ''}
                                    onChange={(e) => handleChange('tiktok_url', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Meta Title (SEO)</label>
                                <input
                                    type="text"
                                    value={localSettings.meta_title || ''}
                                    onChange={(e) => handleChange('meta_title', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Analytics ID (G-XXXXX)</label>
                                <input
                                    type="text"
                                    placeholder="G-..."
                                    value={localSettings.google_analytics_id || ''}
                                    onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Meta Description (SEO)</label>
                                <textarea
                                    className="col-span-2"
                                    value={localSettings.meta_description || ''}
                                    onChange={(e) => handleChange('meta_description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
