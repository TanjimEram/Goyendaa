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
| DB + storage | **Supabase** (free tier) — Postgres `cases` table, Auth (one admin user), Storage (`case-media` public, `case-files` private) | wired up |
| Transactional email | **Resend** (free tier), REST via `src/lib/email.ts` | wired up; needs `RESEND_API_KEY` + a verified domain for real buyer addresses |
| Scheduled jobs | **Cloudflare Cron Triggers** (`triggers.crons` in `wrangler.jsonc`, every 10 min) → `custom-worker.ts` → `/api/cron/solutions` | built |
| Hosting | **Cloudflare Workers** (free tier) via `@opennextjs/cloudflare` — **not Vercel, not Cloudflare Pages** | configured, not yet deployed |
| Payments | UddoktaPay **or** BangoPay (TBD) | not built |

> ⚠️ This is **Next.js 16** — APIs differ from older training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Notably: `LayoutProps<'/'>` and `PageProps<'/route'>` are **global** type helpers requiring no import.

### Hosting: Cloudflare Workers, and why

The project moved off Vercel on 2026-09-11. **Vercel's Hobby (free) tier prohibits commercial use**, and Goyenda sells things. Cloudflare's Workers free plan permits commercial use (100k requests/day, static assets free and uncapped), which fits the ~5000 BDT/year budget.

- **Adapter: `@opennextjs/cloudflare`** (OpenNext). This is the actively maintained, Cloudflare-endorsed path. `@cloudflare/next-on-pages` is deprecated on npm — do not use it.
- **It targets Workers with Static Assets, not Cloudflare Pages.** OpenNext has no Pages target. Prerendered HTML, `/_next/static` and `/public` are served as static assets; only non-static requests run in the Worker.
- **Edge runtime is unsupported** by the adapter. Never add `export const runtime = "edge"` to a route. Node runtime (the default) is what runs, under `nodejs_compat`.
- **Worker entry is `custom-worker.ts`, not `.open-next/worker.js`.** OpenNext's generated worker exports only `fetch`, so a cron trigger would have nothing to call. The custom entry re-exports that `fetch` (plus the durable-object classes) and adds `scheduled`, which dispatches an internal `POST /api/cron/solutions` through the very same handler — so the job runs with the full Next runtime instead of a second, parallel stack. Pattern is the adapter's own: https://opennext.js.org/cloudflare/howtos/custom-worker
- **Config files:** `wrangler.jsonc` (Worker name, compat flags, assets binding, cron triggers, later: bindings), `open-next.config.ts` (adapter options — currently no ISR cache, deliberately), `next.config.ts` calls `initOpenNextCloudflareForDev()` so `next dev` can reach bindings.
- **Scripts:** `npm run dev` (unchanged, Next dev server) · `npm run build` (**plain `next build` — keep it that way**; OpenNext calls it internally, so making it run OpenNext too double-bundles and breaks deploy with duplicate exports in `next-env.mjs`) · `npm run build:cf` (OpenNext bundle → `.open-next/`; runs `next build` itself) · `npm run preview` (bundle + run in local `workerd`, port 8787 — **the real test**) · `npm run deploy` (bundle + `wrangler deploy`, needs a Cloudflare login) · `npm run cf-typegen` (types for bindings).
- **Cloudflare CI settings (set in the dashboard, not the defaults):** build command **`npx opennextjs-cloudflare build`**, deploy command **`npx opennextjs-cloudflare deploy`**. The dashboard default (`npm run build` + `npx wrangler deploy`) fails because plain `next build` never produces `.open-next/`.
- **Worker name is `goyenda`** (`wrangler.jsonc` → `name`). It must match the dashboard exactly or wrangler overrides it with a warning on every deploy. The live URL is `https://goyenda.<account-subdomain>.workers.dev`; the subdomain is an account setting (Workers & Pages → "Your subdomain"), target value `goyenda`. `SITE.url` falls back to `https://goyenda.goyenda.workers.dev` — if the subdomain ends up different, set `NEXT_PUBLIC_SITE_URL` as a build variable rather than editing the fallback.
- **A recreated Worker starts with no variables.** Build variables (`NEXT_PUBLIC_*`) and runtime secrets must be re-entered on the new Worker; with them missing the site builds fine but every Supabase read returns empty (catalog shows no cases, case/checkout pages 404).
- **Secrets** (Supabase, Resend, payment keys) go in as Worker secrets via the dashboard or `wrangler secret put`, and locally in `.dev.vars` (gitignored). Never in `wrangler.jsonc`, never in `NEXT_PUBLIC_*` unless truly public.
- **Not configured yet, by design:** R2 incremental cache (nothing uses ISR), `IMAGES` binding (no real thumbnails yet; without it OpenNext serves the original file), cron triggers (no delivery job yet). Each is a one-line addition to `wrangler.jsonc` when needed — see the comments there.
- **Verified 2026-09-12 against the live Supabase project:** `/`, `/cases`, `/cases/[slug]` read real rows; RLS confirmed (anon sees published only, cannot insert). **Verified 2026-09-11:** all routes render identically under `workerd` via `npm run preview` — homepage, catalog filter/sort, SSG detail pages, 404s.

---

## Site flow

1. **Homepage** — hero (video-capable), featured cases, brand story. ✅ **built**
2. **Case catalog** — evidence-board grid, filterable by difficulty rank. ✅ **built** (`/cases`)
3. **Case detail** — premise teaser (no spoilers), difficulty badge, price, redacted document previews, buy CTA. ✅ **built** (`/cases/[slug]`)
4. **Checkout** — `/checkout/[slug]` page ✅ **built** (order summary, email, bKash/Nagad/card choice, terms) behind a provider-agnostic seam in `src/lib/payments.ts`. The placeholder provider returns `unavailable`, so the page ends in a "Payments aren't open yet" panel. ⬜ Real aggregator (UddoktaPay / BangoPay) still to wire.
5. **Success page** — `/checkout/[slug]/success` ✅ **designed** with a MOCK order (`mockOrder()` in `src/lib/orders.ts`, visible "Preview · mock order" strip). Download button is a dead `#` until signed URLs exist. ⬜ Real order lookup + download route still to build.
6. **Solution delivery** — **not immediate.** Delay is set by the case's difficulty rank. Trigger point is **approval time, not download time.** ✅ **built**: a Cloudflare cron trigger every 10 minutes → `custom-worker.ts` `scheduled()` → `/api/cron/solutions` → `sendDueSolutions()` emails the sealed solution and marks the row. See "Solution delivery" below.
7. **Admin dashboard** — case CRUD with file upload, publish/unpublish toggle, drag-reorder. ✅ **built** (`/admin`). Still to come: order list, minimal theme settings. Deliberately **not** a full CMS.

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
- **Anything the Worker needs at runtime is a Worker Secret** (`SUPABASE_SERVICE_ROLE_KEY`, `BKASH_NUMBER`, `ADMIN_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`); `NEXT_PUBLIC_*` are build variables. Plain dashboard *Variables* are dropped by `wrangler deploy` — Secrets survive, so use Secrets.

---

## Current status

**Phase: every page exists; checkout and success run on placeholders. Next: orders table + real payment provider + webhook + signed download + solution-delivery cron.**

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
src/lib/cases.ts                types, RANKS, RANK_CONTENTS, pure helpers —
                                NO data, safe for client components
src/lib/cases-data.ts           server-only Supabase reads: CaseRow type,
                                rowToCaseFile, getPublishedCases,
                                getPublishedCase, getAllCasesAdmin,
                                getCaseByIdAdmin
src/lib/supabase/{env,client,server}.ts
                                env reader, browser client, server clients
                                (cookie-aware + anonymous public)
src/lib/storage.ts              bucket names, URL↔path helpers
src/lib/slug.ts                 slugify + SLUG_PATTERN
src/lib/payments.ts             PaymentProvider seam, PAYMENT_METHODS,
                                placeholder provider, getPaymentProvider()
src/app/checkout/[slug]/        page (summary + form) and startCheckout action
src/app/checkout/[slug]/success/  post-payment page (mock order for now)
src/lib/orders.ts               Dhaka-time formatters
src/lib/orders-data.ts          server-only order reads/writes: reservation,
                                submit, admin queue/history, due-solution
                                query + send bookkeeping, solutionSendAt
src/lib/solutions.ts            sendDueSolutions() — the delayed-answer job
src/app/api/cron/solutions/     cron endpoint (CRON_SECRET header guard)
src/app/orders/[token]/         buyer status page, /download, /solution
custom-worker.ts                Worker entry: OpenNext fetch + scheduled()
src/components/SolutionCountdown.tsx  live "in 2h 41m" via useSyncExternalStore
src/components/CheckoutForm.tsx client form → "not open yet" panel
src/app/not-found.tsx           styled 404 ("This trail's gone cold.")
src/app/{terms,privacy,refunds}/  legal pages — DRAFTS, see note in terms
src/app/{faq,contact}/          help pages (FAQ is a no-JS <details> accordion)
src/components/TextPage.tsx     frame + <Section> for prose pages
src/components/MobileNav.tsx    hamburger panel below md (client island)
src/lib/site.ts                 SITE: url (metadataBase), contact email,
                                legal date, operator, download window
src/app/{favicon.ico,icon.png,apple-icon.png,opengraph-image.png,
         opengraph-image.alt.txt}   brand assets via Next file conventions;
                                originals are 1254² / 1536×1024 — keep the
                                masters outside the repo, regenerate with
                                sharp (ICO entries must be RGBA PNGs)
src/proxy.ts                    guards /admin/*, refreshes session cookie
src/app/admin/login/            server page + actions (login/logout);
                                ?reset=1 shows the "password updated" notice
src/app/admin/forgot-password/  email form -> resetPasswordForEmail
src/app/admin/reset-password/   new-password form (needs the recovery
                                session) + confirm/route.ts, where the
                                email link lands and becomes a session
src/app/admin/(dashboard)/      guarded layout, list, cases/new,
                                cases/[id]/edit, cases/actions.ts
src/components/admin/           AuthCard (shared frame + input/button
                                classes), LoginForm, ForgotPasswordForm,
                                ResetPasswordForm, CaseForm, FileUpload,
                                DeleteCaseButton, CaseTable (drag-reorder)
supabase/migrations/0001_cases.sql   table, RLS, buckets, storage policies
supabase/migrations/0002_case_copy.sql   per-case copy: purchase_info,
                                delivery_info, contents (jsonb), player_note,
                                content_note
supabase/migrations/0003_reorder.sql   reorder_cases(uuid[]) RPC
supabase/seed.sql               the eight placeholder cases
public/hero-poster.svg          generated noir hero backdrop (venetian-blind light)
public/logo-mark.png            transparent, trimmed brand mark (from icon.png)
                                used in SiteHeader next to the wordmark
wrangler.jsonc                  Cloudflare Worker config (name, compat, assets)
open-next.config.ts             OpenNext adapter options (no ISR cache yet)
```

### Data & admin — how it fits together

- **Rendering is dynamic** (`export const dynamic = "force-dynamic"`) on `/`, `/cases`, `/cases/[slug]` and all admin pages: they read Supabase per request. No ISR is possible until an R2 incremental cache is configured on Cloudflare. Static assets (JS/CSS/fonts/SVG) are still served free from the edge.
- **Public reads use the anonymous client** (`createPublicClient`, no cookies). RLS only exposes `published = true` rows to `anon`. In production a failed read logs and renders empty; in development it throws.
- **Admin writes use the cookie-aware client** as the signed-in user. RLS grants `authenticated` full access. There is no service-role key anywhere and none is needed.
- **Auth guard is two layers:** `src/proxy.ts` does an optimistic `getClaims()` (JWT verified locally, no DB call) and redirects; `admin/(dashboard)/layout.tsx` repeats it server-side. `/admin/login`, `/admin/forgot-password` and `/admin/reset-password/*` sit outside the route group and are listed in `isPublicAdminPath()` in the proxy so they work without a session.
- **Password reset uses Supabase Auth's own mechanism**, no custom email code. `requestPasswordReset` (server action) calls `resetPasswordForEmail(email, { redirectTo: <origin>/admin/reset-password/confirm })` — the origin comes from the request so localhost and production each redirect to themselves. The confirm route accepts `?code=` (default `{{ .ConfirmationURL }}` template, PKCE) **and** `?token_hash=&type=recovery` (Supabase's SSR-recommended template, immune to link-prefetching mail scanners), turns it into a session cookie and redirects to the form. `updatePassword` requires ≥8 chars + match, calls `updateUser({ password })`, signs out, and lands on `/admin/login?reset=1`. The forgot form always shows the same "if that email is registered…" notice; failures only reach the server log.
- **Reset-flow dashboard prerequisites:** every origin's `/admin/reset-password/confirm` must be in Authentication → URL Configuration → Redirect URLs, and the recovery email must actually be deliverable — Supabase's built-in sender only delivers to Supabase **organisation members' addresses** (2 emails/hour, no SLA); custom SMTP (Resend) needs a verified sending domain. See the notes in the "Auth email" section below.
- **Sign-ups must be disabled in Supabase** (Authentication → Providers → Email → "Allow new users to sign up" OFF). RLS treats any `authenticated` user as the admin.
- **File uploads go browser → Storage directly** (`FileUpload` uses the browser client + admin session). Nothing streams through the Worker, so there's no request-size ceiling to hit. Public bucket values are stored as public URLs; private bucket values as object paths.
- **Gallery is a `text[]` column** (`gallery_urls`), not a `case_images` table — one row, one form, array order = display order. Revisit only if images need captions or per-image metadata.
- **`case_number` (identity) drives "CASE 007"; `position` drives ordering.** Reordering never renumbers a file.
- **Reordering** is client-side in `CaseTable` (native HTML5 drag-and-drop plus ▲/▼ buttons for touch/keyboard) and only persists on "Save order", which calls `reorderCases(ids)` → the `reorder_cases` RPC: one statement sets `position = 1..n`. `CaseTable` is keyed on the id list so a server refresh after create/delete resets its local state.
- **Deleting a case removes its storage objects** (best-effort). Removing a file inside the form only detaches it; the object stays until the case is deleted — orphans are possible after abandoned edits.
- **Metadata:** root layout sets `metadataBase` from `SITE.url` (`NEXT_PUBLIC_SITE_URL`, fallback to the workers.dev URL) and a `%s — Goyenda` title template — page titles must NOT append the suffix themselves. OG/Twitter defaults come from the layout; per-page `description` overrides are fine.
- **Env vars are `NEXT_PUBLIC_*` and therefore build-time.** On Cloudflare they must be set as *build* variables (Workers Builds → Build → Variables) or the bundle ships with them undefined. See `.env.example`.

### Solution delivery (the delayed-answer job)

- **Clock starts at approval.** `approveOrder` stamps `solution_send_at = approved_at + RANKS[rank].solutionDelayHours`. Nothing about downloading changes it.
- **The job** is `sendDueSolutions()` in `src/lib/solutions.ts`: take up to 25 orders that are `paid`, `solution_sent = false`, past `solution_send_at`, under the attempt cap; email each buyer a link to `/orders/[token]/solution`; mark the row. `solution_sent` is the idempotency flag, so a double run never mails twice.
- **Failures are visible, not silent.** A failed send bumps `solution_attempts` and stores `solution_error`; the first failure also emails `ADMIN_EMAIL`. At `MAX_SOLUTION_ATTEMPTS` (5) the row stops being picked up — a bad address can't loop forever. The usual cause is a case with no `solution_pdf_path`: upload it in the admin, then reset that row's `solution_attempts` to 0 and the next tick delivers.
- **`/orders/[token]/solution`** mints a 10-minute signed URL for `solution_pdf_path`, and refuses (403) before `solution_send_at` — guessing the URL early gets you nothing. Unlike the case download it has **no** 7-day window: the answer stays reachable from the order page.
- **The cron route is publicly routable**, so it's guarded by the `CRON_SECRET` header (`x-goyenda-cron`) and refuses to run when the secret isn't configured. `custom-worker.ts` reads the same secret from the Worker env.
- **Locally:** `curl -X POST -H "x-goyenda-cron: $CRON_SECRET" localhost:3000/api/cron/solutions` — the response JSON is the run summary (`due`, `sent`, `failed`).

### Auth email (Supabase → admin inbox)

Only one message type goes through Supabase's mailer: the admin password-recovery link. Two ways to deliver it:

- **Built-in Supabase sender (current).** Zero config, free, but it only delivers to email addresses of the project's *organisation members*, is capped at 2 messages/hour and carries no delivery SLA. Fine while the admin login email is the same address that owns the Supabase project.
- **Custom SMTP via Resend (switch once a domain is verified).** Authentication → Emails → SMTP Settings: host `smtp.resend.com`, port `465` (SSL) or `587`, user `resend`, password = a Resend API key, sender = an address on the verified domain. Resend's free tier is 3,000/month, 100/day. Without a verified domain Resend can only send to the Resend account owner's own address, which is the same trap as the built-in sender.

Either way the code is identical — the choice lives entirely in the Supabase dashboard.

Catalog behaviour worth knowing:

- **Filter/sort is client-side** in `CatalogGrid`. The rank filter is mirrored to `?rank=` via `history.replaceState` (Next-router-aware) so filtered views are shareable and the footer's per-rank links work. `useSearchParams` requires the `<Suspense>` wrapper in `cases/page.tsx` — remove it and the page stops prerendering.
- **`CaseCard` is the single card component** for both the homepage teaser and the catalog. The whole card is one `<Link>` to `/cases/[slug]`; the "Take the case" button is a `<span>` inside it, not a nested anchor.
- **Thumbnails**: `CaseFile.thumbnail` is optional. When set, the card renders `next/image` (`fill`, 16:9). When absent it renders the generated redacted-document preview headed with `CaseFile.exhibit`. No real thumbnails exist yet.

Checkout behaviour worth knowing:

- **Provider seam.** `startCheckout` validates (email, method, terms), re-reads the case server-side (the form's price is display only), then calls `getPaymentProvider().createCheckout()`. Results: `redirect` (send buyer to the hosted page), `unavailable` (placeholder — show the panel), `error`. A real provider = one new file + a `case` in `getPaymentProvider()` keyed on `PAYMENT_PROVIDER`.
- **Nothing is persisted yet.** No `orders` table; that lands with the real provider + webhook. `Order` in `src/lib/orders.ts` is the intended row shape — the success page already renders from it, so wiring real data means replacing `mockOrder()` with a lookup by `?order=` ref and deleting the preview strip.
- **Solution timing is computed from `paidAt`**, never from download time (`solutionTimeFor`). Times display in Asia/Dhaka.
- **Email is the delivery address** for both the case PDF and the delayed solution. The form says so.
- **Checkout links to `/terms` and `/refunds`** (new tab) from the consent line.

Case detail behaviour worth knowing:

- **Two buy surfaces, one href.** `PurchasePanel` is the sticky aside from `lg` up; `PurchaseBar` is a bottom-pinned bar below `lg` (the page adds `pb-24 lg:pb-0` to `<main>` so the footer clears it). Both call `checkoutHref()` → `/checkout/[slug]`. Change the checkout URL in one place.
- **"What's in the file"** uses the case's `contents` (jsonb, edited in the admin as one-item-per-line text via `parseContentsText`/`contentsToText`) and falls back to the rank template `RANK_CONTENTS` when empty. Any item whose label contains "solution" is rendered as the full-width "Sealed" row.
- **Buying/delivery copy is per case** (`purchase_info`, `delivery_info`, one bullet per line) with rank-aware defaults from `defaultPurchaseInfo()` / `defaultDeliveryInfo(rank)`. `buyingLines()` in `PurchasePanel.tsx` merges them; rendered in the buy panel (lg+) and the "How it works" block (all sizes). `player_note` joins the meta line; `content_note` sits under it.
- **Previews are div mock-ups** (`RedactedDocument`, three layouts picked from the heading by `variantFor`). Headings come from `getPreviewDocs()`: the case's `exhibit` + two rank-based defaults, unless the case sets `previewDocs[]`. When real page scans exist, swap the body for an `<Image>` and keep the frame + PREVIEW stamp.
- **`CaseFile.hook`** is the 2–3 sentence teaser on the detail page; `premise` stays the one-liner on cards. Both must tease without naming the mechanism.
- **Difficulty explanation** lives in `RankGuide` (`#difficulty`), reached from the badge in the header; the badge's `title` carries `RANKS[rank].tagline` as a tooltip.

Known placeholders, to be replaced:

- **The eight placeholder cases live in `supabase/seed.sql`**, not in code. Run it once for content; edit/delete them from `/admin`.
- **No real thumbnails or page scans yet.** Cards use the generated redacted preview until a thumbnail is uploaded; the detail page renders uploaded gallery images (first three) and falls back to div mock-ups.
- **Every card's generated preview is headed "Case brief"** now that `exhibit` isn't a stored field. Irrelevant once thumbnails exist.
- **Seeded cases have no per-case contents/buying copy yet**, so they show the rank templates and default wording. Fill them in from `/admin`.
- **Checkout can't take money** — placeholder provider only. Success page + orders table + real aggregator are the next steps.
- **Hero video slot is empty.** Drop a file into `public/` and set `HERO_VIDEO_SRC` in `src/components/Hero.tsx`; the poster SVG covers it until then.
- **Legal pages are drafts.** Plain-language terms/privacy/refunds written for a sole-trader digital-goods seller in BD. Not legal advice — have them read before launch. `SITE.legalUpdated` must move when wording changes. Privacy §2 names the provider categories generically; fill in once the aggregator and email service are chosen.
- **`SITE.contactEmail` is a placeholder** (`hello@goyenda.com`) — it appears on contact, FAQ, legal and success pages. Set the real one before launch.
- **"7-day download window"** (`SITE.downloadWindowDays`) is a policy assumption stated on terms, FAQ and the success page. The real signed-URL TTL must match it.
- **The only `href="#"` left** is the mock download button on the success page, by design.

---

## Git workflow

- Remote: `https://github.com/TanjimEram/Goyendaa.git`
- Commit after each meaningful change, with a specific message — never "update files".
- **Do not push unless explicitly asked.** The user handles pushing to GitHub themselves.
- Never commit `.env*` or secrets.
