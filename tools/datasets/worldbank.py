"""World Bank pass (Davide, 2026-10-16: the weight of an actor from one important database, not two
thousand separate searches). Three indicators for every economy in one call each:

  NY.GDP.MKTP.CD   GDP, current US$
  MS.MIL.XPND.CD   military expenditure, current US$ (World Bank's copy of SIPRI)
  SP.POP.TOTL      population

Usage: python tools/datasets/worldbank.py            (from the repo root; needs the network)
       python tools/datasets/worldbank.py --offline  (recompute from the raw files already on disk)
Writes data/datasets/worldbank/raw-<indicator>.json (the API answer as received) and
data/datasets/worldbank/weight.json: for every ISO3 the latest value of each indicator with its
year, the share of the world total, and one weight = half GDP share + half military share. The
European Union is the Bank's EUU aggregate. Taiwan is not in the Bank's tables and stays blank.
"""
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "data" / "datasets" / "worldbank"
OUT.mkdir(parents=True, exist_ok=True)
IND = {"NY.GDP.MKTP.CD": "gdp", "MS.MIL.XPND.CD": "mil", "SP.POP.TOTL": "pop"}
URL = "https://api.worldbank.org/v2/country/all/indicator/{ind}?date=2022:2025&format=json&per_page=2000"
# aggregates the Bank lists as "countries": kept only where the atlas has an actor for them
KEEP_AGG = {"EUU": "org-eu", "WLD": "WLD"}
sys.stdout.reconfigure(encoding="utf-8")


def fetch(ind):
    p = OUT / f"raw-{ind}.json"
    if "--offline" in sys.argv and p.exists():
        return json.load(p.open(encoding="utf-8"))
    req = urllib.request.Request(URL.format(ind=ind), headers={"User-Agent": "grand-strategy-atlas/1.0"})
    d = json.load(urllib.request.urlopen(req, timeout=90))
    p.write_text(json.dumps(d), encoding="utf-8")
    return d


latest = {}   # iso3 -> {gdp: (value, year), ...}
for ind, key in IND.items():
    meta, rows = fetch(ind)
    for r in rows:
        if r["value"] is None:
            continue
        iso = r["countryiso3code"] or r["country"]["id"]
        if not iso or len(iso) != 3:
            continue
        # the Bank marks aggregates by region; a real economy has a two-letter id that is not a region code
        cur = latest.setdefault(iso, {})
        if key not in cur or int(r["date"]) > cur[key][1]:
            cur[key] = (float(r["value"]), int(r["date"]))

# aggregates out, except the ones the atlas uses
countries = {}
for meta_ind in ["NY.GDP.MKTP.CD"]:
    for r in json.load((OUT / f"raw-{meta_ind}.json").open(encoding="utf-8"))[1]:
        iso = r["countryiso3code"]
        if iso and (iso in KEEP_AGG or r["country"]["id"] not in ("", ) and len(r["country"]["id"]) == 2):
            countries[iso] = r["country"]["value"]
# the Bank's two-letter ids include aggregates (EU, 1W, XC...); real economies are the ones with a
# three-letter ISO code that is also a country in Wikidata's list, plus the kept aggregates
states = json.load((ROOT / "data" / "datasets" / "wikidata" / "states.json").open(encoding="utf-8"))
wld = latest.get("WLD", {})
out = {"source": {"publisher": "World Bank", "url": "https://data.worldbank.org/", "api": URL.replace("{ind}", "<indicator>"),
                  "indicators": IND, "fetched": __import__("datetime").date.today().isoformat(), "tier": 1,
                  "note": "military expenditure is SIPRI data as republished by the World Bank; Taiwan absent"},
       "world": {k: {"value": v[0], "year": v[1]} for k, v in wld.items()}, "actors": {}}
for iso, vals in latest.items():
    aid = KEEP_AGG.get(iso, iso)
    if aid == "WLD" or (iso not in states and iso not in KEEP_AGG):
        continue
    rec = {"name": countries.get(iso, iso)}
    for k in IND.values():
        if k in vals:
            rec[k] = {"value": vals[k][0], "year": vals[k][1], "share": round(vals[k][0] / wld[k][0], 5) if wld.get(k) else None}
    g = rec.get("gdp", {}).get("share") or 0.0
    m = rec.get("mil", {}).get("share") or 0.0
    rec["weight"] = round(0.5 * g + 0.5 * m, 5)
    out["actors"][aid] = rec
(OUT / "weight.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
missing = sorted(s for s in states if s not in out["actors"])
top = sorted(out["actors"].items(), key=lambda kv: -kv[1]["weight"])[:12]
print(f"{len(out['actors'])} actors weighed; missing from the Bank: {missing}")
for aid, r in top:
    print(f"  {aid:8} weight {r['weight']:.4f}  gdp {r.get('gdp', {}).get('share')}  mil {r.get('mil', {}).get('share')}  ({r.get('gdp', {}).get('year')})")
