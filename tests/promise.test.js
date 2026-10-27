// Mistress Abney's promise (js/promise.js): asked after the inn's work; the evening promised; kept, or let go by.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Quests = require('../js/quests.js'), DATA = require('../js/questdata.js');
const AP = require('../js/promise.js');
function world(done) {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  const q = Quests.create(save, DATA, { rep, cal, area: () => 'village' });
  for (const r of ['hulda.cloak', 'maren.walk', 'maren.homecoming', 'maren.chores'].concat(done || [])) q.complete(r);
  save.change(s => { s.day = 6; s.minute = 15 * 60; }, { time: true });
  return { save, cal, rep, q, refresh() {}, complete: r => q.complete(r) };
}

test('asked only once she\'s worked at the inn; not again for two days after a no', () => {
  assert.equal(!!AP.wants(world()), false);
  const w = world(['abney.work']); assert.equal(!!AP.wants(w), true);
  AP.stateOf(w).asked = 6; assert.equal(!!AP.wants(w), false);
  w.save.change(s => { s.day = 8; }); assert.equal(!!AP.wants(w), true);
  AP.stateOf(w).day = 9; assert.equal(!!AP.wants(w), false, 'once she\'s promised, no more asking');
});

test('the evening: the objective from midday; someone to tempt her about five; let half past six go by, and it\'s broken', () => {
  const w = world(['abney.work']); AP.stateOf(w).day = 6;
  assert.match(AP.objective(w), /Bess/);
  w.save.change(s => { s.minute = 17 * 60 + 10; }); assert.ok(['tom', 'agnes'].includes(AP.tempter(w)), 'Tom or Agnes (Peter, once she\'s been to the Fowlers\')');
  AP.stateOf(w).tempted = 'tom'; assert.equal(AP.tempter(w), null, 'once');
  w.save.change(s => { s.minute = 18 * 60 + 40; }); AP.lapse(w);
  assert.equal(AP.stateOf(w).broken, true); assert.equal(w.rep.stat('naughty'), 2); assert.equal(w.q.done('abney.promise'), true, 'the step done, broken or kept');
  assert.equal(AP.excused(w), false);
});

test('kept: home after the bell is excused that night', () => {
  const w = world(['abney.work']); const st = AP.stateOf(w); st.day = 6; st.kept = true;
  w.save.change(s => { s.minute = 21 * 60 + 20; }); assert.equal(AP.excused(w), true);
  w.save.change(s => { s.day = 7; s.minute = 60; }); assert.equal(AP.excused(w), true, 'after midnight, still that night');
  w.save.change(s => { s.minute = 22 * 60; }); assert.equal(AP.excused(w), false, 'not the next night');
});
