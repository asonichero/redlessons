// The character editor's looks: cleaned on load, untouched colours paint as the model was drawn, changed ones override.
const test = require('node:test'), assert = require('node:assert/strict');
const L = require('../js/looks.js');

test('a missing or broken look falls back to the defaults', () => {
  assert.deepEqual(L.clean(null), L.DEFAULT);
  const c = L.clean({ jack: { outfit: 'Cape', skin: 'red', hair: '#123456' }, gerda: { outfit: 'Fine' } });
  assert.equal(c.jack.outfit, 'Outdoor'); assert.equal(c.jack.skin, L.DEFAULT.jack.skin); assert.equal(c.jack.hair, '#123456'); assert.equal(c.gerda.outfit, 'Fine');
});

test('the default look overrides nothing', () => {
  assert.equal(L.jackColours(L.DEFAULT.jack), null); assert.equal(L.gerdaOver(L.DEFAULT.gerda), null);
});

test('a changed colour overrides only its own group', () => {
  const j = L.jackColours(Object.assign({}, L.DEFAULT.jack, { hair: '#e8d29a' }));
  assert.equal(j.hair, '#e8d29a'); assert.ok(j.hairDk && j.brow); assert.equal(j.skin, undefined); assert.equal(j.iris, undefined);
  const g = L.gerdaOver(Object.assign({}, L.DEFAULT.gerda, { lips: '#c06070' }));
  assert.deepEqual(Object.keys(g).sort(), ['lip', 'lipDk']);
});

test('shade lightens and darkens', () => {
  assert.equal(L.shade('#808080', 0), '#808080'); assert.equal(L.shade('#808080', 1), '#ffffff'); assert.equal(L.shade('#808080', -1), '#000000');
});
