// Little Red’s Lessons — the calendar: the day, the time of day, curfew, and the light. Time passes as she goes about (a game minute for every
// second she's out and about, by default), not while she's talking or being taken in hand; a night's sleep, or a quest that takes a day, moves it
// on at once. Days pass as quests need them, so a silence can last weeks without anyone noticing.
//
//   const cal = Calendar.create(save)
//   cal.day · cal.minute (0..1439) · cal.part ('dawn', 'morning', 'afternoon', 'evening', 'dusk', 'night') · cal.clock ('4.30 in the afternoon')
//   cal.advance(minutes) · cal.until('morning' | 'dusk' | …, { nextDay }) · cal.sleep() (to 7 the next morning) · cal.tick(dt, rate)
//   cal.light() → 0..1 for the stage (0 broad day, 1 night) · cal.curfew() → true after the curfew bell, until dawn · cal.dark() → dusk or night
(function (root) {
'use strict';
const H = h => Math.round(h * 60);
// The parts of the day, by when each begins.
const PARTS = [['night', 0], ['dawn', H(5.5)], ['morning', H(6.5)], ['afternoon', H(12)], ['evening', H(17)], ['dusk', H(19)], ['night', H(20.5)]];
const CURFEW = H(21), CURFEW_END = H(5.5);
// The light through the day (0 broad day .. 1 night), between these times.
const LIGHT = [[0, 1], [H(5), 1], [H(6), 0.6], [H(7.5), 0.2], [H(9), 0.05], [H(15), 0.05], [H(17), 0.25], [H(18.5), 0.45], [H(19.5), 0.7], [H(20.5), 0.9], [H(21.5), 1], [H(24), 1]];

function partAt(min) { let p = 'night'; for (const [name, at] of PARTS) if (min >= at) p = name; return p; }
function lightAt(min) {
  for (let i = 1; i < LIGHT.length; i++) if (min <= LIGHT[i][0]) { const [a, la] = LIGHT[i - 1], [b, lb] = LIGHT[i]; return la + (lb - la) * (min - a) / Math.max(1, b - a); }
  return 1;
}
// (a time in words: '4.30 in the afternoon', '9 o’clock at night', 'midday')
function clockOf(min) {
  const h = Math.floor(min / 60), m = min % 60, h12 = ((h + 11) % 12) + 1;
  const when = h < 12 ? (h < 5 ? 'at night' : 'in the morning') : h < 17 ? 'in the afternoon' : h < 20 ? 'in the evening' : 'at night';
  if (h === 12 && m < 15) return 'midday'; if (h === 0 && m < 15) return 'midnight';
  return h12 + (m ? '.' + String(m).padStart(2, '0') : ' o’clock') + ' ' + when;
}

function create(save) {
  const S = () => save.state;
  const set = (day, minute) => save.change(s => { s.day = day; s.minute = minute; }, { time: true });
  let carry = 0;
  const cal = {
    get day() { return S().day; }, get minute() { return S().minute; },
    get part() { return partAt(S().minute); }, get clock() { return clockOf(S().minute); },
    advance(minutes) { let d = S().day, m = S().minute + Math.round(minutes); while (m >= 1440) { m -= 1440; d++; } set(d, Math.max(0, m)); },
    // On to the next time a part of the day begins (or an hour, 'HH:MM'): later today if it's still to come, else tomorrow (or always tomorrow).
    until(part, o) {
      const at = /^\d/.test(part) ? (([h, mm]) => +h * 60 + +(mm || 0))(part.split(':')) : (PARTS.slice(1).find(p => p[0] === part) || [0, 0])[1];
      const tomorrow = (o && o.nextDay) || at <= S().minute; set(S().day + (tomorrow ? 1 : 0), at);
    },
    sleep() { cal.until('07:00', { nextDay: S().minute >= H(5) }); },
    // Time as she goes about: rate game minutes for each second (written only as whole minutes pass).
    frac: () => Math.min(1, carry),      // (how far into the minute: for things that move with the clock)
    tick(dt, rate) { carry += dt * (rate == null ? 1 : rate); if (carry >= 1) { const n = Math.floor(carry); carry -= n; cal.advance(n); } },
    light: () => lightAt(S().minute),
    curfew: () => S().minute >= CURFEW || S().minute < CURFEW_END,
    dark: () => ['dusk', 'night'].includes(partAt(S().minute)),
  };
  return cal;
}

const api = { create, partAt, lightAt, clockOf, PARTS, CURFEW, H };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Calendar = api;
})(typeof window !== 'undefined' ? window : globalThis);
