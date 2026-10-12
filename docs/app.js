/* Grand Strategy - renders docs/data.json (compiled from data/ by tools/build.py).
   Two views: the situation map from the point-of-view actor (posture as colour, bond as
   screen, relations as arrows by layer) and the dossier with footnoted sources. */
(async function () {
  const [data, world] = await Promise.all([
    fetch("data.json" + (document.querySelector('script[src^="app.js"]').src.split("?")[1] ? "?" + document.querySelector('script[src^="app.js"]').src.split("?")[1] : "")).then(r => r.json()),
    fetch("world.geojson").then(r => r.json()),
  ]);

  const GRADE_LABEL = {
    own_territory: "Own territory", claimed_territory: "Claimed, not controlled", ally: "Ally",
    reluctant_ally: "Reluctant ally", partner: "Partner", reluctant_partner: "Reluctant partner",
    neutral: "Neutral / no stance", rival: "Rival", adversary: "Adversary",
  };
  const BOND_LABEL = { kin: "Kin - shared identity", affinity: "Affinity", none: "No standing tie", grievance: "Grievance - open wound" };
  const LAYER_LABEL = { objective: "Objectives", alignment: "Alignments", dependency: "Dependencies", action: "Actions" };
  const LAYER_DASH = { objective: "", alignment: "", dependency: "6 4", action: "1.5 3.5" };
  const LAYER_W = { objective: 2.4, alignment: 1.3, dependency: 1.5, action: 1.6 };
  const TREND = { warming: "warming", stable: "stable", cooling: "cooling" };
  const TREND_SIGN = { warming: "↗", stable: "→", cooling: "↘" };
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const gradeColor = g => css("--g-" + g);
  const layerColor = l => css("--l-" + l);

  const actors = Object.fromEntries(data.actors.map(a => [a.id, a]));
  const fullActors = data.actors.filter(a => a.card === "full");
  const feature = Object.fromEntries(world.features.map(f => [f.id, f]));
  let pov = fullActors[0].id;
  let view = "map";
  let mapMode = "near";
  const layersOn = { objective: true, alignment: true, dependency: true, action: false };

  // ---------- chrome
  document.getElementById("meta").innerHTML =
    `Situation map · pilot: Western Balkans<br>compiled ${data.generated} · ${fullActors.length} card${fullActors.length > 1 ? "s" : ""}, ${data.actors.length} actors<br>${Object.values(data.stances).flat().length} stances · ${data.relations.length} relations`;

  const povSel = document.getElementById("pov");
  fullActors.forEach(a => povSel.add(new Option(`The world as ${a.name} sees it`, a.id)));
  povSel.onchange = () => { pov = povSel.value; renderAll(); };

  document.querySelectorAll(".tab").forEach(b => b.onclick = () => setView(b.dataset.view));
  function setView(v, render = true) {
    view = v;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("is-on", b.dataset.view === v));
    document.querySelectorAll(".view").forEach(s => s.classList.toggle("is-on", s.id === "view-" + v));
    if (!render) return;
    if (v === "map") drawMap();
    if (v === "dossier") showDossier(pov);
  }

  const layersEl = document.getElementById("layers");
  data.layers.forEach(l => {
    const lab = document.createElement("label");
    lab.innerHTML = `<input type="checkbox" ${layersOn[l] ? "checked" : ""}><span class="ln" style="border-color:${layerColor(l)};border-top-style:${l === "dependency" ? "dashed" : l === "action" ? "dotted" : "solid"}"></span>${LAYER_LABEL[l]}`;
    lab.querySelector("input").onchange = e => { layersOn[l] = e.target.checked; if (view === "map") drawArrows(); };
    layersEl.appendChild(lab);
  });

  const stanceOf = id => (data.stances[pov] || []).find(s => s.toward === id);
  const gradeOf = id => id === pov ? "own_territory" : (stanceOf(id) ? stanceOf(id).grade : "neutral");

  // CSS renderings of the same screens, for the legend and the dossier table
  const FRAC = { ally: .72, reluctant_ally: .45, partner: .26, reluctant_partner: .12, rival: .3, adversary: .72 };
  function gradeSwatch(g) {
    if (g === "own_territory") return "var(--ink-a)";
    if (g === "claimed_territory") return "repeating-linear-gradient(45deg, var(--ink-b) 0 1.6px, transparent 1.6px 5px)";
    if (g === "neutral") return "var(--land)";
    const ink = ["rival", "adversary"].includes(g) ? "var(--ink-b)" : "var(--ink-a)";
    const r = Math.sqrt(16 * FRAC[g] / Math.PI);
    return `radial-gradient(${ink} ${r.toFixed(2)}px, transparent ${(r + .15).toFixed(2)}px) 0 0 / 4px 4px`;
  }
  function renderLegend() {
    const el = document.getElementById("legend");
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
    const inkA = css("--ink-a"), inkB = css("--ink-b");
    // posture = dot screen of one ink, denser is stronger. radius from the covered fraction on a 4-unit grid
    const SCREEN = { ally: [inkA, .72], reluctant_ally: [inkA, .45], partner: [inkA, .26], reluctant_partner: [inkA, .12], rival: [inkB, .3], adversary: [inkB, .72] };
    Object.entries(SCREEN).forEach(([g, [color, frac]]) => {
      const r = Math.sqrt(16 * frac / Math.PI);
      defs.append("pattern").attr("id", "s-" + g).attr("width", 4).attr("height", 4).attr("patternUnits", "userSpaceOnUse")
        .append("circle").attr("cx", 2).attr("cy", 2).attr("r", r).attr("fill", color);
    });
    // claimed, not controlled: vermilion hatch
    const hatch = defs.append("pattern").attr("id", "hatch").attr("width", 5).attr("height", 5).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    hatch.append("rect").attr("width", 1.8).attr("height", 5).attr("fill", inkB);
    data.layers.forEach(l => {
      defs.append("marker").attr("id", "arrow-" + l).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5)
        .attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 9).attr("markerHeight", 9).attr("orient", "auto-start-reverse")
        .append("path").attr("d", "M0,0 L10,5 L0,10 L3,5 Z").attr("fill", layerColor(l));
    });
    // keep screens, arrowheads, dashes and type at screen size whatever the zoom
    function rescale(k) {
      defs.selectAll("pattern").attr("patternTransform", function () { return (this.id === "hatch" ? "rotate(45) " : "") + `scale(${1 / k})`; });
      defs.selectAll("marker").attr("markerWidth", 9 / k).attr("markerHeight", 9 / k);
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
      g.selectAll(".arrows path").attr("stroke-width", function () { return +this.dataset.w / k; })
        .attr("stroke-dasharray", function () { const d = this.dataset.dash; return d ? d.split(" ").map(v => v / k).join(" ") : null; });
    }

    svg.append("rect").attr("width", width).attr("height", height).attr("fill", css("--paper"));
    const g = svg.append("g");
    g.append("path").datum(d3.geoGraticule10()).attr("d", path).attr("fill", "none").attr("stroke", css("--grat")).attr("stroke-width", .4);

    const countries = g.append("g");
    // base: every country in the land tint
    countries.selectAll("path.c").data(world.features).join("path").attr("class", "c")
      .attr("d", path).attr("fill", land)
      .attr("stroke", css("--coast")).attr("stroke-width", .5).attr("stroke-linejoin", "round")
      .style("cursor", f => actors[f.id] ? "pointer" : "default")
      .on("mousemove", (ev, f) => tipFor(f.id, f.properties.name, ev))
      .on("mouseleave", hideTip)
      .on("click", (ev, f) => { if (actors[f.id]) showDossier(f.id); });
    // posture screens over the stanced countries
    countries.selectAll("path.p").data(world.features.filter(f => f.id === pov || stanceOf(f.id))).join("path").attr("class", "p")
      .attr("d", path).attr("pointer-events", "none")
      .attr("fill", f => {
        if (f.id === pov) return inkA;
        const gr = stanceOf(f.id).grade;
        return gr === "claimed_territory" ? "url(#hatch)" : gr === "neutral" ? "none" : `url(#s-${gr})`;
      });
    // bond: a band inside the border in the bond's ink - navy for kin, vermilion for grievance, none otherwise.
    // each band is clipped to its own country so it never paints the neighbour
    const bonded = world.features.filter(f => stanceOf(f.id) && ["kin", "grievance"].includes(stanceOf(f.id).bond));
    bonded.forEach(f => defs.append("clipPath").attr("id", "clip-" + f.id).append("path").attr("d", path(f)));
    countries.selectAll("path.bond").data(bonded).join("path").attr("class", "bond")
      .attr("d", path).attr("fill", "none").attr("pointer-events", "none").attr("stroke-linejoin", "round")
      .attr("clip-path", f => `url(#clip-${f.id})`)
      .attr("stroke", f => stanceOf(f.id).bond === "kin" ? inkA : inkB).attr("stroke-width", 3.6);

    // non-state actors and seats
    const seats = g.append("g").attr("class", "seats");
    const nonState = data.actors.filter(a => !feature[a.id] && (a.id === pov || stanceOf(a.id)));
    seats.selectAll("rect").data(nonState).join("rect")
      .attr("x", a => proj(a.coords)[0] - 4).attr("y", a => proj(a.coords)[1] - 4).attr("width", 8).attr("height", 8)
      .attr("fill", a => ["rival", "adversary", "claimed_territory"].includes(gradeOf(a.id)) ? inkB : gradeOf(a.id) === "neutral" ? land : inkA).attr("stroke", ink).attr("stroke-width", .8)
      .style("cursor", "pointer")
      .on("mousemove", (ev, a) => tipFor(a.id, a.name, ev)).on("mouseleave", hideTip).on("click", (ev, a) => showDossier(a.id));

    // labels: condensed capitals for every actor with a stance
    const labelled = data.actors.filter(a => a.id === pov || stanceOf(a.id));
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

    const arrows = g.append("g").attr("class", "arrows");
    mapState = { svg, g, proj, path, width, height, arrows, labels };

    // framing: the whole world, or a neighbourhood around the point of view
    const zoom = d3.zoom().scaleExtent([1, 14]).on("zoom", ev => {
      g.attr("transform", ev.transform);
      rescale(ev.transform.k);
    });
    mapState.rescale = rescale;
    svg.call(zoom);
    function frame(mode) {
      let t = d3.zoomIdentity;
      const home = feature[pov] ? path.bounds(feature[pov]) : null;
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
    ctl.append("xhtml:div").attr("class", "frame-ctl").html(
      `<button class="frame-btn" data-mode="near">Neighbourhood</button><button class="frame-btn" data-mode="world">World</button>`);
    ctl.selectAll("button").on("click", ev => { mapMode = ev.currentTarget.dataset.mode; frame(mapMode); });
    frame(mapMode);
    drawArrows();

    document.getElementById("map-note").innerHTML =
      `<b>${actors[pov].name}</b> in solid navy. Dots are the posture, denser is stronger: navy for the friendly side, vermilion for the hostile; hatched = claimed, not controlled. A heavy outline is the bond: navy = kin, vermilion = grievance. Arrows run from ${actors[pov].name}'s seat to the counterpart, one per layer; several rows between the same pair share an arrow. Hover for the rows; click a country or seat for its dossier; scroll to zoom.`;
  }

  function drawArrows() {
    if (!mapState) return;
    const { proj, arrows } = mapState;
    const from = proj(actors[pov].coords);
    const groups = d3.group(data.relations.filter(r => r.from === pov && layersOn[r.layer]), r => r.to + "|" + r.layer);
    const items = [...groups].map(([key, rows]) => ({ to: key.split("|")[0], layer: key.split("|")[1], rows }));
    const k = d3.zoomTransform(mapState.svg.node()).k || 1;
    arrows.selectAll("path").data(items, d => d.to + d.layer).join("path")
      .attr("d", d => {
        const to = proj(actors[d.to].coords);
        const dx = to[0] - from[0], dy = to[1] - from[1], dist = Math.hypot(dx, dy) || 1;
        const bend = (data.layers.indexOf(d.layer) - 1.5) * 0.12;
        const mx = (from[0] + to[0]) / 2 - dy * bend, my = (from[1] + to[1]) / 2 + dx * bend;
        const shrink = 6 / dist; // stop short of the seat
        const ex = to[0] - dx * shrink, ey = to[1] - dy * shrink;
        return `M${from[0]},${from[1]} Q${mx},${my} ${ex},${ey}`;
      })
      .attr("data-w", d => LAYER_W[d.layer]).attr("data-dash", d => LAYER_DASH[d.layer])
      .attr("fill", "none").attr("stroke", d => layerColor(d.layer)).attr("stroke-linecap", "round")
      .attr("marker-end", d => `url(#arrow-${d.layer})`).attr("opacity", .9)
      .style("cursor", "pointer")
      .on("mousemove", (ev, d) => showTip(`<b>${actors[pov].name} → ${actors[d.to].name}</b><span class="k">${LAYER_LABEL[d.layer]}</span><ul>` +
        d.rows.map(r => `<li>${esc(r.type.replace(/_/g, " "))} · ${esc(r.since)}${r.value !== undefined ? ` · <b style="display:inline;text-transform:none;letter-spacing:0">${esc(r.value)} ${esc(String(r.unit).replace(/_/g, " "))}</b>` : ""} · ${r.confidence}<br>${esc(r.summary)}</li>`).join("") + `</ul>`, ev))
      .on("mouseleave", hideTip)
      .on("click", (ev, d) => showDossier(d.to));
    mapState.rescale(k);
  }

  function tipFor(id, fallbackName, ev) {
    const a = actors[id], name = a ? a.name : fallbackName;
    if (id === pov) return showTip(`<b>${esc(name)}</b><span class="k">Point of view</span>`, ev);
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
      html = head + `<p class="empty">Stub: this actor exists so that others can relate to it. No grand-strategy card yet.</p>` +
        (st ? `<h3>As ${esc(actors[pov].name)} sees it</h3><p><b>${GRADE_LABEL[st.grade]}</b>, ${TREND[st.trend]}, ${BOND_LABEL[st.bond].toLowerCase()}${badge(st)}<br>${esc(st.note || "")}${fn(st.sources)}</p>` : "") +
        relationsHtml(id);
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
        </tbody></table>` + relationsHtml(id);
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

  function relationsHtml(id) {
    const out = data.relations.filter(r => r.from === id), inn = data.relations.filter(r => r.to === id);
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

  function renderAll() { renderLegend(); if (view === "map") drawMap(); else showDossier(pov); }
  window.addEventListener("resize", () => { if (view === "map") drawMap(); });
  renderAll();
})();
