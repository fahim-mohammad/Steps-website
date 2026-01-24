import { createClient } from '@supabase/supabase-js'

/**
 * STEPS Community Fund - Supabase Client
 * 
 * Secure, reusable Supabase client for Next.js App Router
 * Uses environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 
 * Project: STEPS (Bangladesh Community Fund Management)
 * Currency: BDT (৳)
 * Environment: Production-Ready
 */

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
  )
}

/**
 * Initialize Supabase client with production configuration
 * - Auto refresh tokens
 * - Persist session to localStorage
 * - Handle auth state changes
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    broadcast: { self: true },
  },
})

// Export client for use throughout the application
export default supabase

