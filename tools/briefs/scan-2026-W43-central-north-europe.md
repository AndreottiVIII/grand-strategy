# Weekly scan brief: central-north-europe (2026-W43)

You are one of ten scan agents for the atlas in `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Your job is to
find what happened between **2026-10-14 and 2026-10-22** to the actors of your group and write candidate rows to
**one file only**: `data\inbox\2026-W43-central-north-europe.yaml`. Never edit any file under `data\actors`, `data\stances`
or `data\relations`; never edit another group's inbox. The build ignores the inbox: a person reads it and accepts.

## Your actors
Poland (POL), Hungary (HUN), Czech Republic (CZE), Slovakia (SVK), Slovenia (SVN), Germany (DEU), Austria (AUT), Switzerland (CHE), Sweden (SWE), Finland (FIN), Norway (NOR), Denmark (DNK), Estonia (EST), Latvia (LVA), Lithuania (LTU), Iceland (ISL), Liechtenstein (LIE)

## Where the news was (GDELT, events this week against the country's own four-week normal)
- Liechtenstein (LIE): 191 events, 2.83x its normal, 1% conflict
- Norway (NOR): 3,669 events, 2.34x its normal, 14% conflict
- Czech Republic (CZE): 1,312 events, 1.91x its normal, 17% conflict
- Hungary (HUN): 1,335 events, 1.85x its normal, 11% conflict
- Slovakia (SVK): 574 events, 1.42x its normal, 15% conflict
- Finland (FIN): 1,332 events, 1.4x its normal, 12% conflict
- Austria (AUT): 1,184 events, 1.16x its normal, 30% conflict
- Poland (POL): 2,578 events, 1.07x its normal, 25% conflict
Start from these, then the rest of the group. Quiet is also an answer: write nothing for actors with no event that matters.

## Budget
At most 5 web searches and about 40,000 tokens. One search per theme, not per country: "central north europe week news
October 2026" style, then one or two targeted searches on the hot countries. Read the result pages as text. Stop at 5.

## What counts (write), what does not (skip)
Write: sanctions, treaties and agreements signed, summits and visits of heads of state or government, military incidents
and exercises, expulsions and recalls, elections and changes of government, recognitions, major arms or energy deals with
a number, UN votes with the resolution symbol. Skip: statements without an act, anniversaries, sport, domestic news with
no counterpart abroad, anything you cannot date to the window or cannot source with a URL you actually read.

## The row
```yaml
week: 2026-W43
group: central-north-europe
items:
- from: ISR            # the actor whose card carries the row (write the same event from both cards as two items if both matter)
  to: LBN
  layer: action        # objective | alignment | dependency | action
  type: incident       # objective: territorial_claim recognition_sought recognition_denied regime_goal influence_goal membership_goal
                       # alignment: treaty membership candidate security_guarantee recognition non_recognition
                       # dependency: energy_import energy_export trade_share debt arms_supply remittances investment military_presence (value + unit required)
                       # action: un_vote sanction visit exercise expulsion agreement incident
  since: 2026-10-18    # the date of the event, YYYY-MM-DD
  summary: One or two sentences with the fact, the number and the date, in English.
  confidence: B        # A official document or two independent sources; B one good source; C press summary
  sources:
  - url: https://...
    title: ...
    publisher: ...
    date: '2026-10-18'
    tier: 3            # 1 official, 2 research, 3 quality press, 4 other
  why: one line on why it matters for the card
  proposes:            # optional, only when a source plainly says the relationship moved; never a grade without a reason
    stance: {actor: ISR, toward: LBN, trend: cooling}
```
At most 15 items. Actor ids are the ISO3 codes above (organisations `org-...`, armed groups `nsa-...` as listed).
When done, run `python tools/inbox.py list 2026-W43` from the repo root and fix every line it flags for your file.
Report in under 100 words: items written, the three that matter most, searches used.
