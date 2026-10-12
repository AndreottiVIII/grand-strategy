/* Grand Strategy - renders docs/data.json (compiled from data/ by tools/build.py).
   Three views: map (world as seen by the point-of-view actor), graph (relations), dossier. */
(async function () {
  const [data, world] = await Promise.all([
    fetch("data.json").then(r => r.json()),
    fetch("world.geojson").then(r => r.json()),
  ]);

  const GRADE_LABEL = {
    own_territory: "Own territory", claimed_territory: "Claimed territory", ally: "Ally",
    reluctant_ally: "Reluctant ally", partner: "Partner", reluctant_partner: "Reluctant partner",
    neutral: "Neutral", rival: "Rival", adversary: "Adversary",
  };
  const LAYER_LABEL = { objective: "Objective", alignment: "Alignment", dependency: "Dependency", action: "Action" };
  const TREND = { warming: "↗ warming", stable: "→ stable", cooling: "↘ cooling" };
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const gradeColor = g => css("--g-" + g);
  const layerColor = l => css("--l-" + l);

  const actors = Object.fromEntries(data.actors.map(a => [a.id, a]));
  const fullActors = data.actors.filter(a => a.card === "full");
  let pov = fullActors[0].id;
  let view = "map";
  let mapMode = "near";

  // ---------- chrome
  document.getElementById("meta").innerHTML =
    `Compiled ${data.generated} · ${data.actors.length} actors, ${fullActors.length} with a full card · ` +
    `${Object.values(data.stances).flat().length} stances · ${data.relations.length} relations<br>` +
    `<a href="https://github.com/AndreottiVIII/grand-strategy">Data and history on GitHub</a>`;

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
    if (v === "graph") drawGraph();
    if (v === "dossier") showDossier(pov);
  }

  const stanceOf = id => (data.stances[pov] || []).find(s => s.toward === id);
  const gradeOf = id => id === pov ? "own_territory" : (stanceOf(id) ? stanceOf(id).grade : "neutral");

  function renderList() {
    const ul = document.getElementById("actor-list");
    ul.innerHTML = "";
    [...data.actors].sort((a, b) => (a.card === b.card ? a.name.localeCompare(b.name) : a.card === "full" ? -1 : 1))
      .forEach(a => {
        const li = document.createElement("li");
        li.className = a.id === pov ? "is-pov" : "";
        li.innerHTML = `<span><span class="dot" style="background:${gradeColor(gradeOf(a.id))}"></span>${a.name}</span>` +
          `<span class="pill">${a.card === "full" ? "card" : a.type === "sub-state" ? "sub-state" : "stub"}</span>`;
        li.onclick = () => { if (a.card === "full") { pov = a.id; povSel.value = pov; renderAll(); } else { showDossier(a.id); } };
        ul.appendChild(li);
      });
  }

  function renderLegend() {
    const el = document.getElementById("legend");
    el.innerHTML = `<h3>Stance of ${actors[pov].name}</h3>` +
      data.grades.map(g => `<div class="row"><span class="sw ${g === "claimed_territory" ? "claimed" : ""}" style="background:${gradeColor(g)}"></span>${GRADE_LABEL[g]}</div>`).join("") +
      `<h3>Relation layers</h3>` +
      data.layers.map(l => `<div class="row"><span class="ln" style="background:${layerColor(l)}"></span>${LAYER_LABEL[l]}</div>`).join("");
  }

  // ---------- tooltip
  const tip = document.getElementById("tip");
  function showTip(html, ev) {
    tip.innerHTML = html; tip.hidden = false;
    const x = Math.min(ev.clientX + 14, window.innerWidth - 340), y = Math.min(ev.clientY + 14, window.innerHeight - 120);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };

  // ---------- map
  function drawMap() {
    const svg = d3.select("#map");
    svg.selectAll("*").remove();
    const { width, height } = svg.node().getBoundingClientRect();
    const proj = d3.geoNaturalEarth1().fitExtent([[10, 10], [width - 10, height - 10]], world);
    const path = d3.geoPath(proj);
    const focusIds = new Set([pov, ...(data.stances[pov] || []).map(s => s.toward)]);
    const focusFeatures = world.features.filter(f => focusIds.has(f.id));

    const defs = svg.append("defs");
    const pat = defs.append("pattern").attr("id", "hatch").attr("width", 6).attr("height", 6)
      .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    pat.append("rect").attr("width", 6).attr("height", 6).attr("fill", gradeColor("claimed_territory"));
    pat.append("rect").attr("width", 2.5).attr("height", 6).attr("fill", css("--sea")).attr("opacity", .55);

    svg.append("path").datum({ type: "Sphere" }).attr("d", path).attr("fill", css("--sea"));
    const g = svg.append("g");
    g.selectAll("path").data(world.features).join("path")
      .attr("d", path)
      .attr("fill", f => {
        const st = stanceOf(f.id);
        if (f.id === pov) return gradeColor("own_territory");
        if (!st) return css("--land");
        return st.grade === "claimed_territory" ? "url(#hatch)" : gradeColor(st.grade);
      })
      .attr("stroke", css("--border")).attr("stroke-width", .6)
      .style("cursor", f => actors[f.id] ? "pointer" : "default")
      .on("mousemove", (ev, f) => {
        const st = stanceOf(f.id);
        const name = actors[f.id] ? actors[f.id].name : f.properties.name;
        if (f.id === pov) return showTip(`<b>${name}</b><span class="k">Point of view</span>`, ev);
        if (!st) return showTip(`<b>${name}</b><span class="k">No recorded stance</span>`, ev);
        showTip(`<b>${name}</b>${GRADE_LABEL[st.grade]} · ${TREND[st.trend]} · confidence ${st.confidence}${st.stale ? " · stale" : ""}<br><span class="k">${st.note || ""}</span>`, ev);
      })
      .on("mouseleave", hideTip)
      .on("click", (ev, f) => { if (actors[f.id]) showDossier(f.id); });

    // zoom, with two framings: the whole world, or the countries this actor has a stance on
    const zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", ev => g.attr("transform", ev.transform));
    svg.call(zoom);
    function frame(mode) {
      let t = d3.zoomIdentity;
      if (mode === "near" && focusFeatures.length) {
        const [[x0, y0], [x1, y1]] = path.bounds({ type: "FeatureCollection", features: focusFeatures.filter(f => !["RUS", "USA", "CHN"].includes(f.id) || focusFeatures.length < 4) });
        const k = Math.min(12, .85 / Math.max((x1 - x0) / width, (y1 - y0) / height));
        t = d3.zoomIdentity.translate(width / 2 - k * (x0 + x1) / 2, height / 2 - k * (y0 + y1) / 2).scale(k);
      }
      svg.transition().duration(600).call(zoom.transform, t);
      document.querySelectorAll(".frame-btn").forEach(b => b.classList.toggle("is-on", b.dataset.mode === mode));
    }
    const ctl = svg.append("foreignObject").attr("x", 12).attr("y", 12).attr("width", 220).attr("height", 40);
    ctl.append("xhtml:div").attr("class", "frame-ctl").html(
      `<button class="frame-btn" data-mode="near">Neighbourhood</button><button class="frame-btn" data-mode="world">World</button>`);
    ctl.selectAll("button").on("click", (ev) => frame(ev.currentTarget.dataset.mode));
    frame(mapMode);
    ctl.selectAll("button").on("click.remember", (ev) => { mapMode = ev.currentTarget.dataset.mode; });

    const offMap = (data.stances[pov] || []).filter(s => !world.features.some(f => f.id === s.toward));
    document.getElementById("map-note").innerHTML =
      `<b>${actors[pov].name}</b> is drawn as own territory; hatched = claimed, not controlled. Grey = no recorded stance. Hover for the source grade; click a country for its dossier. ` +
      (offMap.length ? `Not drawable on the map: ` + offMap.map(s => `<b>${actors[s.toward].name}</b> (${GRADE_LABEL[s.grade].toLowerCase()})`).join(", ") + "." : "");
  }

  // ---------- graph
  function drawGraph() {
    const svg = d3.select("#graph");
    svg.selectAll("*").remove();
    const { width, height } = svg.node().getBoundingClientRect();
    const ids = new Set([pov]);
    (data.stances[pov] || []).forEach(s => ids.add(s.toward));
    data.relations.forEach(r => { if (r.from === pov || r.to === pov) { ids.add(r.from); ids.add(r.to); } });
    const nodes = [...ids].map(id => ({ id, ...actors[id] }));
    const links = data.relations.filter(r => ids.has(r.from) && ids.has(r.to)).map(r => ({ ...r, source: r.from, target: r.to }));

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(l => l.layer === "action" ? 170 : 130).strength(.4))
      .force("charge", d3.forceManyBody().strength(-520))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(34));

    const g = svg.append("g");
    svg.call(d3.zoom().scaleExtent([.4, 3]).on("zoom", ev => g.attr("transform", ev.transform)));

    const link = g.append("g").selectAll("path").data(links).join("path")
      .attr("fill", "none").attr("stroke", l => layerColor(l.layer)).attr("stroke-width", 2).attr("stroke-opacity", .55)
      .style("cursor", "pointer")
      .on("mousemove", (ev, l) => showTip(`<b>${actors[l.from].name} → ${actors[l.to].name}</b>${LAYER_LABEL[l.layer]} · ${l.type.replace(/_/g, " ")} · ${l.since}${l.until && l.until !== l.since ? " – " + l.until : ""} · confidence ${l.confidence}<br><span class="k">${l.summary}</span>`, ev))
      .on("mouseleave", hideTip)
      .on("click", () => showDossier(pov));

    const node = g.append("g").selectAll("g").data(nodes).join("g").style("cursor", "pointer")
      .call(d3.drag().on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on("end", (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
      .on("mousemove", (ev, d) => {
        const st = stanceOf(d.id);
        showTip(`<b>${d.name}</b>${d.id === pov ? "Point of view" : st ? `${GRADE_LABEL[st.grade]} · ${TREND[st.trend]} · confidence ${st.confidence}` : "No recorded stance"}<br><span class="k">${d.type}${d.card === "stub" ? " · stub, no card yet" : ""}</span>`, ev);
      })
      .on("mouseleave", hideTip)
      .on("click", (ev, d) => showDossier(d.id));

    node.append("circle").attr("r", d => d.id === pov ? 22 : d.card === "full" ? 16 : 12)
      .attr("fill", d => gradeColor(gradeOf(d.id)))
      .attr("stroke", css("--panel")).attr("stroke-width", 2);
    node.append("text").text(d => d.name).attr("dy", d => (d.id === pov ? 22 : 16) + 14).attr("text-anchor", "middle")
      .attr("font-size", 11).attr("fill", css("--ink")).attr("paint-order", "stroke").attr("stroke", css("--sea")).attr("stroke-width", 3);

    sim.on("tick", () => {
      link.attr("d", l => {
        const dx = l.target.x - l.source.x, dy = l.target.y - l.source.y, dr = Math.hypot(dx, dy) * 1.4;
        return `M${l.source.x},${l.source.y}A${dr},${dr} 0 0,1 ${l.target.x},${l.target.y}`;
      });
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    document.getElementById("graph-note").innerHTML =
      `Nodes coloured by <b>${actors[pov].name}</b>'s stance; each arc is one relation row, coloured by layer (several rows between the same pair draw as several arcs). Hover an arc for the row; drag nodes; scroll to zoom.`;
  }

  // ---------- dossier
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const srcHtml = srcs => (srcs || []).map(s =>
    `<span class="src"><span class="t">T${s.tier}</span><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · ${esc(s.publisher)} · ${esc(s.date)}</span>`).join("");
  const badge = x => `<span class="badge ${x.confidence}">${x.confidence}</span>${x.stale ? ' <span class="stale">stale</span>' : ""}`;
  const claimList = (items, ordered, extra = () => "") =>
    `<${ordered ? "ol" : "ul"}>` + items.map(it => `<li>${extra(it)}${esc(it.text)}${badge(it)}${srcHtml(it.sources)}</li>`).join("") + `</${ordered ? "ol" : "ul"}>`;

  function showDossier(id) {
    const a = actors[id];
    const el = document.getElementById("dossier");
    setView("dossier", false);
    if (a.card !== "full") {
      el.innerHTML = `<h2>${esc(a.name)}</h2><p class="sub">${esc(a.type)} · seat ${esc(a.seat)} · regions ${a.regions.join(", ")}</p>` +
        `<p class="empty">Stub: this actor exists as a node so that others can relate to it. No grand-strategy card yet.` +
        (stanceOf(id) ? `<br><br>As ${esc(actors[pov].name)} sees it: <b>${GRADE_LABEL[stanceOf(id).grade]}</b> (${TREND[stanceOf(id).trend]}, confidence ${stanceOf(id).confidence}). ${esc(stanceOf(id).note || "")}${srcHtml(stanceOf(id).sources)}` : "") +
        `</p>` + relationsHtml(id);
      return;
    }
    const gs = a.grand_strategy;
    const byDomain = d3.group(gs.means, m => m.domain);
    el.innerHTML = `
      <h2>${esc(a.name)}</h2>
      <p class="sub">${esc(a.type)} · seat ${esc(a.seat)} · regions ${a.regions.join(", ")} · card verified ${esc(a.last_verified)}${a.stale ? ' · <span class="stale">stale</span>' : ""}</p>
      <h3>Grand strategy</h3>
      <h4>Objectives, ranked</h4>${claimList(gs.objectives, true)}
      <h4>Means</h4>${[...byDomain].map(([d, ms]) => `<h4>${esc(d)}</h4>${claimList(ms, false)}`).join("")}
      <h4>Constraints</h4>${claimList(gs.constraints, false)}
      <h4>Paradoxes</h4>${claimList(gs.paradoxes, true)}
      <h4>Reading</h4><p class="reading">${esc(gs.reading)}</p>
      <h3>The world as ${esc(a.name)} sees it</h3>
      <table class="tbl"><thead><tr><th>Toward</th><th>Grade</th><th>Since</th><th>Conf.</th><th>Why this reading</th></tr></thead><tbody>
      ${(data.stances[id] || []).map(s => `<tr><td><b>${esc(actors[s.toward].name)}</b></td>
        <td><span class="sw" style="background:${gradeColor(s.grade)}"></span>${GRADE_LABEL[s.grade]}<br><span class="trend">${TREND[s.trend]}</span></td>
        <td>${esc(s.since)}</td><td>${badge(s)}</td><td class="note">${esc(s.note || "")}${srcHtml(s.sources)}</td></tr>`).join("")}
      </tbody></table>` + relationsHtml(id);
    window.scrollTo(0, 0);
  }

  function relationsHtml(id) {
    const out = data.relations.filter(r => r.from === id), inn = data.relations.filter(r => r.to === id);
    const block = (rows, dir) => data.layers.map(l => {
      const rs = rows.filter(r => r.layer === l);
      if (!rs.length) return "";
      return `<h4>${LAYER_LABEL[l]}</h4>` + rs.map(r => `<div class="rel" style="border-color:${layerColor(l)}">
        <div class="hd"><b>${dir === "out" ? "→ " + esc(actors[r.to].name) : "← " + esc(actors[r.from].name)}</b> · ${esc(r.type.replace(/_/g, " "))} · ${esc(r.since)}${r.until && r.until !== r.since ? " – " + esc(r.until) : ""}${badge(r)}</div>
        <div>${r.value !== undefined ? `<span class="val">${esc(r.value)} ${esc(String(r.unit).replace(/_/g, " "))}</span> · ` : ""}${esc(r.summary)}</div>
        ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}
        ${r.claims ? `<div class="note">Contested: ` + r.claims.map(c => `<b>${esc(actors[c.by].name)}</b> says ${esc(c.text)} (<a href="${esc(c.source)}" target="_blank" rel="noopener">source</a>)`).join("; ") + `</div>` : ""}
        ${srcHtml(r.sources)}</div>`).join("");
    }).join("");
    return (out.length ? `<h3>Relations from ${esc(actors[id].name)}</h3>` + block(out, "out") : "") +
      (inn.length ? `<h3>Relations toward ${esc(actors[id].name)}</h3>` + block(inn, "in") : "") +
      (!out.length && !inn.length ? `<p class="empty">No relation rows yet.</p>` : "");
  }

  function renderAll() { renderList(); renderLegend(); if (view === "map") drawMap(); else if (view === "graph") drawGraph(); else showDossier(pov); }
  window.addEventListener("resize", () => { if (view === "map") drawMap(); });
  renderAll();
})();
