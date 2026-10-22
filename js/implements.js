// Little Red’s Lessons — what a corrector takes her in hand with: the hand, or each corrector's own second implement (there's no standard one).
// Which is used, and when, is the story's to say, not the tier's. Each has a model held in the right hand (handle in the fist, the striking
// part beyond along the hand's -y, its striking face along the hand's x, the palm's way: as js/lap.js lays the hand flat on the skin), how far
// from the wrist that face is (at) and how thick it is (half), how fast it marks (mark, against the hand's 1), and how it hurts (js/pain.js has
// the numbers, by the same name).
//
//   Implements.LIST.hairbrush → { name, of, mark, at, half }      Implements.model('hairbrush', palm) → a THREE.Group, for the hand
(function (root) {
'use strict';
const LIST = {
  hand:         { name: 'the hand', mark: 1 },
  hairbrush:    { name: 'the hairbrush', of: 'maren', mark: 2.4, at: 3.4, half: 0.26 },
  bakersPaddle: { name: 'the baker’s paddle', of: 'pennock', mark: 2.7, at: 5.4, half: 0.15 },
  strap:        { name: 'the strap', of: 'smith', mark: 2.5, at: 5.0, half: 0.11 },
  spoon:        { name: 'the wooden spoon', of: 'abney', mark: 1.8, at: 5.2, half: 0.2 },
  slipper:      { name: 'the slipper', of: 'willie', mark: 1.6, at: 3.6, half: 0.2 },
  switch:       { name: 'the switch', of: 'holt', mark: 2.2, at: 5.6, half: 0.08 },
  spurtle:      { name: 'the spurtle', of: 'motherBarrow', mark: 2.0, at: 4.6, half: 0.26 },
  tawse:        { name: 'the tawse', of: 'fatherBarrow', mark: 2.6, at: 5.2, half: 0.12 },
  birch:        { name: 'the birch', of: 'brannock', mark: 2.3, at: 5.2, half: 0.3 },
};

// ── The models, in the toon style: two-band shading, ink outlines. ──
function model(id, palm) {
  const T = root.Toon, THREE = root.THREE, g = new THREE.Group(), side = palm || 1;
  const ink = (m, w) => { m.add(new THREE.Mesh(T.hullGeo(m.geometry, w == null ? 0.05 : w), T.INKM[0])); return m; };
  const put = (geo, hex, x, y, z, o) => { const m = new THREE.Mesh(geo, T.mat(hex)); m.position.set(x, y, z); if (o && o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]); if (!o || o.ink !== 0) ink(m, o && o.ink); m.castShadow = true; g.add(m); return m; };
  const rod = (r0, r1, len, hex, y, o) => put(new THREE.CylinderGeometry(r0, r1, len, 10), hex, 0, y - len / 2, 0, o);
  const L = LIST[id];
  switch (id) {
    case 'hairbrush': {      // an oval back of polished wood, the bristles on the far side from the skin, and a turned handle
      rod(0.3, 0.36, 2.6, '#6a3a20', -0.1);
      put(T.ell(0.26, 1.45, 1.05, 20, 12), '#7a4428', 0, -L.at, 0);
      put(T.ell(0.18, 1.25, 0.88, 16, 10), '#2a2220', -side * 0.32, -L.at, 0, { ink: 0.03 });      // (bristles)
      break; }
    case 'bakersPaddle': {   // a bread paddle: a long plain handle and a broad, thin blade, dusted with flour
      rod(0.26, 0.3, 3.2, '#b88a54', -0.1);
      put(new THREE.BoxGeometry(0.28, 3.4, 2.6), '#cfa36a', 0, -L.at, 0);
      put(new THREE.BoxGeometry(0.06, 2.4, 1.8), '#f2ead8', side * 0.16, -L.at - 0.3, 0.1, { ink: 0 });      // (flour)
      break; }
    case 'strap': {          // a leather strap, the handle end bound, the length of it heavy and a little curved
      rod(0.3, 0.3, 1.6, '#3e2616', 0.1);
      put(new THREE.BoxGeometry(0.22, 3.2, 1.3), '#5a3820', 0, -2.7, 0);
      put(new THREE.BoxGeometry(0.22, 2.4, 1.3), '#5a3820', 0.12 * side, -L.at, 0, { rot: [0, 0, 0.12 * side] });
      break; }
    case 'spoon': {          // a long wooden spoon, the bowl's back to the skin
      rod(0.2, 0.24, 4.0, '#c09060', 0.2);
      put(T.ell(0.22, 1.25, 0.9, 16, 10), '#c89868', 0, -L.at, 0);
      break; }
    case 'slipper': {        // a carpet slipper: a felt sole and a worn upper, held by the heel
      put(T.ell(0.2, 2.5, 0.95, 18, 10), '#4a3a30', 0, -L.at + 0.4, 0);
      put(T.ell(0.5, 1.4, 0.85, 16, 10), '#6a2a3a', -side * 0.4, -L.at - 0.7, 0);
      break; }
    case 'switch': {         // a hazel switch, cut and stripped: thin, long, a knot or two
      rod(0.12, 0.16, 2.0, '#6a5a3a', 0.6);
      rod(0.05, 0.12, 5.2, '#7a6a44', -1.3, { ink: 0.025 });
      for (const y of [-2.6, -4.4]) put(T.ell(0.1, 0.16, 0.1, 8, 6), '#5a4a30', 0, y, 0, { ink: 0 });
      break; }
    case 'spurtle': {        // a Scots porridge stick: turned wood, a thistle carved at the top
      put(T.ell(0.36, 0.5, 0.36, 12, 8), '#8a5a30', 0, 0.9, 0);
      rod(0.22, 0.32, 5.4, '#a87444', 0.5);
      break; }
    case 'tawse': {          // the tawse: a heavy leather strap, its end split into tails
      rod(0.3, 0.3, 1.6, '#2e1c10', 0.1);
      put(new THREE.BoxGeometry(0.24, 3.4, 1.5), '#4a2c16', 0, -2.8, 0);
      for (const z of [-0.5, 0, 0.5]) put(new THREE.BoxGeometry(0.22, 2.0, 0.42), '#4a2c16', 0, -L.at - 0.2, z, { rot: [z * 0.12, 0, 0] });
      break; }
    case 'birch': {          // a bundle of birch twigs, bound at the handle
      put(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 10), '#8a6a4a', 0, -0.2, 0);
      for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28, r = 0.18 + 0.12 * (k % 3); const t = rod(0.04, 0.08, 6.2, k % 2 ? '#5a3a2a' : '#6a4a30', -0.4, { ink: 0.02 }); t.position.x = Math.cos(a) * r * 0.6; t.position.z = Math.sin(a) * r; t.rotation.z = Math.cos(a) * 0.05; }
      break; }
    default: return g;      // (the hand: nothing in it)
  }
  return g;
}

const api = { LIST, model, ids: Object.keys(LIST) };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Implements = api;
})(typeof window !== 'undefined' ? window : globalThis);
