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
import { Search, Eye, Send, ChevronDown, ChevronUp, Clock, Mail, Calendar } from 'lucide-react';
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
  currency: string;
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

function getDeadlineStatus(order: Order) {
  let startTime: string | null = null;

  if (order.status === 'WRITING' && order.writingStartedAt) {
    startTime = order.writingStartedAt;
  } else if (order.status === 'PAID' && order.paidAt) {
    startTime = order.paidAt;
  }

  if (!startTime) return { status: 'none', color: '', text: '', icon: '' };

  const deadline = new Date(startTime);
  deadline.setHours(deadline.getHours() + order.deliveryHours);
  
  const now = new Date();
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining < 0) {
    return { 
      status: 'overdue', 
      color: 'bg-red-500/10 text-red-500 border-red-500',
      text: 'OVERDUE',
      icon: '🚨'
    };
  } else if (hoursRemaining < 2) {
    return { 
      status: 'urgent', 
      color: 'bg-orange-500/10 text-orange-500 border-orange-500',
      text: 'URGENT',
      icon: '⚠️'
    };
  } else if (hoursRemaining < 6) {
    return { 
      status: 'soon', 
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
      text: 'SOON',
      icon: '⏰'
    };
  }

  return { status: 'normal', color: '', text: '', icon: '' };
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

  const handleAcceptOrder = async (orderId: string) => {
    if (!confirm('Accept this order and start writing? The deadline timer will start now.')) return;

    const result = await acceptOrderAction(orderId);
    
    if (result.success) {
      toast.success('Order accepted! Deadline countdown started.');
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
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aTime = calculateTimeRemaining(a);
    const bTime = calculateTimeRemaining(b);

    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;

    return aTime.minutes - bTime.minutes;
  });

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-lg border border-border">
        <p className="font-nunito text-muted-foreground">No orders yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Filters - Mobile Responsive */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email, order ID, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-nunito w-full"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'PAID', 'WRITING', 'DELIVERED', 'CANCELLED'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="font-nunito text-xs sm:text-sm"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedOrders.map((order) => {
          const timeRemaining = calculateTimeRemaining(order);
          const deadlineAlert = getDeadlineStatus(order);
          const hasDetails = order.title || order.mood || order.instructions;
          
          return (
            <div
              key={order.id}
              className="glass-card p-4 rounded-lg border border-border"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {order.type}
                    </Badge>
                    {deadlineAlert.status !== 'none' && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold ${deadlineAlert.color}`}>
                        {deadlineAlert.icon} {deadlineAlert.text}
                      </span>
                    )}
                  </div>
                  {order.title && (
                    <h3 className="font-bold text-base mb-1">{order.title}</h3>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{order.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{order.createdAt.split('T')[0]}</span>
                </div>
                {timeRemaining && (
                  <div className="flex items-center gap-2">
                    <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${timeRemaining.color}`} />
                    <span className={`font-semibold ${timeRemaining.color}`}>
                      {timeRemaining.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(order.pricePaid, order.currency as 'USD' | 'KES')}
                  </span>
                </div>
              </div>

              {/* Expandable Details */}
              {hasDetails && (
                <div className="mb-4">
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors text-sm font-semibold"
                  >
                    <span>Order Details</span>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedOrder === order.id && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg space-y-2 text-sm">
                      {order.title && (
                        <div>
                          <span className="font-semibold">Title:</span> {order.title}
                        </div>
                      )}
                      {order.mood && (
                        <div>
                          <span className="font-semibold">Mood:</span> {order.mood}
                        </div>
                      )}
                      {order.instructions && (
                        <div>
                          <span className="font-semibold">Instructions:</span>
                          <p className="mt-1 whitespace-pre-wrap">{order.instructions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {order.status === 'PAID' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Accept & Start
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectOrder(order.id)}
                      className="w-full"
                    >
                      Reject
                    </Button>
                  </>
                )}

                {order.status === 'WRITING' && (
                  <Button
                    onClick={() => setDeliveringOrderId(order.id)}
                    size="sm"
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Deliver Poem
                  </Button>
                )}

                {order.status === 'DELIVERED' && order.poemContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingOrder(order)}
                    className="w-full"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Poem
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-nunito">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-nunito">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-nunito">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-nunito">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-nunito">
                  Deadline
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider font-nunito">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOrders.map((order) => {
                const timeRemaining = calculateTimeRemaining(order);
                const deadlineAlert = getDeadlineStatus(order);
                const hasDetails = order.title || order.mood || order.instructions;
                
                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {hasDetails && (
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="p-1.5 hover:bg-accent rounded transition-colors flex-shrink-0"
                            >
                              {expandedOrder === order.id ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          )}
                          
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs font-mono">
                                {order.type}
                              </Badge>
                              {deadlineAlert.status !== 'none' && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold ${deadlineAlert.color}`}>
                                  <span className="text-sm">{deadlineAlert.icon}</span>
                                  {deadlineAlert.text}
                                </span>
                              )}
                            </div>
                            {order.title && (
                              <span className="text-sm font-semibold truncate">{order.title}</span>
                            )}
                            <span className="text-xs text-muted-foreground font-mono">
                              #{order.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-nunito truncate">{order.email}</span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold font-mono">
                          {formatCurrency(order.pricePaid, order.currency as 'USD' | 'KES')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {timeRemaining ? (
                          <span className={`text-sm font-nunito font-semibold ${timeRemaining.color}`}>
                            {timeRemaining.text}
                          </span>
                        ) : (
                          <span className="text-sm font-nunito text-muted-foreground">
                            {order.status === 'DELIVERED' ? 'Complete' : 
                             order.status === 'CANCELLED' ? 'Cancelled' : 
                             order.status === 'PAID' ? 'Awaiting accept' : 'Pending'}
                          </span>
                        )}
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

      {/* Empty State for Mobile */}
      {sortedOrders.length === 0 && (
        <div className="lg:hidden p-12 text-center glass-card rounded-lg border border-border">
          <p className="font-nunito text-muted-foreground">No orders match your filters</p>
        </div>
      )}

      {/* Modals (unchanged) */}
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
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeliverPoem}
                disabled={isSubmitting || !poemContent.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Deliver to Customer'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}

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
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingOrderId(null);
                  setRejectReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={submitRejectOrder}
                disabled={!rejectReason.trim()}
                className="flex-1"
              >
                Reject Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}