/**
 * A deliberately small Markdown renderer for the free-case answer page.
 * Escapes all HTML first, then supports: blank-line paragraphs, # / ## / ###
 * headings, "- " and "1. " lists, **bold**, *italic*, and line breaks inside
 * a paragraph. Enough for a solution write-up; no dependency, no raw HTML.
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>");
}

type Run = { kind: "p" | "ul" | "ol" | "h"; lines: string[] };

const UL = /^\s*[-*]\s+/;
const OL = /^\s*\d+[.)]\s+/;
const H = /^(#{1,3})\s+(.+)$/;

/** Splits a block into runs, so "**Lead:**" followed by a list on the next
 *  line (no blank line between) still renders as a paragraph + a list. */
function runs(lines: string[]): Run[] {
  const out: Run[] = [];
  for (const line of lines) {
    const kind = H.test(line) ? "h" : UL.test(line) ? "ul" : OL.test(line) ? "ol" : "p";
    const last = out[out.length - 1];
    if (last && last.kind === kind && kind !== "h") last.lines.push(line);
    else out.push({ kind, lines: [line] });
  }
  return out;
}

export function renderMarkdown(src: string): string {
  const blocks = src.replace(/\r\n?/g, "\n").trim().split(/\n\s*\n/);
  return blocks
    .flatMap((block) => runs(block.split("\n")))
    .map(({ kind, lines }) => {
      if (kind === "h") {
        const [, hashes, text] = lines[0].match(H)!;
        const level = hashes.length + 1; // # → h2: the page already has an h1
        return `<h${level}>${inline(text)}</h${level}>`;
      }
      if (kind === "ul") return `<ul>${lines.map((l) => `<li>${inline(l.replace(UL, ""))}</li>`).join("")}</ul>`;
      if (kind === "ol") return `<ol>${lines.map((l) => `<li>${inline(l.replace(OL, ""))}</li>`).join("")}</ol>`;
      return `<p>${lines.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}
