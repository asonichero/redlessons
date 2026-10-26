// Little Red’s Lessons — over the knee. Her mother (Gerda's rig) sits on a plain chair; Rose — Red, Little Red in her cloak — lies face down across her lap, hips over her right thigh, head
// and arms toward the floor on her left, legs on her right. The characters are js/toon.js's; the pain model is js/pain.js.
//
//  • A smack: her hand lifts (or her own implement in it), holds raised (the wait builds dread), swings down along an arc and lands with the palm (or the
//    blade) flat on the middle of the cheek struck, stays a moment on the skin, and comes back up, or back to rest above the small of her back.
//    Her arm is solved every frame (shoulder and elbow to bring the wrist where it must be, the hand turned flat to the skin), so it lands
//    exactly wherever Red is, however she moves. Her left hand rests between Red's shoulder blades.
//  • Red's body answers through springs: a kick of the legs on the side struck, a lift of the head, a wriggle that grows with her distress,
//    and it all settles rather than snaps. Her face follows the bands of the pain model; her hair hangs and swings.
//  • Clothes: her skirt down or lifted; with it lifted, her drawers up or down. The marks colour each cheek. Her name, Rose (the safe word), stops it all.
//
//   const lap = Lap.create(view, { looks, giver: 'gerda', subject: 'red', pitch })   // standalone: its own stage (js/stage.js); giver and subject: rigs (js/toon.js)
//   const lap = Lap.create(null, { external: { scene } })   // embedded: adds its stage group to another scene, which renders it
//   lap.smack(); lap.run(n); lap.rose() (the safe word); lap.amber() (a check-in); lap.set({ implement, skirt, drawers, strength, pace }); lap.setLooks(looks); lap.update(dt); lap.on(fn)
//   lap.halt() (stop a run); lap.end() (says 'end'); lap.clearMarks(); events: hit, tooHarsh, rest, rose, amber, end
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, S = root.Pain, L = root.Looks;
const V3 = THREE.Vector3, Q = THREE.Quaternion;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ease = x => x * x * (3 - 2 * x);

const PITCH = -0.12;                 // her body tipped head-down from the hips
const HOVER = 1.6;                   // at rest the hand hovers this far above the small of her back
const TIMES = { lift: 0.5, hold: 0.16, strike: 0.11, contact: 0.3, back: 0.42 };
// What's in the hand: the hand alone, or a corrector's own implement (js/implements.js: its model, how far its face is from the wrist, how fast it marks).
const IMPL_HAND = { name: 'the hand', mark: 1 }, implOf = id => (root.Implements && root.Implements.LIST[id]) || IMPL_HAND;
// Gerda's torso (radians: x lean forward, y turn, z roll): leaning in a little over her, upright as the arm goes up, into the strike, turning for the far cheek.
// (upright enough that their face reads from in front of them: they look down at the lap with the eyes and a little of the neck, not a hunch)
const TORSO = { rest: [0.03, 0, 0], raised: [-0.06, -0.08, -0.02], contactL: [0.08, 0, 0], contactR: [0.07, 0.16, 0.08] };
const BANDS = ['composed', 'flinching', 'struggling', 'close to the edge of resistance', 'past the edge of resistance', 'too harsh'];
// The face across the lap: a pout to begin with, wince once it smarts, gritted as it gets harder, and at the edge of resistance crying, held.
// Each smack flickers the face one on in that order for a moment (pout to wince, wince to gritted, gritted to crying), then back.
const FACE = ['pout', 'wince', 'gritted', 'crying'], FLICKER = 0.45;

// ── Arm solving ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const _q = new Q(), _m = new THREE.Matrix4();
function setWorldQuat(obj, qw) { obj.parent.getWorldQuaternion(_q).invert(); obj.quaternion.copy(_q.multiply(qw)); }
// The rotation whose x axis is X and whose y axis is (as near as it can be) Y.
function basis(X, Y) {
  const x = X.clone().normalize(), z = new V3().crossVectors(x, Y).normalize(), y = new V3().crossVectors(z, x);
  return new Q().setFromRotationMatrix(_m.makeBasis(x, y, z));
}
// Shoulder and elbow so the wrist (the hand bone's origin) reaches W, the elbow bending out toward `pole`.
function armIK(rig, s, W, pole) {
  const arm = rig['arm' + s], elbow = rig['elbow' + s], hand = rig['hand' + s];
  rig.root.updateMatrixWorld(true);
  const sc = rig.root.getWorldScale(new V3()).x, LU = elbow.position.length() * sc, LF = hand.position.length() * sc;
  const Sw = arm.getWorldPosition(new V3()), v = W.clone().sub(Sw), d = clamp(v.length(), Math.abs(LU - LF) + 0.05, LU + LF - 0.02), ud = v.normalize();
  const cosA = clamp((LU * LU + d * d - LF * LF) / (2 * LU * d), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  let pp = pole.clone().addScaledVector(ud, -pole.dot(ud)); if (pp.lengthSq() < 1e-6) pp = new V3(0, 1, 0).addScaledVector(ud, -ud.y); pp.normalize();
  const E = Sw.clone().addScaledVector(ud, LU * cosA).addScaledVector(pp, LU * sinA), Wc = Sw.clone().addScaledVector(ud, d);
  const u1 = E.clone().sub(Sw).normalize(), f = Wc.clone().sub(E).normalize();
  let Z = f.clone().addScaledVector(u1, -f.dot(u1)); if (Z.lengthSq() < 1e-6) Z = pp.clone().negate(); Z.normalize();
  const Y = u1.clone().negate(), X = new V3().crossVectors(Y, Z);
  setWorldQuat(arm, new Q().setFromRotationMatrix(_m.makeBasis(X, Y, Z)));
  elbow.rotation.set(-Math.acos(clamp(u1.dot(f), -1, 1)), 0, 0);
  rig.root.updateMatrixWorld(true);
}
// A damped spring for one number: it follows its target with a little give.
const spring = (w, z) => ({ x: 0, v: 0, w, z, to(target, dt) { this.v += (this.w * this.w * (target - this.x) - 2 * this.z * this.w * this.v) * dt; this.x += this.v * dt; return this.x; } });

function create(view, opts) {
  opts = opts || {};
  // ── Stage ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const ext = opts.external || null, st_ = ext ? null : root.Stage.create(view, { fov: 34 });
  const scene = ext ? ext.scene : st_.scene;
  const stage = new THREE.Group(); scene.add(stage);
  const GIVER = opts.giver || 'gerda', SUBJ = opts.subject || 'red';
  const seatY = T.seatFor(GIVER), chair = T.makeChair(seatY), FLOOR = 0; stage.add(chair);
  let looks = L ? L.clean(opts.looks || L.load()) : { red: {}, gerda: {} };
  let gerda = null, red = null, frame = null, held = null, base = new V3();      // (gerda: whoever's giving it; red: whoever's across the lap)

  // ── The session ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const pain = S.createPain({ tolerance: 0.9, resilience: 0.65 });
  const st = { implement: 'hand', pace: 1, strength: 1, side: 'alt', nextSide: 'R', skirt: 'down', drawers: 'up', marks: { L: 0, R: 0 },
    hits: 0, ended: false, red: false, peak: 0, swing: null, runLeft: 0, sound: true, last: null, armed: true, dt: 0.016 };
  const J = { kick: 0, kickSide: 'R', t: 0, flick: 0 };
  let dirty = true, exprShown = null;
  const listeners = [], say = (type, data) => listeners.forEach(f => f(type, data));
  const cushion = () => {
    const c = S.PAIN.CUSHION, worn = st.skirt === 'down' ? [c.skirt, c.drawers] : st.drawers === 'up' ? [c.drawers] : [];
    return 1 - worn.reduce((left, x) => left * (1 - x), 1);
  };
  const bandIndex = () => { const d = pain.distress(); return d < 0.3 ? 0 : d < 0.6 ? 1 : d < 0.9 ? 2 : d < 1 ? 3 : d < 1.5 ? 4 : 5; };
  const canStrike = () => !st.ended && (st.noHarsh || !pain.tooHarsh);      // (noHarsh: a scripted correction, which only her word stops)
  const thwack = power => { if (st.sound && root.GameAudio) root.GameAudio.thwack(power, st.skirt === 'down' || st.drawers === 'up'); };
  const voice = (power, band) => { if (st.sound && root.GameAudio) root.GameAudio.voice(power, band, false, 1, opts.pitch || 215); };

  function smack() { if (!canStrike() || st.swing) return false; st.swing = { phase: 'lift', t: 0, side: pickSide(), waited: 0 }; return true; }
  function pickSide() { const s = st.side === 'alt' ? st.nextSide : st.side; if (st.side === 'alt') st.nextSide = st.nextSide === 'R' ? 'L' : 'R'; return s; }
  function impact(sw) {
    const impl = implOf(st.implement), tender = (st.marks.L + st.marks.R) / 2;
    const hit = pain.hit({ implement: st.implement, strength: st.strength, speed: st.pace, raised: sw.waited, tender, cushion: cushion() });
    const gain = 0.01875 * impl.mark * st.strength;
    st.marks[sw.side] = 1 - (1 - st.marks[sw.side]) * (1 - gain);
    st.hits++; st.peak = Math.max(st.peak, pain.distress()); st.last = hit;
    J.kick = Math.max(J.kick, hit.reaction); J.kickSide = sw.side; J.flick = FLICKER;
    thwack(hit.reaction); voice(hit.reaction, bandIndex()); dirty = true;
    say('hit', { hit, side: sw.side, distress: pain.distress(), band: BANDS[bandIndex()], hits: st.hits });
    if (pain.tooHarsh && !st.noHarsh) { st.runLeft = 0; say('tooHarsh', {}); }
  }
  // The swing's phases. `from` and `to` name the arm's poses (rest, raised, contact), `e` how far between them.
  function advance(dt) {
    const sw = st.swing; if (!sw) return;
    sw.t += dt * st.pace;
    const go = (phase) => { sw.phase = phase; sw.t = 0; };
    switch (sw.phase) {
      case 'lift': if (sw.t >= TIMES.lift) go('hold'); break;
      case 'hold': sw.waited = sw.t; if (sw.t >= TIMES.hold) { if (st.ended) go('back'); else go('strike'); } break;
      case 'strike': if (sw.t >= TIMES.strike) { go('contact'); impact(sw); } break;
      case 'contact': if (sw.t >= TIMES.contact) { if (st.runLeft > 0 && canStrike()) { st.runLeft--; sw.side = pickSide(); sw.waited = 0; go('rise'); } else go('back'); } break;
      case 'rise': if (sw.t >= TIMES.lift) go('hold'); break;
      case 'back': if (sw.t >= TIMES.back) { st.swing = null; say('rest', { hits: st.hits }); } break;
    }
  }
  function armPhase() {
    const sw = st.swing; if (!sw) return { from: 'rest', to: 'rest', e: 1 };
    const k = x => clamp(sw.t / x, 0, 1);
    switch (sw.phase) {
      case 'lift': return { from: 'rest', to: 'raised', e: ease(k(TIMES.lift)), arc: true };
      case 'hold': return { from: 'raised', to: 'raised', e: 1 };
      case 'strike': { const x = k(TIMES.strike); return { from: 'raised', to: 'contact', e: x * x, arc: true }; }      // (accelerating into the skin)
      case 'contact': return { from: 'contact', to: 'contact', e: 1 };
      case 'rise': return { from: 'contact', to: 'raised', e: ease(k(TIMES.lift)), arc: true };
      case 'back': return { from: 'contact', to: 'rest', e: ease(k(TIMES.back)) };
    }
    return { from: 'rest', to: 'rest', e: 1 };
  }

  // ── Building the pair ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const springs = {};
  function build() {
    if (gerda) stage.remove(gerda.root); if (frame) stage.remove(frame);
    gerda = T.make(GIVER, looks[GIVER] || {}, { seated: true }); T.sit(gerda, seatY); stage.add(gerda.root);
    held = null; hold();
    red = T.make(SUBJ, looks[SUBJ] || {}, { lying: true }); frame = new THREE.Group(); frame.add(red.root); stage.add(frame);
    red.root.position.y = -T.DIM.hipY * red.scaleW;              // (her hip joint at the frame's origin)
    const qx = new Q().setFromAxisAngle(new V3(1, 0, 0), Math.PI / 2), qy = new Q().setFromAxisAngle(new V3(0, 1, 0), Math.PI / 2), qz = new Q().setFromAxisAngle(new V3(0, 0, 1), PITCH);
    frame.quaternion.copy(qz).multiply(qy).multiply(qx);          // her head along world +x, her front facing down, tipped head-down
    // Where she lies: hips above Gerda's right thigh, a little past its middle, her belly on the lap.
    gerda.root.updateMatrixWorld(true);
    const hip = gerda.thighR.getWorldPosition(new V3()), knee = gerda.kneeR.getWorldPosition(new V3());
    const lapTop = lerp(hip.y, knee.y, 0.6) + 2.35 * gerda.scaleW;            // (the top of her thigh, under the drape of her skirt and apron)
    base.set(hip.x - 0.9, lapTop + 2.35 * red.scaleW + 0.2, lerp(hip.z, knee.z, 0.6));
    frame.position.copy(base);
    for (const k of ['tL', 'tR', 'kL', 'kR', 'nx', 'ny', 'aL', 'aR', 'eL', 'eR', 'zL', 'zR', 'tz', 'hop', 'hx']) springs[k] = spring(16, 0.5);
    armOff.L = { x: 0, z: 0, e: 0, way: -1 }; armOff.R = { x: 0, z: 0, e: 0, way: -1 };
    if (st_) { st_.cast(gerda); st_.cast(red); }
    red.breath = 0.6; dirty = true; exprShown = null;
    poseRed(0, true);
  }

  // What's in the giver's hand: the implement's model, made when it's first wanted.
  function hold() {
    const want = st.implement !== 'hand' && implOf(st.implement) !== IMPL_HAND ? st.implement : null;
    if (held && held.userData.id === want) return;
    if (held) { gerda.handR.remove(held); held = null; }
    if (want) { held = root.Implements.model(want, gerda.palm.R); held.userData.id = want; held.position.y = -0.5; gerda.handR.add(held); }
  }
  // ── Red: hanging off the edge of the lap; the last smack (k), her distress (d) and her wriggle (w) work on her through springs. ──
  // ── Keeping her arms out of things ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  const armOff = {};
  // How far an arm, posed at (swing ax, spread az outward, elbow e), would be inside anything: balls along the upper arm, the forearm and the hand.
  function armPen(s, ax, az, e) {
    const r = red, arm = r['arm' + s], elbow = r['elbow' + s], hand = r['hand' + s], sx = s === 'L' ? 1 : -1, sc = red.scaleW;
    const keep = [arm.rotation.x, arm.rotation.z, elbow.rotation.x];
    arm.rotation.set(ax, 0, sx * (0.25 + az)); elbow.rotation.set(e, 0, 0); arm.updateMatrixWorld(true);
    const pts = [[elbow, 0, 2.2, 0.85], [elbow, 0, 0, 0.75], [hand, 0, 2.2, 0.6], [hand, 0, 0, 0.55], [hand, 0, -1.3, 0.5]];
    let pen = 0;
    for (const [b, x, y, rad] of pts) {
      const p = b.localToWorld(new V3(x, y, 0)), rr = rad * sc;
      pen += gerda.penetration(p, rr) + chair.penetration(p, rr) + Math.max(0, rr - (p.y - FLOOR));
    }
    arm.rotation.set(keep[0], 0, keep[1]); elbow.rotation.set(keep[2], 0, 0); arm.updateMatrixWorld(true);
    return pen;
  }
  // The offset to lay on an arm's pose so that it's clear: none if it already is (eased back to none), otherwise the nearest clear one, searched
  // out along each way it can go, keeping to the way it went last time unless another is clearly nearer.
  const WAYS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1], [0.7, 0.7, 0], [-0.7, 0.7, 0]];
  function armClear(s, ax, e, dt) {
    const o = armOff[s], k = 1 - Math.exp(-dt * 6);
    let want = { x: 0, z: 0, e: 0 };
    if (armPen(s, ax, 0, e) > 0) {
      let best = null;
      WAYS.forEach(([wx, wz, we], i) => {
        for (let a = 0.06; a <= 1.4; a += 0.06) {
          const x = wx * a, z = wz * a, de = Math.min(-e, we * a);
          if (armPen(s, ax + x, z, e + de) <= 0) { const cost = a + (i === o.way ? 0 : 0.15); if (!best || cost < best.cost) best = { cost, i, x, z, e: de }; break; }
        }
      });
      if (best) { o.way = best.i; want = best; }
    } else o.way = -1;
    o.x = lerp(o.x, want.x, k); o.z = lerp(o.z, want.z, k); o.e = lerp(o.e, want.e, k);
    return o;
  }

  function poseRed(dt, snap) {
    const k = J.kick, d = clamp(pain.distress(), 0, 1.5), dd = Math.min(1, d), t = J.t, mL = J.kickSide === 'L' ? 1 : 0.4, mR = J.kickSide === 'R' ? 1 : 0.4;
    const w = Math.sin(t * 7) * 0.06 * dd + Math.sin(t * 4.3) * 0.04 * dd;
    // Her arms hang: whatever way her body lies, they fall straight toward the floor (the angle from her shoulders that points down), the elbows
    // all but straight, swinging only as she kicks and wriggles.
    const dl = new V3(0, -1, 0).applyQuaternion(red.torso.getWorldQuaternion(new Q()).invert()), hang = Math.atan2(-dl.z, -dl.y);
    const target = {
      tL: -1.0 + k * 0.6 * mL + w, tR: -1.0 + k * 0.6 * mR - w,
      kL: 0.55 + 0.7 * k * mL + 1.2 * Math.max(0, w), kR: 0.55 + 0.7 * k * mR + 1.2 * Math.max(0, -w),
      nx: -0.25 - 0.45 * k + 0.08 * dd * Math.sin(t * 3.1), ny: -0.8 + 0.12 * Math.sin(t * 2.3) * dd,
      aL: hang - 0.3 * k + Math.sin(t * 5) * 0.08 * dd, aR: hang - 0.3 * k + Math.sin(t * 5 + 1.7) * 0.08 * dd,
      eL: -0.12 - 0.35 * k, eR: -0.12 - 0.35 * k, tz: 0.06 * dd * Math.sin(t * 5.2), hop: 0.55 * k, hx: 0.05 * k * (J.kickSide === 'L' ? 1 : -1),
    };
    // Her arms are kept out of whatever is around them (Gerda's skirt, the chair, the floor): if the pose they're going to would put any part of an
    // arm inside something, it moves to the nearest pose that's clear (swung, spread or straightened), and the springs carry them there smoothly.
    if (!snap) for (const s of ['L', 'R']) { const o = armClear(s, target['a' + s], target['e' + s], dt); target['a' + s] += o.x; target['z' + s] = o.z; target['e' + s] += o.e; }
    else { target.zL = target.zR = 0; }
    const v = {}; for (const key in target) v[key] = snap ? (springs[key].x = target[key]) : springs[key].to(target[key], dt);
    const r = red;
    r.thighL.rotation.set(v.tL, 0, 0.1); r.thighR.rotation.set(v.tR, 0, -0.1);
    r.kneeL.rotation.set(v.kL, 0, 0); r.kneeR.rotation.set(v.kR, 0, 0);
    r.ankleL.rotation.set(0.55 + 0.2 * v.kL, 0, 0); r.ankleR.rotation.set(0.55 + 0.2 * v.kR, 0, 0);
    r.neck.rotation.set(v.nx, v.ny, 0); r.head.rotation.set(0, 0, 0);
    r.armL.rotation.set(v.aL, 0, 0.25 + v.zL); r.armR.rotation.set(v.aR, 0, -0.25 - v.zR);
    r.elbowL.rotation.set(v.eL, 0, 0); r.elbowR.rotation.set(v.eR, 0, 0); r.handL.rotation.set(0.2, 0, 0); r.handR.rotation.set(0.2, 0, 0);
    r.torso.rotation.set(0.04, 0, v.tz); r.hips.rotation.set(0, 0, v.hx);
    r.followThighs();       // (her seat rolls round with her legs before Gerda's hand is aimed at it)
    frame.position.set(base.x, base.y + v.hop, base.z);
    frame.updateMatrixWorld(true);
  }

  // ── Gerda: the torso by the swing, the left hand on Red's back, the right arm through its poses. ──
  const world = o => o.getWorldPosition(new V3());
  const intoSkin = () => new V3(0, 0, 1).applyQuaternion(red.seat.getWorldQuaternion(new Q())).normalize();
  // A hand (or the implement in it) laid flat on a point: where its wrist must be and how it is turned.
  function handOn(Tp, nIn, dir, reach, half) {
    const sc = gerda.scaleW, d = dir.clone().addScaledVector(nIn, -dir.dot(nIn)).normalize();
    return { W: Tp.clone().addScaledVector(nIn, -half * sc).addScaledVector(d, -reach * sc), q: basis(nIn.clone().multiplyScalar(gerda.palm.R), d.clone().negate()) };
  }
  // Where the hand lands: the top of the curve of the cheek struck, whatever is over it (skirt, drawers or skin), found by dropping a line from
  // above the cheek's middle onto the first thing it meets; the palm comes down into it mostly from above, a little along the seat's own
  // way into the skin. (Worked out once a frame.)
  const ray = new THREE.Raycaster(), crowns = {}; let crownT = -1;
  function crown(side) {
    if (crownT !== J.t) { crownT = J.t; for (const k in crowns) delete crowns[k]; }
    if (crowns[side]) return { p: crowns[side].p.clone(), n: crowns[side].n.clone() };
    const mid = side === 'C' ? world(red.cheekC.L).lerp(world(red.cheekC.R), 0.5) : world(red.cheekC[side]);
    const nIn = new V3(0, -1, 0).multiplyScalar(0.75).addScaledVector(intoSkin(), 0.25).normalize();
    ray.set(mid.clone().addScaledVector(nIn, -12 * red.scaleW), nIn); ray.far = 24 * red.scaleW;
    const shown = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
    const hit = ray.intersectObjects(red.meshes, false).find(h => shown(h.object));
    const c = { p: hit ? hit.point : world(red.rear[side === 'C' ? 'C' : side]), n: nIn };
    crowns[side] = c; return { p: c.p.clone(), n: c.n.clone() };
  }
  function armPose(name) {
    const impl = implOf(st.implement), reach = impl.at ? 0.5 + impl.at : 0.85, half = impl.at ? impl.half : 0.28;
    const nIn = intoSkin(), dir = new V3(0.75, 0, 0.66);
    if (name === 'raised') {
      const sh = world(gerda.armR), sc = gerda.scaleW;
      return { W: sh.add(new V3(-2.0, 4.0, 1.6).multiplyScalar(sc)), q: basis(new V3(0.15, -0.55, 1).normalize().multiplyScalar(gerda.palm.R), new V3(-0.2, -1, -0.3)), pole: new V3(-0.75, 0.1, -0.6) };
    }
    if (name === 'rest') { const Tp = crown('C').p.addScaledVector(nIn, -HOVER); return Object.assign(handOn(Tp, nIn, dir, reach, half), { pole: new V3(-0.6, -0.45, -0.5) }); }
    const side = st.swing ? st.swing.side : 'C', c = crown(side);
    return Object.assign(handOn(c.p, c.n, dir, reach, half), { pole: new V3(-0.6, -0.3, -0.5) });
  }
  function poseGerda() {
    const g = gerda, ph = armPhase(), side = st.swing ? st.swing.side : 'L';
    const torsoOf = n => n === 'contact' ? TORSO[side === 'R' ? 'contactR' : 'contactL'] : TORSO[n];
    const ta = torsoOf(ph.from), tb = torsoOf(ph.to);
    g.torso.rotation.set(lerp(ta[0], tb[0], ph.e), lerp(ta[1], tb[1], ph.e), lerp(ta[2], tb[2], ph.e));
    g.neck.rotation.set(0.16, 0.08 + 0.1 * Math.sin(J.t * 0.4), 0); g.head.rotation.set(0.06, 0, 0);
    g.root.updateMatrixWorld(true);
    // Left hand: flat between her shoulder blades, fingers across her back.
    const nBack = new V3(0, 0, 1).applyQuaternion(red.torso.getWorldQuaternion(new Q())).normalize();
    const lh = (() => { const d = new V3(0, 0, 1).addScaledVector(nBack, -nBack.z).normalize(); return { W: world(red.upperBack).addScaledVector(nBack, -0.28 * g.scaleW).addScaledVector(d, -0.85 * g.scaleW), q: basis(nBack.clone().multiplyScalar(g.palm.L), d.clone().negate()) }; })();
    armIK(g, 'L', lh.W, new V3(0.55, -0.5, -0.45)); setWorldQuat(g.handL, lh.q);
    // Right arm: between two of its poses; down through an arc that swings out and over, so the hand comes in from above.
    const A = armPose(ph.from), B = ph.from === ph.to ? A : armPose(ph.to), e = ph.e;
    let W = A.W.clone().lerp(B.W, e);
    if (ph.arc) W.add(new V3(-0.6, 1.6, -0.2).multiplyScalar(4 * e * (1 - e) * g.scaleW));
    armIK(g, 'R', W, A.pole.clone().lerp(B.pole, e).normalize());
    setWorldQuat(g.handR, A.q.clone().slerp(B.q, e));
    hold(); if (held) held.visible = st.armed;
  }

  function repaint() {
    red.setDress({ skirt: st.skirt, drawers: st.drawers, marks: st.marks });
    dirty = false;
  }

  // ── Cameras ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const VIEWS = {
    side: () => ({ pos: new V3(-3, 19, 64), look: new V3(-2, 11, 4) }),
    behind: () => ({ pos: new V3(-50, 24, 18), look: new V3(-4, 11, 5) }),
    giver: () => ({ pos: new V3(-7, 30, -11), look: new V3(-3, 12, 6) }),
    top: () => ({ pos: new V3(-3, 62, 9), look: new V3(-3, 10, 6) }),
    face: () => ({ pos: new V3(15, 4, 24), look: new V3(7.5, 8.5, 4.5) }),
    corrector: () => { const h = world(gerda.headGroup); return { pos: h.clone().add(new V3(4, -3, 22)), look: h.clone().add(new V3(0, -1.2, 0)) }; },      // (the corrector's face, from in front)
  };
  function view_(name, ms) { const v = VIEWS[name](); if (st_) st_.go(v.pos, v.look, ms); return v; }

  // ── Each frame ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  function update(dt) {
    st.dt = dt; J.t += dt; J.kick *= Math.exp(-dt * 3.2);
    advance(dt);
    pain.update(dt, !!(st.swing && st.swing.phase === 'contact'));
    // (bands: composed, flinching, struggling, close to the edge, past it, too harsh)
    // (once they've reached the edge, crying, for the rest of it)
    const b = bandIndex(), base = st.peak >= 1 || b >= 4 ? 3 : b === 0 ? 0 : b === 1 ? 1 : 2; J.flick = Math.max(0, J.flick - dt);
    const flick = base < 3 && J.flick > 0, face = FACE[flick ? base + 1 : base];
    if (face !== exprShown) { red.setExpr(face, flick ? 28 : 9); exprShown = face; }      // (the flicker snaps on; the face eases back)
    if (dirty) repaint();
    poseRed(dt); poseGerda();
    red.tick(dt); gerda.tick(dt);
  }

  const api = {
    stage, pain, st, VIEWS, BANDS, implOf,
    get redRig() { return red; }, get gerda() { return gerda; }, get giverRig() { return gerda; }, get subjectRig() { return red; }, get rear() { return red.rear; }, get stg() { return st_; },      // (her rig is redRig; lap.rose() is the safe word)
    smack,
    run(n) { st.runLeft = Math.max(0, (n || 1) - 1); return smack(); },
    // Red: everything stops at once. Nothing more is struck, whatever was queued; the arm comes back to rest.
    // Her name, said under it: she's Rose again, and everything stops at once.
    rose() { st.rose = true; st.ended = true; st.runLeft = 0; if (st.swing && st.swing.phase !== 'contact') { st.swing.phase = 'back'; st.swing.t = 0; } say('rose', { hits: st.hits }); },
    end() { if (!st.ended) { st.ended = true; st.runLeft = 0; say('end', { hits: st.hits, peak: st.peak }); } },
    halt() { st.runLeft = 0; },      // (a run stopped after the smack in hand)
    clearMarks() { st.marks = { L: 0, R: 0 }; dirty = true; },
    canStrike, running: () => st.runLeft > 0,
    // A check-in (amber, where the house uses traffic lights): taken up by the script between runs (js/discipline.js).
    amber() { if (!st.ended) { st.amber = true; say('amber', { hits: st.hits }); } },
    set(o) { for (const k in o) st[k] = o[k]; if (st.skirt === 'down') st.drawers = 'up'; dirty = true; },       // (her drawers come down only with her skirt lifted)
    setLooks(l) { looks = L ? L.clean(l) : l; build(); },
    get looks() { return looks; },
    busy: () => !!st.swing || st.runLeft > 0,
    band: () => BANDS[bandIndex()], bandIndex,
    on(f) { listeners.push(f); },
    update, view: view_,
    start() { if (st_) st_.start(update); },
    stop() { if (st_) st_.stop(); },
    stageView: st_,
  };
  build(); update(0.016);
  return api;
}

root.Lap = { create, BANDS, implOf };
})(typeof window !== 'undefined' ? window : globalThis);
