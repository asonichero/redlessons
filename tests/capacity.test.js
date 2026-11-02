// How she's holding up (js/capacity.js): worn down out and about, faster running or carrying; rested sitting; a fresh start each day.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Capacity = require('../js/capacity.js');

function world() {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save); cal.sleep();
  const w = { save, cal, area: 'village' };
  return { w, cal, c: Capacity.create(w) };
}
// (her, as js/play.js gives her: moving or not, running or not, sitting or not, with something heavy or not)
const her = o => ({ sitting: o.sit ? {} : null, motion: { speed: o.moving ? 20 : 0, runB: o.run ? 1 : 0, carry: o.heavy ? { keep: true, kind: 'butt' } : null } });

test('a day begins fresh, and a late night takes some of it', () => {
  const { w, cal, c } = world();
  assert.equal(c.value, Capacity.START);
  c.late(); cal.sleep(); assert.equal(c.value, Capacity.START - 15);
  cal.sleep(); assert.equal(c.value, Capacity.START, 'a good night: back to it');
});

test('out and about wears her down; running and carrying faster; sitting a while restores her', () => {
  const { w, c } = world();
  c.tick(her({ moving: true }), 1, 60); const walked = Capacity.START - c.value;
  assert.ok(walked > 0, 'an hour out: a little worn');
  const a = c.value; c.tick(her({ moving: true, run: true, heavy: true }), 1, 60); assert.ok(a - c.value > walked * 3, 'running with the butt: much more');
  const b = c.value; c.tick(her({ sit: true }), 1, 30); assert.ok(c.value > b, 'sitting: rested');
});

test('it stays between empty and full, and says when she\'s low and worn', () => {
  const { c } = world();
  c.add(500); assert.equal(c.value, 100);
  c.add(-70); assert.equal(c.low, true); assert.equal(c.worn, false);
  c.add(-20); assert.equal(c.worn, true);
  c.add(-500); assert.equal(c.value, 0);
});
