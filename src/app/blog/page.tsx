'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BlogList() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlogs() {
            setLoading(true);
            const { data } = await supabase
                .from('blogs')
                .select('*')
                .eq('active', true)
                .order('published_at', { ascending: false });

            if (data) setBlogs(data);
            setLoading(false);
        }
        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-32 px-4 shadow-sm relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <h1 className="text-6xl font-black mb-6 tracking-tighter uppercase leading-none">
                        BLOG <span className="text-primary">&</span> ESTRATEGIA
                    </h1>
                    <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto mb-8">
                        Perspectivas, innovación y el futuro de la educación en Paraguay.
                    </p>
                    <div className="w-20 h-1.5 bg-primary mx-auto"></div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px]"></div>
            </section>

            {/* Blog Grid */}
            <section className="py-24 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {blogs.map((blog) => (
                            <Link href={`/blog/${blog.slug}`} key={blog.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2">
                                <div className="aspect-[16/10] bg-slate-200 relative overflow-hidden">
                                    {blog.cover_image ? (
                                        <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 group-hover:bg-primary/5 transition-colors">
                                            <span className="material-symbols-outlined text-[100px] text-slate-200 group-hover:text-primary/20 transition-all font-light">newspaper</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full border border-white/20">
                                            {blog.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-10">
                                    <h2 className="text-2xl font-black mb-4 text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                        {blog.title}
                                    </h2>
                                    <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed mb-6">
                                        {blog.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(blog.published_at).toLocaleDateString('es-PY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-1 text-primary font-black text-xs uppercase group-hover:gap-2 transition-all">
                                            Leer más <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {blogs.length === 0 && (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-bold text-slate-400">Pronto habrá nuevos artículos.</h3>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
