/**
 * Page furniture. Everything here emits markup that is already correct with
 * scripting off -- no component in this file requires `client.ts` to have run.
 *
 * The contract with `tokens.ts`: this file may only *compose* classes that the
 * stylesheet already defines. It may not invent a class, and it may not emit a
 * `style=` attribute carrying colour. If a component seems to need one, the
 * component is wrong, not the stylesheet. The two exceptions the linter allows
 * are geometry-only inline styles -- `flex-basis` on a bar segment and `width`
 * on a meter fill -- because those are data, not design.
 */
import { esc, wcls } from "./html.ts";

/* ---------------------------------------------------------------- head */

export function pageHead(o: {
  eyebrow: string[];
  h1: string;
  lede?: string;
}): string {
  return `<div class="page-head">
<div class="eyebrow">${o.eyebrow.map(esc).join(" &middot; ")}</div>
<h1>${esc(o.h1)}</h1>${o.lede ? `\n<p class="lede">${o.lede}</p>` : ""}
</div>`;
}

/** Numbered section heading with its icon. The number is the reading order and
 *  the anchor is stable, so a deep link survives a section being retitled. */
export function h2(n: number, id: string, title: string, ic: string): string {
  return `<hr class="sep">\n<h2 id="${esc(id)}"><span class="n">${n}</span>${ic}${esc(title)}</h2>`;
}

export function h3(title: string, id?: string): string {
  return `<h3${id ? ` id="${esc(id)}"` : ""}>${esc(title)}</h3>`;
}

export function p(html: string): string {
  return `<p>${html}</p>`;
}

/** The standing note. Used for the "why" behind a rule -- never for a warning,
 *  which is `banner()`, because a reader who learns that the tinted box is
 *  sometimes decorative stops reading tinted boxes. */
export function note(html: string): string {
  return `<p class="note">${html}</p>`;
}

export function banner(kind: "ok" | "warn" | "crit", html: string): string {
  return `<div class="banner ${kind}">${html}</div>`;
}

/* --------------------------------------------------------------- tiles */

export type Tile = { k: string; v: string; s?: string };

export function tiles(items: readonly Tile[]): string {
  return `<div class="tiles">${items
    .map(
      (t) =>
        `<div class="tile"><div class="k">${esc(t.k)}</div><div class="v">${esc(
          t.v,
        )}</div>${t.s ? `<div class="s">${t.s}</div>` : ""}</div>`,
    )
    .join("")}</div>`;
}

/* -------------------------------------------------------------- badges */

/**
 * The only sanctioned way to emit a badge.
 *
 * `w` must be a width from the scale in `tokens.ts` (`w3`..`w42`), the literal
 * `auto`, or a class produced by `wcls()`. `badge-lint.ts` reads that scale out
 * of the stylesheet at build time and fails the build on anything else, so the
 * vocabulary cannot drift by someone adding `w16` to a page.
 *
 * `tone` is a colour class and nothing else. There is no `color` parameter and
 * there will not be one.
 */
export function badge(
  label: string,
  w: string,
  tone = "",
  o: { hollow?: boolean; title?: string } = {},
): string {
  const cls = ["badge", w, tone, o.hollow ? "hollow" : ""]
    .filter(Boolean)
    .join(" ");
  const t = o.title ? ` title="${esc(o.title)}"` : "";
  return `<span class="${cls}"${t}>${esc(label)}</span>`;
}

/** A value that is two values is two badges. Never one badge reading "A / B" --
 *  the slash is invisible at 9.5px and the pair stops being scannable. */
export function badges(
  parts: readonly { label: string; tone: string }[],
  w: string,
): string {
  return parts.map((x) => badge(x.label, w, x.tone)).join(" ");
}

/** Width for a whole column, computed once from every label the column will
 *  ever hold -- including the empty string and the error string. Passing only
 *  the happy-path labels is the usual way a column ends up ragged. */
export function colW(labels: readonly string[], pad = 0): string {
  return wcls(labels, pad);
}

/* ------------------------------------------------------------- swatches */

export function swatch(name: string, cls: string, token: string): string {
  return `<div class="swatch"><div class="chip ${cls}"></div><span class="nm">${esc(
    name,
  )}</span><span class="vr">${esc(token)}</span></div>`;
}

export function swatches(
  items: readonly { name: string; cls: string; token: string }[],
): string {
  return `<div class="swatches">${items
    .map((s) => swatch(s.name, s.cls, s.token))
    .join("")}</div>`;
}

/* --------------------------------------------------------------- lists */

export function kv(rows: readonly [string, string][]): string {
  return `<dl class="kv">${rows
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`)
    .join("")}</dl>`;
}

/* ---------------------------------------------------------------- code */

const RX = {
  str: /(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|`[^`]*?`)/g,
  kw: /\b(const|let|export|function|return|type|import|from|class|if|else|for|of|new|await|async)\b/g,
  com: /(\/\/[^\n]*)/g,
};

/** Highlighting is three regexes on escaped text, applied in an order that
 *  cannot nest wrongly: comments last, so a `//` inside a string is already
 *  wrapped and its `<span>` tag has no `//` to match. */
export function code(src: string, o: { lang?: string } = {}): string {
  const h = esc(src.replace(/\t/g, "  "))
    .replace(RX.str, '<span class="s">$1</span>')
    .replace(RX.kw, '<span class="k">$1</span>')
    .replace(RX.com, '<span class="c">$1</span>');
  return `${o.lang ? `<div class="code-hd">${esc(o.lang)}</div>` : ""}<pre class="code">${h}</pre>`;
}

/** The wrong-and-right pair. Both halves are always shown; a spec that only
 *  shows the correct form teaches recognition, not diagnosis. */
export function twoUp(bad: string, good: string): string {
  return `<div class="two"><div>${bad}</div><div>${good}</div></div>`;
}

export function dont(src: string): string {
  return `<div class="code-hd">Wrong</div><pre class="code"><span class="bad">${esc(
    src,
  )}</span></pre>`;
}

export function doThis(src: string): string {
  return `<div class="code-hd">Right</div><pre class="code"><span class="good">${esc(
    src,
  )}</span></pre>`;
}

/* -------------------------------------------------------------- scroll */

/** Wide content scrolls inside its own box. The page body never scrolls
 *  sideways -- a horizontal scrollbar on <body> hides the right edge of every
 *  section, not just the wide one. */
export function scroll(inner: string): string {
  return `<div class="scroll">${inner}</div>`;
}

export function empty(msg: string): string {
  return `<div class="empty">${esc(msg)}</div>`;
}
