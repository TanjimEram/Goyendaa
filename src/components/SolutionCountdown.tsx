"use client";

import { useSyncExternalStore } from "react";

function remaining(target: number, now: number) {
  const ms = Math.max(0, target - now);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { ms, h, m, s };
}

/** A once-a-second clock, exposed as an external store so React can
 *  subscribe without an effect. The server snapshot is null so the first
 *  paint matches the server HTML, then the client takes over. */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}
const getNow = () => Date.now();
const getServerNow = () => null;

/** Live "solution arrives in 2h 41m" readout. */
export function SolutionCountdown({
  solutionAt,
  fallback,
}: {
  solutionAt: string;
  /** Text to show until the client clock starts, e.g. "at 9:42 PM". */
  fallback: string;
}) {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);

  if (now === null) return <span>{fallback}</span>;

  const { ms, h, m, s } = remaining(new Date(solutionAt).getTime(), now);
  if (ms === 0) return <span className="text-brass">any moment now</span>;

  const parts =
    h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s`;
  return (
    <span className="font-mono tabular-nums text-brass" aria-live="off">
      in {parts}
    </span>
  );
}
