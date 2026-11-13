// One-off: bakes the seamless film-grain tile used by the texture mockup.
//   node scripts/make-grain-tile.mjs  →  public/textures/grain.webp
//
// The tile is transparent noise: each pixel is white (lighter grain) or black (darker
// grain) with an alpha that follows the noise strength. Laid over any colour it reads
// as grain with no blend mode at all, so pages pay for one decoded 200×200 image and
// a plain background layer, nothing per frame.
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const N = 200;
const SEED = 7;
// Light specks are kept weaker than dark ones: on a charcoal page every white speck shows and
// lifts the blacks, while dark specks only deepen them.
const MAX_LIGHT = 0.035 * 255; // keeps small text-ash copy at AA over the grain
const MAX_DARK = 0.2 * 255;
const LEVELS = 5;

// Deterministic PRNG (mulberry32) + Box-Muller, so the tile is reproducible.
let s = SEED;
const rand = () => {
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());

// Noise on a torus, softened by a wrap-around 3×3 kernel (clumpier, filmic, still seamless).
const raw = Float32Array.from({ length: N * N }, gauss);
const at = (x, y) => raw[((y + N) % N) * N + ((x + N) % N)];
const K = [1, 2, 1, 2, 4, 2, 1, 2, 1];
const soft = new Float32Array(N * N);
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    let v = 0;
    for (let k = 0; k < 9; k++) v += K[k] * at(x + (k % 3) - 1, y + Math.floor(k / 3) - 1);
    soft[y * N + x] = (v / 16) * 0.55 + raw[y * N + x] * 0.45;
  }
let peak = 0;
for (const v of soft) peak = Math.max(peak, Math.abs(v));

const rgba = Buffer.alloc(N * N * 4);
for (let i = 0; i < N * N; i++) {
  const v = soft[i] / peak; // −1 … 1
  const c = v > 0 ? 255 : 0;
  rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = c;
  // Five alpha levels: invisible as banding at this strength, and what keeps the
  // lossless file small (full-precision alpha noise is ~35 KB; this is ~13 KB).
  const a = Math.round(Math.min(1, Math.abs(v) * 1.6) * (LEVELS - 1)) / (LEVELS - 1);
  rgba[i * 4 + 3] = Math.round(a * (v > 0 ? MAX_LIGHT : MAX_DARK));
}

mkdirSync("public/textures", { recursive: true });
const out = "public/textures/grain.webp";
await sharp(rgba, { raw: { width: N, height: N, channels: 4 } })
  .webp({ lossless: true, effort: 6 })
  .toFile(out);
console.log(out, statSync(out).size, "bytes");
