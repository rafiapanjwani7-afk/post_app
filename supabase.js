import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrl = "https://izorczhqnqgwpbjxguoi.supabase.co";
const supabaseAnonKey = "sb_publishable_WR1TFRd5ys0ycT4nl228oA_fdYnPxE-";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;