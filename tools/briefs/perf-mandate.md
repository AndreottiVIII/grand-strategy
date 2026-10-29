# Mandate: map performance, items 1-6 (2026-10-29)

Repository: `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. The site is static (`docs/`), plain JS + d3 v7,
served locally at `http://localhost:8765` (already running; the Browser pane tools reach it; reload with a
changed `?r=` query to bust the cache). The map is drawn by `drawMap()` in `docs/app.js`; styles in
`docs/style.css`. Read `CLAUDE.md` first (the look is deliberate: green phosphor, glow, CRT lines, warming
countries breathe, cooling ones flicker; keep it).

An external analysis (Chrome on an Apple M4, 1440x900 @2x) measured: view `#/view/ARM` 70-75% CPU at rest and
~100% during zoom; `#/view/USA` 69% at rest; without the CSS animations 8-11% and 44%; without the glow filter
50%; the CRT lines and text-shadow are innocent. Diagnosis, confirmed in the code:

1. `@keyframes breathe` / `flicker` (style.css ~305-309) animate `stroke-opacity` on `svg#map path.p.warming`
   / `.cooling`, which also carry `filter="url(#glow)"` (feGaussianBlur). Inline SVG is painted on the main
   thread; an animated opacity on a filtered path repaints its blurred area every frame, forever.
2. `rescale(k)` (app.js ~348-365) runs on every zoom event: seven `selectAll().attr()` passes over all paths,
   one `path.bounds(feature)` per label (a reprojection), the hatch pattern and the `.seats` rects.
3. `showTip` (~280) rewrites `innerHTML` and reads `offsetWidth`/`offsetHeight` on every mousemove;
   `lightCard` (~476) does a `querySelectorAll` on the ledger on every mousemove.
4. `stanceOf` (~211) is a linear `find` over the pov's stances, called many times per draw.

## Do, in this order, each as a separate commit-sized change (do not commit; the coordinator commits)

1. **Animations on the compositor.** Keep the two keyframes but stop animating SVG paint properties. Build two
   overlay layers for the animated outlines, one for warming and one for cooling, each its own `<svg>` element
   stacked over the map (absolute, pointer-events none, same size), containing only the outline paths of the
   animated countries (same `d`, same stroke colour and width, same glow filter, no fill), and animate the CSS
   `opacity` of each overlay root (`will-change: opacity`) with the existing keyframe timings (breathe
   .55..1, flicker as now). Keep the overlays' inner `<g>` transform identical to the map's on every zoom
   event (same `ev.transform`), and their stroke widths in step with `rescale`. The main map keeps the
   non-animated outline of those countries underneath so nothing disappears when the overlay is at low
   opacity (today the outline itself dims: reproduce that by giving the underlying outline of an animated
   country the keyframe's minimum opacity as a static stroke-opacity, and letting the overlay add the rest).
   Expose a kill switch: `?fx=noanim` renders no overlays. Pause the overlay animations while a zoom gesture
   is in progress (`animation-play-state: paused` on `zoom start`, running on `end`). Respect
   `prefers-reduced-motion: reduce` (no overlays, static outlines at full opacity).
2. **Zoom.** Replace the manual stroke-width recalculation with `vector-effect: non-scaling-stroke` on every
   path class that `rescale` touches (`.c`, `.grat`, `.p`, `.bond`, `.align`, `.seam`, and the overlay paths)
   and set their stroke widths once in screen units. Check the dash patterns (`.grat`, claimed territory
   `.p` with `stroke-dasharray`, `.align`, `.seam`): with non-scaling-stroke the dash lengths are in screen
   units too, so set them once; verify visually at k=1 and k=8 that dashes look the same as before. Cache the
   label width test: compute each label's projected x-extent once per `drawMap` (at k=1) in a Map, and in
   `rescale` only compare `extent * k` against the text width; keep the `.seats` and `#hatch` scaling but run
   the whole `rescale` inside a single `requestAnimationFrame` per zoom event (coalesce: if a frame is pending,
   just store the latest k). `?fx=nozoomopt` restores the old path for A/B.
3. **Glow off during the gesture.** On `zoom start` remove the `filter` attribute from the map group (set it
   on the group, not on each path, if that is simpler: move `filter="url(#glow)"` from the individual paths
   to the containing `<g>` elements, same look), and restore it on `end`. `?fx=nofilter` leaves it off always.
4. **Hover.** Remember the last hovered actor id; `tipFor`/`showTip` rebuild the tooltip content only when the
   id changes, and on plain movement only update `left`/`top` (reuse the measured width/height). `lightCard`
   likewise only when the id changes.
5. **Reduced motion** is covered in 1; also make the keyframes respect it in CSS.
6. **Index stances by `toward`**: build `stanceIndex[pov]` as a Map once per pov change and make `stanceOf`
   an O(1) lookup; keep the function signature.

The `?fx=` flags are read once at start (`new URLSearchParams(location.search).get("fx")`, comma-separated
values allowed: `noanim,nofilter,nozoomopt`). Document them in one comment near the top of `drawMap`.

## Rules
- Touch only `docs/app.js` and `docs/style.css`. No build needed (data unchanged). Do not commit or push.
- No new dependencies, no fourth colour, no change to what the user sees except what is listed above.
- Verify in the Browser pane: load `http://localhost:8765/?r=<new number>#/view/USA` and `#/view/ARM` and the
  home `#/`; check the console for errors (`read_console_messages`), take a screenshot of each at rest and
  after zooming in with the mouse wheel, and run this probe in the page and report its numbers for USA and
  ARM, before and after your change:
  ```js
  (async () => { const svg = document.getElementById('map'); const r = svg.getBoundingClientRect(); const cx = r.left + r.width/2, cy = r.top + r.height/2; let t0 = performance.now(); for (let i = 0; i < 40; i++) svg.dispatchEvent(new WheelEvent('wheel', { deltaY: i < 20 ? -40 : 40, clientX: cx, clientY: cy, bubbles: true, cancelable: true })); const zoomMs = (performance.now() - t0) / 40; const t = []; let last = performance.now(); const s0 = last; await new Promise(res => { const f = now => { t.push(now - last); last = now; if (now - s0 < 3000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); const s = [...t].sort((a, b) => a - b); return { zoomMsPerEvent: +zoomMs.toFixed(2), fps: Math.round(t.length / 3), p95: Math.round(s[Math.floor(s.length * .95)]), over33: t.filter(x => x > 33).length, overlays: document.querySelectorAll('svg.fx-overlay').length, animatedPaths: document.querySelectorAll('#map path.p.warming, #map path.p.cooling').length }; })()
  ```
  Baseline measured before you start: USA zoomMsPerEvent 7.33, ARM 1.38, fps 60, p95 17.
- Also check the dossier (`#/dossier/USA`) and the Seams page still render (no regressions from shared code).
- If something cannot be done without changing the look, do the rest and say exactly what you left out.

## Report (under 250 words)
What you changed, function by function; the probe numbers before and after for USA and ARM; what the
screenshots show; anything left out and why; the `?fx=` flags and what each does.
