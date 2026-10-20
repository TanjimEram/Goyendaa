import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { purgeStaleReservations } from "@/lib/orders-data";
import { sendDueSolutions } from "@/lib/solutions";
import { describeError, logError, redact } from "@/lib/log";
import { purgeLoginAttempts } from "@/lib/bot-guard";

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
    if (result.due) console.log("[cron] solutions", redact(JSON.stringify(result)));
    // Housekeeping; never let it fail the solution run.
    const purged = await purgeStaleReservations().catch((error) => {
      logError("[cron] purge failed", error);
      return 0;
    });
    await purgeLoginAttempts().catch((error) => logError("[cron] login purge failed", error));
    return NextResponse.json({ ok: true, ...result, purged });
  } catch (error) {
    // Code + message only: a Supabase error's `details` holds row values.
    const message = describeError(error);
    console.error("[cron] solutions run failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
