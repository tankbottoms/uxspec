/**
 * Schemas are diagrams, not tables.
 *
 * A schema printed as a table of column names is a list of facts with the one
 * fact a reader came for -- what points at what -- left implicit in a string.
 * So it is drawn: a card per entity, positioned; a curve per relation, drawn
 * behind the cards in one SVG layer that spans the whole stage.
 *
 * The cards are HTML rather than SVG text. Type is the whole point of a schema
 * card -- a key is bold, a foreign key is italic and carries a mark, a type is
 * right-justified mono -- and SVG has no text metrics worth the trouble: every
 * one of those is a class in HTML and a hand-measured tspan in SVG.
 *
 * The SVG carries no `<style>`. An inline stylesheet is document-global, and a
 * selector as generic as `.col` inside one would reach into every card on the
 * page. Colour rides on presentation attributes holding `var()` tokens.
 */
import { esc } from "./html.ts";
import { icon } from "./icons.ts";

export type Field = {
  name: string;
  type: string;
  /** Primary key: bold, with a filled dot in the gutter. */ pk?: boolean;
  /** Foreign key: italic, with a mark and a curve leaving the row. */ fk?: string;
};

export type Entity = {
  id: string;
  title: string;
  /** Rows in the table, right-justified in the header in mono. */
  count: string;
  x: number;
  y: number;
  fields: readonly Field[];
};

const CARD_W = 176;
const HEAD_H = 26;
const ROW_H = 19;

function card(e: Entity): string {
  const rows = e.fields
    .map((f) => {
      const cls = ["ecol", f.pk ? "pk" : "", f.fk ? "fk" : ""]
        .filter(Boolean)
        .join(" ");
      return (
        `<div class="${cls}"><span class="en">${esc(f.name)}</span>` +
        `<span class="et">${esc(f.type)}</span></div>`
      );
    })
    .join("");
  return (
    `<div class="ecard" id="e-${esc(e.id)}" style="left:${e.x}px;top:${e.y}px">` +
    `<div class="ehd">${esc(e.title)}` +
    /* A row count is a figure, not a rating. A badge here would spend one of the
       page's semantic colours on a number that means nothing on the scale it
       belongs to -- an entity with 63 rows is not "idle". */
    `<span class="ecount">${esc(e.count)}</span></div>${rows}</div>`
  );
}

/** Where a field's row sits, in stage coordinates. */
function anchor(e: Entity, field: string): { x: number; y: number } {
  const i = e.fields.findIndex((f) => f.name === field);
  return { x: e.x, y: e.y + HEAD_H + ROW_H * (i < 0 ? 0 : i) + ROW_H / 2 };
}

/**
 * One relation.
 *
 * Bezier rather than elbow: an orthogonal router has to know about every card
 * it might cross, and a schema this size does not earn a router. The control
 * points are pushed sideways by a third of the gap, so two curves between the
 * same pair of columns separate instead of overprinting.
 */
function link(from: Entity, field: string, to: Entity): string {
  const a = anchor(from, field);
  const b = { x: to.x, y: to.y + HEAD_H / 2 };
  const leftward = b.x < a.x;
  const ax = leftward ? a.x : a.x + CARD_W;
  const bx = leftward ? b.x + CARD_W : b.x;
  const d = Math.max(28, Math.abs(bx - ax) / 3);
  const c1 = leftward ? ax - d : ax + d;
  const c2 = leftward ? bx + d : bx - d;
  return (
    `<path d="M${ax} ${a.y}C${c1} ${a.y} ${c2} ${b.y} ${bx} ${b.y}" fill="none" ` +
    `stroke="var(--stroke-lilac)" stroke-width="1" marker-end="url(#erd-a)"/>` +
    `<circle cx="${ax}" cy="${a.y}" r="2" fill="var(--stroke-lilac)"/>`
  );
}

/**
 * The stage, its wires, and the four controls that move it.
 *
 * Fit, auto-arrange, out and in. Only what is live is drawn: an export button
 * on a diagram with nothing behind it is a promise the page cannot keep, and
 * three controls that do nothing are worse than none. The rail is hidden until
 * the script marks the frame live, the same as the calendar band's.
 */
export function erd(
  entities: readonly Entity[],
  rels: readonly { from: string; field: string; to: string }[],
  o: { w?: number; h?: number } = {},
): string {
  const by = new Map(entities.map((e) => [e.id, e]));
  const w = o.w ?? 700;
  const h = o.h ?? 300;
  const wires = rels
    .map((r) => {
      const f = by.get(r.from);
      const t = by.get(r.to);
      return f && t ? link(f, r.field, t) : "";
    })
    .join("");
  const b = (a: string, ic: string, lbl: string) =>
    `<button type="button" data-a="${a}" title="${esc(lbl)}" aria-label="${esc(lbl)}">` +
    `${icon(ic)}</button>`;
  return (
    `<div class="erd" data-erd="1">` +
    `<div class="erd-ctl gctl">` +
    b("fit", "magnifying-glass", "Fit to frame") +
    b("tidy", "diagram-project", "Auto-arrange") +
    b("out", "minus", "Zoom out") +
    b("in", "plus", "Zoom in") +
    `</div>` +
    `<div class="erd-stage" style="width:${w}px;height:${h}px">` +
    `<svg class="erd-wires" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ` +
    `aria-hidden="true"><defs><marker id="erd-a" viewBox="0 0 8 8" refX="7" refY="4" ` +
    `markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
    `<path d="M0 1L7 4L0 7z" fill="var(--stroke-lilac)"/></marker></defs>${wires}</svg>` +
    entities.map(card).join("") +
    `</div></div>`
  );
}
