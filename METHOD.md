# Method: how the world gets built

Agreed with Davide on 2026-10-12, after the Serbia pilot cost about 650,000 tokens of
research. Quality is the constraint, not cost; but the Serbia way (four prose reports,
rewritten by hand) is not the way. This file is the working method; ONTOLOGY.md is
what the data is; JOURNAL.md is why.

## Three tiers of card

| tier | roughly | what the card holds |
|---|---|---|
| **protagonist** | ~60 | the full Serbia card: ranked objectives, means by domain, constraints, paradoxes, reading; stances toward everyone that matters; all four relation layers |
| **secondary** | ~50 | objectives, 6-8 stances, dependencies and actions from the datasets plus the 5-6 events that define it, one or two paradoxes, short reading |
| **minor** | ~90 | three sourced objectives, 4-6 stances (neighbours and patron), dependencies and votes from the datasets, a paradox if one is obvious. No reading |

Tier is a field on the actor (`tier: protagonist | secondary | minor`). Davide proposes
corrections to the list; the list lives at the end of this file.

## Order: region by region

The Western Balkans close first, with every intersection drawn, then the next region.
The site is always coherent where it exists. Proposed sequence after the Balkans:
Eastern Europe and the Black Sea (Ukraine, Russia, Moldova, Caucasus), then the Middle
East, then the great powers, then the rest. Davide decides when a region is done.

## Pipeline for one actor

1. **Datasets first, zero tokens.** `tools/datasets/` scripts import, for every actor
   at once, rows of tier 1 with source and date: UN General Assembly votes, trade
   shares (Comtrade/WITS), arms transfers (SIPRI), remittances and debt (World Bank,
   IMF), memberships and treaties (official lists), foreign troops (NATO, UN). They
   enter on their own, no human reading, flagged `source: dataset` in the row.
2. **Mirror what exists.** Every relation already written from another actor toward
   this one is reused; a treaty is one row for both sides. Stances are never mirrored,
   evidence is.
3. **One research agent, a fixed brief.** Per region a starting dossier is fixed
   (Commission or State Department country report, the Wikipedia "foreign relations"
   page as an index, 3-4 think-tank country pages, the national security strategy if
   public). The agent reads text, not HTML, and **writes the three YAML files
   directly** in the ontology's schema. No prose report in between.
4. **Cheap first, best second - and the second step is mandatory.** Extraction,
   stances and the first draft go to the economical model. The best model then
   rereads objectives, paradoxes and reading, and the stance grades against the
   structural rule (ONTOLOGY.md). A card is not done until the review has run; the
   journal entry for the actor says so. Davide reads cards at his own choosing and
   flags what is wrong.
5. **Build, warnings, journal.** `python tools/build.py`; every structural warning gets
   an answer in a note or a changed grade; a journal entry records cost (tokens),
   gaps and dead ends.

Target cost: protagonist ~150k tokens, secondary ~70k, minor ~30k. Measured on Kosovo
before being believed.

## Sources in other languages

Yes. An official document in Serbian outranks an English article summarising it. The
source entry carries the original title and a translation (`title_original`, `title`),
and the language (`lang`). Tier rules unchanged.

## Updating

Never re-research from scratch. A periodic scan (economical model) over the existing
actors' news proposes new rows and changed stances; a session decides. `last_verified`
is bumped only when a human or the best model has actually re-read the row's source.

## Protagonists - proposed list (Davide corrects)

Western Balkans: Serbia, Kosovo, Bosnia and Herzegovina, Croatia, Albania, Montenegro,
North Macedonia (the pilot gets full cards everywhere, it is the test bed).
Europe: EU, NATO, Germany, France, United Kingdom, Italy, Poland, Hungary, Turkey, Greece.
Eastern Europe and Caucasus: Russia, Ukraine, Belarus, Moldova, Armenia, Azerbaijan, Georgia.
Middle East: Israel, Iran, Saudi Arabia, UAE, Qatar, Egypt, Iraq, Syria, Lebanon,
Jordan, Yemen (and the Houthis), Hezbollah, Hamas, the Palestinian Authority, Kurdish
SDF.
Asia: China, India, Pakistan, Japan, South Korea, North Korea, Taiwan, Indonesia,
Vietnam, Philippines, Australia, Afghanistan (Taliban).
Africa: Ethiopia, Egypt (above), Nigeria, South Africa, Algeria, Morocco, Sudan (SAF
and RSF), Libya (both governments), Rwanda, DR Congo, the Sahel juntas as one bloc.
Americas: United States, Canada, Mexico, Brazil, Venezuela, Cuba, Argentina, Colombia.
Organisations and instruments: BRICS, Wagner/Africa Corps, Gazprom and NIS-type
state firms when they act as instruments; OPEC.

That is about 75 names; some will drop to secondary once we look at them.
