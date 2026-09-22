import "server-only";

import { serverEnv } from "@/lib/env";
import { SITE } from "@/lib/site";

/**
 * Transactional email. Plain fetch against a REST API — no SDK, nothing
 * Node-specific, so it runs in the Worker as-is.
 *
 * Two providers, picked by whichever key is set:
 *
 *   BREVO_API_KEY   Brevo verifies a SINGLE SENDER ADDRESS by emailing it a
 *                   code, so a plain gmail.com From works with no domain.
 *                   300 mails/day free. This is the one that can reach real
 *                   buyers today.
 *   RESEND_API_KEY  Nicer API, but with no verified domain it only delivers
 *                   to the Resend account owner — admin alerts only. Becomes
 *                   the better choice once a domain exists.
 *
 * Brevo wins if both are set. With neither, every send is a no-op that logs,
 * so local checkout testing works before email is configured.
 */
export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

type SendResult = { ok: boolean; id?: string; error?: string };

/** "Goyenda <x@y.com>" → { name: "Goyenda", email: "x@y.com" } */
function parseFrom(from: string): { name?: string; email: string } {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return match ? { name: match[1] || undefined, email: match[2] } : { email: from.trim() };
}

export async function sendMail(mail: Mail): Promise<SendResult> {
  const [brevoKey, resendKey, configuredFrom] = await Promise.all([
    serverEnv("BREVO_API_KEY"),
    serverEnv("RESEND_API_KEY"),
    serverEnv("EMAIL_FROM"),
  ]);
  const replyTo = mail.replyTo ?? SITE.contactEmail;

  if (brevoKey) {
    return sendViaBrevo(mail, brevoKey, configuredFrom ?? `Goyenda <${SITE.contactEmail}>`, replyTo);
  }
  if (resendKey) {
    return sendViaResend(mail, resendKey, configuredFrom ?? "Goyenda <onboarding@resend.dev>", replyTo);
  }

  console.warn(`[email] no provider key set — would send "${mail.subject}" to ${mail.to}`);
  return { ok: false, error: "email not configured" };
}

async function sendViaBrevo(
  mail: Mail,
  key: string,
  from: string,
  replyTo: string,
): Promise<SendResult> {
  const sender = parseFrom(from);
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender,
      to: [{ email: mail.to }],
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
      replyTo: { email: replyTo },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Brevo ${res.status}: ${body}`);
    return { ok: false, error: `Brevo ${res.status}` };
  }
  const data = (await res.json().catch(() => ({}))) as { messageId?: string };
  return { ok: true, id: data.messageId };
}

async function sendViaResend(
  mail: Mail,
  key: string,
  from: string,
  replyTo: string,
): Promise<SendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      reply_to: replyTo,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend ${res.status}: ${body}`);
    return { ok: false, error: `Resend ${res.status}` };
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: data.id };
}

// ── Templates ───────────────────────────────────────────────────────────
// Deliberately plain: dark background, cream text, one brass rule. Email
// clients mangle anything fancier.

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#121110;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#121110;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a1815;border:1px solid #2a2724;">
<tr><td style="padding:28px 28px 8px;font-family:Georgia,serif;font-size:22px;letter-spacing:0.14em;color:#efe6d5;">GOYENDA</td></tr>
<tr><td style="padding:0 28px;"><div style="height:1px;background:#c9a96a;"></div></td></tr>
<tr><td style="padding:20px 28px 8px;font-family:Georgia,serif;font-size:24px;line-height:1.2;color:#efe6d5;">${title}</td></tr>
<tr><td style="padding:0 28px 28px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#8c857a;">${bodyHtml}</td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#7a6743;">Every Goyenda case is a work of fiction. Questions: ${SITE.contactEmail}</p>
</td></tr></table></body></html>`;
}

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 0;font-family:Courier,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8c857a;width:140px;">${k}</td><td style="padding:6px 0;color:#efe6d5;">${v}</td></tr>`;

const button = (href: string, label: string) =>
  `<p style="margin:24px 0 8px;"><a href="${href}" style="display:inline-block;background:#b3231c;color:#efe6d5;text-decoration:none;padding:14px 22px;font-family:Courier,monospace;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;">${label} →</a></p>`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface OrderMailInfo {
  orderCode: string;
  buyerName: string;
  buyerEmail: string;
  caseTitle: string;
  caseCode: string;
  amount: number;
  trxId: string;
  statusUrl: string;
}

/** To the admin: a new order needs checking against the bKash app. */
export function adminNewOrderMail(o: OrderMailInfo, adminUrl: string): Omit<Mail, "to"> {
  const amount = `৳ ${o.amount}`;
  return {
    subject: `[Goyenda] New order ${o.orderCode} — ${amount} — ${o.caseTitle}`,
    text: `New pending order.\n\nOrder: ${o.orderCode}\nBuyer: ${o.buyerName} <${o.buyerEmail}>\nCase: ${o.caseCode} — ${o.caseTitle}\nAmount: ${amount}\nTrxID: ${o.trxId}\n\nCheck bKash for a Send Money of ${amount} with TrxID ${o.trxId}, then approve or reject at ${adminUrl}`,
    html: shell(
      "New order to verify.",
      `<p>Open bKash and look for a <strong style="color:#efe6d5">Send Money of ${amount}</strong> with this TrxID.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
${row("Order", `<strong>${esc(o.orderCode)}</strong>`)}
${row("TrxID", `<strong style="font-family:Courier,monospace;font-size:16px;letter-spacing:0.08em;">${esc(o.trxId)}</strong>`)}
${row("Amount", amount)}
${row("Buyer", `${esc(o.buyerName)}<br><span style="color:#8c857a">${esc(o.buyerEmail)}</span>`)}
${row("Case", `${esc(o.caseCode)} — ${esc(o.caseTitle)}`)}
</table>
${button(adminUrl, "Open pending orders")}`,
    ),
  };
}

/** To the buyer: we've got your details, hang tight. */
export function buyerOrderReceivedMail(o: OrderMailInfo, confirmWindow: string): Omit<Mail, "to"> {
  return {
    subject: `Order ${o.orderCode} received — ${o.caseTitle}`,
    text: `Thanks, ${o.buyerName}. We've received your order ${o.orderCode} for ${o.caseTitle} (৳ ${o.amount}, TrxID ${o.trxId}).\n\nWe check every payment by hand. You'll get another email with your download link once it's confirmed — ${confirmWindow}.\n\nTrack it here: ${o.statusUrl}`,
    html: shell(
      "Order received.",
      `<p>Thanks, ${esc(o.buyerName)}. Your details are in and the order is <strong>pending confirmation</strong>.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
${row("Order", `<strong>${esc(o.orderCode)}</strong>`)}
${row("Case", esc(o.caseTitle))}
${row("Amount", `৳ ${o.amount}`)}
${row("TrxID", esc(o.trxId))}
</table>
<p>We check every bKash payment by hand — ${esc(confirmWindow)}. When it's confirmed you'll get a second email with your download link, and the solution timer starts from that moment.</p>
${button(o.statusUrl, "Track this order")}
<p style="font-size:13px;">If anything on the form was wrong, reply to this email with your order code.</p>`,
    ),
  };
}

/** To the buyer: the wait is over — the sealed solution is unlocked. */
export function buyerSolutionMail(
  o: OrderMailInfo,
  opts: { solutionUrl: string; heldHours: number },
): Omit<Mail, "to"> {
  return {
    subject: `The solution — ${o.caseTitle} (${o.orderCode})`,
    text: `Time's up, ${o.buyerName}.

The sealed solution to ${o.caseTitle} is here: ${opts.solutionUrl}

Read it only once everyone has named a suspect. Order ${o.orderCode}.`,
    html: shell(
      "Time's up.",
      `<p>The sealed solution to <strong style="color:#efe6d5">${esc(o.caseTitle)}</strong> is unlocked &mdash; ${opts.heldHours} hour${opts.heldHours === 1 ? "" : "s"} after your payment was confirmed, exactly as promised.</p>
${button(opts.solutionUrl, "Read the solution")}
<p style="font-size:13px;">Open it only once everyone at the table has committed to a suspect. There's no going back.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
${row("Order", esc(o.orderCode))}
${row("Case", `${esc(o.caseCode)} — ${esc(o.caseTitle)}`)}
</table>`,
    ),
  };
}

/** To the admin: a solution came due but couldn't be sent. */
export function adminSolutionFailedMail(
  o: OrderMailInfo,
  reason: string,
  adminUrl: string,
): Omit<Mail, "to"> {
  return {
    subject: `[Goyenda] Solution delivery failed — ${o.orderCode}`,
    text: `The solution for ${o.orderCode} (${o.caseTitle}, ${o.buyerEmail}) came due but could not be sent.

Reason: ${reason}

Fix it and the cron will retry, or send the buyer ${o.statusUrl} by hand. Orders: ${adminUrl}`,
    html: shell(
      "A solution didn't go out.",
      `<p>Order <strong style="color:#efe6d5">${esc(o.orderCode)}</strong> came due and the send failed.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
${row("Case", `${esc(o.caseCode)} — ${esc(o.caseTitle)}`)}
${row("Buyer", esc(o.buyerEmail))}
${row("Reason", `<strong>${esc(reason)}</strong>`)}
</table>
<p style="font-size:13px;">The job retries every run until it works or hits the attempt cap. This alert is sent once, on the first failure.</p>
${button(adminUrl, "Open orders")}`,
    ),
  };
}

/** To the buyer: approved — here's the file, here's when the solution lands. */
export function buyerOrderApprovedMail(
  o: OrderMailInfo,
  opts: { downloadUrl: string; solutionAtText: string; solutionDelayHours: number; downloadWindowDays: number },
): Omit<Mail, "to"> {
  return {
    subject: `Your case file is ready — ${o.caseTitle} (${o.orderCode})`,
    text: `Payment confirmed, ${o.buyerName}.\n\nDownload ${o.caseTitle}: ${opts.downloadUrl}\n(Link works for ${opts.downloadWindowDays} days.)\n\nThe solution will be emailed to this address at ${opts.solutionAtText} — ${opts.solutionDelayHours} hour(s) from confirmation. It isn't in the download.\n\nOrder ${o.orderCode}.`,
    html: shell(
      "The file is yours.",
      `<p>Payment confirmed, ${esc(o.buyerName)}. <strong>${esc(o.caseTitle)}</strong> is ready.</p>
${button(opts.downloadUrl, "Download case file")}
<p style="font-size:13px;">The link works for ${opts.downloadWindowDays} days, as many times as you like. Print on A4 — colour if you can.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
${row("Order", esc(o.orderCode))}
${row("Solution", `<strong>${esc(opts.solutionAtText)}</strong> Bangladesh time`)}
</table>
<p>The sealed solution arrives by email <strong>${opts.solutionDelayHours} hour${opts.solutionDelayHours === 1 ? "" : "s"} from now</strong>. It isn't in the download, so there's nothing to peek at. Commit to a suspect before it lands.</p>`,
    ),
  };
}
