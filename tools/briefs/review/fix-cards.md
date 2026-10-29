# Mandate 3: card corrections, before/after only (2026-10-29)

Repository `C:/Users/davide/Desktop/ClaudeTower/grand-strategy`; read `CLAUDE.md` and the stance and source sections of
`ONTOLOGY.md` first. Reviewers found defects in the cards (`tools/briefs/review/text-2026-10-29.md`, `site-2026-10-29.md`,
`data-2026-10-29.md`) and `BACKLOG.md` holds three flags left for the hand after the week's update. Davide's rule: **every
change to a card is shown before/after and waits for his ok**. So you **write no data file**: you write one document,
`tools/briefs/review/cards-prima-dopo.md`, in Italian for Davide, with the English texts quoted as they are and as they
would become. Write it incrementally (Write tool, every few items).

Format of each item, numbered so he can answer "ok 1, 3, 5":
```
## N. <scheda> · <cosa> (file:riga)
PRIMA: "<testo inglese attuale>"
DOPO:  "<testo inglese proposto>"
Perché: <una o due righe>
Fonte: <url, titolo, editore, data> (solo se la proposta introduce o cambia un fatto)
```
Mechanical items (dates, a field value, a trailing comma) may be grouped in one numbered item with a table.

## Items
1. Text report 23 (USA reading vs its own stances: read `data/actors/USA.yaml` reading and `data/stances/USA.yaml`, say
   which side is right from the sources already in the files, propose the sentence that agrees), 24 (USA diesel deal dated
   twice: check the two sources cited, keep the right date), 25 (RUS key rate: the reading says 21%; check the sources in
   the card; if they are older than the claim, one web call to the Bank of Russia to date the current rate), 26 (CHN: two
   measures both called "affiliates rule": name them apart).
2. Site report BUG 6 (`data/relations/LCA.yaml:7` "since null": rewrite the sentence) and COSMETIC 27 (working notes such
   as "Review 2026-10-12: regraded ..." visible in public tables: list every occurrence across `data/stances/*.yaml`
   notes and `data/relations/*.yaml` summaries with a script, propose the sentence without the working note, or the note
   moved to a `review:` field if ONTOLOGY has one; one item with a table).
3. Data report I8 (twelve items `last_verified` earlier than their newest source: table, propose the date), I10 (LCA full
   card with no stances file, VCT full card with no relations file: propose, from the sources already in their own cards,
   the minimal stances or rows that can be written without new research; say what cannot), I11 (asymmetric readings
   between two full cards: table of the pairs with both grades and one line each on whether the asymmetry is structural
   or a defect; propose a change only where it is a defect), I12 (PER -> CHN two values for the same quantity), I13 (same URL
   under different tiers: table and the tier to keep; publisher spellings: a normalisation table for the ten most frequent
   variants only), C2 (the trailing comma in the recognition dataset URL), C3 (dependency units written as prose: propose
   the numeric field and the unit), C4 (`sub-western-sahara` without `parent`: propose the parent).
4. `BACKLOG.md`, the flags for the hand after W44: Greece card assurance of Oct 2025 contradicted by the Libyan east's
   approval; Haiti GSF strength 1,500 vs 2,000 in AP; nsa-houthis Shabwah 58 vs AP "at least 53". Read the sources the
   backlog names (they are in the W44 inbox or the relations files); propose the corrected sentences.

At most 6 web calls in total, only where the files' own sources cannot settle a fact. No other research.

## Then
Report under 150 words: how many items, which need Davide's judgement most (the three you would show first), what you
could not settle.
