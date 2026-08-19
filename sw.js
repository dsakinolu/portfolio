// Sefunmi's Portfolio — offline-first service worker
const CACHE = "sefunmi-portfolio-v3";
const ASSETS = [
  "./", "./index.html", "./visualizations.html", "./projects.html",
  "./about.html", "./experience.html", "./certifications.html", "./contact.html",
  "./css/style.css",
  "./js/main.js", "./js/hero.js", "./js/contact.js", "./js/viz-core.js",
  "./js/dash-clinical.js", "./js/dash-business.js", "./js/dash-climate.js", "./js/dash-stats.js",
  "./images/icon-192.png", "./images/icon-512.png",
  "./favicon.ico", "./images/favicon-32.png", "./images/favicon-16.png",
  "./images/properties.png", "./images/breakfast.png",
  "./images/mindease.png", "./images/koyoruba.png",
  "./manifest.json",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => Promise.all(ASSETS.map((a) => c.add(a).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) =>
    hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html"))
  ));
});
