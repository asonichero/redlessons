// Agnes and Georgie, after the fair (js/agnes.js): away from the well till it's settled; the kiss heard of if not seen; Georgie's step gated on
// Agnes told, his trust, and Red taken in hand by someone besides her mother; the afternoon in the wood, the two of them gone from the village;
// and missed, it's settled all the same. Settled, and Act 1 gives way.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Quests = require('../js/quests.js'), DATA = require('../js/questdata.js'), Fair = require('../js/fair.js'), Agnes = require('../js/agnes.js');
const H = h => h * 60;

function world() {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  const q = Quests.create(save, DATA, { rep, cal, area: () => 'village' });
  for (const r of ['hulda.cloak', 'maren.walk', 'maren.homecoming', 'maren.chores', 'tom.dares', 'tom.pie', 'abney.work', 'abney.promise', 'hulda.errands', 'pennock.helps']) q.complete(r);
  save.change(s => { s.day = 14; s.minute = H(10); s.fair = { planted: 6, day: 13, fitted: 12, late: false, spoil: {} }; }, { time: true });
  return { save, cal, rep, q, complete: r => q.complete(r), refresh() {} };
}

test('after the fair: the kiss heard of, Agnes found at the pinfold, not the well', () => {
  const w = world();
  Agnes.morning(w);
  assert.ok(w.save.state.flags['fair-kiss'] && w.save.state.flags['fair-kiss-heard']); assert.ok(w.q.done('agnes.kiss'));
  assert.ok(Agnes.away(w)); assert.deepEqual(Agnes.station(w, 'agnes', H(10)), { stand: 'pinfold' }); assert.equal(Agnes.station(w, 'agnes', H(20)), null);
  assert.equal(Agnes.station(w, 'georgie', H(10)), undefined, 'Georgie’s day as it always is');
  assert.equal(w.q.stateOf('agnes.found'), 'offered');
});

test('Georgie: only once Agnes is told, he trusts her, and someone besides her mother has taken her in hand', () => {
  const w = world(); Agnes.morning(w); w.q.complete('agnes.found');
  assert.notEqual(w.q.stateOf('agnes.georgie'), 'offered');
  w.rep.trusts('agnes', 3); assert.equal(w.q.stateOf('agnes.told'), 'offered'); w.q.complete('agnes.told');
  w.rep.trusts('georgie', 3); assert.notEqual(w.q.stateOf('agnes.georgie'), 'offered', 'not on trust alone: Lay night, or more trust');
  w.save.flag('georgie-walked', 15); assert.notEqual(w.q.stateOf('agnes.georgie'), 'offered', 'and someone besides her mother');
  w.q.complete('pennock.pie'); assert.equal(w.q.stateOf('agnes.georgie'), 'offered');
});

test('the afternoon in the wood: the two of them gone from the village; missed, it’s settled all the same; and Act 1 can end', () => {
  const w = world(); Agnes.morning(w);
  w.save.change(s => { s.agnes = { terms: { day: 15, red: true } }; });
  w.save.change(s => { s.day = 15; s.minute = H(14); }, { time: true });
  assert.ok(Agnes.woodDue(w)); assert.equal(Agnes.station(w, 'agnes', H(14)), null); assert.equal(Agnes.station(w, 'georgie', H(14)), null);
  w.save.change(s => { s.day = 16; s.minute = H(7); }, { time: true }); Agnes.morning(w);
  assert.ok(w.q.done('agnes.settled')); assert.equal(Agnes.stateOf(w).settled, 'yes'); assert.ok(Agnes.stateOf(w).missed);
  assert.equal(Agnes.away(w), false); assert.equal(Agnes.station(w, 'agnes', H(10)), undefined, 'back at the well');
  for (const r of ['tom.smith', 'pennock.trust', 'abney.inhand', 'hulda.holt', 'holt.meet']) w.q.complete(r);
  assert.ok(w.q.gateOpen('act1'));
});
