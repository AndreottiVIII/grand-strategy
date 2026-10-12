"""The world queue: every actor, its region, tier and model, and where it stands.

Usage:
  python tools/queue.py init            # create data/queue.yaml from data/actors (keeps existing statuses)
  python tools/queue.py status          # dashboard
  python tools/queue.py next [N] [--model sonnet|haiku|fable]   # next pending actors in region order
  python tools/queue.py set ID status [--tokens N]              # pending|running|done|reviewed
  python tools/queue.py brief ID        # write tools/briefs/ID.md from the template
"""
import sys
import time
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
Q = ROOT / "data" / "queue.yaml"
ACTORS = ROOT / "data" / "actors"
BRIEFS = ROOT / "tools" / "briefs"

# region order = work order. Sonnet actors listed explicitly; every other state is haiku.
REGIONS = {
    "western-balkans": ["SRB", "XKX", "HRV", "BIH", "MNE", "ALB", "MKD", "sub-rs"],
    "east-europe-black-sea": ["UKR", "MDA", "BLR", "GEO", "ARM", "AZE", "ROU", "BGR", "TUR"],
    "central-north-europe": ["POL", "HUN", "CZE", "SVK", "SVN", "DEU", "AUT", "CHE", "SWE", "FIN", "NOR", "DNK", "EST", "LVA", "LTU", "ISL", "LIE"],
    "western-south-europe": ["ITA", "ESP", "NLD", "BEL", "GRC", "CYP", "PRT", "IRL", "LUX", "MLT", "AND", "MCO", "SMR", "VAT", "org-eu", "org-nato"],
    "middle-east": ["ISR", "IRN", "SAU", "ARE", "QAT", "EGY", "IRQ", "SYR", "LBN", "JOR", "YEM", "PSE", "KWT", "OMN", "BHR", "nsa-houthis", "nsa-hezbollah", "nsa-hamas", "nsa-sdf"],
    "south-central-asia": ["IND", "PAK", "AFG", "BGD", "LKA", "NPL", "BTN", "MDV", "KAZ", "UZB", "TKM", "KGZ", "TJK", "MNG"],
    "east-asia": ["JPN", "KOR", "PRK", "TWN"],
    "southeast-asia-oceania": ["IDN", "VNM", "PHL", "THA", "MYS", "SGP", "MMR", "KHM", "LAO", "BRN", "TLS", "AUS", "NZL", "PNG", "FJI", "SLB", "VUT", "WSM", "TON", "KIR", "FSM", "MHL", "PLW", "NRU", "TUV"],
    "north-africa": ["DZA", "MAR", "TUN", "LBY", "SDN", "nsa-rsf", "MRT"],
    "east-africa": ["ETH", "KEN", "SOM", "ERI", "DJI", "SSD", "UGA", "TZA", "RWA", "BDI", "COM", "SYC", "MUS", "MDG"],
    "west-africa": ["NGA", "GHA", "CIV", "SEN", "MLI", "NER", "BFA", "GIN", "SLE", "LBR", "TGO", "BEN", "GMB", "GNB", "CPV", "TCD", "CMR"],
    "central-southern-africa": ["COD", "AGO", "ZAF", "ZMB", "ZWE", "MOZ", "NAM", "BWA", "MWI", "LSO", "SWZ", "COG", "GAB", "GNQ", "CAF", "STP"],
    "north-america": ["CAN", "MEX"],
    "central-america-caribbean": ["CUB", "GTM", "HND", "SLV", "NIC", "CRI", "PAN", "DOM", "HTI", "JAM", "TTO", "BHS", "BRB", "BLZ", "ATG", "DMA", "GRD", "KNA", "LCA", "VCT"],
    "south-america": ["BRA", "VEN", "ARG", "COL", "CHL", "PER", "ECU", "BOL", "PRY", "URY", "GUY", "SUR"],
    "great-powers": ["USA", "CHN", "RUS", "GBR", "FRA"],   # the UN Security Council P5, all written by Fable last (Davide, 2026-10-12)
}
SONNET = set("""UKR MDA BLR GEO ARM AZE ROU BGR TUR POL HUN CZE SVK DEU AUT SWE FIN NOR DNK EST LVA LTU FRA ITA GBR ESP NLD BEL GRC CYP
PRT org-eu org-nato ISR IRN SAU ARE QAT EGY IRQ SYR LBN JOR YEM PSE KWT OMN nsa-houthis nsa-hezbollah nsa-hamas nsa-sdf
IND PAK AFG BGD KAZ UZB JPN KOR PRK TWN IDN VNM PHL THA MYS MMR AUS DZA MAR LBY SDN nsa-rsf ETH KEN SOM RWA COD ZAF NGA MLI
NER BFA TCD CAN MEX CUB BRA VEN ARG COL CHL sub-rs""".split())
FABLE = {"USA", "CHN", "RUS", "GBR", "FRA"}
DONE = {"SRB", "XKX", "HRV", "BIH", "MNE", "ALB", "MKD"}


def load():
    return yaml.safe_load(Q.open(encoding="utf-8")) if Q.exists() else {"actors": []}


def save(q):
    Q.write_text(yaml.safe_dump(q, sort_keys=False, allow_unicode=True), encoding="utf-8")


def init():
    q = load()
    old = {a["id"]: a for a in q.get("actors", [])}
    have = {p.stem for p in ACTORS.glob("*.yaml")}
    placed, out = set(), []
    for region, ids in REGIONS.items():
        for i in ids:
            if i not in have:
                print("missing actor file:", i)
            placed.add(i)
            model = "fable" if i in FABLE else "sonnet" if i in SONNET else "haiku"
            a = old.get(i, {"id": i, "status": "reviewed" if i in DONE else "pending", "tokens": 0, "updated": None})
            a.update({"region": region, "model": model, "tier": "protagonist" if model != "haiku" else "minor"})
            out.append(a)
    for i in sorted(have - placed):
        if i.startswith("org-"):
            continue
        a = old.get(i, {"id": i, "status": "pending", "tokens": 0, "updated": None})
        a.update({"region": "unplaced", "model": "haiku", "tier": "minor"})
        out.append(a)
        print("unplaced (haiku, last):", i)
    save({"actors": out})
    status()


def status():
    q = load()
    acts = q["actors"]
    tot = len(acts)
    by = {}
    for a in acts:
        by.setdefault(a["status"], 0)
        by[a["status"]] += 1
    tokens = sum(a.get("tokens") or 0 for a in acts)
    print(f"{tot} actors · " + " · ".join(f"{k} {v}" for k, v in by.items()) + f" · tokens {tokens/1e6:.2f}M")
    for region in list(REGIONS) + ["unplaced"]:
        rs = [a for a in acts if a["region"] == region]
        if not rs:
            continue
        d = sum(1 for a in rs if a["status"] in ("done", "reviewed"))
        r = [a["id"] for a in rs if a["status"] == "running"]
        print(f"  {region:28} {d:3}/{len(rs):<3} " + (f"running: {', '.join(r)}" if r else ""))


def nxt(n, model=None):
    q = load()
    out = [a for a in q["actors"] if a["status"] == "pending" and (not model or a["model"] == model)]
    print(" ".join(a["id"] for a in out[:n]))


def setst(i, st, tokens=None):
    q = load()
    for a in q["actors"]:
        if a["id"] == i:
            a["status"] = st
            a["updated"] = time.strftime("%Y-%m-%d %H:%M")
            if tokens is not None:
                a["tokens"] = int(tokens)
    save(q)


def brief(i):
    q = load()
    a = next(x for x in q["actors"] if x["id"] == i)
    actor = yaml.safe_load((ACTORS / f"{i}.yaml").open(encoding="utf-8"))
    name = actor["name"]
    region_ids = [x["id"] for x in q["actors"] if x["region"] == a["region"] and x["id"] != i]
    neighbours = ", ".join(region_ids[:12])
    minor = a["model"] == "haiku"
    BRIEFS.mkdir(exist_ok=True)
    t = (ROOT / "tools" / "brief_template.md").read_text(encoding="utf-8")
    t = (t.replace("{ID}", i).replace("{NAME}", name).replace("{REGION}", a["region"]).replace("{NEIGHBOURS}", neighbours)
          .replace("{TIER_BLOCK}", (ROOT / "tools" / "brief_minor.md").read_text(encoding="utf-8") if minor else (ROOT / "tools" / "brief_full.md").read_text(encoding="utf-8")))
    (BRIEFS / f"{i}.md").write_text(t, encoding="utf-8")
    print(BRIEFS / f"{i}.md")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    args = [x for x in sys.argv[2:] if not x.startswith("--")]
    opts = {x.split("=")[0][2:]: (x.split("=")[1] if "=" in x else True) for x in sys.argv[2:] if x.startswith("--")}
    if cmd == "init":
        init()
    elif cmd == "status":
        status()
    elif cmd == "next":
        nxt(int(args[0]) if args else 6, opts.get("model"))
    elif cmd == "set":
        setst(args[0], args[1], opts.get("tokens"))
    elif cmd == "brief":
        for i in args:
            brief(i)
