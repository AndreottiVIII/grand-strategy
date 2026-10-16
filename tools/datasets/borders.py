"""Borders pass (Davide, 2026-10-16: encirclement needs the neighbours). The "shares border with"
(P47) claims of every state in data/datasets/wikidata/states.json, read with the entity API in
batches of fifty (four calls for the whole world; the SPARQL endpoint timed out on the same ask).

Usage: python tools/datasets/borders.py        (from the repo root; needs the network)
Writes data/datasets/wikidata/borders.json: {ISO3: [ISO3, ...]} for land and maritime borders as
Wikidata records them, symmetrised (if A lists B, B gets A), only between states the atlas knows.
"""
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
WD = ROOT / "data" / "datasets" / "wikidata"
UA = "grand-strategy-atlas/1.0 (https://github.com/AndreottiVIII/grand-strategy; davide.caniatti@gmail.com)"
API = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids="
sys.stdout.reconfigure(encoding="utf-8")

states = json.load((WD / "states.json").open(encoding="utf-8"))
q2iso = {v["q"]: k for k, v in states.items()}
qs = list(q2iso)
borders = {k: set() for k in states}
for i in range(0, len(qs), 50):
    batch = qs[i:i + 50]
    req = urllib.request.Request(API + "|".join(batch), headers={"User-Agent": UA})
    ents = json.load(urllib.request.urlopen(req, timeout=120))["entities"]
    for q, e in ents.items():
        a = q2iso.get(q)
        for cl in (e.get("claims") or {}).get("P47", []):
            if cl.get("rank") == "deprecated":
                continue
            try:
                b = q2iso.get(cl["mainsnak"]["datavalue"]["value"]["id"])
            except KeyError:
                continue
            if a and b and a != b:
                borders[a].add(b)
                borders[b].add(a)
    print(f"batch {i // 50 + 1}: {len(ents)} entities")
out = {"source": {"publisher": "Wikidata", "property": "P47 shares border with", "url": "https://www.wikidata.org/wiki/Property:P47",
                  "fetched": __import__("datetime").date.today().isoformat(), "tier": 2,
                  "note": "land and maritime borders as Wikidata records them, symmetrised; only between states in states.json"},
       "borders": {k: sorted(v) for k, v in borders.items()}}
(WD / "borders.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
n = sum(len(v) for v in borders.values()) // 2
alone = sorted(k for k, v in borders.items() if not v)
print(f"{n} borders between {len(states)} states; without neighbours: {alone}")
for k in ("CHN", "RUS", "ISR", "SRB", "XKX", "TWN", "ITA"):
    print(" ", k, sorted(borders[k]))
