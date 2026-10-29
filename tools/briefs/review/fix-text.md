# Fix mandate 2: the English the reader sees (2026-10-29)

Repository `C:/Users/davide/Desktop/ClaudeTower/grand-strategy`; read `CLAUDE.md` first. Reviewers' findings are in
`tools/briefs/review/text-2026-10-29.md` (text), `site-2026-10-29.md` (site) and `data-2026-10-29.md` (data). Davide approved
the fixes. You fix the **site texts**: the English paragraphs in `docs/app.js` (About, Luttwak, This site, Data, the
method paragraphs of the computed pages, table headers), `CLAUDE.md`, `README.md`, and the Italian for the nav terms in
`data/i18n/glossary-it.yaml` and `data/i18n/it/texts.json`. Another agent fixes the code in `docs/app.js` at the same time:
**you never touch logic**, only strings and prose; make every edit to `docs/app.js` a small targeted Edit after re-reading
the exact lines, and if an Edit fails because the file changed, re-read and retry. Never touch `data/actors`, `data/stances`,
`data/relations`.

The site will be read by Edward Luttwak. Keep the voice of the pages (short, declarative, British spelling, his vocabulary
used precisely); change the minimum that makes each sentence true. Do not commit or push.

## Text report, fix these
- BUG 1: move the two legend blocks (`el.innerHTML` for "Organisations shared with ..." and "Who recognises ...") out of
  `tipBuild()` into `renderLegend()` as branches for `lens === "clubs"` and `lens === "recognition"`, so the real tooltip
  branches below them run. This is the one code move you make; keep the strings as they are.
- BUG 2 (This site privacy and dependencies), 3 (threshold five), 4 (replace the Italy seam with a real one from
  `docs/data.json`), 5 (delete the clause about the map marking seams), 6 (tepid ally answered "reluctant ally"),
  7 (Theatres instructions: "click a zone"; delete the last sentence), 8 (Watch: the United States figure, say "more than a
  quarter" or drop it), 9 (Seams: the Cyprus sentence), 10 (Luttwak page: rewrite the Serbia and Kosovo sentences so they
  say what the cards say; read `data/actors/SRB.yaml` and `XKX.yaml` paradoxes first).
- INC 12-22: update cycle wording (on call, weekly when called; describe the cycle as CLAUDE.md now has it: datasets, GDELT
  heat, portal pass, triage, delta pass on the cards an event touched), Faults method (add the claimed-territory feud as
  the build has it), Clients last header "Loyalty", This site vs Data on the payload (the main file plus one bundle per
  actor on demand), Levers kinds (list what the page shows), counts typed by hand (use the build's numbers through the
  template where a variable exists; otherwise soften to "about"), Luttwak page said twice (keep the better one), Italian
  "About" (choose one rendering: Davide's glossary says page names stay English in the nav, "Info" for the group label was
  his choice; make the title and the This-site link agree with the glossary), "trend" one rendering, "stance" in the stamp.
- COSMETIC (the 13 in the text report) where the fix is a string.
- IDEA items: do nothing; list them in your report in one line each.

## Site report, fix these
- COSMETIC 18: "he has not seen it" must stay true after he sees it: say that it is not his work and was built without
  his involvement. COSMETIC 19 (Clients header, same as above). INC 9 (About three -> five, same as above).
- INC 15: rewrite the Layout paragraph of `CLAUDE.md` so it describes the site as it is (NORAD vector screen, VT323 /
  Share Tech Mono / IBM Plex Mono from Google Fonts, D3 from cdnjs, slim `data.json` plus per-actor bundles, three-entry
  nav); keep everything else in CLAUDE.md.

## Data report
- I16 repository front door: make `README.md` say in ten lines what the site is, where it is, how the data is laid out,
  how to build, and that method and decisions are in `ONTOLOGY.md` and `JOURNAL.md` (create it if missing; keep it if it
  already says this).
- I19 site figures vs `data/site.yaml`: make the Data page and `site.yaml` agree (the yaml is the truth).

## Translation discipline
Every English string you change gets a new fingerprint and loses its Italian until the daily pass. Keep a list of every
string you changed or added (the full English text) in `tools/briefs/review/fix-text-changed.md`, so the translation pass
knows what to translate; do not translate them yourself, except the nav-term fixes asked above in `texts.json`.

## Then
`python tools/build.py` must end with OK (it does not read app.js, but run it). Open the site in the browser pane only if
the code agent has not got it open; otherwise check your pages by reading `docs/app.js`. Report under 200 words: items
fixed by number, items left, the IDEA list, the number of strings changed. Write the report to
`tools/briefs/review/fix-text-report.md` as you go.
