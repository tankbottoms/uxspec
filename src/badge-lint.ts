/**
 * The badge contract, enforced.
 *
 * Badge width and height were corrected by hand, column by column, across the whole
 * first page - and then the Fidelity page was written as a second renderer, inherited
 * none of those hand-tuned rules, and shipped ragged. A convention that lives only in
 * the reviewer's memory is re-broken by the next file. So it lives here instead: a
 * badge in a table has to declare its width from the scale in tokens.ts, and it may
 * never carry its colour inline.
 *
 * Rules (see DESIGN.md):
 *   1. Every `class="badge ..."` names exactly one width - a `w<N>` from the scale,
 *      `auto` for the deliberate opt-out, or an interpolated `wcls()` result, whose
 *      variable name must end in `W`.
 *   2. No badge carries `style="background:..."` or `border-color` at the call site.
 *      Colour comes from a named class: p1-p12, or a semantic class.
 *
 * Run by lint.sh. Exits non-zero with file:line on any violation.
 */
import { Glob } from "bun";

type Bad = { file: string; line: number; why: string; text: string; warn?: boolean };

/** Read a template-literal attribute value, stepping over `${...}` that contains quotes. */
function attr(src: string, from: number): { body: string; end: number } | null {
  let i = from;
  let depth = 0;
  let body = "";
  for (; i < src.length; i += 1) {
    const c = src[i] ?? "";
    if (c === "$" && src[i + 1] === "{") { depth += 1; i += 1; body += "${"; continue; }
    if (c === "}" && depth > 0) { depth -= 1; body += "}"; continue; }
    if (c === '"' && depth === 0) return { body, end: i };
    if (c === "\n") return null;
    body += c;
  }
  return null;
}

const WVAR = /\$\{[^}]*\b\w*W\b[^}]*\}/;

/**
 * The width vocabulary, read from the stylesheet rather than hardcoded.
 *
 * A class only counts as a width if tokens.ts actually gives it one; that way the
 * check can never drift from the scale it is policing, and adding `.w31` needs no
 * change here. Names outside the `w<N>` scale are the pre-scale aliases: they are
 * accepted, because they do declare a width, and reported, because every one of
 * them is a column-specific rule that the next renderer will not inherit.
 */
async function widthClasses(dir: string): Promise<Set<string>> {
  const css = await Bun.file(`${dir}/tokens.ts`).text();
  const out = new Set<string>(["auto"]);
  for (const m of css.matchAll(/\.badge\.([\w-]+)\s*\{([^}]*)\}/g)) {
    if (/(?:^|[\s;])(?:min-)?width\s*:/.test(m[2] ?? "")) out.add(m[1] ?? "");
  }
  return out;
}

export async function badgeLint(dir: string): Promise<Bad[]> {
  const bad: Bad[] = [];
  const widths = await widthClasses(dir);
  const legacy = new Set([...widths].filter((w) => !/^w\d+$/.test(w) && w !== "auto"));
  for await (const name of new Glob("**/*.ts").scan({ cwd: dir, onlyFiles: true })) {
    if (name === "badge-lint.ts" || /\.\d{8}[a-z]?\.ts$/.test(name)) continue;
    const src = await Bun.file(`${dir}/${name}`).text();
    for (let i = src.indexOf('class="badge'); i !== -1; i = src.indexOf('class="badge', i + 1)) {
      const a = attr(src, i + 7);
      if (a === null) continue;
      const line = src.slice(0, i).split("\n").length;
      const cls = a.body;
      const named = [...cls.matchAll(/[\w-]+/g)].map((m) => m[0]);
      const hit = named.filter((t) => widths.has(t));
      if (hit.length === 0 && !WVAR.test(cls)) {
        bad.push({ file: name, line, why: "no width class (w<N>, auto, or a wcls() variable)", text: cls });
      } else if (hit.length > 0 && hit.every((t) => legacy.has(t))) {
        bad.push({ file: name, line, why: `legacy width alias '${hit[0] ?? ""}'; prefer the w<N> scale`, text: cls, warn: true });
      }
      const tag = src.slice(a.end, Math.min(a.end + 400, src.length));
      const cut = tag.indexOf(">");
      const rest = cut === -1 ? tag : tag.slice(0, cut);
      if (/style="[^"]*(background|border-color)/.test(rest)) {
        bad.push({ file: name, line, why: "inline colour on a badge; use a p1-p12 or semantic class", text: cls });
      }
    }
  }
  return bad;
}

if (import.meta.main) {
  const dir = process.argv[2] ?? new URL(".", import.meta.url).pathname;
  const all = await badgeLint(dir);
  const bad = all.filter((b) => b.warn !== true);
  const warn = all.filter((b) => b.warn === true);
  for (const b of bad) console.error(`${b.file}:${b.line}  ERROR ${b.why}\n    class="${b.text}"`);
  for (const b of warn) console.error(`${b.file}:${b.line}  warn  ${b.why}`);
  if (bad.length > 0) {
    console.error(`\n${bad.length} badge-contract violation${bad.length === 1 ? "" : "s"}. See DESIGN.md.`);
    process.exit(1);
  }
  console.log(`badge contract: ok${warn.length === 0 ? "" : ` (${warn.length} legacy alias${warn.length === 1 ? "" : "es"})`}`);
}
