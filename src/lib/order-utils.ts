export interface OrderWithTimeRemaining {
  id: string;
  deliveryHours: number;
  paidAt: string | null;
  status: string;
  timeRemainingMinutes: number;
  isOverdue: boolean;
}

/**
 * Calculate time remaining for an order
 */
export function calculateTimeRemaining(order: {
  deliveryHours: number;
  paidAt: string | null;
  status: string;
}): { minutes: number; isOverdue: boolean } {
  if (!order.paidAt || order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return { minutes: 0, isOverdue: false };
  }

  const paidTime = new Date(order.paidAt).getTime();
  const deadlineTime = paidTime + (order.deliveryHours * 60 * 60 * 1000);
  const now = Date.now();
  const remainingMs = deadlineTime - now;
  const remainingMinutes = Math.floor(remainingMs / (60 * 1000));

  return {
    minutes: remainingMinutes,
    isOverdue: remainingMinutes < 0,
  };
}

/**
 * Format time remaining in human-readable format
 */
export function formatTimeRemaining(minutes: number): string {
  if (minutes < 0) {
    const overdue = Math.abs(minutes);
    const hours = Math.floor(overdue / 60);
    const mins = overdue % 60;
    return `Overdue by ${hours}h ${mins}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours < 1) {
    return `${mins}m remaining`;
  }

  return `${hours}h ${mins}m remaining`;
}

/**
 * Sort orders by priority (time remaining)
 */
export function sortOrdersByPriority<T extends { deliveryHours: number; paidAt: string | null; status: string }>(
  orders: T[]
): T[] {
  return [...orders].sort((a, b) => {
    const aTime = calculateTimeRemaining(a);
    const bTime = calculateTimeRemaining(b);

    // Overdue orders first
    if (aTime.isOverdue && !bTime.isOverdue) return -1;
    if (!aTime.isOverdue && bTime.isOverdue) return 1;

    // Then sort by time remaining (least time first)
    return aTime.minutes - bTime.minutes;
  });
}