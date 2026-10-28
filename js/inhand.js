// Little Red’s Lessons — 1.3, the village's own taken up (and Tom told, in 1.2, which opens the smith's).
//
//   • Telling Tom (tom.told, once he trusts her): talking to him, he says she's been odd since the pie; she can tell him what she and her
//     mother have, or not yet (he'll ask again another day).
//   • The same standard as Tom (tom.smith, once Tom knows): talking to Master Ferrier, she asks to answer to him as Tom does, for what they do
//     together. Agreed, the next dare she takes with Tom, he's heard it from the anvil: into the forge, the both of them, Tom
//     first, then her, the other watching; and he tells her mother himself (a reprieve at home: js/evening.js).
//   • Mistress Pennock's trust (pennock.trust, once she trusts her enough, after the pie): at the end of an afternoon's work, the key under the pot.
//   • Mistress Abney (abney.inhand, once she trusts her enough): at the end of an afternoon's work, she says Red's something on her mind; Red
//     can tell her, and ask to know where she stands with her; and she does it there, by the fire, Bess watching. (Or not yet: another day.)
//
//   InHand.tomWants(w) · .tellTom(P, w) · .smithWants(w) · .askSmith(P, w) · .agreed(w) · .caught(P, w, kind) (js/villagers.js, after a dare)
//   InHand.afterShift(P, w, id) (js/work.js: the end of a shift)
// Kept in the save (state.inhand): { tomAsked (a day), smithAsked (a day), agreed (a day) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const stateOf = w => w.save.state.inhand || (w.save.state.inhand = { tomAsked: 0, smithAsked: 0, agreed: 0 });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.inhand); }, { inhand: true });
const st = (w, ref) => w.q && w.q.stateOf ? w.q.stateOf(ref) : null;

// ── Tom.
const tomWants = w => st(w, 'tom.told') === 'offered' && stateOf(w).tomAsked !== w.cal.day;
async function tellTom(P, w) {
  let told = false; change(w, s => { s.tomAsked = w.cal.day; });
  await P.converse(root.Story.tomTold({ tell: () => { told = true; }, not: () => {} }), { shot: ['red', 'tom'] });
  if (told) { w.rep.tell('tom', 1); w.rep.trusts('tom', 0.5); w.complete('tom.told'); }
  w.refresh(); return told;
}
// ── The smith: asked; agreed; and the dare after.
const smithWants = w => st(w, 'tom.smith') === 'offered' && !stateOf(w).agreed && stateOf(w).smithAsked !== w.cal.day;
const agreed = w => !!stateOf(w).agreed && st(w, 'tom.smith') === 'offered';
async function askSmith(P, w) {
  let yes = false; change(w, s => { s.smithAsked = w.cal.day; });
  await P.converse(root.Story.smithAsk({ ask: () => { yes = true; }, not: () => {} }), { shot: ['red', 'smith'] });
  if (yes) { w.rep.tell('smith', 2); w.rep.trusts('smith', 0.5); change(w, s => { s.agreed = w.cal.day; }); }
  w.refresh(); return yes;
}
async function caught(P, w, kind) {
  const S = root.Story, V = P.villagers, m = P.motion; if (!V || !agreed(w)) return false;
  const smith = V.here('smith') || V.summon('smith', 'anvil'), tom = V.here('tom');
  V.hold && V.hold(smith); if (tom) V.hold(tom);
  const near = P.collide(m.pos.clone().setY(0).add(new V3(Math.sin(m.yaw) * 16, 0, Math.cos(m.yaw) * 16)), 3.2);
  await Promise.race([V.walkTo('smith', near, yawTo(near, m.pos)), P.wait(8)]);
  smith.motion.face(yawTo(smith.motion.pos, m.pos)); await m.face(yawTo(m.pos, smith.motion.pos));
  await P.converse(S.smithCaught(kind), { shot: ['red', 'smith'] });
  V.letGo('smith'); if (tom) V.letGo('tom', true);
  await w.go('forge', 'door');
  const Q = w.P; if (!Q) return true;
  Q.act(() => inTheForge(Q, w));      // (in the forge: hers to sit through, not walk out of)
  return true;
}
async function inTheForge(Q, w) {
  const S = root.Story;
  await Q.wait(0.6);
  await Q.converse(S.smithIndoors(), { shot: ['red', 'smith'] });
  const r = await root.Correction.run(Q, Object.assign({ corrector: 'smith', fade: on => w.fade(on),
    turns: [{ subject: 'tom', script: S.smithTom, corner: true, cornerDress: { skirt: 'up', drawers: 'down' } }, { subject: 'red', script: S.smithRed }],
    watchers: [{ who: 'red', at: [-24, -14], until: 'red', face: 'shy' }], cornerTime: 6 }, Q.world.lap ? Q.world.lap.middle : {}));      // (the bench brought out from under the workbench: Rose by the slack tub, watching)
  if (Q !== w.P) return;
  await Q.converse(S.smithAfter(r), { shot: ['red', 'smith'] });
  w.rep.settle('mischievous', 0.6); w.rep.settle('wilful', 0.3); w.rep.trusts('smith', 1);
  if (r && r.rose) w.save.flag('rose-said', w.cal.day);
  if (root.Evening) root.Evening.record(w, { what: 'dare', by: 'smith', informs: true });      // (he tells her mother himself: a reprieve at home)
  w.complete('tom.smith'); w.cal.advance(30); w.refresh();
}

// ── The end of a shift: Mistress Pennock's trust; Mistress Abney's taking her in hand.
async function afterShift(P, w, id) {
  const S = root.Story, rep = w.rep;
  if (id === 'bakery' && st(w, 'pennock.trust') === 'offered' && rep.trust('pennock') >= 3) {
    await P.converse(S.pennockTrust(), { shot: ['red', 'pennock'] }); rep.trusts('pennock', 1); w.complete('pennock.trust'); return true; }
  const s = st(w, 'abney.inhand');
  if (id === 'inn' && (s === 'offered' || s === 'gated') && rep.trust('abney') >= 3) {
    let told = rep.openness('abney') >= 1;
    if (!told) { const broken = !!(root.AbneyPromise && root.AbneyPromise.stateOf(w).broken);
      await P.converse(S.abneyOpen({ tell: () => { told = true; }, not: () => {}, broken }), { shot: ['red', 'abney'] });
      if (!told) return true;
      rep.tell('abney', 2); }
    const r = await root.Correction.run(P, { corrector: 'abney', fade: on => w.fade(on), turns: [{ subject: 'red', script: S.abneyInHand }] });
    if (P !== w.P) return true;
    await P.converse(S.abneyAfter(r), { shot: ['red', 'abney'] });
    rep.trusts('abney', 1); rep.settle('naughty', 0.5); if (r && r.rose) w.save.flag('rose-said', w.cal.day);
    if (root.Evening) root.Evening.record(w, { what: 'abney', by: 'abney', informs: true });
    if (st(w, 'abney.inhand') === 'offered') w.complete('abney.inhand');
    return true;
  }
  return false;
}

const api = { tomWants, tellTom, smithWants, askSmith, agreed, caught, afterShift, stateOf };
root.InHand = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
