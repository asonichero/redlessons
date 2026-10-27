// Evenings at home (js/evening.js): the Watchman's catches, the night's key, and what others have dealt with.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Quests = require('../js/quests.js'), DATA = require('../js/questdata.js');
const Evening = require('../js/evening.js');

function world(minute) {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  const q = Quests.create(save, DATA, { rep, cal, area: () => 'village' });
  for (const r of ['hulda.cloak', 'maren.walk', 'maren.homecoming', 'maren.chores']) q.complete(r);
  save.change(s => { s.day = 6; s.minute = minute; }, { time: true });
  return { save, cal, rep, q, refresh() {}, complete: r => q.complete(r) };
}

test('after midnight is still the night before', () => {
  assert.equal(Evening.night(world(22 * 60).cal), 6); assert.equal(Evening.night(world(60).cal), 5);
});

test('caught after the bell: he walks her home (the objective says so), the first catch done, the second remembered', () => {
  const w = world(21 * 60 + 30);
  assert.equal(Evening.objective(w), null);
  assert.equal(Evening.caught(w), 1); assert.equal(Evening.watchman(w), 'walking'); assert.match(Evening.objective(w), /Master William/);
  assert.equal(w.q.done('willie.first'), true); assert.ok(w.save.has('willie-catch-1'));
  w.save.change(s => { s.day = 8; }); assert.equal(Evening.watchman(w), null, 'another night');
  Evening.caught(w); assert.ok(w.save.has('willie-catch-2'));
});

test('a correction from someone else is remembered, to be a reprieve at home', () => {
  const w = world(15 * 60); Evening.record(w, { what: 'pie', by: 'pennock', informs: true });
  const c = Evening.stateOf(w).corrected[0]; assert.equal(c.by, 'pennock'); assert.equal(c.informs, true); assert.equal(c.raised, false);
});
