'use client';

import { useState } from 'react';
import { OrderStatus, PoemType, Currency, PaymentProvider } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DeliverPoemModal } from './deliver-poem-modal';
import { Search, Eye, Send, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'PAID':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'WRITING':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'DELIVERED':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  // Calculate time remaining
  const calculateTimeRemaining = (order: SerializedOrder) => {
    if (!order.paidAt || order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return null;
    }

    const paidTime = new Date(order.paidAt).getTime();
    const deadlineTime = paidTime + (order.deliveryHours * 60 * 60 * 1000);
    const now = Date.now();
    const remainingMs = deadlineTime - now;
    const remainingMinutes = Math.floor(remainingMs / (60 * 1000));

    const isOverdue = remainingMinutes < 0;
    const absMinutes = Math.abs(remainingMinutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    if (isOverdue) {
      return {
        text: `Overdue by ${hours}h ${mins}m`,
        color: 'text-red-500',
        minutes: remainingMinutes,
      };
    }

    if (hours < 2) {
      return {
        text: `${hours}h ${mins}m left`,
        color: 'text-orange-500',
        minutes: remainingMinutes,
      };
    }

    return {
      text: `${hours}h ${mins}m left`,
      color: 'text-muted-foreground',
      minutes: remainingMinutes,
    };
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by time remaining (priority)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aTime = calculateTimeRemaining(a);
    const bTime = calculateTimeRemaining(b);

    // Orders without time remaining go to bottom
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;

    // Sort by time remaining (least time first = highest priority)
    return aTime.minutes - bTime.minutes;
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
        <p className="font-nunito text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email, order ID, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-nunito"
          />
        </div>
        
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'PAID', 'WRITING', 'DELIVERED'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="font-nunito"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-nunito">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-nunito">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-nunito">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-nunito">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-nunito">
                  Time Remaining
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider font-nunito">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOrders.map((order) => {
                const timeRemaining = calculateTimeRemaining(order);
                return (
                  <>
                    {/* Main Row */}
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {order.instructions && (
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="p-1 hover:bg-accent rounded transition-colors"
                              title="View instructions"
                            >
                              {expandedOrder === order.id ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium font-nunito">
                              {order.title || `${order.type} Poem`}
                            </span>
                            <span className="text-xs text-muted-foreground font-nunito">
                              ID: {order.id.slice(0, 8)}...
                            </span>
                            {order.mood && (
                              <span className="text-xs text-muted-foreground font-nunito mt-1">
                                Mood: {order.mood}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-nunito">{order.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium font-nunito">
                          {order.currency} {order.pricePaid.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {timeRemaining ? (
                          <span className={`text-sm font-nunito font-semibold ${timeRemaining.color}`}>
                            {timeRemaining.text}
                          </span>
                        ) : (
                          <span className="text-sm font-nunito text-muted-foreground">
                            {order.status === 'DELIVERED' ? 'Completed' : 'Pending payment'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'PAID' && (
                            <Button
                              onClick={() => setSelectedOrder(order)}
                              size="sm"
                              className="font-nunito"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Deliver
                            </Button>
                          )}
                          {order.status === 'DELIVERED' && order.poemContent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="font-nunito"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row for Instructions */}
                    {expandedOrder === order.id && order.instructions && (
                      <tr className="bg-muted/30">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="max-w-3xl">
                            <h4 className="font-semibold font-nunito text-sm mb-2 flex items-center gap-2">
                              <ChevronDown className="w-4 h-4" />
                              Special Instructions:
                            </h4>
                            <div className="pl-6 p-3 rounded-lg bg-card border border-border">
                              <p className="text-sm font-nunito text-foreground whitespace-pre-wrap leading-relaxed">
                                {order.instructions}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedOrders.length === 0 && (
          <div className="p-12 text-center">
            <p className="font-nunito text-muted-foreground">No orders match your filters</p>
          </div>
        )}
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