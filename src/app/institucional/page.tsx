'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './institucional.module.css';

export default function InstitucionalPage() {
    const [formData, setFormData] = useState({
        institution: '',
        contact: '',
        phone: '',
        type: 'Seleccione una opción',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.type === 'Seleccione una opción') {
            alert('Por favor selecciona un tipo de solicitud');
            return;
        }

        setStatus('loading');
        try {
            const { error } = await supabase
                .from('orders')
                .insert([{
                    customer_name: formData.contact,
                    customer_phone: formData.phone,
                    institution_name: formData.institution,
                    request_type: formData.type,
                    message: formData.message,
                    status: 'Pendiente'
                }]);

            if (error) throw error;
            setStatus('success');
            setFormData({
                institution: '',
                contact: '',
                phone: '',
                type: 'Seleccione una opción',
                message: ''
            });
        } catch (err) {
            console.error('Error submitting request:', err);
            setStatus('error');
        }
    };

    return (
        <div className={styles.institucional}>
            <header className={styles.header}>
                <div className="container">
                    <h1>Soluciones para Instituciones</h1>
                    <p>Convenios exclusivos, venta mayorista y servicios personalizados para colegios y empresas.</p>
                </div>
            </header>

            <section className="section container">
                <div className={styles.grid}>
                    <div className={styles.info}>
                        <h2>Impulsando la Educación Juntos</h2>
                        <p>En Pyper Paraguay, entendemos las necesidades de las instituciones educativas. Por eso ofrecemos un sistema integral de apoyo para directivos y docentes.</p>

                        <ul className={styles.benefits}>
                            <li>
                                <strong>📦 Kits por grado:</strong> Armamos kits personalizados según la lista de materiales de cada grado.
                            </li>
                            <li>
                                <strong>💰 Precios Mayoristas:</strong> Descuentos significativos por volumen de compra.
                            </li>
                            <li>
                                <strong>🤝 Convenios:</strong> Alianzas estratégicas para beneficios recurrentes a padres y alumnos.
                            </li>
                            <li>
                                <strong>📄 Facturación Legal:</strong> Procesos transparentes y formales para todas las instituciones.
                            </li>
                        </ul>
                    </div>

                    <div className={styles.formCard}>
                        <h3>Solicitar Presupuesto Institucional</h3>
                        <p>Completa el formulario y un asesor se pondrá en contacto en menos de 24hs.</p>

                        {status === 'success' ? (
                            <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center">
                                <span className="material-symbols-outlined text-green-500 text-5xl mb-4">check_circle</span>
                                <h4 className="text-green-900 font-black uppercase text-xl mb-2">¡Solicitud Enviada!</h4>
                                <p className="text-green-700">Tu presupuesto está en camino. Un asesor te contactará vía WhatsApp a la brevedad.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-green-600 font-bold underline"
                                >
                                    Enviar otra solicitud
                                </button>
                            </div>
                        ) : (
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label>Institución / Colegio</label>
                                    <input
                                        type="text"
                                        placeholder="Nombre de la institución"
                                        required
                                        value={formData.institution}
                                        onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Nombre de Contacto</label>
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        required
                                        value={formData.contact}
                                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>WhatsApp / Teléfono</label>
                                    <input
                                        type="tel"
                                        placeholder="+595 9XX XXX XXX"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="tipo-solicitud">Tipo de Solicitud</label>
                                    <select
                                        id="tipo-solicitud"
                                        aria-label="Seleccionar tipo de solicitud"
                                        required
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option disabled>Seleccione una opción</option>
                                        <option value="Venta Mayorista">Venta Mayorista</option>
                                        <option value="Kits Escolares por Grado">Kits Escolares por Grado</option>
                                        <option value="Convenio Educativo">Convenio Educativo</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="mensaje">Mensaje</label>
                                    <textarea
                                        id="mensaje"
                                        placeholder="Cuéntanos más sobre tus necesidades..."
                                        rows={4}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${styles.submitBtn}`}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                                {status === 'error' && (
                                    <p className="text-red-500 text-sm font-bold mt-4">Ocurrió un error. Por favor intenta de nuevo.</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.kitsPromo}>
                <div className="container">
                    <div className={styles.promoBox}>
                        <h2>¿Eres padre o madre?</h2>
                        <p>Busca el kit escolar de tu colegio y grado. ¡Nosotros lo armamos por ti!</p>
                        <button className="btn btn-outline">Buscar Kits Escolares</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
