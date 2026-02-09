import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { HeroSection } from '@/components/features/hero-section';
import { HowItWorks } from '@/components/features/how-it-works';
import { SampleWorks } from '@/components/features/sample-works';
import { AuthorsPact } from '@/components/features/authors-pact';
import { Testimonials } from '@/components/features/testimonials';
import { CommissionForm } from '@/components/features/commission-form';

export default function HomePage() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <HeroSection />

        {/* Sample Works */}
        <SampleWorks />

        {/* Testimonials */}
        <Testimonials />

        {/* The Author's Pact */}
        <AuthorsPact />

        {/* Commission Form */}
        <section id="commission" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Commission Your Poem
              </h2>
              <p className="font-nunito text-lg max-w-2xl mx-auto text-muted-foreground">
                A quick poetic piece or a custom art poetry for you.
              </p>
            </div>
            
            <CommissionForm />
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />
        
        {/* About Section */}
        <section id="about" className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              This is Noctuary
            </h2>
            <div className="space-y-6 font-nunito text-lg leading-relaxed text-muted-foreground">
              <p>
                Noctuary was born from a simple belief: that the soul matters, and that the human 
                touch in writing creates connections that AI never can.
              </p>
              <p>
                In a world increasingly dominated by artificial intelligence, we stand as guardians 
                of authentic expression. Every poem I create is written by me, one who dares claim to 
                understand the weight of words, the rhythm of emotion, and the art of capturing 
                what makes each piece unique.
              </p>
              <p className="font-bold text-foreground">
                I don't just want to write poems. But craft connections.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}