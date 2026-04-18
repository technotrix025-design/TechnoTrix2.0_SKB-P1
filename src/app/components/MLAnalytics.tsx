import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrainCircuit, Download, Play, BarChart3, TrendingUp, Globe,
  Loader2, CheckCircle2, Database, Sparkles, Target, Zap,
  HelpCircle, ArrowRight, Lightbulb, Users
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import * as tf from '@tensorflow/tfjs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type DataRow = { country: string; year: number; co2: number; co2_per_capita: number; population: number; gdp: number; methane: number; share_global: number };
type Summary = { totalRows: number; countries: number; yearRange: [number, number]; totalCO2Mt: number };
type LossPoint = { epoch: number; loss: number };
type PredPoint = { year: number; actual: number; predicted: number | null };

const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#a855f7'];

const SCENARIOS = [
  { id: 'global', icon: Globe, title: 'Global Emissions Forecast', desc: 'Predict worldwide CO₂ for the next 7 years', color: 'emerald', countries: null },
  { id: 'india', icon: Users, title: 'India Emissions Trend', desc: "Forecast India's future CO₂ trajectory", color: 'amber', countries: 'India' },
  { id: 'top5', icon: BarChart3, title: 'Top 5 Emitters', desc: 'Compare US, China, India, Russia, Japan', color: 'blue', countries: 'United States,China,India,Russia,Japan' },
  { id: 'eu', icon: Target, title: 'European Union', desc: "Track Europe's decarbonization progress", color: 'purple', countries: 'France,Germany,United Kingdom,Italy,Spain' },
];

export function MLAnalytics() {
  const [dataset, setDataset] = useState<DataRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trained, setTrained] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [totalEpochs] = useState(80);
  const [lossHistory, setLossHistory] = useState<LossPoint[]>([]);
  const [predictions, setPredictions] = useState<PredPoint[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [topCountries, setTopCountries] = useState<{ country: string; co2: number; fill: string }[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const modelRef = useRef<tf.Sequential | null>(null);

  // Fetch from OWID (real live data)
  const fetchData = useCallback(async (countries?: string | null) => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/kaggle/live-data?limit=3000&yearFrom=1950`;
      if (countries) url += `&countries=${encodeURIComponent(countries)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDataset(json.data);
      setSummary(json.summary);
      setDataSource(json.source || 'Our World in Data');

      const byCountry: Record<string, number> = {};
      json.data.forEach((r: DataRow) => { byCountry[r.country] = (byCountry[r.country] || 0) + r.co2; });
      const sorted = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 10);
      setTopCountries(sorted.map(([country, co2], i) => ({ country, co2: Math.round(co2), fill: COLORS[i % COLORS.length] })));

      toast.success(`Loaded ${json.data.length} records from ${json.summary.countries} countries`);
    } catch {
      // Fallback to Kaggle
      try {
        const res = await fetch(`${API_URL}/api/kaggle/dataset?limit=2000`);
        const json = await res.json();
        if (json.success) {
          setDataset(json.data); setSummary(json.summary); setDataSource('Kaggle');
          const byCountry: Record<string, number> = {};
          json.data.forEach((r: DataRow) => { byCountry[r.country] = (byCountry[r.country] || 0) + r.co2; });
          const sorted = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 10);
          setTopCountries(sorted.map(([country, co2], i) => ({ country, co2: Math.round(co2), fill: COLORS[i % COLORS.length] })));
          toast.success(`Loaded ${json.data.length} records (Kaggle fallback)`);
        }
      } catch { toast.error('Failed to load data'); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Train model
  const trainModel = useCallback(async () => {
    if (dataset.length === 0) { toast.error('Load data first'); return; }
    setTraining(true); setTrained(false); setLossHistory([]); setPredictions([]); setAccuracy(null); setEpoch(0);

    const byYear: Record<number, number> = {};
    dataset.forEach(r => { byYear[r.year] = (byYear[r.year] || 0) + r.co2; });
    const years = Object.keys(byYear).map(Number).sort();
    const co2Values = years.map(y => byYear[y]);

    const minY = Math.min(...years), maxY = Math.max(...years);
    const minC = Math.min(...co2Values), maxC = Math.max(...co2Values);
    const normY = years.map(y => (y - minY) / (maxY - minY || 1));
    const normC = co2Values.map(c => (c - minC) / (maxC - minC || 1));

    const xs = tf.tensor2d(normY, [normY.length, 1]);
    const ys = tf.tensor2d(normC, [normC.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: tf.train.adam(0.01), loss: 'meanSquaredError' });
    modelRef.current = model;

    const losses: LossPoint[] = [];
    await model.fit(xs, ys, {
      epochs: totalEpochs, shuffle: true,
      callbacks: {
        onEpochEnd: (ep, logs) => {
          losses.push({ epoch: ep + 1, loss: parseFloat((logs?.loss ?? 0).toFixed(6)) });
          setEpoch(ep + 1); setLossHistory([...losses]);
        },
      },
    });

    const futureYears = Array.from({ length: 7 }, (_, i) => maxY + i + 1);
    const allYears = [...years, ...futureYears];
    const normAll = allYears.map(y => (y - minY) / (maxY - minY || 1));
    const xsPred = tf.tensor2d(normAll, [normAll.length, 1]);
    const predNorm = model.predict(xsPred) as tf.Tensor;
    const predValues = Array.from(await predNorm.data()).map(v => Math.round(v * (maxC - minC) + minC));

    setPredictions(allYears.map((y, i) => ({ year: y, actual: byYear[y] || 0, predicted: predValues[i] })));

    // Calculate R² as "accuracy" in plain language
    const trainPred = predValues.slice(0, years.length);
    const mean = co2Values.reduce((a, b) => a + b, 0) / co2Values.length;
    const ssRes = co2Values.reduce((s, a, i) => s + (a - trainPred[i]) ** 2, 0);
    const ssTot = co2Values.reduce((s, a) => s + (a - mean) ** 2, 0);
    const r2 = Math.max(0, 1 - ssRes / (ssTot || 1));
    setAccuracy(Math.round(r2 * 100));

    xs.dispose(); ys.dispose(); xsPred.dispose(); predNorm.dispose();
    setTraining(false); setTrained(true);
    toast.success(`Model trained! Prediction accuracy: ${Math.round(r2 * 100)}%`);
  }, [dataset, totalEpochs]);

  const handleScenario = (scenario: typeof SCENARIOS[0]) => {
    setActiveScenario(scenario.id);
    setTrained(false); setPredictions([]); setLossHistory([]); setAccuracy(null);
    fetchData(scenario.countries);
  };

  const pct = Math.round((epoch / totalEpochs) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Emissions Predictor</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Predict future CO₂ emissions using real-world data — no coding required
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
            <Database className="size-3 mr-1" /> {dataSource || 'Live Data'}
          </Badge>
          {trained && (
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <CheckCircle2 className="size-3 mr-1" /> {accuracy}% Accuracy
            </Badge>
          )}
        </div>
      </div>

      {/* Step 1: Choose Scenario */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="size-5 text-amber-500" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Step 1: Choose What to Predict</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map(s => {
            const Icon = s.icon;
            const isActive = activeScenario === s.id;
            return (
              <motion.button key={s.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleScenario(s)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isActive
                    ? `border-${s.color}-500 bg-${s.color}-50 dark:bg-${s.color}-900/20 shadow-lg`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className={`size-10 rounded-lg flex items-center justify-center mb-3 ${
                  isActive ? `bg-${s.color}-100 dark:bg-${s.color}-900/40` : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon className={`size-5 ${isActive ? `text-${s.color}-600` : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* KPIs */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Data Points', value: summary.totalRows.toLocaleString(), sub: 'real records', icon: Database, cls: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' },
            { label: 'Countries', value: summary.countries, sub: 'in dataset', icon: Globe, cls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' },
            { label: 'Time Period', value: `${summary.yearRange[0]}–${summary.yearRange[1]}`, sub: `${summary.yearRange[1] - summary.yearRange[0]} years of data`, icon: BarChart3, cls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
            { label: 'Total CO₂', value: `${(summary.totalCO2Mt / 1e3).toFixed(1)}B Mt`, sub: 'megatonnes recorded', icon: TrendingUp, cls: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' },
          ].map(({ label, value, sub, icon: Icon, cls }) => (
            <Card key={label} className={`p-5 ${cls}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{label}</p>
                <Icon className="size-4 opacity-70" />
              </div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs mt-1 opacity-70">{sub}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2: Train */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="size-5 text-purple-600 dark:text-purple-400" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Step 2: Train the AI Model</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          The AI will learn patterns from historical data and predict future emissions. No technical knowledge needed — just click the button!
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={trainModel} disabled={training || dataset.length === 0} size="lg"
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30 px-8"
          >
            {training ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5" />}
            {training ? `Learning patterns (${pct}%)…` : trained ? '🔄 Re-train with new data' : '🚀 Start Prediction'}
          </Button>
          {trained && accuracy !== null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="size-5 text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-400">{accuracy}% Prediction Accuracy</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {accuracy >= 90 ? 'Excellent — very reliable predictions' : accuracy >= 75 ? 'Good — predictions are fairly reliable' : 'Fair — use predictions as estimates'}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Training Progress */}
      <AnimatePresence>
        {training && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="p-5 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <BrainCircuit className="size-5 text-purple-600 dark:text-purple-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-900 dark:text-purple-300">AI is learning emission patterns…</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">This takes about 10 seconds</p>
                </div>
                <span className="text-lg font-black text-purple-700 dark:text-purple-400">{pct}%</span>
              </div>
              <div className="h-3 bg-purple-100 dark:bg-purple-900/40 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results: Predictions Chart */}
      {predictions.length > 0 && (
        <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Predicted Future Emissions</h3>
            </div>
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
              <Zap className="size-3 mr-1" /> 7-Year Forecast
            </Badge>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <HelpCircle className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Green area</strong> = real historical data. <strong>Purple dashed line</strong> = AI's prediction of future emissions. The closer the lines match on historical data, the more reliable the forecast.
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={predictions}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1e3).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`${Math.round(v).toLocaleString()} Mt CO₂`, '']} />
              <Legend />
              <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} fill="url(#actualGrad)" name="Historical (Real Data)" />
              <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fill="url(#predGrad)" name="AI Prediction" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top Countries */}
      {topCountries.length > 0 && (
        <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="size-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Biggest Emitters in Dataset</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topCountries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1e3).toFixed(0)}K Mt`} />
              <YAxis type="category" dataKey="country" stroke="#9ca3af" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: number) => [`${Math.round(v).toLocaleString()} Mt CO₂`, 'Total']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="co2" radius={[0, 6, 6, 0]} name="Total CO₂ (Mt)">
                {topCountries.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* How it works — simple */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-800">
        <h3 className="font-bold text-lg text-purple-900 dark:text-purple-300 mb-4">How Does This Work?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Download, step: '1', title: 'Real Data', desc: 'We fetch real CO₂ emissions data from Our World in Data — the same source used by the UN and researchers.' },
            { icon: BrainCircuit, step: '2', title: 'AI Learns', desc: 'The AI studies decades of emission patterns directly in your browser — your data never leaves your device.' },
            { icon: TrendingUp, step: '3', title: 'Predicts Future', desc: 'Based on learned patterns, the AI forecasts emissions 7 years into the future to help plan strategies.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400">{step}</span>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{title}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-purple-600 dark:text-purple-400">
            <strong>Data Source:</strong> {dataSource || 'Our World in Data'} • <strong>Privacy:</strong> All AI training happens in your browser — no data is sent to external servers.
          </p>
        </div>
      </Card>
    </div>
  );
}
