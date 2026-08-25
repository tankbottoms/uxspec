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

/**
 * Numbered section heading.
 *
 * Four parts, in a fixed order and on two lines. The number is a printed mark --
 * white fill, black rule -- because it is the reading order and not a category,
 * and a coloured chip there would compete with every tone on the page below it.
 * The title follows it. The hint is pushed to the far right of the same line by
 * `margin-left:auto`, so it lands on the title's baseline at the page's right
 * edge: it holds one small fact about the section, never a control and never a
 * second sentence. The statement then breaks to its own line -- `flex-basis:100%`
 * in a wrapping flex row -- and says in one line what the section is for.
 *
 * The statement lives in the heading rather than in the paragraph beneath it so
 * that a reader scanning only the headings still gets the argument of the page.
 */
export function h2(
  n: number,
  id: string,
  title: string,
  ic: string,
  o: { hint?: string; hintIc?: string; stmt?: string } = {},
): string {
  const hint = o.hint
    ? `<span class="hint">${o.hintIc ?? ""}${esc(o.hint)}</span>`
    : "";
  const stmt = o.stmt ? `<span class="stmt">${o.stmt}</span>` : "";
  return `<hr class="sep">\n<h2 id="${esc(id)}"><span class="n">${n}</span>${ic}${esc(
    title,
  )}${hint}${stmt}</h2>`;
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
export function note(html: string, kind: NoteKind = ""): string {
  return `<p class="note${kind ? " " + kind : ""}">${html}</p>`;
}

/**
 * The four intents, and there are four.
 *
 * Plain is the reasoning behind a rule, `good` a confirmed outcome, `caution` a
 * thing that will bite later, `crit` a thing that is wrong now. A fifth intent
 * has never survived contact with a reader: by the time a page carries five
 * tints, two of them are being read as the same one, and the cheaper fix is to
 * decide which of the two the box actually is.
 *
 * The heading is optional and is a heading -- a rule and real space sit under it
 * -- because a bold first clause run into the paragraph reads as emphasis, not
 * as a title, and the reader skips it.
 */
export type NoteKind = "" | "good" | "caution" | "crit";

export function noteBox(o: {
  kind?: NoteKind;
  ic?: string;
  title?: string;
  body: string;
}): string {
  const hd = o.title
    ? `<div class="hd">${o.ic ?? ""}${esc(o.title)}</div>`
    : "";
  return `<div class="note${o.kind ? " " + o.kind : ""}">${hd}<p>${o.body}</p></div>`;
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

/** `wide` switches the value column to left-aligned sans, for a definition list
 *  whose values are sentences. The default right-aligns mono figures, and a
 *  sentence right-aligned against a ragged left edge is unreadable. */
export function kv(
  rows: readonly [string, string][],
  o: { wide?: boolean } = {},
): string {
  const c = o.wide ? ` class="w"` : "";
  return `<dl class="kv">${rows
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd${c}>${v}</dd>`)
    .join("")}</dl>`;
}

/* ---------------------------------------------------------------- code */

/**
 * One pass, one regex, three captures.
 *
 * The earlier version ran three replacements in sequence and the second ate the
 * first: `class` is a keyword, so the keyword pass matched the `class` attribute
 * inside the `<span class="s">` the string pass had just inserted, wrapped it in
 * another span, and the tag came apart -- the reader saw `class="s">` as literal
 * text in the middle of the code. Every sequential highlighter has that bug
 * latent in it. The fix that stays fixed is one pass, so no replacement can see
 * another's output.
 *
 * Order inside the alternation is the precedence: a keyword inside a string is
 * part of the string, and a quote inside a comment is part of the comment.
 */
const RX =
  /(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|`[^`]*?`)|(\/\/[^\n]*)|\b(const|let|export|function|return|type|import|from|class|if|else|for|of|new|await|async)\b/g;

export function code(src: string, o: { lang?: string } = {}): string {
  const h = esc(src.replace(/\t/g, "  ")).replace(
    RX,
    (_m: string, str?: string, com?: string, kw?: string) =>
      str
        ? `<span class="s">${str}</span>`
        : com
          ? `<span class="c">${com}</span>`
          : `<span class="k">${kw}</span>`,
  );
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

/** Raw HTML, like `note`. An empty state is authored copy and an em dash is the
 *  usual punctuation in it -- escaped, the entity printed as itself on the page. */
export function empty(msg: string): string {
  return `<div class="empty">${msg}</div>`;
}

/* ------------------------------------------------------ layout surfaces */

/**
 * The chip rail: a row of label/value pairs, each pair two badges.
 *
 * The pairing is the point. `DB 2.0 ms` set as one badge is a string that has to
 * be parsed; set as two, the labels line up down the rail and the numbers line
 * up beside them, and the eye compares numbers to numbers. Both columns take one
 * width computed from every member of the rail, so adding a slower source later
 * does not shuffle the ones already there.
 */
export function chips(
  items: readonly { k: string; v: string; tone: string }[],
): string {
  const kw = wcls(items.map((i) => i.k));
  const vw = wcls(items.map((i) => i.v));
  return `<div class="keyrow">${items
    .map(
      (i) =>
        `<span class="ki">${badge(i.k, kw, i.tone)}${badge(i.v, vw, "mono")}</span>`,
    )
    .join("")}</div>`;
}

/**
 * A band list: a group header, then the group's members, in one bordered plate.
 *
 * One plate rather than N cards. Nine loose boxes read as nine things and the
 * reader counts them; one rail of bands reads as one list and the reader reads
 * it. The `<details>` is what makes the sub-list work with scripting off, and
 * the first band ships open so the page never opens on a column of closed
 * triangles with nothing to say for itself.
 *
 * The member metadata carries its own tone per badge but shares one width across
 * every band in the list. Per-band widths would put the kind column at a
 * different x-position in each band and the list would stop being a list.
 *
 * The header holds two facts and they are different facts: the badge is how many
 * members, the right-hand note is what they come to. A count printed twice is a
 * count the reader checks against itself.
 */
export function bands(
  groups: readonly {
    name: string;
    ic?: string;
    tone: string;
    count: string;
    total?: string;
    open?: boolean;
    items: readonly { title: string; meta: readonly { label: string; tone: string }[] }[];
  }[],
): string {
  const mw = wcls(groups.flatMap((g) => g.items.flatMap((i) => i.meta.map((m) => m.label))));
  const cw = wcls(groups.map((x) => x.count));
  return `<div class="bands">${groups
    .map(
      (g) =>
        `<details class="band"${g.open ? " open" : ""}>` +
        `<summary class="band-hd"><span class="nm">${g.ic ?? ""}${esc(
          g.name,
        )}</span>${badge(g.count, cw, g.tone)}` +
        (g.total ? `<span class="ct">${esc(g.total)}</span>` : "") +
        `</summary>` +
        g.items
          .map(
            (i) =>
              `<div class="band-fs"><span class="nm">${esc(i.title)}</span>` +
              i.meta.map((m) => badge(m.label, mw, m.tone + " hollow")).join("") +
              `</div>`,
          )
          .join("") +
        `</details>`,
    )
    .join("")}</div>`;
}

/**
 * A status card: a title, a role badge, and one or more meters.
 *
 * The role badge is right of the title on the same baseline for the same reason
 * the section hint is: a fact about the thing belongs on the thing's own line,
 * and dropping it below turns a one-line card into a two-line one for no gain.
 */
export function card(o: {
  title: string;
  role: string;
  roleW: string;
  tone: string;
  meta?: string;
  body: string;
}): string {
  return (
    `<div class="card"><div class="card-hdr">` +
    `<span class="card-title">${esc(o.title)}</span>` +
    badge(o.role, o.roleW, o.tone) +
    (o.meta ? `<span class="card-meta">${esc(o.meta)}</span>` : "") +
    `</div>${o.body}</div>`
  );
}

/** Cards side by side. Three across at desk width, one across on a phone; the
 *  grid does that on its own, so no component here has a breakpoint of its own. */
export function cards(inner: string): string {
  return `<div class="cardgrid">${inner}</div>`;
}

/* ---------------------------------------------------------- viewports */

/**
 * A framed viewport with its controls docked to its own edges.
 *
 * A map, a chart at page size, a three.js stage and a live camera all have the
 * same problem: the content wants the whole rectangle, and the controls have
 * nowhere to go that is not on top of it. Putting them in a toolbar above the
 * frame solves it by making the frame smaller, which is the one thing the
 * content was asking you not to do -- and in a grid of four viewports it costs
 * four toolbars for one set of controls.
 *
 * So the controls dock inside the frame, at five fixed anchors and nowhere else:
 *
 *   top edge      options -- what is being shown. Layer, mode, range, source.
 *                 They change the content, so they sit above it, and they read
 *                 left to right like a sentence about the frame.
 *   bottom left   state the viewport is in. Play/pause, follow, lock.
 *   bottom centre navigation of the content itself. Step, seek, home.
 *   bottom right  what the frame does to itself. Zoom, reset, fullscreen, pick.
 *
 * The split is by what the control acts on, not by how it looks, so the same
 * glyph never moves between two viewports on one page. A reader who finds reset
 * at the bottom right of the map finds it at the bottom right of the model.
 *
 * The bottom row is one row across all three docks, so the three clusters share
 * a baseline even when the centre one is empty -- an empty dock still holds its
 * space rather than letting its neighbours drift inward.
 */
export function viewport(o: {
  body: string;
  topL?: string;
  topR?: string;
  bl?: string;
  bc?: string;
  br?: string;
  cls?: string;
  label?: string;
}): string {
  const top =
    o.topL || o.topR
      ? `<div class="vp-top"><div class="l">${o.topL ?? ""}</div><div class="r">${
          o.topR ?? ""
        }</div></div>`
      : "";
  const bot =
    o.bl || o.bc || o.br
      ? `<div class="vp-bot"><div class="d bl">${o.bl ?? ""}</div>` +
        `<div class="d bc">${o.bc ?? ""}</div>` +
        `<div class="d br">${o.br ?? ""}</div></div>`
      : "";
  // Raw HTML, because the name of a frame is a phrase with an em dash in it more
  // often than not, and .vp-cap uppercases -- an escaped entity there prints as
  // "&MIDDOT;" across the bottom of the frame.
  const cap = o.label ? `<div class="vp-cap">${o.label}</div>` : "";
  const cls = ["vp", o.cls ?? "", o.label ? "has-cap" : ""].filter(Boolean).join(" ");
  return `<div class="${cls}"><div class="vp-body">${o.body}</div>${top}${bot}${cap}</div>`;
}

/** Several viewports on one page. Two across is the default; one across below
 *  the fold of a phone, because a docked control cluster that has to overlap
 *  its neighbour's content is worse than a scroll. */
export function vpGrid(inner: string): string {
  return `<div class="vpgrid">${inner}</div>`;
}

/** A control cluster: glyph badges on one plate. Geometry comes from `.badge`,
 *  as everywhere else -- a control that redeclares badge height is how a page
 *  ends up with two badge heights. */
export function vpBtns(
  items: readonly { ic: string; on?: boolean; title: string; w?: string }[],
  icf: (n: string) => string,
): string {
  return `<div class="vp-btns">${items
    .map(
      (b) =>
        `<button type="button" aria-pressed="${b.on === true}" title="${esc(
          b.title,
        )}"><span class="badge ${b.w ?? "w3"} idle">${icf(b.ic)}</span></button>`,
    )
    .join("")}</div>`;
}

/**
 * The large figure a viewport is really for. Speed on a map, frame time on a
 * stage, price on a chart. It is a readout and not a badge: it is bigger than
 * the page's body face rather than smaller, because it is the one thing meant
 * to be readable from across a room, and it carries a unit so the number is
 * never ambiguous at a glance.
 */
export function vpRead(v: string, unit: string, sub?: string): string {
  return (
    `<div class="vp-read"><span class="v">${esc(v)}</span><span class="u">${esc(
      unit,
    )}</span>${sub ? `<span class="s">${esc(sub)}</span>` : ""}</div>`
  );
}

let pickSeq = 0;

/**
 * A picker that opens from its own dock.
 *
 * Checkbox and label, with a full-viewport scrim behind the panel, so it opens,
 * light-dismisses and closes with no script at all -- the scrim is a real label
 * over a real element, which is the trick a `<details>` menu cannot borrow.
 *
 * It opens away from the edge it is docked to: a picker at the bottom right
 * opens upwards and aligns its right edge, so it never grows off the frame.
 * That is the whole placement rule, and it is the reason the direction is a
 * parameter here rather than a guess made in CSS from the cluster's position.
 */
export function vpPick(o: {
  mark: string;
  title: string;
  items?: readonly { label: string; on?: boolean }[];
  /** A panel body of your own, for options that have a face: swatches, shapes,
   *  a grid of cells. A list of words is right for options a word describes and
   *  wrong for a colour, which no reader converts back into a colour from its
   *  name. When given, it replaces the list; the title bar stays either way. */
  body?: string;
  up?: boolean;
  rt?: boolean;
  w?: string;
}): string {
  pickSeq += 1;
  const id = `vpk${pickSeq}`;
  const cls = ["vp-pick", o.up ? "up" : "", o.rt ? "rt" : ""].filter(Boolean).join(" ");
  return (
    `<span class="${cls}"><input type="checkbox" id="${id}">` +
    `<label class="mk" for="${id}"><span class="badge ${o.w ?? "w9"} idle">${
      o.mark
    }</span></label>` +
    `<label class="scrim" for="${id}" aria-hidden="true"></label>` +
    `<span class="panel"><span class="t">${esc(o.title)}</span>${
      o.body ??
      (o.items ?? [])
        .map((i) => `<span class="opt${i.on ? " on" : ""}">${esc(i.label)}</span>`)
        .join("")
    }</span></span>`
  );
}
