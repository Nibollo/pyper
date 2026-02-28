'use client';

import { useState, useEffect } from 'react';
import { Banner } from '@/types';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import bannerStyles from './AdBanner.module.css';

export default function AdBanner({ placement = 'home_top' }: { placement?: string }) {
    const [ads, setAds] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            // Safety check for supabase client
            if (!supabase || typeof supabase.from !== 'function') {
                console.warn('AdBanner: Supabase client not initialized.');
                setLoading(false);
                return;
            }

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
                    .eq('placement', placement)
                    .contains('days_of_week', [currentDay]);

                if (error) {
                    // Log the error message specifically
                    console.error('Error fetching banners:', error.message || error);
                    setAds([]);
                    return;
                }

                const filtered = (data || []).filter((banner: Banner) => {
                    if (banner.always_active) return true;
                    return currentTime >= banner.start_time && currentTime <= banner.end_time;
                });

                setAds(filtered);
            } catch (err: any) {
                console.error('Exception in fetchAds:', err?.message || err);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
        const interval = setInterval(fetchAds, 30000);
        return () => clearInterval(interval);
    }, [placement]);

    if (loading || ads.length === 0) return null;

    return (
        <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${bannerStyles.bannerSection}`}>
            {ads.map((ad: Banner) => (
                <div key={ad.id} className={bannerStyles.bannerWrapper}>
                    {ad.link_url ? (
                        <Link href={ad.link_url} target="_blank" rel="noopener noreferrer" className={bannerStyles.bannerLink}>
                            <img
                                src={ad.image_url}
                                alt="Promoción"
                                className={bannerStyles.bannerImage}
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </Link>
                    ) : (
                        <img
                            src={ad.image_url}
                            alt="Promoción"
                            className={bannerStyles.bannerImage}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    )}
                    <div className={bannerStyles.gradientOverlay}></div>
                </div>
            ))}
        </section>
    );
}
