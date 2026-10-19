// The ledger: terms are only written while she wears the cloak, givers' books fill and come due, honesty and lies change the reckoning,
// and her mother is never a giver.
const test = require('node:test'), assert = require('node:assert/strict');
const { create, GIVERS, ANCHORS } = require('../js/ledger.js');

test('nothing is written while she is not wearing the cloak', () => {
  const L = create();
  assert.equal(L.breach('taking'), null);
  assert.equal(L.owed('miller'), 0);
});

test('a breach goes in the enforcer\'s book, scaled by their strictness', () => {
  const L = create(); L.wearing = true;
  const e = L.breach('taking');
  assert.equal(e.giver, 'miller');
  assert.equal(L.owed('miller'), +(2 * GIVERS.miller.strict).toFixed(3));
  assert.ok(L.trust('miller') < GIVERS.miller.trust);
});

test('a book comes due once it passes the giver\'s patience', () => {
  const L = create(); L.wearing = true;
  assert.equal(L.due('woodcutter'), false);
  L.breach('path'); L.breach('path');
  assert.equal(L.due('woodcutter'), true);
  assert.deepEqual(L.dueList(), ['woodcutter']);
});

test('keeping a term builds trust and takes something off the book', () => {
  const L = create(); L.wearing = true; L.breach('errand');
  const owed = L.owed('miller'), t = L.trust('miller');
  L.keep('errand');
  assert.ok(L.owed('miller') < owed); assert.ok(L.trust('miller') > t);
});

test('settling honestly clears the book at its own tier', () => {
  const L = create(); L.wearing = true; L.breach('errand'); L.breach('errand');
  const r = L.settle('miller', { lied: false });
  assert.equal(r.tier, 'light'); assert.equal(L.owed('miller'), 0); assert.equal(r.lied, false);
});

test('a lie lifts the tier and is written in Grandmother\'s book', () => {
  const L = create(); L.wearing = true; L.breach('errand'); L.breach('errand');
  const r = L.settle('miller', { lied: true });
  assert.equal(r.tier, 'firm'); assert.ok(L.owed('grandmother') > 0);
});

test('a clean book needs nothing, and lying about nothing is not a lie', () => {
  const L = create();
  assert.equal(L.settle('innkeeper', { lied: true }).tier, 'none');
  assert.equal(L.owed('grandmother'), 0);
});

test('her mother is never a giver', () => {
  assert.ok(ANCHORS.includes('mother'));
  assert.equal(GIVERS.mother, undefined);
  const L = create({ wearing: true, books: { mother: [{ term: 'errand', giver: 'mother', weight: 9 }] }, trust: { mother: 50 }, history: [] });
  assert.equal(L.state.books.mother, undefined);
  assert.throws(() => L.breach('errand', { giver: 'mother' }));
  assert.throws(() => L.settle('mother'));
});

test('the state survives a save and a load', () => {
  const L = create(); L.wearing = true; L.breach('mess');
  const L2 = create(JSON.parse(JSON.stringify(L.state)));
  assert.equal(L2.owed('innkeeper'), L.owed('innkeeper')); assert.equal(L2.wearing, true);
});

test('family keep a book but never correct', () => {
  const { correctors, GIVERS } = require('../js/ledger.js');
  assert.equal(GIVERS.grandmother.kin, true);
  assert.ok(!correctors().includes('grandmother'));
  assert.ok(!correctors().includes('mother'));
  assert.deepEqual(correctors().sort(), ['innkeeper', 'miller', 'woodcutter']);
});
