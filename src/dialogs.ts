/**
 * Drill-down and editing.
 *
 * Two overlays and one control. The inspector answers "what is behind this
 * number" for one row; the editor answers "and where should it have gone".
 * Both are `dialog.rows`, which is modal on purpose: each is a question about
 * a single row, and nothing else on the page is relevant while it is open.
 * A drawer or an expanding row would push the table being explained off the
 * screen at the moment the reader wants to compare against it.
 *
 * The control is the picker. A `select` hands its list to the platform, which
 * draws it in the system font at a size this page does not set and cannot: next
 * to a dialog set in 10px mono, the macOS popup arrives in 13px Helvetica and is
 * the one thing on the page that does not belong to the page. So the list is
 * ours -- a button, a panel of buttons, and a hidden input holding the value.
 * Everything downstream still reads `.value` and still hears `change`.
 */
import { esc, usd } from "./html.ts";
import { icon } from "./icons.ts";
import { rng } from "./data.ts";
import type { Row } from "./data.ts";

/** One choice, drawn by the page rather than by the platform. */
export function pick(
  id: string,
  field: string,
  label: string,
  options: readonly string[],
  chosen = "",
): string {
  const opts = options
    .map(
      (o) =>
        `<button type="button" role="option" aria-selected="${o === chosen}"` +
        `${o === chosen ? ` class="on"` : ""}>${esc(o)}</button>`,
    )
    .join("");
  return (
    `<div class="pk" id="${esc(id)}" data-for="${esc(field)}">` +
    `<span class="pl">${esc(label)}</span>` +
    `<input type="hidden" id="${esc(field)}" value="${esc(chosen)}">` +
    `<button type="button" class="pkb" aria-haspopup="listbox" aria-expanded="false">` +
    `<span class="pv">${esc(chosen) || "&mdash;"}</span>${icon("chevron-down")}</button>` +
    `<div class="pkl" role="listbox">${opts}</div></div>`
  );
}

const PAYEE = [
  "ACH CREDIT", "CARD 4417", "TRANSFER IN", "DIRECT DEP", "WIRE OUT",
  "CHECK 1182", "ACH DEBIT", "CARD 9902",
];

/**
 * The rows behind one balance.
 *
 * Invented, but invented once: the seed is the row's position, so the same
 * account opens with the same charges on every build and `git diff dist/`
 * stays a review tool rather than noise.
 */
function txns(r: Row, seed: number): string {
  const g = rng(seed * 31 + 5);
  const n = 4 + Math.floor(g() * 3);
  /* The charges add up to the balance. A reader who opens a total does it to
     check the total, and four amounts that sum to two-thirds of the number they
     were opened from is the first thing they will find. The weights are drawn,
     then normalised; the balance is the constraint, not the average. */
  const w: number[] = [];
  for (let i = 0; i < n; i++) w.push(0.55 + g() * 0.9);
  const wt = w.reduce((a, x) => a + x, 0);
  const amt = w.map((x) => Math.round((r.v * x) / wt));
  amt[n - 1] = r.v - amt.slice(0, n - 1).reduce((a, x) => a + x, 0);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const v = amt[i] as number;
    const d = r.day.slice(0, 8) + String(1 + Math.floor(g() * 27)).padStart(2, "0");
    out.push(
      `<tr><td>${esc(d)}</td>` +
        `<td class="pay">${esc(PAYEE[Math.floor(g() * PAYEE.length)] as string)}</td>` +
        `<td class="acct" title="${esc(r.name)} &middot; ${esc(r.kind)}">` +
        `${esc(r.name.slice(0, 10).toUpperCase())}</td>` +
        `<td class="n">${usd(v)}</td></tr>`,
    );
  }
  /* Date order, because a ledger is read down a date column. The dates are drawn
     after the amounts and would otherwise arrive in the order the generator felt
     like, which is the one ordering no statement has ever used. */
  return out.sort().join("");
}

/**
 * Every row's panel, rendered once and hidden.
 *
 * The alternative is a payload of JSON and a templating pass in the browser,
 * which is a second renderer with a second set of escaping rules for the sake
 * of four tables. These are cheap; the script only has to decide which one is
 * not hidden. With scripting off the dialog never opens and the table below it
 * still says everything the page promised -- the inspector adds depth, it does
 * not hold the only copy.
 */
export function inspector(
  id: string,
  rows: readonly Row[],
  gname: Record<string, string>,
): string {
  const panels = rows
    .map(
      (r, i) =>
        `<div class="rp" data-row="${i}" hidden>` +
        `<h4>${esc(r.name)} &middot; ${esc(r.kind)}</h4>` +
        `<p class="sc">${esc(gname[r.group] ?? r.group)} &middot; last movement ` +
        `${esc(r.day)} &middot; balance ${usd(r.v)}</p>` +
        `<table><thead><tr><th>Date</th><th>Payee</th><th>Account</th>` +
        `<th class="n">Amount</th></tr></thead><tbody>${txns(r, i + 1)}</tbody></table>` +
        `<p class="sc"><button type="button" class="drop" data-edit="${i}">` +
        `${icon("pen-to-square")}Reassign this charge</button></p>` +
        `</div>`,
    )
    .join("");
  return (
    `<dialog class="rows" id="${esc(id)}"><form method="dialog" class="x">` +
    `<button value="close" aria-label="Close">${icon("xmark")}</button></form>` +
    panels +
    `</dialog>`
  );
}

/** The decision panel: two pickers, the line it would write, and a verdict. */
export function editor(
  id: string,
  groups: readonly string[],
  kinds: readonly string[],
): string {
  return (
    `<dialog class="rows move" id="${esc(id)}"><form method="dialog" class="x">` +
    `<button value="close" aria-label="Close">${icon("xmark")}</button></form>` +
    `<h4>Reassign this charge</h4>` +
    `<p class="sc" id="ed-what">&mdash;</p>` +
    `<div class="movef">` +
    pick("ed-pick-group", "ed-group", "Group", groups, groups[0] ?? "") +
    pick("ed-pick-kind", "ed-kind", "Kind", kinds, kinds[0] ?? "") +
    `</div>` +
    `<p class="sc">The rule is written against the payee, not this one row: a charge ` +
    `is filed by who took the money, and the next one from the same payee should land ` +
    `in the same place without a second visit here. Nothing changes upstream until the ` +
    `line below is pasted into the source.</p>` +
    `<textarea id="ed-patch" rows="3" readonly></textarea>` +
    `<div class="movea">` +
    `<button type="button" class="badge auto" id="ed-clear">` +
    `${icon("arrow-rotate-left")}Clear</button>` +
    `<button type="button" class="badge auto" id="ed-save">` +
    `${icon("circle-check")}Apply</button>` +
    `</div></dialog>`
  );
}
