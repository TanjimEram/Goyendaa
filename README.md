# Goyenda

গোয়েন্দা — *detective*.

Printable detective case files. Buy a case, download and print the evidence pack, work it like an investigator. The solution is emailed separately, hours later.

Every case is fictional. See the editorial rule in [`CLAUDE.md`](./CLAUDE.md).

## Watch it work

[![Goyenda — 21-second intro. Click to play.](docs/media/intro.jpg)](https://raw.githubusercontent.com/TanjimEram/Goyendaa/main/docs/media/intro.mp4)


<video controls width="720">
  <source src="https://raw.githubusercontent.com/TanjimEram/Goyendaa/main/docs/media/intro.mp4" type="video/mp4">
</video>

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Supabase · Resend · Cloudflare Workers (via OpenNext)

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>. The admin is at `/admin`.

Data comes from Supabase: copy `.env.example` to `.env.local`, run `supabase/migrations/0001_cases.sql` (and optionally `supabase/seed.sql`) in the SQL editor, and create one admin user under Authentication.

To run the production bundle in Cloudflare's local `workerd` runtime (the closest thing to the deployed site):

```bash
npm run preview
```

Then open <http://localhost:8787>.

## Project docs

| File | What's in it |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | Project plan, stack, site flow, build order, current status |
| [`STYLE_GUIDE.md`](./STYLE_GUIDE.md) | Visual system — palette, type, components, motifs |

## Status

Homepage only. Catalog, case detail, checkout, solution delivery and admin are not built yet.
