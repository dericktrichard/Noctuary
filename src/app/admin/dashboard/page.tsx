import { getAllOrders, getDashboardStats } from '@/services/orders';
import { OrdersList } from '@/components/admin/orders-list';
import { DashboardStats } from '@/components/admin/dashboard-stats';

export default async function AdminDashboardPage() {
  const [ordersRaw, stats] = await Promise.all([
    getAllOrders(),
    getDashboardStats(),
  ]);

  const orders = ordersRaw.map((order) => ({
    ...order,
    pricePaid: Number(order.pricePaid),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() || null,
    deliveredAt: order.deliveredAt?.toISOString() || null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage your poetry commissions
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
        <OrdersList orders={orders} />
      </div>
    </div>
  );
}