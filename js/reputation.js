// Little Red’s Lessons — what's known about her, and by whom. Three kinds of trouble she can be known for, trust and openness with each figure,
// how far it's known in the village, and what she's told Wolfe (which is never shown: it only decides what he can use against her).
//
//   Wilful: defying a direct instruction (off the path, past curfew, refusing a task). Mischievous: playful trouble that harms no one much
//   (pranks, dawdling, teasing). Naughty: wrongdoing that costs someone else (theft, lies, broken promises).
//   Openness, with each figure: 0 doesn't know; 1 she's told them what being Little Red means; 2 she's asked them to take her in hand, and
//   they will. Trust is built first (by time and work together); a figure takes her in hand only once she's told them, herself.
//
//   const rep = Reputation.create(save)
//   rep.add('wilful', 1, 'home after dark') · rep.stat('wilful') · rep.known('wilful') (0 none, 1 some, 2 known for it) · rep.settle('wilful', share)
//   rep.trusts('pennock', 1) · rep.trust('pennock') · rep.tell('pennock', 1) · rep.openness('pennock') · rep.village() (0..1, how far it's known)
//   rep.disclose('hulda-cabin') · rep.disclosed('hulda-cabin') · rep.disclosure() (how much he has)
//   rep.minds(who) → the stat a figure minds most (FIGURES)
(function (root) {
'use strict';
const STATS = ['wilful', 'mischievous', 'naughty'];
// The village: who counts toward how far it's known (her mother and grandmother aside: they always know), by how much they talk.
const VILLAGE = { peter: 1, tom: 1.2, smith: 1, pennock: 1.4, baker: 0.6, abney: 1.6, abneyDaughter: 0.6, halloran: 0.8, willie: 1.2, georgie: 1, agnes: 1.4, ferrierMistress: 1 };
// Who minds what, among those who'll take her in hand.
const FIGURES = {
  maren: { minds: 'wilful' }, hulda: { minds: 'mischievous' }, smith: { minds: 'wilful' }, pennock: { minds: 'naughty' },
  abney: { minds: 'naughty', promises: true, easyOn: 'mischievous' }, willie: { minds: 'wilful' }, holt: { minds: 'wilful' },
  motherBarrow: { minds: 'naughty' }, brannock: { minds: 'wilful' },
};
// What Wolfe can learn, and how much each is worth to him.
const WOLFE = { 'little-red': 2, 'hulda-cabin': 2, 'hulda-alone': 2, 'path-times': 1, 'mother-sends': 1, 'cake-wine': 1, 'safe-word': 1, peter: 1 };
const KNOWN = [2, 5];      // (a stat at these is 'some', then 'known for it')

function create(save) {
  const S = () => save.state, heard = [];
  const rep = {
    STATS, VILLAGE, FIGURES, WOLFE,
    add(stat, n, why) {
      if (!STATS.includes(stat)) throw new Error('Reputation: no stat ' + stat);
      save.change(s => { s.stats[stat] = Math.max(0, (s.stats[stat] || 0) + (n == null ? 1 : n)); if (why) { s.log.push([s.day, stat + (n < 0 ? ' −' : ' +') + Math.abs(n == null ? 1 : n) + ': ' + why]); if (s.log.length > 40) s.log.shift(); } }, { stat });
    },
    stat: k => S().stats[k] || 0,
    known: k => { const v = rep.stat(k); return v >= KNOWN[1] ? 2 : v >= KNOWN[0] ? 1 : 0; },
    // (a correction settles what it was for: some of it is forgiven, the rest stays as what she's known for)
    settle(stat, share) { const k = share == null ? 0.6 : share; save.change(s => { for (const st of stat ? [stat] : STATS) s.stats[st] = Math.round((s.stats[st] || 0) * (1 - k) * 10) / 10; }, { stat: stat || 'all' }); },
    trusts(who, n) { const d = n == null ? 1 : n; save.change(s => { s.trust[who] = (s.trust[who] || 0) + d; }, { trust: who }); for (const f of heard) f(who, d); },
    onTrust(fn) { heard.push(fn); },      // (told of each change of trust, as it happens: the HUD shows it)
    trust: who => S().trust[who] || 0,
    tell(who, level) { const l = level == null ? 1 : level; save.change(s => { s.open[who] = Math.max(s.open[who] || 0, l); }, { open: who }); },
    openness: who => S().open[who] || 0,
    village() { let k = 0, all = 0; for (const who in VILLAGE) { all += VILLAGE[who]; if ((S().open[who] || 0) >= 1) k += VILLAGE[who]; } return all ? k / all : 0; },
    disclose(topic) { save.change(s => { s.wolfe[topic] = true; }, { wolfe: true }); },
    disclosed: topic => !!S().wolfe[topic],
    disclosure() { let n = 0; for (const t in S().wolfe) n += WOLFE[t] || 1; return n; },
    minds: who => (FIGURES[who] && FIGURES[who].minds) || 'wilful',
  };
  return rep;
}

const api = { create, STATS, VILLAGE, FIGURES, WOLFE, KNOWN };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Reputation = api;
})(typeof window !== 'undefined' ? window : globalThis);
