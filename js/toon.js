// Red Lessons — the characters, in a soft toon style: smooth rounded bodies, two-band cel shading and a thin warm outline (an inverted hull), with
// expressive faces built from shapes. Grown-up proportions throughout: about seven heads tall.
//
// The rig is a tree of bones (THREE.Bone), so the skirts can be skinned to the legs and follow them:
//   root (at the feet) › hips › torso › neck › head;  torso › armL/armR › elbowL/elbowR › handL/handR;  hips › thighL/thighR › kneeL/kneeR › ankleL/ankleR
// Limbs swing forward for a negative turn about x (arms and thighs), elbows bend forward for a negative turn, knees back for a positive one.
//
//   const rig = Toon.make('red', look.red)        // or 'gerda'; look from js/looks.js
//   rig.setExpr('wince'); rig.setDress({ skirt: 'up', drawers: 'down', marks: { L: 0.3, R: 0.2 } }); rig.tick(dt)  (face, blinks, breath, hair)
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
  const d = new Uint8Array([172, 172, 172, 255, 222, 222, 222, 255, 255, 255, 255, 255]);
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
// Joint positions for a figure of scale 1 (about 29.7 tall, the head 4.2 of it). Each character is this figure scaled.
const DIM = { hipY: 15.2, hipX: 1.55, thigh: 7.4, shin: 7.0, torsoY: 0.9, shY: 7.6, shX: 3.05, ua: 5.0, fa: 4.4, neckY: 8.6, headY: 0.9, headC: 2.0 };
const SPECS = {
  red: { name: 'Red Riding Hood', age: 21, scale: 0.97, bust: 1, hair: 'long', feet: 'boots', skirtLen: 10.9 },
  gerda: { name: 'Gerda', age: 'late thirties', scale: 1.04, bust: 1.12, hair: 'bun', feet: 'bare', skirtLen: 13.6 },
};
// Palettes: the look's colours (js/looks.js), and each outfit's clothes.
function palette(id, look) {
  const l = look || {}, P = {};
  P.skin = l.skin || (id === 'red' ? '#f6d3b8' : '#eec4a2'); P.skinSh = shade(P.skin, -0.12);
  P.hair = l.hair || (id === 'red' ? '#7a3a22' : '#4b3022'); P.hairHi = shade(P.hair, 0.28); P.hairDk = shade(P.hair, -0.32);
  P.eyes = l.eyes || (id === 'red' ? '#4f8a62' : '#5f7f95'); P.lips = l.lips || (id === 'red' ? '#c4585e' : '#a8525a');
  P.blush = shade(P.lips, 0.35);
  if (id === 'red') {
    const cloak = l.cloak || '#c8242c';
    Object.assign(P, { cloak, cloakDk: shade(cloak, -0.35), lining: '#e9d9b8', blouse: '#f6eedf', bodice: '#3b2b30', lace: '#efe2c0', skirt: '#3c5a8c', skirtDk: '#2c4470',
      hem: '#f6eedf', boots: '#7a4a2a', bootsDk: '#58331c', drawers: '#f8f3e8', drawersDk: '#e2d8c4' });
  } else if (l.outfit === 'Fine') {
    Object.assign(P, { blouse: '#b8a6dc', bodice: '#8f7ab8', lace: '#e8c75a', skirt: '#9a86c0', skirtDk: '#7a66a4', hem: '#e8c75a', apron: null, gold: '#e8c75a' });
  } else {
    Object.assign(P, { blouse: '#efe8d8', bodice: '#7a2a3a', lace: '#e6d7b0', skirt: '#6b4a3a', skirtDk: '#54382a', hem: '#54382a', apron: '#ebe2cc', apronDk: '#d4c8ae' });
  }
  return P;
}

function make(id, look, opts) {
  opts = opts || {};
  const S = SPECS[id]; if (!S) throw new Error('Toon: unknown character ' + id);
  look = look || {}; const P = palette(id, look), D = DIM;
  const rig = { id, spec: S, look, P, scaleW: S.scale };
  const root_ = new THREE.Group(); root_.scale.setScalar(S.scale); rig.root = root_;
  const bones = [];
  const bone = (name, parent, x, y, z, order) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (order) b.rotation.order = order; parent.add(b); bones.push(b); rig[name] = b; return b; };
  bone('hips', root_, 0, D.hipY, 0); bone('torso', rig.hips, 0, D.torsoY, 0, 'YXZ'); bone('neck', rig.torso, 0, D.neckY, 0, 'YXZ'); bone('head', rig.neck, 0, D.headY, 0, 'YXZ');
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    bone('arm' + s, rig.torso, sx * D.shX, D.shY, 0, 'ZXY'); bone('elbow' + s, rig['arm' + s], 0, -D.ua, 0); bone('hand' + s, rig['elbow' + s], 0, -D.fa, 0);
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
    if (o.ink !== 0) { const h = new THREE.Mesh(hullGeo(geo, o.ink || 0.07), INKM[0]); m.add(h); }
    parent.add(m); if (o.shadow !== false) shadowy.push(m); return m;
  }

  // ── Skinning (the skirts and the apron): a geometry in the hips' space, each vertex weighted between the hips, the thighs and the shins by where it
  // hangs, so that it follows the legs: forward over the lap when seated, folded with the legs when lying across one.
  const skel = new THREE.Skeleton([rig.hips, rig.thighL, rig.thighR, rig.kneeL, rig.kneeR]);
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function legWeights(p) {
    // The back of a skirt stays with the hips over the seat and only follows the legs below it; the front follows them from the hip.
    const back = ss(0.5, -2.2, p.z), down = 0.96 * ss(lerp(0.4, -2.8, back), lerp(-3.2, -4.8, back), p.y), l = ss(-1.4, 1.4, p.x);
    const k = ss(-D.thigh + 1.4, -D.thigh - 1.8, p.y);
    return [[0, 1 - down], [1, down * l * (1 - k)], [2, down * (1 - l) * (1 - k)], [3, down * l * k], [4, down * (1 - l) * k]];
  }
  function skinned(geo, hex, o) {
    o = o || {};
    const pos = geo.attributes.position, n = pos.count;
    const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), p = new V3();
    for (let i = 0; i < n; i++) {
      p.fromBufferAttribute(pos, i);
      const ws = legWeights(p).filter(w => w[1] > 1e-4).sort((a, b) => b[1] - a[1]).slice(0, 4), tot = ws.reduce((t, w) => t + w[1], 0) || 1;
      ws.forEach(([b, w], k) => { si[i * 4 + k] = b; sw[i * 4 + k] = w / tot; });
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    geo.translate(0, D.hipY, 0);
    // (bound with the root's transform as it is now, which is the one the bones' inverses were taken in)
    const m = new THREE.SkinnedMesh(geo, mat(hex, { skin: true, side: THREE.DoubleSide })); m.frustumCulled = false; root_.add(m); m.updateMatrixWorld(true); m.bind(skel, m.matrixWorld);
    if (o.ink !== 0) { const h = new THREE.SkinnedMesh(hullGeo(geo, o.ink || 0.07), INKM[1]); h.frustumCulled = false; root_.add(h); h.updateMatrixWorld(true); h.bind(skel, h.matrixWorld); m.userData.hull = h; }
    shadowy.push(m); return m;
  }
  const show = (m, on) => { m.visible = on; if (m.userData.hull) m.userData.hull.visible = on; };

  // ── Torso: hips and seat, the waist, the ribcage and shoulders; the bust. The torso's own space starts DIM.torsoY above the hips. ──
  const top = P.blouse, Ty = D.torsoY;
  piece(lathe([[0, -2.5], [1.4, -2.35], [2.7, -1.6], [3.2, -0.4], [3.15, 0.6], [2.8, 1.6], [2.35, 2.3], [0, 2.4]], 0.72), id === 'red' ? P.skin : P.skin, rig.hips);
  // The seat: one rounded cheek on each side at the back, painted (with the marks) by setDress. The `seat` frame's +z runs into the skin where a smack lands.
  const CHEEK = { x: 1.42, y: -1.25, z: -1.35, rx: 1.72, ry: 1.85, rz: 1.45 };
  rig.cheek = {};
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 32; const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    const m = piece(ell(CHEEK.rx, CHEEK.ry, CHEEK.rz, 24, 16), null, rig.hips, sx * CHEEK.x, CHEEK.y, CHEEK.z, { material: mat(null, { map: tex }) });
    rig.cheek[s] = { mesh: m, canvas: c, tex };
  }
  const TILT = 0.35;
  rig.seat = new THREE.Object3D(); rig.seat.rotation.x = -TILT; rig.hips.add(rig.seat);
  const onCheek = (x, dir) => { const d = dir.clone().normalize(), t = 1 / Math.sqrt((d.x / CHEEK.rx) ** 2 + (d.y / CHEEK.ry) ** 2 + (d.z / CHEEK.rz) ** 2); return new V3(x, CHEEK.y, CHEEK.z).addScaledVector(d, t); };
  const outDir = new V3(0, -Math.sin(TILT), -Math.cos(TILT));
  const mk = (p, parent) => { const o = new THREE.Object3D(); o.position.copy(p); parent.add(o); return o; };
  rig.rear = { L: mk(onCheek(CHEEK.x, outDir), rig.hips), R: mk(onCheek(-CHEEK.x, outDir), rig.hips), C: mk(new V3(0, CHEEK.y + 0.9, CHEEK.z - 1.0), rig.hips) };
  rig.upperBack = mk(new V3(0, 6.2, -1.95), rig.torso);
  piece(lathe([[0, -0.6], [2.9, -0.5], [2.75, 0.6], [2.38, 2.0], [2.32, 2.9], [2.55, 4.0], [2.85, 5.3], [3.0, 6.5], [2.92, 7.5], [2.3, 8.3], [1.2, 8.8], [0, 8.95]], 0.68), top, rig.torso);
  for (const sx of [-1, 1]) piece(ell(1.18 * S.bust, 1.0 * S.bust, 0.72 * S.bust), top, rig.torso, sx * 1.12, 5.35, 1.38 + 0.12 * (S.bust - 1), { rot: [0.12, sx * 0.32, 0], ink: 0.05 });
  // The bodice: laced, from the hips to under the bust.
  piece(lathe([[2.98, -0.55], [2.82, 0.6], [2.45, 2.0], [2.4, 2.9], [2.64, 4.0], [2.9, 4.9], [2.7, 5.05]], 0.7), P.bodice, rig.torso, 0, 0, 0, { ink: 0.05 });
  for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) piece(new THREE.BoxGeometry(1.0, 0.13, 0.12), P.lace, rig.torso, 0, 0.6 + i * 1.05, 1.66 + (i > 2 ? 0.08 : 0), { rot: [0, 0, sx * 0.55], ink: 0 });
  piece(lathe([[0.62, -0.9], [0.68, 0.4], [0.62, 1.5]], 1, 14), P.skin, rig.neck);     // the neck
  piece(lathe([[1.25, -0.25], [1.4, 0.1], [1.15, 0.3]], 0.78, 18), P.blouse, rig.neck, 0, -0.35, 0, { ink: 0.04 });   // the collar

  // ── Arms: a full sleeve to the elbow (puffed at the shoulder for her), bare forearms, soft hands. ──
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const arm = rig['arm' + s], elbow = rig['elbow' + s], hand = rig['hand' + s];
    piece(ell(0.95, 0.95, 0.92), top, arm, 0, -0.15, 0);
    if (id === 'red') piece(ell(1.08, 1.15, 1.02), top, arm, sx * 0.05, -0.75, 0);
    piece(lathe([[0, 0.5], [0.72, 0.3], [0.82, -0.4], [0.74, -2.6], [0.64, -4.6], [0, -5.2]], 1, 16), top, arm);
    piece(lathe([[0.7, -4.0], [0.78, -4.5], [0.66, -5.0]], 1, 16), shade(top, -0.06), arm, 0, 0, 0, { ink: 0.04 });      // the cuff, rolled at the elbow
    piece(lathe([[0, 0.45], [0.56, 0.15], [0.6, -1.2], [0.5, -3.0], [0.4, -4.3], [0, -4.6]], 1, 16), P.skin, elbow);
    if (P.gold) piece(new THREE.TorusGeometry(0.45, 0.08, 6, 16).rotateX(Math.PI / 2), P.gold, elbow, 0, -3.9, 0, { ink: 0 });
    piece(ell(0.28, 0.98, 0.62), P.skin, hand, 0, -0.85, 0, { ink: 0.05 });
    piece(ell(0.2, 0.48, 0.21), P.skin, hand, 0, -0.42, 0.5, { rot: [0.55, 0, 0], ink: 0.05 });
  }
  // ── Legs: bare under the skirt; boots for her, bare feet for Gerda. ──
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const thigh = rig['thigh' + s], knee = rig['knee' + s], ankle = rig['ankle' + s];
    piece(lathe([[0, 0.9], [1.2, 0.6], [1.7, -0.4], [1.66, -2.5], [1.45, -5.0], [1.12, -7.0], [0.8, -7.6], [0, -7.85]], 1, 18), P.skin, thigh);
    piece(lathe([[0, 0.5], [0.98, 0.2], [1.12, -1.2], [1.14, -2.6], [0.88, -4.6], [0.6, -6.5], [0.52, -7.0], [0, -7.3]], 1, 18), P.skin, knee);
    if (S.feet === 'boots') {
      piece(lathe([[0.82, -3.6], [0.98, -3.9], [0.78, -5.6], [0.7, -7.2], [0, -7.4]], 1, 16), P.boots, knee);
      piece(lathe([[0.86, -3.55], [1.02, -3.75], [0.98, -4.1]], 1, 16), P.bootsDk, knee, 0, 0, 0, { ink: 0.04 });
      piece(ell(0.78, 0.58, 1.55), P.boots, ankle, 0, -0.42, 0.62);
    } else {
      piece(ell(0.62, 0.42, 1.45), P.skin, ankle, 0, -0.45, 0.62);
      if (P.gold) piece(new THREE.TorusGeometry(0.62, 0.08, 6, 16).rotateX(Math.PI / 2), P.gold, knee, 0, -6.4, 0, { ink: 0 });
    }
  }

  // ── The skirt (skinned to the legs), a band at its hem, Gerda's apron; her drawers, the skirt gathered up, the drawers down at her knees. ──
  const L_ = S.skirtLen;
  const skirtProfile = [[2.66, 2.1], [3.45, 0.6], [4.05, -0.8], [4.4, -3], [4.9, -6.5], [5.3, -L_ + 0.7], [5.4, -L_]];
  const skirtR = y => { const pr = skirtProfile; for (let i = 1; i < pr.length; i++) if (y >= pr[i][1]) { const [r0, y0] = pr[i - 1], [r1, y1] = pr[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return pr[pr.length - 1][0]; };
  let skirt = null, hemBand = null;
  const waist = piece(lathe([[2.72, 1.55], [2.78, 2.15], [2.66, 2.5]], 0.75, 22), P.skirtDk, rig.hips, 0, 0, 0, { ink: 0.04 });
  if (opts.seated) seatedDrape();
  else {
    skirt = skinned(lathe(skirtProfile, 0.9, 28), P.skirt);
    hemBand = skinned(lathe([[skirtR(-L_ + 0.85) + 0.07, -L_ + 0.85], [5.47, -L_ + 0.1], [5.45, -L_ - 0.05]], 0.9, 28), P.hem, { ink: 0.04 });
    if (P.apron) {
      const ap = []; for (const [r, y] of [[2.8, 1.9], [3.5, 0.4], [4.0, -1.5], [4.5, -4.5], [4.95, -8.0], [5.1, -9.5]]) ap.push([r, y]);
      skinned(lathe(ap.map(([r, y]) => [Math.max(r, skirtR(y) + 0.12), y]), 0.92, 12, -0.95, 1.9), P.apron, { ink: 0.05 });
    }
  }
  // Seated (Gerda in the lap scene) the skirt is its own drape, in the hips' space with the thighs level along +z: a tube over the lap, turned
  // round the knees, then hanging to the hem, with the apron laid along the top of it. (Skinning a skirt through a right-angled knee folds it.)
  function seatedDrape() {
    const Tk = D.thigh, drop = D.shin + 0.2, lapL = Tk + 1.5, arcL = 2.2 * Math.PI / 2, total = lapL + arcL + drop;
    const at = v => {                                  // the drape's spine: centre, the way 'up' from it, the half-width and the half-depth
      const d = v * total;
      if (d < lapL) return { c: new V3(0, 0.15, -1.5 + d), n: new V3(0, 1, 0), w: lerp(3.7, 4.0, d / lapL), h: 2.05 };
      if (d < lapL + arcL) { const a = (d - lapL) / arcL * Math.PI / 2; return { c: new V3(0, 0.15, Tk), n: new V3(0, Math.cos(a), Math.sin(a)), w: 4.0, h: 2.05 }; }
      const t = (d - lapL - arcL) / drop; return { c: new V3(0, 0.15 - t * drop, Tk + 0.4 * t), n: new V3(0, 0, 1), w: lerp(4.0, 4.9, t), h: lerp(2.05, 2.5, t) };
    };
    const tube = (a0, a1, v0, v1, lift) => (u, v) => { const f = at(lerp(v0, v1, v)), a = lerp(a0, a1, u); return f.c.clone().addScaledVector(new V3(1, 0, 0), Math.sin(a) * (f.w + lift)).addScaledVector(f.n, Math.cos(a) * (f.h + lift)); };
    const outward = p => new V3(p.x, p.z < Tk ? p.y - 0.15 : Math.max(0, p.y - 0.15), p.z < Tk ? 0 : p.z - Tk);      // (away from the spine)
    piece(surface(tube(-Math.PI, Math.PI, 0, 1, 0), 28, 30, outward), P.skirt, rig.hips, 0, 0, 0, { side: THREE.DoubleSide });
    piece(lathe([[2.66, 2.1], [3.45, 0.6], [3.9, -0.4], [3.6, -1.6]], 0.9, 24), P.skirt, rig.hips);
    piece(surface(tube(-Math.PI, Math.PI, 0.965, 1, 0.06), 28, 2, outward), P.hem, rig.hips, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.04 });
    if (P.apron) piece(surface(tube(-0.95, 0.95, 0.06, 0.78, 0.12), 12, 22, outward), P.apron, rig.hips, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.05 });
  }
  const drawers = [], drawersDown = [];
  if (id === 'red') {
    drawers.push(piece(lathe([[2.9, -2.6], [3.32, -0.4], [3.26, 0.6], [2.95, 1.5]], 0.75, 22), P.drawers, rig.hips));
    for (const [s, sx] of [['L', 1], ['R', -1]]) {
      drawers.push(piece(ell(CHEEK.rx * 1.05, CHEEK.ry * 1.05, CHEEK.rz * 1.08), P.drawers, rig.hips, sx * CHEEK.x, CHEEK.y, CHEEK.z));
      drawers.push(piece(lathe([[1.9, 0.2], [1.95, -1.6], [1.8, -2.9], [1.88, -3.1]], 1, 18), P.drawers, rig['thigh' + s]));
      drawers.push(piece(lathe([[1.86, -3.05], [1.96, -3.2], [1.84, -3.35]], 1, 18), P.drawersDk, rig['thigh' + s], 0, 0, 0, { ink: 0.03 }));
      drawersDown.push(piece(new THREE.TorusGeometry(1.42, 0.42, 8, 20).rotateX(Math.PI / 2), P.drawers, rig['thigh' + s], 0, -5.5, 0));
    }
  }
  // The skirt lifted: gathered in a roll across the small of her back.
  const roll = new THREE.Group(); rig.hips.add(roll); roll.visible = false;
  // (an oval ring hugging the back and sides of her waist, the hem's band showing along its lower edge, and the cloth bunched at each hip)
  piece(new THREE.TorusGeometry(2.75, 0.68, 10, 24, Math.PI * 1.1).rotateX(Math.PI / 2).rotateY(Math.PI * 0.95).scale(1, 1, 0.66), P.skirt, roll, 0, 2.1, 0);
  piece(new THREE.TorusGeometry(2.75, 0.24, 6, 24, Math.PI * 1.05).rotateX(Math.PI / 2).rotateY(Math.PI * 0.975).scale(1, 1, 0.7), P.hem, roll, 0, 1.45, -0.15, { ink: 0.03 });
  for (const sx of [-1, 1]) piece(ell(0.95, 0.75, 0.8), P.skirt, roll, sx * 2.55, 1.9, -0.6);

  // ── Head and face. ──
  const head = new THREE.Group(); head.position.y = D.headC; rig.head.add(head); rig.headGroup = head;
  piece(lathe([[0, -2.1], [0.6, -2.0], [1.15, -1.58], [1.46, -0.8], [1.58, 0.1], [1.6, 0.8], [1.42, 1.5], [1.0, 1.92], [0.45, 2.08], [0, 2.1]], 1.1, 26), P.skin, head, 0, 0, 0, { ink: 0.05 });
  for (const sx of [-1, 1]) piece(ell(0.24, 0.44, 0.34), P.skin, head, sx * 1.56, 0.0, -0.05, { ink: 0.05 });
  const face = new THREE.Group(); head.add(face);
  const eyes = [], brows = [];
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const e = new THREE.Group(); e.position.set(sx * 0.62, 0.12, 1.5); e.rotation.y = sx * 0.32; face.add(e);
    e.add(new THREE.Mesh(ell(0.4, 0.27, 0.16, 16, 10), flat('#fffaf2')));
    const iris = new THREE.Group(); e.add(iris); iris.position.z = 0.12;
    iris.add(new THREE.Mesh(ell(0.2, 0.24, 0.05, 14, 8), flat(P.eyes)));
    const dk = new THREE.Mesh(ell(0.19, 0.11, 0.05, 14, 8), flat(shade(P.eyes, -0.4))); dk.position.set(0, 0.11, 0.01); iris.add(dk);
    const pu = new THREE.Mesh(ell(0.09, 0.11, 0.04, 10, 6), flat('#1c1210')); pu.position.z = 0.03; iris.add(pu);
    const sh = new THREE.Mesh(ell(0.06, 0.06, 0.03, 8, 6), flat('#ffffff')); sh.position.set(0.07, 0.09, 0.05); iris.add(sh);
    const lid = new THREE.Group(); e.add(lid);
    const lash = new THREE.Mesh(arc(0.4, 0.055, 0.15, Math.PI - 0.15), flat('#2a1612')); lash.scale.y = 0.72; lash.position.z = 0.1; lid.add(lash);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.06), flat('#2a1612')); wing.position.set(sx * 0.42, 0.13, 0.08); wing.rotation.z = sx * 0.45; lid.add(wing);
    // The lid itself: skin that comes down over the eye to close or narrow it.
    const cover = new THREE.Mesh(ell(0.44, 0.3, 0.19, 16, 10), mat(P.skin)); cover.position.set(0, 0.62, 0.02); lid.add(cover);
    const b = new THREE.Mesh(arc(0.46, 0.05, 0.35, Math.PI - 0.35), flat(P.hairDk)); b.scale.y = 0.55; b.position.set(sx * 0.66, 0.6, 1.62); b.rotation.y = sx * 0.32; face.add(b);
    eyes.push({ e, iris, cover, lash, wing, sx }); brows.push({ b, sx });
  }
  piece(ell(0.15, 0.2, 0.17), P.skinSh, face, 0, -0.55, 1.68, { ink: 0 });
  // Mouths: one of these shows at a time.
  const M = {};
  const mouthAt = (m, y, z) => { m.position.set(0, y, z); face.add(m); return m; };
  M.smile = mouthAt(new THREE.Mesh(arc(0.3, 0.045, Math.PI * 1.18, Math.PI * 1.82), flat(shade(P.lips, -0.35))), -0.98, 1.56);
  M.flat = mouthAt(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.05), flat(shade(P.lips, -0.35))), -1.2, 1.55);
  M.frown = mouthAt(new THREE.Mesh(arc(0.26, 0.045, Math.PI * 0.2, Math.PI * 0.8), flat(shade(P.lips, -0.35))), -1.42, 1.5);
  { const g = new THREE.Group(); const o = new THREE.Mesh(ell(0.26, 0.2, 0.06), flat('#6a2026')); g.add(o); const lip = new THREE.Mesh(arc(0.26, 0.06, 0, Math.PI * 2), flat(P.lips)); lip.scale.y = 0.78; g.add(lip); M.open = mouthAt(g, -1.22, 1.5); }
  { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.05), flat('#fbf6ee')); g.add(t); const l = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.06), flat('#8a4a48')); g.add(l);
    const r = new THREE.Mesh(arc(0.31, 0.05, 0, Math.PI * 2), flat(P.lips)); r.scale.y = 0.4; g.add(r); M.gritted = mouthAt(g, -1.22, 1.5); }
  M.pout = mouthAt(new THREE.Mesh(ell(0.16, 0.1, 0.06), flat(P.lips)), -1.2, 1.52);
  const lowerLip = mouthAt(new THREE.Mesh(ell(0.17, 0.06, 0.05), flat(P.lips)), -1.29, 1.5);
  const blush = []; for (const sx of [-1, 1]) { const b = new THREE.Mesh(ell(0.38, 0.17, 0.05), flat(P.blush, 0.55)); b.position.set(sx * 0.98, -0.42, 1.5); b.rotation.y = sx * 0.5; face.add(b); blush.push(b); }
  const tears = []; for (const sx of [-1, 1]) { const t = new THREE.Mesh(ell(0.08, 0.32, 0.04), flat('#9fd0f0', 0.85)); t.position.set(sx * 0.66, -0.35, 1.58); t.rotation.y = sx * 0.32; face.add(t); tears.push(t); }

  // ── Hair. ──
  const hair = (geo, x, y, z, rot, hex) => piece(geo, hex || P.hair, head, x, y, z, { rot, ink: 0.05 });
  // The cap: over the whole crown and down the back and sides, its front edge drawn back to a hairline (higher in the middle of the forehead, lower
  // at the temples) by tucking the vertices in front of it inside the head.
  const cap = new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.64); cap.scale(1.8, 2.2, 2.02);
  { const p = cap.attributes.position, q = new V3();
    for (let i = 0; i < p.count; i++) { q.fromBufferAttribute(p, i); const front = q.z / 2.02, line = lerp(0.15, 1.05, ss(0.25, 0.85, front)); if (front > 0.2 && q.y + 0.1 < line) { q.multiplyScalar(0.8); p.setXYZ(i, q.x, q.y, q.z); } }
    cap.computeVertexNormals(); }
  hair(cap, 0, 0.1, -0.04, [0, 0, 0]);
  hair(ell(1.62, 1.85, 1.3), 0, 0.15, -0.55);
  // A fringe: soft swoops across the forehead, parted a little off centre.
  for (const [x, y, rz, w, len, hex] of [[0.55, 1.45, -0.85, 1.0, 0.6, P.hair], [-0.55, 1.4, 0.75, 0.9, 0.56, P.hairHi], [-1.28, 0.95, 1.35, 0.62, 0.5, P.hair], [1.3, 0.95, -1.35, 0.62, 0.5, P.hair]])
    hair(ell(w, len, 0.34), x, y, 1.3 - Math.abs(x) * 0.32, [-0.6, Math.sign(x) * 0.3, rz], hex);
  { const s = new THREE.Mesh(arc(1.4, 0.08, Math.PI * 0.18, Math.PI * 0.62), mat(P.hairHi)); s.position.set(0.05, 1.05, 0.95); s.rotation.set(-0.9, 0, 0.3); head.add(s); }
  // Long hair falls from swinging pivots: two side locks by the face and the back of it to her shoulder blades. They hang with gravity (see tick).
  rig.dangles = [];
  // A chain of segments [[length, rx, rz], …] from a pivot on the head; each hangs from the end of the one before.
  const dangle = (x, y, z, segs, o) => {
    let parent = head;
    segs.forEach(([len, rx, rz], i) => {
      const g = new THREE.Group(); if (i === 0) g.position.set(x, y, z); else g.position.y = -segs[i - 1][0]; parent.add(g);
      piece(ell(rx, len * 0.58, rz), P.hair, g, 0, -len * 0.5, 0, { ink: 0.05 });
      rig.dangles.push(Object.assign({ g, ax: 0, az: 0, vx: 0, vz: 0 }, o)); parent = g;
    });
  };
  if (S.hair === 'long') {
    dangle(0, 0.3, -1.05, [[3.2, 1.55, 0.6], [2.6, 1.3, 0.5]], { min: -0.05, max: 1.2, side: 0.5, grav: 0.85 });
    for (const sx of [-1, 1]) dangle(sx * 1.42, 0.55, 0.55, [[2.2, 0.48, 0.42], [1.8, 0.4, 0.34]], { min: -0.4, max: 1.3, side: 0.9, grav: 0.9, sx });
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
    const hem = phi => { const b = (1 - Math.cos(phi)) / 2; return 6.1 - 2.3 * Math.pow(b, 1.4); };
    const fn = (u, v) => { const phi = lerp(PH0, PH1, u), y = lerp(9.15, hem(phi), v), r = rAt(y) + 0.12 * Math.sin(u * Math.PI * 9) * v; return new V3(Math.sin(phi) * r, y, Math.cos(phi) * r * DEP); };
    const out = p => new V3(p.x, 0, p.z);
    cloakParts.push(piece(surface(fn, 40, 10, out), P.cloak, rig.torso, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.07 }));
    cloakParts.push(piece(surface((u, v) => { const p = fn(u, 0.93 + 0.07 * v); return p.add(out(p).normalize().multiplyScalar(0.04)); }, 40, 1, out), P.lace, rig.torso, 0, 0, 0, { side: THREE.DoubleSide, ink: 0 }));
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
  const EX = EXPRS, F = { brow: 0, browY: 0, open: 1, look: 0, blush: 0, tears: 0 };
  let target = Object.assign({}, EX.calm), blinkT = 2 + Math.random() * 3, blink = 0, t = 0;
  rig.setExpr = name => { target = Object.assign({}, EX[name] || EX.calm); rig.expr = EX[name] ? name : 'calm'; for (const k in M) M[k].visible = k === target.mouth; lowerLip.visible = target.mouth === 'smile' || target.mouth === 'flat'; };
  function applyFace() {
    for (const { b, sx } of brows) { b.rotation.z = sx * F.brow; b.position.y = 0.6 + F.browY; }
    const open = clamp(F.open * (1 - blink), 0.04, 1.1);
    for (const ey of eyes) { ey.cover.position.y = lerp(0.03, 0.62, open); ey.lash.position.y = lerp(-0.18, 0, open); ey.wing.position.y = lerp(-0.05, 0.13, open); ey.iris.position.x = F.look * 0.06; }
    blush.forEach(b => { b.material.opacity = 0.2 + 0.5 * F.blush; b.visible = F.blush > 0.02; });
    tears.forEach(tr => { tr.visible = F.tears > 0.05; tr.scale.y = F.tears; });
  }

  // ── Clothes and marks (her): the skirt down or lifted, the drawers up or down, the colour on each cheek. ──
  const marks = { L: -1, R: -1 };
  function paintCheek(s, m) {
    const ck = rig.cheek[s], c = ck.canvas, x = c.getContext('2d'), W = c.width, H = c.height;
    x.fillStyle = P.skin; x.fillRect(0, 0, W, H);
    x.fillStyle = shade(P.skin, -0.05); x.fillRect(0, H * 0.82, W, H * 0.18);
    if (m > 0.005) {
      // The colour sits on the part that faces up across a lap (u ≈ 0.75 runs round to the back, v a little below the middle).
      const cx = 0.75 * W, cy = (0.5 + TILT / Math.PI) * H, seed = s === 'L' ? 3 : 7;
      const blot = (rgba, r, a) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba + a + ')'); g.addColorStop(0.65, rgba + a * 0.7 + ')'); g.addColorStop(1, rgba + '0)');
        x.save(); x.translate(cx, cy); x.scale(1, 1.6); x.translate(-cx, -cy); x.fillStyle = g; x.fillRect(0, 0, W, H); x.restore(); };
      blot('rgba(232,112,108,', 7 + 7 * Math.sqrt(m), Math.min(0.7, 0.75 * Math.sqrt(m)));
      blot('rgba(176,34,40,', 4 + 6 * m, Math.min(0.75, 0.8 * m * m));
      for (let i = 0; i < 9; i++) { const a = (i * 2.4 + seed), r = 2 + (i % 4); x.fillStyle = `rgba(196,52,56,${0.25 * m})`; x.beginPath(); x.ellipse(cx + Math.cos(a) * 5 * m, cy + Math.sin(a) * 6 * m, r, r * 1.4, 0, 0, 7); x.fill(); }
    }
    ck.tex.needsUpdate = true;
  }
  rig.setDress = d => {
    d = d || {};
    if (id === 'red') {
      const up = d.skirt === 'up', bare = up && d.drawers === 'down';
      show(skirt, !up); show(hemBand, !up); roll.visible = up;
      drawers.forEach(m => m.visible = !bare); drawersDown.forEach(m => m.visible = bare);
    }
    const mk_ = d.marks || { L: 0, R: 0 };
    for (const s of ['L', 'R']) { const m = Math.round((mk_[s] || 0) * 100) / 100; if (m !== marks[s]) { marks[s] = m; paintCheek(s, m); } }
  };

  // ── Each frame: the face eases toward its expression, she blinks, breathes, and the long hair hangs with gravity and swings as she moves. ──
  const gW = new V3(), tq = new THREE.Quaternion(), wp = new V3();
  rig.tick = dt => {
    dt = clamp(dt || 1 / 60, 0, 0.1); t += dt;
    const k = 1 - Math.exp(-dt * 10);
    for (const key of ['brow', 'browY', 'open', 'look', 'blush', 'tears']) F[key] = lerp(F[key], target[key] || 0, k);
    blinkT -= dt; if (blinkT <= 0) { blink = Math.min(1, blink + dt * 14); if (blink >= 1) blinkT = -1; } if (blinkT < 0 && blinkT > -9) { blink = Math.max(0, blink - dt * 9); if (blink <= 0) blinkT = 2.5 + Math.random() * 3.5; }
    applyFace();
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
      d.vx += (60 * (tx - d.ax) - 9 * d.vx) * dt; d.ax += d.vx * dt; d.vz += (60 * (tz - d.az) - 9 * d.vz) * dt; d.az += d.vz * dt;
      d.g.rotation.set(-d.ax, 0, d.az);
    }
  };

  rig.meshes = shadowy;
  rig.setExpr('calm'); rig.setDress({}); applyFace();
  return rig;
}

// ── Expressions. brow: inner ends up (+) or down (-); open: how open the eyes are; mouth: which mouth; blush, tears: 0..1. ──
const EXPRS = {
  calm:    { brow: 0, browY: 0, open: 0.92, mouth: 'flat', blush: 0 },
  smile:   { brow: 0.06, browY: 0.04, open: 0.82, mouth: 'smile', blush: 0.25 },
  shy:     { brow: 0.18, browY: 0.02, open: 0.6, look: -1, mouth: 'smile', blush: 0.9 },
  cheeky:  { brow: -0.12, browY: 0.06, open: 0.7, look: 1, mouth: 'smile', blush: 0 },
  pout:    { brow: 0.1, browY: -0.02, open: 0.8, mouth: 'pout', blush: 0.4 },
  stern:   { brow: -0.28, browY: -0.06, open: 0.8, mouth: 'flat', blush: 0 },
  wince:   { brow: 0.3, browY: 0.05, open: 0.45, mouth: 'frown', blush: 0.55 },
  gritted: { brow: 0.36, browY: 0.02, open: 0.18, mouth: 'gritted', blush: 0.85 },
  crying:  { brow: 0.45, browY: 0.1, open: 0.25, mouth: 'open', blush: 1, tears: 1 },
};

// ── A standing idle: the weight drifts from foot to foot, the arms hang easy, the head wanders a little. ──
function idle(r, t) {
  const sh = Math.sin(t * 0.5), sw = Math.sin(t * 0.8);
  r.hips.position.set(0.18 * sh, DIM.hipY - 0.05 + 0.03 * Math.sin(t * 1.6), 0); r.hips.rotation.set(0, 0.03 * sw, 0.025 * sh);
  r.torso.rotation.set(0.02 * Math.sin(t * 1.6), -0.04 * sw, -0.03 * sh);
  r.neck.rotation.set(0.04 * Math.sin(t * 0.37), 0.15 * Math.sin(t * 0.23), 0.03 * Math.sin(t * 0.41) - 0.5 * r.torso.rotation.z);
  r.head.rotation.set(0, 0, 0);
  for (const [s, side] of [['L', 1], ['R', -1]]) {
    r['arm' + s].rotation.set(0.03 * Math.sin(t * 1.1 + side), 0, side * (0.13 + 0.02 * sh * side)); r['elbow' + s].rotation.set(-0.22 - 0.03 * Math.sin(t * 1.1 + side), 0, 0); r['hand' + s].rotation.set(0.1, 0, side * 0.05);
    r['thigh' + s].rotation.set(0, 0, side * (0.03 + 0.02 * sh * side)); r['knee' + s].rotation.set(0.04 + 0.03 * Math.max(0, sh * side), 0, 0); r['ankle' + s].rotation.set(-0.03, 0, 0);
  }
}
// Seated upright on a seat whose top is at seatY (in the world, with the root at the floor): thighs level, shins straight down to the floor.
function sit(r, seatY) {
  const s = r.scaleW, kneeH = DIM.shin + 0.8;
  r.hips.position.set(0, seatY / s + 1.7, 0);
  for (const l of [r.legL, r.legR]) { const drop = r.hips.position.y - kneeH; l.thigh.rotation.set(-Math.PI / 2 + Math.asin(clamp(drop / DIM.thigh, -0.5, 0.5)), 0, l.sign * 0.06); l.knee.rotation.set(Math.PI / 2 - Math.asin(clamp(drop / DIM.thigh, -0.5, 0.5)), 0, 0); l.ankle.rotation.set(0, 0, 0); }
}
// The seat height at which a figure sits with level thighs and its feet on the floor.
const seatFor = id => (DIM.shin + 0.8 - 1.7) * SPECS[id].scale;

// ── Props. ──
function makeChair(seatY) {
  const g = new THREE.Group(), wood = '#9a6838', dark = '#6e4626', box = (w, h, d, x, y, z, hex) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
    m.add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, d + 0.14), INKM[0])); g.add(m); return m; };
  box(9.4, 0.9, 9.2, 0, seatY - 0.45, 1.8, wood);
  for (const [x, z] of [[-4.1, -2.3], [4.1, -2.3], [-4.1, 6.0], [4.1, 6.0]]) box(0.9, seatY - 0.9, 0.9, x, (seatY - 0.9) / 2, z, dark);
  for (const x of [-4.1, 4.1]) box(0.9, 11, 0.9, x, seatY + 5.5, -2.7, dark);
  box(9.2, 2.2, 0.6, 0, seatY + 9.6, -2.75, wood); box(9.2, 1.4, 0.5, 0, seatY + 6.2, -2.75, wood);
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

const Toon = { make, idle, sit, seatFor, makeChair, makePaddle, PADDLE, DIM, SPECS, EXPRS, palette, shade, mat, flat, hullGeo, INKM, ell, lathe };
root.Toon = Toon;
})(typeof window !== 'undefined' ? window : globalThis);
