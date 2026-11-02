// Little Red’s Lessons — a shift of work, played: the afternoon at the bakery (the clearing down after the morning's baking, and the next
// day begun), and the inn's afternoon. Asked for over
// breakfast as an errand (js/chores.js), begun at its door; inside, its tasks one after another, each offered where it's done, each with its
// share of the morning or the afternoon (so the clock comes out where the errand's time says), and whoever she's working for talking the
// whole while. When the last is done, the errand's done; and until then, the door stays shut on her.
//
// The bakery's are timed, on a clock that runs quicker than the day's while she's in there:
//   • Asked for at breakfast (mode 'errand'): Mistress Pennock has the mill run to do, so she gives Red the list and leaves her to it. Back
//     when she said, she finds it done (the errand's trust), or not: then, before Red's confided in her, no trust for it; after, a correction.
//   • Picked up on the day (mode 'picked': offered at the counter while she's still selling, any day Red hasn't been asked for the afternoon): a shorter list,
//     a head start for her when she's done selling. More than half of it done, and she's grateful (a little trust); less, and no harm done.
//
//   Work.begin(w, id) (chores: in through the door to it) · Work.attach(P, w) (the place, played: if a shift's under way here) · Work.SHIFTS
//   (the bakery's afternoon; the inn's afternoon, Bess calling the work from her chair)
// Kept in the save (state.work): { day, id, step, short, mode ('errand' | 'picked' | null), until (the minute the boss is back) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const SHIFT_RATE = 2.5;      // (game minutes a second, in a timed shift: a quarter quicker than the day's. The bakery's whole list, done briskly, is about seventy seconds' play)

// The shifts: each task's place (in the set's world.work), its time, what she does there (kind), and the boss's word as she does it.
const SHIFTS = {
  bakery: { area: 'bakery', boss: 'pennock', errand: 'bakery', away: 210, picked: ['trough', 'boards', 'racks', 'sweep'], tasks: [      // (the afternoon: the clearing down after the morning's baking, and the next day begun; away: the mill run; picked: the head start's list)
    { id: 'trough', what: 'the trough', label: 'Scrape out the dough trough', place: 'trough', mins: 25, kind: 'shape' },
    { id: 'boards', what: 'the boards', label: 'Scrub down the boards', place: 'table', mins: 25, kind: 'shape' },
    { id: 'ash', what: 'the oven', label: 'Rake the ash out of the oven', place: 'oven', mins: 20, kind: 'oven' },
    { id: 'racks', what: 'the racks', label: 'Clear the racks', place: 'racks', mins: 15, kind: 'reach' },
    { id: 'sift', what: 'tomorrow’s flour', label: 'Sift tomorrow’s flour', place: 'table', mins: 25, kind: 'shape' },
    { id: 'sponge', what: 'the sponge', label: 'Set the sponge for the morning', place: 'trough', mins: 30, kind: 'knead' },
    { id: 'sweep', what: 'the floor', label: 'Sweep out', place: 'floor', mins: 30, kind: 'sweep' },
  ] },
  // (the inn's evening, asked for at breakfast: Mistress Abney out till seven, Bess running it from her chair, and the carrier's men in at five
  // (js/innshift.js); out: who it is that goes, and comes back to look it over. Offered on the day by Mistress Abney (short): an afternoon's
  // tidying with her there, no carrier's men)
  inn: { area: 'inn', boss: 'bess', out: 'abney', errand: 'inn', away: 180, tasks: [
    { id: 'fire', what: 'the fire', label: 'Build up the fire', place: 'fire', mins: 10, kind: 'reach' },
    { id: 'tables', what: 'the tables', label: 'Wipe down the tables', place: 'tables', mins: 15, kind: 'shape' },
    { id: 'pots', what: 'the pots', label: 'Scour the pots', place: 'tub', mins: 20, kind: 'shape' },
    { id: 'bowls', what: 'the bowls and bread', label: 'Set out the bowls and bread', place: 'table2', mins: 10, kind: 'shape', carriers: true },
    { id: 'service', what: 'the carrier’s men', label: 'See to the carrier’s men', place: 'table2', mins: 0, kind: 'service', carriers: true },      // (their orders, as they call them: js/innshift.js)
    { id: 'after', what: 'their table', label: 'Clear after them', place: 'table2', mins: 15, kind: 'shape', carriers: true },
    { id: 'tea', what: 'Bess’s tea', label: 'Take Bess her tea', place: 'bess', mins: 10, kind: 'reach', short: true },
    { id: 'sweep', what: 'the floor', label: 'Sweep out', place: 'floor', mins: 20, kind: 'sweep' },
  ] },
};

const stateOf = w => w.save.state.work || (w.save.state.work = { day: 0, id: null, step: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.work); }, { work: true });
// (a shift under way today, here)
const current = (w, area) => { const s = stateOf(w); return s.id && s.day === w.cal.day && (!area || SHIFTS[s.id].area === area) ? s : null; };
function begin(w, id, o) { o = o || {}; change(w, s => { s.day = w.cal.day; s.id = id; s.step = 0; s.short = !!o.short; s.mode = o.mode || null; s.until = o.until || 0; s.back = false; s.start = w.cal.minute; s.svc = null; }); }
// (a shift's tasks, as this one is: asked for on the day, by her, the inn's afternoon is without the carrier's men; the bakery's head start,
// its own short list)
const tasksOf = s => SHIFTS[s.id].tasks.filter(t => !(s.short && t.carriers) && !(!s.short && t.short) && !(s.mode === 'picked' && !SHIFTS[s.id].picked.includes(t.id)));      // (t.short: only on the short list)

// The broom, held in front of her, the head down at the floor ahead.
function broomProp() {
  const T = root.Toon, g = new THREE.Group(), oak = T.mat('#8a6a42'), straw = T.mat('#c8a860');
  const d = new V3(0, -10, 8), len = d.length(), h = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, len, 6), oak); h.position.copy(d).multiplyScalar(0.5); h.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.clone().normalize());
  h.add(new THREE.Mesh(T.hullGeo(h.geometry, 0.05), T.INKM[0])); g.add(h);
  const head = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5, 10, 1, true).scale(1, 1, 0.45), straw); head.material.side = THREE.DoubleSide; head.position.copy(d).add(new V3(0, -1.2, 1)); head.rotation.x = -0.5; g.add(head);
  return { obj: g, name: 'the broom', grip: new V3(0, 0, 0), radius: 2, keep: true, style: 'front' };
}
// The peel (Mistress Pennock's paddle for the oven), and a board of loaves, to carry.
function peelProp() {
  const T = root.Toon, g = new THREE.Group(), oak = T.mat('#8a6a42'), add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, oak); m.position.set(x, y, z); m.add(new THREE.Mesh(T.hullGeo(geo, 0.05), T.INKM[0])); g.add(m); };
  add(new THREE.CylinderGeometry(0.3, 0.35, 16, 6).rotateX(Math.PI / 2), 0, 0, 6); add(new THREE.BoxGeometry(5, 0.4, 6), 0, 0, 16);
  return { obj: g, name: 'the peel', grip: new V3(0, 0, 0), radius: 2, keep: true, style: 'front' };
}

// (what's said when the list's not done, or Bess was up: the corrector's words, the correction, and after)
const SHORT = { bakery: S => [S.pennockShort, S.pennockShortRed, S.pennockShortAfter], inn: S => [S.abneyShort, S.abneyShortRed, S.abneyShortAfter] };

function attach(P, w) {
  const st0 = current(w, w.area); if (!st0) return null;
  const ID = st0.id, S = root.Story, sh = SHIFTS[ID], W = P.world, spots = W.work || {}, m = P.motion, talk = P.talk;
  const task = () => { const s = current(w); return s && tasksOf(s)[s.step] || null; };
  // (the boss's word, said while she works: nothing waits on it)
  const timed = !!st0.mode, mm = P.npcMotion, rig = P.npc;
  let away = false, due = false;
  const say = (text, face) => !(away && (sh.out || sh.boss) === sh.boss) && talk && talk.cast[sh.boss] && talk.caption(sh.boss, text, { face: face || 'calm', wait: s => P.wait(s) });      // (the boss gone out: not if it's the boss who's gone)
  // (the boss out of the place: off on the mill run, or still at her counter; and back in at the door)
  const gone = () => { away = true; if (rig && rig.root) rig.root.visible = false; if (mm) mm.warp(new V3(0, 0, -900), 0); };
  const inAt = () => { const e = W.entries && W.entries.door; return e ? new V3(e.at[0], 0, e.at[1]) : new V3(-22, 0, 26); };
  const lines = (S.WORK && S.WORK[st0.id]) || {};
  // The task in hand: offered at its place.
  W.actions = W.actions || [];
  // (sweeping, where there's a broom: begun by taking it up, where it leans)
  const byBroom = t => t && t.kind === 'sweep' && spots.broom;
  const action = { get label() { const t = task(); return !t ? '' : byBroom(t) ? 'Take up the broom' : t.label; }, get at() { const t = task(); return !t ? new V3() : byBroom(t) ? spots.broom.look.clone() : spots[t.place].look.clone(); }, when: () => !!task() && task().kind !== 'service', run: () => doTask(task()) };
  // (the inn's evening: the carrier's men, served as they call; and Bess to sit with in a lull)
  const svc = st0.id === 'inn' && !st0.short && root.InnShift ? root.InnShift.attach(P, w, { active: () => { const t = task(); return !!t && t.kind === 'service'; },
    done: () => { change(w, s => { s.step++; }); w.refresh(); }, lull: () => !P.busy }) : null;
  if (svc) { W.more = W.more || []; W.more.push(() => current(w) ? svc.actions() : []); }
  W.actions.push(action);
  // (the door shut on her until it's done)
  const door = (W.exits || []).find(e => e.name === 'the door'); if (door) { const was = door.when; door.when = () => !current(w) && (!was || was()); }
  w.refresh();
  if (timed && st0.mode === 'picked') { gone(); if (st0.step === 0) P.act(async () => { await P.wait(0.6); await P.converse(lines.picked || [], { shot: false, keepCamera: true }); }); }
  else if (timed && (st0.until || st0.step > 0)) gone();      // (back in, with her already gone)
  else if (st0.step === 0) P.act(async () => {
    await P.wait(0.6); await P.converse(timed ? lines.list || [] : lines.start || [], { shot: ['red', sh.out || sh.boss] });
    if (timed) { change(w, s => { s.until = w.cal.minute + sh.away; }); if (mm) { await Promise.race([mm.goTo(P.collide(inAt(), 3), null), P.wait(5)]); } gone(); w.refresh(); }      // (the list given: and off, out of the door)
  });
  // (the timed shift's clock: quicker than the day's while she's in here, talk aside; and when it's run out, the boss back)
  if (timed) P.tick(dt => {
    const s = current(w); if (!s || !s.until || s.back) return;
    if (!(talk && talk.playing) && !document.body.classList.contains('correcting')) w.cal.tick(dt, P.busy ? SHIFT_RATE : SHIFT_RATE - (w.RATE || 2));      // (the day's own clock runs too, when she's not busy)
    if (w.cal.minute >= s.until) due = true;
    if (due && !P.busy) { due = false; P.act(back); }
  });

  async function doTask(t) {
    const sp = spots[t.place]; if (!byBroom(t)) { await m.goTo(sp.at, sp.yaw); m.lookAt(sp.look); }
    const said = lines[t.id]; if (said) say(...said);
    await (KINDS[t.kind] || KINDS.reach)(sp, t);
    m.lookAt(null);
    if (!timed) w.cal.advance(t.mins);
    if (w.capacity) w.capacity.add(-t.mins * 0.08, 'work');      // (a shift wears her down, task by task)
    const s0 = current(w); if (!s0) return; const last = s0.step + 1 >= tasksOf(s0).length;
    change(w, s => { s.step++; });
    if (last && timed) { if (current(w).until && !current(w).back) await back(); }      // (all done before she's back: and then she is)
    else if (last) await finish(); else w.refresh();
  }
  const reachAt = async (p, side, hold) => { await m.reach(side || 'R', p); await P.wait(hold || 0.4); await m.release(side || 'R'); };
  const peel = { take: async () => { const p = W.work.peel; await m.goTo(p.at, p.yaw); await reachAt(p.look, 'R', 0.2); (W.peel || []).forEach(o => { o.visible = false; }); const it = peelProp(); P.stage.scene.add(it.obj); m.hold(it, 'front'); },
    put: async () => { const p = W.work.peel; await m.goTo(p.at, p.yaw); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); (W.peel || []).forEach(o => { o.visible = true; }); } };
  // (the broom, from where it leans by the door, and back)
  const broom = { take: async () => { const b = W.work.broom; await m.goTo(b.at, b.yaw); await reachAt(b.look, 'R', 0.2); (W.broom || []).forEach(o => { o.visible = false; }); const it = broomProp(); P.stage.scene.add(it.obj); m.hold(it, 'front'); },
    put: async () => { const b = W.work.broom; await m.goTo(b.at, b.yaw); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); await reachAt(b.look, 'R', 0.2); (W.broom || []).forEach(o => { o.visible = true; }); } };
  const KINDS = {
    knead: async sp => { for (let k = 0; k < 4; k++) { const p = sp.look.clone().add(new V3((k % 2 ? 1.5 : -1.5), 0, 0)); await Promise.all([m.reach('L', p.clone().add(new V3(-1.2, 0, 0))), m.reach('R', p)]); await P.wait(0.5); await Promise.all([m.release('L'), m.release('R')]); } },
    shape: async sp => { for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3((k - 1) * 4, 0, 1)), k % 2 ? 'L' : 'R', 0.6); },
    oven: async sp => { await peel.take(); await m.goTo(sp.at, sp.yaw); for (let k = 0; k < 2; k++) { await reachAt(sp.look.clone().add(new V3((k - 0.5) * 3, 0, 0)), 'R', 0.7); } await peel.put(); },
    draw: async sp => { await peel.take(); await m.goTo(sp.at, sp.yaw); for (let k = 0; k < 2; k++) await reachAt(sp.look.clone().add(new V3((k - 0.5) * 3, 0, 0)), 'R', 0.7); await peel.put();
      const tray = root.Chores ? root.Chores.prop('loaves') : null; if (tray) { P.stage.scene.add(tray.obj); m.hold(tray, 'front'); } },
    sweep: async sp => { const c = sp.at, br = W.work.broom;
      if (br) { await broom.take(); for (const [dx, dz] of [[14, 0], [14, -10], [-14, -10], [-14, 0], [0, 4]]) await m.goTo(P.collide(c.clone().add(new V3(dx, 0, dz)), 3.2), null, { speed: 0.5 }); await broom.put(); return; }      // (with the broom, where there's one)
      for (const [dx, dz] of [[14, 0], [14, -10], [-14, -10], [-14, 0], [0, 4]]) { const to = P.collide(c.clone().add(new V3(dx, 0, dz)), 3.2); m.reach('R', () => m.pos.clone().add(new V3(Math.sin(m.yaw) * 5, 0.5, Math.cos(m.yaw) * 5))); await m.goTo(to, null, { speed: 0.5 }); } await m.release('R'); },
    racks: async sp => { const it = m.drop(); if (it) P.stage.scene.remove(it.obj); for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3(0, (k - 1) * 8, (k - 1) * 3)), 'R', 0.4); },
    ale: async sp => { for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3((k - 1) * 3, 0, 0)), 'R', 0.6); const tray = root.Chores ? root.Chores.prop('jug') : null; if (tray) { P.stage.scene.add(tray.obj); m.hold(tray, 'hang'); } },
    serve: async () => { const it = m.carry; if (it) { m.drop(); P.stage.scene.remove(it.obj); } await P.converse(lines.customers || [], { shot: false, keepCamera: true }); },
    reach: async sp => reachAt(sp.look),
  };
  // The boss back (timed shifts): in at the door, and the list looked over. All of it, or not; and what comes of it.
  async function back() {
    const s = current(w); if (!s || s.back) return; change(w, x => { x.back = true; });
    if (w.cal.minute < s.until) { await P.converse(lines.waiting || [], { shot: false, keepCamera: true }); w.cal.advance(s.until - w.cal.minute); }      // (done early: and she's not long)
    const list = tasksOf(s), n = list.length, k = s.step, all = k >= n, left = list.slice(k).map(t => t.what || t.label.toLowerCase()), who = sh.out || sh.boss;
    const up = svc ? svc.up : 0; if (svc) svc.gone();      // (the inn: how many times Bess was on her feet; and the men up to their beds)
    away = false; if (rig && rig.root) rig.root.visible = true;
    if (mm) { const at = inAt(); mm.warp(at, Math.PI); const to = P.collide(m.pos.clone().setY(0).add(new V3(Math.sin(m.yaw) * 12, 0, Math.cos(m.yaw) * 12)), 3.2); await Promise.race([mm.goTo(to, Math.atan2(m.pos.x - to.x, m.pos.z - to.z)), P.wait(6)]); mm.face(Math.atan2(m.pos.x - mm.pos.x, m.pos.z - mm.pos.z)); await m.face(Math.atan2(mm.pos.x - m.pos.x, mm.pos.z - m.pos.z)); }
    if (s.mode === 'picked') {
      const good = k * 2 > n;
      await P.converse(good ? lines.pickedGood || [] : lines.pickedSome || [], { shot: ['red', sh.boss] });
      if (good) w.rep.trusts(sh.boss, 0.5);
      change(w, x => { x.id = null; }); w.refresh(); return;
    }
    if (all && up < 2) return finish(up);
    // (not all done, or Bess up twice and more: before she's confided in her, no trust for it; after, a correction, as she'd want)
    change(w, x => { x.id = null; });
    if (w.chores && w.chores.shiftDone) w.chores.shiftDone(sh.errand, { short: true });
    const [said, script, after] = (SHORT[ID] || SHORT.bakery)(S);
    if (w.rep.openness(who) >= 1 && root.Correction) {
      await P.converse(said(left, true, up), { shot: ['red', who] });
      const r = await root.Correction.run(P, Object.assign({ corrector: who, fade: on => w.fade(on), turns: [{ subject: 'red', script }] }, W.lap ? W.lap.bench : {}));      // (on her bench, where it stands by the counter)
      if (P !== w.P) return;
      await P.converse(after(r), { shot: ['red', who] });
      w.rep.settle('naughty', 0.5); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
      if (root.Evening) root.Evening.record(w, { what: 'shift', by: who, informs: true });      // (she'll tell Red's mother herself: a reprieve at home)
    } else await P.converse(said(left, false, up), { shot: ['red', who] });
    w.refresh();
  }
  // Done: the errand done (js/chores.js), her word for it, and the door open again.
  // (up: the inn, Bess on her feet the once: said, and let go)
  async function finish(up) {
    change(w, s => { s.id = null; });
    if (w.chores && w.chores.shiftDone) w.chores.shiftDone(sh.errand);
    await P.converse((up && lines.endOnce ? lines.endOnce : []).concat(lines.end || []), { shot: ['red', sh.out || sh.boss] });
    if (svc && !up) w.rep.trusts('bess', 0.5);      // (an evening without her on her feet: Bess's thanks too)
    const more = root.InHand && P.npc ? await root.InHand.afterShift(P, w, ID) : false;      // (Mistress Pennock's trust; Mistress Abney taking her in hand: js/inhand.js)
    if (!more && ID === 'inn' && root.AbneyPromise && P.npc) await root.AbneyPromise.ask(P, w);      // (and, at the end of an afternoon at the inn, Mistress Abney's favour to ask)
    w.refresh();
  }
  return { task, action };
}

const api = { begin, attach, current, tasksOf, SHIFTS, SHIFT_RATE };
root.Work = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
