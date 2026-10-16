"""Briefs for the hostile one-sided pass (Davide, 2026-10-16): for every actor X that another card
grades rival or adversary without X having written its own reading back, collect the written side
(grade, note, sources) so that one agent can write X's reading mirrored on the existing evidence.

  python tools/recip_briefs.py            # writes tools/briefs/recip-<X>.md, one per target
"""
import csv
import io
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "data"
sys.stdout.reconfigure(encoding="utf-8")

out = subprocess.run([sys.executable, str(ROOT / "tools" / "onesided.py"), "--csv"], capture_output=True, text=True, encoding="utf-8").stdout
rows = [r for r in csv.DictReader(io.StringIO(out)) if r["other_card"] == "full card" and r["grade"] in ("rival", "adversary")]
by_target = defaultdict(list)
for r in rows:
    by_target[r["toward"]].append(r["actor"])


def stance(a, x):
    d = yaml.safe_load((D / "stances" / f"{a}.yaml").open(encoding="utf-8")) or {}
    for st in d.get("stances", []):
        if st["toward"] == x:
            return st
    return None


def name(i):
    try:
        return (yaml.safe_load((D / "actors" / f"{i}.yaml").open(encoding="utf-8")) or {}).get("name", i)
    except FileNotFoundError:
        return i


for x, actors in sorted(by_target.items(), key=lambda kv: -len(kv[1])):
    lines = [f"# Reciprocal brief: {name(x)} ({x}) - the hostile readings it has not answered", "",
             f"These actors grade {name(x)} rival or adversary; {x}'s own card holds no hand-written reading back (only a provisional reciprocal, if any). Write {x}'s reading toward each of them in `data/stances/{x}.yaml`, mirrored on the evidence below (same sources, same links) plus at most 2 web calls per pair for {x}'s own statements. Replace any entry with `reciprocal_of: ...` for these actors by the hand-written one. The grade follows the structural position from {x}'s side, which may differ from the other side's (a small state's rival can be the great power's neutral or partner): say why in the note, cite confidence A/B/C honestly, and never leave the pair unwritten.", ""]
    for a in actors:
        st = stance(a, x) or {}
        lines += [f"## {name(a)} ({a}) reads {x} as **{st.get('grade')}**, {st.get('trend')}, bond {st.get('bond')}, confidence {st.get('confidence')}, since {st.get('since')}", "",
                  f"Note: {st.get('note', '')}", "", "Sources:"]
        for s in st.get("sources", []) or []:
            lines.append(f"- {s.get('url')} | {s.get('title')} | {s.get('publisher')} | {s.get('date')} | tier {s.get('tier')}")
        lines.append("")
    p = ROOT / "tools" / "briefs" / f"recip-{x}.md"
    p.write_text("\n".join(lines), encoding="utf-8")
    print(f"{x:12} {len(actors):2}  -> {p.name}")
