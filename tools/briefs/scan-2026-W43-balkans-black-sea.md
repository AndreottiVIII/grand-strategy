# Weekly scan brief: balkans-black-sea (2026-W43)

You are one of ten scan agents for the atlas in `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Your job is to
find what happened between **2026-10-14 and 2026-10-22** to the actors of your group and write candidate rows to
**one file only**: `data\inbox\2026-W43-balkans-black-sea.yaml`. Never edit any file under `data\actors`, `data\stances`
or `data\relations`; never edit another group's inbox. The build ignores the inbox: a person reads it and accepts.

## Your actors
Serbia (SRB), Kosovo (XKX), Croatia (HRV), Bosnia and Herzegovina (BIH), Montenegro (MNE), Albania (ALB), North Macedonia (MKD), Republika Srpska (sub-rs), Ukraine (UKR), Moldova (MDA), Belarus (BLR), Georgia (GEO), Armenia (ARM), Azerbaijan (AZE), Romania (ROU), Bulgaria (BGR), Türkiye (TUR)

## Where the news was (GDELT, events this week against the country's own four-week normal)
- Albania (ALB): 1,224 events, 2.95x its normal, 53% conflict
- Ukraine (UKR): 24,641 events, 1.63x its normal, 33% conflict
- Croatia (HRV): 433 events, 1.58x its normal, 7% conflict
- Bulgaria (BGR): 1,767 events, 1.45x its normal, 23% conflict
- Armenia (ARM): 2,290 events, 1.1x its normal, 17% conflict
- Azerbaijan (AZE): 3,800 events, 1.08x its normal, 16% conflict
- Türkiye (TUR): 5,433 events, 0.96x its normal, 20% conflict
- North Macedonia (MKD): 158 events, 0.93x its normal, 23% conflict
Start from these, then the rest of the group. Quiet is also an answer: write nothing for actors with no event that matters.

## Budget
At most 5 web searches and about 40,000 tokens. One search per theme, not per country: "balkans black sea week news
October 2026" style, then one or two targeted searches on the hot countries. Read the result pages as text. Stop at 5.

## What counts (write), what does not (skip)
Write: sanctions, treaties and agreements signed, summits and visits of heads of state or government, military incidents
and exercises, expulsions and recalls, elections and changes of government, recognitions, major arms or energy deals with
a number, UN votes with the resolution symbol. Skip: statements without an act, anniversaries, sport, domestic news with
no counterpart abroad, anything you cannot date to the window or cannot source with a URL you actually read.

## The row
```yaml
week: 2026-W43
group: balkans-black-sea
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
