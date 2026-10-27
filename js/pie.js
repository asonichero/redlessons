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
//     corner after his). Mistress Pennock tells her mother herself, after; her mother has a word, but no more.
//
//   Pie.ready(w) → 'first' | 'again' | null · Pie.dare(P, w, tomFigure) (the scene, from js/villagers.js's Tom) · Pie.evening(P, w, force) (at
//   home) · Pie.objective(w)
// Kept in the save (state.pie): { tries, last (the day of the last one), pending: { day, told: null | false } (sent home), disclosed (a day) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const AGAIN_AFTER = 4;      // (days, before Tom has the same idea again)

const stateOf = w => w.save.state.pie || (w.save.state.pie = { tries: 0, last: 0, pending: null, disclosed: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.pie); }, { pie: true });
// Whether Tom's minded to it now: the first time (the step on offer: trust enough, and the dares behind them), or again (some days on, until
// she's asked to share his correction); in the afternoon, the pies out, the smith at his anvil; and not while her mother's still to hear of the last.
function ready(w) {
  const q = w.q, c = w.cal, st = stateOf(w);
  if (st.pending || c.minute < H('13:00') || c.minute > H('16:45') || st.last === c.day) return null;
  if (q.stateOf('tom.pie') === 'offered') return 'first';
  if (q.done('tom.pie') && q.stateOf('pennock.pie') === 'offered' && c.day - st.last >= AGAIN_AFTER) return 'again';
  return null;
}
function objective(w) { const p = stateOf(w).pending; return p && p.day === w.cal.day && p.told === null ? 'Straight home to Mama, as Mistress Pennock said.' : null; }

const flat = p => new V3(p.x, 0, p.z), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
// (a pie, in her hands)
function pieProp() {
  const T = root.Toon, g = new THREE.Group(), add = (geo, c, y) => { const m = new THREE.Mesh(geo, T.mat(c)); m.position.y = y; m.add(new THREE.Mesh(T.hullGeo(geo, 0.04), T.INKM[0])); g.add(m); };
  add(new THREE.CylinderGeometry(1.75, 1.5, 0.7, 14), '#8a7a6a', -0.6); add(new THREE.SphereGeometry(1.7, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.45, 1), '#d89a50', -0.3);
  return { obj: g, name: 'the pie', grip: new V3(0, 0, 0), radius: 1.8, keep: true, style: 'front' };
}

// ── The dare, and all that follows it in the village. (P: the village; tom: his figure, held by js/villagers.js for it.)
async function dare(P, w, tom) {
  const S = root.Story, V = P.villagers, W = P.world, sp = W.spots, m = P.motion, cal = w.cal, rep = w.rep;
  const kind = ready(w); if (!kind || !V) return false;
  let pick = null; const mins = n => { cal.advance(n); w.refresh(); };
  await P.converse(S.pieDare({ again: kind === 'again', mins, done: () => { pick = 'done'; }, no: () => { pick = 'no'; } }), { shot: ['red', 'tom'] });
  if (pick !== 'done') return true;
  change(w, s => { s.tries++; s.last = cal.day; });
  // To the board: Tom hanging back by the corner; her hand to the nearest pie, and it's hers.
  const sill = sp.pieSill, pie = (W.pies || [])[2];
  const back = flat(sill.at).addScaledVector(new V3(-Math.sin(sill.yaw), 0, -Math.cos(sill.yaw)), 26);
  V.walkTo('tom', back, yawTo(back, sill.at));
  await V.lead(sill.at, sill.yaw);
  const pp = pie ? pie.getWorldPosition(new V3()) : sill.look;
  await m.reach('R', pp.clone().add(new V3(0, 0.6, 0))); if (pie) pie.visible = false;
  const it = pieProp(); P.stage.scene.add(it.obj); m.hold(it, 'front'); await m.release('R');
  rep.add('mischievous', 1, 'a pie off Mistress Pennock’s board, on Tom’s dare');
  // Out of her door before Red's turned round.
  const pen = V.summon('pennock', 'bakeryDoor'); pen.motion.face(yawTo(pen.motion.pos, m.pos));
  await m.face(yawTo(m.pos, pen.motion.pos));
  await P.converse(S.pieCaught(), { shot: ['red', 'pennock'] });
  // (the pie back on her board)
  const held = m.drop(); if (held) P.stage.scene.remove(held.obj); if (pie) pie.visible = true;
  if (w.q.stateOf('tom.pie') === 'offered') w.complete('tom.pie');
  // To the forge, the three of them: her in front, the two of them before her.
  const fg = sp.forge, smith = V.summon('smith', 'anvil'), side = new V3(Math.cos(fg.yaw), 0, -Math.sin(fg.yaw)), fwd = new V3(Math.sin(fg.yaw), 0, Math.cos(fg.yaw));
  const penAt = flat(fg.at).addScaledVector(fwd, -2).addScaledVector(side, 8), redAt = flat(fg.at).addScaledVector(fwd, -14).addScaledVector(side, -2), tomAt = flat(fg.at).addScaledVector(fwd, -14).addScaledVector(side, -12);
  await Promise.all([V.walkTo('pennock', penAt, null, 0.75), V.walkTo('tom', tomAt, null, 0.75), V.lead(redAt, null)]);
  smith.motion.face(yawTo(smith.motion.pos, penAt)); pen.motion.face(yawTo(penAt, redAt)); await m.face(yawTo(m.pos, penAt)); tom.motion.face(yawTo(tomAt, penAt));
  mins(25);
  let answer = null;
  await P.converse(S.pieForge({ again: kind === 'again', obey: () => { answer = 'obey'; }, tell: () => { answer = 'tell'; } }), { shot: ['red', 'pennock'] });
  V.letGo('smith');
  if (answer === 'tell') {
    rep.tell('pennock', 1);
    await V.lead(sp.bakeryDoor.at, sp.bakeryDoor.yaw);
    V.letGo('tom', true); V.letGo('pennock');
    await inTheBakery(w);
    return true;
  }
  // Sent home: Mistress Pennock and Tom off up the street (he's kept in, the rest of the day), and her mother still to hear of it.
  change(w, s => { s.pending = { day: cal.day, told: null }; });
  Promise.all([V.walkTo('pennock', sp.bakeryDoor.at, null), V.walkTo('tom', sp.bakeryDoor.at, null)]).then(() => { V.letGo('tom', true); V.letGo('pennock'); });
  w.refresh();
  return true;
}

// ── In the bakery: the two of them, Tom first (and then to the corner), then her, the other watching; Mistress Pennock's paddle to finish.
async function inTheBakery(w) {
  const S = root.Story;
  await w.go('bakery', 'door');
  const P = w.P; if (!P) return;
  await P.wait(0.6);
  await P.converse(S.pieBakery(), { shot: ['red', 'pennock'] });
  const r = await root.Correction.run(P, { corrector: 'pennock', fade: on => w.fade(on),
    turns: [{ subject: 'tom', script: S.pieTom, corner: true, cornerDress: { skirt: 'up', drawers: 'down' } }      /* (for a man, the skirt's state is his trousers') */, { subject: 'red', script: S.pieRed }],
    watchers: [{ who: 'red', at: [-26, 14], until: 'red', face: 'shy' }], cornerTime: 6 });
  if (P !== w.P) return;
  await P.converse(S.pieAfter(r), { shot: ['red', 'pennock'] });
  w.rep.settle('mischievous', 0.6);
  if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  change(w, s => { s.disclosed = w.cal.day; });
  if (w.q.stateOf('pennock.pie') === 'offered') w.complete('pennock.pie');
  w.refresh();
}

// ── At home, after: the evening she was sent home (tell her mother, or keep it back), or the next, when her mother's heard it from Mistress
// Pennock (kept back), or after the bakery, when Mistress Pennock's told her mother herself.
async function evening(P, w, force) {
  const st = stateOf(w), cal = w.cal, S = root.Story, p = st.pending;
  if (!P || !P.npc) return;
  if (st.disclosed && st.disclosed <= cal.day && (cal.minute >= H('17:00') || force)) {
    change(w, s => { s.disclosed = 0; });
    await P.wait(0.6); await P.approach(); await P.converse(S.pieMotherKnows(), { shot: ['red', 'mother'] }); return;
  }
  if (!p) return;
  // (the day she was sent home: as soon as she's in)
  if (p.day === cal.day && p.told === null) {
    let told = null;
    await P.wait(0.6); await P.approach();
    await P.converse(S.pieHome({ tell: () => { told = true; }, keep: () => { told = false; } }), { shot: ['red', 'mother'] });
    if (told) { change(w, s => { s.pending = null; }); await correct(P, w, { withheld: false }); }
    else change(w, s => { s.pending.told = false; });
    return;
  }
  // (a day on, or more: her mother's had a visit from Mistress Pennock)
  if (p.day < cal.day && (cal.minute >= H('17:00') || force)) {
    change(w, s => { s.pending = null; });
    w.rep.add('naughty', 1, 'keeping the pie from her mother');
    await P.wait(0.6); await P.approach();
    await P.converse(S.pieFoundOut(), { shot: ['red', 'mother'] });
    await correct(P, w, { withheld: true });
  }
}
async function correct(P, w, how) {
  const S = root.Story;
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => S.pieMaren(Sc, how) }], fade: on => w.fade(on) });
  if (P !== w.P) return;
  await P.converse(S.pieMarenAfter(how), { shot: ['red', 'mother'] });
  w.rep.settle('mischievous', 0.6); if (how.withheld) w.rep.settle('naughty', 0.6);
  if (r && r.rose) w.save.flag('rose-said', w.cal.day);
}

const api = { ready, dare, evening, objective, stateOf, AGAIN_AFTER };
root.Pie = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
