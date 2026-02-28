'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { settings, navigation } = useConfig();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu on navigation
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    if (pathname.startsWith('/admin')) return null;

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-primary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3 decoration-0">
                            {settings.logo_url ? (
                                <img src={settings.logo_url} alt={settings.business_name} className="h-10 sm:h-12 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="bg-primary p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-white text-xl sm:text-2xl">school</span>
                                    </div>
                                    <h2 className="text-primary text-xl sm:text-2xl font-black tracking-tighter">
                                        {settings.logo_header_text || 'PYPER'}
                                        <span className="text-slate-900 dark:text-white ml-1">
                                            {settings.logo_header_subtext || 'PARAGUAY'}
                                        </span>
                                    </h2>
                                </>
                            )}
                        </Link>

                        <nav className="hidden md:flex items-center gap-8">
                            {navigation.length > 0 ? (
                                navigation.map(item => (
                                    <Link
                                        key={item.id}
                                        href={item.link}
                                        className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-wider"
                                    >
                                        {item.label}
                                    </Link>
                                ))
                            ) : (
                                <>
                                    <Link className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-wider" href="/libreria">Librería</Link>
                                    <Link className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-wider" href="/tecnologia">Tecnología</Link>
                                    <Link className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-wider" href="/kits">Kits 2024</Link>
                                    <Link className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-wider" href="/servicios">Servicios</Link>
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-primary/10 rounded-full px-4 py-2 border border-slate-200 dark:border-primary/20 gap-2">
                            <span className="material-symbols-outlined text-primary text-xl leading-none">search</span>
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-slate-400 p-0"
                                placeholder="Buscar útiles, laptops..."
                                type="text"
                            />
                        </div>

                        <Link href="/carrito" className="relative p-2 hover:bg-primary/10 rounded-full transition-all">
                            <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">shopping_cart</span>
                            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {cartCount}
                            </span>
                        </Link>

                        <Link href="/admin/login" className="hidden sm:block p-2 hover:bg-primary/10 rounded-full transition-all">
                            <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">person</span>
                        </Link>

                        {/* Mobile Menu Button - Fixed layout to prevent push-out */}
                        <button
                            className="md:hidden p-2 hover:bg-primary/10 rounded-full transition-all text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-[10000] md:hidden ${isMenuOpen ? 'visible' : 'invisible'}`}
                aria-hidden={!isMenuOpen ? 'true' : 'false'}
            >
                {/* Backdrop - Darker and more focus for premium feel */}
                <div
                    className={`absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-500 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Panel - Fully opaque and full-height fix */}
                <div className={`absolute top-0 right-0 h-[100dvh] w-[320px] max-w-[90%] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative">
                        {/* Menu Header - Glass-style indicator */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-white text-xl leading-none">menu_open</span>
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Menú</span>
                            </div>
                            <button
                                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl transition-all"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Cerrar menú"
                            >
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>

                        {/* Scrolling Nav Content */}
                        <nav className="flex-1 overflow-y-scroll p-4 flex flex-col gap-2 bg-white dark:bg-slate-900">
                            {(navigation.length > 0 ? navigation : [
                                { label: 'Librería', link: '/libreria', icon: 'auto_stories' },
                                { label: 'Tecnología', link: '/tecnologia', icon: 'devices' },
                                { label: 'Kits Escolares', link: '/kits', icon: 'package_2' },
                                { label: 'Servicios', link: '/servicios', icon: 'handyman' }
                            ]).map((item: any, idx) => {
                                const menuIcon = item.icon || (item.label.toLowerCase().includes('lib') ? 'auto_stories' : item.label.toLowerCase().includes('tec') ? 'devices' : item.label.toLowerCase().includes('kit') ? 'package_2' : 'arrow_forward');

                                return (
                                    <Link
                                        key={idx}
                                        href={item.link}
                                        className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${pathname === item.link
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:translate-x-1'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl transition-colors ${pathname === item.link ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/15 group-hover:text-primary'}`}>
                                            <span className="material-symbols-outlined text-xl leading-none">{menuIcon}</span>
                                        </div>
                                        <span className="font-bold tracking-tight text-base uppercase leading-none mt-0.5">{item.label}</span>
                                        {pathname !== item.link && (
                                            <span className="material-symbols-outlined text-sm ml-auto opacity-0 group-hover:opacity-40 transition-all translate-x-[-4px] group-hover:translate-x-0">chevron_right</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Premium Footer Area */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 mt-auto">
                            <Link
                                href="/admin/login"
                                className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-black dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white font-bold transition-all shadow-xl active:scale-95"
                            >
                                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                                <span className="uppercase text-[10px] tracking-widest flex-1">Acceso Admin</span>
                                <span className="material-symbols-outlined text-xl opacity-30">arrow_forward</span>
                            </Link>

                            <div className="mt-8 flex flex-col items-center gap-1.5 opacity-40">
                                <div className="h-0.5 w-6 bg-slate-400 rounded-full mb-1"></div>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Pyper Paraguay</p>
                                <p className="text-[8px] font-medium italic">Powered by Premium Engine</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
