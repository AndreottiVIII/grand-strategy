"""Recognition pass: who recognises Kosovo, Palestine and Taiwan, from the English
Wikipedia tables, with the citation under each row as the source.

Usage: python tools/datasets/recognition.py        (from the repo root)
Writes data/datasets/wikipedia/recognition.json and data/relations/_recognition.yaml:
for every UN member a row toward XKX / PSE / TWN of type `recognition` (with the date
and the row's own citation) or `non_recognition` (Wikipedia list only, tier 4).
Wikipedia is the index; the fact's own citation is the source. See ONTOLOGY.md.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

try:
    import pycountry
except ImportError:  # pragma: no cover
    sys.exit("pip install pycountry")

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "data" / "datasets" / "wikipedia"
ACTORS = ROOT / "data" / "actors"
UA = "grand-strategy-atlas/0.1 (https://github.com/AndreottiVIII/grand-strategy; davide.caniatti@gmail.com)"
API = "https://en.wikipedia.org/w/api.php"

CASES = {
    "XKX": {"page": "International recognition of Kosovo", "name": "Kosovo",
            "yes": (r"==+\s*Countries which have recognised Kosovo as", r"==+\s*Non-UN countries"),
            "withdrawn": (r"==+\s*Countries which have recognised Kosovo but", r"==+\s*Countries which have not recognised")},
    "PSE": {"page": "International recognition of Palestine", "name": "the State of Palestine",
            "yes": (r"==+\s*States that recognize Palestine", r"==+\s*Non-UN member states")},
    "TWN": {"page": "Foreign relations of Taiwan", "name": "the Republic of China (Taiwan)",
            "yes": (r"==+\s*Full diplomatic relations", r"==+\s*Non-diplomatic representation"), "kind": "diplomatic relations with"},
}
NAME_FIX = {
    "Russia": "RUS", "Iran": "IRN", "Syria": "SYR", "Vietnam": "VNM", "Laos": "LAO", "North Korea": "PRK", "South Korea": "KOR",
    "Bolivia": "BOL", "Venezuela": "VEN", "Tanzania": "TZA", "Moldova": "MDA", "Brunei": "BRN", "Micronesia": "FSM",
    "Czech Republic": "CZE", "Czechia": "CZE", "Turkey": "TUR", "Türkiye": "TUR", "Cape Verde": "CPV", "Ivory Coast": "CIV",
    "Côte d'Ivoire": "CIV", "DR Congo": "COD", "Democratic Republic of the Congo": "COD", "Republic of the Congo": "COG",
    "Congo": "COG", "The Gambia": "GMB", "Gambia": "GMB", "Bahamas": "BHS", "The Bahamas": "BHS", "Eswatini": "SWZ",
    "Swaziland": "SWZ", "East Timor": "TLS", "Timor-Leste": "TLS", "Macedonia": "MKD", "North Macedonia": "MKD",
    "Saint Kitts and Nevis": "KNA", "Saint Lucia": "LCA", "Saint Vincent and the Grenadines": "VCT", "São Tomé and Príncipe": "STP",
    "Sao Tome and Principe": "STP", "Vatican City": "VAT", "Holy See": "VAT", "Palestine": "PSE", "Kosovo": "XKX", "Taiwan": "TWN",
    "United States": "USA", "United Kingdom": "GBR", "Netherlands": "NLD", "Philippines": "PHL", "Marshall Islands": "MHL",
    "Solomon Islands": "SLB", "Comoros": "COM", "Maldives": "MDV", "Seychelles": "SYC", "Niger": "NER", "Guinea-Bissau": "GNB",
    "Myanmar": "MMR", "Burma": "MMR", "Libya": "LBY", "Somalia": "SOM", "Sudan": "SDN", "South Sudan": "SSD", "Yemen": "YEM",
    "Burkina Faso": "BFA", "Central African Republic": "CAF", "Dominican Republic": "DOM", "Papua New Guinea": "PNG",
    "Trinidad and Tobago": "TTO", "United Arab Emirates": "ARE", "Antigua and Barbuda": "ATG", "Equatorial Guinea": "GNQ",
    "Sri Lanka": "LKA", "El Salvador": "SLV", "Costa Rica": "CRI", "New Zealand": "NZL", "Saudi Arabia": "SAU", "South Africa": "ZAF",
    "Sierra Leone": "SLE", "San Marino": "SMR", "Bosnia and Herzegovina": "BIH", "Federated States of Micronesia": "FSM",
}


def fetch(page):
    url = API + "?" + urllib.parse.urlencode({"action": "parse", "page": page, "prop": "wikitext|revid", "format": "json", "formatversion": 2, "redirects": 1})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.load(r)["parse"]
    return d["wikitext"], d["title"], d["revid"]


def segment(text, start, end):
    m = re.search(start, text)
    if not m:
        return ""
    n = re.search(end, text[m.end():])
    return text[m.start(): m.end() + n.start()] if n else text[m.start():]


# Wikipedia's three-letter country templates use IOC codes, not ISO
IOC = {"CRC": "CRI", "LAT": "LVA", "GER": "DEU", "DEN": "DNK", "SUI": "CHE", "NED": "NLD", "SLO": "SVN", "MON": "MCO", "CRO": "HRV",
       "BUL": "BGR", "BUR": "BFA", "SAM": "WSM", "POR": "PRT", "UAE": "ARE", "MAS": "MYS", "GAM": "GMB", "KSA": "SAU", "MAW": "MWI",
       "VAN": "VUT", "HON": "HND", "GBS": "GNB", "GUI": "GIN", "NIG": "NER", "KUW": "KWT", "HAI": "HTI", "BRU": "BRN", "CHA": "TCD",
       "FIJ": "FJI", "SKN": "KNA", "TAN": "TZA", "LBA": "LBY", "ELS": "SLV", "BAN": "BGD", "BAR": "BRB", "SUD": "SDN", "KOS": "XKX",
       "RSA": "ZAF", "ZIM": "ZWE", "ZAM": "ZMB", "URU": "URY", "PAR": "PRY", "PHI": "PHL", "INA": "IDN", "IRI": "IRN", "OMA": "OMN",
       "NEP": "NPL", "MGL": "MNG", "MTN": "MRT", "MRI": "MUS", "MAD": "MDG", "LIB": "LBN", "LES": "LSO", "KGZ": "KGZ", "GRE": "GRC",
       "GEQ": "GNQ", "ESA": "SLV", "CGO": "COG", "COD": "COD", "CAM": "KHM", "BOT": "BWA", "BIZ": "BLZ", "BAH": "BHS", "ANT": "ATG",
       "ALG": "DZA", "ANG": "AGO", "ARU": "ABW", "ASA": "ASM", "BER": "BMU", "BHU": "BTN", "BRN": "BHR", "CAY": "CYM", "CHI": "CHL",
       "CRO": "HRV", "DMA": "DMA", "GRN": "GRD", "GUA": "GTM", "ISV": "VIR", "IVB": "VGB", "KOR": "KOR", "LBR": "LBR", "MYA": "MMR",
       "NCA": "NIC", "NGR": "NGA", "PLE": "PSE", "PUR": "PRI", "SEY": "SYC", "SIN": "SGP", "SOL": "SLB", "SRI": "LKA", "TGA": "TON",
       "TOG": "TGO", "TPE": "TWN", "TTO": "TTO", "UGA": "UGA", "VIE": "VNM", "VIN": "VCT", "ZAM": "ZMB"}


def iso3_of(token):
    token = token.strip()
    if token in NAME_FIX:
        return NAME_FIX[token]
    if re.fullmatch(r"[A-Z]{3}", token):
        return IOC.get(token, token)
    try:
        c = pycountry.countries.lookup(token)
        return c.alpha_3
    except LookupError:
        return None


def country_in_row(row):
    """The country cell: {{CRC}}, {{flagcountry|AFG|2013}}, {{flag|San Marino}}, {{flagicon|X}} [[X]]..."""
    for pat in (r"\{\{flagcountry\|([^}|]+)", r"\{\{flag\|([^}|]+)", r"\{\{Flag\|([^}|]+)", r"\{\{flaglist\|([^}|]+)", r"\{\{flagicon\|([^}|]+)\}\}\s*\[\[([^\]|]+)", r"\{\{([A-Z]{3})\}\}"):
        m = re.search(pat, row)
        if m:
            name = m.group(m.lastindex)
            iso = iso3_of(name)
            if iso:
                return iso, name
    return None, None


def date_in_row(row):
    m = re.search(r"\{\{dts\|(?:format=\w+\|)?(\d{4})\|(\d{1,2})\|(\d{1,2})", row)
    if m:
        return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
    m = re.search(r'data-sort-value="(\d{4}-\d{2}-\d{2})"', row)
    if m:
        return m.group(1)
    m = re.search(r"\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})\b", row)
    if m:
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        return f"{m.group(3)}-{months.index(m.group(2)) + 1:02d}-{int(m.group(1)):02d}"
    m = re.search(r"\{\{dts\|(?:format=\w+\|)?(\d{4})\}\}|\b(19\d{2}|20\d{2})\b", row)
    if m:
        return m.group(1) or m.group(2)
    return None


def ref_in_row(row):
    m = re.search(r"<ref[^>]*>.*?\burl\s*=\s*(https?://[^\s|}]+)", row, re.S)
    if m:
        return m.group(1)
    m = re.search(r"<ref[^>]*>\s*\[?(https?://[^\s\]|}]+)", row, re.S)
    return m.group(1) if m else None


def parse_table(seg):
    rows, last_date = [], None
    for raw in re.split(r"\n\|-", seg):
        iso, name = country_in_row(raw)
        if not iso:
            continue
        d = date_in_row(raw) or last_date   # rowspan: same-day recognitions share one date cell
        if date_in_row(raw):
            last_date = date_in_row(raw)
        rows.append({"iso3": iso, "name": name, "date": d, "ref": ref_in_row(raw)})
    return rows


def dedupe(rows):
    seen, out = set(), []
    for r in rows:
        if r["iso3"] not in seen:
            seen.add(r["iso3"]); out.append(r)
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    actors = {p.stem for p in ACTORS.glob("*.yaml")}
    members = sorted(json.load((ROOT / "data" / "datasets" / "unga" / "2025.json").open(encoding="utf-8"))["countries"])
    today = time.strftime("%Y-%m-%d")
    result, rel = {}, []
    for target, c in CASES.items():
        text, title, revid = fetch(c["page"])
        yes = dedupe(parse_table(segment(text, *c["yes"])))
        withdrawn = dedupe(parse_table(segment(text, *c["withdrawn"]))) if "withdrawn" in c else []
        if c.get("kind"):          # the Taiwan table carries no recognition dates worth keeping
            for r in yes:
                r["date"] = None
        yes_ids = {r["iso3"] for r in yes} - {r["iso3"] for r in withdrawn}
        page_url = f"https://en.wikipedia.org/w/index.php?title={urllib.parse.quote(title.replace(' ', '_'))}&oldid={revid}"
        result[target] = {"page": title, "revid": revid, "recognised_by": sorted(yes_ids), "withdrawn": [r["iso3"] for r in withdrawn],
                          "rows": yes, "n_members": len(yes_ids & set(members))}
        kind = c.get("kind", "recognition of")
        for m in members:
            if m == target or m not in actors:
                continue
            row = next((r for r in yes if r["iso3"] == m), None)
            if m in yes_ids:
                srcs = []
                if row and row["ref"]:
                    srcs.append({"url": row["ref"], "title": f"Citation under the {c['name']} row in Wikipedia's list ({m})", "publisher": "as cited by Wikipedia", "date": row["date"] or today, "tier": 3, "dataset": "wikipedia-recognition"})
                srcs.append({"url": page_url, "title": title, "publisher": "Wikipedia (index)", "date": today, "tier": 4, "dataset": "wikipedia-recognition"})
                rel.append({"from": m, "to": target, "layer": "alignment", "type": "recognition",
                            "summary": f"Recognises {c['name']}" + (f" since {row['date']}" if row and row["date"] else "") + ("" if kind == "recognition of" else " (full diplomatic relations)") + ".",
                            "since": row["date"] if row else None, "until": None, "last_verified": today, "confidence": "B" if row and row["ref"] else "C",
                            "dataset": "wikipedia-recognition", "sources": srcs})
            else:
                wd = next((r for r in withdrawn if r["iso3"] == m), None)
                rel.append({"from": m, "to": target, "layer": "alignment", "type": "non_recognition",
                            "summary": (f"Withdrew its recognition of {c['name']}" + (f" ({wd['date']})" if wd and wd["date"] else "") + ".") if wd else f"Does not recognise {c['name']}.",
                            "since": wd["date"] if wd else None, "until": None, "last_verified": today, "confidence": "C",
                            "dataset": "wikipedia-recognition",
                            "sources": [{"url": page_url, "title": title, "publisher": "Wikipedia (index)", "date": today, "tier": 4, "dataset": "wikipedia-recognition"}]})
        print(f"{target}: {len(yes)} rows parsed, {len(yes_ids & set(members))} UN members recognise, {len(withdrawn)} withdrawn, "
              f"{sum(1 for r in yes if r['ref'])} with a citation, {sum(1 for r in yes if r['date'])} with a date")
    json.dump(result, (OUT / "recognition.json").open("w", encoding="utf-8"), ensure_ascii=False, indent=1)
    (ROOT / "data" / "relations" / "_recognition.yaml").write_text(
        yaml.safe_dump({"generated": today, "relations": rel}, sort_keys=False, allow_unicode=True, width=200), encoding="utf-8")
    print(f"{len(rel)} rows -> data/relations/_recognition.yaml")


if __name__ == "__main__":
    main()
