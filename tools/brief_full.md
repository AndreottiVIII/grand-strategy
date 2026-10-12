## Write (protagonist tier, `tier: protagonist`)
English, YAML, every claim with sources (url, title, publisher, date, tier); confidence A/B/C; dates YYYY-MM-DD / YYYY-MM / YYYY.
- `data\actors\{ID}.yaml`: 5-6 ranked objectives; means by domain (diplomatic, informational, military, economic); 5-6 constraints; 4-7 paradoxes in Luttwak's sense (where the actor's own moves work against its goals); one-paragraph reading, the only free prose.
- `data\stances\{ID}.yaml`: 12-16 stances toward the actors that matter to it (neighbours, patrons, rivals, the United States, China, Russia, the EU where relevant), each with grade, trend, bond, since, last_verified, confidence, note (why this reading), sources. Use existing actor ids (check `data\actors\`).
- `data\relations\{ID}.yaml`: 25-40 rows across objective / alignment / dependency (value + unit) / action, type vocabulary from ONTOLOGY.md only.
Budget: about 40 web calls; stop researching when the card is defensible, not when it is exhaustive.
