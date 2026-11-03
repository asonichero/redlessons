// The implement always comes last: once a correction's brush (or anyone's own) is out, it's that to the end, never the hand after it; what
// she holds against her besides, and anything else owed tonight, by hand before it (js/story.js's marenClose).
const test = require('node:test'), assert = require('node:assert/strict');
require('../js/story.js'); const St = globalThis.Story;

// (a stand-in for js/correction.js's S: records what's in the giver's hand at every stroke, and what's said)
function stub(held) {
  const log = [], lap = { st: { implement: 'hand', drawers: 'up', skirt: 'down' } };
  const hit = n => { for (let i = 0; i < (n || 0); i++) log.push(lap.st.implement); };
  const S = { lap, held: held || 0, log,
    say: async () => {}, step: async (l, n) => hit(n), smacks: async n => hit(n), after: async (l, n) => hit(n == null ? 1 : n), wait: async () => {}, face: () => {},
    set: o => { if (o.implement === 'hand' && lap.st.implement !== 'hand') o = Object.assign({}, o, { implement: undefined }); for (const k of ['implement', 'drawers', 'skirt']) if (o[k]) lap.st[k] = o[k]; },
    gesture: async k => { if (k === 'drawers') lap.st.drawers = 'down'; if (k === 'skirt') lap.st.skirt = 'up'; },
    fetch: async id => { lap.st.implement = id; } };
  return S;
}
// (the hand, then the implement, and never the hand again)
const lastOnly = log => { const i = log.findIndex(x => x !== 'hand'); return i < 0 || log.slice(i).every(x => x !== 'hand'); };
const also = async Sc => { await Sc.step(['corrector', 'And the wood.'], 4); };

test('the Watchman’s walk home: what she holds and what else is owed, by hand, and then the hairbrush to the end', async () => {
  const S = stub(4); await St.curfewCorrection(S, { willie: true, also });
  assert.ok(S.log.includes('hairbrush')); assert.ok(lastOnly(S.log), S.log.join(','));
});
test('the garden, wanton and lied about, with more owed besides: the brush last', async () => {
  for (const how of [{ degree: 'wanton' }, { degree: 'wanton', lied: true }, { lied: true }, { degree: 'careless', willie: true }]) {
    const S = stub(3); await St.gardenCorrection(S, Object.assign({ also }, how));
    assert.ok(lastOnly(S.log), JSON.stringify(how) + ': ' + S.log.join(','));
  }
});
test('Lay day’s reckoning, with something else owed: the brush last', async () => {
  const S = stub(0); await St.maintenanceCorrection(S, { week: { items: [], corrected: 1, score: 8 }, also });
  assert.ok(S.log.includes('hairbrush')); assert.ok(lastOnly(S.log));
});
test('the homecoming, and the other givers’ own: their implement last', async () => {
  for (const f of [St.homecomingCorrection, St.pieTom, St.pieRed, St.loafCorrection, St.pieMaren, St.woodCorrection, St.promiseCorrection, St.dressCorrection]) {
    if (!f) continue; const S = stub(2); await f(S, { also, walk: { bluebells: 1, stream: 1, beech: 1 }, lied: true });
    assert.ok(lastOnly(S.log), S.log.join(','));
  }
});
