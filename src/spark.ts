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
import { glyph } from "./icons.ts";
import type { Point, Tone } from "./types.ts";

const round = (n: number) => Math.round(n * 100) / 100;
/** Thousands separated, no decimals. A readout is read at a glance and a chart
 *  that prints 8412.3719 has spent its plate on digits nobody uses. */
const num = (n: number) => Math.round(n).toLocaleString("en-GB");
/** 5 Mar 26. The pod is 8.5px mono and an ISO date costs it four characters it
 *  does not have to spare. */
const dmy = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getUTCDate()} ${M[d.getUTCMonth()] ?? ""} ${String(d.getUTCFullYear()).slice(2)}`;
};

/* ------------------------------------------------------------ hover pods */

/**
 * The readout a chart shows when the pointer is over one of its marks.
 *
 * It is drawn inside the chart's own coordinate system, on its own white plate,
 * and revealed by a CSS rule on the enclosing `g.hv` -- no script, and no
 * `title` attribute, which the browser draws in the system font at a size this
 * page does not set and after a delay it cannot shorten.
 *
 * The plate carries a glyph rather than a badge. A badge is a fixed-width object
 * with a border, and eleven of them scattered over a plot re-draw the chart as a
 * table; the glyph says which series a mark belongs to and takes 9px to do it.
 *
 * Width is measured, not guessed: the mono face is close enough to 0.55em per
 * character that a plate sized from the longest line never clips and never
 * leaves a wide margin on one side.
 */
function pod(
  x: number,
  y: number,
  lines: readonly string[],
  o: {
    glyph?: string; tone?: string; flip?: boolean; up?: boolean;
    box?: { w: number; h: number };
  } = {},
): string {
  const size = 8.5;
  const ch = size * 0.55;
  const padx = 7;
  const g = o.glyph ? 13 : 0;
  const w = round(Math.max(...lines.map((t) => t.length)) * ch + padx * 2 + g);
  const h = round(lines.length * 11 + 9);
  /* The plate is clamped into the chart's own box. Drawing it upward from a bar
     that already reaches the top of the plot puts it over the paragraph above --
     the root has overflow visible so the pod can overhang a little at the sides,
     which is not licence to leave the figure entirely. */
  const raw = o.flip ? x - w - 8 : x + 8;
  const px = o.box ? Math.min(Math.max(raw, 2), o.box.w - w - 2) : raw;
  const py = o.box
    ? Math.min(Math.max(o.up ? y - h - 6 : y - h / 2, 2), o.box.h - h - 2)
    : o.up
      ? y - h - 6
      : y - h / 2;
  const tx = px + padx + g;
  const body = lines
    .map(
      (t, i) =>
        `<text x="${round(tx)}" y="${round(py + 14 + i * 11)}" font-family="var(--font-mono)" ` +
        `font-size="${size}" fill="var(--ink${i ? "-muted" : ""})">${esc(t)}</text>`,
    )
    .join("");
  const mark = o.glyph
    ? glyph(o.glyph, px + padx + 4.5, py + h / 2, 9, o.tone ?? "var(--ink-soft)")
    : "";
  return (
    `<g class="pod">` +
    `<rect x="${round(px)}" y="${round(py)}" width="${w}" height="${h}" rx="3" ` +
    `fill="var(--paper-card)" stroke="var(--rule)" vector-effect="non-scaling-stroke"></rect>` +
    `${mark}${body}</g>`
  );
}

/** Wrap any drawing in the standard numbered figure. */
export function fig(inner: string, caption: string, scope = ""): string {
  const n = nextFig();
  return (
    `<figure>${inner}<figcaption><span class="fig">${n}</span>${caption}` +
    // Raw HTML, like the caption. A scope is a date range and its dash is an
    // entity more often than not; escaped, "1 Mar &ndash; 30 May" printed itself.
    (scope ? `<span class="scope">${scope}</span>` : "") +
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

/**
 * A labelled bar with its figure. Label and figure share one baseline on the
 * first row and the bar spans both columns underneath, rather than the figure
 * being centred against a two-row stack -- centred, it floats between the label
 * and the bar and reads as belonging to neither. Right-aligned and tabular, the
 * figures also line up down a column of these, which is the only way a reader
 * compares them without measuring.
 */
export function meterRow(label: string, value: string, pct: number, tone: string): string {
  return `<div class="meter-row"><div class="lb">${esc(label)}</div><div class="vl">${esc(
    value,
  )}</div>${meter(pct, tone)}</div>`;
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
  o: { size?: number; centre?: string; sub?: string; ring?: number; outline?: boolean } = {},
): string {
  const size = o.size ?? 132;
  const ring = o.ring ?? 15;
  const r = size / 2 - ring / 2 - 5;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.v, 0) || 1;
  let off = 0;
  // Two ways to draw the same ring, and the page carries one of each so the
  // choice is visible rather than argued. The filled ring is the default. The
  // outline ring is for a figure printed beside another chart that already owns
  // the page's colour: it keeps the same geometry and spends no fill on it, so
  // two rings side by side do not read as two competing colour systems.
  const arc = (rr: number, len: number, offset: number, stroke: string, wdt: number, op: string) =>
    `<circle cx="${size / 2}" cy="${size / 2}" r="${round(rr)}" fill="none" ` +
    `stroke="${stroke}" stroke-width="${wdt}"${op} ` +
    `stroke-dasharray="${round(len)} ${round(c - len)}" ` +
    `stroke-dashoffset="${round(-offset)}"></circle>`;
  const rings = slices
    .map((s) => {
      const len = (s.v / total) * c;
      const el = o.outline
        ? // The band is bounded rather than filled: two hairline arcs at the ring's
          // edges, on the same dash geometry, so the gaps between slices line up.
          arc(r - ring / 2, len, off * ((r - ring / 2) / r), s.stroke, 1.2, "") +
          arc(r + ring / 2, len, off * ((r + ring / 2) / r), s.stroke, 1.2, "") +
          arc(r, len, off, s.fill, ring, ' stroke-opacity="0.28"') +
          `<circle cx="${size / 2}" cy="${size / 2}" r="${round(r)}" fill="none" ` +
          `stroke="transparent" stroke-width="${ring}" ` +
          `stroke-dasharray="${round(len)} ${round(c - len)}" ` +
          `stroke-dashoffset="${round(-off)}"><title>${esc(s.label)}</title></circle>`
        : arc(r, len, off, s.fill, ring, "") +
          arc(r, len, off, s.stroke, ring, ' stroke-opacity="0.34"').replace(
            "></circle>",
            `><title>${esc(s.label)}</title></circle>`,
          );
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
  // preserveAspectRatio="none" stretches this 240-unit box across whatever width
  // it is given, and it stretches the strokes with it: at 720px the target rule
  // came out three times the weight it was drawn at and read as a black bar
  // rather than a mark. non-scaling-stroke pins every line to its authored width,
  // and the rule then only needs to be soft enough to sit behind the fill it
  // measures instead of in front of it.
  const ns = ` vector-effect="non-scaling-stroke"`;
  return (
    `<div class="meter-row"><div class="lb">${esc(o.label)}</div>` +
    `<div class="vl">${esc(o.disp)}</div>` +
    `<svg class="bullet" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" role="img">` +
    `<rect x="0" y="0" width="${w}" height="${h}" fill="var(--paper-alt)" stroke="var(--rule)"${ns}></rect>` +
    `<rect x="0" y="0" width="${x(o.v)}" height="${h}" fill="${o.t.fill}" stroke="${o.t.stroke}" stroke-opacity="0.5"${ns}></rect>` +
    `<line x1="${x(o.target)}" y1="0" x2="${x(o.target)}" y2="${h}" stroke="var(--ink-soft)" stroke-width="1.25"${ns}><title>target</title></line>` +
    `</svg></div>`
  );
}

/* ------------------------------------------------------------------ heat */

/**
 * A calendar band: one cell a day, tone by bucket.
 *
 * Buckets, not a gradient -- a continuous ramp asks the eye to read an absolute
 * value out of a shade, which it cannot do without the legend it is trying to
 * replace.
 *
 * The cells are drawn at their authored size and the drawing carries that size
 * in pixels, so a year of them is a dense band roughly 600px wide rather than a
 * grid stretched to whatever the column happens to be. Stretched to page width a
 * 9px cell came out at 64px and thirteen weeks filled a screen: at that size the
 * reader counts squares instead of seeing a season, which is the one thing a
 * calendar band is for. Put it in a scroll box; it is meant to overflow.
 *
 * Rows are real weekdays, so a column is a real week and the weekend stripe is
 * visible without being labelled.
 */
export function heat(
  days: readonly { day: string; bucket: number }[],
  ramp: readonly string[],
): string {
  const cell = 9;
  const pitch = cell + 2;
  const gutter = 20; // weekday names
  const head = 12; // month names
  const at = (s: string) => new Date(`${s}T00:00:00Z`);
  const dow0 = days[0] ? at(days[0].day).getUTCDay() : 0;
  const colOf = (i: number) => Math.floor((i + dow0) / 7);
  const cols = days.length ? colOf(days.length - 1) + 1 : 0;
  const w = gutter + cols * pitch;
  const h = head + 7 * pitch;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tx = (x: number, y: number, t: string, anchor = "start") =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="var(--font-mono)" ` +
    `font-size="7.5" fill="var(--ink-soft)">${esc(t)}</text>`;

  // Monday, Wednesday, Friday only. Seven labels beside nine-pixel rows do not
  // fit, and three are enough to orient the other four.
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const wd = [1, 3, 5]
    .map((r) => tx(gutter - 4, head + r * pitch + cell - 1, DOW[r] ?? "", "end"))
    .join("");

  // One name per month, over the column its first week starts in. Anything
  // narrower than a month gets no label rather than an abbreviated one.
  const months = days
    .map((d, i) => ({ d: at(d.day), i }))
    .filter((x) => x.d.getUTCDate() <= 7 && colOf(x.i) > 0 && x.d.getUTCDay() === dow0)
    .map((x) => tx(gutter + colOf(x.i) * pitch, head - 4, MON[x.d.getUTCMonth()] ?? ""))
    .join("");

  const cells = days
    .map((d, i) => {
      const x = gutter + colOf(i) * pitch;
      const y = head + ((i + dow0) % 7) * pitch;
      const t = ramp[Math.min(d.bucket, ramp.length - 1)] ?? "var(--paper-alt)";
      return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="1" fill="${t}" stroke="var(--rule-soft)"><title>${esc(
        d.day,
      )}</title></rect>`;
    })
    .join("");

  return (
    `<svg class="heat" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">` +
    `${months}${wd}${cells}</svg>`
  );
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
        `<circle cx="${px}" cy="20" r="3.2" fill="var(--paper-card)" stroke="${e.t.stroke}" stroke-width="1.4"><title>${esc(e.day)} ${esc(
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
  // One hover column per reading, the full height of the plot. Hovering the line
  // itself would ask the reader to hit a 1.5px stroke; hovering the column above
  // a point is the same gesture the reader already makes to look at that day.
  const cw = (w - pad - 6) / Math.max(pts.length - 1, 1);
  const hits = pts
    .map((p, i) => {
      const X = px(i);
      const Y = py(p.v);
      return (
        `<g class="hv" tabindex="0">` +
        `<rect class="hit" x="${round(X - cw / 2)}" y="0" width="${round(cw)}" height="${h}" ` +
        `fill="transparent"></rect>` +
        `<g class="on"><line x1="${X}" y1="${round(pad / 2)}" x2="${X}" y2="${h - pad / 2}" ` +
        `stroke="var(--rule)" stroke-dasharray="2 2"></line>` +
        `<circle cx="${X}" cy="${Y}" r="3.2" fill="var(--paper-card)" stroke="${stroke}" ` +
        `stroke-width="1.6"></circle></g>` +
        pod(X, Y, [num(p.v), dmy(p.day)], {
          glyph: "chart-line",
          tone: stroke,
          flip: i > pts.length * 0.62,
          up: true,
          box: { w, h },
        }) +
        `</g>`
      );
    })
    .join("");
  return (
    `<svg class="lchart" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img">` +
    axes(w, h, pad / 2, o.ticks ?? []) +
    `<path d="${area}" fill="${fill}" fill-opacity="0.55"></path>` +
    `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1.5" ` +
    `stroke-linejoin="round" stroke-linecap="round"></path>${hits}</svg>`
  );
}

/** Vertical bars on a zero baseline. The baseline is drawn even when nothing is
 *  negative, so a chart that later grows a negative bar does not change shape. */
export function barChart(
  bars: readonly { label: string; v: number; t: Tone; disp?: string; glyph?: string }[],
  o: { w?: number; h?: number } = {},
): string {
  const w = o.w ?? 620;
  const h = o.h ?? 130;
  const pad = 22;
  const bw = (w - pad * 2) / Math.max(bars.length, 1);
  /* The domain is the whole range, positive and negative, and the zero line is
     placed inside the plot in proportion to it -- not pinned to the bottom. A
     zero line at the floor leaves a negative bar nowhere to go: it draws past
     the viewBox, and the only reason that ever looked survivable is that the
     root was clipping it. The plot stops 16px short of the bottom so the feet
     have a strip of their own that no bar can reach into. */
  const foot0 = 16;
  const top = 8;
  const plotH = h - top - foot0;
  const maxP = Math.max(0, ...bars.map((b) => b.v));
  const maxN = Math.max(0, ...bars.map((b) => -b.v));
  const span = maxP + maxN || 1;
  const zero = round(top + plotH * (maxP / span));
  // A label needs about six pixels a character. Under that the bar carries its
  // glyph instead and the words arrive on hover -- an abbreviated label is worse
  // than none, because the reader cannot tell what was cut.
  const body = bars
    .map((b, i) => {
      const bh = round((Math.abs(b.v) / span) * plotH);
      const x = round(pad + i * bw + bw * 0.16);
      const y = b.v >= 0 ? zero - bh : zero;
      const cx = round(x + bw * 0.34);
      const fits = b.label.length * 5.2 < bw * 0.98;
      const foot = fits
        ? `<text x="${cx}" y="${h - 6}" text-anchor="middle" font-size="8" ` +
          `fill="var(--ink-muted)">${esc(b.label)}</text>`
        : glyph(b.glyph ?? "circle-info", cx, h - 9, 9, "var(--ink-soft)");
      return (
        `<g class="hv" tabindex="0">` +
        `<rect class="hit" x="${round(pad + i * bw)}" y="0" width="${round(bw)}" height="${h}" ` +
        `fill="transparent"></rect>` +
        `<rect x="${x}" y="${round(y)}" width="${round(bw * 0.68)}" height="${bh}" ` +
        `fill="${b.t.fill}" stroke="${b.t.stroke}"></rect>${foot}` +
        pod(cx, b.v >= 0 ? round(y) : round(y + bh), [b.disp ?? String(b.v), b.label], {
          glyph: b.glyph ?? "chart-line",
          tone: b.t.stroke,
          flip: i > bars.length * 0.62,
          up: true,
          box: { w, h },
        }) +
        `</g>`
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
    .map((p) => {
      const X = sx(p.x);
      const Y = sy(p.y);
      return (
        `<g class="hv" tabindex="0">` +
        // The hit area is three times the dot. A 3.4px target is a fair drawing
        // and an unfair control; the transparent disc costs nothing and makes the
        // readout reachable without turning every point into a bigger mark.
        `<circle class="hit" cx="${X}" cy="${Y}" r="10" fill="transparent"></circle>` +
        `<circle cx="${X}" cy="${Y}" r="3.4" fill="${p.t.fill}" stroke="${p.t.stroke}"></circle>` +
        pod(X, Y, p.label ? [p.label, `x ${round(p.x)}  y ${round(p.y)}`] : [`x ${round(p.x)}`], {
          glyph: "circle-info",
          tone: p.t.stroke,
          flip: X > w * 0.6,
          up: true,
          box: { w, h },
        }) +
        `</g>`
      );
    })
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
