import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DifficultyBadge } from "@/components/CaseCard";
import { CheckoutForm } from "@/components/CheckoutForm";
import { CopyButton } from "@/components/CopyButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { RANKS, formatTaka } from "@/lib/cases";
import { getPublishedCase } from "@/lib/cases-data";
import { orderEnv } from "@/lib/env";
import { findOrCreateStartedOrder } from "@/lib/orders-data";
import { SITE } from "@/lib/site";
import { CHECKOUT_SESSION_COOKIE } from "@/proxy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/checkout/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const caseFile = await getPublishedCase(slug);
  return {
    title: caseFile ? `Checkout — ${caseFile.title}` : "Checkout",
    robots: { index: false, follow: false },
  };
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-5">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-brass font-mono text-xs text-brass">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-semibold text-cream">{title}</p>
        <div className="mt-2 text-sm leading-[1.75] text-ash">{children}</div>
      </div>
    </li>
  );
}

export default async function CheckoutPage({ params }: PageProps<"/checkout/[slug]">) {
  const { slug } = await params;
  const caseFile = await getPublishedCase(slug);
  if (!caseFile?.id) notFound();

  // Planted by proxy.ts on the way in; reserve one order per session+case.
  const session = (await cookies()).get(CHECKOUT_SESSION_COOKIE)?.value ?? crypto.randomUUID();
  const order = await findOrCreateStartedOrder(session, caseFile.id, caseFile.priceBdt);
  const { bkashNumber } = await orderEnv();

  const rank = RANKS[caseFile.rank];
  const price = formatTaka(caseFile.priceBdt);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href={`/cases/${caseFile.slug}`}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-colors duration-300 ease-noir hover:text-brass"
          >
            &larr; Back to the file
          </Link>

          <p className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
            <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
            Checkout &middot; bKash
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-cream sm:text-5xl">
            Take the case.
          </h1>

          {/* ── Order strip: what, how much, the code ────────── */}
          <div className="mt-10 grid gap-px border border-noir-line bg-noir-line sm:grid-cols-3">
            <div className="bg-noir-raised p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">Case</p>
              <p className="mt-2 font-display text-xl leading-tight text-cream">{caseFile.title}</p>
              <div className="mt-3">
                <DifficultyBadge rank={caseFile.rank} />
              </div>
            </div>
            <div className="bg-noir-raised p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">Send exactly</p>
              <p className="mt-2 font-display text-4xl text-brass">{price}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                bKash Send Money
              </p>
            </div>
            <div className="border-brass bg-noir-raised p-5 sm:border-l-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">Your order code</p>
              <p className="mt-2 font-mono text-3xl tracking-[0.12em] text-cream">{order.order_code}</p>
              <div className="mt-2 flex items-center gap-2">
                <CopyButton value={order.order_code} />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                  put this in bKash&rsquo;s reference
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            {/* ── Instructions ─────────────────────────────────── */}
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
                How to pay
              </h2>
              <ol className="mt-6 flex flex-col gap-8">
                <Step n={1} title="Send the money from bKash.">
                  <p>
                    Open bKash &rarr; <span className="text-cream">Send Money</span>. Send{" "}
                    <span className="font-mono text-cream">{price}</span> to
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="border border-brass bg-noir px-3 py-2 font-mono text-lg tracking-[0.12em] text-cream">
                      {bkashNumber}
                    </span>
                    <CopyButton value={bkashNumber} label="Copy number" />
                  </p>
                  <p className="mt-2">
                    It&rsquo;s a personal bKash number, so use <em>Send Money</em>, not
                    Payment or Cash Out.
                  </p>
                </Step>

                <Step n={2} title="Put the order code in the reference.">
                  <p>
                    When bKash asks for a <span className="text-cream">reference</span>{" "}
                    (or note), type{" "}
                    <span className="font-mono text-cream">{order.order_code}</span>. If
                    your version of the app skips that field, don&rsquo;t worry &mdash;
                    the Transaction ID is what we check.
                  </p>
                </Step>

                <Step n={3} title="Copy the Transaction ID from the confirmation.">
                  <p>
                    bKash sends an SMS and shows a confirmation screen with a{" "}
                    <span className="text-cream">TrxID</span> &mdash; ten letters and
                    numbers, like <span className="font-mono">BJK7H2X9QT</span>. Copy
                    it exactly.
                  </p>
                </Step>

                <Step n={4} title="Fill in the form on the right.">
                  <p>
                    Name, email, the TrxID and the order code. We check every payment
                    by hand against the bKash app &mdash; {SITE.confirmationWindow}.
                    Once it&rsquo;s confirmed you&rsquo;ll get your download link by
                    email, and the solution follows {rank.solutionDelayHours} hour
                    {rank.solutionDelayHours === 1 ? "" : "s"} after that.
                  </p>
                </Step>
              </ol>

              <p className="mt-10 border-l-2 border-brass-dim pl-4 font-mono text-[11px] leading-[1.9] tracking-[0.06em] text-ash">
                Sent the wrong amount, or to the wrong number? Don&rsquo;t submit the
                form &mdash; email {SITE.contactEmail} with your order code and TrxID
                and we&rsquo;ll sort it out.
              </p>
            </div>

            {/* ── Form ─────────────────────────────────────────── */}
            <div className="border border-noir-line bg-noir-raised/40 p-6 sm:p-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
                After you&rsquo;ve sent it
              </h2>
              <div className="mt-6">
                <CheckoutForm
                  orderId={order.id}
                  orderCode={order.order_code}
                  slug={caseFile.slug}
                  bkashNumber={bkashNumber}
                  amount={caseFile.priceBdt}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
