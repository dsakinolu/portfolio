// ---------------------------------------------------------------------------
// Hero "data cloth" — a generative pattern of adire-style stamped tiles,
// drawn live with D3. Deterministic seed so the cloth is the same on every
// visit; gentle breathing animation unless the visitor prefers reduced motion.
// ---------------------------------------------------------------------------
(function () {
  const svg = d3.select("#hero-cloth");
  if (svg.empty()) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Small deterministic PRNG (mulberry32) so the pattern is stable
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function draw() {
    svg.selectAll("*").remove();
    const node = svg.node();
    const w = node.clientWidth || 1200;
    const h = node.clientHeight || 600;
    svg.attr("viewBox", `0 0 ${w} ${h}`);

    const rand = mulberry32(20260816);
    const tile = 64;
    const cols = Math.ceil(w / tile) + 1;
    const rows = Math.ceil(h / tile) + 1;

    const motifs = ["rings", "dots", "cross", "diamond"];
    const g = svg.append("g");

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tile, y = r * tile;
        const m = motifs[Math.floor(rand() * motifs.length)];
        const o = 0.10 + rand() * 0.35;
        const cell = g.append("g")
          .attr("transform", `translate(${x + tile / 2},${y + tile / 2})`)
          .attr("opacity", o);
        const stroke = rand() > 0.86 ? "#e5a63c" : "#7c97ec";

        if (m === "rings") {
          [tile * 0.32, tile * 0.2, tile * 0.09].forEach((rad) =>
            cell.append("circle").attr("r", rad)
              .attr("fill", "none").attr("stroke", stroke).attr("stroke-width", 1.4));
        } else if (m === "dots") {
          const n = 3;
          for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
              cell.append("circle")
                .attr("cx", (i - 1) * tile * 0.24)
                .attr("cy", (j - 1) * tile * 0.24)
                .attr("r", 2.4).attr("fill", stroke);
        } else if (m === "cross") {
          cell.append("path")
            .attr("d", `M ${-tile * 0.28} 0 H ${tile * 0.28} M 0 ${-tile * 0.28} V ${tile * 0.28}`)
            .attr("stroke", stroke).attr("stroke-width", 1.6).attr("fill", "none");
        } else {
          cell.append("rect")
            .attr("x", -tile * 0.22).attr("y", -tile * 0.22)
            .attr("width", tile * 0.44).attr("height", tile * 0.44)
            .attr("transform", "rotate(45)")
            .attr("fill", "none").attr("stroke", stroke).attr("stroke-width", 1.4);
        }

        if (!reduceMotion && rand() > 0.7) {
          cell.transition()
            .delay(rand() * 4000)
            .duration(3000 + rand() * 3000)
            .ease(d3.easeSinInOut)
            .attr("opacity", o * 0.35)
            .transition()
            .duration(3000 + rand() * 3000)
            .ease(d3.easeSinInOut)
            .attr("opacity", o)
            .on("end", function repeat() {
              d3.select(this).transition()
                .duration(4000).ease(d3.easeSinInOut).attr("opacity", o * 0.35)
                .transition()
                .duration(4000).ease(d3.easeSinInOut).attr("opacity", o)
                .on("end", repeat);
            });
        }
      }
    }
  }

  draw();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 200);
  });

  // -------------------------------------------------------------------------
  // Mini SVG previews for the three featured cards (static, decorative)
  // -------------------------------------------------------------------------
  function thumb(sel, build) {
    const el = d3.select(sel);
    if (el.empty()) return;
    const s = el.append("svg").attr("viewBox", "0 0 320 180").attr("aria-hidden", "true");
    s.append("rect").attr("width", 320).attr("height", 180).attr("fill", "#131f42");
    build(s);
  }

  const rnd = mulberry32(7);

  thumb("#thumb-gapminder", (s) => {
    for (let i = 0; i < 26; i++) {
      s.append("circle")
        .attr("cx", 30 + rnd() * 260)
        .attr("cy", 150 - Math.pow(rnd(), 0.7) * 120)
        .attr("r", 3 + rnd() * 11)
        .attr("fill", rnd() > 0.8 ? "#e5a63c" : "#7c97ec")
        .attr("fill-opacity", 0.75);
    }
    s.append("line").attr("x1", 24).attr("y1", 156).attr("x2", 300).attr("y2", 156).attr("stroke", "#f5f1e6").attr("stroke-opacity", 0.4);
    s.append("line").attr("x1", 24).attr("y1", 156).attr("x2", 24).attr("y2", 18).attr("stroke", "#f5f1e6").attr("stroke-opacity", 0.4);
  });

  thumb("#thumb-clt", (s) => {
    const bars = [4, 9, 18, 34, 52, 64, 58, 40, 24, 12, 5];
    const bw = 240 / bars.length;
    bars.forEach((b, i) => {
      s.append("rect")
        .attr("x", 40 + i * bw + 1.5).attr("y", 150 - b * 1.8)
        .attr("width", bw - 3).attr("height", b * 1.8)
        .attr("fill", "#7c97ec").attr("fill-opacity", 0.85).attr("rx", 2);
    });
    const line = d3.line().curve(d3.curveBasis);
    const pts = bars.map((b, i) => [40 + i * bw + bw / 2, 150 - b * 1.95]);
    s.append("path").attr("d", line(pts)).attr("fill", "none").attr("stroke", "#e5a63c").attr("stroke-width", 2.5);
  });

  thumb("#thumb-cafe", (s) => {
    const pts = [];
    for (let i = 0; i < 14; i++) pts.push([24 + i * 20, 120 - rnd() * 60 - i * 1.5]);
    const line = d3.line().curve(d3.curveMonotoneX);
    s.append("path").attr("d", line(pts)).attr("fill", "none").attr("stroke", "#7c97ec").attr("stroke-width", 2.5);
    pts.filter((_, i) => i % 3 === 0).forEach((p) =>
      s.append("circle").attr("cx", p[0]).attr("cy", p[1]).attr("r", 3.4).attr("fill", "#e5a63c"));
    for (let i = 0; i < 4; i++)
      s.append("rect").attr("x", 240).attr("y", 30 + i * 32).attr("width", 50 - i * 11).attr("height", 14)
        .attr("fill", "#f5f1e6").attr("fill-opacity", 0.35).attr("rx", 3);
  });
})();
