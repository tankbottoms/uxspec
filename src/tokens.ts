/**
 * Stylesheet, ported from the teslamate-dash design system
 * (~/Developer/docker/teslamate-dash/src/ui.ts, served at
 * https://tesla.atsignhandle.xyz/tesla-dash/). That system replaced the earlier
 * pastel-brutalist look: the 2px rules and the `3px 3px 0` offset shadow are
 * gone, and separation is carried by warm paper, three weights of hairline and
 * a 5px radius instead. The palette tokens survive the change unaltered, which
 * is why the vintage colours below still resolve.
 *
 * Fonts are named, never fetched. This page is served from the LAN and holds
 * financial PII; a CDN request would leak the fact of it.
 */
export const CSS = `
:root {
  --paper:#faf9f7; --paper-card:#ffffff; --paper-alt:#f6f4f1; --tip-paper:#ffffff;
  --ink:#1c1e20; --ink-muted:#5f666d; --ink-soft:#8b9299; --ink-faint:#a8aeb4;
  --rule:#e2ded8; --rule-soft:#eae7e1; --rule-hair:#f1efeb;
  --accent:#2e8fa6;

  --pastel-orchid:#f4e1fc; --pastel-violet:#f0befa; --pastel-peach:#fcdcc7;
  --pastel-vanilla:#fcf7dc; --pastel-blush:#ffe6e6; --pastel-rose:#ffc2d0;
  --pastel-aqua:#afeffd; --pastel-mint:#e0fff1;
  --pastel-indigo:#bdbedc; --pastel-cyan:#80deea; --pastel-green:#a5d6a7;
  --pastel-amber:#ffd54f; --pastel-coral:#ef9a9a; --pastel-lilac:#d1c4e9;
  --pastel-teal:#b2dfdb; --pastel-lime:#d4f1a8;

  --stroke-orchid:#9a6bb0; --stroke-violet:#a855c4; --stroke-peach:#c97e45;
  --stroke-vanilla:#b39b3c; --stroke-blush:#c77070; --stroke-rose:#c75f81;
  --stroke-aqua:#2e8fa6; --stroke-mint:#3e9b72; --stroke-indigo:#6e6fa8;
  --stroke-cyan:#3792a4; --stroke-green:#5e9463; --stroke-amber:#b08a2a;
  --stroke-coral:#c06060; --stroke-lilac:#7e63b0; --stroke-teal:#3e8f86;
  --stroke-lime:#6f9435;

  --font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,'Helvetica Neue',sans-serif;
  --font-mono:'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,SFMono-Regular,Menlo,monospace;
  --radius:5px; --radius-sm:3px;
}
/* Solarized dark, offered explicitly in the gear menu and used automatically when
   the reader has set a system preference and has not chosen otherwise. Both
   selectors carry the same tokens; the attribute one wins, so the menu overrides
   the operating system rather than fighting it. */
:root[data-theme="solarized"] {
  --paper:#002b36; --paper-card:#073642; --paper-alt:#053642; --tip-paper:#073642;
  --ink:#93a1a1; --ink-muted:#839496; --ink-soft:#586e75; --ink-faint:#46595f;
  --rule:#12495a; --rule-soft:#0c3f4e; --rule-hair:#083642; --accent:#2aa198;
  --pastel-orchid:#2f2f52; --pastel-violet:#45213c; --pastel-peach:#472619;
  --pastel-vanilla:#3f3617; --pastel-blush:#452023; --pastel-rose:#48213a;
  --pastel-aqua:#0d4149; --pastel-mint:#204331; --pastel-indigo:#2b3050;
  --pastel-cyan:#103a52; --pastel-green:#2c3d1a; --pastel-amber:#433715;
  --pastel-coral:#481f1e; --pastel-lilac:#332f52; --pastel-teal:#15444a; --pastel-lime:#33441a;
  --stroke-orchid:#8f93d8; --stroke-violet:#d33682; --stroke-peach:#cb4b16;
  --stroke-vanilla:#b58900; --stroke-blush:#dc322f; --stroke-rose:#e0669f;
  --stroke-aqua:#2aa198; --stroke-mint:#5aab84; --stroke-indigo:#6c71c4;
  --stroke-cyan:#268bd2; --stroke-green:#859900; --stroke-amber:#cb9b12;
  --stroke-coral:#dc322f; --stroke-lilac:#8f8fd6; --stroke-teal:#3fb3a8; --stroke-lime:#9cb52a;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --paper:#002b36; --paper-card:#073642; --paper-alt:#053642; --tip-paper:#073642;
    --ink:#93a1a1; --ink-muted:#839496; --ink-soft:#586e75; --ink-faint:#46595f;
    --rule:#12495a; --rule-soft:#0c3f4e; --rule-hair:#083642; --accent:#2aa198;
    --pastel-orchid:#2f2f52; --pastel-violet:#45213c; --pastel-peach:#472619;
    --pastel-vanilla:#3f3617; --pastel-blush:#452023; --pastel-rose:#48213a;
    --pastel-aqua:#0d4149; --pastel-mint:#204331; --pastel-indigo:#2b3050;
    --pastel-cyan:#103a52; --pastel-green:#2c3d1a; --pastel-amber:#433715;
    --pastel-coral:#481f1e; --pastel-lilac:#332f52; --pastel-teal:#15444a; --pastel-lime:#33441a;
    --stroke-orchid:#8f93d8; --stroke-violet:#d33682; --stroke-peach:#cb4b16;
    --stroke-vanilla:#b58900; --stroke-blush:#dc322f; --stroke-rose:#e0669f;
    --stroke-aqua:#2aa198; --stroke-mint:#5aab84; --stroke-indigo:#6c71c4;
    --stroke-cyan:#268bd2; --stroke-green:#859900; --stroke-amber:#cb9b12;
    --stroke-coral:#dc322f; --stroke-lilac:#8f8fd6; --stroke-teal:#3fb3a8; --stroke-lime:#9cb52a;
  }
}

* { box-sizing: border-box; }
body {
  margin: 0; background: var(--paper); color: var(--ink);
  overflow-x: clip; width: 100%; max-width: 100%; overscroll-behavior-x: none;
  font-family: var(--font-sans); font-size: 13px; line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
/* The body is locked at a readable measure and stays there. Tables that do not fit
   scroll inside their own plate (.scroll) rather than pushing this box wider - a
   page whose width changes section to section cannot be scanned down a column. */
/* The page does not move sideways. A table that is wider than the phone scrolls inside
   its own plate; nothing scrolls the document itself. clip rather than hidden, because
   hidden makes the element a scroll container - the very thing being prevented - while
   clip simply refuses to paint past the edge and leaves position: fixed alone, so the
   receipt sheets and tooltips still cover the viewport. */
html {
  /* Safari on iOS inflates text inside any block it judges too wide for the viewport.
     A prose table set in nowrap ran to two thousand pixels, tripped the heuristic, and
     rendered its sentences visibly larger than the same 10px type in the narrow table
     beside it - a size difference no rule in this file asked for and none could
     override. Pinned to 100%: this page decides its own type sizes. */
  -webkit-text-size-adjust: 100%; text-size-adjust: 100%;

  scrollbar-gutter: stable;
  overflow-x: clip; max-width: 100%;
}
main { box-sizing: border-box; width: 100%; max-width: 1180px; margin: 0 auto; padding: 18px 24px 90px; }
/* The room diagram is drawn at a fixed 900px and would otherwise push the page wider
   than main on a narrow desktop window, which reads as an off-centre right margin. */
.diagram-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
a { color: var(--accent); }

/* ------------------------------------------------------------- page head */
.page-head { border-bottom: 1px solid var(--rule); padding-bottom: 12px; margin-bottom: 18px; }
.eyebrow {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em;
  text-transform: uppercase; color: var(--accent);
}
/* The title is one line at every width. It is the page's name, and a name broken
   across two lines reads as two things. Below about 470px the type shrinks rather
   than the line breaking. */
h1 { margin: 5px 0 0; font-size: clamp(14px, 4.3vw, 20px); font-weight: 650;
     letter-spacing: -.02em; white-space: nowrap; }
.lede { margin: 5px 0 0; font-size: 12.5px; color: var(--ink-muted); max-width: none; }

/* Numbered section head. No underline - the gap does the separating, and the
   hint is pushed right so the title column stays flush down the page. */
/* A hairline above every section. Without it a figure caption and the table opening
   the next section read as one block, because both are small grey type on paper. */
hr.sep { height: 0; margin: 40px 0 0; border: 0; border-top: 1px solid var(--rule-hair); }
hr.sep:first-child { display: none; }
/* Centred, not baseline-aligned. An inline SVG has no baseline of its own, so it was
   set on the box's bottom edge and hung below the title it belongs to. */
h2 {
  display: flex; align-items: center; gap: 9px; margin: 24px 0 14px;
  flex-wrap: wrap; font-size: 13px; font-weight: 650; letter-spacing: -.01em;
}
h2:first-of-type { margin-top: 26px; }
/* The section number carries the same weight of information as a figure number, so it
   is set as the same printed mark: white fill, black rule, black text, fixed hexes so
   it does not invert to a solid black chip in dark mode. */
h2 .n {
  display: inline-block; padding: 1.5px 6px; vertical-align: 1px;
  border-radius: var(--radius-sm);
  background: #fff; color: #16161a; border: 1px solid #16161a;
  font-family: var(--font-mono); font-size: 9px; font-weight: 600;
  letter-spacing: .07em;
}
/* The figure at the right of a heading is the section's headline quantity - the ETH
   held, the open lots - and it was the only mark on that line set as loose grey type.
   It carries the same printed chip as the section number at the left, so the heading
   reads as a numbered row bracketed by two figures rather than a title trailing off. */
h2 .hint {
  margin-left: auto; display: inline-block; padding: 1.5px 6px; vertical-align: 1px;
  border-radius: var(--radius-sm);
  background: #fff; color: #16161a; border: 1px solid #16161a;
  font-family: var(--font-mono); font-size: 9px; font-weight: 600;
  letter-spacing: .07em; white-space: nowrap;
}
/* Prose runs the full locked width, the same width as the tables under it. A
   measure cap here left every paragraph ending a third of the way short of the
   table it introduced, which read as two columns that had come apart. */
p { margin: 0 0 10px; max-width: none; }
p.lead { font-size: 13.5px; line-height: 1.62; }

/* ----------------------------------------------------------------- cards */
.card {
  border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-card); padding: 15px 16px; margin-bottom: 14px;
}
.card-hdr {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 11px;
  padding-bottom: 9px; border-bottom: 1px solid var(--rule-hair);
}
.card-title { font-size: 12.5px; font-weight: 650; }
.card-meta { margin-left: auto; font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-soft); }

/* Section 9 runs widthwise: each group is one full-width band in a shared
   plate, so the eye scans one column of documents top to bottom instead of
   hopping between three short columns of unequal length. */
.bands { border: 1px solid var(--rule); border-radius: var(--radius); overflow: hidden; background: var(--paper-card); }
.band { border-bottom: 1px solid var(--rule); }
.bands .band:last-child { border-bottom: 0; }
.band-hd {
  display: flex; align-items: baseline; gap: 10px; padding: 11px 13px 10px;
  border-bottom: 1px solid var(--rule-hair); background: var(--paper-alt);
}
/* The kind badge and the group title are two separate things, not a phrase - a
   single word space reads as one run of text and the badge stops being a label. */
.band-hd .nm { display: flex; align-items: center; gap: 9px; font-size: 12px; font-weight: 650; }
.band-hd .ct { margin-left: auto; font-family: var(--font-mono); font-size: 10px; color: var(--ink-soft); }
.band-fs { display: flex; flex-wrap: wrap; gap: 4px 10px; padding: 9px 13px 11px; }
/* The document index. Every group is its own table, so the column widths have to
   be declared rather than measured or the date, type and file columns land in a
   different place in each band. fixed layout is what makes the colgroup binding;
   without it the widths are only hints and a long filename still moves them. */
.docs { table-layout: fixed; }
.docs td a { overflow-wrap: anywhere; }
.band-fs a {
  font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-muted);
  text-decoration: none; border-bottom: 1px dotted var(--rule);
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.band-fs a:hover { color: var(--accent); border-bottom-color: var(--accent); }

/* ------------------------------------------------------------- KPI strip */
/* One bordered rail with hairline dividers, not N separate boxes: nine loose
   boxes read as nine things, one rail reads as one row of readings. */
.tiles {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(158px, 1fr));
  border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-card); overflow: hidden; margin-bottom: 16px;
}
.tile {
  padding: 11px 13px; border-right: 1px solid var(--rule-hair);
  border-bottom: 1px solid var(--rule-hair);
  display: flex; flex-direction: column; gap: 1px; min-width: 0;
  align-items: center; text-align: center;
}
.tile .k {
  font-size: 9.5px; letter-spacing: .07em; text-transform: uppercase; color: var(--ink-soft);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tile .v {
  font-family: var(--font-mono); font-size: 19px; font-weight: 650;
  letter-spacing: -.02em; line-height: 1.25; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tile .s { font-size: 10.5px; color: var(--ink-muted); text-align: center; }

/* ---------------------------------------------------------------- badges */
/* THE BADGE CONTRACT. Read this before adding a badge anywhere, on any page.
 *
 * Every badge on every page is the same height and takes its width from the
 * scale below - never from its own text. This was rebuilt once already: the
 * first version gave each column its own hand-tuned .badge.<column>{width}
 * rule, so a second page written later inherited none of them and came out
 * ragged. A scale cannot be forgotten by a new page the way a per-column rule
 * can, which is the whole reason it exists.
 *
 *   1. Height is fixed here, once, for every badge. Do not set it per badge.
 *   2. Width comes from exactly one class in the .w* scale. A badge in a table
 *      cell without one is a bug, and lint.sh fails the build over it.
 *   3. Colour comes from a named token class - never an inline hex. A value
 *      that means the same thing in two tables carries the same colour class
 *      in both.
 *   4. content-box, always. The global reset is border-box, and a width on a
 *      padded border-box leaves the label field a different size in every
 *      badge, which is the ragged column this scale exists to prevent. */
.badge {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  box-sizing: content-box; white-space: nowrap;
  border: 1px solid var(--rule); border-radius: var(--radius-sm);
  height: 15px; padding: 0 7px;
  font-family: var(--font-mono); font-size: 10px; line-height: 1;
  letter-spacing: .04em; background: var(--paper-card); color: var(--ink-muted);
}
/* The width scale. The number is characters of label field, padding excluded,
   so two badges with the same class are the same total width whatever they say.
   Pick the step that fits the longest value the column can hold; a longer label
   is clipped rather than allowed to widen its own box out of line with the rest
   of the column. */
/* A "ch" is one character advance and does not include letter-spacing, so a label of N
   characters in this font occupies N ch PLUS N x .04em -- about 0.4px a character at
   10px. Uncompensated, any label that exactly fills its step overruns the box it was
   given: "Partial" clipped by 2px at w7, "Progressive Insurance Premium" by 3px at w30.
   Each step therefore adds its own letter-spacing back. The alternative -- widening the
   scale, or having wcls() round up a step -- buys 3px of fit with up to 24px of slack on
   every short label in the column, which is how a column goes ragged in the other
   direction. */
.badge.w3 { width: calc(3ch + 3 * 0.04em); }
.badge.w5 { width: calc(5ch + 5 * 0.04em); }
.badge.w7 { width: calc(7ch + 7 * 0.04em); }
.badge.w9 { width: calc(9ch + 9 * 0.04em); }
.badge.w11 { width: calc(11ch + 11 * 0.04em); }
.badge.w12 { width: calc(12ch + 12 * 0.04em); }
.badge.w14 { width: calc(14ch + 14 * 0.04em); }
.badge.w17 { width: calc(17ch + 17 * 0.04em); }
.badge.w19 { width: calc(19ch + 19 * 0.04em); }
.badge.w23 { width: calc(23ch + 23 * 0.04em); }
.badge.w25 { width: calc(25ch + 25 * 0.04em); }
.badge.w3, .badge.w5, .badge.w7, .badge.w9, .badge.w11, .badge.w12,
.badge.w14, .badge.w17, .badge.w19, .badge.w23, .badge.w25 {
  overflow: hidden; text-overflow: ellipsis; display: inline-flex;
}
/* The "auto" class is the deliberate opt-out, for a badge that is a heading rather
   than a column: it declares that no column has to line up with it. */
.badge.auto { width: auto; min-width: calc(9ch + 9 * 0.04em); }
.badge.w30 { width: calc(30ch + 30 * 0.04em); }
.badge.w34 { width: calc(34ch + 34 * 0.04em); }
/* The two widest steps exist for an account column: a full institution name runs to
   'American Express Platinum by Goldman Sachs', 42 characters, and clipping it to 25
   leaves two Amex cards and four Fidelity accounts indistinguishable from each other. */
.badge.w38 { width: calc(38ch + 38 * 0.04em); }
.badge.w42 { width: calc(42ch + 42 * 0.04em); }
.badge.w30, .badge.w34, .badge.w38, .badge.w42 {
  overflow: hidden; text-overflow: ellipsis; display: inline-flex;
}

/* A badge turned on its side, so a column that only labels a block of rows costs
   the table 15px of width instead of thirty characters of it. Reading runs bottom
   to top, which is the direction a rotated column header is read in print. The
   physical width and height swap over, so both are restated here -- the scale
   class is still declared at the call site, because the contract above requires
   one and because the ch value is what sets the minimum length of the label. */
.badge.vert {
  writing-mode: vertical-rl; transform: rotate(180deg);
  /* Bigger and thicker than the table's own text, because it is a heading rather than
     a value and it is read side-on, which costs legibility that has to be paid back.
     The horizontal padding is what gives the label its thickness: with the text turned,
     padding-left and padding-right are the two sides of the ribbon it sits in. */
  font-size: 11.5px; letter-spacing: .07em; padding: 0 4px;
  /* No box. A group label spans a block of rows, so a bordered pill around it draws a
     tall rectangle competing with the table's own rules, and the pill can only be as
     tall as its own text while the block it labels is taller. Dropping the fill and the
     border leaves the group's colour carried by the text alone. */
  background: transparent; border-color: transparent;
  /* A name longer than its block is cut short with an ellipsis rather than silently
     losing its last letters, so a reader can tell a truncation from a group actually
     called "& furnish". Block, not flex, because text-overflow needs a block container;
     with the text on its side the inline axis runs down the cell, so text-align centres
     the label vertically. */
  display: block; text-align: center; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
/* The glyph that stands in for a group name.

   A rotated name is only as legible as its block is tall. Two rows of Digital is
   fifty-eight pixels of a word that wants ninety, and after a sort no block is more
   than a row or two deep -- the row count is exactly what a sort changes. So the name
   is the optional half of the label and the glyph is the half that is always there:
   one line high whatever the block, the group's own colour, and the full name on the
   cell's title for anyone who wants to read it rather than recognise it.

   No box around it. It is a mark, not a value, and a pill here would draw a second
   rectangle inside a cell that is already a tall rectangle. */
.badge.gi { background: transparent; border-color: transparent; padding: 0; }
.badge.gi .ic { width: 13px; height: 13px; }
/* The glyph inside the rotated label, rather than stacked above it.

   Owner ruling 2026-08-23: one badge, mark and name together. Two badges in a column
   read as two separate things about the block when they are one thing said twice.

   The rotation is arithmetic, not taste. An inline-block inside .badge.vert is turned
   only by that rule's 180deg, while the letters beside it are turned a further 90deg
   by vertical writing -- so the glyph would arrive upside down against its own name.
   A further 90deg here lands it at 270deg, which is the letters' own angle. And the
   gap has to be margin-inline-end: with the text on its side the inline axis runs down
   the cell, so a right margin would push the glyph across the ribbon, not along it. */
.badge.vert .gm {
  display: inline-block; transform: rotate(90deg); margin-inline-end: 5px;
}
.badge.vert .gm .ic { width: 12px; height: 12px; }
/* The label cell's contents, out of flow as one stack.

   Out of flow because a minimum height in the row would make the label the tallest
   thing in it, padding every short block out with air; out of flow the rows keep the
   height their content asks for and the label is centred in whatever height the block
   ends up with. Sized to its content and pulled back over its own centre line, which
   is what actually centres it -- stretching it with left:0;right:0 puts the single line
   of text at the block-start edge, and in vertical writing that edge is the left-hand
   side of the cell. Top and bottom are inset so a full-height name does not run into
   the rules above and below it. */
td.rot > .gstack {
  position: absolute; top: 9px; bottom: 9px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 5px;
}
td.rot > .gstack > .gi { flex: 0 0 auto; }
td.rot > .gstack > .vert { flex: 1 1 auto; min-height: 0; }
/* Specificity, not preference. The call site declares a width class from the scale --
   .badge.w19 and the like -- and that selector is (0,2,0), so a plainly-written
   td.rot > .vert loses to it and the rotated label is handed nineteen characters of
   *physical* width inside a cell fifteen pixels wide. Naming the class twice buys
   (0,3,1), which wins, and keeps the selector clear of the .badge-dot-name shape the
   badge linter reads as a width declaration. The label's real extent is the cell's. */
.rot > .gstack > .vert.vert { width: auto; height: auto; min-width: 0; }
.rot > .gstack > .gi.gi { width: auto; height: auto; min-width: 0; }
/* Glyph only. Two cases, one rule: a block too short to hold its own name upright-on-
   its-side, marked at render time, and every block after a sort, marked by the script
   that re-cuts them -- a sort is free to leave one row where nine were, so no width
   decided beforehand survives it. */
td.rot.gonly .gn { display: none; }
/* With the name gone the ribbon has nothing left to turn on its side, so it stops
   stretching, stands back up and closes around the mark. The glyph's own 90deg was
   only ever there to answer the label's 180deg; with that gone it comes off too, and
   so does the gap it was holding open for a name that is no longer beside it. */
td.rot.gonly > .gstack > .vert {
  flex: 0 0 auto; writing-mode: horizontal-tb; transform: none; padding: 1.5px 5px;
}
td.rot.gonly .gm { transform: none; margin-inline-end: 0; }
/* Sorted out of its groups, the label has nothing left but the mark, and a pill drawn
   round a single glyph reads as a second, emptier badge beside the subtotal's. Keep the
   tone, drop the box, so the two marks in a column match. */
td.rot.gonly > .gstack > .vert { background: transparent; border-color: transparent; }

/* Section reset. It belongs to the page, not to the data, and the way it says so is by
   carrying no fill at all -- every badge around it is filled because its colour means
   something, and a solid black one asserted a meaning it does not have while shouting
   louder than the figures it sits beside. Outlined ink on paper: still plainly a
   control, no longer the darkest mark in the section. */
.badge.reset {
  display: inline-flex; align-items: center; gap: 5px; margin-inline-start: 12px;
  background: var(--paper-card); border-color: var(--ink-muted); color: var(--ink-muted);
  font-family: var(--font-mono); cursor: pointer;
}
.badge.reset:hover { border-color: var(--ink); color: var(--ink); }
.badge.reset .ic { width: 9px; height: 9px; }
/* Glyph only means the stack is one 13px mark, and 13px does not fit in the 11px a
   one-row block leaves between the 9px insets -- the mark overflowed its cell and read
   as a misaligned row. With no name to keep clear of the rules above and below, the
   insets have nothing to protect, so they come off and the glyph centres in the cell. */
td.rot.gonly > .gstack { top: 0; bottom: 0; justify-content: center; }
/* The smaller face for a name that will not fit its block at the reading size.

   Set once, as a modifier, rather than per group: which groups are short is a property
   of the data on the day, not of the group. Tracking comes back in as the size drops --
   at 9.5px the .07em above is what makes a rotated word look spaced out rather than
   set. */
.badge.vert.sm { font-size: 9.5px; letter-spacing: .04em; }
/* Height floors for a label cell whose block is shorter than its own name.

   Dropping the name was the old answer and it cost the column its meaning for exactly
   the groups a reader is least likely to recognise from a glyph -- Digital, Discontinued.
   The steps are whole rows (29px each) so a stretched block still lines up with the rest
   of the table, and a height set on a rowspanned cell is a floor the browser shares out
   across the rows it spans, which is the white space the group was asked to have rather
   than padding added to every row. Four rows is the ceiling: past that the block is
   taller than the reason for it. */
td.rot.gh2 { height: 58px; }
td.rot.gh3 { height: 87px; }
td.rot.gh4 { height: 116px; }
td.rot.gh5 { height: 145px; }

/* Subtotal and total rows. Neither is a row of data -- both are arithmetic on the rows
   above -- so both are tinted off the data field and ruled away from it. The subtotal
   closes a group block and the grand total closes the table, which is why the second
   rule is the heavier of the two. The sort script already keeps both out of the sort. */
/* A row still in the table but no longer live -- a feed that has stopped reporting.
   Washed back rather than removed, because the row is the finding: an account that is
   not reporting is the reason a month looks cheap. */
tr.ghost { opacity: .9; }
tr.sub > td { background: var(--paper-alt); border-top: 1px solid var(--rule); color: var(--ink-muted); }
/* A band across a table that divides it into two kinds of row.

   Not a second table, because the two halves share a column contract and a total, and
   two tables side by side would let their columns drift apart -- the reason repeated
   tables share a colgroup. Not a group label either: a group answers "which category",
   this answers "which of these can be budgeted and which can only be provisioned", and
   there are exactly two of them. Set like a heading rather than a value so it reads as
   the table talking about itself. */
tr.sep > td {
  background: var(--paper-alt); border-top: 2px solid var(--rule);
  /* Owner request 2026-08-24: down to badge size. The band is a label on a fold, not a
     heading, and at 11px uppercase with this tracking it outweighed the 10.5px table it
     sits inside -- the one row that is not data was the loudest thing in the table. */
  color: var(--ink-muted); font-size: 10px; letter-spacing: .08em;
  text-transform: uppercase; padding: 9px 10px;
}
/* Collapsed away by a control on the page. Kept out of the sort, which reads the rows
   it is given rather than the rows that are visible. */
tr.hid { display: none; }
tr.tot > td { border-top: 2px solid var(--ink); }

/* ------------------------------------------------- sortable and grouped tables */
/* The cell that holds a vertical label. It is as narrow as the rotated badge and
   the badge is centred in the block it labels. */
/* Relative positioning makes the block's cell the containing block for the label
   inside it, which is what lets the label be centred over the whole block without
   contributing any height of its own. */
/* The heading over a rotated column is rotated with it. Left upright it was the widest
   thing in a column fifteen pixels wide -- the word Group alone held the column open to
   sixty-three -- because a heading is real content and a label positioned out of flow is
   not. Turned on its side it asks for the height of one line and nothing more, and it
   reads in the same direction as the labels beneath it. */
th.rot { width: 46px; min-width: 46px; padding: 6px 16px; text-align: center; }
td.rot { position: relative; width: 46px; min-width: 46px; text-align: center; vertical-align: middle; padding: 6px 16px; }
/* Only the first row of a block shows the label. The cell still occupies its space
   on every row, so the column cannot change width as rows are sorted underneath it. */
/* A block's label is one cell spanning the block, not one cell per row with the
   badge hidden on all but the first -- that was the earlier attempt and it wasted the
   height it was meant to save, because a rotated label seven characters tall sat beside
   a run of nine rows. The rows under the leader carry no label cell at all, and the
   script re-cuts the spans after a sort. */
tr.rep > td.rot { display: none; }
/* The separator between blocks. A spacer row would be a row, and a row is something
   a sort has to know to leave alone; a rule on the first row of each block says the
   same thing and survives any reordering. */
table.grouped tbody tr:not(.rep):not(:first-child) > td { border-top: 2px solid var(--ink-muted); }

th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { color: var(--ink); }
/* Only a sorted column is marked. The neutral double arrow was on every heading at
   once, so the one glyph that carried information -- which column the table is actually
   ordered by -- had to be found among nine that carried none. Sortability is already
   said by the cursor and the hover; direction is the only thing worth a glyph. */
th.sortable::after { content: ""; }
th.sortable[data-dir="asc"]::after { content: " \\2191"; opacity: 1; font-size: 9px; }
th.sortable[data-dir="desc"]::after { content: " \\2193"; opacity: 1; font-size: 9px; }

/* Edit mode. The controls are absent from the document's flow until the mode is on,
   so a page nobody edits is the page as it was before any of this existed. */
.editable .edit-only { display: none; }
.editable.on .edit-only { display: revert; }
.editable.on td.edit-only { display: table-cell; }
.editable.on th.edit-only { display: table-cell; }
select.regroup {
  font-family: var(--font-mono); font-size: 10px; height: 17px;
  border: 1px solid var(--rule); border-radius: var(--radius-sm);
  background: var(--paper-card); color: var(--ink); max-width: 20ch;
}
textarea.patch {
  width: 100%; min-height: 120px; font-family: var(--font-mono); font-size: 10.5px;
  border: 1px solid var(--rule); border-radius: var(--radius-sm);
  background: var(--paper-card); color: var(--ink); padding: 8px;
}
button.mode {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: .04em;
  height: 21px; padding: 0 10px; cursor: pointer;
  border: 1px solid var(--rule); border-radius: var(--radius-sm);
  background: var(--paper-card); color: var(--ink-muted);
}
button.mode[aria-pressed="true"] { color: var(--ink); border-color: var(--ink); }

/* ------------------------------------------------------------- row inspector */
/* The panel behind a category figure. It is a modal because it answers a question
   about one row of one table and nothing else on the page is relevant while it is
   open; a drawer or an expanding row would push the table it explains off screen. */
dialog.rows {
  width: min(880px, calc(100vw - 32px)); max-height: 82vh; overflow: auto;
  padding: 18px 20px 16px; border: 2px solid var(--ink);
  border-radius: var(--radius); background: var(--paper-card); color: var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
}
dialog.rows::backdrop { background: rgba(20, 20, 20, .38); }
dialog.rows h4 { margin: 0 30px 4px 0; font-size: 13.5px; }
dialog.rows .sc { font-size: 10px; color: var(--ink-muted); margin: 0 0 10px; }
dialog.rows form.x { float: right; margin: -4px -6px 0 0; }
dialog.rows form.x button {
  border: 1px solid var(--rule); border-radius: var(--radius-sm); cursor: pointer;
  background: var(--paper-alt); color: var(--ink-muted); width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center;
}
/* The panel is the same table as the one behind it, so it is set at the same size.
   At 11.5px the inspector read as a different, larger document laid over the page --
   and the payee column, which carries the longest string in the row, is the one that
   made it look that way. It drops a further half-point: it is the only cell in the row
   that is prose rather than a figure. Owner ruling 2026-08-23. */
dialog.rows table { font-size: 9.5px; }
dialog.rows td.pay { font-size: 9px; color: var(--ink-muted); }
/* A removed row stays where it was, struck through rather than deleted. Deleting it
   would make the list shorter every time a decision is made and leave no way back to
   a row removed by mistake. */
dialog.rows tr.off > td { color: var(--ink-faint); text-decoration: line-through; }
dialog.rows tr.off > td:last-child { text-decoration: none; }
dialog.rows button.drop {
  font-family: var(--font-mono); font-size: 9.5px; height: 19px; padding: 0 8px;
  cursor: pointer; border: 1px solid var(--rule); border-radius: var(--radius-sm);
  background: var(--paper-alt); color: var(--ink-muted);
}
dialog.rows button.drop:hover { color: var(--ink); border-color: var(--ink); }
/* The row control is one glyph, so it is drawn as one glyph. A box around a 10px mark
   in the last column of a table made of numbers reads as another value; the affordance
   is the pointer and the hover, and the word is on the title. Owner ruling 2026-08-23. */
/* The pencil sits with the trash in the same cell: two verdicts on one row, "filed
   wrong" and "not mine", and they belong side by side rather than in two columns of
   which one is empty on every row. */
dialog.rows button.edit.bare {
  border-color: transparent; background: transparent; padding: 0 2px; height: auto;
  color: var(--ink-faint); line-height: 0; margin-inline-end: 2px;
}
dialog.rows button.edit.bare .ic { width: 11px; height: 11px; }
dialog.rows button.edit.bare:hover { color: var(--ink); border-color: transparent; }
/* The reassignment panel. Narrow on purpose: it holds one charge and two choices, and
   at the width of the row inspector it reads as a table with nothing in it. */
/* Overflow is visible on this one so the picker's panel can hang below its button.
   dialog.rows scrolls, which is right for the inspector's table of a few hundred rows
   and wrong here: the panel would be clipped at the dialog's edge or, worse, open a
   scrollbar and scroll the choice out from under the pointer. */
dialog.rows.move { max-width: 460px; overflow: visible; }
/* Two columns, not label-then-control down the side. It is one decision in two halves
   -- the group narrows the list, the category is the answer -- and side by side says
   that; four stacked rows read as a form. Owner ruling 2026-08-24. */
dialog.rows.move .movef {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px;
  align-items: start; margin: 10px 0 12px;
}
dialog.rows.move .pk { position: relative; }
dialog.rows.move .pk .pl {
  display: block; text-align: center; margin-bottom: 4px;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: .08em;
  text-transform: uppercase; color: var(--ink-muted);
}
/* The closed control. Set in the page's own mono at 11px -- one step above the option
   list, because the button says what was chosen and the list is only the choosing. */
dialog.rows.move .pkb {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; height: 24px; padding: 0 8px; cursor: pointer;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .02em;
  border: 1px solid var(--rule); border-radius: var(--radius-sm);
  background: var(--paper-card); color: var(--ink);
}
dialog.rows.move .pkb:hover, dialog.rows.move .pk.open .pkb { border-color: var(--ink); }
dialog.rows.move .pkb .pv { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
dialog.rows.move .pkb .ic { width: 9px; height: 9px; flex: none; color: var(--ink-faint); }
dialog.rows.move .pk.open .pkb .ic { transform: rotate(180deg); }
/* The open list. Bordered in ink with the page's own drop shadow, so it reads as a
   sheet lifted off the dialog rather than as a region of it. Capped in height at about
   nine options: the longest group has more categories than that and a panel taller
   than the dialog it hangs from would cover the charge it is being asked about. */
dialog.rows.move .pkl {
  display: none; position: absolute; z-index: 5; left: 0; right: 0; top: calc(100% + 3px);
  max-height: 216px; overflow-y: auto; padding: 2px;
  border: 1px solid var(--ink); border-radius: var(--radius-sm);
  background: var(--paper-card); box-shadow: 2px 2px 0 var(--ink);
}
dialog.rows.move .pk.open .pkl { display: block; }
dialog.rows.move .pkl button {
  display: block; width: 100%; text-align: center; cursor: pointer;
  font-family: var(--font-mono); font-size: 10.5px; line-height: 1.15;
  padding: 4px 6px; border: 0; border-radius: var(--radius-sm);
  background: transparent; color: var(--ink-muted);
}
dialog.rows.move .pkl button:hover { background: var(--paper-alt); color: var(--ink); }
dialog.rows.move .pkl button.on { background: var(--paper-alt); color: var(--ink); font-weight: 600; }
/* The action row sits bottom right. The panel is read top to bottom -- what the charge
   is, where it should go, the line to paste -- and the verdict belongs at the end of
   that reading, not back at the left margin where the labels start. Secondary first so
   the primary lands on the corner the pointer leaves the dialog from. */
dialog.rows.move .movea {
  display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end;
}
dialog.rows button.drop.bare {
  border-color: transparent; background: transparent; padding: 0 2px; height: auto;
  color: var(--ink-faint); line-height: 0;
}
dialog.rows button.drop.bare .ic { width: 11px; height: 11px; }
dialog.rows button.drop.bare:hover { color: var(--ink); border-color: transparent; }
/* Brand or seller, cut to ten and shouted. Monospaced so the truncation lands in the
   same place down the column, and dimmed because it is the least of the four things
   the row says. The full string is the title, which is the hover and the long-press. */
dialog.rows td.acct {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.03em;
  color: var(--ink-muted); cursor: help;
}
dialog.rows textarea {
  width: 100%; min-height: 54px; font-family: var(--font-mono); font-size: 10px;
  border: 1px solid var(--rule); border-radius: var(--radius-sm);
  background: var(--paper-alt); color: var(--ink); padding: 8px;
}
/* The cell that opens it. A pointer and a hint of the group colour on hover, so the
   affordance is discoverable without decorating every category cell permanently. */
td.pop { cursor: pointer; }
/* The row is the target, so the row shows the cursor. The single-cell rule stays for
   the case the script has not run; the hover tint is the table's own, already set on
   tbody tr:hover, so nothing is added here that would double it. */
tr.clickable { cursor: pointer; }



/* The one-file download. A link that hands over 9 MB should look like a control, not
   like body-text prose, so it is boxed and given the archive glyph.
   Named zip, not dl: .dl was also a text class inside the Ethereum diagram's inline
   SVG <style>, which is document-global, and its italic font shorthand set a
   font-style this rule never declares - so the control rendered italic. */
a.zip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 14px; border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-card); color: var(--ink); text-decoration: none;
  font-size: 12px;
}
a.zip:hover { border-color: var(--accent); color: var(--accent); }

caption .fig { left: 10px; top: 10px; }
figure figcaption .fig, .therm + figcaption .fig { left: 0; top: 9px; }

/* Semantic colours. A rating scale: how a row stands, not what it is. */
.badge.long { background: var(--pastel-aqua); border-color: var(--stroke-aqua); color: var(--stroke-aqua); }
.badge.short { background: var(--pastel-peach); border-color: var(--stroke-peach); color: var(--stroke-peach); }
.badge.ok { background: var(--pastel-green); border-color: var(--stroke-green); color: var(--stroke-green); }
.badge.warn { background: var(--pastel-amber); border-color: var(--stroke-amber); color: var(--stroke-amber); }
.badge.crit { background: var(--pastel-coral); border-color: var(--stroke-coral); color: var(--stroke-coral); }
.badge.idle { background: var(--pastel-indigo); border-color: var(--stroke-indigo); color: var(--stroke-indigo); }
/* Platform badges. A venue is a fact about a row, not a rating, so these carry the
   protocol's own hue at low saturation instead of the red/amber/green scale. */
.badge.cow { background: var(--pastel-lilac); border-color: var(--stroke-lilac); color: var(--stroke-lilac); }
.badge.kiln { background: var(--pastel-teal); border-color: var(--stroke-teal); color: var(--stroke-teal); }
.badge.safe { background: var(--pastel-mint); border-color: var(--stroke-mint); color: var(--stroke-mint); }
.badge.cb { background: var(--pastel-cyan); border-color: var(--stroke-cyan); color: var(--stroke-cyan); }
.badge.lido { background: var(--pastel-orchid); border-color: var(--stroke-orchid); color: var(--stroke-orchid); }

/* Identity colours. An account number and a ticker are labels, not ratings, so
   each is given one pastel and keeps it on every table of every page. The
   assignment is made once in the page module and passed down; nothing picks a
   colour from a hex at the call site. */
/* An account cell is a badge plus a name and must not wrap between them. */
td.nw, th.nw { white-space: nowrap; }

.badge.p1  { background: var(--pastel-aqua);    border-color: var(--stroke-aqua);    color: var(--stroke-aqua); }
.badge.p2  { background: var(--pastel-vanilla); border-color: var(--stroke-vanilla); color: var(--stroke-vanilla); }
.badge.p3  { background: var(--pastel-mint);    border-color: var(--stroke-mint);    color: var(--stroke-mint); }
.badge.p4  { background: var(--pastel-peach);   border-color: var(--stroke-peach);   color: var(--stroke-peach); }
.badge.p5  { background: var(--pastel-lilac);   border-color: var(--stroke-lilac);   color: var(--stroke-lilac); }
.badge.p6  { background: var(--pastel-blush);   border-color: var(--stroke-blush);   color: var(--stroke-blush); }
.badge.p7  { background: var(--pastel-lime);    border-color: var(--stroke-lime);    color: var(--stroke-lime); }
.badge.p8  { background: var(--pastel-orchid);  border-color: var(--stroke-orchid);  color: var(--stroke-orchid); }
.badge.p9  { background: var(--pastel-teal);    border-color: var(--stroke-teal);    color: var(--stroke-teal); }
.badge.p10 { background: var(--pastel-rose);    border-color: var(--stroke-rose);    color: var(--stroke-rose); }
.badge.p11 { background: var(--pastel-cyan);    border-color: var(--stroke-cyan);    color: var(--stroke-cyan); }
.badge.p12 { background: var(--pastel-indigo);  border-color: var(--stroke-indigo);  color: var(--stroke-indigo); }
/* No box, tone kept. Declared after the pastels on purpose: .badge.gi above tries to
   drop the fill and the border, and every .badge.pN is written at the same specificity
   further down the sheet, so the pill comes back. This modifier is the one that wins,
   and it leaves the group's colour on the glyph where the pill used to be. Used on the
   subtotal rows, where the mark stands alone and a pill around it would read as a
   value in a row made of values. */
.badge.bare { background: transparent; border-color: transparent; padding: 0; }
/* Colour without fill. A payee sitting under its category is the same colour as the
   category and must not compete with it, so it keeps the border and the text and gives
   up the background. Down here for the same reason .badge.bare is: every .badge.pN is
   written at this specificity further up, so a modifier declared above them loses and
   the pill keeps its tint. Owner ruling 2026-08-23: the Table 1 badge is white-filled,
   which is what this rule was always meant to say. */
.badge.hollow { background: var(--paper-card); }
/* Ink on paper, for a column that is a label rather than a value -- a month name
   carries no status and should not borrow a status colour to say so. Same cascade
   trap, same fix. */
.badge.mono { background: var(--paper-card); border-color: var(--ink); color: var(--ink); }
/* The same bare mark, but with a label beside it instead of alone in a cell. The
   width classes exist to line pills up in a column; a glyph that is a prefix to text
   has nothing to line up with, and 3ch of reserved box read as a gap between the mark
   and the word it belongs to. Owner ruling 2026-08-23: a floating glyph, not a square. */
.badge.gi.bare.inl {
  width: auto; height: auto; min-width: 0; margin-inline-end: 6px; vertical-align: -1px;
}
.badge.gi.bare.inl .ic { width: 11px; height: 11px; }
.badge .ic { width: 9px; height: 9px; }
.badges { display: flex; flex-wrap: wrap; gap: 6px; }

/* ---------------------------------------------------------------- tables */
.scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%;
  border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-card); margin: 0 0 20px; }
.scroll + .scroll { margin-top: 20px; }
/* The scroll affordance. The wrapper exists only to hold the chevron still while the
   table slides under it - a pseudo-element on the scroller itself would scroll away
   with the content. Hidden unless there is more table to the right. */
.scroll-wrap { position: relative; }
.scroll-hint {
  position: absolute; right: -11px; top: 50%; transform: translateY(-50%);
  z-index: 4; display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--paper-card); border: 1px solid var(--rule);
  box-shadow: 0 2px 8px rgba(0,0,0,.14);
  opacity: 0; transition: opacity .15s ease; pointer-events: none;
}
.scroll-wrap.more .scroll-hint { opacity: 1; }
.scroll-hint svg { width: 9px; height: 9px; fill: var(--ink-muted); transform: rotate(-90deg); }
/* Cells are set about a point and a half smaller than body copy. These tables are
   dense by nature and the smaller face lets a full year of columns land inside the
   locked width before the horizontal scroll has to take over. */
table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 10.5px; font-variant-numeric: tabular-nums; }
/* Captions sit under the table they describe. A caption above reads as a heading
   for whatever follows it; below, it reads as a note about what was just shown,
   which is what a figure number and a source line actually are. */
/* Captions sit at the same 8pt as the tables and charts they describe. They were a
   half-step smaller, which made the page carry two sizes of small text for no reason
   the reader could see. Colour, not size, is what separates a caption from a cell. */
/* Two columns, not one run of text: the number is a printed mark and the sentence is
   prose about the plate. Set inline, the second line of a long caption wrapped back
   under the badge and the caption lost its left edge. */
caption {
  caption-side: bottom; text-align: left; padding: 9px 12px 11px 86px;
  position: relative;
  font-size: 9.5px; color: var(--ink-muted); border-top: 1px solid var(--rule-hair);
}
/* "Table 4" and "Fig. B" are labels, not prose, so they get the page's square badge
   in plain black-on-white - no accent colour, because the number identifies the plate
   and should not compete with the palette used to mean gain, loss or status. It
   inverts in dark mode so it stays a badge rather than becoming a hole. */
/* The figure and table numbers are printed marks, not interface chrome: white fill,
   black rule, black text, the same in every theme. Tying them to --paper/--ink made
   them flip to a solid black chip in dark mode, which is the one thing they must not
   be. Fixed hexes, deliberately, so the mark survives the theme. */
caption .fig, figure figcaption .fig, .therm + figcaption .fig {
  /* A floor, not a ceiling: "FIG. A" sets the common width so the badges line up, and
     the two-digit table numbers grow past it rather than spilling their last character
     outside the border. The captions reserve a gutter wide enough for the longest. */
  position: absolute; box-sizing: border-box; min-width: 62px; text-align: center;
  white-space: nowrap; padding: 1.5px 7px;
  border-radius: var(--radius-sm);
  background: #fff; color: #16161a; border: 1px solid #16161a;
  font-family: var(--font-mono); font-size: 9px; font-weight: 600;
  letter-spacing: .07em; text-transform: uppercase;
}
/* A caption long enough to be a paragraph is set smaller than one that is a line.
   Captions are all 9.5px because they carry the same weight of information, and that
   holds while a caption is a sentence. The obligations table needs four -- what the
   figures are, how they were annualised, what the two bands mean, and why one column
   is empty -- and at the common size that block competes with the table it describes.
   Dropped a step, it reads as the footnote it is. 8.5px is the floor for this: the
   caption is still prose a reader has to get through, not a label to be glanced at. */
table.longcap caption { font-size: 8.5px; line-height: 1.55; }

/* The shops inside a category, under the inspector's count-and-range line.
   Set as a wrapping run of small units rather than a list, because the useful reading is
   comparative -- which shop is most of this number -- and a column of forty rows buries
   that above the fold. Name, count, total; the count is the dim one because it is the
   least interesting of the three. */
.stores { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 9px; }
.stores .st {
  display: inline-flex; align-items: baseline; gap: 6px;
  border: 1px solid var(--rule-hair); border-radius: var(--radius-sm);
  padding: 2px 7px; font-size: 9px; line-height: 1.4; color: var(--ink-muted);
}
.stores .st i { font-style: normal; opacity: .55; font-family: var(--font-mono); }
.stores .st b { font-weight: 600; font-family: var(--font-mono); color: var(--ink); }
th {
  text-align: left; padding: 9px 11px 7px; font-size: inherit; font-weight: 500;
  letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft);
  border-bottom: 1px solid var(--rule); white-space: nowrap;
  background: var(--paper-card); position: sticky; top: 0; z-index: 2;
}
td {
  padding: 6.5px 11px; border-bottom: 1px solid var(--rule-hair);
  white-space: nowrap; font-family: var(--font-mono); color: var(--ink-muted);
}
/* Everything in a row is set at the row's size. A badge carries its own 10px
   everywhere else on the page, which inside a 10.5px cell left the item text sitting
   visibly larger than the label beside it - two sizes of small type in one line. The
   ch-based widths scale with it, so the fixed-width columns stay uniform. */
td, td .dt, td .addr, td .mono, td .num, td .badge, th .badge, tfoot td { font-size: inherit; }
td:first-child { font-family: var(--font-sans); color: var(--ink); }
tbody tr:last-child td { border-bottom: 0; }
/* A table whose cells are sentences rather than figures. Monospace reads a size
   smaller than sans at the same px, so a table with prose in both columns sets both
   in sans - otherwise the two columns look like two different type sizes - and lets
   the long column wrap instead of forcing the table wider than the page. */
table.prose td { font-family: var(--font-sans); white-space: normal; }
table.prose td:first-child { white-space: nowrap; vertical-align: top; }
/* The issues register names each finding in a phrase rather than a word, and it is the
   only column in that table carrying a sentence. A step down in size keeps it on one
   line beside the badge and the amount instead of wrapping the row taller. */
td.item, th.item { font-size: 9.5px; }
/* Legend under the basis-by-account chart. One swatch per vintage. */
.keyrow { display: flex; flex-wrap: wrap; gap: 10px; margin: 6px 0 2px; }
.keyrow .ki { display: inline-flex; align-items: center; gap: 5px; font-size: 9.5px; color: var(--ink-muted); }
.keyrow .badge.keysw { padding: 0; }

/* Etherscan links under an issue's item text. One per address a reviewer must open. */
.addrs { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px; }
a.addr {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 1px 5px; border: 1px solid var(--rule); border-radius: 3px;
  font-size: 8.5px; line-height: 1.5; color: var(--ink-muted); text-decoration: none;
}
a.addr:hover { border-color: var(--ink-soft); color: var(--ink); }
a.addr .hex { font-family: var(--font-mono); font-size: 8px; color: var(--ink-soft); }
/* A table that is entirely explanation carries no figures to line up against the rest
   of the page, so it is set at the caption size instead of the table size. Both columns
   move together: the label and the sentence it introduces are one piece of writing. */
table.note td, table.note th { font-size: 9.5px; }
/* Sans loses the monospace grid, so the money columns of a prose table take tabular
   figures instead: same one type size across every column, still a straight decimal. */
table.prose td.r { font-variant-numeric: tabular-nums; }

tbody tr:hover { background: var(--paper-alt); }
tfoot td { border-top: 1px solid var(--rule); font-weight: 650; color: var(--ink); }
td.r, th.r { text-align: right; }
/* A figure that belongs to the sentence on its left. The default gutter is sized for
   two independent columns; here it pushed the amount away from the thing it is the
   amount of, across empty space wide enough to lose the association. */
td.tight, th.tight { padding-left: 2px; }
td.tight + td, th.tight + th { padding-left: 13px; }
td.c, th.c { text-align: center; }
/* A column whose whole content is one mark. The glyph is the affordance; a word next
   to it only repeated what the pointer already says. */
td.c .tip > label { border-bottom: 0; }
td.c .ic { width: 12px; height: 12px; vertical-align: -2px; color: var(--accent); }
/* Sign colour is a property of the number, not of the element holding it, so the
   classes are bare: a gain is green in a table cell, in a stat tile and in a
   sentence alike. */
.pos, td.pos { color: var(--stroke-green); }
.neg, td.neg { color: var(--stroke-coral); }
.tile .v.pos { color: var(--stroke-green); }
.tile .v.neg { color: var(--stroke-coral); }
.mono { font-family: var(--font-mono); }
.dim { color: var(--ink-soft); }
.addr { font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-soft); }

/* ---------------------------------------------------------------- figures */
/* The bar and its legend are one figure. The 18px below the bar is the whole
   point of the gap: at 6px the legend read as a caption strip welded to the
   chart, and the two are different kinds of thing. The legend is right-aligned
   so it terminates on the same edge as the bar rather than floating loose
   under its left end. */
figure { margin: 0 0 18px; }
figure .bar { margin-bottom: 18px; }
/* The figure number is positioned out of the caption's flow, so a caption short enough
   to sit on one line is shorter than the badge beside it. Under Fig. B the figure is a
   horizontal-scroll container, and overflow-x on it clips vertically too, which cut the
   bottom off the badge; the caption reserves the badge's full height so it cannot
   overhang, and the diagram ends clear of the "Example one" heading below it. */
figure figcaption, .therm + figcaption {
  padding-left: 76px; position: relative;
  margin-top: 10px; padding-top: 8px; padding-bottom: 2px;
  min-height: 26px; box-sizing: content-box;
  border-top: 1px solid var(--rule-hair);
  font-size: 9.5px; color: var(--ink-muted); line-height: 1.55;
}
figure + h3 { margin-top: 22px; }
/* The bar does not clip: a slice's hover panel has to be able to rise out of it.
   The rounded ends therefore live on the end slices rather than on the container. */
.bar { display: flex; width: 100%; height: 46px; border: 1px solid var(--rule); border-radius: var(--radius); overflow: visible; }
.seg { position: relative; display: flex; align-items: center; justify-content: center; min-width: 0; }
.seg:first-child { border-radius: var(--radius) 0 0 var(--radius); }
.seg:last-child { border-radius: 0 var(--radius) var(--radius) 0; }
.seg .cap {
  font-family: var(--font-mono); font-size: 9.5px; color: var(--ink); opacity: .82;
  white-space: nowrap; padding: 0 3px; max-width: 100%; overflow: hidden;
  display: flex; align-items: center; gap: 3px;
}
.seg .cap .ic { width: 10px; height: 10px; flex: none; opacity: .95; }
/* A slice too narrow for figures keeps the mark, and keeps the side air a captioned
   slice gets -- a mark pressed against both edges reads as a rendering fault. Slices
   that cannot afford the air are dropped upstream by GLYPH_MIN in charts.ts. */
.seg .cap.gonly { padding: 0 3px; gap: 0; }
.legend .ic { width: 10px; height: 10px; flex: none; }
/* Hover detail for a slice. On its own paper rather than in the browser's native
   title chrome, so it can hold four lines of figures and stay legible in dark mode. */
.seg-tip {
  position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%);
  z-index: 6; min-width: 200px; max-width: 300px; padding: 9px 11px 10px;
  background: var(--tip-paper); color: var(--ink); border: 1px solid var(--rule);
  border-radius: var(--radius); box-shadow: 0 6px 22px rgba(0,0,0,.13);
  font-size: 11px; line-height: 1.5; text-align: left; white-space: normal;
  opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .12s ease;
}
.seg-tip.rt { left: auto; right: 0; transform: none; }
.seg-tip .t {
  display: block; font-family: var(--font-mono); font-size: 9.5px; letter-spacing: .06em;
  text-transform: uppercase; color: var(--ink-soft); margin-bottom: 5px;
}
.seg:hover .seg-tip, .seg:focus-within .seg-tip, .seg.open .seg-tip { opacity: 1; visibility: visible; }
/* Which wallets a figure covers. Stated on every chart because "ETH" on this page
   can mean one wallet, four wallets, or the asset itself, and the difference decides
   whether a reader can act on the line. */
figure figcaption .scope {
  display: block; margin-top: 5px; font-family: var(--font-mono); font-size: 10.5px;
  line-height: 1.5; color: var(--ink-soft);
}
.legend { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px 14px; }
.legend > span { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-muted); }
.sw { width: 9px; height: 9px; border-radius: 2px; border: 1px solid var(--rule); display: inline-block; flex: none; }

/* ------------------------------------------------------- compact dates */
/* Rows carry the short form; the full date, the ISO string and any per-row detail
   arrive on hover, so a date column never sets the width of the table. */
.dt { position: relative; font-family: var(--font-mono); font-size: 10.5px; white-space: nowrap; border-bottom: 1px dotted var(--rule); cursor: help; }
.dt-full {
  position: absolute; left: 0; bottom: calc(100% + 6px); z-index: 7;
  min-width: 190px; max-width: 280px; padding: 8px 10px 9px;
  background: var(--tip-paper); color: var(--ink); border: 1px solid var(--rule);
  border-radius: var(--radius); box-shadow: 0 6px 22px rgba(0,0,0,.13);
  font-family: var(--font-sans); font-size: 11px; line-height: 1.5; white-space: normal;
  opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .12s ease;
}
.dt-full .iso, .dt-full .x { display: block; margin-top: 3px; font-family: var(--font-mono); font-size: 10px; color: var(--ink-soft); }
.dt:hover .dt-full, .dt:focus-within .dt-full, .dt.open .dt-full { opacity: 1; visibility: visible; }

/* ---------------------------------------------------------------- meters */
.therm { height: 8px; background: var(--paper-alt); border: 1px solid var(--rule); border-radius: var(--radius-sm); overflow: hidden; margin: 6px 0 4px; }
.therm > span { display: block; height: 100%; }

/* --------------------------------------------------------------- callouts */
/* One tinted box per severity, bordered all the way round in its own colour. The
   earlier version carried a coloured rail down the left edge only; with a dozen of
   them down the page that rail read as a margin rule and the tint did the work
   anyway, so the rail is gone and the border carries the signal. */
.note {
  border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--rule));
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--accent) 6%, var(--paper-card));
  padding: 13px 16px; margin: 0 0 18px;
}
.note .hd .ic { width: 13px; height: 13px; margin-right: 6px; vertical-align: -2px; }
.note.caution {
  border-color: color-mix(in srgb, var(--stroke-amber) 55%, var(--rule));
  background: color-mix(in srgb, var(--stroke-amber) 8%, var(--paper-card));
}
.note.crit {
  border-color: color-mix(in srgb, var(--stroke-coral) 55%, var(--rule));
  background: color-mix(in srgb, var(--stroke-coral) 8%, var(--paper-card));
}
.note.good {
  border-color: color-mix(in srgb, var(--stroke-mint) 55%, var(--rule));
  background: color-mix(in srgb, var(--stroke-mint) 8%, var(--paper-card));
}
.note p:last-child { margin-bottom: 0; }
/* The caution title sat directly on its first paragraph and read as the paragraph's
   opening line. A rule and real space below it make it a heading again. */
.note .hd {
  font-weight: 650; font-size: 12.5px;
  margin-bottom: 10px; padding-bottom: 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 14%, transparent);
}

ul.plain { margin: 0 0 12px; padding-left: 18px; }
ul.plain li { margin-bottom: 5px; }

/* ---------------------------------------------------------------- popovers */
/* Checkbox-driven so the detail survives a tap on a phone and a print to PDF
   without any script. */
.tip { position: relative; display: inline; }
.tip input { position: absolute; opacity: 0; pointer-events: none; }
.tip > label {
  cursor: help; border-bottom: 1px dotted var(--ink-soft); color: inherit;
}
.tip > label:hover { border-bottom-color: var(--accent); color: var(--accent); }
.tip .body {
  display: none; position: absolute; z-index: 20; left: 0; top: 1.7em; width: 320px;
  background: var(--tip-paper); border: 1px solid var(--rule); border-radius: var(--radius);
  box-shadow: 0 6px 18px rgba(0,0,0,.12);
  padding: 10px 12px; font-family: var(--font-sans); font-size: 11px;
  line-height: 1.5; color: var(--ink-muted); white-space: normal; text-transform: none;
  letter-spacing: 0; font-weight: 400;
}
.tip.rt .body { left: auto; right: 0; }
.tip input:checked ~ .body { display: block; }
/* A dotted underline promises a pointer, so the panel opens on hover as well as on the
   click the checkbox drives. The script still pins an opened panel out of a scrolling
   table; this rule only decides whether it is shown, so the two cannot fight. */
.tip:hover .body, .tip:focus-within .body { display: block; }

/* ------------------------------------------------------------------- icons */
/* Font Awesome Pro Thin, inlined as SVG. Sized in em so a glyph always matches the
   text it sits beside, and filled with currentColor so it inherits state colours. */
.ic { width: 1em; height: 1em; vertical-align: -.12em; flex: none; }

/* --------------------------------------------------------------------- nav */
/* The rail became a dropdown. Twelve section links across the top left no room for
   the title on a laptop and scrolled sideways on a phone; as a menu the same twelve
   sit in one panel at every width, so there is no separate mobile navigation to keep
   in step with the desktop one. The gear beside it holds the theme. */
.nav {
  position: sticky; top: 0; z-index: 30; margin: 0 -24px 16px; padding: 0 24px;
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: saturate(1.4) blur(8px);
  border-bottom: 1px solid var(--rule);
}
.nav-in { display: flex; align-items: center; gap: 8px; max-width: 1180px; margin: 0 auto; min-height: 42px; }
.nav .brand {
  font-weight: 650; color: var(--ink); font-size: 12.5px; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px;
}
.nav .brand .ic { color: #e3b23c; width: 1.15em; height: 1.15em; }

.menu { position: relative; }
.menu > summary {
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
  padding: 5px 10px; border: 1px solid var(--rule); border-radius: var(--radius-sm);
  background: var(--paper-card); font-family: var(--font-mono); font-size: 10px;
  letter-spacing: .05em; text-transform: uppercase; color: var(--ink-muted);
  white-space: nowrap; list-style: none;
}
.menu > summary::-webkit-details-marker { display: none; }
.menu > summary:hover { color: var(--accent); border-color: var(--accent); }
.menu[open] > summary { color: var(--accent); border-color: var(--accent); background: var(--paper-alt); }
.menu .panel {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 40; min-width: 254px;
  max-height: min(72vh, 640px); overflow-y: auto;
  border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-card); padding: 5px; box-shadow: 0 8px 26px rgba(0,0,0,.13);
}
.menu .panel.right { left: auto; right: 0; min-width: 210px; }
.menu .panel a, .menu .panel button {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  padding: 7px 9px; border: 0; border-radius: var(--radius-sm); background: none;
  font-family: inherit; font-size: 12px; color: var(--ink-muted);
  text-decoration: none; cursor: pointer;
}
.menu .panel a:hover, .menu .panel button:hover { background: var(--paper-alt); color: var(--accent); }
.menu .panel a .n {
  font-family: var(--font-mono); font-size: 9.5px; color: var(--ink-soft);
  min-width: 15px; text-align: right;
}
.menu .panel .grp {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: .08em;
  text-transform: uppercase; color: var(--ink-soft); padding: 8px 9px 4px;
}
/* The panel is a map of the site, so it has two levels. A page row is set in the page's
   own weight and keeps a rule under it; its sections are indented under it and set a
   step smaller. The page you are on is marked rather than hidden - a map that omits
   where you are standing is the thing that made the old menu confusing. */
.menu .panel a.pg {
  font-weight: 650; color: var(--ink); font-size: 12px;
  padding: 8px 9px 7px; margin-top: 4px; border-bottom: 1px solid var(--rule-hair);
}
.menu .panel a.pg:first-child { margin-top: 0; }
.menu .panel a.pg.on { color: var(--accent); background: var(--paper-alt); }
.menu .panel a.pg.on::after { content: "\\2713"; margin-left: auto; font-size: 10px; }
.menu .panel a.sub { padding-left: 22px; font-size: 11.5px; }
.menu .panel button[aria-pressed="true"] { color: var(--accent); font-weight: 600; }
.menu .panel button[aria-pressed="true"]::after { content: "\\2713"; margin-left: auto; }
.nav .spacer { margin-left: auto; }
.nav .out {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px;
  border-radius: var(--radius-sm); font-size: 11px; color: var(--ink-muted);
  text-decoration: none; white-space: nowrap;
}
.nav .out:hover { background: var(--paper-alt); color: var(--accent); }
@media (max-width: 620px) { .nav .out span { display: none; } .nav-in { gap: 5px; } }

/* -------------------------------------------------------------- sparklines */
/* Deliberately axis-free. These answer "which way and how sharply", and the four
   readings printed underneath answer "how much" - a pair of axes at this size would
   cost more room than they return. */
.spark { display: block; width: 100%; height: auto; }
.sparkfig { border: 1px solid var(--rule); border-radius: var(--radius); background: var(--paper-card); padding: 12px 14px 0; margin: 0 0 18px; }
.sparkfig .spark { height: 92px; }
.sparkstats { display: flex; flex-wrap: wrap; gap: 6px 26px; padding: 12px 0 0; }
.sparkstats > span { display: flex; flex-direction: column; gap: 1px; }
.sparkstats .k { font-size: 9px; letter-spacing: .07em; text-transform: uppercase; color: var(--ink-soft); }
.sparkstats .v { font-family: var(--font-mono); font-size: 13px; font-weight: 650; color: var(--ink); }
.sparkstats .d { font-family: var(--font-mono); font-size: 9.5px; color: var(--ink-soft); }
.sparkfig figcaption { margin-top: 12px; }
.sparkfig { touch-action: pan-y; }

/* The rooms-and-jars diagram. It is a fixed drawing rather than a chart, so it keeps
   its aspect ratio and scrolls sideways on a narrow screen instead of squashing -
   squashed, the jars stop reading as jars and the whole point of it is lost. */
.diagram { display: block; width: 100%; min-width: 900px; height: auto; }
/* The design spec's figure is a miniature drawn at the size the page renders it, so a
   chart badge in it is the same size as a real badge in the table beside it. The shared
   rule above stretches any chart to at least 900px, which magnified this one by 1.4x or
   more and left its labels reading larger than the badges they were there to explain.
   It scrolls inside its figure below 640px rather than shrinking under the 9px floor. */
.diagram.ux { width: 640px; min-width: 640px; }
figure:has(.diagram) { overflow-x: auto; }

/* Links inside a band header sit in the header's own muted type, not the link blue -
   a folder link is a control, not a citation. */
.band-hd .ct a { color: inherit; text-decoration: none; border-bottom: 1px solid var(--rule); }
.band-hd .ct a:hover { color: var(--accent); border-bottom-color: var(--accent); }
.band-hd .ct .ic { width: 10px; height: 10px; margin-right: 3px; }

/* An in-cell sparkline: same primitive, table height. */
td .spark { width: 96px; height: 20px; }

/* ---------------------------------------------------------------- receipts */
/* A row that settled in several transactions links to the transactions. Same
   checkbox device as the popovers, sized as a centred sheet because the payload is
   a table and a 320px popover cannot hold one. No script, works on a phone. */
.rcpt { position: relative; display: inline-block; }
.rcpt > input { position: absolute; opacity: 0; pointer-events: none; }
.rcpt > label { cursor: pointer; }
.rcpt > label.tx { color: var(--accent); border-bottom: 1px dotted var(--accent); }
/* A badge-faced control keeps the badge geometry and gains only the affordance:
   the underline would add a pixel to one row of a fixed-height column. */
.rcpt > label.bdg .badge { cursor: pointer; }
.rcpt > label.bdg:hover .badge { border-color: var(--accent); color: var(--accent); }
.rcpt .sheet {
  display: none; position: fixed; inset: 0; z-index: 60;
  background: rgba(12,20,24,.34); padding: 4vh 3vw; overflow: auto;
}
.rcpt > input:checked ~ .sheet { display: block; }
.rcpt .sheet-in {
  display: block; width: max-content; min-width: min(560px, 94vw);
  max-width: min(1320px, 94vw); margin: 0 auto; background: var(--paper-card);
  border: 1px solid var(--rule); border-radius: var(--radius);
  box-shadow: 0 18px 48px rgba(0,0,0,.28); overflow: hidden;
}
.rcpt .sheet-hd {
  display: flex; align-items: baseline; gap: 10px; padding: 11px 14px;
  border-bottom: 1px solid var(--rule); background: var(--paper-alt);
}
.rcpt .sheet-hd .nm { font-size: 12.5px; font-weight: 650; }
.rcpt .sheet-hd .cl { margin-left: auto; font-family: var(--font-mono); font-size: 10px; color: var(--ink-soft); cursor: pointer; }
.rcpt .sheet table { font-size: 10.5px; }
.rcpt .sheet-in > .scroll { max-height: 76vh; overflow: auto; margin: 0; }
/* The scrim closes the sheet: the whole backdrop is the label, and the card above it
   stops the click from reaching it. */
.rcpt .scrim { position: fixed; inset: 0; z-index: -1; cursor: default; }


/* ------------------------------------------------------------------- footer */
/* One paragraph, page width, at the smallest size on the page. It is provenance,
   not reading matter: it should be findable and never compete with a figure. The
   face is the body sans - the monospace it used made a colophon look like output. */
footer {
  margin-top: 44px; padding-top: 12px; border-top: 1px solid var(--rule);
  font-family: var(--font-sans); font-size: 8pt; line-height: 1.6; color: var(--ink-soft);
}
footer p { margin: 0; max-width: none; }
footer strong { color: var(--ink-muted); }

/* ------------------------------------------------- tooltip inner layout */
/* Every hover panel on the page uses the same two-column block, so a reader who
   has learned to read one has learned to read all of them: label left in small
   caps, figure right in tabular monospace, one row per fact. */
.kv { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px; margin: 0; }
.kv dt {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: .06em;
  text-transform: uppercase; color: var(--ink-soft); white-space: nowrap;
}
.kv dd {
  margin: 0; text-align: right; font-family: var(--font-mono); font-size: 10.5px;
  color: var(--ink); font-variant-numeric: tabular-nums;
}
.kv dd.w { text-align: left; font-family: var(--font-sans); font-size: 11px; color: var(--ink-muted); }
.kv dd.pos { color: var(--stroke-green); }
.kv dd.neg { color: var(--stroke-coral); }
.kv dt.sub, .kv dd.sub { font-size: 9px; color: var(--ink-soft); padding-bottom: 3px; }
.kv dd.sub { font-family: var(--font-sans); }
/* Every panel of a given kind is one width, so moving between slices of a bar does
   not make the panel jump about under the pointer. */
.dt-full { width: 268px; min-width: 0; max-width: none; }
/* An Ethereum address is 42 characters of monospace with nothing to break on, so at
   320px it ran past the panel's edge and was clipped. The panels that can carry one -
   the address column's and the venue bar's, where the Safe's address is the last line -
   are sized to hold it on a single line, and anything else long is allowed to break
   rather than overflow. */
.tip .body, .seg-tip { width: 396px; min-width: 0; max-width: none; }
.tip .body .mono, .seg-tip .mono { overflow-wrap: anywhere; }

/* --------------------------------------------------------- chart crosshair */
/* The readout above a wide sparkline. A native SVG <title> needed a second of
   hover, arrived in the browser's own chrome, and could hold one line; this is
   the same paper as every other panel and updates as the pointer moves. */
.sparkfig { position: relative; }
.xhair { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .1s ease; }
.xhair .rule { position: absolute; width: 1px; background: var(--rule); }
/* Centred in CSS rather than by the script that positions it: the size lives here, so the
   half-width that centres it has to live here too. It used to be a literal 2.5 in
   render.ts, which is exactly the kind of number that goes stale the first time this rule
   changes and nobody notices. */
.xhair .dot {
  position: absolute; width: 5px; height: 5px; border-radius: 50%;
  transform: translate(-50%, -50%);
}
.sparkfig.live .xhair { opacity: 1; }
.readout {
  position: absolute; z-index: 8; top: 8px; left: 0; width: 178px; padding: 7px 9px 8px;
  background: var(--tip-paper); border: 1px solid var(--rule); border-radius: var(--radius);
  box-shadow: 0 6px 22px rgba(0,0,0,.13); pointer-events: none;
  opacity: 0; transition: opacity .1s ease;
}
.sparkfig.live .readout { opacity: 1; }
.readout .d {
  display: block; font-family: var(--font-mono); font-size: 9px; letter-spacing: .06em;
  text-transform: uppercase; color: var(--ink-soft); margin-bottom: 4px;
}

/* ------------------------------------------------------- small multiples */
/* One line per wallet rather than one line for the sum. The sum hid the thing the
   page is about: the Safe holds a flat thousand ETH while the working wallets move
   every month, and averaged together those two behaviours cancel. */
.multi { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
.multi .cell {
  border: 1px solid var(--rule); border-radius: var(--radius);
  background: var(--paper-card); padding: 10px 12px 11px; position: relative;
}
.multi .cell .hd { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
.multi .cell .hd .nm { font-family: var(--font-mono); font-size: 10.5px; color: var(--ink); }
.multi .cell .hd .rg { margin-left: auto; font-family: var(--font-mono); font-size: 9.5px; color: var(--ink-soft); }
.multi .cell .spark { height: 46px; width: 100%; }
.multi .cell .readout { width: 150px; top: 4px; }
.multi .cell .readout .kv dd { font-size: 10px; }

/* Below 720px the page is a single centred channel with a fixed gutter either
   side, and nothing is allowed to widen it. Anything genuinely wider than the
   phone - a table, the rooms diagram - scrolls inside its own plate, so the body
   itself never slides horizontally under a thumb. Panels are capped to the
   viewport minus the gutters so a tooltip cannot hang off the edge. */
@media (max-width: 720px) {
  main { width: 100%; max-width: 100%; margin: 0 auto; padding: 16px 14px 60px; overflow-x: clip; }
  /* One rule for every block the sections put on the page, so a block added later
     cannot reintroduce the sideways drag by being wider than the column it sits in.
     Direct children only - a table inside a .scroll plate is meant to exceed the
     measure, and that is what its plate is there to absorb. */
  main > * { max-width: 100%; }
  h1 { white-space: normal; }
  p, .lede, li { max-width: 100%; }
  figure, .therm, .bands, .tiles { max-width: 100%; }
  img, svg { max-width: 100%; }
  .scroll { max-width: 100%; }
  .diagram-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
  .tip .body, .dt-full, .seg-tip { width: auto; max-width: calc(100vw - 28px); min-width: 200px; }
  .readout { max-width: calc(100vw - 40px); }
  .sparkstats { gap: 6px 18px; }
  .multi { grid-template-columns: 1fr; }
  .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  caption { font-size: 9px; padding-left: 86px; padding-right: 10px; }
  figure figcaption, .therm + figcaption { font-size: 9px; padding-right: 10px; }
  table { font-size: 10px; }
  /* A table of sentences is read, not scanned, and on a phone it is carrying far more
     words per row than a table of figures. A step down keeps a rule and its reason on
     three lines instead of six without going under the 9px floor. */
  table.prose td { font-size: 9px; }
  nav.sections { max-width: 100%; }
}
@media (max-width: 420px) {
  main { padding: 14px 12px 52px; }
  .tiles { grid-template-columns: 1fr; }
}
@media print {
  .tip .body { display: block; position: static; width: auto; box-shadow: none; }
  body { background: #fff; }
}
`;
