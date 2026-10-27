// The village's people (js/villagers.js): who's out when, and where; Tom's days; and what his stopping her costs on the clock (js/story.js).
const test = require('node:test'), assert = require('node:assert/strict');
require('../js/story.js'); const V = require('../js/villagers.js'), S = globalThis.Story;
const H = h => Math.round(h * 60), DAYS = [...Array(300).keys()].map(d => d + 2);

test('Agnes: out from eight till dusk, and most often by the well', () => {
  let well = 0, out = 0;
  for (const d of DAYS) for (let h = 0; h < 24; h += 0.5) { const s = V.station('agnes', d, H(h)); if (h < 8 || h >= 19.5) assert.equal(s, null); else { out++; if (s.stand === 'wellSide') well++; } }
  assert.ok(well / out > 0.45 && well / out < 0.7, 'by the well ' + Math.round(100 * well / out) + '% of the day');
});

test('Georgie: at the mill all day; in the village most afternoons, not after the bell', () => {
  let days = 0;
  for (const d of DAYS) { for (let h = 0; h < 15; h += 0.5) assert.equal(V.station('georgie', d, H(h)), null); assert.equal(V.station('georgie', d, H(21)), null); if (V.station('georgie', d, H(18))) days++; }
  assert.ok(days / DAYS.length > 0.55 && days / DAYS.length < 0.85, 'about on ' + days + ' of ' + DAYS.length + ' evenings');
});

test('Tom: at the forge in smithing hours, but for his days off; out and about after', () => {
  let off = 0;
  for (const d of DAYS) { const s = V.station('tom', d, H(11)); if (s.wander) off++; else assert.equal(s.stand, 'tub');
    assert.ok(V.station('tom', d, H(17)).wander); assert.equal(V.station('tom', d, H(22)), null); assert.equal(V.tomFree(d, H(17)), true); }
  assert.ok(off / DAYS.length > 0.25 && off / DAYS.length < 0.45, 'days off: ' + off + ' of ' + DAYS.length);
});

test('the rest keep to their work: Bess at the inn, the smith at his anvil, the Pennocks at the bakery; the Watchman only at night', () => {
  for (const d of DAYS.slice(0, 30)) for (let h = 0; h < 24; h += 0.5) {
    const b = V.station('bess', d, H(h)); if (b) assert.equal(b.sit, 'the bench outside the inn');
    const sm = V.station('smith', d, H(h)); if (sm) assert.equal(sm.stand, 'anvil');
    for (const k of ['pennock', 'baker']) { const s = V.station(k, d, H(h)); if (s) assert.ok(['counter', 'bakeryDoor'].includes(s.stand)); }
    const w = V.station('willie', d, H(h)); assert.equal(!!w, h >= 20.75 || h < 5.5);
  }
});

test('the same day and time, the same answer', () => {
  for (const k in V.PEOPLE) assert.deepEqual(V.station(k, 9, H(16.5)), V.station(k, 9, H(16.5)));
});

// (each way through a script, as the minutes it spends)
function costs(list, ctx) {
  let ways = [{ mins: 0, ran: [] }];
  for (const line of list) {
    if (line.run) { ways.forEach(w => { const was = ctx.spent; line.run(); w.mins += ctx.spent - was; ctx.spent = was; w.ran.push(line.run.name || 'run'); }); continue; }
    if (line.choose) { ways = ways.flatMap(w => line.choose.map(c => { const sub = costs(c.then || [], ctx); return sub.map(s => ({ mins: w.mins + s.mins, ran: w.ran.concat(s.ran), pick: (w.pick || []).concat(c.text, s.pick || []) })); }).flat()); }
  }
  return ways;
}
test('Tom keeps her while the clock runs: away early for a few minutes; longer if she stays (a dare taken, she does it herself)', () => {
  for (const kind of ['chat', 'bell', 'knock']) {
    const ctx = { spent: 0, kind, first: false }; ctx.mins = n => { ctx.spent += n; }; ctx.accept = ctx.chatted = () => {};
    const ways = costs(S.tomStops(ctx), ctx), early = ways.find(w => /can’t stop/.test(w.pick[0]));
    assert.ok(early.mins > 0 && early.mins <= 6, kind + ': away early in ' + early.mins);
    const longest = Math.max(...ways.map(w => w.mins)); assert.ok(longest >= (kind === 'chat' ? 15 : 5), kind + ': staying costs ' + longest);      // (a dare's own time is hers to spend doing it)
  }
});

test('every villager has something to say, to whoever\'s there', () => {
  for (const k in V.PEOPLE) for (const part of ['morning', 'afternoon', 'evening', 'dusk']) for (const first of [true, false]) for (const day of [2, 3, 4]) {
    const lines = S.villager(k, { part, day, first, today: false, curfew: k === 'willie' });
    assert.ok(lines.length > 0, k); for (const l of lines) assert.ok(!l.who || l.who === 'red' || V.PEOPLE[l.who], k + ': ' + l.who);
  }
});
