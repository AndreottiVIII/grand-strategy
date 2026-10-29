# Delta mandate: update one card after a major event (weekly cycle, step 6)

You update the card of **{NAME} ({ID})** in `C:\Users\davide\Desktop\ClaudeTower\grand-strategy` after this event:
**{EVENT}** (week {WEEK}; today {TODAY}). Owner's rule: additions and reasoned changes, never a rewrite.

## Read first
1. `ONTOLOGY.md`, the sections on the card, the stance (grades, trends, bonds, evidence rules) and the relation.
2. The card as it stands: `data\actors\{ID}.yaml`, `data\stances\{ID}.yaml`, `data\relations\{ID}.yaml`.
3. The week's inbox rows about this actor: `python tools/inbox.py list {WEEK}` and read the items whose `from`
   or `to` is {ID} (they are already applied to the relations file or will be; do not duplicate them).

## Research
At most 6 web calls on the event and its consequences for the actor's foreign policy: who won or what changed,
the new government's or leadership's stated priorities toward the counterparts the card names, reactions of the
main counterparts (allies, rivals, neighbours), anything signed, recalled, deployed or sanctioned since. Quality
sources: official statements, Reuters, AP, AFP, BBC, Al Jazeera, the actor's own quality press, research
institutes. Every claim you write needs a source with url, title, publisher, date, tier.

## Write (and only this)
- `data\actors\{ID}.yaml`: if the event changes an objective, a means, a constraint or a paradox, edit that
  item's text and add the source; add a new item only if the event creates one. Append to the `reading` one
  short paragraph dated in the text ("After the election of ..."), keeping the rest. Set `last_verified`
  to {TODAY}. Keep the YAML style of the file (quoting, indentation) and every id, tier, region.
- `data\stances\{ID}.yaml`: for each counterpart the event moved, change `trend` (and `grade` only if the
  structural position changed, with the reason written into the note), add a sentence to the note with the
  date and the source, set `last_verified` to {TODAY}, append the source. Add a stance only for a counterpart
  that clearly matters and is missing (confidence B or C). Never touch stances marked `reciprocal_of`.
- `data\relations\{ID}.yaml`: add the dated rows the event produced that the inbox did not already hold
  (`action/agreement`, `incident`, `visit`, `sanction`, `expulsion`, `exercise`; alignments if signed), each
  with `since`, `last_verified` {TODAY}, `confidence`, `summary`, `sources`. Keep the file's indentation for
  list items (some files indent them by two spaces: look before appending).
- Never edit another actor's files. Never delete anything. Never change grades without a source that
  describes the new position.

## Then
`python tools/build.py` from the repo root until it ends with OK; fix every error it names on {ID}.
Report in under 150 words: what changed in the card (objectives, reading, stances with old and new trend or
grade, rows added), the sources, the number of web calls.
