"use client";
/**
 * MOCKUP ONLY: the .tx-mock wrapper (every texture is CSS keyed off its data
 * attributes) plus the floating control panel. The wrapper is server-rendered
 * with the defaults, so the textures show before, and without, JavaScript.
 */
import { useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

const noop = () => () => {};
/** "" on capable devices, else the reasons (a string, so the snapshot is stable). */
function detectLowEnd() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return [
    nav.connection?.saveData && "Save-Data",
    (nav.hardwareConcurrency ?? 8) <= 4 && `${nav.hardwareConcurrency} cores`,
    (nav.deviceMemory ?? 8) <= 2 && `${nav.deviceMemory} GB`,
  ]
    .filter(Boolean)
    .join(", ");
}

type Intensity = "off" | "subtle" | "medium";
type Dot = "neutral" | "gold" | "red";
const PLACEMENTS = [
  ["hero", "1 · Hero"],
  ["sections", "2 · Section transitions"],
  ["cards", "3 · Case cards"],
  ["buttons", "4 · Buy button + badges"],
  ["footer", "5 · Footer"],
  ["social", "6 · Social previews"],
] as const;
type Placement = (typeof PLACEMENTS)[number][0];
/** Recommended starting opacity per dot colour (brass and blood stay in the 6–10% band). */
const DOT_ALPHA: Record<Dot, number> = { neutral: 0.1, gold: 0.08, red: 0.08 };

export type TxInitial = {
  intensity: Intensity;
  compare: boolean;
  dot: Dot;
  dotSize: number;
  dotAlpha: number;
  saveData: boolean;
  open: boolean;
  off: Placement[];
};

export function TextureStage({ initial, children }: { initial: TxInitial; children: ReactNode }) {
  const [intensity, setIntensity] = useState(initial.intensity);
  const [compare, setCompare] = useState(initial.compare);
  const [on, setOn] = useState<Record<Placement, boolean>>(
    () => Object.fromEntries(PLACEMENTS.map(([k]) => [k, !initial.off.includes(k)])) as Record<Placement, boolean>,
  );
  const [dot, setDot] = useState(initial.dot);
  const [dotSize, setDotSize] = useState(initial.dotSize);
  const [dotAlpha, setDotAlpha] = useState(initial.dotAlpha);
  const [simReduced, setSimReduced] = useState(false);
  const [simLowEnd, setSimLowEnd] = useState(false);
  const [open, setOpen] = useState(initial.open);
  // Low-end check on the device itself; the server already read the Save-Data header.
  const detected = useSyncExternalStore(noop, detectLowEnd, () => "");
  const why = [initial.saveData && "Save-Data header", detected].filter(Boolean).join(", ");
  const device = { lowEnd: why.length > 0, why };

  const lite = device.lowEnd || simLowEnd;
  const attrs: Record<string, string | undefined> = {
    "data-tx": compare ? "off" : intensity,
    "data-dot": dot,
    "data-lite": lite ? "1" : undefined,
    "data-still": simReduced ? "1" : undefined,
  };
  for (const [k] of PLACEMENTS) attrs[`data-${k}`] = on[k] ? "on" : "off";

  return (
    <div
      className="tx-mock flex flex-1 flex-col"
      {...attrs}
      style={{ "--tx-dot-size": `${dotSize}px`, "--tx-dot-a": dotAlpha } as CSSProperties}
    >
      {children}

      <div className="fixed right-3 bottom-3 z-[70] max-h-[85svh] w-64 overflow-y-auto border border-noir-line bg-noir-raised/95 font-mono text-[11px] text-cream shadow-stamp">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between px-3 py-2 uppercase tracking-[0.16em] text-brass"
        >
          Texture mockup
          <span aria-hidden>{open ? "–" : "+"}</span>
        </button>
        {open && (
          <div className="flex flex-col gap-3 border-t border-noir-line px-3 py-3">
            <Check label="Compare: show current site" on={compare} set={setCompare} />
            <Row label="Intensity">
              <Seg value={intensity} options={["off", "subtle", "medium"] as Intensity[]} onChange={setIntensity} />
            </Row>
            <div className="flex flex-col gap-1.5">
              {PLACEMENTS.map(([k, label]) => (
                <Check key={k} label={label} on={on[k]} set={(v) => setOn((p) => ({ ...p, [k]: v }))} />
              ))}
            </div>
            <Row label={`Dot size · ${dotSize}px`}>
              <input type="range" aria-label="Dot size" min={6} max={12} step={1} value={dotSize} onChange={(e) => setDotSize(+e.target.value)} className="accent-brass" />
            </Row>
            <Row label={`Dot opacity · ${Math.round(dotAlpha * 100)}%`}>
              <input type="range" aria-label="Dot opacity" min={0.02} max={0.3} step={0.01} value={dotAlpha} onChange={(e) => setDotAlpha(+e.target.value)} className="accent-brass" />
            </Row>
            <Row label="Dot colour">
              <Seg
                value={dot}
                options={["neutral", "gold", "red"] as Dot[]}
                onChange={(d) => {
                  setDot(d);
                  setDotAlpha(DOT_ALPHA[d]);
                }}
              />
            </Row>
            <div className="flex flex-col gap-1.5 border-t border-noir-line pt-2">
              <Check label="Simulate reduced motion" on={simReduced} set={setSimReduced} />
              <Check label="Simulate low-end device" on={simLowEnd} set={setSimLowEnd} />
            </div>
            <p className="text-ash">
              {lite ? "Low-end: grain only on large areas" : "Full textures"}
              {device.lowEnd && ` (detected: ${device.why})`}
            </p>
          </div>
        )}
      </div>
    </div>
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
