// Little Red’s Lessons — Maren's day (Act 1): it's planting time, and most days her mother's out at the Hallorans' farm, from after breakfast
// till dinner, and again till supper. Some days she has needlework, and works at home for the morning or the afternoon instead. At home for
// dinner at half past twelve: if Red's in, they eat together (it fills her again: js/capacity.js), and her mother looks over her morning,
// never correcting there, but saying what she's seen; what she's warned of and still finds undone by evening is wilful.
//
//   Maren.home(w) → she's in the cottage now · Maren.at(w) → 'home' | 'farm' | 'needle' | 'gran' (Lay day afternoons, up at Grandmother's) · Maren.needlework(day) → 'morning' | 'afternoon' | null
//   Maren.dinnerDue(w) · Maren.dinner(P, w) (the meal, and her word) · Maren.warned(w, what) → she warned of it at dinner today
// Kept in the save: state.maren = { dinner (the day they ate together), warned: { day, garden, errand } }.
(function (root) {
'use strict';
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const OUT = H('08:00'), DINNER = H('12:30'), BACK = H('13:30'), HOME = H('17:30');
function hash(day, k) { let h = (day * 2654435761 + k * 40503) | 0; h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
// (about one day in four, needlework: at home for the morning, or the afternoon)
const needlework = day => { if (((day - 1) % 7) + 1 === 7) return null; const r = hash(day, 7); return r < 0.13 ? 'morning' : r < 0.26 ? 'afternoon' : null; };
const stateOf = w => w.save.state.maren || (w.save.state.maren = { dinner: 0, warned: {} });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.maren); }, { maren: true });
// (only once the days are agreed: before that, she's home, as the first chapter has her)
const on = w => !!(w.chores && w.chores.on());
// (the days Red's asked for the bakery's afternoon at breakfast: her mother at the Hallorans' all day, not home for dinner, and bread and cheese
// left out on the table for her, so she needn't choose between the two)
const allDay = (w, day) => { const c = w.save.state.chores, d = day || w.cal.day; return on(w) && !!c && c.day === d && !!c.errand && c.errand.id === 'bakery' && !(root.Fair && root.Fair.phase && root.Fair.phase(w, d)); };
// (a bakery day, whether she's out or not (the fair's run-up, she's home at her sewing): Red's due at the bakery by one, and there's no dinner
// together; bread and cheese left on the table for when she's done)
const bakeryDay = (w, day) => { const c = w.save.state.chores, d = day || w.cal.day; return on(w) && !!c && c.day === d && !!c.errand && c.errand.id === 'bakery'; };
const LAY_OUT = 14 * 60, LAY_BACK = 17 * 60;
function at(w) {
  const m = w.cal.minute, n = needlework(w.cal.day);
  { const f = root.Fair && on(w) ? root.Fair.marenAt(w) : null; if (f) return f; }      // (the fair's week: home, at the dress; fair day: at her stall)
  if (on(w) && !w.cal.lay && allDay(w) && m >= OUT && m < HOME) return 'farm';      // (the bakery's day: out all day, dinner too)
  if (on(w) && w.cal.lay && m >= LAY_OUT && m < LAY_BACK) return 'gran';      // (Lay day: up to Grandmother's of an afternoon, for the week's news; home the rest of it)
  if (!on(w) || (w.cal.lay) || m < OUT || m >= HOME || (m >= DINNER && m < BACK)) return 'home';      // (Lay day: home all day, but the afternoon)
  if ((n === 'morning' && m < DINNER) || (n === 'afternoon' && m >= BACK)) return 'needle';
  return 'farm';
}
const home = w => at(w) !== 'farm' && at(w) !== 'fair' && at(w) !== 'gran';
const dinnerDue = w => on(w) && !bakeryDay(w) && w.cal.minute >= DINNER && w.cal.minute < BACK && stateOf(w).dinner !== w.cal.day;
const warned = (w, what) => { const s = stateOf(w).warned || {}; return s.day === w.cal.day && !!s[what]; };
const missedDinner = w => on(w) && !bakeryDay(w) && w.cal.minute >= BACK && stateOf(w).dinner !== w.cal.day;

// (stood up at once, under a fade: off the seat, free to be put anywhere)
const unsit = mo => { if (!mo) return; mo.sitW = mo.sitWant = 0; mo.lieW = mo.lieWant = 0; mo.seat = null; mo.locked = false; };
// The two of them at the table, sat on the stools at either end of it, facing each other across it (at once: under a fade); plates before them
// (o.plates), or a bowl of potatoes between them and one in each hand (o.peel: supper). → up(): stood again, and the table cleared.
function atTable(P, w, o) {
  o = o || {}; const THREE = root.THREE, V3 = THREE.Vector3, T = root.Toon, m = P.motion, mm = P.npcMotion, W = P.world;
  const st = W.seats.filter(s => s.name === 'the stool'), tb = W.surfaces.find(s => s.name === 'the table'); if (st.length < 2 || !tb || !mm) return { up: () => {} };
  const mid = new V3((tb.x0 + tb.x1) / 2, 0, (tb.z0 + tb.z1) / 2), [a, b] = st.slice().sort((p, q) => p.at.x - q.at.x || p.at.z - q.at.z);
  const facing = s => Math.atan2(mid.x - s.at.x, mid.z - s.at.z), things = [];
  const place = (mo, s) => { const seat = Object.assign({}, s, { facing: facing(s) }); mo.warp(s.at.clone().setY(0).addScaledVector(new V3(Math.sin(seat.facing), 0, Math.cos(seat.facing)), 0.5), seat.facing); mo.sit(seat); mo.sitW = 1; return seat; };
  if (P.sitting) unsit(m); if (mm.seat) unsit(mm);
  if (W.moveChair && W.chairAt !== 'home') W.moveChair('home');      // (her chair back under the peg rail, for the meal)
  if (w.chores && w.chores.setBy) w.chores.setBy(P);      // (her basket set by while they sit: back in her hand when she goes out)
  P.sitting = place(m, a); place(mm, b);
  const on = (geo, col, x, y, z) => { const g = new THREE.Mesh(geo, T.mat(col)); g.position.set(x, y, z); g.add(new THREE.Mesh(T.hullGeo(geo, 0.05), T.INKM[0])); P.stage.scene.add(g); things.push(g); return g; };
  for (const s of [a, b]) { const f = new V3(Math.sin(facing(s)), 0, Math.cos(facing(s))), p = s.at.clone().setY(tb.y + 0.2).addScaledVector(f, 7);
    if (o.plates) { on(new THREE.CylinderGeometry(2.2, 1.8, 0.35, 16), '#e2d8c4', p.x, p.y, p.z); on(T.ell(1.3, 0.5, 1.1, 10, 6), '#b8864a', p.x, p.y + 0.4, p.z); } }
  if (o.peel) { const bowl = on(new THREE.LatheGeometry([[0.01, 0], [2.6, 0.2], [3.4, 1.6], [3.6, 2]].map(([r, h]) => new THREE.Vector2(r, h)), 14), '#a87a4a', mid.x, tb.y + 0.1, mid.z); bowl.material.side = THREE.DoubleSide;
    for (let k = 0; k < 6; k++) on(new THREE.SphereGeometry(1, 8, 6).scale(1.2, 0.9, 1), '#c8a066', mid.x + Math.cos(k) * 1.6, tb.y + 1.7 + (k % 2) * 0.4, mid.z + Math.sin(k) * 1.6); }
  // (up: stood behind her stool, clear of the table, facing it; her mother the same at hers, unless her work takes her: js/maren.js toWork)
  const behind = (mo, s) => { const f = new V3(Math.sin(facing(s)), 0, Math.cos(facing(s))), at = P.collide(s.at.clone().setY(0).addScaledVector(f, -5), 3.2); mo.warp(at, facing(s)); };
  return { seats: [a, b], mid, top: tb.y, up() { for (const g of things) P.stage.scene.remove(g); if (P.sitting) { unsit(m); P.sitting = null; } behind(m, a); if (mm.seat) unsit(mm); behind(mm, b); } };
}
// Up from the table (under a fade): her mother at her work at once: gone, if it's the farm; at her needlework, sat in the chair by the
// hearth. (Or just home: stood, as she is.)
function toWork(P, w) {
  const where = at(w), mm = P.npcMotion; if (!mm) return;
  if (where === 'farm') { if (P.npcGo) P.npcGo(true, null); return; }
  sitDown(P);      // (at her needlework, or her own work about the house: sat by the fire with it, either way)
}
// (at her needlework: on the chair by the hearth)
function sitDown(P) {
  const mm = P.npcMotion, ch = P.world.seats.find(s => s.kind === 'chair'); if (!mm || !ch || mm.seat === ch) return;
  if (P.sitting === ch) return;      // (Red's in it: she'll stand till it's free)
  if (P.world.moveChair && P.world.chairAt !== 'hearth') P.world.moveChair('hearth');      // (her chair by the fire, to work in)
  mm.warp(ch.at.clone().setY(0).add(new root.THREE.Vector3(Math.sin(ch.facing), 0, Math.cos(ch.facing)).multiplyScalar(0.5)), ch.facing); mm.sit(ch); mm.sitW = 1;
}
// Dinner: the two of them at the table, on the stools, their plates before them; Red's account of her morning, and then her mother's word on it.
// how: 'entered' (Red's come in at dinner time: straight to the table, under a fade), 'arrived' (Red's in already, and her mother comes in
// from the farm, glad to find her: a word, and then the table), 'home' (her mother home anyway, at her needlework: the same, without the door).
// ── After the fair, the first dinner Red comes in to: Master and Mistress Thatcher with her mother, saying their goodbyes; fond of her, as of
// when she was small. When they've gone, her mother asks if she'd mind them knowing; and she'll tell Mistress Thatcher herself (off, after).
const thatchersDue = w => { const F = root.Fair && root.Fair.stateOf ? root.Fair.stateOf(w) : null, fl = w.save.state.flags || {};
  return !!(F && F.day && w.cal.day > F.day && fl['thatchers-know'] == null && !w.cal.lay); };
async function thatchers(P, w) {
  const C = root.Correction, THREE = root.THREE, V3 = THREE.Vector3, mm = P.npcMotion, m = P.motion, looks = root.Looks && root.Looks.load ? root.Looks.load() : {};
  const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z), CAST = { thatcher: { name: 'Master Thatcher', voice: 'smith', tint: '#5a4a34', bg: '#e6e0d0' }, thatcherWife: { name: 'Mistress Thatcher', voice: 'pennock', tint: '#6a8a4a', bg: '#e8eedc' } };
  const figs = [];
  for (const [k, dx] of [['thatcherWife', -7], ['thatcher', 7]]) { const f = C.figure(P, k, looks[k]), side = new V3(Math.cos(mm.yaw), 0, -Math.sin(mm.yaw)), fwd = new V3(Math.sin(mm.yaw), 0, Math.cos(mm.yaw));
    const at = P.collide(mm.pos.clone().setY(0).addScaledVector(fwd, 12).addScaledVector(side, dx), 3.2); f.m.warp(at, yawTo(at, m.pos)); f.rig.root.position.copy(at); figs.push(f); P.talk.cast[k] = Object.assign({ rig: f.rig, side: 'right' }, CAST[k]); }
  mm.face(yawTo(mm.pos, m.pos));
  try { await P.converse(root.Story.thatchersCall(), { shot: ['red', 'thatcherWife'] }); }
  finally { for (const f of figs) f.remove(); delete P.talk.cast.thatcher; delete P.talk.cast.thatcherWife; }
  w.save.flag('thatchers-know', w.cal.day);
}
async function dinner(P, w, how) {
  const S = root.Story, THREE = root.THREE, V3 = THREE.Vector3, m = P.motion, mm = P.npcMotion, W = P.world, c = w.save.state.chores || {}, d = w.cal.day;
  change(w, s => { s.dinner = d; });
  if (!mm) return;
  if (thatchersDue(w) && how === 'entered') { await thatchers(P, w); }      // (after the fair: the Thatchers at the door with her mother, as she comes in)
  if (how !== 'entered') { mm.face(Math.atan2(m.pos.x - mm.pos.x, m.pos.z - mm.pos.z)); await P.converse(S.dinnerCall(how), { shot: ['red', 'mother'] }); }
  // (to the table, under a fade: both sat, plates before them)
  if (w.fade) await w.fade(true);
  const table = atTable(P, w, { plates: true });
  P.stage.camera.updateMatrixWorld();
  if (w.fade) await w.fade(false);
  // (what there is to tell, and what she's seen: the garden, if it's Red's today; the errand, where it stands; her flowers, if any are trodden)
  const G = root.Garden, gp = G && c.day === d && !G.offToday(w) ? G.progress(w) : null, e = c.day === d && c.errand && S.ERRANDS[c.errand.id];
  const trodden = G && G.stateOf ? Object.values(G.stateOf(w).trampled || {}).some(day => day === d) : false;
  const herb = root.Herbs && root.Herbs.stateOf(w).day === d ? root.Herbs.HERBS[root.Herbs.stateOf(w).n - 1] : null;
  const given = w.chores && w.chores.handIn ? w.chores.handIn(P) : null;      // (what she's brought home: handed over in the talk)
  const r = { given, garden: gp ? (gp.done ? 'done' : gp.begun ? 'begun' : 'untouched') : null, errand: e && !given ? { id: c.errand.id, state: c.errand.state, by: root.Calendar.clockOf(H(e.by)) } : null, trodden, herb, needle: needlework(d) };
  // (where she'll be this afternoon, said as it is: the farm; her needlework, or the dress, at home; Lay day, Grandmother's; the fair's week, home)
  { const F = root.Fair, ph = F && F.phase ? F.phase(w) : null, fs = F && F.sessions ? F.sessions(w).find(([x]) => x === d) : null;
    r.after = w.cal.lay ? 'gran' : ph === 'week' ? (fs && fs[1] === 'afternoon' ? 'dress' : 'homeWeek') : r.needle === 'afternoon' ? 'needle' : 'farm'; }
  // (what she's brought home, handed over; then her morning, told as she will, and what her mother's seen asked about: js/report.js)
  await P.converse([{ who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'Well, then. Tell me your morning.' }].concat(given || []), { shot: ['red', 'mother'] });
  if (root.Report) await root.Report.run(P, w, { when: 'dinner' });
  if (root.Loaf) await root.Loaf.eat(P, w, 'dinner');      // (dinner's piece of the loaf)
  await P.converse(S.dinnerEnd(r), { shot: ['red', 'mother'] });      // (and then back to the afternoon)
  change(w, s => { s.warned = { day: d, garden: r.garden === 'untouched' || r.garden === 'begun', errand: !!(r.errand && r.errand.state === 'accepted') }; });
  if (w.capacity) w.capacity.add(35, 'dinner');
  // (and up from the table, under a fade, the plates cleared)
  if (w.fade) await w.fade(true);
  table.up();
  w.cal.advance(Math.max(1, BACK - w.cal.minute));      // (and back to her work: the farm, or her needlework)
  toWork(P, w);
  if (w.fade) await w.fade(false);
}

// The bread and cheese on the table, the bakery's day: out from when her mother goes till she's back, if Red's not had it. Eaten, it's her
// dinner: it fills her as much (js/capacity.js), and counts as it.
const LARDER = 35;
function larder(P, w) {
  const THREE = root.THREE, V3 = THREE.Vector3, T = root.Toon, W = P.world, tb = W.surfaces && W.surfaces.find(s => s.name === 'the table'); if (!tb) return;
  const g = new THREE.Group(), x = (tb.x0 + tb.x1) / 2, z = (tb.z0 + tb.z1) / 2, put = (geo, col, px, py, pz) => { const m = new THREE.Mesh(geo, T.mat(col)); m.position.set(px, py, pz); m.add(new THREE.Mesh(T.hullGeo(geo, 0.05), T.INKM[0])); g.add(m); return m; };
  put(new THREE.BoxGeometry(5, 0.4, 3.6), '#b8864a', 0, 0.2, 0);      // (a board)
  put(T.ell(1.5, 1.1, 2.2, 12, 8), '#c98a44', -1, 1.2, 0);      // (the end of a loaf)
  put(new THREE.CylinderGeometry(1.3, 1.3, 1, 3), '#f0d070', 1.4, 0.9, 0.3).rotation.y = 0.4;      // (a wedge of cheese)
  g.position.set(x, tb.y, z); P.stage.scene.add(g);
  const out = () => bakeryDay(w) && (!allDay(w) || at(w) === 'farm') && stateOf(w).dinner !== w.cal.day;      // (her bakery day: on the table from breakfast, whether her mother's out or at her sewing)
  P.tick(() => { g.visible = out(); });
  (W.actions = W.actions || []).push({ label: 'Eat the bread and cheese', at: new V3(x, tb.y + 2, z), when: () => out() && !P.busy,
    run: async () => { const m = P.motion, c = new V3(x, 0, z), to = P.collide(m.pos.clone().setY(0).sub(c).setLength(9).add(c), 3.2); await Promise.race([m.goTo(to, Math.atan2(c.x - to.x, c.z - to.z)), P.wait(4)]); change(w, s => { s.dinner = w.cal.day; });
      if (P.talk) P.talk.muse('Bread and cheese, and a cup of water from the jug. Better.', { face: 'smile' });
      if (w.capacity) w.capacity.add(LARDER, 'bread and cheese'); w.cal.advance(15); if (w.refresh) w.refresh(); } });
}
const api = { bakeryDay, allDay, larder, unsit, atTable, toWork, sitDown, at, home, needlework, dinnerDue, dinner, warned, missedDinner, stateOf, OUT, DINNER, BACK, HOME };
root.Maren = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
