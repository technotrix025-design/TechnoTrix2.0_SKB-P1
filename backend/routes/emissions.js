import express from 'express';

const router = express.Router();

const API_URL = process.env.SUPABASE_URL;
const API_KEY = process.env.SUPABASE_ANON_KEY;

// Helper: raw fetch to Supabase REST (bypasses schema cache issues)
async function supabaseQuery(table, params = '') {
  const url = `${API_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Supabase REST error: ${res.status}`);
  return res.json();
}

// POST /api/emissions — add a new emission
router.post('/', async (req, res) => {
  try {
    const { type, source, amount, metadata, supplierId } = req.body;
    const url = `${API_URL}/rest/v1/emissions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ type, source, amount, metadata, supplier_id: supplierId }),
    });
    if (!response.ok) throw new Error(`Insert failed: ${response.status}`);
    const data = await response.json();
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/emissions/summary — Scope 1/2/3 totals
router.get('/summary', async (req, res) => {
  try {
    const data = await supabaseQuery('emissions', 'select=type,amount');
    const summary = { 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 };
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (summary[item.type] !== undefined) {
          summary[item.type] += Number(item.amount);
        }
      });
    }
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    // Return zeroed summary so frontend doesn't crash
    res.status(200).json({ success: true, data: { 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 }, note: 'Table may not exist: ' + error.message });
  }
});

// GET /api/emissions — all emissions with supplier info
router.get('/', async (req, res) => {
  try {
    const data = await supabaseQuery('emissions', 'select=*,suppliers(name,category)&order=date.desc');
    res.status(200).json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (error) {
    // Return empty array so frontend falls back to demo data gracefully
    res.status(200).json({ success: true, data: [], note: 'Table may not exist: ' + error.message });
  }
});

export default router;
