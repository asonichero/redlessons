// Little Red’s Lessons — the inn's evening (js/work.js's inn shift, asked for at breakfast): Mistress Abney's out, and it's Bess's to run from
// her chair by the hearth, with Red for her legs. The carrier's men come in at about five (big Ned, old Amos, young Kit), sit at the table by
// the hearth, and call for ale or stew; Red draws the ale at the barrels and ladles the stew from the pot on the fire, and takes each to the
// man who asked. Keep one waiting too long and Bess hauls herself up and does it herself: the very thing her mother asked Red to see she
// didn't. (In the lulls, Bess asks her to sit a minute: js/work.js.)
//
//   const s = InnShift.attach(P, w, { active() (the service under way), done() (all of them served) }) → { actions(), quiet(), up, gone() }
// Kept in the save, with the shift (state.work.svc): { arrive (the minute they come), orders: [{ who, want, at, state }], up (Bess on her
// feet, times), sat (Red sat with her, times) }. And state.bessTalk = { n } (the pieces of her story told, across shifts).
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z), flat = v => new V3(v.x, 0, v.z);
// (the men: their figures, how they're named in the talk, and their voices)
const MEN = [
  { key: 'ned', rig: 'carrierNed', name: 'Ned', voice: 'smith', tint: '#5a4a34', bg: '#e8e0d0' },
  { key: 'amos', rig: 'carrierAmos', name: 'Old Amos', voice: 'baker', tint: '#5a5040', bg: '#e6e2d6' },
  { key: 'kit', rig: 'carrierKit', name: 'Kit', voice: 'georgie', tint: '#4a4a52', bg: '#e0e0e6' },
];
// (the evening's orders: who, for what, and how long after they've come in (game minutes); how long a man will wait)
const ORDERS = [['ned', 'ale', 4], ['amos', 'stew', 12], ['kit', 'ale', 22], ['ned', 'stew', 34], ['amos', 'ale', 46], ['kit', 'stew', 56], ['ned', 'ale', 70]];
const PATIENCE = 32, ARRIVE = 55;
const WANT = { ale: { source: 'counter', label: 'Draw ale', give: 'his ale', prop: 'jug', style: 'hang' }, stew: { source: 'fire', label: 'Ladle out stew', give: 'his stew', prop: 'bowl', style: 'front' } };

// A bowl of stew, to carry.
function bowlProp() {
  const T = root.Toon, g = new THREE.Group(), m = new THREE.Mesh(new THREE.LatheGeometry([[0.01, 0], [1.4, 0.1], [2.0, 1.2], [2.1, 1.4]].map(([r, h]) => new THREE.Vector2(r, h)), 14), T.mat('#8a6a4a'));
  m.material.side = THREE.DoubleSide; g.add(m); const st = new THREE.Mesh(new THREE.CircleGeometry(1.8, 14), T.mat('#9a5a32')); st.rotation.x = -Math.PI / 2; st.position.y = 1.1; g.add(st);
  return { obj: g, name: 'a bowl of stew', grip: new V3(0, 1.4, 0), radius: 2, keep: true, style: 'front' };
}

function attach(P, w, o) {
  const S = root.Story, W = P.world, m = P.motion, talk = P.talk, lines = (S.WORK && S.WORK.inn) || {};
  const work = () => w.save.state.work, svc = () => work().svc || null;
  const change = fn => w.save.change(s => { s.work.svc = s.work.svc || { arrive: 0, orders: [], up: 0, sat: 0 }; fn(s.work.svc); }, { work: true });
  const men = {}, seats = W.carrierSeats || [], spots = W.work || {};
  let carrying = null, hinted = {}, said = {};
  const arrive = async (at, yaw) => { const to = flat(at); await Promise.race([m.goTo(to, yaw), P.wait(7)]);      // (put there, if the way's not found: never left short of it)
    if (Math.hypot(m.pos.x - to.x, m.pos.z - to.z) > 2.5) { m.auto = null; const p = P.collide(to, 3.2); m.warp(p, yaw == null ? m.yaw : yaw); P.rig.root.position.copy(p); } };
  // (what's said, queued and played as lines to be read, one after another, when she's between things: never over each other)
  const queue = [];
  const say = (who, text, face) => { if (talk && talk.cast[who]) queue.push({ who, face: face || 'calm', listen: { red: 'calm' }, text }); };
  const muse = (text, face) => queue.push({ who: 'red', face: face || 'calm', thought: true, text });
  P.tick(() => { if (queue.length && !P.busy && !(talk && talk.playing)) { const ls = queue.splice(0); P.act(() => P.converse(ls, { shot: false, keepCamera: true })); } });
  const bess = () => P.figure('bess');

  // The men in at the door, each to his place on the benches, and sat; or already there (back in, mid-evening).
  function spawn(i, walk) {
    const D = MEN[i], seat = seats[i]; if (!seat || men[D.key]) return;
    const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}, rig = root.Toon.make(D.rig, looks[D.rig] || {}), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, D.key) });
    const front = P.collide(flat(seat.at).add(new V3(Math.sin(seat.facing), 0, Math.cos(seat.facing)).multiplyScalar(5)), 3, D.key);
    const f = { rig, motion }; men[D.key] = f;
    P.addFigure(D.key, { rig, motion, cast: { name: D.name, voice: D.voice, tint: D.tint, bg: D.bg } });
    P.tick(dt => { motion.update(dt, null); rig.tick(dt); });
    const sit = () => { motion.warp(front, seat.facing); motion.sit(seat); };
    if (!walk) { sit(); motion.sitW = 1; return; }
    const door = W.entries && W.entries.door ? new V3(W.entries.door.at[0], 0, W.entries.door.at[1] - 3) : new V3(4, 0, 26);
    motion.warp(door, Math.PI); rig.root.position.copy(door);
    setTimeout(() => { Promise.race([motion.goTo(front, seat.facing), P.wait(12)]).then(sit); }, i * 900);
  }
  function gone() { for (const k in men) P.removeFigure(k); }

  // (when they come in: the service begun, and not before a while into the shift)
  const due = () => { const s = svc(); return !!(s && s.arrive && w.cal.minute >= s.arrive); };
  const open = () => { const s = svc(); return s ? s.orders.filter(x => x.state === 'waiting') : []; };
  const label = x => { const D = MEN.find(d => d.key === x.who); return D ? D.name : 'him'; };

  // Each moment, while the service is the task in hand: the men in at their hour; their orders called, each in turn; a man kept waiting too
  // long, and Bess on her feet; and when all of them have been seen to, done.
  P.tick(() => {
    if (!o.active()) return;
    if (!svc()) change(s => { s.arrive = Math.max(w.cal.minute + 5, (work().start || w.cal.minute) + ARRIVE); });
    const s = svc(); if (!due()) return;
    if (!men.ned) { for (let i = 0; i < MEN.length; i++) spawn(i, true); if (!said.in) { said.in = true; P.wait(4).then(() => { say('ned', lines.inNed || 'Evening, Bess!', 'smile'); say('bess', lines.inBess || 'Behave, all of you.', 'cheeky'); }); } }
    if (P.busy || (talk && talk.playing)) return;
    const t = w.cal.minute - s.arrive;
    // (the next order, called when it's time)
    const next = !carrying && !open().length && !queue.length ? ORDERS.find((x, i) => !s.orders[i] && t >= x[2]) : null;      // (one at a time: the next called once the last's been seen to)
    if (next) { const i = ORDERS.indexOf(next); change(v => { v.orders[i] = { who: next[0], want: next[1], at: w.cal.minute, state: 'waiting' }; });
      const call = (lines.calls && lines.calls[next[0] + ':' + next[1]]) || (next[1] === 'ale' ? 'Ale here, miss!' : 'Is there stew?');
      say(next[0], call, 'smile');
      if (!hinted[next[1]] && lines.hint && lines.hint[next[1]]) { hinted[next[1]] = true; say('bess', lines.hint[next[1]], 'calm'); }
      if (i === 2 && lines.robert && !said.robert) { said.robert = true; say('amos', lines.robert[0], 'concerned'); muse(lines.robert[1], 'shy'); }
      w.refresh(); }
    // (kept waiting: Bess up out of her chair to see to it herself)
    const late = s.orders.findIndex(x => x && x.state === 'waiting' && w.cal.minute - x.at > PATIENCE && !(carrying && carrying.i === s.orders.indexOf(x)));
    if (late >= 0) { change(v => { v.orders[late].state = 'bess'; v.up = (v.up || 0) + 1; }); P.act(() => bessUp(late)); return; }
    if (s.orders.length === ORDERS.length && s.orders.every(x => x && x.state !== 'waiting') && !carrying) { gone(); o.done(); }
  });
  async function bessUp(i) {
    const f = bess(), seat = W.bessChair, x = svc().orders[i];
    say('bess', lines.up || 'I’ll get it myself.', 'pout');
    if (f && seat) { await f.motion.stand(); await P.wait(2.5); f.motion.sit(seat); }
    muse((lines.upRed || [])[Math.min((svc().up || 1) - 1, 1)] || 'She’s on her feet.', 'wince');
    if (carrying && carrying.i === i) { const it = m.drop(); if (it) P.stage.scene.remove(it.obj); carrying = null; }
    w.refresh();
  }

  // What she can do: for each order waiting, fetch it at its source (her hands free); with it in her hands, take it to him. And in a lull,
  // with no one waiting, sit with Bess a minute.
  async function fetch(i) {
    const x = svc().orders[i], wnt = WANT[x.want], sp = spots[wnt.source];
    await arrive(sp.at, sp.yaw); m.lookAt(sp.look);
    for (let k = 0; k < 2; k++) { await m.reach('R', sp.look.clone().add(new V3((k - 0.5) * 2, 0, 0))); await P.wait(0.4); await m.release('R'); }
    m.lookAt(null);
    const it = x.want === 'ale' ? (root.Chores ? root.Chores.prop('jug') : null) : bowlProp(); if (it) { P.stage.scene.add(it.obj); m.hold(it, wnt.style); }
    carrying = { i, it }; w.refresh();
  }
  async function give(i) {
    const x = svc().orders[i], seat = seats[MEN.findIndex(d => d.key === x.who)], sp = seat.serve;
    await arrive(P.collide(sp.at, 3.2), yawTo(sp.at, seat.at)); m.lookAt(sp.look);
    await m.reach(m.carryStyle === 'front' ? 'L' : 'R', sp.look.clone()); const it = m.drop(); if (it) P.stage.scene.remove(it.obj); await m.release('L'); await m.release('R'); m.lookAt(null);
    carrying = null; change(v => { v.orders[i].state = 'served'; });
    const thanks = (lines.thanks || [])[i % Math.max(1, (lines.thanks || []).length)]; if (thanks) say(x.who, thanks, 'smile');
    w.cal.advance(3); w.refresh();
  }
  function actions() {
    const s = svc(), out = [];
    if (s && due()) {
      if (carrying) { const x = s.orders[carrying.i], seat = seats[MEN.findIndex(d => d.key === x.who)]; if (seat) out.push({ label: 'Take ' + label(x) + ' ' + WANT[x.want].give, at: seat.at.clone().setY(16), reach: 45, run: () => give(carrying.i) }); }
      else for (const x of open()) { const i = s.orders.indexOf(x), wnt = WANT[x.want], sp = spots[wnt.source]; if (sp) out.push({ label: wnt.label + ' for ' + label(x), at: sp.look.clone(), reach: 45, run: () => m.carry ? P.handsFull() : fetch(i), full: !!m.carry }); }
    }
    return out;
  }
  // (back in, with the men already in: there at their places)
  if (svc() && due()) for (let i = 0; i < MEN.length; i++) spawn(i, false);
  // (quiet: nobody waiting on her, and nothing in her hands for them: a time Bess might ask her to sit (js/work.js))
  const quiet = () => !carrying && !open().length;
  return { actions, quiet, get up() { return (svc() || {}).up || 0; }, gone };
}

const api = { attach, MEN, ORDERS, PATIENCE, ARRIVE };
root.InnShift = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
