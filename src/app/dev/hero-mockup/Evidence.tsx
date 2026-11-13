"use client";
/**
 * Floating evidence + the one small hook that runs every hero effect.
 *
 * The hook owns the data-fx-* attributes on the hero <section> (CSS in
 * hero-fx.css does the rest) and one requestAnimationFrame loop for the
 * parallax. The loop only runs while something is still easing toward its
 * target, and only while the hero is on screen in a visible tab.
 *
 * FxSettingsContext is the mockup control panel's way in; without a
 * provider (i.e. in the real hero) the defaults below apply.
 */
import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Fingerprint, Magnifier, SuspectHat, Suspect, TornNote } from "./evidence-art";

export type Intensity = "off" | "subtle" | "medium";
export type FxSettings = {
  intensity: Intensity;
  grain: boolean;
  blinds: boolean;
  parallax: boolean;
  simulateReduced: boolean;
  ignoreLowEnd: boolean;
};
export type FxReport = { lowEnd: boolean; reducedOs: boolean; effective: Intensity; looping: boolean };

export const DEFAULT_FX: FxSettings = {
  intensity: "subtle",
  grain: true,
  blinds: true,
  parallax: true,
  simulateReduced: false,
  ignoreLowEnd: false,
};
export const FxSettingsContext = createContext<{ settings: FxSettings; report?: (r: Partial<FxReport>) => void }>({
  settings: DEFAULT_FX,
});

/** Max pointer travel (px) for the nearest layer; deeper layers scale down by depth. */
const PARALLAX_PX: Record<Intensity, number> = { off: 0, subtle: 8, medium: 16 };
/** Max scroll drift (px) for the nearest layer. Kept small: on phones the items sit in a ~90px band. */
const SCROLL_PX = 12;

type Item = { key: string; cls: string; depth: number; o: number; dur: number; delay: number; art: ReactNode };
const ITEMS: Item[] = [
  { key: "hat", cls: "fx-i-hat", depth: 0.45, o: 0.9, dur: 11, delay: -3, art: <SuspectHat /> },
  { key: "print", cls: "fx-i-print", depth: 0.3, o: 0.55, dur: 13, delay: -7, art: <Fingerprint /> },
  { key: "glass", cls: "fx-i-glass", depth: 0.8, o: 0.85, dur: 9, delay: -2, art: <Magnifier /> },
  { key: "note", cls: "fx-i-note", depth: 1, o: 0.7, dur: 10, delay: -5, art: <TornNote /> },
  { key: "sus", cls: "fx-i-sus", depth: 0.6, o: 0.85, dur: 12, delay: -9, art: <Suspect /> },
];

export function Evidence() {
  const ref = useRef<HTMLDivElement>(null);
  const { settings: s, report } = useContext(FxSettingsContext);

  useEffect(() => {
    const root = ref.current;
    const section = root?.closest("section");
    if (!root || !section) return;
    const ds = section.dataset;

    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowEnd =
      ds.fxLite === "1" || // Save-Data request header, read on the server
      !!nav.connection?.saveData ||
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 2;
    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

    const effective: Intensity = s.intensity === "off" ? "off" : lowEnd && !s.ignoreLowEnd ? "subtle" : s.intensity;
    ds.fx = effective;
    ds.fxGrain = s.grain ? "on" : "off";
    ds.fxBlinds = s.blinds ? "on" : "off";
    ds.fxParallax = s.parallax ? "on" : "off";

    const items = [...root.querySelectorAll<HTMLElement>("[data-depth]")].map((el) => ({ el, d: Number(el.dataset.depth) }));
    let still = false;
    let inView = true;
    let visible = !document.hidden;
    let raf = 0;
    const cur = { x: 0, y: 0, s: 0 };
    const tgt = { x: 0, y: 0, s: 0 };
    const amp = PARALLAX_PX[effective];
    const moving = () => effective !== "off" && s.parallax && !still;
    const live = () => moving() && inView && visible;

    const paint = () => {
      for (const { el, d } of items) {
        el.style.transform = `translate3d(${(cur.x * d).toFixed(2)}px,${((cur.y + cur.s) * d).toFixed(2)}px,0)`;
      }
    };
    const frame = () => {
      raf = 0;
      cur.x += (tgt.x - cur.x) * 0.08;
      cur.y += (tgt.y - cur.y) * 0.08;
      cur.s += (tgt.s - cur.s) * 0.12;
      paint();
      if (Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) + Math.abs(tgt.s - cur.s) > 0.05) kick();
      else report?.({ looping: false });
    };
    const kick = () => {
      if (!raf && live()) {
        raf = requestAnimationFrame(frame);
        report?.({ looping: true });
      }
    };
    const sync = () => {
      still = s.simulateReduced || reduceMq.matches;
      if (still) ds.fxStill = "1";
      else delete ds.fxStill;
      if (inView && visible) delete ds.fxPaused;
      else ds.fxPaused = "1";
      if (!live()) {
        cancelAnimationFrame(raf);
        raf = 0;
        report?.({ looping: false });
      }
      if (!moving()) {
        cur.x = cur.y = cur.s = tgt.x = tgt.y = tgt.s = 0;
        paint();
      }
      report?.({ lowEnd, reducedOs: reduceMq.matches, effective });
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tgt.x = (e.clientX / innerWidth - 0.5) * -2 * amp;
      tgt.y = (e.clientY / innerHeight - 0.5) * -2 * amp;
      kick();
    };
    const onScroll = () => {
      const top = section.getBoundingClientRect().top;
      tgt.s = Math.min(Math.max(-top, 0) * 0.03, SCROLL_PX);
      kick();
    };
    const onVisibility = () => {
      visible = !document.hidden;
      sync();
      kick();
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
      kick();
    });

    io.observe(section);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMq.addEventListener("change", sync);
    if (fine) addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    sync();
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMq.removeEventListener("change", sync);
      removeEventListener("pointermove", onPointer);
      removeEventListener("scroll", onScroll);
    };
  }, [s, report]);

  return (
    <div ref={ref} aria-hidden className="fx-layer fx-evidence">
      {ITEMS.map((it) => (
        <div key={it.key} className={`fx-item ${it.cls}`} data-depth={it.depth} style={{ "--o": it.o } as CSSProperties}>
          <div className="fx-anim fx-float" style={{ "--d": `${it.dur}s`, "--delay": `${it.delay}s` } as CSSProperties}>
            {it.art}
          </div>
        </div>
      ))}
    </div>
  );
}
