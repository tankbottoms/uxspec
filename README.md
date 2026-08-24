# uxspec

The house design system, as a working template: one Bun/TypeScript renderer, a
badge contract, a grouped-row table, a generous set of spark charts and
wireframes, and two linters that fail the build rather than the review.

Live: <https://uxspec.atsignhandle.workers.dev>

## What this is

A page in this system is **one HTML file**. Markup, CSS and script are inlined;
there is no bundler, no CSS framework, no runtime dependency, and no CDN. The
page is correct with scripting disabled, and everything that needs script is an
enhancement of something that already worked without it.

That constraint is the point. It makes a page printable, screenshottable,
archivable, and reviewable as a diff — and it means the whole visual system fits
in one file, `src/tokens.ts`, which is the only place a colour or a size exists.

## Quick start

```bash
bun install          # nothing to install; here for muscle memory
bun run lint         # design contract + badge contract over src/
bun run build        # lint, then render dist/index.html and dist/viewer.html
bun run serve        # http://localhost:8895
bun run deploy       # bunx wrangler@4 deploy
```

`bun run build` is deterministic: the sample data comes from a seeded generator
over a fixed epoch, and the build stamp is fixed unless `BUILT` is set. Two runs
of an unchanged tree produce byte-identical output, so `git diff dist/` is a
usable review of what a change did to the page.

## Layout

| Path | What it is |
|---|---|
| `src/tokens.ts` | The stylesheet. Byte-identical to the canonical copy. **Never edited here.** |
| `src/tokens-extra.ts` | Additions this site needs and the canonical sheet does not. Uses `var()` tokens only. |
| `src/palette.ts` | Which colour a thing gets. Identity pool, reserved vocabularies, tone helpers. |
| `src/html.ts` | Escaping, money, percent, `tip()`, `receipts()`, `wcls()`. |
| `src/icons.ts` | Font Awesome Pro 6.5.1 Thin, inline. No emoji, ever. |
| `src/ui.ts` | Page head, headings, prose, notes, banners, tiles, badges, swatches, code, two-up. |
| `src/tables.ts` | Grouped rows: the rotated rail, `data-g`, subtotals, totals. |
| `src/spark.ts` | Meters, bullets, donut, heat, timeline, line, bars, scatter, spark grids. |
| `src/charts.ts` | Figure numbering, stacked bars, legends, sparklines. |
| `src/wireframes.ts` | Monochrome blueprints. Ink and hairlines, never a palette colour. |
| `src/viewer.ts` | The WebGL stage, its glyph controls, and its no-JS still. |
| `src/client.ts` | The only client script: theme, sorting, span re-cutting. |
| `src/shell.ts` | `head()`, `nav()`, `foot()`, and the section table of contents. |
| `src/pages/` | The two pages. Composition only — no new rules live here. |
| `src/design-lint.ts` | Raw hex, unscoped SVG `<style>`, emoji, unknown colour classes. |
| `src/badge-lint.ts` | Badge width from the scale, no inline colour on a badge. |
| `public/vendor/` | three.js, vendored. Copied into `dist/` by the build. |

## The rules, in one screen

1. **One stylesheet.** `tokens.ts`. Additions go in `tokens-extra.ts` and use
   `var()` tokens. Never a `<style>` element, never an inline style for design.
2. **A badge is square, fixed height, width from the scale, colour from a class.**
   `w3 w5 w7 w9 w11 w12 w14 w17 w19 w23 w25 w30 w34 w38 w42`, plus `auto`.
   One width per column, including the empty and error cells. Two values are two
   badges — never `A / B` in one.
3. **One colour, one meaning, per page.** Identity `p1`–`p12`; semantic
   `ok warn crit idle`. A closed vocabulary withdraws its swatches from the
   identity pool. `.hollow` is the only sanctioned collision breaker.
4. **Grouped rows** get a rotated label rail spanning the block, `tr.rep`
   members carrying `data-g`, `tr.sub` subtotals carrying none, rule separators
   rather than spacer rows, and spans re-cut from `data-g` after a sort.
5. **Progressive enhancement or it does not ship.** Menus are `<details>`,
   overlays are a checkbox and a label, tab strips are radios. Sorting is the
   one genuine enhancement, and the table arrives already ordered.
6. **Inline SVG `<style>` is document-global.** These modules emit none: colour
   rides on presentation attributes carrying `var(--token)` values.
7. **Overlay type is one step below the page.** Dialog head 13.5px, tooltip
   11px, overlay table 9.5px, floor 9px.
8. **No dark mode, no emoji, no CDN, no raw hex outside `tokens.ts`.**

Long form, with the reasoning and the counter-examples: the rendered spec at
`dist/index.html`, and `DESIGN.md`.

## Deploy

Cloudflare Workers static assets. `bun run deploy` lints, renders, stages
`dist/*.html` into `public/`, and calls `wrangler@4 deploy`.

## Licence

MIT. © M.P.
