// Red Lessons — how Red Riding Hood and Gerda look: the outfit each wears and the colours of their skin, hair, eyes and lips (and her cloak). The
// character editor (editor.html) sets them; the lap scene (js/lap.js) builds the characters with them (js/toon.js). Kept in the browser.
//
//   const look = Looks.load()     → { red: { outfit, skin, hair, eyes, lips, cloak }, gerda: { outfit, skin, hair, eyes, lips } }
//   Looks.save(look); Looks.reset(); Looks.clean(anything)
(function (root) {
'use strict';
const KEY = 'red-lessons:looks:v2';
const DEFAULT = {
  red: { outfit: 'Hood down', skin: '#f6d3b8', hair: '#7a3a22', eyes: '#4f8a62', lips: '#c4585e', cloak: '#c8242c' },
  gerda: { outfit: 'Work', skin: '#eec4a2', hair: '#4b3022', eyes: '#5f7f95', lips: '#a8525a' },
};
const OUTFITS = { red: ['Hood down', 'Hood up', 'No cloak'], gerda: ['Work', 'Fine'] };
const NAMES = { red: 'Red Riding Hood (21)', gerda: 'Gerda (late thirties)' };
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
function clean(look) {
  const out = {};
  for (const who of ['red', 'gerda']) {
    const src = (look && look[who]) || {}, d = DEFAULT[who], o = out[who] = {};
    o.outfit = OUTFITS[who].includes(src.outfit) ? src.outfit : d.outfit;
    for (const k in d) if (k !== 'outfit') o[k] = isHex(src[k]) ? src[k].toLowerCase() : d[k];
  }
  return out;
}
const store = () => { try { return root.localStorage || null; } catch (e) { return null; } };
function load() { try { const s = store(), v = s && s.getItem(KEY); return clean(v ? JSON.parse(v) : null); } catch (e) { return clean(null); } }
function save(look) { const c = clean(look); try { const s = store(); if (s) s.setItem(KEY, JSON.stringify(c)); } catch (e) { /* no storage */ } return c; }
function reset() { try { const s = store(); if (s) s.removeItem(KEY); } catch (e) { /* no storage */ } return clean(null); }

const api = { KEY, DEFAULT, OUTFITS, NAMES, SWATCHES, clean, load, save, reset };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Looks = api;
})(typeof window !== 'undefined' ? window : globalThis);
