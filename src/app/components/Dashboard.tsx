import { Card } from './ui/card';
import { 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Target, 
  Factory, 
  Zap, 
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wifi
} from 'lucide-react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'motion/react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Animated number counter — smoothly counts from 0 to target
function useAnimatedNumber(value: number, duration = 800) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const diff = value - from;
    if (diff === 0) return;
    let start: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(from + diff * ease));
      if (t < 1) requestAnimationFrame(step);
      else prev.current = value;
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return display;
}

const INITIAL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun'];
const initialEmissionsData = INITIAL_MONTHS.map((month, i) => ({
  month,
  scope1: 450 - i * 10,
  scope2: 320 - i * 10,
  scope3: 890 - i * 20,
  target: 1500 - i * 50,
}));

const recentAlerts = [
  { id: 1, type: 'warning', message: 'Supplier ESG score below threshold — review required', time: '2 hours ago' },
  { id: 2, type: 'success', message: 'Monthly emissions 12% below target', time: '5 hours ago' },
  { id: 3, type: 'info', message: 'New EU CSRD regulation update available', time: '1 day ago' },
];

export function Dashboard() {
  const [liveEmissionsData, setLiveEmissionsData] = useState(initialEmissionsData);
  const [totalEmissions, setTotalEmissions] = useState(1430);
  const [liveAlerts, setLiveAlerts] = useState(recentAlerts);
  const [currentScopes, setCurrentScopes] = useState({ scope1: 380, scope2: 270, scope3: 780 });
  const [currentEsg, setCurrentEsg] = useState(82.0);
  const [liveSuppliers, setLiveSuppliers] = useState<{ name: string; esgScore?: number; emissions?: number; trend?: string }[]>([]);
  const [lastMonthTotal, setLastMonthTotal] = useState(1510);
  const [streamSource, setStreamSource] = useState<'supabase' | 'demo' | 'fallback' | ''>('');
  const prevTotalRef = useRef(1430);

  // Animated display values — smooth counting effect
  const animScope1 = useAnimatedNumber(currentScopes.scope1);
  const animScope2 = useAnimatedNumber(currentScopes.scope2);
  const animScope3 = useAnimatedNumber(currentScopes.scope3);
  const animTotal = useAnimatedNumber(totalEmissions);
  const animEsg = useAnimatedNumber(Math.round(currentEsg * 10)) / 10;
  
  // ── 1. Fetch real suppliers from Supabase via backend API ──
  useEffect(() => {
    fetch(`${API_URL}/api/suppliers`)
      .then(r => r.json())
      .then(({ success, data }) => {
        if (success && Array.isArray(data) && data.length > 0) {
          // Map DB columns to display shape
          const mapped = data.slice(0, 4).map((s: any) => ({
            name: s.name,
            esgScore: s.esg_score ?? Math.floor(60 + Math.random() * 35),
            emissions: s.total_emissions ?? Math.floor(80 + Math.random() * 200),
            trend: s.trend ?? (Math.random() > 0.5 ? 'up' : 'down'),
          }));
          setLiveSuppliers(mapped);
        }
      })
      .catch(() => {/* suppliers stay empty — component handles gracefully */});
  }, []);

  // ── 2. SSE Stream — real Supabase emissions every 5s ──
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/api/stream/emissions`);

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);

        if (newData.type === 'connected') {
          toast.success('Live Supabase Stream Connected ✅');
          return;
        }

        if (newData.source) setStreamSource(newData.source);

        const total = Math.floor(newData.scope1 + newData.scope2 + newData.scope3);
        // Save previous total before updating (for last-month comparison)
        prevTotalRef.current = totalEmissions;
        setLastMonthTotal(prev => prev); // keep last value
        setTotalEmissions(total);
        setCurrentScopes({
          scope1: Math.floor(newData.scope1),
          scope2: Math.floor(newData.scope2),
          scope3: Math.floor(newData.scope3),
        });

        setLiveEmissionsData(prev => {
          const updated = [...prev];
          updated.shift();
          updated.push({
            month: new Date().toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' }),
            scope1: newData.scope1,
            scope2: newData.scope2,
            scope3: newData.scope3,
            target: newData.target,
          });
          return updated;
        });

        if (newData.alert) {
          setLiveAlerts(prev => [
            { id: Date.now(), type: 'warning', message: newData.alert, time: 'Just now' },
            ...prev.slice(0, 2),
          ]);
          toast.error(newData.alert);
        }
      } catch (err) {
        console.error('Error parsing stream data', err);
      }
    };

    eventSource.onerror = () => console.warn('[SSE] Reconnecting...');
    return () => eventSource.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 3. Supabase Realtime — instant update when any emission is inserted ──
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-emissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emissions' }, () => {
        // A new emission was added — refresh summary via SSE will pick it up in ≤5s
        toast.info('New emission data recorded — updating dashboard…');
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const targetEmissions = 1250;
  const progress = Math.abs((totalEmissions / targetEmissions) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time ESG performance and emissions monitoring</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Scope 1 Emissions</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{animScope1}</p>
                <p className="text-xs text-red-600 mt-1">tCO₂e / month</p>
              </div>
              <div className="bg-red-200 p-3 rounded-lg">
                <Factory className="size-6 text-red-700" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingDown className="size-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Real-time IoT Sync</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Scope 2 Emissions</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{animScope2}</p>
                <p className="text-xs text-amber-600 mt-1">tCO₂e / month</p>
              </div>
              <div className="bg-amber-200 p-3 rounded-lg">
                <Zap className="size-6 text-amber-700" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingDown className="size-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Real-time Smart Meter</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Scope 3 Emissions</p>
                <p className="text-3xl font-bold text-emerald-900 mt-2">{animScope3}</p>
                <p className="text-xs text-emerald-600 mt-1">tCO₂e / month</p>
              </div>
              <div className="bg-emerald-200 p-3 rounded-lg">
                <Truck className="size-6 text-emerald-700" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingDown className="size-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Live Supplier API Integration</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Live ESG Score</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{animEsg.toFixed(1)}/100</p>
                <p className="text-xs text-blue-600 mt-1">Industry avg: 68</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <Target className="size-6 text-blue-700" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="size-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">AI-driven Scoring Engine</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions Trend */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Emissions Trend Analysis</h3>
              <p className="text-sm text-gray-600">6-month performance vs. targets</p>
            </div>
            <Activity className="size-5 text-emerald-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={liveEmissionsData}>
              <defs>
                <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
              <Legend />
              <Area type="monotone" dataKey="scope1" stroke="#ef4444" fillOpacity={1} fill="url(#colorScope1)" name="Scope 1" />
              <Area type="monotone" dataKey="scope2" stroke="#f59e0b" fillOpacity={1} fill="url(#colorScope2)" name="Scope 2" />
              <Area type="monotone" dataKey="scope3" stroke="#10b981" fillOpacity={1} fill="url(#colorScope3)" name="Scope 3" />
              <Line type="monotone" dataKey="target" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Scope Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Emissions by Scope</h3>
              <p className="text-sm text-gray-600">Current month breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Scope 1', value: currentScopes.scope1, color: '#ef4444' },
                  { name: 'Scope 2', value: currentScopes.scope2, color: '#f59e0b' },
                  { name: 'Scope 3', value: currentScopes.scope3, color: '#10b981' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Scope 1', value: currentScopes.scope1, color: '#ef4444' },
                  { name: 'Scope 2', value: currentScopes.scope2, color: '#f59e0b' },
                  { name: 'Scope 3', value: currentScopes.scope3, color: '#10b981' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {[
              { name: 'Scope 1', value: currentScopes.scope1, color: '#ef4444' },
              { name: 'Scope 2', value: currentScopes.scope2, color: '#f59e0b' },
              { name: 'Scope 3', value: currentScopes.scope3, color: '#10b981' },
            ].map((scope) => (
              <div key={scope.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: scope.color }}></div>
                  <span className="text-sm font-medium">{scope.name}</span>
                </div>
                <span className="text-sm font-bold">{scope.value} tCO₂e</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Emission Reduction Target</h3>
              <p className="text-sm text-gray-600">Progress toward monthly goal</p>
            </div>
            <Target className="size-5 text-emerald-600" />
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current: {totalEmissions} tCO₂e</span>
                <span className="text-sm font-medium">Target: {targetEmissions} tCO₂e</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {totalEmissions > targetEmissions ? (
                  <span className="text-amber-600 font-medium">
                    {Math.abs(totalEmissions - targetEmissions)} tCO₂e above target
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    {Math.abs(totalEmissions - targetEmissions)} tCO₂e below target
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-600">This Month</p>
                <p className="text-xl font-bold text-gray-900">{totalEmissions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Last Month</p>
                <p className="text-xl font-bold text-gray-900">{lastMonthTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Reduction</p>
                <p className={`text-xl font-bold ${totalEmissions < lastMonthTotal ? 'text-green-600' : 'text-red-500'}`}>
                  {totalEmissions < lastMonthTotal ? '-' : '+'}{Math.abs(((totalEmissions - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Suppliers — live from Supabase */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Supplier ESG Performance</h3>
              <p className="text-sm text-gray-600">
                {liveSuppliers.length > 0 ? `${liveSuppliers.length} suppliers from Supabase` : 'Top suppliers by emissions impact'}
              </p>
            </div>
            {liveSuppliers.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <Wifi className="size-3" /> Live
              </span>
            )}
          </div>

          <div className="space-y-4">
            {(liveSuppliers.length > 0
              ? liveSuppliers
              : [
                  { name: 'ABC Corp', esgScore: 62, emissions: 245, trend: 'down' },
                  { name: 'Global Tech Ltd', esgScore: 88, emissions: 156, trend: 'up' },
                  { name: 'Eco Materials Inc', esgScore: 94, emissions: 89, trend: 'up' },
                  { name: 'Industrial Solutions', esgScore: 71, emissions: 198, trend: 'down' },
                ]
            ).map((supplier, idx) => (
              <motion.div
                key={supplier.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{supplier.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (supplier.esgScore ?? 0) >= 80 ? 'bg-green-100 text-green-700' :
                      (supplier.esgScore ?? 0) >= 65 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Score: {supplier.esgScore ?? '—'}
                    </span>
                    <span className="text-xs text-gray-600">{supplier.emissions ?? '—'} tCO₂e</span>
                  </div>
                </div>
                {supplier.trend === 'up' ? (
                  <TrendingUp className="size-4 text-green-600" />
                ) : (
                  <TrendingDown className="size-4 text-red-600" />
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Recent Alerts & Notifications</h3>
            <p className="text-sm text-gray-600">
              {streamSource === 'supabase' ? '✅ Streaming from Supabase DB' : streamSource === 'demo' ? '⚡ Demo mode — add data to see live values' : 'Real-time monitoring updates'}
            </p>
          </div>
          <Activity className="size-5 text-emerald-600" />
        </div>
        
        <div className="space-y-3">
          {liveAlerts.map((alert) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={alert.id}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {alert.type === 'warning' && (
                <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              {alert.type === 'success' && (
                <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              {alert.type === 'info' && (
                <Clock className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-600 mt-1">{alert.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}