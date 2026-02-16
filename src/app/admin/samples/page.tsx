import { getSampleWorks } from '@/services/sample-works';
import { SampleWorksList } from '@/components/admin/sample-works-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function AdminSamplesPage() {
  const sampleWorks = await getSampleWorks();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sample Works</h1>
          <p className="font-nunito text-muted-foreground mt-2">
            Manage your portfolio pieces
          </p>
        </div>
        <Button className="font-nunito">
          <Plus className="w-4 h-4 mr-2" />
          Add Sample
        </Button>
      </div>

      <SampleWorksList samples={sampleWorks} />
    </div>
  );
}