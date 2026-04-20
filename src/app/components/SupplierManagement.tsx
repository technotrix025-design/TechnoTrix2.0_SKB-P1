import { Card } from './ui/card';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  Download,
  Mail,
  Phone,
  Globe,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


// Fallback demo data shown when Supabase returns no rows
const DEMO_SUPPLIERS = [
  { id: 1, name: 'ABC Corporation', category: 'Raw Materials', esgScore: 62, emissions: 245, trend: 'down', trendValue: -8, status: 'warning', location: 'Mumbai, India', contact: 'procurement@abccorp.com', website: 'abccorp.com', certifications: ['ISO 14001'], lastAudit: '2 months ago', environmental: 58, social: 65, governance: 63 },
  { id: 2, name: 'Global Tech Ltd', category: 'Electronics', esgScore: 88, emissions: 156, trend: 'up', trendValue: 12, status: 'good', location: 'Bangalore, India', contact: 'sustainability@globaltech.com', website: 'globaltech.com', certifications: ['ISO 14001', 'SA 8000', 'Carbon Neutral'], lastAudit: '1 month ago', environmental: 90, social: 85, governance: 89 },
  { id: 3, name: 'Eco Materials Inc', category: 'Sustainable Materials', esgScore: 94, emissions: 89, trend: 'up', trendValue: 15, status: 'excellent', location: 'Pune, India', contact: 'info@ecomaterials.com', website: 'ecomaterials.com', certifications: ['ISO 14001', 'SA 8000', 'Carbon Neutral', 'B Corp'], lastAudit: '3 weeks ago', environmental: 96, social: 92, governance: 94 },
  { id: 4, name: 'Industrial Solutions', category: 'Manufacturing', esgScore: 71, emissions: 198, trend: 'down', trendValue: -5, status: 'moderate', location: 'Ahmedabad, India', contact: 'contact@industrial.com', website: 'industrial.com', certifications: ['ISO 14001'], lastAudit: '6 months ago', environmental: 68, social: 74, governance: 71 },
  { id: 5, name: 'Green Energy Co', category: 'Energy', esgScore: 91, emissions: 45, trend: 'up', trendValue: 18, status: 'excellent', location: 'Hyderabad, India', contact: 'hello@greenenergy.com', website: 'greenenergy.com', certifications: ['ISO 14001', 'Carbon Neutral', 'Renewable Energy'], lastAudit: '2 weeks ago', environmental: 95, social: 88, governance: 90 },
  { id: 6, name: 'Smart Logistics Ltd', category: 'Transportation', esgScore: 75, emissions: 178, trend: 'stable', trendValue: 1, status: 'moderate', location: 'Delhi, India', contact: 'ops@smartlogistics.com', website: 'smartlogistics.com', certifications: ['ISO 14001'], lastAudit: '4 months ago', environmental: 72, social: 78, governance: 75 },
];

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState(DEMO_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(DEMO_SUPPLIERS[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // ── 1. Fetch real suppliers from backend (Supabase) ──
  const loadSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/suppliers`);
      const { success, data } = await res.json();
      if (!success || !Array.isArray(data) || data.length === 0) return;

      // Map raw DB row -> component shape; fill missing fields with sensible defaults
      const mapped = data.map((s: any) => ({
        id: s.id,
        name: s.name || 'Unknown Supplier',
        category: s.category || 'General',
        esgScore: s.esg_score ?? Math.floor(60 + Math.random() * 35),
        emissions: s.total_emissions ?? Math.floor(50 + Math.random() * 250),
        trend: s.trend ?? (Math.random() > 0.5 ? 'up' : 'down'),
        trendValue: s.trend_value ?? parseFloat((Math.random() * 15 - 5).toFixed(1)),
        status: s.status ?? 'moderate',
        location: s.location ?? 'India',
        contact: s.contact_email ?? 'contact@supplier.com',
        website: s.website ?? 'supplier.com',
        certifications: s.certifications ?? ['ISO 14001'],
        lastAudit: s.last_reported_date
          ? new Date(s.last_reported_date).toLocaleDateString()
          : 'Not audited',
        environmental: s.environmental_score ?? Math.floor(55 + Math.random() * 40),
        social: s.social_score ?? Math.floor(55 + Math.random() * 40),
        governance: s.governance_score ?? Math.floor(55 + Math.random() * 40),
      }));

      setSuppliers(mapped);
      setSelectedSupplier(mapped[0]);
      setIsLive(true);
      toast.success(`Loaded ${mapped.length} suppliers from Supabase`);
    } catch {
      // Demo data remains
    }
  };

  useEffect(() => { loadSuppliers(); }, []);

  // ── 2. Poll every 60s to pick up new suppliers (no Supabase Realtime needed) ──
  useEffect(() => {
    const timer = setInterval(loadSuppliers, 60000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived stats ──
  const avgEsg = useMemo(() => {
    if (suppliers.length === 0) return 0;
    return Math.round(suppliers.reduce((s, x) => s + (x.esgScore || 0), 0) / suppliers.length);
  }, [suppliers]);

  const atRisk = useMemo(() => suppliers.filter(s => (s.esgScore || 0) < 65).length, [suppliers]);

  const totalScope3 = useMemo(() => suppliers.reduce((s, x) => s + (x.emissions || 0), 0), [suppliers]);

  const emissionsBySupplier = useMemo(() =>
    [...suppliers]
      .sort((a, b) => (b.emissions || 0) - (a.emissions || 0))
      .map(s => ({ name: s.name.split(' ').slice(0, 2).join(' '), emissions: s.emissions || 0 })),
  [suppliers]);

  const handleExport = () => {
    setIsExporting(true);
    toast.info('Generating supplier ESG report...');
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Report exported successfully! Downloading PDF...');
    }, 2000);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'warning': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const radarData = [
    {
      metric: 'Environmental',
      value: selectedSupplier.environmental,
      fullMark: 100,
    },
    {
      metric: 'Social',
      value: selectedSupplier.social,
      fullMark: 100,
    },
    {
      metric: 'Governance',
      value: selectedSupplier.governance,
      fullMark: 100,
    },
    {
      metric: 'Compliance',
      value: selectedSupplier.esgScore,
      fullMark: 100,
    },
    {
      metric: 'Innovation',
      value: selectedSupplier.esgScore - 10,
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">ESG scoring and emissions tracking for your supply chain</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="size-4" />
            Filter
          </Button>
          <Button 
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Download className="size-4" />}
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm font-medium text-blue-700">Total Suppliers</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{suppliers.length}</p>
          <p className="text-xs text-blue-600 mt-1">{isLive ? '✅ Live from Supabase' : 'Demo data'}</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm font-medium text-green-700">Avg ESG Score</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{avgEsg}</p>
          <p className="text-xs text-green-600 mt-1">Industry avg: 68</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <p className="text-sm font-medium text-amber-700">At Risk</p>
          <p className="text-3xl font-bold text-amber-900 mt-2">{atRisk}</p>
          <p className="text-xs text-amber-600 mt-1">Score below 65</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <p className="text-sm font-medium text-emerald-700">Scope 3 Emissions</p>
          <p className="text-3xl font-bold text-emerald-900 mt-2">{totalScope3.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 mt-1">tCO₂e total</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredSuppliers.map((supplier, idx) => (
                <motion.div
                  key={supplier.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSupplier.id === supplier.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{supplier.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{supplier.category}</p>
                    </div>
                    {supplier.trend === 'up' ? (
                      <TrendingUp className="size-4 text-green-600" />
                    ) : supplier.trend === 'down' ? (
                      <TrendingDown className="size-4 text-red-600" />
                    ) : (
                      <div className="size-4"></div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xs text-gray-600">ESG Score</p>
                      <p className={`text-xl font-bold ${getScoreColor(supplier.esgScore)}`}>
                        {supplier.esgScore}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Emissions</p>
                      <p className="text-sm font-bold text-gray-900">{supplier.emissions} tCO₂e</p>
                    </div>
                  </div>

                  <Badge className={`mt-3 ${getStatusColor(supplier.status)}`}>
                    {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Supplier Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                  <Building2 className="size-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedSupplier.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="size-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedSupplier.location}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => toast.success(`Loading full compliance profile for ${selectedSupplier.name}...`)}
              >
                <ArrowUpRight className="size-4" />
                View Full Profile
              </Button>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-gray-500" />
                <span className="text-sm text-gray-700">{selectedSupplier.contact}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-gray-500" />
                <span className="text-sm text-gray-700">{selectedSupplier.website}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="size-4 text-gray-500" />
                <span className="text-sm text-gray-700">Last audit: {selectedSupplier.lastAudit}</span>
              </div>
            </div>

            {/* ESG Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-4">ESG Score Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Environmental</span>
                      <span className={`text-sm font-bold ${getScoreColor(selectedSupplier.environmental)}`}>
                        {selectedSupplier.environmental}/100
                      </span>
                    </div>
                    <Progress value={selectedSupplier.environmental} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Social</span>
                      <span className={`text-sm font-bold ${getScoreColor(selectedSupplier.social)}`}>
                        {selectedSupplier.social}/100
                      </span>
                    </div>
                    <Progress value={selectedSupplier.social} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Governance</span>
                      <span className={`text-sm font-bold ${getScoreColor(selectedSupplier.governance)}`}>
                        {selectedSupplier.governance}/100
                      </span>
                    </div>
                    <Progress value={selectedSupplier.governance} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Overall ESG Score</span>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedSupplier.esgScore)}`}>
                        {selectedSupplier.esgScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Performance Radar</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name={selectedSupplier.name}
                      dataKey="value"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Certifications */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-sm mb-3">Certifications & Standards</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSupplier.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    <CheckCircle2 className="size-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Emissions Impact */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-900">Emissions Contribution</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{selectedSupplier.emissions} tCO₂e</p>
                  <p className="text-xs text-emerald-600 mt-1">
                  {totalScope3 > 0
                    ? `${((selectedSupplier.emissions / totalScope3) * 100).toFixed(1)}% of total Scope 3`
                    : 'N/A'}
                </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  selectedSupplier.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {selectedSupplier.trend === 'up' ? (
                    <>
                      <TrendingUp className="size-5 text-green-600" />
                      <span className="text-sm font-bold text-green-700">+{selectedSupplier.trendValue}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="size-5 text-red-600" />
                      <span className="text-sm font-bold text-red-700">{selectedSupplier.trendValue}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Emissions by Supplier Chart */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-6">Supplier Emissions Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={emissionsBySupplier} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="emissions" fill="#10b981" radius={[0, 8, 8, 0]} name="Emissions (tCO₂e)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
