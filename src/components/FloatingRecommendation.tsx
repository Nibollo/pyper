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
        setCurrentBanner(banners[randomIndex]);
        setIsVisible(true);
        setIsHiding(false);

        // Hide after 8 seconds
        setTimeout(() => {
            setIsHiding(true);
            setTimeout(() => {
                setIsVisible(false);
                setCurrentBanner(null);
            }, 500); // Wait for slide out animation
        }, 8000);
    }, [banners]);

    // Cycle logic
    useEffect(() => {
        if (banners.length === 0) return;

        // Start initial cycle after 5 seconds
        const initialDelay = setTimeout(showRandomBanner, 5000);

        // Repeat every 20-30 seconds (8s visible + 12-22s hidden)
        const interval = setInterval(() => {
            if (!isVisible) {
                showRandomBanner();
            }
        }, 25000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [banners, isVisible, showRandomBanner]);

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
                        <Link href={currentBanner.link_url} target="_blank" onClick={handleClose}>
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
