## Write (minor tier, `tier: minor`) - keep it short and sourced
English, YAML, every claim with sources (url, title, publisher, date, tier); confidence A/B/C; dates YYYY-MM-DD / YYYY-MM / YYYY.
- `data\actors\{ID}.yaml`: 3 ranked objectives; 2-3 means; 3 constraints; 1 paradox if one is obvious (else an empty list is fine); a reading of two or three sentences.
- `data\stances\{ID}.yaml`: 4-6 stances: the neighbours that matter, the patron or former colonial power, and whichever of the United States, China, Russia, the EU shapes its choices. Each with grade, trend, bond, since, last_verified, confidence, note, sources.
- `data\relations\{ID}.yaml`: 8-14 rows: 1-2 objectives, 1-2 alignments, 2-4 dependencies with numbers (trade, aid, remittances, debt, troops), 3-5 dated actions 2022-2026.
Budget: at most 15 web calls and no more than about 60,000 tokens; prefer the Wikipedia index plus two or three official or quality-press pages. Stop when the floor is laid.
