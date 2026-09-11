# Goyenda

গোয়েন্দা — *detective*.

Printable detective case files. Buy a case, download and print the evidence pack, work it like an investigator. The solution is emailed separately, hours later.

Every case is fictional. See the editorial rule in [`CLAUDE.md`](./CLAUDE.md).

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Supabase · Resend · Cloudflare Workers (via OpenNext)

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

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
