/**
 * The viewer page.
 *
 * One component, at page size, with the reasoning next to it. It exists as its
 * own page because the stage is the only thing here that needs a module, and a
 * page that needs a module should be the page that proves what happens without one.
 */
import { icon } from "../icons.ts";
import * as U from "../ui.ts";
import * as W from "../wireframes.ts";
import { stage } from "../viewer.ts";
import { toneAt } from "../palette.ts";
import * as S from "../spark.ts";
import { walk } from "../data.ts";

export function viewerBody(): string {
  return (
    U.pageHead({
      eyebrow: ["Viewer", "three.js, vendored", "still SVG fallback"],
      h1: "The WebGL stage",
      lede: `A lattice, a ring, a stack and an orb, tinted from the same tokens as every badge on the spec page. The controls are badges. With scripting off, without WebGL, or if the module throws, the same figure is shown as a flat isometric still and the page reads correctly.`,
    }) +
    U.tiles([
      { k: "Module", v: "vendored", s: "public/vendor, never a CDN" },
      { k: "Colour source", v: "tokens", s: "read live from the stylesheet" },
      { k: "No-JS state", v: "a still", s: "same figure, flat" },
      { k: "Draw calls", v: "2/shape", s: "solid plus edges" },
    ]) +
    U.h2(1, "stage", "The stage", icon("laptop")) +
    stage() +
    U.p(
      `<span class="fig">Fig. 1</span> Shape and tone are independent, so the same geometry can carry any of the twelve identity swatches without a second material declared anywhere.`,
    ) +
    U.h2(2, "fallback", "What is underneath it", icon("bars")) +
    U.p(
      `The fallback is not a placeholder graphic. It is the same subject drawn as flat isometric SVG, present in the markup from the start, and only hidden once the renderer has produced a frame. The order matters: hide-then-draw leaves a blank rectangle for however long the module takes, and forever if it fails.`,
    ) +
    U.code(
      `renderer.setAnimationLoop(() => {
  ...
  if (!shown) { shown = true; el.classList.add("on"); }  // reveal only after a real frame
});`,
      { lang: "viewer.ts" },
    ) +
    W.chartAnatomy() +
    U.p(`<span class="fig">Fig. 2</span> The same frame, caption and scope apply to a canvas as to a chart.`) +
    U.h2(3, "colour", "Colour comes from the stylesheet", icon("circle-check")) +
    U.p(
      `Nothing in the module holds a hex. Each material reads a <span class="mono">--pastel-*</span> and a <span class="mono">--stroke-*</span> out of the computed style of the document element, so a theme change repaints the scene through a <span class="mono">MutationObserver</span> rather than through a duplicated palette that would drift on the first edit.`,
    ) +
    U.banner(
      "warn",
      `The temptation is to copy the six hexes into the module &ldquo;just for the 3D&rdquo;. That is exactly the fork that <span class="mono">design-lint.ts</span> exists to catch, and the linter reads the module too.`,
    ) +
    U.h2(4, "budget", "What it costs", icon("chart-line")) +
    U.p(
      `Two draw calls per shape &mdash; a solid and its edges &mdash; with one shared geometry per kind, so the count does not grow with the instances. The frame time is printed live in the corner of the stage; if it stops being a number, the loop is not running.`,
    ) +
    S.fig(
      S.lineChart(walk(41, 90, 60, 0.06, 0), toneAt(9).fill, toneAt(9).stroke, {
        ticks: ["60", "", "0"],
      }),
      "Frames per second, simulated",
      "invented data, shape only",
    ) +
    U.p(`Back to the spec: <a href="./index.html">index.html</a>.`)
  );
}
