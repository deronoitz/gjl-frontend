import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for public/frontend use (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client for API routes (bypasses RLS) - only check for service key in server context
export const supabaseService: SupabaseClient = (() => {
  // Only require service role key on server-side (API routes)
  if (typeof window === 'undefined') {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('Missing Supabase service role key for server-side operations');
    }
    return createClient(supabaseUrl, serviceRoleKey);
  }
  // Return a dummy client on client-side that will throw if used
  return createClient(supabaseUrl, supabaseAnonKey);
})();

// For server-side operations that require elevated permissions
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
