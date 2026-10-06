"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderCases } from "@/app/admin/(dashboard)/cases/actions";
import { DeleteCaseButton } from "@/components/admin/DeleteCaseButton";
import { RANKS, RANK_ORDER, formatTaka, type Rank } from "@/lib/cases";
import type { CaseRow } from "@/lib/cases-data";

/** Just what the table renders — keeps the client payload small. */
export type CaseListItem = Pick<
  CaseRow,
  | "id"
  | "case_number"
  | "slug"
  | "title"
  | "price"
  | "difficulty_rank"
  | "published"
  | "featured"
  | "thumbnail_url"
  | "case_pdf_path"
  | "solution_pdf_path"
>;

const BTN =
  "border border-noir-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors";

function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

type Groups = Record<Rank, CaseListItem[]>;

/** Split the list by rank, keeping catalogue order inside each rank. */
function byRank(items: CaseListItem[]): Groups {
  return Object.fromEntries(
    RANK_ORDER.map((r) => [r, items.filter((c) => c.difficulty_rank === r)]),
  ) as Groups;
}

const flat = (g: Groups) => RANK_ORDER.flatMap((r) => g[r]);

/**
 * The /admin case list, one section per rank. Rows can be dragged (mouse)
 * or nudged with the arrow buttons (touch, keyboard) within their rank.
 * Nothing is written until "Save order", which stores the catalogue as
 * Rookie → Senior → Master.
 */
export function CaseTable({ initial }: { initial: CaseListItem[] }) {
  const [groups, setGroups] = useState(() => byRank(initial));
  const [saved, setSaved] = useState(groups);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const savedIds = flat(saved).map((r) => r.id);
  const dirty = flat(groups).some((r, i) => r.id !== savedIds[i]);

  function moveIn(rank: Rank, from: number, to: number) {
    setGroups((g) => ({ ...g, [rank]: move(g[rank], from, to) }));
  }

  /** Drops only reorder within a rank; the rank itself is set in the form. */
  function dropOn(rank: Rank, targetId: string) {
    if (!dragging || dragging === targetId) return;
    const list = groups[rank];
    const from = list.findIndex((r) => r.id === dragging);
    if (from === -1) return;
    moveIn(rank, from, list.findIndex((r) => r.id === targetId));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await reorderCases(flat(groups).map((r) => r.id));
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(groups);
    });
  }

  function reset() {
    setGroups(saved);
    setError(null);
  }

  return (
    <div className="mt-8">
      {/* ── Order controls ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-b-0 border-noir-line bg-noir-raised/60 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
          {dirty ? (
            <span className="text-brass">Order changed &middot; not saved</span>
          ) : (
            <>Drag rows, or use the arrows, to set the order within each rank</>
          )}
        </p>
        <div className="flex items-center gap-2">
          {error && (
            <span role="alert" className="font-mono text-[10px] text-cream">
              {error}
            </span>
          )}
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || pending}
            className={`${BTN} text-ash hover:text-cream disabled:opacity-40`}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || pending}
            className="bg-brass px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-noir transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Saving…" : "Save order"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-noir-line">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-noir-raised font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            <tr>
              <th className="w-24 px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Case</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">PDFs</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          {RANK_ORDER.map((rank) => {
            const rows = groups[rank];
            return (
          <tbody key={rank} className="divide-y divide-noir-line border-t border-noir-line">
            <tr className="bg-noir-raised/40">
              <th colSpan={6} scope="rowgroup" className="px-4 py-3 text-left font-normal">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p>
                    <span className="font-display text-lg text-cream">{RANKS[rank].label}</span>
                    <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                      {rows.length} case{rows.length === 1 ? "" : "s"} &middot; solution +
                      {RANKS[rank].solutionDelayHours}h
                    </span>
                  </p>
                  <Link
                    href={`/admin/cases/new?rank=${rank}`}
                    className={`${BTN} text-brass hover:border-brass`}
                  >
                    + New {RANKS[rank].label} case
                  </Link>
                </div>
              </th>
            </tr>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                  No {RANKS[rank].label} cases yet.
                </td>
              </tr>
            )}
            {rows.map((c, i) => {
              const isDragging = dragging === c.id;
              const isOver = over === c.id && dragging !== c.id;
              return (
                <tr
                  key={c.id}
                  draggable
                  onDragStart={(e) => {
                    setDragging(c.id);
                    e.dataTransfer.effectAllowed = "move";
                    // Firefox needs data set or the drag never starts.
                    e.dataTransfer.setData("text/plain", c.id);
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setOver(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (over !== c.id) setOver(c.id);
                  }}
                  onDragLeave={() => {
                    if (over === c.id) setOver(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    dropOn(rank, c.id);
                    setOver(null);
                    setDragging(null);
                  }}
                  className={`transition-colors ${
                    isDragging ? "opacity-40" : ""
                  } ${isOver ? "bg-brass/10 [&>td:first-child]:border-l-2 [&>td:first-child]:border-brass" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        title="Drag to reorder"
                        className="cursor-grab select-none font-mono text-base leading-none text-ash active:cursor-grabbing"
                      >
                        ⋮⋮
                      </span>
                      <span className="w-6 font-mono text-[11px] text-ash">{i + 1}</span>
                      <span className="flex flex-col">
                        <button
                          type="button"
                          aria-label={`Move ${c.title} up`}
                          disabled={i === 0}
                          onClick={() => moveIn(rank, i, i - 1)}
                          className="px-1 font-mono text-[10px] leading-none text-ash hover:text-cream disabled:opacity-25"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${c.title} down`}
                          disabled={i === rows.length - 1}
                          onClick={() => moveIn(rank, i, i + 1)}
                          className="px-1 font-mono text-[10px] leading-none text-ash hover:text-cream disabled:opacity-25"
                        >
                          ▼
                        </button>
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden border border-noir-line bg-noir">
                        {c.thumbnail_url ? (
                          <Image src={c.thumbnail_url} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center font-mono text-[9px] text-ash">
                            none
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-cream">{c.title}</p>
                        <p className="truncate font-mono text-[10px] text-ash">
                          CASE {String(c.case_number).padStart(3, "0")} &middot; /{c.slug}
                          {c.featured && <span className="ml-2 text-brass">featured</span>}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-cream">{formatTaka(c.price)}</td>
                  <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em]">
                    <span className={c.case_pdf_path ? "text-cream" : "text-ash/50"}>case</span>
                    <span className="text-ash"> / </span>
                    <span className={c.solution_pdf_path ? "text-cream" : "text-ash/50"}>solution</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.published ? (
                      <span className="border border-brass/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-brass">
                        Published
                      </span>
                    ) : (
                      <span className="border border-noir-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/cases/${c.id}/edit`}
                        className={`${BTN} text-cream hover:border-brass`}
                      >
                        Edit
                      </Link>
                      <DeleteCaseButton id={c.id} title={c.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}
