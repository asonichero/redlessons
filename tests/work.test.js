// The shifts' lists (js/work.js): the bakery's whole list, asked for at breakfast; its head start, picked up at the counter; the inn's
// afternoon without the carrier's men, when Mistress Abney asks for it herself.
const test = require('node:test'), assert = require('node:assert/strict');
const Work = require('../js/work.js');

test('the bakery: the same list for the mill-run afternoon and a head start; the floor swept by hand', () => {
  assert.deepEqual(Work.tasksOf({ id: 'bakery', mode: 'errand' }).map(t => t.id), ['boards', 'ash', 'sift', 'sponge', 'sweep']);
  assert.deepEqual(Work.tasksOf({ id: 'bakery', mode: 'picked' }).map(t => t.id), ['boards', 'ash', 'sift', 'sponge', 'sweep']);
  assert.equal(Work.SHIFTS.bakery.tasks.find(t => t.id === 'sweep').by, 'hand');
  for (const t of Work.SHIFTS.bakery.tasks) assert.ok(t.what, t.id + ' has a short name, for what’s left');
  assert.equal(Work.SHIFT_RATE, 1, 'a shift runs at a minute a second, slower than the day’s');
});

test('the inn: the carrier’s men only when the afternoon was asked for at breakfast', () => {
  const all = Work.tasksOf({ id: 'inn' }), quiet = Work.tasksOf({ id: 'inn', short: true });
  assert.ok(all.some(t => t.carriers)); assert.ok(!quiet.some(t => t.carriers));
});
