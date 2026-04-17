import { supabase } from '../utils/supabase.js';

export const addEmission = async (req, res) => {
  try {
    const { type, source, amount, metadata, supplierId } = req.body;
    
    const { data, error } = await supabase
      .from('emissions')
      .insert([{ type, source, amount, metadata, supplier_id: supplierId }])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmissionsSummary = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emissions')
      .select('type, amount');

    if (error) throw error;

    // Group by Scope and sum the amounts locally (or we could use Supabase RPC functions, but this works fine for hackathons)
    const formattedSummary = {
      'Scope 1': 0,
      'Scope 2': 0,
      'Scope 3': 0
    };

    data.forEach(item => {
      if (formattedSummary[item.type] !== undefined) {
        formattedSummary[item.type] += Number(item.amount);
      }
    });

    res.status(200).json({ success: true, data: formattedSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEmissions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emissions')
      .select(`
        *,
        suppliers ( name, category )
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
