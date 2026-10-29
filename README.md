# Grand Strategy

An open atlas of how the world's states and state-like actors relate to each other, read through Edward N. Luttwak's idea of grand strategy. Every claim carries a source, a date and a confidence grade.
The site is at https://andreottiviii.github.io/grand-strategy/ (static files in `docs/`, served by GitHub Pages).
The data is plain YAML, one file per actor in three folders: `data/actors/` (the card), `data/stances/` (how it reads every other actor), `data/relations/` (rows with sources); `data/datasets/` holds the public datasets they sit on.
To build: `python tools/build.py` validates every file and writes `docs/data.json` and one bundle per actor in `docs/actors/`; it refuses to write on any error.
The site renders the data and embeds no fact; its only code dependency is D3, loaded from cdnjs.
The method is in `METHOD.md` and `ONTOLOGY.md` (the data model and the rules of each computed page); every decision, newest first, is in `JOURNAL.md`.
Updates are made on call, not on a calendar; `CLAUDE.md` describes the cycle and the working rules.
The project is run by Davide Caniatti; the research and the code are produced with Claude (Anthropic).
