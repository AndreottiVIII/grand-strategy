"""Review helpers for the best-model pass.

  python tools/review.py extract ID [ID...]     # compact view: stances, objectives, paradoxes
  python tools/review.py regrade ID TOWARD grade=... trend=... bond=... note="..."   # edit one stance, prefixing the note
"""
import re
import sys

import yaml

sys.stdout.reconfigure(encoding="utf-8")
ROOT = __file__.rsplit("tools", 1)[0]


def extract(a):
    st = yaml.safe_load(open(f"{ROOT}data/stances/{a}.yaml", encoding="utf-8"))["stances"]
    print(f"=== {a} stances ({len(st)})")
    for s in st:
        print(f"  {s['toward']:18} {s['grade']:18} {s['trend']:8} {s['bond']:9} {s['confidence']}  {str(s.get('note', ''))[:90]}")
    c = yaml.safe_load(open(f"{ROOT}data/actors/{a}.yaml", encoding="utf-8"))["grand_strategy"]
    print("--- objectives")
    for o in c["objectives"]:
        print("  ", o["rank"], o["text"][:130])
    print("--- paradoxes")
    for p in c.get("paradoxes", []):
        print("  -", p["text"][:150])
    r = yaml.safe_load(open(f"{ROOT}data/relations/{a}.yaml", encoding="utf-8"))["relations"]
    from collections import Counter
    print("--- relations", len(r), dict(Counter(x["layer"] for x in r)))


def regrade(actor, toward, **kw):
    p = f"{ROOT}data/stances/{actor}.yaml"
    s = open(p, encoding="utf-8").read()
    m = re.search(rf"(^\s*- toward: {re.escape(toward)}\s*\n)(.*?)(?=^\s*- toward: |\Z)", s, re.S | re.M)
    assert m, (actor, toward)
    blk = m.group(2)
    for k in ("grade", "trend", "bond", "confidence"):
        if k in kw:
            blk = re.sub(rf"{k}: \S+", f"{k}: {kw[k]}", blk, 1)
    if "note" in kw:
        prefix = kw["note"]
        if re.search(r'note: "', blk):
            blk = re.sub(r'(note: ")', lambda mm: mm.group(1) + prefix + " ", blk, 1)
        elif re.search(r"note: '", blk):
            blk = re.sub(r"(note: ')", lambda mm: mm.group(1) + prefix.replace("'", "''") + " ", blk, 1)
        else:
            blk = re.sub(r"(note: )(.*)", lambda mm: mm.group(1) + '"' + prefix + " " + mm.group(2).strip().strip('"') + '"', blk, 1)
    s = s[:m.start(2)] + blk + s[m.end(2):]
    open(p, "w", encoding="utf-8").write(s)
    print("regraded", actor, "->", toward, {k: v for k, v in kw.items() if k != "note"})


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "extract":
        for a in sys.argv[2:]:
            extract(a)
    elif cmd == "regrade":
        kw = dict(x.split("=", 1) for x in sys.argv[4:])
        regrade(sys.argv[2], sys.argv[3], **kw)
