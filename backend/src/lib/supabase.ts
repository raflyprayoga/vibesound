
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL?.trim();

const supabaseKey = (
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY
)?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[Supabase] Konfigurasi belum lengkap.",
    {
      urlConfigured: Boolean(supabaseUrl),
      keyConfigured: Boolean(supabaseKey),
    }
  );
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;
