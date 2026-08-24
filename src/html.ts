// Formatting and the popover primitive. Every number on the page goes through one of
// these so a stray raw float can never reach the reader.

import { icon } from "./icons.ts";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function usd(v: number): string {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function usd0(v: number): string {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(v)).toLocaleString("en-US")}`;
}

export function eth(v: number, dp = 4): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

// Positive is green, negative is red, and zero is neither - the class is chosen from
// the sign rather than from whether the caller remembered to pass one.
export function sign(v: number): string {
  return v > 0 ? "pos" : v < 0 ? "neg" : "dim";
}

let tipSeq = 0;

// A label you can tap. The long explanation lives in the popover, so the line it sits
// on never has to wrap to fit it. Checkbox-driven: no script, works offline, works on
// a phone, and prints expanded.
export function tip(label: string, body: string, alignRight = false): string {
  tipSeq += 1;
  const id = `t${tipSeq}`;
  return `<span class="tip${alignRight ? " rt" : ""}"><input type="checkbox" id="${id}"><label for="${id}">${label}</label><span class="body">${body}</span></span>`;
}

/**
 * The same popover, marked with a glyph instead of an underlined phrase.
 *
 * A badge or a table cell has one line and no room to explain itself. The usual
 * repairs are both bad: let the cell wrap, and one long value sets the height of
 * every row beside it; truncate it, and the reader is told there is more without
 * being told what. A circle-i sits after the value at a fixed 10px, costs the
 * column nothing, and holds as many lines as the fact needs -- so the default
 * reading stays one concise line and the detail is one hover or tap away.
 *
 * Right-align it when the mark is near the right edge of a table, or the panel
 * opens off the page.
 */
export function tipMark(body: string, o: { rt?: boolean; label?: string } = {}): string {
  tipSeq += 1;
  const id = `t${tipSeq}`;
  return (
    `<span class="tip mk${o.rt ? " rt" : ""}"><input type="checkbox" id="${id}">` +
    `<label for="${id}" aria-label="${o.label ?? "Details"}">${icon("circle-info")}</label>` +
    `<span class="body">${body}</span></span>`
  );
}

let rcptSeq = 0;

/**
 * A hyperlinked count that opens the underlying transactions in a sheet.
 *
 * Rows on this page are aggregates - a year of sales, a month of rewards - and the
 * question a reader always asks next is "which ones". Rather than pushing every
 * disposal into the parent table or hiding them in a separate file, the count itself
 * is the handle. Same checkbox mechanism as `tip`: no script, works offline, prints
 * expanded, and a tap opens it on a phone.
 */
export function receipts(label: string, title: string, head: string[], rows: string[], badgeW = ""): string {
  // `badgeW` turns the control into a badge-shaped affordance rather than a dotted
  // link. A count sitting in a column of badges has to be a badge too, or the
  // column reads as two different kinds of thing.
  // `badgeW` is the width (and any colour) the caller's column needs; the badge
  // contract in DESIGN.md requires it to name one, so an empty string is not a badge.
  const face = badgeW === "" ? esc(label) : `<span class="badge ${badgeW}">${esc(label)}</span>`;
  if (rows.length === 0) return face;
  rcptSeq += 1;
  const id = `r${rcptSeq}`;
  const ths = head.map((h) => `<th${h.startsWith("#") ? ' class="r"' : ""}>${esc(h.replace(/^#/, ""))}</th>`).join("");
  return (
    `<span class="rcpt"><input type="checkbox" id="${id}"><label class="${badgeW === "" ? "tx" : "bdg"}" for="${id}">${face}</label>` +
    `<span class="sheet"><label class="scrim" for="${id}"></label><span class="sheet-in">` +
    `<span class="sheet-hd"><span class="nm">${esc(title)}</span><label class="cl" for="${id}">close &times;</label></span>` +
    `<div class="scroll" style="border:0;border-radius:0"><table><thead><tr>${ths}</tr></thead><tbody>${rows.join("")}</tbody></table></div>` +
    `</span></span></span>`
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/**
 * A date short enough to sit in a table row, with the long form on hover.
 *
 * Tables on this page carry a date on nearly every row, and a full ISO date in a
 * monospace cell is wide enough to force the numeric columns beside it to scroll.
 * The row therefore shows `6 Jan 24` and the hover carries the weekday, the full
 * date and whatever else the caller passes - the exact block time for an on-chain
 * row, the close window for a price.
 */
export function day(iso: string, extra = ""): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const mon = MONTHS[d.getUTCMonth()] ?? "";
  const wd = WEEKDAYS[d.getUTCDay()] ?? "";
  const short = `${d.getUTCDate()} ${mon} ${String(d.getUTCFullYear()).slice(2)}`;
  const long = `${wd}, ${d.getUTCDate()} ${mon} ${d.getUTCFullYear()}`;
  return `<span class="dt">${esc(short)}<span class="dt-full">${esc(long)}<span class="iso">${esc(iso)}</span>${extra === "" ? "" : `<span class="x">${esc(extra)}</span>`}</span></span>`;
}

/* ------------------------------------------------------------------ badges */
/** The steps of the badge width scale in tokens.ts, in characters. */
const WSTEPS = [3, 5, 7, 9, 11, 12, 14, 17, 19, 23, 25, 30, 34, 38, 42] as const;

/**
 * The width class for a whole column of badges.
 *
 * The badge contract in tokens.ts says a badge takes its width from the scale
 * and never from its own text, which only lines a column up if every badge in
 * it is given the *same* step. Choosing that step by hand is how a column goes
 * ragged later: a new value appears, it is one character longer than the step
 * somebody eyeballed a year ago, and it renders clipped. Passing every label
 * the column can hold means the step is derived from the data on each build.
 *
 * `pad` covers a badge that also carries an icon - the glyph and its gap are
 * about two characters of mono at this size, and they are not in the string.
 */
export function wcls(labels: readonly string[], pad = 0): string {
  const n = labels.reduce((m, s) => Math.max(m, s.length), 0) + pad;
  // Falling back to a mid-scale step silently clips: the 42-character account name
  // asked for a width the scale did not have and got 25ch. Fall back to the widest.
  return `w${WSTEPS.find((w) => w >= n) ?? WSTEPS[WSTEPS.length - 1]}`;
}
