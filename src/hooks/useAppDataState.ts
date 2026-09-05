import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GRP_COLORS, T, TRASH_TTL_MS } from "../constants/theme";
import { createId } from "../utils/id";
import { todayLabel } from "../utils/date";
import { readLocalSnapshot, remoteAdapter, writeLocalSnapshot } from "../sync";
import type { SyncState } from "../sync";
import type {
  AppData,
  Avatar,
  BinEntry,
  BinMeta,
  EditTarget,
  Id,
  LearnedItem,
  Note,
  ScheduleItem,
  Snapshot,
} from "../types";

/**
 * Owns every piece of persisted state and the only functions allowed to change
 * it. Screens read this through `useStore()` and never touch localStorage or
 * the sync adapters directly.
 */

const byTime = (a: ScheduleItem, b: ScheduleItem): number => a.time.localeCompare(b.time);

/**
 * Fields shared by every trash entry. Call sites spread this and then supply
 * `type` and `data` together, which lets TypeScript check the pair against the
 * `BinEntry` union instead of forcing a cast.
 */
const binBase = (meta: BinMeta = {}) => ({
  binId: createId(),
  deletedAt: Date.now(),
  meta,
});

export interface AppStore {
  data: AppData;
  userName: string;
  avatar: Avatar;

  /* derived */
  doneCount: number;
  totalCount: number;
  pct: number;
  allNotesCount: number;
  todayLearned: LearnedItem[];
  activeBin: BinEntry[];

  /* persistence */
  persistError: string | null;
  dismissPersistError: () => void;
  syncState: SyncState;
  isRemoteEnabled: boolean;
  pushToRemote: () => Promise<void>;
  pullFromRemote: () => Promise<void>;
  snapshot: Snapshot;
  replaceSnapshot: (snapshot: Snapshot) => void;

  /* profile */
  setUserName: (name: string) => void;
  setAvatar: (avatar: Avatar) => void;

  /* mutations — each returns false when the input was rejected */
  addGroup: (name: string, emoji: string) => boolean;
  addNote: (groupId: Id | null, title: string, body: string) => boolean;
  addLearn: (text: string) => boolean;
  addTarget: (title: string) => boolean;
  addSched: (time: string, title: string, desc: string) => boolean;
  applyEdit: (target: EditTarget) => boolean;

  toggleTarget: (id: Id) => void;
  toggleSched: (id: Id) => void;

  delGroup: (id: Id) => void;
  delNote: (groupId: Id, noteId: Id) => void;
  delGeneral: (id: Id) => void;
  delLearned: (id: Id) => void;
  delTarget: (id: Id) => void;
  delSched: (id: Id) => void;

  restoreFromBin: (entry: BinEntry) => void;
  permDelete: (binId: string) => void;
  emptyBin: () => void;
}

export const useAppDataState = (): AppStore => {
  // Read once on mount; `readLocalSnapshot` also migrates legacy shapes.
  const [initial] = useState(readLocalSnapshot);
  const [data, setData] = useState<AppData>(initial.data);
  const [userName, setUserName] = useState<string>(initial.userName);
  const [avatar, setAvatar] = useState<Avatar>(initial.avatar);

  const [persistError, setPersistError] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>({ status: "idle" });

  const snapshot = useMemo<Snapshot>(
    () => ({ data, userName, avatar }),
    [data, userName, avatar],
  );

  // Keep the latest snapshot reachable from callbacks without making every
  // sync function change identity on each keystroke.
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  useEffect(() => {
    const result = writeLocalSnapshot(snapshot);
    setPersistError(result.ok ? null : result.message);
  }, [snapshot]);

  /* ─── derived ─────────────────────────────────────────── */

  const doneCount = useMemo(() => data.targets.filter((t) => t.done).length, [data.targets]);
  const totalCount = data.targets.length;
  // Guard the 0/0 case: with no targets the old code rendered "NaN%" and fed
  // NaN into the progress arc's strokeDasharray.
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const allNotesCount = useMemo(
    () => data.general.length + data.groups.reduce((sum, g) => sum + g.notes.length, 0),
    [data.general, data.groups],
  );

  const todayLearned = useMemo(() => {
    const today = todayLabel();
    return data.learned.filter((l) => l.date === today);
  }, [data.learned]);

  const activeBin = useMemo(
    () => data.bin.filter((b) => Date.now() - b.deletedAt < TRASH_TTL_MS),
    [data.bin],
  );

  /* ─── create ──────────────────────────────────────────── */

  const addGroup = useCallback((name: string, emoji: string): boolean => {
    if (!name.trim()) return false;
    setData((p) => ({
      ...p,
      groups: [
        ...p.groups,
        {
          id: createId(),
          name: name.trim(),
          emoji: emoji.trim() || "📝",
          color: GRP_COLORS[p.groups.length % GRP_COLORS.length],
          notes: [],
        },
      ],
    }));
    return true;
  }, []);

  const addNote = useCallback(
    (groupId: Id | null, title: string, body: string): boolean => {
      if (!title.trim()) return false;
      const note: Note = { id: createId(), title: title.trim(), body, date: todayLabel() };
      setData((p) =>
        groupId === null
          ? { ...p, general: [...p.general, note] }
          : {
              ...p,
              groups: p.groups.map((g) =>
                g.id === groupId ? { ...g, notes: [...g.notes, note] } : g,
              ),
            },
      );
      return true;
    },
    [],
  );

  const addLearn = useCallback((text: string): boolean => {
    if (!text.trim()) return false;
    setData((p) => ({
      ...p,
      learned: [{ id: createId(), text: text.trim(), date: todayLabel() }, ...p.learned],
    }));
    return true;
  }, []);

  const addTarget = useCallback((title: string): boolean => {
    if (!title.trim()) return false;
    setData((p) => ({
      ...p,
      targets: [...p.targets, { id: createId(), title: title.trim(), done: false }],
    }));
    return true;
  }, []);

  const addSched = useCallback((time: string, title: string, desc: string): boolean => {
    if (!title.trim() || !time.trim()) return false;
    setData((p) => ({
      ...p,
      schedule: [
        ...p.schedule,
        {
          id: createId(),
          time: time.trim(),
          title: title.trim(),
          desc,
          color: T.lav,
          done: false,
        },
      ].sort(byTime),
    }));
    return true;
  }, []);

  /* ─── edit ────────────────────────────────────────────── */

  const applyEdit = useCallback((target: EditTarget): boolean => {
    switch (target.type) {
      case "learned": {
        if (!target.text.trim()) return false;
        setData((p) => ({
          ...p,
          learned: p.learned.map((l) =>
            l.id === target.id ? { ...l, text: target.text } : l,
          ),
        }));
        return true;
      }
      case "target": {
        if (!target.title.trim()) return false;
        setData((p) => ({
          ...p,
          targets: p.targets.map((t) =>
            t.id === target.id ? { ...t, title: target.title } : t,
          ),
        }));
        return true;
      }
      case "note-group": {
        if (!target.title.trim()) return false;
        setData((p) => ({
          ...p,
          groups: p.groups.map((g) =>
            g.id === target.gid
              ? {
                  ...g,
                  notes: g.notes.map((n) =>
                    n.id === target.id ? { ...n, title: target.title, body: target.body } : n,
                  ),
                }
              : g,
          ),
        }));
        return true;
      }
      case "note-general": {
        if (!target.title.trim()) return false;
        setData((p) => ({
          ...p,
          general: p.general.map((n) =>
            n.id === target.id ? { ...n, title: target.title, body: target.body } : n,
          ),
        }));
        return true;
      }
      case "sched": {
        if (!target.title.trim()) return false;
        setData((p) => ({
          ...p,
          schedule: p.schedule
            .map((s) =>
              s.id === target.id
                ? { ...s, time: target.time, title: target.title, desc: target.desc }
                : s,
            )
            .sort(byTime),
        }));
        return true;
      }
    }
  }, []);

  /* ─── toggle ──────────────────────────────────────────── */

  const toggleTarget = useCallback((id: Id) => {
    setData((p) => ({
      ...p,
      targets: p.targets.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }, []);

  const toggleSched = useCallback((id: Id) => {
    setData((p) => ({
      ...p,
      schedule: p.schedule.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    }));
  }, []);

  /* ─── soft delete ─────────────────────────────────────── */

  const delGroup = useCallback((id: Id) => {
    setData((p) => {
      const group = p.groups.find((g) => g.id === id);
      if (!group) return p;
      return {
        ...p,
        groups: p.groups.filter((g) => g.id !== id),
        bin: [...p.bin, { ...binBase(), type: "group" as const, data: group }],
      };
    });
  }, []);

  const delNote = useCallback((groupId: Id, noteId: Id) => {
    setData((p) => {
      const group = p.groups.find((g) => g.id === groupId);
      const note = group?.notes.find((n) => n.id === noteId);
      if (!group || !note) return p;
      return {
        ...p,
        groups: p.groups.map((g) =>
          g.id === groupId ? { ...g, notes: g.notes.filter((n) => n.id !== noteId) } : g,
        ),
        bin: [
          ...p.bin,
          {
            ...binBase({ gid: groupId, groupName: group.name, groupColor: group.color }),
            type: "note-group" as const,
            data: note,
          },
        ],
      };
    });
  }, []);

  const delGeneral = useCallback((id: Id) => {
    setData((p) => {
      const note = p.general.find((n) => n.id === id);
      if (!note) return p;
      return {
        ...p,
        general: p.general.filter((n) => n.id !== id),
        bin: [...p.bin, { ...binBase(), type: "note-general" as const, data: note }],
      };
    });
  }, []);

  const delLearned = useCallback((id: Id) => {
    setData((p) => {
      const item = p.learned.find((l) => l.id === id);
      if (!item) return p;
      return {
        ...p,
        learned: p.learned.filter((l) => l.id !== id),
        bin: [...p.bin, { ...binBase(), type: "learned" as const, data: item }],
      };
    });
  }, []);

  const delTarget = useCallback((id: Id) => {
    setData((p) => {
      const item = p.targets.find((t) => t.id === id);
      if (!item) return p;
      return {
        ...p,
        targets: p.targets.filter((t) => t.id !== id),
        bin: [...p.bin, { ...binBase(), type: "target" as const, data: item }],
      };
    });
  }, []);

  const delSched = useCallback((id: Id) => {
    setData((p) => {
      const item = p.schedule.find((s) => s.id === id);
      if (!item) return p;
      return {
        ...p,
        schedule: p.schedule.filter((s) => s.id !== id),
        bin: [...p.bin, { ...binBase(), type: "sched" as const, data: item }],
      };
    });
  }, []);

  /* ─── trash ───────────────────────────────────────────── */

  const restoreFromBin = useCallback((entry: BinEntry) => {
    setData((p) => {
      const bin = p.bin.filter((b) => b.binId !== entry.binId);
      switch (entry.type) {
        case "learned":
          return { ...p, bin, learned: [entry.data, ...p.learned] };
        case "note-general":
          return { ...p, bin, general: [entry.data, ...p.general] };
        case "target":
          return { ...p, bin, targets: [...p.targets, entry.data] };
        case "group":
          return { ...p, bin, groups: [...p.groups, entry.data] };
        case "sched":
          return { ...p, bin, schedule: [...p.schedule, entry.data].sort(byTime) };
        case "note-group": {
          const { gid } = entry.meta;
          const groupExists = gid !== undefined && p.groups.some((g) => g.id === gid);
          if (groupExists) {
            return {
              ...p,
              bin,
              groups: p.groups.map((g) =>
                g.id === gid ? { ...g, notes: [entry.data, ...g.notes] } : g,
              ),
            };
          }
          // The owning group is gone, so land the note in General rather than
          // dropping it.
          return { ...p, bin, general: [entry.data, ...p.general] };
        }
      }
    });
  }, []);

  const permDelete = useCallback((binId: string) => {
    setData((p) => ({ ...p, bin: p.bin.filter((b) => b.binId !== binId) }));
  }, []);

  const emptyBin = useCallback(() => {
    setData((p) => ({ ...p, bin: [] }));
  }, []);

  /* ─── snapshot / sync ─────────────────────────────────── */

  const replaceSnapshot = useCallback((next: Snapshot) => {
    setData(next.data);
    setUserName(next.userName);
    setAvatar(next.avatar);
  }, []);

  const pushToRemote = useCallback(async () => {
    if (!remoteAdapter) return;
    setSyncState({ status: "syncing" });
    try {
      await remoteAdapter.push(snapshotRef.current);
      setSyncState({ status: "synced", at: Date.now() });
    } catch (err) {
      setSyncState({
        status: "error",
        message: err instanceof Error ? err.message : "Sync gagal.",
      });
    }
  }, []);

  const pullFromRemote = useCallback(async () => {
    if (!remoteAdapter) return;
    setSyncState({ status: "syncing" });
    try {
      const remote = await remoteAdapter.pull();
      if (!remote) {
        setSyncState({ status: "error", message: "Belum ada backup di server." });
        return;
      }
      replaceSnapshot(remote);
      setSyncState({ status: "synced", at: Date.now() });
    } catch (err) {
      setSyncState({
        status: "error",
        message: err instanceof Error ? err.message : "Sync gagal.",
      });
    }
  }, [replaceSnapshot]);

  const dismissPersistError = useCallback(() => setPersistError(null), []);

  return {
    data,
    userName,
    avatar,
    doneCount,
    totalCount,
    pct,
    allNotesCount,
    todayLearned,
    activeBin,
    persistError,
    dismissPersistError,
    syncState,
    isRemoteEnabled: remoteAdapter !== null,
    pushToRemote,
    pullFromRemote,
    snapshot,
    replaceSnapshot,
    setUserName,
    setAvatar,
    addGroup,
    addNote,
    addLearn,
    addTarget,
    addSched,
    applyEdit,
    toggleTarget,
    toggleSched,
    delGroup,
    delNote,
    delGeneral,
    delLearned,
    delTarget,
    delSched,
    restoreFromBin,
    permDelete,
    emptyBin,
  };
};
