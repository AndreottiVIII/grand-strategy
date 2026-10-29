# Reviewer 1: the site in the browser (front end)

Read `tools/briefs/review/common.md` first. Your report: `tools/briefs/review/site-2026-10-29.md`.

Open the site with `preview_start {name: "grand-strategy"}` (entry in `ClaudeTower/.claude/launch.json`, serves
`docs/` on port 8765; if the pane is already open just navigate). Reload with a fresh `?r=<n>` to beat the cache.

Check, in this order, and after each page `read_console_messages` (any error or warning is a finding):
1. Home map: flags, hover tooltip on a country (near the four edges of the screen too: the tooltip must stay on
   screen), click a country with a card (point of view, ledger under the map), click one without a card, the
   `#meta` stamp under the map, zoom and pan, the `#/heat` lens, the `luttwak` easter egg (type the word), the
   `?og=1` preview mode.
2. A dossier (`#/actor/SRB`, then USA, CHN, nsa-houthis, org-eu): sources footnoted, flag, Wikipedia link,
   every internal link inside it (actor ids) leads to a page that exists, no "undefined", "NaN", "null",
   "[object Object]" anywhere in the text (search the page text for those strings on every page you visit).
3. Every reading page from the Readings dropdown (Seams with Hedging and Buffers, Clients, Faults, Gatherings
   with Encirclement, Currents, Theatres, Flanks, Levers, Watch) and every About page (Luttwak, About, Data,
   This site): the page renders, counts are plausible, tables are not cut, the method paragraph exists, the
   links in them resolve.
4. The nav: dropdowns open and close (hover, click, Escape, click outside), the entry of the page in view is
   marked, the Map entry is the larger one.
5. Italian: switch with the language toggle and repeat 1-3 quickly: untranslated strings on the main pages
   (list the English leftovers you see, up to 20), names on the map in Italian, no English/Italian mix inside
   one sentence, the toggle keeps the page you were on.
6. Mobile preset (`resize_window` mobile, reload): home map not wider than the screen, nav on one row,
   dropdown as a block, a dossier readable, Watch and Levers readable, the language toggle reachable. Then
   back to `preset: desktop`.
7. Static read of `docs/app.js` (search for the risky patterns rather than reading all of it): places where a
   bundle field or a computed-page field is used without a guard, `toFixed`/`toLocaleString` on possibly
   null values, event listeners added on every render without removal, `innerHTML` built from data that is
   not passed through `esc()`, hash routes that are not in `PAGE_HASH`, i18n keys built from innerHTML that
   could never match (numbers not normalised), `fetch` without error handling.
8. `docs/index.html`: the og/twitter meta (URLs still point to github.io: note it as an INCONSISTENCY to fix at
   the domain move, with the lines), favicon links, title, lang attribute, viewport.

Screenshots: one of the home map, one of a dossier, one of Watch, one mobile home; name them in the report.
