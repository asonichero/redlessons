// Red Lessons — the cottage: one modest room, built in the same toon style as the characters (two-band shading, warm ink outlines, shapes and
// textures made here). Wattle-and-daub walls limewashed white in an oak timber frame, on a low stone foundation, under a thick thatch roof seen
// from inside (rafters, tie beams, the underside of the straw). Furnished simply: a trestle table and two low stools, a clothes chest, a peg rail
// hung with dried herbs, lavender and baskets, and a raised bed nook with a straw mattress, heavy woollen blankets and a patchwork quilt.
//
// The room is a set of panels (each wall with what stands against it, each slope of the roof, the floor). A panel faces into the room, and while
// the camera is outside it, it isn't drawn, so the room stays open to the camera from any side, above or below.
//
//   const c = Cottage.build(scene); each frame: c.update(camera)
// Units: the characters' (a figure stands about 31 tall). Floor at y 0; the room runs x -54..54 and z -36..44; the chair stands at the middle.
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3, srgb = h => new THREE.Color(h).convertSRGBToLinear();
const lerp = (a, b, t) => a + (b - a) * t;
const X0 = -54, X1 = 54, Z0 = -36, Z1 = 44, EAVE = 40, RIDGE = 80, RZ = (Z0 + Z1) / 2, FOOT = 7;

function canvasTex(w, h, paint, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]);
  return t;
}
const toonMap = (map, side) => new THREE.MeshToonMaterial({ color: 0xffffff, map, gradientMap: T.mat('#ffffff').gradientMap, side: side || THREE.FrontSide });
// A seeded random, so the room is the same every time.
const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// ── Textures ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const TEX = {};
function textures() {
  if (TEX.lime) return TEX;
  // Limewash over daub: warm white, uneven, with faint brush sweeps and the odd patch where it's worn thin.
  TEX.lime = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#f3ede0'; x.fillRect(0, 0, w, h); const r = rnd(7);
    for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(${200 + r() * 30},${185 + r() * 25},${150 + r() * 30},${0.06 + r() * 0.06})`; x.beginPath(); x.ellipse(r() * w, r() * h, 8 + r() * 30, 4 + r() * 14, r() * 3, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(180,160,120,0.08)'; x.lineWidth = 2; for (let i = 0; i < 40; i++) { const y0 = r() * h; x.beginPath(); x.moveTo(r() * w, y0); x.quadraticCurveTo(r() * w, y0 + 10, r() * w, y0 + r() * 6); x.stroke(); }
  }, [3, 2]);
  // Rubble stone for the foundation: rounded grey stones in lime mortar.
  TEX.stone = canvasTex(256, 64, (x, w, h) => {
    x.fillStyle = '#c9c2b2'; x.fillRect(0, 0, w, h); const r = rnd(11);
    for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
      const cx = (i + 0.5 + (row ? 0.5 : 0)) * w / 9 + (r() - 0.5) * 6, cy = (row + 0.5) * h / 2 + (r() - 0.5) * 4, g = 120 + r() * 40;
      x.fillStyle = `rgb(${g + 6},${g + 2},${g - 8})`; x.beginPath(); x.ellipse(cx, cy, 11 + r() * 4, 12 + r() * 3, r(), 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.ellipse(cx - 3, cy - 4, 5, 3, 0, 0, 7); x.fill();
    }
  });
  // Straw thatch, seen from below: bundles running down the slope, golden to dusky.
  // Dressed stone for the fireplace: squared blocks in courses, each a little different, in pale lime mortar; and soot for its inside.
  TEX.ashlar = canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#d6cfbf'; x.fillRect(0, 0, w, h); const r = rnd(23);
    for (let row = 0; row < 4; row++) for (let i = -1; i < 3; i++) {
      const bw = w / 2, x0 = i * bw + (row % 2 ? bw / 2 : 0) + 2, y0 = row * h / 4 + 2, g = 150 + r() * 40;
      x.fillStyle = `rgb(${g + 8},${g + 2},${g - 10})`; x.beginPath(); x.roundRect ? x.roundRect(x0, y0, bw - 4, h / 4 - 4, 5) : x.rect(x0, y0, bw - 4, h / 4 - 4); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(x0 + 4, y0 + 3, bw - 16, 3);
    }
  }, [1, 1]);
  TEX.soot = canvasTex(64, 64, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1c1614'); gr.addColorStop(1, '#4a3a30'); x.fillStyle = gr; x.fillRect(0, 0, w, h); const r = rnd(29); for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(r() * w, r() * h, 3, 2); } });
  TEX.thatch = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#a8864a'; x.fillRect(0, 0, w, h); const r = rnd(5);
    for (let i = 0; i < 900; i++) { const c = ['#c9a65e', '#b8914c', '#8e6c38', '#d8bc76'][i % 4], px = r() * w, py = r() * h; x.strokeStyle = c; x.globalAlpha = 0.55; x.lineWidth = 1 + r() * 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 3, py + 14 + r() * 18); x.stroke(); }
    x.globalAlpha = 1; x.fillStyle = 'rgba(90,60,30,0.25)'; for (let k = 0; k < 4; k++) x.fillRect(0, k * 64 + 60, w, 3);      // (the courses)
  }, [5, 4]);
  // Floor: wide worn elm boards.
  TEX.boards = canvasTex(256, 256, (x, w, h) => {
    const cols = ['#a87a4c', '#9c6e42', '#b2845a', '#a07246'], r = rnd(3);
    for (let i = 0; i < 6; i++) { x.fillStyle = cols[i % 4]; x.fillRect(0, i * 43, w, 43); x.fillStyle = 'rgba(70,40,18,0.13)'; for (let k = 0; k < 7; k++) x.fillRect(r() * w, i * 43 + 5 + k * 5, 30 + r() * 60, 1); }
    x.fillStyle = '#5e3a20'; for (let i = 0; i <= 6; i++) x.fillRect(0, i * 43 - 1, w, 2); for (let i = 0; i < 6; i++) x.fillRect(r() * w, i * 43, 2, 43);
  }, [5, 5]);
  // Oak, for the frame and the furniture: grain along the length.
  TEX.oak = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#7a5232'; x.fillRect(0, 0, w, h); const r = rnd(9); for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '50,30,15' : '140,100,60'},0.18)`; x.fillRect(r() * w, 0, 1 + r() * 2, h); } });
  // Patchwork: squares of every scrap, a running stitch along the seams.
  TEX.quilt = canvasTex(256, 256, (x, w, h) => {
    const cols = ['#b5473a', '#d9a441', '#5b7f4a', '#3f5e8a', '#e8dcc0', '#8a4a6a', '#c97b45', '#6a8fa0', '#a8a050', '#e0b8a0'], r = rnd(13), n = 8, s = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(r() * cols.length)]; x.fillRect(i * s, j * s, s, s); if (r() < 0.35) { x.fillStyle = 'rgba(255,255,255,0.25)'; for (let k = 0; k < 3; k++) x.fillRect(i * s + 4, j * s + 6 + k * 9, s - 8, 3); } if (r() < 0.25) { x.fillStyle = 'rgba(0,0,0,0.15)'; x.beginPath(); x.arc(i * s + s / 2, j * s + s / 2, 6, 0, 7); x.fill(); } }
    x.strokeStyle = 'rgba(245,235,210,0.85)'; x.setLineDash([3, 3]); x.lineWidth = 1.2; for (let k = 0; k <= n; k++) { x.beginPath(); x.moveTo(k * s + 1, 0); x.lineTo(k * s + 1, h); x.stroke(); x.beginPath(); x.moveTo(0, k * s + 1); x.lineTo(w, k * s + 1); x.stroke(); }
  });
  // Heavy wool: a heathered weave.
  TEX.wool = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#5e5a3e'; x.fillRect(0, 0, w, h); const r = rnd(17); for (let i = 0; i < 400; i++) { x.fillStyle = ['#6e6a48', '#4e4a32', '#77704c'][i % 3]; x.fillRect(r() * w, r() * h, 2, 1); } x.fillStyle = 'rgba(160,60,40,0.5)'; x.fillRect(0, 54, w, 3); x.fillRect(0, 59, w, 2); }, [3, 3]);
  // Mattress ticking: straw-coloured linen with a faded stripe.
  TEX.ticking = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#e4d6ae'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(120,110,80,0.35)'; for (let i = 0; i < w; i += 8) x.fillRect(i, 0, 2, h); }, [4, 4]);
  // Wicker for the baskets.
  TEX.wicker = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#b08850'; x.fillRect(0, 0, w, h); for (let j = 0; j < h; j += 6) for (let i = 0; i < w; i += 8) { x.fillStyle = (i / 8 + j / 6) % 2 ? '#c99e60' : '#8e6a38'; x.fillRect(i, j, 8, 5); } }, [3, 1]);
  // Planked door, and the sky through the window.
  TEX.door = canvasTex(128, 256, (x, w, h) => { const cols = ['#6e4a2c', '#7a5434', '#664428']; for (let i = 0; i < 4; i++) { x.fillStyle = cols[i % 3]; x.fillRect(i * 32, 0, 32, h); } x.fillStyle = '#3e2614'; for (let i = 1; i < 4; i++) x.fillRect(i * 32 - 1, 0, 2, h); });
  TEX.sky = canvasTex(128, 128, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ec4ee'); gr.addColorStop(1, '#d8f0fa'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; for (const [cx, cy, r] of [[30, 30, 14], [46, 26, 18], [62, 32, 12], [96, 48, 10]]) { x.beginPath(); x.ellipse(cx, cy, r * 1.3, r * 0.7, 0, 0, 7); x.fill(); }
    x.fillStyle = '#7ab060'; x.beginPath(); x.ellipse(40, 140, 110, 50, 0, 0, 7); x.fill(); x.fillStyle = '#5e9a4c'; x.beginPath(); x.ellipse(120, 150, 90, 45, 0, 0, 7); x.fill();
  });
  TEX.sky.wrapS = TEX.sky.wrapT = THREE.ClampToEdgeWrapping;
  return TEX;
}

// ── Building blocks ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const INK = T.INKM[0];
// A box with an ink outline (like the chair's).
function box(parent, w, h, d, x, y, z, mat, o) {
  o = o || {};
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof mat === 'string' ? T.mat(mat) : mat); m.position.set(x, y, z);
  if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
  if (o.ink !== 0) m.add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, d + 0.16), INK));
  m.castShadow = o.shadow !== false; m.receiveShadow = true; parent.add(m); return m;
}
// Any shape with an ink outline.
function solid(parent, geo, mat, x, y, z, o) {
  o = o || {};
  const m = new THREE.Mesh(geo, typeof mat === 'string' ? T.mat(mat) : mat); m.position.set(x, y, z);
  if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
  if (o.ink !== 0) m.add(new THREE.Mesh(T.hullGeo(geo, o.ink || 0.12), INK));
  m.castShadow = o.shadow !== false; m.receiveShadow = true; parent.add(m); return m;
}
// A slab with softly rounded corners and edges (a mattress, a quilt, a table top): w across x, h thick, d across z; its top at y + h/2.
function slab(w, h, d, r, bevel) {
  const s = new THREE.Shape(), x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2; r = Math.min(r, w / 2, d / 2);
  s.moveTo(x0 + r, z0); s.lineTo(x1 - r, z0); s.quadraticCurveTo(x1, z0, x1, z0 + r); s.lineTo(x1, z1 - r); s.quadraticCurveTo(x1, z1, x1 - r, z1);
  s.lineTo(x0 + r, z1); s.quadraticCurveTo(x0, z1, x0, z1 - r); s.lineTo(x0, z0 + r); s.quadraticCurveTo(x0, z0, x0 + r, z0);
  const b = Math.min(bevel == null ? h * 0.35 : bevel, h / 2 - 0.01), g = new THREE.ExtrudeGeometry(s, { depth: h - 2 * b, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(h - 2 * b) / 2); g.rotateX(Math.PI / 2); g.computeVertexNormals(); return g;
}
// A round pole from a to b.
function pole(parent, a, b, r, mat, o) {
  const d = b.clone().sub(a), g = new THREE.CylinderGeometry(r, r * ((o && o.taper) || 1), d.length(), 8);
  const m = solid(parent, g, mat, 0, 0, 0, Object.assign({ ink: 0.1 }, o)); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); return m;
}

// ── The room ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function build(scene) {
  const tx = textures(), root_ = new THREE.Group(); scene.add(root_);
  const oak = toonMap(tx.oak), oakDk = T.mat('#4e3420'), lime = toonMap(tx.lime), stone = toonMap(tx.stone);
  const panels = [];
  // What can be used and moved, for js/play.js: the door, the chest, the things that can be carried, the pegs, the places to sit, what's in the way.
  const world = { items: [], pegs: [], seats: [], surfaces: [], obstacles: [], door: null, chest: null };
  // A panel: a group, a point on it, and the way into the room from it.
  // A piece of furniture: its own group on a wall's panel, hidden (with what's on it) while the camera is inside it or within a few units of it,
  // so it never fills the view.
  const pieces = [], sub = parent => { const s = new THREE.Group(); parent.add(s); pieces.push(s); return s; };
  const panel = (p, n) => { const g = new THREE.Group(); root_.add(g); panels.push({ g, p, n: n.normalize() }); return g; };

  // ── Floor and rug.
  const floorG = panel(new V3(0, 0, 0), new V3(0, 1, 0));
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), toonMap(tx.boards)); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, RZ); f.receiveShadow = true; floorG.add(f); }
  { const rug = canvasTex(256, 256, (x, w, h) => {
      const ring = (r, c) => { x.fillStyle = c; x.beginPath(); x.ellipse(w / 2, h / 2, r, r, 0, 0, 7); x.fill(); };
      ring(127, '#7a2e2a'); ring(118, '#e0b860'); ring(110, '#9a3a30'); ring(80, '#c46a40'); ring(72, '#9a3a30'); ring(40, '#e0b860'); ring(34, '#7a2e2a');
      x.fillStyle = '#e0b860'; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; x.beginPath(); x.ellipse(w / 2 + Math.cos(a) * 95, h / 2 + Math.sin(a) * 95, 6, 6, 0, 0, 7); x.fill(); } });
    rug.wrapS = rug.wrapT = THREE.ClampToEdgeWrapping;
    const rm = new THREE.Mesh(new THREE.CircleGeometry(24, 48), toonMap(rug)); rm.rotation.x = -Math.PI / 2; rm.position.set(-1, 0.05, 4); rm.receiveShadow = true; floorG.add(rm); }

  // ── The walls: limewashed daub on the inner face; the stone foundation along the bottom; the oak frame (sill on the stones, posts, a rail at mid
  // height, braces, the wall plate at the eaves). The two end walls rise to a gable under the ridge.
  const walls = {
    back: { a: new V3(X1, 0, Z0), b: new V3(X0, 0, Z0), n: new V3(0, 0, 1) },
    front: { a: new V3(X0, 0, Z1), b: new V3(X1, 0, Z1), n: new V3(0, 0, -1) },
    left: { a: new V3(X0, 0, Z0), b: new V3(X0, 0, Z1), n: new V3(1, 0, 0), gable: true },
    right: { a: new V3(X1, 0, Z1), b: new V3(X1, 0, Z0), n: new V3(-1, 0, 0), gable: true },
  };
  const W = {};
  for (const k in walls) {
    const w = walls[k], g = W[k] = panel(w.a.clone().lerp(w.b, 0.5), w.n.clone()), len = w.a.distanceTo(w.b), ry = Math.atan2(w.n.x, w.n.z);
    // In the wall's own frame: x along it (from a to b, seen from inside), y up, z into the room.
    const f = new THREE.Group(); f.position.copy(w.a.clone().lerp(w.b, 0.5)); f.rotation.y = ry; g.add(f); w.f = f; w.len = len;
    const top = w.gable ? null : EAVE;
    // The daub: a plane (with the gable's triangle above it).
    const s = new THREE.Shape(); s.moveTo(-len / 2, FOOT); s.lineTo(len / 2, FOOT); s.lineTo(len / 2, EAVE);
    if (w.gable) s.lineTo(0, RIDGE + 0.5); s.lineTo(-len / 2, EAVE); s.lineTo(-len / 2, FOOT);
    const sg = new THREE.ShapeGeometry(s); { const uv = sg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 40, uv.getY(i) / 40); }
    const daub = new THREE.Mesh(sg, lime); daub.receiveShadow = true; f.add(daub);
    // The foundation: a low course of stones standing a little proud of the wall, inside.
    const fs = new THREE.Mesh(new THREE.BoxGeometry(len, FOOT, 2.4), stone); fs.position.set(0, FOOT / 2, 1.2); fs.receiveShadow = true;
    { const uv = fs.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 30, uv.getY(i)); tx.stone.wrapS = THREE.RepeatWrapping; } f.add(fs);
    // The frame.
    box(f, len, 1.8, 1.4, 0, FOOT + 0.9, 0.7, oak, { shadow: false });                                           // the sill beam
    box(f, len, 2.0, 1.6, 0, EAVE - 1.0, 0.8, oak, { shadow: false });                                           // the wall plate
    box(f, len, 1.2, 1.0, 0, 24, 0.5, oak, { shadow: false });                                                   // a rail at mid height
    const posts = [-len / 2 + 0.9, len / 2 - 0.9]; for (let p = -len / 2 + 18; p < len / 2 - 10; p += 18) posts.push(p);
    for (const p of posts) box(f, 1.8, EAVE - FOOT, 1.4, p, (EAVE + FOOT) / 2, 0.7, oak, { shadow: false });
    // Braces from the corner posts up to the plate.
    for (const sx of [-1, 1]) {
      const x0 = sx * (len / 2 - 1.8), x1 = sx * (len / 2 - 12), y0 = EAVE - 16, y1 = EAVE - 2;
      const br = box(f, Math.hypot(x1 - x0, y1 - y0), 1.4, 1.1, (x0 + x1) / 2, (y0 + y1) / 2, 0.6, oak, { shadow: false }); br.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    }
    if (w.gable) {
      // Gable: a king post and a collar under the ridge.
      box(f, 1.6, RIDGE - EAVE - 2, 1.2, 0, (RIDGE + EAVE) / 2 - 1, 0.6, oak, { shadow: false });
      box(f, len * 0.5, 1.4, 1.2, 0, EAVE + (RIDGE - EAVE) * 0.5, 0.6, oak, { shadow: false });
    }
  }

  // ── The window (right wall, over the table): sky beyond, a timber frame, shutters open against the wall, a deep sill.
  { const f = walls.right.f, win = new THREE.Group(); win.position.set(4, 27, 0.05); f.add(win);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshBasicMaterial({ map: tx.sky })); sky.position.z = 0.02; win.add(sky);
    for (const [w, h, x, y] of [[16, 1.4, 0, 6.6], [16, 1.4, 0, -6.6], [1.4, 14.6, -7.6, 0], [1.4, 14.6, 7.6, 0], [0.8, 12, 0, 0]]) box(win, w, h, 1.4, x, y, 0.7, oak, { shadow: false });
    box(win, 18, 1, 3.2, 0, -7.6, 1.6, oak, { shadow: false });
    for (const sx of [-1, 1]) { const sh = box(win, 7, 12, 0.6, sx * 11.6, 0, 0.4, toonMap(tx.door), { shadow: false }); box(sh, 6, 0.8, 0.5, 0, 3.5, 0.4, oakDk); box(sh, 6, 0.8, 0.5, 0, -3.5, 0.4, oakDk); }
    // A shaft of sunlight from it across the floor.
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(14, 30), new THREE.MeshBasicMaterial({ color: srgb('#fff2c8'), transparent: true, opacity: 0.14, depthWrite: false }));
    shaft.rotation.x = -Math.PI / 2; shaft.rotation.z = 0.5; shaft.position.set(32, 0.1, -4); floorG.add(shaft); }

  // ── The door (left wall, near the front): planked, with a ledge and brace, strap hinges and a latch.
  { const f = walls.left.f, d = new THREE.Group(); d.position.set(-27, FOOT, 0.2); f.add(d);      // (in the wall's frame x runs from back to front, so this is near the front)
    const hinge = new THREE.Group(); hinge.position.set(-6.5, 0, 0); d.add(hinge);      // (it swings into the room on its hinges, at the back edge)
    const leaf = box(hinge, 13, 28, 1.2, 6.5, 14, 0.6, toonMap(tx.door), { shadow: false });
    for (const y of [-9, 9]) { box(leaf, 12, 1.6, 0.8, 0, y, 0.9, oak); box(leaf, 9, 0.6, 0.4, -1.5, y + 1.6, 1.0, '#3a3634'); }
    box(leaf, 1.2, 17, 0.8, 0, 0, 0.9, oak, { rot: [0, 0, 0.62] });
    solid(leaf, new THREE.TorusGeometry(0.9, 0.18, 6, 12), '#3a3634', 4.6, 0, 1.2, { ink: 0.05 });
    const latch = new THREE.Object3D(); latch.position.set(4.6, 0, 1.6); leaf.add(latch);
    world.door = { pivot: hinge, latch, open: 0, target: 0, swing: -1.75, name: 'the door' };
    box(d, 15.6, 1.6, 1.6, 0, 28.8, 0.8, oak, { shadow: false }); for (const sx of [-1, 1]) box(d, 1.4, 29, 1.6, sx * 7.4, 14, 0.8, oak, { shadow: false });
    box(d, 16, 1.2, 3, 0, 0.6, 1.5, stone, { shadow: false }); }      // (the stone threshold)

  // ── The roof: two slopes of thatch from the ridge to the eaves (over the walls), on rafters, with a ridge beam, purlins and two tie beams.
  const slope = sideZ => {
    const zE = sideZ > 0 ? Z1 + 8 : Z0 - 8, yE = EAVE - 4, a = new V3(0, RIDGE, RZ), e = new V3(0, yE, zE);
    const n = new V3(0, zE - RZ, -(yE - RIDGE)).normalize(); if (n.y > 0) n.negate();      // (the way into the room, down from the slope)
    const g = panel(new V3(0, (RIDGE + yE) / 2, (RZ + zE) / 2), n.clone());
    const len = a.distanceTo(e);
    const th = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 + 16, len), toonMap(tx.thatch, THREE.DoubleSide));
    th.position.copy(a.clone().lerp(e, 0.5)); th.lookAt(th.position.clone().add(n)); th.receiveShadow = true; g.add(th);      // (facing into the room)
    // Rafters, each a pole from the ridge down to the eaves, a little under the thatch; purlins along the slope.
    const off = n.clone().multiplyScalar(1.2);
    for (let x = X0 + 2; x <= X1 - 2; x += 12) pole(g, a.clone().setX(x).add(off), e.clone().setX(x).add(off), 0.75, oak, { shadow: false });
    for (const t of [0.33, 0.66]) { const p = a.clone().lerp(e, t).add(off.clone().multiplyScalar(2.2)); pole(g, p.clone().setX(X0), p.clone().setX(X1), 0.65, oak, { shadow: false }); }
    return g;
  };
  const roofF = slope(1), roofB = slope(-1);
  pole(roofB, new V3(X0, RIDGE - 1.5, RZ), new V3(X1, RIDGE - 1.5, RZ), 1.0, oak, { shadow: false });                   // the ridge beam
  for (const x of [-30, 30]) box(roofB, 2, 2.2, Z1 - Z0, x, EAVE - 1, RZ, oak, { shadow: false });                     // tie beams, across the room

  // ── The bed nook (back left): a raised platform boxed in at the foot, posts and a canopy rail, a curtain tied back; on it a straw mattress in
  // ticking, a heavy woollen blanket hanging over the side, a patchwork quilt turned down, and a bolster.
  { const g = sub(W.back), bx = X0 + 16, bz = Z0 + 12, BW = 31, BD = 23, BH = 9;      // (centre and size of the platform)
    box(g, BW, 1.6, BD, bx, BH - 0.8, bz, oak);                                                                        // the platform's boards
    box(g, BW, BH - 1.6, 1.6, bx, (BH - 1.6) / 2, bz + BD / 2 - 0.8, oak);                                             // its front, boxed in
    box(g, 1.6, BH - 1.6, BD, bx + BW / 2 - 0.8, (BH - 1.6) / 2, bz, oak);
    box(g, 1.8, 15, BD, bx + BW / 2 - 0.9, BH + 6, bz, oak);                                                          // the footboard
    for (const [x, z] of [[bx + BW / 2 - 0.9, bz + BD / 2 - 0.9]]) box(g, 2, 36, 2, x, 18, z, oak);                   // the nook's post
    box(g, BW, 2, 2, bx, 35, bz + BD / 2 - 0.9, oak); box(g, 2, 2, BD, bx + BW / 2 - 0.9, 35, bz, oak);                 // the canopy rails
    box(g, BW + 2, 0.8, BD + 2, bx, 36.4, bz, oak);                                                                    // the tester boards over it
    // The curtain, gathered and tied back to the post.
    const cur = T.mat('#7a4a5e'); solid(g, new THREE.CylinderGeometry(1.4, 3.2, 30, 10, 1, true), cur, bx + BW / 2 - 3.2, 19.5, bz + BD / 2 - 1.5, { ink: 0.1 });
    solid(g, new THREE.TorusGeometry(2.1, 0.35, 6, 14), '#d9b25a', bx + BW / 2 - 3.2, 19, bz + BD / 2 - 1.5, { rot: [Math.PI / 2, 0, 0], ink: 0.05 });
    // The mattress (straw-stuffed, soft at the edges), the blanket, the quilt turned down at the head, the bolster.
    const ticking = toonMap(tx.ticking); tx.ticking.repeat.set(0.2, 0.2);
    solid(g, slab(BW - 4, 4.4, BD - 3, 2.5, 1.8), ticking, bx - 1, BH + 2.2, bz - 0.5, { ink: 0.12 });
    const wool = toonMap(tx.wool); tx.wool.repeat.set(0.12, 0.12);
    solid(g, slab(BW - 7, 1.4, BD - 1, 1.2, 0.6), wool, bx + 1.5, BH + 5, bz + 0.5, { ink: 0.1 });
    { const drape = new THREE.Mesh(new THREE.BoxGeometry(BW - 7, 6, 0.7), wool); drape.position.set(bx + 1.5, BH + 2.4, bz + BD / 2 - 0.2); drape.add(new THREE.Mesh(new THREE.BoxGeometry(BW - 6.8, 6.2, 0.9), INK)); g.add(drape); }
    const quilt = toonMap(tx.quilt); tx.quilt.repeat.set(1 / 20, 1 / 20);
    solid(g, slab(BW - 11, 1.2, BD + 0.5, 1, 0.5), quilt, bx + 3.5, BH + 6.1, bz + 0.6, { ink: 0.1 });
    solid(g, slab(5, 1.6, BD - 1, 1, 0.7), quilt, bx - BW / 2 + 9, BH + 6.6, bz + 0.6, { ink: 0.1, rot: [0, 0, 0.2] });   // (turned down)
    solid(g, T.ell(2.2, 1.8, BD / 2 - 2.5, 16, 10), T.mat('#efe6d0'), bx - BW / 2 + 4, BH + 6.4, bz - 0.5, { ink: 0.1 });   // the bolster
    world.seats.push({ name: 'the bed', at: new V3(bx - 2, BH + 5.6, bz + BD / 2 - 3), facing: 0, kind: 'bed', head: new V3(bx - BW / 2 + 4, BH + 6.2, bz - 0.5), feet: new V3(bx + BW / 2 - 4, BH + 6, bz - 0.5) });
    world.obstacles.push({ x0: X0, x1: bx + BW / 2, z0: Z0, z1: bz + BD / 2 });
  }

  // ── The chest (against the back wall, right): oak, iron-bound, with a gently domed lid and a lock plate.
  { const g = sub(W.back), cx = 26, cz = Z0 + 6.5, cw = 20, ch = 10, cd = 9;
    // (an open box, sides and a bottom, so there's room inside: folded linen and a blanket)
    box(g, cw, 1, cd, cx, 1.1, cz, oak); for (const sz of [-1, 1]) box(g, cw, ch, 0.9, cx, ch / 2 + 0.6, cz + sz * (cd / 2 - 0.45), oak); for (const sx of [-1, 1]) box(g, 0.9, ch, cd - 1.8, cx + sx * (cw / 2 - 0.45), ch / 2 + 0.6, cz, oak);
    solid(g, slab(cw - 3, 4, cd - 3, 1, 0.8), T.mat('#e8e0cc'), cx - 3, 4.6, cz, { ink: 0.08 }); solid(g, slab(8, 3, cd - 3, 1, 0.8), toonMap(tx.wool), cx + 5, 7.6, cz, { ink: 0.08 });
    const lidPivot = new THREE.Group(); lidPivot.position.set(cx, ch + 0.6, cz - cd / 2); g.add(lidPivot);      // (hinged along the back)
    const lid = new THREE.CylinderGeometry(cd / 2, cd / 2, cw, 18, 1, false, 0, Math.PI); lid.rotateZ(Math.PI / 2); lid.rotateX(-Math.PI / 2); lid.scale(1, 0.45, 1);
    solid(lidPivot, lid, oak, 0, 0, cd / 2, { ink: 0.12 });
    box(lidPivot, cw + 0.2, 0.8, cd + 0.2, 0, 0, cd / 2, oak);
    for (const x of [-cw / 2 + 2.5, cw / 2 - 2.5]) box(lidPivot, 1.2, 1.2, cd + 0.4, x, 0.5, cd / 2, '#3a3634');
    const grip = new THREE.Object3D(); grip.position.set(0, 0.2, cd + 0.3); lidPivot.add(grip);
    world.chest = { pivot: lidPivot, grip, open: 0, target: 0, swing: -1.7, name: 'the chest', front: new V3(cx, 0, cz + cd / 2), top: ch + 0.6 + cd / 2 * 0.45 };
    world.obstacles.push({ x0: cx - cw / 2, x1: cx + cw / 2, z0: Z0, z1: cz + cd / 2 });
    world.surfaces.push({ name: 'the chest', x0: cx - cw / 2 + 2, x1: cx + cw / 2 - 2, z0: cz - 1, z1: cz + 1, y: ch + 0.6 + cd / 2 * 0.45, panel: g, front: new V3(0, 0, 1), when: () => world.chest.open < 0.05 });
    for (const x of [-cw / 2 + 2.5, cw / 2 - 2.5]) for (const sz of [-1, 1]) box(g, 1.2, ch + 0.2, 0.4, cx + x, ch / 2 + 0.6, cz + sz * (cd / 2 + 0.1), '#3a3634');
    box(g, 2.2, 3, 0.4, cx, ch - 0.6, cz + cd / 2 + 0.2, '#3a3634');
    for (const x of [-cw / 2 + 1.2, cw / 2 - 1.2]) for (const z of [-cd / 2 + 1, cd / 2 - 1]) box(g, 1.6, 0.8, 1.6, cx + x, 0.4, cz + z, oakDk);
  }

  // ── The peg rail (back wall, between the bed and the chest): pegs hung with bunches of dried herbs and lavender, and wicker baskets.
  { const g = W.back, y = 27, z = Z0 + 0.9, x0 = -18, x1 = 14;
    box(g, x1 - x0 + 4, 1.6, 1.2, (x0 + x1) / 2, y, z, oak);
    const twine = T.mat('#c8b080'), stems = ['#6e7a42', '#8a8a4e', '#5e6a3a'], leaves = ['#7a8a4a', '#9a9a5a', '#6a7a40'];
    let i = 0;
    for (let x = x0; x <= x1; x += 4, i++) {
      solid(g, new THREE.CylinderGeometry(0.4, 0.5, 2.4, 8), oakDk, x, y, z + 1.6, { rot: [Math.PI / 2 - 0.25, 0, 0], ink: 0.06 });
      const hang = new THREE.Group(); hang.position.set(x, y - 0.4, z + 2.6); g.add(hang);
      pole(hang, new V3(0, 0, 0), new V3(0, -2.4, 0), 0.08, twine, { ink: 0 });
      const kind = ['herb', 'lavender', 'basket', 'herb', 'lavender', 'herb', 'basket', 'lavender', 'herb'][i % 9];
      const peg = { at: new V3(x, y - 0.4 - 2.4, z + 2.6), item: null, panel: g };      // (where a thing hangs from: the end of the twine)
      if (kind === 'basket') {
        // A basket is a thing to carry: its own group, its origin at the middle of its base, so it can be set down on anything.
        const it = new THREE.Group(), bk = toonMap(tx.wicker), bowl = new THREE.LatheGeometry([[0.01, 0], [2.4, 0.2], [3.0, 1.4], [3.2, 3.2], [3.3, 3.4]].map(([r, h]) => new THREE.Vector2(r, h)), 16);
        solid(it, bowl, bk, 0, 0, 0, { ink: 0.1 }).material.side = THREE.DoubleSide;
        solid(it, new THREE.TorusGeometry(3.1, 0.25, 6, 16, Math.PI), bk, 0, 3.4, 0, { ink: 0.06 });
        const item = { obj: it, name: 'a basket', grip: new V3(0, 6.5, 0), hangs: true, radius: 3.4, panel: g };
        peg.item = item; item.peg = peg; it.position.copy(peg.at).sub(item.grip); root_.add(it); world.items.push(item);
      } else {
        // A bunch hung head down: stems tied at the top, opening out below into leaves (or flower heads).
        const r = rnd(31 + i), n = 7;
        for (let s = 0; s < n; s++) {
          const a = s / n * Math.PI * 2 + r(), sp = 0.9 + r() * 0.6, tip = new V3(Math.cos(a) * sp, -8.5 - r() * 1.6, Math.sin(a) * sp);
          pole(hang, new V3(0, -2.4, 0), tip, 0.12, stems[s % 3], { ink: 0 });
          if (kind === 'lavender') solid(hang, T.ell(0.45, 1.5, 0.45, 8, 6), ['#8a6ac0', '#7a58b0', '#9a7ad0'][s % 3], tip.x, tip.y - 0.8, tip.z, { ink: 0.05 });
          else solid(hang, T.ell(0.9, 1.4, 0.6, 8, 6), leaves[s % 3], tip.x * 1.1, tip.y + 0.6, tip.z * 1.1, { ink: 0.05, rot: [r(), a, 0.4] });
        }
        solid(hang, new THREE.CylinderGeometry(0.5, 0.5, 0.8, 8), twine, 0, -3.0, 0, { ink: 0.04 });
        peg.item = { fixed: true };
      }
      world.pegs.push(peg);
    }
  }

  // ── The trestle table (along the right wall, under the window), and two low stools beside it.
  { const g = sub(W.right), tx_ = 38, tz = 2, L = 36, D = 13, H = 15;
    solid(g, slab(D, 1.6, L, 0.6, 0.3), oak, tx_, H - 0.8, tz, { ink: 0.12 });
    for (const z of [tz - L / 2 + 5, tz + L / 2 - 5]) {
      for (const sx of [-1, 1]) pole(g, new V3(tx_ + sx * 1.0, H - 1.6, z), new V3(tx_ + sx * 5.2, 0, z), 0.7, oak, { taper: 1.1 });   // the trestle's splayed legs
      box(g, D - 1, 1.2, 1.4, tx_, H - 2.2, z, oak); box(g, 9.5, 1, 1.2, tx_, 4.5, z, oak);                                           // the head, and a cross bar
    }
    box(g, 1.4, 1.6, L - 9, tx_, 6, tz, oak);                                                                                        // the stretcher, through both
    // On the table: a jug, a bowl, and a loaf.
    // (each a thing that can be carried: a group with its origin at the middle of its base)
    const thing = (name, build, x, z, grip, radius, ry) => { const it = new THREE.Group(); build(it); it.position.set(x, H, z); it.rotation.y = ry || 0; root_.add(it); const item = { obj: it, name, grip, radius, panel: g }; world.items.push(item); return item; };
    thing('the jug', it => { solid(it, new THREE.LatheGeometry([[0.01, 0], [1.6, 0.1], [1.9, 2], [1.3, 3.8], [1.0, 4.4], [1.3, 4.9]].map(([r, h]) => new THREE.Vector2(r, h)), 16), '#a85a3a', 0, 0, 0, { ink: 0.08 });
      solid(it, new THREE.TorusGeometry(1.1, 0.25, 6, 12, Math.PI * 1.2), '#a85a3a', 1.5, 3.2, 0, { rot: [0, 0, -1.2], ink: 0.05 }); }, tx_ - 2, tz - 8, new V3(0, 2.6, 0), 2, 0.6);
    thing('the bowl', it => { solid(it, new THREE.LatheGeometry([[0.01, 0], [2.2, 0.2], [3.2, 1.6], [3.4, 1.9]].map(([r, h]) => new THREE.Vector2(r, h)), 18), '#8a6a4a', 0, 0, 0, { ink: 0.08 }).material.side = THREE.DoubleSide; }, tx_ + 1, tz + 3, new V3(0, 1.6, 0), 3.4);
    thing('the loaf', it => { solid(it, T.ell(2.6, 1.6, 3.6, 14, 10), '#c98a44', 0, 1.6, 0, { ink: 0.08 }); for (const k of [-1, 0, 1]) solid(it, new THREE.BoxGeometry(2.4, 0.2, 0.25), '#e6c58a', 0, 2.95, k * 1.4, { rot: [0.1, 0, 0], ink: 0 }); }, tx_ + 1, tz + 13, new V3(0, 1.8, 0), 3.4, 0.2);
    world.surfaces.push({ name: 'the table', x0: tx_ - D / 2 + 2, x1: tx_ + D / 2 - 2, z0: tz - L / 2 + 2, z1: tz + L / 2 - 2, y: H, panel: g, front: new V3(-1, 0, 0) });
    world.obstacles.push({ x0: tx_ - D / 2 - 0.5, x1: tx_ + D / 2 + 0.5, z0: tz - L / 2, z1: tz + L / 2 });
    // (stools to sit at the table: their tops at SH, so a grown woman sits with the table at a height to eat from; a ring round the legs at RH,
    // to rest the feet on for anyone whose feet don't reach the floor)
    const SH = 9, RH = 3.6, legR = y => lerp(3.4, 2.2, y / (SH - 1.2)), stool = (x, z, ry) => {
      const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s);
      solid(s, new THREE.CylinderGeometry(3.6, 3.6, 1.4, 18), oak, 0, SH - 0.7, 0, { ink: 0.1 });
      for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; pole(s, new V3(Math.cos(a) * 2.2, SH - 1.2, Math.sin(a) * 2.2), new V3(Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4), 0.5, oak); }
      solid(s, new THREE.TorusGeometry(legR(RH), 0.32, 6, 24), oak, 0, RH, 0, { rot: [Math.PI / 2, 0, 0], ink: 0.06 });      // the foot ring
    };
    stool(tx_ - 12, tz - 9, 0.3); stool(tx_ - 11, tz + 11, 1.1);
    for (const [x, z] of [[tx_ - 12, tz - 9], [tx_ - 11, tz + 11]]) { world.seats.push({ name: 'the stool', rung: RH, rungR: legR(RH), at: new V3(x, SH, z), facing: -Math.PI / 2, kind: 'stool' }); world.obstacles.push({ x, z, r: 3.8 }); }
  }

  // ── The hearth (the front wall, across the room from the peg rail): a stone fireplace on a raised hearthstone, its opening under an oak lintel,
  // the chimney breast rising into the thatch; a log fire on iron fire-dogs, with an iron pot on a swinging crane over it, a kettle and the fire
  // irons on the hearth, and logs stacked beside it. The fire flickers (its flames, the embers, and the warm light it throws across the room).
  const fire = { flames: [], light: null, embers: null, t: 0 };
  { const g = sub(W.front), cx = -2, zb = Z1 - 2.6, D = 8, zf = zb - D, OW = 18, OH = 16, JW = 5;      // (zb: its back, in front of the foundation course)
    const ashlar = toonMap(tx.ashlar), soot = toonMap(tx.soot), iron = T.mat('#2e2a28'), bark = T.mat('#5a3e26');
    box(g, OW + 2 * JW + 6, 1.4, D + 9.6, cx, 0.7, Z1 - (D + 9.6) / 2, ashlar);                                // the hearthstone, raised a little
    for (const sx of [-1, 1]) box(g, JW, OH, D, cx + sx * (OW + JW) / 2, 1.4 + OH / 2, zb - D / 2, ashlar);    // the jambs
    box(g, OW, OH, 1.2, cx, 1.4 + OH / 2, zb - 0.6, soot, { ink: 0 });                                         // the fireback, sooted
    for (const sx of [-1, 1]) box(g, 0.6, OH, D - 1.4, cx + sx * (OW / 2 - 0.3), 1.4 + OH / 2, zb - D / 2 - 0.5, soot, { ink: 0 });
    box(g, OW, 0.6, D - 1.2, cx, 1.4 + OH - 0.3, zb - D / 2 - 0.4, soot, { ink: 0 });                          // and its roof
    box(g, OW + 2 * JW + 3, 2.8, 2.6, cx, 1.4 + OH + 1.4, zf + 0.6, toonMap(tx.oak));                            // the oak lintel
    // The breast above: stone, stepping in to the stack, up into the thatch.
    box(g, OW + 2 * JW + 1, 14, D - 1, cx, 1.4 + OH + 2.8 + 7, zb - (D - 1) / 2, ashlar);
    box(g, OW + 2 * JW + 6, 1.2, 3.4, cx, 1.4 + OH + 2.8 + 4.5, zf - 0.3, toonMap(tx.oak));                      // a mantel shelf
    { const t = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2 * 1.55, 1, 4, 1).rotateY(Math.PI / 4); t.scale(18, 12, 6.6); solid(g, t, ashlar, cx, 1.4 + OH + 2.8 + 14 + 6, zb - 3.6, { ink: 0.12 }); }
    box(g, 13, 26, 5.8, cx, 1.4 + OH + 2.8 + 14 + 12 + 13, zb - 3.2, ashlar);
    // On the mantel: a candlestick, a little jug and a pewter plate stood on edge.
    { const my = 1.4 + OH + 2.8 + 4.5 + 0.6;
      solid(g, new THREE.CylinderGeometry(0.5, 0.8, 1.2, 10), '#b89a5a', cx - 9, my + 0.6, zf - 0.2, { ink: 0.05 }); solid(g, new THREE.CylinderGeometry(0.35, 0.35, 2.4, 8), '#f2ead6', cx - 9, my + 2.4, zf - 0.2, { ink: 0.05 });
      solid(g, new THREE.LatheGeometry([[0.01, 0], [0.9, 0.1], [1.1, 1], [0.7, 1.9], [0.85, 2.3]].map(([r, h]) => new THREE.Vector2(r, h)), 12), '#6a8a9a', cx + 8, my, zf - 0.2, { ink: 0.05 });
      solid(g, new THREE.CylinderGeometry(2.2, 2.2, 0.3, 18), '#a9aeb2', cx + 3, my + 2.2, zb - D + 1.2, { rot: [Math.PI / 2 - 0.15, 0, 0], ink: 0.05 }); }
    // The fire: two fire-dogs, logs across them, a bed of embers, and the flames.
    const fy = 1.4, fz = zb - D / 2 - 0.6;
    for (const sx of [-1, 1]) { box(g, 0.6, 0.6, 6, cx + sx * 4, fy + 1.2, fz, iron); box(g, 0.6, 3, 0.6, cx + sx * 4, fy + 1.8, fz - 3, iron); }
    for (const [x, y, z, ry, L] of [[0, 2.3, -0.6, 0.15, 11], [0.5, 2.3, 1.2, -0.1, 10], [-0.5, 3.4, 0.3, 0.6, 9]]) {
      const lg = solid(g, new THREE.CylinderGeometry(0.85, 0.95, L, 10), bark, cx + x, fy + y, fz + z, { rot: [0, ry, Math.PI / 2], ink: 0.06 });
      for (const e of [-1, 1]) solid(lg, new THREE.CircleGeometry(0.85, 10), '#c98a4a', 0, e * L / 2, 0, { rot: [e * -Math.PI / 2, 0, 0], ink: 0 });
    }
    fire.embers = new THREE.Mesh(T.ell(4.2, 0.45, 2.2, 16, 8), new THREE.MeshBasicMaterial({ color: srgb('#e0561e') })); fire.embers.position.set(cx, fy + 0.5, fz); g.add(fire.embers);
    // (each flame a soft teardrop, flat-coloured like the rest: an orange outer, yellow within, pale at the heart)
    const tear = new THREE.LatheGeometry([[0, 0], [0.55, 0.12], [0.62, 0.35], [0.48, 0.65], [0.24, 0.95], [0, 1.3]].map(([r, h]) => new THREE.Vector2(Math.max(0.001, r), h)), 12);
    const fm = c => new THREE.MeshBasicMaterial({ color: srgb(c), transparent: true, opacity: 0.92, depthWrite: false });
    const layers = [['#ff7d24', 1], ['#ffc23a', 0.68], ['#fff1b0', 0.4]];
    for (const [x, z, sz] of [[0, 0, 4.2], [-2.6, 0.4, 3.0], [2.4, -0.3, 3.3], [-1.2, -0.8, 2.4], [1.4, 0.9, 2.2]]) {
      for (const [c, k] of layers) {
        const f = new THREE.Mesh(tear, fm(c)); f.position.set(cx + x, fy + 2.4, fz + z + (1 - k) * 0.4); f.renderOrder = 3 + (1 - k) * 2; g.add(f);
        fire.flames.push({ m: f, sz: sz * k, w: sz * k * 0.75, ph: Math.random() * 6.3, f: 7 + Math.random() * 5, x: cx + x });
      }
    }
    fire.light = new THREE.PointLight(srgb('#ff9a4a'), 1.0, 120, 1.6); fire.light.position.set(cx, fy + 6, fz - 4); root_.add(fire.light);
    // The crane: an iron post at the side of the opening that the arm swings on, a chain, and the pot.
    const px = cx + OW / 2 - 1.2; box(g, 0.6, 14, 0.6, px, fy + 7.5, zb - 2.5, iron);
    box(g, 8.5, 0.6, 0.6, px - 4.2, fy + 13, zb - 3.2, iron, { rot: [0, -0.35, 0] });
    box(g, 0.25, 2.6, 0.25, px - 7.6, fy + 11.6, zb - 4.6, iron, { ink: 0 });
    solid(g, new THREE.LatheGeometry([[0.01, 0], [1.2, 0.25], [1.75, 1.05], [1.75, 1.95], [1.5, 2.4], [1.65, 2.55]].map(([r, h]) => new THREE.Vector2(r, h)), 16), iron, px - 7.6, fy + 7.6, zb - 4.6, { ink: 0.08 }).material.side = THREE.DoubleSide;
    solid(g, new THREE.TorusGeometry(1.55, 0.12, 6, 16, Math.PI), iron, px - 7.6, fy + 10.15, zb - 4.6, { ink: 0 });
    // On the hearth: the kettle, and the fire irons leaning on the jamb.
    { const kx = cx + OW / 2 + JW + 1.2, kz = zf - 2.5;
      solid(g, new THREE.LatheGeometry([[0.01, 0], [1.6, 0.1], [1.9, 1.2], [1.4, 2.4], [0.5, 2.8], [0.6, 3.1]].map(([r, h]) => new THREE.Vector2(r, h)), 16), '#3a3634', kx, 1.4, kz, { ink: 0.07 });
      solid(g, new THREE.TorusGeometry(1.2, 0.12, 6, 14, Math.PI), '#3a3634', kx, 1.4 + 3.0, kz, { ink: 0 });
      solid(g, new THREE.CylinderGeometry(0.2, 0.35, 2.2, 8), '#3a3634', kx + 1.9, 1.4 + 2.0, kz, { rot: [0, 0, -0.9], ink: 0.04 }); }
    for (const [dx, tip] of [[-0.6, 'poker'], [0.6, 'shovel']]) {
      const tx_ = cx - OW / 2 - JW - 1.2 + dx, tz = zf - 0.8, it = new THREE.Group(); it.position.set(tx_, 1.4, tz); it.rotation.set(0.12, 0, dx * 0.1); g.add(it);
      pole(it, new V3(0, 0, 0), new V3(0, 12, 0), 0.18, iron, { ink: 0.04 }); solid(it, new THREE.TorusGeometry(0.6, 0.14, 6, 12), iron, 0, 12.6, 0, { ink: 0 });
      if (tip === 'shovel') box(it, 2.2, 0.2, 2.6, 0, 0.3, 0.4, iron, { rot: [0.25, 0, 0] }); else solid(it, new THREE.ConeGeometry(0.3, 1, 6), iron, 0, -0.2, 0, { rot: [Math.PI, 0, 0], ink: 0 });
    }
    // Logs stacked by the hearth, ends out.
    { const lx = cx + OW / 2 + JW + 8, rows = [[0, 3], [1, 2], [2, 1]];
      for (const [row, n] of rows) for (let i = 0; i < n; i++) { const lg = solid(g, new THREE.CylinderGeometry(1.15, 1.25, 8, 10), bark, lx + (i - (n - 1) / 2) * 2.5, 1.2 + row * 2.1, zb - 5, { rot: [Math.PI / 2, 0, 0], ink: 0.06 });
        solid(lg, new THREE.CircleGeometry(1.15, 10), '#c49a62', 0, 4.01, 0, { rot: [-Math.PI / 2, 0, 0], ink: 0 }); }
      world.obstacles.push({ x0: lx - 4.5, x1: lx + 4.5, z0: zb - 7, z1: Z1 }); }
    world.obstacles.push({ x0: cx - (OW / 2 + JW + 3), x1: cx + (OW / 2 + JW + 3), z0: Z1 - D - 9.6, z1: Z1 });
  }

  // Which panels show: those the camera is inside of.
  const cp = new V3();
  function update(camera) {
    camera.getWorldPosition(cp);
    for (const p of panels) p.g.visible = cp.clone().sub(p.p).dot(p.n) > 2;      // (hidden as the camera comes within a couple of units of it, not only once it's through)
    if (!pieces.boxed) { root_.updateMatrixWorld(true); pieces.boxed = true; }
    for (const f of pieces) { const b = f.userData.box || (f.userData.box = new THREE.Box3().setFromObject(f).expandByScalar(3)); f.visible = !b.containsPoint(cp); }
    // (a thing on a wall's peg or a table goes with that wall, and with that table)
    const shown = o => { for (; o && o !== root_; o = o.parent) if (!o.visible) return false; return true; };
    for (const it of world.items) it.obj.visible = !it.panel || shown(it.panel);
  }
  // The door and the chest's lid swing toward where they're going (0 shut, 1 open), easing.
  function tick(dt) {
    // The fire: each flame stretching and swaying on its own beat, the embers pulsing, the light flickering with them.
    fire.t += dt; const ft = fire.t, flick = 0.5 + 0.25 * Math.sin(ft * 11.3) + 0.15 * Math.sin(ft * 23.7 + 1) + 0.1 * Math.sin(ft * 5.1);
    for (const f of fire.flames) { const k = 1 + 0.22 * Math.sin(ft * f.f + f.ph) + 0.12 * Math.sin(ft * f.f * 2.3 + f.ph * 2); f.m.scale.set(f.w * (1.05 - 0.1 * k), f.sz * k, f.w * (1.05 - 0.1 * k)); f.m.position.x = f.x + 0.25 * Math.sin(ft * f.f * 0.6 + f.ph); f.m.rotation.z = 0.08 * Math.sin(ft * f.f * 0.7 + f.ph); }
    if (fire.light) fire.light.intensity = 0.8 + 0.45 * flick;
    if (fire.embers) fire.embers.material.color.setRGB(0.75 + 0.2 * flick, 0.14 + 0.08 * flick, 0.03);
    for (const o of [world.door, world.chest]) { if (!o) continue; o.open += (o.target - o.open) * (1 - Math.exp(-dt * 5)); const e = o.open; o.pivot.rotation.set(o === world.chest ? o.swing * e : 0, o === world.door ? o.swing * e : 0, 0); }
  }
  world.bounds = { x0: X0 + 2.4, x1: X1 - 2.4, z0: Z0 + 2.4, z1: Z1 - 2.4 };
  return { group: root_, update, tick, world, bounds: { X0, X1, Z0, Z1, EAVE, RIDGE } };
}

root.Cottage = { build };
})(typeof window !== 'undefined' ? window : globalThis);
