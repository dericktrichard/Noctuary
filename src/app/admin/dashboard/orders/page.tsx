import { getAllOrders } from '@/services/orders';
import { OrdersList } from '@/components/admin/orders-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function OrdersStats({ orders }: { orders: any[] }) {
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING' || o.status === 'PAID').length,
    active: orders.filter(o => o.status === 'WRITING').length,
    completed: orders.filter(o => o.status === 'DELIVERED').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Total Orders</p>
        <p className="text-2xl font-bold mt-1">{stats.total}</p>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Pending</p>
        <p className="text-2xl font-bold mt-1 text-blue-500">{stats.pending}</p>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Writing</p>
        <p className="text-2xl font-bold mt-1 text-purple-500">{stats.active}</p>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Completed</p>
        <p className="text-2xl font-bold mt-1 text-green-500">{stats.completed}</p>
      </div>
    </div>
  );
}

export default async function OrdersPage() {
  const orders = await getAllOrders();

  const serializedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() || null,
    deliveredAt: order.deliveredAt?.toISOString() || null,
    writingStartedAt: order.writingStartedAt?.toISOString() || null,
    pricePaid: Number(order.pricePaid),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage all poetry commissions and track deadlines
        </p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      }>
        <OrdersStats orders={serializedOrders} />
      </Suspense>

      <OrdersList orders={serializedOrders} />
    </div>
  );
}