import { Package, Clock, Pencil, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

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
      trend: `+${stats.todayOrders} today`,
      trendUp: true,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Pending Payment',
      value: stats.pending,
      icon: Clock,
      trend: 'Awaiting confirmation',
      trendUp: false,
      color: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Ready to Write',
      value: stats.paid,
      icon: Pencil,
      trend: 'Priority queue',
      trendUp: true,
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle,
      trend: 'Completed',
      trendUp: true,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium font-nunito text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs font-nunito">
                  <TrendingUp className={cn(
                    'h-3 w-3',
                    stat.trendUp ? 'text-green-500' : 'text-muted-foreground'
                  )} />
                  <span className="text-muted-foreground">{stat.trend}</span>
                </div>
              </div>
              <div className={cn('rounded-full p-3', stat.bgColor)}>
                <Icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}