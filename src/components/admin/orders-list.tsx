'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { deliverPoemAction, acceptOrderAction, rejectOrderAction } from '@/app/actions/admin';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Search, Eye, Send, ChevronDown, ChevronUp, Clock, Mail, Calendar, AlertTriangle, Timer } from 'lucide-react';
import React from 'react';

type Order = {
  id: string;
  email: string;
  type: 'QUICK' | 'CUSTOM';
  status: 'PENDING' | 'PAID' | 'WRITING' | 'DELIVERED' | 'CANCELLED';
  title: string | null;
  mood: string | null;
  instructions: string | null;
  pricePaid: number;
  currency: 'USD' | 'KES'; 
  deliveryHours: number;
  paidAt: string | null;
  deliveredAt: string | null;
  writingStartedAt: string | null;
  poemContent: string | null;
  createdAt: string;
};

interface OrdersListProps {
  orders: Order[];
}

// Fixed date formatter - consistent server/client
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDeadlineStatus(order: Order) {
  let startTime: string | null = null;

  if (order.status === 'WRITING' && order.writingStartedAt) {
    startTime = order.writingStartedAt;
  } else if (order.status === 'PAID' && order.paidAt) {
    startTime = order.paidAt;
  }

  if (!startTime) return { status: 'none', badge: null };

  const deadline = new Date(startTime);
  deadline.setHours(deadline.getHours() + order.deliveryHours);
  
  const now = new Date();
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining < 0) {
    return { 
      status: 'overdue', 
      badge: (
        <Badge variant="destructive" className="font-nunito gap-1">
          <AlertTriangle className="w-3 h-3" />
          OVERDUE
        </Badge>
      )
    };
  } else if (hoursRemaining < 2) {
    return { 
      status: 'urgent', 
      badge: (
        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500 font-nunito gap-1">
          <Timer className="w-3 h-3" />
          URGENT
        </Badge>
      )
    };
  } else if (hoursRemaining < 6) {
    return { 
      status: 'soon', 
      badge: (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500 font-nunito gap-1">
          <Clock className="w-3 h-3" />
          SOON
        </Badge>
      )
    };
  }

  return { status: 'normal', badge: null };
}

function calculateTimeRemaining(order: Order) {
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return null;
  }

  let startTime: string | null = null;

  if (order.status === 'WRITING' && order.writingStartedAt) {
    startTime = order.writingStartedAt;
  } else if (order.status === 'PAID' && order.paidAt) {
    startTime = order.paidAt;
  }

  if (!startTime) return null;

  const paidTime = new Date(startTime).getTime();
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
}

function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'PENDING': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    case 'PAID': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'WRITING': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'DELIVERED': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

export function OrdersList({ orders }: OrdersListProps) {
  const router = useRouter();
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [poemContent, setPoemContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'ALL'>('ALL');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingOrderId(orderId);
  };

  const confirmAcceptOrder = async () => {
    if (!acceptingOrderId) return;

    const result = await acceptOrderAction(acceptingOrderId);
    
    if (result.success) {
      toast.success('Order accepted! Deadline countdown started.');
      setAcceptingOrderId(null);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to accept order');
    }
  };

  const handleRejectOrder = (orderId: string) => {
    setRejectingOrderId(orderId);
  };

  const submitRejectOrder = async () => {
    if (!rejectingOrderId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const result = await rejectOrderAction(rejectingOrderId, rejectReason);
    
    if (result.success) {
      toast.success('Order rejected. Remember to process refund manually.');
      setRejectingOrderId(null);
      setRejectReason('');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to reject order');
    }
  };

  const handleDeliverPoem = async () => {
    if (!poemContent.trim()) {
      toast.error('Please write the poem first');
      return;
    }

    if (!deliveringOrderId) return;

    setIsSubmitting(true);

    const result = await deliverPoemAction(deliveringOrderId, poemContent.trim());

    if (result.success) {
      toast.success('Poem delivered successfully!');
      setDeliveringOrderId(null);
      setPoemContent('');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to deliver poem');
    }

    setIsSubmitting(false);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusPriority = { PAID: 0, WRITING: 1, PENDING: 2, DELIVERED: 3, CANCELLED: 4 };
    const typePriority = { CUSTOM: 0, QUICK: 1 };
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    
    if (typePriority[a.type] !== typePriority[b.type]) {
      return typePriority[a.type] - typePriority[b.type];
    }
    
    if (a.pricePaid !== b.pricePaid) {
      return b.pricePaid - a.pricePaid;
    }
    
    const aTime = calculateTimeRemaining(a);
    const bTime = calculateTimeRemaining(b);
    if (aTime && bTime) {
      return aTime.minutes - bTime.minutes;
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-lg border border-border">
        <p className="font-nunito text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-nunito"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-lg glass-card border border-border font-philosopher text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="WRITING">Writing</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="hidden lg:block overflow-hidden rounded-lg border border-border glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOrders.map((order) => {
                const timeRemaining = calculateTimeRemaining(order);
                const deadlineStatus = getDeadlineStatus(order);
                const hasDetails = order.title || order.mood || order.instructions;

                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-medium font-nunito">{order.email}</div>
                            <div className="text-xs text-muted-foreground font-nunito">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                          {hasDetails && (
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {expandedOrder === order.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={order.type === 'CUSTOM' ? 'default' : 'outline'} className="font-nunito">
                          {order.type}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold font-nunito">
                          {formatCurrency(order.pricePaid, order.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground font-nunito">
                          {order.deliveryHours}h delivery
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {deadlineStatus.badge}
                          {timeRemaining && (
                            <span className={`text-sm font-nunito ${timeRemaining.color}`}>
                              {timeRemaining.text}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(order.status)} font-nunito`}>
                          {order.status === 'DELIVERED' ? 'Complete' : 
                           order.status === 'CANCELLED' ? 'Cancelled' : 
                           order.status === 'PAID' ? 'Awaiting accept' : order.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'PAID' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptOrder(order.id)}
                                className="bg-blue-500 hover:bg-blue-600 font-nunito"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectOrder(order.id)}
                                className="font-nunito"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {order.status === 'WRITING' && (
                            <Button
                              onClick={() => setDeliveringOrderId(order.id)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 font-nunito"
                            >
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              Deliver
                            </Button>
                          )}

                          {order.status === 'DELIVERED' && order.poemContent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingOrder(order)}
                              className="font-nunito"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expandedOrder === order.id && hasDetails && (
                      <tr className="bg-muted/20 border-t border-border/50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="max-w-4xl ml-6 p-4 rounded-lg bg-card/50 border border-border space-y-3">
                            {order.title && (
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</span>
                                <p className="text-sm font-nunito text-foreground mt-1 font-medium">{order.title}</p>
                              </div>
                            )}
                            {order.mood && (
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mood</span>
                                <p className="text-sm font-nunito text-foreground mt-1 italic">{order.mood}</p>
                              </div>
                            )}
                            {order.instructions && (
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Special Instructions</span>
                                <p className="text-sm font-nunito text-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                                  {order.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

      {/* Modals truncated for space - same as before */}
      {acceptingOrderId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Accept Order?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will start the deadline timer immediately. Make sure you're ready to begin writing.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setAcceptingOrderId(null)}
                className="flex-1 font-nunito"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAcceptOrder}
                className="flex-1 bg-blue-500 hover:bg-blue-600 font-nunito"
              >
                Yes, Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Poem Modal */}
      {deliveringOrderId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-xl font-bold mb-1">Deliver Poem</h3>
            <p className="text-sm text-muted-foreground mb-4">Write or paste the finished poem below</p>
            
            <Textarea
              placeholder="Write your poem here..."
              value={poemContent}
              onChange={(e) => setPoemContent(e.target.value)}
              rows={14}
              className="mb-4 font-serif text-base leading-relaxed"
            />
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeliveringOrderId(null);
                  setPoemContent('');
                }}
                disabled={isSubmitting}
                className="flex-1 font-nunito"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeliverPoem}
                disabled={isSubmitting || !poemContent.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 font-nunito"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Deliver to Customer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Poem Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{viewingOrder.title || 'Delivered Poem'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <span>{viewingOrder.email}</span>
              </div>
            </div>
            
            <div className="p-6 bg-muted/20 rounded-lg mb-4 border border-border">
              <p className="font-serif text-base whitespace-pre-wrap leading-relaxed">
                {viewingOrder.poemContent}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setViewingOrder(null)}
              className="w-full font-nunito"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Reject Order</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will cancel the order. You'll need to process the refund manually via your payment provider.
            </p>
            <Textarea
              placeholder="e.g., 'Inappropriate content requested', 'Unable to fulfill within timeline'"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mb-4 font-nunito"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingOrderId(null);
                  setRejectReason('');
                }}
                className="flex-1 font-nunito"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={submitRejectOrder}
                disabled={!rejectReason.trim()}
                className="flex-1 font-nunito"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}