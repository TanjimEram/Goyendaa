"use client";
/**
 * MOCKUP ONLY: swaps the current hero for the enhanced one and floats a
 * small control panel in the corner. Never part of the real hero.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FxSettingsContext, type FxReport, type FxSettings, type Intensity } from "./Evidence";

export function MockupStage({
  current,
  enhanced,
  initial,
  initialHero,
  initialOpen,
}: {
  current: ReactNode;
  enhanced: ReactNode;
  initial: FxSettings;
  initialHero: "current" | "enhanced";
  initialOpen: boolean;
}) {
  const [settings, setSettings] = useState(initial);
  const [hero, setHero] = useState(initialHero);
  const [open, setOpen] = useState(initialOpen);
  const [fps, setFps] = useState(0);
  const [info, setInfo] = useState<FxReport | null>(null);
  const reportRef = useRef<Partial<FxReport>>({});

  // The hook reports into a ref; the panel reads it on its own 2 Hz tick, so
  // reporting never re-renders anything.
  const report = useCallback((r: Partial<FxReport>) => {
    reportRef.current = { ...reportRef.current, ...r };
  }, []);
  const ctx = useMemo(() => ({ settings, report }), [settings, report]);

  // FPS: frames counted over 500 ms. (This counter is itself a rAF loop:
  // with the panel collapsed it stops, so measure the effects with it closed.)
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let frames = 0;
    let t0 = performance.now();
    const tick = (now: number) => {
      frames++;
      if (now - t0 >= 500) {
        setFps(Math.round((frames * 1000) / (now - t0)));
        setInfo({ ...(reportRef.current as FxReport) });
        frames = 0;
        t0 = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const set = <K extends keyof FxSettings>(k: K, v: FxSettings[K]) => setSettings((p) => ({ ...p, [k]: v }));

  return (
    <FxSettingsContext.Provider value={ctx}>
      {hero === "current" ? current : enhanced}

      <div className="fixed right-3 bottom-3 z-[70] w-60 border border-noir-line bg-noir-raised/95 font-mono text-[11px] text-cream shadow-stamp">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 uppercase tracking-[0.16em] text-brass"
          aria-expanded={open}
        >
          Hero mockup
          <span aria-hidden>{open ? "–" : "+"}</span>
        </button>
        {open && (
          <div className="flex flex-col gap-3 border-t border-noir-line px-3 py-3">
            <Row label="Hero">
              <Seg value={hero} options={["current", "enhanced"]} onChange={setHero} />
            </Row>
            <Row label="Intensity">
              <Seg value={settings.intensity} options={["off", "subtle", "medium"] as Intensity[]} onChange={(v) => set("intensity", v)} />
            </Row>
            <div className="flex flex-col gap-1.5">
              <Check label="Grain" on={settings.grain} set={(v) => set("grain", v)} />
              <Check label="Blinds" on={settings.blinds} set={(v) => set("blinds", v)} />
              <Check label="Parallax items" on={settings.parallax} set={(v) => set("parallax", v)} />
              <Check label="Simulate reduced motion" on={settings.simulateReduced} set={(v) => set("simulateReduced", v)} />
              <Check label="Ignore low-end cap" on={settings.ignoreLowEnd} set={(v) => set("ignoreLowEnd", v)} />
            </div>
            <div className="border-t border-noir-line pt-2 text-ash">
              <div>
                <span className="text-cream">{fps}</span> fps
                {info?.looping ? " · parallax loop on" : " · loop idle"}
              </div>
              {hero === "enhanced" && info && (
                <div>
                  running: <span className="text-cream">{info.effective}</span>
                  {info.lowEnd && " (low-end cap)"}
                  {info.reducedOs && " · OS reduced motion"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FxSettingsContext.Provider>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="uppercase tracking-[0.16em] text-ash">{label}</span>
      {children}
    </div>
  );
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex border border-noir-line">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`flex-1 px-1.5 py-1 capitalize ${value === o ? "bg-brass text-noir" : "text-cream hover:text-brass"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Check({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="accent-brass" />
      {label}
    </label>
  );
}
