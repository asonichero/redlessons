// Red Lessons — the village hub: the square with its well, her mother's bakery, the mill, the inn, two market stalls, and the forest edge where
// the path into the Whisperwood begins. Built from textured boxes in the same blocky style as the Jack game (1 unit = 1 skin pixel; a grown adult
// stands about 30 tall). This is the open-world hub: the heroine walks it freely, puts the cloak on or takes it off, talks to people, and the
// ledger (js/ledger.js) writes down what she does while she wears it.
//
//   Village.build(G)        → world { scene, update, cast, stage helpers }
//   Village.opening(G, W)   → the cutscene: Grandmother gives her the cloak and the village names its terms
//   Village.play(G, W, L)   → the free-roam loop; resolves when a giver calls her in (with that giver's id) or when she quits to the title
//
// Controls (as in the Jack game): WASD / arrows walk relative to the camera; Shift runs; C sneaks; drag turns the camera; V or the wheel zooms;
// E talks / acts; Q picks up and puts down; F puts the cloak on or takes it off; L opens her account book.
(function (root) {
'use strict';
const THREE = root.THREE, B = root.Blocky, C = root.Cast, A = root.GameAudio, V3 = THREE.Vector3;
const $ = id => document.getElementById(id);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const turn = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };

const ADULT = 0.95;                 // an ordinary adult's scale (as in the Jack game)
const CLOAK_SCALE = 0.55;           // her scale in the cloak, against her full size. (Scale only: her model, clothes and face do not change.)
const WALK = 40, RUN = 78, CREEP = 18;       // speeds in units per second at full size
// In the cloak her pace barely drops: the world is bigger, not slower. (Speed scales by 0.85 + 0.15 × size, so the cloak costs about 7%.)
const PACE = size => 0.85 + 0.15 * size;
const ZOOMS = [{ name: 'Close', d: 70 }, { name: 'Medium', d: 120 }, { name: 'Far', d: 200 }];
const BOUNDS = { x0: -300, x1: 300, z0: -215, z1: 330 };

// ── Textures and boxes ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const texCache = {};
function pix(key, cols, opts) {
  if (texCache[key]) return texCache[key];
  opts = opts || {}; const n = opts.n || 16, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d');
  let s = 11 + key.length * 977; const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return (s >>> 16) / 65536; };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(rnd() * cols.length)]; x.fillRect(i, j, 1, 1); }
  if (opts.draw) opts.draw(x, n);
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.encoding = THREE.sRGBEncoding;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; texCache[key] = t; return t;
}
// The look: flat cel-shaded colours (js/toon.js), each surface one soft colour (the average of its old palette, a touch brighter), and an ink outline
// round every box. Painted details (the signs) keep their little textures, cel-shaded too.
const MATS = {};
const avg = cols => { const c = new THREE.Color(0, 0, 0); for (const h of cols) c.add(new THREE.Color(h)); c.multiplyScalar(1 / cols.length); c.offsetHSL(0, 0.06, 0.04); return '#' + c.getHexString(); };
function mat(key, cols, rep, opts) {
  const k = key + ':' + (rep || 1);
  if (!MATS[k]) {
    if (opts && opts.draw) { const t = pix(key, cols, opts).clone(); t.needsUpdate = true; t.repeat.set(rep || 1, rep || 1); MATS[k] = root.Toon.toon('#ffffff', { map: t }); }
    else MATS[k] = root.Toon.toon(avg(cols));
  }
  return MATS[k];
}
const col = hex => root.Toon.toon(hex);
const WOOD = ['#7a5232', '#6a4628', '#86603a', '#5e3e22'], PLASTER = ['#efe4cc', '#e6d9bc', '#f4ead6', '#ddd0b2'], THATCH = ['#c9a45a', '#b8934a', '#d6b46a', '#a8843e'];
const STONE = ['#8f8a80', '#7d786e', '#a19c90', '#6e6a62'], COBBLE = ['#9a9488', '#8a8478', '#aaa498', '#7a7468', '#6a665e'], GRASS = ['#6a9a4a', '#5e8e40', '#76a656', '#548436'];
const LEAF = ['#3e6e34', '#34602c', '#4a7c3e', '#2c5426'], PATH = ['#9a7a52', '#8a6c46', '#a6865c', '#7c603e'], SLATE = ['#5a5e6a', '#4e525e', '#666a76'];

function box(w, h, d, m, x, y, z, parent) {
  const g = new THREE.BoxGeometry(w, h, d), mesh = new THREE.Mesh(g, m); mesh.position.set(x, y + h / 2, z); if (parent) parent.add(mesh);
  // The ink outline: the same box a fixed half-unit larger all round, drawn from the inside.
  const ink = new THREE.Mesh(g, root.Toon.INK); ink.scale.set((w + 0.9) / w, (h + 0.9) / h, (d + 0.9) / d); mesh.add(ink);
  return mesh;
}

// ── The world ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Solid things, as rectangles on the ground (x0..x1, z0..z1). Nothing here is climbable yet.
function build(G) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#a8d4ee').convertSRGBToLinear(); scene.fog = new THREE.Fog(new THREE.Color('#cfe4f0').convertSRGBToLinear(), 380, 900);
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x8aa070, 0.55));
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.95); sun.position.set(-200, 400, 260); scene.add(sun);
  const solids = [];
  const solid = (x0, x1, z0, z1, tag) => { solids.push({ x0, x1, z0, z1, tag }); };

  // Ground: grass, the cobbled square, the lane to each building, and the forest path.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), mat('grass', GRASS, 70)); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const sq = new THREE.Mesh(new THREE.CircleGeometry(115, 32), mat('cobble', COBBLE, 16)); sq.rotation.x = -Math.PI / 2; sq.position.y = 0.2; scene.add(sq);
  const lane = (x, z, w, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat('cobble', COBBLE, 6)); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.15, z); scene.add(m); };
  lane(0, -125, 40, 40); lane(-140, -30, 80, 30); lane(140, -30, 80, 30);
  const PATH_X = x => 18 * Math.sin(x / 40);            // the forest path wanders: its centre-line x at depth z (see onPath)
  for (let z = 150; z < 340; z += 8) { const m = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), mat('path', PATH, 2)); m.rotation.x = -Math.PI / 2; m.position.set(PATH_X(z), 0.18, z); scene.add(m); }

  // The bakery (her mother's): plaster and timber, a thatched roof, a chimney, a bread sign over the door. North side of the square.
  const bakery = new THREE.Group(); bakery.position.set(0, 0, -175); scene.add(bakery);
  box(110, 52, 70, mat('plaster', PLASTER, 4), 0, 0, 0, bakery);
  for (const x of [-55, -18, 18, 55]) box(4, 52, 72, mat('wood', WOOD, 2), x, 0, 0, bakery);
  box(114, 4, 74, mat('wood', WOOD, 4), 0, 24, 0, bakery);
  const roof = box(124, 30, 84, mat('thatch', THATCH, 6), 0, 52, 0, bakery); roof.scale.set(1, 1, 1); roof.geometry = new THREE.CylinderGeometry(0.01, 62, 30, 4, 1); roof.children[0].geometry = roof.geometry; roof.children[0].scale.setScalar(1.025); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.7); roof.position.y = 67;
  box(12, 30, 12, mat('stone', STONE, 2), 34, 62, -14, bakery);
  box(22, 34, 2, mat('wood', ['#4a2e18', '#3e2614', '#56361e'], 2), 0, 0, 35.5, bakery);               // the door
  box(18, 14, 2, col('#ffd890'), -34, 22, 35.5, bakery); box(18, 14, 2, col('#ffd890'), 34, 22, 35.5, bakery);   // warm windows
  const sign = box(16, 12, 2, mat('signb', ['#c99a5a'], 1, { draw: (x) => { x.fillStyle = '#7a4a1e'; x.fillRect(3, 6, 10, 5); x.fillStyle = '#e6c08a'; x.fillRect(4, 7, 8, 3); } }), 22, 40, 41, bakery);
  solid(-58, 58, -213, -137, 'bakery');
  // Bread on a table outside the door: the work she is no longer asked to do while she wears the cloak.
  box(30, 10, 12, mat('wood', WOOD, 1), -40, 0, -125, scene); for (let i = 0; i < 4; i++) box(5, 3, 7, col('#c88a4a'), -50 + i * 7, 10, -125, scene);
  solid(-56, -24, -132, -118, 'table');

  // The mill (west): stone, a slate roof, a turning waterwheel and a millpond.
  const mill = new THREE.Group(); mill.position.set(-225, 0, -40); scene.add(mill);
  box(70, 60, 70, mat('stone', STONE, 4), 0, 0, 0, mill);
  const mroof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 56, 28, 4, 1), mat('slate', SLATE, 6)); mroof.rotation.y = Math.PI / 4; mroof.position.y = 74; mill.add(mroof);
  box(20, 30, 2, mat('wood', ['#4a2e18', '#3e2614', '#56361e'], 2), 0, 0, 35.5, mill); mill.children[mill.children.length - 1].position.x = 36; mill.children[mill.children.length - 1].rotation.y = Math.PI / 2;
  const wheel = new THREE.Group(); wheel.position.set(0, 30, -40); mill.add(wheel);
  for (let i = 0; i < 8; i++) { const sp = box(4, 52, 6, mat('wood', WOOD, 2), 0, -26, 0, wheel); sp.position.y = 0; sp.rotation.x = i * Math.PI / 8; }
  const pond = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), col('#4a7aa0')); pond.rotation.x = -Math.PI / 2; pond.position.set(-225, 0.3, -100); scene.add(pond);
  solid(-262, -188, -77, -3, 'mill'); solid(-270, -180, -125, -75, 'pond');
  // Flour sacks by the mill door (one is the errand's).
  for (let i = 0; i < 3; i++) box(8, 10, 6, mat('sack', ['#e6dcc0', '#d8cdb0', '#f0e8d4'], 1), -178, 0, -60 + i * 9, scene);
  solid(-184, -172, -64, -38, 'sacks');

  // The inn (east): timber-framed, two storeys, a hanging sign.
  const inn = new THREE.Group(); inn.position.set(225, 0, -40); scene.add(inn);
  box(70, 70, 80, mat('plaster2', ['#e8d8b8', '#dccaa6', '#f0e2c6'], 4), 0, 0, 0, inn);
  for (const z of [-40, 0, 40]) box(72, 3, 3, mat('wood', WOOD, 2), 0, 34, z, inn);
  const iroof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 62, 30, 4, 1), mat('slate', SLATE, 6)); iroof.rotation.y = Math.PI / 4; iroof.position.y = 85; inn.add(iroof);
  const idoor = box(2, 32, 20, mat('wood', ['#4a2e18', '#3e2614', '#56361e'], 2), -35.5, 0, 0, inn);
  box(2, 12, 16, mat('innsign', ['#2a5a5a'], 1, { draw: (x) => { x.fillStyle = '#d8c890'; x.fillRect(4, 4, 8, 8); x.fillStyle = '#2a5a5a'; x.fillRect(6, 6, 4, 4); } }), -48, 44, -26, inn);
  solid(188, 262, -82, 2, 'inn');

  // The well in the middle of the square.
  const well = new THREE.Group(); scene.add(well);
  box(26, 12, 26, mat('stone', STONE, 2), 0, 0, 0, well); box(18, 1, 18, col('#2a4a6a'), 0, 11.6, 0, well);
  for (const x of [-11, 11]) box(3, 26, 3, mat('wood', WOOD, 1), x, 12, 0, well);
  const wroof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 20, 10, 4, 1), mat('thatch', THATCH, 2)); wroof.rotation.y = Math.PI / 4; wroof.position.y = 43; well.add(wroof);
  solid(-15, 15, -15, 15, 'well');

  // Two market stalls: the miller's bread-and-flour stall (where "taking" is possible) and an apple stall with a crate that can be knocked over.
  const stall = (x, z, cloth) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    box(40, 12, 16, mat('wood', WOOD, 2), 0, 0, 0, g);
    for (const sx of [-19, 19]) for (const sz of [-7, 7]) box(2, 30, 2, mat('wood', WOOD, 1), sx, 0, sz, g);
    box(44, 2, 20, mat('cloth' + cloth[0], cloth, 2, { draw: (c, n) => { for (let i = 0; i < n; i += 4) { c.fillStyle = '#f2ece0'; c.fillRect(i, 0, 2, n); } } }), 0, 30, 0, g);
    solid(x - 22, x + 22, z - 10, z + 10, 'stall');
    return g;
  };
  const breadStall = stall(-75, 70, ['#b8443a', '#a83a30']); for (let i = 0; i < 5; i++) box(5, 3, 6, col('#c88a4a'), -16 + i * 8, 12, 0, breadStall);
  const appleStall = stall(75, 70, ['#4a7a4a', '#3e6e3e']); for (let i = 0; i < 6; i++) box(4, 4, 4, col(i % 2 ? '#c8342a' : '#a8c84a'), -15 + i * 6, 12, -2, appleStall);
  const crate = new THREE.Group(); crate.position.set(104, 0, 70); scene.add(crate);
  box(10, 8, 10, mat('wood', WOOD, 1), 0, 0, 0, crate); for (let i = 0; i < 4; i++) box(3.5, 3.5, 3.5, col('#c8342a'), -2.5 + (i % 2) * 5, 8, -2.5 + (i >> 1) * 5, crate);
  const crateZone = { x0: 98, x1: 110, z0: 64, z1: 76 };

  // The forest edge (south): a wall of trees with the path through it, the woodcutter's log pile and his marker post where the path enters.
  const trees = [];
  // (One shared low-poly sphere per size, so a hundred and fifty trees stay cheap to draw, on a phone too.)
  const TREE_GEO = [new THREE.IcosahedronGeometry(1, 1), new THREE.IcosahedronGeometry(1, 1), new THREE.IcosahedronGeometry(1, 1)];
  const tree = (x, z, h) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); trees.push(g);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.4, h, 10), mat('bark', ['#6a4a30', '#5e4028', '#745236'])); trunk.position.y = h / 2; g.add(trunk);
    const leaf = [mat('leaf', LEAF), col('#5a9a4a'), col('#3e7a3a')];
    for (const [ox, oy, oz, r, li] of [[0, h + 4, 0, 19, 0], [-11, h - 3, 5, 12, 2], [10, h - 1, -6, 13, 1], [3, h + 17, 2, 12, 1]]) {
      const ball = root.Toon.inked(TREE_GEO[Math.min(2, Math.round(r / 8))], leaf[li], 0.03); ball.scale.setScalar(r); ball.position.set(ox, oy, oz); g.add(ball);
    }
    solid(x - 5, x + 5, z - 5, z + 5, 'tree');
  };
  let ts = 5; const trnd = () => { ts = (ts * 16807) % 2147483647; return ts / 2147483647; };
  for (let z = 180; z < 340; z += 26) for (let x = -290; x <= 290; x += 30) { const jx = x + (trnd() - 0.5) * 16, jz = z + (trnd() - 0.5) * 14; if (Math.abs(jx - PATH_X(jz)) > 30) tree(jx, jz, 34 + trnd() * 24); }
  for (let z = -200; z < 180; z += 40) for (const x of [-300, 300]) tree(x + (trnd() - 0.5) * 10, z, 40 + trnd() * 20);
  for (let x = -280; x <= 280; x += 40) if (Math.abs(x) > 80) tree(x, -225, 44 + trnd() * 16);
  for (let i = 0; i < 4; i++) { const lg = box(6, 6, 28, mat('bark', ['#5a3e26', '#4e3420', '#664830'], 2), 58, i < 3 ? 0 : 6, 160 + (i % 3) * 7, scene); lg.rotation.y = 0.1; }
  solid(52, 64, 144, 188, 'logs');
  box(3, 22, 3, mat('wood', WOOD, 1), 24, 0, 152, scene); box(10, 6, 1, mat('marker', ['#d8c8a0'], 1, { draw: (x) => { x.fillStyle = '#7a1218'; x.fillRect(3, 4, 10, 8); } }), 24, 16, 154, scene);

  // ── The cast ──
  const cast = {}, anim = {};
  const place = (id, x, z, ry) => {
    const r = root.Toon.make(id); r.root.position.set(x, 0, z); r.root.rotation.y = ry; r.root.scale.setScalar(ADULT); scene.add(r.root);
    const a = anim[id] = { t: Math.random() * 10, phase: 0, speed: 0, look: 0, gesture: 0, air: false };
    r.after = q => {
      const s = Math.sin(a.phase) * clamp(a.speed / 20, 0, 1) * 0.7, idle = 0.02 * Math.sin(a.t * 1.1);
      q.legL.thigh.rotation.x = s; q.legR.thigh.rotation.x = -s; q.armL.rotation.x = -s * 0.8 + idle; q.armR.rotation.x = s * 0.8 - idle - 0.9 * a.gesture;
      if (q.elbow) q.elbow.rotation.x = -0.6 * a.gesture;
      if (a.carry) { q.armL.rotation.x = q.armR.rotation.x = -1.2; }
      if (a.air) { q.armL.rotation.x = q.armR.rotation.x = -2.4; q.legL.thigh.rotation.x = -0.5; q.legR.thigh.rotation.x = 0.25; }
      const mv = clamp(a.speed / 20, 0, 1);
      q.legL.knee.rotation.x = Math.max(0, -Math.sin(a.phase)) * 0.9 * mv + (a.air ? 0.6 : 0); q.legR.knee.rotation.x = Math.max(0, Math.sin(a.phase)) * 0.9 * mv + (a.air ? 0.6 : 0);
      if (!a.carry && !a.gesture) { q.elbow.rotation.x = -0.22 - 0.35 * mv; q.elbowL.rotation.x = -0.18 - 0.35 * mv; }
      q.neck.rotation.y = a.look; q.torso.rotation.z = 0.012 * Math.sin(a.t * 0.9); q.torso.rotation.x = 0.06 * mv;
      q.torso.scale.set(1, 1 + 0.008 * Math.sin(a.t * 1.6), 1);                      // (a breath)
      q.hips.position.y = (q.baseHip || 12) + Math.abs(Math.sin(a.phase)) * 0.6 * mv;
    };
    B.setPose(r, 'stand'); for (let i = 0; i < 20; i++) B.step(r, 0.1);
    cast[id] = r; return r;
  };
  const heroine = place('heroine', 0, 40, Math.PI);
  place('mother', 14, -128, 0);
  place('grandmother', 28, 26, -0.6);
  place('miller', -168, -48, Math.PI / 2);
  place('innkeeper', 168, -30, -Math.PI / 2);
  place('woodcutter', 46, 150, -0.4);
  // Each villager's spot: where they stand, the radius she must be inside to talk to them, and which way they face at rest.
  const spots = {
    mother: { x: 14, z: -128 }, grandmother: { x: 28, z: 26 }, miller: { x: -168, z: -48 }, innkeeper: { x: 168, z: -30 }, woodcutter: { x: 46, z: 150 },
  };
  for (const id in spots) spots[id].ry = cast[id].root.rotation.y;

  // The sack she can carry from the mill to the bakery (the miller's errand). Hidden until he asks.
  const sack = box(7, 9, 5, mat('sack', ['#e6dcc0', '#d8cdb0', '#f0e8d4'], 1), 0, 0, 0, scene); sack.visible = false;

  const world = {
    scene, cast, anim, spots, solids, sack, crate, crateZone, PATH_X, wheel, heroine, trees,
    // A tree the camera has gone into (or that stands between the camera and her) is not drawn, so the view never fills with leaves.
    clearView(cam, at) {
      const dx = at.x - cam.x, dz = at.z - cam.z, L2 = dx * dx + dz * dz || 1;
      for (const t of trees) {
        const px = t.position.x - cam.x, pz = t.position.z - cam.z, k = clamp((px * dx + pz * dz) / L2, 0, 1);
        const ex = px - dx * k, ez = pz - dz * k; t.visible = ex * ex + ez * ez > 30 * 30 && px * px + pz * pz > 48 * 48;
      }
    },
    update(dt) {
      wheel.rotation.x += dt * 0.6;
      for (const id in cast) { anim[id].t += dt; B.step(cast[id], dt); }
    },
  };
  return world;
}

// A two-shot across a conversation: from whichever side of the pair is clear of buildings, stalls and trees (trees in the way are hidden).
function twoShot(W, me, other, dist, y) {
  const a = Math.atan2(me.position.x - other.position.x, me.position.z - other.position.z);
  const mid = new V3().addVectors(me.position, other.position).multiplyScalar(0.5), side = new V3(Math.cos(a), 0, -Math.sin(a));
  const inSolid = p => W.solids.some(o => o.tag !== 'tree' && p.x > o.x0 - 4 && p.x < o.x1 + 4 && p.z > o.z0 - 4 && p.z < o.z1 + 4);
  let best = null;
  for (const [sg, k] of [[1, 1], [-1, 1], [1, 0.6], [-1, 0.6], [1, 0.35], [-1, 0.35]]) {
    const pos = mid.clone().addScaledVector(side, sg * dist * k);
    let clear = !inSolid(pos); for (let t = 0.2; t < 1 && clear; t += 0.2) clear = !inSolid(mid.clone().lerp(pos, t));
    if (clear) { best = pos; break; }
  }
  if (!best) best = mid.clone().addScaledVector(side, dist * 0.3);
  best.y = y + 8; const look = mid.clone().setY(y);
  W.clearView(best, look);
  return { pos: best, look, fov: 42 };
}

// ── The drone view for the title screen: a slow circle above the square. ──
const DRONE = t => { const a = t * 0.04 + 0.6; return { pos: new V3(Math.sin(a) * 330, 170, Math.cos(a) * 330 + 30), look: new V3(0, 20, -20), fov: 50 }; };

// ── The opening: Grandmother gives her the cloak; the village names its terms. ──────────────────────────────────────────────────────────────────
async function opening(G, W) {
  const { cast, anim, heroine } = W, N = C.HEROINE_NAME;
  G.mode = 'cutscene'; document.body.classList.add('cutscene');
  heroine.root.position.set(4, 0, 40); heroine.root.rotation.y = Math.PI * 0.82; heroine.root.scale.setScalar(ADULT);
  const g = cast.grandmother; g.root.position.set(22, 0, 22); g.root.rotation.y = -0.6;
  const shots = {
    wide: { pos: new V3(150, 90, 190), look: new V3(0, 20, -40), fov: 46 },
    two: { pos: new V3(-30, 34, 80), look: new V3(14, 22, 30), fov: 40 },
    her: { pos: new V3(-6, 30, 70), look: new V3(6, 26, 38), fov: 34 },
    gran: { pos: new V3(40, 30, 58), look: new V3(20, 28, 22), fov: 34 },
    square: { pos: new V3(0, 60, 160), look: new V3(0, 18, 30), fov: 48 },
  };
  G.cut(shots.wide); await G.fade(false, 1.6);
  await G.shot(shots.two, 4);
  heroine.setExpr('sulk');
  await G.say('narrator', 'In a village at the edge of the Whisperwood, a baker’s daughter had grown up, and had not much cared for it.');
  await G.say('grandmother', `You look as though the whole world has been put on your shoulders, ${N}.`);
  G.cut(shots.her);
  await G.say('heroine', 'It has. The ovens, the orders, the accounts, the deliveries. Mother wants me up before light every day. I can’t do all of it.');
  G.cut(shots.gran);
  await G.say('grandmother', 'So you’ve stopped doing any of it, and your mother is carrying both loads.');
  anim.grandmother.gesture = 1;
  await G.say('grandmother', 'I made you something. Wool from my own ewes, dyed the colour of rosehips. Put it on.');
  anim.grandmother.gesture = 0;
  G.cut(shots.two);
  heroine.cloak.show(true); heroine.setExpr('calm');
  // She puts it on, and the shrink: her scale eases down over two seconds. Nothing else about her changes.
  const t0 = G.t; await new Promise(res => { const u = () => { const k = clamp((G.t - t0) / 2, 0, 1), e = k * k * (3 - 2 * k); heroine.root.scale.setScalar(ADULT * lerp(1, CLOAK_SCALE, e)); if (k >= 1 || G.skipping) { heroine.root.scale.setScalar(ADULT * CLOAK_SCALE); G.updaters = G.updaters.filter(x => x !== u); res(); } }; G.updaters.push(u); });
  if (A && A.chime) A.chime();
  heroine.setExpr('smile');
  await G.say('heroine', 'Oh! I’m… small. Everything’s so far away. Nobody will expect anything of someone this size.');
  G.cut(shots.gran);
  await G.say('grandmother', 'Nobody will. That is the bargain, and the whole village is in on it.');
  await G.say('grandmother', 'While you wear the cloak, nobody will hand you an oven, an order book or a single chore. Take it off, and you are a grown woman with a bakery to help run.');
  G.cut(shots.her); heroine.setExpr('defiant');
  await G.say('heroine', 'And while I wear it, I can do as I like.');
  G.cut(shots.gran);
  await G.say('grandmother', 'As you like, yes. Free of responsibility. Not free of consequences.');
  await G.say('grandmother', 'Every villager has their terms. Break one, and it goes in their book. When a book is full, they will call you in to settle it.');
  await G.shot(shots.square, 3);
  await G.say('grandmother', 'The miller minds his stall and his errands. The innkeeper minds manners, mess and the evening bell. The woodcutter minds the forest path. And every one of them minds the truth.');
  G.cut(shots.her); heroine.setExpr('calm');
  await G.say('heroine', 'And Mother?');
  G.cut(shots.gran);
  await G.say('grandmother', 'Your mother keeps no book, and nor do I. We’ve done our share of minding you. This is the village’s turn.');
  await G.say('grandmother', 'Go on, then. See what you make of it.');
  heroine.setExpr('calm');
  await G.fade(true, 1);
  document.body.classList.remove('cutscene');
}

// ── Free roam ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Resolves with { call: giverId } when a giver calls her in, or { quit: true }.
function play(G, W, L, saved) {
  const { scene, cast, anim, spots, solids, heroine, sack, crate, crateZone, PATH_X } = W, ha = anim.heroine, N = C.HEROINE_NAME;
  const hud = HUD.get(); hud.show(true);
  return new Promise(resolve => {
    const keys = {}, tu = root.TouchUI.create({ keys, run: true, sneak: true, jump: true, act: true, drop: true, cam: true });
    const st = Object.assign({ pos: new V3(0, 0, 44), heading: Math.PI, y: 0, vy: 0, grounded: true, jumpReq: false, sneak: false, yaw: 0, pitch: 0.45, zoom: 1, speedN: 0,
      carrying: false, errand: null, offPathAt: 0, toastAt: 0, talking: false, crateDown: false, onPath: true, callAt: 0, bell: 0 }, saved || {});
    st.pos = new V3(st.pos.x, 0, st.pos.z); st.stick = tu.stick;
    let size = L.wearing ? CLOAK_SCALE : 1, sizeGoal = size, done = false;
    heroine.cloak.show(L.wearing); heroine.root.scale.setScalar(ADULT * size); heroine.setExpr('calm');
    for (const id in spots) { const r = cast[id].root; r.position.set(spots[id].x, 0, spots[id].z); r.rotation.y = spots[id].ry; }

    // Camera: centred on her, at a distance that shrinks with her (so the world seems to grow when she wears the cloak).
    const camPos = new V3(), look = new V3(), spec = { pos: camPos, look, fov: 48 };
    const camGoal = () => { const d = ZOOMS[st.zoom].d * (0.45 + 0.55 * size), p = st.pitch; look.set(st.pos.x, st.y + 26 * size, st.pos.z); return new V3(look.x + Math.sin(st.yaw) * Math.cos(p) * d, Math.max(3, look.y + Math.sin(p) * d), look.z + Math.cos(st.yaw) * Math.cos(p) * d); };
    camPos.copy(camGoal()); G.cut(spec); G.drone = null;

    // Input.
    const KM = { w: 'up', W: 'up', ArrowUp: 'up', s: 'down', S: 'down', ArrowDown: 'down', a: 'left', A: 'left', ArrowLeft: 'left', d: 'right', D: 'right', ArrowRight: 'right', Shift: 'run' };
    const kd = e => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; const k = KM[e.key]; if (k) { keys[k] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); }
      if (e.key === ' ') e.preventDefault(); if (e.repeat || st.talking) return;
      const c = e.key.toLowerCase();
      if (c === 'c' || c === 'x') setSneak(!st.sneak); else if (c === 'e') act(); else if (c === 'q') carry(); else if (e.key === ' ') st.jumpReq = true; else if (c === 'v') cycleZoom(); else if (c === 'f') cloak(); else if (c === 'l') hud.toggleBook(L);
    };
    const ku = e => { const k = KM[e.key]; if (k) keys[k] = false; };
    root.addEventListener('keydown', kd); root.addEventListener('keyup', ku);
    const drags = new Map(), el = G.renderer.domElement;
    const pd = e => drags.set(e.pointerId, { x: e.clientX, y: e.clientY }), pm = e => { const d = drags.get(e.pointerId); if (!d) return; st.yaw -= (e.clientX - d.x) * 0.006; st.pitch = clamp(st.pitch + (e.clientY - d.y) * 0.005, 0.06, 1.3); d.x = e.clientX; d.y = e.clientY; }, pu = e => drags.delete(e.pointerId);
    el.addEventListener('pointerdown', pd); el.addEventListener('pointermove', pm); el.addEventListener('pointerup', pu); el.addEventListener('pointercancel', pu);
    const wheel = e => { e.preventDefault(); cycleZoom(e.deltaY > 0 ? 1 : -1); }; el.addEventListener('wheel', wheel, { passive: false });
    function cycleZoom(dir) { st.zoom = (st.zoom + (dir || 1) + ZOOMS.length) % ZOOMS.length; tu.set('cam', { icon: 'camera', title: 'Camera: ' + ZOOMS[st.zoom].name }); }
    function setSneak(on) { st.sneak = on; tu.setSneak(on); toast(on ? 'Sneaking: slow and quiet.' : 'Walking.'); }
    tu.on.cam = () => cycleZoom(); tu.on.jump = () => { st.jumpReq = true; }; tu.on.act = () => act(); tu.on.drop = () => carry(); tu.on.sneak = on => { st.sneak = on; };
    hud.onBook = () => hud.toggleBook(L); hud.onCloak = () => cloak();

    const toast = (t, ms = 3600) => { hud.toast(t); st.toastAt = performance.now() + ms; };
    const dist = id => Math.hypot(st.pos.x - spots[id].x, st.pos.z - spots[id].z);
    const nearest = () => { let best = null, bd = 30 * Math.max(size, 0.7); for (const id in spots) { const d = dist(id); if (d < bd) { bd = d; best = id; } } return best; };
    const inBox = (o, x, z, m) => x > o.x0 - m && x < o.x1 + m && z > o.z0 - m && z < o.z1 + m;
    const radius = () => 4 * size + 1.5;
    const blocked = (x, z) => { if (x < BOUNDS.x0 || x > BOUNDS.x1 || z < BOUNDS.z0 || z > BOUNDS.z1) return true; for (const o of solids) if (inBox(o, x, z, radius())) return true; for (const id in spots) if (id !== 'heroine' && Math.hypot(x - cast[id].root.position.x, z - cast[id].root.position.z) < 5 + radius()) return true; return false; };
    const save = () => G.save({ step: 'village', ledger: L.state, hub: { pos: { x: st.pos.x, z: st.pos.z }, errand: st.errand, carrying: st.carrying } });

    // A talk: the camera closes in, the lines are spoken, the player may choose. Returns the choice index (or -1).
    async function talk(id, fn) {
      st.talking = true; hud.prompt(''); for (const k in keys) keys[k] = false; tu.show(false); document.body.classList.add('cutscene');
      const other = cast[id].root, me = heroine.root, a = Math.atan2(me.position.x - other.position.x, me.position.z - other.position.z);
      other.rotation.y = a; me.rotation.y = a + Math.PI; st.heading = me.rotation.y; ha.speed = 0;
      G.cut(twoShot(W, me, other, 46, 22 * (0.5 + 0.5 * size)));
      let r = -1; try { r = await fn(); } finally {
        st.talking = false; tu.show(true); document.body.classList.remove('cutscene'); camPos.copy(camGoal()); G.cut(spec); other.rotation.y = spots[id].ry; save();
      }
      return r;
    }

    // E: talk to whoever is nearest; or, at the bread stall, help herself.
    async function act() {
      if (st.talking) return;
      if (st.crateDown && inBox(crateZone, st.pos.x, st.pos.z, radius() + 6)) { st.crateDown = false; crate.rotation.z = 0; crate.position.y = 0; L.keep('mess'); toast('You gather up the apples, every one.'); hud.refreshBook(L); return; }
      if (L.wearing && Math.hypot(st.pos.x + 75, st.pos.z - 70) < 26 && !nearest()) {
        const c = await talk('miller', async () => G.choose('heroine', ['Help yourself to a bun. Nobody’s watching.', 'Leave it be.']));
        if (c === 0) { L.breach('taking', { note: 'a bun from the stall' }); toast('You eat the bun. Somewhere behind you, a pencil scratches in a book.'); }
        return checkDue();
      }
      const id = nearest(); if (!id) return;
      await talk(id, () => DIALOGUE[id](G, { L, st, size, toast, sack, cast }));
      checkDue();
    }
    // Q: the sack (picked up at the mill once the miller has asked; put down anywhere, or delivered at the bakery table).
    function carry() {
      if (st.carrying) {
        st.carrying = false; ha.carry = false; sack.visible = false;
        if (Math.hypot(st.pos.x + 40, st.pos.z + 125) < 30 && st.errand === 'sack') { st.errand = 'delivered'; toast('You set the flour down by the bread table. Your mother sees, and says nothing, but she smiles.'); }
        else toast('You put the sack down.');
        if (st.errand !== 'delivered') { sack.visible = true; sack.position.set(st.pos.x + Math.sin(st.heading) * 8, 0, st.pos.z + Math.cos(st.heading) * 8); st.sackAt = { x: sack.position.x, z: sack.position.z }; }
        return;
      }
      if (st.errand === 'sack' && ((Math.hypot(st.pos.x + 178, st.pos.z + 50) < 24 && !st.sackAt) || (st.sackAt && Math.hypot(st.pos.x - st.sackAt.x, st.pos.z - st.sackAt.z) < 14))) {
        st.carrying = true; ha.carry = true; st.sackAt = null; sack.visible = true; toast(size < 1 ? 'The sack is nearly as big as you are. You can’t run with it.' : 'You heft the sack onto your shoulder.'); return;
      }
      toast('Nothing to pick up here.');
    }
    // F: the cloak, on or off. On: the bargain applies, and she shrinks. Off: a grown woman again, with a grown woman's work.
    function cloak() {
      if (st.talking) return;
      if (st.carrying) { toast('Put the sack down first.'); return; }
      L.wearing = !L.wearing; heroine.cloak.show(L.wearing); sizeGoal = L.wearing ? CLOAK_SCALE : 1;
      toast(L.wearing ? 'The cloak settles on your shoulders, and the village grows tall around you. No responsibilities. Consequences, though.' : 'You fold the cloak over your arm. Full height, and the bakery’s work is yours again.');
      hud.cloakState(L.wearing); save();
    }
    function checkDue() {
      hud.refreshBook(L);
      const due = L.dueList(); if (!due.length || done) return;
      const g = due[0]; st.callAt = performance.now() + 2500; st.calling = g;
      toast(`${root.Ledger.GIVERS[g].name} wants a word with you.`, 4000);
    }
    function finish(r) { if (done) return; done = true; cleanup(); resolve(r); }
    function cleanup() { tu.destroy(); hud.show(false); root.removeEventListener('keydown', kd); root.removeEventListener('keyup', ku); el.removeEventListener('pointerdown', pd); el.removeEventListener('pointermove', pm); el.removeEventListener('pointerup', pu); el.removeEventListener('pointercancel', pu); el.removeEventListener('wheel', wheel); G.updaters = G.updaters.filter(u => u !== tick); for (const t of W.trees) t.visible = true; save(); }
    W.quit = () => finish({ quit: true });
    W.debug = { st, L, checkDue: () => checkDue() };          // (for the browser checks and the console)

    hud.cloakState(L.wearing); hud.refreshBook(L); cycleZoom(0);
    if (st.carrying) { ha.carry = true; sack.visible = true; }
    toast(L.wearing ? 'F takes the cloak off; L opens your account book. Walk up to anyone and press E to talk.' : 'F puts the cloak on.', 6000);

    const tick = dt => {
      if (done) return;
      size += (sizeGoal - size) * Math.min(1, dt * 2.2); heroine.root.scale.setScalar(ADULT * size);
      // Movement: WASD relative to the camera; she turns into the direction and walks along her heading.
      const f = new V3(-Math.sin(st.yaw), 0, -Math.cos(st.yaw)), r = new V3(Math.cos(st.yaw), 0, -Math.sin(st.yaw));
      const dir = new V3();
      if (!st.talking) { dir.addScaledVector(f, (keys.up ? 1 : 0) - (keys.down ? 1 : 0)).addScaledVector(r, (keys.right ? 1 : 0) - (keys.left ? 1 : 0)); if (Math.hypot(st.stick.x, st.stick.y) > 0.2) dir.addScaledVector(f, -st.stick.y).addScaledVector(r, st.stick.x); }
      const vel = new V3(), running = (keys.run || tu.run) && !st.carrying && !st.sneak;
      if (dir.lengthSq() > 0) {
        dir.normalize(); const want = Math.atan2(dir.x, dir.z); st.heading = turn(st.heading, want, Math.min(1, dt * 9));
        const sp = running ? RUN : st.sneak || st.carrying ? CREEP : WALK; vel.set(Math.sin(st.heading), 0, Math.cos(st.heading)).multiplyScalar(sp * PACE(size));
      }
      if (st.jumpReq) { st.jumpReq = false; if (st.grounded && !st.carrying && !st.talking) { st.vy = 70 * Math.sqrt(size); st.grounded = false; } }
      const nx = st.pos.x + vel.x * dt, nz = st.pos.z + vel.z * dt; if (!blocked(nx, st.pos.z)) st.pos.x = nx; if (!blocked(st.pos.x, nz)) st.pos.z = nz;
      st.vy -= 260 * dt; st.y += st.vy * dt; if (st.y <= 0) { st.y = 0; st.vy = 0; st.grounded = true; }
      st.speedN = vel.length() / PACE(size) * (0.6 + 0.4 / Math.max(size, 0.3)); ha.speed = st.talking ? 0 : st.speedN * 0.8; ha.phase += dt * st.speedN * 0.42; ha.air = !st.grounded;
      heroine.root.position.set(st.pos.x, st.y, st.pos.z); if (!st.talking) heroine.root.rotation.y = turn(heroine.root.rotation.y, st.heading, Math.min(1, dt * 12));
      if (st.carrying) { sack.position.set(st.pos.x, st.y + 30 * size * ADULT, st.pos.z); sack.scale.setScalar(1); sack.rotation.y = st.heading; }

      // The terms, as she walks.
      if (L.wearing && !st.talking) {
        // Running into the apple crate knocks it over: mess (the innkeeper's term), until she sets it right (E beside it).
        if (!st.crateDown && running && inBox(crateZone, st.pos.x, st.pos.z, radius() + 2)) {
          st.crateDown = true; crate.rotation.z = Math.PI / 2; crate.position.y = 5; L.breach('mess', { note: 'the apple crate knocked over' }); toast('Apples everywhere. That’s going in someone’s book.'); checkDue();
        }
        // The forest path: inside the trees (z past 175), she must stay on it. Leaving it is the woodcutter's term, at most once every 8 seconds.
        if (st.pos.z > 175) {
          const on = Math.abs(st.pos.x - PATH_X(st.pos.z)) < 16;
          if (!on && st.onPath && performance.now() > st.offPathAt) { st.offPathAt = performance.now() + 8000; L.breach('path', { note: 'off the path at the forest edge' }); toast('Off the path. Somewhere among the trees, an axe stops.'); checkDue(); }
          st.onPath = on;
        } else st.onPath = true;
      }
      // The crate can be set right again at any size: E beside it (mess kept, which takes a little off the book).
      if (st.crateDown && inBox(crateZone, st.pos.x, st.pos.z, radius() + 6)) hud.prompt('E: set the crate right');
      else { const id = nearest(); hud.prompt(st.talking ? '' : id ? 'E: talk to ' + root.Cast.WHO[id][0] : L.wearing && Math.hypot(st.pos.x + 75, st.pos.z - 70) < 26 ? 'E: the bread stall' : ''); }
      // The miller's errand runs on a clock: two minutes to carry the sack to the bakery once he has asked, then it is a broken term.
      if (st.errand === 'sack' && st.errandBy && Date.now() > st.errandBy) { st.errand = 'failed'; if (st.carrying) { st.carrying = false; ha.carry = false; sack.visible = false; } L.breach('errand', { note: 'the flour never reached the bakery' }); toast('Too slow. The miller has sent the boy with the flour instead, and written you down.'); checkDue(); }
      if (st.errand === 'delivered') { st.errand = 'kept'; L.keep('errand'); hud.refreshBook(L); save(); }
      hud.objective(st.errand === 'sack' ? `Carry the flour to the bakery table (${Math.max(0, Math.ceil((st.errandBy - Date.now()) / 1000))}s)` : L.wearing ? 'In the cloak: no responsibilities. Mind the terms.' : 'Out of the cloak: a grown woman, with work waiting at the bakery.');
      // A giver calls her in.
      if (st.calling && performance.now() > st.callAt && !st.talking) { const g = st.calling; st.calling = null; finish({ call: g }); return; }

      // Camera follows.
      const goal = camGoal(); camPos.lerp(goal, Math.min(1, dt * 6)); if (!st.talking) { G.cut(spec); W.clearView(camPos, look); }
    };
    G.updaters.push(tick);
    checkDue();
  });
}

// ── What each villager says. Each is an async function that returns when the talk is over. ──────────────────────────────────────────────────────
const DIALOGUE = {
  async mother(G, ctx) {
    const { L } = ctx;
    if (L.wearing) {
      await G.say('mother', 'There you are. Grandmother told me about the cloak.');
      await G.say('mother', 'Go on, love. I’ll manage. I always have.');
      await G.say('heroine', 'You’re not cross?');
      await G.say('mother', 'I’m tired. That isn’t the same thing. Come home before the bell.');
    } else {
      await G.say('mother', 'Out of the cloak? Then I could use you. The second batch wants shaping, and the Hendry order has to go out.');
      const c = await G.choose('heroine', ['Roll up her sleeves and help.', 'Not today, Mother.']);
      if (c === 0) { await G.say('mother', 'Thank you. Truly.'); ctx.toast('An hour at the bench, flour to the elbows. Your mother hums while she works.'); }
      else await G.say('mother', 'All right. Another day.');
    }
  },
  async grandmother(G, ctx) {
    const { L } = ctx;
    await G.say('grandmother', L.wearing ? 'Well? How does it feel, being let off?' : 'Cloak over your arm. Thinking better of it, or just resting?');
    const c = await G.choose('heroine', ['Remind me of the terms.', 'How am I doing?', 'Never mind.']);
    if (c === 0) {
      for (const k of ['errand', 'taking', 'mess', 'manners', 'path', 'curfew', 'lie']) { const T = root.Ledger.TERMS[k], g = root.Ledger.GIVERS[T.enforcer]; await G.say('grandmother', `${T.text} (That one is ${g.name.replace(/^The /, 'the ')}’s.)`); }
    } else if (c === 1) {
      const owing = Object.keys(root.Ledger.GIVERS).filter(g => L.owed(g) > 0);
      if (!owing.length) await G.say('grandmother', 'Nothing in anybody’s book. Don’t let it go to your head.');
      else await G.say('grandmother', `You’re written down with ${owing.map(g => root.Ledger.GIVERS[g].name.replace(/^The /, 'the ')).join(' and ')}. They’ll call you in when they’re ready.`);
    }
  },
  async miller(G, ctx) {
    const { L, st, toast } = ctx;
    if (!L.wearing) { await G.say('miller', 'Morning. Your mother’s flour is by the door, if you’re taking it today.'); return; }
    if (st.errand === 'sack') { await G.say('miller', 'The flour. The bakery. Off you go.'); return; }
    if (st.errand === 'kept') { await G.say('miller', 'Delivered, and on time. I’ve made a note of that too.'); return; }
    await G.say('miller', 'Free of responsibility, I hear. Then you won’t mind a favour, since it’s nobody’s responsibility.');
    await G.say('miller', 'A sack of flour for your mother. By the mill door. Two minutes, mind.');
    const c = await G.choose('heroine', ['All right, I’ll take it.', 'Carry it yourself.']);
    if (c === 0) { st.errand = 'sack'; st.errandBy = Date.now() + 120000; toast('Pick up the sack by the mill door (Q), and carry it to the table outside the bakery.'); }
    else { L.breach('manners', { giver: 'miller', note: 'told the miller to carry it himself' }); L.breach('errand', { note: 'refused the flour errand' }); await G.say('miller', 'Noted. Twice.'); }
  },
  async innkeeper(G, ctx) {
    const { L } = ctx;
    if (!L.wearing) { await G.say('innkeeper', 'Good day to you. The cloak suits you better than the scowl did, mind.'); return; }
    await G.say('innkeeper', 'Look at you, knee-high to a barrel. What brings you to my door?');
    const c = await G.choose('heroine', ['Just saying good day.', 'None of your business.', 'Is it true you keep a book on me?']);
    if (c === 0) { L.keep('manners'); await G.say('innkeeper', 'And a good day to you. That’s all it takes.'); }
    else if (c === 1) { L.breach('manners', { note: 'snapped at the innkeeper' }); await G.say('innkeeper', 'It is now.'); }
    else { await G.say('innkeeper', 'Everyone does, love. Mine’s for manners and mess.'); }
  },
  async woodcutter(G, ctx) {
    const { L } = ctx;
    await G.say('woodcutter', L.wearing ? 'Small enough to lose in the bracken. Keep to the path, or I’ll be the one coming to find you.' : 'Heading into the wood? Path’s marked with red ribbon. Mind it.');
    const c = await G.choose('heroine', ['What’s out there?', 'I’ll go where I like.']);
    if (c === 0) await G.say('woodcutter', 'Grandmother’s cottage, at the far end. And other things. Things that would be very glad to meet someone who doesn’t have to answer for anything.');
    else { if (L.wearing) L.breach('manners', { giver: 'woodcutter', note: 'told the woodcutter she’d go where she liked' }); await G.say('woodcutter', 'Then you’ll answer for where you went.'); }
  },
};

// ── The reckoning: the giver asks how it went; honest or not; the book is settled. The correction scene plugs in here (see README: it needs
// the lap rig refitted for her before it can be ported). For now the result is shown on a card. ──────────────────────────────────────────────────
async function reckoning(G, W, L, g) {
  const { cast, heroine } = W, giver = root.Ledger.GIVERS[g];
  G.mode = 'cutscene'; document.body.classList.add('cutscene');
  const gr = cast[g].root, me = heroine.root, a = Math.atan2(me.position.x - gr.position.x, me.position.z - gr.position.z);
  // The giver comes to her, and they face each other.
  gr.position.set(me.position.x - Math.sin(a) * 20, 0, me.position.z - Math.cos(a) * 20); gr.rotation.y = a; me.rotation.y = a + Math.PI;
  // (If where she stands leaves no room for the giver, they meet in the open square instead.)
  const room = p => !W.solids.some(o => p.x > o.x0 - 8 && p.x < o.x1 + 8 && p.z > o.z0 - 8 && p.z < o.z1 + 8);
  if (!room(gr.position)) { me.position.set(0, 0, 50); gr.position.set(0, 0, 30); gr.rotation.y = 0; me.rotation.y = Math.PI; }
  G.cut(twoShot(W, me, gr, 52, 20));
  const entries = L.state.books[g].slice(), N = C.HEROINE_NAME;
  heroine.setExpr('sulk');
  await G.say(g, `A word, ${N}. My book’s full, and it has your name all down the page.`);
  await G.say(g, 'Tell me how you’ve been getting on.');
  const c = await G.choose('heroine', ['Own up to all of it.', 'Say you’ve been as good as gold.']);
  const res = L.settle(g, { lied: c === 1 });
  const owned = entries.map(e => e.note).filter(Boolean).slice(0, 3), cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  if (c === 0) { heroine.setExpr('calm'); await G.say('heroine', owned.length ? cap(owned.join('; ')) + '. I know.' : 'I broke your terms. More than once. I know.'); await G.say(g, 'Thank you for the truth. It counts for something.'); }
  else { heroine.setExpr('defiant'); await G.say('heroine', 'As good as gold.'); await G.say(g, 'I keep a book, love. That’s rather the point of it.'); }
  await G.say(g, res.tier === 'none' ? 'Then we’re square already.' : 'Home with me, then. We’ll settle it properly.');
  await G.fade(true, 1);
  document.body.classList.remove('cutscene');
  gr.position.set(W.spots[g].x, 0, W.spots[g].z); gr.rotation.y = W.spots[g].ry;
  return res;
}

// ── The HUD (built once, in game.html): objective, prompt, toast, cloak button, the account book. ──
const HUD = (() => {
  let api = null;
  return { get() {
    if (api) return api;
    const el = $('vhud'), book = $('book');
    api = {
      show(on) { el.style.display = on ? 'block' : 'none'; document.body.classList.toggle('playing', on); if (!on) book.classList.remove('on'); },
      objective(t) { $('vObj').textContent = t; },
      prompt(t) { $('vPrompt').textContent = t; $('vPrompt').style.display = t ? 'block' : 'none'; },
      toast(t) { const e = $('vToast'); e.textContent = t; e.style.opacity = 1; clearTimeout(api._t); api._t = setTimeout(() => { e.style.opacity = 0; }, 3800); },
      cloakState(on) { $('vCloak').classList.toggle('on', on); $('vCloak').title = on ? 'Take the cloak off (F)' : 'Put the cloak on (F)'; },
      toggleBook(L) { api.refreshBook(L); book.classList.toggle('on'); },
      refreshBook(L) {
        const G_ = root.Ledger.GIVERS; let h = '';
        for (const g in G_) {
          const owed = L.owed(g), pct = Math.min(100, owed / G_[g].patience * 100), entries = L.state.books[g];
          h += `<div class="bk"><div class="bkh"><b>${G_[g].name}</b><span>trust ${Math.round(L.trust(g))}</span></div><div class="bkbar"><i style="width:${pct}%"></i></div>`
            + (entries.length ? '<ul>' + entries.slice(-4).map(e => `<li>${root.Ledger.TERMS[e.term].text}${e.note ? ' <em>(' + e.note + ')</em>' : ''}</li>`).join('') + '</ul>' : '<div class="bkclean">Nothing written.</div>') + '</div>';
        }
        $('bookBody').innerHTML = h;
      },
    };
    $('vBook').onclick = () => api.onBook && api.onBook(); $('vCloak').onclick = () => api.onCloak && api.onCloak(); $('bookClose').onclick = () => book.classList.remove('on');
    return api;
  } };
})();

root.Village = { build, opening, play, reckoning, DRONE, CLOAK_SCALE, ADULT };
})(window);
