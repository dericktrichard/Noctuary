import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { VantaBackground } from '@/components/shared/vanta-background';
import { HeroSection } from '@/components/features/hero-section';
import { HowItWorks } from '@/components/features/how-it-works';
import { AuthorsPact } from '@/components/features/authors-pact';
import { SampleWorks } from '@/components/features/sample-works-wrapper';
import { Testimonials } from '@/components/features/testimonials-wrapper';
import { CommissionForm } from '@/components/features/commission-form';
import { getCurrentPricing } from '@/app/actions/pricing';
import { PenLine, BookOpen } from 'lucide-react';

export default async function HomePage() {
  const pricing = await getCurrentPricing();

  return (
    <>
      <VantaBackground />
      <Navbar />
      
      <main className="min-h-screen relative">
        <HeroSection />
        <SampleWorks />
        <AuthorsPact />
        <HowItWorks />
        
        {/* Commission Section */}
        <section id="commission" className="py-10 px-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Centered Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4">
                <PenLine className="w-4 h-4" />
                <span className="font-nunito text-xs uppercase tracking-widest">Get Started</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Commission Your Poem
              </h2>

              <p className="text-lg font-nunito text-muted-foreground max-w-2xl mx-auto">
                A quick poetic surprise or a custom piece.
              </p>
            </div>

            {/* Form Container */}
            <div className="max-w-4xl mx-auto">
              <CommissionForm pricing={pricing} />
            </div>
          </div>
        </section>

        <Testimonials />
        
        {/* About Section - With Uniform Elements */}
        <section id="about" className="py-5 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Centered Header with Badge & Subheading */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4">
                <BookOpen className="w-4 h-4" />
                <span className="font-nunito text-xs uppercase tracking-widest">Our Story</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Noctuary&apos;s Essence
              </h2>

              <p className="text-lg font-nunito text-muted-foreground">
                The vision behind the craft.
              </p>
            </div>

            {/* Notebook Paper Content */}
            <div className="notebook-paper notebook-line pt-8 pb-5">              
              <div className="px-8 md:px-16 pb-12 text-muted-foreground">
                <p className="notebook-line mb-7">
                  &ldquo;Noctuary was born as a rebellion against the rise of AI-generated poetry.&rdquo;
                </p>
                
                <p className="notebook-line mb-7">
                  Whereas that is true, Noctuary was meant as a precursor to my main <strong className="text-foreground">VISION</strong>. It is here to make way for the project that will be the true embodiment of my vision for the poetry community and literati at large. It will be the next step in the community of readers and writers.
                </p>
                
                <p className="notebook-line mb-7">
                  But for now Noctuary is here to be a sanctuary for those who seek the human touch in poetry, a place where the soul of the poet can shine through every word. So you are appreciated and hoping to add more poets so they can also get your support and love.
                </p>
                
                <p className="notebook-line text-foreground font-bold">
                  If you are interested as a Partner or an Investor just contact me via the email, whether as a poet or in the coming project.
                </p>
              </div>
              
              <div className="absolute bottom-4 left-8 md:left-12 right-8 md:right-16 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}