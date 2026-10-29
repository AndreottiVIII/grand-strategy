# Apply-cards log (2026-10-29)

Method: a text-level YAML editor resolves each edit on the composed tree, rewrites only the raw span of the scalar
(quoting, wrapping and CRLF kept), bumps `last_verified` of the stance/row whose text changed, and verifies leaf by
leaf that nothing else moved. Backup of `data/` and `tools/` taken before the first edit. No commit, no push, no i18n merge.

## Applied
- 1-4: USA (reading, paradox 2, Iran stance note), RUS (constraint 1 + Bank of Russia source, paradox 3, reading), CHN (means, objective 2). Card-level `last_verified` not bumped (cards have none per item).
- 5: relations/LCA (1 row).
- 6-11: 15 + 17 + 9 + 7 + 25 + 33 edits (all places named in the document).
- 12: 403 "Mirror of ..." sentences (the 404th, CAF->RUS, went in item 10): 310 dropped, 93 cut before the colon with the capital restored (2 by hand: MLI->FRA, MNE->SRB, fragments with no colon).
- 13: 12 `last_verified` dates. 14: new data/stances/LCA.yaml (2 stances, text as written), then `reciprocate --write` added TWN->LCA, GBR->LCA.
- 16: no change proposed. 17: CAN->IND rival -> reluctant_partner + note. 18: ARE->ERI partner/cooling -> neutral/stable + note.
- 19: PER->CHN row 0 deleted, note of the 36.2% row rewritten. 20: tiers: 56 Wikipedia citations by domain (generator `cite_tier` in tools/datasets/recognition.py, same rule applied to the file, NOT regenerated: it needs the network) + 26 same-URL rows to the majority tier. 21: the ten publisher spellings (AP 244, Reuters 179+18, AllAfrica 174, AP 102, BBC 78, Wikipedia 30, TCA 27, Brussels Times 23, Business Standard 20; checked against the document counts, all but the dedup of aliased nodes). 22: "the the" fixed in 83 titles + generator; URL comma left as the document says. 23: 7 YEM units + ISL value null (no `last_verified` bump: unit labels only).
- 25 (GRC a, b, c with sources MFA/Reuters/Al Jazeera), 26 (HTI a, b, c + AP source dated 2026-10-22), 27 (nsa-houthis row: summary, new `note`, 2 sources, same as YEM).

## Not done / deliberate
- Item 7 of the mandate (the 57): written co-member reciprocals found = **69**, not 57 (48 whose source stance is `ally`, 9 `reluctant_ally` = 57; 12 whose source is `partner`). Nothing deleted. `reciprocate.py` is fixed (skips NATO/EU/CSTO co-members); a dry run now proposes nothing more.
- 25b trend GRC->LBY left `warming`: the mandate allows grade/trend changes only for 17 and 18.
- Left as written: ESP->ARG still says "Rival, because of the sustained friction" after item 6; SOM->sub-jubaland keeps "provisional"; actor-card "Sharpened 2026-10-16" in ARG, MEX, NGA not in the 22 places; item 21 extras (US/U.S. Department, EastAfrican, TimesLive) not in the ten.
- Item 24 (sub-western-sahara) not touched by me (the file changed in the meantime: `parent: MAR`, someone else).
- Source order: new sources of one list are appended in reverse order of insertion (cosmetic).

## Build and Italian
- `python tools/build.py`: OK, 145 warnings, 4417 stances.
- `i18n.py extract --kinds=cards`: 11 texts; translations in `data/i18n/it/batches/cards-01.out1.yaml` (11/11, hashes match). Not merged.

## The 57 written co-member reciprocals deleted (from -> to; source stance ally/reluctant_ally; the 12 with a hand-written partner source kept)
DEU->FIN, DEU->HRV, DEU->SVK, DEU->SWE, DEU->NOR, DEU->DNK, DEU->EST, DEU->LTU, DEU->LVA, DEU->GBR, DEU->ITA, DEU->NLD, DEU->BEL, DEU->PRT, DEU->GRC, DEU->CAN, DNK->ISL, DNK->CAN, ESP->PRT, FIN->LTU, FRA->DNK, FRA->FIN, FRA->ROU, FRA->NLD, FRA->CYP, FRA->BEL, FRA->PRT, FRA->CAN, GBR->DNK, GBR->EST, GBR->FIN, GBR->LVA, GBR->NOR, GBR->ITA, GBR->NLD, GRC->ROU, HUN->CZE, HUN->SWE, HUN->DEU, HUN->SVN, ITA->BGR, ITA->HRV, ITA->ESP, NOR->CAN, POL->SWE, POL->EST, POL->GBR, POL->CAN, TUR->ALB, TUR->BGR, TUR->MNE, TUR->ROU, TUR->SWE, TUR->DEU, TUR->FRA, TUR->ITA, TUR->BEL
