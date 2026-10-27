// Little Red’s Lessons — the bakery, inside: Mistress Pennock's. Limewashed daub in an oak frame, as the cottage is, on a floor of worn flags; the
// bread oven a great brick mouth in the back wall, glowing, its iron door hung open; the long kneading table down the middle of the back, floured,
// dough rising under a cloth; racks of loaves on the left wall; sacks of flour stacked on the right; the door and the half-door counter in the
// front wall onto the street. A bench by the counter, where she sits to get her breath (and to take a boy across her knee).
//
//   const b = Bakery.build(scene)   → { group, update(camera), tick(dt), light(t), world }   (world as js/cottage.js's: seats, obstacles, door,
//   bounds, exits, corners)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3;
const KIT = root.Cottage.kit, { toonMap, rnd, textures, box, solid, pole, srgb } = KIT;
const X0 = -46, X1 = 46, Z0 = -32, Z1 = 38, EAVE = 50, FOOT = 3, RZ = (Z0 + Z1) / 2;
const DOOR = -22, DOOR_H = 38, HATCH = 18;      // (along the front wall, as x: the door, and the half-door counter onto the street)

function build(scene) {
  const tx = textures(), root_ = new THREE.Group(); scene.add(root_);
  const oak = toonMap(tx.oak), oakDk = T.mat('#4e3420'), lime = toonMap(tx.lime), stone = toonMap(tx.stone), brick = T.mat('#9a5a3e'), iron = T.mat('#2e2a28'), flour = T.mat('#f2ecdf');
  const crust = [T.mat('#b8743a'), T.mat('#c98a4a'), T.mat('#a8642e')], sack = T.mat('#d8c8a0');
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null, exits: [],
    // (corners clear enough to stand in, facing into them: the back right, past the sacks; the front left, past the door)
    corners: [{ at: new V3(X1 - 5, 0, Z0 + 5), yaw: Math.atan2(1, -1) }, { at: new V3(X0 + 5, 0, Z1 - 12), yaw: Math.atan2(-1, 1) }] };
  const panels = [], panel = (p, n) => { const g = new THREE.Group(); root_.add(g); panels.push({ g, p, n: n.normalize() }); return g; };

  // ── The floor: worn flags.
  const floorG = panel(new V3(0, 0, 0), new V3(0, 1, 0));
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), toonMap(tx.stone)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, RZ); f.receiveShadow = true; floorG.add(f);
    const uv = f.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 9); }
  // ── The walls: daub on the inside, a stone footing, the oak frame (sill, posts, a rail, the plate), and beams across under the loft.
  const walls = {
    back: { a: new V3(X1, 0, Z0), b: new V3(X0, 0, Z0), n: new V3(0, 0, 1) },
    front: { a: new V3(X0, 0, Z1), b: new V3(X1, 0, Z1), n: new V3(0, 0, -1), holes: [[DOOR - 7, DOOR + 7, 0, DOOR_H], [HATCH - 10, HATCH + 10, 13, 30]] },
    left: { a: new V3(X0, 0, Z0), b: new V3(X0, 0, Z1), n: new V3(1, 0, 0) },
    right: { a: new V3(X1, 0, Z1), b: new V3(X1, 0, Z0), n: new V3(-1, 0, 0) },
  };
  const W = {};
  for (const k in walls) {
    const w = walls[k], g = W[k] = panel(w.a.clone().lerp(w.b, 0.5), w.n.clone()), len = w.a.distanceTo(w.b), ry = Math.atan2(w.n.x, w.n.z);
    const f = new THREE.Group(); f.position.copy(w.a.clone().lerp(w.b, 0.5)); f.rotation.y = ry; g.add(f);
    // (in the wall's own frame: x along it, seen from inside; the front wall's openings, in x along the room, turned into that frame)
    const holes = (w.holes || []).map(([a, b, y0, y1]) => [-b, -a, y0, y1]);      // (the front wall's frame faces back into the room: x runs the other way)
    const s = new THREE.Shape(); s.moveTo(-len / 2, FOOT); s.lineTo(len / 2, FOOT); s.lineTo(len / 2, EAVE); s.lineTo(-len / 2, EAVE); s.lineTo(-len / 2, FOOT);
    for (const [a, b, y0, y1] of holes) { const h = new THREE.Path(); h.moveTo(a, Math.max(FOOT + 0.1, y0)); h.lineTo(a, y1); h.lineTo(b, y1); h.lineTo(b, Math.max(FOOT + 0.1, y0)); h.lineTo(a, Math.max(FOOT + 0.1, y0)); s.holes.push(h); }
    const sg = new THREE.ShapeGeometry(s); { const uv = sg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 40, uv.getY(i) / 40); }
    const daub = new THREE.Mesh(sg, lime); daub.receiveShadow = true; f.add(daub);
    const fs = new THREE.Mesh(new THREE.BoxGeometry(len, FOOT, 2.4), stone); fs.position.set(0, FOOT / 2, 1.2); f.add(fs);
    box(f, len, 2.0, 1.6, 0, EAVE - 1.0, 0.8, oak, { shadow: false });
    const blocked = x => holes.some(([a, b]) => x > a - 1.5 && x < b + 1.5);
    for (let x = -len / 2 + 1; x <= len / 2 - 1; x += len / 6) if (!blocked(x)) box(f, 1.8, EAVE - FOOT, 1.6, x, (EAVE + FOOT) / 2, 0.8, oak, { shadow: false });
    // (the rail at mid height, broken by the openings)
    let s0 = -len / 2; for (const [a, b] of holes.slice().sort((p, q) => p[0] - q[0]).concat([[len / 2, len / 2]])) { if (a - s0 > 1) box(f, a - s0, 1.4, 1.2, (s0 + a) / 2, 24, 0.6, oak, { shadow: false }); s0 = Math.max(s0, b); }
  }
  // (the beams across, under the loft floor: drawn whatever the camera sees, as the cottage's)
  for (let x = X0 + 14; x < X1; x += 18) box(root_, 2.2, 2.4, Z1 - Z0, x, EAVE + 1, RZ, oakDk, { shadow: false });

  // ── The oven in the back wall: a deep brick mouth, arched, glowing, its iron door hung open; a brick breast up to the beams; the peel by it.
  const glow = [];
  { const g = W.back, cx = 18, z = Z0;
    box(g, 34, EAVE - FOOT, 6, cx, (EAVE + FOOT) / 2, z + 3, brick);
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(7, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: srgb('#e8681e') })); mouth.position.set(cx, 12, z + 6.1); g.add(mouth); glow.push(mouth.material);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), new THREE.MeshBasicMaterial({ color: srgb('#ffb04a') })); inner.position.set(cx, 10, z + 6.05); g.add(inner); glow.push(inner.material);
    box(g, 18, 2, 3, cx, 9, z + 7, brick); box(g, 20, 1.6, 4, cx, 20.5, z + 7, brick);
    const dr = box(g, 9, 9, 0.8, cx - 12, 13, z + 9, iron); dr.rotation.y = -1.2;
    const light = new THREE.PointLight(srgb('#ff9a4a'), 1.1, 110, 1.4); light.position.set(cx, 12, z + 16); root_.add(light); glow.light = light;
    // (the peel, leaning by it: Mistress Pennock's paddle)
    pole(g, new V3(cx + 20, 0.5, z + 8), new V3(cx + 21, 30, z + 6.5), 0.45, toonMap(tx.oak));
    solid(g, new THREE.BoxGeometry(6, 0.6, 7.5).translate(0, 0, 0), toonMap(tx.oak), cx + 20.1, 3, z + 8.5, { rot: [Math.PI / 2 - 0.05, 0, 0.04], ink: 0.06 });
    world.obstacles.push({ x0: cx - 18, x1: cx + 24, z0: Z0, z1: Z0 + 10 });
  }
  // ── The kneading table, down the back of the room: floured, a trough of dough under a cloth, loaves shaped and set to prove.
  { const H = 15, x = -18, z = Z0 + 14, L = 36, D = 11;
    box(root_, L, 1.6, D, x, H - 0.8, z, toonMap(tx.oak));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(root_, 1.6, H - 1.6, 1.6, x + sx * (L / 2 - 2), (H - 1.6) / 2, z + sz * (D / 2 - 1.5), oakDk);
    const dust = new THREE.Mesh(new THREE.PlaneGeometry(L - 6, D - 3), flour); dust.rotation.x = -Math.PI / 2; dust.position.set(x - 2, H + 0.02, z); root_.add(dust);
    box(root_, 14, 4, 7, x + 8, H + 2, z, toonMap(tx.oak)); solid(root_, new THREE.SphereGeometry(5, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.3, 0.35, 0.65), T.mat('#e8dcc0'), x + 8, H + 4, z, { ink: 0.05 });
    for (let k = 0; k < 5; k++) solid(root_, T.ell(1.6, 1.0, 2.4, 10, 6), T.mat('#efe0c4'), x - 14 + k * 4, H + 1, z - 1, { ink: 0.04 });
    world.obstacles.push({ x0: x - L / 2, x1: x + L / 2, z0: z - D / 2, z1: z + D / 2 });
    world.surfaces.push({ x0: x - L / 2 + 2, x1: x + L / 2 - 2, z0: z - D / 2 + 1, z1: z + D / 2 - 1, y: H, name: 'the kneading table', front: new V3(0, 0, 1) });
  }
  // ── Racks of loaves on the left wall: shelves, every one full.
  { const g = W.left, x = X0 + 4, z0 = -14, z1 = 18;
    for (const y of [8, 16, 24, 32]) { box(g, 7, 0.8, z1 - z0, x, y, (z0 + z1) / 2, toonMap(tx.oak));
      const r = rnd(y * 7); for (let z = z0 + 2.5; z < z1 - 2; z += 4.2) solid(g, T.ell(1.6 + r() * 0.4, 1.1, 1.9, 10, 6), crust[Math.floor(r() * 3)], x + (r() - 0.5), y + 1.4, z, { ink: 0.04 }); }
    for (const z of [z0, z1]) box(g, 7, 36, 1.2, x, 18, z, oakDk);
    world.obstacles.push({ x0: X0, x1: X0 + 8, z0, z1 });
  }
  // ── Sacks of flour on the right, stacked, one open with its scoop.
  { const r = rnd(83);
    for (const [x, z, y] of [[X1 - 6, -6, 0], [X1 - 6, 2, 0], [X1 - 6, 10, 0], [X1 - 6, -2, 6.4], [X1 - 6, 6, 6.4], [X1 - 14, 14, 0]]) solid(root_, T.ell(3.4, 3.4, 3.2, 10, 8), sack, x + (r() - 0.5), y + 3.2, z, { ink: 0.06, rot: [0, r(), 0] });
    solid(root_, new THREE.CylinderGeometry(0.6, 0.8, 1.6, 8), flour, X1 - 14, 7, 14, { ink: 0.03 });
    world.obstacles.push({ x0: X1 - 18, x1: X1, z0: -10, z1: 18 });
  }
  // ── The counter under the half-door: a broad board inside the hatch with loaves on it; the bench by it.
  { const g = W.front;
    box(g, 22, 1.4, 6, HATCH, 13, Z1 - 3, toonMap(tx.oak)); box(g, 22, 12, 1.4, HATCH, 6.5, Z1 - 5.5, oakDk);
    for (let k = 0; k < 4; k++) solid(g, T.ell(1.7, 1.1, 2, 10, 6), crust[k % 3], HATCH - 7 + k * 4.6, 14.6, Z1 - 3, { ink: 0.04 });
    world.obstacles.push({ x0: HATCH - 11, x1: HATCH + 11, z0: Z1 - 7, z1: Z1 });
    const bx = X1 - 12, bz = Z1 - 12;
    box(root_, 16, 1.2, 5, bx, 9, bz, toonMap(tx.oak)); for (const sx of [-1, 1]) box(root_, 1.2, 8.4, 4, bx + sx * 6.5, 4.2, bz, oakDk);
    world.seats.push({ name: 'the bench', at: new V3(bx, 9.6, bz), facing: Math.PI, kind: 'stool' }); world.obstacles.push({ x0: bx - 8, x1: bx + 8, z0: bz - 2.5, z1: bz + 2.5 });
  }
  // ── The door, in the front wall: planks on strap hinges, swinging in; out to the street.
  { const f = new THREE.Group(); f.position.set(DOOR, 0, Z1 - 0.4); W.front.add(f);
    const hinge = new THREE.Group(); hinge.position.set(-6.5, 0, 0); f.add(hinge);
    const leaf = box(hinge, 13, DOOR_H - 1, 1.0, 6.5, (DOOR_H - 1) / 2, 0, toonMap(tx.door || tx.oak), { shadow: false }); leaf.rotation.y = Math.PI;
    for (const y of [-12, 12]) box(leaf, 12, 1.4, 0.7, 0, y, -0.8, oakDk);
    const latch = new THREE.Object3D(); latch.position.set(11, 17, -1.2); hinge.add(latch);
    box(f, 15, 1.4, 2.6, 0, DOOR_H + 0.7, 0, oakDk, { shadow: false }); for (const sx of [-1, 1]) box(f, 1.2, DOOR_H, 2.6, sx * 7.1, DOOR_H / 2, 0, oakDk, { shadow: false });
    world.door = { pivot: hinge, latch, open: 0, target: 0, swing: 1.75, name: 'the door', inward: new V3(0, 0, -1), axis: 'y' };
    world.exits.push({ name: 'the door', at: new V3(DOOR, 0, Z1 - 4), r: 6, when: () => world.door.open > 0.6 });
  }
  // (the street through the hatch: daylight)
  { const v = new THREE.Mesh(new THREE.PlaneGeometry(20, 17), new THREE.MeshBasicMaterial({ color: srgb('#dfe6d0') })); v.position.set(HATCH, 21.5, Z1 + 1.5); v.rotation.y = Math.PI; W.front.add(v); }

  // Which walls show: those the camera is inside of (as the cottage's).
  const cp = new V3();
  function update(camera) { camera.getWorldPosition(cp); for (const p of panels) p.g.visible = cp.clone().sub(p.p).dot(p.n) > 2; }
  let t = 0;
  function tick(dt) {
    const d = world.door; if (d) { d.open += (d.target - d.open) * (1 - Math.exp(-dt * 5)); d.pivot.rotation.y = d.swing * d.open; }
    t += dt; const k = 0.85 + 0.1 * Math.sin(t * 2.3) + 0.05 * Math.sin(t * 7.1); glow[0].color.setRGB(0.91 * k, 0.4 * k, 0.12 * k); if (glow.light) glow.light.intensity = 1.1 * k;
  }
  function light() {}
  world.bounds = { x0: X0 + 2.4, x1: X1 - 2.4, z0: Z0 + 2.4, z1: Z1 - 2.4 };
  return { group: root_, update, tick, light, world, bounds: { X0, X1, Z0, Z1, EAVE } };
}

root.Bakery = { build, DOOR, Z1 };
})(typeof window !== 'undefined' ? window : globalThis);
