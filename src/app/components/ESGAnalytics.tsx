import { useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrainCircuit, Shield, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Globe, Leaf, Target, Zap, BarChart3, FileText,
  Sparkles, Loader2, ArrowRight, Award, Activity
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Compliance = { status: string; score: number; gaps: string[] };
type Risk = { category: string; severity: string; description: string; mitigation: string };
type Opportunity = { title: string; potentialSavings: string; timeframe: string; difficulty: string };
type ESGData = {
  overallScore: number; grade: string;
  environmentalScore: number; socialScore: number; governanceScore: number;
  carbonIntensity: string; netZeroReadiness: number;
  regulatoryCompliance: Record<string, Compliance>;
  risks: Risk[]; opportunities: Opportunity[];
  recommendations: string[];
  benchmarks: { industryAvgScore: number; topPerformerScore: number; percentileRank: number };
  summary: string;
};

const SEVERITY_MAP: Record<string, string> = {
  'High': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  'Medium': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  'Low': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
};
const STATUS_MAP: Record<string, string> = {
  'Compliant': 'bg-green-100 text-green-700 border-green-200',
  'Partially Compliant': 'bg-amber-100 text-amber-700 border-amber-200',
  'Non-Compliant': 'bg-red-100 text-red-700 border-red-200',
};
const FRAMEWORK_LABELS: Record<string, string> = {
  ghgProtocol: 'GHG Protocol',
  euCsrd: 'EU CSRD',
  tcfd: 'TCFD',
  sebiBresr: 'SEBI BRSR',
  cdp: 'CDP',
};

function ScoreRing({ score, size = 120, label, color }: { score: number; size?: number; label: string; color: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth={10} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-black text-gray-900 dark:text-white">{score}</span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">/100</span>
      </div>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">{label}</p>
    </div>
  );
}

export function ESGAnalytics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ESGData | null>(null);
  const [emissions, setEmissions] = useState<{ scope1: number; scope2: number; scope3: number; total: number } | null>(null);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    toast.info('Gemini AI is analyzing ESG performance…');
    try {
      const res = await fetch(`${API_URL}/api/ai/esg-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
      setEmissions(json.emissionsSummary);
      toast.success('ESG analysis complete!');
    } catch (err: unknown) {
      toast.error(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const radarData = data ? [
    { metric: 'Environmental', value: data.environmentalScore },
    { metric: 'Social', value: data.socialScore },
    { metric: 'Governance', value: data.governanceScore },
    { metric: 'Net Zero', value: data.netZeroReadiness },
    { metric: 'Compliance', value: data.overallScore },
  ] : [];

  const complianceChart = data ? Object.entries(data.regulatoryCompliance).map(([key, val]) => ({
    name: FRAMEWORK_LABELS[key] || key, score: val.score,
    fill: val.score >= 85 ? '#10b981' : val.score >= 70 ? '#f59e0b' : '#ef4444',
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI ESG Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Comprehensive AI-powered Environmental, Social & Governance analysis</p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={loading}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 px-6"
          size="lg"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : <BrainCircuit className="size-5" />}
          {loading ? 'Analyzing with Gemini…' : data ? 'Re-analyze' : 'Run AI ESG Analysis'}
        </Button>
      </div>

      {/* Empty State */}
      {!data && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-12 text-center border-2 border-dashed border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10">
            <div className="mx-auto size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <BrainCircuit className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Analyze</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Click "Run AI ESG Analysis" to let Gemini AI analyze your emissions data across Environmental, Social, and Governance dimensions with regulatory compliance checks.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {['GHG Protocol', 'EU CSRD', 'TCFD', 'SEBI BRSR', 'CDP'].map(f => (
                <Badge key={f} className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                  <Shield className="size-3 mr-1" />{f}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                  <BrainCircuit className="size-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Gemini AI Analyzing ESG Data…</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Evaluating emissions across 5 regulatory frameworks</p>
                  <div className="mt-3 h-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      initial={{ width: '0%' }} animate={{ width: '90%' }} transition={{ duration: 8, ease: 'linear' }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Executive Summary */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <Sparkles className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">Executive Summary</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">{data.summary}</p>
              </div>
              <Badge className="ml-auto bg-emerald-600 text-white text-lg px-4 py-1 shrink-0">{data.grade}</Badge>
            </div>
          </Card>

          {/* Score Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall ESG', value: data.overallScore, icon: Award, cls: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800', color: '#10b981' },
              { label: 'Environmental', value: data.environmentalScore, icon: Leaf, cls: 'from-green-50 to-lime-50 dark:from-green-900/20 dark:to-lime-900/20 border-green-200 dark:border-green-800', color: '#22c55e' },
              { label: 'Social', value: data.socialScore, icon: Globe, cls: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800', color: '#3b82f6' },
              { label: 'Governance', value: data.governanceScore, icon: Shield, cls: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800', color: '#8b5cf6' },
            ].map(({ label, value, icon: Icon, cls, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`p-5 bg-gradient-to-br ${cls} relative overflow-hidden`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="size-5 opacity-60" />
                    <span className="text-xs font-medium opacity-60">{label}</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <ScoreRing score={value} size={100} label="" color={color} />
                  </div>
                  <p className="text-center text-xs font-medium mt-2 opacity-70">{value >= 85 ? 'Excellent' : value >= 70 ? 'Good' : value >= 60 ? 'Fair' : 'Needs Work'}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Radar + Emissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="size-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">ESG Performance Radar</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="size-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Regulatory Compliance</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={complianceChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} name="Compliance Score">
                    {complianceChart.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Benchmarks */}
          {data.benchmarks && (
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Target className="size-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Industry Benchmarking</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Industry Average</p>
                  <p className="text-3xl font-black text-gray-600 dark:text-gray-400">{data.benchmarks.industryAvgScore}</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center border-2 border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Your Score</p>
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{data.overallScore}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Top Performer</p>
                  <p className="text-3xl font-black text-gray-600 dark:text-gray-400">{data.benchmarks.topPerformerScore}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Percentile Rank</span>
                  <span>{data.benchmarks.percentileRank}th percentile</span>
                </div>
                <Progress value={data.benchmarks.percentileRank} className="h-3" />
              </div>
            </Card>
          )}

          {/* Compliance Framework Details */}
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="size-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Framework Compliance Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data.regulatoryCompliance).map(([key, val], i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{FRAMEWORK_LABELS[key] || key}</span>
                      <Badge className={STATUS_MAP[val.status] || 'bg-gray-100 text-gray-700'}>{val.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={val.score} className="h-2 flex-1" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{val.score}%</span>
                    </div>
                    {val.gaps.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {val.gaps.map((gap, gi) => (
                          <p key={gi} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                            <AlertTriangle className="size-3 shrink-0 mt-0.5" />{gap}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Risks + Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risks */}
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Risk Assessment</h3>
              </div>
              <div className="space-y-3">
                {data.risks.map((risk, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{risk.category}</span>
                      <Badge className={SEVERITY_MAP[risk.severity] || SEVERITY_MAP['Medium']}>{risk.severity}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{risk.description}</p>
                    <div className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3 shrink-0 mt-0.5" />
                      <span>{risk.mitigation}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Opportunities */}
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Opportunities</h3>
              </div>
              <div className="space-y-3">
                {data.opportunities.map((opp, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-2">{opp.title}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div><p className="text-[10px] text-gray-500">Savings</p><p className="text-sm font-bold text-emerald-600">{opp.potentialSavings}</p></div>
                      <div><p className="text-[10px] text-gray-500">Timeframe</p><p className="text-sm font-bold text-gray-700 dark:text-gray-300">{opp.timeframe}</p></div>
                      <div><p className="text-[10px] text-gray-500">Difficulty</p><p className="text-sm font-bold text-gray-700 dark:text-gray-300">{opp.difficulty}</p></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-lg text-purple-900 dark:text-purple-300">AI Recommendations</h3>
              <Badge className="ml-auto bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">Gemini AI</Badge>
            </div>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg">
                  <div className="size-6 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-300">{rec}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Net Zero Readiness */}
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="size-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Net Zero Readiness</h3>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Carbon Intensity: {data.carbonIntensity}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress to Net Zero</span>
                  <span className="font-bold text-emerald-600">{data.netZeroReadiness}%</span>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                    initial={{ width: '0%' }} animate={{ width: `${data.netZeroReadiness}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Current</span>
                  <span>Target: 2040</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
