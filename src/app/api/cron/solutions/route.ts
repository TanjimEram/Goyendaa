import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { sendDueSolutions } from "@/lib/solutions";

export const dynamic = "force-dynamic";

/**
 * The delayed-solution job. Called by the Worker's cron trigger (see
 * `custom-worker.ts`), which fetches this path with the CRON_SECRET header.
 *
 * It's an ordinary route so the job runs with the full Next runtime —
 * same Supabase client, same email module, same env resolution as the rest
 * of the app. It is publicly routable, hence the shared-secret guard;
 * with no secret configured it refuses rather than running open.
 */
export const CRON_HEADER = "x-goyenda-cron";

async function run(request: NextRequest) {
  const expected = await serverEnv("CRON_SECRET");
  if (!expected) {
    console.error("[cron] CRON_SECRET is not set — refusing to run");
    return NextResponse.json({ error: "cron not configured" }, { status: 503 });
  }
  if (request.headers.get(CRON_HEADER) !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const result = await sendDueSolutions();
    if (result.due) console.log("[cron] solutions", JSON.stringify(result));
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // Supabase errors are plain objects; String() on them says nothing.
    const message =
      error instanceof Error ? error.message : (JSON.stringify(error) ?? "unknown error");
    console.error("[cron] solutions run failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
