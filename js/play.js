// Red Lessons — Red Riding Hood about the cottage (play.html): walk or run her round the room (js/motion.js moves her), the camera following;
// open and shut the door and the chest, take things down, carry them and set them down, sit on a stool or the bed, lie down on it.
//
//   const p = Play.create(view, { prompt: el })      p.input.move / p.input.run (set by the page's keys and touch stick); p.use() does the action offered
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

function create(view, opts) {
  opts = opts || {};
  const st = Stage.create(view, { fov: 40 }), W = st.cottage.world, B = W.bounds;
  const look = (root.Looks && Looks.load ? Looks.load() : {}).red;
  const rig = Toon.make('red', look); st.scene.add(rig.root); st.cast(rig);
  const sc = rig.scaleW, R = 3.2 * sc;
  rig.root.position.set(-8, 0, 14); rig.root.rotation.y = Math.PI;

  // What's in her way: the walls, and the furniture (boxes and round things), as a circle of radius r pushed clear of each. The door, open, is a
  // board on its hinge.
  const doorAt = () => { const h = W.door.pivot.getWorldPosition(new V3()), a = W.door.pivot.getWorldQuaternion(new THREE.Quaternion()); return { h, dir: new V3(1, 0, 0).applyQuaternion(a) }; };
  function collide(p, r) {
    const q = p.clone();
    for (let k = 0; k < 2; k++) {
      for (const o of W.obstacles) {
        if (o.r != null) { const d = new V3(q.x - o.x, 0, q.z - o.z), l = d.length(), m = o.r + r; if (l < m) { if (l < 1e-4) d.set(1, 0, 0); else d.divideScalar(l); q.x = o.x + d.x * m; q.z = o.z + d.z * m; } continue; }
        const cx = clamp(q.x, o.x0, o.x1), cz = clamp(q.z, o.z0, o.z1), dx = q.x - cx, dz = q.z - cz, l = Math.hypot(dx, dz);
        if (l >= r) continue;
        if (l > 1e-4) { q.x = cx + dx / l * r; q.z = cz + dz / l * r; }
        else { const ex = [o.x0 - r - q.x, o.x1 + r - q.x], ez = [o.z0 - r - q.z, o.z1 + r - q.z], bx = Math.abs(ex[0]) < Math.abs(ex[1]) ? ex[0] : ex[1], bz = Math.abs(ez[0]) < Math.abs(ez[1]) ? ez[0] : ez[1]; if (Math.abs(bx) < Math.abs(bz)) q.x += bx; else q.z += bz; }
      }
      // The door leaf: a line from the hinge, 13 long.
      if (W.door.open > 0.15) { const { h, dir } = doorAt(), v = new V3(q.x - h.x, 0, q.z - h.z), t = clamp(v.dot(dir), 0, 13), c = h.clone().setY(0).addScaledVector(dir, t), d = new V3(q.x - c.x, 0, q.z - c.z), l = d.length(); if (l < r + 0.8 && l > 1e-4) { d.multiplyScalar((r + 0.8) / l); q.x = c.x + d.x; q.z = c.z + d.z; } }
      q.x = clamp(q.x, B.x0 + r - 2.4, B.x1 - r + 2.4); q.z = clamp(q.z, B.z0 + r - 2.4, B.z1 - r + 2.4);
    }
    return q;
  }
  const m = Motion.create(rig, { collide });

  // ── The camera: behind and above her, following; drag to look round her, the wheel to come in or go out.
  const chest = () => m.pos.clone().setY(rig.root.position.y + (m.lieW > 0.5 ? 2 : 20 * sc));
  const camT = chest();
  st.controls.minDistance = 14; st.controls.maxDistance = 120; st.controls.enablePan = false;
  st.go(camT.clone().add(new V3(0, 16, 42)), camT);

  // ── Things to do: whatever's nearest in front of her, of the things she could do from where she is.
  const input = { move: { x: 0, z: 0 }, run: false };
  let doing = null, sitting = null, lying = false;
  const wp = o => o.getWorldPosition(new V3());
  const flat = v => v.clone().setY(0);
  const fwd = () => new V3(Math.sin(m.yaw), 0, Math.cos(m.yaw));
  const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
  // A place on the floor to stand to reach p, `off` in front of it along n (its way into the room), and the way to face.
  const standFor = (p, n, off) => { const s = flat(p).addScaledVector(n, off); return { at: collide(s, R), yaw: Math.atan2(-n.x, -n.z) }; };
  const surfaceFree = (s, at, rad) => !W.items.some(it => it !== m.carry && !it.peg && Math.abs(it.obj.position.y - s.y) < 0.5 && flat(it.obj.position).distanceTo(flat(at)) < (it.radius + rad + 0.4));
  function options() {
    const out = [], me = flat(m.pos), f = fwd();
    const add = (o, p) => { const d = flat(p).distanceTo(me); if (d > 24 * sc + 8) return; const ahead = flat(p).sub(me).normalize().dot(f); o.score = d - ahead * 6; out.push(o); };
    if (lying) return [{ label: 'Get up', run: getUp, score: 0 }];
    if (sitting) return [{ label: sitting.kind === 'bed' && !m.carry ? 'Lie down / Get up' : 'Get up', run: getUp, alt: sitting.kind === 'bed' && !m.carry ? lieDown : null, score: 0 }];
    // The door, and the chest.
    { const d = W.door, p = wp(d.latch); add({ label: (d.target ? 'Shut ' : 'Open ') + d.name, run: () => useDoor() }, p); }
    { const c = W.chest, p = c.front.clone(); if (!(m.carry && c.target === 0)) add({ label: (c.target ? 'Close ' : 'Open ') + c.name, run: () => useChest() }, p); }
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
      if (W.chest.open > 0.9) add({ label: 'Put ' + it.name + ' in the chest', run: () => putOn({ inChest: true }) }, W.chest.front);
      out.push({ label: 'Set ' + it.name + ' down', run: () => putOn({ floor: true }), score: 30 });
    }
    return out.sort((a, b) => a.score - b.score);
  }
  const busy = () => !!doing || !!m.auto;
  // Run one action: nothing else starts until it's done; moving off isn't possible while she's about it (the keys wait).
  function act(fn) { if (doing) return; doing = Promise.resolve().then(fn).catch(e => console.error(e)).finally(() => { doing = null; }); }
  // Pauses in an action run on the scene's own clock (so they keep pace with her however fast the frames come).
  let clock = 0; const timers = [];
  const wait = s => new Promise(r => timers.push({ at: clock + s, r }));

  async function useDoor() {
    const d = W.door, latch = wp(d.latch), n = new V3(1, 0, 0);      // (the door is in the left wall: into the room is +x)
    const shut = d.target === 0, s = standFor(latch, n, shut ? 6 : 6);
    if (!shut) s.at.z -= 9;      // (to shut it she stands to the hinge side of the open leaf, and pulls it to)
    await m.goTo(s.at, shut ? s.yaw : yawTo(s.at, latch));
    m.lookAt(() => wp(d.latch)); await m.reach('R', () => wp(d.latch).add(new V3(0.6, 0, 0)));
    d.target = shut ? 1 : 0; await wait(0.55); await m.release('R'); m.lookAt(null);
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

  let offer = [];
  function use(alt) { if (busy()) return; const o = offer[0]; if (!o) return; act(alt && o.alt ? o.alt : o.run); }

  // ── Each frame.
  const prevT = camT.clone();
  function frame(dt) {
    clock += dt; for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= clock) { timers[i].r(); timers.splice(i, 1); }
    // Keys move her relative to the camera.
    const cf = flat(st.controls.target.clone().sub(st.camera.position)).normalize(), cr = new V3(-cf.z, 0, cf.x);
    const mv = busy() ? { x: 0, z: 0 } : { x: cf.x * input.move.z + cr.x * input.move.x, z: cf.z * input.move.z + cr.z * input.move.x };
    m.update(dt, { move: mv, run: input.run }); rig.tick(dt);
    // The camera keeps its place relative to her, easing after her.
    const want = chest(); camT.lerp(want, 1 - Math.exp(-dt * 6)); const d = camT.clone().sub(prevT); prevT.copy(camT);
    st.controls.target.add(d); st.camera.position.add(d);
    offer = busy() ? [] : options();
    if (opts.prompt) { const o = offer[0]; const txt = doing ? '' : o ? (o.alt ? 'E  Get up   ·   Q  Lie down' : 'E  ' + o.label) : ''; if (opts.prompt.textContent !== txt) opts.prompt.textContent = txt; opts.prompt.classList.toggle('on', !!txt); }
  }
  st.start(frame);
  return { stage: st, rig, motion: m, input, use, frame, world: W, options: () => offer, get busy() { return busy(); }, act, take, putOn, sitOn, lieDown, getUp, useDoor, useChest };
}

root.Play = { create };
})(typeof window !== 'undefined' ? window : globalThis);
