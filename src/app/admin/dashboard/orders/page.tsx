import { getAllOrders } from '@/services/orders';
import { OrdersList } from '@/components/admin/orders-list';

export default async function OrdersPage() {
  const orders = await getAllOrders();

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
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage all poetry commissions
        </p>
      </div>

      <OrdersList orders={serializedOrders} />
    </div>
  );
}