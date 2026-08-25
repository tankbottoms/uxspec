/**
 * The address board, and the field controls a tool panel is built out of.
 *
 * Two things that look unrelated and are the same problem. A wallet address is
 * forty characters with no word in it, and a form field is a value with no face
 * of its own; in both cases the platform's default rendering answers a question
 * nobody asked -- "here are forty monospace characters", "here is a select" --
 * and leaves the reader to do the comparing.
 *
 * So: give the address a shape a reader can compare at a glance, and give a
 * field the site's own type and the site's own popover instead of the operating
 * system's. Nothing here invents a widget. Every control below is a label, a
 * button or an input that still works with scripting switched off.
 */
import { esc } from "./html.ts";
import { icon } from "./icons.ts";

/** The demonstration address. Invented, checksum-shaped, never a real account. */
export const ADDR = "a1b2c3d4e5f60718293a4b5c6d7e8f90abcdef01";

/** Hex value of a character, 0-15. Drives the value bars and nothing else. */
const hexVal = (c: string): number => parseInt(c, 16);

/**
 * The forty characters as a control surface.
 *
 * Three things are fixed on purpose. The row length is a constant, not a
 * `minmax()` -- a board that reflows puts a different character under the same
 * finger at a different width, which is exactly the failure a reader is using
 * the board to avoid. The three read modes are radios, so the board answers
 * with scripting off. And the value mode draws a bar, not a hue: a sixteen
 * symbol alphabet has no colour vocabulary on this site, and inventing one
 * would spend twelve identities on a value nobody reads as a colour.
 */
export function addressBoard(): string {
  const cells = ADDR.split("")
    .map((c, i) => {
      const end = i < 4 || i >= ADDR.length - 4;
      const grp = end ? (i < 4 ? "the leading four" : "the trailing four") : "the middle";
      return (
        `<button type="button" class="ab-c${end ? " e" : ""}" data-ch="${i}"` +
        ` aria-label="character ${i + 1} of 40, ${grp}, value ${hexVal(c)}">` +
        `<span class="ch">${esc(c)}</span>` +
        `<span class="vb" style="--v:${(hexVal(c) / 15).toFixed(3)}" aria-hidden="true"></span>` +
        `</button>`
      );
    })
    .join("");
  const mode = (id: string, on = false): string =>
    `<input type="radio" name="abm" id="ab-${id}" class="ab-m ab-${id}"${on ? " checked" : ""}>`;
  const tab = (id: string, lbl: string): string =>
    `<label class="ab-t" for="ab-${id}">${esc(lbl)}</label>`;
  // Five densities, from one line of forty to five per row. The step control
  // sits on the board's right border because it reshapes the board and nothing
  // else; the count in the footer names the state, so the reader is never
  // guessing which of the five they are looking at.
  const DENS = [
    { per: 40, n: "on one line" },
    { per: 20, n: "per row" },
    { per: 10, n: "per row" },
    { per: 8, n: "per row" },
    { per: 5, n: "per row" },
  ] as const;
  const step = DENS.map(
    (_, i) =>
      `<input type="radio" name="abp" id="ab-p${i}" class="ab-m ab-p${i}"` +
      `${i === 2 ? " checked" : ""}>`,
  ).join("");
  const side = DENS.map((_d, i) => {
    const up = DENS[i + 1];
    const down = DENS[i - 1];
    return (
      (up
        ? `<label class="s${i}" for="ab-p${i + 1}" title="Fewer, larger cells"` +
          ` aria-label="Enlarge to ${up.per} ${up.n}">${icon("magnifying-glass-plus")}</label>`
        : "") +
      (down
        ? `<label class="s${i}" for="ab-p${i - 1}" title="More, smaller cells"` +
          ` aria-label="Reduce to ${down.per} ${down.n}">${icon("magnifying-glass-minus")}</label>`
        : "")
    );
  }).join("");
  const count = DENS.map(
    (d, i) => `<span class="ab-n n${i}">${d.per} ${d.n}</span>`,
  ).join("");
  return (
    `<div class="ab" role="group" aria-label="The forty characters of the address">` +
    mode("plain", true) +
    mode("ends") +
    mode("val") +
    step +
    `<div class="ab-hd">` +
    `<span class="ab-face mono" id="ab-face">0x<b>${esc(ADDR.slice(0, 4))}</b>` +
    `${esc(ADDR.slice(4, -4))}<b>${esc(ADDR.slice(-4))}</b></span>` +
    `<span class="ab-tabs" role="group" aria-label="How to read the board">` +
    tab("plain", "Plain") + tab("ends", "Ends") + tab("val", "Value") +
    `</span></div>` +
    `<div class="ab-grid">${cells}</div>` +
    `<div class="ab-side" role="group" aria-label="Board density">${side}</div>` +
    `<div class="ab-ft"><span class="badge auto hollow">${icon("circle-info")}` +
    `<span class="ab-cn">${count}</span></span>` +
    `<span class="t">Copying takes the whole address; the cells are for comparing, ` +
    `not for editing. Nothing on this board writes. The magnifiers on the right ` +
    `border step the board between one line and five cells to a row.</span></div>` +
    `</div>`
  );
}

/** A labelled row. Every field on the site is this shape: name, control, note. */
function fld(o: { name: string; note?: string | undefined; ctl: string; wide?: boolean }): string {
  return (
    `<div class="fld${o.wide ? " wide" : ""}">` +
    `<span class="fl">${esc(o.name)}</span>` +
    `<span class="fc">${o.ctl}</span>` +
    (o.note ? `<span class="fn">${esc(o.note)}</span>` : "") +
    `</div>`
  );
}

let pickSeq = 0;

/**
 * The site's dropdown. A checkbox, two labels and a list of radios -- so the
 * panel opens, dismisses on the scrim and records a choice without a line of
 * script, and the face is the page's own type rather than the platform's.
 */
function fieldPick(o: {
  name: string;
  items: readonly string[];
  at?: number;
  note?: string;
}): string {
  pickSeq += 1;
  const id = `fp${pickSeq}`;
  const at = o.at ?? 0;
  const rows = o.items
    .map(
      (x, i) =>
        `<label class="fp-o"><input type="radio" name="${id}g"${
          i === at ? " checked" : ""
        } data-lbl="${esc(x)}"><span class="d" aria-hidden="true"></span>${esc(x)}</label>`,
    )
    .join("");
  const ctl =
    `<span class="fp"><input type="checkbox" id="${id}">` +
    `<label class="fp-f" for="${id}"><span class="v" data-face>${esc(o.items[at] ?? "")}</span>` +
    `${icon("chevron-down")}</label>` +
    `<label class="scrim" for="${id}" aria-hidden="true"></label>` +
    `<span class="fp-p" role="group" aria-label="${esc(o.name)}">${rows}</span></span>`;
  return fld({ name: o.name, note: o.note, ctl });
}

/** Text. The input keeps its function and loses its chrome. */
function fieldText(o: { name: string; val: string; note?: string; mono?: boolean }): string {
  return fld({
    name: o.name,
    note: o.note,
    ctl: `<input class="fin${o.mono ? " mono" : ""}" value="${esc(o.val)}" size="18" aria-label="${esc(o.name)}">`,
  });
}

/** A number with two hands on it, and no operating system spinner. */
function fieldStep(o: { name: string; val: string; unit: string; note?: string }): string {
  const ctl =
    `<span class="fst"><button type="button" class="fs" data-step="-1" aria-label="Fewer">` +
    `<span class="badge w3 idle">${icon("minus")}</span></button>` +
    `<span class="v mono" data-val>${esc(o.val)}</span><span class="u">${esc(o.unit)}</span>` +
    `<button type="button" class="fs" data-step="1" aria-label="More">` +
    `<span class="badge w3 idle">${icon("plus")}</span></button></span>`;
  return fld({ name: o.name, note: o.note, ctl });
}

/** A switch whose label is the sentence it is about to carry out. */
function fieldSwitch(o: { name: string; on: string; off: string; pressed?: boolean; note?: string }): string {
  const ctl =
    `<button type="button" class="fsw" aria-pressed="${o.pressed ? "true" : "false"}"` +
    ` data-on="${esc(o.on)}" data-off="${esc(o.off)}">` +
    `<span class="badge auto act">${icon("circle-check")}` +
    `<span data-face>${esc(o.pressed ? o.on : o.off)}</span></span></button>`;
  return fld({ name: o.name, note: o.note, ctl });
}

/** The worked example: one panel, every field kind, one column. */
export function fieldSet(): string {
  return (
    `<div class="fset">` +
    `<div class="fset-hd">${icon("sliders")}<span>Plate 3 &middot; what this field panel writes</span></div>` +
    fieldText({ name: "Name", val: "Form", note: "Shown on the plate and nowhere else." }) +
    fieldText({ name: "Owner", val: ADDR.slice(0, 6) + "…" + ADDR.slice(-4), note: "Read only in this build.", mono: true }) +
    fieldPick({ name: "Identity", items: ["Aqua", "Peach", "Sage", "Lilac", "Sand", "Rose"], at: 1, note: "One colour, one meaning." }) +
    fieldPick({ name: "Shape", items: ["Square", "Diamond", "Hex", "Chamfer", "Wedge", "Plate"], at: 1 }) +
    fieldStep({ name: "Apart", val: "0", unit: "steps", note: "Same value the spread dock writes." }) +
    fieldSwitch({ name: "Breathing", on: "Stop the plates breathing", off: "Let the plates breathe", pressed: true }) +
    `<div class="fset-ft">${icon("circle-info")}<span>Nothing is written until the panel is ` +
    `shut. The foot says what is stored, in the same words the fields used.</span></div>` +
    `</div>`
  );
}

/**
 * The behaviour, once. Guarded on the markup being present so the same bundle
 * is safe on a page that has neither a board nor a field panel.
 */
export const FIELDS_JS = `
(function(){
  document.querySelectorAll(".fp").forEach(function(w){
    var face = w.querySelector("[data-face]");
    var ck = w.querySelector("input[type=checkbox]");
    w.querySelectorAll("input[type=radio]").forEach(function(r){
      r.addEventListener("change", function(){
        if (face) face.textContent = r.getAttribute("data-lbl") || "";
        if (ck) ck.checked = false;
      });
    });
  });
  document.querySelectorAll(".fst").forEach(function(w){
    var v = w.querySelector("[data-val]");
    w.querySelectorAll("[data-step]").forEach(function(b){
      b.addEventListener("click", function(){
        var n = parseInt(v.textContent, 10) || 0;
        n = Math.max(0, Math.min(9, n + parseInt(b.getAttribute("data-step"), 10)));
        v.textContent = String(n);
      });
    });
  });
  document.querySelectorAll(".fsw").forEach(function(b){
    b.addEventListener("click", function(){
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      var f = b.querySelector("[data-face]");
      if (f) f.textContent = b.getAttribute(on ? "data-on" : "data-off") || "";
    });
  });
  var face = document.getElementById("ab-face");
  document.querySelectorAll(".ab-c").forEach(function(c){
    c.addEventListener("click", function(){
      var was = c.classList.contains("on");
      document.querySelectorAll(".ab-c.on").forEach(function(o){ o.classList.remove("on"); });
      if (!was) c.classList.add("on");
      if (face) face.classList.toggle("dim", !was);
    });
  });
})();
`;
