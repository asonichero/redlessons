// The third-person player controller, for any character built on the blocky rig and any world that gives it a list of solid boxes (see js/world.js).
//   WASD / arrows (or the touch stick) walk relative to the camera, the character turning to go where it points (it does not strafe). Shift runs, C or X toggles sneaking.
//   Space jumps, or, beside a solid marked `climb` and facing it, climbs it. Drag turns the camera, V or the wheel cycles three zoom levels. E is the action, Q picks up and puts down.
//   The camera is always centred on the character. On a touch screen TouchUI supplies the stick and the buttons.
// Use:  const P = Player.create(G, { rig, world, scale: 0.95, onAct(P), onTake(P), onTick(dt, P), onToast(text) });
//       P.start() begins play (input on, camera follows); P.stop() ends it (input off, touch controls away); P.st is the state { pos, y, heading, yaw, pitch, zoom, sneak, grounded, ... }.
//       P.touch.set('act', { label: 'Do', enabled: true }) relabels a touch button; P.place(x, z, heading) puts the character somewhere.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3, A = root.GameAudio;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const turn = (from, to, t) => { const d = ((to - from + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return from + d * t; };
const WALK = 26, CREEP = 7.5, RUN = 50, GRAV = 420, JUMP_V = 112, INF = 1e9, R = 5;                    // (units per second, units per second squared; R is the body's radius)
const ZOOMS = [{ name: 'Close', d: 52 }, { name: 'Medium', d: 92 }, { name: 'Far', d: 150 }];
const KM = { w: 'up', W: 'up', ArrowUp: 'up', s: 'down', S: 'down', ArrowDown: 'down', a: 'left', A: 'left', ArrowLeft: 'left', d: 'right', D: 'right', ArrowRight: 'right', Shift: 'run' };

function create(G, o) {
  const rig = o.rig, world = o.world, SC = o.scale || 0.95, solids = world.solids, B = world.bounds, surfaceAt = world.surfaceAt;
  const keys = {}, drags = new Map(), el = G.renderer.domElement, cam = { pos: new V3(), look: new V3(), fov: 48 };
  const st = { pos: new V3(world.spawn.x, 0, world.spawn.z), y: 0, vy: 0, grounded: true, climb: null, jumpReq: false, heading: world.spawn.heading || 0, yaw: (world.spawn.heading || 0) + Math.PI, pitch: 0.5, zoom: 1, sneak: false, speedN: 0, stride: 0, boost: 0, on: 'grass', active: false };
  const P = { st, rig, touch: null, keys, ZOOMS };
  const toast = t => o.onToast && o.onToast(t);
  const inBox = (b, x, z, m) => x > b.x0 - m && x < b.x1 + m && z > b.z0 - m && z < b.z1 + m;
  const blocked = (x, z, y) => { if (x < B.x0 || x > B.x1 || z < B.z0 || z > B.z1) return true; for (const b of solids) if (inBox(b, x, z, R) && (b.top >= INF || y < b.top - 2)) return true; return false; };
  const findClimb = () => solids.find(b => b.climb && st.y < b.top - 1 && inBox(b, st.pos.x, st.pos.z, 9) && Math.cos(st.heading) * ((b.z0 + b.z1) / 2 - st.pos.z) + Math.sin(st.heading) * ((b.x0 + b.x1) / 2 - st.pos.x) > 0);

  const camGoal = () => { const d = ZOOMS[st.zoom].d * SC / 0.95, p = st.pitch, at = cam.look.set(st.pos.x, st.y + 15 * SC, st.pos.z); return new V3(at.x + Math.sin(st.yaw) * Math.cos(p) * d, Math.max(3, at.y + Math.sin(p) * d), at.z + Math.cos(st.yaw) * Math.cos(p) * d); };
  const setZoom = dir => { st.zoom = (st.zoom + (dir === undefined ? 1 : dir) + ZOOMS.length) % ZOOMS.length; if (P.touch) P.touch.set('cam', { icon: 'camera', title: 'Camera: ' + ZOOMS[st.zoom].name }); };
  const setSneak = on => { st.sneak = on; if (P.touch) { P.touch.setSneak(on); if (on && P.touch.run) P.touch.setRun(false); } toast(on ? 'Sneaking: slow and quiet.' : 'Walking.'); };

  // Input.
  const typing = e => e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  const kd = e => {
    if (typing(e)) return; const k = KM[e.key]; if (k) { keys[k] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); }
    if (e.key === ' ') e.preventDefault(); if (e.repeat) return;
    if (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X') setSneak(!st.sneak);
    else if (e.key === 'e' || e.key === 'E') o.onAct && o.onAct(P);
    else if (e.key === 'q' || e.key === 'Q') o.onTake && o.onTake(P);
    else if (e.key === ' ') st.jumpReq = true;
    else if (e.key === 'v' || e.key === 'V') setZoom();
    else if (o.onKey) o.onKey(e.key, P);
  };
  const ku = e => { const k = KM[e.key]; if (k) keys[k] = false; };
  const pd = e => drags.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const pm = e => { const d = drags.get(e.pointerId); if (!d) return; st.yaw -= (e.clientX - d.x) * 0.006; st.pitch = clamp(st.pitch + (e.clientY - d.y) * 0.005, 0.08, 1.35); d.x = e.clientX; d.y = e.clientY; };
  const pu = e => drags.delete(e.pointerId);
  const wheel = e => { e.preventDefault(); setZoom(e.deltaY > 0 ? 1 : -1); };

  const tick = dt => {
    // WASD relative to the camera; the character turns into the direction and walks along its heading.
    const f = new V3(-Math.sin(st.yaw), 0, -Math.cos(st.yaw)), r = new V3(Math.cos(st.yaw), 0, -Math.sin(st.yaw)), stick = P.touch ? P.touch.stick : { x: 0, y: 0 };
    const dir = new V3().addScaledVector(f, (keys.up ? 1 : 0) - (keys.down ? 1 : 0)).addScaledVector(r, (keys.right ? 1 : 0) - (keys.left ? 1 : 0));
    if (Math.hypot(stick.x, stick.y) > 0.2) dir.addScaledVector(f, -stick.y).addScaledVector(r, stick.x);
    const vel = new V3(); if (st.climb) dir.set(0, 0, 0);
    if (dir.lengthSq() > 0) {
      dir.normalize(); const want = Math.atan2(dir.x, dir.z); st.heading = turn(st.heading, want, Math.min(1, dt * 9));
      const off = Math.abs(turn(st.heading, want, 1) - st.heading), ease = clamp(1 - off / Math.PI * 0.8, 0.2, 1), sp = keys.run ? RUN : st.sneak ? CREEP : WALK;
      vel.set(Math.sin(st.heading), 0, Math.cos(st.heading)).multiplyScalar(sp * SC * ease);
    }
    // Jump, or beside a climbable solid, climb it.
    st.boost = Math.max(0, st.boost - dt);
    if (st.jumpReq) {
      st.jumpReq = false;
      if (st.grounded && !st.climb) {
        const c = findClimb();
        if (c) st.climb = { t: 0, dur: 0.6, from: new V3(st.pos.x, st.y, st.pos.z), to: new V3(clamp(st.pos.x, c.x0 + 4, c.x1 - 4), c.top, clamp(st.pos.z, c.z0 + 4, c.z1 - 4)) };
        else { st.vy = JUMP_V; st.grounded = false; st.boost = 0.5; if (o.onJump) o.onJump(P); }
      }
    }
    if (st.climb) {
      const c = st.climb; c.t += dt; const k = clamp(c.t / c.dur, 0, 1); st.pos.x = lerp(c.from.x, c.to.x, k); st.pos.z = lerp(c.from.z, c.to.z, k);
      st.y = lerp(c.from.y, c.to.y, k) + Math.sin(k * Math.PI) * 5; if (k >= 1) { st.climb = null; st.y = c.to.y; st.vy = 0; st.grounded = true; }
    } else {
      const nx = st.pos.x + vel.x * dt, nz = st.pos.z + vel.z * dt; if (!blocked(nx, st.pos.z, st.y)) st.pos.x = nx; if (!blocked(st.pos.x, nz, st.y)) st.pos.z = nz;
      const was = st.grounded; st.vy -= GRAV * dt; st.y += st.vy * dt; const gnd = surfaceAt(st.pos.x, st.pos.z);
      if (st.y <= gnd.top) { st.y = gnd.top; st.vy = 0; st.grounded = true; st.on = gnd.kind; if (!was && A) A.step(gnd.kind === 'path' ? 'stone' : 'grass', 0.8); } else { st.grounded = false; }
      for (const b of solids) if (inBox(b, st.pos.x, st.pos.z, R) && (b.top >= INF || st.y < b.top - 2)) {            // (pushed out of anything it is inside)
        const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, ox = (b.x1 - b.x0) / 2 + R - Math.abs(st.pos.x - cx), oz = (b.z1 - b.z0) / 2 + R - Math.abs(st.pos.z - cz);
        if (ox < oz) st.pos.x += Math.sign(st.pos.x - cx || 1) * ox; else st.pos.z += Math.sign(st.pos.z - cz || 1) * oz;
      }
    }
    st.speedN = vel.length() / SC;
    // Footsteps, and the rig's walk cycle.
    if (st.grounded && st.speedN > 1) { st.stride += vel.length() * dt; if (st.stride > 9 * SC) { st.stride = 0; if (A) A.step(st.on === 'path' ? 'stone' : st.on === 'log' || st.on === 'stump' ? 'wood' : st.on === 'rock' || st.on === 'bigrock' ? 'stone' : 'grass', st.sneak ? 0.25 : 0.5); } } else if (st.speedN <= 1) st.stride = 6 * SC;
    const m = rig.motion; m.air = !st.grounded || !!st.climb; m.speed = st.speedN * 0.8; m.phase += dt * st.speedN * 0.42;
    rig.root.position.set(st.pos.x, st.y, st.pos.z); rig.root.rotation.y = turn(rig.root.rotation.y, st.heading, Math.min(1, dt * 12));
    if (o.onTick) o.onTick(dt, P);
    // The camera: always centred on the character.
    cam.pos.lerp(camGoal(), Math.min(1, dt * 8)); cam.look.set(st.pos.x, st.y + 15 * SC, st.pos.z); G.cutNow(cam);
  };

  P.start = () => {
    if (st.active) return; st.active = true;
    const tu = P.touch = root.TouchUI.create({ keys, run: true, sneak: true, jump: true, act: true, drop: true, cam: true });
    tu.on.cam = () => setZoom(); tu.on.jump = () => { st.jumpReq = true; }; tu.on.act = () => o.onAct && o.onAct(P); tu.on.drop = () => o.onTake && o.onTake(P); tu.on.sneak = on => { st.sneak = on; toast(on ? 'Sneaking: slow and quiet.' : 'Walking.'); };
    setZoom(0); for (const k in keys) keys[k] = false;
    root.addEventListener('keydown', kd); root.addEventListener('keyup', ku);
    el.addEventListener('pointerdown', pd); el.addEventListener('pointermove', pm); el.addEventListener('pointerup', pu); el.addEventListener('pointercancel', pu); el.addEventListener('wheel', wheel, { passive: false });
    cam.pos.copy(camGoal()); cam.look.set(st.pos.x, st.y + 15 * SC, st.pos.z); G.cutNow(cam);
    G.updaters.push(tick); G.mode = 'play'; document.body.classList.remove('cutscene');
  };
  P.stop = () => {
    if (!st.active) return; st.active = false; for (const k in keys) keys[k] = false; drags.clear();
    if (P.touch) { P.touch.destroy(); P.touch = null; }
    root.removeEventListener('keydown', kd); root.removeEventListener('keyup', ku);
    el.removeEventListener('pointerdown', pd); el.removeEventListener('pointermove', pm); el.removeEventListener('pointerup', pu); el.removeEventListener('pointercancel', pu); el.removeEventListener('wheel', wheel);
    G.updaters = G.updaters.filter(u => u !== tick);
  };
  P.place = (x, z, heading) => { st.pos.set(x, 0, z); st.y = surfaceAt(x, z).top; st.vy = 0; st.climb = null; st.heading = heading === undefined ? st.heading : heading; st.yaw = st.heading + Math.PI; rig.root.position.set(x, st.y, z); rig.root.rotation.y = st.heading; cam.pos.copy(camGoal()); };
  P.zoom = setZoom; P.sneak = setSneak; P.cam = cam;
  P.place(st.pos.x, st.pos.z, st.heading); rig.root.scale.setScalar(SC);
  return P;
}

root.Player = { create, ZOOMS, WALK, CREEP, RUN, GRAV, JUMP_V };
})(typeof window !== 'undefined' ? window : globalThis);
