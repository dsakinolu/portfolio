# Sefunmi's Portfolio

**Live:** https://dsakinolu.github.io/portfolio/
📲 Installable — open on your phone and choose "Add to Home Screen."

Data scientist and web developer. This site holds thirteen interactive
dashboards plus links to four live, installable apps.

---

## 📊 The dashboards (`visualizations.html`)

All thirteen render live in the browser with D3.js — no screenshots, no
static images. They're filterable by category and load as you scroll.

**Clinical & health**
1. Hospital 30-day readmissions vs. national benchmarks
2. Emergency department flow — arrivals by hour, wait by triage acuity
3. Clinical trial enrollment funnel
4. Health & wealth of nations *(real Gapminder 2007 data)*

**Business & operations**
5. Revenue vs. target with category mix
6. Customer cohort retention heatmap
7. Acquisition channel efficiency (CAC vs. conversion)
8. C.H. Café operations dashboard

**Climate & natural hazards**
9. Bloomington, Indiana climate profile + warming stripes (1950–2025)
10. Indiana tornado seasonality by EF rating
11. Global earthquakes — magnitude, depth, and the Gutenberg–Richter law
12. The US energy transition, 2005–2025

**Statistics**
13. Central Limit Theorem simulator (live)

### Honesty about data

Every dashboard is badged:

| Badge | Meaning |
|---|---|
| **Real data** | From a published source, cited on the chart (e.g. Gapminder 2007) |
| **Modeled** | Shape follows documented real-world patterns — NOAA climate normals, NOAA/SPC tornado seasonality, EIA generation trends, the Gutenberg–Richter law — but exact values are generated. **Verify against the source before citing specific figures.** |
| **Sample data** | Invented for demonstration |

Labeling this is deliberate: knowing what your numbers actually are is the
first job in analytics, and a portfolio shouldn't imply access to data it
doesn't have.

**To swap in real data:** each dashboard's data lives at the top of its
function in `js/dash-*.js` as a plain array. Replace the array with real
figures (NOAA, CMS, EIA, and USGS all publish free downloads) and change the
badge in `visualizations.html` from `sample`/`modeled` to `real`.

---

## 📈 Adding Tableau and Power BI dashboards

These are hand-coded in D3 to show the underlying mechanics. To show BI-tool
work alongside them, both embed directly into `visualizations.html`.

### Tableau Public (free)

1. Build the workbook in Tableau Desktop or Tableau Public (free download).
2. **Server → Tableau Public → Save to Tableau Public.** A free account is
   required, and note that anything published there is publicly visible.
3. On the published viz, click **Share → Embed Code** and copy it.
4. Paste it into a new panel in `visualizations.html`:

```html
<article class="viz-panel" data-cat="business">
  <div class="viz-head">
    <div>
      <span class="cat-tag business">Business</span>
      <h3>Your Dashboard Title</h3>
    </div>
    <span class="badge real">Tableau Public</span>
  </div>
  <p class="viz-about">One or two sentences on what it shows and why.</p>
  <div class="viz-stage">
    <!-- paste the Tableau embed code here -->
  </div>
  <p class="viz-note">Built in Tableau Public. Data: [your source].</p>
</article>
```

Add `?:showVizHome=no&:embed=true` to a Tableau URL to strip its chrome, and
set `device="phone"` in the embed object so it responds on mobile.

### Power BI

Power BI's free **Publish to web** produces an embeddable public iframe:

1. Open the report in the Power BI service (app.powerbi.com).
2. **File → Embed report → Publish to web (public).**
3. Copy the iframe and paste it into a panel exactly as above.

Two important caveats: *Publish to web* makes the report **publicly
accessible to anyone with the link**, so never use it with real or
confidential data — build a demo dataset instead. And it requires a Power BI
account; some organization tenants disable the feature, in which case export
the report to PDF or images and link to it instead.

### Which to use when

D3 for custom, interactive, embedded-in-a-product visualization; Tableau and
Power BI for fast exploratory analysis and dashboards business users maintain
themselves. Showing both is the point — most analyst roles want the BI tools,
and hand-coding proves you understand what they generate.

---

## 🔗 Live projects

| Project | What it is |
|---|---|
| [Kọ́ Yorùbá pẹ̀lú Ṣèfúnmí](https://dsakinolu.github.io/ko-yoruba-pelu-sefunmi/) | Kids' Yorùbá learning app — flashcards, games, songs, stories (PWA) |
| [Sefunmi's Properties](https://dsakinolu.github.io/sefunmis-properties/) | Property management system with a real SQL database in the browser (PWA) |
| [MindEase](https://dsakinolu.github.io/mindease/) | Wellness app taken from Figma prototype to accessible web app (PWA) |
| [Sefunmi's Breakfast](https://dsakinolu.github.io/sefunmis-breakfast/) | Bakery storefront with cart, checkout, and admin (PWA) |

## 🤖 Sefunmi AI

The chat widget answers questions about education, work at iGeeksNG (QA testing
for BizAppointly), skills, each dashboard, the live projects, and contact
details. It scores keyword matches rather than taking the first hit, so
"what did she study in college" and "where does she work" route correctly.
Answers live in the `RESPONSES` array in `js/main.js` — add an entry to teach
it something new.

## 🛠️ Stack

HTML5 · CSS3 · Vanilla JavaScript · D3.js v7 · Service worker + Web App
Manifest. No framework, no build step — deploys as static files.

```
index.html            Home
visualizations.html   All 13 dashboards
projects.html         Live project links
js/viz-core.js        Shared chart helpers, seeded generators, tooltips
js/dash-clinical.js   Dashboards 1–4
js/dash-business.js   Dashboards 5–8
js/dash-climate.js    Dashboards 9–12
js/dash-stats.js      Dashboard 13 + page controller
```

Built by **Sefunmi Akin-Olukunle**
