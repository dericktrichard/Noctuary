'use client';

import { useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  pricePaid: number;
  currency: string;
  createdAt: string;
  deliveredAt: string | null;
}

interface RevenueChartsProps {
  orders: Order[];
}

export function RevenueCharts({ orders }: RevenueChartsProps) {
  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
    
    // Last 7 days revenue
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyRevenue = last7Days.map(date => {
      const dayOrders = deliveredOrders.filter(o => 
        o.deliveredAt?.startsWith(date)
      );
      const usd = dayOrders
        .filter(o => o.currency === 'USD')
        .reduce((sum, o) => sum + o.pricePaid, 0);
      const kes = dayOrders
        .filter(o => o.currency === 'KES')
        .reduce((sum, o) => sum + o.pricePaid, 0);
      
      return { date, usd, kes, total: dayOrders.length };
    });

    // Average order value
    const avgUSD = deliveredOrders
      .filter(o => o.currency === 'USD')
      .reduce((sum, o) => sum + o.pricePaid, 0) / 
      (deliveredOrders.filter(o => o.currency === 'USD').length || 1);

    const avgKES = deliveredOrders
      .filter(o => o.currency === 'KES')
      .reduce((sum, o) => sum + o.pricePaid, 0) / 
      (deliveredOrders.filter(o => o.currency === 'KES').length || 1);

    // This week vs last week
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const thisWeekOrders = deliveredOrders.filter(o => 
      new Date(o.deliveredAt!) >= thisWeekStart
    ).length;

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastWeekOrders = deliveredOrders.filter(o => {
      const date = new Date(o.deliveredAt!);
      return date >= lastWeekStart && date < thisWeekStart;
    }).length;

    const weekGrowth = lastWeekOrders > 0 
      ? ((thisWeekOrders - lastWeekOrders) / lastWeekOrders * 100).toFixed(1)
      : '0';

    return {
      dailyRevenue,
      avgUSD,
      avgKES,
      weekGrowth: parseFloat(weekGrowth),
    };
  }, [orders]);

  const maxRevenue = Math.max(...stats.dailyRevenue.map(d => d.usd + d.kes / 130));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-nunito">Avg Order (USD)</p>
              <p className="text-xl font-bold">${stats.avgUSD.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-nunito">Avg Order (KES)</p>
              <p className="text-xl font-bold">Ksh {stats.avgKES.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-nunito">Week Growth</p>
              <p className={`text-xl font-bold ${stats.weekGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.weekGrowth > 0 ? '+' : ''}{stats.weekGrowth}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Last 7 Days Revenue
        </h3>
        
        <div className="space-y-3">
          {stats.dailyRevenue.map((day, index) => (
            <div key={day.date} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-nunito">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="font-mono text-muted-foreground">
                  {day.total} orders
                </span>
              </div>
              
              {/* Bar Chart */}
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all duration-500"
                    style={{ 
                      width: `${maxRevenue > 0 ? ((day.usd + day.kes / 130) / maxRevenue * 100) : 0}%` 
                    }}
                  />
                </div>
                <div className="text-sm font-mono w-24 text-right">
                  ${(day.usd + day.kes / 130).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}