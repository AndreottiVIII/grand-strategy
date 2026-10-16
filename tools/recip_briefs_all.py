"""Brief for a silent great power (Davide, 2026-10-16): every hand-written reading toward X that X has
not answered, with grade, note and sources, so one agent can write X's readings in one pass.

  python tools/recip_briefs_all.py USA CHN RUS     # writes tools/briefs/recip-all-<X>.md
"""
import csv
import io
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "data"
sys.stdout.reconfigure(encoding="utf-8")

out = subprocess.run([sys.executable, str(ROOT / "tools" / "onesided.py"), "--csv"], capture_output=True, text=True, encoding="utf-8").stdout
rows = list(csv.DictReader(io.StringIO(out)))


def stance(a, x):
    d = yaml.safe_load((D / "stances" / f"{a}.yaml").open(encoding="utf-8")) or {}
    for st in d.get("stances", []):
        if st["toward"] == x and not st.get("reciprocal_of"):
            return st
    return None


def name(i):
    try:
        return (yaml.safe_load((D / "actors" / f"{i}.yaml").open(encoding="utf-8")) or {}).get("name", i)
    except FileNotFoundError:
        return i


for x in sys.argv[1:]:
    actors = sorted({r["actor"] for r in rows if r["toward"] == x})
    lines = [f"# Reciprocal brief (all grades): {name(x)} ({x}) - the readings it has not answered", "",
             f"{len(actors)} actors grade {name(x)} and {x}'s card holds no hand-written reading back (only a mirrored provisional one). Write {x}'s own reading toward each, in `data/stances/{x}.yaml`, from {x}'s side: the grade by structural position (a patron reads a small ally as partner unless a treaty binds; a hostile small state is usually rival or neutral for a great power), trend stable unless the evidence moves it, bond from {x}'s side (none for most, kin or affinity where the evidence says so, grievance only for a wound {x} holds), confidence C unless a source gives {x}'s own reading, a note of 2-3 sentences, and the other side's sources reused (same links). No web calls. Replace any entry with `reciprocal_of` for these actors by the hand-written one (remove the key). Keep the entries already hand-written.", ""]
    for a in actors:
        st = stance(a, x) or {}
        lines += [f"## {name(a)} ({a}) reads {x} as **{st.get('grade')}**, {st.get('trend')}, bond {st.get('bond')}, confidence {st.get('confidence')}, since {st.get('since')}", "",
                  f"Note: {st.get('note', '')}", "", "Sources:"]
        for s in st.get("sources", []) or []:
            lines.append(f"- {s.get('url')} | {s.get('title')} | {s.get('publisher')} | {s.get('date')} | tier {s.get('tier')}")
        lines.append("")
    p = ROOT / "tools" / "briefs" / f"recip-all-{x}.md"
    p.write_text("\n".join(lines), encoding="utf-8")
    print(f"{x}: {len(actors)} readings -> {p.name}")
