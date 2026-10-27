// Little Red’s Lessons — the inn, inside: the Wheatsheaf's taproom, Mistress Abney's. Limewashed daub in an oak frame on a floor of worn
// boards, smoke-browned beams low overhead; the great hearth on the left wall with its fire, and Bess's chair drawn up to it; the counter
// across the back, barrels behind it and tankards on their hooks; settles and two long tables; the stair up to the rooms in the back right
// corner; the door from the street in the front wall, and windows either side of it.
//
//   const inn = Inn.build(scene)   → { group, update(camera), tick(dt), light(t), world }   (world as js/cottage.js's: seats, obstacles, door,
//   bounds, exits, corners; work: where an afternoon's work is done, for js/work.js)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3;
const KIT = root.Cottage.kit, { toonMap, rnd, textures, box, solid, pole, srgb } = KIT;
const X0 = -46, X1 = 46, Z0 = -32, Z1 = 38, EAVE = 46, FOOT = 3, RZ = (Z0 + Z1) / 2;
const DOOR = 4, DOOR_H = 38;

function build(scene) {
  const tx = textures(), root_ = new THREE.Group(); scene.add(root_);
  const oak = toonMap(tx.oak), oakDk = T.mat('#3e2818'), lime = toonMap(tx.lime), stone = toonMap(tx.stone), iron = T.mat('#2e2a28'), pewter = T.mat('#9a9a96');
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null, exits: [],
    // (corners clear enough to stand in: the front left, past the hearth; the front right, by the window)
    corners: [{ at: new V3(X0 + 5, 0, Z1 - 5), yaw: Math.atan2(-1, 1) }, { at: new V3(X1 - 5, 0, Z1 - 5), yaw: Math.atan2(1, 1) }] };
  const panels = [], panel = (p, n) => { const g = new THREE.Group(); root_.add(g); panels.push({ g, p, n: n.normalize() }); return g; };

  // ── The floor: wide boards, worn. The walls: daub, a stone footing, the oak frame; beams low across under the rooms above.
  const floorG = panel(new V3(0, 0, 0), new V3(0, 1, 0));
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), toonMap(tx.boards)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, RZ); f.receiveShadow = true; floorG.add(f); }
  const walls = {
    back: { a: new V3(X1, 0, Z0), b: new V3(X0, 0, Z0), n: new V3(0, 0, 1) },
    front: { a: new V3(X0, 0, Z1), b: new V3(X1, 0, Z1), n: new V3(0, 0, -1), holes: [[DOOR - 7, DOOR + 7, 0, DOOR_H], [-30, -18, 16, 28], [24, 36, 16, 28]] },
    left: { a: new V3(X0, 0, Z0), b: new V3(X0, 0, Z1), n: new V3(1, 0, 0) },
    right: { a: new V3(X1, 0, Z1), b: new V3(X1, 0, Z0), n: new V3(-1, 0, 0) },
  };
  const W = {};
  for (const k in walls) {
    const w = walls[k], g = W[k] = panel(w.a.clone().lerp(w.b, 0.5), w.n.clone()), len = w.a.distanceTo(w.b), ry = Math.atan2(w.n.x, w.n.z);
    const f = new THREE.Group(); f.position.copy(w.a.clone().lerp(w.b, 0.5)); f.rotation.y = ry; g.add(f);
    const holes = (w.holes || []).map(([a, b, y0, y1]) => [-b, -a, y0, y1]);      // (the front wall's frame faces back into the room: x runs the other way)
    const s = new THREE.Shape(); s.moveTo(-len / 2, FOOT); s.lineTo(len / 2, FOOT); s.lineTo(len / 2, EAVE); s.lineTo(-len / 2, EAVE); s.lineTo(-len / 2, FOOT);
    for (const [a, b, y0, y1] of holes) { const h = new THREE.Path(), lo = Math.max(FOOT + 0.1, y0); h.moveTo(a, lo); h.lineTo(a, y1); h.lineTo(b, y1); h.lineTo(b, lo); h.lineTo(a, lo); s.holes.push(h); }
    const sg = new THREE.ShapeGeometry(s); { const uv = sg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 40, uv.getY(i) / 40); }
    const daub = new THREE.Mesh(sg, lime); daub.receiveShadow = true; f.add(daub);
    const fs = new THREE.Mesh(new THREE.BoxGeometry(len, FOOT, 2.4), stone); fs.position.set(0, FOOT / 2, 1.2); f.add(fs);
    box(f, len, 2.0, 1.6, 0, EAVE - 1.0, 0.8, oak, { shadow: false });
    const blocked = x => holes.some(([a, b]) => x > a - 1.5 && x < b + 1.5);
    for (let x = -len / 2 + 1; x <= len / 2 - 1; x += len / 6) if (!blocked(x)) box(f, 1.8, EAVE - FOOT, 1.6, x, (EAVE + FOOT) / 2, 0.8, oak, { shadow: false });
    let s0 = -len / 2; for (const [a, b] of holes.filter(h => h[2] < 24 && h[3] > 24).sort((p, q) => p[0] - q[0]).concat([[len / 2, len / 2]])) { if (a - s0 > 1) box(f, a - s0, 1.4, 1.2, (s0 + a) / 2, 24, 0.6, oak, { shadow: false }); s0 = Math.max(s0, b); }
  }
  for (let x = X0 + 12; x < X1; x += 16) box(root_, 2.6, 2.8, Z1 - Z0, x, EAVE + 1.2, RZ, oakDk, { shadow: false });

  // ── The hearth (left wall): a wide stone fireplace with a fire, a spit across it, a settle before it; Bess's chair drawn up close.
  const fire = { flames: [], light: null, t: 0 };
  { const g = W.left, hz = -2, D = 7, OW = 18, OH = 15, JW = 5, x0 = X0;
    for (const sz of [-1, 1]) box(g, D, OH, JW, x0 + D / 2, 1 + OH / 2, hz + sz * (OW + JW) / 2, stone);
    box(g, 1, OH, OW, x0 + 0.5, 1 + OH / 2, hz, toonMap(tx.soot || tx.stone), { ink: 0 });
    box(g, D + 1.4, 2.4, OW + 2 * JW + 2, x0 + D / 2, 1 + OH + 1.2, hz, oakDk);
    box(g, D - 1, EAVE - OH - 4, OW + 2 * JW - 2, x0 + (D - 1) / 2, 1 + OH + 2.4 + (EAVE - OH - 4) / 2, hz, stone);
    box(g, D + 8, 1.2, OW + 2 * JW + 10, x0 + (D + 8) / 2, 0.6, hz, stone);
    const tear = new THREE.LatheGeometry([[0, 0], [0.55, 0.12], [0.62, 0.35], [0.48, 0.65], [0.24, 0.95], [0, 1.3]].map(([r, h]) => new THREE.Vector2(Math.max(0.001, r), h)), 12);
    const fm = c => new THREE.MeshBasicMaterial({ color: srgb(c), transparent: true, opacity: 0.92, depthWrite: false });
    for (const [z, sz] of [[0, 3.6], [-3, 2.6], [3, 2.8]]) for (const [c, k] of [['#ff7d24', 1], ['#ffc23a', 0.68], ['#fff1b0', 0.4]]) {
      const f = new THREE.Mesh(tear, fm(c)); f.position.set(x0 + 3.8, 1.6, hz + z); f.renderOrder = 3; g.add(f); fire.flames.push({ m: f, sz: sz * k, w: sz * k * 0.75, ph: Math.random() * 6.3, f: 7 + Math.random() * 5 }); }
    pole(g, new V3(x0 + 4, 9, hz - OW / 2), new V3(x0 + 4, 9, hz + OW / 2), 0.25, iron, { ink: 0 });
    fire.light = new THREE.PointLight(srgb('#ff9a4a'), 0.9, 110, 1.5); fire.light.position.set(x0 + 10, 8, hz); root_.add(fire.light);
    world.obstacles.push({ x0: X0, x1: X0 + D + 8, z0: hz - (OW / 2 + JW + 5), z1: hz + (OW / 2 + JW + 5) });
    // (Bess's chair, a high-backed one with a cushion, drawn up to the fire's right; a stool for her feet)
    const cx = X0 + 22, cz = hz + 18, c = new THREE.Group(); c.position.set(cx, 0, cz); c.rotation.y = -Math.PI * 0.65; root_.add(c);
    box(c, 8, 1.2, 7.5, 0, 9, 0, oakDk); for (const [x, z] of [[-3.4, -3], [3.4, -3], [-3.4, 3], [3.4, 3]]) box(c, 1, 9, 1, x, 4.5, z, oakDk);
    box(c, 8, 16, 1.2, 0, 17, -3.4, oakDk); solid(c, KIT.slab(7, 1.4, 6.4, 1.2, 0.4), T.mat('#8a4a5a'), 0, 10, 0.2, { ink: 0.05 });
    world.seats.push({ name: 'Bess’s chair', at: new V3(cx, 9.6, cz), facing: -Math.PI * 0.65, kind: 'chair' }); world.obstacles.push({ x: cx, z: cz, r: 5 });
    box(root_, 5, 4, 4, cx + 6, 2, cz - 6, oakDk);
    world.bessChair = world.seats[world.seats.length - 1];
  }
  // ── The counter across the back, barrels behind it on their stillage, tankards on hooks above, a jug and a row of pots on the counter.
  { const z = Z0 + 12, x0 = -14, x1 = 32, H = 15;
    box(root_, x1 - x0, H, 5, (x0 + x1) / 2, H / 2, z, oak); box(root_, x1 - x0 + 2, 1.2, 7, (x0 + x1) / 2, H + 0.6, z, oakDk);
    for (let k = 0; k < 4; k++) { const bx = x0 + 6 + k * 11; solid(root_, new THREE.CylinderGeometry(4, 4, 9, 14).rotateX(Math.PI / 2), oak, bx, 7, Z0 + 4.5, { ink: 0.08 });
      for (const dz of [-3, 3]) solid(root_, new THREE.TorusGeometry(4.05, 0.22, 4, 18), iron, bx, 7, Z0 + 4.5 + dz, { ink: 0 }); }
    pole(root_, new V3(x0, 26, Z0 + 1.5), new V3(x1, 26, Z0 + 1.5), 0.3, oakDk, { ink: 0.04 });
    for (let k = 0; k < 9; k++) solid(root_, new THREE.CylinderGeometry(1, 0.9, 2.6, 10), pewter, x0 + 3 + k * 5, 23.6, Z0 + 2, { ink: 0.04 });
    solid(root_, new THREE.LatheGeometry([[0.01, 0], [1.3, 0.1], [1.6, 1.4], [1.1, 3], [0.9, 3.4], [1.1, 3.8]].map(([r, h]) => new THREE.Vector2(r, h)), 12), T.mat('#b07a4a'), x0 + 8, H + 1.2, z, { ink: 0.04 });
    world.obstacles.push({ x0: x0 - 1, x1: x1 + 1, z0: Z0, z1: z + 3.5 });
    world.surfaces.push({ x0: x0 + 2, x1: x1 - 2, z0: z - 2, z1: z + 2, y: H + 1.2, name: 'the counter', front: new V3(0, 0, 1) });
  }
  // ── The tables, each with a bench either side; a settle against the front wall.
  const tables = [[-8, 12], [24, 14]];
  for (const [tx_, tz] of tables) { box(root_, 24, 1.4, 9, tx_, 13, tz, oak); for (const sx of [-1, 1]) box(root_, 1.6, 12.3, 7, tx_ + sx * 10, 6.2, tz, oakDk);
    for (const sz of [-1, 1]) { box(root_, 22, 1.2, 4, tx_, 8.4, tz + sz * 8, oak); for (const sx of [-1, 1]) box(root_, 1.2, 7.8, 3, tx_ + sx * 9, 3.9, tz + sz * 8, oakDk);
      world.seats.push({ name: 'the bench', at: new V3(tx_, 9, tz + sz * 8), facing: sz < 0 ? 0 : Math.PI, kind: 'stool' }); }
    world.obstacles.push({ x0: tx_ - 12, x1: tx_ + 12, z0: tz - 10, z1: tz + 10 });
    for (let k = 0; k < 3; k++) solid(root_, new THREE.CylinderGeometry(1, 0.9, 2.6, 10), pewter, tx_ - 6 + k * 6, 15, tz + (k - 1) * 1.5, { ink: 0.04 }); }
  // ── The stair up to the rooms, in the back right corner.
  { for (let k = 0; k < 10; k++) box(root_, 10, 1.2, 4, X1 - 6, 2 + k * 4, Z0 + 26 - k * 2.4, oak); box(root_, 1, 42, 1, X1 - 11, 21, Z0 + 4, oakDk);
    world.obstacles.push({ x0: X1 - 12, x1: X1, z0: Z0, z1: Z0 + 28 }); }
  // ── The door, in the front wall: out to the street.
  { const f = new THREE.Group(); f.position.set(DOOR, 0, Z1 - 0.4); W.front.add(f);
    const hinge = new THREE.Group(); hinge.position.set(-6.5, 0, 0); f.add(hinge);
    const leaf = box(hinge, 13, DOOR_H - 1, 1.0, 6.5, (DOOR_H - 1) / 2, 0, toonMap(tx.door || tx.oak), { shadow: false }); leaf.rotation.y = Math.PI;
    for (const y of [-12, 12]) box(leaf, 12, 1.4, 0.7, 0, y, -0.8, oakDk);
    const latch = new THREE.Object3D(); latch.position.set(11, 17, -1.2); hinge.add(latch);
    box(f, 15, 1.4, 2.6, 0, DOOR_H + 0.7, 0, oakDk, { shadow: false }); for (const sx of [-1, 1]) box(f, 1.2, DOOR_H, 2.6, sx * 7.1, DOOR_H / 2, 0, oakDk, { shadow: false });
    world.door = { pivot: hinge, latch, open: 0, target: 0, swing: 1.75, name: 'the door', inward: new V3(0, 0, -1), axis: 'y' };
    world.exits.push({ name: 'the door', at: new V3(DOOR, 0, Z1 - 4), r: 6, when: () => world.door.open > 0.6 });
  }
  // (the street, through the windows)
  for (const x of [-24, 30]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: srgb('#dfe6d0') })); v.position.set(x, 22, Z1 + 1.5); v.rotation.y = Math.PI; W.front.add(v); }

  // Where an afternoon's work is done (js/work.js).
  const spot = (x, z, yaw, lx, ly, lz) => ({ at: new V3(x, 0, z), yaw, look: new V3(lx, ly, lz) });
  world.work = {
    tub: spot(-30, -24, Math.PI, -30, 4, -29), tables: spot(-8, 26, Math.PI, -8, 14, 14), fire: spot(-30, -2, -Math.PI / 2, -40, 4, -2),
    counter: spot(8, 2, Math.PI, 8, 16, Z0 + 12), table2: spot(24, 28, Math.PI, 24, 15, 14), bess: spot(X0 + 22 - 8, 18 + 4, Math.PI * 0.3, X0 + 22, 14, 16), floor: spot(0, 0, 0, 0, 0.5, 6),
  };
  // (the washing tub by the hearth, for the pots)
  { solid(root_, new THREE.CylinderGeometry(4, 3.4, 4, 14, 1, true), oak, -30, 2, -29, { ink: 0.06 }).material.side = THREE.DoubleSide; const wt = new THREE.Mesh(new THREE.CircleGeometry(3.7, 14), T.mat('#6a8a9a')); wt.rotation.x = -Math.PI / 2; wt.position.set(-30, 3.2, -29); root_.add(wt);
    world.obstacles.push({ x: -30, z: -29, r: 4.5 }); }

  const cp = new V3();
  function update(camera) { camera.getWorldPosition(cp); for (const p of panels) p.g.visible = cp.clone().sub(p.p).dot(p.n) > 2; }
  function tick(dt) {
    const d = world.door; if (d) { d.open += (d.target - d.open) * (1 - Math.exp(-dt * 5)); d.pivot.rotation.y = d.swing * d.open; }
    fire.t += dt; const ft = fire.t, flick = 0.5 + 0.25 * Math.sin(ft * 11.3) + 0.15 * Math.sin(ft * 23.7 + 1);
    for (const f of fire.flames) { const k = 1 + 0.22 * Math.sin(ft * f.f + f.ph); f.m.scale.set(f.w, f.sz * k, f.w); }
    if (fire.light) fire.light.intensity = (0.6 + 0.4 * flick) * (fire.lightK || 1);
  }
  function light(t) { fire.lightK = 1 + 1.4 * t; }
  world.bounds = { x0: X0 + 2.4, x1: X1 - 2.4, z0: Z0 + 2.4, z1: Z1 - 2.4 };
  return { group: root_, update, tick, light, world, bounds: { X0, X1, Z0, Z1, EAVE } };
}

root.Inn = { build, DOOR, Z1 };
})(typeof window !== 'undefined' ? window : globalThis);
