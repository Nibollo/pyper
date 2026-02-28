'use client';

import { useState, useEffect } from 'react';
import { Banner } from '@/types';
import { supabase } from '@/lib/supabase';
import styles from './LogoCarousel.module.css';

export default function LogoCarousel() {
    const [logos, setLogos] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogos = async () => {
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
                    .eq('placement', 'carousel')
                    .contains('days_of_week', [currentDay]);

                if (error) throw error;

                const filtered = (data || []).filter((banner: Banner) => {
                    if (banner.always_active) return true;
                    return currentTime >= banner.start_time && currentTime <= banner.end_time;
                });

                setLogos(filtered);
            } catch (err) {
                console.error('Error fetching logos for carousel:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogos();
    }, []);

    if (loading || logos.length === 0) return null;

    // Double the logos for infinite scroll effect
    const extendedLogos = [...logos, ...logos, ...logos];

    return (
        <section className={styles.carouselSection}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Empresas recomendadas por Pyper</h3>
                    <div className="h-1 w-20 bg-primary mx-auto mt-2 rounded-full"></div>
                </div>

                <div className={styles.carouselContainer}>
                    <div className={styles.track}>
                        {extendedLogos.map((logo, index) => (
                            <div key={`${logo.id}-${index}`} className={styles.logoItem}>
                                {logo.link_url ? (
                                    <a href={logo.link_url} target="_blank" rel="noopener noreferrer">
                                        <img src={logo.image_url} alt="Logo Empresa" />
                                    </a>
                                ) : (
                                    <img src={logo.image_url} alt="Logo Empresa" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
