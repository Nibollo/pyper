'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings, NavItem, HeroSlide, HomeSection, FeatureFlags } from '@/types';

type ConfigContextType = {
    settings: SiteSettings;
    navigation: NavItem[];
    heroSlides: HeroSlide[];
    homeSections: HomeSection[];
    featureFlags: FeatureFlags;
    loading: boolean;
    refreshConfig: () => Promise<void>;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Fallbacks para evitar que el sitio quede en blanco si falla Supabase
const DEFAULT_SETTINGS: SiteSettings = {
    business_name: 'PYPER PARAGUAY',
    business_slogan: 'Especialistas en soluciones educativas, útiles escolares y tecnología de vanguardia en Paraguay.',
    logo_header_text: 'PYPER',
    logo_header_subtext: 'PARAGUAY',
    footer_text: 'Tu librería moderna y centro de soluciones educativas. Calidad, compromiso y tecnología para tu educación.',
    copyright: 'Pyper Paraguay. Todos los derechos reservados.'
};

export function ConfigProvider({
    children,
    initialSettings = DEFAULT_SETTINGS,
    initialNavigation = []
}: {
    children: React.ReactNode,
    initialSettings?: SiteSettings,
    initialNavigation?: NavItem[]
}) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings);
    const [navigation, setNavigation] = useState<NavItem[]>(initialNavigation);
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});
    const [loading, setLoading] = useState(initialSettings === DEFAULT_SETTINGS);

    const fetchConfig = async () => {
        try {
            // Fetch everything in parallel
            const [
                { data: setRes },
                { data: navRes },
                { data: heroRes },
                { data: homeRes },
                { data: flagsRes }
            ] = await Promise.all([
                supabase.from('site_settings').select('key, value'),
                supabase.from('navigation_items').select('*').eq('active', true).order('order', { ascending: true }),
                supabase.from('hero_slides').select('*').eq('active', true).order('order', { ascending: true }),
                supabase.from('home_sections').select('*').eq('active', true).order('order', { ascending: true }),
                supabase.from('feature_flags').select('feature_name, enabled')
            ]);

            if (setRes) {
                const sObj: SiteSettings = {};
                setRes.forEach((s: any) => sObj[s.key] = s.value);
                setSettings(prev => ({ ...prev, ...sObj }));
            }

            if (navRes) setNavigation(navRes);
            if (heroRes) setHeroSlides(heroRes);
            if (homeRes) setHomeSections(homeRes);

            if (flagsRes) {
                const fObj: FeatureFlags = {};
                flagsRes.forEach((f: any) => fObj[f.feature_name] = f.enabled);
                setFeatureFlags(fObj);
            }
        } catch (err) {
            console.error('Error fetching global config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{
            settings,
            navigation,
            heroSlides,
            homeSections,
            featureFlags,
            loading,
            refreshConfig: fetchConfig
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
