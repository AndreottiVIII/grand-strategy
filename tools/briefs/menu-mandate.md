# Mandate: the menu on three entries, the map in front (2026-10-29)

Repository: `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Read `CLAUDE.md` first (the look: NORAD vector
screen, VT323 / Share Tech Mono, numbered uppercase entries, no soft panels, no fourth colour). The site is static
(`docs/index.html`, `docs/app.js`, `docs/style.css`), served at `http://localhost:8765` (running; reload with a
fresh `?r=` value and fetch files with `cache: 'reload'` when checking).

A reader's feedback: fourteen entries in the top menu are too many; the map is the only fully interactive view
and should be in front. Davide chose: **three entries, the map in evidence, counters under the map.**

## Target

Header, left to right: the brand (as now), then the nav with three numbered entries, then the language toggle
(as now, pinned top right). The stamp block `#meta` (compiled date, cards, actors, stances, relations) leaves
the header and goes under the map on the map view only (a small line below `.map-wrap`, same type as the
stamp has now, left-aligned; it is not shown on the pages or the dossier).

Nav entries (`#topnav`), with the CSS counter as now (01, 02, 03):
1. **Map** (`#/`): plain link, visually the first and a touch larger than the other two (same font, one size
   up, same glow).
2. **Readings**: opens a dropdown with the nine reading pages in this order, each with its Luttwak subtitle on a
   second line in the small muted type:
   - Seams · the ally pulled two ways
   - Clients · who leans on whom
   - Faults · where the bond contradicts the posture
   - Gatherings · the coalitions a weight summons
   - Currents · where the world is going
   - Theatres · where strategy is conducted
   - Flanks · the enemies of my enemies
   - Levers · the geo-economics
   - Watch · the week's news and moves
3. **About**: dropdown with Luttwak, About (the method), Data, This site.

Dropdowns: open on hover and on focus, and on click/tap (toggle) so touch screens work; close on Escape, on a
click outside, and after choosing an entry; one open at a time; keyboard reachable (the entries are real `<a>`
links with the existing `data-page` attributes and hashes, so `navigate()` keeps working unchanged). The entry
of the page in view and its parent get the `is-on` state (the parent underlined as entries are now). Style the
dropdown as a dark panel with the rule colour border, no rounded corners, no shadow blur beyond the existing
glow vocabulary; items uppercase in the UI font with the subtitle in the muted ink; hover lights the item.

On phones (≤ 600px): the three entries stay on one row; a dropdown opens as a block under the header pushing
the content down (not a floating panel), closed by tapping the entry again.

## Rules
- Touch only `docs/index.html`, `docs/app.js` (the nav wiring: `PAGE_HASH`, `setView`'s `is-on` logic, the
  `#meta` rendering and its new place) and `docs/style.css`. Every page keeps its hash and its `data-page`.
- Keep the language toggle and the `translateDom` mechanism working: the new nav labels and subtitles are plain
  text in elements the DOM translator can match (`a`, `span`, `p`); do not put text in attributes only.
- No new dependency. No change to the pages themselves.
- Verify in the Browser pane: home map (stamp under the map, three entries, dropdowns open and close, the map
  entry larger), `#/currents` (Readings parent marked `is-on`, Currents marked inside), `#/data` (About parent
  on), a dossier, and the mobile preset (`resize_window` mobile: entries on one row, dropdown as a block);
  `read_console_messages` must show no errors; take a screenshot of the header open on Readings, desktop and
  mobile. Do not commit or push.

## Report (under 200 words)
What changed in each file, what the screenshots show, anything left out.
