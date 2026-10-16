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


def running_actors():
    """Actors an agent is writing right now (data/queue.yaml): with --skip-running their
    half-written stance and relation files are left out and their card is published as a stub,
    so the site can be rebuilt while the world run is in progress."""
    if "--skip-running" not in sys.argv:
        return set()
    q = DATA / "queue.yaml"
    if not q.exists():
        return set()
    acts = (yaml.safe_load(q.open(encoding="utf-8")) or {}).get("actors", [])
    return {a["id"] for a in acts if a.get("status") == "running"}


def load_dir(sub):
    out = {}
    skip = running_actors()
    for p in sorted((DATA / sub).glob("*.yaml")):
        if p.stem in skip and sub in ("stances", "relations"):
            print(f"SKIP  {sub}/{p.name} (agent running)", file=sys.stderr)
            continue
        try:
            with p.open(encoding="utf-8") as f:
                out[p.stem] = yaml.safe_load(f)
        except yaml.YAMLError:
            if p.stem in skip:
                print(f"SKIP  {sub}/{p.name} (half-written)", file=sys.stderr)
                continue
            raise
        if sub == "actors" and p.stem in skip and out[p.stem] and out[p.stem].get("card") == "full":
            out[p.stem]["card"] = "stub"
            out[p.stem].pop("grand_strategy", None)
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
            if st.get("alignment") not in (None, "de_facto"):
                err(f"{w} alignment: {st.get('alignment')!r} (only de_facto, hand-written)")
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

    # --- datasets: weight (World Bank: GDP and military spending shares of the world) and borders
    # (Wikidata P47). Davide, 2026-10-16: the weight from one important database, the neighbours for encirclement.
    WB = DATA / "datasets" / "worldbank" / "weight.json"
    weight_ds = json.loads(WB.read_text(encoding="utf-8")) if WB.exists() else {"actors": {}, "source": {}, "world": {}}
    weight = {a: r["weight"] for a, r in weight_ds["actors"].items() if a in actors}
    BD = DATA / "datasets" / "wikidata" / "borders.json"
    borders_ds = json.loads(BD.read_text(encoding="utf-8")) if BD.exists() else {"borders": {}, "source": {}}
    borders = {a: [b for b in v if b in actors] for a, v in borders_ds["borders"].items() if a in actors}

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
    # Davide, 2026-10-16: the mirror is structural, not a copy. An alliance comes back as ally only where a
    # treaty binds the pair (the dataset floor); otherwise a small state's "ally" is the patron's partner.
    # Reluctance is felt by the side that wrote it, so it is not mirrored. Bond and trend are never copied.
    RECIP = {"ally": "partner", "reluctant_ally": "partner", "partner": "partner", "reluctant_partner": "partner",
             "neutral": "neutral", "rival": "rival", "adversary": "adversary", "claimed_territory": "rival"}
    def mirror_grade(a, b, g):
        if g in ("ally", "reluctant_ally"):
            for x in (stances.get(b) or {}).get("stances", []):
                if x["toward"] == a and x.get("dataset") == "wikidata-memberships" and x["grade"] == "ally":
                    return "ally"
        return RECIP[g]
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
            mg = mirror_grade(a, b, st["grade"])
            stances.setdefault(b, {"actor": b, "stances": []})["stances"].append({
                "toward": a, "grade": mg, "trend": "stable", "bond": "unknown",
                "since": st.get("since"), "last_verified": st.get("last_verified"), "confidence": "C",
                "dataset": "reciprocal", "stale": st.get("stale", False),
                "note": f"{actors[b]['name']} has not written its reading of {actors[a]['name']}; the atlas mirrors {actors[a]['name']}'s '{st['grade'].replace('_', ' ')}' reading as '{mg.replace('_', ' ')}' at low confidence, on the same evidence. Bond and trend are not assessed from this side.",
                "sources": st.get("sources", [])})
            recip += 1
            warn(f"{b} -> {a}: mirrored '{mg}' stance added from {a}'s card; write {b}'s own side if the silence matters")
    if recip:
        warnings.append(f"{recip} reciprocal stances added")

    # --- structural checks (ONTOLOGY.md: the grade follows the structural position)
    grade = {(a, st["toward"]): st["grade"] for a, s in stances.items() for st in s.get("stances") or []}
    allies = {}
    SECURITY = re.compile(r"defen[cs]e|military|security|alliance|mutual assistance|article 5", re.I)
    # a summary that denies the clause ("no military clause", "not a defence pact") is not a binding treaty
    DENIED = re.compile(r"\b(no|not an?|without( any)?|neither)\s+(binding\s+)?(mutual[- ])?(defen[cs]e|military|security|alliance)", re.I)
    for rel in rows:
        if rel["layer"] != "alignment":
            continue
        summary = rel.get("summary", "")
        binding = (rel["type"] == "security_guarantee"
                   or (rel["type"] == "membership" and rel["to"] in ("org-nato", "org-csto", "org-eu"))
                   or (rel["type"] == "treaty" and SECURITY.search(summary) and not DENIED.search(summary)))
        if rel.get("binding") is False:   # a row may state that the treaty binds nobody to anybody's defence
            binding = False
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

    # --- seams (Luttwak: the seam between an adversary and its allies is where relational manoeuvre
    # aims): A hostile to X while A and X are both allies of Y, so Y is pulled two ways. Only from
    # hand-written stances of confidence A or B; provisional reciprocals and dataset stances never count.
    # every leg must be a written reading (A or B): the treaty floor alone never makes a seam, or
    # every NATO member would be "pulled" between Cyprus and Turkey (Davide, 2026-10-13)
    hand, defacto = {}, set()   # defacto: hand-written alignment without a treaty (ONTOLOGY, 2026-10-16)
    for a, v in stances.items():
        for st in v["stances"]:
            if st.get("dataset") or st.get("reciprocal_of") or st.get("confidence") not in ("A", "B"):
                continue
            hand[(a, st["toward"])] = st["grade"]
            if st.get("alignment") == "de_facto":
                defacto.add((a, st["toward"]))
    SEAM_HOSTILE, SEAM_ALLIED = {"rival", "adversary"}, {"ally", "reluctant_ally"}
    is_org_id = lambda i: (actors.get(i) or {}).get("type") == "org"
    seams, seen = [], set()
    # an alliance leg counts if either side declares it (A says Y is its ally, or Y says A is)
    def allied(p, q):
        for g in (hand.get((p, q)), hand.get((q, p))):
            if g in SEAM_ALLIED:
                return g
        if (p, q) in defacto or (q, p) in defacto:
            return "de_facto"
        return None
    ids = {k[0] for k in hand} | {k[1] for k in hand}
    for (a, x), g in hand.items():
        if g not in SEAM_HOSTILE:
            continue
        for y in ids:
            if y in (a, x):
                continue
            gay, gxy = allied(a, y), allied(x, y)
            if gay and gxy:
                key = (frozenset((a, x)), y)
                if key in seen:
                    continue
                seen.add(key)
                seams.append({"a": a, "x": x, "y": y, "ax": g, "ay": gay, "xy": gxy})
    seams.sort(key=lambda s: (s["y"], s["a"], s["x"]))

    # --- buffers (Davide, 2026-10-16): the lighter tier under the seams. Y is a partner (or reluctant
    # partner) of both A and X while A and X are hostile to each other: the state between two rivals
    # that belongs to neither, Luttwak's buffer in the Roman sense. Same evidence rules as seams; a pair
    # already counted as a seam is not a buffer. A de facto alignment counts as the stronger leg.
    BUFFER_LEG = {"partner", "reluctant_partner"}
    def partnered(p, q):
        for g in (hand.get((p, q)), hand.get((q, p))):
            if g in BUFFER_LEG:
                return g
        return None
    seam_keys = {(frozenset((s["a"], s["x"])), s["y"]) for s in seams}
    buffers, seen_b = [], set()
    for (a, x), g in hand.items():
        if g not in SEAM_HOSTILE:
            continue
        for y in ids:
            if y in (a, x) or is_org_id(y):
                continue
            lay, lxy = allied(a, y) or partnered(a, y), allied(x, y) or partnered(x, y)
            if not (lay and lxy):
                continue
            key = (frozenset((a, x)), y)
            if key in seen_b or key in seam_keys:
                continue
            seen_b.add(key)
            buffers.append({"a": a, "x": x, "y": y, "ax": g, "ay": lay, "xy": lxy})
    buffers.sort(key=lambda s: (s["y"], s["a"], s["x"]))

    # --- clients (Luttwak's client system): for every pair with both sides written (A or B), the
    # lean is how many steps higher A grades X than X grades A; only pairs where at least one side is
    # an alliance count, and the higher-grading side is the client, the other the patron.
    SCALE = {"ally": 4, "reluctant_ally": 3, "partner": 2, "reluctant_partner": 1, "neutral": 0, "rival": -1, "adversary": -2}
    handst = {}
    for a, v in stances.items():
        for st in v["stances"]:
            if st.get("dataset") or st.get("reciprocal_of") or st.get("confidence") not in ("A", "B") or st["grade"] not in SCALE:
                continue
            handst[(a, st["toward"])] = st
    handterr = {}   # hand-written A/B claims on territory: not on the lean scale, but they count for the faults
    for a, v in stances.items():
        for st in v["stances"]:
            if st.get("dataset") or st.get("reciprocal_of") or st.get("confidence") not in ("A", "B") or st["grade"] != "claimed_territory":
                continue
            handterr[(a, st["toward"])] = st
    first = lambda t: re.split(r"(?<=[.;])\s", str(t or ""), 1)[0][:220]
    readby = {}   # weight proxy: how many hand-written stances point at an actor
    for (a, x) in handst:
        readby[x] = readby.get(x, 0) + 1
    clients, tepid = [], []
    for (a, x), st in handst.items():
        back = handst.get((x, a))
        if not back:
            continue
        lean = SCALE[st["grade"]] - SCALE[back["grade"]]
        aligned = st.get("alignment") == "de_facto" or back.get("alignment") == "de_facto"
        if lean <= 0 or (max(SCALE[st["grade"]], SCALE[back["grade"]]) < 3 and not aligned):
            continue
        # two allies who differ only in warmth (ally / reluctant ally) are not a client system but a
        # tepid alliance: listed apart (Davide, 2026-10-16: the US cannot read as a client of the UK)
        if SCALE[back["grade"]] >= 3:
            tepid.append({"warm": a, "tepid": x, "wg": st["grade"], "tg": back["grade"], "wb": st.get("bond"), "tb": back.get("bond"),
                          "wnote": first(st.get("note")), "tnote": first(back.get("note"))})
            continue
        # a patron must carry more weight than its client; the proxy is how many cards read each actor
        if readby.get(x, 0) * 2 < readby.get(a, 0):
            continue
        clients.append({"client": a, "patron": x, "lean": lean, "cg": st["grade"], "pg": back["grade"], "cb": st.get("bond"), "pb": back.get("bond"),
                        "cnote": first(st.get("note")), "pnote": first(back.get("note"))})
    clients.sort(key=lambda c: (-c["lean"], c["patron"], c["client"]))
    tepid.sort(key=lambda t: (t["tepid"], t["warm"]))

    # --- faults (Luttwak's levels: the bond is the deep level, the posture the surface; where they
    # contradict each other the relationship rests on a fault). feud = kin + hostile; byzantine =
    # grievance + allied; strained = kin + reluctant (a warning, not a fault). Hand-written A/B only.
    # A claim on kin territory (claimed_territory + kin) is a feud too: the claim denies the other's statehood (Davide, 2026-10-16, China-Taiwan).
    FAULT_HOSTILE, FAULT_ALLIED = {"rival", "adversary"}, {"ally", "reluctant_ally"}
    faults = []
    for (a, x), st in list(handst.items()) + list(handterr.items()):
        g, b = st["grade"], st.get("bond")
        kind = "feud" if b == "kin" and (g in FAULT_HOSTILE or g == "claimed_territory") else "byzantine" if b == "grievance" and g in FAULT_ALLIED else "strained" if b == "kin" and g in ("reluctant_ally", "reluctant_partner") else None
        if kind:
            faults.append({"a": a, "x": x, "kind": kind, "grade": g, "bond": b, "trend": st.get("trend"), "note": first(st.get("note"))})
    seen_pairs = {}
    for f in faults:
        seen_pairs.setdefault((frozenset((f["a"], f["x"])), f["kind"]), []).append(f)
    for f in faults:
        f["mutual"] = len(seen_pairs[(frozenset((f["a"], f["x"])), f["kind"])]) > 1
    faults.sort(key=lambda f: (f["kind"], not f["mutual"], f["a"], f["x"]))

    # --- gatherings (Luttwak, The Rise of China vs. the Logic of Strategy): the counter-coalition that
    # an actor's weight summons. For every X, the actors that grade it hostile (hand-written A/B,
    # organisations left out: only those who move); maturity = share of pairs among them already
    # allied, by a written reading or by treaty (here the question is whether the coalition exists).
    treaty = set()
    for a, v in stances.items():
        for st in v["stances"]:
            if st.get("dataset") == "wikidata-memberships" and st["grade"] == "ally":
                treaty.add((a, st["toward"]))
    def is_org(i):
        return (actors.get(i) or {}).get("type") == "org"
    def allied_any(p, q):
        return (handst.get((p, q), {}).get("grade") in FAULT_ALLIED or handst.get((q, p), {}).get("grade") in FAULT_ALLIED
                or (p, q) in treaty or (q, p) in treaty
                or handst.get((p, q), {}).get("alignment") == "de_facto" or handst.get((q, p), {}).get("alignment") == "de_facto")
    hostile_to = {}
    for (a, x), st in handst.items():
        if st["grade"] in FAULT_HOSTILE and not is_org(a) and not is_org(x):
            hostile_to.setdefault(x, {})[a] = st["grade"]
    gatherings = []
    for x, members in hostile_to.items():
        ids = sorted(members)
        # Davide, 2026-10-16: a gathering is summoned by a power's weight, so the target is a state and the
        # crowd at least five; the gathering against ISIS or Hamas is a hunt, not a counter-coalition
        if len(ids) < 5 or (actors.get(x) or {}).get("type") != "state":
            continue
        pairs = [(p, q) for i, p in enumerate(ids) for q in ids[i + 1:]]
        allied_pairs = sum(1 for p, q in pairs if allied_any(p, q))
        maturity = allied_pairs / len(pairs)
        rows_ = []
        for m in ids:
            n_allied = sum(1 for o in ids if o != m and allied_any(m, o))
            rows_.append({"id": m, "grade": members[m], "allies_in": n_allied, "enlisted": n_allied >= (len(ids) - 1) / 2})
        nb = set(borders.get(x, []))
        for m in rows_:
            m["w"] = round(weight.get(m["id"], 0.0), 4)
            m["neighbour"] = m["id"] in nb
        # the last to see it (Luttwak on China): the members X itself still reads as neutral, partner or not at all
        unseen = [{"id": m, "grade": handst.get((x, m), {}).get("grade")} for m in ids if handst.get((x, m), {}).get("grade") not in FAULT_HOSTILE]
        gatherings.append({"x": x, "n": len(ids), "maturity": round(maturity, 2), "allied_pairs": allied_pairs, "pairs": len(pairs),
                           "state": "formed" if maturity >= 0.6 else "forming" if maturity >= 0.25 else "waiting", "members": rows_,
                           "weight": round(sum(weight.get(m, 0.0) for m in ids), 4), "x_weight": round(weight.get(x, 0.0), 4),
                           "neighbours": [m for m in ids if m in nb], "n_neighbours": len(nb), "unseen": unseen})
    gatherings.sort(key=lambda g: (-g["weight"], -g["n"], g["x"]))

    # --- encirclement (Luttwak, The Rise of China: the neighbours are the first the logic of strategy summons).
    # For every full card with borders: the neighbours it reads or that read it hostile, the friendly ones
    # (ally, reluctant ally, partner, or treaty), the unread ones. Share = hostile over all neighbours.
    SIEGE_FRIEND = {"ally", "reluctant_ally", "partner"}
    siege = []
    for a, nb in borders.items():
        if (actors.get(a) or {}).get("card") != "full" or not nb:
            continue
        rd = lambda p, q: handst.get((p, q), {}).get("grade")
        hostile = [n for n in nb if rd(a, n) in FAULT_HOSTILE or rd(n, a) in FAULT_HOSTILE]
        friendly = [n for n in nb if n not in hostile and (rd(a, n) in SIEGE_FRIEND or rd(n, a) in SIEGE_FRIEND or (a, n) in treaty or (n, a) in treaty)]
        unread = [n for n in nb if rd(a, n) is None and rd(n, a) is None and (a, n) not in treaty and (n, a) not in treaty]
        siege.append({"a": a, "n": len(nb), "hostile": hostile, "friendly": friendly, "unread": unread,
                      "share": round(len(hostile) / len(nb), 2), "hostile_weight": round(sum(weight.get(n, 0.0) for n in hostile), 4),
                      "friendly_weight": round(sum(weight.get(n, 0.0) for n in friendly), 4), "w": round(weight.get(a, 0.0), 4)})
    siege.sort(key=lambda r: (-r["share"], -r["hostile_weight"], r["a"]))
    # convergences, per actor: who shares one of its rivals and is not its ally (the table it has not sat at)
    convergences = {}
    for a in {k[0] for k in handst}:
        if is_org(a):
            continue
        rivals = {x for (p, x), st in handst.items() if p == a and st["grade"] in FAULT_HOSTILE and not is_org(x)}
        out_ = {}
        for x in rivals:
            for b in hostile_to.get(x, {}):
                if b != a and not allied_any(a, b):
                    out_.setdefault(b, []).append(x)
        if out_:
            convergences[a] = [{"id": b, "shared": sorted(v)} for b, v in sorted(out_.items(), key=lambda kv: (-len(kv[1]), kv[0]))]

    # --- currents (Luttwak's culminating point): the trends are the first derivative of the postures.
    # Per actor: drift = (warming - cooling) / n, turbulence = (warming + cooling) / n, over hand-written
    # A/B stances. Alarms: allies cooling (the culminating point of an alliance), rivals warming.
    # weight of a movement: a relationship that moves with an ally or an adversary weighs far more
    # than one that moves with a partner or a neutral (Davide, 2026-10-13)
    WEIGHT = {"ally": 8, "adversary": 8, "reluctant_ally": 4, "rival": 4, "partner": 2, "reluctant_partner": 1, "neutral": 1, "claimed_territory": 4, "own_territory": 0}   # each step doubles
    per = {}
    allies_cooling, rivals_warming = [], []
    for (a, x), st in handst.items():
        c = per.setdefault(a, {"warming": 0, "cooling": 0, "stable": 0, "w_warming": 0, "w_cooling": 0, "w_all": 0})
        t = st.get("trend") or "stable"
        c[t] = c.get(t, 0) + 1
        w = WEIGHT.get(st["grade"], 1)
        c["w_all"] += w
        if t in ("warming", "cooling"):
            c["w_" + t] += w
        if st["grade"] in FAULT_ALLIED and st.get("trend") == "cooling":
            allies_cooling.append({"a": a, "x": x, "grade": st["grade"], "bond": st.get("bond"), "note": first(st.get("note"))})
        if st["grade"] in FAULT_HOSTILE and st.get("trend") == "warming":
            rivals_warming.append({"a": a, "x": x, "grade": st["grade"], "bond": st.get("bond"), "note": first(st.get("note"))})
    currents = []
    for a, c in per.items():
        n = c["warming"] + c["cooling"] + c["stable"]
        if n and c["w_all"]:
            currents.append({"id": a, "n": n, "warming": c["warming"], "cooling": c["cooling"],
                             "drift": round((c["w_warming"] - c["w_cooling"]) / c["w_all"], 2), "turbulence": round((c["w_warming"] + c["w_cooling"]) / c["w_all"], 2),
                             "w_warming": c["w_warming"], "w_cooling": c["w_cooling"], "w_all": c["w_all"]})
    currents.sort(key=lambda c: (-c["drift"], c["id"]))
    allies_cooling.sort(key=lambda r: (r["a"], r["x"]))
    rivals_warming.sort(key=lambda r: (r["a"], r["x"]))
    # snapshots: the grades of today, kept so the next build can say what changed since
    SNAP = DATA / "snapshots"
    SNAP.mkdir(exist_ok=True)
    snap_now = {f"{a}>{x}": [st["grade"], st.get("trend") or "stable"] for (a, x), st in handst.items()}
    previous = sorted(SNAP.glob("*.json"))
    changes = {"since": None, "grades": [], "trends": []}
    if previous:
        prev_path = previous[-1]
        prev = json.loads(prev_path.read_text(encoding="utf-8"))
        changes["since"] = prev_path.stem
        for k, (g, t) in snap_now.items():
            a, x = k.split(">")
            if k in prev:
                pg, pt = prev[k]
                if pg != g:
                    changes["grades"].append({"a": a, "x": x, "from": pg, "to": g})
                elif pt != t:
                    changes["trends"].append({"a": a, "x": x, "from": pt, "to": t})
    (SNAP / f"{today.isoformat()}.json").write_text(json.dumps(snap_now, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # --- theatres (Luttwak's theatre level): hand-kept spaces where several actors' forces add up
    # (data/theatres.yaml). Heat per theatre, over the pairs of members, on the doubling scale:
    # hostility (rival 4, adversary 8), seams touching the theatre 4, feuds 4, claimed territory 4,
    # movements with stakes (ally cooling, rival warming) 4; divided by the number of possible pairs.
    theatres = []
    tpath = DATA / "theatres.yaml"
    if tpath.exists():
        seam_keys = {(frozenset((sm["a"], sm["x"])), sm["y"]) for sm in seams}
        feud_pairs = {frozenset((f["a"], f["x"])) for f in faults if f["kind"] == "feud"}
        for t in (yaml.safe_load(tpath.open(encoding="utf-8")) or {}).get("theatres", []):
            members = [m for m in t["members"] if m in actors and not is_org(m)]
            mset = set(members)
            pairs = [(p, q) for i, p in enumerate(members) for q in members[i + 1:]]
            if not pairs:
                continue
            heat = {"hostility": 0, "seams": 0, "faults": 0, "claims": 0, "movement": 0, "friction": 0}
            top = []
            for (a, x), st in handst.items():
                if a not in mset or x not in mset:
                    continue
                g, tr = st["grade"], st.get("trend")
                w = 0
                # Davide, 2026-10-13: adversaries very high, rivals high, reluctant postures low
                if g == "adversary":
                    heat["hostility"] += 16; w += 16
                elif g == "rival":
                    heat["hostility"] += 6; w += 6
                elif g == "claimed_territory":
                    heat["claims"] += 6; w += 6
                elif g in ("reluctant_ally", "reluctant_partner"):
                    heat["friction"] += 1; w += 1
                if (g in FAULT_ALLIED and tr == "cooling") or (g in FAULT_HOSTILE and tr == "warming"):
                    heat["movement"] += 3; w += 3
                if w:
                    top.append({"a": a, "x": x, "grade": g, "trend": tr, "weight": w})
            for fp in feud_pairs:
                if fp <= mset:
                    heat["faults"] += 6
            for (ax, y) in seam_keys:
                if ax <= mset and y in mset:
                    heat["seams"] += 4
            total = sum(heat.values())
            top.sort(key=lambda r: (-r["weight"], r["a"], r["x"]))
            written = sum(1 for m in members if (actors[m].get("card") == "full"))
            theatres.append({"id": t["id"], "name": t["name"], "centre": t.get("centre"), "radius": t.get("radius", 6), "label": t.get("label", [12, 0]), "members": members, "cards": written, "pairs": len(pairs),
                             "heat": round(total / len(pairs), 2), "parts": heat, "top": top[:6]})
        theatres.sort(key=lambda t: -t["heat"])
        mx = max((t["heat"] for t in theatres), default=0) or 1
        for t in theatres:
            t["index"] = round(100 * t["heat"] / mx)

    # --- flanks (Luttwak, The Grand Strategy of the Byzantine Empire: do not fight the enemy, find
    # the enemy behind him and pay him). For every actor A and every X it grades hostile, the actors Z
    # that grade X hostile too: recruited if A and Z already read each other friendly (or are bound by
    # treaty or de facto alignment), false if either reads the other hostile, open otherwise. Hand-written
    # A/B only, states and non-state actors only (organisations never move). Davide, 2026-10-16.
    FLANK_HOST, FLANK_FRIEND = {"rival", "adversary"}, {"ally", "reluctant_ally", "partner"}
    hostile_of = {}
    for (a, x), st in handst.items():
        if st["grade"] in FLANK_HOST and not is_org(a):
            hostile_of.setdefault(x, {})[a] = st["grade"]
    flanks, flank_index = [], []
    for a in sorted({k[0] for k in handst}):
        if is_org(a):
            continue
        mine = [(x, st["grade"]) for (p, x), st in handst.items() if p == a and st["grade"] in FLANK_HOST]
        if not mine:
            continue
        counts = {"open": 0, "recruited": 0, "false": 0, "lonely": 0}
        for x, g in mine:
            zs = {z: gz for z, gz in hostile_of.get(x, {}).items() if z != a}
            if not zs:
                counts["lonely"] += 1
            for z, gz in sorted(zs.items()):
                ga = handst.get((a, z), {}).get("grade"); gb = handst.get((z, a), {}).get("grade")
                bound = (a, z) in treaty or (z, a) in treaty or handst.get((a, z), {}).get("alignment") == "de_facto" or handst.get((z, a), {}).get("alignment") == "de_facto"
                kind = "false" if (ga in FLANK_HOST or gb in FLANK_HOST) else "recruited" if (ga in FLANK_FRIEND or gb in FLANK_FRIEND or bound) else "open"
                counts[kind] += 1
                flanks.append({"a": a, "x": x, "ax": g, "z": z, "zx": gz, "kind": kind, "az": ga, "za": gb,
                               "zw": round(weight.get(z, 0.0), 4), "aw": round(weight.get(a, 0.0), 4),
                               "znote": first(handst[(z, x)].get("note"))})
        flank_index.append({"a": a, "enemies": len(mine), **counts})
    flank_index.sort(key=lambda r: (-r["open"], -r["recruited"], r["a"]))
    flanks.sort(key=lambda f: (f["a"], f["kind"], f["x"], f["z"]))
    warnings.append(f"{len(flanks)} flanks for {len(flank_index)} actors ({sum(r['open'] for r in flank_index)} open)")

    # --- levers (Luttwak, From Geopolitics to Geo-Economics, 1990: the logic of conflict in the grammar of
    # commerce). First cut, Davide 2026-10-16: every dependency row that carries a number between two actors
    # of which at least one reads the other rival or adversary (hand-written, A or B). The row is written from
    # the card's side, so it does not say who holds the handle: the summary does. Organisations count here
    # (the EU buys gas), as the dependency is material, not a vote.
    LEVER_KIND = {"energy_import": "energy", "energy_export": "energy", "debt": "debt", "trade_share": "trade", "investment": "investment",
                  "arms_supply": "arms", "military_presence": "bases", "remittances": "remittances"}
    levers, lever_index = [], {}
    for r in rows:
        if r["layer"] != "dependency" or r.get("value") is None:
            continue
        a, x = r["from"], r["to"]
        ax, xa = handst.get((a, x), {}).get("grade"), handst.get((x, a), {}).get("grade")
        if ax not in FAULT_HOSTILE and xa not in FAULT_HOSTILE:
            continue
        levers.append({"a": a, "x": x, "ax": ax, "xa": xa, "type": r["type"], "kind": LEVER_KIND.get(r["type"], r["type"]),
                       "value": r["value"], "unit": r.get("unit"), "summary": r["summary"], "confidence": r.get("confidence"),
                       "since": str(r.get("since") or ""), "stale": bool(r.get("stale")), "w": round(max(weight.get(a, 0.0), weight.get(x, 0.0)), 4)})
        for p in (a, x):
            e = lever_index.setdefault(p, {"a": p, "n": 0, "kinds": {}})
            e["n"] += 1
            e["kinds"][LEVER_KIND.get(r["type"], r["type"])] = e["kinds"].get(LEVER_KIND.get(r["type"], r["type"]), 0) + 1
    levers.sort(key=lambda r: (r["kind"], -r["w"], r["a"], r["x"]))
    lever_index = sorted(lever_index.values(), key=lambda e: (-e["n"], e["a"]))
    warnings.append(f"{len(levers)} levers between rivals for {len(lever_index)} actors")

    # --- stats for the Data page: what the atlas is, counted (Davide, 2026-10-16)
    from collections import Counter
    hand_sts = [st for v in stances.values() for st in v["stances"] if not st.get("dataset") and not st.get("reciprocal_of")]
    all_sts = [st for v in stances.values() for st in v["stances"]]
    src_tier = {}
    def take_sources(items):
        for it in items or []:
            for sr in it.get("sources") or []:
                if sr.get("url") and sr["url"] not in src_tier:
                    src_tier[sr["url"]] = sr.get("tier")
    for a in actors.values():
        gs = a.get("grand_strategy") or {}
        for sec in ("objectives", "means", "constraints", "paradoxes"):
            take_sources(gs.get(sec))
    take_sources(hand_sts)
    take_sources([r for r in rows if not r.get("dataset")])
    site_meta = yaml.safe_load((DATA / "site.yaml").open(encoding="utf-8")) if (DATA / "site.yaml").exists() else {}
    MEMB = DATA / "datasets" / "wikidata" / "memberships.json"
    RECOG = DATA / "datasets" / "wikipedia" / "recognition.json"
    def fdate(p):
        return date.fromtimestamp(p.stat().st_mtime).isoformat() if p.exists() else None
    stats = {
        "actors": {"total": len(actors), "full": sum(1 for a in actors.values() if a.get("card") == "full"),
                   "stub": sum(1 for a in actors.values() if a.get("card") != "full"), "by_type": dict(Counter(a.get("type") for a in actors.values()))},
        "stances": {"total": len(all_sts), "hand": len(hand_sts), "mirrored": sum(1 for st in all_sts if st.get("reciprocal_of")),
                    "dataset": sum(1 for st in all_sts if st.get("dataset")), "de_facto": sum(1 for st in hand_sts if st.get("alignment") == "de_facto"),
                    "confidence": dict(Counter(st.get("confidence") for st in hand_sts)), "grades": dict(Counter(st["grade"] for st in hand_sts)),
                    "trends": dict(Counter(st.get("trend") for st in hand_sts)), "bonds": dict(Counter(st.get("bond") for st in hand_sts)),
                    "stale": sum(1 for st in hand_sts if st.get("stale"))},
        "relations": {"total": len(rows), "hand": sum(1 for r in rows if not r.get("dataset")), "dataset": sum(1 for r in rows if r.get("dataset")),
                      "by_layer": dict(Counter(r["layer"] for r in rows)),
                      "types": dict(Counter(f"{r['layer']}/{r['type']}" for r in rows).most_common()),
                      "dependency_with_number": sum(1 for r in rows if r["layer"] == "dependency" and r.get("value") is not None)},
        "sources": {"unique": len(src_tier), "by_tier": dict(Counter(str(t) for t in src_tier.values()))},
        "datasets": [
            {"name": "States and memberships", "publisher": "Wikidata and the organisations' official lists", "rows": len(json.loads(MEMB.read_text(encoding="utf-8"))) if MEMB.exists() else 0, "date": fdate(MEMB), "tier": 1, "tool": "tools/datasets/wikidata.py"},
            {"name": "Recognition tables", "publisher": "Wikipedia, with its citations", "rows": sum(len(x) for v in json.loads(RECOG.read_text(encoding="utf-8")).values() for x in v.values() if isinstance(x, (list, dict))) if RECOG.exists() else 0, "date": fdate(RECOG), "tier": 3, "tool": "tools/datasets/recognition.py"},
            {"name": "UN General Assembly recorded votes", "publisher": "UN Digital Library", "rows": len(records), "date": fdate(DATA / "datasets" / "unga" / "2026.json"), "tier": 1, "tool": "tools/datasets/unga_page.js + receive.py"},
            {"name": "Weight: GDP, military spending, population", "publisher": "World Bank (military spending is SIPRI's series)", "rows": len(weight_ds.get("actors", {})), "date": weight_ds.get("source", {}).get("fetched"), "tier": 1, "tool": "tools/datasets/worldbank.py"},
            {"name": "Borders", "publisher": "Wikidata (P47 shares border with)", "rows": sum(len(v) for v in borders_ds.get("borders", {}).values()) // 2, "date": borders_ds.get("source", {}).get("fetched"), "tier": 2, "tool": "tools/datasets/borders.py"},
        ],
        "derived": {"seams": len(seams), "buffers": len(buffers), "clients": len(clients), "tepid": len(tepid), "faults": len(faults), "gatherings": len(gatherings),
                    "flanks": len(flanks), "flanks_open": sum(r["open"] for r in flank_index), "levers": len(levers), "siege": len(siege), "theatres": len(theatres),
                    "currents": len(currents), "convergences": sum(len(v) for v in convergences.values()), "derived_allies": derived},
        "snapshots": [p.stem for p in sorted(SNAP.glob("*.json"))],
        "site": site_meta,
        "world": weight_ds.get("world", {}),
    }


    out = {
        "generated": today.isoformat(),
        "theatres": theatres,
        "seams": seams, "buffers": buffers,
        "clients": clients, "tepid": tepid,
        "faults": faults,
        "gatherings": gatherings,
        "flanks": flanks, "flank_index": flank_index,
        "levers": levers, "lever_index": lever_index,
        "siege": siege, "borders": borders, "weight": weight, "stats": stats,
        "convergences": convergences,
        "currents": currents,
        "alarms": {"allies_cooling": allies_cooling, "rivals_warming": rivals_warming},
        "changes": changes,
        "grades": GRADES,
        "layers": list(TYPES.keys()),
        "actors": list(actors.values()),
        "stances": {k: [dict(st, alignment=st.get("alignment") or ("treaty" if st["toward"] in allies.get(k, ()) and st["grade"] in ("ally", "reluctant_ally") else None)) for st in v["stances"]] for k, v in stances.items()},
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
