import { getVisibleSampleWorks } from '@/services/sample-works';
import { SampleWorksClient } from './sample-works';

export async function SampleWorks() {
  const sampleWorks = await getVisibleSampleWorks();

  if (sampleWorks.length === 0) {
    return null;
  }

  return <SampleWorksClient samples={sampleWorks} />;
}