"""Wikidata pass: every sovereign state as an actor stub, plus memberships of the
organisations that matter as alignment rows.

Usage: python tools/datasets/wikidata.py        (from the repo root)
Writes data/datasets/wikidata/states.json and memberships.json; creates a stub in
data/actors/ for every state that has none (never overwrites an existing file);
writes data/relations/_wikidata.yaml with membership rows for every state.
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "data" / "datasets" / "wikidata"
ACTORS = ROOT / "data" / "actors"
UA = "grand-strategy-atlas/0.1 (https://github.com/AndreottiVIII/grand-strategy; davide.caniatti@gmail.com)"
SPARQL = "https://query.wikidata.org/sparql"

# organisations whose membership is an alignment row: our id, Wikidata item, official member list (tier 1)
ORGS = {
    "org-un":    ("United Nations", "Q1065", "https://www.un.org/en/about-us/member-states"),
    "org-nato":  ("NATO", "Q7184", "https://www.nato.int/cps/en/natohq/nato_countries.htm"),
    "org-eu":    ("European Union", "Q458", "https://european-union.europa.eu/principles-countries-history/eu-countries_en"),
    "org-csto":  ("Collective Security Treaty Organization", "Q190185", "https://en.odkb-csto.org/structure/"),
    "org-sco":   ("Shanghai Cooperation Organisation", "Q190364", "https://eng.sectsco.org/20170109/192193.html"),
    "org-brics": ("BRICS", "Q47539", "https://brics.br/en/about-brics"),
    "org-opec":  ("OPEC", "Q7795", "https://www.opec.org/opec_web/en/about_us/25.htm"),
    "org-arab-league": ("Arab League", "Q7172", "http://www.lasportal.org/"),
    "org-au":    ("African Union", "Q7159", "https://au.int/en/member_states/countryprofiles2"),
    "org-asean": ("ASEAN", "Q7768", "https://asean.org/member-states/"),
    "org-gcc":   ("Gulf Cooperation Council", "Q170989", "https://www.gcc-sg.org/en-us/AboutGCC/MemberStates/Pages/default.aspx"),
    "org-oic":   ("Organisation of Islamic Cooperation", "Q81299", "https://www.oic-oci.org/states/?lan=en"),
    "org-cis":   ("Commonwealth of Independent States", "Q7779", "https://cis.minsk.by/page/178"),
    "org-eaeu":  ("Eurasian Economic Union", "Q4173083", "https://eec.eaeunion.org/en/"),
    "org-oas":   ("Organization of American States", "Q7814", "https://www.oas.org/en/member_states/default.asp"),
    "org-commonwealth": ("Commonwealth of Nations", "Q7785", "https://thecommonwealth.org/our-member-countries"),
    "org-g7":    ("G7", "Q170481", "https://www.g7italy.it/en/"),
    "org-g20":   ("G20", "Q19097", "https://g20.org/about-g20/"),
    "org-oecd":  ("OECD", "Q41550", "https://www.oecd.org/en/about/members-partners.html"),
    "org-ecowas": ("ECOWAS", "Q193272", "https://ecowas.int/member-states/"),
    "org-aes":   ("Alliance of Sahel States", "Q122258006", "https://en.wikipedia.org/wiki/Alliance_of_Sahel_States"),
    "org-nam":   ("Non-Aligned Movement", "Q152776", "https://en.wikipedia.org/wiki/Non-Aligned_Movement"),
}

# Natural Earth / our ids differ from ISO in a few cases
ISO3_FIX = {"XKX": "XKX"}

STATES_Q = """
SELECT ?s ?sLabel ?iso3 ?iso2 ?capitalLabel ?coord ?article WHERE {
  ?s wdt:P31 wd:Q3624078 .
  FILTER NOT EXISTS { ?s wdt:P31 wd:Q3024240 }       # not a historical country
  FILTER NOT EXISTS { ?s wdt:P576 ?dissolved }         # not dissolved
  OPTIONAL { ?s wdt:P298 ?iso3 }
  OPTIONAL { ?s wdt:P297 ?iso2 }
  OPTIONAL { ?s wdt:P36 ?capital . OPTIONAL { ?capital wdt:P625 ?coord } }
  OPTIONAL { ?article schema:about ?s ; schema:isPartOf <https://en.wikipedia.org/> }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
"""

MEMBERS_Q = """
SELECT ?s ?iso3 ?org ?start ?end WHERE {
  VALUES ?org { %s }
  ?s p:P463 ?st . ?st ps:P463 ?org .
  ?s wdt:P31 wd:Q3624078 .
  OPTIONAL { ?s wdt:P298 ?iso3 }
  OPTIONAL { ?st pq:P580 ?start }
  OPTIONAL { ?st pq:P582 ?end }
}
"""


def sparql(q):
    url = SPARQL + "?" + urllib.parse.urlencode({"query": q, "format": "json"})
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/sparql-results+json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)["results"]["bindings"]
        except Exception as e:  # noqa: BLE001
            print("retry", attempt, e, file=sys.stderr)
            time.sleep(5)
    raise SystemExit("Wikidata unreachable")


def val(b, k):
    return b[k]["value"] if k in b else None


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = sparql(STATES_Q)
    states = {}
    for b in rows:
        q = val(b, "s").rsplit("/", 1)[1]
        iso3 = val(b, "iso3")
        if not iso3:
            continue
        st = states.setdefault(iso3, {"q": q, "name": val(b, "sLabel"), "iso3": iso3, "iso2": (val(b, "iso2") or "").lower(),
                                       "capital": val(b, "capitalLabel"), "coords": None, "wikipedia": val(b, "article")})
        c = val(b, "coord")
        if c and not st["coords"]:
            lon, lat = c.replace("Point(", "").replace(")", "").split()
            st["coords"] = [round(float(lon), 2), round(float(lat), 2)]
    # Kosovo has no ISO 3166-1 alpha-3 in Wikidata; use the conventional XKX
    for b in rows:
        if val(b, "s").endswith("/Q1246") and "XKX" not in states:
            c = val(b, "coord")
            states["XKX"] = {"q": "Q1246", "name": "Kosovo", "iso3": "XKX", "iso2": "xk", "capital": "Pristina",
                             "coords": [round(float(c.replace("Point(", "").replace(")", "").split()[0]), 2), round(float(c.split()[1].rstrip(")")), 2)] if c else [21.17, 42.67],
                             "wikipedia": "https://en.wikipedia.org/wiki/Kosovo"}
    json.dump(states, (OUT / "states.json").open("w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)
    print(f"{len(states)} states")

    q_by_org = {v[1]: k for k, v in ORGS.items()}
    rows = sparql(MEMBERS_Q % " ".join(f"wd:{v[1]}" for v in ORGS.values()))
    members = []
    for b in rows:
        iso3 = val(b, "iso3")
        org = q_by_org[val(b, "org").rsplit("/", 1)[1]]
        if not iso3 or val(b, "end"):
            continue
        members.append({"iso3": iso3, "org": org, "since": (val(b, "start") or "")[:10] or None})
    json.dump(members, (OUT / "memberships.json").open("w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(members)} current memberships in {len(ORGS)} organisations")

    # --- stubs for every state and organisation that has no actor file yet
    made = 0
    for iso3, st in sorted(states.items()):
        p = ACTORS / f"{iso3}.yaml"
        if p.exists() or not st["coords"]:
            continue
        doc = {"id": iso3, "name": st["name"], "type": "state", "iso2": st["iso2"], "wikipedia": st["wikipedia"],
               "coords": st["coords"], "seat": st["capital"] or "", "regions": ["world"], "card": "stub", "tier": "minor",
               "dataset": "wikidata"}
        p.write_text(yaml.safe_dump(doc, sort_keys=False, allow_unicode=True), encoding="utf-8")
        made += 1
    for oid, (name, q, url) in ORGS.items():
        p = ACTORS / f"{oid}.yaml"
        if p.exists():
            continue
        doc = {"id": oid, "name": name, "type": "org", "wikipedia": f"https://www.wikidata.org/wiki/{q}",
               "coords": [0, 0], "seat": "", "regions": ["world"], "card": "stub", "tier": "minor", "dataset": "wikidata"}
        p.write_text(yaml.safe_dump(doc, sort_keys=False, allow_unicode=True), encoding="utf-8")
        made += 1
    print(f"{made} stubs created")

    # --- membership rows, one file, regenerated every run
    rel = []
    today = time.strftime("%Y-%m-%d")
    for m in sorted(members, key=lambda x: (x["iso3"], x["org"])):
        name, q, url = ORGS[m["org"]]
        rel.append({"from": m["iso3"], "to": m["org"], "layer": "alignment", "type": "membership",
                    "summary": f"Member of {name}" + (f" since {m['since']}" if m["since"] else "") + ".",
                    "since": m["since"], "until": None, "last_verified": today, "confidence": "A", "dataset": "wikidata",
                    "sources": [{"url": url, "title": f"{name} - member states", "publisher": name, "date": today, "tier": 1, "dataset": "wikidata"},
                                {"url": f"https://www.wikidata.org/wiki/{q}", "title": f"{name} (Wikidata, member of / P463)", "publisher": "Wikidata", "date": today, "tier": 4, "dataset": "wikidata"}]})
    (ROOT / "data" / "relations" / "_wikidata.yaml").write_text(
        yaml.safe_dump({"generated": today, "relations": rel}, sort_keys=False, allow_unicode=True, width=200), encoding="utf-8")
    print(f"{len(rel)} membership rows -> data/relations/_wikidata.yaml")


if __name__ == "__main__":
    main()
