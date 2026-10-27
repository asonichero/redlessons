// Little Red’s Lessons — the village, from outside: the green with its well, its old lime tree and the curfew bell; round it the inn, the bakery
// and the forge, and the cottages: Maren's and Red's nearest the meadow and the way to the wood, the Thatchers', the Dunns'. Lanes of trodden
// earth between them, low stone walls and hurdle fences, gardens, and beyond it all hedges and fields and trees. Built as the cottage and the
// cabin are (js/cottage.js's kit: limewashed daub in an oak frame on a stone footing, thick thatch, the same textures and ink), at the same
// scale: the cottage's walls here are the room's own (Maren's door, her windows and her chimney where they are inside).
//
// Only the outsides for now: the doors are shut but hers. Her door opens and goes in (home); the lane at the far corner goes back to the wood.
//
//   const v = Village.build(scene)   → { group, update, tick, light(t, stage), follow(pos, dt, camera, at), keepCamera(camera, target), world }
//   world: obstacles, bounds, exits ('the wood', 'the door': hers), entries ('wood', 'home'), door (hers), constrain.
// Units: the characters' (a figure stands about 31 tall). The green is at the origin; north (toward the wood) is -z.
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3;
const { canvasTex, toonMap, rnd, textures, box, solid, pole, srgb } = root.Cottage.kit;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ── Textures of its own (the rest are the cottage's: limewash, rubble stone, oak, the door's planks). ──
const TX = {};
function tex() {
  if (TX.grass) return TX;
  TX.grass = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#6f8f44'; x.fillRect(0, 0, w, h); const r = rnd(181); for (let i = 0; i < 500; i++) { x.fillStyle = ['#7a9a4a', '#5e7e3a', '#86a452', '#6a8640'][i % 4]; x.fillRect(r() * w, r() * h, 2, 3 + r() * 3); } for (let i = 0; i < 24; i++) { x.fillStyle = 'rgba(90,70,40,.15)'; x.beginPath(); x.ellipse(r() * w, r() * h, 4 + r() * 8, 2 + r() * 4, 0, 0, 7); x.fill(); } }, [90, 90]);
  // (the green's turf: shorter, brighter, daisies in it)
  TX.turf = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#7c9c4c'; x.fillRect(0, 0, w, h); const r = rnd(183); for (let i = 0; i < 420; i++) { x.fillStyle = ['#86a656', '#6e8e42', '#92b05e'][i % 3]; x.fillRect(r() * w, r() * h, 2, 2 + r() * 2); } for (let i = 0; i < 40; i++) { x.fillStyle = i % 4 ? '#f6f2e6' : '#f2d04a'; x.fillRect(r() * w, r() * h, 2, 2); } }, [12, 12]);
  // (trodden earth, its edges going to grass, as the wood's path: across its width (u), along it (v))
  TX.dirt = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#9a7a52'; x.fillRect(0, 0, w, h); const r = rnd(185); for (let i = 0; i < 160; i++) { x.fillStyle = ['#8a6a44', '#a88a5e', '#7a5c3a'][i % 3]; x.beginPath(); x.ellipse(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2, 0, 0, 7); x.fill(); }
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(111,143,68,1)'); g.addColorStop(0.16, 'rgba(111,143,68,0)'); g.addColorStop(0.84, 'rgba(111,143,68,0)'); g.addColorStop(1, 'rgba(111,143,68,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, [1, 1]);
  // Thatch from outside: long straw combed down the slope, in courses, weathered darker toward the eaves; and the ridge's capping, a pattern
  // cut into it (the thatcher's mark: scallops and a row of crossed spars).
  TX.thatch = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#a8895a'; x.fillRect(0, 0, w, h); const r = rnd(187);
    for (let i = 0; i < 1400; i++) { const px = r() * w, py = r() * h, c = ['#c9a96a', '#a8844c', '#8a6a3a', '#d6bc80', '#9a7a48'][i % 5]; x.strokeStyle = c; x.globalAlpha = 0.5; x.lineWidth = 1 + r() * 1.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 2, py + 16 + r() * 22); x.stroke(); }
    x.globalAlpha = 1; for (let k = 0; k < 2; k++) { const y0 = k * 128 + 120, gr = x.createLinearGradient(0, y0 - 18, 0, y0 + 4); gr.addColorStop(0, 'rgba(80,56,28,0)'); gr.addColorStop(1, 'rgba(70,48,24,0.22)'); x.fillStyle = gr; x.fillRect(0, y0 - 18, w, 22); }      // (soft courses, each lying over the one below)
  }, [1, 1]);
  TX.ridge = canvasTex(256, 64, (x, w, h) => {
    x.fillStyle = '#9e7c48'; x.fillRect(0, 0, w, h); const r = rnd(189);
    for (let i = 0; i < 500; i++) { x.strokeStyle = ['#b8955c', '#8a683a', '#c6a46a'][i % 3]; x.globalAlpha = 0.5; x.lineWidth = 1.2; const px = r() * w, py = r() * h; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 10 + r() * 10, py + (r() - 0.5) * 2); x.stroke(); }
    x.globalAlpha = 1; x.strokeStyle = 'rgba(70,48,24,0.55)'; x.lineWidth = 2.5; x.beginPath(); for (let i = 0; i <= 8; i++) { const cx = i * w / 8; x.moveTo(cx - 16, h * 0.78); x.quadraticCurveTo(cx, h * 1.05, cx + 16, h * 0.78); } x.stroke();
    x.lineWidth = 2; for (let i = 0; i < 16; i++) { const cx = (i + 0.5) * w / 16; x.beginPath(); x.moveTo(cx - 5, h * 0.25); x.lineTo(cx + 5, h * 0.45); x.moveTo(cx + 5, h * 0.25); x.lineTo(cx - 5, h * 0.45); x.stroke(); }
  }, [1, 1]);
  // Field stone, for the forge's walls and the low walls along the lanes: rough rounded stones, grey and brown, deep mortar.
  TX.rubble = canvasTex(256, 128, (x, w, h) => {
    x.fillStyle = '#7e786c'; x.fillRect(0, 0, w, h); const r = rnd(191);
    for (let row = 0; row < 5; row++) for (let i = 0; i < 9; i++) { const cx = (i + (row % 2 ? 0.5 : 0) + (r() - 0.5) * 0.3) * w / 9, cy = (row + 0.5) * h / 5 + (r() - 0.5) * 4, g = 125 + r() * 45, b = r() < 0.3 ? 14 : 0;
      x.fillStyle = `rgb(${g + b},${g - 2},${g - 12 - b})`; x.beginPath(); x.ellipse(cx, cy, 12 + r() * 6, 9 + r() * 3, (r() - 0.5) * 0.5, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.13)'; x.beginPath(); x.ellipse(cx - 3, cy - 3, 6, 3, 0, 0, 7); x.fill(); }
  }, [1, 1]);
  // Wattle hurdles (the garden fences): hazel woven between stakes.
  TX.hurdle = canvasTex(128, 64, (x, w, h) => { x.fillStyle = '#6a5034'; x.fillRect(0, 0, w, h); for (let j = 0; j < h; j += 6) { for (let i = 0; i < w; i += 16) { x.fillStyle = ((i / 16 + j / 6) % 2) ? '#8e6c44' : '#7a5a38'; x.beginPath(); x.ellipse(i + 8, j + 3, 9, 2.6, 0, 0, 7); x.fill(); } } x.fillStyle = '#4a3420'; for (let i = 0; i < w; i += 16) x.fillRect(i, 0, 3, h); }, [1, 1]);
  // The inn's sign: a wheatsheaf on a dark green board, gold edged.
  TX.sign = canvasTex(128, 96, (x, w, h) => {
    x.fillStyle = '#2e4a34'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c9a24a'; x.lineWidth = 5; x.strokeRect(5, 5, w - 10, h - 10);
    x.strokeStyle = '#e0b858'; x.lineWidth = 2.4; for (let i = -6; i <= 6; i++) { x.beginPath(); x.moveTo(w / 2 + i * 1.2, h * 0.8); x.quadraticCurveTo(w / 2 + i * 2.2, h * 0.5, w / 2 + i * 4.2, h * 0.2); x.stroke(); }
    x.fillStyle = '#e8c060'; for (let i = -6; i <= 6; i++) { x.beginPath(); x.ellipse(w / 2 + i * 4.2, h * 0.19, 2.6, 6, i * 0.12, 0, 7); x.fill(); }
    x.fillStyle = '#8a5a2a'; x.fillRect(w / 2 - 14, h * 0.55, 28, 5);
  });
  TX.sign.wrapS = TX.sign.wrapT = THREE.ClampToEdgeWrapping;
  // The bakery's: a loaf and a twist on cream.
  TX.loafSign = canvasTex(96, 96, (x, w, h) => { x.fillStyle = '#efe4c8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a4a2a'; x.lineWidth = 4; x.strokeRect(4, 4, w - 8, h - 8);
    x.fillStyle = '#b8743a'; x.beginPath(); x.ellipse(w / 2, h * 0.58, 30, 17, 0, Math.PI, 0); x.lineTo(w / 2 + 30, h * 0.66); x.lineTo(w / 2 - 30, h * 0.66); x.fill(); x.strokeStyle = '#e8c890'; x.lineWidth = 2.4; for (const dx of [-14, 0, 14]) { x.beginPath(); x.moveTo(w / 2 + dx - 5, h * 0.48); x.lineTo(w / 2 + dx + 5, h * 0.4); x.stroke(); } });
  TX.loafSign.wrapS = TX.loafSign.wrapT = THREE.ClampToEdgeWrapping;
  // The forge's: a horseshoe, black on grey.
  TX.shoeSign = canvasTex(96, 96, (x, w, h) => { x.fillStyle = '#a8a49a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2e2a28'; x.lineWidth = 12; x.beginPath(); x.arc(w / 2, h * 0.45, 24, Math.PI * 0.85, Math.PI * 2.15, false); x.stroke(); x.fillStyle = '#a8a49a'; for (let i = 0; i < 6; i++) { const a = Math.PI * (0.95 + i * 0.22); x.beginPath(); x.arc(w / 2 + Math.cos(a) * 24, h * 0.45 + Math.sin(a) * 24, 2.2, 0, 7); x.fill(); } });
  TX.shoeSign.wrapS = TX.shoeSign.wrapT = THREE.ClampToEdgeWrapping;
  return TX;
}

// ── A box whose texture keeps its size in the world (s: units per repeat), so a long wall and a short one show stones of the same size. ──
function sizedBox(w, h, d, s) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];      // (the faces in BoxGeometry's order: ±x, ±y, ±z)
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / s, uv.getY(i) * dims[f][1] / s); }
  return g;
}
function tbox(parent, w, h, d, x, y, z, mat, s, o) {
  o = o || {};
  const m = new THREE.Mesh(sizedBox(w, h, d, s || 20), mat); m.position.set(x, y, z); if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
  if (o.ink !== 0) m.add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h + 0.2, d + 0.2), T.INKM[0]));
  m.castShadow = o.shadow !== false; m.receiveShadow = true; parent.add(m); return m;
}
// A texture, repeating, as its own copy (so its repeat can differ).
const rep = (t, rx, ry) => { const c = t.clone(); c.needsUpdate = true; c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); return c; };

// The village's still parts merged, after it's built: every mesh not marked to keep (userData.keep, on it or above it: what moves, or changes
// shape) is drawn with the others of its material as one, in the world's frame. (A few thousand boxes, cylinders and outlines become a few
// dozen draws; nothing about how they look changes.)
function mergeStatic(group) {
  group.updateMatrixWorld(true);
  const byMat = new Map(), gone = [];
  group.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material)) return;
    for (let q = o; q; q = q.parent) if (q.userData && q.userData.keep) return;
    const m = o.material; let e = byMat.get(m); if (!e) byMat.set(m, e = { geos: [], shadow: false, recv: false });
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
    if (!g.attributes.normal) g.computeVertexNormals();
    e.geos.push(g); e.shadow = e.shadow || o.castShadow; e.recv = e.recv || o.receiveShadow; gone.push(o);
  });
  for (const o of gone) if (o.parent) o.parent.remove(o);
  for (const [m, e] of byMat) {
    const uv = e.geos.some(g => g.attributes.uv), n = e.geos.reduce((a, g) => a + g.attributes.position.count, 0);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uvs = uv ? new Float32Array(n * 2) : null; let k = 0;
    for (const g of e.geos) { const c = g.attributes.position.count; pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); if (uv && g.attributes.uv) uvs.set(g.attributes.uv.array, k * 2); k += c; g.dispose(); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.computeBoundingSphere(); const mesh = new THREE.Mesh(geo, m); mesh.castShadow = e.shadow; mesh.receiveShadow = e.recv; mesh.matrixAutoUpdate = false; group.add(mesh);
  }
}

function build(scene, opts) {
  opts = opts || {};
  const root_ = new THREE.Group(); scene.add(root_);
  const tx = textures(), vt = tex(), r = rnd(203);
  const lime = toonMap(tx.lime), stone = toonMap(tx.stone), oak = toonMap(tx.oak), oakDk = T.mat('#4a3020'), plank = toonMap(tx.door), ashlar = toonMap(tx.ashlar);
  const thatch = toonMap(vt.thatch), ridgeM = toonMap(vt.ridge), rubble = toonMap(vt.rubble), hurdle = toonMap(vt.hurdle), iron = T.mat('#2e2a28');
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null, exits: [], entries: {} };
  const solids = [];      // (what the camera mustn't go into: each building, as a box up to its roofline)
  const windows = [], smoke = [], lamps = [], glows = [];
  // (the windows' glass: dark by day, lamplit at dusk; one material for all of them, as the wood's village had)
  const winM = new THREE.MeshBasicMaterial({ color: srgb('#2e2a2a') }); windows.push(winM);

  // ── A house, from outside. o: { x, z, ry (a quarter turn at a time: 0, ±π/2, π), w (along its ridge), d, eave, ridge, foot (the stone
  // footing's height), walls ('frame': limewashed daub in an oak frame; 'stone'), storey (where an upper floor's rail runs), doors and windows
  // ([{ side: 'front' | 'back' | 'left' | 'right', at (along the side, looking at it from outside, left to right), y, w, h }]), chimney ({ x, z,
  // w, d }), noFront (an open front: the forge's) }. Its front is its +z, the ridge along x, the gables at the ends. → { g, face(side) }
  function house(o) {
    const g = new THREE.Group(); g.position.set(o.x, 0, o.z); g.rotation.y = o.ry || 0; root_.add(g);
    const W = o.w, D = o.d, E = o.eave, R = o.ridge, F = o.foot || 3, th = 2, wallM = o.walls === 'stone' ? rubble : lime, frame = o.walls !== 'stone';
    // The footing, a little proud of the walls.
    tbox(g, W + 1.4, F, D + 1.4, 0, F / 2, 0, stone, 16);
    // A side's own frame: x along it (from outside, left to right), y up, z out of it. (front +z, back -z, left -x, right +x)
    const SIDES = { front: [0, D / 2, 0, W], back: [0, -D / 2, Math.PI, W], left: [-W / 2, 0, -Math.PI / 2, D], right: [W / 2, 0, Math.PI / 2, D] };
    const faces = {};
    const face = side => { if (faces[side]) return faces[side]; const [x, z, ry, len] = SIDES[side], f = new THREE.Group(); f.position.set(x, 0, z); f.rotation.y = ry; g.add(f); f.userData.len = len; return (faces[side] = f); };
    const holes = { front: [], back: [], left: [], right: [] };
    for (const op of (o.doors || []).map(d => Object.assign({ h: 38 }, d)).concat(o.windows || [])) holes[op.side].push(op);
    // The walls: the long sides to the eaves, the ends up into their gables.
    if (!o.noFront) tbox(g, W, E - F, th, 0, F + (E - F) / 2, D / 2 - th / 2, wallM, 26);
    tbox(g, W, E - F, th, 0, F + (E - F) / 2, -D / 2 + th / 2, wallM, 26);
    for (const sx of [-1, 1]) {
      tbox(g, th, E - F, D - 2 * th, sx * (W / 2 - th / 2), F + (E - F) / 2, 0, wallM, 26);
      const s = new THREE.Shape(); s.moveTo(-D / 2, E); s.lineTo(D / 2, E); s.lineTo(0, R); s.lineTo(-D / 2, E);
      const gg = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: false }); gg.translate(0, 0, -th / 2); gg.rotateY(Math.PI / 2);
      { const uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 26, uv.getY(i) / 26); }
      solid(g, gg, wallM, sx * (W / 2 - th / 2), 0, 0, { ink: 0.08 });
    }
    // The frame, on the outside of the daub: the sill on the footing, the wall plate under the eaves, a rail (at an upper floor, if there is
    // one, or at mid height), posts at the corners and every few paces between (not across a door or window), braces from the corners.
    if (frame) for (const side in SIDES) {
      if (side === 'front' && o.noFront) continue;
      const f = face(side), len = f.userData.len, hs = holes[side], z = 0.5, B = (w, h, x, y, rot) => box(f, w, h, 1.0, x, y, z, oak, { shadow: false, rot: rot ? [0, 0, rot] : null });
      B(len + 1.6, 1.6, 0, F + 0.8); B(len + 1.6, 1.8, 0, E - 0.9);
      const railY = o.storey || E * 0.56, inHole = (x, y) => hs.some(h => Math.abs(x - h.at) < h.w / 2 + 1.4 && (y == null || (y > (h.y || 0) - 1 && y < (h.y || 0) + h.h + 1)));
      // (the rail, broken where a door or window is)
      { let x0 = -len / 2; const cuts = hs.filter(h => railY > (h.y || 0) - 1 && railY < (h.y || 0) + h.h + 1).map(h => [h.at - h.w / 2 - 1.2, h.at + h.w / 2 + 1.2]).sort((a, b) => a[0] - b[0]);
        for (const [a, b] of cuts.concat([[len / 2, len / 2]])) { if (a - x0 > 1) B(a - x0, 1.2, (a + x0) / 2, railY); x0 = Math.max(x0, b); } }
      const posts = [-len / 2 + 0.9, len / 2 - 0.9]; for (let p = -len / 2 + 16; p < len / 2 - 8; p += 16) if (!inHole(p)) posts.push(p);
      for (const p of posts) B(1.6, E - F - 2.6, p, (E + F) / 2);
      for (const sx of [-1, 1]) { const x0 = sx * (len / 2 - 1.6), x1 = sx * (len / 2 - 11), y0 = E - 14, y1 = E - 2; if (!inHole(x1) && !inHole(x0 - sx * 4)) B(Math.hypot(x1 - x0, y1 - y0), 1.1, (x0 + x1) / 2, (y0 + y1) / 2, Math.atan2(y1 - y0, x1 - x0)); }
      if (side === 'left' || side === 'right') { box(f, 1.4, R - E - 3, 1.0, 0, (R + E) / 2 - 1.5, z, oak, { shadow: false }); box(f, D * 0.5, 1.2, 1.0, 0, E + (R - E) * 0.48, z, oak, { shadow: false }); }
    }
    // Doors and windows, set into their sides.
    for (const side in holes) for (const op of holes[side]) (op.y == null ? door : win)(face(side), op);
    // The thatch: two thick slopes from the ridge out past the eaves and the gables, a rounded lip along each eave, and the ridge capped.
    const a = Math.atan2(R - E, D / 2), OV = 6, GO = 5, TH = 8, len = D / 2 / Math.cos(a) + OV;      // (thick, as thatch is: a hand's length of straw and more)
    for (const sz of [-1, 1]) {
      const lip = new V3(0, E - OV * Math.sin(a), sz * (D / 2 + OV * Math.cos(a))), top = new V3(0, R, 0), mid = lip.clone().lerp(top, 0.5), n = new V3(0, Math.cos(a), sz * Math.sin(a));
      mid.addScaledVector(n, TH / 2 - 0.4);
      const m = tbox(g, W + 2 * GO, TH, len, mid.x, mid.y, mid.z, thatch, 34, { rot: [sz * a, 0, 0] });
      m.material = m.material.clone(); m.material.map = rep(vt.thatch, (W + 2 * GO) / 34, len / 34);
      const lipG = new THREE.CylinderGeometry(TH * 0.62, TH * 0.62, W + 2 * GO, 14); lipG.rotateZ(Math.PI / 2);
      solid(g, lipG, thatch, 0, lip.y + n.y * (TH / 2 - 0.6), lip.z + n.z * (TH / 2 - 0.6), { ink: 0.12 });
    }
    { const rg = new THREE.CylinderGeometry(4.6, 4.6, W + 2 * GO + 0.6, 16); rg.rotateZ(Math.PI / 2); rg.scale(1, 0.75, 1);      // (the ridge, capped: a roll of straw along it, the pattern cut in its sides)
      solid(g, rg, toonMap(rep(vt.ridge, (W + 2 * GO) / 60, 1)), 0, R + TH * 0.72, 0, { ink: 0.1 }); }
    // The chimney: a stone stack up through the thatch past the ridge, a cap, and smoke.
    if (o.chimney) { const c = o.chimney, cw = c.w || 7, cd = c.d || 7, top = R + 9;
      tbox(g, cw, top, cd, c.x, top / 2, c.z, ashlar, 12); tbox(g, cw + 1.6, 1.4, cd + 1.6, c.x, top + 0.7, c.z, ashlar, 12);
      for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(T.ell(2.4, 2.4, 2.4, 8, 6), new THREE.MeshBasicMaterial({ color: srgb('#cfcac4'), transparent: true, opacity: 0.45, depthWrite: false })); p.userData.keep = true; g.add(p); smoke.push({ m: p, base: new V3(c.x, top + 2, c.z), ph: k / 5 + r() * 0.1 }); } }
    // (where she can't go: the footing's box, in the village's frame; and where the camera can't: up to the ridge)
    const cs = Math.abs(Math.cos(o.ry || 0)) > 0.5, hw = (cs ? W : D) / 2 + 0.7, hd = (cs ? D : W) / 2 + 0.7;
    const ob = { x0: o.x - hw, x1: o.x + hw, z0: o.z - hd, z1: o.z + hd }; world.obstacles.push(ob);
    solids.push({ x0: ob.x0 - 1.5, x1: ob.x1 + 1.5, z0: ob.z0 - 1.5, z1: ob.z1 + 1.5, top: R + 6, eave: E, cx: o.x, cz: o.z, ry: o.ry || 0, W: W + 8, D: D + 2 * OV, E, R: R + 6 });
    return { g, face, W, D, E, R };
  }
  // A door, in a side's frame (op: { at, w, h, colour, open (one that opens: hers) }): planked, ledged, with strap hinges and a ring latch, an oak
  // frame and lintel, a stone step before it, and a dark doorway behind (seen when it's open).
  function door(f, op) {
    const w = op.w || 12, h = op.h || 38, d = new THREE.Group(); d.position.set(op.at, 3, 0); f.add(d);      // (38: clear for the tallest of them)
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: srgb('#24180f') })); back.position.set(0, h / 2, -1.6); d.add(back);
    const hinge = new THREE.Group(); hinge.position.set(-w / 2, 0, 0.1); d.add(hinge);
    const leafM = op.colour ? T.mat(op.colour) : plank, leaf = box(hinge, w, h, 1.2, w / 2, h / 2, -0.2, leafM, { shadow: false });
    for (const y of [-h / 2 + 5, h / 2 - 5]) { box(leaf, w - 1, 1.4, 0.8, 0, y, 0.8, oak, { ink: 0.04 }); box(leaf, w * 0.7, 0.5, 0.4, -w * 0.12, y + 1.3, 1.0, iron, { ink: 0 }); }
    box(leaf, 1.1, h * 0.62, 0.8, 0, 0, 0.8, oak, { rot: [0, 0, 0.55], ink: 0.04 });
    solid(leaf, new THREE.TorusGeometry(0.9, 0.18, 6, 12), iron, w / 2 - 2, 0, 1.2, { ink: 0.04 });
    box(d, w + 3.4, 1.8, 1.8, 0, h + 0.9, 0.6, oak, { shadow: false }); for (const sx of [-1, 1]) box(d, 1.6, h + 0.8, 1.8, sx * (w / 2 + 0.8), h / 2, 0.6, oak, { shadow: false });
    tbox(d, w + 5, 1.2, 4, 0, -2.4, 2.2, stone, 10);      // (the step)
    return d;
  }
  // A window (op: { at, y, w, h, shutters }): lamplit glass (dark by day), an oak frame with a mullion and a transom, a sill, and shutters open
  // against the wall.
  function win(f, op) {
    const w = op.w || 10, h = op.h || 9, y = op.y || 16, gp = new THREE.Group(); gp.position.set(op.at, y + h / 2, 0); f.add(gp);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), winM); glass.position.z = 0.15; gp.add(glass);
    for (const [ww, hh, x, yy] of [[w + 2.4, 1.2, 0, h / 2 + 0.6], [w + 2.4, 1.2, 0, -h / 2 - 0.6], [1.2, h + 2.4, -w / 2 - 0.6, 0], [1.2, h + 2.4, w / 2 + 0.6, 0], [0.7, h, 0, 0], [w, 0.6, 0, h * 0.18]])
      box(gp, ww, hh, 1.0, x, yy, 0.6, oak, { shadow: false, ink: 0.05 });
    box(gp, w + 4, 0.9, 2.6, 0, -h / 2 - 1.4, 1.2, oak, { shadow: false });
    if (op.shutters !== false) for (const sx of [-1, 1]) { const sh = box(gp, w / 2 + 0.6, h + 1.6, 0.6, sx * (w * 0.75 + 1.6), 0, 0.5, plank, { shadow: false, ink: 0.05 }); box(sh, w / 2 - 0.6, 0.7, 0.4, 0, h * 0.28, 0.4, oakDk, { ink: 0 }); box(sh, w / 2 - 0.6, 0.7, 0.4, 0, -h * 0.28, 0.4, oakDk, { ink: 0 }); }
    if (op.box) { box(gp, w + 1, 2.6, 2.4, 0, -h / 2 - 3.2, 2.4, oakDk, { ink: 0.04 }); for (let k = 0; k < 7; k++) solid(gp, T.ell(0.9, 0.9, 0.9, 6, 4), T.mat(['#d84a5a', '#f2d04a', '#e8e0f0', '#b05ad0'][k % 4]), -w / 2 + 1 + k * (w - 2) / 6, -h / 2 - 1.4, 2.6, { ink: 0 }); }
  }

  // ── The ground: grass everywhere; the green's turf; the lanes of trodden earth.
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), toonMap(vt.grass)); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; g.receiveShadow = true; root_.add(g); }
  const GREEN = { x: 0, z: 22, rx: 150, rz: 96 };
  { const gg = new THREE.CircleGeometry(1, 64); gg.scale(GREEN.rx, GREEN.rz, 1); const m = new THREE.Mesh(gg, toonMap(vt.turf)); m.rotation.x = -Math.PI / 2; m.position.set(GREEN.x, 0.02, GREEN.z); m.receiveShadow = true; root_.add(m); }
  // A lane: a ribbon of earth along a smooth curve through its points, w wide. → its samples (for keeping to it, and for what stands along it)
  const lanes = [];
  function lane(pts, w) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new V3(x, 0, z)), false, 'centripetal'), L = curve.getLength(), N = Math.max(8, Math.ceil(L / 6)), S = curve.getSpacedPoints(N);
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) { const d = S[Math.min(N, i + 1)].clone().sub(S[Math.max(0, i - 1)]).setY(0).normalize(), side = new V3(d.z, 0, -d.x), ww = w / 2 + 0.6 * Math.sin(i * 0.41);
      for (const sx of [-1, 1]) { const p = S[i].clone().addScaledVector(side, sx * ww); pos.push(p.x, 0.05 + lanes.length * 0.004, p.z); uv.push(sx < 0 ? 0 : 1, i / N * L / 16); } }
    for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, toonMap(vt.dirt)); m.receiveShadow = true; root_.add(m); lanes.push({ S, w }); return S;
  }

  // ── The places. One street runs through the village, from the meadow gate in the north-west (and the wood beyond) past the green to the
  // east gate and the farms; the green lies south of it, a lane looping round its far side, and from that the lane south to the mill. The
  // houses face the street and the green, close along them, their gardens behind. (Each house: its centre; ry, which way its front faces.)
  // Maren's cottage, nearest the wood: the room's own walls (x -63..54, z -36..44 inside, its floor a step below the ground outside), her door on
  // its west end near the front, a window beside it and one on the east end, the hearth's chimney on the front wall. (Inside, a point (x, z) of
  // the room is here at (HOME.x + x + 4.5, HOME.z + z - 4).)
  const HOME = { x: -286, z: -330 };
  const home = house({ x: HOME.x, z: HOME.z, w: 117 + 4, d: 80 + 4, eave: 43, ridge: 83, walls: 'frame',
    doors: [{ side: 'left', at: 31 - 4, w: 13, open: true }],      // (left side, looking at it from the west: along +z; inside its door is at z 31)
    windows: [{ side: 'left', at: 6 - 4, y: 14, w: 14, h: 12, box: true }, { side: 'right', at: -(8 - 4), y: 14, w: 14, h: 12, box: true },      // (where they are inside: centred 27 up from her floor, which is 7 below the ground)
      { side: 'front', at: 30, y: 16, w: 10, h: 9 }, { side: 'back', at: 20, y: 17, w: 10, h: 9 }],
    chimney: { x: -2 + 4.5, z: (80 + 4) / 2 - 3, w: 10, d: 7 } });
  // Her neighbours' along the street toward the green: a small cottage, roses round its door.
  const nextDoor = house({ x: -150, z: -226, w: 86, d: 62, eave: 44, ridge: 78, walls: 'frame',
    doors: [{ side: 'front', at: -14, w: 12, colour: '#7a3a3a' }], windows: [{ side: 'front', at: 16, y: 16, w: 12, h: 10, box: true }, { side: 'left', at: 0, y: 16, w: 9, h: 8 }],
    chimney: { x: 30, z: 0, w: 8, d: 8 } });
  // The inn, Mistress Abney's: across the street from the green, the biggest building in the village, two floors under its thatch, its sign on a
  // bracket over the street.
  const inn = house({ x: 22, z: -222, w: 150, d: 84, eave: 82, ridge: 122, walls: 'frame', storey: 45,
    doors: [{ side: 'front', at: -6, w: 14, colour: '#3e5a3a' }],
    windows: [-58, -32, 22, 50].map(at => ({ side: 'front', at, y: 15, w: 12, h: 11 })).concat([-50, -20, 10, 40].map(at => ({ side: 'front', at, y: 56, w: 11, h: 10, shutters: false })))
      .concat([{ side: 'left', at: -10, y: 17, w: 10, h: 9 }, { side: 'right', at: 10, y: 17, w: 10, h: 9 }, { side: 'left', at: 12, y: 58, w: 9, h: 8, shutters: false }]),
    chimney: { x: -75 + 6, z: 0, w: 9, d: 9 } });
  // Past the inn, on the same side: a cottage.
  // The Pennocks' cottage, past the inn: home, a step up the street from the bakery.
  const ne = house({ x: 196, z: -202, w: 90, d: 64, eave: 44, ridge: 78, walls: 'frame',
    doors: [{ side: 'front', at: -10, w: 12 }], windows: [{ side: 'front', at: 18, y: 16, w: 12, h: 10 }, { side: 'right', at: 0, y: 16, w: 9, h: 8 }], chimney: { x: 34, z: 0, w: 8, d: 8 } });
  // The bakery, Mistress Pennock's: on the street at the green's east end, facing it; the bread oven a stone dome against its east end, a sign
  // of a loaf, and the window's board let down as a counter.
  const bakery = house({ x: 300, z: 22, ry: Math.PI, w: 104, d: 74, eave: 46, ridge: 84, walls: 'frame',
    doors: [{ side: 'front', at: 14, w: 13, colour: '#7a4a2a' }],
    windows: [{ side: 'front', at: -24, y: 12, w: 18, h: 12, shutters: true }, { side: 'back', at: 0, y: 17, w: 10, h: 9 }, { side: 'right', at: 0, y: 17, w: 10, h: 9 }],
    chimney: { x: 30, z: -12, w: 8, d: 8 } });
  // The forge, Master Ferrier's: stone, its front open on the loop lane east of the green: the hearth glowing inside, the anvil, the trough.
  const forge = house({ x: 292, z: 190, ry: -Math.PI / 2, w: 96, d: 74, eave: 44, ridge: 78, walls: 'stone', noFront: true,
    windows: [{ side: 'left', at: 0, y: 17, w: 9, h: 8, shutters: false }], chimney: { x: -30, z: -24, w: 12, d: 12 } });
  // The Thatchers' (Agnes's): south of the green, across the loop lane.
  const thatchers = house({ x: -16, z: 238, ry: Math.PI, w: 100, d: 70, eave: 45, ridge: 82, walls: 'frame',
    doors: [{ side: 'front', at: 20, w: 12, colour: '#5a6a8a' }],
    windows: [{ side: 'front', at: -20, y: 16, w: 12, h: 10, box: true }, { side: 'right', at: 0, y: 16, w: 10, h: 9 }],
    chimney: { x: -44, z: 0, w: 8, d: 8 } });
  // The Ferriers' cottage, by the lane south to the mill: home, round the corner from the forge.
  const millLane = house({ x: 196, z: 330, ry: -Math.PI / 2, w: 84, d: 60, eave: 43, ridge: 76, walls: 'frame',
    doors: [{ side: 'front', at: 10, w: 12, colour: '#4a5a3a' }], windows: [{ side: 'front', at: -16, y: 16, w: 11, h: 9 }], chimney: { x: -30, z: 0, w: 8, d: 8 } });
  // The Dunns' (the Watchman's, and Georgie's): west of the green, a lantern on a hook by the door for his rounds.
  const dunns = house({ x: -268, z: 116, ry: Math.PI / 2, w: 96, d: 68, eave: 45, ridge: 80, walls: 'frame',
    doors: [{ side: 'front', at: -16, w: 12, colour: '#6a3a2a' }],
    windows: [{ side: 'front', at: 18, y: 16, w: 12, h: 10 }, { side: 'left', at: 0, y: 16, w: 10, h: 9 }],
    chimney: { x: 40, z: 0, w: 8, d: 8 } });
  // A cottage on the green's west side, its garden full of flowers; and one south-west, by the Thatchers'.
  const west = house({ x: -282, z: -44, ry: Math.PI / 2, w: 92, d: 66, eave: 44, ridge: 78, walls: 'frame',
    doors: [{ side: 'front', at: 8, w: 12, colour: '#8a6a3a' }],
    windows: [{ side: 'front', at: -22, y: 16, w: 12, h: 10, box: true }, { side: 'back', at: 0, y: 16, w: 10, h: 9 }],
    chimney: { x: -36, z: 0, w: 8, d: 8 } });
  const sw = house({ x: -150, z: 250, ry: Math.PI, w: 84, d: 60, eave: 43, ridge: 74, walls: 'stone',
    doors: [{ side: 'front', at: -12, w: 12, colour: '#5a4a3a' }], windows: [{ side: 'front', at: 16, y: 15, w: 11, h: 9 }], chimney: { x: 30, z: 0, w: 8, d: 8 } });

  // ── Her door opens (as the room's does, inward), and once it's open, in she goes. ──
  { const f = home.face('left'), d = f.children.find(c => c.isGroup && c.children.some(k => k.isGroup)), hinge = d.children.find(k => k.isGroup);
    const latch = new THREE.Object3D(); latch.position.set(13 / 2 - 2, 0, 1.4); hinge.children[0].add(latch);      // (by the ring, on the leaf's free edge: the leaf's own centre is its origin)
    hinge.userData.keep = true; world.door = { pivot: hinge, latch, open: 0, target: 0, swing: 1.75, name: 'the door', inward: new V3(-1, 0, 0) };      // (inward: the side she stands on to open it, here the lane's)
    root_.updateMatrixWorld(true); const at = d.getWorldPosition(new V3()).setY(0), out = new V3(-1, 0, 0);
    world.exits.push({ name: 'the door', at: at.clone().addScaledVector(out, -1), r: 4.5, when: () => world.door.open > 0.6 });
    world.entries.home = { at: [at.x - 12, at.z], yaw: -Math.PI / 2, camTurn: Math.PI * 0.8 };      // (just out of it, her back to it; the camera before her, a little to one side, her door behind her)
    world.homeDoor = at; }

  // ── The green: the well, the old lime tree with a bench round it, the curfew bell on its frame. ──
  { const wl = new V3(GREEN.x + 46, 0, GREEN.z + 30), g = new THREE.Group(); g.position.copy(wl); root_.add(g);
    solid(g, new THREE.CylinderGeometry(6, 6.6, 6, 18, 1, true), toonMap(rep(vt.rubble, 2, 0.3)), 0, 3, 0, { ink: 0.1 }).material.side = THREE.DoubleSide;
    solid(g, new THREE.TorusGeometry(6.2, 0.9, 6, 18).rotateX(Math.PI / 2), ashlar, 0, 6.2, 0, { ink: 0.06 });
    const water = new THREE.Mesh(new THREE.CircleGeometry(5.6, 18), new THREE.MeshBasicMaterial({ color: srgb('#1e2a30') })); water.rotation.x = -Math.PI / 2; water.position.y = 2; g.add(water);
    for (const sx of [-1, 1]) box(g, 1.4, 16, 1.4, sx * 6.6, 8, 0, oak);
    pole(g, new V3(-7.6, 12, 0), new V3(7.6, 12, 0), 0.7, oak); solid(g, new THREE.CylinderGeometry(0.8, 0.8, 12, 8).rotateZ(Math.PI / 2), oakDk, 0, 12, 0, { ink: 0.05 });
    box(g, 1, 6, 1, 7.6, 11, 1.6, oakDk, { ink: 0.04 });      // (the windlass's handle)
    for (const sz of [-1, 1]) { const rf = box(g, 18, 0.8, 7.4, 0, 17.4, sz * 3.2, plank); rf.rotation.x = sz * 0.55; }
    solid(g, new THREE.CylinderGeometry(1.4, 1.1, 2.2, 10), oakDk, 0, 7.6, 0, { ink: 0.05 }); pole(g, new V3(0, 8.6, 0), new V3(0, 12, 0), 0.06, iron, { ink: 0 });
    world.obstacles.push({ x: wl.x, z: wl.z, r: 8 }); }
  // The lime tree: broad, old, its trunk ringed by a bench.
  const TREE = new V3(GREEN.x - 60, 0, GREEN.z - 6);
  { const g = new THREE.Group(); g.position.copy(TREE); root_.add(g); const bark = toonMap(rep(textures().oak, 2, 3));
    solid(g, new THREE.CylinderGeometry(4.2, 5.6, 46, 14), bark, 0, 23, 0, { ink: 0.14 });
    for (const [a, b] of [[[0, 30, 0], [-14, 52, 6]], [[0, 34, 0], [12, 56, -8]], [[0, 38, 0], [4, 62, 14]]]) pole(g, new V3(...a), new V3(...b), 1.8, bark, { taper: 1.5 });
    const leaf = [T.mat('#5e8a3e'), T.mat('#6f9a46'), T.mat('#7aa24e')], rr = rnd(207);
    for (let k = 0; k < 9; k++) { const an = k / 9 * 6.3 + rr(), d = 10 + rr() * 12, s = 13 + rr() * 8; solid(g, T.ell(s, s * 0.7, s, 14, 10), leaf[k % 3], Math.cos(an) * d, 58 + rr() * 14, Math.sin(an) * d, { ink: 0.16, shadow: true }); }
    solid(g, T.ell(20, 14, 20, 14, 10), leaf[1], 0, 72, 0, { ink: 0.16 });
    // (the bench round it: eight short planks on stumps)
    for (let k = 0; k < 8; k++) { const an = k / 8 * Math.PI * 2, bg = new THREE.Group(); bg.position.set(Math.cos(an) * 10, 0, Math.sin(an) * 10); bg.rotation.y = -an + Math.PI / 2; g.add(bg);
      box(bg, 8.6, 0.9, 3.6, 0, 5.6, 0, plank); for (const sx of [-1, 1]) box(bg, 1, 5.2, 2.6, sx * 3.2, 2.6, 0, oakDk); }
    world.obstacles.push({ x: TREE.x, z: TREE.z, r: 14 });
    for (let k = 0; k < 8; k += 2) { const an = k / 8 * Math.PI * 2 + Math.PI / 8; world.seats.push({ name: 'the bench round the lime tree', at: new V3(TREE.x + Math.cos(an) * 12.2, 5.6, TREE.z + Math.sin(an) * 12.2), facing: Math.atan2(Math.cos(an), Math.sin(an)), kind: 'stool' }); }
  }
  // The curfew bell: a small bell under a little pitched roof, on a frame of two posts, its rope hanging; rung at nine.
  const BELL = new V3(GREEN.x + 92, 0, GREEN.z - 46);
  { const g = new THREE.Group(); g.position.copy(BELL); root_.add(g);
    for (const sx of [-1, 1]) { box(g, 2, 30, 2, sx * 6, 15, 0, oak); box(g, 1.4, 8, 1.4, sx * 6, 4, sx * 2.4, oak, { rot: [sx * 0.5, 0, 0] }); }
    box(g, 15, 1.8, 2.4, 0, 30, 0, oak);
    for (const sz of [-1, 1]) { const rf = tbox(g, 17, 0.9, 6, 0, 34, sz * 2.4, thatch, 16); rf.rotation.x = sz * 0.6; }
    solid(g, new THREE.LatheGeometry([[0.2, 0], [3.0, 0.2], [2.6, 1.2], [1.8, 3.6], [1.6, 4.6], [0.4, 5.0], [0.01, 5.0]].map(([x, y]) => new THREE.Vector2(x, y)), 16), T.mat('#9a7a3a'), 0, 23.6, 0, { ink: 0.06, rot: [Math.PI, 0, 0] });
    pole(g, new V3(0, 23.5, 0.4), new V3(0.6, 6, 1.2), 0.2, T.mat('#c9b48a'), { ink: 0 });
    world.obstacles.push({ x0: BELL.x - 8, x1: BELL.x + 8, z0: BELL.z - 4, z1: BELL.z + 4 }); }

  // ── The lanes: the street, from the meadow gate (to the wood) past Maren's to the green and on to the east gate (the farms); the loop round
  // the green's far side; the lane south (to the mill), ending, like the street's east end, at a gate shut for now; and short paths to doors.
  const GATE = new V3(-550, 0, -550);      // (the meadow gate, in the hedge at the north-west corner: out to the meadow, and the wood across it)
  const STREET = lane([[-566, -556], [-520, -500], [-452, -418], [-396, -340], [-330, -246], [-230, -168], [-110, -128], [20, -122], [150, -116], [270, -84], [380, -40], [480, 24], [600, 54]], 22);
  const LOOP = lane([[-230, -168], [-210, -60], [-196, 60], [-140, 144], [-40, 164], [80, 160], [180, 136], [222, 50], [270, -84]], 18);
  const MILL = lane([[80, 160], [104, 260], [118, 420], [130, 600]], 18);
  lane([[-396, -340], [-370, -318], [-360, -306]], 14);      // (to her door, off the street)
  lane([[-150, -132], [-150, -164], [-164, -192]], 11);      // (next door's)
  lane([[16, -124], [16, -150], [16, -178]], 15);      // (the inn's)
  lane([[186, -112], [186, -142], [186, -168]], 11);      // (the cottage past it)
  lane([[312, -60], [316, -28], [314, -16]], 13);      // (the bakery's, from the street)
  lane([[222, 120], [246, 170], [252, 190]], 18);      // (into the forge's open front)
  lane([[4, 162], [4, 186], [4, 200]], 12);      // (the Thatchers')
  lane([[-160, 160], [-162, 200], [-162, 218]], 11);      // (the south-west cottage's)
  lane([[114, 330], [150, 330], [164, 340]], 11);      // (the mill-lane cottage's)
  lane([[-200, 98], [-224, 100], [-232, 100]], 11);      // (the Dunns')
  lane([[-206, -36], [-236, -36], [-246, -36]], 11);      // (the west cottage's)

  // ── Low walls, hurdle fences and gardens. ──
  const wallSeg = (a, b, h, mat) => { const d = b.clone().sub(a), L = d.length(), m = tbox(root_, L, h, 2.6, (a.x + b.x) / 2, h / 2, (a.z + b.z) / 2, mat, 14); m.rotation.y = -Math.atan2(d.z, d.x);
    const n = Math.ceil(L / 8); for (let i = 0; i <= n; i++) { const p = a.clone().lerp(b, i / n); world.obstacles.push({ x: p.x, z: p.z, r: 2.2 }); } return m; };
  const V = (x, z) => new V3(x, 0, z);
  // (a garden: a hurdle fence round a plot, rows of greens in it, a gap for the gate)
  const veg = [T.mat('#4e7a36'), T.mat('#6a9a3e'), T.mat('#8aa84a')], flowers = ['#d84a5a', '#f2d04a', '#e8e0f0', '#b05ad0', '#f08a40', '#f6f2e6'].map(c => T.mat(c));
  function garden(x0, z0, x1, z1, gap, kind) {
    const pts = [V(x0, z0), V(x1, z0), V(x1, z1), V(x0, z1), V(x0, z0)];
    for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[i + 1], d = b.clone().sub(a), L = d.length();
      const cut = gap && gap.side === i ? [gap.at - 5, gap.at + 5] : null;
      const seg = (s0, s1) => { if (s1 - s0 < 1) return; const p0 = a.clone().addScaledVector(d, s0 / L), p1 = a.clone().addScaledVector(d, s1 / L); const m = tbox(root_, s1 - s0, 5.4, 0.8, (p0.x + p1.x) / 2, 2.9, (p0.z + p1.z) / 2, hurdle, 12, { ink: 0.05 }); m.rotation.y = -Math.atan2(d.z, d.x);
        const n = Math.ceil((s1 - s0) / 8); for (let k = 0; k <= n; k++) { const p = p0.clone().lerp(p1, k / n); world.obstacles.push({ x: p.x, z: p.z, r: 1.6 }); } };
      if (cut) { seg(0, cut[0]); seg(cut[1], L); } else seg(0, L); }
    const rr = rnd(Math.round(Math.abs(x0 * 7 + z0 * 13)) + 11);
    if (kind === 'flowers') for (let k = 0; k < 90; k++) solid(root_, T.ell(1.2, 1.2, 1.2, 6, 4), flowers[k % flowers.length], lerp(x0 + 3, x1 - 3, rr()), 1.8 + rr(), lerp(z0 + 3, z1 - 3, rr()), { ink: 0 });
    else if (kind === 'veg') for (let row = z0 + 6; row < z1 - 4; row += 7) for (let x = x0 + 5; x < x1 - 4; x += 5) solid(root_, T.ell(2 + rr(), 1.6 + rr(), 2 + rr(), 7, 5), veg[Math.floor(rr() * 3)], x, 1.4, row, { ink: 0.04, shadow: false });
  }
  garden(-344, -482, -214, -384, { side: 3, at: 6 }, null);      // (Maren's, behind her cottage: its rows, flowers and beds are js/garden.js's)
  if (root.Garden) root.Garden.build(root_, world);
  garden(-184, -300, -116, -262, { side: 2, at: 20 }, 'flowers');      // (next door's: roses and hollyhocks)
  garden(-360, -90, -322, 0, { side: 1, at: 40 }, 'flowers');      // (the west cottage's)
  garden(-50, 280, 30, 330, { side: 0, at: 20 }, 'veg');      // (the Thatchers')
  garden(-346, 70, -310, 160, { side: 1, at: 30 }, 'veg');      // (the Dunns')
  garden(140, -282, 240, -240, { side: 2, at: 50 }, 'veg');      // (the cottage past the inn)
  // (dry stone walls along the street and the lanes, set back off their edges, with gaps for the paths)
  const along = (S, i0, i1, side, off, h, skip) => { for (let i = i0; i < i1; i += 4) { const a = S[i], b = S[Math.min(i1, i + 4)], d = b.clone().sub(a).normalize(), n = new V3(d.z, 0, -d.x).multiplyScalar(side * off);
      const pa = a.clone().add(n), pb = b.clone().add(n); if (skip && skip.some(q => pa.distanceTo(q) < 22 || pb.distanceTo(q) < 22)) continue; if (solids.some(sd => pa.x > sd.x0 && pa.x < sd.x1 && pa.z > sd.z0 && pa.z < sd.z1)) continue; wallSeg(pa, pb, h, rubble); } };
  along(STREET, 2, 9, 1, 18, 5, [V(-396, -340), V(-230, -168)]);      // (the street's north side, from the meadow gate to the cottages)
  along(STREET, Math.floor(STREET.length * 0.78), STREET.length - 3, -1, 18, 6);      // (and its south side, out toward the east gate)
  along(STREET, Math.floor(STREET.length * 0.8), STREET.length - 3, 1, 18, 6, [V(492, 6)]);      // (a gap in it for the way up to the pinfold)
  along(MILL, Math.floor(MILL.length * 0.45), MILL.length - 3, 1, 16, 5); along(MILL, Math.floor(MILL.length * 0.45), MILL.length - 3, -1, 16, 5);
  // (an orchard north of the street past the inn: old apple trees in rows, windfalls under them)
  const orchard = []; for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) orchard.push([300 + k * 46 + (i % 2) * 18, -300 + i * 40]);

  // ── The inn's front: the sign on its bracket, benches and a trestle table, barrels by the door, a lantern. ──
  { const f = inn.face('front');
    const br = new THREE.Group(); br.position.set(38, 56, 0); f.add(br); box(br, 1.2, 1.2, 14, 0, 0, 7, iron, { ink: 0.04 }); pole(br, new V3(0, -6, 0.6), new V3(0, 0, 9), 0.4, iron, { ink: 0 });
    const sg = new THREE.Group(); sg.position.set(0, -6.5, 10); br.add(sg); for (const zz of [-0.35, 0.35]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: vt.sign })); p.scale.set(12, 9, 1); p.position.z = zz; p.rotation.y = Math.PI / 2 + (zz < 0 ? Math.PI : 0); sg.add(p); }
    box(sg, 0.5, 9.6, 12.6, 0, 0, 0, oakDk, { ink: 0.05 }); sg.children.forEach(c => { if (c.isMesh && c.geometry.type === 'PlaneGeometry') c.position.x = (c.position.z < 0 ? -0.3 : 0.3), c.position.z = 0; });
    for (const at of [-58, -32, 24]) { const b = new THREE.Group(); b.position.set(at, 0, 9); f.add(b); box(b, 18, 1, 4, 0, 5.6, 0, plank); for (const sx of [-1, 1]) box(b, 1.2, 5.2, 3, sx * 7, 2.6, 0, oakDk); }
    { const t = new THREE.Group(); t.position.set(-45, 0, 19); f.add(t); box(t, 22, 1.2, 9, 0, 11, 0, plank); for (const sx of [-1, 1]) box(t, 1.4, 11, 7, sx * 8, 5.5, 0, oakDk);
      solid(t, new THREE.CylinderGeometry(1.1, 0.9, 2.6, 10), T.mat('#8a6a4a'), -4, 12.9, 0, { ink: 0.04 }); solid(t, new THREE.CylinderGeometry(1.1, 0.9, 2.6, 10), T.mat('#8a6a4a'), 3, 12.9, 1, { ink: 0.04 }); }
    for (const [x, z] of [[10, 5], [14, 9], [11.5, 13]]) { const bl = solid(f, new THREE.CylinderGeometry(3, 3, 7, 12), toonMap(rep(textures().oak, 1, 0.6)), x, 3.5, z, { ink: 0.08 }); for (const y of [-2.4, 2.4]) solid(bl, new THREE.TorusGeometry(3.05, 0.25, 4, 16).rotateX(Math.PI / 2), iron, 0, y, 0, { ink: 0 }); }
    const ln = new THREE.Group(); ln.position.set(-15, 36, 3); f.add(ln); box(ln, 0.6, 0.6, 3, 0, 2, -1.4, iron, { ink: 0 }); box(ln, 2.6, 3.4, 2.6, 0, 0, 0, iron, { ink: 0.04 });
    const lg = new THREE.Mesh(new THREE.BoxGeometry(2, 2.6, 2.7), new THREE.MeshBasicMaterial({ color: srgb('#3a3028') })); ln.add(lg); lamps.push(lg.material);
    root_.updateMatrixWorld(true); const fp = new V3(-45, 0, 19).applyMatrix4(f.matrixWorld); world.obstacles.push({ x0: fp.x - 12, x1: fp.x + 12, z0: fp.z - 6, z1: fp.z + 6 });
    for (const at of [-58, -32, 24]) { const p = new V3(at, 0, 9).applyMatrix4(f.matrixWorld); world.obstacles.push({ x0: p.x - 9, x1: p.x + 9, z0: p.z - 2.5, z1: p.z + 2.5 }); world.seats.push({ name: 'the bench outside the inn', at: p.clone().setY(5.6), facing: 0, kind: 'stool' }); }
    const bp = new V3(12, 0, 9).applyMatrix4(f.matrixWorld); world.obstacles.push({ x: bp.x, z: bp.z, r: 7 }); }

  // ── The bakery: the oven, a domed stone hump against its south end with its own little flue; loaves set out on the board under the window. ──
  { const f = bakery.face('right'), g = new THREE.Group(); g.position.set(0, 0, 0); f.add(g);
    solid(g, new THREE.SphereGeometry(14, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.05, 0.9), toonMap(rep(vt.rubble, 2, 1)), 0, 3, 4, { ink: 0.12 });
    tbox(g, 30, 3, 26, 0, 1.5, 4, stone, 12);
    tbox(g, 4, 18, 4, 6, 18, 6, ashlar, 8); solid(g, new THREE.CylinderGeometry(0.8, 0.8, 6, 8), iron, -8, 6, 16, { ink: 0.04, rot: [0, 0, 0.3] });
    root_.updateMatrixWorld(true); const c = new V3(0, 0, 4).applyMatrix4(f.matrixWorld); world.obstacles.push({ x: c.x, z: c.z, r: 15 });
    for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(T.ell(1.6, 1.6, 1.6, 8, 6), new THREE.MeshBasicMaterial({ color: srgb('#d8d2ca'), transparent: true, opacity: 0.4, depthWrite: false })); p.userData.keep = true; g.add(p); smoke.push({ m: p, base: new V3(6, 28, 6), ph: k / 4 }); }
    const fr = bakery.face('front'), sg = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: vt.loafSign })); sg.position.set(-24, 34, 1.4); fr.add(sg); box(fr, 13.2, 13.2, 0.6, -24, 34, 0.9, oakDk, { ink: 0.04 });
    // (the window's board, let down as a counter, loaves on it)
    box(fr, 22, 1, 6, -24, 11.6, 3.2, plank); for (const sx of [-1, 1]) pole(fr, new V3(-24 + sx * 9, 0.6, 5.6), new V3(-24 + sx * 9, 11.2, 5.6), 0.4, oakDk, { ink: 0.03 });
    for (let k = 0; k < 4; k++) solid(fr, T.ell(1.8, 1.1, 1.2, 10, 6), T.mat(k % 2 ? '#b8743a' : '#c98a4a'), -33 + k * 2.8, 13, 3.2, { ink: 0.05 });
    // (and Mistress Pennock's pies, set out to cool: one of them can be taken, which is the trouble)
    world.pies = [];
    for (const x of [-22, -18.2, -14.4]) { const pg = new THREE.Group(); pg.position.set(x, 12.1, 3.2); pg.userData.keep = true; fr.add(pg);
      solid(pg, new THREE.CylinderGeometry(1.75, 1.5, 0.7, 14), T.mat('#8a7a6a'), 0, 0.35, 0, { ink: 0.04 }); solid(pg, new THREE.SphereGeometry(1.7, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.45, 1), T.mat('#d89a50'), 0, 0.65, 0, { ink: 0.04 });
      for (let k = 0; k < 3; k++) box(pg, 0.2, 0.1, 1.6, (k - 1) * 0.6, 1.4, 0, T.mat('#a8642e'), { ink: 0, rot: [0, 0.5, 0] });
      world.pies.push(pg); }
    root_.updateMatrixWorld(true); const cp = new V3(-24, 0, 4).applyMatrix4(fr.matrixWorld); world.obstacles.push({ x0: cp.x - 4, x1: cp.x + 4, z0: cp.z - 12, z1: cp.z + 12 }); }

  // ── The forge: the open bay, the hearth inside it glowing, the anvil on its stump out at the front, a trough, a cart wheel against the wall. ──
  { const f = forge.face('front');
    for (const at of [-46, -16, 16, 46]) box(f, 2.6, 41, 2.6, at, 23.5, -1, oak);
    box(f, 96, 2.4, 3, 0, 44, -1, oak);
    const inside = new THREE.Group(); inside.position.set(0, 0, -20); f.add(inside);
    tbox(inside, 22, 10, 14, -26, 5, -8, toonMap(rep(vt.rubble, 1, 0.6)), 10);
    const coals = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 8), new THREE.MeshBasicMaterial({ color: srgb('#ff7a2a') })); coals.position.set(-26, 10.6, -8); inside.add(coals); glows.push(coals.material);
    tbox(inside, 18, 22, 10, -26, 21, -12, ashlar, 10);      // (the hood over it)
    { const bl = new THREE.Group(); bl.position.set(-6, 9, -14); inside.add(bl); solid(bl, T.ell(6, 1.6, 4, 12, 6), T.mat('#5a3e26'), 0, 0, 0, { ink: 0.06 }); box(bl, 1, 1, 9, 0, 1, 6, oakDk, { ink: 0.03 }); }
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(60, 26), new THREE.MeshBasicMaterial({ color: srgb('#ffb060'), transparent: true, opacity: 0.12, depthWrite: false })); glow.position.set(-10, 13, -2); inside.add(glow); glows.push({ glow: glow.material });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(94, 44), new THREE.MeshBasicMaterial({ color: srgb('#2a1e16') })); back.position.set(0, 22, -14); inside.add(back);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(92, 40), T.mat('#5a4a3a')); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.1, 0); inside.add(floor);
    // (the anvil, on its stump, at the front of the bay; the slack tub; the wheel)
    { const a = new THREE.Group(); a.position.set(8, 0, 10); f.add(a); solid(a, new THREE.CylinderGeometry(3.4, 3.8, 9, 12), toonMap(rep(textures().oak, 1, 1)), 0, 4.5, 0, { ink: 0.08 });
      box(a, 9, 2.2, 3.4, 0, 10.4, 0, iron, { ink: 0.05 }); box(a, 4, 2.2, 2.6, 0, 8.4, 0, iron, { ink: 0.04 }); solid(a, new THREE.ConeGeometry(1.4, 5, 8).rotateZ(-Math.PI / 2), iron, 6.6, 10.6, 0, { ink: 0.04 }); }
    { const t = new THREE.Group(); t.position.set(-30, 0, 9); f.add(t); tbox(t, 16, 6, 7, 0, 3, 0, toonMap(rep(textures().oak, 1, 1)), 10); const w = new THREE.Mesh(new THREE.PlaneGeometry(14.6, 5.6), new THREE.MeshBasicMaterial({ color: srgb('#3a4a52') })); w.rotation.x = -Math.PI / 2; w.position.y = 5.7; t.add(w); }
    { const wh = new THREE.Group(); wh.position.set(50, 9.6, 6); wh.rotation.set(0.2, 0.4, 0); f.add(wh); solid(wh, new THREE.TorusGeometry(9, 0.8, 6, 24), oakDk, 0, 0, 0, { ink: 0.05 }); for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI; box(wh, 18, 0.8, 0.8, 0, 0, 0, oak, { rot: [0, 0, an], ink: 0.03 }); } solid(wh, new THREE.CylinderGeometry(1.8, 1.8, 2.4, 10).rotateX(Math.PI / 2), oakDk, 0, 0, 0, { ink: 0.04 }); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: vt.shoeSign })); sg.position.set(-31, 36, 1.8); f.add(sg);
    // (in the open bay she can't go further than its front)
    root_.updateMatrixWorld(true);
    for (const [x, z, rr] of [[8, 10, 4.6], [50, 6, 4]]) { const p = new V3(x, 0, z).applyMatrix4(f.matrixWorld); world.obstacles.push({ x: p.x, z: p.z, r: rr }); }
    { const p = new V3(-30, 0, 9).applyMatrix4(f.matrixWorld); world.obstacles.push({ x0: p.x - 9, x1: p.x + 9, z0: p.z - 4.5, z1: p.z + 4.5 }); } }
  // The Watchman's lantern, on a hook by the Dunns' door.
  { const f = dunns.face('front'), ln = new THREE.Group(); ln.position.set(-26, 32, 2); f.add(ln); box(ln, 2.4, 3.2, 2.4, 0, 0, 0, iron, { ink: 0.04 }); box(ln, 0.5, 2.6, 0.5, 0, 2.8, -1, iron, { ink: 0 });
    const lg = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 2.5), new THREE.MeshBasicMaterial({ color: srgb('#3a3028') })); ln.add(lg); lamps.push(lg.material); }
  // Woodpiles and a water butt by Maren's door; a handcart outside the west cottage.
  { const f = home.face('left'); for (let k = 0; k < 9; k++) { const row = Math.floor(k / 3), col = k % 3; solid(f, new THREE.CylinderGeometry(1.5, 1.5, 9, 9).rotateX(Math.PI / 2), toonMap(rep(textures().oak, 1, 1)), -30 + col * 3.1, 1.6 + row * 2.7, 6, { ink: 0.05 }); }      // (the logs, stacked against the wall toward the back, clear of the door)
    const bt = solid(f, new THREE.CylinderGeometry(3, 3, 8, 12), toonMap(rep(textures().oak, 1, 0.6)), -16, 4, 4, { ink: 0.08 });
    root_.updateMatrixWorld(true); for (const [x, z, rr] of [[-27, 6, 6], [-16, 4, 3.6]]) { const p = new V3(x, 0, z).applyMatrix4(f.matrixWorld); world.obstacles.push({ x: p.x, z: p.z, r: rr }); } }
  { const c = new THREE.Group(); c.position.set(-236, 0, 12); c.rotation.y = 0.5; root_.add(c); tbox(c, 14, 4, 9, 0, 6, 0, plank, 8);
    for (const sz of [-1, 1]) { solid(c, new THREE.TorusGeometry(4, 0.6, 6, 18), oakDk, -2, 4.4, sz * 5, { ink: 0.05 }); }
    pole(c, new V3(7, 6, -2.5), new V3(17, 2, -2.5), 0.4, oak); pole(c, new V3(7, 6, 2.5), new V3(17, 2, 2.5), 0.4, oak); world.obstacles.push({ x: -236, z: 12, r: 9 }); }

  // ── The stocks, at the green's east end: two oak posts, a pair of boards with holes for the ankles (the upper lifts, on its pin), and a plank
  // seat behind them, weathered. (Only to look at, for now.)
  { const S0 = new V3(GREEN.x + 112, 0, GREEN.z + 6), g = new THREE.Group(); g.position.copy(S0); g.rotation.y = -0.35; root_.add(g); const old = T.mat('#6e5a44');
    for (const sx of [-1, 1]) { box(g, 2.4, 13, 2.4, sx * 11, 6.5, 0, old); box(g, 3, 1.2, 3, sx * 11, 13.4, 0, old); }
    const holes = canvasTex(128, 32, (x, w, h) => { x.fillStyle = '#7a6448'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(40,28,18,0.25)'; for (let i = 0; i < 8; i++) x.fillRect(0, i * 4 + 1, w, 1);
      x.fillStyle = '#2a1e14'; for (const cx of [22, 46, 82, 106]) { x.beginPath(); x.arc(cx, h, 7, Math.PI, 0); x.fill(); } });
    holes.wrapS = holes.wrapT = THREE.ClampToEdgeWrapping;
    const lower = box(g, 20, 3, 1.4, 0, 4.2, 0, old), upper = box(g, 20, 3, 1.4, 0, 7.4, 0, old);
    for (const [bd, flip] of [[lower, false], [upper, true]]) for (const sz of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 3), new THREE.MeshBasicMaterial({ map: holes })); f.position.z = sz * 0.75; if (sz < 0) f.rotation.y = Math.PI; if (flip) f.rotation.z = Math.PI; bd.add(f); }
    solid(g, new THREE.CylinderGeometry(0.35, 0.35, 2.6, 6).rotateX(Math.PI / 2), T.mat('#3a3634'), 9.4, 7.4, 0, { ink: 0.03 });
    box(g, 22, 1, 4, 0, 4.2, -6, old); for (const sx of [-1, 1]) box(g, 1.4, 4, 3, sx * 9, 2, -6, old);
    world.obstacles.push({ x: S0.x, z: S0.z - 2, r: 12 }); }

  // ── The pond, on the green's south side: still water in a grassy hollow, reeds at its edge, stones, and the ducks.
  const ducks = [];
  const POND = new V3(GREEN.x - 22, 0, GREEN.z + 50);
  { const P0 = POND, RX = 30, RZ = 19, g = new THREE.Group(); g.position.copy(P0); root_.add(g);
    const bank = new THREE.Mesh(new THREE.CircleGeometry(1, 40).scale(RX + 5, RZ + 4, 1), T.mat('#6a7a3e')); bank.rotation.x = -Math.PI / 2; bank.position.y = 0.06; bank.receiveShadow = true; g.add(bank);
    const pondT = canvasTex(128, 128, (x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2); gr.addColorStop(0, '#3e5e6a'); gr.addColorStop(1, '#5a7e7a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      const r2 = rnd(221); for (let i = 0; i < 26; i++) { x.strokeStyle = 'rgba(220,240,240,.3)'; x.lineWidth = 1.5; x.beginPath(); const y = r2() * h; x.moveTo(r2() * w, y); x.lineTo(r2() * w + 18, y + 1); x.stroke(); } });
    pondT.wrapS = pondT.wrapT = THREE.ClampToEdgeWrapping;
    const water = new THREE.Mesh(new THREE.CircleGeometry(1, 40).scale(RX, RZ, 1), new THREE.MeshBasicMaterial({ map: pondT, color: srgb('#c8dce0') })); water.rotation.x = -Math.PI / 2; water.position.y = 0.12; g.add(water);
    const rr = rnd(223), reed = T.mat('#5e7a36'), mace = T.mat('#6a4428');
    for (let k = 0; k < 36; k++) { const a = rr() * Math.PI * 2; if (Math.cos(a) > 0.3 && Math.sin(a) > -0.2) continue; const x = Math.cos(a) * (RX + 1 - rr() * 3), z = Math.sin(a) * (RZ + 1 - rr() * 3), h = 6 + rr() * 5;
      pole(g, new V3(x, 0, z), new V3(x + (rr() - 0.5) * 1.6, h, z + (rr() - 0.5) * 1.6), 0.18, reed, { ink: 0.03 }); if (k % 3 === 0) solid(g, new THREE.CylinderGeometry(0.45, 0.45, 2.2, 6), mace, x, h - 0.6, z, { ink: 0.03 }); }
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2 + rr() * 0.3, s1 = 1.6 + rr() * 1.4; solid(g, new THREE.DodecahedronGeometry(1, 0), T.mat('#9a968a'), Math.cos(a) * (RX + 3), s1 * 0.4, Math.sin(a) * (RZ + 2.5), { ink: 0.05, rot: [rr(), rr(), 0] }).scale.set(s1, s1 * 0.6, s1); }
    // (the ducks: white, orange-billed, drifting on slow circles)
    for (let k = 0; k < 4; k++) { const d = new THREE.Group(); g.add(d); d.userData.keep = true;
      solid(d, T.ell(1.6, 1.0, 2.4, 10, 6), T.mat('#f4f0e6'), 0, 0.8, 0, { ink: 0.05 }); solid(d, T.ell(0.8, 0.8, 0.8, 8, 6), T.mat('#f4f0e6'), 0, 2.0, 1.8, { ink: 0.04 });
      solid(d, T.ell(0.3, 0.2, 0.6, 6, 4), T.mat('#e8902a'), 0, 1.9, 2.7, { ink: 0.02 }); solid(d, T.ell(0.7, 0.5, 0.8, 6, 4), T.mat('#e6e0d2'), 0, 1.5, -2.2, { ink: 0.03 });
      ducks.push({ d, cx: (rr() - 0.5) * RX * 0.8, cz: (rr() - 0.5) * RZ * 0.6, r: 4 + rr() * 6, w: (0.08 + rr() * 0.08) * (k % 2 ? 1 : -1), ph: rr() * 6 }); }
    // (she can't walk into it: a ring of the bank's edge)
    for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; world.obstacles.push({ x: P0.x + Math.cos(a) * RX * 0.62, z: P0.z + Math.sin(a) * RZ * 0.62, r: Math.min(RX, RZ) * 0.55 }); }
  }

  // ── The pinfold, just inside the east gate, on the way to Halloran's farm: a round pound of dry stone with a gate, where the strays are put, and
  // where Bo Peep's flock is penned overnight, safe in the village (they graze at the farm by day: in at dusk, out at dawn).
  const sheep = new THREE.Group(); sheep.userData.keep = true;
  { const C = new V3(492, 0, -58), Rr = 22, g = new THREE.Group(); g.position.copy(C); root_.add(g); g.add(sheep);
    const n = 22, gap = [Math.PI / 2 - 0.26, Math.PI / 2 + 0.26];      // (the gate faces the street, south: +z)
    for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2, am = (a0 + a1) / 2; if (am > gap[0] && am < gap[1]) continue;
      const p0 = C.clone().add(new V3(Math.cos(a0) * Rr, 0, Math.sin(a0) * Rr)), p1 = C.clone().add(new V3(Math.cos(a1) * Rr, 0, Math.sin(a1) * Rr)); wallSeg(p0, p1, 7, rubble); }
    const gt = new THREE.Group(); gt.position.set(0, 0, Rr); g.add(gt); for (const sx of [-1, 1]) box(gt, 2.2, 10, 2.2, sx * 6.2, 5, 0, oak);
    for (let k = 0; k < 4; k++) box(gt, 11, 1, 0.7, 0, 2.2 + k * 2.2, 0, oak, { ink: 0.04 }); box(gt, 0.9, 9, 0.6, 0, 5, 0.2, oak, { rot: [0, 0, 0.75], ink: 0.04 });
    world.obstacles.push({ x: C.x, z: C.z + Rr, r: 6.5 });
    // (and inside, from dusk, the flock: woolly, black-faced, lying and standing)
    const wool = T.mat('#ece6d6'), face = T.mat('#2e2a28'), rr = rnd(227);
    for (let k = 0; k < 9; k++) { const a = rr() * Math.PI * 2, d = rr() * (Rr - 7), sh = new THREE.Group(); sh.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); sh.rotation.y = rr() * 6.3; sheep.add(sh);
      const lying = rr() < 0.5, y = lying ? 2.4 : 4.6;
      solid(sh, T.ell(3.2, 2.6, 4.4, 12, 8), wool, 0, y, 0, { ink: 0.07 }); solid(sh, T.ell(1.1, 1.4, 1.7, 8, 6), face, 0, y + 1.2, 4.4, { ink: 0.05 });
      for (const sx of [-1, 1]) solid(sh, T.ell(0.9, 0.35, 0.5, 6, 4), face, sx * 1.4, y + 2.2, 3.8, { ink: 0.03 });
      if (!lying) for (const [lx, lz] of [[-1.6, 2.4], [1.6, 2.4], [-1.6, -2.4], [1.6, -2.4]]) solid(sh, new THREE.CylinderGeometry(0.45, 0.4, 3.4, 6), face, lx, 1.7, lz, { ink: 0.03 }); }
    sheep.visible = false;
  }
  lane([[492, 30], [492, -12], [492, -34]], 12);      // (the way up from the street to its gate)

  // ── The fields between the houses and the hedges: strips ploughed and sown (furrows, a crop coming up green), a hayfield with its stacks.
  { const strips = canvasTex(128, 128, (x, w, h) => { const r2 = rnd(211); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#8a6a44' : '#7a9a44'; x.fillRect(i * 16, 0, 16, h); x.fillStyle = 'rgba(60,40,20,0.25)'; for (let k = 0; k < 4; k++) x.fillRect(i * 16 + 2 + k * 4, 0, 1, h); if (i % 2 === 0) { x.fillStyle = '#8eae52'; for (let k = 0; k < 30; k++) x.fillRect(i * 16 + r2() * 16, r2() * h, 2, 3); } } }, [1, 1]);
    const hay = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#b8b060'; x.fillRect(0, 0, w, h); const r2 = rnd(213); for (let i = 0; i < 200; i++) { x.fillStyle = ['#c8c070', '#a8a050', '#d0c87a'][i % 3]; x.fillRect(r2() * w, r2() * h, 1, 4); } }, [1, 1]);
    const field = (x0, z0, x1, z1, t, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), toonMap(rep(t, (x1 - x0) / 90, (z1 - z0) / 90))); m.rotation.set(-Math.PI / 2, 0, ry || 0); m.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2); m.receiveShadow = true; root_.add(m); };
    field(-500, 200, -330, 540, strips); field(330, 290, 570, 560, strips, 0); field(-170, -550, 230, -370, hay); field(420, -540, 570, -200, strips);
    // (haystacks in the hayfield: a round stack under a thatched cone)
    for (const [x, z] of [[-90, -470], [40, -500], [150, -440]]) { solid(root_, new THREE.CylinderGeometry(9, 10, 12, 16), toonMap(rep(hay, 2, 1)), x, 6, z, { ink: 0.1 }); solid(root_, new THREE.ConeGeometry(11, 12, 16), thatch, x, 18, z, { ink: 0.1 }); world.obstacles.push({ x, z, r: 11 }); }
  }

  // ── The edges: hedges round the village (the gaps where the lanes go out shut by gates), fields beyond, and trees; to the north-west the
  // meadow, and the wood across it. ──
  const inst = [], kind = (geo, mat, ink) => { const k = { geo, mat, ink, list: [] }; inst.push(k); return k; };
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E_ = new THREE.Euler(), SC = new V3(), P_ = new V3();
  const put = (k, x, y, z, sx, sy, sz, ry) => { E_.set(0, ry || 0, 0); Q.setFromEuler(E_); M.compose(P_.set(x, y, z), Q, SC.set(sx, sy, sz)); k.list.push(M.clone()); };
  const hedge = kind(T.ell(1, 1, 1, 10, 8), T.mat('#3e6230'), 0.05), hedge2 = kind(T.ell(1, 1, 1, 10, 8), T.mat('#4a6e36'), 0.05);
  const trunk = kind(new THREE.CylinderGeometry(0.75, 1, 1, 9).translate(0, 0.5, 0), toonMap(rep(textures().oak, 1, 2)), 0.12);
  const leaves = [T.mat('#4e7a36'), T.mat('#5e8a3e'), T.mat('#6f9a46')].map(m => kind(T.ell(1, 1, 1, 14, 10), m, 0.06));
  const pineG = new THREE.ConeGeometry(1, 1, 9).translate(0, 0.5, 0), pine = kind(pineG, T.mat('#2e5a3a'), 0.05);
  const B = { x0: -600, x1: 600, z0: -580, z1: 600 };
  const gates = [GATE, V(590, 80), V(130, 590)];
  const nearGate = (x, z) => gates.some(gp => Math.hypot(x - gp.x, z - gp.z) < 26);
  // (the hedge: a line of rounded bushes along each edge)
  const edge = (a, b) => { const d = b.clone().sub(a), L = d.length(), n = Math.ceil(L / 7); for (let i = 0; i <= n; i++) { const p = a.clone().lerp(b, i / n); if (nearGate(p.x, p.z)) continue; const s = 6 + r() * 2.5; put(i % 2 ? hedge : hedge2, p.x, s * 0.8, p.z, s, s * (1.1 + r() * 0.4), s, r() * 6); } };
  edge(V(B.x0, B.z1), V(B.x1, B.z1)); edge(V(B.x1, B.z0), V(B.x1, B.z1)); edge(V(B.x0, B.z0 + 80), V(B.x0, B.z1)); edge(V(B.x0 + 80, B.z0), V(B.x1, B.z0));
  edge(V(B.x0, B.z0 + 80), V(-560, -548 + 20)); edge(V(-520, -578), V(B.x0 + 80, B.z0));
  // (gates in the gaps: a five-bar gate, shut, at the east and south lanes; at the meadow, an open stile)
  const fiveBar = (p, ry) => { const g = new THREE.Group(); g.position.copy(p); g.rotation.y = ry; root_.add(g); for (const sx of [-1, 1]) box(g, 2.4, 14, 2.4, sx * 11, 7, 0, oak);
    for (let k = 0; k < 5; k++) box(g, 20, 1.2, 0.8, 0, 2.6 + k * 2.4, 0, oak, { ink: 0.04 }); box(g, 1, 13, 0.8, 0, 7, 0.2, oak, { rot: [0, 0, 0.9], ink: 0.04 });
    world.obstacles.push({ x: p.x, z: p.z, r: 12 }); };
  fiveBar(V(590, 80), Math.PI / 2); fiveBar(V(130, 590), 0.06);
  // The meadow gate: a field gate on its hanging post, swinging out to the meadow, a latch on the other post. (js/world.js offers to go
  // through it from close by; past it is the meadow: js/wood.js.)
  { const out = new V3(-1, 0, -1).normalize(), along = new V3(1, 0, -1).normalize(), g = new THREE.Group(); g.position.copy(GATE); g.rotation.y = Math.atan2(along.x, along.z) - Math.PI / 2; root_.add(g); g.userData.keep = true;
    for (const sx of [-1, 1]) box(g, 2.6, 16, 2.6, sx * 12, 8, 0, oak);
    const pivot = new THREE.Group(); pivot.position.set(-11, 0, 0); g.add(pivot);
    for (let k = 0; k < 5; k++) box(pivot, 21, 1.2, 0.8, 10.8, 2.8 + k * 2.6, 0, oak, { ink: 0.04 }); box(pivot, 1.2, 13.5, 0.9, 1, 8, 0.2, oak, { ink: 0.04 }); box(pivot, 1.2, 13.5, 0.9, 20.6, 8, 0.2, oak, { ink: 0.04 });
    box(pivot, 1, 14, 0.8, 10.8, 8, 0.3, oak, { rot: [0, 0, 0.85], ink: 0.04 }); box(g, 2, 0.8, 1.6, 11.6, 11, 0.9, iron, { ink: 0.03 });
    world.gate = { pivot, open: 0, target: 0, swing: 1.6,
      at: GATE.clone().addScaledVector(out, -8), beyond: GATE.clone().addScaledVector(out, 14), name: 'the gate', to: 'the meadow' };
    world.obstacles.push({ x: GATE.x + along.x * 15, z: GATE.z + along.z * 15, r: 3 }, { x: GATE.x - along.x * 15, z: GATE.z - along.z * 15, r: 3 }); }
  // (trees, beyond the hedges and in the fields: scattered; thick to the north-west, where the wood is, across the meadow)
  const tree = (x, z, big) => { const h = (big ? 60 : 46) + r() * 20;
    if (r() < 0.8) { const tw = 1.8 + r() * 1.2; put(trunk, x, 0, z, tw, h * 0.7, tw, r() * 6); for (let k = 0; k < 3; k++) { const a = r() * 6.3, d = 3 + r() * 5, s = 10 + r() * 7; put(leaves[(k + Math.floor(r() * 3)) % 3], x + Math.cos(a) * d, h * (0.72 + 0.14 * k), z + Math.sin(a) * d, s, s * 0.72, s, r() * 6); } }
    else { put(trunk, x, 0, z, 1.1, h * 0.3, 1.1, 0); for (let k = 0; k < 3; k++) { const w = (9 - k * 2.4) * (0.85 + r() * 0.3); put(pine, x, h * (0.18 + 0.22 * k), z, w, h * 0.42, w, r() * 6); } } };
  for (let k = 0; k < 220; k++) { const a = r() * Math.PI * 2, d = 680 + r() * 520, x = Math.cos(a) * d, z = Math.sin(a) * d; tree(x, z, true); }
  for (let k = 0; k < 140; k++) { const x = -640 - r() * 500, z = -1100 + r() * 700; tree(x, z, true); }      // (the wood, north-west)
  for (let k = 0; k < 120; k++) { const x = -1100 + r() * 700, z = -640 - r() * 500; tree(x, z, true); }
  // (a few trees within, by the walls and behind the houses)
  for (const [x, z] of [[-470, -120], [-500, 80], [-420, 320], [-260, 420], [-60, 440], [300, 440], [420, 300], [470, 160], [520, -280], [-30, -420], [-180, -430], [-460, -260], [420, -420]]) tree(x, z, false), world.obstacles.push({ x, z, r: 5 });
  // (the orchard's apples: low, round, spreading)
  const apple = [T.mat('#5e8a3e'), T.mat('#6a9440')].map(m => kind(T.ell(1, 1, 1, 12, 8), m, 0.06)), fruit = kind(T.ell(1, 1, 1, 6, 4), T.mat('#c8402a'), 0);
  for (const [x, z] of orchard) { const h = 16 + r() * 4; put(trunk, x, 0, z, 1.4, h, 1.4, r() * 6); const s1 = 11 + r() * 3; put(apple[Math.floor(r() * 2)], x, h + 4, z, s1, s1 * 0.6, s1, r() * 6);
    for (let q = 0; q < 6; q++) { const a = r() * 6.3, d = 4 + r() * 7; put(fruit, x + Math.cos(a) * d, h + 1 + r() * 6, z + Math.sin(a) * d, 0.8, 0.8, 0.8, 0); }
    world.obstacles.push({ x, z, r: 3.4 }); }
  for (const k of inst) { if (!k.list.length) continue;
    const m = new THREE.InstancedMesh(k.geo, k.mat, k.list.length); k.list.forEach((mm, i) => m.setMatrixAt(i, mm)); m.castShadow = k === trunk; m.receiveShadow = true; root_.add(m);
    const h = new THREE.InstancedMesh(T.hullGeo(k.geo, k.ink), T.INKM[0], k.list.length); k.list.forEach((mm, i) => h.setMatrixAt(i, mm)); root_.add(h); }

  // ── Where she can be: inside the hedges (and out at the meadow gate, to the wood). ──
  world.bounds = null;
  // (inside the hedges; and, with the gate open, a step out through it)
  world.constrain = (q, rad) => { const p = q.clone(), through = world.gate && world.gate.open > 0.5 && Math.hypot(p.x - GATE.x, p.z - GATE.z) < 26;
    if (!through) { p.x = clamp(p.x, B.x0 + 10 + rad, B.x1 - 10 - rad); p.z = clamp(p.z, B.z0 + 10 + rad, B.z1 - 10 - rad); const lim = -1100 + 6 + rad; if (p.x + p.z < lim) { const k = (lim - p.x - p.z) / 2; p.x += k; p.z += k; } }      // (the hedge across the corner, on the diagonal, x + z = -1100)
    return p; };
  world.exits.push({ name: 'the meadow', get at() { return world.gate.beyond; }, r: 6, when: () => world.gate.open > 0.6 });
  world.entries.wood = { at: [GATE.x + 18, GATE.z + 18], yaw: Math.PI * 0.25 };      // (in at the meadow gate, the gate behind her, facing down the lane)

  // ── The camera, outdoors: kept out of the houses (in front of whatever's between it and her), so a wall or a roof never fills the view. ──
  const inBox = (s, p) => !(p.x < s.x0 || p.x > s.x1 || p.z < s.z0 || p.z > s.z1 || p.y > s.top);
  function keepCamera(camera, target) {
    const t = target, c = camera.position, d = c.clone().sub(t), these = solids.filter(s => !inBox(s, t)); let hit = 1;      // (not one she's up against, under its eaves)
    for (let k = 1; k <= 24; k++) { const p = t.clone().addScaledVector(d, k / 24); if (these.some(s => inBox(s, p))) { hit = (k - 1) / 24; break; } }
    if (hit < 1) c.copy(t).addScaledVector(d, Math.max(0.12, hit));
  }

  // ── Light: the sky, the fog, the windows and lanterns lit from dusk, the forge's glow; the sun following her. ──
  let api = null;
  const SKY = [[0, '#cfe0e8'], [0.45, '#f0d2a0'], [0.7, '#c8a4a8'], [1, '#2a3050']];
  const sky = t => { let i = 0; while (i < SKY.length - 2 && t > SKY[i + 1][0]) i++; const a = SKY[i], b = SKY[i + 1]; return new THREE.Color(srgb(a[1])).lerp(new THREE.Color(srgb(b[1])), (t - a[0]) / (b[0] - a[0])); };
  scene.fog = new THREE.Fog(sky(0), 260, 1100);
  const dark = new THREE.Color(srgb('#2e2a2a')), lit = new THREE.Color(srgb('#ffc86a'));
  function light(t, stage) {
    api = stage || api; const c = sky(t); scene.background = c; scene.fog.color.copy(c); scene.fog.near = lerp(300, 120, t); scene.fog.far = lerp(1200, 600, t);
    const k = ss(0.45, 0.8, t); winM.color.copy(dark).lerp(lit, k); for (const m of lamps) m.color.copy(dark).lerp(lit, ss(0.55, 0.85, t));
    for (const g of glows) if (g.glow) g.glow.opacity = 0.12 + 0.2 * t;
    sheep.visible = t > 0.62;      // (the flock penned for the night)
  }
  function follow(pos, dt, camera, at) {
    if (!api) return; const s = api.sun; s.target.position.copy(pos); s.position.copy(pos).add(new V3(-30, 60, 40)); s.target.updateMatrixWorld();
  }
  let clock = 0;
  function tick(dt) {
    clock += dt;
    for (const q of ducks) { const a = clock * q.w + q.ph; q.d.position.set(q.cx + Math.cos(a) * q.r, 0.2 + 0.15 * Math.sin(clock * 1.7 + q.ph), q.cz + Math.sin(a) * q.r * 0.6); q.d.rotation.y = Math.atan2(-Math.sin(a) * Math.sign(q.w), Math.cos(a) * 0.6 * Math.sign(q.w)); }
    for (const p of smoke) { const k = (clock * 0.07 + p.ph) % 1; p.m.position.copy(p.base).add(new V3(k * 5, k * 30, 0)); p.m.scale.setScalar(0.6 + k * 1.8); p.m.material.opacity = 0.42 * (1 - k); }
    for (const g of glows) if (g.color) g.color.setHSL(0.06, 1, 0.55 + 0.06 * Math.sin(clock * 3.1) + 0.03 * Math.sin(clock * 7.7));
    // (her door: swinging to where it's been sent)
    const d = world.door; if (d) { d.open += (d.target - d.open) * (1 - Math.exp(-dt * 5)); d.pivot.rotation.y = d.swing * d.open; }
    const gt = world.gate; if (gt) { gt.open += (gt.target - gt.open) * (1 - Math.exp(-dt * 4)); gt.pivot.rotation.y = gt.swing * gt.open; }      // (the meadow gate, likewise)
  }
  // ── Where things are done (js/chores.js's errands, the garden): a place to stand, which way to face, and what to look at.
  root_.updateMatrixWorld(true);
  const before = (h, side, at, out) => { const f = h.face(side), p = new V3(at, 0, out || 9).applyMatrix4(f.matrixWorld).setY(0), q = new V3(at, 0, 0).applyMatrix4(f.matrixWorld).setY(0);
    return { at: p, yaw: Math.atan2(q.x - p.x, q.z - p.z), look: q.clone().setY(20) }; };
  const wellAt = new V3(GREEN.x + 46, 0, GREEN.z + 30);
  world.spots = {
    garden: { at: V(-338, -390), yaw: Math.PI / 2, look: new V3(-300, 1, -399) },      // (just in at the gate of Maren's garden, the rows before her)
    well: { at: wellAt.clone().add(V(0, 12)), yaw: Math.PI, look: wellAt.clone().setY(8) },
    bakery: before(bakery, 'front', 14, 13), inn: before(inn, 'front', -6, 13), dunns: before(dunns, 'front', -16), forge: before(forge, 'front', 0, 20),
    pinfold: { at: V(492, -26), yaw: Math.PI, look: new V3(492, 6, -58) },
    // (where the village's people are found: js/villagers.js)
    anvil: before(forge, 'front', 8, 17), tub: before(forge, 'front', -30, 16), bakeryDoor: before(bakery, 'front', 14, 4), counter: before(bakery, 'front', -24, 10),
    pieSill: before(bakery, 'front', -15, 10), innDoor: before(inn, 'front', -6, 4), pennocksDoor: before(ne, 'front', -10, 6), ferriersDoor: before(millLane, 'front', 10, 6), thatchers: before(thatchers, 'front', 20, 8), dunnsDoor: before(dunns, 'front', -16, 6),
    wellSide: { at: wellAt.clone().add(V(10, -8)), yaw: Math.atan2(-10, 8), look: wellAt.clone().setY(8) },
    pondSide: { at: POND.clone().add(V(0, 26)), yaw: Math.PI, look: POND.clone().setY(2) },
    wellNear: { at: wellAt.clone().add(V(-16, 14)), yaw: Math.atan2(16, -14), look: wellAt.clone().setY(8) },      // (near enough to the well to be seen there, and to see who's at it)
    bell: { at: BELL.clone().add(V(0, 9)), yaw: Math.PI, look: BELL.clone().setY(14) },
    millGate: { at: MILL[Math.floor(MILL.length * 0.8)].clone(), yaw: 0, look: MILL[MILL.length - 1].clone().setY(10) },      // (the lane south, toward the mill: where the miller's lad comes and goes)
  };
  world.entries.bakery = { at: [world.spots.bakeryDoor.at.x - Math.sin(world.spots.bakeryDoor.yaw) * 10, world.spots.bakeryDoor.at.z - Math.cos(world.spots.bakeryDoor.yaw) * 10], yaw: world.spots.bakeryDoor.yaw + Math.PI };      // (out of Mistress Pennock's door, onto the street)
  world.lanes = lanes.map(l => l.S);      // (every lane and path, as points six apart: the ways the village's people walk)
  // (somewhere to walk to: along the street and the lanes round the green, and on the green itself)
  world.wander = [STREET, LOOP].flatMap(S => S.filter((_, i) => i % 9 === 4).map(p => p.clone())).filter(p => p.x > -380 && p.x < 400)
    .concat([V(GREEN.x - 20, GREEN.z - 40), V(GREEN.x + 60, GREEN.z - 10), V(GREEN.x + 10, GREEN.z + 20), V(GREEN.x - 100, GREEN.z + 10)]);
  // (the Watchman's round: down the street from Maren's, round the green by the loop, and back, a lantern in his hand)
  world.round = STREET.filter((_, i) => i % 6 === 0 && STREET[i].x > -400 && STREET[i].x < 420).concat(LOOP.filter((_, i) => i % 6 === 0).reverse());

  mergeStatic(root_);
  return { group: root_, update() {}, tick, light, follow, keepCamera, world, home: HOME, solids };
}

root.Village = { build };
})(typeof window !== 'undefined' ? window : globalThis);
