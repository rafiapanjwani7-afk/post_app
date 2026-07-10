import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrl = "https://dubfqgrysuxlobpiveod.supabase.co";
const supabaseAnonKey = "sb_publishable_-C2lDiz7SZkWKzAJur-OoQ_8dZMLG5E";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;