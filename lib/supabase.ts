import { createClient } from '@supabase/supabase-js';
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env as Record<string, string>;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { throw new Error('Supabase env missing'); }
export const supaSrv = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
