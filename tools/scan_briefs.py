"""Briefs for the weekly scan: one Haiku agent per group of regions, 5 searches, writing candidate
rows to the inbox (never to the cards). The news heat (data/datasets/gdelt/heat.json) tells each
agent where to look first.

  python tools/scan_briefs.py            writes tools/briefs/scan-<week>-<group>.md and prints the list
"""
import datetime
import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
sys.stdout.reconfigure(encoding="utf-8")

GROUPS = {   # queue regions folded into ten scans
    "powers-east-asia": ["great-powers", "north-america", "east-asia"],
    "balkans-black-sea": ["western-balkans", "east-europe-black-sea"],
    "central-north-europe": ["central-north-europe"],
    "western-south-europe": ["western-south-europe"],
    "middle-east": ["middle-east"],
    "south-central-asia": ["south-central-asia"],
    "southeast-asia-oceania": ["southeast-asia-oceania"],
    "north-east-africa": ["north-africa", "east-africa"],
    "west-central-southern-africa": ["west-africa", "central-southern-africa"],
    "americas": ["central-america-caribbean", "south-america"],
}
today = datetime.date.today()
iso = today.isocalendar()
week = f"{iso[0]}-W{iso[1]:02d}"
since = (today - datetime.timedelta(days=8)).isoformat()
queue = yaml.safe_load((DATA / "queue.yaml").open(encoding="utf-8"))["actors"]
by_region = {}
for a in queue:
    by_region.setdefault(a["region"], []).append(a["id"])
names = {p.stem: (yaml.safe_load(p.open(encoding="utf-8")) or {}).get("name", p.stem) for p in (DATA / "actors").glob("*.yaml")}
heat = json.loads((DATA / "datasets" / "gdelt" / "heat.json").read_text(encoding="utf-8"))["actors"]
briefs = ROOT / "tools" / "briefs"
briefs.mkdir(exist_ok=True)

TEMPLATE = """# Weekly scan brief: {group} ({week})

You are one of ten scan agents for the atlas in `C:\\Users\\davide\\Desktop\\ClaudeTower\\grand-strategy`. Your job is to
find what happened between **{since} and {today}** to the actors of your group and write candidate rows to
**one file only**: `data\\inbox\\{week}-{group}.yaml`. Never edit any file under `data\\actors`, `data\\stances`
or `data\\relations`; never edit another group's inbox. The build ignores the inbox: a person reads it and accepts.

## Your actors
{actors}

## Where the news was (GDELT, events this week against the country's own four-week normal)
{hot}
Start from these, then the rest of the group. Quiet is also an answer: write nothing for actors with no event that matters.

## Budget
At most 5 web searches and about 40,000 tokens. One search per theme, not per country: "{group_words} week news
{month}" style, then one or two targeted searches on the hot countries. Read the result pages as text. Stop at 5.

## What counts (write), what does not (skip)
Write: sanctions, treaties and agreements signed, summits and visits of heads of state or government, military incidents
and exercises, expulsions and recalls, elections and changes of government, recognitions, major arms or energy deals with
a number, UN votes with the resolution symbol. Skip: statements without an act, anniversaries, sport, domestic news with
no counterpart abroad, anything you cannot date to the window or cannot source with a URL you actually read.

## The row
```yaml
week: {week}
group: {group}
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
    stance: {{actor: ISR, toward: LBN, trend: cooling}}
```
At most 15 items. Actor ids are the ISO3 codes above (organisations `org-...`, armed groups `nsa-...` as listed).
When done, run `python tools/inbox.py list {week}` from the repo root and fix every line it flags for your file.
Report in under 100 words: items written, the three that matter most, searches used.
"""

for group, regions in GROUPS.items():
    ids = [i for r in regions for i in by_region.get(r, [])]
    hot = sorted(((i, heat[i]) for i in ids if i in heat and heat[i]["events"] >= 100), key=lambda kv: -kv[1]["ratio"])[:8]
    hot_lines = "\n".join(f"- {names.get(i, i)} ({i}): {r['events']:,} events, {r['ratio']}x its normal, {round((r['conflict_share'] or 0) * 100)}% conflict" for i, r in hot) or "- nothing above its normal this week"
    text = TEMPLATE.format(group=group, week=week, since=since, today=today.isoformat(), month=today.strftime("%B %Y"),
                           group_words=group.replace("-", " "), hot=hot_lines,
                           actors=", ".join(f"{names.get(i, i)} ({i})" for i in ids))
    p = briefs / f"scan-{week}-{group}.md"
    p.write_text(text, encoding="utf-8")
    print(f"{p.name}: {len(ids)} actors, hot: {[i for i, _ in hot[:4]]}")
(DATA / "inbox").mkdir(exist_ok=True)
print(f"week {week}, window {since} to {today}")
