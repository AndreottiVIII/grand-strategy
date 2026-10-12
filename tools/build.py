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
UNGA = DATA / "datasets" / "unga"
UNGA_SOURCE = "https://digitallibrary.un.org/record/{id}"
AFFINITY_WITH = ["USA", "RUS", "CHN"]

ACTOR_TYPES = {"state", "org", "armed-non-state", "state-instrument", "sub-state"}
GRADES = [
    "own_territory", "claimed_territory", "ally", "reluctant_ally", "partner",
    "reluctant_partner", "neutral", "rival", "adversary",
]
TRENDS = {"warming", "stable", "cooling"}
BONDS = {"kin", "affinity", "none", "grievance", "unknown"}   # unknown only on dataset-derived stances
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


def load_unga():
    """UN General Assembly recorded votes harvested from the UN Digital Library
    (data/datasets/unga/<year>.json, see tools/datasets/README.md). Returns the vote
    records with a per-country dict, plus the landmark list."""
    records = []
    for p in sorted(UNGA.glob("*.json")) if UNGA.exists() else []:
        with p.open(encoding="utf-8") as f:
            y = json.load(f)
        for r in y["records"]:
            if r["y"] + r["n"] + r["a"] == 0 or not str(r["date"]).startswith(str(y["year"])):
                continue   # adopted without a vote, or a record filed under the wrong year
            r["votes"] = {c: v for c, v in zip(y["countries"], r["v"]) if v in ("Y", "N", "A")}
            records.append(r)
    lm = DATA / "datasets" / "unga-landmarks.yaml"
    landmarks = yaml.safe_load(lm.open(encoding="utf-8"))["landmarks"] if lm.exists() else []
    return records, landmarks


def unga_rows_and_affinity(records, landmarks, actors):
    """Landmark votes become action rows (type un_vote) for every actor that voted,
    directed at the actors the resolution is about. Every recorded vote feeds the
    affinity figures: share of votes cast the same way as each other member."""
    by_symbol = {r["sym"]: r for r in records}
    rows = []
    word = {"Y": "YES", "N": "NO", "A": "ABSTAINED"}
    for lm in landmarks:
        r = by_symbol.get(lm["symbol"])
        if not r:
            warn(f"landmark {lm['symbol']} not in the UNGA dataset")
            continue
        for aid in actors:
            v = r["votes"].get(aid)
            if not v:
                continue
            for about in lm["about"]:
                if about not in actors or about == aid:
                    continue
                # compact on purpose: thousands of these; the site recomposes summary and source from unga.resolutions
                rows.append({"from": aid, "to": about, "layer": "action", "type": "un_vote", "since": r["date"],
                             "confidence": "A", "symbol": r["sym"], "vote": v, "dataset": "unga-votes"})
    # affinity matrix over every member that voted: share of identical votes, pairs with >= 20 common votes
    members = sorted({c for r in records for c in r["votes"]})
    idx = {c: i for i, c in enumerate(members)}
    same = [[0] * len(members) for _ in members]
    both = [[0] * len(members) for _ in members]
    for r in records:
        items = list(r["votes"].items())
        for i in range(len(items)):
            ci, vi = items[i]
            for j in range(i + 1, len(items)):
                cj, vj = items[j]
                a, b = idx[ci], idx[cj]
                both[a][b] += 1
                if vi == vj:
                    same[a][b] += 1
    affinity = {}
    for a, ca in enumerate(members):
        row = {}
        for b, cb in enumerate(members):
            if a == b:
                continue
            x, y = (a, b) if a < b else (b, a)
            if both[x][y] >= 20:
                row[cb] = round(same[x][y] / both[x][y], 2)
        affinity[ca] = row
    span = (min(r["date"] for r in records)[:4] + "-" + max(r["date"] for r in records)[:4]) if records else None
    landmark_votes = {aid: [{"symbol": lm["symbol"], "label": lm["label"], "date": by_symbol[lm["symbol"]]["date"],
                             "vote": by_symbol[lm["symbol"]]["votes"].get(aid, "-"), "url": UNGA_SOURCE.format(id=by_symbol[lm["symbol"]]["id"])}
                            for lm in landmarks if lm["symbol"] in by_symbol] for aid in actors if aid in idx}
    resolutions = {lm["symbol"]: {"label": lm["label"], "date": by_symbol[lm["symbol"]]["date"], "url": UNGA_SOURCE.format(id=by_symbol[lm["symbol"]]["id"]),
                                  "tally": f"{by_symbol[lm['symbol']]['y']}-{by_symbol[lm['symbol']]['n']}-{by_symbol[lm['symbol']]['a']}"}
                   for lm in landmarks if lm["symbol"] in by_symbol}
    return rows, {"span": span, "n_records": len(records), "members": members, "affinity": affinity, "landmarks": landmark_votes, "resolutions": resolutions}


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
        dataset_file = fid.startswith("_")
        if not dataset_file and (r.get("from") != fid or fid not in actors):
            err(f"{w}: from '{r.get('from')}' unknown or mismatched")
        for i, rel in enumerate(r.get("relations") or []):
            if dataset_file:
                if rel.get("from") not in actors:
                    warn(f"{w}[{i}]: from '{rel.get('from')}' has no actor file, row skipped")
                    continue
                fid = rel["from"]
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
            check_date(rel.get("since"), f"{ww} since", required=not rel.get("dataset"))  # datasets may not know the start
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

    # --- datasets: UN General Assembly votes
    records, landmarks = load_unga()
    unga_rows, unga = unga_rows_and_affinity(records, landmarks, actors)
    hand_symbols = {(r["from"], r["to"], sym) for r in rows if r["type"] == "un_vote"
                    for sym in re.findall(r"A/RES/[A-Z0-9./-]+", r.get("summary", ""))}
    unga_rows = [r for r in unga_rows if (r["from"], r["to"], r["symbol"]) not in hand_symbols]
    for r in unga_rows:
        r["stale"] = False
    rows.extend(unga_rows)

    # --- derived stances: co-members of a defence alliance are treaty allies (dataset, bond unknown)
    ALLIANCES = {
        "org-nato": ("NATO", "Article 5 of the North Atlantic Treaty", "https://www.nato.int/cps/en/natohq/official_texts_17120.htm"),
        "org-csto": ("CSTO", "Article 4 of the Collective Security Treaty", "https://en.odkb-csto.org/documents/documents/dogovor_o_kollektivnoy_bezopasnosti/"),
        "org-eu": ("EU", "Article 42(7) TEU (mutual assistance)", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12016M042"),
    }
    members_of = {}
    for rel in rows:
        # only full memberships from the dataset count; a hand-written row (e.g. Partnership for Peace) never makes an ally
        if rel["layer"] == "alignment" and rel["type"] == "membership" and rel["to"] in ALLIANCES and rel.get("dataset") == "wikidata":
            members_of.setdefault(rel["to"], set()).add(rel["from"])
    derived = 0
    for org, (name, article, url) in ALLIANCES.items():
        for a in members_of.get(org, ()):
            existing = {st["toward"] for st in (stances.get(a) or {}).get("stances", [])}
            for b in members_of[org]:
                if a == b or b in existing:
                    continue
                st = {"toward": b, "grade": "ally", "trend": "stable", "bond": "unknown", "since": None, "last_verified": today.isoformat(),
                      "confidence": "A", "dataset": "wikidata-memberships",
                      "note": f"Treaty ally: both members of {name} ({article}). Posture and bond not assessed; this is the floor, not the reading.",
                      "sources": [{"url": url, "title": article, "publisher": name, "date": today.isoformat(), "tier": 1, "dataset": "wikidata-memberships"}],
                      "stale": False}
                stances.setdefault(a, {"actor": a, "stances": []})["stances"].append(st)
                existing.add(b)
                derived += 1
    if derived:
        warnings.append(f"{derived} ally stances derived from alliance memberships (NATO, CSTO, EU)")

    # --- reciprocal allies (Davide, 2026-10-12): an alliance is mutual. If A's hand-written stance grades B `ally`
    # and B has no stance toward A, B gets the reciprocal with the same sources, one confidence grade lower,
    # flagged `reciprocal`, so the map never shows an alliance from one side only. Rivalries are never mirrored.
    lower = {"A": "B", "B": "C", "C": "C"}
    # Davide, 2026-10-12: every grade gets its provisional reciprocal, not only ally; territorial grades map to rival/none
    RECIP = {"ally": "ally", "reluctant_ally": "reluctant_ally", "partner": "partner", "reluctant_partner": "reluctant_partner",
             "neutral": "neutral", "rival": "rival", "adversary": "adversary", "claimed_territory": "rival"}
    recip = 0
    for a, s in list(stances.items()):
        for st in s.get("stances", []):
            if st.get("dataset") or st.get("grade") not in RECIP:
                continue
            b = st["toward"]
            if b not in actors:
                continue
            existing = {x["toward"] for x in (stances.get(b) or {}).get("stances", [])}
            if a in existing:
                continue
            stances.setdefault(b, {"actor": b, "stances": []})["stances"].append({
                "toward": a, "grade": RECIP[st["grade"]], "trend": st.get("trend", "stable"), "bond": st.get("bond", "unknown"),
                "since": st.get("since"), "last_verified": st.get("last_verified"), "confidence": lower.get(st.get("confidence", "C"), "C"),
                "dataset": "reciprocal", "stale": st.get("stale", False),
                "note": f"Reciprocal of {actors[a]['name']}'s '{st['grade']}' stance toward {actors[b]['name']}, provisional and not yet written from this side; same evidence. ",
                "sources": st.get("sources", [])})
            recip += 1
            warn(f"{b} -> {a}: reciprocal '{RECIP[st['grade']]}' stance added from {a}'s card; write {b}'s own side in the reverse pass")
    if recip:
        warnings.append(f"{recip} reciprocal stances added")

    # --- structural checks (ONTOLOGY.md: the grade follows the structural position)
    grade = {(a, st["toward"]): st["grade"] for a, s in stances.items() for st in s.get("stances") or []}
    allies = {}
    SECURITY = re.compile(r"defen[cs]e|military|security|alliance|mutual assistance|article 5", re.I)
    for rel in rows:
        if rel["layer"] != "alignment":
            continue
        binding = (rel["type"] == "security_guarantee"
                   or (rel["type"] == "membership" and rel["to"] in ("org-nato", "org-csto", "org-eu"))
                   or (rel["type"] == "treaty" and SECURITY.search(rel.get("summary", ""))))
        if binding:   # trade agreements and cooperation memoranda do not make allies
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
        "unga": unga,
        "progress": (lambda q: {"cards": sum(1 for a in q if a["status"] in ("done", "reviewed")), "total": len(q),
                                "running": [a["id"] for a in q if a["status"] == "running"]})(
            (yaml.safe_load((DATA / "queue.yaml").open(encoding="utf-8")) or {}).get("actors", []) if (DATA / "queue.yaml").exists() else []),
        "issues": (yaml.safe_load((DATA / "issues.yaml").open(encoding="utf-8")) or {}).get("issues", []) if (DATA / "issues.yaml").exists() else [],
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":"), default=str), encoding="utf-8")
    # one self-contained bundle per actor, so any future front end can read a state without the whole atlas
    bundles = ROOT / "docs" / "actors"
    bundles.mkdir(exist_ok=True)
    for aid, a in actors.items():
        b = {"actor": a, "stances": out["stances"].get(aid, []),
             "stances_toward": [dict(st, actor=k) for k, v in out["stances"].items() for st in v if st["toward"] == aid],
             "relations_from": [r for r in rows if r["from"] == aid], "relations_to": [r for r in rows if r["to"] == aid],
             "unga": {"affinity": unga["affinity"].get(aid), "landmarks": unga["landmarks"].get(aid)}, "generated": today.isoformat()}
        (bundles / f"{aid}.json").write_text(json.dumps(b, ensure_ascii=False, separators=(",", ":"), default=str), encoding="utf-8")
    # cache-busting: rewrite ?v= stamps in docs/index.html so GitHub Pages visitors get the new files
    idx = ROOT / "docs" / "index.html"
    stamp = __import__("datetime").datetime.now().strftime("%Y%m%d%H%M")
    html = re.sub(r'((?:style\.css|app\.js))(\?v=\d+)?', lambda m: f"{m.group(1)}?v={stamp}", idx.read_text(encoding="utf-8"))
    idx.write_text(html, encoding="utf-8")
    full = sum(1 for a in actors.values() if a.get("card") == "full")
    print(f"OK  {len(actors)} actors ({full} full), "
          f"{sum(len(v) for v in out['stances'].values())} stances, {len(rows)} relations "
          f"({len(unga_rows)} from UNGA votes, {unga['n_records']} recorded votes loaded), "
          f"{len(warnings)} warning(s) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
