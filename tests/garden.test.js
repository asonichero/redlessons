// Mama's garden (js/garden.js): the day's work, what's left of it, and how often her mother goes round to look.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Reputation = require('../js/reputation.js');
require('../js/story.js'); const Garden = require('../js/garden.js'), S = globalThis.Story;

function world(day) {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save), rep = Reputation.create(save);
  save.change(s => { s.day = day || 3; s.minute = 9 * 60; }, { time: true });
  return { save, cal, rep };
}

test('each day: five weeds in the beds, two of the vegetables\' jobs; the same however often it\'s asked', () => {
  for (let d = 2; d < 60; d++) {
    const p = Garden.plan(d); assert.equal(p.weeds.length, 5); assert.equal(p.jobs.length, 2);
    for (const wd of p.weeds) { const row = Garden.ROWS.find(r => r.id === wd.row); assert.ok(Math.abs(wd.z - row.z) < 1.5, 'in its bed'); }
    assert.deepEqual(Garden.plan(d), p);
  }
});

test('what\'s left: weeds, the flowers to water, the jobs, the can back by the butt', () => {
  const w = world(4), g = Garden.stateOf(w), p = Garden.plan(4);
  let pr = Garden.progress(w); assert.equal(pr.weeds, 5); assert.equal(pr.dry.length, 3); assert.equal(pr.jobs.length, 2); assert.equal(pr.begun, false); assert.equal(pr.done, false);
  g.pulled = [0, 1, 2, 3, 4]; for (const r of ['maids', 'cockles', 'bells']) g.watered[r] = true; for (const j of p.jobs) g.jobs[j] = true; g.can = 'held';
  pr = Garden.progress(w); assert.equal(pr.done, false, 'the can still to put back'); assert.match(Garden.progressText(w), /can back/);
  g.can = 'butt'; assert.equal(Garden.progress(w).done, true);
});

test('a new day: the work begun again, but what\'s been trodden stays until her mother\'s been round', () => {
  const w = world(4), g = Garden.stateOf(w); g.pulled = [0]; g.trampled['bells:3'] = 4; g.petals.push({ c: '#fff', until: 900 });
  w.cal.sleep(); const h = Garden.stateOf(w);
  assert.deepEqual(h.pulled, []); assert.equal(h.trampled['bells:3'], 4); assert.deepEqual(h.petals, [], 'petals gone by morning');
});

test('her mother looks round every few days: never the next day, sometimes the second, always by the third', () => {
  let second = 0;
  for (let d = 10; d < 110; d++) {
    const w = world(d), g = Garden.stateOf(w);
    g.checked = d - 1; assert.equal(Garden.lookDue(w), false);
    g.checked = d - 2; if (Garden.lookDue(w)) second++;
    g.checked = d - 3; assert.equal(Garden.lookDue(w), true);
  }
  assert.ok(second > 30 && second < 70, 'the second day, sometimes: ' + second);
});

test('what she\'s asked, and the lines for each outcome, name the rows trodden', () => {
  const ask = S.gardenAsk(['the silver bells', 'the cockle shells'], 2, { own() {}, lie() {} });
  assert.match(ask[0].text, /my silver bells and my cockle shells/); assert.equal(ask[2].choose.length, 2);
  assert.match(S.gardenBoots(['the pretty maids'])[1].text, /my pretty maids/);
  assert.match(S.gardenReport({ who: 'tom', rows: ['the silver bells'] })[0].text, /Tom Ferrier/);
});
