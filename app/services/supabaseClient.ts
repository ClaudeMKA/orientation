import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvcpntlvdgnorkmgsyon.supabase.co';
const supabaseKey = 'votre_clé_supabase';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
