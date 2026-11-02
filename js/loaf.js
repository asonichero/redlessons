// Little Red’s Lessons — the loaf: her mother's, on the board at home, for supper. Red can put it in her basket (naughty: it's not hers to
// take); her mother finds it gone, that evening, and asks. Still in her basket, Red can own up and put it back (half the naughtiness of
// taking it gone again), or say she doesn't know. Gone, it's owned up to, and a correction owed for the evening's end.
//
// Where it goes: Peter, on his days in the village, sometimes lingers by the pond, watching the ducks; talk to him there with no bread about
// her, and he wishes he'd a crust for them (the idea, planted). With bread in her basket (the loaf from home, or Master Pennock's loaves on
// the bread errand), talk to him on the green and he sees it: they can feed the ducks together, and it's gone, every crumb. The loaves were
// her mother's errand: they can't be handed over now, and that's a correction too.
//
//   Loaf.peter(P, w, f, V) (from js/villagers.js: talking to Peter on the green; → true when it's the ducks' talk) · Loaf.evening(P, w) (at
//   home, before supper: her mother asks) · Loaf.correct(P, w, how) (the correction: js/evening.js)
// Kept in the save: state.chores.loaf = { day, state: 'taken' | 'back' | 'kept' | 'ducks' | 'gone' }; the bread errand's state 'fed';
// state.flags['ducks-wish'] (the day Peter wished for bread).
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const flat = p => new V3(p.x, 0, p.z), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const LOAF = 'the loaf', LOAVES = 'the loaves';
const chores = w => w.save.state.chores || {};
const change = (w, fn) => w.save.change(s => { s.chores = s.chores || {}; fn(s.chores); }, { chores: true });
const basket = P => root.Chores && root.Chores.basketOf(P);
// (what bread's in her basket: the loaf from home, or the loaves from the bakery)
const breadIn = P => { const b = basket(P), c = (b && b.contents) || []; return c.includes(LOAF) ? LOAF : c.includes(LOAVES) ? LOAVES : null; };

// Peter on the green. → true if it was the ducks' talk (the rest of his talk is js/villagers.js's).
async function peter(P, w, f, V) {
  const S = root.Story, what = breadIn(P), d = w.cal.day, fl = w.save.state.flags || {};
  if (what) {
    let yes = false;
    await P.converse(S.ducksAsk(what, { yes: () => { yes = true; } }), { shot: ['red', 'peter'] });
    if (yes) await feed(P, w, f, V, what);
    return true;
  }
  if (f.want && f.want.stand === 'pondSide' && fl['ducks-wish'] !== d) {
    await P.converse(S.ducksWish(), { shot: ['red', 'peter'] }); w.save.flag('ducks-wish', d);
    return true;
  }
  return false;
}
// The two of them at the water's edge, throwing it in a crumb at a time, the ducks in a scrum for it; and it's gone.
async function feed(P, w, f, V, what) {
  const S = root.Story, m = P.motion, sp = P.world.spots && P.world.spots.pondSide; if (!sp) return;
  const pond = flat(sp.look), edge = flat(sp.at), side = new V3(Math.cos(sp.yaw), 0, -Math.sin(sp.yaw));
  const me = P.collide(edge.clone().addScaledVector(side, -5), 3.2), him = P.collide(edge.clone().addScaledVector(side, 5), 3.2);
  await Promise.all([m.goTo(me, yawTo(me, pond)), V && V.walkTo ? Promise.race([V.walkTo('peter', him, yawTo(him, pond)), P.wait(8)]) : null]);
  if (f) f.motion.face(yawTo(f.motion.pos, pond));
  const throwing = { on: true }, toss = async (mo, at, h) => { while (throwing.on) { await mo.reach(h, at.clone().setY(9)); await P.wait(0.25); await mo.release(h); await P.wait(0.6 + Math.random() * 0.5); } };
  const going = [toss(m, me.clone().lerp(pond, 0.2), 'L')]; if (f) going.push(toss(f.motion, him.clone().lerp(pond, 0.2), 'R'));      // (hers with her left: the basket's on her right arm)
  await P.converse(S.ducksFed(what), { shot: ['red', 'peter'] });
  throwing.on = false; await Promise.all(going);
  const b = basket(P); if (b && root.Chores) root.Chores.takeOut(b, what);
  if (b && b === P.bag) change(w, c => { if (c.bag) c.bag.contents = b.contents.slice(); });
  if (what === LOAF) change(w, c => { c.loaf = { day: w.cal.day, state: 'ducks' }; });
  else change(w, c => { if (c.errand && c.errand.id === 'bread') c.errand.state = 'fed'; });      // (her mother's errand: nothing to hand over now)
  w.rep.add('naughty', what === LOAVES ? 1 : 0.5, what === LOAVES ? 'Mama’s loaves, thrown to the ducks' : 'Mama’s loaf, thrown to the ducks');
  w.rep.add('mischievous', 0.5, 'feeding the ducks with Peter'); w.rep.trusts('peter', 1);
  w.cal.advance(15); w.refresh();
  if (P.talk) P.talk.muse(S.ducksAfter(what), { face: 'wince' });
}

// At home, before supper: her mother's found the loaf gone off the board (or the loaves never came home). → whether a correction's owed.
async function evening(P, w) {
  const S = root.Story, c = chores(w), d = w.cal.day, l = c.loaf && c.loaf.day === d ? c.loaf : null, fed = c.errand && c.errand.id === 'bread' && c.errand.state === 'fed' && c.day === d;
  if (!l && !fed) return false;
  if (l && (l.state === 'back' || l.state === 'kept' || l.state === 'asked')) { if (!fed) return false; }
  await P.wait(0.4); await P.approach();
  if (fed && !(c.loaf && c.loaf.asked === d)) {
    await P.converse(S.loavesGone(), { shot: ['red', 'mother'] });
    change(w, x => { x.loaf = Object.assign({}, x.loaf, { asked: d }); });
    await root.Evening.owe(P, w, 'loaf', { bakery: true, ducks: true });
    return true;
  }
  if (!l || l.state === 'back' || l.state === 'kept') return false;
  const has = (basket(P) && (basket(P).contents || []).includes(LOAF)) || (P.motion.carry && P.motion.carry.kind === 'loaf');
  if (has) {
    let back = false;
    await P.converse(S.loafAsk({ back: () => { back = true; } }), { shot: ['red', 'mother'] });
    if (back) { putBack(P, w); w.rep.add('naughty', -0.5, 'owning up to the loaf, and putting it back'); change(w, x => { x.loaf.state = 'back'; }); }
    else { w.rep.add('naughty', 0.5, 'saying she didn’t know where the loaf was'); change(w, x => { x.loaf.state = 'kept'; }); }
    return false;
  }
  const ducks = l.state === 'ducks';
  await P.converse(S.loafGone(ducks), { shot: ['red', 'mother'] });
  change(w, x => { x.loaf.state = 'asked'; });
  await root.Evening.owe(P, w, 'loaf', { ducks });
  return true;
}
// (out of her basket, and back on the board)
function putBack(P, w) {
  const b = basket(P); if (b && root.Chores) root.Chores.takeOut(b, LOAF);
  if (b && b === P.bag) change(w, c => { if (c.bag) c.bag.contents = b.contents.slice(); });
  if (P.motion.carry && P.motion.carry.kind === 'loaf') { const it = P.motion.drop(); if (it) it.obj.visible = false; }
  const it = P.world.items.find(x => x.kind === 'loaf'); if (it) { it.away = false; it.obj.visible = true; }
  change(w, c => { if (c.away) c.away.loaf = 0; });
  w.refresh();
}
async function correct(P, w, how) {
  const S = root.Story;
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => S.loafCorrection(Sc, how) }], fade: on => w.fade(on) });
  w.rep.settle('naughty', 0.6); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  return r;
}

const api = { peter, feed, evening, correct, breadIn, LOAF, LOAVES };
root.Loaf = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
