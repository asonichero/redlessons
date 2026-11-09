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
  { id: 'flowers', who: 'mother', cloth: '#d8a0b0', goods: ['#e8e0f0', '#f0a0a8', '#f4f0e8', '#c8d8f0'], name: 'Mama’s flowers' },
  { id: 'remedies', who: 'gran', cloth: '#a8b890', goods: ['#6a8a4a', '#b8a060', '#8a6a9a', '#e0d8c0'], name: 'Grandmother’s remedies' },
  { id: 'ginger', who: 'pennock', cloth: '#e0c090', goods: ['#b8743a', '#c98a4a', '#a8642e', '#d89a50'], name: 'the gingerbread' },
  { id: 'ribbons', who: 'thatcherWife', cloth: '#a0b8d8', goods: ['#d84040', '#4060c0', '#e8c040', '#40a060'], name: 'ribbons and fairings' },
  { id: 'ale', who: 'abney', cloth: '#c8a878', goods: ['#7a5232', '#7a5232'], name: 'the ale' },
];
const ROW_Z = -42, GREEN = { x: 0, z: 22 };
const DANCE = new V3(-10, 0, 30);
// The fair's things where they stand (the room editor moves them: rooms.html's "The village, fair day"; kept in the browser, as a room's are):
// each stall (x, z, and ry: its turn, its front to the south at 0), the pole the bunting's strung to, the Miller's crate, and Bo's pen.
const SC = 2;      // (a stall's size: its counter at a grown woman's waist, the low edge of its awning clear over a man's head; a figure stands 31 tall)
const KIT = root.Cottage && root.Cottage.kit;
const ROOM = KIT ? KIT.roomLayout('red-lessons:room:fair', {
  flowers: { x: -156.5, z: -3.5, ry: 1.309 }, remedies: { x: -146.5, z: 71, ry: 2.0944 }, ginger: { x: 109, z: -51, ry: 5.4978 }, ribbons: { x: -109.5, z: -66.5, ry: 0.5236 },
  ale: { x: 40, z: -80.5, ry: -0.2618 }, pole: { x: -15, z: 7.5, ry: 0 }, crate: { x: -70, z: 10, ry: 0 }, pen: { x: 166.5, z: 71.5, ry: -2.0944 },
  cart: { x: -55, z: -40, ry: 0.5 },      // (the carriers' cart of trinkets from Ashby: wheeled out of the inn yard by Old Amos in the late morning)      // (round the green, each facing in to it)
}) : { LAYOUT: {}, layout: () => ({}), saveLayout() {}, resetLayout() {} };
const PIECES = { flowers: 'Mama’s flower stall', remedies: 'Grandmother’s remedies stall', ginger: 'The gingerbread stall', ribbons: 'The ribbon stall', ale: 'The ale stall', pole: 'The bunting pole', crate: 'The Miller’s crate', pen: 'Bo’s pen and sheep', cart: 'The trinket cart' };
const local = (l, x, z) => new V3(l.x + Math.cos(l.ry) * x + Math.sin(l.ry) * z, 0, l.z - Math.sin(l.ry) * x + Math.cos(l.ry) * z);      // (a point of a piece, in the world: x along it, z out to its front)
// The fair's own people (not about the village of a day): who, their figure, where they stand, which way they face, their voice.
const EXTRA = [
  { key: 'mother', rig: 'gerda', name: 'Mother', voice: 'gerda', tint: '#6a3a4a', bg: '#e6d8e6', stall: 'flowers' },
  { key: 'gran', rig: 'gran', name: 'Grandmother', voice: 'gran', tint: '#5a6a3a', bg: '#e4e8d6', stall: 'remedies' },
  { key: 'thatcherWife', rig: 'thatcherWife', name: 'Mistress Thatcher', voice: 'pennock', tint: '#6a8a4a', bg: '#e8eedc', stall: 'ribbons' },
  { key: 'miller', rig: 'miller', name: 'The Miller', voice: 'baker', tint: '#7a7468', bg: '#eeeae2', by: ['crate', 0, 4.5], face: DANCE },      // (by: beside a piece of the fair's: its x, and out to its front)
  { key: 'thatcher', rig: 'thatcher', name: 'Master Thatcher', voice: 'smith', tint: '#5a4a34', bg: '#e6e0d0', at: new V3(84, 0, 34), face: new V3(60, 0, 40) },
  { key: 'halloran', rig: 'halloran', name: 'Master Halloran', voice: 'baker', tint: '#5a4a38', bg: '#e8e0cc', by: ['pen', -12, 26], face: DANCE },
  { key: 'boFather', rig: 'boFather', name: 'Young Master Halloran', voice: 'smith', tint: '#4e4232', bg: '#e4dccc', by: ['pen', 18, 27], faceTo: 'pen' },
  { key: 'bo', rig: 'bo', name: 'Bo', voice: 'bo', tint: '#8a5a6a', bg: '#f2e4ea', by: ['pen', 7, 22], face: DANCE },      // (by her pen's gate, showing the flock)
  { key: 'boMother', rig: 'boMother', name: 'Mistress Halloran', voice: 'pennock', tint: '#8a5a6a', bg: '#f0e2e8', by: ['pen', -22, 30], face: DANCE },
  { key: 'fowler', rig: 'fowler', name: 'Master Fowler', voice: 'baker', tint: '#5a4a34', bg: '#e8e2d2', by: ['ale', -22, 20], faceTo: 'ale' },      // (Peter's grandfather, in from the meadow for once: by the ale, as long as his legs hold)
  { key: 'carrierNed', rig: 'carrierNed', name: 'Ned', voice: 'smith', tint: '#5a4a34', bg: '#e8e0d0', by: ['ale', 8, 20], faceTo: 'ale' },
  { key: 'carrierAmos', rig: 'carrierAmos', name: 'Old Amos', voice: 'baker', tint: '#5a5040', bg: '#e6e2d6', by: ['ale', 16, 22], faceTo: 'ale' },
  { key: 'carrierKit', rig: 'carrierKit', name: 'Kit', voice: 'georgie', tint: '#4a4a52', bg: '#e0e0e6', at: new V3(20, 0, 36), face: DANCE },
];
// (the stalls stand: fair day, its Lay day, and till First Day's morning)
const standing = w => { const ph = root.Fair && root.Fair.phase(w); return ph === 'fair' || (ph === 'after' && !(w.cal.weekday === 1 && w.cal.minute >= H('10:00'))); };

// ── The week before: the fair put up on the green a piece at a time, by Master Thatcher and his men, from where it's kept all year in the
// Wheatsheaf's barn: the pole first (five days to go), then the stalls' bare frames (three), then their cloths and awnings and the bunting
// (the day before). Little Red sees it come, and wonders at it. → { up (0 the pole, 1 frames, 2 dressed), key } | null
function putUp(w) {
  const st = root.Fair.stateOf(w); if (root.Fair.phase(w) !== 'week' || !st.day) return null;
  const left = st.day - w.cal.day; if (left > 5) return null;
  return left <= 1 ? { up: 2, key: 'dressed' } : left <= 3 ? { up: 1, key: 'frames' } : { up: 0, key: 'pole' };
}
// (the first time she sees each, a thought)
function building(P, w, pre) {
  const flag = 'fair-up-' + pre.key; if ((w.save.state.flags || {})[flag]) return;
  let t = 0; const off = P.tick(dt => { if (P.busy || (P.talk && P.talk.playing) || (t += dt) < 2.5) return; off(); w.save.flag(flag, w.cal.day); if (P.talk && root.Story.fairGoingUp) P.talk.muse(root.Story.fairGoingUp(pre.key), { face: 'smile' }); });
}
// A stall: a trestle with its cloth, an awning on four poles striped in its colour, and its goods in rows. Its front, where they buy, is the
// awning's high side; behind, its low side, where they serve from. up: how far it's put up, the week before (1 the frame, 2 dressed, 3 the day).
function stall(T, s, up) {
  if (up == null) up = 3;
  const g = new THREE.Group(), mesh = (geo, col, x, y, z, ink) => { const m = new THREE.Mesh(geo, T.mat(col)); m.position.set(x, y, z); m.castShadow = true; m.add(new THREE.Mesh(T.hullGeo(geo, ink || 0.06), T.INKM[0])); g.add(m); return m; };
  mesh(new THREE.BoxGeometry(16, 0.8, 7), '#8a6a48', 0, 7.6, 0); if (up >= 2) mesh(new THREE.BoxGeometry(16.4, 3.5, 0.2), s.cloth, 0, 5.6, 3.6, 0.03);
  for (const x of [-7, 7]) for (const z of [-3, 3]) mesh(new THREE.CylinderGeometry(0.3, 0.3, 7.4, 6), '#6a4a30', x, 3.7, z, 0.04);
  for (const x of [-7.6, 7.6]) for (const z of [-3.6, 3.6]) mesh(new THREE.CylinderGeometry(0.25, 0.25, 18.6, 6), '#6a4a30', x, 9.3, z, 0.04);
  if (up >= 2) for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(16.8 / 6, 0.25, 8.6), k % 2 ? '#f4eee2' : s.cloth, -8.4 + 16.8 / 12 + k * 16.8 / 6, 18.7, 0, 0.02).rotation.x = -0.12;
  if (up >= 3) s.goods.forEach((c, i) => { for (let k = 0; k < 3; k++) mesh(s.id === 'ale' ? new THREE.CylinderGeometry(1.6, 1.6, 3, 10) : new THREE.SphereGeometry(1, 8, 6).scale(1.2, 0.7, 1.2), c, -5.5 + i * 3.6 + (k - 1) * 0.6, s.id === 'ale' ? 9.5 : 8.5, -1.5 + k * 1.4, 0.04); });
  g.scale.setScalar(SC); return g;
}
// The carriers' handcart, its bed a display of trinkets from Ashby under a little striped awning: two big wheels at its sides, its handles out
// behind (where Old Amos stands to sell), two props in front to keep it level. Its front (+z) is where they buy. The lucky charm on its own
// stand in the middle, gilt on a red cord (Ned's eye on it, for Agnes; Red's to buy first, if she's quick); round it, the rest: brooches, combs,
// a pewter thimble, a painted box, ribbons on cards, a little glass bottle. (c.charm: the charm, to take off when it's sold)
const CART_AT = { amos: [0, -14] };
function cart(T) {
  const g = new THREE.Group(), wood = T.mat('#7a5a3a'), dark = T.mat('#4a3424'), iron = T.mat('#3a3634');
  const mesh = (geo, m, x, y, z, ink, par) => { const k = new THREE.Mesh(geo, typeof m === 'string' ? T.mat(m) : m); k.position.set(x, y, z); k.castShadow = true; if (ink !== 0) k.add(new THREE.Mesh(T.hullGeo(geo, ink || 0.04), T.INKM[0])); (par || g).add(k); return k; };
  mesh(new THREE.BoxGeometry(18, 1.2, 10), wood, 0, 12, 0, 0.06);      // (the bed)
  for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(18, 2.2, 0.6), dark, 0, 13.4, sz * 5, 0.03);      // (its sides, a low rail)
  for (const sx of [-1, 1]) { const wl = new THREE.Group(); wl.position.set(sx * 10.2, 6.2, 0); g.add(wl);
    mesh(new THREE.TorusGeometry(5.6, 0.45, 6, 20), iron, 0, 0, 0, 0.03, wl).rotation.y = Math.PI / 2;
    for (let k = 0; k < 8; k++) mesh(new THREE.BoxGeometry(0.4, 10.8, 0.5), wood, 0, 0, 0, 0.02, wl).rotation.x = k * Math.PI / 8;
    mesh(new THREE.CylinderGeometry(1, 1, 1.4, 10).rotateZ(Math.PI / 2), dark, 0, 0, 0, 0.03, wl); }
  mesh(new THREE.CylinderGeometry(0.5, 0.5, 21, 6).rotateZ(Math.PI / 2), iron, 0, 6.2, 0, 0.02);      // (the axle)
  for (const sx of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.45, 0.45, 12, 6), dark, sx * 7, 6, 4.4, 0.03); mesh(new THREE.CylinderGeometry(0.55, 0.45, 14, 6).rotateX(Math.PI / 2 - 0.08), wood, sx * 6.5, 12.6, -11.5, 0.03); }      // (the props in front; the handles behind)
  // (the display: a board tilted to the buyer, a cloth on it, and the trinkets in rows)
  const board = new THREE.Group(); board.position.set(0, 13.6, 0.5); board.rotation.x = 0.35; g.add(board);
  mesh(new THREE.BoxGeometry(16, 0.5, 8.4), wood, 0, 0, 0, 0.04, board); mesh(new THREE.BoxGeometry(15.4, 0.12, 7.8), '#3a4a6a', 0, 0.3, 0, 0, board);
  const r = (k => () => { k = (k * 16807) % 2147483647; return k / 2147483647; })(57), cols = ['#d8b860', '#c0c4c8', '#d84050', '#4a70c0', '#6aa060', '#e8d8b0', '#a87850'];
  for (let i = 0; i < 9; i++) { const x = -6.2 + (i % 5) * 3.1 + (i >= 5 ? 1.55 : 0), z = i < 5 ? 1.9 : -1.9, c = cols[i % cols.length];
    if (Math.abs(x) < 1 && z > 0) continue;      // (the middle of the front row: the charm's)
    const kind = i % 4, geo = kind === 0 ? new THREE.TorusGeometry(0.7, 0.22, 6, 12).rotateX(Math.PI / 2) : kind === 1 ? new THREE.BoxGeometry(1.6, 0.8, 1.1) : kind === 2 ? new THREE.CylinderGeometry(0.5, 0.6, 1.4, 8) : new THREE.BoxGeometry(1.2, 0.2, 1.8);
    mesh(geo, c, x, 0.55 + (kind === 2 ? 0.4 : 0), z, 0.02, board).rotation.y = r() * 0.6 - 0.3; }
  const charm = new THREE.Group(); charm.position.set(0, 0.4, 1.9); board.add(charm);
  mesh(new THREE.BoxGeometry(1.8, 1.4, 1.8), '#5a3a2a', 0, 0.7, 0, 0.03, charm); mesh(new THREE.TorusGeometry(0.75, 0.18, 6, 14), '#e8c048', 0, 2.2, 0, 0.02, charm);
  mesh(new THREE.TorusGeometry(1.1, 0.06, 4, 16).rotateX(Math.PI / 2), '#c02030', 0, 1.5, 0, 0, charm);      // (the charm on its stand: a gilt ring on a red cord)
  // (the awning: two poles from the handles' end of the bed, a striped cloth slanting forward over it)
  for (const sx of [-1, 1]) mesh(new THREE.CylinderGeometry(0.3, 0.3, 26, 6), dark, sx * 8.4, 25, -4.6, 0.03);
  for (let k = 0; k < 5; k++) mesh(new THREE.BoxGeometry(17.6 / 5, 0.25, 12), k % 2 ? '#f0e6d2' : '#7a8a5a', -8.8 + 17.6 / 10 + k * 17.6 / 5, 36.5, 0.5, 0.02).rotation.x = 0.16;
  g.userData.charm = charm; return g;
}
// ── The cart comes: at eleven Old Amos goes over to the inn yard, where it stood the night, and wheels it out across the green to its place,
// pushing from the handles; then stands behind it to sell. Come later, she finds it there already.
const CART_IN = H('11:00');
function cartComes(P, w, g, am, F, W) {
  const back = F.spots.cartBack, home = { pos: g.position.clone(), ry: g.rotation.y }, inn = W.spots.inn, place = () => { g.position.copy(home.pos); g.rotation.y = home.ry; g.visible = true; W.obstacles.push(F.obstacles.cart); };
  if (w.cal.minute >= CART_IN + 10) { place(); am.warp(back.at, back.yaw); return; }
  g.visible = false; let step = 0;
  const off = P.tick(() => {
    if (step === 0 && w.cal.minute >= CART_IN) { step = 1; am.goTo(inn.at.clone(), null).then(() => { step = 2; }); }      // (over to the inn yard for it)
    if (step === 2) { step = 3; g.visible = true; am.goTo(back.at.clone(), back.yaw, { speed: 0.6 }).then(() => { step = 4; }); }      // (and out with it, at a steady push)
    if (step === 3) { const f = new V3(Math.sin(am.yaw), 0, Math.cos(am.yaw)); g.position.set(am.pos.x, 0, am.pos.z).addScaledVector(f, -CART_AT.amos[1]); g.rotation.y = am.yaw; }      // (the cart before him, its handles in his hands)
    if (step === 4) { off(); place(); am.face(back.yaw); }
  });
}
// Bo's pen: hurdles round a square of the green, a gate in its front, and a few of the flock in it, washed for showing.
function pen(T) {
  const g = new THREE.Group(), wood = T.mat('#8a6a42'), wool = T.mat('#f2ece0'), face = T.mat('#2e2a28'), W2 = 22, D2 = 15;
  const mesh = (geo, m, x, y, z, ink, par) => { const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); k.castShadow = true; k.add(new THREE.Mesh(T.hullGeo(geo, ink || 0.04), T.INKM[0])); (par || g).add(k); return k; };
  const hurdle = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), h = new THREE.Group(); h.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); h.rotation.y = -Math.atan2(z1 - z0, x1 - x0); g.add(h);
    for (const y of [2.2, 4.4, 6.6]) mesh(new THREE.BoxGeometry(L, 0.6, 0.5), wood, 0, y, 0, 0.03, h);
    for (let k = 0; k <= Math.round(L / 6); k++) mesh(new THREE.BoxGeometry(0.7, 8, 0.7), wood, -L / 2 + k * L / Math.round(L / 6), 4, 0, 0.03, h); };
  hurdle(-W2, -D2, W2, -D2); hurdle(-W2, -D2, -W2, D2); hurdle(W2, -D2, W2, D2); hurdle(-W2, D2, 2, D2); hurdle(12, D2, W2, D2);      // (the gap in the front: its gate, swung in)
  const r = (k => () => { k = (k * 16807) % 2147483647; return k / 2147483647; })(91);
  for (const [x, z, a, lying] of [[-13, -6, 0.6, false], [-3, 6, 2.4, true], [12, -7, 4.2, false], [0, -8, 1.4, false], [14, 7, 5.4, true]]) {
    const sh = new THREE.Group(); sh.position.set(x, 0, z); sh.rotation.y = a + r() * 0.3; g.add(sh); const y = lying ? 2.4 : 4.6;
    mesh(T.ell(3.2, 2.6, 4.4, 12, 8), wool, 0, y, 0, 0.07, sh); mesh(T.ell(1.1, 1.4, 1.7, 8, 6), face, 0, y + 1.2, 4.4, 0.05, sh);
    for (const sx of [-1, 1]) mesh(T.ell(0.9, 0.35, 0.5, 6, 4), face, sx * 1.4, y + 2.2, 3.8, 0.03, sh);
    if (!lying) for (const [lx, lz] of [[-1.6, 2.4], [1.6, 2.4], [-1.6, -2.4], [1.6, -2.4]]) mesh(new THREE.CylinderGeometry(0.45, 0.4, 3.4, 6), face, lx, 1.7, lz, 0.03, sh); }
  return g;
}
// The fair's things, as its layout has them (L: ROOM.layout()): the stalls, the bunting between them and to the pole, the crate, the pen. →
// { group, pieces (each with g, for the room editor), obstacles, spots }
function build(T, L, up) {
  if (up == null) up = 3;
  const g = new THREE.Group(), pieces = {}, obstacles = [], spots = {};
  const put = (id, obj) => { const l = L[id]; obj.position.set(l.x, obj.position.y, l.z); obj.rotation.y = l.ry; obj.userData.piece = id; g.add(obj); pieces[id] = { g: obj, items: [], spin: 0 }; return obj; };
  for (const s of STALLS) { if (up < 1) break; const l = L[s.id]; put(s.id, stall(T, s, up));
    for (const x of [-9, 0, 9]) { const c = local(l, x * SC / 1.8, 0); obstacles.push({ x: c.x, z: c.z, r: 7 }); }
    const back = local(l, 0, -7.5 * SC), front = local(l, 0, 10 * SC), mid = local(l, 0, 0).setY(9 * SC);
    spots['stall_' + s.id] = { at: back, yaw: yawTo(back, mid), look: mid.clone() };      // (behind it, its keeper)
    spots['before_' + s.id] = { at: front, yaw: yawTo(front, mid), look: mid.clone() };      // (before it, a customer)
    const side = local(l, 15 * SC, 9 * SC), pour = local(l, -5 * SC, 6.5 * SC);
    spots['beside_' + s.id] = { at: side, yaw: yawTo(side, local(l, 15 * SC, 30 * SC)), look: mid.clone(), fair: true };      // (off to one side of its front, out of the way of those buying: crying its wares)
    spots['pour_' + s.id] = { at: pour, yaw: yawTo(pour, local(l, -5 * SC, 0)), look: mid.clone(), fair: true }; }      // (on the buying side, at its end: where the ale's poured, from the casks on it)
  for (const k in spots) if (k.startsWith('stall_')) spots[k].fair = true;      // (fair: stood as the spot says, not turned out to the street as at their doors)
  // (the bunting: from the top of a tall pole in the middle of it all out to each stall's awning, as the spokes of a wheel; and to the lime tree)
  const awning = id => local(L[id], 0, 3.6 * SC).setY(19 * SC);
  { const pl = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 44, 8), T.mat('#6a4a30')); m.position.y = 22; m.castShadow = true; m.add(new THREE.Mesh(T.hullGeo(m.geometry, 0.05), T.INKM[0])); pl.add(m); put('pole', pl);
    const top = new V3(L.pole.x, 43, L.pole.z); if (up >= 2) { g.add(bunting(T, new V3(60, 30, 16), top)); for (const st of STALLS) g.add(bunting(T, awning(st.id), top)); } obstacles.push({ x: L.pole.x, z: L.pole.z, r: 1.5 }); }
  if (up >= 3) { const c = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), T.mat('#8a6a48')); m.position.y = 1.5; m.castShadow = true; m.add(new THREE.Mesh(T.hullGeo(m.geometry, 0.06), T.INKM[0])); c.add(m); put('crate', c); obstacles.push({ x: L.crate.x, z: L.crate.z, r: 3.5 }); }
  if (up >= 3) { put('cart', cart(T)); const c = local(L.cart, 0, 0); obstacles.cart = { x: c.x, z: c.z, r: 11 }; const b = local(L.cart, ...CART_AT.amos); spots.cartBack = { at: b, yaw: yawTo(b, c), look: c.clone().setY(16), fair: true }; }      // (kept out of the list till it's wheeled into its place)
  if (up >= 3) { put('pen', pen(T)); const l = L.pen; for (const [x0, z0, x1, z1] of [[-22, -15, 22, -15], [-22, -15, -22, 15], [22, -15, 22, 15], [-22, 15, 22, 15]]) for (let k = 0; k <= 5; k++) { const c = local(l, x0 + (x1 - x0) * k / 5, z0 + (z1 - z0) * k / 5); obstacles.push({ x: c.x, z: c.z, r: 2.2 }); } }
  return { group: g, pieces, obstacles, spots };
}
// Bunting: a line strung from one point to another, its flags hanging along it as it sags.
function bunting(T, from, to, n) {
  const len = from.distanceTo(to); n = n || Math.max(4, Math.round(len / 6)); const sag = 1.5 + len * 0.05;      // (a flag every six or so; the longer the line, the deeper it hangs)
  const g = new THREE.Group(), cols = ['#d84040', '#e8c040', '#4060c0', '#f4eee2', '#40a060'];
  const at = k => { const p = from.clone().lerp(to, k / n); p.y -= Math.sin(Math.PI * k / n) * sag; return p; }, cord = T.mat('#5a4a3a');
  for (let k = 0; k < n; k++) { const a = at(k), b = at(k + 1), seg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, a.distanceTo(b), 4), cord); seg.position.copy(a).lerp(b, 0.5); seg.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize()); g.add(seg); }      // (the cord, hanging as it's strung)
  for (let k = 1; k < n; k++) { const p = at(k); const f = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2, 3), T.mat(cols[k % cols.length])); f.rotation.x = Math.PI; f.position.copy(p).add(new V3(0, -1, 0)); g.add(f); }
  return g;
}

function attach(P, w) {
  if (!root.Fair) return null;
  const pre = putUp(w); if (!standing(w) && !pre) return null;
  const T = root.Toon, W = P.world, S = root.Story, on = root.Fair.isFair(w) && w.cal.minute >= OPEN && w.cal.minute < ENDS;
  const g = new THREE.Group(); P.stage.scene.add(g);
  W.spots = W.spots || {}; W.obstacles = W.obstacles || [];
  const L = ROOM.layout(), F = build(T, L, pre ? pre.up : 3); g.add(F.group);
  W.obstacles.push(...F.obstacles); Object.assign(W.spots, F.spots);
  if (pre) { building(P, w, pre); return { actions: () => [] }; }      // (the week before: only what's up so far; the fair's people not there yet)
  W.spots.dance = { at: DANCE.clone(), yaw: 0, look: DANCE.clone().setY(10) };
  W.spots.danceEdge = { at: DANCE.clone().add(new V3(18, 0, 10)), yaw: yawTo(DANCE.clone().add(new V3(18, 0, 10)), DANCE), look: DANCE.clone().setY(10) };
  W.spots.danceEdge2 = { at: DANCE.clone().add(new V3(-16, 0, 14)), yaw: yawTo(DANCE.clone().add(new V3(-16, 0, 14)), DANCE), look: DANCE.clone().setY(10) };
  { const at = local(L.ale, 12 * SC, 12 * SC), mid = local(L.ale, 0, 0).setY(16); W.spots.aleSide = { at, yaw: yawTo(at, mid), look: mid }; }      // (by the ale, out to one side of it: Master Ferrier with his pot)
  if (!on) return { actions: () => [] };
  // ── The fair's own people, at their places.
  const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}, figs = {};
  for (const D of EXTRA) {
    const s = D.stall && STALLS.find(x => x.id === D.stall), at = s ? W.spots['stall_' + s.id].at.clone() : D.by ? local(L[D.by[0]], D.by[1], D.by[2]) : D.at.clone(), face = s ? W.spots['before_' + s.id].at.clone() : D.faceTo ? local(L[D.faceTo], 0, 0) : D.face;
    const look = D.rig === 'gerda' ? Object.assign({}, looks.gerda, { outfit: 'Fine' }) : (looks[D.rig] || {});      // (her mother in her good dress, for the fair)
    const rig = T.make(D.rig, look), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, D.key) });
    motion.warp(at, yawTo(at, face)); rig.root.position.copy(at); rig.root.rotation.y = motion.yaw;
    P.addFigure(D.key, { rig, motion, cast: { name: D.name, voice: D.voice, tint: D.tint, bg: D.bg } }); figs[D.key] = { rig, motion, D };
    P.tick(dt => { motion.update(dt, null); rig.tick(dt); });
    if (!s) W.obstacles.push({ x: at.x, z: at.z, r: 3 });
  }
  { const C = F.pieces.cart, A = figs.carrierAmos; if (C && A) cartComes(P, w, C.g, A.motion, F, W); }      // (the trinket cart, from late morning)
  // (come out of the cottage with the flowers: her mother some way along already, on her way to her stall)
  if (w.fairWalk && figs.mother) { w.fairWalk = false; const f = figs.mother, home = W.entries && W.entries.home, st = W.spots.stall_flowers;
    if (home && st) { const from = new V3(home.at[0], 0, home.at[1]), at = P.collide(from.clone().lerp(st.at, 0.35), 3); f.motion.warp(at, yawTo(at, st.at)); f.rig.root.position.copy(at);
      const b = bucketItem(T); P.stage.scene.add(b.obj); f.motion.hold(b, 'hang');      // (the other bucket, in her hand; set down by the trestle as she gets there)
      f.motion.goTo(st.at.clone(), yawTo(st.at, W.spots.before_flowers.at)).then(() => { f.motion.drop(); b.obj.position.copy(local(L.flowers, -6 * SC, -4 * SC)); b.obj.rotation.set(0, 0, 0); }); } }
  // (the Miller's bow arm, sawing, while the fair's on)
  { const f = figs.miller; if (f) { let t = 0; f.motion.reach('L', () => f.rig.root.position.clone().add(new V3(Math.sin(f.motion.yaw) * 3 - Math.cos(f.motion.yaw) * 2, 15, Math.cos(f.motion.yaw) * 3 + Math.sin(f.motion.yaw) * 2)));
    f.motion.reach('R', () => { const s = Math.sin(t * 4) * 2.2, fw = new V3(Math.sin(f.motion.yaw), 0, Math.cos(f.motion.yaw)), sd = new V3(fw.z, 0, -fw.x); return f.rig.root.position.clone().addScaledVector(fw, 4).addScaledVector(sd, -1 + s).setY(14); });
    P.tick(dt => { t += dt; }); } }
  // ── A word with any of them: the dress, the first time they see her in it; an errand, asked or given; else their own word for the day.
  const talking = { busy: false };
  function actions() {
    if (P.busy || talking.busy) return [];
    const out = [];
    const fl = P.motion.carry && P.motion.carry.kind === 'flowers', mo = figs.mother;
    if (fl && mo) out.push({ label: 'Give Mama the flowers', at: mo.motion.pos.clone().setY(16), run: async () => { talking.busy = true;      // (the bucket she carried down, set by the trestle; the flowers errand seen to with it)
      try { const m = P.motion; await m.face(yawTo(m.pos, mo.motion.pos)); mo.motion.face(yawTo(mo.motion.pos, m.pos)); await P.converse(S.fairMorning('given'), { shot: ['red', 'mother'] });
        const it = m.drop(); if (it) { const at = local(L.flowers, -9 * SC, -4 * SC); it.obj.position.copy(at); it.obj.rotation.set(0, 0, 0); }
        fchange(w, s => { s.asked.flowers = true; s.done.flowers = true; }); w.refresh(); } finally { talking.busy = false; } } });
    for (const k in figs) { if (k === 'mother' && fl) continue; const f = figs[k]; out.push({ label: 'Talk to ' + (k === 'mother' ? 'Mama' : f.D.name), at: f.motion.pos.clone().setY(16), run: async () => { talking.busy = true;
      try { const m = P.motion; await m.face(yawTo(m.pos, f.motion.pos)); f.motion.face(yawTo(f.motion.pos, m.pos)); if (!(await talk(P, w, k))) await P.converse(S.fairTalk(k, { day: w.cal.day, minute: w.cal.minute }), { shot: ['red', k] }); f.motion.face(yawTo(f.motion.pos, f.D.face || new V3(f.motion.pos.x, 0, ROW_Z + 20))); }
      finally { talking.busy = false; } } }); }
    return out;
  }
  W.more = W.more || []; W.more.push(actions);
  ewe(P, w); kissWatch(P, w);
  return { actions, figs };
}
// A villager's place on fair day: everyone at the fair, from when it opens till ten (null before it, and after: in their doors).
function station(w, key, min) {
  if (!root.Fair || !root.Fair.isFair(w)) return undefined;
  if (min < OPEN || min >= ENDS) return key === 'willie' && min >= ENDS ? undefined : null;      // (the Watchman's round, after: his own)
  const late = min >= H('19:00');
  switch (key) {
    case 'pennock': return { stand: 'stall_ginger' };
    case 'baker': return min < H('15:00') ? { stand: 'beside_ginger' } : { wander: true };
    case 'abney': return { stand: 'pour_ale' };
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

// ── Fair morning, in the cottage: before dawn, Little Red up and sat on her bed in her chemise and drawers, too excited to sleep; her mother out
// already, cutting the stall's flowers. The dress, finished in the night, folded over the back of her mother's chair; two buckets of blooms
// by the door. She may look at both, and wash at the dresser (not go out: not like that); and once she has, her mother comes in with a basket,
// and she's dressed (buttoned up the back), turned round, admired; and the two of them have a quiet word. Then the plan, and breakfast; and
// out of the door, a bucket in her hands, her mother gone on ahead to her stall.
const ARRIVE = H('06:30');      // (her mother in from the garden, done with the flowers)
const morningDue = w => !!(root.Fair && root.Fair.isFair(w)) && (w.save.state.flags || {})['fair-morning'] !== w.cal.day;
// (a bucket of cut flowers: a wooden pail, stems and blooms standing out of it)
function bucket(T) {
  const g = new THREE.Group(), wood = T.mat('#8a6a42'), stem = T.mat('#4e7a36'), cols = ['#f0a0b8', '#fbf6ec', '#e05a6a', '#f4d060', '#c8a0e0'];
  const m = (geo, mat, x, y, z, ink) => { const k = new THREE.Mesh(geo, mat); k.position.set(x, y, z); k.castShadow = true; if (ink) k.add(new THREE.Mesh(T.hullGeo(geo, ink), T.INKM[0])); g.add(k); return k; };
  m(new THREE.CylinderGeometry(1.9, 1.5, 3.6, 12, 1, true), wood, 0, 1.8, 0, 0.05).material.side = THREE.DoubleSide; m(new THREE.CircleGeometry(1.5, 12).rotateX(-Math.PI / 2), wood, 0, 0.1, 0);
  m(new THREE.TorusGeometry(1.95, 0.12, 4, 14).rotateX(Math.PI / 2), T.mat('#3a3634'), 0, 2.9, 0);
  for (let k = 0; k < 11; k++) { const a = k * 2.4, r = 0.4 + (k % 3) * 0.45, x = Math.cos(a) * r, z = Math.sin(a) * r, h = 4.6 + (k % 4) * 0.7;
    const st = m(new THREE.CylinderGeometry(0.08, 0.08, h - 1, 4), stem, x * 1.2, (h + 1) / 2, z * 1.2); st.rotation.set(z * 0.18, 0, -x * 0.18);
    m(new THREE.SphereGeometry(0.55 + (k % 2) * 0.15, 7, 5), T.mat(cols[k % cols.length]), x * 1.5, h + 0.3, z * 1.5, 0.03); }
  return g;
}
const bucketItem = T => ({ obj: bucket(T), name: 'the flowers', kind: 'flowers', grip: new V3(0, 3.6, 0), hangs: true, radius: 2.2, keep: true });
// (the dress, folded over a chair's back: blue, its white collar showing)
function folded(T) {
  const g = new THREE.Group(), blue = T.mat('#6f90c4'), m = (geo, mat, x, y, z, ink) => { const k = new THREE.Mesh(geo, mat); k.position.set(x, y, z); k.castShadow = true; if (ink) k.add(new THREE.Mesh(T.hullGeo(geo, ink), T.INKM[0])); g.add(k); return k; };
  m(new THREE.BoxGeometry(5.6, 0.7, 2.2), blue, 0, 0, 0, 0.04);      // (over the top rail)
  for (const s of [-1, 1]) m(new THREE.BoxGeometry(5.4, 5.5, 0.5), blue, 0, -2.6, s * 1.1, 0.04).rotation.x = s * 0.08;      // (hanging down either side)
  m(new THREE.BoxGeometry(2.6, 0.5, 2.3), T.mat('#fbf8f2'), -1.2, 0.5, 0, 0.03);      // (the collar, folded on top)
  return g;
}
// (her basket back on its peg, if she has it: the cottage's own, put back where it hangs)
function rehang(P) {
  const c = P.motion.carry; if (!c) return; P.motion.drop();
  if (c.peg) { c.obj.position.copy(c.peg.at).sub(c.grip); c.obj.rotation.set(0, 0, 0); c.peg.item = c; c.away = false; if (!P.world.items.includes(c)) P.world.items.push(c); }
  else P.stage.scene.remove(c.obj);
}
// Set the room for it, as it's built (world.js's begin): Red on her bed in her shift; the dress and the buckets; her mother out.
function wake(P, w) {
  const T = root.Toon, W = P.world, sc = P.stage.scene; w.fairMaren = 'out';
  rehang(P); if (W.marenBasket) W.marenBasket.visible = false;
  w.save.change(x => { if (x.chores) x.chores.bag = null; });      // (nor set by to be taken up again as she stands (js/chores.js's takeUp): it's on its peg, and stays there)      // (her basket on its peg, her hands empty; her mother's gone from the peg beside it: she's out with it)
  if (P.setGown) P.setGown({ kind: 'undressed' }); if (P.setDress) P.setDress({ skirt: 'off' });
  const bed = W.seats.find(s => s.kind === 'bed'); if (bed) P.seatNow(bed);
  // (her mother's chair, by the hearth, as it is when she sits at her needlework; the dress over the top rail of its back; not to sit on, with it there)
  if (W.moveChair) W.moveChair('hearth');
  const ch = W.seats.find(s => s.kind === 'chair'), f = ch ? new V3(Math.sin(ch.facing), 0, Math.cos(ch.facing)) : new V3(0, 0, 1);
  const back = ch ? ch.at.clone().setY(0).addScaledVector(f, -1.8 - 2.75).setY(ch.at.y + 10.7 + 0.35) : new V3(-20, 15, -28);      // (js/toon.js's makeChair: the back's top rail, 2.75 behind the chair's middle, 10.7 over the seat)
  const dress = folded(T); dress.position.copy(back); dress.rotation.y = ch ? ch.facing : 0; sc.add(dress); if (ch) ch.noSit = true;
  const pails = [new V3(-50, 0, 21), new V3(-45.5, 0, 19.5)].map(p => { const b = bucket(T); b.position.copy(p); sc.add(b); W.obstacles.push({ x: p.x, z: p.z, r: 2.4 }); return b; });
  w.fairMorningSet = { dress, pails, seen: {} };
}
async function morning(P, w) {
  const S = root.Story, W = P.world, m = P.motion, set = w.fairMorningSet; if (!set) return;
  await P.wait(0.6); await P.converse(S.fairMorning('wake'), { shot: false, keepCamera: true });
  const thought = async k => { await P.converse(S.fairMorning(k), { shot: false, keepCamera: true }); };
  const acts = [
    { label: 'Look at the dress', get at() { return set.dress.position.clone(); }, when: () => !P.busy, run: async () => {
      if (P.sitting) await P.getUp(); const at = set.dress.position.clone(), to = P.collide(at.clone().setY(0).add(new V3(0, 0, 8)), 3.2); await m.goTo(to, Math.atan2(at.x - to.x, at.z - to.z));
      m.lookAt(at); await m.reach('R', at.clone().add(new V3(0, 0.4, 1))); await P.wait(0.8); await thought('dress'); await m.release('R'); m.lookAt(null); set.seen.dress = true; w.cal.advance(3); } },
    { label: 'Look at the flowers', get at() { return set.pails[0].position.clone().setY(4); }, when: () => !P.busy, run: async () => {
      if (P.sitting) await P.getUp(); const at = set.pails[0].position.clone().lerp(set.pails[1].position, 0.5), to = P.collide(at.clone().add(new V3(7, 0, 4)), 3.2); await m.goTo(to, Math.atan2(at.x - to.x, at.z - to.z));
      m.lookAt(at.clone().setY(4)); await thought('flowers'); m.lookAt(null); set.seen.flowers = true; w.cal.advance(3); } },
    { label: 'Wash at the dresser', get at() { return W.basin ? W.basin.at.clone() : m.pos.clone(); }, when: () => !P.busy && !!W.basin, run: async () => {
      const B = W.basin; if (P.sitting) await P.getUp(); await m.goTo(P.collide(B.stand.clone().setY(0), 3.2), B.facing);
      for (let k = 0; k < 3; k++) { m.reach('L', B.at.clone().add(new V3(0, -0.6 + k * 0.2, 0))); await m.reach('R', B.at.clone().add(new V3(0.6, -0.4, 0))); await P.wait(0.4); m.release('L'); await m.release('R'); }
      await thought('wash'); set.seen.wash = true; w.cal.advance(5); } },
  ];
  // (nothing else of the day's to do in the cottage meanwhile: no loaf into a basket, no basket off its peg, no cloak on over her shift, and a wash only the once)
  W.hold = o => /loaf|basket|cloak/i.test(o.label) || (o.label === 'Wash at the dresser' && set.seen.wash);
  W.actions = (W.actions || []).concat(acts.map(a => Object.assign(a, { when: (wh => () => wh() && !a.gone && !(a.label === 'Wash at the dresser' && set.seen.wash))(a.when) })));
  set.acts = acts; set.guard = () => { const t = S.fairMorning('door')[0]; if (P.talk && t) P.talk.muse(t.text, { face: t.face }); return Promise.resolve(); };      // (the door: not out in her shift; a passing thought, as when she forgets her basket, the camera left where it is)
  w.refresh();
  // (the time till her mother's in, hers to pass: sat on a stool, or back on her bed once she's up, or lying down again, each a longer thought,
  // once, and the clock on with it; at half past six, in her mother comes, whatever she's at)
  const think = (k, mins) => P.act(async () => { set.said[k] = true; await thought(k); w.cal.advance(mins); });
  set.said = {}; let wasUp = false;
  set.watch = P.tick(() => {
    if (!P.sitting) wasUp = true;
    if (P.busy || (P.talk && P.talk.playing)) return;
    if (w.cal.minute >= ARRIVE) { set.watch(); for (const x of acts) x.gone = true; set.guard = null; W.hold = null;
      const how = { washed: !!set.seen.wash, abed: !!P.lying }; P.act(() => dressed(P, w, how)); return; }
    const st = P.sitting && P.sitting.kind;
    if (P.lying && !set.said.lie) think('lie', 10);
    else if (st === 'stool' && !set.said.stool) think('stool', 8);
    else if (st === 'bed' && wasUp && !P.lying && !set.said.bed) think('bed', 8);
  });
}
const morningObjective = w => w.fairMorningSet && w.fairMorningSet.acts && !w.fairMorningSet.acts[0].gone ? 'Up, and ready for the fair: wash, and wait for Mama.' : null;
// (her mother in, with her basket; and the dress)
async function dressed(P, w, how) {
  how = how || { washed: true, abed: false };
  const S = root.Story, W = P.world, m = P.motion, set = w.fairMorningSet;
  w.fairMaren = 'in'; await P.wait(0.2);
  const mm = P.npcMotion; for (let k = 0; k < 60 && (!mm || P.npcMoving || P.npcAway); k++) await P.wait(0.1);      // (in by the door, and over to where she stands)
  const mb = W.marenBasket; let held = null;      // (her own basket, the one gone from the peg)
  if (mm && mb) { mb.visible = true; held = { obj: mb, name: 'her basket', grip: new V3(0, 6.5, 0), radius: 3.4, hangs: true, home: { pos: mb.position.clone(), rot: mb.rotation.y } }; mm.hold(held, 'hang'); }
  if (P.sitting || P.lying) {      // (sat or lying: her mother comes over to her, and she gets up after)
    if (mm) { const to = P.collide(P.motion.pos.clone().add(new V3(Math.sin(P.motion.yaw) * 12, 0, Math.cos(P.motion.yaw) * 12)), 3.4); await Promise.race([mm.goTo(to, yawTo(to, P.motion.pos)), P.wait(6)]); mm.auto = null; mm.face(yawTo(mm.pos, P.motion.pos)); }
    await P.converse(S.fairMorning(how.abed ? 'inAbed' : 'in', how), { shot: ['red', 'mother'] }); await P.getUp(); }
  else { await P.approach(); await P.converse(S.fairMorning(how.abed ? 'inAbed' : 'in', how), { shot: ['red', 'mother'] }); }      // (what she finds: up or still abed, washed or not; fondly, whichever)
  // (into the dress, under a fade: stood in the middle of the room, her mother behind her at the buttons)
  await w.fade(true);
  if (held) { mm.drop(); held.obj.position.copy(held.home.pos); held.obj.rotation.set(0, held.home.rot, 0); held.obj.visible = false; }      // (set by: she'll take it with her to the stall, so not on its peg today)
  rehang(P);
  P.stage.scene.remove(set.dress); { const ch = W.seats.find(s => s.kind === 'chair'); if (ch) ch.noSit = false; }
  if (P.setDress) P.setDress({ skirt: 'down' }); if (P.setGown) P.setGown(root.Fair.gown(w));
  const Q = P.motion, red = P.collide(new V3(2, 0, 6), 3.4), yaw = Math.PI * 0.75, f = new V3(Math.sin(yaw), 0, Math.cos(yaw)), mam = red.clone().addScaledVector(f, -5);
  Q.warp(red, yaw); P.rig.root.position.copy(red); if (mm) mm.warp(mam, yaw);
  for (let i = 0; i < 20; i++) P.frame(1 / 60);
  await P.wait(0.3); await w.fade(false);
  let on = true; const btn = (async () => { let k = 0; while (on && mm) { const up = P.rig.root.localToWorld(new V3(0, 19 + (k % 6) * 0.9, -1.4)); await mm.reach(k % 2 ? 'R' : 'L', up); await P.wait(0.5); await mm.release(k % 2 ? 'R' : 'L'); k++; } })();
  await P.converse(S.fairMorning('buttons'), { shot: false, keepCamera: true });
  on = false; await btn;
  // (turned round to face her; and a spin, before she can help it)
  await Q.face(yaw + Math.PI); if (mm) mm.face(yawTo(mm.pos, Q.pos));
  await P.converse(S.fairMorning('look'), { shot: ['red', 'mother'] });
  for (const k of [1, 2, 3]) await Q.face(yaw + Math.PI + k * Math.PI * 2 / 3 * 1.0);
  await Q.face(yaw + Math.PI);
  await P.converse(S.fairMorning('spin'), { shot: ['red', 'mother'] });
  // (her hand to her cheek)
  if (mm) { await mm.reach('R', () => P.rig.headGroup.getWorldPosition(new V3()).add(new V3(Math.sin(Q.yaw) * 1.2, 0.2, Math.cos(Q.yaw) * 1.2))); }
  await P.converse(S.fairMorning('cheek'), { shot: ['red', 'mother'] });
  if (mm) await mm.release('R');
  if (P.rig.setExpr) P.rig.setExpr('smile'); await P.wait(1.6);      // (a quiet moment, smiling at each other)
  await P.converse(S.fairMorning('plan'), { shot: ['red', 'mother'] });
  // (breakfast; then out of her door, a bucket in her hands, her mother gone on ahead)
  await w.fade(true);
  for (const b of set.pails) P.stage.scene.remove(b);
  w.save.flag('fair-morning', w.cal.day); w.fairMorningSet = null; w.fairMaren = null;
  w.save.change(s => { s.minute = Math.max(s.minute, H('07:30')); }, { time: true });
  w.fairWalk = true;      // (her mother on her way to the stall as Red comes out: js/fairday.js's attach)
  await w.go('village', 'home');
  const P2 = w.P; if (P2 && P2.motion) { const b = bucketItem(root.Toon); P2.stage.scene.add(b.obj); P2.motion.hold(b, 'hang'); }
}
// ── The day's errands: asked by someone, fetched from somewhere (into her basket), and given to whoever asked. Her mother's and Grandmother's
// come as the day goes on, and aren't hers to refuse; the traders' favours she may turn down (each wants something of her, and some a risky
// way to it). { id, who (asks, and is given it), from (the minute it's asked from, at the soonest), item (in her basket), area (where it's
// fetched), label (there), must (not to be refused) }
const ERR = [
  { id: 'flowers', who: 'mother', from: H('08:30'), item: 'the cut flowers', area: 'village', label: 'Cut flowers for Mama’s stall', must: true },
  { id: 'purse', who: 'mother', from: H('11:00'), item: 'Mama’s purse', area: 'home', label: 'Take Mama’s purse', must: true },
  { id: 'dinner', who: 'mother', from: H('12:30'), item: 'Mama’s dinner', area: 'home', label: 'Take Mama’s bread and cheese', must: true },
  { id: 'yarrow', who: 'gran', from: H('13:30'), item: 'the yarrow', area: 'wood', label: 'Pick yarrow for Grandmother', must: true },
  { id: 'hooks', who: 'smith', from: H('09:00'), item: 'the stall hooks', area: 'forge', label: 'Take the stall hooks off the bench' },
  { id: 'ewe', who: 'bo', from: H('10:00'), area: 'village', label: 'Lead the ewe back to the pens' },
  { id: 'fairing', who: 'thatcherWife', from: H('10:00'), item: 'a ribbon for Bess', area: 'inn', label: 'Give Bess her fairing', given: true },      // (given: she has it as she's asked)
];
const fstate = w => { const s = w.save.state.fairday; if (s && s.day === w.cal.day) return s; return (w.save.state.fairday = { day: w.cal.day, asked: {}, have: {}, done: {}, no: {} }); };
const fchange = (w, fn) => w.save.change(s => { fstate(w); fn(s.fairday); }, { fairday: true });
const bag = P => root.Chores && root.Chores.basketOf(P);
function giveItem(P, w, e) { const b = bag(P); if (b) root.Chores.putIn(b, e.item); fchange(w, s => { s.have[e.id] = true; }); w.refresh(); }
function takeItem(P, w, e) { const b = bag(P); if (b) root.Chores.takeOut(b, e.item); fchange(w, s => { s.done[e.id] = true; s.have[e.id] = false; }); w.refresh(); }
// (what someone has to say, errands first: something to give them; something to ask)
async function talk(P, w, key) {
  if (!root.Fair || !root.Fair.isFair(w)) return false;
  const S = root.Story, st = fstate(w), min = w.cal.minute, shot = { shot: ['red', key] };
  // (the first time each of them sees her in the dress: a word about it, before anything else they've to say)
  let said = false; const dress = S.fairDress && !(st.dress || {})[key] ? S.fairDress(key, dressCtx(w, key)) : [];
  if (dress.length) { await P.converse(dress, shot); fchange(w, s => { s.dress = Object.assign({}, s.dress, { [key]: true }); }); said = true; }
  if (said && key === 'peter' && !dressCtx(w, key).easy) return true;      // (undone by it: off to see about something of Grandad's; he'll ask her to dance when he's himself again)
  if (key === 'peter' && min >= DANCE_FROM && !st.danceAsked && !st.kissed) { await dance(P, w, P.villagers && P.villagers.here('peter')); return true; }      // (the dancing: he asks her)
  const give = ERR.find(e => e.who === key && st.have[e.id] && !st.done[e.id] && e.item);
  if (give && key !== 'thatcherWife') { await P.converse(S.fairGive(give.id), shot); takeItem(P, w, give); w.rep.trusts(key === 'mother' || key === 'gran' ? (key === 'gran' ? 'hulda' : 'maren') : key, 0.5); return true; }
  const ask = ERR.find(e => e.who === key && !st.asked[e.id] && !st.done[e.id] && min >= e.from && !(e.id === 'dinner' && !st.done.purse));
  if (ask) { let yes = !!ask.must;
    await P.converse(S.fairAsk(ask.id, { yes: () => { yes = true; } }), shot);
    fchange(w, s => { s.asked[ask.id] = true; if (!yes) s.no[ask.id] = true; });
    if (yes && ask.given) giveItem(P, w, ask);
    w.refresh(); return true; }
  return said;
}
// (what they know of her: told what being Little Red means (Bess: her mother has been, with her watching); Master William's caught her once;
// Peter, easy with her)
function dressCtx(w, key) {
  const rep = w.rep, open = k => !!(rep && rep.openness && rep.openness(k) >= 1);
  return { open: key === 'bess' ? open('abney') : open(key), caught: !!(w.q && w.q.done && w.q.done('willie.first')), easy: ((w.save.state.trust || {}).peter || 0) >= 3, frockTold: !!(w.save.state.flags || {})['bess-frock'] };
}
// (where each is fetched, in the place she's in: an action there, while it's asked and not yet had)
function area(P, w, name) {
  if (!root.Fair || !root.Fair.isFair(w)) return;
  const W = P.world, st = () => fstate(w), open = e => st().asked[e.id] && !st().no[e.id] && !st().have[e.id] && !st().done[e.id];
  const act = (e, at, run) => ({ label: e.label, at, run, when: () => open(e) && !P.busy });
  const list = (W.actions = W.actions || []);
  if (name === 'home') {
    const ch = W.chest, tb = W.surfaces.find(s => s.name === 'the table');
    if (ch) list.push(act(ERR[1], ch.front.clone().setY(8), async () => { await P.useChest(); await P.wait(0.4); await P.useChest(); giveItem(P, w, ERR[1]); }));
    if (tb) list.push(act(ERR[2], new V3((tb.x0 + tb.x1) / 2, tb.y + 2, (tb.z0 + tb.z1) / 2), async () => { giveItem(P, w, ERR[2]); if (P.talk) P.talk.muse('Bread and cheese, wrapped in a cloth. And the last of the cider, in the little jug.', { face: 'smile' }); }));
    if (P.npcGo) P.npcGo(true, null);      // (her mother at her stall all day)
  }
  if (name === 'village' && root.Garden) { const G = root.Garden, r = G.ROWS.find(q => q.id === 'maids'), at = new V3((G.RX0 + G.RX1) / 2, 3, r.z);
    list.push(act(ERR[0], at, async () => { await P.motion.goTo(P.collide(new V3(at.x, 0, r.stand), 3.2), Math.PI); for (let k = 0; k < 3; k++) { await P.motion.reach('R', at.clone().add(new V3((k - 1) * 3, -1, 0))); await P.wait(0.3); await P.motion.release('R'); } giveItem(P, w, ERR[0]); })); }      // (from the path beside the maids)
  if (name === 'forge') { const at = new V3(26, 9, -26); list.push(act(ERR[4], at, async () => { await P.motion.goTo(P.collide(new V3(26, 0, -18), 3.2), Math.PI); giveItem(P, w, ERR[4]); })); }
  if (name === 'wood' && W.herbs && W.herbs.yarrow) list.push(act(ERR[3], W.herbs.yarrow.clone().setY(2), async () => { await P.motion.goTo(P.collide(W.herbs.yarrow.clone().add(new V3(4, 0, 3)), 3.2), null); await P.motion.reach('R', W.herbs.yarrow.clone().setY(1)); await P.motion.release('R'); giveItem(P, w, ERR[3]); }));
  if (name === 'inn') {
    if (P.npcGo) P.npcGo(true, null);      // (Mistress Abney at her ale stall, on the green)
    list.push({ label: ERR[6].label, get at() { const f = P.figure('bess'); return f ? f.motion.pos.clone().setY(14) : (W.bessChair ? W.bessChair.at.clone() : new V3()); },
      when: () => st().have.fairing && !st().done.fairing && !P.busy, run: async () => { const S = root.Story; await P.converse(S.fairGive('fairing'), { shot: ['red', 'bess'] });
        if (!(st().dress || {}).bess) { await P.converse(S.fairDress('bess', dressCtx(w, 'bess')), { shot: ['red', 'bess'] }); fchange(w, s => { s.dress = Object.assign({}, s.dress, { bess: true }); }); }
        if (root.Fair.frockDue(w)) { await P.converse(S.bessFrock(), { shot: ['red', 'bess'] }); w.save.flag('bess-frock', w.cal.day); }
        takeItem(P, w, ERR[6]); w.rep.trusts('bess', 1); } });
  }
  watch(P, w, name);
}
// ── The dress, as she goes: the earth of a bed she cuts across (her mother's garden: the beds, not the paths); the forge's soot, by its
// hearth; the pond's edge, wet. Each once, where it happens (and seen on her straight away).
function watch(P, w, name) {
  const G = root.Garden, m = P.motion, been = {}; let since = 0;
  const mark = (k, kind, n, thought) => { if (been[k]) return; been[k] = true; root.Fair.spoil(w, kind, n); if (P.setGown) P.setGown(root.Fair.gown(w)); if (P.talk) P.talk.muse(thought, { face: 'wince' }); };
  P.tick(dt => {
    if ((since += dt) < 0.2) return; since = 0; const p = m.pos;
    if (name === 'village' && G && G.inside(p) && !m.auto) { const r = G.ROWS.find(q => Math.abs(p.z - q.z) < 3 && p.x > G.RX0 && p.x < G.RX1); if (r) mark('bed-' + r.id, 'earth', 0.25, 'Earth on my hem. In the blue. Oh, no.'); }
    if (name === 'village' && P.world.spots.pondSide) { const c = P.world.spots.pondSide.look; if (Math.hypot(p.x - c.x, p.z - c.z) < 21) mark('pond', 'wet', 0.4, 'The hem’s in the pond. Wet through, and green with it.'); }
    if (name === 'forge' && Math.hypot(p.x + 26, p.z + 12) < 15) mark('soot', 'soot', 0.4, 'Soot. All up the skirt. Mama said, cinders.');
  });
}
// ── The ewe: out of the pens and into her mother's cabbages; Bo's to mind the rest. Led back by the paths, it's clean; across the beds, earth.
function ewe(P, w) {
  if (!root.Fair || !root.Fair.isFair(w)) return null;
  const st = fstate(w); if (!st.asked.ewe || st.no.ewe || st.done.ewe) return null;
  const T = root.Toon, g = new THREE.Group(), wool = T.mat('#f2ece0'), face = T.mat('#3a3430');
  const body = new THREE.Mesh(T.ell(3.4, 2.6, 4.6, 10, 8), wool); body.position.y = 4; body.add(new THREE.Mesh(T.hullGeo(body.geometry, 0.08), T.INKM[0])); g.add(body);
  const head = new THREE.Mesh(T.ell(1.2, 1.4, 1.8, 8, 6), face); head.position.set(0, 5, 4.6); g.add(head);
  for (const [x, z] of [[-1.6, 2.4], [1.6, 2.4], [-1.6, -2.4], [1.6, -2.4]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 3.4, 6), face); l.position.set(x, 1.7, z); g.add(l); }
  const at = new V3(-300, 0, -420); g.position.copy(at); g.rotation.y = 1.2; P.stage.scene.add(g);
  const W = P.world; (W.actions = W.actions || []).push({ label: ERR[5].label, get at() { return g.position.clone().setY(6); }, when: () => !fstate(w).done.ewe && !P.busy,
    run: async () => { const S = root.Story; await P.converse(S.fairEwe(), { shot: false, keepCamera: true }); await w.fade(true); g.visible = false; fchange(w, s => { s.done.ewe = true; }); w.cal.advance(15); await w.fade(false); w.rep.trusts('bo', 1); if (P.talk) P.talk.muse('Back in the pen, and Bo’s face. She looked at me like I’d hung the moon.', { face: 'smile' }); w.refresh(); } });
  return g;
}
// ── The dancing, from seven: Peter asks her (shy, or easy, as he trusts her), and the two of them go round to the Miller's fiddle in the middle
// of the green; and in the middle of it, Georgie catches Agnes by the shoulders and kisses her, there in front of everyone. She cries; Tom and
// the lads come roaring; and Georgie runs, down the mill lane, and leaves her standing. (If Red's not dancing, it happens all the same, by half
// past eight, if she's near enough to see it.) Agnes and Georgie's line: docs/quest-plan.md.
const DANCE_FROM = H('19:00'), KISS_BY = H('20:30');
async function dance(P, w, f) {
  const S = root.Story, m = P.motion, peter = f, trust = (w.save.state.trust || {}).peter || 0, easy = trust >= 3;
  let yes = false;
  await P.converse(S.fairDanceAsk(easy, { yes: () => { yes = true; } }), { shot: ['red', 'peter'] });
  fchange(w, s => { s.danceAsked = true; });
  if (!yes) return;
  // (into the middle, under a fade: hands joined, going round)
  await w.fade(true);
  const V = P.villagers, c = DANCE.clone(); if (V) V.summon('peter', 'dance');
  let t = 0, on = true; const r = 4.5, spin = P.tick(dt => { if (!on) return; t += dt * 0.6; const a = t, me = c.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r)), him = c.clone().add(new V3(-Math.cos(a) * r, 0, -Math.sin(a) * r));
    m.warp(me, yawTo(me, him)); P.rig.root.position.copy(me); if (peter) { peter.motion.warp(him, yawTo(him, me)); peter.rig.root.position.copy(him); } });
  m.reach('L', () => m.pos.clone().lerp(peter ? peter.motion.pos : m.pos, 0.5).setY(11)); if (peter) peter.motion.reach('R', () => peter.motion.pos.clone().lerp(m.pos, 0.5).setY(11));
  P.camHeld = true; P.stage.go(c.clone().add(new V3(6, 24, -34)), c.clone().setY(8), 0);      // (from the stalls' side, over the dancers: the watchers stand round the other edges)
  await P.wait(0.4); await w.fade(false);
  await P.converse(S.fairDance(easy), { shot: false, keepCamera: true });
  fchange(w, s => { s.danced = true; }); w.rep.trusts('peter', easy ? 1 : 1.5);
  await kiss(P, w, () => { on = false; if (spin) spin(); m.release('L'); if (peter) peter.motion.release('R'); });
  P.camHeld = false; if (V) V.letGo('peter');
}
async function kiss(P, w, stop) {
  const S = root.Story, V = P.villagers; if (!V || fstate(w).kissed) { if (stop) stop(); return; }
  fchange(w, s => { s.kissed = true; }); w.save.flag('fair-kiss', w.cal.day); if (w.q.stateOf('agnes.kiss') === 'offered') w.complete('agnes.kiss');
  const ag = V.summon('agnes', 'danceEdge'), ge = V.summon('georgie', 'danceEdge'), tom = V.summon('tom', 'danceEdge2');
  const at = DANCE.clone().add(new V3(12, 0, -6)); ag.motion.warp(at, yawTo(at, DANCE)); ag.rig.root.position.copy(at);
  const gat = at.clone().add(new V3(9, 0, 4)); ge.motion.warp(gat, yawTo(gat, at)); ge.rig.root.position.copy(gat);
  await P.converse(S.fairKiss(0), { shot: false, keepCamera: true });
  if (stop) stop();
  // (he goes to her, and has her by the shoulders before she knows it)
  await Promise.race([V.walkTo('georgie', at.clone().add(new V3(3.2, 0, 1.4)), yawTo(at.clone().add(new V3(3.2, 0, 1.4)), at), 1.4), P.wait(4)]);
  ag.motion.face(yawTo(ag.motion.pos, ge.motion.pos)); ge.motion.reach('L', ag.rig.root.position.clone().add(new V3(0.6, 14, -1))); ge.motion.reach('R', ag.rig.root.position.clone().add(new V3(0.6, 14, 1)));
  await P.wait(0.8); ag.rig.setExpr('surprised');
  await P.converse(S.fairKiss(1), { shot: ['agnes', 'georgie'] });
  ag.rig.setExpr('crying', 6); ge.motion.release('L'); ge.motion.release('R');
  // (Tom and the lads, roaring; and Georgie gone, down the mill lane)
  const tAt = at.clone().add(new V3(-10, 0, 10)); await Promise.race([V.walkTo('tom', tAt, yawTo(tAt, ge.motion.pos), 1.3), P.wait(4)]);
  await P.converse(S.fairKiss(2), { shot: ['tom', 'georgie'] });
  const away = P.world.spots.millGate ? P.world.spots.millGate.at.clone() : at.clone().add(new V3(80, 0, 60)); V.walkTo('georgie', away, null, 1.8); await P.wait(2.5);
  V.letGo('georgie', true);
  await P.converse(S.fairKiss(3), { shot: ['red', 'agnes'] });
  V.letGo('agnes'); V.letGo('tom');
  w.refresh();
}
// (not dancing, but near: it happens all the same, by half past eight)
function kissWatch(P, w) {
  let since = 0; P.tick(dt => { if ((since += dt) < 1) return; since = 0;
    if (!root.Fair.isFair(w) || fstate(w).kissed || w.cal.minute < KISS_BY || P.busy) return;
    if (P.motion.pos.distanceTo(DANCE) > 70) return;
    P.act(() => kiss(P, w)); });
}
// What's hers to do today, for the objectives.
function objectives(w) {
  if (!root.Fair || !root.Fair.isFair(w)) return [];
  { const mo = morningObjective(w); if (mo) return [mo]; }      // (the morning, in the cottage: nothing else yet)
  const st = fstate(w), out = [], WHO = { mother: 'Mama', gran: 'Grandmother', smith: 'Master Ferrier', bo: 'Bo', thatcherWife: 'Mistress Thatcher' };
  if (w.P && w.P.motion && w.P.motion.carry && w.P.motion.carry.kind === 'flowers') out.push('Carry the flowers to Mama’s stall.');
  for (const e of ERR) { if (!st.asked[e.id] || st.no[e.id] || st.done[e.id]) continue;
    out.push(e.id === 'ewe' ? 'Bo’s ewe, in Mama’s cabbages: lead it back to the pens.' : e.id === 'fairing' ? 'Take Bess her fairing, at the Wheatsheaf.' : st.have[e.id] ? 'Give ' + WHO[e.who] + ' ' + e.item + '.' : e.label + (e.area === 'home' ? ', at home.' : e.area === 'forge' ? ', in the forge.' : e.area === 'wood' ? ', in the meadow by the wood.' : '.')); }
  return out;
}

// (for the room editor: the village as on fair day, its fair things the pieces to move)
const editor = Object.assign({ PIECES, build(scene) {
  const T = root.Toon, v = root.Village.build(scene); let F = build(T, ROOM.layout()); v.group.add(F.group);
  const out = { group: v.group, pieces: F.pieces, light: t => v.light(t), world: v.world, update() {}, tick() {},
    relayout(L) { v.group.remove(F.group); F = build(T, L); v.group.add(F.group); out.pieces = F.pieces; } };      // (moved: built again where it now stands, its bunting strung to it)
  return out; } }, ROOM);
const api = { morningDue, wake, morning, morningObjective, guard: w => w.fairMorningSet && w.fairMorningSet.guard ? w.fairMorningSet.guard() : null, bucketItem, dressCtx, dance, kiss, attach, station, talk, area, ewe, objectives, ERR, STALLS, DANCE, OPEN, ENDS, editor };
root.FairDay = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
