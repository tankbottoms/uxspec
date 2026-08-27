/** Every token named in the source must exist in the stylesheet.
 *
 *  The design lint forbids raw hex, which pushes every colour through a
 *  `var(--…)` name — and a name with nothing behind it fails at the worst
 *  possible moment, in a browser, as a blank canvas. Cheaper to ask the
 *  stylesheet at build time whether it has ever heard of the name. */
import { Glob } from 'bun';

const root = new URL('../src/', import.meta.url).pathname;
const css = await Bun.file(`${root}tokens.ts`).text();
const known = new Set<string>();
for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) known.add(m[1]!);

/** Custom properties any file declares for itself — `.vp{--vp-gl:24px}` is a
 *  local dimension, not a theme colour. They are collected across the whole
 *  tree rather than per file, because every one of these files emits into the
 *  same document: a property declared in the stylesheet module is genuinely in
 *  scope for the page module that reads it. Per-file scoping would flag the
 *  two halves of one rule as an error, and a lint nobody can satisfy gets
 *  switched off within a week. */
/** Prose is not code. Both files carry doc comments that name `var(--token)`
 *  as a placeholder for "whatever the token is called", and a lint that cannot
 *  tell a sentence from a stylesheet reports it forever. Block comments are
 *  blanked line-for-line so reported line numbers still point at the source. */
const decomment = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const files: string[] = [];
const local = new Set<string>();
for await (const rel of new Glob('**/*.ts').scan({ cwd: root, onlyFiles: true })) {
  if (rel === 'tokens.ts') continue;
  files.push(rel);
  const src = decomment(await Bun.file(root + rel).text());
  for (const d of src.matchAll(/(--[a-z0-9-]+)\s*:/gi)) local.add(d[1]!);
}

const bad: string[] = [];
for (const rel of files) {
  const src = decomment(await Bun.file(root + rel).text());
  const seen = new Set<string>();
  for (const m of src.matchAll(/'(--[a-z0-9-]+)'|var\((--[a-z0-9-]+)\)/gi)) {
    const name = (m[1] ?? m[2])!;
    if (known.has(name) || local.has(name) || seen.has(name)) continue;
    seen.add(name);
    const line = src.slice(0, m.index).split('\n').length;
    bad.push(`${rel}:${line}  no such token ${name}`);
  }
}
if (bad.length) { for (const b of bad) console.log(b); process.exit(1); }
console.log(`tokens: ok (${known.size} known, ${local.size} local)`);
