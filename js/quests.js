// Little Red’s Lessons — the quest engine: each quest line as steps, the phases of the three acts, the gates that hold the story in order, all as
// data (js/questdata.js), read against the saved game (js/save.js), her reputation (js/reputation.js) and the calendar (js/calendar.js).
//
// A step is offered when its line has come to it (every step before it that isn't optional is done), its phase has been reached, its own
// condition holds, its gate (if it names one) is open, and its line isn't paused in this phase. A scene (js/world.js) completes it.
//
//   const q = Quests.create(save, Quests.DATA, { rep, cal, area: () => 'home' })
//   q.test(cond) · q.phase() → '1.2' · q.phaseOf(id) · q.done('maren.homecoming') · q.lineDone('tom') · q.gateOpen('act1')
//   q.offered({ where, who }) → the steps on offer (there, with them) · q.next('tom') → { step, state } · q.complete('tom.pie') · q.journal()
//   q.on(fn): told { done: 'line.step' } and { phase: '1.3' } as they happen
//
// Conditions (cond), as plain data: true · { all: [..] } · { any: [..] } · { not: c } · { flag: 'x' } (or { flag, is }) · { done: 'line.step' } or
// { done: 'line' } (all of it) · { phase: '1.2' } (reached) · { gate: 'id' } · { stat: 'wilful', gte, lt } · { known: 'wilful', gte } ·
// { trust: 'who', gte } · { open: 'who', gte } · { village: { gte } } · { disclosure: { gte } } · { part: 'night' or [..] } · { curfew: true } ·
// { day: { gte } } · { since: 'line.step', days: n } · { area: 'home' } · { item: 'posy' }
(function (root) {
'use strict';
const cmp = (v, c) => (c.gte == null || v >= c.gte) && (c.gt == null || v > c.gt) && (c.lte == null || v <= c.lte) && (c.lt == null || v < c.lt) && (c.is == null || v === c.is);
const phaseKey = id => id.split('.').map(Number);
const phaseLE = (a, b) => { const [a1, a2] = phaseKey(a), [b1, b2] = phaseKey(b); return a1 < b1 || (a1 === b1 && a2 <= b2); };

function create(save, data, env) {
  env = env || {};
  const S = () => save.state, D = data || root.QuestData, listeners = [];
  const tell = e => { for (const f of listeners.slice()) f(e); };
  const LINES = {}; for (const l of D.lines) LINES[l.id] = l;
  const GATES = {}; for (const g of D.gates) GATES[g.id] = g;
  const stepOf = ref => { const [li, si] = ref.split('.'); const l = LINES[li]; const s = l && l.steps.find(x => x.id === si); if (!s) throw new Error('Quests: no step ' + ref); return s; };
  const isDone = ref => { const [li, si] = ref.split('.'); return !!(S().quests[li] && S().quests[li][si] != null); };
  const lineDone = li => LINES[li].steps.every(s => s.optional || isDone(li + '.' + s.id));

  function test(c) {
    if (c == null || c === true) return true; if (c === false) return false;
    if (Array.isArray(c)) return c.every(test);
    if (c.all) return c.all.every(test); if (c.any) return c.any.some(test); if (c.not) return !test(c.not);
    if (c.flag) return c.is !== undefined ? S().flags[c.flag] === c.is : !!S().flags[c.flag];
    if (c.done) return c.done.includes('.') ? isDone(c.done) : lineDone(c.done);
    if (c.phase) return phaseLE(c.phase, phase());
    if (c.gate) return gateOpen(c.gate);
    if (c.stat) return cmp(S().stats[c.stat] || 0, c);
    if (c.known) return cmp(env.rep ? env.rep.known(c.known) : 0, c);
    if (c.trust) return cmp(S().trust[c.trust] || 0, c);
    if (c.open) return cmp(S().open[c.open] || 0, c.gte == null && c.lt == null && c.is == null ? { gte: 1 } : c);
    if (c.village) return cmp(env.rep ? env.rep.village() : 0, c.village);
    if (c.disclosure) return cmp(env.rep ? env.rep.disclosure() : 0, c.disclosure);
    if (c.part) { const p = env.cal ? env.cal.part : null; return Array.isArray(c.part) ? c.part.includes(p) : p === c.part; }
    if (c.curfew != null) return !!(env.cal && env.cal.curfew()) === !!c.curfew;
    if (c.day) return cmp(S().day, c.day);
    if (c.since) { const [li, si] = c.since.split('.'), d = S().quests[li] && S().quests[li][si]; return d != null && S().day - d >= (c.days || 1); }
    if (c.area) return env.area ? env.area() === c.area : false;
    if (c.item) return S().items.includes(c.item);
    throw new Error('Quests: what condition is ' + JSON.stringify(c));
  }

  // The phase reached: phases are reached in order, each once its condition holds, and never lost.
  function phase() {
    let at = S().flags.phase || D.phases[0].id;
    for (;;) {
      const i = D.phases.findIndex(p => p.id === at), nx = D.phases[i + 1];
      if (!nx || !testNoPhase(nx.requires)) break;
      at = nx.id;
    }
    if (at !== (S().flags.phase || D.phases[0].id)) { const was = S().flags.phase; S().flags.phase = at; save.write(); if (was !== at) tell({ phase: at }); }
    return at;
  }
  // (a phase's own condition is tested without asking for the phase, which is what's being worked out)
  let inPhase = false;
  function testNoPhase(c) { if (inPhase) return false; inPhase = true; try { return test(c); } finally { inPhase = false; } }
  const phaseOf = id => D.phases.find(p => p.id === id);
  function gateOpen(id) { const g = GATES[id]; if (!g) throw new Error('Quests: no gate ' + id); return test(g.requires); }

  const paused = l => (l.paused || []).some(([a, b]) => phaseLE(a, phase()) && phaseLE(phase(), b));
  // Whether a step is on offer now, and if not, why.
  function stateOf(li, s) {
    const l = LINES[li], ref = li + '.' + s.id;
    if (isDone(ref)) return 'done';
    const i = l.steps.indexOf(s); if (l.steps.slice(0, i).some(p => !p.optional && !isDone(li + '.' + p.id))) return 'later';
    if (!phaseLE(s.phase, phase())) return 'later';
    if (paused(l)) return 'paused';
    if (s.gate && !gateOpen(s.gate)) return 'gated';
    if (!test(s.when)) return 'waiting';
    return 'offered';
  }
  function offered(o) {
    o = o || {}; const out = [];
    for (const l of D.lines) for (const s of l.steps) if (stateOf(l.id, s) === 'offered' && (!o.where || !s.where || s.where === o.where) && (!o.who || s.who === o.who)) out.push(Object.assign({ ref: l.id + '.' + s.id, line: l.id }, s));
    return out;
  }
  function next(li) { const l = LINES[li]; for (const s of l.steps) { const st = stateOf(li, s); if (st !== 'done') return { step: s, ref: li + '.' + s.id, state: st }; } return { step: null, state: 'done' }; }
  function complete(ref) {
    stepOf(ref); if (isDone(ref)) return false;
    const before = phase(), [li, si] = ref.split('.');
    save.change(s => { (s.quests[li] = s.quests[li] || {})[si] = s.day; }, { quest: ref });
    tell({ done: ref }); const after = phase(); return { ref, phase: after, phaseChanged: after !== before };
  }
  // The journal: each line that has begun, where it's got to.
  function journal() {
    return D.lines.map(l => {
      const n = next(l.id), total = l.steps.filter(s => !s.optional).length, doneN = l.steps.filter(s => !s.optional && isDone(l.id + '.' + s.id)).length;
      const begun = doneN > 0 || (n.step && ['offered', 'gated', 'waiting', 'paused'].includes(n.state));
      return { line: l.id, name: l.name, main: !!l.main, begun, state: lineDone(l.id) ? 'done' : paused(l) ? 'paused' : n.state, step: n.step, done: doneN, total };
    }).filter(j => j.begun);
  }
  return { test, phase, phaseOf, done: isDone, lineDone, gateOpen, offered, next, complete, journal, stateOf: ref => { const [li] = ref.split('.'); return stateOf(li, stepOf(ref)); }, step: stepOf, lines: LINES, gates: GATES, data: D, on: f => { listeners.push(f); } };
}

const api = { create, phaseLE };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Quests = api;
})(typeof window !== 'undefined' ? window : globalThis);
