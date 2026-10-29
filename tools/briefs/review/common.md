# Review 2026-10-29: common rules for the three reviewers

Repository: `C:/Users/davide/Desktop/ClaudeTower/grand-strategy` (read `CLAUDE.md` first, then `ONTOLOGY.md`
for the vocabulary). The atlas is about to be shown to Edward Luttwak and moved to the owner's own domain:
this is a **bug hunt and a last look**, not a redesign. Today is 2026-10-29.

- **Report, do not fix.** Touch nothing in `data/`, `docs/`, `tools/*.py`. The only file you write is your
  report. No commit, no push. `python tools/build.py` is allowed only to confirm it ends with OK (it rewrites
  `docs/data.json` identically, which is fine).
- **Write the report as you go**, not at the end: create it after your first finding and rewrite it with the
  Write tool every few findings, so nothing is lost if the session is interrupted.
- Each finding: a severity (`BUG` = wrong behaviour or wrong fact the reader can see; `INCONSISTENCY` = two
  places disagree; `COSMETIC` = looks wrong but harmless; `IDEA` = not a defect, at most three of these),
  `file:line` or the page and the steps to see it, what is wrong, what you would change (one line). Verify
  every BUG before writing it: reproduce it or point at the exact line that causes it; a suspicion you could
  not confirm goes in a final "unverified" list, not among the findings.
- Order the findings by severity. Under 60 findings; if you find more, keep the worst.
- End with a line "Context left when stopped: <percent>" and, in the final message to the coordinator, a
  summary under 150 words: how many of each severity, the three worst, what you did not get to.
- Budget: stop and finish the report when your own context passes 85%.
