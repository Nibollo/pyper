'use client';

import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();
    const { settings } = useConfig();
    const [footerColumns, setFooterColumns] = useState<any[]>([]);

    useEffect(() => {
        async function fetchFooter() {
            const { data } = await supabase
                .from('footer_columns')
                .select('*, footer_links(*)')
                .order('order', { ascending: true });

            if (data) setFooterColumns(data);
        }
        fetchFooter();
    }, []);

    if (pathname.startsWith('/admin')) return null;

    return (
        <footer className="bg-slate-950 text-white pt-20 pb-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3">
                            {settings.footer_logo_url ? (
                                <img src={settings.footer_logo_url} alt={settings.business_name} className="h-16 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="bg-primary p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-white text-2xl">school</span>
                                    </div>
                                    <h2 className="text-white text-2xl font-black tracking-tighter uppercase">
                                        {settings.logo_header_text || 'PYPER'}
                                    </h2>
                                </>
                            )}
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            {settings.footer_text || 'Líderes en Paraguay en soluciones educativas integrales. Uniendo la tradición de la librería con el futuro de la tecnología.'}
                        </p>
                        <div className="flex gap-4">
                            {settings.tiktok_url && (
                                <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href={settings.tiktok_url} target="_blank" rel="noopener noreferrer">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.13 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.13 8.13 0 01-1.37-1.1v7.6c0 1.9-.53 3.82-1.69 5.3a6.93 6.93 0 01-5.6 2.53 7.02 7.02 0 01-5.6-2.5 7.9 7.9 0 01-1.69-5.32c0-1.89.53-3.8 1.69-5.27a6.95 6.95 0 015.6-2.54c.14 0 .27.01.41.02V8.33c-1.3-.15-2.61.12-3.75.76a4.43 4.43 0 00-1.7 1.57A5.02 5.02 0 005.15 13c0 1.2.33 2.4.98 3.44a4.4 4.4 0 003.54 1.57 4.38 4.38 0 003.55-1.57c.65-1.04.98-2.24.98-3.44V.02z"></path></svg>
                                </a>
                            )}
                            {settings.instagram_url && (
                                <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.947s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                                </a>
                            )}
                            {settings.facebook_url && (
                                <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {footerColumns.map(column => (
                        <div key={column.id}>
                            <h4 className="text-lg font-bold mb-6 border-b border-primary w-fit pb-1">{column.title}</h4>
                            <ul className="space-y-4 text-slate-400 text-sm">
                                {column.footer_links?.map((link: any) => (
                                    <li key={link.id}>
                                        <Link className="hover:text-primary transition-colors" href={link.link}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b border-primary w-fit pb-1">Newsletter</h4>
                        <p className="text-slate-400 text-sm mb-4">Recibe ofertas exclusivas y novedades de tecnología escolar.</p>
                        <div className="flex">
                            <input className="bg-slate-900 border-slate-800 rounded-l-lg focus:ring-primary focus:border-primary w-full text-sm p-2" placeholder="Tu email" type="email" />
                            <button className="bg-primary px-4 rounded-r-lg hover:bg-primary/90 transition-colors">
                                <span className="material-symbols-outlined text-white">send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs text-center md:text-left">
                    <p>© {currentYear} {settings.copyright || 'PYPER PARAGUAY. Todos los derechos reservados.'}</p>
                    <div className="flex flex-col gap-2 items-end">
                        <span className="text-slate-600">📍 {settings.address}</span>
                        {settings.opening_hours && <span className="text-slate-600">🕒 {settings.opening_hours}</span>}
                        {settings.business_ruc && <span className="text-slate-600 font-bold">RUC: {settings.business_ruc}</span>}
                    </div>
                </div>
            </div>
        </footer>
    );
}
