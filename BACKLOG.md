# Backlog

## Fixes to run at the end of the world pass
- 2026-10-12 · **Reverse mirroring pass.** Agents mirror what others hold INTO their own card,
  never back. So a later card can hold a fact the earlier one lacks: North Korea sent
  troops to fight Ukraine (Kursk, 2024-25) and Ukraine's card has no PRK stance or row.
  After each region (and at the very end) run a pass: for every actor, list the rows and
  stances other cards hold toward it that have no counterpart, and add the counterpart
  with the same sources. Known cases: UKR ← PRK troops; UKR ← IRN drones; UKR ← CHN
  dual-use trade.

Ideas and deferred steps, with the date they were parked. Davide: "keep them in mind,
like every improving idea that comes to you".

- 2026-10-13 · **Thin minor cards to thicken later**: Solomon Islands (6 stances, 11 rows; no UK, Japan, EU stance), Eritrea (6 stances, 9 rows, one paradox; no US, Israel, Saudi, Somalia stance), Tonga (6 stances, 9 rows), South Sudan (6 stances, 9 rows, one paradox), Mauritania (2 stances, 4 rows), Laos (4 stances, 6 rows: the shared search budget ran out with twenty agents in parallel), Bahrain has no stance toward Saudi Arabia (its patron since 2011) or the UK base; the Haiku budget ran out. Revisit with the Gulf reverse pass.
- 2026-10-16 · **One-sided readings review** (Davide): before the atlas is shown as complete, list every pair where one side is hand-written and the other holds only a provisional reciprocal or nothing, and review them with him. Tool ready: `python tools/onesided.py` (toward full cards first).
- 2026-10-14 · **Derived treaty allies are not real allies** (Davide, looking at Kazakhstan -> Armenia/Belarus "Treaty ally: both members of CSTO"): the dataset floor grades co-members of NATO/EU/CSTO "ally" and paints them green like a written ally. Options: a separate grade `treaty_ally` shown paler, or a lower weight for derived stances in every computed page (seams already ignore them; theatres and gatherings count them). CSTO is the worst case (Armenia frozen, Kazakhstan hedging).
- 2026-10-13 · **Great-state autism index** (Luttwak on China): per big actor, the share of counterparts
  that grade it hostile or cooling while it grades them partner or ally. Zero research; best once
  USA, CHN, RUS are written.
- 2026-10-13 · **Byzantine index** (attrition vs relational manoeuvre): per actor, the mix of instruments
  in its relation rows - military actions against agreements, money and dependencies created.
- 2026-10-13 · **Paradox taxonomy**: classify every card's paradoxes by type (the patron that costs, the
  deterrence that provokes, the sanction that hits the sanctioner, enlargement that paralyses, the
  victory that summons the coalition) with one reading agent; count which recur where.
- 2026-10-13 · **Seams on the map**: dashed outline built, switched off (`SEAMS_ON_MAP`) until Davide approves.
- 2026-10-13 · **Colophon contact**: still "to be added".
- 2026-10-13 · **An `aid` dependency type**: grants and development aid have no type in the relation vocabulary, so Bhutan, Nepal and others record them as `agreement` actions. Decide with a JOURNAL entry and an ONTOLOGY change.
- 2026-10-12 · **Territorial claims from Wikidata** (P1336 "territory claimed by"): hatched
  "claimed" territories for every claimant (Taiwan for China, Crimea, Kashmir, Golan,
  Falklands, Essequibo, Western Sahara...). Zero tokens, one script.
- 2026-10-12 · **Dependency datasets**: World Bank remittances and bilateral matrix,
  WITS/Comtrade trade-partner shares, SIPRI arms transfers, IMF debt. Would give a
  fourth lens, "who depends on whom", for every state without an agent.
- 2026-10-12 · **Wikipedia bilateral-pages index**: list every "X–Y relations" page with
  its size as a salience index of pairs and a reading list for agents.
- 2026-10-12 · **Organisation seats on the map**: orgs have coords 0,0; give each its
  seat so EU/NATO/BRICS appear as squares where they sit.
- 2026-10-12 · **Memberships Wikidata covers badly** (CELAC, SAARC, EAC, PIF, ICC, NAM):
  hand-kept lists or Wikipedia categories, as done for GCC/CEFTA/Sahel.
- 2026-10-12 · **Labels for small countries** at low zoom (leader lines).
- 2026-10-12 · **Dossier length**: collapsible sections or a layer filter at scale.
- 2026-10-12 · **Source spot-check**: a dozen URLs per card opened by a human before the
  site is shown to anyone outside.
- 2026-10-12 · **Periodic update scan**: a cheap-model pass over news for existing
  actors proposing new rows; never re-research from scratch.
- 2026-10-12 · **Circular board** of relations at scale (actors grouped by region).
- 2026-10-12 · **Non-state actors beyond the first eight** (Wagner/Africa Corps, PKK,
  Polisario, Somaliland, Houthis' rivals...), and state instruments (Gazprom, Huawei).

- **Eastern Libya as an actor.** The Libya card (16/10) treats the Haftar authority inside objectives and actions only; the GNU's main rival is therefore invisible on the map. Consider a sub-state actor (like sub-rs, sub-somaliland) once the unification talks settle.

- **Dataset recognition rows to check**: KIR -> XKX (Kiribati recognising Kosovo since 2010 rests on one image URL; the Kiribati foreign-relations page does not list it), TON -> XKX (2014 citation unchecked).

- **EAC membership dataset gap**: the Wikidata memberships hold only Rwanda for org-eac; Tanzania's card added its own row by hand. Check the other EAC members (KEN, UGA, BDI, SSD, COD, SOM) and fix the generator or memberships-manual.yaml.
