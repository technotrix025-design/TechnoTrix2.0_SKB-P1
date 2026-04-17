import { supabase } from '../utils/supabase.js';

export const addSupplier = async (req, res) => {
  try {
    const { name, contactEmail, category } = req.body;
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ name, contact_email: contactEmail, category }])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*');

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint for a supplier to report their own emissions (which becomes our Scope 3)
export const reportSupplierEmissions = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { amount, source, metadata } = req.body;
    
    const { data: supplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('name')
      .eq('id', supplierId)
      .single();

    if (fetchError || !supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const { data: newEmission, error: insertError } = await supabase
      .from('emissions')
      .insert([{
        type: 'Scope 3',
        source: source || `Supplier: ${supplier.name}`,
        amount,
        supplier_id: supplierId,
        metadata
      }])
      .select();

    if (insertError) throw insertError;
    
    // Update supplier last reported date
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ last_reported_date: new Date() })
      .eq('id', supplierId);

    if (updateError) throw updateError;

    res.status(201).json({ success: true, message: 'Supplier emission reported successfully', data: newEmission[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
