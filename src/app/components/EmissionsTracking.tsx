import { Card } from './ui/card';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Factory, 
  Zap, 
  Truck, 
  TrendingDown, 
  TrendingUp,
  Download,
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const monthlyData = [
  { month: 'Jan', scope1: 450, scope2: 320, scope3: 890, total: 1660 },
  { month: 'Feb', scope1: 430, scope2: 310, scope3: 870, total: 1610 },
  { month: 'Mar', scope1: 420, scope2: 300, scope3: 850, total: 1570 },
  { month: 'Apr', scope1: 400, scope2: 290, scope3: 820, total: 1510 },
  { month: 'May', scope1: 390, scope2: 280, scope3: 800, total: 1470 },
  { month: 'Jun', scope1: 380, scope2: 270, scope3: 780, total: 1430 },
];

const scope1Sources = [
  { source: 'Manufacturing Plants', emissions: 245, percentage: 64, trend: 'down', change: -3.2 },
  { source: 'Company Vehicles', emissions: 85, percentage: 22, trend: 'down', change: -5.1 },
  { source: 'On-site Generators', emissions: 50, percentage: 14, trend: 'up', change: 2.3 },
];

const scope2Sources = [
  { source: 'Purchased Electricity', emissions: 180, percentage: 67, trend: 'down', change: -4.5 },
  { source: 'Heating & Cooling', emissions: 60, percentage: 22, trend: 'down', change: -2.8 },
  { source: 'Steam Purchase', emissions: 30, percentage: 11, trend: 'stable', change: 0.5 },
];

const scope3Categories = [
  { category: 'Purchased Goods', emissions: 320, percentage: 41, trend: 'down', change: -3.1 },
  { category: 'Transportation & Distribution', emissions: 245, percentage: 31, trend: 'down', change: -4.2 },
  { category: 'Business Travel', emissions: 125, percentage: 16, trend: 'up', change: 1.8 },
  { category: 'Employee Commuting', emissions: 90, percentage: 12, trend: 'stable', change: -0.5 },
];

const dailyEmissions = [
  { day: 'Mon', emissions: 48, baseline: 55 },
  { day: 'Tue', emissions: 52, baseline: 55 },
  { day: 'Wed', emissions: 45, baseline: 55 },
  { day: 'Thu', emissions: 50, baseline: 55 },
  { day: 'Fri', emissions: 47, baseline: 55 },
  { day: 'Sat', emissions: 35, baseline: 40 },
  { day: 'Sun', emissions: 30, baseline: 40 },
];

export function EmissionsTracking() {
  const [activeScope, setActiveScope] = useState<'scope1' | 'scope2' | 'scope3'>('scope1');
  const [isExporting, setIsExporting] = useState(false);
  const [liveDailyEmissions, setLiveDailyEmissions] = useState(dailyEmissions);
  const [liveTotal, setLiveTotal] = useState(1430);
  const [liveScopes, setLiveScopes] = useState({ scope1: 380, scope2: 270, scope3: 780 });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${API_URL}/api/stream/emissions`);
    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        if (newData.type === 'connected') return;

        setLiveTotal(Math.floor(newData.scope1 + newData.scope2 + newData.scope3));
        setLiveScopes({
          scope1: Math.floor(newData.scope1),
          scope2: Math.floor(newData.scope2),
          scope3: Math.floor(newData.scope3)
        });

        // Simulate daily tracking updates
        setLiveDailyEmissions(prev => {
          const updated = [...prev];
          const todayIndex = updated.length - 1; // Assuming Sunday is current day
          updated[todayIndex] = {
            ...updated[todayIndex],
            emissions: Math.floor(newData.scope1 / 10 + Math.random() * 5)
          };
          return updated;
        });

      } catch (err) {}
    };
    return () => eventSource.close();
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    toast.info('Compiling emissions data for export...');
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Emissions data exported to CSV successfully!');
    }, 1500);
  };

  const renderSourceList = (sources: any[], icon: any) => {
    const Icon = icon;
    return (
      <div className="space-y-3">
        {sources.map((item, idx) => (
          <motion.div
            key={item.source || item.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Icon className="size-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.source || item.category}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.percentage}% of total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{item.emissions}</p>
                <p className="text-xs text-gray-600">tCO₂e</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                {item.trend === 'down' && <TrendingDown className="size-4 text-green-600" />}
                {item.trend === 'up' && <TrendingUp className="size-4 text-red-600" />}
                <span className={`text-xs font-medium ${
                  item.trend === 'down' ? 'text-green-600' : 
                  item.trend === 'up' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emissions Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and analyze greenhouse gas emissions across all scopes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Filter options opened')}>
            <Filter className="size-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Date picker opened')}>
            <Calendar className="size-4" />
            Date Range
          </Button>
          <Button 
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Download className="size-4" />}
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">Total Emissions</p>
            <AlertCircle className="size-4 text-slate-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{liveTotal}</p>
          <p className="text-xs text-slate-600 mt-1">tCO₂e this month</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
            <TrendingDown className="size-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Live Feed</span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-red-700">Scope 1</p>
            <Factory className="size-4 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">{liveScopes.scope1}</p>
          <p className="text-xs text-red-600 mt-1">Direct emissions</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-200">
            <TrendingDown className="size-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Live</span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-amber-700">Scope 2</p>
            <Zap className="size-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-900">{liveScopes.scope2}</p>
          <p className="text-xs text-amber-600 mt-1">Energy indirect</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-200">
            <TrendingDown className="size-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Live</span>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-emerald-700">Scope 3</p>
            <Truck className="size-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-900">{liveScopes.scope3}</p>
          <p className="text-xs text-emerald-600 mt-1">Value chain</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-200">
            <TrendingDown className="size-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Live</span>
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">6-Month Emissions Trend</h3>
            <p className="text-sm text-gray-600">All scopes combined analysis</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-red-50">Scope 1</Badge>
            <Badge variant="outline" className="bg-amber-50">Scope 2</Badge>
            <Badge variant="outline" className="bg-emerald-50">Scope 3</Badge>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={monthlyData}>
            <defs>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
            <Bar dataKey="scope1" stackId="a" fill="#ef4444" name="Scope 1" />
            <Bar dataKey="scope2" stackId="a" fill="#f59e0b" name="Scope 2" />
            <Bar dataKey="scope3" stackId="a" fill="#10b981" name="Scope 3" />
            <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#totalGradient)" name="Total" />
            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Trend" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Breakdown by Scope */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-6">Detailed Emissions Breakdown</h3>
        
        <Tabs value={activeScope} onValueChange={(v) => setActiveScope(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="scope1" className="gap-2">
              <Factory className="size-4" />
              Scope 1
            </TabsTrigger>
            <TabsTrigger value="scope2" className="gap-2">
              <Zap className="size-4" />
              Scope 2
            </TabsTrigger>
            <TabsTrigger value="scope3" className="gap-2">
              <Truck className="size-4" />
              Scope 3
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scope1" className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Direct Emissions (Scope 1)</h4>
              <p className="text-sm text-red-700">
                Emissions from sources owned or controlled by your organization, including on-site fuel combustion and company vehicles.
              </p>
            </div>
            {renderSourceList(scope1Sources, Factory)}
          </TabsContent>

          <TabsContent value="scope2" className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">Energy Indirect Emissions (Scope 2)</h4>
              <p className="text-sm text-amber-700">
                Emissions from purchased electricity, steam, heating, and cooling for own use.
              </p>
            </div>
            {renderSourceList(scope2Sources, Zap)}
          </TabsContent>

          <TabsContent value="scope3" className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">Value Chain Emissions (Scope 3)</h4>
              <p className="text-sm text-emerald-700">
                Indirect emissions from your value chain, including suppliers, transportation, and business travel. Typically 70-90% of total emissions.
              </p>
            </div>
            {renderSourceList(scope3Categories, Truck)}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Real-time Daily Tracking */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg">Real-time Daily Tracking</h3>
            <p className="text-sm text-gray-600">Current week emissions vs. baseline</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-700">Live Monitoring</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={liveDailyEmissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
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
            <Bar dataKey="baseline" fill="#e5e7eb" name="Baseline" radius={[8, 8, 0, 0]} />
            <Bar dataKey="emissions" fill="#10b981" name="Actual" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
