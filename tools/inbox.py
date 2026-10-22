"""The inbox: candidate rows from the weekly scans, kept apart from the cards until a person accepts them.

Scan agents write data/inbox/<week>-<group>.yaml (the build ignores data/inbox). Each file:

  week: 2026-W43
  group: middle-east
  items:
  - from: ISR            # the actor whose relations file carries the row
    to: LBN
    layer: action        # objective | alignment | dependency | action (vocabulary of ONTOLOGY.md)
    type: incident
    since: 2026-10-18    # the event's date; dependencies may carry value and unit as usual
    summary: one or two sentences, with the number and the date
    confidence: B
    sources: [{url, title, publisher, date, tier}]
    why: one line on why it matters for the card
    proposes:            # optional and never applied by this tool: a posture change for the hand
      stance: {actor: ISR, toward: LBN, trend: cooling}

Usage (from the repo root):
  python tools/inbox.py list [week]              every item with an index, validated, duplicates flagged
  python tools/inbox.py apply <week> --accept 3,7,12   append those rows to the cards
  python tools/inbox.py apply <week> --all      append every valid, non-duplicate row
Rows are appended to data/relations/<from>.yaml as text (the file is not rewritten), with
last_verified = today. Proposals are printed, never applied. Then: reciprocate --write, build, commit.
"""
import datetime
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
INBOX = DATA / "inbox"
sys.stdout.reconfigure(encoding="utf-8")
TYPES = {
    "objective": {"territorial_claim", "recognition_sought", "recognition_denied", "regime_goal", "influence_goal", "membership_goal"},
    "alignment": {"treaty", "membership", "candidate", "security_guarantee", "recognition", "non_recognition"},
    "dependency": {"energy_import", "energy_export", "trade_share", "debt", "arms_supply", "remittances", "investment", "military_presence"},
    "action": {"un_vote", "sanction", "visit", "exercise", "expulsion", "agreement", "incident"},
}
actors = {p.stem for p in (DATA / "actors").glob("*.yaml")}


def load_week(week):
    files = sorted(INBOX.glob(f"{week}-*.yaml")) if week else sorted(INBOX.glob("*.yaml"))
    items = []
    for f in files:
        doc = yaml.safe_load(f.open(encoding="utf-8")) or {}
        for it in doc.get("items") or []:
            it["_file"] = f.name
            it["_group"] = doc.get("group", f.stem)
            items.append(it)
    return items


def existing_rows(aid):
    p = DATA / "relations" / f"{aid}.yaml"
    if not p.exists():
        return []
    return (yaml.safe_load(p.open(encoding="utf-8")) or {}).get("relations") or []


def check(it):
    problems = []
    for k in ("from", "to", "layer", "type", "since", "summary", "confidence", "sources"):
        if not it.get(k):
            problems.append(f"missing {k}")
    if it.get("from") not in actors:
        problems.append(f"unknown actor {it.get('from')}")
    if it.get("to") not in actors:
        problems.append(f"unknown actor {it.get('to')}")
    if it.get("layer") not in TYPES:
        problems.append(f"unknown layer {it.get('layer')}")
    elif it.get("type") not in TYPES[it["layer"]]:
        problems.append(f"type {it.get('type')} not in the {it['layer']} vocabulary")
    if it.get("confidence") not in ("A", "B", "C"):
        problems.append("confidence must be A, B or C")
    for s in it.get("sources") or []:
        if not (isinstance(s, dict) and s.get("url") and s.get("title") and s.get("publisher") and s.get("date") and s.get("tier")):
            problems.append("a source lacks url, title, publisher, date or tier")
            break
    if it.get("layer") == "dependency" and ("value" not in it or "unit" not in it):
        problems.append("dependency rows need value and unit")
    if not problems:
        for r in existing_rows(it["from"]):
            if r.get("to") == it["to"] and r.get("type") == it["type"] and str(r.get("since")) == str(it["since"]):
                problems.append("duplicate: the card already holds this row")
                break
    return problems


def cmd_list(week):
    items = load_week(week)
    if not items:
        print("inbox empty" + (f" for {week}" if week else ""))
        return
    ok = 0
    for i, it in enumerate(items, 1):
        pr = check(it)
        ok += not pr
        flag = "OK " if not pr else "!! "
        print(f"{i:3} {flag}[{it['_group']}] {it.get('from')} -> {it.get('to')} {it.get('layer')}/{it.get('type')} {it.get('since')} ({it.get('confidence')})")
        print(f"      {str(it.get('summary', ''))[:160]}")
        if it.get("why"):
            print(f"      why: {str(it['why'])[:140]}")
        if it.get("proposes"):
            print(f"      PROPOSES: {it['proposes']}")
        for p in pr:
            print(f"      - {p}")
    print(f"\n{len(items)} items, {ok} valid and new")


def cmd_apply(week, accept):
    items = load_week(week)
    today = datetime.date.today().isoformat()
    chosen = [(i, it) for i, it in enumerate(items, 1) if accept is None or i in accept]
    applied, proposals = 0, []
    for i, it in chosen:
        pr = check(it)
        if pr:
            print(f"skip {i}: {'; '.join(pr)}")
            continue
        row = {"to": it["to"], "layer": it["layer"], "type": it["type"], "summary": it["summary"], "since": it["since"],
               "until": it.get("until"), "last_verified": today, "confidence": it["confidence"]}
        if it["layer"] == "dependency":
            row["value"], row["unit"] = it["value"], it["unit"]
        row["sources"] = it["sources"]
        p = DATA / "relations" / f"{it['from']}.yaml"
        if not p.exists():
            p.write_text(f"from: {it['from']}\nrelations: []\n", encoding="utf-8")
        text = p.read_text(encoding="utf-8")
        doc = yaml.safe_load(text) or {}
        block = yaml.safe_dump([row], sort_keys=False, allow_unicode=True, width=200, default_flow_style=False)
        if list(doc.keys())[-1] == "relations" and not text.rstrip().endswith("relations: []"):
            if not text.endswith("\n"):
                text += "\n"
            p.write_text(text + block, encoding="utf-8", newline="\n")
        else:   # relations is not the last key or is empty: rewrite the file in full
            doc.setdefault("relations", [])
            doc["relations"] = (doc["relations"] or []) + [row]
            p.write_text(yaml.safe_dump(doc, sort_keys=False, allow_unicode=True, width=200, default_flow_style=False), encoding="utf-8", newline="\n")
        applied += 1
        print(f"added {i}: {it['from']} -> {it['to']} {it['layer']}/{it['type']} {it['since']}")
        if it.get("proposes"):
            proposals.append((i, it["proposes"]))
    print(f"\n{applied} rows added")
    if proposals:
        print("proposals for the hand (not applied):")
        for i, pr in proposals:
            print(f"  {i}: {pr}")
    print("next: python tools/reciprocate.py --write && python tools/build.py")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    args = [a for a in sys.argv[2:] if not a.startswith("--")]
    opts = {a.split("=")[0][2:]: (a.split("=")[1] if "=" in a else True) for a in sys.argv[2:] if a.startswith("--")}
    if cmd == "list":
        cmd_list(args[0] if args else None)
    elif cmd == "apply":
        week = args[0]
        accept = None if opts.get("all") else {int(x) for x in str(opts.get("accept", "")).split(",") if x}
        if accept is not None and not accept:
            sys.exit("apply needs --accept=1,2,3 or --all")
        cmd_apply(week, accept)
    else:
        sys.exit(__doc__)
