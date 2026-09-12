import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co';
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (
  import.meta.env.VITE_SUPABASE_URL === undefined ||
  import.meta.env.VITE_SUPABASE_ANON_KEY === undefined
) {
  console.warn(
    '[TeyaCollections] Supabase env vars not set — auth and database features will be unavailable. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Render environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnon);
