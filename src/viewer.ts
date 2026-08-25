/**
 * The three.js stage, and the viewport grammar it exists to demonstrate.
 *
 * The first version of this page put four abstract shapes on a dark rectangle
 * and a row of badges underneath it. Two things were wrong with that, and they
 * are the same thing twice.
 *
 * The subject floated. There was no ground, no horizon and no contact, so the
 * shapes did not sit anywhere -- and a viewport whose subject is not anchored to
 * the frame reads as a picture of an object rather than as a view onto a scene.
 * Everything a viewport control does is relative: closer to what, apart from
 * what, above what. With nothing underneath, none of those verbs had an object.
 * So the subject is now a stack of plates standing on a lit ground plane, and
 * the plane is drawn: a rule grid, in the same tokens as everything else.
 *
 * And the controls sat outside the frame. A rail under a picture is a toolbar
 * for the page; a rail inside the frame is a control on the view. The
 * difference is not decoration -- put four of these side by side and the
 * external toolbars stack into a wall of buttons that no longer say which frame
 * they belong to. Every control now docks inside the viewport it acts on, in
 * the six places `ui.ts` names, and the frame is the only thing that has to be
 * pointed at.
 *
 * The still underneath all of it has not changed job. A WebGL view is the one
 * component on this site that genuinely cannot work with scripting off, which
 * makes it the best place to show what progressive enhancement costs: a flat
 * isometric SVG of the same subject, present in the markup from the start, and
 * hidden only once a real frame has been produced -- `.stage.on`. Never a blank
 * rectangle where a picture should be.
 *
 * three.js is vendored into `public/vendor/`, not pulled from a CDN. A page that
 * fetches its renderer from someone else's origin has a third party in its
 * dependency chain, a second point of failure, and a different Content-Security
 * -Policy problem on every deploy target.
 */
import { esc } from "./html.ts";
import { icon } from "./icons.ts";
import { nextFig } from "./charts.ts";
import * as U from "./ui.ts";

/** The four plates, named. The stack is a tile: nine squares, drawn four times,
 *  each pass adding to what the pass below it left. The names are the point of
 *  the layer rail -- a rail of four numbered checkboxes says nothing about what
 *  turning one off would remove. */
export const PLATES: readonly { k: string; name: string; tone: string }[] = [
  { k: "ground", name: "Ground", tone: "p1" },
  { k: "form", name: "Form", tone: "p4" },
  { k: "mark", name: "Mark", tone: "p7" },
  { k: "gloss", name: "Gloss", tone: "p10" },
];

/**
 * A glyph-only control, and where its note went.
 *
 * These carried a hover plate saying what each one was called and what pressing
 * it did. That plate answered the question a reader asks about a control they
 * are already pointing at -- and to answer it, it opened beside the rail, under
 * the pointer, across the route to the control next to the one being read. A
 * note that has to be dodged to reach the tool has made the tool worse.
 *
 * So the note came off the control. Every cluster registers itself as it is
 * built and takes the next number, and the numbers are raised only in help
 * mode: the circle-i in the top right brings them up together with one legend
 * saying what each cluster owns and what is in it. Out of help mode there is
 * nothing between the pointer and the glyph, which is the state the frame is in
 * for all of the time any work is being done in it.
 *
 * This is the split tile draws. A tooltip answers a question about one control
 * the reader has already found. It does not answer the one they ask first,
 * standing back from the frame: what am I looking at, and where is the thing I
 * want. Those are different questions and they want different furniture.
 */
type Grp = {
  n: number;
  name: string;
  owns: string;
  tools: { name: string; note: string }[];
};

/** The clusters of this frame, in build order. `stage()` clears it per frame. */
let REG: Grp[] = [];
/** Tools built since the last cluster closed. `tool()` fills it, `grp()` drains it. */
let PEND: { name: string; note: string }[] = [];

function tool(
  o: { ic: string; name: string; note: string; act: string; on?: boolean; off?: boolean },
): string {
  PEND.push({ name: o.name, note: o.note });
  return (
    `<button type="button" class="vt" data-act="${esc(o.act)}"` +
    (o.on === undefined ? "" : ` aria-pressed="${o.on}"`) +
    (o.off === true ? " disabled" : "") +
    ` aria-label="${esc(o.name)}">` +
    `<span class="badge w3 bare">${icon(o.ic)}</span></button>`
  );
}

/**
 * Close a cluster: take the next number, and hang it on the cluster's plate.
 *
 * The number goes on the cluster and not on each tool. Fourteen circles over
 * five plates is a second interface laid across the first one; five circles is
 * a map. It is also the honest unit -- a dock owns an axis, and what a reader
 * standing back has to learn is which axis lives where, not which of two
 * adjacent buttons is the plus.
 */
function grp(
  name: string,
  owns: string,
  inner: string,
  side: "t" | "b" | "l" | "r" = "t",
): string {
  const n = REG.length + 1;
  const tools = PEND;
  REG.push({ n, name, owns, tools });
  PEND = [];
  const keys = tools.map((t) => esc(t.name)).join(" &middot; ");
  return (
    `<span class="vp-grp s${side}" data-n="${n}" data-name="${esc(name)}"` +
    ` data-owns="${esc(owns)}" data-keys="${keys}">` +
    `<span class="hn" aria-hidden="true">${n}</span>` +
    inner +
    `<span class="vp-hx" aria-hidden="true"><b>${n}. ${esc(name)}</b>` +
    `<span class="o">${esc(owns)}</span><span class="k">${keys}</span></span>` +
    `</span>`
  );
}

/** A rail: a column of tools on one plate, docked to a side of the frame. */
function rail(side: "lm" | "rm", label: string, inner: string): string {
  return `<div class="vp-${side}" role="group" aria-label="${esc(label)}">${inner}</div>`;
}

/** The camera rail. Distance only -- what the eye does, never what the subject
 *  does. See the note in `viewer.ts` on why the magnifier is reserved. */
function cameraRail(): string {
  const btns =
    `<div class="vp-btns col">` +
    tool({
      ic: "magnifying-glass-plus",
      name: "Closer",
      note: "Moves the eye in one rung. Five rungs; the subject does not change size.",
      act: "cam+",
    }) +
    tool({
      ic: "magnifying-glass-minus",
      name: "Further",
      note: "Moves the eye out one rung.",
      act: "cam-",
    }) +
    tool({
      ic: "arrow-rotate-left",
      name: "Home",
      note: "Puts the eye back where the frame opened. Spread and layers are left alone.",
      act: "cam0",
    }) +
    `<span class="vp-rung" id="vw-rung" aria-hidden="true">2/5</span>` +
    `</div>`;
  return rail(
    "lm",
    "Camera",
    grp(
      "Camera",
      "Where the eye stands. Never the subject: nothing here resizes a plate.",
      btns,
      "l",
    ),
  );
}

/** The layer rail. One badge per plate, pressed when the plate is standing. */
function layerRail(): string {
  const btns =
    `<div class="vp-btns col">` +
    PLATES.map((p, i) => {
      PEND.push({
        name: p.name,
        note: `Plate ${i + 1} of ${PLATES.length}. Hidden plates keep their place in the stack.`,
      });
      return (
        `<button type="button" class="vt" data-layer="${esc(p.k)}" aria-pressed="true"` +
        ` aria-label="${esc(p.name)}">` +
        `<span class="badge w3 bare ${p.tone}">${icon("layer-group")}</span></button>`
      );
    }).join("") +
    `</div>`;
  return rail(
    "rm",
    "Layers",
    grp(
      "Layers",
      "Which of the subject's plates are standing. One control per plate, named.",
      btns,
      "r",
    ),
  );
}

/** Apart and together: the subject's own geometry, not the camera's. */
function spreadDock(): string {
  const btns =
    `<div class="vp-btns">` +
    tool({
      ic: "minus",
      name: "Together",
      note: "Closes the stack one stop. At zero the four plates are one tile.",
      act: "sp-",
      off: true,
    }) +
    `<span class="vp-rung" id="vw-stop" aria-hidden="true">0/4</span>` +
    tool({
      ic: "plus",
      name: "Apart",
      note: "Lifts the plates one stop so what each one contributes can be seen on its own.",
      act: "sp+",
    }) +
    `</div>`;
  return grp(
    "Spread",
    "The subject's own geometry, opened and closed. The eye does not move.",
    btns,
    "b",
  );
}

/** What the frame is doing, as distinct from what it is looking at. */
function stateDock(): string {
  const btns =
    `<div class="vp-btns">` +
    tool({
      ic: "arrows-up-down-left-right",
      name: "Turn",
      note: "Rotates the stack. Off while you are reading a plate; the motion is the first thing that gets in the way.",
      act: "spin",
      on: true,
    }) +
    tool({
      ic: "table-columns",
      name: "Edges",
      note: "Draws the wireframe only. The same geometry, without the fill.",
      act: "wire",
      on: false,
    }) +
    `</div>`;
  return grp(
    "Motion",
    "What the frame is doing, as distinct from what it is looking at.",
    btns,
    "b",
  );
}

/** The six shapes a plate can be cut to. Drawn, not named: a list reading
 *  "hexagon, diamond, chamfer" asks the reader to picture six things and then
 *  match them, when showing six things costs the same twenty pixels each. */
const SHAPES: readonly { k: string; name: string; pts: string; on?: boolean }[] = [
  { k: "sq", name: "Square", pts: "1,1 19,1 19,15 1,15" },
  { k: "di", name: "Diamond", pts: "10,1 19,8 10,15 1,8", on: true },
  { k: "hx", name: "Hex", pts: "5,1 15,1 19,8 15,15 5,15 1,8" },
  { k: "ch", name: "Chamfer", pts: "4,1 19,1 19,12 16,15 1,15 1,4" },
  { k: "tr", name: "Wedge", pts: "1,15 10,1 19,15" },
  { k: "pl", name: "Plate", pts: "3,1 19,4 17,15 1,12" },
];

/** The identity swatches a frame may tint from. Twelve, because that is what
 *  the stylesheet holds -- the picker does not get to invent a thirteenth. */
const SWATCHES: readonly string[] = [
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12",
];

/** Register a picker with the cluster's legend the way `tool()` does for a
 *  glyph button. A picker that does not register is a control the help mode
 *  cannot name, and the legend then lists three of a cluster's four tools. */
function pend(name: string, note: string): void {
  PEND.push({ name, note });
}

/** Shape, and how much of the frame the subject takes.
 *
 *  Two settings in one tool because they are one question -- what the plate is
 *  cut to and how big it sits -- and because six shapes and three sizes are
 *  nine states nobody wants nine glyphs for. */
function shapePick(): string {
  pend("Shape", "Six cuts and three sizes, drawn. Neither moves the eye.");
  const shapes =
    `<span class="pk-grid sh">` +
    SHAPES.map(
      (s) =>
        `<button type="button" class="pk-sw${s.on ? " on" : ""}" data-shape="${esc(s.k)}"` +
        ` aria-pressed="${s.on ? "true" : "false"}" title="${esc(s.name)}"` +
        ` aria-label="${esc("Cut the plates to " + s.name.toLowerCase())}">` +
        `<svg viewBox="0 0 20 16" width="24" height="19" aria-hidden="true">` +
        `<polygon points="${s.pts}" fill="var(--pastel-aqua)" stroke="var(--stroke-aqua)"></polygon>` +
        `</svg></button>`,
    ).join("") +
    `</span>`;
  const fills = [
    { k: "0", n: "Small", r: 5 },
    { k: "1", n: "Medium", r: 7 },
    { k: "2", n: "Full", r: 9 },
  ];
  const size =
    `<span class="pk-sub">Size in frame</span>` +
    `<span class="pk-grid fl">` +
    fills.map(
      (f) =>
        `<button type="button" class="pk-sw${f.k === "1" ? " on" : ""}" data-fill="${f.k}"` +
        ` aria-pressed="${f.k === "1" ? "true" : "false"}" title="${esc(f.n)}"` +
        ` aria-label="${esc("Set the subject to " + f.n.toLowerCase())}">` +
        `<svg viewBox="0 0 24 19" width="24" height="19" aria-hidden="true">` +
        `<rect x="1.5" y="1.5" width="21" height="16" rx="2" fill="none"` +
        ` stroke="var(--rule)"></rect>` +
        `<rect x="${12 - f.r}" y="${9.5 - f.r * 0.62}" width="${f.r * 2}"` +
        ` height="${f.r * 1.24}" rx="1.5" fill="var(--pastel-aqua)"` +
        ` stroke="var(--stroke-aqua)"></rect>` +
        `</svg></button>`,
    ).join("") +
    `</span>`;
  return U.vpPick({
    mark: icon("hexagon"), title: "Plate shape", body: shapes + size, rt: true, w: "w3",
  });
}

/** The identity swatch, and the ramp the four plates are actually painted from.
 *
 *  The ramp is the half a grid of twelve cannot say. Picking p4 does not set
 *  one colour, it sets four -- every third swatch round the wheel -- and a
 *  reader who cannot see that reads the grid as twelve wrong answers. */
function tonePick(): string {
  pend("Palette", "One swatch sets four: the base, and every third one after it.");
  const grid =
    `<span class="pk-grid tn">` +
    SWATCHES.map(
      (t, i) =>
        `<button type="button" class="pk-sw${i === 3 ? " on" : ""}" data-tone="${esc(t)}"` +
        ` aria-pressed="${i === 3 ? "true" : "false"}" title="${esc(t)}"` +
        ` aria-label="${esc("Tint the plates from swatch " + t)}">` +
        `<span class="badge w3 ${t}"></span></button>`,
    ).join("") +
    `</span>`;
  const ramp =
    `<span class="pk-sub">The four plates it makes</span>` +
    `<span class="pk-ramp" id="pk-ramp" aria-hidden="true">` +
    PLATES.map(
      (p, i) =>
        `<span class="rp"><span class="badge w7 ${p.tone}" data-ramp="${i}"></span>` +
        `<span class="n">${esc(p.name)}</span></span>`,
    ).join("") +
    `</span>`;
  return U.vpPick({
    mark: icon("palette"), title: "Identity swatch", body: grid + ramp, rt: true, w: "w3",
  });
}

/** Transparency, one plate at a time.
 *
 *  The rail on the right edge answers standing or away, which is one bit and
 *  belongs on a rail. How far through a plate the one under it shows is four
 *  values, and four values do not fit on a bit. Drawn as the elevation the
 *  stack actually has, so the row a reader presses is in the position the
 *  plate it changes is in. */
const OPAC: readonly { k: string; n: string }[] = [
  { k: "100", n: "Solid" },
  { k: "70", n: "Most" },
  { k: "40", n: "Half" },
  { k: "15", n: "Ghost" },
];

function layerPick(): string {
  pend("Layers", "How far through each plate the one below it shows. Four stops.");
  const rows = PLATES.map((p, i) => {
    const cells = OPAC.map(
      (o) =>
        `<button type="button" class="pk-op${o.k === "100" ? " on" : ""}"` +
        ` data-op="${i}:${o.k}" aria-pressed="${o.k === "100" ? "true" : "false"}"` +
        ` title="${esc(p.name + " -- " + o.n)}"` +
        ` aria-label="${esc("Set the " + p.name + " plate to " + o.n.toLowerCase())}">` +
        `<svg viewBox="0 0 18 12" width="18" height="12" aria-hidden="true">` +
        `<rect x="1" y="2.5" width="16" height="7" rx="1.5"` +
        ` fill="var(--pastel-aqua)" fill-opacity="${Number(o.k) / 100}"` +
        ` stroke="var(--stroke-aqua)"></rect></svg></button>`,
    ).join("");
    return (
      `<span class="pk-lrow"><span class="badge w3 bare ${p.tone}" data-ramp="${i}"` +
      ` aria-hidden="true">${icon("layer-group")}</span>` +
      `<span class="n">${esc(p.name)}</span><span class="c">${cells}</span></span>`
    );
  }).join("");
  return U.vpPick({
    mark: icon("layer-group"), title: "Plate transparency",
    body: `<span class="pk-lay">${rows}</span>`, rt: true, w: "w3",
  });
}

/** Viewing or editing, said as the two frames rather than as one switch.
 *
 *  A press that flips a mode with no picture of the other side is a control a
 *  reader has to try to read. Two drawn choices, both visible at once, and the
 *  one the frame is in is the one that is lit. */
function modePick(): string {
  pend("Mode", "Whether the plates can be picked and changed, or only looked at.");
  const opt = (
    k: string, name: string, note: string, on: boolean, art: string,
  ): string =>
    `<button type="button" class="pk-mode${on ? " on" : ""}" data-mode="${esc(k)}"` +
    ` aria-pressed="${on ? "true" : "false"}" aria-label="${esc(name)}">` +
    `<svg viewBox="0 0 44 26" width="44" height="26" aria-hidden="true">` +
    `<rect x="1" y="1" width="42" height="24" rx="3" fill="var(--paper-card)"` +
    ` stroke="var(--rule)"></rect>${art}</svg>` +
    `<span class="n"><b>${esc(name)}</b>${esc(note)}</span></button>`;
  const viewing = opt(
    "0", "Viewing", "Rails only", true,
    `<rect x="9" y="8" width="26" height="10" rx="2" fill="var(--pastel-aqua)"` +
      ` stroke="var(--stroke-aqua)"></rect>`,
  );
  const editing = opt(
    "1", "Editing", "Plates pickable", false,
    `<rect x="3" y="3" width="38" height="20" rx="2" fill="none"` +
      ` stroke="var(--accent)" stroke-dasharray="3 2"></rect>` +
      `<rect x="9" y="8" width="26" height="10" rx="2" fill="var(--pastel-aqua)"` +
      ` stroke="var(--accent)"></rect>`,
  );
  return U.vpPick({
    mark: icon("pen-to-square"), title: "What the frame is",
    body: `<span class="pk-modes">${viewing}${editing}</span>`, rt: true, w: "w3",
  });
}

/** The top-right cluster: four tools, each one drawn.
 *
 *  Every one of these was a glyph that either cycled silently or flipped a
 *  mode with no picture of the other side, and the reader had to press it to
 *  find out what it was. A tool that opens is not more furniture -- it is the
 *  same glyph, with the states it owns visible before the press instead of
 *  after it. */
function frameDock(): string {
  const btns =
    `<div class="vp-btns">` + tonePick() + layerPick() + shapePick() + modePick() + `</div>`;
  return grp(
    "Tools",
    "What the frame does to the subject's presentation. Never its geometry.",
    btns,
  );
}

/** Where each cluster sits on the frame, for the wireframe. Keyed by the name
 *  the cluster registered, so a cluster that moves has to move here too. */
const POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  Tools: { x: 146, y: 7, w: 66, h: 17 },
  Camera: { x: 8, y: 42, w: 17, h: 56 },
  Layers: { x: 215, y: 42, w: 17, h: 56 },
  Motion: { x: 8, y: 124, w: 46, h: 17 },
  Spread: { x: 74, y: 124, w: 50, h: 17 },
};

/**
 * The wireframe. Not a screenshot and not a diagram of the subject: an outline
 * of the frame itself with every cluster drawn where it actually docks.
 *
 * This is the half a legend cannot do. A list can say "Camera, left rail"; it
 * cannot answer "which of the two columns is the left rail" for a reader who
 * has not yet looked away from the middle of the picture. The map answers that
 * in one glance and then the numbered rows say what each one owns.
 *
 * No <style> element inside the svg -- an inline svg style is document-global.
 * Everything here is either an attribute or a rule scoped to `.hl-wire`.
 */
function helpWire(): string {
  /* Two passes, and the order is the whole point. A number drawn inside its
     own group is painted before the next cluster's box, so on the two rails
     that overlap in the corner the later box covers the earlier number.
     Boxes first, numbers second: paint order is the only z-index an svg has. */
  const seen = REG.filter((g) => POS[g.name] !== undefined);
  const boxes = seen.map((g) => {
    const p = POS[g.name];
    if (!p) return "";
    return `<rect class="b" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3"></rect>`;
  }).join("");
  const nums = seen.map((g) => {
    const p = POS[g.name];
    if (!p) return "";
    return (
      `<g class="n">` +
      `<circle cx="${p.x + 1}" cy="${p.y + 1}" r="6.5"></circle>` +
      `<text x="${p.x + 1}" y="${p.y + 3.6}" text-anchor="middle">${g.n}</text>` +
      `</g>`
    );
  }).join("");
  return (
    `<svg class="hl-wire" viewBox="0 0 240 150" width="240" height="150"` +
    ` role="img" aria-label="A map of the frame: five clusters, drawn where they dock">` +
    `<rect class="fr" x="2" y="2" width="236" height="146" rx="4"></rect>` +
    `<rect class="st" x="30" y="30" width="180" height="88" rx="2"></rect>` +
    `<rect class="nm" x="8" y="7" width="46" height="17" rx="3"></rect>` +
    `<rect class="nm" x="180" y="124" width="52" height="17" rx="3"></rect>` +
    `<circle class="nm hi" cx="223" cy="15.5" r="7.5"></circle>` +
    boxes +
    nums +
    `</svg>`
  );
}

/** The circle-i, as a three-state cycle rather than a switch.
 *
 * Off, then numbers, then the map. The middle state is the one that was
 * missing: a reader who wants to know what the fourth button does needs the
 * numbers over the live frame, not a card sitting on top of the thing they are
 * asking about. So the first press changes nothing except that every cluster
 * grows a number, and the controls keep working underneath it.
 *
 * Three radios and three labels, each pointing at the next state, with only the
 * current state's label displayed. It costs one more input than a checkbox and
 * it means the cycle runs with scripting off, which is where a still frame with
 * no captions is hardest to read.
 */
function helpMark(): string {
  const mk = (to: string, cls: string, label: string, ic: string): string =>
    `<label class="vp-helpmk ${cls}" for="vw-hm${to}" title="${esc(label)}"` +
    ` aria-label="${esc(label)}">${icon(ic)}</label>`;
  return (
    `<span class="vp-helpmks">` +
    mk("1", "m0", "Number the clusters", "circle-info") +
    mk("2", "m1", "Show the map of the frame", "circle-info") +
    mk("0", "m2", "Put the help away", "circle-info") +
    `</span>`
  );
}

function helpLegend(): string {
  const rows = REG.map(
    (g) =>
      `<li><span class="hn s" aria-hidden="true">${g.n}</span>` +
      `<span class="t"><b>${esc(g.name)}</b>${esc(g.owns)}` +
      `<span class="k">${g.tools.map((t) => esc(t.name)).join(" &middot; ")}</span>` +
      `</span></li>`,
  ).join("");
  return (
    `<div class="vp-help" id="vw-help">` +
    `<label class="scrim" for="vw-hm0" aria-hidden="true"></label>` +
    `<div class="hl-card" role="group" aria-label="What each cluster owns">` +
    `<div class="hl-hd"><span>${REG.length} clusters, and the axis each one owns</span>` +
    `<label class="dk-shut" for="vw-hm0" aria-label="Put the help away"` +
    ` title="Put the help away">${icon("xmark")}</label></div>` +
    `<div class="hl-map">${helpWire()}</div>` +
    `<ol class="hl-rows">${rows}</ol>` +
    `<p class="hl-ft">Press the circle once for numbers over the live frame, again ` +
    `for this map, a third time to put it away. Point at any cluster while the ` +
    `numbers are up and it says what it owns. The numbers are furniture, not ` +
    `controls: nothing is pressed while they are up, and closing them leaves the ` +
    `frame exactly as it was.</p>` +
    `<button type="button" class="hl-go" data-tour="start" hidden>` +
    `<span class="badge auto hollow">${icon("play")}Walk me through it</span></button>` +
    `</div></div>`
  );
}


/**
 * The tour: the same five clusters, one at a time, with the frame still live.
 *
 * A map answers "where is everything" and a hover answers "what is this one".
 * Neither answers "where do I start", which is the question a reader who has
 * never seen the frame actually has. So the card offers a walk: the highlight
 * moves, the number under it comes up out of the dust, and a card in the middle
 * says what that cluster owns. It is a reading of the same five rows the card
 * already lists -- no new vocabulary, just paced.
 *
 * Play, pause, back, forward, done. Touching back or forward pauses, because a
 * reader who has taken the wheel is not asking to be moved along again.
 */
function tourBar(): string {
  const b = (act: string, ic: string, label: string, cls: string): string =>
    `<button type="button" class="tt-b${cls}" data-tour="${act}"` +
    ` aria-label="${esc(label)}" title="${esc(label)}">` +
    `<span class="badge w3 bare">${icon(ic)}</span></button>`;
  const pp =
    `<button type="button" class="tt-b" data-tour="play" aria-label="Pause the tour"` +
    ` title="Pause the tour" id="tt-pp"><span class="badge w3 bare">` +
    `<span class="pp-a">${icon("pause")}</span>` +
    `<span class="pp-b">${icon("play")}</span></span></button>`;
  return (
    `<div class="vp-tour" id="vw-tour" hidden>` +
    `<div class="tt-card" role="status" aria-live="polite">` +
    `<div class="tt-h"><span class="hn s" id="tt-n" aria-hidden="true">1</span>` +
    `<span class="tt-t"><b id="tt-name">&mdash;</b><span id="tt-owns"></span>` +
    `<span class="k" id="tt-keys"></span></span></div>` +
    `<div class="tt-c">` +
    b("prev", "chevron-right", "The cluster before this one", " rev") +
    pp +
    b("next", "chevron-right", "The next cluster", "") +
    b("close", "xmark", "End the tour", "") +
    `</div></div></div>`
  );
}

/** Flat isometric plate stack: what the stage shows before, and instead of, WebGL. */
export function stageFallback(): string {
  const parts: string[] = [];
  const ox = 300;
  const oy = 96;
  const s = 26;
  /* Ground first, then the plates from the bottom up, so the painter's order in
     the still is the painter's order in the scene. A still that stacks the other
     way looks subtly wrong in a way nobody can name. */
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const x = ox + (c - r) * s;
      const y = oy + 84 + (c + r) * s * 0.5;
      parts.push(
        `<polygon points="${x},${y} ${x + s},${y + s * 0.5} ${x},${y + s} ${
          x - s
        },${y + s * 0.5}" fill="none" stroke="var(--rule)"></polygon>`,
      );
    }
  const FILL = ["--pastel-aqua", "--pastel-peach", "--pastel-lilac", "--pastel-teal"];
  const EDGE = ["--stroke-aqua", "--stroke-peach", "--stroke-lilac", "--stroke-teal"];
  for (let L = 0; L < 4; L++) {
    const lift = 84 - L * 26;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        if ((r + c + L) % 3 === 2) continue;
        const x = ox + (c - r) * s;
        const y = oy + lift + (c + r) * s * 0.5;
        parts.push(
          `<polygon points="${x},${y} ${x + s},${y + s * 0.5} ${x},${y + s} ${
            x - s
          },${y + s * 0.5}" fill="var(${FILL[L]})" stroke="var(${EDGE[L]})"></polygon>`,
        );
      }
  }
  return (
    `<div class="fallback"><svg viewBox="0 0 600 300" width="100%" height="100%" role="img"` +
    ` aria-label="Four plates standing apart above a ground grid">` +
    parts.join("") +
    `<text x="300" y="290" text-anchor="middle" font-size="10" fill="var(--ink-muted)"` +
    ` font-family="var(--font-mono)">still &mdash; enable scripting for the live view</text>` +
    `</svg></div>`
  );
}

/* ------------------------------------------------------------- the panel */

/**
 * What is in hand, printed under the frame.
 *
 * This was a floating panel docked over the stage, and it was wrong in the way
 * that is hardest to see from inside: it answered a question the reader had not
 * asked yet, in the middle of the picture they were trying to look at, and it
 * had a shut state and a reopen badge to manage the fact that it was in the
 * way. Three controls existed to undo a placement decision.
 *
 * A strip under the frame has none of that. It is readable at the same time as
 * the subject -- which was the whole argument for docking it inside -- without
 * standing on it, it needs no dismissal, and it cannot cover the plate it is
 * about. It appears only while the frame is editable, because a frame that
 * cannot be changed has nothing in hand.
 *
 * The rules it still demonstrates are the ones that were never about position:
 * the head states the DECISION rather than the encoding, and the tool wears the
 * value's own face -- a colour is chosen from colours, never from a field.
 */
function handBar(): string {
  const rows = PLATES.map(
    (pl, i) =>
      `<button type="button" class="dk-tone" data-plate="${i}"` +
      ` aria-pressed="${i === 1 ? "true" : "false"}"` +
      ` aria-label="${esc("Take the " + pl.name + " plate in hand")}"` +
      ` title="${esc(pl.tone + " -- " + pl.name)}">` +
      `<span class="badge w7 ${pl.tone}" data-ramp="${i}"></span></button>`,
  ).join("");
  return (
    `<div class="vw-hand" id="vw-dock" hidden>` +
    `<span class="hb-k"><span class="badge auto hollow">${icon("sliders")}` +
    `In hand</span></span>` +
    `<span class="hb-t"><b id="dk-val-t">Form</b>` +
    `<span class="mono" id="dk-val-n">p4</span>` +
    `<span class="ask" id="dk-ask">Choose the tint for the Form plate. ` +
    `One swatch is one identity colour, and the plate keeps it through every ` +
    `other control.</span></span>` +
    `<span class="hb-c" role="group" aria-label="Identity swatches">${rows}</span>` +
    `</div>`
  );
}

/**
 * The stage, in a viewport with every dock filled.
 *
 * This is the figure the page is about, so it is built by hand rather than
 * through `U.viewport()`: it needs the two side rails, which no other frame on
 * the site has, and the body is a live canvas rather than a still.
 */
export function stage(): string {
  /* One frame, one numbering. Cleared here rather than at module load so a
     second frame on the same page starts at one and not at six. */
  REG = [];
  PEND = [];
  const frm = frameDock();
  const cam = cameraRail();
  const lay = layerRail();
  const st = stateDock();
  const sp = spreadDock();
  return (
    `<div class="vw-wrap">` +
    `<div class="vp vw has-cap">`
    + `<input type="radio" name="vw-hm" class="vp-hm h0" id="vw-hm0" checked>` +
      `<input type="radio" name="vw-hm" class="vp-hm h1" id="vw-hm1">` +
      `<input type="radio" name="vw-hm" class="vp-hm h2" id="vw-hm2">` +
    `<div class="vp-body"><div class="stage" id="gl-stage">${stageFallback()}</div></div>` +
    `<div class="vp-top"><div class="l">` +
    `<span class="vp-name"><span class="badge auto hollow" id="vw-mode">${icon(
      "eye",
    )}Viewing</span></span>` +
    `</div><div class="r">` +
    frm +
    helpMark() +
    `</div></div>` +
    cam +
    lay +
    `<div class="vp-bot"><div class="d bl">${st}</div>` +
    `<div class="d bc">${sp}</div>` +
    `<div class="d br">` +
    `<div class="vp-read"><span class="v" id="hud-fps">&mdash;</span>` +
    `<span class="u">fps</span><span class="s" id="hud-tri">&mdash;</span></div>` +
    `</div></div>` +
    helpLegend() +
    tourBar() +
    `<div class="vp-cap">${nextFig()} &middot; four plates, one tile &middot; ` +
    `<span class="mono" id="vw-state">4 up &middot; apart 0 &middot; rung 2</span></div>` +
    `</div>` +
    handBar() +
    `</div>`
  );
}

/**
 * The module. Shipped as a string for the same reason `client.ts` is: one file
 * per page, no bundler, and the source still type-checks as part of this project
 * because nothing outside these template literals is JavaScript-in-a-string.
 *
 * Colour is read out of the live stylesheet with `getComputedStyle` rather than
 * duplicated here, so the objects follow the theme and there is still exactly
 * one place a hex exists.
 */
export const VIEWER_JS = `
import * as THREE from "/vendor/three.module.min.js";

// Queried by class, not by id. The section heading this page is reached by is
// also called "stage" -- ui.ts stamps every h2 with its anchor -- and
// getElementById returns the first match in document order, which is the
// heading. three.js was appending its canvas inside an h2: a static box with no
// aspect-ratio, 264px tall, sitting above the real stage, which meanwhile kept
// showing its fallback because the "on" class had gone to the heading too. A
// class cannot collide with an anchor. The id is kept, and renamed, for anyone
// reading the markup.
const host = document.querySelector(".stage");
if (host) start(host);

// A token that resolves to nothing means the stylesheet did not load, and a
// hardcoded hex here would be a second copy of the palette living outside
// tokens.ts -- the exact fork design-lint.ts exists to prevent. So the fallback
// is neutral grey, expressed as three numbers rather than a colour name: it is
// visibly wrong, which is what a missing stylesheet should look like.
function tokenColour(name){
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? new THREE.Color(v) : new THREE.Color(0.72, 0.72, 0.72);
}

function start(host){
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    return; // no WebGL: the still stays, which is the correct outcome
  }
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(36, 16/10, 0.1, 200);

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(6, 11, 5);
  scene.add(key);

  // ---------------------------------------------------------------- state
  //
  // Five independent things, and they are five variables rather than one
  // object because every rail owns exactly one of them. The bug this shape
  // prevents is the one where "reset" is written as a spread of defaults over
  // the whole state and quietly puts the layer rail back too -- which no
  // reader asked for and none of them notice until their work disappears.
  // The plates by name and swatch. Written once here rather than read back
  // out of the markup: a readout that parses its own page is a readout that
  // breaks the first time the markup is reworded.
  const NAMES = ["Ground", "Form", "Mark", "Gloss"];
  const SWATCH = ["p1", "p4", "p7", "p10"];
  const STOPS = 5;   // apart: 0 closed .. 4 fully open
  const RUNGS = 5;   // camera distance
  const FILLS = [0.62, 0.82, 1.0];

  let stop = 0;
  let rung = 2;
  let fillAt = 1;
  // The base identity swatch, and the shape the plates are cut to. Both are
  // picked from a grid rather than cycled: the reader can see every state Fill
  // has in the subject, and cannot see the other eleven swatches at all.
  let baseAt = 3;      // p4 -- the Form plate's swatch, and the panel's default
  let shape = "di";
  let spin = true;
  let wire = false;
  let editing = false;
  // The plate in hand, and whether the panel is up. Two variables and not
  // one: shutting the panel must not drop what was being worked on, or
  // reopening it lands the reader somewhere they did not leave.
  let hand = 1; const up = [true, true, true, true];
  // How far through each plate the one under it shows. Four stops, per plate,
  // because it is a property of a plate and not of the stack.
  const opac = [1, 1, 1, 1];
  // Where the eye stands round the subject. Two angles and a distance, and the
  // drag writes the angles -- so "home" restores an orientation as well as a
  // rung, which is the thing that makes a free camera safe to hand over.
  const HOME = { az: 0.86, el: 0.62 };
  let az = HOME.az, el = HOME.el;

  // The twelve identity swatches, measured off the stylesheet rather than
  // copied into this file. A hex written here is a hex that disagrees with the
  // stylesheet after the first change to it, and nothing on the page compares
  // the two, so the disagreement is never reported.
  const SW = ["p1","p2","p3","p4","p5","p6","p7","p8","p9","p10","p11","p12"];
  const swCache = {};
  function swatch(cls){
    if (swCache[cls]) return swCache[cls];
    const el = document.createElement("span");
    el.className = "badge w3 " + cls;
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    const v = { fill: cs.backgroundColor, edge: cs.borderTopColor };
    el.remove();
    swCache[cls] = v;
    return v;
  }

  // One geometry per shape, cut on demand and kept. Six buffers at most, and a
  // reader going back and forth between two shapes pays for each of them once.
  const geoCache = {};
  function plateGeo(){
    if (geoCache[shape]) return geoCache[shape];
    let g;
    if (shape === "sq") g = new THREE.BoxGeometry(0.9, 0.16, 0.9);
    else if (shape === "hx") g = new THREE.CylinderGeometry(0.56, 0.56, 0.16, 6);
    else if (shape === "ch") g = new THREE.CylinderGeometry(0.58, 0.58, 0.16, 8);
    else if (shape === "tr") g = new THREE.CylinderGeometry(0.66, 0.66, 0.16, 3);
    else if (shape === "pl") g = new THREE.CylinderGeometry(0.44, 0.62, 0.16, 4);
    else g = new THREE.CylinderGeometry(0.62, 0.62, 0.16, 4);
    geoCache[shape] = { m: g, e: new THREE.EdgesGeometry(g) };
    return geoCache[shape];
  }

  // --------------------------------------------------------------- scene
  //
  // The ground is drawn. It is the whole reason the subject reads as standing
  // somewhere rather than hanging: with it removed the plates are identical
  // pixels and the frame goes back to being a picture of an object.
  const ground = new THREE.Group();
  {
    const g = new THREE.BufferGeometry();
    const pts = [];
    const N = 6, S = 1.1;
    for (let i = -N; i <= N; i++) {
      pts.push(-N*S, 0, i*S,  N*S, 0, i*S);
      pts.push(i*S, 0, -N*S,  i*S, 0, N*S);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    ground.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({
      color: tokenColour("--rule"), transparent: true, opacity: 0.85
    })));
  }
  scene.add(ground);


  // Which of the nine squares each plate contributes to. Fixed, not random:
  // the same tile every build, so a screenshot in a commit means something.
  const CELLS = [
    [0,1,2,3,4,5,6,7,8],
    [0,1,3,4,5,7,8],
    [1,3,4,5,7],
    [4]
  ];

  const stackG = new THREE.Group();
  scene.add(stackG);
  const plateG = [];

  function build(){
    for (const g of plateG) {
      stackG.remove(g);
    }
    plateG.length = 0;
    for (let L = 0; L < 4; L++) {
      // Three steps between plates, so four plates off one base land on four
      // different families and never on two neighbours a reader has to tell
      // apart by saturation alone.
      const t = swatch(SW[(baseAt + L * 3) % 12]);
      const G = plateGeo();
      const mat = new THREE.MeshLambertMaterial({
        color: new THREE.Color(t.fill), wireframe: wire,
        transparent: opac[L] < 1, opacity: opac[L], depthWrite: opac[L] > 0.85
      });
      const em = new THREE.LineBasicMaterial({ color: new THREE.Color(t.edge) });
      const g = new THREE.Group();
      for (const c of CELLS[L]) {
        const x = (c % 3) - 1, z = Math.floor(c / 3) - 1;
        const m = new THREE.Mesh(G.m, mat);
        m.position.set(x * 1.0, 0, z * 1.0);
        const ln = new THREE.LineSegments(G.e, em);
        ln.position.copy(m.position);
        g.add(m, ln);
      }
      stackG.add(g);
      plateG.push(g);
    }
    layout();
  }

  // Layout is separate from build because apart, fill and layers change every
  // frame's arithmetic and none of them change a buffer. Rebuilding the meshes
  // to move them is the single most common way a viewport like this ends up
  // dropping frames on a phone.
  function layout(){
    const gap = 0.22 + (stop / (STOPS - 1)) * 1.35;
    let y = 0.14;
    for (let L = 0; L < 4; L++) {
      plateG[L].visible = up[L];
      plateG[L].position.y = y;
      // A hidden plate keeps its place. Closing the gap over it would move
      // every plate above it, and the reader who turned one off to look at
      // what is underneath would watch the thing they were looking at slide.
      y += gap;
    }
    const f = FILLS[fillAt];
    stackG.scale.setScalar(f);
    ground.scale.setScalar(f);
  }

  function place(){
    // The eye moves on a sphere round the subject: the rails set the distance,
    // the drag sets the two angles. Orbit was refused here for a while on the
    // grounds that a free camera is one readers get lost in -- which is true
    // of a free camera with no way back. The way back is "home", and it now
    // restores the orientation as well as the rung, so the argument no longer
    // holds. Pitch is clamped short of the poles because the frame has a
    // ground plane: a camera that goes over the top puts the grid above the
    // subject and every reader reads that as the picture having broken.
    const d = 8.3 - rung * 0.95;
    el = Math.max(0.08, Math.min(1.45, el));
    const r = Math.cos(el) * d;
    cam.position.set(Math.sin(az) * r, Math.sin(el) * d + 0.2, Math.cos(az) * r);
    cam.lookAt(0, 0.55, 0);
  }

  // Dragging turns the subject. Pointer events, so a finger and a mouse are
  // the same code path, and capture, so a drag that leaves the canvas keeps
  // going rather than sticking the subject mid-turn.
  const el0 = renderer.domElement;
  el0.style.touchAction = "none";
  let drag = null;
  el0.addEventListener("pointerdown", e => {
    if (e.button !== undefined && e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY };
    host.classList.add("dragging");
    // Capture throws if the pointer is already gone by the time the handler
    // runs. That is a race, not a failure, and it must not take the drag with it.
    try { el0.setPointerCapture(e.pointerId); } catch (_) {}
  });
  el0.addEventListener("pointermove", e => {
    if (!drag) return;
    az -= (e.clientX - drag.x) * 0.008;
    el += (e.clientY - drag.y) * 0.006;
    drag.x = e.clientX; drag.y = e.clientY;
    place();
  });
  const drop = e => {
    if (!drag) return;
    drag = null;
    host.classList.remove("dragging");
    if (e && e.pointerId !== undefined && el0.hasPointerCapture(e.pointerId))
      el0.releasePointerCapture(e.pointerId);
  };
  el0.addEventListener("pointerup", drop);
  el0.addEventListener("pointercancel", drop);
  // The wheel is the same control the camera rail is, so it moves in the same
  // five rungs rather than in a continuous zoom the rail's readout could not
  // then describe. It only takes the wheel while the pointer is over the
  // canvas, and it says so by preventing the page scroll it just consumed.
  el0.addEventListener("wheel", e => {
    e.preventDefault();
    rung = Math.max(0, Math.min(RUNGS - 1, rung + (e.deltaY > 0 ? -1 : 1)));
    place(); report();
  }, { passive: false });

  function size(){
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / Math.max(r.height, 1);
    cam.updateProjectionMatrix();
  }

  // --------------------------------------------------------------- readout
  //
  // Every rail reports its own position in words. A control with five stops
  // and no readout is a control the reader has to press to the end to find
  // out where they were.
  function report(){
    const t = (id, s) => { const e = document.getElementById(id); if (e) e.textContent = s; };
    t("vw-rung", rung + "/" + (RUNGS - 1));
    t("vw-stop", stop + "/" + (STOPS - 1));
    const n = up.filter(Boolean).length;
    t("vw-state", n + " up \\u00b7 apart " + stop + " \\u00b7 rung " + rung);
    const m = document.getElementById("vw-mode");
    if (m) m.textContent = editing ? "Editing" : "Viewing";
    // A rail says where its own ends are by refusing to go past them, and it
    // says so before it is pressed. Silently doing nothing is the version of
    // this that makes a reader think the page is broken.
    const dis = (act, off) => document.querySelectorAll('[data-act="' + act + '"]')
      .forEach(b => { b.disabled = off; });
    dis("sp-", stop === 0);
    dis("sp+", stop === STOPS - 1);
    dis("cam+", rung === RUNGS - 1);
    dis("cam-", rung === 0);

    // The layer rail wears the plates' colours, so it has to be repainted when
    // the base swatch moves. A rail that keeps the colours the subject had ten
    // seconds ago is worse than a rail with no colour at all: it is a legend
    // that disagrees with the thing it is a legend for, and it is believed.
    document.querySelectorAll("[data-layer]").forEach((b, i) => {
      const g = b.querySelector(".badge");
      if (g) g.className = "badge w3 bare " + SW[(baseAt + i * 3) % 12];
    });

    // The panel is an editor's control, so it is up only while the frame is
    // one. Read-only frames keep every rail -- looking is a thing a reader
    // does too -- and lose only the tool that writes.
    // Every swatch that stands for a plate is repainted from the same ramp the
    // plates are built from: the rail, the transparency rows, the palette
    // preview and the strip under the frame. A legend that disagrees with its
    // subject is worse than no legend, and it is believed.
    document.querySelectorAll("[data-ramp]").forEach(b => {
      const i = Number(b.getAttribute("data-ramp")) || 0;
      b.className = b.className.replace(/\bp\d+\b/, SW[(baseAt + i * 3) % 12]);
    });
    document.querySelectorAll("[data-mode]").forEach(b => {
      const on = (b.getAttribute("data-mode") === "1") === editing;
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("on", on);
    });
    const dk = document.getElementById("vw-dock");
    if (dk) {
      dk.hidden = !editing;
      // The head is rewritten with the decision, not the encoding. It names
      // the plate because the plate is the subject of the sentence.
      const nm = NAMES[hand], tn = SW[(baseAt + hand * 3) % 12];
      t("dk-ask", "Choose the tint for the " + nm + " plate. One swatch is one " +
        "identity colour, and the plate keeps it through every other control.");
      t("dk-val-t", nm);
      t("dk-val-n", tn);
      dk.querySelectorAll("[data-plate]").forEach(b => {
        b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-plate")) === hand));
      });
    }
  }

  const ACTS = {
    "cam+": () => { rung = Math.min(RUNGS - 1, rung + 1); place(); },
    "cam-": () => { rung = Math.max(0, rung - 1); place(); },
    "cam0": () => { rung = 2; az = HOME.az; el = HOME.el; place(); },
    "sp+":  () => { stop = Math.min(STOPS - 1, stop + 1); layout(); },
    "sp-":  () => { stop = Math.max(0, stop - 1); layout(); },
    "spin": () => { spin = !spin; },
    "wire": () => { wire = !wire; build(); }
  };
  const TOGGLE = { spin: 1, wire: 1 };

  document.querySelectorAll("[data-act]").forEach(b => {
    b.addEventListener("click", () => {
      const a = b.getAttribute("data-act");
      const fn = ACTS[a];
      if (!fn) return;
      fn();
      if (TOGGLE[a]) b.setAttribute("aria-pressed", String(a === "spin" ? spin : wire));
      report();
    });
  });

  // Picking a swatch takes the plate in hand. In a real editor it would also
  // write the tint; here the swatch IS the identity colour, so what the
  // control demonstrates is the face rule, not a mutation.
  document.querySelectorAll("[data-plate]").forEach(b => {
    b.addEventListener("click", () => {
      hand = Number(b.getAttribute("data-plate")) || 0;
      report();
    });
  });

  // The two grid pickers. One selected member per grid, and the panel shuts
  // on the choice: a picker that stays open after being used covers the thing
  // the reader opened it to look at, which is the subject it just changed.
  function grid(attr, set){
    document.querySelectorAll("[" + attr + "]").forEach(b => {
      b.addEventListener("click", () => {
        set(b.getAttribute(attr));
        const own = b.closest(".pk-grid");
        if (own) own.querySelectorAll("[" + attr + "]").forEach(o => {
          o.setAttribute("aria-pressed", String(o === b));
          o.classList.toggle("on", o === b);
        });
        const pick = b.closest(".vp-pick");
        const ck = pick ? pick.querySelector("input") : null;
        if (ck) ck.checked = false;
        build();
        report();
      });
    });
  }
  grid("data-shape", v => { shape = v; });
  grid("data-tone", v => { baseAt = Math.max(0, SW.indexOf(v)); });
  grid("data-fill", v => { fillAt = Math.max(0, Math.min(FILLS.length - 1, Number(v))); });
  // Editing is picked from the two frames rather than flipped, so the control
  // says what the other side looks like before the reader is standing in it.
  grid("data-mode", v => {
    editing = v === "1";
    host.classList.toggle("editing", editing);
  });
  // Transparency is one row per plate, so the pressed member is the row's own
  // set and not the whole panel's. .pk-grid would take all sixteen.
  document.querySelectorAll("[data-op]").forEach(b => {
    b.addEventListener("click", () => {
      const p = (b.getAttribute("data-op") || "0:100").split(":");
      const i = Number(p[0]) || 0;
      opac[i] = (Number(p[1]) || 100) / 100;
      const row = b.closest(".pk-lrow");
      if (row) row.querySelectorAll("[data-op]").forEach(o => {
        o.setAttribute("aria-pressed", String(o === b));
        o.classList.toggle("on", o === b);
      });
      build();
      report();
    });
  });

  document.querySelectorAll("[data-layer]").forEach((b, i) => {
    b.addEventListener("click", () => {
      // The last plate standing cannot be put away. An empty stage is a state
      // with no way out that looks exactly like a crash.
      if (up[i] && up.filter(Boolean).length === 1) return;
      up[i] = !up[i];
      b.setAttribute("aria-pressed", String(up[i]));
      layout();
      report();
    });
  });

  // A theme change repaints the objects, because their colour was read from the
  // stylesheet rather than written down here.
  new MutationObserver(build).observe(document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] });
  addEventListener("resize", size);

  build();
  place();
  size();
  report();

  let last = performance.now(), frames = 0, acc = 0, shown = false;
  renderer.setAnimationLoop(now => {
    const dt = (now - last) / 1000; last = now;
    if (spin) stackG.rotation.y += dt * 0.3;
    renderer.render(scene, cam);
    frames++; acc += dt;
    if (acc >= 1) {
      const el = document.getElementById("hud-fps");
      if (el) el.textContent = String(Math.round(frames / acc));
      const tr = document.getElementById("hud-tri");
      if (tr) tr.textContent = renderer.info.render.calls + " calls";
      frames = 0; acc = 0;
    }
    if (!shown) { shown = true; host.classList.add("on"); }
  });
}
`;
