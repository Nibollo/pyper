'use client';

import { useState, useEffect, useCallback } from 'react';
import { Banner } from '@/types';
import { supabase } from '@/lib/supabase';
import styles from './FloatingRecommendation.module.css';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

export default function FloatingRecommendation() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHiding, setIsHiding] = useState(false);

    // Fetch recommendations
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!supabase || typeof supabase.from !== 'function') return;

            try {
                const { data, error } = await supabase
                    .from('banners')
                    .select('*')
                    .eq('is_active', true)
                    .eq('placement', 'recommendation');

                if (error) throw error;
                if (data) setBanners(data);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
            }
        };

        fetchRecommendations();
    }, []);

    const showRandomBanner = useCallback(() => {
        if (banners.length === 0) return;

        const randomIndex = Math.floor(Math.random() * banners.length);
        const banner = banners[randomIndex];
        setCurrentBanner(banner);
        setIsVisible(true);
        setIsHiding(false);

        // Use custom duration or default to 8s
        const duration = (banner.display_duration || 8) * 1000;

        // Hide after specified duration
        setTimeout(() => {
            setIsHiding(true);
            setTimeout(() => {
                setIsVisible(false);
                setCurrentBanner(null);
            }, 500); // Wait for slide out animation
        }, duration);
    }, [banners]);

    // Cycle logic
    useEffect(() => {
        if (banners.length === 0) return;

        // Start initial cycle after 5 seconds
        const initialDelay = setTimeout(showRandomBanner, 5000);

        // Repeat based on frequency
        // We'll use the frequency of the first active recommendation banner as a baseline
        const firstBanner = banners[0];
        const frequency = firstBanner.appearance_frequency;

        let interval: NodeJS.Timeout | null = null;
        
        // Only setup interval if frequency > 0
        if (frequency && frequency > 0) {
            interval = setInterval(() => {
                if (!isVisible) {
                    showRandomBanner();
                }
            }, frequency * 1000);
        }

        return () => {
            clearTimeout(initialDelay);
            if (interval) clearInterval(interval);
        };
    }, [banners, isVisible, showRandomBanner]);

    const getFinalLink = (banner: Banner) => {
        if (!banner.link_url) return '';
        
        let url = banner.link_url;
        
        // If it's a WhatsApp link and has a custom message
        if ((url.includes('wa.me') || url.includes('whatsapp.com')) && banner.whatsapp_message) {
            const separator = url.includes('?') ? '&' : '?';
            const message = encodeURIComponent(banner.whatsapp_message);
            
            // Avoid duplicating text parameter if it already exists
            if (!url.includes('text=')) {
                url = `${url}${separator}text=${message}`;
            }
        }
        
        return url;
    };

    const handleClose = () => {
        setIsHiding(true);
        setTimeout(() => {
            setIsVisible(false);
            setCurrentBanner(null);
        }, 500);
    };

    if (!currentBanner || !isVisible) return null;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${isHiding ? styles.hiding : ''}`}>
                <div className={styles.header}>
                    <span className={styles.badge}>Local recomendado por PYPER</span>
                    <button className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
                <div className={styles.content}>
                    {currentBanner.link_url ? (
                        <Link href={getFinalLink(currentBanner)} target="_blank" onClick={handleClose}>
                            <OptimizedImage
                                src={currentBanner.image_url}
                                alt="Recomendación"
                                width={320}
                                height={240}
                                className={styles.image}
                            />
                        </Link>
                    ) : (
                        <OptimizedImage
                            src={currentBanner.image_url}
                            alt="Recomendación"
                            width={320}
                            height={240}
                            className={styles.image}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
