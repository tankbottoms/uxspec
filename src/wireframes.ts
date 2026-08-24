/**
 * Blueprints.
 *
 * A wireframe here is deliberately monochrome -- ink and hairlines on paper-alt,
 * never a palette colour. The moment a diagram is coloured, the reader starts
 * reading the colour as meaning, and the page has spent one of its twelve
 * identity swatches on a drawing that identifies nothing. Two exceptions, both
 * annotations rather than content: a dimension line is drawn in `--stroke-aqua`
 * so it reads as measurement, and a callout for a thing being warned about is
 * drawn in `--stroke-coral`.
 *
 * Every drawing is one inline SVG with no `<style>` element in it. Presentation
 * attributes only. See the header of `spark.ts` for why.
 */
import { esc } from "./html.ts";

const INK = "var(--ink-soft)";
const HAIR = "var(--rule)";
const PAPER = "var(--paper)";
const ALT = "var(--paper-alt)";
const DIM = "var(--stroke-aqua)";
const WARN = "var(--stroke-coral)";
const MONO = "var(--font-mono)";

/** The frame every blueprint sits in. */
export function wf(inner: string, w: number, h: number, cls = ""): string {
  return `<div class="wf"><svg class="wfd ${esc(cls)}" viewBox="0 0 ${w} ${h}" width="100%" height="auto" role="img" aria-hidden="true">${inner}</svg></div>`;
}

export function box(
  x: number,
  y: number,
  w: number,
  h: number,
  o: { fill?: string; dash?: boolean; r?: number; stroke?: string } = {},
): string {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 3}" ` +
    `fill="${o.fill ?? PAPER}" stroke="${o.stroke ?? HAIR}"` +
    (o.dash ? ` stroke-dasharray="3 3"` : "") +
    `></rect>`
  );
}

/** A filled bar standing in for a line of text. Text in a wireframe is a lie:
 *  it invites the reader to evaluate the copy instead of the layout. */
export function textLine(x: number, y: number, w: number, h = 4): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${HAIR}"></rect>`;
}

export function lines(
  x: number,
  y: number,
  widths: readonly number[],
  gap = 8,
): string {
  return widths.map((w, i) => textLine(x, y + i * gap, w)).join("");
}

/**
 * SVG text is not HTML text.
 *
 * An `&mdash;` inside `<text>` is not decoded by the HTML parser the way it is in
 * a paragraph -- and `esc()` then turns the ampersand into `&amp;`, so the label
 * reads "&mdash;" literally. Every caption in this file writes the entity because
 * every caption in the rest of the codebase does; the substitution happens here,
 * once, rather than by asking each caller to remember which of the two worlds it
 * is writing for.
 */
const ENT: readonly [RegExp, string][] = [
  [/&mdash;/g, "\u2014"],
  [/&ndash;/g, "\u2013"],
  [/&times;/g, "\u00d7"],
  [/&minus;/g, "\u2212"],
  [/&middot;/g, "\u00b7"],
  [/&hellip;/g, "\u2026"],
];

function svgText(t: string): string {
  return esc(ENT.reduce((acc, [rx, ch]) => acc.replace(rx, ch), t));
}

export function label(
  x: number,
  y: number,
  t: string,
  o: { anchor?: string; size?: number; fill?: string } = {},
): string {
  return (
    `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "start"}" ` +
    `font-family="${MONO}" font-size="${o.size ?? 8.5}" fill="${
      o.fill ?? INK
    }">${svgText(t)}</text>`
  );
}

/** A measurement, with its number. A dimension without a number is decoration. */
export function dim(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: string,
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const vertical = x1 === x2;
  return (
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DIM}" stroke-width="0.8"></line>` +
    `<line x1="${x1 - (vertical ? 3 : 0)}" y1="${y1 - (vertical ? 0 : 3)}" x2="${
      x1 + (vertical ? 3 : 0)
    }" y2="${y1 + (vertical ? 0 : 3)}" stroke="${DIM}" stroke-width="0.8"></line>` +
    `<line x1="${x2 - (vertical ? 3 : 0)}" y1="${y2 - (vertical ? 0 : 3)}" x2="${
      x2 + (vertical ? 3 : 0)
    }" y2="${y2 + (vertical ? 0 : 3)}" stroke="${DIM}" stroke-width="0.8"></line>` +
    `<text x="${vertical ? mx + 5 : mx}" y="${vertical ? my + 3 : my - 4}" ` +
    `text-anchor="${vertical ? "start" : "middle"}" font-family="${MONO}" ` +
    `font-size="8" fill="${DIM}">${svgText(t)}</text>`
  );
}

/** A leader line to a callout. `bad: true` draws it in coral -- the only other
 *  colour allowed in a blueprint, reserved for the thing being warned about. */
export function callout(
  x: number,
  y: number,
  tx: number,
  ty: number,
  t: string,
  bad = false,
): string {
  const c = bad ? WARN : INK;
  return (
    `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${c}" stroke-width="0.7"></line>` +
    `<circle cx="${x}" cy="${y}" r="1.8" fill="${c}"></circle>` +
    `<text x="${tx + (tx > x ? 4 : -4)}" y="${ty + 3}" text-anchor="${
      tx > x ? "start" : "end"
    }" font-family="${MONO}" font-size="8" fill="${c}">${svgText(t)}</text>`
  );
}

/* ================================================================ drawings */

/** Where things go on a page, and in what order a reader meets them. */
export function pageSkeleton(): string {
  const g =
    box(0, 0, 620, 26, { fill: ALT }) +
    textLine(12, 11, 54) +
    textLine(78, 11, 30) +
    textLine(536, 11, 26) +
    textLine(572, 11, 36) +
    label(12, 40, "page-head") +
    lines(12, 48, [70, 210, 340]) +
    [0, 1, 2, 3].map((i) => box(12 + i * 152, 80, 140, 44, { fill: ALT })).join("") +
    label(12, 138, "tiles &mdash; the four numbers the page is about") +
    `<line x1="12" y1="150" x2="608" y2="150" stroke="${HAIR}"></line>` +
    label(12, 168, "1  section") +
    box(12, 176, 596, 62, { dash: true }) +
    lines(24, 192, [420, 380]) +
    box(24, 208, 300, 22, { fill: ALT }) +
    label(332, 222, "figure + caption") +
    `<line x1="12" y1="252" x2="608" y2="252" stroke="${HAIR}"></line>` +
    label(12, 270, "2  section") +
    box(12, 278, 596, 76, { dash: true }) +
    box(24, 292, 572, 50, { fill: ALT }) +
    label(30, 312, "table &mdash; caption above, scroll box around");
  return wf(g, 620, 366);
}

/** The badge, measured. Every number here is set once in `tokens.ts`. */
export function badgeAnatomy(): string {
  const y = 44;
  const g =
    box(60, y, 118, 15, { fill: "var(--pastel-mint)", stroke: "var(--stroke-mint)", r: 3 }) +
    label(66, y + 11, "Gnosis Safe", { size: 9, fill: "var(--stroke-mint)" }) +
    dim(60, y - 10, 178, y - 10, "17ch &mdash; from the scale") +
    dim(196, y, 196, y + 15, "15px") +
    callout(60, y + 15, 30, y + 40, "radius 3px, never a pill", false) +
    callout(178, y + 7, 300, y + 40, "content-box: padding does not widen it") +
    label(60, y + 74, "one width for the whole column, empty and error rows included") +
    box(60, y + 82, 118, 15, { fill: PAPER, dash: true }) +
    label(66, y + 93, "(empty)", { size: 9 }) +
    box(60, y + 104, 118, 15, { fill: "var(--pastel-coral)", stroke: "var(--stroke-coral)" }) +
    label(66, y + 115, "no data", { size: 9, fill: "var(--stroke-coral)" });
  return wf(g, 620, 190);
}

/** Why the rail is turned on its side, and what happens when a block is short. */
export function railAnatomy(): string {
  const rows = 5;
  const rh = 29;
  const top = 26;
  let g = label(0, 12, "a block of five rows offers 5 &times; 29 &minus; 36 = 109px of label");
  g += box(26, top, 26, rows * rh, { fill: ALT });
  g += `<text x="39" y="${top + rows * rh - 10}" transform="rotate(-90 39 ${
    top + rows * rh - 10
  })" font-family="${MONO}" font-size="8.5" fill="${INK}">Depository</text>`;
  g += `<circle cx="39" cy="${top + 12}" r="5" fill="none" stroke="${INK}"></circle>`;
  for (let i = 0; i < rows; i++) {
    g += box(52, top + i * rh, 300, rh, { fill: PAPER, r: 0 });
    g += textLine(62, top + i * rh + 12, 60);
    g += textLine(132, top + i * rh + 12, 110);
    g += textLine(268, top + i * rh + 12, 44);
  }
  g += dim(364, top, 364, top + rows * rh, `${rows} &times; 29px`);
  g += box(52, top + rows * rh, 300, rh, { fill: ALT, r: 0 });
  g += textLine(62, top + rows * rh + 12, 44);
  g += callout(352, top + rows * rh + 14, 470, top + rows * rh + 14, "subtotal: no data-g");
  g += label(0, top + rows * rh + 52, "a block of one row cannot hold the name; the glyph carries it");
  g += box(26, top + rows * rh + 62, 26, rh, { fill: ALT });
  g += `<circle cx="39" cy="${top + rows * rh + 76}" r="5" fill="none" stroke="${INK}"></circle>`;
  g += box(52, top + rows * rh + 62, 300, rh, { fill: PAPER, r: 0 });
  g += textLine(62, top + rows * rh + 74, 78);
  g += callout(52, top + rows * rh + 76, 400, top + rows * rh + 76, "full name on title=");
  return wf(g, 620, top + rows * rh + 112);
}

/** A table's parts, named. The caption is above; the scroll box is around. */
export function tableAnatomy(): string {
  const g =
    box(0, 14, 560, 130, { dash: true }) +
    label(566, 22, "div.scroll", { anchor: "start" }) +
    label(8, 10, "caption &mdash; Table 3 &middot; what this counts") +
    box(8, 24, 544, 20, { fill: ALT }) +
    textLine(16, 32, 40) +
    textLine(120, 32, 52) +
    textLine(300, 32, 34) +
    textLine(470, 32, 28) +
    label(556, 38, "thead", { anchor: "end", fill: HAIR }) +
    [0, 1, 2].map((i) => box(8, 44 + i * 26, 544, 26, { fill: PAPER, r: 0 })).join("") +
    [0, 1, 2]
      .map(
        (i) =>
          textLine(16, 56 + i * 26, 60) +
          textLine(120, 56 + i * 26, 96) +
          textLine(300, 56 + i * 26, 40) +
          textLine(470, 56 + i * 26, 52),
      )
      .join("") +
    box(8, 122, 544, 22, { fill: ALT, r: 0 }) +
    textLine(16, 131, 46) +
    textLine(470, 131, 52) +
    label(556, 138, "tfoot &mdash; pinned under sort", { anchor: "end", fill: HAIR }) +
    callout(300, 44, 300, 168, "numeric columns: right, tabular figures");
  return wf(g, 620, 180);
}

/** The three overlay depths, and which one a thing belongs in. */
export function overlayAnatomy(): string {
  const g =
    box(0, 16, 190, 96, { fill: PAPER }) +
    label(8, 30, "tip") +
    lines(8, 38, [120, 150, 96]) +
    label(8, 84, "11px &middot; one fact", { fill: HAIR }) +
    label(8, 100, "checkbox &middot; works JS-off", { fill: HAIR }) +
    box(214, 16, 190, 96, { fill: PAPER }) +
    label(222, 30, "receipt sheet") +
    lines(222, 38, [150, 150, 110]) +
    label(222, 84, "9.5px table &middot; the rows behind a number", { fill: HAIR, size: 7.5 }) +
    box(428, 16, 190, 96, { fill: PAPER }) +
    label(436, 30, "dialog") +
    lines(436, 38, [160, 130, 150]) +
    label(436, 84, "13.5px head &middot; the only one with a shadow", { fill: HAIR, size: 7.5 }) +
    label(0, 132, "overlay type is one step below the page, never above it: 13.5 / 11 / 9.5, floor 9px");
  return wf(g, 620, 146);
}

/** What a spark is allowed to claim, and what it is not. */
export function chartAnatomy(): string {
  const pts = [22, 18, 26, 14, 30, 24, 34, 28, 40, 32, 44, 38];
  const path = pts
    .map((v, i) => `${i ? "L" : "M"}${40 + i * 26} ${86 - v}`)
    .join(" ");
  const g =
    label(0, 12, "spark &mdash; shape only. Scaled to its own range, so it cannot be compared to its neighbour.") +
    box(36, 24, 330, 66, { fill: ALT }) +
    `<path d="${path}" fill="none" stroke="${INK}" stroke-width="1.4"></path>` +
    dim(376, 24, 376, 90, "34px") +
    callout(40, 64, 20, 118, "no y-axis, so no absolute reading", true) +
    label(400, 44, "range printed", { fill: HAIR }) +
    label(400, 58, "beside the name", { fill: HAIR }) +
    label(0, 138, "chart &mdash; gridded and labelled. The maximum is printed; a bar chart without it is a ranking.") +
    box(36, 150, 330, 76, { fill: ALT }) +
    [0, 1, 2]
      .map((i) => `<line x1="36" y1="${162 + i * 24}" x2="366" y2="${162 + i * 24}" stroke="${HAIR}"></line>`)
      .join("") +
    [40, 92, 144, 196, 248, 300]
      .map((x, i) => box(x, 226 - (14 + i * 9), 34, 14 + i * 9, { fill: PAPER, r: 0 }))
      .join("") +
    callout(36, 226, 400, 214, "zero baseline drawn even when nothing is negative");
  return wf(g, 620, 244);
}

/** The four-step spacing rhythm, so nobody invents a fifth. */
export function spacingRuler(): string {
  const steps = [4, 8, 12, 20, 32];
  let x = 20;
  let g = label(0, 12, "vertical rhythm &mdash; five steps, and no others");
  for (const s of steps) {
    g += box(x, 26, s * 3, 22, { fill: ALT });
    g += label(x + s * 1.5, 62, `${s}px`, { anchor: "middle", fill: DIM });
    x += s * 3 + 18;
  }
  g += label(0, 88, "a gap that is not on this list is a gap somebody eyeballed");
  return wf(g, 620, 100);
}
