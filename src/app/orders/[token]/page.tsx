import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DifficultyBadge } from "@/components/CaseCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SolutionCountdown } from "@/components/SolutionCountdown";
import { RANKS, formatTaka } from "@/lib/cases";
import { formatDateTimeBD, formatTimeBD } from "@/lib/orders";
import { getOrderByToken } from "@/lib/orders-data";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
      <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
      {children}
    </p>
  );
}

function Stamp({ text }: { text: string }) {
  return (
    <span
      aria-hidden
      className="mt-2 rotate-[-6deg] border-[3px] border-blood px-4 py-1.5 font-mono text-lg font-semibold tracking-[0.14em] text-blood sm:text-2xl"
    >
      {text}
    </span>
  );
}

/**
 * The buyer's private order page, reached by its unguessable token from
 * the emails. Shows one of four states; only "paid" exposes the download.
 */
export default async function OrderPage({ params }: PageProps<"/orders/[token]">) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  const c = order.case;
  const rank = RANKS[c.difficulty_rank];
  const code = `CASE ${String(c.case_number).padStart(3, "0")}`;
  const solutionReady =
    order.status === "paid" &&
    !!order.solution_send_at &&
    new Date(order.solution_send_at) <= new Date();

  const heading =
    order.status === "paid"
      ? "The file is yours."
      : order.status === "rejected"
        ? "We couldn't match that payment."
        : order.status === "pending"
          ? "Order received. Checking your payment."
          : "This checkout wasn't finished.";

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="vignette relative isolate overflow-hidden border-b border-noir-line">
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-noir-raised/60 to-noir" />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-14 pb-14 sm:px-8 sm:pt-20 sm:pb-20">
            <Eyebrow>
              <span className="whitespace-nowrap">Order {order.order_code}</span>
              <span aria-hidden className="text-brass-dim">/</span>
              <span className="whitespace-nowrap">{formatDateTimeBD(order.submitted_at ?? order.created_at)}</span>
            </Eyebrow>

            <div className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-4">
              <h1 className="max-w-3xl font-display text-[2.6rem] leading-[1.02] font-semibold text-cream sm:text-6xl">
                {heading}
              </h1>
              {order.status === "paid" && <Stamp text="PAID" />}
              {order.status === "pending" && <Stamp text="PENDING" />}
              {order.status === "rejected" && <Stamp text="REJECTED" />}
            </div>

            <p className="mt-6 max-w-xl text-base leading-[1.7] text-ash sm:text-lg">
              {order.status === "pending" && (
                <>
                  Thanks, <span className="text-cream">{order.buyer_name}</span>. We check every
                  bKash payment by hand &mdash; {SITE.confirmationWindow}. When it&rsquo;s
                  confirmed, your download link goes to{" "}
                  <span className="text-cream">{order.buyer_email}</span> and this page
                  updates. Bookmark it.
                </>
              )}
              {order.status === "paid" && (
                <>
                  <span className="text-cream">{c.title}</span> is ready to download. A copy
                  of the link has gone to <span className="text-cream">{order.buyer_email}</span>.
                  The solution follows separately &mdash; see below for exactly when.
                </>
              )}
              {order.status === "rejected" && (
                <>
                  We couldn&rsquo;t find a bKash payment matching the details you gave.
                  {order.rejection_reason && (
                    <>
                      {" "}Reason: <span className="text-cream">{order.rejection_reason}</span>.
                    </>
                  )}{" "}
                  If you did pay, reply to your order email or write to{" "}
                  <a href={`mailto:${SITE.contactEmail}`} className="text-cream underline underline-offset-4">
                    {SITE.contactEmail}
                  </a>{" "}
                  with the TrxID and we&rsquo;ll look again.
                </>
              )}
              {order.status === "started" && (
                <>
                  No payment details were submitted for this code. If you&rsquo;ve sent
                  money, go back to the case and complete the form &mdash; you&rsquo;ll get
                  the same order code.
                </>
              )}
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          {order.status === "paid" && order.approved_at && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col border border-brass bg-noir-raised p-6 shadow-stamp sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">Step 1 · Now</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-cream sm:text-3xl">
                  Download the case file.
                </h2>
                <p className="mt-3 text-sm leading-[1.7] text-ash">
                  PDF, A4. Print it &mdash; colour if you can, the photographs matter. This
                  link works for {SITE.downloadWindowDays} days from confirmation, as many
                  times as you like.
                </p>
                <a
                  href={`/orders/${order.access_token}/download`}
                  className="group mt-6 inline-flex items-center justify-center gap-3 bg-blood px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-noir hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blood-hot hover:shadow-stamp"
                >
                  Download case file
                  <span aria-hidden className="transition-transform duration-300 ease-noir group-hover:translate-y-0.5">&darr;</span>
                </a>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                  {code} &middot; {formatTaka(order.amount)} &middot; confirmed {formatTimeBD(order.approved_at)}
                </p>
              </div>

              <div className="flex flex-col border border-noir-line bg-noir-raised p-6 sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
                  Step 2 &middot; {solutionReady ? "Unsealed" : "Later"}
                </p>
                {solutionReady ? (
                  <>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-cream sm:text-3xl">
                      The solution is unsealed.
                    </h2>
                    <p className="mt-3 text-sm leading-[1.7] text-ash">
                      Held {rank.solutionDelayHours} hour
                      {rank.solutionDelayHours === 1 ? "" : "s"}, as promised
                      {order.solution_sent && (
                        <>
                          {" "}&mdash; a copy is in{" "}
                          <span className="text-cream">{order.buyer_email}</span>
                        </>
                      )}
                      . Open it only once everyone has named a suspect.
                    </p>
                    <a
                      href={`/orders/${order.access_token}/solution`}
                      className="group mt-6 inline-flex items-center justify-center gap-3 border border-brass px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] text-brass transition-all duration-300 ease-noir hover:bg-brass hover:text-noir"
                    >
                      Read the solution
                      <span aria-hidden className="transition-transform duration-300 ease-noir group-hover:translate-y-0.5">&darr;</span>
                    </a>
                  </>
                ) : (
                  <>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-cream sm:text-3xl">
                      The solution arrives{" "}
                      {order.solution_send_at && (
                        <SolutionCountdown
                          solutionAt={order.solution_send_at}
                          fallback={`at ${formatTimeBD(order.solution_send_at)}`}
                        />
                      )}
                      .
                    </h2>
                    <p className="mt-3 text-sm leading-[1.7] text-ash">
                      {rank.label} files are held for {rank.solutionDelayHours} hour
                      {rank.solutionDelayHours === 1 ? "" : "s"} from the moment we confirmed
                      your payment. We&rsquo;ll email the sealed solution to{" "}
                      <span className="text-cream">{order.buyer_email}</span>
                      {order.solution_send_at && (
                        <> at <span className="text-cream">{formatTimeBD(order.solution_send_at)}</span> Bangladesh time</>
                      )}
                      . It isn&rsquo;t in the download, so there&rsquo;s nothing to peek at.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Receipt */}
          <div className={`grid gap-8 lg:grid-cols-2 ${order.status === "paid" ? "mt-14 border-t border-noir-line pt-12" : ""}`}>
            <div>
              <Eyebrow>Order details</Eyebrow>
              <dl className="mt-6 divide-y divide-noir-line border-y border-noir-line text-sm">
                {[
                  ["Order", order.order_code],
                  ["Case", `${code} — ${c.title}`],
                  ["Amount", formatTaka(order.amount)],
                  ["TrxID", order.submitted_trxid ?? "—"],
                  ["Email", order.buyer_email ?? "—"],
                  ["Status", order.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">{k}</dt>
                    <dd className="text-right font-mono text-[13px] text-cream">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-col justify-end gap-3 text-sm leading-[1.7] text-ash">
              <p>
                <span className="text-cream">Something wrong?</span> Reply to any Goyenda email
                or{" "}
                <Link href="/contact" className="text-cream underline underline-offset-4 hover:text-brass">
                  write to us
                </Link>{" "}
                quoting {order.order_code}.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <DifficultyBadge rank={c.difficulty_rank} />
                <Link href={`/cases/${c.slug}`} className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash hover:text-brass">
                  Case page &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
