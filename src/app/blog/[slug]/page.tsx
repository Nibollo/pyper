'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SectionRenderer from '@/components/cms/SectionRenderer';

export default function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlog() {
            setLoading(true);
            const { data } = await supabase
                .from('blogs')
                .select('*')
                .eq('slug', slug)
                .eq('active', true)
                .single();

            if (data) {
                setBlog(data);
            }
            setLoading(false);
        }
        fetchBlog();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!blog) notFound();

    let sections = [];
    try {
        sections = typeof blog.content === 'string' ? JSON.parse(blog.content) : blog.content;
        if (!Array.isArray(sections)) sections = [];
    } catch (e) {
        sections = [{ id: 'fallback', type: 'rich-text', body: blog.title }];
    }

    return (
        <article className="bg-white min-h-screen">
            {/* Premium Blog Header */}
            <header className="bg-white pt-24 pb-12 px-4 shadow-sm relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block bg-primary/10 text-primary font-black uppercase tracking-[5px] text-[10px] mb-6 px-4 py-2 rounded-full">
                        {blog.category}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 tracking-tighter leading-[0.9] uppercase">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">
                        <span className="text-slate-900 opacity-100">Editorial Pyper</span>
                        <span className="opacity-20">•</span>
                        <span>{new Date(blog.published_at).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    {blog.cover_image && (
                        <div className="rounded-[60px] overflow-hidden aspect-video shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] ring-1 ring-slate-100 group">
                            <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                        </div>
                    )}
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
            </header>

            <SectionRenderer sections={sections} />

            {/* Related or Footer for Blog */}
            <footer className="py-24 bg-slate-900 px-4 text-white">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-12 h-1 bg-primary mx-auto mb-8"></div>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                        Gracias por leer nuestro blog. En <strong>PYPER</strong> estamos comprometidos con la evolución educativa de Paraguay a través de la tecnología y el acceso equitativo a herramientas de calidad.
                    </p>
                    <Link href="/blog" className="btn btn-primary px-10">← Volver a Explorar</Link>
                </div>
            </footer>
        </article>
    );
}
