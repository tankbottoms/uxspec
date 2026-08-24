/**
 * Identity colour, one declaration.
 *
 * DESIGN.md: an entity keeps its colour everywhere it appears. A badge takes the class,
 * an SVG needs the raw value, and the two must not be kept in two hand-edited lists --
 * so the class name and the custom property are derived from a single tuple here. The
 * tuple order matches `.badge.p1` ... `.badge.p12` in tokens.ts and must stay in step
 * with it; the pastel names are the ones that file assigns.
 */
const TONES = [
  ["p1", "aqua"], ["p2", "vanilla"], ["p3", "mint"], ["p4", "peach"],
  ["p5", "lilac"], ["p6", "blush"], ["p7", "lime"], ["p8", "orchid"],
  ["p9", "teal"], ["p10", "rose"], ["p11", "cyan"], ["p12", "indigo"],
] as const;

/**
 * Four swatches are withdrawn from the identity pool and spent on account type.
 *
 * Account type is a closed vocabulary of four -- there will never be a fifth kind of
 * account -- and a closed vocabulary is exactly the thing that should be legible by
 * colour alone. The cost is that those four colours must then mean *only* that: a
 * brokerage badge in lilac and a payee badge in the same lilac two columns away tells
 * the reader the two are related when they are not. Withdrawing them from the hash is
 * what makes that impossible rather than merely unlikely, which is the whole of the
 * rule in DESIGN.md: one colour, one meaning, per page.
 */
export const TYPE_TONE: Record<string, string> = {
  Depository: "p9", CreditCard: "p4", Investment: "p5", Crypto: "p11",
};

const RESERVED = new Set(Object.values(TYPE_TONE));
/** The swatches identity may still draw on -- eight of the twelve. */
const IDENTITY = TONES.filter(([cls]) => !RESERVED.has(cls));

/** Badge class for an account type, or the neutral one for a type not in the list. */
export function typeClass(type: string): string {
  return TYPE_TONE[type] ?? "idle";
}

/** Stable tone for a name: same string always lands on the same swatch. */
function toneOf(key: string): (typeof TONES)[number] {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  // SAFETY: IDENTITY is a non-empty subset and the index is taken modulo its length.
  return IDENTITY[h % IDENTITY.length] as (typeof TONES)[number];
}

/** Badge class for an entity. */
export function toneClass(key: string): string {
  return toneOf(key)[0];
}

/** Fill for the same entity's chart, reading the same declaration the badge does. */
export function toneFill(key: string): string {
  return `var(--pastel-${toneOf(key)[1]})`;
}

/** Stroke for the same entity's chart. */
export function toneStroke(key: string): string {
  return `var(--stroke-${toneOf(key)[1]})`;
}

/** Explicit tone, for series whose position carries meaning rather than identity. */
export function toneAt(i: number): { cls: string; fill: string; stroke: string } {
  // The reserved four are out of this pool too: a chart series is an identity like any
  // other, and a slice the colour of "Investment" that is not an investment misleads.
  // SAFETY: modulo keeps the index inside the literal.
  const [cls, name] = IDENTITY[i % IDENTITY.length] as (typeof TONES)[number];
  return { cls, fill: `var(--pastel-${name})`, stroke: `var(--stroke-${name})` };
}
