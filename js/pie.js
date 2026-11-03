// Little Red’s Lessons — the pie (phase 1.2: the tom.pie and pennock.pie steps). Once Mistress Pennock and Tom both trust her enough (and after
// a dare or two), Tom finds her one afternoon with an idea: Mistress Pennock's pies, cooling on the bakery's board. She takes one; Mistress
// Pennock is out of her door before she's turned round; and she marches the pair of them to the forge, where Master Ferrier, busy at his
// anvil, leaves Tom to her. Then it's Red's: sent home to her mother (Mistress Pennock will be speaking to her), or she can tell Mistress
// Pennock what being Little Red means, and ask to have the same as Tom, there and then.
//
//   • Sent home, she obeys: at home she can tell her mother, or keep it back. Kept back, her mother hears of it from Mistress Pennock the next
//     day, and that evening she's corrected for the pie and for keeping it from her. Told, she's corrected for the pie, and that's the end of it.
//   • Then, some days on, Tom has the same idea again ("it went fine, last time"), and she's caught again, and the choice comes round again.
//   • She tells Mistress Pennock: the two of them in the bakery, Tom across her knee first, then Red, with the other watching (Tom in the
//     corner after his). Mistress Pennock tells her mother herself, after; her mother has a word, but no more (js/evening.js's reprieve).
//
//   Pie.ready(w) → 'first' | 'again' | null · Pie.dare(P, w, tomFigure) (the scene, from js/villagers.js's Tom) · Pie.evening(P, w, force) (at
//   home; → whether a correction was given) · Pie.objective(w)
// Kept in the save (state.pie): { tries, last (the day of the last one), pending: { day, told: null | false } (sent home) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const AGAIN_AFTER = 4;      // (days, before Tom has the same idea again)

const stateOf = w => w.save.state.pie || (w.save.state.pie = { tries: 0, last: 0, pending: null });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.pie); }, { pie: true });
// Whether Tom's minded to it now: the first time (the step on offer: trust enough, and the dares behind them), or again (some days on, until
// she's asked to share his correction); in the afternoon, the pies out, the smith at his anvil; and not while her mother's still to hear of the last.
function ready(w) {
  const q = w.q, c = w.cal, st = stateOf(w);
  if (st.pending || c.minute < H('13:00') || c.minute > H('16:45') || st.last === c.day) return null;
  if (q.stateOf('tom.pie') === 'offered') return 'first';
  return null;      // (once: it doesn't come round again)
}
function objective(w) { if (taking(w)) return 'Tom’s dare: a pie off Mistress Pennock’s board.'; const p = stateOf(w).pending; return p && p.day === w.cal.day && p.told === null ? 'Straight home to Mama, as Mistress Pennock said.' : null; }

const flat = p => new V3(p.x, 0, p.z), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
// (a pie, in her hands)
function pieProp() {
  const T = root.Toon, g = new THREE.Group(), add = (geo, c, y) => { const m = new THREE.Mesh(geo, T.mat(c)); m.position.y = y; m.add(new THREE.Mesh(T.hullGeo(geo, 0.04), T.INKM[0])); g.add(m); };
  add(new THREE.CylinderGeometry(1.75, 1.5, 0.7, 14), '#8a7a6a', -0.6); add(new THREE.SphereGeometry(1.7, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.45, 1), '#d89a50', -0.3);
  return { obj: g, name: 'the pie', grip: new V3(0, 0, 0), radius: 1.8, keep: true, style: 'front' };
}

// ── The dare, and all that follows it in the village. (P: the village; tom: his figure, held by js/villagers.js for it.) Taken, it's hers to do:
// Tom off to watch from the corner, and the pie hers to take off the board (Pie.actions), within the hour; then Mistress Pennock.
let watching = null;      // (Tom, at his corner, while the pie's hers to take)
async function dare(P, w, tom) {
  const S = root.Story, V = P.villagers, W = P.world, sp = W.spots, cal = w.cal;
  const kind = ready(w); if (!kind || !V) return false;
  let pick = null; const mins = n => { cal.advance(n); w.refresh(); };
  await P.converse(S.pieDare({ again: kind === 'again', mins, done: () => { pick = 'done'; }, no: () => { pick = 'no'; } }), { shot: ['red', 'tom'] });
  if (pick !== 'done') return true;
  change(w, s => { s.tries++; s.last = cal.day; s.taking = { day: cal.day, until: cal.minute + 60, kind }; });
  const sill = sp.pieSill, back = flat(sill.at).addScaledVector(new V3(-Math.sin(sill.yaw), 0, -Math.cos(sill.yaw)), 26);
  tom.scene = tom.scene || {}; tom.held = true; watching = tom;
  V.walkTo('tom', back, yawTo(back, sill.at)).then(() => { if (watching === tom) tom.motion.face(yawTo(tom.motion.pos, sill.at)); });
  w.refresh();
  return true;
}
// (the dare taken, the pie not yet: hers to do, at the board, till the hour's gone; then Tom gives it up)
const taking = w => { const t = stateOf(w).taking; return t && t.day === w.cal.day && w.cal.minute <= t.until ? t : null; };
function actions(P, w) {
  const t = stateOf(w).taking; if (!t) return [];
  if (!taking(w)) { change(w, s => { s.taking = null; }); if (watching && P.villagers) { P.villagers.letGo('tom'); } watching = null; return []; }      // (too long: he's given up on her, and off)
  const sill = P.world.spots.pieSill; return sill && !P.busy ? [{ label: 'Take a pie off the board', at: sill.look.clone(), run: () => take(P, w) }] : [];
}
async function take(P, w) {
  const S = root.Story, V = P.villagers, W = P.world, sp = W.spots, m = P.motion, cal = w.cal, rep = w.rep, kind = (stateOf(w).taking || {}).kind || 'first';
  const tom = watching || (V && V.here('tom')); watching = null; change(w, s => { s.taking = null; });
  // (her basket, if she has it on her arm: set down out of the way for this, and back on her arm after)
  let basket = null; if (m.carry && m.carry.kind === 'basket') { const b = m.drop(); basket = { contents: (b.contents || []).slice() }; P.stage.scene.remove(b.obj); }
  const sill = sp.pieSill, pie = (W.pies || [])[2];
  { const to = P.collide(flat(sill.at), 3.2); await Promise.race([m.goTo(to, sill.yaw), P.wait(6)]); m.auto = null; await m.face(sill.yaw); }
  const pp = pie ? pie.getWorldPosition(new V3()) : sill.look;
  await m.reach('R', pp.clone().add(new V3(0, 0.6, 0))); if (pie) pie.visible = false;
  const it = pieProp(); P.stage.scene.add(it.obj); m.hold(it, 'front'); await m.release('R');
  rep.add('mischievous', 1, 'a pie off Mistress Pennock’s board, on Tom’s dare');
  // Out of her door before Red's turned round.
  const pen = V.summon('pennock', 'bakeryDoor'); pen.scene = pen.scene || {}; pen.held = true; pen.motion.face(yawTo(pen.motion.pos, m.pos));
  await m.face(yawTo(m.pos, pen.motion.pos));
  if (tom) { tom.scene = tom.scene || {}; tom.held = true; const near = P.collide(flat(m.pos).add(new V3(10, 0, 8)), 3.2); tom.motion.warp(near, yawTo(near, pen.motion.pos)); tom.rig.root.position.copy(near); }      // (out from behind the corner, caught)
  await P.converse(S.pieCaught(), { shot: ['red', 'pennock'] });
  // (the pie back on her board)
  const held = m.drop(); if (held) P.stage.scene.remove(held.obj); if (pie) pie.visible = true;
  if (basket && root.Chores) { const b = root.Chores.prop('basket', { contents: basket.contents, empty: !basket.contents.length }); P.stage.scene.add(b.obj); m.hold(b, b.style); }
  if (w.q.stateOf('tom.pie') === 'offered') w.complete('tom.pie');
  // To the forge, the three of them, under a fade: there, before the smith at his anvil.
  const fg = sp.forge, side = new V3(Math.cos(fg.yaw), 0, -Math.sin(fg.yaw)), fwd = new V3(Math.sin(fg.yaw), 0, Math.cos(fg.yaw));
  const penAt = P.collide(flat(fg.at).addScaledVector(fwd, -2).addScaledVector(side, 8), 3.2), redAt = P.collide(flat(fg.at).addScaledVector(fwd, -14).addScaledVector(side, -2), 3.2), tomAt = P.collide(flat(fg.at).addScaledVector(fwd, -14).addScaledVector(side, -12), 3.2);
  await w.fade(true);
  const smith = V.summon('smith', 'anvil'); smith.scene = smith.scene || {}; smith.held = true;
  pen.motion.warp(penAt, yawTo(penAt, redAt)); pen.rig.root.position.copy(penAt); m.auto = null; m.warp(redAt, yawTo(redAt, penAt)); P.rig.root.position.copy(redAt);
  if (tom) { tom.motion.warp(tomAt, yawTo(tomAt, penAt)); tom.rig.root.position.copy(tomAt); }
  smith.motion.face(yawTo(smith.motion.pos, penAt));
  cal.advance(10); w.refresh(); await P.wait(0.3); await w.fade(false);
  let answer = null;
  await P.converse(S.pieForge({ again: kind === 'again', obey: () => { answer = 'obey'; }, tell: () => { answer = 'tell'; } }), { shot: ['red', 'pennock'] });
  if (answer === 'tell') {
    // (Tom sent on ahead to the bakery; and a few steps off from the smith, the two of them, before she says it)
    if (tom) { V.walkTo('tom', sp.bakeryDoor.at, null, 0.8).then(() => V.letGo('tom', true)); }
    await P.converse(S.pieAside(), { shot: ['red', 'pennock'] });
    const off = P.collide(flat(redAt).addScaledVector(fwd, -16).addScaledVector(side, -10), 3.2), offP = P.collide(off.clone().addScaledVector(side, 9), 3.2);
    await Promise.all([Promise.race([m.goTo(off, yawTo(off, offP)), P.wait(5)]), Promise.race([V.walkTo('pennock', offP, yawTo(offP, off), 0.7), P.wait(5)])]); m.auto = null;
    pen.motion.face(yawTo(pen.motion.pos, m.pos)); await m.face(yawTo(m.pos, pen.motion.pos));
    await P.converse(S.pieTell(), { shot: ['red', 'pennock'] });
    rep.tell('pennock', 1);
    V.letGo('smith'); if (V.inNow) V.inNow('pennock'); else V.letGo('pennock');
    if (V.here('tom')) V.letGo('tom', true);
    await inTheBakery(w);
    return true;
  }
  V.letGo('smith');
  // Sent home: Mistress Pennock and Tom off up the street (he's kept in, the rest of the day), and her mother still to hear of it.
  change(w, s => { s.pending = { day: cal.day, told: null }; });
  Promise.all([V.walkTo('pennock', sp.bakeryDoor.at, null), tom ? V.walkTo('tom', sp.bakeryDoor.at, null) : null]).then(() => { V.letGo('tom', true); V.letGo('pennock'); });
  w.refresh();
  return true;
}

// ── In the bakery: the two of them, Tom first (and then to the corner), then her, the other watching; Mistress Pennock's paddle to finish.
async function inTheBakery(w) {
  const S = root.Story;
  await w.go('bakery', 'door');      // (under the fade: straight to it, from the street)
  const P = w.P; if (!P) return;
  await P.wait(0.3);
  await P.converse(S.pieBakery(), { shot: ['red', 'pennock'] });
  const r = await root.Correction.run(P, Object.assign({ corrector: 'pennock', fade: on => w.fade(on),
    turns: [{ subject: 'tom', script: S.pieTom, corner: true, cornerDress: { skirt: 'up', drawers: 'down' } }      /* (for a man, the skirt's state is his trousers') */, { subject: 'red', script: S.pieRed }],
    watchers: [{ who: 'red', until: 'red', face: 'shy' }], cornerTime: 6 }));      // (the bench brought out into the middle of the bakery: js/corrlayout.js)
  if (P !== w.P) return;
  // (Tom at the trough after, kneading her dough, for as long as Red's there)
  const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}, tr = P.world.work && P.world.work.trough, C = root.Correction;
  if (tr && C && C.figure) { const tf = C.figure(P, 'tom', looks.tom), at = P.collide(tr.at.clone().setY(0), 3.2); tf.m.warp(at, tr.yaw); tf.rig.root.position.copy(at);
    P.talk.cast.tom = Object.assign({ rig: tf.rig, side: 'right' }, { name: 'Tom', voice: 'tom', tint: '#5a3a2a', bg: '#ead8c8' });
    (async () => { const V3_ = root.THREE.Vector3; while (P === w.P && !P.disposed) { for (const dx of [-1.5, 1.5]) { const p = tr.look.clone().add(new V3_(dx, 0, 0)); await Promise.all([tf.m.reach('L', p.clone().add(new V3_(-1.2, 0, 0))), tf.m.reach('R', p)]); await P.wait(0.5); await Promise.all([tf.m.release('L'), tf.m.release('R')]); } } })(); }
  await P.converse(S.pieAfter(r), { shot: ['red', 'pennock'] });
  w.rep.settle('mischievous', 0.6);
  if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  if (root.Evening) root.Evening.record(w, { what: 'pie', by: 'pennock', informs: true });      // (she tells Red's mother herself: a reprieve at home)
  if (w.q.stateOf('pennock.pie') === 'offered') w.complete('pennock.pie');
  w.refresh();
}

// ── At home, after: the evening she was sent home (tell her mother, or keep it back), or the next, when her mother's heard it from Mistress
// Pennock (kept back), or after the bakery, when Mistress Pennock's told her mother herself.
async function evening(P, w, force) {
  const st = stateOf(w), cal = w.cal, S = root.Story, p = st.pending;
  if (!P || !P.npc) return false;
  if (!p) return false;
  // (the day she was sent home: as soon as she's in)
  if (p.day === cal.day && p.told === null) {
    let told = null;
    await P.wait(0.6); await P.approach();
    await P.converse(S.pieHome({ early: cal.minute < H('18:00'), tell: () => { told = true; }, keep: () => { told = false; } }), { shot: ['red', 'mother'] });
    if (told) { change(w, s => { s.pending = null; }); await root.Evening.owe(P, w, 'pie', { withheld: false }); return true; }      // (seen to at the evening's end: js/evening.js)
    change(w, s => { s.pending.told = false; });
    return false;
  }
  // (a day on, or more: her mother's had a visit from Mistress Pennock)
  if (p.day < cal.day && (cal.minute >= H('17:00') || force)) {
    change(w, s => { s.pending = null; });
    w.rep.add('naughty', 1, 'keeping the pie from her mother');
    await P.wait(0.6); await P.approach();
    await P.converse(S.pieFoundOut(), { shot: ['red', 'mother'] });
    await root.Evening.owe(P, w, 'pie', { withheld: true });
    return true;
  }
  return false;
}
async function correct(P, w, how) {
  const S = root.Story;
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => S.pieMaren(Sc, how) }], fade: on => w.fade(on) });
  w.rep.settle('mischievous', 0.6); if (how.withheld) w.rep.settle('naughty', 0.6);
  if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  return r;
}

const api = { ready, dare, actions, evening, correct, objective, stateOf, AGAIN_AFTER };
root.Pie = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
