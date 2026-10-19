// Red Lessons — the ledger: the bargain the village strikes with the heroine. While she wears the cloak she is free of adult responsibility
// (nobody hands her the bakery's work or holds her to her chores) but not of consequences: each of the village's terms she breaks is written
// against her, in the book of the villager whose term it was, and that villager will call her in to settle it. Kept terms build their trust,
// which is what opens up the village and the forest (shortcuts, rides, the deeper paths).
//
// Everything here is data plus a little arithmetic, with no three.js and no DOM, so it runs (and is tested) under Node as well as in the page.
//
//   const L = Ledger.create();                    // or Ledger.create(savedState)
//   L.wearing = true;                             // terms are only written while she wears the cloak
//   L.breach('taking', { giver: 'miller' });      // a broken term; giver defaults to the term's own enforcer
//   L.keep('errand', { giver: 'miller' });        // a kept one: trust, and a little off what is owed
//   L.owed('miller'); L.tier('miller');           // what she owes the miller, and what that comes to
//   L.settle('miller', { lied: false });          // the reckoning: returns the tier and clears the book
//   JSON.stringify(L.state)                       // saved with the game
//
// Exposes root.Ledger = { TERMS, GIVERS, ANCHORS, TIERS, create }.
(function (root) {
'use strict';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// The givers: the villagers who hold her to the terms and settle the book. Each has a temperament:
//   strict   scales the weight of every breach written in their book;
//   patience how much can stand in their book before they call her in (lower: sooner);
//   trust    where their trust in her starts (0–100);
//   implements what they may use, mildest first (the correction scene's own implement ids: hand, paddle, birch).
// Grandmother gave the cloak and is the one who explains the terms; the woodcutter keeps the forest path.
const GIVERS = {
  grandmother: { name: 'Grandmother', strict: 1.0, patience: 6, trust: 70, implements: ['hand', 'paddle'], where: 'cottage' },
  woodcutter:  { name: 'The Woodcutter', strict: 1.2, patience: 4, trust: 50, implements: ['hand', 'paddle'], where: 'forest edge' },
  miller:      { name: 'The Miller', strict: 1.1, patience: 5, trust: 50, implements: ['hand', 'paddle'], where: 'mill' },
  innkeeper:   { name: 'The Innkeeper', strict: 0.9, patience: 6, trust: 55, implements: ['hand'], where: 'inn' },
};

// Characters who are never givers. The heroine's mother is the story's emotional anchor: she is outside the ledger entirely, so nothing can be
// written in her book or settled by her, however the data is edited. (create() and breach() both refuse her.)
const ANCHORS = ['mother'];

// The terms. weight: how much a breach writes in the book (before the giver's strictness); enforcer: whose term it is by default;
// keep: trust gained when she keeps it (an errand done well, an honest answer).
const TERMS = {
  errand:   { text: 'Do what you are asked, when you are asked.', weight: 2, enforcer: 'miller', keep: 6 },
  taking:   { text: 'Take nothing from a stall you have not paid for.', weight: 2, enforcer: 'miller', keep: 0 },
  mess:     { text: 'Leave things as you found them.', weight: 1, enforcer: 'innkeeper', keep: 3 },
  manners:  { text: 'Answer civilly when you are spoken to.', weight: 1, enforcer: 'innkeeper', keep: 2 },
  path:     { text: 'Keep to the forest path.', weight: 3, enforcer: 'woodcutter', keep: 4 },
  curfew:   { text: 'Be home before the evening bell.', weight: 1.5, enforcer: 'grandmother', keep: 3 },
  lie:      { text: 'Tell the truth about what you have done.', weight: 2.5, enforcer: 'grandmother', keep: 5 },
};

// What a book comes to. The same tiers as the Jack game's correction (js/correction.js there): a total below Token's floor needs nothing at all.
const TIERS = [
  { id: 'none', min: 0 }, { id: 'token', min: 0.5 }, { id: 'light', min: 2 }, { id: 'firm', min: 5 }, { id: 'severe', min: 9 },
];
const tierOf = total => TIERS.reduce((t, x) => (total >= x.min ? x : t), TIERS[0]).id;
const liftTier = id => { const i = TIERS.findIndex(t => t.id === id); return TIERS[Math.min(TIERS.length - 1, Math.max(1, i + 1))].id; };

function create(saved) {
  const state = saved ? JSON.parse(JSON.stringify(saved)) : { wearing: false, books: {}, trust: {}, history: [] };
  for (const a of ANCHORS) { delete state.books[a]; delete state.trust[a]; }
  for (const id in GIVERS) { if (!state.books[id]) state.books[id] = []; if (state.trust[id] == null) state.trust[id] = GIVERS[id].trust; }
  const giverOf = (termId, opts) => {
    const g = (opts && opts.giver) || TERMS[termId].enforcer;
    if (ANCHORS.includes(g)) throw new Error('Ledger: ' + g + ' is not a giver');
    if (!GIVERS[g]) throw new Error('Ledger: unknown giver ' + g);
    return g;
  };
  const L = {
    state,
    get wearing() { return state.wearing; }, set wearing(on) { state.wearing = !!on; },
    // A broken term. Returns the entry written, or null when she is not wearing the cloak (then the bargain does not apply).
    breach(termId, opts) {
      const T = TERMS[termId]; if (!T) throw new Error('Ledger: unknown term ' + termId);
      const g = giverOf(termId, opts);
      if (!state.wearing) return null;
      const e = { term: termId, giver: g, weight: +(T.weight * GIVERS[g].strict * ((opts && opts.scale) || 1)).toFixed(3), note: (opts && opts.note) || '', at: (opts && opts.at) || Date.now() };
      state.books[g].push(e); state.trust[g] = clamp(state.trust[g] - T.weight * 3, 0, 100);
      return e;
    },
    // A kept term: trust with that villager, and a quarter of one breach's weight taken off their book (never below nothing).
    keep(termId, opts) {
      const T = TERMS[termId]; if (!T) throw new Error('Ledger: unknown term ' + termId);
      const g = giverOf(termId, opts);
      state.trust[g] = clamp(state.trust[g] + T.keep, 0, 100);
      const book = state.books[g]; let off = T.weight * 0.25;
      for (let i = book.length - 1; i >= 0 && off > 0; i--) { const take = Math.min(book[i].weight, off); book[i].weight = +(book[i].weight - take).toFixed(3); off -= take; if (book[i].weight <= 0) book.splice(i, 1); }
      return state.trust[g];
    },
    owed(g) { return +(state.books[g] || []).reduce((s, e) => s + e.weight, 0).toFixed(3); },
    tier(g) { return tierOf(L.owed(g)); },
    // Whether a giver will call her in now: their book has passed their patience.
    due(g) { return L.owed(g) >= GIVERS[g].patience; },
    dueList() { return Object.keys(GIVERS).filter(L.due); },
    trust(g) { return state.trust[g]; },
    // The reckoning. She is asked how it went: an honest account settles the book as it stands; a lie (lied: true, when there was anything to own up to)
    // lifts it one tier and is written in Grandmother's book as a breach of its own. Returns { tier, owed, implement, entries } and clears the book.
    settle(g, opts) {
      if (ANCHORS.includes(g) || !GIVERS[g]) throw new Error('Ledger: ' + g + ' cannot settle');
      const owed = L.owed(g), entries = state.books[g].slice(); let tier = tierOf(owed);
      const lied = !!(opts && opts.lied) && owed > 0;
      if (lied) tier = liftTier(tier);
      const imps = GIVERS[g].implements, implement = tier === 'severe' ? imps[imps.length - 1] : imps[0];
      state.books[g] = []; state.history.push({ giver: g, owed, tier, lied, at: (opts && opts.at) || Date.now() });
      if (lied) { const was = state.wearing; state.wearing = true; L.breach('lie', { giver: 'grandmother' }); state.wearing = was; }
      else if (owed > 0) state.trust[g] = clamp(state.trust[g] + 4, 0, 100);       // owning up mends a little
      return { tier, owed, implement, entries, lied };
    },
  };
  return L;
}

const api = { TERMS, GIVERS, ANCHORS, TIERS, create, tierOf };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Ledger = api;
})(typeof window !== 'undefined' ? window : globalThis);
