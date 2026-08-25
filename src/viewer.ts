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
 * A glyph-only control.
 *
 * Every one of these carries a name and a note, not a bare `title`. A rail of
 * unlabelled marks is readable to whoever built it and to nobody else, and the
 * browser's own tooltip arrives after a delay long enough that a reader who is
 * hesitating has already moved on. `.tip` is the page's own, opens on hover and
 * on focus, and says both what the control is called and what pressing it does.
 */
function tool(
  o: { ic: string; name: string; note: string; act: string; on?: boolean; off?: boolean },
): string {
  return (
    `<button type="button" class="vt" data-act="${esc(o.act)}"` +
    (o.on === undefined ? "" : ` aria-pressed="${o.on}"`) +
    (o.off === true ? " disabled" : "") +
    ` aria-label="${esc(o.name)}">` +
    `<span class="badge w3 idle">${icon(o.ic)}</span>` +
    `<span class="tip-plate" role="tooltip">` +
    `<span class="n">${esc(o.name)}</span><span class="d">${esc(o.note)}</span>` +
    `</span></button>`
  );
}

/** A rail: a column of tools on one plate, docked to a side of the frame. */
function rail(side: "lm" | "rm", label: string, inner: string): string {
  return `<div class="vp-${side}" role="group" aria-label="${esc(label)}">${inner}</div>`;
}

/** The camera rail. Distance only -- what the eye does, never what the subject
 *  does. See the note in `viewer.ts` on why the magnifier is reserved. */
function cameraRail(): string {
  return rail(
    "lm",
    "Camera",
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
      `</div>`,
  );
}

/** The layer rail. One badge per plate, pressed when the plate is standing. */
function layerRail(): string {
  return rail(
    "rm",
    "Layers",
    `<div class="vp-btns col">` +
      PLATES.map(
        (p, i) =>
          `<button type="button" class="vt" data-layer="${esc(p.k)}" aria-pressed="true"` +
          ` aria-label="${esc(p.name)}">` +
          `<span class="badge w3 ${p.tone}">${icon("layer-group")}</span>` +
          `<span class="tip-plate lt" role="tooltip">` +
          `<span class="n">${esc(p.name)}</span>` +
          `<span class="d">Plate ${i + 1} of ${PLATES.length}. Hidden plates keep their place in the stack.</span>` +
          `</span></button>`,
      ).join("") +
      `</div>`,
  );
}

/** Apart and together: the subject's own geometry, not the camera's. */
function spreadDock(): string {
  return (
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
    `</div>`
  );
}

/** What the frame is doing, as distinct from what it is looking at. */
function stateDock(): string {
  return (
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
    `</div>`
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

/**
 * The stage, in a viewport with every dock filled.
 *
 * This is the figure the page is about, so it is built by hand rather than
 * through `U.viewport()`: it needs the two side rails, which no other frame on
 * the site has, and the body is a live canvas rather than a still.
 */
export function stage(): string {
  return (
    `<div class="vp vw has-cap">` +
    `<div class="vp-body"><div class="stage" id="gl-stage">${stageFallback()}</div></div>` +
    `<div class="vp-top"><div class="l">` +
    `<span class="vp-name"><span class="badge auto hollow" id="vw-mode">${icon(
      "eye",
    )}Viewing</span></span>` +
    `</div><div class="r">` +
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
    `</div>` +
    `</div></div>` +
    cameraRail() +
    layerRail() +
    `<div class="vp-bot"><div class="d bl">${stateDock()}</div>` +
    `<div class="d bc">${spreadDock()}</div>` +
    `<div class="d br">` +
    `<div class="vp-read"><span class="v" id="hud-fps">&mdash;</span>` +
    `<span class="u">fps</span><span class="s" id="hud-tri">&mdash;</span></div>` +
    `</div></div>` +
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
  const STOPS = 5;   // apart: 0 closed .. 4 fully open
  const RUNGS = 5;   // camera distance
  const FILLS = [0.62, 0.82, 1.0];

  let stop = 0;
  let rung = 2;
  let fillAt = 1;
  let toneAt = 0;
  let spin = true;
  let wire = false;
  let editing = false;
  const up = [true, true, true, true];

  const PLATE = [
    { fill: "--pastel-aqua",  edge: "--stroke-aqua"  },
    { fill: "--pastel-peach", edge: "--stroke-peach" },
    { fill: "--pastel-lilac", edge: "--stroke-lilac" },
    { fill: "--pastel-teal",  edge: "--stroke-teal"  }
  ];
  const TONES = [0, 1, 2, 3];

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

  // One box geometry and one edge geometry for all thirty-six squares. The
  // count of squares is what changes when a plate is turned off; the count of
  // buffers never does.
  const box = new THREE.BoxGeometry(0.9, 0.16, 0.9);
  const boxEdge = new THREE.EdgesGeometry(box);

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
      const t = PLATE[TONES[(L + toneAt) % 4]];
      const mat = new THREE.MeshLambertMaterial({
        color: tokenColour(t.fill), wireframe: wire
      });
      const em = new THREE.LineBasicMaterial({ color: tokenColour(t.edge) });
      const g = new THREE.Group();
      for (const c of CELLS[L]) {
        const x = (c % 3) - 1, z = Math.floor(c / 3) - 1;
        const m = new THREE.Mesh(box, mat);
        m.position.set(x * 1.0, 0, z * 1.0);
        const ln = new THREE.LineSegments(boxEdge, em);
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
  }

  const ACTS = {
    "cam+": () => { rung = Math.min(RUNGS - 1, rung + 1); place(); },
    "cam-": () => { rung = Math.max(0, rung - 1); place(); },
    "cam0": () => { rung = 2; place(); },
    "sp+":  () => { stop = Math.min(STOPS - 1, stop + 1); layout(); },
    "sp-":  () => { stop = Math.max(0, stop - 1); layout(); },
    "fill": () => { fillAt = (fillAt + 1) % FILLS.length; layout(); },
    "tone": () => { toneAt = (toneAt + 1) % 4; build(); },
    "spin": () => { spin = !spin; },
    "wire": () => { wire = !wire; build(); },
    "edit": () => { editing = !editing; host.classList.toggle("editing", editing); }
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
