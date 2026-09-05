/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** e.g. https://xxxxxxxx.supabase.co — leave unset to stay fully offline. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase project "anon" public key. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Table holding one snapshot row per device. Defaults to "lum_snapshots". */
  readonly VITE_SUPABASE_TABLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
