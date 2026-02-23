import { getAllOrders } from '@/services/orders';
import { getRevenueStats } from '@/services/analytics';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { OrdersList } from '@/components/admin/orders-list';
import { OrderStatus } from '@prisma/client';

export default async function AdminDashboardPage() {
  const [orders, revenueStats] = await Promise.all([
    getAllOrders(),
    getRevenueStats(),
  ]);

  // Calculate stats from orders
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    paid: orders.filter(o => o.status === OrderStatus.PAID).length,
    writing: orders.filter(o => o.status === OrderStatus.WRITING).length,
    delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    todayOrders: orders.filter(o => {
      const today = new Date();
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === today.toDateString();
    }).length,
  };

  // Serialize orders for client component
  const serializedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() || null,
    deliveredAt: order.deliveredAt?.toISOString() || null,
    pricePaid: Number(order.pricePaid),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage your poetry commissions
        </p>
      </div>

      <DashboardStats stats={orderStats} />

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold font-nunito text-sm mb-4">Revenue (USD)</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross:</span>
              <span className="font-mono">${revenueStats.revenue.usd.gross.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fees:</span>
              <span className="font-mono text-red-500">-${revenueStats.revenue.usd.fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Net:</span>
              <span className="font-mono text-green-500">${revenueStats.revenue.usd.net.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold font-nunito text-sm mb-4">Revenue (KES)</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross:</span>
              <span className="font-mono">Ksh {revenueStats.revenue.kes.gross.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fees:</span>
              <span className="font-mono text-red-500">-Ksh {revenueStats.revenue.kes.fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Net:</span>
              <span className="font-mono text-green-500">Ksh {revenueStats.revenue.kes.net.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Orders</h2>
        <OrdersList orders={serializedOrders} />
      </div>
    </div>
  );
}