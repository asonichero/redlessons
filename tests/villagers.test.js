// The village's people (js/villagers.js): who's out when, and where; Tom's days; and what his stopping her costs on the clock (js/story.js).
const test = require('node:test'), assert = require('node:assert/strict');
require('../js/story.js'); const V = require('../js/villagers.js'), S = globalThis.Story;
const H = h => Math.round(h * 60), DAYS = [...Array(300).keys()].map(d => d + 2);

test('Agnes: out from eight, most often by the well by day; of an evening, on the bench by the lime, till near nine', () => {
  let well = 0, out = 0;
  for (const d of DAYS) for (let h = 0; h < 24; h += 0.5) { const s = V.station('agnes', d, H(h)); if (h < 8 || h >= 20.75) assert.equal(s, null); else if (h >= 19) assert.equal(s.n, 0, 'on the bench of an evening'); else { out++; if (s.stand === 'wellSide') well++; } }
  assert.ok(well / out > 0.45 && well / out < 0.7, 'by the well ' + Math.round(100 * well / out) + '% of the day');
});

test('Georgie: at the mill all day; in the village most afternoons, not after the bell; on the watch on Lay night (Baking day\'s), and about on Lay day once he\'s slept', () => {
  let days = 0, work = 0;
  for (const d of DAYS) { const wd = V.weekday(d), lay = wd === 7;
    for (let h = lay ? 5.5 : 0; h < (lay ? 14 : 15); h += 0.5) assert.equal(V.station('georgie', d, H(h)), null);
    if (lay) { assert.ok(V.station('georgie', d, H(15))); assert.ok(V.station('georgie', d, H(3)).round, 'still on his round before light'); continue; }
    if (wd === 6) { assert.equal(V.station('georgie', d, H(21.5)).stand, 'bell'); assert.ok(V.station('georgie', d, H(23)).round); assert.equal(V.station('willie', d, H(23)), null); }
    else assert.equal(V.station('georgie', d, H(21)), null);
    work++; if (V.station('georgie', d, H(18))) days++; }
  assert.ok(days / work > 0.55 && days / work < 0.85, 'about on ' + days + ' of ' + work + ' evenings');
});

test('Tom: at the tub seven till three; free from noon about one working day in four; all Lay day free; out and about after', () => {
  let slackN = 0, work = 0;
  for (const d of DAYS) { const lay = V.weekday(d) === 7;
    assert.equal(!!V.station('tom', d, H(11)).wander, lay);
    if (!lay) { work++; if (V.station('tom', d, H(13)).wander) slackN++; else assert.equal(V.station('tom', d, H(14.5)).stand, 'tub'); }
    assert.ok(V.station('tom', d, H(15.5)).wander); assert.equal(V.station('tom', d, H(22)), null); assert.equal(V.tomFree(d, H(17)), true); }
  assert.ok(slackN / work > 0.15 && slackN / work < 0.35, 'slack afternoons: ' + slackN + ' of ' + work);
});

test('the rest keep to their work: Bess at the inn, the smith at his anvil, the Pennocks at the bakery; the Watchman only at night', () => {
  for (const d of DAYS.slice(0, 30)) for (let h = 0; h < 24; h += 0.5) {
    const b = V.station('bess', d, H(h)); if (b) assert.equal(b.sit, 'the bench outside the inn');
    const sm = V.station('smith', d, H(h)); if (sm) assert.equal(sm.stand, 'anvil');
    for (const k of ['pennock', 'baker']) { const s = V.station(k, d, H(h)); if (s) assert.ok(['counter', 'bakeryDoor'].includes(s.stand)); }
    const w = V.station('willie', d, H(h)); if (V.layNight(d, H(h))) { assert.equal(w, null); continue; } assert.equal(!!w, h >= 21.25 || h < 5.5); if (w) assert.equal(w.stand === 'bell', h >= 21.25 && h < 22);      // (by the bell from quarter past nine (he rings it at half past), his round from ten)
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

test('Tom’s stories: a different one each time he’s heard out', () => {
  require('../js/story.js'); const S = globalThis.Story, seen = new Set();
  for (let n = 0; n < 4; n++) { const sc = S.tomStops({ kind: 'chat', chats: n, mins() {}, chatted() {}, accept() {} }); seen.add(JSON.stringify(sc[2].choose[1].then[1])); }
  assert.equal(seen.size, 4);
});
