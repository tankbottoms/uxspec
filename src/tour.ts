/**
 * The guided tour, as a classic script rather than a module.
 *
 * The frame's help has three states and all three of them work with scripting
 * off: the numbers, the map and the hover note are radios, labels and :hover.
 * The tour is the one part that cannot be -- something has to advance it -- so
 * it is additive and nothing else depends on it. With this file absent the
 * card simply carries one button that does nothing, which is why the button is
 * hidden until this script claims it.
 *
 * It reads the clusters out of the DOM instead of being handed a copy of the
 * register. The numbers, the names and the tool lists are already on the
 * elements as data attributes because the hover note needs them; a second copy
 * inlined here would be a second thing to keep true.
 */
export const TOUR_JS = `
(function () {
  var vp = document.querySelector(".vp.vw");
  if (!vp) return;
  var bar = vp.querySelector("#vw-tour");
  var grps = Array.prototype.slice.call(vp.querySelectorAll(".vp-grp"));
  if (!bar || !grps.length) return;

  var st = {
    0: vp.querySelector("#vw-hm0"),
    1: vp.querySelector("#vw-hm1"),
    2: vp.querySelector("#vw-hm2"),
  };
  var el = {
    n: bar.querySelector("#tt-n"),
    name: bar.querySelector("#tt-name"),
    owns: bar.querySelector("#tt-owns"),
    keys: bar.querySelector("#tt-keys"),
    pp: bar.querySelector("#tt-pp"),
  };
  var at = 0;
  var timer = null;

  // The dwell is long enough to read two short lines and no longer. A tour a
  // reader has to race is a tour they stop and drive themselves, which is fine
  // -- but then the automatic part was never worth building.
  var DWELL = 4200;

  function paint() {
    var g = grps[at];
    if (!g) return;
    for (var i = 0; i < grps.length; i++) grps[i].classList.toggle("thi", i === at);
    if (el.n) el.n.textContent = g.getAttribute("data-n") || String(at + 1);
    if (el.name) el.name.textContent = g.getAttribute("data-name") || "";
    if (el.owns) el.owns.textContent = g.getAttribute("data-owns") || "";
    if (el.keys) el.keys.textContent = g.getAttribute("data-keys") || "";
  }

  function play() {
    vp.classList.remove("tpaused");
    if (el.pp) {
      el.pp.setAttribute("aria-label", "Pause the tour");
      el.pp.setAttribute("title", "Pause the tour");
    }
    if (timer) clearInterval(timer);
    timer = setInterval(function () { step(1); }, DWELL);
  }

  function pause() {
    vp.classList.add("tpaused");
    if (el.pp) {
      el.pp.setAttribute("aria-label", "Play the tour");
      el.pp.setAttribute("title", "Play the tour");
    }
    if (timer) { clearInterval(timer); timer = null; }
  }

  function step(d) {
    at = (at + d + grps.length) % grps.length;
    paint();
  }

  function start() {
    // Stage one, not stage two: the map is what the reader just came from, and
    // leaving it up would put a card over the very clusters being pointed at.
    if (st[1]) st[1].checked = true;
    vp.classList.add("tour");
    bar.hidden = false;
    at = 0;
    paint();
    play();
  }

  function stop() {
    pause();
    bar.hidden = true;
    vp.classList.remove("tour");
    for (var i = 0; i < grps.length; i++) grps[i].classList.remove("thi");
    if (st[0]) st[0].checked = true;
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest("[data-tour]");
    if (!b || !vp.contains(b)) return;
    var act = b.getAttribute("data-tour");
    if (act === "start") { start(); return; }
    if (act === "close") { stop(); return; }
    if (act === "play") { if (timer) pause(); else play(); return; }
    // Taking the wheel stops the clock. Otherwise the frame moves on again
    // three seconds after the reader deliberately went back one.
    if (act === "next") { pause(); step(1); return; }
    if (act === "prev") { pause(); step(-1); return; }
  });

  document.addEventListener("keydown", function (e) {
    if (bar.hidden) return;
    if (e.key === "Escape") { stop(); return; }
    if (e.key === "ArrowRight") { pause(); step(1); }
    if (e.key === "ArrowLeft") { pause(); step(-1); }
  });

  // The button exists in the markup so the card reads the same with scripting
  // off; it is only offered once there is something behind it.
  var go = vp.querySelector("[data-tour='start']");
  if (go) go.removeAttribute("hidden");
})();
`;
