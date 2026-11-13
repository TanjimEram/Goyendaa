"use client";
import { useEffect } from "react";

/**
 * Marks <html data-lite> on low-end phones (≤4 cores or ≤2 GB) and when the
 * browser asks to save data. CSS then drops the halftone dots on large areas
 * and keeps only the grain (globals.css, "PRINT TEXTURES"). The Save-Data
 * request header is already handled on the server in the root layout; this
 * covers what only the device knows. Renders nothing.
 */
export function LowEndFlag() {
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 2) {
      document.documentElement.dataset.lite = "1";
    }
  }, []);
  return null;
}
