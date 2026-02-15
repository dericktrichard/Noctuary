'use client';

import { useState } from 'react';
import { OrderStatus, PoemType, Currency, PaymentProvider } from '@prisma/client';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeliverPoemModal } from './deliver-poem-modal';

// Serialized order type for client component
interface SerializedOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  type: PoemType;
  status: OrderStatus;
  title: string | null;
  mood: string | null;
  instructions: string | null;
  pricePaid: number;
  currency: Currency;
  deliveryHours: number;
  paymentProvider: PaymentProvider | null;
  paymentId: string | null;
  paymentStatus: string | null;
  paidAt: string | null;
  poemContent: string | null;
  deliveredAt: string | null;
  accessToken: string;
}

interface OrdersListProps {
  orders: SerializedOrder[];
}

export function OrdersList({ orders }: OrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<SerializedOrder | null>(null);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'PAID':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'WRITING':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'DELIVERED':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  if (orders.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <p className="font-nunito text-muted-foreground">No orders yet</p>
      </GlassCard>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <GlassCard key={order.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge variant="outline" className="font-nunito">
                    {order.type}
                  </Badge>
                </div>

                <div className="space-y-1 font-nunito text-sm">
                  {order.title && (
                    <p>
                      <span className="text-muted-foreground">Title:</span>{' '}
                      <span className="font-bold">{order.title}</span>
                    </p>
                  )}
                  {order.mood && (
                    <p>
                      <span className="text-muted-foreground">Mood:</span> {order.mood}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Email:</span> {order.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Amount:</span>{' '}
                    {order.currency} {order.pricePaid.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Delivery:</span>{' '}
                    {order.deliveryHours} hours
                  </p>
                  <p>
                    <span className="text-muted-foreground">Ordered:</span>{' '}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  {order.instructions && (
                    <p className="mt-2 p-3 glass-light rounded-lg">
                      <span className="text-muted-foreground">Instructions:</span>
                      <br />
                      <span className="italic">{order.instructions}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {order.status === 'PAID' && (
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    size="sm"
                    className="font-nunito"
                  >
                    Deliver Poem
                  </Button>
                )}
                {order.status === 'DELIVERED' && order.poemContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="font-nunito"
                  >
                    View Poem
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {selectedOrder && (
        <DeliverPoemModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}