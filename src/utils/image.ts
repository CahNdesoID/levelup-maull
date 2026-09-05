/**
 * Avatar image handling.
 *
 * A photo straight off a phone camera is several megabytes, and base64 inflates
 * it by roughly a third. Writing that into `localStorage` (a ~5MB budget for the
 * whole origin) would evict the user's actual notes, so every upload is
 * downscaled and re-encoded before it is ever handed to the store.
 */

const MAX_EDGE = 512;
const JPEG_QUALITY = 0.85;

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("File itu bukan gambar yang valid."));
    img.onload = () => resolve(img);
    img.src = src;
  });

/**
 * Returns a JPEG data URL whose longest edge is at most `MAX_EDGE` px.
 * Falls back to the original data URL if the browser cannot give us a 2D
 * context (very old engines, or canvas disabled by a privacy extension).
 */
export const downscaleToDataUrl = async (file: File): Promise<string> => {
  const original = await readAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return original;

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
};
