// Red Lessons — the toon look (style test). Smooth, rounded characters with soft cel shading and a warm ink outline, in place of the blocky skins,
// after the concept art: the heroine in a green tunic, belt and pouches, tan trousers and tall laced boots, chestnut braids tied with red ribbon, and
// a red cloak edged in gold and stitched with stars.
// The joint layout matches js/blocky.js (root › hips › torso › neck; armL/armR › elbow › wrist; legL/legR { thigh › knee }) so the village and the
// over-the-knee scene can switch over without their posing code changing. A grown adult stands 30 units tall, as before.
//
// Proportions are an adult's throughout: about six and a half heads tall, a defined waist and hips, a woman's face (eyes at the middle of the head,
// a jaw, a soft but grown-up expression). The cloak changes her scale only; Toon.make('heroine') at any scale is the same woman.
//
//   const rig = Toon.make('heroine'); rig.cloak.show(true); rig.root.scale.setScalar(0.55);
(function (root) {
'use strict';
const THREE = root.THREE, V2 = THREE.Vector2, V3 = THREE.Vector3;
const srgb = h => new THREE.Color(h).convertSRGBToLinear();

// Three soft bands of light, as in a cosy console game.
let GRAD = null;
function gradient() {
  if (GRAD) return GRAD;
  const d = new Uint8Array([125, 125, 125, 195, 195, 195, 255, 255, 255]);
  GRAD = new THREE.DataTexture(d, 3, 1, THREE.RGBFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true;
  return GRAD;
}
const toon = (hex, extra) => new THREE.MeshToonMaterial(Object.assign({ color: srgb(hex), gradientMap: gradient() }, extra || {}));
const flat = hex => new THREE.MeshBasicMaterial({ color: srgb(hex) });
const INK = new THREE.MeshBasicMaterial({ color: srgb('#4a2c22'), side: THREE.BackSide });      // a warm brown ink, as in the concept art
// A mesh with an ink outline (the inverted hull: the same shape a touch larger, drawn from the inside in the ink colour).
function inked(geo, mat, w) {
  const g = new THREE.Group(), m = new THREE.Mesh(geo, mat); g.add(m);
  const o = new THREE.Mesh(geo, INK); o.scale.setScalar(1 + (w == null ? 0.05 : w)); g.add(o);
  g.userData.mesh = m; return g;
}
// A body part turned from a profile: [[radius, height], …], squashed front to back by depth.
function lathe(profile, depth, seg, phi0, phiLen) {
  if (profile[0][1] > profile[profile.length - 1][1]) profile = profile.slice().reverse();     // (bottom to top, so the faces point outward)
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new V2(r, y)), seg || 24, phi0 || 0, phiLen || Math.PI * 2); g.scale(1, 1, depth == null ? 0.72 : depth); g.computeVertexNormals(); return g;
}
const sphere = (r, sx, sy, sz) => { const g = new THREE.SphereGeometry(r, 22, 16); g.scale(sx || 1, sy || 1, sz || 1); return g; };
// A limb segment from 0 down to -len, tapering from r0 to r1, with rounded ends.
const limb = (len, r0, r1) => lathe([[0, 0.15], [r0 * 0.7, 0.05], [r0, -r0 * 0.4], [r1, -len + r1 * 0.4], [r1 * 0.7, -len - 0.05], [0, -len - 0.15]], 1, 16);
// A five-pointed star, flat, for the cloak's embroidery.
function starGeo(r) {
  const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i) s.lineTo(x, y); else s.moveTo(x, y); }
  return new THREE.ShapeGeometry(s);
}

// ── The people ──
const SPECS = {
  heroine: { skin: '#f7d6bc', skinSh: '#e6ad8e', blush: '#f0a090', hair: '#8a5030', hairHi: '#b4734a', hairDk: '#5e341c', eyes: '#6a4428', lips: '#c4646a',
    top: 'tunic', tunic: '#3f6b3c', tunicDk: '#2c5030', collar: '#e8dcc0', lower: 'trousers', trousers: '#d2bf98', trousersDk: '#b29e78', belt: '#6a4226', bracer: '#7a4c2a', boots: '#7a4a2a', bootsDk: '#5a3420',
    hairStyle: 'braids', ribbon: '#c42832', cloak: true },
  innkeeper: { skin: '#d6a07a', skinSh: '#b07a58', blush: '#c07a64', hair: '#2e1e18', hairHi: '#5a3c2c', hairDk: '#1a100c', eyes: '#4a3020', lips: '#9a4a4a',
    top: 'bodice', blouse: '#f0e8d8', bodice: '#2a5a5a', lower: 'skirt', skirt: '#5a3a2a', skirtDk: '#462c1e', belt: '#3a2618', boots: '#2a1a10', hairStyle: 'bun', apron: '#ece4d0' },
};

function make(id) {
  const S = SPECS[id], rig = { id, spec: S };
  const M = { skin: toon(S.skin), hair: toon(S.hair), hairHi: toon(S.hairHi), belt: toon(S.belt), boots: toon(S.boots) };
  const root_ = new THREE.Group(), hips = new THREE.Group(); hips.position.y = 15.5; root_.add(hips);
  rig.root = root_; rig.hips = hips;
  const torso = new THREE.Group(); hips.add(torso); rig.torso = torso;

  // ── Torso. From the hips (y 0) to the shoulders (about 8.6): hips, a waist, the ribcage, the shoulders.
  const BODY = [[0, -0.6], [3.2, -0.4], [3.5, 0.6], [3.0, 2.2], [2.55, 3.4], [2.9, 5.2], [3.2, 6.6], [3.3, 7.6], [2.6, 8.6], [1.0, 9.1], [0, 9.2]];
  if (S.top === 'tunic') {
    const tm = toon(S.tunic, { side: THREE.DoubleSide });
    // The tunic: over the shoulders and down to mid-thigh, belted at the waist, flaring a little below the belt; a darker band at the hem.
    torso.add(inked(lathe([[0, 9.25], [1.1, 9.15], [2.7, 8.72], [3.36, 7.7], [3.24, 6.6], [2.96, 5.2], [2.62, 3.4], [2.84, 2.1], [3.55, 0.6], [3.95, -1.6], [4.25, -3.7]], 0.7, 28), tm, 0.025));
    torso.add(new THREE.Mesh(lathe([[4.18, -3.3], [4.28, -3.75], [4.24, -3.8]], 0.7, 28), toon(S.tunicDk, { side: THREE.DoubleSide })));
    // The neckline: a cream undershirt showing in a shallow V at the throat.
    const v = new THREE.Mesh(new THREE.CircleGeometry(0.95, 3), toon(S.collar)); v.position.set(0, 8.5, 1.85); v.rotation.set(-0.35, 0, -Math.PI / 2); torso.add(v);
    // The figure under it: the bust, softened by the cloth.
    for (const sx of [-1, 1]) { const b = inked(sphere(1.15, 1, 0.9, 0.78), tm, 0.03); b.position.set(sx * 1.2, 5.55, 1.5); torso.add(b); }
    // A belt with a brass buckle, two pouches at the front of the hips and one at the side.
    torso.add(new THREE.Mesh(lathe([[2.72, 1.85], [2.66, 2.75]], 0.71, 28), M.belt));
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 0.3), toon('#d8b04a')); buckle.position.set(0, 2.3, 1.95); torso.add(buckle);
    for (const [x, z, ry, sc] of [[-1.85, 1.7, -0.45, 1], [1.85, 1.7, 0.45, 0.85], [3.0, 0.2, 1.4, 1.1]]) {
      const p = inked(new THREE.BoxGeometry(1.35 * sc, 1.45 * sc, 0.75), M.belt, 0.06); p.position.set(x, 1.15, z); p.rotation.y = ry; torso.add(p);
      const flap = new THREE.Mesh(new THREE.BoxGeometry(1.38 * sc, 0.5, 0.8), toon('#583420')); flap.position.set(x, 1.6, z); flap.rotation.y = ry; torso.add(flap);
    }
  } else {
    const bm = toon(S.bodice);
    torso.add(inked(lathe(BODY, 0.68), bm));
    torso.add(inked(lathe([[0, 6.7], [3.35, 6.8], [3.4, 7.7], [2.7, 8.7], [1.1, 9.15], [0, 9.25]], 0.7), toon(S.blouse), 0.03));
    for (let i = 0; i < 4; i++) { const x = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.2), toon('#e8d8a8')); x.position.set(0, 2.6 + i * 1.0, 2.25 + (i > 1 ? 0.1 : 0)); x.rotation.z = i % 2 ? 0.5 : -0.5; torso.add(x); }
    for (const sx of [-1, 1]) { const b = inked(sphere(1.25, 1, 0.9, 0.8), bm, 0.03); b.position.set(sx * 1.25, 5.6, 1.55); torso.add(b); }
    torso.add(new THREE.Mesh(lathe([[2.62, 2.0], [2.62, 2.7]], 0.69), M.belt));
  }
  if (S.lower === 'skirt') {
    const skirt = new THREE.Group(); hips.add(skirt); rig.skirt = skirt;
    skirt.add(inked(lathe([[2.7, 2.3], [3.6, 0.6], [4.6, -4], [5.6, -9], [6.2, -12.6], [6.0, -13.2]], 0.78, 28), toon(S.skirt, { side: THREE.DoubleSide }), 0.025));
    skirt.add(new THREE.Mesh(lathe([[6.08, -12.2], [6.22, -12.7], [6.02, -13.25]], 0.78, 28), toon(S.skirtDk)));
    if (S.apron) {
      const ag = new THREE.LatheGeometry([new V2(5.5, -8), new V2(4.8, -4), new V2(3.75, 0.4), new V2(2.75, 2.2)], 20, -Math.PI * 0.3, Math.PI * 0.6); ag.scale(1, 1, 0.8); ag.computeVertexNormals();
      skirt.add(inked(ag, toon(S.apron, { side: THREE.DoubleSide }), 0.015));
    }
  }

  // ── Neck and head. A woman's face, soft and warm: eyes at the middle of the head, a gentle jaw and chin, a small nose, a quiet smile.
  const neck = new THREE.Group(); neck.position.y = 9.0; torso.add(neck); rig.neck = neck;
  neck.add(inked(lathe([[0.85, -0.6], [0.78, 1.2], [0.82, 1.7]], 1, 14), M.skin, 0.06));
  const head = new THREE.Group(); head.position.y = 3.85; head.scale.setScalar(0.92); neck.add(head); rig.head = head;
  const HS = 1 / 0.92;            // (what is hung from the head, the braids, is laid out in the torso's units)
  head.add(inked(lathe([[0, -2.6], [0.65, -2.5], [1.35, -2.0], [1.82, -1.1], [2.05, -0.1], [2.12, 0.85], [1.96, 1.75], [1.4, 2.42], [0, 2.62]], 0.92, 28), M.skin, 0.035));
  for (const sx of [-1, 1]) { const ear = inked(sphere(0.42, 0.55, 1, 0.8), M.skin, 0.06); ear.position.set(sx * 2.05, -0.1, -0.2); head.add(ear); }
  const face = new THREE.Group(); head.add(face); rig.face = face;
  const eyeW = toon('#fdfaf4'), iris = flat(S.eyes), irisDk = new THREE.MeshBasicMaterial({ color: srgb(S.eyes).multiplyScalar(0.55) }), pupil = flat('#1e1210'), lash = flat('#3a2018'), shine = flat('#ffffff');
  for (const sx of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(sx * 0.8, -0.1, 1.68); e.rotation.y = sx * 0.3; face.add(e);
    e.add(new THREE.Mesh(sphere(0.44, 1.15, 0.72, 0.26), eyeW));
    const ir = new THREE.Mesh(sphere(0.28, 0.95, 1.08, 0.26), iris); ir.position.set(sx * -0.04, -0.03, 0.07); e.add(ir);
    const ird = new THREE.Mesh(sphere(0.26, 0.95, 0.45, 0.26), irisDk); ird.position.set(sx * -0.04, 0.15, 0.09); e.add(ird);
    const pu = new THREE.Mesh(sphere(0.11, 1, 1.1, 0.26), pupil); pu.position.set(sx * -0.04, -0.02, 0.12); e.add(pu);
    const h1 = new THREE.Mesh(sphere(0.075, 1, 1, 0.3), shine); h1.position.set(sx * -0.04 + 0.1, 0.12, 0.17); e.add(h1);
    const up = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.11, 0.14), lash); up.position.set(0, 0.31, 0.06); up.rotation.z = sx * -0.08; e.add(up);
    const corner = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.12), lash); corner.position.set(sx * 0.55, 0.25, 0.03); corner.rotation.z = sx * 0.4; e.add(corner);
    const brow = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 4, 10, Math.PI * 0.75), toon(S.hairDk)); brow.position.set(sx * 0.85, 0.42, 1.74); brow.rotation.set(0, sx * 0.3, Math.PI * 0.125); face.add(brow); rig['brow' + (sx < 0 ? 'R' : 'L')] = brow;
  }
  const nose = new THREE.Mesh(sphere(0.2, 1, 0.75, 0.9), toon(S.skinSh)); nose.position.set(0, -0.78, 1.9); face.add(nose);
  // A quiet smile: a short curve of the lip colour, turned up at the ends.
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.055, 4, 10, Math.PI * 0.62), flat(S.lips)); smile.position.set(0, -1.32, 1.76); smile.rotation.z = Math.PI + Math.PI * 0.19; face.add(smile); rig.mouth = smile;
  for (const sx of [-1, 1]) { const bl = new THREE.Mesh(sphere(0.4, 1.35, 0.5, 0.2), new THREE.MeshBasicMaterial({ color: srgb(S.blush), transparent: true, opacity: 0.32 })); bl.position.set(sx * 1.18, -0.75, 1.6); bl.rotation.y = sx * 0.55; face.add(bl); }

  // ── Hair. A cap of hair tipped back to the hairline, parted a little to one side, soft swoops falling over the temples, and either the braids
  // (from behind each ear, over the front of the shoulders, ribbons near the top) or a bun.
  const capGeo = new THREE.SphereGeometry(2.34, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const cap = inked(capGeo, M.hair, 0.03); cap.position.set(0, 0.55, -0.12); cap.rotation.x = -0.5; head.add(cap);
  const back = inked(sphere(2.15, 1, 1.1, 0.86), M.hair, 0.03); back.position.set(0, 0.05, -0.7); head.add(back);
  // The swoops of the fringe: two soft wings from the parting, the larger to her left, reaching the tops of the brows.
  for (const [x, rz, w, len, hi] of [[0.75, -0.55, 1.05, 1.65, false], [-0.85, 0.65, 0.9, 1.45, true]]) {
    const g = new THREE.SphereGeometry(1, 20, 12); g.scale(w, len, 0.42);
    const sw = inked(g, hi ? M.hairHi : M.hair, 0.04); sw.position.set(x, 1.45, 1.55); sw.rotation.set(-0.42, 0, rz); head.add(sw);
  }
  for (const sx of [-1, 1]) { const side = inked(sphere(0.62, 0.8, 1.9, 0.75), M.hair, 0.05); side.position.set(sx * 1.88, 0.15, 0.55); side.rotation.z = sx * 0.1; head.add(side); }
  const shineArc = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.09, 4, 24, Math.PI * 0.6), toon(S.hairHi)); shineArc.position.set(0.1, 1.85, 0.6); shineArc.rotation.set(-1.0, 0, Math.PI * 0.2); head.add(shineArc);
  if (S.hairStyle === 'braids') {
    for (const sx of [-1, 1]) {
      // In the torso's units, from behind the ear down over the front of the shoulder to the chest.
      const curve = new THREE.CatmullRomCurve3([[1.7, -0.9, -0.5], [2.15, -2.4, 0.3], [2.45, -4.2, 1.0], [2.5, -6.0, 1.55], [2.4, -7.6, 1.85]].map(([x, y, z]) => new V3(sx * x * HS, y * HS, z * HS)));
      for (let i = 0; i < 11; i++) { const t = i / 10, p = curve.getPoint(t), s = (0.62 - t * 0.18) * HS, k = inked(sphere(s, 1.05, 1.3, 0.92), i % 2 ? M.hairHi : M.hair, 0.05); k.position.copy(p); k.rotation.z = (i % 2 ? 0.4 : -0.4) * sx; head.add(k); }
      // A red ribbon near the top, tied in a bow; a soft tuft at the end.
      const at = curve.getPoint(0.12), bow = new THREE.Group(); bow.position.copy(at); bow.position.z += 0.35 * HS; head.add(bow);
      for (const bx of [-1, 1]) { const loop = inked(sphere(0.38 * HS, 1.3, 0.75, 0.5), toon(S.ribbon), 0.06); loop.position.x = bx * 0.42 * HS; loop.rotation.z = bx * 0.35; bow.add(loop); }
      const knot = new THREE.Mesh(sphere(0.2 * HS, 1, 1, 0.8), toon(S.ribbon)); bow.add(knot);
      const end = curve.getPoint(1), tuft = inked(sphere(0.42 * HS, 1, 1.5, 0.85), M.hair, 0.05); tuft.position.copy(end); tuft.position.y -= 0.75 * HS; head.add(tuft);
    }
  }
  if (S.hairStyle === 'bun') { const bun = inked(sphere(1.25, 1, 1, 1), M.hair, 0.04); bun.position.set(0, 1.4, -2.1); head.add(bun); }

  // ── Arms: shoulder › elbow › wrist, upper arm 4.6 and forearm 4.2. The tunic's sleeves to the wrist under leather bracers; or a blouse rolled to the elbow.
  for (const [key, sx] of [['armL', 1], ['armR', -1]]) {
    const sh = new THREE.Group(); sh.position.set(sx * 3.15, 8.0, 0); sh.rotation.order = 'ZXY'; torso.add(sh); rig[key] = sh; sh.userData.sign = sx;
    const tunic = S.top === 'tunic';
    sh.add(inked(limb(4.6, 1.05, 0.88), tunic ? toon(S.tunic) : toon(S.blouse), 0.05));
    const elbow = new THREE.Group(); elbow.position.y = -4.6; sh.add(elbow);
    const wrist = new THREE.Group(); elbow.add(wrist);
    if (tunic) {
      wrist.add(inked(limb(4.2, 0.84, 0.6), toon(S.tunic), 0.05));
      const br = inked(lathe([[0.78, -1.2], [0.86, -1.5], [0.74, -4.0], [0.66, -4.25]], 1, 14), toon(S.bracer), 0.05); wrist.add(br);       // the bracer, laced
      for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.1), flat('#d8c08a')); l.position.set(0, -1.9 - i * 0.7, 0.78); l.rotation.z = i % 2 ? 0.4 : -0.4; wrist.add(l); }
    } else {
      wrist.add(inked(limb(4.2, 0.78, 0.55), M.skin, 0.05));
    }
    const hand = inked(sphere(0.68, 0.78, 1.15, 0.52), M.skin, 0.06); hand.position.y = -4.75; wrist.add(hand);
    const thumb = inked(sphere(0.25, 1, 1.6, 1), M.skin, 0.08); thumb.position.set(sx * -0.0, -4.25, 0.45); thumb.rotation.x = 0.4; wrist.add(thumb);
    if (key === 'armR') { rig.elbow = elbow; rig.wrist = wrist; } else { rig.elbowL = elbow; rig.wristL = wrist; }
  }
  // ── Legs: hip › knee, thigh 7.0 and shin 7.3. Trousers tucked into tall laced boots with a turned-down cuff; or bare under a skirt, short boots.
  for (const [key, sx] of [['legL', 1], ['legR', -1]]) {
    const thigh = new THREE.Group(); thigh.position.x = sx * 1.6; thigh.rotation.order = 'ZXY'; hips.add(thigh);
    const trousers = S.lower === 'trousers';
    thigh.add(inked(limb(7.0, 1.6, 1.12), trousers ? toon(S.trousers) : M.skin, 0.04));
    const knee = new THREE.Group(); knee.position.y = -7.0; thigh.add(knee);
    knee.add(inked(limb(7.3, 1.12, 0.74), trousers ? toon(S.trousers) : M.skin, 0.04));
    if (trousers) {
      const boot = inked(lathe([[0, -7.75], [1.02, -7.65], [1.12, -6.6], [1.02, -4.2], [1.2, -2.2], [1.28, -1.6], [0, -1.6]], 1, 16), M.boots, 0.05); knee.add(boot);
      const cuff = inked(lathe([[1.3, -2.3], [1.42, -1.95], [1.36, -1.45]], 1, 16), toon(S.bootsDk), 0.05); knee.add(cuff);
      for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.07, 0.1), flat('#d8c08a')); l.position.set(0, -3.0 - i * 0.85, 1.12); l.rotation.z = i % 2 ? 0.45 : -0.45; knee.add(l); }
    } else {
      knee.add(inked(lathe([[0, -7.7], [1.0, -7.6], [1.15, -6.5], [1.12, -3.4], [1.22, -3.0], [0, -3.0]], 1, 14), M.boots, 0.05));
    }
    const toe = inked(sphere(0.98, 1, 0.6, 1.55), M.boots, 0.05); toe.position.set(0, -7.3, 0.85); knee.add(toe);
    rig[key] = { thigh, knee, sign: sx };
  }
  // A relaxed stance: weight a little on one leg, arms hanging easy and slightly bent.
  rig.legL.thigh.rotation.z = 0.05; rig.legR.thigh.rotation.z = -0.02; hips.rotation.z = 0.02; torso.rotation.z = -0.02;
  rig.armL.rotation.set(0.05, 0, 0.14); rig.armR.rotation.set(0.05, 0, -0.14); rig.elbow.rotation.x = -0.22; rig.elbowL.rotation.x = -0.18;

  // ── The cloak: waist-length, open at the front, the hood lying back, clasped at the throat; scarlet, edged in gold, stitched with stars.
  if (S.cloak) {
    const g = new THREE.Group(); torso.add(g);
    const red = toon('#cc2a2e', { side: THREE.DoubleSide }), lining = toon('#86181e', { side: THREE.DoubleSide }), gold = toon('#e8b84a', { side: THREE.DoubleSide }), stitch = flat('#ffd86a');
    const P0 = Math.PI * 0.6, PL = Math.PI * 1.8, DEPTH = 0.82;
    const prof = [[1.35, 9.45], [2.7, 9.15], [3.9, 8.3], [4.6, 6.6], [5.1, 4.2], [5.5, 1.6], [5.7, 0.6]];
    const outer = lathe(prof, DEPTH, 40, P0, PL);
    g.add(inked(outer, red, 0.02));
    g.add(new THREE.Mesh(lathe(prof.map(([r, y]) => [r * 0.965, y]), DEPTH, 40, P0, PL), lining));
    g.add(new THREE.Mesh(lathe([[5.62, 1.25], [5.74, 0.55]], DEPTH, 40, P0, PL), gold));              // the gold hem
    // A line of gold stitching a little above the hem, and the stars: one large in the middle of the back, small ones scattered along the hem.
    g.add(new THREE.Mesh(lathe([[5.43, 2.05], [5.46, 1.85]], DEPTH * 1.005, 40, P0, PL), toon('#f0c860', { side: THREE.DoubleSide })));
    const onCloak = (phi, y, r, rot) => {        // a star lying on the cape's surface at angle phi (0 = the middle of her back) and height y
      const R = (() => { for (let i = 1; i < prof.length; i++) if (y >= prof[i][1]) { const [r0, y0] = prof[i - 1], [r1, y1] = prof[i], t = (y - y0) / (y1 - y0); return r0 + (r1 - r0) * t; } return prof[prof.length - 1][0]; })() + 0.06;
      const st = new THREE.Mesh(starGeo(r), stitch); st.position.set(Math.sin(Math.PI + phi) * R, y, Math.cos(Math.PI + phi) * R * DEPTH); st.rotation.set(0, Math.PI + phi, rot || 0); st.rotateX(0.18); g.add(st);
    };
    onCloak(0, 3.6, 0.75); onCloak(0.0, 3.6, 0.32, 0.3);
    for (const [phi, y, r] of [[-0.9, 2.6, 0.26], [-0.55, 2.9, 0.18], [-0.25, 2.5, 0.22], [0.3, 2.7, 0.2], [0.62, 2.45, 0.26], [0.95, 2.85, 0.18], [1.35, 2.5, 0.22], [-1.3, 2.75, 0.2], [0.3, 5.2, 0.15], [-0.4, 5.5, 0.14]]) onCloak(phi, y, r);
    // The hood, lying back on her shoulders: a soft rounded fold, red outside and dark inside.
    const hoodG = new THREE.SphereGeometry(2.3, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.62); hoodG.scale(1.25, 0.8, 0.95);
    const hood = inked(hoodG, red, 0.03); hood.position.set(0, 9.25, -2.25); hood.rotation.x = -1.35; g.add(hood);
    const hoodIn = new THREE.Mesh(hoodG, lining); hoodIn.scale.setScalar(0.94); hood.add(hoodIn);
    const clasp = new THREE.Mesh(sphere(0.4, 1, 1, 0.5), toon('#e8b84a')); clasp.position.set(0, 8.9, 1.62); g.add(clasp);
    rig.cloak = { group: g, show(on) { g.visible = !!on; } }; g.visible = false;
  }
  return rig;
}

root.Toon = { make, SPECS, toon, inked };
})(typeof window !== 'undefined' ? window : globalThis);
