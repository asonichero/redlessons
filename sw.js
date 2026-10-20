// Service worker: caches the game on first load so it installs and plays offline. Bump VERSION whenever the files change, so installed copies refresh.
const APP = '0.4.0';
const VERSION = 'red-lessons-v040-4';
const FILES = [
  'game.html', 'manifest.webmanifest',
  'js/blocky.js', 'js/cast.js', 'js/measures.js', 'js/toon.js', 'js/audio.js', 'js/touchui.js', 'js/game.js', 'js/pain.js', 'js/ledger.js', 'js/lap.js', 'js/correction.js', 'js/village.js', 'js/menus.js',
  'vendor/three.min.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
];
// Install: cache every file straight from the network (never from the browser's own cache), one by one, so a single missing file cannot stop a new version installing (that is what once kept a player on an old build).
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(FILES.map(f => c.add(new Request(f, { cache: 'reload' }))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Network first (so the newest build is always the one you play), falling back to the cached copy when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async c => {
    try { const r = await fetch(e.request, { cache: 'no-cache' }); if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone()); return r; }
    catch (err) { const hit = await c.match(e.request, { ignoreSearch: true }); if (hit) return hit; throw err; }
  }));
});
