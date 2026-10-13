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
coords: [20.46, 44.82]      # seat as [lon, lat]; where the map draws arrows from and to
iso2: rs                    # flag via flagcdn.com; non-states use `flag: flags/<file>.svg` in docs/flags instead
wikipedia: https://en.wikipedia.org/wiki/Serbia   # every actor links to English Wikipedia
regions: [western-balkans]  # an actor can be in several (Turkey: balkans, middle-east, caucasus)
card: full                  # full = has a grand-strategy card; stub = exists only as a node others relate to
tier: protagonist           # protagonist | secondary | minor - how deep the card goes (METHOD.md)
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
    bond: grievance           # kin | affinity | none | grievance - the structure under the posture (see below)
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
| `rival` | competing interests, friction, even arms races - but no will to destroy (Serbia toward Croatia, the US toward China) |
| `adversary` | mortal enemy: the other side's existence or regime is the problem (Iran and Israel, Ukraine toward Russia, Armenia and Azerbaijan until 2023). Rare by design |

Actors not listed default to `neutral` on the map, drawn in grey.

Hostility has two grades and the gap between them is deliberate: `rival` covers almost all
bad relationships; `adversary` is reserved for enemies in the mortal sense, where a
declared aim is the other's defeat or disappearance. Serbia in 2026 has rivals and no
adversary; Israel and Iran are the reference case (Davide, 2026-10-12).

**A grade is never our own judgement.** Every stance must cite at least one source
that uses that reading (an analysis calling the relationship "reluctant", a treaty for
"ally", a government statement for "adversary"). If no source says it, the stance is
not recorded and the gap goes in JOURNAL.md. This is slower; it was chosen knowingly.

**But the grade follows the structural position, not the rhetoric.** A government
calling a neighbour "a reliable partner" is a tier-1 source for the statement, not for
the grade. If B is the kin or treaty ally of someone A treats as claimed territory or
adversary, A's grade of B cannot be better than `rival` unless a source explains why
(the Serbia-Albania mistake of draft 2: Tirana is Pristina's motherland and signed the
2025 defence pact Belgrade calls its "greatest threat", yet Open Balkan rhetoric had
it graded "partner"). The build script warns on "partner of an adversary's ally" and on
asymmetric pairs (A: partner, B: adversary); each warning needs an answer in the note.

**Bond: the structure under the posture.** Two actors can both be "partner" today and
mean opposite things. `bond` records the standing tie, which changes over decades:

| bond | meaning | Serbia examples |
|---|---|---|
| `kin` | shared identity - faith, language, history | Russia, Montenegro, Republika Srpska |
| `affinity` | sympathy without kinship | Hungary, China |
| `none` | pure interest, nothing underneath | UAE, Azerbaijan |
| `grievance` | an open historical wound | United States and NATO (1999), Croatia, Kosovo |
| `unknown` | not assessed; allowed only on dataset-derived stances | treaty allies generated from alliance memberships |

**Reciprocal stances (Davide, 2026-10-12).** If A's hand-written stance grades B and B
holds no stance toward A, the build adds a provisional B → A with the same grade
(claimed territory becomes `rival` from the claimed side; own territory is not
mirrored), A's sources, the same bond, one confidence grade lower, flagged
`reciprocal`, and warns so that B's own side gets written in the reverse pass. A hand
stance always replaces it.

**Dataset-derived stances.** The build generates `ally` stances between co-members of a
defence alliance (NATO Art. 5, CSTO Art. 4, EU Art. 42(7)), confidence A, bond
`unknown`, flagged `dataset`. They are the floor, not the reading: a hand-written
stance for the same pair always replaces them. No other grade is ever derived.

Posture and bond are independent: Russia is partner + kin (cooling), the United
States partner + grievance (warming), Montenegro rival + kin. On the map the posture
is the colour and the bond a screen over it (dots for kin, crosses for grievance).

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
        title: ...              # English; for a source in another language this is the translation
        title_original: ...     # optional, the title as published
        lang: sr                # optional, ISO 639-1, when not English
        publisher: ...
        date: ...
        tier: 1
        dataset: unga-votes     # optional: rows imported by tools/datasets/ name their script here
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
7. **Stubs.** An actor can exist as a stub (id, name, type, seat, coords, regions) so
   that others can relate to it before it has a card. The site shows stubs greyed.

## Dataset layers (2026-10-12)

Some evidence covers every actor at once and enters without an agent:

| dataset | script | produces |
|---|---|---|
| Wikidata states | `tools/datasets/wikidata.py` | one stub per sovereign state (flag code, seat, coords, Wikipedia) |
| Wikidata memberships | same | `membership` rows toward 22 organisations, citing the official member list |
| UNGA recorded votes | `tools/datasets/unga_page.js` run in the browser pane | `un_vote` rows for the landmark resolutions in `unga-landmarks.yaml`; a 193x193 voting-affinity matrix |
| Wikipedia recognition | `tools/datasets/recognition.py` | `recognition` / `non_recognition` rows toward Kosovo, Palestine, Taiwan, with the citation under each Wikipedia row as the source |
| derived allies | `tools/build.py` | `ally` stances between alliance co-members |

Rule for Wikipedia: it is the index, never the source of record. A fact is taken with
the citation under it; where Wikipedia is the only source the row says so (tier 4).

## Lessons from the first review (Davide, 2026-10-12, same day)

8. **One axis is not enough.** "Partner" hid that Russia and the United States are
   opposite cases. Hence `bond`.
9. **Rhetoric is not structure.** Hence the Albania rule above and the build warnings.
10. **The graph drawn in a void says nothing.** Relations are drawn on the map as
    arrows between seats, by layer, with toggles. A circular board may come later at scale.
11. **The map must have a character**: a 1970s situation map, paper and ink, screens
    and hatching, condensed capitals. Not a dashboard.

## Seams (added 2026-10-13)

A **seam** is an actor pulled two ways: Y is an ally (or reluctant ally) of both A and X while A
and X are rivals or adversaries of each other. The word is Luttwak's: relational manoeuvre aims
at the seams between an opponent and its allies. Seams are never written by hand; `tools/build.py`
computes them and the site shows them (Seams page; a dashed outline on the map, when switched on).

Rule, decided with Davide: **every leg must be a written reading** - a hand-written stance of
confidence A or B, from either side of the leg. The treaty floor alone (NATO, EU, CSTO
co-membership from the dataset) never makes a seam, or every NATO member would be "pulled"
between Cyprus and Turkey; provisional reciprocals (`reciprocal_of`) never count either. The
list therefore grows only as cards are written on both sides of a rivalry.
