import type { Snapshot } from "../types";

export type SyncState =
  | { status: "idle" }
  | { status: "syncing" }
  | { status: "synced"; at: number }
  | { status: "error"; message: string };

/**
 * The seam between the app and wherever its data actually lives.
 *
 * `LocalAdapter` is the default and needs nothing configured. A remote adapter
 * is layered on top of it — local storage always stays the source of truth for
 * rendering, so the app keeps working offline and a failed round trip is never
 * able to lose data that is already on the device.
 */
export interface SyncAdapter {
  readonly name: string;
  /** False for local-only adapters, which the UI hides sync controls for. */
  readonly isRemote: boolean;
  /** Returns null when the remote has nothing stored yet. */
  pull(): Promise<Snapshot | null>;
  push(snapshot: Snapshot): Promise<void>;
}
