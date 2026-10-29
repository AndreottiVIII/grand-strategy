# Fix mandate 2 report (2026-10-29)

Fixed (text report): BUG 1 (clubs and recognition legend blocks moved into `renderLegend()`, strings untouched), 2 (privacy and
dependencies), 3 (five), 4 (Hungary between Croatia and Serbia), 5, 6, 7 (click a zone; last sentence deleted), 8 (more than a
quarter), 9 (any state in both NATO and the EU), 10 (Serbia/Kosovo sentences now follow the two paradoxes); INC 12, 13 (cycle:
on call, so far weekly; datasets, GDELT heat and watch dates, Wikipedia current-events pass, hand triage, delta pass), 14 (claimed
territory in the feud definition, three places), 15 (Loyalty), 16 (main file plus bundle per actor), 17 (levers kinds), 18
(THEATRES.length, dependency count from stats), 19 (Luttwak page: generic restatements cut, examples kept), 20 and 21 and 22
(Italian, see below); COSMETIC 27 (stamp "205 cards of 305 actors"), 29 (Data page shows the commit date only), 30, 31, 32, 33, 34.
Site report: COSMETIC 18, 19, INC 9, INC 15 (CLAUDE.md Layout paragraph rewritten). Data report: I16 (README.md created, ten lines),
I19 (Data page now agrees with `data/site.yaml`; the yaml's note said "JOURNAL.md", now "the decision log").

Italian: `texts.json` "Trend" -> "Andamento" (Tendency stays "Tendenza", Faults); the stamp "stance" -> "posture", and the Italian
for the new stamp key added (a543c272); "About" has one Italian rendering, "Info", for the nav group label, the menu item, the page
title and the This-site link. DEVIATION: the glossary said "Il metodo", but the group label, the item and the h2 share one English
key ("About"), so two renderings are impossible without changing the markup; I set the glossary entry to `{it: Info, sub: il metodo}`.
Davide can overrule.

Left: COSMETIC 28 (region slugs in the dossier header, code), 35-39 (cards, forbidden zone: ISR "double-", SRB readings, STANCES notes,
USA "NSS" date), BUG 11 (Italian country names inside Theatres, code), U1-U9 (unverified, need the books). ONTOLOGY.md and
`tools/build.py:439` still say "every NATO member would be pulled between Cyprus and Turkey". I19: the Data page's bond distribution
omits `unknown` (list in code). 

IDEA items, not done:
- I1 "culminating point" stretched to cooling alliances (Currents, About): consider "Allies cooling" / "Rivals warming" as headings.
- I2 DIME domains and "which is why frozen disputes" put in Luttwak's mouth (Luttwak page).
- I3 biography block on a living reader: consider cutting the residence and the honour paragraph after he has seen the site.

Strings changed or added: 30 English (list in `fix-text-changed.md`), 4 Italian lines touched in `texts.json`, 1 glossary line.
`python tools/build.py` ends OK. app.js parses (checked in the browser with `new Function`).
