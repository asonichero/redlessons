// The loaf (js/loaf.js): a piece at each meal; down to the heel, another to fetch from Mistress Pennock's counter; and some of it to the ducks,
// back on the board, noticed at the next meal: "I was hungry" (a lie: wilful, chided, one toward the week's three) or the truth (a correction).
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
require('../js/story.js'); const Loaf = require('../js/loaf.js');

function world() {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save), slid = [], owed = [];
  save.change(s => { s.day = 5; s.minute = 8 * 60; s.chores = { day: 5 }; }, { time: true });
  globalThis.Evening = { owe: async (P, w, kind, how) => { owed.push({ kind, how }); }, owes: () => false };
  return { save, cal, rep, slid, owed, refresh() {}, chores: { slid: why => slid.push(why), due: () => false } };
}
// (a player who answers each choice with the one asked for, and remembers what was said)
const player = pick => { const said = []; return { said, talk: {}, async wait() {}, async approach() {}, async converse(lines) {
  for (const l of lines) { if (l.text) said.push(l.text); if (l.run) l.run(); if (l.choose) { const c = l.choose[pick || 0]; for (const x of c.then || []) { if (x.text) said.push(x.text); if (x.run) x.run(); } } } } }; };

test('a piece at each meal; down to the heel, her mother asks for another from the counter', async () => {
  const w = world(), P = player();
  assert.equal(Loaf.bread(w).left, 1); assert.ok(Loaf.onBoard(w));
  for (const m of ['breakfast', 'dinner', 'supper', 'breakfast', 'dinner']) await Loaf.eat(P, w, m);
  assert.ok(Loaf.bread(w).left > 0 && !Loaf.bread(w).need, 'near two days’ meals, and some left');
  await Loaf.eat(P, w, 'supper');
  assert.equal(Loaf.bread(w).left, 0); assert.ok(Loaf.bread(w).need); assert.ok(P.said.some(t => /Mistress Pennock’s counter/.test(t)));
  assert.match(Loaf.objective(w), /fresh loaf/); assert.equal(Loaf.onBoard(w), false);
  Loaf.fresh(w); assert.equal(Loaf.bread(w).left, 1); assert.equal(Loaf.objective(w), null);
});

test('gone down to the ducks, back on the board: "I was hungry" is a lie, wilful, and counted; the truth, a correction', async () => {
  for (const [pick, lie] of [[0, true], [1, false]]) {
    const w = world(), P = player(pick);
    w.save.change(s => { s.chores.bread = { left: 0.55, fed: 0.45 }; s.chores.loaf = { day: 5, state: 'back' }; });
    assert.ok(Loaf.asks(w, 'dinner'));
    const n0 = w.rep.stat('naughty'), owed = await Loaf.evening(P, w, { table: true });
    assert.equal(Loaf.bread(w).fed, 0); assert.ok(w.rep.stat('naughty') > n0);
    if (lie) { assert.equal(owed, false); assert.deepEqual(w.slid, ['eating between meals']); assert.equal(w.owed.length, 0); }
    else { assert.equal(owed, true); assert.equal(w.slid.length, 0); assert.equal(w.owed[0].kind, 'loaf'); }
  }
});

test('shopping: named over breakfast on top of the errand, not one itself; at supper, twice grateful for both, understanding if one’s missed', async () => {
  const w = world(), P = player(); w.save.change(s => { s.chores.bread = { left: 0, need: true }; });
  await Loaf.shopAsk(P, w, 'well'); assert.ok(P.said.some(t => /on top of that/.test(t)));
  assert.deepEqual(Loaf.shopping(w), { asked: true, done: false });
  w.save.change(s => { s.chores.bread.got = 5; }); assert.deepEqual(Loaf.shopping(w), { asked: true, done: true });
  const Report = require('../js/report.js'); w.save.change(s => { s.chores = Object.assign(s.chores, { day: 5, errand: { id: 'well', state: 'done', by: 600 } }); });
  let t = Report.topics(null, w, 'supper').find(x => x.id === 'shop'); assert.match(t.tell.map(l => l.text).join(' '), /twice grateful/);
  w.save.change(s => { s.chores.bread.got = 0; }); t = Report.topics(null, w, 'supper').find(x => x.id === 'shop'); assert.match(t.tell.map(l => l.text).join(' '), /Never mind/);
});

test('owned up to the ducks: the heel is hers for them, the morning it’s all that’s left', async () => {
  const w = world(), P = player(1);
  w.save.change(s => { s.chores.bread = { left: 0.55, fed: 0.45 }; s.chores.loaf = { day: 5, state: 'back' }; });
  await Loaf.evening(P, w, { table: true });
  assert.ok(w.save.state.flags['heel-for-ducks'] != null); assert.ok(P.said.some(t => /had the heel/.test(t)));
  w.save.change(s => { s.chores.bread.left = 0.2; }); await Loaf.eat(P, w, 'breakfast');
  assert.ok(Loaf.bread(w).heelDue, 'down to the heel: due in her basket');
});
