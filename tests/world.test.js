// The foundations of the open world: the saved game, the calendar, her reputation, and the quest engine against the quest plan's data.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
const Quests = require('../js/quests.js'), DATA = require('../js/questdata.js');

const fresh = () => { const store = Save.memory(), save = Save.create({ key: 't', storage: store }); return { store, save }; };
const world = () => { const { save, store } = fresh(), cal = Calendar.create(save), rep = Reputation.create(save); let area = 'cabin'; const q = Quests.create(save, DATA, { rep, cal, area: () => area }); return { save, store, cal, rep, q, go: a => { area = a; } }; };

test('the save keeps what changes, and comes back the same', () => {
  const { save, store } = fresh();
  assert.equal(save.exists(), false);
  save.flag('met-peter'); save.change(s => { s.items.push('posy'); s.day = 3; });
  const again = Save.create({ key: 't', storage: store });
  assert.ok(again.exists()); assert.ok(again.has('met-peter')); assert.deepEqual(again.state.items, ['posy']); assert.equal(again.state.day, 3);
  again.reset(); assert.equal(again.state.day, 1); assert.equal(again.has('met-peter'), false);
});

test('an old or partial save is filled out to the current shape', () => {
  const store = Save.memory(); store.setItem('t', JSON.stringify({ v: 1, day: 5, flags: { x: true } }));
  const save = Save.create({ key: 't', storage: store });
  assert.equal(save.state.day, 5); assert.ok(save.has('x')); assert.deepEqual(save.state.stats, { wilful: 0, mischievous: 0, naughty: 0 }); assert.deepEqual(save.state.trust, {});
});

test('the calendar: parts of the day, curfew, light, sleep', () => {
  const { save } = fresh(), cal = Calendar.create(save);
  assert.equal(cal.day, 1); assert.equal(cal.part, 'afternoon'); assert.equal(cal.clock, '4.30 in the afternoon');
  assert.ok(cal.light() < 0.3); assert.equal(cal.curfew(), false);
  cal.until('dusk'); assert.equal(cal.part, 'dusk'); assert.equal(cal.day, 1); assert.ok(cal.light() > 0.5);
  cal.advance(150); assert.equal(cal.part, 'night'); assert.ok(cal.curfew()); assert.ok(cal.dark());
  cal.sleep(); assert.equal(cal.day, 2); assert.equal(cal.minute, 7 * 60); assert.equal(cal.part, 'morning'); assert.equal(cal.curfew(), false);
  cal.advance(24 * 60 + 30); assert.equal(cal.day, 3); assert.equal(cal.minute, 7 * 60 + 30);
  cal.until('morning'); assert.equal(cal.day, 4, 'morning has begun today, so the next is tomorrow');
  let n = 0; for (let i = 0; i < 125; i++) cal.tick(0.5, 1); n = cal.minute - (6 * 60 + 30); assert.equal(n, 62, 'a minute a second, written as whole minutes pass');
});

test('reputation: stats, settling, trust, openness, the village, Wolfe', () => {
  const { save } = fresh(), rep = Reputation.create(save);
  rep.add('wilful', 1, 'home after dark'); rep.add('wilful', 2); rep.add('naughty');
  assert.equal(rep.stat('wilful'), 3); assert.equal(rep.known('wilful'), 1); assert.equal(rep.known('naughty'), 0);
  assert.throws(() => rep.add('cheeky'));
  rep.settle('wilful'); assert.ok(rep.stat('wilful') < 3 && rep.stat('wilful') > 0);
  rep.trusts('pennock', 2); rep.tell('pennock'); rep.tell('pennock', 2); rep.tell('pennock', 1);
  assert.equal(rep.trust('pennock'), 2); assert.equal(rep.openness('pennock'), 2, 'openness never goes back');
  assert.ok(rep.village() > 0 && rep.village() < 0.2);
  for (const who in Reputation.VILLAGE) rep.tell(who); assert.equal(rep.village(), 1);
  rep.tell('maren'); assert.equal(rep.village(), 1, 'family don’t count toward the village');
  rep.disclose('hulda-cabin'); rep.disclose('path-times'); assert.ok(rep.disclosed('hulda-cabin')); assert.equal(rep.disclosure(), 3);
  assert.equal(rep.minds('pennock'), 'naughty'); assert.equal(rep.minds('smith'), 'wilful');
  assert.ok(save.state.log.length >= 1);
});

test('the quest data is whole: every step, gate and condition refers to something real', () => {
  const { q } = world(), ids = new Set(); for (const l of DATA.lines) for (const s of l.steps) { assert.ok(!ids.has(l.id + '.' + s.id), 'unique: ' + l.id + '.' + s.id); ids.add(l.id + '.' + s.id); assert.ok(DATA.phases.find(p => p.id === s.phase), 'phase of ' + s.id); if (s.gate) assert.ok(q.gates[s.gate], 'gate ' + s.gate); }
  const refs = []; const walk = c => { if (!c || c === true) return; if (Array.isArray(c)) return c.forEach(walk); if (c.all) return c.all.forEach(walk); if (c.any) return c.any.forEach(walk); if (c.not) return walk(c.not); if (c.done) refs.push(c.done); if (c.since) refs.push(c.since); if (c.gate) assert.ok(q.gates[c.gate], 'gate ' + c.gate); };
  for (const p of DATA.phases) walk(p.requires); for (const g of DATA.gates) walk(g.requires); for (const l of DATA.lines) for (const s of l.steps) walk(s.when);
  for (const r of refs) assert.ok(r.includes('.') ? ids.has(r) : q.lines[r], 'refers to ' + r);
  for (const l of DATA.lines) for (const s of l.steps) if (s.who) assert.ok(DATA.PEOPLE[s.who], 'who: ' + s.who);
  for (const k in DATA.PEOPLE) assert.ok(DATA.PEOPLE[k].age >= 18, k + ' is an adult');
  // (every phase of the plan is there, in order)
  assert.deepEqual(DATA.phases.map(p => p.id), ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3']);
});

test('chapter one: tea, the walk home, the homecoming; then the village phase', () => {
  const { q, go } = world();
  assert.equal(q.phase(), '1.1');
  assert.deepEqual(q.offered({ where: 'cabin' }).map(s => s.ref), ['hulda.cloak']);
  assert.ok(!q.offered().some(s => s.ref === 'maren.homecoming'), 'the homecoming waits for the walk');
  q.complete('hulda.cloak'); go('wood');
  assert.ok(q.offered({ where: 'wood' }).some(s => s.ref === 'maren.walk'));
  assert.ok(q.offered({ where: 'wood' }).some(s => s.ref === 'peter.beech'), 'the carving is there to find, if she stops');
  q.complete('maren.walk');
  assert.deepEqual(q.offered({ where: 'home' }).map(s => s.ref), ['maren.homecoming']);
  const r = q.complete('maren.homecoming'); assert.ok(r.phaseChanged); assert.equal(r.phase, '1.2');
  assert.equal(q.complete('maren.homecoming'), false, 'done once');
  assert.ok(q.offered({ where: 'home' }).some(s => s.ref === 'maren.chores'));
  assert.ok(!q.offered().some(s => s.ref === 'peter.beech') || q.stateOf('peter.beech') === 'offered', 'an optional step can still be taken');
  assert.ok(q.offered().some(s => s.ref === 'peter.friends'), 'an optional step left undone doesn’t hold its line back');
});

test('phases are reached in order and never lost; act gates hold', () => {
  const { q, save, rep } = world();
  for (const r of ['hulda.cloak', 'maren.walk', 'maren.homecoming']) q.complete(r);
  assert.equal(q.phase(), '1.2');
  for (const r of ['tom.dares', 'tom.pie', 'abney.work', 'abney.promise', 'hulda.errands']) q.complete(r);
  assert.equal(q.phase(), '1.3');
  assert.equal(q.gateOpen('act1'), false); assert.equal(q.stateOf('tom.smith'), 'gated', 'the smith only once she’s told Tom');
  rep.tell('tom'); assert.equal(q.stateOf('tom.smith'), 'offered');
  assert.equal(q.stateOf('abney.inhand'), 'gated'); rep.trusts('abney', 3); rep.tell('abney'); assert.equal(q.stateOf('abney.inhand'), 'offered');
  for (const r of ['tom.smith', 'pennock.helps', 'pennock.pie', 'pennock.trust', 'abney.inhand', 'hulda.holt', 'holt.meet', 'wolfe.meet']) q.complete(r);
  assert.ok(q.gateOpen('act1')); assert.equal(q.phase(), '2.1');
  save.change(s => { s.quests.wolfe = {}; }); assert.equal(q.phase(), '2.1', 'a phase reached is kept');
});

test('lines pause: Hulda goes quiet in 2.2 to 3.1', () => {
  const { q, save } = world(); save.change(s => { s.flags.phase = '2.2'; });
  const j = q.journal().find(x => x.line === 'hulda'); assert.ok(!j || j.state === 'paused' || j.state === 'done' || j.state === 'later');
  assert.ok(!q.offered().some(s => s.line === 'hulda'));
});

test('conditions: time, curfew, stats, items, since', () => {
  const { q, cal, rep, save } = world();
  assert.ok(q.test({ part: 'afternoon' })); assert.ok(q.test({ curfew: false }));
  cal.until('22:00'); assert.ok(q.test({ curfew: true })); assert.ok(q.test({ part: ['dusk', 'night'] }));
  rep.add('mischievous', 3); assert.ok(q.test({ stat: 'mischievous', gte: 3 })); assert.ok(q.test({ known: 'mischievous', gte: 1 }));
  save.change(s => s.items.push('posy')); assert.ok(q.test({ item: 'posy' })); assert.ok(q.test({ all: [{ item: 'posy' }, { not: { flag: 'x' } }] }));
  q.complete('hulda.cloak'); assert.equal(q.test({ since: 'hulda.cloak', days: 1 }), false); cal.sleep(); assert.ok(q.test({ since: 'hulda.cloak', days: 1 }));
  assert.throws(() => q.test({ nonsense: 1 }));
});

test('the journal shows what has begun, and where each line has got to', () => {
  const { q } = world();
  const j = q.journal(); assert.ok(j.find(x => x.line === 'hulda' && x.step.id === 'cloak' && x.state === 'offered'));
  assert.ok(!j.find(x => x.line === 'barrows'), 'not yet begun');
  q.complete('hulda.cloak'); assert.ok(q.journal().find(x => x.line === 'hulda').done === 1);
});
