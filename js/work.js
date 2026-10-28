// Little Red’s Lessons — a shift of work, played: the afternoon at the bakery (the clearing down after the morning's baking, and the next
// day begun), and the inn's afternoon. Asked for over
// breakfast as an errand (js/chores.js), begun at its door; inside, its tasks one after another, each offered where it's done, each with its
// share of the morning or the afternoon (so the clock comes out where the errand's time says), and whoever she's working for talking the
// whole while. When the last is done, the errand's done; and until then, the door stays shut on her.
//
//   Work.begin(w, id) (chores: in through the door to it) · Work.attach(P, w) (the place, played: if a shift's under way here) · Work.SHIFTS
//   (the bakery's afternoon; the inn's afternoon, Bess calling the work from her chair)
// Kept in the save (state.work): { day, id, step }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;

// The shifts: each task's place (in the set's world.work), its time, what she does there (kind), and the boss's word as she does it.
const SHIFTS = {
  bakery: { area: 'bakery', boss: 'pennock', errand: 'bakery', tasks: [      // (the afternoon: the clearing down after the morning's baking, and the next day begun)
    { id: 'trough', label: 'Scrape out the dough trough', place: 'trough', mins: 25, kind: 'shape' },
    { id: 'boards', label: 'Scrub down the boards', place: 'table', mins: 25, kind: 'shape' },
    { id: 'ash', label: 'Rake the ash out of the oven', place: 'oven', mins: 20, kind: 'oven' },
    { id: 'racks', label: 'Clear the racks', place: 'racks', mins: 15, kind: 'reach' },
    { id: 'sift', label: 'Sift tomorrow’s flour', place: 'table', mins: 25, kind: 'shape' },
    { id: 'sponge', label: 'Set the sponge for the morning', place: 'trough', mins: 30, kind: 'knead' },
    { id: 'sweep', label: 'Sweep out', place: 'floor', mins: 30, kind: 'sweep' },
  ] },
  inn: { area: 'inn', boss: 'bess', errand: 'inn', tasks: [
    { id: 'pots', label: 'Scour the pots', place: 'tub', mins: 30, kind: 'shape' },
    { id: 'tables', label: 'Wipe down the tables', place: 'tables', mins: 20, kind: 'shape' },
    { id: 'fire', label: 'Build up the fire', place: 'fire', mins: 10, kind: 'reach' },
    { id: 'ale', label: 'Draw the ale for the carrier’s men', place: 'counter', mins: 25, kind: 'ale', carriers: true },
    { id: 'carriers', label: 'Serve the carrier’s men', place: 'table2', mins: 50, kind: 'serve', carriers: true },      // (only on an afternoon asked for in the morning: the carrier's men are expected)
    { id: 'suppers', label: 'Carry in the carrier’s men’s suppers', place: 'table2', mins: 40, kind: 'serve', carriers: true },      // (and their suppers, into the evening: straight home after)
    { id: 'after', label: 'Clear after them', place: 'tables', mins: 30, kind: 'shape', carriers: true },
    { id: 'tea', label: 'Take Bess her tea', place: 'bess', mins: 15, kind: 'reach' },
    { id: 'sweep', label: 'Sweep out', place: 'floor', mins: 25, kind: 'sweep' },
  ] },
};

const stateOf = w => w.save.state.work || (w.save.state.work = { day: 0, id: null, step: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.work); }, { work: true });
// (a shift under way today, here)
const current = (w, area) => { const s = stateOf(w); return s.id && s.day === w.cal.day && (!area || SHIFTS[s.id].area === area) ? s : null; };
function begin(w, id, o) { change(w, s => { s.day = w.cal.day; s.id = id; s.step = 0; s.short = !!(o && o.short); }); }
// (a shift's tasks, as this one is: asked for on the day, by her, the inn's afternoon is without the carrier's men)
const tasksOf = s => SHIFTS[s.id].tasks.filter(t => !(s.short && t.carriers));

// The peel (Mistress Pennock's paddle for the oven), and a board of loaves, to carry.
function peelProp() {
  const T = root.Toon, g = new THREE.Group(), oak = T.mat('#8a6a42'), add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, oak); m.position.set(x, y, z); m.add(new THREE.Mesh(T.hullGeo(geo, 0.05), T.INKM[0])); g.add(m); };
  add(new THREE.CylinderGeometry(0.3, 0.35, 16, 6).rotateX(Math.PI / 2), 0, 0, 6); add(new THREE.BoxGeometry(5, 0.4, 6), 0, 0, 16);
  return { obj: g, name: 'the peel', grip: new V3(0, 0, 0), radius: 2, keep: true, style: 'front' };
}

function attach(P, w) {
  const st0 = current(w, w.area); if (!st0) return null;
  const S = root.Story, sh = SHIFTS[st0.id], W = P.world, spots = W.work || {}, m = P.motion, talk = P.talk;
  const task = () => { const s = current(w); return s && tasksOf(s)[s.step] || null; };
  // (the boss's word, said while she works: nothing waits on it)
  const say = (text, face) => talk && talk.cast[sh.boss] && talk.caption(sh.boss, text, { face: face || 'calm', wait: s => P.wait(s) });
  const lines = (S.WORK && S.WORK[st0.id]) || {};
  // The task in hand: offered at its place.
  W.actions = W.actions || [];
  const action = { get label() { const t = task(); return t ? t.label : ''; }, get at() { const t = task(); return t ? spots[t.place].look.clone() : new V3(); }, when: () => !!task(), run: () => doTask(task()) };
  W.actions.push(action);
  // (the door shut on her until it's done)
  const door = (W.exits || []).find(e => e.name === 'the door'); if (door) { const was = door.when; door.when = () => !current(w) && (!was || was()); }
  w.refresh();
  if (st0.step === 0) P.act(async () => { await P.wait(0.6); await P.converse(lines.start || [], { shot: ['red', sh.boss] }); });

  async function doTask(t) {
    const sp = spots[t.place]; await m.goTo(sp.at, sp.yaw); m.lookAt(sp.look);
    const said = lines[t.id]; if (said) say(...said);
    await (KINDS[t.kind] || KINDS.reach)(sp, t);
    m.lookAt(null);
    w.cal.advance(t.mins);
    const last = current(w).step + 1 >= tasksOf(current(w)).length;
    change(w, s => { s.step++; });
    if (last) await finish(); else w.refresh();
  }
  const reachAt = async (p, side, hold) => { await m.reach(side || 'R', p); await P.wait(hold || 0.4); await m.release(side || 'R'); };
  const peel = { take: async () => { const p = W.work.peel; await m.goTo(p.at, p.yaw); await reachAt(p.look, 'R', 0.2); (W.peel || []).forEach(o => { o.visible = false; }); const it = peelProp(); P.stage.scene.add(it.obj); m.hold(it, 'front'); },
    put: async () => { const p = W.work.peel; await m.goTo(p.at, p.yaw); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); (W.peel || []).forEach(o => { o.visible = true; }); } };
  const KINDS = {
    knead: async sp => { for (let k = 0; k < 4; k++) { const p = sp.look.clone().add(new V3((k % 2 ? 1.5 : -1.5), 0, 0)); await Promise.all([m.reach('L', p.clone().add(new V3(-1.2, 0, 0))), m.reach('R', p)]); await P.wait(0.5); await Promise.all([m.release('L'), m.release('R')]); } },
    shape: async sp => { for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3((k - 1) * 4, 0, 1)), k % 2 ? 'L' : 'R', 0.6); },
    oven: async sp => { await peel.take(); await m.goTo(sp.at, sp.yaw); for (let k = 0; k < 2; k++) { await reachAt(sp.look.clone().add(new V3((k - 0.5) * 3, 0, 0)), 'R', 0.7); } await peel.put(); },
    draw: async sp => { await peel.take(); await m.goTo(sp.at, sp.yaw); for (let k = 0; k < 2; k++) await reachAt(sp.look.clone().add(new V3((k - 0.5) * 3, 0, 0)), 'R', 0.7); await peel.put();
      const tray = root.Chores ? root.Chores.prop('loaves') : null; if (tray) { P.stage.scene.add(tray.obj); m.hold(tray, 'front'); } },
    sweep: async sp => { const c = sp.at; for (const [dx, dz] of [[14, 0], [14, -10], [-14, -10], [-14, 0], [0, 4]]) { const to = P.collide(c.clone().add(new V3(dx, 0, dz)), 3.2); m.reach('R', () => m.pos.clone().add(new V3(Math.sin(m.yaw) * 5, 0.5, Math.cos(m.yaw) * 5))); await m.goTo(to, null, { speed: 0.5 }); } await m.release('R'); },
    racks: async sp => { const it = m.drop(); if (it) P.stage.scene.remove(it.obj); for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3(0, (k - 1) * 8, (k - 1) * 3)), 'R', 0.4); },
    ale: async sp => { for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3((k - 1) * 3, 0, 0)), 'R', 0.6); const tray = root.Chores ? root.Chores.prop('jug') : null; if (tray) { P.stage.scene.add(tray.obj); m.hold(tray, 'hang'); } },
    serve: async () => { const it = m.carry; if (it) { m.drop(); P.stage.scene.remove(it.obj); } await P.converse(lines.customers || [], { shot: false, keepCamera: true }); },
    reach: async sp => reachAt(sp.look),
  };
  // Done: the errand done (js/chores.js), her word for it, and the door open again.
  async function finish() {
    change(w, s => { s.id = null; });
    if (w.chores && w.chores.shiftDone) w.chores.shiftDone(sh.errand);
    await P.converse(lines.end || [], { shot: ['red', sh.boss] });
    const more = root.InHand && P.npc ? await root.InHand.afterShift(P, w, st0.id) : false;      // (Mistress Pennock's trust; Mistress Abney taking her in hand: js/inhand.js)
    if (!more && st0.id === 'inn' && root.AbneyPromise && P.npc) await root.AbneyPromise.ask(P, w);      // (and, at the end of an afternoon at the inn, Mistress Abney's favour to ask)
    w.refresh();
  }
  return { task, action };
}

const api = { begin, attach, current, tasksOf, SHIFTS };
root.Work = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
