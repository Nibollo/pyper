'use client';
// BUILD VERSION: 4 - VERIFYING SYNC WITH VERCEL

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { label: 'Ventas del Mes', value: '--- Gs.', trend: '...', color: '#25D366' },
        { label: 'Visitas Hoy', value: '---', trend: '...', color: '#E30613' },
        { label: 'Visitantes Únicos', value: '---', trend: '...', color: '#0070f3' },
        { label: 'Items en Catálogo', value: '---', trend: '...', color: '#1A1A1A' },
    ]);

    const [temporalStats, setTemporalStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    const [topPages, setTopPages] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const now = new Date();
                const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
                const startOfWeek = new Date(new Date().setDate(now.getDate() - 7)).toISOString();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

                // 1. Monthly Sales
                const { data: salesData } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .eq('status', 'Completado')
                    .gte('created_at', startOfMonth);

                const monthlySalesTotal = salesData?.reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0) || 0;

                // 2. Item Count
                const { count: productCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                // 3. Analytics: All Temporal ranges
                const fetchCount = async (from: string) => {
                    const { count } = await supabase
                        .from('analytics')
                        .select('*', { count: 'exact', head: true })
                        .gte('created_at', from);
                    return count || 0;
                };

                const [todayV, weekV, monthV, yearV] = await Promise.all([
                    fetchCount(startOfToday),
                    fetchCount(startOfWeek),
                    fetchCount(startOfMonth),
                    fetchCount(startOfYear)
                ]);

                setTemporalStats({ today: todayV, week: weekV, month: monthV, year: yearV });

                // 4. Unique Visitors (Total)
                const { data: visitors } = await supabase
                    .from('analytics')
                    .select('visitor_id');

                const uniqueVisitors = new Set(visitors?.map((v: any) => v.visitor_id)).size;

                setStats([
                    { label: 'Ventas del Mes', value: `${monthlySalesTotal.toLocaleString('es-PY')} Gs.`, trend: 'Real', color: '#25D366' },
                    { label: 'Visitas Hoy', value: String(todayV), trend: '24h', color: '#E30613' },
                    { label: 'Visitantes Únicos', value: String(uniqueVisitors), trend: 'Total', color: '#0070f3' },
                    { label: 'Items en Catálogo', value: String(productCount || 0), trend: 'Stock', color: '#1A1A1A' },
                ]);

                // 5. Top Pages Analysis
                const { data: pagesData } = await supabase
                    .from('analytics')
                    .select('page_path');

                const pageMap: Record<string, number> = {};
                pagesData?.forEach((p: any) => {
                    const path = p.page_path === '/' ? 'Inicio' : p.page_path;
                    pageMap[path] = (pageMap[path] || 0) + 1;
                });

                const sortedPages = Object.entries(pageMap)
                    .map(([path, count]) => ({ path, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setTopPages(sortedPages);

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
                                        {recentOrders.map((order: any) => (
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
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 pb-2 border-b">Analítica Temporal</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Visitas Hoy', value: temporalStats.today, icon: 'today' },
                                    { label: 'Últimos 7 Días', value: temporalStats.week, icon: 'calendar_view_week' },
                                    { label: 'Este Mes', value: temporalStats.month, icon: 'calendar_month' },
                                    { label: 'Total del Año', value: temporalStats.year, icon: 'history' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.categoryCard}>
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 pb-2 border-b">Páginas más Visitadas</h3>
                            <div className="space-y-4">
                                {topPages.map((page, i) => (
                                    <div key={i} className="flex flex-col gap-1.5 group">
                                        <div className="flex justify-between items-center text-[11px] font-bold">
                                            <span className="text-slate-500 truncate max-w-[140px] group-hover:text-primary transition-all">/{page.path.toLowerCase()}</span>
                                            <span className="text-slate-900 dark:text-white">{page.count} views</span>
                                        </div>
                                        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                                style={{ width: `${(page.count / (topPages[0]?.count || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {topPages.length === 0 && <p className="text-xs text-slate-400 italic">No hay datos de tráfico aún.</p>}
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
