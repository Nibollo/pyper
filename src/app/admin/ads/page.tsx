'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Banner } from '@/types';
import styles from './ads.module.css';
import ImageUpload from '@/components/ImageUpload';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LABELS: { [key: string]: string } = {
    'Monday': 'Lun',
    'Tuesday': 'Mar',
    'Wednesday': 'Mie',
    'Thursday': 'Jue',
    'Friday': 'Vie',
    'Saturday': 'Sab',
    'Sunday': 'Dom'
};

export default function AdsAdmin() {
    const [ads, setAds] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Partial<Banner> | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        setLoading(true);
        if (!supabase || typeof supabase.from !== 'function') {
            console.error('Supabase client is not initialized or invalid.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching ads:', error.message);
                setAds([]);
            } else {
                setAds(data || []);
            }
        } catch (err: any) {
            console.error('Exception in fetchAds:', err?.message || err);
            setAds([]); // Ensure ads are cleared on unexpected exceptions too
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (ad?: Banner) => {
        if (ad) {
            setEditingAd(ad);
        } else {
            setEditingAd({
                image_url: '',
                link_url: '',
                start_time: '00:00:00',
                end_time: '23:59:59',
                is_active: true,
                always_active: true,
                placement: 'home_top',
                days_of_week: [...DAYS]
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAd(null);
    };

    const handleSave = async () => {
        if (!editingAd?.image_url || !editingAd.start_time || !editingAd.end_time) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        setSaving(true);
        const adData = {
            ...editingAd,
            // Asegurarse de que el formato de tiempo sea correcto si es necesario
        };

        let error;
        if (editingAd.id) {
            const { error: err } = await supabase
                .from('banners')
                .update(adData)
                .eq('id', editingAd.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('banners')
                .insert([adData]);
            error = err;
        }

        if (error) {
            alert('Error al guardar: ' + error.message);
        } else {
            handleCloseModal();
            fetchAds();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;

        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            fetchAds();
        }
    };

    const toggleDay = (day: string) => {
        if (!editingAd) return;
        const currentDays = editingAd.days_of_week || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter((d: string) => d !== day)
            : [...currentDays, day];
        setEditingAd({ ...editingAd, days_of_week: newDays });
    };

    return (
        <div className={styles.adsPage}>
            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <h1>📢 Gestión de Anuncios</h1>
                        <p className="text-slate-500">Programar anuncios visuales para la página principal.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <span className="material-symbols-outlined">add</span>
                        Nuevo Anuncio
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {ads.map((ad) => (
                            <div key={ad.id} className={styles.adCard}>
                                <div className={styles.imageContainer}>
                                    <img src={ad.image_url} alt="Ad" />
                                    <div className={styles.statusPadding}>
                                        <span className={`${styles.badge} ${ad.is_active ? styles.activeBadge : styles.inactiveBadge}`}>
                                            {ad.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.adContent}>
                                    <div className={styles.schedule}>
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        {ad.start_time.substring(0, 5)} - {ad.end_time.substring(0, 5)}
                                    </div>
                                    <div className={styles.days}>
                                        {ad.days_of_week.map(day => (
                                            <span key={day} className={styles.dayChip}>{DAY_LABELS[day]}</span>
                                        ))}
                                    </div>
                                    <div className={styles.actions}>
                                        <button className={styles.editBtn} onClick={() => handleOpenModal(ad)}>
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Editar
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(ad.id)}>
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isModalOpen && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h2 className="text-xl font-bold">{editingAd?.id ? 'Editar Anuncio' : 'Nuevo Anuncio'}</h2>
                                <button onClick={handleCloseModal}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.fullWidth}>
                                    <ImageUpload
                                        label="Imagen del Anuncio"
                                        currentUrl={editingAd?.image_url || ''}
                                        onUpload={(url: string) => setEditingAd((prev: any) => ({ ...prev, image_url: url }))}
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Link de destino (Opcional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={editingAd?.link_url || ''}
                                        onChange={(e) => setEditingAd((prev: any) => ({ ...prev, link_url: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Hora Inicio</label>
                                    <input
                                        type="time"
                                        step="1"
                                        title="Hora de inicio"
                                        placeholder="00:00:00"
                                        value={editingAd?.start_time || '09:00:00'}
                                        onChange={(e) => setEditingAd((prev: any) => ({ ...prev, start_time: e.target.value }))}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Hora Fin</label>
                                    <input
                                        type="time"
                                        step="1"
                                        title="Hora de fin"
                                        placeholder="00:00:00"
                                        value={editingAd?.end_time || '18:00:00'}
                                        onChange={(e) => setEditingAd((prev: any) => ({ ...prev, end_time: e.target.value }))}
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Días de la semana</label>
                                    <div className={styles.daySelector}>
                                        {DAYS.map(day => (
                                            <button
                                                key={day}
                                                className={`${styles.dayOption} ${editingAd?.days_of_week?.includes(day) ? styles.dayOptionActive : ''}`}
                                                onClick={() => toggleDay(day)}
                                            >
                                                {DAY_LABELS[day]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Ubicación (Espacio)</label>
                                    <select
                                        value={editingAd?.placement || 'home_top'}
                                        onChange={(e) => setEditingAd((prev: any) => ({ ...prev, placement: e.target.value }))}
                                        title="Ubicación del anuncio"
                                    >
                                        <option value="home_top">Página Principal (Arriba)</option>
                                        <option value="home_middle">Página Principal (Medio)</option>
                                        <option value="carousel">Carrusel de Logotipos (Abajo)</option>
                                        <option value="popup">Ventana Emergente (Pop-up)</option>
                                        <option value="sidebar">Barra Lateral (Blog/Tienda)</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Modo de Activación</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            id="always_active"
                                            checked={editingAd?.always_active || false}
                                            onChange={(e) => setEditingAd((prev: any) => ({ ...prev, always_active: e.target.checked }))}
                                        />
                                        <label htmlFor="always_active">Siempre Activo (Ignorar horario)</label>
                                    </div>
                                </div>

                                <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={editingAd?.is_active || false}
                                        onChange={(e) => setEditingAd((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    <label htmlFor="is_active">Habilitar Anuncio</label>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={handleCloseModal}>Cancelar</button>
                                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar Anuncio'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
