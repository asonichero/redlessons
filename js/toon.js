// Red Lessons — the toon look (style test). Smooth, rounded characters with soft cel shading and an ink outline, in place of the blocky skins.
// The joint layout matches js/blocky.js (root › hips › torso › neck; armL/armR › elbow › wrist; legL/legR { thigh › knee }) so the village and the
// over-the-knee scene can switch over without their posing code changing. A grown adult stands 30 units tall, as before.
//
// Proportions are adult throughout: about six and a half heads tall, a defined waist and hips, an adult face (eyes set at the middle of the head,
// not large, a nose and a jaw). The cloak changes her scale only; Toon.make('heroine') at any scale is the same woman.
//
//   const rig = Toon.make('heroine'); rig.cloak.show(true); rig.root.scale.setScalar(0.55);
(function (root) {
'use strict';
const THREE = root.THREE, V2 = THREE.Vector2;
const srgb = h => new THREE.Color(h).convertSRGBToLinear();

// The light, in hard bands as in a cel-shaded anime game.
let GRAD = null;
function gradient() {
  if (GRAD) return GRAD;
  const d = new Uint8Array([150, 150, 150, 150, 150, 150, 255, 255, 255, 255, 255, 255]);      // two bands, a hard terminator: the anime cel look
  GRAD = new THREE.DataTexture(d, 4, 1, THREE.RGBFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true;
  return GRAD;
}
const toon = (hex, extra) => new THREE.MeshToonMaterial(Object.assign({ color: srgb(hex), gradientMap: gradient() }, extra || {}));
const INK = new THREE.MeshBasicMaterial({ color: srgb('#3a2228'), side: THREE.BackSide });      // a warm dark ink, not black
// A mesh with an ink outline (the inverted hull: the same shape a touch larger, drawn from the inside in a dark flat colour).
function inked(geo, mat, w) {
  const g = new THREE.Group(), m = new THREE.Mesh(geo, mat); g.add(m);
  const o = new THREE.Mesh(geo, INK); o.scale.setScalar(1 + (w == null ? 0.05 : w)); g.add(o);
  g.userData.mesh = m; return g;
}
// A body part turned from a profile: [[radius, height], …], squashed front to back by depth.
function lathe(profile, depth, seg) {
  if (profile[0][1] > profile[profile.length - 1][1]) profile = profile.slice().reverse();     // (bottom to top, so the faces point outward)
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new V2(r, y)), seg || 24); g.scale(1, 1, depth == null ? 0.72 : depth); g.computeVertexNormals(); return g;
}
const sphere = (r, sx, sy, sz) => { const g = new THREE.SphereGeometry(r, 20, 14); g.scale(sx || 1, sy || 1, sz || 1); return g; };
// A limb segment from 0 down to -len, tapering from r0 to r1, with rounded ends.
const limb = (len, r0, r1) => lathe([[0, 0.15], [r0 * 0.7, 0.05], [r0, -r0 * 0.4], [r1, -len + r1 * 0.4], [r1 * 0.7, -len - 0.05], [0, -len - 0.15]], 1, 14);

// ── The people ──
const SPECS = {
  heroine: { skin: '#f6d2b4', skinSh: '#e2a888', blush: '#ef9a8c', hair: '#a8402a', hairHi: '#d06a44', hairDk: '#6e2618', eyes: '#3f6a4a', lips: '#c0606a', blouse: '#f1e8d6', bodice: '#3f6a3e', bodiceDk: '#2e5030', skirt: '#c9b48a', skirtDk: '#a8946a', belt: '#5a3a22', boots: '#5e3c24', braid: true, cloak: true },
  innkeeper: { skin: '#d6a07a', skinSh: '#b07a58', blush: '#c07a64', hair: '#2e1e18', hairHi: '#5a3c2c', hairDk: '#1a100c', eyes: '#4a3020', lips: '#9a4a4a', blouse: '#f0e8d8', bodice: '#2a5a5a', bodiceDk: '#1e4444', skirt: '#5a3a2a', skirtDk: '#462c1e', belt: '#3a2618', boots: '#2a1a10', bun: true, apron: '#ece4d0' },
};

function make(id) {
  const S = SPECS[id], rig = { id, spec: S };
  const M = { skin: toon(S.skin), hair: toon(S.hair), blouse: toon(S.blouse), bodice: toon(S.bodice), skirt: toon(S.skirt, { side: THREE.DoubleSide }), belt: toon(S.belt), boots: toon(S.boots) };
  const root_ = new THREE.Group(), hips = new THREE.Group(); hips.position.y = 15.5; root_.add(hips);
  rig.root = root_; rig.hips = hips;

  // Torso: from the hips (y 0 here) to the shoulders (8.6): hips, a waist, the ribcage, the shoulders. Bodice over blouse.
  const torso = new THREE.Group(); hips.add(torso); rig.torso = torso;
  torso.add(inked(lathe([[0, -0.6], [3.2, -0.4], [3.5, 0.6], [3.0, 2.2], [2.5, 3.4], [2.9, 5.2], [3.2, 6.6], [3.3, 7.6], [2.6, 8.6], [1.0, 9.1], [0, 9.2]], 0.68), M.bodice));
  // The blouse at the shoulders and neckline (a band over the top of the bodice), and the lacing down the front.
  const top = inked(lathe([[0, 6.7], [3.35, 6.8], [3.4, 7.7], [2.7, 8.7], [1.1, 9.15], [0, 9.25]], 0.7), M.blouse, 0.03); torso.add(top);
  for (let i = 0; i < 4; i++) { const x = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.2), toon('#e8d8a8')); x.position.set(0, 2.6 + i * 1.0, 2.25 + (i > 1 ? 0.1 : 0)); x.rotation.z = i % 2 ? 0.5 : -0.5; torso.add(x); }
  // An adult figure: the bust, two softened forms on the chest under the bodice.
  for (const sx of [-1, 1]) { const b = inked(sphere(1.25, 1, 0.9, 0.8), M.bodice, 0.03); b.position.set(sx * 1.25, 5.6, 1.55); torso.add(b); }
  // A belt at the waist.
  const belt = new THREE.Mesh(lathe([[2.62, 2.0], [2.62, 2.7]], 0.69), M.belt); torso.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.3), toon('#d8b04a')); buckle.position.set(0, 2.35, 1.85); torso.add(buckle);
  const pouch = inked(new THREE.BoxGeometry(1.4, 1.5, 0.8), M.belt, 0.06); pouch.position.set(2.5, 1.5, 0.6); pouch.rotation.y = 0.5; torso.add(pouch);

  // The skirt: from the waist to just above the ankle, flaring, with a darker hem. (Its own group, so it can be lifted later.)
  const skirt = new THREE.Group(); hips.add(skirt); rig.skirt = skirt;
  skirt.add(inked(lathe([[2.7, 2.3], [3.6, 0.6], [4.6, -4], [5.6, -9], [6.2, -12.6], [6.0, -13.2]], 0.78, 28), M.skirt, 0.025));
  const hem = new THREE.Mesh(lathe([[6.08, -12.2], [6.22, -12.7], [6.02, -13.25]], 0.78, 28), toon(S.skirtDk)); skirt.add(hem);
  if (S.apron) {
    // The apron: the front half of a cone just outside the skirt, from the waist to the knee.
    const ag = new THREE.LatheGeometry([new V2(5.5, -8), new V2(4.8, -4), new V2(3.75, 0.4), new V2(2.75, 2.2)], 20, -Math.PI * 0.3, Math.PI * 0.6); ag.scale(1, 1, 0.8); ag.computeVertexNormals();
    skirt.add(inked(ag, toon(S.apron, { side: THREE.DoubleSide }), 0.015));
  }

  // Neck and head, in an anime style for grown-ups: a slender neck, a smaller head (about seven heads to her height), a face that narrows to a
  // pointed chin, almond eyes with a heavy upper lash line, a nose that is little more than a shadow, a small mouth. The face is a woman's, not a child's:
  // the eyes are set at the middle of the head and are no wider than a fifth of it each, and the jaw is long.
  const neck = new THREE.Group(); neck.position.y = 9.0; torso.add(neck); rig.neck = neck;
  neck.add(inked(lathe([[0.8, -0.6], [0.72, 1.2], [0.78, 1.7]], 1, 12), M.skin, 0.06));
  const head = new THREE.Group(); head.position.y = 3.75; head.scale.setScalar(0.86); neck.add(head); rig.head = head;
  head.add(inked(lathe([[0, -2.75], [0.4, -2.68], [1.1, -2.1], [1.65, -1.15], [1.95, -0.1], [2.08, 0.85], [1.95, 1.75], [1.4, 2.42], [0, 2.62]], 0.9, 28), M.skin, 0.035));
  const face = new THREE.Group(); head.add(face); rig.face = face;
  const eyeW = toon('#fdfbf6'), iris = new THREE.MeshBasicMaterial({ color: srgb(S.eyes) }), irisDk = new THREE.MeshBasicMaterial({ color: srgb('#1e2e22').lerp(srgb(S.eyes), 0.35) }),
    pupil = new THREE.MeshBasicMaterial({ color: srgb('#140e10') }), lash = new THREE.MeshBasicMaterial({ color: srgb('#24161a') }), shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const sx of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(sx * 0.82, -0.05, 1.66); e.rotation.y = sx * 0.3; face.add(e);
    e.add(new THREE.Mesh(sphere(0.5, 1.15, 0.72, 0.28), eyeW));                                                       // the white, almond
    const ir = new THREE.Mesh(sphere(0.32, 0.86, 1.18, 0.28), iris); ir.position.set(sx * -0.06, -0.04, 0.08); e.add(ir);     // the iris, taller than wide
    const ird = new THREE.Mesh(sphere(0.3, 0.84, 0.55, 0.28), irisDk); ird.position.set(sx * -0.06, 0.16, 0.1); e.add(ird);   // its darker upper half (the shadow of the lid)
    const pu = new THREE.Mesh(sphere(0.12, 0.9, 1.25, 0.28), pupil); pu.position.set(sx * -0.06, -0.02, 0.14); e.add(pu);
    const h1 = new THREE.Mesh(sphere(0.09, 1, 1.2, 0.3), shine); h1.position.set(sx * -0.06 + 0.11, 0.16, 0.19); e.add(h1);    // two catch-lights
    const h2 = new THREE.Mesh(sphere(0.045, 1, 1, 0.3), shine); h2.position.set(sx * -0.06 - 0.1, -0.2, 0.19); e.add(h2);
    const up = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.17, 0.18), lash); up.position.set(0, 0.37, 0.07); up.rotation.z = sx * -0.1; e.add(up);   // the heavy upper lash line
    const flick = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.16), lash); flick.position.set(sx * 0.62, 0.28, 0.04); flick.rotation.z = sx * 0.55; e.add(flick);   // its flick at the outer corner
    const low = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.12), lash); low.position.set(sx * 0.12, -0.36, 0.07); e.add(low);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.12), toon(S.hairDk || S.hair)); brow.position.set(sx * 0.88, 0.72, 1.68); brow.rotation.z = sx * 0.16; face.add(brow); rig['brow' + (sx < 0 ? 'R' : 'L')] = brow;
  }
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.08), new THREE.MeshBasicMaterial({ color: srgb(S.skinSh || '#d8a080') })); nose.position.set(0.12, -0.72, 1.88); nose.rotation.z = 0.15; face.add(nose);
  const mouth = new THREE.Group(); mouth.position.set(0, -1.5, 1.7); face.add(mouth); rig.mouth = mouth;
  const lipM = new THREE.MeshBasicMaterial({ color: srgb(S.lips) });
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.1), lipM); m.position.set(sx * 0.15, 0.02, 0); m.rotation.z = sx * 0.18; mouth.add(m); }
  for (const sx of [-1, 1]) { const bl = new THREE.Mesh(sphere(0.38, 1.4, 0.45, 0.2), new THREE.MeshBasicMaterial({ color: srgb(S.blush), transparent: true, opacity: 0.3 })); bl.position.set(sx * 1.2, -0.7, 1.55); bl.rotation.y = sx * 0.55; face.add(bl); }

  // Hair, in chunky anime locks: a cap tipped back to the hairline, a side-swept fringe of tapering locks, long locks framing the face to the jaw,
  // the lighter band of shine round the crown, and (for her) a long braid over the right shoulder; or a bun.
  const lockGeo = (len, r) => { const g = new THREE.ConeGeometry(r, len, 10, 1); g.translate(0, -len / 2, 0); g.scale(1, 1, 0.6); return g; };
  const capGeo = new THREE.SphereGeometry(2.34, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const cap = inked(capGeo, M.hair, 0.03); cap.position.set(0, 0.55, -0.12); cap.rotation.x = -0.52; head.add(cap);
  const back = inked(sphere(2.15, 1, 1.12, 0.85), M.hair, 0.03); back.position.set(0, 0.0, -0.75); head.add(back);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.16, 6, 32, Math.PI * 1.1), toon(S.hairHi)); ring.position.set(0, 1.5, 0.15); ring.rotation.set(-1.25, 0, Math.PI * -0.05); ring.scale.set(1, 1, 1); head.add(ring);
  // The fringe: five locks swept to her left, the longest reaching the brows.
  [[-1.25, 0.8, 0.36, -0.55], [-0.55, 1.05, 0.42, -0.45], [0.2, 1.2, 0.46, -0.38], [0.95, 1.05, 0.4, -0.3], [1.55, 0.8, 0.34, -0.15]].forEach(([x, len, r, rz], i) => {
    const l = inked(lockGeo(len, r), i % 2 ? toon(S.hairHi) : M.hair, 0.05); l.position.set(x, 2.25, 1.55 - Math.abs(x) * 0.18); l.rotation.set(-0.35, 0, rz); head.add(l);
  });
  for (const sx of [-1, 1]) {                     // the long locks either side of the face, to the jaw
    const l = inked(lockGeo(3.2, 0.6), M.hair, 0.04); l.position.set(sx * 1.98, 1.2, 0.85); l.rotation.set(-0.08, 0, sx * -0.04); head.add(l);
    const l2 = inked(lockGeo(2.0, 0.42), toon(S.hairHi), 0.05); l2.position.set(sx * 1.95, 1.3, 0.35); l2.rotation.set(-0.05, 0, sx * -0.1); head.add(l2);
  }
  if (S.braid) {
    // The braid: from behind the right ear, over the shoulder and down the front to the bust, tied with a ribbon. (Its points allow for the head's own scale.)
    const k_ = 1 / 0.86, curve = new THREE.CatmullRomCurve3([[-1.7, -0.6, -0.8], [-2.3, -2.4, 0.1], [-2.65, -4.6, 1.0], [-2.7, -6.8, 1.75], [-2.6, -8.6, 2.1]].map(([x, y, z]) => new THREE.Vector3(x, y * k_, z * k_)));
    for (let i = 0; i < 12; i++) { const t = i / 11, p = curve.getPoint(t), s = 0.72 - t * 0.22, k = inked(sphere(s, 1.05, 1.3, 0.92), toon(i % 2 ? S.hairHi : S.hair), 0.05); k.position.copy(p); k.rotation.z = (i % 2 ? 0.4 : -0.4); head.add(k); }
    const rib = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.6), toon('#b3202a')); rib.position.set(-2.6, -9.5 * k_, 2.15 * k_); head.add(rib);
    const tuft = inked(lockGeo(1.0, 0.42), M.hair, 0.05); tuft.position.set(-2.55, -9.7 * k_, 2.15 * k_); head.add(tuft);
  }
  if (S.bun) { const bun = inked(sphere(1.25, 1, 1, 1), M.hair, 0.04); bun.position.set(0, 1.4, -2.1); head.add(bun); }
  // Arms: shoulder › elbow › wrist, upper arm 4.6 and forearm 4.2, a sleeve to the elbow (the blouse, rolled), bare forearms, hands.
  for (const [key, sx] of [['armL', 1], ['armR', -1]]) {
    const sh = new THREE.Group(); sh.position.set(sx * 3.15, 8.0, 0); sh.rotation.order = 'ZXY'; torso.add(sh); rig[key] = sh; sh.userData.sign = sx;
    sh.add(inked(limb(4.6, 1.05, 0.85), M.blouse, 0.05));
    const cuff = new THREE.Mesh(lathe([[0.95, -3.7], [1.0, -4.1], [0.9, -4.5]], 1, 12), toon('#ddd0b8')); sh.add(cuff);
    const elbow = new THREE.Group(); elbow.position.y = -4.6; sh.add(elbow);
    const wrist = new THREE.Group(); elbow.add(wrist);
    wrist.add(inked(limb(4.2, 0.78, 0.55), M.skin, 0.05));
    const hand = inked(sphere(0.7, 0.75, 1.15, 0.5), M.skin, 0.06); hand.position.y = -4.75; wrist.add(hand);
    if (key === 'armR') { rig.elbow = elbow; rig.wrist = wrist; } else { rig.elbowL = elbow; rig.wristL = wrist; }
  }
  // Legs: hip › knee, thigh 7.0 and shin 7.3, under the skirt; boots to mid-calf.
  for (const [key, sx] of [['legL', 1], ['legR', -1]]) {
    const thigh = new THREE.Group(); thigh.position.x = sx * 1.6; thigh.rotation.order = 'ZXY'; hips.add(thigh);
    thigh.add(inked(limb(7.0, 1.55, 1.05), M.skin, 0.04));
    const knee = new THREE.Group(); knee.position.y = -7.0; thigh.add(knee);
    knee.add(inked(limb(7.3, 1.05, 0.7), M.skin, 0.04));
    const boot = inked(lathe([[0, -7.7], [1.0, -7.6], [1.15, -6.5], [1.12, -3.4], [1.22, -3.0], [0, -3.0]], 1, 14), M.boots, 0.05); knee.add(boot);
    const toe = inked(sphere(0.95, 1, 0.6, 1.5), M.boots, 0.05); toe.position.set(0, -7.25, 0.85); knee.add(toe);
    rig[key] = { thigh, knee, sign: sx };
  }
  rig.legL.thigh.rotation.z = 0.03; rig.legR.thigh.rotation.z = -0.03;
  rig.armL.rotation.z = 0.12; rig.armR.rotation.z = -0.12; rig.elbow.rotation.x = -0.15; rig.elbowL.rotation.x = -0.15;

  // The cloak: waist-length, open at the front, a hood lying back, clasped at the throat; scarlet with a gold-stitched hem.
  if (S.cloak) {
    const g = new THREE.Group(); torso.add(g);
    const red = toon('#c0242e', { side: THREE.DoubleSide }), lining = toon('#7a141c', { side: THREE.DoubleSide });
    const prof = [[1.3, 9.4], [2.6, 9.1], [3.8, 8.3], [4.5, 6.6], [5.0, 4.2], [5.4, 1.4], [5.6, 0.6]];
    const outer = new THREE.LatheGeometry(prof.slice().reverse().map(([r, y]) => new V2(r, y)), 32, Math.PI * 0.62, Math.PI * 1.76); outer.scale(1, 1, 0.8); outer.computeVertexNormals();
    const cape = inked(outer, red, 0.02); g.add(cape);
    const inner = new THREE.Mesh(outer.clone().scale(0.97, 1, 0.97), lining); g.add(inner);
    const trim = new THREE.LatheGeometry([new V2(5.62, 0.55), new V2(5.48, 1.2)], 32, Math.PI * 0.62, Math.PI * 1.76); trim.scale(1, 1, 0.8);
    g.add(new THREE.Mesh(trim, toon('#e0b44a', { side: THREE.DoubleSide })));
    const hood = inked(sphere(2.2, 1.25, 0.85, 0.9), red, 0.04); hood.position.set(0, 10.0, -2.4); hood.rotation.x = 0.35; g.add(hood);
    const clasp = new THREE.Mesh(sphere(0.38, 1, 1, 0.5), toon('#e0b44a')); clasp.position.set(0, 8.9, 1.55); g.add(clasp);
    rig.cloak = { group: g, show(on) { g.visible = !!on; } }; g.visible = false;
  }
  return rig;
}

root.Toon = { make, SPECS, toon, inked };
})(typeof window !== 'undefined' ? window : globalThis);
