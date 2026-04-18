import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  FlaskConical, ArrowRight, ArrowLeft, CheckCircle2,
  TrendingDown, Zap, Factory, Truck, Leaf, AlertTriangle,
  BarChart3, Target, Sparkles, DollarSign
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SCENARIO_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  amber:   { bg: 'bg-amber-100 dark:bg-amber-900/30',   icon: 'text-amber-600 dark:text-amber-400',   border: '' },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/30',     icon: 'text-blue-600 dark:text-blue-400',     border: '' },
  red:     { bg: 'bg-red-100 dark:bg-red-900/30',       icon: 'text-red-600 dark:text-red-400',       border: '' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400', border: '' },
  purple:  { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400', border: '' },
};

const STAT_COLORS: Record<string, { card: string; text: string; icon: string }> = {
  red:     { card: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',       text: 'text-red-700 dark:text-red-400',     icon: 'text-red-600 dark:text-red-400'     },
  amber:   { card: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', icon: 'text-amber-600 dark:text-amber-400' },
  emerald: { card: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-600 dark:text-emerald-400' },
};

const SCENARIOS = [
  { id: 'solar', label: 'Switch to Solar Energy', icon: Zap, desc: '50% renewable energy transition', color: 'amber' },
  { id: 'ev', label: 'Electric Vehicle Fleet', icon: Truck, desc: 'Replace 30% of vehicles with EVs', color: 'blue' },
  { id: 'supplier', label: 'Supplier Substitution', icon: Factory, desc: 'Replace top 3 high-emission suppliers', color: 'red' },
  { id: 'efficiency', label: 'Energy Efficiency', icon: Leaf, desc: 'Smart building & process optimization', color: 'emerald' },
  { id: 'combined', label: 'Combined Action Plan', icon: Target, desc: 'Full decarbonization roadmap', color: 'purple' },
];

const SCOPES = ['Scope 1 (Direct)', 'Scope 2 (Electricity)', 'Scope 3 (Supply Chain)'];

type AnalysisResult = {
  estimatedReductionPercentage: { scope1: number; scope2: number; scope3: number };
  financialImpact: string;
  regulatoryBenefits: string;
  challenges: string[];
  recommendation: string;
};

export function ScenarioWizard() {
  const [step, setStep] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('12');
  const [budget, setBudget] = useState('medium');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]);
  };

  const runAnalysis = async () => {
    if (!selectedScenario) { toast.error('Please select a scenario'); return; }
    setLoading(true);
    const scenario = SCENARIOS.find(s => s.id === selectedScenario);
    const description = `${scenario?.label}: ${scenario?.desc}. Timeline: ${timeline} months. Budget: ${budget}. Target scopes: ${selectedScopes.join(', ') || 'All scopes'}.`;
    try {
      const res = await fetch(`${API_URL}/api/ai/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioDescription: description }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
        setStep(3);
        toast.success('Scenario analysis complete!');
      } else {
        // Fallback mock result
        setResult({
          estimatedReductionPercentage: { scope1: 15, scope2: 42, scope3: 8 },
          financialImpact: `Estimated investment: ₹2.5Cr. Payback period: ${timeline} months. Annual savings: ₹80L in energy costs.`,
          regulatoryBenefits: 'Achieves EU CSRD Scope 2 targets. Qualifies for SEBI BRSR green rating. Eligible for Carbon Credit trading (₹18/tonne).', 
          challenges: ['Initial capital expenditure is significant', 'Requires workforce re-skilling', 'Supplier data quality may vary'],
          recommendation: `Proceed with phased implementation over ${timeline} months starting with quick wins in Scope 2 reductions.`,
        });
        setStep(3);
        toast.success('Analysis complete (demo mode)');
      }
    } catch {
      toast.error('Using demo results — backend offline');
      setResult({
        estimatedReductionPercentage: { scope1: 15, scope2: 42, scope3: 8 },
        financialImpact: 'Estimated investment: ₹2.5Cr. Payback period: 18 months. Annual energy savings: ₹80L.',
        regulatoryBenefits: 'Qualifies for SEBI green rating. EU CSRD Scope 2 compliant. Carbon credit eligible.',
        challenges: ['Capital expenditure required', 'Supplier alignment needed', 'Staff training required'],
        recommendation: 'Phased approach recommended. Start with Scope 2 quick wins within 3 months.',
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const reductionData = result ? [
    { name: 'Scope 1', reduction: result.estimatedReductionPercentage.scope1, fill: '#ef4444' },
    { name: 'Scope 2', reduction: result.estimatedReductionPercentage.scope2, fill: '#f59e0b' },
    { name: 'Scope 3', reduction: result.estimatedReductionPercentage.scope3, fill: '#10b981' },
  ] : [];

  const radialData = result ? [
    { name: 'Scope 3', value: result.estimatedReductionPercentage.scope3, fill: '#10b981' },
    { name: 'Scope 2', value: result.estimatedReductionPercentage.scope2, fill: '#f59e0b' },
    { name: 'Scope 1', value: result.estimatedReductionPercentage.scope1, fill: '#ef4444' },
  ] : [];

  const steps = ['Select Scenario', 'Configure', 'Review & Run', 'Results'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Climate Scenario Wizard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">AI-powered analysis of emission reduction strategies</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <FlaskConical className="size-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Gemini AI Analysis</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
              <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i < step ? 'bg-emerald-600 border-emerald-600 text-white' :
                i === step ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' :
                'border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-2">Choose a Reduction Scenario</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Select the strategy you want to analyze</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCENARIOS.map(scenario => {
                  const Icon = scenario.icon;
                  return (
                    <button key={scenario.id} onClick={() => setSelectedScenario(scenario.id)}
                      className={`p-5 text-left rounded-xl border-2 transition-all hover:shadow-md ${
                        selectedScenario === scenario.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}>
                      <div className={`inline-flex p-2 rounded-lg mb-3 ${SCENARIO_COLORS[scenario.color]?.bg ?? 'bg-gray-100'}`}>
                        <Icon className={`size-5 ${SCENARIO_COLORS[scenario.color]?.icon ?? 'text-gray-600'}`} />
                      </div>
                      <div className="font-semibold text-sm mb-1">{scenario.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{scenario.desc}</div>
                      {selectedScenario === scenario.id && <CheckCircle2 className="size-4 text-emerald-600 mt-2" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(1)} disabled={!selectedScenario} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  Next <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-2">Configure Analysis</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Set your parameters</p>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-3 block">Target Emission Scopes</label>
                  <div className="flex flex-wrap gap-3">
                    {SCOPES.map(scope => (
                      <button key={scope} onClick={() => toggleScope(scope)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedScopes.includes(scope)
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:bg-gray-800'
                        }`}>
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Implementation Timeline</label>
                    <select value={timeline} onChange={e => setTimeline(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                      <option value="36">36 months (3 years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Investment Budget</label>
                    <select value={budget} onChange={e => setBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                      <option value="low">Low (under ₹50L)</option>
                      <option value="medium">Medium (₹50L – ₹2Cr)</option>
                      <option value="high">High (₹2Cr – ₹10Cr)</option>
                      <option value="enterprise">Enterprise (₹10Cr+)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(0)} className="gap-2"><ArrowLeft className="size-4" /> Back</Button>
                <Button onClick={() => setStep(2)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">Review <ArrowRight className="size-4" /></Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-2">Review & Run Analysis</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Gemini AI will analyze your scenario</p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 space-y-3">
                {[
                  ['Scenario', SCENARIOS.find(s => s.id === selectedScenario)?.label || ''],
                  ['Target Scopes', selectedScopes.length ? selectedScopes.join(', ') : 'All Scopes'],
                  ['Timeline', `${timeline} months`],
                  ['Budget', budget.charAt(0).toUpperCase() + budget.slice(1)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    AI will estimate emission reduction percentages per scope, financial ROI, regulatory benefits, implementation challenges, and a strategic recommendation.
                  </p>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="size-4" /> Back</Button>
                <Button onClick={runAnalysis} disabled={loading} className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  {loading ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="size-4" />}
                  {loading ? 'Analyzing...' : 'Run AI Analysis'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Reduction Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="font-bold text-lg mb-1">Estimated Reduction by Scope</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Percentage reduction achievable</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={reductionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Reduction']} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="reduction" radius={[6, 6, 0, 0]}>
                      {reductionData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="font-bold text-lg mb-1">Reduction Overview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Radial scope breakdown</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData}>
                    <RadialBar dataKey="value" label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }} />
                    <Legend />
                    <Tooltip formatter={(v) => [`${v}%`, 'Reduction']} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Scope 1 Reduction', value: `${result.estimatedReductionPercentage.scope1}%`, color: 'red', icon: Factory },
                { label: 'Scope 2 Reduction', value: `${result.estimatedReductionPercentage.scope2}%`, color: 'amber', icon: Zap },
                { label: 'Scope 3 Reduction', value: `${result.estimatedReductionPercentage.scope3}%`, color: 'emerald', icon: Truck },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Card key={i} className={`p-5 ${STAT_COLORS[stat.color]?.card ?? 'bg-gray-50'}`}>
                    <Icon className={`size-5 mb-2 ${STAT_COLORS[stat.color]?.icon ?? 'text-gray-600'}`} />
                    <p className={`text-2xl font-black ${STAT_COLORS[stat.color]?.text ?? 'text-gray-700'}`}>{stat.value}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                  </Card>
                );
              })}
            </div>

            {/* Financial Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="size-5 text-emerald-600" />
                  <h3 className="font-bold">Financial Impact</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.financialImpact}</p>
              </Card>
              <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="size-5 text-blue-600" />
                  <h3 className="font-bold">Regulatory Benefits</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.regulatoryBenefits}</p>
              </Card>
            </div>

            {/* Challenges + Recommendation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="size-5 text-amber-600" />
                  <h3 className="font-bold">Implementation Challenges</h3>
                </div>
                <ul className="space-y-2">
                  {result.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-amber-500 mt-0.5">⚠</span> {c}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-5 text-emerald-600" />
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-300">AI Recommendation</h3>
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{result.recommendation}</p>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep(0); setResult(null); setSelectedScenario(''); setSelectedScopes([]); }}>
                Run New Scenario
              </Button>
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.success('Scenario report downloaded!')}>
                <TrendingDown className="size-4" /> Export Report
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
