# Brief: Maldives (MDV)

You are writing the grand-strategy card of **Maldives** (actor id `MDV`, region `south-central-asia`) for the atlas in `C:\Users\davide\Desktop\ClaudeTower\grand-strategy`. Economical pipeline: fixed reading list, text not HTML, no prose reports - write the YAML files directly and make the build pass. Today is 2026-10-12. Other agents are writing other actors in parallel: edit ONLY `data\actors\MDV.yaml`, `data\stances\MDV.yaml`, `data\relations\MDV.yaml`; never edit another actor's files; create a stub only if an actor id you need is missing from `data\actors\` (copy the shape of `data\actors\BRA.yaml`).

## Read first, in this order
1. `ONTOLOGY.md` - the data model, grades, bonds, evidence rules. Follow it exactly. Adversary = mortal enemy only (actors seeking each other's destruction, Iran-Israel): a parliament calling Russia a "terrorist state" or an intelligence service naming it the main threat still gives `rival`, because the aim is deterrence, not the end of the other state; co-members of NATO/EU with friction are `reluctant_ally`, never `rival`; the EU is `partner` for non-members; the grade follows the structural position, never rhetoric.
2. **Reuse before researching (owner's rule).** Run `grep -l "MDV" data/stances/*.yaml data/relations/*.yaml research/*/*.md` and read every row, stance and source the atlas already holds about Maldives. Mirror them: another actor's row toward Maldives with its sources is the evidence base for Maldives's side, with the SAME URLs reused; a treaty is one row for both sides; stances are never copied (the grade is the other side's view), evidence always is. Say in your report what you mirrored.
3. The datasets already hold memberships (`data/relations/_wikidata.yaml`), recognitions (`_recognition.yaml`) and UN votes: do NOT write those rows. Write what the datasets cannot.
4. `data\actors\XKX.yaml`, `data\stances\XKX.yaml`, `data\relations\XKX.yaml` as the model of shape and quality (the Kosovo card).
5. The existing stub `data\actors\MDV.yaml`: keep id, iso2/flag, coords, wikipedia; set `regions: [south-central-asia]`, `card: full`, `last_verified: 2026-10-12`, `tier` as below, and `grand_strategy`.

## Reading list (then targeted searches only for gaps)
- Wikipedia "Foreign relations of Maldives" and "Maldives" as the index: take facts WITH the citation under them and cite that, never Wikipedia itself. Use the MediaWiki API (`https://en.wikipedia.org/w/api.php?action=parse&page=...&prop=wikitext&format=json`) or the plain page text, never full HTML.
- The government's foreign ministry site and official statements (tier 1); the national statistics office, central bank, World Bank, IMF, SIPRI for numbers (tier 1).
- Reuters, AP, Al Jazeera, Euronews, BBC and the region's quality press (tier 3); Crisis Group, Carnegie, ECFR, Chatham House, CSIS, IISS, ISPI, OSW (tier 2). Sources in other languages are welcome with `title` in English and `title_original`.
- Cover 2022-2026 with emphasis on 2025-2026: the actor's main disputes and claims, its patrons and clients, alliances and their frictions, sanctions, the Ukraine and Gaza positions, the dependencies that bind it (energy, trade, arms, debt, remittances, foreign troops), the dated events that defined it. Its neighbours in the queue: IND, PAK, AFG, BGD, LKA, NPL, BTN, KAZ, UZB, TKM, KGZ, TJK.

## Write (minor tier, `tier: minor`) - keep it short and sourced
English, YAML, every claim with sources (url, title, publisher, date, tier); confidence A/B/C; dates YYYY-MM-DD / YYYY-MM / YYYY.
- `data\actors\{ID}.yaml`: 3 ranked objectives; 2-3 means; 3 constraints; 1 paradox if one is obvious (else an empty list is fine); a reading of two or three sentences.
- `data\stances\{ID}.yaml`: 4-6 stances: the neighbours that matter, the patron or former colonial power, and whichever of the United States, China, Russia, the EU shapes its choices. Each with grade, trend, bond, since, last_verified, confidence, note, sources.
- `data\relations\{ID}.yaml`: 8-14 rows: 1-2 objectives, 1-2 alignments, 2-4 dependencies with numbers (trade, aid, remittances, debt, troops), 3-5 dated actions 2022-2026.
Budget: at most 15 web calls and no more than about 60,000 tokens; prefer the Wikipedia index plus two or three official or quality-press pages. Stop when the floor is laid.


## Then
Run `python tools/build.py` from the repo root until it ends with "OK"; answer any structural warning about MDV in the relevant stance note. Report in under 200 words: counts written, the five most important grades with the justifying source, what you mirrored, open gaps, number of web calls. Do not paste YAML.
