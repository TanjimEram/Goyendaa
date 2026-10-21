import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TextPage } from "@/components/TextPage";
import { unsubscribeByToken } from "@/lib/leads";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

async function unsubscribe(formData: FormData) {
  "use server";
  await unsubscribeByToken(String(formData.get("t") ?? ""));
  redirect("/unsubscribe?done=1");
}

/**
 * The unsubscribe link in every free-case email. A button rather than a
 * plain GET, so mail scanners that prefetch links can't unsubscribe anyone.
 * Sets consent = no on every lead with that email.
 */
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const sp = await searchParams;
  const t = typeof sp.t === "string" ? sp.t : "";
  const done = sp.done === "1";

  return (
    <TextPage
      eyebrow="Email"
      title={done ? "You're unsubscribed." : "Unsubscribe from Goyenda emails?"}
      intro={
        <p>
          {done
            ? "We won't send you new cases or puzzles. Links to cases you already have keep working."
            : "You'll stop getting new cases and weekly free puzzles. Links to cases you already have keep working."}
        </p>
      }
    >
      {!done && t && (
        <form action={unsubscribe}>
          <input type="hidden" name="t" value={t} />
          <button
            type="submit"
            className="bg-blood px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-cream transition-colors duration-300 ease-noir hover:bg-blood-hot"
          >
            Unsubscribe
          </button>
        </form>
      )}
      {!done && !t && (
        <p className="text-ash">
          This link is incomplete. Write to <a className="text-brass underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> and we&rsquo;ll take you off the list.
        </p>
      )}
    </TextPage>
  );
}
