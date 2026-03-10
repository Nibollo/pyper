'use client';

import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StoreManager from '@/components/admin/StoreManager';
import styles from '../cms/cms.module.css';

export default function AdminTiendasPage() {
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
