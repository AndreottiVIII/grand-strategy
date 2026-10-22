"""Translations (Davide, 2026-10-22: an Italian version, texts translated by model, a language toggle).

English stays the truth in data/. A translation never lives in a card: it lives in data/i18n/<lang>/texts.json,
keyed by the fingerprint of the English text (FNV-1a 32-bit over UTF-8, hex), so that when an English text is
edited its translation lapses by itself and the next pass redoes it. The site computes the same fingerprint at
render time (docs/app.js, function h) and looks the translation up; whatever is missing shows in English.

  python tools/i18n.py status  [--lang it]            how much is translated, by kind
  python tools/i18n.py extract [--lang it] [--kinds cards,notes,rows,ui] [--batch 30000]
        writes data/i18n/<lang>/batches/<kind>-NN.yaml with the untranslated texts (hash, kind, en, it: "")
  python tools/i18n.py merge   [--lang it]            folds every filled batch into texts.json, deletes the batch
  python tools/i18n.py names   [--lang it]            actor names from Wikidata labels (states and organisations)

Kinds: cards (objectives, means, constraints, paradoxes, reading), notes (hand-written stance notes), rows
(hand-written relation summaries), ui (the site's own strings, extracted from the rendered pages into
data/i18n/<lang>/ui-keys.json by the browser helper window.__i18nKeys()). Templated texts (mirrored stances,
dataset rows) are not translated one by one: their templates are, in data/i18n/<lang>/templates.yaml.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
sys.stdout.reconfigure(encoding="utf-8")
args = [a for a in sys.argv[2:] if not a.startswith("--")]
opts = {a.split("=")[0][2:]: (a.split("=")[1] if "=" in a else True) for a in sys.argv[2:] if a.startswith("--")}
LANG = str(opts.get("lang", "it"))
D = DATA / "i18n" / LANG
D.mkdir(parents=True, exist_ok=True)
TEXTS = D / "texts.json"


def h(s):
    """FNV-1a 32-bit over UTF-8 bytes, 8 hex digits; identical to h() in docs/app.js"""
    x = 0x811C9DC5
    for b in str(s).encode("utf-8"):
        x = ((x ^ b) * 0x01000193) & 0xFFFFFFFF
    return f"{x:08x}"


def texts():
    return json.loads(TEXTS.read_text(encoding="utf-8")) if TEXTS.exists() else {}


def english(kinds):
    """every translatable English text, as (kind, text), deduplicated"""
    out, seen = [], set()

    def add(kind, s):
        s = str(s or "").strip()
        if s and s not in seen:
            seen.add(s)
            out.append((kind, s))
    if "cards" in kinds:
        for f in sorted((DATA / "actors").glob("*.yaml")):
            a = yaml.safe_load(f.open(encoding="utf-8")) or {}
            gs = a.get("grand_strategy") or {}
            for sec in ("objectives", "means", "constraints", "paradoxes"):
                for it in gs.get(sec) or []:
                    add("cards", it.get("text") or it.get("summary"))
            add("cards", gs.get("reading"))
    if "notes" in kinds:
        for f in sorted((DATA / "stances").glob("*.yaml")):
            for st in (yaml.safe_load(f.open(encoding="utf-8")) or {}).get("stances", []):
                if not st.get("reciprocal_of") and not st.get("dataset"):
                    add("notes", st.get("note"))
    if "rows" in kinds:
        for f in sorted((DATA / "relations").glob("*.yaml")):
            if f.name.startswith("_"):
                continue
            for r in (yaml.safe_load(f.open(encoding="utf-8")) or {}).get("relations", []):
                if not r.get("dataset"):
                    add("rows", r.get("summary"))
    if "ui" in kinds:
        p = D / "ui-keys.json"
        if p.exists():
            for k in json.loads(p.read_text(encoding="utf-8")):
                add("ui", k)
    return out


def cmd_status():
    t = texts()
    for kind in ("cards", "notes", "rows", "ui"):
        en = english([kind])
        done = sum(1 for _, s in en if h(s) in t)
        chars = sum(len(s) for _, s in en)
        print(f"{kind:6} {done:5}/{len(en):5} translated  ({chars/1000:.0f}k chars English)")
    print(f"{len(t)} translations in {TEXTS.name}")


def cmd_extract():
    kinds = str(opts.get("kinds", "cards")).split(",")
    size = int(opts.get("batch", 30000))
    t = texts()
    bdir = D / "batches"
    bdir.mkdir(exist_ok=True)
    pending = [(k, s) for k, s in english(kinds) if h(s) not in t]
    n, batch, chars, written = 0, [], 0, 0
    existing = len(list(bdir.glob("*.yaml")))

    def flush():
        nonlocal n, batch, chars, written
        if not batch:
            return
        n += 1
        p = bdir / f"{'-'.join(kinds)}-{existing + n:02d}.yaml"
        with p.open("w", encoding="utf-8", newline="\n") as f:
            f.write(f"# Translate every `en` into {LANG}. Write the translations to the file {p.stem}.out.yaml next to this one,\n"
                    f"# as `items:` of `- hash: <same hash>` / `it: <translation>`, appending one item at a time (valid YAML at\n"
                    f"# every step), never editing this file. Keep names, dates, numbers and quotes; register of a foreign-office\n"
                    f"# brief: dry, precise, no flourish.\n")
            yaml.safe_dump({"lang": LANG, "items": [{"hash": h(s), "kind": k, "en": s, "it": ""} for k, s in batch]}, f,
                           sort_keys=False, allow_unicode=True, width=200)
        written += len(batch)
        batch, chars = [], 0
    for k, s in pending:
        batch.append((k, s))
        chars += len(s)
        if chars >= size:
            flush()
    flush()
    print(f"{written} texts in {n} batch files under {bdir} (kinds {kinds}, {size} chars each)")


def cmd_merge():
    """a batch is translated in its .out.yaml (items: [{hash, it}], appended one by one so nothing is lost on a cut);
    translations may also sit in the batch's own `it` fields; a batch fully translated is deleted with its .out"""
    t = texts()
    bdir = D / "batches"
    added = 0
    for p in sorted(x for x in bdir.glob("*.yaml") if not x.name.endswith(".out.yaml")):
        doc = yaml.safe_load(p.open(encoding="utf-8")) or {}
        items = doc.get("items") or []
        got = {it["hash"]: str(it["it"]).strip() for it in items if str(it.get("it") or "").strip()}
        out = p.with_name(p.stem + ".out.yaml")
        if out.exists():
            try:
                for it in (yaml.safe_load(out.open(encoding="utf-8")) or {}).get("items") or []:
                    if it.get("hash") and str(it.get("it") or "").strip():
                        got[it["hash"]] = str(it["it"]).strip()
            except yaml.YAMLError as e:
                print(f"  {out.name}: unreadable ({str(e)[:60]}), skipped")
        valid = {it["hash"] for it in items if h(it["en"]) == it["hash"]}
        for k, v in got.items():
            if k in valid:
                t[k] = v
                added += 1
        if items and all(it["hash"] in got for it in items):
            p.unlink()
            if out.exists():
                out.unlink()
        else:
            print(f"  {p.name}: {sum(1 for it in items if it['hash'] in got)}/{len(items)} translated, kept")
    TEXTS.write_text(json.dumps(t, ensure_ascii=False, indent=0, sort_keys=True), encoding="utf-8")
    print(f"{added} translations merged; {len(t)} in {TEXTS.name}")


def cmd_names():
    """Italian labels for states and organisations from Wikidata; armed groups and sub-state actors keep the English name"""
    states = json.loads((DATA / "datasets" / "wikidata" / "states.json").read_text(encoding="utf-8"))
    orgs = json.loads((DATA / "datasets" / "wikidata" / "org-ids.json").read_text(encoding="utf-8"))
    qids = {}
    for iso, rec in states.items():
        if (DATA / "actors" / f"{iso}.yaml").exists():
            qids[rec["q"]] = iso
    for oid, rec in (orgs.items() if isinstance(orgs, dict) else []):
        q = rec[0] if isinstance(rec, list) else rec.get("q") if isinstance(rec, dict) else rec
        if q and (DATA / "actors" / f"{oid}.yaml").exists():
            qids[q] = oid
    names = {}
    ids = list(qids)
    for i in range(0, len(ids), 50):
        batch = ids[i:i + 50]
        u = ("https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=" + LANG + "&ids=" + "|".join(batch))
        req = urllib.request.Request(u, headers={"User-Agent": "grand-strategy-atlas/1.0 (davide.caniatti@gmail.com)"})
        ents = json.load(urllib.request.urlopen(req, timeout=120))["entities"]
        for q, e in ents.items():
            lab = (e.get("labels") or {}).get(LANG, {}).get("value")
            if lab:
                names[qids[q]] = lab
    (D / "names.json").write_text(json.dumps(names, ensure_ascii=False, indent=0, sort_keys=True), encoding="utf-8")
    print(f"{len(names)} names in {LANG} -> {D / 'names.json'}")
    print("  sample:", {k: names[k] for k in list(names)[:8]})


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    {"status": cmd_status, "extract": cmd_extract, "merge": cmd_merge, "names": cmd_names}.get(cmd, lambda: sys.exit(__doc__))()
