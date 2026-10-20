// The scripted correction: every tier runs to its full count, clothes come off in order, Red stops it at once, and too harsh ends it.
const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../js/discipline.js');
const { createPain } = require('../js/pain.js');

// A stand-in for js/lap.js: smacks land at once, through the real pain model.
function fakeLap(opts = {}) {
  const pain = createPain({ tolerance: 1, resilience: 0.7 }), seen = [];
  const st = { hits: 0, peak: 0, red: false, ended: false, trousers: 'up', drawers: 'up', implement: 'hand', strength: 1 };
  return {
    pain, st, seen,
    set(o) { Object.assign(st, o); seen.push({ trousers: st.trousers, drawers: st.drawers, implement: st.implement }); },
    run(n) { for (let i = 0; i < n && !st.ended && !pain.tooHarsh; i++) { pain.hit({ implement: st.implement, strength: st.strength * (opts.boost || 1) }); st.hits++; st.peak = Math.max(st.peak, pain.distress()); if (opts.redAt && st.hits >= opts.redAt) this.red(); } return true; },
    busy: () => false, red() { st.red = true; st.ended = true; }, end() { st.ended = true; },
  };
}
const quick = { sleep: () => Promise.resolve() };

test('each tier lands its full count', async () => {
  for (const t of D.TIERS) {
    const lap = fakeLap(), r = await D.run(lap, t, quick);
    assert.equal(r.hits, D.total(t), t); assert.ok(r.done && !r.red && !r.tooHarsh, t);
  }
});

test('the tiers grow: more smacks, less on, the paddle last', () => {
  const totals = D.TIERS.map(D.total);
  for (let i = 1; i < totals.length; i++) assert.ok(totals[i] > totals[i - 1]);
  for (const t of D.TIERS) {
    const s = D.SCRIPTS[t];
    assert.equal(s[0].trousers, 'up');
    for (const x of s) if (x.drawers === 'down') assert.equal(x.trousers, 'down');
    const p = s.findIndex(x => x.impl === 'paddle'); if (p >= 0) assert.equal(p, s.length - 1);
  }
});

test('Red stops it at once and she says the gentle line', async () => {
  const lap = fakeLap({ redAt: 7 }), said = [];
  const r = await D.run(lap, 'severe', { sleep: quick.sleep, say: t => said.push(t) });
  assert.ok(r.red && !r.done); assert.equal(r.hits, 7);
  assert.equal(said[said.length - 1], D.LINES.red);
});

test('too harsh ends it with nothing more struck', async () => {
  const lap = fakeLap({ boost: 6 }), said = [];
  const r = await D.run(lap, 'severe', { sleep: quick.sleep, say: t => said.push(t) });
  assert.ok(r.tooHarsh && !r.done); assert.ok(r.hits < D.total('severe'));
  assert.equal(said[said.length - 1], D.LINES.harsh);
});
