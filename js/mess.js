// Little Red’s Lessons — mess on a floor, and sweeping it by hand (js/work.js's shifts). At the bakery: patches of flour on the flags when she
// comes in, ash raked out in front of the oven, flour dust round the table where she sifts; walked through, they leave prints (white or grey)
// across the clean floor, as Jack's muddy boots do (asonichero/consequence). At the inn, no dirt to see: the corners, where Mistress Abney looks.
//
// The broom is taken up and held (js/motion.js's pole hold); held down, the act button sweeps (E or Space, or the touch button: js/hud.js
// keeps P.input.act), clearing what's under its head as she goes.
//
//   const mess = Mess.attach(P, w, { kind: 'bakery' | 'inn', store: () => obj (kept in the save), save() })
//   mess.add(kind, x, z, r) (a patch: 'flour' | 'ash') · mess.dirt() (how much is left, patches and prints) · mess.clean() · mess.sweeping
//   Mess.seed(day, area) → the bakery's flour, on the floor as she finds it
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const COL = { flour: '#ffffff', ash: '#5e5854' };
function hash(day, k) { let h = (day * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519); h ^= h >>> 13; return (h >>> 0) / 4294967296; }

// (the flour on the floor of a morning's baking: four to six patches, here and there across the open floor)
function seed(day) {
  const n = 4 + Math.floor(hash(day, 1) * 3), out = [];
  for (let k = 0; k < n; k++) out.push({ k: 'flour', x: -32 + hash(day, 10 + k) * 64, z: -6 + hash(day, 20 + k) * 34, r: 3 + hash(day, 30 + k) * 3, a: 1 });
  return out;
}

function attach(P, w, o) {
  const m = P.motion, sc = P.rig.scaleW || 1, st = o.store(), scene = P.stage.scene, kind = o.kind;
  st.patches = st.patches || []; st.prints = st.prints || [];
  const mats = {}, mat = (k, a) => { const q = new THREE.MeshBasicMaterial({ color: COL[k], transparent: true, opacity: a, depthWrite: false }); return q; };
  const discs = new Map(), disc = (p, print) => { let g = discs.get(p); if (g) return g;
    const geo = print ? new THREE.CircleGeometry(1, 10).scale(0.7, 1.15, 1) : new THREE.CircleGeometry(1, 18); g = new THREE.Mesh(geo, mat(p.k, 0.8)); g.rotation.x = -Math.PI / 2; g.renderOrder = 2;
    if (print) g.rotation.z = -(p.yaw || 0); g.position.set(p.x, 0.12 + (print ? 0.02 : 0), p.z); scene.add(g); discs.set(p, g); return g; };
  const show = () => { for (const p of st.patches) { const g = disc(p); g.scale.setScalar(p.r * (0.5 + 0.5 * p.a)); g.material.opacity = 0.95 * p.a; g.visible = p.a > 0.03; }
    for (const p of st.prints) { const g = disc(p, true); g.scale.setScalar(sc * 1.1); g.material.opacity = 0.85 * p.a; g.visible = p.a > 0.03; } };
  const add = (k, x, z, r) => { st.patches.push({ k, x, z, r, a: 1 }); show(); o.save(); };
  // (how much is left to sweep: each patch by its size, each print a little)
  const dirt = () => st.patches.reduce((s, p) => s + p.a * p.r * p.r * 0.1, 0) + st.prints.reduce((s, p) => s + p.a * 0.3, 0);
  const clean = () => !st.patches.some(p => p.a > 0.08) && !st.prints.some(p => p.a > 0.15);
  // The inn's corners: swept into, each a moment's work with the broom's head in it.
  const corners = kind === 'inn' ? (o.corners || []).map((c, i) => ({ at: c, i })) : [];
  st.corners = st.corners || {};
  const cornersDone = () => corners.every(c => (st.corners[c.i] || 0) >= 1);
  let dirty = null, stride = 0, foot = 1, last = m.pos.clone(), saveT = 0, changed = false, was = false;
  const api = { add, dirt, clean, cornersDone, get sweeping() { return was; }, get corners() { return corners.map(c => (st.corners[c.i] || 0) >= 1); } };
  const holdingBroom = () => !!(m.carry && m.carry.name === 'the broom');
  P.tick(dt => {
    // (sweeping: the broom in her hands and the act held, nothing else going on)
    const sweeping = holdingBroom() && !!(P.input && P.input.act) && !(P.talk && P.talk.playing);
    if (sweeping !== was) { was = sweeping; m.stroke = sweeping; }
    if (sweeping) {
      const head = m.carry.obj.position;      // (the pole hold sets it at the broom's head, on the floor ahead of her)
      for (const p of st.patches) if (p.a > 0 && Math.hypot(p.x - head.x, p.z - head.z) < p.r + 4 * sc) { p.a = Math.max(0, p.a - dt / 1.1); changed = true; }
      for (const p of st.prints) if (p.a > 0 && Math.hypot(p.x - head.x, p.z - head.z) < 5 * sc) { p.a = Math.max(0, p.a - dt / 0.4); changed = true; }
      for (const c of corners) if ((st.corners[c.i] || 0) < 1 && Math.hypot(c.at.x - head.x, c.at.z - head.z) < 9 * sc) { st.corners[c.i] = Math.min(1, (st.corners[c.i] || 0) + dt / 1.6); changed = true; }
    }
    // (walked through flour or ash: prints, a stride apart, till her boots are clean again)
    if (kind === 'bakery') {
      const under = st.patches.find(p => p.a > 0.25 && Math.hypot(p.x - m.pos.x, p.z - m.pos.z) < p.r * 0.9);
      if (under) dirty = { k: under.k, n: 7 };
      stride += Math.hypot(m.pos.x - last.x, m.pos.z - last.z);
      if (dirty && dirty.n > 0 && stride > 4.4 * sc) { stride = 0; dirty.n--; foot = -foot;
        const side = new V3(Math.cos(m.yaw), 0, -Math.sin(m.yaw)).multiplyScalar(1.4 * sc * foot);
        if (!st.patches.some(p => p.a > 0.25 && Math.hypot(p.x - m.pos.x, p.z - m.pos.z) < p.r)) { st.prints.push({ k: dirty.k, x: m.pos.x + side.x, z: m.pos.z + side.z, yaw: m.yaw, a: dirty.n / 7 * 0.6 + 0.4 }); changed = true;
          if (st.prints.length > 160) st.prints.shift(); } }
      if (stride > 4.4 * sc) stride = 0;
    }
    last.copy(m.pos);
    if (changed) { show(); if ((saveT += dt) > 1) { saveT = 0; changed = false; st.patches = st.patches.filter(p => p.a > 0.02); st.prints = st.prints.filter(p => p.a > 0.02);
      for (const [p, g] of discs) if (!st.patches.includes(p) && !st.prints.includes(p)) { scene.remove(g); discs.delete(p); } o.save(); } }
  });
  show();
  return api;
}

const api = { attach, seed };
root.Mess = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
