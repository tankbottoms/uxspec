/**
 * Tables, and the rotated label rail that makes a grouped one readable.
 *
 * This is the piece worth copying verbatim into a new project. Everything else in
 * the design system is a rule you can restate; this is arithmetic you would have
 * to rediscover -- how tall a block has to be before its name fits down the side
 * of it, and what to do when it does not.
 */
import { esc, wcls } from "./html.ts";
import { icon } from "./icons.ts";

/* ------------------------------------------------------------ plain table */

export type Col = {
  /** Header text. */ h: string;
  /** `n` right-aligns and sets tabular figures; `s` marks the column sortable. */
  cls?: string;
  /** Sort key emitted as `data-k`, read by `client.ts`. Omit for unsortable. */
  k?: string;
};

export function thead(cols: readonly Col[]): string {
  return `<thead><tr>${cols
    .map((c) => {
      const cls = [c.cls, c.k ? "s" : ""].filter(Boolean).join(" ");
      return `<th${cls ? ` class="${cls}"` : ""}${
        c.k ? ` data-k="${esc(c.k)}"` : ""
      }>${esc(c.h)}</th>`;
    })
    .join("")}</tr></thead>`;
}

export function table(o: {
  fig: string;
  caption: string;
  cols: readonly Col[];
  body: string;
  foot?: string;
  grouped?: boolean;
  scope?: string;
}): string {
  const cls = ["sortable", o.grouped ? "grouped" : ""].filter(Boolean).join(" ");
  return `<div class="scroll"><table class="${cls}">
<caption><span class="fig">${esc(o.fig)}</span>${o.caption}${
    // Raw HTML, like every other scope on the page: a scope is a period and its
    // separator is an entity.
    o.scope ? `<span class="scope">${o.scope}</span>` : ""
  }</caption>
${thead(o.cols)}
<tbody>${o.body}</tbody>${o.foot ? `\n<tfoot>${o.foot}</tfoot>` : ""}
</table></div>`;
}

export function td(html: string, cls = ""): string {
  return `<td${cls ? ` class="${cls}"` : ""}>${html}</td>`;
}

/** A subtotal row. Carries no `data-g` -- see `grouped()` for why that matters. */
export function subRow(cells: string): string {
  return `<tr class="sub">${cells}</tr>`;
}

/** The one grand total. `tfoot` keeps it pinned under a sort for free. */
export function totRow(cells: string): string {
  return `<tr class="tot">${cells}</tr>`;
}

/* ------------------------------------------------------ the rotated rail */

/** A row is 29px: 13 of padding, 15 of badge, 1 of rule. Measured, not guessed. */
export const ROW_PX = 29;
/**
 * What the label cell spends before a single letter of the name is set.
 *
 * Nine of inset at each end of the stack, the glyph itself, the gap between the
 * glyph and the name, and seven of padding at each end of the ribbon. If any of
 * those change in `tokens-extra.ts`, this number changes with them -- it is the
 * one place the CSS and the fitting arithmetic have to agree, and when they stop
 * agreeing the failure is a name that fits by this calculation and is cut short
 * by an ellipsis on the page.
 */
export const STACK_PX = 53;
/** Heights a label cell may claim, indexed by how many rows' worth they are. */
const GH_PX = [0, 29, 58, 87, 116, 145] as const;
/** Width of a character in the label face at 11.5px, and in the smaller face. */
const CH_WIDE = 6.8;
const CH_NARROW = 5.6;

/**
 * How to draw a group name down a block `n` rows deep.
 *
 * A rotated label is only as legible as its block is tall, and the block is
 * whatever the data put together -- nine rows one time, one row the next. Three
 * moves are available, in the order of what they cost the table: set the name in
 * the smaller face, give the cell a minimum height so its rows share the extra,
 * or drop the name and let the glyph carry the column alone.
 *
 * The last of those is not a failure. A one-row block with its group's mark on it
 * and the full name on `title` reads correctly; a name crushed into 29px does not.
 */
export function fit(
  name: string,
  n: number,
): { cls: string; sm: boolean; gonly: boolean } {
  const wide = name.length * CH_WIDE;
  const narrow = name.length * CH_NARROW;
  const have = n * ROW_PX;
  if (wide <= have - STACK_PX) return { cls: "", sm: false, gonly: false };
  if (narrow <= have - STACK_PX) return { cls: "", sm: true, gonly: false };
  for (let k = 2; k <= 5; k++) {
    const h = GH_PX[k] as number;
    if (h <= have) continue;
    if (wide <= h - STACK_PX) return { cls: ` gh${k}`, sm: false, gonly: false };
    if (narrow <= h - STACK_PX) return { cls: ` gh${k}`, sm: true, gonly: false };
  }
  return { cls: "", sm: false, gonly: true };
}

/** What a group looks like: its printed name, its colour class, its glyph. */
export type GroupMeta = { name: string; tone: string; ic: string };

/**
 * A group label: a glyph, and the name turned on its side beneath it.
 *
 * The glyph is the half that is always there -- one line high whatever the block
 * is, in the group's own colour, with the full name on the cell's `title`. The
 * name is the half that depends on the block, and `fit()` decides its treatment.
 */
export function glabelCell(
  k: string,
  n: number,
  labW: string,
  m: GroupMeta,
): string {
  const f = fit(m.name, n);
  return (
    `<td class="rot${f.gonly ? " gonly" : ""}${f.cls}"${
      n > 1 ? ` rowspan="${n}"` : ""
    } title="${esc(k)}">` +
    `<span class="gstack"><span class="badge vert ${labW} ${m.tone}${
      f.sm ? " sm" : ""
    }">` +
    `<span class="gm" role="img" aria-label="${esc(k)}">${icon(m.ic)}</span>` +
    `<span class="gn">${esc(m.name)}</span></span></span></td>`
  );
}

/**
 * A table body whose first column is one rotated label spanning each block.
 *
 * Items must already be in block order -- this walks runs, it does not sort. Every
 * member row also carries its group in `data-g` so the sort script can re-cut the
 * spans afterwards without reading them back out of cells it is about to destroy.
 *
 * `after` emits a subtotal for each block. What it returns must NOT carry
 * `data-g`: a subtotal is arithmetic on the block, not a member of it, so the
 * label must not span it and a sort must not shuffle it in among rows of another
 * kind. `.sub` is the hook the script already looks for.
 */
export function grouped<T>(o: {
  items: readonly T[];
  key: (t: T) => string;
  meta: (k: string) => GroupMeta;
  labW: string;
  row: (t: T) => string;
  after?: (block: readonly T[], k: string) => string;
}): string {
  const out: string[] = [];
  for (let i = 0; i < o.items.length; ) {
    const k = o.key(o.items[i] as T);
    let n = 1;
    while (i + n < o.items.length && o.key(o.items[i + n] as T) === k) n++;
    out.push(
      `<tr data-g="${esc(k)}">${glabelCell(k, n, o.labW, o.meta(k))}${o.row(
        o.items[i] as T,
      )}</tr>`,
    );
    for (let j = 1; j < n; j++)
      out.push(
        `<tr class="rep" data-g="${esc(k)}">${o.row(o.items[i + j] as T)}</tr>`,
      );
    if (o.after) out.push(o.after(o.items.slice(i, i + n), k));
    i += n;
  }
  return out.join("");
}

/**
 * The rail's width, computed once from every group name the table can hold.
 *
 * Feed it all of them, not the ones this dataset happens to contain -- a rail
 * that changes width when a group drops out is the same defect as a badge column
 * that reflows on an empty cell.
 */
export function railW(names: readonly string[]): string {
  return wcls(names, 1);
}

/** The subtotal's own mark: the block's glyph, on a row that is not in the block. */
export function subMark(m: GroupMeta): string {
  // `gi`, not `vert`: the mark on a subtotal is a glyph and nothing else. A
  // subtotal is one row, so a rotated ribbon has 29px to stand in and would draw a
  // box around a single upright mark -- a second, emptier badge beside the one the
  // block already wears. `hollow` was the earlier attempt and it only dropped the
  // fill; the border stayed, which is the part that read as a box.
  //
  // `gonly` on the cell because the stack's 9px insets exist to keep a full-height
  // name clear of the rules above and below it. There is no name here, so they have
  // nothing to protect and a 13px glyph does not fit in the 11px they leave.
  return `<td class="rot gonly"><span class="gstack"><span class="badge gi w7 ${m.tone}"><span class="gm" role="img" aria-label="${esc(
    m.name,
  )}">${icon(m.ic)}</span></span></span></td>`;
}
