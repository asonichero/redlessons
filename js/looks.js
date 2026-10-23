// Little Red’s Lessons — how everyone looks: Rose's and her mother Maren's outfits, and anyone's colours of skin, hair, eyes and lips (and Rose's cloak)
// where they've been changed from their own (js/toon.js has each character's own). The character editor (editor.html) sets them; every scene builds
// the characters with them. Kept in the browser.
//
//   const look = Looks.load()     → { red: { outfit, skin, hair, eyes, lips, cloak }, gerda: { outfit, skin, hair, eyes, lips }, peter: { hair }, … }
//   Looks.save(look); Looks.reset(); Looks.clean(anything)
(function (root) {
'use strict';
const KEY = 'red-lessons:looks:v2';
const DEFAULT = {
  red: { outfit: 'No cloak', skin: '#f6d3b8', hair: '#b0582a', eyes: '#4f8a62', lips: '#d49080', cloak: '#a01828' },
  gerda: { outfit: 'Work', skin: '#f6d3b8', hair: '#7a3a22', eyes: '#4f8a62', lips: '#a8525a' },
};
const OUTFITS = { red: ['Hood down', 'Hood up', 'No cloak'], gerda: ['Work', 'Fine'] };
// Everyone, by the name the figures are built under (js/toon.js), and who they are.
const NAMES = {
  red: 'Rose (19)', gerda: 'Maren, her mother (38)', gran: 'Hulda, her grandmother (71)',
  peter: 'Peter Fowler, the fowler (21)', fowler: 'Master Fowler, his grandfather (73)', tom: 'Tom Ferrier, the smith’s apprentice (20)', smith: 'Master Ferrier, the smith (46)',
  pennock: 'Mistress Pennock, the baker’s wife (44)', baker: 'Master Pennock, the baker (47)', abney: 'Mistress Abney, the innkeeper (52)',
  abneyDaughter: 'Bess Abney, her daughter (26)', halloran: 'Master Halloran, the farmer (66)', willie: 'William Dunn, the Watchman (42)',
  georgie: 'Georgie Dunn, the miller’s lad (19)', agnes: 'Agnes Thatcher (19)', holt: 'Holt, the woodsman (41)', wolfe: 'Wolfe (36)',
  motherBarrow: 'Mother Barrow (45)', fatherBarrow: 'Father Barrow (48)', weeBarrow: 'Wee Barrow (22)',
  lucy: 'Lucy Locket (20)', brannock: 'Mother Brannock, of the Shoe (58)', kitty: 'Kitty Fisher, of the Shoe (24)',
};
const CAST = Object.keys(NAMES);
// Swatches the editor offers (any colour can be picked as well).
const SWATCHES = {
  skin: ['#fbe0cc', '#f6d3b8', '#eec4a2', '#dcaa84', '#c08a62', '#94603e', '#6a4128'],
  hair: ['#f0d896', '#d0a050', '#b0582a', '#7a3a22', '#4b3022', '#2a1c16', '#16110f', '#b8b0a6'],
  eyes: ['#4f8a62', '#5f7f95', '#4a70b0', '#6a4a2a', '#8a7a4a', '#5a5a62'],
  lips: ['#c4585e', '#a8525a', '#d0707a', '#8a3a48', '#d49080'],
  cloak: ['#c8242c', '#a01828', '#d8402a', '#7a1a3a', '#2a4a8a', '#2e6a40'],
};

const isHex = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
// A look made whole: every field present and valid, falling back to the defaults.
// (Rose and Maren always whole; everyone else only what's been changed, their own colours standing for the rest)
function clean(look) {
  const out = {};
  for (const who of ['red', 'gerda']) {
    const src = (look && look[who]) || {}, d = DEFAULT[who], o = out[who] = {};
    o.outfit = OUTFITS[who].includes(src.outfit) ? src.outfit : d.outfit;
    for (const k in d) if (k !== 'outfit') o[k] = isHex(src[k]) ? src[k].toLowerCase() : d[k];
  }
  for (const who of CAST) if (!out[who] && look && look[who]) { const o = {}; for (const k of ['skin', 'hair', 'eyes', 'lips']) if (isHex(look[who][k])) o[k] = look[who][k].toLowerCase(); if (Object.keys(o).length) out[who] = o; }
  return out;
}
const store = () => { try { return root.localStorage || null; } catch (e) { return null; } };
function load() { try { const s = store(), v = s && s.getItem(KEY); return clean(v ? JSON.parse(v) : null); } catch (e) { return clean(null); } }
function save(look) { const c = clean(look); try { const s = store(); if (s) s.setItem(KEY, JSON.stringify(c)); } catch (e) { /* no storage */ } return c; }
function reset() { try { const s = store(); if (s) s.removeItem(KEY); } catch (e) { /* no storage */ } return clean(null); }

const api = { KEY, DEFAULT, OUTFITS, NAMES, CAST, SWATCHES, clean, load, save, reset };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Looks = api;
})(typeof window !== 'undefined' ? window : globalThis);
