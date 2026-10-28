// Little Red’s Lessons — the days: Mama's garden each morning, and on most days an errand, asked of her over breakfast (docs/quest-plan.md,
// Days and errands). Once the chores are agreed with her mother (the maren.chores step), each morning:
//
//   • Over breakfast her mother says what's been asked of them, if anything, and asks Red if she'll do it. Yes is a promise: it must be begun
//     by its time. An honest no (she can't be anybody's today) costs nothing. A "won't" is wilful; three of those in a week, and her mother
//     gives her a maintenance correction there and then, which sets her right (her wilfulness settled, the count begun again).
//   • The garden's hers every day, any time before dusk (js/garden.js: the weeds, the flowers watered, the vegetables tended); left
//     untended, it's a little broken promise.
//   • An errand's work is done where it's asked for (the well, the bakery, the forge…), and some things are carried home to her mother after.
//     What happens there doesn't spend the day: the clock stops while it plays, and moves on by the work's own time when she's done.
//   • Let the time go by without beginning it, and it's a broken promise (naughty), and she knows it.
//
//   const chores = Chores.create(w)   (w: js/world.js's world)
//   chores.on() · chores.breakfast(P) · chores.answer(id, 'yes' | 'little' | 'wont') · chores.due() · chores.actions(P, area) · chores.tick(P)
//   chores.dress(P) · chores.objective() · chores.journalLine() · chores.gardenDone() · chores.gardenTended()
// The day's state is kept in the save (state.chores): { day, garden, errand: { id, state, by }, refusals: [days], missed }.
// Errand states: 'accepted' (said yes), 'carrying' (begun: something to take home), 'done', 'broken' (not begun in time), 'little' (an honest no),
// 'wont' (a "won't").
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const NONE_ONE_IN = 4, SHIFT_SLACK = 15, CANS = 5;      // (a shift's begun within a quarter of an hour of its time, either side; the garden's butt wants the well again after five cans)
const INTRO = ['eggs', 'pot', 'bakery', 'jug', 'dunns', 'inn', 'well', 'bread'];      // (the first errands, in turn, from the second day: the Fowlers', the forge, the bakery's afternoon, the inn, the Dunns', the inn's evening, the well, the bakery's loaves)
let wicker = null;      // (the cottage's wicker, made once)
const NAME = { bucket: 'the bucket', loaves: 'the loaves', pot: 'the pot', jug: 'the jug', basket: 'your basket', butt: 'the little water butt' };
// (where each thing she's to take from home is kept, for the list)
const WHERE = { basket: 'your basket’s on its peg', pot: 'the pot’s on the chest', butt: 'the little butt’s by the hearth' };

// Things carried: a bucket, two loaves in a cloth, the pot, a jug, a covered basket (o.empty: a basket with nothing in it), the little water
// butt (o.empty: dry). → an item for her hands (motion's hold), not to be set down away from home.
function prop(kind, o) {
  const T = root.Toon, g = new THREE.Group(), add = (geo, col, x, y, z, ink) => { const m = new THREE.Mesh(geo, T.mat(col)); m.position.set(x, y, z); m.add(new THREE.Mesh(T.hullGeo(geo, ink || 0.06), T.INKM[0])); m.castShadow = true; g.add(m); return m; };
  let grip = new V3(0, 0.6, 0), style = 'hang', name = 'it';
  if (kind === 'bucket') { add(new THREE.CylinderGeometry(1.6, 1.3, 2.8, 12, 1, true), '#7a5a3a', 0, -2.2, 0).material.side = THREE.DoubleSide; add(new THREE.CircleGeometry(1.5, 12).rotateX(-Math.PI / 2), '#5a8aa0', 0, -1.2, 0, 0.01);
    add(new THREE.TorusGeometry(1.6, 0.12, 4, 12, Math.PI), '#3a3634', 0, -0.9, 0, 0.03); name = 'the bucket'; }
  if (kind === 'loaves') { add(new THREE.SphereGeometry(1.3, 10, 6).scale(1.3, 0.7, 0.9), '#b8743a', -0.7, -1.2, 0); add(new THREE.SphereGeometry(1.3, 10, 6).scale(1.3, 0.7, 0.9), '#c98a4a', 0.8, -1.0, 0.2); add(new THREE.PlaneGeometry(4, 2.6).rotateX(-Math.PI / 2), '#efe6d0', 0, -1.6, 0, 0.01); grip = new V3(0, -0.4, 0); name = 'the loaves'; }
  if (kind === 'pot') { add(new THREE.SphereGeometry(2, 12, 8, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7), '#2e2a28', 0, -2.2, 0); add(new THREE.TorusGeometry(2, 0.18, 4, 14).rotateX(Math.PI / 2), '#2e2a28', 0, -1.1, 0, 0.03); grip = new V3(0, -0.6, 0); style = 'front'; name = 'the pot'; }
  if (kind === 'jug') { add(new THREE.LatheGeometry([[0.01, 0], [1.1, 0.1], [1.4, 1.2], [1.0, 2.6], [0.8, 3.0], [0.95, 3.3]].map(([r, y]) => new THREE.Vector2(r, y)), 12), '#c8946a', 0, -3.2, 0); add(new THREE.TorusGeometry(0.6, 0.15, 4, 10, Math.PI), '#c8946a', 1.2, -1.2, 0, 0.03); name = 'the jug'; }
  // (the little water butt: a cask hugged in front of her, two hoops, and the water showing at the top when it's full)
  if (kind === 'butt') { const tx = root.Cottage && root.Cottage.kit ? root.Cottage.kit.textures() : null, oak = tx && tx.oak ? root.Cottage.kit.toonMap(tx.oak) : T.mat('#7a5232');
    const c = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.3, 5, 14, 1, true), oak); c.material = c.material.clone(); c.material.side = THREE.DoubleSide; c.position.y = 2.5; c.add(new THREE.Mesh(T.hullGeo(c.geometry, 0.06), T.INKM[0])); g.add(c);
    for (const y of [0.8, 4.2]) add(new THREE.TorusGeometry(2.48, 0.14, 4, 16).rotateX(Math.PI / 2), '#3a3430', 0, y, 0, 0.02);
    const water = new THREE.Mesh(new THREE.CircleGeometry(2.3, 14).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5a8aa0').convertSRGBToLinear() })); water.position.y = 4.4; water.visible = false; g.add(water);
    const it = { obj: g, name: 'the little water butt', kind, grip: new V3(0, 5, 0), radius: 3, keep: true, style: 'front', water };
    fill(it, !(o && o.empty)); return it; }
  const empty = kind === 'basket' && o && o.empty;
  // (a basket: the cottage's own, the wicker bowl and its handle over the top, as on the pegs at home)
  if (kind === 'basket') { const K = root.Cottage && root.Cottage.kit, wick = K ? (wicker || (wicker = K.toonMap(K.textures().wicker))) : T.mat('#b08850');
    const bowl = new THREE.LatheGeometry([[0.01, 0], [2.4, 0.2], [3.0, 1.4], [3.2, 3.2], [3.3, 3.4]].map(([r, h]) => new THREE.Vector2(r, h)), 16), handle = new THREE.TorusGeometry(3.1, 0.25, 6, 16, Math.PI);
    for (const [geo, y, ink] of [[bowl, 0, 0.1], [handle, 3.4, 0.06]]) { const mm = new THREE.Mesh(geo, wick); mm.position.y = y; if (geo === bowl) mm.material = Object.assign(wick.clone(), { side: THREE.DoubleSide }); mm.add(new THREE.Mesh(T.hullGeo(geo, ink), T.INKM[0])); mm.castShadow = true; g.add(mm); }
    grip = new V3(0, 6.5, 0); name = 'your basket'; }
  const it = { obj: g, name, kind, grip, radius: kind === 'basket' ? 3.4 : 1.2, keep: kind !== 'basket', hangs: kind === 'basket', style, fill: kind === 'basket' ? { y: 3.2, r: 3.0 } : null };
  if (kind === 'basket') { it.contents = (o && o.contents) ? o.contents.slice() : []; fill(it, it.contents.length > 0 || (!empty && !(o && o.contents))); }      // (her basket: what's in it, by name)
  return it;
}
// A basket filled (a cloth over what's in it: the eggs, the Dunns' bread), or emptied; the butt filled (and heavy: a walk with it), or emptied.
function fill(it, on) {
  if (it && it.kind === 'butt') { if (it.water) it.water.visible = !!on; it.full = it.heavy = !!on; return; }
  if (!it || !it.fill) return; const T = root.Toon;
  if (on && !it.cloth) { const geo = new THREE.SphereGeometry(it.fill.r, 10, 6).scale(1, 0.35, 1), m = new THREE.Mesh(geo, T.mat('#e8dcc0')); m.position.y = it.fill.y; m.add(new THREE.Mesh(T.hullGeo(geo, 0.02), T.INKM[0])); it.obj.add(m); it.cloth = m; }
  if (!on && it.cloth) { it.obj.remove(it.cloth); it.cloth = null; }
  it.full = !!on;
}

// What's in her basket, by name (the eggs, the loaves, the jug, Mama's pie, a herb for her grandmother): put in, and taken out; a cloth over
// it while there's anything.
function putIn(b, what) { if (!b) return; b.contents = (b.contents || []).filter(x => x !== what).concat(what); fill(b, true); b.keep = false; }
function takeOut(b, what) { if (!b) return; b.contents = what == null ? [] : (b.contents || []).filter(x => x !== what); fill(b, b.contents.length > 0); }
const PIE = 'Mama’s pie';
const basketOf = P => { const it = P && P.motion.carry; return it && it.kind === 'basket' ? it : null; };

function create(w) {
  const S = root.Story, save = w.save, cal = w.cal, rep = w.rep;
  const E = S.ERRANDS;
  // (the day's state, begun afresh each day)
  const st = () => { const c = save.state.chores || (save.state.chores = { day: 0, garden: false, errand: null, refusals: [], missed: 0 }); if (c.day !== cal.day) { c.day = cal.day; c.garden = !!(root.Garden && root.Garden.offToday(w)); c.errand = null; c.left = []; } return c; };      // (left: what she's put down out of doors today, and where)      // (some days her mother has the garden: js/garden.js)
  const change = fn => save.change(s => { st(); fn(s.chores); }, { chores: true });
  const on = () => w.q.done('maren.chores');      // (once they're agreed)
  const errand = () => { const e = st().errand; return e && E[e.id] ? Object.assign({ key: e.id }, E[e.id], e) : null; };
  const clock = m => root.Calendar.clockOf(m).replace(/ in the (morning|afternoon|evening)| at night/, '');
  // Which errand today: one of them, not yesterday's, about one day in four none (the same for a day, however it's asked).
  function pick(day) {
    const rnd = (n => () => { n = (n * 16807) % 2147483647; return (n - 1) / 2147483646; })(((day * 2654435761) % 2147483646) + 1); rnd(); rnd();      // (mixed, and the first draws let go: a small seed's first draw is small)
    // (at first, one of each in turn, in an order that has her meet everyone, the inn's afternoon last, so that by the time Mistress Abney asks
    // her favour she's plans and friends enough to be tempted from it; then any, about one day in four none)
    const asked = (save.state.chores && save.state.chores.asked) || [], next = INTRO.find(id => E[id] && !asked.includes(id));
    if (next) return next;
    if (((save.state.chores && save.state.chores.cans) || 0) >= CANS) return 'well';      // (five cans out of the butt since she last drew it full: the well, whatever else)
    if (rnd() < 1 / NONE_ONE_IN) return null;
    // (the shifts come round three times as often while what they lead to (Mistress Pennock's trust; Mistress Abney taking her in hand) is still
    // to come)
    const ids = Object.keys(E), last = save.state.chores && save.state.chores.last, open = r => w.q && w.q.stateOf && !['done'].includes(w.q.stateOf(r));
    const weight = id => (id === 'bakery' && open('pennock.trust')) || (id === 'inn' && open('abney.inhand')) ? 3 : 1;
    const bag = []; for (const id of ids) if (id !== last && id !== 'well') for (let k = 0; k < weight(id); k++) bag.push(id);
    return bag[Math.floor(rnd() * bag.length)];
  }
  // (something put in her hands)
  const hand = (P, kind, o) => { const p = prop(kind, o); P.stage.scene.add(p.obj); P.motion.hold(p, p.style); return p; };
  // What's in her hands as she leaves a place, to be in them still in the next (carried); and put back in them there (regive): at home, a
  // basket is one of the cottage's own, off its peg; anywhere else, one like it (not to be set down away from home).
  const basketIn = P => { const it = P && P.motion.carry; return it && it.kind === 'basket' ? it : null; };
  const holding = (P, kind) => { const it = P && P.motion.carry; return it && it.kind === kind ? it : null; };
  function carried(P) { const it = P && P.motion.carry; return it && it.kind ? { kind: it.kind, full: !!it.full, contents: it.contents ? it.contents.slice() : undefined } : null; }
  function regive(P, d) {
    const W = P.world;
    if (d.kind === 'basket' && W.pegs && W.pegs.length) { const it = W.items.find(x => x.kind === 'basket' && x.peg);
      if (it) { it.peg.item = null; it.peg = null; it.panel = null; P.motion.hold(it, 'hang'); it.contents = (d.contents || []).slice(); fill(it, it.contents.length > 0); it.keep = false; return; } }
    if (d.kind === 'pot' || d.kind === 'butt') { const it = W.items.find(x => x.kind === d.kind && !x.away);      // (home with it: the cottage's own, in her arms)
      if (it) { it.panel = null; P.motion.hold(it, 'front'); fill(it, d.full); it.keep = !!d.full; return; } }
    const it = hand(P, d.kind, { empty: (d.kind === 'basket' || d.kind === 'butt') && !d.full, contents: d.contents }); if (d.kind === 'butt') it.keep = !!d.full;
  }
  // (the pot, gone to the smith: not in the house till it's mended, the next day)
  // (and her basket not on its peg, while she's left it somewhere out of doors)
  const away = (P) => { const W = P && P.world, a = st().away, out = basketLeft(); if (!W || !W.items) return; for (const it of W.items) { if (it.home) it.away = !!(a && a[it.kind] === cal.day); if (it.kind === 'basket' && it.peg) it.away = !!out; } };
  // Out of doors, what she puts down stays where she put it, the rest of the day (and is there when she comes back for it); at home, it's
  // the cottage's own. (The next morning, it's all back where it lives.)
  let leftN = 0;
  const LEAVES = ['basket', 'pot', 'butt', 'bucket', 'loaves', 'jug'];      // (what can be left out of doors, and found again: what prop makes)
  function leftAt(P, it) { if (w.area === 'home' || !it || !LEAVES.includes(it.kind)) return; const id = 'l' + cal.day + '-' + (++leftN) + '-' + Date.now() % 100000; it.leftId = id;
    change(c => { c.left = (c.left || []).concat({ id, kind: it.kind, contents: it.contents ? it.contents.slice() : undefined, full: !!it.full, area: w.area, x: it.obj.position.x, z: it.obj.position.z }); }); w.refresh(); }
  function pickedUp(P, it) { if (!it || !it.leftId) return; const id = it.leftId; it.leftId = null; change(c => { c.left = (c.left || []).filter(l => l.id !== id); }); w.refresh(); }
  const basketLeft = () => (st().left || []).find(l => l.kind === 'basket') || null;
  // (where her basket is, when she hasn't it: on its peg, or where she put it down; → { area, at } for the guide, or null in her hands)
  function basketWhere(P) { if (basketOf(P)) return null; const l = basketLeft(); return l ? { area: l.area, at: new V3(l.x, 0, l.z) } : { area: 'home', peg: true }; }
  // (going to collect something that wants her basket, without it: she remembers where it is, and can't till she has it)
  async function noBasket(P) { const l = basketLeft(); await P.converse(S.basketLeft(l ? l.area : null, l && l.area === w.area), { shot: false, keepCamera: true }); }
  // (an errand that wants a thing of hers (a basket for what's fetched; the pot for the forge; the little butt for the well), and she hasn't it in
  // her hands as she goes out of the door: her mother calls after her)
  const has = (P, e) => !e.needs || !!holding(P, e.needs) && !(e.pie && !(holding(P, e.needs).contents || []).includes(PIE));
  const forgot = P => { const e = errand(); return !!(e && e.needs && (e.state === 'accepted' || e.state === 'broken') && !has(P, e)); };
  async function remind(P) { const e = errand(), it = P.motion.carry; await P.converse(S.needReminder(e ? (e.pie ? 'pie' : e.needs) : 'basket', it ? it.kind : null), { shot: ['red', 'mother'] }); }
  // What she's most known for lately, to colour how she says yes or no.
  const temper = () => { let best = null, v = 1; for (const k of ['wilful', 'mischievous', 'naughty']) if (rep.stat(k) > v) { v = rep.stat(k); best = k; } return best; };

  // ── Breakfast: the asking. (Played at home, the morning she wakes: js/world.js's morning.)
  async function breakfast(P) {
    if (!on() || !P || !P.npc) return;
    const id = pick(cal.day), e = id ? E[id] : null, by = e ? H(e.by) : 0;
    const ctx = { temper: temper(), byText: e ? clock(by) : '', garden: root.Garden ? root.Garden.offToday(w) : null, rained: root.Garden ? root.Garden.plan(cal.day).rained : false,
      yes: async () => { answer(id, 'yes'); if (e.give) hand(P, e.give); }, little: async () => { answer(id, 'little'); }, wont: async () => { answer(id, 'wont'); } };
    await P.wait(0.8); await P.approach();
    if (id) change(c => { c.asked = (c.asked || []).filter(x => x !== id).concat(id); });      // (asked: for the order they're first asked in)
    await P.converse(S.breakfast(e, ctx), { shot: ['red', 'mother'] });
    if (due()) await maintenance(P);
    w.refresh();
  }
  // Her answer to the day's errand: 'yes' (a promise, to begin by its time), 'little' (an honest no: nothing against her), 'wont' (wilful, and
  // counted: see due).
  function answer(id, how) {
    const by = H(E[id].by);
    if (how === 'wont') rep.add('wilful', 1, 'refusing an errand');
    change(c => { c.errand = { id, state: how === 'yes' ? 'accepted' : how, by }; c.last = id; if (how === 'wont') c.refusals = (c.refusals || []).filter(d => d > cal.day - 7).concat(cal.day); });
  }
  // Another "won't", not an errand (refusing to help with supper): wilful, and counted with the errands' toward the week's three.
  const wont = why => { rep.add('wilful', 1, why); change(c => { c.refusals = (c.refusals || []).filter(d => d > cal.day - 7).concat(cal.day); }); };
  // (three "won't"s within the week: a maintenance correction is due)
  const due = () => (st().refusals || []).filter(d => d > cal.day - 7).length >= 3;
  // The third "won't" in a week: her mother takes her in hand, there and then; and after it, she's set right.
  async function maintenance(P) {
    await P.converse(S.enough(), { shot: ['red', 'mother'] });
    const r = await root.Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: S.maintenanceCorrection }], fade: on_ => w.fade(on_) });
    if (P !== w.P) return;
    await P.converse(S.afterMaintenance(r), { shot: ['red', 'mother'] });
    settled();
    if (r && r.rose) save.flag('rose-said', cal.day);
  }

  // (after it: her wilfulness settled, and the count of refusals begun again)
  const settled = () => { rep.settle('wilful', 1); change(c => { c.refusals = []; }); };

  // ── What she can do, where she is: the garden and the errand's place (the village); giving what she's brought home to her mother (home).
  function actions(P, area) {
    if (!on() || !P) return [];
    const out = [], e = errand(), c = st(), W = P.world, sp = W.spots || {}, m = P.motion;
    if (area === 'village' && P.garden) out.push(...P.garden.actions());      // (the garden's own work, and its bench)      // (the garden's own work, from the paths between its rows: js/garden.js)
    if (e && (e.area || 'village') === area && area !== 'home') {      // (the errand's own place: the village's, or the Fowlers')
      const early = e && e.shift && e.state === 'accepted' && cal.minute < e.by - SHIFT_SLACK;      // (a shift: not before a quarter of an hour before its time)
      if (e && !early && (e.state === 'accepted' || e.state === 'broken' || e.state === 'working' || (e.state === 'missed' && e.gone && !e.knocked)) && sp[e.place] && (e.state === 'working' || e.state === 'missed' || has(P, e) || e.needs === 'basket')) out.push({ label: e.state === 'working' ? 'Back in to work' : e.action, at: sp[e.place].at, run: () => doErrand(P, e) });
    }
    if (area === 'home' && e && e.state === 'carrying' && m.carry && P.npc) out.push({ label: 'Give Mama ' + (e.carryName || NAME[e.carry]), at: P.npcMotion.pos.clone().setY(18), run: () => giveHome(P, e) });
    return out;
  }
  // The garden: its work done (js/garden.js plays it), it's tended for the day.
  const gardenDone = () => { change(c => { c.garden = true; }); w.refresh(); };
  const gardenTended = () => st().garden;
  // The errand's work, where it's asked for: the scene (off the clock), then the time it took.
  async function doErrand(P, e) {
    if (e.needs === 'basket' && !basketOf(P) && e.state !== 'working' && e.state !== 'missed') { await noBasket(P); return; }      // (to collect, but no basket: she remembers where it is)
    const sp = P.world.spots[e.place], m = P.motion;
    await m.goTo(sp.at, sp.yaw);
    // (a shift of work, played inside: js/work.js; the errand's done when the work is)
    if (e.shift && e.state === 'broken') { await P.converse(S.shiftMissed(e), { shot: false, keepCamera: true }); return; }      // (too late: they've managed without her)
    if (e.from && cal.minute < H(e.from)) { await P.converse(e.early, { shot: false, keepCamera: true }); return; }      // (too early: nobody up to answer)
    if (e.state === 'missed') { change(c => { c.errand.knocked = true; }); await P.converse(e.gone, { shot: false, keepCamera: true }); return; }      // (too late: he's gone out)
    if (e.shift && root.Work) { if (!root.Work.current(w)) root.Work.begin(w, e.shift, { short: e.short, mode: e.shift === 'bakery' ? 'errand' : null }); change(c => { c.errand.state = 'working'; c.errand.late = e.state === 'broken'; }); await w.go(root.Work.SHIFTS[e.shift].area, 'door'); return; }
    if (e.leave && holding(P, e.leave)) { const it = m.drop(); if (it) { it.obj.visible = false; it.panel = null; it.away = !!it.home; change(c => { c.away = Object.assign({}, c.away, { [e.leave]: cal.day }); }); } }      // (left with the smith)
    if (e.pie && basketIn(P)) takeOut(basketIn(P), PIE);      // (the pie out of it, into Master William's hands)
    if (e.pails) await pails(P, e);      // (the well: three pails drawn, and into the butt)
    // (the one it's for, if they're there: facing her, and their own word for it)
    const f = e.who && P.figure ? P.figure(e.who) : null;
    if (f && e.met) { if (!f.sat) f.motion.face(Math.atan2(m.pos.x - f.motion.pos.x, m.pos.z - f.motion.pos.z)); m.face(Math.atan2(f.motion.pos.x - m.pos.x, f.motion.pos.z - m.pos.z)); }
    await P.converse(f && e.met ? e.met : e.there, { shot: false, keepCamera: true });
    fulfilled(P, e);
  }
  // The well: the pail let down and drawn up, three times, and tipped into the butt at her feet; then it's full. Agnes Thatcher's at the well
  // too, and talks the while.
  async function pails(P, e) {
    const m = P.motion, b = holding(P, 'butt'), sp = P.world.spots[e.place], f = new V3(Math.sin(m.yaw), 0, Math.cos(m.yaw));
    if (!b) return; m.drop(); b.obj.position.copy(m.pos.clone().setY(0).addScaledVector(f, 5.5).addScaledVector(new V3(f.z, 0, -f.x), 4)); b.obj.rotation.set(0, m.yaw, 0);
    const well = (sp && sp.at ? sp.at.clone() : m.pos.clone()).addScaledVector(f, 6).setY(10), butt = b.obj.position.clone().setY(6);
    const n = (st().fills || 0) + 1; change(c => { c.fills = n; });
    const V = P.villagers, agnes = V && V.summon ? V.summon('agnes', 'wellSide') : null;
    if (agnes) { const at = P.collide(m.pos.clone().setY(0).addScaledVector(new V3(f.z, 0, -f.x), -12).addScaledVector(f, 3), 3.2); await Promise.race([V.walkTo('agnes', at, Math.atan2(m.pos.x - at.x, m.pos.z - at.z)), P.wait(6)]); agnes.motion.face(Math.atan2(m.pos.x - agnes.motion.pos.x, m.pos.z - agnes.motion.pos.z)); }
    const draw = async () => { for (let k = 0; k < 3; k++) {
      m.reach('L', well.clone().add(new V3(f.z, 0, -f.x).multiplyScalar(-1.5))); await m.reach('R', well.clone().add(new V3(f.z, 0, -f.x).multiplyScalar(1.5))); await P.wait(agnes ? 1.6 : 0.7);
      m.reach('L', butt.clone().add(new V3(f.z, 0, -f.x).multiplyScalar(-1.5))); await m.reach('R', butt.clone().add(new V3(f.z, 0, -f.x).multiplyScalar(1.5))); await P.wait(agnes ? 1 : 0.4);
      m.release('L'); await m.release('R');
      if (P.talk && !agnes) P.talk.muse(['One.', 'Two. My arms…', 'Three, and full.'][k], { face: k === 2 ? 'smile' : 'calm' });
    } };
    if (agnes) { await Promise.all([draw(), P.converse(S.agnesWell(n - 1), { shot: ['red', 'agnes'] })]); V.letGo('agnes'); rep.trusts('agnes', 0.5); }      // (she talks; Red draws)
    else await draw();
    fill(b, true); const p = b.obj.position.clone().add(b.grip); m.lookAt(p);
    m.reach('L', p.clone().add(new V3(f.z, 0, -f.x).multiplyScalar(-2.4))); await m.reach('R', p.clone().add(new V3(f.z, 0, -f.x).multiplyScalar(2.4)));
    m.hold(b, 'front'); b.keep = true; m.release('L'); await m.release('R'); m.lookAt(null);
  }
  // (the errand's done, its work or its word given: what it was for, and whatever she's to carry home)
  function fulfilled(P, e) {
    if (e.trust) rep.trusts(e.trust, 1);
    if (e.quest && w.q.stateOf && w.q.stateOf(e.quest) === 'offered') w.complete(e.quest);      // (a step of a line, done by the work: the first morning at the bakery)
    const late = e.state === 'broken';
    if (e.carry) { const b = holding(P, e.carry); if (b && b.kind === 'basket') putIn(b, e.carryName || NAME[e.carry]); else if (b) { fill(b, true); b.keep = true; } else hand(P, e.carry); change(c => { c.errand.state = 'carrying'; c.errand.late = late; }); }      // (into the basket she brought; the butt, full)
    else change(c => { c.errand.state = 'done'; c.errand.late = late; });
    cal.advance(e.mins); w.refresh();
  }
  // (a can filled at the garden's butt; and the butt filled again from the well, the count begun again)
  const canFilled = () => change(c => { c.cans = (c.cans || 0) + 1; });
  // (handed over somewhere else than its place: the eggs, at the Fowlers' gate, the first time; → whether it was this errand, and still owed)
  function fulfil(P, key) { const e = errand(); if (!e || e.key !== key || !(e.state === 'accepted' || e.state === 'broken')) return false; fulfilled(P, e); return true; }
  const owes = key => { const e = errand(); return !!(e && e.key === key && (e.state === 'accepted' || e.state === 'broken')); };
  // Asked on the day, by Mistress Pennock (before noon, at her counter: any day Red hasn't been asked for the bakery's afternoon) or Mistress Abney (before one, if
  // Red's nothing else promised). Mistress Pennock's is a head start on the clearing down, there and then, while she sells (js/work.js); by
  // Mistress Abney, the inn's afternoon is without the carrier's men: they're only expected on a day it's asked for at breakfast.
  const OFFER = { pennock: { id: 'bakery', before: H('12:00'), sold: H('12:30') }, abney: { id: 'inn', before: H('13:00'), by: H('14:00') } };      // (by her, the inn's afternoon is at two)
  function canOffer(who) {
    const o = OFFER[who], c = st(), e = c.errand; if (!o || !on() || cal.minute >= o.before || (c.offered || {})[who] === cal.day) return false;
    if (who === 'pennock') return !(e && e.id === 'bakery') && !(root.Work && root.Work.current(w));      // (any day she's not been asked for the afternoon's: and not twice)
    return !e || e.state === 'done' || e.state === 'little';
  }
  async function offer(P, who) {
    const o = OFFER[who]; let yes = false; change(c => { c.offered = Object.assign({}, c.offered, { [who]: cal.day }); });
    await P.converse(S.shiftOffer(who, { yes: () => { yes = true; } }), { shot: ['red', who] });
    if (yes && who === 'pennock' && root.Work) { root.Work.begin(w, 'bakery', { mode: 'picked', until: Math.max(OFFER.pennock.sold, cal.minute + 40) }); w.refresh(); await w.go('bakery', 'door'); return true; }      // (in, and at it: till she's sold out)
    if (yes) change(c => { c.errand = { id: o.id, state: 'accepted', by: o.by || H(E[o.id].by), short: who === 'abney' }; c.last = o.id; });
    w.refresh(); return yes;
  }
  // A shift's work done (js/work.js): the errand with it, and what it was for. (o.short: the list not finished: done with, but nothing for it)
  function shiftDone(id, o) {
    const e = errand(); if (!e || e.key !== id) return;
    if (!(o && o.short)) { if (e.trust) rep.trusts(e.trust, 1); if (e.quest && w.q.stateOf && w.q.stateOf(e.quest) === 'offered') w.complete(e.quest); }
    change(c => { c.errand.state = 'done'; c.errand.short = !!(o && o.short); }); w.refresh();
  }
  // Home with it: handed to her mother, and her word for it.
  async function giveHome(P, e) { await P.approach(9); await P.converse(marenTalk(P), { shot: ['red', 'mother'] }); }
  // (what she's brought, out of her hands and her mother's: and the errand's done)
  function handOver(P, e) {
    const b = basketIn(P), it = P.motion.carry;
    if (b) takeOut(b, e.carryName || NAME[e.carry]);      // (the eggs out of it, and her basket hers again)
    else if (it && it.home) { P.motion.drop(); fill(it, false); it.keep = false; it.obj.position.copy(it.home); it.obj.rotation.set(0, 0, 0); }      // (the butt: her mother takes it, and it's back by the hearth, emptied into the big one)
    else { const x = P.motion.drop(); if (x) x.obj.visible = false; }
    change(c => { c.errand.state = 'done'; c.errand.told = true; if (e.key === 'well') c.cans = 0; }); cal.advance(5); w.refresh();
  }
  // Talking to her mother in the day: what she's brought, given first (and the errand done); or how the errand went, if it was one with
  // nothing to bring, Red's to say; or a reminder, if it's still to do; or a word about nothing much. Then the garden, if it's not done, or
  // supper at six.
  function marenTalk(P) {
    const e = errand(), c = st(), out = [];
    if (e && e.state === 'carrying' && P.motion.carry) out.push({ run: () => handOver(P, e) }, e.back);
    else if (e && e.state === 'missed' && !e.told) { const b = basketIn(P); if (b) takeOut(b, PIE); out.push(...S.marenMissed(e, { told: () => change(cc => { cc.errand.told = true; }) })); }      // (the pie still in the basket)
    else if (e && (e.state === 'accepted' || e.state === 'broken')) out.push(...S.marenReminds(e, clock(e.by), e.state === 'broken'));
    else if (e && e.state === 'done' && !e.told) out.push(...S.marenAsks(e, { told: () => change(cc => { cc.errand.told = true; }) }));
    else out.push(...S.marenChat(cal.day, cal.part, { errand: e, asked: !!c.errand }));
    const garden = !c.garden && cal.minute < H('19:00') && !(root.Garden && root.Garden.offToday(w));
    if (garden) out.push(...S.marenGarden());
    else if (cal.minute < H('18:00')) out.push(...S.marenSupper());
    return out;
  }
  // What she's carrying, as she comes into a place: in her hands still.
  function dress(P, held) {
    if (P && root.Garden) root.Garden.boots(P, w);      // (petals still on her boots, from her mother's flowers)
    if (P && held && !P.motion.carry) regive(P, held);      // (whatever she had in her hands, still in them)
    away(P);
    if (P && w.area !== 'home') for (const l of st().left || []) if (l.area === w.area) {      // (what she put down here, where she put it)
      const it = prop(l.kind, { empty: !l.full, contents: l.contents }); it.keep = false; it.leftId = l.id; it.obj.position.set(l.x, 0, l.z); P.stage.scene.add(it.obj); P.world.items.push(it); }
    const e = errand(); if (!e || !P) return;
    const kind = e.state === 'carrying' ? e.carry : e.state === 'accepted' || e.state === 'broken' ? e.give : null;
    if (kind && !P.motion.carry && w.area !== 'home' && !(st().left || []).some(l => l.kind === kind)) hand(P, kind);      // (out, with nothing in her hands that should be: given her)
  }
  // Each moment: the time gone by an errand not begun (a broken promise, and she knows it); the garden still untended at dusk.
  function tick(P) {
    if (!on()) return;
    const e = errand(), c = st();
    { const b = e && e.pie && (e.state === 'accepted' || e.state === 'broken') && w.area === 'home' && basketIn(P);      // (a basket taken down, for the Dunns: her mother puts the pie in it, under a cloth)
      if (b && !(b.contents || []).includes(PIE)) { putIn(b, PIE); if (P.talk) P.talk.muse('Mama’s pie in my basket, under a cloth. Still warm.', { face: 'smile' }); } }
    if (e && e.state === 'accepted' && cal.minute > e.by + (e.shift ? SHIFT_SLACK : 0)) {      // (a shift has a quarter of an hour's grace)
      change(cc => { cc.errand.state = e.fails ? 'missed' : 'broken'; }); rep.add('naughty', 1, 'a broken promise: ' + e.title.toLowerCase());      // (fails: past its time, it can't be done at all)
      if (P && P.talk) for (const [face, text] of S.broken(e.title)) P.talk.muse(text, { face });
      w.refresh();
    }
    if (!c.garden && c.missed !== cal.day && cal.minute >= H('19:00')) {
      change(cc => { cc.missed = cal.day; }); rep.add('naughty', 0.5, 'Mama’s garden left untended');
      if (P && P.talk) P.talk.muse('The garden. I never went near it today.', { face: 'wince' });
    }
  }
  // What's hers to do now, for the objective: the errand (begun by when), what to take home, the garden.
  // What's hers to do now: everything at once (objectives: the evening's matters, the errand, the garden), and the first of them (objective).
  function objectives() {
    if (!on()) return [];
    const out = [], e = errand(), c = st();
    for (const M of [root.Evening, root.Pie, root.AbneyPromise, root.Peter]) { const t = M && M.objective(w); if (t) out.push(t); }
    { const V = w.P && w.P.villagers, t = V && V.dareObjective && V.dareObjective(); if (t) out.unshift(t); }      // (Tom's dare, taken: js/villagers.js)      // (walked home by the Watchman; sent home by Mistress Pennock; Bess tonight; Peter at the beech; Grandmother's herbs)
    const k = root.Work && root.Work.current(w), t = k && (e || k.mode === 'picked') && root.Work.tasksOf(k)[k.step];
    if (t) out.push((e ? e.title : 'Mistress Pennock’s list') + ': ' + t.label[0].toLowerCase() + t.label.slice(1) + (k.until && !k.back ? ' (she’s back at ' + clock(k.until) + ')' : '') + '.');      // (at work: the task in hand; a timed one, when she's back)
    else if (e && e.state === 'accepted') out.push(e.title + (e.shift ? ': at ' + clock(e.by) + ', give or take a quarter of an hour' : e.from ? ': after ' + clock(H(e.from)) + ', before ' + clock(e.by) : ': begin by ' + clock(e.by)) + (e.needs && w.P && !has(w.P, e) && (w.area === 'home' || e.needs === 'basket') ? ' (' + (w.P.motion.carry && !holding(w.P, e.needs) ? 'put ' + w.P.motion.carry.name + ' down; ' : '') + (e.needs === 'basket' && basketLeft() ? 'your basket’s where you left it' : WHERE[e.needs]) + ')' : '') + '.');
    else if (e && e.state === 'carrying') out.push('Take ' + (e.carryName || NAME[e.carry]) + ' home to Mama.');
    else if (e && e.state === 'broken') out.push(e.title + ': late, but not too late to do it.');
    if (!c.garden && cal.minute < H('19:00')) out.push(root.Garden && w.area === 'village' && w.P && root.Garden.inside(w.P.motion.pos) ? 'Mama’s garden: ' + root.Garden.progressText(w) + '.' : 'Tend Mama’s garden.');      // (what's left in it, once she's through the gate)
    { const t = root.Herbs && root.Herbs.objective(w); if (t) out.push(t); }      // (Grandmother's herbs: after what's asked at home)
    { const t = root.Flock && root.Flock.objective(w); if (t) out.unshift(t); }      // (Bo's strays: while they're loose, first)
    return out;
  }
  const objective = () => objectives()[0] || null;

  function journalLine() {
    if (!on()) return null;
    const e = errand(), c = st(), parts = [];
    parts.push(c.garden ? 'The garden: tended.' : 'The garden: not yet.');
    if (e) parts.push(e.title + ({ accepted: ': begin by ' + clock(e.by), working: ': under way', carrying: ': to take home', done: e.late ? ': done, late' : ': done', broken: ': not begun in time', missed: ': too late to do', little: ': not today (honestly)', wont: ': refused' })[e.state]);
    else parts.push('Nothing asked today.');
    return { name: 'Today', state: 'offered', step: { title: parts[1], hint: parts[0] } };
  }
  return { leftAt, pickedUp, basketWhere, noBasket, canFilled, canOffer, offer, marenTalk, carried, forgot, remind, fill, on, breakfast, answer, wont, due, settled, shiftDone, fulfil, owes, objectives, gardenDone, gardenTended, actions, tick, dress, objective, journalLine, pick, prop, ERRANDS: E };
}

root.Chores = { create, prop, putIn, takeOut, basketOf, PIE };
if (typeof module !== 'undefined' && module.exports) module.exports = root.Chores;
})(typeof window !== 'undefined' ? window : globalThis);
