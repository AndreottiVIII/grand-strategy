# Analytics report (2026-11-19)

Files changed (nothing committed): docs/index.html (consent script, inline), docs/app.js (route #/visite, "Visits and cookies" section, privacy sentence updated), docs/style.css (#gs-ck notice), data/i18n/it/texts.json (9 Italian strings) and docs/i18n/it.json (regenerated the way build.py does; build.py not run, so the ?v= stamp is not bumped yet).

Checks:
1. Fresh state: notice shown, no googletagmanager/google-analytics resource before any click.
2. Refuse: nothing from Google, choice stored, notice gone, reload shows none; Refuse after Accept deletes _ga cookies and reloads.
3. Accept with the host regex swapped only in the console: gtag/js?id=G-RL3G7S1M0W and g/collect with tid=G-RL3G7S1M0W. The regex alone: true for the real host, false for localhost, a suffixed host and the bare domain.
4. Console: no errors on home, dossier, watch, this-site, in English and ?lang=it.
5. Size: app.js 172 KB, it.json 1.83 MB; data.json is 2.19 MB already (not from this change).

Screenshots: tools/briefs/analytics-shots/ (1000 and 375 wide, EN and IT, plus the section).
Notes: the network tool does not log third-party hosts, so I used performance entries. The Accept test sent one real page_view (dl=localhost) to the property. No anonymize_ip (GA4 has none). cookie_domain is this host only.
