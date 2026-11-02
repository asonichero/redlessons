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
  { key: 'bo', rig: 'bo', name: 'Bo', voice: 'bo', tint: '#8a5a6a', bg: '#f2e4ea', at: new V3(90, 0, 40), face: new V3(60, 0, 30) },
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
  if (key === 'peter' && min >= DANCE_FROM && !st.danceAsked && !st.kissed) { await dance(P, w, P.villagers && P.villagers.here('peter')); return true; }      // (the dancing: he asks her)
  const give = ERR.find(e => e.who === key && st.have[e.id] && !st.done[e.id] && e.item);
  if (give && key !== 'thatcherWife') { await P.converse(S.fairGive(give.id), shot); takeItem(P, w, give); w.rep.trusts(key === 'mother' || key === 'gran' ? (key === 'gran' ? 'hulda' : 'maren') : key, 0.5); return true; }
  const ask = ERR.find(e => e.who === key && !st.asked[e.id] && !st.done[e.id] && min >= e.from && !(e.id === 'dinner' && !st.done.purse));
  if (ask) { let yes = !!ask.must;
    await P.converse(S.fairAsk(ask.id, { yes: () => { yes = true; } }), shot);
    fchange(w, s => { s.asked[ask.id] = true; if (!yes) s.no[ask.id] = true; });
    if (yes && ask.given) giveItem(P, w, ask);
    w.refresh(); return true; }
  return false;
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
  P.camHeld = true; P.stage.go(c.clone().add(new V3(0, 18, 34)), c.clone().setY(9), 0);
  await P.wait(0.4); await w.fade(false);
  await P.converse(S.fairDance(easy), { shot: false, keepCamera: true });
  fchange(w, s => { s.danced = true; }); w.rep.trusts('peter', easy ? 1 : 1.5);
  await kiss(P, w, () => { on = false; if (spin) spin(); m.release('L'); if (peter) peter.motion.release('R'); });
  P.camHeld = false; if (V) V.letGo('peter');
}
async function kiss(P, w, stop) {
  const S = root.Story, V = P.villagers; if (!V || fstate(w).kissed) { if (stop) stop(); return; }
  fchange(w, s => { s.kissed = true; }); w.save.flag('fair-kiss', w.cal.day);
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
  const st = fstate(w), out = [], WHO = { mother: 'Mama', gran: 'Grandmother', smith: 'Master Ferrier', bo: 'Bo', thatcherWife: 'Mistress Thatcher' };
  for (const e of ERR) { if (!st.asked[e.id] || st.no[e.id] || st.done[e.id]) continue;
    out.push(e.id === 'ewe' ? 'Bo’s ewe, in Mama’s cabbages: lead it back to the pens.' : e.id === 'fairing' ? 'Take Bess her fairing, at the Wheatsheaf.' : st.have[e.id] ? 'Give ' + WHO[e.who] + ' ' + e.item + '.' : e.label + (e.area === 'home' ? ', at home.' : e.area === 'forge' ? ', in the forge.' : e.area === 'wood' ? ', in the meadow by the wood.' : '.')); }
  return out;
}

const api = { dance, kiss, attach, station, talk, area, ewe, objectives, ERR, STALLS, DANCE, FIDDLE, OPEN, ENDS };
root.FairDay = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
