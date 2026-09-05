import { DEFAULT_USER_NAME, STORAGE_KEYS, createSeedData } from "../constants/seed";
import { migrateAvatar, migrateData } from "../data/migrate";
import { loadRaw, saveRaw } from "../utils/storage";
import type { SaveResult } from "../utils/storage";
import type { Snapshot } from "../types";
import type { SyncAdapter } from "./types";

/** Reads the three localStorage keys back into one validated snapshot. */
export const readLocalSnapshot = (): Snapshot => ({
  data: migrateData(loadRaw<unknown>(STORAGE_KEYS.data, null) ?? createSeedData()),
  userName: loadRaw<string>(STORAGE_KEYS.name, DEFAULT_USER_NAME),
  avatar: migrateAvatar(loadRaw<unknown>(STORAGE_KEYS.avatar, null)),
});

/** Writes all three keys, returning the first failure so callers can report it. */
export const writeLocalSnapshot = (snapshot: Snapshot): SaveResult => {
  const results = [
    saveRaw(STORAGE_KEYS.data, snapshot.data),
    saveRaw(STORAGE_KEYS.name, snapshot.userName),
    saveRaw(STORAGE_KEYS.avatar, snapshot.avatar),
  ];
  return results.find((r): r is Extract<SaveResult, { ok: false }> => !r.ok) ?? { ok: true };
};

export const localAdapter: SyncAdapter = {
  name: "localStorage",
  isRemote: false,
  pull: async () => readLocalSnapshot(),
  push: async (snapshot) => {
    const result = writeLocalSnapshot(snapshot);
    if (!result.ok) throw new Error(result.message);
  },
};
