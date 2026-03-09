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
      
      {/* Mobile: No left padding, Desktop: Left padding from sidebar */}
      <div id="admin-content" className="lg:pl-64">
        <AdminTopbar admin={admin} />
        
        {/* Mobile-optimized padding - extra top padding for hamburger button */}
        <main className="p-4 pt-16 sm:p-6 lg:p-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}