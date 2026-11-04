// Little Red’s Lessons — evenings on the green: after supper's begun, from seven till near nine, the young ones gather (Agnes and Georgie on the
// bench round the lime tree, Tom about the green, Peter by the pond on his days in the village), and one of them may ask her along: Tom with a
// dare, Agnes with something she simply has to see, Peter with something quiet. Once an evening; an hour gone, home before the bell, and their
// trust, more than a day's talk brings (only to be had of an evening).
//
//   Green.invite(P, w, key) (from js/villagers.js: talking to Tom, Agnes or Peter of an evening; → true when it was the evening's talk)
//   Green.open(w) → the window's open now · Green.friendsSeen(w) → she's been out with one of them, or talked to them, today
// Kept in the save: state.green = { day (the last evening out), n: { tom, agnes, peter } (how many each), seen (the day she last went up to
// her grandmother's: js/world.js) }.
(function (root) {
'use strict';
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const FROM = H('19:00'), UNTIL = H('20:30'), HOME = H('20:45');
const WHO = ['tom', 'agnes', 'peter'];
const stateOf = w => w.save.state.green || (w.save.state.green = { day: 0, n: {} });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.green); }, { green: true });
const open = w => w.cal.minute >= FROM && w.cal.minute < UNTIL && stateOf(w).day !== w.cal.day;
// (she's seen one of them today: out with them, or a word)
function friendsSeen(w) { const v = w.save.state.villagers || {}, t = v.talked || {}, d = w.cal.day; return stateOf(w).day === d || WHO.concat('georgie').some(k => t[k] === d); }

async function invite(P, w, key) {
  if (!WHO.includes(key) || !open(w)) return false;
  const S = root.Story, n = (stateOf(w).n || {})[key] || 0, which = n % 3;
  let go = false;
  await P.converse(S.eveningAsk(key, which, { go: () => { go = true; } }), { shot: ['red', key] });
  if (!go) return true;
  change(w, s => { s.day = w.cal.day; s.n = Object.assign({}, s.n, { [key]: n + 1 }); });
  await w.fade(true, '');
  w.cal.advance(Math.max(0, Math.min(60, HOME - w.cal.minute)));
  await P.wait(0.4); await w.fade(false);
  await P.converse(S.eveningOut(key, which), { shot: false, keepCamera: true });
  if (!!(P.talk && P.talk.fresh)) { w.rep.trusts(key, 1); if (key === 'agnes') w.rep.trusts('georgie', 0.5); } if (key === 'tom') w.rep.add('mischievous', 0.5, 'an evening out with Tom');      // (an evening out: trust for it if it held something new)
  if (w.capacity) w.capacity.add(10, 'an evening with friends');
  w.refresh(); return true;
}

const api = { invite, open, friendsSeen, stateOf, FROM, UNTIL };
root.Green = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
