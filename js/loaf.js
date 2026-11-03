// Little Red’s Lessons — the loaf: her mother's, on the board at home, for supper. Red can put it in her basket (naughty: it's not hers to
// take); her mother finds it gone, that evening, and asks. Still in her basket, Red can own up and put it back (half the naughtiness of
// taking it gone again), or say she doesn't know. Gone, it's owned up to, and a correction owed for the evening's end.
//
// Where it goes: Peter, on his days in the village, sometimes lingers by the pond, watching the ducks; talk to him there with no bread about
// her, and he wishes he'd a crust for them (the idea, planted). With bread in her basket (the loaf from home, or Master Pennock's loaves on
// the bread errand), talk to him on the green and he sees it: they can feed the ducks together, and it's gone, every crumb. The loaves were
// her mother's errand: they can't be handed over now, and that's a correction too.
//
// The loaf's eaten, a piece at each meal (breakfast, dinner, supper), and some of it can go to the ducks; when it's down to the heel her mother
// asks Red to fetch another from Mistress Pennock at her counter (in her basket, home, and on the board). Taken and still in her basket, it can
// go back on the board before her mother notices it's gone (she notices at dinner, if she's home for it, or before supper). Some of it fed to
// the ducks and the rest back on the board, she notices it's gone down, at the next meal, and asks: "I was hungry" (a lie, and naughty), and
// she takes it for wilful, and chides her for eating between meals, one toward the week's three (js/chores.js); or the truth, and that's
// naughty, and a correction owed for the evening's end.
//
//   Loaf.peter(P, w, f, V) (from js/villagers.js: talking to Peter on the green; → true when it's the ducks' talk) · Loaf.evening(P, w, o) (at
//   home, before supper, or at the dinner table (o.table): her mother asks) · Loaf.eat(P, w, meal) (a meal's piece of it) · Loaf.actions(P, w,
//   area) · Loaf.objective(w) · Loaf.fresh(w) (a new loaf on the board: Master Pennock's loaves home) · Loaf.correct(P, w, how) (js/evening.js)
// Kept in the save: state.chores.loaf = { day, state: 'taken' | 'back' | 'kept' | 'ducks' | 'gone' | 'asked' }; state.chores.bread = { left
// (of a loaf, 0..1), fed (gone to the ducks, not yet noticed), need (a fresh one to fetch), carrying (fetched, in her basket) }; the bread
// errand's state 'fed'; state.flags['ducks-wish'] (the day Peter wished for bread).
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const flat = p => new V3(p.x, 0, p.z), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const LOAF = 'the loaf', LOAVES = 'the loaves', FRESH = 'a fresh loaf';
const PER = { breakfast: 0.15, dinner: 0.15, supper: 0.15 }, FED = 0.45, HEEL = 0.15;      // (a meal's piece of it; the ducks' share; the heel, not enough for another meal)
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const chores = w => w.save.state.chores || {};
const change = (w, fn) => w.save.change(s => { s.chores = s.chores || {}; fn(s.chores); }, { chores: true });
const basket = P => root.Chores && root.Chores.basketOf(P);
// (what bread's in her basket: the loaf from home, or the loaves from the bakery)
// (how much of the loaf's left, and what's to be done about it)
const bread = w => Object.assign({ left: 1, fed: 0, need: false, carrying: false }, chores(w).bread);
const setBread = (w, fn) => change(w, c => { c.bread = Object.assign({ left: 1, fed: 0, need: false, carrying: false }, c.bread); fn(c.bread); });
// (on the board, where her mother can see it: not taken today, or put back)
const onBoard = w => { const l = chores(w).loaf; return bread(w).left > 0 && !(l && l.day === w.cal.day && ['taken', 'ducks', 'kept', 'gone', 'asked'].includes(l.state)); };
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
  const left = bread(w).left, all = what !== LOAF || left - FED < HEEL;      // (the loaf: a good share of it, or what's left, if that's little enough; the loaves: both)
  await P.converse(S.ducksFed(what, !all), { shot: ['red', 'peter'] });
  throwing.on = false; await Promise.all(going);
  const b = basket(P);
  if (all) { if (b && root.Chores) root.Chores.takeOut(b, what); if (b && b === P.bag) change(w, c => { if (c.bag) c.bag.contents = b.contents.slice(); }); }
  if (what === LOAF && all) { change(w, c => { c.loaf = { day: w.cal.day, state: 'ducks' }; }); setBread(w, x => { x.left = 0; x.fed = 0; }); }
  else if (what === LOAF) { change(w, c => { c.loaf = { day: w.cal.day, state: 'taken', fed: true }; }); setBread(w, x => { x.left = Math.max(0, x.left - FED); x.fed = (x.fed || 0) + FED; }); }      // (still in her basket, gone down: back on the board, and her mother will see)
  else change(w, c => { if (c.errand && c.errand.id === 'bread') c.errand.state = 'fed'; });      // (her mother's errand: nothing to hand over now)
  w.rep.add('naughty', what === LOAVES ? 1 : 0.5, what === LOAVES ? 'Mama’s loaves, thrown to the ducks' : 'Mama’s loaf, thrown to the ducks');
  w.rep.add('mischievous', 0.5, 'feeding the ducks with Peter'); w.rep.trusts('peter', 1);
  w.cal.advance(15); w.refresh();
  if (P.talk) P.talk.muse(S.ducksAfter(what, !all), { face: 'wince' });
}

// At home, before supper: her mother's found the loaf gone off the board (or the loaves never came home). → whether a correction's owed.
async function evening(P, w, o) {
  const S = root.Story, c = chores(w), d = w.cal.day, l = c.loaf && c.loaf.day === d ? c.loaf : null, fed = c.errand && c.errand.id === 'bread' && c.errand.state === 'fed' && c.day === d;
  const near = async () => { if (!(o && o.table)) { await P.wait(0.4); await P.approach(); } };      // (at the table: across it from her already)
  if (onBoard(w) && bread(w).fed > 0 && !fed) return diminished(P, w, near);      // (back on the board, gone down since she saw it)
  if (!l && !fed) return false;
  if (l && (l.state === 'back' || l.state === 'kept' || l.state === 'asked')) { if (!fed) return false; }
  await near();
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
    if (back) { putBack(P, w); w.rep.add('naughty', -0.5, 'owning up to the loaf, and putting it back'); change(w, x => { x.loaf.state = 'back'; });
      if (bread(w).fed > 0) return diminished(P, w, async () => {}); }      // (and gone down, in her hands: she sees it as it's put back)
    else { w.rep.add('naughty', 0.5, 'saying she didn’t know where the loaf was'); change(w, x => { x.loaf.state = 'kept'; }); setBread(w, x => { x.left = 0; x.fed = 0; x.need = true; }); }      // (as good as gone: another to be fetched)
    return false;
  }
  const ducks = l.state === 'ducks';
  await P.converse(S.loafGone(ducks), { shot: ['red', 'mother'] });
  change(w, x => { x.loaf.state = 'asked'; }); setBread(w, x => { x.left = 0; x.fed = 0; x.need = true; });
  await root.Evening.owe(P, w, 'loaf', { ducks });
  return true;
}
// Gone down since she saw it, and Red asked: hungry (a lie: chided, for eating between meals, wilful, one toward the week's three), or the ducks
// (the truth: naughty, and a correction owed).
async function diminished(P, w, near) {
  const S = root.Story; let how = null;
  await near();
  await P.converse(S.loafDiminished({ hungry: () => { how = 'lie'; }, ducks: () => { how = 'truth'; } }), { shot: ['red', 'mother'] });
  setBread(w, x => { x.fed = 0; });
  if (how === 'lie') {
    w.rep.add('naughty', 0.5, 'saying she ate Mama’s loaf, when the ducks had it');
    const C = w.chores; if (C && C.slid) C.slid('eating between meals');
    if (C && C.due && C.due() && root.Evening && !root.Evening.owes(w, 'maintenance')) await root.Evening.owe(null, w, 'maintenance', {});      // (the third this week: set right tonight)
    return false;
  }
  w.rep.add('naughty', 0.5, 'Mama’s loaf, to the ducks');
  await root.Evening.owe(P, w, 'loaf', { ducks: true, part: true });
  return true;
}
// A meal's piece of it, off the board (not there to eat, nothing). Down to the heel, her mother says so: another, from Mistress Pennock.
async function eat(P, w, meal) {
  if (!onBoard(w)) return;
  const b = bread(w), left = Math.max(0, b.left - (PER[meal] || 0.2)), out = left < HEEL;
  setBread(w, x => { x.left = out ? 0 : left; if (out) x.need = true; });
  if (out) { if (P && P.talk && root.Story.loafOut) await P.converse(root.Story.loafOut(w.cal.minute < H('11:30')), { shot: ['red', 'mother'] }); if (w.refresh) w.refresh(); }
}
// (whether her mother will have something to say of it at this meal: missed, gone down, or down to the heel)
function asks(w, meal) {
  const c = chores(w), l = c.loaf && c.loaf.day === w.cal.day ? c.loaf : null, b = bread(w);
  if (onBoard(w)) return b.fed > 0 || b.left - (PER[meal] || 0.2) < HEEL;
  return !!(l && (l.state === 'taken' || l.state === 'ducks' || l.state === 'gone'));
}
// (a whole loaf on the board again: Master Pennock's loaves, home; or the one fetched from the counter)
function fresh(w) { setBread(w, x => { x.left = 1; x.fed = 0; x.need = false; x.carrying = false; }); }
// Fetching it: at Mistress Pennock's counter while she's at it, in her basket; home, and onto the board.
function actions(P, w, area) {
  const b = bread(w), out = [], W = P.world, sp = W.spots || {};
  if (area === 'village' && b.need && !b.carrying && sp.counter && P.figure && P.figure('pennock') && w.cal.minute < H('12:30'))
    out.push({ label: 'Ask Mistress Pennock for a loaf', at: sp.counter.at.clone().setY(14), run: () => fetch(P, w) });
  { const l = chores(w).loaf; if (area === 'home' && l && l.day === w.cal.day && l.state === 'taken' && basket(P) && (basket(P).contents || []).includes(LOAF)) { const it = W.items.find(x => x.kind === 'loaf');
    if (it) out.push({ label: 'Put the loaf back on the board', at: it.obj.position.clone().add(it.grip || new V3()), run: async () => { const m = P.motion; await up(P, it.obj.position, 6); await m.reach('R', it.obj.position.clone().setY(it.obj.position.y + 2)); await P.wait(0.3); await m.release('R');
      putBack(P, w); w.rep.add('naughty', -0.5, 'putting Mama’s loaf back before she missed it'); change(w, x => { x.loaf.state = 'back'; }); } }); } }      // (back before she's noticed it gone: only what's gone down, if any, for her to see)
  if (area === 'home' && b.carrying && basket(P) && (basket(P).contents || []).includes(FRESH)) { const it = W.items.find(x => x.kind === 'loaf');
    if (it) out.push({ label: 'Put the fresh loaf on the board', at: it.obj.position.clone().add(it.grip || new V3()), run: () => board(P, w) }); }
  return out;
}
// (up to it, from where she is: a step or so short, facing it)
async function up(P, at, d) { const m = P.motion, away = flat(m.pos).sub(flat(at)); if (away.lengthSq() < 1) away.set(0, 0, 1); const to = P.collide(flat(at).addScaledVector(away.normalize(), d), 3.2);
  if (to.distanceTo(flat(m.pos)) > 1.5) await Promise.race([m.goTo(to, yawTo(to, at)), P.wait(5)]); m.auto = null; await m.face(yawTo(m.pos, at)); }
async function fetch(P, w) {
  const S = root.Story, b = basket(P), f = P.figure('pennock'), m = P.motion;
  if (!b) { if (w.chores && w.chores.noBasket) await w.chores.noBasket(P); return; }
  await up(P, f ? f.motion.pos : P.world.spots.counter.at, 11);
  if (f) { f.motion.face(yawTo(f.motion.pos, m.pos)); m.face(yawTo(m.pos, f.motion.pos)); }
  await P.converse(S.loafCounter(), { shot: ['red', 'pennock'] });
  root.Chores.putIn(b, FRESH); if (b === P.bag) change(w, c => { if (c.bag) c.bag.contents = b.contents.slice(); });
  setBread(w, x => { x.carrying = true; }); w.cal.advance(5); w.refresh();
}
async function board(P, w) {
  const b = basket(P), it = P.world.items.find(x => x.kind === 'loaf'), m = P.motion; if (!it) return;
  const at = it.obj.position.clone(); await up(P, at, 6); await m.reach('R', at.clone().setY(at.y + 2)); await P.wait(0.3); await m.release('R');
  if (b && root.Chores) root.Chores.takeOut(b, FRESH); if (b && b === P.bag) change(w, c => { if (c.bag) c.bag.contents = b.contents.slice(); });
  fresh(w); change(w, c => { if (c.loaf && c.loaf.day === w.cal.day && c.loaf.state !== 'taken') c.loaf.state = 'back'; });
  it.away = false; it.obj.visible = true; w.refresh();
}
const objective = w => { const b = bread(w); return b.carrying ? 'Put the fresh loaf on the board at home.' : b.need ? (w.cal.minute < H('12:30') ? 'Fetch a fresh loaf from Mistress Pennock’s counter.' : 'Fetch a fresh loaf from Mistress Pennock’s counter, in the morning.') : null; };
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

const api = { peter, feed, evening, eat, asks, fresh, actions, objective, bread, onBoard, correct, breadIn, LOAF, LOAVES, FRESH, PER };
root.Loaf = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
