"""News heat from GDELT (Davide, 2026-10-22: see without spending which countries made the headlines).

GDELT 1.0 publishes one zip a day with every event its monitors coded from the world's news: the two
actors with their country codes, the event type, a cooperation-to-conflict score (Goldstein), the
number of articles. This pass downloads the last 7 days plus 4 weeks of baseline, counts per country,
and writes data/datasets/gdelt/heat.json: for every actor the week's events and articles, the
baseline (mean events per week over the 4 weeks before), the ratio week/baseline, the share of
conflict events (QuadClass 3 and 4) and the mean Goldstein score. Heat is the ratio: a country is hot
when it makes a multiple of its own normal, so the loud are not always on top.

Usage: python tools/datasets/gdelt.py [--days 7] [--baseline 28]    (from the repo root; network)
Raw zips are cached in data/datasets/gdelt/raw/ (ignored by git). Codes GDELT uses that are not
actors of the atlas (EUR, AFR, regional groupings) are counted and listed in the output.
"""
import collections
import datetime
import io
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "data" / "datasets" / "gdelt"
RAW = OUT / "raw"
RAW.mkdir(parents=True, exist_ok=True)
URL = "http://data.gdeltproject.org/events/{d:%Y%m%d}.export.CSV.zip"
sys.stdout.reconfigure(encoding="utf-8")
args = {a.split("=")[0][2:]: int(a.split("=")[1]) for a in sys.argv[1:] if a.startswith("--") and "=" in a}
DAYS, BASE = args.get("days", 7), args.get("baseline", 28)
# GDELT's own codes that are not states (regional actors); left out of the heat, listed in the output
NOT_STATES = {"EUR", "AFR", "ASA", "MEA", "LAM", "NMR", "SAS", "EEC", "WST", "CAU", "CRB", "CFR", "SCN", "BLK", "PGS", "WAF", "EAF", "SAF", "NAF", "SEA", "OCE", "ARB", "IGO", "NGO", "UNO", "MUL", "ANT", "IOM"}

# GDELT 1.0 spells East Timor TMP; the atlas, like ISO 3166, TLS
ACTOR_CODE_FIX = {"TMP": "TLS"}
# five states never appear as an actor country code in the daily files (Romania, Slovenia, Montenegro, Bosnia-Herzegovina, Kosovo:
# checked on the raw files, no ROM/ROU/SVN/MNE/BIH/KSV on any actor), so they are counted by where the event happened: the
# ActionGeo country in FIPS 10-4 (column 51), each pair checked against the place names in column 50 of the same file
PLACE_CODE = {"RO": "ROU", "SI": "SVN", "MJ": "MNE", "BK": "BIH", "KV": "XKX", "TT": "TLS"}

actors = {p.stem for p in (ROOT / "data" / "actors").glob("*.yaml")}
today = datetime.date.today()
days = [today - datetime.timedelta(days=i) for i in range(1, DAYS + BASE + 1)]   # yesterday back; today's file is partial


def fetch(d):
    p = RAW / f"{d:%Y%m%d}.export.CSV.zip"
    if not p.exists() or p.stat().st_size < 1000:
        req = urllib.request.Request(URL.format(d=d), headers={"User-Agent": "grand-strategy-atlas/1.0"})
        with urllib.request.urlopen(req, timeout=180) as r:
            p.write_bytes(r.read())
    return p


def count(p):
    """events, articles, conflict events, goldstein sum per country code for one day's file"""
    ev, art, con, gold = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
    z = zipfile.ZipFile(p)
    with z.open(z.namelist()[0]) as f:
        for line in io.TextIOWrapper(f, encoding="utf-8", errors="replace"):
            t = line.rstrip("\n").split("\t")
            if len(t) < 58:
                continue
            codes = {ACTOR_CODE_FIX.get(c, c) for c in (t[7], t[17]) if c}
            if t[51] in PLACE_CODE:
                codes.add(PLACE_CODE[t[51]])
            try:
                quad, g, n = int(t[29]), float(t[30]), int(t[33])
            except ValueError:
                continue
            for c in codes:
                ev[c] += 1
                art[c] += n
                if quad >= 3:
                    con[c] += 1
                gold[c] += g
    return ev, art, con, gold


week = [collections.Counter() for _ in range(4)]
base = [collections.Counter() for _ in range(4)]
done = 0
for d in days:
    try:
        p = fetch(d)
        ev, art, con, gold = count(p)
    except Exception as e:   # a missing day is skipped, not fatal
        print(f"  {d}: skipped ({e})")
        continue
    target = week if (today - d).days <= DAYS else base
    for acc, c in zip(target, (ev, art, con, gold)):
        acc.update(c)
    done += 1
    print(f"  {d}: {sum(ev.values()):,} country-events" + ("" if target is week else " (baseline)"))

if done == 0:   # every download failed: keep the previous heat.json and heat-<week>.json as they are
    sys.exit("GDELT: no day could be read, nothing written (the previous heat.json stays)")
base_weeks = max(1.0, BASE / 7)
out = {"source": {"publisher": "GDELT Project", "url": "https://www.gdeltproject.org/", "dataset": "GDELT 1.0 daily event export",
                  "fetched": today.isoformat(), "tier": 2, "note": "English-language and major-language media; attention, not truth. ROU, SVN, MNE, BIH, XKX are counted by where the event happened (GDELT codes no actor to them), TLS from GDELT's TMP and its place code"},
       "week": {"from": (today - datetime.timedelta(days=DAYS)).isoformat(), "to": (today - datetime.timedelta(days=1)).isoformat(), "days": DAYS},
       "baseline_days": BASE, "files": done, "actors": {}, "not_actors": {}}
ev, art, con, gold = week
bev, bcon = base[0], base[2]
for c in set(ev) | set(bev):
    weekly_base = bev.get(c, 0) / base_weeks
    weekly_bcon = bcon.get(c, 0) / base_weeks
    rec = {"events": ev.get(c, 0), "articles": art.get(c, 0), "baseline": round(weekly_base, 1),
           "ratio": round((ev.get(c, 0) + 20) / (weekly_base + 20), 2),
           "conflict": con.get(c, 0), "conflict_baseline": round(weekly_bcon, 1),
           "conflict_ratio": round((con.get(c, 0) + 10) / (weekly_bcon + 10), 2),
           "conflict_share": round(con.get(c, 0) / ev[c], 3) if ev.get(c) else None,
           "goldstein": round(gold.get(c, 0) / ev[c], 2) if ev.get(c) else None}
    if c in actors:
        out["actors"][c] = rec
    else:
        out["not_actors"][c] = rec["events"]
# ranks: hot = ratio among countries with enough events to mean something; loud = articles
hot = sorted((c for c, r in out["actors"].items() if r["events"] >= 150), key=lambda c: -out["actors"][c]["ratio"])
loud = sorted(out["actors"], key=lambda c: -out["actors"][c]["articles"])
for i, c in enumerate(hot):
    out["actors"][c]["hot_rank"] = i + 1
for i, c in enumerate(loud):
    out["actors"][c]["loud_rank"] = i + 1
# burning = where the week's news is mostly conflict and more of it than usual (events floor as above)
burn = sorted((c for c, r in out["actors"].items() if r["events"] >= 150 and (r["conflict_share"] or 0) >= 0.3),
              key=lambda c: -(out["actors"][c]["conflict_share"] * out["actors"][c]["conflict_ratio"]))
for i, c in enumerate(burn):
    out["actors"][c]["burn_rank"] = i + 1
(OUT / "heat.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
# memory (Davide, 2026-10-29): one compact file per week, so Watch and Theatres can show the curve later
compact = {"from": out["week"]["from"], "to": out["week"]["to"], "actors": {a: [r["events"], r["ratio"], r["conflict_ratio"]] for a, r in out["actors"].items()}}
(OUT / f"heat-{out['week']['to']}.json").write_text(json.dumps(compact, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"\n{len(out['actors'])} actors, {done} days; week {out['week']['from']} to {out['week']['to']}")
print("hot (ratio to own baseline):", [(c, out["actors"][c]["ratio"], out["actors"][c]["events"]) for c in hot[:12]])
print("burning (conflict share x conflict ratio):", [(c, out["actors"][c]["conflict_share"], out["actors"][c]["conflict_ratio"]) for c in burn[:10]])
print("loud (articles):", [(c, out["actors"][c]["articles"]) for c in loud[:10]])
print("codes not actors:", sorted(out["not_actors"].items(), key=lambda kv: -kv[1])[:12])
