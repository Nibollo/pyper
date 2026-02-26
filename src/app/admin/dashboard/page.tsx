'use client';
// BUILD VERSION: 4 - VERIFYING SYNC WITH VERCEL

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { label: 'Ventas del Mes', value: '--- Gs.', trend: '+0%', color: '#25D366' },
        { label: 'Pedidos Pendientes', value: '---', trend: 'Cargando', color: '#E30613' },
        { label: 'Productos en Stock', value: '---', trend: 'Cargando', color: '#1A1A1A' },
        { label: 'Consultas WhatsApp', value: '---', trend: '+0%', color: '#0070f3' },
    ]);

    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();

                // 1. Monthly Sales (Completed Orders)
                const { data: salesData } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .eq('status', 'Completado')
                    .gte('created_at', firstDayOfMonth);

                const monthlyTotal = salesData?.reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0) || 0;

                // 2. Pending Orders
                const { count: pendingCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'Pendiente');

                // 3. Today's Inquiries (New Orders/Requests)
                const { count: todayCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', todayStart);

                // 4. Product Stock (Total Products)
                const { count: productCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                // 5. Category Breakdown
                const { data: products } = await supabase
                    .from('products')
                    .select('category');

                const catMap: Record<string, number> = {};
                products?.forEach((p: any) => {
                    if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1;
                });
                const sortedCats = Object.entries(catMap)
                    .map(([name, count]: [string, number]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setCategoryStats(sortedCats);

                setStats([
                    { label: 'Ventas del Mes', value: `${monthlyTotal.toLocaleString('es-PY')} Gs.`, trend: 'Real', color: '#25D366' },
                    { label: 'Pedidos Pendientes', value: String(pendingCount || 0), trend: 'Pendientes', color: '#E30613' },
                    { label: 'Consultas Hoy', value: String(todayCount || 0), trend: 'Nuevas', color: '#0070f3' },
                    { label: 'Items en Catálogo', value: String(productCount || 120), trend: 'Total', color: '#1A1A1A' },
                ]);

                // 6. Recent Orders
                const { data: orders } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (orders) setRecentOrders(orders);
            } catch (err) {
                console.error('Error fetching dashboard data');
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    return (
        <div className={styles.dashboard}>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 leading-none">Resumen Operativo</h2>
                        <p className="text-slate-500 mt-2 italic text-sm">Monitoreo de ventas y gestiones en tiempo real.</p>
                    </div>
                    <div className={styles.userProfile}>
                        <div className="text-right mr-4">
                            <span className="block text-sm font-bold text-slate-900">Admin Pyper</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Super Usuario</span>
                        </div>
                        <div className={styles.avatar}>A</div>
                    </div>
                </header>

                <section className={styles.statsGrid}>
                    {stats.map((stat, i) => (
                        <div key={i} className={styles.statCard}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <div className={styles.statValueRow}>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statTrend} style={{ color: stat.color }}>{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </section>

                <div className={styles.dashboardGrid}>
                    <section className={styles.tableSection}>
                        <div className={styles.sectionTitle}>
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Pedidos Recientes</h3>
                            <Link href="/admin/pedidos" className={styles.viewAll}>Ver todo el historial</Link>
                        </div>
                        <div className={styles.tableWrapper}>
                            {loading ? (
                                <div className="p-10 text-center opacity-50 italic">Sincronizando con base de datos...</div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Cliente</th>
                                            <th>Total</th>
                                            <th>Estado</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map(order => (
                                            <tr key={order.id}>
                                                <td><strong className="text-slate-400">#{order.id.slice(0, 5)}</strong></td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{order.customer_name}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase font-medium">{order.request_type}</span>
                                                    </div>
                                                </td>
                                                <td className="font-bold text-slate-900">
                                                    {order.total_amount > 0 ? `${Number(order.total_amount).toLocaleString('es-PY')} Gs.` : 'Presupuesto'}
                                                </td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles[order.status?.replace(/\s/g, '').toLowerCase() || 'pendiente']}`}>
                                                        {order.status || 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td><Link href="/admin/pedidos" className={styles.editBtn}>Gestionar</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>

                    <aside className={styles.analyticsSide}>
                        <div className={styles.categoryCard}>
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b">Stock por Categoría</h3>
                            <div className="space-y-5">
                                {categoryStats.map((cat, i) => (
                                    <div key={i} className={styles.catRow}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                                            <span className="text-xs font-mono text-slate-400">{cat.count} ítems</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${(cat.count / (categoryStats[0]?.count || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {categoryStats.length === 0 && <p className="text-xs text-slate-400 italic">No hay datos de categorías.</p>}
                            </div>
                        </div>

                        <div className={styles.quickActions}>
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b">Accesos Críticos</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/admin/inventario" className={styles.actionBtn}>
                                    <span className="material-symbols-outlined">inventory_2</span>
                                    Inventario
                                </Link>
                                <Link href="/admin/cms" className={styles.actionBtn}>
                                    <span className="material-symbols-outlined">edit_note</span>
                                    Gestión CMS
                                </Link>
                                <Link href="/admin/kits" className={styles.actionBtn}>
                                    <span className="material-symbols-outlined">package_2</span>
                                    Kits
                                </Link>
                                <Link href="/admin/config" className={styles.actionBtn}>
                                    <span className="material-symbols-outlined">settings</span>
                                    Ajustes
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
