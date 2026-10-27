// Little Red’s Lessons — 1.3, Into the Wood: the two men who come into it. Holt, the woodsman, at her grandmother's the first time she visits
// after the herbs (hulda.holt, then holt.meet): sat at the table when she comes in, a warning about a stranger, and off to his work. And the
// stranger himself, at the stream (wolfe.meet): of an afternoon or evening, when she's alone on the path, sat on the flat stone; charming,
// asking far more than he tells. What she tells him is kept (rep.disclose), and never shown.
//
//   IntoWood.cabin(P, w) (js/world.js: the cabin, dressed) · IntoWood.wood(P, w) (the wood) · IntoWood.holtDue(w) · IntoWood.wolfeDue(w)
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const CAST = { holt: { name: 'Holt', voice: 'holt', tint: '#4a3a2a', bg: '#e4dccc' }, wolfe: { name: 'The stranger', voice: 'wolfe', tint: '#3a3a44', bg: '#dcdce4' } };

const offered = (w, ref) => !!(w.q && w.q.stateOf && w.q.stateOf(ref) === 'offered');
const holtDue = w => offered(w, 'hulda.holt');
const wolfeDue = w => offered(w, 'wolfe.meet');

// (a figure of one of them, in a place: standing, or sat on one of its seats)
function figure(P, key, at, yaw, seat) {
  const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}, rig = root.Toon.make(key, looks[key] || {}), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, key) });
  if (seat) { const fw = new V3(Math.sin(seat.facing), 0, Math.cos(seat.facing)); motion.warp(seat.at.clone().setY(0).addScaledVector(fw, 0.5), seat.facing); motion.sit(seat); motion.sitW = 1; }
  else { motion.warp(at, yaw); rig.root.position.copy(at); }
  P.addFigure(key, { rig, motion, cast: CAST[key] });
  let gone = false; P.tick(dt => { if (gone) return; motion.update(dt, null); rig.tick(dt); });
  return { rig, motion, remove() { gone = true; P.removeFigure(key); } };
}

// ── The cabin: Holt at the table, the first time after the herbs; his warning; off out of the door.
function cabin(P, w) {
  if (!holtDue(w)) return;
  const W = P.world, seat = W.seats.find(s => s.kind === 'stool'), f = figure(P, 'holt', new V3(4, 0, 4), -Math.PI / 2, seat);
  P.act(async () => {
    const S = root.Story, m = P.motion; await P.wait(0.8);
    const at = P.collide(f.motion.pos.clone().setY(0).add(new V3(-4, 0, 16)), 3.2); await m.goTo(at, yawTo(at, f.motion.pos));
    let careful = true;
    await P.converse(S.holtMeet({ careful: () => { careful = true; }, myself: () => { careful = false; } }), { shot: ['red', 'holt'] });
    w.rep.trusts('holt', careful ? 1 : 0.5); if (!careful) w.rep.add('wilful', 0.5, 'telling Holt she can look after herself');
    w.complete('hulda.holt'); if (offered(w, 'holt.meet')) w.complete('holt.meet');
    // (up, and out of the door to his work)
    if (f.motion.seat) f.motion.stand(); const door = W.exits && W.exits[0] && W.exits[0].at ? W.exits[0].at.clone() : new V3(-10, 0, 34);
    await Promise.race([f.motion.goTo(P.collide(door.clone().setY(0), 3), null), P.wait(5)]); f.remove();
    await P.converse(S.holtGone(), { shot: ['red', 'gran'] });
    w.cal.advance(20); w.refresh();
  });
}

// ── The wood: the stranger at the stream, when she's on her own (not with Peter at the beech), of an afternoon or evening.
function wood(P, w) {
  const sp = P.stage.cottage && P.stage.cottage.spots && P.stage.cottage.spots.stream; if (!sp || !sp.seat) return null;
  let f = null, met = false;
  P.tick(() => {
    const due = wolfeDue(w) && !met && !(P.peter && P.peter.meeting && P.peter.meeting());
    if (due && !f) f = figure(P, 'wolfe', null, 0, sp.seat);
    if (!due && f && !met) { f.remove(); f = null; }
    if (f && !met && !P.busy && P.motion.pos.distanceTo(f.motion.pos) < 55) { met = true; P.act(meet); }
  });
  async function meet() {
    const S = root.Story, m = P.motion, rep = w.rep;
    const away = m.pos.clone().sub(f.motion.pos).setY(0).normalize(), at = P.collide(f.motion.pos.clone().setY(0).addScaledVector(away, 14), 3.2);
    await m.goTo(at, yawTo(at, f.motion.pos));
    await P.converse(S.wolfeMeet({ cabin: () => rep.disclose('hulda-cabin'), alone: () => rep.disclose('hulda-alone'), rose: () => {}, red: () => rep.disclose('little-red') }), { shot: ['red', 'wolfe'] });
    w.complete('wolfe.meet'); w.cal.advance(15);
    // (up, and off among the trees, away from the path)
    f.motion.stand(); const off = P.collide(f.motion.pos.clone().setY(0).addScaledVector(sp.side3, 70).addScaledVector(sp.dir, 20), 3);
    const fig = f; Promise.race([fig.motion.goTo(off, null), P.wait(6)]).then(() => fig.remove());
    await P.wait(1.5);
    await P.converse(S.wolfeGone(), { shot: false, keepCamera: true });
    w.refresh();
  }
  return { meet };
}

const api = { cabin, wood, holtDue, wolfeDue };
root.IntoWood = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
