/**
 * Thin, failure-aware wrapper around `localStorage`.
 *
 * The previous helpers swallowed every write error, so a photo that blew past
 * the origin quota simply never persisted and the user was never told. Writes
 * now report the reason so the UI can surface it.
 */

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "quota" | "unavailable"; message: string };

const isQuotaError = (err: unknown): boolean => {
  if (!(err instanceof DOMException)) return false;
  // Firefox and Chrome/Safari report the same condition under different names.
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22
  );
};

export const loadRaw = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Corrupt JSON, or storage blocked entirely (private mode / cookies off).
    return fallback;
  }
};

export const saveRaw = (key: string, value: unknown): SaveResult => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    if (isQuotaError(err)) {
      return {
        ok: false,
        reason: "quota",
        message:
          "Penyimpanan browser penuh. Hapus foto profil atau kosongkan Trash, lalu coba lagi.",
      };
    }
    return {
      ok: false,
      reason: "unavailable",
      message:
        "Browser memblokir penyimpanan lokal, jadi perubahan tidak tersimpan.",
    };
  }
};

export const removeRaw = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing useful to do — the value is already unreachable.
  }
};
