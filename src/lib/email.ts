import "server-only";

import { serverEnv } from "@/lib/env";
import { SITE } from "@/lib/site";

/**
 * Transactional email via Resend's REST API. Plain fetch — no SDK, nothing
 * Node-specific, runs fine in the Worker.
 *
 * Without RESEND_API_KEY every send is a no-op that logs, so local checkout
 * testing works before email is configured. With Resend's free tier and no
 * verified domain, EMAIL_FROM must be `onboarding@resend.dev` and mail only
 * reaches the account owner's address — fine for admin notifications, not
 * for buyers. Verify a domain before launch.
 */
export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendMail(mail: Mail): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = await serverEnv("RESEND_API_KEY");
  const from = (await serverEnv("EMAIL_FROM")) ?? "Goyenda <onboarding@resend.dev>";

  if (!key) {
    console.warn(`[email] RESEND_API_KEY not set — would send "${mail.subject}" to ${mail.to}`);
    return { ok: false, error: "email not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      reply_to: mail.replyTo ?? SITE.contactEmail,
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
