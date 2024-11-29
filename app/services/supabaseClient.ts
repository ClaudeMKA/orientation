import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvcpntlvdgnorkmgsyon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Y3BudGx2ZGdub3JrbWdzeW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MjU2NDAsImV4cCI6MjA0ODEwMTY0MH0.tHb-dzNs6mlfr84IXRhoSc6sS1vCnTpbS-s1o1Wnfvk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
