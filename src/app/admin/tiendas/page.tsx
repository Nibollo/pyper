'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StoreManager from '@/components/admin/StoreManager';
import styles from '../cms/cms.module.css';

export default function AdminTiendasPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <AdminGuard>
            <div className={styles.cmsPage}>
                <AdminSidebar />

                <main className={styles.mainContent}>
                    <StoreManager />
                </main>
            </div>
        </AdminGuard>
    );
}
