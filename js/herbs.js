// Little Red’s Lessons — Hulda's herb errands (phase 1.2: hulda.errands). Visiting her grandmother, Red's asked for a herb: yarrow from the
// meadow, wood sorrel by the stream, comfrey by the fallen tree, one at a time. She finds it where she was told (js/wood.js's herb patches),
// gathers it, and brings it back; and her grandmother teaches her what it's for, a little of her craft. One a visit, and the next asked another
// day. Three brought, and the step's done.
//
//   Herbs.talk(w) (the cabin: her grandmother's word, the herb taken, the next asked) · Herbs.wood(P, w) (the wood: gathering it)
//   Herbs.objective(w) · Herbs.stateOf(w) · Herbs.HERBS
// Kept in the save (state.herbs): { n (brought), asked (the herb asked for, or null), have (gathered), day (the last brought) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;

const HERBS = [
  { id: 'yarrow', name: 'the yarrow', where: 'in the meadow, west of the lane', label: 'Pick the yarrow' },
  { id: 'sorrel', name: 'the wood sorrel', where: 'on the bank of the stream', label: 'Pick the wood sorrel' },
  { id: 'comfrey', name: 'the comfrey', where: 'by the fallen tree', label: 'Cut the comfrey leaves' },
];
const stateOf = w => w.save.state.herbs || (w.save.state.herbs = { n: 0, asked: null, have: false, day: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.herbs); }, { herbs: true });
const herb = id => HERBS.find(h => h.id === id);
const on = w => !!(w.q && w.q.stateOf && w.q.stateOf('hulda.errands') === 'offered');
// (the next to ask for: not the same day one was brought)
const next = w => { const s = stateOf(w); return on(w) && !s.asked && s.n < HERBS.length && s.day !== w.cal.day ? HERBS[s.n] : null; };

// ── At the cabin: what she's brought, taken and taught; the next asked for; or her grandmother's word for the time.
function talk(w) {
  const S = root.Story, s = stateOf(w), out = [];
  if (s.asked && s.have) {
    const h = herb(s.asked), n = s.n + 1;
    out.push(...S.herbGiven(h.id, n === HERBS.length));
    change(w, x => { x.n = n; x.asked = null; x.have = false; x.day = w.cal.day; });
    w.rep.trusts('hulda', 1); w.cal.advance(20);
    if (n === HERBS.length && w.q.stateOf('hulda.errands') === 'offered') w.complete('hulda.errands');
    else out.push(...S.herbLater());
  } else if (s.asked) out.push(...S.herbWaiting(herb(s.asked)));
  else { const h = next(w); if (h) { out.push(...S.herbAsk(h.id, s.n)); change(w, x => { x.asked = h.id; x.have = false; }); w.cal.advance(15); } }
  if (w.refresh) w.refresh();
  return out.length ? out : S.granAgain();
}

// ── In the wood: the herb asked for, gathered where it grows.
function wood(P, w) {
  const W = P.world, at = W.herbs; if (!at) return null;
  const S = root.Story, m = P.motion;
  const want = () => { const s = stateOf(w); return s.asked && !s.have && at[s.asked] ? herb(s.asked) : null; };
  async function gather() {
    const h = want(); if (!h) return; const p = at[h.id], away = m.pos.clone().sub(p).setY(0); if (away.lengthSq() < 1) away.set(0, 0, 1); away.normalize();
    const to = P.collide(p.clone().setY(0).addScaledVector(away, 6), 3.2); await m.goTo(to, Math.atan2(p.x - to.x, p.z - to.z));
    for (let k = 0; k < 3; k++) { await m.reach(k % 2 ? 'L' : 'R', p.clone().add(new V3((k - 1) * 1.5, 2, 0))); await P.wait(0.5); await m.release(k % 2 ? 'L' : 'R'); }
    change(w, x => { x.have = true; }); w.cal.advance(15);
    await P.converse(S.herbGathered(h.id), { shot: false, keepCamera: true });
    w.refresh();
  }
  return { actions: () => { const h = want(); return h && !P.busy ? [{ label: h.label, at: at[h.id].clone().setY(4), run: gather }] : []; } };
}

function objective(w) {
  if (!on(w)) return null; const s = stateOf(w);
  if (s.asked) { const h = herb(s.asked); return s.have ? 'Take ' + h.name + ' to Grandmother.' : 'Grandmother’s errand: ' + h.name + ', ' + h.where + '.'; }
  return s.n === 0 && w.cal.minute < 18 * 60 ? 'Visit Grandmother, when there’s time.' : null;
}

const api = { talk, wood, objective, stateOf, next, HERBS };
root.Herbs = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
