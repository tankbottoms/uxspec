/**
 * Page furniture: the head, the nav, the foot.
 *
 * Everything visual comes out of `tokens.ts`. This file adds no stylesheet and no
 * page-local rule, because a page-local rule is how the system rots -- the next
 * renderer inherits the markup and not the exception, and ships ragged.
 */
import { esc } from "./html.ts";
import { faviconDataUri, icon, SHEET_MARK } from "./icons.ts";
import { CSS } from "./tokens.ts";
import { CSS_EXTRA } from "./tokens-extra.ts";

/**
 * A section of the spec.
 *
 * `stmt` is the one-line statement that sets under the title; `hint` is the small
 * fact that sets right-justified on the title's own line. Both live here rather
 * than at the call site so the nav, the page and any future index all read the
 * same words -- a heading whose summary is written twice is written wrong once.
 */
export type Section = {
  id: string;
  n: string;
  ic: string;
  title: string;
  hint: string;
  hintIc: string;
  stmt: string;
};

/**
 * The spec's own table of contents. One glyph per section, none repeated -- and
 * `circle-info` is not among them, because that one is spoken for: it is the mark
 * on every section hint, and a glyph that means "here is a small fact" cannot
 * also mean "this is the overlays section".
 */
export const SECTIONS: readonly Section[] = [
  {
    id: "foundations", n: "1", ic: "layer-group", title: "Foundations",
    hint: "12 swatches", hintIc: "circle-info",
    stmt: "One stylesheet, one closed palette, and the rule that a colour means one thing per page.",
  },
  {
    id: "badges", n: "2", ic: "circle-check", title: "Badges",
    hint: "15 widths", hintIc: "circle-info",
    stmt: "Square, never a pill; width from the scale, colour from a class, and the build fails on anything else.",
  },
  {
    id: "tables", n: "3", ic: "file-lines", title: "Tables and grouped rows",
    hint: "4 groups", hintIc: "circle-info",
    stmt: "A rotated label rail, members, and a subtotal at the foot of each block that survives a re-sort.",
  },
  {
    id: "tiles", n: "4", ic: "scale-balanced", title: "Tiles, meters, readouts",
    hint: "4 across", hintIc: "circle-info",
    stmt: "The numbers the page is about, stated before any of the evidence for them.",
  },
  {
    id: "sparks", n: "5", ic: "chart-line", title: "Sparks",
    hint: "no axes", hintIc: "circle-info",
    stmt: "Shape at a glance, at row height, with the figure that matters printed beside it.",
  },
  {
    id: "charts", n: "6", ic: "building-columns", title: "Figures and charts",
    hint: "5-slice ceiling", hintIc: "circle-info",
    stmt: "Larger drawings, each one numbered, captioned, and carrying its own scale.",
  },
  {
    id: "controls", n: "7", ic: "gear", title: "Controls",
    hint: "no script", hintIc: "circle-info",
    stmt: "Menus, segmented switches and sorts built from native elements, correct with JavaScript off.",
  },
  {
    id: "overlays", n: "8", ic: "circle-question", title: "Overlays",
    hint: "checkbox only", hintIc: "circle-info",
    stmt: "Tips, receipt sheets and dialogs that open without a listener and close on Escape.",
  },
  {
    id: "wireframes", n: "9", ic: "bars", title: "Wireframes",
    hint: "no SVG style", hintIc: "triangle-exclamation",
    stmt: "Anatomy drawings that carry their colour on presentation attributes, because an inline SVG style leaks.",
  },
  {
    id: "layout", n: "10", ic: "folder-open", title: "Layout surfaces",
    hint: "live now", hintIc: "circle-info",
    stmt: "Notices, strips, chip rails, band lists and status cards &mdash; the furniture a data page is assembled from.",
  },
  {
    id: "viewports", n: "11", ic: "car", title: "Viewports and docked controls",
    hint: "5 docks", hintIc: "circle-info",
    stmt: "Maps, stages and page-size charts, with their controls docked inside the frame instead of stealing a toolbar from it.",
  },
  {
    id: "viewer", n: "12", ic: "laptop", title: "Viewer and glyph controls",
    hint: "vendored", hintIc: "circle-info",
    stmt: "A WebGL stage tinted from the same tokens, with a flat still underneath it when it cannot run.",
  },
  {
    id: "contract", n: "13", ic: "ban", title: "The contract, enforced",
    hint: "2 gates", hintIc: "triangle-exclamation",
    stmt: "What the two linters reject, shown failing, so the rule is a diagnosis and not a slogan.",
  },
  {
    id: "recipes", n: "14", ic: "book", title: "Recipes",
    hint: "copy these", hintIc: "circle-info",
    stmt: "The four things a new page needs, in the order a new page needs them.",
  },
] as const;

export function head(title: string, extraMeta = ""): string {
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    // Safari's data detectors read a bare quantity as a telephone number and offer
    // to dial it. Half the numbers on a spec page are pixel sizes.
    `<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">` +
    `<meta name="color-scheme" content="light">` +
    extraMeta +
    `<link rel="icon" href="${faviconDataUri()}">` +
    `<title>${esc(title)}</title>` +
    // The theme is read before first paint so a stored choice does not flash the
    // default first. It is three lines and it runs inline on purpose.
    `<script>(function(){var t=localStorage.getItem('uxTheme');` +
    `if(t&&t!=='auto'){document.documentElement.setAttribute('data-theme',t);}})();</script>` +
    `<style>${CSS}${CSS_EXTRA}</style></head><body>` +
    SHEET_MARK
  );
}

/** The sticky bar: brand, sections menu, out-links, theme. `<details>`, so it works with JS off. */
export function nav(current = "index"): string {
  const links = SECTIONS.map(
    (x) => `<a href="#${x.id}"><span class="n">${esc(x.n)}</span>${icon(x.ic)}${esc(x.title)}</a>`,
  ).join("");
  const theme = (id: string, ic: string, label: string): string =>
    `<button type="button" data-theme-set="${id}" aria-pressed="false">${icon(ic)}${esc(label)}</button>`;
  const out = current === "viewer"
    ? `<a class="out" href="./index.html">${icon("layer-group")}<span>Spec</span></a>`
    : `<a class="out" href="./viewer.html">${icon("laptop")}<span>Viewer</span></a>`;
  return (
    `<div class="nav"><div class="nav-in">` +
    `<span class="brand">${icon("layer-group")} UX spec</span>` +
    `<details class="menu"><summary>${icon("bars")} Sections ${icon("chevron-down")}</summary>` +
    `<nav class="panel sections">${links}</nav></details>` +
    `<span class="spacer"></span>` +
    out +
    `<details class="menu"><summary>${icon("gear")} <span class="lbl">Theme</span></summary>` +
    `<div class="panel right"><div class="grp">Appearance</div>` +
    theme("light", "sun", "Light") +
    theme("solarized", "moon", "Solarized") +
    theme("auto", "circle-info", "Match system") +
    `<div class="grp">Reference</div>` +
    `<a href="https://github.com/tankbottoms/uxspec">${icon("link")}Source</a>` +
    `</div></details>` +
    `</div></div><main>`
  );
}

export function foot(built: string): string {
  return (
    `</main><footer class="foot">` +
    `<p class="note">Rendered by <span class="mono">bun run build</span> on ${esc(built)}. ` +
    `Single file, CSS inlined, no runtime dependency, correct with scripting off. ` +
    `The badge and design contracts are checked before this file is written; a violation ` +
    `fails the build rather than reaching review.</p>` +
    `</footer></body></html>`
  );
}
