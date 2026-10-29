# Mandate: apply the approved card corrections (2026-10-29)

Repository `C:/Users/davide/Desktop/ClaudeTower/grand-strategy`; read `CLAUDE.md` first. Davide approved every item
of `tools/briefs/review/cards-prima-dopo.md` except item 15 (nothing to write) and item 24 (decided separately:
do not touch `sub-western-sahara`). Apply the DOPO texts **exactly as written in the document**, file by file,
keeping each file's YAML style (quoting, indentation, key order), and set `last_verified: 2026-10-29` on every
stance or row whose text you change. Never change a grade, trend, bond or confidence except where the document
says so (items 17 and 18). Add the sources the document names where it names them.

Work in this order and keep a running log in `tools/briefs/review/apply-cards-report.md` (Write tool, rewritten
after every few items), so an interruption loses nothing:
1. Items 1-5 (USA, RUS, CHN, LCA texts).
2. Items 6-12: the mechanical note edits across many files (write a script in your scratchpad, run it with
   `python -I`, print a count per item; for item 12 rewrite "Mirror of the X card ..." into the plain sentence the
   document gives, and check that no sentence is left starting with a lowercase letter or a dangling colon).
3. Items 13, 19-23 (dates, PER->CHN, tiers, publisher spellings, URL comma and the title typo, units).
4. Item 14 (LCA: the two stances the document writes out, in a new `data/stances/LCA.yaml` with the file style of a
   small card such as `data/stances/VCT.yaml` or `DMA.yaml`).
5. Items 16-18 (the two grade changes with the rewritten notes; item 16 only where the document proposes a change).
6. Items 25-27 (GRC, HTI, nsa-houthis).
7. The 57 treaty stances: `tools/briefs/review/fix-code-report.md` (section I1) explains that `tools/reciprocate.py
   --write` mirrors a stance as "partner" between co-members of NATO, EU or CSTO, where `ONTOLOGY.md` makes the treaty
   floor "ally" and the build already derives it. Fix `reciprocate.py` so it skips a pair that shares such a treaty
   membership (use the memberships dataset the build uses, see `tools/build.py`), then find the written stances it had
   created for such pairs (they carry `reciprocal_of` or `dataset: reciprocal` and grade `partner`; count them with a
   script before deleting, the expected number is 57; if you find a different number, stop and report instead of
   deleting) and delete those stance entries. Then run `python tools/reciprocate.py --write` and check it creates none
   of them again.
8. `python tools/build.py` must end with OK; fix every error it names on the files you touched.
9. The changed card texts (readings and card items of USA, RUS, CHN and any other `data/actors` text you changed)
   need Italian: run `python tools/i18n.py extract --lang=it --kinds=cards --batch=60000`, translate the batch(es)
   yourself in the register of a foreign-office brief (read `data/i18n/glossary-it.yaml` and ten entries of
   `data/i18n/it/texts.json` first), writing `<batch>.out1.yaml` with the Write tool (`lang: it` / `items:` of
   `- hash:` / `it: "..."`). **Do not run `i18n.py merge`**: another agent is merging the site strings at the same
   time; the coordinator merges at the end.
10. Report under 200 words: items applied with counts, the 57 (or the number found), build result, batches written,
    anything skipped and why.

Do not commit or push. Never touch `docs/app.js`, `docs/style.css`, `docs/index.html`.
