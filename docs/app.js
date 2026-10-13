/* Grand Strategy - renders docs/data.json (compiled from data/ by tools/build.py).
   Two views: the situation map from the point-of-view actor (posture as colour, bond as
   screen, relations as arrows by layer) and the dossier with footnoted sources. */
(async function () {
  const stamp = document.querySelector('script[src^="app.js"]').src.split("?")[1];
  const [data, world, iso2] = await Promise.all([
    fetch("data.json" + (stamp ? "?" + stamp : "")).then(r => r.json()),
    fetch("world.geojson").then(r => r.json()),
    fetch("iso2.json").then(r => r.json()),
  ]);

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
  const feature = Object.fromEntries(world.features.map(f => [f.id, f]));
  let pov = null;                 // null = home: the world of today, flags and borders
  let view = "map";
  let mapMode = "world";
  let lens = "posture";           // posture (stances) | votes (UN General Assembly affinity)
  const unga = data.unga || { affinity: {}, landmarks: {}, members: [], resolutions: {} };
  // dataset vote rows are stored compact; give them their text and source back
  const VOTE_WORD = { Y: "YES", N: "NO", A: "ABSTAINED" };
  data.relations.forEach(r => {
    if (r.dataset !== "unga-votes") return;
    const res = unga.resolutions[r.symbol] || {};
    r.summary = `Voted ${VOTE_WORD[r.vote] || r.vote} on ${r.symbol} - ${res.label || ""} (${res.tally || ""}).`;
    r.until = r.since; r.last_verified = r.since; r.stale = false;
    r.sources = [{ url: res.url, title: `${r.symbol} voting record`, publisher: "UN Digital Library", date: r.since, tier: 1 }];
  });
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
    `Situation map · in construction<br>compiled ${data.generated} · ${data.progress ? `${data.progress.cards} of ${data.progress.total} cards` : `${fullActors.length} cards`}, ${data.actors.length} actors<br>${Object.values(data.stances).flat().length} stances · ${data.relations.length} relations`;

  const povSel = document.getElementById("pov");
  povSel.add(new Option("The world of today", ""));
  const grpFull = document.createElement("optgroup"); grpFull.label = "With a grand-strategy card";
  fullActors.forEach(a => grpFull.appendChild(new Option(`The world as ${a.name} sees it`, a.id)));
  povSel.appendChild(grpFull);
  const grpData = document.createElement("optgroup"); grpData.label = "Data only (UN votes, memberships, treaty allies)";
  data.actors.filter(a => a.card !== "full" && (hasVotes(a.id) || hasStances(a.id) || hasClubs(a.id) || hasRecog(a.id))).sort((x, y) => x.name.localeCompare(y.name))
    .forEach(a => grpData.appendChild(new Option(a.name, a.id)));
  povSel.appendChild(grpData);
  povSel.onchange = () => { if (povSel.value) setPov(povSel.value); else goHome(); };
  // every screen is a URL (#/view/SRB/posture, #/dossier/SRB, #/organisation/org-eu ...) so the browser's back and forward work
  function navigate(h) { if (location.hash === h) apply(h); else location.hash = h; }
  window.addEventListener("hashchange", () => apply(location.hash));
  function apply(h) {
    const [kind, id, extra] = h.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    const clear = () => { homeLens = null; orgSel.value = ""; issueSel.value = ""; pov = null; povSel.value = ""; };
    if (kind === "view" && actors[id]) {
      pov = id; povSel.value = id; homeLens = null; orgSel.value = ""; issueSel.value = "";
      lens = ["posture", "recognition", "votes", "clubs"].includes(extra) ? extra : hasStances(id) ? "posture" : hasRecog(id) ? "recognition" : hasVotes(id) ? "votes" : "clubs";
      mapMode = hasStances(id) ? "near" : "world";
      renderLegend(); setView("map");
    } else if (kind === "dossier" && actors[id]) {
      renderDossier(id);
    } else if (kind === "organisation" && actors[id]) {
      clear(); homeLens = { kind: "org", id }; orgSel.value = id; mapMode = "world"; renderLegend(); setView("map");
    } else if (kind === "issue" && ISSUES[id]) {
      clear(); homeLens = { kind: "issue", id }; issueSel.value = id; mapMode = "world"; renderLegend(); setView("map");
    } else if (kind === "organisations") setView("orgs");
    else if (kind === "issues") setView("issues");
    else if (kind === "luttwak") setView("luttwak");
    else if (kind === "seams") setView("seams");
    else if (kind === "clients") setView("clients");
    else if (kind === "faults") setView("faults");
    else if (kind === "about") setView("about");
    else if (kind === "colophon") { setView("about"); const c = document.getElementById("colophon"); if (c) c.scrollIntoView(); return; }
    else { clear(); mapMode = "world"; renderLegend(); setView("map"); }
    window.scrollTo(0, 0);
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
  const PAGE_HASH = { map: "#/", orgs: "#/organisations", issues: "#/issues", luttwak: "#/luttwak", seams: "#/seams", clients: "#/clients", faults: "#/faults", about: "#/about", colophon: "#/colophon" };
  document.querySelectorAll("#topnav a").forEach(a => { a.href = PAGE_HASH[a.dataset.page]; a.onclick = ev => { ev.preventDefault(); navigate(PAGE_HASH[a.dataset.page]); }; });
  document.getElementById("home").onclick = ev => { ev.preventDefault(); goHome(); };
  function setView(v, render = true) {
    view = v;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("is-on", b.dataset.view === v));
    document.querySelectorAll("#topnav a").forEach(a => a.classList.toggle("is-on", a.dataset.page === v || (a.dataset.page === "map" && (v === "map" || v === "dossier"))));
    document.querySelectorAll(".view").forEach(s => s.classList.toggle("is-on", s.id === "view-" + v));
    const isPage = ["orgs", "issues", "luttwak", "seams", "clients", "faults", "about"].includes(v);
    document.querySelector(".side").style.display = isPage ? "none" : "";
    document.querySelector(".frame").classList.toggle("is-page", isPage);
    if (v === "orgs") renderOrgsPage();
    if (v === "issues") renderIssuesPage();
    if (v === "luttwak") renderLuttwakPage();
    if (v === "seams") renderSeamsPage();
    if (v === "clients") renderClientsPage();
    if (v === "faults") renderFaultsPage();
    if (v === "about") renderAboutPage();
    if (!render) return;
    if (v === "map") drawMap();
    if (v === "dossier") renderDossier(pov || fullActors[0].id);
  }

  const stanceOf = id => pov ? (data.stances[pov] || []).find(s => s.toward === id) : undefined;
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
                   yes: ["ally", .35], withdrew: ["reluctant_ally", .35], no: ["rival", .3], abst: ["partner", .2], member: ["ally", .35] };
  const voteSwatch = c => alpha(COLOR(VCLASS[c][0]), VCLASS[c][1]);
  const voteBorder = c => COLOR(VCLASS[c][0]);
  function renderLegend() {
    const el = document.getElementById("legend");
    if (!pov && homeLens && homeLens.kind === "org") {
      const o = actors[homeLens.id], n = Object.keys(membersOf[homeLens.id]).length;
      el.innerHTML = `<h3>${esc(o.name)}</h3><div class="row"><span class="sw" style="background:${voteSwatch("member")};border-color:${voteBorder("member")}"></span>Member (${n})</div><div class="row"><span class="sw"></span>Not a member</div><div class="row" style="color:var(--ink-3)">Memberships from the official list and Wikidata; some lists are hand-checked.</div>`;
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
      el.innerHTML = `<h3>The world of today</h3><div class="row">Borders and flags as of ${data.generated}. Click a country that has a card to see the world as it sees it; ${fullActors.length} card${fullActors.length > 1 ? "s" : ""} so far: ${fullActors.map(a => a.name).join(", ")}.</div>`;
      return;
    }
    if (lens === "votes") {
      el.innerHTML = `<h3>Votes with ${actors[pov].name}</h3><div class="row" style="color:var(--ink-3)">UN General Assembly, recorded votes ${unga.span || ""}</div>` +
        ["v90", "v80", "v70", "v60", "vlow"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)};border-color:${voteBorder(c)}"></span>${VOTE_LABEL[c]}</div>`).join("") +
        `<div class="row"><span class="sw"></span>Fewer than 20 common votes</div>`;
      return;
    }
    el.innerHTML = `<h3>Posture of ${actors[pov].name}</h3>` +
      data.grades.map(g => `<div class="row"><span class="sw" style="background:${gradeSwatch(g)};border-color:${gradeBorder(g)};${g === "claimed_territory" ? "border-style:dashed" : ""}"></span>${GRADE_LABEL[g]}</div>`).join("") +
      `<h3>Bond</h3>
       <div class="row"><span class="sw" style="box-shadow:inset 0 0 0 3px var(--c-partner)"></span>Kin - shared identity</div>
       <div class="row"><span class="sw" style="box-shadow:inset 0 0 0 3px var(--c-rival)"></span>Grievance - open wound</div>
       <div class="row"><span class="sw"></span>Affinity or no standing tie</div>
       <div class="row fault-hint">A band that contradicts its outline is a fault: kin inside red = feud, grievance inside green = Byzantine alliance.</div>` +
      (SEAMS_ON_MAP && seamsAround(pov).length ? `<h3>Seams</h3><div class="row"><span class="sw" style="border:1.5px dashed var(--c-seam)"></span>Pulled between ${actors[pov].short || actors[pov].name} and a rival (${new Set(seamsAround(pov).map(s => s.y)).size})</div>` : "");
  }

  // ---------- tooltip
  const tip = document.getElementById("tip");
  function showTip(html, ev) {
    tip.innerHTML = html; tip.hidden = false;
    const x = Math.min(ev.clientX + 14, window.innerWidth - 360), y = Math.min(ev.clientY + 14, window.innerHeight - 160);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };

  // ---------- map
  let mapState = null;
  function drawMap() {
    const svg = d3.select("#map");
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

    // keep line weights, dashes and type at screen size whatever the zoom
    function rescale(k) {
      defs.select("#hatch").attr("patternTransform", `rotate(45) scale(${1 / k})`);
      g.selectAll("path.c").attr("stroke-width", .55 / k);
      g.selectAll("path.grat").attr("stroke-width", .5 / k).attr("stroke-dasharray", `${2 / k} ${3 / k}`);
      g.selectAll("path.p").attr("stroke-width", f => litWidth(f) / k).attr("stroke-dasharray", f => isClaimed(f) ? `${3 / k} ${2 / k}` : null);
      g.selectAll("path.bond").attr("stroke-width", 3.4 / k);
      g.selectAll("path.seam").attr("stroke-width", 1.6 / k).attr("stroke-dasharray", `${4 / k} ${3 / k}`);
      // a label shows only when its country is wide enough on screen to carry it (the point of view always does)
      g.selectAll(".labels text").attr("font-size", 10 / k).attr("stroke-width", 3 / k)
        .attr("opacity", a => {
          if (a.id === pov || !feature[a.id]) return 1;
          const [[x0], [x1]] = path.bounds(feature[a.id]);
          return (x1 - x0) * k >= (a.short || a.name).length * 5.6 ? 1 : 0;
        });
      g.selectAll(".seats rect").attr("transform", a => { const [x, y] = proj(a.coords); return `translate(${x},${y}) scale(${1 / k}) translate(${-x},${-y})`; });
    }

    svg.append("rect").attr("width", width).attr("height", height).attr("fill", flagHome ? css("--sea") : css("--paper"));
    const g = svg.append("g");

    const countries = g.append("g");
    if (!flagHome) countries.append("path").attr("class", "grat").attr("d", path(d3.geoGraticule10())).attr("fill", "none").attr("stroke", css("--grat")).attr("pointer-events", "none");
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
    countries.selectAll("path.p").data(screened).join("path").attr("class", "p")
      .attr("d", path).attr("pointer-events", "none").attr("stroke-linejoin", "round")
      .attr("fill", f => isClaimed(f) ? "url(#hatch)" : litColor(f)).attr("fill-opacity", f => isClaimed(f) ? 1 : litLight(f))
      .attr("stroke", litColor).attr("stroke-width", litWidth).attr("filter", "url(#glow)");
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

    // non-state actors and seats
    const seats = g.append("g").attr("class", "seats");
    const nonState = posture ? data.actors.filter(a => !feature[a.id] && (a.id === pov || stanceOf(a.id))) : [];
    seats.selectAll("rect").data(nonState).join("rect")
      .attr("x", a => proj(a.coords)[0] - 4).attr("y", a => proj(a.coords)[1] - 4).attr("width", 8).attr("height", 8)
      .attr("fill", a => COLOR(gradeOf(a.id))).attr("fill-opacity", a => LIGHT[gradeOf(a.id)] || 0).attr("stroke", a => COLOR(gradeOf(a.id))).attr("stroke-width", 1).attr("filter", "url(#glow)")
      .style("cursor", "pointer")
      .on("mousemove", (ev, a) => { tipFor(a.id, a.name, ev); lightCard(a.id); }).on("mouseleave", () => { hideTip(); lightCard(null); }).on("click", (ev, a) => showDossier(a.id));

    // labels: display capitals for every lit actor
    const labelled = !pov ? [] : !posture ? data.actors.filter(a => a.id === pov) : data.actors.filter(a => a.id === pov || stanceOf(a.id));
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
    const zoom = d3.zoom().scaleExtent([1, 14]).on("zoom", ev => {
      g.attr("transform", ev.transform);
      rescale(ev.transform.k);
    });
    mapState.rescale = rescale;
    svg.call(zoom);
    function frame(mode) {
      let t = d3.zoomIdentity;
      const home = pov && feature[pov] ? path.bounds(feature[pov]) : null;
      if (mode === "near" && home) {
        const [[x0, y0], [x1, y1]] = home;
        const span = Math.max(x1 - x0, y1 - y0) * 9;
        const k = Math.max(1.5, Math.min(14, Math.min(width, height) / span));
        t = d3.zoomIdentity.translate(width / 2 - k * (x0 + x1) / 2, height / 2 - k * (y0 + y1) / 2).scale(k);
      }
      svg.transition().duration(600).call(zoom.transform, t);
      svg.selectAll(".frame-btn").classed("is-on", function () { return this.dataset.mode === mode; });
    }
    const ctl = svg.append("foreignObject").attr("x", 12).attr("y", 12).attr("width", 240).attr("height", 40);
    ctl.attr("width", 560);
    ctl.append("xhtml:div").attr("class", "frame-ctl").html(pov
      ? `<button class="frame-btn" data-mode="near">Neighbourhood</button><button class="frame-btn" data-mode="world">World</button>` +
        `<span class="frame-gap"></span>` +
        (hasStances(pov) ? `<button class="frame-btn lens ${lens === "posture" ? "is-on" : ""}" data-lens="posture">Posture</button>` : "") +
        (hasRecog(pov) ? `<button class="frame-btn lens ${lens === "recognition" ? "is-on" : ""}" data-lens="recognition">Recognition</button>` : "") +
        (hasVotes(pov) ? `<button class="frame-btn lens ${lens === "votes" ? "is-on" : ""}" data-lens="votes">UN votes</button>` : "") +
        (hasClubs(pov) ? `<button class="frame-btn lens ${lens === "clubs" ? "is-on" : ""}" data-lens="clubs">Clubs</button>` : "")
      : homeLens ? `<button class="frame-btn" data-home="flags">Flags</button><button class="frame-btn is-on" data-mode="world">${esc(homeLens.kind === "org" ? actors[homeLens.id].name : ISSUES[homeLens.id].label.split(" - ")[0])}</button>`
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
  function lightCard(id) {
    document.querySelectorAll(".ledger tr.cp").forEach(c => c.classList.toggle("is-lit", c.dataset.id === id));
  }
  // filters on the ledger: click a posture, trend, bond or type to keep only that; click again to clear
  let ledgerFilter = {};
  function renderRelPanel() {
    const el = document.getElementById("relpanel");
    if (!pov) { el.innerHTML = ""; ledgerFilter = {}; return; }
    const rows = data.relations.filter(r => r.from === pov && r.dataset !== "unga-votes");
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
          <td>${c.st ? fv("grade", c.st.grade, c.st.grade.replace(/_/g, " ")) : "<span class='tr'>-</span>"}</td>
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
      <p class="honour">This site is built in honour of Edward N. Luttwak. It is not his work and he has not seen it; it is an attempt to look at the whole world, every state at once, with the lamp he built.</p>
      <p class="lede">This atlas reads the world through Edward N. Luttwak's idea of grand strategy. Not because he is always right, but because his grid forces the questions that a map of flags leaves out: what does each actor want, with what, against what, and where do its own moves turn against it.</p>
      <h3>The paradoxical logic</h3>
      <p>Luttwak's central claim (<i>Strategy: The Logic of War and Peace</i>, 1987) is that in any contest between adversaries the ordinary, linear logic of everyday life stops working. The worse road may be the better one precisely because it is unexpected; the weapon that works is the one the enemy adapts to, so it stops working; a victory pressed too far becomes a defeat, because it summons the coalition that undoes it. Strategy is paradoxical because the other side reacts. Every card in this atlas therefore ends with <b>paradoxes</b>: the places where an actor's own instruments undermine its own goals. Serbia's veto on Kosovo needs Moscow and Beijing, and Moscow and Beijing close the road to Brussels. Kosovo's proofs of statehood in the north cost it the patrons who could confer statehood.</p>
      <h3>The levels</h3>
      <p>Luttwak stacks conflict in levels that interact but do not sum: the technical, the tactical, the operational, the theatre strategy, and above them all <b>grand strategy</b>, where military force meets diplomacy, economics, alliances and persuasion, and where a state's whole external conduct can be read as one design. This atlas lives on the top level only. It does not model battles or armies; it models what states and state-like actors want, the means they use across the four domains (diplomatic, informational, military, economic), what constrains them, and how they see each other.</p>
      <h3>From the lamp to the data</h3>
      <p>Each actor with a full card carries: <b>objectives</b>, ranked; <b>means</b> by domain; <b>constraints</b>; <b>paradoxes</b>; and a short <b>reading</b>, the only free prose. Every claim has a source with its tier (official document, research, quality press, other) and a confidence grade: <b>A</b> an official document or two independent sources, <b>B</b> one good source, <b>C</b> press or our own inference, always shown.</p>
      <h3>Posture and bond</h3>
      <p>How one actor sees another is recorded on two axes. The <b>posture</b> is what the relationship is today, on a closed scale: own territory, claimed but not controlled, ally, reluctant ally, partner, reluctant partner, neutral, rival, adversary. "Adversary" is reserved for mortal enemies, where the other's existence or regime is the problem (Iran and Israel); nearly all bad relationships are rivalries. A posture is never our opinion: it needs a source that uses that reading, and it follows the structural position, not the rhetoric of a joint communiqué. The <b>bond</b> is the structure under the posture, what would survive a change of government: kin (shared identity), affinity, none, or grievance (an open historical wound). Two actors can both be "partner" and mean opposite things: for Serbia, Russia is a partner of kin growing colder; the United States a partner with a grievance growing warmer. On the map the posture is the colour and the bond a band inside the border.</p>
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
  function renderSeamsPage() {
    const el = document.getElementById("page-seams");
    const byY = d3.group(SEAMS, s => s.y);
    const order = [...byY.entries()].sort((p, q) => q[1].length - p[1].length || actors[p[0]].name.localeCompare(actors[q[0]].name));
    el.innerHTML = `<h2>Seams</h2><p class="lede">A seam is an actor pulled two ways: it is an ally of two actors that are rivals or adversaries of each other. In Luttwak's grammar the seam between an opponent and its allies is where relational manoeuvre aims, and where an alliance is tested first.</p>
      <div class="seams">` + order.map(([y, list]) => `<div class="seam-block"><h3><a href="#/view/${y}">${nameOf(y)}</a> <span>pulled ${list.length} way${list.length > 1 ? "s" : ""}</span></h3>` +
        list.map(s => `<div class="seam"><a href="#/view/${s.a}">${nameOf(s.a)}</a> <i class="h">${s.ax}</i> <a href="#/view/${s.x}">${nameOf(s.x)}</a><span class="both">both <i class="al">${s.ay === s.xy ? s.ay.replace("_", " ") : s.ay.replace("_", " ") + " / " + s.xy.replace("_", " ")}</i> of ${nameOf(y)}</span></div>`).join("") + `</div>`).join("") + `</div>
      <details class="method"><summary>How seams are found</summary><p>A seam needs three legs: A hostile to X (rival or adversary), A allied to Y, X allied to Y (ally or reluctant ally). Every leg must be a written reading of confidence A or B, from either side of the leg. A treaty membership alone never counts, or every NATO member would be pulled between Cyprus and Turkey; provisional reciprocals never count. ${SEAMS.length} seams across ${order.length} actors so far, from ${fullActors.length} cards; the list grows by itself as cards are written on both sides of a rivalry.</p></details>`;
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
      <h3 class="sec">Who leans on whom</h3><table class="ledger-t"><thead><tr><th>Client</th><th>Lean</th><th>Patron</th><th>Client's reading</th><th>Patron's reading</th><th>Client</th></tr></thead><tbody>` +
      CLIENTS.map(c => `<tr><td class="name"><a href="#/view/${c.client}">${nameOf(c.client)}</a></td><td class="lean">+${c.lean}</td><td class="name"><a href="#/view/${c.patron}">${nameOf(c.patron)}</a></td>
        <td><i style="color:${gradeBorder(c.cg)}">${c.cg.replace("_", " ")}</i> · ${esc(c.cb || "")}<div class="why">${esc(c.cnote)}</div></td>
        <td><i style="color:${gradeBorder(c.pg)}">${c.pg.replace("_", " ")}</i> · ${esc(c.pb || "")}<div class="why">${esc(c.pnote)}</div></td>
        <td class="kind">${LOYAL[c.cb] || ""}</td></tr>`).join("") + `</tbody></table>
      <details class="method"><summary>How the lean is computed</summary>
      <p>Every posture is a step on one scale: <b>ally 4</b> · <b>reluctant ally 3</b> · <b>partner 2</b> · <b>reluctant partner 1</b> · <b>neutral 0</b> · <b>rival −1</b> · <b>adversary −2</b>. For a pair A and X the lean of A on X is <b>step(A's grade of X) − step(X's grade of A)</b>. If Serbia grades Hungary "ally" (4) and Hungary grades Serbia "partner" (2), Serbia leans on Hungary by 2: Serbia is the client, Hungary the patron. A lean of 1 is a tilt; 2 or more is a client in the full sense.</p>
      <p>Three conditions, all of them in the build: both readings must be hand-written at confidence A or B (provisional reciprocals and treaty-floor stances never count, so a pair appears only when both cards exist); at least one side must be an alliance (ally or reluctant ally), because a lean between two partners is a mood, not a client system; and the lean must be positive, so each pair appears once, from the client's side. The last column reads the client's bond: <b>loyal</b> if kin or affinity, <b>bought</b> if none or grievance, since a bought client holds only while the patron pays.</p>
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
    el.innerHTML = `<h2>Faults</h2><p class="lede">A fault is a relationship whose deep level contradicts its surface: the bond says one thing, the posture another. Luttwak's rule is that strategy works only when its levels are in harmony; a relationship resting on a fault is the one that breaks first. Two kinds matter. A <b>feud</b> is kin graded rival or adversary, the quarrel inside the family, the most intense because closeness multiplies the points of contact. A <b>Byzantine alliance</b> is an open wound graded ally: the Byzantine maxim that every enemy is a possible ally, and the alliance that holds over the wound because it must.</p>
      ${table("feud", "Feuds · kin, hostile")}
      ${table("byzantine", "Byzantine alliances · grievance, allied")}
      <details class="method"><summary>How faults are found</summary><p>Each stance carries a posture (today) and a bond (what would survive a change of government). A <b>feud</b> is bond kin with posture rival or adversary; a <b>Byzantine alliance</b> is bond grievance with posture ally or reluctant ally. A fault written by both sides of a pair is <b>mutual</b>; written by one side only, it says who feels it. The tendency reads the trend against the kind: a warming feud is <b>healing</b>, a cooling one <b>deepening</b>; a cooling Byzantine alliance is <b>tearing</b>. Only hand-written stances of confidence A or B count. Kin graded reluctant ally or reluctant partner is not a fault but a warning, <b>strained</b>, shown only in the ledger under the map. ${shown.length} faults so far, from ${fullActors.length} cards.</p></details>`;
    el.querySelectorAll("a[href^='#/']").forEach(a => a.onclick = ev => { ev.preventDefault(); navigate(a.getAttribute("href")); });
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
      <p>How one actor sees another is recorded on two axes. The <b>posture</b> is the relationship today, on a closed scale: own territory, claimed but not controlled, ally, reluctant ally, partner, reluctant partner, neutral, rival, adversary. "Adversary" is kept for mortal enemies, where the other's existence or regime is the problem; nearly all bad relationships are rivalries. The grade follows the structural position, never the rhetoric of a communiqué: two members of the same alliance with open friction are reluctant allies, not rivals. The <b>bond</b> is what lies under the posture and would survive a change of government: kin, affinity, none, or grievance. On the map the posture is the colour of the outline and of the light inside a country; the bond is a band inside the border.</p>
      <h3>Relations</h3>
      <p>Under the postures sit the relation rows, in four layers: <b>objectives</b> (what an actor wants from another), <b>alignments</b> (treaties, memberships, recognitions), <b>dependencies</b> (energy, trade, debt, arms, remittances, with numbers) and <b>actions</b> (dated events: votes, sanctions, visits, exercises). The datasets are the floor: memberships from Wikidata and official lists, recognition tables from Wikipedia with their citations, every recorded vote of the UN General Assembly since 2022 from the UN Digital Library. The cards are the reading on top of that floor.</p>
      <h3>Seams</h3>
      <p>A <b>seam</b> is an actor pulled two ways: an ally of two actors that are rivals or adversaries of each other. Greece between Israel and Turkey, the United States between Saudi Arabia and the Emirates, Italy between Hungary and Ukraine. The word is Luttwak's. In <i>Strategy</i> he describes <b>relational manoeuvre</b> as the style that aims not at the enemy's strength but at his specific weaknesses, his doctrine, his habits and the <i>seams</i> between him and his allies, where a small force can obtain a large effect. The Byzantine book shows the same idea at the scale of an empire that survived a thousand years by dividing its enemies rather than destroying them. The Seams page lists every such triangle the atlas can see; the map marks them for the actor you are looking at. They are computed from hand-written postures of confidence A or B only.</p>
      <h3>Clients</h3>
      <p>A <b>client</b> is an actor that leans on another more than it is leaned on: it grades the other higher than the other grades it. Luttwak's name for the arrangement is the <b>client system</b> of the early Roman empire, described in <i>The Grand Strategy of the Roman Empire</i>: the hegemonic empire of the Julio-Claudians ruled through client kings whose loyalty exceeded Rome's commitment to them, which is why it was cheap. The Clients page measures the <b>lean</b> of every pair the atlas has read from both sides, in steps on the posture scale; the higher-grading side is the client, the other the patron. A client bound by kin or affinity is loyal; one bound by nothing, or by a grievance, is bought, and holds as long as the patron pays. The tepid ally, graded "ally" by its patron and answering "partner", is the costly kind, the one Rome subsidised. In the ledger under the map the lean column shows, for each counterpart, who leans on whom.</p>
      <h3>Faults</h3>
      <p>A <b>fault</b> is a relationship whose deep level contradicts its surface. The frame is Luttwak's structure of <b>levels</b>: in <i>Strategy</i> success at one level can be undone at a higher one, and a strategy works only when its levels are in harmony. Here the levels are two: the bond, which would survive a change of government, and the posture of today. Two contradictions matter. The <b>feud</b> is kin graded rival or adversary, the quarrel inside the family, which Luttwak counts as the most intense of rivalries because closeness multiplies the points of contact. The <b>Byzantine alliance</b> is a grievance graded ally: the maxim from <i>The Grand Strategy of the Byzantine Empire</i> that every enemy is a possible ally, and the alliance that holds over an open wound because it must. The Faults page lists both, says whether each is felt by one side or both, and reads its trend as healing or tearing; on the map a fault shows as a bond band that contradicts the colour of its outline.</p>
      <h3>How it is made</h3>
      <p>The data lives in plain files, one per actor, separate from the site, and is versioned in the open: the whole history of every grade is in the repository. Cards are researched and drafted by language-model agents working from a shared brief and the atlas's own rules, then reread by a stronger model that checks objectives, paradoxes and every posture grade against the sources and against the neighbouring cards; the owner samples the result. A new card's grades retroact on the cards already written as provisional reciprocals, flagged as such until written from the other side. Nothing is embedded in the site: it renders the data as it stands on the day of the last build, and the stamp in the top bar says which day that was.</p>
      <h3>What it is not</h3>
      <p>It is not a forecast and not a verdict. Where a card says less than you expected, it is because the sources did not hold. Where a posture surprises you, open the dossier: the note under each grade says why it was read that way, and the footnote says who said so.</p>

      <h2 id="colophon" style="margin-top:40px">Colophon</h2>
      <p class="lede">Provisional. The final text is being written.</p>
      <h3>Who</h3>
      <p><b>Grand Strategy</b> is conceived, directed and edited by <b>Davide Caniatti</b>. Research, drafting and code are produced with Claude (Anthropic) under his direction; every grade on the site has been read by a person or is marked as provisional. Started on 12 October 2026.</p>
      <h3>Data and sources</h3>
      <p>Borders from Natural Earth (110m), with Kosovo added. Flags by flagcdn.com. Memberships from Wikidata and the organisations' official lists; recognition tables from Wikipedia with their citations; UN General Assembly recorded votes from the UN Digital Library. Each card cites its own sources in the dossier footnotes. Data, method, decision log and code are public on GitHub: <a href="https://github.com/AndreottiVIII/grand-strategy" target="_blank" rel="noopener">AndreottiVIII/grand-strategy</a>.</p>
      <h3>Type and look</h3>
      <p>VT323, Share Tech Mono and IBM Plex Mono via Google Fonts. The display is modelled on the vector screens of the NORAD command centre as shown in <i>WarGames</i> (1983); the home map after Alighiero Boetti's <i>Mappa</i>. Portrait of Edward N. Luttwak by Elekes Andor, 2026, CC BY 4.0, Wikimedia Commons. Maps drawn with D3.</p>
      <h3>Contact</h3>
      <p>To be added.</p>`;
  }

  function tipFor(id, fallbackName, ev) {
    const a = actors[id], name = a ? a.name : fallbackName;
    if (id === pov) return showTip(`<b>${esc(name)}</b><span class="k">Point of view</span>`, ev);
    if (!pov && homeLens) {
      const c = (lens => lens)(null);
      if (homeLens.kind === "org") { const since = membersOf[homeLens.id][id]; return showTip(`<b>${esc(name)}</b>${since !== undefined ? `Member of ${esc(actors[homeLens.id].name)}${since ? " since " + esc(since) : ""}` : "Not a member"}`, ev); }
      const iss = ISSUES[homeLens.id];
      if (iss.kind === "recognition") { const r = (recog[iss.target] || {})[id]; return showTip(`<b>${esc(name)}</b>${id === iss.target ? "The subject" : r ? REC_LABEL[r] : "No data"}`, ev); }
      const v = voteOn(iss.symbol, id); return showTip(`<b>${esc(name)}</b>${v ? VOTE_LBL[VOTE_CLS[v]] : "Did not vote / not a member"} on ${esc(iss.symbol)}`, ev);
    }
    if (!pov) return showTip(`<b>${esc(name)}</b><span class="k">${a && a.card === "full" ? "Has a card - click to see the world as it sees it" : a && (hasVotes(a.id) || hasClubs(a.id) || hasRecog(a.id)) ? "Data only - click to see the world from its seat" : a ? "Actor without data yet" : "Not an actor yet"}</span>`, ev);
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
    showTip(`<b>${esc(name)}</b>${GRADE_LABEL[st.grade]} · ${TREND_SIGN[st.trend]} ${TREND[st.trend]} · ${BOND_LABEL[st.bond].toLowerCase()} · confidence ${st.confidence}${st.stale ? " · stale" : ""}<br><span class="k">${esc(st.note || "")}</span>`, ev);
  }

  // ---------- dossier with footnotes
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let notes = [];
  function fn(sources) {
    return (sources || []).map(s => {
      let i = notes.findIndex(n => n.url === s.url);
      if (i < 0) { notes.push(s); i = notes.length - 1; }
      return `<sup class="fn" data-n="${i}">${i + 1}</sup>`;
    }).join(`<sup class="fn-sep">,</sup>`);
  }
  const badge = x => `<span class="badge ${x.confidence}">${x.confidence}</span>${x.stale ? ' <span class="stale">stale</span>' : ""}`;
  const claimList = (items, ordered) =>
    `<${ordered ? "ol" : "ul"}>` + items.map(it => `<li>${esc(it.text)}${fn(it.sources)}${badge(it)}</li>`).join("") + `</${ordered ? "ol" : "ul"}>`;
  const notesHtml = () => notes.length ? `<h3>Sources</h3><ol class="fn-list">` + notes.map(s =>
    `<li><span class="t">T${s.tier}</span><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · ${esc(s.publisher)} · ${esc(s.date)}</li>`).join("") + `</ol>` : "";

  function renderDossier(id) {
    const a = actors[id];
    const el = document.getElementById("dossier");
    setView("dossier", false);
    notes = [];
    let html;
    const flag = a.flag ? a.flag : a.iso2 ? `https://flagcdn.com/w160/${a.iso2}.png` : null;
    const head = `<div class="head">${flag ? `<img class="flag" src="${esc(flag)}" alt="Flag of ${esc(a.name)}">` : ""}<div><h2>${esc(a.name)}</h2>` +
      `<p class="sub">${esc(a.type)} · seat ${esc(a.seat)} · ${a.regions.join(", ")}${a.card === "full" ? ` · card verified ${esc(a.last_verified)}` : ""}${a.stale ? ' · <span class="stale">stale</span>' : ""}` +
      `${a.wikipedia ? ` · <a href="${esc(a.wikipedia)}" target="_blank" rel="noopener">Wikipedia ↗</a>` : ""}</p></div></div>`;
    if (a.card !== "full") {
      const st = stanceOf(id);
      html = head + `<p class="empty">No grand-strategy card yet: what follows comes from datasets only (UN General Assembly votes, memberships from Wikidata).</p>` +
        (st && pov ? `<h3>As ${esc(actors[pov].name)} sees it</h3><p><b>${GRADE_LABEL[st.grade]}</b>, ${TREND[st.trend]}, ${BOND_LABEL[st.bond].toLowerCase()}${badge(st)}<br>${esc(st.note || "")}${fn(st.sources)}</p>` : "") +
        ungaHtml(id) + relationsHtml(id);
    } else {
      const gs = a.grand_strategy;
      const byDomain = d3.group(gs.means, m => m.domain);
      html = head + `
        <h3>Grand strategy</h3>
        <h4>Objectives, ranked</h4>${claimList(gs.objectives, true)}
        <h4>Means</h4>${[...byDomain].map(([d, ms]) => `<h4>${esc(d)}</h4>${claimList(ms, false)}`).join("")}
        <h4>Constraints</h4>${claimList(gs.constraints, false)}
        <h4>Paradoxes</h4>${claimList(gs.paradoxes, true)}
        <h4>Reading</h4><p class="reading">${esc(gs.reading)}</p>
        <h3>The world as ${esc(a.name)} sees it</h3>
        <table class="tbl"><thead><tr><th>Toward</th><th>Posture</th><th>Bond</th><th>Why this reading</th></tr></thead><tbody>
        ${(data.stances[id] || []).map(s => `<tr><td><b>${esc(actors[s.toward].name)}</b><br><span class="meta">since ${esc(s.since)}</span></td>
          <td><span class="sw" style="background:${gradeSwatch(s.grade)};border-color:${gradeBorder(s.grade)}"></span>${GRADE_LABEL[s.grade]}<br><span class="meta">${TREND_SIGN[s.trend]} ${TREND[s.trend]}${badge(s)}</span></td>
          <td>${BOND_LABEL[s.bond]}</td>
          <td class="note">${esc(s.note || "")}${fn(s.sources)}</td></tr>`).join("")}
        </tbody></table>` + ungaHtml(id) + relationsHtml(id);
    }
    el.innerHTML = html + notesHtml();
    el.querySelectorAll("sup.fn").forEach(s => {
      const n = notes[+s.dataset.n];
      s.onmousemove = ev => showTip(`<b>Source ${+s.dataset.n + 1} · tier ${n.tier}</b>${esc(n.title)}<br><span class="k">${esc(n.publisher)} · ${esc(n.date)}</span>`, ev);
      s.onmouseleave = hideTip;
      s.onclick = () => el.querySelector(".fn-list").scrollIntoView({ behavior: "smooth" });
    });
    window.scrollTo(0, 0);
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
      Closest: ${top.map(([c, x]) => `${esc(actors[c].name)} ${pct(x)}`).join(", ")}. Furthest: ${low.map(([c, x]) => `${esc(actors[c].name)} ${pct(x)}`).join(", ")}.
      <span class="meta">Share of recorded votes cast the same way, pairs with at least 20 common votes. Source: UN Digital Library voting records, harvested by tools/datasets.</span></p>` +
      (lms.length ? `<table class="tbl"><thead><tr><th>Date</th><th>Resolution</th><th>${esc(a_name(id))}</th></tr></thead><tbody>` +
        lms.map(l => `<tr><td>${esc(l.date)}</td><td><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.symbol)}</a> ${esc(l.label)}</td><td><b>${word[l.vote] || l.vote}</b></td></tr>`).join("") + `</tbody></table>` : "");
  }
  const a_name = id => actors[id].name;

  function relationsHtml(id) {
    const out = data.relations.filter(r => r.from === id && !(r.dataset === "unga-votes")), inn = data.relations.filter(r => r.to === id && !(r.dataset === "unga-votes"));
    const block = (rows, dir) => data.layers.map(l => {
      const rs = rows.filter(r => r.layer === l);
      if (!rs.length) return "";
      return `<h4>${LAYER_LABEL[l]}</h4>` + rs.map(r => `<div class="rel" style="border-color:${layerColor(l)}">
        <div class="hd"><b>${dir === "out" ? "→ " + esc(actors[r.to].name) : "← " + esc(actors[r.from].name)}</b> · ${esc(r.type.replace(/_/g, " "))} · ${esc(r.since)}${r.until && r.until !== r.since ? " – " + esc(r.until) : ""}${badge(r)}</div>
        <div>${r.value !== undefined ? `<span class="val">${esc(r.value)} ${esc(String(r.unit).replace(/_/g, " "))}</span> · ` : ""}${esc(r.summary)}${fn(r.sources)}</div>
        ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}
        ${r.claims ? `<div class="note">Contested: ` + r.claims.map(c => `<b>${esc(actors[c.by].name)}</b> says ${esc(c.text)}${fn([{ url: c.source, title: c.text, publisher: actors[c.by].name, date: "", tier: 4 }])}`).join("; ") + `</div>` : ""}
        </div>`).join("");
    }).join("");
    return (out.length ? `<h3>Relations from ${esc(actors[id].name)}</h3>` + block(out, "out") : "") +
      (inn.length ? `<h3>Relations toward ${esc(actors[id].name)}</h3>` + block(inn, "in") : "") +
      (!out.length && !inn.length ? `<p class="empty">No relation rows yet.</p>` : "");
  }

  window.addEventListener("resize", () => { if (view === "map") drawMap(); });
  apply(location.hash);
})();
