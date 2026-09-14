import type { Metadata } from "next";
import Link from "next/link";
import { Section, TextPage } from "@/components/TextPage";
import { RANKS, RANK_ORDER } from "@/lib/cases";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service — Goyenda",
  description: "The terms you agree to when you buy a Goyenda case file.",
};

/*
 * DRAFT — written in plain language for a small digital-goods seller in
 * Bangladesh. Not legal advice. Have someone qualified read it before
 * launch, and keep SITE.legalUpdated current when the wording changes.
 */
export default function TermsPage() {
  return (
    <TextPage
      eyebrow="Legal"
      title="Terms of service."
      intro={
        <p>
          Short version: you&rsquo;re buying a fictional case file as a PDF for
          your own use. The solution comes later by email. No refunds once
          you&rsquo;ve downloaded. Don&rsquo;t redistribute it.
        </p>
      }
      updated={SITE.legalUpdated}
    >
      <Section n={1} title="Who you're dealing with">
        <p>
          {SITE.name} is operated by {SITE.operator}. These terms are a contract
          between you and that seller. If you have a question about them, write
          to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>
      </Section>

      <Section n={2} title="What you're buying">
        <p>
          Each case file is a digital product: a PDF evidence pack you download
          and print yourself, plus a separate solution document sent to your
          email after a delay. Nothing physical is shipped.
        </p>
        <p>
          The delay depends on the case&rsquo;s difficulty rank and starts the
          moment your payment is confirmed &mdash; not when you download:
        </p>
        <ul>
          {RANK_ORDER.map((r) => (
            <li key={r}>
              <strong>{RANKS[r].label}</strong> &mdash; solution emailed{" "}
              {RANKS[r].solutionDelayHours} hour
              {RANKS[r].solutionDelayHours === 1 ? "" : "s"} after payment.
            </li>
          ))}
        </ul>
        <p>
          Page counts, solve times and suspect counts on the site are estimates.
        </p>
      </Section>

      <Section n={3} title="Price and payment">
        <p>
          Prices are in Bangladeshi Taka (৳) and include everything &mdash;
          there are no extra charges from us. Payment is handled by a
          third-party aggregator; we never see your bKash, Nagad or card
          details. The aggregator&rsquo;s own terms apply to the transaction
          itself.
        </p>
        <p>
          An order is complete when the aggregator confirms payment to us. If
          money leaves your account but you never receive a download link,
          contact us with the transaction reference and we will sort it out.
        </p>
      </Section>

      <Section n={4} title="Delivery">
        <p>
          The download link appears on screen immediately after payment and is
          also emailed to the address you gave at checkout. The link stays
          valid for {SITE.downloadWindowDays} days and can be used as many
          times as you like within that window. Save the file.
        </p>
        <p>
          The solution is emailed to the same address at the scheduled time.
          It is your responsibility to give a working email address and to
          check your spam folder. If it hasn&rsquo;t arrived within an hour of
          the scheduled time, contact us and we will resend it.
        </p>
      </Section>

      <Section n={5} title="Refunds">
        <p>
          Because the product is a file you can copy, we cannot take it back.
          Our full policy is on the{" "}
          <Link href="/refunds">refund policy</Link> page. In brief: no refund
          once the case file has been downloaded; a full refund if we fail to
          deliver it; a partial refund at our discretion for a genuinely
          defective file.
        </p>
      </Section>

      <Section id="licence" n={6} title="Licence — what you may do with the file">
        <p>You may:</p>
        <ul>
          <li>Print as many copies as you need for your own game.</li>
          <li>Play it with friends, family, a class or a club, free of charge.</li>
          <li>Keep it forever and play it again.</li>
        </ul>
        <p>You may not:</p>
        <ul>
          <li>Share, upload, sell or give away the PDF or the solution.</li>
          <li>Run paid events with it without written permission from us.</li>
          <li>Post the solution or the key evidence publicly &mdash; it ruins it for everyone else.</li>
        </ul>
        <p>
          All content is copyright {SITE.name}. Buying a case gives you a
          personal licence to use it, not ownership of it.
        </p>
      </Section>

      <Section n={7} title="Everything is fiction">
        <p>
          Every case, person, place and event in a {SITE.name} file is
          invented. Cases may draw on general patterns found in real
          investigations, but none depicts, is based on, or is intended to
          resemble any real person, living or dead, or any real crime. Any
          resemblance is coincidental.
        </p>
      </Section>

      <Section n={8} title="Content and age">
        <p>
          Case files deal with fictional crimes, including death. Individual
          cases may carry a content note on their page. We suggest a minimum
          age of 14, or parental judgement below that.
        </p>
      </Section>

      <Section n={9} title="The website">
        <p>
          We try to keep the site accurate and available but don&rsquo;t promise
          it will always be. We may change prices, cases and these terms at any
          time; changes apply to purchases made after the change. Your privacy
          is covered by the <Link href="/privacy">privacy policy</Link>.
        </p>
      </Section>

      <Section n={10} title="Liability">
        <p>
          To the extent the law allows, our liability to you for anything
          arising from a purchase is limited to the amount you paid for it.
        </p>
      </Section>

      <Section n={11} title="Governing law">
        <p>
          These terms are governed by the laws of Bangladesh. If something goes
          wrong, please write to us first &mdash; almost everything can be fixed
          by email.
        </p>
      </Section>
    </TextPage>
  );
}
