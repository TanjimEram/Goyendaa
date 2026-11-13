/**
 * Placeholder evidence art for the hero mockup: flat inline SVGs in the
 * brand palette (Tailwind fill-/stroke- token classes, no raw hex).
 * Each one is a drop-in slot: swap the SVG body for a real asset later.
 */

/** Latent print: broken concentric ridges around a whorl. */
export function Fingerprint() {
  const ridges = Array.from({ length: 10 }, (_, i) => i);
  return (
    <svg viewBox="0 0 100 120">
      <g className="fill-none stroke-cream" strokeWidth={1.7} strokeLinecap="round">
        {ridges.map((i) => (
          <ellipse
            key={i}
            cx={50}
            cy={62}
            rx={5 + i * 4.3}
            ry={7 + i * 5.3}
            transform={`rotate(${-8 + i * 1.5} 50 62)`}
            strokeDasharray={`${18 + ((i * 7) % 13)} ${3 + (i % 3) * 2} ${9 + ((i * 5) % 11)} 4`}
            strokeDashoffset={i * 9}
          />
        ))}
      </g>
    </svg>
  );
}

/** Magnifying glass, brass rim, faint lens glint. */
export function Magnifier() {
  return (
    <svg viewBox="0 0 140 140">
      <path d="M86 86 L128 128" className="stroke-brass-dim" strokeWidth={14} strokeLinecap="round" />
      <path d="M84 84 L96 96" className="stroke-brass" strokeWidth={16} strokeLinecap="butt" />
      <circle cx={56} cy={56} r={40} className="fill-noir/40 stroke-brass" strokeWidth={7} />
      <path d="M34 44 A26 26 0 0 1 52 30" className="fill-none stroke-cream/50" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/** Torn clue note: jagged top edge, ruled lines, redaction bars. */
export function TornNote() {
  return (
    <svg viewBox="0 0 170 200">
      <g transform="rotate(-6 85 100)">
        <polygon
          points="10,24 22,12 35,22 48,9 62,20 77,8 92,19 107,8 121,21 136,10 150,20 162,13 162,190 10,190"
          className="fill-cream"
        />
        {[44, 62, 80, 98, 116, 134, 152, 170].map((y, i) => (
          <rect key={y} x={22} y={y} width={i % 3 === 2 ? 84 : 124} height={3} className="fill-ash/60" />
        ))}
        <rect x={52} y={58} width={70} height={11} className="fill-noir" />
        <rect x={22} y={94} width={48} height={11} className="fill-noir" />
        <rect x={84} y={130} width={62} height={11} className="fill-noir" />
        <rect x={22} y={174} width={58} height={4} className="fill-blood" />
      </g>
    </svg>
  );
}

/** "?" drawn as a stroke, so it needs no font. */
function Question({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 9 C0 2 5 -2 11 -2 C18 -2 22 2 22 8 C22 14 17 16 13 19 C11 21 11 23 11 26" className="fill-none stroke-blood" strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={11} cy={34} r={3} className="fill-blood" />
    </g>
  );
}

/** Suspect silhouette, bare-headed. No features, ever. */
export function Suspect() {
  return (
    <svg viewBox="0 0 100 116">
      <path
        d="M50 14 a20 22 0 1 1 -0.1 0 Z M12 116 C12 86 28 70 50 70 C72 70 88 86 88 116 Z"
        className="fill-noir-raised stroke-brass/60"
        strokeWidth={2}
      />
      <Question x={39} y={26} />
    </svg>
  );
}

/** Suspect silhouette in a fedora. */
export function SuspectHat() {
  return (
    <svg viewBox="0 0 100 116">
      <path
        d="M50 24 a18 20 0 1 1 -0.1 0 Z M14 116 C14 88 30 74 50 74 C70 74 86 88 86 116 Z"
        className="fill-noir-raised stroke-brass/60"
        strokeWidth={2}
      />
      <path d="M33 26 C33 8 40 4 50 4 C60 4 67 8 67 26 Z" className="fill-noir stroke-brass/60" strokeWidth={2} />
      <ellipse cx={50} cy={27} rx={31} ry={5} className="fill-noir stroke-brass/60" strokeWidth={2} />
      <Question x={39} y={38} />
    </svg>
  );
}
