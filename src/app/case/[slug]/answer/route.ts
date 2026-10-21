import { NextResponse, type NextRequest } from "next/server";

/** /case/<slug>/answer (the short form in posts) → /cases/<slug>/answer,
 *  keeping ?t= so emailed links still unlock. */
export async function GET(req: NextRequest, ctx: RouteContext<"/case/[slug]/answer">) {
  const { slug } = await ctx.params;
  const to = new URL(`/cases/${encodeURIComponent(slug)}/answer`, req.url);
  to.search = req.nextUrl.search;
  return NextResponse.redirect(to, 308);
}
