/**
 * The only shared shape in the template.
 *
 * `charts.ts` draws a series as `{day, v}` rather than `{x, y}` on purpose: every
 * spark on a house page is a value over time, and a pair named `x`/`y` invites a
 * caller to pass a scatter's coordinates into a function that will label the axis
 * with a date. The shape names the thing it holds.
 */
export type Point = { day: string; v: number };

/** A tone: the badge class and the pastel/stroke pair that the same entity uses in SVG. */
export type Tone = { cls: string; fill: string; stroke: string };
