// Service worker: caches the game on first load so it installs and plays offline. Bump VERSION whenever the files change, so installed copies refresh.
const APP = '0.9.0';
const VERSION = 'little-red-v118';
const FILES = [
  'index.html', 'story.html', 'lap.html', 'editor.html', 'play.html', 'manifest.webmanifest',
  'js/toon.js', 'js/cottage.js', 'js/stage.js', 'js/looks.js', 'js/audio.js', 'js/pain.js', 'js/lap.js', 'js/discipline.js', 'js/mocap.js', 'js/motion.js', 'js/play.js', 'js/talk.js', 'js/story.js', 'js/cabin.js', 'js/wood.js', 'js/chapter1.js', 'js/hud.js', 'js/correction.js', 'js/save.js', 'js/calendar.js', 'js/reputation.js', 'js/questdata.js', 'js/quests.js', 'js/world.js', 'js/implements.js', 'js/correctors.js',
  'vendor/three.min.js', 'vendor/OrbitControls.js',
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
