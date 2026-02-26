'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { settings, navigation } = useConfig();

    if (pathname.startsWith('/admin')) return null;

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-primary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3 decoration-0">
                            {settings.logo_url ? (
                                <img src={settings.logo_url} alt={settings.business_name} className="h-12 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="bg-primary p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-white text-2xl">school</span>
                                    </div>
                                    <h2 className="text-primary text-2xl font-black tracking-tighter">
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

                    <div className="flex items-center gap-4">
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

                        <Link href="/admin/login" className="p-2 hover:bg-primary/10 rounded-full transition-all">
                            <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">person</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
