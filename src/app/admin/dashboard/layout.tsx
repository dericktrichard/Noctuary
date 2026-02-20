import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { getCurrentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      {/* Updated: Use dynamic padding based on sidebar state */}
      <div className="lg:pl-64 transition-all duration-300" id="admin-content">
        <AdminTopbar admin={admin} />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}