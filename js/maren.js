// Little Red’s Lessons — Maren's day (Act 1): it's planting time, and most days her mother's out at the Hallorans' farm, from after breakfast
// till dinner, and again till supper. Some days she has needlework, and works at home for the morning or the afternoon instead. At home for
// dinner at half past twelve: if Red's in, they eat together (it fills her again: js/capacity.js), and her mother looks over her morning,
// never correcting there, but saying what she's seen; what she's warned of and still finds undone by evening is wilful.
//
//   Maren.home(w) → she's in the cottage now · Maren.at(w) → 'home' | 'farm' | 'needle' · Maren.needlework(day) → 'morning' | 'afternoon' | null
//   Maren.dinnerDue(w) · Maren.dinner(P, w) (the meal, and her word) · Maren.warned(w, what) → she warned of it at dinner today
// Kept in the save: state.maren = { dinner (the day they ate together), warned: { day, garden, errand } }.
(function (root) {
'use strict';
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const OUT = H('08:00'), DINNER = H('12:30'), BACK = H('13:30'), HOME = H('17:30');
function hash(day, k) { let h = (day * 2654435761 + k * 40503) | 0; h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
// (about one day in four, needlework: at home for the morning, or the afternoon)
const needlework = day => { const r = hash(day, 7); return r < 0.13 ? 'morning' : r < 0.26 ? 'afternoon' : null; };
const stateOf = w => w.save.state.maren || (w.save.state.maren = { dinner: 0, warned: {} });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.maren); }, { maren: true });
// (only once the days are agreed: before that, she's home, as the first chapter has her)
const on = w => !!(w.chores && w.chores.on());
function at(w) {
  const m = w.cal.minute, n = needlework(w.cal.day);
  if (!on(w) || m < OUT || m >= HOME || (m >= DINNER && m < BACK)) return 'home';
  if ((n === 'morning' && m < DINNER) || (n === 'afternoon' && m >= BACK)) return 'needle';
  return 'farm';
}
const home = w => at(w) !== 'farm';
const dinnerDue = w => on(w) && w.cal.minute >= DINNER && w.cal.minute < BACK && stateOf(w).dinner !== w.cal.day;
const warned = (w, what) => { const s = stateOf(w).warned || {}; return s.day === w.cal.day && !!s[what]; };
const missedDinner = w => on(w) && w.cal.minute >= BACK && stateOf(w).dinner !== w.cal.day;

// Dinner: the two of them at the table, on the stools; her word on the morning. (→ when it's done)
async function dinner(P, w) {
  const S = root.Story, m = P.motion, mm = P.npcMotion, W = P.world, c = w.save.state.chores || {}, d = w.cal.day;
  change(w, s => { s.dinner = d; });
  if (!mm) return;
  const st = W.seats.filter(s => s.name === 'the stool').sort((a, b) => a.at.z - b.at.z);
  await P.converse(S.dinnerCall(), { shot: ['red', 'mother'] });
  if (P.sitting) await P.getUp();
  if (st.length >= 2) await Promise.all([P.sitOn(st[0]), mm.goTo(P.collide(st[1].at.clone().setY(0).add(new root.THREE.Vector3(Math.sin(st[1].facing), 0, Math.cos(st[1].facing)).multiplyScalar(6)), 3), st[1].facing).then(() => mm.sit(st[1]))]);
  // (what she's seen: the garden, if it's Red's today; the errand, where it stands; her flowers, if any are trodden)
  const G = root.Garden, gp = G && c.day === d && !G.offToday(w) ? G.progress(w) : null, e = c.day === d && c.errand && S.ERRANDS[c.errand.id];
  const trodden = G && G.stateOf ? Object.values(G.stateOf(w).trampled || {}).some(day => day === d) : false;
  const r = { garden: gp ? (gp.done ? 'done' : gp.begun ? 'begun' : 'untouched') : null, errand: e ? { title: e.title, state: c.errand.state, by: root.Calendar.clockOf(H(e.by)) } : null, trodden, needle: needlework(d) };
  await P.converse(S.dinner(r), { shot: ['red', 'mother'] });
  change(w, s => { s.warned = { day: d, garden: r.garden === 'untouched' || r.garden === 'begun', errand: !!(r.errand && r.errand.state === 'accepted') }; });
  if (w.capacity) w.capacity.add(35, 'dinner');
  w.cal.advance(30);
  await Promise.all([P.getUp(), mm.stand()]);
}

const api = { at, home, needlework, dinnerDue, dinner, warned, missedDinner, stateOf, OUT, DINNER, BACK, HOME };
root.Maren = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
