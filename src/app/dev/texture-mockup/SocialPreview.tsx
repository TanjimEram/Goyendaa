/**
 * MOCKUP ONLY: social-post frames (1080×1080 and 1080×1350) built at full
 * size with the site's dot screen and grain tile, then scaled down to fit.
 */
import { RANKS, type CaseFile } from "@/lib/cases";
import { SITE } from "@/lib/site";

function Frame({ caseFile, height }: { caseFile: CaseFile; height: number }) {
  const host = new URL(SITE.url).host;
  return (
    <figure className="flex flex-col gap-3">
      <div
        className="overflow-hidden border border-noir-line"
        style={{ width: "calc(1080px * var(--tx-social-scale))", height: `calc(${height}px * var(--tx-social-scale))` }}
      >
        <div className="tx-social-frame" style={{ height }}>
          <div aria-hidden className="tx-social-dots" />
          <div aria-hidden className="tx-social-grain" />
          <div className="relative flex h-full flex-col justify-between p-[90px]">
            <div className="flex items-baseline gap-5">
              <span className="font-display text-[64px] font-semibold tracking-[0.14em] text-cream">GOYENDA</span>
              <span lang="bn" className="text-[34px] text-brass">
                গোয়েন্দা
              </span>
            </div>
            <div>
              <p className="font-mono text-[30px] uppercase tracking-[0.24em] text-brass">
                {caseFile.code} &middot; {RANKS[caseFile.rank].label}
              </p>
              <p className="mt-8 font-display text-[124px] leading-[1.02] font-semibold text-cream">{caseFile.title}</p>
              <p className="mt-10 max-w-[860px] text-[38px] leading-[1.45] text-ash">{caseFile.premise}</p>
            </div>
            <p className="self-start bg-blood px-12 py-7 font-mono text-[30px] uppercase tracking-[0.18em] text-cream">
              Solve it &rarr; {host}
            </p>
          </div>
        </div>
      </div>
      <figcaption className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
        1080 × {height} &middot; shown scaled; dots are the site&rsquo;s px size at 100%
      </figcaption>
    </figure>
  );
}

export function SocialPreview({ caseFile }: { caseFile: CaseFile }) {
  return (
    <div className="flex flex-wrap gap-8 [--tx-social-scale:0.3] sm:[--tx-social-scale:0.4]">
      <Frame caseFile={caseFile} height={1080} />
      <Frame caseFile={caseFile} height={1350} />
    </div>
  );
}
