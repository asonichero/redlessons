// Red Lessons — the toon characters. Smooth, rounded people with soft cel shading and a warm ink outline, on a skinned skeleton: every joint
// bends as one continuous body (no tubes meeting at a seam), the spine bends in two places, and the hands, feet, cape and long hair have bones of
// their own. The cape and the hair are springs: they trail, swing and settle as the body moves.
//
// The joint names match the old blocky rig (root › hips › torso › neck; armL/armR › elbow › wrist; legL/legR { thigh › knee }), so code that posed
// those still finds them. Added: spine (= torso) › chest, neck › head, wrist › hand, knee › ankle, chest › cape › capeLow, head › hair1 › hair2.
// A grown adult stands about 30 units tall.
//
// Proportions are an adult's throughout: about six and a half heads tall, a defined waist and hips, a woman's face. The cloak changes her scale
// only; Toon.make('heroine') at any scale is the same woman.
//
//   const rig = Toon.make('heroine'); rig.cloak.show(true);
//   each frame: Toon.pose(rig, anim, dt); rig.tick(dt);     anim = { t, phase, speed, running, look, gesture, carry, air }
(function (root) {
'use strict';
const THREE = root.THREE, V2 = THREE.Vector2, V3 = THREE.Vector3;
const srgb = h => new THREE.Color(h).convertSRGBToLinear();
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };     // smoothstep; a > b runs downhill

// ── Materials ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Three soft bands of light, as in a cosy console game.
let GRAD = null;
function gradient() {
  if (GRAD) return GRAD;
  const d = new Uint8Array([125, 125, 125, 195, 195, 195, 255, 255, 255]);
  GRAD = new THREE.DataTexture(d, 3, 1, THREE.RGBFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true;
  return GRAD;
}
const toon = (hex, extra) => new THREE.MeshToonMaterial(Object.assign({ color: srgb(hex), gradientMap: gradient() }, extra || {}));
const SKM = {};
const toonS = (hex, both) => { const k = hex + (both ? '2' : '1'); return SKM[k] || (SKM[k] = toon(hex, { skinning: true, side: both ? THREE.DoubleSide : THREE.FrontSide })); };   // (for skinned meshes)
const flat = hex => new THREE.MeshBasicMaterial({ color: srgb(hex) });
const INK = new THREE.MeshBasicMaterial({ color: srgb('#4a2c22'), side: THREE.BackSide });      // a warm brown ink, as in the concept art
const INKS = new THREE.MeshBasicMaterial({ color: srgb('#4a2c22'), side: THREE.BackSide, skinning: true });
// A rigid mesh with an ink outline (the inverted hull: the same shape a touch larger, drawn from the inside in the ink colour).
function inked(geo, mat, w) {
  const g = new THREE.Group(), m = new THREE.Mesh(geo, mat); g.add(m);
  const o = new THREE.Mesh(geo, INK); o.scale.setScalar(1 + (w == null ? 0.05 : w)); g.add(o);
  g.userData.mesh = m; return g;
}

// ── Shapes ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A body part turned from a profile: [[radius, height], …], squashed front to back by depth. (Segments trimmed: smooth under cel shading, cheap on a phone.)
function lathe(profile, depth, seg, phi0, phiLen) {
  if (profile[0][1] > profile[profile.length - 1][1]) profile = profile.slice().reverse();
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new V2(r, y)), Math.max(10, Math.round((seg || 24) * 0.62)), phi0 || 0, phiLen || Math.PI * 2);
  g.scale(1, 1, depth == null ? 0.72 : depth); g.computeVertexNormals(); return g;
}
const sphere = (r, sx, sy, sz) => { const g = new THREE.SphereGeometry(r, r > 1 ? 16 : 12, r > 1 ? 11 : 8); g.scale(sx || 1, sy || 1, sz || 1); return g; };
// A limb from 0 down to -len, tapering from r0 to r1, with rounded ends, and enough rings along it to bend smoothly at the joints.
const limb = (len, r0, r1) => {
  const pr = [[0, 0.15], [r0 * 0.7, 0.05], [r0, -r0 * 0.4]];
  for (let i = 1; i < 7; i++) { const t = i / 7; pr.push([lerp(r0, r1, t), lerp(-r0 * 0.4, -len + r1 * 0.4, t)]); }
  pr.push([r1, -len + r1 * 0.4], [r1 * 0.7, -len - 0.05], [0, -len - 0.15]);
  return lathe(pr, 1, 16);
};
function starGeo(r) {
  const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i) s.lineTo(x, y); else s.moveTo(x, y); }
  return new THREE.ShapeGeometry(s).toNonIndexed();
}
// A piece of cloth (or a sheet of hair) with a thickness: fn(u, v) → point, u across and v down, both 0..1. Built as a closed shell (outer face,
// inner face, and the rims between them) so that the outline hull works; groups: 0 outer, 1 inner, 2 rims. outward(p) says which way is out.
function sheet(fn, nu, nv, thick, outward) {
  const P = [], N = [], W = nu + 1, id = (u, v) => v * W + u;
  for (let v = 0; v <= nv; v++) for (let u = 0; u <= nu; u++) P.push(fn(u / nu, v / nv));
  for (let v = 0; v <= nv; v++) for (let u = 0; u <= nu; u++) {
    const du = P[id(Math.min(nu, u + 1), v)].clone().sub(P[id(Math.max(0, u - 1), v)]), dv = P[id(u, Math.min(nv, v + 1))].clone().sub(P[id(u, Math.max(0, v - 1))]);
    const n = du.cross(dv).normalize(); if (n.dot(outward(P[id(u, v)])) < 0) n.negate(); N.push(n);
  }
  const pos = [], index = [], push = p => { pos.push(p.x, p.y, p.z); return pos.length / 3 - 1; };
  const quad = (a, b, c, d, ref) => {          // two triangles over a quad of vertex indices, wound to face ref
    const A = new V3().fromArray(pos, a * 3), B_ = new V3().fromArray(pos, b * 3), C_ = new V3().fromArray(pos, c * 3);
    if (B_.sub(A).cross(C_.sub(A)).dot(ref) >= 0) index.push(a, b, c, a, c, d); else index.push(a, c, b, a, d, c);
  };
  const o0 = pos.length / 3; P.forEach(push);
  const i0 = pos.length / 3; P.forEach((p, k) => push(p.clone().addScaledVector(N[k], -thick)));
  for (let v = 0; v < nv; v++) for (let u = 0; u < nu; u++) { const k = [id(u, v), id(u + 1, v), id(u + 1, v + 1), id(u, v + 1)], ref = N[k[0]].clone().add(N[k[2]]); quad(o0 + k[0], o0 + k[1], o0 + k[2], o0 + k[3], ref); }
  const nOuter = index.length;
  for (let v = 0; v < nv; v++) for (let u = 0; u < nu; u++) { const k = [id(u, v), id(u + 1, v), id(u + 1, v + 1), id(u, v + 1)], ref = N[k[0]].clone().add(N[k[2]]).negate(); quad(i0 + k[0], i0 + k[1], i0 + k[2], i0 + k[3], ref); }
  const nInner = index.length;
  // The rims: each edge of the grid, its own vertices (so its normals are its own), facing away from the sheet.
  const edges = [[...Array(W).keys()].map(u => [id(u, 0), id(u, Math.min(1, nv))]), [...Array(W).keys()].map(u => [id(u, nv), id(u, nv - 1)]),
    [...Array(nv + 1).keys()].map(v => [id(0, v), id(1, v)]), [...Array(nv + 1).keys()].map(v => [id(nu, v), id(nu - 1, v)])];
  for (const e of edges) {
    const base = pos.length / 3; for (const [k] of e) { push(P[k]); push(P[k].clone().addScaledVector(N[k], -thick)); }
    for (let j = 0; j < e.length - 1; j++) { const ref = P[e[j][0]].clone().sub(P[e[j][1]]); quad(base + j * 2, base + j * 2 + 2, base + j * 2 + 3, base + j * 2 + 1, ref); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(index);
  g.addGroup(0, nOuter, 0); g.addGroup(nOuter, nInner - nOuter, 1); g.addGroup(nInner, index.length - nInner, 2); g.computeVertexNormals();
  return g;
}
// One face of the same cloth, lifted off it: for trims and bands. v0..v1 is the part of the cloth it covers.
function band(fn, nu, nv, v0, v1, lift, outward) {
  const g = sheet((u, v) => fn(u, lerp(v0, v1, v)), nu, nv, 0.001, outward), pos = g.attributes.position, nrm = g.attributes.normal, p = new V3();
  for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i).addScaledVector(new V3().fromBufferAttribute(nrm, i), lift); pos.setXYZ(i, p.x, p.y, p.z); }
  g.clearGroups(); g.setIndex(Array.from(g.index.array.slice(0, nu * nv * 6))); return g;
}
function mergeFlat(list) {       // non-indexed geometries into one
  const pos = []; for (const g of list) pos.push(...g.attributes.position.array);
  const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); m.computeVertexNormals(); return m;
}

// ── The people ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SPECS = {
  // The heroine, in her own clothes: a rust bodice laced over a cream chemise, a long moss-green skirt, boots; loose auburn hair, green eyes, freckles.
  heroine: { skin: '#f6d2b4', skinSh: '#e2a888', blush: '#f0a090', hair: '#8a3a22', hairHi: '#b0532e', hairDk: '#5e2416', eyes: '#4f7a5a', lips: '#c4646a', freckles: true,
    top: 'bodice', blouse: '#f1e8d6', bodice: '#8a4e2c', bodiceDk: '#6a3a20', lace: '#ecd8a4', lower: 'skirt', skirt: '#617040', skirtDk: '#4a5830', belt: '#6a3a20', boots: '#5a3820',
    hairStyle: 'long', cloak: true },
  mother: { skin: '#f0caa8', skinSh: '#d8a684', blush: '#e0988a', hair: '#9a7a5a', hairHi: '#c4a482', hairDk: '#6e563e', eyes: '#5a6a48', lips: '#b06a6a',
    top: 'bodice', blouse: '#f2ece0', bodice: '#9a5a3a', lower: 'skirt', skirt: '#6a5a7a', skirtDk: '#54466a', belt: '#5a3a22', boots: '#3a2616', hairStyle: 'bun', apron: '#f6f0e4', flour: true },
  grandmother: { skin: '#eac6a8', skinSh: '#cfa486', blush: '#d8988c', hair: '#e8e4dc', hairHi: '#ffffff', hairDk: '#b8b0a4', eyes: '#5a7a98', lips: '#b07a80', lined: true,
    top: 'bodice', blouse: '#ece6d6', bodice: '#3a4a5a', lower: 'skirt', skirt: '#3a4a5a', skirtDk: '#2c3846', belt: '#2a1a10', boots: '#2a1a10', hairStyle: 'bun', shawl: '#a83030' },
  miller: { male: true, skin: '#eabf9c', skinSh: '#cc9c7a', blush: '#d89a88', hair: '#c8b494', hairHi: '#e6d8bc', hairDk: '#9a8868', eyes: '#5a7a8a', lips: '#a8706a',
    top: 'shirt', shirt: '#ece6d6', shirtDk: '#cfc7b4', lower: 'trousers', trousers: '#8a7a5a', trousersDk: '#6e6046', belt: '#4a3220', boots: '#4a3220', bootsDk: '#3a2618', hairStyle: 'short', apron: '#d8cfb8', flour: true },
  woodcutter: { male: true, skin: '#dcac86', skinSh: '#bc8a66', blush: '#c88a76', hair: '#4a3020', hairHi: '#6a4a32', hairDk: '#2e1c12', eyes: '#4a6a3a', lips: '#9a5a50', beard: true,
    top: 'shirt', shirt: '#a8322a', shirtDk: '#7a221c', check: '#3a1c18', lower: 'trousers', trousers: '#4e4a3a', trousersDk: '#3a3628', belt: '#2a1a10', boots: '#3a2616', bootsDk: '#2a1a10', hairStyle: 'short' },
  innkeeper: { skin: '#d6a07a', skinSh: '#b07a58', blush: '#c07a64', hair: '#2e1e18', hairHi: '#5a3c2c', hairDk: '#1a100c', eyes: '#4a3020', lips: '#9a4a4a',
    top: 'bodice', blouse: '#f0e8d8', bodice: '#2a5a5a', lower: 'skirt', skirt: '#5a3a2a', skirtDk: '#462c1e', belt: '#3a2618', boots: '#2a1a10', hairStyle: 'bun', apron: '#ece4d0' },
};

// ── Measurements. Each character's body is built from these (multipliers on the base figure, 1 = as designed), so they can be adjusted in
// editor.html. They come from js/measures.js (root.Measures, the saved set), overlaid with anything adjusted in this browser (localStorage), then
// an override passed to make(). The heroine has one set: her figure in the cloak is the same body at 55% scale, never a separately proportioned one.
const MEASURE = {
  scale:         { label: 'Overall size', min: 0.85, max: 1.15, step: 0.01, def: 1 },
  headSize:      { label: 'Head size', min: 0.78, max: 1.0, step: 0.005, def: 0.92 },
  neckLength:    { label: 'Neck length', min: 0.6, max: 1.5, step: 0.01, def: 1 },
  torsoLength:   { label: 'Torso length', min: 0.85, max: 1.15, step: 0.01, def: 1 },
  shoulderWidth: { label: 'Shoulder width', min: 0.85, max: 1.2, step: 0.01, def: 1 },
  chestWidth:    { label: 'Chest width', min: 0.85, max: 1.2, step: 0.01, def: 1 },
  bust:          { label: 'Bust', min: 0.6, max: 1.4, step: 0.01, def: 1, women: true },
  waistWidth:    { label: 'Waist width', min: 0.8, max: 1.3, step: 0.01, def: 1 },
  hipWidth:      { label: 'Hip width', min: 0.85, max: 1.25, step: 0.01, def: 1 },
  armLength:     { label: 'Arm length', min: 0.85, max: 1.15, step: 0.01, def: 1 },
  armGirth:      { label: 'Arm thickness', min: 0.8, max: 1.3, step: 0.01, def: 1 },
  handSize:      { label: 'Hand size', min: 0.8, max: 1.25, step: 0.01, def: 1 },
  legLength:     { label: 'Leg length', min: 0.88, max: 1.15, step: 0.01, def: 1 },
  legGirth:      { label: 'Leg thickness', min: 0.8, max: 1.3, step: 0.01, def: 1 },
  footSize:      { label: 'Foot size', min: 0.8, max: 1.25, step: 0.01, def: 1 },
};
const MIN_HEADS = 6.2;              // never fewer than this many heads tall: the figure always reads as a grown adult
const STORE_KEY = 'red-lessons:measures';
function storedMeasures() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { return {}; } }
// The figure's height and head height (in units, at scale 1) for a set of measurements.
function figure(m, male) {
  const hipsY = 15.5 + 14.75 * (m.legLength - 1), top = hipsY + 9 * m.torsoLength + 1.0 * m.neckLength + 2.2 * m.headSize / 0.92 + 2.62 * m.headSize;
  return { hipsY, height: top, head: 5.22 * m.headSize, heads: top / (5.22 * m.headSize) };
}
function clampMeasures(m) {
  const out = {};
  for (const k in MEASURE) out[k] = clamp(+(m[k] != null ? m[k] : MEASURE[k].def) || MEASURE[k].def, MEASURE[k].min, MEASURE[k].max);
  // The adult guard: if the head is too big for the body, it is brought down until the figure is at least MIN_HEADS tall.
  for (let i = 0; i < 40 && figure(out).heads < MIN_HEADS; i++) out.headSize = Math.max(MEASURE.headSize.min, out.headSize - 0.005);
  return out;
}
function measuresFor(id, over) {
  const saved = (root.Measures && root.Measures[id]) || {}, local = storedMeasures()[id] || {};
  return clampMeasures(Object.assign({}, saved, local, over || {}));
}

function make(id, over) {
  const S = SPECS[id], rig = { id, spec: S }, BN = {}, bones = [];
  const m = measuresFor(id, over); rig.measures = m;
  const root_ = new THREE.Group(); rig.root = root_;
  const fig = new THREE.Group(); fig.scale.setScalar(m.scale); root_.add(fig);
  const TL = m.torsoLength, LL = m.legLength, AL = m.armLength, NL = m.neckLength, HR = m.headSize / 0.92;
  // How wide the body is at a height on the torso (hips' space): the hips below the waist, the waist, the chest, the shoulders at the top.
  const WIDTHS = [[0.6, m.hipWidth], [3.0, m.waistWidth], [5.4, m.chestWidth], [7.6, m.shoulderWidth]];
  const widthAt = y => { if (y <= WIDTHS[0][0]) return WIDTHS[0][1]; for (let i = 1; i < WIDTHS.length; i++) if (y <= WIDTHS[i][0]) { const [y0, w0] = WIDTHS[i - 1], [y1, w1] = WIDTHS[i]; return lerp(w0, w1, ss(y0, y1, y)); } return WIDTHS[WIDTHS.length - 1][1]; };
  const torsoY = y => y < 0 ? y * LL : y * TL;
  // The deformations: a point in a part's frame (as designed) to where it goes with these measurements.
  const D = {
    torso: p => { const w = widthAt(p.y); p.set(p.x * w, torsoY(p.y), p.z * w); },
    skirt: p => { const w = p.y > 0.6 ? widthAt(p.y) : m.hipWidth; p.set(p.x * w, torsoY(p.y), p.z * w); },
    cape:  p => { const w = Math.max(widthAt(p.y), p.y > 6 ? m.shoulderWidth : 0); p.set(p.x * w, p.y * TL, p.z * w); },
    arm:   p => p.set(p.x * m.armGirth, p.y * AL, p.z * m.armGirth),
    leg:   p => p.set(p.x * m.legGirth, p.y * LL, p.z * m.legGirth),
    neck:  p => p.set(p.x, p.y * NL, p.z),
    hair:  p => { p.y -= 1.0; p.multiplyScalar(HR); p.y += 1.0 * NL; },       // (in the neck's space, scaled with the head about the head's pivot)
  };
  // ── The skeleton, at rest (every bone unrotated). Positions are each bone's head, in its parent's space.
  const bone = (name, parent, x, y, z, order) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (order) b.rotation.order = order; (parent || fig).add(b); bones.push(b); BN[name] = b; return b; };
  const SHX = S.male ? 3.75 : 3.15, F = figure(m);
  bone('hips', null, 0, F.hipsY, 0); bone('spine', BN.hips, 0, 1.5 * TL, 0, 'YXZ'); bone('chest', BN.spine, 0, 3.0 * TL, 0, 'YXZ');
  bone('neck', BN.chest, 0, 4.5 * TL, 0, 'YXZ'); bone('head', BN.neck, 0, 1.0 * NL, 0, 'YXZ');
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    bone('arm' + s, BN.chest, sx * SHX * m.shoulderWidth, 3.5 * TL, 0, 'ZXY'); bone('elbow' + s, BN['arm' + s], 0, -4.6 * AL, 0); bone('wrist' + s, BN['elbow' + s], 0, 0, 0); bone('hand' + s, BN['wrist' + s], 0, -4.3 * AL, 0);
    bone('thigh' + s, BN.hips, sx * 1.6 * m.hipWidth, 0, 0, 'ZXY'); bone('knee' + s, BN['thigh' + s], 0, -7.0 * LL, 0); bone('ankle' + s, BN['knee' + s], 0, -7.0 * LL, 0);
  }
  if (S.cloak) { bone('cape', BN.chest, 0, 3.1 * TL, -2.9 * m.chestWidth); bone('capeLow', BN.cape, 0, -2.7 * TL, -0.5); }
  if (S.hairStyle === 'long') { bone('hair1', BN.head, 0, -0.9 * HR, -2.6 * HR); bone('hair2', BN.hair1, 0, -1.1 * HR, -0.9 * HR); }
  root_.updateMatrixWorld(true);
  const skel = new THREE.Skeleton(bones), BI = new Map(bones.map((b, i) => [b, i])), IDM = new THREE.Matrix4();
  const inFig = b => fig.worldToLocal(b.getWorldPosition(new V3())), hipsW = inFig(BN.hips);
  // A point given in the hips' space, as designed, to bone b's space with the measurements applied (the torso's widths and lengths).
  const at = (b, x, y, z) => { const q = new V3(x, y, z); D.torso(q); return q.add(hipsW).sub(inFig(b)); };
  const attach = (b, obj, x, y, z) => { obj.position.copy(at(b, x, y, z)); b.add(obj); return obj; };
  const byHeight = y => y < 1.5 ? BN.hips : y < 4.4 ? BN.spine : BN.chest;                    // which bone a rigid detail on the torso rides on
  const onTorso = (obj, x, y, z) => attach(byHeight(y), obj, x, y, z);

  // ── Skinning. part(): a geometry given in bone `frame`'s space, each vertex weighted to bones by wfn(point); with an outline hull of width ink.
  function addSkinned(geo, mat) { const mesh = new THREE.SkinnedMesh(geo, mat); mesh.frustumCulled = false; fig.add(mesh); mesh.bind(skel, IDM); return mesh; }
  // Which measurements apply to a part: by its weights (torso, skirt, cape, hair) or else by the bone it is built on.
  const deformOf = (frame, wfn) => D[wfn.kind] || (/^(arm|elbow|wrist|hand)/.test(frame.name) ? D.arm : /^(thigh|knee|ankle)/.test(frame.name) ? D.leg : frame === BN.neck ? D.neck : null);
  function part(geo, frame, mat, wfn, ink) {
    const deform = deformOf(frame, wfn);
    const pos = geo.attributes.position, n = pos.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), p = new V3();
    for (let i = 0; i < n; i++) {
      p.fromBufferAttribute(pos, i);
      const m = new Map(); for (const [b, w] of wfn(p)) if (b && w > 1e-4) m.set(b, (m.get(b) || 0) + w);
      let ws = [...m].sort((a, b) => b[1] - a[1]).slice(0, 4); if (!ws.length) ws = [[frame, 1]];
      const tot = ws.reduce((t, w) => t + w[1], 0);
      ws.forEach(([b, w], k) => { si[i * 4 + k] = BI.get(b); sw[i * 4 + k] = w / tot; });
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    if (deform) { for (let i = 0; i < n; i++) { p.fromBufferAttribute(pos, i); deform(p); pos.setXYZ(i, p.x, p.y, p.z); } geo.computeVertexNormals(); }   // (weights as designed, shape as measured)
    geo.applyMatrix4(frame.matrixWorld);
    const mesh = addSkinned(geo, mat);
    if (ink) {
      const og = geo.clone(), op = og.attributes.position, on = og.attributes.normal, q = new V3();
      for (let i = 0; i < op.count; i++) { q.fromBufferAttribute(op, i).addScaledVector(new V3().fromBufferAttribute(on, i), ink); op.setXYZ(i, q.x, q.y, q.z); }
      addSkinned(og, INKS);
    }
    return mesh;
  }
  // Weights for a limb from its bone's head (0) to its child's (-len): blended with the parent over ±bTop about the top joint, with the child over ±bBot about the bottom.
  const limbW = (parent, self, child, len, bTop, bBot) => p => {
    const wp = parent ? ss(-bTop, bTop, p.y) : 0, wc = child ? ss(-len + bBot, -len - bBot, p.y) : 0;
    return [[parent, wp], [child, wc], [self, Math.max(0, 1 - wp - wc)]];
  };
  // The torso, in the hips' space: hips below the waist, the spine through it, the chest above; the tails of a shirt or tunic follow the thighs a little.
  const torsoW = p => {
    const y = p.y, wChest = ss(3.4, 5.4, y); let wHips = 1 - ss(0.0, 2.0, y);
    const wSpine = Math.max(0, 1 - wHips - wChest), down = ss(0, -4.5, y) * 0.55, wl = down * ss(-1.2, 1.2, p.x), wr = down * ss(-1.2, 1.2, -p.x);
    wHips = Math.max(0, wHips - wl - wr);
    const sh = ss(SHX - 0.8, SHX + 0.4, Math.abs(p.x)) * ss(6.6, 8.0, y) * 0.3;          // the tops of the sleeves on the torso follow the arm a little
    return [[BN.hips, wHips], [BN.spine, wSpine], [BN.chest, wChest - sh], [p.x > 0 ? BN.armL : BN.armR, sh], [BN.thighL, wl], [BN.thighR, wr]];
  };
  torsoW.kind = 'torso';
  // A skirt (and an apron) in the hips' space: the lower it hangs, the more it follows the thigh on its side.
  const skirtW = p => {
    const down = ss(0.5, -11, p.y) * 0.75, wl = down * ss(-1.5, 1.5, p.x), wr = down * ss(-1.5, 1.5, -p.x);
    return [[BN.hips, Math.max(0, 1 - wl - wr)], [BN.thighL, wl], [BN.thighR, wr]];
  };
  skirtW.kind = 'skirt';
  const T = (frame, w) => ({ frame, w });
  const HIPS = T(BN.hips, torsoW);
  const M = { skin: toon(S.skin), hair: toon(S.hair), hairHi: toon(S.hairHi), belt: toon(S.belt), boots: toon(S.boots) };

  // ── Torso. From the hips (y 0) to the shoulders (about 8.6): hips, a waist, the ribcage, the shoulders.
  const BODY = [[0, -0.6], [3.2, -0.4], [3.5, 0.6], [3.0, 2.2], [2.55, 3.4], [2.9, 5.2], [3.2, 6.6], [3.3, 7.6], [2.6, 8.6], [1.0, 9.1], [0, 9.2]];
  if (S.top === 'shirt') {
    // A man's build: broader at the shoulder, straighter at the waist. A loose shirt, checked for the woodcutter, the tail over the hips.
    part(lathe([[0, 9.3], [1.15, 9.2], [2.95, 8.75], [3.85, 7.7], [3.78, 6.6], [3.45, 5.0], [3.2, 3.4], [3.25, 2.0], [3.45, 0.4], [3.6, -1.1]], 0.7, 28), BN.hips, toonS(S.shirt, true), torsoW, 0.09);
    if (S.check) for (let y = -0.6; y < 8.6; y += 1.5) { const r = 3.1 + (y > 5 ? 0.45 : y > 2 ? 0.05 : 0.3); part(lathe([[r + 0.04, y], [r + 0.04, y + 0.42]], 0.71, 28), BN.hips, toonS(S.check), torsoW); }
    const v = new THREE.Mesh(new THREE.CircleGeometry(0.85, 3), toon(S.skin)); v.rotation.set(-0.35, 0, -Math.PI / 2); onTorso(v, 0, 8.55, 1.95);
    part(lathe([[3.28, 1.6], [3.24, 2.4]], 0.72, 28), BN.hips, toonS(S.belt), torsoW, 0.05);
    onTorso(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 0.3), toon('#b89a4a')), 0, 2.0, 2.35);
  } else {
    const bm = toonS(S.bodice);
    part(lathe(BODY, 0.68), BN.hips, bm, torsoW, 0.09);
    // The chemise: over the shoulders and round the neckline, above the bodice.
    part(lathe([[0, 6.7], [3.35, 6.8], [3.4, 7.7], [2.7, 8.7], [1.1, 9.15], [0, 9.25]], 0.7), BN.hips, toonS(S.blouse), torsoW, 0.07);
    for (let i = 0; i < 4; i++) { const x = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.2), toon(S.lace || '#e8d8a8')); x.rotation.z = i % 2 ? 0.5 : -0.5; onTorso(x, 0, 2.6 + i * 1.0, 2.25 + (i > 1 ? 0.1 : 0)); }
    for (const sx of [-1, 1]) { const b = inked(sphere(1.25, 1, 0.9, 0.8), toon(S.bodice), 0.03); b.scale.setScalar(m.bust); attach(BN.chest, b, sx * 1.25, 5.6, 1.55 - 0.35 * (1 - m.bust)); }
    part(lathe([[2.66, 2.0], [2.66, 2.7]], 0.69), BN.hips, toonS(S.bodiceDk || S.belt), torsoW, 0.04);
    if (S.shawl) {
      const sh = toonS(S.shawl, true);
      part(lathe([[1.2, 9.3], [2.8, 8.9], [3.7, 7.6], [3.75, 6.2], [3.5, 5.4]], 0.74, 28), BN.hips, sh, torsoW, 0.08);
      attach(BN.chest, inked(sphere(0.55, 1.2, 0.9, 0.7), toon(S.shawl), 0.06), 0, 6.2, 2.45);
    }
  }
  if (S.apron && S.lower === 'trousers') {
    const ag = new THREE.LatheGeometry([new V2(4.4, -6.5), new V2(3.9, -3), new V2(3.5, 0.2), new V2(3.3, 1.8)], 12, -Math.PI * 0.32, Math.PI * 0.64); ag.scale(1, 1, 0.78); ag.computeVertexNormals();
    part(ag, BN.hips, toonS(S.apron, true), skirtW, 0.05);
  }
  if (S.flour) for (const [x, y, z] of [[0.6, -1.0, 3.0], [-1.1, -2.6, 3.1], [1.4, 0.4, 2.9]]) attach(BN.hips, new THREE.Mesh(sphere(0.32, 1.4, 1, 0.3), flat('#fbf8f0')), x, y, z);
  if (S.lower === 'skirt') {
    part(lathe([[2.7, 2.3], [3.6, 0.6], [4.6, -4], [5.6, -9], [6.2, -12.6], [6.0, -13.2]], 0.8, 28), BN.hips, toonS(S.skirt, true), skirtW, 0.08);
    part(lathe([[6.1, -12.2], [6.24, -12.7], [6.04, -13.25]], 0.8, 28), BN.hips, toonS(S.skirtDk), skirtW);
    if (S.apron) {
      const ag = new THREE.LatheGeometry([new V2(5.6, -8), new V2(4.9, -4), new V2(3.8, 0.4), new V2(2.8, 2.2)], 12, -Math.PI * 0.3, Math.PI * 0.6); ag.scale(1, 1, 0.82); ag.computeVertexNormals();
      part(ag, BN.hips, toonS(S.apron, true), skirtW, 0.05);
    }
  }

  // ── Neck and head. The neck is skinned between the chest and the head; the head itself is one rigid piece, with the face on it.
  part(lathe([[0.88, -0.6], [0.8, 0.7], [0.84, 1.4]], 1, 14), BN.neck, toonS(S.skin), p => { const wc = ss(0.3, -0.5, p.y), wh = ss(0.9, 1.4, p.y); return [[BN.chest, wc], [BN.head, wh], [BN.neck, Math.max(0, 1 - wc - wh)]]; }, 0.06);
  const head = new THREE.Group(); head.position.y = 2.2 * HR; head.scale.setScalar(m.headSize); BN.head.add(head); rig.headGroup = head;
  head.add(inked(lathe([[0, -2.6], [0.65, -2.5], [1.35, -2.0], [1.82, -1.1], [2.05, -0.1], [2.12, 0.85], [1.96, 1.75], [1.4, 2.42], [0, 2.62]], 0.92, 28), M.skin, 0.035));
  for (const sx of [-1, 1]) { const ear = inked(sphere(0.42, 0.55, 1, 0.8), M.skin, 0.06); ear.position.set(sx * 2.05, -0.1, -0.2); head.add(ear); }
  const face = new THREE.Group(); head.add(face); rig.face = face; rig.eyes = [];
  const eyeW = toon('#fdfaf4'), iris = flat(S.eyes), irisDk = new THREE.MeshBasicMaterial({ color: srgb(S.eyes).multiplyScalar(0.55) }), pupil = flat('#1e1210'), lash = flat('#3a2018'), shine = flat('#ffffff');
  for (const sx of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(sx * 0.8, -0.1, 1.68); e.rotation.y = sx * 0.3; face.add(e); rig.eyes.push(e);
    e.add(new THREE.Mesh(sphere(0.44, 1.15, 0.72, 0.26), eyeW));
    const ir = new THREE.Mesh(sphere(0.28, 0.95, 1.08, 0.26), iris); ir.position.set(sx * -0.04, -0.03, 0.07); e.add(ir);
    const ird = new THREE.Mesh(sphere(0.26, 0.95, 0.45, 0.26), irisDk); ird.position.set(sx * -0.04, 0.15, 0.09); e.add(ird);
    const pu = new THREE.Mesh(sphere(0.11, 1, 1.1, 0.26), pupil); pu.position.set(sx * -0.04, -0.02, 0.12); e.add(pu);
    const h1 = new THREE.Mesh(sphere(0.075, 1, 1, 0.3), shine); h1.position.set(sx * -0.04 + 0.1, 0.12, 0.17); e.add(h1);
    const up = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.11, 0.14), lash); up.position.set(0, 0.31, 0.06); up.rotation.z = sx * -0.08; e.add(up);
    const corner = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.12), lash); corner.position.set(sx * 0.55, 0.25, 0.03); corner.rotation.z = sx * 0.4; e.add(corner);
    const brow = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 4, 10, Math.PI * 0.75), toon(S.hairDk)); brow.position.set(sx * 0.85, 0.42, 1.74); brow.rotation.set(0, sx * 0.3, Math.PI * 0.125); face.add(brow); rig['brow' + (sx < 0 ? 'R' : 'L')] = brow;
  }
  { const nose = new THREE.Mesh(sphere(0.2, 1, 0.75, 0.9), toon(S.skinSh)); nose.position.set(0, -0.78, 1.9); face.add(nose); }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.055, 4, 10, Math.PI * 0.62), flat(S.lips)); smile.position.set(0, -1.32, 1.76); smile.rotation.z = Math.PI + Math.PI * 0.19; face.add(smile); rig.mouth = smile;
  const frown = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 4, 10, Math.PI * 0.55), flat(S.lips)); frown.position.set(0, -1.52, 1.74); frown.rotation.z = Math.PI * 0.225; frown.visible = false; face.add(frown);
  const open = new THREE.Mesh(sphere(0.26, 1.25, 0.8, 0.3), flat('#7a2a2e')); open.position.set(0, -1.38, 1.72); open.visible = false; face.add(open);
  for (const sx of [-1, 1]) { const bl = new THREE.Mesh(sphere(0.4, 1.35, 0.5, 0.2), new THREE.MeshBasicMaterial({ color: srgb(S.blush), transparent: true, opacity: 0.32 })); bl.position.set(sx * 1.18, -0.75, 1.6); bl.rotation.y = sx * 0.55; face.add(bl); }
  if (S.freckles) for (const sx of [-1, 1]) for (const [fx, fy] of [[0.95, -0.42], [1.2, -0.55], [1.05, -0.68], [1.32, -0.4]]) { const f = new THREE.Mesh(sphere(0.045, 1, 1, 0.3), flat('#c8846a')); f.position.set(sx * fx, fy, 1.78 - Math.abs(fx) * 0.12); face.add(f); }
  if (S.lined) for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.05), flat(S.skinSh)); l.position.set(sx * 1.45, -0.2, 1.55); l.rotation.set(0, sx * 0.5, sx * -0.4); face.add(l); }
  if (S.beard) {
    const bg = new THREE.SphereGeometry(1.95, 16, 9, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55); bg.scale(1.02, 1.05, 0.98);
    const beard = inked(bg, toon(S.hairDk), 0.03); beard.position.set(0, -0.55, 0.12); head.add(beard);
    const mo = inked(sphere(0.55, 1.6, 0.45, 0.5), toon(S.hairDk), 0.05); mo.position.set(0, -1.05, 1.85); head.add(mo);
  }
  // Expressions: the brows' angle, the eyes' openness and the mouth.
  const EXPR = {
    calm:    { brow: 0, browY: 0, eye: 1, mouth: 'smile' }, smile: { brow: 0.05, browY: 0.04, eye: 0.85, mouth: 'smile' },
    sulk:    { brow: -0.12, browY: -0.04, eye: 0.85, mouth: 'frown' }, defiant: { brow: -0.3, browY: -0.08, eye: 0.9, mouth: 'frown' },
    wince:   { brow: 0.25, browY: 0.05, eye: 0.55, mouth: 'frown' }, gritted: { brow: 0.3, browY: 0.02, eye: 0.25, mouth: 'open' },
    crying:  { brow: 0.4, browY: 0.1, eye: 0.3, mouth: 'open' },
  };
  rig.setExpr = name => {
    const x = EXPR[name] || EXPR.calm; rig.expr = name;
    for (const [i, b] of [rig.browR, rig.browL].entries()) { const sx = i ? 1 : -1; b.rotation.z = Math.PI * 0.125 + sx * -x.brow; b.position.y = 0.42 + x.browY; }
    for (const e of rig.eyes) e.scale.y = x.eye;
    smile.visible = x.mouth === 'smile'; frown.visible = x.mouth === 'frown'; open.visible = x.mouth === 'open';
  };
  rig.setDress = d => { if (d && d.expr) rig.setExpr(d.expr); };

  // ── Hair. A cap tipped back to the hairline, soft swoops at the parting, locks over the temples; then a bun, short hair, or (hers) long and loose.
  const cap = inked(new THREE.SphereGeometry(2.34, 18, 11, 0, Math.PI * 2, 0, Math.PI * 0.56), M.hair, 0.03); cap.position.set(0, 0.55, -0.12); cap.rotation.x = -0.5; head.add(cap);
  const back = inked(sphere(2.15, 1, 1.1, 0.86), M.hair, 0.03); back.position.set(0, 0.05, -0.7); head.add(back);
  for (const [x, rz, w, len, hi] of (S.hairStyle === 'short' ? [[0.6, -0.9, 1.0, 0.9, false], [-0.75, 0.9, 0.85, 0.8, true]] : [[0.75, -0.55, 1.05, 1.65, false], [-0.85, 0.65, 0.9, 1.45, true]])) {
    const g = new THREE.SphereGeometry(1, 16, 10); g.scale(w, len, 0.42);
    const sw = inked(g, hi ? M.hairHi : M.hair, 0.04); sw.position.set(x, 1.45, 1.55); sw.rotation.set(-0.42, 0, rz); head.add(sw);
  }
  if (S.hairStyle !== 'short') for (const sx of [-1, 1]) {
    const long = S.hairStyle === 'long', side = inked(sphere(0.62, 0.8, long ? 2.7 : 1.9, 0.75), M.hair, 0.05);
    side.position.set(sx * 1.9, long ? -0.65 : 0.15, 0.5); side.rotation.z = sx * 0.12; head.add(side);
  }
  const shineArc = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.09, 4, 24, Math.PI * 0.6), toon(S.hairHi)); shineArc.position.set(0.1, 1.85, 0.6); shineArc.rotation.set(-1.0, 0, Math.PI * 0.2); head.add(shineArc);
  if (S.hairStyle === 'bun') { const bun = inked(sphere(1.25, 1, 1, 1), M.hair, 0.04); bun.position.set(0, 1.4, -2.1); head.add(bun); }
  if (S.hairStyle === 'long') {
    // Long loose hair to her shoulder blades: a thick sheet in the neck's space, from inside the back of the head, falling over the top of the
    // cape (so the cape's back, and its stars, still show below it). The top rides the head; below it, two spring bones let it swing.
    const prof = [[3.9, 1.95], [2.6, 2.35], [1.2, 3.1], [0.2, 3.8], [-0.8, 4.25], [-1.8, 4.45]];
    const rAt = y => { for (let i = 1; i < prof.length; i++) if (y >= prof[i][0]) { const [y0, r0] = prof[i - 1], [y1, r1] = prof[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return prof[prof.length - 1][1]; };
    const fn = (u, v) => { const y = lerp(3.9, -1.8, v), spread = lerp(1.05, 0.82, v), phi = Math.PI + lerp(-spread, spread, u), r = rAt(y) + 0.25 * Math.sin(u * Math.PI * 5) * v; return new V3(Math.sin(phi) * r, y, Math.cos(phi) * r); };
    const g = sheet(fn, 14, 10, 0.35, p => new V3(p.x, 0, p.z));
    const hairW = Object.assign(p => { const w1 = ss(2.5, 0.8, p.y), w2 = ss(0.2, -1.3, p.y); return [[BN.head, 1 - w1], [BN.hair1, w1 - w2], [BN.hair2, w2]]; }, { kind: 'hair' });
    part(g, BN.neck, [toonS(S.hair, true), toonS(S.hairDk, true), toonS(S.hair, true)], hairW, 0.07);
    part(band(fn, 14, 2, 0.08, 0.2, 0.06, p => new V3(p.x, 0, p.z)), BN.neck, toonS(S.hairHi, true), hairW);    // a band of shine
  }

  // ── Arms: shoulder › elbow › wrist (the forearm's twist) › hand.
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const arm = BN['arm' + s], wrist = BN['wrist' + s], hand = BN['hand' + s], wide = S.male ? 1.15 : 1, shirt = S.top === 'shirt';
    const sleeve = shirt ? S.shirt : S.blouse;
    part(limb(4.6, 1.05 * wide, 0.88 * wide), arm, toonS(sleeve), limbW(BN.chest, arm, wrist, 4.6, 1.0, 0.8), 0.07);
    if (shirt && S.check) for (const y of [-1.2, -2.8]) part(lathe([[1.08 * wide, y], [1.06 * wide, y - 0.4]], 1, 14), arm, toonS(S.check), limbW(BN.chest, arm, wrist, 4.6, 1.0, 0.8));
    part(limb(4.3, 0.78 * wide, 0.55 * wide), wrist, toonS(S.skin), limbW(arm, wrist, hand, 4.3, 0.8, 0.45), 0.06);
    // The sleeve, rolled to just below the elbow.
    part(lathe([[0.97 * wide, 0.15], [1.02 * wide, -0.8], [0.88 * wide, -1.25]], 1, 14), wrist, toonS(shirt ? S.shirtDk : S.blouse), limbW(arm, wrist, hand, 4.3, 0.8, 0.45), 0.05);
    const h = inked(sphere(0.68, 0.78, 1.15, 0.52), M.skin, 0.06); h.position.y = -0.45 * m.handSize; h.scale.setScalar(m.handSize); hand.add(h);
    const thumb = inked(sphere(0.25, 1, 1.6, 1), M.skin, 0.08); thumb.position.set(0, 0.05, 0.45 * m.handSize); thumb.scale.setScalar(m.handSize); thumb.rotation.x = 0.4; hand.add(thumb);
  }
  // ── Legs: hip › knee › ankle. Trousers into tall boots (the men); or bare under a skirt, short boots.
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const thigh = BN['thigh' + s], knee = BN['knee' + s], ankle = BN['ankle' + s], trousers = S.lower === 'trousers';
    const shinW = p => { const wt = ss(-1.0, 1.0, p.y), wa = ss(-6.4, -7.4, p.y); return [[thigh, wt], [ankle, wa], [knee, Math.max(0, 1 - wt - wa)]]; };
    part(limb(7.0, 1.6, 1.12), thigh, toonS(trousers ? S.trousers : S.skin), limbW(BN.hips, thigh, knee, 7.0, 1.3, 1.0), 0.07);
    part(limb(7.3, 1.12, 0.74), knee, toonS(trousers ? S.trousers : S.skin), shinW, 0.07);
    if (trousers) {
      part(lathe([[0, -7.75], [1.02, -7.65], [1.12, -6.6], [1.06, -5.4], [1.02, -4.2], [1.2, -2.2], [1.28, -1.6], [0, -1.6]], 1, 16), knee, toonS(S.boots), shinW, 0.07);
      part(lathe([[1.3, -2.3], [1.42, -1.95], [1.36, -1.45]], 1, 16), knee, toonS(S.bootsDk), shinW, 0.05);
    } else {
      part(lathe([[0, -7.7], [1.0, -7.6], [1.15, -6.5], [1.13, -4.8], [1.12, -3.4], [1.22, -3.0], [0, -3.0]], 1, 14), knee, toonS(S.boots), shinW, 0.07);
    }
    const toe = inked(sphere(0.98, 1, 0.6, 1.55), M.boots, 0.05); toe.scale.set(m.legGirth, 1, m.footSize); toe.position.set(0, -0.3 * LL, 0.85 * m.footSize); ankle.add(toe);
  }

  // ── The cloak: a capelet over the shoulders and down the back, open at the front, the hood lying back; scarlet, edged in gold, stitched with stars.
  // Short at the front (just covering the shoulders), longest at the middle of the back (to the small of it). Its back half hangs from two spring bones.
  if (S.cloak) {
    const g = new THREE.Group(); BN.chest.add(g); const meshes = [];
    const prof = [[9.45, 1.45], [9.15, 2.9], [8.4, 4.25], [7.6, 4.65], [6.2, 4.7], [4.5, 4.45], [2.0, 4.35]];      // (wide enough over the shoulders to clear the arms, then close to the back)
    const rAt = y => { for (let i = 1; i < prof.length; i++) if (y >= prof[i][0]) { const [y0, r0] = prof[i - 1], [y1, r1] = prof[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return prof[prof.length - 1][1]; };
    const hem = phi => { const b = (1 - Math.cos(phi)) / 2; return 7.7 - 5.2 * Math.pow(b, 1.3); };
    const DEPTH = 0.82, PHI0 = Math.PI * 0.12, PHI1 = Math.PI * 1.88;
    const fn = (u, v) => { const phi = lerp(PHI0, PHI1, u), y = lerp(9.45, hem(phi), v), r = rAt(y); return new V3(Math.sin(phi) * r, y, Math.cos(phi) * r * DEPTH); };
    const out = p => new V3(p.x, 0, p.z / DEPTH);
    const capeW = p => {
      const backness = ss(-0.3, -1.8, p.z), wC = backness * ss(7.2, 5.4, p.y), wL = backness * ss(4.6, 2.8, p.y);
      const side = ss(2.6, 4.2, Math.abs(p.x)) * ss(8.8, 7.0, p.y) * (1 - backness) * 0.45;
      return [[BN.chest, Math.max(0, 1 - wC - side)], [BN.cape, wC - wL], [BN.capeLow, wL], [p.x > 0 ? BN.armL : BN.armR, side]];
    };
    capeW.kind = 'cape';
    meshes.push(part(sheet(fn, 32, 12, 0.22, out), BN.hips, [toonS('#cc2a2e', true), toonS('#86181e', true), toonS('#a82024', true)], capeW, 0.08));
    meshes.push(part(band(fn, 32, 1, 0.9, 1.0, 0.03, out), BN.hips, toonS('#e8b84a', true), capeW));                // the gold hem
    meshes.push(part(band(fn, 32, 1, 0.8, 0.82, 0.035, out), BN.hips, toonS('#f0c860', true), capeW));              // a line of gold stitching above it
    // The stars: one large in the middle of the back, small ones along the hem.
    const stars = [], put = (phi, y, r, spin) => {
      const rr = rAt(y), p = new V3(Math.sin(phi) * rr, y, Math.cos(phi) * rr * DEPTH), n = out(p).normalize();
      const sg = starGeo(r), m = new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.06), new THREE.Quaternion().setFromUnitVectors(new V3(0, 0, 1), n).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), spin || 0)), new V3(1, 1, 1));
      stars.push(sg.applyMatrix4(m));
    };
    put(Math.PI, 4.9, 0.8); put(Math.PI + 0.16, 5.9, 0.26, 0.4);
    for (const [d, r] of [[-1.1, 0.24], [-0.75, 0.18], [-0.4, 0.22], [0.0, 0.2], [0.38, 0.24], [0.72, 0.18], [1.08, 0.22], [-1.45, 0.18], [1.45, 0.2]]) put(Math.PI + d, hem(Math.PI + d) + 1.15, r, d);
    meshes.push(part(mergeFlat(stars), BN.hips, toonS('#ffd86a', true), capeW));
    // The hood, lying back between her shoulders (under her hair), and the clasp at her throat.
    const hoodG = new THREE.SphereGeometry(2.3, 16, 9, 0, Math.PI * 2, 0, Math.PI * 0.62); hoodG.scale(1.0, 0.5, 0.78);
    const hood = inked(hoodG, toon('#cc2a2e', { side: THREE.DoubleSide }), 0.03); hood.rotation.x = -1.35; { const q = new V3(0, 9.1, -1.85); D.cape(q); hood.position.copy(q.add(hipsW).sub(inFig(BN.chest))); hood.scale.setScalar(m.shoulderWidth); } g.add(hood);
    const clasp = new THREE.Mesh(sphere(0.4, 1, 1, 0.5), toon('#e8b84a')); { const q = new V3(0, 9.05, 1.45); D.cape(q); clasp.position.copy(q.add(hipsW).sub(inFig(BN.chest))); } g.add(clasp);
    for (const m of meshes) { m.userData.cloak = true; }
    rig.cloak = { group: g, show(on) { g.visible = !!on; fig.traverse(o => { if (o.isSkinnedMesh && (o.userData.cloak || o.userData.cloakInk)) o.visible = !!on; }); }, hood() {} };
    // (the outline hulls follow their meshes: mark them too)
    fig.children.forEach((o, i, arr) => { if (o.isSkinnedMesh && o.material === INKS && arr[i - 1] && arr[i - 1].userData.cloak) o.userData.cloakInk = true; });
    rig.cloak.show(false);
  }

  // ── Secondary motion: spring bones that trail and swing as the body moves, hang under gravity when it leans, and settle.
  const SPRING = { cape: { k: 70, d: 9, gv: 0.0055, ga: 0.0012, max: 0.55, min: -0.04, grav: 0.7 }, capeLow: { k: 60, d: 8, gv: 0.004, ga: 0.0015, max: 0.5, min: -0.06, grav: 0.6 },
    hair1: { k: 55, d: 7, gv: 0.004, ga: 0.0018, max: 0.5, min: -0.05, grav: 0.8 }, hair2: { k: 45, d: 6, gv: 0.004, ga: 0.002, max: 0.55, min: -0.08, grav: 0.8 } };
  rig.springs = Object.keys(SPRING).filter(n => BN[n]).map(n => Object.assign({ bone: BN[n], x: 0, z: 0, vx: 0, vz: 0, prev: null, vel: new V3() }, SPRING[n]));
  const tw = new V3(), tq = new THREE.Quaternion(), ws = new V3(), gl = new V3();
  rig.tick = dt => {
    dt = clamp(dt || 1 / 60, 1 / 240, 1 / 20);
    // How fast she is turning (for the lean into a turn).
    const yaw = root_.rotation.y; if (rig._yaw == null) rig._yaw = yaw;
    let dy = yaw - rig._yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); rig._yaw = yaw;
    rig.yawRate = lerp(rig.yawRate || 0, dy / dt, Math.min(1, dt * 8));
    root_.updateMatrixWorld(true); root_.getWorldScale(ws); const sc = Math.max(0.2, ws.x);
    for (const s of rig.springs) {
      s.bone.getWorldPosition(tw);
      if (!s.prev) { s.prev = tw.clone(); continue; }
      const v = tw.clone().sub(s.prev).divideScalar(dt * sc); s.prev.copy(tw);
      if (v.length() > 600) { s.vel.set(0, 0, 0); s.x = s.z = s.vx = s.vz = 0; continue; }       // (a teleport, not a movement)
      const acc = v.clone().sub(s.vel).divideScalar(dt); s.vel.lerp(v, 0.5);
      s.bone.parent.getWorldQuaternion(tq).invert(); const lv = s.vel.clone().applyQuaternion(tq), la = acc.applyQuaternion(tq); gl.set(0, -1, 0).applyQuaternion(tq);
      let tx = s.gv * lv.z + s.ga * la.z - Math.atan2(gl.z, -gl.y) * s.grav, tz = -s.gv * lv.x - s.ga * la.x + Math.atan2(gl.x, -gl.y) * s.grav;
      tx = clamp(tx, s.min, s.max); tz = clamp(tz, -s.max * 0.6, s.max * 0.6);
      s.vx += (s.k * (tx - s.x) - s.d * s.vx) * dt; s.x += s.vx * dt; s.vz += (s.k * (tz - s.z) - s.d * s.vz) * dt; s.z += s.vz * dt;
      s.x = clamp(s.x, s.min, s.max); s.bone.rotation.set(s.x, 0, s.z);
    }
  };

  // ── The names the rest of the game uses.
  Object.assign(rig, {
    bones: BN, skeleton: skel, hips: BN.hips, torso: BN.spine, spine: BN.spine, chest: BN.chest, neck: BN.neck, head: BN.head,
    armL: BN.armL, armR: BN.armR, elbowL: BN.elbowL, elbow: BN.elbowR, wristL: BN.wristL, wrist: BN.wristR, handL: BN.handL, handR: BN.handR,
    legL: { thigh: BN.thighL, knee: BN.kneeL, ankle: BN.ankleL, sign: 1 }, legR: { thigh: BN.thighR, knee: BN.kneeR, ankle: BN.ankleR, sign: -1 },
  });
  BN.armL.userData.sign = 1; BN.armR.userData.sign = -1;
  rig.state = {}; rig.target = {}; rig.baseHip = F.hipsY; rig.figure = F; rig.apply = function () { if (this.after) this.after(this); };
  rig.setExpr('calm');
  pose(rig, { t: 0, phase: 0, speed: 0 }, 1);
  return rig;
}

// ── Movement. One procedural pose for standing, walking, running, carrying, gesturing and jumping, blended smoothly between them. ─────────────────
// a = { t (seconds), phase (radians through the stride: the caller advances it by distance / stride length), speed (0 still, 20 or more walking),
//       running (bool), look (head turn), gesture (0..1, right arm out), carry (bool), air (bool) }. Smoothed state is kept on a.
function pose(r, a, dt) {
  dt = clamp(dt || 1 / 60, 0, 0.1);
  const k = Math.min(1, dt * 6), t = a.t || 0, p = a.phase || 0;
  a._mv = lerp(a._mv || 0, clamp((a.speed || 0) / 20, 0, 1), k); a._run = lerp(a._run || 0, a.running ? 1 : 0, k); a._air = lerp(a._air || 0, a.air ? 1 : 0, Math.min(1, dt * 10));
  a._carry = lerp(a._carry || 0, a.carry ? 1 : 0, k); a._g = lerp(a._g || 0, a.gesture || 0, k);
  const accel = ((a._mv || 0) - (a._mvPrev == null ? a._mv : a._mvPrev)) / Math.max(dt, 1e-3); a._mvPrev = a._mv; a._acc = lerp(a._acc || 0, accel, Math.min(1, dt * 5));
  const mv = a._mv, run = a._run * mv, idle = 1 - mv, air = a._air, carry = a._carry, g = a._g, skirt = r.spec && r.spec.lower === 'skirt';
  const amp = (skirt ? 0.4 : 0.5) * mv + (skirt ? 0.08 : 0.22) * run, sL = Math.sin(p), cL = Math.cos(p), sA = Math.sin(p - 0.3);
  const shift = Math.sin(t * 0.45), breath = Math.sin(t * 1.7);
  // Pelvis: it rises and falls twice a stride (highest as the legs pass), turns with the stepping leg and dips on the swinging side; standing, the weight drifts from foot to foot.
  const hipYaw = 0.12 * mv * sL, hipRoll = 0.045 * mv * cL + 0.035 * shift * idle;
  r.hips.position.set(0.22 * shift * idle, r.baseHip + mv * (0.5 * Math.abs(cL) - 0.45) - 0.7 * run + 0.04 * breath * idle, 0);
  r.hips.rotation.set(0.04 * run, hipYaw, hipRoll);
  // Spine and chest: counter-turn against the pelvis (shoulders opposite the hips), lean into a run, into speeding up, and into a turn.
  const turnLean = -0.05 * clamp(r.yawRate || 0, -4, 4) * mv, lean = 0.03 * mv + 0.12 * run + clamp(a._acc, -2, 2) * 0.04;
  r.spine.rotation.set(lean * 0.6, -0.5 * hipYaw, -0.5 * hipRoll + turnLean);
  r.chest.rotation.set(lean * 0.4 + 0.02 * breath * idle, -1.0 * hipYaw, -0.4 * hipRoll + turnLean * 0.5);
  r.chest.scale.set(1 + 0.008 * breath * idle, 1 + 0.01 * breath * idle, 1 + 0.018 * breath * idle);
  // Head: kept steady and level (it undoes most of what the body below it does), with a small nod at each step and, standing, an idle drift of attention.
  r.neck.rotation.set(-0.8 * (lean + 0.04 * run) + 0.035 * mv * Math.sin(2 * p), (a.look || 0) + 0.5 * hipYaw + 0.12 * Math.sin(t * 0.31) * idle, -0.6 * (r.spine.rotation.z + r.chest.rotation.z));
  r.head.rotation.set(0.02 * Math.sin(t * 0.53) * idle, 0, 0.04 * Math.sin(t * 0.37) * idle);
  // Legs: the thigh swings; the knee folds as the leg comes through, and softens at the heel; the foot stays near level, pushing off at the back.
  for (const [leg, ph] of [[r.legL, 0], [r.legR, Math.PI]]) {
    const s = Math.sin(p + ph), c = Math.cos(p + ph), side = leg.sign;
    let th = amp * s, kn = 0.06 + Math.max(0, -c) * ((skirt ? 0.55 : 0.9) * mv + (skirt ? -0.1 : 0.75) * run) + Math.max(0, s) * 0.18 * mv;
    th = lerp(th, side > 0 ? -0.55 : 0.2, air); kn = lerp(kn, side > 0 ? 0.9 : 0.5, air);
    leg.thigh.rotation.set(th, 0, side * (0.035 + 0.025 * idle * (side * shift > 0 ? 0.4 : 1)));
    leg.knee.rotation.set(kn, 0, 0);
    if (leg.ankle) leg.ankle.rotation.set(-(th + kn) * 0.85 + Math.max(0, s) * 0.3 * mv * (1 - air), 0, 0);
  }
  // Arms: they swing against the legs, a beat behind (so the elbows and hands trail), the elbows bending more in front and in a run; carrying, both
  // come forward; a gesture lifts the right; in the air they rise out to the sides.
  for (const [arm, elbow, hand, side] of [[r.armL, r.elbowL, r.handL, 1], [r.armR, r.elbow, r.handR, -1]]) {
    const s = side > 0 ? sA : -sA;
    const armAmp = 0.36 * mv + 0.3 * run;
    let ax = -armAmp * s - 0.06 * run + 0.03 * Math.sin(t * 1.1 + side) * idle, az = side * (0.12 + (skirt ? 0.06 + 0.1 * run : 0.06 * run) + 0.02 * idle * shift * side), el = -(0.18 + 0.2 * mv + 0.6 * run + 0.35 * mv * Math.max(0, -s));
    ax = lerp(ax, -1.15, carry); el = lerp(el, -0.75, carry); az = lerp(az, side * 0.05, carry);
    if (skirt) ax = Math.min(ax, 0.3);          // (the hand never swings back into the skirt)
    if (side < 0) { ax = lerp(ax, -1.0, g); el = lerp(el, -0.55, g); az = lerp(az, -0.08, g); }
    ax = lerp(ax, -0.5, air); az = lerp(az, side * 0.75, air); el = lerp(el, -0.4, air);
    arm.rotation.set(ax, 0, az); elbow.rotation.set(el, 0, 0);
    if (hand) hand.rotation.set(0.12 * mv * Math.sin(p - 0.8) * side + 0.08, 0, side * 0.08);
  }
}

root.Toon = { make, pose, SPECS, MEASURE, MIN_HEADS, STORE_KEY, measuresFor, clampMeasures, figure, toon, inked, INK, flat };
})(typeof window !== 'undefined' ? window : globalThis);
