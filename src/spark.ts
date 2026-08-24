/**
 * The chart vocabulary, past the sparkline.
 *
 * Two rules govern every function here and neither is negotiable.
 *
 * 1. No `<style>` element inside an inline SVG unless every selector in it is
 *    prefixed with the chart's own class. An inline SVG is part of the document,
 *    so its `<style>` is document-global: a bare `.dl{font-style:italic}` written
 *    for a chart's download link once italicised an unrelated `a.dl` elsewhere on
 *    the page, and a partial override made it look like the chart was fine. These
 *    functions avoid the trap by not emitting `<style>` at all -- colour and
 *    stroke ride on presentation attributes carrying `var(--token)` values.
 *
 * 2. Colour arrives as a `var(--token)` string from `palette.ts`. A literal hex
 *    in this file is a lint warning and a design bug: it means a colour exists
 *    that no badge can wear, so the chart and its legend can never agree.
 *
 * Geometry is computed in the renderer rather than left to CSS so the picture is
 * identical with scripting off, which is the state every page here is checked in.
 */
import { esc } from "./html.ts";
import { nextFig } from "./charts.ts";
import type { Point, Tone } from "./types.ts";

const round = (n: number) => Math.round(n * 100) / 100;

/** Wrap any drawing in the standard numbered figure. */
export function fig(inner: string, caption: string, scope = ""): string {
  const n = nextFig();
  return (
    `<figure>${inner}<figcaption><span class="fig">${n}</span>${caption}` +
    (scope ? `<span class="scope">${esc(scope)}</span>` : "") +
    `</figcaption></figure>`
  );
}

/* ---------------------------------------------------------------- meters */

/**
 * One value against a full width. Width is an inline style because it is the
 * datum; colour is a class because it is design. That split is the whole rule --
 * an inline `background` here would be a build error, and correctly so.
 */
export function meter(pct: number, tone: string, tall = false): string {
  const w = Math.max(0, Math.min(100, pct));
  return `<div class="meter${tall ? " tall" : ""}"><i class="${esc(
    tone,
  )}" style="width:${round(w)}%"></i></div>`;
}

export function meterRow(label: string, value: string, pct: number, tone: string): string {
  return `<div class="meter-row"><div><div class="lb">${esc(
    label,
  )}</div>${meter(pct, tone)}</div><div class="vl">${esc(value)}</div></div>`;
}

/** A stack of labelled bars sharing one scale. The scale is printed, because a
 *  bar chart without its maximum is a ranking pretending to be a measurement. */
export function hbars(
  rows: readonly { label: string; v: number; tone: string; disp?: string }[],
): string {
  const max = Math.max(...rows.map((r) => r.v), 1);
  return `<div class="hbars">${rows
    .map((r) =>
      meterRow(r.label, r.disp ?? String(r.v), (r.v / max) * 100, r.tone),
    )
    .join("")}</div>`;
}

/* ----------------------------------------------------------------- donut */

/**
 * A ring, drawn with one circle per slice and `stroke-dasharray` -- no arc path
 * arithmetic, so there is no large-arc-flag bug waiting at 50%.
 *
 * Five slices is the ceiling. Past that the labels stop fitting and the reader is
 * comparing angles, which people do badly; use `hbars` and let them compare
 * lengths, which people do well.
 */
export function donut(
  slices: readonly { label: string; v: number; fill: string; stroke: string }[],
  o: { size?: number; centre?: string; sub?: string } = {},
): string {
  const size = o.size ?? 132;
  const r = size / 2 - 13;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.v, 0) || 1;
  let off = 0;
  const rings = slices
    .map((s) => {
      const len = (s.v / total) * c;
      const el =
        `<circle cx="${size / 2}" cy="${size / 2}" r="${round(r)}" fill="none" ` +
        `stroke="${s.fill}" stroke-width="15" ` +
        `stroke-dasharray="${round(len)} ${round(c - len)}" ` +
        `stroke-dashoffset="${round(-off)}"></circle>` +
        `<circle cx="${size / 2}" cy="${size / 2}" r="${round(r)}" fill="none" ` +
        `stroke="${s.stroke}" stroke-width="15" stroke-opacity="0.34" ` +
        `stroke-dasharray="${round(len)} ${round(c - len)}" ` +
        `stroke-dashoffset="${round(-off)}"><title>${esc(s.label)}</title></circle>`;
      off += len;
      return el;
    })
    .join("");
  const mid = o.centre
    ? `<text x="${size / 2}" y="${size / 2 - 1}" text-anchor="middle" ` +
      `font-family="var(--font-mono)" font-size="13" fill="var(--ink)">${esc(o.centre)}</text>` +
      (o.sub
        ? `<text x="${size / 2}" y="${size / 2 + 12}" text-anchor="middle" ` +
          `font-size="8.5" fill="var(--ink-muted)">${esc(o.sub)}</text>`
        : "")
    : "";
  // The quarter-turn goes on an inner <g>, never on the <svg> element: a
  // transform on the root is ignored in an HTML document, and the centre text
  // must not turn with the ring in any case.
  return (
    `<svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">` +
    `<g transform="rotate(-90 ${size / 2} ${size / 2})">${rings}</g>${mid}</svg>`
  );
}

/* ---------------------------------------------------------------- bullet */

/**
 * Actual against target, on one line. The target is a rule, not a second bar --
 * two bars invite the reader to compare them to each other rather than to the
 * scale, which is the one comparison a bullet exists to prevent.
 */
export function bullet(
  o: { label: string; v: number; target: number; max: number; t: Tone; disp: string },
): string {
  const w = 240;
  const h = 15;
  const x = (n: number) => round((Math.max(0, Math.min(n, o.max)) / o.max) * w);
  return (
    `<div class="meter-row"><div><div class="lb">${esc(o.label)}</div>` +
    `<svg class="bullet" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" role="img">` +
    `<rect x="0" y="0" width="${w}" height="${h}" fill="var(--paper-alt)" stroke="var(--rule)"></rect>` +
    `<rect x="0" y="0" width="${x(o.v)}" height="${h}" fill="${o.t.fill}" stroke="${o.t.stroke}" stroke-opacity="0.5"></rect>` +
    `<line x1="${x(o.target)}" y1="0" x2="${x(o.target)}" y2="${h}" stroke="var(--ink)" stroke-width="1.5"><title>target</title></line>` +
    `</svg></div><div class="vl">${esc(o.disp)}</div></div>`
  );
}

/* ------------------------------------------------------------------ heat */

/** A calendar band: one cell a day, tone by bucket. Buckets, not a gradient --
 *  a continuous ramp asks the eye to read an absolute value out of a shade,
 *  which it cannot do without the legend it is trying to replace. */
export function heat(
  days: readonly { day: string; bucket: number }[],
  ramp: readonly string[],
): string {
  const cell = 9;
  const gap = 2;
  const rows = 7;
  const cols = Math.ceil(days.length / rows);
  const cells = days
    .map((d, i) => {
      const x = Math.floor(i / rows) * (cell + gap);
      const y = (i % rows) * (cell + gap);
      const t = ramp[Math.min(d.bucket, ramp.length - 1)] ?? "var(--paper-alt)";
      return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="1" fill="${t}" stroke="var(--rule-soft)"><title>${esc(
        d.day,
      )}</title></rect>`;
    })
    .join("");
  return `<svg class="heat" viewBox="0 0 ${cols * (cell + gap)} ${
    rows * (cell + gap)
  }" width="100%" height="${rows * (cell + gap)}" role="img">${cells}</svg>`;
}

/* -------------------------------------------------------------- timeline */

/** Events on a shared axis. Overlapping labels are dropped rather than rotated:
 *  a rotated date on a horizontal axis costs more to read than it delivers. */
export function timeline(
  events: readonly { day: string; label: string; t: Tone }[],
  o: { from: string; to: string },
): string {
  const w = 620;
  const h = 44;
  const t0 = Date.parse(o.from);
  const t1 = Date.parse(o.to) || t0 + 1;
  const x = (d: string) => round(((Date.parse(d) - t0) / (t1 - t0)) * (w - 20) + 10);
  let lastLabel = -99;
  const marks = events
    .map((e) => {
      const px = x(e.day);
      const show = px - lastLabel > 52;
      if (show) lastLabel = px;
      return (
        `<line x1="${px}" y1="14" x2="${px}" y2="26" stroke="${e.t.fill}" stroke-width="3"></line>` +
        `<circle cx="${px}" cy="20" r="3.2" fill="${e.t.fill}" stroke="${e.t.stroke}"><title>${esc(e.day)} ${esc(
          e.label,
        )}</title></circle>` +
        (show
          ? `<text x="${px}" y="38" text-anchor="middle" font-size="8" fill="var(--ink-muted)">${esc(
              e.label,
            )}</text>`
          : "")
      );
    })
    .join("");
  return (
    `<svg class="tline" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img">` +
    `<line x1="10" y1="20" x2="${w - 10}" y2="20" stroke="var(--rule)"></line>${marks}</svg>`
  );
}

/* ------------------------------------------------------------- xy charts */

function axes(w: number, h: number, pad: number, ticks: readonly string[]): string {
  const g = ticks
    .map((t, i) => {
      const y = pad + ((h - pad * 2) * i) / Math.max(ticks.length - 1, 1);
      return (
        `<line x1="${pad}" y1="${round(y)}" x2="${w - 6}" y2="${round(
          y,
        )}" stroke="var(--rule-soft)"></line>` +
        `<text x="${pad - 4}" y="${round(y) + 3}" text-anchor="end" font-size="8" ` +
        `font-family="var(--font-mono)" fill="var(--ink-muted)">${esc(t)}</text>`
      );
    })
    .join("");
  return g;
}

/** A line with a filled area under it, gridded and labelled. Same normalisation
 *  as `sparkline()` so a spark and its full-size sibling never disagree. */
export function lineChart(
  pts: readonly Point[],
  fill: string,
  stroke: string,
  o: { w?: number; h?: number; ticks?: readonly string[] } = {},
): string {
  const w = o.w ?? 620;
  const h = o.h ?? 150;
  const pad = 34;
  if (pts.length < 2) return "";
  const vs = pts.map((p) => p.v);
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  const span = hi - lo || 1;
  const px = (i: number) => round(pad + ((w - pad - 6) * i) / (pts.length - 1));
  const py = (v: number) => round(h - pad / 2 - ((v - lo) / span) * (h - pad * 1.2));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${px(i)} ${py(p.v)}`).join(" ");
  const area = `${d} L${px(pts.length - 1)} ${h - pad / 2} L${px(0)} ${h - pad / 2} Z`;
  return (
    `<svg class="lchart" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img">` +
    axes(w, h, pad / 2, o.ticks ?? []) +
    `<path d="${area}" fill="${fill}" fill-opacity="0.55"></path>` +
    `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1.5" ` +
    `stroke-linejoin="round" stroke-linecap="round"></path></svg>`
  );
}

/** Vertical bars on a zero baseline. The baseline is drawn even when nothing is
 *  negative, so a chart that later grows a negative bar does not change shape. */
export function barChart(
  bars: readonly { label: string; v: number; t: Tone }[],
  o: { w?: number; h?: number } = {},
): string {
  const w = o.w ?? 620;
  const h = o.h ?? 130;
  const pad = 22;
  const max = Math.max(...bars.map((b) => Math.abs(b.v)), 1);
  const bw = (w - pad * 2) / Math.max(bars.length, 1);
  const zero = h - pad;
  const body = bars
    .map((b, i) => {
      const bh = round((Math.abs(b.v) / max) * (h - pad * 1.6));
      const x = round(pad + i * bw + bw * 0.16);
      const y = b.v >= 0 ? zero - bh : zero;
      return (
        `<rect x="${x}" y="${round(y)}" width="${round(bw * 0.68)}" height="${bh}" ` +
        `fill="${b.t.fill}" stroke="${b.t.stroke}"><title>${esc(b.label)}</title></rect>` +
        `<text x="${round(x + bw * 0.34)}" y="${h - 6}" text-anchor="middle" ` +
        `font-size="8" fill="var(--ink-muted)">${esc(b.label)}</text>`
      );
    })
    .join("");
  return (
    `<svg class="bchart" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img">` +
    `<line x1="${pad}" y1="${zero}" x2="${w - pad}" y2="${zero}" stroke="var(--rule)"></line>` +
    `${body}</svg>`
  );
}

/** Points, and the least-squares line through them. The line is drawn thin and
 *  in ink, never in a palette colour: it is a claim about the data, not one of
 *  the entities, and colouring it makes it look like a series. */
export function scatterChart(
  pts: readonly { x: number; y: number; t: Tone; label?: string }[],
  o: { w?: number; h?: number; fitLine?: boolean } = {},
): string {
  const w = o.w ?? 620;
  const h = o.h ?? 170;
  const pad = 26;
  if (!pts.length) return "";
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs) || x0 + 1;
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys) || y0 + 1;
  const sx = (v: number) => round(pad + ((v - x0) / (x1 - x0 || 1)) * (w - pad * 1.4));
  const sy = (v: number) => round(h - pad - ((v - y0) / (y1 - y0 || 1)) * (h - pad * 1.7));
  const dots = pts
    .map(
      (p) =>
        `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="3.4" fill="${p.t.fill}" stroke="${p.t.stroke}">${
          p.label ? `<title>${esc(p.label)}</title>` : ""
        }</circle>`,
    )
    .join("");
  let line = "";
  if (o.fitLine !== false && pts.length > 2) {
    const n = pts.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (const p of pts) {
      num += (p.x - mx) * (p.y - my);
      den += (p.x - mx) ** 2;
    }
    const m = den ? num / den : 0;
    const b = my - m * mx;
    line =
      `<line x1="${sx(x0)}" y1="${sy(m * x0 + b)}" x2="${sx(x1)}" y2="${sy(
        m * x1 + b,
      )}" stroke="var(--ink-muted)" stroke-width="1" stroke-dasharray="3 3"></line>`;
  }
  return (
    `<svg class="schart" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img">` +
    `<line x1="${pad}" y1="${h - pad}" x2="${w - 8}" y2="${h - pad}" stroke="var(--rule)"></line>` +
    `<line x1="${pad}" y1="8" x2="${pad}" y2="${h - pad}" stroke="var(--rule)"></line>` +
    `${line}${dots}</svg>`
  );
}

/* ------------------------------------------------------------ spark grid */

export type SparkCell = {
  name: string;
  value: string;
  pts: readonly Point[];
  fill: string;
  stroke: string;
};

/** Many small charts, each scaled to its own range. The value is printed beside
 *  the name because the shapes are comparable and the quantities are not. */
export function sparkGrid(cells: readonly SparkCell[], spark: (c: SparkCell) => string): string {
  return `<div class="sgrid">${cells
    .map(
      (c) =>
        `<div class="cell"><div class="hd"><span class="nm">${esc(
          c.name,
        )}</span><span class="v">${esc(c.value)}</span></div>${spark(c)}</div>`,
    )
    .join("")}</div>`;
}
