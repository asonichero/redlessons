// A small sandbox world in the blocky style: a meadow with a winding path, a forest, flowers, rocks to jump on, a rock to climb, a stump, and a cottage at the end of the path.
// World.build() returns { scene, solids, bounds, spawn, items, hut, surfaceAt(x, z), update(dt, t) }. Units are skin pixels (the hero stands about 30 tall); x east, z south, y up.
// `solids` is every collidable thing as a box { x0, x1, z0, z1, top, kind, climb }: top is how tall it is (INF can never be stepped onto), and `climb: true` marks a face
// the player can climb with Space instead of jumping. The player (js/player.js) reads this list, so a new level is a new list of boxes plus some meshes.
(function (root) {
'use strict';
const THREE = root.THREE, V = root.Voxel, INF = 1e9;
const { clothTexture, clothBox, noise, lam, col, rng } = V;

const T = {};
function textures() {
  if (T.grass) return T;
  const tex = (base, tones, seed, density, extra) => clothTexture(x => { noise(x, base, tones, seed, density); if (extra) extra(x); });
  T.grass = tex('#5f8f3a', ['#6aa044', '#538030', '#78b050', '#4a7a2c'], 1, 0.5);
  T.path = tex('#ad8f5f', ['#a08454', '#bd9f6c', '#94784a'], 4, 0.4);
  T.bark = tex('#5a4430', ['#4a3624', '#6a523a', '#3e2c1c'], 15, 0.5, x => { x.fillStyle = '#3e2c1c'; for (let i = 1; i < 16; i += 5) x.fillRect(i, 0, 1, 16); });
  T.leaf = tex('#3f7a2c', ['#34682a', '#4a8a34', '#2c5a22', '#58a040'], 14, 0.55);
  T.leafDark = tex('#2f6424', ['#285a20', '#387430', '#205018'], 24, 0.5);
  T.stone = tex('#8c8a84', ['#7a7872', '#9a9890', '#6a6862', '#a8a69e'], 6, 0.5, x => { x.fillStyle = '#5e5c56'; x.fillRect(0, 5, 16, 1); x.fillRect(0, 11, 16, 1); x.fillRect(5, 0, 1, 5); x.fillRect(11, 6, 1, 5); x.fillRect(3, 12, 1, 4); });
  T.moss = tex('#7f8f6a', ['#6f8a58', '#8fa070', '#60784c', '#9a9a84'], 9, 0.55);
  T.plaster = tex('#e0d4b4', ['#d3c6a4', '#ebdfc2', '#c4b794'], 7, 0.35);
  T.timber = tex('#4a3624', ['#3a2a1a', '#5a4430', '#2e2014'], 9, 0.4);
  T.plank = tex('#8a6c4a', ['#7a5e3e', '#9a7c58', '#6a5034'], 10, 0.4, x => { x.fillStyle = '#5e4630'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 8, 16, 1); });
  T.thatch = tex('#b09554', ['#9a7f40', '#c4aa68', '#826a32', '#d2ba7c'], 12, 0.6, x => { x.fillStyle = '#6e5828'; for (let i = 0; i < 16; i += 3) x.fillRect(i, 0, 1, 16); });
  T.cloud = tex('#f6f8fa', ['#eaeef2', '#ffffff'], 18, 0.4);
  return T;
}
const mats = {}; const mat = n => mats[n] || (mats[n] = lam(textures()[n]));
const box = (w, h, d, m, x, y, z, parent) => { const b = clothBox(w, h, d, m); b.position.set(x, y, z); if (parent) parent.add(b); return b; };

// The path wanders from the south (where the player starts) up to the cottage.
const SPAWN = { x: 0, z: 110, heading: Math.PI }, HUT = { x: 0, z: -205, w: 64, d: 46, h: 34 };
const pathX = z => 26 * Math.sin(z / 62) + 8 * Math.sin(z / 23);
const nearPath = (x, z, m) => z < 140 && z > HUT.z - 40 && Math.abs(x - pathX(z)) < m;

function build() {
  const scene = new THREE.Scene(), r = rng(2024), solids = [], updaters = [], SIZE = 900;
  const sky = new THREE.Color(0x9ccfee); scene.background = sky; scene.fog = new THREE.Fog(0xb8dcf0, 260, 640);
  scene.add(new THREE.HemisphereLight(0xdcecff, 0x58703a, 0.85));
  const sun = new THREE.DirectionalLight(0xfff0d0, 0.75); sun.position.set(90, 160, 60); scene.add(sun);

  // Ground and path.
  const gt = textures().grass.clone(); gt.needsUpdate = true; gt.repeat.set(SIZE / 16, SIZE / 16);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), new THREE.MeshLambertMaterial({ map: gt })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const steps = []; for (let z = 128; z > HUT.z + HUT.d / 2; z -= 6) steps.push(z);
  const path = new THREE.InstancedMesh(new THREE.BoxGeometry(20, 0.25, 6.4), mat('path'), steps.length), m4 = new THREE.Matrix4();
  steps.forEach((z, i) => { m4.makeRotationY(Math.atan2(pathX(z - 3) - pathX(z + 3), 6) * 0.9); m4.setPosition(pathX(z), 0.12, z); path.setMatrixAt(i, m4); });
  scene.add(path);

  // Trees: a trunk and three stacked blocks of leaves. A ring of them walls the world in; the rest are scattered, clear of the path and the clearings.
  const trees = [], tree = (x, z, s) => {
    const g = new THREE.Group(), th = 44 * s, tw = 8 * s, tex = r() < 0.5 ? 'leaf' : 'leafDark';
    box(tw, th, tw, mat('bark'), 0, th / 2, 0, g);
    box(34 * s, 14 * s, 34 * s, mat(tex), 0, th + 2 * s, 0, g); box(24 * s, 14 * s, 24 * s, mat(tex), 0, th + 15 * s, 0, g); box(14 * s, 12 * s, 14 * s, mat(tex), 0, th + 27 * s, 0, g);
    g.position.set(x, 0, z); g.rotation.y = Math.floor(r() * 4) * Math.PI / 2; scene.add(g); trees.push(g);
    solids.push({ x0: x - tw / 2, x1: x + tw / 2, z0: z - tw / 2, z1: z + tw / 2, top: INF, kind: 'tree' });
  };
  for (let x = -250; x <= 250; x += 26) for (const z of [-250, 250]) tree(x + (r() - 0.5) * 8, z + (r() - 0.5) * 8, 1.2 + r() * 0.3);
  for (let z = -224; z <= 224; z += 26) for (const x of [-250, 250]) tree(x + (r() - 0.5) * 8, z + (r() - 0.5) * 8, 1.2 + r() * 0.3);
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * 460, z = (r() - 0.5) * 460;
    if (nearPath(x, z, 34) || Math.hypot(x - SPAWN.x, z - SPAWN.z) < 115 || Math.hypot(x - HUT.x, z - HUT.z) < 70 || Math.hypot(x + 30, z - 85) < 20 || Math.hypot(x - 60, z - 40) < 24 || Math.hypot(x - 80, z + 60) < 24 || Math.hypot(x + 70, z + 20) < 30) continue;
    tree(x, z, 0.85 + r() * 0.5);
  }

  // Things to jump on: rocks (6 and 9 tall, a jump rises about 15), a fallen log, a tall rock that needs a climb, a stump with a basket on it, and bushes.
  const rock = (x, z, w, h, d, kind, climb) => { box(w, h, d, mat('stone'), x, h / 2, z, scene); box(w * 0.6, 1.2, d * 0.6, mat('moss'), x, h + 0.6, z, scene); solids.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, top: h + 1.2, kind: kind || 'rock', climb }); };
  rock(54, 40, 12, 6, 12); rock(66, 44, 14, 9, 12); rock(60, 32, 10, 4.5, 10);
  rock(80, -60, 18, 17, 18, 'bigrock', true);
  box(46, 9, 9, mat('bark'), -70, 4.5, -20, scene); solids.push({ x0: -93, x1: -47, z0: -24.5, z1: -15.5, top: 9, kind: 'log' });
  box(10, 8, 10, mat('bark'), -30, 4, 85, scene); box(8, 0.8, 8, mat('plank'), -30, 8.4, 85, scene); solids.push({ x0: -35, x1: -25, z0: 80, z1: 90, top: 8.8, kind: 'stump' });
  for (const [x, z] of [[-60, 100], [48, 70], [-40, -90], [70, -130], [-84, -150]]) { box(15, 10, 15, mat('leaf'), x, 5, z, scene); solids.push({ x0: x - 7.5, x1: x + 7.5, z0: z - 7.5, z1: z + 7.5, top: 10, kind: 'bush' }); }

  // The cottage at the end of the path: plaster walls on a stone footing, a door, two windows, a stepped thatched roof and a chimney.
  const hut = new THREE.Group(); hut.position.set(HUT.x, 0, HUT.z); scene.add(hut);
  box(HUT.w + 2, 4, HUT.d + 2, mat('stone'), 0, 2, 0, hut); box(HUT.w, HUT.h, HUT.d, mat('plaster'), 0, 4 + HUT.h / 2, 0, hut);
  for (const x of [-HUT.w / 2, HUT.w / 2, 0]) for (const z of [-HUT.d / 2, HUT.d / 2]) if (x !== 0 || z > 0) box(2.4, HUT.h, 2.4, mat('timber'), x, 4 + HUT.h / 2, z, hut);
  const doorZ = HUT.d / 2 + 0.2;
  box(11, 20, 1, mat('plank'), 0, 14, doorZ, hut); box(13, 1.6, 1.4, mat('timber'), 0, 24.4, doorZ, hut); box(1.6, 1.6, 1.2, col('#d9b24a'), 3.4, 14, doorZ + 0.6, hut);
  for (const x of [-18, 18]) { box(10, 9, 1, col('#bcd8ea'), x, 22, doorZ, hut); box(12, 1.4, 1.4, mat('timber'), x, 27, doorZ, hut); box(12, 1.4, 1.4, mat('timber'), x, 17, doorZ, hut); box(1.4, 11, 1.4, mat('timber'), x - 6, 22, doorZ, hut); box(1.4, 11, 1.4, mat('timber'), x + 6, 22, doorZ, hut); box(1, 9, 1.2, mat('timber'), x, 22, doorZ + 0.2, hut); }
  [[HUT.w + 8, HUT.d + 8, 4], [HUT.w - 2, HUT.d, 4], [HUT.w - 16, HUT.d - 6, 4], [HUT.w - 32, HUT.d - 12, 4]].forEach(([w, d, h], i) => box(w, h, d, mat('thatch'), 0, 4 + HUT.h + 2 + i * 4, 0, hut));
  box(7, 18, 7, mat('stone'), 18, 50, -8, hut);
  solids.push({ x0: HUT.x - HUT.w / 2 - 1, x1: HUT.x + HUT.w / 2 + 1, z0: HUT.z - HUT.d / 2 - 1, z1: HUT.z + HUT.d / 2 + 1, top: INF, kind: 'hut' });
  // A low fence either side of the door.
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const x = side * (22 + i * 9), z = HUT.z + HUT.d / 2 + 16; box(2, 11, 2, mat('plank'), x, 5.5, z, scene); solids.push({ x0: x - 1, x1: x + 1, z0: z - 1, z1: z + 1, top: INF, kind: 'post' }); if (i) box(9, 1.6, 1, mat('plank'), x - 4.5, 8, z, scene); }

  // Flowers: instanced stems and petals, scattered over the meadow; a few more beside the path.
  const FL = 260, stems = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 4, 0.7), col('#3f7a2c'), FL), heads = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 2.2, 2.6), new THREE.MeshLambertMaterial({ color: 0xffffff }), FL);
  const palette = ['#f5f0e0', '#f2d24a', '#e8618a', '#b890e8', '#ffffff', '#f08a4a'], c = new THREE.Color();
  for (let i = 0; i < FL; i++) {
    let x, z; do { x = (r() - 0.5) * 440; z = (r() - 0.5) * 440; } while (Math.abs(x - pathX(z)) < 12 && z < 130 && z > HUT.z);
    m4.makeTranslation(x, 2, z); stems.setMatrixAt(i, m4); m4.makeTranslation(x, 4.8, z); heads.setMatrixAt(i, m4); c.set(palette[Math.floor(r() * palette.length)]).convertSRGBToLinear(); heads.setColorAt(i, c);
  }
  scene.add(stems, heads);

  // Clouds, drifting.
  const clouds = []; for (let i = 0; i < 9; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) box(40 + r() * 40, 12, 28 + r() * 20, mat('cloud'), (k - 1.5) * 28, r() * 6, (r() - 0.5) * 14, g); g.position.set((r() - 0.5) * 900, 230 + r() * 40, (r() - 0.5) * 900); scene.add(g); clouds.push(g); }
  updaters.push(dt => { for (const g of clouds) { g.position.x += dt * 2.2; if (g.position.x > 520) g.position.x = -520; } });

  const BOUNDS = { x0: -236, x1: 236, z0: -236, z1: 236 };
  const surfaceAt = (x, z) => { let top = 0, kind = 'grass'; for (const o of solids) if (o.top < INF && x > o.x0 - 3 && x < o.x1 + 3 && z > o.z0 - 3 && z < o.z1 + 3 && o.top > top) { top = o.top; kind = o.kind; } if (top === 0 && nearPath(x, z, 10)) kind = 'path'; return { top, kind }; };
  return { scene, solids, bounds: BOUNDS, spawn: SPAWN, hut: HUT, items: { stump: { x: -30, y: 8.8, z: 85 } }, surfaceAt, pathX, INF, update(dt, t) { for (const u of updaters) u(dt, t); } };
}

root.World = { build, pathX, SPAWN, HUT, INF };
})(typeof window !== 'undefined' ? window : globalThis);
