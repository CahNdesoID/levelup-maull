/**
 * Identifier generation.
 *
 * The previous implementation used `Date.now()`, which collides whenever two
 * entities are created inside the same millisecond (a double-tap on "Save", or
 * two items added in one batched React update). A collision silently corrupts
 * edit/delete, because those look items up by id.
 */

/**
 * `crypto.randomUUID` only exists in secure contexts (https, or localhost).
 * Opening the dev server over a LAN IP on plain http leaves it undefined, so
 * fall back to `getRandomValues` and finally to a non-crypto random string.
 */
export const createId = (): string => {
  const c: Crypto | undefined = globalThis.crypto;

  if (typeof c?.randomUUID === "function") return c.randomUUID();

  if (typeof c?.getRandomValues === "function") {
    const bytes = c.getRandomValues(new Uint8Array(16));
    // Stamp RFC 4122 version 4 and the variant bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
