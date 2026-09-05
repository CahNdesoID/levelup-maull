import { createSeedData } from "../constants/seed";
import { createId } from "../utils/id";
import { T } from "../constants/theme";
import type {
  AppData,
  Avatar,
  BinEntry,
  Group,
  LearnedItem,
  Note,
  ScheduleItem,
  Target,
} from "../types";

/**
 * Normalises whatever is sitting in localStorage (or in an imported backup)
 * into the current `AppData` shape.
 *
 * Builds before the UUID change stored numeric ids, and very old builds had no
 * `bin` array at all. Anything unreadable is dropped rather than allowed to
 * crash a render deep inside a screen.
 */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;

const bool = (v: unknown): boolean => v === true;

/** Legacy ids were numbers; keep the value so references stay intact. */
const asId = (v: unknown): string => {
  if (typeof v === "string" && v.length > 0) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return createId();
};

const toNote = (v: unknown): Note | null => {
  if (!isRecord(v)) return null;
  return {
    id: asId(v.id),
    title: str(v.title),
    body: str(v.body),
    date: str(v.date),
  };
};

const toGroup = (v: unknown): Group | null => {
  if (!isRecord(v)) return null;
  return {
    id: asId(v.id),
    name: str(v.name, "Untitled"),
    emoji: str(v.emoji, "📝"),
    color: str(v.color, T.sage),
    notes: asArray(v.notes).map(toNote).filter((n): n is Note => n !== null),
  };
};

const toLearned = (v: unknown): LearnedItem | null => {
  if (!isRecord(v)) return null;
  return { id: asId(v.id), text: str(v.text), date: str(v.date) };
};

const toTarget = (v: unknown): Target | null => {
  if (!isRecord(v)) return null;
  return { id: asId(v.id), title: str(v.title), done: bool(v.done) };
};

const toSchedule = (v: unknown): ScheduleItem | null => {
  if (!isRecord(v)) return null;
  return {
    id: asId(v.id),
    time: str(v.time, "00:00"),
    title: str(v.title),
    desc: str(v.desc),
    color: str(v.color, T.lav),
    done: bool(v.done),
  };
};

const BIN_TYPES = new Set<BinEntry["type"]>([
  "group",
  "note-group",
  "note-general",
  "learned",
  "target",
  "sched",
]);

const toBinEntry = (v: unknown): BinEntry | null => {
  if (!isRecord(v)) return null;

  const type = str(v.type) as BinEntry["type"];
  if (!BIN_TYPES.has(type)) return null;

  const rawMeta = isRecord(v.meta) ? v.meta : {};
  const meta = {
    ...(rawMeta.gid === undefined ? {} : { gid: asId(rawMeta.gid) }),
    ...(rawMeta.groupName === undefined ? {} : { groupName: str(rawMeta.groupName) }),
    ...(rawMeta.groupColor === undefined ? {} : { groupColor: str(rawMeta.groupColor) }),
  };

  const base = {
    binId: str(v.binId) || createId(),
    deletedAt: typeof v.deletedAt === "number" ? v.deletedAt : Date.now(),
    meta,
  };

  switch (type) {
    case "group": {
      const data = toGroup(v.data);
      return data ? { ...base, type, data } : null;
    }
    case "note-group":
    case "note-general": {
      const data = toNote(v.data);
      return data ? { ...base, type, data } : null;
    }
    case "learned": {
      const data = toLearned(v.data);
      return data ? { ...base, type, data } : null;
    }
    case "target": {
      const data = toTarget(v.data);
      return data ? { ...base, type, data } : null;
    }
    case "sched": {
      const data = toSchedule(v.data);
      return data ? { ...base, type, data } : null;
    }
  }
};

export const migrateData = (raw: unknown): AppData => {
  if (!isRecord(raw)) return createSeedData();

  return {
    groups: asArray(raw.groups).map(toGroup).filter((g): g is Group => g !== null),
    general: asArray(raw.general).map(toNote).filter((n): n is Note => n !== null),
    learned: asArray(raw.learned).map(toLearned).filter((l): l is LearnedItem => l !== null),
    targets: asArray(raw.targets).map(toTarget).filter((t): t is Target => t !== null),
    schedule: asArray(raw.schedule)
      .map(toSchedule)
      .filter((s): s is ScheduleItem => s !== null)
      .sort((a, b) => a.time.localeCompare(b.time)),
    // Absent in the earliest builds, which predate the trash feature.
    bin: asArray(raw.bin).map(toBinEntry).filter((b): b is BinEntry => b !== null),
  };
};

const AVATAR_KINDS = new Set<Avatar["type"]>(["initial", "emoji", "photo"]);

export const migrateAvatar = (raw: unknown): Avatar => {
  if (!isRecord(raw)) return { type: "initial", value: "" };
  const type = str(raw.type) as Avatar["type"];
  if (!AVATAR_KINDS.has(type)) return { type: "initial", value: "" };
  return { type, value: str(raw.value) };
};
