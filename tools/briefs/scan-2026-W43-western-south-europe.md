# Weekly scan brief: western-south-europe (2026-W43)

You are one of ten scan agents for the atlas in `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Your job is to
find what happened between **2026-10-14 and 2026-10-22** to the actors of your group and write candidate rows to
**one file only**: `data\inbox\2026-W43-western-south-europe.yaml`. Never edit any file under `data\actors`, `data\stances`
or `data\relations`; never edit another group's inbox. The build ignores the inbox: a person reads it and accepts.

## Your actors
Italy (ITA), Spain (ESP), Kingdom of the Netherlands (NLD), Belgium (BEL), Greece (GRC), Cyprus (CYP), Portugal (PRT), Ireland (IRL), Luxembourg (LUX), Malta (MLT), Andorra (AND), Monaco (MCO), San Marino (SMR), Vatican City (VAT), European Union (org-eu), NATO (org-nato)

## Where the news was (GDELT, events this week against the country's own four-week normal)
- Vatican City (VAT): 2,122 events, 3.06x its normal, 6% conflict
- Belgium (BEL): 3,035 events, 1.7x its normal, 26% conflict
- Cyprus (CYP): 1,016 events, 1.11x its normal, 23% conflict
- Italy (ITA): 5,510 events, 1.1x its normal, 25% conflict
- Portugal (PRT): 1,126 events, 1.01x its normal, 31% conflict
- Ireland (IRL): 6,280 events, 1.01x its normal, 24% conflict
- Spain (ESP): 3,798 events, 0.9x its normal, 27% conflict
- Greece (GRC): 2,935 events, 0.84x its normal, 21% conflict
Start from these, then the rest of the group. Quiet is also an answer: write nothing for actors with no event that matters.

## Budget
At most 5 web searches and about 40,000 tokens. One search per theme, not per country: "western south europe week news
October 2026" style, then one or two targeted searches on the hot countries. Read the result pages as text. Stop at 5.

## What counts (write), what does not (skip)
Write: sanctions, treaties and agreements signed, summits and visits of heads of state or government, military incidents
and exercises, expulsions and recalls, elections and changes of government, recognitions, major arms or energy deals with
a number, UN votes with the resolution symbol. Skip: statements without an act, anniversaries, sport, domestic news with
no counterpart abroad, anything you cannot date to the window or cannot source with a URL you actually read.

## The row
```yaml
week: 2026-W43
group: western-south-europe
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
