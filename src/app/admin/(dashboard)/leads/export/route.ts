import { NextResponse, type NextRequest } from "next/server";
import { listLeadsAdmin } from "@/lib/leads";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** One CSV cell: quoted, inner quotes doubled, and a leading = + - @
 *  neutralised so a spreadsheet never runs an email as a formula. */
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** /admin/leads/export?case=&consent=yes|no — the Leads table as CSV. */
export async function GET(req: NextRequest) {
  // proxy.ts already bounces anonymous visitors; check again here.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return new NextResponse("Not signed in.", { status: 401 });

  const sp = req.nextUrl.searchParams;
  const consent = sp.get("consent") === "yes" ? true : sp.get("consent") === "no" ? false : undefined;
  const leads = await listLeadsAdmin({ caseSlug: sp.get("case") || undefined, consent });

  const head = ["email", "name", "case", "consent", "utm_source", "utm_medium", "utm_campaign", "downloads", "answer_views", "created_at"];
  const rows = leads.map((l) =>
    [l.email, l.name, l.case_slug, l.consent ? "yes" : "no", l.utm_source, l.utm_medium, l.utm_campaign, l.downloads, l.answer_views, l.created_at]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [head.join(","), ...rows].join("\r\n") + "\r\n"; // BOM: Excel reads UTF-8 names
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="goyenda-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
