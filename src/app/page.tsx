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

export default async function HomePage() {
  const pricing = await getCurrentPricing();

  return (
    <>
      {/* Vanta.js Animated Background */}
      <VantaBackground />
      
      <Navbar />
      
      <main className="min-h-screen relative">
        {/* Hero */}
        <HeroSection />

        {/* Sample Works */}
        <SampleWorks />

        {/* The Author's Pact */}
        <AuthorsPact />

        {/* How It Works */}
        <HowItWorks />

        {/* Commission Form */}
        <section id="commission" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Commission Your Poem
              </h2>
              <p className="font-nunito text-lg max-w-2xl mx-auto text-muted-foreground">
                Choose a quick poetic piece or a custom art poetry below.
              </p>
            </div>
            <CommissionForm pricing={pricing} />
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />
        
        {/* About Section */}
        <section id="about" className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Noctuary's Essence
            </h2>
            <div className="space-y-6 font-philosopher text-lg leading-relaxed text-muted-foreground">
              <p>
                "Noctuary was born as a rebellion against the rise of AI-generated poetry."
              </p>
              <p>
                Whereas that is true, Noctuary was meant as a precussor to my main <strong>VISION</strong>.
                It is here to make way for the project that will be the true embodiment of my vision 
                for the poetry community and literati at large. It will be the next step in the community of readers and writers.<br/>
                But for now Noctuary is here to be a sanctuary for those who seek the human touch in poetry, a place where the soul of the poet can shine through every word.
                So you are appreciated and hoping to add more poets so they can also get your support and love.
              </p>
              <p className="font-bold text-foreground">
                If you are interested as a Partner or an Investor just contact me via the email, whether as a poet or in the coming project.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}