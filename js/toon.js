// Little Red’s Lessons — the characters, in a soft toon style: smooth rounded bodies, two-band cel shading and a thin warm outline (an inverted hull), with
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
// ── Clipping. A covered part (skin under the skirt or inside the boots, the drawers under the skirt, the blouse under the bodice) keeps its
// own colour unless it pokes out through what covers it; then, there, it's drawn in the colour of the layer it came through, so the poke reads
// as a fold of that layer rather than something showing through. To know where: before each frame the outer layers of each figure (four
// kinds: skirts, boots, drawers, bodice and apron) are drawn on their own as depth, and a covered point that lies in front of the outer surface
// of the layer over it, there on the screen, is one that has come through it. (So, looking up under a skirt, the legs are legs.)
const CLIP_KINDS = { skirt: 0, boots: 1, drawers: 2, bodice: 3, apron: 3 };
const LIVE = new Set(); let liveId = 0;
const WHITE = (() => { const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat); t.needsUpdate = true; return t; })();
const DEPTHM = [false, true].map(sk => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, skinning: sk, side: THREE.FrontSide }));
// A material for a covered part: its own colour per point ('color'), and per point the colour of what covers it and how much ('cover', the
// fourth number), and which kind of layer that is ('coverKind').
function clipMaterial(rig, o) {
  const m = new THREE.MeshToonMaterial(Object.assign({ color: 0xffffff, vertexColors: true, gradientMap: ramp(), skinning: true }, o));
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, rig.clipU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 cover; attribute float coverKind; varying vec4 vCover; varying float vKind;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCover = cover; vKind = coverKind;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec4 vCover; varying float vKind; uniform sampler2D uClip0; uniform sampler2D uClip1; uniform sampler2D uClip2; uniform sampler2D uClip3; uniform vec2 uClipRes;
float clipDepth(vec4 v) { return dot(v, (255. / 256.) / vec4(256. * 256. * 256., 256. * 256., 256., 1.)); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
if (vCover.a > 0.002) {
  vec2 st = gl_FragCoord.xy / uClipRes;
  vec4 pk = vKind < 0.5 ? texture2D(uClip0, st) : vKind < 1.5 ? texture2D(uClip1, st) : vKind < 2.5 ? texture2D(uClip2, st) : texture2D(uClip3, st);
  float d = clipDepth(pk);
  // (not drawn where it's through what covers it, or just at it: that's right there, shaded as itself; no seam where the two meet)
  if (d < 0.99999 && vCover.a > 0.5 && gl_FragCoord.z < d + 0.00006) discard;
  if (d < 0.99999 && gl_FragCoord.z < d - 0.00001) diffuseColor.rgb = mix(diffuseColor.rgb, vCover.rgb, vCover.a);
}`);
  };
  return m;
}
// The outline of something covered: drawn in ink as any other, except where it lies in front of what covers it (pushing through the cloth over
// it): there it isn't drawn at all, so the shape of what's underneath never shows as a line on top. (The same test as clipMaterial's.)
function clipInk(rig) {
  const m = new THREE.MeshBasicMaterial({ color: srgb(INK), side: THREE.BackSide, skinning: true });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, rig.clipU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 cover; attribute float coverKind; varying float vCovA; varying float vKind;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCovA = cover.a; vKind = coverKind;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying float vCovA; varying float vKind; uniform sampler2D uClip0; uniform sampler2D uClip1; uniform sampler2D uClip2; uniform sampler2D uClip3; uniform vec2 uClipRes;
float clipDepth(vec4 v) { return dot(v, (255. / 256.) / vec4(256. * 256. * 256., 256. * 256., 256., 1.)); }`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
if (vCovA > 0.002) {
  vec2 st = gl_FragCoord.xy / uClipRes;
  vec4 pk = vKind < 0.5 ? texture2D(uClip0, st) : vKind < 1.5 ? texture2D(uClip1, st) : vKind < 2.5 ? texture2D(uClip2, st) : texture2D(uClip3, st);
  float d = clipDepth(pk);
  if (d < 0.99999 && gl_FragCoord.z < d + 0.00006) discard;
}`);
  };
  return m;
}
// Draw each live figure's outer layers as depth, kind by kind. Called by the stage before each frame is drawn.
const _sz = new THREE.Vector2();
function clipPass(renderer, scene, camera) {
  renderer.getDrawingBufferSize(_sz); const w = Math.max(1, _sz.x), h = Math.max(1, _sz.y);
  const inScene = o => { for (; o; o = o.parent) if (o === scene) return true; return false; };
  const bg = scene.background, mask = camera.layers.mask, auto = renderer.shadowMap.autoUpdate, rt0 = renderer.getRenderTarget(), cc = renderer.getClearColor(new THREE.Color()), ca = renderer.getClearAlpha();
  scene.background = null; renderer.shadowMap.autoUpdate = false; renderer.setClearColor(0xffffff, 1);
  for (const rig of LIVE) {
    if (!inScene(rig.root)) { if (!rig.root.parent) { LIVE.delete(rig); for (const t of rig.clipRT) t.dispose(); } continue; }
    rig.clipU.uClipRes.value.copy(_sz);
    for (let k = 0; k < 4; k++) {
      const list = rig.clipSrc[k].filter(m => { for (let o = m; o; o = o.parent) if (!o.visible) return false; return true; });
      const rt = rig.clipRT[k], U = rig.clipU['uClip' + k];
      if (!list.length) { U.value = WHITE; continue; }
      if (rt.width !== w || rt.height !== h) rt.setSize(w, h);
      const L = 1 + ((rig.clipId * 4 + k) % 31), saved = list.map(m => m.material);
      list.forEach(m => { m.layers.enable(L); m.material = DEPTHM[m.isSkinnedMesh ? 1 : 0]; });
      camera.layers.set(L); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);
      list.forEach((m, i) => { m.layers.disable(L); m.material = saved[i]; });
      U.value = rt.texture;
    }
  }
  camera.layers.mask = mask; scene.background = bg; renderer.shadowMap.autoUpdate = auto; renderer.setRenderTarget(rt0); renderer.setClearColor(cc, ca);
}

// The outline: the same shape pushed out along its normals, drawn from the inside in ink.
// (w: one width, or one for each point)
function hullGeo(geo, w) {
  const g = geo.clone(), p = g.attributes.position, n = g.attributes.normal, q = new V3();
  for (let i = 0; i < p.count; i++) { q.fromBufferAttribute(p, i).addScaledVector(new V3().fromBufferAttribute(n, i), typeof w === 'number' ? w : w[i]); p.setXYZ(i, q.x, q.y, q.z); }
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
// Each character: their size and build (multipliers on the shared proportions below), how they're dressed, their hair, and their colours.
//   sex 'f' or 'm'; bust (0 for none); build: shoulders, chest, waist, hips, arms, legs, neck; face: jaw, nose, eyes (size), lash (0..1, how
//   heavy the lashes), brow (how thick the brows), lips (how much colour). Dress: top ('blouse' or 'shirt'; sleeves 'elbow', 'long' or 'rolled';
//   puff), bodice (laced, over the blouse), vest ('waistcoat', 'jerkin', 'coat': over the shirt), lower ('skirt', 'trousers', 'gown' to the
//   floor), smock (a long shirt over the trousers), skirtLen, apron ('cloth', 'leather', 'white'), shawl, hat ('mob', 'nightcap', 'bakers',
//   'flatcap', 'felt', 'tricorn'), cape (a short cape over the shoulders, not when seated), feet ('boots', 'bare', 'slippers'). Hair: 'long', 'bun', 'short', 'tousled', 'curly', 'tail', 'braid', 'bald'; beard
//   'full', 'short', 'moustache', 'pointed', 'stubble'. pal: their colours (skin, hair, eyes and lips can be changed in the editor).
const SPECS = {
  red: { name: 'Rose', age: 19, sex: 'f', scale: 0.85, bust: 1, hair: 'long', feet: 'boots', skirtLen: 6 },
  gerda: { name: 'Maren', age: 38, sex: 'f', scale: 1.04, bust: 1.12, hair: 'bun', feet: 'boots', skirtLen: 13.6 },
  // (her grandmother: shorter, softer through the middle, grey all through her hair, a knitted shawl over her shoulders, and a face that's laughed a lot)
  gran: { name: 'Hulda', age: 71, sex: 'f', scale: 0.93, bust: 1.18, hair: 'bun', feet: 'boots', skirtLen: 14, waist: 1.22, grey: true, shawl: true, old: true },
  // ── The village's women.
  pennock: { name: 'Mistress Pennock', age: 44, sex: 'f', scale: 0.97, bust: 1.25, waist: 1.25, hips: 1.08, arms: 1.12, hair: 'bun', hat: 'mob', apron: 'white', feet: 'boots', skirtLen: 13.4, sleeves: 'rolled',
    pal: { skin: '#f8d6bc', hair: '#a8784a', eyes: '#5f7f95', lips: '#c4686a', top: '#f2ece0', bodice: '#5a6a8a', skirt: '#6a7aa0', skirtDk: '#4e5c80', hem: '#4e5c80', apron: '#fbf8f2', apronDk: '#e2dcd0' } },
  abney: { name: 'Mistress Abney', age: 52, sex: 'f', scale: 1.0, bust: 1.18, waist: 1.18, hips: 1.05, hair: 'bun', grey: true, feet: 'boots', skirtLen: 13.6, apron: 'cloth', old: true,
    pal: { skin: '#f2cfb2', hair: '#5a4034', eyes: '#6a4a2a', lips: '#b06068', top: '#efe6d4', bodice: '#3a4a34', skirt: '#4a5a3e', skirtDk: '#38462e', hem: '#38462e', apron: '#ece2c8', apronDk: '#d4c8aa' } },
  abneyDaughter: { name: 'Bess Abney', age: 26, sex: 'f', scale: 0.93, jaw: 0.9, neck: 0.85, legs: 0.85, arms: 0.8, hips: 0.86, chest: 0.85, shoulders: 0.85, bust: 0.49, waist: 0.8, hair: 'braid', feet: 'boots', skirtLen: 13.2,
    pal: { skin: '#f4d0b4', hair: '#6a4430', eyes: '#6a4a2a', lips: '#c46a70', top: '#f4ecdc', bodice: '#5a7a9a', skirt: '#86a4c0', skirtDk: '#6a88a6', hem: '#6a88a6' } },
  agnes: { name: 'Agnes Thatcher', age: 19, sex: 'f', scale: 0.87, neck: 1.1, legs: 1.1, arms: 1.12, waist: 1.1, chest: 1.13, bust: 1.25, hair: 'long', feet: 'boots', skirtLen: 9,
    pal: { skin: '#fbe0cc', hair: '#e8c070', eyes: '#4a70b0', lips: '#d0707a', top: '#fbf4e4', bodice: '#a86a3a', skirt: '#d8a840', skirtDk: '#b88a2c', hem: '#fbf4e4' } },
  lucy: { name: 'Lucy Locket', age: 20, sex: 'f', scale: 0.87, seatH: 1.25, bust: 1.0, hair: 'curly', feet: 'boots', skirtLen: 9.5,
    pal: { skin: '#eec4a2', hair: '#2a1c16', eyes: '#6a4a2a', lips: '#c4585e', top: '#ece4d4', bodice: '#5a5a62', skirt: '#9ab0c4', skirtDk: '#7a90a6', hem: '#7a90a6' } },
  kitty: { name: 'Kitty Fisher', age: 24, sex: 'f', scale: 0.99, bust: 1.05, hair: 'long', feet: 'boots', skirtLen: 11,
    pal: { skin: '#f6d3b8', hair: '#16110f', eyes: '#2e6a40', lips: '#a8525a', top: '#f0e8d8', bodice: '#2e4a3a', skirt: '#3e6a4e', skirtDk: '#2e523c', hem: '#2e523c' } },
  brannock: { name: 'Mother Brannock', age: 58, sex: 'f', scale: 1.0, bust: 1.1, waist: 1.1, hair: 'bun', grey: true, hat: 'mob', feet: 'boots', skirtLen: 14, old: true, sleeves: 'long',
    pal: { skin: '#f0cdb0', hair: '#8a8580', eyes: '#5a5a62', lips: '#a06068', top: '#f4f0e8', bodice: '#2a2628', skirt: '#2e2a2c', skirtDk: '#201c1e', hem: '#201c1e' } },
  motherBarrow: { name: 'Mother Barrow', age: 45, sex: 'f', scale: 1.06, bust: 1.22, waist: 1.2, hips: 1.08, arms: 1.1, hair: 'bun', feet: 'boots', skirtLen: 13.4, apron: 'cloth', shawl: true,
    pal: { skin: '#f2c8a6', hair: '#8a4a2a', eyes: '#6a4a2a', lips: '#b8606a', top: '#efe2cc', bodice: '#6a3a24', skirt: '#8a5a32', skirtDk: '#6a4224', hem: '#6a4224', apron: '#e8d8b8', apronDk: '#cfbe9a', cloak: '#3a6a4a' } },
  // ── The village's men.
  peter: { name: 'Peter Fowler', age: 21, sex: 'm', scale: 0.95, shoulders: 1.1, chest: 1.06, waist: 0.96, hips: 0.92, arms: 1.06, neck: 1.08, jaw: 1.08, hair: 'curly', feet: 'boots', vest: 'waistcoat', sleeves: 'rolled',
    pal: { skin: '#f2c8a6', hair: '#6a4430', eyes: '#5f7f95', lips: '#c08878', top: '#f0e8d6', vest: '#4a5a3a', trousers: '#6a5a46', boots: '#5a3a22', bootsDk: '#3e2614' } },
  // (his grandfather, the old fowler he lives with at the meadow's edge: stooped a little, bald and white, a long moustache, an old brown coat)
  fowler: { name: 'Master Fowler', age: 73, sex: 'm', scale: 0.94, shoulders: 1.02, chest: 1.0, waist: 1.12, hips: 0.96, neck: 1.0, jaw: 1.04, nose: 1.15, hair: 'bald', grey: true, beard: 'moustache', feet: 'boots', vest: 'coat', sleeves: 'long', old: true,
    pal: { skin: '#eec4a2', hair: '#e2ded6', eyes: '#5f7f95', lips: '#a87068', top: '#e8dfcc', vest: '#6a5038', trousers: '#5a5650', boots: '#4a3424', bootsDk: '#2e2014' } },
  tom: { name: 'Tom Ferrier', age: 20, sex: 'm', scale: 0.98, shoulders: 1.12, chest: 1.08, waist: 0.98, hips: 0.92, arms: 1.12, neck: 1.1, jaw: 1.06, hair: 'tousled', feet: 'boots', apron: 'leather', sleeves: 'rolled',
    pal: { skin: '#eec09a', hair: '#2a1c16', eyes: '#6a4a2a', lips: '#b88070', top: '#e6dcc8', trousers: '#4a4440', apron: '#6a4428', apronDk: '#4a2e1a' } },
  smith: { name: 'Master Ferrier', age: 46, sex: 'm', scale: 1.12, shoulders: 1.22, chest: 1.18, waist: 1.12, hips: 1.0, arms: 1.3, legs: 1.12, neck: 1.2, jaw: 1.16, hair: 'short', beard: 'full', feet: 'boots', apron: 'leather', sleeves: 'rolled',
    pal: { skin: '#e8b890', hair: '#2a2420', eyes: '#5a5a62', lips: '#a87060', top: '#dcd2c0', trousers: '#3a3634', apron: '#5a3a22', apronDk: '#3e2614' } },
  baker: { name: 'Master Pennock', age: 47, sex: 'm', scale: 1.02, shoulders: 1.08, chest: 1.12, waist: 1.35, hips: 1.12, arms: 1.1, neck: 1.15, jaw: 1.12, hair: 'bald', beard: 'moustache', hat: 'bakers', feet: 'boots', apron: 'white', sleeves: 'rolled',
    pal: { skin: '#f6d0b4', hair: '#8a6a4a', eyes: '#5f7f95', lips: '#c07870', top: '#f6f2ea', trousers: '#5a5248', apron: '#fbf8f2', apronDk: '#e2dcd0', hat: '#fbf8f2' } },
  halloran: { name: 'Master Halloran', age: 66, sex: 'm', scale: 0.98, shoulders: 1.06, chest: 1.04, waist: 1.12, hips: 0.98, neck: 1.05, jaw: 1.1, hair: 'short', grey: true, beard: 'short', hat: 'felt', smock: true, feet: 'boots', old: true, sleeves: 'long',
    pal: { skin: '#e4b48c', hair: '#c8c4bc', eyes: '#5f7f95', lips: '#a87068', top: '#e8dcc0', trousers: '#5a4a38', hat: '#6a5a44' } },
  // (the Watchman: "in his nightgown" read as his night watchman's garb, a short cape over his shoulders that leaves his arms free, set aside when
  // he sits to take someone in hand, and a tricorn hat)
  willie: { name: 'William Dunn', age: 42, sex: 'm', scale: 1.05, shoulders: 1.14, chest: 1.0, waist: 1.0, hips: 0.95, neck: 1.05, jaw: 1.06, hair: 'short', beard: 'stubble', hat: 'tricorn', cape: true, feet: 'boots', vest: 'waistcoat', sleeves: 'long',
    pal: { skin: '#f0caa8', hair: '#6a5040', eyes: '#4a70b0', lips: '#b07a6e', top: '#ece6da', vest: '#3a3c48', trousers: '#3a3632', boots: '#2e241c', bootsDk: '#1e1610', hat: '#29272c', cloak: '#2e3a4e', lace: '#56657c' } },
  georgie: { name: 'Georgie Dunn', age: 19, sex: 'm', scale: 0.91, shoulders: 1.04, chest: 1.0, waist: 0.95, hips: 0.92, neck: 1.04, jaw: 1.02, hair: 'tousled', hat: 'flatcap', feet: 'boots', sleeves: 'rolled', flour: true,
    pal: { skin: '#fbe0cc', hair: '#d0a050', eyes: '#4a70b0', lips: '#c08878', top: '#ece6d8', trousers: '#8a7a62', hat: '#5a5048' } },
  holt: { name: 'Holt', age: 41, sex: 'm', scale: 1.1, shoulders: 1.2, chest: 1.14, waist: 1.15, hips: 0.96, arms: 1.22, legs: 1.08, neck: 1.18, jaw: 1.14, hair: 'tail', beard: 'short', feet: 'boots', vest: 'jerkin', sleeves: 'long',
    pal: { skin: '#dca880', hair: '#5a3a24', eyes: '#4f8a62', lips: '#a06a5a', top: '#c8b898', vest: '#4a3a28', trousers: '#3e4a34', boots: '#3e2a1a', bootsDk: '#2a1a0e' } },
  wolfe: { name: 'Wolfe', age: 36, sex: 'm', scale: 1.02, shoulders: 1.12, chest: 1.06, waist: 0.95, hips: 0.92, arms: 1.06, neck: 1.08, jaw: 1.1, nose: 1.15, hair: 'short', beard: 'pointed', feet: 'boots', vest: 'coat', sleeves: 'long',
    pal: { skin: '#eccbb0', hair: '#2e2a2a', eyes: '#c88a2a', lips: '#9a6a62', top: '#e8e2d8', vest: '#2a2a30', trousers: '#2e2c30', boots: '#1e1a1a', bootsDk: '#141010' } },
  fatherBarrow: { name: 'Father Barrow', age: 48, sex: 'm', scale: 1.14, shoulders: 1.24, chest: 1.22, waist: 1.3, hips: 1.08, arms: 1.28, legs: 1.15, neck: 1.22, jaw: 1.18, hair: 'curly', beard: 'full', feet: 'boots', vest: 'waistcoat', sleeves: 'rolled',
    pal: { skin: '#e8bc94', hair: '#6a3a1e', eyes: '#6a4a2a', lips: '#a87060', top: '#e8dcc4', vest: '#7a3a2a', trousers: '#5a3e26' } },
  weeBarrow: { name: 'Wee Barrow', age: 22, sex: 'm', scale: 0.82, seatD: 0.8, seatH: 1, seatW: 1, seatZ: 1.1, seatY: -0.35, seatX: 1, shoulders: 1.02, chest: 1.04, waist: 1.08, hips: 1.0, arms: 1.04, neck: 1.04, jaw: 1.0, hair: 'curly', feet: 'boots', sleeves: 'long', top: 'jumper',
    pal: { skin: '#f4cca8', hair: '#a86a3a', eyes: '#6a4a2a', lips: '#c08070', top: '#d8a85a', trousers: '#6a4a30' } },
};
// (a man's seat: narrower, shallower and less round than a woman's, sitting within his narrower hips. Seat height (seatY) is moved in units,
// 0 being the baseline's; the rest are multipliers)
for (const S of Object.values(SPECS)) if (S.sex === 'm') { if (S.seatW == null) S.seatW = 0.74; if (S.seatH == null) S.seatH = 0.83; if (S.seatD == null) S.seatD = 0.69; if (S.seatX == null) S.seatX = 0.92; }
// ── Tuning: every number the figures are built from, adjustable in the editor (editor.html) and kept in the browser, so the lap scene uses them
// too. [key, group, label, default, min, max, step]. Lengths are in the figure's units (a figure stands about 31 tall); the rest are multipliers.
const TUNE = [
  ['hipY', 'Proportions', 'Hip height', 15.2, 12, 18, 0.05], ['hipX', 'Proportions', 'Hip joint spacing', 1.55, 1.1, 2.2, 0.01],
  ['thigh', 'Proportions', 'Thigh length', 7.4, 5.5, 9, 0.05], ['shin', 'Proportions', 'Shin length', 7.0, 5.5, 9, 0.05],
  ['torsoY', 'Proportions', 'Waist bend height', 0.9, 0.3, 1.8, 0.05], ['shY', 'Proportions', 'Shoulder height', 7.6, 6.5, 8.6, 0.05],
  ['shX', 'Proportions', 'Shoulder width', 3.1, 2.4, 3.8, 0.01], ['ua', 'Proportions', 'Upper arm length', 5.0, 4, 6, 0.05],
  ['fa', 'Proportions', 'Forearm length', 4.4, 3.5, 5.5, 0.05], ['neckY', 'Proportions', 'Neck base height', 8.15, 7.8, 9.4, 0.05],
  ['headY', 'Proportions', 'Neck length', 0.9, 0.4, 1.8, 0.05], ['headScale', 'Proportions', 'Head size', 1.34, 1, 1.7, 0.01],
  ['hipWidth', 'Body', 'Hip width', 1.08, 0.8, 1.3, 0.01], ['waistWidth', 'Body', 'Waist width', 1, 0.75, 1.3, 0.01], ['chestWidth', 'Body', 'Chest width', 1, 0.8, 1.3, 0.01],
  ['bodyDepth', 'Body', 'Body depth (front to back)', 1, 0.8, 1.25, 0.01], ['armGirth', 'Body', 'Arm thickness', 1, 0.7, 1.4, 0.01], ['legGirth', 'Body', 'Leg thickness', 1, 0.7, 1.4, 0.01],
  ['neckGirth', 'Body', 'Neck thickness', 1.3, 0.7, 1.5, 0.01], ['handSize', 'Body', 'Hand size', 1.3, 0.7, 1.5, 0.01], ['footSize', 'Body', 'Foot size', 1.3, 0.7, 1.5, 0.01],
  ['bustX', 'Bust', 'Spacing', 1.15, 0.8, 1.6, 0.01], ['bustY', 'Bust', 'Height', 6.2, 5, 7.3, 0.05], ['bustAmt', 'Bust', 'Fullness', 0.95, 0, 1.8, 0.01], ['bustW', 'Bust', 'Width', 0.95, 0.6, 1.4, 0.01],
  ['cheekX', 'Seat', 'Spacing', 1.25, 0.6, 2, 0.01], ['cheekY', 'Seat', 'Height', -0.6, -3, 0, 0.01], ['cheekZ', 'Seat', 'Depth', -1.15, -2, -0.6, 0.01],
  ['cheekW', 'Seat', 'Width', 2, 1.2, 2.3, 0.01], ['cheekH', 'Seat', 'Height of each cheek', 1.75, 1.3, 2.5, 0.01], ['cheekD', 'Seat', 'Roundness', 1.5, 0.9, 2, 0.01],
  ['tilt', 'Seat', 'Where smacks land (lower ↔ higher)', 0.35, 0, 0.9, 0.01], ['cheekFollow', 'Seat', 'Follows the thigh (0 hips ↔ 1 thigh)', 1, 0, 1, 0.01],
  ['sacrum', 'Seat', 'Small of the back, over a lap (flatter ↔ fuller)', 0.6, 0.6, 1, 0.01],
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
  if (RAMP) { RAMP.image.data.set([K.shadow, K.shadow, K.shadow, 255, K.shadowMid, K.shadowMid, K.shadowMid, 255]); RAMP.needsUpdate = true; }
  if (keep !== false) try { root.localStorage && root.localStorage.setItem(TUNE_KEY, JSON.stringify(K)); } catch (e) { /* no storage */ }
  return Object.assign({}, K);
}
const getTune = () => Object.assign({}, K);
function resetTune() { try { root.localStorage && root.localStorage.removeItem(TUNE_KEY); } catch (e) { /* no storage */ } return setTune({}, false); }

// ── Each character's variations on the shared shape above (which is everyone's baseline): their size, bust and skirt length, and their build and
// face as multipliers on it (1 is the baseline). Their own are in SPECS; the editor changes them, kept in the browser by character.
//   [field, label, baseline, min, max, step, whom it applies to]
const VARY = [
  ['scale', 'Overall size', 1, 0.7, 1.3, 0.01], ['bust', 'Bust', 0, 0, 1.8, 0.01, S => S.sex === 'f'],
  ['skirtLen', 'Skirt length', 12, 3, 14.4, 0.1, S => S.sex === 'f' || S.lower === 'gown'],
  ['shoulders', 'Shoulder width', 1, 0.8, 1.4, 0.01], ['chest', 'Chest width', 1, 0.8, 1.4, 0.01], ['waist', 'Waist width', 1, 0.8, 1.45, 0.01],
  ['hips', 'Hip width', 1, 0.8, 1.35, 0.01], ['arms', 'Arm thickness', 1, 0.8, 1.45, 0.01], ['legs', 'Leg thickness', 1, 0.8, 1.35, 0.01],
  ['neck', 'Neck thickness', 1, 0.8, 1.35, 0.01], ['jaw', 'Jaw width', 1, 0.8, 1.3, 0.01], ['nose', 'Nose size', 1, 0.6, 1.5, 0.01], ['eyes', 'Eye size', 1, 0.75, 1.3, 0.01],
  ['seatX', 'Seat: spacing', 1, 0.7, 1.4, 0.01], ['seatY', 'Seat: height (lower ↔ higher)', 0, -1, 1, 0.01], ['seatZ', 'Seat: depth', 1, 0.6, 1.5, 0.01],
  ['seatW', 'Seat: width', 1, 0.6, 1.3, 0.01], ['seatH', 'Seat: height of each cheek', 1, 0.6, 1.3, 0.01], ['seatD', 'Seat: roundness', 1, 0.6, 1.3, 0.01],
].map(([f, label, base, lo, hi, step, applies]) => ({ f, label, base, lo, hi, step, applies: applies || (() => true) }));
const SHAPES_KEY = 'red-lessons:shapes';
// (their own, as built: what the editor's changes are measured from)
const SPEC0 = Object.fromEntries(Object.entries(SPECS).map(([id, S]) => [id, Object.fromEntries(VARY.map(v => [v.f, S[v.f] == null ? v.base : S[v.f]]))]));
const varies = id => VARY.filter(v => v.applies(SPECS[id]));
let SHAPES = {};
// Put each character's changes in force (anything not changed is their own) and, unless told not to, keep them in the browser.
function setShapes(o, keep) {
  SHAPES = {};
  for (const id in SPECS) for (const v of VARY) {
    const x = o && o[id] && +o[id][v.f], own = SPEC0[id][v.f];
    SPECS[id][v.f] = isFinite(x) && o[id][v.f] !== null ? clamp(x, v.lo, v.hi) : own;
    if (Math.abs(SPECS[id][v.f] - own) > 1e-9) (SHAPES[id] = SHAPES[id] || {})[v.f] = SPECS[id][v.f];
  }
  if (keep !== false) try { root.localStorage && root.localStorage.setItem(SHAPES_KEY, JSON.stringify(SHAPES)); } catch (e) { /* no storage */ }
  return JSON.parse(JSON.stringify(SHAPES));
}
function loadShapes() {
  try {
    const st = root.localStorage, v = st && st.getItem(SHAPES_KEY); if (v) return JSON.parse(v);
    // (Rose's and Maren's size, bust and skirt were kept with the shared shape once: brought over from there)
    const old = JSON.parse((st && st.getItem(TUNE_KEY)) || '{}'), o = {}, from = { red: ['redScale', 'redBust', 'redSkirt'], gerda: ['gerdaScale', 'gerdaBust', 'gerdaSkirt'] };
    for (const id in from) from[id].forEach((k, i) => { if (old[k] != null) (o[id] = o[id] || {})[['scale', 'bust', 'skirtLen'][i]] = old[k]; });
    return o;
  } catch (e) { return {}; }
}
const getShapes = () => JSON.parse(JSON.stringify(SHAPES));
function resetShapes() { try { root.localStorage && root.localStorage.removeItem(SHAPES_KEY); } catch (e) { /* no storage */ } return setShapes({}, false); }
// Palettes: the look's colours (js/looks.js), and each outfit's clothes.
// The shine on hair: lighter, but on very dark hair a warm lift rather than a grey one.
function hairShine(hex) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255], lum = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  if (lum > 70) return shade(hex, 0.28);
  return '#' + c.map((v, i) => Math.round(v + ([122, 92, 74][i] - v) * 0.45).toString(16).padStart(2, '0')).join('');
}
function palette(id, look) {
  const l = look || {}, P = {}, S = SPECS[id] || {}, sp = S.pal || {};
  P.skin = l.skin || sp.skin || '#f6d3b8'; P.skinSh = shade(P.skin, -0.12);
  P.hair = l.hair || sp.hair || (id === 'red' ? '#b0582a' : id === 'gran' ? '#d6d0c8' : '#7a3a22'); P.hairHi = hairShine(P.hair); P.hairDk = shade(P.hair, -0.32);
  P.eyes = l.eyes || sp.eyes || '#4f8a62'; P.lips = l.lips || sp.lips || (id === 'red' ? '#d49080' : id === 'gran' ? '#b8807a' : '#a8525a');
  P.blush = shade(P.lips, 0.35); P.beard = sp.beard || P.hair;
  if (S.pal) {      // (everyone else: their own colours, from their spec)
    const top = sp.top || '#efe8d8', skirt = sp.skirt || '#6b4a3a', apron = sp.apron || (S.apron === 'leather' ? '#5a3a22' : S.apron === 'white' ? '#fbf8f2' : '#ebe2cc');
    Object.assign(P, { blouse: top, bodice: sp.bodice || shade(top, -0.55), lace: sp.lace || '#e6d7b0', skirt, skirtDk: sp.skirtDk || shade(skirt, -0.2), hem: sp.hem || sp.skirtDk || shade(skirt, -0.2),
      apron: S.apron ? apron : null, apronDk: sp.apronDk || shade(apron, -0.12), boots: sp.boots || '#4a2f1c', bootsDk: sp.bootsDk || '#33200f', drawers: '#f4eee2', drawersDk: '#ddd3c0',
      trousers: sp.trousers || '#5a4a3a', vest: sp.vest || '#4a3a2a', hat: sp.hat || '#f4f0e8', slippers: sp.slippers || '#6a2a3a', belt: '#3a2618',
      cloak: sp.cloak || '#7d6a8c', cloakDk: shade(sp.cloak || '#7d6a8c', -0.3), lining: '#e2d8c8' });
  } else if (id === 'red') {
    const cloak = l.cloak || '#a01828';
    Object.assign(P, { cloak, cloakDk: shade(cloak, -0.35), lining: '#e9d9b8', blouse: '#f6eedf', bodice: '#3b2b30', lace: '#efe2c0', skirt: cloak, skirtDk: shade(cloak, -0.3),      // (her skirt the red of her cloak)
     
      hem: '#f6eedf', boots: '#7a4a2a', bootsDk: '#58331c', drawers: '#f8f3e8', drawersDk: '#e2d8c4' });
  } else if (id === 'gran') {
    const shawl = '#7d6a8c';
    Object.assign(P, { cloak: shawl, cloakDk: shade(shawl, -0.3), lining: '#e2d8c8', lace: '#c9b8d4', blouse: '#efe6d4', bodice: '#4e3e56', skirt: '#5a6444', skirtDk: '#454e34', hem: '#454e34',
      apron: '#e9dfc8', apronDk: '#d2c6aa', boots: '#3e2a1a', bootsDk: '#2a1a0e', drawers: '#f4eee2', drawersDk: '#ddd3c0' });
  } else if (l.outfit === 'Fine') {
    Object.assign(P, { blouse: '#b8a6dc', bodice: '#8f7ab8', lace: '#e8c75a', skirt: '#9a86c0', skirtDk: '#7a66a4', hem: '#e8c75a', apron: null, gold: '#e8c75a', boots: '#4a2f1c', bootsDk: '#e8c75a', drawers: '#f4eee2', drawersDk: '#ddd3c0' });
  } else {
    Object.assign(P, { blouse: '#efe8d8', bodice: '#7a2a3a', lace: '#e6d7b0', skirt: '#6b4a3a', skirtDk: '#54382a', hem: '#54382a', apron: '#ebe2cc', apronDk: '#d4c8ae', boots: '#4a2f1c', bootsDk: '#33200f', drawers: '#f4eee2', drawersDk: '#ddd3c0' });
  }
  return P;
}

// The shared tuning made this character's: their build and face on top of it.
function tuneFor(S) {
  const k = Object.assign({}, K), by = (key, f) => { if (f != null) k[key] = K[key] * f; };
  by('hipWidth', S.hips); by('chestWidth', S.chest); by('armGirth', S.arms); by('legGirth', S.legs); by('neckGirth', S.neck); by('jaw', S.jaw); by('noseSize', S.nose);
  by('cheekX', S.seatX); by('cheekZ', S.seatZ); by('cheekW', S.seatW); by('cheekH', S.seatH); by('cheekD', S.seatD);
  if (S.seatY) k.cheekY = K.cheekY + S.seatY;      // (the seat's height is moved, not scaled: up or down from the baseline's)
  k.seatBack = (k.cheekD - k.cheekZ) / (K.cheekD - K.cheekZ);      // (how far the seat stands out behind, against the baseline's: the drawers and trousers over it follow)
  if (S.eyes) { k.eyeW *= S.eyes; k.eyeH *= S.eyes; }
  if (S.sex === 'm') { k.eyeH *= 0.88; k.eyeW *= 0.96; k.iris *= 0.94; k.mouthSize *= 0.92; k.handSize *= 1.08; k.footSize *= 1.08; k.earSize *= 1.05; k.fringe *= 0.78; }
  return k;
}

function make(id, look, opts) {
  opts = opts || {};
  const S = SPECS[id]; if (!S) throw new Error('Toon: unknown character ' + id);
  const K = tuneFor(S), MAN = S.sex === 'm';
  look = look || {}; const P = palette(id, look), D = DIM;
  const rig = { id, spec: S, look, P, scaleW: S.scale, solids: [] };
  rig.clipId = liveId++; rig.clipSrc = [[], [], [], []]; rig.clipRT = [0, 1, 2, 3].map(() => new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }));
  rig.clipU = { uClip0: { value: WHITE }, uClip1: { value: WHITE }, uClip2: { value: WHITE }, uClip3: { value: WHITE }, uClipRes: { value: new THREE.Vector2(1, 1) } };
  LIVE.add(rig);
  const clipSrc = (kind, m) => { if (m) rig.clipSrc[CLIP_KINDS[kind]].push(m); return m; };
  const root_ = new THREE.Group(); root_.scale.setScalar(S.scale); rig.root = root_;
  const bones = [];
  const bone = (name, parent, x, y, z, order) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (order) b.rotation.order = order; parent.add(b); bones.push(b); rig[name] = b; return b; };
  bone('hips', root_, 0, D.hipY, 0); bone('torso', rig.hips, 0, D.torsoY, 0, 'YXZ'); bone('neck', rig.torso, 0, D.neckY, 0, 'YXZ'); bone('head', rig.neck, 0, D.headY, 0, 'YXZ');
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    bone('arm' + s, rig.torso, sx * D.shX * (S.shoulders || 1), D.shY, 0, 'ZXY'); bone('elbow' + s, rig['arm' + s], 0, -D.ua, 0); bone('hand' + s, rig['elbow' + s], 0, -D.fa, 0);
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
  const tints = [], covers = [];
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
    if (o.cover) {      // (cloth that's covered by another layer: coloured per point by o.cover(p) → [colour, share], p in the frame's space at rest)
      const toHips = new THREE.Matrix4().copy(rig.hips.matrixWorld).invert().multiply(frame.matrixWorld), at = [], atH = [];
      for (let i = 0; i < n; i++) { at.push(p.fromBufferAttribute(pos, i).clone()); atH.push(at[i].clone().applyMatrix4(toHips)); }
      const col = new Float32Array(n * 3), cov = new Float32Array(n * 4), kind = new Float32Array(n); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('cover', new THREE.BufferAttribute(cov, 4)); geo.setAttribute('coverKind', new THREE.BufferAttribute(kind, 1));
      covers.push({ geo, at, atH, frame, col, cov, kind, base: srgb(hex), fn: o.cover });
      o.material = clipMaterial(rig, { side: o.side || THREE.FrontSide });
    }
    if (o.tint) {      // (skin that the marks can bleed into: its points in the hips' space at rest, and a colour for each)
      const toHips = new THREE.Matrix4().copy(rig.hips.matrixWorld).invert().multiply(frame.matrixWorld), at = [], q = new V3();
      for (let i = 0; i < n; i++) at.push(q.fromBufferAttribute(pos, i).clone().applyMatrix4(toHips));
      const col = new Float32Array(n * 3), base = srgb(hex); for (let i = 0; i < n; i++) { col[i * 3] = base.r; col[i * 3 + 1] = base.g; col[i * 3 + 2] = base.b; }
      // (o.follow: a bone each point rides on by a share, for points that bend between it and the hips)
      const follow = o.follow ? at.map(q => { const w = wfn(q).find(e => e[0] === o.follow); return w ? w[1] : 0; }) : null;
      const cov = new Float32Array(n * 4), kind = new Float32Array(n); geo.setAttribute('cover', new THREE.BufferAttribute(cov, 4)); geo.setAttribute('coverKind', new THREE.BufferAttribute(kind, 1));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); tints.push({ geo, at, col, cov, kind, base, bone: o.follow || (frame === rig.hips ? null : frame), follow });
      o.material = clipMaterial(rig, {});
    }
    // (o.inkAt: how much of the outline to draw at each point, 0..1, by where it is in the frame's space; none where the shape meets another)
    const inkW = (o.ink || 0.07) * K.ink, inkAt = o.inkAt ? Array.from({ length: n }, (_, i) => inkW * o.inkAt(p.fromBufferAttribute(pos, i))) : inkW;
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rootInv, frame.matrixWorld));      // (into the root's space, where the bones' rest frames were taken)
    const m = new THREE.SkinnedMesh(geo, o.material || mat(hex, { skin: true, side: o.side || THREE.FrontSide })); m.frustumCulled = false; m.name = String(hex); root_.add(m); m.updateMatrixWorld(true); m.bind(skel, m.matrixWorld);
    if (o.ink !== 0 && K.ink > 0) {
      // (something that can be covered has an outline that knows it: it shares the cover each point has, as that changes, and isn't drawn where it pushes through)
      const hg = hullGeo(geo, inkAt), covered = !!geo.attributes.cover; if (covered) { hg.setAttribute('cover', geo.attributes.cover); hg.setAttribute('coverKind', geo.attributes.coverKind); }
      const h = new THREE.SkinnedMesh(hg, covered ? clipInk(rig) : INKM[1]); h.frustumCulled = false; root_.add(h); h.updateMatrixWorld(true); h.bind(skel, h.matrixWorld); m.userData.hull = h;
    }
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
  const WW = K.waistWidth * (S.waist || 1);      // (a softer, fuller middle for some)
  const trunkW = y => y <= 0.6 ? K.hipWidth : y <= 2.6 ? lerp(K.hipWidth, WW, ss(0.6, 2.6, y)) : y <= 4.2 ? WW : lerp(WW, K.chestWidth, ss(4.2, 6.0, y));
  const wide = (pr, f) => pr.map(([r, y]) => [r * (typeof f === 'function' ? f(y) : f), y]);
  const TD = K.bodyDepth;

  // ── Torso: hips and seat, the waist, the ribcage and shoulders; the bust. The torso's own space starts DIM.torsoY above the hips. ──
  const top = P.blouse;
  // (lying across a lap, the back of the hips between the cheeks and the waist is drawn in, and the drawers or trousers over it with it: the cheeks
  // roll down with her legs and the hips stay where they are, so left full, the middle of it stands up above them like a tailbone)
  // (the back of a garment drawn in by a share, by height (f(y)), the front untouched)
  const backIn = (g, f) => { const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i); if (z < 0) pp.setZ(i, z * f(pp.getY(i))); } g.computeVertexNormals(); return g; };
  const flatWaist = g => { if (!opts.lying) return g; const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i); if (z < 0) pp.setZ(i, z * lerp(1, K.sacrum, ss(2.3, 1.5, pp.getY(i)))); } g.computeVertexNormals(); return g; };
  skinnedOn(rig.hips, flatWaist(lathe(wide(dense([[0, -2.5], [1.4, -2.35], [2.7, -1.6], [3.2, -0.4], [3.15, 0.6], [2.85, 1.5], [2.6, 2.1], [0, 2.3]], 36), trunkW), 0.72 * TD, 48)), P.skin, torsoW, { tint: true });      // the hips
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
  rig.cheekC = { L: mk(new V3(CHEEK.x, CHEEK.y, CHEEK.z).sub(pivotAt(1)), rig.seatPivot.L), R: mk(new V3(-CHEEK.x, CHEEK.y, CHEEK.z).sub(pivotAt(-1)), rig.seatPivot.R) };      // (each cheek's middle)
  rig.upperBack = mk(new V3(0, 6.2, -1.95 * TD * K.chestWidth), rig.torso);
  // The bust is sculpted into the front of the torso (and the bodice under it), not set on it, so the chest is one smooth form.
  const bust = g => {
    const p = g.attributes.position, q = new V3(), A = K.bustAmt * (S.bust || 0), W = K.bustW;
    for (let i = 0; i < p.count; i++) {
      q.fromBufferAttribute(p, i); if (q.z <= 0) continue;
      const dx = Math.abs(q.x) - K.bustX, dy = q.y - K.bustY, f = Math.exp(-(dx * dx) / (2 * W * W) - (dy * dy) / (2 * (dy < 0 ? 0.65 * W : W) ** 2));
      q.z += A * f * ss(0.2, 1.2, q.z); q.y -= 0.18 * A * f; p.setXYZ(i, q.x, q.y, q.z);
    }
    g.computeVertexNormals(); return g;
  };
  // (a man's trunk runs straighter, with no waist drawn in; a woman's goes in at the waist and out over the bust)
  const TORSO = MAN ? [[0, 0.3], [2.9, 0.4], [2.86, 1.5], [2.74, 2.9], [2.76, 3.8], [2.9, 4.9], [3.06, 6.2], [3.14, 7.4], [3.02, 8.4], [2.36, 9.2], [1.2, 9.7], [0, 9.85]]
    : [[0, 0.3], [2.9, 0.4], [2.75, 1.5], [2.38, 2.9], [2.32, 3.8], [2.55, 4.9], [2.85, 6.2], [3.0, 7.4], [2.92, 8.4], [2.3, 9.2], [1.2, 9.7], [0, 9.85]];
  const BODICE = !MAN && S.lower !== 'gown' && S.bodice !== false, VEST = MAN && S.vest;
  // (where the shirt is under the vest: a waistcoat to the waist, a jerkin and a coat over the hips)
  const vestFrom = S.vest === 'waistcoat' ? 2.2 : -1.2;      // (a waistcoat ends at the belt)
  // (a man's shirt in trousers is tucked in tight at the back below the belt, so it stays inside the waistband as he bends; with the trousers
  // down, the tail hanging over the drawers covers it)
  const tucked = g => MAN && (S.lower || 'trousers') === 'trousers' ? backIn(g, y => lerp(0.72, 1, ss(2.5, 3.6, y))) : g;
  skinnedOn(rig.hips, tucked(bust(lathe(wide(dense(TORSO, 44), trunkW), 0.68 * TD, 32))), top, torsoW, BODICE ? { cover: p => [cc('bodice'), ss(5.75, 5.45, p.y), 'bodice'] } : VEST ? { cover: p => [cc('vest'), ss(8.6, 8.2, p.y) * ss(vestFrom - 0.2, vestFrom + 0.2, p.y), 'bodice'] } : {});   // the waist, ribs, bust and shoulders (the bodice's colour where it's under the bodice)
  // A man's vest: a waistcoat (buttoned, to the waist), a leather jerkin (laced, over the hips), or a long coat (over the hips, its tails to the knee).
  if (VEST) {
    const vp = TORSO.filter(([r, y]) => y >= vestFrom - 0.1 && y <= 8.6).map(([r, y]) => [r + 0.14, y]); vp.unshift([TORSO[1][0] + 0.16, vestFrom]); if (vestFrom < 0) vp.unshift([3.2, vestFrom - 0.05]);
    clipSrc('bodice', skinnedOn(rig.hips, lathe(wide(dense(vp.sort((a, b) => a[1] - b[1]), 26), y => y < 0.6 ? K.hipWidth : trunkW(y)), 0.71 * TD, 32), P.vest, torsoW, { ink: 0.05 }));
    const zAt = y => { let r = vp[0][0]; for (const [rr, yy] of vp) if (yy <= y) r = rr; return r * 0.71 * TD * trunkW(Math.max(0.6, y)) + 0.05; };
    if (S.vest === 'waistcoat') for (let i = 0; i < 5; i++) { const y = 2.75 + i * 1.05; piece(new THREE.SphereGeometry(0.14, 8, 6), '#c8b070', rig.torso, 0, y - D.torsoY, zAt(y), { ink: 0.02 }); }
    else if (S.vest === 'jerkin') for (let i = 0; i < 4; i++) { const y = 2.4 + i * 1.4; for (const sx of [-1, 1]) piece(new THREE.BoxGeometry(0.7, 0.1, 0.08), '#2a1a10', rig.torso, 0, y - D.torsoY, zAt(y), { rot: [0, 0, sx * 0.5], ink: 0 }); }
    else { piece(new THREE.BoxGeometry(0.3, 7.6, 0.12), shade(P.vest, -0.3), rig.torso, 0, 4.2 - D.torsoY, zAt(4.2), { ink: 0 }); }
  }
  // The bodice: laced, from the hips to under the bust.
  if (BODICE) clipSrc('bodice', skinnedOn(rig.hips, bust(lathe(wide(dense([[3.2, 0.95], [3.08, 1.25], [2.86, 1.6], [2.47, 2.9], [2.4, 3.8], [2.64, 4.9], [2.9, 5.8], [2.7, 5.95]], 26), trunkW), 0.74 * TD, 32)), P.bodice, torsoW, { ink: 0.05 }));      // (flaring at the bottom over the hips, which never show through it)
  if (BODICE) clipSrc('bodice', skinnedOn(rig.hips, lathe(wide([[3.12, 0.7], [3.24, 0.96], [3.02, 1.28]], trunkW), 0.75 * TD, 32), shade(P.bodice, -0.25), torsoW, { ink: 0.035 }));      // its bound hem, a neat edge over the join with whatever is below
  // The lacing down its front, crossed, set on the bodice's surface (its radius at each height, as built).
  if (BODICE) { const BOD = wide(dense([[3.2, 0.95], [3.08, 1.25], [2.86, 1.6], [2.47, 2.9], [2.4, 3.8], [2.64, 4.9], [2.9, 5.8], [2.7, 5.95]], 26), trunkW), rAt = y => { for (let i = 1; i < BOD.length; i++) if (BOD[i][1] >= y) return lerp(BOD[i - 1][0], BOD[i][0], (y - BOD[i - 1][1]) / (BOD[i][1] - BOD[i - 1][1] || 1)); return BOD[BOD.length - 1][0]; };
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
    // One arm from the shoulder to the wrist: the sleeve (to the elbow, rolled above it, or to the wrist), its cuff, the bare forearm, all bending together.
    const SL = S.vest === 'coat' || S.top === 'jumper' ? 'long' : S.sleeves || 'elbow', sleeveC = S.vest === 'coat' ? P.vest : top;
    if (SL === 'long') {
      skinnedOn(arm, lathe(wide([[0, 0.75], [0.8, 0.45], [0.88, -0.3], [0.82, -2.6], [0.74, E + 0.3], [0.7, E - 0.4], [0.66, lerp(E, Wr, 0.6)], [0.6, Wr + 0.5]], AG), 1, 18), sleeveC, armW(s));
      skinnedOn(arm, lathe(wide([[0.6, Wr + 0.75], [0.7, Wr + 0.45], [0.6, Wr + 0.15]], AG), 1, 18), shade(sleeveC, -0.12), armW(s), { ink: 0.04 });
      skinnedOn(arm, lathe(wide([[0.46, Wr + 0.5], [0.42, Wr + 0.1], [0.36, Wr - 0.3], [0, Wr - 0.55]], AG), 1, 18), P.skin, armW(s));
    } else {
      const cE = SL === 'rolled' ? E + 0.9 : E;      // (rolled up above the elbow, in a thick roll)
      skinnedOn(arm, lathe(wide([[0, 0.75], [0.8, 0.45], [0.88, -0.3], [0.8, -2.6], [0.7, cE + 0.6], [0.66, cE - 0.25]], AG), 1, 18), top, armW(s));
      skinnedOn(arm, lathe(wide(SL === 'rolled' ? [[0.7, cE + 0.6], [0.9, cE + 0.15], [0.92, cE - 0.3], [0.72, cE - 0.6]] : [[0.7, cE + 0.55], [0.8, cE + 0.05], [0.68, cE - 0.45]], AG), 1, 18), shade(top, -0.06), armW(s), { ink: 0.04 });
      skinnedOn(arm, lathe(wide([[0.6, cE + 0.3], [0.64, E - 0.2], [0.62, E - 0.5], [0.6, E - 1.4], [0.5, lerp(E, Wr, 0.72)], [0.42, Wr + 0.1], [0.36, Wr - 0.3], [0, Wr - 0.55]], AG), 1, 18), P.skin, armW(s));
    }
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
    skinnedOn(thigh, lathe(wide(dense([[0, 1.0], [1.25, 0.7], [1.72, -0.4], [1.66, -Lk * 0.34], [1.45, -Lk * 0.68], [1.15, -Lk + 0.6], [1.08, -Lk - 0.2], [1.13, sh(0.17)], [1.15, sh(0.37)], [0.9, sh(0.66)], [0.62, -La + 0.8], [0.54, -La + 0.1], [0.5, -La - 0.2], [0, -La - 0.5]], 60), LG), 1, 28), P.skin, legW(s), { tint: true, inkAt: q => 1 - ss(0.1, 0.8, -q.x * sx / (1.6 * LG)) * ss(-Lk * 0.8, -Lk * 0.45, q.y) });
    if (S.feet === 'boots') {
      clipSrc('boots', skinnedOn(thigh, lathe(wide([[0.84, sh(0.51)], [1.0, sh(0.56)], [0.8, sh(0.8)], [0.72, -La - 0.2], [0, -La - 0.4]], LG), 1, 18), P.boots, legW(s)));
      clipSrc('boots', skinnedOn(thigh, lathe(wide([[0.88, sh(0.507)], [1.04, sh(0.536)], [1.0, sh(0.586)]], LG), 1, 18), P.bootsDk, legW(s), { ink: 0.04 }));
      clipSrc('boots', piece(flatFoot(ell(0.78 * FS, 0.62, 1.55 * FS), 0.5), P.boots, ankle, 0, -0.22, 0.62 * FS));
      clipSrc('boots', piece(flatFoot(ell(0.82 * FS, 0.2, 1.62 * FS), 0.12), P.bootsDk, ankle, 0, -0.62, 0.62 * FS, { ink: 0.04 }));      // (the sole)
    } else if (S.feet === 'slippers') {      // (carpet slippers: a felt sole, and a soft upper over the foot)
      piece(flatFoot(ell(0.74 * FS, 0.56, 1.5 * FS), 0.45), P.slippers, ankle, 0, -0.3, 0.62 * FS);
      piece(flatFoot(ell(0.8 * FS, 0.16, 1.58 * FS), 0.1), '#3a2a24', ankle, 0, -0.66, 0.62 * FS, { ink: 0.03 });
    } else {
      piece(flatFoot(ell(0.62 * FS, 0.5, 1.45 * FS), 0.4), P.skin, ankle, 0, -0.35, 0.62 * FS);
      if (P.gold) piece(new THREE.TorusGeometry(0.62 * LG, 0.08, 6, 16).rotateX(Math.PI / 2), P.gold, knee, 0, -D.shin + 0.6, 0, { ink: 0 });
    }
  }

  // ── The skirt (skinned to the legs), a band at its hem, Gerda's apron; her drawers, the skirt gathered up, the drawers down at her knees. ──
  // What's worn below: a skirt, a gown to the floor, or trousers (with a smock over them, for some).
  const LOWER = S.lower || (MAN ? 'trousers' : 'skirt'), TROUSERS = LOWER === 'trousers', SKIRTED = !TROUSERS || !!S.smock;
  const L_ = S.smock ? 5 : S.skirtLen || 12;
  if (S.smock) { P.skirt = top; P.skirtDk = shade(top, -0.12); P.hem = shade(top, -0.12); }
  const SW = y => (y > 0.6 ? trunkW(y) : K.hipWidth) * (y < 0 ? lerp(1, K.skirtFull, ss(0, -4, y)) : 1);       // (it widens with the hips, and flares with its fullness)
  const skirtProfile = wide([[2.66, 2.1], [3.45, 0.6], [4.05, -0.8], [4.4, -3], [4.9, -6.5], [5.3, -L_ + 0.7], [5.4, -L_]], SW);
  const skirtR = y => { const pr = skirtProfile; for (let i = 1; i < pr.length; i++) if (y >= pr[i][1]) { const [r0, y0] = pr[i - 1], [r1, y1] = pr[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return pr[pr.length - 1][0]; };
  let skirt = null, hemBand = null, apron = null;
  const waist = SKIRTED ? clipSrc('skirt', piece(lathe(wide([[2.72, 1.55], [2.78, 2.15], [2.66, 2.5]], trunkW), 0.75 * TD, 22), P.skirtDk, rig.hips, 0, 0, 0, { ink: 0.04 })) : new THREE.Group();
  // (standing figures have one too, for sitting down in the cottage: shown in place of the skinned skirt once they're seated, see rig.setSeated)
  // (the part under her seat isn't tilted with the lap: tilted, its front rises through the bodice, or the apron)
  const drapeG = new THREE.Group(), seatG = new THREE.Group(); rig.hips.add(drapeG, seatG); drapeG.visible = seatG.visible = !!opts.seated; let drapeShape = null;
  if (SKIRTED) seatedDrape(opts.seated ? rig.hips : drapeG, opts.seated ? null : L_ + 1.5, opts.seated ? rig.hips : seatG);
  // (over trousers, an apron or a long coat's tails sit the same way: the apron laid along the lap and over the knees, the coat open over it)
  const TAP = TROUSERS && (!!S.apron || S.vest === 'coat');
  if (TAP) seatedDrape(opts.seated ? rig.hips : drapeG, opts.seated ? null : 99, null, S.apron ? 'apron' : 'coat');
  if (!opts.seated && SKIRTED) {
    // (lying, its front, the side toward the lap she lies on, is drawn in close over her legs rather than standing out as a bell)
    // (drawn in, but never closer than a cloth's thickness outside the front of her thighs)
    const thighFront = (x, y) => { const rt = lerp(1.75, 1.2, clamp(-y / D.thigh, 0, 1)) * K.legGirth + 0.55; let z = 0; for (const c of [D.hipX, -D.hipX]) z = Math.max(z, Math.sqrt(Math.max(0, rt * rt - (x - c) ** 2))); return z; };
    const hug = g => { if (opts.lying) { const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i), y = pp.getY(i); if (z > 0) pp.setZ(i, Math.max(z * lerp(1, 0.55, ss(0.6, -2.5, y)), y < 0.6 ? thighFront(pp.getX(i), y) : 0)); } g.computeVertexNormals(); } return g; };
    // (where it pushes through the apron, the skirt is the apron's colour: every point of it below the bodice may, since the colour only shows
    // where it's in front of the apron, wherever the apron is)
    skirt = clipSrc('skirt', skinned(hug(lathe(skirtProfile, 0.9, 28)), P.skirt, P.apron ? { cover: p => [cc('apron'), ss(1.05, 0.88, Math.abs(Math.atan2(p.x, p.z))) * ss(1.2, 0.8, p.y), 'apron'] } : {}));
    hemBand = clipSrc('skirt', skinned(hug(lathe([[skirtR(-L_ + 0.85) + 0.07, -L_ + 0.85], [skirtR(-L_) + 0.07, -L_ + 0.1], [skirtR(-L_) + 0.05, -L_ - 0.05]], 0.9, 28)), P.hem, { ink: 0.04 }));
    if (P.apron && !TROUSERS) {
      const ap = []; for (const [r, y] of [[2.8, 1.9], [3.5, 0.4], [4.0, -1.5], [4.5, -4.5], [4.95, -8.0], [5.1, -9.5]]) ap.push([r, y]);
      apron = clipSrc('apron', skinned(lathe(ap.map(([r, y]) => [Math.max(r, skirtR(y) + 0.12), y]), 0.92, 12, -0.95, 1.9), P.apron, { ink: 0.05 }));
    }
  }
  // Seated (Gerda in the lap scene) the skirt is its own drape, in the hips' space with the thighs level along +z: a tube over the lap, turned
  // round the knees, then hanging to the hem, with the apron laid along the top of it. (Skinning a skirt through a right-angled knee folds it.)
  // (len: how far the drape runs from the back of the seat, when it's shorter than the lap and over the knees to the floor)
  function seatedDrape(parent, len, under, only) {
    const Tk = D.thigh, full = Tk + 1.5 + 2.2 * Math.PI / 2 + D.shin + 0.2, L = len == null ? full : Math.min(len, full);
    const lapL = Math.min(Tk + 1.5, L), arcL = Math.min(2.2 * Math.PI / 2, L - lapL), drop = Math.max(0.001, L - lapL - arcL), total = lapL + arcL + drop;
    if (!only) drapeShape = { Tk, lapL, arcL, drop };
    // What the drape is, for anything that must not pass through it (js/lap.js keeps arms out): over the lap, an elliptic tube along the thighs;
    // below the knees, one standing to the floor. In the hips' space; returns how far a ball of radius r at q is inside.
    if (len == null) rig.solids.push((q, r) => {
      const w = 4.0 * K.hipWidth + r, h = 2.3 * K.legGirth + r; let pen = 0;
      if (q.z > -1.5 - r && q.z < Tk + 0.4) { const d = Math.hypot(q.x / w, (q.y + 0.1) / h); if (d < 1) pen = Math.max(pen, (1 - d) * Math.min(w, h)); }
      if (q.y < -0.1 && q.y > -0.1 - drop - r) { const t = clamp((-0.1 - q.y) / drop, 0, 1), wx = lerp(4.0, 4.9 * K.skirtFull, t) * K.hipWidth + r, wz = lerp(2.3, 2.5 * K.skirtFull, t) + r, d = Math.hypot(q.x / wx, (q.z - Tk - 0.4 * t) / wz); if (d < 1) pen = Math.max(pen, (1 - d) * Math.min(wx, wz)); }
      return pen;
    });
    const at = v => {                                  // the drape's spine: centre, the way 'up' from it, the half-width and the half-depth
      const d = Math.min(v * total, L - 1e-6 * (L - lapL - arcL < 0.01 ? 1 : 0));      // (a short drape ends on the lap, or round the knees)
      if (d < lapL) return { c: new V3(0, -0.1, -1.5 + d), n: new V3(0, 1, 0), w: lerp(3.7, 4.0, d / lapL) * K.hipWidth, h: 2.3 * K.legGirth };
      if (d < lapL + arcL || drop < 0.01) { const a = arcL > 0 ? clamp((d - lapL) / arcL, 0, 1) * Math.PI / 2 : 0; return { c: new V3(0, -0.1, Tk), n: new V3(0, Math.cos(a), Math.sin(a)), w: 4.0 * K.hipWidth, h: 2.3 * K.legGirth }; }
      const t = (d - lapL - arcL) / drop; return { c: new V3(0, -0.1 - t * drop, Tk + 0.4 * t), n: new V3(0, 0, 1), w: lerp(4.0, 4.9 * K.skirtFull, t) * K.hipWidth, h: lerp(2.3, 2.5 * K.skirtFull, t) };
    };
    const tube = (a0, a1, v0, v1, lift) => (u, v) => { const f = at(lerp(v0, v1, v)), a = lerp(a0, a1, u); return f.c.clone().addScaledVector(new V3(1, 0, 0), Math.sin(a) * (f.w + lift)).addScaledVector(f.n, Math.cos(a) * (f.h + lift)); };
    const outward = p => new V3(p.x, p.z < Tk ? p.y + 0.1 : Math.max(0, p.y + 0.1), p.z < Tk ? 0 : p.z - Tk);      // (away from the spine)
    if (only === 'apron') { clipSrc('apron', piece(surface(tube(-0.95, 0.95, 0.04, S.apron === 'leather' ? 0.74 : 0.8, -0.35), 12, 22, outward), P.apron, parent, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.05 })); return; }
    if (only === 'coat') { clipSrc('apron', piece(surface(tube(0.75, Math.PI * 2 - 0.75, 0, 0.66, -0.25), 22, 22, outward), P.vest, parent, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.05 })); return; }
    clipSrc('skirt', piece(surface(tube(-Math.PI, Math.PI, 0, 1, 0), 28, 30, outward), P.skirt, parent, 0, 0, 0, { side: THREE.DoubleSide }));
    clipSrc('skirt', piece(lathe(wide([[2.66, 2.1], [3.45, 0.6], [3.9, -0.4], [3.6, -1.6], [3.1, -2.35], [0, -2.6]], SW), 0.9 * TD, 24), P.skirt, under));      // (closed under her seat)
    clipSrc('skirt', piece(surface(tube(-Math.PI, Math.PI, 0.965, 1, 0.06), 28, 2, outward), P.hem, parent, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.04 }));
    if (P.apron && !TROUSERS) clipSrc('apron', piece(surface(tube(-0.95, 0.95, 0.06, 0.78, 0.12), 12, 22, outward), P.apron, parent, 0, 0, 0, { side: THREE.DoubleSide, ink: 0.05 }));
  }
  // (under the skirt; and in front, where an apron hangs over the skirt, under that, the outermost: what pushes through there pushes through both)
  const skirtOver = p => P.apron && p.z > 0 && p.y > -9.2 && Math.abs(Math.atan2(p.x, p.z)) < 0.78 ? [cc('apron'), 1, 'apron'] : [cc('skirt'), 1, 'skirt'];
  const drawers = [], drawersDown = [], underSkirt = (rest, now) => dress.skirt !== 'down' ? null : TROUSERS ? [cc('trousers'), 1, 'skirt'] : inSkirt(rest, now) ? skirtOver(rest) : null;      // (the drawers: the skirt's colour while it's down over them)
  if (!opts.seated) {      // (both wear them: hers show across the lap, Gerda's only in the editor with her skirt lifted or off; seated, they're under the drape)
    // (closed underneath, following the hips' own shape a little outside it, so nothing hangs down between the legs)
    // (up over the whole seat to the waist, tucked under the bodice: fuller at the back only low down, under the cheeks; above them it follows the
    // small of her back, so it never stands proud of the cheeks as they roll round with her legs)
    { const g = lathe(wide(dense([[0, -2.64], [1.5, -2.48], [2.82, -1.7], [3.32, -0.4], [3.26, 0.4], [3.08, 0.85], [2.95, 1.05]], 24), trunkW), 0.75 * TD, 32), pp = g.attributes.position;
      for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i), y = pp.getY(i); if (z < 0) pp.setZ(i, z * lerp(1.1, 1, ss(-1.3, -0.4, y)) * lerp(1, K.seatBack, ss(1.2, 0.2, y))); }
      flatWaist(g); g.computeVertexNormals(); drawers.push(clipSrc('drawers', skinnedOn(rig.hips, g, P.drawers, torsoW, { cover: underSkirt }))); }
    for (const [s, sx] of [['L', 1], ['R', -1]]) {
      { const g = blendIntoHips(ell(CHEEK.rx * 1.05, CHEEK.ry * 1.05, CHEEK.rz * 1.08), sx, CHEEK.x, CHEEK.y, CHEEK.z); g.translate(sx * CHEEK.x, CHEEK.y, CHEEK.z); drawers.push(clipSrc('drawers', skinnedOn(rig.hips, g, P.drawers, seatW(rig.seatPivot[s]), { ink: 0.07, cover: underSkirt }))); }
      drawers.push(clipSrc('drawers', skinnedOn(rig['thigh' + s], lathe(wide([[1.9, 0.2], [1.95, -1.6], [1.8, -2.9], [1.88, -3.1]], K.legGirth), 1, 18), P.drawers, legW(s), { cover: underSkirt })));
      drawers.push(clipSrc('drawers', skinnedOn(rig['thigh' + s], lathe(wide([[1.86, -3.05], [1.96, -3.2], [1.84, -3.35]], K.legGirth), 1, 18), P.drawersDk, legW(s), { ink: 0.03, cover: underSkirt })));
      drawersDown.push(clipSrc('drawers', piece(new THREE.TorusGeometry(1.42 * K.legGirth, 0.42, 8, 20).rotateX(Math.PI / 2), P.drawers, rig['thigh' + s], 0, -D.thigh * 0.74, 0, { ink: 0 })));
    }
    // Down, they're one garment pushed down round both legs: a rolled cuff on each thigh and the cloth between them, sagging between her legs at the
    // front and back, carried by both thighs.
    { const yb = -D.thigh * 0.74, ax = (D.hipX + 1.42 * K.legGirth), g = new THREE.TorusGeometry(1, 0.34, 8, 40).rotateX(Math.PI / 2), pp = g.attributes.position;
      for (let i = 0; i < pp.count; i++) { const x = pp.getX(i) * ax, z = pp.getZ(i) * 1.5 * K.legGirth; pp.setXYZ(i, x, yb + pp.getY(i) - 0.7 * (1 - ss(0, 1.8, Math.abs(x))), z); }
      g.computeVertexNormals();
      const m = skinnedOn(rig.hips, g, P.drawers, p => { const l = ss(-1.2, 1.2, p.x); return [[rig.thighL, l], [rig.thighR, 1 - l]]; }, { ink: 0.05, inkAt: q => ss(0.45, 0.75, Math.abs(q.x) / ax) });      // (outlined round the outside only, not between her legs)
      drawersDown.push(clipSrc('drawers', m));
      // and the cloth across the middle, between her legs, sagging (the legs pass through it, hiding the part inside them)
      const gg = surface((u, v) => { const a = u * Math.PI * 2, x = Math.cos(a) * ax * v, z = Math.sin(a) * 1.5 * K.legGirth * v; return new V3(x, yb - 0.7 * (1 - ss(0, 1.8, Math.abs(x))) - 0.35 * (1 - v * v), z); }, 40, 8, p => new V3(0, -1, 0));
      drawersDown.push(clipSrc('drawers', skinnedOn(rig.hips, gg, P.drawers, p => { const l = ss(-1.2, 1.2, p.x); return [[rig.thighL, l], [rig.thighR, 1 - l]]; }, { side: THREE.DoubleSide, ink: 0 }))); }
  }
  // ── Trousers: over the seat and down each leg, tucked into the boots, a belt at the waist. Across a lap they come down to the knees (the
  // skirt 'up'), a bundle round them, as a skirt is lifted; 'off', gone. The smallclothes under them are the drawers above.
  const trousers = [], trousersDown = [], tails = [], shirtTail = [];      // (tails: the standing apron over trousers, or a coat's tails; seated, the drape's)
  if (TROUSERS) {
    const Lk = D.thigh, La = D.thigh + D.shin, LG = K.legGirth, sh = f => -Lk - f * D.shin, bootTop_ = -(D.thigh + 0.507 * D.shin);
    const inBoots = p => S.feet === 'boots' ? [cc('boots'), ss(bootTop_ + 0.1, bootTop_ - 0.3, p.y), 'boots'] : null;
    { const g = lathe(wide(dense([[0, -2.75], [1.6, -2.6], [2.98, -1.8], [3.46, -0.4], [3.4, 0.4], [3.24, 1.2], [3.1, 2.4], [3.02, 2.62]], 24), trunkW), 0.77 * TD, 32), pp = g.attributes.position;
      // (and at the top, the waistband drawn in to meet the shirt above it, rather than standing off the small of the back in a step)
      for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i), y = pp.getY(i); if (z < 0) pp.setZ(i, z * lerp(1.14, 1, ss(-1.3, -0.4, y)) * lerp(1, K.seatBack, ss(1.2, 0.2, y)) * lerp(1, 0.9, ss(1.2, 2.6, y))); }
      flatWaist(g); g.computeVertexNormals(); trousers.push(clipSrc('skirt', skinnedOn(rig.hips, g, P.trousers, torsoW, { ink: 0.05 }))); }
    for (const [s_, sx] of [['L', 1], ['R', -1]]) {
      trousers.push(clipSrc('skirt', skinnedOn(rig['thigh' + s_], lathe(wide(dense([[2.0, 0.5], [2.04, -1.4], [1.9, -Lk * 0.68], [1.56, -Lk + 0.6], [1.46, -Lk - 0.2], [1.42, sh(0.25)], [1.3, sh(0.55)], [1.14, -La + 0.6], [1.08, -La + 0.1]], 30), LG), 1, 22), P.trousers, legW(s_), { cover: inBoots, ink: 0.05 })));
      // (down: heavier and looser than drawers, they don't cling to the legs but fall to the ankles and pool there, crumpled, round each boot)
      const kn = rig['knee' + s_], yA = -D.shin * 0.72;
      for (const [R, tube, dy, tilt] of [[1.32, 0.44, 0, 0.12], [1.22, 0.38, 0.5, -0.16], [1.12, 0.3, 0.92, 0.1]])
        trousersDown.push(clipSrc('skirt', piece(new THREE.TorusGeometry(R * LG, tube, 8, 22).rotateX(Math.PI / 2), P.trousers, kn, 0, yA + dy, 0, { rot: [tilt, 0, sx * tilt], ink: 0.045 })));
    }
    // (their seat: heavier cloth than drawers, it doesn't follow each cheek but lies across both as one flatter curve, bridging the cleft; each
    // side of it goes with its own cheek as the legs swing, the top with the hips)
    { const RX = CHEEK.x + CHEEK.rx * 1.06, g = ell(RX, CHEEK.ry * 1.06, CHEEK.rz * 1.12, 40, 24); g.translate(0, CHEEK.y, CHEEK.z);
      { const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i) - CHEEK.z; if (z > 0) pp.setZ(i, CHEEK.z + z * 0.6); } g.computeVertexNormals(); }      // (its front tucked into the hips)
      const seatBoth = p => { const w = 1 - ss(CHEEK.y - 0.1, CHEEK.y + 1.5, p.y), l = ss(-0.8, 0.8, p.x); return [[rig.hips, 1 - w], [rig.seatPivot.L, w * l], [rig.seatPivot.R, w * (1 - l)]]; };
      trousers.push(clipSrc('skirt', skinnedOn(rig.hips, g, P.trousers, seatBoth, { ink: 0.05 }))); }
    // (and the waist and seat of them, a loop of cloth round both ankles: joined all the way round each leg's pool, outside and in, front and
    // back, and between the legs sagging only a little; each side goes with its own shin, the cloth between stretching as the legs part)
    { const H = D.hipX, yb = -(D.thigh + D.shin * 0.72) + 0.25, Rb = 1.32 * K.legGirth + 0.3;
      // A point round the loop (u, 0..1): the front run between the legs, round the outside of the left leg, the back run, round the right.
      const loop = u => { const t = (u % 1) * 4, k = Math.floor(t), f = t - k;
        if (k === 0) return { x: lerp(-H, H, f), z: 1, mid: Math.sin(Math.PI * f) };
        if (k === 1) { const a = Math.PI / 2 - f * Math.PI; return { x: H + Math.cos(a), z: Math.sin(a), mid: 0, ox: Math.cos(a) }; }
        if (k === 2) return { x: lerp(H, -H, f), z: -1, mid: Math.sin(Math.PI * f) };
        const a = -Math.PI / 2 - f * Math.PI; return { x: -H + Math.cos(a), z: Math.sin(a), mid: 0, ox: Math.cos(a) }; };
      const gg = surface((u, v) => { const L_ = loop(u), r = lerp(Rb + 0.55, Rb, v) + 0.1 * Math.sin(u * Math.PI * 2 * 11) * (1 - v);      // (looser at the rim, crumpled)
        const x = L_.ox != null ? Math.sign(L_.x) * H + L_.ox * r : L_.x * (1 + 0.12 * (1 - v)), z = L_.z * (L_.ox != null ? r : r * 0.92);
        return new V3(x, yb + lerp(1.05, 0, v) - 0.35 * L_.mid * (1 - 0.5 * v), z); }, 88, 5, p => new V3(p.x - Math.sign(p.x) * Math.min(Math.abs(p.x), H), 0, p.z));
      const between = p => { const l = ss(-H * 0.9, H * 0.9, p.x); return [[rig.kneeL, l], [rig.kneeR, 1 - l]]; };
      trousersDown.push(clipSrc('skirt', skinnedOn(rig.hips, gg, P.trousers, between, { side: THREE.DoubleSide, ink: 0.04 })));
      // (and the seat's cloth across between them, so there's no gap to see through from above: from the front run to the back, out to each
      // pool's edge and a little into it, sagging a little in the middle)
      const fl = surface((u, v) => { const z = lerp(Rb * 0.95, -Rb * 0.95, v), hw = Math.max(0.05, H - Math.sqrt(Math.max(0, Rb * Rb - z * z))) + 0.35, x = lerp(-hw, hw, u);
        return new V3(x, yb + 0.42 - 0.22 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v), z); }, 16, 12, () => new V3(0, 1, 0));
      trousersDown.push(clipSrc('skirt', skinnedOn(rig.hips, fl, shade(P.trousers, -0.08), between, { side: THREE.DoubleSide, ink: 0 }))); }
    // (the tail of the shirt, tucked in: it shows only with the trousers down or off, hanging over the top of the drawers)
    // (shorter at the back, where it ends above the seat rather than letting the tops of the cheeks through it)
    // (its top drawn in to lie on the shirt above it, never standing off it)
    // (just outside the drawers, and drawn in at the back with them: over a lap, with the seat under it drawn in, it lies on it)
    { const g = lathe(wide(dense([[3.38, -0.1], [3.34, 0.4], [3.16, 0.85], [3.02, 1.3], [2.9, 2.3]], 14), trunkW), TD, 32), pp = g.attributes.position, top0 = CHEEK.y + CHEEK.ry + 0.25;
      for (let i = 0; i < pp.count; i++) { const y = pp.getY(i), z = pp.getZ(i); pp.setZ(i, z * lerp(0.77, 0.7, ss(0.8, 2.3, y)) * (z < 0 ? lerp(1, K.seatBack, ss(1.2, 0.2, y)) : 1)); }
      flatWaist(g);
      for (let i = 0; i < pp.count; i++) { const y = pp.getY(i), z = pp.getZ(i), back = ss(0.55, -0.15, z / (3.4 * 0.77 * TD)); if (y < top0) pp.setY(i, lerp(y, top0 + (y + 0.1) * 0.3, back)); }
      g.computeVertexNormals(); shirtTail.push(skinnedOn(rig.hips, g, top, torsoW, { side: THREE.DoubleSide, ink: 0.04 })); }
    // The belt, and its buckle.
    trousers.push(piece(flatWaist(backIn(lathe(wide([[3.08, 2.0], [3.14, 2.3], [3.06, 2.62]], trunkW), 0.79 * TD, 28), y => lerp(1, 0.9, ss(1.2, 2.6, y)))), P.belt, rig.hips, 0, 0, 0, { ink: 0.03 }));      // (drawn in with the trousers over a lap)
    trousers.push(piece(new THREE.BoxGeometry(0.9, 0.62, 0.18), '#b8a060', rig.hips, 0, 2.3, 3.08 * trunkW(2.3) * 0.79 * TD + 0.08, { ink: 0.02 }));
    // An apron over them: the smith's leather one or the baker's white, a bib over the chest on a strap round the neck, down past the knees.
    if (S.apron) {
      const ap = [[3.3, 2.6], [3.55, 0.4], [3.7, -2.4], [3.6, -6.4], [3.4, -9.4]], ink = S.apron === 'leather' ? 0.05 : 0.04;
      if (!opts.seated) tails.push(clipSrc('apron', skinned(lathe(ap.map(([r, y]) => [r * K.hipWidth, y]), 0.92, 14, -1.0, 2.0), P.apron, { ink })));
      const zc = y => 3.1 * trunkW(y) * 0.68 * TD + 0.22;
      piece(new THREE.BoxGeometry(4.0 * trunkW(5), 4.4, 0.2), P.apron, rig.torso, 0, 4.8 - D.torsoY, zc(5.6), { ink, rot: [-0.06, 0, 0] });
      for (const sx of [-1, 1]) piece(new THREE.BoxGeometry(0.34, 2.6, 0.12), P.apronDk, rig.torso, sx * 1.6, 8.0 - D.torsoY, zc(8.0) - 0.4, { rot: [-0.5, 0, sx * 0.35], ink: 0 });
    }
  }
  // A long coat's tails: open down the front, to the knee, over the trousers.
  if (S.vest === 'coat' && !opts.seated) tails.push(clipSrc('apron', skinned(lathe([[3.3, 1.0], [3.62, 0.0], [3.9, -2.4], [4.2, -6.0], [4.35, -8.6]].map(([r, y]) => [r * K.hipWidth, y]), 0.9, 24, 0.55, Math.PI * 2 - 1.1), P.vest, { ink: 0.05 })));
  // The skirt lifted: gathered in a roll across the small of her back.
  const roll = new THREE.Group(); rig.hips.add(roll); roll.visible = false;
  // (an oval ring hugging the back and sides of her waist, the hem's band showing along its lower edge, and the cloth bunched at each hip)
  clipSrc('skirt', piece(new THREE.TorusGeometry(2.75, 0.68, 10, 24, Math.PI * 1.1).rotateX(Math.PI / 2).rotateY(Math.PI * 0.95).scale(trunkW(2.1), 1, 0.66 * TD * trunkW(2.1)), P.skirt, roll, 0, 2.1, 0));
  clipSrc('skirt', piece(new THREE.TorusGeometry(2.75, 0.24, 6, 24, Math.PI * 1.05).rotateX(Math.PI / 2).rotateY(Math.PI * 0.975).scale(trunkW(1.45), 1, 0.7 * TD * trunkW(1.45)), P.hem, roll, 0, 1.45, -0.15, { ink: 0.03 }));
  for (const sx of [-1, 1]) clipSrc('skirt', piece(ell(0.95, 0.75, 0.8), P.skirt, roll, sx * 2.55 * trunkW(1.9), 1.9, -0.6));

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
  ].map(([y, w, f, b, nf, nb]) => [y < 0 ? y * 0.88 : y, w * (y < 0 ? lerp(1, K.jaw, ss(-0.1, -1.4, y)) : 1), f, b, nf, nb]);      // (the lower face kept short)
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
    fx.strokeStyle = INKC; fx.lineCap = 'round'; fx.lineWidth = (MAN ? 0.065 : 0.1) * U;
    fx.beginPath(); fx.ellipse(px(cx), py(cy + ly), ar * U, br * U, 0, Math.PI + 0.15, 2 * Math.PI - 0.15); fx.stroke();
    if (MAN) return;      // (a man's lashes: the line of the lid, without the flick)
    const wx = sx * 0.42 * K.eyeW, wy = (0.13 - 0.55 * shut) * K.eyeH, wl = 0.11 * K.eyeW, wa = sx * 0.45;
    fx.lineWidth = 0.07 * U; fx.beginPath(); fx.moveTo(...E(wx - Math.cos(wa) * wl, wy - Math.sin(wa) * wl)); fx.lineTo(...E(wx + Math.cos(wa) * wl, wy + Math.sin(wa) * wl)); fx.stroke();
  }
  function drawBrow(sx, F) {
    const by = K.browY + F.browY, inX = sx * (K.eyeX - 0.3 * K.eyeW), outX = sx * (K.eyeX + 0.42 * K.eyeW), inY = by + F.brow * 0.3, outY = by - 0.06 - F.brow * 0.08;
    fx.strokeStyle = P.hairDk; fx.lineCap = 'round';
    for (let k = 0; k < 6; k++) { const t0 = k / 6, t1 = (k + 1) / 6, at = t => [lerp(inX, outX, t), lerp(inY, outY, t) + 0.09 * Math.sin(Math.PI * t)];
      const [x0, y0] = at(t0), [x1, y1] = at(t1); fx.lineWidth = lerp(0.105, 0.045, t1) * U * (MAN ? 1.55 : 1); fx.beginPath(); fx.moveTo(px(x0), py(y0)); fx.lineTo(px(x1), py(y1)); fx.stroke(); }
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
      fx.fillStyle = P.lips; fx.globalAlpha = MAN ? 0.3 : 0.75; fx.beginPath(); fx.ellipse(px(0), py(cy - 0.08 - c * 0.03), w * 0.22 * U, 0.045 * U, 0, 0, 7); fx.fill(); fx.globalAlpha = 1;
    }
  }
  function paintFace(F, open) {
    fx.clearRect(0, 0, FW, FH);
    if (F.blush > 0.02) for (const sx of [-1, 1]) {
      const bx = px(sx * 0.98), byp = py(-0.42), r = 0.42 * K.blushSize * U, g = fx.createRadialGradient(bx, byp, 0, bx, byp, r);
      g.addColorStop(0, `rgba(240,120,120,${0.55 * F.blush})`); g.addColorStop(1, 'rgba(240,120,120,0)');
      fx.save(); fx.translate(bx, byp); fx.scale(1, 0.55); fx.translate(-bx, -byp); fx.fillStyle = g; fx.fillRect(bx - r, byp - r, 2 * r, 2 * r); fx.restore();
    }
    // Stubble: a shadow of beard over the jaw, the chin and the upper lip.
    if (S.beard === 'stubble') { fx.save(); fx.globalAlpha = 0.22; fx.fillStyle = P.beard; fx.beginPath(); fx.ellipse(px(0), py(-1.55), 1.35 * U, 0.75 * U, 0, 0, 7); fx.fill(); fx.beginPath(); fx.ellipse(px(0), py(K.noseY - 0.42), 0.55 * U, 0.16 * U, 0, 0, 7); fx.fill(); fx.restore(); }
    // The nose's shadow, a short soft curve under its tip.
    fx.strokeStyle = shade(P.skin, -0.3); fx.lineWidth = 0.035 * U; fx.lineCap = 'round'; fx.beginPath(); fx.arc(px(0.02), py(K.noseY - 0.12 * K.noseSize), 0.1 * K.noseSize * U, Math.PI * 0.15, Math.PI * 0.75); fx.stroke();
    for (const sx of [-1, 1]) { drawEye(sx, F, open); drawBrow(sx, F); }
    // Older faces: soft laugh lines from the nose to the corners of the mouth, and a fan of them at the outer corners of the eyes, deeper when she smiles.
    if (S.old) {
      fx.strokeStyle = shade(P.skin, -0.15); fx.lineCap = 'round'; const sm = clamp(F.mc || 0, 0, 1);
      for (const sx of [-1, 1]) {
        fx.lineWidth = 0.04 * U; fx.beginPath(); fx.moveTo(px(sx * 0.42), py(K.noseY - 0.05)); fx.quadraticCurveTo(px(sx * (0.72 + 0.06 * sm)), py(-1.0 + K.mouthY), px(sx * (0.5 + 0.08 * sm)), py(-1.38 + K.mouthY)); fx.stroke();
        fx.lineWidth = 0.03 * U; const ex = sx * (K.eyeX + 0.5 * K.eyeW), ey = K.eyeY;
        for (const [dy, len] of [[0.1, 0.22], [-0.06, 0.26], [-0.22, 0.2]]) { fx.beginPath(); fx.moveTo(px(ex), py(ey + dy * 0.6)); fx.lineTo(px(ex + sx * len * (0.7 + 0.5 * sm)), py(ey + dy)); fx.stroke(); }
      }
    }
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
  const HAIR = S.hair || 'bun', SHORT = ['short', 'tousled', 'curly', 'tail', 'bald'].includes(HAIR) && (MAN || HAIR !== 'curly');
  // (short hair has less at the back; the cap itself stays whole over the crown, so the scalp never shows through it)
  // (the hat worn: the Watchman, seated by someone's fire, has taken his off with his cape)
  const HATW = S.cape && opts.seated ? null : S.hat;
  const HV = K.hairVol * (SHORT ? 0.96 : 1), HAT = !!HATW && HATW !== 'mob'; cap.scale(K.hairVol, K.hairVol, K.hairVol);
  // (under a hat, nothing stands up out of the crown or lies over the forehead)
  const underHat = y => HAT && y > 1.0;
  if (HAIR !== 'bald') {
    hair(cap, 0, 0.1, -0.04, [0, 0, 0]);
    hair(SHORT ? ell(1.5 * HV, 1.62 * HV, 1.12 * HV) : ell(1.62 * HV, 1.85 * HV, 1.3 * HV), 0, SHORT ? 0.3 : 0.15, SHORT ? -0.62 : -0.55);
  } else {      // (bald on top: hair round the back and sides, above the ears)
    hair(new THREE.TorusGeometry(1.72, 0.36, 8, 24, Math.PI * 1.25).rotateX(Math.PI / 2).rotateY(-Math.PI * 0.125 + Math.PI), 0, 0.2, -0.15);
  }

  // A fringe: soft swoops across the forehead, parted a little off centre.
  if (HAIR !== 'bald') for (const [x, y, rz, w, len, hex] of [[0.6, 1.2, -0.85, 1.05, 0.62, P.hair], [-0.5, 1.16, 0.75, 0.95, 0.58, MAN ? P.hair : P.hairHi], [-1.3, 0.78, 1.3, 0.62, 0.52, P.hair], [1.32, 0.78, -1.3, 0.62, 0.52, P.hair], [0.05, 1.32, 0.1, 0.7, 0.45, P.hair]])
    if (K.fringe > 0.02 && !underHat(y)) hair(ell(w * K.fringe, len * K.fringe, 0.34), x, y, (1.72 - Math.abs(x) * 0.4) * K.hairVol, [-0.45, Math.sign(x) * 0.35, rz], hex);
  if (HAIR !== 'bald' && HAIR !== 'curly' && !HAT) { const s = new THREE.Mesh(arc(1.4, 0.08, Math.PI * 0.18, Math.PI * 0.62), mat(P.hairHi)); s.position.set(0.1, 1.7, 0.35); s.rotation.set(-1.25, 0, 0.35); head.add(s); }       // (a band of shine across the crown)
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
  // (the short styles: tufts standing up at the front; a head of curls; or tied back at the nape)
  if (HAIR === 'tousled') for (const [x, z, rx, rz, sz] of [[0.5, 1.2, -0.7, -0.3, 1], [-0.4, 1.3, -0.8, 0.35, 0.9], [0.05, 0.6, -0.4, 0.05, 1.1], [0.9, 0.3, -0.3, -0.7, 0.85], [-0.95, 0.4, -0.3, 0.7, 0.85], [0, -0.5, 0.2, 0, 1]])
    if (!underHat(1.85 - Math.abs(x) * 0.25)) hair(ell(0.42 * sz, 0.7 * sz, 0.36 * sz), x, 1.85 - Math.abs(x) * 0.25 - Math.max(0, -z) * 0.2, z, [rx, 0, rz]);
  // (curls all over, but none over the face: those in front sit at the hairline or above it)
  if (HAIR === 'curly') { const n = MAN ? 16 : 22; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 * 2.618, u = (i + 0.5) / n, el = lerp(1.1, -0.35, u), r = Math.cos(el), x = Math.sin(a) * r * 1.85, y = Math.sin(el) * 1.9 + 0.35, z = Math.cos(a) * r * 1.95 - 0.15;
    if ((z > 0.5 && y < 1.55 && Math.abs(x) < 1.45) || underHat(y)) continue; hair(new THREE.SphereGeometry(0.46 + 0.08 * (i % 3), 10, 8), x, y, z, [0, 0, 0], i % 4 ? P.hair : P.hairHi); } }
  if (HAIR === 'tail') { dangle(0, 0.15, -1.75, [[2.0, 0.42, 0.38], [1.5, 0.32, 0.28]], { min: -0.05, max: 1.0, side: 0.4, grav: 0.85 }); hair(new THREE.TorusGeometry(0.34, 0.1, 6, 12), 0, 0.1, -1.72, [0.2, 0, 0], '#3a2618'); }
  if (HAIR === 'braid') { dangle(0, -0.1, -1.55, [[1.9, 0.5, 0.46], [1.7, 0.44, 0.4], [1.5, 0.38, 0.34]], { min: -0.05, max: 1.0, side: 0.4, grav: 0.85 }); for (const sx of [-1, 1]) hair(ell(0.42, 1.1, 0.45), sx * 1.42, -0.2, 0.35, [0, 0, sx * 0.1]); }
  if (HAIR === 'curly' && !MAN) for (const sx of [-1, 1]) dangle(sx * 1.45, 0.4, 0.1, [[1.6, 0.6, 0.55], [1.3, 0.5, 0.45]], { min: -0.3, max: 1.1, side: 0.35, grav: 0.85, sx });
  if (HAIR === 'long') {
    dangle(0, 0.3, -1.05, [[3.2, 1.55, 0.6], [2.6, 1.3, 0.5]], { min: -0.05, max: 1.2, side: 0.5, grav: 0.85 });
    // The front strands spring from the outer edges of the fringe, beside her face (framing it, never over it), and hang a little forward, over the
    // front of the cloak rather than off her shoulders.
    for (const sx of [-1, 1]) dangle(sx * 1.55, 0.75, 0.55, [[2.2, 0.44, 0.42], [1.8, 0.38, 0.34]], { min: -0.4, max: 1.3, side: 0.35, grav: 0.9, sx, front: true });
  } else if (HAIR === 'bun') {
    if (S.hat !== 'mob') { hair(ell(1.0, 0.95, 0.95), 0, 0.8, -1.7); hair(new THREE.TorusGeometry(0.75, 0.16, 6, 16), 0, 0.8, -1.35, [0, 0, 0], P.hairHi); }      // the bun (under a cap, tucked away)
    if (id === 'gerda') hair(ell(0.3, 0.75, 0.22), 1.02, 1.25, 1.12, [-0.6, 0.45, -0.6], '#b8b0a6');           // grey at the temple
    for (const sx of [-1, 1]) hair(ell(0.42, 1.1, 0.45), sx * 1.42, -0.2, 0.35, [0, 0, sx * 0.1]);
  }
  // Sideburns, for the men with short hair.
  if (MAN && HAIR !== 'bald') for (const sx of [-1, 1]) hair(ell(0.22, 0.62, 0.32), sx * (headAt(0).w - 0.05), 0.1, 0.55, [0, 0, 0]);
  // ── Beards: a moustache under the nose; a full or short beard round the jaw and chin; a pointed beard at the chin. (Stubble is painted.) ──
  { const B = S.beard, bc = P.beard, f = B === 'short' ? 0.82 : 1, bk = (geo, x, y, z, rot) => piece(geo, bc, head, x, y, z, { rot, ink: 0.045 });
    if (B && B !== 'stubble') for (const sx of [-1, 1]) bk(ell(B === 'moustache' ? 0.55 : 0.46, 0.15, 0.24), sx * 0.3, K.noseY - 0.46, faceZ(0.3, K.noseY - 0.46) - 0.02, [0, sx * 0.25, sx * (B === 'moustache' ? 0.42 : 0.28)]);
    if (B === 'full' || B === 'short') {
      bk(ell(1.24 * f, 0.86 * f, 0.92 * f), 0, -2.0, 0.62);
      for (const sx of [-1, 1]) bk(ell(0.48 * f, 0.92 * f, 0.78 * f), sx * 1.18, -1.32, 0.3, [0, 0, -sx * 0.15]);
    }
    if (B === 'pointed') bk(ell(0.34, 0.62, 0.36), 0, -2.18, 0.98, [0.35, 0, 0]);
  }
  // ── Hats and caps. ──
  { const H = HATW, hc = P.hat, hp = (geo, x, y, z, rot, hex) => piece(geo, hex || hc, head, x, y, z, { rot, ink: 0.05 });
    if (H === 'mob') { hp(ell(2.08, 1.3, 2.12), 0, 1.25, -0.28); hp(new THREE.TorusGeometry(1.98, 0.24, 8, 28), 0, 0.62, -0.2, [Math.PI / 2 - 0.22, 0, 0]); }      // (a puffed linen cap, its frill round the face)
    if (H === 'nightcap') { const g = new THREE.Group(); g.position.set(0, 1.0, -0.3); g.rotation.set(-1.05, 0, 0.35); head.add(g); piece(new THREE.CylinderGeometry(0.16, 2.12, 4.2, 18).translate(0, 2.1, 0), hc, g, 0, 0, 0, { ink: 0.05 }); piece(new THREE.SphereGeometry(0.42, 10, 8), '#f4f0e6', g, 0, 4.25, 0, { ink: 0.04 }); hp(new THREE.TorusGeometry(2.04, 0.22, 8, 28), 0, 0.82, -0.25, [Math.PI / 2 - 0.25, 0, 0], shade(hc, -0.1)); }
    if (H === 'bakers') { hp(new THREE.CylinderGeometry(1.62, 1.78, 1.5, 22), 0, 1.75, -0.15); hp(ell(2.05, 1.05, 2.05), 0, 2.75, -0.15); }
    if (H === 'flatcap') { hp(ell(2.08, 0.86, 2.18), 0, 1.6, -0.05); hp(ell(1.35, 0.16, 0.95), 0, 1.12, 1.72, [0.28, 0, 0]); }
    // (a tricorn: a round crown, and a brim turned up on three sides into three points, one to the front)
    if (H === 'tricorn') {
      // (the brim's edge: round the crown, drawn out to a point to the front and either side behind)
      const R = th => 2.02 + 0.85 * Math.pow(Math.abs(Math.cos(1.5 * th)), 6), y0 = 1.32, Y = 0.95;
      const band = (u, v) => { const th = u * Math.PI * 2, r = R(th) + 0.22 * v, y = y0 + v * Y * (0.8 + 0.2 * Math.pow(Math.abs(Math.cos(1.5 * th)), 2)); return new V3(Math.sin(th) * r, y, Math.cos(th) * r); };
      piece(surface(band, 72, 3, p => new V3(p.x, 0, p.z)), hc, head, 0, 0, -0.12, { side: THREE.DoubleSide, ink: 0.045 });
      piece(surface((u, v) => { const th = u * Math.PI * 2, r = R(th) * v; return new V3(Math.sin(th) * r, y0, Math.cos(th) * r); }, 72, 2, () => new V3(0, -1, 0)), shade(hc, 0.1), head, 0, 0, -0.12, { side: THREE.DoubleSide, ink: 0 });
      hp(ell(1.76, 1.02, 1.86), 0, 1.95, -0.12); hp(new THREE.TorusGeometry(1.9, 0.07, 6, 40), 0, 1.4, -0.12, [Math.PI / 2, 0, 0], '#8a7a50');      // (the crown, and a band round it)
    }
    if (H === 'felt') { hp(new THREE.CylinderGeometry(1.45, 1.66, 1.7, 22), 0, 2.15, -0.1); hp(new THREE.CylinderGeometry(3.1, 3.1, 0.14, 28), 0, 1.38, -0.1); hp(new THREE.CylinderGeometry(1.67, 1.68, 0.36, 22), 0, 1.62, -0.1, [0, 0, 0], '#3a2a1e'); }
  }

  // ── Her cloak: a scarlet capelet over the shoulders, longest at the back, with the hood down on her back or up over her hair. ──
  const cloakParts = [];
  // (her grandmother wears a shawl the same way: shorter, no hood)
  // (and the Watchman's cape, longer than a shawl; seated to take someone in hand, he's set it aside)
  if ((id === 'red' && look.outfit !== 'No cloak') || S.shawl || (S.cape && !opts.seated)) {
    const prof = [[9.15, 1.32], [8.75, 2.6], [8.1, 3.7], [7.2, 4.05], [6.0, 4.15], [4.0, 4.2]];
    const rAt = y => { for (let i = 1; i < prof.length; i++) if (y >= prof[i][0]) { const [y0, r0] = prof[i - 1], [y1, r1] = prof[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return prof[prof.length - 1][1]; };
    const DEP = 0.8, PH0 = 0.42, PH1 = Math.PI * 2 - 0.42, SHW = S.shoulders || 1;      // (SHW: as wide as the shoulders it hangs from)
    const hem = phi => { const b = (1 - Math.cos(phi)) / 2; return 9.15 - (3.05 + 2.3 * Math.pow(b, 1.4)) * K.cloakLen * (S.shawl ? 0.78 : S.cape ? 1.75 : 1); };      // (a shawl shorter than her cloak; his cape longer, past his hips)
    const fn = (u, v) => { const phi = lerp(PH0, PH1, u), y = lerp(9.15, hem(phi), v), r = (rAt(y) + 0.12 * Math.sin(u * Math.PI * 9) * v) * Math.max(K.cloakWidth, K.chestWidth, K.armGirth * 0.95);
      const dep = lerp(DEP, 0.6, Math.max(0, Math.cos(phi)));      // (the front panels lie close over the bust; the back stands off the shoulder blades)
      const P0 = new V3(Math.sin(phi) * r * SHW, y, Math.cos(phi) * r * dep * TD);
      if (!opts.lying) return P0;
      // Lying face down across a lap, it lies along the line of her back instead of standing off it as a bell: the back of it follows her back a
      // cloth's thickness off it, and the sides fall away round her flanks toward the floor.
      const yH = y + D.torsoY, back = Math.max(0, -Math.cos(phi)), sd = Math.sin(phi) ** 2, w = ss(0.05, 0.35, v);
      const zBack = -(bodyR(yH) * trunkW(yH) * 0.74 * TD + 0.32 + 0.08 * v);
      P0.z = lerp(P0.z, Math.min(P0.z * 0.0 + zBack * Math.pow(back, 0.6), 0) + (Math.cos(phi) > 0 ? P0.z : 0), w * ss(0, 0.25, back));
      P0.z += 2.2 * v * v * sd * w; P0.x *= lerp(1, 0.86, v * sd * w);
      return P0; };
    // (her body's radius at a height in the hips' space, as the waist, ribs and back are built)
    const BODY = [[0.4, 2.9], [1.5, 2.75], [2.9, 2.38], [3.8, 2.32], [4.9, 2.55], [6.2, 2.85], [7.4, 3.0], [8.4, 2.92], [9.2, 2.3], [9.7, 1.2]];
    function bodyR(y) { if (y <= BODY[0][0]) return BODY[0][1]; for (let i = 1; i < BODY.length; i++) if (y <= BODY[i][0]) { const [y0, r0] = BODY[i - 1], [y1, r1] = BODY[i]; return lerp(r0, r1, (y - y0) / (y1 - y0)); } return BODY[BODY.length - 1][1]; }
    const out = p => new V3(p.x, 0, p.z);
    // The cape's sides are carried partly by the arms under them, so it lifts with them rather than letting them through.
    const capeW = p => { const side = 0.55 * ss(1.6, 3.2, Math.abs(p.x)) * ss(-0.4, 0.9, p.z) * ss(9.0, 7.4, p.y);      // (front and sides only: the back stays on her back)
      return [[rig.torso, 1 - side], [p.x > 0 ? rig.armL : rig.armR, side]]; };
    // (whatever rests on her upper back, Gerda's hand, rests on the cape: the point is moved out to its surface, between the shoulder blades)
    { const yb = rig.upperBack.position.y + D.torsoY, back = fn(0.5, (9.15 - yb) / (9.15 - hem(Math.PI))); rig.upperBack.position.z = Math.min(rig.upperBack.position.z, back.z - 0.12); }
    cloakParts.push(skinnedOn(rig.torso, surface(fn, 40, 10, out), P.cloak, capeW, { side: THREE.DoubleSide, ink: 0.07 }));
    cloakParts.push(skinnedOn(rig.torso, surface((u, v) => { const p = fn(u, 0.93 + 0.07 * v); return p.add(out(p).normalize().multiplyScalar(0.04)); }, 40, 1, out), P.lace, capeW, { side: THREE.DoubleSide, ink: 0 }));
    cloakParts.push(piece(ell(0.32, 0.32, 0.22), S.shawl ? P.cloakDk : S.cape ? '#b89a50' : '#e8b84a', rig.torso, 0, 8.95, 1.15));       // the clasp (a knot, on a shawl; brass, on his cape)
    for (const sx of [-1, 1]) cloakParts.push(piece(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), P.lace, rig.torso, sx * 0.3, 8.3, 1.25, { rot: [0.2, 0, sx * 0.25], ink: 0 }));
    if (S.shawl || S.cape) { /* (no hood) */ }
    else if (look.outfit === 'Hood up') {
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
  // (rate: how fast the face eases to it, per second; a flicker of pain comes on faster than the face settles back)
  let easeRate = 10;
  rig.setExpr = (name, rate) => { const e = EX[name] || EX.calm; target = Object.assign({}, e, MOUTHS[e.mouth] || MOUTHS.flat); rig.expr = EX[name] ? name : 'calm'; easeRate = rate || 10; };
  rig.faceNow = () => Object.assign({}, F);      // (the face as it is this moment, eased: for a look in from outside)
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
  // Skin that's covered (under the skirt, the drawers, the bodice, inside the boots) is coloured as what covers it, so that where a limb pushes
  // through the cloth as it moves, it reads as the cloth, not as skin showing through. It follows what she's wearing: bare skin is skin.
  // (Worked out from each point's place at rest, in the hips' space, where the thigh's joint is at y 0 and the leg hangs straight down.)
  const dress = { skirt: 'down', drawers: 'up' }, CC = {}, cc = k => CC[k] || (CC[k] = srgb(P[k]));
  const bootTop = -(D.thigh + 0.507 * D.shin);
  // Whether a point (in the hips' space) is in the part of her the skirt covers: what's there is hidden under it, unless it pokes through, and
  // then it should look like the skirt. Standing, the length of the skirt (the point as it is at rest, since the skirt is skinned to the legs as
  // they are); seated, along the drape over her lap as it lies now (tilted along her thighs): the seat, the lap to the drape's hem, and for a
  // long skirt, round the knees and down the shins.
  const XA = new V3(1, 0, 0);
  const inSkirt = (rest, now) => {
    if (!(opts.seated || seatedNow)) return rest.y < 2.1 && rest.y > -S.skirtLen + 0.3;
    const q = now.clone().applyAxisAngle(XA, -drapeG.rotation.x), Sh = drapeShape;
    if (q.y > -3 && q.y < 2.1 && q.z < -1.2) return true;                                         // (the seat)
    if (q.z > -1.5 && q.z < -1.5 + Sh.lapL - 0.35 && q.y > -0.1 - 2.3 * K.legGirth - 0.8) return true;      // (the lap)
    if (Sh.drop > 0.01 && q.y < -0.1 && q.y > -0.1 - Sh.drop + 0.3 && q.z > Sh.Tk - 3) return true;           // (round the knees, down the shins)
    return false;
  };
  // (rest: the point at rest, in the hips' space; now: where it is now)
  function coverAt(t, p, now) {
    const down = dress.skirt === 'down', drawersOn = !down && dress.drawers !== 'down', y = p.y;
    if (t.bone === rig.thighL || t.bone === rig.thighR) {
      if (S.feet === 'boots') { const w = ss(bootTop - 0.2, bootTop - 0.6, y); if (w > 0) return [cc('boots'), w, 'boots']; }
      if (down) return TROUSERS ? [cc('trousers'), 1, 'skirt'] : inSkirt(p, now) ? skirtOver(p) : null;
      if (drawersOn) return [cc('drawers'), ss(-2.8, -2.3, y), 'drawers'];
      return null;
    }
    if (t.bone === rig.seatPivot.L || t.bone === rig.seatPivot.R) return down ? (TROUSERS ? [cc('trousers'), 1, 'skirt'] : inSkirt(p, now) ? skirtOver(p) : null) : drawersOn ? [cc('drawers'), 1, 'drawers'] : null;
    if (!t.bone) {      // (the hips: the bodice over the top of them, and under it the skirt, or the drawers)
      if (TROUSERS) return down ? [cc('trousers'), 1, 'skirt'] : drawersOn ? [cc('drawers'), 1, 'drawers'] : null;
      const wb = ss(0.85, 1.15, y); if (wb >= 0.5 && BODICE) return [cc('bodice'), 1, 'bodice'];
      return down ? skirtOver(p) : drawersOn ? [cc('drawers'), 1, 'drawers'] : null;
    }
    return null;
  }
  const ctmp = new THREE.Color();
  // (cv: [colour, share, kind] — what covers the point, or nothing)
  const setCover = (c, i, cv) => { const w = cv && cv[1] > 0 ? Math.min(1, cv[1]) : 0; if (w) { c.cov[i * 4] = cv[0].r; c.cov[i * 4 + 1] = cv[0].g; c.cov[i * 4 + 2] = cv[0].b; } c.cov[i * 4 + 3] = w; c.kind[i] = w ? CLIP_KINDS[cv[2]] : 0; };
  function recolourCovers() {
    for (const c of covers) {
      const toNow = new THREE.Matrix4().copy(rig.hips.matrixWorld).invert().multiply(c.frame.matrixWorld), qn = new V3();
      for (let i = 0; i < c.at.length; i++) { ctmp.copy(c.base); c.col[i * 3] = ctmp.r; c.col[i * 3 + 1] = ctmp.g; c.col[i * 3 + 2] = ctmp.b; setCover(c, i, c.fn(c.atH[i], qn.copy(c.at[i]).applyMatrix4(toNow))); }
      c.geo.attributes.color.needsUpdate = true; c.geo.attributes.cover.needsUpdate = true; c.geo.attributes.coverKind.needsUpdate = true;
    }
  }
  function bleed(force) {
    const key = [rig.seatPivot.L, rig.seatPivot.R, rig.thighL, rig.thighR].map(b => b.quaternion.toArray().map(x => x.toFixed(2)).join()).join('|');
    if (!force && key === rotKey.v) return; rotKey.v = key;
    for (const s of ['L', 'R']) mNow[s].copy(moved(rig.seatPivot[s], markAt[s]));
    for (const t of tints) {
      for (let i = 0; i < t.at.length; i++) {
        tc.copy(t.base); const q = !t.bone ? t.at[i] : t.follow ? t.at[i].clone().lerp(moved(t.bone, t.at[i]), t.follow[i]) : moved(t.bone, t.at[i]);
        for (const s of ['L', 'R']) { const m = marks[s]; if (m <= 0.005) continue; const w = Math.exp(-q.distanceToSquared(mNow[s]) / (2 * 1.5 * 1.5)); tc.lerp(pinkL, Math.min(0.75, 0.95 * Math.sqrt(m) * w)); tc.lerp(redL, Math.min(0.62, 0.8 * m * m * w * w)); }
        setCover(t, i, coverAt(t, t.at[i], q));
        t.col[i * 3] = tc.r; t.col[i * 3 + 1] = tc.g; t.col[i * 3 + 2] = tc.b;
      }
      t.geo.attributes.color.needsUpdate = true; t.geo.attributes.cover.needsUpdate = true; t.geo.attributes.coverKind.needsUpdate = true;
    }
  }

  // Seated (on a stool or the bed, in the cottage): the skirt is the drape over her lap rather than skinned to her legs. (w: how far she's sat.)
  let seatedNow = false, dressNow = {};
  rig.setSeated = w => {
    const on = w > 0.6; if (on !== seatedNow) { seatedNow = on; rig._recolour = true; rig.setDress(dressNow); }
    // (the drape's top follows the line of her thighs; once she's settled the covered skin is worked out again for how she sits)
    if (on) { const d = new V3(0, -1, 0).applyQuaternion(rig.thighL.quaternion).add(new V3(0, -1, 0).applyQuaternion(rig.thighR.quaternion)); drapeG.rotation.x = clamp(Math.atan2(-d.y, d.z), -0.6, 0.6); }
    else drapeG.rotation.x = 0;
    const settled = w > 0.97; if (settled && !rig._settled) { rig._recolour = true; rig.setDress(dressNow); } rig._settled = settled;
  };
  rig.setDress = d => {
    d = d || {}; dressNow = d;
    // skirt: 'down', 'up' (lifted, gathered at the waist) or 'off' (gone, waistband and all: the editor's view for reading proportions).
    {
      const sk = d.skirt || 'down', down = sk === 'down', bare = !down && d.drawers === 'down';
      for (const m of [skirt, hemBand, apron]) if (m) show(m, down && !seatedNow);
      drapeG.visible = seatG.visible = (SKIRTED || (TAP && down)) && (!!opts.seated || (down && seatedNow));
      tails.forEach(m => show(m, (down || S.vest === 'coat') && !seatedNow)); shirtTail.forEach(m => show(m, !down));
      roll.visible = SKIRTED && sk === 'up'; waist.visible = sk !== 'off';
      trousers.forEach(m => show(m, down)); trousersDown.forEach(m => show(m, sk === 'up'));      // (trousers: on, down round the ankles, or off)
      drawers.forEach(m => show(m, !bare && !(down && seatedNow))); drawersDown.forEach(m => show(m, bare));      // (seated, the drape is over them: drawn, they'd only poke through it)
      // (under a skirt that's down, their outline is never rightly seen: where they push through it they take its colour, and an ink line round
      // that would only draw the shape of what's underneath)
      drawers.forEach(m => { if (m.userData.hull) m.userData.hull.visible = m.visible && !down; });
      if (sk !== dress.skirt || (d.drawers || 'up') !== dress.drawers) { dress.skirt = sk; dress.drawers = d.drawers || 'up'; rig._recolour = true; }
    }
    const mk_ = d.marks || { L: 0, R: 0 };
    let any = false; for (const s of ['L', 'R']) { const m = Math.round((mk_[s] || 0) * 100) / 100; if (m !== marks[s]) { marks[s] = m; any = true; } }
    if (any || rig._recolour) { if (rig._recolour) recolourCovers(); rig._recolour = false; bleed(true); }
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
    const k = 1 - Math.exp(-dt * easeRate);
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
  rig.setExpr('calm'); Object.assign(F, target); rig.setDress({}); bleed(true); recolourCovers(); applyFace(true);
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

// ── A standing idle: her weight on one straight leg, the other easy, changing over now and then. ──
// The pelvis sits over the standing foot, its hip on that side up and the other down, so the free knee eases forward; the spine bends back the
// other way, dropping the shoulder over the standing leg, so the head stays over the foot carrying her. The free foot is set a little forward
// and out. Every twelve seconds or so the weight goes over to the other leg (smoothly, in a second or so).
function idle(r, t) {
  const w = stance(t), sh = Math.sin(t * 0.5);
  r.hips.position.set(0.5 * w + 0.04 * sh, DIM.hipY, 0);
  r.hips.rotation.set(-0.02, 0.06 * w, 0.065 * w);
  r.torso.rotation.set(0.03 + 0.012 * Math.sin(t * 1.6), -0.07 * w, -0.11 * w);
  r.neck.rotation.set(0.04 * Math.sin(t * 0.37), 0.15 * Math.sin(t * 0.23), 0.03 * Math.sin(t * 0.41) + 0.04 * w);
  r.head.rotation.set(0, 0, 0);
  for (const [s, side] of [['L', 1], ['R', -1]]) {
    const free = Math.max(0, -w * side);      // (how much this is the easy leg)
    r['arm' + s].rotation.set(0.04 * Math.sin(t * 1.1 + side) - 0.04, 0, side * (0.12 + 0.03 * free)); r['elbow' + s].rotation.set(-0.2 - 0.04 * Math.sin(t * 1.1 + side), 0, 0); r['hand' + s].rotation.set(0.1, 0, side * 0.05);
  }
  plantFeet(r, w);
}
// Which leg carries her (+1 her left, -1 her right): holding, then going over to the other.
function stance(t) { const k = Math.sin(t * Math.PI / 12); return clamp(k * 3, -1, 1); }
// Feet planted: each ankle held at its own spot on the floor (its sole's height: the sole is what stands on the floor), in the root's space. The
// standing foot (w: +1 her left) is under her, a touch in, turned out a little; the free one forward and out, turned out more. The hips are raised
// until the standing leg is all but straight. The thigh and knee are solved to reach each foot, the knee bending forward; the foot is turned to
// lie flat on the floor, pointing its own way.
const _pf = { q: new THREE.Quaternion(), m: new THREE.Matrix4(), dn: new V3(0, -1, 0) };
function plantFeet(r, w) {
  w = w || 0;
  const L1 = DIM.thigh, L2 = DIM.shin, foot = {};
  for (const [s, side] of [['L', 1], ['R', -1]]) {
    const free = Math.max(0, -w * side), carry = Math.max(0, w * side);
    foot[s] = { at: new V3(side * (DIM.hipX + 0.08 - 0.25 * carry + 0.35 * free), 0.75, 0.05 + 1.3 * free), yaw: side * (0.12 + 0.14 * free) };
  }
  // (raise the hips till the standing leg — or, square on, the nearer — is straight bar a hair)
  r.root.updateMatrixWorld(true);
  const S = w >= 0 ? 'L' : 'R', hj = r['thigh' + S].getWorldPosition(new V3()), A = r.root.localToWorld(foot[S].at.clone()), sc = r.root.getWorldScale(new V3()).x;
  const want = (L1 + L2) * 0.997 * sc, hd = Math.hypot(hj.x - A.x, hj.z - A.z), lift = (A.y + Math.sqrt(Math.max(0, want * want - hd * hd)) - hj.y) / sc;
  r.hips.position.y += lift;
  r.root.updateMatrixWorld(true);
  for (const [s, side] of [['L', 1], ['R', -1]]) {
    const thigh = r['thigh' + s], knee = r['knee' + s], ankle = r['ankle' + s];
    const T = r.root.localToWorld(foot[s].at.clone()), Tl = r.hips.worldToLocal(T);      // (in the hips' space)
    const v = Tl.sub(thigh.position), d = clamp(v.length(), 1, L1 + L2 - 0.01), u0 = v.clone().normalize();
    const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), k = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    // (the knee bends toward where the foot points, so a turned-out foot has its knee over it)
    const kd = new V3(Math.sin(foot[s].yaw), 0, Math.cos(foot[s].yaw)), fwd = kd.addScaledVector(u0, -kd.dot(u0)).normalize(), u = u0.clone().multiplyScalar(Math.cos(a)).addScaledVector(fwd, Math.sin(a));
    thigh.quaternion.setFromUnitVectors(_pf.dn, u); knee.rotation.set(k, 0, 0);
    // (then the thigh is turned about its own length so the knee points that way too)
    r.root.updateMatrixWorld(true);
    const kneeFwd = new V3(0, 0, 1).applyQuaternion(thigh.quaternion); kneeFwd.addScaledVector(u, -kneeFwd.dot(u)).normalize();
    const turn = Math.atan2(new V3().crossVectors(kneeFwd, fwd).dot(u), kneeFwd.dot(fwd));
    thigh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(u, turn));
    r.root.updateMatrixWorld(true);
    ankle.parent.getWorldQuaternion(_pf.q).invert(); ankle.quaternion.copy(_pf.q.multiply(r.root.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), foot[s].yaw))));
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
setTune(loadTune(), false); setShapes(loadShapes(), false);
const Toon = { make, clipPass, idle, stance, sit, seatFor, makeChair, DIM, SPECS, EXPRS, TUNE, getTune, setTune, resetTune, VARY, SPEC0, varies, getShapes, setShapes, resetShapes, palette, shade, mat, flat, hullGeo, INKM, ell, lathe };
root.Toon = Toon;
})(typeof window !== 'undefined' ? window : globalThis);
