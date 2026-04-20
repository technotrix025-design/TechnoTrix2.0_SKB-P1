import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

// Track whether Supabase has the emissions table — checked once on first request
let supabaseAvailable = null; // null = not checked yet, true/false after check

async function checkSupabaseTable() {
  try {
    const { error } = await supabase
      .from('emissions')
      .select('id')
      .limit(1);
    // If error contains "schema" or "relation", the table doesn't exist
    if (error && (error.message.includes('schema') || error.message.includes('relation') || error.code === '42P01' || error.code === 'PGRST116')) {
      console.log('[Stream] Supabase emissions table not found — using demo data mode');
      supabaseAvailable = false;
    } else {
      supabaseAvailable = true;
      console.log('[Stream] Supabase emissions table confirmed ✅');
    }
  } catch {
    supabaseAvailable = false;
    console.log('[Stream] Supabase unreachable — using demo data mode');
  }
}

// Generate realistic demo data with slight variance each call
function getDemoData() {
  const base = { s1: 350, s2: 270, s3: 780 };
  const s1 = base.s1 + (Math.random() * 10 - 5);
  const s2 = base.s2 + (Math.random() * 8 - 4);
  const s3 = base.s3 + (Math.random() * 15 - 7.5);
  return {
    timestamp: new Date().toISOString(),
    scope1: parseFloat(s1.toFixed(2)),
    scope2: parseFloat(s2.toFixed(2)),
    scope3: parseFloat(s3.toFixed(2)),
    total: parseFloat((s1 + s2 + s3).toFixed(2)),
    target: 1500,
    source: 'demo',
    rowCount: 0,
    alert: Math.random() > 0.97 ? 'Anomaly detected in Scope 3 supplier network' : null,
  };
}

async function fetchLive() {
  // If we already know Supabase is unavailable, skip straight to demo
  if (supabaseAvailable === false) return getDemoData();

  try {
    const { data, error } = await supabase
      .from('emissions')
      .select('type, amount, date')
      .order('date', { ascending: false })
      .limit(200);

    if (error) {
      // Mark as unavailable so we stop trying
      supabaseAvailable = false;
      console.log('[Stream] Supabase error — switching to demo data:', error.message);
      return getDemoData();
    }

    supabaseAvailable = true;
    const sum = (type) => data.filter(e => e.type === type).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const hasData = data.length > 0;
    const s1 = hasData ? sum('Scope 1') : 350 + (Math.random() * 6 - 3);
    const s2 = hasData ? sum('Scope 2') : 270 + (Math.random() * 4 - 2);
    const s3 = hasData ? sum('Scope 3') : 780 + (Math.random() * 10 - 5);

    return {
      timestamp: new Date().toISOString(),
      scope1: parseFloat(s1.toFixed(2)),
      scope2: parseFloat(s2.toFixed(2)),
      scope3: parseFloat(s3.toFixed(2)),
      total: parseFloat((s1 + s2 + s3).toFixed(2)),
      target: 1500,
      source: hasData ? 'supabase' : 'demo',
      rowCount: data.length,
      alert: Math.random() > 0.97 ? 'Anomaly detected in Scope 3 supplier network' : null,
    };
  } catch {
    supabaseAvailable = false;
    return getDemoData();
  }
}

// GET /api/stream/emissions — SSE stream
router.get('/emissions', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Stream initialised' })}\n\n`);

  // Check Supabase availability once (only on first ever request)
  if (supabaseAvailable === null) await checkSupabaseTable();

  // Send first payload immediately
  const first = await fetchLive();
  res.write(`data: ${JSON.stringify(first)}\n\n`);

  const interval = setInterval(async () => {
    try {
      const payload = await fetchLive();
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      // Never let interval crash the stream
      res.write(`data: ${JSON.stringify(getDemoData())}\n\n`);
    }
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
    console.log('[Stream] Client disconnected');
  });
});

export default router;
