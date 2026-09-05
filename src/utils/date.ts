/**
 * Date handling.
 *
 * Entities store an ISO calendar date (`YYYY-MM-DD`). Earlier builds stored a
 * bare `"17 May"` label, which carried no year — so entries from different
 * years sorted as if they belonged to the same one, and the Learning Log could
 * interleave them. ISO strings also sort lexicographically in chronological
 * order, which removes the need for a comparison helper entirely.
 *
 * These are functions rather than module-level constants on purpose: the very
 * first version computed "today" once at import time, so an app left open
 * overnight kept filing new entries under the previous day.
 */

export const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const MSHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Matches the stored format, `YYYY-MM-DD`. */
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const pad = (n: number): string => String(n).padStart(2, "0");

/** Local-time ISO calendar date. Deliberately not `toISOString()`, which is UTC
 *  and would roll the date over for anyone east or west of Greenwich. */
export const toIso = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayIso = (): string => toIso(new Date());

export const daysAgoIso = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toIso(d);
};

/** Returns null for anything that is not a real `YYYY-MM-DD` date. */
export const parseIso = (iso: string): Date | null => {
  if (!ISO_DATE_RE.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // Rejects impossible dates like 2026-02-31, which Date silently rolls over.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
};

/** "5 Sep" */
export const isoToShort = (iso: string): string => {
  const d = parseIso(iso);
  return d ? `${d.getDate()} ${MSHORT[d.getMonth()]}` : iso;
};

/** "5 Sep 2026" */
export const isoToLong = (iso: string): string => {
  const d = parseIso(iso);
  return d ? `${d.getDate()} ${MSHORT[d.getMonth()]} ${d.getFullYear()}` : iso;
};

/**
 * Compact label for list rows: the year is shown only when it differs from the
 * current one, so old entries stay unambiguous without cluttering today's.
 */
export const isoToDisplay = (iso: string): string => {
  const d = parseIso(iso);
  if (!d) return iso;
  return d.getFullYear() === new Date().getFullYear() ? isoToShort(iso) : isoToLong(iso);
};

/** Hero pill on Home, e.g. "Sat · 5 Sep 2026". */
export const heroDate = (d: Date = new Date()): string =>
  `${DAYS[d.getDay()].slice(0, 3)} · ${d.getDate()} ${MSHORT[d.getMonth()]} ${d.getFullYear()}`;

/** Schedule subtitle, e.g. "Saturday, 5 September 2026". */
export const schedDate = (d: Date = new Date()): string =>
  `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/**
 * Upgrades a legacy `"17 May"` label to an ISO date.
 *
 * The label has no year, so one is inferred: the most recent occurrence of that
 * day and month at or before `now`. A label reading a date later in the
 * calendar than today therefore resolves to last year. That is a heuristic — an
 * entry back-dated more than a year cannot be recovered exactly — but it orders
 * existing data correctly, which the yearless format could not do at all.
 */
export const legacyLabelToIso = (label: string, now: Date = new Date()): string | null => {
  const [dayPart, monthPart] = label.trim().split(/\s+/);
  const monthIndex = MSHORT.indexOf(monthPart as (typeof MSHORT)[number]);
  const day = Number.parseInt(dayPart, 10);
  if (monthIndex < 0 || Number.isNaN(day) || day < 1 || day > 31) return null;

  const candidate = new Date(now.getFullYear(), monthIndex, day);
  if (candidate.getDate() !== day) return null; // e.g. "31 Feb"
  if (candidate.getTime() > now.getTime()) candidate.setFullYear(now.getFullYear() - 1);
  return toIso(candidate);
};
