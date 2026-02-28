'use client';

import { useState, useEffect } from 'react';
import { Banner } from '@/types';
import { supabase } from '@/lib/supabase';
import styles from './PopupBanner.module.css';
import Link from 'next/link';

export default function PopupBanner() {
    const [banner, setBanner] = useState<Banner | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopup = async () => {
            if (!supabase || typeof supabase.from !== 'function') return;

            try {
                const now = new Date();
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
                const horas = now.getHours().toString().padStart(2, '0');
                const minutos = now.getMinutes().toString().padStart(2, '0');
                const segundos = now.getSeconds().toString().padStart(2, '0');
                const currentTime = `${horas}:${minutos}:${segundos}`;

                const { data, error } = await supabase
                    .from('banners')
                    .select('*')
                    .eq('is_active', true)
                    .eq('placement', 'popup')
                    .contains('days_of_week', [currentDay])
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (error) throw error;

                if (data && data.length > 0) {
                    const b = data[0];
                    const isActive = b.always_active || (currentTime >= b.start_time && currentTime <= b.end_time);

                    if (isActive) {
                        // Check if dismissed in this session
                        const dismissed = sessionStorage.getItem(`popup_dismissed_${b.id}`);
                        if (!dismissed) {
                            setBanner(b);
                            // Show after a small delay
                            setTimeout(() => setIsOpen(true), 2000);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching popup:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPopup();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (banner) {
            sessionStorage.setItem(`popup_dismissed_${banner.id}`, 'true');
        }
    };

    if (!banner || !isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <button className={styles.closeBtn} onClick={handleClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className={styles.content}>
                    {banner.link_url ? (
                        <Link href={banner.link_url} onClick={handleClose}>
                            <img src={banner.image_url} alt="Promoción" />
                        </Link>
                    ) : (
                        <img src={banner.image_url} alt="Promoción" />
                    )}
                </div>
            </div>
        </div>
    );
}
