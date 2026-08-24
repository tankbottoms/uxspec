/**
 * The three.js stage, and the rule it exists to demonstrate.
 *
 * A WebGL view is the one component on this site that genuinely cannot work with
 * scripting off, which makes it the best place to show what "progressive
 * enhancement" actually costs. The answer is: a still. `stageFallback()` draws
 * the same lattice as flat isometric SVG, and it is what a reader sees with JS
 * disabled, with WebGL unavailable, while the module is still parsing, and if
 * the module throws. The canvas is only revealed once the first frame is on it --
 * `.stage.on` -- so there is never a blank rectangle where a picture should be.
 *
 * three.js is vendored into `public/vendor/`, not pulled from a CDN. A page that
 * fetches its renderer from someone else's origin has a third party in its
 * dependency chain, a second point of failure, and a different Content-Security
 * -Policy problem on every deploy target.
 */
import { esc } from "./html.ts";
import { icon } from "./icons.ts";

/** The controls, as badges that happen to be pressable. Same height, same
 *  border, same radius as any other badge -- they add state, not geometry. */
export function glyphControls(): string {
  const shapes: [string, string, string][] = [
    ["lattice", "layer-group", "Lattice"],
    ["ring", "arrow-rotate-left", "Ring"],
    ["stack", "bars", "Stack"],
    ["orb", "circle-info", "Orb"],
  ];
  const tones: [string, string][] = [
    ["p1", "Aqua"], ["p3", "Mint"], ["p5", "Lilac"],
    ["p9", "Teal"], ["p11", "Cyan"], ["p4", "Peach"],
  ];
  return (
    `<div class="gctl" role="group" aria-label="Shape">` +
    shapes
      .map(
        ([k, ic, label], i) =>
          `<button type="button" data-shape="${esc(k)}" aria-pressed="${
            i === 0
          }"><span class="badge w11 idle">${icon(ic)}${esc(label)}</span></button>`,
      )
      .join("") +
    `</div>` +
    `<div class="gctl" role="group" aria-label="Tone">` +
    tones
      .map(
        ([k, label], i) =>
          `<button type="button" data-tone="${esc(k)}" aria-pressed="${
            i === 0
          }"><span class="badge w9 ${k}">${esc(label)}</span></button>`,
      )
      .join("") +
    `<button type="button" data-wire="1" aria-pressed="false"><span class="badge w9 idle hollow">Wire</span></button>` +
    `<button type="button" data-spin="1" aria-pressed="true"><span class="badge w9 idle hollow">Spin</span></button>` +
    `</div>`
  );
}

/** Flat isometric lattice: what the stage shows before, and instead of, WebGL. */
export function stageFallback(): string {
  const cells: string[] = [];
  const ox = 300;
  const oy = 60;
  const s = 22;
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++) {
      const x = ox + (c - r) * s;
      const y = oy + (c + r) * s * 0.5;
      cells.push(
        `<polygon points="${x},${y} ${x + s},${y + s * 0.5} ${x},${y + s} ${
          x - s
        },${y + s * 0.5}" fill="var(--paper-alt)" stroke="var(--rule)"></polygon>`,
      );
    }
  return (
    `<div class="fallback"><svg viewBox="0 0 600 260" width="100%" height="100%" role="img" aria-label="Static lattice">` +
    cells.join("") +
    `<text x="300" y="240" text-anchor="middle" font-size="10" fill="var(--ink-muted)" font-family="var(--font-mono)">still &mdash; enable scripting for the live view</text>` +
    `</svg></div>`
  );
}

export function stage(): string {
  return (
    `<div class="stage" id="stage">${stageFallback()}` +
    `<div class="hud"><span id="hud-shape">lattice</span><span id="hud-fps">&mdash;</span></div></div>` +
    glyphControls()
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

const host = document.getElementById("stage");
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
  const cam = new THREE.PerspectiveCamera(38, 16/10, 0.1, 200);
  cam.position.set(7.5, 5.4, 8.6);
  cam.lookAt(0, 0, 0);

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(6, 9, 5);
  scene.add(key);

  let tone = "p1";
  let wire = false;
  let spin = true;
  let shape = "lattice";
  let group = null;

  const TONE_VAR = { p1:"--pastel-aqua", p3:"--pastel-mint", p5:"--pastel-lilac",
                     p9:"--pastel-teal", p11:"--pastel-cyan", p4:"--pastel-peach" };
  const EDGE_VAR = { p1:"--stroke-aqua", p3:"--stroke-mint", p5:"--stroke-lilac",
                     p9:"--stroke-teal", p11:"--stroke-cyan", p4:"--stroke-peach" };

  function material(){
    return new THREE.MeshLambertMaterial({
      color: tokenColour(TONE_VAR[tone]),
      wireframe: wire,
    });
  }

  function build(){
    if (group) { scene.remove(group); group.traverse(o => { if(o.geometry) o.geometry.dispose(); }); }
    group = new THREE.Group();
    const mat = material();
    const edge = new THREE.LineBasicMaterial({ color: tokenColour(EDGE_VAR[tone]) });

    // One geometry, one edge geometry, reused across every instance -- 25 boxes
    // sharing two buffers rather than allocating fifty.
    if (shape === "lattice") {
      const g = new THREE.BoxGeometry(0.86, 0.86, 0.86);
      const eg = new THREE.EdgesGeometry(g);
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
        const h = 0.5 + Math.abs(Math.sin((x + z) * 0.9)) * 2.2;
        const m = new THREE.Mesh(g, mat);
        m.position.set(x * 1.05, h / 2 - 1, z * 1.05);
        m.scale.y = h;
        const ln = new THREE.LineSegments(eg, edge);
        ln.position.copy(m.position);
        ln.scale.copy(m.scale);
        group.add(m, ln);
      }
    } else if (shape === "ring") {
      const g = new THREE.TorusGeometry(2.4, 0.62, 18, 64);
      const m = new THREE.Mesh(g, mat);
      const ln = new THREE.LineSegments(new THREE.EdgesGeometry(g), edge);
      m.rotation.x = ln.rotation.x = Math.PI / 2.6;
      group.add(m, ln);
    } else if (shape === "stack") {
      for (let i = 0; i < 7; i++) {
        const g = new THREE.CylinderGeometry(2.2 - i * 0.24, 2.3 - i * 0.24, 0.34, 40);
        const m = new THREE.Mesh(g, mat);
        m.position.y = -1.4 + i * 0.42;
        m.rotation.y = i * 0.18;
        group.add(m);
      }
    } else {
      const g = new THREE.IcosahedronGeometry(2.6, 1);
      group.add(new THREE.Mesh(g, mat));
      group.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edge));
    }
    scene.add(group);
  }

  function size(){
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / Math.max(r.height, 1);
    cam.updateProjectionMatrix();
  }

  const press = (sel, fn) => document.querySelectorAll(sel).forEach(b => {
    b.addEventListener("click", () => {
      fn(b);
      document.querySelectorAll(sel).forEach(o => o.setAttribute("aria-pressed", String(o === b)));
    });
  });
  press("[data-shape]", b => { shape = b.getAttribute("data-shape"); build();
    const h = document.getElementById("hud-shape"); if (h) h.textContent = shape; });
  press("[data-tone]", b => { tone = b.getAttribute("data-tone"); build(); });
  document.querySelectorAll("[data-wire]").forEach(b => b.addEventListener("click", () => {
    wire = !wire; b.setAttribute("aria-pressed", String(wire)); build();
  }));
  document.querySelectorAll("[data-spin]").forEach(b => b.addEventListener("click", () => {
    spin = !spin; b.setAttribute("aria-pressed", String(spin));
  }));

  // A theme change repaints the objects, because their colour was read from the
  // stylesheet rather than written down here.
  new MutationObserver(build).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  addEventListener("resize", size);

  build();
  size();

  let last = performance.now(), frames = 0, acc = 0;
  renderer.setAnimationLoop(now => {
    const dt = (now - last) / 1000; last = now;
    if (spin && group) group.rotation.y += dt * 0.35;
    renderer.render(scene, cam);
    frames++; acc += dt;
    if (acc >= 1) {
      const el = document.getElementById("hud-fps");
      if (el) el.textContent = Math.round(frames / acc) + " fps";
      frames = 0; acc = 0;
    }
    host.classList.add("on");
  });
}
`;
