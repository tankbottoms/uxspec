/**
 * The delta, kept apart from `tokens.ts` on purpose.
 *
 * `tokens.ts` is a byte-for-byte copy of the canonical stylesheet in
 * `tax-analysis-2024-2026/src/tokens.ts`. Editing it here would fork the design
 * system quietly: the next `bun run sync:tokens` would either clobber the edit or
 * report a diff nobody can read. So this file holds the four things a *spec site*
 * needs that a report page does not -- a code block, a swatch grid, wireframe
 * strokes, and a WebGL stage -- and nothing else.
 *
 * Rules this file lives under, same as the parent:
 *   - every colour is a `var(--token)`. No raw hex, ever. `design-lint.ts` warns.
 *   - no new badge geometry. Height and width belong to `.badge` in tokens.ts.
 *   - anything that turns out to be generally useful gets promoted upstream and
 *     deleted from here. This file shrinking is the success condition.
 */
export const CSS_EXTRA = `
/* ------------------------------------------------------------------ code */
/* A spec has to show its own markup. Body face is sans and a bare <pre> would
   inherit it, so the block sets mono explicitly and turns tabular figures off --
   code is read, not compared column-wise. */
.code{margin:10px 0 0;padding:9px 11px;background:var(--paper-alt);
  border:1px solid var(--rule-soft);border-radius:var(--radius);
  font-family:var(--font-mono);font-size:8.5px;line-height:1.7;color:var(--ink);
  font-variant-numeric:normal;overflow-x:auto;white-space:pre;tab-size:2}
.code .c{color:var(--ink-soft)}
.code .s{color:var(--stroke-teal)}
.code .k{color:var(--stroke-orchid)}
.code .bad{background:var(--pastel-blush);box-shadow:inset 2px 0 0 var(--stroke-coral);
  display:block;margin:0 -11px;padding:0 9px}
.code .good{background:var(--pastel-mint);box-shadow:inset 2px 0 0 var(--stroke-green);
  display:block;margin:0 -11px;padding:0 9px}
.code-hd{margin:14px 0 0;font-family:var(--font-mono);font-size:8.5px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft)}

/* --------------------------------------------------------------- two-up */
/* The wrong-and-right pair. One column on a phone, because a side-by-side
   comparison that has to be scrolled sideways is not a comparison. */
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px}
.two > div{min-width:0}
@media (max-width:720px){.two{grid-template-columns:1fr}}

/* -------------------------------------------------------------- swatches */
.swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(122px,1fr));
  gap:7px;margin-top:10px}
.swatch{border:1px solid var(--rule);border-radius:var(--radius);overflow:hidden;
  background:var(--paper-card)}
.swatch .chip{height:34px;border-bottom:1px solid var(--rule-soft)}
.swatch .nm{display:block;padding:5px 7px 1px;font-size:10px;color:var(--ink)}
.swatch .vr{display:block;padding:0 7px 6px;font-family:var(--font-mono);
  font-size:9px;color:var(--ink-soft)}

/* ------------------------------------------------------------ wireframes */
/* A wireframe is deliberately drawn in ink-soft on paper-alt and never in the
   palette: the moment a blueprint is coloured, a reader starts reading the colour
   as meaning, and the palette's one-colour-one-meaning rule is spent on a drawing
   that means nothing yet. */
.wf{background:var(--paper-alt);border:1px solid var(--rule);
  border-radius:var(--radius);padding:11px;margin-top:10px;overflow-x:auto}
.wf svg{display:block;max-width:100%;height:auto}
.wf + figcaption{margin-top:6px}

/* ------------------------------------------------------------- gl stage */
/* The stage is sized by aspect-ratio rather than a fixed height so it survives a
   phone rotation without a resize listener. */
.stage{position:relative;aspect-ratio:16/10;background:var(--paper-alt);
  border:1px solid var(--rule);border-radius:var(--radius);overflow:hidden;margin-top:10px}
.stage canvas{display:block;width:100%;height:100%}
.stage .fallback{position:absolute;inset:0;display:flex;align-items:center;
  justify-content:center;padding:18px;text-align:center;font-size:11px;
  color:var(--ink-muted)}
.stage.on .fallback{display:none}
.stage .hud{position:absolute;left:9px;bottom:9px;display:flex;gap:5px;
  font-family:var(--font-mono);font-size:9.5px;color:var(--ink-soft)}

/* --------------------------------------------------- two panel leftovers */
/* What is in hand used to float over the frame. It was in the way, it needed a
   shut state, and the shut state needed a badge to undo itself with -- three
   pieces of machinery to walk back one placement decision. It now lives under
   the frame as .vw-hand, below. These two rules survive because the help card
   still needs a close affordance and the strip still needs a swatch button. */
.dk-shut{flex:none;background:none;border:0;padding:2px;cursor:pointer;
  color:var(--ink-faint);line-height:0}
.dk-shut:hover{color:var(--ink)}
.dk-shut .ic{width:10px;height:10px}
.dk-tone{padding:2px;background:var(--paper-card);border:1px solid var(--rule);
  border-radius:3px;cursor:pointer;line-height:0}
/* The chosen one is ringed, not filled darker. Filling it would change the one
   thing on the control the reader is judging it by. */
.dk-tone[aria-pressed="true"]{box-shadow:0 0 0 2px var(--stroke-amber);
  border-color:var(--stroke-amber)}
/* ------------------------------------------------------- the side rails */
/* Two docks the other viewports do not have, because two of the axes a 3D view
   offers do not exist on a map or a chart: where the eye stands, and which of
   the subject's layers are standing. They are vertical and mid-height rather
   than folded into the top or bottom rows for one reason -- the bottom row is
   already three clusters wide, and a fourth and fifth group added to it would
   put camera, spread and state in one undifferentiated line of marks. Position
   is what tells the reader which axis a control belongs to; that is the whole
   argument for docking controls inside a frame in the first place. */
.vp-lm,.vp-rm{position:absolute;top:50%;transform:translateY(-50%);z-index:4}
.vp-lm{left:var(--vp-in)}
.vp-rm{right:var(--vp-in)}
/* A rail is the same plate as any other cluster, turned. It does not get its
   own background, padding or radius -- two plate treatments on one frame is
   how a viewport starts looking like two applications. */
/* The rail's own position, under its buttons. It is not a badge: a badge here
   would be a sixth pressable-looking thing in a column of five real ones. */
.vp-rung{font-family:var(--font-mono);font-size:8px;letter-spacing:.04em;
  color:var(--ink-faint);font-variant-numeric:tabular-nums;padding:1px 2px 0}
.vp-btns:not(.col) .vp-rung{padding:0 3px}
/* A disabled tool is dimmed and inert but stays in the rail. Removing it would
   make the rail change length as the reader used it, and a control that moves
   under the pointer is a control pressed twice by accident. */
.vp-btns button[disabled]{cursor:default}
.vp-btns button[disabled] .badge{opacity:.34}

/* --------------------------------------------------------------- help mode */
/* The note used to hang off each control on hover, which put a plate under the
   pointer on the way to the control beside it. It is now one state of the
   frame: the circle-i in the top right raises a number on every cluster and one
   legend that says what each cluster owns. A checkbox and two labels, so it
   works with scripting off -- the still is exactly where a reader knows least
   about what they are looking at, and the least helpful place to lose the help.
   Nothing is switched while the numbers are up, so closing them leaves the
   frame in the state the reader left it. */
/* --- The controls themselves ------------------------------------------
   A glyph, and nothing behind it. A filled badge is how this site says
   "this is a value with a state" -- a tool is not that, and forty filled
   lozenges scattered over a picture read as data laid on the subject.
   Colour is kept for the one place on the frame where it means something:
   the layer rail, where the tint IS the plate's identity. There the fill
   goes and the colour stays, on the mark, exactly as it does on tile. */
.vp .badge.bare{background:none;border-color:transparent;box-shadow:none}
.vp [data-act] .badge,.vp .vp-pick > .mk .badge{background:none;
  border-color:transparent;color:var(--ink-muted)}
/* A glyph with nothing behind it has to carry the whole control, so it is
   drawn a size up from the mark that used to sit inside a filled badge. */
.vp-btns .badge .ic,.vp-helpmk .ic{width:12px;height:12px}
/* Two colours, two jobs, and the frame never uses a third. Teal is the thing
   under the pointer: it arrives on hover and leaves with the pointer, so it
   can never be mistaken for a setting. Amber is the thing that is on -- a held
   state, so it gets a fill, because a held state that is only a tint is a
   tint the reader has to compare against its neighbours to read. Black fill
   was the old answer to on and it is not an answer: it turns the glyph into
   a hole and puts a third, meaningless colour on a frame with two. */
.vp .vt:hover .badge,.vp .vp-pick > .mk:hover .badge{color:var(--accent)}
.vp .vt[aria-pressed="true"] .badge:not(.bare),
.vp .vp-pick > input:checked ~ .mk .badge{color:var(--ink);
  background:var(--pastel-amber);border-color:var(--stroke-amber)}
.vp .vt[disabled]{opacity:.34;cursor:default}
/* One outline round the cluster, hairlines between the tools. Adjacent
   controls that act on one axis are one object; five separately bordered
   pills say five axes and make the reader count them to find out. */
.vp-btns{display:inline-flex;align-items:center;gap:0;padding:0;
  background:var(--tip-paper);border:1px solid var(--rule-soft);
  border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.10);overflow:hidden}
.vp-btns.col{flex-direction:column}
.vp-btns > * + *{border-left:1px solid var(--rule-soft)}
.vp-btns.col > * + *{border-left:0;border-top:1px solid var(--rule-soft)}
.vp-btns .vt,.vp-btns .vp-pick > .mk{display:inline-flex;align-items:center;
  justify-content:center;width:var(--vp-gl);height:var(--vp-gl)}
.vp-btns .vt:hover,.vp-btns .vp-pick > .mk:hover{background:var(--paper-alt)}
.vp-btns .vp-rung{padding:0 5px}
/* --- Help, in three states, and a tour --------------------------------
   Off, numbers, map. The middle state is the one a checkbox could not
   express: numbers over the live frame, with every control still working,
   for the reader whose question is "which of these is the fourth one".
   Only the second press raises a card, because only then is the question
   about the frame as a whole rather than about a control in it.

   Highlight is amber and hover is teal, the same way round as the tile
   viewer: amber says "this is the one being talked about", teal says
   "this is the one under your hand". A reader who learns the pair once on
   a tile is not asked to relearn it here. */
.vp-hm{position:absolute;width:1px;height:1px;opacity:0;clip-path:inset(50%);
  pointer-events:none}
.vp-helpmks{flex:none;display:inline-flex}
.vp-helpmk{display:none;align-items:center;justify-content:center;
  width:var(--vp-gl);height:var(--vp-gl);border-radius:50%;cursor:pointer;
  background:var(--tip-paper);border:1px solid var(--rule-soft);
  box-shadow:0 1px 4px rgba(0,0,0,.10);color:var(--ink-muted);line-height:0}
.h0:checked ~ .vp-top .vp-helpmk.m0,
.h1:checked ~ .vp-top .vp-helpmk.m1,
.h2:checked ~ .vp-top .vp-helpmk.m2{display:inline-flex}
/* Lit while the help is up, so the control says which state it is in without
   changing shape. Pointing at it still turns it teal: it is a control. */
.vp-helpmk.m1,.vp-helpmk.m2{color:var(--stroke-amber);
  border-color:var(--stroke-amber);background:var(--pastel-amber)}
.vp-helpmk:hover{color:var(--accent);border-color:var(--accent);
  background:var(--tip-paper)}
/* Every dock rides above the wash, so the circle stays reachable with the map
   up and the numbers are never dimmed by the thing that explains them. The
   wash and the card are siblings inside .vp-help, which carries no z-index of
   its own precisely so its two children can sit on either side of the docks. */
.vp-top,.vp-bot,.vp-lm,.vp-rm{z-index:18}
/* The number sits on the cluster, not on each tool: five circles is a map,
   fourteen is a second interface laid over the first. Amber, because it is
   the colour this frame uses for "the thing being explained", and never ink
   or white -- a black disc on a picture reads as a value belonging to the
   picture rather than as a caption about the frame. */
.vp-grp{position:relative;display:inline-flex}
.hn{display:none;position:absolute;left:-6px;top:-6px;z-index:19;
  width:15px;height:15px;border-radius:50%;background:var(--pastel-amber);
  border:1px solid var(--stroke-amber);color:var(--ink);
  font-family:var(--font-mono);font-size:8.5px;
  align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
.h1:checked ~ .vp-top .hn,.h1:checked ~ .vp-lm .hn,
.h1:checked ~ .vp-rm .hn,.h1:checked ~ .vp-bot .hn,
.h2:checked ~ .vp-top .hn,.h2:checked ~ .vp-lm .hn,
.h2:checked ~ .vp-rm .hn,.h2:checked ~ .vp-bot .hn{display:flex}
/* Dust, not paint. While the numbers are up each cluster carries the
   faintest amber wash so the eye can find the five of them against a moving
   picture; pointing at one brings it up to a readable teal outline. */
.h1:checked ~ .vp-top .vp-grp,.h1:checked ~ .vp-lm .vp-grp,
.h1:checked ~ .vp-rm .vp-grp,.h1:checked ~ .vp-bot .vp-grp,
.h2:checked ~ .vp-top .vp-grp,.h2:checked ~ .vp-lm .vp-grp,
.h2:checked ~ .vp-rm .vp-grp,.h2:checked ~ .vp-bot .vp-grp{
  border-radius:5px;box-shadow:0 0 0 3px var(--pastel-amber)}
.h1:checked ~ .vp-top .vp-grp:hover,.h1:checked ~ .vp-lm .vp-grp:hover,
.h1:checked ~ .vp-rm .vp-grp:hover,.h1:checked ~ .vp-bot .vp-grp:hover,
.h2:checked ~ .vp-top .vp-grp:hover,.h2:checked ~ .vp-lm .vp-grp:hover,
.h2:checked ~ .vp-rm .vp-grp:hover,.h2:checked ~ .vp-bot .vp-grp:hover{
  box-shadow:0 0 0 3px var(--accent)}
.h1:checked ~ .vp-top .vp-grp:hover .hn,.h1:checked ~ .vp-lm .vp-grp:hover .hn,
.h1:checked ~ .vp-rm .vp-grp:hover .hn,.h1:checked ~ .vp-bot .vp-grp:hover .hn,
.h2:checked ~ .vp-top .vp-grp:hover .hn,.h2:checked ~ .vp-lm .vp-grp:hover .hn,
.h2:checked ~ .vp-rm .vp-grp:hover .hn,.h2:checked ~ .vp-bot .vp-grp:hover .hn{
  border-color:var(--accent);background:var(--tip-paper);color:var(--ink)}
/* The note a tooltip used to be. It is only reachable in help mode, which is
   the whole difference: a tooltip that opens while the reader is working the
   controls is in the way of the controls, and this one cannot be. */
.vp-hx{display:none;position:absolute;z-index:21;width:186px;
  padding:6px 8px 7px;text-align:left;pointer-events:none;
  background:var(--tip-paper);border:1px solid var(--rule);
  border-radius:var(--radius);box-shadow:0 6px 18px rgba(0,0,0,.14)}
.vp-hx b{display:block;margin-bottom:2px;font-family:var(--font-mono);
  font-size:9px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink);font-weight:400}
.vp-hx .o{display:block;font-size:10px;line-height:1.4;color:var(--ink-muted)}
.vp-hx .k{display:block;margin-top:3px;font-family:var(--font-mono);
  font-size:8.5px;color:var(--ink-faint)}
/* Each note opens away from its own edge, so it never leaves the frame and
   never covers the cluster it is describing. */
.vp-grp.st .vp-hx{top:calc(100% + 8px);right:0}
.vp-grp.sb .vp-hx{bottom:calc(100% + 8px);left:0}
.vp-grp.sl .vp-hx{left:calc(100% + 8px);top:0}
.vp-grp.sr .vp-hx{right:calc(100% + 8px);top:0}
.h1:checked ~ .vp-top .vp-grp:hover .vp-hx,
.h1:checked ~ .vp-lm .vp-grp:hover .vp-hx,
.h1:checked ~ .vp-rm .vp-grp:hover .vp-hx,
.h1:checked ~ .vp-bot .vp-grp:hover .vp-hx{display:block}
/* Stage one leaves every tool live. It is the whole point of having it:
   the reader is reading the numbers in order to use the controls, not
   instead of using them. Only the map, which covers the frame, is modal. */
.vp-help{display:none;position:absolute;inset:0}
.h2:checked ~ .vp-help{display:block}
.vp-help > .scrim{position:absolute;inset:0;z-index:16;
  background:var(--paper-alt);opacity:.92;cursor:default}
.hl-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  z-index:24;width:min(400px,calc(100% - 78px));max-height:calc(100% - 30px);
  overflow:auto;background:var(--tip-paper);border:1px solid var(--rule);
  border-radius:var(--radius);box-shadow:0 8px 26px rgba(0,0,0,.16);
  padding:8px 10px 9px}
.hl-hd{display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;
  font-family:var(--font-mono);font-size:9px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-soft)}
.hl-hd > span{flex:1}
/* The map. Scoped to .hl-wire, in the page stylesheet and not in an svg
   <style>, which would be document-global and would restyle every rect on
   the page that happens to share a class name. */
.hl-map{display:flex;justify-content:center;padding:2px 0 9px;
  border-bottom:1px solid var(--rule-soft);margin-bottom:9px}
.hl-wire{max-width:100%;height:auto;overflow:visible}
.hl-wire rect{fill:none;stroke:var(--rule);stroke-width:1}
.hl-wire rect.fr{stroke:var(--ink-muted)}
.hl-wire rect.st{fill:var(--paper-alt);stroke:var(--rule-soft);
  stroke-dasharray:3 3}
.hl-wire rect.b{stroke:var(--stroke-amber);fill:var(--paper-card)}
.hl-wire .n circle{fill:var(--pastel-amber);stroke:var(--stroke-amber);
  stroke-width:1}
.hl-wire circle.nm{fill:none;stroke:var(--rule);stroke-width:1}
.hl-wire .nm.hi{stroke:var(--stroke-amber)}
.hl-wire text{font-family:var(--font-mono);font-size:8px;fill:var(--ink);
  font-variant-numeric:tabular-nums}
.hl-rows{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.hl-rows li{display:flex;align-items:flex-start;gap:7px}
.hl-rows .hn.s{display:flex;position:static;flex:none;margin-top:1px}
.hl-rows .t{flex:1;font-size:10px;line-height:1.42;color:var(--ink-muted)}
.hl-rows .t b{display:block;font-family:var(--font-mono);font-size:9px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--ink);font-weight:400}
.hl-rows .t .k{display:block;margin-top:2px;font-family:var(--font-mono);
  font-size:8.5px;color:var(--ink-faint)}
.hl-ft{margin:8px 0 0;font-size:9px;line-height:1.4;color:var(--ink-faint)}
/* --- the tour ---------------------------------------------------------
   The card can say where the five clusters are; it cannot say where to
   start. The walk does: the highlight moves, the number under it comes up
   out of the dust, and one small card in the middle of the frame reads the
   row aloud. The frame stays live underneath the whole time. */
.hl-go{display:inline-block;margin-top:8px;padding:0;border:0;
  background:none;cursor:pointer}
.hl-go[hidden]{display:none}
.hl-go:hover .badge{border-color:var(--accent);color:var(--accent)}
.vp-tour{position:absolute;left:0;right:0;top:50%;z-index:26;
  transform:translateY(-50%);display:flex;justify-content:center;
  pointer-events:none}
.vp-tour[hidden]{display:none}
.tt-card{pointer-events:auto;width:min(272px,calc(100% - 96px));
  padding:8px 10px 7px;background:var(--tip-paper);
  border:1px solid var(--stroke-amber);border-radius:var(--radius);
  box-shadow:0 8px 26px rgba(0,0,0,.16)}
.tt-h{display:flex;align-items:flex-start;gap:7px}
.tt-card .hn.s{display:flex;position:static;flex:none;margin-top:1px}
.tt-t{flex:1;font-size:10px;line-height:1.42;color:var(--ink-muted)}
.tt-t b{display:block;font-family:var(--font-mono);font-size:9px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--ink);font-weight:400}
.tt-t .k{display:block;margin-top:3px;font-family:var(--font-mono);
  font-size:8.5px;color:var(--ink-faint)}
.tt-c{display:flex;justify-content:flex-end;margin-top:7px;padding-top:5px;
  border-top:1px solid var(--rule-hair)}
.tt-b{display:inline-flex;align-items:center;justify-content:center;
  width:var(--vp-gl);height:var(--vp-gl);padding:0;border:0;background:none;
  cursor:pointer;line-height:0}
.tt-b .badge{color:var(--ink-muted)}
.tt-b:hover .badge{color:var(--accent)}
.tt-b .ic{width:12px;height:12px}
/* One glyph mirrored is one glyph, and the pair can never drift apart. */
.tt-b.rev{transform:scaleX(-1)}
.tt-b .pp-a,.tt-b .pp-b{display:inline-flex;line-height:0}
.tt-b .pp-b{display:none}
.vp.tpaused .tt-b .pp-a{display:none}
.vp.tpaused .tt-b .pp-b{display:inline-flex}
/* The cluster being read. Two rings: the inner one is the amber the numbers
   already wear, the outer one is the dust it throws while it is the subject. */
.vp .vp-grp.thi{border-radius:5px;
  box-shadow:0 0 0 2px var(--stroke-amber),0 0 0 7px var(--pastel-amber)}
.vp .vp-grp.thi .hn{background:var(--stroke-amber);
  border-color:var(--stroke-amber);color:var(--paper-card)}
.vp.tour .hn{display:flex}

/* ------------------------------------------------ options that have a face */
/* Shape and swatch cannot be cycled blind and cannot be listed as words: no
   reader converts "p7" back into a colour, and six shape names are six things
   to picture and then match. Both are drawn at the size they are chosen at. */
.pk-grid{display:grid;gap:4px;padding:2px 8px 6px}
.pk-grid.sh{grid-template-columns:repeat(3,auto)}
.pk-grid.tn{grid-template-columns:repeat(4,auto)}
.pk-sw{padding:2px;background:var(--paper-card);border:1px solid var(--rule);
  border-radius:3px;cursor:pointer;line-height:0}
.pk-sw:hover{border-color:var(--ink-muted)}
.pk-sw.on,.pk-sw[aria-pressed="true"]{border-color:var(--stroke-amber);
  box-shadow:0 0 0 2px var(--stroke-amber)}
/* ------------------------------------------------------------ the stage */
/* Inside a viewport the stage is the body and nothing else: the frame already
   owns the border, the radius and the clipping, and a second border here drew
   a hairline just inside the first one on every rebuild. */
/* The frame was two thirds air. A stage is sized to the subject standing in
   it, not to a nice ratio, and 16/10 at full page width put the model in a
   field. The cap matters more than the ratio: past it the extra height is
   floor and sky, and the reader scrolls to reach the controls. */
.vw .vp-body{width:100%;aspect-ratio:16/9;max-height:392px}
.vw .stage{position:absolute;inset:0;aspect-ratio:auto;margin:0;border:0;
  border-radius:0;background:var(--paper-alt)}
/* The frame says which of the two things it is. A viewport that can be edited
   and one that can only be looked at wear the same rails -- that is the point,
   the rails are the view's controls either way -- so the difference has to be
   said, and it is said in the corner rather than by changing the controls. */
.vp-name .badge{display:inline-flex;align-items:center;gap:5px;font-size:9px;
  letter-spacing:.06em;text-transform:uppercase}
.vp-name .badge .ic{width:9px;height:9px}
.vw .stage.editing{box-shadow:inset 0 0 0 2px var(--accent)}

/* --------------------------------------------------------------- tip mark */
/* The glyph form of .tip. The dotted underline that promises a pointer on a word
   makes no sense under a 10px circle, so it comes off and the mark carries the
   affordance by being a mark. It is inline-flex at a fixed size so a cell that
   gains one does not gain a millimetre of height, and muted until hovered so a
   column of them reads as a margin note rather than as data. */
.tip.mk{display:inline-flex;vertical-align:-1px;margin-left:4px}
.tip.mk > label{border-bottom:0;display:inline-flex;align-items:center;
  cursor:pointer;color:var(--ink-soft);opacity:.7}
.tip.mk > label .ic{width:10px;height:10px}
.tip.mk > label:hover,.tip.mk > input:focus-visible + label{color:var(--accent);opacity:1}
.tip.mk .body{top:1.5em}
/* In a table the mark sits at the end of a value, so the panel is measured from
   the mark rather than from the cell and cannot push the column wider. */
td .tip.mk .body,th .tip.mk .body{width:300px}

/* ------------------------------------------------------ segmented control */
/* Radios wearing badges. The input keeps its box in the flow if you only make it
   transparent, and a native radio sits on the text baseline rather than on the
   badge centre -- which put every badge in the strip half a line low and out of
   line with its neighbours. It is taken out of flow instead of hidden, because a
   display:none radio is not focusable and the strip stops working from the
   keyboard. Checked state mirrors .gctl exactly: same border, same inset rule,
   no second visual language for the same idea. */
.seg-ctl{position:relative;display:flex;flex-wrap:wrap;align-items:center;
  gap:5px;margin-top:10px}
.seg-ctl input{position:absolute;width:1px;height:1px;margin:0;padding:0;
  border:0;opacity:0;clip-path:inset(50%);pointer-events:none}
.seg-ctl label{display:inline-flex;align-items:center;cursor:pointer;padding:2px 3px}
.seg-ctl label .badge{cursor:pointer}
.seg-ctl input:checked + label .badge{border-color:var(--stroke-amber);color:var(--ink);
  background:var(--pastel-amber)}
.seg-ctl label:hover .badge{border-color:var(--ink-muted)}
.seg-ctl input:focus-visible + label .badge{outline:2px solid var(--stroke-teal);
  outline-offset:2px}

/* --------------------------------------------------------- glyph controls */
/* A row of icon buttons that behave like badges: same height, same border, same
   radius. They differ from .badge only in being pressable, so they must not
   redeclare geometry -- they carry .badge and add state. */
.gctl{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.gctl button{background:none;border:0;padding:2px 3px;cursor:pointer;font:inherit}
.gctl button .badge{cursor:pointer}
.gctl button[aria-pressed="true"] .badge{border-color:var(--stroke-amber);color:var(--ink);
  background:var(--pastel-amber)}
.gctl button:hover .badge{border-color:var(--ink-muted)}

/* ---------------------------------------------------------- viewports */
/* A frame whose controls dock inside it. The frame is a positioning context and
   nothing else; every dock is absolute against it, so the content keeps the
   whole rectangle and a grid of four frames costs no toolbars at all. Docks are
   9px off the edge -- the same inset as the .hud that predates them, because two
   insets on one page reads as a mistake even when neither is wrong. */
/* One inset and one glyph box for every dock. Tile sets these once at the top
   of the card and every rail measures from them, which is why its clusters
   line up across four edges; four hand-tuned numbers never do. */
.vp{--vp-in:6px;--vp-gl:24px;--vp-gap:4px;
  position:relative;border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--paper-alt);overflow:hidden}
.vp-body{position:relative;aspect-ratio:16/10;display:block}
.vp-body > svg,.vp-body > canvas,.vp-body > img{display:block;width:100%;height:100%}
/* The options rail spans the top edge so its two ends anchor to the two corners.
   A rail that shrink-wrapped its content would drift as the labels changed. */
.vp-top{position:absolute;left:var(--vp-in);right:var(--vp-in);top:var(--vp-in);display:flex;
  align-items:flex-start;justify-content:space-between;gap:8px;pointer-events:none}
.vp-top > .l,.vp-top > .r{display:flex;align-items:center;gap:var(--vp-gap);
  flex-wrap:wrap;pointer-events:auto}
.vp-top > .r{justify-content:flex-end}
/* One row for all three bottom docks, so an empty centre still holds its column
   and the left and right clusters cannot drift inward to meet each other. */
.vp-bot{position:absolute;left:var(--vp-in);right:var(--vp-in);bottom:var(--vp-in);display:grid;
  grid-template-columns:1fr auto 1fr;align-items:end;gap:8px;pointer-events:none}
.vp-bot > .d{display:flex;align-items:center;gap:var(--vp-gap);pointer-events:auto;min-width:0}
.vp-bot > .bl{justify-content:flex-start}
.vp-bot > .bc{justify-content:center}
.vp-bot > .br{justify-content:flex-end}
/* Controls sit on their own plate rather than directly on the content: over a
   map or a rendered stage the badge border alone is not enough separation, and
   a translucent plate keeps the frame legible underneath. */
.vp-btns button{background:none;border:0;padding:0;cursor:pointer;font:inherit}
.vp-btns button .badge{cursor:pointer}
.vp-btns button:hover .badge{border-color:var(--ink-muted)}
/* The readout. Bigger than the body face, not smaller: it is the one figure on
   the page meant to be read at a glance and from a distance. */
.vp-read{display:flex;align-items:baseline;gap:4px;padding:4px 8px 5px;
  background:var(--tip-paper);border:1px solid var(--rule-soft);
  border-radius:var(--radius);box-shadow:0 1px 4px rgba(0,0,0,.10)}
.vp-read .v{font-family:var(--font-mono);font-size:17px;line-height:1;
  font-variant-numeric:tabular-nums;color:var(--ink)}
.vp-read .u{font-family:var(--font-mono);font-size:8.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-soft)}
.vp-read .s{font-size:8.5px;color:var(--ink-muted);margin-left:4px}
/* The picker. Checkbox, label and a full-viewport scrim label behind the panel,
   so outside-click dismissal is a real click on a real element and needs no
   script. It opens away from the edge it is docked to. */
.vp-pick{position:relative;display:inline-flex}
.vp-pick > input{position:absolute;width:1px;height:1px;opacity:0;
  clip-path:inset(50%);pointer-events:none}
.vp-pick > .mk{display:inline-flex;cursor:pointer}
.vp-pick > .mk .badge{cursor:pointer}
/* On is amber, never black. Black fill is what a control does when it has run
   out of vocabulary: it stops being a glyph and becomes a hole. Amber is the
   page's word for the thing being talked about, and a pressed tool IS that. */
.vp-pick > input:checked ~ .mk .badge{border-color:var(--stroke-amber);color:var(--ink);
  background:var(--pastel-amber)}
.vp-pick > .scrim{display:none;position:fixed;inset:0;z-index:14;cursor:default}
.vp-pick > input:checked ~ .scrim{display:block}
.vp-pick > .panel{display:none;position:absolute;z-index:15;left:0;top:calc(100% + 6px);
  min-width:118px;padding:6px 0;background:var(--tip-paper);
  border:1px solid var(--rule);border-radius:var(--radius);
  box-shadow:0 6px 20px rgba(0,0,0,.14)}
.vp-pick.up > .panel{top:auto;bottom:calc(100% + 6px)}
.vp-pick.rt > .panel{left:auto;right:0}
.vp-pick > input:checked ~ .panel{display:block}
.vp-pick .panel .t{display:block;padding:1px 10px 5px;font-family:var(--font-mono);
  font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft)}
.vp-pick .panel .opt{display:block;padding:4px 10px;font-size:10.5px;
  color:var(--ink-muted);white-space:nowrap;cursor:pointer}
.vp-pick .panel .opt:hover{background:var(--paper-alt);color:var(--ink)}
.vp-pick .panel .opt.on{color:var(--ink);font-weight:600;
  box-shadow:inset 2px 0 0 var(--accent)}
/* The frame's own name, printed on the frame rather than under it: in a grid, a
   caption below a viewport is nearer the next viewport than to its own. It is a
   strip with its own rule rather than text floated over the content, and the
   bottom docks lift clear of it -- overlaid, it ran straight through the
   bottom-left cluster on the first frame that had both. */
.vp-cap{position:absolute;left:0;right:0;bottom:0;padding:4px 10px 5px;
  background:var(--paper);border-top:1px solid var(--rule-soft);
  font-family:var(--font-mono);font-size:9px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-soft);pointer-events:none}
.vp.has-cap .vp-bot{bottom:28px}
/* A single frame at page width is 16:10 of a very wide column. A map or a track
   is the one thing that reads better letterboxed, and it keeps the docks close
   enough together to be seen as one system. */
.vp.wide .vp-body{aspect-ratio:21/9}
.vpgrid{display:grid;gap:12px;margin-top:10px;
  grid-template-columns:repeat(auto-fit,minmax(268px,1fr))}
@media (max-width:520px){.vpgrid{grid-template-columns:1fr}}

/* ------------------------------------------------------------ spark grid */
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));
  gap:9px;margin-top:10px}
.sgrid .cell{border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--paper-card);padding:8px 9px}
.sgrid .cell .hd{display:flex;align-items:baseline;justify-content:space-between;
  gap:6px;margin-bottom:5px}
.sgrid .cell .hd .nm{font-size:10px;color:var(--ink-muted)}
.sgrid .cell .hd .v{font-family:var(--font-mono);font-size:12px;color:var(--ink)}

/* -------------------------------------------------------------- banners */
/* Reserved for a statement about the data the reader must act on -- stale
   source, partial period, failed reconciliation. Not commentary; that is a
   note. A tinted box that is sometimes decorative gets skipped when it is not. */
.banner{margin:12px 0 0;padding:8px 11px;border:1px solid var(--rule);
  border-left-width:3px;border-radius:var(--radius);font-size:11px;
  line-height:1.55;color:var(--ink)}
.banner.ok{background:var(--pastel-mint);border-left-color:var(--stroke-green)}
.banner.warn{background:var(--pastel-vanilla);border-left-color:var(--stroke-amber)}
.banner.crit{background:var(--pastel-blush);border-left-color:var(--stroke-coral)}

/* ---------------------------------------------------------------- empty */
/* An empty state occupies the space the content would have, so a section with
   nothing to say does not collapse and silently reflow everything below it. */
.empty{display:flex;align-items:center;justify-content:center;min-height:58px;
  margin-top:10px;padding:12px;background:var(--paper-alt);
  border:1px dashed var(--rule);border-radius:var(--radius);
  font-size:11px;color:var(--ink-muted);text-align:center}

/* ---------------------------------------------------------------- meter */
/* A single-value bar. Width is inline because it is the datum; colour is a
   class because it is design. That split is the whole rule. */
.meter{position:relative;height:9px;background:var(--paper-alt);
  border:1px solid var(--rule);border-radius:2px;overflow:hidden}
.meter i{display:block;height:100%;border-right:1px solid var(--rule-soft)}
.meter.tall{height:13px}
/* Label and figure on one baseline, bar spanning both columns under them. The
   figure used to be centred against the whole two-row stack, which left it
   hanging between the label and the bar and touching neither. Tabular figures
   and a right edge so a column of these lines up down the page. */
.meter-row{display:grid;grid-template-columns:1fr auto;column-gap:10px;row-gap:3px;
  align-items:baseline;margin-top:7px;max-width:380px}
.meter-row .lb{font-size:10px;color:var(--ink-muted);min-width:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.meter-row .vl{font-family:var(--font-mono);font-size:10px;color:var(--ink);
  font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.meter-row .meter,.meter-row .bullet{grid-column:1 / -1}
/* The bullet is drawn 240x15 and stretched horizontally on purpose, so its
   height must be pinned. Left to height:auto it keeps the 16:1 ratio of the
   viewBox, and at page width a 15px bar came out 70px tall -- a pale block. */
.meter-row .bullet{height:15px}

/* --------------------------------------------------------------- charts */
/* Every drawing is a block so it cannot pick up the inline-formatting leading of
   its paragraph, and every one is width-capped rather than stretched: a chart
   allowed to fill a 1600px window turns a legible line into a flat one. */
.donut,.bullet,.heat,.tline,.lchart,.bchart,.schart{display:block;max-width:100%;
  height:auto;margin:0 auto}
.lchart,.bchart,.schart,.tline{width:100%}
/* The calendar band is the one drawing that keeps its authored pixel size. It
   is sized in cells, not in columns, so it overflows its scroll box rather than
   scaling a 9px cell up to whatever width the page happens to have. */
.heat{width:auto;max-width:none;margin:0}
.scroll > .heat{margin:2px 0 4px}

/* The band and the rail that sizes it. The rail sits over the top-left corner
   of the box, the way tile stacks its viewport controls over the corner of the
   stage rather than in a strip above it -- the control belongs to the thing,
   and a toolbar in the margin makes the reader look away from it to use it.
   Hidden until the script marks the box live: three buttons that do nothing are
   worse than no buttons. */
.heat-box{position:relative}
/* Straddling the left edge, the way the scroll hint straddles the right. Flush
   inside, the rail covered the weekday gutter and took Mon off the band. */
.heat-ctl{position:absolute;left:-10px;top:-1px;z-index:3;display:none;margin:0;
  flex-direction:column;gap:0;background:var(--paper-card);
  border:1px solid var(--rule);border-radius:var(--radius);
  box-shadow:0 2px 8px rgba(0,0,0,.10)}
.heat-box.live .heat-ctl{display:flex}
.heat-ctl button{padding:3px 4px;line-height:0}
.heat-ctl button + button{border-top:1px solid var(--rule-soft)}
.heat-ctl button svg{width:9px;height:9px;fill:var(--ink-muted)}
.heat-ctl button[disabled] svg{fill:var(--rule)}
/* The magnifying glass reports what it did. A write to localStorage is
   invisible, and a control that gives no sign it worked gets pressed twice. */
.heat-ctl button.kept svg{fill:var(--stroke-mint)}

/* --------------------------------------------------- the table mark */
/* One fact about the whole table, above its top-left corner. It is a paragraph
   in the flow above the scroll box rather than a badge positioned over it: the
   scroll box clips, and anything overlapping its top edge is cut the moment the
   table is wide enough to scroll -- which is every table this system is for.
   The 6px below it is less than the 10px a paragraph would take, so the mark
   reads as belonging to the table under it and not to the prose above. */
p.tmark{margin:0 0 6px}
/* Hollow on purpose. A filled badge here would be the loudest thing on a table
   made of quiet ones, and what it says -- some of this is pooled -- is a
   qualification, not a heading. */
p.tmark .badge{font-size:9px;letter-spacing:.06em;text-transform:uppercase;
  display:inline-flex;align-items:center;gap:5px;cursor:help}
p.tmark .badge .ic{width:9px;height:9px}

/* ----------------------------------------------------------- the drill */
/* The crumb rail sits in the corner the reader looks at first when an overlay
   opens over something they were already reading, and it is boxed because at
   this size an unboxed row of small words reads as a sentence rather than as a
   control. Its own top-left corner is the dialog's, less the padding -- the box
   is the first thing in the panel, not a thing floated over it, so it cannot
   collide with the close control on the opposite corner. */
.crumbs{display:inline-flex;align-items:center;gap:5px;margin:0 0 10px;
  padding:3px 7px;border:1px solid var(--ink);border-radius:var(--radius-sm);
  background:var(--paper);font-family:var(--font-mono);font-size:9px;
  letter-spacing:.06em;text-transform:uppercase;max-width:100%;flex-wrap:wrap}
.crumbs .cb{border:0;background:none;padding:0;font:inherit;letter-spacing:inherit;
  color:var(--ink-muted);cursor:pointer;text-transform:inherit}
.crumbs .cb:hover{color:var(--ink);text-decoration:underline}
/* The last crumb is where the reader is. It is not a button, because a control
   that returns you to where you already are teaches that the rail does nothing. */
.crumbs .cb.on{color:var(--ink);font-weight:600;cursor:default}
.crumbs .cs{display:inline-flex;color:var(--ink-faint)}
.crumbs .cs .ic{width:7px;height:7px}
/* A row that opens a depth. Same affordance as tr.clickable, kept separate
   because these live inside the overlay and the overlay is set one step smaller
   than the page. */
dialog.rows.drill tr.dr{cursor:pointer}
dialog.rows.drill tr.dr:hover > td{background:var(--paper-alt)}
dialog.rows.drill tr.dr:focus-visible{outline:2px solid var(--ink);outline-offset:-2px}
/* A glyph and a word, and no box. Inside a row the box is the thing that reads
   as a value -- a badge in a cell of a table made of badges is another badge to
   compare, and the method of a charge is not something anyone compares. The
   glyph carries it and the word says it. */
.gl{display:inline-flex;align-items:center;gap:5px;color:var(--ink-muted);white-space:nowrap}
.gl .ic{width:10px;height:10px;flex:0 0 auto;opacity:.9}
/* The record. Two columns, the labels quiet, the values at the panel's weight. */
dl.pt{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;
  margin:0 0 12px;font-size:10px}
dl.pt dt{color:var(--ink-faint);text-transform:uppercase;letter-spacing:.06em;font-size:9px}
dl.pt dd{margin:0;color:var(--ink)}

/* ------------------------------------------------------- history column */
/* A history column is one shape wide and must not be allowed to set the row
   height, so the cell is sized and the SVG fills it. preserveAspectRatio is
   none on this spark, which is what lets 68x18 hold twelve months without the
   line going flat. */
/* 12px, not 18. The row height is the table's whole argument -- ROW_PX in
   tables.ts is 29 and the rail's fit() is measured against it, so a column that
   makes rows taller does not just cost density, it silently mis-sizes the
   rotated label two columns to the left. The history has to fit the row the
   table already had. */
td.hs{width:68px}
.hcell{display:block;height:12px;line-height:0}
.hcell .spark{display:block;width:60px;height:12px}
/* The residual line. Muted rather than badged: it is the same kind of thing as
   the rows above it, only unnamed, and a badge would make it a category. The
   mute is put on the cell's own text and not on the cell, so the hover plate
   inside it is set at the page's weight -- a detail plate is the place the
   reader went to read, and muting what they went to read is backwards. */
td.rest > .dt{color:var(--ink-faint);font-style:italic}
td.rest > .dt > .dt-full{color:var(--ink);font-style:normal}
span.rest{display:inline-flex;align-items:center;gap:5px;color:var(--ink-faint);
  font-style:italic;font-size:9.5px}
span.rest .ic{width:9px;height:9px;flex:0 0 auto}

/* ---------------------------------------------------------------- schema */
/* An entity-relationship diagram: HTML cards over one SVG wire layer. The frame
   scrolls rather than shrinking the cards, because a schema read at 60% is a
   picture of a schema. */
.erd{position:relative;overflow:auto;border:1px solid var(--rule);
  border-radius:var(--radius);background:var(--paper-alt);padding:10px}
.erd-stage{position:relative;transform-origin:0 0}
.erd-wires{position:absolute;left:0;top:0;pointer-events:none}
/* The card. Ink border and the page drop shadow, so it reads as a thing laid on
   the stage; the wires pass behind it because the stage is painted first. */
.ecard{position:absolute;width:176px;background:var(--paper-card);
  border:1px solid var(--ink);border-radius:var(--radius-sm);
  box-shadow:2px 2px 0 var(--rule);overflow:hidden}
.ehd{display:flex;align-items:center;justify-content:space-between;gap:8px;
  height:26px;padding:0 6px 0 8px;background:var(--paper-alt);
  border-bottom:1px solid var(--ink);font-size:10.5px;font-weight:600}
.ecol{display:flex;align-items:center;justify-content:space-between;gap:8px;
  height:19px;padding:0 8px;font-family:var(--font-mono);font-size:9px;
  color:var(--ink-muted);border-top:1px solid var(--rule-soft)}
.ecol .et{color:var(--ink-faint);text-align:right;white-space:nowrap}
/* A key row is tinted, not boxed. The tint says "these are the rows the diagram
   is wired through" without spending a border the card is already using. */
.ecol.pk,.ecol.fk{background:var(--pastel-vanilla)}
.ecol.pk .en{font-weight:700;color:var(--ink)}
/* The dot is the key mark. A glyph at 9px in a 19px row is a smudge; a filled
   circle is legible at any size and needs no file. */
.ecol.pk .en::before{content:"";display:inline-block;width:5px;height:5px;
  margin-right:5px;border-radius:50%;background:var(--stroke-lilac);
  vertical-align:1px}
.ecol.fk .en{font-style:italic;color:var(--stroke-lilac)}
/* The foreign-key mark. A 7px glyph in a 19px row came out as two specks; the
   arrow is a character, sets at the row's own size, and needs no file. */
.ecol.fk .en::after{content:"\\2197";margin-left:4px;font-style:normal}
.ehd .ecount{font-family:var(--font-mono);font-size:9px;color:var(--ink-faint);
  letter-spacing:.03em}
/* margin-top comes from .gctl, which is a rail that sits under a figure. This
   one is pinned to a corner, where a 10px top margin is 10px of drift. */
.erd-ctl{position:absolute;right:10px;top:10px;z-index:3;display:none;margin:0;
  background:var(--paper-card);border:1px solid var(--rule);
  border-radius:var(--radius);box-shadow:0 2px 8px rgba(0,0,0,.10)}
.erd.live .erd-ctl{display:flex}
.erd-ctl button{padding:4px 5px;line-height:0}
.erd-ctl button + button{border-left:1px solid var(--rule-soft)}
.erd-ctl button svg{width:9px;height:9px;fill:var(--ink-muted)}
.erd-ctl button[disabled] svg{fill:var(--rule)}

/* A drop control that carries a glyph. The canonical bare variant sizes its mark
   because a bare control IS the mark; the boxed one never had one to size, and an
   unsized inline SVG in a 19px box comes out at whatever the file says. */
dialog.rows button.drop .ic{width:9px;height:9px;margin-right:5px;vertical-align:-1px}

/* The canonical hint rotates its glyph, which assumes a caret drawn pointing
   down. Ours is a circle-chevron already pointing where the table goes. */
.scroll-hint svg{transform:none}

/* A table caption carries its scope on its own line, the same as a figure does.
   The canonical rule is scoped to figure figcaption, so a scope inside a
   caption inherited nothing and ran straight on from the sentence before it. */
caption .scope{display:block;margin-top:4px;font-family:var(--font-mono);
  font-size:10.5px;line-height:1.5;color:var(--ink-soft)}
.donut{margin:6px auto 2px}
.hbars{margin-top:8px}
.donut-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:8px}
.donut-row .lg{flex:1 1 190px;min-width:0}
/* Two rings on one row, each in half the column with its legend under it. Side
   by side the ring and its legend split the column and the ring loses half its
   diameter for a list that reads perfectly well underneath. Below 460px the pair
   stacks: two 132px rings in a phone column are two 60px rings. */
.donut-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px 18px;margin-top:8px}
.donut-pair .du{display:flex;flex-direction:column;align-items:center;gap:9px;
  min-width:0}
.donut-pair .du .lg{width:100%}
.donut-pair .du .legend{justify-content:center;margin:0}
@media (max-width:460px){.donut-pair{grid-template-columns:1fr}}

/* ------------------------------------------------------------- hover pods */
/* The readout a chart shows under the pointer. Hidden by default and revealed by
   hovering or focusing the group that owns it, so the picture is complete with
   scripting off and the detail is reachable from the keyboard. The plate is
   drawn inside the SVG, so the root has to stop clipping: a pod on the last
   point of a line sits past the right edge of the viewBox by design. */
.lchart,.bchart,.schart{overflow:visible}
.hv .pod,.hv .on{opacity:0;transition:opacity .1s ease}
.hv:hover .pod,.hv:focus-visible .pod,.hv:hover .on,.hv:focus-visible .on{opacity:1}
.hv{outline:none}
.hv .hit{cursor:crosshair}

/* ------------------------------------------------------- meter tone fills */
/* Same twelve identity swatches and the same semantic six as .badge, so a bar
   and the badge naming it are the one colour. Declared here rather than as an
   inline background for exactly the reason the badge rule exists: a colour that
   lives in markup cannot be audited, renamed, or themed. */
.meter i.p1{background:var(--pastel-aqua)}
.meter i.p2{background:var(--pastel-vanilla)}
.meter i.p3{background:var(--pastel-mint)}
.meter i.p4{background:var(--pastel-peach)}
.meter i.p5{background:var(--pastel-lilac)}
.meter i.p6{background:var(--pastel-blush)}
.meter i.p7{background:var(--pastel-lime)}
.meter i.p8{background:var(--pastel-orchid)}
.meter i.p9{background:var(--pastel-teal)}
.meter i.p10{background:var(--pastel-rose)}
.meter i.p11{background:var(--pastel-cyan)}
.meter i.p12{background:var(--pastel-indigo)}
.meter i.ok{background:var(--pastel-green)}
.meter i.warn{background:var(--pastel-amber)}
.meter i.crit{background:var(--pastel-coral)}
.meter i.idle{background:var(--rule)}

/* ------------------------------------------------- the rotated label rail */
/* Room around the rail glyph.

   tokens.ts sets .badge.vert { padding: 0 4px }. In vertical writing the two
   values swap roles: the 4px is the ribbon's thickness and the 0 is the space at
   each *end* of it, so the glyph sat flush against the end of its own ribbon and
   the name ran to the other end with nothing between either and the rules above
   and below the block. Physical properties are used deliberately here rather than
   the logical ones -- padding-block in vertical-rl addresses the thickness,
   which is the axis that must not change. */
.badge.vert { padding-top: 4px; padding-bottom: 4px; }
/* And room between the glyph and the name it introduces. margin-inline-end
   because with the text on its side the inline axis runs down the cell -- a right
   margin would push the glyph across the ribbon instead of along it. */
.badge.vert .gm { margin-inline-end: 6px; }
/* Both of the above are spent out of the length available to the name, so
   STACK_PX in tables.ts counts them. Change one, change the other.

   They were 7 and 8. Eight pixels came off because a block only three rows deep
   is the common case in this table and every pixel of overhead is a pixel the
   name cannot have: at 7 and 8, "Credit card" could not be set inside four rows'
   worth of height and the block was stretched to five, which cost every one of
   its rows nine pixels of the density the table is for. The glyph is still held
   off the rules above and below by the stack's own nine-pixel inset, which is
   the separation that was actually doing that work. */

/* The subtotal's mark, with no box around it.

   .badge.gi in tokens.ts already says a mark is not a value and drops the fill
   and the border -- but the tone classes are declared further down the file at the
   same specificity, so .badge.gi.p5 gets its lilac back and draws the box again.
   Scoping to the subtotal row wins on specificity without touching either rule,
   and color is left alone: the glyph keeps the group's own colour, which is the
   whole reason it is there. */
tr.sub td.rot .badge.gi {
  background: transparent; border-color: transparent; padding: 0;
}

/* --------------------------------------------------- the section heading */
/* tokens.ts already sets h2 as a wrapping flex row, gives .n and .hint the same
   printed-mark treatment, and pushes .hint out to the right with margin-left:auto.
   Two things are added here and nothing is overridden.

   The statement takes the full width of the row, which in a wrapping flex row is
   what forces it onto its own line under the title. It is deliberately not a
   sibling <p>: a paragraph after the heading has the heading's bottom margin
   between them and reads as body copy that happens to sit first, where this reads
   as part of the heading and is skipped by the eye that is only scanning titles.

   Its weight and colour are stepped down from the title on purpose. Same size as
   a caption, because that is what it is. */
h2 .stmt {
  flex-basis: 100%; margin-top: 4px;
  font-size: 10.5px; font-weight: 400; line-height: 1.5;
  color: var(--ink-muted); letter-spacing: 0;
}

/* The hint's glyph. Sized to the mono cap-height beside it rather than to the
   title, or it sets the height of the whole badge and the mark stops matching
   the number at the other end of the line. */
h2 .hint .ic { width: 9px; height: 9px; margin-right: 4px; vertical-align: -1px; }

/* ---------------------------------------------------- layout surfaces */
/* Cards across, one column on a phone. auto-fit rather than a fixed count, so a
   fourth node does not need a second grid declared for it. */
.cardgrid {
  display: grid; gap: 12px; margin-bottom: 14px;
  grid-template-columns: repeat(auto-fit, minmax(232px, 1fr));
}
.cardgrid .card { margin-bottom: 0; }

/* A band member. The title takes the slack and the badges terminate on the right
   edge, so the metadata forms a column down the list instead of trailing each
   title at whatever length that title happens to be. */
.band-fs .nm { flex: 1 1 auto; min-width: 0; font-size: 11px; }
.band-fs .badge { flex: none; }
.keyrow .ki { gap: 4px; }

/* The summary of a band is the band header, so the marker has to go or it sits
   in front of a header that already carries a glyph. */
.band > summary { cursor: pointer; list-style: none; }
.band > summary::-webkit-details-marker { display: none; }

/* --- owner rulings 2026-08-24 -------------------------------------------------
   Overrides only. tokens.ts is the canonical copy and is never edited here, so
   every rule below re-states a selector that already exists there and wins on
   source order. Tokens only -- no raw hex. */

/* An account name in TBL. 5 opens a drill panel; it does not navigate. It kept the
   base anchor colour, which promised a destination the click does not have. It reads as
   body text now and earns its affordance on hover, where a pointer is already
   committed. */
.dl{color:var(--ink);text-decoration:none}
.dl:hover,.dl:focus-visible{color:var(--ink);text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}

/* A 10px render of a 512-unit thin path puts the leftmost stroke within a sub-pixel
   of the viewBox wall, and the svg box clips it. The glyph is not too big for the
   cell -- the cell has 11px of padding -- it is too big for its own frame. Let it
   bleed, and inset the pair so the bleed is not what touches the column edge. */
.gl{padding-left:2px}
.gl .ic{overflow:visible}

/* The separator between groups was a 2px ink-muted rule -- a fret heavy enough to
   read as a section break between every pair of members. It drops to the standard
   hairline; the weight is reserved for the subtotal, which is the line that is
   actually saying something. tr.sub and tr.tot keep their own rules from tokens.ts. */
table.grouped tbody tr:not(.rep):not(:first-child) > td{border-top:1px solid var(--rule)}
table.grouped tbody tr.sub > td{border-top:1px solid var(--ink-muted)}

/* The close control was a 24px bordered tile in the corner of every overlay -- a
   badge competing with the badges the overlay exists to show. It is the mark alone
   now, with the hit area kept at 24px so it stays reachable. */
dialog.rows form.x button{border-color:transparent;background:transparent}
dialog.rows form.x button:hover,dialog.rows form.x button:focus-visible{color:var(--ink);background:transparent}

/* Export sits at the caption's right margin, opposite the figure number at its left.
   It is hidden until the client wires it, because a button that cannot do anything
   is worse with scripting off than no button at all. */
caption .exp{position:absolute;right:10px;top:9px;display:inline-flex;align-items:center;gap:5px;
  padding:1.5px 7px;border:1px solid var(--rule);border-radius:var(--radius-sm);
  background:var(--paper-card);color:var(--ink-muted);cursor:pointer;
  font-family:var(--font-mono);font-size:9px;letter-spacing:.07em;text-transform:uppercase}
caption .exp .ic{width:9px;height:9px}
caption .exp:hover,caption .exp:focus-visible{color:var(--ink);border-color:var(--ink-muted)}
caption .exp[hidden]{display:none}
/* The caption reserves the corner the button occupies, so a caption long enough to
   wrap does not run underneath it. 86px on the left for the figure number, 68 on the
   right for the export. */
caption{padding-right:68px}


/* A subtitle is now a badge strip and, sometimes, an instruction. The strip wraps;
   the instruction sits under it in the muted prose size it always had, so the two
   do not read as one run of grey. */
dialog.rows .sc .sbs{display:inline-flex;flex-wrap:wrap;gap:4px;vertical-align:middle}
dialog.rows .sc .shint{display:block;margin-top:5px;color:var(--ink-faint)}

/* --- The address board -------------------------------------------------
   The row length is a custom property set on the element and used once, so
   the board cannot reflow at a narrow width and put a different character
   under the same finger. It scrolls instead. */
.ab{width:fit-content;max-width:100%;border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--paper-card);padding:6px 26px 7px 8px;margin:10px 0}
.ab-m{position:absolute;width:1px;height:1px;opacity:0;clip-path:inset(50%);
  pointer-events:none}
.ab-hd{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px}
.ab-face{flex:1;min-width:180px;font-size:10.5px;color:var(--ink-muted);
  word-break:break-all;line-height:1.5}
.ab-face b{color:var(--ink);font-weight:400}
.ab-face.dim{color:var(--ink-faint)}
.ab-tabs{display:inline-flex;gap:0;border:1px solid var(--rule);border-radius:3px;
  overflow:hidden;flex:none}
.ab-t{padding:3px 9px;font-family:var(--font-mono);font-size:9px;letter-spacing:.05em;
  text-transform:uppercase;color:var(--ink-soft);cursor:pointer;
  background:var(--paper-alt);border-right:1px solid var(--rule)}
.ab-t:last-child{border-right:0}
.ab-t:hover{color:var(--ink)}
.ab-plain:checked ~ .ab-hd .ab-t[for="ab-plain"],
.ab-ends:checked ~ .ab-hd .ab-t[for="ab-ends"],
.ab-val:checked ~ .ab-hd .ab-t[for="ab-val"]{background:var(--pastel-amber);
  border-color:var(--stroke-amber);color:var(--ink)}
.ab-grid{display:grid;grid-template-columns:repeat(var(--per),var(--cw,26px));
  gap:2px;justify-content:start}
.ab-c{position:relative;display:flex;align-items:center;justify-content:center;
  height:var(--ch,24px);padding:0;background:var(--paper-alt);
  border:1px solid var(--rule-soft);border-radius:2px;cursor:pointer;
  font-family:var(--font-mono);font-size:var(--cf,10px);
  color:var(--ink-muted);line-height:1}
.ab-c:hover{border-color:var(--ink-muted);color:var(--ink)}
.ab-c.on{border-color:var(--stroke-amber);box-shadow:0 0 0 2px var(--stroke-amber);
  color:var(--ink)}
.ab-c .vb{display:none;position:absolute;left:1px;right:1px;bottom:1px;
  height:calc(2px + var(--v) * (var(--ch,24px) - 6px));background:var(--pastel-aqua);
  border-top:1px solid var(--stroke-aqua);border-radius:1px}
.ab-c .ch{position:relative;z-index:1}
.ab-ends:checked ~ .ab-grid .ab-c{color:var(--ink-faint);
  border-color:var(--rule-soft);background:transparent}
.ab-ends:checked ~ .ab-grid .ab-c.e{color:var(--ink);background:var(--paper-alt);
  border-color:var(--ink-muted)}
.ab-val:checked ~ .ab-grid .ab-c .vb{display:block}
.ab-val:checked ~ .ab-grid .ab-c{color:var(--ink-soft)}
.ab-ft{display:flex;align-items:flex-start;gap:8px;margin-top:6px}
.ab-ft .t{flex:1;font-size:9.5px;line-height:1.45;color:var(--ink-faint)}

/* --- Field controls ----------------------------------------------------
   A field is a name, a control and a note. The control wears the page's
   type; the platform's chrome is what is being replaced, never the input
   element itself, which still carries the value and the keyboard. */
.fset{border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--paper-card);overflow:hidden;margin:12px 0;max-width:430px}
.fset-hd,.fset-ft{display:flex;align-items:flex-start;gap:6px;padding:6px 10px;
  font-family:var(--font-mono);font-size:9px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-soft);background:var(--paper-alt)}
.fset-hd{border-bottom:1px solid var(--rule-soft)}
.fset-ft{border-top:1px solid var(--rule-soft);text-transform:none;
  letter-spacing:0;font-family:var(--font-sans);font-size:9.5px;line-height:1.45;
  color:var(--ink-faint)}
.fset-hd .ic,.fset-ft .ic{width:11px;height:11px;flex:none;margin-top:1px}
.fld{display:grid;grid-template-columns:88px 1fr;gap:2px 10px;align-items:center;
  padding:7px 10px;border-bottom:1px solid var(--rule-soft)}
.fld:last-of-type{border-bottom:0}
.fl{font-family:var(--font-mono);font-size:9px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-soft)}
.fc{display:flex;align-items:center;gap:6px;min-width:0}
.fn{grid-column:2;font-size:9px;line-height:1.4;color:var(--ink-faint)}
.fin{width:100%;max-width:210px;padding:2px 0;background:transparent;
  border:0;border-bottom:1px solid var(--rule);border-radius:0;
  font-family:var(--font-sans);font-size:11px;color:var(--ink)}
.fin.mono{font-family:var(--font-mono);font-size:10px}
.fin:focus{outline:0;border-bottom-color:var(--accent)}
.fp{position:relative;display:inline-flex}
.fp > input{position:absolute;width:1px;height:1px;opacity:0;clip-path:inset(50%);
  pointer-events:none}
.fp-f{display:inline-flex;align-items:center;gap:6px;padding:2px 6px 2px 0;
  border-bottom:1px solid var(--rule);cursor:pointer;font-size:11px;
  color:var(--ink);min-width:140px}
.fp-f .v{flex:1}
.fp-f .ic{width:9px;height:9px;color:var(--ink-faint)}
.fp-f:hover{border-bottom-color:var(--ink-muted)}
.fp > .scrim{display:none;position:fixed;inset:0;z-index:24;cursor:default}
.fp-p{display:none;position:absolute;left:0;top:calc(100% + 3px);z-index:25;
  min-width:150px;padding:4px;background:var(--tip-paper);
  border:1px solid var(--rule);border-radius:var(--radius);
  box-shadow:0 6px 18px rgba(0,0,0,.14)}
.fp > input:checked ~ .scrim,.fp > input:checked ~ .fp-p{display:block}
.fp-o{display:flex;align-items:center;gap:7px;padding:3px 7px;border-radius:2px;
  cursor:pointer;font-size:10.5px;color:var(--ink-muted)}
.fp-o:hover{background:var(--paper-alt);color:var(--ink)}
.fp-o input{position:absolute;width:1px;height:1px;opacity:0;clip-path:inset(50%)}
.fp-o .d{flex:none;width:7px;height:7px;border-radius:50%;
  border:1px solid var(--ink-faint)}
.fp-o input:checked ~ .d{background:var(--ink);border-color:var(--ink)}
.fp-o input:checked ~ .d + *,.fp-o:has(input:checked){color:var(--ink)}
.fst{display:inline-flex;align-items:center;gap:6px}
.fs{padding:0;background:none;border:0;cursor:pointer;line-height:0}
.fst .v{min-width:14px;text-align:center;font-size:11px;color:var(--ink)}
.fst .u{font-family:var(--font-mono);font-size:8.5px;letter-spacing:.05em;
  text-transform:uppercase;color:var(--ink-faint)}
.fsw{padding:0;background:none;border:0;cursor:pointer;text-align:left}
.fsw .badge{opacity:.55}
.fsw[aria-pressed="true"] .badge{opacity:1}
/* ------------------------------------------------------- the four tools */
/* Each glyph beside the circle-i opens a drawn tool rather than cycling. The
   panels are wider than a list because what is in them is drawn at the size it
   is chosen at -- a swatch the size of a word is a word about a colour. */
.pk-sub{display:block;padding:6px 10px 3px;margin-top:2px;
  border-top:1px solid var(--rule-hair);font-family:var(--font-mono);
  font-size:8.5px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink-soft)}
.pk-grid.fl{grid-template-columns:repeat(3,auto)}
/* The ramp: one swatch sets four, and the four are shown. A grid of twelve
   with no ramp reads as twelve wrong answers to a question about one colour. */
.pk-ramp{display:flex;gap:4px;padding:2px 8px 6px}
.pk-ramp .rp{display:flex;flex-direction:column;align-items:center;gap:3px}
.pk-ramp .n{font-size:8px;letter-spacing:.03em;color:var(--ink-soft)}
/* Transparency, drawn as the elevation the stack has: the row a reader presses
   is in the position of the plate it changes. */
.pk-lay{display:block;padding:2px 8px 6px}
.pk-lrow{display:flex;align-items:center;gap:6px;padding:2px 0}
.pk-lrow + .pk-lrow{border-top:1px solid var(--rule-hair)}
.pk-lrow > .n{flex:1;min-width:44px;font-size:9.5px;color:var(--ink-muted)}
.pk-lrow > .c{display:flex;gap:3px}
.pk-op{padding:1px;background:var(--paper-card);border:1px solid var(--rule);
  border-radius:2px;cursor:pointer;line-height:0}
.pk-op:hover{border-color:var(--ink-muted)}
.pk-op.on,.pk-op[aria-pressed="true"]{border-color:var(--stroke-amber);
  background:var(--pastel-amber)}
/* Viewing and editing, both drawn, so the control says what the other side
   looks like before the reader is standing in it. */
.pk-modes{display:flex;gap:6px;padding:2px 8px 6px}
.pk-mode{display:flex;flex-direction:column;align-items:flex-start;gap:4px;
  padding:4px;background:var(--paper-card);border:1px solid var(--rule);
  border-radius:3px;cursor:pointer;text-align:left}
.pk-mode:hover{border-color:var(--ink-muted)}
.pk-mode.on,.pk-mode[aria-pressed="true"]{border-color:var(--stroke-amber);
  background:var(--pastel-amber)}
.pk-mode .n{display:flex;flex-direction:column;line-height:1.3}
.pk-mode .n b{font-size:9.5px;font-weight:600;color:var(--ink)}
.pk-mode .n span{font-size:8.5px;color:var(--ink-muted)}

/* --------------------------------------------------- what is in hand */
/* Under the frame, not over it. The floating version had a shut state and a
   reopen badge, which is two controls existing to undo a placement decision.
   A strip below the frame is readable at the same time as the subject -- the
   whole argument for docking it inside -- without standing on it. */
.vw-wrap{margin:14px 0}
.vw-wrap > .vp{margin:0}
.vw-hand{display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:7px 10px 8px;background:var(--paper-card);
  border:1px solid var(--rule);border-top:0;
  border-radius:0 0 var(--radius) var(--radius)}
.vw-hand[hidden]{display:none}
.vw-hand .hb-k{flex:none}
.vw-hand .hb-t{flex:1;min-width:200px;display:flex;align-items:baseline;
  gap:6px;flex-wrap:wrap}
.vw-hand .hb-t b{font-size:11px;font-weight:600;color:var(--ink)}
.vw-hand .hb-t .mono{font-family:var(--font-mono);font-size:9px;
  letter-spacing:.05em;color:var(--ink-soft)}
.vw-hand .hb-t .ask{flex:1;min-width:180px;font-size:9.5px;line-height:1.45;
  color:var(--ink-muted)}
.vw-hand .hb-c{display:flex;gap:5px;flex:none}
/* The frame is editable, and the strip under it is the sentence that says so.
   It takes the accent the frame takes, on the edge they share. */
.vw-wrap .vp:has(.stage.editing) + .vw-hand{border-color:var(--accent)}
/* Turning the subject is a drag, so the surface says it is grabbable before it
   is grabbed and says it is held while it is. */
.vw .stage{cursor:grab}
.vw .stage.dragging{cursor:grabbing}

/* ----------------------------------------------- enlarge and reduce */
/* The board is one address at five densities, from a single line of forty
   cells to five fat ones per row. The control lives on the board's own right
   border, because it changes the board's shape and nothing else on the page --
   a control that reshapes its container belongs on that container's edge.
   It is radios and sibling selectors: no script, and the state survives a
   reader who has JavaScript off. */
/* A row that opens on the second click still has to look pressable on the
   first. tokens.ts gives tr.clickable the cursor; a grouped row cannot take
   that class without colliding with .rep, so the handle does the job. */
tr[data-tx]{cursor:pointer}

/* The hover detail, lifted out of the scrolling box that was cutting it off.
   Only under .js-dtx, because the two coordinates come from the script and a
   fixed box with no coordinates is worse than a clipped one. */
.js-dtx .dt-full{position:fixed;left:var(--dtx,0);top:var(--dty,0);bottom:auto;
  right:auto;z-index:60;width:var(--dtw,268px);max-width:none}
.ab{position:relative}
.ab-side{position:absolute;top:-1px;bottom:-1px;right:-1px;width:20px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;border-left:1px solid var(--rule-soft);
  border-radius:0 var(--radius) var(--radius) 0;background:var(--paper-alt)}
.ab-side label{display:none;padding:2px;cursor:pointer;color:var(--ink-soft);
  line-height:0}
.ab-side label:hover{color:var(--ink)}
.ab-side .ic{width:11px;height:11px}
/* Only the two steps a reader can actually take are drawn. At either end of
   the ramp one of them is not a step, and a dead control is worse than a
   missing one -- it invites the press and then does nothing. */
.ab-p0:checked ~ .ab-side .s0,.ab-p1:checked ~ .ab-side .s1,
.ab-p2:checked ~ .ab-side .s2,.ab-p3:checked ~ .ab-side .s3,
.ab-p4:checked ~ .ab-side .s4{display:block}
.ab-side label:focus-within{outline:2px solid var(--stroke-teal);outline-offset:1px}
/* The five densities. Cell width, height and type size move together: a cell
   is a character, and a character that keeps its size while its box grows is
   just a box with more air in it. */
.ab-p0:checked ~ .ab-grid{--per:40;--cw:15px;--ch:18px;--cf:8.5px}
.ab-p1:checked ~ .ab-grid{--per:20;--cw:20px;--ch:21px;--cf:9.5px}
.ab-p2:checked ~ .ab-grid{--per:10;--cw:26px;--ch:24px;--cf:10px}
.ab-p3:checked ~ .ab-grid{--per:8;--cw:31px;--ch:28px;--cf:11px}
.ab-p4:checked ~ .ab-grid{--per:5;--cw:44px;--ch:34px;--cf:13px}
/* The footer says which of the five it is. One badge, five sentences, four of
   them not drawn -- the alternative is a badge that changes width as the count
   changes, and a column whose width moves is a column that reads as broken. */
.ab-cn{display:inline-flex}
.ab-n{display:none}
.ab-p0:checked ~ .ab-ft .n0,.ab-p1:checked ~ .ab-ft .n1,
.ab-p2:checked ~ .ab-ft .n2,.ab-p3:checked ~ .ab-ft .n3,
.ab-p4:checked ~ .ab-ft .n4{display:inline}

`;
