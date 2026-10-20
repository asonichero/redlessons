// Red Lessons — how Jack and Gerda look: the outfit each wears and the colours of their skin, hair and eyes (and Gerda's lips). The character editor
// (editor.html) sets them; the lap scene (js/lap.js) paints the models with them. Kept in the browser; with nothing saved, the models' own colours.
//
//   const look = Looks.load()            → { jack: { outfit, skin, hair, eyes }, gerda: { outfit, skin, hair, eyes, lips } }
//   Looks.save(look); Looks.reset()
//   Looks.jackColours(look.jack)         → the palette overrides for Blocky.paintJackInto (st.colours), or null for his own
//   Looks.gerdaOver(look.gerda)          → the palette overrides for Blocky.paintGerdaInto (over), or null for hers
//   Looks.paintJack(rig, look.jack, st); Looks.paintGerda(rig, look.gerda)    (in the browser: repaint a model)
(function (root) {
'use strict';
const KEY = 'red-lessons:looks';
const DEFAULT = {
  jack: { outfit: 'Outdoor', skin: '#e2b58f', hair: '#7a4a22', eyes: '#3f7f4a' },
  gerda: { outfit: 'Work', skin: '#ecc3a0', hair: '#4b3022', eyes: '#5f7f95', lips: '#a8525a' },
};
const OUTFITS = { jack: ['Outdoor', 'Day', 'Soft', 'Fine'], gerda: ['Work', 'Fine'] };
// Swatches the editor offers (any colour can be picked as well).
const SWATCHES = {
  skin: ['#f3d3b8', '#ecc3a0', '#e2b58f', '#c99a74', '#a8764f', '#7f5434', '#5c3a22'],
  hair: ['#e8d29a', '#c99a50', '#9a5a2a', '#7a4a22', '#4b3022', '#2a1c16', '#7a2a1a', '#a39a90'],
  eyes: ['#3f7f4a', '#5f7f95', '#4a6aa8', '#6a4a2a', '#8a7a4a', '#5a5a5a'],
  lips: ['#a8525a', '#b4685a', '#c06070', '#8a3a48', '#c88a7a'],
};

const isHex = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
// A colour lightened (k > 0, toward white) or darkened (k < 0, toward black) by the share k.
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
  return '#' + ch.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
// A look made whole: every field present and valid, falling back to the defaults.
function clean(look) {
  const out = {};
  for (const who of ['jack', 'gerda']) {
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

// Only the colours changed from the model's own are overridden, so an untouched look paints exactly as the model was drawn.
function jackColours(l) {
  l = clean({ jack: l }).jack; const d = DEFAULT.jack, c = {};
  if (l.skin !== d.skin) Object.assign(c, { skin: l.skin, skinSh: shade(l.skin, -0.11), skinHi: shade(l.skin, 0.13), seat: shade(l.skin, 0.06), stub: shade(l.skin, -0.15), lid: shade(l.skin, -0.18) });
  if (l.hair !== d.hair) Object.assign(c, { hair: l.hair, hairHi: shade(l.hair, 0.2), hairDk: shade(l.hair, -0.25), brow: shade(l.hair, -0.25) });
  if (l.eyes !== d.eyes) c.iris = l.eyes;
  return Object.keys(c).length ? c : null;
}
function gerdaOver(l) {
  l = clean({ gerda: l }).gerda; const d = DEFAULT.gerda, c = {};
  if (l.skin !== d.skin) Object.assign(c, { skin: l.skin, skinSh: shade(l.skin, -0.11), skinHi: shade(l.skin, 0.13), line: shade(l.skin, -0.07), lid: shade(l.skin, -0.16) });
  if (l.hair !== d.hair) Object.assign(c, { hair: l.hair, hairHi: shade(l.hair, 0.2), hairDk: shade(l.hair, -0.25), brow: shade(l.hair, -0.2) });
  if (l.eyes !== d.eyes) c.iris = l.eyes;
  if (l.lips !== d.lips) Object.assign(c, { lip: l.lips, lipDk: shade(l.lips, -0.2) });
  return Object.keys(c).length ? c : null;
}
// The bun is its own little texture: its five tones follow her hair.
const bunCols = l => { l = clean({ gerda: l }).gerda; return [l.hair, shade(l.hair, 0.2), shade(l.hair, -0.25), l.hair, '#b9b0a6']; };

function paintJack(rig, l, st) {
  const B = root.Blocky; l = clean({ jack: l }).jack;
  B.paintJackInto(rig.skin, Object.assign({ outfit: l.outfit }, st, { colours: jackColours(l) })); rig.tex.needsUpdate = true;
}
function paintGerda(rig, l) {
  const B = root.Blocky; l = clean({ gerda: l }).gerda;
  B.paintGerdaInto(rig.skin, l.outfit, gerdaOver(l)); rig.tex.needsUpdate = true;
  if (rig.paintBun) rig.paintBun(bunCols(l));
}

const api = { KEY, DEFAULT, OUTFITS, SWATCHES, shade, clean, load, save, reset, jackColours, gerdaOver, bunCols, paintJack, paintGerda };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Looks = api;
})(typeof window !== 'undefined' ? window : globalThis);
