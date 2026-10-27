// Peter (js/peter.js): the first visit unlocks him; his notes at the beech every few days; his days off; a meeting missed.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Peter = require('../js/peter.js');
function world(day, minute) {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  save.change(s => { s.day = day; s.minute = minute || 12 * 60; }, { time: true });
  return { save, cal, rep };
}

test('nothing of his until she\'s been to the Fowlers\'', () => {
  for (let d = 2; d < 40; d++) { const w = world(d); assert.equal(Peter.offToday(w), false); assert.equal(Peter.noteToday(w), false); }
});

test('after: a day off about one day in four; a note every few days (never the day of the visit, nor on his day off)', () => {
  let off = 0, notes = 0; const st = { visited: 5, noted: 0 };
  for (let d = 6; d < 206; d++) { const w = world(d); w.save.state.peter = Object.assign({ meet: null, met: 0, missed: 0, owed: false }, st);
    if (Peter.offToday(w)) off++; if (Peter.noteToday(w)) { notes++; assert.equal(Peter.offToday(w), false); st.noted = d; } }
  assert.ok(off > 30 && off < 75, 'days off: ' + off + ' of 200');
  assert.ok(notes > 40 && notes < 90, 'notes: ' + notes + ' in 200 days');
  const w = world(5); w.save.state.peter = { visited: 5, noted: 0, meet: null, met: 0, missed: 0, owed: false }; assert.equal(Peter.noteToday(w), false, 'not the day of the visit');
});

test('the hour he names is an afternoon one; a meeting let go by is missed, and owed a word', () => {
  for (let d = 2; d < 30; d++) { const at = Peter.meetAt(d); assert.ok(at >= 15 * 60 && at <= 17 * 60); }
  const w = world(9, 17 * 60 + 30); w.save.state.peter = { visited: 5, noted: 9, meet: { day: 9, at: 16 * 60 }, met: 0, missed: 0, owed: false };
  assert.equal(Peter.objective(w), null); assert.equal(Peter.stateOf(w).missed, 1); assert.equal(Peter.stateOf(w).owed, true);
  const w2 = world(9, 15 * 60 + 50); w2.save.state.peter = { visited: 5, noted: 9, meet: { day: 9, at: 16 * 60 }, met: 0, missed: 0, owed: false };
  assert.match(Peter.objective(w2), /beech/);
});
