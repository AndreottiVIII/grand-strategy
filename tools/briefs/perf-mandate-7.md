# Mandate: item 7, the payload split (2026-10-29)

Repository: `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Read `CLAUDE.md` first. The site (`docs/`,
plain JS + d3 v7) loads one `docs/data.json` of 17.5 MB (4.1 MB gzipped) at start. Measured shares: relations
6.8 MB (of which sources 3.2), stances 5.9 MB (sources 3.1), actors 3.9 MB (the cards' texts and sources),
UN votes 0.8, the computed pages the rest. Only the dossier shows sources and card texts; only the point of
view's own stances and relation rows are shown on the map (tooltip notes, the ledger under the map). The build
(`tools/build.py`) already writes one bundle per actor in `docs/actors/<id>.json` with the card, the stances
both ways, the relations both ways and the votes; the site never reads them today.

## Goal
First load under 1 MB gzipped, no change to what the user sees, no change to the data files.

## Do
1. **Build** (`tools/build.py`, the `out = {...}` block and the bundles after it): keep every computed section
   as it is; slim what the site can fetch per actor:
   - `actors`: drop `grand_strategy` (keep id, name, short, type, iso2, coords, seat, regions, card, tier,
     last_verified, stale, wikipedia and whatever else the map and pages read: check `app.js` before dropping
     anything else).
   - `stances`: keep per stance only `toward, grade, trend, bond, since, confidence, alignment, stale,
     reciprocal_of, dataset` (whatever `app.js` reads outside the dossier and the tooltip); drop `note`,
     `sources`, `last_verified`, `mirrored_from` from the main JSON.
   - `relations`: drop the rows from the main JSON entirely if nothing outside the dossier and the ledger
     needs them; if a page needs a subset (check `renderClientsPage`, `renderLeversPage`, theatres, issues),
     keep that subset or precompute it in the build. The UN vote rows are the bulk: the votes lens reads
     `unga.affinity`, so check whether the rows themselves are needed anywhere.
   - The bundles stay complete (they are the source for the dossier, the tooltip notes and the ledger). Keep
     them free of a build date (a bundle changes only when its data does).
   - Print the sizes of `data.json` before and after in the build's summary line.
2. **Site** (`docs/app.js`): add a small loader `bundle(id)` that fetches `actors/<id>.json?v=STAMP` once and
   caches it (a Map of promises). Use it:
   - in `renderDossier(id)` (card texts, stances with notes and sources, relations with sources, footnotes);
   - when a point of view is set (`setPov` / the `#/view/<id>` route): fetch the pov's bundle, then render
     the ledger under the map and enable the tooltip notes; until it arrives the map draws from the slim
     stances (grade, trend, bond are there) and the tooltip shows the grade line without the note;
   - everywhere else that reads `stance.note`, `stance.sources`, `relation.sources` or `actor.grand_strategy`
     (grep for them) must either use the bundle or be shown to be unreachable.
   - Every text still passes through `esc()`/`T()` so the Italian lookup keeps working on bundle texts.
3. **Cache**: the bundle request carries the same `?v=STAMP` as `data.json`. The build's cache-busting already
   rewrites the stamp in `index.html`; nothing else to do.
4. **Data page** (`renderDataPage`): the "How it is built" paragraph says one JSON; make it say the main JSON
   plus one bundle per actor fetched on demand, and show the main JSON's size if the build puts it in `stats`.

## Rules
- Do not change `data/`. Do not commit or push (the coordinator does). Keep `python tools/build.py` ending
  with OK.
- Verify in the Browser pane at `http://localhost:8765` (running; reload with a new `?r=` value): home map,
  `#/view/USA` (ledger under the map filled, tooltip with the note after the bundle arrives), `#/dossier/USA`
  (card, footnotes with sources), `#/view/SRB/votes`, `#/seams`, `#/clients`, `#/levers`, `#/watch`,
  `#/data`, and `?lang=it#/dossier/SRB` (Italian texts still appear). Check `read_console_messages` for
  errors and `read_network_requests` for the sizes of `data.json` and one bundle.
- If a page turns out to need something you removed, put it back in the main JSON rather than break the page,
  and say so.

## Report (under 250 words)
Sizes of `data.json` before and after (raw and gzipped: `python -c "import gzip;..."`), what moved to the
bundles, every function changed, what the checks showed, anything left out.
