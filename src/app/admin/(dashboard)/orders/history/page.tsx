import Link from "next/link";
import { formatTaka } from "@/lib/cases";
import { formatDateTimeBD } from "@/lib/orders";
import { getOrderHistoryAdmin } from "@/lib/orders-data";

export const metadata = { title: "Order history" };

export default async function OrderHistoryPage() {
  const orders = await getOrderHistoryAdmin();
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((sum, o) => sum + o.amount, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">Orders</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-cream">History</h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            {paid.length} paid &middot; {formatTaka(revenue)} &middot;{" "}
            {orders.length - paid.length} rejected
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash hover:text-cream"
        >
          &larr; Pending queue
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 border border-noir-line bg-noir-raised px-6 py-16 text-center">
          <p className="font-display text-2xl text-cream">Nothing decided yet.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto border border-noir-line">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-noir-raised font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
              <tr>
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Buyer</th>
                <th className="px-4 py-3 font-normal">Case</th>
                <th className="px-4 py-3 font-normal">Amount</th>
                <th className="px-4 py-3 font-normal">TrxID</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-line">
              {orders.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[12px] tracking-[0.1em] text-brass">{o.order_code}</p>
                    <p className="font-mono text-[10px] text-ash">
                      {formatDateTimeBD(o.approved_at ?? o.rejected_at ?? o.created_at)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-cream">{o.buyer_name}</p>
                    <p className="font-mono text-[10px] text-ash">{o.buyer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-cream">{o.case.title}</td>
                  <td className="px-4 py-3 font-mono text-cream">{formatTaka(o.amount)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] tracking-[0.08em] text-ash">
                    {o.submitted_trxid}
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "paid" ? (
                      <span className="border border-brass/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-brass">
                        Paid
                      </span>
                    ) : (
                      <>
                        <span className="border border-noir-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                          Rejected
                        </span>
                        {o.rejection_reason && (
                          <p className="mt-1 max-w-[16rem] text-xs text-ash">{o.rejection_reason}</p>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-ash">
                    {o.solution_send_at ? (
                      <>
                        {formatDateTimeBD(o.solution_send_at)}
                        <br />
                        <span className={o.solution_sent ? "text-brass" : ""}>
                          {o.solution_sent ? "sent" : "scheduled"}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
