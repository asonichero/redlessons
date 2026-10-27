// Little Red’s Lessons — home of an evening. Whenever Red comes home after six of her own accord (walking in at her door, not sent there by a
// scene), her mother has a word with her, and in it whatever she's learned that might call for a correction:
//
//   • Brought home by the Watchman (he found her out after the bell, and walked her to her door): he hands her over, and she's corrected
//     for it. (His first catch, and his second, are remembered: what he does after the second is Act 2's.)
//   • In after nine, the curfew bell: corrected for it.
//   • The pie (js/pie.js), the garden (js/garden.js): what her mother's heard, or found.
//   • Anything she's already been corrected for by someone else (Mistress Pennock, for the pie) gets a reprieve: her mother has heard of it
//     from them, or Red tells her herself; and if neither, her mother hears in a day or two, and it's a reprieve still, with a word about
//     not being told.
//   • After Master William's first catch: he's asked her mother whether, next time, he might see to it himself; Red says (maren.willie).
// Only one correction an evening; whatever else is owed waits for the next. If nothing's owed, her mother asks if she'll help with supper:
// yes, an honest "I'm worn through", or a "won't" (wilful, counted with the errands' toward the week's three). Then she's in for the night:
// supper and bed, and it's morning.
//
// Before six, coming in only brings up what can't wait (sent home by Mistress Pennock).
//
//   Evening.home(P, w, { bed }) (bed: from "Sleep until morning", whenever) · Evening.objective(w) · Evening.record(w, { what, by, informs })
//   Evening.watchman(w) → 'walking' when he's bringing her home tonight
// Kept in the save: state.evening = { done (the night's key), corrected: [{ id, what, by, day, informs, known, raised }], catches }.
(function (root) {
'use strict';
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const night = cal => cal.minute < H('12:00') ? cal.day - 1 : cal.day;      // (the night's key: after midnight is still the night before)
const stateOf = w => w.save.state.evening || (w.save.state.evening = { done: 0, corrected: [], catches: 0, walking: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.evening); }, { evening: true });

// Someone else has corrected her (by: their key; informs: they'll tell her mother themselves).
function record(w, o) { change(w, s => { s.corrected.push({ id: o.what + '-' + w.cal.day, what: o.what, by: o.by, day: w.cal.day, informs: !!o.informs, known: false, raised: false }); }); }
const watchman = w => stateOf(w).walking === night(w.cal) ? 'walking' : null;
const objective = w => watchman(w) ? 'Home, with Master William at your heels.' : tableDue(w) ? 'Set the table for supper.' : null;

async function home(P, w, o) {
  o = o || {};
  const cal = w.cal, S = root.Story, st = stateOf(w), excused = !!(root.AbneyPromise && root.AbneyPromise.excused(w)), late = cal.curfew() && !excused, walked = !!watchman(w);      // (excused: walked home by Mistress Abney, after sitting with Bess)
  if (!P || !P.npc) return;
  // (before six, and not late: only what can't wait)
  if (!o.bed && !late && !walked && cal.minute < H('18:00')) { if (root.Pie) await root.Pie.evening(P, w); return; }
  if (st.done !== night(cal)) {
    change(w, s => { s.done = night(cal); });
    let corrected = false;
    if (walked) { await brought(P, w); }
    if (late || walked) corrected = await curfew(P, w, { willie: walked });
    if (!corrected) await reprieves(P, w);
    if (excused) { await P.wait(0.4); await P.approach(); await P.converse(S.excusedHome(), { shot: ['red', 'mother'] }); }
    if (!corrected && root.Pie) corrected = await root.Pie.evening(P, w, true);
    if (!corrected && root.AbneyPromise) corrected = await root.AbneyPromise.evening(P, w);      // (a promise to Mistress Abney broken: she's told her)
    if (!corrected && root.Garden && w.chores && w.chores.on()) corrected = await root.Garden.evening(P, w, true);
    if (!corrected && P === w.P && w.q.stateOf && w.q.stateOf('maren.willie') === 'offered') await blessing(P, w);      // (after his first catch: whether he may see to it himself, next time)
    if (!corrected && P === w.P && !late && !excused) { await supper(P, w); if (P === w.P) { change(w, s => { s.table = night(cal); }); w.refresh(); return; } }      // (and then the table's hers to set: and after supper, bed)
  }
  if (P === w.P) await w.morning(late || excused ? 'Bed.' : 'Supper, and bed.');
}
// ── The table, set for supper (once her mother's asked): then supper, and bed.
const tableDue = w => stateOf(w).table === night(w.cal);
function actions(P, w) {
  if (!tableDue(w) || !P || P.busy) return [];
  const tb = P.world.surfaces.find(s => s.name === 'the table'); if (!tb) return [];
  const at = new root.THREE.Vector3((tb.x0 + tb.x1) / 2, tb.y + 1, (tb.z0 + tb.z1) / 2);
  return [{ label: 'Set the table', at, run: async () => {
    const m = P.motion, V = root.THREE.Vector3, stand = P.collide(new V(tb.x0 - 6, 0, at.z), 3.2);
    if (P.sitting) await P.getUp(); await m.goTo(stand, Math.atan2(at.x - stand.x, at.z - stand.z));
    for (let k = 0; k < 4; k++) { const p = at.clone().add(new V(0, 0, (k - 1.5) * 4)); await m.reach(k % 2 ? 'L' : 'R', p); await P.wait(0.35); await m.release(k % 2 ? 'L' : 'R'); }
    change(w, s => { s.table = 0; }); await w.morning('Supper, and bed.'); } }];
}

// ── The Watchman at the door: he hands her over, and goes back to his round.
async function brought(P, w) {
  const S = root.Story, n = stateOf(w).catches, C = root.Correction, looks = root.Looks && root.Looks.load ? root.Looks.load() : {};
  const f = C.figure(P, 'willie', looks.willie), at = P.collide(P.motion.pos.clone().add(new root.THREE.Vector3(6, 0, 10)), 3.6);
  f.m.warp(at, Math.atan2(P.npcMotion.pos.x - at.x, P.npcMotion.pos.z - at.z)); f.rig.root.position.copy(at);
  P.talk.cast.willie = { rig: f.rig, name: 'Master William', side: 'right', voice: 'willie', tint: '#2a3a4a', bg: '#d8dde4' };
  try { await P.wait(0.5); await P.converse(S.willieBrings(n), { shot: ['willie', 'mother'] }); }
  finally { f.remove(); delete P.talk.cast.willie; }
  change(w, s => { s.walking = 0; });
}
// ── Home after the bell: corrected for it. (how.willie: the Watchman brought her)
async function curfew(P, w, how) {
  const S = root.Story;
  await P.wait(0.4); await P.approach();
  w.rep.add('wilful', 1, how.willie ? 'out after the curfew bell, and brought home by the Watchman' : 'home after the curfew bell');
  await P.converse(S.curfewTalk(how), { shot: ['red', 'mother'] });
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => S.curfewCorrection(Sc, how) }], fade: on => w.fade(on) });
  if (P !== w.P) return true;
  await P.converse(S.curfewAfter(how), { shot: ['red', 'mother'] });
  w.rep.settle('wilful', 0.6); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  return true;
}
// ── What someone else has already dealt with: her mother's heard (they told her), or Red tells her now; or she keeps it back, and her
// mother hears of it in a day or two. A reprieve, every time.
async function reprieves(P, w) {
  const S = root.Story, st = stateOf(w), day = w.cal.day;
  for (const c of st.corrected.filter(x => !x.raised)) {
    const heard = c.informs || (c.withheld && day - c.day >= 2);
    if (heard) { await P.wait(0.4); await P.approach(); await P.converse(S.reprieve(c, c.withheld ? 'late' : 'heard'), { shot: ['red', 'mother'] }); change(w, s => { const x = s.corrected.find(y => y.id === c.id); x.raised = true; }); continue; }
    if (c.withheld) continue;
    let told = false;
    await P.wait(0.4); await P.approach();
    await P.converse(S.reportIt(c, { tell: () => { told = true; } }), { shot: ['red', 'mother'] });
    if (told) await P.converse(S.reprieve(c, 'reported'), { shot: ['red', 'mother'] });
    change(w, s => { const x = s.corrected.find(y => y.id === c.id); if (told) x.raised = true; else x.withheld = true; });
  }
}
// ── Master William's asked her mother: next time, might he see to it himself? Red's to say; her mother decides by it (maren.willie).
async function blessing(P, w) {
  let yes = false;
  await P.wait(0.4); await P.approach();
  await P.converse(root.Story.willieBlessing({ yes: () => { yes = true; }, no: () => {} }), { shot: ['red', 'mother'] });
  if (yes) { w.save.flag('maren-blesses-willie', w.cal.day); w.rep.tell('willie', 1); }
  w.complete('maren.willie');
}
// ── Nothing owed: will she help with supper?
async function supper(P, w) {
  const S = root.Story; let how = null;
  await P.wait(0.4); await P.approach();
  await P.converse(S.supper({ yes: () => { how = 'yes'; }, little: () => { how = 'little'; }, wont: () => { how = 'wont'; } }), { shot: ['red', 'mother'] });
  if (how === 'wont' && w.chores) w.chores.wont('refusing to help with supper');
  // (and her day, caught up on: over the potatoes at the table; sat on the stool while her mother sees to the hearth; or stood, and questioned)
  const m = P.motion, mm = P.npcMotion, W = P.world, V = root.THREE.Vector3, tb = W.surfaces.find(s => s.name === 'the table'), B = W.bounds;
  if (how === 'yes' && tb) { const z = (tb.z0 + tb.z1) / 2, a = P.collide(new V(tb.x0 - 6, 0, z - 4), 3.2), b = P.collide(new V(tb.x0 - 6, 0, z + 6), 3.2), face = Math.PI / 2;
    await Promise.all([m.goTo(a, face), mm.goTo(b, face)]); }
  else if (how === 'little') { const stool = W.seats.filter(s => s.name === 'the stool').sort((p, q) => (B ? Math.abs(q.at.z - B.z1) - Math.abs(p.at.z - B.z1) : 0))[0];
    const hearth = B ? P.collide(new V(-2, 0, B.z1 - 20), 3.2) : null;
    await Promise.all([stool ? P.sitOn(stool) : null, hearth ? mm.goTo(hearth, 0) : null]); }
  const c = w.save.state.chores || {}, e = c.errand && root.Story.ERRANDS[c.errand.id], fl = w.save.state.flags || {}, d = w.cal.day;
  const day = { errand: e && c.day === d ? { title: e.title, state: c.errand.state, late: c.errand.late } : null, garden: c.day === d ? !!c.garden : null,
    dare: fl['rang-bell'] === d ? 'bell' : fl['woke-willie'] === d ? 'knock' : null, peter: fl['met-peter'] === d, herb: root.Herbs && root.Herbs.stateOf(w).day === d ? root.Herbs.HERBS[root.Herbs.stateOf(w).n - 1] : null };
  await P.converse(S.dayTalk(how, day), { shot: ['red', 'mother'] });
  w.cal.advance(how === 'yes' ? 40 : 20);
}

// ── Out after the bell, and the Watchman finds her: he walks her home (js/villagers.js has him follow her; this keeps count, and the quest).
function caught(w) {
  change(w, s => { s.catches = (s.catches || 0) + 1; s.walking = night(w.cal); });
  const n = stateOf(w).catches; w.save.flag('willie-catch-' + Math.min(n, 2), w.cal.day);
  if (w.q.stateOf && w.q.stateOf('willie.first') === 'offered') w.complete('willie.first');
  w.refresh(); return n;
}

const api = { actions, tableDue, home, record, watchman, objective, caught, stateOf, night };
root.Evening = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
