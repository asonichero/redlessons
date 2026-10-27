// Hulda's herb errands (js/herbs.js): asked one at a time, at the cabin; gathered; brought back and taught; the next another day; three, and done.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
require('../js/story.js'); const Herbs = require('../js/herbs.js');
function world(day) {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save), done = [];
  save.change(s => { s.day = day; s.minute = 11 * 60; }, { time: true });
  return { save, cal, rep, done, q: { stateOf: r => done.includes(r) ? 'done' : 'offered' }, complete: r => done.push(r), refresh() {} };
}

test('asked, gathered, brought: three over three days, and the step done', () => {
  const w = world(4);
  assert.match(Herbs.objective(w), /Visit Grandmother/);
  for (const id of ['yarrow', 'sorrel', 'comfrey']) {
    Herbs.talk(w); assert.equal(Herbs.stateOf(w).asked, id);
    assert.match(Herbs.objective(w), /errand/);
    Herbs.talk(w); assert.equal(Herbs.stateOf(w).asked, id, 'asked again, still waiting');
    w.save.state.herbs.have = true; assert.match(Herbs.objective(w), /Take/);
    Herbs.talk(w); assert.equal(Herbs.stateOf(w).asked, null);
    Herbs.talk(w); assert.equal(Herbs.stateOf(w).asked, null, 'not another the same day');
    w.save.change(s => { s.day++; }, { time: true });
  }
  assert.deepEqual(w.done, ['hulda.errands']); assert.equal(Herbs.stateOf(w).n, 3);
});
