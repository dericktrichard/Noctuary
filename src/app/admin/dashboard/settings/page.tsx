import { getAdminStats } from '@/services/admin';
import { AdminSettingsForm } from '@/components/admin/admin-settings-form';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
  // Verify admin is logged in
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');

  if (!sessionCookie) {
    redirect('/admin/login');
  }

  const admin = await verifyAdminSession(sessionCookie.value);

  if (!admin) {
    redirect('/admin/login');
  }

  // Get system stats
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage your account and system preferences
        </p>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-6 rounded-lg border border-border">
          <div className="text-sm font-nunito text-muted-foreground">Total Orders</div>
          <div className="text-3xl font-bold mt-2">{stats.totalOrders}</div>
        </div>
        <div className="glass-card p-6 rounded-lg border border-border">
          <div className="text-sm font-nunito text-muted-foreground">Delivered</div>
          <div className="text-3xl font-bold mt-2 text-green-500">{stats.deliveredOrders}</div>
        </div>
        <div className="glass-card p-6 rounded-lg border border-border">
          <div className="text-sm font-nunito text-muted-foreground">Pending</div>
          <div className="text-3xl font-bold mt-2 text-orange-500">{stats.pendingOrders}</div>
        </div>
      </div>

      {/* Settings Form */}
      <AdminSettingsForm currentEmail={admin.email} />
    </div>
  );
}