import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
export const supabaseUrl = rawUrl.startsWith('http') && !rawUrl.includes('.') && !rawUrl.includes('localhost')
  ? `${rawUrl}.supabase.co`
  : rawUrl;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function getSupabaseServerClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-role', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
