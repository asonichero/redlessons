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
// yes (the two of them on the stools, facing, peeling potatoes while they talk), an honest "I'm worn through", or a "won't" (wilful, counted
// with the errands' toward the week's three). After it, she washes at the dresser when she's ready for supper, and it fades into the morning;
// before nine she can slip out again first, but after nine her mother reminds her of the curfew at the door.
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
const objective = w => watchman(w) ? 'Home, with Master William at your heels.' : washDue(w) ? 'Wash at the dresser, when you’re ready for supper.' : null;

async function home(P, w, o) {
  o = o || {};
  const cal = w.cal, S = root.Story, st = stateOf(w), excused = !!(root.AbneyPromise && root.AbneyPromise.excused(w)), late = cal.curfew() && !excused, walked = !!watchman(w);      // (excused: walked home by Mistress Abney, after sitting with Bess)
  if (!P || !P.npc) return;
  // (before six, and not late: only what can't wait)
  if (!o.bed && !late && !walked && cal.minute < H('18:00')) { if (root.Pie) await root.Pie.evening(P, w); return; }
  if (st.done === night(cal) && washDue(w)) {      // (back in, after slipping out: late, and it's the curfew; otherwise, supper's when she's washed)
    if (late && st.curfewed !== night(cal)) { change(w, s => { s.curfewed = night(cal); }); await curfew(P, w, {}); }
    return;
  }
  if (st.done !== night(cal)) {
    change(w, s => { s.done = night(cal); });
    let corrected = false;
    if (walked) { await brought(P, w); }
    if (late || walked) { corrected = await curfew(P, w, { willie: walked }); change(w, s => { s.curfewed = night(cal); }); }
    if (!corrected) await reprieves(P, w);
    if (excused) { await P.wait(0.4); await P.approach(); await P.converse(S.excusedHome(), { shot: ['red', 'mother'] }); }
    if (!corrected && root.Pie) corrected = await root.Pie.evening(P, w, true);
    if (!corrected && root.AbneyPromise) corrected = await root.AbneyPromise.evening(P, w);      // (a promise to Mistress Abney broken: she's told her)
    if (!corrected && root.Garden && w.chores && w.chores.on()) corrected = await root.Garden.evening(P, w, true);
    if (!corrected && P === w.P && w.q.stateOf && w.q.stateOf('maren.willie') === 'offered') await blessing(P, w);      // (after his first catch: whether he may see to it himself, next time)
    if (!corrected && P === w.P && !late && !excused) await supper(P, w);
    if (P === w.P && !late && !excused) { change(w, s => { s.wash = night(cal); }); w.refresh(); return; }      // (and then, when she's ready, a wash at the dresser: and supper, and bed)
  }
  if (P === w.P) await w.morning();
}
// ── Washing for supper, at the jug and basin on the dresser, when she's ready: and it fades into the morning. (Till then she may slip out
// again, before nine; after nine, her mother at the door: js/world.js's doorGuard, with curfewNudge.)
const washDue = w => stateOf(w).wash === night(w.cal);
const tableDue = washDue;      // (the old name: js/guide.js)
function actions(P, w) {
  const B = P && P.world.basin; if (!washDue(w) || !P || P.busy || !B) return [];
  return [{ label: 'Wash for supper', at: B.at.clone(), run: async () => {
    const m = P.motion; if (P.sitting) await P.getUp(); await m.goTo(P.collide(B.stand.clone().setY(0), 3.2), B.facing);
    for (let k = 0; k < 3; k++) { m.reach('L', B.at.clone().add(new root.THREE.Vector3(0, -0.6 + k * 0.2, 0))); await m.reach('R', B.at.clone().add(new root.THREE.Vector3(0.6, -0.4, 0))); await P.wait(0.4); m.release('L'); await m.release('R'); }
    change(w, s => { s.wash = 0; }); await w.morning(); } }];
}
// (after nine, at the door with supper still to come: her mother, gently)
const curfewNudge = w => washDue(w) && w.cal.minute >= H('21:00');
async function nudge(P) { await P.converse(root.Story.curfewNudge(), { shot: ['red', 'mother'] }); }

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
  let peeling = null;
  if (how === 'yes') peeling = await peel(P);
  else if (how === 'little') { const stool = W.seats.filter(s => s.name === 'the stool').sort((p, q) => (B ? Math.abs(q.at.z - B.z1) - Math.abs(p.at.z - B.z1) : 0))[0];
    const hearth = B ? P.collide(new V(-2, 0, B.z1 - 20), 3.2) : null;
    await Promise.all([stool ? P.sitOn(stool) : null, hearth ? mm.goTo(hearth, 0) : null]); }
  const c = w.save.state.chores || {}, e = c.errand && root.Story.ERRANDS[c.errand.id], fl = w.save.state.flags || {}, d = w.cal.day;
  const day = { errand: e && c.day === d ? { title: e.title, state: c.errand.state, late: c.errand.late } : null, garden: c.day === d && !(root.Garden && root.Garden.offToday(w)) ? !!c.garden : null,      // (her mother's garden today: nothing for Red to say of it)
   
    dare: fl['rang-bell'] === d ? 'bell' : fl['woke-willie'] === d ? 'knock' : null, peter: fl['met-peter'] === d, herb: root.Herbs && root.Herbs.stateOf(w).day === d ? root.Herbs.HERBS[root.Herbs.stateOf(w).n - 1] : null };
  await P.converse(S.dayTalk(how, day), { shot: ['red', 'mother'] });
  if (peeling) await peeling.done();
  w.cal.advance(how === 'yes' ? 40 : 20);
}
// The two stools, turned to face each other, a bowl of potatoes on the floor between: each with one in her hand and the knife going round it,
// all the while they talk. → { done() } (up again, the potatoes put by)
async function peel(P) {
  const m = P.motion, mm = P.npcMotion, W = P.world, V = root.THREE.Vector3, T = root.Toon, THREE = root.THREE;
  const st = W.seats.filter(s => s.name === 'the stool').sort((a, b) => a.at.z - b.at.z); if (st.length < 2 || !mm) return null;
  const yaw = (a, b) => Math.atan2(b.x - a.x, b.z - a.z), red = Object.assign({}, st[0], { facing: yaw(st[0].at, st[1].at) }), mam = Object.assign({}, st[1], { facing: yaw(st[1].at, st[0].at) });
  const front = s => P.collide(s.at.clone().setY(0).add(new V(Math.sin(s.facing), 0, Math.cos(s.facing)).multiplyScalar(6)), 3);
  await Promise.all([m.goTo(front(red), red.facing).then(() => P.sitOn(red)), mm.goTo(front(mam), mam.facing).then(() => mm.sit(mam))]);
  // (the bowl between them, and a potato in each lap)
  const g = new THREE.Group(), mid = red.at.clone().lerp(mam.at, 0.5).setY(0); g.position.copy(mid); P.stage.scene.add(g);
  const bowl = new THREE.Mesh(new THREE.LatheGeometry([[0.01, 0], [2.6, 0.2], [3.4, 1.6], [3.6, 2]].map(([r, h]) => new THREE.Vector2(r, h)), 14), T.mat('#a87a4a')); bowl.material.side = THREE.DoubleSide; g.add(bowl);
  const spud = () => new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6).scale(1.2, 0.9, 1), T.mat('#c8a066'));
  for (let k = 0; k < 6; k++) { const p = spud(); p.position.set(Math.cos(k) * 1.6, 1.6 + (k % 2) * 0.4, Math.sin(k) * 1.6); g.add(p); }
  const going = [];
  for (const [mo, s] of [[m, red], [mm, mam]]) {
    const f = new V(Math.sin(s.facing), 0, Math.cos(s.facing)), side = new V(f.z, 0, -f.x), lap = s.at.clone().addScaledVector(f, 3.6).setY(s.at.y + 3.2), p = spud(); p.position.copy(lap); P.stage.scene.add(p);
    const job = { on: true, p };
    // (the hands following a moving point, not stepped from one to the next: the potato turning a little in the left, the knife going round it
    // in the right, a stroke a second or so)
    job.run = (async () => { let t = Math.random() * 6; const untick = P.tick(dt => { t += dt; p.rotation.y += dt * 0.9; });
      mo.reach('L', () => lap.clone().add(new V(0, Math.sin(t * 0.9) * 0.15, 0)));
      mo.reach('R', () => { const a = t * 5.2; return lap.clone().addScaledVector(side, 0.8 + Math.cos(a) * 0.55).add(new V(0, 0.5 + Math.sin(a) * 0.45, 0)).addScaledVector(f, 0.4); });
      while (job.on) await P.wait(0.2);
      if (untick) untick(); mo.release('L'); await mo.release('R'); })();
    going.push(job);
  }
  return { async done() {
    for (const j of going) j.on = false; await Promise.all(going.map(j => j.run)); for (const j of going) P.stage.scene.remove(j.p); P.stage.scene.remove(g);
    await Promise.all([P.getUp(), mm.stand()]);
  } };
}

// ── Out after the bell, and the Watchman finds her: he walks her home (js/villagers.js has him follow her; this keeps count, and the quest).
function caught(w) {
  change(w, s => { s.catches = (s.catches || 0) + 1; s.walking = night(w.cal); });
  const n = stateOf(w).catches; w.save.flag('willie-catch-' + Math.min(n, 2), w.cal.day);
  if (w.q.stateOf && w.q.stateOf('willie.first') === 'offered') w.complete('willie.first');
  w.refresh(); return n;
}

const api = { actions, tableDue, washDue, curfewNudge, nudge, home, record, watchman, objective, caught, stateOf, night };
root.Evening = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
