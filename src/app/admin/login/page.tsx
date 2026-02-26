'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './login.module.css';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.logo}>
                    <img
                        src="/images/admin/logo-admin.png"
                        alt="PYPER"
                        className={styles.logoImg}
                    />
                    <span className={styles.logoSubtext}>ADMINISTRACIÓN</span>
                </div>

                <h2>Iniciar Sesión</h2>
                <p>Panel de gestión de PYPER PARAGUAY</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Usuario / Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@pyper.com.py"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar al Panel'}
                    </button>
                </form>

                <Link href="/" className={styles.backLink}>← Volver a la web</Link>
            </div>
        </div>
    );
}
