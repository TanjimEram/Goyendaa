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

export function renderMarkdown(src: string): string {
  const blocks = src.replace(/\r\n?/g, "\n").trim().split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const h = block.match(/^(#{1,3})\s+(.+)$/);
      if (h && lines.length === 1) {
        const level = h[1].length + 1; // # → h2: the page already has an h1
        return `<h${level}>${inline(h[2])}</h${level}>`;
      }
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`;
      }
      if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`;
      }
      return `<p>${lines.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}
