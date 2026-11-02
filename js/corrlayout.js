// Little Red’s Lessons — where a correction is played, room by room: the giver's seat (where the scene is put, and what everyone watching
// faces), and, if they've been placed in the room editor (rooms.html, its correction layout), where those watching stand and the corner
// for corner time. Each room's set gives its own (world.corr: its key, the giver's seat as { x, z, yaw }, the seat's kind, what of the room's
// is put aside for it, whether the seat is fixed where it is (the glade's fallen tree), and its own places for those watching and its corner);
// the editor's changes are kept in this browser (a corner taken away kept as null), and used by js/correction.js. Those watching fill the
// places in order, from the first, unless a scene says where (js/correction.js).
//
//   CorrLayout.get(world) → { key, at: { x, z, yaw }, seat, hide, fixed, watchers: [{ x, z }], corner: { x, z, yaw } | null } | null
//   CorrLayout.saved(key) · CorrLayout.save(key, { giver, watchers, corner }) · CorrLayout.reset(key) · CorrLayout.MAX_WATCHERS
(function (root) {
'use strict';
const KEY = k => 'red-lessons:corr:' + k, MAX_WATCHERS = 3;
const store = () => { try { return root.localStorage || null; } catch (e) { return null; } };
function saved(key) { try { const s = store(); return JSON.parse((s && s.getItem(KEY(key))) || '{}') || {}; } catch (e) { return {}; } }
function save(key, o) { try { const s = store(); if (s) s.setItem(KEY(key), JSON.stringify(o)); } catch (e) { /* no storage */ } }
function reset(key) { try { const s = store(); if (s) s.removeItem(KEY(key)); } catch (e) { /* no storage */ } }
const num = v => typeof v === 'number' && isFinite(v);
const pt = p => !!p && num(p.x) && num(p.z);
const cornerOf = c => pt(c) ? { x: c.x, z: c.z, yaw: num(c.yaw) ? c.yaw : 0 } : null;
function get(world) {
  const d = world && world.corr; if (!d) return null;
  const s = saved(d.key), g = !d.fixed && pt(s.giver) ? s.giver : d.giver;
  return { key: d.key, at: { x: g.x, z: g.z, yaw: num(g.yaw) ? g.yaw : 0 }, seat: d.seat, hide: d.hide || [], fixed: !!d.fixed,
    watchers: (Array.isArray(s.watchers) ? s.watchers : d.watchers || []).filter(pt).slice(0, MAX_WATCHERS).map(p => ({ x: p.x, z: p.z })),
    corner: cornerOf('corner' in s ? s.corner : d.corner), defaults: d };
}

const api = { get, saved, save, reset, MAX_WATCHERS };
root.CorrLayout = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
