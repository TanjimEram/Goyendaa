import Link from "next/link";
import { formatTaka } from "@/lib/cases";
import { freeCaseStatsAdmin, listLeadsAdmin, salesBySourceAdmin } from "@/lib/leads";
import { formatDateTimeBD } from "@/lib/orders";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const SELECT = "mt-1 border border-noir-line bg-noir-raised px-3 py-2 font-sans text-sm text-cream";

/** Filters from the URL: ?case=<slug>&consent=yes|no */
function filterFrom(sp: Record<string, string | string[] | undefined>) {
  const caseSlug = typeof sp.case === "string" && sp.case ? sp.case : undefined;
  const consent = sp.consent === "yes" ? true : sp.consent === "no" ? false : undefined;
  return { caseSlug, consent };
}

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const sp = await searchParams;
  const filter = filterFrom(sp);
  // Stats always cover every lead; the table follows the filters.
  const [all, leads, sales] = await Promise.all([
    listLeadsAdmin({}),
    listLeadsAdmin(filter),
    salesBySourceAdmin(),
  ]);
  const stats = await freeCaseStatsAdmin(all);
  const slugs = [...new Set(all.map((l) => l.case_slug))].sort();
  const exportQuery = new URLSearchParams({
    ...(filter.caseSlug ? { case: filter.caseSlug } : {}),
    ...(filter.consent !== undefined ? { consent: filter.consent ? "yes" : "no" } : {}),
  }).toString();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">Free cases</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-cream">Leads</h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            {all.length} total &middot; {all.filter((l) => l.consent).length} opted in to emails
          </p>
        </div>
        <a
          href={`/admin/leads/export${exportQuery ? `?${exportQuery}` : ""}`}
          className="border border-brass px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-brass hover:bg-brass hover:text-noir"
        >
          Export CSV
        </a>
      </div>

      {/* ── Per free case ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.slug} className="border border-noir-line bg-noir-raised p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brass">{s.slug}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
              <div><dt>Leads</dt><dd className="mt-1 text-xl text-cream">{s.leads}</dd></div>
              <div><dt>Downloads</dt><dd className="mt-1 text-xl text-cream">{s.downloads}</dd></div>
              <div><dt>Answer views</dt><dd className="mt-1 text-xl text-cream">{s.answerViews}</dd></div>
              <div><dt>Later bought</dt><dd className="mt-1 text-xl text-cream">{s.buyers}</dd></div>
            </dl>
          </div>
        ))}
        {stats.length === 0 && (
          <p className="text-sm text-ash">No leads yet. They appear here when someone plays a free case.</p>
        )}
      </div>

      {/* ── Which channel sells ── */}
      {sales.length > 0 && (
        <div className="mt-8 border border-noir-line bg-noir-raised p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brass">Paid orders by UTM source</p>
          <ul className="mt-3 grid gap-1 text-sm text-ash">
            {sales.map((s) => (
              <li key={s.source} className="flex justify-between gap-4">
                <span className="text-cream">{s.source}</span>
                <span className="font-mono">{s.orders} &middot; {formatTaka(s.revenue)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Filters (plain GET form, no JS) ── */}
      <form className="mt-8 flex flex-wrap items-end gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
        <label>
          Case
          <select name="case" defaultValue={filter.caseSlug ?? ""} className={`block ${SELECT}`}>
            <option value="">All cases</option>
            {slugs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Consent
          <select
            name="consent"
            defaultValue={filter.consent === undefined ? "" : filter.consent ? "yes" : "no"}
            className={`block ${SELECT}`}
          >
            <option value="">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <button type="submit" className="border border-noir-line px-4 py-2 text-cream hover:border-brass">
          Filter
        </button>
        {(filter.caseSlug || filter.consent !== undefined) && (
          <Link href="/admin/leads" className="py-2 hover:text-cream">Clear</Link>
        )}
      </form>

      <div className="mt-4 overflow-x-auto border border-noir-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-noir-raised font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            <tr>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Case</th>
              <th className="px-4 py-3 font-normal">Consent</th>
              <th className="px-4 py-3 font-normal">UTM source</th>
              <th className="px-4 py-3 font-normal">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-noir-line">
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3">
                  <p className="text-cream">{l.email}</p>
                  {l.name && <p className="text-xs text-ash">{l.name}</p>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ash">{l.case_slug}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.consent ? <span className="text-brass">Yes</span> : <span className="text-ash">No</span>}</td>
                <td className="px-4 py-3 font-mono text-xs text-ash">
                  {l.utm_source ?? "—"}
                  {(l.utm_medium || l.utm_campaign) && (
                    <span className="block text-[10px] text-ash/70">{[l.utm_medium, l.utm_campaign].filter(Boolean).join(" · ")}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-ash">{formatDateTimeBD(l.created_at)}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-ash">No leads match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
