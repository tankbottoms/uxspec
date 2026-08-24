/**
 * Page furniture: the head, the nav, the foot.
 *
 * Everything visual comes out of `tokens.ts`. This file adds no stylesheet and no
 * page-local rule, because a page-local rule is how the system rots -- the next
 * renderer inherits the markup and not the exception, and ships ragged.
 */
import { esc } from "./html.ts";
import { faviconDataUri, icon } from "./icons.ts";
import { CSS } from "./tokens.ts";
import { CSS_EXTRA } from "./tokens-extra.ts";

export type Section = { id: string; n: string; ic: string; title: string };

/** The spec's own table of contents. One glyph per section, none repeated. */
export const SECTIONS: readonly Section[] = [
  { id: "foundations", n: "1", ic: "layer-group", title: "Foundations" },
  { id: "badges", n: "2", ic: "circle-check", title: "Badges" },
  { id: "tables", n: "3", ic: "file-lines", title: "Tables and grouped rows" },
  { id: "tiles", n: "4", ic: "scale-balanced", title: "Tiles, meters, readouts" },
  { id: "sparks", n: "5", ic: "chart-line", title: "Sparks" },
  { id: "charts", n: "6", ic: "building-columns", title: "Figures and charts" },
  { id: "controls", n: "7", ic: "gear", title: "Controls" },
  { id: "overlays", n: "8", ic: "circle-info", title: "Overlays" },
  { id: "wireframes", n: "9", ic: "bars", title: "Wireframes" },
  { id: "viewer", n: "10", ic: "laptop", title: "Viewer and glyph controls" },
  { id: "contract", n: "11", ic: "ban", title: "The contract, enforced" },
  { id: "recipes", n: "12", ic: "book", title: "Recipes" },
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
    `<style>${CSS}${CSS_EXTRA}</style></head><body>`
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
