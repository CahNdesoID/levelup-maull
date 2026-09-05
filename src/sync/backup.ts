import { migrateAvatar, migrateData } from "../data/migrate";
import { DEFAULT_USER_NAME } from "../constants/seed";
import { fmt } from "../utils/date";
import type { Snapshot } from "../types";

/**
 * Manual JSON backup.
 *
 * This is the answer to the app's single biggest data risk: everything lives in
 * one browser's localStorage, so clearing site data wipes it permanently. A
 * backup file needs no account, no network, and no configuration.
 */

const BACKUP_VERSION = 1;

interface BackupFile {
  app: "levelup-maull";
  version: number;
  exportedAt: string;
  snapshot: Snapshot;
}

export const exportBackup = (snapshot: Snapshot): void => {
  const payload: BackupFile = {
    app: "levelup-maull",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    snapshot,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `levelup-backup-${fmt().replace(/\s+/g, "-").toLowerCase()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Parses a backup file. Accepts both the wrapped format written by
 * `exportBackup` and a bare snapshot, so a hand-edited file still imports.
 * Throws with a user-facing message when the file cannot be read at all.
 */
export const parseBackup = async (file: File): Promise<Snapshot> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("File itu bukan JSON yang valid.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Isi file backup tidak dikenali.");
  }

  const root = parsed as Record<string, unknown>;
  const candidate =
    typeof root.snapshot === "object" && root.snapshot !== null ? root.snapshot : root;
  const record = candidate as Record<string, unknown>;

  if (typeof record.data !== "object" || record.data === null) {
    throw new Error("File backup tidak berisi data aplikasi.");
  }

  return {
    data: migrateData(record.data),
    userName: typeof record.userName === "string" ? record.userName : DEFAULT_USER_NAME,
    avatar: migrateAvatar(record.avatar),
  };
};
