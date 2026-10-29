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

# organisations whose membership is an alignment row: our id, Wikidata item (resolved by name and label-checked,
# see data/datasets/wikidata/org-ids.json - never typed from memory), official member list (tier 1)
ORGS = {
    "org-un": ("United Nations", "Q1065", "https://www.un.org/en/about-us/member-states"),
    "org-nato": ("NATO", "Q7184", "https://www.nato.int/cps/en/natohq/nato_countries.htm"),
    "org-eu": ("European Union", "Q458", "https://european-union.europa.eu/principles-countries-history/eu-countries_en"),
    "org-csto": ("Collective Security Treaty Organization", "Q318693", "https://en.odkb-csto.org/structure/"),
    "org-sco": ("Shanghai Cooperation Organisation", "Q485207", "https://eng.sectsco.org/"),
    "org-brics": ("BRICS", "Q243630", "https://brics.br/en/about-brics"),
    "org-opec": ("OPEC", "Q7795", "https://www.opec.org/opec_web/en/about_us/25.htm"),
    "org-arab-league": ("Arab League", "Q7172", "http://www.lasportal.org/"),
    "org-au": ("African Union", "Q7159", "https://au.int/en/member_states/countryprofiles2"),
    "org-asean": ("ASEAN", "Q7768", "https://asean.org/member-states/"),
    "org-gcc": ("Gulf Cooperation Council", "Q217172", "https://www.gcc-sg.org/en-us/AboutGCC/MemberStates/Pages/default.aspx"),
    "org-oic": ("Organisation of Islamic Cooperation", "Q47543", "https://www.oic-oci.org/states/?lan=en"),
    "org-osce": ("OSCE", "Q81299", "https://www.osce.org/participating-states"),
    "org-coe": ("Council of Europe", "Q8908", "https://www.coe.int/en/web/portal/46-members-states"),
    "org-cis": ("Commonwealth of Independent States", "Q7779", "https://cis.minsk.by/page/178"),
    "org-eaeu": ("Eurasian Economic Union", "Q4173083", "https://eec.eaeunion.org/en/"),
    "org-oas": ("Organization of American States", "Q123759", "https://www.oas.org/en/member_states/default.asp"),
    "org-commonwealth": ("Commonwealth of Nations", "Q7785", "https://thecommonwealth.org/our-member-countries"),
    "org-g7": ("G7", "Q1764511", "https://www.g7italy.it/en/"),
    "org-g20": ("G20", "Q19771", "https://g20.org/about-g20/"),
    "org-oecd": ("OECD", "Q41550", "https://www.oecd.org/en/about/members-partners.html"),
    "org-ecowas": ("ECOWAS", "Q193272", "https://ecowas.int/member-states/"),
    "org-aes": ("Alliance of Sahel States", "Q122624387", "https://en.wikipedia.org/wiki/Alliance_of_Sahel_States"),
    "org-nam": ("Non-Aligned Movement", "Q83201", "https://en.wikipedia.org/wiki/Non-Aligned_Movement"),
    "org-cefta": ("CEFTA", "Q319014", "https://cefta.int/cefta-parties/"),
    "org-mercosur": ("Mercosur", "Q4264", "https://www.mercosur.int/en/about-mercosur/mercosur-countries/"),
    "org-celac": ("CELAC", "Q1045401", "https://celacinternational.org/"),
    "org-saarc": ("SAARC", "Q145700", "https://www.saarc-sec.org/index.php/about-saarc/about-saarc"),
    "org-pif": ("Pacific Islands Forum", "Q757276", "https://forumsec.org/who-we-are"),
    "org-sadc": ("SADC", "Q816706", "https://www.sadc.int/member-states"),
    "org-eac": ("East African Community", "Q337456", "https://www.eac.int/eac-partner-states"),
    "org-ots": ("Organization of Turkic States", "Q596850", "https://www.turkicstates.org/en/uye-ulkeler"),
    "org-wto": ("WTO", "Q7825", "https://www.wto.org/english/thewto_e/whatis_e/tif_e/org6_e.htm"),
    "org-icc": ("International Criminal Court (Rome Statute)", "Q47488", "https://asp.icc-cpi.int/states-parties"),
}

STATES_Q = """
SELECT ?s ?sLabel ?iso3 ?iso2 ?capitalLabel ?coord ?article WHERE {
  { ?s wdt:P31 wd:Q3624078 }
  UNION { VALUES ?s { wd:Q35 } }   # Denmark: Wikidata types the sovereign state as "Kingdom of Denmark" (no ISO code) and Q35 only as a "state" (id and P298 DNK checked through the API, 2026-10-29)
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


# when this dataset was fetched, for the Data page (build.py reads data/datasets/fetched.json)
def stamp_fetched(key):
    import datetime
    p = ROOT / "data" / "datasets" / "fetched.json"
    d = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    d[key] = datetime.date.today().isoformat()
    p.write_text(json.dumps(d, indent=1, sort_keys=True), encoding="utf-8")


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
        if iso3 == "XKS":           # Wikidata's code for Kosovo; the atlas and Natural Earth use XKX
            iso3 = "XKX"
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
        if iso3 == "XKS":
            iso3 = "XKX"
        org = q_by_org[val(b, "org").rsplit("/", 1)[1]]
        if not iso3 or val(b, "end"):
            continue
        members.append({"iso3": iso3, "org": org, "since": (val(b, "start") or "")[:10] or None})
    EXTRA = [("DNK", "org-eu", "1973-01-01"), ("DNK", "org-nato", "1949-04-04"), ("NLD", "org-eu", "1958-01-01"), ("NLD", "org-nato", "1949-04-04")]
    have = {(m["iso3"], m["org"]) for m in members}
    members += [{"iso3": i, "org": o, "since": d} for i, o, d in EXTRA if (i, o) not in have]
    # hand-kept lists for organisations Wikidata covers badly (data/datasets/memberships-manual.yaml)
    manual_p = ROOT / "data" / "datasets" / "memberships-manual.yaml"
    manual = yaml.safe_load(manual_p.open(encoding="utf-8")) if manual_p.exists() else {}
    have = {(m["iso3"], m["org"]) for m in members}
    for org, spec in manual.items():
        for iso3 in spec["members"]:
            if (iso3, org) not in have:
                members.append({"iso3": iso3, "org": org, "since": None, "manual": True})
    # Non-Aligned Movement: Wikidata has 6 of ~120; take the English Wikipedia category
    try:
        import urllib.request as _u
        nam = []
        cont = ""
        while True:
            q = urllib.parse.urlencode({"action": "query", "list": "categorymembers", "cmtitle": "Category:Member states of the Non-Aligned Movement", "cmlimit": 500, "format": "json", "cmcontinue": cont})
            d = json.load(_u.urlopen(_u.Request("https://en.wikipedia.org/w/api.php?" + q, headers={"User-Agent": UA}), timeout=60))
            nam += [m["title"] for m in d["query"]["categorymembers"] if m["ns"] == 0]
            cont = d.get("continue", {}).get("cmcontinue")
            if not cont:
                break
        import pycountry
        fix = {"Russia": None, "Iran": "IRN", "Syria": "SYR", "Vietnam": "VNM", "Laos": "LAO", "North Korea": "PRK", "Bolivia": "BOL", "Venezuela": "VEN", "Tanzania": "TZA", "Brunei": "BRN", "Democratic Republic of the Congo": "COD", "Republic of the Congo": "COG", "The Gambia": "GMB", "The Bahamas": "BHS", "Eswatini": "SWZ", "East Timor": "TLS", "Ivory Coast": "CIV", "Cape Verde": "CPV", "Micronesia": "FSM", "Myanmar": "MMR", "State of Palestine": "PSE", "Palestine": "PSE", "Turkey": "TUR"}
        n0 = len(members)
        for t in nam:
            iso = fix.get(t)
            if iso is None and t not in fix:
                try:
                    iso = pycountry.countries.lookup(t).alpha_3
                except LookupError:
                    continue
            if iso and (iso, "org-nam") not in have:
                members.append({"iso3": iso, "org": "org-nam", "since": None, "manual": True}); have.add((iso, "org-nam"))
        print(f"NAM from Wikipedia category: +{len(members) - n0}")
    except Exception as e:  # noqa: BLE001
        print("NAM category failed:", e, file=sys.stderr)
    # Wikidata rows known to be wrong (checked by hand, 2026-10-16): Australia is an ASEAN dialogue partner, not a member
    WRONG = {("AUS", "org-asean")}
    members = [m for m in members if (m["iso3"], m["org"]) not in WRONG]
    members.sort(key=lambda m: (m["org"], m["iso3"]))   # the same file on every run (the SPARQL rows come back in any order)
    json.dump(members, (OUT / "memberships.json").open("w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(members)} current memberships in {len(ORGS)} organisations")
    stamp_fetched("wikidata")

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
                    "sources": [{"url": url, "title": f"{name} - member states", "publisher": name, "date": today, "tier": 1, "dataset": "wikidata"}] +
                               ([] if m.get("manual") else [{"url": f"https://www.wikidata.org/wiki/{q}", "title": f"{name} (Wikidata, member of / P463)", "publisher": "Wikidata", "date": today, "tier": 4, "dataset": "wikidata"}])})
    (ROOT / "data" / "relations" / "_wikidata.yaml").write_text(
        yaml.safe_dump({"generated": today, "relations": rel}, sort_keys=False, allow_unicode=True, width=200), encoding="utf-8")
    print(f"{len(rel)} membership rows -> data/relations/_wikidata.yaml")


if __name__ == "__main__":
    main()
