import type { Metadata } from "next";
import Link from "next/link";
import { TextPage } from "@/components/TextPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Goyenda",
  description: "How to reach Goyenda about an order, a case, or anything else.",
};

const REASONS = [
  {
    title: "An order",
    body: "Missing download link, solution not arrived, paid twice. Include your order number and the email you used at checkout.",
  },
  {
    title: "A mistake in a case",
    body: "A clue that doesn't add up, a page that won't print, a typo in a statement. Tell us the case and the page. We fix files for everyone.",
  },
  {
    title: "Running an event",
    body: "Want to use a case for a paid event, a class, or a club night? Ask — we usually say yes.",
  },
  {
    title: "Anything else",
    body: "Press, collaborations, a case idea you can't stop thinking about.",
  },
];

export default function ContactPage() {
  return (
    <TextPage
      eyebrow="Contact"
      title="Write to us."
      intro={
        <p>
          One person reads this inbox. Replies come within two working days,
          usually sooner. For quick answers, the{" "}
          <Link href="/faq" className="text-cream underline underline-offset-4 hover:text-brass">FAQ</Link>{" "}
          covers most of it.
        </p>
      }
    >
      <div className="border border-brass bg-noir-raised p-6 shadow-stamp sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Email
        </p>
        <a
          href={`mailto:${SITE.contactEmail}`}
          className="mt-3 block break-all font-display text-2xl font-semibold text-cream underline decoration-brass-dim underline-offset-8 transition-colors hover:text-brass sm:text-3xl"
        >
          {SITE.contactEmail}
        </a>
        <p className="mt-4 text-sm leading-[1.7] text-ash">
          Replying to any Goyenda email &mdash; your download link, your
          solution &mdash; also reaches us.
        </p>
      </div>

      <ul className="mt-10 grid gap-px border border-noir-line bg-noir-line sm:grid-cols-2">
        {REASONS.map((r) => (
          <li key={r.title} className="bg-noir p-5">
            <p className="font-display text-lg text-cream">{r.title}</p>
            <p className="mt-2 text-sm leading-[1.7] text-ash">{r.body}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 border-l-2 border-brass-dim pl-4 font-mono text-[11px] leading-[1.9] tracking-[0.06em] text-ash">
        Please don&rsquo;t send solutions or spoilers &mdash; even to us. If
        you think a case has a flaw, describe where, not what.
      </p>
    </TextPage>
  );
}
