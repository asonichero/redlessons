// The shifts' lists (js/work.js): the bakery's whole list, asked for at breakfast; its head start, picked up at the counter; the inn's
// afternoon without the carrier's men, when Mistress Abney asks for it herself.
const test = require('node:test'), assert = require('node:assert/strict');
const Work = require('../js/work.js');

test('the bakery: the whole list for the mill-run afternoon, a shorter one for a head start', () => {
  assert.equal(Work.tasksOf({ id: 'bakery', mode: 'errand' }).length, 7);
  assert.deepEqual(Work.tasksOf({ id: 'bakery', mode: 'picked' }).map(t => t.id), ['trough', 'boards', 'racks', 'sweep']);
  for (const t of Work.SHIFTS.bakery.tasks) assert.ok(t.what, t.id + ' has a short name, for what’s left');
  assert.ok(Work.SHIFT_RATE > 2, 'the shift clock runs quicker than the day’s');
});

test('the inn: the carrier’s men only when the afternoon was asked for at breakfast', () => {
  const all = Work.tasksOf({ id: 'inn' }), quiet = Work.tasksOf({ id: 'inn', short: true });
  assert.ok(all.some(t => t.carriers)); assert.ok(!quiet.some(t => t.carriers));
});
