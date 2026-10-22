# Portal pass brief (weekly update, second method)

You are a scan agent for the atlas in `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Instead of searching the
web, you read the English Wikipedia **Portal:Current events** page of each day in your range: every day lists the
world's dated events with a citation to a news source. Your job: turn the events that involve actors of the atlas
into candidate rows in **one inbox file**, never in a card.

## How to read a day
Fetch the wikitext through the API, as text (one call per day, no HTML):
`https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=Portal:Current_events/2026_October_18`
(replace the day). Each item is a line starting with `*` or `**`; the citation is the URL in brackets at the end of
the line, with the publisher in parentheses, like `[https://www.reuters.com/... (Reuters)]`. Cite that URL, never
Wikipedia. The event's date is the page's day.

## What becomes a row
Only events where at least one side is an actor of the atlas (states by ISO3 code, organisations `org-...`, armed groups
`nsa-...`: check `data\actors\` for the id when unsure, never invent one) and that fit the vocabulary:
- action: `sanction`, `visit` (heads of state or government, foreign ministers), `exercise`, `expulsion`, `agreement`
  (signed, not announced), `incident` (attacks, strikes, clashes, seizures, border incidents, assassinations), `un_vote`;
- alignment: `treaty`, `membership`, `candidate`, `security_guarantee`, `recognition`, `non_recognition`;
- objective: `territorial_claim`, `recognition_sought`, `recognition_denied`, `regime_goal`, `influence_goal`, `membership_goal`;
- dependency (only with a number): `energy_import`, `energy_export`, `trade_share`, `debt`, `arms_supply`, `remittances`,
  `investment`, `military_presence`.
Skip: purely domestic events with no foreign counterpart (a country's own election goes in only as `from: X, to: X`
is NOT allowed: skip it), disasters, sport, culture, deaths unless they are assassinations with a foreign hand,
statements without an act. Write the same event from both cards as two items when both sides matter (an attack:
`from` the attacker `to` the attacked, and the reverse).

## The file
`data\inbox\2026-W43-portal-<your range>.yaml`, written incrementally (header first, then each item as you go, valid
YAML at every step):
```yaml
week: 2026-W43
group: portal-<your range>
items:
- from: ISR
  to: LBN
  layer: action
  type: incident
  since: 2026-10-18
  summary: One or two sentences with the fact, the number and the date, in English, in your own words.
  confidence: B          # B for one quality source cited by the portal; C for an agency summary or a weak source
  sources:
  - url: https://...     # the citation from the portal line
    title: ...
    publisher: Reuters
    date: '2026-10-18'
    tier: 3              # 1 official, 2 research, 3 quality press (Reuters, AP, AFP, BBC, Al Jazeera, FT...), 4 other
  why: one line on why it matters for the card
```
At most 25 items per agent; the ones that matter most first. Budget: about 40,000 tokens, no web search at all
(the pages are the search). When done run `python tools/inbox.py list 2026-W43` from the repo root and fix every line
it flags for your file. Report in under 100 words: items written, the three that matter most, days read.
