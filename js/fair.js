// Little Red’s Lessons — the spring fair (phase 1.2: docs/quest-plan.md, Maren's line, the fair dress). Once its gates are met (the inn's
// evening worked, the first of Grandmother's herbs learnt, Bo met), the planting at the Hallorans' is finished on the next Sixth Day; the fair
// is the Sixth Day a week on. Its Lay day after is the recovery, the stalls standing till First Day.
//
//   • The week between, her mother's home (no farm), making Red's fair dress: four sessions at her needlework (First, Second and Third day
//     mornings, and Fifth day's afternoon), the last with a fitting: Red's expected home at four to try it on, so the hem can be pinned and it's
//     ready on the day. (Late, it waits on her, and her mother says so.)
//   • Fair day: no garden, no errand, no shifts; her mother at her stall on the green all day; the fair till ten, and Red's curfew lifted. The
//     clock runs at the inn shift's pace, a game minute a second (js/world.js).
//     The day itself: js/fairday.js.
//
//   Fair.arm(w) (each morning: sets the days once the gates are met) · Fair.phase(w) → 'last' (the planting's last day) | 'week' | 'fair' |
//   'after' (its Lay day, and First Day, the stalls coming down) | null · Fair.marenAt(w) → her mother's whereabouts this week, or null ·
//   Fair.breakfast(w) → her mother's word for the day, or null · Fair.fittingDue(w) · Fair.fitting(P, w) · Fair.isFair(w, day) · Fair.gown(w)
// Kept in the save (state.fair): { planted (the planting's last day), day (the fair's), fitted (the day she tried it on), late, spoil: {} }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const SIXTH = 6, FIT = H('16:00'), LATE = 15, EARLY = 15, ENDS = H('22:00');
const MORNING = [H('08:00'), H('12:30')], AFTERNOON = [H('13:30'), H('17:30')];
const weekday = d => ((Math.max(1, d) - 1) % 7) + 1;
const stateOf = w => w.save.state.fair || (w.save.state.fair = { planted: 0, day: 0, fitted: 0, late: false, spoil: {} });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.fair); }, { fair: true });

// The gates: the inn's evening worked, the first of Grandmother's herbs learnt, Bo met.
function gatesMet(w) {
  const q = w.q, fl = w.save.state.flags || {}, herbs = w.save.state.herbs || {};
  return !!(q && q.done && q.done('abney.work')) && (herbs.n || 0) >= 1 && !!fl['bo-met'];
}
// Each morning: once the gates are met, the days are set: the planting's last on the next Sixth Day (today, if it's one), the fair a week on.
function arm(w) {
  const s = stateOf(w), d = w.cal.day; if (s.day || !(w.chores && w.chores.on()) || !gatesMet(w)) return;
  let p = d; while (weekday(p) !== SIXTH) p++;
  change(w, x => { x.planted = p; x.day = p + 7; });
}
function phase(w, day) {
  const s = stateOf(w), d = day || w.cal.day; if (!s.day) return null;
  if (d === s.planted) return 'last'; if (d > s.planted && d < s.day) return 'week'; if (d === s.day) return 'fair'; if (d > s.day && d <= s.day + 2) return 'after';
  return null;
}
const isFair = (w, day) => phase(w, day) === 'fair';
// The dress sessions: [day, part] — First, Second, Third day mornings, and Fifth day's afternoon (the fitting at four).
const sessions = w => { const s = stateOf(w); return s.day ? [[s.planted + 2, 'morning'], [s.planted + 3, 'morning'], [s.planted + 4, 'morning'], [s.planted + 6, 'afternoon']] : []; };
const fitDay = w => { const s = stateOf(w); return s.day ? s.planted + 6 : 0; };
const sessionToday = w => { const x = sessions(w).find(([d]) => d === w.cal.day); return x ? x[1] : null; };
// Her mother's whereabouts, this week: home (the planting done), at her needlework for the session; at her stall on fair day. Else null (her
// usual day: js/maren.js).
function marenAt(w) {
  const ph = phase(w), m = w.cal.minute; if (ph === 'fair') return m >= H('07:30') && m < ENDS ? 'fair' : 'home';
  if (ph !== 'week') return null;
  const part = sessionToday(w), [a, b] = part === 'morning' ? MORNING : AFTERNOON;
  return part && m >= a && m < b ? 'needle' : 'home';
}
// The curfew lifted on fair day, till the fair ends at ten.
const curfewLifted = w => isFair(w) && w.cal.minute < ENDS + 30;      // (and half an hour after, to walk home)

// Her mother's word for the day at breakfast (in place of where she'll be): the planting's last day; the week of the dress; the fitting.
function breakfast(w) {
  const ph = phase(w), s = stateOf(w), d = w.cal.day, S = root.Story; if (!ph || !S.fairBreakfast) return null;
  if (ph === 'last') return S.fairBreakfast('last');
  if (ph === 'week') { const i = sessions(w).findIndex(([x]) => x === d); return S.fairBreakfast(i === 0 ? 'first' : i === 3 ? 'fitting' : i > 0 ? 'session' : weekday(d) === 7 ? 'lay' : 'rest'); }
  if (ph === 'fair') return S.fairBreakfast('fair');
  if (stateOf(w).mend === d) return S.fairBreakfast('mend');      // (the morning after: the dress washed and mended, the two of them)
  return null;
}
// ── The fitting: from four on the Fifth day, with Red home and her mother at her needlework: arms up, and into it, and the hem pinned.
const fittingDue = w => phase(w) === 'week' && w.cal.day === fitDay(w) && w.cal.minute >= FIT - EARLY && stateOf(w).fitted !== w.cal.day;
async function fitting(P, w) {
  const S = root.Story, m = P.motion, mm = P.npcMotion, late = w.cal.minute > FIT + LATE, V = V3;
  if (P.sitting) await P.getUp();      // (up off her seat first: she can't come over to her mother sat down)
  if (mm && mm.seat && root.Maren) root.Maren.unsit(mm);
  await P.wait(0.4); await P.approach();
  await P.converse(S.fittingCall(late), { shot: ['red', 'mother'] });
  // (into it, under a fade: stood in the middle of the room, her mother before her, down at the hem with her pins)
  await w.fade(true);
  if (P.sitting && root.Maren) { root.Maren.unsit(m); P.sitting = null; }
  const red = P.collide(new V(4, 0, 4), 3.4), mam = P.collide(new V(4, 0, 12), 3.4), yaw = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  m.warp(red, yaw(red, mam)); if (mm) mm.warp(mam, yaw(mam, red));
  if (P.setGown) P.setGown({ kind: 'fair', spoil: {} });
  for (let i = 0; i < 20; i++) P.frame(1 / 60); P.stage.camera.updateMatrixWorld();
  await P.wait(0.3); await w.fade(false);
  // (her hands at the hem, a pin at a time, going round)
  let on = true; const pins = (async () => { let k = 0; while (on && mm) { const a = (k++ % 6) / 6 * Math.PI - Math.PI / 2, f = new V(Math.sin(P.motion.yaw + a), 0, Math.cos(P.motion.yaw + a));
    await mm.reach(k % 2 ? 'R' : 'L', P.motion.pos.clone().addScaledVector(f, 2.6).setY(3.5)); await P.wait(0.7); await mm.release(k % 2 ? 'R' : 'L'); } })();
  await P.converse(S.fitting(late), { shot: ['red', 'mother'] });
  on = false; await pins;
  change(w, x => { x.fitted = w.cal.day; x.late = late; });      // (done only once it's done: cut short, it comes again)
  if (late) w.rep.add('wilful', 0.5, 'late home for the fitting, after being told four');
  await w.fade(true);
  if (P.setGown) P.setGown(null);
  w.cal.advance(30);
  await P.wait(0.3); await w.fade(false);
  w.refresh();
}
// (what she's wearing today: the fair dress on fair day, from the morning; with what the day's put on it)
const gown = w => isFair(w) ? { kind: 'fair', spoil: Object.assign({}, stateOf(w).spoil) } : null;
// (something on the dress: earth, soot, wet, tear (0..1 each, adding))
function spoil(w, kind, n) { change(w, x => { x.spoil = x.spoil || {}; x.spoil[kind] = Math.min(1, (x.spoil[kind] || 0) + (n == null ? 0.4 : n)); }); }
// (Bess's story of her frock: once Red's been fitted, before the fair, or at it (with the fairing): not yet told)
const frockDue = w => { const s = stateOf(w), fl = w.save.state.flags || {}; return !fl['bess-frock'] && !!s.fitted && (phase(w) === 'week' || phase(w) === 'fair'); };
function objective(w) {
  if (phase(w) === 'week' && w.cal.day === fitDay(w) && stateOf(w).fitted !== w.cal.day) return w.cal.minute < FIT - EARLY ? 'Home by four, for Mama to fit the dress.' : 'Home: Mama’s waiting to fit the dress.';
  return null;
}

// (what's on the dress, all told: 0 clean; a little, under 0.6; spoiled, above)
const spoilt = w => { const s = stateOf(w).spoil || {}; return (s.earth || 0) + (s.soot || 0) + (s.wet || 0) + (s.tear || 0); };
const api = { spoilt, frockDue, arm, gatesMet, phase, isFair, marenAt, curfewLifted, breakfast, fittingDue, fitting, gown, spoil, objective, sessions, fitDay, stateOf, FIT, ENDS };
root.Fair = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
