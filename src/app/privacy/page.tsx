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
          solution: an email address and a payment record. No accounts and no
          selling data. We do use Meta&rsquo;s ad-measurement tools; section 4
          says exactly what they share.
        </p>
      }
      updated={SITE.legalUpdated}
    >
      <Section n={1} title="What we collect">
        <ul>
          <li><strong>Email address</strong> &mdash; given at checkout. Used to send the download link and the solution.</li>
          <li><strong>Free cases</strong> &mdash; your email, your name if you give it, which free case you took, whether you ticked &ldquo;send me new cases and weekly free puzzles&rdquo;, and which link brought you to the site (for example a Facebook post). We email you about new cases only if you ticked that box, and every email has an unsubscribe link.</li>
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
          <li><strong>Meta</strong> (Facebook / Instagram) &mdash; measures our ads; see section 4.</li>
        </ul>
        <p>
          Each sees only what it needs to do its job. We don&rsquo;t sell,
          rent or share your data with anyone else.
        </p>
      </Section>

      <Section n={3} title="Cookies">
        <p>
          The Meta Pixel (section 4) sets two first-party cookies,{" "}
          <code>_fbp</code> and, when you arrive from a Meta ad,{" "}
          <code>_fbc</code>. Checkout also sets one cookie that keeps your
          order code the same if you refresh the page. The admin login has its
          own cookies, which you will never encounter.
        </p>
      </Section>

      <Section n={4} title="Advertising measurement (Meta)">
        <p>
          We use the <strong>Meta Pixel</strong> and Meta&rsquo;s{" "}
          <strong>Conversions API</strong> to see which of our Facebook and
          Instagram ads lead to visits and purchases. This is measurement
          only; we don&rsquo;t build profiles and we don&rsquo;t sell data.
        </p>
        <ul>
          <li><strong>In your browser</strong>, on public pages, the Pixel tells Meta which page you viewed and which case you looked at or started buying, along with your IP address, browser details and the <code>_fbp</code>/<code>_fbc</code> cookies. It never runs on your private order page.</li>
          <li><strong>From our server</strong>, when your payment is confirmed: the case and the amount paid, your email address <em>hashed</em> (scrambled one way with SHA-256, so Meta can match it to an account but we never send it as text), and the IP address, browser details and cookies from checkout. We delete that IP address and browser information from your order once it has been sent.</li>
        </ul>
        <p>
          Meta handles this under its own privacy policy. To opt out, write to{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> and
          we&rsquo;ll stop sending your purchases to Meta. You can also limit ad
          tracking in your Facebook or Instagram ad settings, or block
          third-party trackers in your browser.
        </p>
      </Section>

      <Section n={5} title="How long we keep it">
        <p>
          Order records are kept for as long as we need to honour the licence
          you bought and to meet any accounting obligation &mdash; in practice a
          few years. Email us to have your order records deleted once the
          solution has been delivered; we&rsquo;ll keep only what a refund
          dispute or tax record requires.
        </p>
      </Section>

      <Section n={6} title="Your rights">
        <p>
          You can ask what we hold about you, ask us to correct it, or ask us
          to delete it. Write to{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> from
          the address you used at checkout.
        </p>
      </Section>

      <Section n={7} title="Children">
        <p>
          The site isn&rsquo;t aimed at children under 14 and we don&rsquo;t
          knowingly collect their data. If a child has bought a case with your
          details, tell us and we&rsquo;ll delete the record.
        </p>
      </Section>

      <Section n={8} title="Changes">
        <p>
          If this policy changes in a way that matters, the date at the top
          moves and the change is described here. Continuing to buy after a
          change means you accept it.
        </p>
      </Section>
    </TextPage>
  );
}
