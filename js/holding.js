// Little Red’s Lessons — the Fowlers' smallholding, where the meadow meets the wood: the lane from the wood path's fork (js/wood.js) runs on
// between hedgerows, meadow either side and the wood along the north, to a fence round the holding and its gate. Inside: Peter and his
// grandfather's cottage (built as the village's are: js/village.js's builders), the coop and its run with the hens scratching, the duck on her
// pond, the nets drying on their poles, the garden, the cat on the step.
//
//   const h = Holding.build(scene) → { group, update, tick, light(t, stage), follow, keepCamera, world, spots }
//   Holding.people(P, w): Peter and Master Fowler about their day (the nets, the coop, the pond; the bench, the garden), to talk to.
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE && THREE.Vector3;
const KIT = root.Cottage && root.Cottage.kit;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
// The lane in from the wood's fork runs east between hedgerows, meadow beyond them either side and the wood along the north; it ends at the
// holding's gate in the fence round it. (Where she can go: the lane; and, once she's been let in, the holding.)
const LANE = { x0: -420, x1: -70, z: 14 }, YARD = { x0: -70, x1: 170, z0: -140, z1: 90 }, GATE = { x: -70, z: 14 };

function build(scene) {
  const { canvasTex, toonMap, rnd, textures, box, solid, pole, srgb } = KIT;
  const root_ = new THREE.Group(); scene.add(root_);
  const tx = textures(), r = rnd(311), oak = toonMap(tx.oak), oakDk = T.mat('#4a3020');
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null, exits: [], entries: {}, spots: {} };
  const solids = [], smoke = [], winM = new THREE.MeshBasicMaterial({ color: srgb('#2e2a2a') });
  const { house } = root.Village.builders(root_, world, solids, smoke, winM);
  const V = (x, z) => new V3(x, 0, z);

  // ── The ground: grass; the lane of trodden earth; the yard trodden bare before the door.
  const grassT = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#6f8f44'; x.fillRect(0, 0, w, h); const q = rnd(81); for (let i = 0; i < 500; i++) { x.fillStyle = ['#7a9a4a', '#5e7e3a', '#86a452', '#6a8640'][i % 4]; x.fillRect(q() * w, q() * h, 2, 3 + q() * 3); } }, [90, 90]);
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), toonMap(grassT)); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; g.receiveShadow = true; root_.add(g); }
  const dirt = T.mat('#9a7a52');
  { const lane = new THREE.Mesh(new THREE.PlaneGeometry(LANE.x1 - LANE.x0 + 30, 10), dirt); lane.rotation.x = -Math.PI / 2; lane.position.set((LANE.x0 + LANE.x1) / 2 + 15, 0.04, LANE.z); lane.receiveShadow = true; root_.add(lane);
    const yard = new THREE.Mesh(new THREE.CircleGeometry(48, 28), dirt); yard.rotation.x = -Math.PI / 2; yard.position.set(30, 0.03, -10); yard.scale.set(1.6, 1, 1); yard.receiveShadow = true; root_.add(yard); }

  // ── The hedgerows either side of the lane; the meadow beyond them (flowers in the grass); the wood along the north.
  const hedgeM = [T.mat('#3e6230'), T.mat('#4a6e36')];
  for (const sz of [-1, 1]) for (let x = LANE.x0 - 10, k = 0; x < LANE.x1 - 8; x += 7, k++) { const s1 = 5.5 + r() * 2.5; solid(root_, T.ell(s1, s1 * (0.9 + r() * 0.3), s1, 10, 8), hedgeM[k % 2], x, s1 * 0.6, LANE.z + sz * 21, { ink: 0.05, shadow: false }); }
  { const fg = new THREE.SphereGeometry(0.5, 6, 4), cols = ['#f2d24a', '#e8e4f0', '#c86a9a', '#5a7ad8'], fl = cols.map(c => new THREE.InstancedMesh(fg, T.mat(c), 500)), n = [0, 0, 0, 0], M = new THREE.Matrix4();
    for (let k = 0; k < 4000; k++) { const x = LANE.x0 - 40 + r() * (YARD.x1 - LANE.x0 + 120), z = -240 + r() * 520; const inYard = x > YARD.x0 - 6 && x < YARD.x1 + 6 && z > YARD.z0 - 6 && z < YARD.z1 + 6;
      if (inYard || Math.abs(z - LANE.z) < 28 || z < (x < YARD.x0 - 20 ? -100 : -150)) continue; const c = k % 4; if (n[c] >= 500) continue; M.makeTranslation(x, 1.2 + r() * 0.8, z); fl[c].setMatrixAt(n[c]++, M); }
    fl.forEach((m, c) => { m.count = n[c]; m.castShadow = false; root_.add(m); }); }

  // ── The fence round the holding, its gate where the lane comes in: Master Fowler's to open.
  const fenceM = T.mat('#7a5a38');
  const rail = (a, b) => { const d = b.clone().sub(a), L = d.length(); for (const y of [3.5, 7]) { const m = box(root_, L, 0.8, 0.6, (a.x + b.x) / 2, y, (a.z + b.z) / 2, fenceM, { ink: 0.03 }); m.rotation.y = -Math.atan2(d.z, d.x); }
    const n = Math.ceil(L / 9); for (let k = 0; k <= n; k++) { const p = a.clone().lerp(b, k / n); pole(root_, new V3(p.x, 0, p.z), new V3(p.x, 8.5, p.z), 0.45, oakDk, { ink: 0.04 }); world.obstacles.push({ x: p.x, z: p.z, r: 2 }); }
    for (let k = 0; k < n; k++) { const p = a.clone().lerp(b, (k + 0.5) / n); world.obstacles.push({ x: p.x, z: p.z, r: 2 }); } };
  rail(V(YARD.x0, YARD.z0), V(YARD.x1, YARD.z0)); rail(V(YARD.x1, YARD.z0), V(YARD.x1, YARD.z1)); rail(V(YARD.x1, YARD.z1), V(YARD.x0, YARD.z1));
  rail(V(YARD.x0, YARD.z1), V(YARD.x0, GATE.z + 12)); rail(V(YARD.x0, GATE.z - 12), V(YARD.x0, YARD.z0));
  const gate = (() => { const g = new THREE.Group(); g.position.set(GATE.x, 0, GATE.z); g.rotation.y = Math.PI / 2; root_.add(g);
    for (const sx of [-1, 1]) box(g, 2.2, 12, 2.2, sx * 12, 6, 0, oak);
    const pivot = new THREE.Group(); pivot.position.set(-11, 0, 0); g.add(pivot);
    for (let k = 0; k < 4; k++) box(pivot, 21, 1.1, 0.7, 10.8, 2.6 + k * 2.6, 0, oak, { ink: 0.04 }); box(pivot, 1, 11, 0.7, 10.8, 6.5, 0.3, oak, { rot: [0, 0, 0.8], ink: 0.04 });
    return { pivot, open: 0, target: 0, swing: -1.5 }; })();
  world.holdingGate = gate;

  // ── The cottage: small, old, its thatch low, a bench by the door.
  const CX = 80, CZ = -100;
  house({ x: CX, z: CZ, w: 86, d: 56, eave: 40, ridge: 74, walls: 'frame', doors: [{ side: 'front', at: -14, w: 12, colour: '#5a4a32' }],
    windows: [{ side: 'front', at: 16, y: 15, w: 11, h: 9, box: true }, { side: 'left', at: 0, y: 16, w: 9, h: 8 }], chimney: { x: 32, z: 0, w: 8, d: 8 } });
  const doorAt = V(CX - 14, CZ + 28 + 8);
  { const bx = CX + 14, bz = CZ + 28 + 6; box(root_, 16, 1.2, 4.5, bx, 8.6, bz, oak); for (const sx of [-1, 1]) box(root_, 1.2, 8, 3.6, bx + sx * 6.5, 4, bz, oakDk);
    world.seats.push({ name: 'the bench by the door', at: new V3(bx, 9.2, bz), facing: 0, kind: 'stool' }); world.obstacles.push({ x0: bx - 8, x1: bx + 8, z0: bz - 2.3, z1: bz + 2.3 }); }
  // (the cat, on the step by the door, curled)
  { const g = new THREE.Group(); g.position.set(doorAt.x + 8, 0.6, doorAt.z - 2); root_.add(g); const c = T.mat('#c8823a');
    solid(g, T.ell(2.2, 1.4, 1.6, 10, 8), c, 0, 1.4, 0, { ink: 0.05 }); solid(g, T.ell(1.1, 1, 1, 8, 6), c, 1.8, 2.2, 0.6, { ink: 0.04 });
    for (const sz of [0.3, 1]) solid(g, new THREE.ConeGeometry(0.4, 0.8, 4), c, 2.1, 3.2, sz, { ink: 0.02 }); solid(g, T.ell(1.8, 0.35, 0.35, 6, 4), c, -0.6, 0.7, 1.4, { ink: 0.03, rot: [0, 0.4, 0] }); }

  // ── The coop on its legs and the run, hurdled round, in the north-west corner; the hens.
  const COOP = V(-30, -118), RUN = { x0: -60, x1: 10, z0: -105, z1: -55 };
  { const g = new THREE.Group(); g.position.copy(COOP); root_.add(g); const plank = toonMap(tx.door);
    for (const [x, z] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) box(g, 1.2, 6, 1.2, x, 3, z, oakDk);
    box(g, 22, 12, 16, 0, 12, 0, plank); const roof = new THREE.CylinderGeometry(1, 1, 26, 3); roof.rotateZ(Math.PI / 2); roof.scale(1, 6, 10); solid(g, roof, T.mat('#6a5a44'), 0, 21, 0, { ink: 0.1 });
    box(g, 4, 0.6, 12, 4, 3, 13, plank, { rot: [0.45, 0, 0] });
    world.obstacles.push({ x0: COOP.x - 12, x1: COOP.x + 12, z0: COOP.z - 9, z1: COOP.z + 9 }); solids.push({ x0: COOP.x - 13, x1: COOP.x + 13, z0: COOP.z - 10, z1: COOP.z + 10, top: 26 }); }
  const hurdle = T.mat('#8e6c44');
  const fence = (a, b, gapAt) => { const d = b.clone().sub(a), L = d.length(), n = Math.ceil(L / 8); for (let k = 0; k < n; k++) { const p = a.clone().lerp(b, (k + 0.5) / n); if (gapAt && p.distanceTo(gapAt) < 6) continue;
    const m = box(root_, L / n - 0.4, 5, 0.8, p.x, 2.9, p.z, hurdle, { ink: 0.05 }); m.rotation.y = -Math.atan2(d.z, d.x); world.obstacles.push({ x: p.x, z: p.z, r: 2.4 }); } };
  const runGate = V(RUN.x1, (RUN.z0 + RUN.z1) / 2);
  fence(V(RUN.x0, RUN.z1), V(RUN.x1, RUN.z1)); fence(V(RUN.x0, RUN.z0), V(RUN.x0, RUN.z1)); fence(V(RUN.x1, RUN.z0), V(RUN.x1, RUN.z1), runGate); fence(V(RUN.x0, RUN.z0), V(RUN.x1, RUN.z0));
  const hens = [], henCols = ['#a8643a', '#efe6d4', '#8a4a2a', '#efe6d4', '#c88a4a', '#5a4a3a'];
  for (let k = 0; k < 6; k++) { const g = new THREE.Group(); root_.add(g); const c = T.mat(henCols[k]);
    solid(g, T.ell(1.6, 1.4, 2.1, 10, 8), c, 0, 2.2, 0, { ink: 0.05 }); solid(g, T.ell(0.8, 0.9, 0.8, 8, 6), c, 0, 3.8, 1.4, { ink: 0.04 }); solid(g, T.ell(0.25, 0.45, 0.5, 6, 4), T.mat('#d03a2a'), 0, 4.8, 1.4, { ink: 0.02 });
    solid(g, new THREE.ConeGeometry(0.25, 0.7, 5).rotateX(Math.PI / 2), T.mat('#e0a830'), 0, 3.7, 2.3, { ink: 0.02 }); solid(g, T.ell(1, 1.1, 0.4, 6, 4), c, 0, 3, -1.9, { ink: 0.03, rot: [-0.6, 0, 0] });
    for (const sx of [-0.6, 0.6]) pole(g, new V3(sx, 0, 0), new V3(sx, 1.2, 0), 0.15, T.mat('#e0a830'), { ink: 0 });
    hens.push({ g, x: lerp(RUN.x0 + 8, RUN.x1 - 8, r()), z: lerp(RUN.z0 + 6, RUN.z1 - 6, r()), tx: 0, tz: 0, wait: r() * 3, peck: 0 }); }
  // ── The duck, on her pond in the south-east corner.
  const POND = V(135, 60);
  { const w = new THREE.Mesh(new THREE.CircleGeometry(16, 28), new THREE.MeshBasicMaterial({ color: srgb('#7aa4b8') })); w.rotation.x = -Math.PI / 2; w.position.set(POND.x, 0.08, POND.z); w.scale.set(1.3, 1, 1); root_.add(w);
    const rim = new THREE.Mesh(new THREE.RingGeometry(15, 18, 28), T.mat('#6a7a4a')); rim.rotation.x = -Math.PI / 2; rim.position.set(POND.x, 0.06, POND.z); rim.scale.set(1.3, 1, 1); root_.add(rim);
    world.obstacles.push({ x: POND.x, z: POND.z, r: 20 }); }
  const duck = new THREE.Group(); root_.add(duck);
  { const wh = T.mat('#f2ece0'); solid(duck, T.ell(1.6, 1.1, 2.4, 10, 8), wh, 0, 0.8, 0, { ink: 0.05 }); solid(duck, T.ell(0.8, 0.9, 0.8, 8, 6), wh, 0, 2.3, 1.6, { ink: 0.04 }); solid(duck, T.ell(0.35, 0.18, 0.7, 6, 4), T.mat('#e8a030'), 0, 2.2, 2.5, { ink: 0.02 }); }
  // ── The nets, drying on their poles in the yard's south side; a creel by them.
  const NETS = V(20, 60);
  { const netT = canvasTex(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(70,58,44,0.9)'; x.lineWidth = 1.4; for (let i = 0; i <= w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 8, h); x.stroke(); x.beginPath(); x.moveTo(i, 0); x.lineTo(i - 8, h); x.stroke(); } }, [4, 2]);
    for (const dx of [-24, 0, 24]) pole(root_, new V3(NETS.x + dx, 0, NETS.z), new V3(NETS.x + dx, 18, NETS.z), 0.5, oakDk);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(48, 14, 12, 4), new THREE.MeshBasicMaterial({ map: netT, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    { const p = net.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) - 1.8 * Math.cos(p.getX(i) / 24 * Math.PI * 1.5) ** 2); }
    net.position.set(NETS.x, 10, NETS.z); root_.add(net);
    solid(root_, new THREE.CylinderGeometry(2.2, 1.8, 3.4, 12, 1, true), T.mat('#b08850'), NETS.x + 30, 1.7, NETS.z + 4, { ink: 0.05 }).material.side = THREE.DoubleSide;
    world.obstacles.push({ x0: NETS.x - 25, x1: NETS.x + 25, z0: NETS.z - 1.5, z1: NETS.z + 1.5 }); }
  // ── The garden, east of the cottage.
  const GARDEN = { x0: 115, x1: 165, z0: -60, z1: 20 };
  { const leaf = [T.mat('#4e7a36'), T.mat('#6a9a3e')];
    for (let z = GARDEN.z0 + 8; z < GARDEN.z1 - 4; z += 12) { const bed = new THREE.Mesh(new THREE.PlaneGeometry(GARDEN.x1 - GARDEN.x0 - 8, 6), T.mat('#5a4030')); bed.rotation.x = -Math.PI / 2; bed.position.set((GARDEN.x0 + GARDEN.x1) / 2, 0.05, z); root_.add(bed);
      for (let x = GARDEN.x0 + 8; x < GARDEN.x1 - 6; x += 6) solid(root_, T.ell(2 + r(), 1.5 + r(), 2 + r(), 7, 5), leaf[Math.floor(r() * 2)], x, 1.4, z, { ink: 0.04, shadow: false }); }
    fence(V(GARDEN.x0, GARDEN.z0), V(GARDEN.x1 - 4, GARDEN.z0)); fence(V(GARDEN.x0, GARDEN.z1), V(GARDEN.x1 - 4, GARDEN.z1)); fence(V(GARDEN.x0, GARDEN.z0), V(GARDEN.x0, GARDEN.z1), V(GARDEN.x0, (GARDEN.z0 + GARDEN.z1) / 2)); }

  // ── The wood, close along the north and round the west end; the meadow open to the south, a few trees far out in it.
  const inst = [], kind = (geo, mat, ink) => { const k = { geo, mat, ink, list: [] }; inst.push(k); return k; };
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E_ = new THREE.Euler(), SC = new V3(), P_ = new V3();
  const put = (k, x, y, z, sx, sy, sz, ry) => { E_.set(0, ry || 0, 0); Q.setFromEuler(E_); M.compose(P_.set(x, y, z), Q, SC.set(sx, sy, sz)); k.list.push(M.clone()); };
  const trunk = kind(new THREE.CylinderGeometry(0.75, 1, 1, 9).translate(0, 0.5, 0), oak, 0.12), leaves = [T.mat('#4e7a36'), T.mat('#5e8a3e'), T.mat('#6f9a46')].map(m => kind(T.ell(1, 1, 1, 14, 10), m, 0.06));
  const pine = kind(new THREE.ConeGeometry(1, 1, 9).translate(0, 0.5, 0), T.mat('#2e5a3a'), 0.05);
  const tree = (x, z) => { const h = 58 + r() * 24; if (r() < 0.75) { const tw = 1.8 + r() * 1.2; put(trunk, x, 0, z, tw, h * 0.7, tw, r() * 6); for (let k = 0; k < 3; k++) { const a = r() * 6.3, d = 3 + r() * 5, s1 = 10 + r() * 7; put(leaves[(k + Math.floor(r() * 3)) % 3], x + Math.cos(a) * d, h * (0.72 + 0.14 * k), z + Math.sin(a) * d, s1, s1 * 0.72, s1, r() * 6); } }
    else { put(trunk, x, 0, z, 1.1, h * 0.3, 1.1, 0); for (let k = 0; k < 3; k++) { const w = (9 - k * 2.4) * (0.85 + r() * 0.3); put(pine, x, h * (0.18 + 0.22 * k), z, w, h * 0.42, w, r() * 6); } } };
  for (let k = 0; k < 340; k++) { const x = LANE.x0 - 300 + r() * (YARD.x1 - LANE.x0 + 500), z = (x < YARD.x0 - 20 ? -115 : -175) - r() * 420; tree(x, z); }      // (the wood, north)
  for (let k = 0; k < 80; k++) { const x = LANE.x0 - 80 - r() * 300, z = -180 + r() * 480; if (Math.abs(z - LANE.z) < 32) continue; tree(x, z); }      // (and round the west, either side of the lane)
  for (let k = 0; k < 12; k++) { const x = LANE.x0 + r() * (YARD.x1 - LANE.x0 + 200), z = 180 + r() * 340; tree(x, z); }      // (a few, far out in the meadow)
  for (const k of inst) { if (!k.list.length) continue;
    const m = new THREE.InstancedMesh(k.geo, k.mat, k.list.length); k.list.forEach((mm, i) => m.setMatrixAt(i, mm)); m.castShadow = k === trunk; m.receiveShadow = true; root_.add(m);
    const h = new THREE.InstancedMesh(T.hullGeo(k.geo, k.ink), T.INKM[0], k.list.length); k.list.forEach((mm, i) => h.setMatrixAt(i, mm)); root_.add(h); }

  // ── Where she can go: the lane, between its hedges; through the gate, once it's open, the holding.
  world.constrain = (q, rad, who) => { const p = q.clone(), open = gate.open > 0.5 || !!who, inYard = p.x > YARD.x0 + 1 || (open && p.x > YARD.x0 - 8 && Math.abs(p.z - GATE.z) < 9);      // (who: Peter, his grandfather: theirs, gate or no)
    if (inYard && open) { p.x = clamp(p.x, YARD.x0 - 8, YARD.x1 - 4 - rad); p.z = clamp(p.z, YARD.z0 + 4 + rad, YARD.z1 - 4 - rad); if (p.x < YARD.x0 + 2) p.z = clamp(p.z, GATE.z - 8, GATE.z + 8); return p; }
    p.x = clamp(p.x, LANE.x0 - 40, YARD.x0 - 3 - rad); p.z = clamp(p.z, LANE.z - 9 + rad * 0.5, LANE.z + 9 - rad * 0.5); return p; };
  world.exits.push({ name: 'the wood', at: V(LANE.x0 - 34, LANE.z), r: 10 });
  world.entries.lane = { at: [LANE.x0, LANE.z], yaw: Math.PI / 2 };
  // (where they're found: Peter at the nets (on the yard side, facing them), the coop, the pond; his grandfather on the bench, in the garden, or
  // at the gate, the first time she comes)
  Object.assign(world.spots, {
    nets: { at: V(NETS.x + 6, NETS.z - 8), yaw: 0, look: NETS.clone().setY(10) },
    coop: { at: V(RUN.x1 + 10, (RUN.z0 + RUN.z1) / 2), yaw: -Math.PI / 2, look: V(RUN.x1 - 20, (RUN.z0 + RUN.z1) / 2).setY(2) },
    pond: { at: V(POND.x - 30, POND.z - 4), yaw: Math.PI / 2, look: POND.clone().setY(1) },
    garden: { at: V(GARDEN.x0 - 8, GARDEN.z0 + 20), yaw: Math.PI / 2, look: V(GARDEN.x0 + 10, GARDEN.z0 + 20).setY(2) }, door: { at: doorAt.clone(), yaw: 0, look: doorAt.clone().setY(18) },
    gate: { at: V(GATE.x + 12, GATE.z), yaw: -Math.PI / 2, look: V(GATE.x - 20, GATE.z).setY(16) }, lane: { at: V(GATE.x - 22, GATE.z), yaw: Math.PI / 2, look: V(GATE.x + 10, GATE.z).setY(16) },
  });

  // ── The camera, kept out of the cottage and the coop; the light; the hens, the duck, the gate.
  const inBox = (s, p) => !(p.x < s.x0 || p.x > s.x1 || p.z < s.z0 || p.z > s.z1 || p.y > s.top);
  function keepCamera(camera, target) {
    const t = target, c = camera.position, d = c.clone().sub(t), these = solids.filter(s => !inBox(s, t)); let hit = 1;
    for (let k = 1; k <= 24; k++) { const p = t.clone().addScaledVector(d, k / 24); if (these.some(s => inBox(s, p))) { hit = (k - 1) / 24; break; } }
    if (hit < 1) c.copy(t).addScaledVector(d, Math.max(0.12, hit));
  }
  let api = null;
  const SKY = [[0, '#d4e2e2'], [0.45, '#f0d2a0'], [0.7, '#c8a4a8'], [1, '#2a3050']];
  const sky = t => { let i = 0; while (i < SKY.length - 2 && t > SKY[i + 1][0]) i++; const a = SKY[i], b = SKY[i + 1]; return new THREE.Color(srgb(a[1])).lerp(new THREE.Color(srgb(b[1])), (t - a[0]) / (b[0] - a[0])); };
  scene.fog = new THREE.Fog(sky(0), 220, 900);
  const dark = new THREE.Color(srgb('#2e2a2a')), lit = new THREE.Color(srgb('#ffc86a'));
  function light(t, stage) { api = stage || api; const c = sky(t); scene.background = c; scene.fog.color.copy(c); scene.fog.near = lerp(260, 100, t); scene.fog.far = lerp(1000, 500, t); winM.color.copy(dark).lerp(lit, ss(0.45, 0.8, t)); }
  function follow(pos) { if (!api) return; const s = api.sun; s.target.position.copy(pos); s.position.copy(pos).add(new V3(-30, 60, 40)); s.target.updateMatrixWorld(); }
  let clock = 0;
  function tick(dt) {
    clock += dt;
    for (const p of smoke) { const k = (clock * 0.07 + p.ph) % 1; p.m.position.copy(p.base).add(new V3(k * 5, k * 30, 0)); p.m.scale.setScalar(0.6 + k * 1.8); p.m.material.opacity = 0.42 * (1 - k); }
    for (const h of hens) {
      if ((h.wait -= dt) > 0) { h.peck += dt * 9; h.g.rotation.x = Math.max(0, Math.sin(h.peck)) * 0.5; }
      else { if (!h.tx) { h.tx = lerp(RUN.x0 + 6, RUN.x1 - 6, r()); h.tz = lerp(RUN.z0 + 5, RUN.z1 - 5, r()); } const dx = h.tx - h.x, dz = h.tz - h.z, d = Math.hypot(dx, dz);
        if (d < 1) { h.tx = 0; h.wait = 1 + r() * 4; } else { h.x += dx / d * dt * 6; h.z += dz / d * dt * 6; h.g.rotation.set(0, Math.atan2(dx, dz), 0); } }
      h.g.position.set(h.x, 0, h.z);
    }
    const a = clock * 0.25; duck.position.set(POND.x + Math.cos(a) * 13, 0.1, POND.z + Math.sin(a) * 8); duck.rotation.y = Math.atan2(-Math.sin(a) * 13, Math.cos(a) * 8);
    gate.open += (gate.target - gate.open) * (1 - Math.exp(-dt * 4)); gate.pivot.rotation.y = gate.swing * gate.open;
  }
  return { group: root_, update() {}, tick, light, follow, keepCamera, world, solids };
}

// ── Peter and his grandfather, about their day: Peter at the nets in the morning, the coop at midday, the pond of an afternoon (in at dusk);
// his grandfather on the bench by the door, or in the garden (in by evening); at the gate, the first time she comes. Each to talk to.
const PEOPLE = {
  peter: { rig: 'peter', name: 'Peter', voice: 'peter', tint: '#4a5a3a', bg: '#e2e8d8', at: min => min < H('6:30') || min >= H('20:00') ? null : min < H('11:30') ? 'nets' : min < H('14:00') ? 'coop' : 'pond' },
  fowler: { rig: 'fowler', name: 'Master Fowler', voice: 'fowler', tint: '#5a4a3a', bg: '#e6e0d6', at: min => min < H('6:30') || min >= H('19:00') ? null : (Math.floor(min / 90) % 2 ? 'garden' : 'bench') },      // (up with the birds, as fowlers are)
};
function people(P, w) {
  const W = P.world, looks = root.Looks && Looks.load ? Looks.load() : {}, figs = {};
  const spotOf = name => name === 'bench' ? null : W.spots[name];
  function place(key, where) {
    let f = figs[key]; const D = PEOPLE[key];
    if (!where) { if (f) { P.removeFigure(key); delete figs[key]; } return; }
    if (!f) { const rig = Toon.make(D.rig, looks[D.rig] || {}), motion = Motion.create(rig, { collide: (p, r) => P.collide(p, r, key) }); f = figs[key] = { rig, motion, key, where: null };
      P.addFigure(key, { rig, motion, cast: { name: D.name, voice: D.voice, tint: D.tint, bg: D.bg } }); }
    if (f.where === where) return; f.where = where;
    if (where === 'bench') { const seat = W.seats.find(s => s.name === 'the bench by the door'); const fw = new V3(Math.sin(seat.facing), 0, Math.cos(seat.facing)); f.motion.warp(seat.at.clone().setY(0).addScaledVector(fw, 0.5), seat.facing); f.motion.sit(seat); f.motion.sitW = 1; }
    else { if (f.motion.seat) { f.motion.stand(); } const s = spotOf(where); f.motion.warp(s.at, s.yaw); f.motion.lookAt(s.look); }
  }
  let think = 0;
  const at = k => { const Pt = root.Peter, t = PEOPLE[k].at(w.cal.minute);
    if (k === 'peter' && Pt && Pt.offToday(w)) return null;      // (Peter's day off: in the village)
    if (k === 'fowler' && t && Pt && Pt.fowlerAtGate(w)) return 'gate';      // (the first time she comes: he's at the gate)
    return t; };
  const update = () => { for (const k in PEOPLE) if (!figs[k] || !figs[k].held) place(k, at(k));
    if (root.Peter) root.Peter.atHolding(P, w); };      // (the first visit, the first time she's here with them both about)
  if (root.Peter && root.Peter.letIn(w)) W.holdingGate.target = W.holdingGate.open = 1;      // (she's been let in: the gate stands open to her)
  update();
  P.tick(dt => { if ((think -= dt) <= 0) { think = 1; update(); } for (const k in figs) { figs[k].motion.update(dt, null); figs[k].rig.tick(dt); } });
  // Talking to them.
  function actions() {
    const out = [];
    for (const k in figs) { const f = figs[k]; if (f.held) continue; out.push({ label: 'Talk to ' + PEOPLE[k].name, at: f.motion.pos.clone().setY(18), run: () => talk(k) }); }
    return out;
  }
  async function talk(key) {
    const f = figs[key]; if (!f) return; f.held = true;
    try {
      const m = P.motion, away = m.pos.clone().sub(f.motion.pos).setY(0); if (away.lengthSq() < 1) away.set(0, 0, 1); away.normalize();
      const at = P.collide(f.motion.pos.clone().setY(0).addScaledVector(away, 14), 3.2); await m.goTo(at, Math.atan2(f.motion.pos.x - at.x, f.motion.pos.z - at.z));
      if (!f.motion.seat) { f.motion.lookAt(null); f.motion.face(Math.atan2(m.pos.x - f.motion.pos.x, m.pos.z - f.motion.pos.z)); }
      const st = w.save.state.fowlers || (w.save.state.fowlers = { met: {}, talked: {} }), first = !st.met[key], today = st.talked[key] === w.cal.day;
      const sending = key === 'peter' && root.Peter && root.Peter.awaiting(w) && figs.fowler;      // (the first visit: his grandfather comes over as they finish, to send him home with her)
      const script = sending ? root.Peter.firstTalk(P, w, figs.fowler, f) : root.Story.fowlers(key, { first, today, day: w.cal.day, part: w.cal.part });
      await P.converse(script, { shot: ['red', key] });
      if (sending) { await root.Peter.sendHome(P, w); return; }
      if (!today) w.rep.trusts(key, 0.25);
      w.save.change(s => { s.fowlers = s.fowlers || { met: {}, talked: {} }; s.fowlers.met[key] = true; s.fowlers.talked[key] = w.cal.day; }, { fowlers: true });
    } finally { if (w.P === P) { f.held = false; f.where = null; update(); } }      // (unless she's gone: walked home)
  }
  return { actions, figs, talk };
}

const api = { build, people, PEOPLE };
root.Holding = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
