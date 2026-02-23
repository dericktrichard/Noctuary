import { getSampleWorks } from '@/services/sample-works';
import { SampleWorksListWithModal } from '@/components/admin/sample-works-list-with-modal';

export default async function AdminSamplesPage() {
  const sampleWorks = await getSampleWorks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sample Works</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage what the people will see on your page 
        </p>
      </div>

      <SampleWorksListWithModal samples={sampleWorks} />
    </div>
  );
}