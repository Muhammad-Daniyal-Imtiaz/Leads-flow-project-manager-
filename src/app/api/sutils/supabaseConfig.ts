import { createClient } from '@supabase/supabase-js';

// Load from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables not set!');
  if (process.env.NODE_ENV === 'development') {
    console.warn('Running in development mode with mock Supabase client');
    // Optionally: return a mock client or handle differently
  } else {
    throw new Error('Supabase credentials not configured');
  }
}

export const supabase = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Enable PKCE flow
    flowType: 'pkce'
  }
});