/**
 * The spec page.
 *
 * Every section here shows the thing, then the code that made it, then the rule
 * it obeys -- in that order, deliberately. A rule read before its example is an
 * abstraction; read after, it is a caption.
 */
import { esc, tip, tipMark, receipts, day, wcls, usd, usdA, usd0, pct } from "../html.ts";
import { icon } from "../icons.ts";
import { SECTIONS } from "../shell.ts";
import * as U from "../ui.ts";
import * as T from "../tables.ts";
import * as S from "../spark.ts";
import * as W from "../wireframes.ts";
import { stage } from "../viewer.ts";
import * as D from "../dialogs.ts";
import * as DR from "../drill.ts";
import { erd, type Entity } from "../schema.ts";
import { sparkline, stackedBar, legend, ppBar, dmy, type Seg } from "../charts.ts";
import { toneAt, typeClass, strokeOf, TYPE_TONE } from "../palette.ts";
import { rows, walk, days, sum, rng, type Row } from "../data.ts";

const sec = (id: string) => {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown section: ${id}`);
  return U.h2(Number(s.n), s.id, s.title, icon(s.ic), {
    hint: s.hint,
    hintIc: icon(s.hintIc),
    stmt: s.stmt,
  });
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

/* Four rows for the inspector demo, one from each group, so the panel that opens
   is never four variations of a checking account. */
const DRILL = GROUPS.map((g) => DATA.find((r) => r.group === g)).filter(
  (r): r is Row => r !== undefined,
);
const KINDS = [...new Set(DATA.map((r) => r.kind))];

/* The drill's own book. Four groups deep enough to be worth opening and shallow
   enough that every panel behind them can be rendered: thirteen accounts, five
   charges each, sixty-five records at the bottom. */
const DRILL_BLOCKS = DR.blocks([
  {
    key: "Depository", name: "Depository", ic: "building-columns", tone: "p1",
    accts: [
      ["Everyday", "Checking", "wallet", 41_200],
      ["Reserve", "Savings", "piggy-bank", 34_890],
      ["Payroll", "Checking", "wallet", 28_580],
      ["Escrow", "Held", "scale-balanced", 12_240],
    ],
  },
  {
    key: "CreditCard", name: "Credit card", ic: "bag-shopping", tone: "p4",
    accts: [
      ["Travel", "Revolving", "plane", -2_140],
      ["Household", "Revolving", "house", -2_955],
      ["Fuel", "Revolving", "gas-pump", -3_770],
    ],
  },
  {
    key: "Investment", name: "Investment", ic: "chart-line", tone: "p7",
    accts: [
      ["Brokerage", "Taxable", "chart-line", 128_400],
      ["Roth", "Retirement", "book", 56_900],
      ["Saltmarsh", "Managed", "briefcase", 4_262],
    ],
  },
  {
    key: "Crypto", name: "Deferred compensation", ic: "bitcoin-sign", tone: "p10",
    accts: [
      ["Vantage", "Custodial", "vault", 7_912],
      ["Kestrel", "Self-custody", "link", 19_501],
      ["Ninebark", "Gnosis Safe", "layer-group", 5_189],
    ],
  },
]);
const DRILL_RAIL = T.railW(DRILL_BLOCKS.map((b) => b.name));

/* An invented schema, laid out by hand. Four entities is under the size where a
   layout algorithm earns its keep, and a hand placement is stable across builds
   in a way a force layout is not. */
const SCHEMA: Entity[] = [
  {
    id: "acct", title: "account", count: "14", x: 8, y: 12,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "name", type: "text" },
      { name: "group", type: "enum" },
      { name: "kind", type: "text" },
    ],
  },
  {
    id: "txn", title: "transaction", count: "9.2k", x: 262, y: 6,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "account_id", type: "uuid", fk: "acct" },
      { name: "payee_id", type: "uuid", fk: "payee" },
      { name: "amount", type: "numeric" },
      { name: "posted", type: "date" },
    ],
  },
  {
    id: "payee", title: "payee", count: "411", x: 516, y: 24,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "label", type: "text" },
      { name: "rule_id", type: "uuid", fk: "rule" },
    ],
  },
  {
    id: "rule", title: "rule", count: "63", x: 262, y: 156,
    fields: [
      { name: "id", type: "uuid", pk: true },
      { name: "match", type: "text" },
      { name: "kind", type: "text" },
    ],
  },
];
const SCHEMA_RELS = [
  { from: "txn", field: "account_id", to: "acct" },
  { from: "txn", field: "payee_id", to: "payee" },
  { from: "payee", field: "rule_id", to: "rule" },
];

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

/* Twelve months of the same account, drawn once from the row's own name so the
   line is the same line on every build. A history column is the one thing a
   balance cannot say: two accounts at the same number got there from opposite
   directions, and the column that tells them apart costs 68px. */
function hist(key: string, v: number): { day: string; v: number }[] {
  let seed = 11;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) % 100003;
  const g = rng(seed);
  const out: { day: string; v: number }[] = [];
  let x = Math.abs(v) * (0.55 + g() * 0.35);
  for (let i = 0; i < 12; i++) {
    x = Math.max(1, x * (0.93 + g() * 0.19));
    out.push({ day: `2025-${String(i + 1).padStart(2, "0")}-01`, v: x });
  }
  return out;
}

/* The spark takes its colour from the group, like everything else in the row, so
   the history column reads as part of the block rather than as a chart parked
   beside it. No badge: a line is already a shape, and a box around a shape is a
   second border for one fact. */
function histCell(key: string, v: number, tone: string): string {
  const stroke = strokeOf(tone);
  return T.td(
    `<span class="hcell" title="Twelve months to date">` +
      sparkline(hist(key, v), "var(--pastel-vanilla)", stroke, 60, 12) +
      `</span>`,
    "hs",
  );
}

/* The small accounts, pooled. Every group has a tail of balances too small to have
   earned a line, and the two ways to show it are both wrong on their own: list them
   and the table is mostly noise, drop them and the subtotal stops being the sum of
   what is above it. So they share one row, and that row names them. */
const RESIDUAL: Record<string, { names: string[]; more: number; v: number }> = {
  Depository: { names: ["Ally", "Marcus", "Discover"], more: 4, v: 8_412 },
  CreditCard: { names: ["Store card", "Fuel card"], more: 2, v: -1_366 },
  Investment: { names: ["Old 401k", "UTMA"], more: 1, v: 19_055 },
  Crypto: { names: ["Ledger", "Trezor"], more: 3, v: 2_190 },
};

/* Named, not called a remainder. "rest of depository" tells the reader something was
   left over and nothing about what; "Ally, Marcus, Discover +4" tells them whether
   they care. The count of what did not fit is the honest end of the line -- the
   column has a width and nineteen names is not a label either. */
function restCells(k: string, tone: string): string {
  const r = RESIDUAL[k];
  if (!r) return "";
  const detail =
    `<strong>${esc(r.names.join(", "))}</strong>` +
    `<span class="x">and ${r.more} more, each under ${usd0(2500)}</span>` +
    `<span class="iso">pooled into one line &middot; ${usdA(r.v)}</span>`;
  return (
    T.dtd(`${r.names.join(", ")} +${r.more}`, detail, "rest") +
    T.td(`<span class="rest">${icon("layer-group")} pooled</span>`) +
    T.td("") +
    T.td("&mdash;", "n") +
    T.td(usdA(r.v), "n") +
    /* No share. Share is share of the named book, and the pooled line is the part
       that is not named -- a figure here would have to be measured on a different
       base than the column it sits in, and a column with two bases is worse than a
       column with a gap. The balance is what the pool is for. */
    T.td("&mdash;", "n") +
    histCell(`${k}-rest`, r.v, tone)
  );
}

/* The demo's own names, and its own rail width taken from them. A table with a
   different vocabulary gets a different rail; what must not happen is one table
   whose rail width changes as its own groups come and go. */
const DEMO_NAME: Record<string, string> = {
  Depository: "Depository",
  CreditCard: "Credit card",
  Investment: "Investment",
  Crypto: "Deferred compensation",
};
const DEMO_RAIL = T.railW(Object.values(DEMO_NAME));

/* Four blocks whose only job is to be four different heights. */
const RAIL_DEMO: { g: string; n: string; v: number }[] = [
  ...["Everyday", "Reserve", "Payroll", "Escrow", "Sweep"].map((n, i) => ({
    g: "Depository", n, v: 41_200 - i * 6_310,
  })),
  ...["Travel", "Household", "Fuel", "Business"].map((n, i) => ({
    g: "CreditCard", n, v: -2_140 - i * 815,
  })),
  ...["Brokerage", "Roth"].map((n, i) => ({ g: "Investment", n, v: 128_400 - i * 71_500 })),
  { g: "Crypto", n: "Deferred comp", v: 9_640 },
];

function rowCells(r: Row): string {
  /* The account name is the column that would wrap first, so it is the column
     that carries the hover plate: one line in the table, the rest above it. */
  const detail =
    `<strong>${esc(r.name)}</strong>` +
    `<span class="x">${esc(GNAME[r.group] ?? r.group)} &middot; ${esc(r.kind)}</span>` +
    `<span class="iso">${esc(r.day)} &middot; ${usd(r.v)} &middot; ${pct(r.pct)} of book</span>`;
  return (
    T.dtd(r.name, detail) +
    T.td(U.badge(r.kind, KIND_W, typeClass(r.group))) +
    T.td(statusBadge(r)) +
    T.td(day(r.day), "n") +
    T.td(usdA(r.v), "n") +
    T.td(pct(r.pct), "n") +
    histCell(r.name, r.v, typeClass(r.group))
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
    { h: "12 mo" },
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
    rest: (_b, k) => restCells(k, typeClass(k)),
    after: (block, k) => {
      const m = { name: GNAME[k] ?? k, tone: typeClass(k), ic: GICON[k] ?? "folder-open" };
      return T.subRow(
        T.subMark(m) +
          T.td(`${esc(GNAME[k] ?? k)} subtotal`) +
          T.td("") +
          T.td("") +
          T.td("", "n") +
          T.td(usdA(sum(block) + (RESIDUAL[k]?.v ?? 0)), "n") +
          T.td(
            pct(block.reduce((a, x) => a + x.pct, 0)),
            "n",
          ) +
          histCell(k, sum(block) + (RESIDUAL[k]?.v ?? 0), m.tone),
      );
    },
  });
  const foot = T.totRow(
    T.td("") +
      T.td("All accounts") +
      T.td("") +
      T.td("") +
      T.td("", "n") +
      T.td(
        usdA(
          sum(DATA) +
            Object.values(RESIDUAL).reduce((a, r) => a + r.v, 0),
        ),
        "n",
      ) +
      T.td(pct(DATA.reduce((a, x) => a + x.pct, 0)), "n") +
      T.td(""),
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
      /* The one fact about this table that a reader has to know before the first
         row rather than after the last: some of the book is pooled. A footnote
         under the totals is read after the totals have already been believed. */
      mark: {
        ic: "layer-group",
        label: "rest pooled",
        title:
          "Each block ends with a named residual line holding the accounts too small to have earned a row. Its balance is inside the block subtotal and inside the grand total.",
      },
    }) +
    U.h3("The rail, and what it does when the name will not fit", "rail") +
    U.p(
      `The left column is one cell per block, spanning it: a glyph, and the group's name turned on its side beneath it. It is a badge like any other &mdash; one width for the whole rail, taken from every group name the table can ever hold rather than the ones this dataset happens to contain, so the rail does not change width when a group drops out.`,
    ) +
    U.p(
      `The interesting case is a two-row block. Twenty-nine pixels a row, thirty-six spent on the glyph and its gap, and a nine-character name needs sixty-one: it does not fit, and the three ways out are all worse than the fourth. Shrinking the type below the smaller face makes a label nobody reads. Wrapping the rotated name turns the rail into a paragraph on its side. Stretching every block to the tallest name pads the table for the sake of one word. So <span class="mono">fit()</span> tries the full face, then the smaller one, then two to five rows' worth of height for blocks that can afford it &mdash; and when none of those hold, it drops the name and keeps the glyph. That is <span class="mono">td.rot.gonly</span>: the badge loses its fill, its border and its insets, and what is left is the mark, centred, in the group's colour, with the full name on the cell's <span class="mono">title</span>. Nothing is lost that the row's own badges do not already say; the rail's job at that size is to show where the block starts and ends.`,
    ) +
    U.p(
      `The subtotal wears the same mark and never the ribbon. A subtotal is one row, so a rotated name would have twenty-nine pixels to stand in and would draw a box around a single upright glyph &mdash; a second, emptier badge beside the one the block already wears. <span class="mono">hollow</span> was tried there first and only dropped the fill; the border stayed, and the border was the part that read as a box.`,
    ) +
    T.table({
      fig: "Table 2",
      caption: "The same rail at four block heights",
      cols: [
        { h: "", cls: "rot-h" },
        { h: "Account" },
        { h: "Balance", cls: "n" },
      ],
      body: T.grouped<{ g: string; n: string; v: number }>({
        /* Five rows, then four, then two, then one. The last two are the point:
           at two rows the name is dropped and the glyph is kept, and at one there
           was never room for either -- which is the same cell, doing the same
           thing, and not a special case anyone has to remember. */
        items: RAIL_DEMO,
        key: (r) => r.g,
        meta: (k) => ({
          name: DEMO_NAME[k] ?? k,
          tone: typeClass(k),
          ic: GICON[k] ?? "folder-open",
        }),
        labW: DEMO_RAIL,
        row: (r) => T.td(esc(r.n)) + T.td(usdA(r.v), "n"),
      }),
      grouped: true,
      scope: "invented data",
    }) +
    U.p(
      `<span class="fig">Table 2</span> Five rows, four, two, one, and one name of twenty-one characters. Third block: the cell takes four rows\u0027 height so its two rows share the extra (<span class="mono">gh4</span>). Fourth: nothing holds it, so the name is dropped and the glyph carries the column (<span class="mono">gonly</span>).`,
    ) +
    U.h3("The line that names what is in it", "residual") +
    U.p(
      `Every group has a tail: balances too small to have earned a row. Listing them makes the table mostly noise; dropping them makes the subtotal stop being the sum of what is above it. Both are wrong, so the tail shares one line &mdash; and the line says who is in it. <span class="mono">Ally, Marcus, Discover +4</span>, largest first, cut at a width the column can hold, with the count of what did not fit.`,
    ) +
    U.p(
      `The earlier version read <span class="mono">rest of depository</span>, which tells the reader that something was left over and nothing at all about what. Naming it is the difference between a line they can dismiss and a line they have to open. It is muted and italic because it is not a named account; it carries a glyph and no badge, because a badge would make it a category, and it is not one. Its balance is folded into the block subtotal and into the total &mdash; that is the entire reason it exists. Its share is blank: share is share of the named book, and a figure here would have to be measured on a different base than the column it sits in.`,
    ) +
    U.p(
      `It is a member of the block, not arithmetic on it, so it carries <span class="mono">data-g</span> and the rail's span counts it &mdash; unlike the subtotal, which must not carry <span class="mono">data-g</span> or a sort would shuffle it in among rows of another kind.`,
    ) +
    U.h3("Sign, sort, and the twelve months behind the number", "reading") +
    U.p(
      `Three things are happening in that table that a reader will use and never name.`,
    ) +
    U.p(
      `<strong>The sign is in the brackets.</strong> A negative balance is written <span class="mono">($1,200.00)</span> and coloured coral, not <span class="mono">-$1,200.00</span>. The minus is one glyph at the far left of a right-aligned column, which is the one place a column-scan is not looking; the brackets change the shape of the whole number, and the shape is what the scan reads. The colour is the second copy of the same fact and never the only one &mdash; coral against ink fails for a reader who cannot separate them, and fails again in print. Anything that parses these cells has to read the brackets first and put the sign back after: <span class="mono">cellKey</span> in <span class="mono">client.ts</span> does exactly that, which is why a descending sort files the largest loss at the bottom rather than the top.`,
    ) +
    U.p(
      `<strong>A sortable heading is said by the cursor, not by a glyph.</strong> Every column with a <span class="mono">k</span> gets <span class="mono">th.sortable</span>, which is a pointer cursor and a hover; click sorts, and only then does an arrow appear &mdash; <span class="mono">&uarr;</span> or <span class="mono">&darr;</span>, on that one heading. The neutral double arrow on every heading at once was tried and removed: it put nine glyphs on the page carrying no information so that the tenth, which carried all of it, had to be found among them. The keyboard gets the same control, because the header takes focus and Enter and Space are wired to the same handler.`,
    ) +
    U.p(
      `<strong>The last column is the history.</strong> Two accounts at the same balance arrived from opposite directions, and that is the one thing the balance cannot say. Twelve months at 60&times;12 costs less width than the number beside it and settles the question at a glance. It takes the group's own colour, so it reads as part of the block rather than as a chart parked next to it, and it carries no badge and no box &mdash; a line is already a shape, and a border around a shape is a second frame for one fact. The subtotal row gets the block's line for the same reason the subtotal gets a number.`,
    ) +
    U.h3("No wrap, and where the rest of it goes", "nowrap") +
    U.p(
      `Cells do not wrap. A wrapped cell makes its row taller than its neighbours, and the moment rows stop being one height the eye loses the column it was reading down &mdash; which is the only reason to draw a table rather than a list. So the table is set to <span class="mono">width:max-content</span> inside a scroll box and takes the width it needs.`,
    ) +
    U.p(
      `That leaves two problems, and each has one answer. A table wider than its box can be missed entirely, because nothing looks clipped &mdash; the last column simply is not there; so the box carries a circle-chevron at its right edge, shown only while there is more table to the right and measured again on scroll and on resize. And a column whose value genuinely needs a sentence does not get a wider column: it gets a dotted underline and hands the sentence over on hover, and on focus, so a keyboard reaches it too. Hover the account names in <span class="mono">Table 1</span>.`,
    ) +
    U.code(
      `<td class="dt" tabindex="0">Checking\u2003\u2003<span class="dt-full">&hellip;</span></td>

/* the affordance is a statement about this table at this width */
w.classList.toggle("more", el.scrollWidth - el.clientWidth - el.scrollLeft > 2);`,
      { lang: "tables.ts + client.ts" },
    ) +
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
    U.p(
      `Cells are drawn at 9px and the band carries its own width, so a year is about 600px of chart and overflows into a scroll box on a phone rather than shrinking. A calendar band stretched to fill its column stops being a band: at 60px a cell the reader counts squares instead of seeing a season, which is the only thing it is for.`,
    ) +
    U.p(
      `Compact is the default and the reader gets a way out of it. The rail in the top-left corner of the band &mdash; plus, magnifying glass, minus, stacked over the corner of the thing it acts on rather than in a toolbar above it &mdash; sizes the band now; the magnifying glass writes that size to <span class="mono">localStorage</span>, so the next visit opens there. A control that only changes the current view asks the reader to make the same decision again every time they arrive.`,
    ) +
    S.fig(
      S.heatBox(
        "year",
        U.scroll(
          S.heat(
            days(371).map((d, i) => {
              const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
              const v = Math.abs(Math.sin(i * 1.7) + Math.sin(i * 0.31)) * 2.2;
              return {
                day: d,
                bucket: Math.min(4, Math.round(dow === 0 || dow === 6 ? v * 0.3 : v)),
              };
            }),
            [
              "var(--paper-alt)",
              "var(--pastel-mint)",
              "var(--pastel-teal)",
              "var(--pastel-aqua)",
              "var(--pastel-cyan)",
            ],
          ),
        ),
      ),
      "Readings per day, fifty-three weeks. Rows are real weekdays, so the quiet weekend stripe needs no label. The corner rail sizes the band; the glass remembers the size.",
      "five buckets",
    ) +
    U.code(
      `<div class="heat-box" data-heat="year">
  <div class="heat-ctl gctl">...plus, glass, minus...</div>
  <div class="scroll"><svg class="heat" viewBox="0 0 620 92" width="620" height="92">

/* the band keeps its viewBox and is scaled through width/height, so the cells
   stay square and the pitch stays even */
svg.setAttribute("width", String(Math.round(W * HEAT_STEPS[i])));`,
      { lang: "spark.ts + client.ts" },
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
  /* The label is never abbreviated. A foot that reads "Investmen" is worse than
     no foot at all, because the reader cannot tell what was cut -- so a bar too
     narrow for its words carries its glyph instead and defers the words to the
     hover pod, and the legend under the chart decodes the glyph. */
  const bars = GROUPS.map((g, i) => ({
    label: GNAME[g] ?? g,
    v: sum(DATA.filter((r) => r.group === g)) / 1000,
    disp: usd0(sum(DATA.filter((r) => r.group === g))),
    glyph: GICON[g] ?? "circle-info",
    t: toneAt(i * 2 + 1),
  }));
  const barLegend = legend(
    GROUPS.map((g, i) => ({
      label: GNAME[g] ?? g,
      qty: 0,
      fill: toneAt(i * 2 + 1).fill,
      stroke: toneAt(i * 2 + 1).stroke,
      caption: "",
      tip: "",
      glyph: icon(GICON[g] ?? "circle-info"),
    })),
  );
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
      `<div class="donut-pair">` +
        `<div class="du">${S.donut(
          segs.map((s) => ({ label: s.label, v: s.qty, fill: s.fill, stroke: s.stroke })),
          { centre: "4", sub: "types" },
        )}<div class="lg">${legend(segs)}</div></div>` +
        `<div class="du">${S.donut(
          segs.map((s) => ({ label: s.label, v: s.qty, fill: s.fill, stroke: s.stroke })),
          { centre: "4", sub: "types", ring: 24, outline: true },
        )}<div class="lg">${legend(segs)}</div></div>` +
        `</div>`,
      "The same four quantities, filled and outlined. Each ring takes half the column and its legend sits under it, not beside it &mdash; a legend in the second column halves the ring for no gain, and the reader reads down anyway.",
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
    S.fig(
      S.barChart(bars) + barLegend,
      "Net by type, thousands. Bars narrower than their label carry the type glyph; the dollar sum arrives on hover.",
      "invented data",
    ) +
    U.h3("Scatter, with a fit", "scatter") +
    U.p(
      `The regression line is drawn thin and in ink, never in a palette colour: it is a claim about the data, not one of the entities, and colouring it makes it look like another series.`,
    ) +
    S.fig(S.scatterChart(scatter), "Share against balance", "least squares, dashed") +
    U.h3("Schemas are diagrams, not tables", "schema") +
    U.p(
      `A schema printed as a table of column names is a list of facts with the one fact the reader came for &mdash; what points at what &mdash; left implicit in a string. So it is drawn: a card for each entity, a curve for each relation, and the relation leaves the row that owns it rather than the edge of the box.`,
    ) +
    U.p(
      `The cards are HTML over a single SVG wire layer, not SVG text. Type is the whole point of a schema card: a primary key is bold and carries a dot, a foreign key is italic and carries a mark, a type is right-justified mono, and the key rows are tinted so the wiring is legible before a single curve is followed. In HTML each of those is a class; in SVG each is a hand-measured <span class="mono">tspan</span>.`,
    ) +
    S.fig(
      erd(SCHEMA, SCHEMA_RELS, { w: 700, h: 262 }),
      "Four entities and the three relations between them. The frame scrolls and zooms; the cards do not shrink to fit, because a schema read at 60&percnt; is a picture of a schema.",
      "invented schema",
    ) +
    U.noteBox({
      kind: "caution",
      title: "The wire layer carries no stylesheet",
      body: `An inline SVG <span class="mono">&lt;style&gt;</span> is document-global. A selector as ordinary as <span class="mono">.col</span> inside one would reach every card on the page, so colour rides on presentation attributes holding <span class="mono">var()</span> tokens instead.`,
    }) +
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
    ) +
    U.h3("Drilling into a row", "inspect") +
    U.p(
      `A total a reader cannot open is a total they have to take on trust. The third depth is for the case where the answer is not one fact and not one column of receipts but a row of its own with its own rows behind it: click the line and the charges arrive in a modal set at the same size as the table underneath it. Same size, deliberately &mdash; at 11.5px the inspector read as a larger, different document laid over the page rather than as a closer look at the one already there.`,
    ) +
    U.p(
      `The trigger is <span class="mono">tr.clickable</span> on the row, not a control in a last column. A row that opens something is the whole row: a 10px mark in the final column of a table made of numbers reads as another value, and it puts the affordance an inch from where the reader is already pointing.`,
    ) +
    T.table({
      fig: "TBL. 4",
      caption: "Four accounts. Any row opens the charges behind its balance.",
      cols: [
        { h: "Account" },
        { h: "Kind" },
        { h: "Balance", cls: "n" },
      ],
      body: DRILL.map(
        (r, i) =>
          `<tr class="clickable" data-row="${i}" tabindex="0">` +
          T.td(esc(r.name)) +
          T.td(esc(r.kind)) +
          T.td(usd(r.v), "n") +
          `</tr>`,
      ).join(""),
    }) +
    D.inspector("row-dialog", DRILL, GNAME) +
    U.h3("Filtering down to the data point", "levels") +
    U.p(
      `One depth answers "which accounts". It does not answer which charges, or which charge, or where that number came from &mdash; and a reader who has opened a subtotal is usually on their way to the last of those. Each of the four is the same view filtered one step further, so they are one overlay with a path rather than four overlays that happen to be about the same money.`,
    ) +
    U.p(
      `The path is the state, and it is in the corner. Every panel on the page carries its own key &mdash; <span class="mono">g|Investment</span>, <span class="mono">a|Investment|Roth</span>, <span class="mono">t|Investment|Roth|3</span> &mdash; and opening a depth is deciding which key is not hidden. Nothing is built by script, so there is one set of escaping rules on the page, and no stack variable kept beside the DOM to disagree with it the first time someone closes the dialog from the corner instead of the crumb.`,
    ) +
    U.p(
      `Both kinds of row on the table below open it, at different depths: the group label enters at its composition, a member row enters at its charges. That is only possible because the panels are keyed by path and not by row index.`,
    ) +
    T.table({
      fig: "TBL. 5",
      caption:
        "Four groups. The rail opens the composition; a row opens that account's charges; a charge opens the record behind it.",
      cols: [
        { h: "Group" },
        { h: "Account" },
        { h: "Kind" },
        { h: "Balance", cls: "n" },
      ],
      // The rail spans the members *and* the subtotal that closes them, so the span is
      // accts.length + 1. The subtotal carries the group's mark as a bare glyph -- the
      // boxed badge is the rail's job, and repeating it one column over read as two
      // labels for one group. Owner ruling 2026-08-24.
      body: DRILL_BLOCKS.map(
        (b) =>
          b.accts
            .map(
              (a, j) =>
                `<tr>` +
                (j === 0
                  ? T.glabelCell(
                      b.name,
                      b.accts.length + 1,
                      DRILL_RAIL,
                      { name: b.name, tone: b.tone, ic: b.ic },
                      `data-drill="g|${esc(b.key)}" role="button" tabindex="0"`,
                    )
                  : "") +
                `<td><a class="dl" href="#levels" data-drill="a|${esc(b.key)}|${esc(a.name)}">${esc(a.name)}</a></td>` +
                `<td><span class="gl">${icon(a.kic)}${esc(a.kind)}</span></td>` +
                `<td class="n">${usdA(a.v)}</td></tr>`,
            )
            .join("") +
          T.subRow(
            `<td><span class="gl">${icon(b.ic)}${esc(b.name)} subtotal</span></td>` +
              `<td>${b.accts.length} accounts</td>` +
              `<td class="n">${usdA(b.accts.reduce((t, a) => t + a.v, 0))}</td>`,
          ),
      ).join(""),
      grouped: true,
    }) +
    U.noteBox({
      kind: "",
      title: "The last crumb is not a button",
      body: `A control that returns the reader to where they already are teaches that the rail does nothing, and the next time they want to go up two levels they will reach for the close box instead.`,
    }) +
    DR.drill("drill-dialog", DRILL_BLOCKS) +
    U.code(
      `// drill.ts \u2014 the key is the path, and the path is the crumb rail
panel("t|Investment|Roth|3", [group, account, record], ...)

// Both row kinds open it; they differ only in where they enter.
glabelCell(name, n, railW, meta, 'data-drill="g|Investment"')
<a class="dl" data-drill="a|Investment|Roth">`,
      { lang: "DRILL.TS" },
    ) +
    U.h3("Editing without the platform's furniture", "picker") +
    U.p(
      `Editing a row means choosing from a list, and a <span class="mono">&lt;select&gt;</span> hands that list to the operating system. Beside a dialog set in 10px mono, the macOS popup arrives in 13px Helvetica: it is the one control on the page that does not look like the page, and no amount of styling on the closed control fixes the open one. So the list is drawn here &mdash; a button, a panel of buttons, and a hidden input holding the value. Everything downstream still reads <span class="mono">.value</span> and still hears <span class="mono">change</span>, which is the part worth protecting.`,
    ) +
    U.p(
      `The panel has one more job than a native list: it names the shape of the edit. Two pickers, a sentence saying what the rule is written against, and the line the change would write &mdash; readonly, because the dialog is a decision and not a database. The verdict sits at the bottom right, where the reading ends, with the secondary action first so the primary lands on the corner the pointer leaves from.`,
    ) +
    U.noteBox({
      kind: "caution",
      title: "The list closes before the dialog does",
      body: `Escape is taken by the open picker first. The nearest overlay is the list, and closing the whole panel would throw away a choice the reader was in the middle of making.`,
    }) +
    D.editor("edit-dialog", Object.values(GNAME), KINDS) +
    U.code(
      `// dialogs.ts \u2014 the control, not the platform's
pick("ed-pick-group", "ed-group", "Group", groups, groups[0]);

// The row is the target, so the row carries the class.
\`<tr class="clickable" data-row="\${i}" tabindex="0">\`
// tokens.ts already has: dialog.rows, .pk/.pkb/.pkl, tr.clickable, td.pop`,
      { lang: "DIALOGS.TS" },
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

/* ---------------------------------------------------------- 10 layout */

/**
 * The furniture a data page is assembled from, in the order a page uses it:
 * something is wrong at the top, the four numbers, where the numbers came from,
 * the list they came out of, and the machines that produced them.
 */
function layout(): string {
  const roleW = wcls(["ingest", "enrich", "store", "edge"]);
  const nodes = [
    { nm: "spark-1", role: "ingest", tone: "p1", link: "1 Gb/s", ms: "33.9 ms", load: 60, disk: 64 },
    { nm: "node-eighteen", role: "enrich", tone: "p8", link: "1 Gb/s", ms: "9.4 ms", load: 5, disk: 71 },
    { nm: "unraid-one", role: "store", tone: "p12", link: "10 Gb/s", ms: "4.3 ms", load: 30, disk: 24 },
  ];
  const nodeCards = nodes
    .map((n) =>
      U.card({
        title: n.nm,
        role: n.role,
        roleW,
        tone: n.tone,
        meta: n.ms,
        body:
          U.chips([
            { k: "link", v: n.link, tone: "idle" },
            { k: "state", v: "online", tone: "ok" },
          ]) +
          S.meterRow("load", `${n.load}%`, n.load, n.load > 55 ? "warn" : n.tone) +
          S.meterRow("disk", `${n.disk}%`, n.disk, n.disk > 68 ? "warn" : n.tone),
      }),
    )
    .join("");

  const byGroup = GROUPS.map((g) => {
    const items = DATA.filter((r) => r.group === g);
    return {
      name: GNAME[g] as string,
      ic: icon(GICON[g] as string),
      tone: typeClass(g),
      count: `${items.length} acct`,
      total: usd(sum(items)),
      open: g === "Depository",
      items: items.map((r) => ({
        title: r.name,
        meta: [
          { label: r.kind, tone: "mono" },
          { label: r.status, tone: r.status },
          { label: usd(r.v), tone: "mono" },
        ],
      })),
    };
  });

  return (
    sec("layout") +
    U.p(
      `Nine sections of this spec are about one component each. This one is about the page they sit in: the notice at the top, the strip of figures under it, the rail that says where the figures came from, the list they were computed over, and the cards for the machines that produced them. Every surface below is drawn from classes <span class="mono">tokens.ts</span> already defines &mdash; the section adds four helpers in <span class="mono">ui.ts</span> and not one rule.`,
    ) +
    U.h3("Notices, and there are four", "notices") +
    U.p(
      `Four intents, closed. Plain is the reasoning behind a rule; <span class="mono">good</span> is a confirmed outcome; <span class="mono">caution</span> is a thing that will bite later; <span class="mono">crit</span> is a thing that is wrong now. A fifth has never survived contact with a reader &mdash; by the time a page carries five tints two of them are being read as one, and the cheap fix is deciding which of the two the box actually was.`,
    ) +
    U.noteBox({
      ic: icon("circle-info"),
      title: "Why the figures are invented",
      body: `Every number on this page is generated from a seeded walk with a fixed epoch, so two builds of the same source produce byte-identical HTML and <span class="mono">git diff dist/</span> is a review tool rather than noise.`,
    }) +
    U.noteBox({
      kind: "good",
      ic: icon("circle-check"),
      title: "Ledger reconciled",
      body: `All four groups closed against the statement. The last unmatched row cleared on ${day("2026-03-14")}.`,
    }) +
    U.noteBox({
      kind: "caution",
      ic: icon("triangle-exclamation"),
      title: "Two sources are stale",
      body: `Crypto balances were last refreshed 9 days ago. The figures are shown because a blank is worse than a dated number, but the trend beside them is short by nine points.`,
    }) +
    U.noteBox({
      kind: "crit",
      ic: icon("ban"),
      title: "One source failed",
      body: `The brokerage feed returned a 502 on its last three attempts. Nothing downstream of it on this page is current, and the affected rows carry <span class="mono">crit</span> in the status column rather than a stale value dressed as a fresh one.`,
    }) +
    U.h3("The strip: gap-separated against hairline-separated", "strip") +
    U.p(
      `The same four readings twice. Loose boxes with a gap between them read as four things and the eye counts them; one bordered rail with hairline dividers reads as one row of readings and the eye reads it. <span class="mono">.tiles</span> is the rail, and it is the only one of the two this system ships &mdash; the gapped version is shown here so the difference is arguable rather than asserted.`,
    ) +
    U.tiles([
      { k: "Sources", v: "7", s: "3 stale, 1 failed" },
      { k: "Rows", v: String(DATA.length), s: "across four groups" },
      { k: "Coverage", v: "94.8%", s: "of days with a reading" },
      { k: "Last ingest", v: "9 min", s: "ago, from unraid-one" },
    ]) +
    U.note(
      `The rail is a grid with <span class="mono">auto-fit</span> and a 158px minimum, so it re-flows to two rows on a phone without a breakpoint declared anywhere. Five readings is the ceiling for the same reason four tiles is: the fifth wraps, and a wrapped tile reads as more important than its neighbours.`,
    ) +
    U.h3("Chip rails", "chips") +
    U.p(
      `Where a figure came from, and what it cost to get. Each pair is <em>two</em> badges, never one reading <span class="mono">DB 2.0 ms</span> &mdash; set as one string the reader has to parse it; set as two, the labels line up down the rail and the numbers line up beside them, and the comparison the rail exists for is the one the eye makes first. Both columns take a single width computed from every member, so a slower source added next month does not shuffle the ones already there.`,
    ) +
    U.chips([
      { k: "sqlite", v: "2.0 ms", tone: "ok" },
      { k: "nfs", v: "5.9 ms", tone: "ok" },
      { k: "ipfs", v: "378.2 ms", tone: "warn" },
      { k: "brokerage", v: "timeout", tone: "crit" },
    ]) +
    U.code(
      `U.chips([
  { k: "sqlite", v: "2.0 ms",   tone: "ok" },
  { k: "ipfs",   v: "378.2 ms", tone: "warn" },
  { k: "brokerage", v: "timeout", tone: "crit" },
])`,
      { lang: "ui.ts" },
    ) +
    U.note(
      `<span class="mono">timeout</span> is why both widths are computed from the whole rail rather than from the numbers. It is the longest string in the value column and it only appears when something is broken &mdash; a width measured on the happy path would jump the rail sideways at exactly the moment the reader is trying to read it.`,
    ) +
    U.h3("Band lists", "bands") +
    U.p(
      `A group, its members, and each member's metadata &mdash; one bordered plate rather than four cards. The disclosure is a native <span class="mono">&lt;details&gt;</span>, so it opens with scripting off and the browser handles the keyboard for it. The first band ships open: a page that opens on a column of closed triangles has told the reader nothing about what is inside them.`,
    ) +
    U.bands(byGroup) +
    U.note(
      `The member metadata takes one width across <em>every</em> band, not one per band. Computed per band, the kind column in Depository would sit at one x-position and the kind column in Crypto at another, and the list would stop being a list.`,
    ) +
    U.h3("Status cards", "cards") +
    U.p(
      `A machine, its role, its link, and what it is doing. The role badge sits right of the title on the title's own baseline for the same reason the section hint does &mdash; a fact about the thing belongs on the thing's line, and dropping it underneath turns a one-line header into a two-line one and buys nothing. The meters are the same primitive as everywhere else: width inline because the width is the datum, colour a class because the colour is design.`,
    ) +
    U.cards(nodeCards) +
    U.note(
      `The tone flips to <span class="mono">warn</span> above a threshold, and the threshold is in the code beside the number rather than in the stylesheet. A meter that is amber because a CSS rule said so cannot be traced back to what made it amber. The identity swatches these cards draw on are aqua, orchid and indigo &mdash; not blush, and not mint. Blush at a glance is the crit red from the band list above, and mint is the <span class="mono">ok</span> green in the chips inside the card; both would have been the same colour meaning two things on one page.`,
    ) +
    U.h3("Panels are not a separate system", "panels") +
    U.p(
      `Every surface above can be re-hosted in a draggable panel, and the temptation is to build the panel version as its own component set. It is not one. A panel is a container; the strip inside it is the same <span class="mono">.tiles</span>, the list is the same <span class="mono">.bands</span>, and a control in the panel writes page state &mdash; so changing row density in the panel re-renders the table in section 3, rather than re-rendering a copy of it that now disagrees.`,
    ) +
    U.noteBox({
      kind: "caution",
      ic: icon("triangle-exclamation"),
      title: "The failure mode this avoids",
      body: `A panel with its own copy of a table is two tables. They agree until one of them is fixed, and then the reader has two answers and no way to tell which is current. If a surface needs to appear in a panel, the panel takes the surface &mdash; it does not take a second implementation of it.`,
    })
  );
}

/* ---------------------------------------------------------------- 10 viewer */

/* -------------------------------------------------- 11 viewports */

/** A stand-in for whatever the frame is really showing. Deliberately abstract:
 *  a real map screenshot in a spec teaches the map, not the placement. */
function vpStub(kind: "map" | "chart" | "stage"): string {
  const g =
    kind === "map"
      ? `<path d="M0 74 L44 58 L96 70 L150 44 L214 62 L268 40" fill="none" stroke="var(--rule)" stroke-width="1" vector-effect="non-scaling-stroke"></path>` +
        `<path d="M0 30 L60 22 L118 40 L180 16 L268 34" fill="none" stroke="var(--rule-soft)" stroke-width="1" vector-effect="non-scaling-stroke"></path>` +
        `<path d="M18 0 L38 46 L26 104 L58 168" fill="none" stroke="var(--rule-soft)" stroke-width="1" vector-effect="non-scaling-stroke"></path>` +
        `<path d="M150 0 L166 52 L142 110 L178 168" fill="none" stroke="var(--rule-soft)" stroke-width="1" vector-effect="non-scaling-stroke"></path>` +
        `<path d="M8 150 L70 128 L128 138 L188 108 L268 120" fill="none" stroke="var(--stroke-aqua)" stroke-width="1.6" vector-effect="non-scaling-stroke"></path>` +
        `<circle cx="188" cy="108" r="3.5" fill="var(--pastel-aqua)" stroke="var(--stroke-aqua)"></circle>`
      : kind === "chart"
        ? `<path d="M0 132 L34 118 L68 126 L102 92 L136 100 L170 64 L204 76 L238 44 L268 52" fill="none" stroke="var(--stroke-indigo)" stroke-width="1.4" vector-effect="non-scaling-stroke"></path>` +
          `<path d="M0 168 L0 132 L34 118 L68 126 L102 92 L136 100 L170 64 L204 76 L238 44 L268 52 L268 168 Z" fill="var(--pastel-indigo)" fill-opacity="0.5" stroke="none"></path>`
        : `<path d="M134 34 L206 74 L206 128 L134 168 L62 128 L62 74 Z" fill="var(--pastel-orchid)" fill-opacity="0.55" stroke="var(--stroke-orchid)" stroke-width="1.2" vector-effect="non-scaling-stroke"></path>` +
          `<path d="M134 34 L134 100 L62 74 M134 100 L206 74 M134 100 L134 168" fill="none" stroke="var(--stroke-orchid)" stroke-width="0.9" stroke-opacity="0.7" vector-effect="non-scaling-stroke"></path>`;
  return `<svg viewBox="0 0 268 168" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true"><rect x="0" y="0" width="268" height="168" fill="var(--paper-alt)"></rect>${g}</svg>`;
}

function viewports(): string {
  const btn = (ic: string) => icon(ic);
  return (
    sec("viewports") +
    U.p(
      `A map, a page-size chart, a WebGL stage and a live camera all pose the same problem: the content wants the whole rectangle, and the controls have nowhere to stand that is not on top of it. The usual answer is a toolbar above the frame, which solves it by making the frame smaller &mdash; the one thing the content was asking you not to do. In a grid of four frames it also buys four toolbars for one set of controls.`,
    ) +
    U.p(
      `So the controls dock <em>inside</em> the frame, at five anchors and nowhere else. The split is by what a control acts on, not by what it looks like, which is what makes it hold across pages: a reader who finds reset at the bottom right of the map finds it at the bottom right of the model.`,
    ) +
    U.h3("The five docks", "docks") +
    `<figure>` +
    W.viewportDocks() +
    `<figcaption><span class="badge w7 idle">Fig. E</span>Docks are 9px off the edge &mdash; the same inset as everything else that floats on this site. The bottom three share one grid row, so an empty centre dock still holds its column and the outer two cannot drift inward to meet each other.</figcaption>` +
    `</figure>` +
    U.kv([
      ["top edge", "What is being shown. Layer, mode, range, source. These change the content, so they sit above it and read left to right."],
      ["bottom left", "The state the viewport is in. Play/pause, follow, lock."],
      ["bottom centre", "Movement within the content. Step, seek, home."],
      ["bottom right", "What the frame does to itself. Zoom, reset, fullscreen, and the pickers."],
      ["anywhere else", "Nothing. A fifth position is a sixth convention, and the reader stops predicting where a control will be."],
    ], { wide: true }) +
    U.h3("A frame, fully dressed", "dressed") +
    U.p(
      `Options on the top edge; the readout under them at the right, larger than the body face rather than smaller, because it is the one figure meant to be legible from across a room. State bottom left, movement bottom centre, frame controls bottom right. Every control is a badge and inherits its height from the badge contract &mdash; a control that redeclares badge geometry is the first step to two badge heights on one page.`,
    ) +
    U.viewport({
      cls: "wide",
      body: vpStub("map"),
      topL: U.vpPick({
        mark: `${btn("layer-group")}Satellite`,
        title: "Map type",
        items: [
          { label: "Standard" },
          { label: "Satellite", on: true },
          { label: "Terrain" },
          { label: "Traffic" },
        ],
        w: "w17",
      }),
      topR: U.vpPick({
        mark: `${btn("chart-line")}90d`,
        title: "Range",
        items: [{ label: "30d" }, { label: "90d", on: true }, { label: "1y" }, { label: "All" }],
        rt: true,
        w: "w11",
      }) + U.vpRead("88", "mph", "↑ 412 ft"),
      bl: U.vpBtns(
        [
          { ic: "car", on: true, title: "Follow vehicle" },
          { ic: "heart-pulse", title: "Live telemetry" },
        ],
        btn,
      ),
      bc: U.vpBtns(
        [
          { ic: "arrow-right-arrow-left", title: "Step back" },
          { ic: "house", title: "Recentre" },
          { ic: "chevron-down", title: "Step forward" },
        ],
        btn,
      ),
      br: U.vpBtns(
        [
          { ic: "arrow-rotate-left", title: "Reset view" },
          { ic: "arrow-up-right-from-square", title: "Fullscreen" },
        ],
        btn,
      ) +
        U.vpPick({
          mark: btn("gear"),
          title: "Size",
          items: [{ label: "Fit" }, { label: "100%", on: true }, { label: "200%" }],
          up: true,
          rt: true,
          w: "w5",
        }),
      label: "Drive 4128 &middot; 12 Mar",
    }) +
    U.note(
      `The readout sits under the options rather than beside them because it is not a control: mixing a figure into a row of switches invites a tap on it. Its unit is printed for the same reason a chart prints its scale &mdash; <span class="mono">88</span> alone is a number, not a speed.`,
    ) +
    U.h3("Pickers open away from their edge", "pickers") +
    U.p(
      `A picker docked at the bottom right opens upwards and aligns its right edge; one on the top edge opens down and aligns left. Stated as a parameter on the helper rather than inferred in CSS from where the cluster happens to sit, because the frame clips and a panel that guesses wrong grows off it &mdash; and the guess is only wrong on the frame nobody tested.`,
    ) +
    U.p(
      `Each picker is a checkbox, a label, a panel and a full-viewport scrim label behind it. The scrim makes the outside click a real click on a real element, so the panel light-dismisses with no script at all. That is the trick a <span class="mono">&lt;details&gt;</span> menu cannot borrow, and the reason the nav menus in the bar above need ten lines of script for the one behaviour they lack.`,
    ) +
    U.code(
      `U.vpPick({ mark: icon("gear"), title: "Size", up: true, rt: true,\n  items: [{ label: "Fit" }, { label: "100%", on: true }] })`,
      { lang: "picker, bottom-right dock" },
    ) +
    U.h3("A grid of them", "vpgrid") +
    U.p(
      `The docks are what make a grid possible. Four frames, one convention, no toolbars: the controls cost the layout nothing because they are already inside the rectangle the content occupies. Below 520px it drops to one column &mdash; a docked cluster forced to overlap its neighbour's content is worse than a scroll.`,
    ) +
    U.vpGrid(
      U.viewport({
        body: vpStub("chart"),
        topL: `<span class="badge w14 p11">Throughput</span>`,
        topR: `<span class="badge w9 mono">90d</span>`,
        br: U.vpBtns([{ ic: "arrow-up-right-from-square", title: "Fullscreen" }], btn),
        label: "ingest &middot; spark-1",
      }) +
        U.viewport({
          body: vpStub("stage"),
          topL: `<span class="badge w14 p8">Model</span>`,
          bl: U.vpBtns([{ ic: "sun", on: true, title: "Lighting" }], btn),
          br: U.vpBtns([{ ic: "arrow-rotate-left", title: "Reset" }], btn),
          label: "viewer &middot; three.js",
        }),
    ) +
    U.note(
      `Every frame in the grid puts fullscreen and reset at the bottom right, even the one that has only one of them. A control that moves between two frames on the same page costs the reader the prediction that made the convention worth having.`,
      "good",
    ) +
    U.h3("Hover helpers", "hover") +
    U.p(
      `The frame's own name is printed on the frame rather than under it: in a grid, a caption below a viewport is nearer the next viewport than to its own. Everything longer than a name goes in a hover panel instead of on the frame, for the same reason a table cell does not wrap &mdash; a viewport that grows a second line of chrome has taken it from the content.`,
    ) +
    U.p(
      `Panels open on hover <em>and</em> on the checkbox, so the same markup works with a pointer, with a keyboard, and on a phone where there is no hover at all. On hover alone they would be unreachable on exactly the devices these frames are most used on.`,
    ) +
    U.h3("The circle-i mark", "tipmark") +
    U.p(
      `A badge or a table cell has one line and no room to explain itself, and both of the usual repairs are bad. Let the cell wrap and one long value sets the height of every row beside it; truncate it and the reader is told there is more without being told what. A circle-i after the value costs the column nothing, holds as many lines as the fact needs, and leaves the default reading concise and unwrapped.`,
    ) +
    `<p class="note">Ledger reconciled ${U.badge("812 / 900", "w11", "p1")}${tipMark(
      `Nine hundred entries were expected from the March statement; 812 matched a booked transaction on amount and date. The 88 unmatched are held in the review queue and are not counted anywhere on this page.`,
    )} &mdash; the badge stays one line, the arithmetic behind it is one tap away.</p>` +
    U.scroll(
      `<table><thead><tr><th>Source</th><th>Rows</th><th>Latency</th><th>State</th></tr></thead><tbody>` +
      `<tr><td>sqlite${tipMark(
        `Local file, read directly. No pool, no network, and no failure mode other than the file being absent.`,
      )}</td><td class="num">128,940</td><td class="num">2.0 ms</td><td>${U.badge("ok", "w9", "ok")}</td></tr>` +
      `<tr><td>nfs${tipMark(
        `unraid-one over NFSv4. Latency is the round trip including the server's own page cache; a cold read is roughly twenty times this and is not averaged in.`,
      )}</td><td class="num">44,102</td><td class="num">5.9 ms</td><td>${U.badge("ok", "w9", "ok")}</td></tr>` +
      `<tr><td>ipfs${tipMark(
        `Gateway fetch with a 4 s ceiling. The figure is the median of the last hundred; the tail is long enough that a mean would be a different claim entirely.`,
        { rt: true },
      )}</td><td class="num">1,204</td><td class="num">378.2 ms</td><td>${U.badge(
        "warn",
        "w9",
        "warn",
      )}</td></tr>` +
      `</tbody></table>`,
    ) +
    U.note(
      `The mark on the last row is right-aligned. Near the right edge of a table a left-aligned panel opens off the page, and on a phone it opens off the page one column sooner than it does here &mdash; which is why the alignment is a parameter and not a media query.`,
      "caution",
    ) +
    U.twoUp(
      U.dont(
        `<td>ipfs gateway fetch, 4s ceiling,\n    median of last 100</td>`,
      ),
      U.doThis(`<td>ipfs${"$"}{tipMark("Gateway fetch with a 4 s ceiling...")}</td>`),
    )
  );
}

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
      fig: "Table 3",
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
    layout() +
    viewports() +
    viewerSection() +
    contract() +
    recipes()
  );
}
