# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive, public, English-language atlas of how the world's actors (states and
state-like organisations) relate to each other, read through Edward Luttwak's idea of
grand strategy. Working title: **Grand Strategy** (final name undecided; folder and repo
stay `grand-strategy` until Davide picks one).

The owner is Davide (Italian; talk to him in Italian, write the product in English).
The quality bar is "could have come out of a foreign office": every claim sourced,
dated, and graded for confidence. The project is deliberately long; the method matters
more than finishing. Decisions and dead ends go in `JOURNAL.md`, newest first.

## Status

Pilot demo built on 2026-10-12: one full card (Serbia) with 18 stances and 43 relations,
20 stub actors, site live from `docs/`. Next: Davide judges the form, then scalability
(more Balkan cards) or changes to the ontology. Decisions taken on 2026-10-12:

- **Pilot region: Western Balkans** (Serbia, Kosovo, Bosnia-Herzegovina, Montenegro,
  Albania, North Macedonia) plus the outside powers acting there (Russia, EU, USA,
  Turkey, China). The schema must scale to ~200 actors from day one: adding an actor
  must mean adding a file, never changing the site. If the pilot shows the schema does
  not scale, switch to "everything at once" with a minimal card per actor.
- **Actors** include states, decision-making organisations (EU, NATO), armed non-state
  actors (Houthis, Hezbollah, SDF...), and territory-less organisations when they act as
  instruments of a state (BRICS, OPEC, Wagner/Africa Corps, Gazprom, Huawei).
- **Relations** cover all four layers: objectives and disputes (what A wants, whom that
  collides with), formal alignments (treaties, memberships), material dependencies
  (energy, trade, debt, arms, remittances, with numbers), and recent dated actions
  (UN votes, sanctions, visits, exercises).
- **Evidence**: every relation carries a source, a date, `since`, `last_verified` and a
  confidence grade. No unsourced lines, even for the obvious. Stance grades on the map
  ("reluctant ally") are never our judgement: they need a source using that reading.
  But the grade follows the structural position, never diplomatic rhetoric (the
  Albania lesson: motherland of Kosovo cannot be "partner" because Vučić says so).
- **Stances have two axes**: posture today (`grade`, with `trend`) and the standing
  `bond` (kin / affinity / none / grievance). Russia and the US are both "partner"
  and opposite cases; the bond is what tells them apart.
- **No dispute objects**: disputes exist because of grand strategies, so they are
  described through the actors' objectives and stances, never as files of their own.
- **Time**: a snapshot of today. History emerges from git; do not model the past.
- **Theory**: every actor has a grand-strategy card in Luttwak's terms: objectives,
  means, constraints, allies, and the *paradoxes* (where a move turns against its
  author). Luttwak is the lamp for every step, not just the introduction.
- **Main view**: a relation graph (nodes = actors, edges = relations by type).
  **Second view, mandatory**: a world map *from one actor's point of view*. Pick Serbia
  and the whole world colours itself as Belgrade sees it: own territory, claimed
  territory, allies, reluctant allies, neutral/transactional, rivals, enemies.
- **Updates**: on-demand Claude sessions ("update the Balkans", "add Turkey"). Claude
  researches, proposes diffs, Davide approves. Everything versioned in git.
- **Hosting**: GitHub Pages, public repo from the start (account `AndreottiVIII`, like
  `capodanno-28`). Only public sources, so nothing sensitive can enter.

## Working rules

- **Never type a Wikidata id, ISO code or count from memory.** Resolve ids by name
  through the search API and check the label (`data/datasets/wikidata/org-ids.json`);
  Davide caught a map coloured by wrong ids on day one.
- **Usage ceiling (Davide, 2026-10-12): check the weekly plan usage before every agent
  launch (`get_usage`); at 80% of the weekly limit launch nothing more, let the running
  agents finish, keep the queue in `data/queue.yaml` and resume after the reset.** Keep
  six agents running otherwise; models per `data/queue.yaml` (fable / sonnet / haiku).
- **Reuse before researching.** Whatever another card already holds about an actor
  (rows, stances, sources) is the starting evidence for that actor's own card: same
  links, mirrored rows. Davide's rule; see METHOD.md step 2.
- **Method is in METHOD.md** (tiers, region-by-region order, pipeline, protagonist
  list). Read it before researching any actor. Datasets before agents; one agent per
  actor writing YAML directly; economical model for the draft, then the best model
  rereads objectives, paradoxes, reading and stance grades. **That review is
  mandatory, not optional** - Davide asked that it never be skipped. Record tokens
  spent per actor in JOURNAL.md.

- Data lives in plain files (one file per actor, relations as rows with one schema),
  separate from the site code. The site renders data; it never embeds facts.
- Before writing a relation, find the source. If none is found, write nothing and log
  the gap in JOURNAL.md.
- Luttwak's levels and paradoxical logic are the reading grid, but the data stays
  descriptive. Interpretation goes in the grand-strategy card, not in the relation rows.
- Do not expand beyond the pilot region without updating the Status section here.
- Appointments with the user are in Italian; file contents, field names and UI are in
  English.

## Layout

- `JOURNAL.md`: decision log, newest first. Every session that changes a decision adds an entry.
- `ONTOLOGY.md`: the data model (actor, stance, relation, source, confidence grade, and
  the lessons from the pilot). The single most important file; change it only with a
  journal entry.
- `data/actors/<id>.yaml`, `data/stances/<id>.yaml`, `data/relations/<from>.yaml`: the
  truth. One file per actor; stubs (`card: stub`) are nodes without a card.
- `tools/build.py`: validates `data/` and compiles it to `docs/data.json` and to one
  bundle per actor in `docs/actors/<id>.json` (card, stances both ways, relations both
  ways, votes): any future front end can read a state on its own. Refuses to
  write on any error (missing source, unknown id, grade or type outside the vocabulary).
- `docs/`: the static site served by GitHub Pages (`index.html`, `app.js`, `style.css`,
  `world.geojson` from Natural Earth 110m with Kosovo as `XKX`, and the compiled
  `data.json`). D3 7.9 from cdnjs is the only dependency. The home is the world of
  today, every country in its current flag (`iso2.json` maps Natural Earth ids to
  flagcdn codes); clicking a country with a card turns the map into its point of view
  (posture = dot screen, bond = band inside the border). Relations are cards under the
  map, never arrows on it. The dossier has footnoted sources, flag and Wikipedia link. The look is a 1970s three-ink
  print on cold white (green allies, navy partners, vermilion the hostile side; dot
  screens for posture, denser is stronger; Archivo type): keep it that way, no fourth
  colour.

## Commands

```bash
python tools/build.py        # validate data/ and write docs/data.json; exit 1 on errors
```

Preview: the `grand-strategy` entry in `ClaudeTower/.claude/launch.json` serves
`docs/` on port 8765. Always rebuild before committing: `docs/data.json` is committed
because GitHub Pages serves it as-is.

## Adding or updating an actor

After every review: `python tools/reciprocate.py --write` (Davide's rule: a new card's
grades and treaties retroact on the cards already written - Pakistan calling Turkey an
ally puts the reciprocal into Turkey's files, flagged `reciprocal_of`), then build.

1. Research with sources first; never write a row you cannot cite.
2. Create or edit the three files for the actor (stub counterparts if they do not exist).
3. `python tools/build.py`; fix every error it names.
4. Add a JOURNAL entry if a decision or a vocabulary changed; update `last_verified`.
5. Commit and push; Pages redeploys from `docs/` on `main`.

## Update cycle (Davide, 2026-10-16): on call only, never on a calendar

The atlas is updated only when Davide asks for it in chat (his explicit order is the password:
no cron, no scheduled wake-up, no agent launched on a date). When he does, the cycle is:
1. **Floor, free**: regenerate the datasets (UN votes, memberships, recognitions) and rebuild; the
   build's `changes` since the last snapshot say what moved.
2. **Watch dates**: the build warns about `watch` dates that have passed (elections, mandates,
   rulings written in the cards); those cards go first.
3. **Regional scan, Haiku**: one agent per region reads two months of headlines (about 5 searches)
   and lists the cards touched by events, one line each. No writing.
4. **Delta pass**: only the cards listed, Sonnet for protagonists and Haiku for minors: add dated
   rows with sources, move a trend or a grade when a source says so, never rewrite. Mirrors are
   never touched. Review, reciprocate, build, commit, push, as always.
5. **Token cap** fixed by Davide before the cycle starts (default 6M); stop when reached.
Between cycles, single news items go in as one dated row each ("nota alla scheda").
