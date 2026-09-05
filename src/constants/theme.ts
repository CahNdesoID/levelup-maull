/** Design tokens. Every colour in the app resolves through this object. */
export const T = {
  bg: "#EAE4D8",
  surf: "#FDFCF9",
  green: "#0B3D28",
  yellow: "#EDD800",
  sage: "#A8D4BC",
  peach: "#F6B89A",
  lav: "#C8B8FF",
  sky: "#8DCFF5",
  text: "#1A1A1A",
  muted: "#9CA3AF",
  border: "#E8E2D6",
  red: "#E05C5C",
  /** "Completed" accent, used by checkmarks and progress fills. */
  success: "#4DBF8A",
} as const;

/** Cycled through when a new note group is created. */
export const GRP_COLORS: string[] = [
  T.sage,
  T.peach,
  T.lav,
  T.sky,
  "#FFD6A5",
  "#F9C5D1",
];

export const MAX_CONTENT_WIDTH = 640;

/** How long a soft-deleted item stays restorable. */
export const TRASH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
