import type { Metadata } from "next";
import { Section, TextPage } from "@/components/TextPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Goyenda collects, why, and who sees it.",
};

/* DRAFT — see note in terms/page.tsx. Update section 2 when the payment
 * provider and email service are chosen. */
export default function PrivacyPage() {
  return (
    <TextPage
      eyebrow="Legal"
      title="Privacy policy."
      intro={
        <p>
          We collect the minimum needed to sell you a file and send you the
          solution: an email address and a payment record. No accounts, no
          tracking pixels, no selling data.
        </p>
      }
      updated={SITE.legalUpdated}
    >
      <Section n={1} title="What we collect">
        <ul>
          <li><strong>Email address</strong> &mdash; given at checkout. Used to send the download link and the solution.</li>
          <li><strong>Order details</strong> &mdash; which case, the price, the time of payment, the payment method you chose, and the aggregator&rsquo;s transaction reference. Not your bKash/Nagad number or card details; the aggregator keeps those and we never see them.</li>
          <li><strong>Basic server logs</strong> &mdash; IP address, browser type and pages requested, kept briefly by our hosting provider for security and debugging.</li>
        </ul>
        <p>That&rsquo;s all. There are no user accounts and no profiles.</p>
      </Section>

      <Section n={2} title="Who else handles it">
        <p>Your data passes through the services that run the site:</p>
        <ul>
          <li><strong>Cloudflare</strong> &mdash; hosts the site and serves the pages.</li>
          <li><strong>Supabase</strong> &mdash; stores orders and the case files.</li>
          <li><strong>A payment aggregator</strong> &mdash; processes the payment under its own privacy policy.</li>
          <li><strong>An email delivery service</strong> &mdash; sends the download link and solution.</li>
        </ul>
        <p>
          Each sees only what it needs to do its job. We don&rsquo;t sell,
          rent or share your data with anyone else.
        </p>
      </Section>

      <Section n={3} title="Cookies">
        <p>
          The public site sets no tracking cookies. The only cookies in use are
          for the site owner&rsquo;s admin login, which you will never encounter.
          There is no analytics script.
        </p>
      </Section>

      <Section n={4} title="How long we keep it">
        <p>
          Order records are kept for as long as we need to honour the licence
          you bought and to meet any accounting obligation &mdash; in practice a
          few years. Email us to have your order records deleted once the
          solution has been delivered; we&rsquo;ll keep only what a refund
          dispute or tax record requires.
        </p>
      </Section>

      <Section n={5} title="Your rights">
        <p>
          You can ask what we hold about you, ask us to correct it, or ask us
          to delete it. Write to{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> from
          the address you used at checkout.
        </p>
      </Section>

      <Section n={6} title="Children">
        <p>
          The site isn&rsquo;t aimed at children under 14 and we don&rsquo;t
          knowingly collect their data. If a child has bought a case with your
          details, tell us and we&rsquo;ll delete the record.
        </p>
      </Section>

      <Section n={7} title="Changes">
        <p>
          If this policy changes in a way that matters, the date at the top
          moves and the change is described here. Continuing to buy after a
          change means you accept it.
        </p>
      </Section>
    </TextPage>
  );
}
