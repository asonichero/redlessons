// Red Lessons — the characters, in a soft toon style: smooth rounded bodies, two-band cel shading and a thin warm outline (an inverted hull), with
// expressive faces built from shapes. Grown-up proportions throughout: about seven heads tall.
//
// The rig is a tree of bones (THREE.Bone), so the skirts can be skinned to the legs and follow them:
//   root (at the feet) › hips › torso › neck › head;  torso › armL/armR › elbowL/elbowR › handL/handR;  hips › thighL/thighR › kneeL/kneeR › ankleL/ankleR
// Limbs swing forward for a negative turn about x (arms and thighs), elbows bend forward for a negative turn, knees back for a positive one.
//
//   const rig = Toon.make('red', look.red)        // or 'gerda'; look from js/looks.js
//   rig.setExpr('wince'); rig.setDress({ skirt: 'up', drawers: 'down', marks: { L: 0.3, R: 0.2 } }); rig.tick(dt)   (skirt: 'down', 'up' or 'off')  (face, blinks, breath, hair)
//   Toon.idle(rig, t)  (a standing idle: weight shift, breathing, arms at rest)
(function (root) {
'use strict';
const THREE = root.THREE, V2 = THREE.Vector2, V3 = THREE.Vector3;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const srgb = h => new THREE.Color(h).convertSRGBToLinear();
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
  return '#' + ch.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// ── Materials: a two-band toon ramp (a soft shadow band and the lit band), and the ink for the outlines. ──────────────────────────────────────
let RAMP = null;
function ramp() {
  if (RAMP) return RAMP;
  const a = K.shadow == null ? 172 : K.shadow, b = K.shadowMid == null ? 222 : K.shadowMid, d = new Uint8Array([a, a, a, 255, b, b, b, 255, 255, 255, 255, 255]);
  RAMP = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter; RAMP.generateMipmaps = false; RAMP.needsUpdate = true;
  return RAMP;
}
const MATS = {};
function mat(hex, o) {
  o = o || {};
  const key = [hex, o.skin ? 1 : 0, o.side || 0, o.opacity || 1].join('|');
  if (o.map) return new THREE.MeshToonMaterial({ color: 0xffffff, map: o.map, gradientMap: ramp(), skinning: !!o.skin, side: o.side || THREE.FrontSide });
  return MATS[key] || (MATS[key] = new THREE.MeshToonMaterial({ color: srgb(hex), gradientMap: ramp(), skinning: !!o.skin, side: o.side || THREE.FrontSide, transparent: o.opacity < 1, opacity: o.opacity || 1 }));
}
const FLATS = {};
const flat = (hex, opacity) => { const k = hex + '|' + (opacity || 1); return FLATS[k] || (FLATS[k] = new THREE.MeshBasicMaterial({ color: srgb(hex), transparent: opacity < 1, opacity: opacity || 1, depthWrite: !(opacity < 1) })); };
const INK = '#3a2620';
const INKM = [new THREE.MeshBasicMaterial({ color: srgb(INK), side: THREE.BackSide }), new THREE.MeshBasicMaterial({ color: srgb(INK), side: THREE.BackSide, skinning: true })];
// The outline: the same shape pushed out along its normals, drawn from the inside in ink.
function hullGeo(geo, w) {
  const g = geo.clone(), p = g.attributes.position, n = g.attributes.normal, q = new V3();
  for (let i = 0; i < p.count; i++) { q.fromBufferAttribute(p, i).addScaledVector(new V3().fromBufferAttribute(n, i), w); p.setXYZ(i, q.x, q.y, q.z); }
  return g;
}

// ── Shapes ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Turned from a profile [[radius, height], …] (any order), squashed front to back by depth; phi0/phiLen leave an opening (phi 0 faces +z).
function lathe(profile, depth, seg, phi0, phiLen) {
  const pr = profile.slice().sort((a, b) => a[1] - b[1]);
  const g = new THREE.LatheGeometry(pr.map(([r, y]) => new V2(Math.max(0.001, r), y)), seg || 22, phi0 || 0, phiLen || Math.PI * 2);
  if (depth != null && depth !== 1) g.scale(1, 1, depth);
  g.computeVertexNormals(); return g;
}
// A profile resampled to n rows (linearly, by height), so a lathe made from it has rows enough to be sculpted.
function dense(profile, n) {
  const pr = profile.slice().sort((a, b) => a[1] - b[1]), y0 = pr[0][1], y1 = pr[pr.length - 1][1], out = [];
  for (let i = 0; i <= n; i++) { const y = lerp(y0, y1, i / n); let k = 1; while (k < pr.length - 1 && pr[k][1] < y) k++; const [ra, ya] = pr[k - 1], [rb, yb] = pr[k]; out.push([lerp(ra, rb, yb === ya ? 0 : (y - ya) / (yb - ya)), y]); }
  return out;
}
const ell = (rx, ry, rz, ws, hs) => { const g = new THREE.SphereGeometry(1, ws || 20, hs || 14); g.scale(rx, ry, rz); return g; };
const arc = (r, tube, a0, a1) => new THREE.TorusGeometry(r, tube, 6, 16, a1 - a0).rotateZ(a0);
// A surface from fn(u, v) → point (u across, v down), its normals turned to face outward(p).
function surface(fn, nu, nv, outward) {
  const pos = [], idx = [], W = nu + 1;
  for (let v = 0; v <= nv; v++) for (let u = 0; u <= nu; u++) { const p = fn(u / nu, v / nv); pos.push(p.x, p.y, p.z); }
  for (let v = 0; v < nv; v++) for (let u = 0; u < nu; u++) { const a = v * W + u, b = a + 1, c = a + W + 1, d = a + W; idx.push(a, d, b, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const k = Math.floor(nv / 2) * W + Math.floor(nu / 2), p = new V3().fromBufferAttribute(g.attributes.position, k), n = new V3().fromBufferAttribute(g.attributes.normal, k);
  if (n.dot(outward(p)) < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  return g;
}

// ── The figure ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Joint positions for a figure of scale 1 (about 31 tall, the head 5.5 of it). Each character is this figure scaled.
// headScale: the head (face, hair, hood) is drawn larger than life, for bigger expressions, on a grown-up body: about 5.6 heads tall in all.
const DIM = { hipY: 15.2, hipX: 1.55, thigh: 7.4, shin: 7.0, torsoY: 0.9, shY: 7.6, shX: 3.1, ua: 5.0, fa: 4.4, neckY: 8.15, headY: 0.9, headC: 2.0, headScale: 1.34 };
const SPECS = {
  red: { name: 'Red Riding Hood', age: 21, scale: 0.85, bust: 1, hair: 'long', feet: 'boots', skirtLen: 6 },
  gerda: { name: 'Gerda', age: 'late thirties', scale: 1.04, bust: 1.12, hair: 'bun', feet: 'boots', skirtLen: 13.6 },
};

// ── Tuning: every number the figures are built from, adjustable in the editor (editor.html) and kept in the browser, so the lap scene uses them
// too. [key, group, label, default, min, max, step]. Lengths are in the figure's units (a figure stands about 31 tall); the rest are multipliers.
const TUNE = [
  ['hipY', 'Proportions', 'Hip height', 15.2, 12, 18, 0.05], ['hipX', 'Proportions', 'Hip joint spacing', 1.55, 1.1, 2.2, 0.01],
  ['thigh', 'Proportions', 'Thigh length', 7.4, 5.5, 9, 0.05], ['shin', 'Proportions', 'Shin length', 7.0, 5.5, 9, 0.05],
  ['torsoY', 'Proportions', 'Waist bend height', 0.9, 0.3, 1.8, 0.05], ['shY', 'Proportions', 'Shoulder height', 7.6, 6.5, 8.6, 0.05],
  ['shX', 'Proportions', 'Shoulder width', 3.1, 2.4, 3.8, 0.01], ['ua', 'Proportions', 'Upper arm length', 5.0, 4, 6, 0.05],
  ['fa', 'Proportions', 'Forearm length', 4.4, 3.5, 5.5, 0.05], ['neckY', 'Proportions', 'Neck base height', 8.15, 7.8, 9.4, 0.05],
  ['headY', 'Proportions', 'Neck length', 0.9, 0.4, 1.8, 0.05], ['headScale', 'Proportions', 'Head size', 1.34, 1, 1.7, 0.01],
  ['redScale', 'Characters', 'Red Riding Hood: overall size', 0.85, 0.7, 1.12, 0.01], ['gerdaScale', 'Characters', 'Gerda: overall size', 1.04, 0.85, 1.15, 0.01],
  ['redBust', 'Characters', 'Red Riding Hood: bust', 1, 0, 1.8, 0.01], ['gerdaBust', 'Characters', 'Gerda: bust', 1.12, 0, 1.8, 0.01],
  ['redSkirt', 'Characters', 'Red Riding Hood: skirt length', 6, 3, 14, 0.1], ['gerdaSkirt', 'Characters', 'Gerda: skirt length', 13.6, 8, 14.4, 0.1],
  ['hipWidth', 'Body', 'Hip width', 1, 0.8, 1.3, 0.01], ['waistWidth', 'Body', 'Waist width', 1, 0.75, 1.3, 0.01], ['chestWidth', 'Body', 'Chest width', 1, 0.8, 1.3, 0.01],
  ['bodyDepth', 'Body', 'Body depth (front to back)', 1, 0.8, 1.25, 0.01], ['armGirth', 'Body', 'Arm thickness', 1, 0.7, 1.4, 0.01], ['legGirth', 'Body', 'Leg thickness', 1, 0.7, 1.4, 0.01],
  ['neckGirth', 'Body', 'Neck thickness', 1.3, 0.7, 1.5, 0.01], ['handSize', 'Body', 'Hand size', 1.3, 0.7, 1.5, 0.01], ['footSize', 'Body', 'Foot size', 1.3, 0.7, 1.5, 0.01],
  ['bustX', 'Bust', 'Spacing', 1.15, 0.8, 1.6, 0.01], ['bustY', 'Bust', 'Height', 6.2, 5, 7.3, 0.05], ['bustAmt', 'Bust', 'Fullness', 0.95, 0, 1.8, 0.01], ['bustW', 'Bust', 'Width', 0.95, 0.6, 1.4, 0.01],
  ['cheekX', 'Seat', 'Spacing', 1.4, 0.6, 2, 0.01], ['cheekY', 'Seat', 'Height', -0.85, -3, 0, 0.01], ['cheekZ', 'Seat', 'Depth', -1.1, -2, -0.6, 0.01],
  ['cheekW', 'Seat', 'Width', 1.9, 1.2, 2.3, 0.01], ['cheekH', 'Seat', 'Height of each cheek', 2, 1.3, 2.5, 0.01], ['cheekD', 'Seat', 'Roundness', 1.5, 0.9, 2, 0.01],
  ['tilt', 'Seat', 'Where smacks land (lower ↔ higher)', 0.35, 0, 0.9, 0.01], ['cheekFollow', 'Seat', 'Follows the thigh (0 hips ↔ 1 thigh)', 1, 0, 1, 0.01],
  ['eyeX', 'Face', 'Eye spacing', 0.66, 0.45, 0.85, 0.01], ['eyeY', 'Face', 'Eye height', 0, -0.25, 0.45, 0.01], ['eyeW', 'Face', 'Eye width', 0.95, 0.7, 1.4, 0.01],
  ['eyeH', 'Face', 'Eye height (size)', 1, 0.7, 1.5, 0.01], ['iris', 'Face', 'Iris size', 1, 0.7, 1.35, 0.01], ['jaw', 'Face', 'Jaw width', 0.88, 0.7, 1.15, 0.01], ['browY', 'Face', 'Brow height', 0.4, 0.2, 0.9, 0.01],
  ['noseY', 'Face', 'Nose height', -0.4, -0.9, -0.2, 0.01], ['noseSize', 'Face', 'Nose size', 1, 0.5, 1.8, 0.01], ['mouthY', 'Face', 'Mouth height', 0.1, -0.3, 0.3, 0.01],
  ['mouthSize', 'Face', 'Mouth size', 1.25, 0.6, 1.6, 0.01], ['blushSize', 'Face', 'Blush size', 1, 0.5, 1.6, 0.01], ['earSize', 'Face', 'Ear size', 1.12, 0.5, 1.6, 0.01],
  ['hairLen', 'Hair', 'Long hair length', 1.25, 0.5, 1.7, 0.01], ['fringe', 'Hair', 'Fringe size', 0.7, 0, 1.5, 0.01], ['hairVol', 'Hair', 'Hair volume', 1.03, 0.9, 1.2, 0.01],
  ['skirtFull', 'Clothes', 'Skirt fullness', 0.95, 0.85, 1.4, 0.01], ['cloakLen', 'Clothes', 'Cloak length', 1.35, 0.5, 1.8, 0.01], ['cloakWidth', 'Clothes', 'Cloak width', 1.1, 0.9, 1.3, 0.01],
  ['ink', 'Style', 'Outline thickness', 1, 0, 2.5, 0.01], ['shadow', 'Style', 'Shadow tone (dark ↔ light)', 172, 90, 245, 1], ['shadowMid', 'Style', 'Mid tone', 222, 140, 255, 1],
];
const TUNE_KEY = 'red-lessons:tune';
const K = {};                                           // the tuning in force
const tuneDefaults = () => Object.fromEntries(TUNE.map(t => [t[0], t[3]]));
function loadTune() { try { return Object.assign(tuneDefaults(), JSON.parse((root.localStorage && root.localStorage.getItem(TUNE_KEY)) || '{}')); } catch (e) { return tuneDefaults(); } }
// Put a tuning in force (the joints, the characters' sizes, the shading) and, unless told not to, keep it in the browser.
function setTune(o, keep) {
  Object.assign(K, tuneDefaults(), o || {});
  for (const [k, , , , lo, hi] of TUNE) K[k] = clamp(+K[k], lo, hi);
  for (const k of ['hipY', 'hipX', 'thigh', 'shin', 'torsoY', 'shY', 'shX', 'ua', 'fa', 'neckY', 'headY', 'headScale']) DIM[k] = K[k];
  Object.assign(SPECS.red, { scale: K.redScale, bust: K.redBust, skirtLen: K.redSkirt }); Object.assign(SPECS.gerda, { scale: K.gerdaScale, bust: K.gerdaBust, skirtLen: K.gerdaSkirt });
  if (RAMP) { RAMP.image.data.set([K.shadow, K.shadow, K.shadow, 255, K.shadowMid, K.shadowMid, K.shadowMid, 255]); RAMP.needsUpdate = true; }
  if (keep !== false) try { root.localStorage && root.localStorage.setItem(TUNE_KEY, JSON.stringify(K)); } catch (e) { /* no storage */ }
  return Object.assign({}, K);
}
const getTune = () => Object.assign({}, K);
function resetTune() { try { root.localStorage && root.localStorage.removeItem(TUNE_KEY); } catch (e) { /* no storage */ } return setTune({}, false); }
// Palettes: the look's colours (js/looks.js), and each outfit's clothes.
function palette(id, look) {
  const l = look || {}, P = {};
  P.skin = l.skin || '#f6d3b8'; P.skinSh = shade(P.skin, -0.12);
  P.hair = l.hair || (id === 'red' ? '#b0582a' : '#7a3a22'); P.hairHi = shade(P.hair, 0.28); P.hairDk = shade(P.hair, -0.32);
  P.eyes = l.eyes || (id === 'red' ? '#4f8a62' : '#4f8a62'); P.lips = l.lips || (id === 'red' ? '#d49080' : '#a8525a');
  P.blush = shade(P.lips, 0.35);
  if (id === 'red') {
    const cloak = l.cloak || '#a01828';
    Object.assign(P, { cloak, cloakDk: shade(cloak, -0.35), lining: '#e9d9b8', blouse: '#f6eedf', bodice: '#3b2b30', lace: '#efe2c0', skirt: '#3c5a8c', skirtDk: '#2c4470',
      hem: '#f6eedf', boots: '#7a4a2a', bootsDk: '#58331c', drawers: '#f8f3e8', drawersDk: '#e2d8c4' });
  } else if (l.outfit === 'Fine') {
    Object.assign(P, { blouse: '#b8a6dc', bodice: '#8f7ab8', lace: '#e8c75a', skirt: '#9a86c0', skirtDk: '#7a66a4', hem: '#e8c75a', apron: null, gold: '#e8c75a', boots: '#4a2f1c', bootsDk: '#e8c75a', drawers: '#f4eee2', drawersDk: '#ddd3c0' });
  } else {
    Object.assign(P, { blouse: '#efe8d8', bodice: '#7a2a3a', lace: '#e6d7b0', skirt: '#6b4a3a', skirtDk: '#54382a', hem: '#54382a', apron: '#ebe2cc', apronDk: '#d4c8ae', boots: '#4a2f1c', bootsDk: '#33200f', drawers: '#f4eee2', drawersDk: '#ddd3c0' });
  }
  return P;
}

function make(id, look, opts) {
  opts = opts || {};
  const S = SPECS[id]; if (!S) throw new Error('Toon: unknown character ' + id);
  look = look || {}; const P = palette(id, look), D = DIM;
  const rig = { id, spec: S, look, P, scaleW: S.scale, solids: [] };
  const root_ = new THREE.Group(); root_.scale.setScalar(S.scale); rig.root = root_;
  const bones = [];
  const bone = (name, parent, x, y, z, order) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (order) b.rotation.order = order; parent.add(b); bones.push(b); rig[name] = b; return b; };
  bone('hips', root_, 0, D.hipY, 0); bone('torso', rig.hips, 0, D.torsoY, 0, 'YXZ'); bone('neck', rig.torso, 0, D.neckY, 0, 'YXZ'); bone('head', rig.neck, 0, D.headY, 0, 'YXZ');
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    bone('arm' + s, rig.torso, sx * D.shX, D.shY, 0, 'ZXY'); bone('elbow' + s, rig['arm' + s], 0, -D.ua, 0); bone('hand' + s, rig['elbow' + s], 0, -D.fa, 0);
    bone('seatPivot' + s, rig.hips, sx * D.hipX, 0, 0);      // (each cheek of the seat turns about this with its thigh: see followThighs)
    bone('thigh' + s, rig.hips, sx * D.hipX, 0, 0, 'ZXY'); bone('knee' + s, rig['thigh' + s], 0, -D.thigh, 0); bone('ankle' + s, rig['knee' + s], 0, -D.shin, 0);
  }
  rig.elbow = rig.elbowR; rig.wrist = rig.handR; rig.wristL = rig.handL;      // (the names the lap scene used before)
  rig.legL = { thigh: rig.thighL, knee: rig.kneeL, ankle: rig.ankleL, sign: 1 }; rig.legR = { thigh: rig.thighR, knee: rig.kneeR, ankle: rig.ankleR, sign: -1 };
  rig.palm = { L: -1, R: 1 };      // which way (along the hand's x) each palm faces
  root_.updateMatrixWorld(true);
  const shadowy = [];
  // A rigid piece on a bone, with its outline.
  function piece(geo, hex, parent, x, y, z, o) {
    o = o || {};
    const m = new THREE.Mesh(geo, o.material || mat(hex, { side: o.side })); m.position.set(x || 0, y || 0, z || 0);
    if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
    if (o.ink !== 0 && K.ink > 0) { const h = new THREE.Mesh(hullGeo(geo, (o.ink || 0.07) * K.ink), INKM[0]); m.add(h); }
    parent.add(m); if (o.shadow !== false) shadowy.push(m); return m;
  }

  // ── Skinning. The body and the skirts are skinned to the whole skeleton, so each is one continuous surface that bends smoothly through the joints
  // (shoulders, elbows, hips, knees, the neck), with an outline that runs unbroken across them. A part is given in one bone's space at rest, with a
  // weight function that says, for each point, how much each bone carries it.
  const tints = [];
  const skel = new THREE.Skeleton(bones.slice()), BI = new Map(bones.map((b, i) => [b, i]));
  const rootInv = new THREE.Matrix4().copy(root_.matrixWorld).invert();
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function skinnedOn(frame, geo, hex, wfn, o) {
    o = o || {};
    const pos = geo.attributes.position, n = pos.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), p = new V3();
    for (let i = 0; i < n; i++) {
      p.fromBufferAttribute(pos, i);
      const ws = wfn(p).filter(w => w[0] && w[1] > 1e-4).sort((a, b) => b[1] - a[1]).slice(0, 4), tot = ws.reduce((t, w) => t + w[1], 0) || 1;
      if (!ws.length) ws.push([frame, 1]);
      ws.forEach(([b, w], k) => { si[i * 4 + k] = BI.get(b); sw[i * 4 + k] = w / tot; });
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    if (o.tint) {      // (skin that the marks can bleed into: its points in the hips' space at rest, and a colour for each)
      const toHips = new THREE.Matrix4().copy(rig.hips.matrixWorld).invert().multiply(frame.matrixWorld), at = [], q = new V3();
      for (let i = 0; i < n; i++) at.push(q.fromBufferAttribute(pos, i).clone().applyMatrix4(toHips));
      const col = new Float32Array(n * 3), base = srgb(hex); for (let i = 0; i < n; i++) { col[i * 3] = base.r; col[i * 3 + 1] = base.g; col[i * 3 + 2] = base.b; }
      // (o.follow: a bone each point rides on by a share, for points that bend between it and the hips)
      const follow = o.follow ? at.map(q => { const w = wfn(q).find(e => e[0] === o.follow); return w ? w[1] : 0; }) : null;
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); tints.push({ geo, at, col, base, bone: o.follow || (frame === rig.hips ? null : frame), follow });
      o.material = new THREE.MeshToonMaterial({ color: 0xffffff, vertexColors: true, gradientMap: ramp(), skinning: true });
    }
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rootInv, frame.matrixWorld));      // (into the root's space, where the bones' rest frames were taken)
    const m = new THREE.SkinnedMesh(geo, o.material || mat(hex, { skin: true, side: o.side || THREE.FrontSide })); m.frustumCulled = false; root_.add(m); m.updateMatrixWorld(true); m.bind(skel, m.matrixWorld);
    if (o.ink !== 0 && K.ink > 0) { const h = new THREE.SkinnedMesh(hullGeo(geo, (o.ink || 0.07) * K.ink), INKM[1]); h.frustumCulled = false; root_.add(h); h.updateMatrixWorld(true); h.bind(skel, h.matrixWorld); m.userData.hull = h; }
    shadowy.push(m); return m;
  }
  // The skirts: by where a point hangs, between the hips, the thighs and the shins, so a skirt follows the legs. The back of it stays with the hips over
  // the seat and only follows the legs below it; the front follows them from the hip.
  // Lying across a lap (opts.lying) the whole skirt goes with her legs from the hip, the back included, so her thighs never push through it.
  function legWeights(p) {
    const back = opts.lying ? 0 : ss(0.5, -2.2, p.z), down = opts.lying ? ss(lerp(1.4, 0.0, ss(0.5, -2.2, p.z)), lerp(-1.0, -2.8, ss(0.5, -2.2, p.z)), p.y) :      // (lying: the front follows the thighs from high up, the back stays over her seat)
       0.96 * ss(lerp(0.4, -2.8, back), lerp(-3.2, -4.8, back), p.y), l = ss(-1.4, 1.4, p.x);
    const k = ss(-D.thigh + 1.4, -D.thigh - 1.8, p.y);
    return [[rig.hips, 1 - down], [rig.thighL, down * l * (1 - k)], [rig.thighR, down * (1 - l) * (1 - k)], [rig.kneeL, down * l * k], [rig.kneeR, down * (1 - l) * k]];
  }
  const skinned = (geo, hex, o) => skinnedOn(rig.hips, geo, hex, legWeights, Object.assign({ side: THREE.DoubleSide }, o));
  // The trunk, in the hips' space: the hips below the waist, the torso above it (it bends at the small of the back), and the tops of the shoulders
  // following the arms a little as they lift.
  const torsoW = p => {
    const t = ss(0.3, 2.9, p.y), sh = ss(2.0, 3.3, Math.abs(p.x)) * ss(7.2, 8.8, p.y) * 0.45;
    return [[rig.hips, 1 - t], [rig.torso, t * (1 - sh)], [p.x > 0 ? rig.armL : rig.armR, t * sh]];
  };
  // An arm, in its own space: carried by the torso where it meets the shoulder, then the upper arm, bending through the elbow to the forearm, into the hand.
  const armW = s => p => {
    const c = 0.5 * ss(-0.2, 0.8, p.y), e = ss(-D.ua + 0.85, -D.ua - 0.85, p.y), h = ss(-D.ua - D.fa + 0.5, -D.ua - D.fa - 0.3, p.y);
    return [[rig.torso, c], [rig['arm' + s], (1 - c) * (1 - e)], [rig['elbow' + s], e * (1 - h)], [rig['hand' + s], e * h]];
  };
  // A leg, in the thigh's space: blending into the hips at the top, bending through the knee, into the ankle.
  const legW = s => p => {
    const hw = 0.55 * ss(-0.8, 0.9, p.y), k = ss(-D.thigh + 0.9, -D.thigh - 0.9, p.y), a = ss(-D.thigh - D.shin + 0.5, -D.thigh - D.shin - 0.3, p.y);
    return [[rig.hips, hw], [rig['thigh' + s], (1 - hw) * (1 - k)], [rig['knee' + s], k * (1 - a)], [rig['ankle' + s], k * a]];
  };
  const show = (m, on) => { m.visible = on; if (m.userData.hull) m.userData.hull.visible = on; };
  // Widths: the trunk's girth by height (in the hips' space) from the hip, waist and chest widths; a profile's radii scaled by a number or by height.
  const trunkW = y => y <= 0.6 ? K.hipWidth : y <= 2.6 ? lerp(K.hipWidth, K.waistWidth, ss(0.6, 2.6, y)) : y <= 4.2 ? K.waistWidth : lerp(K.waistWidth, K.chestWidth, ss(4.2, 6.0, y));
  const wide = (pr, f) => pr.map(([r, y]) => [r * (typeof f === 'function' ? f(y) : f), y]);
  const TD = K.bodyDepth;

  // ── Torso: hips and seat, the waist, the ribcage and shoulders; the bust. The torso's own space starts DIM.torsoY above the hips. ──
  const top = P.blouse;
  skinnedOn(rig.hips, lathe(wide(dense([[0, -2.5], [1.4, -2.35], [2.7, -1.6], [3.2, -0.4], [3.15, 0.6], [2.85, 1.5], [2.6, 2.1], [0, 2.3]], 36), trunkW), 0.72 * TD, 48), P.skin, torsoW, { tint: true });      // the hips
  // The seat: one rounded cheek on each side at the back, painted (with the marks) by setDress. The `seat` frame's +z runs into the skin where a smack lands.
  const CHEEK = { x: K.cheekX, y: K.cheekY, z: K.cheekZ * TD, rx: K.cheekW, ry: K.cheekH, rz: K.cheekD };      // (low enough that the tops melt into the small of the back and the undersides meet the thighs in a crease)
  // Each cheek hangs from a pivot at its own hip joint that turns with that thigh by a share (cheekFollow), so as the legs swing forward (sitting,
  // bending over a lap) the seat rolls round with them rather than staying behind with the hips. The strike points and the drawers ride on it too.
  rig.cheek = {}; rig.seatPivot = {};
  const seatW = pv => p => { const w = 1 - ss(CHEEK.y - 0.1, CHEEK.y + 1.5, p.y); return [[rig.hips, 1 - w], [pv, w]]; };
  const pivotAt = sx => new V3(sx * D.hipX, 0, 0);
  // A cheek's shading blends into the hip's at its sides and top: there its surface's normals are turned toward the hips' own (outward from the body's
  // middle), so the light falls on the two as one form; only the back of it, and the crease under it, keep their own.
  const blendIntoHips = (g, sx, cx, cy, cz) => {
    const pos = g.attributes.position, nor = g.attributes.normal, n = new V3(), b = new V3();
    for (let i = 0; i < pos.count; i++) {
      n.fromBufferAttribute(nor, i); const px_ = pos.getX(i) + sx * cx, pz = pos.getZ(i) + cz, py_ = pos.getY(i) + cy;
      b.set(px_, 0.25 * clamp(py_, -1, 1), pz / (0.72 * TD) ** 2).normalize();
      const w = (1 - ss(0.35, 0.9, -n.z)) * (1 - ss(0.15, 0.6, -n.y));
      n.lerp(b, w).normalize(); nor.setXYZ(i, n.x, n.y, n.z);
    }
    nor.needsUpdate = true; return g;
  };
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const pv = rig['seatPivot' + s]; rig.seatPivot[s] = pv;
    // Each cheek bends between its thigh and the hips: the lower part goes with the thigh (by cheekFollow), the top stays with the hips and runs on
    // into the small of the back, so it never tips out of it as the legs swing forward. Coloured per point, by the same rule as the skin around it.
    const g = blendIntoHips(ell(CHEEK.rx, CHEEK.ry, CHEEK.rz, 40, 28), sx, CHEEK.x, CHEEK.y, CHEEK.z); g.translate(sx * CHEEK.x, CHEEK.y, CHEEK.z);
    const m = skinnedOn(rig.hips, g, P.skin, seatW(pv), { tint: true, follow: pv, ink: 0.035 });
    rig.cheek[s] = { mesh: m }; if (opts.seated) m.visible = false;      // (seated, the seat is under her skirt and on the chair)
  }
  // Turn the pivots (and the frame that says which way is into the skin) after the thighs: called each tick, and by a scene that poses the legs.
  rig.followThighs = () => {
    const f = K.cheekFollow;
    for (const [s, th] of [['L', rig.thighL], ['R', rig.thighR]]) rig.seatPivot[s].rotation.set(th.rotation.x * f, 0, th.rotation.z * f * 0.5);
    rig.seat.rotation.x = -TILT + f * (rig.thighL.rotation.x + rig.thighR.rotation.x) / 2;
  };
  const TILT = K.tilt;
  rig.seat = new THREE.Object3D(); rig.seat.rotation.x = -TILT; rig.hips.add(rig.seat);
  const onCheek = (x, dir) => { const d = dir.clone().normalize(), t = 1 / Math.sqrt((d.x / CHEEK.rx) ** 2 + (d.y / CHEEK.ry) ** 2 + (d.z / CHEEK.rz) ** 2); return new V3(x, CHEEK.y, CHEEK.z).addScaledVector(d, t); };
  const outDir = new V3(0, -Math.sin(TILT), -Math.cos(TILT));
  const mk = (p, parent) => { const o = new THREE.Object3D(); o.position.copy(p); parent.add(o); return o; };
  rig.rear = { L: mk(onCheek(CHEEK.x, outDir).sub(pivotAt(1)), rig.seatPivot.L), R: mk(onCheek(-CHEEK.x, outDir).sub(pivotAt(-1)), rig.seatPivot.R), C: mk(new V3(0, CHEEK.y + 0.9, CHEEK.z - 1.0), rig.hips) };
  rig.upperBack = mk(new V3(0, 6.2, -1.95 * TD * K.chestWidth), rig.torso);
  // The bust is sculpted into the front of the torso (and the bodice under it), not set on it, so the chest is one smooth form.
  const bust = g => {
    const p = g.attributes.position, q = new V3(), A = K.bustAmt * S.bust, W = K.bustW;
    for (let i = 0; i < p.count; i++) {
      q.fromBufferAttribute(p, i); if (q.z <= 0) continue;
      const dx = Math.abs(q.x) - K.bustX, dy = q.y - K.bustY, f = Math.exp(-(dx * dx) / (2 * W * W) - (dy * dy) / (2 * (dy < 0 ? 0.65 * W : W) ** 2));
      q.z += A * f * ss(0.2, 1.2, q.z); q.y -= 0.18 * A * f; p.setXYZ(i, q.x, q.y, q.z);
    }
    g.computeVertexNormals(); return g;
  };
  skinnedOn(rig.hips, bust(lathe(wide(dense([[0, 0.3], [2.9, 0.4], [2.75, 1.5], [2.38, 2.9], [2.32, 3.8], [2.55, 4.9], [2.85, 6.2], [3.0, 7.4], [2.92, 8.4], [2.3, 9.2], [1.2, 9.7], [0, 9.85]], 44), trunkW), 0.68 * TD, 32)), top, torsoW);   // the waist, ribs, bust and shoulders
  // The bodice: laced, from the hips to under the bust.
  skinnedOn(rig.hips, bust(lathe(wide(dense([[3.26, 0.3], [3.12, 0.9], [2.86, 1.6], [2.47, 2.9], [2.4, 3.8], [2.64, 4.9], [2.9, 5.8], [2.7, 5.95]], 26), trunkW), 0.74 * TD, 32)), P.bodice, torsoW, { ink: 0.05 });      // (flaring at the bottom over the hips, which never show through it)
  skinnedOn(rig.hips, lathe(wide([[3.16, 0.0], [3.28, 0.28], [3.0, 0.62]], trunkW), 0.75 * TD, 32), shade(P.bodice, -0.25), torsoW, { ink: 0.035 });      // its bound hem, a neat edge over the join with whatever is below
  // The lacing down its front, crossed, set on the bodice's surface (its radius at each height, as built).
  { const BOD = wide(dense([[3.26, 0.3], [3.12, 0.9], [2.86, 1.6], [2.47, 2.9], [2.4, 3.8], [2.64, 4.9], [2.9, 5.8], [2.7, 5.95]], 26), trunkW), rAt = y => { for (let i = 1; i < BOD.length; i++) if (BOD[i][1] >= y) return lerp(BOD[i - 1][0], BOD[i][0], (y - BOD[i - 1][1]) / (BOD[i][1] - BOD[i - 1][1] || 1)); return BOD[BOD.length - 1][0]; };
    // (from above the skirt's waistband to just under the bust)
    for (let i = 0; i < 4; i++) { const yh = 2.95 + i * 0.78, z = rAt(yh) * 0.74 * TD + 0.06;
      for (const sx of [-1, 1]) piece(new THREE.BoxGeometry(0.95, 0.14, 0.1), P.lace, rig.torso, 0, yh - D.torsoY, z, { rot: [0, 0, sx * 0.55], ink: 0 });
      for (const sx of [-1, 1]) piece(new THREE.SphereGeometry(0.09, 8, 6), shade(P.lace, -0.3), rig.torso, sx * 0.42, yh - D.torsoY, z - 0.02, { ink: 0 }); } }
  // The neck: from inside the shoulders up into the head, bending with both.
  skinnedOn(rig.neck, lathe(wide([[0.7, -1.1], [0.68, -0.3], [0.64, 0.6], [0.62, 1.6]], K.neckGirth), 1, 16), P.skin, p => { const t = ss(0.1, -0.7, p.y), h = ss(0.6, 1.3, p.y); return [[rig.torso, t], [rig.head, h * (1 - t)], [rig.neck, (1 - t) * (1 - h)]]; });
  piece(lathe(wide([[1.25, -0.25], [1.4, 0.1], [1.15, 0.3]], Math.max(K.neckGirth, 0.9)), 0.78, 18), P.blouse, rig.torso, 0, D.neckY - 0.35, 0, { ink: 0.04 });   // the collar

  // ── Arms: a full sleeve to the elbow (puffed at the shoulder for her), bare forearms, soft hands. ──
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const arm = rig['arm' + s], elbow = rig['elbow' + s], hand = rig['hand' + s];
    const AG = K.armGirth, E = -D.ua, Wr = -D.ua - D.fa, HS = K.handSize;
    if (id === 'red') piece(ell(1.08 * AG, 1.15 * AG, 1.02 * AG), top, arm, sx * 0.05, -0.75, 0, { ink: 0.05 });     // her puffed sleeve
    // One arm from the shoulder to the wrist: the sleeve to the elbow, its rolled cuff, the bare forearm, all bending together.
    skinnedOn(arm, lathe(wide([[0, 0.75], [0.8, 0.45], [0.88, -0.3], [0.8, -2.6], [0.7, E + 0.6], [0.66, E - 0.25]], AG), 1, 18), top, armW(s));
    skinnedOn(arm, lathe(wide([[0.7, E + 0.55], [0.8, E + 0.05], [0.68, E - 0.45]], AG), 1, 18), shade(top, -0.06), armW(s), { ink: 0.04 });
    skinnedOn(arm, lathe(wide([[0.6, E + 0.3], [0.62, E - 0.5], [0.6, E - 1.4], [0.5, lerp(E, Wr, 0.72)], [0.42, Wr + 0.1], [0.36, Wr - 0.3], [0, Wr - 0.55]], AG), 1, 18), P.skin, armW(s));
    if (P.gold) piece(new THREE.TorusGeometry(0.45 * AG, 0.08, 6, 16).rotateX(Math.PI / 2), P.gold, elbow, 0, -D.fa + 0.5, 0, { ink: 0 });
    // The hand: a palm, the fingers together in a soft, slightly curled block, and the thumb.
    piece(ell(0.3 * HS, 0.66 * HS, 0.6 * HS), P.skin, hand, 0, -0.55 * HS, 0, { ink: 0.035 });
    piece(ell(0.23 * HS, 0.66 * HS, 0.54 * HS), P.skin, hand, sx * -0.04 * HS, -1.32 * HS, 0.02, { rot: [0, 0, -sx * 0.14], ink: 0.035 });
    piece(ell(0.2 * HS, 0.48 * HS, 0.21 * HS), P.skin, hand, 0, -0.42 * HS, 0.5 * HS, { rot: [0.55, 0, 0], ink: 0.035 });
  }
  // ── Legs: bare under the skirt; boots for her, bare feet for Gerda. ──
  // A foot with a flat bottom: the shape's underside pressed flat at `flat` below its middle, so it stands level.
  const flatFoot = (g, flat) => { const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) if (pp.getY(i) < -flat) pp.setY(i, -flat); g.computeVertexNormals(); return g; };
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const thigh = rig['thigh' + s], knee = rig['knee' + s], ankle = rig['ankle' + s];
    // One leg from the hip to the ankle, bending through the knee; for her, the boot's shaft and its turned-down top ride on it.
    const Lk = D.thigh, La = D.thigh + D.shin, LG = K.legGirth, FS = K.footSize, sh = f => -Lk - f * D.shin;      // (points down the shin as a share of its length)
    skinnedOn(thigh, lathe(wide(dense([[0, 1.0], [1.25, 0.7], [1.72, -0.4], [1.66, -Lk * 0.34], [1.45, -Lk * 0.68], [1.15, -Lk + 0.6], [1.08, -Lk - 0.2], [1.13, sh(0.17)], [1.15, sh(0.37)], [0.9, sh(0.66)], [0.62, -La + 0.8], [0.54, -La + 0.1], [0.5, -La - 0.2], [0, -La - 0.5]], 60), LG), 1, 28), P.skin, legW(s), { tint: true });
    if (S.feet === 'boots') {
      skinnedOn(thigh, lathe(wide([[0.84, sh(0.51)], [1.0, sh(0.56)], [0.8, sh(0.8)], [0.72, -La - 0.2], [0, -La - 0.4]], LG), 1, 18), P.boots, legW(s));
      skinnedOn(thigh, lathe(wide([[0.88, sh(0.507)], [1.04, sh(0.536)], [1.0, sh(0.586)]], LG), 1, 18), P.bootsDk, legW(s), { ink: 0.04 });
      piece(flatFoot(ell(0.78 * FS, 0.62, 1.55 * FS), 0.5), P.boots, ankle, 0, -0.22, 0.62 * FS);
      piece(flatFoot(ell(0.82 * FS, 0.2, 1.62 * FS), 0.12), P.bootsDk, ankle, 0, -0.62, 0.62 * FS, { ink: 0.04 });      // (the sole)
    } else {
      piece(flatFoot(ell(0.62 * FS, 0.5, 1.45 * FS), 0.4), P.skin, ankle, 0, -0.35, 0.62 * FS);
      if (P.gold) piece(new THREE.TorusGeometry(0.62 * LG, 0.08, 6, 16).rotateX(Math.PI / 2), P.gold, knee, 0, -D.shin + 0.6, 0, { ink: 0 });
    }
  }

  // ── The skirt (skinned to the legs), a band at its hem, Gerda's apron; her drawers, the skirt gathered up, the drawers down at her knees. ──
  const L_ = S.skirtLen;
  const SW = y => (y > 0.6 ? trunkW(y) : K.hipWidth) * (y < 0 ? lerp(1, K.skirtFull, ss(0, -4, y)) : 1);       // (it widens with the hips, and flares with its fullness)
  const skirtProfile = wide([[2.66, 2.1], [3.45, 0.6], [4.05, -0.8], [4.4, -3], [4.9, -6.5], [5.3, -L_ + 0.7], [5.4, -L_]], SW);
  const skirtR = y => { const pr = skirtProfile; for (let i = 1; i < pr.length; i++) if (y >= pr[i][1]) { const [r0, y0] = pr[i - 1], [r1, y1] = pr[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return pr[pr.length - 1][0]; };
  let skirt = null, hemBand = null, apron = null;
  const waist = piece(lathe(wide([[2.72, 1.55], [2.78, 2.15], [2.66, 2.5]], trunkW), 0.75 * TD, 22), P.skirtDk, rig.hips, 0, 0, 0, { ink: 0.04 });
  if (opts.seated) seatedDrape();
  else {
    // (lying, its front, the side toward the lap she lies on, is drawn in close over her legs rather than standing out as a bell)
    // (drawn in, but never closer than a cloth's thickness outside the front of her thighs)
    const thighFront = (x, y) => { const rt = lerp(1.75, 1.2, clamp(-y / D.thigh, 0, 1)) * K.legGirth + 0.55; let z = 0; for (const c of [D.hipX, -D.hipX]) z = Math.max(z, Math.sqrt(Math.max(0, rt * rt - (x - c) ** 2))); return z; };
    const hug = g => { if (opts.lying) { const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i), y = pp.getY(i); if (z > 0) pp.setZ(i, Math.max(z * lerp(1, 0.55, ss(0.6, -2.5, y)), y < 0.6 ? thighFront(pp.getX(i), y) : 0)); } g.computeVertexNormals(); } return g; };
    skirt = skinned(hug(lathe(skirtProfile, 0.9, 28)), P.skirt);
    hemBand = skinned(hug(lathe([[skirtR(-L_ + 0.85) + 0.07, -L_ + 0.85], [skirtR(-L_) + 0.07, -L_ + 0.1], [skirtR(-L_) + 0.05, -L_ - 0.05]], 0.9, 28)), P.hem, { ink: 0.04 });
    if (P.apron) {
      const ap = []; for (const [r, y] of [[2.8, 1.9], [3.5, 0.4], [4.0, -1.5], [4.5, -4.5], [4.95, -8.0], [5.1, -9.5]]) ap.push([r, y]);
      apron = skinned(lathe(ap.map(([r, y]) => [Math.max(r, skirtR(y) + 0.12), y]), 0.92, 12, -0.95, 1.9), P.apron, { ink: 0.05 });
    }
  }
  // Seated (Gerda in the lap scene) the skirt is its own drape, in the hips' space with the thighs level along +z: a tube over the lap, turned
  // round the knees, then hanging to the hem, with the apron laid along the top of it. (Skinning a skirt through a right-angled knee folds it.)
  function seatedDrape() {
    const Tk = D.thigh, drop = D.shin + 0.2, lapL = Tk + 1.5, arcL = 2.2 * Math.PI / 2, total = lapL + arcL + drop;
    // What the drape is, for anything that must not pass through it (js/lap.js keeps arms out): over the lap, an elliptic tube along the thighs;
    // below the knees, one standing to the floor. In the hips' space; returns how far a ball of radius r at q is inside.
    rig.solids.push((q, r) => {
      const w = 4.0 * K.hipWidth + r, h = 2.3 * K.legGirth + r; let pen = 0;
      if (q.z > -1.5 - r && q.z < Tk + 0.4) { const d = Math.hypot(q.x / w, (q.y + 0.1) / h); if (d < 1) pen = Math.max(pen, (1 - d) * Math.min(w, h)); }
      if (q.y < -0.1 && q.y > -0.1 - drop - r) { const t = clamp((-0.1 - q.y) / drop, 0, 1), wx = lerp(4.0, 4.9 * K.skirtFull, t) * K.hipWidth + r, wz = lerp(2.3, 2.5 * K.skirtFull, t) + r, d = Math.hypot(q.x / wx, (q.z - Tk - 0.4 * t) / wz); if (d < 1) pen = Math.max(pen, (1 - d) * Math.min(wx, wz)); }
      return pen;
    });
    const at = v => {                                  // the drape's spine: centre, the way 'up' from it, the half-width and the half-depth
      const d = v * total;
      if (d < lapL) return { c: new V3(0, -0.1, -1.5 + d), n: new V3(0, 1, 0), w: lerp(3.7, 4.0, d / lapL) * K.hipWidth, h: 2.3 * K.legGirth };
      if (d < lapL + arcL) { const a = (d - lapL) / arcL * Math.PI / 2; return { c: new V3(0, -0.1, Tk), n: new V3(0, Math.cos(a), Math.sin(a)), w: 4.0 * K.hipWidth, h: 2.3 * K.legGirth }; }
      const t = (d - lapL - arcL) / drop; return { c: new V3(0, -0.1 - t * drop, Tk + 0.4 * t), n: new V3(0, 0, 1), w: lerp(4.0, 4.9 * K.skirtFull, t) * K.hipWidth, h: lerp(2.3, 2.5 * K.skirtFull, t) };
    };
    const tube = (a0, a1, v0, v1, lift) => (u, v) => { const f = at(lerp(v0, v1, v)), a = lerp(a0, a1, u); return f.c.clone().addScaledVector(new V3(1, 0, 0), Math.sin(a) * (f.w + lift)).addScaledVector(f.n, Math.cos(a) * (f.h + lift)); };
    const outward = p => new V3(p.x, p.z < Tk ? p.y + 0.1 : Math.max(0, p.y + 0.1), p.z < Tk ? 0 : p.z - Tk);      // (away from the spine)
    piece(surface(tube(-Math.PI, Math.PI, 0, 1, 0), 28, 30, outward), P.skirt, rig.hips, 0, 0, 0, { side: THREE.DoubleSide });
    piece(lathe(wide([[2.66, 2.1], [3.45, 0.6], [3.9, -0.4], [3.6, -1.6], [3.1, -2.35], [0, -2.6]], SW), 0.9 * TD, 24), P.skirt, rig.hips);      // (closed under her seat)
    piece(surface(tube(-Math.PI, Math.PI, 0.965, 1, 0.06), 28, 2, outward), P.hem, rig.hips, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.04 });
    if (P.apron) piece(surface(tube(-0.95, 0.95, 0.06, 0.78, 0.12), 12, 22, outward), P.apron, rig.hips, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.05 });
  }
  const drawers = [], drawersDown = [];
  if (!opts.seated) {      // (both wear them: hers show across the lap, Gerda's only in the editor with her skirt lifted or off; seated, they're under the drape)
    // (closed underneath, following the hips' own shape a little outside it, so nothing hangs down between the legs)
    // (up over the whole seat to the waist, tucked under the bodice: fuller at the back, so the cheeks never rise above them)
    { const g = lathe(wide(dense([[0, -2.64], [1.5, -2.48], [2.82, -1.7], [3.32, -0.4], [3.26, 0.4], [3.08, 0.85], [2.95, 1.05]], 24), trunkW), 0.75 * TD, 32), pp = g.attributes.position;
      for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i); if (z < 0) pp.setZ(i, z * lerp(1.14, 1, ss(0.2, 1.0, pp.getY(i)))); }
      g.computeVertexNormals(); drawers.push(skinnedOn(rig.hips, g, P.drawers, torsoW)); }
    for (const [s, sx] of [['L', 1], ['R', -1]]) {
      { const g = blendIntoHips(ell(CHEEK.rx * 1.05, CHEEK.ry * 1.05, CHEEK.rz * 1.08), sx, CHEEK.x, CHEEK.y, CHEEK.z); g.translate(sx * CHEEK.x, CHEEK.y, CHEEK.z); drawers.push(skinnedOn(rig.hips, g, P.drawers, seatW(rig.seatPivot[s]), { ink: 0.07 })); }
      drawers.push(skinnedOn(rig['thigh' + s], lathe(wide([[1.9, 0.2], [1.95, -1.6], [1.8, -2.9], [1.88, -3.1]], K.legGirth), 1, 18), P.drawers, legW(s)));
      drawers.push(skinnedOn(rig['thigh' + s], lathe(wide([[1.86, -3.05], [1.96, -3.2], [1.84, -3.35]], K.legGirth), 1, 18), P.drawersDk, legW(s), { ink: 0.03 }));
      drawersDown.push(piece(new THREE.TorusGeometry(1.42 * K.legGirth, 0.42, 8, 20).rotateX(Math.PI / 2), P.drawers, rig['thigh' + s], 0, -D.thigh * 0.74, 0));
    }
    // Down, they're one garment pushed down round both legs: a rolled cuff on each thigh and the cloth between them, sagging between her legs at the
    // front and back, carried by both thighs.
    { const yb = -D.thigh * 0.74, ax = (D.hipX + 1.42 * K.legGirth), g = new THREE.TorusGeometry(1, 0.34, 8, 40).rotateX(Math.PI / 2), pp = g.attributes.position;
      for (let i = 0; i < pp.count; i++) { const x = pp.getX(i) * ax, z = pp.getZ(i) * 1.5 * K.legGirth; pp.setXYZ(i, x, yb + pp.getY(i) - 0.7 * (1 - ss(0, 1.8, Math.abs(x))), z); }
      g.computeVertexNormals();
      const m = skinnedOn(rig.hips, g, P.drawers, p => { const l = ss(-1.2, 1.2, p.x); return [[rig.thighL, l], [rig.thighR, 1 - l]]; }, { ink: 0.05 });
      drawersDown.push(m);
      // and the cloth across the middle, between her legs, sagging (the legs pass through it, hiding the part inside them)
      const gg = surface((u, v) => { const a = u * Math.PI * 2, x = Math.cos(a) * ax * v, z = Math.sin(a) * 1.5 * K.legGirth * v; return new V3(x, yb - 0.7 * (1 - ss(0, 1.8, Math.abs(x))) - 0.35 * (1 - v * v), z); }, 40, 8, p => new V3(0, -1, 0));
      drawersDown.push(skinnedOn(rig.hips, gg, P.drawers, p => { const l = ss(-1.2, 1.2, p.x); return [[rig.thighL, l], [rig.thighR, 1 - l]]; }, { side: THREE.DoubleSide, ink: 0 })); }
  }
  // The skirt lifted: gathered in a roll across the small of her back.
  const roll = new THREE.Group(); rig.hips.add(roll); roll.visible = false;
  // (an oval ring hugging the back and sides of her waist, the hem's band showing along its lower edge, and the cloth bunched at each hip)
  piece(new THREE.TorusGeometry(2.75, 0.68, 10, 24, Math.PI * 1.1).rotateX(Math.PI / 2).rotateY(Math.PI * 0.95).scale(trunkW(2.1), 1, 0.66 * TD * trunkW(2.1)), P.skirt, roll, 0, 2.1, 0);
  piece(new THREE.TorusGeometry(2.75, 0.24, 6, 24, Math.PI * 1.05).rotateX(Math.PI / 2).rotateY(Math.PI * 0.975).scale(trunkW(1.45), 1, 0.7 * TD * trunkW(1.45)), P.hem, roll, 0, 1.45, -0.15, { ink: 0.03 });
  for (const sx of [-1, 1]) piece(ell(0.95, 0.75, 0.8), P.skirt, roll, sx * 2.55 * trunkW(1.9), 1.9, -0.6);

  // ── Head and face. ──
  // (scaled about the chin, which stays where it meets the neck)
  const head = new THREE.Group(); head.position.y = D.headC + 2.1 * (D.headScale - 1); head.scale.setScalar(D.headScale); rig.head.add(head); rig.headGroup = head;
  // The head is built as it's drawn: a ball for the cranium, sitting back a little, with its sides cut flat; and the face hung in front of it, its
  // planes turning at the cheekbones, a jaw that angles down and forward from under the ear and tapers to a squared chin. Each slice across it is
  // a rounded box (a superellipse), wider than deep, its front further forward than its back is behind; the rows run from the crown to the chin.
  // Rows: height, half width, how far forward the front is, how far back the back is, and how square the front and back are. Jaw width narrows
  // everything below the cheekbones. The face's features are painted onto the same surface (faceZ).
  const HEADK = [
    [2.12, 0.05, 0.1, 0.1, 2, 2], [1.95, 0.95, 0.9, 1.04, 2, 2], [1.55, 1.36, 1.38, 1.5, 2.05, 2], [0.95, 1.55, 1.64, 1.72, 2.3, 2.05],
    [0.25, 1.57, 1.74, 1.72, 2.8, 2.15], [-0.35, 1.53, 1.73, 1.55, 3.0, 2.4], [-0.95, 1.42, 1.66, 0.95, 3.1, 2.6], [-1.45, 1.18, 1.56, 0.35, 3.0, 2.6],
    [-1.85, 0.84, 1.44, -0.25, 2.9, 2.6], [-2.08, 0.5, 1.33, -0.72, 2.7, 2.5], [-2.2, 0.28, 1.2, -0.9, 2.5, 2.4], [-2.24, 0.03, 1.04, -0.88, 2.2, 2.2],
  ].map(([y, w, f, b, nf, nb]) => [y, w * (y < 0 ? lerp(1, K.jaw, ss(-0.1, -1.4, y)) : 1), f, b, nf, nb]);
  const headAt = y => {
    const R = HEADK, n = R.length; y = clamp(y, R[n - 1][0], R[0][0]); let i = 0; while (i < n - 2 && y < R[i + 1][0]) i++;
    const a = R[i], b = R[i + 1], t = (y - a[0]) / (b[0] - a[0]), h = b[0] - a[0], out = [];
    for (let k = 1; k < 6; k++) {      // (a smooth curve through the rows: each value's slope taken from its neighbours)
      const sl = j => { const p = R[Math.max(0, j - 1)], q = R[Math.min(n - 1, j + 1)]; return (q[k] - p[k]) / (q[0] - p[0]); };
      const t2 = t * t, t3 = t2 * t; out.push((2 * t3 - 3 * t2 + 1) * a[k] + (t3 - 2 * t2 + t) * h * sl(i) + (-2 * t3 + 3 * t2) * b[k] + (t3 - t2) * h * sl(i + 1));
    }
    return { w: Math.max(0.01, out[0]), f: out[1], b: out[2], nf: out[3], nb: out[4] };
  };
  const pw = (c, n) => Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
  { const Y0 = HEADK[0][0], Y1 = HEADK[HEADK.length - 1][0], NU = 40, NV = 40;
    const g = surface((u, v) => { const y = lerp(Y0, Y1, (1 - Math.cos(Math.PI * v)) / 2), H = headAt(y), a = (u - 0.5) * 2 * Math.PI, c = Math.cos(a), sn = Math.sin(a), n = c > 0 ? H.nf : H.nb;
      // (u runs round from the back, through the front, to the back again: the seam is down the back)
      const zc = (H.f - H.b) / 2, dz = (H.f + H.b) / 2; return new V3(H.w * pw(sn, n), y, zc + dz * pw(c, n)); }, NU, NV, p => p.clone().setY(p.y * 0.3));
    // (the seam's two edges, and each end's ring of points, share their normals, so the shading runs smoothly across them)
    const nm = g.attributes.normal, W = NU + 1, tmp = new V3(), tmp2 = new V3();
    for (let v = 0; v <= NV; v++) { tmp.fromBufferAttribute(nm, v * W).add(tmp2.fromBufferAttribute(nm, v * W + NU)).normalize(); nm.setXYZ(v * W, tmp.x, tmp.y, tmp.z); nm.setXYZ(v * W + NU, tmp.x, tmp.y, tmp.z); }
    for (const v of [0, NV]) { tmp.set(0, 0, 0); for (let u = 0; u < NU; u++) tmp.add(tmp2.fromBufferAttribute(nm, v * W + u)); tmp.normalize(); for (let u = 0; u <= NU; u++) nm.setXYZ(v * W + u, tmp.x, tmp.y, tmp.z); }
    piece(g, P.skin, head, 0, 0, 0, { ink: 0.05 }); }
  for (const sx of [-1, 1]) piece(ell(0.24 * K.earSize, 0.44 * K.earSize, 0.34 * K.earSize), P.skin, head, sx * (headAt(0).w - 0.04), 0.0, -0.1, { ink: 0.05 });
  // Where the face's surface is: features set on it follow it as they move.
  const faceZ = (x, y) => { const H = headAt(y), zc = (H.f - H.b) / 2, dz = (H.f + H.b) / 2, q = Math.abs(x) / H.w; return q >= 1 ? zc : zc + dz * Math.pow(1 - Math.pow(q, H.nf), 1 / H.nf); };
  // The nose: a soft slope out of the face in the face's own colour (the shading shows it). The shadow under it is painted, with everything else.
  { const N = K.noseSize, g = new THREE.SphereGeometry(1, 16, 12); g.scale(0.15 * N, 0.36 * N, 0.17 * N);
    piece(g, P.skin, head, 0, K.noseY + 0.08 * N, faceZ(0, K.noseY) - 0.07, { rot: [-0.42, 0, 0], ink: 0 }); }
  // ── The face is painted: eyes, lids, brows, mouth, blush and tears are drawn onto a thin layer that follows the face's surface, and redrawn as the
  // expression eases from one to the next, so every feature morphs smoothly (the mouth from a smile through flat to a frown or open; the lids down
  // over the eyes) rather than pieces switching on and off. Drawn in the head's own units: x across, y up.
  const FX0 = -1.62, FX1 = 1.62, FY0 = -2.05, FY1 = 1.45, FW = 512, FH = Math.round(FW * (FY1 - FY0) / (FX1 - FX0));
  const fcan = document.createElement('canvas'); fcan.width = FW; fcan.height = FH; const fx = fcan.getContext('2d');
  const ftex = new THREE.CanvasTexture(fcan); ftex.encoding = THREE.sRGBEncoding; ftex.anisotropy = 4;
  { const NX = 40, NY = 44, pos = [], uv = [], idx = [];
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) { const x = lerp(FX0, FX1, i / NX), y = lerp(FY0, FY1, j / NY); pos.push(x, y, faceZ(x, y) + 0.012); uv.push(i / NX, j / NY); }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 2, d = a + NX + 1; idx.push(a, b, c, a, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: ftex, transparent: true, alphaTest: 0.02, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.renderOrder = 2; head.add(m); }
  const px = x => (x - FX0) / (FX1 - FX0) * FW, py = y => (FY1 - y) / (FY1 - FY0) * FH, U = FW / (FX1 - FX0);      // (head units to canvas pixels)
  const INKC = '#2a1612', lipsDk = shade(P.lips, -0.4);
  // The eye as it was first drawn: a rounded white, an even arch of lashes over it with a flick at the outer corner, the iris with a darker upper half,
  // the pupil and a highlight. Closing, the lashes come down over it, and a shut eye is that arch, low.
  function drawEye(sx, F, open) {
    const cx = sx * K.eyeX, cy = K.eyeY, rx = 0.43 * K.eyeW, ry = 0.3 * K.eyeH, shut = clamp(1 - open, 0, 1), drop = 2 * ry * shut, E = (x, y) => [px(cx + x), py(cy + y)];
    const ell_ = (x, y, a, b) => { fx.beginPath(); fx.ellipse(px(cx + x), py(cy + y), a * U, b * U, 0, 0, 7); };
    if (shut < 0.97) {
      fx.save();
      ell_(0, 0, rx, ry); fx.clip();
      fx.beginPath(); fx.ellipse(px(cx), py(cy - drop), rx * U, ry * U, 0, Math.PI, 2 * Math.PI); fx.lineTo(...E(rx, -ry - 2)); fx.lineTo(...E(-rx, -ry - 2)); fx.closePath(); fx.clip();      // (below the lid)
      ell_(0, 0, rx, ry); fx.fillStyle = '#fffaf2'; fx.fill();
      const ix = F.look * 0.06 * sx * sx, k = K.iris;
      fx.fillStyle = P.eyes; ell_(ix, 0, 0.22 * k, 0.27 * k); fx.fill();
      fx.fillStyle = shade(P.eyes, -0.4); ell_(ix, 0.11 * k, 0.19 * k, 0.11 * k); fx.fill();
      fx.fillStyle = '#1c1210'; ell_(ix, 0, 0.09 * k, 0.11 * k); fx.fill();
      fx.fillStyle = '#ffffff'; ell_(ix + 0.07 * k, 0.09 * k, 0.06 * k, 0.06 * k); fx.fill();
      fx.restore();
    }
    // The lashes: the upper arch of the eye (a touch flatter), moved down as it closes, and the flick at its outer end.
    const ly = -0.5 * shut * K.eyeH, ar = 0.4 * K.eyeW, br = 0.4 * 0.72 * K.eyeH;
    fx.strokeStyle = INKC; fx.lineCap = 'round'; fx.lineWidth = 0.1 * U;
    fx.beginPath(); fx.ellipse(px(cx), py(cy + ly), ar * U, br * U, 0, Math.PI + 0.15, 2 * Math.PI - 0.15); fx.stroke();
    const wx = sx * 0.42 * K.eyeW, wy = (0.13 - 0.55 * shut) * K.eyeH, wl = 0.11 * K.eyeW, wa = sx * 0.45;
    fx.lineWidth = 0.07 * U; fx.beginPath(); fx.moveTo(...E(wx - Math.cos(wa) * wl, wy - Math.sin(wa) * wl)); fx.lineTo(...E(wx + Math.cos(wa) * wl, wy + Math.sin(wa) * wl)); fx.stroke();
  }
  function drawBrow(sx, F) {
    const by = K.browY + F.browY, inX = sx * (K.eyeX - 0.3 * K.eyeW), outX = sx * (K.eyeX + 0.42 * K.eyeW), inY = by + F.brow * 0.3, outY = by - 0.06 - F.brow * 0.08;
    fx.strokeStyle = P.hairDk; fx.lineCap = 'round';
    for (let k = 0; k < 6; k++) { const t0 = k / 6, t1 = (k + 1) / 6, at = t => [lerp(inX, outX, t), lerp(inY, outY, t) + 0.09 * Math.sin(Math.PI * t)];
      const [x0, y0] = at(t0), [x1, y1] = at(t1); fx.lineWidth = lerp(0.105, 0.045, t1) * U; fx.beginPath(); fx.moveTo(px(x0), py(y0)); fx.lineTo(px(x1), py(y1)); fx.stroke(); }
  }
  function drawMouth(F) {
    const s_ = F.ms * K.mouthSize, w = F.mw * s_, cy = -1.2 + K.mouthY, c = F.mc, o = F.mo * s_, l = -w / 2, r = w / 2, cornerY = cy + c * 0.12;
    // Upper lip line and lower lip line: they meet at the corners; their middles part as the mouth opens. A smile lifts the corners, a frown drops them.
    const upMid = cy + 0.02 - c * 0.04, loMid = cy - o * 0.32 - c * 0.04 - 0.01;
    if (o > 0.03) {
      fx.beginPath(); fx.moveTo(px(l), py(cornerY)); fx.quadraticCurveTo(px(0), py(upMid + (upMid - cornerY)), px(r), py(cornerY)); fx.quadraticCurveTo(px(0), py(loMid + (loMid - cornerY)), px(l), py(cornerY));
      fx.fillStyle = '#6a2026'; fx.fill();
      if (F.mt > 0.02) { fx.save(); fx.clip(); fx.fillStyle = '#fbf6ee'; const th = lerp(0.07, 0.5, F.mt) * Math.max(0.05, o * 0.32 + 0.02); fx.fillRect(px(l), py(upMid + 0.05), w * U, (th + 0.05) * U); if (F.mt > 0.7) { fx.fillRect(px(l), py(loMid + 0.02 + th * 0.4), w * U, th * 0.5 * U); } fx.restore(); }
      fx.strokeStyle = lipsDk; fx.lineWidth = 0.035 * U; fx.stroke();
      fx.fillStyle = P.lips; fx.globalAlpha = 0.85; fx.beginPath(); fx.ellipse(px(0), py(loMid - 0.035), w * 0.28 * U, 0.04 * U, 0, 0, 7); fx.fill(); fx.globalAlpha = 1;
    } else {
      fx.strokeStyle = lipsDk; fx.lineCap = 'round'; fx.lineWidth = 0.045 * U;
      fx.beginPath(); fx.moveTo(px(l), py(cornerY)); fx.quadraticCurveTo(px(0), py(upMid + (upMid - cornerY)), px(r), py(cornerY)); fx.stroke();
      fx.fillStyle = P.lips; fx.globalAlpha = 0.75; fx.beginPath(); fx.ellipse(px(0), py(cy - 0.08 - c * 0.03), w * 0.22 * U, 0.045 * U, 0, 0, 7); fx.fill(); fx.globalAlpha = 1;
    }
  }
  function paintFace(F, open) {
    fx.clearRect(0, 0, FW, FH);
    if (F.blush > 0.02) for (const sx of [-1, 1]) {
      const bx = px(sx * 0.98), byp = py(-0.42), r = 0.42 * K.blushSize * U, g = fx.createRadialGradient(bx, byp, 0, bx, byp, r);
      g.addColorStop(0, `rgba(240,120,120,${0.55 * F.blush})`); g.addColorStop(1, 'rgba(240,120,120,0)');
      fx.save(); fx.translate(bx, byp); fx.scale(1, 0.55); fx.translate(-bx, -byp); fx.fillStyle = g; fx.fillRect(bx - r, byp - r, 2 * r, 2 * r); fx.restore();
    }
    // The nose's shadow, a short soft curve under its tip.
    fx.strokeStyle = shade(P.skin, -0.3); fx.lineWidth = 0.035 * U; fx.lineCap = 'round'; fx.beginPath(); fx.arc(px(0.02), py(K.noseY - 0.12 * K.noseSize), 0.1 * K.noseSize * U, Math.PI * 0.15, Math.PI * 0.75); fx.stroke();
    for (const sx of [-1, 1]) { drawEye(sx, F, open); drawBrow(sx, F); }
    drawMouth(F);
    if (F.tears > 0.05) for (const sx of [-1, 1]) {
      const x = sx * (K.eyeX - 0.05), y0 = K.eyeY - 0.2 * K.eyeH, len = 0.75 * F.tears;
      fx.strokeStyle = 'rgba(150,205,240,0.9)'; fx.lineWidth = 0.08 * U; fx.lineCap = 'round'; fx.beginPath(); fx.moveTo(px(x), py(y0)); fx.quadraticCurveTo(px(x + sx * 0.06), py(y0 - len * 0.5), px(x + sx * 0.02), py(y0 - len)); fx.stroke();
      fx.fillStyle = 'rgba(150,205,240,0.95)'; fx.beginPath(); fx.arc(px(x + sx * 0.02), py(y0 - len), 0.06 * U, 0, 7); fx.fill();
    }
    ftex.needsUpdate = true;
  }
  // ── Hair. ──
  const hair = (geo, x, y, z, rot, hex) => piece(geo, hex || P.hair, head, x, y, z, { rot, ink: 0.05 });
  // The cap: over the whole crown and down the back and sides, its front edge drawn back to a hairline (higher in the middle of the forehead, lower
  // at the temples) by tucking the vertices in front of it inside the head.
  const cap = new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.64); cap.scale(1.8, 2.2, 2.02);
  { const p = cap.attributes.position, q = new V3();
    for (let i = 0; i < p.count; i++) { q.fromBufferAttribute(p, i); const front = q.z / 2.02, line = lerp(0.15, 1.05, ss(0.25, 0.85, front)); if (front > 0.2 && q.y + 0.1 < line) { q.multiplyScalar(0.8); p.setXYZ(i, q.x, q.y, q.z); } }
    cap.computeVertexNormals(); }
  const HV = K.hairVol; cap.scale(HV, HV, HV);
  hair(cap, 0, 0.1, -0.04, [0, 0, 0]);
  hair(ell(1.62 * HV, 1.85 * HV, 1.3 * HV), 0, 0.15, -0.55);
  // A fringe: soft swoops across the forehead, parted a little off centre.
  for (const [x, y, rz, w, len, hex] of [[0.6, 1.2, -0.85, 1.05, 0.62, P.hair], [-0.5, 1.16, 0.75, 0.95, 0.58, P.hairHi], [-1.3, 0.78, 1.3, 0.62, 0.52, P.hair], [1.32, 0.78, -1.3, 0.62, 0.52, P.hair], [0.05, 1.32, 0.1, 0.7, 0.45, P.hair]])
    if (K.fringe > 0.02) hair(ell(w * K.fringe, len * K.fringe, 0.34), x, y, (1.72 - Math.abs(x) * 0.4) * HV, [-0.45, Math.sign(x) * 0.35, rz], hex);
  { const s = new THREE.Mesh(arc(1.4, 0.08, Math.PI * 0.18, Math.PI * 0.62), mat(P.hairHi)); s.position.set(0.1, 1.7, 0.35); s.rotation.set(-1.25, 0, 0.35); head.add(s); }       // (a band of shine across the crown)
  // Long hair falls from swinging pivots: two side locks by the face and the back of it to her shoulder blades. They hang with gravity (see tick).
  rig.dangles = [];
  // A chain of segments [[length, rx, rz], …] from a pivot on the head; each hangs from the end of the one before.
  const dangle = (x, y, z, segs, o) => {
    let parent = head;
    segs = segs.map(([len, rx, rz]) => [len * K.hairLen, rx, rz]);
    segs.forEach(([len, rx, rz], i) => {
      const g = new THREE.Group(); if (i === 0) g.position.set(x, y, z); else g.position.y = -segs[i - 1][0]; parent.add(g);
      piece(ell(rx, len * 0.58, rz), P.hair, g, 0, -len * 0.5, 0, { ink: 0.05 });
      rig.dangles.push(Object.assign({ g, ax: 0, az: 0, vx: 0, vz: 0, len, seg: i }, o)); parent = g;
    });
  };
  if (S.hair === 'long') {
    dangle(0, 0.3, -1.05, [[3.2, 1.55, 0.6], [2.6, 1.3, 0.5]], { min: -0.05, max: 1.2, side: 0.5, grav: 0.85 });
    // The front strands spring from the outer edges of the fringe, beside her face (framing it, never over it), and hang a little forward, over the
    // front of the cloak rather than off her shoulders.
    for (const sx of [-1, 1]) dangle(sx * 1.55, 0.75, 0.55, [[2.2, 0.44, 0.42], [1.8, 0.38, 0.34]], { min: -0.4, max: 1.3, side: 0.35, grav: 0.9, sx, front: true });
  } else {
    hair(ell(1.0, 0.95, 0.95), 0, 0.8, -1.7);                                            // the bun
    hair(new THREE.TorusGeometry(0.75, 0.16, 6, 16), 0, 0.8, -1.35, [0, 0, 0], P.hairHi);
    hair(ell(0.3, 0.75, 0.22), 1.02, 1.25, 1.12, [-0.6, 0.45, -0.6], '#b8b0a6');           // grey at the temple
    for (const sx of [-1, 1]) hair(ell(0.42, 1.1, 0.45), sx * 1.42, -0.2, 0.35, [0, 0, sx * 0.1]);
  }

  // ── Her cloak: a scarlet capelet over the shoulders, longest at the back, with the hood down on her back or up over her hair. ──
  const cloakParts = [];
  if (id === 'red' && look.outfit !== 'No cloak') {
    const prof = [[9.15, 1.32], [8.75, 2.6], [8.1, 3.7], [7.2, 4.05], [6.0, 4.15], [4.0, 4.2]];
    const rAt = y => { for (let i = 1; i < prof.length; i++) if (y >= prof[i][0]) { const [y0, r0] = prof[i - 1], [y1, r1] = prof[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return prof[prof.length - 1][1]; };
    const DEP = 0.8, PH0 = 0.42, PH1 = Math.PI * 2 - 0.42;
    const hem = phi => { const b = (1 - Math.cos(phi)) / 2; return 9.15 - (3.05 + 2.3 * Math.pow(b, 1.4)) * K.cloakLen; };
    const fn = (u, v) => { const phi = lerp(PH0, PH1, u), y = lerp(9.15, hem(phi), v), r = (rAt(y) + 0.12 * Math.sin(u * Math.PI * 9) * v) * Math.max(K.cloakWidth, K.chestWidth, K.armGirth * 0.95);
      const dep = lerp(DEP, 0.6, Math.max(0, Math.cos(phi)));      // (the front panels lie close over the bust; the back stands off the shoulder blades)
      return new V3(Math.sin(phi) * r, y, Math.cos(phi) * r * dep * TD); };
    const out = p => new V3(p.x, 0, p.z);
    // The cape's sides are carried partly by the arms under them, so it lifts with them rather than letting them through.
    const capeW = p => { const side = 0.55 * ss(1.6, 3.2, Math.abs(p.x)) * ss(-0.4, 0.9, p.z) * ss(9.0, 7.4, p.y);      // (front and sides only: the back stays on her back)
      return [[rig.torso, 1 - side], [p.x > 0 ? rig.armL : rig.armR, side]]; };
    // (whatever rests on her upper back, Gerda's hand, rests on the cape: the point is moved out to its surface, between the shoulder blades)
    { const yb = rig.upperBack.position.y + D.torsoY, back = fn(0.5, (9.15 - yb) / (9.15 - hem(Math.PI))); rig.upperBack.position.z = Math.min(rig.upperBack.position.z, back.z - 0.12); }
    cloakParts.push(skinnedOn(rig.torso, surface(fn, 40, 10, out), P.cloak, capeW, { side: THREE.DoubleSide, ink: 0.07 }));
    cloakParts.push(skinnedOn(rig.torso, surface((u, v) => { const p = fn(u, 0.93 + 0.07 * v); return p.add(out(p).normalize().multiplyScalar(0.04)); }, 40, 1, out), P.lace, capeW, { side: THREE.DoubleSide, ink: 0 }));
    cloakParts.push(piece(ell(0.32, 0.32, 0.22), '#e8b84a', rig.torso, 0, 8.95, 1.15));       // the clasp
    for (const sx of [-1, 1]) cloakParts.push(piece(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), P.lace, rig.torso, sx * 0.3, 8.3, 1.25, { rot: [0.2, 0, sx * 0.25], ink: 0 }));
    if (look.outfit === 'Hood up') {
      const hg = new THREE.SphereGeometry(2.05, 24, 14, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, Math.PI * 0.72); hg.scale(1, 1.06, 1.1);
      cloakParts.push(piece(hg, P.cloak, head, 0, 0.25, -0.15, { side: THREE.DoubleSide, ink: 0.06 }));
      cloakParts.push(piece(ell(0.7, 0.9, 0.7), P.cloak, head, 0, 1.2, -2.0, { rot: [-0.6, 0, 0] }));
    } else {
      cloakParts.push(piece(ell(1.75, 1.05, 0.95), P.cloak, rig.torso, 0, 8.25, -2.45, { rot: [0.35, 0, 0] }));
      cloakParts.push(piece(ell(1.25, 0.6, 0.5), P.cloakDk, rig.torso, 0, 8.55, -2.05, { rot: [0.35, 0, 0], ink: 0 }));
    }
  }

  // ── Expressions: brows, lids, the look of the eyes, the mouth, a flush and tears. Changes ease in (see tick). ──
  const EX = EXPRS, F = Object.assign({ brow: 0, browY: 0, open: 1, look: 0, blush: 0, tears: 0, ms: 1 }, MOUTHS.flat), drawn = {};
  let target = Object.assign({}, EX.calm), blinkWait = 2 + Math.random() * 3, blinkPhase = 0, blink = 0, t = 0;      // (blinkPhase: 0 open, waiting; 1 closing; 2 opening)
  rig.setExpr = name => { const e = EX[name] || EX.calm; target = Object.assign({}, e, MOUTHS[e.mouth] || MOUTHS.flat); rig.expr = EX[name] ? name : 'calm'; };
  // Redraw the face when anything on it has moved (expressions ease over a few frames; a blink is quick).
  function applyFace(force) {
    const open = clamp(F.open * (1 - blink), 0, 1.15);
    let moved = force || Math.abs((drawn.open == null ? -9 : drawn.open) - open) > 0.004;
    for (const k in F) if (!moved && Math.abs((drawn[k] == null ? -9 : drawn[k]) - F[k]) > 0.003) moved = true;
    if (!moved) return;
    paintFace(F, open); Object.assign(drawn, F); drawn.open = open;
  }


  // ── Clothes and marks (her): the skirt down or lifted, the drawers up or down, the colour on each cheek. ──
  const marks = { L: -1, R: -1 };
  // The marks: every point of the seat and the skin around it (the hips, the small of the back, the tops of the thighs) coloured by one smooth rule,
  // deepest where each cheek is struck and fading with distance from it, so there are no edges anywhere.
  const markAt = { L: rig.rear.L.position.clone().add(pivotAt(1)), R: rig.rear.R.position.clone().add(pivotAt(-1)) };
  const pinkL = srgb('#e8706c'), redL = srgb('#b02228'), tc = new THREE.Color();
  // Worked out in the hips' space as she is now posed: each point carried by the bone it rides on (a thigh, a cheek's pivot), each mark where its
  // cheek has turned to, so the colour stays round the marks however her legs are set.
  const tq_ = new THREE.Quaternion(), tp_ = new V3(), mNow = { L: new V3(), R: new V3() }, rotKey = { v: '' };
  const moved = (b, p) => p.clone().sub(b.position).applyQuaternion(b.quaternion).add(b.position);
  function bleed(force) {
    const key = [rig.seatPivot.L, rig.seatPivot.R, rig.thighL, rig.thighR].map(b => b.quaternion.toArray().map(x => x.toFixed(2)).join()).join('|');
    if (!force && key === rotKey.v) return; rotKey.v = key;
    for (const s of ['L', 'R']) mNow[s].copy(moved(rig.seatPivot[s], markAt[s]));
    for (const t of tints) {
      for (let i = 0; i < t.at.length; i++) {
        tc.copy(t.base); const q = !t.bone ? t.at[i] : t.follow ? t.at[i].clone().lerp(moved(t.bone, t.at[i]), t.follow[i]) : moved(t.bone, t.at[i]);
        for (const s of ['L', 'R']) { const m = marks[s]; if (m <= 0.005) continue; const w = Math.exp(-q.distanceToSquared(mNow[s]) / (2 * 1.5 * 1.5)); tc.lerp(pinkL, Math.min(0.75, 0.95 * Math.sqrt(m) * w)); tc.lerp(redL, Math.min(0.62, 0.8 * m * m * w * w)); }
        t.col[i * 3] = tc.r; t.col[i * 3 + 1] = tc.g; t.col[i * 3 + 2] = tc.b;
      }
      t.geo.attributes.color.needsUpdate = true;
    }
  }

  rig.setDress = d => {
    d = d || {};
    // skirt: 'down', 'up' (lifted, gathered at the waist) or 'off' (gone, waistband and all: the editor's view for reading proportions).
    {
      const sk = d.skirt || 'down', down = sk === 'down', bare = !down && d.drawers === 'down';
      for (const m of [skirt, hemBand, apron]) if (m) show(m, down);
      roll.visible = sk === 'up'; waist.visible = sk !== 'off';
      drawers.forEach(m => show(m, !bare)); drawersDown.forEach(m => show(m, bare));
    }
    const mk_ = d.marks || { L: 0, R: 0 };
    let any = false; for (const s of ['L', 'R']) { const m = Math.round((mk_[s] || 0) * 100) / 100; if (m !== marks[s]) { marks[s] = m; any = true; } }
    if (any) bleed(true);
  };

  // ── Each frame: the face eases toward its expression, she blinks, breathes, and the long hair hangs with gravity and swings as she moves. ──
  const gW = new V3(), tq = new THREE.Quaternion(), wp = new V3(), tip = new V3();
  // What the long hair can't pass through, in the torso's space (ellipsoids, a little larger than the shape, for the hair's own thickness): her back
  // and shoulders; or, with the cloak on and the hood down, the cloak and the bunched hood.
  const cloakOn = id === 'red' && look.outfit !== 'No cloak', hoodDown = cloakOn && look.outfit !== 'Hood up', CW = Math.max(K.cloakWidth, K.chestWidth, K.armGirth * 0.95);
  const colliders = [{ c: new V3(0, 5.4, 0), r: new V3(3.1 * K.chestWidth + 0.5, 5.4, 2.1 * TD * K.chestWidth + 0.5) }];
  if (hoodDown) colliders.push({ c: new V3(0, 5.6, 0), r: new V3(4.2 * CW + 0.4, 5.6, 3.35 * TD * CW + 0.4) }, { c: new V3(0, 8.25, -2.45), r: new V3(2.2, 1.5, 1.4) });
  const lc = new V3();
  // (shrink: the front strands lie closer, over her chest, so they drape over it rather than being held off it)
  const inside = (pW, shrink) => { rig.torso.worldToLocal(lc.copy(pW)); let pen = 0; for (const k of colliders) { const q = lc.clone().sub(k.c).divide(k.r.clone().subScalar(shrink || 0)), l = q.length(); if (l < 1) pen += 1 - l; } return pen; };
  const penOf = d => { const sh = d.front ? 0.6 : 0; d.g.updateMatrixWorld(true); return inside(d.g.localToWorld(tip.set(0, -d.len, 0)), sh) + inside(d.g.localToWorld(tip.set(0, -d.len * 0.5, 0)), sh); };
  rig.tick = dt => {
    dt = clamp(dt || 1 / 60, 0, 0.1); t += dt;
    const k = 1 - Math.exp(-dt * 10);
    for (const key in F) F[key] = lerp(F[key], target[key] == null ? (key === 'ms' ? 1 : 0) : target[key], k);
    if (blinkPhase === 0) { blinkWait -= dt; if (blinkWait <= 0) blinkPhase = 1; }
    else if (blinkPhase === 1) { blink += dt * 14; if (blink >= 1) { blink = 1; blinkPhase = 2; } }
    else { blink -= dt * 9; if (blink <= 0) { blink = 0; blinkPhase = 0; blinkWait = 2.5 + Math.random() * 3.5; } }
    applyFace(); rig.followThighs(); if (marks.L > 0.005 || marks.R > 0.005) bleed();
    const br = Math.sin(t * 1.6) * (rig.breath == null ? 1 : rig.breath);
    rig.torso.scale.set(1 + 0.006 * br, 1 + 0.004 * br, 1 + 0.014 * br);
    root_.updateMatrixWorld(true);
    for (const d of rig.dangles) {
      // Gravity in the pivot's parent's space: the hair hangs toward it, as far as it can go without passing into her head.
      d.g.parent.getWorldQuaternion(tq).invert(); gW.set(0, -1, 0).applyQuaternion(tq);
      d.g.getWorldPosition(wp); const v = d.prev ? wp.clone().sub(d.prev).divideScalar(Math.max(dt, 1e-3)) : new V3(); d.prev = wp.clone(); if (v.length() > 200) v.set(0, 0, 0);
      const lv = v.applyQuaternion(tq).multiplyScalar(0.012);
      let tx = Math.atan2(-gW.z, -gW.y) * d.grav - lv.z, tz = Math.atan2(gW.x, -gW.y) * d.grav * d.side + lv.x * d.side;
      tx = clamp(tx, d.min, d.max); tz = clamp(tz, -0.9, 0.9);
      if (d.sx) tz = d.sx > 0 ? clamp(tz, -0.05, 0.9) : clamp(tz, -0.9, 0.05);       // (a side lock never swings in across her face)
      if (d.front) { tx += d.seg ? 0 : 0.14; tz = clamp(tz, -0.35, 0.35); }                     // (the front strands lean forward and swing out only a little)
      // Kept out of her back (or the cloak): if the place it would hang is inside, the place moves to the nearest clear spot (searched outward along
      // each way it can swing, keeping to last frame's way unless another is clearly nearer), and the spring settles it there, smoothly.
      const penAt = (ax, az) => { d.g.rotation.set(-ax, 0, az); return penOf(d); };
      if (penAt(tx, tz) > 0) {
        let best = null;
        for (const [k, ux, uz] of [[0, 1, 0], [1, -1, 0], [2, 0, 1], [3, 0, -1]]) {
          for (let a = 0.03; a <= 1.5; a += 0.03) if (penAt(tx + ux * a, tz + uz * a) <= 0) { const cost = a + (k === d.way ? 0 : 0.12) - (d.front && k === 0 ? 0.25 : 0); if (!best || cost < best.cost) best = { cost, k, x: tx + ux * a, z: tz + uz * a }; break; }
        }
        if (best) { d.way = best.k; tx = best.x; tz = best.z; }
      }
      if (d.front && d.seg > 0) tx = Math.min(tx, 0.55);                              // (the lower half of a front strand drapes; it never juts out)
      d.tx = d.tx == null ? tx : lerp(d.tx, tx, 1 - Math.exp(-dt * 12)); d.tz = d.tz == null ? tz : lerp(d.tz, tz, 1 - Math.exp(-dt * 12));      // (eased, so the rest place never jumps)
      d.vx += (60 * (d.tx - d.ax) - 9 * d.vx) * dt; d.ax += d.vx * dt; d.vz += (60 * (d.tz - d.az) - 9 * d.vz) * dt; d.az += d.vz * dt;
      d.g.rotation.set(-d.ax, 0, d.az);
    }
  };

  // How far a ball (centre pW in the world, radius r in world units) is inside any of this figure's solids (so far, a seated drape).
  rig.penetration = (pW, r) => { if (!rig.solids.length) return 0; const sc = root_.getWorldScale(new V3()).x, q = rig.hips.worldToLocal(pW.clone()); let pen = 0; for (const f of rig.solids) pen = Math.max(pen, f(q, r / sc)); return pen * sc; };
  rig.eyesOpen = () => F.open * (1 - blink);      // (how open the eyes are now, blinks included)
  rig.meshes = shadowy;
  rig.setExpr('calm'); Object.assign(F, target); rig.setDress({}); applyFace(true);
  return rig;
}

// ── Expressions. brow: inner ends up (+) or down (-); open: how open the eyes are; mouth: which mouth; blush, tears: 0..1. ──
// Pushed further than life, to read on the bigger heads: ms is the mouth's size.
// The mouths, as shapes the painted mouth eases between: width, curve (+ corners up), how open, and how much of the teeth show.
const MOUTHS = { flat: { mw: 0.42, mc: 0.05, mo: 0, mt: 0 }, smile: { mw: 0.6, mc: 0.6, mo: 0.06, mt: 0.6 }, frown: { mw: 0.48, mc: -0.5, mo: 0, mt: 0 },
  open: { mw: 0.48, mc: -0.15, mo: 0.8, mt: 0.15 }, gritted: { mw: 0.7, mc: -0.3, mo: 0.36, mt: 1 }, pout: { mw: 0.26, mc: -0.2, mo: 0.1, mt: 0 } };
const EXPRS = {
  calm:      { brow: 0, browY: 0, open: 0.95, mouth: 'flat', blush: 0, ms: 1 },
  smile:     { brow: 0.1, browY: 0.08, open: 0.72, mouth: 'smile', blush: 0.35, ms: 1.3 },
  shy:       { brow: 0.28, browY: 0.04, open: 0.55, look: -1, mouth: 'smile', blush: 1, ms: 0.85 },
  cheeky:    { brow: -0.22, browY: 0.12, open: 0.62, look: 1, mouth: 'smile', blush: 0.1, ms: 1.2 },
  pout:      { brow: 0.2, browY: -0.04, open: 0.8, look: -0.6, mouth: 'pout', blush: 0.5, ms: 1.35 },
  stern:     { brow: -0.42, browY: -0.1, open: 0.75, mouth: 'flat', blush: 0, ms: 0.9 },
  surprised: { brow: 0.3, browY: 0.2, open: 1.1, mouth: 'open', blush: 0.3, ms: 0.75 },
  wince:     { brow: 0.42, browY: 0.08, open: 0.4, mouth: 'frown', blush: 0.65, ms: 1.25 },
  gritted:   { brow: 0.5, browY: 0.04, open: 0.1, mouth: 'gritted', blush: 0.9, ms: 1.2 },
  crying:    { brow: 0.6, browY: 0.16, open: 0.2, mouth: 'open', blush: 1, tears: 1, ms: 1.5 },
};

// ── A standing idle: the weight drifts from foot to foot, the arms hang easy, the head wanders a little. ──
function idle(r, t) {
  const sh = Math.sin(t * 0.5), sw = Math.sin(t * 0.8);
  r.hips.position.set(0.18 * sh, DIM.hipY - 0.35 + 0.03 * Math.sin(t * 1.6), 0);      // (a little low: the knees soft, so the planted feet can always be reached) r.hips.rotation.set(0, 0.03 * sw, 0.025 * sh);
  r.torso.rotation.set(0.02 * Math.sin(t * 1.6), -0.04 * sw, -0.03 * sh);
  r.neck.rotation.set(0.04 * Math.sin(t * 0.37), 0.15 * Math.sin(t * 0.23), 0.03 * Math.sin(t * 0.41) - 0.5 * r.torso.rotation.z);
  r.head.rotation.set(0, 0, 0);
  for (const [s, side] of [['L', 1], ['R', -1]]) {
    r['arm' + s].rotation.set(0.03 * Math.sin(t * 1.1 + side), 0, side * (0.13 + 0.02 * sh * side)); r['elbow' + s].rotation.set(-0.22 - 0.03 * Math.sin(t * 1.1 + side), 0, 0); r['hand' + s].rotation.set(0.1, 0, side * 0.05);
  }
  plantFeet(r);
}
// Feet planted: each ankle held at its own spot just above the floor (its sole's height: the sole is what stands on the floor) (in the root's space, under its hip at rest, a touch apart), however the hips sway. The
// thigh and knee are solved to reach it, the knee bending forward; the foot is turned to lie flat.
const _pf = { q: new THREE.Quaternion(), m: new THREE.Matrix4(), dn: new V3(0, -1, 0) };
function plantFeet(r) {
  r.root.updateMatrixWorld(true);
  const L1 = DIM.thigh, L2 = DIM.shin;
  for (const [s, side] of [['L', 1], ['R', -1]]) {
    const thigh = r['thigh' + s], knee = r['knee' + s], ankle = r['ankle' + s];
    const T = r.root.localToWorld(new V3(side * (DIM.hipX + 0.08), 0.75, 0.05)), Tl = r.hips.worldToLocal(T);      // (in the hips' space)
    const v = Tl.sub(thigh.position), d = clamp(v.length(), 1, L1 + L2 - 0.02); v.normalize();
    const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), k = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    const fwd = new V3(0, 0, 1).addScaledVector(v, -v.z).normalize(), u = v.clone().multiplyScalar(Math.cos(a)).addScaledVector(fwd, Math.sin(a));
    thigh.quaternion.setFromUnitVectors(_pf.dn, u); knee.rotation.set(k, 0, 0);
    r.root.updateMatrixWorld(true);
    ankle.parent.getWorldQuaternion(_pf.q).invert(); ankle.quaternion.copy(_pf.q.multiply(r.root.getWorldQuaternion(new THREE.Quaternion())));
  }
}
// Seated upright on a seat whose top is at seatY (in the world, with the root at the floor): thighs level, shins straight down to the floor.
function sit(r, seatY) {
  const s = r.scaleW, kneeH = DIM.shin + 0.8;
  r.hips.position.set(0, seatY / s + 2.55, 0);      // (the hips' underside on the seat)
  for (const l of [r.legL, r.legR]) { const drop = r.hips.position.y - kneeH; l.thigh.rotation.set(-Math.PI / 2 + Math.asin(clamp(drop / DIM.thigh, -0.5, 0.5)), 0, l.sign * 0.06); l.knee.rotation.set(Math.PI / 2 - Math.asin(clamp(drop / DIM.thigh, -0.5, 0.5)), 0, 0); l.ankle.rotation.set(0, 0, 0); }
}
// The seat height at which a figure sits with level thighs and its feet on the floor.
const seatFor = id => (DIM.shin + 0.8 - 2.55) * SPECS[id].scale;

// ── Props. ──
function makeChair(seatY) {
  const g = new THREE.Group(), wood = '#9a6838', dark = '#6e4626', box = (w, h, d, x, y, z, hex) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
    m.add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, d + 0.14), INKM[0])); g.add(m); boxes.push({ c: new V3(x, y, z), h: new V3(w / 2, h / 2, d / 2) }); return m; };
  const boxes = [];
  box(9.4, 0.9, 9.2, 0, seatY - 0.45, 1.8, wood);
  for (const [x, z] of [[-4.1, -2.3], [4.1, -2.3], [-4.1, 6.0], [4.1, 6.0]]) box(0.9, seatY - 0.9, 0.9, x, (seatY - 0.9) / 2, z, dark);
  for (const x of [-4.1, 4.1]) box(0.9, 11, 0.9, x, seatY + 5.5, -2.7, dark);
  box(9.2, 2.2, 0.6, 0, seatY + 9.6, -2.75, wood); box(9.2, 1.4, 0.5, 0, seatY + 6.2, -2.75, wood);
  // How far a ball (world centre, radius) is inside any part of the chair.
  g.penetration = (pW, r) => { const q = g.worldToLocal(pW.clone()); let pen = 0; for (const b of boxes) { const dx = b.h.x + r - Math.abs(q.x - b.c.x), dy = b.h.y + r - Math.abs(q.y - b.c.y), dz = b.h.z + r - Math.abs(q.z - b.c.z); if (dx > 0 && dy > 0 && dz > 0) pen = Math.max(pen, Math.min(dx, dy, dz)); } return pen; };
  return g;
}
// The paddle, held in the hand: the handle in the fist, the blade beyond, its faces along the hand's x (the palm's way). Blade middle at BLADE_AT.
const PADDLE = { at: 4.7, half: 0.18 };
function makePaddle() {
  const g = new THREE.Group();
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 2.6, 10), mat('#7a4e26')); h.position.y = -1.3 - 0.2; g.add(h);
  h.add(new THREE.Mesh(hullGeo(h.geometry, 0.05), INKM[0]));
  const bl = new THREE.Mesh(ell(PADDLE.half, 2.2, 1.35, 20, 12), mat('#b07a44')); bl.position.y = -PADDLE.at; g.add(bl);
  bl.add(new THREE.Mesh(hullGeo(bl.geometry, 0.06), INKM[0]));
  g.traverse(o => { if (o.isMesh && o.material !== INKM[0]) o.castShadow = true; });
  return g;
}

setTune(loadTune(), false);
const Toon = { make, idle, sit, seatFor, makeChair, makePaddle, PADDLE, DIM, SPECS, EXPRS, TUNE, getTune, setTune, resetTune, palette, shade, mat, flat, hullGeo, INKM, ell, lathe };
root.Toon = Toon;
})(typeof window !== 'undefined' ? window : globalThis);
