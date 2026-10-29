# Fix mandate 1: the site code (2026-10-29)

Repository `C:/Users/davide/Desktop/ClaudeTower/grand-strategy`; read `CLAUDE.md` first. Three reviewers wrote their
findings in `tools/briefs/review/site-2026-10-29.md` (site), `data-2026-10-29.md` (data) and `text-2026-10-29.md` (text).
Davide approved the fixes. You fix the **code and dataset** items listed below; another agent fixes the English texts
in `docs/app.js` at the same time (About, Luttwak, This site, method paragraphs): **you never rewrite prose**, and you
make every edit to `docs/app.js` as a small targeted Edit after re-reading the exact lines; if an Edit fails because
the file changed, re-read and retry. A third agent only writes proposals, never files.

Do not commit or push. Keep the look (NORAD vector screen, no new colour, no new dependency). Keep every change minimal.

## Site report (`site-2026-10-29.md`)
- BUG 1 portrait: use a thumbnail size Wikimedia serves (500px works) in `app.js` (both `:1104` and `:667` if the same file).
- BUG 2 Palestine and territories: an alias map applied once to `world.features` ids at load (`PSX->PSE`, `GRL->sub-greenland`,
  `SAH->sub-western-sahara`, `FLK->sub-falklands`, `NCL->sub-new-caledonia`, `SOL->sub-somaliland`), checking each target
  exists in `data/actors`; the own territory of PSE must light in `#/view/PSE`. Also covers data report I18.
- BUG 3 notes cut mid-word (`tools/build.py:524`): split only at a point followed by a space and a capital letter or quote,
  and cut at the last word boundary before 220 with an ellipsis.
- BUG 4 and 5 mobile: Watch tables scrollable horizontally inside their own container (the page keeps `overflow-x: hidden`),
  and the scroll reset must work when `body` is the scroll container (reset both `window` and `document.body`/`documentElement`).
- BUG 6 is data (another agent). Skip.
- INC 7 Italian coverage: extend `UI_SEL` so the strings in `div`, `td`, `span` of the templates get translated (prefer the
  specific classes the reviewer names plus `td`, `.hd`, `.row`, and whatever else you find untranslated when you test
  `?lang=it` on Gatherings, Theatres, a dossier, Seams, Watch, Data, This site, Luttwak). The neighbour sentence of Gatherings
  must get a key that does not depend on the list of names (wrap the list in an element the tokeniser replaces, as `⟨a⟩` does
  for actor names, or split the sentence from the list). Set `document.documentElement.lang` on language switch (also data C1).
  Text report BUG 11 (English country names inside Italian phrases on Theatres, `app.js:39-43`) belongs here too.
- INC 8: add `DNK: Danimarca` and `sub-greenland: Groenlandia` to `data/i18n/it/names.json` (check the other `sub-*` have names).
- INC 11 = data B5 (snapshot of the same day): fix in `tools/build.py` as the data report says.
- INC 12 Burning: only countries with conflict ratio >= 1.0 enter the burning table (Watch and the heat lens), keep the rank.
- INC 13: numbers in the `#meta` stamp with `toLocaleString("en-GB")`; leave "in construction" as it is.
- INC 14: Data tiles say "hedging pairs" and "buffer pairs".
- INC 17: `${THEATRES.length}` instead of "Seventeen" (the English agent knows; you do the code side only if it is a template
  expression; coordinate by leaving the sentence and replacing just the number).
- COSMETIC 20 (`decodeURIComponent` throws on a bad hash: try/catch, fall back to home), 21 (do not print an empty domain
  sub-heading under MEANS), 22 (Fiji and any polygon crossing the antimeridian: compute the frame from the seat point with a
  fixed radius when the bounds span more than half the map), 23 (POV select label: use the short name or truncate with an
  ellipsis), 25 (home sidebar list sorted by name), 26 (possessive helper: "United States'" for names ending in s; raw ids
  replaced by names where the reviewer saw them), 28 (a dossier opened from a reading page: the POV select and the "Situation
  map" tab point at that actor).

## Data report (`data-2026-10-29.md`)
- B1 and B2 (`paragraphs` in `app.js`): translate the whole reading first (`T()` on the block), then split into sentences
  only at `.!?` followed by whitespace and a capital letter or an opening quote, never inside a number; keep the three-
  sentences-per-paragraph form. Check `?lang=it#/dossier/SRB` shows the Italian reading and `#/dossier/BRA` shows "51.8%".
- B3 organisations at [0,0]: give the 35 `org-*` stubs their seat. Do it with a script against the Wikidata API (P159
  headquarters location -> P625 coordinates, or P625 on the item itself), ids taken from `data/datasets/wikidata/org-ids.json`,
  never typed; write `coords` and `seat` (city name) into the files keeping their YAML style; for any org without a result,
  skip drawing at `app.js:502` when coords are [0,0]. Report the list with the seats found.
- B4 nine wrong `wikipedia` ids: write the ids from `org-ids.json` into the nine files; I7 (32 actors link Wikidata under the
  label "Wikipedia"): resolve the English Wikipedia sitelink through the API for those 32 and write the article URL, or label
  the link "Wikidata" where no article exists.
- B5 snapshot: as above.
- I2 determinism: sort every set/dict iteration that reaches the output (the 41 files must stop changing on a rebuild: run
  the build twice and `git status` must be clean the second time, apart from the files you really changed).
- I3 Denmark: find why DNK is missing from the Wikidata states file and from borders/weight; regenerate what is needed
  (`tools/datasets/borders.py`, `worldbank.py`, `wikidata.py`, as CLAUDE.md lists) so DNK has borders and weight.
- I4 watch dates: implement the warning in `tools/build.py` (a `watch` date in a card that is earlier than today prints a
  warning naming the card), since CLAUDE.md promises it.
- I5 GDELT: fix the Timor-Leste code mapping and the five missing states if the fix is a code table; make a failed run leave
  the previous `heat.json` in place.
- I6 Data page dates: show the dataset's own fetched date (the `fetched`/`source` field each dataset writes), not file times.
- I15 two design mock-ups at the site root: name them in your report; delete them from `docs/` only if nothing references
  them (`grep` the repo).
- C6: remove the stray `XKS` key handling and the unused `ISO3_FIX` only if it is dead code; otherwise leave.
- I1 (`reciprocate.py` vs build on 57 NATO/EU stances): **do not change data**. Read both rules, explain the discrepancy in
  your report in five lines (which rule is right by `ONTOLOGY.md`, what each side writes), and propose the fix; Davide decides.

## Then
1. `python tools/build.py` ends with OK; run it twice (determinism).
2. Verify in the browser pane (`preview_start {name: "grand-strategy"}`, reload with a fresh `?r=`): home map hover on
   Palestine, `#/view/PSE`, `#/view/KWT` (no squares in the Gulf of Guinea), a Data-only country with the Clubs lens
   (hover must not throw: the tooltip bug is fixed by the text agent moving the legend code; if it is still broken when you
   test, fix it yourself: the two `el.innerHTML` blocks in `tipBuild` belong in `renderLegend`), `#/dossier/BRA`,
   `?lang=it#/dossier/SRB`, `?lang=it#/gatherings`, `?lang=it#/theatres`, `#/watch` desktop and mobile preset, Currents.
   `read_console_messages` clean on every page. Back to `preset: desktop`.
3. Collect the site-string keys for the translation pass: in English mode, on every page (home, a dossier, a POV, the nine
   reading pages, Luttwak, About, Data, This site) run `window.__i18nKeys()` and save the union the way the journal entry of
   2026-10-22 describes (`data/i18n/it/ui-keys.json`); then `python tools/i18n.py status --lang=it` and report the number of
   untranslated site strings. Do not translate.
4. Report under 250 words: what you fixed (by item number), what you could not, the org seats found, the I1 explanation,
   the untranslated count. Write the report to `tools/briefs/review/fix-code-report.md` as you go (Write tool, every few
   items), so nothing is lost if interrupted.
