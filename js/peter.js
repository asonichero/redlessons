// Little Red’s Lessons — Peter: the first visit to the Fowlers', the notes he leaves in the knot of the old beech, and meeting him there.
//
//   • The first visit: the first time she comes to the Fowlers' (with her mother's basket for the eggs: the first errand asked once the chores
//     are agreed, and asked more often until she's been; or of her own accord). Master Fowler talks Hulda and the wood; then he sends Peter to
//     walk her back as far as the fork, and on the way Peter tells her to look in the old beech, now and then. After it: his notes, his days
//     off in the village (js/villagers.js), and the eggs an errand like any other.
//   • The notes: every few days, a note in the knot of the beech (js/wood.js's spot): "the beech, at five". Read, it's a meeting, and he's
//     there at that hour, and a while after; she can go, or not. Two met, and the meetings at the beech are theirs (peter.friends). Missed, he
//     says so, next time, and minds a little.
//
//   Peter.visited(w) · Peter.firstVisit(P, w, eggs) · Peter.atHolding(P, w) (the first visit, if she comes of her own accord) · Peter.wood(P, w)
//   (the beech: the note, the meeting) · Peter.offToday(w) → his day off in the village, or not · Peter.stateOf(w)
// Kept in the save (state.peter): { visited (a day), noted (the day of the last note read), meet: { day, at }, met: n, missed: n, owed (a word
// about a missed meeting, next time) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
function hash(day, k) { let h = (day * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519); h ^= h >>> 13; return (h >>> 0) / 4294967296; }
const WAITS = 60;      // (minutes he waits at the beech)

const stateOf = w => w.save.state.peter || (w.save.state.peter = { visited: 0, noted: 0, meet: null, met: 0, missed: 0, owed: false });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.peter); }, { peter: true });
const visited = w => !!stateOf(w).visited;
// (his day off in the village: about one in four, once she's been to the Fowlers')
const offToday = w => visited(w) && hash(w.cal.day, 21) < 0.25;
// Whether there's a note in the beech today: every few days (the third day since the last she read, or sometimes the second), from the
// day after the first visit, and not on his days off.
function noteToday(w) {
  const st = stateOf(w), d = w.cal.day; if (!st.visited || d <= st.visited || st.noted === d || offToday(w)) return false;
  const since = d - (st.noted || st.visited); return since >= 3 || (since === 2 && hash(d, 23) < 0.5);
}
// (the hour he names: an afternoon one)
const meetAt = day => H('15:00') + 60 * Math.floor(hash(day, 25) * 3);

// ── The first visit (P: the Fowlers'; eggs: she's come for her mother's eggs).
async function firstVisit(P, w, eggs) {
  const S = root.Story, F = P.fowlers, m = P.motion; if (visited(w)) return;
  change(w, s => { s.visited = w.cal.day; });
  const fig = k => F && F.figs[k];
  for (const k of ['peter', 'fowler']) if (fig(k)) fig(k).held = true;
  try {
    // Master Fowler, by his door: the eggs (if she's come for them), Hulda, the wood.
    const fw = fig('fowler'); if (fw) { const at = P.collide(fw.motion.pos.clone().setY(0).add(new V3(0, 0, 14)), 3.2); await m.goTo(at, Math.atan2(fw.motion.pos.x - at.x, fw.motion.pos.z - at.z)); if (!fw.motion.seat) fw.motion.face(Math.atan2(m.pos.x - fw.motion.pos.x, m.pos.z - fw.motion.pos.z)); }
    await P.converse(S.firstVisit({ eggs }), { shot: ['red', 'fowler'] });
    // Peter walks her back to the fork: down the lane together, and a word on the way.
    const pe = fig('peter'); const lane = P.world.entries.lane, end = new V3(lane.at[0] + 30, 0, lane.at[1]);
    if (pe) { pe.motion.lookAt(null); pe.motion.goTo(P.collide(end.clone().add(new V3(6, 0, 8)), 3.2), -Math.PI / 2, { speed: 0.6 }); }
    await m.goTo(end, -Math.PI / 2, { speed: 0.6 });
    if (pe) { pe.motion.face(Math.atan2(m.pos.x - pe.motion.pos.x, m.pos.z - pe.motion.pos.z)); await m.face(Math.atan2(pe.motion.pos.x - m.pos.x, pe.motion.pos.z - m.pos.z)); }
    await P.converse(S.walkWithPeter(), { shot: ['red', 'peter'] });
    w.rep.trusts('peter', 0.5);
    w.save.change(s => { s.fowlers = s.fowlers || { met: {}, talked: {} }; s.fowlers.met.peter = s.fowlers.met.fowler = true; s.fowlers.talked.peter = s.fowlers.talked.fowler = w.cal.day; }, { fowlers: true });
  } finally { for (const k of ['peter', 'fowler']) if (fig(k)) { fig(k).held = false; fig(k).where = null; } }
  w.refresh();
}
// (coming to the Fowlers' of her own accord, the first time: the visit plays, without the eggs)
function atHolding(P, w) { if (visited(w) || P.busy || !P.fowlers || !P.fowlers.figs.peter || !P.fowlers.figs.fowler) return;      // (both of them about: not at night)
 const e = w.chores && w.save.state.chores && w.save.state.chores.errand; if (e && e.id === 'eggs' && (e.state === 'accepted' || e.state === 'broken')) return; P.act(() => firstVisit(P, w, false)); }

// ── The beech (P: the wood): the note in the knot, when there is one; and Peter there, at the hour he named.
function wood(P, w) {
  const S = root.Story, sp = P.stage.cottage && P.stage.cottage.spots && P.stage.cottage.spots.beech; if (!sp) return null;
  const knot = sp.reach.clone(), W = P.world; W.actions = W.actions || [];
  W.actions.push({ label: 'Look in the knot of the beech', get at() { return knot; }, when: () => noteToday(w) && !P.busy, run: read });
  async function read() {
    const m = P.motion, at = knot.clone().setY(0).addScaledVector(sp.side3, -6); await m.goTo(at, Math.atan2(knot.x - at.x, knot.z - at.z)); m.lookAt(knot);
    await m.reach('R', knot.clone()); await P.wait(0.4); await m.release('R'); m.lookAt(null);
    const at_ = meetAt(w.cal.day); change(w, s => { s.noted = w.cal.day; s.meet = { day: w.cal.day, at: at_ }; });
    await P.converse(S.peterNote(root.Calendar.clockOf(at_).replace(/ in the (morning|afternoon|evening)| at night/, '')), { shot: false, keepCamera: true }); w.refresh();
  }
  // Peter at the beech, from the hour he named, a while; and the meeting, when she comes.
  let fig = null, held = false;
  const meeting = () => { const st = stateOf(w), mt = st.meet; return mt && mt.day === w.cal.day && w.cal.minute >= mt.at - 5 && w.cal.minute < mt.at + WAITS ? mt : null; };
  function show(on) {
    if (on && !fig) { const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}; const rig = root.Toon.make('peter', looks.peter || {}), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, 'peter') });
      const at = sp.at.clone().addScaledVector(sp.side3, 2).addScaledVector(sp.dir, 6); motion.warp(at, Math.atan2(-sp.dir.x, -sp.dir.z)); rig.root.position.copy(at); fig = { rig, motion };
      P.addFigure('peter', { rig, motion, cast: { name: 'Peter', voice: 'peter', tint: '#4a5a3a', bg: '#e2e8d8' } }); }
    if (!on && fig) { P.removeFigure('peter'); fig = null; }
  }
  P.tick(dt => {
    const mt = meeting(); show(!!mt || held); if (fig) { fig.motion.update(dt, null); fig.rig.tick(dt); }
    // (a meeting missed: the hour gone by without her)
    if (!held) lapse(w);
    if (mt && fig && !held && !P.busy && P.motion.pos.distanceTo(fig.motion.pos) < 40) { held = true; P.act(meet); }
  });
  async function meet() {
    const m = P.motion, f = fig, away = m.pos.clone().sub(f.motion.pos).setY(0).normalize(), at = P.collide(f.motion.pos.clone().setY(0).addScaledVector(away, 13), 3.2);
    await m.goTo(at, Math.atan2(f.motion.pos.x - at.x, f.motion.pos.z - at.z)); f.motion.face(Math.atan2(m.pos.x - f.motion.pos.x, m.pos.z - f.motion.pos.z));
    const st = stateOf(w), n = st.met;
    await P.converse(S.beechMeeting(n, { owed: st.owed }), { shot: ['red', 'peter'] });
    w.cal.advance(40); w.rep.trusts('peter', 0.5);
    change(w, s => { s.meet = null; s.met++; s.owed = false; });
    if (stateOf(w).met >= 2 && w.q.stateOf && w.q.stateOf('peter.friends') === 'offered') w.complete('peter.friends');
    held = false; w.refresh();
  }
  return { read, meeting };
}
// (the objective, while a meeting's on: where, and when)
// (a meeting gone by without her: missed, and he'll say so next time)
function lapse(w) { const st = stateOf(w); if (st.meet && (st.meet.day < w.cal.day || w.cal.minute >= st.meet.at + WAITS)) change(w, s => { s.meet = null; s.missed++; s.owed = true; }); }
function objective(w) { lapse(w); const mt = stateOf(w).meet; return mt && mt.day === w.cal.day && w.cal.minute < mt.at + WAITS ? 'Peter, at the old beech, at ' + root.Calendar.clockOf(mt.at).replace(/ in the (morning|afternoon|evening)| at night/, '') + '.' : null; }

const api = { lapse, visited, firstVisit, atHolding, wood, offToday, noteToday, meetAt, objective, stateOf, hash, WAITS };
root.Peter = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
