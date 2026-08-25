import { esc, usd, usdA, pct } from "./html";
import { icon } from "./icons";
import { rng } from "./data";

/**
 * The drill: a group, what composed it, the charges inside that, and the one
 * record underneath.
 *
 * Four depths, and the reason there are four rather than two is that a reader
 * arriving at a subtotal has four different questions and only one of them is
 * "which accounts". The others are which charges, which charge, and where did
 * this number come from -- and each is a filter applied to the answer above it,
 * not a new document. So the panels are a stack with a path, and the path is
 * printed in the corner where the reader can cut it back.
 *
 * Every panel is rendered at build time, keyed by its path. The script decides
 * which one is not hidden; it never builds markup, so there is exactly one set
 * of escaping rules on the page and the drill is inert and harmless with
 * scripting off.
 */

/** A single record: the bottom of the drill, and the only thing here with provenance. */
export type Point = {
  day: string;
  payee: string;
  method: string;
  mic: string;
  v: number;
  src: string;
  line: number;
  conf: number;
};
/** One account inside a group. */
export type Acct = { name: string; kind: string; kic: string; v: number; pts: Point[] };
/** A group, and the accounts that made its subtotal. */
export type Block = { key: string; name: string; ic: string; tone: string; accts: Acct[] };

const PAYEES = [
  "Cardinal Grocery", "Mercer Fuel", "Ridgeline Utilities", "Foldspring Rent",
  "Ashby Hardware", "Northgate Clinic", "Vellum Press", "Quarry Coffee",
  "Halloway Insurance", "Bight Telecom",
];
const METHODS: [string, string][] = [
  ["ACH", "arrow-right-arrow-left"],
  ["Card", "file-invoice-dollar"],
  ["Wire", "arrow-up-right-from-square"],
  ["Check", "file-lines"],
];

/**
 * Charges for one account, drawn from the account's own name.
 *
 * Seeded off the name rather than an index so a build that reorders the table
 * does not reorder the money -- `git diff dist/` is a review tool here, and a
 * diff full of numbers that moved for no reason is a diff nobody reads.
 */
function points(name: string, v: number, n: number): Point[] {
  let seed = 7;
  for (let i = 0; i < name.length; i++) seed = (seed * 33 + name.charCodeAt(i)) % 100003;
  const g = rng(seed);
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const m = METHODS[Math.floor(g() * METHODS.length)] as [string, string];
    const mag = Math.abs(v) * (0.03 + g() * 0.11);
    out.push({
      day: `2026-0${1 + Math.floor(g() * 6)}-${String(2 + Math.floor(g() * 26)).padStart(2, "0")}`,
      payee: PAYEES[Math.floor(g() * PAYEES.length)] as string,
      method: m[0],
      mic: m[1],
      v: v < 0 ? -mag : mag,
      src: `2026-q${1 + Math.floor(g() * 2)}-export.csv`,
      line: 40 + Math.floor(g() * 900),
      conf: 0.82 + g() * 0.17,
    });
  }
  return out.sort((a, b) => a.day.localeCompare(b.day));
}

/** Build the demo's four blocks from a flat list of accounts. */
export function blocks(
  spec: readonly { key: string; name: string; ic: string; tone: string; accts: readonly [string, string, string, number][] }[],
): Block[] {
  return spec.map((b) => ({
    key: b.key,
    name: b.name,
    ic: b.ic,
    tone: b.tone,
    accts: b.accts.map(([name, kind, kic, v]) => ({
      name, kind, kic, v, pts: points(name, v, 5),
    })),
  }));
}

export function total(b: Block): number {
  return b.accts.reduce((a, x) => a + x.v, 0);
}

/** A glyph and a word, with no box around either. */
/* A subtitle used to be one sentence of `&middot;`-joined facts. At 10px the middots
   were invisible and the counts, the money and the kind all read as one grey run.
   Each fact is its own badge now -- the house rule that two values are two badges
   applies to a subtitle exactly as it applies to a cell. The sentence that remains
   is the instruction, which is prose and not a value. Owner ruling 2026-08-24. */
function sb(label: string, tone = ""): string {
  return `<span class="badge auto ${tone}">${esc(label)}</span>`;
}
/** A badge strip, plus the trailing instruction that is not a value. */
function strip(parts: readonly string[], hint = ""): string {
  return `<span class="sbs">${parts.join("")}</span>${hint ? `<span class="shint">${esc(hint)}</span>` : ""}`;
}

function gl(ic: string, label: string): string {
  return `<span class="gl">${icon(ic)}${esc(label)}</span>`;
}

/* The crumb rail. It is a box in the top-left corner because that is where the
   reader's eye lands when an overlay opens over a table they were already
   reading, and because the question it answers -- how did I get here, and what
   is this filtered to -- is the question that arrives first. Each crumb but the
   last is a button: the rail is the way back up as well as the record of the way
   down, and a breadcrumb that cannot be clicked is decoration. */
function crumbs(path: readonly { k: string; label: string }[]): string {
  const last = path.length - 1;
  return (
    `<nav class="crumbs" aria-label="Drill path">` +
    path
      .map((c, i) =>
        i === last
          ? `<span class="cb on" aria-current="true">${esc(c.label)}</span>`
          : `<button type="button" class="cb" data-go="${esc(c.k)}">${esc(c.label)}</button>`,
      )
      .join(`<span class="cs" aria-hidden="true">${icon("chevron-right")}</span>`) +
    `</nav>`
  );
}

function panel(key: string, path: readonly { k: string; label: string }[], head: string, sub: string, body: string): string {
  return (
    `<div class="dp" data-key="${esc(key)}" hidden>` +
    crumbs(path) +
    `<h4>${head}</h4>` +
    `<p class="sc">${sub}</p>` +
    body +
    `</div>`
  );
}

/**
 * Every panel in the drill, for one set of blocks.
 *
 * The counts are the honest ones: four groups, their accounts, and five charges
 * each. Rendering every level costs a few tens of kilobytes and buys a demo that
 * actually drills rather than one that opens a picture of drilling.
 */
export function drill(id: string, bs: readonly Block[]): string {
  const out: string[] = [];
  for (const b of bs) {
    const gk = `g|${b.key}`;
    const gt = total(b);
    const gp = [{ k: gk, label: b.name }];
    out.push(
      panel(
        gk,
        gp,
        `${icon(b.ic)} ${esc(b.name)}`,
        strip(
          [sb(`${b.accts.length} accounts`), sb(usdA(gt), b.tone)],
          "click an account for its charges",
        ),
        `<table><thead><tr><th>Account</th><th>Kind</th><th class="n">Balance</th>` +
          `<th class="n">Share</th></tr></thead><tbody>` +
          b.accts
            .map(
              (a) =>
                `<tr class="dr" data-go="a|${esc(b.key)}|${esc(a.name)}" tabindex="0">` +
                `<td>${esc(a.name)}</td><td>${gl(a.kic, a.kind)}</td>` +
                `<td class="n">${usdA(a.v)}</td>` +
                `<td class="n">${gt === 0 ? "&mdash;" : pct(a.v / gt)}</td></tr>`,
            )
            .join("") +
          `</tbody><tfoot><tr class="tot"><td>Total</td><td></td>` +
          `<td class="n">${usdA(gt)}</td><td class="n">${gt === 0 ? "&mdash;" : pct(1)}</td>` +
          `</tr></tfoot></table>`,
      ),
    );
    for (const a of b.accts) {
      const ak = `a|${b.key}|${a.name}`;
      const ap = [...gp, { k: ak, label: a.name }];
      out.push(
        panel(
          ak,
          ap,
          `${esc(a.name)}`,
          strip(
            [sb(a.kind), sb(usdA(a.v), b.tone), sb(`${a.pts.length} charges`)],
            "click one for the record behind it",
          ),
          `<table><thead><tr><th>Date</th><th>Payee</th><th>Method</th>` +
            `<th class="n">Amount</th></tr></thead><tbody>` +
            a.pts
              .map(
                (p, j) =>
                  `<tr class="dr" data-go="t|${esc(b.key)}|${esc(a.name)}|${j}" tabindex="0">` +
                  `<td>${esc(p.day)}</td><td class="pay">${esc(p.payee)}</td>` +
                  `<td>${gl(p.mic, p.method)}</td>` +
                  `<td class="n">${usdA(p.v)}</td></tr>`,
              )
              .join("") +
            `</tbody><tfoot><tr class="tot"><td>Total</td><td></td><td></td>` +
            `<td class="n">${usdA(a.pts.reduce((t, q) => t + q.v, 0))}</td>` +
            `</tr></tfoot></table>`,
        ),
      );
      a.pts.forEach((p, j) => {
        const tk = `t|${b.key}|${a.name}|${j}`;
        out.push(
          panel(
            tk,
            [...ap, { k: tk, label: p.day }],
            `${esc(p.payee)}`,
            strip([sb(p.day), sb(p.method), sb(usdA(p.v), b.tone)]),
            /* The bottom of the drill is not another table. A single record has
               no rows to compare, and a one-row table asks the reader to read a
               header to find out what one cell means. It is a field list, and
               half of the fields are provenance -- where the number came from is
               the answer to the question that made anyone open four panels. */
            `<dl class="pt">` +
              `<dt>Amount</dt><dd>${usd(p.v)}</dd>` +
              `<dt>Posted</dt><dd>${esc(p.day)}</dd>` +
              `<dt>Method</dt><dd>${gl(p.mic, p.method)}</dd>` +
              `<dt>Filed to</dt><dd>${esc(a.name)} &middot; ${esc(b.name)}</dd>` +
              `<dt>Source</dt><dd class="mono">${esc(p.src)}:${p.line}</dd>` +
              `<dt>Match</dt><dd>${pct(p.conf)} against the payee rule</dd>` +
            `</dl>` +
              `<p class="sc"><button type="button" class="drop" data-edit="0">` +
              `${icon("pen-to-square")}Reassign this charge</button></p>`,
          ),
        );
      });
    }
  }
  return (
    `<dialog class="rows drill" id="${esc(id)}"><form method="dialog" class="x">` +
    `<button value="close" aria-label="Close">${icon("xmark")}</button></form>` +
    out.join("") +
    `</dialog>`
  );
}
