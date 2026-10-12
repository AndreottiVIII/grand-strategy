# Ontology (draft 2, 2026-10-12)

What the data is made of. Change this only with a JOURNAL entry. `?` marks the points
still open; everything else was agreed with Davide on 2026-10-12. Draft 2 adds what
the Serbia pilot taught (see "Lessons from the pilot" at the end).

## Design constraints

1. Adding an actor = adding files. No site change, no schema change.
2. Every row has a source, a date and a confidence grade. A row without a source does not exist.
3. Data is descriptive; interpretation lives in the grand-strategy card.
4. Relations are **directed**: what Serbia holds toward Kosovo is a different row from
   what Kosovo holds toward Serbia. The graph can still draw them as one edge.

## Actor

One file: `data/actors/<id>.yaml`.

```yaml
id: SRB                     # ISO 3166-1 alpha-3 for states (XKX Kosovo); org-nato, nsa-houthis, inst-gazprom, sub-rs for the rest
name: Serbia
type: state                 # state | org | armed-non-state | state-instrument | sub-state
seat: Belgrade
regions: [western-balkans]  # an actor can be in several (Turkey: balkans, middle-east, caucasus)
card: full                  # full = has a grand-strategy card; stub = exists only as a node others relate to
last_verified: 2026-10-12   # full cards only
recognition:                # only where it matters (Kosovo, Taiwan, Palestine, SADR...)
  note: ...
  source: ...

grand_strategy:             # the Luttwak card; each bullet carries a source
  objectives:               # ranked, what the actor wants
    - text: Prevent Kosovo's consolidation as a recognised state
      rank: 1
      sources: [...]
  means:                    # DIME: diplomatic, informational, military, economic
    - ...
  constraints:              # what it cannot do, and why
    - ...
  paradoxes:                # Luttwak: where the actor's own moves work against it
    - text: Blocking Kosovo keeps Serbia dependent on Russia, which weakens the EU path it also wants
      sources: [...]
  reading: |                # short interpretive note, the only free prose in the data
    ...
```

## Stance (the per-actor map)

How actor A grades every other actor and territory, as A sees it. One file:
`data/stances/<id>.yaml`. This feeds the "world as Belgrade sees it" map.

```yaml
actor: SRB
stances:
  - toward: XKX
    grade: claimed_territory
    trend: stable             # warming | stable | cooling - the direction, since two "partners" can be moving opposite ways
    since: 2008-02-17
    last_verified: 2026-10-12
    confidence: A
    sources: [...]
  - toward: RUS
    grade: ally
    ...
  - toward: org-eu
    grade: reluctant_partner
    ...
```

Grades (nine, agreed):

| grade | meaning |
|---|---|
| `own_territory` | controlled and claimed |
| `claimed_territory` | claimed, not controlled |
| `ally` | treaty or stable de facto alignment |
| `reluctant_ally` | aligned by necessity, with visible friction |
| `partner` | transactional cooperation, no alignment |
| `reluctant_partner` | cooperates out of necessity while resisting alignment (Serbia toward the EU) |
| `neutral` | no significant posture |
| `rival` | competing interests, below hostility |
| `adversary` | open hostility or declared threat |

Actors not listed default to `neutral` on the map, drawn in grey.

**A grade is never our own judgement.** Every stance must cite at least one source
that uses that reading (an analysis calling the relationship "reluctant", a treaty for
"ally", a government statement for "adversary"). If no source says it, the stance is
not recorded and the gap goes in JOURNAL.md. This is slower; it was chosen knowingly.

## Relation

Directed rows, one file per source actor: `data/relations/<from>.yaml`.

```yaml
from: SRB
relations:
  - to: XKX
    layer: objective          # objective | alignment | dependency | action
    type: territorial_claim   # vocabulary per layer, see below
    summary: Serbia does not recognise Kosovo and treats it as its province under UNSCR 1244
    since: 2008-02-17
    until: null
    last_verified: 2026-10-12
    confidence: A
    sources:
      - url: ...
        title: ...
        publisher: ...
        date: ...
        tier: 1
```

Type vocabulary (?: to grow with the pilot, but never freely):

- `objective`: territorial_claim, recognition_sought, recognition_denied, regime_goal, influence_goal, membership_goal
- `alignment`: treaty, membership, candidate, security_guarantee, recognition, non_recognition
- `dependency`: energy_import, energy_export, trade_share, debt, arms_supply, remittances, investment, military_presence
- `action`: un_vote, sanction, visit, exercise, expulsion, agreement, incident

Rows under `dependency` carry a `value` and `unit` (e.g. `value: 0.62, unit: share_of_gas_imports`).

## Disputes are not objects

Decided: no dispute files. The focus is grand strategies; disputes exist *because of*
them, so the status of Kosovo is fully described by the objectives and stances of the
actors involved. The site may offer a view that gathers all rows mentioning an actor or
territory, but that is presentation, not data.

## Evidence

Confidence:

- **A**: official document (treaty, law, UN record, statistical office) or two independent tier-1/2 sources agreeing
- **B**: one tier-1 or tier-2 source
- **C**: tier-3 reporting, or an inference by us; shown with a visible mark on the site

Source tiers (agreed; names grow as the pilot meets them):

1. Official and statistical: governments, treaties, UN, EU, IMF, World Bank, Eurostat, SIPRI, UN Comtrade
2. Established research: IISS, International Crisis Group, ECFR, CFR, Chatham House, Carnegie, RUSI, ISPI
3. Quality press: Reuters, AP, FT, Economist, BIRN (Balkans), Al-Monitor (Middle East)
4. Everything else: usable only as a pointer, needs corroboration before it supports a row

Staleness: a row whose `last_verified` is older than 12 months is flagged on the site.

## Build

`data/` is the truth. `tools/build.py` compiles it into `docs/data.json` and validates:
ids exist, every row has a source, grades and types are in the vocabulary, dates parse,
dependency rows carry a value and a unit. The site never reads YAML directly.

## Lessons from the pilot (Serbia, 2026-10-12)

1. **Sub-state entities are actors.** Republika Srpska is neither a state nor an
   organisation but it signs agreements and receives patronage. Type `sub-state`,
   id prefix `sub-`, with a `parent` field.
2. **Stances carry a `trend`.** Russia and the United States were both "partner" for
   Serbia in 2026 and moving in opposite directions. Without the trend the map lies.
3. **Figures conflict.** Russian gas was "about 75%" (Energy Community) or "around 90%"
   (press) of Serbian consumption. Rule: the most recent figure with an official basis
   wins and the discrepancy is written in the row's `note`.
4. **Contested counts are two claims, not a number.** Kosovo's recognitions are 84 for
   Belgrade and about 120 for Pristina. A row may carry a `claims` list (`by`, `text`,
   `source`) instead of pretending to know.
5. **State media are tier 1 for what the government says, tier 4 for facts.** Tanjug,
   Xinhua and the like are cited as "(state agency, official statement)" and only for
   the statement itself.
6. **Non-events are signals, not rows.** Vučić skipping the 2026 Moscow parade matters,
   but there is no row type for an absence. It goes in the card's `reading`.
7. **Stubs.** An actor can exist as a stub (id, name, type, seat, regions) so that
   others can relate to it before it has a card. The site shows stubs greyed.
