import { createClient } from '@supabase/supabase-js';

// Use environment variables for security. Set these in your .env file and Render dashboard.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 