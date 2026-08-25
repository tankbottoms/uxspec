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
function grp(name: string, owns: string, inner: string): string {
  const n = REG.length + 1;
  REG.push({ n, name, owns, tools: PEND });
  PEND = [];
  return `<span class="vp-grp"><span class="hn" aria-hidden="true">${n}</span>${inner}</span>`;
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
    grp("Camera", "Where the eye stands. Never the subject: nothing here resizes a plate.", btns),
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
    grp("Layers", "Which of the subject's plates are standing. One control per plate, named.", btns),
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
  return grp("Spread", "The subject's own geometry, opened and closed. The eye does not move.", btns);
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
    tool({
      ic: "pen-to-square",
      name: "Editing",
      note: "Turns the frame from a view into a tool: the rails stay, and the plates become pickable.",
      act: "edit",
      on: false,
    }) +
    `</div>`;
  return grp("Mode", "What the frame is doing, as distinct from what it is looking at.", btns);
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

/** Shape and tone, as popup pickers on the top rail rather than as two more
 *  glyphs cycling silently. A control that cycles is fine where the reader can
 *  see all of its states in the subject; shape and tone have twelve and six,
 *  and cycling through them is a guessing game with a redraw after each guess. */
function shapePick(): string {
  const body =
    `<span class="pk-grid sh">` +
    SHAPES.map(
      (s) =>
        `<button type="button" class="pk-sw${s.on ? " on" : ""}" data-shape="${esc(s.k)}"` +
        ` aria-pressed="${s.on ? "true" : "false"}" title="${esc(s.name)}"` +
        ` aria-label="${esc("Cut the plates to " + s.name.toLowerCase())}">` +
        `<svg viewBox="0 0 20 16" width="20" height="16" aria-hidden="true">` +
        `<polygon points="${s.pts}" fill="var(--pastel-aqua)" stroke="var(--stroke-aqua)"></polygon>` +
        `</svg></button>`,
    ).join("") +
    `</span>`;
  return U.vpPick({ mark: icon("layer-group"), title: "Plate shape", body, rt: true, w: "w3" });
}

function tonePick(): string {
  const body =
    `<span class="pk-grid tn">` +
    SWATCHES.map(
      (t, i) =>
        `<button type="button" class="pk-sw${i === 3 ? " on" : ""}" data-tone="${esc(t)}"` +
        ` aria-pressed="${i === 3 ? "true" : "false"}" title="${esc(t)}"` +
        ` aria-label="${esc("Tint the plates from swatch " + t)}">` +
        `<span class="badge w3 ${t}"></span></button>`,
    ).join("") +
    `</span>`;
  return U.vpPick({ mark: icon("palette"), title: "Identity swatch", body, rt: true, w: "w3" });
}

/** The top-right cluster: what the frame does to the subject's presentation.
 *  Fill and tone are cycles because the reader can see every state they have in
 *  the subject itself; shape and swatch are pickers because they cannot. */
function frameDock(): string {
  const btns =
    `<div class="vp-btns">` +
    tool({
      ic: "up-right-and-down-left-from-center",
      name: "Fill",
      note: "How much of the frame the subject takes. Three settings; it moves the subject, not the eye.",
      act: "fill",
    }) +
    tool({
      ic: "palette",
      name: "Tone",
      note: "Cycles the identity swatch the plates are tinted from. Read live out of the stylesheet.",
      act: "tone",
    }) +
    shapePick() +
    tonePick() +
    `</div>`;
  return grp(
    "Frame",
    "What the frame does to the subject's presentation. Never its geometry.",
    btns,
  );
}

/** Where each cluster sits on the frame, for the wireframe. Keyed by the name
 *  the cluster registered, so a cluster that moves has to move here too. */
const POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  Frame: { x: 138, y: 7, w: 94, h: 17 },
  Camera: { x: 8, y: 42, w: 17, h: 56 },
  Layers: { x: 215, y: 42, w: 17, h: 56 },
  Mode: { x: 8, y: 124, w: 64, h: 17 },
  Spread: { x: 92, y: 124, w: 50, h: 17 },
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
  const boxes = REG.map((g) => {
    const p = POS[g.name];
    if (!p) return "";
    return (
      `<g class="b">` +
      `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3"></rect>` +
      `<circle class="n" cx="${p.x + 1}" cy="${p.y + 1}" r="6.5"></circle>` +
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
    boxes +
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
    `<p class="hl-ft">The numbers are furniture, not controls. Nothing is pressed while ` +
    `they are up, and closing them leaves the frame exactly as it was.</p>` +
    `</div></div>`
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
 * The floating panel: the decision in hand, said in words, with the tool that
 * decision actually takes.
 *
 * It is docked over the frame rather than beside it, and that is the whole
 * reason it exists as its own thing. A control that changes the subject has to
 * be readable at the same time as the subject, or the reader is carrying a
 * value across the width of the page in their head. A viewport wide enough to
 * be worth having is wide enough that a side inspector is a different glance.
 *
 * Three rules it demonstrates, all of them taken from a dock that had to work
 * on a phone where the subject was forty characters four pixels apart:
 *
 *  - The head states the DECISION, not the encoding. Not "plate 2, tone p4" --
 *    that is what is stored. An imperative with a subject, so a reader who
 *    arrived at this panel cold knows what is being asked of them.
 *  - The tool wears the value's own face. A colour is chosen from colours; a
 *    shape from shapes. A text field or a number is the right control only
 *    where the value genuinely has no other face, and reaching for one before
 *    that is how an editor ends up being a form about a picture.
 *  - Putting it away is a STATE, not a removal. It leaves a way back -- a
 *    single badge in the corner it left from. A panel that closes to nothing
 *    is a panel the reader cannot get back without knowing what opened it.
 */
function panel(): string {
  const rows = PLATES.map(
    (pl, i) =>
      '<button type="button" class="dk-tone" data-plate="' +
      i +
      '"' +
      (i === 1 ? ' aria-pressed="true"' : ' aria-pressed="false"') +
      ' aria-label="' +
      esc("Tint the plate in hand with " + pl.name + "'s swatch") +
      '" title="' +
      esc(pl.tone + " -- " + pl.name) +
      '"><span class="badge w6 ' +
      pl.tone +
      '"></span></button>',
  ).join("");

  return (
    '<div class="vp-dock" id="vw-dock">' +
    /* The reopen badge lives outside the panel, not inside it: it has to
       survive the panel being shut, which is the one moment it matters. */
    '<button type="button" class="badge auto act dk-open" data-act="dock" hidden>' +
    icon("sliders") +
    "What is in hand</button>" +
    '<div class="dk-panel">' +
    '<div class="dk-hd"><span class="dk-ask" id="dk-ask">' +
    "Choose the tint for the Form plate. One swatch is one identity colour, and the plate keeps it through every other control." +
    "</span>" +
    '<button type="button" class="dk-shut" data-act="dock" ' +
    'aria-label="Put it away -- the panel goes, the plate stays" ' +
    'title="Put it away">' +
    icon("xmark") +
    "</button></div>" +
    '<div class="dk-bd">' +
    /* The subject the panel acts on, repeated inside it. The plate in hand is
       four rails away on the right edge; a reader setting a tint should not
       have to look back across the frame to check which one they are setting. */
    '<div class="dk-tools" role="group" aria-label="Identity swatches">' +
    rows +
    "</div>" +
    '<p class="dk-ft"><span class="badge auto hollow" id="dk-val">' +
    icon("layer-group") +
    '<span id="dk-val-t">Form</span> <span class="mono" id="dk-val-n">p4</span></span>' +
    '<span class="dk-note">Stored as the plate index and a swatch name. ' +
    "The hex is in the stylesheet, not here.</span></p>" +
    "</div></div></div>"
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
    panel() +
    helpLegend() +
    `<div class="vp-cap">${nextFig()} &middot; four plates, one tile &middot; ` +
    `<span class="mono" id="vw-state">4 up &middot; apart 0 &middot; rung 2</span></div>` +
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
  let hand = 1; let dockUp = true;  const up = [true, true, true, true];

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
        color: new THREE.Color(t.fill), wireframe: wire
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
    // The eye moves along one line through the origin. Orbit is not offered:
    // a viewport with a free camera and no way back is a viewport readers get
    // lost in, and "home" would then have to restore an orientation as well as
    // a distance.
    const d = 9.4 - rung * 1.05;
    cam.position.set(d * 0.62, d * 0.52, d * 0.72);
    cam.lookAt(0, 1.0, 0);
  }

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
    const dk = document.getElementById("vw-dock");
    if (dk) {
      dk.hidden = !editing;
      dk.classList.toggle("shut", !dockUp);
      const ob = dk.querySelector(".dk-open");
      if (ob) ob.hidden = dockUp;
      // The head is rewritten with the decision, not the encoding. It names
      // the plate because the plate is the subject of the sentence.
      const nm = NAMES[hand], tn = SWATCH[hand];
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
    "cam0": () => { rung = 2; place(); },
    "sp+":  () => { stop = Math.min(STOPS - 1, stop + 1); layout(); },
    "sp-":  () => { stop = Math.max(0, stop - 1); layout(); },
    "fill": () => { fillAt = (fillAt + 1) % FILLS.length; layout(); },
    "tone": () => { baseAt = (baseAt + 1) % 12; build(); },
    "spin": () => { spin = !spin; },
    "wire": () => { wire = !wire; build(); },
    "edit": () => { editing = !editing; host.classList.toggle("editing", editing); },
    "dock": () => { dockUp = !dockUp; }
  };
  const TOGGLE = { spin: 1, wire: 1, edit: 1 };

  document.querySelectorAll("[data-act]").forEach(b => {
    b.addEventListener("click", () => {
      const a = b.getAttribute("data-act");
      const fn = ACTS[a];
      if (!fn) return;
      fn();
      if (TOGGLE[a]) {
        b.setAttribute("aria-pressed", String(
          a === "spin" ? spin : a === "wire" ? wire : editing
        ));
      }
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
