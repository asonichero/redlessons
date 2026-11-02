// Little Red’s Lessons — fair day on the green (js/fair.js has its days and rules; docs/quest-plan.md, the fair dress). Stalls along the north
// side of the green, facing into it: her mother's flowers, Grandmother's remedies beside them, the Pennocks' gingerbread, Mistress Thatcher's
// ribbons and fairings, Mistress Abney's ale by the inn. The dancing ground in the middle, the Miller on a crate with his fiddle. Everyone's
// there: the village (js/villagers.js, sent to the fair's places by station below), and those who aren't about the village of a day, stood at
// theirs (her mother, Grandmother, the Miller, the Thatchers, Old Halloran and Bo's mother and father, the carrier's men): each to talk to.
// The stalls stand through its Lay day, and come down on First Day.
//
//   FairDay.attach(P, w) (the village, each time it's built: before js/villagers.js, whose places these are) → { actions() } | null
//   FairDay.station(w, key, minute) → a villager's place on fair day (undefined: not fair day)
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const OPEN = H('07:30'), ENDS = H('22:00');
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
// (the stalls: along the north of the green, their fronts to the south; x, and what's on them)
const STALLS = [
  { id: 'flowers', x: -34, who: 'mother', cloth: '#d8a0b0', goods: ['#e8e0f0', '#f0a0a8', '#f4f0e8', '#c8d8f0'], name: 'Mama’s flowers' },
  { id: 'remedies', x: -12, who: 'gran', cloth: '#a8b890', goods: ['#6a8a4a', '#b8a060', '#8a6a9a', '#e0d8c0'], name: 'Grandmother’s remedies' },
  { id: 'ginger', x: 12, who: 'pennock', cloth: '#e0c090', goods: ['#b8743a', '#c98a4a', '#a8642e', '#d89a50'], name: 'the gingerbread' },
  { id: 'ribbons', x: 36, who: 'thatcherWife', cloth: '#a0b8d8', goods: ['#d84040', '#4060c0', '#e8c040', '#40a060'], name: 'ribbons and fairings' },
  { id: 'ale', x: 60, who: 'abney', cloth: '#c8a878', goods: ['#7a5232', '#7a5232'], name: 'the ale' },
];
const ROW_Z = -42, GREEN = { x: 0, z: 22 };
const DANCE = new V3(-10, 0, 30), FIDDLE = new V3(-30, 0, 26);
// The fair's own people (not about the village of a day): who, their figure, where they stand, which way they face, their voice.
const EXTRA = [
  { key: 'mother', rig: 'gerda', name: 'Mother', voice: 'gerda', tint: '#6a3a4a', bg: '#e6d8e6', stall: 'flowers' },
  { key: 'gran', rig: 'gran', name: 'Grandmother', voice: 'gran', tint: '#5a6a3a', bg: '#e4e8d6', stall: 'remedies' },
  { key: 'thatcherWife', rig: 'thatcherWife', name: 'Mistress Thatcher', voice: 'pennock', tint: '#6a8a4a', bg: '#e8eedc', stall: 'ribbons' },
  { key: 'miller', rig: 'miller', name: 'The Miller', voice: 'baker', tint: '#7a7468', bg: '#eeeae2', at: FIDDLE, face: DANCE },
  { key: 'thatcher', rig: 'thatcher', name: 'Master Thatcher', voice: 'smith', tint: '#5a4a34', bg: '#e6e0d0', at: new V3(84, 0, 34), face: new V3(60, 0, 40) },
  { key: 'halloran', rig: 'halloran', name: 'Master Halloran', voice: 'baker', tint: '#5a4a38', bg: '#e8e0cc', at: new V3(96, 0, 46), face: new V3(70, 0, 40) },
  { key: 'boFather', rig: 'boFather', name: 'Young Master Halloran', voice: 'smith', tint: '#4e4232', bg: '#e4dccc', at: new V3(104, 0, 38), face: new V3(80, 0, 40) },
  { key: 'boMother', rig: 'boMother', name: 'Mistress Halloran', voice: 'pennock', tint: '#8a5a6a', bg: '#f0e2e8', at: new V3(100, 0, 54), face: new V3(80, 0, 40) },
  { key: 'carrierNed', rig: 'carrierNed', name: 'Ned', voice: 'smith', tint: '#5a4a34', bg: '#e8e0d0', at: new V3(66, 0, -22), face: new V3(60, 0, -42) },
  { key: 'carrierAmos', rig: 'carrierAmos', name: 'Old Amos', voice: 'baker', tint: '#5a5040', bg: '#e6e2d6', at: new V3(74, 0, -20), face: new V3(60, 0, -42) },
  { key: 'carrierKit', rig: 'carrierKit', name: 'Kit', voice: 'georgie', tint: '#4a4a52', bg: '#e0e0e6', at: new V3(20, 0, 36), face: DANCE },
];
// (the stalls stand: fair day, its Lay day, and till First Day's morning)
const standing = w => { const ph = root.Fair && root.Fair.phase(w); return ph === 'fair' || (ph === 'after' && !(w.cal.weekday === 1 && w.cal.minute >= H('10:00'))); };

// A stall: a trestle with its cloth, an awning on four poles striped in its colour, and its goods in rows.
function stall(T, s) {
  const g = new THREE.Group(), mesh = (geo, col, x, y, z, ink) => { const m = new THREE.Mesh(geo, T.mat(col)); m.position.set(x, y, z); m.castShadow = true; m.add(new THREE.Mesh(T.hullGeo(geo, ink || 0.06), T.INKM[0])); g.add(m); return m; };
  mesh(new THREE.BoxGeometry(16, 0.8, 7), '#8a6a48', 0, 7.6, 0); mesh(new THREE.BoxGeometry(16.4, 3.5, 0.2), s.cloth, 0, 5.6, 3.6, 0.03);
  for (const x of [-7, 7]) for (const z of [-3, 3]) mesh(new THREE.CylinderGeometry(0.3, 0.3, 7.4, 6), '#6a4a30', x, 3.7, z, 0.04);
  for (const x of [-7.6, 7.6]) for (const z of [-3.6, 3.6]) mesh(new THREE.CylinderGeometry(0.25, 0.25, 15, 6), '#6a4a30', x, 7.5, z, 0.04);
  for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(16.8 / 6, 0.25, 8.6), k % 2 ? '#f4eee2' : s.cloth, -8.4 + 16.8 / 12 + k * 16.8 / 6, 15.1, 0, 0.02).rotation.x = -0.12;
  s.goods.forEach((c, i) => { for (let k = 0; k < 3; k++) mesh(s.id === 'ale' ? new THREE.CylinderGeometry(1.6, 1.6, 3, 10) : new THREE.SphereGeometry(1, 8, 6).scale(1.2, 0.7, 1.2), c, -5.5 + i * 3.6 + (k - 1) * 0.6, s.id === 'ale' ? 9.5 : 8.5, -1.5 + k * 1.4, 0.04); });
  g.position.set(s.x, 0, ROW_Z); return g;
}
// Bunting: strung between the stalls' awnings, and across the dancing ground.
function bunting(T, from, to, n) {
  const g = new THREE.Group(), cols = ['#d84040', '#e8c040', '#4060c0', '#f4eee2', '#40a060'];
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, from.distanceTo(to), 4), T.mat('#5a4a3a')); line.position.copy(from).lerp(to, 0.5); line.quaternion.setFromUnitVectors(new V3(0, 1, 0), to.clone().sub(from).normalize()); g.add(line);
  for (let k = 1; k < n; k++) { const p = from.clone().lerp(to, k / n); p.y -= Math.sin(Math.PI * k / n) * 2.5; const f = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2, 3), T.mat(cols[k % cols.length])); f.rotation.x = Math.PI; f.position.copy(p).add(new V3(0, -1, 0)); g.add(f); }
  return g;
}

function attach(P, w) {
  if (!root.Fair || !standing(w)) return null;
  const T = root.Toon, W = P.world, S = root.Story, on = root.Fair.isFair(w) && w.cal.minute >= OPEN && w.cal.minute < ENDS;
  const g = new THREE.Group(); P.stage.scene.add(g);
  W.spots = W.spots || {}; W.obstacles = W.obstacles || [];
  for (const s of STALLS) { g.add(stall(T, s)); W.obstacles.push({ x0: s.x - 8.5, x1: s.x + 8.5, z0: ROW_Z - 4.5, z1: ROW_Z + 4.5 });
    W.spots['stall_' + s.id] = { at: new V3(s.x, 0, ROW_Z - 7), yaw: 0, look: new V3(s.x, 9, ROW_Z) };      // (behind it, its keeper)
    W.spots['before_' + s.id] = { at: new V3(s.x, 0, ROW_Z + 10), yaw: Math.PI, look: new V3(s.x, 9, ROW_Z) }; }      // (before it, a customer)
  for (let i = 0; i < STALLS.length - 1; i++) g.add(bunting(T, new V3(STALLS[i].x + 7.6, 15.2, ROW_Z + 3.6), new V3(STALLS[i + 1].x - 7.6, 15.2, ROW_Z + 3.6), 5));
  // (the dancing ground: bunting across it from the lime tree to a pole, and the fiddler's crate)
  { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 22, 8), T.mat('#6a4a30')); pole.position.set(DANCE.x + 34, 11, DANCE.z - 8); pole.add(new THREE.Mesh(T.hullGeo(pole.geometry, 0.05), T.INKM[0])); g.add(pole);
    g.add(bunting(T, new V3(-60, 20, 16), new V3(DANCE.x + 34, 21, DANCE.z - 8), 12)); W.obstacles.push({ x: DANCE.x + 34, z: DANCE.z - 8, r: 1.5 });
    const crate = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), T.mat('#8a6a48')); crate.position.set(FIDDLE.x, 1.5, FIDDLE.z); crate.add(new THREE.Mesh(T.hullGeo(crate.geometry, 0.06), T.INKM[0])); g.add(crate); }
  W.spots.dance = { at: DANCE.clone(), yaw: 0, look: DANCE.clone().setY(10) };
  W.spots.danceEdge = { at: DANCE.clone().add(new V3(18, 0, 10)), yaw: yawTo(DANCE.clone().add(new V3(18, 0, 10)), DANCE), look: DANCE.clone().setY(10) };
  W.spots.danceEdge2 = { at: DANCE.clone().add(new V3(-16, 0, 14)), yaw: yawTo(DANCE.clone().add(new V3(-16, 0, 14)), DANCE), look: DANCE.clone().setY(10) };
  W.spots.aleSide = { at: new V3(70, 0, -26), yaw: Math.PI, look: new V3(60, 9, ROW_Z) };
  if (!on) return { actions: () => [] };
  // ── The fair's own people, at their places.
  const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}, figs = {};
  for (const D of EXTRA) {
    const s = D.stall && STALLS.find(x => x.id === D.stall), at = s ? W.spots['stall_' + s.id].at.clone() : D.at.clone(), face = s ? new V3(s.x, 0, ROW_Z + 20) : D.face;
    const look = D.rig === 'gerda' ? Object.assign({}, looks.gerda, { outfit: 'Fine' }) : (looks[D.rig] || {});      // (her mother in her good dress, for the fair)
    const rig = T.make(D.rig, look), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, D.key) });
    motion.warp(at, yawTo(at, face)); rig.root.position.copy(at); rig.root.rotation.y = motion.yaw;
    P.addFigure(D.key, { rig, motion, cast: { name: D.name, voice: D.voice, tint: D.tint, bg: D.bg } }); figs[D.key] = { rig, motion, D };
    P.tick(dt => { motion.update(dt, null); rig.tick(dt); });
    if (!s) W.obstacles.push({ x: at.x, z: at.z, r: 3 });
  }
  // (the Miller's bow arm, sawing, while the fair's on)
  { const f = figs.miller; if (f) { let t = 0; f.motion.reach('L', () => f.rig.root.position.clone().add(new V3(Math.sin(f.motion.yaw) * 3 - Math.cos(f.motion.yaw) * 2, 15, Math.cos(f.motion.yaw) * 3 + Math.sin(f.motion.yaw) * 2)));
    f.motion.reach('R', () => { const s = Math.sin(t * 4) * 2.2, fw = new V3(Math.sin(f.motion.yaw), 0, Math.cos(f.motion.yaw)), sd = new V3(fw.z, 0, -fw.x); return f.rig.root.position.clone().addScaledVector(fw, 4).addScaledVector(sd, -1 + s).setY(14); });
    P.tick(dt => { t += dt; }); } }
  // ── A word with any of them: their own for the day (her mother's and Grandmother's errands: js/fairday.js, to come).
  const talking = { busy: false };
  function actions() {
    if (P.busy || talking.busy) return [];
    const out = [];
    for (const k in figs) { const f = figs[k]; out.push({ label: 'Talk to ' + (k === 'mother' ? 'Mama' : f.D.name), at: f.motion.pos.clone().setY(16), run: async () => { talking.busy = true;
      try { const m = P.motion; await m.face(yawTo(m.pos, f.motion.pos)); f.motion.face(yawTo(f.motion.pos, m.pos)); await P.converse(S.fairTalk(k, { day: w.cal.day, minute: w.cal.minute }), { shot: ['red', k] }); f.motion.face(yawTo(f.motion.pos, f.D.face || new V3(f.motion.pos.x, 0, ROW_Z + 20))); }
      finally { talking.busy = false; } } }); }
    return out;
  }
  W.more = W.more || []; W.more.push(actions);
  return { actions, figs };
}
// A villager's place on fair day: everyone at the fair, from when it opens till ten (null before it, and after: in their doors).
function station(w, key, min) {
  if (!root.Fair || !root.Fair.isFair(w)) return undefined;
  if (min < OPEN || min >= ENDS) return key === 'willie' && min >= ENDS ? undefined : null;      // (the Watchman's round, after: his own)
  const late = min >= H('19:00');
  switch (key) {
    case 'pennock': return { stand: 'stall_ginger' };
    case 'baker': return min < H('15:00') ? { stand: 'before_ginger' } : { wander: true };
    case 'abney': return { stand: 'stall_ale' };
    case 'smith': return { stand: 'aleSide' };
    case 'bess': return null;      // (near her time: in at the Wheatsheaf, as she always is: a fairing brought to her)
    case 'agnes': return late ? { stand: 'danceEdge' } : { wander: true };
    case 'georgie': return late ? { stand: 'danceEdge' } : min < H('12:00') ? { stand: 'before_ribbons' } : { wander: true };
    case 'tom': return late ? { stand: 'danceEdge2' } : { wander: true };
    case 'peter': return late ? { stand: 'danceEdge2' } : { wander: true };
    case 'willie': return min < H('14:00') ? null : min < H('21:15') ? { wander: true } : { stand: 'bell' };      // (abed till the afternoon; the bell at ten, for once)
    default: return undefined;
  }
}

const api = { attach, station, STALLS, DANCE, FIDDLE, OPEN, ENDS };
root.FairDay = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
