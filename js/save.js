// Little Red’s Lessons — the saved game: where she is and when, what's been done, what's known about her and by whom. One plain object, kept in the
// browser (localStorage) and written on every change; everything else (js/calendar.js, js/reputation.js, js/quests.js) reads and changes it here.
//
//   const save = Save.create({ key, storage })      (storage: anything with getItem/setItem/removeItem; by default localStorage, or memory)
//   save.state                                      the state itself (see fresh() for its shape)
//   save.has(flag) · save.flag(flag, value = true) · save.change(fn) (fn(state), then written and told) · save.on(fn) (told of every change)
//   save.exists() · save.reset() · save.export() → JSON · save.import(json)
(function (root) {
'use strict';
const VERSION = 1;

// A new game: the first morning... in fact the late afternoon of the first day, at her grandmother's.
const fresh = () => ({
  v: VERSION,
  day: 1, minute: 16 * 60 + 30,                      // (the calendar: day 1, 4.30 in the afternoon)
  area: null, at: null,                              // (where she is: an area of js/world.js, and her place and facing in it, [x, z, yaw])
  flags: {},                                         // (anything that has happened: { name: true or a value })
  stats: { wilful: 0, mischievous: 0, naughty: 0 },  // (her reputation: js/reputation.js)
  trust: {},                                         // (how far each figure and she have come to trust each other, built by time and work together: { who: n })
  open: {},                                          // (openness: who knows what being Little Red means, and how far: { who: 0..2 })
  wolfe: {},                                         // (what she's told Wolfe: { topic: true }; never shown)
  quests: {},                                        // (each quest line's steps done: { line: { step: day done } })
  items: [],                                         // (what she has with her)
  log: [],                                           // (the last things that changed her standing, newest last: [day, text])
});

// Old saves brought up to date, one version at a time.
const MIGRATE = {};
function migrate(s) {
  if (!s || typeof s !== 'object') return fresh();
  while ((s.v || 0) < VERSION) { const f = MIGRATE[s.v || 0]; s = f ? f(s) : Object.assign(fresh(), s, { v: (s.v || 0) + 1 }); }
  const f = fresh(); for (const k in f) if (s[k] === undefined) s[k] = f[k];      // (anything added since)
  return s;
}

function memory() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
function defaultStorage() { try { const s = root.localStorage; s.setItem('__t', '1'); s.removeItem('__t'); return s; } catch (e) { return memory(); } }

function create(opts) {
  opts = opts || {};
  const key = opts.key || 'little-red:save:v1', store = opts.storage || defaultStorage(), listeners = [];
  let state = null;
  try { const raw = store.getItem(key); state = raw ? migrate(JSON.parse(raw)) : null; } catch (e) { state = null; }
  const existed = !!state; if (!state) state = fresh();
  const write = () => { try { store.setItem(key, JSON.stringify(state)); } catch (e) { /* full, or none */ } };
  const tell = what => { for (const f of listeners.slice()) f(state, what); };
  const api = {
    get state() { return state; },
    exists: () => existed || !!store.getItem(key),
    has: f => !!state.flags[f],
    flag(f, v) { state.flags[f] = v === undefined ? true : v; write(); tell({ flag: f }); },
    change(fn, what) { fn(state); write(); tell(what || {}); },
    on(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; },
    reset() { state = fresh(); write(); tell({ reset: true }); },
    export: () => JSON.stringify(state),
    import(json) { state = migrate(typeof json === 'string' ? JSON.parse(json) : json); write(); tell({ reset: true }); },
    write,
  };
  return api;
}

const api = { create, fresh, VERSION, memory };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Save = api;
})(typeof window !== 'undefined' ? window : globalThis);
