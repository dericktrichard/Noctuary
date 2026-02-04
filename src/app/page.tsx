import { CommissionForm } from '@/components/features/commission-form';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            Human Ink,
            <br />
            <span className="text-white/70">Digital Canvas</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto animate-slide-up">
            Premium poetry commissions crafted by human hands.
            <br />
            <strong className="text-white/80">No AI. No templates.</strong> Just authentic emotional expression.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <a
              href="#commission"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
            >
              Commission Now
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium glass-card rounded-lg hover:bg-white/10 transition-colors"
            >
              View Pricing
            </a>
          </div>

          {/* Floating indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-float">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Pricing Overview */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-16">
            Simple, Honest Pricing
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick Poem */}
            <div className="glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
              <h3 className="font-serif text-3xl font-bold mb-4">Quick Poem</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$0.99</span>
                <span className="text-white/60 ml-2">or 130 KES</span>
              </div>
              <ul className="space-y-3 mb-8 text-white/80">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>24-hour delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Perfect for simple occasions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Short topic description</span>
                </li>
              </ul>
            </div>

            {/* Custom Poem */}
            <div className="glass-card rounded-xl p-8 hover:bg-white/10 transition-all duration-300 border-2 border-white/20">
              <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm mb-4">
                Most Popular
              </div>
              <h3 className="font-serif text-3xl font-bold mb-4">Custom Poem</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$1.99</span>
                <span className="text-white/60 ml-2">- $4.99</span>
              </div>
              <ul className="space-y-3 mb-8 text-white/80">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>6-24 hour delivery (you choose)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Detailed customization</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Mood selection & instructions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>For special recipients</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Authors Pact */}
      <section className="py-24 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-12">
            The Author&apos;s Pact
          </h2>

          <div className="space-y-6 text-lg text-white/80 leading-relaxed">
            <p>
              In an age where artificial intelligence can generate text in milliseconds, we choose a different path.
              Every poem commissioned through Noctuary is written by a human poet — someone who understands emotion,
              nuance, and the weight of words.
            </p>

            <p className="font-semibold text-white">
              This is our guarantee: No AI. No templates. No shortcuts.
            </p>

            <p>
              When you commission a poem, you&apos;re not just purchasing words arranged aesthetically. You&apos;re investing
              in authentic human creativity, in the vulnerability of expression, in the deliberate craft that comes
              only from lived experience.
            </p>

            <div className="glass-card rounded-xl p-8 my-8">
              <h3 className="font-serif text-2xl font-bold mb-4">Copyright Transfer</h3>
              <p className="text-white/80">
                Upon delivery, full copyright ownership transfers to you. The poem becomes yours to use, modify,
                publish, or share as you wish. No attribution required. No restrictions. It&apos;s your story, written
                by human hands.
              </p>
            </div>

            <p>
              This is our promise. This is Noctuary.
            </p>
          </div>
        </div>
      </section>

      {/* Commission Form */}
      <section id="commission" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-4">
            Commission Your Poem
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            Choose between a quick poem for simple occasions or a fully customized piece crafted specifically for your needs.
          </p>
          
          <CommissionForm />
        </div>
      </section>
      <section id="commission" className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center glass-card rounded-xl p-12">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Commission Your Poem
          </h2>
          <p className="text-white/60 mb-8">
            The commission form will be implemented next. It will include:
          </p>
          <ul className="text-left text-white/70 space-y-2 mb-8">
            <li>• Quick vs Custom selection</li>
            <li>• Dynamic form based on selection</li>
            <li>• Real-time price calculation</li>
            <li>• PayPal / M-Pesa payment integration</li>
            <li>• Email confirmation with magic link</li>
          </ul>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/60 mb-4">
            © {new Date().getFullYear()} Noctuary. Human Ink, Digital Canvas.
          </p>
          <p className="text-white/40 text-sm">
            Every poem is crafted by human hands, never by algorithms.
          </p>
        </div>
      </footer>
    </main>
  );
}