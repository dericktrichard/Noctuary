import { getVisibleSampleWorks } from '@/services/sample-works';
import { GlassCard } from '@/components/ui/card';

export async function SampleWorks() {
  const sampleWorks = await getVisibleSampleWorks();

  if (sampleWorks.length === 0) {
    return null; // Don't show section if no samples
  }

  return (
    <section id="samples" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sample Works
          </h2>
          <p className="text-lg font-nunito text-muted-foreground max-w-2xl mx-auto">
            A glimpse into the craft. Each piece reflects the human touch that algorithms cannot replicate.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleWorks.map((work, index) => (
            <GlassCard
              key={work.id}
              className="p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              {work.imageUrl && (
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{work.title}</h3>
              
              {work.mood && (
                <p className="text-sm font-nunito text-muted-foreground italic mb-3">
                  {work.mood}
                </p>
              )}

              <p className="font-serif text-sm leading-relaxed whitespace-pre-line line-clamp-6">
                {work.content}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}