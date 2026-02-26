'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    return (
        <AdminGuard>
            <div className="flex min-h-screen bg-slate-50">
                {!isLoginPage && <AdminSidebar />}
                <main className={`flex-1 ${!isLoginPage ? 'ml-0' : ''}`}>
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
