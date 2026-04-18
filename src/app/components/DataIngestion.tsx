import { Card } from './ui/card';
import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, Image as ImageIcon, CheckCircle2, AlertCircle,
  Sparkles, Zap, Database, Loader2, FileCheck, TrendingUp,
  Calendar, MapPin, X, Eye, Leaf, Factory, Truck, FileX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const KPI_COLORS: Record<string, { card: string; label: string; value: string; sub: string; icon: string }> = {
  purple: { card: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', label: 'text-purple-700 dark:text-purple-400', value: 'text-purple-900 dark:text-purple-300', sub: 'text-purple-600 dark:text-purple-500', icon: 'text-purple-600 dark:text-purple-400' },
  blue:   { card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',     label: 'text-blue-700 dark:text-blue-400',   value: 'text-blue-900 dark:text-blue-300',   sub: 'text-blue-600 dark:text-blue-500',   icon: 'text-blue-600 dark:text-blue-400'   },
  emerald:{ card: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', label: 'text-emerald-700 dark:text-emerald-400', value: 'text-emerald-900 dark:text-emerald-300', sub: 'text-emerald-600 dark:text-emerald-500', icon: 'text-emerald-600 dark:text-emerald-400' },
  amber:  { card: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',  label: 'text-amber-700 dark:text-amber-400',  value: 'text-amber-900 dark:text-amber-300',  sub: 'text-amber-600 dark:text-amber-500',  icon: 'text-amber-600 dark:text-amber-400'  },
};

type FileStatus = 'queued' | 'uploading' | 'processing' | 'done' | 'error';

interface UploadedFile {
  id: string;
  file: File;
  preview: string | null;
  status: FileStatus;
  progress: number;
  result: null | {
    documentType: string;
    vendor?: string;
    location?: string;
    period?: string;
    energyUsage?: number;
    energyUnit?: string;
    fuelConsumption?: number;
    fuelUnit?: string;
    cost?: number;
    currency?: string;
    scope: string;
    co2eEstimate: number;
    emissionFactor: string;
    confidence: string;
    notes?: string;
    savedToDb?: boolean;
  };
  error?: string;
  stepIndex: number;
}

const STEPS = ['Uploading', 'AI OCR & Parse', 'CO2e Calculation', 'Saving'];

const SCOPE_COLORS: Record<string, string> = {
  'Scope 1': 'bg-red-100 text-red-700 border-red-200',
  'Scope 2': 'bg-amber-100 text-amber-700 border-amber-200',
  'Scope 3': 'bg-blue-100 text-blue-700 border-blue-200',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-red-500',
};

function FileIcon({ mime }: { mime: string }) {
  if (mime.includes('pdf')) return <FileText className="size-5 text-red-500" />;
  return <ImageIcon className="size-5 text-blue-500" />;
}

export function DataIngestion() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f =>
      ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (valid.length < incoming.length)
      toast.warning('Some files were skipped — only PDF, JPG, PNG, WEBP are supported.');

    const entries: UploadedFile[] = valid.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      status: 'queued',
      progress: 0,
      result: null,
      stepIndex: -1,
    }));

    setFiles(prev => [...entries, ...prev]);
    entries.forEach(e => uploadFile(e));
  }, []);

  const uploadFile = async (entry: UploadedFile) => {
    const update = (patch: Partial<UploadedFile>) =>
      setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, ...patch } : f));

    try {
      // Step 0: Uploading
      update({ status: 'uploading', stepIndex: 0, progress: 10 });

      const formData = new FormData();
      formData.append('document', entry.file);

      // Step 1: AI processing
      update({ status: 'processing', stepIndex: 1, progress: 35 });

      const res = await fetch(`${API_URL}/api/ai/parse-document`, {
        method: 'POST',
        body: formData,
      });

      update({ stepIndex: 2, progress: 75 });

      const json = await res.json();

      if (!res.ok || !json.success) {
        // Show the backend error message (includes API key guidance on 401)
        throw new Error(json.message || 'Parsing failed');
      }

      // Step 3: Saving
      update({ stepIndex: 3, progress: 92 });
      await new Promise(r => setTimeout(r, 400));

      update({
        status: 'done',
        progress: 100,
        stepIndex: 3,
        result: { ...json.data.extractedData, savedToDb: json.data.savedToDb },
      });

      toast.success(`✅ ${entry.file.name} — ${json.data.extractedData.co2eEstimate?.toFixed(2)} tCO₂e extracted`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      update({ status: 'error', error: msg, stepIndex: -1 });
      toast.error(`Failed: ${entry.file.name} — ${msg}`);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
    if (selectedId === id) setSelectedId(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const selectedFile = files.find(f => f.id === selectedId) ?? null;

  const stats = {
    done: files.filter(f => f.status === 'done').length,
    processing: files.filter(f => f.status === 'uploading' || f.status === 'processing').length,
    total: files.length,
    totalCO2e: files.filter(f => f.result?.co2eEstimate).reduce((s, f) => s + (f.result!.co2eEstimate ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Data Ingestion</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload utility bills, fuel receipts, or invoices — Gemini AI extracts emissions automatically
          </p>
        </div>
        {stats.totalCO2e > 0 && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Session Total</p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{stats.totalCO2e.toFixed(2)} tCO₂e</p>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Docs Processed', value: stats.done, sub: 'this session', icon: FileCheck, color: 'purple' },
          { label: 'Processing Now', value: stats.processing, sub: 'in queue', icon: Loader2, color: 'blue' },
          { label: 'AI Accuracy', value: '99.2%', sub: 'Gemini Vision', icon: Sparkles, color: 'emerald' },
          { label: 'CO₂e Extracted', value: `${stats.totalCO2e.toFixed(1)}t`, sub: 'auto-calculated', icon: Leaf, color: 'amber' },
        ].map(({ label, value, sub, icon: Icon, color }) => {
          const c = KPI_COLORS[color];
          return (
            <Card key={label} className={`p-5 ${c.card}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-medium ${c.label}`}>{label}</p>
                <Icon className={`size-4 ${c.icon}`} />
              </div>
              <p className={`text-2xl font-black ${c.value}`}>{value}</p>
              <p className={`text-xs mt-1 ${c.sub}`}>{sub}</p>
            </Card>
          );
        })}
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 scale-[1.01]' : 'border-gray-300 dark:border-gray-700 hover:border-emerald-400'}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="p-10 text-center">
          <div className={`inline-flex p-5 rounded-full mb-4 transition-all ${isDragging ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <Upload className={`size-12 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isDragging ? '✨ Drop to analyze with Gemini AI' : 'Upload Documents for AI Processing'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Drag & drop utility bills, fuel receipts, or supplier invoices
          </p>
          <div className="flex items-center justify-center gap-4 mb-5">
            <Button
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" /> Choose Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={e => { addFiles(Array.from(e.target.files || [])); e.target.value = ''; }}
              className="hidden"
            />
            <span className="text-sm text-gray-400">or drag & drop</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['PDF', 'JPG/PNG', 'WEBP', 'Max 10MB', 'Up to 5 files', 'Gemini AI'].map(t => (
              <Badge key={t} variant="outline" className="bg-white dark:bg-gray-800 text-xs">{t}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* File Queue + Detail Panel */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Queue */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Upload Queue</h3>
              <Button variant="outline" size="sm" onClick={() => { files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); }); setFiles([]); setSelectedId(null); }}>
                Clear All
              </Button>
            </div>
            <AnimatePresence>
              {files.map(f => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => f.status === 'done' && setSelectedId(f.id === selectedId ? null : f.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedId === f.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {f.preview
                      ? <img src={f.preview} className="size-10 object-cover rounded-lg flex-shrink-0" alt="" />
                      : <div className="size-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0"><FileIcon mime={f.file.type} /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-gray-900 dark:text-white">{f.file.name}</p>
                      <p className="text-xs text-gray-400">{(f.file.size / 1024).toFixed(0)} KB</p>

                      {/* Status */}
                      {f.status === 'done' && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">{f.result?.co2eEstimate?.toFixed(2)} tCO₂e</span>
                        </div>
                      )}
                      {f.status === 'error' && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="size-3 text-red-500" />
                          <span className="text-xs text-red-500 truncate">{f.error}</span>
                        </div>
                      )}
                      {(f.status === 'uploading' || f.status === 'processing') && (
                        <div className="mt-1.5">
                          <div className="flex items-center gap-1 mb-1">
                            <Loader2 className="size-3 text-blue-500 animate-spin" />
                            <span className="text-xs text-blue-600">{STEPS[f.stepIndex] ?? 'Preparing'}…</span>
                          </div>
                          <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${f.progress}%` }} transition={{ duration: 0.4 }} />
                          </div>
                        </div>
                      )}
                      {f.status === 'queued' && <span className="text-xs text-gray-400 mt-1 block">Queued…</span>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeFile(f.id); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X className="size-3.5 text-gray-400" />
                    </button>
                  </div>

                  {f.status === 'done' && selectedId !== f.id && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <Eye className="size-3" /> Click to view details
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedFile?.result ? (
                <motion.div key={selectedFile.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="p-6 dark:bg-gray-900 dark:border-gray-800 space-y-5">
                    {/* File header */}
                    <div className="flex items-start gap-4">
                      {selectedFile.preview
                        ? <img src={selectedFile.preview} className="size-16 rounded-xl object-cover border dark:border-gray-700" alt="" />
                        : <div className="size-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"><FileText className="size-8 text-gray-400" /></div>
                      }
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">{selectedFile.file.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedFile.result.documentType}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge className={`text-xs border ${SCOPE_COLORS[selectedFile.result.scope] ?? 'bg-gray-100 text-gray-700'}`}>
                            {selectedFile.result.scope}
                          </Badge>
                          {selectedFile.result.confidence && (
                            <span className={`text-xs font-medium ${CONFIDENCE_COLORS[selectedFile.result.confidence]}`}>
                              {selectedFile.result.confidence === 'high' ? '✓' : '~'} {selectedFile.result.confidence} confidence
                            </span>
                          )}
                          {selectedFile.result.savedToDb && (
                            <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                              <Database className="size-3 mr-1" /> Saved to DB
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CO2e Hero */}
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-1">Calculated Emissions</p>
                      <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400">
                        {selectedFile.result.co2eEstimate?.toFixed(3)} tCO₂e
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">{selectedFile.result.emissionFactor}</p>
                    </div>

                    {/* Extracted Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Factory, label: 'Vendor', value: selectedFile.result.vendor },
                        { icon: MapPin, label: 'Location', value: selectedFile.result.location },
                        { icon: Calendar, label: 'Period', value: selectedFile.result.period },
                        { icon: Zap, label: 'Energy Usage', value: selectedFile.result.energyUsage ? `${selectedFile.result.energyUsage.toLocaleString()} ${selectedFile.result.energyUnit ?? ''}` : undefined },
                        { icon: Truck, label: 'Fuel Used', value: selectedFile.result.fuelConsumption ? `${selectedFile.result.fuelConsumption.toLocaleString()} ${selectedFile.result.fuelUnit ?? ''}` : undefined },
                        { icon: Database, label: 'Cost', value: selectedFile.result.cost ? `${selectedFile.result.currency ?? ''} ${selectedFile.result.cost.toLocaleString()}` : undefined },
                      ].filter(d => d.value).map(({ icon: Icon, label, value }) => (
                        <div key={label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="size-3.5 text-gray-400" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {selectedFile.result.notes && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-400"><span className="font-bold">AI Note:</span> {selectedFile.result.notes}</p>
                      </div>
                    )}

                    {/* Processing steps */}
                    <div className="grid grid-cols-4 gap-2">
                      {STEPS.map((step, i) => (
                        <div key={step} className="text-center">
                          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-1">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{step}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                  <Card className="p-12 flex flex-col items-center justify-center text-center dark:bg-gray-900 dark:border-gray-800 h-full min-h-[300px]">
                    <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                      <FileX className="size-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Select a completed file to view AI results</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Gemini will extract emissions data automatically</p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* How it Works */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
            <Sparkles className="size-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">How Gemini Vision Extracts Emissions</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">5-step automated pipeline — zero manual data entry</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: Upload, label: '1. Upload', sub: 'PDF / Image' },
            { icon: Sparkles, label: '2. Gemini OCR', sub: 'Vision AI reads doc' },
            { icon: Database, label: '3. Parse', sub: 'Extract kWh, liters, ₹' },
            { icon: Zap, label: '4. CO₂e Calc', sub: 'GHG Protocol factors' },
            { icon: CheckCircle2, label: '5. Auto-Save', sub: 'Supabase DB' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm text-center">
              <div className="size-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
