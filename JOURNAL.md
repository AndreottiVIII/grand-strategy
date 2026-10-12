# Journal

Decision log, newest first. The path matters more than the destination: record why,
not only what. Dead ends are entries too.

## 2026-10-12 · Second review: "not the Claude yellow everywhere"

Davide on the paper-and-ink map: the cream palette is the default aesthetic, not an
identity. Three directions were mocked up on the same abstract shape (ops room on
charcoal; two-ink risograph; admiralty chart in grey). **Chosen: two inks** - navy and
vermilion on cold white, posture as a dot screen whose density is the strength (navy
for the friendly side, vermilion for the hostile), claimed territory as vermilion
hatch, Archivo / Archivo Narrow grotesque, the point of view in solid navy with its
name knocked out in paper.

**Bond.** The first idea (line screens underneath) was rejected mid-build: "the extra
lines distract". Replaced by a band inside the border in the bond's ink (navy = kin,
vermilion = grievance), clipped to the country so it never paints a neighbour. Still a
provisional rendering; alternatives on the table: bond only as a toggle that swaps the
whole map to a bond view; or a glyph at the seat.

## 2026-10-12 · First review: seven objections, two model changes

Davide saw the demo and listed seven things. Two of them were about the model, not
the screen, and those are the ones that count.

**Model**

1. *"How can Russia and the US both be 'partner'? Serbia's tie with Russia is cultural;
   if the model doesn't see it, change the model."* It did not see it: one axis
   (posture today). Added `bond` to stances: kin / affinity / none / grievance. Russia
   is now partner + kin + cooling; the US partner + grievance + warming. Bonds are
   evidenced like grades (polls on the 1999 bombing, the Montenegro census).
2. *"Albania partner? Albania and Kosovo are the same thing. Understand what 'partner'
   is and who is the partner of an adversary."* The rule "a source must use the word"
   let Vučić's Open Balkan rhetoric set the grade. New rule in ONTOLOGY.md: the grade
   follows the structural position, rhetoric goes in the note; `tools/build.py` now
   warns on "partner of an adversary's ally" and on asymmetric pairs. Albania
   regraded `rival` (motherland of Kosovo; signatory of the 2025 Tirana defence
   declaration Belgrade calls its "greatest threat"), cooperation noted.

**Screen**

3. Map "anonymous": rebuilt as a 1970s situation map - paper grain, ink coastlines,
   dashed graticule, hatching for claimed territory, dot and cross screens for bond,
   condensed capitals, a stamp-like legend. Screens, arrowheads and type stay at
   screen size under zoom; small countries get their label only when wide enough.
4. Colour scale: rivals and adversaries in red, allies in blue, partners blue-grey,
   neutral paper, own territory solid ink.
5. Actor list removed from the sidebar.
6. Graph dropped. Relations are arrows on the map from the point-of-view seat to the
   counterpart, one style per layer, with toggles; several rows share an arrow and
   list in the tooltip. A circular board can come later at scale.
7. Links out of the card: footnote numbers in the text, sources as endnotes with hover.

**Still open.** Labels for Kosovo and Montenegro only appear on zoom; a leader-line
scheme would fix it. `claims` on contested counts render as tier-4 footnotes, which
is a hack. The structural warnings cannot fire until counterparts have alignment rows.

## 2026-10-12 · Serbia pilot and first demo

Davide: "I like it, but I want to *see* it. Let's do the demo all the way, then reason
about scalability."

**Done.** Four parallel researches on Serbia (card, stances, dependencies, actions;
about 270 sources opened). Data written as `data/actors/SRB.yaml` (6 objectives, 7
means, 6 constraints, 7 paradoxes, reading), `data/stances/SRB.yaml` (18 stances, each
with a source that uses the grade), `data/relations/SRB.yaml` (43 rows). 20 stub
actors as nodes. `tools/build.py` validates and compiles. Site in `docs/` with map
(point-of-view colouring, hatched claimed territory, "Neighbourhood/World" framing),
force graph (arcs by layer), dossier (card, stance table, relations with sources and
confidence badges). Public repo `AndreottiVIII/grand-strategy`, GitHub Pages from `docs/`.

**Ontology draft 2** records seven lessons the pilot forced: sub-state actors, stance
`trend`, conflicting-figure rule, contested counts as `claims`, state media as tier 1
only for statements, non-events in `reading`, stubs. See ONTOLOGY.md.

**Left out for lack of a source that holds.** The "betray the soul of our people"
sanctions quote (only Pravda); Serbia's Sept 2025 vote on the Palestine declaration
(inferred, not read). Bosnia-state stance is recorded as `rival` at confidence C and
marked provisional: no source uses a scale word.

**Open after the demo**

- Is one card enough to judge the form? Probably not: the graph is a star until a
  second card arrives. Kosovo or Croatia next would make the first real intersection.
- Map framing: "Neighbourhood" fits all stance countries, so the UAE and Azerbaijan
  stretch it. Maybe frame on the actor's regions instead.
- The dossier is 12,000px tall for one actor. Collapsible sections or a layer filter
  will be needed at scale.
- Source URLs were opened by research agents, not by Davide; a spot check of a dozen
  would be the honest next step before showing anyone.

## 2026-10-12 · Ontology draft 1

Draft 0 read in full in chat and argued point by point.

**Decided**

1. **No dispute objects.** Davide: the focus is grand strategies, not disputes; disputes
   exist because of grand strategies. Kosovo's status lives in the objectives and
   stances of the actors, not in a file of its own.
2. **Stance grades need a source.** "Reluctant ally" is a judgement, so each grade on the
   per-actor map must cite an analysis that uses that reading. Our own judgement is not
   enough, even as grade C. Chosen over the faster option on purpose.
3. **Nine grades**, adding `reluctant_partner` (Serbia toward the EU).
4. Source tiers as proposed; stance grades and type vocabularies closed, growing only
   with journal entries.

**Still open**

- Type vocabulary will meet reality with the first actor. Serbia proposed as first.

## 2026-10-12 · Founding decisions

Session: "Grand Strategy" (Claude Code, Remote Control on).

**The idea.** The world looks chaotic; it is in fact complexity at the limit of what
can be managed. Map what every country (and every actor that behaves like one) does
and wants, and show where those things intersect. Example that started it: Serbia
wants Kosovo; Kosovo is NATO-aligned; therefore Serbia leans to Russia. Reductive on
purpose; the project exists to add the other n variables without losing the thread.

**Decided**

1. Pilot: Western Balkans, with the condition that the schema scales to ~200 actors.
   Fallback if it does not: everything at once, thin cards.
2. Relations carry four layers: objectives/disputes, formal alignments, material
   dependencies, recent dated actions. Davide noted he would have missed "recent
   actions" on his own; it stays.
3. Every claim cited, with date and confidence. Slowest option, chosen knowingly.
4. Public, in English.
5. Main view: relation graph. Mandatory second view: world map from one actor's point
   of view ("the world as Belgrade sees it"), with graded alignment (own territory,
   claimed, ally, reluctant ally, neutral, rival, enemy).
6. Time: today only; history from git.
7. Every actor gets a Luttwak grand-strategy card (objectives, means, constraints,
   allies, paradoxes). Luttwak "as a lamp for every step".
8. Updates via on-demand Claude sessions, versioned in git.
9. Non-state actors in, including territory-less organisations when they act as state
   instruments.
10. GitHub Pages, public from the start. Davide: "who looks at my GitHub? nobody".
11. Name: decided later. Folder `grand-strategy`.

**Open at the time** (all closed by the draft-1 entry above)

- The ontology itself (docs/ONTOLOGY.md): first draft to be discussed next.
- Alignment scale for the per-actor map: how many grades, and who decides "reluctant".
- Source tiers: which outlets count as what.
- Whether a relation is directed (Serbia→Kosovo differs from Kosovo→Serbia). Leaning yes.
