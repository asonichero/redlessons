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

test('at first, each errand in turn, as the week allows: nothing on Lay day, the inn only on Carrier\'s day, the bakery not on Baking day', () => {
  const { chores, save } = world(), order = [], wd = d => ((d - 1) % 7) + 1;
  for (let d = 3; d < 30 && order.length < 8; d++) { const id = chores.pick(d); if (wd(d) === 7) { assert.equal(id, null); continue; } if (!id) continue;
    if (id === 'inn') assert.equal(wd(d), 4); if (id === 'bakery') assert.notEqual(wd(d), 6);
    order.push(id); save.change(s => { s.chores = s.chores || {}; s.chores.asked = (s.chores.asked || []).concat(id); }); }
  assert.deepEqual(order.slice().sort(), ['bakery', 'bread', 'dunns', 'eggs', 'inn', 'jug', 'pot', 'well']);
  assert.deepEqual(order.slice(0, 3), ['eggs', 'pot', 'bakery'], 'in their order, but for the inn waiting on its day: ' + order.join(', '));
});

test('the well comes round again after five cans from the garden butt, and not before', () => {
  const { chores, save } = world();
  save.change(s => { s.chores = s.chores || { day: 0, garden: false, errand: null, refusals: [], missed: 0 }; s.chores.asked = Object.keys(chores.ERRANDS); });
  for (let d = 2; d < 120; d++) assert.notEqual(chores.pick(d), 'well');
  for (let k = 0; k < 5; k++) chores.canFilled();
  assert.equal(chores.pick(8), 'well'); assert.equal(chores.pick(9), 'well'); assert.equal(chores.pick(7), null, 'but not on Lay day');
});

test('most days something is asked, never the same two days running', () => {
  const { chores, save } = world(); let none = 0, last = null;
  save.change(s => { s.chores = s.chores || { day: 0, garden: false, errand: null, refusals: [], missed: 0 }; s.chores.asked = Object.keys(chores.ERRANDS); });      // (the first round asked)
  for (let d = 2; d < 202; d++) { const id = chores.pick(d); if (!id) { none++; continue; } assert.ok(chores.ERRANDS[id]); }
  assert.ok(none > 25 && none < 80, 'about one day in four, nothing: ' + none + ' of 200');
  // (yesterday's errand isn't asked again today: each day's pick is fixed by the day, and steps past yesterday's)
  assert.equal(chores.pick(5), chores.pick(5));
});

test('yes is a promise: begun in time, kept; a half hour past it, unspoken; after that let slide (wilful), and too late', () => {
  const { chores, cal, rep } = world(); const id = 'bread', by = 11 * 60;
  chores.answer(id, 'yes');
  assert.match(chores.objective(), /^Bread from the bakery: begin by 11/);
  cal.advance(by - cal.minute); chores.tick(null); assert.match(chores.objective(), /begin by/, 'on the hour, not yet late');
  cal.advance(30); chores.tick(null); assert.match(chores.objective(), /begin by/, 'within its grace: nothing said'); assert.equal(rep.stat('wilful'), 0);
  cal.advance(1); chores.tick(null);
  assert.ok(!/Bread/.test(chores.objectives().join(' ')), 'too late: off the list'); assert.equal(rep.stat('wilful'), 1);
  assert.equal(chores.owes(id), false, 'and not to be done');
  chores.tick(null); assert.equal(rep.stat('wilful'), 1, 'let slide once, not every moment after');
});

test('three promises let slide within a week bring the maintenance correction, which sets her right', () => {
  const { chores, cal, rep } = world(), by = id => { const [h, m] = chores.ERRANDS[id].by.split(':').map(Number); return h * 60 + m; };
  const let_ = id => { chores.answer(id, 'yes'); cal.advance(by(id) + 31 - cal.minute); chores.tick(null); };
  let_('bread'); morning(cal); morning(cal);
  let_('jug'); assert.equal(chores.due(), false);
  morning(cal); let_('pot'); assert.equal(chores.due(), true);
  chores.settled(); assert.equal(chores.due(), false); assert.equal(rep.stat('wilful'), 0, 'her wilfulness settled');
});

test('promises let slide more than a week apart don\'t add up', () => {
  const { chores, cal } = world(), by = id => { const [h, m] = chores.ERRANDS[id].by.split(':').map(Number); return h * 60 + m; };
  const let_ = id => { chores.answer(id, 'yes'); cal.advance(by(id) + 31 - cal.minute); chores.tick(null); };
  let_('bread'); for (let i = 0; i < 4; i++) morning(cal);
  let_('jug'); for (let i = 0; i < 4; i++) morning(cal);
  let_('pot'); assert.equal(chores.due(), false, 'the first has dropped out of the week');
});

test('the garden: hers each day, a little broken promise if it\'s left till dusk', () => {
  const { chores, cal, rep } = world();
  assert.equal(chores.objective(), 'Tend Mama’s garden.');
  cal.until('19:00'); chores.tick(null); assert.equal(rep.stat('naughty'), 0.5);
  chores.tick(null); assert.equal(rep.stat('naughty'), 0.5, 'once a day');
  morning(cal); assert.equal(chores.objective(), 'Tend Mama’s garden.', 'a new day, the garden again');
});

test('Mistress Pennock offers a head start any morning Red’s not been asked for the bakery’s afternoon', () => {
  const { chores, save, cal } = world(); cal.advance(150);      // (half past nine)
  assert.equal(chores.canOffer('pennock'), true);
  chores.answer('eggs', 'yes'); assert.equal(chores.canOffer('pennock'), true, 'an errand of another kind: still');
  chores.answer('bakery', 'little'); assert.equal(chores.canOffer('pennock'), false, 'asked for the afternoon: not as well');
  save.change(s => { s.chores.errand = null; }, { chores: true }); cal.advance(180); assert.equal(chores.canOffer('pennock'), false, 'past noon: sold nearly out');
});

test('an errand of her mother’s left undone is asked again the next day, unless the day is a shift’s; its well left undone dries the garden butt', () => {
  const { chores, save, cal } = world(), wd = () => ((cal.day - 1) % 7) + 1;
  assert.equal(cal.day, 2); assert.equal(chores.pick(cal.day), 'eggs', 'the eggs, the first day after the homecoming');
  chores.answer('eggs', 'yes'); save.change(s => { s.chores.errand.state = 'broken'; }, { chores: true });
  morning(cal); chores.owing();
  assert.equal(chores.owing(), 'eggs'); assert.equal(chores.pick(cal.day), 'eggs', 'asked again');
  chores.answer('eggs', 'yes'); save.change(s => { s.chores.errand.state = 'done'; }, { chores: true });
  morning(cal); assert.equal(chores.owing(), null, 'done: nothing owed');
  // (the well let slide: the butt dry, today and on, till it's fetched; on a shift's day, owed still, and asked the day after)
  while (wd() !== 3) morning(cal);
  save.change(s => { s.chores.errand = { id: 'well', state: 'missed', by: 600 }; }, { chores: true });
  assert.equal(chores.buttDry(), true, 'let slide today: dry');
  morning(cal); assert.equal(wd(), 4); assert.equal(chores.owing(), 'well'); assert.equal(chores.buttDry(), true);
  save.change(s => { s.chores.asked = Object.keys(chores.ERRANDS).filter(id => id !== 'inn'); }, { chores: true });
  assert.equal(chores.pick(cal.day), 'inn', 'Carrier’s day: the inn’s evening first');
  chores.answer('inn', 'yes'); save.change(s => { s.chores.errand.state = 'done'; }, { chores: true });
  morning(cal); assert.equal(chores.owing(), 'well', 'kept over the shift'); assert.equal(chores.pick(cal.day), 'well');
  chores.answer('well', 'yes'); save.change(s => { s.chores.errand.state = 'done'; }, { chores: true });
  assert.equal(chores.buttDry(), false, 'fetched: the butt full again');
});
