// The scripted correction: every tier runs to its full count, clothes come off in order, her name (Rose) stops it at once, and too harsh ends it.
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../js/discipline.js'), C = require('../js/correctors.js');
const { createPain } = require('../js/pain.js');

// A stand-in for js/lap.js: smacks land at once, through the real pain model.
function fakeLap(opts = {}) {
  const pain = createPain({ tolerance: 1, resilience: 0.7 }), seen = [];
  const st = { hits: 0, peak: 0, red: false, ended: false, skirt: 'down', drawers: 'up', implement: 'hand', strength: 1 };
  return {
    pain, st, seen,
    set(o) { Object.assign(st, o); seen.push({ skirt: st.skirt, drawers: st.drawers, implement: st.implement, strength: st.strength }); },
    run(n) { for (let i = 0; i < n && !st.ended && !pain.tooHarsh; i++) { pain.hit({ implement: st.implement, strength: st.strength * (opts.boost || 1) }); st.hits++; st.peak = Math.max(st.peak, pain.distress()); if (opts.roseAt && st.hits >= opts.roseAt) this.rose(); } return true; },
    busy: () => false, rose() { st.rose = true; st.ended = true; }, end() { st.ended = true; },
  };
}
const quick = { sleep: () => Promise.resolve() };

test('each tier lands its full count', async () => {
  for (const t of D.TIERS) {
    const lap = fakeLap(), r = await D.run(lap, t, quick);
    assert.equal(r.hits, D.total(t), t); assert.ok(r.done && !r.rose && !r.tooHarsh, t);
  }
});

test('the tiers grow: more smacks, less on; no implement is the tier’s', () => {
  const totals = D.TIERS.map(D.total);
  for (let i = 1; i < totals.length; i++) assert.ok(totals[i] > totals[i - 1]);
  for (const t of D.TIERS) {
    const s = D.SCRIPTS[t];
    assert.equal(s[0].skirt, 'down');
    for (const x of s) { if (x.drawers === 'down') assert.equal(x.skirt, 'up'); assert.equal(x.impl, undefined); }
  }
});

test('the hand, unless the story brings out the corrector’s own, from the stage it says', async () => {
  const lap = fakeLap(), said = [];
  let r = await D.run(lap, 'firm', { sleep: quick.sleep, say: (t, k) => said.push(k) });
  assert.ok(lap.seen.every(x => x.implement === 'hand')); assert.equal(r.implement, null); assert.ok(!said.includes('implement'));
  const lap2 = fakeLap(), said2 = [];
  r = await D.run(lap2, 'firm', { implement: true, sleep: quick.sleep, say: (t, k) => said2.push([k, t]) });
  assert.equal(r.implement, 'hairbrush', 'her mother’s own');
  const stages = lap2.seen.filter((x, i) => i === 0 || x.implement !== lap2.seen[i - 1].implement || x.skirt !== lap2.seen[i - 1].skirt || x.drawers !== lap2.seen[i - 1].drawers);
  assert.equal(stages[stages.length - 1].implement, 'hairbrush'); assert.equal(lap2.seen[0].implement, 'hand', 'the last stage, by default');
  assert.ok(said2.find(([k, t]) => k === 'implement' && /hairbrush/.test(t)));
  const lap3 = fakeLap(); r = await D.run(lap3, 'light', { corrector: 'smith', implement: 'strap', implementFrom: 0, sleep: quick.sleep });
  assert.ok(lap3.seen.every(x => x.implement === 'strap'), 'from the first stage, when the story says');
});

test('every corrector has their own implement, and none is shared', () => {
  const I = require('../js/implements.js'), { PAIN } = require('../js/pain.js'), seen = new Set();
  for (const id in C.CORRECTORS) { const imp = C.CORRECTORS[id].implement; assert.ok(I.LIST[imp], id + ': ' + imp); assert.ok(!seen.has(imp), imp + ' is ' + id + '’s alone'); seen.add(imp); assert.equal(I.LIST[imp].of, id); }
  for (const id of I.ids) assert.ok(PAIN.implement[id], 'the pain of ' + id);
  assert.ok(!I.LIST.paddle && !PAIN.implement.paddle, 'there’s no standard paddle');
});

test('her name stops it at once and the gentle line answers it', async () => {
  const lap = fakeLap({ roseAt: 7 }), said = [];
  const r = await D.run(lap, 'severe', { sleep: quick.sleep, say: t => said.push(t) });
  assert.ok(r.rose && r.stopped && !r.done); assert.equal(r.hits, 7);
  assert.ok(/^Rose\b/.test(said[said.length - 1]));
});

test('too harsh ends it with nothing more struck', async () => {
  const lap = fakeLap({ boost: 6 }), said = [];
  const r = await D.run(lap, 'severe', { sleep: quick.sleep, say: t => said.push(t) });
  assert.ok(r.tooHarsh && !r.done); assert.ok(r.hits < D.total('severe'));
  assert.equal(said[said.length - 1], C.line(C.corrector('maren'), C.subject('red'), 'harsh'));
});

test('no corrector says the safe word, except to answer it; and at the Shoe she’s Rose, and her word is Red', () => {
  for (const id in C.CORRECTORS) {
    const c = C.corrector(id);
    for (const ctx of [undefined, 'shoe']) {
      const s = C.subject('red', ctx), re = new RegExp('\\b' + s.word + '\\b');
      for (const k in c.lines) for (let i = 0; i < 6; i++) { const l = C.line(c, s, k, i); if (k === 'stop') assert.ok(re.test(l), id + ' answers ' + s.word); else if (id !== 'maren' || ctx !== 'shoe') assert.ok(!re.test(l), id + '/' + (ctx || 'home') + '/' + k + ': ' + l); }
    }
  }
  const shoe = C.subject('red', 'shoe'); assert.equal(shoe.word, 'Red'); assert.deepEqual(shoe.names, ['Rose']); assert.ok(shoe.lights);
  assert.ok(/Rose/.test(C.line(C.corrector('brannock'), shoe, 'start')), 'at the Shoe she’s called Rose');
});

test('amber, where the house has one: answered, and gentler after', async () => {
  const lap = fakeLap(), said = [];
  lap.st.amber = true;
  await D.run(lap, 'light', { corrector: 'brannock', subject: 'red', context: 'shoe', sleep: quick.sleep, say: (t, k) => said.push(k) });
  assert.ok(said.includes('amber')); assert.ok(lap.seen[lap.seen.length - 1].strength < 0.85);
});
