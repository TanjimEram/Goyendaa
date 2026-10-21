import { NextResponse, type NextRequest } from "next/server";
import { leadsToCsv, listLeadsAdmin } from "@/lib/leads";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** /admin/leads/export?case=&consent=yes|no — the Leads table as CSV. */
export async function GET(req: NextRequest) {
  // proxy.ts already bounces anonymous visitors; check again here.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return new NextResponse("Not signed in.", { status: 401 });

  const sp = req.nextUrl.searchParams;
  const consent = sp.get("consent") === "yes" ? true : sp.get("consent") === "no" ? false : undefined;
  const leads = await listLeadsAdmin({ caseSlug: sp.get("case") || undefined, consent });

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(leadsToCsv(leads), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="goyenda-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
