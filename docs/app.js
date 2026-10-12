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
  const ISSUES = {
    TWN: { label: "Taiwan - who recognises the Republic of China", kind: "recognition", target: "TWN" },
    PSE: { label: "Palestine - who recognises the State of Palestine", kind: "recognition", target: "PSE" },
    XKX: { label: "Kosovo - who recognises it", kind: "recognition", target: "XKX" },
    UKR: { label: "Ukraine - the last General Assembly vote on the war", kind: "vote", symbol: "A/RES/ES-11/10" },
    SREB: { label: "Srebrenica - the 2024 genocide remembrance vote", kind: "vote", symbol: "A/RES/78/282" },
    GAZA: { label: "Gaza - the 2024 vote to end Israel's presence in the territories", kind: "vote", symbol: "A/RES/ES-10/24" },
  };
  const voteOn = (symbol, id) => { const l = (unga.landmarks[id] || []).find(x => x.symbol === symbol); return l ? l.vote : null; };
  const VOTE_CLS = { Y: "yes", N: "no", A: "abst" };
  const VOTE_LBL = { yes: "Voted in favour", no: "Voted against", abst: "Abstained" };
  const REC_LABEL = { yes: "Recognises", withdrew: "Recognised, then withdrew", no: "Does not recognise" };
  const voteClass = x => x == null ? null : VOTE_CLASSES.find(([t]) => x >= t)[1];
  const VOTE_LABEL = { v90: "Votes together 90% or more", v80: "80-89%", v70: "70-79%", v60: "60-69%", vlow: "Under 60%" };

  // ---------- chrome
  document.getElementById("meta").innerHTML =
    `Situation map · pilot: Western Balkans<br>compiled ${data.generated} · ${fullActors.length} card${fullActors.length > 1 ? "s" : ""}, ${data.actors.length} actors<br>${Object.values(data.stances).flat().length} stances · ${data.relations.length} relations`;

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
  function goHome(keepLens) { if (!keepLens) { homeLens = null; orgSel.value = ""; issueSel.value = ""; } pov = null; mapMode = "world"; povSel.value = ""; window.scrollTo(0, 0); renderLegend(); setView("map"); }
  function setPov(id) {
    pov = id; povSel.value = id; homeLens = null; orgSel.value = ""; issueSel.value = "";
    document.getElementById("home-menus").style.display = "none";
    lens = hasStances(id) ? "posture" : hasRecog(id) ? "recognition" : hasVotes(id) ? "votes" : "clubs";
    mapMode = hasStances(id) ? "near" : "world";
    renderLegend(); setView("map");
  }

  const orgSel = document.getElementById("orgsel"), issueSel = document.getElementById("issuesel");
  // official member counts, so the menu says when a list is short (Wikidata coverage is uneven)
  const EXPECTED = { "org-un": 193, "org-nato": 32, "org-eu": 27, "org-csto": 6, "org-sco": 10, "org-brics": 10, "org-opec": 12, "org-arab-league": 22, "org-au": 55, "org-asean": 11, "org-gcc": 6, "org-oic": 57, "org-osce": 57, "org-coe": 46, "org-cis": 10, "org-eaeu": 5, "org-oas": 35, "org-commonwealth": 56, "org-g7": 7, "org-g20": 19, "org-oecd": 38, "org-ecowas": 12, "org-aes": 3, "org-nam": 120, "org-cefta": 7, "org-mercosur": 5, "org-celac": 33, "org-saarc": 8, "org-pif": 18, "org-sadc": 16, "org-eac": 8, "org-ots": 5, "org-wto": 166, "org-icc": 125 };
  const orgs = data.actors.filter(a => a.type === "org" && membersOf[a.id] && a.id !== "org-un")
    .map(a => ({ a, n: Object.keys(membersOf[a.id]).length, exp: EXPECTED[a.id] || 0 }))
    .map(o => ({ ...o, ok: !o.exp || o.n >= 0.7 * o.exp }))
    .sort((x, y) => (y.ok - x.ok) || (y.n - x.n));
  orgs.forEach(o => { const opt = new Option(`${o.a.name} (${o.n}${o.exp && o.n < o.exp ? ` of ${o.exp}` : ""})`, o.a.id); if (!o.ok) { opt.disabled = true; opt.text += " - list incomplete"; } orgSel.add(opt); });
  Object.entries(ISSUES).forEach(([k, v]) => issueSel.add(new Option(v.label, k)));
  orgSel.onchange = () => { issueSel.value = ""; homeLens = orgSel.value ? { kind: "org", id: orgSel.value } : null; goHome(true); };
  issueSel.onchange = () => { orgSel.value = ""; homeLens = issueSel.value ? { kind: "issue", id: issueSel.value } : null; goHome(true); };
  document.querySelectorAll(".tab").forEach(b => b.onclick = () => setView(b.dataset.view));
  document.getElementById("home").onclick = ev => { ev.preventDefault(); goHome(); };
  function setView(v, render = true) {
    view = v;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("is-on", b.dataset.view === v));
    document.querySelectorAll(".view").forEach(s => s.classList.toggle("is-on", s.id === "view-" + v));
    if (!render) return;
    if (v === "map") drawMap();
    if (v === "dossier") showDossier(pov || fullActors[0].id);
  }

  const stanceOf = id => pov ? (data.stances[pov] || []).find(s => s.toward === id) : undefined;
  const gradeOf = id => id === pov ? "own_territory" : (stanceOf(id) ? stanceOf(id).grade : "neutral");

  // CSS renderings of the same screens, for the legend and the dossier table
  const FRAC = { ally: .85, reluctant_ally: .3, partner: .5, reluctant_partner: .15, rival: .25, adversary: .8 };
  const INK = { ally: "var(--ink-c)", reluctant_ally: "var(--ink-c)", partner: "var(--ink-a)", reluctant_partner: "var(--ink-a)", rival: "var(--ink-b)", adversary: "var(--ink-b)" };
  function gradeSwatch(g) {
    if (g === "own_territory") return "var(--ink-a)";
    if (g === "claimed_territory") return "repeating-linear-gradient(45deg, var(--ink-b) 0 1.6px, transparent 1.6px 5px)";
    if (g === "neutral") return "var(--land)";
    const r = Math.sqrt(16 * FRAC[g] / Math.PI);
    return `radial-gradient(${INK[g]} ${r.toFixed(2)}px, transparent ${(r + .15).toFixed(2)}px) 0 0 / 4px 4px`;
  }
  const VFRAC = { v90: [.85, "a"], v80: [.5, "a"], v70: [.26, "a"], v60: [.12, "a"], vlow: [.3, "b"],
                  c6: [.85, "a"], c4: [.5, "a"], c2: [.26, "a"], c1: [.12, "a"],
                  yes: [.85, "c"], withdrew: [.8, "b"], no: [.3, "b"], abst: [.26, "a"], member: [.85, "c"] };
  function voteSwatch(c) {
    const [f, ink] = VFRAC[c];
    const r = Math.sqrt(16 * f / Math.PI);
    return `radial-gradient(var(--ink-${ink}) ${r.toFixed(2)}px, transparent ${(r + .15).toFixed(2)}px) 0 0 / 4px 4px`;
  }
  function renderLegend() {
    const el = document.getElementById("legend");
    if (!pov && homeLens && homeLens.kind === "org") {
      const o = actors[homeLens.id], n = Object.keys(membersOf[homeLens.id]).length;
      el.innerHTML = `<h3>${esc(o.name)}</h3><div class="row"><span class="sw" style="background:${voteSwatch("member")} var(--land)"></span>Member (${n})</div><div class="row"><span class="sw"></span>Not a member</div><div class="row" style="color:var(--ink-3)">Memberships from the official list and Wikidata; some lists are hand-checked.</div>`;
      return;
    }
    if (!pov && homeLens && homeLens.kind === "issue") {
      const iss = ISSUES[homeLens.id];
      el.innerHTML = `<h3>${esc(iss.label)}</h3>` + (iss.kind === "recognition"
        ? ["yes", "withdrew", "no"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)} var(--land)"></span>${REC_LABEL[c]}</div>`).join("") + `<div class="row"><span class="sw"></span>No data</div>`
        : ["yes", "abst", "no"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)} var(--land)"></span>${VOTE_LBL[c]}</div>`).join("") + `<div class="row"><span class="sw"></span>Did not vote</div><div class="row" style="color:var(--ink-3)">${esc((unga.resolutions[iss.symbol] || {}).label || "")}, ${esc((unga.resolutions[iss.symbol] || {}).date || "")}, ${esc((unga.resolutions[iss.symbol] || {}).tally || "")}</div>`);
      return;
    }
    if (!pov) {
      el.innerHTML = `<h3>The world of today</h3><div class="row">Borders and flags as of ${data.generated}. Click a country that has a card to see the world as it sees it; ${fullActors.length} card${fullActors.length > 1 ? "s" : ""} so far: ${fullActors.map(a => a.name).join(", ")}.</div>`;
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
    if (lens === "votes") {
      el.innerHTML = `<h3>Votes with ${actors[pov].name}</h3><div class="row" style="color:var(--ink-3)">UN General Assembly, recorded votes ${unga.span || ""}</div>` +
        ["v90", "v80", "v70", "v60", "vlow"].map(c => `<div class="row"><span class="sw" style="background:${voteSwatch(c)} var(--land)"></span>${VOTE_LABEL[c]}</div>`).join("") +
        `<div class="row"><span class="sw"></span>Fewer than 20 common votes</div>`;
      return;
    }
    el.innerHTML = `<h3>Posture of ${actors[pov].name}</h3>` +
      data.grades.map(g => `<div class="row"><span class="sw" style="background:${gradeSwatch(g)} var(--land)"></span>${GRADE_LABEL[g]}</div>`).join("") +
      `<h3>Bond</h3>
       <div class="row"><span class="sw" style="box-shadow:inset 0 0 0 2.5px var(--ink-a)"></span>Kin - shared identity</div>
       <div class="row"><span class="sw" style="box-shadow:inset 0 0 0 2.5px var(--ink-b)"></span>Grievance - open wound</div>
       <div class="row"><span class="sw"></span>Affinity or no standing tie</div>`;
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
    const inkA = css("--ink-a"), inkB = css("--ink-b"), inkC = css("--ink-c");
    // posture = dot screen, one ink per side (green allies, navy partners, vermilion hostile), denser is stronger
    const SCREEN = { ally: [inkC, .85], reluctant_ally: [inkC, .3], partner: [inkA, .5], reluctant_partner: [inkA, .15], rival: [inkB, .25], adversary: [inkB, .8] };
    Object.entries(SCREEN).forEach(([g, [color, frac]]) => {
      const r = Math.sqrt(16 * frac / Math.PI);
      defs.append("pattern").attr("id", "s-" + g).attr("width", 4).attr("height", 4).attr("patternUnits", "userSpaceOnUse")
        .append("circle").attr("cx", 2).attr("cy", 2).attr("r", r).attr("fill", color);
    });
    // home: every country wears its flag of today
    if (!pov && !homeLens) world.features.forEach(f => {
      if (!iso2[f.id]) return;
      defs.append("pattern").attr("id", "flag-" + f.id).attr("width", 1).attr("height", 1).attr("patternContentUnits", "objectBoundingBox")
        .append("image").attr("href", `https://flagcdn.com/w320/${iso2[f.id]}.png`).attr("width", 1).attr("height", 1).attr("preserveAspectRatio", "xMidYMid slice");
    });
    Object.entries(VFRAC).forEach(([c, [frac, ink]]) => {
      const r = Math.sqrt(16 * frac / Math.PI);
      defs.append("pattern").attr("id", "s-" + c).attr("width", 4).attr("height", 4).attr("patternUnits", "userSpaceOnUse")
        .append("circle").attr("cx", 2).attr("cy", 2).attr("r", r).attr("fill", ink === "a" ? inkA : ink === "c" ? inkC : inkB);
    });
    // claimed, not controlled: vermilion hatch
    const hatch = defs.append("pattern").attr("id", "hatch").attr("width", 5).attr("height", 5).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    hatch.append("rect").attr("width", 1.8).attr("height", 5).attr("fill", inkB);
    // keep screens, arrowheads, dashes and type at screen size whatever the zoom
    function rescale(k) {
      defs.selectAll("pattern").filter(function () { return !this.id.startsWith("flag-"); }).attr("patternTransform", function () { return (this.id === "hatch" ? "rotate(45) " : "") + `scale(${1 / k})`; });
      g.selectAll("path.c").attr("stroke-width", .5 / k);
      g.selectAll("path.bond").attr("stroke-width", 3.6 / k);
      // a label shows only when its country is wide enough on screen to carry it (the point of view always does)
      g.selectAll(".labels text").attr("font-size", 9.5 / k).attr("stroke-width", 2.2 / k)
        .attr("opacity", a => {
          if (a.id === pov || !feature[a.id]) return 1;
          const [[x0], [x1]] = path.bounds(feature[a.id]);
          return (x1 - x0) * k >= (a.short || a.name).length * 5.2 ? 1 : 0;
        });
      g.selectAll(".seats rect").attr("transform", a => { const [x, y] = proj(a.coords); return `translate(${x},${y}) scale(${1 / k}) translate(${-x},${-y})`; });
    }

    svg.append("rect").attr("width", width).attr("height", height).attr("fill", css("--paper"));
    const g = svg.append("g");

    const countries = g.append("g");
    // base: every country in the land tint
    countries.selectAll("path.c").data(world.features).join("path").attr("class", "c")
      .attr("d", path).attr("fill", f => !pov && !homeLens && iso2[f.id] ? `url(#flag-${f.id})` : land)
      .attr("stroke", css("--coast")).attr("stroke-width", .5).attr("stroke-linejoin", "round")
      .style("cursor", f => actors[f.id] ? "pointer" : "default")
      .on("mousemove", (ev, f) => { tipFor(f.id, f.properties.name, ev); lightCard(f.id); })
      .on("mouseleave", () => { hideTip(); lightCard(null); })
      .on("click", (ev, f) => { if (!actors[f.id]) return; if (!pov && (actors[f.id].card === "full" || hasVotes(f.id) || hasStances(f.id) || hasClubs(f.id) || hasRecog(f.id))) setPov(f.id); else showDossier(f.id); });
    // posture screens over the stanced countries
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
    const screened = !pov ? (homeLens ? world.features.filter(f => lensClass(f.id)) : []) : lens === "posture" ? world.features.filter(f => f.id === pov || stanceOf(f.id)) : world.features.filter(f => f.id === pov || lensClass(f.id));
    countries.selectAll("path.p").data(screened).join("path").attr("class", "p")
      .attr("d", path).attr("pointer-events", "none")
      .attr("fill", f => {
        if (f.id === pov) return inkA;
        if (!pov || lens !== "posture") return `url(#s-${lensClass(f.id)})`;
        const gr = stanceOf(f.id).grade;
        return gr === "claimed_territory" ? "url(#hatch)" : gr === "neutral" ? "none" : `url(#s-${gr})`;
      });
    // bond: a band inside the border in the bond's ink - navy for kin, vermilion for grievance, none otherwise.
    // each band is clipped to its own country so it never paints the neighbour
    const bonded = lens !== "posture" ? [] : world.features.filter(f => stanceOf(f.id) && ["kin", "grievance"].includes(stanceOf(f.id).bond));
    bonded.forEach(f => defs.append("clipPath").attr("id", "clip-" + f.id).append("path").attr("d", path(f)));
    countries.selectAll("path.bond").data(bonded).join("path").attr("class", "bond")
      .attr("d", path).attr("fill", "none").attr("pointer-events", "none").attr("stroke-linejoin", "round")
      .attr("clip-path", f => `url(#clip-${f.id})`)
      .attr("stroke", f => stanceOf(f.id).bond === "kin" ? inkA : inkB).attr("stroke-width", 3.6);

    // non-state actors and seats
    const seats = g.append("g").attr("class", "seats");
    const nonState = pov && lens === "posture" ? data.actors.filter(a => !feature[a.id] && (a.id === pov || stanceOf(a.id))) : [];
    seats.selectAll("rect").data(nonState).join("rect")
      .attr("x", a => proj(a.coords)[0] - 4).attr("y", a => proj(a.coords)[1] - 4).attr("width", 8).attr("height", 8)
      .attr("fill", a => { const g = gradeOf(a.id); return ["rival", "adversary", "claimed_territory"].includes(g) ? inkB : ["ally", "reluctant_ally"].includes(g) ? inkC : g === "neutral" ? land : inkA; }).attr("stroke", ink).attr("stroke-width", .8)
      .style("cursor", "pointer")
      .on("mousemove", (ev, a) => { tipFor(a.id, a.name, ev); lightCard(a.id); }).on("mouseleave", () => { hideTip(); lightCard(null); }).on("click", (ev, a) => showDossier(a.id));

    // labels: condensed capitals for every actor with a stance
    const labelled = !pov ? [] : lens !== "posture" ? data.actors.filter(a => a.id === pov) : data.actors.filter(a => a.id === pov || stanceOf(a.id));
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
      .attr("font-family", "Archivo Narrow, Arial Narrow, sans-serif").attr("font-weight", 700)
      .attr("letter-spacing", ".1em").attr("fill", a => a.id === pov ? css("--paper") : ink)
      .attr("paint-order", "stroke").attr("stroke", a => a.id === pov ? inkA : sea).attr("stroke-opacity", .9)
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
    ctl.selectAll("button[data-lens]").on("click", ev => { lens = ev.currentTarget.dataset.lens; renderLegend(); drawMap(); });
    frame(mapMode);
    rescale(d3.zoomTransform(svg.node()).k || 1);
    renderRelPanel();
    svg.selectAll(".frame-btn[data-mode]").classed("is-on", function () { return this.dataset.mode === mapMode; });

    document.getElementById("map-note").innerHTML = pov && lens === "clubs"
      ? `<b>${actors[pov].name}</b> in solid navy; every other country screened by how many of ${actors[pov].name}'s organisations it also belongs to (memberships from Wikidata, official member lists as source). Hover for the list.`
      : pov && lens === "recognition"
      ? `<b>${actors[pov].name}</b> in solid navy; green = recognises, vermilion = does not, dense vermilion = recognised and then withdrew. From Wikipedia's recognition tables, each row with its own citation where one exists.`
      : pov && lens === "votes"
      ? `<b>${actors[pov].name}</b> in solid navy; every other member screened by how often it voted the same way in the General Assembly (${unga.span || ""}, recorded votes only, pairs with at least 20 common votes). Navy = votes together, vermilion = votes apart. Hover for the figure; click for the dossier.`
      : pov
      ? `<b>${actors[pov].name}</b> in solid navy. Dots are the posture, denser is stronger: green for allies, navy for partners, vermilion for the hostile side; hatched = claimed, not controlled. A band inside a border is the standing bond: navy = kin, vermilion = grievance. Hover for the reading; click a country or seat for its dossier; scroll to zoom. The relations are listed below the map.`
      : homeLens && homeLens.kind === "org"
      ? `Members of <b>${esc(actors[homeLens.id].name)}</b> in green. Sources: the organisation's official member list; Wikidata as index. Click a country for its own point of view.`
      : homeLens
      ? `<b>${esc(ISSUES[homeLens.id].label)}</b>. ${ISSUES[homeLens.id].kind === "recognition" ? "From Wikipedia's recognition tables, each row with its own citation where one exists." : "UN General Assembly recorded vote, from the UN Digital Library."} Click a country for its own point of view.`
      : `Borders and flags of today. Click <b>${fullActors.map(a => a.name).join("</b>, <b>")}</b> to see the world as it sees it. Flags by flagcdn.`;
  }

  // ---------- relations panel under the map: one card per counterpart, ordered by how much is going on
  const flagOf = a => a.flag ? a.flag : a.iso2 ? `https://flagcdn.com/w80/${a.iso2}.png` : null;
  function lightCard(id) {
    document.querySelectorAll(".relcard").forEach(c => c.classList.toggle("is-lit", c.dataset.id === id));
  }
  function renderRelPanel() {
    const el = document.getElementById("relpanel");
    if (!pov) { el.innerHTML = ""; return; }
    const byTo = d3.group(data.relations.filter(r => r.from === pov), r => r.to);
    const counterparts = [...new Set([...byTo.keys(), ...(data.stances[pov] || []).map(s => s.toward)])]
      .map(id => ({ id, rows: byTo.get(id) || [], st: stanceOf(id) }))
      .sort((x, y) => y.rows.length - x.rows.length || x.id.localeCompare(y.id));
    el.innerHTML = `<h3>Relations of ${esc(actors[pov].name)} <span>${data.relations.filter(r => r.from === pov).length} rows · ${counterparts.length} counterparts</span></h3>` +
      `<div class="relgrid">` + counterparts.map(c => {
        const a = actors[c.id], flag = flagOf(a);
        const counts = data.layers.map(l => [l, c.rows.filter(r => r.layer === l).length]).filter(([, n]) => n);
        const latest = [...c.rows].sort((x, y) => String(y.since).localeCompare(String(x.since)))[0];
        return `<div class="relcard" data-id="${c.id}">
          <div class="rc-head">${flag ? `<img src="${esc(flag)}" alt="">` : `<span class="rc-noflag"></span>`}<b>${esc(a.name)}</b></div>
          <div class="rc-posture">${c.st ? `<span class="sw" style="background:${gradeSwatch(c.st.grade)} var(--land)"></span>${GRADE_LABEL[c.st.grade]} · ${TREND_SIGN[c.st.trend]} · ${BOND_LABEL[c.st.bond].split(" - ")[0].toLowerCase()}` : "no stance recorded"}</div>
          <div class="rc-counts">${counts.length ? counts.map(([l, n]) => `<span style="border-color:${layerColor(l)}">${n} ${LAYER_LABEL[l].toLowerCase()}</span>`).join("") : `<span class="rc-none">no rows yet</span>`}</div>
          ${latest ? `<div class="rc-latest"><i>${esc(latest.since)}</i> ${esc(latest.summary)}</div>` : ""}
        </div>`;
      }).join("") + `</div>`;
    el.querySelectorAll(".relcard").forEach(c => c.onclick = () => showDossier(c.dataset.id));
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

  function showDossier(id) {
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
          <td><span class="sw" style="background:${gradeSwatch(s.grade)} var(--land)"></span>${GRADE_LABEL[s.grade]}<br><span class="meta">${TREND_SIGN[s.trend]} ${TREND[s.trend]}${badge(s)}</span></td>
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

  function renderAll() { renderLegend(); if (view === "map") drawMap(); else showDossier(pov || fullActors[0].id); }
  window.addEventListener("resize", () => { if (view === "map") drawMap(); });
  renderAll();
})();
