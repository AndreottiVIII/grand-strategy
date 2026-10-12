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

Phase 0: no site yet. Decisions taken on 2026-10-12 (see JOURNAL.md):

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
- `docs/ONTOLOGY.md`: the data model (what an actor, a relation, a source, a confidence grade is). The single most important file; change it only with a journal entry.
- `data/`: actor files and relation tables (not created yet; format chosen in ONTOLOGY.md).
- `site/`: static site for GitHub Pages (not created yet).

## Commands

None yet. The site will be static HTML/JS served from `site/`; build and validation
commands will be added here once the data format is fixed.
