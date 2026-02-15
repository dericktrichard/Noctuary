import { GlassCard } from '@/components/ui/card';
import { Package, Clock, Pencil, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    total: number;
    pending: number;
    paid: number;
    writing: number;
    delivered: number;
    todayOrders: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'Total Orders',
      value: stats.total,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      label: 'Pending Payment',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      label: 'To Write',
      value: stats.paid,
      icon: Pencil,
      color: 'text-orange-500',
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <GlassCard key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-nunito text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <Icon className={`w-10 h-10 ${stat.color}`} />
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}