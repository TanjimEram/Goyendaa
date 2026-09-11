# Goyenda — Visual Style Guide

Retro-modern noir for a site that sells fictional detective case files.

> **Voice in one line:** a modern editorial magazine that happens to be printing a police file.

**Reconciliation note (2026-09-11):** this guide was rewritten during the project reset. The palette, fonts and brand name now match `CLAUDE.md` exactly — `CLAUDE.md` is the source of truth. The earlier version targeted a different brand ("The Closed Case") and a vintage 1985-photocopy look; that framing is retired. The component rules below survived the rewrite because they still hold.

---

## 1. The Mood

- **Retro-modern, not vintage.** Modern layout, generous whitespace, confident type scale — with noir *accents* dropped in. No sepia, no torn-paper PNGs, no faux-aged filters over everything.
- **Noir, not goth.** Dark but warm. Streetlight amber on a wet street, not a vampire's basement.
- **Tactile in the details only.** Film grain, a stamped word, a redaction bar, a folder tab. These are seasoning. The underlying layout stays clean and contemporary.
- **Restrained motion.** Short fades, a 1px lift on hover, a hard shadow appearing. No parallax, no bouncy easing. Use `ease-noir` (`cubic-bezier(0.22, 1, 0.36, 1)`).

---

## 2. Colour

Tokens live in `src/app/globals.css` under `@theme`. **Always use the Tailwind utility, never a raw hex in a component.**

| Role | Token | Utility | Hex |
|---|---|---|---|
| Page background | `--color-noir` | `bg-noir` | `#121110` |
| Cards, panels | `--color-noir-raised` | `bg-noir-raised` | `#1A1815` |
| Borders, dividers | `--color-noir-line` | `border-noir-line` | `#2A2724` |
| Body + headline text | `--color-cream` | `text-cream` | `#EFE6D5` |
| Muted text, metadata | `--color-ash` | `text-ash` | `#8C857A` |
| CTA / stamps | `--color-blood` | `bg-blood` | `#B3231C` |
| CTA hover | `--color-blood-hot` | `bg-blood-hot` | `#D12A22` |
| Badges, rules, accents | `--color-brass` | `text-brass` | `#C9A96A` |
| Secondary brass | `--color-brass-dim` | `text-brass-dim` | `#7A6743` |

**Rules**

- Never pure white — always `cream`. Never pure black — always `noir`.
- **Blood red is a fill, not a text colour.** `#B3231C` on `#121110` is a 2.9:1 contrast ratio and fails WCAG AA for body text. Use it as a button/stamp background with `cream` text on top (5.3:1 ✓), as a hairline rule, or as large decorative type that is `aria-hidden`.
- Brass on noir is 8.5:1 ✓ and ash on noir is 5.3:1 ✓ — both safe for text.
- **Two accents on screen at once, maximum.** Brass + blood, or brass + cream. Not all three fighting.
- No gradients as decoration. Gradients are allowed only as scrims — making text legible over the hero video/poster.
- No glow, no neon, no blurred drop shadows.

---

## 3. Typography

Loaded via `next/font/google` in `src/app/layout.tsx`, exposed as Tailwind families.

| Use | Font | Utility | Notes |
|---|---|---|---|
| Headlines, case titles | **Bodoni Moda** | `font-display` | High-contrast serif. Variable weight. |
| Body text | **Inter** | `font-sans` | Variable. Default for `<body>`. |
| Metadata, tags, stamps, prices | **IBM Plex Mono** | `font-mono` | Weights 400/500/600 only. |

**Rules**

- Bodoni's thin strokes disappear at small sizes on a dark background. Use `font-display` at **20px and above**, at `font-semibold` or heavier. Below that, use `font-sans` or `font-mono`.
- Mono labels are uppercase with wide tracking: `tracking-[0.16em]` to `tracking-[0.22em]`. Small sizes — 10px/11px.
- Headline tracking stays tight-to-normal. Never letterspace Bodoni headlines, except the `GOYENDA` wordmark (`tracking-[0.14em]`).
- Body line-height 1.7–1.8. Headline line-height 1.0–1.1.
- Italic serif for pull-quotes only.

---

## 4. Layout & Spacing

- **Container:** `max-w-6xl` (1152px), centred, `px-5` mobile → `sm:px-8`.
- **Section rhythm:** `py-20` mobile → `sm:py-28`. Alternate plain `bg-noir` sections with `bg-noir-raised/40` bands to break up the page.
- **Grid:** case cards 1 col mobile → 2 at `sm` → 3 at `lg`.
- **Corners:** sharp. No `rounded-*` beyond 1–2px. Corners should read as cut, not soft.
- **Borders:** 1px `border-noir-line` for structure, `border-brass` for emphasis.
- **Hard offset shadow** — the signature move. Registered as a Tailwind utility so variants work:
  ```
  group-hover:shadow-stamp        /* 4px 4px 0 brass */
  hover:shadow-stamp-blood        /* 4px 4px 0 blood */
  ```
  Sparingly — cards on hover, the odd document mock. Not on every element.

---

## 5. Components

### Hero
Full-bleed, `min-h-[88svh]`, `.vignette` for the lighting falloff. A background-video slot sits behind a left-to-right scrim so the headline never loses contrast. Mono eyebrow → Bodoni headline (second line in brass) → ash tagline → blood CTA + ghost secondary → mono stat strip.

### Case card
The most important component. Looks like a file folder:
- A **folder tab** sits above the card carrying `CASE 001` in mono/brass.
- A **redacted document preview** stands in for page thumbnails — cream bars at low opacity with solid `.redacted` blocks over "names".
- **Difficulty badge** overlays the preview: brass outline, rank name, three pips filled to the rank.
- Title in `font-display`, premise in `text-ash`, tags as mono chips.
- Footer row: solve time · pages · hours-to-solution, then price in brass Bodoni and a CTA that fills blood on hover.
- Hover: card lifts 1px, border goes brass, hard brass shadow appears.

### Buttons
- **Primary / purchase:** `bg-blood`, `text-cream`, mono uppercase. Hover → `bg-blood-hot`, nudge up-left 2px, brass hard shadow.
- **Secondary / ghost:** transparent, `border-noir-line`, `text-cream`. Hover → brass border and brass text.
- **Tertiary:** brass outline, fills brass with noir text on hover (used for the header CTA).

### Inputs *(not built yet — for later pages)*
`bg-noir-raised`, `text-cream`, 1px `border-noir-line`. Focus: brass border, no glow. Placeholder in `text-ash`.

### Stamps & badges
Rotated 5–8°, `border-[3px] border-blood`, mono, uppercase, blood text. Used for `FICTIONAL`, and later `SOLVED` / `OPEN` / `COLD CASE`. Decorative stamps get `aria-hidden`.

### Motifs
- `.grain-overlay` — fixed full-viewport film grain, mounted once in the root layout. 5% opacity, `overlay` blend, `pointer-events: none`.
- `.vignette` — radial darkening on a `relative` container. Hero and future case-detail headers.
- `.redacted` — solid cream block standing in for a withheld name.

---

## 6. Imagery & Iconography

- **Photos:** duotone only — noir shadows, brass highlights. Never drop in a full-colour stock photo.
- **Icons:** outlined, 1.5–2px stroke, never filled. Tint brass or cream.
- **Allowed decoration:** film grain, vignette, redaction bars, folder tabs, stamps, hairline rules, evidence-board pins and string (catalog page).
- **Banned:** emoji, gradient illustrations, 3D renders, isometric scenes, abstract blobs, anything that reads as a generic SaaS landing page.

---

## 7. Microcopy Voice

Plain and functional by default. Detective flavour at *moments* — hero, section headers, error states. Everywhere at once is a costume party.

| Standard | Goyenda version | Use? |
|---|---|---|
| "Buy now" | "Take the case" | Yes |
| "Cases" | "The Casebook" | Yes |
| "Sign up" | "Open a file" | Yes — once |
| "My account" | "Detective's desk" | Yes |
| "404" | "This trail's gone cold." | Yes |
| "Add to cart" | "Add to cart" | **Keep plain** |
| "Email address" | "Email address" | **Keep plain** |

---

## 8. Do / Don't

**Do** — sharp corners, hairline borders, hard offset shadows, mono for any number or ID, blood used sparingly, generous whitespace inside dark surfaces, `svh` units for full-height sections on mobile.

**Don't** — rounded or pill shapes, glow/blur/gradient decoration, blurred drop shadows, full-colour photography, emoji, cartoon fonts, three accents at once, raw hex values in components, Bodoni below 20px.
