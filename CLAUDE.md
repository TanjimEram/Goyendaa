@AGENTS.md

# Goyenda

**Goyenda** (গোয়েন্দা) is Bengali for *detective*.

A website selling downloadable detective / murder-mystery case files — digital PDFs meant to be printed at home. Buyers work realistic fictional cases: a case brief, an evidence pack (witness statements, interrogation transcripts, photographs, forensic notes), and a solution that is delivered **separately, on a delay**.

---

## Non-negotiable editorial rule

Cases are **fictional**. They may be *inspired by patterns* found in true crime — how alibis break down, how a scene gets staged, how a timeline gets falsified — but they must **never** be reskins of real, identifiable victims, suspects or crimes. No real victim's name, no lightly-renamed real case, no real locations tied to a real death.

This is a legal and ethical requirement, not a style preference. Treat any case draft that fails it as a blocker. Place names in cases are invented for the same reason.

---

## Audience & commercial constraints

- **Primary market: Bangladesh.** Prices display in BDT (`৳`). Checkout must eventually support **bKash / Nagad**, not just cards.
- **No trade licence.** Payments will route through a BD aggregator that collects to a personal bKash/Nagad/Rocket number — **UddoktaPay** or **BangoPay**. Exact provider is still TBD, so keep the checkout layer provider-agnostic.
- **Budget is ~5000 BDT/year, total.** Free tiers are a **hard requirement**, not a preference. Do not introduce a paid dependency, a paid service tier, or anything that meters usage into a bill without flagging it first.

---

## Tech stack

| Layer | Choice | Status |
|---|---|---|
| Framework | **Next.js 16.3.4** (App Router, TypeScript, `src/` dir, `@/*` alias) | in place |
| Styling | **Tailwind CSS v4** — tokens in `@theme` in `src/app/globals.css` | in place |
| Fonts | `next/font/google` — Bodoni Moda, Inter, IBM Plex Mono | in place |
| DB + storage | **Supabase** (free tier) | not wired up |
| Transactional email | **Resend** (free tier) | not wired up |
| Scheduled jobs | **Vercel Cron** — polls a table of pending solution sends | not built |
| Hosting | **Vercel** (free tier) | not deployed |
| Payments | UddoktaPay **or** BangoPay (TBD) | not built |

> ⚠️ This is **Next.js 16** — APIs differ from older training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Notably: `LayoutProps<'/'>` and `PageProps<'/route'>` are **global** type helpers requiring no import.

---

## Site flow

1. **Homepage** — hero (video-capable), featured cases, brand story. ✅ **built**
2. **Case catalog** — evidence-board grid, filterable by difficulty rank. ✅ **built** (`/cases`)
3. **Case detail** — premise teaser (no spoilers), difficulty badge, price, redacted document previews, buy CTA. ✅ **built** (`/cases/[slug]`)
4. **Checkout** — BD aggregator, provider-agnostic where possible. ⬜ *(detail page already links to `/checkout/[slug]`, which 404s until this is built)*
5. **Success page** — immediate case-PDF download + clear messaging on when the solution arrives. ⬜
6. **Solution delivery** — **not immediate.** Delay is set by the case's difficulty rank. Trigger point is **purchase completion time, not download time.** Needs a scheduled job (Vercel Cron over a `pending_sends` table) plus Resend. ⬜
7. **Admin dashboard** — *later phase, explicitly out of scope for now.* Case CRUD with file upload, publish/unpublish toggle, order list, minimal theme settings (hero video URL, accent colour). Deliberately **not** a full CMS. ⬜

### Difficulty ranks

Rank sets both the badge and the solution delay. Names are **provisional**.

| Rank | Label | Solution delay |
|---|---|---|
| `rookie` | Rookie Goyenda | 1 hour |
| `senior` | Senior Goyenda | 2 hours |
| `master` | Master Goyenda | 3 hours |

Defined once in `src/lib/cases.ts` (`RANKS`). Change them there, not in components.

---

## Build order

**Frontend first, page by page.** Homepage → catalog → case detail → checkout placeholder → success page, all fully mobile-responsive, *before* any backend, payment integration, or admin work.

---

## Design direction

**Retro-modern noir.** Modern layout with noir accents — *not* vintage, not sepia, not a faux-aged photocopy.

Full component-level spec lives in **`STYLE_GUIDE.md`**. Read it before building any new page. Summary:

- **Colours** — background `#121110`, text `#EFE6D5`, accent `#B3231C` (blood red, sparingly, CTAs only), secondary `#C9A96A` (brass, badges/dividers).
- **Fonts** — headlines Bodoni Moda, body Inter, case metadata/tags IBM Plex Mono.
- **Motifs** — subtle film grain, vignette lighting on the hero, manila-folder / stamped-document styling on case cards, evidence-board layout for the catalog.

⚠️ **Blood red is a fill colour, never a text colour** — `#B3231C` on `#121110` is 2.9:1 and fails WCAG AA. Use it behind cream text, as a rule, or as large `aria-hidden` decoration.

---

## Code conventions

- **Design tokens only.** Colours and fonts come from `@theme` in `globals.css` as Tailwind utilities (`bg-noir`, `text-brass`, `font-display`). **Never hard-code a hex in a component.** New pages must reuse these so the site stays consistent.
- **Custom utilities** that need variants (`hover:`, `group-hover:`) are registered with Tailwind v4's `@utility` directive, not as plain CSS classes — plain classes silently don't work with variants.
- **Server Components by default.** Add `"use client"` only where interactivity actually requires it. Nothing on the homepage needs it today.
- **TypeScript everywhere.** No `.js` page files.
- Components live in `src/components/`, named exports, one component family per file.
- Shared data/helpers live in `src/lib/`.
- Mobile-first Tailwind. Use `svh` (not `vh`) for full-height sections so mobile browser chrome doesn't clip them.
- **Never commit `.env*` files, API keys, or secrets.**

---

## Current status

**Phase: homepage, catalog and case detail complete. Checkout placeholder + success page are next.**

The project was reset from scratch on 2026-09-11 — old code wiped, GitHub remote force-pushed back to an empty initial commit. Pre-reset history is preserved locally in the `pre-reset-backup` git tag.

What exists:

```
src/app/layout.tsx              root layout — fonts, metadata, film-grain overlay
src/app/globals.css             @theme design tokens + noir motif utilities
src/app/page.tsx                homepage composition
src/app/cases/page.tsx          catalog — static page, client grid in <Suspense>
src/app/cases/[slug]/page.tsx   case detail — SSG via generateStaticParams,
                                notFound() for unknown slugs
src/components/                 SiteHeader, Hero, CaseCard (+DifficultyBadge),
                                FeaturedCases, CatalogGrid ("use client"),
                                HowItWorks, BrandStory, SiteFooter,
                                PurchasePanel (+PurchaseBar, checkoutHref),
                                RankGuide, RedactedDocument
src/lib/cases.ts                ALL_CASES (8), FEATURED_CASES (derived),
                                RANKS (+tagline/description/ranges),
                                RANK_CONTENTS templates, getCaseBySlug,
                                getCaseContents, getPreviewDocs,
                                getRelatedCases, ৳/time formatters
public/hero-poster.svg          generated noir hero backdrop (venetian-blind light)
```

Catalog behaviour worth knowing:

- **Filter/sort is client-side** in `CatalogGrid`. The rank filter is mirrored to `?rank=` via `history.replaceState` (Next-router-aware) so filtered views are shareable and the footer's per-rank links work. `useSearchParams` requires the `<Suspense>` wrapper in `cases/page.tsx` — remove it and the page stops prerendering.
- **`CaseCard` is the single card component** for both the homepage teaser and the catalog. The whole card is one `<Link>` to `/cases/[slug]`; the "Take the case" button is a `<span>` inside it, not a nested anchor.
- **Thumbnails**: `CaseFile.thumbnail` is optional. When set, the card renders `next/image` (`fill`, 16:9). When absent it renders the generated redacted-document preview headed with `CaseFile.exhibit`. No real thumbnails exist yet.

Case detail behaviour worth knowing:

- **Two buy surfaces, one href.** `PurchasePanel` is the sticky aside from `lg` up; `PurchaseBar` is a bottom-pinned bar below `lg` (the page adds `pb-24 lg:pb-0` to `<main>` so the footer clears it). Both call `checkoutHref()` → `/checkout/[slug]`. Change the checkout URL in one place.
- **"What's in the file" is templated by rank** (`RANK_CONTENTS`) until a case sets its own `contents[]`. Any item whose label contains "solution" is rendered as the full-width "Sealed" row.
- **Previews are div mock-ups** (`RedactedDocument`, three layouts picked from the heading by `variantFor`). Headings come from `getPreviewDocs()`: the case's `exhibit` + two rank-based defaults, unless the case sets `previewDocs[]`. When real page scans exist, swap the body for an `<Image>` and keep the frame + PREVIEW stamp.
- **`CaseFile.hook`** is the 2–3 sentence teaser on the detail page; `premise` stays the one-liner on cards. Both must tease without naming the mechanism.
- **Difficulty explanation** lives in `RankGuide` (`#difficulty`), reached from the badge in the header; the badge's `title` carries `RANKS[rank].tagline` as a tooltip.

Known placeholders, to be replaced:

- **Case data is hard-coded** in `src/lib/cases.ts` — 8 invented cases. Shape is deliberately Supabase-ready — when the `cases` table lands, only the loader changes; `CaseCard`/`CatalogGrid` should not need edits.
- **No real thumbnails or page scans.** Cards use the generated redacted preview; the detail page's three "exhibits" are div mock-ups. Drop image paths into `CaseFile.thumbnail` to switch a card over.
- **Contents lists are rank templates, not real manifests.** Counts (3 / 5 / 7 witness statements etc.) are invented and don't reconcile exactly with `pages`. Real cases should set `contents[]`.
- **`/checkout/[slug]` does not exist** — every Buy button 404s. Next build step.
- **Default Next.js 404 page** — unknown `/cases/[slug]` correctly 404s but with the unstyled default. Needs a `src/app/not-found.tsx` ("This trail's gone cold.").
- **Hero video slot is empty.** Drop a file into `public/` and set `HERO_VIDEO_SRC` in `src/components/Hero.tsx`; the poster SVG covers it until then.
- **Footer "Contact / FAQ / Legal" links are `#`.** Everything else in header, hero and footer is a real route or on-page anchor.
- **No mobile nav menu** — the header nav collapses to the wordmark + CTA below `md`. Fine while every link is an on-page anchor; needs a real menu once routes exist.
- **`src/app/favicon.ico` is still the Next.js default.**

---

## Git workflow

- Remote: `https://github.com/TanjimEram/Goyendaa.git`
- Commit after each meaningful change, with a specific message — never "update files".
- **Do not push unless explicitly asked.** The user handles pushing to GitHub themselves.
- Never commit `.env*` or secrets.
