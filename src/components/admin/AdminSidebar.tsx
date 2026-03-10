import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';

const navItems = [
    { label: 'Dashboard', icon: 'grid_view', path: '/admin/dashboard' },
    { label: 'Inventario', icon: 'inventory_2', path: '/admin/inventario' },
    { label: 'Pedidos', icon: 'shopping_cart', path: '/admin/pedidos' },
    { label: 'Gestión de Kits', icon: 'inventory', path: '/admin/kits' },
    { label: 'Anuncios', icon: 'campaign', path: '/admin/ads' },
    { label: 'Locales Asociados', icon: 'storefront', path: '/admin/tiendas' },
    { label: 'Páginas CMS', icon: 'description', path: '/admin/cms' },
    { label: 'Blogs & SEO', icon: 'edit_note', path: '/admin/blogs' },
    { label: 'Configuración', icon: 'settings', path: '/admin/config' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarLogo}>
                <Link href="/admin/dashboard" className={styles.logoText}>PYPER</Link>
                <p className={styles.logoSub}>ECOSISTEMA ADMIN</p>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`${styles.navItem} ${pathname.startsWith(item.path) ? styles.active : ''}`}
                    >
                        <span className={`material-symbols-outlined ${styles.icon}`}>{item.icon}</span>
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <Link href="/admin/login" className={styles.logout}>
                <span className="material-symbols-outlined">logout</span>
                <span className={styles.label}>Cerrar Sesión</span>
            </Link>
        </aside>
    );
}
