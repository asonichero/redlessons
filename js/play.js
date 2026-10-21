// Little Red’s Lessons — Rose about the cottage (play.html): walk or run her round the room (js/motion.js moves her), the camera following;
// open and shut the door and the chest, take things down, carry them and set them down, sit on a stool or the bed, lie down on it.
//
//   const p = Play.create(view, { prompt: el })      p.input.move / p.input.run (set by the page's keys and touch stick); p.use() does the action offered
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

function create(view, opts) {
  opts = opts || {};
  // (opts.set: the set to play in, scene → set (js/cottage.js by default, js/cabin.js, js/wood.js); opts.start: { at: [x, z], yaw }; opts.light: the
  // time of day, 0..1; opts.npc: who else is there, { id, key, name, at, yaw, voice, tint, bg } (her mother at home by default, or none: null);
  // opts.talk: the conversation offered with them (a function giving a script); opts.onExit(exit): she's walked into one of the set's exits)
  const st = Stage.create(view, { fov: 40, set: opts.set }), W = st.cottage.world, B = W.bounds;
  W.obstacles = W.obstacles || []; W.items = W.items || []; W.seats = W.seats || []; W.surfaces = W.surfaces || []; W.pegs = W.pegs || []; W.exits = W.exits || [];
  st.setLight(opts.light || 0);
  let look = (root.Looks && Looks.load ? Looks.load() : {}).red;
  let rig = Toon.make('red', look); st.scene.add(rig.root); st.cast(rig);
  const sc = rig.scaleW, R = 3.2 * sc, start = opts.start || { at: [4, 2], yaw: Math.PI };
  rig.root.position.set(start.at[0], 0, start.at[1]); rig.root.rotation.y = start.yaw;
  let dress = { skirt: 'down' };

  // What's in her way: the walls, and the furniture (boxes and round things), as a circle of radius r pushed clear of each. The door, open, is a
  // board on its hinge.
  const doorAt = () => { const h = W.door.pivot.getWorldPosition(new V3()), a = W.door.pivot.getWorldQuaternion(new THREE.Quaternion()); return { h, dir: new V3(1, 0, 0).applyQuaternion(a) }; };
  // (who: 'npc' when it's the other one moving, so she isn't kept out of her own place)
  function collide(p, r, who) {
    const q = p.clone();
    for (let k = 0; k < 2; k++) {
      for (const o of W.obstacles) {
        if ((o.npc && who === 'npc') || (o.rose && who !== 'npc')) continue;
        if (o.r != null) { const d = new V3(q.x - o.x, 0, q.z - o.z), l = d.length(), m = o.r + r; if (l < m) { if (l < 1e-4) d.set(1, 0, 0); else d.divideScalar(l); q.x = o.x + d.x * m; q.z = o.z + d.z * m; } continue; }
        const cx = clamp(q.x, o.x0, o.x1), cz = clamp(q.z, o.z0, o.z1), dx = q.x - cx, dz = q.z - cz, l = Math.hypot(dx, dz);
        if (l >= r) continue;
        if (l > 1e-4) { q.x = cx + dx / l * r; q.z = cz + dz / l * r; }
        else { const ex = [o.x0 - r - q.x, o.x1 + r - q.x], ez = [o.z0 - r - q.z, o.z1 + r - q.z], bx = Math.abs(ex[0]) < Math.abs(ex[1]) ? ex[0] : ex[1], bz = Math.abs(ez[0]) < Math.abs(ez[1]) ? ez[0] : ez[1]; if (Math.abs(bx) < Math.abs(bz)) q.x += bx; else q.z += bz; }
      }
      // The door leaf: a line from the hinge, 13 long.
      if (W.door && W.door.open > 0.15) { const { h, dir } = doorAt(), v = new V3(q.x - h.x, 0, q.z - h.z), t = clamp(v.dot(dir), 0, 13), c = h.clone().setY(0).addScaledVector(dir, t), d = new V3(q.x - c.x, 0, q.z - c.z), l = d.length(); if (l < r + 0.8 && l > 1e-4) { d.multiplyScalar((r + 0.8) / l); q.x = c.x + d.x; q.z = c.z + d.z; } }
      if (W.constrain) q.copy(W.constrain(q, r));      // (a set's own limits: the path through the wood)
      if (B) { q.x = clamp(q.x, B.x0 + r - 2.4, B.x1 - r + 2.4); q.z = clamp(q.z, B.z0 + r - 2.4, B.z1 - r + 2.4); }
    }
    return q;
  }
  let m = Motion.create(rig, { collide });

  // ── Whoever else is there (her mother at home, by the hearth, unless the page says otherwise): in Rose's way like the furniture, and someone to
  // talk to. (Their own collisions are only the set's.)
  const NPC = opts.npc === undefined ? { id: 'gerda', key: 'mother', name: 'Mother', at: [-12, 20], yaw: Math.PI, voice: 'gerda', tint: '#6a3a4a', bg: '#e6d8e6' } : opts.npc;
  let mom = null, mm = null;
  if (NPC) {
    const looks = root.Looks && Looks.load ? Looks.load() : {};
    mom = Toon.make(NPC.id, looks[NPC.id] || {}); st.scene.add(mom.root); st.cast(mom);
    mom.root.position.set(NPC.at[0], 0, NPC.at[1]); mom.root.rotation.y = NPC.yaw;
    mm = Motion.create(mom, { collide: (p, r) => collide(p, r, 'npc') });      // (kept out of the furniture, and the walls, as Rose is; and out of Rose)
    W.obstacles.push({ get x() { return m.pos.x; }, get z() { return m.pos.z; }, r: 3.4, rose: true });
    W.obstacles.push({ get x() { return mm.pos.x; }, get z() { return mm.pos.z; }, r: 3.6, npc: true });
  }
  // ── Conversations (js/talk.js, js/story.js): Rose on the left, whoever she's with on the right.
  const castOf = () => { const c = { red: { rig, name: 'Red', side: 'left', voice: 'red', tint: '#9a1a26', bg: '#f1d9cf' } }; if (NPC) c[NPC.key] = { rig: mom, name: NPC.name, side: 'right', voice: NPC.voice, tint: NPC.tint, bg: NPC.bg }; return c; };
  const talk = root.Talk ? Talk.create(st, { cast: castOf(), turn: (who, yaw) => (who === 'red' ? m : mm).face(yaw), look: (who, at) => (who === 'red' ? m : mm).lookAt(at) }) : null;

  // ── The camera: behind and above her, following; drag to look round her, the wheel to come in or go out.
  const chest = () => m.pos.clone().setY(rig.root.position.y + (m.lieW > 0.5 ? 2 : 20 * sc));
  const camT = chest();
  st.controls.minDistance = 14; st.controls.maxDistance = 120; st.controls.enablePan = false;
  st.controls.maxPolarAngle = 1.5;      // (in the game the camera stays above the floor: no going round under it)
  const camBack = opts.camBack || (opts.followCam ? [34, 8] : [42, 16]);      // (in the open, lower and nearer, under the trees)
  const az = start.yaw + Math.PI + (opts.camTurn || 0);      // (behind her as she starts, or turned round from there by opts.camTurn)
  st.go(camT.clone().add(new V3(Math.sin(az) * camBack[0], camBack[1], Math.cos(az) * camBack[0])), camT);

  // ── Things to do: whatever's nearest in front of her, of the things she could do from where she is.
  const input = { move: { x: 0, z: 0 }, run: false };
  let doing = null, sitting = null, lying = false;
  const wp = o => o.getWorldPosition(new V3());
  const flat = v => v.clone().setY(0);
  const sideOf = y => new V3(Math.cos(y), 0, -Math.sin(y)), angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const fwd = () => new V3(Math.sin(m.yaw), 0, Math.cos(m.yaw));
  const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
  // A place on the floor to stand to reach p, `off` in front of it along n (its way into the room), and the way to face.
  const standFor = (p, n, off) => { const s = flat(p).addScaledVector(n, off); return { at: collide(s, R), yaw: Math.atan2(-n.x, -n.z) }; };
  const surfaceFree = (s, at, rad) => !W.items.some(it => it !== m.carry && !it.peg && Math.abs(it.obj.position.y - s.y) < 0.5 && flat(it.obj.position).distanceTo(flat(at)) < (it.radius + rad + 0.4));
  function options() {
    const out = [], me = flat(m.pos), f = fwd();
    const add = (o, p) => { const d = flat(p).distanceTo(me); if (d > 24 * sc + 8) return; const ahead = flat(p).sub(me).normalize().dot(f); o.score = d - ahead * 6; out.push(o); };
    if (lying) return [{ label: 'Get up', run: getUp, score: 0 }];
    if (talk && mm && !sitting && opts.talk !== null) add({ label: 'Talk to ' + NPC.name, run: () => talkToMother() }, mm.pos.clone().setY(18));
    if (sitting) return [{ label: 'Get up', run: getUp, alt: sitting.kind === 'bed' && !m.carry ? lieDown : null, altLabel: 'Lie down', score: 0 }];
    // The door, and the chest.
    // (a set's or a scene's own things to do: { label, at, run })
    for (const a of (W.actions || []).concat(opts.actions ? opts.actions() : [])) if (!a.when || a.when()) add({ label: a.label, run: a.run }, a.at);
    if (W.door) { const d = W.door, p = wp(d.latch); add({ label: (d.target ? 'Shut ' : 'Open ') + d.name, run: () => useDoor() }, p); }
    if (W.chest) { const c = W.chest, p = c.front.clone(); if (!(m.carry && c.target === 0)) add({ label: (c.target ? 'Close ' : 'Open ') + c.name, run: () => useChest() }, p); }
    if (!m.carry) {
      for (const it of W.items) { const p = it.obj.position.clone().add(it.grip); add({ label: 'Take ' + it.name, run: () => take(it) }, p); }
      for (const s of W.seats) add({ label: (s.kind === 'bed' ? 'Sit on ' : 'Sit on ') + s.name, run: () => sitOn(s) }, s.at);
    } else {
      const it = m.carry;
      if (it.hangs) for (const pg of W.pegs) if (!pg.item) add({ label: 'Hang ' + it.name + ' up', run: () => putOn({ peg: pg }) }, pg.at);
      for (const s of W.surfaces) if (!s.when || s.when()) {
        const c = new V3(clamp(me.x, s.x0, s.x1), s.y, clamp(me.z, s.z0, s.z1));
        if (surfaceFree(s, c, it.radius)) add({ label: 'Put ' + it.name + ' on ' + s.name, run: () => putOn({ surface: s, at: c }) }, c);
        else { for (let k = 1; k < 8; k++) { const t = c.clone(); t.x = clamp(c.x + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 3 * (s.front.x ? 0 : 1), s.x0, s.x1); t.z = clamp(c.z + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 3 * (s.front.z ? 0 : 1), s.z0, s.z1); if (surfaceFree(s, t, it.radius)) { add({ label: 'Put ' + it.name + ' on ' + s.name, run: () => putOn({ surface: s, at: t }) }, t); break; } } }
      }
      if (W.chest && W.chest.open > 0.9) add({ label: 'Put ' + it.name + ' in the chest', run: () => putOn({ inChest: true }) }, W.chest.front);
      out.push({ label: 'Set ' + it.name + ' down', run: () => putOn({ floor: true }), score: 30 });
    }
    return out.sort((a, b) => a.score - b.score);
  }
  const busy = () => !!doing || !!m.auto || !!(talk && talk.playing);
  // Run one action: nothing else starts until it's done; moving off isn't possible while she's about it (the keys wait).
  function act(fn) { if (doing) return; doing = Promise.resolve().then(fn).catch(e => console.error(e)).finally(() => { doing = null; }); }
  // Pauses in an action run on the scene's own clock (so they keep pace with her however fast the frames come).
  let clock = 0; const timers = [];
  const wait = s => new Promise(r => timers.push({ at: clock + s, r }));

  // The door (in the left wall: into the room is +x; it swings in on its hinge at the far end from the latch, toward the hinge side). Opening it,
  // she takes the latch in the hand on the side it will swing to (from inside, facing it, her left), pulls, and her hand goes with it until
  // it's out of reach, then the door swings on. Shutting it, she uses whichever hand is nearer the latch as she comes to it: facing the doorway,
  // her left; with her back to it, her right, behind her.
  async function useDoor() {
    const d = W.door, latch = wp(d.latch), n = d.inward ? d.inward.clone() : new V3(1, 0, 0), hinge = wp(d.pivot), opening = d.target === 0;      // (n: into the room)
    const toHinge = flat(hinge).sub(flat(latch)).normalize();
    // (the hand on the hinge side, as she faces the doorway from inside)
    const hingeHand = sideOf(Math.atan2(-n.x, -n.z)).dot(toHinge) > 0 ? 'L' : 'R', other = hingeHand === 'L' ? 'R' : 'L';
    let side;
    if (opening) {
      const s = { at: collide(flat(latch).addScaledVector(n, 6).addScaledVector(toHinge, -2.5), R), yaw: Math.atan2(-n.x, -n.z) };
      await m.goTo(s.at, yawTo(s.at, latch));
      side = sideOf(m.yaw).dot(toHinge) > 0 ? 'L' : 'R';
    } else {
      // (she goes to stand just past the end of the open leaf, clear of its swing, on the room side, coming at it however she comes, and turns
      // only as far as she must)
      const leaf = flat(latch).sub(flat(hinge)).normalize(), shut = new V3(1, 0, 0).applyQuaternion(d.pivot.parent.getWorldQuaternion(new THREE.Quaternion())).setY(0).normalize();
      let room = new V3(leaf.z, 0, -leaf.x); if (room.dot(shut) < 0) room.negate();      // (room: square off the leaf, on the side it shuts through)
      const at = collide(flat(hinge).addScaledVector(leaf, 14).addScaledVector(room, 2.8), R);
      await m.goTo(at, null);
      const to = flat(latch).sub(flat(m.pos)).normalize(), ahead = fwd().dot(to);
      if (ahead > -0.3) await m.goTo(m.pos, m.yaw + angDiff(m.yaw, yawTo(m.pos, latch)) * 0.75);
      side = fwd().dot(n) < 0 ? hingeHand : other;      // (facing the doorway, the hand on the hinge side is the near one; with her back to it, the other)
    }
    const reach = () => m.armReach(side);
    m.lookAt(() => wp(d.latch)); await m.reach(side, () => wp(d.latch).add(new V3(0.6, 0, 0)));
    d.target = opening ? 1 : 0;
    // (her hand stays on the latch as the door moves, until the latch is past where she can follow, or it's there)
    for (let k = 0; k < 40; k++) { await wait(0.04); if (Math.abs(d.open - d.target) < 0.05 || wp(d.latch).distanceTo(m.shoulder(side)) > reach() * 0.98) break; }
    await m.release(side); m.lookAt(null);
  }
  async function useChest() {
    const c = W.chest, s = standFor(c.front, new V3(0, 0, 1), 5.5);
    await m.goTo(s.at, s.yaw);
    m.lookAt(() => wp(c.grip)); await m.reach('R', () => wp(c.grip).add(new V3(0, 0.4, 0.4))); m.reach('L', () => wp(c.grip).add(new V3(2.4, 0.4, 0.4)));
    c.target = c.target ? 0 : 1; await wait(0.7); m.release('L'); await m.release('R'); m.lookAt(null);
  }
  // Where to stand for a thing on a peg or a surface: in front of it, out from the wall or the table's edge.
  function approachFor(p) {
    let n = new V3(0, 0, 1);
    for (const s of W.surfaces) if (p.x >= s.x0 - 3 && p.x <= s.x1 + 3 && p.z >= s.z0 - 3 && p.z <= s.z1 + 3) { n = s.front.clone(); return standFor(s.front.x ? new V3(s.front.x < 0 ? s.x0 : s.x1, 0, p.z) : new V3(p.x, 0, s.front.z > 0 ? s.z1 : s.z0), n, 7); }
    if (p.z < B.z0 + 8) return standFor(p, n, 7.5);      // (on the back wall's pegs)
    return standFor(p, flat(m.pos).sub(flat(p)).normalize(), 6);
  }
  async function take(it) {
    const p = it.obj.position.clone().add(it.grip), s = approachFor(p);
    await m.goTo(s.at, yawTo(s.at, p));
    m.lookAt(p); const two = !it.hangs && it.radius > 2.6;
    if (two) { m.reach('L', p.clone().add(new V3(Math.cos(m.yaw) * it.radius * 0.8, 0, -Math.sin(m.yaw) * it.radius * 0.8))); await m.reach('R', p.clone().add(new V3(-Math.cos(m.yaw) * it.radius * 0.8, 0, Math.sin(m.yaw) * it.radius * 0.8))); }
    else await m.reach('R', p);
    if (it.peg) { it.peg.item = null; it.peg = null; }
    it.panel = null; it.inChest = false; m.hold(it, it.hangs || !two ? 'hang' : 'front'); it.spin = it.obj.rotation.y - m.yaw;
    m.release('L'); await m.release('R'); m.lookAt(null);
  }
  async function putOn(where) {
    const it = m.carry; let p, s;
    if (where.peg) { p = where.peg.at.clone(); s = standFor(p, new V3(0, 0, 1), 7.5); }
    else if (where.surface) { p = where.at.clone(); s = approachFor(p); }
    else if (where.inChest) { const c = W.chest; p = new V3(c.front.x + (W.items.filter(x => x.inChest).length % 3 - 1) * 5, 8.6, c.front.z - 4.5); s = standFor(c.front, new V3(0, 0, 1), 7.5); }
    else {
      // On the floor in front of her, or, if that's in the way of something, to one side (she turns to it).
      for (const da of [0, 0.8, -0.8, 1.6, -1.6, 2.4, -2.4, Math.PI]) { const a = m.yaw + da, q = flat(m.pos).add(new V3(Math.sin(a), 0, Math.cos(a)).multiplyScalar(6.5)), c = collide(q, it.radius + 0.5); p = c; if (c.distanceTo(q) < 0.3) break; }
      s = { at: m.pos.clone() };
    }
    await m.goTo(s.at, yawTo(s.at, p));
    const base = where.peg ? p.clone().sub(it.grip) : p.clone();      // (where the thing's base goes)
    const hand = base.clone().add(it.grip);
    m.lookAt(hand);
    const two = m.carryStyle === 'front';
    if (two) { m.reach('L', hand.clone().add(new V3(Math.cos(m.yaw) * it.radius * 0.8, 0, -Math.sin(m.yaw) * it.radius * 0.8))); await m.reach('R', hand.clone().add(new V3(-Math.cos(m.yaw) * it.radius * 0.8, 0, Math.sin(m.yaw) * it.radius * 0.8))); }
    else await m.reach('R', hand);
    m.drop(); it.obj.position.copy(base); it.obj.quaternion.setFromAxisAngle(new V3(0, 1, 0), m.yaw + (it.spin || 0));
    it.panel = where.peg ? where.peg.panel : where.surface ? where.surface.panel : where.inChest ? W.chest.pivot.parent : null; it.inChest = !!where.inChest;
    if (where.peg) { where.peg.item = it; it.peg = where.peg; }
    m.release('L'); await m.release('R'); m.lookAt(null);
  }
  async function sitOn(seat) {
    // Up to the seat, turn her back to it, and sit.
    const f = new V3(Math.sin(seat.facing), 0, Math.cos(seat.facing)), front = collide(flat(seat.at).addScaledVector(f, 4.5 * sc + 2), R * 0.5);
    await m.goTo(front, seat.facing); await m.sit(seat); sitting = seat;
  }
  async function lieDown() { await m.lie(sitting); lying = true; }
  async function getUp() { await m.stand(); sitting = null; lying = false; }

  // Talking to her mother: Rose goes to stand before her, a little apart, and they turn to each other; the camera settles on the two of them and
  // the conversation plays. At its end she's to come to her mother: the page is told (opts.after), and can go on to the lap scene.
  async function talkToMother() {
    if (opts.talk) { await approach(); talk.cast.red.rig = rig; const picks = await talk.play(opts.talk()); if (opts.after) await opts.after('talk', picks); return; }
    // (she came home in her grandmother's cloak)
    if (look.outfit === 'No cloak') setOutfit('Hood down', true);
    await approach();
    talk.cast.red.rig = rig;
    const picks = await talk.play(Story.homecoming());
    setOutfit('No cloak', true);      // (cloak off, over the back of the chair, as she's told)
    if (opts.after) await opts.after('homecoming', picks);      // (and whatever comes of it, before she's free again)
  }
  // (Rose goes to stand before them, a little apart, and they turn to each other)
  async function approach(dist) {
    const away = flat(m.pos).sub(flat(mm.pos)); if (away.lengthSq() < 1) away.set(0, 0, -1); away.normalize();
    const at = collide(flat(mm.pos).addScaledVector(away, dist || 10), R);
    await m.goTo(at, yawTo(at, mm.pos));
    mm.face(yawTo(mm.pos, m.pos)); await wait(0.5);
  }
  // A conversation as a scene runs it, where they stand (or sit), the cast as they are now.
  async function converse(script, o) { talk.cast.red.rig = rig; return talk.play(script, o); }
  let offer = [];
  function use(alt) { if (busy()) return; const o = offer[0]; if (!o) return; act(alt && o.alt ? o.alt : o.run); }

  // ── Each frame.
  const prevT = camT.clone();
  // (anything else that runs with the scene, frame by frame, and stops when it's paused: P.tick(fn) → a function to take it off again)
  const tickers = [], tick = f => { tickers.push(f); return () => { const i = tickers.indexOf(f); if (i >= 0) tickers.splice(i, 1); }; };
  function frame(dt) {
    clock += dt; for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= clock) { timers[i].r(); timers.splice(i, 1); }
    // Keys move her relative to the camera.
    const cf = flat(st.controls.target.clone().sub(st.camera.position)).normalize(), cr = new V3(-cf.z, 0, cf.x);
    const mv = busy() ? { x: 0, z: 0 } : { x: cf.x * input.move.z + cr.x * input.move.x, z: cf.z * input.move.z + cr.z * input.move.x };
    m.update(dt, { move: mv, run: input.run }); rig.tick(dt); if (mm) { mm.update(dt, null); mom.tick(dt); }
    // Exits: walking into one tells the page (once).
    if (opts.onExit && !exited) for (const e of W.exits) if ((!e.when || e.when()) && flat(m.pos).distanceTo(flat(e.at)) < e.r) { exited = e; opts.onExit(e); break; }
    if (st.cottage.follow) st.cottage.follow(m.pos, dt);
    if (opts.onFrame) opts.onFrame(dt);
    for (const f of tickers.slice()) f(dt);
    // (in the open, the camera swings round behind her as she walks, slowly, so the way ahead stays in view)
    if (opts.followCam && m.speed > 2 && !busy()) { const off = st.camera.position.clone().sub(st.controls.target), az = Math.atan2(off.x, off.z), want = m.yaw + Math.PI, da = Math.atan2(Math.sin(want - az), Math.cos(want - az)), k = Math.min(1, dt * 0.9);
      // (and comes in to its usual distance and height behind her, from a wider opening view)
      const want0 = opts.followCam === true ? [34, 8] : opts.followCam, r0 = Math.hypot(off.x, off.z), kz = Math.min(1, dt * 0.8), r = r0 + (want0[0] - r0) * kz, na = az + da * k;
      off.x = Math.sin(na) * r; off.z = Math.cos(na) * r; off.y += (want0[1] - off.y) * kz; st.camera.position.copy(st.controls.target).add(off); }
    // The camera keeps its place relative to her, easing after her.
    const want = chest(); camT.lerp(want, 1 - Math.exp(-dt * 6)); const d = camT.clone().sub(prevT); prevT.copy(camT);
    st.controls.target.add(d); st.camera.position.add(d);
    if (st.camera.position.y < 3) st.camera.position.y = 3;
    offer = busy() ? [] : options();
    if (opts.prompt) { const o = offer[0]; const txt = doing ? '' : o ? (o.alt ? 'E  ' + o.label + '   ·   Q  ' + o.altLabel : 'E  ' + o.label) : ''; if (opts.prompt.textContent !== txt) opts.prompt.textContent = txt; opts.prompt.classList.toggle('on', !!txt); }
  }
  st.start(frame);
  // What she wears: the skirt (on, lifted or off), and her outfit (her cloak, with the hood down or up, or none). The outfit is part of how she's
  // built, so changing it builds her again where she stands, carrying whatever she was carrying; it's kept with her looks, for every page.
  function setDress(d) { dress = Object.assign({}, dress, d); rig.setDress(dress); }
  function setOutfit(outfit, force) {
    if ((doing && !force) || !root.Looks) return;
    const all = Looks.load(); all.red.outfit = outfit; look = Looks.save(all).red;
    if (sitting || lying) { sitting = null; lying = false; }
    const at = m.pos.clone(), yaw = m.yaw, carry = m.carry, style = m.carryStyle;
    st.scene.remove(rig.root);
    rig = Toon.make('red', look); st.scene.add(rig.root); st.cast(rig); rig.root.position.copy(at); rig.root.rotation.y = yaw;
    m = Motion.create(rig, { collide }); if (carry) m.hold(carry, style);
    rig.setDress(dress); if (talk) talk.cast.red.rig = rig;
  }
  let exited = null;
  // Seated already, as a scene opens: Rose (who 'red') or the other, on a seat, there and then.
  function seatNow(seat, who) { const mo = who === 'npc' ? mm : m; mo.sit(seat); mo.sitW = 1; if (who !== 'npc') sitting = seat; }
  // Gone: the stage stopped and its canvas taken away, the conversation box with it.
  function dispose() { st.stop(); if (talk) talk.destroy(); }
  return { stage: st, mother: mom, npc: mom, get npcMotion() { return mm; }, talk, talkToMother, approach, converse, dispose, wait, collide, castOf, seatNow, get sitting() { return sitting; }, set sitting(v) { sitting = v; }, get rig() { return rig; }, get motion() { return m; }, get outfit() { return look.outfit; }, setDress, setOutfit, input, use, frame, tick, world: W, options: () => offer, get offer() { return offer[0] || null; }, get busy() { return busy(); }, act, take, putOn, sitOn, lieDown, getUp, useDoor, useChest };
}

root.Play = { create };
})(typeof window !== 'undefined' ? window : globalThis);
