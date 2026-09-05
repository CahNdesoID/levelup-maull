import { isSupabaseConfigured, supabaseAdapter } from "./supabase";
import type { SyncAdapter } from "./types";

/**
 * The remote adapter, or null when the app is running offline-only.
 * Local storage is always used regardless; this is strictly a backup target.
 */
export const remoteAdapter: SyncAdapter | null = isSupabaseConfigured()
  ? supabaseAdapter
  : null;

export { localAdapter, readLocalSnapshot, writeLocalSnapshot } from "./local";
export type { SyncAdapter, SyncState } from "./types";
