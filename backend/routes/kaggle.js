import express from 'express';
import { fetchKaggleDataset } from '../utils/kaggle.js';

const router = express.Router();

// ── Cache for OWID data ──
let owidCache = null;
let owidCacheTime = 0;
const OWID_TTL = 30 * 60 * 1000; // 30 min

/**
 * GET /api/kaggle/dataset
 * Returns the parsed & aggregated CO2 emissions dataset from Kaggle.
 */
router.get('/dataset', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 500, 2000);
    const raw = await fetchKaggleDataset();

    if (!raw || raw.length === 0) {
      return res.status(404).json({ success: false, message: 'No data available from Kaggle dataset' });
    }

    const cleaned = raw
      .map(r => {
        const country = r.country || r.Entity || '';
        const year = parseInt(r.year || r.Year || '0');
        const co2Raw = r.co2 || r['Annual CO₂ emissions (tonnes )'] || r['Annual CO2 emissions (tonnes)'] || '0';
        const co2 = parseFloat(co2Raw) / 1e6;
        return {
          country, year,
          co2: parseFloat(co2.toFixed(2)),
          methane: parseFloat(r.methane || '0'),
          nitrous_oxide: parseFloat(r.nitrous_oxide || '0'),
          population: parseFloat(r.population || '0'),
          gdp: parseFloat(r.gdp || '0'),
          co2_per_capita: parseFloat(r.co2_per_capita || '0'),
        };
      })
      .filter(r => r.co2 > 0 && r.year >= 1950 && r.country)
      .slice(0, limit);

    const countries = [...new Set(cleaned.map(r => r.country))];
    const years = cleaned.map(r => r.year);
    const totalCO2 = cleaned.reduce((s, r) => s + r.co2, 0);

    res.json({
      success: true,
      summary: {
        totalRows: cleaned.length,
        countries: countries.length,
        yearRange: [Math.min(...years), Math.max(...years)],
        totalCO2Mt: Math.round(totalCO2),
      },
      data: cleaned,
    });
  } catch (err) {
    console.error('[Kaggle] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/kaggle/live-data
 * Fetches real-time CO₂ data from Our World in Data (OWID) GitHub CSV.
 * Free public data — no API key needed. Used by researchers worldwide.
 * Query: ?countries=India,China,World&yearFrom=2000&limit=500
 */
router.get('/live-data', async (req, res) => {
  try {
    const countryFilter = req.query.countries
      ? req.query.countries.split(',').map(s => s.trim().toLowerCase())
      : null;
    const yearFrom = parseInt(req.query.yearFrom) || 1990;
    const limit = Math.min(parseInt(req.query.limit) || 1000, 5000);

    // Fetch & cache OWID data
    if (!owidCache || Date.now() - owidCacheTime > OWID_TTL) {
      console.log('[OWID] Fetching fresh data from Our World in Data...');
      const url = 'https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`OWID fetch failed: ${resp.status}`);
      const text = await resp.text();

      // Parse CSV
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        // Handle CSV with commas in quotes
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = (values[idx] || '').replace(/"/g, '').trim();
        });
        rows.push(row);
      }
      owidCache = rows;
      owidCacheTime = Date.now();
      console.log(`[OWID] Cached ${rows.length} rows`);
    }

    // Filter & map
    const cleaned = owidCache
      .map(r => {
        const country = r.country || '';
        const year = parseInt(r.year || '0');
        const co2 = parseFloat(r.co2 || '0');
        const co2_per_capita = parseFloat(r.co2_per_capita || '0');
        const population = parseFloat(r.population || '0');
        const gdp = parseFloat(r.gdp || '0');
        const methane = parseFloat(r.methane || '0');
        const share_global = parseFloat(r.share_global_co2 || '0');
        return { country, year, co2, co2_per_capita, population, gdp, methane, share_global };
      })
      .filter(r => {
        if (!r.country || r.year < yearFrom || r.co2 <= 0) return false;
        if (countryFilter) return countryFilter.includes(r.country.toLowerCase());
        return true;
      })
      .slice(0, limit);

    const countries = [...new Set(cleaned.map(r => r.country))];
    const years = cleaned.map(r => r.year);

    res.json({
      success: true,
      source: 'Our World in Data (OWID)',
      sourceUrl: 'https://github.com/owid/co2-data',
      license: 'CC BY 4.0',
      summary: {
        totalRows: cleaned.length,
        countries: countries.length,
        yearRange: years.length ? [Math.min(...years), Math.max(...years)] : [0, 0],
        totalCO2Mt: Math.round(cleaned.reduce((s, r) => s + r.co2, 0)),
      },
      data: cleaned,
    });
  } catch (err) {
    console.error('[OWID] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/kaggle/sources
 * Lists all available real-world data sources for the platform.
 */
router.get('/sources', (req, res) => {
  res.json({
    success: true,
    sources: [
      {
        id: 'kaggle',
        name: 'Kaggle CO₂ Emissions',
        description: 'Historical CO₂ & GHG emissions by country (1750–2020)',
        url: 'https://www.kaggle.com/datasets/yoannboyere/co2-ghg-emissionsdata',
        endpoint: '/api/kaggle/dataset',
        status: 'active',
      },
      {
        id: 'owid',
        name: 'Our World in Data',
        description: 'Comprehensive CO₂ & greenhouse gas data updated regularly',
        url: 'https://github.com/owid/co2-data',
        endpoint: '/api/kaggle/live-data',
        status: 'active',
        license: 'CC BY 4.0',
      },
    ],
  });
});

export default router;
