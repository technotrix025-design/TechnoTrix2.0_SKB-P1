import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { supabase } from './utils/supabase.js';

// Route Imports
import emissionsRoutes from './routes/emissions.js';
import aiRoutes from './routes/ai.js';
import suppliersRoutes from './routes/suppliers.js';
import streamRoutes from './routes/stream.js';
import kaggleRoutes from './routes/kaggle.js';

// Middleware Imports
import { generalLimiter, aiLimiter, streamLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const startTime = Date.now();

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:4173', // vite preview
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  let dbStatus = 'ok';
  let dbLatency = null;
  try {
    const dbStart = Date.now();
    await supabase.from('emissions').select('count', { count: 'exact', head: true });
    dbLatency = Date.now() - dbStart;
  } catch {
    dbStatus = 'error';
  }

  res.status(dbStatus === 'ok' ? 200 : 503).json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    version: '2.0.0',
    uptime: `${uptime}s`,
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        latency: dbLatency ? `${dbLatency}ms` : null,
      },
      ai: {
        status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
      },
    },
  });
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/emissions', emissionsRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/stream', streamLimiter, streamRoutes);
app.use('/api/kaggle', kaggleRoutes);

// Root info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'EcoTrack AI API',
    version: '2.0.0',
    description: 'Intelligent Platform for ESG Performance and GHG Monitoring',
    health: '/health',
    docs: 'https://github.com/your-org/ecotrack-ai',
  });
});

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Handle CORS errors specifically
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── SERVER START ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 EcoTrack AI Backend v2.0.0`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
