/**
 * Central domain types for Level Up With Maul.
 *
 * Every persisted entity is identified by a string `Id` (a UUID for anything
 * created at runtime). Older builds stored numeric ids; `migrateData` in
 * `src/data/migrate.ts` normalises those to strings on load.
 */

export type Id = string;

/* ─── Entities ───────────────────────────────────────────── */

/** ISO calendar date, `YYYY-MM-DD`. Sorts chronologically as a plain string. */
export type IsoDate = string;

export interface Note {
  id: Id;
  title: string;
  body: string;
  date: IsoDate;
}

export interface Group {
  id: Id;
  name: string;
  emoji: string;
  color: string;
  notes: Note[];
}

export interface LearnedItem {
  id: Id;
  text: string;
  date: IsoDate;
}

export interface Target {
  id: Id;
  title: string;
  done: boolean;
}

export interface ScheduleItem {
  id: Id;
  /** 24h "HH:MM"; sorted lexicographically, which is correct for this format. */
  time: string;
  title: string;
  desc: string;
  color: string;
  done: boolean;
}

/* ─── Trash / soft delete ────────────────────────────────── */

export type BinType =
  | "group"
  | "note-group"
  | "note-general"
  | "learned"
  | "target"
  | "sched";

export interface BinMeta {
  /** Owning group of a deleted grouped note, so it can be restored in place. */
  gid?: Id;
  groupName?: string;
  groupColor?: string;
}

interface BinEntryBase {
  binId: string;
  deletedAt: number;
  meta: BinMeta;
}

/**
 * Discriminated on `type` so `restoreFromBin` gets a correctly narrowed
 * payload instead of a union it has to cast.
 */
export type BinEntry =
  | (BinEntryBase & { type: "group"; data: Group })
  | (BinEntryBase & { type: "note-group"; data: Note })
  | (BinEntryBase & { type: "note-general"; data: Note })
  | (BinEntryBase & { type: "learned"; data: LearnedItem })
  | (BinEntryBase & { type: "target"; data: Target })
  | (BinEntryBase & { type: "sched"; data: ScheduleItem });

/* ─── Root state ─────────────────────────────────────────── */

export interface AppData {
  groups: Group[];
  general: Note[];
  learned: LearnedItem[];
  targets: Target[];
  schedule: ScheduleItem[];
  bin: BinEntry[];
}

export type AvatarKind = "initial" | "emoji" | "photo";

export interface Avatar {
  type: AvatarKind;
  /** Emoji character, or a data: URL for an uploaded photo. Empty for "initial". */
  value: string;
}

/** Everything a backup file or a remote sync row carries. */
export interface Snapshot {
  data: AppData;
  userName: string;
  avatar: Avatar;
}

/* ─── UI state ───────────────────────────────────────────── */

export type TabId = "home" | "notes" | "learn" | "schedule" | "profile";

/**
 * Replaces the old `typeof noteView === "number"` check, which stopped working
 * once group ids became UUID strings.
 */
export type NotesView =
  | { kind: "index" }
  | { kind: "group"; id: Id }
  | { kind: "general" };

export type EditTarget =
  | { type: "learned"; id: Id; text: string }
  | { type: "target"; id: Id; title: string }
  | { type: "note-group"; id: Id; gid: Id; title: string; body: string }
  | { type: "note-general"; id: Id; title: string; body: string }
  | { type: "sched"; id: Id; time: string; title: string; desc: string };

export type Preview =
  | { type: "note"; title: string; body: string; date: IsoDate; color: string; groupName: string }
  | { type: "general"; title: string; body: string; date: IsoDate }
  | { type: "learned"; text: string; date: IsoDate };

export type ModalId =
  | "addGroup"
  | "addNote"
  | "addLearn"
  | "addTarget"
  | "addSched"
  | "editName";

/** Draft values for every "create" form in the app. */
export interface FormState {
  title: string;
  body: string;
  emoji: string;
  name: string;
  learn: string;
  target: string;
  time: string;
  stitle: string;
  sdesc: string;
  newName: string;
}
