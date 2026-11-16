/**
 * Browser-only: true when the visitor asked to save data or the phone is low-end (≤4 cores or ≤2 GB).
 * Drives the lighter print textures (LowEndFlag → html[data-lite]) and skips the hero video.
 * The Save-Data request header is handled separately on the server (root layout).
 */
export function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return !!nav.connection?.saveData || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 2;
}
