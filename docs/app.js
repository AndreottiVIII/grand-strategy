/* Grand Strategy - renders docs/data.json (compiled from data/ by tools/build.py).
   Two views: the situation map from the point-of-view actor (posture as colour, bond as
   screen, relations as arrows by layer) and the dossier with footnoted sources. */
// cache key: the ?v= stamp the build writes into index.html for this script (same stamp, same data)
const STAMP = ((document.querySelector('script[src^="app.js"]') || {}).src || "").split("v=")[1] || "0";
// language (2026-10-22): ?lang=it sets it and the browser remembers it; English is the truth, Italian a lookup
const LANG = (() => { try { const q = new URLSearchParams(location.search).get("lang"); if (q) localStorage.setItem("lang", q); return localStorage.getItem("lang") || "en"; } catch (e) { return "en"; } })();
(async function () {
  const stamp = document.querySelector('script[src^="app.js"]').src.split("?")[1];
  const [data, world, iso2, i18n] = await Promise.all([
    fetch("data.json?v=" + STAMP).then(r => r.json()),   // the build's stamp: the browser keeps the JSON until the next publish
    fetch("world.geojson").then(r => r.json()),
    fetch("iso2.json").then(r => r.json()),
    LANG === "en" ? Promise.resolve(null) : fetch(`i18n/${LANG}.json?v=` + STAMP).then(r => r.ok ? r.json() : null).catch(() => null),
  ]);
  // ---------- translation layer: every text goes through T(); a text is found by its fingerprint (tools/i18n.py)
  const I18N = i18n || { t: {}, names: {} };
  const h = s => { let x = 0x811c9dc5; for (const b of new TextEncoder().encode(String(s))) { x ^= b; x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(16).padStart(8, "0"); };
  const T = s => { if (LANG === "en" || s === null || s === undefined || s === "") return s; const k = I18N.t[h(String(s).trim())]; return k === undefined ? s : k; };
  if (LANG !== "en") data.actors.forEach(a => { if (I18N.names[a.id]) { a.name_en = a.name; a.name = I18N.names[a.id]; if (a.short && !/^[A-Z][A-Z.&\s]{1,6}$/.test(a.short)) { a.short_en = a.short; delete a.short; } } });
  // the site's own strings: rendered elements are matched by their English markup with numbers blanked, so one key serves every count
  document.documentElement.lang = LANG;   // the page says which language it is in (screen readers, hyphenation, translation prompts)
  const UI_SEL = "p, h1, h2, h3, h4, li, th, summary, button, label, option, i, .row, .tag, .stamp, .lbl, .k, .hint, .src, .more, figcaption, .topnav span, .topnav a";
  // cells, labels and spans that templates fill with the site's own words (2026-10-29): only the leaves, and only short ones
  // (longer texts in a cell are data, which has its own lookup); a container that holds a block is never a string
  const GEN_SEL = "td, b, em, span, div";
  const GEN_BLOCK = "div, span, p, table, tr, ul, ol, li, h1, h2, h3, h4, td, details, select, button, svg";   // a cell, span or div that holds another is not itself a string
  const isUi = el => el.matches && (el.matches(UI_SEL) || (el.matches(GEN_SEL) && !el.matches(".lst, .lst *") && !el.querySelector(GEN_BLOCK) && el.innerHTML.length <= 700 && /[A-Za-z]{3}/.test(el.textContent) && /[A-Za-z]{3}/.test(uiKey(el.innerHTML).replace(/<[^>]*>|⟨\w⟩/g, ""))));   // and some word of its own once names and numbers are blanked
  const UI_ALL = UI_SEL + ", " + GEN_SEL;
  const NUM = /\d[\d,.]*%?/g;
  const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const NAMES = [...new Set(data.actors.flatMap(a => [a.name_en || a.name, a.name, a.short].filter(Boolean)))].sort((p, q) => q.length - p.length);
  // a run of names joined by ", " or " · " is one placeholder: a sentence about a list keeps one key whatever the list holds
  // (\b would not see the end of "Perù" or "Côte d'Ivoire": a name ends where no letter or digit follows)
  const NAME_ALT = "(?<![\\p{L}\\p{N}_])(?:" + NAMES.map(escRe).join("|") + ")(?![\\p{L}\\p{N}_])";
  const NAME_RE = new RegExp(NAME_ALT + "(?:(?:, | · )" + NAME_ALT + ")*", "gu");
  const LST = /<span class="lst">(?:[^<]|<(?!\/?span[ >])|<span[^>]*>[^<]*<\/span>)*<\/span>/g;   // a list of names and figures a template fills in: one placeholder, left as it is
  const HREF = /#\/(?:view|dossier|organisation|issue)\/[A-Za-z0-9_-]+/g;   // links to actors carry their id: a placeholder too
  const TOKEN = /\u27e8[nahl]\u27e9/g;
  const uiKey = html => html.replace(/ data-i18n="1"/g, "").replace(LST, "\u27e8l\u27e9").replace(HREF, "\u27e8h\u27e9").replace(NUM, "\u27e8n\u27e9").replace(NAME_RE, "\u27e8a\u27e9").replace(/\s+/g, " ").trim();
  function translateDom(root) {
    if (LANG === "en" || !root || !root.querySelectorAll) return;
    const els = [root, ...root.querySelectorAll(UI_ALL)];
    for (const el of els) {
      if (!el.matches || el.dataset.i18n || !isUi(el)) continue;
      const html = el.innerHTML.trim();
      if (!html || html.length > 4000) continue;
      const it = I18N.t[h(uiKey(html))];
      if (!it) continue;
      const vals = [];   // numbers and names in order of appearance, put back into the translation's placeholders
      html.replace(new RegExp(LST.source + "|" + HREF.source + "|" + NUM.source + "|" + NAME_RE.source, "gu"), m => { vals.push(m); return m; });
      let i = 0;
      el.innerHTML = it.replace(TOKEN, () => vals[i++] ?? "");
      el.dataset.i18n = "1";
    }
  }
  window.__i18nKeys = () => [...new Set([...document.querySelectorAll(UI_ALL)].filter(isUi).map(el => el.innerHTML.trim()).filter(x => x && x.length <= 4000 && !/^\d[\d,.]*%?$/.test(x)).map(uiKey))];
  if (LANG !== "en") new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) translateDom(n); }))).observe(document.body, { childList: true, subtree: true });
  if (LANG !== "en") translateDom(document.body);   // the static markup (menu, toggle) is not an added node: translate it once
  if (LANG !== "en") translateDom(document.body);   // the static markup (menu, toggle) is not an added node: translate it once
  document.querySelectorAll("#lang a").forEach(a => { a.classList.toggle("is-on", a.dataset.lang === LANG); a.onclick = ev => { ev.preventDefault(); try { localStorage.setItem("lang", a.dataset.lang); } catch (e) {} location.search = "?lang=" + a.dataset.lang; }; });

  const GRADE_LABEL = {
    own_territory: "Own territory", claimed_territory: "Claimed, not controlled", ally: "Ally",
    reluctant_ally: "Reluctant ally", partner: "Partner", reluctant_partner: "Reluctant partner",
    neutral: "Neutral / no stance", rival: "Rival", adversary: "Adversary",
  };
  const BOND_LABEL = { kin: "Kin - shared identity", affinity: "Affinity", none: "No standing tie", grievance: "Grievance - open wound", unknown: "Bond not assessed" };
  const LAYER_LABEL = { objective: "Objectives", alignment: "Alignments", dependency: "Dependencies", action: "Actions" };
  const TREND = { warming: "warming", stable: "stable", cooling: "cooling" };
  const TREND_SIGN = { warming: "↗", stable: "→", cooling: "↘" };
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const gradeColor = g => css("--g-" + g);
  const layerColor = l => css("--l-" + l);

  const actors = Object.fromEntries(data.actors.map(a => [a.id, a]));
  const fullActors = data.actors.filter(a => a.card === "full");
  if (/[?&]og=1/.test(location.search)) {
    document.body.classList.add("og");
    document.querySelector(".stage").insertAdjacentHTML("afterbegin", `<div class="og-title"><h1>Grand <span>Strategy</span></h1><p>The logic of strategy, applied to every state</p></div>`);
  }
  // Natural Earth ids that differ from the actor ids: the polygon takes the actor's id (the flag follows), once, at load
  const GEO_ALIAS = { PSX: "PSE", GRL: "sub-greenland", SAH: "sub-western-sahara", FLK: "sub-falklands", NCL: "sub-new-caledonia", SOL: "sub-somaliland" };
  world.features.forEach(f => { const to = GEO_ALIAS[f.id]; if (to && actors[to]) { if (iso2[f.id] && !iso2[to]) iso2[to] = iso2[f.id]; f.id = to; } });
  const feature = Object.fromEntries(world.features.map(f => [f.id, f]));
  let pov = null;                 // null = home: the world of today, flags and borders
  let view = "map";
  let mapMode = "world";
  let lens = "posture";           // posture (stances) | votes (UN General Assembly affinity)
  const unga = data.unga || { affinity: {}, landmarks: {}, members: [], resolutions: {} };
  // payload split (2026-10-29): data.json is the slim map; everything with a text or a source (card, notes, rows) lives in
  // docs/actors/<id>.json, fetched once on demand. bundle(id) -> promise of the bundle, or null if the file is missing.
  const BUNDLES = new Map(), LOADED = new Map();
  const bundle = id => {
    if (!BUNDLES.has(id)) BUNDLES.set(id, fetch(`actors/${encodeURIComponent(id)}.json?v=` + STAMP)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(b => { b.stIdx = new Map(); (b.stances || []).forEach(x => { if (!b.stIdx.has(x.toward)) b.stIdx.set(x.toward, x); }); LOADED.set(id, b); return b; })
      .catch(() => { BUNDLES.delete(id); return null; }));
    return BUNDLES.get(id);
  };
  const realRows = rows => (rows || []).filter(r => r.dataset !== "unga-votes");   // the vote rows are never shown as rows (the votes lens and the landmarks carry them)
  const hasStances = id => !!(data.stances[id] && data.stances[id].length);
  const hasVotes = id => !!unga.affinity[id];
  const VOTE_CLASSES = [[.9, "v90"], [.8, "v80"], [.7, "v70"], [.6, "v60"], [0, "vlow"]];
  const clubs = {};                                   // actor -> Set of organisations it belongs to
  const recog = {};                                   // target -> { actor: "yes" | "no" | "withdrew" }
  data.relations.forEach(r => {
    if (r.type === "membership") (clubs[r.from] = clubs[r.from] || new Set()).add(r.to);
    if (r.type === "recognition") (recog[r.to] = recog[r.to] || {})[r.from] = "yes";
    if (r.type === "non_recognition") (recog[r.to] = recog[r.to] || {})[r.from] = /^Withdrew/.test(r.summary || "") ? "withdrew" : "no";
  });
  const hasClubs = id => !!(clubs[id] && clubs[id].size);
  const hasRecog = id => !!recog[id];
  const sharedClubs = (a, b) => clubs[a] && clubs[b] ? [...clubs[a]].filter(o => o !== "org-un" && clubs[b].has(o)) : [];   // everyone is in the UN
  const CLUB_CLASSES = [[6, "c6"], [4, "c4"], [2, "c2"], [1, "c1"]];
  const clubClass = n => { const c = CLUB_CLASSES.find(([t]) => n >= t); return c ? c[1] : null; };
  const CLUB_LABEL = { c6: "6 or more organisations in common", c4: "4-5", c2: "2-3", c1: "1" };
  // home lenses: an organisation (its members) or an issue (who stands where), chosen from the sidebar
  let homeLens = null;                               // { kind: "org", id } | { kind: "issue", id }
  const membersOf = {};                              // org -> { actor: since }
  data.relations.forEach(r => { if (r.type === "membership") (membersOf[r.to] = membersOf[r.to] || {})[r.from] = r.since; });
  const ISSUES = Object.fromEntries((data.issues || []).map(i => [i.id, { label: `${i.title} - ${i.subtitle}`, title: i.title, subtitle: i.subtitle, kind: i.kind, target: i.target, symbol: i.symbol, why: i.why, added: i.added }]));
  const voteOn = (symbol, id) => { const l = (unga.landmarks[id] || []).find(x => x.symbol === symbol); return l ? l.vote : null; };
  const VOTE_CLS = { Y: "yes", N: "no", A: "abst" };
  const VOTE_LBL = { yes: "Voted in favour", no: "Voted against", abst: "Abstained" };
  const REC_LABEL = { yes: "Recognises", withdrew: "Recognised, then withdrew", no: "Does not recognise" };
  const voteClass = x => x == null ? null : VOTE_CLASSES.find(([t]) => x >= t)[1];
  const VOTE_LABEL = { v90: "Votes together 90% or more", v80: "80-89%", v70: "70-79%", v60: "60-69%", vlow: "Under 60%" };

  // ---------- chrome
  document.getElementById("meta").innerHTML =
    `Situation map · in construction<br>compiled ${data.generated} · ${fullActors.length} cards of ${data.actors.length} actors<br>${Object.values(data.stances).flat().length.toLocaleString("en-GB")} stances · ${data.stats.relations.total.toLocaleString("en-GB")} relations`;

  const povSel = document.getElementById("pov");
  povSel.add(new Option("The world of today", ""));
  const grpFull = document.createElement("optgroup"); grpFull.label = T("With a grand-strategy card");
  fullActors.forEach(a => grpFull.appendChild(new Option(`The world as ${a.name} sees it`, a.id)));
  povSel.appendChild(grpFull);
  const grpData = document.createElement("optgroup"); grpData.label = T("Data only (UN votes, memberships, treaty allies)");
  data.actors.filter(a => a.card !== "full" && (hasVotes(a.id) || hasStances(a.id) || hasClubs(a.id) || hasRecog(a.id))).sort((x, y) => x.name.localeCompare(y.name))
    .forEach(a => grpData.appendChild(new Option(a.name, a.id)));
  povSel.appendChild(grpData);
  povSel.onchange = () => { if (povSel.value) setPov(povSel.value); else goHome(); };
  // every screen is a URL (#/view/SRB/posture, #/dossier/SRB, #/organisation/org-eu ...) so the browser's back and forward work
  function navigate(h) { if (location.hash === h) apply(h); else location.hash = h; }
  window.addEventListener("hashchange", () => apply(location.hash));
  // on a phone `body` is the scroll container (overflow-x: hidden on html and body), so the reset has to reach all three
  function toTop() { window.scrollTo(0, 0); document.body.scrollTop = 0; document.documentElement.scrollTop = 0; }
  function apply(h) {
    let parts; try { parts = h.replace(/^#\/?/, "").split("/").map(decodeURIComponent); } catch (e) { parts = []; }   // a malformed %-escape in the address falls back to home
    const [kind, id, extra] = parts;
    const clear = () => { homeLens = null; orgSel.value = ""; issueSel.value = ""; pov = null; povSel.value = ""; };
    if (kind === "view" && actors[id]) {
      pov = id; povSel.value = id; homeLens = null; orgSel.value = ""; issueSel.value = "";
      lens = ["posture", "recognition", "votes", "clubs"].includes(extra) ? extra : hasStances(id) ? "posture" : hasRecog(id) ? "recognition" : hasVotes(id) ? "votes" : "clubs";
      mapMode = hasStances(id) ? "near" : "world";
      renderLegend(); setView("map");
    } else if (kind === "dossier" && actors[id]) {
      // a dossier opened from a reading page or by address (no point of view to keep): the select and the "Situation map" tab point at this actor;
      // from a map or from another dossier the point of view stays, because the dossier then says "as X sees it"
      if ((!pov || !["map", "dossier"].includes(view)) && (actors[id].card === "full" || hasVotes(id) || hasStances(id) || hasClubs(id) || hasRecog(id))) { pov = id; povSel.value = id; }
      renderDossier(id);
    } else if (kind === "organisation" && actors[id]) {
      clear(); homeLens = { kind: "org", id }; orgSel.value = id; mapMode = "world"; renderLegend(); setView("map");
    } else if (kind === "issue" && ISSUES[id]) {
      clear(); homeLens = { kind: "issue", id }; issueSel.value = id; mapMode = "world"; renderLegend(); setView("map");
    } else if (kind === "heat") {
      clear(); homeLens = { kind: "heat" }; mapMode = "world"; renderLegend(); setView("map");
    } else if (kind === "organisations") setView("orgs");
    else if (kind === "issues") setView("issues");
    else if (kind === "luttwak") setView("luttwak");
    else if (kind === "seams") setView("seams");
    else if (kind === "clients") setView("clients");
    else if (kind === "faults") setView("faults");
    else if (kind === "gatherings") setView("gatherings");
    else if (kind === "currents") setView("currents");
    else if (kind === "theatres") setView("theatres");
    else if (kind === "flanks") setView("flanks");
    else if (kind === "levers") setView("levers");
    else if (kind === "data") setView("data");
    else if (kind === "watch") setView("watch");
    else if (kind === "this-site") setView("site");
    else if (kind === "about") setView("about");
    else if (kind === "colophon") { setView("site"); const c = document.getElementById("colophon"); if (c) c.scrollIntoView(); return; }
    else { clear(); mapMode = "world"; renderLegend(); setView("map"); }
    povSel.title = povSel.selectedOptions[0] ? povSel.selectedOptions[0].text : "";
    toTop();
  }
  function goHome() { navigate("#/"); }
  function setPov(id) { navigate(`#/view/${id}`); }
  function showDossier(id) { navigate(`#/dossier/${id}`); }

  const orgSel = document.getElementById("orgsel"), issueSel = document.getElementById("issuesel");
  // official member counts, so the menu says when a list is short (Wikidata coverage is uneven)
  const EXPECTED = { "org-un": 193, "org-nato": 32, "org-eu": 27, "org-csto": 6, "org-sco": 10, "org-brics": 10, "org-opec": 12, "org-arab-league": 22, "org-au": 55, "org-asean": 11, "org-gcc": 6, "org-oic": 57, "org-osce": 57, "org-coe": 46, "org-cis": 10, "org-eaeu": 5, "org-oas": 35, "org-commonwealth": 56, "org-g7": 7, "org-g20": 19, "org-oecd": 38, "org-ecowas": 12, "org-aes": 3, "org-nam": 120, "org-cefta": 7, "org-mercosur": 5, "org-celac": 33, "org-saarc": 8, "org-pif": 18, "org-sadc": 16, "org-eac": 8, "org-ots": 5, "org-wto": 166, "org-icc": 125 };
  const orgs = data.actors.filter(a => a.type === "org" && membersOf[a.id] && a.id !== "org-un")
    .map(a => ({ a, n: Object.keys(membersOf[a.id]).length, exp: EXPECTED[a.id] || 0 }))
    .map(o => ({ ...o, ok: !o.exp || o.n >= 0.7 * o.exp }))
    .sort((x, y) => (y.ok - x.ok) || (y.n - x.n));
  orgs.forEach(o => { const opt = new Option(`${o.a.name} (${o.n}${o.exp && o.n < o.exp ? ` of ${o.exp}` : ""})`, o.a.id); if (!o.ok) { opt.disabled = true; opt.text += " - list incomplete"; } orgSel.add(opt); });
  Object.entries(ISSUES).forEach(([k, v]) => issueSel.add(new Option(v.label, k)));
  orgSel.onchange = () => { orgSel.value ? showOrg(orgSel.value) : goHome(); };
  issueSel.onchange = () => { issueSel.value ? showIssue(issueSel.value) : goHome(); };
  document.querySelectorAll(".tab").forEach(b => b.onclick = () => b.dataset.view === "dossier" ? showDossier(pov || fullActors[0].id) : (pov ? setPov(pov) : goHome()));
  const PAGE_HASH = { map: "#/", orgs: "#/organisations", issues: "#/issues", luttwak: "#/luttwak", seams: "#/seams", clients: "#/clients", faults: "#/faults", gatherings: "#/gatherings", currents: "#/currents", theatres: "#/theatres", flanks: "#/flanks", levers: "#/levers", watch: "#/watch", about: "#/about", data: "#/data", site: "#/this-site", colophon: "#/colophon" };
  // top menu: Map, then two dropdowns (Readings, About). Open on hover, focus and click/tap (click pins it); close on Escape, outside click, choice
  const dds = [...document.querySelectorAll("#topnav .dd")];
  const ddSet = (dd, on, pin) => {
    if (on) dds.forEach(o => { if (o !== dd) ddSet(o, false); });
    dd.classList.toggle("open", on); dd.dataset.pin = on && pin ? "1" : "";
    dd.querySelector(".ddt").setAttribute("aria-expanded", on ? "true" : "false");
    document.querySelector(".top").classList.toggle("dd-open", dds.some(o => o.classList.contains("open")));
  };
  const ddClose = () => dds.forEach(o => ddSet(o, false));
  dds.forEach(dd => {
    const t = dd.querySelector(".ddt"); let timer = 0;
    dd.addEventListener("pointerenter", e => { if (e.pointerType !== "mouse") return; clearTimeout(timer); ddSet(dd, true, dd.dataset.pin === "1"); });
    dd.addEventListener("pointerleave", e => { if (e.pointerType !== "mouse" || dd.dataset.pin === "1") return; timer = setTimeout(() => ddSet(dd, false), 150); });
    dd.addEventListener("focusin", () => { if (!dd.classList.contains("open")) ddSet(dd, true, false); });
    dd.addEventListener("focusout", e => { if (!dd.contains(e.relatedTarget) && dd.dataset.pin !== "1") ddSet(dd, false); });
    t.addEventListener("click", ev => { ev.preventDefault(); if (dd.classList.contains("open") && dd.dataset.pin === "1") ddSet(dd, false); else ddSet(dd, true, true); });
  });
  document.addEventListener("click", ev => { if (!ev.target.closest("#topnav .dd")) ddClose(); });
  document.addEventListener("keydown", ev => { if (ev.key !== "Escape") return; const o = dds.find(d => d.classList.contains("open")); if (!o) return; ddClose(); if (o.contains(document.activeElement)) o.querySelector(".ddt").focus(); });
  document.querySelectorAll("#topnav a[data-page]").forEach(a => { a.href = PAGE_HASH[a.dataset.page]; a.onclick = ev => { ev.preventDefault(); ddClose(); navigate(PAGE_HASH[a.dataset.page]); }; });
  document.getElementById("home").onclick = ev => { ev.preventDefault(); goHome(); };
  function setView(v, render = true) {
    view = v;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("is-on", b.dataset.view === v));
    document.querySelectorAll("#topnav a[data-page]").forEach(a => a.classList.toggle("is-on", a.dataset.page === v || (a.dataset.page === "map" && (v === "map" || v === "dossier"))));
    dds.forEach(dd => dd.classList.toggle("is-on", !!dd.querySelector("a.is-on")));
    ddClose();
    document.querySelectorAll(".view").forEach(s => s.classList.toggle("is-on", s.id === "view-" + v));
    const isPage = ["orgs", "issues", "luttwak", "seams", "clients", "faults", "gatherings", "currents", "theatres", "flanks", "levers", "watch", "about", "data", "site"].includes(v);
    document.querySelector(".side").style.display = isPage ? "none" : "";
    document.querySelector(".frame").classList.toggle("is-page", isPage);
    if (v === "orgs") renderOrgsPage();
    if (v === "issues") renderIssuesPage();
    if (v === "luttwak") renderLuttwakPage();
    if (v === "seams") renderSeamsPage();
    if (v === "clients") renderClientsPage();
    if (v === "faults") renderFaultsPage();
    if (v === "gatherings") renderGatheringsPage();
    if (v === "currents") renderCurrentsPage();
    if (v === "theatres") renderTheatresPage();
    if (v === "flanks") renderFlanksPage();
    if (v === "levers") renderLeversPage();
    if (v === "data") renderDataPage();
    if (v === "watch") renderWatchPage();
    if (v === "site") renderSitePage();
    if (v === "about") renderAboutPage();
    if (!render) return;
    if (v === "map") drawMap();
    if (v === "dossier") renderDossier(pov || fullActors[0].id);
  }

  // stances indexed by `toward`, rebuilt only when the point of view's list changes (first row wins, as `find` did)
  let stanceIdxSrc = null, stanceIdx = null;
  const stanceOf = id => {
    if (!pov) return undefined;
    const src = data.stances[pov];
    if (src !== stanceIdxSrc || !stanceIdx) {
      stanceIdxSrc = src; stanceIdx = new Map();
      (src || []).forEach(s => { if (!stanceIdx.has(s.toward)) stanceIdx.set(s.toward, s); });
    }
    return stanceIdx.get(id);
  };
  // the note and sources of a stance live in the point of view's bundle; until it arrives the tooltip shows the grade line alone
  const noteOf = id => { const b = LOADED.get(pov), x = b && b.stIdx.get(id); return x && x.note || ""; };
  const gradeOf = id => id === pov ? "own_territory" : (stanceOf(id) ? stanceOf(id).grade : "neutral");

  // the vector display: a posture is a colour, drawn as the outline of the country and a faint light inside it
  // (how much light = how strong the posture; adversaries are lit solid). Same colours in the legend and the tables.
  const LIGHT = { own_territory: .22, ally: .3, reluctant_ally: .22, partner: .26, reluctant_partner: .18, rival: .2, adversary: .55, claimed_territory: .1 };
  const COLOR = g => css("--c-" + (g === "own_territory" ? "pov" : g === "claimed_territory" ? "claimed" : g));
  const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, "0");
  function gradeSwatch(g) {
    if (g === "neutral") return "transparent";
    if (g === "claimed_territory") return `repeating-linear-gradient(45deg, ${COLOR(g)} 0 1.4px, transparent 1.4px 5px)`;
    return alpha(COLOR(g), LIGHT[g]);
  }
  const gradeBorder = g => g === "neutral" ? "var(--ink-3)" : COLOR(g);
  // the other lenses borrow the posture colours: blue for "with", red for "apart", green for yes, orange for withdrew
  const VCLASS = { v90: ["partner", .5], v80: ["partner", .35], v70: ["partner", .24], v60: ["partner", .14], vlow: ["rival", .3],
                   c6: ["partner", .5], c4: ["partner", .35], c2: ["partner", .22], c1: ["partner", .12],
                   yes: ["ally", .35], withdrew: ["reluctant_ally", .35], no: ["rival", .3], abst: ["partner", .2], member: ["ally", .35],
                   h1: ["rival", .14], h2: ["rival", .26], h3: ["rival", .4], h4: ["rival", .58] };
  const NEWS = data.news || null;
  const HEAT_BINS = [["h4", 4, "4 times its normal or more"], ["h3", 2.5, "2.5 to 4 times"], ["h2", 1.6, "1.6 to 2.5 times"], ["h1", 1.25, "1.25 to 1.6 times"]];
  const heatClass = id => { const r = NEWS && NEWS.actors[id]; if (!r || r.events < 50) return null; const b = HEAT_BINS.find(x => r.ratio >= x[1]); return b ? b[0] : null; };
  const fmtDay = iso => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const voteSwatch = c => alpha(COLOR(VCLASS[c][0]), VCLASS[c][1]);
  const voteBorder = c => COLOR(VCLASS[c][0]);
  function renderLegend() {
    const el = document.getElementById("legend");
    if (!pov && homeLens && homeLens.kind === "org") {
      const o = actors[homeLens.id], n = Object.keys(membersOf[homeLens.id]).length;
      el.innerHTML = `<h3>${esc(o.name)}</h3><div class="row"><span class="sw" style="background:${voteSwatch("member")};border-color:${voteBorder("member")}"></span>Member (${n})</div><div class="row"><span class="sw"></span>Not a member</div><div class="row" style="color:var(--ink-3)">Memberships from the official list and Wikidata; some lists are hand-checked.</div>`;
      return;
    }
    if (!pov && homeLens && homeLens.kind === "heat") {
      el.innerHTML = `<h3>News heat, ${NEWS ? fmtDay(NEWS.week.from) + " to " + fmtDay(NEWS.week.to) : "no data"}</h3>` +
        HEAT_BINS.map(([c, , lbl]) => `<div class="row"><span class="sw" style="background:${voteSwatch(c)};border-color:${voteBorder(c)}"></span>${lbl}</div>`).join("") +
        `<div class="row"><span class="sw"></span>Its usual week, or fewer than 50 events</div><div class="row" style="color:var(--ink-3)">Events coded by GDELT from the world's news, counted per country and set against the country's own four-week average: a country is hot when it makes a multiple of its normal, so the loud are not always on top. Attention, not truth; mostly English and other major-language media.</div>`;
      return;
    }
    if (!pov && homeLens && homeLens.kind === "issue") {
      const iss = ISSUES[homeLens.id];
      el.innerHTML = `<h3>${esc(iss.label)}</h3>` + (iss.kind === "recognition"
        ? ["yes", "withdrew", "no"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)};border-color:${voteBorder(c)}"></span>${REC_LABEL[c]}</div>`).join("") + `<div class="row"><span class="sw"></span>No data</div>`
        : ["yes", "abst", "no"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)};border-color:${voteBorder(c)}"></span>${VOTE_LBL[c]}</div>`).join("") + `<div class="row"><span class="sw"></span>Did not vote</div><div class="row" style="color:var(--ink-3)">${esc((unga.resolutions[iss.symbol] || {}).label || "")}, ${esc((unga.resolutions[iss.symbol] || {}).date || "")}, ${esc((unga.resolutions[iss.symbol] || {}).tally || "")}</div>`);
      return;
    }
    if (!pov) {
      el.innerHTML = `<h3>The world of today</h3><div class="row">Borders and flags as of ${data.generated}. Click a country that has a card to see the world as it sees it; ${fullActors.length} card${fullActors.length > 1 ? "s" : ""} so far<span class="cardlist">: ${[...fullActors].sort((p, q) => p.name.localeCompare(q.name)).map(a => a.name).join(", ")}</span>.</div>`;
      return;
    }
    if (lens === "votes") {
      el.innerHTML = `<h3>Votes with ${actors[pov].name}</h3><div class="row" style="color:var(--ink-3)">UN General Assembly, recorded votes ${unga.span || ""}</div>` +
        ["v90", "v80", "v70", "v60", "vlow"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)};border-color:${voteBorder(c)}"></span>${VOTE_LABEL[c]}</div>`).join("") +
        `<div class="row"><span class="sw"></span>Fewer than 20 common votes</div>`;
      return;
    }
    if (lens === "clubs") {
      el.innerHTML = `<h3>Organisations shared with ${actors[pov].name}</h3><div class="row" style="color:var(--ink-3)">Of ${[...clubs[pov]].filter(o => o !== "org-un").length} memberships besides the UN (NATO, EU, BRICS, OPEC...)</div>` +
        ["c6", "c4", "c2", "c1"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)} var(--land)"></span>${CLUB_LABEL[c]}</div>`).join("") +
        `<div class="row"><span class="sw"></span>None in common</div>`;
      return;
    }
    if (lens === "recognition") {
      el.innerHTML = `<h3>Who recognises ${actors[pov].name}</h3>` +
        ["yes", "withdrew", "no"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)} var(--land)"></span>${REC_LABEL[c]}</div>`).join("") +
        `<div class="row"><span class="sw"></span>Not a UN member / no data</div>`;
      return;
    }
    el.innerHTML = `<h3>Posture of ${actors[pov].name}</h3>` +
      data.grades.map(g => `<div class="row"><span class="sw" style="background:${gradeSwatch(g)};border-color:${gradeBorder(g)};${g === "claimed_territory" ? "border-style:dashed" : ""}"></span>${GRADE_LABEL[g]}</div>`).join("") +
      `<h3>Bond</h3>
       <div class="row"><span class="sw" style="box-shadow:inset 0 0 0 3px var(--c-partner)"></span>Kin - shared identity</div>
       <div class="row"><span class="sw" style="box-shadow:inset 0 0 0 3px var(--c-rival)"></span>Grievance - open wound</div>
       <div class="row"><span class="sw"></span>Affinity or no standing tie</div>
       <div class="row"><span class="sw" style="border:2px dashed var(--c-ally)"></span>Aligned, no treaty</div>
       <div class="row fault-hint">A band that contradicts its outline is a fault: kin inside red = feud, grievance inside green = Byzantine alliance.</div>` +
      (SEAMS_ON_MAP && seamsAround(pov).length ? `<h3>Seams</h3><div class="row"><span class="sw" style="border:1.5px dashed var(--c-seam)"></span>Pulled between ${actors[pov].short || actors[pov].name} and a rival (${new Set(seamsAround(pov).map(s => s.y)).size})</div>` : "");
  }

  // ---------- tooltip
  const tip = document.getElementById("tip");
  // the tooltip is rebuilt only when the hovered id changes; plain movement only moves it (size measured once per content)
  let tipId = null, tipW = 0, tipH = 0;
  function placeTip(ev) {
    const w = tipW, h = tipH, W = window.innerWidth, H = window.innerHeight;
    let x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + w > W - 8) x = Math.max(8, ev.clientX - w - 14);
    if (y + h > H - 8) y = Math.max(8, ev.clientY - h - 14);
    if (y + h > H - 8) y = Math.max(8, H - h - 8);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function showTip(html, ev) {
    tipId = null;
    tip.innerHTML = html; tip.hidden = false;
    // measured after the content is set: flip to the left or above the cursor rather than run off the screen
    tipW = tip.offsetWidth; tipH = tip.offsetHeight;
    placeTip(ev);
  }
  const hideTip = () => { tip.hidden = true; tipId = null; };

  // ---------- map
  let mapState = null, zoomRaf = 0;
  // Performance switches, read once from the address (?fx=a,b,c), for A/B tests:
  //   noanim     no animated overlays: warming/cooling outlines stay static at full opacity
  //   nofilter   no phosphor glow filter at all
  //   nozoomopt  the old zoom path: stroke widths and dashes recomputed on every zoom event, no frame coalescing,
  //              label widths re-measured every time
  // The pulse lives in two overlay <svg>s (warming, cooling) over the map, animated by CSS opacity on the compositor;
  // the glow is switched off and the pulse paused (class "zooming" on .map-wrap) while a zoom gesture is in progress.
  const FX = new Set((new URLSearchParams(location.search).get("fx") || "").split(",").map(x => x.trim()).filter(Boolean));
  const REDUCED_MOTION = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // lowest stroke opacity of each pulse; the static outline under the overlay carries it, the overlay adds the rest
  const PULSE_FLOOR = { warming: .55, cooling: .15 };
  function drawMap() {
    const svg = d3.select("#map");
    const wrap = d3.select(svg.node().parentNode);
    if (zoomRaf) { cancelAnimationFrame(zoomRaf); zoomRaf = 0; }
    tipId = null; litId = null;
    wrap.selectAll("svg.fx-overlay").remove();
    wrap.classed("zooming", false).classed("fx-nofilter", FX.has("nofilter"));
    svg.selectAll("*").remove();
    const { width, height } = svg.node().getBoundingClientRect();
    const proj = d3.geoNaturalEarth1().fitExtent([[10, 10], [width - 10, height - 10]], world);
    const path = d3.geoPath(proj);
    const ink = css("--ink-a"), sea = css("--paper"), land = css("--land");

    const defs = svg.append("defs");
    // home: every country wears its flag of today, Boetti-style - one flag per piece of land (the mainland,
    // Alaska, each island), each centred on its own piece, at a resolution that survives the zoom
    const flagHome = !pov && !homeLens;
    const pieces = [];
    if (flagHome) world.features.forEach(f => {
      if (!iso2[f.id] || f.id === "ATA") return;
      const polys = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
      polys.forEach((coords, i) => {
        const piece = { type: "Feature", id: f.id, i, properties: f.properties, geometry: { type: "Polygon", coordinates: coords } };
        const [[x0, y0], [x1, y1]] = path.bounds(piece);
        if (!isFinite(x0)) return;
        const w = Math.max(x1 - x0, (y1 - y0) * 1.5), px = w < 30 ? 160 : w < 90 ? 320 : w < 220 ? 640 : 1280;
        defs.append("pattern").attr("id", `flag-${f.id}-${i}`).attr("width", 1).attr("height", 1).attr("patternContentUnits", "objectBoundingBox")
          .append("image").attr("href", `https://flagcdn.com/w${px}/${iso2[f.id]}.png`).attr("width", 1).attr("height", 1).attr("preserveAspectRatio", "xMidYMid slice");
        pieces.push(piece);
      });
    });
    // the phosphor glow behind every lit outline
    const glow = defs.append("filter").attr("id", "glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    glow.append("feGaussianBlur").attr("stdDeviation", 1.6).attr("result", "b");
    const mg = glow.append("feMerge"); mg.append("feMergeNode").attr("in", "b"); mg.append("feMergeNode").attr("in", "SourceGraphic");
    // claimed, not controlled: red hatch under a dashed outline
    const hatch = defs.append("pattern").attr("id", "hatch").attr("width", 5).attr("height", 5).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    hatch.append("rect").attr("width", 1.6).attr("height", 5).attr("fill", COLOR("claimed_territory")).attr("fill-opacity", .6);

    // what lights a country up, by lens
    const aff = pov && lens === "votes" ? (unga.affinity[pov] || {}) : null;
    const rec = pov && lens === "recognition" ? (recog[pov] || {}) : null;
    const homeClass = id => {
      if (!homeLens) return null;
      if (homeLens.kind === "org") return membersOf[homeLens.id][id] !== undefined ? "member" : null;
      if (homeLens.kind === "heat") return heatClass(id);
      const iss = ISSUES[homeLens.id];
      if (iss.kind === "recognition") return id === iss.target ? "member" : (recog[iss.target] || {})[id] || null;
      const v = voteOn(iss.symbol, id); return v ? VOTE_CLS[v] : null;
    };
    const lensClass = id => !pov ? homeClass(id) : lens === "votes" ? voteClass(aff[id]) : lens === "clubs" ? clubClass(sharedClubs(pov, id).length) : lens === "recognition" ? rec[id] : null;
    const posture = lens === "posture" && pov;
    const gradeAt = f => f.id === pov ? "own_territory" : stanceOf(f.id).grade;
    const litColor = f => posture ? COLOR(gradeAt(f)) : f.id === pov ? COLOR("own_territory") : COLOR(VCLASS[lensClass(f.id)][0]);
    const litLight = f => posture ? (LIGHT[gradeAt(f)] || 0) : f.id === pov ? LIGHT.own_territory : VCLASS[lensClass(f.id)][1];
    const litWidth = f => f.id === pov ? 2.2 : .9 + litLight(f) * 1.8;
    const isClaimed = f => posture && f.id !== pov && stanceOf(f.id).grade === "claimed_territory";
    const screened = !pov ? (homeLens ? world.features.filter(f => lensClass(f.id)) : []) : posture ? world.features.filter(f => f.id === pov || stanceOf(f.id)) : world.features.filter(f => f.id === pov || lensClass(f.id));

    // keep line weights, dashes and type at screen size whatever the zoom. The lines are drawn with
    // vector-effect: non-scaling-stroke, so their widths and dashes are set once, in screen units, at creation;
    // only the type, the hatch and the seats follow k.
    const NSS = !FX.has("nozoomopt");
    let ov = d3.select(null); // the pulse overlays' outline paths, filled in below
    const labelExtent = new Map(); // projected x-extent of each country at k=1, measured once per draw
    function extentOf(id) {
      let e = labelExtent.get(id);
      if (e === undefined) { const [[x0], [x1]] = path.bounds(feature[id]); e = x1 - x0; labelExtent.set(id, e); }
      return e;
    }
    function rescale(k) {
      defs.select("#hatch").attr("patternTransform", `rotate(45) scale(${1 / k})`);
      if (!NSS) {
        g.selectAll("path.c").attr("stroke-width", .55 / k);
        g.selectAll("path.grat").attr("stroke-width", .5 / k).attr("stroke-dasharray", `${2 / k} ${3 / k}`);
        g.selectAll("path.p").attr("stroke-width", f => litWidth(f) / k).attr("stroke-dasharray", f => isClaimed(f) ? `${3 / k} ${2 / k}` : null);
        g.selectAll("path.bond").attr("stroke-width", 3.4 / k);
        g.selectAll("path.align").attr("stroke-width", 7 / k).attr("stroke-dasharray", `${7 / k} ${5 / k}`);
        g.selectAll("path.seam").attr("stroke-width", 1.6 / k).attr("stroke-dasharray", `${4 / k} ${3 / k}`);
        ov.attr("stroke-width", f => litWidth(f) / k);
      }
      // a label shows only when its country is wide enough on screen to carry it (the point of view always does)
      g.selectAll(".labels text").attr("font-size", 10 / k).attr("stroke-width", 3 / k)
        .attr("opacity", a => {
          if (a.id === pov || !feature[a.id]) return 1;
          return (NSS ? extentOf(a.id) : (([[x0], [x1]]) => x1 - x0)(path.bounds(feature[a.id]))) * k >= (a.short || a.name).length * 5.6 ? 1 : 0;
        });
      g.selectAll(".seats rect").attr("transform", a => { const [x, y] = proj(a.coords); return `translate(${x},${y}) scale(${1 / k}) translate(${-x},${-y})`; });
    }

    svg.append("rect").attr("width", width).attr("height", height).attr("fill", flagHome ? css("--sea") : css("--paper"));
    const g = svg.append("g");

    const countries = g.append("g");
    if (!flagHome) countries.append("path").attr("class", "grat").attr("d", path(d3.geoGraticule10())).attr("fill", "none").attr("stroke", css("--grat")).attr("stroke-width", .5).attr("stroke-dasharray", "2 3").attr("pointer-events", "none");
    // the flag pieces go under the country outlines, which stay transparent on top so hover and click still work
    countries.selectAll("path.flag").data(pieces).join("path").attr("class", "flag")
      .attr("d", path).attr("fill", p => `url(#flag-${p.id}-${p.i})`).attr("pointer-events", "none");
    // base: every country as a faint outline on black (or its flag at home)
    countries.selectAll("path.c").data(world.features.filter(f => !(flagHome && f.id === "ATA"))).join("path").attr("class", "c")
      .attr("d", path).attr("fill", f => flagHome && iso2[f.id] ? "transparent" : land)
      .attr("stroke", flagHome ? css("--sea-ink") : css("--coast")).attr("stroke-opacity", flagHome ? 1 : .75).attr("stroke-width", .55).attr("stroke-linejoin", "round")
      .style("cursor", f => actors[f.id] ? "pointer" : "default")
      .on("mousemove", (ev, f) => { tipFor(f.id, f.properties.name, ev); lightCard(f.id); })
      .on("mouseleave", () => { hideTip(); lightCard(null); })
      .on("click", (ev, f) => { if (!actors[f.id]) return; if (!pov && (actors[f.id].card === "full" || hasVotes(f.id) || hasStances(f.id) || hasClubs(f.id) || hasRecog(f.id))) setPov(f.id); else showDossier(f.id); });
    // lit countries: outline in the posture's colour, the same light inside, phosphor glow
    const pulseOf = f => PULSE_ON_MAP && posture && f.id !== pov && stanceOf(f.id) ? ({ warming: "warming", cooling: "cooling" }[stanceOf(f.id).trend] || "") : "";
    const overlays = !FX.has("noanim") && !REDUCED_MOTION; // the pulse rides on overlays; without them the outlines stay still
    countries.selectAll("path.p").data(screened).join("path")
      .attr("d", path).attr("pointer-events", "none").attr("stroke-linejoin", "round")
      .attr("fill", f => isClaimed(f) ? "url(#hatch)" : litColor(f)).attr("fill-opacity", f => isClaimed(f) ? 1 : litLight(f))
      .attr("stroke", litColor).attr("stroke-width", litWidth).attr("filter", "url(#glow)")
      .attr("stroke-dasharray", f => isClaimed(f) ? "3 2" : null)
      .attr("stroke-opacity", f => overlays && pulseOf(f) ? PULSE_FLOOR[pulseOf(f)] : null)
      .attr("class", f => "p" + (pulseOf(f) ? " " + pulseOf(f) : ""));
    // the pulse overlays: one <svg> per kind stacked over the map, holding only the outlines of the pulsing
    // countries; the CSS animates the opacity of the whole overlay (compositor), never a paint property
    const overlayG = {};
    if (overlays) ["warming", "cooling"].forEach(kind => {
      const feats = screened.filter(f => pulseOf(f) === kind);
      if (!feats.length) return;
      const osvg = wrap.append("svg").attr("class", "fx-overlay " + kind).attr("aria-hidden", "true");
      overlayG[kind] = osvg.append("g");
      overlayG[kind].selectAll("path").data(feats).join("path").attr("class", "fxp")
        .attr("d", path).attr("fill", "none").attr("pointer-events", "none").attr("stroke-linejoin", "round")
        .attr("stroke", litColor).attr("stroke-width", litWidth).attr("filter", "url(#glow)");
    });
    ov = wrap.selectAll("svg.fx-overlay path");
    // seams: the actors pulled between the point of view and one of its rivals get a dashed outline in the seam colour
    const seamIds = SEAMS_ON_MAP && posture ? new Set(seamsAround(pov).map(s => s.y)) : new Set();
    countries.selectAll("path.seam").data(world.features.filter(f => seamIds.has(f.id))).join("path").attr("class", "seam")
      .attr("d", path).attr("fill", "none").attr("pointer-events", "none").attr("stroke", css("--c-seam")).attr("stroke-width", 1.6).attr("stroke-dasharray", "4 3").attr("filter", "url(#glow)");
    // bond: a band inside the border - blue for kin, red for grievance, none otherwise; clipped to its own country
    const bonded = !posture ? [] : world.features.filter(f => stanceOf(f.id) && ["kin", "grievance"].includes(stanceOf(f.id).bond));
    bonded.forEach(f => defs.append("clipPath").attr("id", "clip-" + f.id).append("path").attr("d", path(f)));
    countries.selectAll("path.bond").data(bonded).join("path").attr("class", "bond")
      .attr("d", path).attr("fill", "none").attr("pointer-events", "none").attr("stroke-linejoin", "round")
      .attr("clip-path", f => `url(#clip-${f.id})`)
      .attr("stroke", f => stanceOf(f.id).bond === "kin" ? COLOR("partner") : COLOR("rival")).attr("stroke-opacity", .8).attr("stroke-width", 3.4);
    // alignment without a treaty (ONTOLOGY, 2026-10-16): a dashed band in ally green inside the border
    const aligned = !posture ? [] : world.features.filter(f => stanceOf(f.id) && stanceOf(f.id).alignment === "de_facto");
    aligned.forEach(f => { if (defs.select("#clip-" + f.id).empty()) defs.append("clipPath").attr("id", "clip-" + f.id).append("path").attr("d", path(f)); });
    countries.selectAll("path.align").data(aligned).join("path").attr("class", "align")
      .attr("d", path).attr("fill", "none").attr("pointer-events", "none").attr("stroke-linejoin", "round")
      .attr("clip-path", f => `url(#clip-${f.id})`)
      .attr("stroke", COLOR("ally")).attr("stroke-opacity", .9).attr("stroke-width", 7).attr("stroke-dasharray", "7 5");
    if (NSS) { // line weights and dashes stay in screen units whatever the zoom
      countries.selectAll("path.grat, path.c, path.p, path.seam, path.bond, path.align").attr("vector-effect", "non-scaling-stroke");
      ov.attr("vector-effect", "non-scaling-stroke");
    }

    // non-state actors and seats
    const seats = g.append("g").attr("class", "seats");
    const seated = a => !!feature[a.id] || !!(a.coords && (a.coords[0] || a.coords[1]));   // an organisation without a headquarters sits at [0, 0] and is not drawn
    const nonState = posture ? data.actors.filter(a => !feature[a.id] && seated(a) && (a.id === pov || stanceOf(a.id))) : [];
    seats.selectAll("rect").data(nonState).join("rect")
      .attr("x", a => proj(a.coords)[0] - 4).attr("y", a => proj(a.coords)[1] - 4).attr("width", 8).attr("height", 8)
      .attr("fill", a => COLOR(gradeOf(a.id))).attr("fill-opacity", a => LIGHT[gradeOf(a.id)] || 0).attr("stroke", a => COLOR(gradeOf(a.id))).attr("stroke-width", 1).attr("filter", "url(#glow)")
      .style("cursor", "pointer")
      .on("mousemove", (ev, a) => { tipFor(a.id, a.name, ev); lightCard(a.id); }).on("mouseleave", () => { hideTip(); lightCard(null); }).on("click", (ev, a) => showDossier(a.id));

    // labels: display capitals for every lit actor
    const labelled = !pov ? [] : !posture ? data.actors.filter(a => a.id === pov && seated(a)) : data.actors.filter(a => seated(a) && (a.id === pov || stanceOf(a.id)));
    const stacked = {}; // non-state actors sharing a seat (EU and NATO in Brussels) stack their labels
    const labels = g.append("g").attr("class", "labels").attr("pointer-events", "none");
    labels.selectAll("text").data(labelled).join("text")
      .attr("x", a => (feature[a.id] ? path.centroid(feature[a.id]) : proj(a.coords))[0])
      .attr("y", a => {
        if (feature[a.id]) return path.centroid(feature[a.id])[1];
        const key = a.coords.map(c => Math.round(c)).join(","); stacked[key] = (stacked[key] || 0) + 1;
        return proj(a.coords)[1] + 3 + stacked[key] * 3;
      })
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("font-family", css("--font-ui")).attr("letter-spacing", ".12em")
      .attr("fill", a => a.id === pov ? COLOR("own_territory") : feature[a.id] && stanceOf(a.id) ? COLOR(stanceOf(a.id).grade === "neutral" ? "neutral" : stanceOf(a.id).grade) : css("--ink"))
      .attr("paint-order", "stroke").attr("stroke", css("--paper")).attr("stroke-opacity", .9)
      .text(a => (a.short || a.name).toUpperCase());
    mapState = { svg, g, proj, path, width, height, labels };

    // framing: the whole world, or a neighbourhood around the point of view
    let pendingK = 1;
    const zoom = d3.zoom().scaleExtent([1, 14]).on("start", () => wrap.classed("zooming", true))
      .on("zoom", ev => {
        g.attr("transform", ev.transform);
        Object.values(overlayG).forEach(og => og.attr("transform", ev.transform));
        if (!NSS) return rescale(ev.transform.k);
        // everything that follows k is done once per frame, with the latest k
        pendingK = ev.transform.k;
        if (!zoomRaf) zoomRaf = requestAnimationFrame(() => { zoomRaf = 0; rescale(pendingK); });
      })
      .on("end", () => wrap.classed("zooming", false));
    mapState.rescale = rescale;
    svg.call(zoom);
    function frame(mode) {
      let t = d3.zoomIdentity;
      // a country that crosses the antimeridian (Fiji, Russia) has bounds as wide as the map: frame its largest piece that does not,
      // and if there is none, the seat point with a fixed radius
      const homeBounds = id => {
        const f = feature[id], b = path.bounds(f);
        if (b[1][0] - b[0][0] <= width / 2) return b;
        let best = null, area = -1;
        (f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates]).forEach(c => {
          const pb = path.bounds({ type: "Feature", geometry: { type: "Polygon", coordinates: c } }), w = pb[1][0] - pb[0][0];
          if (w <= width / 2 && w * (pb[1][1] - pb[0][1]) > area) { area = w * (pb[1][1] - pb[0][1]); best = pb; }
        });
        if (best) return best;
        const [sx, sy] = proj(actors[id].coords);
        return [[sx - 6, sy - 6], [sx + 6, sy + 6]];
      };
      const home = pov && feature[pov] ? homeBounds(pov) : null;
      if (mode === "near" && home) {
        const [[x0, y0], [x1, y1]] = home;
        const span = Math.max(x1 - x0, y1 - y0) * 9;
        const k = Math.max(1.5, Math.min(14, Math.min(width, height) / span));
        t = d3.zoomIdentity.translate(width / 2 - k * (x0 + x1) / 2, height / 2 - k * (y0 + y1) / 2).scale(k);
      }
      if (![t.k, t.x, t.y].every(Number.isFinite)) t = d3.zoomIdentity;   // a map drawn while the pane has no size (hidden tab) must not leave a NaN transform
      svg.transition().duration(600).call(zoom.transform, t);
      svg.selectAll(".frame-btn").classed("is-on", function () { return this.dataset.mode === mode; });
    }
    const ctl = svg.append("foreignObject").attr("x", 12).attr("y", 12).attr("width", 240).attr("height", 40);
    ctl.attr("width", Math.min(560, Math.max(200, (svg.node().getBoundingClientRect().width || 560) - 24))).attr("height", 80);
    ctl.append("xhtml:div").attr("class", "frame-ctl").html(pov
      ? `<button class="frame-btn" data-mode="near">Neighbourhood</button><button class="frame-btn" data-mode="world">World</button>` +
        `<span class="frame-gap"></span>` +
        (hasStances(pov) ? `<button class="frame-btn lens ${lens === "posture" ? "is-on" : ""}" data-lens="posture">Posture</button>` : "") +
        (hasRecog(pov) ? `<button class="frame-btn lens ${lens === "recognition" ? "is-on" : ""}" data-lens="recognition">Recognition</button>` : "") +
        (hasVotes(pov) ? `<button class="frame-btn lens ${lens === "votes" ? "is-on" : ""}" data-lens="votes">UN votes</button>` : "") +
        (hasClubs(pov) ? `<button class="frame-btn lens ${lens === "clubs" ? "is-on" : ""}" data-lens="clubs">Clubs</button>` : "")
      : homeLens ? `<button class="frame-btn" data-home="flags">Flags</button><button class="frame-btn is-on" data-mode="world">${esc(homeLens.kind === "org" ? actors[homeLens.id].name : homeLens.kind === "heat" ? "News heat this week" : ISSUES[homeLens.id].label.split(" - ")[0])}</button>`
      : `<button class="frame-btn is-on" data-mode="world">The world of today</button>`);
    ctl.selectAll("button[data-home]").on("click", () => goHome());
    ctl.selectAll("button[data-mode]").on("click", ev => { mapMode = ev.currentTarget.dataset.mode; frame(mapMode); });
    ctl.selectAll("button[data-lens]").on("click", ev => navigate(`#/view/${pov}/${ev.currentTarget.dataset.lens}`));
    frame(mapMode);
    rescale(d3.zoomTransform(svg.node()).k || 1);
    renderRelPanel();
    svg.selectAll(".frame-btn[data-mode]").classed("is-on", function () { return this.dataset.mode === mapMode; });

  }

  // ---------- relations ledger under the map: counterparts on the left, the latest traffic on the right
  const flagOf = a => a.flag ? a.flag : a.iso2 ? `https://flagcdn.com/w80/${a.iso2}.png` : null;
  let litId = null;
  function lightCard(id) {
    if (id === litId) return;
    litId = id;
    document.querySelectorAll(".ledger tr.cp").forEach(c => c.classList.toggle("is-lit", c.dataset.id === id));
  }
  // filters on the ledger: click a posture, trend, bond or type to keep only that; click again to clear
  let ledgerFilter = {};
  function renderRelPanel() {
    const el = document.getElementById("relpanel");
    litId = null;
    if (!pov) { el.innerHTML = ""; ledgerFilter = {}; return; }
    const pb = LOADED.get(pov);
    if (!pb) {   // the rows live in the point of view's bundle: draw the ledger when it arrives
      el.innerHTML = "";
      const want = pov;
      bundle(want).then(b => { if (b && pov === want) renderRelPanel(); });
      return;
    }
    const rows = realRows(pb.relations_from);
    const byTo = d3.group(rows, r => r.to);
    const F = ledgerFilter;
    let counterparts = [...new Set([...byTo.keys(), ...(data.stances[pov] || []).map(s => s.toward)])]
      .map(id => ({ id, rows: byTo.get(id) || [], st: stanceOf(id) }))
      .sort((x, y) => y.rows.length - x.rows.length || x.id.localeCompare(y.id));
    const total = counterparts.length;
    counterparts = counterparts.filter(c => (!F.grade || (c.st && c.st.grade === F.grade)) && (!F.trend || (c.st && c.st.trend === F.trend)) && (!F.bond || (c.st && c.st.bond === F.bond)));
    const keep = new Set(counterparts.map(c => c.id));
    let traffic = [...rows].sort((x, y) => String(y.since).localeCompare(String(x.since)));
    const filtered = F.grade || F.trend || F.bond || F.type;
    if (filtered) traffic = traffic.filter(r => keep.has(r.to) && (!F.type || r.type === F.type));
    const latest = filtered ? traffic : traffic.slice(0, 18);
    const glyph = st => st ? `<i style="border-color:${gradeBorder(st.grade)};background:${gradeSwatch(st.grade)}"></i>` : `<i style="border-color:var(--ink-3)"></i>`;
    const fv = (k, v, label) => `<span class="fv ${F[k] === v ? "is-on" : ""}" data-k="${k}" data-v="${esc(v)}">${label}</span>`;
    const chips = Object.entries(F).map(([k, v]) => `<span class="fv is-on" data-k="${k}" data-v="${esc(v)}">${esc(String(v).replace(/_/g, " "))} ×</span>`).join(" ");
    el.innerHTML = `<div class="ledger">
      <div><h3>Counterparts of ${esc(actors[pov].name)} <span>${counterparts.length}${counterparts.length < total ? " of " + total : ""}</span>${chips ? `<span class="chips">${chips}</span>` : ""}</h3>
        <table><thead><tr><th>Actor</th><th>Posture</th><th>Trend</th><th>Bond</th><th title="lean: who leans on whom">Lean</th><th>Fault</th><th style="text-align:right">Rows</th></tr></thead><tbody>` +
        counterparts.map(c => `<tr class="cp" data-id="${c.id}"><td class="name">${glyph(c.st)}${esc(actors[c.id].short || actors[c.id].name)}</td>
          <td>${c.st ? fv("grade", c.st.grade, c.st.grade.replace(/_/g, " ")) + (c.st.alignment === "de_facto" ? " <span class='tr' title='aligned without a treaty'>· aligned</span>" : "") + ((c.st.reciprocal_of || c.st.dataset === "reciprocal") ? " <span class='tr' title='not written from this side: mirrored from the other card'>· mirrored</span>" : "") : "<span class='tr'>-</span>"}</td>
          <td class="tr">${c.st ? fv("trend", c.st.trend, TREND_SIGN[c.st.trend] + " " + TREND[c.st.trend]) : ""}</td>
          <td class="tr">${c.st ? fv("bond", c.st.bond, BOND_LABEL[c.st.bond].split(" - ")[0].toLowerCase()) : ""}</td>
          <td class="tr lean-c" title="${(l => l == null ? "both sides not written" : l > 0 ? nameOf(c.id) + " leans on " + nameOf(pov) : nameOf(pov) + " leans on " + nameOf(c.id))(leanOf(pov, c.id))}">${(l => l == null ? "·" : l > 0 ? "↑" + l : "↓" + (-l))(leanOf(pov, c.id))}</td>
          <td class="tr fault-c ${faultOf(pov, c.id) || ""}">${faultOf(pov, c.id) || ""}</td>
          <td class="n">${c.rows.length || "-"}</td></tr>`).join("") +
        `</tbody></table></div>
      <div><h3>${filtered ? "Matching traffic" : "Latest traffic"} <span>${filtered ? latest.length + " of " + rows.length + " rows" : rows.length + " rows, newest first"}</span></h3>
        <table><thead><tr><th>Date</th><th>Toward</th><th>Type</th><th>Entry</th></tr></thead><tbody>` +
        latest.map(r => `<tr class="cp" data-id="${r.to}"><td class="d">${esc(r.since)}</td><td class="who">${esc(actors[r.to].short || actors[r.to].name)}</td><td class="t">${fv("type", r.type, r.type.replace(/_/g, " "))}</td><td>${esc(r.summary)}</td></tr>`).join("") +
        `</tbody></table>${!filtered && rows.length > latest.length ? `<div class="more">+ ${rows.length - latest.length} older rows in the dossier</div>` : ""}</div>
    </div>`;
    el.querySelectorAll("tr.cp").forEach(c => { c.onclick = () => showDossier(c.dataset.id); c.onmouseenter = () => lightCard(c.dataset.id); c.onmouseleave = () => lightCard(null); });
    el.querySelectorAll(".fv").forEach(f => f.onclick = ev => {
      ev.stopPropagation();
      const { k, v } = f.dataset;
      if (ledgerFilter[k] === v) delete ledgerFilter[k]; else ledgerFilter[k] = v;
      const y = window.scrollY; renderRelPanel(); window.scrollTo(0, y);
    });
  }

  // ---------- pages: organisations, issues, Luttwak
  function showOrg(id) { navigate(`#/organisation/${id}`); }
  function showIssue(id) { navigate(`#/issue/${id}`); }
  function renderOrgsPage() {
    const el = document.getElementById("page-orgs");
    el.innerHTML = `<h2>Organisations</h2><p class="lede">Who belongs to what. Memberships come from each organisation's official member list, with Wikidata as the index; where a list is still short the count says so. Pick one to see its members on the map.</p>
      <div class="cardgrid">` + orgs.map(o => `<div class="orgcard ${o.ok ? "" : "is-weak"}" data-id="${o.a.id}">
        ${o.a.flag ? `<img class="orgflag" src="${esc(o.a.flag)}" alt="">` : "<span></span>"}<b>${esc(o.a.name)}</b>
        <span class="n">${o.n} member${o.n === 1 ? "" : "s"}${o.exp && o.n < o.exp ? ` of ${o.exp}` : ""}${o.ok ? "" : " - list incomplete"}</span>
        <span class="who">${Object.keys(membersOf[o.a.id]).slice(0, 8).map(id => actors[id] ? esc(actors[id].short || actors[id].name) : id).join(" · ")}${o.n > 8 ? " · ..." : ""}</span>
      </div>`).join("") + `</div>`;
    el.querySelectorAll(".orgcard").forEach(c => c.onclick = () => showOrg(c.dataset.id));
  }
  function renderIssuesPage() {
    const el = document.getElementById("page-issues");
    el.innerHTML = `<h2>Issues</h2><p class="lede">The questions that split the world today, as the atlas can show them: recognition tables and General Assembly votes for now, the cards' disputes as they are written. The list grows as the cards do; each entry carries the date it was added. Pick one to see who stands where.</p>
      <div class="cardgrid">` + Object.entries(ISSUES).map(([k, v]) => {
        const r = v.kind === "vote" ? (unga.resolutions[v.symbol] || {}) : null;
        const cnt = v.kind === "recognition" ? Object.values(recog[v.target] || {}).reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {}) : null;
        return `<div class="orgcard" data-id="${k}"><span></span><b>${esc(v.title)}</b><span class="n">${esc(v.subtitle || "")}</span>
          <span class="who">${v.kind === "recognition" ? `${cnt.yes || 0} recognise · ${cnt.no || 0} do not · ${cnt.withdrew || 0} withdrew` : `${esc(r.label || "")} · ${esc(r.date || "")} · ${esc(r.tally || "")}`}</span>
          ${v.why ? `<span class="why">${esc(v.why)}</span>` : ""}<span class="added">added ${esc(v.added || "")}</span></div>`;
      }).join("") + `</div>`;
    el.querySelectorAll(".orgcard").forEach(c => c.onclick = () => showIssue(c.dataset.id));
  }
  function renderLuttwakPage() {
    const el = document.getElementById("page-luttwak");
    if (el.dataset.done) return;
    el.dataset.done = "1";
    el.innerHTML = `
      <h2>Luttwak, the lamp</h2>
      <figure class="portrait"><img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Edward_Luttwak_in_2026.jpg/500px-Edward_Luttwak_in_2026.jpg" alt="Edward N. Luttwak in 2026"><figcaption>Edward N. Luttwak, 2026. Photo Elekes Andor, CC BY 4.0, Wikimedia Commons.</figcaption></figure>
      <p class="honour">This site is built in honour of Edward N. Luttwak. It is not his work and was built without his involvement; it is an attempt to look at the whole world, every state at once, with the lamp he built.</p>
      <p class="lede">This atlas reads the world through Edward N. Luttwak's idea of grand strategy. Not because he is always right, but because his grid forces the questions that a map of flags leaves out: what does each actor want, with what, against what, and where do its own moves turn against it.</p>
      <h3>The paradoxical logic</h3>
      <p>Luttwak's central claim (<i>Strategy: The Logic of War and Peace</i>, 1987) is that strategy is paradoxical, because the other side reacts; the argument is set out under The work, below. Every card in this atlas therefore ends with <b>paradoxes</b>: the places where an actor's own instruments undermine its own goals. Serbia withholds its alignment with Brussels to keep UN cover on Kosovo, which rests on the Russian and Chinese veto, and the Commission ties the pace of its negotiations to normalisation with Kosovo. Kosovo's assertion of sovereignty in the north cost it three years of Brussels.</p>
      <h3>The levels</h3>
      <p>Luttwak stacks conflict in levels (set out under The work, below), and above them all sits <b>grand strategy</b>, where military force meets diplomacy, economics, alliances and persuasion, and where a state's whole external conduct can be read as one design. This atlas lives on the top level only. It does not model battles or armies; it models what states and state-like actors want, the means they use across the four domains (diplomatic, informational, military, economic), what constrains them, and how they see each other.</p>
      <h3>From the lamp to the data</h3>
      <p>Each actor with a full card carries: <b>objectives</b>, ranked; <b>means</b> by domain; <b>constraints</b>; <b>paradoxes</b>; and a short <b>reading</b>, the only free prose. Every claim has a source with its tier (official document, research, quality press, other) and a confidence grade: <b>A</b> an official document or two independent sources, <b>B</b> one good source, <b>C</b> press or our own inference, always shown.</p>
      <h3>Posture and bond</h3>
      <p>How one actor sees another is recorded on two axes. The <b>posture</b> is what the relationship is today, on a closed scale: own territory, claimed but not controlled, ally, reluctant ally, partner, reluctant partner, neutral, rival, adversary. "Adversary" is reserved for mortal enemies, where the other's existence or regime is the problem (Iran and Israel); nearly all bad relationships are rivalries. A posture is never our opinion: it needs a source that uses that reading, and it follows the structural position, not the rhetoric of a joint communiqué. The <b>bond</b> is the structure under the posture, what would survive a change of government: kin (shared identity), affinity, none, or grievance (an open historical wound). Two actors can both be "partner" and mean opposite things: for Serbia, Russia is a partner of kin growing colder; the United States a partner with a grievance growing warmer. On the map the posture is the colour and the bond a band inside the border. A partner that moves with the actor as a bloc without any defence clause (China and Russia, Russia and Iran, Japan and Taiwan) carries a third mark, <b>aligned without a treaty</b>: a dashed band inside the border, written only with a source naming the alignment, and counted as an allied leg in Seams, Clients and Gatherings.</p>
      <h3>What the atlas is not</h3>
      <p>It is not a forecast and not a verdict. It is a situation map: a dated, sourced, revisable statement of where everyone stands, built region by region, with the datasets (UN votes, memberships, recognitions) as the floor and researched cards as the reading. Where a card says less than you expected, it is because the sources did not hold.</p>

      <h3>The man</h3>
      <p>Edward Nicolae Luttwak was born on 4 November 1942 in Arad, in Romanian Transylvania, into a Jewish family that left for Italy after the war. He grew up in Palermo and Milan, was schooled in England, and took his first degree in economics at the London School of Economics in 1964; his doctorate came from Johns Hopkins in 1975, with the thesis that became <i>The Grand Strategy of the Roman Empire</i>. By then he had already written, at twenty-six, the book that made his name: <i>Coup d'État: A Practical Handbook</i> (1968), a cool manual of how governments are seized, followed by the <i>Dictionary of Modern War</i> (1971).</p>
      <p>From the 1970s he worked in Washington as a consultant to the Office of the Secretary of Defense, the National Security Council and the State Department, and for the armed forces of several allied countries, while holding the chair of strategy at the Center for Strategic and International Studies. He has never been a professor by trade: he is a practitioner who writes, with a taste for the unexpected argument and for the primary source in its own language. He reads several, including the Latin and Greek of his two imperial histories. He has also run a cattle ranch in Bolivia and written on economics (<i>The Endangered American Dream</i>, 1993; <i>Turbo-Capitalism</i>, 1999). He lives in Chevy Chase, Maryland, and still writes and advises, in English and Italian, on the wars of the day.</p>

      <h3>The work</h3>
      <p><b>Strategy: The Logic of War and Peace</b> (1987, revised 2001) is the centre. In ordinary life linear logic rules: the shorter road is better, the stronger tool works best, more of a good thing is better. In any contest between conscious adversaries that logic fails, because the other side thinks and reacts. The bad road may be the good road because it is unguarded; the weapon that works invites the countermeasure that makes it useless; surprise is bought only with costs that would be absurd against an inert obstacle. The same logic has a temporal form, the <b>culminating point</b>: every success contains the seed of its reversal, the advancing army lengthens its own supply lines, the victorious power frightens the neutrals into a coalition, the sanction that bites teaches the target to do without. Pushed past that point, victory turns into defeat without any mistake having been made.</p>
      <p>The book's second structure is vertical. Conflict runs on <b>levels</b> that interact but do not add up: technical, tactical, operational, theatre, and above them all grand strategy, where force meets diplomacy, economics, alliances, intelligence and persuasion. Success at one level can be undone at a higher one; strategy works when the levels are in harmony. Across all of them Luttwak distinguishes two styles: <b>attrition</b>, which wears the adversary down by superior resources and needs no understanding of him, and <b>relational manoeuvre</b>, which aims at his specific weaknesses and can win cheaply but fails badly when the reading is wrong. Great powers drift toward attrition; small states must manoeuvre. That is why, in this atlas, the cards of small states read as bets on usefulness and alignment, and the paradoxes of the great powers are about the coalitions their weight provokes.</p>
      <p><b>The Grand Strategy of the Roman Empire</b> (1976) reads four centuries of frontier policy as three successive systems: the hegemonic empire of the Julio-Claudians, ruling through client kings and a mobile army that rarely needed to fight; the preclusive frontier of the Antonines, with its fortified lines and legions spread along them; and the defence in depth of the late empire, which conceded ground and held strongpoints behind it. The same empire, with roughly the same forces, chose different ways of converting force into security as its enemies changed. <b>The Grand Strategy of the Byzantine Empire</b> (2009) describes how the eastern half survived a further thousand years with far less: by avoiding decisive battle, buying and dividing enemies, using intelligence, religion and ceremony as instruments, fighting to exhaust rather than annihilate, and treating every enemy as a possible future ally. <b>The Grand Strategy of the Soviet Union</b> (1983) applied the same reading to a living adversary.</p>
      <p>Two essays carried the logic beyond war. <b>"From Geopolitics to Geo-Economics"</b> (1990) argued that with the superpower rivalry fading, states would pursue adversarial aims through economic means, subsidies, trade rules, control of technology, with the grammar of commerce but the logic of conflict: that is the logic of the dependency layer in this atlas, where gas contracts, pipelines, loans, arms and remittances are read as instruments rather than markets. <b>"Toward Post-Heroic Warfare"</b> (1995) observed that advanced societies with small families will not accept casualties, so their wars become distant, aerial, delegated. <b>"Give War a Chance"</b> (1999) drew the harder conclusion that an outside intervention which freezes a war before either side is exhausted often prolongs the conflict it means to stop, which is why "frozen" disputes are so prominent on these maps.</p>
      <p><b>The Rise of China vs. the Logic of Strategy</b> (2012) applies the paradoxical logic to the present. A power that grows in economic and military strength at once triggers the reactions of everyone around it; its rise is self-limiting unless it deliberately slows one of the two. Luttwak coins <b>great-state autism</b> for the inward-looking condition of very large states, China, Russia and the United States alike, so absorbed by their own scale and domestic noise that they cannot perceive how their actions look to others, and are then surprised by the coalitions they produce. On the posture maps that is the pattern to look for: the actor whose "partners" are quietly hedging.</p>
      <p class="fine">Edward N. Luttwak: <i>Coup d'État: A Practical Handbook</i> (1968); <i>The Grand Strategy of the Roman Empire</i> (1976); <i>The Grand Strategy of the Soviet Union</i> (1983); <i>Strategy: The Logic of War and Peace</i> (1987, rev. 2001); "From Geopolitics to Geo-Economics", <i>The National Interest</i> (1990); "Toward Post-Heroic Warfare", <i>Foreign Affairs</i> (1995); "Give War a Chance", <i>Foreign Affairs</i> (1999); <i>The Grand Strategy of the Byzantine Empire</i> (2009); <i>The Rise of China vs. the Logic of Strategy</i> (2012).</p>`;
  }

  // ---------- seams: A hostile to X while both are allies of Y - Y is pulled two ways (computed by the build
  // from hand-written stances of confidence A or B only; provisional reciprocals never count)
  const SEAMS = data.seams || [];
  const seamsOf = id => SEAMS.filter(s => s.y === id);
  const seamsAround = id => SEAMS.filter(s => s.a === id || s.x === id);   // the seams this actor pulls on
  const SEAMS_ON_MAP = false;   // the dashed seam outline on the map: on once Davide approves the look
  const nameOf = id => esc(actors[id] ? (actors[id].short || actors[id].name) : id);
  const poss = name => /s$/.test(name) ? name + "'" : name + "'s";   // "Serbia's", "United States'"
  const BUFFERS = data.buffers || [], HEDGES = data.hedges || [];
  function renderSeamsPage() {
    const el = document.getElementById("page-seams");
    const byY = d3.group(SEAMS, s => s.y);
    const byYb = d3.group(BUFFERS, s => s.y);
    const orderB = [...byYb.entries()].sort((p, q) => q[1].length - p[1].length || actors[p[0]].name.localeCompare(actors[q[0]].name));
    const bufferList = orderB.map(([y, list]) => `<div class="seam-block"><h3><a href="#/view/${y}">${nameOf(y)}</a> <span>between ${list.length} pair${list.length > 1 ? "s" : ""}</span></h3>` +
        list.map(s => `<div class="seam"><a href="#/view/${s.a}">${nameOf(s.a)}</a> <i class="h">${s.ax}</i> <a href="#/view/${s.x}">${nameOf(s.x)}</a><span class="both">both <i class="al">${s.ay === s.xy ? s.ay.replace("_", " ") : s.ay.replace("_", " ") + " / " + s.xy.replace("_", " ")}</i></span></div>`).join("") + `</div>`);
    const bufferBlocks = bufferList.slice(0, 12).join("") + (bufferList.length > 12 ? `<details class="method"><summary>${bufferList.length - 12} more actors between rivals</summary><div class="seams">${bufferList.slice(12).join("")}</div></details>` : "");
    // hedging: one leg allied, the other partner; each row says which is which
    const leg = g => g.replace("_", " ");
    const byYh = d3.group(HEDGES, s => s.y);
    const orderH = [...byYh.entries()].sort((p, q) => q[1].length - p[1].length || actors[p[0]].name.localeCompare(actors[q[0]].name));
    const hingeList = orderH.map(([y, list]) => `<div class="seam-block"><h3><a href="#/view/${y}">${nameOf(y)}</a> <span>hedges between ${list.length} pair${list.length > 1 ? "s" : ""}</span></h3>` +
        list.map(s => `<div class="seam"><a href="#/view/${s.a}">${nameOf(s.a)}</a> <i class="h">${s.ax}</i> <a href="#/view/${s.x}">${nameOf(s.x)}</a><span class="both"><i class="al">${leg(s.ay)}</i> with ${nameOf(s.a)} · <i class="al">${leg(s.xy)}</i> with ${nameOf(s.x)}</span></div>`).join("") + `</div>`);
    const hingeBlocks = hingeList.slice(0, 12).join("") + (hingeList.length > 12 ? `<details class="method"><summary>${hingeList.length - 12} more hedgers</summary><div class="seams">${hingeList.slice(12).join("")}</div></details>` : "");
    const order = [...byY.entries()].sort((p, q) => q[1].length - p[1].length || actors[p[0]].name.localeCompare(actors[q[0]].name));
    el.innerHTML = `<h2>Seams</h2><p class="lede">A seam is an actor pulled two ways: it is an ally of two actors that are rivals or adversaries of each other. In Luttwak's grammar the seam between an opponent and its allies is where relational manoeuvre aims, and where an alliance is tested first.</p>
      <div class="seams">` + order.map(([y, list]) => `<div class="seam-block"><h3><a href="#/view/${y}">${nameOf(y)}</a> <span>pulled ${list.length} way${list.length > 1 ? "s" : ""}</span></h3>` +
        list.map(s => `<div class="seam"><a href="#/view/${s.a}">${nameOf(s.a)}</a> <i class="h">${s.ax}</i> <a href="#/view/${s.x}">${nameOf(s.x)}</a><span class="both">both <i class="al">${s.ay === s.xy ? s.ay.replace("_", " ") : s.ay.replace("_", " ") + " / " + s.xy.replace("_", " ")}</i> of ${nameOf(y)}</span></div>`).join("") + `</div>`).join("") + `</div>
      <h3 class="sec">Hedging · ally of one, partner of the other</h3>
      <p class="lede">The middle tier. A hedger is allied with one of two rivals and a partner of the other: it has chosen a side and keeps the door to the other open, insurance against both outcomes. Australia allied with the United States and partnered with China; a state bound to Washington by treaty that still buys Russian oil. Graver than a buffer, because the alliance can call; lighter than a seam, because only one side can. The word is the one foreign-policy readers use for Australia's position, and Luttwak describes that case in <i>The Rise of China vs. the Logic of Strategy</i> without naming it. Two cautions: the atlas sees the position, not the intention behind it; and in the literature hedging often means no full alignment at all, while here one side has been chosen.</p>
      <div class="seams">${hingeBlocks || `<p class="empty">None written yet.</p>`}</div>
      <h3 class="sec">Buffers · partner of two rivals</h3>
      <p class="lede">The lightest tier. A buffer is a partner of both of two actors that are rivals of each other, allied with neither: it belongs to neither and deals with both. Luttwak's Roman grand strategy kept such states between the empire and its enemies on purpose, cheap to hold and useful to both sides as long as they stayed between. The seam is the ally torn; the buffer is the partner that profits from the quarrel until it is forced to choose.</p>
      <div class="seams">${bufferBlocks || `<p class="empty">None written yet.</p>`}</div>
      <details class="method"><summary>How seams are found</summary><p>A seam needs three legs: A hostile to X (rival or adversary), A allied to Y, X allied to Y (ally or reluctant ally). Every leg must be a written reading of confidence A or B, from either side of the leg. A treaty membership alone never counts, or every state in both NATO and the EU would be pulled between Cyprus and Turkey; provisional reciprocals never count; a de facto alignment counts as an allied leg. A <b>hedger</b> needs the same hostile leg, one allied leg (ally, reluctant ally or de facto) and one partner leg (partner or reluctant partner, written A or B from either side); a <b>buffer</b> needs two partner legs and no allied one. A triple already counted as a seam is neither; organisations never hedge or buffer. ${SEAMS.length} seams, ${HEDGES.length} hedgers and ${BUFFERS.length} buffers so far, from ${fullActors.length} cards; the lists grow by themselves as cards are written on both sides of a rivalry.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  // ---------- clients: Luttwak's client system - A grades X higher than X grades A, so A leans on X
  // (computed by the build from hand-written stances of confidence A or B, both sides written)
  const CLIENTS = data.clients || [];
  const leanOf = (a, x) => { const c = CLIENTS.find(c => (c.client === a && c.patron === x) || (c.client === x && c.patron === a)); return c ? (c.client === a ? -c.lean : c.lean) : null; };
  const LOYAL = { kin: "loyal", affinity: "loyal", none: "bought", grievance: "bought", unknown: "" };
  function renderClientsPage() {
    const el = document.getElementById("page-clients");
    const byP = d3.group(CLIENTS, c => c.patron);
    const patrons = [...byP.entries()].sort((p, q) => q[1].length - p[1].length || d3.sum(q[1], c => c.lean) - d3.sum(p[1], c => c.lean));
    el.innerHTML = `<h2>Clients</h2><p class="lede">A client is an actor that leans on another more than it is leaned on: it grades the other higher than the other grades it. Luttwak's name for the arrangement is the client system of the early Roman empire, where the patron buys security cheaply because the client's loyalty exceeds the patron's commitment.</p>
      <h3 class="sec">Patrons</h3><div class="patrons">` + (patrons.length ? patrons.map(([p, list]) => `<div class="patron"><a href="#/view/${p}">${nameOf(p)}</a> <span>${list.length} client${list.length > 1 ? "s" : ""}</span><div class="who">${list.map(c => `<a href="#/view/${c.client}">${nameOf(c.client)}</a> <i>+${c.lean}</i>`).join(" · ")}</div></div>`).join("") : `<p class="empty">No pair with both sides written yet.</p>`) + `</div>
      <h3 class="sec">Who leans on whom</h3><table class="ledger-t"><thead><tr><th>Client</th><th>Lean</th><th>Patron</th><th>Client's reading</th><th>Patron's reading</th><th>Loyalty</th></tr></thead><tbody>` +
      CLIENTS.map(c => `<tr><td class="name"><a href="#/view/${c.client}">${nameOf(c.client)}</a></td><td class="lean">+${c.lean}</td><td class="name"><a href="#/view/${c.patron}">${nameOf(c.patron)}</a></td>
        <td><i style="color:${gradeBorder(c.cg)}">${c.cg.replace("_", " ")}</i> · ${esc(c.cb || "")}<div class="why">${esc(c.cnote)}</div></td>
        <td><i style="color:${gradeBorder(c.pg)}">${c.pg.replace("_", " ")}</i> · ${esc(c.pb || "")}<div class="why">${esc(c.pnote)}</div></td>
        <td class="kind">${LOYAL[c.cb] || ""}</td></tr>`).join("") + `</tbody></table>
      <h3 class="sec">Tepid alliances</h3><p class="lede">Two allies who differ only in warmth: one reads ally, the other reluctant ally. Not a client system, since both commit; the reluctant side is Luttwak's costly ally, the one that must be paid to stay.</p><table class="ledger-t"><thead><tr><th>Reads ally</th><th>Reads reluctant ally</th><th>The warm reading</th><th>The tepid reading</th></tr></thead><tbody>` +
      ((data.tepid || []).map(t => `<tr><td class="name"><a href="#/view/${t.warm}">${nameOf(t.warm)}</a></td><td class="name"><a href="#/view/${t.tepid}">${nameOf(t.tepid)}</a></td><td><i style="color:${gradeBorder(t.wg)}">${t.wg.replace("_", " ")}</i> · ${esc(t.wb || "")}<div class="why">${esc(t.wnote)}</div></td><td><i style="color:${gradeBorder(t.tg)}">${t.tg.replace("_", " ")}</i> · ${esc(t.tb || "")}<div class="why">${esc(t.tnote)}</div></td></tr>`).join("") || `<tr><td colspan="4" class="empty">None written yet.</td></tr>`) + `</tbody></table>
      <details class="method"><summary>How the lean is computed</summary>
      <p>Every posture is a step on one scale: <b>ally 4</b> · <b>reluctant ally 3</b> · <b>partner 2</b> · <b>reluctant partner 1</b> · <b>neutral 0</b> · <b>rival −1</b> · <b>adversary −2</b>. For a pair A and X the lean of A on X is <b>step(A's grade of X) − step(X's grade of A)</b>. If Serbia grades Hungary "ally" (4) and Hungary grades Serbia "partner" (2), Serbia leans on Hungary by 2: Serbia is the client, Hungary the patron. A lean of 1 is a tilt; 2 or more is a client in the full sense.</p>
      <p>Three conditions, all of them in the build: both readings must be hand-written at confidence A or B (provisional reciprocals and treaty-floor stances never count, so a pair appears only when both cards exist); at least one side must be an alliance (ally or reluctant ally), because a lean between two partners is a mood, not a client system; and the lean must be positive, so each pair appears once, from the client's side. Two further guards: two allies who differ only in warmth, one reading ally and the other reluctant ally, are not a client system but a <b>tepid alliance</b>, listed apart below; and a patron must carry at least half the weight of its client, weight being measured for now by how many cards read each actor, so that a great power never appears as the client of a small one. The last column reads the client's bond: <b>loyal</b> if kin or affinity, <b>bought</b> if none or grievance, since a bought client holds only while the patron pays.</p>
      <p>${CLIENTS.length} pair${CLIENTS.length === 1 ? "" : "s"} so far, from ${fullActors.length} cards. The list grows by itself as cards are written on both sides of an alliance.</p></details>
`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  // ---------- faults: the bond (deep level) contradicts the posture (surface). feud = kin + hostile,
  // byzantine = grievance + allied, strained = kin + reluctant (a warning, shown in the ledger only)
  const FAULTS = data.faults || [];
  const faultOf = (a, x) => { const f = FAULTS.find(f => f.a === a && f.x === x); return f ? f.kind : null; };
  const TEND = { feud: { warming: "healing", cooling: "deepening", stable: "stable" }, byzantine: { warming: "healing", cooling: "tearing", stable: "stable" } };
  function renderFaultsPage() {
    const el = document.getElementById("page-faults");
    const shown = FAULTS.filter(f => f.kind !== "strained");
    // one entry per actor: the distinct pairs it is part of, with whom and of what kind
    const byActor = {};
    shown.forEach(f => {
      const key = [f.a, f.x].sort().join("|");
      [f.a, f.x].forEach(id => { const m = byActor[id] = byActor[id] || {}; m[key] = m[key] || { other: id === f.a ? f.x : f.a, kind: f.kind, mutual: f.mutual }; });
    });
    const carriers = Object.entries(byActor).map(([id, m]) => [id, Object.values(m)]).sort((p, q) => q[1].length - p[1].length || actors[p[0]].name.localeCompare(actors[q[0]].name));
    const row = f => `<tr class="${f.mutual ? "mutual" : ""}"><td class="name"><a href="#/view/${f.a}">${nameOf(f.a)}</a></td><td><i style="color:${gradeBorder(f.grade)}">${f.grade.replace("_", " ")}</i></td><td class="name"><a href="#/view/${f.x}">${nameOf(f.x)}</a></td><td class="tr">${f.mutual ? "mutual" : "one-sided"}</td><td class="tend ${TEND[f.kind][f.trend] || ""}">${TREND_SIGN[f.trend] || ""} ${TEND[f.kind][f.trend] || f.trend}</td><td><div class="why">${esc(f.note)}</div></td></tr>`;
    const table = (kind, head) => `<h3 class="sec">${head}</h3><table class="ledger-t"><thead><tr><th>Actor</th><th>Posture</th><th>Toward</th><th>Direction</th><th>Tendency</th><th>Reading</th></tr></thead><tbody>${shown.filter(f => f.kind === kind).map(row).join("") || `<tr><td colspan="6" class="empty">None written yet.</td></tr>`}</tbody></table>`;
    el.innerHTML = `<h2>Faults</h2><p class="lede">A fault is a relationship whose deep level contradicts its surface: the bond says one thing, the posture another. Luttwak's rule is that strategy works only when its levels are in harmony; a relationship resting on a fault is the one that breaks first. Two kinds matter. A <b>feud</b> is kin graded rival, adversary or claimed territory, the quarrel inside the family, the most intense because closeness multiplies the points of contact. A <b>Byzantine alliance</b> is an open wound graded ally: the Byzantine maxim that every enemy is a possible ally, and the alliance that holds over the wound because it must.</p>
      ${table("feud", "Feuds · kin, hostile")}
      ${table("byzantine", "Byzantine alliances · grievance, allied")}
      <details class="method"><summary>How faults are found</summary><p>Each stance carries a posture (today) and a bond (what would survive a change of government). A <b>feud</b> is bond kin with posture rival, adversary or claimed territory; a <b>Byzantine alliance</b> is bond grievance with posture ally or reluctant ally. A fault written by both sides of a pair is <b>mutual</b>; written by one side only, it says who feels it. The tendency reads the trend against the kind: a warming feud is <b>healing</b>, a cooling one <b>deepening</b>; a cooling Byzantine alliance is <b>tearing</b>. Only hand-written stances of confidence A or B count. Kin graded reluctant ally or reluctant partner is not a fault but a warning, <b>strained</b>, shown only in the ledger under the map. ${shown.length} faults so far, from ${fullActors.length} cards.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  // ---------- gatherings: the counter-coalition an actor's weight summons (Luttwak on China), and how far it has formed
  const GATHERINGS = data.gatherings || [];
  const CONV = data.convergences || {};
  const STATE_LINE = { formed: "the counter-coalition has arrived", forming: "the coalition is taking shape", waiting: "summoned by the logic of strategy, not yet signed" };
  const bar = g => { const n = Math.round(g.maturity * 10); return `<span class="bar">${"▮".repeat(n)}${"▯".repeat(10 - n)}</span> <span class="pf">${Math.round(g.maturity * 100)}% formed</span> <span class="pairs">· ${g.allied_pairs} of the ${g.pairs} pairs inside the gathering are already allies</span>`; };
  const WEIGHT = data.weight || {}, SIEGE = data.siege || [];
  const pct = w => !w ? "0%" : w >= 0.095 ? Math.round(w * 100) + "%" : (w * 100).toFixed(1) + "%";
  function renderGatheringsPage() {
    const el = document.getElementById("page-gatherings");
    const card = g => {
      const enl = g.members.filter(m => m.enlisted), wait = g.members.filter(m => !m.enlisted);
      const who = list => list.map(m => `<a href="#/view/${m.id}">${nameOf(m.id)}</a>${m.neighbour ? "<i class='nb' title='shares a border with the target'>·neighbour</i>" : ""}<i class="${m.grade}">${m.grade === "adversary" ? " adv" : ""}</i>`).join(" · ");
      const unseen = g.unseen || [];
      return `<div class="gathering ${g.state}"><h3>The gathering against <a href="#/view/${g.x}">${nameOf(g.x)}</a> <span>${g.n} actors · <span class="w">${pct(g.weight)}</span> of the world against ${pct(g.x_weight)}</span></h3>
        <div class="mat">${bar(g)}<br><em>${g.state}: ${STATE_LINE[g.state]}</em></div>
        ${enl.length ? `<div class="roll"><b>enlisted</b> <span class="lst">${who(enl)}</span></div>` : ""}
        ${wait.length ? `<div class="roll"><b>waiting</b> <span class="lst">${who(wait)}</span></div>` : ""}
        <div class="roll"><b>neighbours</b> <span class="rt">${g.neighbours.length} of ${poss(nameOf(g.x))} ${g.n_neighbours} neighbours are in the gathering</span>${g.neighbours.length ? `<span class="lst">: ${g.neighbours.map(id => `<a href="#/view/${id}">${nameOf(id)}</a>`).join(", ")}</span>` : ""}</div>
        <div class="roll unseen"><b>unseen</b> ${unseen.length ? `<span class="lst">${unseen.map(u => `<a href="#/view/${u.id}">${nameOf(u.id)}</a><i class="g">${u.grade ? u.grade.replace("_", " ") : "unread"}</i>`).join(" · ")}</span>` + ` <span class="tr">· ${nameOf(g.x)} does not read ${unseen.length === 1 ? "this one" : "these"} as hostile</span>` : `<span class="rt">none: ${nameOf(g.x)} reads every one of them as hostile</span>`}</div></div>`;
    };
    const inView = g => g.state !== "waiting" || g.n >= 8;
    const main = GATHERINGS.filter(inView), crowds = GATHERINGS.filter(g => !inView(g));
    // the 24 most encircled, plus every great power (1% of the world or more) with a hostile neighbour: China at 3 of 18 is low in share and high in meaning (Davide, 2026-10-16)
    const siegeTop = SIEGE.filter(r => r.hostile.length).slice(0, 24), siegeBig = SIEGE.filter(r => r.hostile.length && r.w >= 0.01);
    const siegeRows = [...new Set([...siegeTop, ...siegeBig])].sort((p, q) => q.share - p.share || q.hostile_weight - p.hostile_weight || p.a.localeCompare(q.a));
    const sRow = r => `<tr><td class="name"><a href="#/view/${r.a}">${nameOf(r.a)}</a></td><td class="n">${r.hostile.length} of ${r.n}</td><td><span class="bar" style="color:var(--c-rival)">${"▮".repeat(Math.round(r.share * 10))}</span><span class="tr">${"▯".repeat(10 - Math.round(r.share * 10))}</span></td><td>${r.hostile.map(id => `<a href="#/view/${id}">${nameOf(id)}</a>`).join(", ")}</td><td>${r.friendly.length ? r.friendly.map(id => `<a href="#/view/${id}">${nameOf(id)}</a>`).join(", ") : "<span class='tr'>none</span>"}</td><td class="n">${r.unread.length}</td></tr>`;
    el.innerHTML = `<h2>Gatherings</h2><p class="lede">A gathering is the coalition that an actor's weight summons. Luttwak's argument in <i>The Rise of China vs. the Logic of Strategy</i> is that a power which grows or presses provokes, by the logic of strategy alone, the convergence of everyone it threatens, whether or not they speak to each other, and that the great state is the last to see it. The page asks, for every state with at least five declared rivals, who has gathered against it, how much of the world that is, and how far the gathering has become a coalition. <b>Formed</b> measures that: take every pair of actors inside the gathering and count how many are already allies of each other; 100% is a coalition in being, 0% a crowd of actors that share an enemy and nothing else. <b>Unseen</b> are the members the target itself does not read as hostile: the part of the gathering it has not noticed.</p>
      <div class="gatherings">${main.map(card).join("")}</div>
      <details class="method"><summary>Smaller crowds · summoned by the logic, not yet signed (${crowds.length})</summary><div class="gatherings">${crowds.map(card).join("")}</div></details>
      <h3 class="sec">Encirclement · the neighbours</h3>
      <p class="how">The neighbours are the first the logic summons. For every card with borders, the share of its neighbours that read it hostile or that it reads hostile; friendly are the neighbours allied or partnered on either side, or bound by treaty; unread the ones with nothing written either way. Borders from Wikidata, land and sea. In view: the 24 most encircled and every actor weighing 1% of the world or more with a hostile neighbour.</p>
      <table class="ledger-t"><thead><tr><th>Actor</th><th>Hostile</th><th>Share</th><th>Hostile neighbours</th><th>Friendly neighbours</th><th>Unread</th></tr></thead><tbody>${siegeRows.map(sRow).join("")}</tbody></table>
      <details class="method"><summary>How gatherings are counted</summary><p>The gathering against X is every state or armed actor that grades X rival or adversary in a hand-written stance of confidence A or B; X must be a state (a gathering is summoned by weight; the crowd around an armed group is a hunt, not a counter-coalition) and the crowd at least five. Organisations are left out, since they would double their members. Maturity is the share of pairs within the gathering that are already allied, by a written reading on either side, a de facto alignment, or a defence treaty in the datasets (NATO, EU, CSTO): unlike seams, the question here is whether the coalition exists, not who feels it. A member is <b>enlisted</b> if it is allied with at least half of the others, <b>waiting</b> otherwise. Formed is 60% or more, forming 25% or more, waiting below. <b>Weight</b> is an actor's share of the world, half GDP and half military spending (World Bank, latest year); the gathering's weight is the sum of its members'. "adv" marks a member that grades X adversary rather than rival; "neighbour" one that shares a border with X. In view: the formed and forming gatherings and any crowd of eight or more; the smaller crowds are folded. ${GATHERINGS.length} gatherings so far, from ${fullActors.length} cards; ${SIEGE.length} actors with borders read.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  // ---------- currents: the trends as the first derivative of the postures (Luttwak's culminating point)
  const CURRENTS = data.currents || [];
  const ALARMS = data.alarms || { allies_cooling: [], rivals_warming: [] };
  const CHANGES = data.changes || { since: null, grades: [], trends: [] };
  const PULSE_ON_MAP = true;
  function renderCurrentsPage() {
    const el = document.getElementById("page-currents");
    const alarmRows = list => list.length ? list.map(r => `<tr><td class="name"><a href="#/view/${r.a}">${nameOf(r.a)}</a></td><td><i style="color:${gradeBorder(r.grade)}">${r.grade.replace("_", " ")}</i> · ${esc(r.bond || "")}</td><td class="name"><a href="#/view/${r.x}">${nameOf(r.x)}</a></td><td><div class="why">${esc(r.note)}</div></td></tr>`).join("") : `<tr><td colspan="4" class="empty">None written yet.</td></tr>`;
    const driftBar = c => { const w = Math.round(c.w_warming / c.w_all * 10), k = Math.round(c.w_cooling / c.w_all * 10); return `<span class="dbar"><span class="cool">${"▮".repeat(k)}</span><span class="mid">|</span><span class="warm">${"▮".repeat(w)}</span></span>`; };
    const byTurb = [...CURRENTS].filter(c => c.n >= 6).sort((p, q) => q.turbulence - p.turbulence || p.id.localeCompare(q.id)).slice(0, 12);
    const drift = CURRENTS.filter(c => c.n >= 6);
    el.innerHTML = `<h2>Currents</h2><p class="lede">Where the world is moving. Every posture carries a trend, warming, stable or cooling, and the trends are the first derivative of the map: not where the relationships stand but where they are going. Luttwak's frame is the <b>culminating point</b>: every success carries the seed of its own reversal, and the moment a relationship turns is the moment that matters. An ally that cools is the culminating point of an alliance, the protection that has begun to cost; a rival that warms is a rivalry past its useful peak, turning into détente.</p>
      <h3 class="sec">Drift · where each actor is going</h3>
      <p class="how">Each movement is weighted by what it moves with: an ally or an adversary counts 8, a reluctant ally or a rival 4, a partner 2, a reluctant partner or a neutral 1: each step doubles, so a movement with an ally weighs eight times one with a neutral. Drift is the weighted warming minus the weighted cooling, divided by the weight of everything the actor has read: +1 would be an actor whose every relationship warms, −1 one whose every relationship cools. A state that warms with three partners moves less than one that cools with a single ally.</p>
      <div class="drift">${drift.map(c => `<div class="drow"><a href="#/view/${c.id}">${nameOf(c.id)}</a>${driftBar(c)}<span class="num">${c.drift > 0 ? "+" : ""}${c.drift.toFixed(2)} <span class="k">${c.warming} warming · ${c.cooling} cooling · ${c.n} read · weight ${c.w_warming}/${c.w_cooling} of ${c.w_all}</span></span></div>`).join("")}</div>
      <h3 class="sec">Turbulence · who is moving most</h3>
      <p class="how">The weighted share of an actor's world that is moving, whichever way.</p>
      <div class="carriers">${byTurb.map(c => `<a href="#/view/${c.id}">${nameOf(c.id)}</a> <i>${Math.round(c.turbulence * 100)}%</i>`).join(" · ")}</div>
      ${CHANGES.since ? `<h3 class="sec">Since ${esc(CHANGES.since)}</h3>${CHANGES.grades.length || CHANGES.trends.length ? `<div class="changes">${CHANGES.grades.map(c => `<div><a href="#/view/${c.a}">${nameOf(c.a)}</a> → <a href="#/view/${c.x}">${nameOf(c.x)}</a>: <i style="color:${gradeBorder(c.from)}">${c.from.replace("_", " ")}</i> became <i style="color:${gradeBorder(c.to)}">${c.to.replace("_", " ")}</i></div>`).join("")}${CHANGES.trends.map(c => `<div><a href="#/view/${c.a}">${nameOf(c.a)}</a> → <a href="#/view/${c.x}">${nameOf(c.x)}</a>: ${c.from} became ${c.to}</div>`).join("")}</div>` : `<p class="empty">No grade or trend changed since the last build.</p>`}` : ""}
      <h3 class="sec">Culminating points · allies cooling</h3><table class="ledger-t"><thead><tr><th>Actor</th><th>Reads</th><th>Toward</th><th>Why</th></tr></thead><tbody>${alarmRows(ALARMS.allies_cooling)}</tbody></table>
      <h3 class="sec">Détentes · rivals warming</h3><table class="ledger-t"><thead><tr><th>Actor</th><th>Reads</th><th>Toward</th><th>Why</th></tr></thead><tbody>${alarmRows(ALARMS.rivals_warming)}</tbody></table>
      <details class="method"><summary>How currents are computed</summary><p>Only hand-written stances of confidence A or B count. Each stance is weighted by its grade on a doubling scale: ally and adversary 8, reluctant ally and rival 4, partner 2, reluctant partner and neutral 1. <b>Drift</b> = (weight of warming stances − weight of cooling stances) / weight of all stances; <b>turbulence</b> = (weight of warming + weight of cooling) / weight of all. The bars show the two weighted shares, cooling to the left, warming to the right; the small figures give the raw counts and the weights. Actors with fewer than six written stances are left out of the rankings. The two lists at the bottom are read straight from the stances: allies and reluctant allies with a cooling trend, rivals and adversaries with a warming trend. Each build keeps a snapshot of every grade and trend in data/snapshots; the "since" section compares today's build with the previous one. On the map, in the posture lens, a warming relationship pulses and a cooling one flickers.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  // ---------- theatres: hand-kept spaces where several actors' forces add up, with a heat computed by the build
  const THEATRES = data.theatres || [];
  function renderTheatresPage() {
    const el = document.getElementById("page-theatres");
    const PART = { hostility: "hostility", seams: "seams", faults: "feuds", claims: "claims", movement: "movement", friction: "friction" };
    el.innerHTML = `<h2>Theatres</h2><p class="lede">The level below grand strategy in Luttwak's ladder: the theatre, where geography and several actors' forces add up, and where the readings on these pages become acute. There are ${THEATRES.length} theatres, kept by hand; an actor may sit in more than one. The heat of a theatre is computed from what the atlas has read between its members: declared hostility, seams, feuds, claimed territory and movements with stakes.</p>
      <div class="tmap-wrap"><svg id="tmap"></svg><div class="tmap-note">scroll to zoom · drag to pan · click a zone to outline its members, click again to return</div></div>
      <p class="how">Heat is the sum of the weights between the members of a theatre, divided by the number of possible pairs, so a small dense theatre is not outweighed by a large one; 100 is the hottest theatre today, the others are scaled to it. Theatres whose members have few cards yet read cold for lack of data, not for peace: the card count says how far each one is written.</p>
      <div class="theatres">` + THEATRES.map(t => `<div class="theatre" data-id="${t.id}"><h3>${esc(t.name)} <span>${t.index}</span></h3>
        <div class="hbar"><span style="width:${t.index}%"></span></div>
        ${t.news ? `<div class="tnews">this week in the news: ×${t.news.ratio.toFixed(1)} its members' normal · ${t.news.events.toLocaleString("en-GB")} events${t.news.conflict_share !== null ? ` · ${Math.round(t.news.conflict_share * 100)}% conflict` : ""}</div>` : ""}
        <div class="parts">${Object.entries(t.parts).filter(([, v]) => v).map(([k, v]) => `<i>${PART[k]} ${v}</i>`).join(" · ") || "<i>nothing read yet</i>"} <em>· ${t.cards} of ${t.members.length} members with a card</em></div>
        <table class="top">${t.top.map(r => `<tr><td><a href="#/view/${r.a}">${nameOf(r.a)}</a></td><td><b style="color:${gradeBorder(r.grade)}">${r.grade.replace("_", " ")}</b></td><td><a href="#/view/${r.x}">${nameOf(r.x)}</a></td><td><u>${r.trend && r.trend !== "stable" ? TREND_SIGN[r.trend] + " " + r.trend : ""}</u></td><td class="w">${r.weight}</td></tr>`).join("")}</table>
      </div>`).join("") + `</div>
      <details class="method"><summary>How heat is computed</summary><p>On the map each theatre is a zone, a circle of hand-set radius around the theatre's centre, lit in proportion to its heat; the countries inside are not coloured, because the heat belongs to the ground where the forces meet, not to the actors who send them. Click a zone to outline its members; click it again to return to the world. For every pair of members of a theatre the build adds: adversary 16, rival 6, claimed territory 6, a reluctant ally or reluctant partner 1, an ally cooling or a rival warming 3; for every feud inside the theatre 6; for every seam whose three actors are inside it 4. Adversaries weigh very high, rivals high, reluctant postures low. Only hand-written stances of confidence A or B count. The sum is divided by the number of possible pairs among the members, and the result is scaled so that the hottest theatre reads 100. The list of theatres and their members is kept by hand in data/theatres.yaml; organisations are never members. The line "this week in the news" is the Watch page's heat summed over the members: their events of the last seven days against their own four-week normal, and the share of them that is conflict; attention, not a reading.</p></details>`;
    drawTheatreMap();
    el.querySelectorAll(".theatre").forEach(d => d.onclick = ev => { if (ev.target.closest("a")) return; const on = d.classList.toggle("is-on"); el.querySelectorAll(".theatre").forEach(o => { if (o !== d) o.classList.remove("is-on"); }); drawTheatreMap(on ? d.dataset.id : null); });
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }
  function drawTheatreMap(only) {
    const svg = d3.select("#tmap");
    svg.selectAll("*").remove();
    // a fixed drawing frame, so the map does not depend on the layout at the moment it is drawn
    const width = 1100, height = 520;
    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
    const proj = d3.geoNaturalEarth1().fitExtent([[6, 6], [width - 6, height - 6]], world);
    const path = d3.geoPath(proj);
    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "tglow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    glow.append("feGaussianBlur").attr("stdDeviation", 2).attr("result", "b");
    const mg = glow.append("feMerge"); mg.append("feMergeNode").attr("in", "b"); mg.append("feMergeNode").attr("in", "SourceGraphic");
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", css("--paper"));
    const g = svg.append("g");
    let k = 1;
    const sized = () => {
      g.selectAll("path").attr("stroke-width", function () { return (+this.dataset.sw || .5) / k; });
      g.selectAll("text.tl").attr("font-size", 12 / k).attr("stroke-width", 4 / k);
    };
    svg.call(d3.zoom().scaleExtent([1, 8]).on("zoom", ev => { k = ev.transform.k; g.attr("transform", ev.transform); sized(); }));
    g.append("path").attr("d", path(d3.geoGraticule10())).attr("fill", "none").attr("stroke", css("--grat")).attr("stroke-width", .5).attr("stroke-dasharray", "2 3").attr("data-sw", .5);
    g.selectAll("path.c").data(world.features).join("path").attr("class", "c").attr("d", path).attr("fill", css("--land")).attr("stroke", css("--coast")).attr("stroke-opacity", .55).attr("stroke-width", .5).attr("data-sw", .5);
    // colour and light scaled hard to the heat: a cold theatre barely glows, the hottest burns
    const heatColor = d3.scaleLinear().domain([0, 35, 70, 100]).range(["#5a5a2a", css("--c-seam"), css("--c-reluctant_ally"), css("--c-adversary")]);
    const light = i => .06 + .62 * Math.pow(i / 100, .8);
    const chosen = only ? THEATRES.find(t => t.id === only) : null;
    const list = (chosen ? [chosen] : [...THEATRES]).sort((p, q) => p.index - q.index);   // hottest drawn last, on top
    const inTheatres = id => THEATRES.filter(t => t.members.includes(id)).sort((p, q) => q.index - p.index);
    // the zone of the clash glows, not the actors in it (Davide, 2026-10-16): a circle of hand-set
    // radius around the theatre's centre, lit by its heat; members are only outlined once a theatre is chosen
    const defs2 = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
    list.forEach(t => {
      const col = heatColor(t.index);
      const grad = defs2.append("radialGradient").attr("id", "hz-" + t.id);
      grad.append("stop").attr("offset", "0%").attr("stop-color", col).attr("stop-opacity", .22 + .7 * Math.pow(t.index / 100, .8));
      grad.append("stop").attr("offset", "55%").attr("stop-color", col).attr("stop-opacity", .1 + .42 * Math.pow(t.index / 100, .8));
      grad.append("stop").attr("offset", "100%").attr("stop-color", col).attr("stop-opacity", 0);
      const zone = d3.geoCircle().center(t.centre || [0, 0]).radius(t.radius || 6)();
      g.append("path").attr("class", "z").attr("d", path(zone)).attr("fill", `url(#hz-${t.id})`).attr("stroke", "none").attr("data-sw", 0)
        .style("cursor", "pointer")
        .on("click", () => {
          document.querySelectorAll(".theatre").forEach(o => o.classList.remove("is-on"));
          if (chosen) { drawTheatreMap(null); return; }   // clicking the lit theatre returns to the world
          const d = document.querySelector(`.theatre[data-id="${t.id}"]`);
          if (d) d.classList.add("is-on");
          drawTheatreMap(t.id);
        })
        .append("title").text(`${T(t.name)} · ${t.index}`);
    });
    if (chosen) {
      const col = heatColor(chosen.index);
      g.selectAll(null).data(world.features.filter(f => chosen.members.includes(f.id))).join("path").attr("class", "m").attr("d", path)
        .attr("fill", "none").attr("stroke", col).attr("stroke-width", .9).attr("data-sw", .9).attr("stroke-opacity", .8).attr("pointer-events", "none");
    }
    // the name appears only for the theatre you clicked
    if (chosen) {
      const feats = world.features.filter(f => chosen.members.includes(f.id));
      const cs = feats.map(f => path.centroid(f)).filter(c => isFinite(c[0]));
      const [cx, cy] = chosen.centre ? proj(chosen.centre) : [d3.mean(cs, c => c[0]), d3.mean(cs, c => c[1])];
      g.append("text").attr("class", "tl").attr("x", cx).attr("y", cy).attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("font-family", css("--font-ui")).attr("font-size", 12).attr("letter-spacing", ".12em").attr("fill", heatColor(chosen.index)).attr("paint-order", "stroke").attr("stroke", css("--paper")).attr("stroke-width", 4)
        .text(`${T(chosen.name).toUpperCase()} ${chosen.index}`);
    }
  }


  // ---------- flanks: the enemies of my enemies (computed by the build from hand-written stances)
  const FLANKS = data.flanks || [], FLANK_INDEX = data.flank_index || [];
  function renderFlanksPage() {
    const el = document.getElementById("page-flanks");
    const g = kind => FLANKS.filter(f => f.kind === kind);
    const score = f => f.aw * f.zw;
    // a flank is symmetric (A's flank Z against X is Z's flank A): shown once, from the heavier side
    const uniq = list => { const seen = new Set(); return list.filter(f => { const k = [f.a, f.z].sort().join("|") + "|" + f.x; if (seen.has(k)) return false; seen.add(k); return true; }); };
    const open = uniq(g("open").sort((p, q) => score(q) - score(p) || q.aw - p.aw || p.a.localeCompare(q.a))), rec = g("recruited"), fals = uniq(g("false").sort((p, q) => score(q) - score(p) || q.aw - p.aw || p.a.localeCompare(q.a)));
    const rdg = r => r.open === 0 && r.enemies > 0 && r.lonely === r.enemies ? "alone: its enemies have no enemies" : r.open === 0 ? "the move is spent: every flank already recruited" : r.open >= 10 ? "many cheap options" : r.open >= 4 ? "options to work" : "few flanks";
    const between = f => f.az || f.za ? `${f.az ? nameOf(f.a) + " reads " + f.az.replace("_", " ") : ""}${f.az && f.za ? "; " : ""}${f.za ? nameOf(f.z) + " reads " + f.za.replace("_", " ") : ""}` : "<span class='tr'>nothing written either way</span>";
    const row = f => `<tr><td class="name"><a href="#/view/${f.a}">${nameOf(f.a)}</a></td><td class="name"><a href="#/view/${f.x}">${nameOf(f.x)}</a> <i style="color:${gradeBorder(f.ax)}">${f.ax}</i></td><td class="name"><a href="#/view/${f.z}">${nameOf(f.z)}</a> <i style="color:${gradeBorder(f.zx)}">${f.zx}</i></td><td>${between(f)}</td><td><div class="why">${esc(f.znote)}</div></td></tr>`;
    const table = (list, head, cols) => `${head ? `<h3 class="sec">${head}</h3>` : ""}<table class="ledger-t"><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${list.map(row).join("") || `<tr><td colspan="5" class="empty">None written yet.</td></tr>`}</tbody></table>`;
    const idxRow = r => `<tr><td class="name"><a href="#/view/${r.a}">${nameOf(r.a)}</a></td><td class="n">${r.enemies}</td><td class="n"><b>${r.open}</b></td><td class="n">${r.recruited}</td><td class="n">${r.false}</td><td class="n">${r.lonely}</td><td class="kind">${rdg(r)}</td></tr>`;
    const idxTable = list => `<table class="ledger-t"><thead><tr><th>Actor</th><th>Enemies</th><th>Open</th><th>Recruited</th><th>False</th><th>Enemies without enemies</th><th>Reading</th></tr></thead><tbody>${list.map(idxRow).join("")}</tbody></table>`;
    const cols = ["Actor", "Against", "Open flank", "Between them", "The flank's own reading of the enemy"];
    el.innerHTML = `<h2>Flanks</h2><p class="lede">The enemies of my enemies. Luttwak's reading of Byzantium, in <i>The Grand Strategy of the Byzantine Empire</i>, is that the empire outlived Rome by a thousand years because it rarely fought the enemy in front of it: it found the enemy behind him, the Khazars behind the Avars, the Pechenegs behind the Rus, and paid him. For every actor and every enemy it reads, the build finds who else reads that enemy as hostile and whether the flank is already recruited, still open, or false, the enemy of my enemy being my enemy too. This page shows the heaviest open ones: the Byzantine move not yet made, where both the actor and the flank carry weight.</p>
      ${table(open.slice(0, 30), "The thirty heaviest open flanks", cols)}
      <p class="how">Weight is an actor's share of the world, half GDP and half military spending (World Bank, latest year); the ranking multiplies the two weights, so a flank counts when both the actor and the flank matter. ${open.length} open flanks in all, ${FLANKS.length} flanks for ${FLANK_INDEX.length} actors.</p>
      <h3 class="sec">Who has flanks</h3>${idxTable(FLANK_INDEX.slice(0, 20))}
      ${FLANK_INDEX.length > 20 ? `<details class="method"><summary>The other ${FLANK_INDEX.length - 20} actors</summary>${idxTable(FLANK_INDEX.slice(20))}</details>` : ""}
      <details class="method"><summary>False flanks · the enemy of my enemy is my enemy too (${fals.length}, the thirty heaviest shown)</summary>${table(fals.slice(0, 30), "", ["Actor", "Against", "False flank", "Between them", "The flank's own reading of the enemy"])}</details>
      <details class="method"><summary>Recruited flanks · the move already made (${rec.length})</summary>${table(rec, "", ["Actor", "Against", "Recruited flank", "Between them", "The flank's own reading of the enemy"])}</details>
      <details class="method"><summary>How flanks are found</summary><p>For every actor A and every X that A grades rival or adversary, the build takes every Z that also grades X rival or adversary (hand-written stances of confidence A or B; organisations never count, only those who move). Z is <b>recruited</b> if A or Z already reads the other as ally, reluctant ally or partner, or if a treaty or a de facto alignment binds them; <b>false</b> if either reads the other as rival or adversary; <b>open</b> otherwise, which is the flank nobody has worked. An enemy with no enemies at all leaves A alone in front of it. The index counts open flanks: many open flanks are cheap options, none means the move is spent or the actor is alone.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  // ---------- levers: geo-economics, the dependencies between rivals (Luttwak 1990)
  const LEVERS = data.levers || [], LEVER_INDEX = data.lever_index || [];
  const fmtVal = v => typeof v === "number" ? v.toLocaleString("en-GB", { maximumFractionDigits: 2 }) : esc(v);
  function renderLeversPage() {
    const el = document.getElementById("page-levers");
    const KIND_ORDER = ["energy", "trade", "debt", "investment", "bases", "arms", "remittances"];
    const firstSentence = t => { const x = String(t || "").trim(); const k = x.indexOf(". "); if (k > 40 && k < 200) return x.slice(0, k + 1); if (x.length <= 200) return x; const cut = x.slice(0, 170); return cut.slice(0, cut.lastIndexOf(" ")) + " ..."; };
    // one block per pair of rivals: the pair, the two readings, then one line per lever (a row seen from both cards shows once)
    const pairs = new Map();
    LEVERS.forEach(f => { const k = [f.a, f.x].sort().join("|"); if (!pairs.has(k)) pairs.set(k, { k, w: (WEIGHT[f.a] || 0.0005) * (WEIGHT[f.x] || 0.0005), rows: [], ids: k.split("|") }); pairs.get(k).rows.push(f); });
    const blocks = [...pairs.values()].sort((p, q) => q.w - p.w || p.k.localeCompare(q.k)).map(pr => {
      const [p, q] = pr.ids;
      const r1 = pr.rows.find(f => f.a === p && f.ax) || pr.rows.find(f => f.x === p && f.xa);
      const gp = r1 ? (r1.a === p ? r1.ax : r1.xa) : null;
      const r2 = pr.rows.find(f => f.a === q && f.ax) || pr.rows.find(f => f.x === q && f.xa);
      const gq = r2 ? (r2.a === q ? r2.ax : r2.xa) : null;
      const rd = (id, g) => g ? `${nameOf(id)} reads <i style="color:${gradeBorder(g)}">${g.replace("_", " ")}</i>` : `${nameOf(id)} <span class="tr">has not written</span>`;
      const seen = new Set();
      const lines = pr.rows.sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.a.localeCompare(b.a)).filter(f => { const key = f.kind + "|" + String(f.value); if (seen.has(key)) return false; seen.add(key); return true; })
        .map(f => `<div class="lever"><b>${f.kind}</b><span class="from">${poss(nameOf(f.a))} card</span> ${esc(firstSentence(f.summary))} <span class="badge ${f.confidence}">${f.confidence}</span></div>`).join("");
      return `<div class="seam-block lever-block"><h3><a href="#/view/${p}">${nameOf(p)}</a> <span class="x">·</span> <a href="#/view/${q}">${nameOf(q)}</a> <span>${rd(p, gp)}; ${rd(q, gq)}</span></h3>${lines}</div>`;
    });
    el.innerHTML = `<h2>Levers</h2><p class="lede">The logic of conflict in the grammar of commerce. In 1990 Luttwak wrote that with the great wars over, states would carry their rivalries into the economy, with capital for firepower, market penetration for garrisons and research for armament: <i>geo-economics</i>. The atlas keeps ${STATS && STATS.relations ? Number(STATS.relations.dependency_with_number).toLocaleString("en-GB") : "many"} dependency rows with a number in them: energy, trade, debt, investment, bases, arms and remittances. This page is the first cut of the lever: for every pair of actors of which at least one reads the other as rival or adversary, what still binds them materially. The gas a bloc buys from the power it sanctions, the market a rival cannot do without, the ground an enemy holds. Heaviest pairs first (the two weights multiplied, so a pair counts when both sides matter); one line per lever, from the card that wrote it, cut to its first sentence: the full row is in the dossier.</p>
      <div class="levers">${blocks.join("") || "<p class='empty'>None written yet.</p>"}</div>
      <details class="method"><summary>How levers are found</summary><p>Every relation row of the dependency layer that carries a value, written from either card, between two actors of which at least one grades the other rival or adversary in a hand-written stance of confidence A or B. The row is written from the card's side and describes the link, so it does not by itself say which side depends: the line says. A lever written from both cards with the same measure shows once. Organisations count here, since the dependency is material (the Union buys gas) and not a vote. ${pairs.size} pairs, ${LEVERS.length} rows, out of ${(STATS && STATS.relations && STATS.relations.dependency_with_number) || "–"} dependency rows with a number. Next cuts, if this one holds: who holds the handle as a field of its own, and the levers between partners that could turn.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  // ---------- data: what the atlas is, counted
  const STATS = data.stats || null;
  function renderDataPage() {
    const el = document.getElementById("page-data");
    if (!STATS) { el.innerHTML = "<h2>Data</h2><p class='empty'>No statistics in this build.</p>"; return; }
    const S = STATS, n = x => Number(x || 0).toLocaleString("en-GB");
    const tile = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
    const dist = (obj, labels, order) => { const tot = Object.values(obj).reduce((p, q) => p + q, 0) || 1; const keys = order || Object.keys(obj).sort((a, b) => obj[b] - obj[a]); return `<table class="ledger-t dist"><tbody>${keys.filter(k => obj[k]).map(k => `<tr><td class="kind">${esc((labels && labels[k]) || k.replace(/_/g, " "))}</td><td class="n">${n(obj[k])}</td><td><span class="bar">${"▮".repeat(Math.max(1, Math.round(obj[k] / tot * 30)))}</span> <span class="tr">${Math.round(obj[k] / tot * 100)}%</span></td></tr>`).join("")}</tbody></table>`; };
    const site = S.site || {}, tok = site.tokens || {};
    const TIER = { "1": "1 · official document", "2": "2 · research", "3": "3 · quality press", "4": "4 · other" };
    const types = Object.entries(S.relations.types || {});
    const ds = (S.datasets || []).map(d => `<tr><td class="name">${esc(d.name)}</td><td>${esc(d.publisher)}</td><td class="n">${n(d.rows)}</td><td class="n">${esc(d.date || "–")}</td><td class="n">${d.tier}</td><td><span class="tr">${esc(d.tool)}</span></td></tr>`).join("");
    const D = S.derived || {};
    const snaps = S.snapshots || [];
    el.innerHTML = `<h2>Data</h2>
      <p class="lede">What the atlas is, counted. Compiled ${esc(data.generated)} from ${n(S.actors.full)} cards and ${n(S.sources.unique)} distinct sources${tok.total_millions ? `, with about <b>${tok.total_millions} million tokens</b> of model work since ${esc(site.started ? new Date(site.started + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "")}` : ""}. Last change to the repository: <span id="lastcommit">reading…</span>.</p>
      <div class="stats">${tile(n(S.actors.total), "actors")}${tile(n(S.actors.full), "full cards")}${tile(n(S.stances.hand), "readings written")}${tile(n(S.relations.total), "relation rows")}${tile(n(S.sources.unique), "sources")}${tile(tok.total_millions ? tok.total_millions + "M" : "–", "tokens")}</div>
      <h3 class="sec">How it is built</h3>
      <p class="how">One file per actor in three folders, the card, its postures, its relations, all in plain YAML, plus the datasets. The build (<code>tools/build.py</code>) validates every file, ids against the actor list, grades and types against closed vocabularies, dates, a source with a tier on every claim, and refuses to write on any error. It then derives the treaty allies from the memberships, mirrors every unanswered reading as a provisional one at confidence C, computes the pages (seams, buffers, clients, faults, gatherings, encirclement, flanks, levers, currents, theatres), keeps a snapshot of every grade so the next build can say what moved, and writes the JSON the site renders: one main file${(S.payload || {}).main_bytes ? ` (${(S.payload.main_bytes / 1e6).toFixed(1)} MB, ${(S.payload.main_gzip / 1e6).toFixed(2)} MB compressed)` : ""} for the map and the computed pages, and one small bundle per actor, fetched only when you open its dossier or its point of view, with the card texts, the notes and the sources. No fact lives in the site code. Data, method, decision log and code are public: <a href="https://github.com/AndreottiVIII/grand-strategy" target="_blank" rel="noopener">AndreottiVIII/grand-strategy</a>.</p>
      <h3 class="sec">Actors · ${n(S.actors.total)}</h3>
      <div class="cols2"><div>${dist(S.actors.by_type, { state: "states", org: "organisations", "armed-non-state": "armed non-state actors", "sub-state": "sub-state entities", "state-instrument": "instruments of a state" })}</div><div>${dist({ full: S.actors.full, stub: S.actors.stub }, { full: "full card", stub: "stub (node only)" }, ["full", "stub"])}</div></div>
      <h3 class="sec">Postures · ${n(S.stances.total)} stances</h3>
      <p class="how">${n(S.stances.hand)} written by hand from the actor's side; ${n(S.stances.mirrored)} mirrored from the other card at confidence C, marked "mirrored" wherever they show; ${n(S.stances.dataset)} derived from defence treaties in the datasets; ${n(S.stances.de_facto)} alignments without a treaty. The distributions below count the hand-written ones only.</p>
      <div class="cols2"><div>${dist(S.stances.grades, null, ["own_territory", "claimed_territory", "ally", "reluctant_ally", "partner", "reluctant_partner", "neutral", "rival", "adversary"])}</div><div>${dist(S.stances.confidence, { A: "A · official or two independent sources", B: "B · one good source", C: "C · press or our reading" }, ["A", "B", "C"])}${dist(S.stances.trends, null, ["warming", "stable", "cooling"])}${dist(S.stances.bonds, null, ["kin", "affinity", "none", "grievance"])}</div></div>
      <h3 class="sec">Relations · ${n(S.relations.total)} rows</h3>
      <p class="how">${n(S.relations.hand)} written in the cards, ${n(S.relations.dataset)} from the datasets (memberships, recognitions, every recorded General Assembly vote since 2022); ${n(S.relations.dependency_with_number)} dependency rows carry a number.</p>
      <div class="cols2"><div>${dist(S.relations.by_layer, null, ["objective", "alignment", "dependency", "action"])}</div><div><table class="ledger-t dist"><tbody>${types.slice(0, 12).map(([k, v]) => `<tr><td class="kind">${esc(k)}</td><td class="n">${n(v)}</td></tr>`).join("")}</tbody></table>${types.length > 12 ? `<details class="method"><summary>All ${types.length} types</summary><table class="ledger-t dist"><tbody>${types.slice(12).map(([k, v]) => `<tr><td class="kind">${esc(k)}</td><td class="n">${n(v)}</td></tr>`).join("")}</tbody></table></details>` : ""}</div></div>
      <h3 class="sec">Sources · ${n(S.sources.unique)} distinct</h3>
      <div class="cols2"><div>${dist(S.sources.by_tier, TIER, ["1", "2", "3", "4"])}</div><div><p class="how">A source is counted once however many claims cite it; the tier is the one given where it was first cited. Tier 3 dominates because most of what moves is reported before it is documented; tier 1 is official texts, treaties, court orders, budgets, communiqués.</p></div></div>
      <h3 class="sec">Datasets · the floor</h3>
      <table class="ledger-t"><thead><tr><th>Dataset</th><th>Publisher</th><th>Rows</th><th>Taken on</th><th>Tier</th><th>Tool</th></tr></thead><tbody>${ds}</tbody></table>
      <h3 class="sec">Derived · what the build computes</h3>
      <div class="stats">${tile(n(D.seams), "seams")}${tile(n(D.hedges), "hedging pairs")}${tile(n(D.buffers), "buffer pairs")}${tile(n(D.clients), "client pairs")}${tile(n(D.faults), "faults")}${tile(n(D.gatherings), "gatherings")}${tile(n(D.siege), "encirclements")}${tile(n(D.flanks_open), "open flanks")}${tile(n(D.levers), "levers")}${tile(n(D.theatres), "theatres")}${tile(n(D.derived_allies), "treaty allies derived")}</div>
      <h3 class="sec">Last build and what moved</h3>
      <p class="how">Compiled ${esc(data.generated)}. Snapshots of every grade kept since ${esc(snaps[0] || "–")} (${snaps.length}); since the previous one${CHANGES.since ? ` (${esc(CHANGES.since)})` : ""}: ${n(CHANGES.grades.length)} grade${CHANGES.grades.length === 1 ? "" : "s"} and ${n(CHANGES.trends.length)} trend${CHANGES.trends.length === 1 ? "" : "s"} changed${CHANGES.grades.length || CHANGES.trends.length ? `, listed on the <a href="#/currents">Currents</a> page` : ""}. The atlas is updated on the editor's call, never on a calendar (so far, once a week): the datasets first (free), then the news heat and the watch dates, then a pass over Wikipedia's current-events pages that proposes rows, sorted by hand, then a fresh reading of the cards an event touched.</p>
      <h3 class="sec">Cost</h3>
      <p class="how">${tok.total_millions ? `About ${tok.total_millions} million tokens as of ${esc(tok.as_of || "")}: ${esc(tok.note || "")}.` : "Not recorded."} Recorded per card in the decision log.</p>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
    fetch("https://api.github.com/repos/AndreottiVIII/grand-strategy/commits/main").then(r => r.json()).then(c => {
      const lc = document.getElementById("lastcommit");
      if (lc && c && c.commit) lc.innerHTML = esc(new Date(c.commit.committer.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
      else if (lc) lc.textContent = "see the repository";
    }).catch(() => { const lc = document.getElementById("lastcommit"); if (lc) lc.textContent = "see the repository"; });
  }

  function renderAboutPage() {
    const el = document.getElementById("page-about");
    if (el.dataset.done) return;
    el.dataset.done = "1";
    el.innerHTML = `
      <h2>About</h2>
      <p class="lede">Grand Strategy is a situation map of the world: for every state and state-like actor, what it wants, with what means, against which constraints, and how it sees everyone else. The reading grid is Edward N. Luttwak's idea of grand strategy, and the site is built in his honour.</p>
      <h3>What a card holds</h3>
      <p>Each actor with a full card carries its <b>objectives</b> ranked, its <b>means</b> by domain (diplomatic, informational, military, economic), its <b>constraints</b>, its <b>paradoxes</b> (the places where its own moves turn against it) and a short <b>reading</b>. Every claim has a source with a tier (official document, research, quality press, other) and a confidence grade: <b>A</b> an official document or two independent sources, <b>B</b> one good source, <b>C</b> press or our own inference, always shown.</p>
      <h3>Posture and bond</h3>
      <p>How one actor sees another is recorded on two axes. The <b>posture</b> is the relationship today, on a closed scale: own territory, claimed but not controlled, ally, reluctant ally, partner, reluctant partner, neutral, rival, adversary. "Adversary" is kept for mortal enemies, where the other's existence or regime is the problem; nearly all bad relationships are rivalries. The grade follows the structural position, never the rhetoric of a communiqué: two members of the same alliance with open friction are reluctant allies, not rivals. The <b>bond</b> is what lies under the posture and would survive a change of government: kin, affinity, none, or grievance. On the map the posture is the colour of the outline and of the light inside a country; the bond is a band inside the border; a dashed band marks a partner aligned with the actor as a bloc, without a treaty.</p>
      <h3>Relations</h3>
      <p>Under the postures sit the relation rows, in four layers: <b>objectives</b> (what an actor wants from another), <b>alignments</b> (treaties, memberships, recognitions), <b>dependencies</b> (energy, trade, debt, arms, remittances, with numbers) and <b>actions</b> (dated events: votes, sanctions, visits, exercises). The datasets are the floor: memberships from Wikidata and official lists, recognition tables from Wikipedia with their citations, every recorded vote of the UN General Assembly since 2022 from the UN Digital Library. The cards are the reading on top of that floor. A lighter floor still is the <b>Watch</b>: the events GDELT codes from the world's news in the last seven days are counted per country and set against the country's own four-week average, Luttwak's Byzantine rule of monitoring the other continuously; attention, not truth, kept apart from the cards, and a pointer for where the next update should look.</p>
      <h3>Seams</h3>
      <p>A <b>seam</b> is an actor pulled two ways: an ally of two actors that are rivals or adversaries of each other. Greece between Israel and Turkey, the United States between Saudi Arabia and the Emirates, Hungary between Croatia and Serbia. The word is Luttwak's. In <i>Strategy</i> he describes <b>relational manoeuvre</b> as the style that aims not at the enemy's strength but at his specific weaknesses, his doctrine, his habits and the <i>seams</i> between him and his allies, where a small force can obtain a large effect. The Byzantine book shows the same idea at the scale of an empire that survived a thousand years by dividing its enemies rather than destroying them. The Seams page lists every such triangle the atlas can see. They are computed from hand-written postures of confidence A or B only. Under the seams sit two lighter tiers. The <b>hedger</b> is allied with one of two rivals and a partner of the other: it has chosen a side and keeps the door open, insurance against both outcomes. The <b>buffer</b> is the partner of both and the ally of neither, the state that belongs to neither and deals with both, which Rome kept on purpose between itself and its enemies; the buffer profits from the quarrel until it is forced to choose.</p>
      <h3>Clients</h3>
      <p>A <b>client</b> is an actor that leans on another more than it is leaned on: it grades the other higher than the other grades it. Luttwak's name for the arrangement is the <b>client system</b> of the early Roman empire, described in <i>The Grand Strategy of the Roman Empire</i>: the hegemonic empire of the Julio-Claudians ruled through client kings whose loyalty exceeded Rome's commitment to them, which is why it was cheap. The Clients page measures the <b>lean</b> of every pair the atlas has read from both sides, in steps on the posture scale; the higher-grading side is the client, the other the patron. A client bound by kin or affinity is loyal; one bound by nothing, or by a grievance, is bought, and holds as long as the patron pays. The tepid ally, graded "ally" by its patron and answering "reluctant ally", is the costly kind, the one Rome subsidised. In the ledger under the map the lean column shows, for each counterpart, who leans on whom.</p>
      <h3>Faults</h3>
      <p>A <b>fault</b> is a relationship whose deep level contradicts its surface. The frame is Luttwak's structure of <b>levels</b>: in <i>Strategy</i> success at one level can be undone at a higher one, and a strategy works only when its levels are in harmony. Here the levels are two: the bond, which would survive a change of government, and the posture of today. Two contradictions matter. The <b>feud</b> is kin graded rival, adversary or claimed territory, the quarrel inside the family, which Luttwak counts as the most intense of rivalries because closeness multiplies the points of contact. The <b>Byzantine alliance</b> is a grievance graded ally: the maxim from <i>The Grand Strategy of the Byzantine Empire</i> that every enemy is a possible ally, and the alliance that holds over an open wound because it must. The Faults page lists both, says whether each is felt by one side or both, and reads its trend as healing or tearing; on the map a fault shows as a bond band that contradicts the colour of its outline.</p>
      <h3>Gatherings</h3>
      <p>A <b>gathering</b> is the coalition that an actor's weight summons. The frame is <i>The Rise of China vs. the Logic of Strategy</i>: a power that grows or presses provokes, by the logic of strategy alone, the convergence of everyone it threatens, whether or not they speak to each other, and the great state, absorbed in its own scale, is the last to see it. Byzantium made a method of the same law from the other side, recruiting the enemies of its enemies. The Gatherings page lists, for every actor with at least five declared rivals, who has gathered against it, and measures how far the gathering has become a coalition: formed when most of its members are already allied with each other, waiting when they are not, which is the coalition the logic is still summoning. Each gathering is weighed, as a share of the world's economy and armed spending, against the weight of its target; and for each the page says which members the target itself does not read as hostile, the part of the gathering it has not seen. Under the gatherings sits the <b>encirclement</b>: for every actor, the share of its neighbours that stand against it, since the neighbours are the first the logic summons. In each actor's dossier the <b>convergences</b> are the other side of the same reading: the actors that share one of its rivals and are not yet its allies, the tables it has not sat at.</p>
      <h3>Currents</h3>
      <p>Every posture carries a <b>trend</b>, warming, stable or cooling, and the trends are the first derivative of the map: not where the relationships stand but where they are going. The frame is Luttwak's <b>culminating point</b>, the moment at which a success begins to produce its own reversal. The Currents page reads the trends two ways. The alarms: allies that are cooling, which is the culminating point of an alliance, the protection that has begun to cost, and rivals that are warming, the rivalry past its useful peak. And two measures per actor: <b>drift</b>, which way its world is going, and <b>turbulence</b>, how much of it is moving. Each build keeps a snapshot of every grade, so the page can also say what changed since the last one. On the map, in the posture lens, a warming relationship pulses and a cooling one flickers, like phosphor brightening or dying.</p>
      <h3>Theatres</h3>
      <p>Below grand strategy in Luttwak's ladder of levels sits the <b>theatre</b>, where geography and several actors' forces add up and where strategy is actually conducted. The atlas keeps a hand list of ${THEATRES.length} theatres, from the Western Balkans to the Southern Cone, and computes for each a <b>heat</b> from what it has read between the members: declared hostility, seams, feuds, claimed territory and movements with stakes, divided by the number of possible pairs so that a small dense theatre is not outweighed by a large one. The Theatres page has its own map, lit by heat, and the list of what makes each theatre hot. A theatre whose members have few cards reads cold for lack of data, not for peace.</p>
      <h3>Flanks</h3>
      <p>The <b>enemies of my enemies</b>. Luttwak reads Byzantium's survival as the refusal to fight the enemy in front when the enemy behind him could be found and paid: the Khazars against the Avars, the Pechenegs against the Rus. The Flanks page runs that search for every actor: for each enemy it reads, who else reads that enemy as hostile, and whether that flank is already <b>recruited</b> (a written friendship, a treaty or a de facto alignment), <b>false</b> (the enemy of my enemy is my enemy too) or still <b>open</b>, the move nobody has made. The page shows the heaviest open flanks, where both the actor and the flank carry weight; an actor whose enemies have no enemies stands alone.</p>
      <h3>Levers</h3>
      <p>In 1990 Luttwak gave a name to the form rivalry would take once the great wars were over: <b>geo-economics</b>, the logic of conflict in the grammar of commerce, capital in place of firepower, market penetration in place of garrisons. The atlas keeps the material dependencies between actors with their numbers: energy, trade, debt, investment, bases, arms, remittances. The Levers page lists every such dependency between two actors of which one reads the other as rival or adversary, the handle one side holds over the other, or that both hold. It is a first cut; the direction of each lever is in the row's summary, not yet in a field of its own.</p>
      <h3>How it is made</h3>
      <p>The data lives in plain files, one per actor, separate from the site, and is versioned in the open: the whole history of every grade is in the repository. Cards are researched and drafted by language-model agents working from a shared brief and the atlas's own rules, then reread by a stronger model that checks objectives, paradoxes and every posture grade against the sources and against the neighbouring cards; the editor samples the result. A new card's grades retroact on the cards already written as provisional reciprocals, flagged as such until written from the other side. Nothing is embedded in the site: it renders the data as it stands on the day of the last build, and the stamp in the top bar says which day that was. The <a href="#/data">Data</a> page counts all of it: actors, readings, rows, sources by tier, the datasets and when they were taken, what the build derives, and what it has cost.</p>
      <h3>What it is not</h3>
      <p>It is not a forecast and not a verdict. Where a card says less than you expected, it is because the sources did not hold. Where a posture surprises you, open the dossier: the note under each grade says why it was read that way, and the footnote says who said so.</p>

      <p>Who made it, how it is built and how it runs: <a href="#/this-site">This site</a>.</p>`;
  }

  function renderSitePage() {
    const el = document.getElementById("page-site");
    if (el.dataset.done) return;
    el.dataset.done = "1";
    el.innerHTML = `
      <h2>This site</h2>
      <p class="lede">Who made it, how it is built, and how it runs. The terms are explained under <a href="#/about">About</a>; the counts are on <a href="#/data">Data</a>.</p>
      <h3 id="colophon">Who</h3>
      <p><b>Grand Strategy</b> is conceived, directed and edited by <b>Davide Caniatti</b>, from Italy. He chose the question, the reading grid, the vocabulary of grades and bonds, the pages and their rules, and reads what goes online; every decision is dated in the journal of the repository. Research, drafting and code are produced with Claude (Anthropic) under his direction: each card is written by a language-model agent from a shared brief and the atlas's own rules, reread by a stronger model against the sources and the neighbouring cards, and sampled by him. Started on 12 October 2026. Contact: <a href="mailto:davide.caniatti@gmail.com">davide.caniatti@gmail.com</a>; code and data at <a href="https://github.com/AndreottiVIII/grand-strategy" target="_blank" rel="noopener">github.com/AndreottiVIII/grand-strategy</a>.</p>
      <h3>How it is built</h3>
      <p>The truth is a folder of plain text. Every actor has three YAML files: the <b>card</b> (objectives, means, constraints, paradoxes, reading, each with sources and a confidence grade), its <b>stances</b> (how it reads every other actor: grade, trend, bond, since, last verified, note, sources) and its <b>relations</b> (rows in four layers: objectives, alignments, dependencies, actions). Vocabularies are closed: nine grades, four bonds, three trends, a fixed list of relation types. A stub is an actor with the first file only, a node without a card. Beside the cards sit the <b>datasets</b>, taken by small scripts from one source each and never edited by hand: states and memberships from Wikidata and the organisations' lists, recognition tables from Wikipedia, every recorded vote of the UN General Assembly from the UN Digital Library, GDP, military spending and population from the World Bank, borders from Wikidata.</p>
      <p>One Python script, the <b>build</b>, turns that folder into the site. It validates every file and refuses to write on any error: an unknown id, a grade outside the vocabulary, a date that does not parse, a claim without a source. It then derives what no card states: treaty allies from the memberships, a provisional mirror for every reading not yet answered from the other side, and the computed pages, seams, buffers, clients, faults, gatherings, encirclement, flanks, levers, currents, theatres, each by a rule written in the ontology. It keeps a snapshot of every grade, so the next build can say what moved. It writes one JSON for the site and one bundle per actor, so any other front end could read a state on its own.</p>
      <h3>How it runs</h3>
      <p>There is no server. The site is static files on GitHub Pages: one HTML page, one stylesheet, one script, the compiled JSON, one small bundle per actor, the world outline (Natural Earth 110m, with Kosovo added) and a map from country ids to flag codes. The browser loads the main JSON once and computes the map and the intelligence pages from it; an actor's bundle, with its card texts, notes and sources, is fetched only when you open its dossier or its point of view. Routing is in the URL hash, so every view has an address and the back button works. The outside dependencies are D3 for the maps (from cdnjs), three typefaces from Google Fonts, the flag images from flagcdn, the portrait of Luttwak from Wikimedia Commons, and, on the Data page, one request to the GitHub API for the date of the last commit; each of those hosts sees the visitor's address, as any host does. No analytics, no cookies, no account. The only thing kept in the browser is the language you choose, and nothing you do on the site is sent to anyone.</p>
      <h3>How it changes</h3>
      <p>Everything is versioned in git, in the open: the whole history of every grade is in the repository, and a change to the ontology is made only with a journal entry. The atlas is updated on the editor's call, never on a calendar; so far he has called it once a week. When he calls, the datasets are refreshed first (they cost nothing), then the news heat from GDELT and the dates the cards said to watch, then a pass over Wikipedia's daily current-events pages, each event with its news citation, that proposes candidate rows, which he sorts by hand. A card that a major event touches, an election, a change of government, a war, a treaty, is then reread against the outcome: a dated row added, a trend or a grade moved when a source says so, never a rewrite. Between calls, single news items go in as one dated row each.</p>
      <h3>Type and look</h3>
      <p>VT323, Share Tech Mono and IBM Plex Mono via Google Fonts. The display is modelled on the vector screens of the NORAD command centre as shown in <i>WarGames</i> (1983); the home map after Alighiero Boetti's <i>Mappa</i>. Portrait of Edward N. Luttwak by Elekes Andor, 2026, CC BY 4.0, Wikimedia Commons. Maps drawn with D3.</p>
      <h3>Credits</h3>
      <p>Borders from Natural Earth; flags by flagcdn.com; memberships and borders from Wikidata; recognition tables from Wikipedia and their citations; votes from the UN Digital Library; weights from the World Bank. Each card cites its own sources in the dossier footnotes. The reading grid is Edward N. Luttwak's, and the site is built in his honour.</p>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }


  // ---------- the egg: type "luttwak" on any page (Davide, 2026-10-16)
  const EGG_LINES = [
    ["The entire realm of strategy is pervaded by a paradoxical logic very different from the ordinary linear logic by which we live in all other spheres of life.", "Strategy: The Logic of War and Peace, 1987"],
    ["Avoid war by every possible means, in all possible circumstances, but always act as if it might start at any time.", "The Grand Strategy of the Byzantine Empire, 2009, the first of the seven rules"],
    ["Gather intelligence on the enemy and his mentality, and monitor his movements continuously.", "The Grand Strategy of the Byzantine Empire, 2009, the second rule"],
    ["Campaign vigorously, both offensively and defensively, but attack mostly with small units; emphasize patrolling, raiding and skirmishing rather than all-out attacks.", "The Grand Strategy of the Byzantine Empire, 2009, the third rule"],
    ["Replace the battle of attrition by the non-battle of manoeuvre.", "The Grand Strategy of the Byzantine Empire, 2009, the fourth rule"],
    ["Strive to end wars successfully by recruiting allies to change the overall balance of power.", "The Grand Strategy of the Byzantine Empire, 2009, the fifth rule"],
    ["Subversion is the cheapest path to victory, so cheap in fact as compared with the costs and risks of battle that it must always be attempted.", "The Grand Strategy of the Byzantine Empire, 2009, the sixth rule"],
    ["When diplomacy and subversion are not enough and there must be fighting, it should be done with relational operational methods and tactics that circumvent the enemy's most pronounced strengths and exploit his weaknesses.", "The Grand Strategy of the Byzantine Empire, 2009, the seventh rule"],
    ["Although war is a great evil, it does have a great virtue: it can resolve political conflicts and lead to peace.", "Give War a Chance, Foreign Affairs, 1999"],
    ["The logic of conflict in the grammar of commerce.", "From Geopolitics to Geo-Economics, The National Interest, 1990"],
  ];
  let eggBuf = "", eggTimer = null;
  const eggEl = document.createElement("div");
  eggEl.id = "egg";
  eggEl.innerHTML = `<div class="line"></div><div class="src"></div><img class="who" src="https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Edward_Luttwak_in_2026.jpg/500px-Edward_Luttwak_in_2026.jpg" alt=""><div class="hint">click or esc to return</div>`;
  document.body.appendChild(eggEl);
  const eggClose = () => { eggEl.classList.remove("is-on", "is-read"); clearTimeout(eggTimer); };
  eggEl.onclick = eggClose;
  const eggShow = () => {
    const [text, src] = EGG_LINES[Math.floor(Math.random() * EGG_LINES.length)];
    const line = eggEl.querySelector(".line"), srcEl = eggEl.querySelector(".src");
    line.textContent = ""; srcEl.textContent = "Edward N. Luttwak · " + src;
    eggEl.classList.add("is-on"); eggEl.classList.remove("is-read");
    let i = 0;
    const tick = () => { line.textContent = text.slice(0, ++i); if (i < text.length) eggTimer = setTimeout(tick, text[i - 1] === " " ? 70 : 34); else eggTimer = setTimeout(() => eggEl.classList.add("is-read"), 500); };
    eggTimer = setTimeout(tick, 400);
  };
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && eggEl.classList.contains("is-on")) return eggClose();
    if (ev.target && /^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName)) return;
    if (ev.key.length !== 1) return;
    eggBuf = (eggBuf + ev.key.toLowerCase()).slice(-7);
    if (eggBuf === "luttwak" && !eggEl.classList.contains("is-on")) eggShow();
  });
  // ---------- watch: the week's news heat as a page (Davide, 2026-10-22: a Luttwakian entry in the menu, the method inside)
  const CW = data.changes_week || { since: null, grades: [], trends: [] }, RM = data.recent_moves || [];
  function renderWatchPage() {
    const el = document.getElementById("page-watch");
    if (!NEWS) { el.innerHTML = `<h2>Watch</h2><p class="empty">No news heat in this build.</p>`; return; }   // the moves below need the heat too, for now
    const rows = Object.entries(NEWS.actors);
    const bar = (v, max) => "▮".repeat(Math.max(1, Math.min(10, Math.round(v / max * 10))));
    const surging = rows.filter(([, r]) => r.hot_rank).sort((p, q) => p[1].hot_rank - q[1].hot_rank).slice(0, 15);
    const burning = rows.filter(([, r]) => r.burn_rank && r.conflict_ratio >= 1).sort((p, q) => p[1].burn_rank - q[1].burn_rank).slice(0, 15);
    const loud = rows.filter(([, r]) => r.loud_rank).sort((p, q) => p[1].loud_rank - q[1].loud_rank).slice(0, 10);
    const n = x => Number(x || 0).toLocaleString("en-GB");
    const sRow = ([id, r]) => `<tr><td class="name"><a href="#/view/${id}">${nameOf(id)}</a></td><td><span class="bar" style="color:var(--c-rival)">${bar(r.ratio, surging[0][1].ratio)}</span></td><td class="n"><b>×${r.ratio.toFixed(1)}</b></td><td class="n">${n(r.events)} <span class="tr">vs ${n(Math.round(r.baseline))}</span></td><td class="n">${Math.round((r.conflict_share || 0) * 100)}%</td></tr>`;
    const bRow = ([id, r]) => `<tr><td class="name"><a href="#/view/${id}">${nameOf(id)}</a></td><td><span class="bar" style="color:var(--c-rival)">${bar(r.conflict_ratio, burning[0][1].conflict_ratio)}</span></td><td class="n"><b>×${r.conflict_ratio.toFixed(1)}</b></td><td class="n">${n(r.conflict)} <span class="tr">of ${n(r.events)}</span></td><td class="n">${Math.round((r.conflict_share || 0) * 100)}%</td></tr>`;
    const lRow = ([id, r]) => `<tr><td class="name"><a href="#/view/${id}">${nameOf(id)}</a></td><td class="n">${n(r.articles)}</td><td class="n">${n(r.events)}</td><td class="n">×${r.ratio.toFixed(1)}</td></tr>`;
    el.innerHTML = `<h2>Watch</h2>
      <p class="lede">Luttwak's second rule for Byzantium, in <i>The Grand Strategy of the Byzantine Empire</i>: gather intelligence on the other and his mentality, and monitor his movements continuously. Constantinople kept an office for it, the Bureau of Barbarians, which read every envoy and every rumour from beyond the border. This page is the atlas's monitor: the events that GDELT codes from the world's news in the last seven days are counted per country and set against the country's own four-week average. A country is <b>surging</b> when it makes a multiple of its normal, whatever its size; it is <b>burning</b> when the conflict in its news runs above its normal. The loud, who make the most news every week, are listed apart so they do not hide the rest.</p>
      <p class="how">Week ${fmtDay(NEWS.week.from)} to ${fmtDay(NEWS.week.to)}, taken on ${esc(NEWS.fetched)}. <a href="#/heat">See it on the map</a>.</p>
      <div class="cols2">
      <div><h3 class="sec">Surging · news against its own normal</h3>
      <table class="ledger-t"><thead><tr><th>Actor</th><th></th><th>Ratio</th><th>Events vs normal</th><th>Conflict</th></tr></thead><tbody>${surging.map(sRow).join("")}</tbody></table></div>
      <div><h3 class="sec">Burning · conflict against its normal</h3>
      <table class="ledger-t"><thead><tr><th>Actor</th><th></th><th>Ratio</th><th>Conflict events</th><th>Share</th></tr></thead><tbody>${burning.map(bRow).join("")}</tbody></table></div>
      </div>
      <h3 class="sec">Loud · the most news in absolute terms</h3>
      <table class="ledger-t"><thead><tr><th>Actor</th><th>Articles</th><th>Events</th><th>Against its normal</th></tr></thead><tbody>${loud.map(lRow).join("")}</tbody></table>
      <h3 class="sec">Postures moved · since ${CW.since ? esc(CW.since) : "the first snapshot"}</h3>
      <p class="how">The atlas's own movement, not the news: every grade and every trend the cards changed since the snapshot of ${CW.since ? esc(CW.since) : "the start"}${CW.new ? ` (${CW.new} readings were written new in the same span and are not moves)` : ""}, and the readings written or verified in the last fourteen days that are warming or cooling, the heaviest pairs first.</p>
      ${CW.grades.length ? `<table class="ledger-t"><thead><tr><th>Actor</th><th>Toward</th><th>From</th><th>To</th></tr></thead><tbody>${CW.grades.map(c => `<tr><td class="name"><a href="#/view/${c.a}">${nameOf(c.a)}</a></td><td class="name"><a href="#/view/${c.x}">${nameOf(c.x)}</a></td><td><i style="color:${c.from ? gradeBorder(c.from) : "var(--ink-3)"}">${c.from ? c.from.replace("_", " ") : "new"}</i></td><td><i style="color:${gradeBorder(c.to)}">${c.to.replace("_", " ")}</i></td></tr>`).join("")}</tbody></table>` : `<p class="empty">No grade changed.</p>`}
      ${CW.trends.length ? `<h3 class="sec">Trends moved</h3><table class="ledger-t"><thead><tr><th>Actor</th><th>Toward</th><th>From</th><th>To</th></tr></thead><tbody>${CW.trends.map(c => `<tr><td class="name"><a href="#/view/${c.a}">${nameOf(c.a)}</a></td><td class="name"><a href="#/view/${c.x}">${nameOf(c.x)}</a></td><td>${esc(c.from)}</td><td><b>${esc(c.to)}</b></td></tr>`).join("")}</tbody></table>` : ""}
      <h3 class="sec">Warming or cooling, read in the last fourteen days${RM.length ? ` <span class="tr">· ${RM.length}, the forty heaviest shown</span>` : ""}</h3>
      ${RM.length ? `<table class="ledger-t"><thead><tr><th>Actor</th><th>Toward</th><th>Grade</th><th>Trend</th><th>Read on</th><th>Why</th></tr></thead><tbody>${RM.slice(0, 40).map(r => `<tr><td class="name"><a href="#/view/${r.a}">${nameOf(r.a)}</a></td><td class="name"><a href="#/view/${r.x}">${nameOf(r.x)}</a></td><td><i style="color:${gradeBorder(r.grade)}">${r.grade.replace("_", " ")}</i></td><td class="${r.trend}">${r.trend === "warming" ? "↗" : "↘"} ${esc(r.trend)}</td><td class="n">${esc(r.last_verified)}</td><td><div class="why">${esc(r.note || "")}</div></td></tr>`).join("")}</tbody></table>` : `<p class="empty">None in the last fourteen days.</p>`}
      <details class="method" open><summary>How the watch works</summary>
      <p>The source is the <b>GDELT Project</b>, which has coded the world's news into events since 1979: for every event the two actors with their country codes, the kind of act on a scale from cooperation to conflict, and the number of articles that carried it. The atlas downloads one file a day, the last seven days plus four weeks before them, and counts for every country the events it was party to. Each week's result is kept (${NEWS.history ? NEWS.history.length : 1} so far, since ${NEWS.history && NEWS.history.length ? fmtDay(NEWS.history[0].from) : fmtDay(NEWS.week.from)}), so the curve of every country and theatre grows by itself.</p>
      <p><b>Surging</b> is the week's events divided by the country's own mean week over the four weeks before, smoothed so that very small counts do not explode; only countries with at least 150 events in the week are ranked. <b>Burning</b> takes the conflict events alone (verbal and material conflict, GDELT's classes 3 and 4), divides them by the country's normal conflict, and multiplies by the share of conflict in the week's news; same floor, and a share of at least 30%. <b>Loud</b> is the plain count of articles. Each country is set against itself, so the United States, which makes more than a quarter of the world's coded news, is loud but seldom surging.</p>
      <p>What it is not: it measures the attention of the media GDELT reads, mostly in English and other major languages, not what happened. A hurricane and a coup read alike until the conflict share tells them apart; the francophone Sahel and the Pacific read quiet for lack of coverage; a surge may be a summit or a scandal. It is a pointer, kept apart from the cards: each update starts its searches from the surging and the burning, and nothing enters a card from here without a source read by a person. Nothing on this page is a reading of the atlas.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
  }

  function tipFor(id, fallbackName, ev) {
    if (id === tipId && !tip.hidden) return placeTip(ev);
    tipBuild(id, fallbackName, ev);
    tipId = id;
  }
  function tipBuild(id, fallbackName, ev) {
    const a = actors[id], name = a ? a.name : fallbackName;
    if (id === pov) return showTip(`<b>${esc(name)}</b><span class="k">Point of view</span>`, ev);
    if (!pov && homeLens) {
      const c = (lens => lens)(null);
      if (homeLens.kind === "org") { const since = membersOf[homeLens.id][id]; return showTip(`<b>${esc(name)}</b>${since !== undefined ? `Member of ${esc(actors[homeLens.id].name)}${since ? " since " + esc(since) : ""}` : "Not a member"}`, ev); }
      if (homeLens.kind === "heat") { const r = NEWS && NEWS.actors[id]; return showTip(`<b>${esc(name)}</b>${r ? `${r.events.toLocaleString("en-GB")} events this week, ${r.ratio} times its four-week normal<span class="k">${Math.round((r.conflict_share || 0) * 100)}% of them conflict, ${r.conflict_ratio} times its normal conflict · ${r.articles.toLocaleString("en-GB")} articles</span>` : "No events coded this week"}`, ev); }
      const iss = ISSUES[homeLens.id];
      if (iss.kind === "recognition") { const r = (recog[iss.target] || {})[id]; return showTip(`<b>${esc(name)}</b>${id === iss.target ? "The subject" : r ? REC_LABEL[r] : "No data"}`, ev); }
      const v = voteOn(iss.symbol, id); return showTip(`<b>${esc(name)}</b>${v ? VOTE_LBL[VOTE_CLS[v]] : "Did not vote / not a member"} on ${esc(iss.symbol)}`, ev);
    }
    if (!pov) return showTip(`<b>${esc(name)}</b><span class="k">${a && a.card === "full" ? "Has a card - click to see the world as it sees it" : a && (hasVotes(a.id) || hasClubs(a.id) || hasRecog(a.id)) ? "Data only - click to see the world from its seat" : a ? "Actor without data yet" : "Not an actor yet"}</span>`, ev);
    if (lens === "clubs") {
      const sh = sharedClubs(pov, id);
      return showTip(`<b>${esc(name)}</b>${sh.length ? `${sh.length} in common: ${sh.map(o => esc(actors[o] ? actors[o].name : o)).join(", ")}` : "No organisation in common"}`, ev);
    }
    if (lens === "recognition") {
      const r = (recog[pov] || {})[id];
      const row = data.relations.find(x => x.to === pov && x.from === id && (x.type === "recognition" || x.type === "non_recognition"));
      return showTip(`<b>${esc(name)}</b>${r ? REC_LABEL[r] : "No data"}${row ? `<br><span class="k">${esc(row.summary)}</span>` : ""}`, ev);
    }
    if (lens === "votes") {
      const x = (unga.affinity[pov] || {})[id];
      return showTip(`<b>${esc(name)}</b>${x == null ? "Fewer than 20 common recorded votes" : `Voted with ${esc(actors[pov].name)} in ${Math.round(x * 100)}% of common recorded votes`}${stanceOf(id) ? `<br><span class="k">Posture: ${GRADE_LABEL[stanceOf(id).grade]}</span>` : ""}`, ev);
    }
    const st = stanceOf(id);
    if (!st) return showTip(`<b>${esc(name)}</b><span class="k">No recorded stance${a ? "" : " · not an actor yet"}</span>`, ev);
    showTip(`<b>${esc(name)}</b>${GRADE_LABEL[st.grade]} · ${TREND_SIGN[st.trend]} ${TREND[st.trend]} · ${BOND_LABEL[st.bond].toLowerCase()}${st.alignment === "de_facto" ? " · aligned, no treaty" : ""} · confidence ${st.confidence}${st.stale ? " · stale" : ""}${(st.reciprocal_of || st.dataset === "reciprocal") ? " · mirrored, not written from this side" : ""}<br><span class="k">${esc(noteOf(id))}</span>`, ev);
  }

  // ---------- dossier with footnotes
  const esc = s => String(T(s) ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let notes = [];
  function fn(sources) {
    return (sources || []).map(s => {
      let i = notes.findIndex(n => n.url === s.url);
      if (i < 0) { notes.push(s); i = notes.length - 1; }
      return `<sup class="fn" data-n="${i}">${i + 1}</sup>`;
    }).join(`<sup class="fn-sep">,</sup>`);
  }
  // the reading is stored as one block; shown as paragraphs of two or three sentences (form only, 2026-10-16)
  // the whole block is translated first (the Italian is stored per reading), then cut: a sentence ends at .!? followed by
  // whitespace and a capital letter or an opening quote, never inside a number ("51.8%") and never after an abbreviation
  const SENT_END = /(?<=[.!?]["'’”)\]]*)\s+(?=["'‘“(\[]*\p{Lu})/u;
  const ABBR_END = /(?:\b(?:U\.S|U\.K|St|Mr|Mrs|Ms|Dr|No|Art|Arts|vs|Gen|Sen|Col|Cf|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)|\b\p{Lu})\.$/u;
  const sentences = part => part.split(SENT_END).reduce((acc, x) => { if (acc.length && ABBR_END.test(acc[acc.length - 1])) acc[acc.length - 1] += " " + x; else acc.push(x); return acc; }, []);
  const paragraphs = text => {
    const t = String(T(String(text || "").trim()) || "").trim();
    if (!t) return "";
    const parts = t.split(/\n\s*\n/).map(x => x.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim()).filter(Boolean);
    const out = [];
    for (const part of parts) {
      const sents = sentences(part);
      let buf = [];
      sents.forEach((sn, i) => { buf.push(sn.trim()); if (buf.length === 3 || i === sents.length - 1) { out.push(buf.join(" ")); buf = []; } });
      if (out.length >= 2 && out[out.length - 1].length < 90) { const last = out.pop(); out[out.length - 1] += " " + last; }
    }
    return out.map(x => `<p class="reading">${esc(x)}</p>`).join("");
  };
  const mirrored = st => st && (st.reciprocal_of || st.dataset === "reciprocal");
  const badge = x => `<span class="badge ${x.confidence}">${x.confidence}</span>${x.stale ? ' <span class="stale">stale</span>' : ""}${mirrored(x) ? ' <span class="stale" title="not written from this side: mirrored from the other card at low confidence">mirrored</span>' : ""}`;
  const claimList = (items, ordered) =>
    `<${ordered ? "ol" : "ul"}>` + items.map(it => `<li>${esc(it.text)}${fn(it.sources)}${badge(it)}</li>`).join("") + `</${ordered ? "ol" : "ul"}>`;
  const notesHtml = () => notes.length ? `<h3>Sources</h3><ol class="fn-list">` + notes.map(s =>
    `<li><span class="t">T${s.tier}</span><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · ${esc(s.publisher)} · ${esc(s.date)}</li>`).join("") + `</ol>` : "";

  let dossierSeq = 0;
  async function renderDossier(id) {
    const a = actors[id];
    const el = document.getElementById("dossier");
    setView("dossier", false);
    const seq = ++dossierSeq;
    if (!LOADED.has(id)) el.innerHTML = "";
    // the card, the notes and the sources come from the bundles: this actor's, and the point of view's for "as X sees it"
    const [B, PB] = await Promise.all([bundle(id), pov && pov !== id ? bundle(pov) : null]);
    if (seq !== dossierSeq) return;   // the reader has moved on while the bundle travelled
    notes = [];
    let html;
    const flag = a.flag ? a.flag : a.iso2 ? `https://flagcdn.com/w160/${a.iso2}.png` : null;
    const head = `<div class="head">${flag ? `<img class="flag" src="${esc(flag)}" alt="Flag of ${esc(a.name)}">` : ""}<div><h2>${esc(a.name)}</h2>` +
      `<p class="sub">${esc(a.type)} · seat <span class="lst">${esc(a.seat)}</span> · <span class="lst">${a.regions.map(r => r.replace(/-/g, " ")).join(", ")}</span>${a.card === "full" ? ` · card verified ${esc(a.last_verified)}` : ""}${a.stale ? ' · <span class="stale">stale</span>' : ""}` +
      `${a.wikipedia ? ` · <a href="${esc(a.wikipedia)}" target="_blank" rel="noopener">Wikipedia ↗</a>` : ""}</p></div></div>`;
    if (a.card !== "full") {
      const st = (PB && PB.stIdx.get(id)) || stanceOf(id);
      html = head + `<p class="empty">No grand-strategy card yet: what follows comes from datasets only (UN General Assembly votes, memberships from Wikidata).</p>` +
        (st && pov ? `<h3>As ${esc(actors[pov].name)} sees it</h3><p><b>${GRADE_LABEL[st.grade]}</b>, ${TREND[st.trend]}, ${BOND_LABEL[st.bond].toLowerCase()}${st.alignment === "de_facto" ? ", aligned without a treaty" : ""}${badge(st)}<br>${esc(st.note || "")}${fn(st.sources)}</p>` : "") +
        ungaHtml(id) + relationsHtml(id, B);
    } else {
      const gs = B && B.actor && B.actor.grand_strategy;
      if (!gs) { el.innerHTML = head + `<p class="empty">The card could not be loaded. Reload the page.</p>`; toTop(); return; }
      const byDomain = d3.group(gs.means, m => m.domain);
      html = head + `
        <h3>Grand strategy</h3>
        <h4>Objectives, ranked</h4>${claimList(gs.objectives, true)}
        <h4>Means</h4>${[...byDomain].map(([d, ms]) => `${d ? `<h4>${esc(d)}</h4>` : ""}${claimList(ms, false)}`).join("")}
        <h4>Constraints</h4>${claimList(gs.constraints, false)}
        <h4>Paradoxes</h4>${claimList(gs.paradoxes, true)}
        <h4>Reading</h4>${paragraphs(gs.reading)}
        ${CONV[id] ? `<h3>Convergences</h3><p class="conv">Actors that share one of ${poss(esc(a.short || a.name))} rivals and are not its allies, the tables it has not sat at: <span class="lst">${CONV[id].map(c => `<a href="#/view/${c.id}">${nameOf(c.id)}</a> <span class="meta">(against ${c.shared.map(nameOf).join(", ")})</span>`).join(" · ")}</span>.</p>` : ""}
        <h3>The world as ${esc(a.name)} sees it</h3>
        <table class="tbl"><thead><tr><th>Toward</th><th>Posture</th><th>Bond</th><th>Why this reading</th></tr></thead><tbody>
        ${(B.stances || []).map(s => `<tr><td><b>${esc(actors[s.toward].name)}</b><br><span class="meta">since ${esc(s.since)}</span></td>
          <td><span class="sw" style="background:${gradeSwatch(s.grade)};border-color:${gradeBorder(s.grade)}"></span>${GRADE_LABEL[s.grade]}<br><span class="meta">${TREND_SIGN[s.trend]} ${TREND[s.trend]}${badge(s)}</span></td>
          <td>${BOND_LABEL[s.bond]}</td>
          <td class="note">${esc(s.note || "")}${fn(s.sources)}</td></tr>`).join("")}
        </tbody></table>` + ungaHtml(id) + relationsHtml(id, B);
    }
    el.innerHTML = html + notesHtml();
    el.querySelectorAll(".conv a[href^='#/']").forEach(x => x.onclick = ev => { ev.preventDefault(); navigate(x.getAttribute("href")); });
    el.querySelectorAll("sup.fn").forEach(s => {
      const n = notes[+s.dataset.n];
      s.onmousemove = ev => showTip(`<b>Source ${+s.dataset.n + 1} · tier ${n.tier}</b>${esc(n.title)}<br><span class="k">${esc(n.publisher)} · ${esc(n.date)}</span>`, ev);
      s.onmouseleave = hideTip;
      s.onclick = () => el.querySelector(".fn-list").scrollIntoView({ behavior: "smooth" });
    });
    toTop();
  }

  function ungaHtml(id) {
    const aff = unga.affinity[id];
    if (!aff) return "";
    const pct = x => x == null ? "–" : Math.round(x * 100) + "%";
    const sorted = Object.entries(aff).filter(([c]) => actors[c]).sort((x, y) => y[1] - x[1]);
    const top = sorted.slice(0, 6), low = sorted.slice(-6).reverse();
    const lms = unga.landmarks[id] || [];
    const word = { Y: "YES", N: "NO", A: "abstained", "-": "did not vote" };
    return `<h3>UN General Assembly, recorded votes ${esc(unga.span || "")}</h3>
      <p>Votes together with <b>United States</b> ${pct(aff.USA)} · <b>Russia</b> ${pct(aff.RUS)} · <b>China</b> ${pct(aff.CHN)}.
      Closest: <span class="lst">${top.map(([c, x]) => `${esc(actors[c].name)} ${pct(x)}`).join(", ")}</span>. Furthest: <span class="lst">${low.map(([c, x]) => `${esc(actors[c].name)} ${pct(x)}`).join(", ")}</span>.
      <span class="meta">Share of recorded votes cast the same way, pairs with at least 20 common votes. Source: UN Digital Library voting records.</span></p>` +
      (lms.length ? `<table class="tbl"><thead><tr><th>Date</th><th>Resolution</th><th>${esc(a_name(id))}</th></tr></thead><tbody>` +
        lms.map(l => `<tr><td>${esc(l.date)}</td><td><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.symbol)}</a> ${esc(l.label)}</td><td><b>${word[l.vote] || l.vote}</b></td></tr>`).join("") + `</tbody></table>` : "");
  }
  const a_name = id => actors[id].name;

  function relationsHtml(id, B) {
    const out = realRows(B && B.relations_from), inn = realRows(B && B.relations_to);
    const block = (rows, dir) => data.layers.map(l => {
      const rs = rows.filter(r => r.layer === l);
      if (!rs.length) return "";
      return `<h4>${LAYER_LABEL[l]}</h4>` + rs.map(r => `<div class="rel" style="border-color:${layerColor(l)}">
        <div class="hd"><b>${dir === "out" ? "→ " + esc(actors[r.to].name) : "← " + esc(actors[r.from].name)}</b> · <span>${esc(r.type.replace(/_/g, " "))}</span> · ${esc(r.since)}${r.until && r.until !== r.since ? " – " + esc(r.until) : ""}${badge(r)}</div>
        <div>${r.value !== undefined ? `<span class="val">${esc(r.value)} ${esc(String(r.unit).replace(/_/g, " "))}</span> · ` : ""}${esc(r.summary)}${fn(r.sources)}</div>
        ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}
        ${r.claims ? `<div class="note">Contested: ` + r.claims.map(c => { const who = actors[c.by] ? actors[c.by].name : String(c.by); return `<b>${esc(who)}</b> says ${esc(c.text)}${fn([{ url: c.source, title: c.text, publisher: who, date: "", tier: 4 }])}`; }).join("; ") + `</div>` : ""}
        </div>`).join("");
    }).join("");
    return (out.length ? `<h3>Relations from ${esc(actors[id].name)}</h3>` + block(out, "out") : "") +
      (inn.length ? `<h3>Relations toward ${esc(actors[id].name)}</h3>` + block(inn, "in") : "") +
      (!out.length && !inn.length ? `<p class="empty">No relation rows yet.</p>` : "");
  }

  window.addEventListener("resize", () => { if (view === "map") drawMap(); });
  apply(location.hash);
})();
