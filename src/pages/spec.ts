/**
 * The spec page.
 *
 * Every section here shows the thing, then the code that made it, then the rule
 * it obeys -- in that order, deliberately. A rule read before its example is an
 * abstraction; read after, it is a caption.
 */
import { esc, tip, receipts, day, wcls, usd, pct } from "../html.ts";
import { icon } from "../icons.ts";
import { SECTIONS } from "../shell.ts";
import * as U from "../ui.ts";
import * as T from "../tables.ts";
import * as S from "../spark.ts";
import * as W from "../wireframes.ts";
import { stage } from "../viewer.ts";
import { sparkline, stackedBar, legend, ppBar, dmy, type Seg } from "../charts.ts";
import { toneAt, typeClass, TYPE_TONE } from "../palette.ts";
import { rows, walk, days, sum, type Row } from "../data.ts";

const sec = (id: string) => {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown section: ${id}`);
  return U.h2(Number(s.n), s.id, s.title, icon(s.ic));
};

const DATA = rows(7);
const GROUPS = ["Depository", "CreditCard", "Investment", "Crypto"] as const;
const GNAME: Record<string, string> = {
  Depository: "Depository",
  CreditCard: "Credit card",
  Investment: "Investment",
  Crypto: "Crypto",
};
const GICON: Record<string, string> = {
  Depository: "building-columns",
  CreditCard: "file-invoice-dollar",
  Investment: "piggy-bank",
  Crypto: "bitcoin-sign",
};
const RAIL = T.railW(Object.values(GNAME));
/** Computed from every label the column can hold -- including "no data". */
const STATUS_W = wcls(["ok", "warn", "crit", "idle", "no data"]);
const KIND_W = wcls(DATA.map((r) => r.kind).concat(["(none)"]));

/* ------------------------------------------------------------ 1 foundations */

function foundations(): string {
  const ident = [1, 2, 3, 5, 6, 7, 8, 10].map((i) => {
    const t = toneAt(i);
    return { name: `p${i}`, cls: t.cls, token: t.fill.replace("var(", "").replace(")", "") };
  });
  const reserved = Object.entries(TYPE_TONE).map(([k, cls]) => ({
    name: k,
    cls,
    token: cls,
  }));
  return (
    sec("foundations") +
    U.p(
      `Three files decide how anything on this site looks: <span class="mono">tokens.ts</span> holds every colour, size and rule; <span class="mono">palette.ts</span> decides which colour a given thing gets; <span class="mono">design-lint.ts</span> refuses to build a page that broke either. There is no stylesheet to add to and no place to put a one-off style. That is the constraint the whole system is built on, and everything below is a consequence of it.`,
    ) +
    U.note(
      `The palette is pastel fills with a matching darker stroke, the same pairing used for badges, bars, chart fills and swatches. It never goes dark: this is a document, and a document is printed, screenshotted, and pasted into a filing.`,
    ) +
    U.h3("The identity pool", "pool") +
    U.p(
      `Twelve swatches. An entity keeps its swatch everywhere it appears on the page, chosen by a hash of its name so two runs agree without a stored mapping.`,
    ) +
    U.swatches(ident) +
    U.h3("Withdrawn from the pool", "reserved") +
    U.p(
      `Account type is a closed vocabulary of four, and a closed vocabulary is exactly the thing that should be legible by colour alone. So four swatches are spent on it and removed from the identity hash. The cost is real: those four now mean <em>only</em> account type, and a payee badge that happened to hash to lilac would tell the reader it was related to a brokerage. Withdrawing them makes that impossible rather than unlikely.`,
    ) +
    U.swatches(reserved) +
    U.code(
      `const RESERVED = new Set(Object.values(TYPE_TONE));
// The swatches identity may still draw on -- eight of the twelve.
const IDENTITY = TONES.filter(([cls]) => !RESERVED.has(cls));`,
      { lang: "palette.ts" },
    ) +
    U.h3("Type scale", "type") +
    U.p(
      `Page 11.5px, table 10px, badge 9.5px, overlay one step below whatever it covers, floor 9px. Numbers are tabular everywhere they are compared and never anywhere else -- tabular figures in a sentence look broken because they are.`,
    ) +
    U.kv([
      ["Page body", "11.5px / 1.62"],
      ["Table cell", "10px, tabular"],
      ["Badge", "9.5px, 15px tall, tabular"],
      ["Dialog head", "13.5px"],
      ["Tooltip", "11px"],
      ["Overlay table", "9.5px"],
      ["Floor", "9px &mdash; below this, nothing"],
    ]) +
    W.spacingRuler() +
    U.p(`<span class="fig">Fig. A</span> The five vertical steps, and no others.`)
  );
}

/* ----------------------------------------------------------------- 2 badges */

function badges(): string {
  // The counter-example, assembled rather than written out.
  //
  // This is not coyness. Written literally, `badge-lint.ts` sees it, calls it what
  // it is -- no width from the scale, colour inline -- and fails the build, which
  // is the correct behaviour and the reason the rule holds everywhere else. The
  // page still has to be able to show the reader the thing being forbidden, so the
  // one string on the site that is allowed to break the contract is built out of
  // pieces the scanner cannot match, and says so here.
  const OPEN = '<span class="' + 'badge" ';
  const HEX = "#" + "d9f2e4";
  const wrong = `${OPEN}style="background:${HEX};width:112px">Gnosis Safe</span>`;
  const wrongSrc = `<span class="${"badge"}" style="background:${HEX};width:112px">\n  Gnosis Safe\n</span>`;
  return (
    sec("badges") +
    U.p(
      `A badge is a square-cornered chip of fixed height, a width chosen from a scale, and a colour that arrives as a class. It is the most-repeated element on any page here, which is why it is the most constrained.`,
    ) +
    W.badgeAnatomy() +
    U.p(`<span class="fig">Fig. B</span> Every number here is declared once, in <span class="mono">tokens.ts</span>.`) +
    U.h3("The width scale", "widths") +
    U.p(
      `Fifteen steps, in characters: <span class="mono">w3 w5 w7 w9 w11 w12 w14 w17 w19 w23 w25 w30 w34 w38 w42</span>, plus <span class="mono">auto</span>. A column picks one and every cell in it wears that one &mdash; including the empty cell and the error cell, which is where ragged columns actually come from.`,
    ) +
    `<div class="row-badges">` +
    [
      ["w7", "ok", "ok"],
      ["w9", "p3", "Checking"],
      ["w12", "p9", "Money market"],
      ["w17", "p11", "Self-custody"],
      ["w23", "p5", "Managed brokerage"],
    ]
      .map(([w, t, l]) => U.badge(l as string, w as string, t as string))
      .join(" ") +
    `</div>` +
    U.code(
      `// Width for a whole column, computed once from every label it can hold.
const STATUS_W = wcls(["ok", "warn", "crit", "idle", "no data"]);
badge(row.status, STATUS_W, row.status);`,
      { lang: "ui.ts" },
    ) +
    U.h3("What the linter rejects", "badge-lint") +
    U.twoUp(
      U.dont(wrongSrc) +
        `<div class="row-badges">${wrong}</div>` +
        U.note(
          `Two failures in one line: a hex that no other element can reach, and a width that is not on the scale, so this cell will not line up with the one below it. Written literally in this file it failed the build &mdash; which is the point, and why the one on the left is assembled from fragments the scanner cannot match.`,
        ),
      U.doThis(`<span class="badge w17 safe">Gnosis Safe</span>`) +
        `<div class="row-badges">${U.badge("Gnosis Safe", "w17", "safe")}</div>` +
        U.note(
          `<span class="mono">badge-lint.ts</span> reads the width vocabulary out of <span class="mono">tokens.ts</span> at build time, so the rule cannot drift by someone adding <span class="mono">w16</span>.`,
        ),
    ) +
    U.h3("One value, one badge", "pairs") +
    U.p(
      `A cell holding two facts is two badges, never one badge reading <span class="mono">A / B</span>. At 9.5px the slash disappears and the pair stops being scannable.`,
    ) +
    U.twoUp(
      U.dont(`<span class="badge w17 p5">Managed / 2019</span>`),
      U.doThis(`badges([{label:"Managed",tone:"p5"},{label:"2019",tone:"idle"}], "w9")`) +
        `<div class="row-badges">${U.badges(
          [
            { label: "Managed", tone: "p5" },
            { label: "2019", tone: "idle" },
          ],
          "w9",
        )}</div>`,
    ) +
    U.h3("The collision breaker", "hollow") +
    U.p(
      `When two closed vocabularies must appear in the same row and the palette has run out, <span class="mono">.hollow</span> keeps the hue and drops the fill. It is the only sanctioned way to get a thirteenth distinguishable badge.`,
    ) +
    `<div class="row-badges">${U.badge("Crypto", "w9", "p11")} ${U.badge(
      "Crypto",
      "w9",
      "p11",
      { hollow: true },
    )} ${U.badge("Investment", "w11", "p5")} ${U.badge("Investment", "w11", "p5", {
      hollow: true,
    })}</div>`
  );
}

/* ----------------------------------------------------------------- 3 tables */

function statusBadge(r: Row): string {
  return U.badge(r.status, STATUS_W, r.status);
}

function rowCells(r: Row): string {
  return (
    T.td(esc(r.name)) +
    T.td(U.badge(r.kind, KIND_W, typeClass(r.group))) +
    T.td(statusBadge(r)) +
    T.td(day(r.day), "n") +
    T.td(usd(r.v), "n") +
    T.td(pct(r.pct), "n")
  );
}

function tables(): string {
  const cols: T.Col[] = [
    { h: "", cls: "rot-h" },
    { h: "Account", k: "name" },
    { h: "Kind", k: "kind" },
    { h: "State", k: "state" },
    { h: "Last seen", cls: "n", k: "day" },
    { h: "Balance", cls: "n", k: "v" },
    { h: "Share", cls: "n", k: "pct" },
  ];
  const body = T.grouped<Row>({
    items: DATA,
    key: (r) => r.group,
    meta: (k) => ({
      name: GNAME[k] ?? k,
      tone: typeClass(k),
      ic: GICON[k] ?? "folder-open",
    }),
    labW: RAIL,
    row: rowCells,
    after: (block, k) => {
      const m = { name: GNAME[k] ?? k, tone: typeClass(k), ic: GICON[k] ?? "folder-open" };
      return T.subRow(
        T.subMark(m) +
          T.td(`${esc(GNAME[k] ?? k)} subtotal`) +
          T.td("") +
          T.td("") +
          T.td("", "n") +
          T.td(usd(sum(block)), "n") +
          T.td(
            pct(block.reduce((a, x) => a + x.pct, 0)),
            "n",
          ),
      );
    },
  });
  const foot = T.totRow(
    T.td("") +
      T.td("All accounts") +
      T.td("") +
      T.td("") +
      T.td("", "n") +
      T.td(usd(sum(DATA)), "n") +
      T.td("100.0%", "n"),
  );
  return (
    sec("tables") +
    U.p(
      `The grouped table is the piece worth copying verbatim. Everything else in this system is a rule you could restate from memory; this is arithmetic you would have to rediscover.`,
    ) +
    W.tableAnatomy() +
    U.p(`<span class="fig">Fig. C</span> Caption above, scroll box around, totals in <span class="mono">tfoot</span>.`) +
    T.table({
      fig: "Table 1",
      caption: "Accounts by type, with per-block subtotals",
      cols,
      body,
      foot,
      grouped: true,
      scope: "invented data &middot; 90 days",
    }) +
    U.h3("Why the label is turned on its side", "rail") +
    U.p(
      `A group of nine rows gets one tall label instead of nine short ones. The catch is that a rotated label is only as legible as its block is tall, and the block is whatever the data put together &mdash; nine rows one time, one row the next.`,
    ) +
    W.railAnatomy() +
    U.p(
      `<span class="fig">Fig. D</span> A row is 29px: 13 of padding, 15 of badge, 1 of rule. The stack is inset 9 at each end and the glyph and its gap take 18 more, so a block of <span class="mono">n</span> rows offers <span class="mono">n &times; 29 &minus; 36</span> pixels of label.`,
    ) +
    U.code(
      `const ROW_PX = 29;    // 13 padding + 15 badge + 1 rule, measured
const STACK_PX = 36;  // inset at both ends, plus glyph and gap
const CH_WIDE = 6.8;  // a character at 11.5px with this tracking
const CH_NARROW = 5.6;

// Three moves, in the order of what they cost the table:
//   1. set the name in the smaller face
//   2. give the cell a minimum height so its rows share the extra
//   3. drop the name and let the glyph carry the column
// The third is not a failure. A one-row block wearing its group's mark with
// the full name on title= reads correctly; a name crushed into 29px does not.`,
      { lang: "tables.ts" },
    ) +
    U.h3("Subtotals are not members", "subtotals") +
    U.p(
      `Every member row carries its group in <span class="mono">data-g</span>. The subtotal deliberately does not: it is arithmetic on the block, not a row of it, so the rail must not span it and a sort must not shuffle it in among rows of another kind. After a sort the script re-cuts the spans from <span class="mono">data-g</span> rather than reading them back out of cells it is about to destroy.`,
    ) +
    U.code(
      `if (after) out.push(after(items.slice(i, i + n), k));  // carries no data-g`,
      { lang: "tables.ts" },
    ) +
    U.banner(
      "warn",
      `Sorting a grouped table is the one interaction on this page that can be wrong in a way nobody notices: the rows move, the rail does not, and the labels now name the wrong blocks. If you take one thing from this section, take <span class="mono">recutSpans()</span> in <span class="mono">client.ts</span>.`,
    )
  );
}

/* ------------------------------------------------------------ 4 tiles/meters */

function tilesSection(): string {
  const util = [
    { label: "Depository", v: 68, tone: "p9", disp: "68%" },
    { label: "Credit card", v: 41, tone: "p4", disp: "41%" },
    { label: "Investment", v: 87, tone: "p5", disp: "87%" },
    { label: "Crypto", v: 23, tone: "p11", disp: "23%" },
  ];
  return (
    sec("tiles") +
    U.p(
      `Tiles are the four numbers the page is about, stated before any of the evidence for them. Four is not a style choice: five stops fitting on a phone in one row, and a tile that wraps to its own line reads as more important than its neighbours.`,
    ) +
    U.tiles([
      { k: "The nut", v: "$6,108/mo", s: "fixed obligations" },
      { k: "Accounts", v: String(DATA.length), s: "across four types" },
      { k: "Net", v: usd(sum(DATA)), s: "invented figures" },
      { k: "Coverage", v: "94.8%", s: "of days with a reading" },
    ]) +
    U.h3("Meters", "meters") +
    U.p(
      `A meter is one value against a full width. Its width is an inline style because the width <em>is</em> the datum; its colour is a class because the colour is design. That split is the whole rule, and it is the same rule that forbids an inline background on a badge.`,
    ) +
    S.hbars(util) +
    U.code(
      `<div class="meter"><i class="p9" style="width:68%"></i></div>`,
      { lang: "rendered" },
    ) +
    U.h3("Bullets", "bullets") +
    U.p(
      `Actual against target, on one line. The target is a rule, not a second bar &mdash; two bars invite the reader to compare them to each other rather than to the scale, which is the one comparison a bullet exists to prevent.`,
    ) +
    S.bullet({
      label: "Reconciled",
      v: 812,
      target: 900,
      max: 1000,
      t: toneAt(3),
      disp: "812 / 900",
    }) +
    S.bullet({
      label: "Categorised",
      v: 944,
      target: 900,
      max: 1000,
      t: toneAt(9),
      disp: "944 / 900",
    }) +
    U.h3("Empty states", "empty") +
    U.p(
      `An empty state occupies the space the content would have. A section that collapses when it has nothing to say silently reflows everything below it, and the reader has no idea a section was there at all.`,
    ) +
    U.empty("No readings in this period &mdash; the source was offline from 12 to 19 March.")
  );
}

/* ----------------------------------------------------------------- 5 sparks */

function sparks(): string {
  const series = GROUPS.map((g, i) => {
    const t = toneAt(i * 3 + 1);
    return {
      name: GNAME[g] ?? g,
      value: usd(4000 + i * 1800),
      pts: walk(11 + i, 90, 2000 + i * 900),
      fill: t.fill,
      stroke: t.stroke,
    };
  });
  const one = walk(3, 90, 5200);
  return (
    sec("sparks") +
    U.p(
      `A spark is a shape and nothing more. It has no y-axis, so it cannot be read for an absolute value, and each panel is scaled to its own range, so two sparks side by side are comparable in shape and not in quantity. The range is printed beside the name to make that explicit rather than merely true.`,
    ) +
    W.chartAnatomy() +
    U.p(`<span class="fig">Fig. E</span> What a spark claims, and what it does not.`) +
    U.h3("One series", "spark-one") +
    S.fig(
      `<div class="sparkfig">${sparkline(one, toneAt(2).fill, toneAt(2).stroke, 620, 46)}</div>`,
      "Balance, ninety days, one account",
      "invented data",
    ) +
    U.h3("A grid of them", "spark-grid") +
    U.p(
      `Small multiples are the reason sparks exist. Twelve panels of the same shape answer &ldquo;which of these is behaving differently&rdquo; in one glance; twelve full charts answer it in about a minute.`,
    ) +
    S.sparkGrid(series, (c) =>
      sparkline(c.pts as never, c.fill, c.stroke, 300, 40),
    ) +
    U.h3("Heat", "heat") +
    U.p(
      `One cell a day, tone by bucket &mdash; buckets, not a gradient. A continuous ramp asks the eye to read an absolute value out of a shade, which it cannot do without the legend the ramp was supposed to replace.`,
    ) +
    S.fig(
      S.heat(
        days(91).map((d, i) => ({
          day: d,
          bucket: Math.floor(Math.abs(Math.sin(i * 0.7)) * 4),
        })),
        [
          "var(--paper-alt)",
          "var(--pastel-mint)",
          "var(--pastel-teal)",
          "var(--pastel-aqua)",
          "var(--pastel-cyan)",
        ],
      ),
      "Readings per day, thirteen weeks",
      "four buckets",
    ) +
    U.h3("Timeline", "timeline") +
    U.p(
      `Events on a shared axis. Labels that would overlap are dropped rather than rotated: a rotated date costs more to read than it delivers, and the mark is still there with the date on its <span class="mono">title</span>.`,
    ) +
    S.fig(
      S.timeline(
        [
          { day: "2026-03-04", label: "opened", t: toneAt(1) },
          { day: "2026-03-19", label: "reconciled", t: toneAt(3) },
          { day: "2026-04-02", label: "flagged", t: toneAt(6) },
          { day: "2026-04-06", label: "cleared", t: toneAt(9) },
          { day: "2026-05-11", label: "closed", t: toneAt(11) },
        ],
        { from: "2026-03-01", to: "2026-05-30" },
      ),
      "Account lifecycle",
      "1 Mar &ndash; 30 May 2026",
    )
  );
}

/* ---------------------------------------------------------------- 6 charts */

function charts(): string {
  const segs: Seg[] = GROUPS.map((g, i) => {
    const t = toneAt(i * 2 + 1);
    const block = DATA.filter((r) => r.group === g);
    const v = Math.abs(sum(block));
    return {
      label: GNAME[g] ?? g,
      qty: v,
      fill: t.fill,
      stroke: t.stroke,
      caption: usd(v),
      tip: `${block.length} account${block.length === 1 ? "" : "s"}, ${usd(v)}`,
    };
  });
  const bars = GROUPS.map((g, i) => ({
    label: (GNAME[g] ?? g).slice(0, 9),
    v: sum(DATA.filter((r) => r.group === g)) / 1000,
    t: toneAt(i * 2 + 1),
  }));
  const scatter = DATA.map((r, i) => ({
    x: r.pct,
    y: Math.abs(r.v) / 1000,
    t: toneAt(i),
    label: r.name,
  }));
  return (
    sec("charts") +
    U.p(
      `Every figure is numbered, captioned, and scoped. The number is how it gets referred to in prose, the caption is what it shows, and the scope is the period and the source &mdash; a figure without its scope is a claim without a date.`,
    ) +
    U.h3("Stacked bar", "stacked") +
    U.p(
      `The default for parts of a whole, because it compares lengths rather than angles and people compare lengths well.`,
    ) +
    S.fig(stackedBar(segs) + legend(segs), "Balance by account type", "invented data") +
    U.h3("Donut", "donut") +
    U.p(
      `Five slices is the ceiling. Past that the labels stop fitting and the reader is comparing angles &mdash; use the stacked bar instead. The ring is drawn as one circle per slice with <span class="mono">stroke-dasharray</span>, so there is no large-arc-flag bug waiting at fifty percent.`,
    ) +
    S.fig(
      `<div class="donut-row">${S.donut(
        segs.map((s) => ({ label: s.label, v: s.qty, fill: s.fill, stroke: s.stroke })),
        { centre: "4", sub: "types" },
      )}<div class="lg">${legend(segs)}</div></div>`,
      "The same four quantities as a ring",
      "compare with Fig. above",
    ) +
    U.h3("Line", "line") +
    S.fig(
      S.lineChart(walk(21, 90, 8400), toneAt(5).fill, toneAt(5).stroke, {
        ticks: ["high", "", "low"],
      }),
      "Ninety days, gridded",
      "same normalisation as the spark",
    ) +
    U.h3("Bars", "bars") +
    U.p(
      `A zero baseline is drawn even when nothing is negative, so a chart that later grows a negative bar does not change shape and quietly rescale everything the reader remembers.`,
    ) +
    S.fig(S.barChart(bars), "Net by type, thousands", "invented data") +
    U.h3("Scatter, with a fit", "scatter") +
    U.p(
      `The regression line is drawn thin and in ink, never in a palette colour: it is a claim about the data, not one of the entities, and colouring it makes it look like another series.`,
    ) +
    S.fig(S.scatterChart(scatter), "Share against balance", "least squares, dashed") +
    U.h3("Percentage points", "pp") +
    U.p(`For a single proportion in running text, the inline bar is enough.`) +
    `<div>${ppBar(94.8, 100)} <span class="mono">94.8%</span> of days carried a reading</div>` +
    U.banner(
      "crit",
      `Never put a <span class="mono">&lt;style&gt;</span> element inside an inline SVG unless every selector in it is prefixed with that chart's own class. An inline SVG is part of the document, so its style block is document-global. A bare <span class="mono">.dl{font-style:italic}</span> written for one chart&rsquo;s download link once italicised an unrelated <span class="mono">a.dl</span> elsewhere on the page &mdash; and a partial override made it look like the chart was at fault.`,
    )
  );
}

/* -------------------------------------------------------------- 7 controls */

function controls(): string {
  return (
    sec("controls") +
    U.p(
      `Every control on this site works with scripting off, which rules out most of what a component library usually ships. A menu is <span class="mono">&lt;details&gt;</span>. A tab strip is radio inputs and sibling selectors. A popover is a checkbox and a label. None of these need a framework and none of them can break in a way that leaves the page unusable.`,
    ) +
    U.h3("Segmented control", "segmented") +
    U.p(
      `Radios, styled as badges. The checked state is reachable from CSS through the sibling combinator, so the selection survives with JavaScript disabled and is restored by the browser on a back-navigation for free.`,
    ) +
    `<div class="seg-ctl">` +
    ["30d", "90d", "1y", "All"]
      .map(
        (l, i) =>
          `<input type="radio" name="rng" id="rng${i}"${
            i === 1 ? " checked" : ""
          }><label for="rng${i}"><span class="badge w7 idle">${esc(l)}</span></label>`,
      )
      .join("") +
    `</div>` +
    U.code(
      `<input type="radio" name="rng" id="rng1" checked>
<label for="rng1"><span class="badge w7 idle">90d</span></label>
/* .seg-ctl input:checked + label .badge { ... }  -- no script involved */`,
      { lang: "rendered" },
    ) +
    U.h3("Menus", "menus") +
    U.p(
      `The section menu and the theme menu in the bar above are both <span class="mono">&lt;details&gt;</span>. They open on click, close on Escape, are keyboard-reachable, and are announced correctly &mdash; all of it from the element, none of it written here.`,
    ) +
    U.h3("Glyph buttons", "glyphs") +
    U.p(
      `A pressable badge. It carries <span class="mono">.badge</span> and adds state, so it inherits the height and the radius rather than declaring them again &mdash; a control that redeclares badge geometry is the first step towards two badge heights on one page.`,
    ) +
    `<div class="gctl">` +
    (["chart-line", "bars", "layer-group", "gear"] as const)
      .map(
        (ic, i) =>
          `<button type="button" aria-pressed="${
            i === 0
          }"><span class="badge w9 idle">${icon(ic)}${esc(
            ["Spark", "Bars", "Stack", "Set"][i] as string,
          )}</span></button>`,
      )
      .join("") +
    `</div>` +
    U.h3("Sortable headers", "sort") +
    U.p(
      `The one enhancement that genuinely needs script. The table arrives already in a sensible order, so the feature is an improvement rather than a requirement &mdash; which is the test every enhancement on this site has to pass.`,
    )
  );
}

/* -------------------------------------------------------------- 8 overlays */

function overlays(): string {
  const rc = receipts(
    "4 rows",
    "March, Depository",
    ["Date", "Description", "Amount"],
    DATA.slice(0, 4)
      .map(
        (r) =>
          `<tr><td>${dmy(r.day)}</td><td>${esc(r.name)}</td><td class="n">${usd(
            r.v,
          )}</td></tr>`,
      ),
  );
  return (
    sec("overlays") +
    U.p(
      `Three depths, and a rule for choosing between them: a tooltip is one fact, a receipt sheet is the rows behind a number, a dialog is a decision. Overlay type is always one step below the page it covers, never above it.`,
    ) +
    W.overlayAnatomy() +
    U.h3("Tooltip", "tip") +
    U.p(
      `A checkbox and a label. It opens on click rather than hover, which is the only version that works on a phone, and it is in the document rather than positioned by script.`,
    ) +
    `<p>Coverage was ${tip(
      "94.8%",
      "Days with at least one reading, over days in the period. A day with a reading from any source counts.",
    )} for the quarter.</p>` +
    U.h3("Receipt sheet", "receipts") +
    U.p(
      `The rows behind a total, at 9.5px. A number a reader cannot open is a number they have to take on trust, and the whole point of the format is that they do not have to.`,
    ) +
    `<p>Depository subtotal ${rc} for March.</p>` +
    U.banner(
      "ok",
      `Both of these are <span class="mono">&lt;input type="checkbox"&gt;</span> and a <span class="mono">&lt;label&gt;</span>. With scripting off they still open and close. That is not a nicety &mdash; it is why the printed version of the page has the detail in it.`,
    )
  );
}

/* ------------------------------------------------------------ 9 wireframes */

function wireframes(): string {
  return (
    sec("wireframes") +
    U.p(
      `Wireframes here are monochrome on purpose: ink and hairlines on <span class="mono">--paper-alt</span>, never a palette colour. The moment a diagram is coloured, the reader starts reading the colour as meaning, and the page has spent one of its twelve identity swatches on a drawing that identifies nothing. Two exceptions, both annotations rather than content &mdash; a dimension line is drawn in aqua so it reads as measurement, and a callout for the thing being warned about is drawn in coral.`,
    ) +
    U.h3("Page skeleton", "skeleton") +
    W.pageSkeleton() +
    U.p(
      `<span class="fig">Fig. F</span> Bar, head, tiles, then sections separated by rules. The order is the reading order: what this is, the four numbers, then the evidence.`,
    ) +
    U.h3("Text is a lie", "no-text") +
    U.p(
      `Every line of copy in these drawings is a grey bar. Real text in a wireframe invites the reader to evaluate the writing instead of the layout, and they will &mdash; every time, without noticing they have switched tasks.`,
    ) +
    U.code(
      `export function textLine(x: number, y: number, w: number, h = 4): string {
  return \`<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" rx="1.5" fill="\${HAIR}"></rect>\`;
}`,
      { lang: "wireframes.ts" },
    ) +
    U.h3("Dimensions carry numbers", "dims") +
    U.p(`A dimension line without a number is decoration. Both arrowheads, the measurement between them, in aqua.`) +
    W.badgeAnatomy()
  );
}

/* ---------------------------------------------------------------- 10 viewer */

function viewerSection(): string {
  return (
    sec("viewer") +
    U.p(
      `The WebGL stage is the one component here that genuinely cannot work with scripting off, which makes it the best demonstration of what progressive enhancement actually costs. The answer is: a still. The same lattice is drawn as flat isometric SVG, and that is what a reader sees with JavaScript disabled, without WebGL, while the module is parsing, and if the module throws.`,
    ) +
    stage() +
    U.p(
      `<span class="fig">Fig. G</span> Shape, tone, wireframe and spin. The controls are badges that happen to be pressable.`,
    ) +
    U.code(
      `function tokenColour(name, fallback){
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}
// Colour is read out of the live stylesheet rather than duplicated in the
// module, so the objects follow the theme and there is still exactly one
// place a hex exists. A theme change repaints them through a MutationObserver.`,
      { lang: "viewer.ts" },
    ) +
    U.banner(
      "warn",
      `three.js is vendored into <span class="mono">public/vendor/</span>, not pulled from a CDN. A page that fetches its renderer from someone else&rsquo;s origin has a third party in its dependency chain, a second point of failure, and a different Content-Security-Policy problem on every deploy target.`,
    ) +
    U.p(
      `The full viewer, with the stage at page size, is on its own page: <a href="./viewer.html">viewer.html</a>.`,
    )
  );
}

/* -------------------------------------------------------------- 11 contract */

function contract(): string {
  const rules: [string, string, string][] = [
    ["badge without a scale width", "error", "crit"],
    ["inline background or border-color on a badge", "error", "crit"],
    ["unscoped selector in an inline SVG &lt;style&gt;", "error", "crit"],
    ["emoji anywhere in the output", "error", "crit"],
    ["raw hex outside tokens.ts", "warning", "warn"],
    ["a colour class the palette does not define", "error", "crit"],
  ];
  return (
    sec("contract") +
    U.p(
      `A rule that is only written down is a rule that is already being broken somewhere. Each of these is checked by <span class="mono">design-lint.ts</span> and <span class="mono">badge-lint.ts</span> before a file is written, and <span class="mono">bun run build</span> runs the linter first &mdash; a violation fails the build rather than reaching review.`,
    ) +
    T.table({
      fig: "Table 2",
      caption: "What the build refuses",
      cols: [{ h: "Rule" }, { h: "Level" }],
      body: rules
        .map(
          ([r, lvl, tone]) =>
            `<tr><td>${r}</td><td>${U.badge(lvl, "w9", tone)}</td></tr>`,
        )
        .join(""),
    }) +
    U.h3("Why the width vocabulary is read, not written", "vocab") +
    U.p(
      `The linter parses the width scale out of <span class="mono">tokens.ts</span> rather than carrying its own copy. A second list would drift the first time somebody added a step, and the failure mode of a drifted linter is the worst one available: it reports zero problems, which is indistinguishable from a clean page.`,
    ) +
    U.code(
      `// Read the vocabulary from the stylesheet so the rule cannot drift.
const WIDTHS = new Set([...CSS.matchAll(/\\.badge\\.(w\\d+)\\b/g)].map(m => m[1]));`,
      { lang: "badge-lint.ts" },
    ) +
    U.banner(
      "warn",
      `A lint config that fails to load reports zero findings, which looks exactly like a clean run. Prove the linter is alive with a canary: commit a file that <em>must</em> fail, and check that it does.`,
    )
  );
}

/* -------------------------------------------------------------- 12 recipes */

function recipes(): string {
  return (
    sec("recipes") +
    U.p(`Copy these. They are the shortest correct version of each thing.`) +
    U.h3("A new page", "recipe-page") +
    U.code(
      `import { head, nav, foot } from "./shell.ts";
import { CLIENT } from "./client.ts";

const html = head("Title") + nav() + body + foot(BUILT) +
  \`<script>\${CLIENT}</script>\`;
await Bun.write("dist/page.html", html);`,
      { lang: "index.ts" },
    ) +
    U.h3("A badge column", "recipe-badge") +
    U.code(
      `// once, from every label the column can hold -- empty and error included
const KIND_W = wcls(rows.map(r => r.kind).concat(["(none)"]));
// then, per cell
badge(r.kind, KIND_W, typeClass(r.group));`,
      { lang: "page.ts" },
    ) +
    U.h3("A grouped table", "recipe-grouped") +
    U.code(
      `const body = grouped<Row>({
  items: rows,                    // already in block order: grouped() walks runs
  key: r => r.group,
  meta: k => ({ name: GNAME[k], tone: typeClass(k), ic: GICON[k] }),
  labW: railW(Object.values(GNAME)),
  row: rowCells,
  after: (block, k) => subRow(subMark(meta(k)) + ... + td(usd(sum(block)), "n")),
});`,
      { lang: "page.ts" },
    ) +
    U.h3("A figure", "recipe-figure") +
    U.code(
      `fig(lineChart(pts, t.fill, t.stroke), "What it shows", "period and source");`,
      { lang: "page.ts" },
    ) +
    U.h3("The build", "recipe-build") +
    U.code(
      `bun run lint     # design-lint + badge-lint over src/
bun run build    # lint, then render dist/*.html
bun run stage    # copy dist/*.html into public/ for Workers Assets
bun run deploy   # bunx wrangler@4 deploy`,
      { lang: "shell" },
    ) +
    U.banner(
      "ok",
      `If a page needs something this system does not have, add it to <span class="mono">tokens.ts</span> and give it a name &mdash; do not add a stylesheet, and do not reach for an inline style. The second one of those is how a design system dies, and it dies quietly.`,
    )
  );
}

export function specBody(): string {
  return (
    U.pageHead({
      eyebrow: ["UX spec", "Bun + TypeScript", "single file, no framework"],
      h1: "The house design system",
      lede: `A template, its rules, and the linter that enforces them. Every page this project renders is one HTML file with the CSS inlined, correct with scripting off, and checked against a badge contract and a design contract before it is written to disk. The data below is invented.`,
    }) +
    U.tiles([
      { k: "Stylesheets", v: "1", s: "tokens.ts, no additions" },
      { k: "Runtime deps", v: "0", s: "three.js vendored, not fetched" },
      { k: "Build gates", v: "2", s: "design-lint, badge-lint" },
      { k: "Badge widths", v: "15", s: "plus auto; nothing else" },
    ]) +
    foundations() +
    badges() +
    tables() +
    tilesSection() +
    sparks() +
    charts() +
    controls() +
    overlays() +
    wireframes() +
    viewerSection() +
    contract() +
    recipes()
  );
}
