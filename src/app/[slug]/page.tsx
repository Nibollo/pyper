'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { use } from 'react';
import SectionRenderer from '@/components/cms/SectionRenderer';

export default function CMSPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPage() {
            setLoading(true);
            const { data, error } = await supabase
                .from('cms_pages')
                .select('*')
                .eq('slug', slug)
                .eq('active', true)
                .single();

            if (error || !data) {
                setPage(null);
            } else {
                setPage(data);
            }
            setLoading(false);
        }
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!page) {
        notFound();
    }

    let sections = [];
    try {
        sections = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;
        if (!Array.isArray(sections)) sections = [];
    } catch (e) {
        // Fallback for plain text content
        sections = [{ id: 'fallback-1', type: 'rich-text', body: page.content, title: page.title }];
    }

    return (
        <div className="bg-white min-h-screen">
            <SectionRenderer sections={sections} />
        </div>
    );
}
