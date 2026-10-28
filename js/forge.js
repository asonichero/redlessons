// Little Red’s Lessons — the forge, inside: Master Ferrier's back room, behind the open bay where he and Tom work in sight of the lane (js/village.js),
// through the wide wooden door in the stone wall between. Rough stone walls, sooted, high windows under the eaves to let the smoke and the heat
// out, and a floor of beaten earth. A second hearth on the wall between, back to back with the bay's and up the same chimney, the bellows by
// it; an anvil on its stump before it; the slack tub for quenching; a workbench under the tool rack (tongs, hammers, horseshoes on their nails), and a plain
// bench pushed under it, brought out into the room when he sits to see to Tom (and to her, once she's asked to answer to him as Tom does).
//
//   const f = Forge.build(scene)   → { group, update(camera), tick(dt), light(t), world, pieces }   (world as js/cottage.js's: seats, obstacles,
//   bounds, exits, corners, lap (where he sits for a correction: js/correction.js's at, seat, hide); pieces: for the room editor, rooms.html)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3;
const KIT = root.Cottage.kit, { toonMap, rnd, textures, box, solid, pole, srgb } = KIT;
const X0 = -46, X1 = 46, Z0 = -36, Z1 = 2, EAVE = 40, FOOT = 2, RZ = (Z0 + Z1) / 2;      // (the back of js/village.js's forge, 96 by 74: what's behind its open bay)
const DOOR = 0, DOOR_W = 26, DOOR_H = 30, VENTS = [-30, -10, 10, 30];      // (the wide door in the front wall, out to the bay; and the vents, high up)
// The furniture's places (as arranged in the room editor). The hearth and its bellows are the walls'.
const PIECES = { anvil: 'The anvil, on its stump (before the hearth)', tub: 'The slack tub', bench: 'The bench (under the workbench; brought out for corrections)', work: 'The workbench', rack: 'The tool rack' };
const ROOM = KIT.roomLayout('red-lessons:room:forge', {
  anvil: { x: -26, z: -20, ry: 1.5708 }, tub: { x: -37, z: -26, ry: 0 }, bench: { x: 26.5, z: -28, ry: -3.1416 }, work: { x: 26, z: -29, ry: 0 }, rack: { x: 26, z: -33, ry: 0 },
});

function build(scene) {
  const tx = textures(), root_ = new THREE.Group(); scene.add(root_);
  const oak = toonMap(tx.oak), oakDk = T.mat('#3e2818'), stone = toonMap(tx.stone), iron = T.mat('#2e2a28'), soot = T.mat('#4a4440'), earth = T.mat('#6a5a48');
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null, exits: [],
    // (the front right corner, by the door: nose to the stone, facing into it)
    corners: [{ at: new V3(X1 - 5, 0, Z1 - 5), yaw: Math.atan2(1, 1) }] };
  const panels = [], panel = (p, n) => { const g = new THREE.Group(); root_.add(g); panels.push({ g, p, n: n.normalize() }); return g; };

  // ── The floor: beaten earth, darker by the hearth.
  const floorG = panel(new V3(0, 0, 0), new V3(0, 1, 0));
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), earth); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, RZ); f.receiveShadow = true; floorG.add(f);
    const d = new THREE.Mesh(new THREE.CircleGeometry(15, 24), T.mat('#4e4236')); d.rotation.x = -Math.PI / 2; d.position.set(-26, 0.03, Z1 - 14); floorG.add(d); }
  // ── The walls: rough stone, sooted toward the top; the vents high in the back and the ends (shuttered open, daylight through); the front
  // wall with its wide door out to the bay.
  const walls = { back: { a: new V3(X1, 0, Z0), b: new V3(X0, 0, Z0), n: new V3(0, 0, 1), holes: VENTS.map(x => [x - 4, x + 4, EAVE - 9, EAVE - 3]) },
    left: { a: new V3(X0, 0, Z0), b: new V3(X0, 0, Z1), n: new V3(1, 0, 0), holes: [[-21, -13, EAVE - 9, EAVE - 3]] },
    right: { a: new V3(X1, 0, Z1), b: new V3(X1, 0, Z0), n: new V3(-1, 0, 0), holes: [[-21, -13, EAVE - 9, EAVE - 3]] },
    front: { a: new V3(X0, 0, Z1), b: new V3(X1, 0, Z1), n: new V3(0, 0, -1), holes: [[-DOOR - DOOR_W / 2, -DOOR + DOOR_W / 2, 0, DOOR_H]] } };
  const W = {};
  for (const k in walls) {
    const w = walls[k], g = W[k] = panel(w.a.clone().lerp(w.b, 0.5), w.n.clone()), len = w.a.distanceTo(w.b), ry = Math.atan2(w.n.x, w.n.z);
    const f = new THREE.Group(); f.position.copy(w.a.clone().lerp(w.b, 0.5)); f.rotation.y = ry; g.add(f);
    // (x along the wall as seen from inside, from its a end to its b end, the middle at 0)
    const sh = new THREE.Shape(); sh.moveTo(-len / 2, 0); sh.lineTo(len / 2, 0); sh.lineTo(len / 2, EAVE); sh.lineTo(-len / 2, EAVE); sh.lineTo(-len / 2, 0);
    for (const [x0, x1, y0, y1] of w.holes || []) { const h = new THREE.Path(); h.moveTo(x0, y0); h.lineTo(x0, y1); h.lineTo(x1, y1); h.lineTo(x1, y0); h.lineTo(x0, y0); sh.holes.push(h); }
    const sg = new THREE.ShapeGeometry(sh); { const uv = sg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 30, uv.getY(i) / 30); }
    const m = new THREE.Mesh(sg, stone); m.receiveShadow = true; f.add(m);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(len, EAVE * 0.4), new THREE.MeshBasicMaterial({ color: srgb('#1e1a18'), transparent: true, opacity: 0.35, depthWrite: false })); s.position.set(0, EAVE * 0.8, 0.05); f.add(s);
    // (the vents: a stone sill, a shutter propped open, and the sky beyond)
    if (k !== 'front') for (const [x0, x1, y0, y1] of w.holes || []) { const cx = (x0 + x1) / 2;
      box(f, x1 - x0 + 2, 1, 2.4, cx, y0 - 0.5, 0.6, stone); const sk = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), new THREE.MeshBasicMaterial({ color: srgb('#dfe6d0') })); sk.position.set(cx, (y0 + y1) / 2, -1.5); sk.rotation.y = Math.PI; f.add(sk);
      box(f, x1 - x0, 0.6, y1 - y0, cx, y1 + 0.4, (y1 - y0) / 2, oakDk, { rot: [-0.5, 0, 0] }); }
  }
  // (the wide door: two leaves of heavy planks on strap hinges, swinging in; out to the bay, and the lane)
  { const f = new THREE.Group(); f.position.set(DOOR, 0, Z1 - 0.4); W.front.add(f);
    const leaves = []; for (const sx of [-1, 1]) { const hinge = new THREE.Group(); hinge.position.set(sx * DOOR_W / 2, 0, 0); f.add(hinge);
      const leaf = box(hinge, DOOR_W / 2, DOOR_H - 0.5, 1.2, -sx * DOOR_W / 4, (DOOR_H - 0.5) / 2, 0, toonMap(tx.door || tx.oak), { shadow: false });
      for (const y of [-9, 0, 9]) box(leaf, DOOR_W / 2 - 1, 1.2, 0.6, 0, y, -0.9, oakDk); box(leaf, 1.2, DOOR_H * 0.7, 0.6, 0, 0, -0.9, oakDk, { rot: [0, 0, sx * 0.5] });
      leaves.push({ hinge, sx }); }
    box(f, DOOR_W + 3, 2, 3, 0, DOOR_H + 1, 0, oakDk, { shadow: false });
    // (the two leaves as one door: the left the one she opens, its latch by the meeting edge; the right swings in with it, on its own side)
    const latch = new THREE.Object3D(); latch.position.set(DOOR_W / 2 - 1.5, 16, -1.6); leaves[0].hinge.add(latch);
    world.door = { pivot: leaves[0].hinge, other: leaves[1].hinge, latch, open: 0, target: 0, swing: 1.6, name: 'the door', inward: new V3(0, 0, -1), axis: 'y' };
    world.exits.push({ name: 'the door', at: new V3(DOOR, 0, Z1 - 4), r: 8, when: () => world.door.open > 0.6 });
  }
  for (let x = X0 + 14; x < X1; x += 20) box(root_, 2.4, 2.6, Z1 - Z0, x, EAVE + 1.3, RZ, oakDk, { shadow: false });

  // ── The forge hearth (the front wall, left of the door): back to back with the bay's own through the stone between, the two of them up the
  // one chimney. A waist-high stone hearth, the coals glowing in its pan, a hood over it up into the stack; the bellows beside it, by the wall.
  const glow = [];
  { const g = W.front, cx = -26, z = Z1, H = 11, D = 13;
    box(g, 18, H, D, cx, H / 2, z - D / 2, stone);
    const coals = new THREE.Mesh(new THREE.CircleGeometry(3.8, 16), new THREE.MeshBasicMaterial({ color: srgb('#e8581a') })); coals.rotation.x = -Math.PI / 2; coals.position.set(cx, H + 0.1, z - 7); g.add(coals); glow.push(coals.material);
    for (let k = 0; k < 7; k++) solid(g, new THREE.DodecahedronGeometry(0.9), new THREE.MeshBasicMaterial({ color: srgb(k % 2 ? '#ff8a2a' : '#3a2a22') }), cx + Math.cos(k) * 2.2, H + 0.5, z - 7 + Math.sin(k) * 2, { ink: 0 });
    solid(g, new THREE.CylinderGeometry(5.5, 11.5, 14, 4, 1, true).rotateY(Math.PI / 4), soot, cx, H + 16, z - 6, { ink: 0.06 }).material.side = THREE.DoubleSide;
    box(g, 8, EAVE - H - 23, 7, cx, (EAVE + H + 23) / 2, z - 3.5, stone);
    // (the bellows: a leather bag between two boards on a frame, by the end wall, its nozzle into the hearth's side, the lever over it)
    const bx = -40.5, bz = z - 8; box(g, 1.6, 8, 1.6, bx, 4, bz - 5, oakDk); box(g, 1.6, 8, 1.6, bx, 4, bz + 5, oakDk);
    solid(g, T.ell(3.6, 2.2, 5.6, 12, 8), T.mat('#5a3a26'), bx, 10, bz, { ink: 0.06 }); box(g, 8, 0.8, 12, bx, 12.2, bz, oak); box(g, 8, 0.8, 12, bx, 7.8, bz, oak);
    pole(g, new V3(bx + 4, 10, bz), new V3(cx - 9, 9, bz), 0.4, iron, { ink: 0 }); pole(g, new V3(bx, 12.6, bz + 5), new V3(bx, 22, bz + 9), 0.5, oakDk);
    const light = new THREE.PointLight(srgb('#ff8a3a'), 1.2, 110, 1.4); light.position.set(cx, H + 8, z - 18); root_.add(light); glow.light = light;
    world.obstacles.push({ x0: X0, x1: cx + 10, z0: z - D - 1, z1: Z1 });
  }
  // ── The furniture, each piece about its own middle, set where the layout says.
  const F = KIT.furnish(ROOM.layout(), PIECES), pieces = F.pieces, piece = F.piece, wall = KIT.nearWall(W, floorG, X0, X1, Z0, Z1);
  // (the anvil on its elm stump, a hammer across its face)
  { const pc = piece('anvil', wall), g = pc.g;
    solid(g, new THREE.CylinderGeometry(3.6, 4.2, 8, 12), toonMap(tx.oak), 0, 4, 0, { ink: 0.08 });
    box(g, 9, 2.6, 4, 0, 9.4, 0, iron); box(g, 5, 2.4, 3, 0, 7.8, 0, iron); solid(g, new THREE.ConeGeometry(1.6, 5, 8).rotateZ(-Math.PI / 2), iron, 7, 9.6, 0, { ink: 0.05 });
    box(g, 6, 0.6, 0.6, -1, 11, 0.6, oakDk); box(g, 1.4, 1.4, 2, 2, 11, 0.6, iron);
    world.obstacles.push(pc.area(-7, 9, -3, 3)); }
  // (the slack tub, for quenching: a half barrel of black water)
  { const pc = piece('tub', wall), g = pc.g;
    solid(g, new THREE.CylinderGeometry(5, 4.4, 7, 14, 1, true), oak, 0, 3.5, 0, { ink: 0.06 }).material.side = THREE.DoubleSide;
    const wt = new THREE.Mesh(new THREE.CircleGeometry(4.8, 14), T.mat('#2a3236')); wt.rotation.x = -Math.PI / 2; wt.position.set(0, 6.2, 0); g.add(wt);
    for (const y of [1, 6]) solid(g, new THREE.TorusGeometry(4.9, 0.18, 4, 18).rotateX(Math.PI / 2), iron, 0, y, 0, { ink: 0 });
    world.obstacles.push(pc.area(-5.5, 5.5, -5.5, 5.5)); }
  // (the bench along the wall: plain, heavy, where he sits to see to them)
  { const pc = piece('bench', wall), g = pc.g;
    box(g, 18, 1.4, 5.4, 0, 9.6, 0, oak); for (const sx of [-1, 1]) box(g, 1.6, 9, 4.6, sx * 7.5, 4.5, 0, oakDk);
    world.seats.push({ name: 'the bench', at: pc.P(0, 10, 0), facing: pc.ry + Math.PI, kind: 'stool' }); world.obstacles.push(pc.area(-9, 9, -2.7, 2.7));
    world.lap = { middle: { at: { x: 0, z: RZ, yaw: 0 }, seat: 'bench', hide: [g] } }; }      // (brought out from under the workbench into the middle of the room, facing the door)
  // (the workbench under the rack: a vice, files, a row of shoes in the making)
  { const pc = piece('work', wall), g = pc.g, H = 15;
    box(g, 30, 1.6, 7, 0, H - 0.8, 0, oak); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 1.6, H - 1.6, 1.6, sx * 13, (H - 1.6) / 2, sz * 2.4, oakDk);
    box(g, 3, 3, 3, -11, H + 1.5, 1, iron); for (let k = 0; k < 5; k++) solid(g, new THREE.TorusGeometry(1.4, 0.35, 4, 10, Math.PI * 1.6).rotateX(-Math.PI / 2), iron, -2 + k * 3.4, H + 0.4, 0.5, { ink: 0.03 });
    world.obstacles.push(pc.area(-15, 15, -3.5, 3.5));
    world.surfaces.push(Object.assign(pc.area(-14, 14, -3, 3), { y: H, name: 'the workbench', panel: g, front: pc.turn(new V3(0, 0, 1)) })); }
  // (the rack on the wall: tongs, hammers, and shoes on their nails)
  { const pc = piece('rack', wall), g = pc.g;
    box(g, 30, 1.2, 1.2, 0, 26, 0.6, oakDk); box(g, 30, 1.2, 1.2, 0, 33, 0.6, oakDk);
    for (let k = 0; k < 6; k++) { const x = -12 + k * 4.8; pole(g, new V3(x, 25, 1.4), new V3(x + (k % 2 ? 0.8 : -0.8), 17, 1.6), 0.25, iron, { ink: 0 }); }
    for (let k = 0; k < 7; k++) solid(g, new THREE.TorusGeometry(1.3, 0.3, 4, 10, Math.PI * 1.6).rotateZ(Math.PI * 1.2), iron, -13 + k * 4.4, 31, 1.4, { ink: 0.03 }); }

  // Which walls show: those the camera is inside of.
  const cp = new V3();
  function update(camera) { camera.getWorldPosition(cp); for (const p of panels) p.g.visible = cp.clone().sub(p.p).dot(p.n) > 2; }
  let t = 0;
  function tick(dt) { t += dt; const d = world.door; if (d) { d.open += (d.target - d.open) * (1 - Math.exp(-dt * 5)); d.pivot.rotation.y = d.swing * d.open; d.other.rotation.y = -d.swing * d.open; } const k = 0.8 + 0.12 * Math.sin(t * 3.1) + 0.08 * Math.sin(t * 8.3); glow[0].color.setRGB(0.91 * k, 0.35 * k, 0.1 * k); if (glow.light) glow.light.intensity = 1.2 * k; }
  function light() {}
  world.bounds = { x0: X0 + 2.4, x1: X1 - 2.4, z0: Z0 + 2.4, z1: Z1 - 2.4 };
  return { group: root_, update, tick, light, world, pieces, bounds: { X0, X1, Z0, Z1, EAVE } };
}

root.Forge = Object.assign({ build, PIECES, DOOR, Z1 }, ROOM);
})(typeof window !== 'undefined' ? window : globalThis);
