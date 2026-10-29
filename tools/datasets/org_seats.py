"""Seats and links of the organisation stubs, from Wikidata (never typed).

Usage: python tools/datasets/org_seats.py            (dry run: prints what it would write)
       python tools/datasets/org_seats.py --write    (edits data/actors/org-*.yaml in place)

For every org-* stub:
  - the Wikidata item is the one in data/datasets/wikidata/org-ids.json (resolved by name and label-checked); a stub that is not
    there is resolved from its English Wikipedia link; the English label of the item is printed so a wrong id is seen;
  - `wikipedia:` is set to the English Wikipedia article when the item has an enwiki sitelink, else it stays the Wikidata
    URL of the right item (the site labels that link "Wikidata");
  - a stub still at coords [0, 0] gets `coords` and `seat` from P159 (headquarters location) -> P625 (coordinates) of the
    headquarters item, or P625 of the item itself; an organisation without a headquarters (G7, G20 ...) keeps [0, 0] and the
    site does not draw it.
Only these three fields are touched, line by line, so the YAML style of the files is kept.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent.parent
ACTORS = ROOT / "data" / "actors"
IDS = ROOT / "data" / "datasets" / "wikidata" / "org-ids.json"
API = "https://www.wikidata.org/w/api.php"
UA = "grand-strategy-atlas/0.1 (https://github.com/AndreottiVIII/grand-strategy)"


def call(**params):
    params["format"] = "json"
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001
            print("  retry", attempt, e, file=sys.stderr)
            time.sleep(2 + attempt * 3)
    raise SystemExit("Wikidata API unreachable")


def entities(qids, props="claims|sitelinks|labels"):
    out = {}
    qids = sorted(set(qids))
    for i in range(0, len(qids), 40):
        d = call(action="wbgetentities", ids="|".join(qids[i:i + 40]), props=props, languages="en", sitefilter="enwiki")
        out.update(d.get("entities", {}))
        time.sleep(0.5)
    return out


def claim_values(ent, prop):
    """current (not ended) values of a property, preferred rank first"""
    vals = []
    for c in ent.get("claims", {}).get(prop, []):
        if c.get("rank") == "deprecated" or "datavalue" not in c.get("mainsnak", {}):
            continue
        if c.get("qualifiers", {}).get("P582"):   # has an end time: no longer true
            continue
        vals.append((0 if c.get("rank") == "preferred" else 1, c["mainsnak"]["datavalue"]["value"]))
    return [v for _, v in sorted(vals, key=lambda x: x[0])]


CITY = {"Q515", "Q1549591", "Q5119", "Q1637706", "Q200250", "Q174844", "Q484170", "Q70208"}   # city, big city, capital, city of 1m+, metropolis, megacity, French commune, Swiss municipality
CACHE = {}


def get(qids):
    need = [q for q in qids if q not in CACHE]
    if need:
        CACHE.update(entities(need))
    return {q: CACHE[q] for q in qids if q in CACHE}


def city_of(qid, depth=3):
    """the city a headquarters item stands in: the item itself if it is a city, else the first city found going up P131"""
    level = [qid]
    seen = set()
    for _ in range(depth + 1):
        ents = get([q for q in level if q not in seen])
        seen.update(level)
        for q in level:
            e = ents.get(q, {})
            if CITY & {v["id"] for v in claim_values(e, "P31") if isinstance(v, dict)} and claim_values(e, "P625"):
                return e
        level = [v["id"] for q in level for v in claim_values(ents.get(q, {}), "P131") if isinstance(v, dict) and "id" in v]
        if not level:
            break
    return None


def main():
    write = "--write" in sys.argv
    ids = json.loads(IDS.read_text(encoding="utf-8"))
    stubs = {}
    for f in sorted(ACTORS.glob("org-*.yaml")):
        a = yaml.safe_load(f.open(encoding="utf-8"))
        if a.get("card") != "stub":
            continue
        wp = a.get("wikipedia") or ""
        wd = re.search(r"wikidata\.org/wiki/(Q\d+)", wp)
        stubs[a["id"]] = {"file": f, "a": a, "wp": wp, "wd_in_file": wd.group(1) if wd else None}
    # the item of each stub: org-ids.json first; otherwise the English Wikipedia article it links to
    for oid, s in stubs.items():
        if oid in ids:
            s["qid"] = ids[oid][0]
        elif "en.wikipedia.org/wiki/" in s["wp"]:
            title = urllib.parse.unquote(s["wp"].split("/wiki/")[1]).replace("_", " ")
            d = call(action="wbgetentities", sites="enwiki", titles=title, props="labels", languages="en")
            ent = next(iter(d.get("entities", {}).values()))
            s["qid"] = ent.get("id") if "missing" not in ent else None
            time.sleep(0.5)
        else:
            s["qid"] = s["wd_in_file"]
    ents = entities([s["qid"] for s in stubs.values() if s.get("qid")])
    # headquarters items
    hq_ids = {}
    for oid, s in stubs.items():
        e = ents.get(s.get("qid"), {})
        hq = [v["id"] for v in claim_values(e, "P159") if isinstance(v, dict) and "id" in v]
        hq_ids[oid] = hq
    hq_ents = entities([q for v in hq_ids.values() for q in v]) if any(hq_ids.values()) else {}
    results = {}
    for oid, s in stubs.items():
        e = ents.get(s.get("qid"), {})
        label = e.get("labels", {}).get("en", {}).get("value")
        sl = e.get("sitelinks", {}).get("enwiki", {}).get("title")
        res = {"qid": s.get("qid"), "label": label,
               "wikipedia": "https://en.wikipedia.org/wiki/" + urllib.parse.quote(sl.replace(" ", "_"), safe="_(),'") if sl else (f"https://www.wikidata.org/wiki/{s['qid']}" if s.get("qid") else None)}
        seat = coords = None
        for hq in hq_ids[oid]:
            he = city_of(hq)
            if he:
                pc = claim_values(he, "P625")
                seat = he.get("labels", {}).get("en", {}).get("value")
                coords = [round(pc[0]["longitude"], 2), round(pc[0]["latitude"], 2)]
                break
        if coords is None:   # no city on the way up: the headquarters item as it is (a region, a building)
            for hq in hq_ids[oid]:
                he = hq_ents.get(hq, {})
                pc = claim_values(he, "P625")
                if pc:
                    seat = he.get("labels", {}).get("en", {}).get("value")
                    coords = [round(pc[0]["longitude"], 2), round(pc[0]["latitude"], 2)]
                    break
        if coords is None:
            pc = claim_values(e, "P625")
            if pc:
                seat, coords = None, [round(pc[0]["longitude"], 2), round(pc[0]["latitude"], 2)]
        res["seat"], res["coords"] = seat, coords
        results[oid] = res
    # report
    for oid, r in results.items():
        a = stubs[oid]["a"]
        print(f"{oid:18} {r['qid']} [{r['label']}] seat={r['seat']} coords={r['coords']} wp={r['wikipedia']}")
    if not write:
        return
    for oid, r in results.items():
        s = stubs[oid]
        txt = s["file"].read_text(encoding="utf-8")
        new = txt
        if r["wikipedia"] and r["wikipedia"] != s["wp"] and "wikidata.org" in s["wp"]:
            new = re.sub(r"(?m)^wikipedia: .*$", "wikipedia: " + r["wikipedia"], new, count=1)
        if s["a"].get("coords") == [0, 0] and r["coords"] and r["seat"]:
            seat_line = yaml.safe_dump({"seat": r["seat"]}, allow_unicode=True, default_flow_style=False, width=1000).strip()
            new = re.sub(r"(?m)^coords:\n- 0\n- 0\nseat: ''$", f"coords:\n- {r['coords'][0]}\n- {r['coords'][1]}\n{seat_line}", new, count=1)
        if new != txt:
            s["file"].write_text(new, encoding="utf-8")
            print("wrote", s["file"].name)


if __name__ == "__main__":
    main()
