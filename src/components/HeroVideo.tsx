"use client";
/**
 * The hero's background loop (a noir flip-book of case panels, built in
 * Goyenda-Studio/Reels/hero-intro). Decorative only: muted, aria-hidden,
 * never carries information.
 *
 * It starts with no src, so nothing downloads until this runs; the poster
 * (the loop's first frame) is painted by the server-rendered <picture>
 * underneath. Skipped entirely for reduced motion, Save-Data and low-end
 * phones, which keep the poster. Paused while the hero is off screen or the
 * tab is hidden.
 */
import { useEffect, useRef } from "react";
import { isLowEndDevice } from "@/lib/low-end";

export const HERO_VIDEO = {
  wide: "/hero/hero-intro-1920x1080.mp4",
  tall: "/hero/hero-intro-720x1280.mp4",
};

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = document.documentElement.dataset.lite === "1"; // set from the Save-Data header
    if (saveData || isLowEndDevice() || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.src = matchMedia("(max-width: 767px)").matches ? HERO_VIDEO.tall : HERO_VIDEO.wide;
    let onScreen = true;
    const sync = () => {
      if (onScreen && !document.hidden) video.play().catch(() => {}); // autoplay refused: the poster stays
      else video.pause();
    };
    const show = () => (video.style.opacity = "1");
    video.addEventListener("playing", show, { once: true });
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.removeEventListener("playing", show);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 -z-20 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-noir"
    />
  );
}
