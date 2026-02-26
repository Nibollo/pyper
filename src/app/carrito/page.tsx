'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './carrito.module.css';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import { supabase } from '@/lib/supabase';
import { PARAGUAY_LOCATIONS } from '@/lib/paraguay-locations';

export default function CarritoPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { settings } = useConfig();
    const [isCheckout, setIsCheckout] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: 'Asunción',
        paymentMethod: 'cash_on_delivery'
    });

    const isDirectMode = settings.checkout_mode === 'direct';
    const acceptedPayments = settings.accepted_payment_methods?.split(',') || ['cash_on_delivery'];

    const handleWhatsAppOnly = () => {
        const message = cart.map(item =>
            `*${item.name}* (x${item.quantity}) - ${(item.price * item.quantity).toLocaleString('es-PY')} Gs.`
        ).join('%0A');

        const total = `*Total: ${cartTotal.toLocaleString('es-PY')} Gs.*`;
        const whatsappUrl = `https://wa.me/${settings.whatsapp || '5959XXXXXXXX'}?text=Hola,%20me%20gustaría%20realizar%20un%20pedido%20desde%20la%20web%20Pyper:%0A%0A${message}%0A%0A${total}%0A%0A*Pago%20contra%20entrega%20/%20Transferencia*`;

        window.open(whatsappUrl, '_blank');
    };

    const handleDirectCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('orders')
                .insert([{
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    message: `Dirección: ${formData.address}, Ciudad: ${formData.city}`,
                    items: cart.map(it => ({ id: it.id, name: it.name, quantity: it.quantity, price: it.price })),
                    total_amount: cartTotal,
                    request_type: 'Venta Directa Ecommerce',
                    status: 'Pendiente'
                }]);

            if (error) throw error;

            setOrderSuccess(true);
            clearCart();
        } catch (err) {
            console.error('Error saving order:', err);
            alert('Hubo un error al procesar tu pedido. Por favor intenta por WhatsApp.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className={`container ${styles.emptyCart}`}>
                <div className={styles.emptyContent}>
                    <span>🛒</span>
                    <h2>Tu carrito está vacío</h2>
                    <p>Explora nuestra librería y tecnología para encontrar lo que necesitas.</p>
                    <Link href="/libreria" className="btn btn-primary">Ir a la Librería</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`container ${styles.carrito}`}>
            <h1>Tu Carrito de Compras</h1>

            {orderSuccess ? (
                <div className={styles.successWrapper}>
                    <span className="material-symbols-outlined text-green-500 text-7xl mb-4">task_alt</span>
                    <h2>¡Pedido Realizado con Éxito!</h2>
                    <p>Gracias por tu compra. Muy pronto nos pondremos en contacto contigo para coordinar la entrega.</p>
                    <Link href="/libreria" className="btn btn-primary mt-8">Seguir Comprando</Link>
                </div>
            ) : (
                <div className={styles.cartGrid}>
                    <div className={styles.itemsList}>
                        {isCheckout ? (
                            <div className={styles.checkoutForm}>
                                <h3>Datos de Entrega</h3>
                                <form onSubmit={handleDirectCheckout}>
                                    <div className={styles.formGroup}>
                                        <label>Nombre Completo</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej: Juan Pérez"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>WhatsApp de Contacto</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Ej: 0981 000 000"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Dirección Exacta</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Calle, Nro de casa, Referencia"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Ciudad</label>
                                        <select
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            title="Seleccionar ciudad de entrega"
                                        >
                                            {PARAGUAY_LOCATIONS.map(dept => (
                                                <optgroup key={dept.department} label={dept.department}>
                                                    {dept.cities.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                            <option value="Otro">Otro (Interior)</option>
                                        </select>
                                    </div>

                                    <h3 className="mt-8">Método de Pago</h3>
                                    <div className={styles.paymentMethods}>
                                        {acceptedPayments.map((method: string) => (
                                            <label key={method} className={styles.methodOption}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method}
                                                    checked={formData.paymentMethod === method}
                                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                />
                                                <span className="flex items-center gap-2">
                                                    {method === 'cash_on_delivery' && '💵 Pago contra entrega'}
                                                    {method === 'transfer' && '🏦 Transferencia Bancaria'}
                                                    {method === 'direct_pay' && '💳 Pago Directo'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            type="button"
                                            className="btn btn-outline flex-1"
                                            onClick={() => setIsCheckout(false)}
                                        >
                                            Volver al Carrito
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-1"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Procesando...' : 'Finalizar Pedido'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <>
                                {cart.map(item => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemImage}>
                                            {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                                                <img src={item.image} alt={item.name} />
                                            ) : (
                                                item.image || '📓'
                                            )}
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemCat}>{item.category}</span>
                                            <h3>{item.name}</h3>
                                            <p className={styles.itemPrice}>{item.price.toLocaleString('es-PY')} Gs.</p>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <div className={styles.quantityBtns}>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className={styles.clearBtn} onClick={clearCart}>Vaciar Carrito</button>
                            </>
                        )}
                    </div>

                    <aside className={styles.summary}>
                        <h3>Resumen del Pedido</h3>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{cartTotal.toLocaleString('es-PY')} Gs.</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Envío</span>
                            <span className={styles.freeLabel}>Calculado al confirmar</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>{cartTotal.toLocaleString('es-PY')} Gs.</span>
                        </div>

                        {!isCheckout && (
                            <>
                                <div className={styles.paymentInfo}>
                                    <p><strong>Métodos de pago aceptados:</strong></p>
                                    <ul>
                                        {acceptedPayments.map((method: string) => (
                                            <li key={method}>
                                                {method === 'cash_on_delivery' && '💵 Pago contra entrega'}
                                                {method === 'transfer' && '🏦 Transferencia Bancaria'}
                                                {method === 'direct_pay' && '💳 Pago Directo'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className={isDirectMode ? 'btn btn-primary w-full py-4 text-lg' : styles.checkoutBtn}
                                    onClick={() => isDirectMode ? setIsCheckout(true) : handleWhatsAppOnly()}
                                >
                                    {isDirectMode ? 'Ir a Finalizar Compra' : 'Confirmar por WhatsApp'}
                                </button>

                                <Link href="/libreria" className={styles.continueLink}>
                                    ← Seguir comprando
                                </Link>
                            </>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}
