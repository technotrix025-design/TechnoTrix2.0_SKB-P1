import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { 
  Leaf, ArrowRight, Rocket, BrainCircuit, Sparkles, Users, 
  Target, Shield, Zap, CheckCircle2, Globe, Database, 
  TrendingUp, Star, ChevronDown, ChevronUp, Menu, X
} from 'lucide-react';

// Animated counter hook
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

const FEATURE_COLORS: Record<string, { bg: string; icon: string; badge: string }> = {
  purple:  { bg: 'bg-purple-100 dark:bg-purple-900/30',  icon: 'text-purple-600 dark:text-purple-400',  badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'  },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/30',      icon: 'text-blue-600 dark:text-blue-400',      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'      },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30',icon: 'text-emerald-600 dark:text-emerald-400',badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'},
  amber:   { bg: 'bg-amber-100 dark:bg-amber-900/30',    icon: 'text-amber-600 dark:text-amber-400',    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'    },
  red:     { bg: 'bg-red-100 dark:bg-red-900/30',        icon: 'text-red-600 dark:text-red-400',        badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'            },
  indigo:  { bg: 'bg-indigo-100 dark:bg-indigo-900/30',  icon: 'text-indigo-600 dark:text-indigo-400',  badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'  },
};

const features = [
  { icon: BrainCircuit, title: 'Gemini AI Engine', desc: 'AI extracts data from utility bills and invoices automatically with 99.2% accuracy', color: 'purple', metric: '99.2%' },
  { icon: Sparkles, title: 'Real-time Carbon Calc', desc: 'Integrated emission factor lookups with live Scope 1/2/3 tracking and SSE streaming', color: 'blue', metric: 'Live' },
  { icon: Users, title: 'Supplier ESG Scoring', desc: 'AI-powered scoring across your value chain with automated Scope 3 engagement', color: 'emerald', metric: '100%' },
  { icon: Target, title: 'Predictive Analytics', desc: 'ML-powered 6-month forecasting with anomaly detection and scenario analysis', color: 'amber', metric: '91% CI' },
  { icon: Shield, title: 'Audit-Ready Reports', desc: 'Auto-generate GRI, CSRD, BRSR, TCFD, CDP compliant sustainability reports', color: 'red', metric: 'Compliant' },
  { icon: Zap, title: 'IoT Monitoring', desc: 'Live sensor data streaming with intelligent alerts for emission spikes', color: 'indigo', metric: 'Real-time' },
];

const pricing = [
  {
    name: 'Starter', price: 'Free', period: '14-day trial', color: 'gray',
    features: ['Up to 5 users', 'Scope 1 & 2 tracking', 'Basic dashboards', 'CSV export', 'Email support'],
    cta: 'Start Free Trial', highlighted: false,
  },
  {
    name: 'Pro', price: '₹4,999', period: '/month', color: 'emerald',
    features: ['Unlimited users', 'Full Scope 1, 2 & 3', 'AI Insights & Forecasting', 'Supplier Portal (25)', 'GRI / BRSR reports', 'API access', 'Priority support'],
    cta: 'Start Pro Trial', highlighted: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: 'contact us', color: 'blue',
    features: ['Everything in Pro', 'Unlimited suppliers', 'Custom integrations', 'White-label option', 'Dedicated CSM', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales', highlighted: false,
  },
];

const faqs = [
  { q: 'What is Scope 3 emissions and why is it hard?', a: 'Scope 3 covers indirect emissions in your value chain — suppliers, logistics, product use. It represents 70-90% of most companies\' footprint but requires data from hundreds of external parties. Our Supplier Portal and AI scoring engine solves exactly this.' },
  { q: 'Which compliance frameworks are supported?', a: 'We support GRI Standards, GHG Protocol, India BRSR, EU CSRD/ESRS, TCFD, CDP, SASB, ISO 14064, SBTi, and SEC Climate Disclosure — covering all major global frameworks.' },
  { q: 'How does the AI data extraction work?', a: 'Our Gemini AI integration reads utility bills, invoices, and travel receipts (PDF, image, CSV). It extracts emission-relevant data, applies appropriate emission factors, and categorizes into Scope 1/2/3 automatically.' },
  { q: 'Is my ESG data secure?', a: 'Yes. Data is stored in Supabase (PostgreSQL) with row-level security. All API calls are rate-limited and authenticated. No ESG data is used to train AI models.' },
  { q: 'Can I integrate with existing ERP systems?', a: 'Yes — our REST API supports integration with SAP, Oracle, Microsoft Dynamics, and any system that can make HTTP requests. Webhooks for real-time sync are also available on Enterprise plans.' },
];

const frameworks = ['EU CSRD', 'India BRSR', 'GHG Protocol', 'TCFD', 'CDP', 'GRI Standards', 'SASB', 'ISO 14064', 'SBTi', 'SEC Climate'];

export function HackathonShowcase() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const c1 = useCounter(7, 1800, statsVisible);
  const c2 = useCounter(87, 2000, statsVisible);
  const c3 = useCounter(99, 1600, statsVisible);
  const c4 = useCounter(12, 1400, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
              <Leaf className="size-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">EcoTrack AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Log in</Link>
            <Link to="/login?mode=signup" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">Get Started</Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 border-t dark:border-gray-800">
            <Link to="/login" className="block py-2 text-sm font-medium">Log in</Link>
            <Link to="/login?mode=signup" className="block py-2 text-sm font-medium text-emerald-600">Sign up free</Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative overflow-hidden py-24 px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-teal-400/10 dark:bg-teal-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold mb-6">
              <Rocket className="size-4" /> TechnoTrix 2.0 — SKB-F8 & SKB-P1
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">Intelligent ESG</span>
            <br />& GHG Monitoring
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10"
          >
            From scattered Excel sheets to a unified AI-powered source of truth. Track Scope 1, 2 & 3 emissions, automate ESG reporting, and engage your entire supply chain — in real time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login?mode=signup" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-2xl hover:scale-105 transition-all">
              <Sparkles className="size-5" /> Start Free Trial
            </Link>
            <Link to="/login" className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl font-semibold text-lg hover:border-emerald-400 transition-all">
              View Live Demo <ArrowRight className="size-5" />
            </Link>
          </motion.div>

          {/* Framework badges */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-10"
          >
            {frameworks.map(f => (
              <span key={f} className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 shadow-sm">
                ✓ {f}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 text-center text-white">
          {[
            { value: `$${c1}B+`, label: 'ESG Market by 2030' },
            { value: `${c2}%`, label: 'Time Saved via AI' },
            { value: `${c3}.2%`, label: 'AI Extraction Accuracy' },
            { value: `${c4}+`, label: 'Compliance Frameworks' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <div className="text-4xl md:text-5xl font-black mb-2">{stat.value}</div>
              <div className="text-emerald-100 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">From Chaos to Clarity</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">The ESG data problem — solved.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['Fragmented data across departments', 'Unified intelligent platform — one source of truth'],
              ['Manual Excel-based ESG reporting', 'AI-powered automation, 87% faster'],
              ['No real-time emission tracking', 'Live IoT & supplier API streaming'],
              ['Weak Scope 3 supplier integration', 'Advanced ESG scoring across entire value chain'],
              ['No audit-ready documentation', 'Auto-generated GRI, CSRD, BRSR reports'],
              ['Carbon pricing risk exposure', 'Scenario analysis & Net Zero pathway modelling'],
            ].map(([problem, solution], i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex-1">
                  <p className="text-sm text-red-500 font-medium mb-1">❌ {problem}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">✅ {solution}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Platform Capabilities</h2>
            <p className="text-gray-500 dark:text-gray-400">Everything you need to lead on sustainability</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="group p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:-translate-y-1">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${FEATURE_COLORS[f.color]?.bg ?? 'bg-gray-100'}`}>
                    <Icon className={`size-7 ${FEATURE_COLORS[f.color]?.icon ?? 'text-gray-600'}`} />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{f.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${FEATURE_COLORS[f.color]?.badge ?? 'bg-gray-100 text-gray-700'}`}>{f.metric}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 dark:text-gray-400">Start free. Scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border-2 ${plan.highlighted 
                  ? 'border-emerald-500 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900 shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/30 scale-105' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="size-3" /> Most Popular
                    </span>
                  </div>
                )}
                <h3 className="font-black text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-emerald-600">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 mt-6">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/login?mode=signup" 
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${plan.highlighted 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30' 
                    : 'border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400 text-gray-700 dark:text-gray-300'}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="size-5 text-emerald-600 flex-shrink-0" /> : <ChevronDown className="size-5 text-gray-400 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black mb-4">Ready to Lead on Sustainability?</h2>
          <p className="text-emerald-100 text-xl mb-10 max-w-2xl mx-auto">
            Join forward-thinking companies using EcoTrack AI to reduce emissions, satisfy investors, and stay compliant.
          </p>
          <Link to="/login?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-emerald-700 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all">
            <Sparkles className="size-5" /> Start Free — No Credit Card Needed
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-4 bg-gray-950 text-gray-500 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-md">
            <Leaf className="size-4 text-white" />
          </div>
          <span className="text-white font-semibold">EcoTrack AI</span>
        </div>
        <p>Built for TechnoTrix 2.0 · Intelligent Platform for ESG Performance & GHG Monitoring</p>
        <p className="mt-1">GHG Protocol · ISO 14064 · EU CSRD · India BRSR · TCFD · CDP</p>
      </footer>
    </div>
  );
}

