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
import * as F from "../fields.ts";
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
    U.h3("Turning is the mouse's job, not a button's", "orbit") +
    U.p(
      `Distance is on a rail because it is a value with a range and a reader wants it to stop where they put it. <strong>Orientation is not that.</strong> A reader turning a model is aiming, and aiming through two buttons is aiming with the lights off &mdash; so the frame is dragged directly: press anywhere on the stage and the subject follows the pointer, wheel over it and the eye steps in and out on the same rail the magnifier drives. Pointer events rather than mouse events, so a finger and a mouse are one code path, and the pointer is captured, so a drag that leaves the canvas keeps turning instead of sticking the subject half way round.`,
    ) +
    U.p(
      `Two limits, and both are about not being able to get back. The pitch is clamped short of either pole, because a camera that goes over the top puts the ground plane above the subject and every reader reads that as the picture having broken. And <span class="gl">${icon(
        "house",
      )}Home</span> restores the <em>orientation</em> as well as the distance &mdash; that is the whole licence for a free camera. A view a reader can lose themselves in needs one press that undoes it; without that press, dragging is a trap and the two buttons really were the safer answer.`,
    ) +
    U.code(
      `const r = Math.cos(el) * d;
cam.position.set(Math.sin(az) * r, Math.sin(el) * d + 0.35, Math.cos(az) * r);
cam.lookAt(0, 1.0, 0);
el = Math.max(0.08, Math.min(1.45, el));   // never over the pole`,
      { lang: "viewer.ts" },
    ) +
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
    U.h3("A tool is a glyph, and the cluster is one object", "toolface") +
    U.p(
      `None of these marks carries a fill. A filled badge is how the rest of this site says <em>here is a value, and it has a state</em>; a tool is not a value, and thirty filled lozenges scattered over a picture read as data laid on the subject rather than as controls belonging to the frame. So the fill and the border go, the glyph stays, and the states are told in the mark itself: <span class="mono">ink-muted</span> at rest, <span class="mono">accent</span> under the pointer, and an amber fill when it is on. Two colours and two jobs: teal arrives with the pointer and leaves with it, so it can never be read as a setting; amber says <em>this is the one being talked about</em>, which is the same thing it says everywhere else on the site. Black fill was the old answer to <em>on</em> and it is not one &mdash; it turns the glyph into a hole and puts a third colour on a frame that has two.`,
    ) +
    U.p(
      `The one exception is the layer rail, and it is the exception that proves the rule &mdash; there the colour <strong>is</strong> the plate's identity, so the fill goes and the tint stays, on the glyph. That is the same trade tile makes: a neutral frame, and the selected mark carrying the colour.`,
    ) +
    U.p(
      `Tools that act on one axis are then drawn as <strong>one object</strong>: a single outline round the cluster with hairlines between the marks, not five separately bordered pills. Five outlines say five axes and leave the reader counting to find out otherwise; one outline says <em>this is the camera</em> and the divisions inside it say <em>and it has three hands</em>. It is also what makes the help numbers cheap &mdash; there are five things on the frame to number, because there are five objects.`,
    ) +
    U.code(
      `.vp .badge.bare{background:none;border-color:transparent;box-shadow:none}
.vp [data-act] .badge{color:var(--ink-muted)}
.vp .vp-pick > .mk:hover .badge{color:var(--accent)}
.vp .vt[aria-pressed="true"] .badge,
.vp .vp-pick > input:checked ~ .mk .badge{color:var(--ink);
  background:var(--pastel-amber);border-color:var(--stroke-amber)}
.vp-btns{gap:0;border:1px solid var(--rule-soft);border-radius:4px}
.vp-btns > * + *{border-left:1px solid var(--rule-soft)}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.h3("The ring is already there", "toolring") +
    U.p(
      `A mark inside a frame has five things to say and only two properties to say them with, so both are spent carefully. The <strong>colour of the glyph</strong> carries the state, and a <strong>ring around it</strong> carries the pointer. Neither of them is a fill, and neither of them is a border &mdash; the ring is an <span class="mono">outline</span>, and it is declared transparent at rest. That is the whole trick: the lit state changes one colour and nothing else, so a glyph never moves by a pixel as a reader crosses the cluster. A border would have to be reserved as a border, which means either a jump on hover or a permanently drawn box on every tool.`,
    ) +
    T.table({
      fig: "Table 8c",
      caption: "The five states of a tool mark, and the one that is not a state",
      cols: [{ h: "State" }, { h: "Glyph" }, { h: "Ring" }],
      body:
        row(
          T.td("At rest") +
            T.td(`<span class="mono">--ink-muted</span>`) +
            T.td("transparent, and already there"),
        ) +
        row(
          T.td("Under the pointer") +
            T.td(`<span class="mono">--accent</span>`) +
            T.td(`<span class="mono">--accent</span>`),
        ) +
        row(
          T.td("On") +
            T.td(`<span class="mono">--stroke-amber</span>`) +
            T.td("none &mdash; nothing is pointing at it"),
        ) +
        row(
          T.td("On, and under the pointer") +
            T.td(`<span class="mono">--accent</span>`) +
            T.td(`<span class="mono">--accent</span>`),
        ) +
        row(
          T.td("Being pressed") +
            T.td(`<span class="mono">--stroke-amber</span>`) +
            T.td(`<span class="mono">--stroke-amber</span>`),
        ) +
        row(
          T.td("Unavailable") +
            T.td(`<span class="mono">opacity: .38</span>, and the cursor stops`) +
            T.td("none, and hover does nothing"),
        ),
      scope: "every mark in every dock &middot; no fills anywhere in the list",
      mark: {
        ic: "circle-info",
        label: "the pointer wins",
        title:
          "On plus hover resolves to teal, not amber. A reader with their hand on a latched control needs to know it is still pressable more than they need to be told again that it is on -- they can see that it is on, because they turned it on.",
      },
    }) +
    U.code(
      `.vp .vt .badge{outline:1px solid transparent;outline-offset:2px;
  border-radius:var(--radius-sm)}
.vp .vt:hover .badge{color:var(--accent);outline-color:var(--accent)}
.vp .vt[aria-pressed="true"] .badge{color:var(--stroke-amber)}
.vp .vt[aria-pressed="true"]:hover .badge{color:var(--accent);
  outline-color:var(--accent)}
.vp .vt:active .badge{color:var(--stroke-amber);outline-color:var(--stroke-amber)}
.vp-btns .vt[disabled]{opacity:.38;cursor:default}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.noteBox({
      kind: "good",
      title: "Inside a frame the badge is neutered, not restyled",
      body: `The badge element survives so the glyph keeps its box and its alignment, but everything that makes a badge a badge comes off inside <span class="mono">.vp</span>: no ground, no border, no padding, and <span class="mono">width:auto</span> rather than a step off the width scale. The scale exists to line up a column of values; a control is not in a column of values. Keeping the element and dropping the costume is what stops a second set of geometry rules being invented for the frame.`,
    }) +
    U.p(
      `The group carries the same idea one level up. Pointing anywhere at a cluster tints <em>that cluster&rsquo;s own glyphs</em> teal &mdash; it does not draw anything new. The version that drew a ring round the whole group was tried and it was a box laid over the controls: a fourth rectangle on a frame that already has a plate, a dock and a subject, and one that arrives and leaves as the pointer travels. A cluster says &ldquo;you are here&rdquo; the same way a single tool does, by lighting up what it already owns.`,
    ) +
    U.h3("A readout is a rung in the same plate", "rung") +
    U.p(
      `A rail that prints its position has to print it <strong>inside</strong> the plate, as one more cell with a hairline before it, not as a caption floating beside it. A number sitting next to the cluster is a second object, and the reader has to decide whether it belongs to the cluster on its left or the one on its right &mdash; which on a frame with four docks is a real question, not a pedantic one. As a rung it is unambiguous by construction, and it inherits the plate&rsquo;s ground, border, radius and shadow for free.`,
    ) +
    U.p(
      `The rung is mono, 8px, tabular and stretched to the plate&rsquo;s full height, with a minimum of two glyph cells so a value changing from <span class="mono">1/5</span> to <span class="mono">100%</span> does not resize the cluster under a pointer that is already moving toward it. Where a frame only reports and never acts, the same rungs make a plate on their own &mdash; a readout is not a different component from a rail, it is a rail with no buttons in it.`,
    ) +
    U.code(
      `.vp-rung{display:inline-flex;align-items:center;justify-content:center;
  align-self:stretch;box-sizing:border-box;min-width:calc(var(--vp-gl)*2);
  height:var(--vp-gl);font:400 8px var(--font-mono);letter-spacing:.04em;
  font-variant-numeric:tabular-nums;color:var(--ink-muted);padding:0 4px}
.vp-read .vp-rung + .vp-rung{border-left:1px solid var(--rule-soft)}
/* A stacked cluster is one cell wide, so its readout is one cell wide too. */
.vp-btns.col .vp-rung{min-width:0;width:var(--vp-gl);font-size:7px;
  letter-spacing:0;padding:1px 0}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.noteBox({
      kind: "caution",
      title: "A rung in a column shrinks; it does not widen the stack",
      body: `Two glyph cells is the right minimum on a horizontal plate and the wrong one on a vertical stack, where it would make the whole column twice as wide as its buttons for the sake of one number. So the stacked rung drops to a single cell, loses its tracking and drops a half-point of type. That is only safe because it was checked against the values actually shown &mdash; a distance, a percentage, a ratio, none of them wider than the cell. Carrying the carve-out to a dial that prints a timestamp would clip it silently.`,
    }) +
    U.h3("A tool with more than two answers opens a drawn one", "drawntools") +
    U.p(
      `A glyph that cycles is only honest where the answers are two. Past that the reader is pressing to find out, which is the interaction equivalent of reading a list by deleting it one line at a time &mdash; twelve tints reached by twelve presses is eleven wrong pictures on the way to the right one. So the four marks beside the circle-i are not cycles. Each opens a small panel, and each panel is <strong>drawn</strong>: the tint tool is swatches, the shape tool is shapes, the layer tool is the stack in the order the stack is in, and the mode tool draws both sides of the choice so the reader can see the other one before standing in it.`,
    ) +
    U.p(
      `The rule underneath is the one the panel section states and it applies to a rail just as hard: <strong>the control wears the value's own face.</strong> Nobody converts <span class="mono">p7</span> back into a colour, and six shape names are six things to picture and then match. A word is the right control only where the value genuinely has no other face.`,
    ) +
    T.table({
      fig: "Table 8b",
      caption: "The four tools beside the circle-i, and what each draws",
      cols: [{ h: "Tool" }, { h: "Draws" }, { h: "Answers" }],
      body:
        row(
          T.td(`<span class="gl">${icon("palette")}Palette</span>`) +
            T.td("twelve swatches, then the four plates the choice derives") +
            T.td("one identity, and the ramp it implies"),
        ) +
        row(
          T.td(`<span class="gl">${icon("layer-group")}Layers</span>`) +
            T.td("one row per plate, in stack order") +
            T.td("four transparencies, per plate"),
        ) +
        row(
          T.td(`<span class="gl">${icon("hexagon")}Shape</span>`) +
            T.td("six outlines, then three frames at three sizes") +
            T.td("the subject's form, and how much frame it takes"),
        ) +
        row(
          T.td(`<span class="gl">${icon("pen-to-square")}Mode</span>`) +
            T.td("both states, side by side, drawn") +
            T.td("viewing or editing"),
        ),
      scope: "four tools &middot; one cluster &middot; top right",
    }) +
    U.noteBox({
      kind: "caution",
      title: "A picker that changes four things shows the four",
      body: `Choosing one swatch sets a whole ramp, and a grid of twelve with no preview reads as twelve wrong answers to a question about one colour. The palette panel therefore ends in the four plates it just derived. Any control whose one input has more than one output owes the reader that row.`,
    }) +
    /* ------------------------------------------------------------------ 5 */
    U.h2(5, "glyphonly", "Help is a mode, not a hover", icon("circle-question"), {
      hint: "the circle-i, top right",
      hintIc: icon("circle-info"),
      stmt:
        "A tooltip answers a question about a control the reader has already found. It does not answer the one they ask first.",
    }) +
    U.p(
      `Every mark in these rails used to carry a hover plate with two lines: what the control is <em>called</em>, and what pressing it <em>does</em>. It was well meant and it was in the way. The plate opens beside the rail, which is the space the pointer travels through to reach the control next to the one being read, so a reader working down a column of five tools crossed a note on each move and pushed it aside four times. A note that has to be dodged to reach the tool has made the tool worse.`,
    ) +
    U.p(
      `It also answered the wrong question. A tooltip is an answer about <em>one</em> control, and it can only be asked by someone already pointing at that control. The question a reader asks first is asked standing back from the frame: <em>what am I looking at, and where is the thing I want</em>. No amount of per-control hover text answers it, because reading fourteen notes one at a time is not the same act as seeing the shape of the thing.`,
    ) +
    U.p(
      `So the notes came off the controls and became a mode. The <span class="gl">${icon(
        "circle-info",
      )}</span> in the top right raises a number on every cluster and one legend saying what each cluster owns and what is in it &mdash; five circles, in the places the clusters really stand. Out of help mode there is nothing at all between the pointer and the glyph, which is the state the frame is in for the whole of the time any work is being done in it.`,
    ) +
    U.noteBox({
      kind: "good",
      title: "Number the cluster, not the tool",
      body: `Fourteen circles over five plates is a second interface laid across the first one, and the reader has to find the number before they can look it up. Five is a map. It is also the honest unit: a dock owns an axis, and what someone standing back has to learn is which axis lives where &mdash; not which of two adjacent buttons is the plus.`,
    }) +
    U.p(
      `Three rules hold the mode together. The numbers are <strong>furniture</strong>: while they are up the tools are inert, so a reader counting clusters against the legend cannot switch one by pointing at it. Closing the help leaves the frame in <strong>exactly</strong> the state it was opened in &mdash; help that edits the reader's work is worse than no help. And it is a checkbox and two labels, not script, so it survives <strong>scripting being off</strong>: the still is precisely where a reader knows least about what they are looking at, and the least defensible place to lose the help.`,
    ) +
    U.code(
      `<input type="checkbox" class="vp-helpck" id="vw-helpck">
...
<label class="vp-helpmk" for="vw-helpck"
       aria-label="Help mode -- number every cluster and say what it owns">…</label>
...
<span class="vp-grp"><span class="hn" aria-hidden="true">2</span>
  <div class="vp-btns col">…</div>
</span>`,
      { lang: "viewer.ts" },
    ) +
    U.code(
      `.hn{display:none;position:absolute;left:-7px;top:-7px;z-index:19;
  background:var(--tip-paper);border:1px solid var(--ink-muted)}
.h1:checked ~ .vp-lm .hn,.h2:checked ~ .vp-lm .hn{display:flex}
.h1:checked ~ .vp-lm .vp-grp{box-shadow:0 0 0 3px var(--rule)}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.h3("Two presses, because there are two questions", "helpstages") +
    U.p(
      `The circle-i is a <strong>cycle of three</strong>, not a switch. Press it once and every cluster grows an outlined number over the live frame &mdash; nothing is covered, nothing is dimmed, and <strong>every control still works</strong>. That is the state for the reader whose question is <em>which of these is the fourth one</em>: they are reading the numbers in order to use the tools, not instead of using them.`,
    ) +
    U.p(
      `Press it again and the map comes up over the frame. That is a different question &mdash; <em>what is this thing, and where does each part live</em> &mdash; and it is the one a list alone cannot answer. A legend can say &ldquo;Camera, left rail&rdquo;; it cannot tell a reader who has not yet looked away from the middle of the picture <em>which</em> of the two columns the left rail is. The wireframe answers that in a glance, and the numbered rows underneath then say what each cluster owns. A third press puts it away.`,
    ) +
    U.noteBox({
      kind: "good",
      title: "Outlined, never filled",
      body: `A solid disc on this site is a badge, and a badge is a value that belongs to the thing it sits on. Fill the help numbers and they read as data about the subject rather than as a caption about the frame &mdash; so they are hollow, and while they are up each cluster carries the faintest wash to be findable against a moving picture, coming up to a readable outline only under the pointer.`,
    }) +
    U.p(
      `Three radios and three labels, each pointing at the next state, with only the current state's label rendered. It costs one input more than a checkbox and it buys a cycle that runs with scripting off &mdash; which is the case that matters, because a still frame with no captions is exactly where a reader knows least.`,
    ) +
    U.p(
      `While the numbers are up, pointing at a cluster opens a small note beside it &mdash; the number, the cluster's name, the one line of what it owns, and the keys it contains. It opens <em>away</em> from its own rail, so it never leaves the frame and never covers the thing it is describing, and it is inert: no pointer events, no press, nothing to dismiss. It exists only in the first help state. In normal use the same hover does what hover should do on a tool, which is nothing but a cursor change.`,
    ) +
    U.noteBox({
      kind: "good",
      title: "Amber is the subject, teal is the pointer",
      body: `Two colours, two jobs, everywhere on the frame. <strong>Amber</strong> means <em>this is the thing being explained</em> &mdash; the lit circle-i, the numbers, the wash under a numbered cluster, the ring the tour is standing on. <strong>Teal</strong> means <em>this is the thing under your hand</em> &mdash; hover, and only hover. Because they never overlap, a reader can tell at a glance whether a highlight is something the page is saying or something they are doing, without being told.`,
    }) +
    U.h3("The number outranks the card it belongs to", "helpz") +
    U.p(
      `Help mode puts three new things over a frame that already has four layers in it, and the order they stack in is not a detail &mdash; get it wrong and the mode breaks in exactly the way it is meant to fix. The rule is short: <strong>the number sits above the card that explains it</strong>. A reader in help mode is using the number as an index &mdash; they find a circle on the picture, then look for that circle in the legend &mdash; so a card that covers its own number has hidden the one mark the reader is holding their place with, at the precise moment they are using it.`,
    ) +
    T.table({
      fig: "Table 8d",
      caption: "What is over what, on a frame in help mode",
      cols: [{ h: "Layer" }, { h: "z" }, { h: "Why it is there" }],
      body:
        row(
          T.td("The docks and their plates") +
            T.td(`<span class="mono">18</span>`) +
            T.td("above the picture, below everything that explains them"),
        ) +
        row(
          T.td("The pinned explainer") +
            T.td(`<span class="mono">21</span>`) +
            T.td("over the plates, because it is about a plate"),
        ) +
        row(
          T.td("The cluster number") +
            T.td(`<span class="mono">22</span>`) +
            T.td("over its own card &mdash; it is the index into it"),
        ) +
        row(
          T.td("The moved explainer") +
            T.td(`<span class="mono">40</span>`) +
            T.td("fixed to the window, so it is out of the frame's stack entirely"),
        ),
      scope: "one ladder &middot; no layer shares a number with another",
    }) +
    U.h3("Two explainers, one job", "helpcards") +
    U.p(
      `There are two cards, and which one a reader gets depends on whether the script ran. The <strong>pinned</strong> one is plain CSS: it lives inside the cluster, and a side class on the group &mdash; above, below, left, right &mdash; decides which way it opens, chosen once per cluster by where that cluster stands. It is fixed width, inert, and it is the only explainer a still page has, so it opens on hover with no mode required.`,
    ) +
    U.p(
      `The <strong>moved</strong> one is what the script swaps in, and the swap is a class on the frame rather than a rewrite of the markup: <span class="mono">.js-tip</span> suppresses the pinned card and one shared card is positioned per widget instead. It is <span class="mono">position:fixed</span>, which is the whole reason it exists &mdash; a card measured against the window can be clamped to it, and a card measured against a cluster that happens to be sitting in the bottom-right corner cannot. It also caps its own width against the viewport, so it survives a narrow screen, and being one element rather than fourteen it can be given to a touch device that has no hover at all.`,
    ) +
    U.code(
      `.vp-grp.st .vp-hx{top:calc(100% + 8px);left:0}
.vp-grp.sb .vp-hx{bottom:calc(100% + 8px);left:0}
.vp-grp.sl .vp-hx{left:calc(100% + 8px);top:0}
.vp-grp.sr .vp-hx{right:calc(100% + 8px);top:0}
/* With scripting off the pinned card is the only explainer there is. */
.vp:not(.js-tip) .vp-grp:hover .vp-hx{display:block}
.vp-tip{position:fixed;z-index:40;width:min(230px,calc(100vw - 16px));
  pointer-events:none;background:var(--paper-card);border:1px solid var(--rule);
  border-radius:var(--radius);box-shadow:0 6px 18px rgba(0,0,0,.14)}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.noteBox({
      kind: "caution",
      title: "Highlight a group by tinting it, never by drawing a plate around it",
      body: `The first version of the numbered state put a ring round each cluster to say <em>this one</em>. It was a fourth rectangle on a frame that already has a picture, a dock and a plate, and it arrived and left as the pointer travelled. The fix was to say it with what the cluster already owns: point at a group and <em>its own glyphs</em> go teal, the same signal a single tool gives. Nothing new is drawn, so nothing new can be in the way.`,
    }) +
    U.h3("A tour is a caption that moves", "helptour") +
    U.p(
      `The map answers <em>where is everything</em> in one picture, but it cannot pace a reader through five clusters in order. So the card ends with one door &mdash; <span class="gl">${icon(
        "play",
      )}Walk me through it</span> &mdash; and pressing it drops back to the <strong>first</strong> state, not the map. That is deliberate: a tour that keeps the map up would put a card over the very controls it is pointing at. The frame comes back live, the numbers stay, and one cluster at a time takes a doubled amber ring while a small card in the middle of the stage names it and says what it owns.`,
    ) +
    U.p(
      `The card carries four controls and nothing else: pause, back, forward, close. <strong>Back and forward pause first</strong> &mdash; taking the wheel stops the clock, because a reader who reaches for &ldquo;next&rdquo; is reading at their own speed and a timer that keeps running would take the page away from them mid-sentence. Escape closes it, the arrow keys step it, and closing it puts the frame back exactly as it was found: no cluster left highlighted, no state left set, the circle-i dark again.`,
    ) +
    U.noteBox({
      kind: "",
      title: "The tour is the one part that needs script",
      body: `Three states are radios and work with scripting off; a timed walk cannot be. So the door ships <span class="mono">hidden</span> and the script removes the attribute &mdash; the button exists only where it would work. The tour also reads the clusters out of the frame itself rather than carrying its own copy of the list, so a cluster added to the rails is in the tour the moment it renders, and a caption that has drifted from the control it describes is not a failure mode this page has.`,
    }) +
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
    U.h3("Order the siblings so the selectors can reach", "sibs") +
    U.p(
      `A frame that switches without script switches with the sibling combinator, and the combinator only walks <em>forward</em>. So the inputs that hold the state go <strong>before</strong> every dock they have to reach, at the top of the frame &mdash; the three help radios first, then the top dock, the side rails and the bottom bar. Put them where they are visually used, next to the circle-i in the corner, and the rule that lights the left rail silently stops matching: no error, no warning, and a mode that half works.`,
    ) +
    U.p(
      `The other half of the pattern is <span class="mono">:has()</span>, which does not care about order and is what a drawer&rsquo;s tabs are made of. One radio per tab, one panel per tab, and the drawer itself decides which panel shows. Both are the same commitment: <strong>the state lives in an input</strong>, so it survives a script that failed to load, keyboard access is the browser&rsquo;s and not something re-implemented, and a screen reader gets a real radio group rather than a set of buttons wearing one.`,
    ) +
    U.code(
      `<!-- The inputs first, then every dock they light. -->
<input type="radio" name="vp-help" id="vp-h0" class="vp-hm h0" checked>
<input type="radio" name="vp-help" id="vp-h1" class="vp-hm h1">
<input type="radio" name="vp-help" id="vp-h2" class="vp-hm h2">
<div class="vp-top">…</div>
<div class="vp-lm">…</div>`,
      { lang: "viewer.ts" },
    ) +
    U.code(
      `.vp-hm{position:absolute;width:1px;height:1px;opacity:0;
  clip-path:inset(50%);pointer-events:none}
.h2:checked ~ .vp-lm .hn,.h2:checked ~ .vp-bot .hn{display:inline-flex}
/* :has does not need the order, so a drawer's tabs are written locally. */
.dw:has(#wt-ground:checked) .wt-p[data-tab="ground"]{display:block}`,
      { lang: "tokens-extra.ts" },
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
    U.h2(10, "panel", "What is in hand, and where it goes", icon("sliders"), {
      hint: "under, not over",
      hintIc: icon("circle-info"),
      stmt:
        "The decision in hand, stated as a decision, with the tool that decision actually takes -- on the edge the frame shares with it.",
    }) +
    U.p(
      `Rails act on the view. This acts on <em>part of the subject</em>, and that is a different job with a different rule: it has to be readable at the same time as the thing it changes. Press <span class="gl">${icon(
        "pen-to-square",
      )}Editing</span> on <a href="#stage">the stage</a> and a strip appears joined to the frame&rsquo;s bottom edge.`,
    ) +
    U.p(
      `It floated over the lower left first, and that was wrong in a way worth writing down, because the argument for it was sound. A side inspector <em>is</em> worse: a viewport wide enough to be worth having is wide enough that a panel beside it is two glances away, so the reader carries the value across the page in their head. The mistake was concluding from that that it had to go <strong>on</strong> the frame. It only had to be <strong>near</strong> it. Over the frame costs the subject &mdash; the part being edited was under the thing editing it &mdash; and the cost compounded: a panel in the way needs a shut control, and a shut panel needs a badge to reopen from, so two controls existed only to walk back one placement decision. Joined to the bottom edge it is one glance, hides nothing, and needs neither.`,
    ) +
    U.noteBox({
      kind: "good",
      title: "Near the subject, not on it",
      body: `When a control has to be read beside the thing it changes, the shared <em>edge</em> is what buys that, not the overlap. Reach for over-the-content only when the control is genuinely about a point in the content &mdash; a marker, a selection handle &mdash; and not when it is about a property of the whole.`,
    }) +
    U.p(
      `The strip takes the frame&rsquo;s own accent while the frame is editable, on the border the two share, so the pair reads as one object in one state rather than as a frame with a note under it.`,
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
          T.td("<strong>It is up exactly while the frame can be edited</strong>") +
            T.td(
              `One bit, one owner, no second state to keep. The shut-state machinery went with the floating placement: a strip that is out of the way does not need to be dismissed, and a control that cannot be dismissed cannot be lost.`,
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
      `.vw-hand .hb-c{display:flex;gap:5px;flex:none}
.dk-tone{padding:2px;border:1px solid var(--rule);border-radius:3px}
.dk-tone[aria-pressed="true"]{box-shadow:0 0 0 2px var(--stroke-amber);
  border-color:var(--stroke-amber)}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.noteBox({
      kind: "caution",
      title: "Shut and empty are not the same state",
      body: `Leaving edit mode does not clear the plate in hand. The two are independent, so coming back lands the reader where they left rather than at the start &mdash; the same argument as the reset that must not put the layer rail back.`,
    }) +
    U.p(
      `The panel is also where the read-only case is settled. A frame that cannot be edited keeps <strong>every rail</strong> &mdash; looking is something a reader does too &mdash; and loses only the tool that writes. That is why the panel is bound to <span class="mono">editing</span> and nothing else is.`,
    ) +
    U.banner(
      "warn",
      `A control should say what it is about to do, not what is currently true. The label on a toggle reads &ldquo;Stop the plates breathing&rdquo;, not &ldquo;animation: on&rdquo; &mdash; plain English, verb first, and it changes with the state.`,
    ) +
    /* ----------------------------------------------------------------- 12 */
    U.h2(12, "address", "A value with no word in it", icon("table-columns"), {
      hint: "40 characters, 10 per row",
      hintIc: icon("circle-info"),
      stmt:
        "An address is not text. It is forty symbols a reader compares, and the default rendering makes comparing the reader's job.",
    }) +
    U.p(
      `Printed as a run of monospace it answers one question &mdash; <em>here are forty characters</em> &mdash; and leaves the only question anyone actually asks unanswered: <strong>is this the same account as the one I have</strong>. Nobody reads the middle. They read the first four and the last four, which is why every wallet in the world truncates to exactly that, and why the truncation is the honest default rather than a space-saving hack.`,
    ) +
    F.addressBoard() +
    U.p(
      `The board makes that comparison a surface. <strong>Plain</strong> is the character. <strong>Ends</strong> dims the thirty-two nobody reads and leaves the eight they do. <strong>Value</strong> gives each cell a bar the height of its nibble, which turns the address into a small skyline &mdash; a shape two people can agree about over a video call in a way they cannot agree about <span class="mono">c3d4e5f6</span>.`,
    ) +
    U.noteBox({
      kind: "good",
      title: "Sixteen symbols have no colour vocabulary",
      body: `The obvious move is a hue per hex digit. It is wrong here twice over: this site has twelve identities, all of them spoken for, and a reader does not convert a colour back into a digit anyway. A quantity gets a <strong>length</strong>. Colour stays reserved for the things a colour names.`,
    }) +
    U.p(
      `The row length is a constant, not a <span class="mono">minmax()</span>. A board that reflows puts a different character under the same finger at a different window width, which is precisely the mistake the board exists to prevent; at a narrow width it scrolls instead. Same reasoning as the fixed row in the tile dock, where a folding address pushed the tool it belonged to off the bottom of the card.`,
    ) +
    U.code(
      `.ab-grid{display:grid;grid-template-columns:repeat(var(--per),minmax(0,1fr));
  gap:3px;min-width:340px}
.ab-ends:checked ~ .ab-grid .ab-c{color:var(--ink-faint);background:transparent}
.ab-val:checked ~ .ab-grid .ab-c .vb{display:block}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.banner(
      "warn",
      `Nothing on the board writes. A surface built out of forty buttons looks like an editor, so it has to say plainly that it is not one &mdash; the foot does, and the cells only ever select.`,
    ) +
    /* ----------------------------------------------------------------- 13 */
    U.h2(13, "fields", "Fields wear the site's face", icon("pen-to-square"), {
      hint: "no native select",
      hintIc: icon("sliders"),
      stmt:
        "A field is a name, a control and a note. The platform's chrome is what gets replaced -- never the input, which still carries the value and the keyboard.",
    }) +
    U.p(
      `A tool panel is mostly fields, and a default form control is the one element on a page that refuses the type, the spacing and the palette everything else agreed on. A native <span class="mono">&lt;select&gt;</span> opens an operating-system list in an operating-system font at an operating-system size, sitting inside a card built to 9.5px mono. That is not a taste objection. It breaks the one promise the rest of the frame makes: <strong>things that behave alike look alike</strong>.`,
    ) +
    F.fieldSet() +
    U.p(
      `So the value keeps its element and loses its box. A text field is an <span class="mono">&lt;input&gt;</span> with a single bottom rule. A dropdown is a checkbox, two labels and a list of radios &mdash; it opens, it dismisses on the scrim, it records the choice, and it does all three with scripting switched off; the script only mirrors the chosen word onto the face. A number gets two hands instead of a spinner, and a switch is labelled with the sentence it is about to carry out, not the state it is in.`,
    ) +
    U.twoUp(
      U.dont(`<select><option>Peach</option></select>
<input type="number" min="0" max="9">`),
      U.doThis(`<span class="fp"><input type="checkbox" id="fp1">
  <label class="fp-f" for="fp1">...</label>
  <label class="scrim" for="fp1"></label>
  <span class="fp-p"><label class="fp-o"><input type="radio" ...`),
    ) +
    U.noteBox({
      kind: "caution",
      title: "Replace the chrome, keep the element",
      body: `A div with a click handler is not a control. Everything above is still a label, a button, an input or a radio, so focus order, the keyboard, form submission and a screen reader all keep working. The moment a picker stops being radios it stops being reachable, and the only person who notices is the one who cannot use it.`,
    }) +
    U.p(
      `The panel's foot restates what is stored, in the same words the fields used &mdash; the same rule as the tile dock, where a decision is stated as an imperative with a subject rather than as a setting name. A reader who has changed four things needs one sentence telling them what they changed, not four labels to re-read.`,
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
    /* ----------------------------------------------------------------- 14 */
    U.h2(14, "instruments", "Instruments, and where a reading lives", icon("palette"), {
      hint: "drawer, dial, chip",
      hintIc: icon("circle-info"),
      stmt:
        "A rail holds the tools that have two answers. Everything with more answers than that lives in a drawer, and a drawer is built out of four parts and no more.",
    }) +
    U.p(
      `A frame with real depth behind it runs out of rail long before it runs out of settings. The rule that keeps the rails honest &mdash; a glyph is a tool, and a tool has one or two answers &mdash; means the twenty-odd numbers that shape what is on the stage have to live somewhere else. They live in a drawer, and the drawer is deliberately made of a very small kit: a titled sheet, a row that shows one number, a segmented control, and a grid of chips. Four parts covers every setting on this page. A fifth part would be a new thing for a reader to learn in exchange for one screen.`,
    ) +
    U.h3("A drawer is a sheet, not a menu", "drawer") +
    U.p(
      `It opens as paper on the same ground as the page: a head with the name and a close mark pushed to the right by <span class="mono">margin-left:auto</span>, a body on a two-column grid with a fixed left column and a fluid right one, and a foot restating what was changed. It is not a dropdown and it does not float over the subject if it can avoid it &mdash; a reader who opens the shape settings is going to change several of them and then look at the result, so the drawer stays put while they work and closes when they are done. Its tabs are the <span class="mono">:has()</span> pattern from &sect;8: a radio per tab, and the drawer picks the panel.`,
    ) +
    U.h3("A dial is a label, a bar and a number", "dial") +
    U.p(
      `Every numeric setting on the page is the same row, and it is a grid rather than a flex line so that thirty rows in four panels align down their whole length: a fixed label column, a bar that takes the slack, and a fixed value column. Rows are separated by the hairline rule, never by space &mdash; a list of thirty settings broken up with gaps is twice as tall and no easier to read.`,
    ) +
    T.table({
      fig: "Table 9c",
      caption: "The four cells of a dial row, and what each one is allowed to do",
      cols: [{ h: "Cell" }, { h: "Width" }, { h: "Behaviour" }],
      body:
        row(
          T.td("Label") +
            T.td(`<span class="mono">92px</span>`) +
            T.td("plain text, no wrap, no colon"),
        ) +
        row(
          T.td("Bar") +
            T.td(`<span class="mono">1fr</span>`) +
            T.td(
              `6px tall, filled in <span class="mono">--accent</span>, going <span class="mono">--stroke-amber</span> under the pointer &mdash; the same two colours as a tool`,
            ),
        ) +
        row(
          T.td("Steppers") +
            T.td("two glyph cells") +
            T.td("one increment each, held down to repeat, disabled at the ends"),
        ) +
        row(
          T.td("Value") +
            T.td(`<span class="mono">46px</span>`) +
            T.td("mono, tabular, and an editable field wearing no chrome until pointed at"),
        ),
      scope: "every numeric setting on the page &middot; one row shape, four panels",
    }) +
    U.code(
      `.dl-row{display:grid;grid-template-columns:92px 1fr 46px;align-items:center;
  gap:7px;padding:2px 0}
.dl-row + .dl-row{border-top:1px solid var(--rule-hair)}
.dl-bar{flex:1;min-width:0;height:6px;border-radius:var(--radius-sm);
  background:var(--rule-soft)}
.dl-bar > i{display:block;height:100%;background:var(--accent)}
.dl-bar:hover > i{background:var(--stroke-amber)}
/* The value is a real input with its platform costume taken off. */
.dl-ve{appearance:none;background:none;border:1px solid transparent;cursor:text}
.dl-ve:hover{border-color:var(--rule-soft);color:var(--ink)}
.dl-ve:focus-visible{outline:1px solid var(--accent);outline-offset:1px}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.noteBox({
      kind: "good",
      title: "A field that looks like text until it is worth looking like a field",
      body: `Thirty boxed inputs stacked in a panel is thirty rectangles competing with the picture they are meant to be shaping. So the value renders as the reading it is &mdash; mono, tabular, no border &mdash; and grows a hairline only under the pointer, a real focus ring only when focused. It is still an <span class="mono">input</span>: typed, validated, tabbable, and submittable. The chrome went, the element stayed &mdash; the same trade as the fields in &sect;13.`,
    }) +
    U.h3("A choice of four is segmented; a choice of sixteen is chips", "choices") +
    U.p(
      `Both are radios and both take amber when chosen, and the only question is how many there are. Up to about four short words it is a segmented control &mdash; one plate, hairline-divided, the chosen label carrying <span class="mono">--pastel-amber</span>. Past that it stops being readable as a row of words and becomes a grid of swatches, where the chosen one is ringed in <span class="mono">--ink</span> with an inset hairline of paper so the ring never sits directly against a colour it might disappear into. A swatch grid says <em>pick one of these things</em> without asking the reader to read sixteen names.`,
    ) +
    U.h3("Two readings that are not controls", "readouts") +
    U.p(
      `Some numbers are not settings, and they must not be dressed as any of the above. There are two of them and they sit in two different places. The <strong>in-glass readout</strong> is a small mono stack in the top-left of the picture itself, teal-free, ground-free, and <span class="mono">pointer-events:none</span> &mdash; it is printed on the glass, so it can never take a click that was meant for the subject underneath it. The <strong>census</strong> sits under the whole frame as an auto-fitting row of blocks, each a label over a figure, mono and tabular so a figure that ticks does not shove the ones beside it.`,
    ) +
    U.code(
      `.stage-hud{position:absolute;left:9px;top:9px;z-index:6;display:flex;
  flex-direction:column;gap:2px;font:400 9.5px var(--font-mono);
  color:var(--ink-muted);pointer-events:none}
.vw-stats{display:grid;gap:10px;margin-top:10px;
  grid-template-columns:repeat(auto-fit,minmax(168px,1fr))}
.vw-stats .st-g{display:grid;gap:2px 8px;grid-template-columns:1fr auto}`,
      { lang: "tokens-extra.ts" },
    ) +
    U.noteBox({
      kind: "",
      title: "The hand bar joins the frame; it does not sit under it",
      body: `The strip that says what is in hand is on the frame&rsquo;s bottom edge with <span class="mono">border-top:0</span> and only its bottom corners rounded, so the two share one border and read as one body. Give it its own full border and a gap and it becomes a caption under a picture &mdash; which is exactly what it is not: it is the part of the frame that reports the frame&rsquo;s own state.`,
    }) +
    /* ----------------------------------------------------------------- 15 */
    U.h2(15, "application", "The whole application, ringed", icon("diagram-project"), {
      hint: "citygen",
      hintIc: icon("circle-info"),
      stmt:
        "Seven docks are a vocabulary; this is what the vocabulary looks like once a real three.js tool has filled every one of them and had to survive a phone.",
    }) +
    U.p(
      `A generator is the hardest case for this grammar, because it has more knobs than any one frame should show and none of them are optional. The rule that holds it together is that <strong>the controls ring the picture and never sit under it</strong>: identity top left, presentation top right, eye on the left rail, layers on the right, the frame&rsquo;s own verbs bottom left, the subject&rsquo;s geometry bottom centre, readouts bottom right. Everything a reader has to hunt for is a dock that was given the wrong axis, not a control that was drawn badly.`,
    ) +
    U.h3("Six stances, one target", "stances") +
    U.p(
      `Two cameras, six named stances, and one focus point shared by all of them &mdash; so switching never loses your place. Three of the stances pin the pair of angles they are named for; three keep whatever you had. A stance that pins its pitch still lets you spin the bearing: you may turn a plan view round, you just cannot tip it out of plan.`,
    ) +
    T.table({
      fig: "Table 10",
      caption: "The six camera stances, and the angles each is pinned to",
      cols: [{ h: "Stance" }, { h: "Camera" }, { h: "Pinned to" }],
      body:
        row(T.td(`<span class="gl">${icon("arrows-up-down-left-right")}Orbit</span>`) + T.td("perspective") + T.td("&mdash; free")) +
        row(T.td(`<span class="gl">${icon("play")}Fly through</span>`) + T.td("perspective") + T.td("&mdash; free")) +
        row(T.td(`<span class="gl">${icon("clone")}Flat</span>`) + T.td("orthographic") + T.td(`<span class="mono">89.9 deg</span> straight down`)) +
        row(T.td(`<span class="gl">${icon("hexagon")}Isometric</span>`) + T.td("orthographic") + T.td(`<span class="mono">35.264 deg</span>, three axes measure alike`)) +
        row(T.td(`<span class="gl">${icon("table-columns")}Paraline</span>`) + T.td("orthographic") + T.td(`<span class="mono">30 deg</span>, board-drawing convention`)) +
        row(T.td(`<span class="gl">${icon("eye")}Angle</span>`) + T.td("orthographic") + T.td("&mdash; parallel lines, free bearing")),
      scope: "one focus point &middot; six stances &middot; switching keeps your place",
    }) +
    U.noteBox({
      kind: "good",
      title: "Home is a fraction of the world, not a number of metres",
      body: `Every distance in the rig is expressed as a multiple of the world&rsquo;s half-width &mdash; the eye stands at <span class="mono">extent &times; 1.9</span>, the orthographic half-height is <span class="mono">extent &times; 1.05</span>, the near plane is a ten-thousandth of it. Hard-code metres instead and the app opens <em>inside</em> the city the moment the subject is regenerated at another size, or the whole subject falls behind a near plane cut for a world four hundred times larger. Anything that can be a ratio should be one.`,
    }) +
    U.code(
      `const HOME_DIST = 1.9;   // eye distance, as a multiple of the half-width
const HOME_SPAN = 1.05;  // orthographic half-height, likewise
function nearFor(extent: number) { return Math.max(0.01, extent * 0.0008); }`,
      { lang: "view/cameras.ts" },
    ) +
    U.h3("One menu, never two", "collapse") +
    U.p(
      `A ring of seven docks is a desktop shape. On a phone the rails have nowhere to stand, and the failure everybody reaches for first &mdash; make the controls thinner &mdash; is the wrong one: it changes the chair. The control keeps its size and shape; what changes is <em>how many of them are showing</em>. The strips consolidate into <strong>one</strong> collapsed menu in the top left, settings stay top right, and the plan drops into the space the bottom strip vacated. Two collapsing menus is worse than none, because the reader now has to remember which half of the tool went into which.`,
    ) +
    U.tiles([
      { k: "Docks, desktop", v: "7", s: "ringing the frame" },
      { k: "Docks, phone", v: "3", s: "menu, settings, plan" },
      { k: "Control size", v: "unchanged", s: "count collapses, shape does not" },
      { k: "Gestures", v: "pinch, drag", s: "zoom and turn without a control" },
    ]) +
    U.h3("Help is an overlay of numbers, not a tour", "helpmode") +
    U.p(
      `Pressing the question mark does not start a walkthrough; it drops a thin wireframe of the frame you are already looking at, with a small amber circle on every control, the plan and each readout badge. The circles are numbered <strong>in one direction round the ring</strong> &mdash; a numbering that jumps across the frame is a numbering nobody follows. Circles that would fall under a neighbouring control move out, never under: a clipped help number is worse than an absent one. Same overlay on both widths, redrawn for the collapsed layout rather than scaled down.`,
    ) +
    U.h3("What the frame reports about itself", "census") +
    U.p(
      `Two readings, two places, and they are not interchangeable. The <strong>in-glass HUD</strong> is a small mono stack printed on the picture &mdash; stance, distance, bearing, frame time &mdash; and it is <span class="mono">pointer-events:none</span>, so it can never eat a drag meant for the subject underneath it. The <strong>census</strong> sits under the whole frame as an auto-fitting row of label-over-figure blocks: polygons, buildings by kind, trees, water surface, land area, memory. Mono and tabular, so a figure that ticks does not shove its neighbours.`,
    ) +
    U.noteBox({
      kind: "",
      title: "The budget is a control, not a warning",
      body: `A generator that can outrun the frame rate needs the reader to be able to <em>spend</em>, not to be told off afterwards. So the polygon budget is a dial on the ring with the same shape as every other dial, the frame time sits beside it, and the two are read together. A modal that appears when the scene got too heavy is a design that waited until it was too late to be useful.`,
    }) +
    /* ----------------------------------------------------------------- 16 */
    U.h2(16, "audits", "Four audits, run before anything is built", icon("circle-check"), {
      hint: "build gate",
      hintIc: icon("gear"),
      stmt:
        "Every rule on this page that can be checked mechanically is checked mechanically, and the build fails rather than the page looking wrong in production.",
    }) +
    U.p(
      `A spec that is only prose decays &mdash; the second contributor pastes a raw hex out of another dashboard because it was quicker, and the page grows a second green. These four scripts are the parts of this document that a machine can enforce. They run in <span class="mono">lint</span> and <span class="mono">build</span>, before the type check and before a single file is emitted.`,
    ) +
    T.table({
      fig: "Table 11",
      caption: "The four build audits, and what each one refuses",
      cols: [{ h: "Script" }, { h: "What it refuses" }, { h: "Runs on" }],
      body:
        row(
          T.td(`<span class="mono">design-lint.ts</span>`) +
            T.td("raw hex, <span class=\"mono\">rgb()</span> and named colours outside the token file; a colour is a name or it is a build error") +
            T.td(`<span class="mono">src</span>`),
        ) +
        row(
          T.td(`<span class="mono">badge-lint.ts</span>`) +
            T.td("badges with an inline colour, a rounded corner or a width off the scale &mdash; one width per column, including the empty and error states") +
            T.td(`<span class="mono">src</span>`),
        ) +
        row(
          T.td(`<span class="mono">token-lint.ts</span>`) +
            T.td("a <span class=\"mono\">var(--&hellip;)</span> the stylesheet has never heard of; the failure mode it prevents is a blank canvas in a browser") +
            T.td(`<span class="mono">src</span>`),
        ) +
        row(
          T.td(`<span class="mono">script-lint.ts</span>`) +
            T.td("emitted HTML that needs JavaScript to read; the page must be correct with scripting off") +
            T.td(`<span class="mono">dist/*.html</span>`),
        ),
      scope: "four scripts &middot; zero runtime deps &middot; the build gate, not a report",
    }) +
    U.code(
      `"lint":  "bun run src/design-lint.ts src && bun run src/badge-lint.ts src && bun run src/token-lint.ts",
"build": "bun run lint && bunx tsc --noEmit && bun run src/index.ts && bun run src/script-lint.ts dist/*.html"`,
      { lang: "package.json" },
    ) +
    U.noteBox({
      kind: "good",
      title: "Local declarations are not violations",
      body: `The token audit walks every file for <span class="mono">var(--&hellip;)</span> and checks the name against the stylesheet &mdash; but a file that writes <span class="mono">.vp{--vp-in:6px}</span> has declared a local dimension, not reached for a theme colour it invented. The check collects each file&rsquo;s own declarations first and exempts them. A lint that cannot tell those apart gets switched off within a week, which is worse than not having it.`,
    }) +
    U.p(`Back to the spec: <a href="./index.html">index.html</a>.`)
  );
}
