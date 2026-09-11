/**
 * Storage bucket names and URL/path helpers. Shared by the browser upload
 * component and the server actions, so keep this free of server-only imports.
 */

/** Public bucket: thumbnails and gallery images. Stored as public URLs. */
export const MEDIA_BUCKET = "case-media";
/** Private bucket: case + solution PDFs. Stored as object paths. */
export const FILES_BUCKET = "case-files";

/**
 * Public URLs look like
 *   https://<ref>.supabase.co/storage/v1/object/public/case-media/<path>
 * Returns `<path>`, or null if the URL isn't from that bucket.
 */
export function publicUrlToPath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** "My Photo (1).JPG" → "my-photo-1.jpg" — safe as a storage object key. */
export function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  const cleanBase =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file";
  return ext ? `${cleanBase}.${ext}` : cleanBase;
}
