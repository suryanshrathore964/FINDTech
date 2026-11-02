import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Cpu,
  Star,
  Quote,
  ChevronRight,
  Laptop,
  Target,
} from 'lucide-react'
import { ParticleField } from '@/components/landing/ParticleField'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { FloatingCard } from '@/components/landing/FloatingCard'

const stats = [
  { value: '50+', label: 'Laptops indexed', suffix: '' },
  { value: '94', label: 'Match accuracy', suffix: '%' },
  { value: '<3', label: 'Avg. response', suffix: 's' },
  { value: '12K', label: 'Recommendations', suffix: '+' },
]

const features = [
  {
    icon: Brain,
    title: 'Neural Matching Engine',
    description: 'Multi-criteria ML scoring weighs budget, performance, portability, and use case in real time.',
    glow: 'blue' as const,
  },
  {
    icon: Zap,
    title: 'Instant Rankings',
    description: 'Top matches with confidence scores and human-readable reasons — no guesswork.',
    glow: 'cyan' as const,
  },
  {
    icon: Shield,
    title: 'Verified Spec Database',
    description: 'Curated CPU, GPU, RAM, battery, and weight data from trusted manufacturer specs.',
    glow: 'violet' as const,
  },
  {
    icon: Target,
    title: 'Use-Case Profiles',
    description: 'Optimized weights for gaming, creative work, business, students, and everyday use.',
    glow: 'blue' as const,
  },
  {
    icon: BarChart3,
    title: 'Smart Budget Fit',
    description: 'Price-aware scoring keeps recommendations inside your range without sacrificing quality.',
    glow: 'cyan' as const,
  },
  {
    icon: Cpu,
    title: 'Hardware Intelligence',
    description: 'GPU tier detection and CPU benchmarking baked into every recommendation.',
    glow: 'violet' as const,
  },
]

const testimonials = [
  {
    quote: 'FINDtech found me a gaming laptop under $1,200 that I never would have discovered on my own. The match score was spot on.',
    author: 'Marcus Chen',
    role: 'Software Engineer',
    rating: 5,
  },
  {
    quote: 'As a design student, I needed power and portability. The AI nailed it in one session — saved me weeks of research.',
    author: 'Sofia Rivera',
    role: 'UX Designer',
    rating: 5,
  },
  {
    quote: 'We rolled this out for our IT team. Onboarding new hires with the right laptop used to take days. Now it takes minutes.',
    author: 'James Okonkwo',
    role: 'IT Director',
    rating: 5,
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

export function Home() {
  const ctaTo = '/recommend'

  return (
    <div className="landing-page min-h-screen">
      <ParticleField />
      <LandingNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                <span className="text-sm font-medium text-primary-300">AI-Powered Laptop Intelligence</span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Discover your{' '}
                <span className="landing-gradient-text">perfect laptop</span>
                <br />
                <span className="text-slate-400 text-3xl sm:text-4xl lg:text-5xl font-semibold">in seconds</span>
              </h1>

              <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
                FINDtech&apos;s ML engine analyzes your budget, workflow, and priorities to deliver
                ranked recommendations with match scores and clear reasoning.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to={ctaTo} className="landing-btn-primary px-8 py-4 rounded-xl text-base font-semibold group">
                  Start AI matching
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/browse" className="landing-btn-secondary px-8 py-4 rounded-xl text-base font-semibold">
                  Explore catalog
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Free to try
                </span>
              </div>
            </motion.div>

            {/* Hero visual — floating cards */}
            <div className="relative hidden lg:block h-[520px]">
              <motion.div
                className="absolute inset-0 rounded-3xl glow-ring"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              />
              <FloatingCard
                className="absolute top-8 left-8 right-8 z-20"
                delay={0}
                floatRange={8}
                glow="blue"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">Top match</span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-sm font-bold">96%</span>
                </div>
                <div className="flex gap-4">
                  <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Laptop className="h-8 w-8 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-white">ROG Zephyrus G14</p>
                    <p className="text-sm text-slate-500">Gaming · Creative</p>
                    <p className="text-primary-400 font-bold mt-1">$1,599</p>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard
                className="absolute top-44 left-0 w-56 z-10"
                delay={0.5}
                floatRange={10}
                glow="cyan"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Performance</p>
                    <p className="font-semibold text-white">RTX 4060 · Ryzen 9</p>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard
                className="absolute bottom-16 right-0 w-52 z-10"
                delay={1}
                floatRange={14}
                glow="violet"
              >
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full bg-violet-500/60" />
                  ))}
                </div>
                <p className="text-xs text-slate-500">Analyzing 50+ laptops...</p>
                <p className="text-sm font-medium text-violet-300 mt-1">ML scoring active</p>
              </FloatingCard>

              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-600/20 blur-3xl rounded-full"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="glass-dark-strong rounded-3xl p-8 lg:p-12 glow-ring">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="font-display text-4xl lg:text-5xl font-bold landing-gradient-text">
                    {stat.value}
                    <span className="text-2xl">{stat.suffix}</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-medium text-primary-400 uppercase tracking-wider">Capabilities</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mt-4">
              Built for intelligent discovery
            </h2>
            <p className="text-slate-500 mt-4">
              Enterprise-grade recommendation logic wrapped in a consumer-friendly experience.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FloatingCard key={f.title} delay={i * 0.1} floatRange={6} glow={f.glow}>
                <div className="inline-flex rounded-xl p-3 bg-primary-500/10 border border-primary-500/20 mb-4">
                  <f.icon className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="glass-dark-strong rounded-3xl p-8 lg:p-16 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[100px] rounded-full" />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-white">
                  Three steps to your ideal machine
                </h2>
                <p className="text-slate-500 mt-4">
                  No endless spec sheets. Tell us what matters — we handle the rest.
                </p>
                <Link to={ctaTo} className="inline-flex items-center gap-2 mt-8 text-primary-400 hover:text-primary-300 font-semibold group">
                  Try it now
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Set preferences', desc: 'Budget, use case, portability, and brand filters.' },
                  { step: '02', title: 'AI analyzes', desc: 'ML engine scores every laptop in our catalog.' },
                  { step: '03', title: 'Get matches', desc: 'Ranked results with scores and clear reasoning.' },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-4 items-start"
                  >
                    <span className="font-display text-2xl font-bold text-primary-500/50">{item.step}</span>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Testimonials</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mt-4">
              Trusted by builders & teams
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark rounded-2xl p-6 flex flex-col h-full hover:border-primary-500/20 transition-colors"
              >
                <Quote className="h-8 w-8 text-primary-500/40 mb-4" />
                <p className="text-slate-400 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            {...fadeUp}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 via-cyan-600/20 to-violet-600/30" />
            <div className="absolute inset-0 glass-dark-strong" />
            <div className="relative p-12 lg:p-16 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="inline-flex mb-6"
              >
                <Sparkles className="h-12 w-12 text-primary-400" />
              </motion.div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">
                Ready to find your next laptop?
              </h2>
              <p className="text-slate-400 mt-4 max-w-lg mx-auto">
                Join thousands using AI to cut through the noise. Your perfect match is a few clicks away.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link to={ctaTo} className="landing-btn-primary px-10 py-4 rounded-xl text-lg font-semibold group">
                  Get started free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="landing-btn-secondary px-10 py-4 rounded-xl text-lg font-semibold">
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
