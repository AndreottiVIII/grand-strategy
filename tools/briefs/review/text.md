# Reviewer 3: the English the reader will see

Read `tools/briefs/review/common.md` first. Your report: `tools/briefs/review/text-2026-10-29.md`.
Edward Luttwak will read this site. You check the English and the facts of the texts that every visitor sees,
not the 200 cards.

1. Site texts in `docs/app.js` and `docs/index.html`: the method paragraphs of every computed page (Seams,
   Hedging, Buffers, Clients, Faults, Gatherings, Encirclement, Currents, Theatres, Flanks, Levers, Watch),
   the Luttwak page, the About page, the Data page, This site, the map legend and tooltips, the nav labels
   and subtitles. Look for: typos, broken grammar, a sentence that no longer matches what the page shows
   (for instance a paragraph describing a column or a block that was removed, or a count written by hand),
   British/American spelling mixed in one page, a Luttwak term used wrongly (check against his *Strategy:
   The Logic of War and Peace* and *The Grand Strategy of the Byzantine Empire* as you know them), claims
   about the method that the code does not do (compare with `tools/build.py` when a paragraph says "the
   atlas computes ..."), the tagline, the colophon (the owner's name and email are intended; check they
   appear once and correctly).
2. The five protagonist cards as the dossier shows them: `data/actors/USA.yaml`, `CHN.yaml`, `RUS.yaml`,
   `ISR.yaml`, `SRB.yaml` (the pilot): objectives, means, constraints, paradoxes, reading. Typos, dates that
   contradict each other inside the card, a reading paragraph that contradicts a stance of the same actor in
   `data/stances/<ID>.yaml`, a source quoted for a claim it cannot support (judge from title and publisher
   only; no web calls), anything that would make a professional wince.
3. The Luttwak page and the About page as a whole: do they explain the method in a way he would recognise
   as his (paradoxical logic, the levels of strategy, the coming together of allies against a rising power,
   the culminating point of success)? Where they stretch his terms, say so as an IDEA, at most three.
4. The Italian glossary `data/i18n/glossary-it.yaml` and the site strings in `data/i18n/it/texts.json` for
   the nav and page titles only (search by the English): wrong Italian, English left, inconsistent
   rendering of the same term.

No web calls. Quote the offending sentence in every finding (short), with the file and line.
