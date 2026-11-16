"use client";
import { useEffect } from "react";
import { isLowEndDevice } from "@/lib/low-end";

/**
 * Marks <html data-lite> on low-end phones and when the browser asks to save
 * data. CSS then drops the halftone dots on large areas and keeps only the
 * grain (globals.css, "PRINT TEXTURES"). Renders nothing.
 */
export function LowEndFlag() {
  useEffect(() => {
    if (isLowEndDevice()) document.documentElement.dataset.lite = "1";
  }, []);
  return null;
}
