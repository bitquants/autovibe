import Link from 'next/link';
import { Sparkles, Zap, Shield, Clock, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#09090b]" />
              </div>
              <span className="text-xl font-bold text-white">AutoVibe</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-cyan-400 text-[#09090b] rounded-lg font-medium hover:bg-cyan-300 transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-sm text-cyan-400">AI-Powered Content Generation</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Create Engaging<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
              Social Media Content
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Transform your content ideas into platform-optimized posts for Twitter, Instagram, Facebook, and YouTube in seconds. No more writer's block.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-cyan-400 text-[#09090b] rounded-xl font-semibold text-lg hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 group">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border border-white/10">
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-sm text-zinc-500">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500 mb-6">Trusted by content creators worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <div className="text-xl font-bold text-zinc-400">Twitter</div>
            <div className="text-xl font-bold text-zinc-400">Instagram</div>
            <div className="text-xl font-bold text-zinc-400">Facebook</div>
            <div className="text-xl font-bold text-zinc-400">YouTube</div>
            <div className="text-xl font-bold text-zinc-400">TikTok</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Powerful features to streamline your content creation workflow
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-cyan-400" />}
              title="AI-Powered Generation"
              description="Generate platform-optimized content using advanced AI. Each post is tailored for maximum engagement."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-cyan-400" />}
              title="Save Hours Weekly"
              description="Transform content ideas into ready-to-post content in seconds. Focus on strategy, not writing."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-cyan-400" />}
              title="Multi-Platform Support"
              description="Create content for Twitter, Instagram, Facebook, and YouTube from a single idea."
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6 text-cyan-400" />}
              title="Smart Hashtags"
              description="AI automatically generates relevant hashtags to increase your reach and engagement."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-cyan-400" />}
              title="Image Prompts"
              description="Get AI-generated image prompts to create stunning visuals for your posts."
            />
            <FeatureCard
              icon={<ArrowRight className="w-6 h-6 text-cyan-400" />}
              title="Content History"
              description="Access all your generated content in one place. Edit, copy, and manage with ease."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Create engaging content in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Enter Your Idea"
              description="Share your content idea and select your niche. Be as specific or broad as you like."
            />
            <StepCard
              number="02"
              title="Choose Platforms"
              description="Select which social platforms you want content for. We'll optimize for each one."
            />
            <StepCard
              number="03"
              title="Get Your Content"
              description="Receive platform-specific posts with hashtags and image prompts in seconds."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Start free, upgrade when you're ready
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Trial */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Free Trial</h3>
              <p className="text-zinc-400 mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-zinc-400">/14 days</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  50 content generations
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  All platforms supported
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  Full feature access
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-cyan-400/20 to-transparent border border-cyan-400/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-400 text-[#09090b] text-sm font-semibold rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <p className="text-zinc-400 mb-6">For serious content creators</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  Unlimited generations
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  Priority AI processing
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  Priority support
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center bg-cyan-400 text-[#09090b] rounded-xl font-medium hover:bg-cyan-300 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-cyan-400/20 via-cyan-400/10 to-transparent border border-cyan-400/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
              Join thousands of creators who are saving hours every week with AI-powered content generation.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-400 text-[#09090b] rounded-xl font-semibold text-lg hover:bg-cyan-300 transition-all group">
              Start Your Free 14-Day Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-sm text-zinc-500">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#09090b]" />
              </div>
              <span className="text-xl font-bold text-white">AutoVibe</span>
            </div>
            <p className="text-sm text-zinc-500">
              © 2026 AutoVibe. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl font-bold text-cyan-400">{number}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}
