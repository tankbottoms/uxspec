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
  font-family:var(--font-mono);font-size:8.5px;line-height:1.7;color:var(--ink);
  font-variant-numeric:normal;overflow-x:auto;white-space:pre;tab-size:2}
.code .c{color:var(--ink-soft)}
.code .s{color:var(--stroke-teal)}
.code .k{color:var(--stroke-orchid)}
.code .bad{background:var(--pastel-blush);box-shadow:inset 2px 0 0 var(--stroke-coral);
  display:block;margin:0 -11px;padding:0 9px}
.code .good{background:var(--pastel-mint);box-shadow:inset 2px 0 0 var(--stroke-green);
  display:block;margin:0 -11px;padding:0 9px}
.code-hd{margin:14px 0 0;font-family:var(--font-mono);font-size:8.5px;
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

/* --------------------------------------------------------------- tip mark */
/* The glyph form of .tip. The dotted underline that promises a pointer on a word
   makes no sense under a 10px circle, so it comes off and the mark carries the
   affordance by being a mark. It is inline-flex at a fixed size so a cell that
   gains one does not gain a millimetre of height, and muted until hovered so a
   column of them reads as a margin note rather than as data. */
.tip.mk{display:inline-flex;vertical-align:-1px;margin-left:4px}
.tip.mk > label{border-bottom:0;display:inline-flex;align-items:center;
  cursor:pointer;color:var(--ink-soft);opacity:.7}
.tip.mk > label .ic{width:10px;height:10px}
.tip.mk > label:hover,.tip.mk > input:focus-visible + label{color:var(--accent);opacity:1}
.tip.mk .body{top:1.5em}
/* In a table the mark sits at the end of a value, so the panel is measured from
   the mark rather than from the cell and cannot push the column wider. */
td .tip.mk .body,th .tip.mk .body{width:300px}

/* ------------------------------------------------------ segmented control */
/* Radios wearing badges. The input keeps its box in the flow if you only make it
   transparent, and a native radio sits on the text baseline rather than on the
   badge centre -- which put every badge in the strip half a line low and out of
   line with its neighbours. It is taken out of flow instead of hidden, because a
   display:none radio is not focusable and the strip stops working from the
   keyboard. Checked state mirrors .gctl exactly: same border, same inset rule,
   no second visual language for the same idea. */
.seg-ctl{position:relative;display:flex;flex-wrap:wrap;align-items:center;
  gap:5px;margin-top:10px}
.seg-ctl input{position:absolute;width:1px;height:1px;margin:0;padding:0;
  border:0;opacity:0;clip-path:inset(50%);pointer-events:none}
.seg-ctl label{display:inline-flex;align-items:center;cursor:pointer;padding:2px 3px}
.seg-ctl label .badge{cursor:pointer}
.seg-ctl input:checked + label .badge{border-color:var(--ink);color:var(--ink);
  box-shadow:inset 0 0 0 1px var(--ink)}
.seg-ctl label:hover .badge{border-color:var(--ink-muted)}
.seg-ctl input:focus-visible + label .badge{outline:2px solid var(--stroke-teal);
  outline-offset:2px}

/* --------------------------------------------------------- glyph controls */
/* A row of icon buttons that behave like badges: same height, same border, same
   radius. They differ from .badge only in being pressable, so they must not
   redeclare geometry -- they carry .badge and add state. */
.gctl{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.gctl button{background:none;border:0;padding:2px 3px;cursor:pointer;font:inherit}
.gctl button .badge{cursor:pointer}
.gctl button[aria-pressed="true"] .badge{border-color:var(--ink);color:var(--ink);
  box-shadow:inset 0 0 0 1px var(--ink)}
.gctl button:hover .badge{border-color:var(--ink-muted)}

/* ---------------------------------------------------------- viewports */
/* A frame whose controls dock inside it. The frame is a positioning context and
   nothing else; every dock is absolute against it, so the content keeps the
   whole rectangle and a grid of four frames costs no toolbars at all. Docks are
   9px off the edge -- the same inset as the .hud that predates them, because two
   insets on one page reads as a mistake even when neither is wrong. */
.vp{position:relative;border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--paper-alt);overflow:hidden}
.vp-body{position:relative;aspect-ratio:16/10;display:block}
.vp-body > svg,.vp-body > canvas,.vp-body > img{display:block;width:100%;height:100%}
/* The options rail spans the top edge so its two ends anchor to the two corners.
   A rail that shrink-wrapped its content would drift as the labels changed. */
.vp-top{position:absolute;left:9px;right:9px;top:9px;display:flex;
  align-items:flex-start;justify-content:space-between;gap:8px;pointer-events:none}
.vp-top > .l,.vp-top > .r{display:flex;align-items:center;gap:5px;
  flex-wrap:wrap;pointer-events:auto}
.vp-top > .r{justify-content:flex-end}
/* One row for all three bottom docks, so an empty centre still holds its column
   and the left and right clusters cannot drift inward to meet each other. */
.vp-bot{position:absolute;left:9px;right:9px;bottom:9px;display:grid;
  grid-template-columns:1fr auto 1fr;align-items:end;gap:8px;pointer-events:none}
.vp-bot > .d{display:flex;align-items:center;gap:5px;pointer-events:auto;min-width:0}
.vp-bot > .bl{justify-content:flex-start}
.vp-bot > .bc{justify-content:center}
.vp-bot > .br{justify-content:flex-end}
/* Controls sit on their own plate rather than directly on the content: over a
   map or a rendered stage the badge border alone is not enough separation, and
   a translucent plate keeps the frame legible underneath. */
.vp-btns{display:flex;align-items:center;gap:5px;padding:5px 6px;
  background:var(--tip-paper);border:1px solid var(--rule-soft);
  border-radius:var(--radius);box-shadow:0 1px 4px rgba(0,0,0,.10)}
.vp-btns button{background:none;border:0;padding:0;cursor:pointer;font:inherit}
.vp-btns button .badge{cursor:pointer}
.vp-btns button[aria-pressed="true"] .badge{border-color:var(--ink);color:var(--ink);
  box-shadow:inset 0 0 0 1px var(--ink)}
.vp-btns button:hover .badge{border-color:var(--ink-muted)}
/* The readout. Bigger than the body face, not smaller: it is the one figure on
   the page meant to be read at a glance and from a distance. */
.vp-read{display:flex;align-items:baseline;gap:4px;padding:4px 8px 5px;
  background:var(--tip-paper);border:1px solid var(--rule-soft);
  border-radius:var(--radius);box-shadow:0 1px 4px rgba(0,0,0,.10)}
.vp-read .v{font-family:var(--font-mono);font-size:17px;line-height:1;
  font-variant-numeric:tabular-nums;color:var(--ink)}
.vp-read .u{font-family:var(--font-mono);font-size:8.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-soft)}
.vp-read .s{font-size:8.5px;color:var(--ink-muted);margin-left:4px}
/* The picker. Checkbox, label and a full-viewport scrim label behind the panel,
   so outside-click dismissal is a real click on a real element and needs no
   script. It opens away from the edge it is docked to. */
.vp-pick{position:relative;display:inline-flex}
.vp-pick > input{position:absolute;width:1px;height:1px;opacity:0;
  clip-path:inset(50%);pointer-events:none}
.vp-pick > .mk{display:inline-flex;cursor:pointer}
.vp-pick > .mk .badge{cursor:pointer}
.vp-pick > input:checked ~ .mk .badge{border-color:var(--ink);color:var(--ink);
  box-shadow:inset 0 0 0 1px var(--ink)}
.vp-pick > .scrim{display:none;position:fixed;inset:0;z-index:14;cursor:default}
.vp-pick > input:checked ~ .scrim{display:block}
.vp-pick > .panel{display:none;position:absolute;z-index:15;left:0;top:calc(100% + 6px);
  min-width:118px;padding:6px 0;background:var(--tip-paper);
  border:1px solid var(--rule);border-radius:var(--radius);
  box-shadow:0 6px 20px rgba(0,0,0,.14)}
.vp-pick.up > .panel{top:auto;bottom:calc(100% + 6px)}
.vp-pick.rt > .panel{left:auto;right:0}
.vp-pick > input:checked ~ .panel{display:block}
.vp-pick .panel .t{display:block;padding:1px 10px 5px;font-family:var(--font-mono);
  font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft)}
.vp-pick .panel .opt{display:block;padding:4px 10px;font-size:10.5px;
  color:var(--ink-muted);white-space:nowrap;cursor:pointer}
.vp-pick .panel .opt:hover{background:var(--paper-alt);color:var(--ink)}
.vp-pick .panel .opt.on{color:var(--ink);font-weight:600;
  box-shadow:inset 2px 0 0 var(--accent)}
/* The frame's own name, printed on the frame rather than under it: in a grid, a
   caption below a viewport is nearer the next viewport than to its own. It is a
   strip with its own rule rather than text floated over the content, and the
   bottom docks lift clear of it -- overlaid, it ran straight through the
   bottom-left cluster on the first frame that had both. */
.vp-cap{position:absolute;left:0;right:0;bottom:0;padding:4px 10px 5px;
  background:var(--paper);border-top:1px solid var(--rule-soft);
  font-family:var(--font-mono);font-size:9px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-soft);pointer-events:none}
.vp.has-cap .vp-bot{bottom:28px}
/* A single frame at page width is 16:10 of a very wide column. A map or a track
   is the one thing that reads better letterboxed, and it keeps the docks close
   enough together to be seen as one system. */
.vp.wide .vp-body{aspect-ratio:21/9}
.vpgrid{display:grid;gap:12px;margin-top:10px;
  grid-template-columns:repeat(auto-fit,minmax(268px,1fr))}
@media (max-width:520px){.vpgrid{grid-template-columns:1fr}}

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
/* Label and figure on one baseline, bar spanning both columns under them. The
   figure used to be centred against the whole two-row stack, which left it
   hanging between the label and the bar and touching neither. Tabular figures
   and a right edge so a column of these lines up down the page. */
.meter-row{display:grid;grid-template-columns:1fr auto;column-gap:10px;row-gap:3px;
  align-items:baseline;margin-top:7px;max-width:380px}
.meter-row .lb{font-size:10px;color:var(--ink-muted);min-width:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.meter-row .vl{font-family:var(--font-mono);font-size:10px;color:var(--ink);
  font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.meter-row .meter,.meter-row .bullet{grid-column:1 / -1}
/* The bullet is drawn 240x15 and stretched horizontally on purpose, so its
   height must be pinned. Left to height:auto it keeps the 16:1 ratio of the
   viewBox, and at page width a 15px bar came out 70px tall -- a pale block. */
.meter-row .bullet{height:15px}

/* --------------------------------------------------------------- charts */
/* Every drawing is a block so it cannot pick up the inline-formatting leading of
   its paragraph, and every one is width-capped rather than stretched: a chart
   allowed to fill a 1600px window turns a legible line into a flat one. */
.donut,.bullet,.heat,.tline,.lchart,.bchart,.schart{display:block;max-width:100%;
  height:auto;margin:0 auto}
.lchart,.bchart,.schart,.tline{width:100%}
/* The calendar band is the one drawing that keeps its authored pixel size. It
   is sized in cells, not in columns, so it overflows its scroll box rather than
   scaling a 9px cell up to whatever width the page happens to have. */
.heat{width:auto;max-width:none;margin:0}
.scroll > .heat{margin:2px 0 4px}

/* The band and the rail that sizes it. The rail sits over the top-left corner
   of the box, the way tile stacks its viewport controls over the corner of the
   stage rather than in a strip above it -- the control belongs to the thing,
   and a toolbar in the margin makes the reader look away from it to use it.
   Hidden until the script marks the box live: three buttons that do nothing are
   worse than no buttons. */
.heat-box{position:relative}
/* Straddling the left edge, the way the scroll hint straddles the right. Flush
   inside, the rail covered the weekday gutter and took Mon off the band. */
.heat-ctl{position:absolute;left:-10px;top:-1px;z-index:3;display:none;margin:0;
  flex-direction:column;gap:0;background:var(--paper-card);
  border:1px solid var(--rule);border-radius:var(--radius);
  box-shadow:0 2px 8px rgba(0,0,0,.10)}
.heat-box.live .heat-ctl{display:flex}
.heat-ctl button{padding:3px 4px;line-height:0}
.heat-ctl button + button{border-top:1px solid var(--rule-soft)}
.heat-ctl button svg{width:9px;height:9px;fill:var(--ink-muted)}
.heat-ctl button[disabled] svg{fill:var(--rule)}
/* The magnifying glass reports what it did. A write to localStorage is
   invisible, and a control that gives no sign it worked gets pressed twice. */
.heat-ctl button.kept svg{fill:var(--stroke-mint)}

/* ------------------------------------------------------- history column */
/* A history column is one shape wide and must not be allowed to set the row
   height, so the cell is sized and the SVG fills it. preserveAspectRatio is
   none on this spark, which is what lets 68x18 hold twelve months without the
   line going flat. */
td.hs{width:76px;padding-top:2px;padding-bottom:2px}
.hcell{display:block;height:18px;line-height:0}
.hcell .spark{display:block;width:68px;height:18px}
/* The residual line. Muted rather than badged: it is the same kind of thing as
   the rows above it, only unnamed, and a badge would make it a category. */
tr .rest{color:var(--ink-faint);font-style:italic}
tr .rest .n{font-style:normal;font-family:var(--font-mono)}

/* ---------------------------------------------------------------- schema */
/* An entity-relationship diagram: HTML cards over one SVG wire layer. The frame
   scrolls rather than shrinking the cards, because a schema read at 60% is a
   picture of a schema. */
.erd{position:relative;overflow:auto;border:1px solid var(--rule);
  border-radius:var(--radius);background:var(--paper-alt);padding:10px}
.erd-stage{position:relative;transform-origin:0 0}
.erd-wires{position:absolute;left:0;top:0;pointer-events:none}
/* The card. Ink border and the page drop shadow, so it reads as a thing laid on
   the stage; the wires pass behind it because the stage is painted first. */
.ecard{position:absolute;width:176px;background:var(--paper-card);
  border:1px solid var(--ink);border-radius:var(--radius-sm);
  box-shadow:2px 2px 0 var(--rule);overflow:hidden}
.ehd{display:flex;align-items:center;justify-content:space-between;gap:8px;
  height:26px;padding:0 6px 0 8px;background:var(--paper-alt);
  border-bottom:1px solid var(--ink);font-size:10.5px;font-weight:600}
.ecol{display:flex;align-items:center;justify-content:space-between;gap:8px;
  height:19px;padding:0 8px;font-family:var(--font-mono);font-size:9px;
  color:var(--ink-muted);border-top:1px solid var(--rule-soft)}
.ecol .et{color:var(--ink-faint);text-align:right;white-space:nowrap}
/* A key row is tinted, not boxed. The tint says "these are the rows the diagram
   is wired through" without spending a border the card is already using. */
.ecol.pk,.ecol.fk{background:var(--pastel-vanilla)}
.ecol.pk .en{font-weight:700;color:var(--ink)}
/* The dot is the key mark. A glyph at 9px in a 19px row is a smudge; a filled
   circle is legible at any size and needs no file. */
.ecol.pk .en::before{content:"";display:inline-block;width:5px;height:5px;
  margin-right:5px;border-radius:50%;background:var(--stroke-lilac);
  vertical-align:1px}
.ecol.fk .en{font-style:italic;color:var(--stroke-lilac)}
/* The foreign-key mark. A 7px glyph in a 19px row came out as two specks; the
   arrow is a character, sets at the row's own size, and needs no file. */
.ecol.fk .en::after{content:"\\2197";margin-left:4px;font-style:normal}
.ehd .ecount{font-family:var(--font-mono);font-size:9px;color:var(--ink-faint);
  letter-spacing:.03em}
/* margin-top comes from .gctl, which is a rail that sits under a figure. This
   one is pinned to a corner, where a 10px top margin is 10px of drift. */
.erd-ctl{position:absolute;right:10px;top:10px;z-index:3;display:none;margin:0;
  background:var(--paper-card);border:1px solid var(--rule);
  border-radius:var(--radius);box-shadow:0 2px 8px rgba(0,0,0,.10)}
.erd.live .erd-ctl{display:flex}
.erd-ctl button{padding:4px 5px;line-height:0}
.erd-ctl button + button{border-left:1px solid var(--rule-soft)}
.erd-ctl button svg{width:9px;height:9px;fill:var(--ink-muted)}
.erd-ctl button[disabled] svg{fill:var(--rule)}

/* A drop control that carries a glyph. The canonical bare variant sizes its mark
   because a bare control IS the mark; the boxed one never had one to size, and an
   unsized inline SVG in a 19px box comes out at whatever the file says. */
dialog.rows button.drop .ic{width:9px;height:9px;margin-right:5px;vertical-align:-1px}

/* The canonical hint rotates its glyph, which assumes a caret drawn pointing
   down. Ours is a circle-chevron already pointing where the table goes. */
.scroll-hint svg{transform:none}

/* A table caption carries its scope on its own line, the same as a figure does.
   The canonical rule is scoped to figure figcaption, so a scope inside a
   caption inherited nothing and ran straight on from the sentence before it. */
caption .scope{display:block;margin-top:4px;font-family:var(--font-mono);
  font-size:10.5px;line-height:1.5;color:var(--ink-soft)}
.donut{margin:6px auto 2px}
.hbars{margin-top:8px}
.donut-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:8px}
.donut-row .lg{flex:1 1 190px;min-width:0}
/* Two rings on one row, each in half the column with its legend under it. Side
   by side the ring and its legend split the column and the ring loses half its
   diameter for a list that reads perfectly well underneath. Below 460px the pair
   stacks: two 132px rings in a phone column are two 60px rings. */
.donut-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px 18px;margin-top:8px}
.donut-pair .du{display:flex;flex-direction:column;align-items:center;gap:9px;
  min-width:0}
.donut-pair .du .lg{width:100%}
.donut-pair .du .legend{justify-content:center;margin:0}
@media (max-width:460px){.donut-pair{grid-template-columns:1fr}}

/* ------------------------------------------------------------- hover pods */
/* The readout a chart shows under the pointer. Hidden by default and revealed by
   hovering or focusing the group that owns it, so the picture is complete with
   scripting off and the detail is reachable from the keyboard. The plate is
   drawn inside the SVG, so the root has to stop clipping: a pod on the last
   point of a line sits past the right edge of the viewBox by design. */
.lchart,.bchart,.schart{overflow:visible}
.hv .pod,.hv .on{opacity:0;transition:opacity .1s ease}
.hv:hover .pod,.hv:focus-visible .pod,.hv:hover .on,.hv:focus-visible .on{opacity:1}
.hv{outline:none}
.hv .hit{cursor:crosshair}

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

/* --------------------------------------------------- the section heading */
/* tokens.ts already sets h2 as a wrapping flex row, gives .n and .hint the same
   printed-mark treatment, and pushes .hint out to the right with margin-left:auto.
   Two things are added here and nothing is overridden.

   The statement takes the full width of the row, which in a wrapping flex row is
   what forces it onto its own line under the title. It is deliberately not a
   sibling <p>: a paragraph after the heading has the heading's bottom margin
   between them and reads as body copy that happens to sit first, where this reads
   as part of the heading and is skipped by the eye that is only scanning titles.

   Its weight and colour are stepped down from the title on purpose. Same size as
   a caption, because that is what it is. */
h2 .stmt {
  flex-basis: 100%; margin-top: 4px;
  font-size: 10.5px; font-weight: 400; line-height: 1.5;
  color: var(--ink-muted); letter-spacing: 0;
}

/* The hint's glyph. Sized to the mono cap-height beside it rather than to the
   title, or it sets the height of the whole badge and the mark stops matching
   the number at the other end of the line. */
h2 .hint .ic { width: 9px; height: 9px; margin-right: 4px; vertical-align: -1px; }

/* ---------------------------------------------------- layout surfaces */
/* Cards across, one column on a phone. auto-fit rather than a fixed count, so a
   fourth node does not need a second grid declared for it. */
.cardgrid {
  display: grid; gap: 12px; margin-bottom: 14px;
  grid-template-columns: repeat(auto-fit, minmax(232px, 1fr));
}
.cardgrid .card { margin-bottom: 0; }

/* A band member. The title takes the slack and the badges terminate on the right
   edge, so the metadata forms a column down the list instead of trailing each
   title at whatever length that title happens to be. */
.band-fs .nm { flex: 1 1 auto; min-width: 0; font-size: 11px; }
.band-fs .badge { flex: none; }
.keyrow .ki { gap: 4px; }

/* The summary of a band is the band header, so the marker has to go or it sits
   in front of a header that already carries a glyph. */
.band > summary { cursor: pointer; list-style: none; }
.band > summary::-webkit-details-marker { display: none; }
`;
