import { Card } from './ui/card';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  Target,
  AlertTriangle,
  Sparkles,
  BarChart3,
  LineChart as LineChartIcon,
  Zap,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const forecastData = [
  { month: 'Jan', actual: 1660, predicted: null, lower: null, upper: null },
  { month: 'Feb', actual: 1610, predicted: null, lower: null, upper: null },
  { month: 'Mar', actual: 1570, predicted: null, lower: null, upper: null },
  { month: 'Apr', actual: 1510, predicted: null, lower: null, upper: null },
  { month: 'May', actual: 1470, predicted: null, lower: null, upper: null },
  { month: 'Jun', actual: 1430, predicted: null, lower: null, upper: null },
  { month: 'Jul', actual: null, predicted: 1385, lower: 1350, upper: 1420 },
  { month: 'Aug', actual: null, predicted: 1340, lower: 1290, upper: 1390 },
  { month: 'Sep', actual: null, predicted: 1295, lower: 1230, upper: 1360 },
  { month: 'Oct', actual: null, predicted: 1250, lower: 1170, upper: 1330 },
  { month: 'Nov', actual: null, predicted: 1205, lower: 1110, upper: 1300 },
  { month: 'Dec', actual: null, predicted: 1160, lower: 1050, upper: 1270 },
];

const anomalyData = [
  { day: 1, emissions: 48, isAnomaly: false },
  { day: 2, emissions: 52, isAnomaly: false },
  { day: 3, emissions: 45, isAnomaly: false },
  { day: 4, emissions: 78, isAnomaly: true },
  { day: 5, emissions: 47, isAnomaly: false },
  { day: 6, emissions: 50, isAnomaly: false },
  { day: 7, emissions: 46, isAnomaly: false },
  { day: 8, emissions: 51, isAnomaly: false },
  { day: 9, emissions: 49, isAnomaly: false },
  { day: 10, emissions: 88, isAnomaly: true },
  { day: 11, emissions: 47, isAnomaly: false },
  { day: 12, emissions: 45, isAnomaly: false },
  { day: 13, emissions: 50, isAnomaly: false },
  { day: 14, emissions: 48, isAnomaly: false },
];

const recommendations = [
  {
    id: 1,
    title: 'Optimize Manufacturing Schedule',
    impact: 'High',
    savings: '12.5%',
    description: 'AI analysis shows peak emissions during off-peak hours. Shift 30% of production to renewable energy periods.',
    timeframe: '3 months',
    difficulty: 'Medium',
    icon: BarChart3,
    color: 'emerald'
  },
  {
    id: 2,
    title: 'Supplier Consolidation Opportunity',
    impact: 'High',
    savings: '18.2%',
    description: 'Replace ABC Corp (ESG: 62) with Eco Materials Inc (ESG: 94) for raw materials procurement.',
    timeframe: '6 months',
    difficulty: 'Low',
    icon: Target,
    color: 'blue'
  },
  {
    id: 3,
    title: 'Energy Efficiency Upgrade',
    impact: 'Medium',
    savings: '8.7%',
    description: 'Install smart energy monitoring systems in facilities with highest Scope 2 emissions.',
    timeframe: '4 months',
    difficulty: 'Medium',
    icon: Zap,
    color: 'amber'
  },
  {
    id: 4,
    title: 'Transportation Route Optimization',
    impact: 'Medium',
    savings: '6.3%',
    description: 'AI-optimized logistics routes can reduce fuel consumption and delivery emissions by consolidating shipments.',
    timeframe: '2 months',
    difficulty: 'Low',
    icon: TrendingDown,
    color: 'purple'
  }
];

const scenarioAnalysis = [
  { name: 'Business as Usual', 2024: 1430, 2025: 1450, 2026: 1470, 2027: 1490, 2028: 1510 },
  { name: 'Moderate Action', 2024: 1430, 2025: 1350, 2026: 1280, 2027: 1220, 2028: 1170 },
  { name: 'Aggressive Reduction', 2024: 1430, 2025: 1250, 2026: 1090, 2027: 950, 2028: 820 },
  { name: 'Net Zero Target', 2024: 1430, 2025: 1150, 2026: 880, 2027: 620, 2028: 350 },
];

const insights = [
  {
    type: 'success',
    title: 'Positive Trend Detected',
    description: 'Emissions reduced by 5.3% this month, exceeding the 4% target.',
    confidence: 94
  },
  {
    type: 'warning',
    title: 'Anomaly Alert',
    description: 'Unusual spike detected on June 4th and 10th. Investigation recommended.',
    confidence: 87
  },
  {
    type: 'info',
    title: 'Seasonal Pattern Identified',
    description: 'AI models predict 15% increase in Q4 based on historical manufacturing cycles.',
    confidence: 91
  },
  {
    type: 'opportunity',
    title: 'Optimization Opportunity',
    description: 'Switching to renewable energy during peak hours could save 220 tCO₂e annually.',
    confidence: 88
  }
];

export function AIInsights() {
  const [aiThinking, setAiThinking] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInsights, setGeneratedInsights] = useState<string[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    toast.info('Gemini AI is analyzing emissions data…');

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Analyze these emissions: Scope 1 = 380 tCO2e, Scope 2 = 270 tCO2e, Scope 3 = 780 tCO2e (total 1430). ESG Score 82.6/100. Give 3 short, specific predictive insights with percentages. Be concise, each insight max 1 sentence. Format as a JSON array of strings.',
        }),
      });
      const json = await res.json();
      // Try to parse the AI response as a JSON array of strings
      try {
        const parsed = JSON.parse(json.reply || '[]');
        if (Array.isArray(parsed)) {
          setGeneratedInsights(prev => [...parsed.slice(0, 3), ...prev].slice(0, 6));
          toast.success(`Generated ${parsed.length} new AI insights!`);
        } else {
          setGeneratedInsights(prev => [json.reply, ...prev].slice(0, 6));
          toast.success('Generated new AI insight!');
        }
      } catch {
        // If not valid JSON, just use the raw reply
        setGeneratedInsights(prev => [json.reply || 'No insight generated', ...prev].slice(0, 6));
        toast.success('Generated new AI insight!');
      }
    } catch (err) {
      toast.error('Failed to generate insights — check backend connection');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDetailsClick = (title: string) => {
    toast.success(`Loading detailed implementation plan for: ${title}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAiThinking(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <TrendingUp className="size-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="size-5 text-amber-600" />;
      case 'info': return <BrainCircuit className="size-5 text-blue-600" />;
      case 'opportunity': return <Lightbulb className="size-5 text-purple-600" />;
      default: return <Sparkles className="size-5 text-gray-600" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'opportunity': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Insights</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Predictive analytics and intelligent recommendations</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <BrainCircuit className="size-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">AI Model v3.2.1</span>
          {aiThinking && <div className="size-2 bg-purple-500 rounded-full animate-pulse"></div>}
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`p-5 border-2 ${getInsightBg(insight.type)}`}>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-700">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Progress value={insight.confidence} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium text-gray-600">{insight.confidence}% confidence</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI-Generated Insights (from Gemini) */}
      {generatedInsights.length > 0 && (
        <Card className="p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-lg text-purple-900 dark:text-purple-300">Gemini AI Analysis</h3>
            <span className="ml-auto text-xs text-purple-500">Live from Gemini</span>
          </div>
          <div className="space-y-3">
            {generatedInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg border border-purple-100 dark:border-purple-800"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded">
                    <BrainCircuit className="size-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-300">{insight}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Emissions Forecast */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">6-Month AI Emissions Forecast</h3>
            <p className="text-sm text-gray-600">Predictive model based on historical data and trends</p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">ML-Powered</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
              name="Lower Bound"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#actualGradient)"
              fillOpacity={1}
              name="Actual"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={3}
              strokeDasharray="5 5"
              fill="url(#predictedGradient)"
              fillOpacity={1}
              name="Predicted"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Current (Jun)</p>
            <p className="text-2xl font-bold text-gray-900">1,430</p>
            <p className="text-xs text-gray-500">tCO₂e</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Predicted (Dec)</p>
            <p className="text-2xl font-bold text-purple-600">1,160</p>
            <p className="text-xs text-gray-500">tCO₂e</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Reduction</p>
            <p className="text-2xl font-bold text-green-600">-18.9%</p>
            <p className="text-xs text-gray-500">by year-end</p>
          </div>
        </div>
      </Card>

      {/* Anomaly Detection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Anomaly Detection</h3>
            <p className="text-sm text-gray-600">AI-identified unusual emission patterns</p>
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            2 anomalies detected
          </Badge>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" name="Day" />
            <YAxis stroke="#6b7280" name="Emissions" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Scatter name="Normal" data={anomalyData.filter(d => !d.isAnomaly)} fill="#10b981">
              {anomalyData.filter(d => !d.isAnomaly).map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#10b981" />
              ))}
            </Scatter>
            <Scatter name="Anomaly" data={anomalyData.filter(d => d.isAnomaly)} fill="#ef4444">
              {anomalyData.filter(d => d.isAnomaly).map((entry, index) => (
                <Cell key={`cell-anomaly-${index}`} fill="#ef4444" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Action Required</p>
              <p className="text-sm text-amber-700 mt-1">
                Investigate spikes on Day 4 (78 tCO₂e) and Day 10 (88 tCO₂e). Potential causes: equipment malfunction or unscheduled operations.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl">AI-Generated Recommendations</h3>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleGenerateMore}
            disabled={isGenerating}
          >
            {isGenerating ? <div className="size-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /> : <Sparkles className="size-4" />}
            {isGenerating ? 'Analyzing...' : 'Generate More'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 bg-${rec.color}-100 rounded-lg`}>
                      <Icon className={`size-6 text-${rec.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm">{rec.title}</h4>
                        <Badge className={getImpactColor(rec.impact)}>
                          {rec.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{rec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Potential Savings</p>
                        <p className="text-lg font-bold text-green-600">{rec.savings}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Timeframe</p>
                        <p className="text-sm font-medium text-gray-900">{rec.timeframe}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Difficulty</p>
                        <p className="text-sm font-medium text-gray-900">{rec.difficulty}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="gap-1" onClick={() => handleDetailsClick(rec.title)}>
                      Details
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Climate Scenario Analysis */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Climate Scenario Analysis</h3>
            <p className="text-sm text-gray-600">AI-simulated emission trajectories based on different strategies</p>
          </div>
          <Calendar className="size-5 text-emerald-600" />
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={scenarioAnalysis}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line type="monotone" dataKey="2024" stroke="#94a3b8" strokeWidth={2} name="2024" />
            <Line type="monotone" dataKey="2025" stroke="#64748b" strokeWidth={2} name="2025" />
            <Line type="monotone" dataKey="2026" stroke="#475569" strokeWidth={2} name="2026" />
            <Line type="monotone" dataKey="2027" stroke="#334155" strokeWidth={2} name="2027" />
            <Line type="monotone" dataKey="2028" stroke="#10b981" strokeWidth={3} name="2028" />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {scenarioAnalysis.map((scenario) => (
            <div key={scenario.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">{scenario.name}</p>
              <p className="text-xl font-bold text-gray-900">{scenario[2028]}</p>
              <p className="text-xs text-gray-600">tCO₂e by 2028</p>
              <div className="mt-2 flex items-center gap-1">
                <TrendingDown className="size-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  {((1 - scenario[2028] / scenario[2024]) * 100).toFixed(0)}% reduction
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
