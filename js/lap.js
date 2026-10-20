// Red Lessons — over the knee. Gerda seated on a plain chair; Jack face down across her lap, hips over her right knee, head and arms toward the
// floor on her left. This is the discipline engine of Climbing Toward Consequence (js/lap.js there) cut down to that one position, with Jack always
// at his full size: the shrinking, the second set of poses made at half his size and the blend between them are gone. Gerda's hand-tuned poses
// (the 100% set of that game's pose file) are baked in, and her arm is solved every frame so the hand, or the paddle's blade, lands on the middle
// of the cheek struck.
//
//  • Jack's frame across her lap (tipped head-down by PITCH), at 95% of the model's scale, as in that game;
//  • the glutes block, hinged at the back of his hips, bridging his back and his folded thighs; it carries his trousers, drawers or bare skin, and the marks;
//  • Gerda's right arm: shoulder, elbow and wrist, lifted to a raised pose that keeps clear of her head; her left hand rests between his shoulder blades;
//  • the pain model (js/pain.js), the bands of distress that drive his face, kicks and voice, the marks, and Red, which stops everything at once.
//
//   const lap = Lap.create(view, { looks })                 // standalone (lap.html): its own renderer, camera and orbit controls
//   const lap = Lap.create(null, { external: { scene } })   // embedded: adds its stage to another scene, which renders it
//   lap.smack(); lap.run(n); lap.red(); lap.set({ implement, trousers, drawers, strength, pace }); lap.setLooks(looks); lap.update(dt); lap.on(fn)
(function (root) {
'use strict';
const THREE = root.THREE, B = root.Blocky, S = root.Pain, L = root.Looks;
const V3 = THREE.Vector3, UP = new V3(0, 1, 0), DOWN = new V3(0, -1, 0);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, DEG = Math.PI / 180;
const srgb = hex => new THREE.Color(hex).convertSRGBToLinear();

const PITCH = -0.05;                 // his body tipped a little head-down
const LAP_Z = 6.5;                   // his hips lie this far forward of hers, over her knees
const JACK = 0.95;                   // Jack's size as a share of the model's own scale (Gerda is 1: about 105% of him)
const HOVER = 1.4;                   // at rest the hand hovers this far above the middle of his lower back
const TIMES = { lift: 0.45, hold: 0.15, strike: 0.09, contact: 0.32, back: 0.3 };
const IMPL = { hand: { name: 'Hand', mark: 1, paddle: false }, paddle: { name: 'Paddle', mark: 8 / 3, paddle: true } };
// Gerda's torso: nearly upright, leaning a touch back at rest and further as the arm goes up, and turning a little into a strike on his right cheek
// (the far one). These are Climbing Toward Consequence's hand-tuned pose file's values (the 100% set), baked in (radians: x lean, y turn, z roll).
const TORSO = { rest: [-0.035, 0, 0], raised: [-0.138, -0.044, -0.016], contactL: [-0.035, 0, 0], contactR: [-0.017, 0.157, 0.105] };
const BANDS = ['composed', 'flinching', 'struggling', 'close to the edge of resistance', 'past the edge of resistance', 'too harsh'];
const FACE = ['grin', 'wince', 'gritted', 'crying'];   // Jack's faces (Blocky.JACK_EXPR), by band

function create(view, opts) {
  opts = opts || {};
  // ── Stage ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const ext = opts.external || null;
  let renderer = null, scene, camera = null, controls = null;
  if (ext) scene = ext.scene;
  else {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.setPixelRatio(Math.min(2, root.devicePixelRatio || 1)); view.appendChild(renderer.domElement);
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1416);
    camera = new THREE.PerspectiveCamera(36, 1, 1, 600);
    controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = 12; controls.maxDistance = 160; controls.maxPolarAngle = Math.PI * 0.495;
    scene.add(new THREE.HemisphereLight(0xfff0e0, 0x30283a, 0.65));
    const sun = new THREE.DirectionalLight(0xfff0d8, 0.6); sun.position.set(40, 80, 60); scene.add(sun);
    const fc = document.createElement('canvas'); fc.width = fc.height = 16; const fx = fc.getContext('2d');
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { fx.fillStyle = ['#6a4a30', '#5e4028', '#745236'][(i * 7 + j * 13 + (j >> 2) * 5) % 3]; fx.fillRect(i, j, 1, 1); }
    const ft = new THREE.CanvasTexture(fc); ft.magFilter = ft.minFilter = THREE.NearestFilter; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(12, 12); ft.encoding = THREE.sRGBEncoding;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({ map: ft })); floor.rotation.x = -Math.PI / 2; floor.position.y = -B.CHAIR.legH; scene.add(floor);
  }
  const stage = new THREE.Group(); scene.add(stage);
  const LEGH = B.CHAIR.legH, chair = B.makeChair(); stage.add(chair);

  const HANDLE = 1.2, BLADE_L = 4.5, BLADE_W = 4, PALM_M = 6.7, PAD_M = 5.8, PAD_SIDE = 1.5 + HANDLE + BLADE_L / 2;
  // ── The cast ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  let looks = L ? L.clean(opts.looks || L.load()) : null;
  const jack = B.makeJack(), frame = new THREE.Group(); frame.add(jack.root); stage.add(frame);
  const qx = new THREE.Quaternion().setFromAxisAngle(new V3(1, 0, 0), Math.PI / 2), qy = new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), Math.PI / 2), qz = new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), PITCH);
  frame.quaternion.copy(qz).multiply(qy).multiply(qx);          // his local +y (head) along world +x, his front facing down
  frame.scale.setScalar(JACK); frame.position.set(-6 * JACK, 8.75 + 2 * JACK, LAP_Z);   // his torso's centre over the middle of her thighs, his belly on them
  Object.assign(jack.state, { hipY: 0, lift: 0 }); Object.assign(jack.target, { hipY: 0, lift: 0 });
  // The glutes block: hinged at the top edge, in the plane of his back at the bottom of the torso, tipped part-way toward his folded thighs.
  const glutes = B.makeGlutes(), seatTilt = new THREE.Group();
  seatTilt.position.set(0, 0.6, -2.55); seatTilt.rotation.x = -0.45;
  glutes.mesh.scale.set(1.1, 1.2, 1.2); glutes.mesh.position.set(0, -2.6, 2.58);
  seatTilt.add(glutes.mesh); jack.hips.add(seatTilt);
  const mk = (x, y, z, parent) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const rear = { L: mk(2, -2.4, -0.05, seatTilt), R: mk(-2, -2.4, -0.05, seatTilt), C: mk(0, -2.4, -0.05, seatTilt) }, upperBack = mk(0, 10, -2, jack.torso);

  // Gerda, seated: her shins lengthened to reach the floor below the chair.
  const giver = B.makeGerda(looks ? looks.gerda.outfit : 'Work'); stage.add(giver.root);
  for (const sh of [giver.legL, giver.legR].map(l => l.knee.children[0])) { sh.scale.y = (6 + LEGH) / 6; sh.position.y = -3 * sh.scale.y; }
  B.setPose(giver, 'sit'); Object.assign(giver.state, B.POSES.sit);
  // The paddle: a short handle out of the side of her forearm near its end, and a small rounded blade.
  const tool = new THREE.Group(); tool.position.set(1.5, -PAD_M, 0); tool.rotation.z = Math.PI / 2; giver.wrist.add(tool);
  const paddle = makePaddle(); paddle.visible = false; tool.add(paddle);
  giver.after = poseGiver;
  function makePaddle() {
    const g = new THREE.Group(), wood = c => new THREE.MeshLambertMaterial({ color: srgb(c) });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, HANDLE + 0.2, 12), wood(0x7a4e26)); handle.position.y = -(HANDLE + 0.2) / 2; g.add(handle);
    const w = BLADE_W, l = BLADE_L, rad = 1.2, x0 = -w / 2, x1 = w / 2, y1 = -HANDLE, y0 = y1 - l, sh = new THREE.Shape();
    sh.moveTo(x0 + rad, y0); sh.lineTo(x1 - rad, y0); sh.quadraticCurveTo(x1, y0, x1, y0 + rad); sh.lineTo(x1, y1 - rad); sh.quadraticCurveTo(x1, y1, x1 - rad, y1);
    sh.lineTo(x0 + rad, y1); sh.quadraticCurveTo(x0, y1, x0, y1 - rad); sh.lineTo(x0, y0 + rad); sh.quadraticCurveTo(x0, y0, x0 + rad, y0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 2, curveSegments: 8 }); geo.translate(0, 0, -0.4);
    g.add(new THREE.Mesh(geo, wood(0x9a6a38))); return g;
  }

  // ── The session ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const pain = S.createPain({ tolerance: 1, resilience: 0.7 });       // (Jack's, as in the Jack game)
  const st = { implement: 'hand', pace: 1, strength: 1, side: 'alt', nextSide: 'R', trousers: 'up', drawers: 'up', marks: { L: 0, R: 0 },
    hits: 0, ended: false, red: false, peak: 0, swing: null, runLeft: 0, gap: 0, sound: true, last: null, armed: true, aim: null, dt: 0.016 };
  const J = { kick: 0, kickSide: 'R', t: 0 };
  let dirty = true;
  const listeners = [], say = (type, data) => listeners.forEach(f => f(type, data));
  const cushion = () => {
    const c = S.PAIN.CUSHION, worn = st.trousers === 'up' ? [c.trousers, c.briefs] : st.drawers === 'up' ? [c.briefs] : [];
    return 1 - worn.reduce((left, x) => left * (1 - x), 1);
  };
  const bandIndex = () => { const d = pain.distress(); return d < 0.3 ? 0 : d < 0.6 ? 1 : d < 0.9 ? 2 : d < 1 ? 3 : d < 1.5 ? 4 : 5; };
  const canStrike = () => !st.ended && !pain.tooHarsh;
  const thwack = power => { if (st.sound && root.GameAudio) root.GameAudio.thwack(power, st.trousers === 'up'); };
  const voice = (power, band) => { if (st.sound && root.GameAudio) root.GameAudio.voice(power, band, false); };

  function smack() { if (!canStrike() || st.swing) return false; st.swing = { phase: 'lift', t: 0, side: pickSide(), waited: 0, tau: 1, hover: 1 }; return true; }
  function pickSide() { const s = st.side === 'alt' ? st.nextSide : st.side; if (st.side === 'alt') st.nextSide = st.nextSide === 'R' ? 'L' : 'R'; return s; }
  function impact(sw) {
    const impl = IMPL[st.implement], tender = (st.marks.L + st.marks.R) / 2;
    const hit = pain.hit({ implement: st.implement, strength: st.strength, speed: st.pace, raised: sw.waited, tender, cushion: cushion() });
    const gain = 0.01875 * impl.mark * st.strength;
    st.marks[sw.side] = 1 - (1 - st.marks[sw.side]) * (1 - gain);
    st.hits++; st.peak = Math.max(st.peak, pain.distress()); st.last = hit;
    J.kick = Math.max(J.kick, hit.reaction); J.kickSide = sw.side;
    thwack(hit.reaction); voice(hit.reaction, bandIndex()); dirty = true;
    say('hit', { hit, side: sw.side, distress: pain.distress(), band: BANDS[bandIndex()], hits: st.hits });
    if (pain.tooHarsh) { st.runLeft = 0; say('tooHarsh', {}); }
  }
  function advance(dt) {
    const sw = st.swing; if (!sw) return;
    sw.t += dt * st.pace; const ease = x => x * x * (3 - 2 * x);
    switch (sw.phase) {
      case 'lift': sw.tau = lerp(1, 0, ease(clamp(sw.t / TIMES.lift, 0, 1))); sw.hover = sw.tau; if (sw.t >= TIMES.lift) { sw.phase = 'hold'; sw.t = 0; } break;
      case 'hold': sw.tau = 0; sw.waited = sw.t; if (sw.t >= TIMES.hold) { sw.phase = 'strike'; sw.t = 0; } break;
      case 'strike': { const x = clamp(sw.t / TIMES.strike, 0, 1); sw.tau = x * x; if (x >= 1) { sw.tau = 1; sw.phase = 'contact'; sw.t = 0; impact(sw); } break; }
      case 'contact': sw.tau = 1; if (sw.t >= TIMES.contact) { if (st.runLeft > 0 && canStrike()) { st.runLeft--; sw.phase = 'rise'; sw.side = pickSide(); sw.waited = 0; } else sw.phase = 'back'; sw.t = 0; } break;
      case 'rise': sw.tau = lerp(1, 0, ease(clamp(sw.t / TIMES.lift, 0, 1))); if (sw.t >= TIMES.lift) { sw.phase = 'hold'; sw.t = 0; } break;
      case 'back': sw.tau = 1; sw.hover = ease(clamp(sw.t / TIMES.back, 0, 1)); if (sw.t >= TIMES.back) { st.swing = null; st.gap = 0.25; say('rest', { hits: st.hits }); } break;
    }
  }

  // ── The giver's arms ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const tmpA = new V3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion();
  const world = o => o.getWorldPosition(new V3());
  const aim = (obj, dirWorld) => { obj.parent.getWorldQuaternion(tmpQ).invert(); tmpA.copy(dirWorld).normalize().applyQuaternion(tmpQ); obj.quaternion.setFromUnitVectors(DOWN, tmpA); };
  // Two-bone reach (upper arm LU, forearm to the point m): where the elbow goes for the shoulder at S to bring m to M, bending toward the pole.
  const LU = 4, LF = 6, POLE = new V3(-0.7, 0.5, -0.5).normalize(), POLE_L = new V3(0.7, 0.5, -0.5).normalize();
  function twoBone(S_, M, m, pole, lu) {
    const LUx = lu || LU, v = M.clone().sub(S_), d = clamp(v.length(), Math.abs(LUx - m) + 0.05, LUx + m - 0.01), ud = v.normalize();
    const cosA = clamp((LUx * LUx + d * d - m * m) / (2 * LUx * d), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
    const PL = pole || POLE, pp = PL.clone().addScaledVector(ud, -PL.dot(ud)).normalize();
    const E = S_.clone().addScaledVector(ud, LUx * cosA).addScaledVector(pp, LUx * sinA), Mx = S_.clone().addScaledVector(ud, d);
    return { u1: E.clone().sub(S_).normalize(), f: Mx.clone().sub(E).normalize() };
  }
  const sideOf = f => { const v = new V3(1, 0, 0).addScaledVector(f, -f.x); return v.lengthSq() > 1e-4 ? v.normalize() : new V3(0, 0, 1); };
  // Set an arm (shoulder roll and elbow) to a two-bone solution; returns the pivot's rotation, the elbow's flexion and (for the hand or paddle) the forearm's twist.
  function armPose(g, key, ik, twistTo) {
    const right = key === 'armR', arm = g[key], elbow = right ? g.elbow : g.elbowL, wrist = right ? g.wrist : g.wristL;
    aim(arm, ik.u1);
    const h = new V3().crossVectors(ik.u1, ik.f); let psi = Math.acos(clamp(ik.u1.dot(ik.f), -1, 1));
    if (h.lengthSq() > 1e-6) {
      h.normalize().negate(); arm.updateMatrixWorld(true);
      const xw = new V3(1, 0, 0).applyQuaternion(arm.getWorldQuaternion(tmpQ2)), ang = Math.atan2(xw.clone().cross(h).dot(ik.u1), xw.dot(h));
      arm.parent.getWorldQuaternion(tmpQ).invert(); arm.quaternion.premultiply(tmpQ2.setFromAxisAngle(ik.u1.clone().applyQuaternion(tmpQ), ang));
    } else psi = 0;
    elbow.rotation.set(-psi, 0, 0); wrist.rotation.set(0, 0, 0); g.root.updateMatrixWorld(true);
    const fw = new V3(0, -1, 0).applyQuaternion(wrist.getWorldQuaternion(tmpQ2));
    if (fw.dot(ik.f) < 0.999) { elbow.rotation.x = psi; g.root.updateMatrixWorld(true); }
    let omega = 0;
    if (twistTo) {
      const xw = new V3(1, 0, 0).applyQuaternion(wrist.getWorldQuaternion(tmpQ2));
      omega = -Math.atan2(xw.clone().cross(twistTo.v).dot(ik.f), xw.dot(twistTo.v));
      if (twistTo.either) { if (omega > Math.PI / 2) omega -= Math.PI; else if (omega < -Math.PI / 2) omega += Math.PI; }
    }
    return { q: arm.quaternion.clone(), psi: elbow.rotation.x, omega };
  }
  const segD = (a, b, c) => { const ab = b.clone().sub(a), t = clamp(c.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1); return a.clone().addScaledVector(ab, t).distanceTo(c); };
  // Of the elbow's places about the line from shoulder to target: clear of Gerda's own head, laying the forearm flattest on his skin (when n is given), and nearest the usual one.
  function flat(S_, M, m, n, headAt) {
    const ud = M.clone().sub(S_).normalize(); let best = null;
    for (let a = -180; a <= 180; a += 10) {
      const ik = twoBone(S_, M, m, POLE.clone().applyAxisAngle(ud, a * DEG)), E = S_.clone().addScaledVector(ik.u1, LU), clear = Math.min(segD(S_, E, headAt), segD(E, M, headAt));
      const cost = (n ? Math.abs(ik.f.dot(n)) : 0) + 0.25 * Math.abs(a) / 180 + (E.y < M.y + 1 ? 2 : 0) + Math.max(0, 7.5 - clear) * 0.8;
      if (!best || cost < best.cost) best = { cost, ik };
    }
    return best.ik;
  }
  const turnBetween = (qa, qb) => { const aa = new V3(0, -1, 0).applyQuaternion(qa), ab = new V3(0, -1, 0).applyQuaternion(qb), sw = new THREE.Quaternion().setFromUnitVectors(aa, ab), r = qb.clone().multiply(sw.multiply(qa).invert()); let t = 2 * Math.atan2(r.x * ab.x + r.y * ab.y + r.z * ab.z, r.w); if (t > Math.PI) t -= 2 * Math.PI; if (t < -Math.PI) t += 2 * Math.PI; return Math.abs(t); };

  function poseGiver(g) {
    for (const l of [g.legL, g.legR]) { l.thigh.rotation.y = 0; l.knee.rotation.y = 0; l.knee.rotation.z = 0; }
    const sw = st.swing, impl = IMPL[st.implement], tau = sw ? sw.tau : 1, hover = sw ? (sw.hover || 0) : 1;
    // The aim: at rest, the middle of his lower back (lifted by HOVER); in a swing, the cheek struck. It eases from one to the other.
    const goal = world(rear[sw ? sw.side : 'C']); if (impl.paddle) goal.y += 0.4; goal.y += hover * HOVER;
    st.aim = !st.aim ? goal.clone() : st.aim.lerp(goal, 1 - Math.exp(-st.dt * 12));
    const T = st.aim.clone();
    // Torso: between the raised pose and the landed one (for the cheek struck) as the swing goes; at rest, the rest pose.
    const land = TORSO[sw && sw.side === 'R' ? 'contactR' : 'contactL'], from = sw ? TORSO.raised : TORSO.rest, tt = sw ? tau : 1, to = sw ? land : TORSO.rest;
    g.torso.rotation.order = 'YXZ'; g.torso.rotation.set(lerp(from[0], to[0], tt), lerp(from[1], to[1], tt), lerp(from[2], to[2], tt)); g.torso.position.z = -0.5;
    g.neck.rotation.set(0.62, 0.12, 0);
    g.root.updateMatrixWorld(true); jack.root.updateMatrixWorld(true);
    // Left hand: flat between his shoulder blades.
    armPose(g, 'armL', twoBone(world(g.armL), world(upperBack), LF, POLE_L), null);
    // Right arm: landed pose and raised pose, blended by how far the swing has come.
    const sh = world(g.armR), hand = !impl.paddle, reachM = impl.paddle ? PAD_M : PALM_M;
    const nIn = new V3(0, 0, 1).applyQuaternion(seatTilt.getWorldQuaternion(tmpQ)).normalize();
    const headAt = g.neck.localToWorld(new V3(0, 4, 0.5));
    let contact;
    if (hand) contact = flat(sh, T, reachM, nIn, headAt);
    else { let M = T; for (let it = 0; it < 4; it++) { contact = flat(sh, M, reachM, null, headAt); M = T.clone().addScaledVector(sideOf(contact.f), -PAD_SIDE); } }
    const pc = armPose(g, 'armR', contact, hand ? { v: nIn, either: true } : { v: sideOf(contact.f) });
    const ud = T.clone().sub(sh).normalize(), outward = sh.clone().sub(headAt); outward.y = 0; outward.normalize();
    const raisedAt = sh.clone().addScaledVector(ud.clone().multiplyScalar(0.35).addScaledVector(UP, 0.95).addScaledVector(outward, 0.6).normalize(), reachM * 0.95);
    let raisedIK = null, bestC = 1e9; const udr = raisedAt.clone().sub(sh).normalize();
    for (let a = -180; a <= 180; a += 15) {
      const ik = twoBone(sh, raisedAt, reachM, POLE.clone().applyAxisAngle(udr, a * DEG)), E = sh.clone().addScaledVector(ik.u1, LU), clear = Math.min(segD(sh, E, headAt), segD(E, raisedAt, headAt));
      const q = armPose(g, 'armR', ik, null).q, cost = 1.5 * turnBetween(pc.q, q) / Math.PI + 0.25 * Math.abs(a) / 180 + Math.max(0, 7.5 - clear) * 0.8;
      if (cost < bestC) { bestC = cost; raisedIK = ik; }
    }
    const pr = armPose(g, 'armR', raisedIK, hand ? { v: DOWN, either: true } : null);
    g.armR.quaternion.copy(pr.q).slerp(pc.q, tau);
    g.elbow.rotation.set(lerp(pr.psi, pc.psi, tau), 0, 0); g.wrist.rotation.set(0, lerp(pr.omega, pc.omega, tau), 0);
    paddle.visible = !!impl.paddle && st.armed;
    if (impl.paddle) {
      // Roll the blade about its length so that, at contact, its face lies on the angle of the seat block.
      tool.rotation.set(0, 0, Math.PI / 2); g.root.updateMatrixWorld(true); tool.getWorldQuaternion(tmpQ2);
      const lw = new V3(1, 0, 0).applyQuaternion(tmpQ2), zw = new V3(0, 0, 1).applyQuaternion(tmpQ2), want = nIn.clone().addScaledVector(lw, -nIn.dot(lw));
      if (want.lengthSq() > 1e-4) { want.normalize(); tool.rotation.set(Math.atan2(zw.clone().cross(want).dot(lw), zw.dot(want)) * tau, 0, Math.PI / 2); }
    }
  }

  // ── His body: hanging off the edge of her lap; the last smack (k), his distress (d) and his wriggle (w) work on it. ──
  jack.after = function (j) {
    const k = J.kick, d = clamp(pain.distress(), 0, 1.5), dd = Math.min(1, d), t = J.t, mL = J.kickSide === 'L' ? 1 : 0.45, mR = J.kickSide === 'R' ? 1 : 0.45;
    const w = Math.sin(t * 9) * 0.05 * dd + Math.sin(t * 5.3) * 0.03 * dd;
    j.legL.thigh.rotation.set(-0.96 + k * 0.9 * mL + w, 0, j.legL.sign * (0.12 + 0.2 * k * mL));
    j.legR.thigh.rotation.set(-0.96 + k * 0.9 * mR - w, 0, j.legR.sign * (0.12 + 0.2 * k * mR));
    j.legL.knee.rotation.set(0.6 + 0.6 * k * mL + 0.5 * Math.max(0, w), 0, 0); j.legR.knee.rotation.set(0.6 + 0.6 * k * mR + 0.5 * Math.max(0, -w), 0, 0);
    j.neck.rotation.set(-0.1 - 0.5 * k + 0.1 * dd * Math.sin(t * 4), -0.75 + 0.15 * Math.sin(t * 3) * dd, 0);
    j.armL.rotation.set(-2.14 - 0.25 * k + Math.sin(t * 7) * 0.08 * dd, 0, 0.12 + 0.1 * k); j.armR.rotation.set(-2.14 - 0.25 * k + Math.sin(t * 7 + 1.7) * 0.08 * dd, 0, -(0.12 + 0.1 * k));
    if (j.elbowL) { j.elbowL.rotation.set(-(0.35 + 0.25 * k + 0.1 * dd * Math.sin(t * 7)), 0, 0); j.elbow.rotation.set(-(0.35 + 0.25 * k + 0.1 * dd * Math.sin(t * 7 + 1.7)), 0, 0); }
    j.torso.rotation.set(0, 0, 0.06 * dd * Math.sin(t * 6));
  };
  function repaint() {
    const b = bandIndex(), expr = FACE[Math.min(3, Math.max(0, b - (b >= 3 ? 1 : 0)))], lj = looks ? looks.jack : { outfit: 'Outdoor' };
    const dress = { trousers: st.trousers, drawers: st.drawers, marks: st.marks, outfit: lj.outfit };
    if (L) L.paintJack(jack, lj, Object.assign({ expr, hitched: true, blush: b >= 1 }, dress));
    else { B.paintJackInto(jack.skin, Object.assign({ expr, hitched: true, blush: b >= 1 }, dress)); jack.tex.needsUpdate = true; }
    B.paintGlutesInto(glutes.skin, Object.assign({ colours: L ? L.jackColours(lj) : null }, dress)); glutes.tex.needsUpdate = true;
    jack.legL.ring.visible = jack.legR.ring.visible = st.trousers === 'down';
    dirty = false;
  }
  function setLooks(l) { if (!L) return; looks = L.clean(l); L.paintGerda(giver, looks.gerda); dirty = true; }

  // ── Cameras (standalone; the game frames its own shots from these). ──
  const VIEWS = {
    side: () => ({ pos: new V3(-2, 20, 92), look: new V3(-1, 10, 4) }),
    behind: () => ({ pos: new V3(-74, 30, 22), look: new V3(-4, 10, 5) }),
    giver: () => ({ pos: new V3(-5, 40, -12), look: new V3(-5, 10, 7) }),
    top: () => ({ pos: new V3(-4, 90, 8), look: new V3(-4, 8, 6) }),
    face: () => ({ pos: new V3(46, 14, 62), look: new V3(8, 6, 6) }),        // his face
  };
  function view_(name) { if (!camera) return VIEWS[name](); const v = VIEWS[name](); camera.position.copy(v.pos); controls.target.copy(v.look); controls.update(); return v; }
  function resize() { if (!renderer) return; const w = view.clientWidth, h = view.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  // ── Frame loop ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  function update(dt) {
    st.dt = dt; J.t += dt; J.kick = Math.max(0, J.kick - dt * 2.2);
    if (st.gap > 0) st.gap -= dt;
    if (!st.ended) advance(dt);
    pain.update(dt, !!(st.swing && st.swing.phase === 'contact'));
    if (dirty || Math.floor(J.t * 4) !== Math.floor((J.t - dt) * 4)) repaint();
    B.step(jack, dt); B.step(giver, dt);
    if (controls) controls.update();
  }
  let last = performance.now(), running = false;
  function loop(now) { if (!running) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); renderer.render(scene, camera); requestAnimationFrame(loop); }

  const api = {
    stage, jack, gerda: giver, pain, st, rear, seatTilt, VIEWS, IMPL, BANDS,
    smack, setLooks, get looks() { return looks; },
    run(n) { st.runLeft = Math.max(0, (n || 1) - 1); return smack(); },
    // Red: everything stops at once. Nothing more is struck, whatever was queued.
    red() { st.red = true; st.ended = true; st.runLeft = 0; if (st.swing) st.swing.phase = 'back'; say('red', { hits: st.hits }); },
    end() { st.ended = true; st.runLeft = 0; },
    set(o) { for (const k in o) st[k] = o[k]; if (st.trousers === 'up') st.drawers = 'up'; dirty = true; },       // (his drawers come down only once his trousers are down)
    busy: () => !!st.swing || st.runLeft > 0,
    band: () => BANDS[bandIndex()], bandIndex,
    on(f) { listeners.push(f); },
    update, view: view_,
    start() { if (!renderer) return; running = true; resize(); root.addEventListener('resize', resize); requestAnimationFrame(loop); },
    stop() { running = false; root.removeEventListener('resize', resize); if (renderer) renderer.dispose(); },
    renderer, camera,
  };
  setLooks(looks); repaint(); update(0.016);
  return api;
}

root.Lap = { create, IMPL, BANDS, JACK };
})(typeof window !== 'undefined' ? window : globalThis);
