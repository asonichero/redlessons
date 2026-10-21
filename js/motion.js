// Red Lessons — movement for the toon characters (js/toon.js): walking, running, turning and standing, reaching, crouching, carrying, sitting and
// lying down. Written for any rig the toon module builds, so every character can use it.
//
// Feet are placed, not swung: each foot plants on a spot on the floor and stays there while the body passes over it, then lifts and swings to
// where it will next land (judged from where the body will be by then), so the feet never slide, at any speed or while turning. The legs are
// solved (hip, knee, ankle) to reach the feet; the hips rise and fall and turn with the steps and lean over the standing foot; the shoulders turn
// against the hips; the arms swing from where the feet actually are. Standing, she shifts her weight and breathes, and if her feet are out of
// place (after turning on the spot) she takes a small step to set them right. A run is a longer, quicker stride with less time on the ground,
// arms bent and the body leaning in.
//
// Layered on top: a reach with either hand to a point (crouching for low ones, feet staying put), carrying a thing (hanging from one hand, or held
// in front in both), sitting on a seat, lying on a bed. Each layer has a weight that eases in and out, so one thing flows into the next.
//
//   const m = Motion.create(rig, { collide: (pos, r) => pos })
//   each frame: m.update(dt, { move: { x, z } (world, length 0..1), run: bool })      then rig.tick(dt)
//   m.goTo(pos, yaw).then(…); m.face(yaw); m.reach('R', pointOrFn); m.release('R'); m.hold(item, 'hang' | 'front'); m.drop();
//   m.sit(seat).then(…); m.stand().then(…); m.lie(bed).then(…)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3, Q = THREE.Quaternion;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, ease = x => x * x * (3 - 2 * x);
const UP = new V3(0, 1, 0), _m = new THREE.Matrix4(), _q = new Q();
const yawQ = y => new Q().setFromAxisAngle(UP, y);
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const approach = (x, to, rate, dt) => x + (to - x) * (1 - Math.exp(-rate * dt));
// A smooth curve through four values, passed at t = 0, 1/3, 2/3 and 1 (Catmull-Rom).
function spline(v, t) {
  const n = 3, i = Math.min(n - 1, Math.floor(t * n)), u = t * n - i, p = k => v[clamp(k, 0, n)];
  const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2), m1 = (p2 - p0) / 2, m2 = (p3 - p1) / 2, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1 + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2 + (u3 - u2) * m2;
}
function setWorldQuat(o, qw) { o.parent.getWorldQuaternion(_q); o.quaternion.copy(_q.invert().multiply(qw)); }

// ── Solvers ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A leg (thigh from the hip, knee, ankle) reaching for the point A (world) with the knee bending toward `pole`; the foot set to the world
// rotation `footQ`.
function legIK(r, s, A, pole, footQ) {
  const thigh = r['thigh' + s], knee = r['knee' + s], ankle = r['ankle' + s];
  r.root.updateMatrixWorld(true);
  const sc = r.root.getWorldScale(new V3()).x, L1 = T.DIM.thigh * sc, L2 = T.DIM.shin * sc;
  const H = thigh.getWorldPosition(new V3()), v = A.clone().sub(H), d = clamp(v.length(), 0.25 * (L1 + L2), L1 + L2 - 0.005 * sc), u = v.normalize();
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  let p = pole.clone().addScaledVector(u, -pole.dot(u)); if (p.lengthSq() < 1e-6) p = new V3(0, 0, 1); p.normalize();
  const K = H.clone().addScaledVector(u, L1 * Math.cos(a)).addScaledVector(p, L1 * Math.sin(a)), Ac = H.clone().addScaledVector(u, d);
  const d1 = K.clone().sub(H).normalize(), d2 = Ac.clone().sub(K).normalize();
  // The thigh's frame: down it is -y; the shin folds back from it about its x (a positive turn), so its +z is the side away from the fold.
  const Y = d1.clone().negate(); let Z = d2.clone().addScaledVector(d1, -d2.dot(d1)); Z = Z.lengthSq() < 1e-8 ? p.clone() : Z.normalize().negate();
  const X = new V3().crossVectors(Y, Z).normalize(); Z.crossVectors(X, Y);
  setWorldQuat(thigh, new Q().setFromRotationMatrix(_m.makeBasis(X, Y, Z)));
  knee.rotation.set(Math.acos(clamp(d1.dot(d2), -1, 1)), 0, 0);
  r.root.updateMatrixWorld(true);
  if (footQ) setWorldQuat(ankle, footQ);
}
// An arm (shoulder, elbow) bringing the wrist to W (world), the elbow bending out toward `pole`.
function armIK(r, s, W, pole) {
  const arm = r['arm' + s], elbow = r['elbow' + s], hand = r['hand' + s];
  r.root.updateMatrixWorld(true);
  const sc = r.root.getWorldScale(new V3()).x, LU = elbow.position.length() * sc, LF = hand.position.length() * sc;
  const S = arm.getWorldPosition(new V3()), v = W.clone().sub(S), d = clamp(v.length(), Math.abs(LU - LF) + 0.05, LU + LF - 0.02), ud = v.normalize();
  const cosA = clamp((LU * LU + d * d - LF * LF) / (2 * LU * d), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  let pp = pole.clone().addScaledVector(ud, -pole.dot(ud)); if (pp.lengthSq() < 1e-6) pp = new V3(0, 1, 0).addScaledVector(ud, -ud.y); pp.normalize();
  const E = S.clone().addScaledVector(ud, LU * cosA).addScaledVector(pp, LU * sinA), Wc = S.clone().addScaledVector(ud, d);
  const u1 = E.clone().sub(S).normalize(), f = Wc.clone().sub(E).normalize();
  let Z = f.clone().addScaledVector(u1, -f.dot(u1)); if (Z.lengthSq() < 1e-6) Z = pp.clone().negate(); Z.normalize();
  const Y = u1.clone().negate(), X = new V3().crossVectors(Y, Z);
  setWorldQuat(arm, new Q().setFromRotationMatrix(_m.makeBasis(X, Y, Z)));
  elbow.rotation.set(-Math.acos(clamp(u1.dot(f), -1, 1)), 0, 0);
  r.root.updateMatrixWorld(true);
}

// ── Tuning (in the figure's own units, multiplied by its size) ───────────────────────────────────────────────────────────────────────────────
const GAIT = {
  walk: 21, run: 60,                       // top speeds, world units a second at size 1 (her legs are about 14 long)
  accel: 7, decel: 9, turn: 9, turnRun: 6, // how quickly she gets up to speed, slows, and turns (per second)
  duty: [0.62, 0.36],                      // the share of each stride a foot is on the ground: walking, running
  lift: [1.6, 1.6], drop: [0, 0.5], bob: [0, 0.7], sway: [0.3, 0.12], lean: [0.04, 0.26],
  straight: [0.995, 0.985],                // how straight a leg on the ground may be (of its full length): walking, running
};

function create(rig, opts) {
  opts = opts || {};
  const D = T.DIM, sc = rig.scaleW, LEG = (D.thigh + D.shin) * sc, SOLE = 0.75 * sc, HIPX = D.hipX + 0.12;
  const m = {
    rig, pos: rig.root.position.clone(), yaw: rig.root.rotation.y, vel: new V3(), speed: 0, t: 0, phase: 0, runB: 0, mv: 0, acc: 0, turnRate: 0,
    feet: {}, auto: null, faceYaw: null, look: null, lookW: 0,
    hands: { L: { target: null, w: 0, want: 0 }, R: { target: null, w: 0, want: 0 } }, crouch: 0,
    carry: null, carryStyle: null, carryW: 0,
    seat: null, sitW: 0, sitWant: 0, sitFrom: null, bed: null, lieW: 0, lieWant: 0,
    locked: false, cbs: [],
  };
  const fwdOf = y => new V3(Math.sin(y), 0, Math.cos(y)), sideOf = y => new V3(Math.cos(y), 0, -Math.sin(y));      // (side: her left, +x of the rig)
  const neutral = (s, at, yaw) => (at || m.pos).clone().addScaledVector(sideOf(yaw == null ? m.yaw : yaw), (s === 'L' ? 1 : -1) * HIPX * sc).setY(SOLE);
  for (const s of ['L', 'R']) { const p = neutral(s); m.feet[s] = { pos: p.clone(), from: p.clone(), to: p.clone(), swing: false, step: null, pitch: 0, wasStance: true }; }
  const after = (test, fn) => new Promise(res => m.cbs.push({ test, res: () => { if (fn) fn(); res(); } }));

  // ── Commands ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  m.goTo = (pos, yaw, o) => { m.auto = { pos: pos.clone().setY(0), yaw, run: !!(o && o.run) }; return after(() => !m.auto); };
  m.face = yaw => { m.faceYaw = yaw; return after(() => Math.abs(angDiff(m.yaw, yaw)) < 0.05 && m.speed < 0.5); };
  m.reach = (side, target) => { const h = m.hands[side]; h.target = target; h.want = 1; return after(() => h.w > 0.97); };
  m.release = side => { const h = m.hands[side]; h.want = 0; return after(() => h.w < 0.03, () => { h.target = null; }); };
  m.hold = (item, style) => { m.carry = item; m.carryStyle = style || 'front'; };
  m.drop = () => { const it = m.carry; m.carry = null; return it; };
  m.sit = seat => { m.seat = seat; m.sitFrom = { pos: m.pos.clone(), yaw: m.yaw }; m.sitWant = 1; m.locked = true; return after(() => m.sitW > 0.98); };
  m.stand = () => { m.lieWant = 0; return after(() => m.lieW < 0.02).then(() => { m.sitWant = 0; return after(() => m.sitW < 0.02, () => { m.locked = false; m.seat = null; for (const s of ['L', 'R']) { const f = m.feet[s]; f.pos.copy(feetNow[s]); f.step = null; } }); }); };
  m.lie = bed => { m.bed = bed; m.lieWant = 1; return after(() => m.lieW > 0.98); };
  m.lookAt = p => { m.look = p; };
  Object.defineProperty(m, 'busy', { get: () => !!m.auto || m.locked });

  // ── Getting about ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  function locomote(dt, input) {
    let dir = new V3(input && input.move ? input.move.x : 0, 0, input && input.move ? input.move.z : 0), mag = Math.min(1, dir.length()), run = !!(input && input.run);
    if (m.locked) { dir.set(0, 0, 0); mag = 0; }
    if (m.auto) {
      // Walking there, slowing as she comes up to it; once there (or if she can get no nearer: something's in the way) she stays, and turns.
      const a = m.auto, to = a.pos.clone().sub(m.pos).setY(0), dist = to.length();
      a.t = (a.t || 0) + dt; if (a.best == null || dist < a.best - 0.3 * sc) { a.best = dist; a.bestT = a.t; }
      if (!a.there && (dist < 0.7 * sc || a.t - a.bestT > 1.2)) a.there = true;
      if (!a.there) { dir = to.normalize(); mag = clamp(dist / (5 * sc), 0.3, 1); run = a.run && dist > 12 * sc; }
      else { mag = 0; if (a.yaw != null) m.faceYaw = a.yaw; if (m.speed < 1 && (a.yaw == null || Math.abs(angDiff(m.yaw, a.yaw)) < 0.06)) m.auto = null; }
    }
    if (mag > 0.01) dir.normalize(); else mag = 0;
    const top = (run ? GAIT.run : GAIT.walk) * sc, want = dir.clone().multiplyScalar(top * mag);
    const rate = want.lengthSq() > m.vel.lengthSq() ? GAIT.accel : GAIT.decel;
    const before = m.speed;
    m.vel.x = approach(m.vel.x, want.x, rate, dt); m.vel.z = approach(m.vel.z, want.z, rate, dt);
    // Turning: toward where she's going (she can't go much sideways: the speed she keeps is what lies ahead of her as she turns); standing, toward
    // where she's been asked to face.
    let yawTo = null;
    if (mag > 0) yawTo = Math.atan2(dir.x, dir.z); else if (m.faceYaw != null) yawTo = m.faceYaw;
    const prevYaw = m.yaw;
    if (yawTo != null) { const dA = angDiff(m.yaw, yawTo), tr = lerp(GAIT.turn, GAIT.turnRun, m.runB); m.yaw += clamp(dA, -tr * dt, tr * dt) * (mag > 0 ? 1 : 0.7); if (mag === 0 && Math.abs(angDiff(m.yaw, yawTo)) < 0.02) m.faceYaw = null; }
    if (mag > 0) { const f = fwdOf(m.yaw), along = Math.max(0, m.vel.dot(f)), side = m.vel.clone().addScaledVector(f, -m.vel.dot(f)); m.vel.copy(f.multiplyScalar(along)).addScaledVector(side, 0.25); }
    m.turnRate = approach(m.turnRate, angDiff(prevYaw, m.yaw) / Math.max(dt, 1e-3), 8, dt);
    m.speed = m.vel.length(); m.acc = approach(m.acc, (m.speed - before) / Math.max(dt, 1e-3), 5, dt);
    m.runB = approach(m.runB, run && mag > 0 ? 1 : m.speed > GAIT.walk * sc * 1.3 ? 1 : 0, 4, dt);
    const want0 = m.pos.clone().addScaledVector(m.vel, dt);
    if (opts.collide) {
      // Against a wall or the furniture she's held back, and keeps only the speed she can actually make (along it, or none).
      const got = opts.collide(want0, 3.2 * sc), lost = want0.clone().sub(got);
      if (lost.lengthSq() > 1e-8) { const n = lost.clone().normalize(), into = m.vel.dot(n); if (into > 0) m.vel.addScaledVector(n, -into); }
      m.pos.copy(got);
    } else m.pos.copy(want0);
    m.speed = m.vel.length();
  }

  // ── The feet ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const feetNow = { L: new V3(), R: new V3() };
  function stepFeet(dt) {
    const v = m.speed, rb = m.runB, duty = lerp(GAIT.duty[0], GAIT.duty[1], rb), lift = lerp(GAIT.lift[0], GAIT.lift[1], rb) * sc;
    const moving = v > 1.2 * sc;
    m.mv = approach(m.mv, moving ? clamp(v / (GAIT.walk * sc * 0.7), 0, 1) : 0, 6, dt);
    if (moving) {
      const vr = v / LEG, S = LEG * lerp(0.92, 1.0, rb) * Math.sqrt(Math.max(vr, 0.35)), Tc = S / v;      // stride (a full cycle) and its time
      if (!m.walking) {
        // Starting off: the foot that's further behind goes first.
        const f = fwdOf(m.yaw), bL = m.feet.L.pos.clone().sub(m.pos).dot(f), bR = m.feet.R.pos.clone().sub(m.pos).dot(f);
        m.phase = bL < bR ? duty - 0.001 : duty - 0.5 - 0.001; m.walking = true;
        for (const s of ['L', 'R']) m.feet[s].step = null;
      }
      m.phase = (m.phase + dt / Tc + 10) % 1;
      for (const s of ['L', 'R']) {
        const f = m.feet[s], ph = (m.phase + (s === 'R' ? 0.5 : 0)) % 1, stance = ph < duty;
        if (!stance) {
          const sw = (ph - duty) / (1 - duty);
          if (f.wasStance) { f.from.copy(f.pos); f.relFrom = null; }
          const tLand = (1 - sw) * (1 - duty) * Tc, lead = duty * Tc / 2;
          f.to.copy(neutral(s, m.pos.clone().addScaledVector(m.vel, tLand + lead), m.yaw + m.turnRate * (tLand + lead)));
          // Walking, the foot swings low from where it left the floor to where it'll land. Running, it follows a path of its own, measured from
          // her: the heel kicks up behind toward her seat, the knee drives forward with the foot tucked under it, and the foot reaches out to land.
          const e = ease(sw); f.pos.lerpVectors(f.from, f.to, e); f.pos.y = SOLE + lift * Math.sin(Math.PI * sw);
          if (rb > 0.01) {
            const fw = fwdOf(m.yaw), sd = sideOf(m.yaw), rel = p => [p.clone().sub(m.pos).dot(fw), p.y - SOLE, p.clone().sub(m.pos).dot(sd)];
            const [a0, h0, l0] = f.relFrom || (f.relFrom = rel(f.from)), [a3, , l3] = rel(f.to);      // (where it lifted off, as it was from her then)
            const a = spline([a0, -0.12 * LEG, 0.32 * LEG, a3], sw), h = Math.max(0, spline([h0, 0.62 * LEG, 0.34 * LEG, 0], sw));
            const run = m.pos.clone().addScaledVector(fw, a).addScaledVector(sd, lerp(l0, l3, ease(sw))).setY(SOLE + h);
            f.pos.lerp(run, rb);
          }
          f.pitch = lerp(0.45, -0.15, ss(0, 0.7, sw)) + 0.15 * ss(0.7, 1, sw);
        } else {
          if (!f.wasStance) f.pos.copy(f.to).setY(SOLE);
          const late = ss(duty * 0.6, duty, ph); f.pitch = 0.5 * late; f.pos.y = SOLE + 0.9 * sc * late * (1 - rb * 0.3);      // (the heel lifts as the foot rolls off)
        }
        f.wasStance = stance;
      }
    } else {
      // Standing: finish any step in the air, then set right a foot that's out of place, one at a time.
      if (m.walking) { m.walking = false; for (const s of ['L', 'R']) { const f = m.feet[s]; if (!f.wasStance) f.step = { from: f.pos.clone().setY(SOLE), to: neutral(s), t: 0, dur: 0.22 }; f.wasStance = true; f.pitch = 0; } }
      const busy = m.feet.L.step || m.feet.R.step;
      if (!busy && !m.locked) {
        let worst = null, we = 0.9 * sc;
        for (const s of ['L', 'R']) { const e = m.feet[s].pos.clone().setY(0).distanceTo(neutral(s).setY(0)); if (e > we) { we = e; worst = s; } }
        if (worst) m.feet[worst].step = { from: m.feet[worst].pos.clone(), to: neutral(worst), t: 0, dur: 0.3 };
      }
      for (const s of ['L', 'R']) {
        const f = m.feet[s], st = f.step; if (!st) { f.pos.y = SOLE; f.pitch = approach(f.pitch, 0, 10, dt); continue; }
        st.t += dt; const k = clamp(st.t / st.dur, 0, 1); st.to.copy(neutral(s));
        f.pos.lerpVectors(st.from, st.to, ease(k)); f.pos.y = SOLE + 1.1 * sc * Math.sin(Math.PI * k); f.pitch = 0.25 * Math.sin(Math.PI * k);
        if (k >= 1) f.step = null;
      }
    }
  }

  // ── The pose ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  function pose(dt) {
    const r = rig, t = m.t, mv = m.mv, rb = m.runB * mv, idle = 1 - mv, duty = lerp(GAIT.duty[0], GAIT.duty[1], m.runB), sitW = ease(m.sitW), lieW = ease(m.lieW);
    const fwd = fwdOf(m.yaw), side = sideOf(m.yaw);
    // Where the root is, and which way it faces: standing on the floor; sitting, moved over the seat; lying, laid along the bed.
    let rootPos = m.pos.clone(), rootQ = yawQ(m.yaw);
    if (m.seat && m.sitFrom) { const sp = m.seat.at.clone().setY(0); rootPos.lerpVectors(m.sitFrom.pos, sp, sitW); m.pos.copy(rootPos); }
    if (m.bed && lieW > 0) {
      const head = m.bed.head, feet = m.bed.feet, along = head.clone().sub(feet).setY(0).normalize(), Z = UP.clone(), X = new V3().crossVectors(along, Z);
      const lieQ = new Q().setFromRotationMatrix(_m.makeBasis(X, along, Z)), headH = (D.hipY + D.torsoY + D.neckY + D.headY + D.headC + 2.1 * (D.headScale - 1)) * sc;
      const liePos = head.clone().addScaledVector(along, -headH).setY(head.y + 1.6 * sc);
      rootPos.lerp(liePos, lieW); rootQ.slerp(lieQ, lieW);
    }
    r.root.position.copy(rootPos); r.root.quaternion.copy(rootQ);
    // Hips: as high as the feet on the ground let them be with those legs all but straight, so walking, they ride up and over each planted foot
    // (highest as it passes under); running, the knee gives as the foot lands, and the body rises off it into the air between steps. Over the
    // standing foot, turning with the stepping leg. Standing, a slow shift of weight and breath.
    const offs = {}; for (const s of ['L', 'R']) offs[s] = m.feet[s].pos.clone().sub(m.pos).dot(fwd) / sc;
    const cyc = 2 * Math.PI * (m.phase - duty / 2), bob = -lerp(GAIT.bob[0], GAIT.bob[1], m.runB) * mv * Math.cos(2 * cyc);      // (running: lowest on each foot, highest in the air)
    const sway = lerp(GAIT.sway[0], GAIT.sway[1], m.runB) * mv * Math.cos(cyc), shift = Math.sin(t * 0.5);
    const crouch = m.crouch, standY = D.hipY - lerp(GAIT.drop[0], GAIT.drop[1], m.runB) * mv + bob - crouch * 5.2;
    const sitY = m.seat ? m.seat.at.y / sc + 2.55 : standY;
    r.hips.position.set(sway + 0.16 * shift * idle * (1 - sitW), lerp(standY, sitY, sitW), -crouch * 2.6 * (1 - sitW));
    const hipYaw = clamp(-0.022 * (offs.L - offs.R), -0.28, 0.28) * mv;
    r.hips.rotation.set(0.06 * rb, hipYaw, 0.03 * mv * Math.sin(cyc) + 0.02 * shift * idle);
    if (sitW < 0.999 && lieW < 0.001) {
      // Lowered as far as the planted feet need (a foot counts as it comes down to the floor, and less as it lifts off).
      r.root.updateMatrixWorld(true);
      const Lr = (D.thigh + D.shin) * sc * lerp(GAIT.straight[0], GAIT.straight[1], m.runB);
      let need = 0;
      for (const s of ['L', 'R']) {
        const f = m.feet[s], w = clamp(1 - (f.pos.y - SOLE - 0.9 * sc) / (1.2 * sc), 0, 1); if (w <= 0) continue;
        const hj = r['thigh' + s].getWorldPosition(new V3()), hd = Math.hypot(f.pos.x - hj.x, f.pos.z - hj.z), top = f.pos.y + Math.sqrt(Math.max(0, Lr * Lr - hd * hd));
        need = Math.max(need, (hj.y - top) * w);
      }
      // (down at once, so a leg is never stretched past its length; back up a little more gently)
      m.hipDrop = need > (m.hipDrop || 0) ? need : approach(m.hipDrop || 0, need, 16, dt);
      r.hips.position.y -= m.hipDrop / sc * (1 - sitW);
    }
    // Body: leaning into speed, into speeding up and into a turn; the shoulders turning against the hips; bending down for a low reach.
    const lean = lerp(GAIT.lean[0], GAIT.lean[1], m.runB) * mv + clamp(m.acc / (GAIT.walk * sc), -0.6, 0.6) * 0.12 + crouch * 1.0 + 0.3 * Math.sin(Math.PI * m.sitW) * (m.sitWant ? 1 : 0.6);
    const bank = clamp(-m.turnRate * 0.05 * mv, -0.18, 0.18), br = Math.sin(t * 1.6);
    r.torso.rotation.set(lean * (1 - lieW) + 0.015 * br * idle, -1.4 * hipYaw, bank);
    // Head: steady (it undoes the lean), looking where she's going or at what she's reaching for, a little wandering when she's still.
    let lookYaw = 0.14 * Math.sin(t * 0.23) * idle, lookPitch = 0.04 * Math.sin(t * 0.37) * idle;
    if (m.look) { r.root.updateMatrixWorld(true); const hp = r.neck.getWorldPosition(new V3()), to = (typeof m.look === 'function' ? m.look() : m.look).clone().sub(hp), loc = to.applyQuaternion(rootQ.clone().invert());
      m.lookW = approach(m.lookW, 1, 4, dt); lookYaw = lerp(lookYaw, clamp(Math.atan2(loc.x, loc.z), -1, 1), m.lookW); lookPitch = lerp(lookPitch, clamp(Math.atan2(-loc.y, Math.hypot(loc.x, loc.z)), -0.5, 0.7), m.lookW); }
    else m.lookW = approach(m.lookW, 0, 4, dt);
    r.neck.rotation.set(-0.8 * lean * (1 - crouch * 0.6) + lookPitch * (1 - lieW) - 0.25 * lieW, lookYaw * (1 - lieW) + 1.4 * hipYaw * 0.6, -0.6 * bank);
    r.head.rotation.set(0, 0, 0);
    // Arms: swinging against the legs (from where the feet really are), bent more running; still, hanging easy.
    const S2 = LEG / sc * 0.85;
    for (const [s, sd] of [['L', 1], ['R', -1]]) {
      const rel = clamp(offs[s] / S2, -1.2, 1.2), amp = lerp(0.42, 0.75, m.runB) * mv;
      r['arm' + s].rotation.set(amp * rel * (rel < 0 ? lerp(0.8, 0.45, m.runB) : 1) + 0.03 * Math.sin(t * 1.1 + sd) * idle - 0.1 * rb, 0, sd * (0.13 + 0.12 * rb + 0.02 * shift * sd * idle));
      r['elbow' + s].rotation.set(-(0.22 + 0.15 * mv + 1.1 * rb + 0.3 * (mv - rb) * Math.max(0, -rel)), 0, 0);
      r['hand' + s].rotation.set(0.1, 0, sd * 0.05);
    }
    // Lying: arms at her sides, legs straight, head back on the pillow.
    if (lieW > 0) for (const [s, sd] of [['L', 1], ['R', -1]]) { const a = r['arm' + s]; a.rotation.x *= 1 - lieW; a.rotation.z = lerp(a.rotation.z, sd * 0.2, lieW); r['elbow' + s].rotation.x = lerp(r['elbow' + s].rotation.x, -0.15, lieW); }
    r.root.updateMatrixWorld(true);

    // ── Hands: carrying, reaching (each blended over the swinging arm by its weight).
    const qa = s => [r['arm' + s].quaternion.clone(), r['elbow' + s].quaternion.clone()];
    const blendArm = (s, base, w) => { const a = r['arm' + s].quaternion, e = r['elbow' + s].quaternion, ia = a.clone(), ie = e.clone(); a.copy(base[0]).slerp(ia, w); e.copy(base[1]).slerp(ie, w); r.root.updateMatrixWorld(true); };
    const pole = (sd, down) => fwd.clone().multiplyScalar(-0.8).addScaledVector(side, sd * 0.7).addScaledVector(UP, down ? -0.4 : -0.2);
    const local = (x, y, z) => r.root.localToWorld(new V3(x, y, z));
    if (m.carry) m.carryW = approach(m.carryW, 1, 5, dt); else m.carryW = approach(m.carryW, 0, 5, dt);
    if (m.carryW > 0.01 && lieW < 0.5) {
      const hy = r.hips.position.y;
      for (const [s, sd] of [['L', 1], ['R', -1]]) {
        if (m.carryStyle === 'hang' && s === 'L') continue;
        const base = qa(s), W = m.carryStyle === 'hang' ? local(sd * 3.4, hy + 1.6, 1.6) : local(sd * 1.5, hy + 4.6 - crouch * 2, 4.4);
        armIK(r, s, W, pole(sd, true)); blendArm(s, base, m.carryW * (1 - sitW * 0.3));
      }
    }
    for (const [s, sd] of [['L', 1], ['R', -1]]) {
      const h = m.hands[s]; h.w = approach(h.w, h.want, h.want ? 4.5 : 5.5, dt); if (h.w < 0.005 || !h.target) continue;
      const target = typeof h.target === 'function' ? h.target() : h.target, base = qa(s);
      armIK(r, s, target, pole(sd, false)); blendArm(s, base, ease(h.w));
    }
    // A sitting figure rests her hands on her thighs.
    if (sitW > 0.01 && lieW < 0.5 && !m.carry) for (const [s, sd] of [['L', 1], ['R', -1]]) {
      if (m.hands[s].w > 0.05) continue; const base = qa(s);
      armIK(r, s, local(sd * 2.4, r.hips.position.y + 1.6, 6.5), pole(sd, true)); blendArm(s, base, sitW * (1 - lieW));
    }

    // ── Legs: each reaching its foot (standing or stepping); sitting, feet on the floor before the seat; lying, straight.
    for (const [s, sd] of [['L', 1], ['R', -1]]) {
      const f = m.feet[s];
      let A = f.pos.clone();
      if (m.seat && sitW > 0) {
        const sp = m.seat.at.clone().setY(0), sfwd = fwdOf(m.seat.facing), sside = sideOf(m.seat.facing);
        const sitFoot = sp.addScaledVector(sfwd, (D.thigh * 0.95 + 0.6) * sc).addScaledVector(sside, sd * (HIPX + 0.6) * sc).setY(SOLE);
        A.lerp(sitFoot, sitW);
      }
      feetNow[s].copy(A);
      const footQ = yawQ(m.yaw).multiply(new Q().setFromAxisAngle(new V3(1, 0, 0), f.pitch * (1 - sitW)));
      if (lieW < 0.999) {
        const before = [r['thigh' + s].quaternion.clone(), r['knee' + s].quaternion.clone(), r['ankle' + s].quaternion.clone()];
        legIK(r, s, A, fwd.clone().addScaledVector(UP, 0.25 + sitW * 0.5).addScaledVector(side, sd * 0.12), footQ);
        if (lieW > 0) { r['thigh' + s].quaternion.slerp(new Q().setFromEuler(new THREE.Euler(0, 0, sd * 0.04)), lieW); r['knee' + s].quaternion.slerp(new Q().setFromEuler(new THREE.Euler(0.06, 0, 0)), lieW); r['ankle' + s].quaternion.slerp(new Q().setFromEuler(new THREE.Euler(0.5, 0, 0)), lieW); }
        void before;
      } else { r['thigh' + s].rotation.set(0, 0, sd * 0.04); r['knee' + s].rotation.set(0.06, 0, 0); r['ankle' + s].rotation.set(0.5, 0, 0); }
    }
    r.root.updateMatrixWorld(true);
  }

  // ── Each frame ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  m.update = (dt, input) => {
    dt = clamp(dt || 1 / 60, 1 / 240, 1 / 20); m.t += dt;
    m.sitW = approach(m.sitW, m.sitWant, m.sitWant ? 3.2 : 3.6, dt); if (Math.abs(m.sitW - m.sitWant) < 0.004) m.sitW = m.sitWant;
    m.lieW = approach(m.lieW, m.lieWant, 2.6, dt); if (Math.abs(m.lieW - m.lieWant) < 0.004) m.lieW = m.lieWant;
    // A reach lower than she can get to standing brings her down into a crouch (feet where they are, knees bending, body leaning in).
    let low = 0; for (const s of ['L', 'R']) { const h = m.hands[s]; if (h.target && h.want) { const p = typeof h.target === 'function' ? h.target() : h.target; low = Math.max(low, clamp((10.5 * sc - p.y) / (7.5 * sc), 0, 1)); } }
    m.crouch = approach(m.crouch, low * Math.max(m.hands.L.want, m.hands.R.want), 3.5, dt);
    if (m.seat) m.yaw = lerp(m.sitFrom.yaw, m.sitFrom.yaw + angDiff(m.sitFrom.yaw, m.seat.facing), ease(Math.min(1, m.sitW * 1.6)));
    locomote(dt, input);
    stepFeet(dt);
    pose(dt);
    // Carried things follow the hand (or both hands), upright.
    if (m.carry) {
      const r = rig, g = m.carryStyle === 'hang' ? r.handR.localToWorld(new V3(0, -0.9, 0)) : r.handR.localToWorld(new V3(0, -0.9, 0)).lerp(r.handL.localToWorld(new V3(0, -0.9, 0)), 0.5);
      const it = m.carry; it.obj.quaternion.copy(yawQ(m.yaw + (it.spin || 0))); it.obj.position.copy(g).sub(it.grip.clone().applyQuaternion(it.obj.quaternion));
    }
    m.cbs = m.cbs.filter(c => { if (c.test()) { c.res(); return false; } return true; });
  };
  m.feetNow = feetNow;
  m.update(1 / 60, null);
  return m;
}

root.Motion = { create, legIK, armIK, GAIT };
})(typeof window !== 'undefined' ? window : globalThis);
