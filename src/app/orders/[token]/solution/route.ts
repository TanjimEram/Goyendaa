import { NextResponse, type NextRequest } from "next/server";
import { getOrderByToken } from "@/lib/orders-data";
import { SITE } from "@/lib/site";
import { FILES_BUCKET } from "@/lib/storage";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * The sealed solution. Same shape as the case-file download, plus the one
 * rule that makes the whole product work: nothing is served before
 * `solution_send_at`, so guessing this URL early gets you a 403.
 *
 * The link stays live after that — buyers who lose the email come back
 * through their order page.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/orders/[token]/solution">) {
  const { token } = await ctx.params;
  const order = await getOrderByToken(token);

  if (!order || order.status !== "paid") {
    return new NextResponse("This order isn't ready.", { status: 403 });
  }

  if (!order.solution_send_at || new Date(order.solution_send_at) > new Date()) {
    return new NextResponse(
      "The solution is still sealed. It unlocks at the time shown on your order page, and we'll email it to you then.",
      { status: 403 },
    );
  }

  const path = order.case.solution_pdf_path;
  if (!path) {
    return new NextResponse(
      `The solution file for this case isn't available yet. Email ${SITE.contactEmail} with order ${order.order_code}.`,
      { status: 503 },
    );
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase.storage
    .from(FILES_BUCKET)
    .createSignedUrl(path, 60 * 10, { download: `${order.case.slug}-solution.pdf` });

  if (error || !data?.signedUrl) {
    console.error("[solution] signed url failed", error);
    return new NextResponse("Couldn't prepare the download. Try again in a minute.", { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
