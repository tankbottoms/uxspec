/**
 * The demo dataset.
 *
 * Deterministic on purpose: a seeded LCG rather than `Math.random()`, so two
 * builds of the same commit produce byte-identical HTML. That is not fussiness --
 * it is what makes `git diff` on `dist/` readable, and a readable diff on built
 * output is the cheapest review tool a static site has.
 *
 * The numbers are invented and say so on the page. A template shipped with
 * plausible-looking real figures is a template someone will eventually publish
 * by accident.
 */
import type { Point } from "./types.ts";

/** Numerical Recipes' LCG. Small, stable, and good enough for shapes. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const DAY = 86400000;
/** Fixed epoch: the build must not depend on the day it runs. */
const T0 = Date.parse("2026-03-01T00:00:00Z");

export function days(n: number): string[] {
  return Array.from(
    { length: n },
    (_, i) => new Date(T0 + i * DAY).toISOString().slice(0, 10),
  );
}

/** A random walk with drift, clamped positive. Shapes, not forecasts. */
export function walk(
  seed: number,
  n: number,
  start: number,
  vol = 0.06,
  drift = 0.004,
): Point[] {
  const r = rng(seed);
  const ds = days(n);
  let v = start;
  return ds.map((day) => {
    v = Math.max(v * (1 + drift + (r() - 0.5) * vol), start * 0.15);
    return { day, v: Math.round(v * 100) / 100 };
  });
}

export type Row = {
  group: string;
  name: string;
  kind: string;
  status: "ok" | "warn" | "crit" | "idle";
  v: number;
  pct: number;
  day: string;
};

const GROUPS = ["Depository", "CreditCard", "Investment", "Crypto"] as const;
const KIND: Record<string, string[]> = {
  Depository: ["Checking", "Savings", "Money market"],
  CreditCard: ["Revolving", "Charge"],
  Investment: ["Brokerage", "Retirement", "Managed"],
  Crypto: ["Custodial", "Self-custody", "Gnosis Safe"],
};
const NAMES = [
  "Northgate", "Ferrous", "Harrow Lane", "Beckett", "Old Quay", "Pilcrow",
  "Saltmarsh", "Vantage", "Kestrel", "Ninebark", "Tallow", "Wexford",
  "Ardmore", "Bellweather", "Crossley", "Dunlin",
];

/**
 * Rows already in block order -- `grouped()` walks runs, it does not sort. The
 * ordering is the caller's job everywhere in this codebase, which is why every
 * grouped table on the site takes its rows from here rather than sorting inline.
 */
export function rows(seed = 7): Row[] {
  const r = rng(seed);
  const out: Row[] = [];
  let n = 0;
  GROUPS.forEach((g, gi) => {
    const kinds = KIND[g] as string[];
    const count = 2 + Math.floor(r() * 3);
    for (let i = 0; i < count; i++) {
      const st = r();
      out.push({
        group: g,
        name: NAMES[n % NAMES.length] as string,
        kind: kinds[i % kinds.length] as string,
        status: st > 0.82 ? "crit" : st > 0.62 ? "warn" : st > 0.14 ? "ok" : "idle",
        v: Math.round((400 + r() * 42000) * (gi === 1 ? -1 : 1)),
        pct: Math.round(r() * 1000) / 10,
        day: days(90)[Math.floor(r() * 89)] as string,
      });
      n++;
    }
  });
  return out;
}

export function sum(rs: readonly Row[]): number {
  return rs.reduce((a, x) => a + x.v, 0);
}
