// ===========================================================================
// STATISTICS & METHODS
// 13. Central Limit Theorem simulator (live)
// ===========================================================================
function dashCLT() {
  if (!document.getElementById("clt-stage")) return;
  const W = 860, H = 400, M = { t: 24, r: 24, b: 42, l: 48 };
  const half = (W - M.l - M.r - 30) / 2;
  const s = V.svg("#clt-stage", W, H, "Central limit theorem simulation");
  const popG = s.append("g"), meansG = s.append("g");

  s.append("text").attr("x", M.l + half / 2).attr("y", 16).attr("text-anchor", "middle")
    .style("font", "500 12px 'IBM Plex Mono', monospace").style("fill", "#27418f").text("POPULATION");
  s.append("text").attr("x", M.l + half + 30 + half / 2).attr("y", 16).attr("text-anchor", "middle")
    .style("font", "500 12px 'IBM Plex Mono', monospace").style("fill", "#27418f")
    .text("DISTRIBUTION OF SAMPLE MEANS");
  const counter = s.append("text").attr("x", W - M.r).attr("y", 16).attr("text-anchor", "end")
    .style("font", "500 11px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e");

  const DISTS = {
    exp: () => -Math.log(1 - Math.random()) * 0.22,
    uniform: () => Math.random(),
    bimodal: () => (Math.random() < 0.5 ? 0.25 : 0.75) + (Math.random() - 0.5) * 0.18,
  };
  let means = [], timer = null;

  function drawPopulation() {
    const kind = d3.select("#clt-dist").property("value");
    const draws = d3.range(6000).map(DISTS[kind]).filter((v) => v >= 0 && v <= 1);
    const bins = d3.bin().domain([0, 1]).thresholds(36)(draws);
    const x = d3.scaleLinear().domain([0, 1]).range([M.l, M.l + half]);
    const y = d3.scaleLinear().domain([0, d3.max(bins, (b) => b.length)]).range([H - M.b, M.t + 10]);
    popG.selectAll("*").remove();
    popG.selectAll("rect").data(bins).enter().append("rect")
      .attr("x", (b) => x(b.x0) + 0.5).attr("y", (b) => y(b.length))
      .attr("width", (b) => Math.max(0, x(b.x1) - x(b.x0) - 1))
      .attr("height", (b) => H - M.b - y(b.length))
      .attr("fill", "#27418f").attr("fill-opacity", 0.75).attr("rx", 1.5);
    popG.append("line").attr("x1", M.l).attr("x2", M.l + half)
      .attr("y1", H - M.b).attr("y2", H - M.b).attr("stroke", "#1a1d26").attr("stroke-opacity", 0.4);
  }

  function drawMeans() {
    const x = d3.scaleLinear().domain([0, 1]).range([M.l + half + 30, W - M.r]);
    meansG.selectAll("*").remove();
    counter.text(`${means.length} samples`);
    if (!means.length) {
      meansG.append("text").attr("x", M.l + half + 30 + half / 2).attr("y", (H - M.b + M.t) / 2)
        .attr("text-anchor", "middle").style("font", "12px 'IBM Plex Mono', monospace")
        .style("fill", "#5a5f6e").text("Press \u201cDraw 200 samples\u201d \u2192");
      return;
    }
    const bins = d3.bin().domain([0, 1]).thresholds(36)(means);
    const y = d3.scaleLinear().domain([0, Math.max(d3.max(bins, (b) => b.length), 4)]).range([H - M.b, M.t + 10]);
    meansG.selectAll("rect").data(bins).enter().append("rect")
      .attr("x", (b) => x(b.x0) + 0.5).attr("y", (b) => y(b.length))
      .attr("width", (b) => Math.max(0, x(b.x1) - x(b.x0) - 1))
      .attr("height", (b) => H - M.b - y(b.length))
      .attr("fill", "#4066e0").attr("fill-opacity", 0.8).attr("rx", 1.5);
    const mu = d3.mean(means), sd = d3.deviation(means) || 0.02, binW = 1 / 36;
    const norm = d3.range(0, 1.001, 0.01).map((v) => {
      const pdf = Math.exp(-0.5 * Math.pow((v - mu) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI));
      return [v, pdf * means.length * binW];
    });
    const line = d3.line().x((d) => x(d[0])).y((d) => y(Math.min(d[1], y.domain()[1]))).curve(d3.curveBasis);
    meansG.append("path").attr("d", line(norm)).attr("fill", "none")
      .attr("stroke", "#e5a63c").attr("stroke-width", 2.5);
    meansG.append("line").attr("x1", x(0)).attr("x2", x(1))
      .attr("y1", H - M.b).attr("y2", H - M.b).attr("stroke", "#1a1d26").attr("stroke-opacity", 0.4);
  }

  function runBatch() {
    const kind = d3.select("#clt-dist").property("value");
    const n = +d3.select("#clt-n").property("value");
    if (timer) timer.stop();
    let added = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let i = 0; i < 200; i++) means.push(d3.mean(d3.range(n).map(DISTS[kind])));
      drawMeans(); return;
    }
    timer = d3.timer(() => {
      for (let i = 0; i < 5; i++) { means.push(d3.mean(d3.range(n).map(DISTS[kind]))); added++; }
      drawMeans();
      if (added >= 200) { timer.stop(); timer = null; }
    });
  }

  d3.select("#clt-n").on("input", function () { d3.select("#clt-n-val").text(this.value); });
  d3.select("#clt-dist").on("change", () => { means = []; drawPopulation(); drawMeans(); });
  d3.select("#clt-run").on("click", runBatch);
  d3.select("#clt-reset").on("click", () => { if (timer) timer.stop(); means = []; drawMeans(); });
  drawPopulation(); drawMeans();
}

// ---------------------------------------------------------------------------
// Dashboard page controller: category filtering + lazy rendering
// ---------------------------------------------------------------------------
(function () {
  const panels = document.querySelectorAll(".viz-panel[data-cat]");
  if (!panels.length) return;

  const BUILDERS = {
    "readmissions": dashReadmissions, "ed-flow": dashEdFlow, "trial": dashTrialFunnel,
    "gapminder": dashGapminder, "revenue": dashRevenue, "cohort": dashCohort,
    "channels": dashChannels, "cafe": dashCafe, "climate": dashClimate,
    "tornado": dashTornado, "quake": dashQuakes, "energy": dashEnergy, "clt": dashCLT,
  };
  const built = new Set();

  function build(id) {
    if (built.has(id) || !BUILDERS[id]) return;
    try { BUILDERS[id](); built.add(id); }
    catch (e) { console.error("Dashboard failed:", id, e); }
  }

  // Render each dashboard as it scrolls into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { build(en.target.dataset.build); io.unobserve(en.target); }
    });
  }, { rootMargin: "200px" });
  panels.forEach((p) => io.observe(p));

  // Category filter
  const chips = document.querySelectorAll(".cat-chip");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    const cat = chip.dataset.filter;
    chips.forEach((c) => c.classList.toggle("active", c === chip));
    panels.forEach((p) => {
      const show = cat === "all" || p.dataset.cat === cat;
      p.hidden = !show;
      if (show) build(p.dataset.build);
    });
    document.getElementById("filter-count").textContent =
      cat === "all" ? `Showing all ${panels.length} dashboards`
                    : `Showing ${document.querySelectorAll(`.viz-panel[data-cat="${cat}"]`).length} dashboards`;
  }));
})();
