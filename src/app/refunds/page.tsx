import type { Metadata } from "next";
import Link from "next/link";
import { Section, TextPage } from "@/components/TextPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund policy — Goyenda",
  description: "When Goyenda refunds a purchase, and when it can't.",
};

/* DRAFT — see note in terms/page.tsx. */
export default function RefundsPage() {
  return (
    <TextPage
      eyebrow="Legal"
      title="Refund policy."
      intro={
        <p>
          A case file is a PDF. Once it&rsquo;s on your device we can&rsquo;t
          take it back, so the rules are strict but fair: we refund when we
          fail you, not when you change your mind.
        </p>
      }
      updated={SITE.legalUpdated}
    >
      <Section n={1} title="Full refund — our fault">
        <p>You get every taka back if:</p>
        <ul>
          <li>You paid but never received a working download link, and we couldn&rsquo;t provide one within 24 hours of you telling us.</li>
          <li>The file is corrupt or unreadable and we can&rsquo;t supply a working copy.</li>
          <li>We took payment twice for the same case.</li>
        </ul>
      </Section>

      <Section n={2} title="No refund — change of mind">
        <p>We can&rsquo;t refund once the case file has been downloaded, including if:</p>
        <ul>
          <li>You found it too easy, too hard, or not to your taste.</li>
          <li>You solved it quickly.</li>
          <li>You bought the wrong case &mdash; but tell us before you download and we&rsquo;ll swap it.</li>
          <li>You didn&rsquo;t read the difficulty rank, content note or page count on the case page.</li>
        </ul>
      </Section>

      <Section n={3} title="Partial refund — at our discretion">
        <p>
          If a file has a genuine defect that spoils the case &mdash; a missing
          page, a printing error that hides a clue, a solution that
          doesn&rsquo;t match the evidence &mdash; tell us. We&rsquo;ll fix the
          file for everyone and offer you a partial refund or a free case, at
          our discretion.
        </p>
      </Section>

      <Section n={4} title="The solution email">
        <p>
          A late or missing solution email is not grounds for a refund of the
          case file; it&rsquo;s grounds for us to resend it, which we will do
          promptly. If the solution never reaches you despite our efforts,
          we&rsquo;ll refund in full.
        </p>
      </Section>

      <Section n={5} title="How to ask">
        <p>
          Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>{" "}
          with your order number and what went wrong. We reply within two
          working days. Refunds go back by the method you paid with; how long
          that takes depends on bKash, Nagad or your bank.
        </p>
        <p>
          This policy is part of our <Link href="/terms">terms of service</Link>.
        </p>
      </Section>
    </TextPage>
  );
}
