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
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const SHIFT_RATE = 1;      // (game minutes a second, in a timed shift: a minute a second, slower than the day's, so there's time to do the work in it. A shift's own rate, where it has one, over this)

// The shifts: each task's place (in the set's world.work), its time, what she does there (kind), and the boss's word as she does it. Done in any
// order, each offered where it's done, as she comes near it (as the garden's are); after: not till that one's done.
const SHIFTS = {
  bakery: { area: 'bakery', boss: 'pennock', errand: 'bakery', away: 150, backAt: '15:30', tasks: [      // (the afternoon: the clearing down after the morning's baking, and the next day begun; away: the mill run; the head start the same list)
    { id: 'boards', what: 'the boards', label: 'Scrub down the boards', place: 'table', mins: 25, kind: 'shape' },
    { id: 'ash', what: 'the oven', label: 'Rake the ash out of the oven', place: 'oven', mins: 20, kind: 'oven', tool: 'peel' },      // (tool: the paddle in her hands to do it)
    { id: 'sift', what: 'tomorrow’s flour', label: 'Sift tomorrow’s flour', place: 'table', mins: 25, kind: 'shape' },
    { id: 'sponge', what: 'the sponge', label: 'Set the sponge for the morning', place: 'table', mins: 30, kind: 'knead' },
    { id: 'sweep', what: 'the floor', label: 'Sweep out', place: 'floor', mins: 30, kind: 'sweep', by: 'hand' },      // (by hand: done when the floor's clean (js/mess.js), not by a press)
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
    { id: 'bowls', what: 'the bowls and bread', label: 'Set out the bowls and bread', place: 'tableA', mins: 10, kind: 'shape', carriers: true },
    { id: 'service', what: 'the carrier’s men', label: 'See to the carrier’s men', place: 'tableA', mins: 0, kind: 'service', carriers: true },      // (their orders, as they call them: js/innshift.js)
    { id: 'after', what: 'their table', label: 'Clear after them', place: 'tableA', mins: 15, kind: 'shape', carriers: true, after: 'service' },
    { id: 'sweep', what: 'the floor', label: 'Sweep out', place: 'floor', mins: 20, kind: 'sweep', by: 'hand' },      // (by hand: done when the corners are swept, as Bess says)
  ] },
};

const stateOf = w => w.save.state.work || (w.save.state.work = { day: 0, id: null, step: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.work); }, { work: true });
// (a shift under way today, here)
const current = (w, area) => { const s = stateOf(w); return s.id && s.day === w.cal.day && !s.left && (!area || SHIFTS[s.id].area === area) ? s : null; };      // (left: walked out of before she was back; over, for the day)
function begin(w, id, o) { o = o || {}; change(w, s => { s.day = w.cal.day; s.id = id; s.step = 0; s.done = []; s.basket = null; s.short = !!o.short; s.mode = o.mode || null; s.until = o.until || 0; s.back = false; s.start = w.cal.minute; s.svc = null; s.mess = id === 'bakery' && root.Mess ? { patches: root.Mess.seed(w.cal.day), prints: [] } : {}; }); }      // (mess: the floor as she finds it, js/mess.js)
// (a shift's tasks, as this one is: asked for on the day, by her, the inn's afternoon is without the carrier's men; the bakery's head start,
// its own short list)
const tasksOf = s => SHIFTS[s.id].tasks.filter(t => !(s.short && t.carriers) && !(s.mode === 'picked' && SHIFTS[s.id].picked && !SHIFTS[s.id].picked.includes(t.id)));
// (what's done of it, and what's still to do: in any order; s.step kept as the count)
const doneOf = s => s.done || [];
const leftOf = s => tasksOf(s).filter(t => !doneOf(s).includes(t.id));
// (her basket, set aside as she comes in to work, and back in her hands as she goes: js/world.js asks for it on her way out)
function stashed(w) { const s = stateOf(w); if (!s.basket) return null; const b = s.basket; change(w, x => { x.basket = null; }); return b; }

// The broom, held in front of her, the head down at the floor ahead.
function broomProp() {
  const T = root.Toon, g = new THREE.Group(), oak = T.mat('#8a6a42'), straw = T.mat('#c8a860');
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 19, 6), oak); h.position.y = 13.5;      // (its head at the origin, the handle up its y: held as a pole, js/motion.js)
  h.add(new THREE.Mesh(T.hullGeo(h.geometry, 0.05), T.INKM[0])); g.add(h);
  const head = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5, 10, 1, true).scale(1, 1, 0.45), straw); head.material.side = THREE.DoubleSide; head.position.y = 2.5; g.add(head);
  return { obj: g, name: 'the broom', grip: new V3(0, 0, 0), radius: 2, keep: true, style: 'pole' };
}
// The peel (Mistress Pennock's paddle for the oven), and a board of loaves, to carry.
function peelProp() {
  const T = root.Toon, g = new THREE.Group(), oak = T.mat('#8a6a42'), add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, oak); m.position.set(x, y, z); m.add(new THREE.Mesh(T.hullGeo(geo, 0.05), T.INKM[0])); g.add(m); };
  add(new THREE.CylinderGeometry(0.3, 0.35, 17, 6), 0, 12, 0); add(new THREE.BoxGeometry(5, 6, 0.4), 0, 3, 0);      // (its blade at the origin, the handle up its y: held as a pole, js/motion.js)
  return { obj: g, name: 'the peel', grip: new V3(0, 0, 0), radius: 2, keep: true, style: 'pole' };
}

// A sack of flour from the stack: heavy, carried in front of her (a walk with it).
function sackProp() {
  const T = root.Toon, g = new THREE.Group(), m = new THREE.Mesh(T.ell(3, 3.4, 2.6, 10, 8), T.mat('#d8c8a0')); m.position.y = -1; m.add(new THREE.Mesh(T.hullGeo(m.geometry, 0.06), T.INKM[0])); g.add(m);
  return { obj: g, name: 'a sack of flour', grip: new V3(0, 2, 0), radius: 3, keep: true, heavy: true, style: 'front' };
}

// (what's said when the list's not done, or Bess was up: the corrector's words, the correction, and after)
const SHORT = { bakery: S => [S.pennockShort, S.pennockShortRed, S.pennockShortAfter], inn: S => [S.abneyShort, S.abneyShortRed, S.abneyShortAfter] };

function attach(P, w) {
  const st0 = current(w, w.area); if (!st0) return null;
  const ID = st0.id, S = root.Story, sh = SHIFTS[ID], W = P.world, spots = W.work || {}, m = P.motion, talk = P.talk;
  // (to a task's place: walked there, and if the way's not found in a few seconds, or she stops short, put there: never left a step away from it)
  const arrive = async (at, yaw, o) => { const to = at.clone().setY(0); await Promise.race([m.goTo(to, yaw, o), P.wait(7)]);
    if (Math.hypot(m.pos.x - to.x, m.pos.z - to.z) > 2.5) { m.auto = null; const p = P.collide(to, 3.2); m.warp(p, yaw == null ? m.yaw : yaw); P.rig.root.position.copy(p); } };
  let allDone = false, waited = false, toolsOut = [];
  const timed = !!st0.mode, mm = P.npcMotion, rig = P.npc, cur = () => current(w);
  let away = false, due = false, carrying = null, offers = 0, offerDue = false;
  const say = (text, face) => !(away && (sh.out || sh.boss) === sh.boss) && talk && talk.cast[sh.boss] && talk.caption(sh.boss, text, { face: face || 'calm', wait: s => P.wait(s) });      // (the boss gone out: not if it's the boss who's gone)
  // (the boss out of the place: off on the mill run, upstairs at the rooms, or still at her counter; and back in)
  const gone = () => { away = true; if (rig && rig.root) rig.root.visible = false; if (mm) mm.warp(new V3(0, 0, -900), 0); };
  const inAt = () => { const e = W.entries && W.entries.door; return e ? new V3(e.at[0], 0, e.at[1]) : new V3(-22, 0, 26); };
  const lines = (S.WORK && S.WORK[ID]) || {};
  const RCH = ID === 'bakery' ? 16 : 45;      // (how far off a thing to do is offered: the bakery's close together, so only from by it)
  // ── The floor (js/mess.js): at the bakery the flour as she finds it, the ash and dust she makes, the prints she walks about; at the inn, the
  // corners, where Mistress Abney looks. Swept by hand, the broom held and the act held down. (start: how much there was, to weigh what's left)
  const innCorners = () => { const b = W.bounds; if (!b) return []; const k = 8; return [[b.x0 + k, b.z0 + k], [b.x1 - k, b.z0 + k], [b.x0 + k, b.z1 - k], [b.x1 - k, b.z1 - k]].map(([x, z]) => P.collide(new V3(x, 0, z), 3)); };
  const mess = root.Mess && sh.tasks.some(t => t.by === 'hand') ? root.Mess.attach(P, w, { kind: ID, store: () => { const s = stateOf(w); return s.mess || (s.mess = {}); }, save: () => change(w, () => {}), corners: ID === 'inn' ? innCorners() : [] }) : null;
  if (mess && ID === 'bakery') { const ms = stateOf(w).mess; if (ms && ms.start == null) { ms.start = mess.dirt(); change(w, () => {}); } }
  // (swept: done when the floor's clean (the corners, at the inn), and not done again if it's dirtied after)
  P.tick(() => { const s = cur(); if (!mess || !s || s.back) return; const t = tasksOf(s).find(x => x.by === 'hand'); if (!t) return;
    const ok = ID === 'inn' ? mess.cornersDone() : mess.clean(), has = doneOf(s).includes(t.id);
    if (ok && !has) { markDone(t.id); if (talk) talk.muse(ID === 'inn' ? 'Every corner. Mistress Abney can look all she likes.' : 'Not a speck. Now to keep it so.', { face: 'smile' }); }
    else if (!ok && has && ID === 'bakery') change(w, x => { x.done = (x.done || []).filter(i => i !== t.id); x.step = x.done.length; }); });
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
    if (carrying) return carrying.id === 'tea' && spots.bess ? [{ label: 'Give Bess her tea', at: spots.bess.look.clone(), reach: RCH, run: () => giveTea() }] : [];
    const where = t => { const top = W.tableTops && W.tableTops[t.id]; return top ? new V3((top.x0 + top.x1) / 2, top.y, (top.z0 + top.z1) / 2) : (byBroom(t) ? spots.broom : spots[t.place] || spots.floor).look.clone(); };      // (a table: offered from any side of it)
    const tools = toolOffers(); if (tools) return tools;
    return open().filter(t => !t.by && !t.tool && !(ID === 'bakery' && t.id === 'sift')).map(t => ({ label: byBroom(t) ? 'Take up the broom' : t.label, at: where(t), reach: RCH, run: () => m.carry ? P.handsFull() : doTask(t) })).concat(starts());
  }
  // (in her hands: the broom (swept with, the act held; or put back where it leans), the paddle (the oven raked out with it; put back), a sack
  // of flour (poured into the bin))
  const holding = n => !!(m.carry && m.carry.name === n), near = (p, d) => !!p && Math.hypot(m.pos.x - p.x, m.pos.z - p.z) < (d || 14);
  function toolOffers() {
    if (holding('the broom')) return [{ label: 'Sweep', at: m.pos.clone().setY(3), reach: RCH, run: async () => {} }].concat(W.work.broom && near(W.work.broom.at, 12) ? [{ label: 'Put the broom back', pick: true, at: W.work.broom.look.clone(), reach: RCH, run: () => broom.put() }] : []);      // (Sweep: E held down, js/mess.js; putting it back, Q's)
    if (holding('the peel')) { const t = open().find(x => x.tool === 'peel'), out = []; if (t && spots.oven) out.push({ label: t.label, at: spots.oven.look.clone(), reach: RCH, run: () => rake(t) }); if (W.work.peel) out.push({ label: 'Put the paddle back', pick: true, at: W.work.peel.look.clone(), reach: RCH, run: () => peel.put() }); return out; }
    if (holding('a sack of flour')) return spots.bin ? [{ label: 'Pour the flour into the bin', at: spots.bin.look.clone(), reach: RCH, run: () => pour() }] : [];
    return null;
  }
  // (taken up: the broom, any time; the paddle, while the oven's to rake; a sack, while the flour's to sift, and the sifting once it's in the bin)
  function starts() {
    const out = [], s = cur(); if (!s) return out; const left = id => open().some(x => x.id === id);
    if (W.work.broom && tasksOf(s).some(x => x.by === 'hand')) out.push({ label: 'Take up the broom', pick: true, at: W.work.broom.look.clone(), reach: RCH, run: () => m.carry ? P.handsFull() : broom.take() });
    if (W.work.peel && left('ash') && ID === 'bakery') out.push({ label: 'Take up the paddle', pick: true, at: W.work.peel.look.clone(), reach: RCH, run: () => m.carry ? P.handsFull() : peel.take() });
    if (ID === 'bakery' && spots.counter && !s.back) out.push({ label: 'Look at the buns', at: spots.counter.look.clone(), reach: RCH, run: () => m.carry ? P.handsFull() : buns() });
    if (ID === 'bakery' && left('sift') && spots.bin) { if (s.poured) out.push({ label: 'Sift the flour', at: spots.bin.look.clone(), reach: RCH, run: () => m.carry ? P.handsFull() : sift() });
      else if (spots.sacks) out.push({ label: 'Take a sack of flour', pick: true, at: spots.sacks.look.clone(), reach: RCH, run: () => m.carry ? P.handsFull() : takeSack() }); }
    return out;
  }
  // (the oven raked out, the paddle in her hands: the ash, in front of the oven's mouth, where she'll walk through it if she isn't careful)
  async function rake(t) {
    const sp = spots.oven; await place(sp.at, sp.yaw); m.lookAt(sp.look); await tell(lines.ash);
    m.rakeAt = sp.look.clone().setY(10); await P.wait(3.2); m.rakeAt = null; m.lookAt(null);      // (the paddle into the oven's mouth, and the ash drawn out: js/motion.js)
    if (mess) { const f = new V3(Math.sin(sp.yaw), 0, Math.cos(sp.yaw)), sd = new V3(f.z, 0, -f.x);
      for (const [a, d, r] of [[-4, 5, 3.4], [3.5, 6, 3], [0, 2.5, 2.6]]) { const q = sp.at.clone().addScaledVector(f, d).addScaledVector(sd, a); mess.add('ash', q.x, q.z, r); } }
    if (w.capacity) w.capacity.add(-t.mins * 0.08, 'work'); markDone(t.id);
  }
  // (the flour: a sack from the stack, to the bin at the table's end, poured in (a puff of it on the floor), then sifted through (more))
  async function takeSack() { const sp = spots.sacks; await place(sp.at, sp.yaw); m.lookAt(sp.look); await reachAt(sp.look, 'R', 0.3); m.lookAt(null); const it = sackProp(); P.stage.scene.add(it.obj); m.hold(it, it.style); }
  const dust = (n, r) => { if (!mess || !spots.bin) return; const sp = spots.bin, f = new V3(Math.sin(sp.yaw), 0, Math.cos(sp.yaw)), sd = new V3(f.z, 0, -f.x);
    for (let k = 0; k < n; k++) { const q = sp.at.clone().addScaledVector(f, 1 + Math.random() * 3).addScaledVector(sd, (Math.random() - 0.5) * 9); mess.add('flour', q.x, q.z, r * (0.8 + Math.random() * 0.4)); } };
  async function pour() { const sp = spots.bin; await place(sp.at, sp.yaw); m.lookAt(sp.look); await tell(lines.sift); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); await reachAt(sp.look, 'R', 0.6); m.lookAt(null);
    change(w, x => { x.poured = true; }); dust(1, 2.6); w.refresh(); }
  async function sift() { const sp = spots.bin; await place(sp.at, sp.yaw); m.lookAt(sp.look);
    for (let k = 0; k < 5; k++) await reachAt(sp.look.clone().add(new V3(k % 2 ? 1 : -1, 0, 0)), k % 2 ? 'L' : 'R', 0.35);
    m.lookAt(null); dust(2, 2.8); if (w.capacity) w.capacity.add(-25 * 0.08, 'work'); markDone('sift'); }
  W.more = W.more || []; W.more.push(actions);
  // (the inn's evening: the carrier's men, served as they call, from when they come in)
  const svc = ID === 'inn' && !st0.short && root.InnShift ? root.InnShift.attach(P, w, { active: () => { const s = cur(); return !!s && !doneOf(s).includes('service') && !s.back; },
    done: () => { markDone('service'); } }) : null;
  if (svc) W.more.push(() => cur() ? svc.actions() : []);
  // (the door shut on her until it's over)
  const door = (W.exits || []).find(e => e.name === 'the door'); if (door) { const was = door.when; door.when = () => { const s = current(w); return !(s && s.mode !== 'picked') && (!was || was()); }; }      // (a head start picked up: hers to walk out of, and say so outside)
  w.refresh();
  // The start: the list given, and the boss away. (The bakery's head start: her list chalked up, and Mistress Pennock at the counter. The inn's
  // short afternoon: Mistress Abney upstairs, Bess's word for it.)
  const short = ID === 'inn' && st0.short;
  if (timed && st0.mode === 'picked') { gone(); if (!doneOf(st0).length) P.act(async () => { await P.wait(0.6); await P.converse(lines.picked || [], { shot: false, keepCamera: true }); }); }
  else if (timed && (st0.until || doneOf(st0).length)) gone();      // (back in, with her already gone)
  else P.act(async () => {
    await P.wait(0.6); await P.converse(short ? lines.short || [] : lines.list || [], { shot: ['red', sh.out || sh.boss] });
    change(w, s => { s.until = sh.backAt && !short && st0.mode === 'errand' ? Math.max(w.cal.minute + 30, H(sh.backAt)) : w.cal.minute + (short ? sh.shortAway : sh.away); });      // (backAt: the afternoon's, back at that hour however late Red began: less time, for a late start)
    if (mm) await Promise.race([mm.goTo(P.collide(short && spots.stair ? spots.stair.at : inAt(), 3), null), P.wait(5)]);
    gone(); w.refresh();
  });
  // (the shift's clock: a minute a second while she's in here, talk aside; and when it's run out, the boss back)
  P.tick(dt => {
    const s = cur(); if (!s || !s.until || s.back) return;
    if (P.busy && !(talk && talk.playing) && !document.body.classList.contains('correcting')) w.cal.tick(dt, sh.rate || SHIFT_RATE);      // (busy at a task, the day's own clock stands: this one runs on. Otherwise the day's runs, at the shift's rate: see rate)
    if (allDone && !waited && w.cal.minute < s.until && !P.busy) { waited = true; allDone = false; P.act(waitOut); }      // (all of it done before she's back: Red waits, by the oven, or sat with Bess; she's back at her hour, not before)
    if (w.cal.minute >= s.until) due = true;      // (her hour come)
    if (due && !P.busy) { due = false; allDone = false; P.act(back); }
  });
  // (the bakery, all of it done: sat on the bench by the oven, she's asked whether to wait there for Mistress Pennock; once each time she sits)
  let benchAsked = false;
  P.tick(() => { if (ID !== 'bakery') return; const s = cur(), sat = P.sitting && P.sitting.name === 'the bench'; if (!sat) { benchAsked = false; return; }
    if (benchAsked || !s || s.back || leftOf(s).length || P.busy || (talk && talk.playing)) return; benchAsked = true; P.act(ovenWait); });
  P.tick(() => { if (offerDue && !P.busy && !(talk && talk.playing) && cur() && !cur().back) { offerDue = false; P.act(sitWithBess); } });

  function markDone(id) {
    change(w, s => { s.done = (s.done || []).concat(id); s.step = s.done.length; });
    const s = cur(); if (s && !leftOf(s).length && s.until && !s.back) allDone = true;      // (all of it done before she's back: and then she is, at her hour (once this task's let go: see the tick))
    else { w.refresh(); if (ID === 'inn') maybeOffer(); }
  }
  // (at the inn: straight into it, where it's done, not walked over to from wherever she was; its word said to be read, once a shift)
  const jump = async (at, yaw) => { const p = P.collide(at.clone().setY(0), 3.2); m.auto = null; m.warp(p, yaw == null ? m.yaw : yaw); P.rig.root.position.copy(p); };
  const place = (at, yaw, o) => ID === 'inn' ? jump(at, yaw) : arrive(at, yaw, o);
  const once = new Set();
  const tell = async said => { if (!said) return; if (ID !== 'inn') { say(...said); return; } const k = said[0]; if (once.has(k)) return; once.add(k);
    if (talk && talk.cast[sh.boss]) await P.converse([{ who: sh.boss, face: said[1] || 'calm', listen: { red: 'calm' }, text: said[0] }], { shot: false, keepCamera: true }); };
  async function doTask(t) {
    const top = W.tableTops && W.tableTops[t.id];      // (a table at the inn: wiped from whichever side she's come to it, at the edge nearest her)
    if (top) { const q = new V3(Math.max(top.x0, Math.min(top.x1, m.pos.x)), 0, Math.max(top.z0, Math.min(top.z1, m.pos.z))), out = m.pos.clone().setY(0).sub(q); if (out.lengthSq() < 0.01) out.set(0, 0, 1); out.normalize();
      const at = P.collide(q.clone().addScaledVector(out, 6), 3.2); await place(at, Math.atan2(q.x - at.x, q.z - at.z)); q.y = top.y; const side = new V3(out.z, 0, -out.x);
      await tell(lines[t.line || t.id]);
      for (let k = 0; k < 3; k++) await reachAt(q.clone().addScaledVector(out, -1.5).addScaledVector(side, (k - 1) * 4), k % 2 ? 'L' : 'R', 0.6);
      if (w.capacity) w.capacity.add(-t.mins * 0.08, 'work'); markDone(t.id); return; }
    const sp = spots[t.place] || spots.floor; if (!byBroom(t) && t.kind !== 'tea') { await place(sp.at, sp.yaw); m.lookAt(sp.look); }
    if (t.kind !== 'tea') await tell(lines[t.line || t.id]);      // (Bess's tea: her word for it when it's brought her, not as it's poured)
    if (t.kind === 'tea') { await place(sp.at, sp.yaw); m.lookAt(sp.look); await reachAt(sp.look); const cup = cupProp(); P.stage.scene.add(cup.obj); m.hold(cup, 'hang'); m.lookAt(null); carrying = { id: 'tea', it: cup, t }; w.refresh(); return; }
    const MG = root.MiniGame, close = MG && ID === 'bakery' && (t.id === 'boards' || t.id === 'sponge');      // (done close to: js/minigame.js)
    if (close && t.id === 'boards') await MG.scrub(P, { at: sp.at, look: sp.look, yaw: sp.yaw });
    else if (close) { const r = await MG.knead(P, { at: sp.at, look: sp.look, yaw: sp.yaw }); change(w, x => { x.sponge = r.quality; }); if (r.quality < 0.5) w.save.flag('sponge-flat', w.cal.day + 1); }      // (kneaded out of time: flat bread in the morning, and she'll say)
    else await (KINDS[t.kind] || KINDS.reach)(sp, t);
    m.lookAt(null);
    if (w.capacity) w.capacity.add(-t.mins * 0.08, 'work');      // (a shift wears her down, task by task)
    markDone(t.id);
  }
  async function giveTea() {
    const c = carrying, sp = spots.bess; if (!c || !sp) return;
    await place(sp.at, sp.yaw); m.lookAt(sp.look); await m.reach('R', sp.look.clone()); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); await m.release('R'); m.lookAt(null);
    carrying = null; await tell(lines.tea);
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
    if (seat) { const to = Math.atan2(chair.at.x - seat.at.x, chair.at.z - seat.at.z), d = a => Math.abs(Math.atan2(Math.sin(a - to), Math.cos(a - to)));      // (astride the bench whichever way faces Bess: her back to the table, if that's the way)
      await P.sitOn(d(seat.facing) <= d(seat.facing + Math.PI) ? seat : Object.assign({}, seat, { facing: seat.facing + Math.PI })); }
    for (let k = 0; k < 2; k++) {
      const n = (w.save.state.bessTalk || {}).n || 0, beats = lines.bess || [], beat = beats[n] || (lines.bessAgain || [])[(n + k) % Math.max(1, (lines.bessAgain || []).length)] || [];
      await P.converse(beat, { shot: ['red', 'bess'] }); if (n < beats.length) w.save.change(x => { x.bessTalk = { n: n + 1 }; });
      if (!!(P.talk && P.talk.fresh)) w.rep.trusts('bess', 0.25); if (w.capacity) w.capacity.add(5, 'sitting with Bess'); w.cal.advance(10);
      if (k === 0) { let more = false; await P.converse(S.bessStay({ yes: () => { more = true; } }), { shot: ['red', 'bess'] }); if (!more) break; }
    }
    if (P.sitting) await P.getUp(); w.refresh();
  }
  const reachAt = async (p, side, hold) => { await m.reach(side || 'R', p); await P.wait(hold || 0.4); await m.release(side || 'R'); };
  const peel = { take: async () => { const p = W.work.peel; await arrive(p.at, p.yaw); await reachAt(p.look, 'R', 0.2); (W.peel || []).forEach(o => { o.visible = false; }); const it = peelProp(); P.stage.scene.add(it.obj); m.hold(it, it.style); },
    put: async () => { const p = W.work.peel; await arrive(p.at, p.yaw); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); (W.peel || []).forEach(o => { o.visible = true; }); } };
  // (the broom, from where it leans by the door, and back)
  const broom = { take: async () => { const b = W.work.broom; await place(b.at, b.yaw); await reachAt(b.look, 'R', 0.2); (W.broom || []).forEach(o => { o.visible = false; }); const it = broomProp(); P.stage.scene.add(it.obj); m.hold(it, it.style); if (mess) await tell(lines.sweep); },
    put: async () => { const b = W.work.broom; await arrive(b.at, b.yaw); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); await reachAt(b.look, 'R', 0.2); (W.broom || []).forEach(o => { o.visible = true; }); } };
  const KINDS = {
    knead: async sp => { for (let k = 0; k < 4; k++) { const p = sp.look.clone().add(new V3((k % 2 ? 1.5 : -1.5), 0, 0)); await Promise.all([m.reach('L', p.clone().add(new V3(-1.2, 0, 0))), m.reach('R', p)]); await P.wait(0.5); await Promise.all([m.release('L'), m.release('R')]); } },
    shape: async sp => { for (let k = 0; k < 3; k++) await reachAt(sp.look.clone().add(new V3((k - 1) * 4, 0, 1)), k % 2 ? 'L' : 'R', 0.6); },
    oven: async sp => { await peel.take(); await arrive(sp.at, sp.yaw); for (let k = 0; k < 2; k++) { await reachAt(sp.look.clone().add(new V3((k - 0.5) * 3, 0, 0)), 'R', 0.7); } await peel.put(); },
    sweep: async sp => { const c = sp.at, br = W.work.broom;
      if (br) { await broom.take(); m.stroke = true; for (const [dx, dz] of [[14, 0], [14, -10], [-14, -10], [-14, 0], [0, 4]]) await arrive(P.collide(c.clone().add(new V3(dx, 0, dz)), 3.2), null, { speed: 0.5 }); m.stroke = false; await broom.put(); return; }      // (stroke: swept as she goes)      // (with the broom, where there's one)
      for (const [dx, dz] of [[14, 0], [14, -10], [-14, -10], [-14, 0], [0, 4]]) { const to = P.collide(c.clone().add(new V3(dx, 0, dz)), 3.2); m.reach('R', () => m.pos.clone().add(new V3(Math.sin(m.yaw) * 5, 0.5, Math.cos(m.yaw) * 5))); await arrive(to, null, { speed: 0.5 }); } await m.release('R'); },
    reach: async sp => reachAt(sp.look),
  };
  // The boss back, at her hour (or as soon as it's all done, the time let go by): the list looked over, and what comes of it; then out of
  // the door, and she's outside again.
  // All done before she's back: the word for it, and Red waits (the clock running on as it does): by the oven where it's warm, at the bakery;
  // sat with Bess, at the inn, as she says to.
  async function waitOut() {
    if (ID === 'bakery') { await ovenWait(); return; }      // (the bakery: the oven, and waiting, hers to choose: js/story.js's ovenWait)
    await P.converse(lines.waiting || [], { shot: false, keepCamera: true });
    if (ID === 'bakery' && spots.oven && !P.sitting) { const o = spots.oven, d = new V3(o.at.x - o.look.x, 0, o.at.z - o.look.z); if (d.lengthSq() < 1) d.set(0, 0, 1); const at = P.collide(o.at.clone().setY(0).addScaledVector(d.normalize(), 4), 3.2); await arrive(at, Math.atan2(inAt().x - at.x, inAt().z - at.z)); }
    if (ID === 'inn' && !P.sitting && W.bessChair) { const chair = W.bessChair, seat = W.seats.filter(x => x.name === 'the bench').sort((a, b) => a.at.distanceTo(chair.at) - b.at.distanceTo(chair.at))[0];
      if (seat) { const to = Math.atan2(chair.at.x - seat.at.x, chair.at.z - seat.at.z), dd = a => Math.abs(Math.atan2(Math.sin(a - to), Math.cos(a - to))); await P.sitOn(dd(seat.facing) <= dd(seat.facing + Math.PI) ? seat : Object.assign({}, seat, { facing: seat.facing + Math.PI })); } }
  }
  async function back() {
    const s = cur(); if (!s || s.back) return; change(w, x => { x.back = true; });
    if (carrying) { const it = m.drop(); if (it) P.stage.scene.remove(it.obj); carrying = null; }
    toolsOut = [];      // (still in her hands as she comes in: not where it lives)
    if (m.carry && ['the broom', 'the peel', 'a sack of flour'].includes(m.carry.name)) { const it = m.drop(); P.stage.scene.remove(it.obj); toolsOut.push(it.name === 'the peel' ? 'the paddle' : it.name === 'a sack of flour' ? 'the sack' : it.name); (W.broom || []).concat(W.peel || []).forEach(o => { o.visible = true; }); }
    const list = tasksOf(s), n = list.length, k = doneOf(s).length, all = k >= n, left = leftOf(s).map(t => t.what || t.label.toLowerCase()), who = sh.out || sh.boss;
    const up = svc ? svc.up : 0; if (svc) svc.gone();      // (the inn: how many times Bess was on her feet; and the men up to their beds)
    // (the inn: under a fade, the two of them in the middle of the room, facing, and her word there; not walked down the stair into a corner)
    if (ID === 'inn' && mm && w.fade) { await w.fade(true); if (P.sitting) await P.getUp(); away = false; if (rig && rig.root) rig.root.visible = true;
      const c = (spots.floor && spots.floor.at) ? spots.floor.at.clone().setY(0) : new V3(0, 0, 0), red = P.collide(c.clone().add(new V3(0, 0, 6)), 3.2), her = P.collide(c.clone().add(new V3(0, 0, -7)), 3.2);
      m.auto = null; m.warp(red, Math.atan2(her.x - red.x, her.z - red.z)); P.rig.root.position.copy(red); mm.warp(her, Math.atan2(red.x - her.x, red.z - her.z));
      for (let i = 0; i < 20; i++) P.frame(1 / 60); await w.fade(false); }
    if (P.sitting) await P.getUp();
    away = false; if (rig && rig.root) rig.root.visible = true;
    if (mm && !(ID === 'inn' && w.fade)) { const at = short && spots.stair ? spots.stair.at : inAt(); mm.warp(at, Math.PI); const to = P.collide(m.pos.clone().setY(0).add(new V3(Math.sin(m.yaw) * 12, 0, Math.cos(m.yaw) * 12)), 3.2); await Promise.race([mm.goTo(to, Math.atan2(m.pos.x - to.x, m.pos.z - to.z)), P.wait(6)]); mm.face(Math.atan2(m.pos.x - mm.pos.x, m.pos.z - mm.pos.z)); await m.face(Math.atan2(mm.pos.x - m.pos.x, mm.pos.z - m.pos.z)); }
    change(w, x => { x.id = null; x.backAt = w.cal.minute; x.lastShift = ID; });      // (when she was back: Mistress Pennock home half an hour after, js/villagers.js)
    if (ID === 'bakery') { await verdict(s, k, n, left); return; }      // (left: worked out above, before the shift's put by)      // (the bakery: her look round, and the verdict on what she finds)
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
  // ── The bakery: Mistress Pennock's look round (the floor, against how she left it; the tools), her question (the bun owned, before she counts
  // the tray, or not), and her verdict: all of it well, and a bun (in her basket, or eaten there); some, and no harm done; little, or the floor
  // left worse, and what comes of that. Slow is no fault, so long as it's clean.
  async function verdict(s, k, n, left) {
    const ms = s.mess || {}, now = mess ? mess.dirt() : 0, start = ms.start || 0, picked = s.mode === 'picked';
    const f = { k, n, worse: now > start * 1.05 + 1, dirty: !!(mess && !mess.clean()), prints: (ms.prints || []).some(q => q.a > 0.15), tools: toolsOut, bun: (s.bun || 0) > 0 };
    let owned = false, corrected = false; const shot = { shot: ['red', 'pennock'] }, told = w.rep.openness('pennock') >= 1;
    await P.converse(S.pennockLooks(f), shot);
    await P.converse(S.pennockAsks(f, { own: () => { owned = true; } }), shot);
    const all = k >= n && !f.dirty && !f.tools.length, idle = k <= 1 || f.worse;
    // (the bun: owned up to, a reward made of it and less thanks for the rest; not, the tray counted, and naughty)
    const hidden = f.bun && !owned;
    if (f.bun && owned) { await P.converse(S.pennockOwned(all), shot); w.rep.trusts('pennock', -0.5); }
    else if (hidden) { await P.converse(S.pennockCounts(), shot); w.rep.add('naughty', 1, 'taking a bun from Mistress Pennock’s tray, and not saying'); }
    // (what's owed, all together: the bun hidden, the list hardly begun, the floor left worse. If she knows about Little Red, one correction for
    // the lot, the heavier the more of it (js/story.js's pennockBakeryRed); if not, the bun to Red's mother, the rest her word)
    const owe = { bun: hidden, short: k <= 1, worse: f.worse };
    if (idle && w.chores && w.chores.shiftDone && !picked) w.chores.shiftDone(sh.errand, { short: true });
    if ((owe.bun || owe.short || owe.worse) && told && root.Correction) {
      const [said] = SHORT.bakery(S), words = owe.bun ? S.pennockBunTake() : said(left, true, 0);
      await correct(words, S.pennockBakeryRed(owe));
    } else {
      if (hidden) w.save.flag('pennock-bun', w.cal.day);
      if (idle) { const [said] = SHORT.bakery(S); await P.converse(said(left, false, 0), shot); }
    }
    if (idle) {
    } else if (all) {
      if (picked) w.rep.trusts('pennock', 0.5); else if (w.chores && w.chores.shiftDone) w.chores.shiftDone(sh.errand);
      const reward = !f.bun ? (s.basket ? 'basket' : 'eat') : null;
      await P.converse(S.pennockGood(reward), shot);
      if (reward === 'basket') change(w, x => { if (x.basket) x.basket.contents = (x.basket.contents || []).concat('a bun'); });
      else if (reward === 'eat' && w.capacity) w.capacity.add(12, 'a bun');
      const more = !picked && root.InHand && P.npc ? await root.InHand.afterShift(P, w, ID) : false; void more;
    } else {
      if (w.chores && w.chores.shiftDone && !picked) w.chores.shiftDone(sh.errand, { short: true });
      await P.converse(S.pennockSome(), shot);
    }
    await out();
  }
  // (the buns on the counter: hers to argue over, and take one (eaten there: she's no basket to hand) or leave)
  async function buns() { const s = cur(); let took = false; await P.converse(S.bunsAsk(s.bun || 0, { take: () => { took = true; } }), { shot: false, keepCamera: true });
    if (!took) return; const sp = spots.counter; if (sp) { await place(sp.at, sp.yaw); await reachAt(sp.look, 'R', 0.3); }
    change(w, x => { x.bun = (x.bun || 0) + 1; }); if (w.capacity) w.capacity.add(12, 'a bun'); if (talk) talk.muse('Still warm. Oh, that’s better.', { face: 'smile' }); }
  // (all done: the oven, sat by, and the time let go till she's back; or not yet)
  async function ovenWait() { let yes = false; await P.converse(S.ovenWait({ sat: !!P.sitting, wait: () => { yes = true; } }), { shot: false, keepCamera: true }); if (!yes) return;
    if (!P.sitting) { const seat = (W.seats || []).find(x => x.name === 'the bench'); if (seat) await P.sitOn(seat); }      // (on the bench by the oven)
    const s = cur(); if (!s) return; await w.fade(true); w.cal.advance(Math.max(0, s.until - w.cal.minute)); await w.fade(false); }
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

// Out of the door of a head start before Mistress Pennock's back in (js/world.js: the village, each time she comes into it): her at the counter,
// and Red's sorry; no trust either way, and the clock stood while they talk. The shift's over for the day, its list gone from her objectives.
function outside(P, w) {
  const s = stateOf(w); if (s.id !== 'bakery' || s.mode !== 'picked' || s.day !== w.cal.day || !s.until || s.back || s.left) return;
  const done = doneOf(s).length; change(w, x => { x.left = true; x.until = null; }); w.refresh();
  P.act(async () => {
    const S = root.Story, V = P.villagers, f = V && (V.here('pennock') || (V.summon && V.summon('pennock', 'counter')));
    await P.wait(0.5); if (f && V.meetAt) await V.meetAt('pennock'); else if (f) { const m = P.motion, at = P.collide(f.motion.pos.clone().setY(0).add(new V3(0, 0, 12)), 3.2); await Promise.race([m.goTo(at, Math.atan2(f.motion.pos.x - at.x, f.motion.pos.z - at.z)), P.wait(4)]); f.motion.face(Math.atan2(m.pos.x - f.motion.pos.x, m.pos.z - f.motion.pos.z)); }
    await P.converse(S.shiftLeft(done, w.cal.minute), { shot: ['red', 'pennock'] });
    if (V && V.letGo) V.letGo('pennock'); w.refresh();
  });
}
// (the clock's rate while a shift's under way here, its boss away: js/world.js runs the day at it)
const rate = w => { const s = current(w, w.area); return s && s.until && !s.back ? SHIFTS[s.id].rate || SHIFT_RATE : null; };
const api = { stateOf, outside, begin, attach, current, tasksOf, leftOf, doneOf, stashed, rate, SHIFTS, SHIFT_RATE };
root.Work = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
