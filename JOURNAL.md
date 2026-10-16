# Journal

## 2026-10-16 · Mexico (MEX) enriched to protagonist standard, Sonnet, 37 web calls

The Haiku-economy card was extended, not rewritten. Counts: objectives 4 to 6, means 3 to 6 (military, diplomatic, informational added), constraints 3 to 6, paradoxes 3 to 6 (cartels as pretext, judicial reform, nearshoring under tariffs added; the remittance tax and the China tariffs were already there, the US-market lever sits in constraint 3 and the nearshoring paradox), stances 10 to 25, relations 9 to 40. Tier field moved from `minor` to `protagonist` (the queue already said protagonist).

Sharpened against sources, each stated in the text: (1) the 25% fentanyl tariffs no longer exist: the Supreme Court struck down the IEEPA tariffs on 20 Feb 2026, a 10% Section 122 surcharge followed (24 Feb), then a 10% Section 301 duty on non-USMCA goods from 24 Jul 2026; Section 232 duties stay. The USA card (stance and sanction row toward MEX) still describes the 25% tariffs and was not edited here; it needs the same correction. (2) Mexico's tariffs on Asia: 50% was the Sept 2025 proposal; the enacted text (Senate 76-5, 10 Dec 2025, in force 1 Jan 2026) caps most lines at 35%, passenger cars 20% to 35%. (3) Cartel transfers: 29 + 26 + 37 = 92, not "dozens". (4) Cuba oil: no fuel since Jan 2026 (Reuters via CUB card).

Grades: ARG first written rival, moved to reluctant_partner after the ARG card (written in parallel) read the pair that way on the ESP precedent. ECU and GTM provisional reciprocals replaced by hand-written stances. All new grades toward RUS, ISR, SLV, DEU, HND, PSE, JPN are C: no source uses the grade, they are our reading from cited events. Gaps: the Peruvian ambassador, Banxico remittances for 2026, the Mexico-Venezuela channel after Maduro, the USMCA talks after 12 Oct (one headline, article unread), Mexico's ICJ intervention (only the BRA card's claim).

## 2026-10-16 · South Africa (ZAF) enriched to protagonist standard

The Haiku-economy card was extended, not rewritten: objectives 4 to 6, means 3 to 6, constraints 3 to 6, paradoxes 3 to 6, stances 9 to 25, relations 10 to 40; tier set to protagonist; two paragraphs added to the reading. About 40 web calls (searches shared with other agents ran out at the end, so Angola and the African Union were not reached). Changes to existing entries, each because a source contradicts or fills a stated gap: the USA stance now counts the Rasool expulsion (14 March 2025, now sourced); the RUS stance and the Lady R row now carry the Mojapelo panel's outcome (3 September 2023, no evidence of weapons loaded; grade and C unchanged); the org-sadc trend moves from cooling to warming (South Africa interim chair 7 November 2025, formal chair 17 August 2026); the Botswana stance, formerly a provisional reciprocal, is rewritten from Pretoria's side. Gaps: AGO and org-au (no source read; no stance written), Saudi Arabia and Egypt are dated (2022 and 2024), the SADC and Durban communiqués and the UK factsheet were seen as links and search summaries, not opened, and several tier 3 pages (Engineering News, Business Day, Scotsman) returned HTTP 403 or no connection. The neighbour export values are Trading Economics (tier 4) and are flagged C. Reciprocal stances toward ZAF were generated in 18 other cards by the reciprocate pass.

## 2026-10-16 · Saint Lucia (LCA) card, Flash: thin, two web calls, gaps logged

Two web calls: the Wikipedia API for "Foreign relations of Saint Lucia" (wikitext: Taiwan relations from 7 May 1984 (13 January 1984 in the list), severed 29 August 1997 for the PRC, restored 30 April 2007 (1 May 2007 in the prose), embassy in Taipei 4 June 2015, the first in Asia; US relations since 11 June 1979 with drug transit as the lead's "tension"; UK relations since 22 February 1979 and the CARIFORUM-UK EPA; UNSC 940 backing on Haiti as a CARICOM member). The second call, the AP Saint Lucia hub, was refused by the fetch tool (apnews.com is not reachable from our agent), so no wire page was read.

Written: the actor card, stub turned full (two objectives, one means, one constraint, one paradox, three-sentence reading; all C, the only source being Wikipedia, tier 4, plus the Commonwealth member list for the UK link); a relations file with two rows (TWN recognition since 30 April 2007, C; GBR CARIFORUM-UK EPA, C, since = the 1979 diplomatic-relations date because the signing date is not in the source). No stances file: a grade must cite a source that uses that reading, and Wikipedia does not carry "partner", so none was recorded. The build passes with `--skip-running`; LCA's relations file is validated only in an unskipped build, where no LCA error appears.

Mirror: no stance in data/stances names LCA (grep "toward: LCA": none), so nothing is mirrored; TWN holds none toward LCA. The dataset rows (recognition of Kosovo 2011 and Palestine 2015, the LCA-to-TWN row with since null, Commonwealth and OAS memberships) are untouched.

Gaps (brief items with no source read): the December 2025 election and whether Pierre was re-elected (not in the Wikipedia text, no wire page); the United States' 2025 posture and citizenship-by-investment pressure (absent from the text); China's current posture (only the 1997 and 2007 switches are read; no grade); CARICOM and the OECS as seats (not in the text); tourism and the citizenship-by-investment scheme as the economy (no figure, so no dependency rows); the homicide rate and hurricanes as constraints (no source). Next step: a sourced pass with a fresh budget: the Saint Lucia government's foreign ministry, the US State Department page, and a Reuters or AP story on the 2025 election, read directly. Then write the three stances (TWN, GBR, USA) at C with the bond named as our reading.

Note: `data/queue.yaml` lists LCA as `running` (haiku, updated 2026-10-16 14:56) and the build skips its relations file for that reason. If another agent holds LCA, it should pick up these gaps; if not, the queue marker is stale and should be reset.

## 2026-10-16 · Belize (BLZ) card, Flash minor: three web calls, gaps logged

Three web calls: the Wikipedia API (search generator on the dispute, extracts and external links in one call), the ICJ case page 177 (redirected to http://www.icj-cij.org/case/177, not followed: the budget was spent), and one search summary on the 2025 election and the 2021 debt-for-nature swap. No Reuters or AP page was reached: the search tool does not return them here, as the ATG entry also found.

Written: `data/actors/BLZ.yaml` (card full, two objectives, two means, two constraints, one paradox, reading); `data/stances/BLZ.yaml` (rival toward GTM, partner toward GBR with bond kin as the brief asked, partner toward TWN with since null); `data/relations/BLZ.yaml` (recognition_sought toward GTM, influence_goal toward org-icj). Mirror: `grep "toward: BLZ" data/stances/*.yaml` returned nothing, so no card held a stance toward BLZ; the one mirror written is in `data/stances/GTM.yaml` (claimed_territory toward BLZ, bond grievance, the claim itself, C) and `data/relations/GTM.yaml` (territorial_claim toward BLZ, C). Guatemala's claim sits on Guatemala's side, so the mirror is hand-written, not the reciprocal rule's rival.

Gaps (brief items with no source read): the United States (partner, the 2023 embassy and any 2026 accord), Mexico (partner), CARICOM and SICA (no `org-caricom` or `org-sica` actor files exist; the double membership is not in any row), the UK garrison as a relation (no row toward GBR military_presence), the Taiwan recognition date (null). The ICJ hearing dates of 2026 are not sourced: Wikipedia gives the oral arguments from November 2025 and nothing later. The debt-for-nature and tourism figures come from search summaries, not read articles (confidence C). Next step: a sourced pass for the US, Mexico and the regional bodies with a fresh web budget.

Build note: `data/queue.yaml` marks BLZ `running` (14:54), so `tools/build.py` skips `stances/BLZ.yaml` and `relations/BLZ.yaml` while the status holds. Release the status to include them in `docs/data.json`.

## 2026-10-16 · Dominica (DMA) card, Flash: thin, two web calls, gaps logged

Two web calls: the Wikipedia API wikitext of "Foreign relations of Dominica" (read; China 2004 communique and US$12m aid, UK and US dates, US aid channels, no CBI, no Maria, no Reuters or AP citation) and a Reuters site-search (refused by the fetch tool; no Reuters or AP page read).

Written: the actor card, stub turned full (two objectives, one means, one constraint, one paradox, three-sentence reading; all C, Wikipedia tier 4 as pointer); a stances file (CHN partner, USA partner, both stable, bond none, C); a relations file (CHN recognition 2004-03-23, USA recognition 1979-07-18, GBR recognition 1978-11-03, all C). The build passes with `--skip-running`; DMA's stance and relation files are skipped there because data/queue.yaml marks DMA running (14:56), so they were validated only by the full run, which fails on other agents' files (GRD, BLZ, VCT, LCA), not on DMA. Queue not changed.

Mirror: grep "toward: DMA" over data/stances: none; grep "to: DMA" over data/relations: none. Nothing mirrored. The DMA rows in _wikidata and _recognition are dataset rows, left as they are.

Gaps (nothing written, the brief asked for them): citizenship by investment and the 2025 US pressure on it (the Reuters fetch was refused, so no source); the geothermal project; Venezuela (the Isla Aves waters claim is in the Wikipedia index but ALBA and Petrocaribe are not, so no VEN stance); China's post-2004 aid and debt beyond the 2004 figures; CARICOM and OECS (org-caricom and org-oecs do not exist as stubs, and the Wikipedia index gives only the 1994 Haiti contribution); Hurricane Maria 2017 as the constraint (not in the Wikipedia index read, so no row). Next step if wanted: a fresh web budget for a Reuters or AP page on CBI and the US visa measures, and a Maria source (ReliefWeb or World Bank) for the constraint.

## 2026-10-16 · Grenada (GRD) card, Flash: thin, two web calls, almost all gaps

Two web calls, and only press summaries: the Wikipedia API for "Foreign relations of Grenada" (read; its facts are tier 4 pointers, so nothing was cited from it: the 1983 US intervention, the 20 January 2005 resumption of ties with the PRC, the UK ties of 1974, CARICOM and OECS membership, Resolution 940, the Regional Security System) and one search restricted to Reuters and AP, which the domain filter refused with an API error (the search was then repeated unfiltered: the second web call, which returned no Reuters or AP page). The search summaries of the Beryl coverage are cited as tier 3 at C, with the page not opened.

Written: the actor card, stub turned full (two objectives, one means, one constraint, an empty paradoxes list, a three-sentence reading; all C, Beryl and the CARICOM reflex only). A stances file and a relations file with empty lists: the brief asked for two or three stances and rows, but no source read supports any grade toward the United States, China or the UK, and no row toward an actor is sourced. The build skips both files as "agent running" because `data/queue.yaml` still marks GRD as running; they need to be validated after the queue is cleared.

Mirror: no stance in data/stances and no relation in data/relations holds a row toward GRD (grep "toward: GRD" and "to: GRD": none); the only GRD rows in the datasets are Wikidata memberships, the Kosovo and Palestine recognitions and the non-recognition of Taiwan, which were not rewritten. Reuse from neighbours: JAM's CARICOM citations concern Jamaica after Melissa, not Grenada, so none was reused.

Gaps, to fill with a fresh web budget: the United States (1983 is in Wikipedia only; the 2025 Caribbean posture and any radar request are unread); China (the 2005 switch and the stadium are unread; the Wikipedia date is a pointer); the UK and the Commonwealth (the membership is in the datasets; the UK stance needs a source that reads the relation); CARICOM (the 2025-26 chair was not sourced; one search snippet mentions Mitchell taking over the chair, with no date, so it was not written); OECS; the citizenship-by-investment scheme; nutmeg and tourism as the economy (no figure read, so no dependency rows); the paradox (none sourced). The Beryl figure of ninety percent of buildings destroyed on Carriacou is attributed in press to a CARICOM summit report that was not checked.

## 2026-10-16 · Trinidad and Tobago (TTO) minor card, Flash: thin, three web calls, gaps logged

Minor card, three web calls: the Wikipedia API for five titles (Dragon and Manakin-Cocuina gas field pages missing, CARICOM with no extract); one search with a Reuters/AP domain filter, refused by the tool, so Reuters and AP were not reached; one unfiltered search returning Trinidad press and an Al Jazeera page, titles and snippets only, bodies not read. Written: the TTO actor card (stub turned full: 2 objectives, 1 mean, 2 constraints, 1 paradox, 3-sentence reading), 3 stances (USA partner, VEN rival, IND partner with bond kin, all C), 2 relation rows (USA visit and VEN incident, Oct 2025, C).

Grades are our reading, flagged C in each note. No source read uses "partner", "rival" or "kin" for this pair, which the ontology rule ("a grade is never our own judgement") does not allow at confidence A or B. The brief asked for C where the grade is ours; this follows the brief, and Davide should decide whether the rule should tighten for minor cards.

Mirror: no stance or relation in any card pointed toward TTO (grep of data/stances and data/relations for `toward: TTO` and `to: TTO` found nothing), so nothing was mirrored. The Wikidata and Wikipedia-recognition rows from TTO (Commonwealth membership, non-recognition of Kosovo) were left as they are.

Conflict kept: the US Treasury licence for the Dragon project. The Trinidad Express account says it was granted in October 2025 and talks continued; Nation News says it was revoked in April 2026. Both are written into the means.

Gaps (no source read, so nothing written): the CARICOM split over the US strikes (no CARICOM statement found; no org-caricom actor file exists); China (nothing read); Manakin-Cocuina (no Wikipedia page); gas volumes and the share of exports (no sourced number, so no dependency row, which the brief asked for); India (no bilateral source read; the kin bond is our reading from the diaspora); the 2026 Shell and Venezuela talks beyond the search summary.

Build: `tools/build.py --skip-running` exits 1 in the live tree, on errors in NIC, CHN, USA, RUS and BHS, which other cards in progress are writing. TTO is skipped there because `data/queue.yaml` still marks it running (left as orchestration state). In a scratch copy with the other cards reverted and TTO marked done, the TTO files raise no error; the build warns that USA, VEN and IND need their reverse stances (reciprocal, pending). `reciprocate.py --write` was not run, since it writes into other cards.

## 2026-10-16 · Saint Vincent and the Grenadines (VCT) card, Flash: thin, two web calls, gaps logged

Two web calls: the Wikipedia API for Foreign relations of Saint Vincent and the Grenadines (no mention of Taiwan, China, Venezuela, Cuba, Godwin Friday or the post-2025 government; US and UK "close ties", CARICOM and OECS cooperation, UN, OAS and Commonwealth membership, and the drug transshipment point, all tier 4); and a search restricted to reuters.com and apnews.com, which the search tool refused (400, domains not reachable for our user agent), so no wire page was read.

Written: the actor card, stub turned full (two objectives, one mean, one constraint, one paradox, three-sentence reading; grades C as our reading, the UN, OAS and Commonwealth memberships A from the official lists). Stances: TWN partner (C) and USA partner (C), both bond none, trend stable, our reading. No relation file: the only VCT rows that exist come from the Wikidata and recognition datasets (Commonwealth, OAS, UN, Taiwan, Palestine, Kosovo non-recognition), so no new sourced row was added.

Mirror: no stance in data/stances holds a stance toward VCT (grep "toward: VCT": none), and TWN has none toward VCT either. Nothing mirrored.

Note on Taiwan: the Wikipedia page for Saint Vincent's foreign relations does not mention Taiwan, so the recognition rests on the recognition index alone (tier 4). The "since 1981" in the brief is not sourced; the index gives no date and since is null.

Gaps (no source read, nothing written): the government after the November 2025 election and its Taiwan position; China; the Gonsalves-era ties with Venezuela and Cuba (cooling); the UK beyond "close ties"; CARICOM and OECS beyond a pointer; bananas and tourism as the economy; Hurricane Beryl (2024); the La Soufriere volcano. Next pass: a wire page on the post-election policy, read by WebFetch directly (the search tool refuses the wire domains).

Queue: data/queue.yaml still reads VCT "running". Because the card is now full, `build.py --skip-running` publishes a running actor as a stub (tools/build.py line 122), so the status needs setting to reviewed by whoever closes the run.

## 2026-10-16 · Jamaica (JAM) minor card, Flash: thin, three web calls, gaps logged

Three web calls: the Wikipedia API for Foreign relations of Jamaica (empty extract) and Andrew Holness (read, tier 4 pointer only: the 2025 election, the 2022 royal-visit remark, the UK aid mention); one WebSearch with the Reuters/AP domain filter (refused: those domains are not reachable for us, the call may count); one WebSearch restricted to jamaica-gleaner.com (its result summaries, no article body read). Written: the JAM actor card (stub turned full, regions central-america-caribbean; 2 objectives, 2 means, 2 constraints, 1 paradox, 3-sentence reading), 3 stances (USA partner, stable, bond none; GBR partner, stable, bond kin, our reading; CUB partner, cooling, bond affinity), 3 relation rows (org-imf debt package up to US$6.7bn; GUY incident, roofs in Westmoreland; CUB incident, end of the medical programme). All C: tier 3 Gleaner and a tier 4 Wikipedia pointer; no government, UN or IMF page read. Mirrored: nothing, no stance or row toward JAM existed in any card (grep). Gaps logged, not written: no CHN stance (no infrastructure source read); no US security or Rubio-visit row; no UK or CARICOM source beyond the Gleaner headline; tourism, bauxite, remittances and the gangs are the brief's economy and constraint, not yet sourced. Build: the JAM files are valid, but `data/queue.yaml` marks JAM as `running` (another agent may be on it), so `--skip-running` skips them; the plain build fails on NIC and BHS, not on JAM.

## 2026-10-16 · Antigua and Barbuda (ATG) card, Flash: nothing written, two web calls, gaps logged

Two web calls: the Wikipedia API for "Foreign relations of Antigua and Barbuda" (wikitext: diplomatic relations dated 1 November 1981 with the United States and the United Kingdom, 1 January 1983 with China; the citations behind them, history.state.gov and the government's bilateral chronology, were not opened). No citizenship-by-investment, Chinese port or special economic zone, Barbuda land, hurricane or CARICOM posture in the wikitext. One search with the Reuters/AP domain filter: refused by the search tool (both domains are not accessible to our user agent), so no wire page was read and the second call went to that refusal.

Written: nothing. ATG stays a stub (`card: stub`): no tier 1 to 3 source for a posture or objective was read, and the Wikipedia-only dates are tier 4 pointers. Mirror: `grep "toward: ATG" data/stances/*.yaml` returns none, so no card holds a stance toward ATG and nothing is mirrored. The dataset rows already in place (memberships of the Commonwealth, OAS, UN and WTO; recognition rows toward XKX, PSE and TWN) are untouched.

Gaps (brief items with no source read): the United States (proximity, 2025 Caribbean posture, citizenship-by-investment pressure); China (the port, the special economic zone); the United Kingdom (Commonwealth ties, republic question); CARICOM and the OECS as seats; the citizenship-by-investment scheme and tourism as the economy (no figure read, so no dependency rows, since the layer needs a value and unit); the Barbuda land question and hurricanes. Next step: a sourced pass with a fresh web budget. Open the history.state.gov and government chronology pages directly; for the US and China legs find tier 1 to 3 sources other than Reuters and AP, which the tools cannot reach from here.

Note: `data/queue.yaml` lists ATG as `running` (updated 2026-10-16 14:56). If another agent holds ATG, it should pick up these gaps.

## 2026-10-16 · Dominican Republic (DOM) minor card, Flash: thin, four web calls, gaps logged

Four web calls: the Wikipedia API batched (Haiti-DR, DR-US, DR-China, Abinader; the first and third pages empty or missing, the US page gave only expat counts); a search for Reuters/AP on the border wall and deportations (the Reuters story of 6 April 2025 is read through the search summary only); a fetch of the Reuters syndication on Fidelity.com (returned navigation text, no article); a search on the Rubio visit of 6 February 2025 (summaries of Dominican Today, Caribbean Today, EFE via Primicias). No Reuters or AP page text was read.

Written: the actor card, stub turned full (two-to-three objectives, two means, two constraints, one paradox, three-sentence reading; all C); a stances file with two stances (HTI reluctant_partner, cooling, grievance, C; USA partner, warming, none, C); a relations file with two rows (HTI incident, 6 Apr 2025, C; USA visit, 6 Feb 2025, C). The build passes.

Mirror: no card in data/stances holds a stance toward DOM (grep "toward: DOM": none). The build adds the reciprocal USA-to-DOM partner stance as provisional, flagged for the USA reverse pass. `reciprocate.py --write` was not run: it would also write into HTI's files, which are in progress. USA's own file is untouched.

Gaps (no source read, nothing written): the 2026 deportation figures (the search summaries give 67,940 for January-February 2026 and about 226,500 for January-July, but no outlet URL was recorded); the 2018 switch from Taiwan to China (the Wikipedia page for DR-China is missing); the canal or water dispute with Haiti; the gang war in Haiti (only the Kenyan-card sources on the mission); Spain and the EU; CARICOM and the Haiti mission's Caribbean members; tourism and free zones as the economy (no figure read, so no dependency rows). The Wikipedia pages give no dated facts beyond Abinader's own biography. Next step if wanted: a sourced pass on China, Spain-EU and the economy with a fresh web budget, and the deportation figures from the Dominican migration directorate.

## 2026-10-16 · The Bahamas (BHS) minor card, Flash: thin, three web calls, gaps logged

Three web calls: the Wikipedia API for 2026 Bahamian general election (extract: held 12 May 2026, PLP 33 of 41 seats, Davis re-elected); an unfiltered search (Al Jazeera headline and date, plus search summaries); a Reuters/AP domain-filter search (refused by the search tool, so no wire page was read). The search summaries are not written as sourced facts beyond the Al Jazeera headline.

Written: the actor card, stub turned full (one objective, C, Al Jazeera tier 3 and Wikipedia tier 4 as pointer; one mean, A, Commonwealth and OAS official lists, the memberships already in the Wikidata rows; no constraints, no paradox; three-sentence reading). No stance file and no relation file: no tier 1 to 3 source for a Bahamas posture was read. The build passes (`python tools/build.py --skip-running`, 300 actors, 188 full).

Mirror: no card in data/stances holds a stance toward BHS (grep "toward: BHS": none). BHS appears only as the source of Wikidata and recognition dataset rows, not as a target. Nothing mirrored.

Gaps (no source read, so nothing written; the brief asked for them): the United States (proximity, the third-country deportation talks the Bahamas refused in 2025, the OPBAT drug cooperation, tourism); Haiti (migrants, repatriations); China (the port, the stadium, the debt); the United Kingdom (Commonwealth ties, the Privy Council as final court); CARICOM; tourism and offshore finance as the economy (no figure read, so no dependency rows: the layer needs a value and unit); hurricanes; the FATF grey list (the MCO card's FATF copy is a Bahamas-hosted document, but its Bahamas status was not read). Next step if wanted: a sourced pass on the US and China legs and the grey-list status, with a fresh web budget.

## 2026-10-16 · Panama (PAN) card, Flash: three stances, four web calls, gaps logged

Four web calls: the Wikipedia API (batched extracts; Panama-China, Panama-US and the 2025 protests pages missing); a search with the Reuters/AP domain filter (refused, the domains are not reachable for us); an unfiltered search (Reuters-reported canal, port and strike coverage via other outlets); an unfiltered search on the 2024 Venezuela rupture and the Darien figures. No Reuters or AP page was read.

Written: the actor card (two objectives, two means, two constraints, one paradox, three-sentence reading; tier secondary), three stances (USA reluctant_partner warming grievance; CHN partner cooling; VEN rival warming grievance; all confidence C, grades our reading), four relation rows (USA agreement 9 Apr 2025, B; CHN withdrawal from the Belt and Road memorandum, Feb 2025; VEN rupture of 29 Jul 2024; USA Darien crossings fall, 2025). The build passes with no flag; with --skip-running the PAN stance and relation files are skipped because data/queue.yaml marks PAN as running (14:51). Not changed here.

Mirror: USA holds partner (warming, bond none) toward PAN, with the DoD memorandum, the NBC canal-reclaiming piece, the Al Jazeera opposition piece and the Seatrade crisis-over piece; those sources were reused on the PAN side, with the grade and bond read from Panama's side (C, since it is our reading).

Gaps (no source read, nothing written): Colombia (the Darien closure is sourced as a US-driven fall, not a Colombian relation); the EU; the banking centre and the grey lists; the canal drought and the revenue; the 1989 invasion. Stances for COL and EU are therefore not recorded.

## 2026-10-16 · Nicaragua (NIC) minor card, Flash: thin, four web calls, gaps logged

Four web calls: the Wikipedia API for Foreign relations of Nicaragua (extract cut off after the ICJ and UN list); a search with the Reuters/AP domain filter (refused, the domains are not reachable for us); an unfiltered search (Confidencial, USTR proposal of October 2025); a Wikipedia API extract for Costa Rica (refused: exchars above 1,200). No Reuters or AP page was read.

Written: the actor card (one objective sourced, one index-only; two means; two constraints; one paradox; three-sentence reading), four stances (USA rival, CRI rival, RUS partner, CHN partner; all confidence C, grades our reading), two relation rows (CRI territorial_claim; USA sanction, October 2025 proposal). The build passes; the stance and relation files are skipped in docs/ because data/queue.yaml marks NIC as running (14:50), as with other cards. Not changed here.

Mirror: the only card holding a stance toward NIC is the Holy See (VAT: rival, cooling, grievance, confidence C, plus the 2022-2025 incident row). The build adds the reciprocal NIC -> VAT in memory (provisional, flagged); no hand-written NIC -> VAT row, and tools/reciprocate.py --write added nothing (dry run: 0). No USA, RUS or CHN stance toward NIC exists in the data, so nothing was mirrored from them.

Gaps (no source read, so nothing written; the brief asked for them): the Church as internal enemy beyond the VAT incident (bishops' expulsions beyond the Nov 2024 one); the exiles' stripping of nationality (no source here); Ortega and Murillo as co-presidents since 2025 (no source here; the unfiltered search gave no date); the Russian military cooperation and training centre; the 2021 switch from Taiwan and the FTA (the recognition dataset gives non-recognition of Taiwan only, no date); Venezuela and Cuba (affinity); Honduras; the Costa Rica border, San Juan river and exiles; the canal project; remittances and free zones; the USTR final decision (a December 2025 aggregator claim of phased tariffs is unverified and not written). Bonds for RUS and CHN are our reading, not sourced.

## 2026-10-16 · Suriname (SUR) minor card, Flash: thin, mostly gaps

Minor card, three web calls, all used (Wikipedia API, one search, one AP page on kvia.com; the search returned no Reuters page). Written: the actor card (2 objectives, 2 means, 1 constraint, 1 paradox, 3-sentence reading), one stance (NLD, the mirror of the Dutch card's partner/warming/kin reading, same sources, C, `reciprocal_of: NLD`), two relation rows (SUR visit to NLD, Dec 2025, B, royal-house tier 1; SUR agreement with org-imf, C, AP tier 3). The brief asked for three stances and three to four rows; the rest had no tier 1 to 3 source read, so nothing was written.

Caveat: `data/queue.yaml` still marks SUR as `running`, so `--skip-running` leaves `stances/SUR.yaml` and `relations/SUR.yaml` out of `docs/` (the build warns "SUR -> NLD: reciprocal ... write SUR's own side in the reverse pass"). Not changed here: it is orchestration state, as with GAB and GNQ. The plain build (without `--skip-running`) currently stops on `actors/GUY paradoxes[0]: confidence must be A, B or C`, which is not part of this change.

Gaps (no tier 1 to 3 source read, so nothing written): China (the 2024 debt restructuring; only Wikipedia, tier 4, mentions Chinese infrastructure); Guyana (Tigri, the Corantijn dispute and the 2007 PCA maritime award: Wikipedia only, a pointer); France (the Marowijne border and the Maroni gold mining: Wikipedia only); the United States (2025 posture: only APA Corp, a US company, appears, not a state position); India (the diaspora: only Wikipedia's census figures); the Netherlands apology for slavery (in no card and no source read; the Dutch apology row for Indonesia does not cover Suriname); the Geerlings-Simons government's oil-contract stance (a search summary, not read); the IMF programme's 2026 status and amount (the AP "$688" figure has no unit). Wikipedia's extract is tier 4 and was used only to date the July 2025 election and as a pointer.

## 2026-10-16 · Honduras (HND) minor card, Flash: thin, four web calls used, gaps logged

Minor card, four web calls (one Wikipedia API extract; a search that the Reuters/AP domain filter refused; an unfiltered search; a Spanish news page that returned 403). Written: the HND actor card (stub turned full: 2 objectives, 1 mean, 1 constraint, 1 paradox, 3-sentence reading), 2 stances (CHN partner, cooling, C; TWN neutral, warming, C, our reading), 1 relation row (CHN recognition since 2023-03-26, C). The TWN card's stance and sources toward HND were mirrored first: the Bloomberg, ASPI and Tunota sources are reused, not reopened.

Gaps (no source read, so nothing written; the brief asked for them): the United States (Soto Cano base, extradition treaty, deportations, the Hernández pardon, Trump's endorsement, the disputed November 2025 election: the Asfura Wikipedia extract gives 27 January 2026 and a narrow win over Nasralla, but no dispute or endorsement); the 2023 shrimp trade loss; the CA-4 kin stances toward El Salvador and Guatemala (Wikipedia gives SICA membership with no date, CA-4 not mentioned); Nicaragua border; Venezuela; remittances and maquilas as numbers (no figure read, so no dependency rows: the layer needs a value and unit). The Reuters and AP domain filter was refused by the search tool, so no wire page was read. The 30,000 deportations figure is from a search summary of an unopened La Prensa or La Tribuna page (the page returned 403), so it is not written. No USA stance toward HND exists in the USA card, and this card writes none, since no source read supports a grade. The TWN card's objective row toward HND is Taiwan's, so it is not mirrored into HND.

## 2026-10-16 · Uruguay (URY) minor card, Flash: thin, all grades C, US and Orsi's China line logged as gaps

Minor card, four web calls: the Wikipedia API for three titles (Foreign relations of Uruguay had no relevant text; Orsi's intro confirms he is president since March 2025), one web search (no Reuters or AP page came back), the bilaterals.org page of 2022, and The Cattle Site page of 2023, which reports a Reuters story. Written: the URY actor card (stub turned full, regions world plus south-america; 2 objectives, 2 means, 2 constraints, 1 paradox, 3-sentence reading), 4 stances (org-mercosur reluctant partner, cooling; CHN partner, warming; BRA partner, stable; ARG partner, cooling, kin), 4 relation rows (org-mercosur influence_goal; org-eu agreement signed 17 Jan 2026; CHN agreement, comprehensive partnership Nov 2023; CHN trade_share 27% in 2022). Every grade and row is C: tier 3 press and a tier 4 Wikipedia index, no official source read. The EU row reuses the sources the ARG and BRA cards already hold (reuse rule), not a fresh read.

Mirror: no card held a stance toward URY (grep of data/stances), so nothing was mirrored on that side. The Mercosur membership is already the dataset row (tier 1, mercosur.int), so no duplicate row was written.

Gaps (no source read, so nothing written): the United States as partner (no URY-US row, no US stance); Orsi's own China line (the sources are from the Lacalle Pou government, so continuation under Orsi is our reading); the Milei-Orsi distance in 2026 (ARG cooling is ours, from the 2022 and 2023 friction); the Orsi-Xi meeting in Beijing on 3 Feb 2026 and Uruguay's Mercosur presidency from 30 June 2026, both from search summaries of pages not opened; the US$150 million beef-tariff figure (undated article, not used). The Wikipedia foreign-relations extract had nothing on the brief's themes.

Build: `tools/build.py --skip-running` passes (exit 0). The plain build fails only on GUY (paradox confidence, another card in progress), not on URY. `data/queue.yaml` still marks URY `running`, so the skip-running build leaves `stances/URY.yaml` and `relations/URY.yaml` out of `docs/` until the queue entry is set to done. Not changed here: it is orchestration state, as with GNQ and GAB. `reciprocate.py --write` was not run; its dry run lists no URY item.

## 2026-10-16 · Paraguay (PRY) minor card, Flash: thin, four web calls, gaps logged

Minor card, four web calls, all used: the Wikipedia API for Foreign relations of Paraguay and Santiago Peña (the Peña extract came back empty); the AP story on ABC News (404, not read; cited by title only, as the Taiwan card cites it); its Arab News copy (read, the main source); the Wikipedia API for the Itaipú and Yacyretá dams (both extracts empty). Written: the PRY actor card (stub turned full, regions world to south-america; 2 objectives, 2 means, 2 constraints, 1 paradox, 3-sentence reading), 2 stances (TWN partner, affinity, mirrored from the TWN card's own row toward PRY; CHN rival, C, our reading), 2 relation rows (TWN visit 7-10 May 2026, mirror of the TWN row; nsa-hezbollah incident since 2002, mirror of the nsa-hezbollah row). Build with `--skip-running` passes (299 actors, 180 full). The plain build fails on GUY and URY (other cards in progress), not on PRY, and writes nothing.

Gaps (no source read, so nothing written; the brief asked for them): Brazil (Itaipú and the 2024-25 tariff renegotiation); Argentina (Yacyretá, Milei alignment); the United States (the 2025 alignment; the Hezbollah designation itself, only the 2002 joint allegations are sourced); Israel (the 2024 embassy move, which the ISR card lists for Paraguay but cites only for Argentina); the EU (Mercosur-EU signed in Paraguay on 17 January 2026: the only source is the tier-4 Wikipedia link in the BRA card, not enough to support a row); soy, beef and hydropower; China trade through third parties.

Conflict for the TWN card's owner: its note says Peña's Taipei visit included an MoU on an AI computing centre and that Beijing urged Paraguay to "make the right choice" the day before. The Arab News copy of the AP story mentions neither (no agreements, no Beijing offer). Not changed here; the PRY card cites only what Arab News says.

Queue: `data/queue.yaml` still marks PRY as `running` (14:46), so `--skip-running` leaves `data/stances/PRY.yaml` and `data/relations/PRY.yaml` out of `docs/`; the PRY actor file is in. Not changed here: it is orchestration state, as with GNQ and GAB. Until the queue is released the build adds the provisional reciprocal CHN to PRY (rival), and the TWN and PRY reciprocals, from the other cards.

## 2026-10-16 · Equatorial Guinea (GNQ) minor card, Flash: thin, island and sea file only

Minor card, four web calls, all used. Written: the actor card (one objective sourced plus one inferred and flagged C, two means, one constraint, one paradox, 3-sentence reading), two stances (GAB rival C, grievance; MHL rival C, cooling, our reading), three relation rows (GAB territorial_claim; GAB agreement 2016; MHL incident, the mirror of the MHL row with the same sources). No stance toward GNQ existed in any card (grep), so nothing to mirror on that side; the MHL incident row was mirrored as a GNQ-side row. Build passes with `--skip-running` and with the plain build (171 full cards); the plain build adds the reciprocals GAB and MHL toward GNQ.

Gaps (no source read, so nothing written; the brief asked for them and they stay open): the Teodorín conviction in France and the US asset cases; the Bata port and the Chinese naval-base talk; the China debt; the US base question; Spain as former coloniser; Cameroon border; CEMAC and the CFA franc; oil and gas decline as the constraint. Wikipedia's foreign-relations page has no content on any of them (intro only, empty references). Reuters and AP are blocked for the search tool (domain filter refused), so the Mbanié ruling rests on search summaries of BusinessDay and World Oil, not on the ICJ release: the ICJ press release redirects (icj-cij.org), and following the redirect would have been a fifth call. Vote 13-2 (Bloomberg, via a summary) is unverified and is written as such. A 2026 Spanish headline says both states now apply the ruling; unread, so the GAB trend stays stable with no claim.

Queue: `data/queue.yaml` still marks GNQ as `running` (updated 11:02), so `--skip-running` leaves its stance and relation files out of `docs/`. Not changed here: it is orchestration state, as with ZWE.

Other gap: PRT holds a posture toward GNQ in prose (CPLP presidency, opposed by Portugal, Brazil and Timor-Leste) but has no stance row toward GNQ; not mirrored, because a GNQ stance needs a source that reads that posture.

## 2026-10-16 · Gabon (GAB) minor card, Flash: thin, with gaps logged

Minor card, four web calls (Wikipedia foreign-relations extract, a search, the eNCA/AFP page, a second search). No stance toward GAB existed in any card, so nothing to mirror. Written: the actor card (2 objectives, 2 means, 2 constraints, 1 paradox, 3-sentence reading), 1 stance (FRA partner, cooling, C), 2 relation rows (FRA treaty, FRA military presence cap of 200 troops, C). Build passes with `--skip-running` (exit 0).

Caveat: `data/queue.yaml` still marks GAB as `running` (updated 11:02), so the build skips `stances/GAB.yaml` and `relations/GAB.yaml` and they stay out of `docs/`. Not changed here: it is orchestration state.

Gaps (no source read, so nothing written): China (manganese, timber, largest export partner: the only figure, 43% of exports in 2022, came from a search summary of an unopened reference page); the United States (the 9 July 2025 White House meeting and the direct manganese sales idea: the French-language source had no URL in the result); oil decline and public debt as constraints; the CEMAC bloc and ECCAS as actors (no `org-cemac` or `org-eccas` file exists, so no relation row); the CPLP seat (org-cplp exists, but no source read); timber as an economic pillar. The Commonwealth and AU seats are already rows from the Wikidata dataset and are not repeated.

Two sources are pointers only: the eNCA page is an AFP report (tier 3, one source, so C), and the AllAfrica manganese page was not opened (the 2029 raw-export ban and the ore figures come from search summaries). Both are marked C in the rows. The Wikipedia foreign-relations extract is tier 4 and was used only for the CFA/CEMAC membership mention. The troop figure conflicts: the AFP piece says no more than 200, a later secondary report says about 100 (not opened); 200 is used with the discrepancy in the row's summary.

## 2026-10-16 · Zimbabwe (ZWE) minor card, Flash: thin, with gaps logged

Minor card, five web calls at most. `tools/briefs/ZWE.md` does not exist in the repo, so the card
was written from the brief as given in the request. Written: the actor card (2 objectives, 2 means,
2 constraints, 1 paradox, 3-sentence reading), 2 stances (CHN partner
C, USA rival C), 2 relation rows (both CHN: Bikita investment USD 180m, 2022; 1.128 Mt concentrate
exported in 2025). Build passes with `--skip-running`; the plain build fails only on COD and ZAF, not ZWE.

Gaps (no source read, so nothing written): Russia, South Africa, the United Kingdom, the European
Union, Mozambique and the Beira corridor; the Commonwealth readmission bid; the arrears talks; the
ZiG currency; the SADC chair of 2024-25. The Wikipedia foreign-relations page covered none of them
(only the 2018 Commonwealth bid and the 2003 withdrawal). Reuters and AP are blocked for this
agent's search tool, so the sources are Al Jazeera only. The 2030 term-extension signature date
is unverified: the fetched article (24 June 2026) says the bill still needed the president's
signature. Most 2026 lithium figures come from search results on articles not opened; those rows
are marked C.

Queue: `data/queue.yaml` still marks ZWE as `running` (updated 10:54), so the `--skip-running`
build leaves its stance and relation files out of `docs/`. Not changed here: it is orchestration state.

## 2026-10-16 · Nine big cards enriched; the hostile one-sided readings answered

Davide, on the run's close: integrate the thinnest big non-superpower cards with Sonnet. Brazil,
Mexico, South Africa, Nigeria, Argentina, then Colombia, Peru, Chile, Canada: from 2-10 stances
to 15-32 each, 30-40 rows, 5-7 paradoxes (found in passing: the USA card is stale on the IEEPA
tariffs struck down in February 2026, noted in BACKLOG). Then the one-sided readings: 1,135 in all,
988 toward full cards. Decision: partner, neutral and ally one-sided readings keep the provisional
reciprocal as the atlas's reading (rule in ONTOLOGY); only the 87 hostile ones were answered by
hand, mirrored on the written side's evidence (tools/recip_briefs.py, ten Haiku agents, 26 silent
actors, about 45 web calls in all). The silence spoke in a few places: Russia reads Andorra and
Slovenia neutral, not rival; Israel reads Norway reluctant partner and Kuwait neutral; China reads
Latvia neutral; the Houthis read Jordan neutral; Iran reads the Palestinian Authority rival with an
affinity bond while Hamas stays partner. The UK and France rechecks rode in the same pass.

## 2026-10-16 · The world run closes: 200 of 205 cards reviewed, 202 full cards online

By 15:40 UTC every state in the queue is written except three Caribbean micro-states left as stubs
(Bahamas, Antigua, Grenada: nothing sourceable in the flash budget, Reuters and AP unreachable for
agents) and the UK and France rechecks (additions only, on Davide's order). After the morning burst
Davide closed Fable for agents (USA finished with Fable on his explicit order), then Sonnet too:
everything from the Horn onward ran on Haiku, flash for minors, 4-6 agents at a time, resumed from
disk after each kill. The flash cards of Africa and the Americas are thin (2-4 stances, sources
from search summaries, grades C and 'our reading'): the list is in BACKLOG. Still to do before the
atlas is called complete: the one-sided review with Davide (tools/onesided.py: 1,031 readings, 902
toward full cards that wrote nothing back), the dossier formatting pass (the reading above all),
the UK and France rechecks, the three stubs. 38.05M tokens. Weekly usage 37%, Fable 52%.

## 2026-10-16 · Burst at the weekly reset: 113 cards; Southeast Asia, Oceania, North Africa and the Horn

Davide at the reset: burn the expiring five-hour window with as many cards as possible, then
hold to 80% weekly in the next window. Up to twenty agents ran at once: Thailand, Malaysia,
Singapore, Myanmar, Australia, Cambodia, Laos, Brunei, Timor-Leste, Papua New Guinea, Fiji, New
Zealand, Tunisia, Mauritania, Algeria, Morocco, Libya, Sudan, Eritrea, South Sudan, Tonga and
Solomon Islands reviewed and online (115 full cards, ~24.7M tokens). Cost of the burst: the
shared web-search quota ran out after 10-17 searches per agent, so the late cards lean on
fetches and the Wikipedia API; and at 07:00 the five-hour limit killed eleven agents in flight
(USA, China, Ethiopia, Somalia, Kenya, Rwanda, Tanzania, Djibouti, Uganda, Samoa, Vanuatu). Files
left on disk were resumed after the 07:30 reset, six agents at a time.

Decisions and corrections in review: the junta's reading of the NUG and PDFs is adversary (the
2021 terrorist designation), the Arakan Army rival (truces); Singapore reads Myanmar as reluctant
partner, mirrored from Myanmar's card; Fiji now reads Australia as ally (Veitacini Treaty of 6 Jul
2026, mirrored from Australia's card); Eritrea reads Ethiopia as adversary, as Ethiopia reads
Eritrea (the October 2026 rupture: embassy closed, troops in Tigray, Article 51 at the Security
Council, Assab); Australia reads China as rival, warming (AUKUS and the Pacific denial web against
the trade thaw); Morocco reads the Polisario as adversary and Ceuta-Melilla as claimed territory.
Faults rule widened on Davide's decision ("loro sono tipico esempio e devono esserci"): a claim on kin
territory (posture claimed_territory with bond kin) is a feud, so China-Taiwan appears on the Faults
page; Taiwan's reading of China raised from C to B on Taipei's own 'foreign hostile force'
designation. ONTOLOGY.md updated.

Davide's question of the morning, "Cina e Russia non sono reluctant ally?": by the ontology no (no
defence clause, and the reluctance is asymmetric, Moscow wants the alliance Beijing refuses), so the
pair stays partner with affinity. What was missing was the bloc of fact: a derived rule (both
partner, affinity, a shared enemy) was tried on the data and rejected, since it mostly finds pairs
that merely share Russia as a rival. Chosen instead ("proviamo!"): a hand-written field
`alignment: de_facto`, written with a source and reviewed like a grade, counted as an allied leg in
Seams, Clients and Gatherings and drawn as a dashed band on the map; the build adds `treaty` by
itself. Marked on both sides for China-Russia, Russia-Iran, Japan-Taiwan, India-Japan, Qatar-Hamas.

Clients corrected after Davide's screenshot ("ovviamente non puo' essere cosi'"): the United States
read as a client of the United Kingdom because the lean only measures regard (ally against the
placeholder UK card's reluctant ally). Two guards: ally/reluctant-ally pairs are tepid alliances,
listed apart; a patron must weigh at least half its client (cards reading each actor as the proxy).
Six client pairs remain, three tepid alliances (US-UK, US-Saudi, Croatia-Slovenia).

Theatres map redrawn on Davide's remark that the clash zone must glow, not the actors: each theatre is
now a circle of hand-set radius around its centre (data/theatres.yaml, `radius`), lit by its heat;
members are outlined only when a theatre is chosen.

Flanks page added on Davide's question ("qualcosa sui nemici dei miei nemici?"): for every actor and
every enemy it reads, the others who read that enemy as hostile, sorted as recruited, open or false;
ranking by open flanks; Byzantine reading in the lede and in About. Section in ONTOLOGY.md.

A Wikidata membership row made Australia an ASEAN member: removed from the dataset and excluded in
the generator (WRONG set in tools/datasets/wikidata.py). New tool `tools/onesided.py` lists the
readings that have no hand-written counterpart: Davide wants to review them with me before the
atlas is declared complete. Thin minor cards (South Sudan, Eritrea, Tonga, Solomon Islands,
Mauritania, Laos, Bahrain) and an eastern-Libya actor are in BACKLOG. Next: the Horn resumed,
Tanzania, Rwanda, Burundi and the Indian Ocean islands, the Pacific micro-states, then West,
Central and Southern Africa and the Americas; UK and France rewritten with Fable last.

## 2026-10-14 · 91 cards: Russia, Israel, Central Asia, East Asia; stopped at 91% weekly, Fable at 97%

Davide reopened the run in the morning ("fino al 95%", then 93%). Written: Russia (Fable, part
two, stopped at 95% of the Fable window at the build step with a complete card on disk, reviewed
from disk: Ukraine the only adversary in Europe, USA rival with a thaw, China partner, North Korea
and Belarus allies), Israel (Iran, Hamas, Hezbollah, Houthis adversaries; USA ally; Palestine
rival), Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan, Maldives, Mongolia, Japan,
South Korea, North Korea, Taiwan, Indonesia, Philippines, Vietnam. Regions complete: Balkans,
all Europe, Middle East, South and Central Asia, East Asia. 18.84M tokens. Site fixes: data.json
fetched with a time stamp (stale cached index no longer shows old cards); the dossier no longer
crashes on a contested claim by an unknown actor id (Israel). Davide's remark on derived treaty
allies (CSTO co-members painted green) is in BACKLOG. Stopped with Fable at 97%, since this
session runs on Fable too; resume Friday after the reset with Southeast Asia and Oceania (THA,
MYS, SGP, MMR, KHM, LAO, BRN, TLS, AUS, NZL, the Pacific), then Africa and the Americas, then USA
and China with Fable, then UK and France rewritten.

## 2026-10-13 · Five readings on top of the data: Seams, Clients, Faults, Gatherings, Currents, and Theatres

Built one at a time with Davide, each proposed, shown, corrected, then written into ONTOLOGY.md.
All computed by the build from hand-written stances of confidence A or B (reciprocals and dataset
stances never count, except that treaty alliances count for a gathering's maturity): seams (an ally
of two rivals), clients (the lean between two readings of the same pair, Luttwak's client system),
faults (bond against posture: feuds and Byzantine alliances), gatherings (the counter-coalition an
actor summons, with maturity), currents (trends weighted on a doubling scale, drift and turbulence,
alarms, snapshots since the last build; warming outlines breathe and cooling ones flicker on the
map), theatres (seventeen hand-kept theatres with a heat; adversaries very high, rivals high,
reluctant low; their own map, filled by heat, names on click). Organisations and Issues hidden
from the menu; About (with the Colophon) added; the nav restyled. Next ideas in BACKLOG.

## 2026-10-13 · Seams, About and Colophon

Davide's idea: show the actors pulled two ways (ally of two rivals), "friction" - named Seams
after Luttwak's own word for where relational manoeuvre aims. First cut counted treaty
co-membership as an alliance leg and produced 26 seams, twenty of them every NATO/EU member
"pulled" between Cyprus and Turkey; Davide: a stretch, not real seams. Rule tightened: every
leg a written reading (A or B), treaty floor never, reciprocals never. Five real seams on 75
cards (Germany and Greece between Turkey and Israel, Greece between Cyprus and Turkey, Hungary
between Croatia and Serbia, the United States between the UAE and Saudi Arabia). Organisations
and Issues hidden from the top bar for now; About and a provisional Colophon added; the map
outline for seams is built but switched off until Davide approves the look. Written into
ONTOLOGY.md.

## 2026-10-13 · Paused at 75 cards; the rest of the world on Friday

Stopped at Davide's request with 75 reviewed cards (Europe, the Middle East, South Asia
except the Maldives and Central Asia), 15.35M tokens, weekly usage near the ceiling. Resume
on Friday 2026-10-17 after the weekly reset: Russia part two from data/partial/ (the Fable
card and 71 KB of stances survive; relations never written), Israel from scratch, then the
Maldives, Central Asia, East Asia and onward in queue order, six agents at a time. To fix
first: a SAU->IRN row typed as a treaty (the 2023 Beijing agreement), the thin Bahrain card,
and the "aid" type question in BACKLOG. Davide's rules: no new launches after the stop;
interruptions kill the agents, so write, don't reject.

## 2026-10-13 · Middle East burst, then a stop to put things in order

Morning: Davide asked to use the 5-hour window to the full before its reset, so up to twenty
agents ran at once (the system's cap) on the Middle East, South Asia and Russia (the first
Fable card). Two interruptions killed twelve freshly launched agents; some of their
half-written files were picked up by the relaunched agents (EGY, SAU, ARE, IRN), which saved
tokens. The shared web-search budget ran out with twenty agents in parallel: several cards
closed on fetches and Wikipedia citations rather than searches, and say so in their gaps.
Lesson: twenty in parallel is fast but thins the sourcing; six is the working number.
Then Davide: finish the running ones and stop, "mettiamo ordine" before more cards. The
2026 events the agents found (the US-Israeli war on Iran from 28 Feb 2026, Hormuz closed,
Iranian strikes on the Gulf states, the Makkah pact, the Houthi blockade of Saudi Arabia)
make Iran-Israel and Iran-USA the first real "adversary" pairs in the atlas.

## 2026-10-13 · Europe complete: 50 cards, 9.78M tokens, run paused

Western and southern Europe closed overnight: ITA 292k, ESP 73k (resumed from disk), NLD
165k (resumed), BEL 224k, GRC 267k, CYP 234k, PRT 247k, org-eu 335k, org-nato 300k with
Sonnet; IRL 208k, LUX 175k, MLT 184k, AND 204k, MCO 164k, SMR 141k, VAT 191k with Haiku.
Haiku cards cost 140-210k, not half a Sonnet card: the brief and the reading of the
neighbours' cards cost the same whatever writes. Weekly usage at 63% after four regions;
the run is paused at Davide's request (graphic trials first), with the Middle East next.
Review regrades: LUX-USA partner -> reluctant_ally (NATO co-members), MCO-RUS partner ->
neutral, PRT-UKR and NLD-UKR partner -> ally, ESP-ARG rival -> reluctant_partner,
FRA-ISR rival -> reluctant_partner, ITA-UKR partner -> ally. San Marino's means and
constraints came back as bare strings and were turned into sourced claims by hand.
Site: the NORAD vector skin (WarGames) replaced the three-ink print, the home is the
Boetti flag map, every screen has a URL, the relations are a ledger with click filters,
Luttwak's page carries his portrait and a life-and-work section.

## 2026-10-12 · The P5 go to Fable; the run stops after Europe

Davide read the Sonnet card of the United Kingdom and rejected it ("sbagliatissima": the
bases lent against Iran and the scale of arms to Ukraine make Russia and Iran more than
rivals in his reading, and the card did not carry that weight). Decision: the five
permanent members of the UN Security Council (USA, China, Russia, United Kingdom, France)
are written by Fable at the end of the run; the Sonnet cards of GBR (276k) and FRA (213k)
stay online as placeholders and are requeued (`model: fable`, region great-powers). On the
grades: "adversary" stays reserved for mortal enemies, "rival" is right for most pairs,
including Russia for the UK and the Baltics; but the grade is what Davide checks first on
the map, so a protagonist's hostile side must be visible and argued. Two interruptions at
16:03 killed the Spain and Netherlands agents mid-write; relaunched from the files on disk
with Davide's go-ahead. After Europe the run pauses: Davide wants two changes to the page
first. Italy reviewed (291k; UKR partner -> ally for consistency), Republika Srpska
reviewed (251k). 35 cards reviewed, 6.67M tokens.

## 2026-10-12 · Central and northern Europe complete (17 cards) and the "adversary" line held

Costs: POL 276k, HUN ~250k (resumed), CZE, SVK, DEU 278k, AUT, CHE, SWE, FIN, NOR 237k,
DNK 243k, EST 219k, LVA 264k, LTU 226k, SVN 156k (Sonnet with the minor brief), ISL 162k and
LIE 174k (first Haiku cards: 14-15 web calls each, cheaper but not by much, because the
template and the mirror reading cost the same). Running total 5.64M for 33 reviewed cards.

Review decisions: the Baltic agents all graded Russia "adversary" (Saeima and Seimas
"terrorist state" resolutions). Regraded to rival in LVA and LTU, consistent with EST, POL
and FIN: adversary stays reserved for actors seeking each other's destruction; the Baltic
aim is deterrence and a Russian defeat in Ukraine. The ontology text already says so; the
briefs now say it too (brief_template.md, point 1). Denmark created two sub-state
stubs (Greenland, Faroe) as own_territory with bond kin. Estonia graded China rival with
confidence C from the EU triple formula; kept, flagged for the end-of-region pass.

Decision log, newest first. The path matters more than the destination: record why,
not only what. Dead ends are entries too.

## 2026-10-12 · The world run starts

Davide: no months. Models: Fable for USA, China, Russia (last, to reuse everything);
Sonnet for ~93 states, organisations and non-state actors; Haiku for ~109 minor
states. Six agents always running; `data/queue.yaml` is the truth (`tools/queue.py
status`), the site stamp shows "N of 205 cards", `tools/briefs/<ID>.md` carry the
brief per actor, `tools/review.py` the review helpers. Stop launching at 80% of the
weekly usage (47% when the run started, 13 cards reviewed, 1.4M tokens). Reverse
mirroring pass after each region (BACKLOG.md): Ukraine lacks North Korea's troops.

## 2026-10-12 · The Western Balkans, built and measured

Five cards in parallel on the economical model, each one agent, each with the reuse
rule sent mid-run: Croatia 275k tokens, Montenegro 270k, Albania 252k, North Macedonia
252k, Bosnia 251k. With Kosovo (235k) the six Balkan protagonists cost **1.54M tokens
of research** against Serbia's 650k alone under the old flow; per card about 255k,
plus roughly 10-15k of review each. Reuse worked: every agent mirrored Serbia's and
Kosovo's rows with the same URLs (Croatia reused the JANAF, expulsion and recall rows;
Albania the Tirana declaration from Kosovo; Montenegro the Böll essay and the census).

Review changes, one rule for all: co-members of NATO or the EU with visible friction
are `reluctant_ally`, never `rival` (North Macedonia toward Bulgaria and Greece,
Albania toward Greece, Montenegro toward Croatia); the EU is a `partner` for every
candidate, `ally` only for members (Montenegro); Bosnia's grade toward Republika Srpska
is `rival` - the entity is the state's own territory, the actor graded is its
leadership. Everything else kept as the agents set it, confidence C where no source on
that side uses the word.

The region now has seven full cards, every pair drawn from both sides. Estimate for the
world: a protagonist at ~260k, a secondary at ~120k, a minor at ~40k; 75 protagonists
~20M, 50 secondaries ~6M, 90 minors ~3.6M: about 30M tokens of research, over months.

## 2026-10-12 · Kosovo: the economical pipeline, measured

One agent on the economical model, a fixed reading list, YAML written directly, build
made to pass, then review by the best model. **235,000 tokens** of research (Serbia:
650,000 across four prose reports, rewritten by hand) plus about 20,000 of review.
38 web calls. Output: full card (6 objectives, 6 means, 6 constraints, 7 paradoxes,
reading), 16 stances, 38 relation rows with numbers. Review changes: the Board of
Peace charter retyped from treaty to agreement; the structural check now counts only
security ties (not free-trade agreements); duplicate XKS stub removed. Grades kept as
the agent set them, with their confidence C where no Kosovar source uses the word:
Serbia rival (grievance), Albania ally (kin), United States ally (cooling), EU partner
(warming), NATO ally (cooling), Russia and China rival, Spain rival (structural).

Estimate from here: a protagonist card at ~250k tokens with the economical model, so
the five remaining Balkan actors cost about 1.2M; the 75 protagonists about 19M, the
rest of the world far less. Launched: Croatia, Bosnia, Montenegro, Albania, North
Macedonia in parallel.

## 2026-10-12 · Davide catches a wrong map

Serbia's posture map showed the whole of NATO and the EU in green. Two causes, both
mine. (1) Serbia's hand-written Partnership for Peace row toward NATO was typed
`membership`, and the ally derivation took any membership row: fixed by deriving only
from dataset rows and retyping the PfP row as `treaty`. (2) Worse: several Wikidata
ids for organisations in `tools/datasets/wikidata.py` had been written from memory and
were wrong (CSTO, SCO, BRICS, GCC, OAS, G7, G20, Sahel alliance, Non-Aligned Movement
pointed at unrelated items; "OIC" was the OSCE). Rule from now on: every Wikidata id is
resolved by name through the search API with its label checked and kept in
`data/datasets/wikidata/org-ids.json`, never typed from memory. Denmark and the
Netherlands carry EU/NATO membership on their "Kingdom of" items: added by hand.
Organisations extended from 22 to 34.

Davide's next instruction: two menus on the home map, visible to everyone -
organisations (members of the chosen one) and the common issues (Taiwan, Ukraine,
Palestine, Kosovo: who stands where). Then the Balkans built like Serbia, well, without
burning tokens, to estimate the rest.

## 2026-10-12 · Populating the map with the datasets

Davide: "start populating the map with all this, then we'll see what's missing" - and
"I like the UN votes one, keep it as it is". Two lenses added beside Posture and UN
votes, the votes lens untouched: **Recognition** (for Kosovo, Palestine, Taiwan: green
recognises, vermilion does not, dense vermilion withdrew) and **Clubs** (how many of the
point of view's organisations, UN excluded, each country shares). Any country with any
data is now a point of view from the home map.

What the datasets cannot give, by design: `rival` and `adversary` (never derived),
posture for countries outside an alliance, bonds. What they give poorly: Wikidata
memberships are thin for some states (Serbia: UN, OSCE missing, Council of Europe not
in the list); organisations have no seat coordinates; non-state actors do not exist
yet; the dependency layer (trade, arms, energy) has no dataset yet.

## 2026-10-12 · World-scale test, second pass

- 2025 votes in (downloaded from the browser pane with Davide's permission): 322
  recorded votes 2024-26. 2023 harvested, 2022 in progress.
- Recognition pass from Wikipedia: Kosovo 110 (8 withdrawn), Palestine 157, Taiwan 11
  + Holy See; 576 rows; the Kosovo rows carry 109 original citations. Wikipedia's
  three-letter templates are IOC codes, not ISO - mapped.
- Derived stances: 1,103 `ally` between NATO, CSTO and EU co-members, bond `unknown`,
  dataset-flagged, replaced by any hand-written stance. The posture lens now lights up
  for about 60 countries with treaty allies in green and nothing else: the floor.
- 220 actors, 1,121 stances, 2,849 relations. Still zero research tokens.

## 2026-10-12 · World-scale test with datasets only

Davide: "start from Wikipedia, UN in parallel, and let's see how much of the world we
can build end to end with just those two." Done in one afternoon, zero research tokens:

- **Wikidata pass** (`tools/datasets/wikidata.py`): 197 sovereign states as actor stubs
  (flag code, capital coordinates, English Wikipedia link) and 536 current memberships
  in 22 organisations as alignment rows, each citing the organisation's official member
  list (tier 1) plus the Wikidata item. 220 actors in all.
- **UN General Assembly votes**: the Digital Library's API sits behind a bot challenge
  that only a real browser passes, so the harvest runs as a script inside the browser
  pane (search by year, one XML record per resolution, field 967 per member). 2024 and
  2026 are in (129 recorded votes); 2025, 2023 and 2022 are harvested but stuck in the
  page: the pane blocks connections to localhost and re-typing 20 KB of base64 through
  the chat corrupts it. A browser download is the clean channel; permission asked.
- **Build**: landmark votes (11 resolutions listed by hand in
  `data/datasets/unga-landmarks.yaml`, each "about" one or two actors) become action
  rows for every member - 1,347 rows; every recorded vote feeds a 193x193 affinity
  matrix (share of identical votes, pairs with 20+ common votes).
- **Site**: any country with data becomes a point of view. "UN votes" lens screens the
  world by voting affinity (navy = votes together, vermilion = apart); the "Posture" lens
  stays for actors with stances; a dossier for every actor with the affinity figures,
  closest and furthest voters, landmark votes, memberships.

First reading of the figures: Serbia votes with China 68%, Russia 56%, the United States
28%; its closest voters are Armenia, South Sudan, Bosnia, Japan. The United States in
2024-26 is nearly alone: only Israel above 90%, Argentina 80-89%, everyone else under 60%.

## 2026-10-12 · Before scaling: how to pay for the world

Davide: research burns a sea of tokens and we must do the whole world - how do we
optimise? Serbia cost ~650k tokens of research. Decisions (now in METHOD.md):

1. Quality is the constraint, not cost. Three tiers of card: protagonist (~60-75),
   secondary, minor; Davide corrects the proposed protagonist list.
2. Region by region, Western Balkans complete first, every Balkan actor with a full card.
3. Datasets (UN votes, trade, arms, remittances, debt, memberships, troops) enter on
   their own as tier 1 for every actor, flagged `dataset`.
4. One research agent per actor, fixed regional brief, writes YAML directly; no prose
   reports rewritten by hand.
5. Economical model for the draft; the best model's review of objectives, paradoxes,
   reading and grades is **mandatory** ("ma poi ricordati di farlo").
6. Sources in any language, with original title and translation.
7. Minor cards: three objectives, 4-6 stances, dataset rows, a paradox if obvious.
8. Review: best model always, Davide at his choosing; site public with "in
   construction".

Next: Kosovo as the cost test of the new pipeline; UN votes as the first dataset script.

## 2026-10-12 · Home: the world of today, in flags

Davide, with Boetti's *Mappa* as the reference: the home must be a base map of the
world as it is today, borders and flags, and clicking a country turns it into that
country's point of view with the posture colours. Done: 175 of 177 features wear
their current flag (flagcdn, follows official changes; N. Cyprus and Somaliland stay
neutral; Antarctica blank). The title always returns there. Relations are no longer
arrows on the map ("I don't like them, rather in another area"): they are cards under
the map, one per counterpart, ordered by how much is going on, lit by hovering the
country. Graticule removed.

## 2026-10-12 · What "adversary" means

Davide, for the future: adversary = mortal enemies, Iran and Israel. Everything short
of that is rival. Written into the grade table in ONTOLOGY.md with reference cases;
Serbia keeps no adversary today, which the data already showed.

## 2026-10-12 · Third ink

Ally and reluctant ally at 72% and 45% navy looked the same in the legend. Four
fixes compared (wider steps; lines for "reluctant"; a third ink). Davide chose the
third ink: **green for allies, navy for partners, vermilion for the hostile side**,
density still the strength within each. Traffic-light reading at a glance; the
one-ink-per-side rule becomes one-ink-per-family. No fourth colour.

## 2026-10-12 · Second review: "not the Claude yellow everywhere"

Davide on the paper-and-ink map: the cream palette is the default aesthetic, not an
identity. Three directions were mocked up on the same abstract shape (ops room on
charcoal; two-ink risograph; admiralty chart in grey). **Chosen: two inks** - navy and
vermilion on cold white, posture as a dot screen whose density is the strength (navy
for the friendly side, vermilion for the hostile), claimed territory as vermilion
hatch, Archivo / Archivo Narrow grotesque, the point of view in solid navy with its
name knocked out in paper.

**Bond.** The first idea (line screens underneath) was rejected mid-build: "the extra
lines distract". Replaced by a band inside the border in the bond's ink (navy = kin,
vermilion = grievance), clipped to the country so it never paints a neighbour. Still a
provisional rendering; alternatives on the table: bond only as a toggle that swaps the
whole map to a bond view; or a glyph at the seat.

## 2026-10-12 · First review: seven objections, two model changes

Davide saw the demo and listed seven things. Two of them were about the model, not
the screen, and those are the ones that count.

**Model**

1. *"How can Russia and the US both be 'partner'? Serbia's tie with Russia is cultural;
   if the model doesn't see it, change the model."* It did not see it: one axis
   (posture today). Added `bond` to stances: kin / affinity / none / grievance. Russia
   is now partner + kin + cooling; the US partner + grievance + warming. Bonds are
   evidenced like grades (polls on the 1999 bombing, the Montenegro census).
2. *"Albania partner? Albania and Kosovo are the same thing. Understand what 'partner'
   is and who is the partner of an adversary."* The rule "a source must use the word"
   let Vučić's Open Balkan rhetoric set the grade. New rule in ONTOLOGY.md: the grade
   follows the structural position, rhetoric goes in the note; `tools/build.py` now
   warns on "partner of an adversary's ally" and on asymmetric pairs. Albania
   regraded `rival` (motherland of Kosovo; signatory of the 2025 Tirana defence
   declaration Belgrade calls its "greatest threat"), cooperation noted.

**Screen**

3. Map "anonymous": rebuilt as a 1970s situation map - paper grain, ink coastlines,
   dashed graticule, hatching for claimed territory, dot and cross screens for bond,
   condensed capitals, a stamp-like legend. Screens, arrowheads and type stay at
   screen size under zoom; small countries get their label only when wide enough.
4. Colour scale: rivals and adversaries in red, allies in blue, partners blue-grey,
   neutral paper, own territory solid ink.
5. Actor list removed from the sidebar.
6. Graph dropped. Relations are arrows on the map from the point-of-view seat to the
   counterpart, one style per layer, with toggles; several rows share an arrow and
   list in the tooltip. A circular board can come later at scale.
7. Links out of the card: footnote numbers in the text, sources as endnotes with hover.

**Still open.** Labels for Kosovo and Montenegro only appear on zoom; a leader-line
scheme would fix it. `claims` on contested counts render as tier-4 footnotes, which
is a hack. The structural warnings cannot fire until counterparts have alignment rows.

## 2026-10-12 · Serbia pilot and first demo

Davide: "I like it, but I want to *see* it. Let's do the demo all the way, then reason
about scalability."

**Done.** Four parallel researches on Serbia (card, stances, dependencies, actions;
about 270 sources opened). Data written as `data/actors/SRB.yaml` (6 objectives, 7
means, 6 constraints, 7 paradoxes, reading), `data/stances/SRB.yaml` (18 stances, each
with a source that uses the grade), `data/relations/SRB.yaml` (43 rows). 20 stub
actors as nodes. `tools/build.py` validates and compiles. Site in `docs/` with map
(point-of-view colouring, hatched claimed territory, "Neighbourhood/World" framing),
force graph (arcs by layer), dossier (card, stance table, relations with sources and
confidence badges). Public repo `AndreottiVIII/grand-strategy`, GitHub Pages from `docs/`.

**Ontology draft 2** records seven lessons the pilot forced: sub-state actors, stance
`trend`, conflicting-figure rule, contested counts as `claims`, state media as tier 1
only for statements, non-events in `reading`, stubs. See ONTOLOGY.md.

**Left out for lack of a source that holds.** The "betray the soul of our people"
sanctions quote (only Pravda); Serbia's Sept 2025 vote on the Palestine declaration
(inferred, not read). Bosnia-state stance is recorded as `rival` at confidence C and
marked provisional: no source uses a scale word.

**Open after the demo**

- Is one card enough to judge the form? Probably not: the graph is a star until a
  second card arrives. Kosovo or Croatia next would make the first real intersection.
- Map framing: "Neighbourhood" fits all stance countries, so the UAE and Azerbaijan
  stretch it. Maybe frame on the actor's regions instead.
- The dossier is 12,000px tall for one actor. Collapsible sections or a layer filter
  will be needed at scale.
- Source URLs were opened by research agents, not by Davide; a spot check of a dozen
  would be the honest next step before showing anyone.

## 2026-10-12 · Ontology draft 1

Draft 0 read in full in chat and argued point by point.

**Decided**

1. **No dispute objects.** Davide: the focus is grand strategies, not disputes; disputes
   exist because of grand strategies. Kosovo's status lives in the objectives and
   stances of the actors, not in a file of its own.
2. **Stance grades need a source.** "Reluctant ally" is a judgement, so each grade on the
   per-actor map must cite an analysis that uses that reading. Our own judgement is not
   enough, even as grade C. Chosen over the faster option on purpose.
3. **Nine grades**, adding `reluctant_partner` (Serbia toward the EU).
4. Source tiers as proposed; stance grades and type vocabularies closed, growing only
   with journal entries.

**Still open**

- Type vocabulary will meet reality with the first actor. Serbia proposed as first.

## 2026-10-12 · Founding decisions

Session: "Grand Strategy" (Claude Code, Remote Control on).

**The idea.** The world looks chaotic; it is in fact complexity at the limit of what
can be managed. Map what every country (and every actor that behaves like one) does
and wants, and show where those things intersect. Example that started it: Serbia
wants Kosovo; Kosovo is NATO-aligned; therefore Serbia leans to Russia. Reductive on
purpose; the project exists to add the other n variables without losing the thread.

**Decided**

1. Pilot: Western Balkans, with the condition that the schema scales to ~200 actors.
   Fallback if it does not: everything at once, thin cards.
2. Relations carry four layers: objectives/disputes, formal alignments, material
   dependencies, recent dated actions. Davide noted he would have missed "recent
   actions" on his own; it stays.
3. Every claim cited, with date and confidence. Slowest option, chosen knowingly.
4. Public, in English.
5. Main view: relation graph. Mandatory second view: world map from one actor's point
   of view ("the world as Belgrade sees it"), with graded alignment (own territory,
   claimed, ally, reluctant ally, neutral, rival, enemy).
6. Time: today only; history from git.
7. Every actor gets a Luttwak grand-strategy card (objectives, means, constraints,
   allies, paradoxes). Luttwak "as a lamp for every step".
8. Updates via on-demand Claude sessions, versioned in git.
9. Non-state actors in, including territory-less organisations when they act as state
   instruments.
10. GitHub Pages, public from the start. Davide: "who looks at my GitHub? nobody".
11. Name: decided later. Folder `grand-strategy`.

**Open at the time** (all closed by the draft-1 entry above)

- The ontology itself (docs/ONTOLOGY.md): first draft to be discussed next.
- Alignment scale for the per-actor map: how many grades, and who decides "reluctant".
- Source tiers: which outlets count as what.
- Whether a relation is directed (Serbia→Kosovo differs from Kosovo→Serbia). Leaning yes.
