// Little Red’s Lessons — Mistress Abney's promise (phase 1.2: abney.promise). Once Red's worked an afternoon at the inn (abney.work), Mistress
// Abney asks her (at the end of it, or when Red next talks to her): she's off to the market town with the carrier tomorrow evening, and Bess
// mustn't be alone, so near her time. Will Red come at six and sit with her until she's back?
//
//   • Yes is a promise. That evening, about five, something comes to find her if she's out in the village: Tom with a dare, Agnes off to the
//     pond to hear Georgie's poem, or Peter (once she's been to the Fowlers'). She can say she's promised, or go "just for a little while".
//   • Kept: at the inn by half past six, *Sit with Bess*: the evening by the fire with her, till Mistress Abney's back at nine; then she walks
//     Red home herself and squares the hour with her mother (no curfew owed). Trust, and the promise done.
//   • Broken: half past six goes by with Bess alone. Mistress Abney comes home to it. Naughty (the kind she minds most), her trust down, and
//     the next evening Red's mother has heard of it from her: corrected for it (js/evening.js).
//   No is allowed: she'll ask again in a day or two.
//
//   AbneyPromise.wants(w) (she's to ask) · .ask(P, w) · .tempter(w) / .tempt(P, w, who) (js/villagers.js: whoever comes to find her) · .inn(P, w)
//   (the inn: sitting with Bess) · .evening(P, w) (js/evening.js: her mother's heard) · .objective(w) · .excused(w)
// Kept in the save (state.promise): { asked (a day), day (the evening promised), tempted, kept, broken, told (her mother's had it) }.
(function (root) {
'use strict';
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
function hash(day, k) { let h = (day * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519); h ^= h >>> 13; return (h >>> 0) / 4294967296; }
const FROM = H('18:00'), LATE = H('18:30'), BACK = H('21:00');

const stateOf = w => w.save.state.promise || (w.save.state.promise = { asked: 0, day: 0, tempted: null, kept: false, broken: false, told: false });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.promise); }, { promise: true });
// (to be asked: the step on offer, not promised yet, and not asked in the last two days)
const wants = w => w.q.stateOf && w.q.stateOf('abney.promise') === 'offered' && !stateOf(w).day && (!stateOf(w).asked || w.cal.day - stateOf(w).asked >= 2);
const tonight = w => { const s = stateOf(w); return s.day === w.cal.day && !s.kept && !s.broken; };
function objective(w) { lapse(w); const s = stateOf(w); return tonight(w) && w.cal.minute >= H('12:00') ? 'Sit with Bess at the inn, from six till Mistress Abney’s back.' : null; }
// (half past six gone, and she's not with Bess: broken)
function lapse(w) {
  const s = stateOf(w); if (!s.day || s.kept || s.broken || s.sitting) return;
  if (w.cal.day > s.day || (w.cal.day === s.day && w.cal.minute > LATE)) {
    change(w, p => { p.broken = true; }); w.save.flag('abney-promise-broken', s.day);
    if (w.q.stateOf('abney.promise') === 'offered') w.complete('abney.promise');      // (done, broken: before her trust falls, and the step with it)
    w.rep.add('naughty', 2, 'leaving Bess alone, after promising Mistress Abney'); w.rep.trusts('abney', -1);
  }
}
// (home after nine, walked there by Mistress Abney: no curfew owed tonight)
const excused = w => { const s = stateOf(w); return s.kept && s.day === (w.cal.minute < H('12:00') ? w.cal.day - 1 : w.cal.day); };

// ── The asking.
async function ask(P, w) {
  if (!wants(w)) return false;
  let yes = false;
  await P.converse(root.Story.abneyAsks({ yes: () => { yes = true; } }), { shot: ['red', 'abney'] });
  change(w, s => { s.asked = w.cal.day; if (yes) s.day = w.cal.day + 1; });
  w.refresh(); return true;
}
// ── About five that evening, whoever comes to find her (P: the village, js/villagers.js calls it, with their figure brought to her).
const TEMPTERS = ['tom', 'agnes', 'peter'];
function tempter(w) {
  const s = stateOf(w); if (!tonight(w) || s.tempted || w.cal.minute < H('17:00') || w.cal.minute > H('17:50')) return null;
  const list = TEMPTERS.filter(k => k !== 'peter' || (root.Peter && root.Peter.visited(w)));
  return list[Math.floor(hash(s.day, 31) * list.length)];
}
async function tempt(P, w, who) {
  let went = false;
  change(w, s => { s.tempted = who; });
  await P.converse(root.Story.tempted(who, { go: () => { went = true; } }), { shot: ['red', who] });
  if (!went) return false;
  // (she goes: the evening goes by, and Bess sits alone)
  await w.fade(true, '');
  w.cal.until('19:20'); lapse(w);
  await w.fade(false);
  await P.converse(root.Story.temptedAfter(who), { shot: false, keepCamera: true });
  w.refresh(); return true;
}
// ── At the inn that evening: *Sit with Bess*, from a little before six; and the evening with her till her mother's back.
function inn(P, w) {
  const W = P.world; W.actions = W.actions || [];
  W.actions.push({ label: 'Sit with Bess', get at() { const f = P.figure('bess'); return f ? f.motion.pos.clone().setY(14) : W.bessChair.at; }, when: () => tonight(w) && w.cal.minute >= H('17:30') && w.cal.minute <= LATE && !P.busy, run: () => sit(P, w) });
  // (asked after an afternoon's work, as it ends: js/work.js's finish; or when Red talks to her)
  return { ask: () => ask(P, w) };
}
async function sit(P, w) {
  const S = root.Story, m = P.motion, f = P.figure('bess');
  change(w, s => { s.sitting = true; });
  if (f) { const at = P.collide(f.motion.pos.clone().setY(0).add(new root.THREE.Vector3(10, 0, -4)), 3.2); await m.goTo(at, Math.atan2(f.motion.pos.x - at.x, f.motion.pos.z - at.z)); }
  await P.converse(S.sitWithBess(), { shot: ['red', 'bess'] });
  await w.fade(true, ''); w.cal.until('21:00'); await w.fade(false);
  change(w, s => { s.kept = true; s.sitting = false; });
  w.rep.trusts('abney', 1); w.rep.trusts('abneyDaughter', 0.5);
  if (w.q.stateOf('abney.promise') === 'offered') w.complete('abney.promise');
  await P.converse(S.abneyBack(), { shot: ['red', 'abney'] });
  // (and home, Mistress Abney with her, to tell her mother why she's late)
  await w.go('home', 'door', { walked: true });
}
// ── Red's mother, the evening after a broken one: she's heard from Mistress Abney. (→ whether a correction was given)
async function evening(P, w) {
  const s = stateOf(w), S = root.Story; if (!s.broken || s.told || w.cal.day <= s.day) return false;
  change(w, p => { p.told = true; });
  await P.wait(0.4); await P.approach();
  await P.converse(S.promiseFoundOut(), { shot: ['red', 'mother'] });
  await root.Evening.owe(P, w, 'promise', {});      // (seen to at the evening's end: js/evening.js)
  return true;
}
async function correct(P, w, how) {
  const S = root.Story;
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => S.promiseCorrection(Sc, how) }], fade: on => w.fade(on) });
  if (P !== w.P) return true;
  await P.converse(S.promiseAfter(), { shot: ['red', 'mother'] });
  w.rep.settle('naughty', 0.6); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
}

const api = { wants, ask, tempter, tempt, inn, evening, correct, objective, excused, lapse, stateOf, FROM, LATE, BACK };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.AbneyPromise = api;      // (not "Promise": that name is the language's own)
})(typeof window !== 'undefined' ? window : globalThis);
