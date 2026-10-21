// Red Lessons — movement for the toon characters (js/toon.js): walking, running, turning and standing, reaching, crouching, carrying, sitting and
// lying down. Written for any rig the toon module builds, so every character can use it.
//
// Walking and running are a cycle played in place, in the figure's own frame, as on a treadmill, and timed to its speed: a foot on the ground
// goes back under her at exactly the speed she goes forward, so it stays where it landed, and nothing slides. Each foot lands on its heel, rolls
// flat and up onto its ball to push off, and swings through; the legs are solved (hip, knee, ankle) to reach the feet; the hips sit as high as
// the planted feet allow with those legs all but straight, easing down into each step as it lands, tilting toward the swinging leg and swaying
// over the standing one; the spine levels the shoulders and turns them against the hips; the arms hang from the shoulders on springs, swinging
// against the legs. Running is a longer, quicker stride with time in the air: the heel tucks up, the knee drives through, the arms pump.
// Standing, her weight is on one straight leg, the other easy, changing over now and then; turning on the spot she steps round.
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
  accel: 7, decel: 9, yawRate: 9, yawRateRun: 6, // how quickly she gets up to speed, slows, and turns (per second)
  duty: [0.62, 0.36],                      // the share of each stride a foot is on the ground: walking, running
  stride: [1.1, 1.0],                     // stride length (by leg length, and the square root of speed by leg length): walking, running
  lift: [1.6, 1.6], drop: [0, 0.5], bob: [0, 0.7], lean: [0.06, 0.26],
  sway: [0.5, 0.15],                       // the hips over the standing foot, side to side
  tilt: [0.075, 0.04],                     // the hip on the side of the swinging leg dropping (radians), the spine keeping the shoulders level
  turn: [0.012, 0.016],                    // the hips turning with the stepping leg (per unit of the feet's reach apart); the shoulders turn against
  down: [0.45, 0],                         // how far the hips give as each heel takes the weight
  strike: [-0.3, -0.05], pushOff: [0.55, 0.95],      // the foot's pitch landing (toes up) and leaving (on its toes): walking, running
  straight: [0.995, 0.985],                // how straight a leg on the ground may be (of its full length): walking, running
};

function create(rig, opts) {
  opts = opts || {};
  const D = T.DIM, sc = rig.scaleW, LEG = (D.thigh + D.shin) * sc, SOLE = 0.75 * sc, HIPX = D.hipX + 0.12, HEEL = 0.95 * sc, BALL = 1.5 * sc;      // (heel and ball: behind and before the ankle)
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
  for (const s of ['L', 'R']) { const p = neutral(s); m.feet[s] = { pos: p.clone(), yaw: m.yaw, pitch: 0, w: 1, sw: 0, land: null }; }
  const after = (test, fn) => new Promise(res => m.cbs.push({ test, res: () => { if (fn) fn(); res(); } }));

  // ── Commands ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  m.goTo = (pos, yaw, o) => { m.auto = { pos: pos.clone().setY(0), yaw, run: !!(o && o.run) }; return after(() => !m.auto); };
  m.face = yaw => { m.faceYaw = yaw; return after(() => Math.abs(angDiff(m.yaw, yaw)) < 0.05 && m.speed < 0.5); };
  m.reach = (side, target) => { const h = m.hands[side]; h.target = target; h.want = 1; return after(() => h.w > 0.97); };
  m.release = side => { const h = m.hands[side]; h.want = 0; return after(() => h.w < 0.03, () => { h.target = null; }); };
  m.hold = (item, style) => { m.carry = item; m.carryStyle = style || 'front'; };
  m.drop = () => { const it = m.carry; m.carry = null; return it; };
  m.sit = seat => { m.seat = seat; m.sitFrom = { pos: m.pos.clone(), yaw: m.yaw }; m.sitWant = 1; m.locked = true; return after(() => m.sitW > 0.98); };
  m.stand = () => { m.lieWant = 0; return after(() => m.lieW < 0.02).then(() => { m.sitWant = 0; return after(() => m.sitW < 0.02, () => { m.locked = false; m.seat = null; }); }); };
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
    if (yawTo != null) { const dA = angDiff(m.yaw, yawTo), tr = lerp(GAIT.yawRate, GAIT.yawRateRun, m.runB); m.yaw += clamp(dA, -tr * dt, tr * dt) * (mag > 0 ? 1 : 0.7); if (mag === 0 && Math.abs(angDiff(m.yaw, yawTo)) < 0.02) m.faceYaw = null; }
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
  // Walking and running are a cycle played in place, in her own frame, as on a treadmill: each foot comes down ahead of her on its heel, slides
  // back under her while it carries her (rolling flat, then up onto its ball to push off), and swings forward again. How fast the cycle plays,
  // and how long the stride, are set by her speed, so a foot on the ground goes back under her at exactly the speed she goes forward: in the
  // world it stays where it landed. The feet go where her body goes, rather than reaching for where she'll be. Turning on the spot she steps
  // round in place; stopping, she steps her feet in under her and settles into standing: her weight on one straight leg, the other easy and a
  // little forward, changing over now and then.
  //   In her frame: x across (her left +), z forward, y up. `pos` is where each ankle is in the world, `yaw` the way the foot points, `pitch` its
  //   roll (+: toes down), `w` how much weight it can take.
  const feetNow = { L: new V3(), R: new V3() };
  const toWorld = (x, y, z) => m.pos.clone().addScaledVector(sideOf(m.yaw), x).addScaledVector(fwdOf(m.yaw), z).setY(y);
  // (the ankle of a foot whose spot on the floor is (x, z), rolled by p about its heel (p < 0) or its ball (p > 0))
  const rollAt = (x, z, p) => { const heel = p < 0, pz = z + (heel ? -HEEL : BALL), a = heel ? HEEL : -BALL, c = Math.cos(p), sn = Math.sin(p); return { x, z: pz + a * c + SOLE * sn, y: -a * sn + SOLE * c }; };
  // (the same, in the world, about a spot on the floor and the way the foot points)
  const roll = (plant, yaw, p) => {
    const fw = fwdOf(yaw), heel = p < 0, piv = plant.clone().setY(0).addScaledVector(fw, heel ? -HEEL : BALL), x = heel ? HEEL : -BALL, c = Math.cos(p), sn = Math.sin(p);
    return piv.addScaledVector(fw, x * c + SOLE * sn).setY(-x * sn + SOLE * c);
  };
  m.down = 0; m.cyc = 0; m.weight = 0;
  function stepFeet(dt) {
    const v = m.speed, rb = m.runB, duty = lerp(GAIT.duty[0], GAIT.duty[1], rb), lift = lerp(GAIT.lift[0], GAIT.lift[1], rb) * sc;
    const pStrike = lerp(GAIT.strike[0], GAIT.strike[1], rb), pOff = lerp(GAIT.pushOff[0], GAIT.pushOff[1], rb), walkV = GAIT.walk * sc;
    // How much she's stepping: walking or running, or turning where she stands; it eases off as she stops, while her feet come in under her.
    const turning = Math.abs(m.turnRate) > 0.8 && !m.locked, stepping = !m.locked && (v > 0.12 * walkV || turning);
    m.cyc = approach(m.cyc, stepping ? 1 : 0, stepping ? 6 : 3.5, dt);
    const c = m.cyc;
    // The cycle runs on at a walking pace while she steps in or round, and the stride is what her speed asks for.
    const vEff = Math.max(v, c * 0.5 * walkV, turning ? 0.45 * walkV : 0), vr = vEff / LEG;
    const S = LEG * lerp(GAIT.stride[0], GAIT.stride[1], rb) * Math.sqrt(Math.max(vr, 0.35)), Tc = S / Math.max(vEff, 1e-3), a = duty * S / 2 * clamp(v / Math.max(vEff, 1e-3), 0, 1);
    if (c > 0.001) m.phase = (m.phase + dt / Tc) % 1;
    m.mv = c * clamp(vEff / (walkV * 0.7), 0, 1);
    m.down = 0;
    // Standing: which leg carries her (+1 her left), and where each foot stands.
    m.weight = T.stance ? T.stance(m.t) : 0;
    for (const [s, sd] of [['L', 1], ['R', -1]]) {
      const f = m.feet[s], free = Math.max(0, -m.weight * sd), carry = Math.max(0, m.weight * sd);
      const ix = sd * (HIPX - 0.25 * carry + 0.35 * free) * sc, iz = (0.05 + 1.3 * free) * sc, iyaw = sd * (0.12 + 0.14 * free);
      // The cycle: on the ground (sliding back under her) or in the air (swinging forward).
      const ph = (m.phase + (s === 'R' ? 0.5 : 0)) % 1, stance = ph < duty, x = sd * HIPX * sc;
      let A, pitch, w;
      if (stance) {
        const st = ph / duty; pitch = pStrike * (1 - ss(0, 0.14, st)) + pOff * Math.pow(ss(lerp(0.6, 0.45, rb), 1, st), 1.4);
        A = rollAt(x, a - 2 * a * st, a > 0.3 * sc ? pitch : 0); w = 1; f.sw = 0; f.st = st;
        if (st < 0.3) m.down = Math.max(m.down, Math.sin(Math.PI * st / 0.3));      // (taking the weight: the knee gives a little just after the heel lands)
      } else {
        const sw = (ph - duty) / (1 - duty), big = clamp(a / (2 * sc), 0, 1), A0 = rollAt(x, -a, pOff * big), A1 = rollAt(x, a, pStrike * big);
        // Walking, the foot swings low from where it left the floor to where it'll land, rising most just after it leaves (the knee folding).
        // Running, it takes a path of its own: the heel kicks up behind toward her seat, the knee drives forward with the foot tucked under it,
        // and the foot reaches out to land.
        const e = ease(sw); A = { x, z: lerp(A0.z, A1.z, e), y: lerp(A0.y, A1.y, e) + lift * (0.45 + 0.55 * big) * Math.sin(Math.PI * Math.pow(sw, 0.75)) };
        if (rb > 0.01) { const ra = spline([A0.z, -0.12 * LEG, 0.32 * LEG, A1.z], sw), rh = Math.max(0, spline([A0.y - SOLE, 0.62 * LEG, 0.34 * LEG, A1.y - SOLE], sw)); A.z = lerp(A.z, ra, rb); A.y = lerp(A.y, SOLE + rh, rb); }
        pitch = (lerp(pOff, 0, ss(0, 0.45, sw)) + pStrike * ss(0.55, 1, sw)) * big;
        w = 1 - ss(0, 0.12, sw) + ss(0.92, 1, sw); f.sw = sw; f.st = -1; f.land = toWorld(A1.x, A1.y, A1.z);
      }
      // Standing and stepping blended by how much she's stepping; a foot moving between the two lifts clear of the floor.
      const gap = Math.hypot(A.x - ix, A.z - iz), up = Math.sin(Math.PI * c) * Math.min(1, gap / (2 * sc)) * 1.2 * sc * (stance ? 0.3 : 1);
      const P = { x: lerp(ix, A.x, c), z: lerp(iz, A.z, c), y: lerp(SOLE, A.y, c) + up };
      let W = toWorld(P.x, P.y, P.z), yaw = m.yaw + lerp(iyaw, sd * 0.06, c);
      // A foot that has landed is held where it touched down until it lifts, however she turns over it; the next swing sets off from wherever it
      // really was, and makes up the difference on the way.
      if (stance && c > 0.5) {
        if (!f.lock) f.lock = { at: toWorld(x, 0, a - 2 * a * ph / duty), yaw };
        W = roll(f.lock.at, f.lock.yaw, pitch); yaw = f.lock.yaw; f.lift = null;
      } else {
        if (f.lock) { f.lift = { off: f.pos.clone().sub(W), yaw: f.yaw - yaw }; f.lock = null; }
        if (f.lift && !stance) { const k = 1 - ease(f.sw); W.addScaledVector(f.lift.off, k); yaw += f.lift.yaw * k; } else f.lift = null;
      }
      f.pos.copy(W); f.pitch = pitch * c; f.yaw = yaw;
      f.w = lerp(carry > 0 || Math.abs(m.weight) < 0.3 ? 1 : 0.35, w, c); f.stance = c < 0.5 || stance;
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
    const wt = m.weight * idle * (1 - m.crouch);      // (standing: her weight over one leg)
    const sway = lerp(GAIT.sway[0], GAIT.sway[1], m.runB) * mv * Math.cos(cyc) + 0.5 * wt, shift = Math.sin(t * 0.5), tilt = lerp(GAIT.tilt[0], GAIT.tilt[1], m.runB) * mv * Math.cos(cyc) + 0.065 * wt;
    const crouch = m.crouch, standY = D.hipY - lerp(GAIT.drop[0], GAIT.drop[1], m.runB) * mv + bob - lerp(GAIT.down[0], GAIT.down[1], m.runB) * m.down * mv - crouch * 5.2;
    const sitY = m.seat ? m.seat.at.y / sc + 2.55 : standY;
    r.hips.position.set((sway + 0.04 * shift * idle) * (1 - sitW), lerp(standY, sitY, sitW), -crouch * 2.6 * (1 - sitW));
    const hipYaw = clamp(-lerp(GAIT.turn[0], GAIT.turn[1], m.runB) * (offs.L - offs.R), -0.25, 0.25) * mv, hipTilt = tilt * (1 - sitW);
    r.hips.rotation.set(0.06 * rb, hipYaw, hipTilt);
    if (sitW < 0.999 && lieW < 0.001) {
      // Lowered as far as the planted feet need (a foot counts as it comes down to the floor, and less as it lifts off).
      r.root.updateMatrixWorld(true);
      const Lr = (D.thigh + D.shin) * sc * lerp(GAIT.straight[0], GAIT.straight[1], m.runB);
      let need = 0;
      for (const s of ['L', 'R']) {
        const f = m.feet[s], hj = r['thigh' + s].getWorldPosition(new V3());
        const needFor = (A, at) => { const hd = Math.hypot(A.x - at.x, A.z - at.z); return hj.y - (A.y + Math.sqrt(Math.max(0, Lr * Lr - hd * hd))); };
        if (f.w > 0) need = Math.max(need, needFor(f.pos, hj) * clamp(f.w, 0, 1));
        // A foot about to land: the hips start down to meet it (judged from where they'll be when it does), so the weight rolls onto it.
        if (f.sw > 0 && f.land && m.cyc > 0.5) { const w = ss(0.35, 1, f.sw) * m.cyc; if (w > 0) need = Math.max(need, needFor(f.land, hj) * w); }
      }
      // (down at once, so a leg is never stretched past its length; back up a little more gently)
      m.hipDrop = need > (m.hipDrop || 0) ? need : approach(m.hipDrop || 0, need, lerp(7, 16, m.runB), dt);
      r.hips.position.y -= m.hipDrop / sc * (1 - sitW);
    }
    // Body: leaning into speed, into speeding up and into a turn; the shoulders turning against the hips; bending down for a low reach.
    const lean = lerp(GAIT.lean[0], GAIT.lean[1], m.runB) * mv + clamp(m.acc / (GAIT.walk * sc), -0.6, 0.6) * 0.12 + crouch * 1.0 + 0.3 * Math.sin(Math.PI * m.sitW) * (m.sitWant ? 1 : 0.6);
    const bank = clamp(-m.turnRate * 0.05 * mv, -0.18, 0.18), br = Math.sin(t * 1.6);
    r.torso.rotation.set(lean * (1 - lieW) + 0.015 * br * idle + 0.03 * m.down * mv, -1.8 * hipYaw, bank - 0.85 * hipTilt - 0.05 * wt * (1 - sitW));      // (the spine levels the shoulders over the tilting hips, and standing, drops the shoulder over the standing leg)
    // Head: steady (it undoes the lean), looking where she's going or at what she's reaching for, a little wandering when she's still.
    let lookYaw = 0.14 * Math.sin(t * 0.23) * idle, lookPitch = 0.04 * Math.sin(t * 0.37) * idle;
    if (m.look) { r.root.updateMatrixWorld(true); const hp = r.neck.getWorldPosition(new V3()), to = (typeof m.look === 'function' ? m.look() : m.look).clone().sub(hp), loc = to.applyQuaternion(rootQ.clone().invert());
      m.lookW = approach(m.lookW, 1, 4, dt); lookYaw = lerp(lookYaw, clamp(Math.atan2(loc.x, loc.z), -1, 1), m.lookW); lookPitch = lerp(lookPitch, clamp(Math.atan2(-loc.y, Math.hypot(loc.x, loc.z)), -0.5, 0.7), m.lookW); }
    else m.lookW = approach(m.lookW, 0, 4, dt);
    r.neck.rotation.set(-0.8 * lean * (1 - crouch * 0.6) + lookPitch * (1 - lieW) - 0.25 * lieW, lookYaw * (1 - lieW) + 0.8 * hipYaw, -0.6 * bank - 0.15 * hipTilt);
    r.head.rotation.set(0, 0, 0);
    // Arms: swinging against the legs (from where the feet really are), bent more running; still, hanging easy.
    const S2 = LEG / sc * 0.85;
    // Each arm hangs from the shoulder like a pendulum on a spring, so it trails the swing a little and carries on past it; the forearm lags
    // the upper arm in turn, folding as the arm comes forward and opening as it goes back.
    m.arms = m.arms || { L: { a: 0, v: 0, e: 0, ev: 0 }, R: { a: 0, v: 0, e: 0, ev: 0 } };
    for (const [s, sd] of [['L', 1], ['R', -1]]) {
      const rel = clamp(offs[s] / S2, -1.2, 1.2), amp = lerp(0.4, 0.75, m.runB) * mv, A = m.arms[s];
      const want = amp * rel * (rel < 0 ? lerp(0.85, 0.45, m.runB) : 1) + 0.03 * Math.sin(t * 1.1 + sd) * idle - 0.1 * rb;
      A.v += (90 * (want - A.a) - 11 * A.v) * dt; A.a += A.v * dt;
      const eWant = 0.22 + 0.12 * mv + 1.1 * rb + 0.35 * (mv - rb) * Math.max(0, -A.a) / Math.max(0.2, amp);
      A.ev += (70 * (eWant - A.e) - 9 * A.ev) * dt; A.e += A.ev * dt;
      r['arm' + s].rotation.set(A.a, 0, sd * (0.13 + 0.12 * rb + 0.02 * shift * sd * idle + 0.04 * mv));
      r['elbow' + s].rotation.set(-A.e, 0, 0);
      r['hand' + s].rotation.set(0.1 + 0.15 * A.v * 0.05, 0, sd * 0.05);
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
      const footQ = yawQ(m.seat ? m.yaw : f.yaw).multiply(new Q().setFromAxisAngle(new V3(1, 0, 0), f.pitch * (1 - sitW)));
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
