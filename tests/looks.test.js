// The character editor's looks: cleaned on load, with the defaults filling anything missing or broken.
const test = require('node:test'), assert = require('node:assert/strict');
const L = require('../js/looks.js');

test('a missing or broken look falls back to the defaults', () => {
  assert.deepEqual(L.clean(null), L.DEFAULT);
  const c = L.clean({ red: { outfit: 'Armour', skin: 'red', hair: '#123456' }, gerda: { outfit: 'Fine' } });
  assert.equal(c.red.outfit, L.DEFAULT.red.outfit); assert.equal(c.red.skin, L.DEFAULT.red.skin); assert.equal(c.red.hair, '#123456'); assert.equal(c.gerda.outfit, 'Fine');
});

test('only Red Riding Hood and Gerda are kept', () => {
  assert.deepEqual(Object.keys(L.clean({ jack: { outfit: 'Outdoor' } })).sort(), ['gerda', 'red']);
});

test('every outfit and swatch is valid', () => {
  for (const who of ['red', 'gerda']) { assert.ok(L.OUTFITS[who].includes(L.DEFAULT[who].outfit)); for (const k in L.DEFAULT[who]) if (k !== 'outfit') assert.match(L.DEFAULT[who][k], /^#[0-9a-f]{6}$/); }
  for (const k in L.SWATCHES) for (const c of L.SWATCHES[k]) assert.equal(L.clean({ red: { [k]: c } }).red[k] || c, c);
});
