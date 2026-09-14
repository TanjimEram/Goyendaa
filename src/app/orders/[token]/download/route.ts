import { NextResponse, type NextRequest } from "next/server";
import { getOrderByToken } from "@/lib/orders-data";
import { SITE } from "@/lib/site";
import { FILES_BUCKET } from "@/lib/storage";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Mints a short-lived signed URL for the case PDF and redirects to it.
 * The order token is the credential; the order must be paid and inside
 * the download window. Nothing is cached, nothing is public.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/orders/[token]/download">) {
  const { token } = await ctx.params;
  const order = await getOrderByToken(token);

  if (!order || order.status !== "paid" || !order.approved_at) {
    return new NextResponse("This order isn't ready for download.", { status: 403 });
  }

  const ageMs = Date.now() - new Date(order.approved_at).getTime();
  if (ageMs > SITE.downloadWindowDays * 86_400_000) {
    return new NextResponse(
      `The download window (${SITE.downloadWindowDays} days) has closed. Email ${SITE.contactEmail} with order ${order.order_code}.`,
      { status: 410 },
    );
  }

  const path = order.case.case_pdf_path;
  if (!path) return new NextResponse("The file for this case isn't available yet.", { status: 503 });

  const supabase = await createServiceClient();
  const filename = `${order.case.slug}-case-file.pdf`;
  const { data, error } = await supabase.storage
    .from(FILES_BUCKET)
    .createSignedUrl(path, 60 * 10, { download: filename });

  if (error || !data?.signedUrl) {
    console.error("[download] signed url failed", error);
    return new NextResponse("Couldn't prepare the download. Try again in a minute.", { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
