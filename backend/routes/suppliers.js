import express from 'express';

const router = express.Router();

const API_URL = process.env.SUPABASE_URL;
const API_KEY = process.env.SUPABASE_ANON_KEY;

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

// GET /api/suppliers — all suppliers
router.get('/', async (req, res) => {
  try {
    const data = await supabaseQuery('suppliers', 'select=*');
    res.status(200).json({ success: true, data: Array.isArray(data) ? data : [] });
  } catch (error) {
    res.status(200).json({ success: true, data: [], note: 'Table may not exist: ' + error.message });
  }
});

// POST /api/suppliers — add supplier
router.post('/', async (req, res) => {
  try {
    const { name, contactEmail, category } = req.body;
    const url = `${API_URL}/rest/v1/suppliers`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ name, contact_email: contactEmail, category }),
    });
    if (!response.ok) throw new Error(`Insert failed: ${response.status}`);
    const data = await response.json();
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/suppliers/:supplierId/emissions — report supplier emissions
router.post('/:supplierId/emissions', async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { amount, source, metadata } = req.body;

    // Get supplier name
    const suppliers = await supabaseQuery('suppliers', `select=name&id=eq.${supplierId}`);
    const supplier = Array.isArray(suppliers) ? suppliers[0] : null;
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const url = `${API_URL}/rest/v1/emissions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        type: 'Scope 3',
        source: source || `Supplier: ${supplier.name}`,
        amount,
        supplier_id: supplierId,
        metadata,
      }),
    });
    if (!response.ok) throw new Error(`Insert failed: ${response.status}`);
    const data = await response.json();
    res.status(201).json({ success: true, message: 'Supplier emission reported', data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
