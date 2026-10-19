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

// Three bands of light, as in a cel-shaded console game.
let GRAD = null;
function gradient() {
  if (GRAD) return GRAD;
  const d = new Uint8Array([90, 90, 90, 175, 175, 175, 255, 255, 255]);
  GRAD = new THREE.DataTexture(d, 3, 1, THREE.RGBFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true;
  return GRAD;
}
const toon = (hex, extra) => new THREE.MeshToonMaterial(Object.assign({ color: srgb(hex), gradientMap: gradient() }, extra || {}));
const INK = new THREE.MeshBasicMaterial({ color: srgb('#2a1a1c'), side: THREE.BackSide });
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
  heroine: { skin: '#f2c7a5', blush: '#e8a08c', hair: '#8a3a22', hairHi: '#a8502e', eyes: '#3f6a4a', lips: '#c0606a', blouse: '#f1e8d6', bodice: '#3f6a3e', bodiceDk: '#2e5030', skirt: '#c9b48a', skirtDk: '#a8946a', belt: '#5a3a22', boots: '#5e3c24', braid: true, cloak: true },
  innkeeper: { skin: '#c8956e', blush: '#b07a5a', hair: '#2a1a14', hairHi: '#3e2a20', eyes: '#4a3020', lips: '#9a4a4a', blouse: '#f0e8d8', bodice: '#2a5a5a', bodiceDk: '#1e4444', skirt: '#5a3a2a', skirtDk: '#462c1e', belt: '#3a2618', boots: '#2a1a10', bun: true, apron: '#ece4d0' },
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

  // Neck and head. The head is a little taller than wide, with a jaw; the face is painted on a separate shell so it can change.
  const neck = new THREE.Group(); neck.position.y = 9.0; torso.add(neck); rig.neck = neck;
  neck.add(inked(lathe([[0.95, -0.6], [0.85, 1.2], [0.9, 1.6]], 1, 12), M.skin, 0.06));
  const head = new THREE.Group(); head.position.y = 3.9; neck.add(head); rig.head = head;
  head.add(inked(lathe([[0, -2.4], [1.0, -2.25], [1.75, -1.5], [2.05, -0.3], [2.15, 0.8], [2.0, 1.7], [1.4, 2.35], [0, 2.55]], 0.92, 24), M.skin, 0.04));
  // The face: almond eyes at the middle of the head, brows, a small nose, lips. Grown-up proportions, not a doll's.
  const face = new THREE.Group(); head.add(face); rig.face = face;
  const eyeW = toon('#fbf8f2'), iris = new THREE.MeshBasicMaterial({ color: srgb(S.eyes) }), pupil = new THREE.MeshBasicMaterial({ color: srgb('#1a1214') }), lash = new THREE.MeshBasicMaterial({ color: srgb('#2a1a1c') });
  for (const sx of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(sx * 0.82, 0.15, 1.68); e.rotation.y = sx * 0.28; face.add(e);
    const w = new THREE.Mesh(sphere(0.42, 1.25, 0.62, 0.35), eyeW); e.add(w);
    const ir = new THREE.Mesh(sphere(0.25, 1, 1.05, 0.3), iris); ir.position.set(sx * -0.04, -0.02, 0.1); e.add(ir);
    const pu = new THREE.Mesh(sphere(0.11, 1, 1.1, 0.3), pupil); pu.position.set(sx * -0.04, -0.02, 0.17); e.add(pu);
    const hl = new THREE.Mesh(sphere(0.05, 1, 1, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(sx * -0.12 + 0.08, 0.08, 0.2); e.add(hl);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.12, 0.2), lash); lid.position.set(0, 0.26, 0.08); lid.rotation.z = sx * -0.12; e.add(lid);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.15), toon(S.hair)); brow.position.set(sx * 0.85, 0.82, 1.62); brow.rotation.z = sx * 0.12; face.add(brow); rig['brow' + (sx < 0 ? 'R' : 'L')] = brow;
  }
  const nose = new THREE.Mesh(sphere(0.22, 0.8, 1.4, 0.9), toon(S.skin)); nose.position.set(0, -0.55, 1.95); face.add(nose);
  const lips = new THREE.Mesh(sphere(0.38, 1.4, 0.45, 0.4), toon(S.lips)); lips.position.set(0, -1.3, 1.78); face.add(lips); rig.mouth = lips;
  for (const sx of [-1, 1]) { const bl = new THREE.Mesh(sphere(0.35, 1.3, 0.6, 0.2), new THREE.MeshBasicMaterial({ color: srgb(S.blush), transparent: true, opacity: 0.35 })); bl.position.set(sx * 1.25, -0.55, 1.6); bl.rotation.y = sx * 0.5; face.add(bl); }
  // Hair: a smooth cap swept back from a side parting, framing the face, and (for her) a long braid over the right shoulder; or a bun.
  // The cap of hair: the top of a sphere tipped back, so its rim sits at the hairline in front and low at the nape behind.
  const capGeo = new THREE.SphereGeometry(2.34, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const cap = inked(capGeo, M.hair, 0.035); cap.position.set(0, 0.55, -0.12); cap.rotation.x = -0.52; head.add(cap);
  const back = inked(sphere(2.15, 1, 1.12, 0.85), M.hair, 0.035); back.position.set(0, 0.0, -0.75); head.add(back);
  for (const sx of [-1, 1]) { const lock = inked(sphere(0.75, 0.8, 2.1, 0.7), M.hair, 0.05); lock.position.set(sx * 1.85, -0.3, 0.5); lock.rotation.z = sx * 0.12; head.add(lock); }
  const fringe = inked(sphere(1.3, 1.45, 0.5, 0.55), M.hair, 0.04); fringe.position.set(0.5, 1.55, 1.75); fringe.rotation.set(-0.45, 0, -0.3); head.add(fringe);
  if (S.braid) {
    // The braid: from behind the right ear, over the shoulder and down the front to the bust, tied with a ribbon.
    const curve = new THREE.CatmullRomCurve3([[-1.7, -0.6, -0.8], [-2.3, -2.4, 0.1], [-2.65, -4.6, 1.0], [-2.7, -6.8, 1.75], [-2.6, -8.6, 2.1]].map(p => new THREE.Vector3(...p)));
    for (let i = 0; i < 11; i++) { const t = i / 10, p = curve.getPoint(t), s = 0.72 - t * 0.2, k = inked(sphere(s, 1.05, 1.25, 0.95), toon(i % 2 ? S.hairHi : S.hair), 0.06); k.position.copy(p); k.rotation.z = (i % 2 ? 0.35 : -0.35); head.add(k); }
    const rib = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 0.6), toon('#b3202a')); rib.position.set(-2.6, -9.2, 2.15); head.add(rib);
    const tuft = inked(sphere(0.5, 1, 1.4, 1), M.hair, 0.06); tuft.position.set(-2.55, -10.0, 2.15); head.add(tuft);
  }
  if (S.bun) { const bun = inked(sphere(1.25, 1, 1, 1), M.hair, 0.05); bun.position.set(0, 1.4, -2.1); head.add(bun); }

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
