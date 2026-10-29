# Fix code report (2026-10-29)

`python tools/build.py` ends OK, twice, with different PYTHONHASHSEED values: `docs/` byte-identical (index.html stamp apart). No commit, no push.

## Fixed (browser pane checked: Palestine hover, #/view/PSE, KWT, Fiji, BRA "51.8%", ?lang=it dossier SRB / gatherings / theatres, Watch mobile, no error on 24 pages)
- Site: 1 (egg portrait 500px), 2 (GEO_ALIAS applied at load; flags follow), 3 (`first_sentence` in build.py), 4 (minmax grid, table max-width), 5 (`toTop()` resets window, body, html),
  7 (UI_ALL = base + td/b/em/span/div leaves; names run and `.lst` lists are one placeholder; neighbour sentence split; `<html lang>`; POV groups through T()), 8 (DNK, sub-greenland, sub-western-sahara),
  11 = B5 (snapshots of earlier days only), 12, 13, 14, 17 (text agent had it), 20, 21, 22 (largest piece / seat fallback), 23 (ellipsis + title), 25, 26 (`poss()`, regions without slugs), 28 (pov set only from reading pages or by address), text BUG 11 (theatre names through T(); Italian names added to texts.json).
- Data: B1/B2 (T() on the block, then split at `.!?` + space + capital; abbreviations kept together), B3, B4, I7, I2 (sorted sets; also convergences, memberships.json), I3 (Denmark: Wikidata types the state as "Kingdom of Denmark" with no ISO code; Q35 added to the SPARQL; borders, weight regenerated), I4 (`watch:[{date, what}]` warns), I5 (TMP->TLS; ROU, SVN, MNE, BIH, XKX counted by event place, FIPS pairs checked in the files; no write if no day read), I6 (`data/datasets/fetched.json`, seeded with the last commit day for recognition and UN votes), I15 (proposals.html, proposals2.html: nothing referenced them, deleted from docs/), C6 (`ISO3_FIX` removed; XKS handling is live, left).
- Not done: gangs short name "the gangs" (data, needs Davide's ok); Fiji's own label sits off frame; raw unit ids ("share of nis equity") are data.

## Org seats (tools/datasets/org_seats.py, Wikidata P159 -> city -> P625)
Found (27): AU Addis Ababa, Arab League Cairo, ASEAN Jakarta, CEFTA Brussels metropolitan area, CELAC Caracas, CIS Minsk, CoE Strasbourg, Commonwealth City of Westminster, CSTO and EAEU Moscow, EAC Arusha, ECOWAS Abuja, GCC Riyadh, ICC The Hague, Mercosur Montevideo, OAS Washington, OECD Paris, OIC Jeddah, OPEC and OSCE Vienna, OTS Fatih, PIF Suva, SAARC Kathmandu, SADC Gaborone, SCO Beijing, UN New York, WTO Geneva.
None in Wikidata (not drawn): AES, BRICS, CPTPP, G7, G20, MSG, NAM, Quad. All 32 Wikidata links now point to the English Wikipedia article.

## I1 (reciprocate.py vs build, 57 stances), no data touched
1. `build.py` mirrors only where the other side has no stance; NATO/EU/CSTO co-members already have the dataset floor "ally" (treaty), so the build adds nothing there.
2. `reciprocate.py --write` writes `partner` into the files (RECIP has no treaty exception), and a written stance replaces the floor: 57 pairs read "partner".
3. ONTOLOGY (2026-10-16) says the mirror is structural and the treaty floor is "ally": the build is right.
4. Fix: reciprocate.py skips pairs that are co-members of org-nato/eu/csto in `_wikidata.yaml`; then delete the 57 `reciprocal_of` partner stances.

## Site strings
`data/i18n/it/ui-keys.json` 361 -> 844 (union, data texts filtered out). `i18n.py status`: ui 393/844, so **451 site strings untranslated** (new keys of the pages the text agent rewrote included). Cards 3352/3352.
