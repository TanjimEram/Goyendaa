import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DifficultyBadge } from "@/components/CaseCard";
import { AnswerGate } from "@/components/FreeCase";
import { SolutionCountdown } from "@/components/SolutionCountdown";
import { TextPage } from "@/components/TextPage";
import { RANK_ORDER, formatTaka } from "@/lib/cases";
import { getPublishedCases } from "@/lib/cases-data";
import { answerOpensAt, getFreeCase, leadCookie, leadForCase, leadHit } from "@/lib/leads";
import { renderMarkdown } from "@/lib/markdown";
import { formatDateTimeBD } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Not linked publicly, never indexed (the URL may carry a lead token).
export const metadata: Metadata = {
  title: "The answer",
  robots: { index: false, follow: false },
};

/**
 * A free case's answer. Reachable only with a lead for this case: ?t= from
 * the email, or the case cookie set by the "Play free" form. Anyone else
 * gets the email form. The admin can lock it until a date (answer_unlock_at)
 * to hold it back after a social post; until then, a countdown.
 */
export default async function AnswerPage({ params, searchParams }: PageProps<"/cases/[slug]/answer">) {
  const { slug } = await params;
  const t = (await searchParams).t;
  const freeCase = await getFreeCase(slug);
  if (!freeCase) notFound();

  const token = (typeof t === "string" ? t : undefined) ?? (await cookies()).get(leadCookie(slug))?.value;
  const lead = await leadForCase(token, slug).catch(() => null);

  if (!lead) {
    return (
      <TextPage
        eyebrow={`${freeCase.title} · The answer`}
        title="Enter your email to see the answer."
        intro={<p>The answer is for detectives who played the case. Leave your email and it opens right here.</p>}
      >
        <div className="max-w-md">
          <AnswerGate slug={slug} />
        </div>
      </TextPage>
    );
  }

  // Held back until the later of a fixed date and this visitor's own delay.
  const unlockAt = answerOpensAt(freeCase, lead.created_at);
  if (unlockAt) {
    const when = formatDateTimeBD(unlockAt);
    return (
      <TextPage
        eyebrow={`${freeCase.title} · The answer`}
        title="Sealed — for now."
        intro={<p>Come back on {when} (Dhaka time) for the solution.</p>}
      >
        <p className="font-display text-2xl text-cream">
          Unlocks <SolutionCountdown solutionAt={unlockAt} fallback={`on ${when}`} />.
        </p>
        <p className="mt-4 text-sm leading-[1.7] text-ash">
          Still working on it? Good. <Link href={`/cases/${slug}`} className="text-brass underline underline-offset-4">Back to the case</Link>
        </p>
      </TextPage>
    );
  }

  await leadHit(lead.token, "answer");

  // A public case-media URL with an unguessable name (see CaseRow).
  const imageUrl = freeCase.answer_image_path;

  // Paid cases for the next step, Rookie first.
  const paid = (await getPublishedCases())
    .filter((c) => !c.isFree)
    .sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank));
  const first = paid[0];

  return (
    <TextPage eyebrow={`${freeCase.title} · The answer`} title="The answer.">
      {freeCase.answer_md ? (
        <div
          className="prose-noir answer-md flex flex-col gap-4 text-[16px] leading-[1.8] text-ash [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-cream [&_h3]:mt-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-cream [&_h4]:font-display [&_h4]:text-lg [&_h4]:text-cream [&_strong]:text-cream"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(freeCase.answer_md) }}
        />
      ) : (
        <p className="text-ash">The answer hasn&rsquo;t been posted yet. Check back soon.</p>
      )}
      {imageUrl && (
        // Plain img: the optimiser would add nothing for one image here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="mt-8 w-full border border-noir-line" />
      )}

      {paid.length > 0 && (
        <section className="mt-16 border border-brass/50 bg-noir-raised p-6 sm:p-8">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
            <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
            Ready for a real case?
          </p>
          <ul className="mt-6 flex flex-col divide-y divide-noir-line">
            {paid.map((c) => (
              <li key={c.slug} className="py-4">
                <Link href={`/cases/${c.slug}`} className="group flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <span>
                    <span className="font-display text-xl text-cream group-hover:text-brass">{c.title}</span>
                    <span className="mt-1 block text-sm leading-[1.6] text-ash">{c.premise}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <DifficultyBadge rank={c.rank} />
                    <span className="font-display text-lg text-brass">{formatTaka(c.priceBdt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {first && (
            <Link
              href={`/cases/${first.slug}`}
              className="mt-6 inline-flex items-center gap-3 bg-blood px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors duration-300 ease-noir hover:bg-blood-hot"
            >
              Start with {first.title} <span aria-hidden>&rarr;</span>
            </Link>
          )}
        </section>
      )}
    </TextPage>
  );
}
