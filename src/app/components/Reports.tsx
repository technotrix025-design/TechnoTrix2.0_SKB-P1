import { Card } from './ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  Building2,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Send,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const reports = [
  {
    id: 1,
    name: 'Q2 2026 ESG Performance Report',
    type: 'ESG Summary',
    framework: 'GRI Standards',
    status: 'completed',
    date: '2026-06-15',
    size: '2.4 MB',
    pages: 45,
    completeness: 100,
    compliance: ['GRI', 'SASB', 'TCFD']
  },
  {
    id: 2,
    name: 'Annual GHG Emissions Inventory 2025',
    type: 'Carbon Report',
    framework: 'GHG Protocol',
    status: 'completed',
    date: '2026-01-10',
    size: '3.8 MB',
    pages: 67,
    completeness: 100,
    compliance: ['GHG Protocol', 'ISO 14064']
  },
  {
    id: 3,
    name: 'EU CSRD Compliance Report',
    type: 'Regulatory',
    framework: 'EU CSRD',
    status: 'in-progress',
    date: '2026-06-18',
    size: '1.9 MB',
    pages: 52,
    completeness: 78,
    compliance: ['EU CSRD', 'ESRS']
  },
  {
    id: 4,
    name: 'Supplier ESG Scorecard',
    type: 'Supply Chain',
    framework: 'Custom',
    status: 'completed',
    date: '2026-06-01',
    size: '0.8 MB',
    pages: 12,
    completeness: 100,
    compliance: ['Internal Standards']
  },
  {
    id: 5,
    name: 'India BRSR Filing 2025-26',
    type: 'Regulatory',
    framework: 'SEBI BRSR',
    status: 'pending',
    date: '2026-07-30',
    size: '0 MB',
    pages: 0,
    completeness: 35,
    compliance: ['BRSR', 'Companies Act 2013']
  },
  {
    id: 6,
    name: 'CDP Climate Disclosure',
    type: 'Investor',
    framework: 'CDP',
    status: 'in-progress',
    date: '2026-06-20',
    size: '1.2 MB',
    pages: 28,
    completeness: 65,
    compliance: ['CDP', 'SBTi']
  }
];

const complianceFrameworks = [
  {
    name: 'EU CSRD',
    description: 'Corporate Sustainability Reporting Directive',
    region: 'Europe',
    status: 'active',
    deadline: 'Ongoing',
    completion: 78
  },
  {
    name: 'GHG Protocol',
    description: 'Greenhouse Gas Accounting',
    region: 'Global',
    status: 'compliant',
    deadline: 'Annual',
    completion: 100
  },
  {
    name: 'India BRSR',
    description: 'Business Responsibility & Sustainability Reporting',
    region: 'India',
    status: 'in-progress',
    deadline: 'July 30, 2026',
    completion: 35
  },
  {
    name: 'SEC Climate',
    description: 'SEC Climate Disclosure Rules',
    region: 'United States',
    status: 'monitoring',
    deadline: 'TBD',
    completion: 0
  },
  {
    name: 'TCFD',
    description: 'Task Force on Climate-related Financial Disclosures',
    region: 'Global',
    status: 'compliant',
    deadline: 'Ongoing',
    completion: 100
  },
  {
    name: 'CDP',
    description: 'Carbon Disclosure Project',
    region: 'Global',
    status: 'in-progress',
    deadline: 'June 30, 2026',
    completion: 65
  }
];

export function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    toast.info('AI is compiling your latest ESG data...');
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Successfully generated comprehensive ESG report!');
    }, 2500);
  };

  const handleDownload = (id: number, name: string) => {
    setDownloadingId(id);
    toast.info(`Preparing ${name} for download...`);
    setTimeout(() => {
      setDownloadingId(null);
      toast.success(`${name} downloaded successfully!`);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="size-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="size-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <AlertTriangle className="size-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'active':
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'monitoring':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Compliance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate ESG reports and track regulatory compliance</p>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <FileText className="size-4" />}
          {isGenerating ? 'Generating...' : 'Generate New Report'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-green-700">Completed Reports</p>
            <CheckCircle2 className="size-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">3</p>
          <p className="text-xs text-green-600 mt-1">This quarter</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-700">In Progress</p>
            <Clock className="size-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">2</p>
          <p className="text-xs text-blue-600 mt-1">Active reports</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-amber-700">Pending</p>
            <AlertTriangle className="size-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-900">1</p>
          <p className="text-xs text-amber-600 mt-1">Awaiting data</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-purple-700">Compliance Rate</p>
            <Star className="size-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">93%</p>
          <p className="text-xs text-purple-600 mt-1">Above industry avg</p>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Generated Reports</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredReports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <FileText className="size-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-sm">{report.name}</h4>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {report.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" />
                        {report.framework}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      {report.size !== '0 MB' && (
                        <span>{report.pages} pages • {report.size}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={report.completeness} className="h-2 flex-1" />
                      <span className="text-xs font-medium text-gray-600 w-12">{report.completeness}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {report.compliance.map((comp) => (
                        <Badge key={comp} variant="outline" className="text-xs bg-white">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success(`Opening ${report.name}`)}>
                    <Eye className="size-4" />
                    View
                  </Button>
                  {report.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleDownload(report.id, report.name)}
                      disabled={downloadingId === report.id}
                    >
                      {downloadingId === report.id ? <div className="size-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" /> : <Download className="size-4" />}
                      {downloadingId === report.id ? 'Downloading...' : 'Download'}
                    </Button>
                  )}
                  {report.status === 'completed' && (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success(`${report.name} submitted successfully!`)}>
                      <Send className="size-4" />
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Compliance Frameworks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl">Regulatory Compliance Tracking</h3>
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
            6 frameworks monitored
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {complianceFrameworks.map((framework, idx) => (
            <motion.div
              key={framework.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-sm">{framework.name}</h4>
                      <Badge className={getComplianceStatusColor(framework.status)}>
                        {framework.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{framework.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" />
                        {framework.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {framework.deadline}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Completion</span>
                    <span className="text-xs font-bold text-gray-900">{framework.completion}%</span>
                  </div>
                  <Progress value={framework.completion} className="h-2" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Automated Report Generation */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <TrendingUp className="size-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-emerald-900 mb-2">Automated ESG Report Generation</h3>
            <p className="text-sm text-emerald-700 mb-4">
              Our AI-powered platform automatically compiles data from all connected sources to generate audit-ready reports compliant with global standards including GRI, SASB, TCFD, EU CSRD, and India BRSR.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600">Reports Generated</p>
                <p className="text-2xl font-bold text-emerald-600">24</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600">Avg. Time Saved</p>
                <p className="text-2xl font-bold text-emerald-600">87%</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-emerald-600">100%</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600">Audit Pass Rate</p>
                <p className="text-2xl font-bold text-emerald-600">98%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
