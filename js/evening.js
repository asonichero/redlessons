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
// Her mother's own corrections are the last thing of the evening. Whatever earns one (in late, or brought home; the pie; a broken promise; the
// garden), it's raised when it comes up, and she's told it'll be seen to after: the evening goes on as it would have, the supper question
// and her day talked over (coloured by what's coming), and then, last, the correction, and bed. Only one an evening; whatever else is owed
// waits for the next. If she answers the supper question with a "won't" with one already coming, it's added to it, there and then. With
// nothing owed: yes (the two of them on the stools, facing, peeling potatoes while they talk), an honest "I'm worn through", or a "won't"
// (wilful, counted with the errands' toward the week's three). After it, she washes at the dresser when she's ready for supper, and it fades
// into the morning; before nine she can slip out again first, but after nine her mother reminds her of the curfew at the door.
//
// Before six, coming in only brings up what can't wait (sent home by Mistress Pennock).
//
//   Evening.home(P, w, { bed }) (bed: from "Sleep until morning", whenever) · Evening.objective(w) · Evening.record(w, { what, by, informs })
//   Evening.watchman(w) → 'walking' when he's bringing her home tonight · Evening.owe(P, w, kind, how) (a correction of her mother's, for
//   the evening's end: kind 'curfew' | 'pie' | 'promise' | 'garden') · Evening.owes(w)
// Kept in the save: state.evening = { done (the night's key), corrected: [{ id, what, by, day, informs, known, raised }], catches,
// owed: [{ kind, how, day, raised }] }.
(function (root) {
'use strict';
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const night = cal => cal.minute < H('12:00') ? cal.day - 1 : cal.day;      // (the night's key: after midnight is still the night before)
const stateOf = w => w.save.state.evening || (w.save.state.evening = { done: 0, corrected: [], catches: 0, walking: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.evening); }, { evening: true });

// Someone else has corrected her (by: their key; informs: they'll tell her mother themselves).
function record(w, o) { change(w, s => { s.corrected.push({ id: o.what + '-' + w.cal.day, what: o.what, by: o.by, day: w.cal.day, informs: !!o.informs, known: false, raised: false }); }); }
const watchman = w => stateOf(w).walking === night(w.cal) ? 'walking' : null;
const objective = w => watchman(w) ? (stateOf(w).walkingBy === 'georgie' ? 'Home, with Georgie Dunn at your heels.' : 'Home, with Master William at your heels.') : washDue(w) ? 'Wash at the dresser, when you’re ready for supper.' : abed(w) ? 'Bed, when you’re ready.' : null;

async function home(P, w, o) {
  o = o || {};
  const cal = w.cal, S = root.Story, st = stateOf(w), excused = !!(root.AbneyPromise && root.AbneyPromise.excused(w)), late = cal.curfew() && !excused, walked = !!watchman(w);      // (excused: walked home by Mistress Abney, after sitting with Bess)
  if (!P || !P.npc) return;
  // (fair day: her mother's at her stall till ten; the night's word once they're both in, after it: js/fair.js)
  if (root.Fair && root.Fair.isFair(w)) { if (cal.minute >= root.Fair.ENDS && st.done !== night(cal)) { change(w, s => { s.done = night(cal); }); await fairNight(P, w); } return; }
  // (before six, and not late: only what can't wait)
  if (!o.bed && !late && !walked && cal.minute < H('18:00')) { if (root.Pie && !P.npcAway) await root.Pie.evening(P, w); return; }      // (her mother in: out at the farm, it waits)
  // (after the curfew's been seen to: the bread and cheese if she wants it, and bed when she goes to it)
  if (abed(w)) { if (o.bed) await toBed(P, w, st.tonight || {}); return; }
  if (st.done === night(cal) && washDue(w)) {      // (back in, after slipping out: late, and it's the curfew, seen to there and then; otherwise, supper's when she's washed)
    if (late && st.curfewed !== night(cal)) { change(w, s => { s.wash = 0; }); await lateHome(P, w, false); }
    else if (o.bed) { change(w, s => { s.wash = 0; }); await toBed(P, w); }
    return;
  }
  if (st.done !== night(cal)) {
    change(w, s => { s.done = night(cal); });
    // (in after the bell, or brought to the door: no supper; it's seen to at once)
    if (late || walked) { await lateHome(P, w, walked); return; }
    await raise(P, w);      // (what she's to be set right for, said now)
    await reprieves(P, w);
    if (excused) { await P.wait(0.4); await P.approach(); await P.converse(S.excusedHome(), { shot: ['red', 'mother'] }); }
    // (what her mother's heard or found, if nothing's owed already tonight: the rest waits)
    if (!owes(w) && root.Pie) await root.Pie.evening(P, w, true);
    if (!owes(w) && root.AbneyPromise) await root.AbneyPromise.evening(P, w);      // (a promise to Mistress Abney broken: she's told her)
    if (!owes(w) && root.Garden && w.chores && w.chores.on()) await root.Garden.evening(P, w, true);
    if (!owes(w) && root.Loaf && w.chores && w.chores.on()) await root.Loaf.evening(P, w);      // (the loaf off the board: js/loaf.js)
    if (!owes(w) && P === w.P && w.q.stateOf && w.q.stateOf('maren.willie') === 'offered') await blessing(P, w);      // (after his first catch: whether he may see to it himself, next time)
    // (then the evening as it always goes: supper at the table, and her day)
    if (P !== w.P) return;
    const table = await supper(P, w, { owed: owes(w), late });
    // (and last, what's owed: told to wash for supper, and then it's seen to. Or, nothing owed, up from the table, and a wash at the dresser
    // when she's ready: and supper, and bed)
    if (owes(w)) { await settle(P, w, table); return; }
    await w.fade(true); table.up(); await w.fade(false);
    if (!late) { change(w, s => { s.wash = night(cal); }); w.refresh(); return; }
  }
  if (P === w.P) await toBed(P, w);
}
// ── A correction of her mother's, owed: raised now, and seen to at the evening's end (told so, in a line). Not twice for the same.
const owes = (w, kind) => (stateOf(w).owed || []).some(o => !kind || o.kind === kind);
// (P null: owed out of her hearing, the maintenance correction as the third promise slides: raised when she's home, before supper)
async function owe(P, w, kind, how) {
  change(w, s => { s.owed = (s.owed || []).concat({ kind, how: how || {}, day: w.cal.day, raised: !!P }); });
  if (P && root.Story.owedLater) await P.converse(root.Story.owedLater(kind, w.cal.minute < H('18:00')), { shot: ['red', 'mother'] });
}
async function raise(P, w) {
  for (const o of (stateOf(w).owed || []).filter(x => !x.raised)) {
    await P.wait(0.4); await P.approach(); await P.converse(root.Story.owedRaise(o.kind), { shot: ['red', 'mother'] });
    change(w, s => { const x = s.owed.find(y => y === o || (y.kind === o.kind && y.day === o.day)); if (x) x.raised = true; });
  }
}
// The evening's last: the first correction owed (with a "won't" at supper on top of it, if there was one). Up from the table under a fade, and
// stood before her mother, who says what it's for; under another, it's given; and after it, always, the two of them: held, if she reached
// tears, or sat together on the bed if not. Then bed, and her thoughts on the day.
// (each correction's own → its result: and after it, the words said in the aftercare)
const CORRECT = { maintenance: (P, w, how) => w.chores.maintenance(P, w, how), curfew: (P, w, how) => curfewCorrect(P, w, how), pie: (P, w, how) => root.Pie.correct(P, w, how), promise: (P, w, how) => root.AbneyPromise.correct(P, w, how), garden: (P, w, how) => root.Garden.correct(P, w, how), loaf: (P, w, how) => root.Loaf.correct(P, w, how), dress: (P, w, how) => dressCorrect(P, w, how), wood: (P, w, how) => woodCorrect(P, w, how) };
const AFTER = { maintenance: (how, r) => root.Story.afterMaintenance(r), curfew: how => root.Story.curfewAfter(how), pie: how => root.Story.pieMarenAfter(how), promise: () => root.Story.promiseAfter(), garden: how => root.Story.afterGarden(how), loaf: how => root.Story.loafAfter(how), dress: how => root.Story.dressAfter(how), wood: () => root.Story.woodAfter() };
async function settle(P, w, table) {
  // (setting her right covers the bell too, if that's owed as well tonight: the rest waits)
  const list = stateOf(w).owed || [], o = list.find(x => x.kind === 'maintenance') || list[0], S = root.Story; if (!o || !CORRECT[o.kind]) { change(w, s => { s.owed = (s.owed || []).slice(1); }); if (table) { await w.fade(true); table.up(); await w.fade(false); } return; }
  change(w, s => { s.owed = s.owed.filter(x => !(x.kind === o.kind && x.day === o.day) && !(o.kind === 'maintenance' && x.kind === 'curfew')); });
  const how = Object.assign({}, o.how);
  await stood(P, w, table);
  const now = S.owedNow(o.kind, how); if (now.length) await P.converse(now, { shot: ['red', 'mother'] });
  lapAfter(r_ => AFTER[o.kind](how, r_));      // (the aftercare on her lap, still in the chair: held, or sat up)
  const r = await CORRECT[o.kind](P, w, how); if (root.Correction) root.Correction.next = null;
  if (w.capacity) w.capacity.add(15, 'set right');      // (held to account: and lighter for it)
  if (P !== w.P) return;
  await aftercare(P, w, r, AFTER[o.kind](how, r));
  await toBed(P, w, { kind: o.kind, r });
}
// Up from the table, under a fade: the two of them stood in the middle of the room, facing.
async function stood(P, w, table) {
  const V = root.THREE.Vector3, mm = P.npcMotion, m = P.motion;
  await w.fade(true);
  if (table) table.up(); else if (P.sitting) { root.Maren.unsit(m); P.sitting = null; }
  if (mm && mm.seat) root.Maren.unsit(mm);
  if (mm) { const at = P.collide(new V(-6, 0, 2), 3.6), to = P.collide(new V(7, 0, 4), 3.4); mm.warp(at, Math.atan2(to.x - at.x, to.z - at.z)); m.warp(to, Math.atan2(at.x - to.x, at.z - to.z)); }
  for (let i = 0; i < 30; i++) P.frame(1 / 60); P.stage.camera.updateMatrixWorld();
  await w.fade(false);
}
// After it, at home, always: held on her mother's lap (r: she reached tears), her face in her shoulder; or sat together on the edge of the bed.
// lines: what's said in it.
// (set for the correction about to be given: its aftercare played on the giver's lap, in the chair where it was given, always)
function lapAfter(lines) { if (root.Correction) root.Correction.next = { after: (r, ctx) => (r && !r.rose && (r.tooHarsh || r.peak >= 1) && ctx && ctx.beat ? [{ run: ctx.beat }] : []).concat(lines(r)) }; }
async function aftercare(P, w, r, lines) {
  if (r && r.afterPlayed) return;      // (played already, on her lap, in the correction's own place)
  const V = root.THREE.Vector3, st = P.stage, talk = P.talk, held = !!(r && !r.rose && (r.tooHarsh || r.peak >= 1)), A = root.GameAudio;
  await w.fade(true);
  if (A && A.startMusic) A.startMusic({ theme: 'after' });
  if (held && root.Lap) {
    const looks = root.Looks ? root.Looks.load() : {}, lap = root.Lap.create(null, { external: { scene: st.scene }, looks, giver: 'gerda', subject: 'red' });
    lap.stage.position.set(0, 0, 0); lap.stage.updateMatrixWorld(true);
    const hide = [P.rig.root, P.npc && P.npc.root, P.world.chair].filter(Boolean); hide.forEach(o => { o.visible = false; });
    lap.set({ skirt: 'down', drawers: 'up', marks: (r && r.marks) || { L: 0.6, R: 0.6 } }); lap.after('held');
    const untick = P.tick(dt => lap.update(dt));
    const was = { red: talk.cast.red && talk.cast.red.rig, mother: talk.cast.mother && talk.cast.mother.rig };
    if (talk.cast.red) talk.cast.red.rig = lap.subjectRig; if (talk.cast.mother) talk.cast.mother.rig = lap.giverRig;
    const v = lap.VIEWS.after(); P.camHeld = true; st.go(v.pos, v.look, 0);
    await P.wait(0.4); await w.fade(false);
    const ctx = { beat: async () => { lap.giverRig.setExpr('tender', 3); await P.wait(2.2); } };
    try { await talk.play([{ run: ctx.beat }].concat(lines), { shot: false, keepCamera: true }); }
    finally { if (talk.cast.red) talk.cast.red.rig = was.red; if (talk.cast.mother) talk.cast.mother.rig = was.mother; }
    await w.fade(true); untick(); lap.end(); st.scene.remove(lap.stage); hide.forEach(o => { o.visible = true; }); P.camHeld = false;
    return;
  }
  // (sat, side by side on the edge of the bed, her mother's arm round her)
  const m = P.motion, mm = P.npcMotion, bed = P.world.seats.find(s => s.kind === 'bed');
  if (bed && mm) {
    const along = bed.head.clone().sub(bed.feet).setY(0).normalize(), f = new V(Math.sin(bed.facing), 0, Math.cos(bed.facing));
    const seat = (k, o) => Object.assign({}, bed, { kind: 'bench', at: bed.at.clone().addScaledVector(along, k) });
    const red = seat(-3.2), mam = seat(3.2);
    const put = (mo, s) => { mo.warp(s.at.clone().setY(0).addScaledVector(f, 0.5), s.facing); mo.sit(s); mo.sitW = 1; };
    if (P.sitting) root.Maren.unsit(m); if (mm.seat) root.Maren.unsit(mm); put(m, red); P.sitting = red; put(mm, mam);
    for (let i = 0; i < 30; i++) P.frame(1 / 60);
    // (her arm round her: whichever of her mother's is nearer, to Red's far shoulder)
    const G = P.npc, wp = o_ => o_ ? o_.getWorldPosition(new V()) : null, rp = P.rig.root.position, aL = wp(G.armL), aR = wp(G.armR);
    const arm = aL && aR ? (aL.distanceTo(rp) < aR.distanceTo(rp) ? 'L' : 'R') : 'L', away = new V().subVectors(red.at, mam.at).setY(0).normalize();
    mm.reach(arm, () => P.rig.root.position.clone().addScaledVector(away, 2.2 * P.rig.scaleW).add(new V(0, 16.5 * P.rig.scaleW, 0)).addScaledVector(f, -0.8 * P.rig.scaleW));
    P.rig.setExpr('teary', 30);
    // (the shot: from the room, before the two of them, a little above)
    const mid = red.at.clone().lerp(mam.at, 0.5).setY(0); P.camHeld = true;
    st.go(P.collide(mid.clone().addScaledVector(f, 34), 4).setY(20), mid.clone().setY(13), 0);
    for (let i = 0; i < 10; i++) P.frame(1 / 60); st.camera.updateMatrixWorld();
    await P.wait(0.3); await w.fade(false);
    await P.converse(lines, { shot: false, keepCamera: true });
    await w.fade(true); mm.release(arm); root.Maren.unsit(m); P.sitting = null; root.Maren.unsit(mm); P.camHeld = false;
    return;
  }
  await w.fade(false); await P.converse(lines, { shot: ['red', 'mother'] }); await w.fade(true);
}
// ── Bed: the two of them in it, her mother's arm over her, the fire low; Red's thoughts on the day; asleep; and the morning. (o: the
// correction tonight, if there was one: { kind, r })
async function toBed(P, w, o) {
  o = o || {}; const st = P.stage, talk = P.talk, S = root.Story;
  if (!root.Bed || !P.world.seats.some(s => s.kind === 'bed')) { await w.morning(); return; }
  await w.fade(true);
  const hide = [P.rig.root, P.npc && P.npc.root].filter(Boolean); hide.forEach(x => { x.visible = false; });
  P.camHeld = true; st.setLight(Math.max(st.time || 0, 0.85));      // (night, the fire low)
  if (root.GameAudio && root.GameAudio.startMusic) root.GameAudio.startMusic({ theme: 'bed' });
  const looks = root.Looks ? JSON.parse(JSON.stringify(root.Looks.load())) : {}; if (looks.red) looks.red.outfit = 'No cloak';      // (her cloak off for the night: on again in the morning)
  const b = root.Bed.scene(st, P.world, { looks }); const untick = P.tick(dt => b.tick(dt));
  const v = b.shot(); st.go(v.pos, v.look, 0);
  const was = talk.cast.red.rig; talk.cast.red.rig = b.small;
  await P.wait(0.6); await w.fade(false); await P.wait(1.8);
  const script = []; let sleep = false;
  for (const l of S.nightThoughts({ day: stateOf(w).today && stateOf(w).today, kind: o.kind || null, r: o.r || null })) { if (l === 'sleep') { sleep = true; continue; }
    script.push({ who: 'red', face: l[0], text: l[1], thought: true, cue: sleep ? () => b.big.setExpr('asleep', 1.2) : null }); sleep = false; }
  try { await talk.play(script, { shot: false, keepCamera: true }); } finally { talk.cast.red.rig = was; }
  b.small.setExpr('asleep', 1.0); await P.wait(2.4);
  await w.fade(true); untick(); b.remove(); hide.forEach(x => { x.visible = true; }); P.camHeld = false;
  change(w, s => { s.today = null; });
  await w.morning();
}
// After the curfew's seen to: the night's her own, in the house: the bread and cheese on the board if she wants it, and the bed when she
// goes to it ("Sleep until morning"). No slipping out again.
const abed = w => stateOf(w).abed === night(w.cal);
// ── Washing for supper, at the jug and basin on the dresser, when she's ready: and it fades into the morning. (Till then she may slip out
// again, before nine; after nine, her mother at the door: js/world.js's doorGuard, with curfewNudge.)
const washDue = w => stateOf(w).wash === night(w.cal);
const tableDue = washDue;      // (the old name: js/guide.js)
function actions(P, w) {
  if (P && abed(w) && stateOf(w).ate !== night(w.cal) && !P.busy) { const loaf = P.world.items.find(it => it.name === 'the loaf' && !it.away);
    if (loaf) return [{ label: 'Eat some bread and cheese', at: loaf.obj.position.clone().add(loaf.grip), run: async () => {
      const m = P.motion, at = loaf.obj.position.clone().add(loaf.grip); if (P.sitting) await P.getUp();
      if (m.pos.clone().setY(0).distanceTo(at.clone().setY(0)) > 10) await m.goTo(P.collide(at.clone().setY(0).add(m.pos.clone().setY(0).sub(at.clone().setY(0)).setLength(7)), 3.2), Math.atan2(at.x - m.pos.x, at.z - m.pos.z));
      m.lookAt(at); for (let k = 0; k < 2; k++) { await m.reach('R', at.clone()); await m.release('R'); await m.reach('R', m.pos.clone().setY(at.y + 5).addScaledVector(new root.THREE.Vector3(Math.sin(m.yaw), 0, Math.cos(m.yaw)), 1.2)); await P.wait(0.6); await m.release('R'); }
      m.lookAt(null); change(w, s => { s.ate = night(w.cal); }); w.cal.advance(10); if (w.capacity) w.capacity.add(8, 'bread and cheese');
      await P.converse(root.Story.breadEaten(), { shot: false, keepCamera: true }); w.refresh(); } }]; }
  const B = P && P.world.basin; if (!washDue(w) || !P || P.busy || !B) return [];
  return [{ label: 'Wash for supper', at: B.at.clone(), run: async () => {
    const m = P.motion; if (P.sitting) await P.getUp(); await m.goTo(P.collide(B.stand.clone().setY(0), 3.2), B.facing);
    for (let k = 0; k < 3; k++) { m.reach('L', B.at.clone().add(new root.THREE.Vector3(0, -0.6 + k * 0.2, 0))); await m.reach('R', B.at.clone().add(new root.THREE.Vector3(0.6, -0.4, 0))); await P.wait(0.4); m.release('L'); await m.release('R'); }
    change(w, s => { s.wash = 0; }); await toBed(P, w); } }];
}
// (after nine, at the door with supper still to come: her mother, gently)
const curfewNudge = w => abed(w) || (washDue(w) && w.cal.minute >= H('21:00'));      // (after the curfew's seen to: sternly, at any hour)
async function nudge(P, w) { await P.converse(w && abed(w) ? root.Story.curfewStern() : root.Story.curfewNudge(), { shot: ['red', 'mother'] }); }

// ── The Watchman at the door: he hands her over, and goes back to his round.
// (Georgie, on Lay night: the same, awkwardly, and he'll not tell his father)
const WATCH = { willie: { name: 'Master William', voice: 'willie', tint: '#2a3a4a', bg: '#d8dde4' }, georgie: { name: 'Georgie', voice: 'georgie', tint: '#6a6a5a', bg: '#e8e6dc' } };
async function brought(P, w) {
  const S = root.Story, st = stateOf(w), who = st.walkingBy === 'georgie' ? 'georgie' : 'willie', n = who === 'georgie' ? st.georgie : st.catches, C = root.Correction, looks = root.Looks && root.Looks.load ? root.Looks.load() : {};
  const f = C.figure(P, who, looks[who]), at = P.collide(P.motion.pos.clone().add(new root.THREE.Vector3(6, 0, 10)), 3.6);
  f.m.warp(at, Math.atan2(P.npcMotion.pos.x - at.x, P.npcMotion.pos.z - at.z)); f.rig.root.position.copy(at);
  P.talk.cast[who] = Object.assign({ rig: f.rig, side: 'right' }, WATCH[who]);
  try { await P.wait(0.5); await P.converse(who === 'georgie' ? S.georgieBrings(n) : S.willieBrings(n), { shot: [who, 'mother'] }); }
  finally { f.remove(); delete P.talk.cast[who]; }
  change(w, s => { s.walking = 0; });
}
// ── The fair's night: home, both of them, after ten. No supper (they ate at the fair). Her mother sees the dress, and how it's come through
// the day: clean, and she's proud; a little marked, and Red owns it (they'll wash and mend it in the morning) or says it's fine (and her mother
// finds it when she hangs it up: corrected, for the hiding); spoiled, and she's corrected for it (and for hiding it, if she tries). Then bed.
async function fairNight(P, w) {
  const S = root.Story, n = root.Fair.spoilt(w), d = w.cal.day;
  await P.wait(0.4); await P.approach();
  if (n < 0.15) { await P.converse(S.fairHome('clean'), { shot: ['red', 'mother'] }); w.rep.trusts('maren', 1); await toBed(P, w, { kind: 'fairClean' }); return; }
  let owned = false;
  await P.converse(S.fairHome(n < 0.6 ? 'marked' : 'spoilt', { own: () => { owned = true; } }), { shot: ['red', 'mother'] });
  if (owned && n < 0.6) { w.save.change(s => { s.fair.mend = d + 1; }, { fair: true }); await P.converse(S.fairOwned(), { shot: ['red', 'mother'] }); await toBed(P, w, { kind: 'fairOwned' }); return; }
  if (!owned) { w.rep.add('naughty', 1, 'hiding what she’d done to the dress'); await P.converse(S.fairFound(), { shot: ['red', 'mother'] }); }
  w.rep.add('naughty', n >= 0.6 ? 1 : 0.5, 'spoiling the dress her mother made her');
  await owe(P, w, 'dress', { hid: !owned, spoilt: n >= 0.6 });
  w.save.change(s => { s.fair.mend = d + 1; }, { fair: true });
  await settle(P, w, null);
}
// ── Home after the bell, or brought to the door by the Dunns: no supper. Handed over (if she was brought), her mother's word on it, and
// straight into the correction; after it, the aftercare; then the night's her own in the house: the bread and cheese on the board if she
// wants it, and bed when she goes to it (and her thoughts there). If Master William has seen to it himself already (state.dealt: the
// night he did, once her mother's blessed it), a word between them instead of the correction. Whatever else is owed waits for tomorrow.
async function lateHome(P, w, walked) {
  const S = root.Story, st = stateOf(w), n = night(w.cal), by = walked ? st.walkingBy || 'willie' : null, how = { willie: !!walked, by };
  change(w, s => { s.curfewed = n; });
  if (walked) await brought(P, w);
  await P.wait(0.4); await P.approach();
  if (st.dealt === n) {      // (he's taken her in hand himself, on the way: her mother only hears of it)
    await P.converse(S.willieDealt(), { shot: ['red', 'mother'] });
    change(w, s => { s.abed = n; s.ate = 0; s.tonight = { kind: 'willie' }; }); w.refresh(); return;
  }
  w.rep.add('wilful', 1, walked ? 'out after the curfew bell, and brought home' : 'home after the curfew bell');
  await P.converse(S.curfewTalk(how), { shot: ['red', 'mother'] });
  if (P === w.P && w.q.stateOf && w.q.stateOf('maren.willie') === 'offered') await blessing(P, w);      // (after his first catch: whether he may see to it himself, next time)
  await P.converse(S.owedNow('curfew', how).slice(2), { shot: ['red', 'mother'] });
  lapAfter(() => S.curfewAfter(how));
  const r = await curfewCorrect(P, w, how); if (root.Correction) root.Correction.next = null;
  if (w.capacity) w.capacity.add(15, 'set right');
  if (P !== w.P) return;
  await aftercare(P, w, r, S.curfewAfter(how));
  await w.fade(false);
  change(w, s => { s.owed = (s.owed || []).filter(x => x.kind !== 'curfew'); s.abed = n; s.ate = 0; s.tonight = { kind: 'curfew', r: r ? { rose: !!r.rose, tooHarsh: !!r.tooHarsh, peak: r.peak || 0 } : null }; });
  w.refresh();
}
// ── In the wood after dusk (js/world.js marks it): her mother's own rule, the wood's, apart from the village's curfew.
async function dressCorrect(P, w, how) {
  if (P.setGown) P.setGown(null);      // (out of it, under the fade: it's hung up, and she's in her shift and skirt)
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => root.Story.dressCorrection(Sc, how) }], fade: on => w.fade(on) });
  w.rep.settle('naughty', 0.6); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  return r;
}
async function woodCorrect(P, w, how) {
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => root.Story.woodCorrection(Sc, how) }], fade: on => w.fade(on) });
  w.rep.settle('wilful', 0.6); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  return r;
}
async function curfewCorrect(P, w, how) {
  const S = root.Story;
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => S.curfewCorrection(Sc, how) }], fade: on => w.fade(on) });
  w.rep.settle('wilful', 0.6); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  return r;
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
  w.save.flag('willie-knows-curfew', w.cal.day);      // (and he knows her hour now: nine, not the village's ten)
  if (yes) { w.save.flag('maren-blesses-willie', w.cal.day); w.rep.tell('willie', 1); }
  w.complete('maren.willie');
}
// ── Supper: her mother calls her to the table, and under a fade they're sat at it, on the stools, facing each other across it, a bowl of
// potatoes between them; will she help? Then her day, talked over while the knives go round (hers too, if she's helping). (ctx.owed: a
// correction coming after, which colours it, and closes it: after supper, and wash for it. ctx.late: in after the bell, supper long eaten.)
// → the table (up(): stood again, cleared), still sat at it.
async function supper(P, w, ctx) {
  const S = root.Story; let how = null; ctx = ctx || {};
  await P.wait(0.4); await P.approach();
  await P.converse(S.supperCall(ctx), { shot: ['red', 'mother'] });
  await w.fade(true);
  const table = root.Maren.atTable(P, w, { peel: !ctx.late }); P.stage.camera.updateMatrixWorld();
  await w.fade(false);
  const peeling = [];
  if (!ctx.late) peeling.push(peel(P, P.npcMotion, table));      // (her mother's knife going, whatever Red says)
  await P.converse(S.supper({ low: !!(w.capacity && w.capacity.low), owed: ctx.owed, late: ctx.late ? () => { how = 'late'; } : null, yes: () => { how = 'yes'; }, little: () => { how = 'little'; } }), { shot: ['red', 'mother'] });
  if (how === 'yes') peeling.push(peel(P, P.motion, table));
  const c = w.save.state.chores || {}, e = c.errand && root.Story.ERRANDS[c.errand.id], fl = w.save.state.flags || {}, d = w.cal.day;
  const day = { owed: !!ctx.owed, noDinner: !!(root.Maren && root.Maren.stateOf(w).dinner !== w.cal.day && w.chores && w.chores.on()), late: !!ctx.late, dusk: w.cal.minute >= H('19:00'), errand: e && c.day === d ? { id: c.errand.id, state: c.errand.state, late: c.errand.late } : null, garden: c.day === d && !(root.Garden && root.Garden.offToday(w)) ? !!c.garden : null, gardenDry: !!(w.chores && w.chores.gardenDry && w.chores.gardenDry()),      // (her mother's garden today: nothing for Red to say of it)
    gran: (() => { const g = (w.save.state.green || {}).seen || 1, n = d - g; return n >= 4 && d % 2 === 0 ? n : 0; })(),      // (every other evening, once it's been four days or more since she was up at her grandmother's)
    friends: !ctx.owed && !ctx.late && w.cal.minute < H('20:00') && !!root.Green && !root.Green.friendsSeen(w),      // (time before the bell, and she's not seen them: they're out on the green)
    dare: fl['rang-bell'] === d ? 'bell' : fl['woke-willie'] === d ? 'knock' : null, peter: fl['met-peter'] === d, herb: root.Herbs && root.Herbs.stateOf(w).day === d ? root.Herbs.HERBS[root.Herbs.stateOf(w).n - 1] : null };
  w.save.change(s => { s.evening.today = day; }, { evening: true });      // (for her thoughts in bed, after)
  await P.converse(S.dayTalk(how, day), { shot: ['red', 'mother'] });
  await Promise.all(peeling.map(j => j.done()));
  if (w.capacity) w.capacity.add(how === 'late' ? 4 : how === 'yes' ? 10 : 15, 'supper');      // (supper, with her mother: sat still, more; late, it's long since eaten)
  w.cal.advance(how === 'yes' ? 40 : 20);
  return table;
}
// A potato in the left hand, over the table's edge before her, turning a little; the knife going round it in the right, all the while they
// talk. → { done() } (the hands back, the potato put by)
function peel(P, mo, table) {
  const V = root.THREE.Vector3, THREE = root.THREE, T = root.Toon; if (!mo || !table || !table.seats) return { done: async () => {} };
  const s = table.seats.slice().sort((a, b) => mo.pos.distanceTo(a.at) - mo.pos.distanceTo(b.at))[0];
  const yaw = Math.atan2(table.mid.x - s.at.x, table.mid.z - s.at.z), f = new V(Math.sin(yaw), 0, Math.cos(yaw)), side = new V(f.z, 0, -f.x);
  const lap = s.at.clone().setY(table.top + 2.2).addScaledVector(f, 5.2);
  const p = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6).scale(1.2, 0.9, 1), T.mat('#c8a066')); p.position.copy(lap); P.stage.scene.add(p);
  let on = true, t = Math.random() * 6; const untick = P.tick(dt => { t += dt; p.rotation.y += dt * 0.9; });
  mo.reach('L', () => lap.clone().add(new V(0, Math.sin(t * 0.9) * 0.15, 0)));
  mo.reach('R', () => { const a = t * 5.2; return lap.clone().addScaledVector(side, 0.8 + Math.cos(a) * 0.55).add(new V(0, 0.5 + Math.sin(a) * 0.45, 0)).addScaledVector(f, -0.4); });
  return { async done() { if (!on) return; on = false; if (untick) untick(); mo.release('L'); await mo.release('R'); P.stage.scene.remove(p); } };
}

// ── Out after the bell, and the Watchman finds her: he walks her home (js/villagers.js has him follow her; this keeps count, and the quest).
// (who: 'georgie', on Lay night, his father's watch: his own count, and nothing for his father's quest)
function caught(w, who) {
  if (who === 'georgie' && root.Fair && root.Fair.stateOf(w).day && w.cal.day >= root.Fair.stateOf(w).day) w.save.flag('georgie-walked', w.cal.day);      // (after the fair: awkward and honest, on the way)
  if (who === 'georgie') { change(w, s => { s.georgie = (s.georgie || 0) + 1; s.walking = night(w.cal); s.walkingBy = 'georgie'; }); w.refresh(); return stateOf(w).georgie; }
  change(w, s => { s.catches = (s.catches || 0) + 1; s.walking = night(w.cal); s.walkingBy = 'willie'; });
  const n = stateOf(w).catches; w.save.flag('willie-catch-' + Math.min(n, 2), w.cal.day);
  if (w.q.stateOf && w.q.stateOf('willie.first') === 'offered') w.complete('willie.first');
  w.refresh(); return n;
}

const api = { actions, tableDue, washDue, curfewNudge, nudge, home, record, watchman, objective, caught, stateOf, night, owe, owes };
root.Evening = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
