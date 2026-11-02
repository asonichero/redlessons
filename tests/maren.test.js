// Maren's day (js/maren.js): out at the Hallorans' from after breakfast till dinner, and again till half past five; home for dinner; some
// days needlework at home for the morning or the afternoon.
const test = require('node:test'), assert = require('node:assert/strict');
const Save = require('../js/save.js'), Calendar = require('../js/calendar.js'), Maren = require('../js/maren.js');

function world(on) {
  const save = Save.create({ key: 't', storage: Save.memory() }), cal = Calendar.create(save); cal.sleep();
  return { save, cal, chores: { on: () => on !== false } };
}
const atTime = (w, day, hm) => { const [h, m] = hm.split(':').map(Number); w.save.change(s => { s.day = day; s.minute = h * 60 + m; }, { time: true }); };

test('out at the farm in the working hours; home for breakfast, dinner and from half past five', () => {
  const w = world(); let day = 1; while (Maren.needlework(day)) day++;
  for (const [hm, home] of [['07:30', true], ['09:00', false], ['12:00', false], ['12:45', true], ['13:30', false], ['16:00', false], ['17:30', true], ['21:00', true]]) {
    atTime(w, day, hm); assert.equal(Maren.home(w), home, hm); }
});

test('a needlework day keeps her home for its half of the day', () => {
  const w = world(); let am = 1, pm = 1; while (Maren.needlework(am) !== 'morning') am++; while (Maren.needlework(pm) !== 'afternoon') pm++;
  atTime(w, am, '10:00'); assert.equal(Maren.at(w), 'needle'); atTime(w, am, '15:00'); assert.equal(Maren.at(w), 'farm');
  atTime(w, pm, '10:00'); assert.equal(Maren.at(w), 'farm'); atTime(w, pm, '15:00'); assert.equal(Maren.at(w), 'needle');
  let n = 0; for (let d = 1; d <= 400; d++) if (Maren.needlework(d)) n++; assert.ok(n > 60 && n < 150, 'about one day in four: ' + n);
});

test('before the days are agreed, she\'s home; dinner is due once, in its hour', () => {
  const w0 = world(false); atTime(w0, 3, '10:00'); assert.equal(Maren.home(w0), true);
  const w = world(); atTime(w, 4, '12:00'); assert.equal(Maren.dinnerDue(w), false); atTime(w, 4, '12:40'); assert.equal(Maren.dinnerDue(w), true);
  w.save.change(s => { s.maren = { dinner: 4, warned: {} }; }); assert.equal(Maren.dinnerDue(w), false, 'eaten');
});
