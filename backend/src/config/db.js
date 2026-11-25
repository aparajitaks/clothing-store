const { createClient } = require('@supabase/supabase-js');

let supabase = null;

// Track connectivity: if Supabase has failed before, skip future attempts until it recovers
let _supabaseReachable = true;
let _lastConnectivityCheck = 0;
const CONNECTIVITY_RECHECK_MS = 60_000; // recheck every 60s after failure

/**
 * Returns null immediately if Supabase is known to be unreachable,
 * otherwise returns the singleton client.
 * This prevents every API call from hanging for 7+ seconds on a DNS timeout.
 */
function getSupabase() {
  return supabase;
}

function markSupabaseUnreachable() {
  if (_supabaseReachable) {
    console.warn('⚠️  Supabase marked unreachable — switching to seed data fallback mode until connection recovers.');
    _supabaseReachable = false;
    _lastConnectivityCheck = Date.now();
  }
}

function markSupabaseReachable() {
  if (!_supabaseReachable) {
    console.log('✅ Supabase connection restored.');
    _supabaseReachable = true;
  }
}

function isSupabaseAvailable() {
  return _supabaseReachable;
}

if (
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          // 5-second timeout instead of the default ~30s
          // Prevents 7+ second hangs when Supabase DNS fails
          fetch: (url, opts = {}) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);
            return fetch(url, { ...opts, signal: controller.signal }).finally(() =>
              clearTimeout(timer)
            );
          },
        },
      }
    );
    console.log('✅ Supabase client initialized');
  } catch (err) {
    console.warn('⚠️ Supabase client initialization error, operating in fallback repository mode:', err.message);
  }
} else {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Operating in fallback repository mode.');
}

module.exports = supabase;

