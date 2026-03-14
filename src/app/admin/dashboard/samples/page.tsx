import { getSampleWorks } from '@/services/sample-works';
import { SampleWorksListWithModal } from '@/components/admin/sample-works-list-with-modal';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function SampleStats({ samples }: { samples: any[] }) {
  const stats = {
    total: samples.length,
    visible: samples.filter(s => s.isVisible).length,
    hidden: samples.filter(s => !s.isVisible).length,
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Total Samples</p>
        <p className="text-2xl font-bold mt-1">{stats.total}</p>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Visible</p>
        <p className="text-2xl font-bold mt-1 text-green-500">{stats.visible}</p>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Hidden</p>
        <p className="text-2xl font-bold mt-1 text-muted-foreground">{stats.hidden}</p>
      </div>
    </div>
  );
}

export default async function AdminSamplesPage() {
  const sampleWorks = await getSampleWorks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sample Works</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Showcase your best poetry to potential customers
        </p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      }>
        <SampleStats samples={sampleWorks} />
      </Suspense>

      <SampleWorksListWithModal samples={sampleWorks} />
    </div>
  );
}