"""One-sided readings: pairs where one actor's stance is hand-written and the other side holds only a
provisional reciprocal, a dataset floor, or nothing. Davide wants to review these before the atlas is
shown as complete (2026-10-16).

  python tools/onesided.py            # summary + list, hand-written side first
  python tools/onesided.py --csv      # same as CSV (actor, toward, grade, other side)
"""
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "data"
sys.stdout.reconfigure(encoding="utf-8")


def load(p):
    try:
        return yaml.safe_load(p.open(encoding="utf-8")) or {}
    except yaml.YAMLError:
        return {}


def main(csv=False):
    actors = {p.stem: load(p) for p in (D / "actors").glob("*.yaml")}
    full = {k for k, v in actors.items() if v.get("card") == "full"}
    hand, other = {}, {}
    for p in (D / "stances").glob("*.yaml"):
        if p.stem.startswith("_"):
            continue
        for st in load(p).get("stances", []):
            key = (p.stem, st["toward"])
            if st.get("reciprocal_of"):
                other[key] = "provisional reciprocal"
            elif st.get("dataset"):
                other[key] = "dataset floor"
            else:
                hand[key] = st["grade"]
    rows = []
    for (a, x), g in sorted(hand.items()):
        back = (x, a)
        if back in hand:
            continue
        rows.append((a, x, g, other.get(back, "missing"), "full card" if x in full else "stub"))
    if csv:
        print("actor,toward,grade,other_side,other_card")
        for r in rows:
            print(",".join(r))
        return
    n_full = sum(1 for r in rows if r[4] == "full card")
    print(f"{len(rows)} one-sided readings ({n_full} toward actors that have a full card and still wrote nothing back)")
    print("\n-- toward full cards (to review first) --")
    for a, x, g, o, c in rows:
        if c == "full card":
            print(f"  {a:14} -> {x:14} {g:18} other side: {o}")
    print("\n-- toward stubs (fill when their card is written) --")
    for a, x, g, o, c in rows:
        if c != "full card":
            print(f"  {a:14} -> {x:14} {g:18} other side: {o}")


if __name__ == "__main__":
    main("--csv" in sys.argv)
