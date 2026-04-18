import { GoogleGenAI } from '@google/genai';
import { supabase } from '../utils/supabase.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * POST /api/ai/parse-document
 * Accepts: multipart/form-data with field "document" (PDF or image)
 * Returns: Structured extracted emissions data + calculated CO2e
 */
export const parseDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Send a PDF or image as "document" field.' });
  }

  const { originalname, mimetype, path: filePath, size } = req.file;

  // Guard: ensure API key is configured
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ success: false, message: 'GEMINI_API_KEY is not set in backend .env — cannot process documents.' });
  }

  // Instantiate here so GEMINI_API_KEY is always loaded from env
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    // Read file into base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    const prompt = `
You are an ESG emissions data extraction expert. Analyze this document carefully.
Extract all emission-relevant information and return a structured JSON response.

The document could be: electricity bill, fuel receipt, gas bill, travel invoice, supplier invoice, delivery note, or any other emission-related document.

Return ONLY valid JSON in this exact format (no extra text):
{
  "documentType": "Electricity Invoice | Fuel Receipt | Gas Bill | Supplier Invoice | Travel Expense | Other",
  "vendor": "Company or utility provider name",
  "location": "Facility, city, or region",
  "period": "Billing period e.g. June 2026",
  "energyUsage": null or number (kWh if electricity/gas),
  "energyUnit": "kWh | MJ | GJ | null",
  "fuelConsumption": null or number (liters/kg if fuel),
  "fuelUnit": "liters | kg | m3 | null",
  "fuelType": null or "diesel | petrol | natural_gas | LPG",
  "distanceTravelled": null or number (km, for travel),
  "distanceUnit": "km | miles | null",
  "cost": null or number,
  "currency": "INR | USD | EUR | GBP | null",
  "scope": "Scope 1 | Scope 2 | Scope 3",
  "co2eEstimate": number (your best estimate in tCO2e, must be a number),
  "emissionFactor": "brief description of factor used e.g. India Grid 0.84 kgCO2e/kWh",
  "confidence": "high | medium | low",
  "notes": "any caveats or assumptions made"
}

Rules:
- scope: Scope 1 = direct fuel/gas combustion; Scope 2 = purchased electricity/heat; Scope 3 = supply chain, travel, deliveries
- co2eEstimate: convert to tonnes CO2e (divide kgCO2e by 1000)
- For electricity: estimate using 0.84 kgCO2e/kWh (India grid average)
- For diesel: use 2.64 kgCO2e/liter
- For petrol: use 2.31 kgCO2e/liter
- For natural gas: use 2.0 kgCO2e/m3
- If data is unclear, make a reasonable estimate and set confidence to "low"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimetype,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const extracted = JSON.parse(response.text);

    // Optionally persist to Supabase emissions table
    let savedEmission = null;
    try {
      if (extracted.co2eEstimate && extracted.scope) {
        const { data } = await supabase.from('emissions').insert({
          type: extracted.scope,
          amount: extracted.co2eEstimate,
          source: extracted.documentType || 'AI Document Parse',
          description: `Auto-extracted from ${originalname} | ${extracted.vendor || ''} | ${extracted.period || ''}`,
          date: new Date().toISOString().split('T')[0],
        }).select().single();
        savedEmission = data;
      }
    } catch (dbErr) {
      console.warn('[parseDocument] Supabase insert skipped:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        fileName: originalname,
        fileSize: size,
        mimeType: mimetype,
        extractedData: extracted,
        savedToDb: !!savedEmission,
        emissionId: savedEmission?.id || null,
      },
    });

  } catch (err) {
    console.error('[parseDocument] Error:', err.message || err);
    
    // Give a helpful message for auth failures
    const msg = err.message || '';
    const isAuthError = msg.includes('401') || msg.includes('UNAUTHENTICATED') || msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED');
    
    return res.status(isAuthError ? 401 : 500).json({
      success: false,
      message: isAuthError 
        ? 'Gemini API key is invalid or wrong format. Your key should start with "AIza". Get a valid key at https://aistudio.google.com/app/apikey and update GEMINI_API_KEY in backend/.env'
        : (err.message || 'Failed to parse document with AI'),
    });
  } finally {
    // Always clean up temp file
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  }
};
