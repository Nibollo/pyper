'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './pedidos.module.css';
import Link from 'next/link';

export default function PedidosPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, currentStatus: string) => {
        const statuses = ['Pendiente', 'En Proceso', 'Completado'];
        const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: nextStatus })
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders(); // Refresh
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders(); // Refresh
        } catch (err) {
            console.error('Error deleting order:', err);
            alert('Error al eliminar el pedido.');
        }
    };

    const filteredOrders = orders.filter((o: any) => filter === 'Todos' || o.status === filter);

    return (
        <div className={styles.pedidos}>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className="flex flex-col">
                        <h2 className="mb-1">Gestión de Pedidos</h2>
                        <p className="text-slate-400 text-sm">Administra pedidos de la tienda y solicitudes institucionales.</p>
                    </div>
                    <div className={styles.filters}>
                        {['Todos', 'Pendiente', 'En Proceso', 'Completado'].map((f: any) => (
                            <button
                                key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </header>

                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest">Sincronizando pedidos...</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente / Institución</th>
                                        <th>Productos / Motivo</th>
                                        <th>Total / Tipo</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order: any) => (
                                        <tr key={order.id}>
                                            <td><strong>#{order.id.slice(0, 4)}</strong></td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{order.customer_name}</span>
                                                    {order.institution_name && <span className="text-xs text-slate-400">{order.institution_name}</span>}
                                                    <span className="text-xs text-blue-500 font-medium">{order.customer_phone}</span>
                                                </div>
                                            </td>
                                            <td className={styles.itemsCol}>
                                                {order.message ? (
                                                    <span className="italic text-slate-600">"{order.message.slice(0, 50)}..."</span>
                                                ) : (
                                                    <div className="text-xs">
                                                        {Array.isArray(order.items) ? order.items.map((it: any, i: number) => (
                                                            <div key={i}>{it.name} x{it.quantity}</div>
                                                        )) : order.items}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    {order.total_amount > 0 ? (
                                                        <span className="font-bold">{Number(order.total_amount).toLocaleString('es-PY')} Gs.</span>
                                                    ) : (
                                                        <span className="text-red-500 font-bold uppercase text-[10px] tracking-tight">Presupuesto</span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 uppercase">{order.request_type}</span>
                                                </div>
                                            </td>
                                            <td>{new Date(order.created_at).toLocaleDateString('es-PY')}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[order.status.replace(/\s/g, '').toLowerCase()]}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className={styles.actions}>
                                                <button
                                                    className={styles.detailBtn}
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    Ver Detalle
                                                </button>
                                                <button
                                                    className={styles.updateBtn}
                                                    onClick={() => updateOrderStatus(order.id, order.status)}
                                                >
                                                    Pasar a siguiente
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    title="Eliminar Pedido"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {!loading && filteredOrders.length === 0 && (
                            <div className="p-20 text-center opacity-40">
                                <span className="material-symbols-outlined text-6xl mb-4">inventory</span>
                                <p className="font-bold uppercase tracking-widest text-sm">No se encontraron pedidos</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <h3>Detalle del Pedido #{selectedOrder.id.slice(0, 8)}</h3>
                            <button onClick={() => setSelectedOrder(null)}>✕</button>
                        </header>

                        <div className={styles.modalContent}>
                            <div className={styles.modalGrid}>
                                <div className={styles.detailBox}>
                                    <h4>Cliente / Institución</h4>
                                    <p><strong>Nombre:</strong> {selectedOrder.customer_name}</p>
                                    {selectedOrder.institution_name && <p><strong>Institución:</strong> {selectedOrder.institution_name}</p>}
                                    <p><strong>WhatsApp:</strong> {selectedOrder.customer_phone}</p>
                                    <p><strong>Tipo:</strong> {selectedOrder.request_type}</p>
                                </div>

                                <div className={styles.detailBox}>
                                    <h4>Estado y Fecha</h4>
                                    <p><strong>Estado Actual:</strong> <span className={`${styles.statusBadge} ${styles[selectedOrder.status.replace(/\s/g, '').toLowerCase()]}`}>{selectedOrder.status}</span></p>
                                    <p><strong>Fecha:</strong> {new Date(selectedOrder.created_at).toLocaleString('es-PY')}</p>
                                    <p><strong>Total:</strong> {selectedOrder.total_amount > 0 ? `${Number(selectedOrder.total_amount).toLocaleString('es-PY')} Gs.` : 'Presupuesto'}</p>
                                </div>
                            </div>

                            <div className={styles.detailBoxFull}>
                                <h4>Contenido del Pedido</h4>
                                {selectedOrder.message ? (
                                    <div className={styles.messageBox}>
                                        <strong>Mensaje / Motivo:</strong>
                                        <p>{selectedOrder.message}</p>
                                    </div>
                                ) : (
                                    <table className={styles.itemsTable}>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio Unit.</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((it: any, i: number) => (
                                                <tr key={i}>
                                                    <td>{it.name}</td>
                                                    <td>{it.quantity}</td>
                                                    <td>{Number(it.price).toLocaleString('es-PY')} Gs.</td>
                                                    <td>{(it.price * it.quantity).toLocaleString('es-PY')} Gs.</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4}>{selectedOrder.items}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <footer className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Cerrar</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    updateOrderStatus(selectedOrder.id, selectedOrder.status);
                                    setSelectedOrder(null);
                                }}
                            >
                                Avanzar Estado
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
