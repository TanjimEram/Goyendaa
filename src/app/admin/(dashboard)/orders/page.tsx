import Link from "next/link";
import { OrderReview, type PendingOrderItem } from "@/components/admin/OrderReview";
import { getPendingOrdersAdmin } from "@/lib/orders-data";

export const metadata = { title: "Pending orders" };

export default async function PendingOrdersPage() {
  const orders = await getPendingOrdersAdmin();

  const items: PendingOrderItem[] = orders.map((o) => ({
    id: o.id,
    order_code: o.order_code,
    buyer_name: o.buyer_name ?? "",
    buyer_email: o.buyer_email ?? "",
    amount: o.amount,
    submitted_trxid: o.submitted_trxid ?? "",
    submitted_at: o.submitted_at ?? o.created_at,
    case_title: o.case.title,
    case_code: `CASE ${String(o.case.case_number).padStart(3, "0")}`,
    case_rank: o.case.difficulty_rank,
    has_pdf: Boolean(o.case.case_pdf_path),
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">Orders</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-cream">
            {items.length} awaiting verification
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ash">
            Open the bKash app, find a Send Money for the amount with the matching TrxID,
            then approve. Approving emails the download link and starts the solution clock.
          </p>
        </div>
        <Link
          href="/admin/orders/history"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash hover:text-cream"
        >
          History &rarr;
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 border border-noir-line bg-noir-raised px-6 py-16 text-center">
          <p className="font-display text-2xl text-cream">Queue is clear.</p>
          <p className="mt-2 text-sm text-ash">New orders arrive here and by email.</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {items.map((o) => (
            <OrderReview key={o.id} order={o} />
          ))}
        </ul>
      )}
    </>
  );
}
