import { createClient } from '@supabase/supabase-js';

// Using the same URL and Anon Key as the backend for the hackathon prototype
const supabaseUrl = 'https://dvaqvxazkgafukouojvb.supabase.co';
const supabaseKey = 'sb_publishable_xQUaQC7K7Y2qOb2rctmQ5g_m1NFcKdU';

export const supabase = createClient(supabaseUrl, supabaseKey);
