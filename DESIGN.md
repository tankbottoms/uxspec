# Design system rules

These are enforced, not remembered. `bun run build` fails if a page breaks the badge
contract; the check is `src/badge-lint.ts` and it reads the width vocabulary out of
`src/tokens.ts`, so the rule and the stylesheet cannot drift apart.

## Why this file exists

The badge geometry on `index.html` was corrected by hand, one column at a time, over
many rounds of review. Each fix landed as a bespoke rule — `.badge.st`, `.badge.ar`,
`.badge.inc` — sized to the one column that had just been complained about. That is
not a system; it is a list of past complaints. When `fidelity.ts` was written as a
second renderer it inherited none of those rules, so every badge on the new page came
out ragged and the same review had to happen again from zero.

The fix is structural: one scale, declared once, that any renderer can name; and a
build gate so a new page cannot ship without naming it.

## The badge contract

1. **Height is set once**, on `.badge` in `tokens.ts`. No call site sets height,
   padding or line-height.
2. **Width comes from the scale.** Every badge names exactly one of `w3 w5 w7 w9 w11
   w12 w14 w17 w19 w23 w25`, or `auto` for a badge in running prose, or an
   interpolated `wcls()` result (the variable name must end in `W`).
   `wcls(labels)` picks the smallest step that fits the longest label a column can
   hold — compute it from the data, once, above the row map.
3. **Colour comes from a class, never from the call site.** Identity colours are
   `p1`–`p12`; semantic colours are `long short ok warn crit idle`; platform colours
   are `cow kiln safe cb lido`. `style="background:…"` on a badge is a build error.
4. **Sizing is `content-box`.** The global reset is `border-box`, under which a `ch`
   width would include the padding and no two badges would agree. Do not change this.

Two consequences worth stating, because both were got wrong before:

- A column of badges is one width for the whole column, including the empty and the
  error states. `no Form 1099` and `agrees to $43,584.59` are the same badge.
- A value that is really two values is two badges. `short and long` is a term column
  with three members; render `short` and `long` side by side instead.

## Identity colour

An entity keeps its colour everywhere it appears. Accounts are mapped once at the
account list (`ACCT_TONE`), instruments once at the symbol list (`SYMBOL_TONE`),
vintages once at the year list (`VINTAGE_TONE`). Account tones start at `p7` so they
do not collide with instrument tones, which start at `p1`. SVG needs raw values
rather than classes, so each map has a `fill()`/`stroke()` companion reading the same
declaration — never a second, hand-kept list.

### One colour, one meaning, per page

**No two kinds of badge on a page may share a swatch.** A colour on this site is a
claim that two things are the same thing. When an account-type badge and a payee badge
are both `p5`, the reader is told a brokerage and a coffee shop belong together, and
there is no way to unlearn that from the page — the colour is doing the opposite of
what colour is for.

There is no case where reuse is necessary. The palette has twelve swatches and no page
carries twelve distinct vocabularies; if one appears to, the vocabularies are the thing
to look at, not the palette. So:

- A **closed vocabulary** — a set that cannot grow, such as the four account types —
  is mapped explicitly, one swatch each, and those swatches are then **withdrawn from
  the identity pool** so a hash cannot land on them. `palette.ts` does this with
  `TYPE_TONE` and `IDENTITY`: the reservation is structural, not a convention someone
  has to remember.
- Where a collision genuinely cannot be avoided — two open-ended vocabularies larger
  than the pool between them — the lower-priority one takes **`hollow`**, the white
  fill. Same border, same text colour, no ground; it reads as a different kind of thing
  at a glance and the swatch stops being a claim of sameness.
- **Semantic classes are a separate namespace.** `ok warn crit idle long short good`
  say status, never identity, and never collide with `p1`–`p12` because they are not
  drawn from it.

## Tables

- A column whose content is bounded gets a `<colgroup>` width. Bands that repeat the
  same table on one page (the document index) share one `colgroup`, or the columns
  land in a different place in every band.
- An account cell is a badge plus a name and gets `class="nw"`; without it the name
  wraps under the badge on the narrow rows.

## Dates and files

- Dates render **day month year** (`22 Aug 2026`) through `dmy()`. No ISO in a cell a
  reader is meant to read.
- A document's date comes from the **filename** — the archive convention is
  `YYYYMMDD Description.ext` — not from mtime. Mtime is a copy artefact: an rsync
  restamps a whole band of 2019 statements as last month.
- File sizes in an index column are badges, sized from the widest possible value.

## SVG charts

**An inline SVG `<style>` is not scoped to its SVG — it is document-global.** Every
selector inside one must be prefixed with that chart's own class:

```
<svg class="diagram lc"> … <style>.lc .tk{…}</style>
```

Unscoped, the rules reach out of the chart and restyle any element on the page that
happens to share a class name. It has happened twice, and both times the symptom was
somewhere the source gave no reason to look:

| Chart | Leaked | Broke |
|---|---|---|
| Fidelity lifecycle | `.bg{font:9px …}` | a receipts `<label>` — one ragged badge column |
| Ethereum accounts | `.dl{font:italic 11px …}` | the `taxes-2025.zip` download control rendered italic |

The second is the sharper lesson: `a.dl` in `tokens.ts` was the *intended* rule and won
on every property it declared — but it never declared `font-style`, so the leak supplied
one. A partial override does not protect you.

Chart class prefixes in use: `.lc` lifecycle, `.eth` Ethereum accounts.

## Enforced automatically

`bun run build` runs `src/design-lint.ts` first and fails on:

| Rule | Level |
|---|---|
| badge without a width from the scale | error |
| inline `background`/`border-color` on a badge | error |
| unscoped selector in an inline SVG `<style>` | error |
| emoji in rendered output | error |
| raw hex colour outside `tokens.ts` | warning |

The width vocabulary is read out of `tokens.ts`, so the rule cannot drift from the
stylesheet. Extend the scale rather than special-casing a page.

## Adding a page

Import `tokens.ts`. Do not add a stylesheet. If a badge needs a width the scale does
not have, add the step to the scale in `tokens.ts` — not a class named after the
column it happens to sit in.

## The rendered spec

`dist/ux-spec.html` states the same contract for the reader, with every badge, table,
control and chart rendered live by the functions the other pages call. Its width scale
and colour tables are extracted from `tokens.ts` at build time and its enforcement
section runs `designLint()` and prints the result, so it cannot claim a clean contract
the build does not have. It is reached from the theme menu on every page.

This file is the editor's copy; that page is the reader's. Change the rule here, and
check it still reads correctly there.
