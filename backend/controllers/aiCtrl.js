import { getStructuredAIResponse, getGeminiPrediction } from '../utils/aiHelper.js';
import { supabase } from '../utils/supabase.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are EcoTrack AI, an expert ESG (Environmental, Social, and Governance) assistant. 
    Provide highly technical, accurate, and actionable advice regarding carbon emissions, scope 1/2/3 tracking, 
    and sustainability frameworks like CSRD and GHG Protocol. Be concise but insightful.`;

    const response = await getGeminiPrediction(`${systemPrompt}\n\nUser: ${message}`);

    res.json({ reply: response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
};

export const forecastWithAI = async (req, res) => {
  try {
    const { historicalData } = req.body;
    
    if (!historicalData) {
      return res.status(400).json({ error: 'Historical data is required for forecasting' });
    }

    const prompt = `You are EcoTrack AI's predictive modeling engine. 
    Given the following recent emissions data (in tCO2e), forecast the next 3 months of emissions and provide 3 actionable insights to reduce them.
    Return your answer in a highly structured, professional format.
    Data: ${JSON.stringify(historicalData)}`;

    const response = await getGeminiPrediction(prompt);
    res.json({ forecast: response });
  } catch (error) {
    console.error('AI Forecast Error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
};

export const getEmissionForecast = async (req, res) => {
  try {
    const { timeframeMonths = 6 } = req.query;
    
    // Fetch summary for Gemini context
    const { data, error } = await supabase.from('emissions').select('type, amount');
    if (error) throw error;
    
    const summary = { 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 };
    data.forEach(item => { if (summary[item.type] !== undefined) summary[item.type] += Number(item.amount); });
    
    const prompt = `
      You are an AI ESG expert. Based on the following historical emission data sums:
      ${JSON.stringify(summary)}
      
      Generate a realistic forecast for the next ${timeframeMonths} months.
      Return the response in JSON format exactly like this:
      {
        "forecast": [
          { "month": "Jan 2027", "predictedScope1": 120, "predictedScope2": 80, "predictedScope3": 300 },
          // ... more months
        ],
        "insights": ["insight 1", "insight 2"]
      }
    `;

    const result = await getStructuredAIResponse(prompt);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const runScenarioAnalysis = async (req, res) => {
  try {
    const { scenarioDescription } = req.body;
    // e.g., "We are switching 50% of our factories to solar energy and replacing 20% of fleet with EVs"

    const prompt = `
      You are a Climate Scenario Analyst for a corporate ESG platform.
      The company wants to implement this scenario: "${scenarioDescription}".
      
      Analyze the potential impact on their Greenhouse Gas (GHG) emissions (Scope 1, 2, and 3).
      Return the analysis in JSON format exactly like this:
      {
        "estimatedReductionPercentage": { "scope1": 15, "scope2": 40, "scope3": 5 },
        "financialImpact": "Brief description of cost/savings",
        "regulatoryBenefits": "Brief description of compliance benefits",
        "challenges": ["challenge 1", "challenge 2"],
        "recommendation": "Final AI recommendation"
      }
    `;

    const result = await getStructuredAIResponse(prompt);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const evaluateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: supplier, error: supError } = await supabase.from('suppliers').select('*').eq('id', id).single();
    if (supError || !supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    
    const { data: supplierEmissions, error: emError } = await supabase.from('emissions').select('*').eq('supplier_id', id);
    if (emError) throw emError;

    const prompt = `
      You are an ESG Auditor. Evaluate this supplier based on their data.
      Supplier Info: ${JSON.stringify(supplier)}
      Recent Emissions (Scope 3 contributions): ${JSON.stringify(supplierEmissions)}
      
      Provide an ESG score and compliance status.
      Return exactly in this JSON format:
      {
        "score": "A", // (A to F)
        "complianceStatus": "Compliant", // or "At Risk", "Non-Compliant"
        "reasoning": "Explanation for the score",
        "actionItems": ["action 1", "action 2"]
      }
    `;

    const result = await getStructuredAIResponse(prompt);
    
    // Optionally update the supplier record with the new score
    if(result.score) {
        await supabase.from('suppliers').update({
          esg_score: result.score,
          compliance_status: result.complianceStatus
        }).eq('id', id);
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
