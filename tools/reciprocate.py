"""Retroact on existing cards (Davide, 2026-10-12): when a new card grades or binds an
actor that already has a card, write the reciprocal INTO that actor's own files.

  python tools/reciprocate.py            # dry run: what would be written
  python tools/reciprocate.py --write    # append the reciprocals

Stances: if A (hand) grades B and B's stance file has no entry toward A, B gets one
with the mirrored grade (claimed_territory -> rival; own_territory skipped), the same
bond, trend and sources, one confidence grade lower, `reciprocal_of: A`, and a note
saying it is provisional until written from B's side.
Relations: if A holds an alignment row (treaty, membership, security_guarantee,
recognition, non_recognition) toward B and B's relations file has no row of the same
type toward A, B gets the mirrored row with `mirrored_from: A`.
Only actors with a full card are touched; stubs wait for their own agent.
"""
import sys
import time
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "data"
RECIP = {"ally": "ally", "reluctant_ally": "reluctant_ally", "partner": "partner", "reluctant_partner": "reluctant_partner",
         "neutral": "neutral", "rival": "rival", "adversary": "adversary", "claimed_territory": "rival"}
LOWER = {"A": "B", "B": "C", "C": "C"}
MIRROR_TYPES = {"treaty", "membership", "security_guarantee"}   # recognition is directional, never mirrored


class Dumper(yaml.SafeDumper):
    pass


def load(p):
    try:
        return yaml.safe_load(p.open(encoding="utf-8")) if p.exists() else None
    except yaml.YAMLError:
        print("skipping half-written file:", p.name, file=sys.stderr)
        return None


def main(write):
    today = time.strftime("%Y-%m-%d")
    actors = {p.stem: load(p) for p in (D / "actors").glob("*.yaml")}
    full = {k for k, v in actors.items() if v and v.get("card") == "full"}
    # never touch an actor an agent is writing right now
    q = load(D / "queue.yaml") or {"actors": []}
    running = {x["id"] for x in q["actors"] if x.get("status") == "running"}
    full -= running
    stances = {p.stem: v for p in (D / "stances").glob("*.yaml") if not p.stem.startswith("_") and (v := load(p))}
    relations = {p.stem: v for p in (D / "relations").glob("*.yaml") if not p.stem.startswith("_") and (v := load(p))}
    added_st, added_rel = [], []

    for a, s in stances.items():
        if a in running:          # a draft is not evidence yet
            continue
        for st in s.get("stances", []):
            b = st["toward"]
            if b not in full or st.get("grade") not in RECIP or st.get("reciprocal_of"):
                continue
            tgt = stances.setdefault(b, {"actor": b, "stances": []})
            if any(x["toward"] == a for x in tgt["stances"]):
                continue
            tgt["stances"].append({
                "toward": a, "grade": RECIP[st["grade"]], "trend": st.get("trend", "stable"), "bond": st.get("bond", "unknown"),
                "since": st.get("since"), "last_verified": today, "confidence": LOWER.get(st.get("confidence", "C"), "C"),
                "reciprocal_of": a,
                "note": f"Provisional reciprocal of {actors[a]['name']}'s '{st['grade']}' stance toward {actors[b]['name']}, written on {today} by tools/reciprocate.py from the same evidence; to be rewritten from {actors[b]['name']}'s side.",
                "sources": st.get("sources", [])})
            added_st.append((b, a, RECIP[st["grade"]]))

    for a, r in relations.items():
        if a in running:
            continue
        for row in r.get("relations", []):
            b = row.get("to")
            if b not in full or row.get("layer") != "alignment" or row.get("type") not in MIRROR_TYPES or row.get("mirrored_from"):
                continue
            tgt = relations.setdefault(b, {"from": b, "relations": []})
            if any(x.get("to") == a and x.get("type") == row["type"] for x in tgt["relations"]):
                continue
            new = {k: v for k, v in row.items() if k not in ("to", "stale")}
            new.update({"to": a, "mirrored_from": a, "last_verified": today})
            tgt["relations"].append(new)
            added_rel.append((b, a, row["type"]))

    print(f"{len(added_st)} reciprocal stances, {len(added_rel)} mirrored rows" + ("" if write else " (dry run)"))
    for b, a, g in added_st:
        print(f"  stance {b} -> {a}: {g}")
    for b, a, t in added_rel:
        print(f"  row    {b} -> {a}: {t}")
    if write:
        touched = {b for b, _, _ in added_st}
        for b in touched:
            (D / "stances" / f"{b}.yaml").write_text(yaml.safe_dump(stances[b], sort_keys=False, allow_unicode=True, width=200), encoding="utf-8")
        touched = {b for b, _, _ in added_rel}
        for b in touched:
            (D / "relations" / f"{b}.yaml").write_text(yaml.safe_dump(relations[b], sort_keys=False, allow_unicode=True, width=200), encoding="utf-8")


if __name__ == "__main__":
    main("--write" in sys.argv)
