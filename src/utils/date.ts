/**
 * Date helpers.
 *
 * These are functions rather than module-level constants on purpose: the old
 * code computed `TODAY` once at import time, so an app left open overnight kept
 * filing new entries under the previous day.
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

/** Storage label for a date, e.g. "17 May". */
export const fmt = (d: Date = new Date()): string =>
  `${d.getDate()} ${MSHORT[d.getMonth()]}`;

/** The label new entries are stamped with. Recomputed on every call. */
export const todayLabel = (): string => fmt(new Date());

/** Hero pill on Home, e.g. "Mon · 5 Sep 2026". */
export const heroDate = (d: Date = new Date()): string =>
  `${DAYS[d.getDay()].slice(0, 3)} · ${fmt(d)} ${d.getFullYear()}`;

/** Schedule subtitle, e.g. "Monday, 5 September 2026". */
export const schedDate = (d: Date = new Date()): string =>
  `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** A date `n` days before today, as a storage label. */
export const daysAgoLabel = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
};

/**
 * Sort key for a "D Mon" label. Higher is more recent *within a single year*.
 *
 * Known limitation: the stored format carries no year, so labels from different
 * years compare as if they were the same year. Fixing it properly means adding
 * an ISO timestamp to every entity, which is a data-model change rather than a
 * refactor, so it is deliberately left alone here.
 */
export const dateScore = (label: string): number => {
  const [day, month] = label.split(" ");
  const monthIndex = MSHORT.indexOf(month as (typeof MSHORT)[number]);
  const dayNumber = Number.parseInt(day, 10);
  if (monthIndex < 0 || Number.isNaN(dayNumber)) return -1;
  return monthIndex * 31 + dayNumber;
};
