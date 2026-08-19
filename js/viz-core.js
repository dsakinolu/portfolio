// ===========================================================================
// Shared visualization toolkit
// Small D3 helpers used by every dashboard on this site, plus a seeded
// random generator so "sample" datasets are identical on every visit.
// ===========================================================================

const V = (() => {
  const tooltip = d3.select("body").append("div").attr("class", "viz-tooltip");

  function showTip(html, event) {
    tooltip.html(html).style("opacity", 1)
      .style("left", Math.min(event.clientX + 14, window.innerWidth - 250) + "px")
      .style("top", Math.min(event.clientY + 14, window.innerHeight - 90) + "px");
  }
  function hideTip() { tooltip.style("opacity", 0); }

  // Deterministic PRNG — same "random" data every load
  function seeded(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Normal-ish deviate from a uniform generator
  function gauss(rand, mean, sd) {
    const u = Math.max(rand(), 1e-9), v = rand();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  const PALETTE = ["#27418f", "#4066e0", "#e5a63c", "#2e9e8f", "#c46394", "#8a63c4", "#7c97ec", "#d97b45"];

  function svg(sel, w, h, label) {
    d3.select(sel).selectAll("*").remove();
    return d3.select(sel).append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("role", "img")
      .attr("aria-label", label || "");
  }

  function axes(g, x, y, W, H, M, opts = {}) {
    // Build each axis, applying formats with tickFormat().
    // (d3's .ticks(count, specifier) only accepts a format *string* —
    //  passing a function there throws "invalid format".)
    function build(axis, ticks, format) {
      axis.ticks(ticks);
      if (typeof format === "function") axis.tickFormat(format);
      else if (typeof format === "string") axis.ticks(ticks, format);
      return axis;
    }
    const xa = g.append("g").attr("transform", `translate(0,${H - M.b})`)
      .call(opts.xAxis || build(d3.axisBottom(x), opts.xTicks || 6, opts.xFormat));
    const ya = g.append("g").attr("transform", `translate(${M.l},0)`)
      .call(opts.yAxis || build(d3.axisLeft(y), opts.yTicks || 5, opts.yFormat));
    [xa, ya].forEach((a) => a.selectAll("text").style("font", "11px 'IBM Plex Mono', monospace"));
    if (opts.xLabel) g.append("text").attr("x", (M.l + W - M.r) / 2).attr("y", H - 6)
      .attr("text-anchor", "middle").style("font", "500 11px 'IBM Plex Mono', monospace")
      .style("fill", "#5a5f6e").text(opts.xLabel);
    if (opts.yLabel) g.append("text").attr("transform", `translate(13,${(M.t + H - M.b) / 2}) rotate(-90)`)
      .attr("text-anchor", "middle").style("font", "500 11px 'IBM Plex Mono', monospace")
      .style("fill", "#5a5f6e").text(opts.yLabel);
    return { xa, ya };
  }

  function legend(g, items, x, y) {
    const l = g.append("g").attr("transform", `translate(${x},${y})`);
    items.forEach((it, i) => {
      const row = l.append("g").attr("transform", `translate(0,${i * 18})`);
      row.append("rect").attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", it.color);
      row.append("text").attr("x", 18).attr("y", 10)
        .style("font", "11px 'IBM Plex Mono', monospace").style("fill", "#1a1d26").text(it.label);
    });
    return l;
  }

  function kpis(sel, items) {
    d3.select(sel).html(items.map((k) => `
      <div class="kpi">
        <div class="kpi-num">${k.num}</div>
        <div class="kpi-label">${k.label}</div>
        ${k.sub ? `<div class="kpi-sub">${k.sub}</div>` : ""}
      </div>`).join(""));
  }

  // Animate a path drawing itself; degrades gracefully if the browser
  // doesn't support getTotalLength.
  function drawLine(path, ms) {
    try {
      const L = path.node().getTotalLength();
      path.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
        .transition().duration(ms || 1200).attr("stroke-dashoffset", 0);
    } catch (e) { /* no animation, line still renders */ }
  }

  return { showTip, hideTip, seeded, gauss, PALETTE, svg, axes, legend, kpis, drawLine };
})();

// Number formatting helpers
const fmtN = d3.format(",");
const fmtPct = (v) => d3.format(".1f")(v) + "%";
const fmtUSD = (v) => "$" + d3.format(",.0f")(v);
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
