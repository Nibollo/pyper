import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 overflow-auto bg-[#fafafa]">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
