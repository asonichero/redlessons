// Little Red’s Lessons — how she's holding up: her capacity for the day (0..100), the small meter by her diary. It's the adult load she put
// down by being Little Red, and how much of it creeps back: rushing about, heavy carrying, the shifts, other people's grown-up asks wear it
// down; the simple things fill it again (sitting a while out of doors, the flower rows, dinner with her mother, her grandmother's cabin,
// being held to account). Low, she slows, can't run, and her thoughts say so: that's how a day goes wrong now, not by refusing it.
//
//   const c = Capacity.create(w) · c.value · c.add(n, why) (n < 0 to wear it down) · c.tick(P, dt, gameMinutes) (each frame) · c.low · c.worn
//   Capacity.START, LOW, WORN
// Kept in the save: state.capacity = { v, day, said: { low, worn, spent } (the day's thoughts, once each) }.
(function (root) {
'use strict';
const START = 80, LOW = 35, WORN = 18;
// (per game minute: out and about; running, besides; carrying something heavy; out after dark. And sitting down, a while)
const RATE = { about: 0.05, run: 0.3, heavy: 0.15, dark: 0.05, sit: 0.5, sitHome: 0.25 };
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };

function create(w) {
  const st = () => { const s = w.save.state.capacity || (w.save.state.capacity = { v: START, day: w.cal.day, said: {} });
    if (s.day !== w.cal.day && w.cal.minute >= H('05:00')) { s.v = Math.min(100, START - (s.late ? 15 : 0)); s.day = w.cal.day; s.said = {}; s.late = false; }      // (a new day: a night's sleep; less of one, after a late night)
    return s; };
  const set = v => w.save.change(s => { st(); s.capacity.v = Math.max(0, Math.min(100, v)); }, { capacity: true });
  const c = {
    get value() { return st().v; },
    get low() { return st().v < LOW; },
    get worn() { return st().v < WORN; },
    add(n, why) { set(st().v + n); },
    // (to bed after the bell: tomorrow starts lower)
    late() { w.save.change(s => { st(); s.capacity.late = true; }, { capacity: true }); },
    // Each frame, with the game minutes gone by: worn or rested by what she's doing; and a thought as she crosses each line, once a day.
    tick(P, dt, mins) {
      if (!P || !P.motion || !(mins > 0)) return;
      const m = P.motion, out = w.area !== 'home', moving = m.speed > 1, running = moving && m.runB > 0.5, heavy = !!(m.carry && m.carry.keep && m.carry.kind);
      let d = 0;
      if (P.sitting) d += (out ? RATE.sit : RATE.sitHome) * mins;
      else { if (out) d -= RATE.about * mins; if (running) d -= RATE.run * mins; if (heavy) d -= RATE.heavy * mins; if (out && w.cal.dark()) d -= RATE.dark * mins; }
      if (d) set(st().v + d);
      const v = st().v, said = st().said, S = root.Story;
      const once = (k, cond) => { if (!cond || said[k]) return; w.save.change(s => { st(); s.capacity.said[k] = true; }, { capacity: true }); if (P.talk && S && S.capacityThought) P.talk.muse(S.capacityThought(k, out), { face: k === 'low' ? 'calm' : 'wince' }); };
      once('low', v < LOW); once('worn', v < WORN); once('spent', v < 4);
    },
  };
  return c;
}

const api = { create, START, LOW, WORN, RATE };
root.Capacity = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
