// The days (js/chores.js): the errands asked over breakfast and her answers; promises kept or let slide; the garden; three "won't"s in a week.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Quests = require('../js/quests.js'), DATA = require('../js/questdata.js');
require('../js/story.js'); const Chores = require('../js/chores.js');

// (a world as js/world.js gives chores one: the save, the calendar, her reputation, the quests; chapter one done and the chores agreed)
function world(agreed) {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  const q = Quests.create(save, DATA, { rep, cal, area: () => 'home' });
  for (const r of ['hulda.cloak', 'maren.walk', 'maren.homecoming']) q.complete(r);
  if (agreed !== false) q.complete('maren.chores');
  cal.sleep();      // (the morning after)
  const w = { save, cal, rep, q, refresh() {}, objective() {} };
  return { w, save, cal, rep, chores: Chores.create(w) };
}
const morning = cal => { cal.sleep(); };

test('nothing until the chores are agreed', () => {
  const { chores } = world(false);
  assert.equal(chores.on(), false); assert.equal(chores.objective(), null); assert.equal(chores.journalLine(), null);
});

test('most days something is asked, never the same two days running', () => {
  const { chores } = world(); let none = 0, last = null;
  for (let d = 2; d < 202; d++) { const id = chores.pick(d); if (!id) { none++; continue; } assert.ok(chores.ERRANDS[id]); }
  assert.ok(none > 25 && none < 80, 'about one day in four, nothing: ' + none + ' of 200');
  // (yesterday's errand isn't asked again today: each day's pick is fixed by the day, and steps past yesterday's)
  assert.equal(chores.pick(5), chores.pick(5));
});

test('yes is a promise: begun in time, kept; let slide, broken (naughty), and she knows', () => {
  const { chores, cal, rep } = world(); const id = 'bread', by = 11 * 60;
  chores.answer(id, 'yes');
  assert.match(chores.objective(), /^Bread from the bakery: begin by 11/);
  cal.advance(by - cal.minute); chores.tick(null); assert.match(chores.objective(), /begin by/, 'on the hour, not yet late');
  cal.advance(1); chores.tick(null);
  assert.match(chores.objective(), /late, but not too late/); assert.equal(rep.stat('naughty'), 1);
  chores.tick(null); assert.equal(rep.stat('naughty'), 1, 'broken once, not every moment after');
});

test('an honest no costs nothing; a "won\'t" is wilful', () => {
  const { chores, rep } = world();
  chores.answer('well', 'little'); assert.equal(rep.stat('wilful'), 0); assert.equal(chores.due(), false);
  assert.match(chores.journalLine().step.title, /not today \(honestly\)/);
  chores.answer('well', 'wont'); assert.equal(rep.stat('wilful'), 1); assert.match(chores.journalLine().step.title, /refused/);
});

test('three "won\'t"s within a week bring the maintenance correction, which sets her right', () => {
  const { chores, cal, rep } = world();
  chores.answer('well', 'wont'); morning(cal); morning(cal);
  chores.answer('bread', 'wont'); assert.equal(chores.due(), false);
  morning(cal); chores.answer('jug', 'little'); assert.equal(chores.due(), false, 'an honest no doesn\'t count');
  morning(cal); chores.answer('pot', 'wont'); assert.equal(chores.due(), true);
  chores.settled(); assert.equal(chores.due(), false); assert.equal(rep.stat('wilful'), 0, 'her wilfulness settled');
});

test('refusals more than a week apart don\'t add up', () => {
  const { chores, cal } = world();
  chores.answer('well', 'wont'); for (let i = 0; i < 4; i++) morning(cal);
  chores.answer('bread', 'wont'); for (let i = 0; i < 4; i++) morning(cal);
  chores.answer('pot', 'wont'); assert.equal(chores.due(), false, 'the first has dropped out of the week');
});

test('the garden: hers each day, a little broken promise if it\'s left till dusk', () => {
  const { chores, cal, rep } = world();
  assert.equal(chores.objective(), 'Tend Mama’s garden.');
  cal.until('19:00'); chores.tick(null); assert.equal(rep.stat('naughty'), 0.5);
  chores.tick(null); assert.equal(rep.stat('naughty'), 0.5, 'once a day');
  morning(cal); assert.equal(chores.objective(), 'Tend Mama’s garden.', 'a new day, the garden again');
});
