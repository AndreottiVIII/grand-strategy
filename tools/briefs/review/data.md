# Reviewer 2: build, tools and data consistency

Read `tools/briefs/review/common.md` first. Your report: `tools/briefs/review/data-2026-10-29.md`.
Work with small Python scripts in your scratchpad directory (never in the repo), run with `python -I`.

1. `python tools/build.py` must end with OK; note every warning it prints (watch dates passed, provisional
   mirrors, anything) as findings if they look wrong.
2. Data consistency across `data/actors`, `data/stances`, `data/relations` (one script, all files):
   - any date in the future (`since`, `last_verified`, source `date`, `watch`), any `last_verified` older
     than the newest source date of the same item, any `since` after `last_verified`;
   - sources missing `url`, `title`, `publisher`, `date` or `tier`; tiers outside the vocabulary; urls that
     are obviously broken (no scheme, spaces, trailing punctuation);
   - stances: grade/trend/bond/confidence outside ONTOLOGY vocabularies; a stance toward an id that has no
     actor file; `reciprocal_of` pointing to a stance that no longer exists; duplicate stance for the same
     counterpart; a note that contradicts its grade in an obvious way (the note says "ally" or "enemy" while
     the grade is the opposite: list, do not judge);
   - relations: duplicate rows (same from, to, type, since), `to` ids with no actor file, rows whose `from`
     does not match the file name, type outside the vocabulary;
   - actors: ids vs file names, `card: full` cards missing objectives/means/constraints/paradoxes/reading,
     `wikidata` ids duplicated across actors, neighbours (from the borders dataset) with no stance on a full
     card (count per card, list the ten worst);
   - A says "ally" and B says "rival" or "enemy" about A (asymmetric readings of two full cards): list them,
     they may be right, but Davide wants to see them.
3. `docs/data.json` and `docs/actors/*.json`: one bundle per actor, no bundle for a missing actor, the slim
   `data.json` carries no card texts/notes/sources (check sizes), the `?v=` stamp in `docs/index.html` matches
   what the build wrote, nothing in `docs/` that the build does not produce and the site does not use (list
   stray files).
4. `python tools/i18n.py status --lang=it` (read only) and a script over `data/i18n/it/texts.json`: translations
   whose placeholder counts (⟨n⟩, ⟨a⟩, ⟨h⟩) differ from the English, translations identical to the English,
   translations containing obvious English leftovers (a sentence wholly in English inside an Italian one),
   names.json entries that are empty or equal to the English where a translation exists in the glossary.
5. `tools/inbox.py`, `tools/reciprocate.py`, `tools/i18n.py`, `tools/datasets/*.py`: a static read for
   crashes on edge cases (empty files, missing keys, an actor with no relations file), and whether
   `.gitignore` keeps the GDELT raw zips and caches out of git (`git status --short`, `git ls-files | grep -i gdelt`).
6. `data/site.yaml` vs the Data page texts in `docs/app.js` (token total, dates): do they agree?
7. Repo hygiene: files larger than 5 MB tracked by git (`git ls-files` + sizes), untracked files, the README
   (does it exist, does it say what the site is and where it is).
