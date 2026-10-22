# Weekly scan brief: americas (2026-W43)

You are one of ten scan agents for the atlas in `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Your job is to
find what happened between **2026-10-14 and 2026-10-22** to the actors of your group and write candidate rows to
**one file only**: `data\inbox\2026-W43-americas.yaml`. Never edit any file under `data\actors`, `data\stances`
or `data\relations`; never edit another group's inbox. The build ignores the inbox: a person reads it and accepts.

## Your actors
Cuba (CUB), Guatemala (GTM), Honduras (HND), El Salvador (SLV), Nicaragua (NIC), Costa Rica (CRI), Panama (PAN), Dominican Republic (DOM), Haiti (HTI), Jamaica (JAM), Trinidad and Tobago (TTO), The Bahamas (BHS), Barbados (BRB), Belize (BLZ), Antigua and Barbuda (ATG), Dominica (DMA), Grenada (GRD), Saint Kitts and Nevis (KNA), Saint Lucia (LCA), Saint Vincent and the Grenadines (VCT), Brazil (BRA), Venezuela (VEN), Argentina (ARG), Colombia (COL), Chile (CHL), Peru (PER), Ecuador (ECU), Bolivia (BOL), Paraguay (PRY), Uruguay (URY), Guyana (GUY), Suriname (SUR)

## Where the news was (GDELT, events this week against the country's own four-week normal)
- Uruguay (URY): 734 events, 2.36x its normal, 7% conflict
- El Salvador (SLV): 716 events, 2.04x its normal, 37% conflict
- Ecuador (ECU): 700 events, 1.8x its normal, 19% conflict
- Peru (PER): 1,540 events, 1.6x its normal, 10% conflict
- Argentina (ARG): 1,985 events, 1.38x its normal, 15% conflict
- Bolivia (BOL): 691 events, 1.38x its normal, 27% conflict
- Guatemala (GTM): 599 events, 1.37x its normal, 34% conflict
- Guyana (GUY): 945 events, 1.36x its normal, 21% conflict
Start from these, then the rest of the group. Quiet is also an answer: write nothing for actors with no event that matters.

## Budget
At most 5 web searches and about 40,000 tokens. One search per theme, not per country: "americas week news
October 2026" style, then one or two targeted searches on the hot countries. Read the result pages as text. Stop at 5.

## What counts (write), what does not (skip)
Write: sanctions, treaties and agreements signed, summits and visits of heads of state or government, military incidents
and exercises, expulsions and recalls, elections and changes of government, recognitions, major arms or energy deals with
a number, UN votes with the resolution symbol. Skip: statements without an act, anniversaries, sport, domestic news with
no counterpart abroad, anything you cannot date to the window or cannot source with a URL you actually read.

## The row
```yaml
week: 2026-W43
group: americas
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
