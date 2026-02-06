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

        {/* How It Works */}
        <HowItWorks />

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
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Commission Your Poem
              </h2>
              <p className="text-white/60 font-caption text-lg max-w-2xl mx-auto">
                Choose between a quick poetic surprise or a fully personalized piece crafted to your vision
              </p>
            </div>
            
            <CommissionForm />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 px-4 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">
              About Noctuary
            </h2>
            <div className="space-y-6 text-white/70 font-caption text-lg leading-relaxed">
              <p>
                Noctuary was born from a simple belief: that words matter, and that the human 
                touch in writing creates connections that algorithms never can.
              </p>
              <p>
                In a world increasingly dominated by artificial intelligence, we stand as guardians 
                of authentic expression. Every poem we create is written by a skilled poet who 
                understands the weight of words, the rhythm of emotion, and the art of capturing 
                what makes each moment unique.
              </p>
              <p className="text-white font-semibold">
                We don't just write poems. We craft connections.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}