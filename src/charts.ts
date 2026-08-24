import { esc, eth, usd0 } from "./html.ts";
import type { Point } from "./types.ts";

/**
 * One slice of a stacked bar. `caption` is what fits inside the slice - a word, at
 * most two - and `tip` is the HTML that appears on hover. Everything that does not
 * render cleanly at slice width belongs in `tip`, not in `caption`.
 */
/**
 * `glyph` is pre-rendered SVG, not a name: charts has no icon table of its own and
 * the caller already knows which mark belongs to the thing it is drawing. It is the
 * one field here that is inserted unescaped, so it must never carry user text.
 */
export type Seg = {
  label: string; qty: number; fill: string; stroke: string; caption: string;
  tip: string; glyph?: string;
};

/**
 * Figures are numbered in the order they are built, which is the order they are
 * emitted, so the counter lives here rather than being threaded through every
 * call site. Tables number from the same sequence - a reader following a
 * cross-reference should not have to know whether "Fig. 3" is a chart or a
 * table before they can find it.
 */
let figSeq = 0;
export function nextFig(): string {
  figSeq += 1;
  return `Fig. ${figSeq}`;
}

/**
 * Restart the numbering at the top of each page.
 *
 * `figSeq` is module state and the build renders every page in one process, so
 * without this the second page starts at whatever number the first one finished on,
 * and its captions cite figures that are not on it.
 */
export function resetFig(): void {
  figSeq = 0;
}

/**
 * One stacked bar, width proportional to quantity.
 *
 * Captions are dropped from slivers rather than shrunk, because a 1% slice cannot
 * hold text at any size. The hover panel carries the full detail for every slice
 * including the ones too narrow to label, and it is a styled element rather than a
 * `title` attribute so it can hold several lines on the page's own paper colour.
 */
export function stackedBar(segs: Seg[]): string {
  const total = segs.reduce((t, s) => t + s.qty, 0);
  if (total <= 0) return "";
  const last = segs.length - 1;
  const parts = segs.map((s, i) => {
    const share = s.qty / total;
    // A sliver cannot hold "$412/mo" at any size, but it can hold a 10px mark, and a
    // mark is enough to tie the slice back to its legend row without a hover.
    const g = s.glyph ?? "";
    const cap = share > 0.055
      ? `<span class="cap">${g}${esc(s.caption)}</span>`
      : (g === "" ? "" : `<span class="cap gonly">${g}</span>`);
    // The final slices are the narrowest on both of this page's bars, so their panel
    // is pinned to the right edge instead of centred on a slice too thin to centre on.
    const side = i > last - 2 ? " rt" : "";
    return (
      `<div class="seg" style="flex:0 0 ${(share * 100).toFixed(4)}%;background:${s.fill};box-shadow:inset 0 0 0 1px ${s.stroke}">` +
      `${cap}<span class="seg-tip${side}"><span class="t">${esc(s.label)}</span>${s.tip}</span></div>`
    );
  });
  return `<div class="bar">${parts.join("")}</div>`;
}

export function legend(segs: Seg[]): string {
  const items = segs.map(
    (s) =>
      `<span><span class="sw" style="background:${s.fill};border-color:${s.stroke}"></span>` +
      `${s.glyph ?? ""}${esc(s.label)}</span>`,
  );
  return `<div class="legend">${items.join("")}</div>`;
}

/**
 * Bar, then a gap, then the legend, then the numbered caption. The order is
 * deliberate: the legend belongs to the bar and sits against it, the caption
 * belongs to the figure as a whole and sits below a hairline. Callers pass the
 * caption text only - the figure number is assigned here so it can never drift
 * out of sequence with the rest of the page.
 */
export function figure(segs: Seg[], caption: string, scope: string): string {
  const n = nextFig();
  return (
    `<figure>${stackedBar(segs)}${legend(segs)}` +
    `<figcaption><span class="fig">${n}</span>${caption}` +
    `<span class="scope">${esc(scope)}</span></figcaption></figure>`
  );
}

// A signed magnitude bar: losses run left of the centre line, gains right of it, both
// scaled against the largest absolute value on the page so years stay comparable.
export function ppBar(value: number, scale: number): string {
  const share = Math.min(1, Math.abs(value) / scale) * 50;
  const fill = value >= 0 ? "var(--pastel-green)" : "var(--pastel-coral)";
  const stroke = value >= 0 ? "var(--stroke-green)" : "var(--stroke-coral)";
  const left = value >= 0 ? 50 : 50 - share;
  return (
    `<span style="position:relative;display:block;height:12px;background:var(--paper-alt);` +
    `border:1px solid var(--rule);border-radius:var(--radius-sm);overflow:hidden">` +
    `<span style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--ink-soft)"></span>` +
    `<span style="position:absolute;left:${left}%;width:${share}%;top:0;bottom:0;` +
    `background:${fill};box-shadow:inset 0 0 0 1px ${stroke}"></span></span>`
  );
}

/**
 * A sparkline: one series, no axes, no gridlines, sized to sit inside a table cell
 * or beside a stat. The value range is normalised to the series' own min and max,
 * so the shape is readable even when the absolute numbers are large - the label
 * beside it carries the magnitude.
 *
 * Rendered as inline SVG rather than a canvas or a library so it survives being
 * printed, emailed as a single file, and read with no network at all.
 */
export function sparkline(pts: Point[], fill: string, stroke: string, w = 220, h = 34): string {
  if (pts.length < 2) return "";
  const vs = pts.map((p) => p.v);
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  const span = hi - lo || 1;
  const x = (i: number): number => (i / (pts.length - 1)) * (w - 2) + 1;
  const y = (v: number): number => h - 2 - ((v - lo) / span) * (h - 4);
  const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area = `${x(0).toFixed(1)},${(h - 1).toFixed(1)} ${line} ${x(pts.length - 1).toFixed(1)},${(h - 1).toFixed(1)}`;
  const last = pts[pts.length - 1];
  // SAFETY: pts.length >= 2 was checked above, so the last element exists.
  const lastV = (last as Point).v;
  return (
    `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none" role="img">` +
    `<polygon points="${area}" fill="${fill}" opacity=".55"></polygon>` +
    `<polyline points="${line}" fill="none" stroke="${stroke}" stroke-width="1.25" stroke-linejoin="round"></polyline>` +
    `<circle cx="${x(pts.length - 1).toFixed(1)}" cy="${y(lastV).toFixed(1)}" r="1.9" fill="${stroke}"></circle>` +
    `</svg>`
  );
}

/**
 * A wide sparkline with a crosshair, a moving readout, and the series' first,
 * lowest, highest and last readings spelled out beneath it.
 *
 * The readings are the point; the line only shows the path between them. The
 * crosshair exists because the previous version put each day into an SVG `title`
 * element, which meant a second of hover, one line of text, and the browser's own
 * tooltip chrome in a page that otherwise renders its own. The series is handed to
 * the page as two attributes and the arithmetic is done in the browser, which is
 * far smaller than emitting a positioned panel per day.
 */
export function sparkFigure(pts: Point[], fill: string, stroke: string, caption: string, scope: string, kind: "usd" | "eth"): string {
  if (pts.length < 2) return "";
  const fmt = kind === "usd" ? usd0 : (v: number) => `${eth(v, 1)} ETH`;
  const vs = pts.map((p) => p.v);
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  // SAFETY: pts.length >= 2 was checked on entry, so both ends exist.
  const first = pts[0] as Point;
  // SAFETY: same length check; the final index is in range.
  const last = pts[pts.length - 1] as Point;
  const n = nextFig();
  const stat = (k: string, v: string, d: string): string =>
    `<span><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span><span class="d">${esc(dmy(d))}</span></span>`;
  return (
    `<figure class="sparkfig"${seriesData(pts, kind, 1200, 92)}>` +
    `${sparkline(pts, fill, stroke, 1200, 92)}${crosshair(stroke)}` +
    `<div class="sparkstats">${stat("First", fmt(first.v), first.day)}${stat("Low", fmt(lo), pts[vs.indexOf(lo)]?.day ?? "")}` +
    `${stat("High", fmt(hi), pts[vs.indexOf(hi)]?.day ?? "")}${stat("Last", fmt(last.v), last.day)}</div>` +
    `<figcaption><span class="fig">${n}</span>${caption}` +
    `<span class="scope">${esc(scope)}</span></figcaption></figure>`
  );
}

/**
 * One panel per wallet instead of one line for their sum.
 *
 * Summing them hid the only thing the picture is for. The Safe sits at a flat
 * thousand ETH for two years while the working wallets empty and refill every
 * month; added together, the second behaviour disappears inside the first. Each
 * panel is scaled to its own range, so the shapes are comparable even though the
 * quantities are three orders of magnitude apart - the range is printed beside
 * each name so nobody reads the shapes as quantities.
 */
export function multiSpark(
  series: Array<{ wallet: string; pts: Point[]; fill: string; stroke: string }>,
  caption: string,
  scope: string,
): string {
  const n = nextFig();
  const cells = series
    .filter((w) => w.pts.length >= 2)
    .map((w) => {
      const vs = w.pts.map((p) => p.v);
      const lo = Math.min(...vs);
      const hi = Math.max(...vs);
      return (
        `<div class="cell sparkfig"${seriesData(w.pts, "eth", 300, 46)}>` +
        `<div class="hd"><span class="nm">${esc(w.wallet)}</span>` +
        `<span class="rg">${esc(eth(lo, 1))} &ndash; ${esc(eth(hi, 1))} ETH</span></div>` +
        `${sparkline(w.pts, w.fill, w.stroke, 300, 46)}${crosshair(w.stroke)}</div>`
      );
    });
  return (
    `<figure><div class="multi">${cells.join("")}</div>` +
    `<figcaption><span class="fig">${n}</span>${caption}` +
    `<span class="scope">${esc(scope)}</span></figcaption></figure>`
  );
}

/** The crosshair rule, the point marker, and the panel the browser writes into. */
function crosshair(stroke: string): string {
  return (
    `<span class="xhair"><i class="rule"></i><i class="dot" style="background:${stroke}"></i></span>` +
    `<div class="readout"><span class="d"></span><dl class="kv"></dl></div>`
  );
}

/**
 * The series, handed to the browser as two attributes.
 *
 * Dates and values only: the geometry is recomputed on the client from the same
 * normalisation `sparkline` uses, which keeps the payload to about eleven bytes a
 * day rather than emitting a positioned element per reading.
 */
function seriesData(pts: Point[], kind: "usd" | "eth", w: number, h: number): string {
  const days = pts.map((p) => p.day).join(",");
  const vals = pts.map((p) => (Math.round(p.v * 100) / 100).toString()).join(",");
  return ` data-d="${esc(days)}" data-v="${esc(vals)}" data-k="${kind}" data-w="${w}" data-h="${h}"`;
}

const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** `2025-08-13` as `13 Aug 2025`. Day, month, year, everywhere on the page. */
export function dmy(iso: string): string {
  const [y = "", m = "", d = ""] = iso.split("-");
  const mon = M[Number(m) - 1];
  if (mon === undefined) return iso;
  return `${Number(d)} ${mon} ${y}`;
}
