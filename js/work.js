// Little Red’s Lessons — a shift of work, played: the afternoon at the bakery (the clearing down after the morning's baking, and the next
// day begun), and the inn's afternoon. Asked for over
// breakfast as an errand (js/chores.js), begun at its door; inside, its tasks one after another, each offered where it's done, each with its
// share of the morning or the afternoon (so the clock comes out where the errand's time says), and whoever she's working for talking the
// whole while. When the last is done, the errand's done; and until then, the door stays shut on her.
//
// The bakery's are timed, on a clock that runs at a minute a second while she's in there (slower than the day's):
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
const SHIFT_RATE = 1;      // (game minutes a second, in a timed shift: a minute a second, slower than the day's, so there's time to do the work in it. A shift's own rate, where it has one, over this)

// The shifts: each task's place (in the set's world.work), its time, what she does there (kind), and the boss's word as she does it. Done in any
// order, each offered where it's done, as she comes near it (as the garden's are); after: not till that one's done.
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
  // (the inn: Mistress Abney out of the room either way, so it's Bess's, from her chair. Carrier's day, given at breakfast: Abney away to Ashby
  // till seven, and the carrier's men in at five (js/innshift.js). Offered on the day by Abney herself (short): an afternoon's tidying while
  // she turns out the rooms upstairs, back down when the time's up. out: who goes, and comes back to look it over)
  inn: { area: 'inn', boss: 'bess', out: 'abney', errand: 'inn', away: 180, shortAway: 120, rate: 1, tasks: [
    { id: 'fire', what: 'the fire', label: 'Build up the fire', place: 'fire', mins: 10, kind: 'reach' },
    { id: 'tableA', what: 'the long table at the back', label: 'Wipe down the table', place: 'tableA', mins: 8, kind: 'shape', line: 'tables' },
    { id: 'tableB', what: 'the table by the hearth', label: 'Wipe down the table', place: 'table2', mins: 8, kind: 'shape', line: 'tables' },
    { id: 'tableC', what: 'the table by the stair', label: 'Wipe down the table', place: 'tableC', mins: 8, kind: 'shape', line: 'tables' },
    { id: 'pots', what: 'the pots', label: 'Scour the pots', place: 'tub', mins: 20, kind: 'shape' },
    { id: 'tea', what: 'Bess’s tea', label: 'Take Bess her tea', place: 'counter', mins: 8, kind: 'tea' },      // (steeping on the bar: taken up there, and carried to her)
    { id: 'bowls', what: 'the bowls and bread', label: 'Set out the bowls and bread', place: 'table2', mins: 10, kind: 'shape', carriers: true },
    { id: 'service', what: 'the carrier’s men', label: 'See to the carrier’s men', place: 'table2', mins: 0, kind: 'service', carriers: true },      // (their orders, as they call them: js/innshift.js)
    { id: 'after', what: 'their table', label: 'Clear after them', place: 'table2', mins: 15, kind: 'shape', carriers: true, after: 'service' },
    { id: 'sweep', what: 'the floor', label: 'Sweep out', place: 'floor', mins: 20, kind: 'sweep' },
  ] },
};

const stateOf = w => w.save.state.work || (w.save.state.work = { day: 0, id: null, step: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.work); }, { work: true });
// (a shift under way today, here)
const current = (w, area) => { const s = stateOf(w); return s.id && s.day === w.cal.day && (!area || SHIFTS[s.id].area === area) ? s : null; };
function begin(w, id, o) { o = o || {}; change(w, s => { s.day = w.cal.day; s.id = id; s.step = 0; s.done = []; s.basket = null; s.short = !!o.short; s.mode = o.mode || null; s.until = o.until || 0; s.back = false; s.start = w.cal.minute; s.svc = null; }); }
// (a shift's tasks, as this one is: asked for on the day, by her, the inn's afternoon is without the carrier's men; the bakery's head start,
// its own short list)
const tasksOf = s => SHIFTS[s.id].tasks.filter(t => !(s.short && t.carriers) && !(s.mode === 'picked' && !SHIFTS[s.id].picked.includes(t.id)));
// (what's done of it, and what's still to do: in any order; s.step kept as the count)
const doneOf = s => s.done || [];
const leftOf = s => tasksOf(s).filter(t => !doneOf(s).includes(t.id));
// (her basket, set aside as she comes in to work, and back in her hands as she goes: js/world.js asks for it on her way out)
function stashed(w) { const s = stateOf(w); if (!s.basket) return null; const b = s.basket; change(w, x => { x.basket = null; }); return b; }

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
  // (to a task's place: walked there, and if the way's not found in a few seconds, or she stops short, put there: never left a step away from it)
  const arrive = async (at, yaw, o) => { const to = at.clone().setY(0); await Promise.race([m.goTo(to, yaw, o), P.wait(7)]);
    if (Math.hypot(m.pos.x - to.x, m.pos.z - to.z) > 2.5) { m.auto = null; const p = P.collide(to, 3.2); m.warp(p, yaw == null ? m.yaw : yaw); P.rig.root.position.copy(p); } };
  const timed = !!st0.mode, mm = P.npcMotion, rig = P.npc, cur = () => current(w);
  let away = false, due = false, carrying = null, offers = 0, offerDue = false;
  const say = (text, face) => !(away && (sh.out || sh.boss) === sh.boss) && talk && talk.cast[sh.boss] && talk.caption(sh.boss, text, { face: face || 'calm', wait: s => P.wait(s) });      // (the boss gone out: not if it's the boss who's gone)
  // (the boss out of the place: off on the mill run, upstairs at the rooms, or still at her counter; and back in)
  const gone = () => { away = true; if (rig && rig.root) rig.root.visible = false; if (mm) mm.warp(new V3(0, 0, -900), 0); };
  const inAt = () => { const e = W.entries && W.entries.door; return e ? new V3(e.at[0], 0, e.at[1]) : new V3(-22, 0, 26); };
  const lines = (S.WORK && S.WORK[ID]) || {};
  // Her basket, if she came in with it: set by, and back in her hands as she goes.
  // (each moment, since it's put back in her hands after the place is set up: js/chores.js's dress)
  P.tick(() => { const it = m.carry; if (!cur() || !it || it.kind !== 'basket' || P.busy) return;
    change(w, x => { x.basket = { kind: 'basket', full: !!it.full, contents: (it.contents || []).slice() }; }); m.drop(); it.obj.visible = false; P.stage.scene.remove(it.obj); w.refresh(); });
  // What's to do: each task still to do, offered at its place; sweeping begun by taking up the broom where there is one; Bess's tea, taken up
  // at the bar and given her where she sits.
  const byBroom = t => t && t.kind === 'sweep' && spots.broom;
  const open = () => { const s = cur(); return s ? leftOf(s).filter(t => t.kind !== 'service' && (!t.after || doneOf(s).includes(t.after))) : []; };
  function actions() {
    const s = cur(); if (!s || P.busy) return [];
    if (carrying) return carrying.id === 'tea' && spots.bess ? [{ label: 'Give Bess her tea', at: spots.bess.look.clone(), reach: 45, run: () => giveTea() }] : [];
    const where = t => { const top = W.tableTops && W.tableTops[t.id]; return top ? new V3((top.x0 + top.x1) / 2, top.y, (top.z0 + top.z1) / 2) : (byBroom(t) ? spots.broom : spots[t.place] || spots.floor).look.clone(); };      // (a table: offered from any side of it)
    return open().map(t => ({ label: byBroom(t) ? 'Take up the broom' : t.label, at: where(t), reach: 45, run: () => m.carry ? P.handsFull() : doTask(t) }));
  }
  W.more = W.more || []; W.more.push(actions);
  // (the inn's evening: the carrier's men, served as they call, from when they come in)
  const svc = ID === 'inn' && !st0.short && root.InnShift ? root.InnShift.attach(P, w, { active: () => { const s = cur(); return !!s && !doneOf(s).includes('service') && !s.back; },
    done: () => { markDone('service'); } }) : null;
  if (svc) W.more.push(() => cur() ? svc.actions() : []);
  // (the door shut on her until it's over)
  const door = (W.exits || []).find(e => e.name === 'the door'); if (door) { const was = door.when; door.when = () => !current(w) && (!was || was()); }
  w.refresh();
  // The start: the list given, and the boss away. (The bakery's head start: her list chalked up, and Mistress Pennock at the counter. The inn's
  // short afternoon: Mistress Abney upstairs, Bess's word for it.)
  const short = ID === 'inn' && st0.short;
  if (timed && st0.mode === 'picked') { gone(); if (!doneOf(st0).length) P.act(async () => { await P.wait(0.6); await P.converse(lines.picked || [], { shot: false, keepCamera: true }); }); }
  else if (timed && (st0.until || doneOf(st0).length)) gone();      // (back in, with her already gone)
  else P.act(async () => {
    await P.wait(0.6); await P.converse(short ? lines.short || [] : lines.list || [], { shot: ['red', sh.out || sh.boss] });
    change(w, s => { s.until = w.cal.minute + (short ? sh.shortAway : sh.away); });
    if (mm) await Promise.race([mm.goTo(P.collide(short && spots.stair ? spots.stair.at : inAt(), 3), null), P.wait(5)]);
    gone(); w.refresh();
  });
  // (the shift's clock: a minute a second while she's in here, talk aside; and when it's run out, the boss back)
  P.tick(dt => {
    const s = cur(); if (!s || !s.until || s.back) return;
    if (P.busy && !(talk && talk.playing) && !document.body.classList.contains('correcting')) w.cal.tick(dt, sh.rate || SHIFT_RATE);      // (busy at a task, the day's own clock stands: this one runs on. Otherwise the day's runs, at the shift's rate: see rate)
    if (w.cal.minute >= s.until) due = true;
    if (due && !P.busy) { due = false; P.act(back); }
  });
  P.tick(() => { if (offerDue && !P.busy && !(talk && talk.playing) && cur() && !cur().back) { offerDue = false; P.act(sitWithBess); } });

  function markDone(id) {
    change(w, s => { s.done = (s.done || []).concat(id); s.step = s.done.length; });
    const s = cur(); if (s && !leftOf(s).length && s.until && !s.back) P.act(back);      // (all of it done before she's back: and then she is, at her hour)
    else { w.refresh(); if (ID === 'inn') maybeOffer(); }
  }
  async function doTask(t) {
    const top = W.tableTops && W.tableTops[t.id];      // (a table at the inn: wiped from whichever side she's come to it, at the edge nearest her)
    if (top) { const q = new V3(Math.max(top.x0, Math.min(top.x1, m.pos.x)), 0, Math.max(top.z0, Math.min(top.z1, m.pos.z))), out = m.pos.clone().setY(0).sub(q); if (out.lengthSq() < 0.01) out.set(0, 0, 1); out.normalize();
      const at = P.collide(q.clone().addScaledVector(out, 6), 3.2); await arrive(at, Math.atan2(q.x - at.x, q.z - at.z)); q.y = top.y; const side = new V3(out.z, 0, -out.x);
      const said = lines[t.line || t.id]; if (said) say(...said);
      for (let k = 0; k < 3; k++) await reachAt(q.clone().addScaledVector(out, -1.5).addScaledVector(side, (k - 1) * 4), k % 2 ? 'L' : 'R', 0.6);
      if (w.capacity) w.capacity.add(-t.mins * 0.08, 'work'); markDone(t.id); return; }
    const sp = spots[t.place] || spots.floor; if (!byBroom(t) && t.kind !== 'tea') { await arrive(sp.at, sp.yaw); m.lookAt(sp.look); }
    const said = lines[t.line || t.id]; if (said) say(...said);
    if (t.kind === 'tea') { await arrive(sp.at, sp.yaw); m.lookAt(sp.look); await reachAt(sp.look); const cup = cupProp(); P.stage.scene.add(cup.obj); m.hold(cup, 'hang'); m.lookAt(null); carrying = { id: 'tea', it: cup, t }; w.refresh(); return; }
    await (KINDS[t.kind] || KINDS.reach)(sp, t);
    m.lookAt(null);
    if (w.capacity) w.capacity.add(-t.mins * 0.08, 'work');      // (a shift wears her down, task by task)
    markDone(t.id);
  }
  async function giveTea() {
    const c = carrying, sp = spots.bess; if (!c || !sp) return;
    await arrive(sp.at, sp.yaw); m.lookAt(sp.look); await m.reach('R', sp.look.clone()); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); await m.release('R'); m.lookAt(null);
    carrying = null; const said = lines.tea; if (said) say(...said);
    markDone('tea');
  }
  // Bess, now and then, with nobody waiting: will she sit a minute? On the bench nearest her chair; a piece of Bess's story, and then another
  // if she stays; or she remembers she should get on.
  function maybeOffer() {
    const s = cur(), k = doneOf(s || {}).length; if (!s || s.back || offers >= 2 || carrying || (k !== 2 && k !== 4) || (svc && !svc.quiet())) return;      // (after the second thing done, and the fourth)
    offers++; offerDue = true;      // (asked as soon as she's free: js/play.js runs one thing at a time)
  }
  async function sitWithBess() {
    let yes = false; await P.converse(S.bessOffer({ yes: () => { yes = true; } }), { shot: ['red', 'bess'] }); if (!yes) return;
    const chair = W.bessChair, seat = W.seats.filter(x => x.name === 'the bench').sort((a, b) => a.at.distanceTo(chair.at) - b.at.distanceTo(chair.at))[0];
    if (seat) await P.sitOn(seat);
    for (let k = 0; k < 2; k++) {
      const n = (w.save.state.bessTalk || {}).n || 0, beats = lines.bess || [], beat = beats[n] || (lines.bessAgain || [])[(n + k) % Math.max(1, (lines.bessAgain || []).length)] || [];
      await P.converse(beat, { shot: ['red', 'bess'] }); if (n < beats.length) w.save.change(x => { x.bessTalk = { n: n + 1 }; });
      w.rep.trusts('bess', 0.25); if (w.capacity) w.capacity.add(5, 'sitting with Bess'); w.cal.advance(10);
      if (k === 0) { let more = false; await P.converse(S.bessStay({ yes: () => { more = true; } }), { shot: ['red', 'bess'] }); if (!more) break; }
    }
    if (P.sitting) await P.getUp(); w.refresh();
  }
  const reachAt = async (p, side, hold) => { await m.reach(side || 'R', p); await P.wait(hold || 0.4); await m.release(side || 'R'); };
  const peel = { take: async () => { const p = W.work.peel; await arrive(p.at, p.yaw); await reachAt(p.look, 'R', 0.2); (W.peel || []).forEach(o => { o.visible = false; }); const it = peelProp(); P.stage.scene.add(it.obj); m.hold(it, 'front'); },
    put: async () => { const p = W.work.peel; await arrive(p.at, p.yaw); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); (W.peel || []).forEach(o => { o.visible = true; }); } };
  // (the broom, from where it leans by the door, and back)
  const broom = { take: async () => { const b = W.work.broom; await arrive(b.at, b.yaw); await reachAt(b.look, 'R', 0.2); (W.broom || []).forEach(o => { o.visible = false; }); const it = broomProp(); P.stage.scene.add(it.obj); m.hold(it, 'front'); },
    put: async () => { const b = W.work.broom; await arrive(b.at, b.yaw); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); await reachAt(b.look, 'R', 0.2); (W.broom || []).forEach(o => { o.visible = true; }); } };
  const KINDS = {
    knead: async sp => { for (let k = 0; k < 4; k++) { const p = sp.look.clone().add(new V3((k % 2 ? 1.5 : -1.5), 0, 0)); await Promise.all([m.reach('L', p.clone().add(new V3(-1.2, 0, 0))), m.reach('R', p)]); await P.wait(0.5); await Promise.all([m.release('L'), m.release('R')]); } },
    shape: async sp => { for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3((k - 1) * 4, 0, 1)), k % 2 ? 'L' : 'R', 0.6); },
    oven: async sp => { await peel.take(); await arrive(sp.at, sp.yaw); for (let k = 0; k < 2; k++) { await reachAt(sp.look.clone().add(new V3((k - 0.5) * 3, 0, 0)), 'R', 0.7); } await peel.put(); },
    sweep: async sp => { const c = sp.at, br = W.work.broom;
      if (br) { await broom.take(); for (const [dx, dz] of [[14, 0], [14, -10], [-14, -10], [-14, 0], [0, 4]]) await arrive(P.collide(c.clone().add(new V3(dx, 0, dz)), 3.2), null, { speed: 0.5 }); await broom.put(); return; }      // (with the broom, where there's one)
      for (const [dx, dz] of [[14, 0], [14, -10], [-14, -10], [-14, 0], [0, 4]]) { const to = P.collide(c.clone().add(new V3(dx, 0, dz)), 3.2); m.reach('R', () => m.pos.clone().add(new V3(Math.sin(m.yaw) * 5, 0.5, Math.cos(m.yaw) * 5))); await arrive(to, null, { speed: 0.5 }); } await m.release('R'); },
    reach: async sp => reachAt(sp.look),
  };
  // The boss back, at her hour (or as soon as it's all done, the time let go by): the list looked over, and what comes of it; then out of
  // the door, and she's outside again.
  async function back() {
    const s = cur(); if (!s || s.back) return; change(w, x => { x.back = true; });
    if (w.cal.minute < s.until) { await P.converse(lines.waiting || [], { shot: false, keepCamera: true }); w.cal.advance(s.until - w.cal.minute); }      // (done early: she waits out the time)
    if (carrying) { const it = m.drop(); if (it) P.stage.scene.remove(it.obj); carrying = null; }
    const list = tasksOf(s), n = list.length, k = doneOf(s).length, all = k >= n, left = leftOf(s).map(t => t.what || t.label.toLowerCase()), who = sh.out || sh.boss;
    const up = svc ? svc.up : 0; if (svc) svc.gone();      // (the inn: how many times Bess was on her feet; and the men up to their beds)
    if (P.sitting) await P.getUp();
    away = false; if (rig && rig.root) rig.root.visible = true;
    if (mm) { const at = short && spots.stair ? spots.stair.at : inAt(); mm.warp(at, Math.PI); const to = P.collide(m.pos.clone().setY(0).add(new V3(Math.sin(m.yaw) * 12, 0, Math.cos(m.yaw) * 12)), 3.2); await Promise.race([mm.goTo(to, Math.atan2(m.pos.x - to.x, m.pos.z - to.z)), P.wait(6)]); mm.face(Math.atan2(m.pos.x - mm.pos.x, m.pos.z - mm.pos.z)); await m.face(Math.atan2(mm.pos.x - m.pos.x, mm.pos.z - m.pos.z)); }
    change(w, x => { x.id = null; });
    if (s.mode === 'picked') {      // (the bakery's head start: more than half of it, her thanks; less, no harm done)
      const good = k * 2 > n;
      await P.converse(good ? lines.pickedGood || [] : lines.pickedSome || [], { shot: ['red', sh.boss] });
      if (good) w.rep.trusts(sh.boss, 0.5);
    } else if (short) {      // (Mistress Abney's afternoon: more than half, a help; half, no more said; less, idle, and stricter than Mistress Pennock about it)
      const good = k * 2 > n, idle = k * 2 < n, told = w.rep.openness('abney') >= 1;
      if (w.chores && w.chores.shiftDone) w.chores.shiftDone(sh.errand, { short: !good });
      if (good || !idle) await P.converse(good ? S.abneyShortGood() : S.abneyShortHalf(), { shot: ['red', 'abney'] });
      else if (told && root.Correction) { w.rep.add('naughty', 1, 'idling through Mistress Abney’s afternoon'); await correct(S.abneyIdled(left, true), S.abneyIdledRed); }
      else { w.rep.trusts('abney', -0.5); await P.converse(S.abneyIdled(left, false), { shot: ['red', 'abney'] }); }
    } else if (all && up < 2) { await finish(up); return; }
    else {      // (not all done, or Bess up twice and more: before she's confided in her, no trust for it; after, a correction, as she'd want)
      if (w.chores && w.chores.shiftDone) w.chores.shiftDone(sh.errand, { short: true });
      const [said] = (SHORT[ID] || SHORT.bakery)(S);
      if (w.rep.openness(who) >= 1 && root.Correction) await correct(said(left, true, up));
      else await P.converse(said(left, false, up), { shot: ['red', who] });
    }
    await out();
  }
  // (her correction, as she asked for it: on the bench where there is one; then her word after, and the other knows of it)
  async function correct(said, own) {
    const who = sh.out || sh.boss, [, std, after] = (SHORT[ID] || SHORT.bakery)(S), script = own || std;
    await P.converse(said, { shot: ['red', who] });
    const r = await root.Correction.run(P, Object.assign({ corrector: who, fade: on => w.fade(on), turns: [{ subject: 'red', script }] }));      // (where, in the room: js/corrlayout.js)
    if (P !== w.P) return;
    await P.converse(after(r), { shot: ['red', who] });
    w.rep.settle('naughty', 0.5); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
    if (root.Evening) root.Evening.record(w, { what: 'shift', by: who, informs: true });      // (she'll tell Red's mother herself: a reprieve at home)
  }
  // Done: the errand done (js/chores.js), her word for it, and what follows from it; then outside.
  // (up: the inn, Bess on her feet the once: said, and let go)
  async function finish(up) {
    if (w.chores && w.chores.shiftDone) w.chores.shiftDone(sh.errand);
    await P.converse((up && lines.endOnce ? lines.endOnce : []).concat(lines.end || []), { shot: ['red', sh.out || sh.boss] });
    if (svc && !up) w.rep.trusts('bess', 0.5);      // (an evening without her on her feet: Bess's thanks too)
    const more = root.InHand && P.npc ? await root.InHand.afterShift(P, w, ID) : false;      // (Mistress Pennock's trust; Mistress Abney taking her in hand: js/inhand.js)
    if (!more && ID === 'inn' && root.AbneyPromise && P.npc) await root.AbneyPromise.ask(P, w);      // (and, at the end of an afternoon at the inn, Mistress Abney's favour to ask)
    await out();
  }
  // (the verdict given: a fade, and she's out in the street again, her basket back in her hands)
  async function out() { if (P !== w.P) return; w.refresh(); await w.go('village', ID === 'inn' ? 'inn' : 'bakery'); }
  // A cup of tea, to carry.
  function cupProp() { const T = root.Toon, g = new THREE.Group(), c = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.8, 1.8, 10), T.mat('#e8e0d0')); c.position.y = 0.9; c.add(new THREE.Mesh(T.hullGeo(c.geometry, 0.05), T.INKM[0])); g.add(c);
    return { obj: g, name: 'Bess’s tea', grip: new V3(0, 1.6, 0), radius: 1.2, keep: true, style: 'hang' }; }
  return { actions };
}

// (the clock's rate while a shift's under way here, its boss away: js/world.js runs the day at it)
const rate = w => { const s = current(w, w.area); return s && s.until && !s.back ? SHIFTS[s.id].rate || SHIFT_RATE : null; };
const api = { begin, attach, current, tasksOf, leftOf, doneOf, stashed, rate, SHIFTS, SHIFT_RATE };
root.Work = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
