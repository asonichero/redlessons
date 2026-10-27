// Little Red’s Lessons — the wood between her grandmother's cabin and the village: a path of trodden earth winding a long way through oaks, beeches,
// birches and pines, ferns and brambles, moss and toadstools. On the way: a glade of bluebells, a stream with a plank bridge and a flat stone on
// the bank to sit on, an old beech with initials carved in it, a fallen trunk across a clearing. At the far end the trees thin to the meadow:
// open grass full of flowers, lone oaks, hedges, and the meadow gate at its far side, through to the village. The light goes from late gold
// to dusk to blue (stage.setLight), and the fog closes in with it.
//
//   const wood = Wood.build(scene)   → { group, update, tick, light(t, stage), follow(pos), world, progress(pos) → 0..1, path, spots }
//   world.constrain(p, r) keeps her on the path (and round the cabin at the start), and in the meadow within its hedges; world.gate: the
//   meadow gate (js/world.js offers to go through it, to the village).
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3;
const { canvasTex, toonMap, rnd, box, solid, pole, srgb } = root.Cottage.kit;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// The path, from just outside her grandmother's door (the cabin stands at the origin, its door facing +z) to the edge of the wood.
const PTS = [[-11.5, 38], [-12, 80], [6, 140], [22, 200], [6, 262], [-34, 312], [-58, 380], [-46, 452], [-8, 506], [30, 566], [40, 640], [16, 712], [-24, 772],
  [-34, 846], [-6, 912], [26, 976], [30, 1046], [6, 1108], [-4, 1160]];
const EDGE = 0.93;      // (where along it the trees give way to the meadow)

function build(scene, opts) {
  opts = opts || {};
  const root_ = new THREE.Group(); scene.add(root_);
  const curve = new THREE.CatmullRomCurve3(PTS.map(([x, z]) => new V3(x, 0, z)), false, 'centripetal');
  const N = 900, S = curve.getSpacedPoints(N), LEN = curve.getLength();
  const dirAt = i => S[Math.min(N, i + 1)].clone().sub(S[Math.max(0, i - 1)]).setY(0).normalize();
  // Nearest point on the path: an index into the samples, and the distance.
  let hint = 0;
  function nearest(p) {
    let best = hint, bd = Infinity;
    const scan = (a, b, st) => { for (let i = Math.max(0, a); i <= Math.min(N, b); i += st) { const d = (S[i].x - p.x) ** 2 + (S[i].z - p.z) ** 2; if (d < bd) { bd = d; best = i; } } };
    scan(hint - 40, hint + 40, 1); if (bd > 40 * 40) { scan(0, N, 4); scan(best - 6, best + 6, 1); }
    hint = best; return { i: best, d: Math.sqrt(bd) };
  }

  // ── Spots along the way, and how wide the way is there (the path, and room to step off it; wider at the spots and at either end).
  const spots = {
    bluebells: { t: 0.17, side: 1, off: 17, name: 'the bluebells' },
    stream: { t: 0.42, side: -1, off: 14, name: 'the stream' },
    beech: { t: 0.62, side: 1, off: 13, name: 'the old beech' },
    log: { t: 0.79, side: -1, off: 15, name: 'the fallen tree' },
  };
  for (const k in spots) { const s = spots[k], i = Math.round(s.t * N), d = dirAt(i), side = new V3(d.z, 0, -d.x).multiplyScalar(s.side); s.at = S[i].clone().addScaledVector(side, s.off); s.i = i; s.side3 = side; s.dir = d; }
  const widthAt = i => { const t = i / N; let w = 12; for (const k in spots) w = Math.max(w, 12 + 18 * Math.exp(-((((t - spots[k].t) * LEN) / 22) ** 2))); if (t < 0.04) w = Math.max(w, 34); if (t > EDGE) w = lerp(w, 70, ss(EDGE, 1, t)); return w; };

  // ── Textures.
  const grassT = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#6f8f44'; x.fillRect(0, 0, w, h); const r = rnd(81); for (let i = 0; i < 500; i++) { x.fillStyle = ['#7a9a4a', '#5e7e3a', '#86a452', '#6a8640'][i % 4]; x.fillRect(r() * w, r() * h, 2, 3 + r() * 3); } for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(90,70,40,.18)'; x.beginPath(); x.ellipse(r() * w, r() * h, 4 + r() * 8, 2 + r() * 4, 0, 0, 7); x.fill(); } }, [60, 160]);
  const dirtT = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#9a7a52'; x.fillRect(0, 0, w, h); const r = rnd(83); for (let i = 0; i < 160; i++) { x.fillStyle = ['#8a6a44', '#a88a5e', '#7a5c3a'][i % 3]; x.beginPath(); x.ellipse(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2, 0, 0, 7); x.fill(); }
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(111,143,68,1)'); g.addColorStop(0.18, 'rgba(111,143,68,0)'); g.addColorStop(0.82, 'rgba(111,143,68,0)'); g.addColorStop(1, 'rgba(111,143,68,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, [1, 1]);
  const barkT = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#5e4e3e'; x.fillRect(0, 0, w, h); const r = rnd(85); for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(30,22,16,${0.3 + r() * 0.3})`; x.fillRect(r() * w, 0, 2 + r() * 3, h); } }, [2, 2]);
  const birchT = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#ece6da'; x.fillRect(0, 0, w, h); const r = rnd(87); for (let i = 0; i < 26; i++) { x.fillStyle = '#2e2a26'; x.fillRect(r() * w, r() * h, 6 + r() * 14, 1.5 + r() * 2); } }, [2, 2]);
  const waterT = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#5a8aa0'; x.fillRect(0, 0, w, h); const r = rnd(89); for (let i = 0; i < 40; i++) { x.strokeStyle = 'rgba(220,240,255,.35)'; x.lineWidth = 2; x.beginPath(); const y = r() * h; x.moveTo(r() * w, y); x.lineTo(r() * w + 20, y + 2); x.stroke(); } }, [2, 8]);

  // ── The ground: grass everywhere, the path of trodden earth along the curve.
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(1200, 2000), toonMap(grassT)); g.rotation.x = -Math.PI / 2; g.position.set(0, -0.02, 650); g.receiveShadow = true; root_.add(g); }
  { const pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) { const d = dirAt(i), side = new V3(d.z, 0, -d.x), w = (i / N > EDGE ? lerp(4.5, 3.5, ss(EDGE, 1, i / N)) : 4.5) + 0.8 * Math.sin(i * 0.37);
      for (const sx of [-1, 1]) { const p = S[i].clone().addScaledVector(side, sx * w); pos.push(p.x, 0.04, p.z); uv.push(sx < 0 ? 0 : 1, i / N * LEN / 14); } }
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, toonMap(dirtT)); m.receiveShadow = true; root_.add(m); }

  // ── Her grandmother's cabin, behind her at the start, under its oak.
  const cabin = root.Cabin ? root.Cabin.build(root_, { outside: true }) : null;
  if (cabin) { const c = new THREE.PerspectiveCamera(); c.position.set(0, 40, 200); c.updateMatrixWorld(); cabin.update(c); }      // (all of it shows, from outside)

  // ── Trees, as instanced shapes (with their outlines): broad oaks and beeches (a trunk and three masses of leaves), white birches (slender,
  // light crowns), dark pines (stacked cones). Placed either side of the path, thick near it and thinning out; none on it or at the spots.
  const inst = [];      // { geo, mat, ink, list: [Matrix4] }
  const kind = (geo, mat, ink) => { const k = { geo, mat, ink, list: [] }; inst.push(k); return k; };
  const trunk = kind(new THREE.CylinderGeometry(0.75, 1, 1, 9).translate(0, 0.5, 0), toonMap(barkT), 0.12);
  const birch = kind(new THREE.CylinderGeometry(0.5, 0.65, 1, 8).translate(0, 0.5, 0), toonMap(birchT), 0.1);
  const leaves = [T.mat('#4e7a36'), T.mat('#5e8a3e'), T.mat('#6f9a46'), T.mat('#7aa24e')].map(m => kind(T.ell(1, 1, 1, 14, 10), m, 0.06));
  const birchLeaf = kind(T.ell(1, 1, 1, 12, 8), T.mat('#9aba5a'), 0.06);
  const pineG = new THREE.ConeGeometry(1, 1, 9).translate(0, 0.5, 0), pines = [T.mat('#2e5a3a'), T.mat('#3a6a44')].map(m => kind(pineG, m, 0.05));
  const fern = kind((() => { const g = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 0.5, 1); return g; })(), T.mat('#5e8a3a'), 0.04);
  const bush = kind(T.ell(1, 0.8, 1, 10, 8), T.mat('#4a6a30'), 0.05);
  const rock = kind(new THREE.DodecahedronGeometry(1, 0), T.mat('#8a8a82'), 0.05);
  const toad = kind(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), T.mat('#c03a2a'), 0.03);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), SC = new V3(), P = new V3();
  let cur = null;      // (the tree being made: its parts are kept with it, so it can be hidden when it's in the camera's way)
  const trees = [];
  const put = (k, x, y, z, sx, sy, sz, ry, rx) => { E.set(rx || 0, ry || 0, 0); Q.setFromEuler(E); M.compose(P.set(x, y, z), Q, SC.set(sx, sy, sz)); k.list.push(M.clone()); if (cur) cur.parts.push([k, k.list.length - 1]); };
  const r = rnd(97);
  const clear = (x, z, pad) => { if (z > S[N].z - 30 && Math.abs(x) < 245) return false;      // (none in the meadow)
    const n = nearest(new V3(x, 0, z)); if (n.d < widthAt(n.i) + pad) return false; for (const k in spots) if (Math.hypot(x - spots[k].at.x, z - spots[k].at.z) < 14 + pad) return false; if (Math.abs(x) < 52 && z > -50 && z < 50) return false; return true; };
  // (near the path the trees are tall, their crowns high over her head and the camera's; the pines, which branch low, keep further off)
  const tree = (x, z, big) => {
    const near = !big, t = near ? r() * 0.72 : r(), h = (big ? 52 : 64) + r() * 24;
    cur = { x, z, r: t < 0.72 ? 3.5 : 10, parts: [], hidden: false }; trees.push(cur);
    if (t < 0.5) {      // (oak or beech)
      const tw = 1.8 + r() * 1.4; put(trunk, x, 0, z, tw, h * 0.7, tw, r() * 6);
      for (let k = 0; k < 3; k++) { const a = r() * 6.3, d = 3 + r() * 5, s = 10 + r() * 7; put(leaves[(k + Math.floor(r() * 4)) % 4], x + Math.cos(a) * d, h * (0.72 + 0.14 * k) + r() * 4, z + Math.sin(a) * d, s, s * 0.72, s, r() * 6); }
    } else if (t < 0.72) {      // (birch)
      put(birch, x, 0, z, 0.9, h * 0.85, 0.9, r() * 6); for (let k = 0; k < 2; k++) { const s = 5 + r() * 3; put(birchLeaf, x + (r() - 0.5) * 3, h * (0.78 + 0.14 * k), z + (r() - 0.5) * 3, s, s * 1.3, s, 0); }
    } else {      // (pine)
      put(trunk, x, 0, z, 1.1, h * 0.3, 1.1, 0); const pm = pines[Math.floor(r() * 2)];
      for (let k = 0; k < 3; k++) { const w = (9 - k * 2.4) * (0.85 + r() * 0.3); put(pm, x, h * (0.18 + 0.22 * k), z, w, h * 0.42, w, r() * 6); }
    }
  };
  for (let i = 0; i <= N; i += 2) {
    const t = i / N, d = dirAt(i), side = new V3(d.z, 0, -d.x), dense = t > EDGE ? 1 - ss(EDGE, 0.99, t) : 1;
    for (const sx of [-1, 1]) {
      if (r() < 0.5 * dense) { const o = widthAt(i) + 8 + r() * 26, p = S[i].clone().addScaledVector(side, sx * o).addScaledVector(d, (r() - 0.5) * 6); if (clear(p.x, p.z, 4)) tree(p.x, p.z, false); }
      if (r() < 0.6 * dense) { const o = widthAt(i) + 30 + r() * 70, p = S[i].clone().addScaledVector(side, sx * o).addScaledVector(d, (r() - 0.5) * 10); if (clear(p.x, p.z, 8)) tree(p.x, p.z, true); }
      // (undergrowth near the path's edge: ferns, bushes, a rock, a ring of toadstools)
      if (r() < 0.5 * dense) { const o = widthAt(i) - 2 + r() * 10, p = S[i].clone().addScaledVector(side, sx * o); if (clear(p.x, p.z, -4)) { const s = 2.5 + r() * 2.5; put(r() < 0.6 ? fern : bush, p.x, 0, p.z, s, s, s, r() * 6); } }
      if (r() < 0.06) { const o = widthAt(i) + r() * 8, p = S[i].clone().addScaledVector(side, sx * o), s = 1.4 + r() * 2.4; put(rock, p.x, s * 0.4, p.z, s, s * 0.7, s, r() * 6, r()); }
      if (r() < 0.04 * dense) { const o = widthAt(i) - 1 + r() * 6, p = S[i].clone().addScaledVector(side, sx * o); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.3; put(toad, p.x + Math.cos(a) * 1.8, 0.9, p.z + Math.sin(a) * 1.8, 0.7, 0.5, 0.7, 0); } }
    }
  }
  // (the clearing round the cabin: a ring of trees behind it and to the sides)
  for (let k = 0; k < 26; k++) { const a = Math.PI * (0.9 + k / 26 * 1.2) + (r() - 0.5) * 0.1, d = 70 + r() * 40; tree(Math.cos(a) * d, Math.sin(a) * d + 6, true); }
  cur = null;
  // (the crowns cast no shadow, so the path isn't sunk in it; the trunks do)
  const crowns = new Set([...leaves, birchLeaf, ...pines]);
  for (const k of inst) {
    if (!k.list.length) continue;
    const m = new THREE.InstancedMesh(k.geo, k.mat, k.list.length); k.list.forEach((mm, i) => m.setMatrixAt(i, mm)); m.castShadow = !crowns.has(k); m.receiveShadow = true; root_.add(m);
    const h = new THREE.InstancedMesh(T.hullGeo(k.geo, k.ink), T.INKM[0], k.list.length); k.list.forEach((mm, i) => h.setMatrixAt(i, mm)); root_.add(h);
    k.mesh = m; k.hull = h;
  }
  // A tree standing between the camera and her (or right by the camera) isn't drawn while it's there.
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  function occlude(cam, at) {
    const ax = cam.x, az = cam.z, bx = at.x - ax, bz = at.z - az, L2 = bx * bx + bz * bz || 1, dirty = new Set();
    for (const t of trees) {
      if (Math.abs(t.x - at.x) > 140 || Math.abs(t.z - at.z) > 140) { if (!t.hidden) continue; }
      const u = clamp(((t.x - ax) * bx + (t.z - az) * bz) / L2, 0, 1), dx = t.x - (ax + bx * u), dz = t.z - (az + bz * u);
      const hide = (u > 0 && u < 0.97 && dx * dx + dz * dz < (t.r + 2.5) ** 2) || (t.x - ax) ** 2 + (t.z - az) ** 2 < (t.r + 6) ** 2;
      if (hide === t.hidden) continue; t.hidden = hide;
      for (const [k, i] of t.parts) { const mm = hide ? ZERO : k.list[i]; k.mesh.setMatrixAt(i, mm); k.hull.setMatrixAt(i, mm); dirty.add(k); }
    }
    for (const k of dirty) { k.mesh.instanceMatrix.needsUpdate = true; k.hull.instanceMatrix.needsUpdate = true; }
  }

  // ── The spots.
  // Bluebells: a sweep of them in the glade, nodding blue heads on green stems.
  { const s = spots.bluebells, g = new THREE.Group(); root_.add(g); const head = T.mat('#5a6ad8'), head2 = T.mat('#7a7ae8'), stem = T.mat('#4e7a36');
    const hg = new THREE.SphereGeometry(0.42, 6, 4), sg = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 4).translate(0, 1.1, 0);
    const heads = new THREE.InstancedMesh(hg, head, 260), heads2 = new THREE.InstancedMesh(hg, head2, 260), stems = new THREE.InstancedMesh(sg, stem, 520);
    for (let k = 0; k < 520; k++) { const a = r() * 6.3, d = Math.sqrt(r()) * 13, x = s.at.x + Math.cos(a) * d, z = s.at.z + Math.sin(a) * d * 0.8, h = 0.8 + r() * 0.6;
      M.compose(P.set(x, 0, z), Q.identity(), SC.set(1, h, 1)); stems.setMatrixAt(k, M); M.compose(P.set(x + 0.2, 2.2 * h, z), Q.identity(), SC.set(1, 1.3, 1)); (k % 2 ? heads : heads2).setMatrixAt(k >> 1, M); }
    for (const m of [heads, heads2, stems]) { m.castShadow = false; g.add(m); }
    s.label = 'Pick bluebells'; s.reach = s.at.clone().setY(1.6); }
  // The stream: across the path, from far off to far off, a plank bridge where the path crosses, and a flat stone on the bank.
  { const s = spots.stream, i = s.i, d = s.dir, across = new V3(d.z, 0, -d.x), c = S[i];
    const w = new THREE.Mesh(new THREE.PlaneGeometry(9, 600), new THREE.MeshBasicMaterial({ map: waterT, color: srgb('#9ac0d8') })); w.rotation.x = -Math.PI / 2; w.rotation.z = Math.atan2(across.x, across.z); w.position.set(c.x, 0.08, c.z); root_.add(w);
    s.water = waterT;
    const br = new THREE.Group(); br.position.copy(c); br.rotation.y = Math.atan2(d.x, d.z); root_.add(br);
    for (let k = -3; k < 4; k++) box(br, 9, 0.6, 1.5, 0, 0.9 + 0.15 * Math.cos(k * 0.4), k * 1.6, toonMap(barkT));
    for (const sx of [-1, 1]) { pole(br, new V3(sx * 4.6, 0, -5.4), new V3(sx * 4.6, 4.5, -5.4), 0.3, toonMap(barkT)); pole(br, new V3(sx * 4.6, 0, 5.4), new V3(sx * 4.6, 4.5, 5.4), 0.3, toonMap(barkT)); pole(br, new V3(sx * 4.6, 4.3, -5.4), new V3(sx * 4.6, 4.3, 5.4), 0.25, toonMap(barkT)); }
    const stone = s.at.clone().addScaledVector(d, 4); solid(root_, T.ell(4.5, 1.6, 3.5, 12, 8), T.mat('#9a9a90'), stone.x, 1.2, stone.z, { ink: 0.08 });
    s.seat = { name: 'the flat stone', at: stone.clone().setY(2.6), facing: Math.atan2(-across.x * s.side, -across.z * s.side), kind: 'stool' };
    s.label = 'Sit by the stream'; }
  // The old beech: broad and smooth, a heart cut into its bark with R and P inside, grown wide over the years.
  { const s = spots.beech, t = s.at.clone().addScaledVector(s.side3, 4), g = new THREE.Group(); g.position.copy(t); root_.add(g);
    const bm = toonMap(canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#9a948a'; x.fillRect(0, 0, w, h); const rr = rnd(91); for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(70,66,60,.25)'; x.fillRect(rr() * w, rr() * h, 4 + rr() * 8, 2); } }, [2, 3]));
    solid(g, new THREE.CylinderGeometry(3.2, 4.4, 50, 16), bm, 0, 25, 0, { ink: 0.12 });
    for (let k = 0; k < 4; k++) { const a = k * 1.6; solid(g, T.ell(16, 11, 16, 14, 10), [T.mat('#6f9a46'), T.mat('#7aa24e')][k % 2], Math.cos(a) * 8, 52 + k * 3, Math.sin(a) * 8, { ink: 0.15 }); }
    const carve = canvasTex(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#4a3a2a'; x.lineWidth = 3; x.beginPath(); x.moveTo(32, 54); x.bezierCurveTo(4, 34, 10, 8, 32, 22); x.bezierCurveTo(54, 8, 60, 34, 32, 54); x.stroke(); x.fillStyle = '#4a3a2a'; x.font = 'bold 15px Georgia'; x.fillText('R', 19, 38); x.fillText('P', 35, 38); });
    carve.wrapS = carve.wrapT = THREE.ClampToEdgeWrapping;
    const face = s.side3.clone().negate(), cm = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ map: carve, transparent: true, depthWrite: false }));
    cm.position.set(face.x * 3.75, 16, face.z * 3.75); cm.lookAt(cm.position.clone().add(face).add(g.position)); cm.position.add(new V3()); g.add(cm);
    s.reach = t.clone().addScaledVector(face, 3.6).setY(16); s.label = 'Look at the carving'; }
  // The fallen tree: an old trunk lying across the clearing, moss on its back, its broken end in the air.
  { const s = spots.log, a = s.at.clone().addScaledVector(s.dir, -9), b = s.at.clone().addScaledVector(s.dir, 9);
    pole(root_, a.clone().setY(2.6), b.clone().setY(3.4), 2.6, toonMap(barkT), { taper: 1.15, ink: 0.12 });
    solid(root_, T.ell(5, 0.8, 1.8), T.mat('#6a8a3a'), s.at.x, 5.6, s.at.z, { rot: [0, Math.atan2(s.dir.x, s.dir.z), 0], ink: 0.04 });
    s.seat = { name: 'the fallen tree', at: s.at.clone().addScaledVector(s.side3, -2.6).setY(5.4), facing: Math.atan2(-s.side3.x, -s.side3.z), kind: 'stool' };
    s.label = 'Sit on the fallen tree'; }

  const smoke = [], world_obstacles = [];
  // ── The meadow, past the wood's edge: open grass full of flowers, a few lone oaks, the lane across it to the meadow gate in the hedge at the
  // far side (and the village beyond: js/village.js). Hedges down either side, the wood behind.
  const MZ0 = S[N].z - 40, MZ1 = MZ0 + 300, MX = 230, GATE = new V3(14, 0, MZ1);
  { const r2 = rnd(99), lane = [S[N].clone(), new V3(-14, 0, MZ0 + 120), new V3(-2, 0, MZ0 + 220), GATE.clone().setZ(MZ1 - 10)];
    // (the lane across it: trodden earth, as the path is)
    const lc = new THREE.CatmullRomCurve3(lane), LS = lc.getSpacedPoints(80), pos = [], uv = [], idx = [];
    for (let i = 0; i <= 80; i++) { const d = LS[Math.min(80, i + 1)].clone().sub(LS[Math.max(0, i - 1)]).normalize(), side = new V3(d.z, 0, -d.x);
      for (const sx of [-1, 1]) { const p = LS[i].clone().addScaledVector(side, sx * 4); pos.push(p.x, 0.05, p.z); uv.push(sx < 0 ? 0 : 1, i / 6); } }
    for (let i = 0; i < 80; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); lg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); lg.setIndex(idx); lg.computeVertexNormals();
    const lm = new THREE.Mesh(lg, toonMap(dirtT)); lm.receiveShadow = true; root_.add(lm);
    const onLane = (x, z) => LS.some(q => Math.hypot(q.x - x, q.z - z) < 8);
    // (the flowers: buttercups, clover, ox-eye daisies and cornflowers, everywhere in the grass; and long tufts)
    const fg = new THREE.SphereGeometry(0.5, 6, 4), cols = ['#f2d24a', '#e8e4f0', '#c86a9a', '#5a7ad8'];
    const fl = cols.map(c => new THREE.InstancedMesh(fg, T.mat(c), 700)), tuft = new THREE.InstancedMesh(new THREE.ConeGeometry(0.6, 3, 4).translate(0, 1.5, 0), T.mat('#7a9a48'), 1400);
    const n = [0, 0, 0, 0]; let nt = 0;
    for (let k = 0; k < 4200 && (n.some(v => v < 700) || nt < 1400); k++) { const x = (r2() * 2 - 1) * MX, z = MZ0 + 10 + r2() * (MZ1 - MZ0 - 14); if (onLane(x, z)) continue;
      if (k % 3) { const c = Math.floor(r2() * 4); if (n[c] < 700) { M.compose(P.set(x, 1.2 + r2() * 0.8, z), Q.identity(), SC.set(1, 0.8, 1)); fl[c].setMatrixAt(n[c]++, M); } }
      else if (nt < 1400) { M.compose(P.set(x, 0, z), Q.setFromEuler(E.set((r2() - 0.5) * 0.4, r2() * 6, (r2() - 0.5) * 0.4)), SC.set(1, 0.7 + r2() * 0.7, 1)); tuft.setMatrixAt(nt++, M); } }
    fl.forEach((m, c) => { m.count = n[c]; m.castShadow = false; root_.add(m); }); tuft.count = nt; tuft.castShadow = false; root_.add(tuft);
    // (lone oaks, out in it)
    for (const [x, z] of [[-150, MZ0 + 90], [120, MZ0 + 60], [170, MZ0 + 210], [-110, MZ0 + 250]]) { const h = 56; const tw = 2.6;
      solid(root_, new THREE.CylinderGeometry(0.75 * tw, tw, h * 0.7, 9).translate(0, h * 0.35, 0), toonMap(barkT), x, 0, z, { ink: 0.12 });
      for (let k = 0; k < 4; k++) { const a = k * 1.7, s1 = 13 + k; solid(root_, T.ell(s1, s1 * 0.72, s1, 14, 10), [T.mat('#5e8a3e'), T.mat('#6f9a46')][k % 2], x + Math.cos(a) * 7, h * (0.7 + 0.1 * k), z + Math.sin(a) * 7, { ink: 0.06 }); }
      world_obstacles.push({ x, z, r: 4 }); }
    // (the hedges: down either side, and across the far end, with the gate in it)
    const hedgeM = [T.mat('#3e6230'), T.mat('#4a6e36')];
    const hedge = (a, b, gap) => { const d = b.clone().sub(a), L = d.length(), k0 = Math.ceil(L / 7); for (let k = 0; k <= k0; k++) { const p = a.clone().lerp(b, k / k0); if (gap && Math.hypot(p.x - gap.x, p.z - gap.z) < 15) continue; const s1 = 6 + r2() * 2.5; solid(root_, T.ell(s1, s1 * (1.1 + r2() * 0.4), s1, 10, 8), hedgeM[k % 2], p.x, s1 * 0.8, p.z, { ink: 0.05, shadow: false }); } };
    hedge(new V3(-MX - 10, 0, MZ1), new V3(MX + 10, 0, MZ1), GATE); hedge(new V3(-MX - 10, 0, MZ0 + 30), new V3(-MX - 10, 0, MZ1)); hedge(new V3(MX + 10, 0, MZ0 + 30), new V3(MX + 10, 0, MZ1), new V3(MX + 10, 0, MZ0 + 70));      // (a gap at the fork to the Fowlers')
    // (beyond the far hedge: the village's trees, and its roofs' smoke going up)
    for (let k = 0; k < 14; k++) { const x = -260 + k * 40 + r2() * 20, z = MZ1 + 60 + r2() * 80; solid(root_, T.ell(14, 11, 14, 12, 8), [T.mat('#4e7a36'), T.mat('#5e8a3e')][k % 2], x, 30 + r2() * 12, z, { ink: 0.08 });
      solid(root_, new THREE.CylinderGeometry(1.5, 2, 30, 8), toonMap(barkT), x, 15, z, { ink: 0.08 }); }
    for (const [x, z] of [[60, MZ1 + 110], [-80, MZ1 + 140]]) for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(T.ell(2.4, 2.4, 2.4, 8, 6), new THREE.MeshBasicMaterial({ color: srgb('#c8c4c0'), transparent: true, opacity: 0.5, depthWrite: false })); root_.add(p); smoke.push({ m: p, base: new V3(x, 34, z), ph: k / 4 }); }
  }
  // The fork to the Fowlers': a lane off the meadow's east side (the beech's side of the path), along the wood's edge to their smallholding.
  // (The Barrows' way will fork off the other side, one day.)
  const FORK = { z: MZ0 + 70, x0: MX - 20, x1: MX + 170 };
  { const lm = new THREE.Mesh(new THREE.PlaneGeometry(FORK.x1 - FORK.x0, 9), toonMap(dirtT)); lm.rotation.x = -Math.PI / 2; lm.rotation.z = Math.PI / 2; lm.material = lm.material.clone(); lm.rotation.set(-Math.PI / 2, 0, 0); lm.position.set((FORK.x0 + FORK.x1) / 2, 0.05, FORK.z); lm.receiveShadow = true; root_.add(lm);
    const r3 = rnd(131); for (let x = FORK.x0 + 30; x < FORK.x1 + 60; x += 14) for (const sz of [-1, 1]) { const z = FORK.z + sz * (34 + r3() * 26);      /* (set back from the lane: the camera behind her keeps a clear way along it) */ const h = 56 + r3() * 20, tw = 1.6 + r3();
      solid(root_, new THREE.CylinderGeometry(0.75 * tw, tw, h * 0.7, 9).translate(0, h * 0.35, 0), toonMap(barkT), x, 0, z, { ink: 0.1, shadow: false }); solid(root_, T.ell(11, 8, 11, 12, 8), [T.mat('#4e7a36'), T.mat('#5e8a3e')][(x / 14 | 0) % 2], x, h * 0.78, z, { ink: 0.06 }); }
    // (a finger-post where it leaves the meadow)
    pole(root_, new V3(MX - 14, 0, FORK.z - 7), new V3(MX - 14, 14, FORK.z - 7), 0.45, toonMap(barkT)); box(root_, 8, 2, 0.6, MX - 10, 12.5, FORK.z - 7, toonMap(barkT), { ink: 0.04 }); }

  // The meadow gate, this side: a field gate between two posts, swinging out to the village (js/world.js offers to go through it).
  const gate = (() => { const g = new THREE.Group(); g.position.copy(GATE); root_.add(g); const oak = toonMap(barkT);
    for (const sx of [-1, 1]) box(g, 2.6, 16, 2.6, sx * 12, 8, 0, oak);
    const pivot = new THREE.Group(); pivot.position.set(-11, 0, 0); g.add(pivot);
    for (let k = 0; k < 5; k++) box(pivot, 21, 1.2, 0.8, 10.8, 2.8 + k * 2.6, 0, oak, { ink: 0.04 }); box(pivot, 1, 14, 0.8, 10.8, 8, 0.3, oak, { rot: [0, 0, 0.85], ink: 0.04 });
    world_obstacles.push({ x: GATE.x - 15, z: GATE.z, r: 3 }, { x: GATE.x + 15, z: GATE.z, r: 3 });
    return { pivot, open: 0, target: 0, swing: -1.6, at: GATE.clone().add(new V3(0, 0, -10)), beyond: GATE.clone().add(new V3(0, 0, 14)), name: 'the gate', to: 'the village' }; })();

  // ── Keeping her on the path (a corridor of the width it has there), and off the cabin and its oak at the start.
  const constrain = (q, rad) => {
    // (in the meadow: anywhere within its hedges; out through the gate, when it's open)
    if (q.z > MZ0 + 40) { const p = q.clone(), through = gate.open > 0.5 && Math.abs(p.x - GATE.x) < 10, fork = Math.abs(p.z - FORK.z) < 8 && p.x > MX - 20;
      if (fork) { p.x = clamp(p.x, -MX + rad, FORK.x1); p.z = clamp(p.z, FORK.z - 5, FORK.z + 5); return p; }      // (along the fork's lane)
      p.x = clamp(p.x, -MX + rad, MX - rad); p.z = Math.min(p.z, through ? MZ1 + 20 : MZ1 - 4 - rad); return p; }
    const p = q.clone(), n = nearest(p), w = widthAt(n.i) - rad;
    if (n.d > w) { const c = S[n.i]; p.x = c.x + (p.x - c.x) * w / n.d; p.z = c.z + (p.z - c.z) * w / n.d; }
    // (the cabin's walls, with the oak, behind her at the start)
    if (p.z < 34 + rad && p.x > -40 - rad && p.x < 40 + rad) p.z = 34 + rad;
    return p;
  };
  const progress = p => nearest(p).i / N;
  // (the ways out: the village at the far end; back in at her grandmother's door. And where she comes in: from the cabin's door, or from the
  // village end, a little way in, facing along the path into the wood)
  const inAt = gate.at.clone().add(new V3(0, 0, -8));      // (in at the meadow gate, it behind her, facing across the meadow to the wood)
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: world_obstacles, door: null, chest: null, constrain, bounds: null, gate,
    exits: [{ name: 'the village', get at() { return gate.beyond; }, r: 6, when: () => gate.open > 0.6 }, { name: 'the cabin', at: new V3(-10, 0, 41), r: 4.5 }, { name: 'the Fowlers’', at: new V3(FORK.x1 - 6, 0, FORK.z), r: 8 }],
    entries: { cabin: { at: [-12, 52], yaw: 0, camTurn: Math.PI }, village: { at: [inAt.x, inAt.z], yaw: Math.PI }, fowlers: { at: [FORK.x1 - 30, FORK.z], yaw: -Math.PI / 2 } } };      // (fowlers: back along the fork's lane, toward the meadow)
  for (const k in spots) if (spots[k].seat) world.seats.push(spots[k].seat);

  // ── Light: the sky through the leaves, the fog closing in, the village windows lighting up, the sun's shadows following her.
  let api = null;
  const SKY = [[0, '#d8e4e0'], [0.45, '#f0d2a0'], [0.7, '#c8a4a8'], [1, '#2a3050']];
  const sky = t => { let i = 0; while (i < SKY.length - 2 && t > SKY[i + 1][0]) i++; const a = SKY[i], b = SKY[i + 1]; return new THREE.Color(srgb(a[1])).lerp(new THREE.Color(srgb(b[1])), (t - a[0]) / (b[0] - a[0])); };
  scene.fog = new THREE.Fog(sky(0), 120, 520);
  function light(t, stage) {
    api = stage || api; const c = sky(t);
    scene.background = c; scene.fog.color.copy(c); scene.fog.near = lerp(140, 50, t); scene.fog.far = lerp(560, 260, t);
    if (cabin && cabin.light) cabin.light(t);
  }
  function follow(pos, dt, camera, at) {
    if (!api) return; occlude(api.camera.position, pos); if (cabin && cabin.cut) cabin.cut(api.camera.position, at, dt);      // (and the cabin, if it's in the way of her; at: null, nothing's cut)
    const s = api.sun; s.target.position.copy(pos); s.position.copy(pos).add(new V3(-30, 60, 40)); s.target.updateMatrixWorld();      // (the sun's shadows following her)
  }
  let clock = 0;
  function tick(dt) {
    clock += dt; if (cabin) cabin.tick(dt);
    waterT.offset.y = (waterT.offset.y + dt * 0.25) % 1;
    gate.open += (gate.target - gate.open) * (1 - Math.exp(-dt * 4)); gate.pivot.rotation.y = gate.swing * gate.open;
    for (const p of smoke) { const k = (clock * 0.08 + p.ph) % 1; p.m.position.copy(p.base).add(new V3(k * 4, k * 26, 0)); p.m.scale.setScalar(0.6 + k * 1.6); p.m.material.opacity = 0.45 * (1 - k); }
  }
  return { group: root_, update() {}, tick, light, follow, world, progress, path: { curve, S, N, LEN, nearest, widthAt }, spots, cabin };
}

root.Wood = { build };
})(typeof window !== 'undefined' ? window : globalThis);
