import { getAllOrders } from '@/services/orders';
import { getRevenueStats } from '@/services/analytics';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { RevenueCharts } from '@/components/admin/revenue-charts';
import { OrderStatus } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [orders, revenueStats] = await Promise.all([
    getAllOrders(),
    getRevenueStats(),
  ]);

  // Calculate order stats
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

  // Get urgent orders count
  const urgentOrders = orders.filter(o => {
    if (o.status !== OrderStatus.PAID || !o.paidAt) return false;
    
    const deadline = new Date(o.paidAt);
    deadline.setHours(deadline.getHours() + o.deliveryHours);
    const now = new Date();
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursRemaining < 6 && hoursRemaining > 0;
  }).length;

  const overdueOrders = orders.filter(o => {
    if (o.status !== OrderStatus.PAID || !o.paidAt) return false;
    
    const deadline = new Date(o.paidAt);
    deadline.setHours(deadline.getHours() + o.deliveryHours);
    const now = new Date();
    
    return now > deadline;
  }).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="font-nunito text-muted-foreground mt-2">
            Overview of your poetry business
          </p>
        </div>
        
        <Link href="/admin/dashboard/orders">
          <Button className="font-nunito gap-2">
            View All Orders
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Alert Banners */}
      {(overdueOrders > 0 || urgentOrders > 0) && (
        <div className="space-y-3">
          {overdueOrders > 0 && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-bold text-red-500">
                    {overdueOrders} {overdueOrders === 1 ? 'Order' : 'Orders'} Overdue
                  </p>
                  <p className="text-sm text-muted-foreground font-nunito">
                    These orders have passed their delivery deadline
                  </p>
                </div>
              </div>
              <Link href="/admin/dashboard/orders">
                <Button variant="destructive" size="sm">View Orders</Button>
              </Link>
            </div>
          )}

          {urgentOrders > 0 && (
            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-orange-500">
                    {urgentOrders} {urgentOrders === 1 ? 'Order' : 'Orders'} Due Soon
                  </p>
                  <p className="text-sm text-muted-foreground font-nunito">
                    Less than 6 hours remaining
                  </p>
                </div>
              </div>
              <Link href="/admin/dashboard/orders">
                <Button variant="outline" size="sm">View Orders</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Order Stats */}
      <DashboardStats stats={orderStats} />

      {/* Revenue Analytics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Revenue Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* USD Revenue Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold font-nunito text-sm text-muted-foreground mb-4">
              USD Revenue
            </h3>
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

          {/* KES Revenue Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold font-nunito text-sm text-muted-foreground mb-4">
              KES Revenue
            </h3>
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

          {/* Payment Providers Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold font-nunito text-sm text-muted-foreground mb-4">
              Payment Methods
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">PayPal</span>
                <span className="font-bold">{revenueStats.byProvider.paypal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paystack</span>
                <span className="font-bold">{revenueStats.byProvider.paystack}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-bold">Total</span>
                <span className="font-bold">{revenueStats.totalOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Charts */}
        <RevenueCharts orders={serializedOrders} />
      </div>
    </div>
  );
}