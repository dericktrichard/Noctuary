export interface OrderWithTimeRemaining {
  id: string;
  deliveryHours: number;
  paidAt: string | null;
  writingStartedAt: string | null;
  status: string;
  timeRemainingMinutes: number;
  isOverdue: boolean;
}

export function calculateTimeRemaining(order: {
  deliveryHours: number;
  paidAt: string | null;
  writingStartedAt: string | null;
  status: string;
}): { minutes: number; isOverdue: boolean } {
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'PENDING') {
    return { minutes: 0, isOverdue: false };
  }

  let startTime: string | null = null;
  
  if (order.status === 'WRITING' && order.writingStartedAt) {
    startTime = order.writingStartedAt;
  } else if (order.status === 'PAID' && order.paidAt) {
    startTime = order.paidAt;
  }

  if (!startTime) {
    return { minutes: 0, isOverdue: false };
  }

  const paidTime = new Date(startTime).getTime();
  const deadlineTime = paidTime + (order.deliveryHours * 60 * 60 * 1000);
  const now = Date.now();
  const remainingMs = deadlineTime - now;
  const remainingMinutes = Math.floor(remainingMs / (60 * 1000));

  return {
    minutes: remainingMinutes,
    isOverdue: remainingMinutes < 0,
  };
}

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

export function sortOrdersByPriority<T extends { 
  deliveryHours: number; 
  paidAt: string | null; 
  writingStartedAt: string | null;
  status: string 
}>(orders: T[]): T[] {
  return [...orders].sort((a, b) => {
    const aTime = calculateTimeRemaining(a);
    const bTime = calculateTimeRemaining(b);

    if (a.status === 'WRITING' && aTime.isOverdue && !(b.status === 'WRITING' && bTime.isOverdue)) return -1;
    if (b.status === 'WRITING' && bTime.isOverdue && !(a.status === 'WRITING' && aTime.isOverdue)) return 1;

    if (a.status === 'WRITING' && b.status === 'WRITING') {
      return aTime.minutes - bTime.minutes;
    }

    if (a.status === 'WRITING' && b.status !== 'WRITING') return -1;
    if (b.status === 'WRITING' && a.status !== 'WRITING') return 1;

    if (a.status === 'PAID' && b.status === 'PAID') {
      return aTime.minutes - bTime.minutes;
    }

    if (a.status === 'PAID' && b.status !== 'PAID') return -1;
    if (b.status === 'PAID' && a.status !== 'PAID') return 1;

    return 0;
  });
}