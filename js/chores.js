// Little Red’s Lessons — the days: Mama's garden each morning, and on most days an errand, asked of her over breakfast (docs/quest-plan.md,
// Days and errands). Once the chores are agreed with her mother (the maren.chores step), each morning:
//
//   • Over breakfast her mother says what's been asked of them, if anything, and asks Red if she'll do it. Yes is a promise: it must be begun
//     by its time. An honest no (she can't be anybody's today) costs nothing. A "won't" is wilful; three of those in a week, and her mother
//     gives her a maintenance correction there and then, which sets her right (her wilfulness settled, the count begun again).
//   • The garden's hers every day, any time before dusk (js/garden.js: the weeds, the flowers watered, the vegetables tended); left
//     untended, it's a little broken promise.
//   • An errand's work is done where it's asked for (the well, the bakery, the forge…), and some things are carried home to her mother after.
//     What happens there doesn't spend the day: the clock stops while it plays, and moves on by the work's own time when she's done.
//   • Let the time go by without beginning it, and it's a broken promise (naughty), and she knows it.
//
//   const chores = Chores.create(w)   (w: js/world.js's world)
//   chores.on() · chores.breakfast(P) · chores.answer(id, 'yes' | 'little' | 'wont') · chores.due() · chores.actions(P, area) · chores.tick(P)
//   chores.dress(P) · chores.objective() · chores.journalLine() · chores.gardenDone() · chores.gardenTended()
// The day's state is kept in the save (state.chores): { day, garden, errand: { id, state, by }, refusals: [days], missed }.
// Errand states: 'accepted' (said yes), 'carrying' (begun: something to take home), 'done', 'broken' (not begun in time), 'little' (an honest no),
// 'wont' (a "won't").
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const NONE_ONE_IN = 4;      // (about one day in four nothing's asked)
const NAME = { bucket: 'the bucket', loaves: 'the loaves', pot: 'the pot', jug: 'the jug', basket: 'the basket' };

// Things carried: a bucket, two loaves in a cloth, the pot, a jug, a covered basket. → an item for her hands (motion's hold), not to be set down.
function prop(kind) {
  const T = root.Toon, g = new THREE.Group(), add = (geo, col, x, y, z, ink) => { const m = new THREE.Mesh(geo, T.mat(col)); m.position.set(x, y, z); m.add(new THREE.Mesh(T.hullGeo(geo, ink || 0.06), T.INKM[0])); m.castShadow = true; g.add(m); return m; };
  let grip = new V3(0, 0.6, 0), style = 'hang', name = 'it';
  if (kind === 'bucket') { add(new THREE.CylinderGeometry(1.6, 1.3, 2.8, 12, 1, true), '#7a5a3a', 0, -2.2, 0).material.side = THREE.DoubleSide; add(new THREE.CircleGeometry(1.5, 12).rotateX(-Math.PI / 2), '#5a8aa0', 0, -1.2, 0, 0.01);
    add(new THREE.TorusGeometry(1.6, 0.12, 4, 12, Math.PI), '#3a3634', 0, -0.9, 0, 0.03); name = 'the bucket'; }
  if (kind === 'loaves') { add(new THREE.SphereGeometry(1.3, 10, 6).scale(1.3, 0.7, 0.9), '#b8743a', -0.7, -1.2, 0); add(new THREE.SphereGeometry(1.3, 10, 6).scale(1.3, 0.7, 0.9), '#c98a4a', 0.8, -1.0, 0.2); add(new THREE.PlaneGeometry(4, 2.6).rotateX(-Math.PI / 2), '#efe6d0', 0, -1.6, 0, 0.01); grip = new V3(0, -0.4, 0); name = 'the loaves'; }
  if (kind === 'pot') { add(new THREE.SphereGeometry(2, 12, 8, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7), '#2e2a28', 0, -2.2, 0); add(new THREE.TorusGeometry(2, 0.18, 4, 14).rotateX(Math.PI / 2), '#2e2a28', 0, -1.1, 0, 0.03); grip = new V3(0, -0.6, 0); style = 'front'; name = 'the pot'; }
  if (kind === 'jug') { add(new THREE.LatheGeometry([[0.01, 0], [1.1, 0.1], [1.4, 1.2], [1.0, 2.6], [0.8, 3.0], [0.95, 3.3]].map(([r, y]) => new THREE.Vector2(r, y)), 12), '#c8946a', 0, -3.2, 0); add(new THREE.TorusGeometry(0.6, 0.15, 4, 10, Math.PI), '#c8946a', 1.2, -1.2, 0, 0.03); name = 'the jug'; }
  if (kind === 'basket') { add(new THREE.CylinderGeometry(1.9, 1.5, 2, 12), '#b08850', 0, -2, 0); add(new THREE.SphereGeometry(1.8, 10, 6).scale(1, 0.35, 1), '#e8dcc0', 0, -1, 0, 0.02); add(new THREE.TorusGeometry(1.6, 0.14, 4, 12, Math.PI), '#8e6a38', 0, -0.4, 0, 0.03); name = 'the basket'; }
  return { obj: g, name, grip, radius: 1.2, keep: true, style };
}

function create(w) {
  const S = root.Story, save = w.save, cal = w.cal, rep = w.rep;
  const E = S.ERRANDS;
  // (the day's state, begun afresh each day)
  const st = () => { const c = save.state.chores || (save.state.chores = { day: 0, garden: false, errand: null, refusals: [], missed: 0 }); if (c.day !== cal.day) { c.day = cal.day; c.garden = !!(root.Garden && root.Garden.offToday(w)); c.errand = null; } return c; };      // (some days her mother has the garden: js/garden.js)
  const change = fn => save.change(s => { st(); fn(s.chores); }, { chores: true });
  const on = () => w.q.done('maren.chores');      // (once they're agreed)
  const errand = () => { const e = st().errand; return e && E[e.id] ? Object.assign({ key: e.id }, E[e.id], e) : null; };
  const clock = m => root.Calendar.clockOf(m).replace(/ in the (morning|afternoon|evening)| at night/, '');
  // Which errand today: one of them, not yesterday's, about one day in four none (the same for a day, however it's asked).
  function pick(day) {
    const rnd = (n => () => { n = (n * 16807) % 2147483647; return (n - 1) / 2147483646; })(((day * 2654435761) % 2147483646) + 1); rnd(); rnd();      // (mixed, and the first draws let go: a small seed's first draw is small)
    if (rnd() < 1 / NONE_ONE_IN) return null;
    const ids = Object.keys(E), last = save.state.chores && save.state.chores.last;
    let id = ids[Math.floor(rnd() * ids.length)]; if (id === last) id = ids[(ids.indexOf(id) + 1) % ids.length];
    return id;
  }
  // (something put in her hands)
  const hand = (P, kind) => { const p = prop(kind); P.stage.scene.add(p.obj); P.motion.hold(p, p.style); };
  // What she's most known for lately, to colour how she says yes or no.
  const temper = () => { let best = null, v = 1; for (const k of ['wilful', 'mischievous', 'naughty']) if (rep.stat(k) > v) { v = rep.stat(k); best = k; } return best; };

  // ── Breakfast: the asking. (Played at home, the morning she wakes: js/world.js's morning.)
  async function breakfast(P) {
    if (!on() || !P || !P.npc) return;
    const id = pick(cal.day), e = id ? E[id] : null, by = e ? H(e.by) : 0;
    const ctx = { temper: temper(), byText: e ? clock(by) : '', garden: root.Garden ? root.Garden.offToday(w) : null, rained: root.Garden ? root.Garden.plan(cal.day).rained : false,
      yes: async () => { answer(id, 'yes'); if (e.give) hand(P, e.give); }, little: async () => { answer(id, 'little'); }, wont: async () => { answer(id, 'wont'); } };
    await P.wait(0.8); await P.approach();
    await P.converse(S.breakfast(e, ctx), { shot: ['red', 'mother'] });
    if (due()) await maintenance(P);
    w.refresh();
  }
  // Her answer to the day's errand: 'yes' (a promise, to begin by its time), 'little' (an honest no: nothing against her), 'wont' (wilful, and
  // counted: see due).
  function answer(id, how) {
    const by = H(E[id].by);
    if (how === 'wont') rep.add('wilful', 1, 'refusing an errand');
    change(c => { c.errand = { id, state: how === 'yes' ? 'accepted' : how, by }; c.last = id; if (how === 'wont') c.refusals = (c.refusals || []).filter(d => d > cal.day - 7).concat(cal.day); });
  }
  // Another "won't", not an errand (refusing to help with supper): wilful, and counted with the errands' toward the week's three.
  const wont = why => { rep.add('wilful', 1, why); change(c => { c.refusals = (c.refusals || []).filter(d => d > cal.day - 7).concat(cal.day); }); };
  // (three "won't"s within the week: a maintenance correction is due)
  const due = () => (st().refusals || []).filter(d => d > cal.day - 7).length >= 3;
  // The third "won't" in a week: her mother takes her in hand, there and then; and after it, she's set right.
  async function maintenance(P) {
    await P.converse(S.enough(), { shot: ['red', 'mother'] });
    const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: S.maintenanceCorrection }], fade: on_ => w.fade(on_) });
    if (P !== w.P) return;
    await P.converse(S.afterMaintenance(r), { shot: ['red', 'mother'] });
    settled();
    if (r && r.rose) save.flag('rose-said', cal.day);
  }

  // (after it: her wilfulness settled, and the count of refusals begun again)
  const settled = () => { rep.settle('wilful', 1); change(c => { c.refusals = []; }); };

  // ── What she can do, where she is: the garden and the errand's place (the village); giving what she's brought home to her mother (home).
  function actions(P, area) {
    if (!on() || !P) return [];
    const out = [], e = errand(), c = st(), W = P.world, sp = W.spots || {}, m = P.motion;
    if (area === 'village') {
      if (!c.garden && P.garden) out.push(...P.garden.actions());      // (the garden's own work, from the paths between its rows: js/garden.js)
      if (e && (e.state === 'accepted' || e.state === 'broken' || e.state === 'working') && sp[e.place] && (!e.give || m.carry)) out.push({ label: e.state === 'working' ? 'Back in to work' : e.action, at: sp[e.place].at, run: () => doErrand(P, e) });
    }
    if (area === 'home' && e && e.state === 'carrying' && m.carry && P.npc) out.push({ label: 'Give Mama ' + NAME[e.carry], at: P.npcMotion.pos.clone().setY(18), run: () => giveHome(P, e) });
    return out;
  }
  // The garden: its work done (js/garden.js plays it), it's tended for the day.
  const gardenDone = () => { change(c => { c.garden = true; }); w.refresh(); };
  const gardenTended = () => st().garden;
  // The errand's work, where it's asked for: the scene (off the clock), then the time it took.
  async function doErrand(P, e) {
    const sp = P.world.spots[e.place], m = P.motion;
    await m.goTo(sp.at, sp.yaw);
    // (a shift of work, played inside: js/work.js; the errand's done when the work is)
    if (e.shift && root.Work) { if (!root.Work.current(w)) root.Work.begin(w, e.shift); change(c => { c.errand.state = 'working'; c.errand.late = e.state === 'broken'; }); await w.go(root.Work.SHIFTS[e.shift].area, 'door'); return; }
    if (e.give && m.carry) { const it = m.drop(); if (it) it.obj.visible = false; }
    // (the one it's for, if they're there: facing her, and their own word for it)
    const f = e.who && P.figure ? P.figure(e.who) : null;
    if (f && e.met) { if (!f.sat) f.motion.face(Math.atan2(m.pos.x - f.motion.pos.x, m.pos.z - f.motion.pos.z)); m.face(Math.atan2(f.motion.pos.x - m.pos.x, f.motion.pos.z - m.pos.z)); }
    await P.converse(f && e.met ? e.met : e.there, { shot: false, keepCamera: true });
    if (e.trust) rep.trusts(e.trust, 1);
    if (e.quest && w.q.stateOf && w.q.stateOf(e.quest) === 'offered') w.complete(e.quest);      // (a step of a line, done by the work: the first morning at the bakery)
    const late = e.state === 'broken';
    if (e.carry) { hand(P, e.carry); change(c => { c.errand.state = 'carrying'; c.errand.late = late; }); }
    else change(c => { c.errand.state = 'done'; c.errand.late = late; });
    cal.advance(e.mins); w.refresh();
  }
  // A shift's work done (js/work.js): the errand with it, and what it was for.
  function shiftDone(id) {
    const e = errand(); if (!e || e.key !== id) return;
    if (e.trust) rep.trusts(e.trust, 1);
    if (e.quest && w.q.stateOf && w.q.stateOf(e.quest) === 'offered') w.complete(e.quest);
    change(c => { c.errand.state = 'done'; }); w.refresh();
  }
  // Home with it: handed to her mother, and her word for it.
  async function giveHome(P, e) {
    await P.approach(9); const it = P.motion.drop(); if (it) it.obj.visible = false;
    await P.converse([e.back], { shot: ['red', 'mother'] });
    change(c => { c.errand.state = 'done'; }); cal.advance(5); w.refresh();
  }
  // What she's carrying, as she comes into a place: in her hands still.
  function dress(P) {
    if (P && root.Garden) root.Garden.boots(P, w);      // (petals still on her boots, from her mother's flowers)
    const e = errand(); if (!e || !P) return;
    const kind = e.state === 'carrying' ? e.carry : e.state === 'accepted' || e.state === 'broken' ? e.give : null;
    if (kind && !P.motion.carry) hand(P, kind);
  }
  // Each moment: the time gone by an errand not begun (a broken promise, and she knows it); the garden still untended at dusk.
  function tick(P) {
    if (!on()) return;
    const e = errand(), c = st();
    if (e && e.state === 'accepted' && cal.minute > e.by) {
      change(cc => { cc.errand.state = 'broken'; }); rep.add('naughty', 1, 'a broken promise: ' + e.title.toLowerCase());
      if (P && P.talk) for (const [face, text] of S.broken(e.title)) P.talk.muse(text, { face });
      w.refresh();
    }
    if (!c.garden && c.missed !== cal.day && cal.minute >= H('19:00')) {
      change(cc => { cc.missed = cal.day; }); rep.add('naughty', 0.5, 'Mama’s garden left untended');
      if (P && P.talk) P.talk.muse('The garden. I never went near it today.', { face: 'wince' });
    }
  }
  // What's hers to do now, for the objective: the errand (begun by when), what to take home, the garden.
  function objective() {
    if (!on()) return null;
    { const t = (root.Evening && root.Evening.objective(w)) || (root.Pie && root.Pie.objective(w)); if (t) return t; }      // (walked home by the Watchman; sent home by Mistress Pennock)
    const e = errand(), c = st();
    { const k = root.Work && root.Work.current(w); if (k && e) { const t = root.Work.SHIFTS[k.id].tasks[k.step]; if (t) return e.title + ': ' + t.label.toLowerCase() + '.'; } }      // (at work: the task in hand)
    if (e && e.state === 'accepted') return e.title + ': begin by ' + clock(e.by) + '.';
    if (e && e.state === 'carrying') return 'Take ' + NAME[e.carry] + ' home to Mama.';
    if (e && e.state === 'broken') return e.title + ': late, but not too late to do it.';
    if (!c.garden && cal.minute < H('19:00')) return root.Garden && root.Garden.progress(w).begun ? 'Mama’s garden: ' + root.Garden.progressText(w) + '.' : 'Tend Mama’s garden.';
    return null;
  }
  function journalLine() {
    if (!on()) return null;
    const e = errand(), c = st(), parts = [];
    parts.push(c.garden ? 'The garden: tended.' : 'The garden: not yet.');
    if (e) parts.push(e.title + ({ accepted: ': begin by ' + clock(e.by), working: ': under way', carrying: ': to take home', done: e.late ? ': done, late' : ': done', broken: ': not begun in time', little: ': not today (honestly)', wont: ': refused' })[e.state]);
    else parts.push('Nothing asked today.');
    return { name: 'Today', state: 'offered', step: { title: parts[1], hint: parts[0] } };
  }
  return { on, breakfast, answer, wont, due, settled, shiftDone, gardenDone, gardenTended, actions, tick, dress, objective, journalLine, pick, prop, ERRANDS: E };
}

root.Chores = { create, prop };
if (typeof module !== 'undefined' && module.exports) module.exports = root.Chores;
})(typeof window !== 'undefined' ? window : globalThis);
