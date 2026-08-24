/**
 * The design contract, enforced. Entry point for `bun run build`.
 *
 * The badge rules live in badge-lint.ts and are run from here; this file adds the
 * page-level rules. Each one exists because it was already broken once:
 *
 *   1. An inline SVG <style> must scope every selector to its own chart.
 *      An SVG <style> element is NOT scoped to its SVG - it is document-global. The
 *      lifecycle chart declared `.bg{font:9px ...}` and silently restyled an HTML
 *      label elsewhere on the page; the Ethereum diagram declared `.dl{font:italic
 *      11px ...}` and rendered the taxes-2025.zip download control in italics. Both
 *      were invisible in review and invisible in the source of the file they broke.
 *
 *   2. No emoji in rendered output. Icons are Font Awesome via icon()/glyph(); a
 *      status is a text symbol or a badge. This is a standing rule for every artifact.
 *
 *   3. No raw hex colour outside tokens.ts. The pastel palette is a token set; a
 *      literal `#aabbcc` at a call site cannot follow the theme and will not invert.
 *
 * A rule that lives only in review comments is re-broken by the next renderer. That is
 * exactly how the Fidelity page shipped ragged after the first page had been fixed.
 *
 * Run by `bun run build` and by lint.sh. Exits non-zero with file:line on any violation.
 */
import { Glob } from "bun";
import { badgeLint } from "./badge-lint.ts";

type Bad = { file: string; line: number; why: string; text: string; warn?: boolean };

const SKIP = /^(design-lint|badge-lint|tokens)\.ts$|\.\d{8}[a-z]?\.ts$/;
/** Selectors that are already global by nature and are not chart-local. */
const GLOBAL_OK = /^(@|:root|\*|html|body|svg|text|rect|circle|line|path|g)\b/;

/** Every source file the contract applies to, backups and the linters excluded. */
async function sources(dir: string): Promise<string[]> {
  const out: string[] = [];
  for await (const name of new Glob("**/*.ts").scan({ cwd: dir, onlyFiles: true })) {
    if (!SKIP.test(name)) out.push(name);
  }
  return out.sort();
}

const at = (src: string, i: number): number => src.slice(0, i).split("\n").length;

/**
 * Rule 1. Read each `<style>` that is emitted inside an <svg> and require every
 * selector in it to be prefixed with a class.
 *
 * The body is scanned as concatenated template literals, so the check sees the same
 * text the browser will. A selector is accepted when it starts with `.something ` and
 * has a descendant part - that is the chart scope - or when it is one of the global
 * forms above. `.dh{...}` on its own is the failure mode.
 */
function svgScope(name: string, src: string): Bad[] {
  const bad: Bad[] = [];
  for (let i = src.indexOf("<style>"); i !== -1; i = src.indexOf("<style>", i + 1)) {
    // Only inline SVG styles. The page stylesheet is emitted as `<style>${CSS}</style>`
    // from tokens.ts and is global on purpose.
    const before = src.slice(Math.max(0, i - 600), i);
    if (!/<svg\b/.test(before)) continue;
    // Skip a `<style>` that is only being talked about. These very rules are explained
    // in `//` comments that quote the tag, and matching those reports every block as
    // broken - the linter reading its own documentation as if it were markup.
    const bol = src.lastIndexOf("\n", i) + 1;
    if (src.slice(bol, i).includes("//")) continue;
    const close = src.indexOf("</style>", i);
    if (close === -1) continue;
    // The block is written as adjacent template literals joined with `+`, with the
    // reasoning in `//` comments between them. Recover the CSS the browser will see:
    // drop comment lines, drop the quote/concat punctuation, and close up the newlines.
    // Without this the comment prose parses as selectors and every block "fails".
    const body = src
      .slice(i + 7, close)
      .split("\n")
      .filter((l) => !/^\s*\/\//.test(l))
      .join("\n")
      .replace(/`\s*\+/g, "")
      .replace(/\+\s*`/g, "")
      .replace(/`/g, "")
      .replace(/\s*\n\s*/g, "");
    for (const m of body.matchAll(/(^|[}])\s*([^{}]+)\{/g)) {
      for (const sel of (m[2] ?? "").split(",")) {
        const s = sel.trim();
        if (s === "" || s.includes("${") || GLOBAL_OK.test(s)) continue;
        if (!/^\.[\w-]+\s+\S/.test(s)) {
          bad.push({
            file: name,
            line: at(src, i + (m.index ?? 0)),
            why: "unscoped selector in an inline SVG <style>; an SVG style is document-global - prefix it with the chart's own class",
            text: s,
          });
        }
      }
    }
  }
  return bad;
}

/** Rule 2. Emoji anywhere in a source file that renders to a page. */
function noEmoji(name: string, src: string): Bad[] {
  const bad: Bad[] = [];
  const re = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
  for (const m of src.matchAll(re)) {
    bad.push({
      file: name,
      line: at(src, m.index ?? 0),
      why: "emoji in rendered output; use icon()/glyph() or a text symbol",
      text: m[0] ?? "",
    });
  }
  return bad;
}

/** Rule 3. A literal colour outside the token set. */
function noRawHex(name: string, src: string): Bad[] {
  const bad: Bad[] = [];
  // `(?<![\w#])` keeps NFT token ids out: `PROOF#643` and `RAREPASS#224` are asset
  // names in filed.ts, not colours, and a bare `#nnn` match reports all three.
  for (const m of src.matchAll(/(?<![\w#])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g)) {
    const ln = at(src, m.index ?? 0);
    const line = src.split("\n")[ln - 1] ?? "";
    // A fragment href and an HTML entity are not colours.
    if (/href="#|&#/.test(line)) continue;
    bad.push({
      file: name,
      line: ln,
      why: "raw hex colour outside tokens.ts; use a var(--…) token so it follows the theme",
      text: m[0] ?? "",
      warn: true,
    });
  }
  return bad;
}

export async function designLint(dir: string): Promise<Bad[]> {
  const bad: Bad[] = [...(await badgeLint(dir))];
  for (const name of await sources(dir)) {
    const src = await Bun.file(`${dir}/${name}`).text();
    bad.push(...svgScope(name, src), ...noEmoji(name, src), ...noRawHex(name, src));
  }
  return bad;
}

if (import.meta.main) {
  const dir = process.argv[2] ?? new URL(".", import.meta.url).pathname;
  const all = await designLint(dir);
  const bad = all.filter((b) => b.warn !== true);
  const warn = all.filter((b) => b.warn === true);
  for (const b of bad) console.error(`${b.file}:${b.line}  ERROR ${b.why}\n    ${b.text}`);
  for (const b of warn) console.error(`${b.file}:${b.line}  warn  ${b.why} (${b.text})`);
  if (bad.length > 0) {
    console.error(`\n${bad.length} design-contract violation${bad.length === 1 ? "" : "s"}. See DESIGN.md.`);
    process.exit(1);
  }
  console.log(`design contract: ok${warn.length === 0 ? "" : ` (${warn.length} warning${warn.length === 1 ? "" : "s"})`}`);
}
