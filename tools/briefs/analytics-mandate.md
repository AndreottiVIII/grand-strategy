# Mandate: Google Analytics with consent on grandstrategy.davidecaniatti.com (2026-11-19)

Repository `C:/Users/davide/Desktop/ClaudeTower/grand-strategy`; read `CLAUDE.md` first (the look: NORAD vector screen, VT323 /
Share Tech Mono / IBM Plex Mono, the colour tokens at the top of `docs/style.css`, no new colour, no soft panels, no rounded
pills, no shadows). The site is static (`docs/index.html`, `docs/app.js`, `docs/style.css`), served locally by
`preview_start {name: "grand-strategy"}` on port 8765, online at `https://grandstrategy.davidecaniatti.com/`. It already
has a cookie-free counter (GoatCounter, in `index.html` and declared on the "This site" page); that stays.

Davide's request (relayed from his other chat): add Google Analytics, property **G-RL3G7S1M0W**, that starts ONLY after
consent, without breaking anything. The working model is the block at the end of
`C:/Users/davide/Desktop/ClaudeTower/milano-in-dati/docs/menu.js` that begins with
`/* Visite: Google Analytics parte SOLO dopo`. Read it whole and reproduce its behaviour here:
- a notice with two buttons of equal weight, Accept and Refuse (English on this site; Italian when `?lang=it` or the
  stored language is Italian: the site's translation layer works on DOM text through `translateDom`, so give the notice
  plain text in `p`/`button` elements and add the Italian strings to `data/i18n/it/texts.json` keyed by the FNV-1a 32-bit
  hash of the English, as `tools/i18n.py` and the `h()` function in `app.js` do; check an existing key to match the format);
- gtag loaded only after Accept; advertising signals off (`allow_google_signals: false`, `allow_ad_personalization_signals:
  false`, `anonymize_ip` where applicable); the choice kept in `localStorage`; Refuse deletes any `_ga*` cookies; a
  `window.gsCookie()` function to change the choice later; no Analytics outside the real host (regex on
  `grandstrategy.davidecaniatti.com`); no notice when `navigator.webdriver` is true;
- a "How it works" link in the notice that goes to the "This site" page, section `#visite`.
- On the "This site" page (`renderSitePage` in `app.js`): a short section "Visits and cookies" with `id="visite"`, modelled
  on the `id="visite"` section of `C:/Users/davide/Desktop/ClaudeTower/milano-in-dati/docs/il-sito/index.html`, saying in
  the site's voice: GoatCounter counts page views without cookies; Google Analytics runs only after Accept, what it
  records, how to change the choice (a link that calls `window.gsCookie()`). Update the existing privacy sentences of
  that page so they stay true (today they say the only outside hosts are D3, Google Fonts, flagcdn, Wikimedia, GoatCounter,
  the GitHub API). Every new or changed English paragraph of that page needs its Italian in `texts.json` (same hashing;
  the keys are the paragraph's innerHTML with numbers as ⟨n⟩, as the existing keys show: look at how the current "This
  site" paragraphs appear in `data/i18n/it/ui-keys.json` and copy that normalisation exactly, or simpler: keep the new
  paragraphs free of digits and hrefs so the key is the plain innerHTML).
- The notice must sit at the bottom of the viewport, over the map, in the site's type and colours, readable at 375 px
  and at 1000 px, never covering the nav; dismissed, it never returns unless `gsCookie()` is called.

## Verify before reporting (browser pane, fresh `?r=` each reload)
1. Fresh profile state: `localStorage.clear()` then reload: the notice shows; `read_network_requests` shows NO request to
   googletagmanager.com or google-analytics.com before any click.
2. Click Refuse: no Google request, choice stored, notice gone, reload shows no notice.
3. `localStorage.clear()`, reload, click Accept: a request to `/g/collect` (or `gtag/js?id=G-RL3G7S1M0W`) with `tid=G-RL3G7S1M0W`;
   note that on localhost the host regex blocks Analytics, so test the regex separately by evaluating it against the real
   host string in the console, and test the Accept flow with a temporary override only in the page's console, never in the
   committed code.
4. `read_console_messages`: no errors on home, a dossier, `#/watch`, `#/site` (English and `?lang=it`).
5. `resize_window` mobile (375) and width 1000: screenshot the notice on the home map at both sizes, English and Italian,
   plus the "This site" section; save them with `save_to_disk` and name the paths in the report. Back to desktop.
6. No file in `docs/` grows past 2 MB uncompressed because of this change (check `docs/app.js` size).

Do not commit or push. Report under 200 words: files changed, what the screenshots show, the four checks' results, anything
left out. Write the report to `tools/briefs/analytics-report.md` as you go.
