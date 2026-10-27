// Little Red’s Lessons — the village's people, about their days (js/village.js is where they are). Each keeps to their work in its hours and
// goes in when it's done; who's out and where is worked out from the day and the time, the same every time it's asked:
//
//   • Agnes Thatcher has no trade to keep her: out from eight till dusk, here and there, but most often by the well.
//   • Georgie Dunn is at the mill all day; on most afternoons he's back in the village by three or so, till the bell (and never far from Agnes).
//   • Tom Ferrier is at the forge with his father in smithing hours (seven till four), and out and about after; about one day in three his father
//     gives him off. Out, he comes and finds her (on some days, not all): a word, or a dare, while the clock runs; keeping her from her chores if she has any.
//   • Master Ferrier at his anvil, seven till five. Bess Abney on the bench outside the inn; her mother at the inn's door at the busy times.
//   • Mistress Pennock at the bakery's counter in the morning, Master Pennock at its door early on. Master William on his rounds at night.
//   • Peter Fowler, on his days off (about one in four, once she's been to the Fowlers': js/peter.js): about the green, by the lime tree, the pond.
//
//   const v = Villagers.attach(P, w)      (P: the village's js/play.js; w: js/world.js's world)
//   v.actions() → talking to whoever's near · v.station(key, day, minute) → where they'd be (or null: not out) · v.here(key) → their figure
// The days' state is kept in the save (state.villagers): { talked: { key: day }, tom: { day, done }, dares: n, met: { key: true } }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
// (a number from 0 to 1 for a day and a question: the same each time it's asked)
function hash(day, k) { let h = (day * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519); h ^= h >>> 13; return (h >>> 0) / 4294967296; }

// Who they are: their rig (js/toon.js), how they're named in conversation, their voice (js/audio.js), and where they come out and go in (their
// own front doors: the Pennocks' cottage past the inn, the Ferriers' by the mill lane; they walk to work and home again).
const PEOPLE = {
  agnes: { rig: 'agnes', name: 'Agnes', voice: 'agnes', tint: '#7a5a2a', bg: '#efe4cc', door: 'thatchers' },
  georgie: { rig: 'georgie', name: 'Georgie', voice: 'georgie', tint: '#6a6a5a', bg: '#e8e6dc', door: 'millGate' },
  tom: { rig: 'tom', name: 'Tom', voice: 'tom', tint: '#5a3a2a', bg: '#ead8c8', door: 'ferriersDoor' },
  smith: { rig: 'smith', name: 'Master Ferrier', voice: 'smith', tint: '#3a3634', bg: '#ddd8d2', door: 'ferriersDoor' },
  bess: { rig: 'abneyDaughter', name: 'Bess', voice: 'bess', tint: '#6a4a5a', bg: '#ecdde4', door: 'innDoor' },
  abney: { rig: 'abney', name: 'Mistress Abney', voice: 'abney', tint: '#4a4a6a', bg: '#e0e0ea', door: 'innDoor' },
  pennock: { rig: 'pennock', name: 'Mistress Pennock', voice: 'pennock', tint: '#8a5a3a', bg: '#f0e2d2', door: 'pennocksDoor' },
  baker: { rig: 'baker', name: 'Master Pennock', voice: 'baker', tint: '#8a7a5a', bg: '#f2ecdc', door: 'pennocksDoor' },
  willie: { rig: 'willie', name: 'Master William', voice: 'willie', tint: '#2a3a4a', bg: '#d8dde4', door: 'dunnsDoor' },
  peter: { rig: 'peter', name: 'Peter', voice: 'peter', tint: '#4a5a3a', bg: '#e2e8d8', door: 'meadowGate' },      // (on his days off: js/peter.js)
};
const FAR = 380;
const OUT = { pennock: true, baker: true, abney: true };      // (those at a door or a counter face out, to the street; the rest face their work)      // (beyond this from the camera, a figure isn't drawn)
const SEAT = { lime: 'the bench round the lime tree', inn: 'the bench outside the inn' };

// Where each is, for a day and a minute: { stand: spot } · { sit: bench, n } · { wander: true } · { round: true }; or null, not out (indoors,
// or away at work). (k: the hour's own roll, for those who move about through the day)
function station(key, day, min) {
  const h = Math.floor(min / 60), r = s => hash(day * 24 + h, s);
  const tomOff = hash(day, 4) < 0.35;
  switch (key) {
    case 'agnes': { if (min < H('8:00') || min >= H('19:30')) return null; const k = r(1); return k < 0.55 ? { stand: 'wellSide' } : k < 0.7 ? { sit: SEAT.lime, n: 0 } : k < 0.8 ? { stand: 'pondSide' } : { wander: true }; }
    case 'georgie': { const from = H('15:00') + Math.floor(hash(day, 3) * 100); if (hash(day, 2) > 0.7 || min < from || min >= H('20:45')) return null;
      const k = r(5); return k < 0.35 ? { stand: 'wellNear' } : k < 0.6 ? { sit: SEAT.inn, n: 2 } : { wander: true }; }      // (some days the mill keeps him late; most, he's about after three, and somewhere he can see the well)
    case 'tom': if (!tomOff && min >= H('7:00') && min < H('16:00')) return { stand: 'tub' };
      return min >= H('8:00') && min < H('20:45') ? { wander: true } : null;
    case 'smith': return min >= H('7:00') && min < H('17:00') ? { stand: 'anvil' } : null;
    case 'bess': return min >= H('9:30') && min < H('18:30') ? { sit: SEAT.inn, n: 0 } : null;
    case 'abney': return (min >= H('11:00') && min < H('13:30')) || (min >= H('17:00') && min < H('20:00')) ? { stand: 'innDoor' } : null;
    case 'pennock': return min >= H('7:00') && min < H('12:30') ? { stand: 'counter' } : null;
    case 'baker': return min >= H('5:30') && min < H('10:30') ? { stand: 'bakeryDoor' } : null;
    case 'peter': { if (min < H('10:00') || min >= H('18:00')) return null; const k = r(7); return k < 0.4 ? { wander: true } : k < 0.7 ? { sit: SEAT.lime, n: 2 } : { stand: 'pondSide' }; }      // (only on his days off: see update)
    case 'willie': return min >= H('20:45') || min < H('5:30') ? { round: true } : null;      // (out a little before the bell, and round till first light)
  }
  return null;
}
const same = (a, b) => !!a && !!b && a.stand === b.stand && a.sit === b.sit && a.wander === b.wander && a.round === b.round;
// (Tom's free today, and whether he'll come and find her: about every other day he's out; from when)
const tomFree = (day, min) => { const s = station('tom', day, min); return !!(s && s.wander); };
const tomComes = day => hash(day, 9) < 0.55;

// ── The ways about the village: the lanes and paths as a net of points, each joined to those it can be walked to straight from (nothing
// solid between), and the shortest way through it from anywhere to anywhere.
function paths(W) {
  const solid = W.obstacles.filter(o => o.x0 != null), pad = 3.4;
  const blocked = (a, b) => { const n = Math.ceil(a.distanceTo(b) / 3); for (let i = 1; i < n; i++) { const t = i / n, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
    for (const o of solid) if (x > o.x0 - pad && x < o.x1 + pad && z > o.z0 - pad && z < o.z1 + pad) return true; } return false; };
  const pts = []; for (const L of W.lanes || []) L.forEach((p, i) => { if (i % 3 === 0 || i === L.length - 1) pts.push(p.clone().setY(0)); });
  for (const k in W.spots) pts.push(W.spots[k].at.clone().setY(0));
  for (const p of W.wander || []) pts.push(p.clone().setY(0));
  const N = pts.length, adj = pts.map(() => []);
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { const d = pts[i].distanceTo(pts[j]); if (d < 60 && !blocked(pts[i], pts[j])) { adj[i].push([j, d]); adj[j].push([i, d]); } }
  const nearest = p => { let best = -1, bd = 1e9; for (let i = 0; i < N; i++) { const d = pts[i].distanceTo(p); if (d < bd && (d < 8 || !blocked(p, pts[i]))) { bd = d; best = i; } } return best; };
  // → the points to walk through, from a to b (ending at b itself)
  function route(a, b) {
    const s = nearest(a), e = nearest(b); if (s < 0 || e < 0) return [b.clone()];
    const dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N); dist[s] = 0;
    for (;;) { let u = -1, ud = Infinity; for (let i = 0; i < N; i++) if (!done[i] && dist[i] < ud) { ud = dist[i]; u = i; } if (u < 0 || u === e) break; done[u] = 1;
      for (const [v, d] of adj[u]) if (dist[u] + d < dist[v]) { dist[v] = dist[u] + d; prev[v] = u; } }
    if (!isFinite(dist[e])) return [b.clone()];
    const out = []; for (let u = e; u >= 0; u = prev[u]) out.unshift(pts[u].clone());
    // (cut corners where the way is clear: from a, as far along as can be seen)
    while (out.length > 1 && !blocked(a, out[1])) out.shift();
    while (out.length > 1 && !blocked(out[out.length - 2], b)) out.pop();
    out.push(b.clone()); return out;
  }
  return { route, blocked, pts };
}

function attach(P, w) {
  const W = P.world, S = root.Story, save = w.save, cal = w.cal, rep = w.rep, sp = W.spots || {};
  if (!W.spots || !root.Toon || !root.Motion) return null;
  const net = paths(W), looks = root.Looks && Looks.load ? Looks.load() : {};
  const vs = () => save.state.villagers || (save.state.villagers = { talked: {}, tom: { day: 0, done: false }, dares: 0, met: {} });
  const change = fn => save.change(s => { vs(); fn(s.villagers); }, { villagers: true });
  const seats = name => W.seats.filter(s => s.name === name);
  const flat = p => new V3(p.x, 0, p.z), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  const figs = {};      // (key → { key, rig, motion, want, path, i, sat, held, wait })
  let clock = 0, think = 0;

  // A lantern, for the Watchman's rounds.
  function lantern() { const T = root.Toon, g = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 2.4, 6), T.mat('#2e2a28')); m.position.y = -2.2; g.add(m);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffcf7a' })); glow.position.y = -2.2; g.add(glow);
    return { obj: g, name: 'the lantern', grip: new V3(0, 0.4, 0), radius: 1, keep: true, style: 'hang' }; }

  // ── Out, and in again.
  function spawn(key, want, arriving) {
    const D = PEOPLE[key], rig = root.Toon.make(D.rig, looks[D.rig] || {});
    const motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, key) });
    const f = { key, rig, motion, want: null, path: null, i: 0, sat: null, held: false, wait: 0, stuck: 0 };
    figs[key] = f; P.addFigure(key, { rig, motion, cast: { name: D.name, voice: D.voice, tint: D.tint, bg: D.bg } });
    if (key === 'willie') { const l = lantern(); P.stage.scene.add(l.obj); motion.hold(l, 'hang'); f.lantern = l; }
    const door = sp[D.door];
    if (arriving && door) { motion.warp(door.at, door.yaw + Math.PI); rig.root.position.copy(door.at); send(f, want); }
    else place(f, want);
    return f;
  }
  // (there already, as she comes into the village: at their place, or somewhere along their way)
  function place(f, want) {
    f.want = want; const m = f.motion;
    if (want.stand) { const s = sp[want.stand]; m.warp(s.at, standYaw(f.key, s)); }
    else if (want.sit) { const seat = freeSeat(want); if (seat) { m.warp(flat(seat.at), seat.facing); m.sit(seat); m.sitW = 1; take(f, seat); } else { const s = sp.wellSide; m.warp(s.at, s.yaw); } }
    else { const list = want.round ? W.round : W.wander, p = list[Math.floor(Math.random() * list.length)]; m.warp(p, Math.random() * 6.28); f.wait = clock + 2 + Math.random() * 4; if (want.round) f.ri = list.indexOf(p); }
    f.rig.root.position.copy(m.pos); f.rig.root.rotation.y = m.yaw;
  }
  const standYaw = (key, s) => OUT[key] ? s.yaw + Math.PI : s.yaw;
  function gone(f) { untake(f); if (f.lantern) P.stage.scene.remove(f.lantern.obj); P.removeFigure(f.key); delete figs[f.key]; }
  // (benches: a place on one taken while they sit, so she isn't offered it)
  const taken = new Map();
  function freeSeat(want) { const list = seats(want.sit); for (let k = 0; k < list.length; k++) { const s = list[(want.n + k) % list.length]; if (!taken.has(s) && W.seats.includes(s) && P.sitting !== s) return s; } return null; }
  function take(f, seat) { f.sat = seat; taken.set(seat, f.key); const i = W.seats.indexOf(seat); if (i >= 0) W.seats.splice(i, 1); }
  function untake(f) { if (!f.sat) return; taken.delete(f.sat); W.seats.push(f.sat); f.sat = null; }
  function seatFront(seat) { const fw = new V3(Math.sin(seat.facing), 0, Math.cos(seat.facing)); return P.collide(flat(seat.at).addScaledVector(fw, 6.5), 1.6); }

  // Off somewhere: their place for now (or their door, going in: want null), by the ways about.
  async function send(f, want) {
    f.want = want; f.path = null; f.goal = null;
    if (f.sat) { const m = f.motion; untake(f); f.standing = true; await m.stand(); f.standing = false; if (f.want !== want) return; }
    let to = null;
    if (!want) to = sp[PEOPLE[f.key].door];
    else if (want.stand) to = { at: sp[want.stand].at, yaw: standYaw(f.key, sp[want.stand]) };
    else if (want.sit) { const seat = freeSeat(want); if (seat) { take(f, seat); f.goal = { seat }; to = { at: seatFront(seat), yaw: seat.facing }; } else to = sp.wellSide; }
    else { f.wait = clock; return; }      // (wandering, or on the round: the next point's chosen when it's time)
    walk(f, to.at, to.yaw);
  }
  function walk(f, at, yaw) { f.path = net.route(f.motion.pos, flat(at)); f.i = 0; f.endYaw = yaw; f.motion.auto = null; }
  // Each moment: along their way, a point at a time; at the end of it, settled there (facing their work, sat down, or in, and gone).
  function step(f, dt) {
    const m = f.motion; if ((f.held && !f.scene) || f.standing) return;
    // (walking her home: a few steps behind her, wherever she goes)
    if (f.follow) { const red = P.motion.pos, d = Math.hypot(red.x - m.pos.x, red.z - m.pos.z);
      if (d > 20 && (f.re = (f.re || 0) - dt) <= 0) { f.re = 0.8; const back = flat(m.pos).sub(flat(red)).setLength(14); walk(f, flat(red).add(back), null); f.speed = 0.95; }
      else if (d <= 16 && f.path) { f.path = null; m.auto = null; m.face(yawTo(m.pos, red)); }
      if (!f.path) return; }
    if (f.path) {
      if (!m.auto) {
        if (f.i >= f.path.length) { const end = f.path; f.path = null; arrive(f, end); return; }
        const p = f.path[f.i++], last = f.i >= f.path.length; m.goTo(p, last && f.endYaw != null ? f.endYaw : null, { speed: f.speed || (f.key === 'tom' && f.chasing ? 0.9 : 0.55) }); f.stuck = 0;
      } else { f.stuck = m.speed < 1 ? f.stuck + dt : 0; if (f.stuck > 4) { m.auto = null; f.stuck = 0; } }      // (held up: on to the next point)
      return;
    }
    // (wandering, or the Watchman's round: a while where they are, then on)
    if (f.want && (f.want.wander || f.want.round) && !m.auto && clock > f.wait) {
      let to;
      if (f.want.round) { f.ri = ((f.ri || 0) + 1) % W.round.length; to = W.round[f.ri]; }
      else { const near = W.wander.filter(p => p.distanceTo(m.pos) > 30 && p.distanceTo(m.pos) < 220); to = (near.length ? near : W.wander)[Math.floor(Math.random() * (near.length || W.wander.length))]; }
      walk(f, to, null);
    }
  }
  function arrive(f) {
    if (f.scene) { const r = f.scene.arrived; f.scene.arrived = null; if (r) r(); return; }      // (where a scene sent them)
    if (!f.want) { gone(f); return; }      // (in at their door)
    if (f.goal && f.goal.seat) { const seat = f.goal.seat; f.goal = null; f.motion.warp(f.motion.pos, seat.facing); f.motion.sit(seat); return; }
    if (f.want.wander) f.wait = clock + 3 + Math.random() * 8;
    else if (f.want.round) f.wait = clock + 0.5;
    else if (f.want.stand) f.motion.face(standYaw(f.key, sp[f.want.stand]));
  }

  // ── Who's out, as the day goes on: checked every so often; each arriving, moving on, or going in as their day says.
  function update(first) {
    const day = cal.day, min = cal.minute;
    for (const key in PEOPLE) {
      const want = (vs().away && vs().away[key] === day) || (key === 'peter' && !(root.Peter && root.Peter.offToday(w))) ? null : station(key, day, min), f = figs[key];      // (away: kept in for the rest of the day, by a scene)
      if (f && f.scene) continue;      // (a scene has them)
      if (want && !f) spawn(key, want, !first);
      else if (f && !want && f.want) { if (!f.held) send(f, null); }
      else if (f && want && !same(f.want, want) && !f.held) send(f, want);
    }
  }

  // ── Talking to them: whoever's near, once she's close (each their word for the time of day, or what's between them; trust a little, once a day).
  function actions() {
    const out = [];
    for (const key in figs) { const f = figs[key]; if (!f.want || f.held) continue;
      out.push({ label: 'Talk to ' + PEOPLE[key].name, at: f.motion.pos.clone().setY(18), run: () => talkTo(key) }); }
    return out;
  }
  async function hold(f) { f.held = true; f.motion.auto = null; }
  function release(f) { f.held = false; if (f.motion.lookAt) f.motion.lookAt(null); if (f.want && !f.sat && figs[f.key]) { if (f.want.stand) send(f, f.want); else f.wait = clock + 2; } }
  // (her, to a comfortable distance from them, and the two of them facing)
  async function meet(f, dist) {
    const m = P.motion, away = flat(m.pos).sub(flat(f.motion.pos)); if (away.lengthSq() < 1) away.set(0, 0, 1); away.normalize();
    const at = P.collide(flat(f.motion.pos).addScaledVector(away, dist || 14), 3.2 * P.rig.scaleW);
    if (at.distanceTo(m.pos) > 2) await m.goTo(at, yawTo(at, f.motion.pos));
    else await m.face(yawTo(m.pos, f.motion.pos));
    if (!f.sat) f.motion.face(yawTo(f.motion.pos, m.pos));
  }
  async function talkTo(key) {
    if (key === 'willie' && cal.curfew() && root.Evening && !root.Evening.watchman(w)) return catchHer(figs.willie);      // (after the bell, he's not there to chat)
    const f = figs[key]; if (!f) return; hold(f);
    try {
      await meet(f);
      if (key === 'abney' && root.AbneyPromise && root.AbneyPromise.wants(w)) { await root.AbneyPromise.ask(P, w); return; }      // (she's a favour to ask)
      if (key === 'tom' && root.InHand && root.InHand.tomWants(w)) { await root.InHand.tellTom(P, w); return; }      // (she might tell him: js/inhand.js)
      if (key === 'smith' && root.InHand && root.InHand.smithWants(w)) { await root.InHand.askSmith(P, w); return; }      // (the same standard as Tom)
      const v = vs(), first = !v.met[key], today = v.talked[key] === cal.day;
      const ch = save.state.chores, potDone = !!(ch && ch.day === cal.day && ch.errand && ch.errand.id === 'pot' && ch.errand.state === 'done');
      const ctx = { part: cal.part, day: cal.day, first, today, errand: w.chores && w.chores.objective(), dares: v.dares, curfew: cal.curfew(), working: !!(f.want && f.want.stand), potDone,
        brokenPromise: !!(root.AbneyPromise && root.AbneyPromise.stateOf(w).broken && !root.AbneyPromise.stateOf(w).sorry) };
      const script = S.villager(key, ctx).filter(l => !l.who || l.who === 'red' || figs[l.who]);      // (only those who are there to say it)
      await P.converse(script, { shot: ['red', key] });
      if (!today && key !== 'willie') rep.trusts(key, 0.25);
      change(s => { s.talked[key] = cal.day; s.met[key] = true; });
      if (ctx.brokenPromise && key === 'abney') w.save.change(s => { s.promise.sorry = cal.day; }, { promise: true });      // (said sorry, to her face)
      if (key === 'tom' && w.q.stateOf && w.q.stateOf('tom.meet') === 'offered') w.complete('tom.meet');
    } finally { release(f); }
  }

  // ── Tom, out and about: he comes to find her, busy or not (on the days he's minded to, once). A word with
  // him, or a dare; and the clock runs while he keeps her, unless she gets away.
  function tomWatch(dt) {
    const f = figs.tom, v = vs(); if (!f || !f.want || !f.want.wander || f.held) return;
    if (v.tom.day === cal.day && (v.tom.done || v.tom.tries > 2)) return;
    const pie = root.Pie && root.Pie.ready(w);      // (he's had an idea: he'll come looking for her, whatever the day)
    if ((!tomComes(cal.day) && !pie) || cal.minute < H('9:00') || cal.curfew()) return;      // (whether or not she's anything to do: busy, he keeps her from it; free, he fills her afternoon)
    const red = P.motion, d = flat(f.motion.pos).distanceTo(flat(red.pos));
    if (P.busy || P.sitting) { f.chasing = false; return; }
    if (!f.chasing) { if (d > 260) return; f.chasing = true; f.since = clock; f.re = 0; }
    if (clock - f.since > 40) { f.chasing = false; change(s => { if (s.tom.day !== cal.day) s.tom = { day: cal.day, done: false, tries: 0 }; s.tom.tries = (s.tom.tries || 0) + 1; }); return; }      // (she's kept away from him: another time)
    if (d < 18) { f.chasing = false; f.path = null; f.motion.auto = null; P.act(() => tomStops(f)); return; }
    if ((f.re -= dt) <= 0) { f.re = 1.5; walk(f, red.pos, null); }
  }
  async function tomStops(f) {
    hold(f); change(s => { s.tom = { day: cal.day, done: true, tries: 0 }; });
    // (his idea about the pies, when he has it: js/pie.js plays it out)
    if (root.Pie && root.Pie.ready(w)) { try { await meet(f, 13); change(s => { s.met.tom = true; s.talked.tom = cal.day; }); await root.Pie.dare(P, w, f); } finally { if (figs.tom && !figs.tom.scene) release(f); } return; }
    const v = vs(), dare = hash(cal.day, 10) < 0.5, kind = !dare ? 'chat' : v.dares % 2 === 0 ? 'bell' : 'knock';
    let spent = 0;
    const ctx = {
      kind, busy: !!(w.chores && w.chores.objective()), errand: w.chores && w.chores.objective(), first: !v.met.tom, dares: v.dares,
      mins: n => { spent += n; cal.advance(n); w.refresh(); },
      ringBell: () => ringBell(f), knock: () => knock(f),
      dared: () => { ctx.done = true; change(s => { s.dares = (s.dares || 0) + 1; }); if (vs().dares >= 2 && w.q.stateOf && w.q.stateOf('tom.dares') === 'offered') w.complete('tom.dares'); },
      chatted: () => rep.trusts('tom', 0.5),
    };
    try {
      await meet(f, 13);
      await P.converse(S.tomStops(ctx), { shot: ['red', 'tom'] });
      change(s => { s.met.tom = true; s.talked.tom = cal.day; });
      if (w.q.stateOf && w.q.stateOf('tom.meet') === 'offered') w.complete('tom.meet');
      if (ctx.busy && spent >= 20 && P.talk) P.talk.muse(S.tomCost(spent), { face: 'wince' });
    } finally { release(f); }
    if (ctx.done && root.InHand && root.InHand.agreed(w)) await root.InHand.caught(P, w, kind);      // (his father heard it from the anvil: js/inhand.js)
  }
  // The dares. The curfew bell, rung at midday: across to it, three strokes, and back to Tom, quick, the green all turning round.
  async function ringBell(f) {
    const b = sp.bell, m = P.motion; await m.goTo(b.at, b.yaw, { run: true }); m.lookAt(b.look);
    for (let k = 0; k < 3; k++) { await m.reach('R', b.look.clone().add(new V3(0, -4, 0))); const A = root.GameAudio; if (A && A.curfewBell) A.curfewBell(1, 1); await P.wait(0.5); await m.release('R'); await P.wait(0.3); }
    m.lookAt(null); for (const k in figs) if (k !== 'tom' && figs[k].want) { const g = figs[k]; if (!g.sat) g.motion.face(yawTo(g.motion.pos, b.at)); }
    rep.add('mischievous', 1, 'ringing the curfew bell at midday, on a dare'); save.flag('rang-bell', cal.day);
    await m.goTo(P.collide(flat(f.motion.pos).add(new V3(10, 0, 8)), 3.2), yawTo(m.pos, f.motion.pos), { run: true });
  }
  // A knock at the Dunns' door, with Master William asleep upstairs after his night's round; and away before the shutter opens.
  async function knock(f) {
    const d = sp.dunnsDoor, m = P.motion; await m.goTo(d.at, d.yaw, { run: true });
    for (let k = 0; k < 3; k++) { await m.reach('R', d.look.clone().setY(16)); const A = root.GameAudio; if (A && A.thud) A.thud(0.35); await m.release('R'); }
    rep.add('mischievous', 1, 'knocking on the Dunns’ door, on a dare'); save.flag('woke-willie', cal.day);
    await m.goTo(P.collide(flat(f.motion.pos).add(new V3(10, 0, 8)), 3.2), yawTo(m.pos, f.motion.pos), { run: true });
  }

  // ── For a scene: someone fetched out (at a spot, if they're not about), walked where it wants them (by the ways about), and let go again;
  // or kept in for the rest of the day.
  function summon(key, spot) {
    let f = figs[key]; if (!f) { f = spawn(key, { stand: spot }, false); }
    f.scene = {}; f.held = true; f.motion.auto = null; f.path = null; if (f.sat) { untake(f); f.motion.stand(); }
    return f;
  }
  function walkTo(key, at, yaw, speed) {
    const f = figs[key]; if (!f) return Promise.resolve();
    return new Promise(res => { f.scene = f.scene || {}; f.scene.arrived = res; walk(f, at, yaw); f.speed = speed; });
  }
  function letGo(key, awayToday) {
    const f = figs[key]; if (awayToday) change(s => { s.away = s.away || {}; s.away[key] = cal.day; });
    if (!f) return; f.scene = null; f.held = false; f.speed = null; if (awayToday) send(f, null); else if (f.want) send(f, f.want);
  }
  // (her, by the ways about, to a place)
  async function lead(to, yaw, o) { const pts = net.route(P.motion.pos, to); for (let i = 0; i < pts.length; i++) await P.motion.goTo(pts[i], i === pts.length - 1 ? yaw : null, o); }

  // ── The Watchman, on his round after the bell: if he sees her out, he stops her, and walks her home (a few steps behind her; the meadow
  // gate shut to her while he does). At her door, js/evening.js has him hand her over.
  function willieWatch() {
    const f = figs.willie; if (!f || f.follow || f.held || !cal.curfew() || !root.Evening || root.Evening.watchman(w) || P.busy) return;
    const red = P.motion.pos; if (Math.hypot(red.x - f.motion.pos.x, red.z - f.motion.pos.z) < 110) P.act(() => catchHer(f));
  }
  async function catchHer(f) {
    if (!f) return; hold(f);
    const n = root.Evening.caught(w);
    try { await meet(f, 14); await P.converse(S.willieCatch(n), { shot: ['red', 'willie'] }); }
    finally { f.held = false; f.follow = true; f.path = null; }
  }
  if (W.gate) W.gate.barred = () => !!(root.Evening && root.Evening.watchman(w));
  if (root.Evening && root.Evening.watchman(w) && cal.curfew()) { const f0 = () => figs.willie; setTimeout(() => { const f = f0(); if (f) f.follow = true; }, 0); }      // (still walking her home, as she comes back out)

  // ── The evening of Mistress Abney's promise, about five: whoever comes to find her (js/promise.js), fetched out if they're not about, and
  // walked to her; then let go again.
  let tempting = false;
  function promiseWatch() {
    const AP = root.AbneyPromise; if (!AP || tempting || P.busy) return;
    const who = AP.tempter(w); if (!who) return;
    tempting = true;
    P.act(async () => {
      try { const f = figs[who] || summon(who, PEOPLE[who].door); f.scene = f.scene || {}; f.held = true;
        const red = P.motion.pos, to = flat(red).add(flat(f.motion.pos).sub(flat(red)).setLength(14));
        await walkTo(who, to, yawTo(to, red), 0.9); await meet(f, 13);
        await AP.tempt(P, w, who); }
      finally { letGo(who); tempting = false; }
    });
  }

  // Each frame (while the place is played): who's where, their walking, and the figures themselves.
  const off = P.tick(dt => {
    clock += dt; if ((think -= dt) <= 0) { think = 0.5; update(false); }
    const cam = P.stage.camera.position;
    for (const key in figs) { const f = figs[key]; step(f, dt); f.motion.update(dt, null);
      // (too far off to make out: not drawn; their walking goes on)
      const far = Math.hypot(f.motion.pos.x - cam.x, f.motion.pos.z - cam.z) > FAR; f.rig.root.visible = !far; if (f.lantern) f.lantern.obj.visible = !far;
      if (!far) f.rig.tick(dt); }
    tomWatch(dt); willieWatch(); promiseWatch();
  });
  update(true);
  return { actions, station, here: key => figs[key] || null, figs, net, stop: off, talkTo, tomStops: () => figs.tom && tomStops(figs.tom), summon, walkTo, letGo, lead, hold, release };
}

const api = { attach, station, PEOPLE, tomFree, tomComes, hash };
root.Villagers = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
