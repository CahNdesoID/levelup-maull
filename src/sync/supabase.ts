import { createId } from "../utils/id";
import { migrateAvatar, migrateData } from "../data/migrate";
import { loadRaw, saveRaw } from "../utils/storage";
import { DEFAULT_USER_NAME } from "../constants/seed";
import type { Snapshot } from "../types";
import type { SyncAdapter } from "./types";

/**
 * Optional Supabase backup, implemented against PostgREST with plain `fetch`
 * so the app takes on no extra dependency. Inactive unless both
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set at build time.
 *
 * SECURITY — read before enabling. This app has no login, so there is no user
 * identity to scope rows by. Access is gated purely on `snapshotId`, an
 * unguessable UUID kept in this browser's localStorage. That is a bearer
 * secret: anyone who learns it (and the anon key, which ships in the bundle)
 * can read and overwrite that row. It is adequate for a personal tracker on
 * your own devices; it is NOT adequate for anything private or multi-user.
 * For that, add Supabase Auth and scope the RLS policy to auth.uid().
 *
 * Setup is documented in README.md, including the table definition and the
 * RLS policy this adapter expects.
 *
 * NOTE: this adapter has not been exercised against a live Supabase project in
 * this repository — there is no project provisioned. Verify it end to end
 * before relying on it as your only backup.
 */

const SNAPSHOT_ID_KEY = "lum_snapshot_id";

const env = import.meta.env;
const BASE_URL = env.VITE_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? "";
const TABLE = env.VITE_SUPABASE_TABLE ?? "lum_snapshots";

export const isSupabaseConfigured = (): boolean =>
  BASE_URL.length > 0 && ANON_KEY.length > 0;

/** Stable per-browser row id. Generated once, then reused. */
export const getSnapshotId = (): string => {
  const existing = loadRaw<string>(SNAPSHOT_ID_KEY, "");
  if (existing) return existing;
  const fresh = createId();
  saveRaw(SNAPSHOT_ID_KEY, fresh);
  return fresh;
};

const headers = (): HeadersInit => ({
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
});

const endpoint = (query: string): string =>
  `${BASE_URL}/rest/v1/${encodeURIComponent(TABLE)}${query}`;

const describeFailure = async (res: Response): Promise<string> => {
  const body = await res.text().catch(() => "");
  const detail = body.slice(0, 200);
  return `Supabase ${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`;
};

export const supabaseAdapter: SyncAdapter = {
  name: "supabase",
  isRemote: true,

  async pull(): Promise<Snapshot | null> {
    const id = getSnapshotId();
    const res = await fetch(endpoint(`?id=eq.${encodeURIComponent(id)}&select=payload`), {
      headers: headers(),
    });
    if (!res.ok) throw new Error(await describeFailure(res));

    const rows: unknown = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const first: unknown = rows[0];
    const payload =
      typeof first === "object" && first !== null
        ? (first as { payload?: unknown }).payload
        : undefined;
    if (typeof payload !== "object" || payload === null) return null;

    const record = payload as Record<string, unknown>;
    return {
      data: migrateData(record.data),
      userName: typeof record.userName === "string" ? record.userName : DEFAULT_USER_NAME,
      avatar: migrateAvatar(record.avatar),
    };
  },

  async push(snapshot: Snapshot): Promise<void> {
    const id = getSnapshotId();
    const res = await fetch(endpoint(""), {
      method: "POST",
      headers: {
        ...headers(),
        // Upsert: insert the row, or overwrite it when the id already exists.
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        { id, payload: snapshot, updated_at: new Date().toISOString() },
      ]),
    });
    if (!res.ok) throw new Error(await describeFailure(res));
  },
};
