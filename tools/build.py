"""Compile data/ into docs/data.json and validate it against ONTOLOGY.md.

Usage: python tools/build.py          (from the repo root)
Exit code 1 on any validation error; warnings do not fail the build.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "docs" / "data.json"

ACTOR_TYPES = {"state", "org", "armed-non-state", "state-instrument", "sub-state"}
GRADES = [
    "own_territory", "claimed_territory", "ally", "reluctant_ally", "partner",
    "reluctant_partner", "neutral", "rival", "adversary",
]
TRENDS = {"warming", "stable", "cooling"}
BONDS = {"kin", "affinity", "none", "grievance"}
FRIENDLY = {"ally", "reluctant_ally", "partner"}
HOSTILE = {"adversary", "claimed_territory"}
BINDING = {"treaty", "membership", "security_guarantee"}
CONFIDENCE = {"A", "B", "C"}
TYPES = {
    "objective": {"territorial_claim", "recognition_sought", "recognition_denied",
                  "regime_goal", "influence_goal", "membership_goal"},
    "alignment": {"treaty", "membership", "candidate", "security_guarantee",
                  "recognition", "non_recognition"},
    "dependency": {"energy_import", "energy_export", "trade_share", "debt", "arms_supply",
                   "remittances", "investment", "military_presence"},
    "action": {"un_vote", "sanction", "visit", "exercise", "expulsion", "agreement", "incident"},
}
DATE_RE = re.compile(r"^\d{4}(-\d{2}(-\d{2})?)?$")
STALE_DAYS = 365

errors, warnings = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def check_date(value, where, required=True):
    if value is None:
        if required:
            err(f"{where}: missing date")
        return
    s = str(value)
    if not DATE_RE.match(s):
        err(f"{where}: bad date '{s}' (want YYYY, YYYY-MM or YYYY-MM-DD)")


def check_sources(sources, where):
    if not sources:
        err(f"{where}: no sources (a row without a source does not exist)")
        return
    for i, s in enumerate(sources):
        w = f"{where} source[{i}]"
        for k in ("url", "title", "publisher", "date", "tier"):
            if k not in s or s[k] in (None, ""):
                err(f"{w}: missing {k}")
        if "tier" in s and s["tier"] not in (1, 2, 3, 4):
            err(f"{w}: tier must be 1-4")
        if "date" in s:
            check_date(s["date"], w)


def check_claim(item, where):
    if item.get("confidence") not in CONFIDENCE:
        err(f"{where}: confidence must be A, B or C")
    check_sources(item.get("sources"), where)


def stale(last_verified, today):
    s = str(last_verified)
    parts = [int(p) for p in s.split("-")]
    while len(parts) < 3:
        parts.append(1)
    return (today - date(*parts)).days > STALE_DAYS


def load_dir(sub):
    out = {}
    for p in sorted((DATA / sub).glob("*.yaml")):
        with p.open(encoding="utf-8") as f:
            out[p.stem] = yaml.safe_load(f)
    return out


def main():
    today = date.today()
    actors = load_dir("actors")
    stances = load_dir("stances")
    relations = load_dir("relations")

    # --- actors
    for fid, a in actors.items():
        w = f"actors/{fid}"
        if a.get("id") != fid:
            err(f"{w}: id '{a.get('id')}' does not match file name")
        for k in ("name", "type", "seat", "coords", "regions", "card"):
            if k not in a:
                err(f"{w}: missing {k}")
        c = a.get("coords")
        if not (isinstance(c, list) and len(c) == 2 and -180 <= c[0] <= 180 and -90 <= c[1] <= 90):
            err(f"{w}: coords must be [lon, lat]")
        if a.get("type") not in ACTOR_TYPES:
            err(f"{w}: unknown type '{a.get('type')}'")
        if a.get("card") not in ("full", "stub"):
            err(f"{w}: card must be 'full' or 'stub'")
        if a.get("card") == "full":
            gs = a.get("grand_strategy") or {}
            for section in ("objectives", "means", "constraints", "paradoxes"):
                items = gs.get(section) or []
                if not items:
                    err(f"{w}: full card without {section}")
                for i, it in enumerate(items):
                    check_claim(it, f"{w} {section}[{i}]")
            if not gs.get("reading"):
                warn(f"{w}: no reading")
            check_date(a.get("last_verified"), f"{w} last_verified")
            a["stale"] = stale(a["last_verified"], today) if a.get("last_verified") else True

    # --- stances
    for fid, s in stances.items():
        w = f"stances/{fid}"
        if s.get("actor") != fid or fid not in actors:
            err(f"{w}: actor '{s.get('actor')}' unknown or mismatched")
        seen = set()
        for i, st in enumerate(s.get("stances") or []):
            ww = f"{w}[{i}] toward {st.get('toward')}"
            if st.get("toward") not in actors:
                err(f"{ww}: unknown actor")
            if st.get("toward") in seen:
                err(f"{ww}: duplicate stance")
            seen.add(st.get("toward"))
            if st.get("grade") not in GRADES:
                err(f"{ww}: unknown grade '{st.get('grade')}'")
            if st.get("trend") not in TRENDS:
                err(f"{ww}: trend must be warming, stable or cooling")
            if st.get("bond") not in BONDS:
                err(f"{ww}: bond must be kin, affinity, none or grievance")
            check_date(st.get("since"), f"{ww} since")
            check_date(st.get("last_verified"), f"{ww} last_verified")
            check_claim(st, ww)
            st["stale"] = stale(st["last_verified"], today) if st.get("last_verified") else True

    # --- relations
    rows = []
    for fid, r in relations.items():
        w = f"relations/{fid}"
        if r.get("from") != fid or fid not in actors:
            err(f"{w}: from '{r.get('from')}' unknown or mismatched")
        for i, rel in enumerate(r.get("relations") or []):
            ww = f"{w}[{i}] -> {rel.get('to')} {rel.get('layer')}/{rel.get('type')}"
            if rel.get("to") not in actors:
                err(f"{ww}: unknown actor")
            layer = rel.get("layer")
            if layer not in TYPES:
                err(f"{ww}: unknown layer")
            elif rel.get("type") not in TYPES[layer]:
                err(f"{ww}: type not in the {layer} vocabulary")
            if not rel.get("summary"):
                err(f"{ww}: missing summary")
            check_date(rel.get("since"), f"{ww} since")
            check_date(rel.get("until"), f"{ww} until", required=False)
            check_date(rel.get("last_verified"), f"{ww} last_verified")
            if layer == "dependency" and ("value" not in rel or "unit" not in rel):
                err(f"{ww}: dependency rows need value and unit")
            check_claim(rel, ww)
            rel["from"] = fid
            rel["stale"] = stale(rel["last_verified"], today) if rel.get("last_verified") else True
            rows.append(rel)

    for fid in actors:
        if actors[fid].get("card") == "full" and fid not in stances:
            warn(f"{fid}: full card but no stances file")

    # --- structural checks (ONTOLOGY.md: the grade follows the structural position)
    grade = {(a, st["toward"]): st["grade"] for a, s in stances.items() for st in s.get("stances") or []}
    allies = {}
    for rel in rows:
        if rel["layer"] == "alignment" and rel["type"] in BINDING:
            allies.setdefault(rel["from"], set()).add(rel["to"])
            allies.setdefault(rel["to"], set()).add(rel["from"])
    for (a, b), g in grade.items():
        if g in FRIENDLY:
            for c in allies.get(b, ()):
                if grade.get((a, c)) in HOSTILE:
                    warn(f"{a} grades {b} '{g}' but {b} is bound by treaty to {c}, which {a} grades "
                         f"'{grade[(a, c)]}' - partner of an adversary's ally; justify in the note")
            if grade.get((b, a)) in HOSTILE:
                warn(f"{a} grades {b} '{g}' while {b} grades {a} '{grade[(b, a)]}' - asymmetric pair")

    for m in warnings:
        print("WARN ", m)
    for m in errors:
        print("ERROR", m)
    if errors:
        print(f"\n{len(errors)} error(s). Nothing written.")
        sys.exit(1)

    out = {
        "generated": today.isoformat(),
        "grades": GRADES,
        "layers": list(TYPES.keys()),
        "actors": list(actors.values()),
        "stances": {k: v["stances"] for k, v in stances.items()},
        "relations": rows,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    full = sum(1 for a in actors.values() if a.get("card") == "full")
    print(f"OK  {len(actors)} actors ({full} full), "
          f"{sum(len(v) for v in out['stances'].values())} stances, {len(rows)} relations, "
          f"{len(warnings)} warning(s) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
