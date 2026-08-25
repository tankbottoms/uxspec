/**
 * The viewport page.
 *
 * Not "here is a WebGL canvas". A viewport is the shape an application tool
 * takes when its subject is bigger than the frame it is being looked at
 * through, and everything hard about one is in the controls: where they dock,
 * what each of them is allowed to act on, and how a reader is supposed to know
 * which of three different kinds of bigger they just asked for.
 *
 * The stage is the worked example. The rest of the page is the grammar, and the
 * grammar is what transfers to a map, a document view, a timeline or a diff.
 */
import { icon } from "../icons.ts";
import { nextFig } from "../charts.ts";
import * as U from "../ui.ts";
import * as T from "../tables.ts";
import * as W from "../wireframes.ts";
import { stage, PLATES } from "../viewer.ts";
import { toneAt } from "../palette.ts";
import * as S from "../spark.ts";
import { walk } from "../data.ts";

/** One table row. Local because tables.ts exposes cells, not rows: a row is
    just its cells joined, and a shared helper for that hides nothing. */
const row = (cells: string): string => `<tr>${cells}</tr>`;

/** A dock, its rule, and what goes wrong when the rule is broken. */
const DOCKS: readonly { pos: string; owns: string; eg: string; ic: string }[] = [
  {
    pos: "Top left",
    owns: "Identity. What this frame is, and which of the two kinds it is.",
    eg: "Name, mode, the subject's address.",
    ic: "eye",
  },
  {
    pos: "Top right",
    owns: "What the frame does to the subject's presentation.",
    eg: "Fill, tone, projection, units.",
    ic: "palette",
  },
  {
    pos: "Left rail",
    owns: "Where the eye stands. Never the subject.",
    eg: "Closer, further, home.",
    ic: "magnifying-glass-plus",
  },
  {
    pos: "Right rail",
    owns: "Which of the subject's layers are standing.",
    eg: "One control per layer, named.",
    ic: "layer-group",
  },
  {
    pos: "Bottom left",
    owns: "What the frame is doing, as distinct from what it is looking at.",
    eg: "Turn, edges, editing, follow, play.",
    ic: "sliders",
  },
  {
    pos: "Bottom centre",
    owns: "Navigation of the subject's own geometry.",
    eg: "Apart, together, step, seek.",
    ic: "arrows-up-down-left-right",
  },
  {
    pos: "Bottom right",
    owns: "The readout, and anything that acts on the frame itself.",
    eg: "Frame time, scale, fullscreen, reset.",
    ic: "chart-line",
  },
];

export function viewerBody(): string {
  const dockRows = DOCKS.map(
    (d) =>
      row(T.td(`<span class="gl">${icon(d.ic)}${d.pos}</span>`) +
          T.td(d.owns) +
          T.td(`<span class="mono">${d.eg}</span>`),
      ),
  ).join("");

  return (
    U.pageHead({
      eyebrow: ["Viewport", "three.js, vendored", "still SVG underneath"],
      h1: "A viewport is mostly its controls",
      lede: `Four plates standing on a lit ground, and seven docked control groups around them. The subject is the least interesting part: what this page is for is where a control is allowed to sit, what it is allowed to act on, and how a reader tells apart the three different things that all mean &ldquo;bigger&rdquo;. With scripting off the same subject is shown as a flat isometric still and the page reads correctly.`,
    }) +
    U.tiles([
      { k: "Docks", v: "7", s: "each owns one axis" },
      { k: "Kinds of bigger", v: "3", s: "eye, subject, frame" },
      { k: "Module", v: "vendored", s: "public/vendor, never a CDN" },
      { k: "No-JS state", v: "a still", s: "same subject, flat" },
    ]) +
    /* ------------------------------------------------------------------ 1 */
    U.h2(1, "stage", "What is on the stage", icon("laptop"), {
      hint: "live now",
      hintIc: icon("circle-info"),
      stmt:
        "A tile, drawn as four plates on a ground plane, so that every verb the controls use &mdash; closer, apart, above &mdash; has something to be relative to.",
    }) +
    U.p(
      `The subject is one tile: nine squares, built up in four passes. Each pass adds to what the pass below it left, so the finished thing is a single flat image and the only way to see what any one pass contributed is to lift it off the others. That is what <span class="mono">apart</span> is for, and it is the entire reason this subject was chosen over an abstract shape.`,
    ) +
    U.p(
      `The earlier version of this page floated four shapes on a dark rectangle. It read as a picture of an object rather than as a view onto a scene, and the reason is worth stating plainly: <strong>every viewport control is relative, and with nothing underneath the subject, none of the verbs had an object.</strong> Closer to what. Apart from what. So there is a ground now, and it is drawn &mdash; a rule grid, in the same tokens as everything else on the site &mdash; and the plates stand on it.`,
    ) +
    stage() +
    U.p(
      `Every control above is docked <em>inside</em> the frame. A rail underneath a picture is a toolbar belonging to the page; a rail inside the frame is a control belonging to the view. Put four of these side by side and the difference stops being a preference: external toolbars stack into a wall of buttons that no longer says which frame each one drives.`,
    ) +
    /* ------------------------------------------------------------------ 2 */
    U.h2(2, "docks", "Seven places, and what each one owns", icon("table-columns"), {
      hint: "position is meaning",
      hintIc: icon("circle-info"),
      stmt:
        "A control's dock says what it acts on. Reader finds reset bottom-right on the map, finds it bottom-right on the model.",
    }) +
    U.p(
      `The split is by <em>what the control acts on</em>, never by what it looks like. Two controls that both use a plus glyph belong in different docks if one moves the eye and the other moves the subject, and the dock is what tells them apart before the reader has hovered anything.`,
    ) +
    T.table({
      fig: "Table 6",
      caption: "The seven docks of a viewport frame",
      cols: [{ h: "Dock" }, { h: "Owns" }, { h: "Typically" }],
      body: dockRows,
      scope: "the contract &middot; every frame on the site",
      mark: {
        ic: "circle-info",
        label: "position is the label",
        title:
          "A glyph-only control is readable because of where it is docked before it is readable because of its mark. Move a control between docks and its meaning changes even though nothing about it changed.",
      },
    }) +
    W.viewportDocks() +
    U.p(
      `<span class="fig">${nextFig()}</span> The two side rails are the pair a flat viewport does not need. A map has no layers standing above each other and a chart has no eye to move, so on those frames the rails are simply absent &mdash; the docks are a vocabulary, not a template every frame has to fill.`,
    ) +
    /* ------------------------------------------------------------------ 3 */
    U.h2(3, "bigger", "Three kinds of bigger", icon("magnifying-glass-plus"), {
      hint: "1 glyph, 1 axis",
      hintIc: icon("triangle-exclamation"),
      stmt:
        "The eye moves, the subject spreads, or the frame rescales. They are three axes and they must never share a mark.",
    }) +
    U.p(
      `This is the one thing a viewport gets wrong most often, and it is invisible until someone uses the thing. <strong>Closer</strong> moves the eye and changes nothing about the subject. <strong>Apart</strong> changes the subject's own geometry and leaves the eye where it was. <strong>Fill</strong> changes how much of the frame the subject occupies and moves neither. All three make the picture bigger. All three are different questions.`,
    ) +
    T.table({
      fig: "Table 7",
      caption: "The three axes, their marks, and their docks",
      cols: [{ h: "Axis" }, { h: "Mark" }, { h: "Dock" }, { h: "Moves" }],
      body:
        row(T.td("Camera") +
            T.td(`<span class="gl">${icon("magnifying-glass-plus")}magnifier</span>`) +
            T.td("Left rail") +
            T.td("the eye"),
        ) +
        row(T.td("Spread") +
            T.td(`<span class="gl">${icon("plus")}plus and minus</span>`) +
            T.td("Bottom centre") +
            T.td("the subject"),
        ) +
        row(T.td("Fill") +
            T.td(
              `<span class="gl">${icon(
                "up-right-and-down-left-from-center",
              )}expand</span>`,
            ) +
            T.td("Top right") +
            T.td("neither &mdash; the frame rescales"),
        ),
      scope: "three axes &middot; three marks &middot; three docks",
    }) +
    U.banner(
      "warn",
      `The magnifier is <strong>reserved for the camera</strong>. It is the one mark on the page that a reader arrives already knowing, and spending it on anything other than distance costs more than any other glyph decision on a viewport. Plus and minus are the general pair and can mean whatever their dock says they mean; the magnifier cannot.`,
    ) +
    /* ------------------------------------------------------------------ 4 */
    U.h2(4, "rails", "A rail reports, and a rail refuses", icon("sliders"), {
      hint: "5 stops, shown",
      hintIc: icon("circle-info"),
      stmt:
        "A discrete control prints its own position and disables itself at its ends, before it is pressed rather than after.",
    }) +
    U.p(
      `Both rails on the stage are discrete: five camera rungs, five spread stops. Two things follow from that and neither is optional. The rail <strong>prints where it is</strong> &mdash; <span class="mono">2/4</span> under the buttons &mdash; because a control with five positions and no readout is a control the reader has to press to the end to find out where they were. And the rail <strong>disables itself at its ends</strong>, so it says where its limits are before it is pressed. A button that silently does nothing is the version of this that makes a reader think the page is broken.`,
    ) +
    U.p(
      `The disabled button stays in the rail rather than being removed. A rail that changes length as it is used moves the next control under a pointer that was already on its way, and gets pressed twice by accident.`,
    ) +
    U.code(
      `const dis = (act, off) => document.querySelectorAll('[data-act="' + act + '"]')
  .forEach(b => { b.disabled = off; });
dis("sp-", stop === 0);            // says so before it is pressed
dis("sp+", stop === STOPS - 1);`,
      { lang: "viewer.ts" },
    ) +
    U.noteBox({
      kind: "caution",
      title: "The last layer cannot be put away",
      body: `Turning off every plate leaves an empty stage, which is a state with no way out that looks exactly like a crash. The layer rail refuses the last one standing. Refusing is better than confirming: a dialog to ask whether the reader meant to empty the frame is a dialog about a thing nobody wants.`,
    }) +
    /* ------------------------------------------------------------------ 5 */
    U.h2(5, "glyphonly", "A glyph-only control needs a name and a note", icon("circle-question"), {
      hint: "hover and focus",
      hintIc: icon("circle-info"),
      stmt:
        "Not the browser's tooltip. Its delay is longer than a hesitating reader will wait, and it cannot hold two lines.",
    }) +
    U.p(
      `Every mark in the rails carries a plate with two lines: what the control is <em>called</em>, and what pressing it <em>does</em>. The browser's own tooltip was tried first and is not enough on either count. It waits about a second &mdash; longer than a reader hesitating over an unfamiliar mark will wait before giving up and pressing it to find out &mdash; and it is one run of text, so the name and the consequence arrive as a single grey sentence.`,
    ) +
    U.p(
      `The plate opens on hover <em>and</em> on focus, so a keyboard reaches it, and it opens away from the edge its rail is docked to: the right-hand rail's plates open left, or they would be drawn off the frame and clipped by the viewport's own <span class="mono">overflow</span>.`,
    ) +
    U.code(
      `<button type="button" class="vt" data-act="cam+" aria-label="Closer">
  <span class="badge w3 idle">${"<svg …>"}</span>
  <span class="tip-plate" role="tooltip">
    <span class="n">Closer</span>
    <span class="d">Moves the eye in one rung. Five rungs; the subject does not change size.</span>
  </span>
</button>`,
      { lang: "viewer.ts" },
    ) +
    /* ------------------------------------------------------------------ 6 */
    U.h2(6, "modes", "Editor and viewer are the same frame", icon("pen-to-square"), {
      hint: "said, not implied",
      hintIc: icon("circle-info"),
      stmt:
        "A frame that can be changed and one that can only be looked at wear the same rails. The difference is stated in the corner.",
    }) +
    U.p(
      `The temptation is to give an editable frame a second, richer set of controls and leave the read-only one bare. That is the wrong cut. The rails are the <em>view's</em> controls &mdash; where the eye stands and which layers are standing are questions a reader has just as much as an author &mdash; so they belong to both. What differs is whether the subject can be picked and changed, and that is one bit.`,
    ) +
    U.p(
      `So it is <strong>said</strong>: the top-left corner prints <span class="mono">Viewing</span> or <span class="mono">Editing</span>, and the frame takes an inset accent rule while it is editable. Press <span class="gl">${icon(
        "pen-to-square",
      )}Editing</span> on the stage above and both change. Nothing else does &mdash; which is the point.`,
    ) +
    U.noteBox({
      kind: "",
      title: "Why not just hide the rails on a read-only frame",
      body: `Because the reader then has no way to look at the thing they were given. A read-only document view still needs zoom; a read-only model still needs to be turned around. Hiding the controls to signal read-only takes the view away in order to say something about the subject.`,
    }) +
    /* ------------------------------------------------------------------ 7 */
    U.h2(7, "layers", "The layer rail, and what it must not do", icon("layer-group"), {
      hint: "named, not numbered",
      hintIc: icon("circle-info"),
      stmt:
        "One control per layer, carrying the layer's name and its colour. A hidden layer keeps its place in the stack.",
    }) +
    U.p(
      `Four controls, one per plate, each in the plate's own identity swatch so the rail and the subject agree without a legend. They are <strong>named</strong>, not numbered: a rail of four numbered checkboxes says nothing about what turning one off would remove, and the reader finds out by removing it.`,
    ) +
    T.table({
      fig: "Table 8",
      caption: "The four plates of the stage's subject",
      cols: [{ h: "Plate" }, { h: "Swatch" }, { h: "Contributes" }],
      body: PLATES.map((p, i) =>
        row(T.td(`<span class="gl">${icon("layer-group")}${p.name}</span>`) +
            T.td(`<span class="badge w9 ${p.tone}">${p.tone}</span>`) +
            T.td(
              i === 0
                ? "all nine squares &mdash; the field"
                : i === PLATES.length - 1
                  ? "one square &mdash; the centre"
                  : `${9 - i * 2} squares`,
            ),
        ),
      ).join(""),
      scope: "invented subject &middot; four passes",
    }) +
    U.banner(
      "ok",
      `A hidden plate <strong>keeps its place in the stack</strong>. Closing the gap over it would move every plate above it, and the reader who turned one off to see what was underneath would watch the thing they were trying to look at slide out from under the pointer.`,
    ) +
    /* ------------------------------------------------------------------ 8 */
    U.h2(8, "fallback", "What is underneath all of it", icon("bars"), {
      hint: "no script",
      hintIc: icon("circle-info"),
      stmt:
        "The same subject as flat isometric SVG, in the markup from the start, hidden only once a frame has actually been produced.",
    }) +
    U.p(
      `The fallback is not a placeholder graphic. It is the same four plates over the same ground, drawn flat, present in the markup before the module is fetched, and hidden only once the renderer has produced a real frame. The order matters: hide-then-draw leaves a blank rectangle for however long the module takes, and forever if it throws.`,
    ) +
    U.code(
      `renderer.setAnimationLoop(() => {
  ...
  if (!shown) { shown = true; host.classList.add("on"); }  // reveal after a real frame
});`,
      { lang: "viewer.ts" },
    ) +
    W.chartAnatomy() +
    U.p(
      `<span class="fig">${nextFig()}</span> The same frame, caption and scope apply to a canvas as to a chart.`,
    ) +
    /* ------------------------------------------------------------------ 9 */
    U.h2(9, "colour", "Colour comes from the stylesheet", icon("circle-check"), {
      hint: "0 hex here",
      hintIc: icon("circle-info"),
      stmt:
        "Materials read their tint out of the computed custom properties, so the stage follows the theme without a second palette declared for it.",
    }) +
    U.p(
      `Nothing in the module holds a hex. Each material reads a <span class="mono">--pastel-*</span> and a <span class="mono">--stroke-*</span> out of the computed style of the document element, so a theme change repaints the scene through a <span class="mono">MutationObserver</span> rather than through a duplicated palette that would drift on the first edit.`,
    ) +
    U.banner(
      "warn",
      `The temptation is to copy the six hexes into the module &ldquo;just for the 3D&rdquo;. That is exactly the fork that <span class="mono">design-lint.ts</span> exists to catch, and the linter reads the module too.`,
    ) +
    /* ----------------------------------------------------------------- 10 */
    U.h2(10, "panel", "The floating panel", icon("sliders"), {
      hint: "over, not beside",
      hintIc: icon("circle-info"),
      stmt:
        "The decision in hand, stated as a decision, with the tool that decision actually takes.",
    }) +
    U.p(
      `Rails act on the view. A panel acts on <em>part of the subject</em>, and that is a different job with a different rule: it has to be readable at the same time as the thing it changes. Press <span class="gl">${icon(
        "pen-to-square",
      )}Editing</span> on <a href="#stage">the stage</a> and one appears over the frame&rsquo;s lower left.`,
    ) +
    U.p(
      `A side inspector is the obvious alternative and it is worse for one measurable reason: a viewport wide enough to be worth having is wide enough that the panel and the subject are two glances apart, so the reader carries the value across the page in their head. Over the frame costs some of the subject; beside it costs the connection between the control and the thing controlled.`,
    ) +
    T.table({
      fig: "Table 9",
      caption: "Three rules a panel keeps that a rail does not have to",
      cols: [{ h: "Rule" }, { h: "Because" }],
      body:
        row(
          T.td("<strong>The head states the decision, not the encoding</strong>") +
            T.td(
              `An imperative with a subject &mdash; &ldquo;choose the tint for the Form plate&rdquo; &mdash; so a reader arriving cold knows what is being asked of them. <span class="mono">plate 2, tone p4</span> is what gets stored, which is a different sentence and not one anybody asked for.`,
            ),
        ) +
        row(
          T.td("<strong>The tool wears the value&rsquo;s own face</strong>") +
            T.td(
              `A colour is chosen from colours; a shape from shapes. A text field or a number is the right control only where the value genuinely has no other face, and reaching for one before that is how an editor ends up being a form about a picture.`,
            ),
        ) +
        row(
          T.td("<strong>Putting it away is a state, not a removal</strong>") +
            T.td(
              `Shutting it leaves a badge in the corner it left from, and leaves the plate in hand alone. A panel that closes to nothing cannot be reopened by a reader who did not see what opened it.`,
            ),
        ),
      scope: "the contract &middot; every panel on a frame",
      mark: {
        ic: "circle-info",
        label: "a panel is not a rail",
        title:
          "A rail acts on the view and is always available. A panel acts on one part of the subject, is up only while the frame can be edited, and can be put away.",
      },
    }) +
    U.p(
      `The swatches are the second rule made literal: the button <em>is</em> the colour, at the size of a word, carrying no text at all. The chosen one is ringed rather than filled darker &mdash; filling it would change the one property the reader is judging it by.`,
    ) +
    U.code(
      `.dk-tone .band{display:block;width:30px;height:13px;border-radius:2px}
.dk-tone[aria-pressed="true"]{box-shadow:0 0 0 2px var(--accent);
  border-color:var(--accent)}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.noteBox({
      kind: "caution",
      title: "Shut and empty are not the same state",
      body: `Two variables, not one. The panel being down and the plate in hand are independent, so shutting the panel does not drop what was being worked on &mdash; otherwise reopening it lands the reader somewhere they did not leave. Same argument as the reset that must not put the layer rail back.`,
    }) +
    U.p(
      `The panel is also where the read-only case is settled. A frame that cannot be edited keeps <strong>every rail</strong> &mdash; looking is something a reader does too &mdash; and loses only the tool that writes. That is why the panel is bound to <span class="mono">editing</span> and nothing else is.`,
    ) +
    U.banner(
      "warn",
      `A control should say what it is about to do, not what is currently true. The label on a toggle reads &ldquo;Stop the plates breathing&rdquo;, not &ldquo;animation: on&rdquo; &mdash; plain English, verb first, and it changes with the state.`,
    ) +
    /* ----------------------------------------------------------------- 11 */
    U.h2(11, "budget", "What it costs", icon("chart-line"), {
      hint: "2 draws/square",
      hintIc: icon("circle-info"),
      stmt:
        "One box geometry and one edge geometry for all thirty-six squares, and layout arithmetic that never touches a buffer.",
    }) +
    U.p(
      `Two draw calls per square &mdash; a solid and its edges &mdash; over two shared buffers, so the count does not grow with the instances. More important than the count: <strong>moving a plate does not rebuild it</strong>. Apart, fill and layer visibility all change positions and scales on groups that already exist; only a tone change or a wireframe toggle touches a material. Rebuilding meshes in order to move them is the single most common way a viewport like this drops frames on a phone.`,
    ) +
    U.p(
      `The frame time and the draw-call count are printed live in the bottom-right readout. If the number stops changing, the loop is not running.`,
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
