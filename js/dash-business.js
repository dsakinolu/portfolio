// ===========================================================================
// BUSINESS & OPERATIONS DASHBOARDS
// 5. Retail revenue performance
// 6. Customer cohort retention
// 7. Sales funnel & channel mix
// 8. C.H. Café operations
// ===========================================================================

// ---------------------------------------------------------------------------
// 5. RETAIL REVENUE — monthly revenue vs target, with category mix
// ---------------------------------------------------------------------------
function dashRevenue() {
  if (!document.getElementById("viz-revenue")) return;
  const rand = V.seeded(9182);

  const data = MONTHS.map((m, i) => {
    const trend = 148000 + i * 5200;
    const season = 1 + 0.16 * Math.sin((i - 2) / 12 * 2 * Math.PI) + (i === 11 ? 0.22 : 0);
    const actual = Math.round(trend * season * (0.94 + rand() * 0.13));
    return { month: m, i, actual, target: Math.round(trend * season) };
  });

  const W = 860, H = 380, M = { t: 28, r: 30, b: 46, l: 68 };
  const s = V.svg("#viz-revenue", W, H, "Monthly revenue against target");
  const x = d3.scaleBand().domain(MONTHS).range([M.l, W - M.r]).padding(0.28);
  const y = d3.scaleLinear().domain([0, d3.max(data, (d) => Math.max(d.actual, d.target)) * 1.12]).range([H - M.b, M.t]);

  s.append("g").attr("transform", `translate(0,${H - M.b})`).call(d3.axisBottom(x))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");
  s.append("g").attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat((d) => "$" + d3.format(".2s")(d)))
    .selectAll("text").style("font", "11px 'IBM Plex Mono', monospace");

  s.selectAll(".bar").data(data).enter().append("rect")
    .attr("x", (d) => x(d.month)).attr("width", x.bandwidth()).attr("rx", 4)
    .attr("y", H - M.b).attr("height", 0)
    .attr("fill", (d) => (d.actual >= d.target ? "#2e9e8f" : "#c46394"))
    .on("mousemove", (e, d) => V.showTip(
      `<strong>${d.month}</strong><br>Actual: ${fmtUSD(d.actual)}<br>Target: ${fmtUSD(d.target)}<br>${d.actual >= d.target ? "✓" : "▼"} ${(((d.actual - d.target) / d.target) * 100).toFixed(1)}% vs target`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(700).delay((d, i) => i * 55)
    .attr("y", (d) => y(d.actual)).attr("height", (d) => H - M.b - y(d.actual));

  const tline = d3.line().x((d) => x(d.month) + x.bandwidth() / 2).y((d) => y(d.target));
  s.append("path").attr("d", tline(data)).attr("fill", "none")
    .attr("stroke", "#1a1d26").attr("stroke-width", 2).attr("stroke-dasharray", "5,4")
    .attr("opacity", 0).transition().delay(700).duration(500).attr("opacity", 0.85);

  V.legend(s, [
    { color: "#2e9e8f", label: "Met target" },
    { color: "#c46394", label: "Missed target" },
  ], M.l + 8, 2);

  // Category mix donut
  const CATS = [
    { name: "Subscriptions", v: 42 }, { name: "One-time sales", v: 27 },
    { name: "Services", v: 19 }, { name: "Partnerships", v: 12 },
  ];
  const W2 = 320, H2 = 300;
  const s2 = V.svg("#viz-revenue-mix", W2, H2, "Revenue by category");
  const g = s2.append("g").attr("transform", `translate(${W2 / 2},${H2 / 2 - 10})`);
  const pie = d3.pie().value((d) => d.v).sort(null);
  const arc = d3.arc().innerRadius(58).outerRadius(104);
  g.selectAll("path").data(pie(CATS)).enter().append("path")
    .attr("fill", (d, i) => V.PALETTE[i])
    .attr("stroke", "#fbf9f2").attr("stroke-width", 2)
    .on("mousemove", (e, d) => V.showTip(`<strong>${d.data.name}</strong><br>${d.data.v}% of revenue`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(900)
    .attrTween("d", function (d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return (t) => arc(i(t));
    });
  g.append("text").attr("text-anchor", "middle").attr("y", -4)
    .style("font", "700 20px 'Bricolage Grotesque', sans-serif").style("fill", "#27418f").text("$2.1M");
  g.append("text").attr("text-anchor", "middle").attr("y", 16)
    .style("font", "10px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e").text("ANNUAL REVENUE");
  V.legend(s2, CATS.map((c, i) => ({ color: V.PALETTE[i], label: `${c.name} (${c.v}%)` })), 20, H2 - 78);

  const total = d3.sum(data, (d) => d.actual);
  const hit = data.filter((d) => d.actual >= d.target).length;
  V.kpis("#kpi-revenue", [
    { num: fmtUSD(total), label: "Total revenue" },
    { num: `${hit}/12`, label: "Months on target" },
    { num: "+18.4%", label: "YoY growth" },
    { num: fmtUSD(total / 12), label: "Avg. monthly" },
  ]);
}

// ---------------------------------------------------------------------------
// 6. COHORT RETENTION HEATMAP
// ---------------------------------------------------------------------------
function dashCohort() {
  if (!document.getElementById("viz-cohort")) return;
  const rand = V.seeded(5150);

  const cohorts = MONTHS.slice(0, 9);
  const rows = cohorts.map((c, ci) => {
    const quality = 0.9 + ci * 0.014;   // acquisition quality improves over time
    return {
      cohort: c,
      size: Math.round(320 + rand() * 260),
      vals: d3.range(9 - ci).map((m) => {
        if (m === 0) return 100;
        const base = 100 * Math.pow(0.78 + 0.03 * Math.log(m + 1), m * 0.62) * quality;
        return Math.max(8, Math.round(base + (rand() - 0.5) * 5));
      }),
    };
  });

  const W = 860, H = 380, M = { t: 46, r: 20, b: 30, l: 110 };
  const s = V.svg("#viz-cohort", W, H, "Cohort retention heatmap by month since signup");
  const x = d3.scaleBand().domain(d3.range(9)).range([M.l, W - M.r]).padding(0.06);
  const y = d3.scaleBand().domain(cohorts).range([M.t, H - M.b]).padding(0.08);
  const color = d3.scaleSequential(d3.interpolateRgb("#ece6d4", "#27418f")).domain([0, 100]);

  s.selectAll(".hx").data(d3.range(9)).enter().append("text")
    .attr("x", (d) => x(d) + x.bandwidth() / 2).attr("y", M.t - 10).attr("text-anchor", "middle")
    .style("font", "11px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e")
    .text((d) => "M" + d);
  s.append("text").attr("x", M.l).attr("y", 18)
    .style("font", "600 11px 'IBM Plex Mono', monospace").style("fill", "#27418f")
    .text("MONTHS SINCE SIGNUP →");
  s.selectAll(".hy").data(rows).enter().append("text")
    .attr("x", M.l - 10).attr("y", (d) => y(d.cohort) + y.bandwidth() / 2 + 4).attr("text-anchor", "end")
    .style("font", "11px 'Albert Sans', sans-serif").style("fill", "#1a1d26")
    .text((d) => `${d.cohort} (${d.size})`);

  rows.forEach((r) => {
    s.selectAll(null).data(r.vals).enter().append("rect")
      .attr("x", (d, i) => x(i)).attr("y", y(r.cohort))
      .attr("width", x.bandwidth()).attr("height", y.bandwidth()).attr("rx", 3)
      .attr("fill", "#f5f1e6")
      .on("mousemove", (e, d, i) => V.showTip(`<strong>${r.cohort} cohort</strong><br>${d}% still active<br>Cohort size: ${r.size}`, e))
      .on("mouseleave", V.hideTip)
      .transition().duration(500).delay((d, i) => i * 40)
      .attr("fill", (d) => color(d));
    s.selectAll(null).data(r.vals).enter().append("text")
      .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
      .attr("y", y(r.cohort) + y.bandwidth() / 2 + 4).attr("text-anchor", "middle")
      .style("font", "10px 'IBM Plex Mono', monospace")
      .style("fill", (d) => (d > 55 ? "#fff" : "#1a1d26"))
      .style("opacity", 0).text((d) => d)
      .transition().delay(500).duration(300).style("opacity", 1);
  });

  V.kpis("#kpi-cohort", [
    { num: "38%", label: "Month-3 retention" },
    { num: "21%", label: "Month-6 retention" },
    { num: "+9 pts", label: "Newest vs oldest cohort" },
    { num: "3,847", label: "Users tracked" },
  ]);
}

// ---------------------------------------------------------------------------
// 7. SALES FUNNEL & CHANNEL MIX
// ---------------------------------------------------------------------------
function dashChannels() {
  if (!document.getElementById("viz-channels")) return;

  const CHANNELS = [
    { name: "Organic search", leads: 4820, conv: 3.1, cac: 42 },
    { name: "Paid social", leads: 3610, conv: 1.8, cac: 118 },
    { name: "Email", leads: 2140, conv: 5.4, cac: 21 },
    { name: "Referral", leads: 1290, conv: 8.2, cac: 16 },
    { name: "Events", leads: 640, conv: 11.5, cac: 205 },
    { name: "Direct", leads: 1980, conv: 4.2, cac: 8 },
  ];

  const W = 860, H = 420, M = { t: 30, r: 40, b: 56, l: 64 };
  const s = V.svg("#viz-channels", W, H, "Scatter plot of acquisition channels: cost per acquisition versus conversion rate");
  const x = d3.scaleLinear().domain([0, 230]).range([M.l, W - M.r]);
  const y = d3.scaleLinear().domain([0, 13]).range([H - M.b, M.t]);
  const r = d3.scaleSqrt().domain([0, d3.max(CHANNELS, (d) => d.leads)]).range([6, 40]);

  V.axes(s, x, y, W, H, M, {
    xFormat: (d) => "$" + d, yFormat: (d) => d + "%",
    xLabel: "Customer acquisition cost →", yLabel: "Conversion rate →",
  });

  // Quadrant guide: cheap + converting = top-left
  s.append("line").attr("x1", x(90)).attr("x2", x(90)).attr("y1", M.t).attr("y2", H - M.b)
    .attr("stroke", "#5a5f6e").attr("stroke-dasharray", "4,4").attr("opacity", 0.4);
  s.append("line").attr("x1", M.l).attr("x2", W - M.r).attr("y1", y(5)).attr("y2", y(5))
    .attr("stroke", "#5a5f6e").attr("stroke-dasharray", "4,4").attr("opacity", 0.4);
  s.append("text").attr("x", M.l + 8).attr("y", M.t + 14)
    .style("font", "10px 'IBM Plex Mono', monospace").style("fill", "#2e9e8f")
    .text("★ BEST: low cost, high conversion");

  s.selectAll("circle").data(CHANNELS).enter().append("circle")
    .attr("cx", (d) => x(d.cac)).attr("cy", (d) => y(d.conv)).attr("r", 0)
    .attr("fill", (d, i) => V.PALETTE[i]).attr("fill-opacity", 0.72)
    .attr("stroke", "#0e1733").attr("stroke-opacity", 0.4)
    .on("mousemove", (e, d) => V.showTip(
      `<strong>${d.name}</strong><br>Leads: ${fmtN(d.leads)}<br>Conversion: ${d.conv}%<br>CAC: $${d.cac}<br>Customers: ${Math.round(d.leads * d.conv / 100)}`, e))
    .on("mouseleave", V.hideTip)
    .transition().duration(800).delay((d, i) => i * 80).attr("r", (d) => r(d.leads));

  s.selectAll(".lbl").data(CHANNELS).enter().append("text")
    .attr("x", (d) => x(d.cac)).attr("y", (d) => y(d.conv) - r(d.leads) - 6).attr("text-anchor", "middle")
    .style("font", "11px 'Albert Sans', sans-serif").style("fill", "#1a1d26")
    .style("opacity", 0).text((d) => d.name)
    .transition().delay(900).duration(400).style("opacity", 1);

  const totalLeads = d3.sum(CHANNELS, (d) => d.leads);
  const totalCust = d3.sum(CHANNELS, (d) => d.leads * d.conv / 100);
  V.kpis("#kpi-channels", [
    { num: fmtN(totalLeads), label: "Total leads" },
    { num: fmtN(Math.round(totalCust)), label: "Customers won" },
    { num: fmtPct(totalCust / totalLeads * 100), label: "Blended conversion" },
    { num: "Referral", label: "Best cost-efficiency" },
  ]);
}

// ---------------------------------------------------------------------------
// 8. C.H. CAFÉ OPERATIONS
// ---------------------------------------------------------------------------
function dashCafe() {
  if (!document.getElementById("cafe-visitors")) return;
  const rand = V.seeded(42);

  const weeks = d3.range(26).map((i) => ({ week: i, visitors: Math.round(58 + i * 1.7 + (rand() - 0.5) * 22) }));
  const CATS = [
    { name: "Coffee & espresso", share: 0.42 }, { name: "Tea & specialty", share: 0.23 },
    { name: "Pastries", share: 0.21 }, { name: "Cold drinks", share: 0.14 },
  ];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const HOURS = d3.range(8, 18);
  const heat = [];
  DAYS.forEach((day, di) => HOURS.forEach((hr) => {
    let base = 2 + 4 * Math.exp(-Math.pow(hr - 10.5, 2) / 6);
    if (di === 0) base *= 2.1;
    if (di === 5 || di === 6) base *= 1.25;
    heat.push({ day, di, hr, v: +(base + rand() * 1.2).toFixed(1) });
  }));

  function render() {
    const n = +d3.select("#cafe-period").property("value");
    const data = weeks.slice(-n);
    const total = d3.sum(data, (d) => d.visitors);
    const avg = Math.round(total / data.length);
    const prev = weeks.slice(-n * 2, -n);
    const prevAvg = prev.length ? d3.sum(prev, (d) => d.visitors) / prev.length : avg;
    const delta = Math.round(((avg - prevAvg) / prevAvg) * 100);

    V.kpis("#cafe-kpis", [
      { num: fmtN(total), label: "Total visitors" },
      { num: avg, label: "Avg / week" },
      { num: (delta >= 0 ? "+" : "") + delta + "%", label: "vs prior period" },
      { num: "Sun 10–11a", label: "Peak hour" },
    ]);

    const W = 520, H = 240, M = { t: 14, r: 14, b: 26, l: 38 };
    const s = V.svg("#cafe-visitors", W, H, "Weekly visitors");
    const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.week)).range([M.l, W - M.r]);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.visitors) * 1.15]).range([H - M.b, M.t]);
    V.axes(s, x, y, W, H, M, { xTicks: 6, xFormat: (d) => "W" + (d + 1) });
    const area = d3.area().x((d) => x(d.week)).y0(H - M.b).y1((d) => y(d.visitors)).curve(d3.curveMonotoneX);
    const line = d3.line().x((d) => x(d.week)).y((d) => y(d.visitors)).curve(d3.curveMonotoneX);
    s.append("path").attr("d", area(data)).attr("fill", "#4066e0").attr("fill-opacity", 0.12);
    s.append("path").attr("d", line(data)).attr("fill", "none").attr("stroke", "#27418f").attr("stroke-width", 2.4);
    s.selectAll(".pt").data(data).enter().append("circle")
      .attr("cx", (d) => x(d.week)).attr("cy", (d) => y(d.visitors)).attr("r", 3.2)
      .attr("fill", "#e5a63c").attr("stroke", "#0e1733").attr("stroke-width", 0.8)
      .on("mousemove", (e, d) => V.showTip(`<strong>Week ${d.week + 1}</strong><br>${d.visitors} visitors`, e))
      .on("mouseleave", V.hideTip);

    const W2 = 380, H2 = 240, M2 = { t: 10, r: 16, b: 26, l: 130 };
    const s2 = V.svg("#cafe-category", W2, H2, "Orders by category");
    const catData = CATS.map((c) => ({ ...c, orders: Math.round(total * 1.6 * c.share) }));
    const y2 = d3.scaleBand().domain(catData.map((d) => d.name)).range([M2.t, H2 - M2.b]).padding(0.3);
    const x2 = d3.scaleLinear().domain([0, d3.max(catData, (d) => d.orders)]).range([M2.l, W2 - M2.r]);
    s2.selectAll("rect").data(catData).enter().append("rect")
      .attr("x", M2.l).attr("y", (d) => y2(d.name)).attr("height", y2.bandwidth()).attr("rx", 4)
      .attr("fill", (d, i) => ["#27418f", "#4066e0", "#e5a63c", "#7c97ec"][i])
      .attr("width", (d) => x2(d.orders) - M2.l)
      .on("mousemove", (e, d) => V.showTip(`<strong>${d.name}</strong><br>${fmtN(d.orders)} orders (${Math.round(d.share * 100)}%)`, e))
      .on("mouseleave", V.hideTip);
    s2.selectAll(".lab").data(catData).enter().append("text")
      .attr("x", M2.l - 8).attr("y", (d) => y2(d.name) + y2.bandwidth() / 2 + 4).attr("text-anchor", "end")
      .style("font", "11px 'IBM Plex Mono', monospace").style("fill", "#1a1d26").text((d) => d.name);

    const W3 = 920, H3 = 220, M3 = { t: 26, r: 10, b: 8, l: 44 };
    const s3 = V.svg("#cafe-heat", W3, H3, "Busiest hours heatmap");
    const x3 = d3.scaleBand().domain(HOURS).range([M3.l, W3 - M3.r]).padding(0.06);
    const y3 = d3.scaleBand().domain(DAYS).range([M3.t, H3 - M3.b]).padding(0.12);
    const color = d3.scaleSequential(d3.interpolateRgb("#ece6d4", "#27418f")).domain([0, d3.max(heat, (d) => d.v)]);
    s3.selectAll("rect").data(heat).enter().append("rect")
      .attr("x", (d) => x3(d.hr)).attr("y", (d) => y3(d.day))
      .attr("width", x3.bandwidth()).attr("height", y3.bandwidth()).attr("rx", 3)
      .attr("fill", (d) => color(d.v))
      .on("mousemove", (e, d) => V.showTip(`<strong>${d.day} ${d.hr}:00</strong><br>~${d.v} orders/hr`, e))
      .on("mouseleave", V.hideTip);
    s3.selectAll(".hx").data(HOURS).enter().append("text")
      .attr("x", (d) => x3(d) + x3.bandwidth() / 2).attr("y", 16).attr("text-anchor", "middle")
      .style("font", "10px 'IBM Plex Mono', monospace").style("fill", "#5a5f6e")
      .text((d) => (d <= 12 ? d + "a" : (d - 12) + "p"));
    s3.selectAll(".dy").data(DAYS).enter().append("text")
      .attr("x", M3.l - 8).attr("y", (d) => y3(d) + y3.bandwidth() / 2 + 4).attr("text-anchor", "end")
      .style("font", "11px 'IBM Plex Mono', monospace").style("fill", "#1a1d26").text((d) => d);
  }

  d3.select("#cafe-period").on("change", render);
  render();
}
