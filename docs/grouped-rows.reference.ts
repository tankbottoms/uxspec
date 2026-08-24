const GW = wcls(ORDER.map((g) => glabel(g)));

/**
 * A table body whose first column is one rotated label spanning each block of rows.
 *
 * The label is drawn once and reaches down the whole run, which is the point of turning
 * it on its side: a group of nine categories gets one tall label rather than nine short
 * ones. Items must already be in block order. Every row also carries its group in
 * `data-g` so the script can re-cut the spans after a sort without having to read them
 * back out of cells it is about to destroy.
 */
function grouped<T>(
  items: readonly T[], key: (t: T) => string, labW: string, row: (t: T) => string,
  after?: (block: T[], key: string) => string,
): string {
  const out: string[] = [];
  for (let i = 0; i < items.length;) {
    const k = key(items[i] as T);
    let n = 1;
    while (i + n < items.length && key(items[i + n] as T) === k) n++;
    out.push(`<tr data-g="${esc(k)}">${glabelCell(k, n, labW)}${row(items[i] as T)}</tr>`);
    for (let j = 1; j < n; j++)
      out.push(`<tr class="rep" data-g="${esc(k)}">${row(items[i + j] as T)}</tr>`);
    // The subtotal carries no `data-g`: it is arithmetic on the block, not a member of
    // it, so the label must not span it and a sort must not shuffle it in among rows of
    // a different kind. `sub` is what the sort script already looks for.
    if (after) out.push(after(items.slice(i, i + n) as T[], k));
    i += n;
  }
  return out.join("");
}

/**
 * How to draw a group name down a block `n` rows deep.
 *
 * A rotated label is only as legible as its block is tall, and the block is whatever the
 * data happens to put together -- two rows of Digital, one of Discontinued. Three moves
 * are available, in order of how much they cost the table: set the name in the smaller
 * face, give the label cell a minimum height so its rows share the extra space, or drop
 * the name and let the glyph carry the column.
 *
 * The arithmetic is the real CSS, not a guess. A row is about twenty-nine pixels --
 * thirteen of padding, fifteen of badge, one of rule -- the stack is inset nine at each
 * end and the glyph and its gap take eighteen more, so a block of `n` rows offers
 * `n × 29 − 36` pixels of length. A character costs about 6.8px at 11.5px with this
 * label's tracking, or 5.6px in the smaller face.
 */
const ROW_PX = 29;
/** Inset at both ends, plus the glyph and the gap under it. */
const STACK_PX = 36;
/** The height steps a label cell may claim, indexed by how many rows' worth they are. */
const GH_PX = [0, 29, 58, 87, 116, 145];

function fit(name: string, n: number): { cls: string; sm: boolean; gonly: boolean } {
  const wide = name.length * 6.8;
  const narrow = name.length * 5.6;
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

/**
 * A group label: a glyph, and the name turned on its side beneath it.
 *
 * The glyph is the half that is always there -- one line high whatever the block, in the
 * group's own colour, with the full name on the cell's title. The name is the half that
 * depends on the block, and `fit` decides whether it is set full size, set smaller, given
 * room by stretching the cell, or dropped.
 */
function glabelCell(k: string, n: number, labW: string): string {
  const name = glabel(k);
  const tone = toneClass(k);
  const f = fit(name, n);
  return `<td class="rot${f.gonly ? " gonly" : ""}${f.cls}"${n > 1 ? ` rowspan="${n}"` : ""} ` +
    `title="${esc(k)}">` +
    // One badge, mark and name inside it -- owner ruling 2026-08-23. The glyph keeps
    // its own element because it has to be turned back the other way against the
    // label's rotation, and because the glyph-only case hides `.gn` and keeps `.gm`.
    `<span class="gstack"><span class="badge vert ${labW} ${tone}${f.sm ? " sm" : ""}">` +
    `<span class="gm" role="img" aria-label="${esc(k)}">${icon(iconOf(k))}</span>` +
    `<span class="gn">${esc(name)}</span></span></span></td>`;
}

/**
 * The same glyph on a row that belongs to a block without being in it -- a subtotal.
 *
 * The subtotal sits below its block and is pushed to the foot of the table by a sort,
 * where nothing above it says which group it totals any more. The mark says it, and it
 * is the mark the block itself is wearing.
