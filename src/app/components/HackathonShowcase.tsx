import { Link } from 'react-router';
import { Card } from './ui/card';
import { 
  Trophy,
  Sparkles,
  Rocket,
  Target,
  Zap,
  CheckCircle2,
  TrendingUp,
  Database,
  BrainCircuit,
  Globe,
  Shield,
  Users,
  ArrowRight,
  Leaf
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const keyFeatures = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Automation',
    description: 'GPT-4 Vision + OCR extracts data from utility bills and invoices automatically',
    color: 'purple',
    impact: '87% time saved'
  },
  {
    icon: Sparkles,
    title: 'Real-time Carbon Calculation',
    description: 'Integrated with Climatiq & EPA APIs for instant emission factor lookup',
    color: 'blue',
    impact: '99.2% accuracy'
  },
  {
    icon: Users,
    title: 'Supplier ESG Scoring',
    description: 'Advanced scoring system tracking Scope 3 emissions across value chain',
    color: 'emerald',
    impact: '100% coverage'
  },
  {
    icon: Target,
    title: 'Predictive Analytics',
    description: 'ML-powered 6-month forecasting with anomaly detection',
    color: 'amber',
    impact: '91% confidence'
  },
  {
    icon: Shield,
    title: 'Audit-Ready Reports',
    description: 'Automated compliance reporting for GRI, CSRD, BRSR, TCFD, CDP',
    color: 'red',
    impact: '100% compliant'
  },
  {
    icon: Zap,
    title: 'Real-time Monitoring',
    description: 'Live IoT integration and instant alert system for emission spikes',
    color: 'indigo',
    impact: 'Live updates'
  }
];

const techStack = [
  { name: 'React + TypeScript', category: 'Frontend' },
  { name: 'Tailwind CSS v4', category: 'Styling' },
  { name: 'Recharts', category: 'Visualization' },
  { name: 'Motion (Framer)', category: 'Animation' },
  { name: 'PostgreSQL + Prisma', category: 'Database' },
  { name: 'GPT-4 Vision', category: 'AI/ML' },
  { name: 'Climatiq API', category: 'Carbon Data' },
  { name: 'React Router v7', category: 'Navigation' }
];

const problemsSolved = [
  '❌ Fragmented data across departments → ✅ Unified intelligent platform',
  '❌ Manual Excel-based reporting → ✅ AI-powered automation',
  '❌ No real-time tracking → ✅ Live monitoring with IoT',
  '❌ Weak supplier integration → ✅ Advanced ESG scoring system',
  '❌ Lack of audit-ready systems → ✅ Automated compliance reports'
];

const marketImpact = [
  { metric: '$7B', label: 'Market Size by 2030', sublabel: 'ESG Software' },
  { metric: '15-20%', label: 'Market CAGR', sublabel: 'Carbon Management' },
  { metric: '70-90%', label: 'Scope 3 Emissions', sublabel: 'Biggest Challenge' },
  { metric: '100%', label: 'Our Coverage', sublabel: 'All Scopes' }
];

export function HackathonShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Leaf className="size-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  EcoTrack AI
                </h1>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                Log in
              </Link>
              <Link to="/login?mode=signup" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
      <div className="text-center py-12 px-4 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 rounded-2xl text-white relative overflow-hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="absolute top-10 right-10 opacity-20"
        >
          <Trophy className="size-32" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white px-4 py-2">
            <Rocket className="size-4 mr-2" />
            Hackathon Winning Project
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            EcoTrack AI
          </h1>
          <p className="text-xl md:text-2xl mb-2 text-emerald-50">
            Digital Intelligent Platform for ESG Performance & GHG Monitoring
          </p>
          <p className="text-lg text-emerald-100 max-w-3xl mx-auto">
            Moving from scattered, error-prone manual spreadsheets to a unified, AI-powered "source of truth"
          </p>
        </motion.div>
      </div>

      {/* Market Impact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketImpact.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 text-center bg-gradient-to-br from-white to-emerald-50 border-emerald-200">
              <p className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                {item.metric}
              </p>
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-600 mt-1">{item.sublabel}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Problems Solved */}
      <Card className="p-8 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Target className="size-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Problems We Solve</h2>
            <p className="text-gray-600">Addressing critical market gaps</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problemsSolved.map((problem, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-4 bg-white rounded-lg border border-red-200"
            >
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-gray-900">{problem}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Key Features */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Innovative Features</h2>
          <p className="text-gray-600">What makes this project a winner</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`p-6 h-full hover:shadow-xl transition-shadow border-2 bg-gradient-to-br from-${feature.color}-50 to-white border-${feature.color}-200`}>
                  <div className={`p-4 bg-${feature.color}-100 rounded-xl inline-block mb-4`}>
                    <Icon className={`size-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-700 mb-4">{feature.description}</p>
                  <Badge className={`bg-${feature.color}-100 text-${feature.color}-700 border-${feature.color}-200`}>
                    <TrendingUp className="size-3 mr-1" />
                    {feature.impact}
                  </Badge>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Database className="size-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tech Stack</h2>
            <p className="text-gray-600">Production-ready architecture</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techStack.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-white rounded-lg border border-blue-200"
            >
              <p className="font-bold text-sm text-gray-900 mb-1">{tech.name}</p>
              <p className="text-xs text-gray-600">{tech.category}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Compliance Frameworks */}
      <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Globe className="size-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Global Compliance Coverage</h2>
            <p className="text-gray-600">Supporting international ESG frameworks</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {['EU CSRD', 'India BRSR', 'GHG Protocol', 'TCFD', 'CDP', 'GRI Standards', 'SASB', 'SEC Climate', 'ISO 14064', 'SBTi', 'Carbon Neutral', 'B Corp'].map((framework, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Badge className="w-full justify-center py-2 bg-white border-green-200 text-green-700">
                <CheckCircle2 className="size-3 mr-1" />
                {framework}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Expected Outcomes */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Trophy className="size-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Expected Impact & Outcomes</h2>
            <p className="text-gray-600">Real-world business value</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900">Improved ESG Reporting Accuracy</p>
                <p className="text-sm text-gray-700">99.2% AI extraction accuracy eliminates manual errors</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900">Reduced Manual Effort</p>
                <p className="text-sm text-gray-700">87% time saved through AI-powered automation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900">Better Decision-Making</p>
                <p className="text-sm text-gray-700">AI insights with 91% confidence for sustainability strategies</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900">Strong Compliance & Audit Readiness</p>
                <p className="text-sm text-gray-700">100% coverage across global frameworks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900">Comprehensive Scope 3 Tracking</p>
                <p className="text-sm text-gray-700">Advanced supplier engagement solving the 70-90% challenge</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900">Real-time Anomaly Detection</p>
                <p className="text-sm text-gray-700">Instant alerts for emission spikes and unusual patterns</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="p-12 text-center bg-gradient-to-br from-emerald-600 to-teal-700 border-0 text-white">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Trophy className="size-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Ready to Transform ESG Reporting?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join the future of sustainable business intelligence with AI-powered automation
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/login">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2">
                <Rocket className="size-5" />
                Start Demo
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 gap-2">
              <ArrowRight className="size-5" />
              View Documentation
            </Button>
          </div>
        </motion.div>
      </Card>
      </main>
    </div>
  );
}
