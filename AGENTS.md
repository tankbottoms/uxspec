# Working in this repo

Instructions for anyone — person or agent — adding a page or a component here.
They are narrow on purpose. Nearly every visual decision has already been made,
and the value of the system is that it keeps being made the same way.

## Before anything

Read the rendered spec (`bun run build && bun run serve`, then
<http://localhost:8895>). It is the specification; `DESIGN.md` is the reference
card; this file is the procedure.

## The one-paragraph version

Never add a stylesheet. Never write an inline style for design. A badge gets its
width from the scale and its colour from a class. A page must be correct with
scripting off. `bun run build` runs both linters first and refuses to write a
file that broke either — so if you are arguing with the linter, the linter is
right and the page is wrong.

## Adding a page

```ts
// src/pages/thing.ts — composition only. No new rules live in a page file.
import { head, nav, foot } from "../shell.ts";
import * as U from "../ui.ts";

export function thingBody(): string {
  return U.pageHead({ eyebrow: [...], h1: "...", lede: "..." })
    + U.tiles([...])      // the four numbers the page is about, before the evidence
    + U.h2(1, "id", "Section", icon("layer-group"), {
        hint: "live now",              // one small fact, right-justified on the title line
        hintIc: icon("circle-info"),   // circle-info is reserved for hints; do not
        stmt: "One line saying what the section is for.",  //   use it as a section glyph
      })
    + ...;
}
```

Then register it in `src/index.ts` and add its sections to `SECTIONS` in
`src/shell.ts` if it needs its own table of contents.

## Section headings

Four parts, fixed order, two lines:

| Part | Where | Rule |
|---|---|---|
| `.n` | left | White fill, black rule. Reading order, never a category -- a coloured chip here competes with every tone below it. |
| glyph + title | left | One glyph per section, none repeated. |
| `.hint` | far right, title's line | One small fact, marked `circle-info`. Never a control, never a sentence. |
| `.stmt` | its own line | One line saying what the section is for. Lives in `SECTIONS`, not at the call site. |

The statement is inside the `<h2>` (`flex-basis:100%` breaks it to its own row),
not a sibling `<p>`. A paragraph after the heading reads as body copy that
happens to sit first; this reads as part of the heading, and the eye scanning
only titles still gets the argument of the page.

## Adding a component

In this order, and stop at the first one that works:

1. **Does `tokens.ts` already style it?** Grep the class before writing one.
2. **Can it be composed from `ui.ts` / `spark.ts` / `tables.ts`?** Compose it.
3. **Does it need a rule the system does not have?** Add the rule to
   `tokens-extra.ts`, using `var()` tokens only, and give it a name that says
   what it is rather than what it looks like.
4. **Never** `tokens.ts`. That file is a byte-for-byte copy of the canonical
   stylesheet; editing it forks the design system silently and the next sync
   either clobbers your edit or ships a conflict.

`tokens-extra.ts` shrinking over time is the success condition. Every rule in it
is a rule the canonical sheet should eventually own.

## Colour

- An entity gets its swatch from `toneAt()` / `toneClass()`, hashed from its
  name so two runs agree without a stored mapping.
- A closed vocabulary — four account types, three states — gets explicit
  swatches and **withdraws them from the identity pool**. Do this in
  `palette.ts`, never at the call site.
- Charts take a `Tone { cls, fill, stroke }`. `.meter i` takes a class. Nothing
  takes a hex.
- A regression line, an axis, a rule, a wireframe: `--ink-muted`, `--rule`,
  `--ink-soft`. Never a palette colour. A palette colour means "this is one of
  the entities", and the reader will believe it.

## SVG

Emit **no** `<style>` element inside an inline SVG. An inline SVG is part of the
document, so its style block is document-global and one loose selector will
restyle unrelated elements elsewhere on the page. Colour goes on presentation
attributes, and those attributes may carry `var(--token)` values.

## Tables

Use `grouped()` from `tables.ts`. It expects items **already in block order** —
it walks runs and does not sort. Member rows carry `data-g`; the subtotal row
carries none, because it is arithmetic on the block rather than a row of it. If
you change how spans are emitted, change `recutSpans()` in `client.ts` in the
same commit or a sort will silently mislabel every block.

## Anything interactive

Write the no-JS version first and check it in the browser with scripting
disabled. If the no-JS version is unusable, the feature is not ready. The stage
in `viewer.ts` is the worked example: the fallback still is in the markup from
the start and is only hidden once the renderer has produced a real frame — never
the other way round, or a slow module leaves a blank rectangle and a failed one
leaves it forever.

## Rules the code enforces and nothing wrote down

Each of these is checked by a linter, a type, or a browser, and each was
rediscovered at least once because it lived only in the code.

**`viewport()` has five docks, not four.** `src/ui.ts:392` takes `topL`, `topR`,
`bl`, `bc`, `br`. The bottom three are one row, so an empty centre dock still
holds its space instead of letting its neighbours drift inward. Fill a dock with
`vpBtns()` (`src/ui.ts:432`), which emits `.vp-btns` and takes its geometry from
`.badge` — a control cluster that redeclares badge height is how a page ends up
with two badge heights.

**`tipMark()` is the in-table detail mark.** `src/html.ts:67`, signature
`(body, {rt?, label?})`. A 10px circle-i after a value, costing the column no
width, opening as many lines as the fact needs. Pass `rt: true` near the right
edge of a table or the panel opens off the page. Checkbox-driven, so it works
with scripting off.

**`.seg-ctl` is a segmented control with no script.** `src/tokens-extra.ts:397`.
Radio inputs are moved off-screen at 1×1px rather than `display:none`, because a
hidden input is not focusable and the control loses the keyboard. The checked
state is `input:checked + label .badge` — amber border, ink glyph. Never a fill.

**`vector-effect="non-scaling-stroke"` is required on every spark line.**
`src/spark.ts:242`. A spark is drawn in data coordinates and scaled to its box,
so without it the viewBox transform scales the stroke too and a 1px hairline
becomes a 4px slab on a wide chart — a line reads as a mark.

**`aspect-ratio` with `max-height` shrinks the *width*.** The browser preserves
the ratio by whichever axis binds first, so a `max-height` on a ratio-sized box
narrows it instead of cropping it. A definite `width:100%` must sit alongside —
see `.vw .vp-body` at `src/tokens-extra.ts:361`.

**`.badge.bare` keeps the class's colour with no fill.** `src/tokens-extra.ts:134`.
It is the layer rail's documented exception: the glyph stays tinted while the
plate disappears. Any blanket pressed-state fill therefore needs `:not(.bare)`,
as at line 148 — without it the rail's bare badges acquire a background the
moment a sibling is pressed.

**`[hidden]` loses to `display:flex`.** Setting a display value on an element
overrides the UA's `[hidden]{display:none}`, so anything given a display must
answer `[hidden]` explicitly — `.vp-tour[hidden]{display:none}` and friends at
`src/tokens-extra.ts:302,307,909,1076`. A tour panel that will not close is this
bug every time.

## Before you commit

```bash
bun run lint     # must be silent
bun run build    # must be silent, and dist/ must diff the way you expect
```

A warning is a finding, not noise. The build currently produces none; keep it
that way, because a log with two acceptable warnings in it is a log nobody reads
and the third one arrives unnoticed.

Commit identity for this repo:

```bash
GIT_COMMITTER_NAME="tankbottoms" GIT_COMMITTER_EMAIL="tankbottoms@users.noreply.github.com" \
  git commit --author="tankbottoms <tankbottoms@users.noreply.github.com>" -m "message"
```

## Things that look like improvements and are not

- Adding a `w16` because a label is one character too wide. Pick the next step
  up. The scale exists so columns line up across pages written months apart.
- Colouring a wireframe. It spends an identity swatch on a drawing that
  identifies nothing.
- A gradient heat map. A ramp asks the eye to read an absolute value out of a
  shade, which it cannot do without the legend the ramp was meant to replace.
- Pulling three.js from a CDN. A third party in the dependency chain, a second
  point of failure, and a new CSP problem per deploy target.
- Copying the palette hexes into the WebGL module "just for the 3D". That is the
  fork the linter exists to catch, and the linter reads the module too.
