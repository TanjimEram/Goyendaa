import type { Metadata } from "next";
import Link from "next/link";
import { TextPage } from "@/components/TextPage";
import { RANKS, RANK_ORDER } from "@/lib/cases";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How buying, printing and solving a Goyenda case file works.",
};

type QA = { q: string; a: React.ReactNode };
type Group = { heading: string; items: QA[] };

const GROUPS: Group[] = [
  {
    heading: "What it is",
    items: [
      {
        q: "What exactly do I get?",
        a: (
          <>
            A PDF evidence pack &mdash; the case brief, witness statements,
            interrogation transcripts, photographs, forensic notes, maps &mdash;
            that you print at home. Then, later, a second email with the
            sealed solution. Nothing is shipped.
          </>
        ),
      },
      {
        q: "Are the cases real?",
        a: (
          <>
            No. Every case, person and place is invented. We study how real
            investigations go wrong &mdash; alibis that partly hold, scenes
            that were staged &mdash; and build fiction on those patterns. No
            real victim&rsquo;s name appears anywhere, and none ever will.
          </>
        ),
      },
      {
        q: "How many people can play?",
        a: (
          <>
            One to as many as fit round a table. Most files play best with two
            to four; the case page says if a particular file leans solo or
            group. One purchase covers everyone you play with.
          </>
        ),
      },
      {
        q: "How long does a case take?",
        a: (
          <>
            Depends on the rank.{" "}
            {RANK_ORDER.map((r, i) => (
              <span key={r}>
                <strong>{RANKS[r].label}</strong> about {RANKS[r].timeRange}
                {i < RANK_ORDER.length - 1 ? "; " : "."}
              </span>
            ))}{" "}
            Every case page shows its estimate.
          </>
        ),
      },
    ],
  },
  {
    heading: "Buying",
    items: [
      {
        q: "How do I pay?",
        a: (
          <>
            bKash, Nagad or card, through a Bangladeshi payment aggregator. You
            don&rsquo;t need an account with us &mdash; just an email address
            for delivery.
          </>
        ),
      },
      {
        q: "Do I need to create an account?",
        a: <>No. Your email address is the only thing we ask for.</>,
      },
      {
        q: "Can I get a refund?",
        a: (
          <>
            If we fail to deliver, yes, in full. If you&rsquo;ve downloaded the
            file and changed your mind, no &mdash; it&rsquo;s a copyable PDF.
            The <Link href="/refunds">refund policy</Link> has the details.
          </>
        ),
      },
      {
        q: "Can I buy a case as a gift?",
        a: (
          <>
            Put the recipient&rsquo;s email at checkout and both the download
            link and the solution go to them. Bear in mind the solution timer
            starts at payment, so buy it when they&rsquo;re ready to play.
          </>
        ),
      },
    ],
  },
  {
    heading: "Printing and playing",
    items: [
      {
        q: "Do I have to print it?",
        a: (
          <>
            You can work it on a screen, but it&rsquo;s designed for paper:
            laying statements side by side is half the method. A4, any
            printer. Colour helps with the photographs but isn&rsquo;t required.
          </>
        ),
      },
      {
        q: "How long is the download link valid?",
        a: (
          <>
            {SITE.downloadWindowDays} days, unlimited downloads within that
            window. Save the PDF somewhere safe; after that the link expires.
            If you lose the file, email us with your order number.
          </>
        ),
      },
      {
        q: "I've played it. Can I play it again with other people?",
        a: (
          <>
            Yes. Reprint and hand it to a fresh group. What you can&rsquo;t do
            is give them the file or post the solution &mdash; see the licence
            in the <Link href="/terms">terms</Link>.
          </>
        ),
      },
    ],
  },
  {
    heading: "The solution",
    items: [
      {
        q: "Why isn't the solution in the download?",
        a: (
          <>
            Because a mystery you can spoil in ten seconds isn&rsquo;t worth
            solving. Holding it back for a few hours means you have to commit
            to an answer before you can check it.
          </>
        ),
      },
      {
        q: "When exactly does it arrive?",
        a: (
          <>
            {RANK_ORDER.map((r, i) => (
              <span key={r}>
                {RANKS[r].label}: {RANKS[r].solutionDelayHours} hour
                {RANKS[r].solutionDelayHours === 1 ? "" : "s"}
                {i < RANK_ORDER.length - 1 ? " · " : ""}
              </span>
            ))}{" "}
            after your payment is confirmed &mdash; not after you download, and
            not after you finish. The confirmation page shows the exact time in
            Bangladesh time.
          </>
        ),
      },
      {
        q: "What if I finish early and can't wait?",
        a: (
          <>
            Argue about it. Write your suspect and your reasoning down. The
            wait is the point &mdash; and it isn&rsquo;t long.
          </>
        ),
      },
      {
        q: "The solution email hasn't come.",
        a: (
          <>
            Check spam and promotions first. If it&rsquo;s more than an hour
            past the scheduled time, email{" "}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>{" "}
            with your order number and we&rsquo;ll resend it.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <TextPage
      eyebrow="Help"
      title="Questions, answered."
      intro={
        <p>
          If yours isn&rsquo;t here, <Link href="/contact" className="text-cream underline underline-offset-4 hover:text-brass">write to us</Link>.
        </p>
      }
    >
      <div className="flex flex-col gap-12">
        {GROUPS.map((group) => (
          <section key={group.heading}>
            <h2 className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
              <span className="inline-block h-1.5 w-1.5 bg-blood" aria-hidden />
              {group.heading}
            </h2>
            <div className="mt-4 divide-y divide-noir-line border-y border-noir-line">
              {group.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 font-display text-lg text-cream transition-colors hover:text-brass [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 font-mono text-sm text-brass transition-transform duration-300 ease-noir group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="prose-noir pb-5 text-[15px] leading-[1.8] text-ash">
                    <p>{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </TextPage>
  );
}
