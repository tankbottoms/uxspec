/**
 * The delta, kept apart from `tokens.ts` on purpose.
 *
 * `tokens.ts` is a byte-for-byte copy of the canonical stylesheet in
 * `tax-analysis-2024-2026/src/tokens.ts`. Editing it here would fork the design
 * system quietly: the next `bun run sync:tokens` would either clobber the edit or
 * report a diff nobody can read. So this file holds the four things a *spec site*
 * needs that a report page does not -- a code block, a swatch grid, wireframe
 * strokes, and a WebGL stage -- and nothing else.
 *
 * Rules this file lives under, same as the parent:
 *   - every colour is a `var(--token)`. No raw hex, ever. `design-lint.ts` warns.
 *   - no new badge geometry. Height and width belong to `.badge` in tokens.ts.
 *   - anything that turns out to be generally useful gets promoted upstream and
 *     deleted from here. This file shrinking is the success condition.
 */
export const CSS_EXTRA = `
/* ------------------------------------------------------------------ code */
/* A spec has to show its own markup. Body face is sans and a bare <pre> would
   inherit it, so the block sets mono explicitly and turns tabular figures off --
   code is read, not compared column-wise. */
.code{margin:10px 0 0;padding:9px 11px;background:var(--paper-alt);
  border:1px solid var(--rule-soft);border-radius:var(--radius);
  font-family:var(--font-mono);font-size:10.5px;line-height:1.65;color:var(--ink);
  font-variant-numeric:normal;overflow-x:auto;white-space:pre;tab-size:2}
.code .c{color:var(--ink-soft)}
.code .s{color:var(--stroke-teal)}
.code .k{color:var(--stroke-orchid)}
.code .bad{background:var(--pastel-blush);box-shadow:inset 2px 0 0 var(--stroke-coral);
  display:block;margin:0 -11px;padding:0 9px}
.code .good{background:var(--pastel-mint);box-shadow:inset 2px 0 0 var(--stroke-green);
  display:block;margin:0 -11px;padding:0 9px}
.code-hd{margin:14px 0 0;font-family:var(--font-mono);font-size:9.5px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft)}

/* --------------------------------------------------------------- two-up */
/* The wrong-and-right pair. One column on a phone, because a side-by-side
   comparison that has to be scrolled sideways is not a comparison. */
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px}
.two > div{min-width:0}
@media (max-width:720px){.two{grid-template-columns:1fr}}

/* -------------------------------------------------------------- swatches */
.swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(122px,1fr));
  gap:7px;margin-top:10px}
.swatch{border:1px solid var(--rule);border-radius:var(--radius);overflow:hidden;
  background:var(--paper-card)}
.swatch .chip{height:34px;border-bottom:1px solid var(--rule-soft)}
.swatch .nm{display:block;padding:5px 7px 1px;font-size:10px;color:var(--ink)}
.swatch .vr{display:block;padding:0 7px 6px;font-family:var(--font-mono);
  font-size:9px;color:var(--ink-soft)}

/* ------------------------------------------------------------ wireframes */
/* A wireframe is deliberately drawn in ink-soft on paper-alt and never in the
   palette: the moment a blueprint is coloured, a reader starts reading the colour
   as meaning, and the palette's one-colour-one-meaning rule is spent on a drawing
   that means nothing yet. */
.wf{background:var(--paper-alt);border:1px solid var(--rule);
  border-radius:var(--radius);padding:11px;margin-top:10px;overflow-x:auto}
.wf svg{display:block;max-width:100%;height:auto}
.wf + figcaption{margin-top:6px}

/* ------------------------------------------------------------- gl stage */
/* The stage is sized by aspect-ratio rather than a fixed height so it survives a
   phone rotation without a resize listener. */
.stage{position:relative;aspect-ratio:16/10;background:var(--paper-alt);
  border:1px solid var(--rule);border-radius:var(--radius);overflow:hidden;margin-top:10px}
.stage canvas{display:block;width:100%;height:100%}
.stage .fallback{position:absolute;inset:0;display:flex;align-items:center;
  justify-content:center;padding:18px;text-align:center;font-size:11px;
  color:var(--ink-muted)}
.stage.on .fallback{display:none}
.stage .hud{position:absolute;left:9px;bottom:9px;display:flex;gap:5px;
  font-family:var(--font-mono);font-size:9.5px;color:var(--ink-soft)}

/* --------------------------------------------------------- glyph controls */
/* A row of icon buttons that behave like badges: same height, same border, same
   radius. They differ from .badge only in being pressable, so they must not
   redeclare geometry -- they carry .badge and add state. */
.gctl{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.gctl button{background:none;border:0;padding:0;cursor:pointer;font:inherit}
.gctl button .badge{cursor:pointer}
.gctl button[aria-pressed="true"] .badge{border-color:var(--ink);color:var(--ink);
  box-shadow:inset 0 0 0 1px var(--ink)}
.gctl button:hover .badge{border-color:var(--ink-muted)}

/* ------------------------------------------------------------ spark grid */
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));
  gap:9px;margin-top:10px}
.sgrid .cell{border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--paper-card);padding:8px 9px}
.sgrid .cell .hd{display:flex;align-items:baseline;justify-content:space-between;
  gap:6px;margin-bottom:5px}
.sgrid .cell .hd .nm{font-size:10px;color:var(--ink-muted)}
.sgrid .cell .hd .v{font-family:var(--font-mono);font-size:12px;color:var(--ink)}

/* -------------------------------------------------------------- banners */
/* Reserved for a statement about the data the reader must act on -- stale
   source, partial period, failed reconciliation. Not commentary; that is a
   note. A tinted box that is sometimes decorative gets skipped when it is not. */
.banner{margin:12px 0 0;padding:8px 11px;border:1px solid var(--rule);
  border-left-width:3px;border-radius:var(--radius);font-size:11px;
  line-height:1.55;color:var(--ink)}
.banner.ok{background:var(--pastel-mint);border-left-color:var(--stroke-green)}
.banner.warn{background:var(--pastel-vanilla);border-left-color:var(--stroke-amber)}
.banner.crit{background:var(--pastel-blush);border-left-color:var(--stroke-coral)}

/* ---------------------------------------------------------------- empty */
/* An empty state occupies the space the content would have, so a section with
   nothing to say does not collapse and silently reflow everything below it. */
.empty{display:flex;align-items:center;justify-content:center;min-height:58px;
  margin-top:10px;padding:12px;background:var(--paper-alt);
  border:1px dashed var(--rule);border-radius:var(--radius);
  font-size:11px;color:var(--ink-muted);text-align:center}

/* ---------------------------------------------------------------- meter */
/* A single-value bar. Width is inline because it is the datum; colour is a
   class because it is design. That split is the whole rule. */
.meter{position:relative;height:9px;background:var(--paper-alt);
  border:1px solid var(--rule);border-radius:2px;overflow:hidden}
.meter i{display:block;height:100%;border-right:1px solid var(--rule-soft)}
.meter.tall{height:13px}
.meter-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;
  margin-top:5px}
.meter-row .lb{font-size:10px;color:var(--ink-muted)}
.meter-row .vl{font-family:var(--font-mono);font-size:10.5px;color:var(--ink)}

/* --------------------------------------------------------------- charts */
/* Every drawing is a block so it cannot pick up the inline-formatting leading of
   its paragraph, and every one is width-capped rather than stretched: a chart
   allowed to fill a 1600px window turns a legible line into a flat one. */
.donut,.bullet,.heat,.tline,.lchart,.bchart,.schart{display:block;max-width:100%;
  height:auto;margin:0 auto}
.lchart,.bchart,.schart,.tline{width:100%}
.donut{margin:6px auto 2px}
.hbars{margin-top:8px}
.donut-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:8px}
.donut-row .lg{flex:1 1 190px;min-width:0}

/* ------------------------------------------------------- meter tone fills */
/* Same twelve identity swatches and the same semantic six as .badge, so a bar
   and the badge naming it are the one colour. Declared here rather than as an
   inline background for exactly the reason the badge rule exists: a colour that
   lives in markup cannot be audited, renamed, or themed. */
.meter i.p1{background:var(--pastel-aqua)}
.meter i.p2{background:var(--pastel-vanilla)}
.meter i.p3{background:var(--pastel-mint)}
.meter i.p4{background:var(--pastel-peach)}
.meter i.p5{background:var(--pastel-lilac)}
.meter i.p6{background:var(--pastel-blush)}
.meter i.p7{background:var(--pastel-lime)}
.meter i.p8{background:var(--pastel-orchid)}
.meter i.p9{background:var(--pastel-teal)}
.meter i.p10{background:var(--pastel-rose)}
.meter i.p11{background:var(--pastel-cyan)}
.meter i.p12{background:var(--pastel-indigo)}
.meter i.ok{background:var(--pastel-green)}
.meter i.warn{background:var(--pastel-amber)}
.meter i.crit{background:var(--pastel-coral)}
.meter i.idle{background:var(--rule)}

/* ------------------------------------------------- the rotated label rail */
/* Room around the rail glyph.

   tokens.ts sets .badge.vert { padding: 0 4px }. In vertical writing the two
   values swap roles: the 4px is the ribbon's thickness and the 0 is the space at
   each *end* of it, so the glyph sat flush against the end of its own ribbon and
   the name ran to the other end with nothing between either and the rules above
   and below the block. Physical properties are used deliberately here rather than
   the logical ones -- padding-block in vertical-rl addresses the thickness,
   which is the axis that must not change. */
.badge.vert { padding-top: 7px; padding-bottom: 7px; }
/* And room between the glyph and the name it introduces. margin-inline-end
   because with the text on its side the inline axis runs down the cell -- a right
   margin would push the glyph across the ribbon instead of along it. */
.badge.vert .gm { margin-inline-end: 8px; }
/* Both of the above are spent out of the length available to the name, so
   STACK_PX in tables.ts counts them. Change one, change the other. */

/* The subtotal's mark, with no box around it.

   .badge.gi in tokens.ts already says a mark is not a value and drops the fill
   and the border -- but the tone classes are declared further down the file at the
   same specificity, so .badge.gi.p5 gets its lilac back and draws the box again.
   Scoping to the subtotal row wins on specificity without touching either rule,
   and color is left alone: the glyph keeps the group's own colour, which is the
   whole reason it is there. */
tr.sub td.rot .badge.gi {
  background: transparent; border-color: transparent; padding: 0;
}
`;
