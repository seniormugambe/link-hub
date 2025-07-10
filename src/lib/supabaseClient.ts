import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon/public key
const supabaseUrl = 'https://qvebtavtpjsxwgvbvnel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWJ0YXZ0cGpzeHdndmJ2bmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzYyODEsImV4cCI6MjA2NzcxMjI4MX0.7FSBvexYFsCB-VF6MKHQVR9_KMr5396b-oFCasf7qws';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 