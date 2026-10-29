// Little Red’s Lessons — Mama's garden (Mary's, of the rhyme), behind the cottage: the silver bells, the cockle shells and the pretty maids all in
// a row, between the beds of a garden that feeds them (onions, cabbages, beans). Red's part, every day: the weeds, wherever they've come up; the
// flowers watered (her mother's, and only to be watered); the vegetables tended. She works from the paths between the rows, and has to walk
// them carefully: step off one into a row of flowers and they're trampled, out of their line, and their petals cling to her boots a while.
//
// Every few days her mother goes round the garden at dusk, and if her flowers have been trodden she asks Red about it. Owning up, she's
// corrected for her carelessness. A lie holds, unless it was that day and the petals are still on her boots; but someone in the village may
// have seen, and then her mother hears of it, and the next evening she's corrected for the carelessness and the lie together.
//
//   Garden.build(parent, world)        (js/village.js: the plot, its rows and paths, the flowers; → world.marenGarden)
//   const g = Garden.attach(P, w)      (the village, played: g.actions() · its weeds, its trampling) · Garden.boots(P, w) (the petals, anywhere)
//   Garden.progress(w) → what's left today · Garden.evening(P, w, force) (at home: her mother's look round, if it's the day for it)
//   (evening → whether a correction was given)
//   Garden.plan(day) → the day's weeds, dry rows and jobs (the same for a day, however it's asked) · Garden.offToday(w) → 'maren' | 'after' | null
// The garden's state is kept in the save (state.garden): { day, pulled: [i], watered: { row }, jobs: { row }, can, water, trampled: { id: day },
// petals: [{ c, until }], petalDay, seen: { day: who }, checked, evening, pending: { day, who, rows }, rest (a day her mother has it to herself) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
function hash(day, k) { let h = (day * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519); h ^= h >>> 13; return (h >>> 0) / 4294967296; }

// ── The plot: fenced, its gate on the west side by the cottage. Rows run east and west, flowers and vegetables in turn, with a path between each
// two and a headland down either side; the water butt in the south-east corner, the can at its foot.
const X0 = -344, X1 = -214, Z0 = -514, Z1 = -384, RX0 = -331, RX1 = -227;
const ROWS = [
  { id: 'maids', kind: 'flowers', name: 'the pretty maids', z: -414 },
  { id: 'onions', kind: 'veg', name: 'the onions', z: -431, job: 'Hoe between the onions' },
  { id: 'cockles', kind: 'flowers', name: 'the cockle shells', z: -448 },
  { id: 'cabbages', kind: 'veg', name: 'the cabbages', z: -465, job: 'Pick the caterpillars off the cabbages' },
  { id: 'bells', kind: 'flowers', name: 'the silver bells', z: -482 },
  { id: 'beans', kind: 'veg', name: 'the beans', z: -499, job: 'Tie the beans up their poles' },
];
const PATHS = [-397, -422.5, -439.5, -456.5, -473.5, -490.5, -508],      // (paths between the rows wide enough to walk without brushing the beds; the one by the house wide, for the bench)
      HEAD = [-338.5, -219.5];
const BUTT = V3 ? new V3(-219, 0, -389) : null, CAN = V3 ? new V3(-226, 0, -390) : null;
const BENCH = { x: -296, z: -388.5, w: 18, d: 4, y: 8 }, GATE = { x: X0, z: -397 };      // (the potting bench along the fence by the house: the trowel on it, room for a basket; the gate, from the path by the cottage)      // (no THREE under node's tests: the plan and the state only)
const PER_ROW = 24, STEP = 4.3, fx = i => RX0 + 2 + i * STEP;
const FLOWERS = ROWS.filter(r => r.kind === 'flowers');
const inside = p => p.x > X0 && p.x < X1 && p.z > Z0 && p.z < Z1;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const WATER_PER_FILL = 2;

// The day's work, which varies: a few weeds (one to four), wherever they've come up (in any bed: between the flowers, in the rows of greens);
// the flower rows that are dry (all three on a dry day, some, or none after rain in the night); one or two of the vegetables' jobs. And some
// days none of it: her mother has the time and sees to it herself (about one day in five), or it's the day after a correction for the garden,
// when she sets her flowers straight again herself (see offToday).
function plan(day) {
  const weeds = [], n = 1 + Math.floor(hash(day, 99) * 4);
  for (let k = 0; k < n; k++) { const row = ROWS[Math.floor(hash(day, 100 + k) * ROWS.length)], i = Math.floor(hash(day, 200 + k) * (PER_ROW - 1));
    weeds.push({ row: row.id, x: fx(i) + STEP / 2, z: row.z + (hash(day, 300 + k) - 0.5) * 2.4 }); }
  const wet = hash(day, 410), dry = wet < 0.25 ? [] : FLOWERS.filter((r, i) => wet > 0.7 || hash(day, 420 + i) < 0.6).map(r => r.id);
  const veg = ROWS.filter(r => r.kind === 'veg'), skip = Math.floor(hash(day, 400) * veg.length), jobs = veg.filter((_, i) => i !== skip).map(r => r.id);
  return { weeds, dry: dry.length || wet < 0.25 ? dry : [FLOWERS[Math.floor(hash(day, 430) * FLOWERS.length)].id], jobs: hash(day, 440) < 0.4 ? jobs : jobs.slice(0, 1), rained: wet < 0.25 };
}
const MAREN_TENDS = 0.2;
// (her mother's day in the garden: no work for Red)
function offToday(w) { const g = stateOf(w), d = w.cal.day; return g.rest === d ? 'after' : hash(d, 500) < MAREN_TENDS ? 'maren' : null; }

// ── Building it (js/village.js gives it the village's root; the fence is the village's own).
function build(parent, world) {
  const T = root.Toon, G = new THREE.Group(); parent.add(G);
  const mat = c => T.mat(c), M = { soil: mat('#5a4030'), wet: mat('#3a281c'), path: mat('#9a8462'), stem: mat('#4e7a36'), leaf: mat('#6a9a3e'), dark: mat('#3e6a2a'), pole: mat('#7a5a38'), onion: mat('#efe6cf'), wood: mat('#6a4a2c'), hoop: mat('#3a3634') };
  const mesh = (geo, m, x, y, z, o) => { o = o || {}; const g = new THREE.Mesh(geo, m); g.position.set(x, y, z); if (o.rot) g.rotation.set(...o.rot); if (o.ink) g.add(new THREE.Mesh(T.hullGeo(geo, o.ink), T.INKM[0])); g.castShadow = o.shadow !== false; g.receiveShadow = true; G.add(g); return g; };
  // (the paths: trodden earth, along each row and down the headlands)
  for (const z of PATHS) mesh(new THREE.BoxGeometry(X1 - X0 - 2, 0.12, z === PATHS[0] ? 24 : 10.6), M.path, (X0 + X1) / 2, 0.07, z, { shadow: false });
  for (const x of HEAD) mesh(new THREE.BoxGeometry(10, 0.12, Z1 - Z0 - 2), M.path, x, 0.07, (Z0 + Z1) / 2, { shadow: false });
  // (the beds: dug earth, a flower bed darker once it's watered)
  const beds = {};
  for (const r of ROWS) { const b = mesh(new THREE.BoxGeometry(RX1 - RX0, 0.6, 6), M.soil, (RX0 + RX1) / 2, 0.3, r.z, { shadow: false }); if (r.kind === 'flowers') { b.material = M.soil.clone(); b.userData.keep = true; } beds[r.id] = b; }
  // The vegetables, still (merged with the rest of the village): onions in two lines, cabbages, and beans up their poles.
  const onions = ROWS.find(r => r.id === 'onions'), cab = ROWS.find(r => r.id === 'cabbages'), beans = ROWS.find(r => r.id === 'beans');
  for (let x = RX0 + 2; x < RX1 - 1; x += 3) for (const dz of [-1.4, 1.4]) { mesh(new THREE.SphereGeometry(0.75, 6, 4), M.onion, x + (dz > 0 ? 1.5 : 0), 0.8, onions.z + dz, { shadow: false });
    for (const a of [-0.25, 0.25]) mesh(new THREE.ConeGeometry(0.18, 3.2, 4), M.dark, x + (dz > 0 ? 1.5 : 0) + a, 2.6, onions.z + dz, { rot: [0, 0, a], shadow: false }); }
  for (let x = RX0 + 4; x < RX1 - 2; x += 6) mesh(T.ell(2.3, 1.7, 2.3, 8, 6), M.leaf, x, 1.6, cab.z, { ink: 0.05 });
  for (let x = RX0 + 4; x < RX1 - 2; x += 8) for (const dz of [-1.6, 1.6]) { mesh(new THREE.CylinderGeometry(0.22, 0.28, 15, 5), M.pole, x, 7.3, beans.z + dz, { rot: [-dz * 0.07, 0, 0], ink: 0.06 });
    for (let y = 3; y < 13; y += 3) mesh(T.ell(1.1, 1.3, 1.1, 6, 4), M.leaf, x + (y % 2 ? 0.6 : -0.6), y, beans.z + dz * 0.8, { shadow: false }); }
  // The picket fence round it, the gate in the west side where the path from the cottage comes in; the gate swings open as she comes to it.
  { const pale = mat('#ece6d6'), post = mat('#d8d0bc'), geo = new THREE.BoxGeometry(0.9, 6.2, 0.35), tip = new THREE.ConeGeometry(0.62, 1.1, 4).rotateY(Math.PI / 4), pts = [];
    const inGap = (p, gap) => gap && Math.abs(p.z - gap.z) < 6 && Math.abs(p.x - gap.x) < 1;
    const run = (a, b, gap) => { const d = b.clone().sub(a), L = d.length(), n = Math.floor(L / 1.7), np = Math.ceil(L / 9);
      for (let k = 0; k <= n; k++) { const p = a.clone().lerp(b, k / n); if (!inGap(p, gap)) pts.push([p, Math.atan2(d.x, d.z)]); }
      for (let k = 0; k <= np; k++) { const p = a.clone().lerp(b, k / np); if (inGap(p, gap)) continue; world.obstacles.push({ x: p.x, z: p.z, r: 1.4 }); mesh(new THREE.BoxGeometry(1.3, 7.4, 1.3), post, p.x, 3.7, p.z, { ink: 0.04 }); }
      for (const p of [gap && new V3(gap.x, 0, gap.z - 6), gap && new V3(gap.x, 0, gap.z + 6)]) if (p) { world.obstacles.push({ x: p.x, z: p.z, r: 1.4 }); mesh(new THREE.BoxGeometry(1.5, 8, 1.5), post, p.x, 4, p.z, { ink: 0.04 }); }      // (the gateposts)
      const segs = gap ? [[a, new V3(a.x, 0, gap.z + (a.z < gap.z ? -6 : 6))], [new V3(a.x, 0, gap.z + (a.z < gap.z ? 6 : -6)), b]] : [[a, b]];
      for (const y of [2, 4.6]) for (const [p0, p1] of segs) { const dd = p1.clone().sub(p0), LL = dd.length(); if (LL < 1) continue; const r = mesh(new THREE.BoxGeometry(0.5, 0.7, LL), post, (p0.x + p1.x) / 2, y, (p0.z + p1.z) / 2, { shadow: false }); r.rotation.y = Math.atan2(dd.x, dd.z); } };
    run(new V3(X0, 0, Z1), new V3(X1, 0, Z1)); run(new V3(X1, 0, Z1), new V3(X1, 0, Z0)); run(new V3(X1, 0, Z0), new V3(X0, 0, Z0)); run(new V3(X0, 0, Z0), new V3(X0, 0, Z1), new V3(GATE.x, 0, GATE.z));
    const pales = new THREE.InstancedMesh(geo, pale, pts.length), tips = new THREE.InstancedMesh(tip, pale, pts.length), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion();
    pts.forEach(([p, yaw], i) => { Q.setFromAxisAngle(new V3(0, 1, 0), yaw); M4.compose(new V3(p.x, 3.1, p.z), Q, new V3(1, 1, 1)); pales.setMatrixAt(i, M4); M4.compose(new V3(p.x, 6.75, p.z), Q, new V3(1, 1, 1)); tips.setMatrixAt(i, M4); });
    pales.castShadow = true; pales.userData.keep = tips.userData.keep = true; G.add(pales, tips);
    // (the gate: pales on a frame, hung from the post on the house side)
    const hinge = new THREE.Group(); hinge.position.set(GATE.x, 0, GATE.z + 6); hinge.userData.keep = true; G.add(hinge);
    for (let k = 0; k < 7; k++) { const z = -0.85 - k * 1.7; const pl = new THREE.Mesh(geo, pale); pl.position.set(0, 3.1, z); hinge.add(pl); const tp = new THREE.Mesh(tip, pale); tp.position.set(0, 6.75, z); hinge.add(tp); }
    for (const y of [2, 4.6]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 12), post); r.position.set(0.45, y, -6); hinge.add(r); }
    world.gardenGate = { hinge, open: 0 }; }
  // The potting bench by the house fence: the trowel on it.
  { const wood = M.wood; mesh(new THREE.BoxGeometry(BENCH.w, 0.8, BENCH.d), wood, BENCH.x, BENCH.y, BENCH.z, { ink: 0.05 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.7, BENCH.y, 0.7), wood, BENCH.x + sx * (BENCH.w / 2 - 0.8), BENCH.y / 2, BENCH.z + sz * (BENCH.d / 2 - 0.5), { shadow: false });
    world.obstacles.push({ x0: BENCH.x - BENCH.w / 2 - 0.5, x1: BENCH.x + BENCH.w / 2 + 0.5, z0: BENCH.z - BENCH.d / 2 - 0.5, z1: BENCH.z + BENCH.d / 2 + 0.5 }); }
  const trowel = trowelProp(); trowel.obj.position.set(BENCH.x - 5, BENCH.y + 0.6, BENCH.z); trowel.obj.rotation.set(0, 0.3, Math.PI / 2); trowel.obj.userData.keep = true; G.add(trowel.obj);
  // The water butt in the corner, and the can at its foot.
  mesh(new THREE.CylinderGeometry(3, 2.7, 7, 14), M.wood, BUTT.x, 3.5, BUTT.z, { ink: 0.08 });
  for (const y of [1.4, 5.6]) mesh(new THREE.TorusGeometry(2.95, 0.18, 4, 18).rotateX(Math.PI / 2), M.hoop, BUTT.x, y, BUTT.z, { shadow: false });
  mesh(new THREE.CircleGeometry(2.6, 14).rotateX(-Math.PI / 2), mat('#4a6a7a'), BUTT.x, 6.6, BUTT.z, { shadow: false });
  world.obstacles.push({ x: BUTT.x, z: BUTT.z, r: 3.3 });
  const can = canProp(); can.obj.position.copy(CAN).setY(2.6); can.obj.userData.keep = true; G.add(can.obj);

  // ── The flowers, each its own, so each can be trodden down: one instanced mesh for each part of each kind (stems, blooms, hearts).
  const join = list => { let n = 0; const gs = list.map(([g, m4]) => { const q = (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(m4); n += q.attributes.position.count; return q; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0; for (const q of gs) { if (!q.attributes.normal) q.computeVertexNormals(); pos.set(q.attributes.position.array, o); nor.set(q.attributes.normal.array, o); o += q.attributes.position.count * 3; }
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return out; };
  const at = (x, y, z, rx, rz, s) => new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, 0, rz || 0)), new V3(1, 1, 1).multiplyScalar(s || 1));
  const stemOf = h => [[new THREE.CylinderGeometry(0.2, 0.28, h, 5), at(0, h / 2, 0)], [new THREE.SphereGeometry(1, 6, 4).scale(1.1, 0.25, 0.5), at(0.9, h * 0.3, 0, 0, 0.5)], [new THREE.SphereGeometry(1, 6, 4).scale(1.1, 0.25, 0.5), at(-0.9, h * 0.45, 0, 0, -0.5)]];
  const two = c => { const q = mat(c).clone(); q.side = THREE.DoubleSide; return q; };
  // (a bell, hanging: flared at the mouth; a cockle shell, a scalloped fan standing up from the stem, its ribs pressed in, facing the paths)
  const BELL = new THREE.LatheGeometry([[0.12, 0.1], [0.45, -0.2], [0.75, -0.9], [1.0, -1.55], [1.3, -1.85]].map(([r, y]) => new THREE.Vector2(r, y)), 10);
  const SHELL = (() => { const g = new THREE.CircleGeometry(1.6, 28, 0, Math.PI), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), r = Math.hypot(x, y), a = Math.atan2(y, x); const rib = Math.cos(a * 14); p.setZ(i, 0.1 * r * rib - 0.16 * r * r); p.setXY(i, x * (1 + 0.04 * rib), y * (1 + 0.04 * rib)); }
    g.computeVertexNormals(); return g; })();
  const KINDS = {
    // (silver bells: pale bells, three to a stem, hanging from its arching top)
    bells: { parts: [[stemOf(9), M.stem], [[[0.9, 8.8, 0], [-0.8, 7.6, 0.4], [0.3, 6.5, -0.7]].map(([x, y, z]) => [BELL, at(x, y, z)]), two('#dfe6f2')]], colour: '#dfe6f2' },
    // (cockle shells: ribbed fans of coral, two to a stem)
    cockles: { parts: [[stemOf(6.5), M.stem], [[[0, 6.4, 0, 0.3, 0], [0.9, 4.6, 0.3, -0.4, Math.PI]].map(([x, y, z, r, turn]) => [SHELL, at(x, y, z, -0.25, r).multiply(new THREE.Matrix4().makeRotationY(turn))]), two('#ee8a72')]], colour: '#ee8a72' },
    // (pretty maids: white daisies on straight stems, golden at the heart, all in a row)
    maids: { parts: [[stemOf(7.5), M.stem], [[[new THREE.CylinderGeometry(1.5, 1.5, 0.25, 12), at(0, 7.6, 0, 0.35)]], mat('#f6f2ea')], [[[new THREE.SphereGeometry(0.55, 8, 5), at(0, 7.85, 0.1, 0.35)]], mat('#e8c040')]], colour: '#f6f2ea' },
  };
  const flowers = [], inst = {};
  for (const r of FLOWERS) {
    const K = KINDS[r.id]; inst[r.id] = K.parts.map(([list, m]) => { const im = new THREE.InstancedMesh(join(list), m, PER_ROW); im.castShadow = true; im.userData.keep = true; G.add(im); return im; });
    for (let i = 0; i < PER_ROW; i++) flowers.push({ id: r.id + ':' + i, row: r.id, i, x: fx(i), z: r.z + (i % 2 ? 0.5 : -0.5), yaw: hash(i, r.z) * 6.28, colour: K.colour, down: false });
  }
  // (standing, or trodden down: over toward the path, crushed, out of its line)
  const place = f => { const m = f.down ? at(f.x + 0.6, 0.2, f.z, 1.25 * (f.i % 2 ? 1 : -1), 0.4, 0.8) : at(f.x, 0, f.z); const q = new THREE.Matrix4().makeRotationY(f.yaw); m.multiply(q);
    for (const im of inst[f.row]) { im.setMatrixAt(f.i, m); im.instanceMatrix.needsUpdate = true; } };
  flowers.forEach(place);

  world.marenGarden = {
    X0, X1, Z0, Z1, ROWS, PATHS, BUTT, CAN, BENCH, GATE, group: G, flowers, can, trowel,
    tread(id, down) { const f = flowers.find(q => q.id === id); if (f && f.down !== down) { f.down = down; place(f); } },
    water(row, wet) { const b = beds[row]; if (b) b.material.color.copy(wet ? M.wet.color : M.soil.color); },
  };
  return world.marenGarden;
}
// The trowel: a short wooden handle, a pointed iron blade.
function trowelProp() {
  const T = root.Toon, g = new THREE.Group(), add = (geo, c, y) => { const m = new THREE.Mesh(geo, T.mat(c)); m.position.y = y; m.add(new THREE.Mesh(T.hullGeo(geo, 0.04), T.INKM[0])); m.castShadow = true; g.add(m); return m; };
  add(new THREE.CylinderGeometry(0.3, 0.34, 2.8, 8), '#8a6a42', -1.4); add(new THREE.ConeGeometry(0.75, 2.6, 4).scale(1, 1, 0.25), '#7a7e80', -4.1).rotation.x = Math.PI;
  return { obj: g, name: 'the trowel', kind: 'trowel', grip: new V3(0, -0.6, 0), radius: 0.8, keep: true, style: 'hang' };
}
// The watering can: a squat tin can with a long spout and a handle over the top.
function canProp() {
  const T = root.Toon, g = new THREE.Group(), tin = T.mat('#8a9092'), add = (geo, x, y, z, r) => { const m = new THREE.Mesh(geo, tin); m.position.set(x, y, z); if (r) m.rotation.set(...r); m.add(new THREE.Mesh(T.hullGeo(geo, 0.05), T.INKM[0])); m.castShadow = true; g.add(m); return m; };
  add(new THREE.CylinderGeometry(1.5, 1.6, 2.8, 12), 0, -2.6, 0); add(new THREE.CylinderGeometry(0.16, 0.24, 3.6, 6), 0, -2.2, 2.4, [1.0, 0, 0]); add(new THREE.CylinderGeometry(0.5, 0.25, 0.5, 8), 0, -0.9, 3.8, [1.0, 0, 0]);
  add(new THREE.TorusGeometry(1.3, 0.14, 4, 12, Math.PI), 0, -1.2, 0, [0, Math.PI / 2, 0]);
  return { obj: g, name: 'the watering can', grip: new V3(0, 0.1, 0), radius: 1.6, keep: true, style: 'hang' };
}

// ── The day's state, begun afresh each morning (what she's trodden, and who saw, stays until her mother's been round).
function stateOf(w) {
  const s = w.save.state, day = w.cal.day;
  const g = s.garden || (s.garden = { day: 0, pulled: [], watered: {}, jobs: {}, can: 'butt', water: 0, trampled: {}, petals: [], petalDay: 0, seen: {}, checked: day, evening: 0, pending: null });
  if (g.day !== day) { g.day = day; g.pulled = []; g.watered = {}; g.jobs = {}; g.can = 'butt'; g.water = 0; g.trowel = 'bench'; }
  if (!g.trowel) g.trowel = 'bench';      // (and a basket she's left on the bench: g.basket = { full }, there till she takes it)
  if (g.petalDay !== day) { g.petals = []; g.petalDay = day; }
  return g;
}
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.garden); }, { garden: true });
// What's left today: weeds, rows to water, jobs, and the can to put back.
function progress(w) {
  const g = stateOf(w), p = plan(w.cal.day);
  const weeds = p.weeds.length - g.pulled.length, dry = FLOWERS.filter(r => p.dry.includes(r.id) && !g.watered[r.id]).map(r => r.name), jobs = p.jobs.filter(id => !g.jobs[id]).map(id => ROWS.find(r => r.id === id).job);
  const can = g.can !== 'butt', trowel = g.trowel !== 'bench';
  return { weeds, dry, jobs, can, trowel, begun: g.pulled.length + Object.keys(g.watered).length + Object.keys(g.jobs).length > 0, done: !weeds && !dry.length && !jobs.length && !can && !trowel };
}
function progressText(w) {
  const p = progress(w), parts = [];
  if (p.weeds) parts.push(p.weeds + (p.weeds > 1 ? ' weeds' : ' weed'));
  if (p.dry.length) parts.push(p.dry.join(' and ').replace(/^the /, '') + ' to water');
  for (const j of p.jobs) parts.push(j.toLowerCase());
  if (!p.dry.length && p.can) parts.push('the can back by the butt');
  if (!p.jobs.length && p.trowel) parts.push('the trowel back on the bench');
  return parts.join('; ');
}

// ── In the village: her work there, offered from close by (from the path beside it), and the flowers she treads on as she goes.
function attach(P, w) {
  const G = P.world.marenGarden; if (!G) return null;
  const S = root.Story, cal = w.cal, rep = w.rep, m = P.motion, T = root.Toon;
  const flat = p => new V3(p.x, 0, p.z), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  // (the path nearest her beside a row, at x: where she stands to work at it)
  const pathBeside = (row, x) => { const r = ROWS.find(q => q.id === row), ps = PATHS.filter(z => Math.abs(z - r.z) < 15), z = ps.sort((a, b) => Math.abs(a - m.pos.z) - Math.abs(b - m.pos.z))[0]; return new V3(Math.min(RX1 - 1, Math.max(RX0 + 1, x)), 0, z); };
  const near = (p, d) => flat(m.pos).distanceTo(p) < (d || 14);
  // The weeds, as they are today.
  const weeds = plan(cal.day).weeds.map((wd, i) => { const g = new THREE.Group(); g.position.set(wd.x, 0.5, wd.z);
    for (let k = 0; k < 4; k++) { const geo = new THREE.ConeGeometry(0.35, 2.6 + k * 0.4, 4), b = new THREE.Mesh(geo, T.mat('#5a7a2a')); b.position.set(Math.cos(k * 1.7) * 0.5, 1.3, Math.sin(k * 1.7) * 0.5); b.rotation.set(Math.sin(k) * 0.5, 0, Math.cos(k) * 0.5); g.add(b); }
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.55, 6, 4), T.mat('#f0d030')); fl.position.y = 3.4; g.add(fl); P.stage.scene.add(g); return Object.assign({ i, g }, wd); });
  // (as the garden is now: what's been done today, what's trodden down)
  function show() {
    const g = stateOf(w);
    for (const wd of weeds) wd.g.visible = !g.pulled.includes(wd.i);
    const today = plan(cal.day); for (const r of FLOWERS) G.water(r.id, !!g.watered[r.id] || !today.dry.includes(r.id));      // (watered, or wet from the night's rain, or not wanting it today)
    for (const f of G.flowers) G.tread(f.id, !!g.trampled[f.id]);
    G.can.obj.visible = g.can === 'butt'; G.trowel.obj.visible = g.trowel === 'bench';
    if (g.can !== 'butt' && !m.carry) { const c = canProp(); P.stage.scene.add(c.obj); m.hold(c, 'hang'); }      // (still in her hands, if she went off with it)
    if (g.trowel !== 'bench' && !m.carry) { const t = trowelProp(); P.stage.scene.add(t.obj); m.hold(t, 'hang'); }
    benchBasket();
  }
  // (a basket she's left on the bench: there till she takes it again)
  let onBench = null;
  function benchBasket() {
    const b = stateOf(w).basket; if (onBench) { P.stage.scene.remove(onBench.obj); onBench = null; } if (!b || !w.chores) return;
    onBench = w.chores.prop('basket', { empty: !b.full }); onBench.obj.position.set(BENCH.x + 4, BENCH.y + 0.4, BENCH.z); P.stage.scene.add(onBench.obj);
  }
  show(); boots(P, w);
  const objective = () => w.refresh();
  // (a few minutes of the day for each piece of work)
  const spend = n => { cal.advance(n); objective(); };
  const finished = async () => {
    const pr = progress(w); if (!pr.done || !w.chores) return;
    w.chores.gardenDone();
    const n = cal.day % S.GARDEN.length; for (const [face, text] of S.GARDEN[n]) P.talk.muse(text, { face });
  };
  // Her work: what's offered, from close by.
  function actions() {
    if (!inside(m.pos) || !w.chores) return [];
    const g = stateOf(w), out = [], atBench = near(new V3(BENCH.x, 0, BENCH.z), 16);
    const basketAt = new V3(BENCH.x + 4, BENCH.y + 3, BENCH.z), trowelAt = new V3(BENCH.x - 5, BENCH.y + 1, BENCH.z);      // (each at its own end of the bench: the one she's nearer offered first)
    // (a basket left on the bench, from before baskets were put down anywhere: taken up again)
    if (atBench && !m.carry && g.basket) out.push({ label: 'Take your basket', at: basketAt, run: basketUp });
    if (!w.chores.on() || w.chores.gardenTended()) return out;
    const holding = m.carry && m.carry.name === 'the watering can', trowelHeld = m.carry && m.carry.kind === 'trowel', hoe = plan(cal.day).jobs.includes('onions') && !g.jobs.onions;
    if (atBench && g.trowel === 'bench' && hoe) out.push({ label: 'Take the trowel', at: trowelAt, run: m.carry ? () => P.handsFull() : takeTrowel, full: !!m.carry });      // (her hands full: she'll have to put down what she has)
    if (atBench && trowelHeld && !hoe) out.push({ label: 'Put the trowel back', at: trowelAt, run: putTrowel });
    if (trowelHeld && hoe) { const r = ROWS.find(q => q.id === 'onions'), p = pathBeside('onions', m.pos.x); if (Math.abs(m.pos.z - p.z) < 4.5 && m.pos.x > RX0 && m.pos.x < RX1) out.push({ label: r.job, at: new V3(m.pos.x, 4, r.z), run: () => job(r, p) }); }
    if (g.can === 'butt' && progress(w).dry.length && near(CAN, 12)) out.push({ label: 'Take the watering can', at: CAN.clone().setY(3), run: m.carry ? () => P.handsFull() : takeCan, full: !!m.carry });
    if (holding && g.water < WATER_PER_FILL && progress(w).dry.length && near(BUTT, 12)) out.push({ label: 'Fill the can at the butt', at: BUTT.clone().setY(6), run: fill });
    if (holding && !progress(w).dry.length && near(CAN, 12)) out.push({ label: 'Put the can back by the butt', at: CAN.clone().setY(3), run: putCan });
    if (holding && g.water > 0) for (const r of FLOWERS) if (plan(cal.day).dry.includes(r.id) && !g.watered[r.id]) { const p = pathBeside(r.id, m.pos.x); if (Math.abs(m.pos.z - p.z) < 4.5 && m.pos.x > RX0 - 10 && m.pos.x < RX1 + 10) out.push({ label: 'Water ' + r.name, at: p.clone().setY(12), run: () => water(r) }); }
    if (!m.carry) {
      for (const wd of weeds) if (!g.pulled.includes(wd.i)) { const p = pathBeside(wd.row, wd.x); if (near(p, 12)) out.push({ label: 'Pull up the weed', at: new V3(wd.x, 3, wd.z), run: () => pull(wd, p) }); }
      for (const id of plan(cal.day).jobs) if (!g.jobs[id] && id !== 'onions') { const r = ROWS.find(q => q.id === id), p = pathBeside(id, m.pos.x); if (Math.abs(m.pos.z - p.z) < 4.5 && m.pos.x > RX0 && m.pos.x < RX1) out.push({ label: r.job, at: new V3(m.pos.x, 4, r.z), run: () => job(r, p) }); }      // (the onions want the trowel: see above)
    }
    return out;
  }
  const benchStand = () => P.collide(new V3(BENCH.x, 0, BENCH.z - BENCH.d / 2 - 6), 3.2);
  async function basketUp() { const s = benchStand(); await m.goTo(s, yawTo(s, new V3(BENCH.x, 0, BENCH.z))); await m.reach('R', new V3(BENCH.x + 4, BENCH.y + 3, BENCH.z)); const b = stateOf(w).basket;
    change(w, g => { g.basket = null; }); benchBasket(); const it = w.chores.prop('basket', { empty: !b.full }); P.stage.scene.add(it.obj); m.hold(it, it.style); await m.release('R'); objective(); }
  async function takeTrowel() { const s = benchStand(); await m.goTo(s, yawTo(s, new V3(BENCH.x, 0, BENCH.z))); await m.reach('R', G.trowel.obj.position.clone()); G.trowel.obj.visible = false; const t = trowelProp(); P.stage.scene.add(t.obj); m.hold(t, 'hang'); await m.release('R'); change(w, g => { g.trowel = 'held'; }); objective(); }
  async function putTrowel() { const s = benchStand(); await m.goTo(s, yawTo(s, new V3(BENCH.x, 0, BENCH.z))); await m.reach('R', G.trowel.obj.position.clone()); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); G.trowel.obj.visible = true; await m.release('R'); change(w, g => { g.trowel = 'bench'; }); objective(); await finished(); }
  async function takeCan() { await m.goTo(CAN.clone().add(new V3(-4, 0, -2)), yawTo(m.pos, CAN)); await m.reach('R', CAN.clone().setY(2)); G.can.obj.visible = false; const c = canProp(); P.stage.scene.add(c.obj); m.hold(c, 'hang'); await m.release('R'); change(w, g => { g.can = 'held'; }); objective(); }
  async function fill() { await m.goTo(BUTT.clone().add(new V3(-5, 0, -3)), yawTo(m.pos, BUTT)); await m.reach('L', BUTT.clone().setY(6.5)); await P.wait(1.2); await m.release('L'); change(w, g => { g.water = WATER_PER_FILL; }); if (w.chores && w.chores.canFilled) w.chores.canFilled(); spend(2); }      // (and the butt the lower for it: js/chores.js asks for the well again)
  async function putCan() { await m.goTo(CAN.clone().add(new V3(-4, 0, -2)), yawTo(m.pos, CAN)); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); G.can.obj.visible = true; change(w, g => { g.can = 'butt'; }); objective(); await finished(); }
  // Watering a row: from one end of the path beside it to the other, the can held out over the flowers.
  async function water(r) {
    const p = pathBeside(r.id, m.pos.x), west = Math.abs(m.pos.x - RX0) < Math.abs(m.pos.x - RX1), a = new V3(west ? RX0 + 1 : RX1 - 1, 0, p.z), b = new V3(west ? RX1 - 1 : RX0 + 1, 0, p.z);
    await m.goTo(a, yawTo(a, b)); const side = (r.z - p.z) * (west ? 1 : -1) < 0 ? 'L' : 'R';
    m.reach(side, () => new V3(m.pos.x, 4, r.z)); m.lookAt(new V3(b.x, 2, r.z));
    await m.goTo(b, yawTo(a, b), { speed: 0.4 }); await m.release(side); m.lookAt(null);
    change(w, g => { g.watered[r.id] = true; g.water -= 1; }); G.water(r.id, true); spend(6); await finished();
  }
  async function pull(wd, p) {
    await m.goTo(p, yawTo(p, wd)); m.lookAt(new V3(wd.x, 0, wd.z));
    await m.reach('R', new V3(wd.x, 0.6, wd.z)); await P.wait(0.4); wd.g.visible = false; await m.release('R'); m.lookAt(null);
    change(w, g => { if (!g.pulled.includes(wd.i)) g.pulled.push(wd.i); }); spend(2); await finished();
  }
  async function job(r, p) {
    await m.goTo(p, yawTo(p, new V3(p.x, 0, r.z))); m.lookAt(new V3(p.x, 1, r.z));
    for (let k = 0; k < 3; k++) { await m.reach(k % 2 ? 'L' : 'R', new V3(p.x + (k - 1) * 3, r.id === 'beans' ? 6 + k * 2 : 1, r.z)); await P.wait(0.5); await m.release(k % 2 ? 'L' : 'R'); }
    m.lookAt(null); change(w, g => { g.jobs[r.id] = true; }); spend(8); await finished();
  }
  // ── The gate, opened as she comes to it and swung to behind her; and, once she's through it, what's to do marked where it's done: each weed,
  // the can (or the butt, with it empty; or the near end of the nearest dry row, with it full), the trowel and the onions, the bench to put
  // things back on. None of it outside: there it's only "Tend Mama's garden".
  const rings = [], ringMat = new THREE.MeshBasicMaterial({ color: 0xf2d27a, transparent: true, opacity: 0.85, depthWrite: false });
  const ring = i => { while (rings.length <= i) { const r = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.4, 24), ringMat); r.rotation.x = -Math.PI / 2; r.renderOrder = 5; P.stage.scene.add(r); rings.push(r); } return rings[i]; };
  function marks() {
    const out = [], g = stateOf(w), pr = progress(w), today = plan(cal.day); if (!w.chores || !w.chores.on() || w.chores.gardenTended()) return out;
    const holding = m.carry && m.carry.name === 'the watering can', trowelHeld = m.carry && m.carry.kind === 'trowel', bench = new V3(BENCH.x, 0, BENCH.z - BENCH.d / 2 - 3);
    for (const wd of weeds) if (!g.pulled.includes(wd.i)) out.push(new V3(wd.x, 0, wd.z));
    if (pr.dry.length) { if (!holding && g.can === 'butt') out.push(CAN.clone()); else if (holding && g.water <= 0) out.push(BUTT.clone().add(new V3(-4, 0, -3)));
      else if (holding) { let best = null, bd = 1e9; for (const r of FLOWERS) if (today.dry.includes(r.id) && !g.watered[r.id]) { const p = pathBeside(r.id, m.pos.x); for (const x of [RX0 + 1, RX1 - 1]) { const e = new V3(x, 0, p.z), d = e.distanceTo(flat(m.pos)); if (d < bd) { bd = d; best = e; } } } if (best) out.push(best); } }
    else if (holding) out.push(CAN.clone());
    if (today.jobs.includes('onions') && !g.jobs.onions) out.push(trowelHeld ? new V3(Math.min(RX1 - 4, Math.max(RX0 + 4, m.pos.x)), 0, pathBeside('onions', m.pos.x).z) : bench);
    else if (trowelHeld) out.push(bench);
    for (const id of today.jobs) if (id !== 'onions' && !g.jobs[id]) out.push(new V3((RX0 + RX1) / 2, 0, pathBeside(id, (RX0 + RX1) / 2).z));
    return out;
  }
  const gate = P.world.gardenGate; let ringT = 0, wasIn = null;
  const offMarks = P.tick(dt => {
    { const nowIn = inside(m.pos); if (nowIn !== wasIn) { wasIn = nowIn; w.refresh(); } }      // (through the gate, or out of it: the list says as much, or as little)
    if (gate) { const d = Math.hypot(m.pos.x - GATE.x, m.pos.z - GATE.z), want = d < 16 ? 1 : 0; gate.open += (want - gate.open) * (1 - Math.exp(-dt * 5)); gate.hinge.rotation.y = -1.6 * gate.open; }
    ringT += dt; const list = inside(m.pos) && !P.busy ? marks() : [], s = 1 + 0.1 * Math.sin(ringT * 3);
    list.forEach((p, i) => { const r = ring(i); r.visible = true; r.position.set(p.x, 0.35, p.z); r.scale.set(s, s, 1); }); for (let i = list.length; i < rings.length; i++) rings[i].visible = false;
  });
  // ── Treading where she shouldn't: under her, a flower goes down (out of its line, crushed), its petals on her boots; and who might have seen.
  let mused = false, since = 0;
  const off = P.tick(dt => {
    if ((since += dt) < 0.1) return; since = 0;
    if (m.auto || !inside(m.pos)) return;
    const g = stateOf(w);
    for (const f of G.flowers) {
      if (g.trampled[f.id] || Math.abs(m.pos.x - f.x) > 2.4 || Math.abs(m.pos.z - f.z) > 2.8) continue;
      G.tread(f.id, true);
      const who = witness(P);
      change(w, s => { s.trampled[f.id] = cal.day; s.petals.push({ c: f.colour, until: Math.min(1439, cal.minute + 120 + Math.floor(Math.random() * 180)) }); if (who && !s.seen[cal.day]) s.seen[cal.day] = who; });
      boots(P, w);
      if (!mused && P.talk) { mused = true; P.talk.muse(S.trodden(ROWS.find(r => r.id === f.row).name), { face: 'wince' }); }
    }
    // (petals drop from her boots as the day goes on)
    // (and if anyone's near enough to see them fall, they'll have seen where they came from)
    const fallen = g.petals.filter(q => q.until <= cal.minute);
    if (fallen.length) { const who = witness(P); change(w, s => { s.petals = s.petals.filter(q => q.until > cal.minute); if (who && !s.seen[cal.day]) s.seen[cal.day] = who; }); boots(P, w);
      for (const q of fallen) drop(q.c); }
  });
  // (a petal fallen from her boots, on the ground where she was, a while)
  function drop(c) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.4, 5).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ color: c, side: THREE.DoubleSide })); p.position.set(m.pos.x + (Math.random() - 0.5) * 2, 0.15, m.pos.z + (Math.random() - 0.5) * 2); P.stage.scene.add(p); setTimeout(() => P.stage.scene.remove(p), 60000); }
  return { actions, show, stop: off, weeds };
}
// (whoever's near enough to see her at it: someone about in the village, near the garden)
function witness(P) {
  const figs = P.figures || {}, me = P.motion.pos; let best = null, bd = 260;
  for (const k in figs) { const f = figs[k], d = Math.hypot(f.motion.pos.x - me.x, f.motion.pos.z - me.z); if (d < bd) { bd = d; best = k; } }
  return best;
}
// The petals still on her boots: a few flecks of each colour about each ankle (on whoever's playing her, wherever she is).
function boots(P, w) {
  const g = stateOf(w), rig = P.rig; if (!rig || !rig.ankleL) return;
  for (const s of ['L', 'R']) { const a = rig['ankle' + s]; const old = a.getObjectByName('petals'); if (old) a.remove(old); }
  const live = g.petals.filter(q => q.until > w.cal.minute); if (!live.length) return;
  const sc = rig.scaleW || 1;
  for (const s of ['L', 'R']) { const grp = new THREE.Group(); grp.name = 'petals'; rig['ankle' + s].add(grp);
    live.forEach((q, k) => { for (let j = 0; j < 2; j++) { const n = k * 2 + j + (s === 'R' ? 1 : 0), p = new THREE.Mesh(new THREE.CircleGeometry(0.32 * sc, 5).scale(1, 0.6, 1), new THREE.MeshToonMaterial({ color: q.c, side: THREE.DoubleSide }));
      const an = n * 2.1; p.position.set(Math.cos(an) * 0.9 * sc, -0.6 * sc - (n % 3) * 0.25 * sc, 0.6 * sc + Math.sin(an) * 0.8 * sc); p.rotation.set(an, an * 0.7, 0); grp.add(p); } }); }
}

// ── At home, of an evening: her mother's been round the garden (every few days: the third day since she last looked, or sometimes the second),
// or has heard something from the village since. The first evening she's home for it (on coming in at dusk, or before bed).
function lookDue(w) {
  const g = stateOf(w), d = w.cal.day - (g.checked || 0);
  return d >= 3 || (d === 2 && hash(w.cal.day, 77) < 0.5);
}
async function evening(P, w, force) {
  const g = stateOf(w), cal = w.cal, S = root.Story;
  if (!P || !P.npc || g.evening === cal.day || (!force && cal.minute < H('19:00'))) return false;
  const report = g.pending && g.pending.day <= cal.day ? g.pending : null;
  if (!report && !lookDue(w)) return false;
  change(w, s => { s.evening = cal.day; });
  await P.wait(0.6); await P.approach();
  // (heard from someone in the village: she lied about it, and now her mother knows)
  if (report) {
    change(w, s => { s.pending = null; });
    await P.converse(S.gardenReport(report), { shot: ['red', 'mother'] });
    await root.Evening.owe(P, w, 'garden', { lied: true, caught: 'witness', who: report.who, rows: report.rows });      // (seen to at the evening's end: js/evening.js)
    return true;
  }
  const ids = Object.keys(g.trampled).filter(id => g.trampled[id] > (g.checked || 0)), today = ids.some(id => g.trampled[id] === cal.day);
  const rows = FLOWERS.filter(r => ids.some(id => id.startsWith(r.id + ':'))).map(r => r.name);
  const restore = () => change(w, s => { for (const id of ids) delete s.trampled[id]; s.checked = cal.day; });
  if (!ids.length) { restore(); await P.converse(S.gardenFine(progress(w).done), { shot: ['red', 'mother'] }); return false; }
  let answer = null;
  await P.converse(S.gardenAsk(rows, ids.length, { own: () => { answer = 'own'; }, lie: () => { answer = 'lie'; } }), { shot: ['red', 'mother'] });
  const petals = g.petals.some(q => q.until > cal.minute);
  if (answer === 'own') { restore(); w.rep.add('naughty', 0.5, 'trampling her mother’s flowers'); await root.Evening.owe(P, w, 'garden', { lied: false, rows }); return true; }
  if (today && petals) { restore(); w.rep.add('naughty', 1.5, 'trampling her mother’s flowers, and lying about it'); await P.converse(S.gardenBoots(rows), { shot: ['red', 'mother'] }); await root.Evening.owe(P, w, 'garden', { lied: true, caught: 'boots', rows }); return true; }
  // (believed: but someone may have seen, and her mother will hear of it)
  const days = [...new Set(ids.map(id => g.trampled[id]))], seen = days.map(d => g.seen[d]).find(Boolean);
  const who = seen || (hash(cal.day, 91) < 0.35 ? passerby(cal.day) : null);
  restore(); w.rep.add('naughty', 1, 'lying to her mother about the garden');
  change(w, s => { if (who) s.pending = { day: cal.day + 1, who, rows }; s.seen = {}; });
  await P.converse(S.gardenBelieved(), { shot: ['red', 'mother'] });
  return false;
}
// (no one near enough to see, as far as she knew: but someone in the lane, over the hedge)
function passerby(day) { const keys = ['agnes', 'tom', 'georgie', 'pennock', 'abney']; return keys[Math.floor(hash(day, 93) * keys.length)]; }
// Her mother takes her in hand for it, at the evening's end: for the carelessness, and for the lie, if there was one.
async function correct(P, w, how) {
  const S = root.Story;
  await P.converse(S.gardenTakeInHand(how), { shot: ['red', 'mother'] });
  const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Sc => S.gardenCorrection(Sc, how) }], fade: on => w.fade(on) });
  change(w, s => { s.rest = w.cal.day + 1; });      // (tomorrow she sees to the garden herself, and sets her flowers straight)
  if (P !== w.P) return;
  await P.converse(S.afterGarden(how), { shot: ['red', 'mother'] });
  w.rep.settle('naughty', 0.6);
  if (r && r.rose) w.save.flag('rose-said', w.cal.day);
}

const api = { build, attach, boots, progress, progressText, evening, correct, plan, offToday, lookDue, ROWS, PATHS, inside, stateOf, hash };
root.Garden = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
