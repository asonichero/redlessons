// Act 1's end (1.3, Into the Wood): the smith's gate opens once Tom's told; Mistress Abney's once she trusts Red and has been told; and with
// the five done (the smith's standard, Mistress Pennock's trust, Mistress Abney's taking her in hand, Holt met, the stranger met), Act 2.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Quests = require('../js/quests.js'), DATA = require('../js/questdata.js'), InHand = require('../js/inhand.js'), IntoWood = require('../js/intowood.js');

function world() {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  const q = Quests.create(save, DATA, { rep, cal, area: () => 'village' });
  for (const r of ['hulda.cloak', 'maren.walk', 'maren.homecoming', 'maren.chores', 'tom.dares', 'tom.pie', 'abney.work', 'abney.promise', 'hulda.errands', 'pennock.helps', 'pennock.pie']) q.complete(r);
  save.change(s => { s.day = 8; s.minute = 15 * 60; }, { time: true });
  return { save, cal, rep, q };
}

test('1.3 opens on the pie, the promise and the herbs; Holt and the stranger are due', () => {
  const w = world();
  assert.equal(w.q.phase(), '1.3');
  assert.ok(IntoWood.holtDue(w)); assert.ok(IntoWood.wolfeDue(w));
});

test('the smith: not until Tom knows; then hers to ask, once a day', () => {
  const w = world();
  assert.equal(InHand.smithWants(w), false);
  w.rep.trusts('tom', 3); assert.ok(InHand.tomWants(w));
  w.rep.tell('tom', 1); w.q.complete('tom.told');
  assert.ok(InHand.smithWants(w)); assert.equal(InHand.agreed(w), false);
  w.save.state.inhand.smithAsked = 8; assert.equal(InHand.smithWants(w), false, 'not twice a day');
  w.save.state.inhand.agreed = 8; assert.ok(InHand.agreed(w));
});

test('Mistress Abney: gated until she trusts Red and has been told', () => {
  const w = world();
  assert.equal(w.q.stateOf('abney.inhand'), 'gated');
  w.rep.trusts('abney', 3); w.rep.tell('abney', 2); assert.equal(w.q.stateOf('abney.inhand'), 'offered');
});

test('the five done, and Act 1 gives way to Act 2', () => {
  const w = world();
  w.rep.tell('tom', 1); w.rep.trusts('abney', 3); w.rep.tell('abney', 2);
  for (const r of ['hulda.holt', 'holt.meet', 'wolfe.meet', 'tom.smith', 'pennock.trust', 'abney.inhand']) w.q.complete(r);
  assert.ok(w.q.gateOpen('act1')); assert.equal(w.q.phase(), '2.1');
});
