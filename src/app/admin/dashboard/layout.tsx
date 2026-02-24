import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-server';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session from cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');

  if (!sessionCookie) {
    redirect('/admin/login');
  }

  // Verify session server-side (with database)
  const admin = await verifyAdminSession(sessionCookie.value);

  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div id="admin-content">
        <AdminTopbar admin={admin} />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}