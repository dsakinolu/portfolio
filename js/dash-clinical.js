// ===========================================================================
// CLINICAL & HEALTHCARE DASHBOARDS
// 1. Hospital 30-day readmissions
// 2. Emergency department flow
// 3. Clinical trial enrollment funnel
// 4. Global health & wealth (real Gapminder data)
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. HOSPITAL READMISSIONS — rate by condition, with national benchmark
// ---------------------------------------------------------------------------
function dashReadmissions() {
  const root = document.getElementById("viz-readmissions");
  if (!root) return;

  const CONDITIONS = [
    { name: "Heart failure", rate: 21.6, benchmark: 21.9, n: 412 },
    { name: "COPD", rate: 19.8, benchmark: 19.6, n: 288 },
    { name: "Pneumonia", rate: 16.4, benchmark: 17.0, n: 355 },
    { name: "Acute MI", rate: 15.1, benchmark: 15.6, n: 196 },
    { name: "Hip/knee replacement", rate: 4.2, benchmark: 4.5, n: 305 },
    { name: "CABG", rate: 12.7, benchmark: 13.0, n: 118 },
  ];

  const W = 860, H = 420, M = { t: 30, r: 30, b: 56, l: 190 };
  const s = V.svg("#viz-readmissions", W, H, "Bar chart of 30-day readmission rates by condition against national benchmark");

  const y = d3.scaleBand().domain(CONDITIONS.map((d) => d.name)).range([M.t, H - M.b]).padding(0.32);
  const x = d3.scaleLinear().domain([0, 25]).range([M.l, W - M.r]);

  s.append("g").attr("transform", `translate(0,${H - M.b})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat((d) => d + "%"))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
  s.append("g").attr("transform", `translate(${M.l},0)`).call(d3.axisLeft(y))
    .selectAll("text").style("font", "12px 'Albert Sans', sans-serif");

  s.selectAll(".bar").data(CONDITIONS).enter().append("rect")
    .attr("x", M.l).attr("y", (d) => y(d.name))
    .attr("height", y.bandwidth()).attr("rx", 4)
    .attr("fill", (d) => (d.rate <= d.benchmark ? "#2e9e8f" : "#c46394"))
    .attr("width", 0)
    .on("mousemove", (e, d) => V.showTip(
      `<strong>${d.name}</strong><br>Rate: ${d.rate}%<br>Benchmark: ${d.benchmark}%<br>Discharges: ${d.n}<br>${d.rate <= d.benchmark ? "✓ Below benchmark" : "▲ Above benchmark"}`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(800).delay((d, i) => i * 70)
    .attr("width", (d) => x(d.rate) - M.l);

  // Benchmark markers
  s.selectAll(".bm").data(CONDITIONS).enter().append("line")
    .attr("x1", (d) => x(d.benchmark)).attr("x2", (d) => x(d.benchmark))
    .attr("y1", (d) => y(d.name) - 4).attr("y2", (d) => y(d.name) + y.bandwidth() + 4)
    .attr("stroke", "#1a1d26").attr("stroke-width", 2).attr("stroke-dasharray", "3,3");

  V.legend(s, [
    { color: "#2e9e8f", label: "At or below benchmark" },
    { color: "#c46394", label: "Above benchmark" },
  ], M.l + 10, 4);

  s.append("text").attr("x", W - M.r).attr("y", 14).attr("text-anchor", "end")
    .style("font", "11px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e")
    .text("╎ dashed line = national benchmark");

  V.kpis("#kpi-readmissions", [
    { num: "1,674", label: "Total discharges" },
    { num: "15.1%", label: "Overall readmit rate" },
    { num: "4 of 6", label: "Conditions at/below benchmark" },
    { num: "$2.1M", label: "Est. penalty exposure avoided" },
  ]);
}

// ---------------------------------------------------------------------------
// 2. EMERGENCY DEPARTMENT FLOW — arrivals by hour + wait time by acuity
// ---------------------------------------------------------------------------
function dashEdFlow() {
  const root = document.getElementById("viz-ed-arrivals");
  if (!root) return;
  const rand = V.seeded(4231);

  // Arrivals follow the classic ED double-hump: late-morning and evening peaks
  const hours = d3.range(24).map((h) => {
    const base =
      14 * Math.exp(-Math.pow(h - 11, 2) / 10) +
      17 * Math.exp(-Math.pow(h - 19, 2) / 12) + 4;
    return { hour: h, arrivals: Math.round(base + rand() * 3) };
  });

  const W = 520, H = 260, M = { t: 16, r: 16, b: 40, l: 46 };
  const s = V.svg("#viz-ed-arrivals", W, H, "ED arrivals by hour of day");
  const x = d3.scaleLinear().domain([0, 23]).range([M.l, W - M.r]);
  const y = d3.scaleLinear().domain([0, d3.max(hours, (d) => d.arrivals) * 1.15]).range([H - M.b, M.t]);

  V.axes(s, x, y, W, H, M, {
    xTicks: 8, xFormat: (d) => (d === 0 ? "12a" : d < 12 ? d + "a" : d === 12 ? "12p" : (d - 12) + "p"),
    xLabel: "Hour of day", yLabel: "Avg. arrivals",
  });

  const area = d3.area().x((d) => x(d.hour)).y0(H - M.b).y1((d) => y(d.arrivals)).curve(d3.curveMonotoneX);
  const line = d3.line().x((d) => x(d.hour)).y((d) => y(d.arrivals)).curve(d3.curveMonotoneX);
  s.append("path").attr("d", area(hours)).attr("fill", "#4066e0").attr("fill-opacity", 0.15);
  const p = s.append("path").attr("d", line(hours)).attr("fill", "none")
    .attr("stroke", "#27418f").attr("stroke-width", 2.6);
  V.drawLine(p, 1400);

  s.selectAll(".pt").data(hours).enter().append("circle")
    .attr("cx", (d) => x(d.hour)).attr("cy", (d) => y(d.arrivals)).attr("r", 3.4)
    .attr("fill", "#e5a63c").attr("stroke", "#27418f")
    .on("mousemove", (e, d) => V.showTip(`<strong>${d.hour}:00</strong><br>${d.arrivals} arrivals/hr`, e))
    .on("mouseleave", V.hideTip);

  // Wait times by triage acuity (ESI levels)
  const ACUITY = [
    { level: "ESI 1 — Resuscitation", wait: 0, share: 2 },
    { level: "ESI 2 — Emergent", wait: 8, share: 12 },
    { level: "ESI 3 — Urgent", wait: 34, share: 46 },
    { level: "ESI 4 — Less urgent", wait: 58, share: 28 },
    { level: "ESI 5 — Non-urgent", wait: 71, share: 12 },
  ];
  const W2 = 520, H2 = 260, M2 = { t: 16, r: 20, b: 40, l: 150 };
  const s2 = V.svg("#viz-ed-wait", W2, H2, "Median wait time by triage acuity");
  const y2 = d3.scaleBand().domain(ACUITY.map((d) => d.level)).range([M2.t, H2 - M2.b]).padding(0.3);
  const x2 = d3.scaleLinear().domain([0, 80]).range([M2.l, W2 - M2.r]);
  s2.append("g").attr("transform", `translate(0,${H2 - M2.b})`)
    .call(d3.axisBottom(x2).ticks(5).tickFormat((d) => d + "m"))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
  s2.append("g").attr("transform", `translate(${M2.l},0)`).call(d3.axisLeft(y2))
    .selectAll("text").style("font", "10.5px 'Albert Sans', sans-serif");
  s2.selectAll("rect").data(ACUITY).enter().append("rect")
    .attr("x", M2.l).attr("y", (d) => y2(d.level)).attr("height", y2.bandwidth()).attr("rx", 4)
    .attr("fill", (d, i) => ["#c46394", "#d97b45", "#e5a63c", "#7c97ec", "#4066e0"][i])
    .attr("width", 0)
    .on("mousemove", (e, d) => V.showTip(`<strong>${d.level}</strong><br>Median wait: ${d.wait} min<br>${d.share}% of volume`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(750).delay((d, i) => i * 70)
    .attr("width", (d) => Math.max(2, x2(d.wait) - M2.l));

  V.kpis("#kpi-ed", [
    { num: "218", label: "Avg. daily census" },
    { num: "31 min", label: "Median door-to-provider" },
    { num: "3.4 hrs", label: "Median length of stay" },
    { num: "1.8%", label: "Left without being seen" },
  ]);
}

// ---------------------------------------------------------------------------
// 3. CLINICAL TRIAL ENROLLMENT FUNNEL
// ---------------------------------------------------------------------------
function dashTrialFunnel() {
  if (!document.getElementById("viz-trial")) return;

  const STAGES = [
    { label: "Pre-screened from registry", n: 2840 },
    { label: "Contacted", n: 1610 },
    { label: "Consented to screening", n: 884 },
    { label: "Met eligibility criteria", n: 412 },
    { label: "Randomized", n: 336 },
    { label: "Completed study", n: 291 },
  ];

  const W = 860, H = 400, M = { t: 20, r: 30, b: 30, l: 210 };
  const s = V.svg("#viz-trial", W, H, "Funnel chart of clinical trial enrollment stages");
  const y = d3.scaleBand().domain(STAGES.map((d) => d.label)).range([M.t, H - M.b]).padding(0.22);
  const x = d3.scaleLinear().domain([0, STAGES[0].n]).range([0, (W - M.l - M.r) / 2]);
  const mid = M.l + (W - M.l - M.r) / 2;

  s.append("g").attr("transform", `translate(${M.l},0)`).call(d3.axisLeft(y).tickSize(0))
    .selectAll("text").style("font", "12px 'Albert Sans', sans-serif");
  s.select(".domain").remove();

  STAGES.forEach((d, i) => {
    const w = x(d.n);
    const g = s.append("g");
    g.append("rect")
      .attr("x", mid).attr("y", y(d.label)).attr("height", y.bandwidth())
      .attr("width", 0).attr("rx", 5)
      .attr("fill", d3.interpolateRgb("#27418f", "#7c97ec")(i / (STAGES.length - 1)))
      .on("mousemove", (e) => {
        const prev = i ? STAGES[i - 1].n : d.n;
        V.showTip(`<strong>${d.label}</strong><br>${fmtN(d.n)} participants<br>${((d.n / STAGES[0].n) * 100).toFixed(1)}% of pre-screened${i ? `<br>${((d.n / prev) * 100).toFixed(1)}% of previous stage` : ""}`, e);
      })
      .on("mouseleave", V.hideTip)
      .transition().duration(800).delay(i * 90)
      .attr("x", mid - w).attr("width", w * 2);
    g.append("text")
      .attr("x", mid).attr("y", y(d.label) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "middle").style("fill", "#fff").style("font", "600 12px 'IBM Plex Mono', monospace")
      .style("opacity", 0).text(fmtN(d.n))
      .transition().delay(i * 90 + 500).duration(400).style("opacity", 1);
  });

  V.kpis("#kpi-trial", [
    { num: "11.8%", label: "Pre-screen → randomized" },
    { num: "336", label: "Randomized (target 320)", sub: "105% of goal" },
    { num: "86.6%", label: "Retention to completion" },
    { num: "14 mo", label: "Enrollment period" },
  ]);
}

// ---------------------------------------------------------------------------
// 4. HEALTH & WEALTH OF NATIONS — real Gapminder 2007 data
// ---------------------------------------------------------------------------
const GAP = [
  ["Nigeria","Africa",46.9,2014,135031164],["Ethiopia","Africa",52.9,691,76511887],
  ["Egypt","Africa",71.3,5581,80264543],["South Africa","Africa",49.3,9270,43997828],
  ["Kenya","Africa",54.1,1463,35610177],["Ghana","Africa",60.0,1328,22873338],
  ["Senegal","Africa",63.1,1712,12267493],["Tanzania","Africa",52.5,1107,38139640],
  ["Morocco","Africa",71.2,3820,33757175],["Botswana","Africa",50.7,12570,1639131],
  ["United States","Americas",78.2,42952,301139947],["Brazil","Americas",72.4,9066,190010647],
  ["Mexico","Americas",76.2,11978,108700891],["Canada","Americas",80.7,36319,33390141],
  ["Argentina","Americas",75.3,12779,40301927],["Colombia","Americas",72.9,7007,44227550],
  ["Chile","Americas",78.6,13172,16284741],["Peru","Americas",71.4,7409,28674757],
  ["China","Asia",73.0,4959,1318683096],["India","Asia",64.7,2452,1110396331],
  ["Japan","Asia",82.6,31656,127467972],["Indonesia","Asia",70.6,3541,223547000],
  ["Pakistan","Asia",65.5,2606,169270617],["Bangladesh","Asia",64.1,1391,150448339],
  ["Vietnam","Asia",74.2,2442,85262356],["Thailand","Asia",70.6,7458,65068149],
  ["Turkey","Asia",71.8,8458,71158647],["Iran","Asia",71.0,11606,69453570],
  ["South Korea","Asia",78.6,23348,49044790],["Saudi Arabia","Asia",72.8,21655,27601038],
  ["Israel","Asia",80.7,25523,6426679],["Germany","Europe",79.4,32170,82400996],
  ["United Kingdom","Europe",79.4,33203,60776238],["France","Europe",80.7,30470,61083916],
  ["Italy","Europe",80.5,28570,58147733],["Spain","Europe",80.9,28821,40448191],
  ["Norway","Europe",80.2,49357,4627926],["Sweden","Europe",81.0,33860,9031088],
  ["Poland","Europe",75.6,15390,38518241],["Australia","Oceania",81.2,34435,20434176],
].map(([country, continent, lifeExp, gdpPercap, pop]) => ({ country, continent, lifeExp, gdpPercap, pop }));

function dashGapminder() {
  if (!document.getElementById("gm-stage")) return;
  const COLORS = { Africa: "#e5a63c", Americas: "#c46394", Asia: "#4066e0", Europe: "#2e9e8f", Oceania: "#8a63c4" };
  const W = 860, H = 480, M = { t: 20, r: 24, b: 52, l: 56 };
  const s = V.svg("#gm-stage", W, H, "Bubble chart of life expectancy versus income per person by country, 2007");
  const plot = s.append("g");
  const xAxisG = s.append("g").attr("transform", `translate(0,${H - M.b})`);
  const yAxisG = s.append("g").attr("transform", `translate(${M.l},0)`);

  s.append("text").attr("x", W / 2).attr("y", H - 10).attr("text-anchor", "middle")
    .style("font", "500 12px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e")
    .text("Income per person (GDP per capita, intl. $)");
  s.append("text").attr("transform", `translate(16,${H / 2}) rotate(-90)`).attr("text-anchor", "middle")
    .style("font", "500 12px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e")
    .text("Life expectancy (years)");

  const y = d3.scaleLinear().domain([40, 86]).range([H - M.b, M.t]);
  const r = d3.scaleSqrt().domain([0, d3.max(GAP, (d) => d.pop)]).range([3, 34]);
  V.legend(s, Object.entries(COLORS).map(([k, c]) => ({ color: c, label: k })), M.l + 12, M.t + 4);

  function render() {
    const cont = d3.select("#gm-continent").property("value");
    const useLog = d3.select("#gm-log").property("checked");
    const x = (useLog ? d3.scaleLog() : d3.scaleLinear())
      .domain(useLog ? [500, 60000] : [0, 52000]).range([M.l, W - M.r]);
    xAxisG.transition().duration(600).call(d3.axisBottom(x).ticks(useLog ? 4 : 6, "~s"))
      .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
    yAxisG.call(d3.axisLeft(y).ticks(6)).selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");

    const data = GAP.filter((d) => cont === "all" || d.continent === cont);
    const sel = plot.selectAll("circle").data(data, (d) => d.country);
    sel.exit().transition().duration(400).attr("r", 0).remove();
    sel.enter().append("circle")
      .attr("cx", (d) => x(d.gdpPercap)).attr("cy", (d) => y(d.lifeExp)).attr("r", 0)
      .attr("fill", (d) => COLORS[d.continent]).attr("fill-opacity", 0.78)
      .attr("stroke", "#0e1733").attr("stroke-opacity", 0.35)
      .on("mousemove", (e, d) => V.showTip(
        `<strong>${d.country}</strong><br>Life exp: ${d.lifeExp} yrs<br>Income: $${fmtN(Math.round(d.gdpPercap))}<br>Pop: ${d3.format(".3s")(d.pop).replace("G", "B")}`, e))
      .on("mouseleave", V.hideTip)
      .merge(sel).transition().duration(600)
      .attr("cx", (d) => x(d.gdpPercap)).attr("cy", (d) => y(d.lifeExp)).attr("r", (d) => r(d.pop));
  }
  d3.select("#gm-continent").on("change", render);
  d3.select("#gm-log").on("change", render);
  render();
}
