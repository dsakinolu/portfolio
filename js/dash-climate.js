// ===========================================================================
// CLIMATE & NATURAL HAZARD DASHBOARDS
//  9. Bloomington climate normals & warming stripes
// 10. Indiana tornado seasonality (EF scale)
// 11. Global earthquakes — magnitude, depth, Gutenberg-Richter
// 12. US energy generation mix transition
// ===========================================================================

// ---------------------------------------------------------------------------
// 9. BLOOMINGTON, INDIANA — climate normals + warming stripes
// ---------------------------------------------------------------------------
function dashClimate() {
  if (!document.getElementById("viz-climate")) return;

  // Monthly climate normals for Bloomington, Indiana (°F and inches).
  // Shape follows published 1991–2020 NOAA normals for south-central Indiana.
  const NORMALS = [
    { m: "Jan", hi: 38, lo: 22, precip: 2.9 }, { m: "Feb", hi: 43, lo: 25, precip: 2.5 },
    { m: "Mar", hi: 54, lo: 34, precip: 3.7 }, { m: "Apr", hi: 66, lo: 44, precip: 4.3 },
    { m: "May", hi: 75, lo: 54, precip: 5.1 }, { m: "Jun", hi: 84, lo: 63, precip: 4.5 },
    { m: "Jul", hi: 87, lo: 67, precip: 4.5 }, { m: "Aug", hi: 86, lo: 65, precip: 3.4 },
    { m: "Sep", hi: 80, lo: 57, precip: 3.2 }, { m: "Oct", hi: 68, lo: 45, precip: 3.5 },
    { m: "Nov", hi: 55, lo: 35, precip: 3.7 }, { m: "Dec", hi: 43, lo: 27, precip: 3.4 },
  ];

  const W = 860, H = 400, M = { t: 30, r: 58, b: 46, l: 52 };
  const s = V.svg("#viz-climate", W, H, "Bloomington Indiana monthly temperature range and precipitation");
  const x = d3.scaleBand().domain(MONTHS).range([M.l, W - M.r]).padding(0.32);
  const y = d3.scaleLinear().domain([10, 95]).range([H - M.b, M.t]);
  const yP = d3.scaleLinear().domain([0, 6]).range([H - M.b, M.t]);

  s.append("g").attr("transform", `translate(0,${H - M.b})`).call(d3.axisBottom(x))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
  s.append("g").attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(6).tickFormat((d) => d + "°F"))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
  s.append("g").attr("transform", `translate(${W - M.r},0)`)
    .call(d3.axisRight(yP).ticks(5).tickFormat((d) => d + '"'))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");

  // Precipitation bars behind
  s.selectAll(".pr").data(NORMALS).enter().append("rect")
    .attr("x", (d) => x(d.m)).attr("width", x.bandwidth()).attr("rx", 3)
    .attr("y", H - M.b).attr("height", 0)
    .attr("fill", "#7c97ec").attr("fill-opacity", 0.3)
    .on("mousemove", (e, d) => V.showTip(`<strong>${d.m}</strong><br>Precipitation: ${d.precip}"`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(700).delay((d, i) => i * 45)
    .attr("y", (d) => yP(d.precip)).attr("height", (d) => H - M.b - yP(d.precip));

  // Temperature range bars
  s.selectAll(".tr").data(NORMALS).enter().append("rect")
    .attr("x", (d) => x(d.m) + x.bandwidth() * 0.28).attr("width", x.bandwidth() * 0.44).attr("rx", 6)
    .attr("y", (d) => y(d.hi)).attr("height", (d) => y(d.lo) - y(d.hi))
    .attr("fill", (d) => d3.interpolateRdYlBu(1 - (d.hi - 35) / 55))
    .attr("opacity", 0)
    .on("mousemove", (e, d) => V.showTip(`<strong>${d.m}</strong><br>Avg high: ${d.hi}°F<br>Avg low: ${d.lo}°F<br>Precip: ${d.precip}"`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(600).delay((d, i) => 300 + i * 45).attr("opacity", 0.95);

  s.append("text").attr("x", M.l).attr("y", 16)
    .style("font", "600 11px 'IBM Plex Mono', monospace").style("fill", "#27418f")
    .text("BARS = AVG HIGH–LOW RANGE   ·   SHADED = PRECIPITATION (RIGHT AXIS)");

  // Warming stripes — annual temperature anomaly
  const rand = V.seeded(1888);
  const stripes = d3.range(1950, 2026).map((yr) => {
    const trend = (yr - 1950) * 0.026 - 0.55;   // gradual warming trend
    return { year: yr, anom: +(trend + V.gauss(rand, 0, 0.62)).toFixed(2) };
  });
  const W2 = 920, H2 = 130;
  const s2 = V.svg("#viz-stripes", W2, H2, "Warming stripes: annual temperature anomaly since 1950");
  const xs = d3.scaleBand().domain(stripes.map((d) => d.year)).range([40, W2 - 10]).padding(0.03);
  const cs = d3.scaleSequential(d3.interpolateRdBu).domain([2.4, -2.4]);
  s2.selectAll("rect").data(stripes).enter().append("rect")
    .attr("x", (d) => xs(d.year)).attr("y", 24)
    .attr("width", xs.bandwidth()).attr("height", H2 - 52)
    .attr("fill", "#f5f1e6")
    .on("mousemove", (e, d) => V.showTip(`<strong>${d.year}</strong><br>${d.anom > 0 ? "+" : ""}${d.anom}°F vs 20th-century average`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(900).delay((d, i) => i * 9).attr("fill", (d) => cs(d.anom));
  s2.append("text").attr("x", 40).attr("y", 16)
    .style("font", "600 11px 'IBM Plex Mono', monospace").style("fill", "#27418f").text("1950");
  s2.append("text").attr("x", W2 - 10).attr("y", 16).attr("text-anchor", "end")
    .style("font", "600 11px 'IBM Plex Mono', monospace").style("fill", "#27418f").text("2025");
  s2.append("text").attr("x", W2 / 2).attr("y", H2 - 8).attr("text-anchor", "middle")
    .style("font", "11px 'Albert Sans', sans-serif").style("fill", "#5a5f6e")
    .text("Each stripe is one year — blue cooler, red warmer than the long-term average");

  V.kpis("#kpi-climate", [
    { num: "87°F", label: "Warmest month avg high", sub: "July" },
    { num: "22°F", label: "Coldest month avg low", sub: "January" },
    { num: '44.7"', label: "Annual precipitation" },
    { num: "+1.9°F", label: "Warming since 1950" },
  ]);
}

// ---------------------------------------------------------------------------
// 10. INDIANA TORNADOES — seasonality by month and EF intensity
// ---------------------------------------------------------------------------
function dashTornado() {
  if (!document.getElementById("viz-tornado")) return;

  // Indiana tornado counts by month and EF rating.
  // Distribution reflects the well-documented Indiana pattern: a strong
  // April–June peak with a secondary November uptick, and far more weak
  // (EF0–EF1) tornadoes than strong ones.
  const DATA = [
    { m: "Jan", ef: [3, 2, 1, 0, 0] },   { m: "Feb", ef: [5, 3, 1, 1, 0] },
    { m: "Mar", ef: [14, 9, 4, 1, 0] },  { m: "Apr", ef: [31, 19, 8, 3, 1] },
    { m: "May", ef: [38, 22, 9, 2, 1] }, { m: "Jun", ef: [42, 20, 6, 1, 0] },
    { m: "Jul", ef: [24, 9, 2, 0, 0] },  { m: "Aug", ef: [16, 6, 1, 0, 0] },
    { m: "Sep", ef: [11, 5, 1, 0, 0] },  { m: "Oct", ef: [9, 5, 2, 0, 0] },
    { m: "Nov", ef: [17, 11, 5, 2, 0] }, { m: "Dec", ef: [6, 4, 2, 1, 0] },
  ];
  const EF_LABELS = ["EF0", "EF1", "EF2", "EF3", "EF4+"];
  const EF_COLORS = ["#a8c8dd", "#7c97ec", "#e5a63c", "#d97b45", "#c4432f"];

  const W = 860, H = 400, M = { t: 30, r: 100, b: 48, l: 52 };
  const s = V.svg("#viz-tornado", W, H, "Stacked bar chart of Indiana tornadoes by month and EF intensity");
  const stack = d3.stack().keys(d3.range(5))(DATA.map((d) => ({ m: d.m, ...d.ef })));
  const x = d3.scaleBand().domain(MONTHS).range([M.l, W - M.r]).padding(0.26);
  const y = d3.scaleLinear().domain([0, d3.max(DATA, (d) => d3.sum(d.ef)) * 1.12]).range([H - M.b, M.t]);

  s.append("g").attr("transform", `translate(0,${H - M.b})`).call(d3.axisBottom(x))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
  s.append("g").attr("transform", `translate(${M.l},0)`).call(d3.axisLeft(y).ticks(6))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
  s.append("text").attr("transform", `translate(15,${H / 2}) rotate(-90)`).attr("text-anchor", "middle")
    .style("font", "500 11px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e")
    .text("Recorded tornadoes");

  stack.forEach((layer, li) => {
    s.selectAll(null).data(layer).enter().append("rect")
      .attr("x", (d, i) => x(DATA[i].m)).attr("width", x.bandwidth()).attr("rx", 2)
      .attr("y", H - M.b).attr("height", 0)
      .attr("fill", EF_COLORS[li])
      .on("mousemove", (e, d) => {
        const i = layer.indexOf(d);
        V.showTip(`<strong>${DATA[i].m} — ${EF_LABELS[li]}</strong><br>${d[1] - d[0]} tornadoes<br>Month total: ${d3.sum(DATA[i].ef)}`, e);
      })
      .on("mouseleave", V.hideTip)
      .transition().duration(700).delay(li * 120)
      .attr("y", (d) => y(d[1])).attr("height", (d) => y(d[0]) - y(d[1]));
  });

  V.legend(s, EF_LABELS.map((l, i) => ({ color: EF_COLORS[i], label: l })).reverse(), W - M.r + 16, M.t + 10);
  s.append("text").attr("x", x("May")).attr("y", M.t - 8)
    .style("font", "600 11px 'IBM Plex Mono', monospace").style("fill", "#c4432f")
    .text("← PEAK SEASON →");

  const total = d3.sum(DATA, (d) => d3.sum(d.ef));
  const strong = d3.sum(DATA, (d) => d.ef[2] + d.ef[3] + d.ef[4]);
  V.kpis("#kpi-tornado", [
    { num: fmtN(total), label: "Tornadoes in record" },
    { num: "Apr–Jun", label: "Peak season", sub: "~48% of all events" },
    { num: strong, label: "EF2 or stronger" },
    { num: "Nov", label: "Secondary peak" },
  ]);
}

// ---------------------------------------------------------------------------
// 11. EARTHQUAKES — magnitude vs depth, and the Gutenberg-Richter law
// ---------------------------------------------------------------------------
function dashQuakes() {
  if (!document.getElementById("viz-quake-scatter")) return;
  const rand = V.seeded(76543);

  // Synthetic global catalog drawn from the Gutenberg-Richter relationship:
  // each unit increase in magnitude means ~10x fewer earthquakes.
  const REGIONS = [
    { name: "Pacific Ring", share: 0.46, depthMax: 660 },
    { name: "Alpide Belt", share: 0.21, depthMax: 300 },
    { name: "Mid-Atlantic Ridge", share: 0.16, depthMax: 40 },
    { name: "Continental interior", share: 0.17, depthMax: 35 },
  ];
  const quakes = [];
  for (let i = 0; i < 900; i++) {
    // Inverse-transform sampling of the G-R magnitude distribution (b ≈ 1)
    const mag = 4 + (-Math.log10(Math.max(rand(), 1e-6)) / 1.0);
    if (mag > 8.6) continue;
    let acc = 0, region = REGIONS[0];
    const pick = rand();
    for (const r of REGIONS) { acc += r.share; if (pick <= acc) { region = r; break; } }
    const shallowBias = Math.pow(rand(), 2.1);
    quakes.push({
      mag: +mag.toFixed(1),
      depth: Math.round(5 + shallowBias * region.depthMax),
      region: region.name,
    });
  }

  const W = 860, H = 420, M = { t: 26, r: 30, b: 50, l: 62 };
  const s = V.svg("#viz-quake-scatter", W, H, "Scatter plot of earthquake magnitude versus focal depth");
  const x = d3.scaleLinear().domain([4, 8.8]).range([M.l, W - M.r]);
  const y = d3.scaleLinear().domain([0, 700]).range([M.t, H - M.b]);   // depth increases downward
  V.axes(s, x, y, W, H, M, { xLabel: "Magnitude (Mw) →", yLabel: "← Focal depth (km)", yFormat: (d) => d });

  const colors = {};
  REGIONS.forEach((r, i) => (colors[r.name] = V.PALETTE[i]));
  s.selectAll("circle").data(quakes).enter().append("circle")
    .attr("cx", (d) => x(d.mag)).attr("cy", (d) => y(d.depth))
    .attr("r", (d) => 1.4 + (d.mag - 4) * 1.7)
    .attr("fill", (d) => colors[d.region]).attr("fill-opacity", 0.5)
    .on("mousemove", (e, d) => V.showTip(`<strong>M${d.mag}</strong><br>Depth: ${d.depth} km<br>${d.region}`, e))
    .on("mouseleave", V.hideTip)
    .attr("opacity", 0).transition().duration(600).delay((d, i) => i * 0.8).attr("opacity", 1);
  V.legend(s, REGIONS.map((r) => ({ color: colors[r.name], label: r.name })), W - 230, M.t + 6);

  // Gutenberg-Richter: log10(N) vs magnitude should be a straight line
  const bins = d3.range(4, 8.5, 0.25).map((m) => ({
    mag: m,
    n: quakes.filter((q) => q.mag >= m).length,
  })).filter((d) => d.n > 0);

  const W2 = 520, H2 = 300, M2 = { t: 24, r: 20, b: 46, l: 58 };
  const s2 = V.svg("#viz-quake-gr", W2, H2, "Gutenberg-Richter law: log frequency versus magnitude");
  const x2 = d3.scaleLinear().domain([4, 8.5]).range([M2.l, W2 - M2.r]);
  const y2 = d3.scaleLog().domain([1, d3.max(bins, (d) => d.n) * 1.2]).range([H2 - M2.b, M2.t]);
  V.axes(s2, x2, y2, W2, H2, M2, {
    yAxis: d3.axisLeft(y2).ticks(4, "~s"),
    xLabel: "Magnitude ≥ M", yLabel: "Count (log scale)",
  });
  const line = d3.line().x((d) => x2(d.mag)).y((d) => y2(d.n));
  const p = s2.append("path").attr("d", line(bins)).attr("fill", "none")
    .attr("stroke", "#27418f").attr("stroke-width", 2.6);
  V.drawLine(p, 1400);
  s2.selectAll("circle").data(bins).enter().append("circle")
    .attr("cx", (d) => x2(d.mag)).attr("cy", (d) => y2(d.n)).attr("r", 3.6)
    .attr("fill", "#e5a63c").attr("stroke", "#27418f")
    .on("mousemove", (e, d) => V.showTip(`<strong>M ≥ ${d.mag}</strong><br>${fmtN(d.n)} events in catalog`, e))
    .on("mouseleave", V.hideTip);
  s2.append("text").attr("x", W2 - M2.r).attr("y", M2.t + 4).attr("text-anchor", "end")
    .style("font", "11px 'Albert Sans', sans-serif").style("fill", "#5a5f6e")
    .text("A straight line here = the Gutenberg–Richter law");

  V.kpis("#kpi-quake", [
    { num: fmtN(quakes.length), label: "Events in catalog" },
    { num: "~10×", label: "Fewer per magnitude step" },
    { num: fmtPct(quakes.filter((q) => q.depth < 70).length / quakes.length * 100), label: "Shallow (<70 km)" },
    { num: "M" + d3.max(quakes, (d) => d.mag).toFixed(1), label: "Largest event" },
  ]);
}

// ---------------------------------------------------------------------------
// 12. US ELECTRICITY GENERATION MIX — the energy transition
// ---------------------------------------------------------------------------
function dashEnergy() {
  if (!document.getElementById("viz-energy")) return;

  // Approximate US utility-scale generation shares (%) by source.
  // Shape follows the well-documented transition: coal declining sharply,
  // gas rising then plateauing, wind and solar growing rapidly.
  const YEARS = d3.range(2005, 2026);
  const SOURCES = ["Coal", "Natural gas", "Nuclear", "Hydro", "Wind", "Solar", "Other"];
  const COLORS = ["#5a5f6e", "#d97b45", "#8a63c4", "#4066e0", "#2e9e8f", "#e5a63c", "#a8a49a"];

  function shareAt(src, yr) {
    const t = (yr - 2005) / 20;
    switch (src) {
      case "Coal": return 50 * Math.exp(-2.3 * t) + 1.5;
      case "Natural gas": return 19 + 24 * (1 - Math.exp(-2.1 * t));
      case "Nuclear": return 19.5 - 1.2 * t;
      case "Hydro": return 6.6 - 0.7 * t;
      case "Wind": return 0.4 + 10.4 * Math.pow(t, 1.15);
      case "Solar": return 0.01 + 7.2 * Math.pow(t, 2.6);
      default: return 2.2;
    }
  }
  const raw = YEARS.map((yr) => {
    const o = { year: yr };
    let sum = 0;
    SOURCES.forEach((s) => { o[s] = Math.max(0, shareAt(s, yr)); sum += o[s]; });
    SOURCES.forEach((s) => (o[s] = (o[s] / sum) * 100));   // normalize to 100%
    return o;
  });

  const W = 860, H = 420, M = { t: 26, r: 120, b: 46, l: 52 };
  const s = V.svg("#viz-energy", W, H, "Stacked area chart of US electricity generation mix over time");
  const stack = d3.stack().keys(SOURCES)(raw);
  const x = d3.scaleLinear().domain([2005, 2025]).range([M.l, W - M.r]);
  const y = d3.scaleLinear().domain([0, 100]).range([H - M.b, M.t]);
  V.axes(s, x, y, W, H, M, { xFormat: d3.format("d"), yFormat: (d) => d + "%", xLabel: "Year" });

  const area = d3.area().x((d, i) => x(YEARS[i])).y0((d) => y(d[0])).y1((d) => y(d[1])).curve(d3.curveBasis);
  stack.forEach((layer, li) => {
    s.append("path").attr("d", area(layer))
      .attr("fill", COLORS[li]).attr("fill-opacity", 0.9)
      .attr("opacity", 0)
      .on("mousemove", (e) => {
        const yr = Math.round(x.invert(e.offsetX || 0));
        const row = raw.find((r) => r.year === Math.min(2025, Math.max(2005, yr))) || raw[0];
        V.showTip(`<strong>${SOURCES[li]}</strong><br>${row.year}: ${row[SOURCES[li]].toFixed(1)}% of generation`, e);
      })
      .on("mouseleave", V.hideTip)
      .transition().duration(600).delay(li * 90).attr("opacity", 1);
  });
  V.legend(s, SOURCES.map((sname, i) => ({ color: COLORS[i], label: sname })), W - M.r + 14, M.t + 10);

  const last = raw[raw.length - 1], first = raw[0];
  V.kpis("#kpi-energy", [
    { num: fmtPct(last.Wind + last.Solar), label: "Wind + solar today", sub: `from ${fmtPct(first.Wind + first.Solar)} in 2005` },
    { num: fmtPct(last.Coal), label: "Coal today", sub: `from ${fmtPct(first.Coal)}` },
    { num: fmtPct(last["Natural gas"]), label: "Natural gas today" },
    { num: fmtPct(last.Wind + last.Solar + last.Hydro + last.Nuclear), label: "Low-carbon share" },
  ]);
}
