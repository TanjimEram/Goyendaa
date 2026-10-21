import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getFreeCase, leadCookie, leadForCase, leadHit } from "@/lib/leads";
import { logError } from "@/lib/log";
import { FILES_BUCKET } from "@/lib/storage";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Free case download. The lead's token is the credential (?t= from the
 * email, or the case cookie set when the form was sent). No lead → back to
 * the case page's form. Same delivery as paid files: a 10-minute signed URL
 * to the private bucket, never a public link.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/cases/[slug]/download">) {
  const { slug } = await ctx.params;
  const fromLink = req.nextUrl.searchParams.get("t") ?? undefined;
  const token = fromLink ?? (await cookies()).get(leadCookie(slug))?.value;

  const lead = await leadForCase(token, slug).catch(() => null);
  if (!lead) return NextResponse.redirect(new URL(`/cases/${slug}#play`, req.url), 303);

  const freeCase = await getFreeCase(slug).catch(() => null);
  if (!freeCase?.case_pdf_path) {
    return new NextResponse("The file for this case isn't available yet. Try again later.", { status: 503 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase.storage
    .from(FILES_BUCKET)
    .createSignedUrl(freeCase.case_pdf_path, 60 * 10, { download: `${slug}.pdf` });
  if (error || !data?.signedUrl) {
    logError("[free] signed url failed", error);
    return new NextResponse("Couldn't prepare the download. Try again in a minute.", { status: 500 });
  }

  await leadHit(lead.token, "download");
  const res = NextResponse.redirect(data.signedUrl, 302);
  // Arrived from the email on a new device: remember the lead here too.
  if (fromLink) {
    res.cookies.set(leadCookie(slug), lead.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
