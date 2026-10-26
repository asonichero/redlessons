// Little Red’s Lessons — her grandmother's cabin in the wood: round logs notched at the corners, chinked with pale clay, under a steep roof of bark shingles
// furred with moss, built hard against a great oak, so that the trunk is the back corner of the room, roots and all, and two of its limbs run in
// under the roof as beams. Shelves are cut into the trunk for her jars; herbs hang in bunches from the limbs. A stone hearth with a fire and a
// kettle, her rocking chair before it, a round table laid for tea (pot, two cups, a cake), a dresser with plates, a box bed under a patchwork quilt,
// a braided rug, a round window onto the green of the wood.
//
//   const cabin = Cabin.build(scene, { outside })   (outside: seen from the wood, so nothing hides, and the oak's crown spreads over the roof)
//   → { group, update(camera), tick(dt), light(t), world, pieces }   (world as js/cottage.js's: items, seats, surfaces, obstacles, door, bounds, exits;
//   pieces: the furniture, by id, as the layout set it: { g, P, ry, items }, for the room editor)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3;
const KIT = root.Cottage.kit, { canvasTex, toonMap, rnd, textures, box, solid, slab, pole, srgb, INK } = KIT;
const lerp = (a, b, t) => a + (b - a) * t;
const X0 = -46, X1 = 46, Z0 = -32, Z1 = 38, EAVE = 40, RIDGE = 70, RZ = (Z0 + Z1) / 2, LR = 1.5, STEP = 2.9;
const OAK = { x: X1 - 7, z: Z0 + 5, r: 12 };
// (the doorway: tall enough for Red, her mother and her grandmother to walk through with room to spare; Holt, the tallest of them, ducks)
const DOOR = -10, WIN = 22, DOOR_H = 34;      // (where the door and the window are along the front wall, as x)

// The furniture's places: [x, z] on the floor and its turn (ry), each about its own middle (as arranged in the room editor, rooms.html, whose
// changes, kept in the browser, the game builds the room from: see js/cottage.js's roomLayout).
const PIECES = { rug: 'The braided rug', rocker: 'Her rocking chair', basket: 'The basket of wool', table: 'The round table (laid for tea)', stool: 'Red’s stool', chair: 'Her chair at the table', dresser: 'The dresser', bed: 'The box bed' };
const ROOM = KIT.roomLayout('red-lessons:room:cabin', {
  rug: { x: -8, z: 0, ry: 0 }, rocker: { x: -33, z: 25.5, ry: -4.1888 }, basket: { x: -36.5, z: 13.5, ry: 0 },
  table: { x: 15, z: 6, ry: 0 }, stool: { x: 14, z: 17, ry: 3.1416 }, chair: { x: 16, z: -5, ry: 0 },
  dresser: { x: 41, z: 26, ry: 4.7124 }, bed: { x: -33.5, z: -23, ry: 7.854 },
});

let TX = null;
function tex() {
  if (TX) return TX;
  const base = textures(); TX = Object.assign({}, base);
  // Logs: honey-coloured peeled pine, streaked along the grain.
  TX.log = canvasTex(128, 64, (x, w, h) => { x.fillStyle = '#b8824e'; x.fillRect(0, 0, w, h); const r = rnd(41); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '90,55,25' : '220,170,110'},${0.12 + r() * 0.12})`; x.fillRect(0, r() * h, w, 1 + r() * 2); } }, [3, 1]);
  // End grain: rings round a darker heart.
  TX.ends = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#d9b07a'; x.fillRect(0, 0, w, h); for (let k = 8; k > 0; k--) { x.strokeStyle = k % 2 ? 'rgba(140,90,40,.45)' : 'rgba(255,230,180,.3)'; x.lineWidth = 2; x.beginPath(); x.arc(32, 32, k * 3.8, 0, 7); x.stroke(); } x.fillStyle = '#8a5a2a'; x.beginPath(); x.arc(32, 32, 3, 0, 7); x.fill(); });
  TX.ends.wrapS = TX.ends.wrapT = THREE.ClampToEdgeWrapping;
  // Oak bark: deep, rough, grey-brown furrows running up, a little green with moss toward the foot.
  TX.bark = canvasTex(128, 256, (x, w, h) => { x.fillStyle = '#6a5a48'; x.fillRect(0, 0, w, h); const r = rnd(43);
    for (let i = 0; i < 22; i++) { const cx = r() * w; x.strokeStyle = `rgba(40,30,22,${0.35 + r() * 0.3})`; x.lineWidth = 2 + r() * 4; x.beginPath(); x.moveTo(cx, 0); for (let y = 0; y <= h; y += 16) x.lineTo(cx + Math.sin(y * 0.05 + i) * 4, y); x.stroke(); }
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '150,135,110' : '90,110,60'},0.18)`; x.fillRect(r() * w, r() * h, 6 + r() * 10, 3 + r() * 6); } }, [3, 2]);
  // Bark shingles, overlapping in rows, mossy.
  TX.shingle = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#4e3c2c'; x.fillRect(0, 0, w, h); const r = rnd(47);
    for (let row = 0; row < 8; row++) for (let i = -1; i < 9; i++) { const sx = i * 32 + (row % 2 ? 16 : 0), sy = row * 32, g = 60 + r() * 30; x.fillStyle = `rgb(${g + 20},${g + 4},${g - 12})`; x.fillRect(sx + 1, sy, 30, 30); x.fillStyle = 'rgba(20,12,6,.5)'; x.fillRect(sx + 1, sy + 26, 30, 4); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${90 + r() * 30},${120 + r() * 30},${60 + r() * 20},${0.35 + r() * 0.3})`; x.beginPath(); x.ellipse(r() * w, r() * h, 6 + r() * 16, 4 + r() * 8, 0, 0, 7); x.fill(); } }, [1, 1]);
  // A braided rug, rings of faded rag colours.
  TX.braid = canvasTex(256, 256, (x, w, h) => { const cols = ['#7a8a5a', '#b06a4a', '#d8c08a', '#6a7a9a', '#a85a6a', '#d8c08a']; for (let k = 0; k < 14; k++) { x.fillStyle = cols[k % cols.length]; x.beginPath(); x.ellipse(w / 2, h / 2, w / 2 - k * 9, h / 2 - k * 9, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 1; x.stroke(); } });
  TX.braid.wrapS = TX.braid.wrapT = THREE.ClampToEdgeWrapping;
  // The wood, through the window: greens in soft layers.
  TX.green = canvasTex(128, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#cfe3b0'); g.addColorStop(1, '#6f8f4a'); x.fillStyle = g; x.fillRect(0, 0, w, h); const r = rnd(53);
    for (let i = 0; i < 30; i++) { x.fillStyle = ['#5a7a3a', '#7a9a4a', '#4a6a32'][i % 3]; x.beginPath(); x.ellipse(r() * w, h * (0.3 + r() * 0.7), 10 + r() * 18, 14 + r() * 20, 0, 0, 7); x.fill(); } });
  return TX;
}

function build(scene, opts) {
  opts = opts || {};
  const tx = tex(), root_ = new THREE.Group(); root_.userData.cabin = true; scene.add(root_);
  const logM = toonMap(tx.log), endM = toonMap(tx.ends), barkM = toonMap(tx.bark), clay = T.mat('#d8c8a6'), oakDk = T.mat('#4e3420'), stone = toonMap(tx.stone), iron = T.mat('#2e2a28');
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null, exits: [] };
  const panels = [];      // { g, test(cam) → visible }
  const panel = (p, n) => { const g = new THREE.Group(); root_.add(g); n = n.clone().normalize(); panels.push({ g, test: c => opts.outside || c.clone().sub(p).dot(n) > 2 }); return g; };

  // ── Floor: wide boards, and the braided rug.
  const floorG = panel(new V3(0, 0, 0), new V3(0, 1, 0));
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 + 6, Z1 - Z0 + 6), toonMap(tx.boards)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, RZ); f.receiveShadow = true; floorG.add(f);
  }
  // ── The furniture: each piece built about its own origin and set where the layout says (LAYOUT, with any changes made in the room editor,
  // rooms.html, kept in the browser), turned by its own yaw; where it can be sat on, stood against or put things on goes with it.
  const F = KIT.furnish(ROOM.layout(), PIECES), pieces = F.pieces, piece = F.piece;
  { const pc = piece('rug', floorG), rug = new THREE.Mesh(new THREE.CircleGeometry(1, 48), toonMap(tx.braid)); rug.scale.set(17, 12, 1); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.06, 0); rug.receiveShadow = true; pc.g.add(rug); }

  // ── The walls: round logs, a course every STEP, chinked between. Each wall runs from a to b (seen from inside, x along it), with openings cut.
  // The front corners' logs run on past the corner, notched over each other; at the oak the logs butt into the trunk.
  const logs = (g, a, b, y0, y1, holes, over) => {
    const d = b.clone().sub(a), L = d.length(), dir = d.clone().normalize(), ry = Math.atan2(-dir.z, dir.x);
    for (let y = y0 + LR; y < y1; y += STEP) {
      // (the course broken where an opening crosses it)
      let segs = [[-over[0], L + over[1]]];
      for (const h of holes || []) if (y > h.y0 - LR * 0.5 && y < h.y1 + LR * 0.5) { const n = []; for (const [s0, s1] of segs) { if (h.x1 <= s0 || h.x0 >= s1) n.push([s0, s1]); else { if (h.x0 > s0) n.push([s0, h.x0]); if (h.x1 < s1) n.push([h.x1, s1]); } } segs = n; }
      for (const [s0, s1] of segs) {
        const len = s1 - s0; if (len < 0.5) continue;
        const c = a.clone().addScaledVector(dir, (s0 + s1) / 2), m = solid(g, new THREE.CylinderGeometry(LR, LR * 1.04, len, 12), logM, c.x, y, c.z, { rot: [0, ry, Math.PI / 2], ink: 0.08 });
        for (const e of [-1, 1]) solid(m, new THREE.CircleGeometry(LR * 0.97, 12), endM, 0, e * (len / 2 + 0.01), 0, { rot: [e * -Math.PI / 2, 0, 0], ink: 0, shadow: false });
        // (the clay between this course and the one above, set back a little)
        if (y + STEP < y1) { const ch = box(g, len, STEP - 2 * LR * 0.85, 1.0, c.x, y + STEP / 2, c.z, clay, { ink: 0, shadow: false }); ch.rotation.y = ry; }
      }
    }
  };
  const walls = {
    back: { a: new V3(X0, 0, Z0), b: new V3(OAK.x - Math.sqrt(OAK.r ** 2 - (Z0 - OAK.z) ** 2) + 1, 0, Z0), n: new V3(0, 0, 1), over: [3, 0] },
    front: { a: new V3(X0, 0, Z1), b: new V3(X1, 0, Z1), n: new V3(0, 0, -1), over: [3, 3], holes: [{ x0: DOOR - X0 - 6.5, x1: DOOR - X0 + 6.5, y0: 0, y1: DOOR_H }, { x0: WIN - X0 - 6, x1: WIN - X0 + 6, y0: 11, y1: 23 }] },
    left: { a: new V3(X0, 0, Z1), b: new V3(X0, 0, Z0), n: new V3(1, 0, 0), over: [0, 0], gable: true },
    right: { a: new V3(X1, 0, OAK.z + Math.sqrt(OAK.r ** 2 - (X1 - OAK.x) ** 2) - 1), b: new V3(X1, 0, Z1), n: new V3(-1, 0, 0), over: [0, 0], gable: true },
  };
  const W = {}, wall = KIT.nearWall(W, floorG, X0, X1, Z0, Z1);      // (the furniture's panel, by where it stands)
  for (const k in walls) {
    const w = walls[k], g = W[k] = panel(w.a.clone().lerp(w.b, 0.5), w.n);
    logs(g, w.a, w.b, 0, EAVE, w.holes, w.over);
    if (w.gable) {      // (the gable: shorter courses up to the ridge)
      const mid = w.a.clone().lerp(w.b, 0.5), full = Z1 - Z0, dir = w.b.clone().sub(w.a).normalize(), ry = Math.atan2(-dir.z, dir.x);
      for (let y = EAVE + LR; y < RIDGE - 2; y += STEP) {
        const half = (full / 2 + 5) * (RIDGE - y) / (RIDGE - EAVE + 3), c = new V3(w.a.x, y, RZ), len = 2 * half - 2;
        if (len < 2) continue;
        solid(g, new THREE.CylinderGeometry(LR, LR, len, 12), logM, c.x, y, c.z, { rot: [0, Math.PI / 2, Math.PI / 2], ink: 0.08 });
        void mid; void ry;
      }
    }
  }
  // (the logs of the back wall stop short of the corner by the oak; the left wall's back end, and the front corners, run past)

  // ── The great oak: its trunk is the back right corner of the room, flaring into roots that spread across the floor; two of its limbs run in
  // under the roof as beams. Shelves are cut into the trunk.
  const oakG = new THREE.Group(); root_.add(oakG);
  { const prof = [[OAK.r + 5, 0], [OAK.r + 2.5, 2], [OAK.r + 0.8, 5], [OAK.r, 10], [OAK.r - 0.6, 40], [OAK.r - 1.2, 80], [OAK.r - 2.4, opts.outside ? 120 : 82]];
    const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 28); g.computeVertexNormals();
    solid(oakG, g, barkM, OAK.x, 0, OAK.z, { ink: 0.15 });
    const r = rnd(61);
    for (let i = 0; i < 6; i++) { const a = Math.PI * (0.55 + i * 0.12) + (r() - 0.5) * 0.2, len = 10 + r() * 8;
      solid(oakG, T.ell(len / 2, 2 + r(), 2.6 + r()), barkM, OAK.x + Math.cos(a) * (OAK.r + len / 2 - 3), 0.6, OAK.z + Math.sin(a) * (OAK.r + len / 2 - 3), { rot: [0, -a, -0.1], ink: 0.1 }); }
    // Shelves let into the trunk on the room's side, with jars and bottles of every colour, and a candle.
    const jars = ['#8a6a3a', '#5a7a4a', '#a85a3a', '#6a5a8a', '#c9a24a', '#4a6a7a', '#9a4a4a'];
    for (const [y, a0, a1] of [[9, 0.62, 0.92], [15, 0.6, 0.95], [21, 0.64, 0.9]]) {
      const ring = new THREE.CylinderGeometry(OAK.r + 2.4, OAK.r + 2.4, 0.7, 24, 1, false, Math.PI * a0 - Math.PI / 2, Math.PI * (a1 - a0));
      solid(oakG, ring, oakDk, OAK.x, y, OAK.z, { ink: 0.06 });
      for (let k = 0; k < 6; k++) { const a = Math.PI * lerp(a0 + 0.03, a1 - 0.03, (k + 0.5) / 6), rr = OAK.r + 1.2, h = 1.6 + r() * 1.6, x = OAK.x - Math.sin(a) * rr, z = OAK.z - Math.cos(a) * rr;
        const jar = new THREE.LatheGeometry([[0.01, 0], [0.75, 0.05], [0.8, h * 0.8], [0.45, h], [0.5, h + 0.35]].map(([q, w]) => new THREE.Vector2(q, w)), 10);
        solid(oakG, jar, jars[(k + y) % jars.length], x, y + 0.35, z, { ink: 0.04 }); }
    }
    world.obstacles.push({ x: OAK.x, z: OAK.z, r: OAK.r + 3.5 });
  }
  // The limbs, as beams under the roof (inside only), each a tapering pole from the trunk across the room.
  const limbG = new THREE.Group(); root_.add(limbG);
  const limbs = [[new V3(OAK.x - 8, 35, OAK.z + 6), new V3(X0 + 2, 41, 4)], [new V3(OAK.x - 6, 38, OAK.z + 9), new V3(-4, 46, Z1 - 2)]];
  if (!opts.outside) for (const [a, b] of limbs) pole(limbG, a, b, 1.8, barkM, { taper: 1.6, ink: 0.1 });

  // ── The roof: steep slopes of mossy bark shingles from the ridge to past the eaves, on rafters.
  const roofs = [];
  for (const sz of [1, -1]) {
    const zE = sz > 0 ? Z1 + 6 : Z0 - 6, yE = EAVE - 3, a = new V3(0, RIDGE, RZ), e = new V3(0, yE, zE);
    const n = new V3(0, zE - RZ, -(yE - RIDGE)).normalize(); if (n.y > 0) n.negate();
    const g = panel(a.clone().lerp(e, 0.5), n); roofs.push(g);
    const len = a.distanceTo(e), m = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 + 12, len), toonMap(tx.shingle, THREE.DoubleSide));
    tx.shingle.repeat.set(3, 2); m.position.copy(a.clone().lerp(e, 0.5)); m.lookAt(m.position.clone().add(n)); m.receiveShadow = true; m.castShadow = true; g.add(m);
    const off = n.clone().multiplyScalar(1.2);
    for (let x = X0 + 1; x <= X1 - 1; x += 9) pole(g, a.clone().setX(x).add(off), e.clone().setX(x).add(off), 0.7, logM, { shadow: false });
  }
  if (!opts.outside) pole(roofs[1], new V3(X0 - 3, RIDGE - 1.4, RZ), new V3(X1 + 3, RIDGE - 1.4, RZ), 1.1, logM, { shadow: false });

  // ── The door (front wall, left of centre): planks and a ledge, on strap hinges, swinging in; a latch; out to the wood.
  { const f = new THREE.Group(); f.position.set(DOOR, 0, Z1 - 0.4); W.front.add(f);      // (in the opening in the front wall)
    const hinge = new THREE.Group(); hinge.position.set(-6, 0, 0); f.add(hinge);
    const leaf = box(hinge, 12, DOOR_H - 1, 1.0, 6, (DOOR_H - 1) / 2, 0, toonMap(tx.door), { shadow: false }); leaf.rotation.y = Math.PI;
    for (const y of [-11, 11]) box(leaf, 11, 1.4, 0.7, 0, y, -0.8, oakDk);
    box(leaf, 1.1, 24, 0.7, 0, 0, -0.8, oakDk, { rot: [0, 0, 0.45] });
    const latch = new THREE.Object3D(); latch.position.set(10.5, 15, -1.2); hinge.add(latch);
    solid(hinge, new THREE.TorusGeometry(0.8, 0.16, 6, 12), iron, 10.5, 15, -1.0, { ink: 0.04 });
    box(f, 14, 1.4, 2.6, 0, DOOR_H + 0.7, 0, oakDk, { shadow: false }); for (const sx of [-1, 1]) box(f, 1.2, DOOR_H, 2.6, sx * 6.6, DOOR_H / 2, 0, oakDk, { shadow: false });
    world.door = { pivot: hinge, latch, open: 0, target: 0, swing: 1.75, name: 'the door', inward: new V3(0, 0, -1), axis: 'y' };
    world.exits.push({ name: 'the wood', at: new V3(DOOR, 0, Z1 - 4), r: 6, when: () => world.door.open > 0.6 });      // (out through the open door)
  }
  // ── The window (front wall, right): round-headed, four panes onto the wood.
  { const f = new THREE.Group(); f.position.set(WIN, 17, Z1 - 0.2); W.front.add(f);
    const view = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: tx.green })); view.position.z = 1.2; view.rotation.y = Math.PI; f.add(view);
    for (const [w, h, x, y] of [[13, 1, 0, 6], [13, 1, 0, -6], [1, 13, -6, 0], [1, 13, 6, 0], [0.6, 12, 0, 0], [12, 0.6, 0, 0]]) box(f, w, h, 1.2, x, y, 0, oakDk, { shadow: false });
    box(f, 14, 0.8, 3, 0, -6.6, -1.2, oakDk, { shadow: false });
    // (a jug of flowers on the sill)
    solid(f, new THREE.CylinderGeometry(0.9, 1.1, 2.2, 12), '#6a8aa0', 3, -5.1, -1.6, { ink: 0.04 });
    for (let i = 0; i < 6; i++) solid(f, T.ell(0.5, 0.5, 0.5), ['#e8d24a', '#f0f0f0', '#c86a9a'][i % 3], 3 + Math.cos(i) * 0.9, -3.3 + (i % 2) * 0.6, -1.6 + Math.sin(i) * 0.6, { ink: 0.03 }); }

  // ── The hearth (left wall): a stone chimney breast with a fire in it, a kettle on a hook, a stool of logs beside it.
  const fire = { flames: [], light: null, embers: null, t: 0 };
  { const g = W.left, hz = 1, D = 7, OW = 13, OH = 13, JW = 4, x0 = X0;
    for (const sz of [-1, 1]) box(g, D, OH, JW, x0 + D / 2, 1 + OH / 2, hz + sz * (OW + JW) / 2, stone);
    box(g, 1, OH, OW, x0 + 0.5, 1 + OH / 2, hz, toonMap(tx.soot || tx.stone), { ink: 0 });
    box(g, D + 1, 2.2, OW + 2 * JW + 2, x0 + D / 2, 1 + OH + 1.1, hz, oakDk);      // the lintel
    box(g, D - 1, RIDGE - OH - 4, OW + 2 * JW - 2, x0 + (D - 1) / 2, 1 + OH + 2.2 + (RIDGE - OH - 4) / 2, hz, stone);
    box(g, D + 8, 1.2, OW + 2 * JW + 10, x0 + (D + 8) / 2, 0.6, hz, stone);      // the hearthstone
    for (const [x, z, L, ry] of [[x0 + 3.5, hz - 0.5, 8, 0.2], [x0 + 3.8, hz + 1, 7, -0.25]]) { const lg = solid(g, new THREE.CylinderGeometry(0.75, 0.85, L, 10), barkM, x, 2.0, z, { rot: [Math.PI / 2, ry, 0], ink: 0.06 }); void lg; }
    fire.embers = new THREE.Mesh(T.ell(3.2, 0.4, 4, 16, 8), new THREE.MeshBasicMaterial({ color: srgb('#e0561e') })); fire.embers.position.set(x0 + 3.6, 1.5, hz); g.add(fire.embers);
    const tear = new THREE.LatheGeometry([[0, 0], [0.55, 0.12], [0.62, 0.35], [0.48, 0.65], [0.24, 0.95], [0, 1.3]].map(([r, h]) => new THREE.Vector2(Math.max(0.001, r), h)), 12);
    const fm = c => new THREE.MeshBasicMaterial({ color: srgb(c), transparent: true, opacity: 0.92, depthWrite: false });
    for (const [z, sz] of [[0, 3.2], [-2, 2.3], [2, 2.5]]) for (const [c, k] of [['#ff7d24', 1], ['#ffc23a', 0.68], ['#fff1b0', 0.4]]) {
      const f = new THREE.Mesh(tear, fm(c)); f.position.set(x0 + 3.6 + (1 - k) * 0.4, 2.4, hz + z); f.renderOrder = 3 + (1 - k) * 2; g.add(f);
      fire.flames.push({ m: f, sz: sz * k, w: sz * k * 0.75, ph: Math.random() * 6.3, f: 7 + Math.random() * 5, z: hz + z }); }
    fire.light = new THREE.PointLight(srgb('#ff9a4a'), 0.8, 90, 1.6); fire.light.position.set(x0 + 9, 6, hz); root_.add(fire.light);
    // (the kettle on its hook over the fire)
    box(g, 0.3, 4, 0.3, x0 + 3.6, 10.5, hz, iron, { ink: 0 });
    solid(g, new THREE.LatheGeometry([[0.01, 0], [1.4, 0.1], [1.7, 1.1], [1.2, 2.2], [0.45, 2.6], [0.55, 2.9]].map(([r, h]) => new THREE.Vector2(r, h)), 14), iron, x0 + 3.6, 5.7, hz, { ink: 0.06 });
    world.obstacles.push({ x0: X0, x1: X0 + D + 8, z0: hz - (OW / 2 + JW + 5), z1: hz + (OW / 2 + JW + 5) });
  }

  // ── Her rocking chair before the fire, and a basket of wool by it.
  { const pc = piece('rocker', wall), c = pc.g;
    solid(c, slab(8, 1, 7, 1, 0.4), oakDk, 0, 8.5, 0, { ink: 0.08 });
    for (const sx of [-1, 1]) { solid(c, new THREE.TorusGeometry(14, 0.5, 6, 20, 0.9), oakDk, sx * 3.6, 14.5, 0, { rot: [0, Math.PI / 2, Math.PI * 1.5 - 0.45], ink: 0.05 });
      for (const z of [-2.8, 2.8]) pole(c, new V3(sx * 3.4, 0.9, z), new V3(sx * 3.4, 8.2, z), 0.45, oakDk); pole(c, new V3(sx * 3.6, 9, -3), new V3(sx * 3.4, 22, -4.4), 0.5, oakDk); }
    for (let k = 0; k < 5; k++) pole(c, new V3(-2.6 + k * 1.3, 9, -3.2), new V3(-2.6 + k * 1.3, 21, -4.4), 0.3, oakDk);
    box(c, 8, 1.2, 1, 0, 21.8, -4.4, oakDk);
    solid(c, slab(7.2, 0.8, 6.4, 1.2, 0.3), toonMap(tx.quilt), 0, 9.3, 0.2, { ink: 0.05 });      // (a cushion)
    world.seats.push({ name: 'the rocking chair', at: pc.P(0, 9.6, 0), facing: pc.ry, kind: 'chair' }); world.obstacles.push({ x: c.position.x, z: c.position.z, r: 5 }); }
  { const b = piece('basket', wall).g;
    solid(b, new THREE.CylinderGeometry(2.6, 2.1, 3.4, 14, 1, true), toonMap(tx.wicker), 0, 1.7, 0, { ink: 0.05 }).material.side = THREE.DoubleSide;
    for (const [x, z, c2] of [[-0.8, 0.4, '#b05a4a'], [0.9, -0.3, '#d8c08a'], [0.1, 0.9, '#6a7a9a']]) solid(b, T.ell(1.1, 1.1, 1.1), c2, x, 3.3, z, { ink: 0.04 }); }

  // ── The round table, laid for tea: the pot, two cups, a cake on a plate; a stool drawn up to it for her, and the old woman's chair across from it.
  // (the things on it are the room's own, to be picked up and put down, set where the table puts them)
  const thing = (pc, name, build, x, y, z, grip, radius, ry) => { const it = new THREE.Group(); build(it); it.position.copy(pc.P(x, y, z)); it.rotation.y = (ry || 0) + pc.ry; root_.add(it);
    const item = { obj: it, name, grip, radius, panel: pc.g.parent }; world.items.push(item); pc.items.push({ obj: it, at: new V3(x, y, z), ry: ry || 0 }); return item; };
  { const pc = piece('table', wall), g = pc.g, H = 15;
    solid(g, new THREE.CylinderGeometry(8.5, 8.5, 1.4, 28), toonMap(tx.oak), 0, H - 0.7, 0, { ink: 0.1 });
    solid(g, new THREE.CylinderGeometry(1.4, 1.8, H - 1.4, 12), oakDk, 0, (H - 1.4) / 2, 0, { ink: 0.08 });
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; pole(g, new V3(0, 1.2, 0), new V3(Math.cos(a) * 5, 0.2, Math.sin(a) * 5), 0.6, oakDk); }
    const cloth = new THREE.Mesh(new THREE.CircleGeometry(5.5, 24), T.mat('#f2eadb')); cloth.rotation.x = -Math.PI / 2; cloth.position.set(0, H + 0.02, 0); g.add(cloth);
    const pot = '#4a7a9a', cup = '#e8e2d4';
    thing(pc, 'the teapot', it => { solid(it, new THREE.LatheGeometry([[0.01, 0], [1.5, 0.1], [2.1, 1.4], [1.7, 2.7], [0.8, 3.1], [0.4, 3.5]].map(([r, h]) => new THREE.Vector2(r, h)), 16), pot, 0, 0, 0, { ink: 0.06 });
      solid(it, new THREE.TorusGeometry(1.0, 0.22, 6, 12, Math.PI * 1.2), pot, -2.0, 1.8, 0, { rot: [0, 0, 1.2], ink: 0.04 }); pole(it, new V3(1.8, 1.2, 0), new V3(3.2, 2.6, 0), 0.25, pot, { ink: 0.03 }); }, 2, H, -2, new V3(0, 2.4, 0), 2.2);
    for (const [x, z] of [[-3, 1.5], [3.5, 3]]) thing(pc, 'a cup', it => { solid(it, new THREE.CylinderGeometry(0.9, 0.7, 1.2, 12), cup, 0, 0.6, 0, { ink: 0.04 }); solid(it, new THREE.CylinderGeometry(1.4, 1.3, 0.15, 14), cup, 0, 0.08, 0, { ink: 0.03 }); }, x, H, z, new V3(0, 0.8, 0), 1.4);
    thing(pc, 'the cake', it => { solid(it, new THREE.CylinderGeometry(2.6, 2.6, 0.2, 18), cup, 0, 0.1, 0, { ink: 0.03 }); solid(it, new THREE.CylinderGeometry(1.9, 1.9, 1.6, 18, 1, false, 0, Math.PI * 1.6), '#d9a45a', 0, 1.0, 0, { ink: 0.05 });
      solid(it, new THREE.CylinderGeometry(1.95, 1.95, 0.35, 18, 1, false, 0, Math.PI * 1.6), '#f4ecdc', 0, 1.9, 0, { ink: 0.03 }); for (let k = 0; k < 4; k++) solid(it, T.ell(0.25, 0.25, 0.25), '#b0283a', Math.cos(k) * 1.1, 2.15, Math.sin(k) * 1.1, { ink: 0 }); }, -2.5, H, -2.5, new V3(0, 1.4, 0), 2.6);
    world.surfaces.push(Object.assign(pc.area(-5, 5, -5, 5), { name: 'the table', y: H, panel: pc.g.parent, front: new V3(0, 0, 1) }));
    world.obstacles.push({ x: g.position.x, z: g.position.z, r: 9 });
  }
  // (her stool and the old woman's chair: each faces the way it's turned; the chair has a back)
  for (const [id, nm] of [['stool', 'the stool'], ['chair', 'the chair']]) {
    const pc = piece(id, wall), s = pc.g;
    solid(s, new THREE.CylinderGeometry(3.4, 3.4, 1.2, 16), oakDk, 0, 8.4, 0, { ink: 0.08 });
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.3; pole(s, new V3(Math.cos(a) * 2, 8, Math.sin(a) * 2), new V3(Math.cos(a) * 3.1, 0, Math.sin(a) * 3.1), 0.45, oakDk); }
    solid(s, new THREE.TorusGeometry(2.7, 0.28, 6, 20), oakDk, 0, 3.4, 0, { rot: [Math.PI / 2, 0, 0], ink: 0.05 });
    if (id === 'chair') { for (const sx of [-1, 1]) pole(s, new V3(sx * 2.4, 8.6, -2.2), new V3(sx * 2.6, 19, -3.2), 0.4, oakDk); box(s, 5.6, 4, 0.7, 0, 16.5, -3, oakDk); }
    world.seats.push({ name: nm, at: pc.P(0, 9, 0), facing: pc.ry, kind: 'stool', rung: 3.4, rungR: 2.7 }); world.obstacles.push({ x: s.position.x, z: s.position.z, r: 3.6 });
  }

  // ── The dresser against the back wall: plates on its rack, and on its top, a parcel tied with twine (her gift).
  { const pc = piece('dresser', wall), g = pc.g;
    box(g, 18, 12, 6, 0, 6, 0, toonMap(tx.oak)); box(g, 18.6, 0.8, 6.6, 0, 12.4, 0, oakDk);
    for (const x of [-4.5, 4.5]) box(g, 0.3, 9, 0.2, x, 6, 3.05, oakDk, { ink: 0 });
    box(g, 18, 14, 1, 0, 20, -2.5, toonMap(tx.oak)); for (const y of [16, 22]) box(g, 18, 0.6, 2.4, 0, y, -1.6, oakDk);
    for (const y of [16, 22]) for (let k = 0; k < 5; k++) solid(g, new THREE.CylinderGeometry(1.5, 1.5, 0.3, 16), ['#e8e2d4', '#4a7a9a', '#e8e2d4', '#b06a4a', '#e8e2d4'][k], -6.4 + k * 3.2, y + 1.8, -1.2, { rot: [Math.PI / 2 - 0.25, 0, 0], ink: 0.03 });
    world.surfaces.push(Object.assign(pc.area(-7, 7, -1, 1), { name: 'the dresser', y: 12.8, panel: pc.g.parent, front: pc.turn(new V3(0, 0, 1)) }));
    world.obstacles.push(pc.area(-9.5, 9.5, -4, 3.5));
    world.gift = thing(pc, 'the parcel', it => { solid(it, slab(5.5, 2.2, 4, 0.6, 0.3), '#c8a878', 0, 1.1, 0, { ink: 0.05 }); box(it, 0.25, 2.3, 4.1, 0, 1.1, 0, '#8a6a3a', { ink: 0 }); box(it, 5.6, 2.3, 0.25, 0, 1.1, 0, '#8a6a3a', { ink: 0 });
      solid(it, new THREE.TorusGeometry(0.5, 0.12, 6, 10), '#8a6a3a', 0.6, 2.4, 0, { rot: [Math.PI / 2, 0, 0.5], ink: 0 }); solid(it, new THREE.TorusGeometry(0.5, 0.12, 6, 10), '#8a6a3a', -0.6, 2.4, 0, { rot: [Math.PI / 2, 0, -0.5], ink: 0 }); }, 3, 12.8, 0, new V3(0, 1.4, 0), 3.2, 0.2);
  }

  // ── The box bed (front right, along the right wall): a frame, a straw mattress, a patchwork quilt, a bolster. (Its head toward the back.)
  { const pc = piece('bed', wall), g = pc.g, BW = 14, BL = 22, BH = 8;
    box(g, BW, 1.4, BL, 0, BH - 0.7, 0, oakDk); box(g, BW, BH - 1.4, 1.2, 0, (BH - 1.4) / 2, BL / 2 - 0.6, oakDk); box(g, 1.2, BH - 1.4, BL, -BW / 2 + 0.6, (BH - 1.4) / 2, 0, oakDk);
    box(g, BW, 14, 1.4, 0, BH + 5, -BL / 2 + 0.7, oakDk);
    solid(g, slab(BW - 2, 3.6, BL - 2, 2, 1.4), toonMap(tx.ticking), 0, BH + 1.8, 0, { ink: 0.1 });
    solid(g, slab(BW - 1, 1.2, BL - 6, 1, 0.5), toonMap(tx.quilt), 0, BH + 4.1, 2.5, { ink: 0.08 });
    solid(g, T.ell(BW / 2 - 1.5, 1.6, 2), T.mat('#efe6d0'), 0, BH + 4.4, -BL / 2 + 3, { ink: 0.08 });
    world.seats.push({ name: 'the bed', at: pc.P(-2, BH + 3.6, 2), facing: -Math.PI / 2 + pc.ry, kind: 'bed', head: pc.P(0, BH + 4.4, -BL / 2 + 3), feet: pc.P(0, BH + 4, BL / 2 - 3) });
    world.obstacles.push(pc.area(-BW / 2, 8, -BL / 2, BL / 2));
  }

  // ── Herbs hanging in bunches from the oak's limbs (and a wreath of dried flowers on the left wall).
  const bunches = [];
  if (!opts.outside) { const r = rnd(71), stems = ['#6e7a42', '#8a8a4e', '#5e6a3a'], heads = ['#8a6ac0', '#c9a24a', '#7a8a4a', '#b05a6a', '#e8e0c8'];
    for (const [a, b] of limbs) for (let k = 1; k < 7; k++) {
      const p = a.clone().lerp(b, k / 7.3), hang = new THREE.Group(); hang.position.copy(p).add(new V3(0, -1.6, 0)); limbG.add(hang); bunches.push(hang);
      pole(hang, new V3(0, 0, 0), new V3(0, -2.2, 0), 0.07, '#c8b080', { ink: 0 });
      const hc = heads[(k * 3 + (a.z > 0 ? 1 : 0)) % heads.length];
      for (let s = 0; s < 6; s++) { const ang = s / 6 * Math.PI * 2 + r(), tip = new V3(Math.cos(ang) * 0.9, -7 - r() * 1.6, Math.sin(ang) * 0.9);
        pole(hang, new V3(0, -2.2, 0), tip, 0.1, stems[s % 3], { ink: 0 }); solid(hang, T.ell(0.6, 1.2, 0.6, 8, 6), hc, tip.x, tip.y - 0.6, tip.z, { ink: 0.04 }); }
    }
    const wr = new THREE.Mesh(new THREE.TorusGeometry(3, 0.7, 8, 24), T.mat('#9a8a5a')); wr.position.set(X0 + 1.6, 22, -12); wr.rotation.y = Math.PI / 2; W.left.add(wr);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; solid(W.left, T.ell(0.6, 0.6, 0.5), heads[k % heads.length], X0 + 2.2, 22 + Math.sin(a) * 3, -12 + Math.cos(a) * 3, { ink: 0.03 }); }
  }

  // ── The oak's crown, seen from outside: great rounded masses of leaves over the roof, on its spreading limbs.
  if (opts.outside) { const r = rnd(73), leaf = [T.mat('#5e8a3e'), T.mat('#6f9a46'), T.mat('#4e7a36')];
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, d = 18 + r() * 14, p = new V3(OAK.x + Math.cos(a) * d, 92 + r() * 22, OAK.z + Math.sin(a) * d);
      pole(oakG, new V3(OAK.x, 84, OAK.z), p.clone().add(new V3(0, -6, 0)), 2.6, barkM, { taper: 2.2, ink: 0.1 });
      solid(oakG, T.ell(16 + r() * 8, 11 + r() * 4, 16 + r() * 8, 16, 10), leaf[k % 3], p.x, p.y, p.z, { ink: 0.2 }); }
    solid(oakG, T.ell(26, 16, 26, 18, 12), leaf[1], OAK.x, 122, OAK.z, { ink: 0.2 });
  }

  // Which parts show: the walls, roof and floor when the camera's inside them; the oak when it's inside both walls it stands at; its limbs (and
  // the herbs on them) when it's under the roof.
  const cp = new V3(), cd = new V3(), hp = new V3(), HO = new V3(0, -5, 0);      // (HO: from where a bunch hangs to its middle)
  function update(camera) {
    camera.getWorldPosition(cp);
    for (const p of panels) p.g.visible = p.test(cp);
    oakG.visible = opts.outside || (W.back.visible && W.right.visible);
    limbG.visible = roofs.every(g => g.visible);
    // (a bunch hanging in the camera's line of sight, or close to it, isn't drawn, so it never fills the view or hides who's talking)
    camera.getWorldDirection(cd);
    for (const h of bunches) { h.getWorldPosition(hp).add(HO); const v = hp.sub(cp), along = v.dot(cd), off = v.addScaledVector(cd, -along).length(); h.visible = !(along > -4 && along < 60 && off < 7 + along * 0.18); }
    const shown = o => { for (; o && o !== root_; o = o.parent) if (!o.visible) return false; return true; };
    for (const it of world.items) it.obj.visible = !it.panel || shown(it.panel);
  }
  // Seen from outside (the wood): a wall, a slope of the roof or the oak standing between the camera and her is cut away while it's there, so
  // she's never lost behind the cabin as she comes out of it (from, to: the camera and her, in the world).
  const cutRay = new THREE.Raycaster(), cutParts = () => [...panels.map(p => p.g).filter(g => g !== floorG), oakG];
  let cutT = 0;
  function cut(from, to, dt) {
    if (!opts.outside || (cutT -= dt || 0) > 0) return; cutT = 0.1;
    const parts = cutParts(), c = root_.getWorldPosition(new V3()), d = from.clone().sub(to), L = d.length();
    if (to.distanceTo(c) > 160 && from.distanceTo(c) > 160) { for (const g of parts) g.visible = true; return; }
    cutRay.set(to, d.normalize()); cutRay.near = 0.5; cutRay.far = L;
    for (const g of parts) g.visible = cutRay.intersectObject(g, true).length === 0;      // (tested whether it's drawn or not: shown again once it's out of the way)
  }
  function tick(dt) {
    const d = world.door; if (d) { d.open += (d.target - d.open) * (1 - Math.exp(-dt * 5)); d.pivot.rotation.y = d.swing * d.open; }
    fire.t += dt; const ft = fire.t, flick = 0.5 + 0.25 * Math.sin(ft * 11.3) + 0.15 * Math.sin(ft * 23.7 + 1) + 0.1 * Math.sin(ft * 5.1);
    for (const f of fire.flames) { const k = 1 + 0.22 * Math.sin(ft * f.f + f.ph) + 0.12 * Math.sin(ft * f.f * 2.3 + f.ph * 2); f.m.scale.set(f.w * (1.05 - 0.1 * k), f.sz * k, f.w * (1.05 - 0.1 * k)); f.m.position.z = f.z + 0.25 * Math.sin(ft * f.f * 0.6 + f.ph); }
    if (fire.light) fire.light.intensity = (0.6 + 0.4 * flick) * (fire.lightK || 1);
    if (fire.embers) fire.embers.material.color.setRGB(0.75 + 0.2 * flick, 0.14 + 0.08 * flick, 0.03);
  }
  // As the day goes, the fire counts for more.
  function light(t) { fire.lightK = 1 + 1.6 * t; }
  world.bounds = { x0: X0 + 2.4, x1: X1 - 2.4, z0: Z0 + 2.4, z1: Z1 - 2.4 };
  return { group: root_, update, tick, light, cut, world, pieces, bounds: { X0, X1, Z0, Z1, EAVE, RIDGE }, oak: OAK };
}

root.Cabin = Object.assign({ build, PIECES }, ROOM);
})(typeof window !== 'undefined' ? window : globalThis);
