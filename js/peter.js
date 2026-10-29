// Little Red’s Lessons — Peter: the first visit to the Fowlers', the notes he leaves in the knot of the old beech, and meeting him there.
//
//   • The first visit: the first time she comes up the Fowlers' lane (with her mother's basket for the eggs: the first errand asked once the
//     chores are agreed; or of her own accord), Master Fowler meets her at his gate: the eggs, Hulda, the wood. Then he lets her in, and
//     points out Peter, and leaves her to find him. Talking to him (shy, at first; then the linnets, Tom in the duck pond, the nets), his
//     grandfather crosses the yard to them, reaching them as the talk ends, and sends Peter to walk her back. Then the two of them at the
//     meadow gate, on the wood's side: the old beech; and Peter off home across the meadow. After it: his notes, his days off in the village
//     (js/villagers.js), the gate open to her, and the eggs an errand like any other.
//   • The notes: every few days, a note in the knot of the beech (js/wood.js's spot): "the beech, at five". Read, it's a meeting, and he's
//     there at that hour, and a while after; she can go, or not. Two met, and the meetings at the beech are theirs (peter.friends). Missed, he
//     says so, next time, and minds a little.
//
//   Peter.visited(w) · .letIn(w) · .fowlerAtGate(w) · .awaiting(w) · .atHolding(P, w) (the gate, the first time) · .firstTalk / .sendHome (js/holding.js:
//   Peter, the first time) · Peter.wood(P, w)
//   (the beech: the note, the meeting) · Peter.offToday(w) → his day off in the village, or not · Peter.stateOf(w)
// Kept in the save (state.peter): { letIn (a day: Master Fowler's let her in), visited (a day), noted (the day of the last note read), meet: { day, at }, met: n, missed: n, owed (a word
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
const offToday = w => visited(w) && hash(w.cal.day, 21) < 0.25 && !(w.chores && w.chores.pick && w.chores.pick(w.cal.day) === 'eggs');      // (never the day she's sent for the eggs)
// Whether there's a note in the beech today: every few days (the third day since the last she read, or sometimes the second), from the
// day after the first visit, and not on his days off.
function noteToday(w) {
  const st = stateOf(w), d = w.cal.day; if (!st.visited || d <= st.visited || st.noted === d || offToday(w)) return false;
  const since = d - (st.noted || st.visited); return since >= 3 || (since === 2 && hash(d, 23) < 0.5);
}
// (the hour he names: an afternoon one)
const meetAt = day => H('15:00') + 60 * Math.floor(hash(day, 25) * 3);

// ── The first visit. Master Fowler at his gate, the first time she comes up the lane (P: the Fowlers'): the eggs, if she's come for them;
// Hulda, the wood; then he lets her in, and points out Peter.
const letIn = w => !!stateOf(w).letIn;
const fowlerAtGate = w => !letIn(w);
const awaiting = w => letIn(w) && !visited(w);      // (let in, and Peter not talked to yet)
function atHolding(P, w) {
  const F = P.fowlers, fw = F && F.figs.fowler, pe = F && F.figs.peter; if (letIn(w) || P.busy || !fw || !pe || fw.held || fw.where !== 'gate') return;      // (both of them about: not at night)
  if (P.motion.pos.distanceTo(fw.motion.pos) < 70) P.act(() => atGate(P, w));
}
async function atGate(P, w) {
  const S = root.Story, F = P.fowlers, fw = F.figs.fowler, pe = F.figs.peter, m = P.motion, W = P.world, sp = W.spots;
  const eggs = !!(w.chores && w.chores.owes && w.chores.owes('eggs')); fw.held = true;
  try {
    await m.goTo(sp.lane.at, sp.lane.yaw); fw.motion.lookAt(null); fw.motion.face(Math.atan2(m.pos.x - fw.motion.pos.x, m.pos.z - fw.motion.pos.z));
    await P.converse(S.firstVisit({ eggs }), { shot: ['red', 'fowler'] });
    if (eggs) w.chores.fulfil(P, 'eggs');      // (the basket, over the gate)
    // (the gate swung open; and he points out the boy, wherever he is)
    W.holdingGate.target = 1; change(w, s => { s.letIn = w.cal.day; });
    fw.motion.face(Math.atan2(pe.motion.pos.x - fw.motion.pos.x, pe.motion.pos.z - fw.motion.pos.z)); await P.wait(0.8);
    await P.converse(S.letIn(pe.where), { shot: ['red', 'fowler'] });
    w.save.change(s => { s.fowlers = s.fowlers || { met: {}, talked: {} }; s.fowlers.met.fowler = true; s.fowlers.talked.fowler = w.cal.day; }, { fowlers: true });
    // (and back to his own work: the garden, walked to)
    const g = sp.garden; fw.motion.goTo(g.at, g.yaw, { speed: 0.5 }).then(() => { if (!fw.held) return; fw.held = false; fw.where = 'garden'; fw.motion.lookAt(g.look); });
  } catch (e) { fw.held = false; throw e; }
  w.refresh();
}
// The first talk with Peter (js/holding.js's talk): shy, and then easier; and his grandfather calling over from where he's settled, as it
// ends, to send Peter to walk her home. → the conversation.
function firstTalk(P, w, fw, pe) {
  const S = root.Story;
  return S.peterFirst().concat([{ run: async () => { if (fw) { fw.motion.lookAt(null); if (!fw.motion.seat) fw.motion.face(Math.atan2(P.motion.pos.x - fw.motion.pos.x, P.motion.pos.z - fw.motion.pos.z)); } } }], S.fowlerSends());      // (his grandfather, from where he's settled, calling over)
}
// Sent home: the fade, and the two of them at the meadow gate, on the wood's side (js/wood.js); the beech; and Peter off back across the
// meadow, and her day her own again. (figs: the Fowlers' figures, held)
async function sendHome(P, w) {
  const S = root.Story;
  change(w, s => { s.visited = w.cal.day; }); w.rep.trusts('peter', 0.5);
  w.save.change(s => { s.fowlers = s.fowlers || { met: {}, talked: {} }; s.fowlers.met.peter = s.fowlers.met.fowler = true; s.fowlers.talked.peter = s.fowlers.talked.fowler = w.cal.day; }, { fowlers: true });
  w.cal.advance(30);
  // (Peter put beside her the moment the meadow's built, under the fade)
  const going = w.go('wood', 'village'); let Q = null;
  for (let k = 0; k < 400 && !(Q = w.P !== P && w.P); k++) await new Promise(r => setTimeout(r, 20));
  if (!Q) { await going; return; }
  const m = Q.motion, side = new V3(Math.cos(m.yaw), 0, -Math.sin(m.yaw)), at = Q.collide(m.pos.clone().addScaledVector(side, 13), 3.2);
  const fig = figure(Q, at, Math.atan2(m.pos.x - at.x, m.pos.z - at.z)); let gone = false;
  Q.tick(dt => { if (gone) return; fig.motion.update(dt, null); fig.rig.tick(dt); });
  await going;
  Q.act(async () => {
    await m.face(Math.atan2(fig.motion.pos.x - m.pos.x, fig.motion.pos.z - m.pos.z));
    await Q.converse(S.walkWithPeter(), { shot: ['red', 'peter'] });
    // (and off he goes, back across the meadow to the fork, and his nets)
    const away = Q.collide(fig.motion.pos.clone().add(new V3(90, 0, -160)), 3.2); await Promise.race([fig.motion.goTo(away, null), Q.wait(5)]);
    gone = true; Q.removeFigure('peter'); w.refresh();
  });
}
// (Peter, as a figure in a place that hasn't its own: the wood)
function figure(P, at, yaw) {
  const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}; const rig = root.Toon.make('peter', looks.peter || {}), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, 'peter') });
  motion.warp(at, yaw); rig.root.position.copy(at);
  P.addFigure('peter', { rig, motion, cast: { name: 'Peter', voice: 'peter', tint: '#4a5a3a', bg: '#e2e8d8' } });
  return { rig, motion };
}

// ── The beech (P: the wood): the note in the knot, when there is one; and Peter there, at the hour he named.
function wood(P, w) {
  const S = root.Story, sp = P.stage.cottage && P.stage.cottage.spots && P.stage.cottage.spots.beech; if (!sp) return null;
  const knot = sp.reach.clone(), W = P.world; W.actions = W.actions || [];
  W.actions.push({ label: 'Look in the knot of the beech', get at() { return knot; }, when: () => noteToday(w) && !P.busy, run: read });
  // (there before the hour he named: hers to wait, the time passing under a fade, and him coming along the path to her)
  const early = () => { const mt = stateOf(w).meet; return mt && mt.day === w.cal.day && w.cal.minute < mt.at - 5 ? mt : null; };
  W.actions.push({ label: 'Wait for Peter', get at() { return sp.at.clone().setY(12); }, when: () => !!early() && !P.busy && P.motion.pos.distanceTo(sp.at) < 40, run: waitFor });
  async function waitFor() {
    const mt = early(); if (!mt) return;
    await w.fade(true); w.cal.advance(mt.at - w.cal.minute); show(true);
    const dest = fig.motion.pos.clone(), from = P.collide(dest.clone().addScaledVector(sp.dir, 46), 3.2); fig.motion.warp(from, Math.atan2(dest.x - from.x, dest.z - from.z)); fig.rig.root.position.copy(from);
    for (let i = 0; i < 20; i++) P.frame(1 / 60);
    await w.fade(false);
    await Promise.race([fig.motion.goTo(dest, Math.atan2(-sp.dir.x, -sp.dir.z)), P.wait(6)]);      // (along the path to her: then the meeting, as she's there)
  }
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
    if (on && !fig) fig = figure(P, sp.at.clone().addScaledVector(sp.side3, 2).addScaledVector(sp.dir, 6), Math.atan2(-sp.dir.x, -sp.dir.z));
    if (!on && fig) { P.removeFigure('peter'); fig = null; }
  }
  P.tick(dt => {
    const mt = meeting(); show(!!mt || held); if (fig) { fig.motion.update(dt, null); fig.rig.tick(dt); }
    // (a meeting missed: the hour gone by without her)
    if (!held) lapse(w);
    if (mt && fig && !held && !P.busy && P.motion.pos.distanceTo(fig.motion.pos) < 40) { held = true; P.act(meet); }
    // (passing the beech with a note in it, the first time that day: she remembers what he said, and walks on; hers to look or not)
    const st = stateOf(w); if (noteToday(w) && st.passed !== w.cal.day && P.talk && !P.talk.playing && P.motion.pos.distanceTo(knot.clone().setY(0)) < 34) {
      change(w, s => { s.passed = w.cal.day; }); P.talk.muse(S.beechPassing(), { face: 'shy' }); }
  });
  async function meet() {
    const m = P.motion, f = fig, away = m.pos.clone().sub(f.motion.pos).setY(0).normalize(), at = P.collide(f.motion.pos.clone().setY(0).addScaledVector(away, 13), 3.2);
    await m.goTo(at, Math.atan2(f.motion.pos.x - at.x, f.motion.pos.z - at.z)); f.motion.face(Math.atan2(m.pos.x - f.motion.pos.x, m.pos.z - f.motion.pos.z));
    const st = stateOf(w), n = st.met;
    await P.converse(S.beechMeeting(n, { owed: st.owed }), { shot: ['red', 'peter'] });
    await notices(P, w);
    w.cal.advance(40); w.rep.trusts('peter', 0.5);
    await w.fade(true);      // (and he goes, under a fade: she's on her own again at the beech after)
    change(w, s => { s.meet = null; s.met++; s.owed = false; }); w.save.flag('met-peter', w.cal.day);
    if (stateOf(w).met >= 2 && w.q.stateOf && w.q.stateOf('peter.friends') === 'offered') w.complete('peter.friends');
    held = false; show(false); w.refresh(); for (let i = 0; i < 10; i++) P.frame(1 / 60);
    await w.fade(false);
  }
  return { read, meeting };
}
// He notices she's changed (peter.notices, 1.3): at the beech, or talking at the Fowlers'. How much she tells him is hers.
async function notices(P, w) {
  if (!(w.q && w.q.stateOf && w.q.stateOf('peter.notices') === 'offered')) return false;
  let how = null; const pick = k => () => { how = k; };
  await P.converse(root.Story.peterNotices({ all: pick('all'), some: pick('some'), none: pick('none') }), { shot: ['red', 'peter'] });
  if (how === 'all') { w.rep.tell('peter', 1); w.rep.trusts('peter', 1); } else if (how === 'some') w.rep.trusts('peter', 0.5);
  w.complete('peter.notices'); return true;
}
// (the objective, while a meeting's on: where, and when)
// (a meeting gone by without her: missed, and he'll say so next time)
function lapse(w) { const st = stateOf(w); if (st.meet && (st.meet.day < w.cal.day || w.cal.minute >= st.meet.at + WAITS)) change(w, s => { s.meet = null; s.missed++; s.owed = true; }); }
function objective(w) { lapse(w); const mt = stateOf(w).meet; return mt && mt.day === w.cal.day && w.cal.minute < mt.at + WAITS ? 'Peter, at the old beech, at ' + root.Calendar.clockOf(mt.at).replace(/ in the (morning|afternoon|evening)| at night/, '') + '.' : null; }

const api = { notices, lapse, visited, letIn, fowlerAtGate, awaiting, atHolding, firstTalk, sendHome, wood, offToday, noteToday, meetAt, objective, stateOf, hash, WAITS };
root.Peter = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
