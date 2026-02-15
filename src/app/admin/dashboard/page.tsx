import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import { getAllOrders, getDashboardStats } from '@/services/orders';
import { OrdersList } from '@/components/admin/orders-list';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  const [orders, stats] = await Promise.all([
    getAllOrders(),
    getDashboardStats(),
  ]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <AdminHeader admin={admin} />
        
        <DashboardStats stats={stats} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Orders</h2>
          <OrdersList orders={orders} />
        </div>
      </div>
    </div>
  );
}