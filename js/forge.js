// Little Red’s Lessons — the forge, inside: Master Ferrier's. Rough stone walls, sooted, and a floor of beaten earth; its front open on the loop
// lane, as it is from the street. The forge hearth against the back wall, its coals glowing under the hood, the great bellows beside it; the
// anvil on its stump before it; the slack tub for quenching; a workbench under the tool rack (tongs, hammers, horseshoes on their nails); and a
// plain bench along the wall, where he sits to see to Tom (and to her, once she's asked to answer to him as Tom does).
//
//   const f = Forge.build(scene)   → { group, update(camera), tick(dt), light(t), world, pieces }   (world as js/cottage.js's: seats, obstacles,
//   bounds, exits, corners, lap (where he sits for a correction: js/correction.js's at, seat, hide); pieces: for the room editor, rooms.html)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3;
const KIT = root.Cottage.kit, { toonMap, rnd, textures, box, solid, pole, srgb } = KIT;
const X0 = -46, X1 = 46, Z0 = -34, Z1 = 36, EAVE = 40, FOOT = 2, RZ = (Z0 + Z1) / 2;      // (inside js/village.js's forge, 96 by 74)
// The furniture's places (as arranged in the room editor). The hearth and its bellows are the walls'.
const PIECES = { anvil: 'The anvil, on its stump', tub: 'The slack tub', bench: 'The bench (for corrections)', work: 'The workbench', rack: 'The tool rack' };
const ROOM = KIT.roomLayout('red-lessons:room:forge', {
  anvil: { x: -6, z: -6, ry: 0 }, tub: { x: -32, z: -10, ry: 0 }, bench: { x: 38, z: 4, ry: -Math.PI / 2 }, work: { x: 26, z: -29, ry: 0 }, rack: { x: 26, z: -33, ry: 0 },
});

function build(scene) {
  const tx = textures(), root_ = new THREE.Group(); scene.add(root_);
  const oak = toonMap(tx.oak), oakDk = T.mat('#3e2818'), stone = toonMap(tx.stone), iron = T.mat('#2e2a28'), soot = T.mat('#4a4440'), earth = T.mat('#6a5a48');
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null, exits: [],
    // (the back right corner, past the workbench: nose to the stone, facing into it)
    corners: [{ at: new V3(X1 - 5, 0, Z0 + 5), yaw: Math.atan2(1, -1) }] };
  const panels = [], panel = (p, n) => { const g = new THREE.Group(); root_.add(g); panels.push({ g, p, n: n.normalize() }); return g; };

  // ── The floor: beaten earth, darker by the hearth.
  const floorG = panel(new V3(0, 0, 0), new V3(0, 1, 0));
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), earth); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, RZ); f.receiveShadow = true; floorG.add(f);
    const d = new THREE.Mesh(new THREE.CircleGeometry(16, 24), T.mat('#4e4236')); d.rotation.x = -Math.PI / 2; d.position.set(-14, 0.03, Z0 + 12); floorG.add(d); }
  // ── The walls: rough stone, sooted toward the top; the front open to the lane, but for its posts and the beam over it.
  const walls = { back: { a: new V3(X1, 0, Z0), b: new V3(X0, 0, Z0), n: new V3(0, 0, 1) }, left: { a: new V3(X0, 0, Z0), b: new V3(X0, 0, Z1), n: new V3(1, 0, 0) }, right: { a: new V3(X1, 0, Z1), b: new V3(X1, 0, Z0), n: new V3(-1, 0, 0) } };
  const W = {};
  for (const k in walls) {
    const w = walls[k], g = W[k] = panel(w.a.clone().lerp(w.b, 0.5), w.n.clone()), len = w.a.distanceTo(w.b), ry = Math.atan2(w.n.x, w.n.z);
    const f = new THREE.Group(); f.position.copy(w.a.clone().lerp(w.b, 0.5)); f.rotation.y = ry; g.add(f);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, EAVE), stone); m.position.set(0, EAVE / 2, 0); m.receiveShadow = true; f.add(m);
    { const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 30, uv.getY(i) * EAVE / 30); }
    const s = new THREE.Mesh(new THREE.PlaneGeometry(len, EAVE * 0.4), new THREE.MeshBasicMaterial({ color: srgb('#1e1a18'), transparent: true, opacity: 0.35, depthWrite: false })); s.position.set(0, EAVE * 0.8, 0.05); f.add(s);
  }
  W.front = panel(new V3(0, 0, Z1), new V3(0, 0, -1));
  for (const x of [X0 + 1, X1 - 1]) box(W.front, 2.4, EAVE, 2.4, x, EAVE / 2, Z1, oakDk, { shadow: false });
  box(W.front, X1 - X0, 3, 2.4, 0, EAVE - 1.5, Z1, oakDk, { shadow: false });
  { const v = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, EAVE), new THREE.MeshBasicMaterial({ color: srgb('#dfe6d0') })); v.position.set(0, EAVE / 2, Z1 + 30); v.rotation.y = Math.PI; W.front.add(v); }      // (the lane, beyond: daylight)
  for (let x = X0 + 14; x < X1; x += 20) box(root_, 2.4, 2.6, Z1 - Z0, x, EAVE + 1.3, RZ, oakDk, { shadow: false });

  // ── The forge hearth (the back wall, left): a waist-high stone hearth, the coals glowing in its pan, a hood over it up into the chimney; the
  // bellows beside it, on their frame.
  const glow = [];
  { const g = W.back, cx = -14, z = Z0, H = 11;
    box(g, 22, H, 14, cx, H / 2, z + 7, stone);
    const coals = new THREE.Mesh(new THREE.CircleGeometry(4.2, 16), new THREE.MeshBasicMaterial({ color: srgb('#e8581a') })); coals.rotation.x = -Math.PI / 2; coals.position.set(cx, H + 0.1, z + 8); g.add(coals); glow.push(coals.material);
    for (let k = 0; k < 7; k++) solid(g, new THREE.DodecahedronGeometry(0.9), new THREE.MeshBasicMaterial({ color: srgb(k % 2 ? '#ff8a2a' : '#3a2a22') }), cx + Math.cos(k) * 2.4, H + 0.5, z + 8 + Math.sin(k) * 2.2, { ink: 0 });
    solid(g, new THREE.CylinderGeometry(6, 13, 14, 4, 1, true).rotateY(Math.PI / 4), soot, cx, H + 16, z + 7, { ink: 0.06 }).material.side = THREE.DoubleSide;
    box(g, 8, EAVE - H - 23, 8, cx, (EAVE + H + 23) / 2, z + 4, stone);
    // (the bellows: a great leather bag between two boards, its nozzle into the hearth's side, and the lever above)
    const bx = cx + 18; box(g, 2, 9, 2, bx - 4, 4.5, z + 6, oakDk); box(g, 2, 9, 2, bx + 4, 4.5, z + 6, oakDk);
    solid(g, T.ell(4.5, 2.4, 6.5, 12, 8), T.mat('#5a3a26'), bx, 11, z + 6, { ink: 0.06 }); box(g, 10, 0.8, 14, bx, 13.4, z + 6, oak); box(g, 10, 0.8, 14, bx, 8.6, z + 6, oak);
    pole(g, new V3(bx, 13.6, z + 12), new V3(bx - 8, 12, z + 9), 0.4, iron, { ink: 0 }); pole(g, new V3(bx, 14, z + 2), new V3(bx, 24, z - 1), 0.5, oakDk);
    const light = new THREE.PointLight(srgb('#ff8a3a'), 1.2, 120, 1.4); light.position.set(cx, H + 8, z + 16); root_.add(light); glow.light = light;
    world.obstacles.push({ x0: cx - 12, x1: bx + 6, z0: Z0, z1: Z0 + 15 });
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
    world.lap = { bench: { at: Object.assign(pc.P(0, 0, 0), { yaw: pc.ry + Math.PI }), seat: 'bench', hide: [g] } }; }
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
  function tick(dt) { t += dt; const k = 0.8 + 0.12 * Math.sin(t * 3.1) + 0.08 * Math.sin(t * 8.3); glow[0].color.setRGB(0.91 * k, 0.35 * k, 0.1 * k); if (glow.light) glow.light.intensity = 1.2 * k; }
  function light() {}
  // (out: the whole front is open to the lane)
  for (let x = X0 + 6; x <= X1 - 6; x += 12) world.exits.push({ name: 'the lane', at: new V3(x, 0, Z1 - 2), r: 7 });      // (all along it)
  world.bounds = { x0: X0 + 2.4, x1: X1 - 2.4, z0: Z0 + 2.4, z1: Z1 - 2.4 };
  return { group: root_, update, tick, light, world, pieces, bounds: { X0, X1, Z0, Z1, EAVE } };
}

root.Forge = Object.assign({ build, PIECES, Z1 }, ROOM);
})(typeof window !== 'undefined' ? window : globalThis);
