// The pie (js/pie.js): when Tom has his idea; and that it comes round again until she's asked to share his correction.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Quests = require('../js/quests.js'), DATA = require('../js/questdata.js');
const Pie = require('../js/pie.js');

function world(o) {
  o = o || {};
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  const q = Quests.create(save, DATA, { rep, cal, area: () => 'village' });
  for (const r of ['hulda.cloak', 'maren.walk', 'maren.homecoming', 'maren.chores'].concat(o.done || [])) q.complete(r);
  save.change(s => { s.day = o.day || 5; s.minute = (o.hour || 14) * 60; }, { time: true });
  if (o.trust !== false) { rep.trusts('pennock', 2); rep.trusts('tom', 2); }
  return { save, cal, rep, q };
}

test('the first time: once both trust her, and the dares are behind them; in the afternoon', () => {
  assert.equal(Pie.ready(world({ done: ['tom.meet'] })), null, 'not before the dares');
  assert.equal(Pie.ready(world({ done: ['tom.meet', 'tom.dares'], trust: false })), null, 'not without their trust');
  assert.equal(Pie.ready(world({ done: ['tom.meet', 'tom.dares'] })), 'first');
  assert.equal(Pie.ready(world({ done: ['tom.meet', 'tom.dares'], hour: 10 })), null, 'the pies are out in the afternoon');
  assert.equal(Pie.ready(world({ done: ['tom.meet', 'tom.dares'], hour: 18 })), null, 'and in again by evening');
});

test('once only: not again, whatever the days since', () => {
  const w = world({ done: ['tom.meet', 'tom.dares', 'tom.pie', 'pennock.helps'] }); Pie.stateOf(w).last = 5;
  for (const d of [5, 5 + Pie.AGAIN_AFTER, 30]) { w.save.change(s => { s.day = d; }); assert.equal(Pie.ready(w), null); }
});

test('sent home: the objective, that day only, until she\'s in', () => {
  const w = world(); Pie.stateOf(w).pending = { day: 5, told: null };
  assert.match(Pie.objective(w), /home/); Pie.stateOf(w).pending.told = false; assert.equal(Pie.objective(w), null);
});
