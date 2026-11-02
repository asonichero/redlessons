// Little Red’s Lessons — Agnes and Georgie, after the fair (docs/quest-plan.md: 1.3). Georgie kissed her at the dancing, in front of the whole
// green, and she hadn't asked for it; then he ran, and left her standing. From the next day she's gone from the well: up by the pinfold, out of
// the way. Red finds her there (agnes.found): she doesn't want his sorry; she wants him to feel it as she did, and doesn't know how he could.
// Trusting Red enough, she can be told what being Little Red means (agnes.told): asked for, a word that stops it, and the after mattering as
// much as the rest. Then Georgie, his trust high (after Lay night, when he walked Red home, awkward and honest; or simply in time), and Red
// having been taken in hand by someone besides her mother: he's ashamed, and running made it worse. Red puts it to him plainly, and it's his
// to choose (agnes.georgie):
//   • yes: he asks Agnes to hold him to account. Red sets the terms with the two of them: the wood, off the herb path, by the fallen tree,
//     tomorrow afternoon; his word to stop it; and whether Red's there (Agnes asks her to be). Then it's done there, Red watching if she said
//     she would; and the after, the two of them. The well's the well again.
//   • no: he says sorry, and means it, and it isn't enough. Agnes is civil to him; back at the well, quieter than it was.
// No blessing is asked of anyone: it's between the two of them, and his yes is all the authority it needs. Either way, settled (agnes.settled).
//
//   Agnes.morning(w) (each morning: the kiss, heard of if she didn't see it) · Agnes.station(w, key, min) (js/villagers.js: where Agnes is,
//   and where she and Georgie aren't, the afternoon in the wood) · Agnes.talk(P, w, key) (js/villagers.js: → true when it was this line's talk)
//   · Agnes.wood(P, w) (the wood: the two of them by the fallen tree) · Agnes.away(w) · Agnes.woodDue(w)
// Kept in the save: state.agnes = { terms: { day (the afternoon it's to be), red (she'll be there) }, settled: 'yes' | 'no', said (the day
// Agnes was last talked to at the pinfold), back (Agnes's word at the well, after, said) }; flags 'fair-kiss' (and 'fair-kiss-heard': it was
// told her, not seen), 'georgie-walked' (Georgie walked her home on a Lay night after the fair).
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const FROM = H('13:30'), UNTIL = H('17:30');
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const stateOf = w => w.save.state.agnes || (w.save.state.agnes = { terms: null, settled: null });
const change = (w, fn) => w.save.change(s => { stateOf(w); fn(s.agnes); }, { agnes: true });
const st = (w, ref) => (w.q && w.q.stateOf ? w.q.stateOf(ref) : null);
const done = (w, ref) => !!(w.q && w.q.done && w.q.done(ref));
const offered = (w, ref) => st(w, ref) === 'offered';
const complete = (w, ref) => { if (!done(w, ref)) w.complete(ref); };
const fairDay = w => (root.Fair ? root.Fair.stateOf(w).day : 0);

// (the fair's passed, and it's not settled: Agnes keeps away from the well)
const away = w => !!fairDay(w) && w.cal.day > fairDay(w) && !done(w, 'agnes.settled');
// (the afternoon in the wood: the day agreed, its afternoon, and Red to be there)
const woodDue = w => { const t = stateOf(w).terms; return !!t && t.red && w.cal.day === t.day && w.cal.minute >= FROM && w.cal.minute < UNTIL && !done(w, 'agnes.settled'); };

// Each morning: the kiss, if she didn't see it, she's heard of by now (the whole village has); and the afternoon in the wood, if it's gone by
// (without her, as she'd said; or without her though she'd said she'd be there): settled all the same.
function morning(w) {
  if (!fairDay(w) || w.cal.day <= fairDay(w)) return;
  const fl = w.save.state.flags || {};
  if (!fl['fair-kiss']) { w.save.flag('fair-kiss', fairDay(w)); w.save.flag('fair-kiss-heard', fairDay(w)); }
  complete(w, 'agnes.kiss');
  const t = stateOf(w).terms;
  if (t && w.cal.day > t.day && !done(w, 'agnes.settled')) { change(w, s => { s.settled = 'yes'; s.missed = !!t.red; }); settle(w); }
}
function settle(w) { for (const r of ['agnes.found', 'agnes.georgie', 'agnes.settled']) if (!done(w, r)) w.q.complete(r); w.refresh(); }

// Where Agnes is (and Georgie, the afternoon in the wood): undefined for her usual day (js/villagers.js).
function station(w, key, min) {
  if (key !== 'agnes' && key !== 'georgie') return undefined;
  const t = stateOf(w).terms;
  if (t && w.cal.day === t.day && min >= FROM - 30 && min < UNTIL && !done(w, 'agnes.settled')) return null;      // (gone to the wood, the two of them)
  if (key === 'agnes' && away(w)) return min >= H('8:00') && min < H('19:00') ? { stand: 'pinfold' } : null;      // (up by the pinfold, out of the way; and of an evening, in)
  return undefined;
}

// Talking to Agnes or Georgie: → true when it was this line's.
async function talk(P, w, key) {
  const S = root.Story, rep = w.rep, shot = { shot: ['red', key] };
  if (key === 'agnes') {
    if (offered(w, 'agnes.found')) {
      await P.converse(S.agnesFound(!!(w.save.state.flags || {})['fair-kiss-heard']), shot);
      w.complete('agnes.found'); rep.trusts('agnes', 0.5); w.refresh(); return true; }
    if (offered(w, 'agnes.told')) {
      let told = false;
      await P.converse(S.agnesTell({ tell: () => { told = true; } }), shot);
      if (told) { rep.tell('agnes', 1); rep.trusts('agnes', 0.5); w.complete('agnes.told'); w.refresh(); }
      return true; }
    const s = stateOf(w);
    if (s.terms && !done(w, 'agnes.settled')) { await P.converse(S.agnesWaiting(s.terms.red), shot); return true; }
    if (away(w)) { await P.converse(S.agnesAway(done(w, 'agnes.told')), shot); return true; }
    if (s.settled && !s.back) { await P.converse(S.agnesBack(s.settled, !!s.missed, !!(s.terms && s.terms.red)), shot); change(w, x => { x.back = w.cal.day; }); rep.trusts('agnes', 0.5); return true; }
    return false;
  }
  if (key === 'georgie') {
    if (!offered(w, 'agnes.georgie')) return false;
    let put = false;
    await P.converse(S.georgieAshamed({ put: () => { put = true; } }), shot);
    if (!put) return true;
    // (his to choose: yes, if he's come to trust her (and been honest with her, that Lay night); else his sorry, and no more)
    const yes = rep.trust('georgie') >= 4 || !!(w.save.state.flags || {})['georgie-walked'];
    await P.converse(S.georgieChooses(yes), shot);
    await terms(P, w, yes);
    return true;
  }
  return false;
}
// To Agnes, at the pinfold, the three of them: his yes, and the terms set; or his sorry.
async function terms(P, w, yes) {
  const S = root.Story, V = P.villagers; if (!V) return;
  await w.fade(true);
  const sp = P.world.spots && P.world.spots.pinfold, at = sp ? sp.at.clone() : P.motion.pos.clone();
  const ag = V.summon('agnes', 'pinfold'), ge = V.summon('georgie', 'pinfold');
  const fw = sp ? new V3(Math.sin(sp.yaw), 0, Math.cos(sp.yaw)) : new V3(0, 0, 1), side = new V3(fw.z, 0, -fw.x);
  const aAt = P.collide(at.clone(), 3.2), gAt = P.collide(at.clone().addScaledVector(fw, 14).addScaledVector(side, 6), 3.2), rAt = P.collide(at.clone().addScaledVector(fw, 12).addScaledVector(side, -7), 3.2);
  ag.motion.warp(aAt, yawTo(aAt, gAt)); ag.rig.root.position.copy(aAt); ge.motion.warp(gAt, yawTo(gAt, aAt)); ge.rig.root.position.copy(gAt);
  P.motion.warp(rAt, yawTo(rAt, aAt)); P.rig.root.position.copy(rAt);
  for (let i = 0; i < 10; i++) P.frame(1 / 60);
  await P.wait(0.3); await w.fade(false);
  if (!yes) {
    await P.converse(S.georgieSorry(), { shot: ['agnes', 'georgie'] });
    change(w, s => { s.settled = 'no'; }); w.rep.trusts('georgie', 0.5);
    V.letGo('agnes'); V.letGo('georgie'); settle(w); return;
  }
  let red = true;
  await P.converse(S.agnesTerms({ there: () => { red = true; }, notThere: () => { red = false; } }), { shot: ['agnes', 'georgie'] });
  change(w, s => { s.terms = { day: w.cal.day + 1, red }; });
  w.complete('agnes.georgie'); w.rep.trusts('agnes', 1); w.rep.trusts('georgie', 1);
  V.letGo('agnes'); V.letGo('georgie'); w.refresh();
}

// ── The wood, the afternoon agreed: the two of them by the fallen tree, off the herb path. Coming near, Red's with them; Agnes on the trunk,
// Georgie over her knee, Red standing a little off, watching; then the after, the two of them, and Red leaves them to it.
function wood(P, w) {
  const sp = P.stage.cottage && P.stage.cottage.spots && P.stage.cottage.spots.log; if (!sp) return null;
  let figs = null, begun = false;
  const looks = root.Looks && root.Looks.load ? root.Looks.load() : {};
  const CAST = { agnes: { name: 'Agnes', voice: 'agnes', tint: '#7a5a2a', bg: '#efe4cc' }, georgie: { name: 'Georgie', voice: 'georgie', tint: '#6a6a5a', bg: '#e8e6dc' } };
  // (off the path, beyond the fallen tree: the two of them standing there, waiting on her)
  const place = sp.at.clone().addScaledVector(sp.side3, 14).setY(0), along = sp.dir.clone().setY(0).normalize();
  function make(key, at, yaw) {
    const rig = root.Toon.make(key, looks[key] || {}), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, key) });
    motion.warp(at, yaw); rig.root.position.copy(at); P.addFigure(key, { rig, motion, cast: CAST[key] });
    let gone = false; P.tick(dt => { if (gone) return; motion.update(dt, null); rig.tick(dt); });
    return { rig, motion, remove() { gone = true; P.removeFigure(key); } };
  }
  P.tick(() => {
    const due = woodDue(w) && !begun;
    if (due && !figs) { const a = place.clone().addScaledVector(along, -4), g = place.clone().addScaledVector(along, 4); figs = { agnes: make('agnes', a, yawTo(a, g)), georgie: make('georgie', g, yawTo(g, a)) }; }
    if (!due && figs && !begun) { figs.agnes.remove(); figs.georgie.remove(); figs = null; }
    if (figs && !begun && !P.busy && P.motion.pos.distanceTo(place) < 50) { begun = true; P.act(scene); }
  });
  async function scene() {
    const S = root.Story, m = P.motion;
    const at = P.collide(place.clone().addScaledVector(sp.side3, -12), 3.2); await m.goTo(at, yawTo(at, place));
    await P.converse(S.woodBefore(), { shot: ['agnes', 'georgie'] });
    figs.agnes.remove(); figs.georgie.remove();
    const yaw = yawTo(place, at), fw = new V3(Math.sin(yaw), 0, Math.cos(yaw)), sd = new V3(fw.z, 0, -fw.x), watch = place.clone().addScaledVector(fw, 16).addScaledVector(sd, 12);
    const r = await root.Correction.run(P, { corrector: 'agnes', fade: on => w.fade(on), seat: 'log', at: { x: place.x, z: place.z, yaw },
      turns: [{ subject: 'georgie', script: S.agnesGeorgie }], watchers: [{ who: 'red', at: [watch.x, watch.z], face: 'shy' }] });
    // (after: the two of them on the trunk, and Red going quietly)
    const a = place.clone().addScaledVector(sd, -2.5), g = place.clone().addScaledVector(sd, 2.5);
    figs = { agnes: make('agnes', a, yawTo(a, g)), georgie: make('georgie', g, yawTo(g, a)) };
    const back = P.collide(place.clone().addScaledVector(fw, 15), 3.2); m.warp(back, yawTo(back, place)); P.rig.root.position.copy(back);
    figs.georgie.rig.setExpr('teary', 30);
    await P.converse(S.agnesGeorgieAfter(r && r.rose), { shot: ['agnes', 'georgie'] });
    change(w, s => { s.settled = 'yes'; s.missed = false; });
    w.rep.trusts('agnes', 1); w.rep.trusts('georgie', 1); settle(w);
    w.cal.advance(45);
    const off = P.collide(m.pos.clone().addScaledVector(fw, 30), 3.2); await Promise.race([m.goTo(off, null), P.wait(4)]);
    if (P.talk) P.talk.muse(S.woodLeaving(), { face: 'calm' });
    const f = figs; P.wait(20).then(() => { f.agnes.remove(); f.georgie.remove(); });
  }
  return { scene };
}

const api = { morning, station, talk, wood, away, woodDue, stateOf, FROM, UNTIL };
root.Agnes = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
