// Little Red’s Lessons — chapter one, The Red Cloak (phase 1.1 of the quest plan), as scenes the world plays (js/world.js) when their steps come up.
//
//  ch1.tea (Hulda's line: the red cloak), at her grandmother's, late afternoon: tea and cake and being fussed; the gift of the cloak; "Little
//     Red". Then she's free to look about, until she goes out of the door for home.
//  ch1.walk (Maren's: home before dark), the wood: the long path home, hers to walk (or run, or dawdle). Her thoughts come as she goes; she can
//     stop to pick bluebells, sit by the stream, find the carving on the old beech (Peter's line: the R and P), sit on the fallen tree. The time
//     goes as she walks, and faster when she dawdles; at the edge of the wood the village comes into sight, and with it, everything she left there.
//  ch1.homecoming (Maren's: the homecoming), home, late in the dusk: her mother sees her face at once, and the conversation (js/story.js); the
//     correction, there in the room (js/correction.js), and after it the two of them; the end of the chapter, and on to the next morning.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3;
const flat = v => v.clone().setY(0), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const outfit = (o, onlyIf) => { if (!root.Looks) return; const l = Looks.load(); if (!onlyIf || l.red.outfit === onlyIf) { l.red.outfit = o; Looks.save(l); } };

// ── Her grandmother's: at the table, the two of them sat; the tea, the gift, the cloak.
World.scene('ch1.tea', {
  ownObjective: true,
  // (the game opens on her grandmother's cabin from the wood, under its oak, in the late afternoon; then straight to the two of them at the table)
  establish: { area: 'wood', entry: 'cabin', from: [-14, 34, 150], to: [-12, 27, 112], look: [-6, 24, 30], secs: 6 },
  prepare(o) {
    outfit('No cloak');      // (she came without it)
    return Object.assign(o, { npc: { id: 'gran', key: 'gran', name: 'Grandmother', at: [-2, -15], yaw: 0, voice: 'gran', tint: '#5a6a3a', bg: '#e4e8d6' }, start: { at: [-2, 7], yaw: Math.PI } });
  },
  run(P, w) {
    w.objective('');
    const W = P.world, stool = W.seats.find(s => s.name === 'the stool'), chair = W.seats.find(s => s.name === 'the chair');
    P.seatNow(stool); P.seatNow(chair, 'npc');
    P.act(async () => {
      await P.wait(0.05); if (P.talk) P.talk.settle(['red', 'gran'], 0);      // (sat, under the fade: it opens on the conversation's own view of them)
      await P.wait(1.2);
      const g = P.npcMotion, gift = W.gift, gp = () => gift.obj.position.clone().add(gift.grip);
      const ctx = {
        // (she gets up, goes to the dresser, takes the parcel down, and brings it round to Rose's side; Rose stands to take it)
        fetchGift: async () => {
          // (a wider shot as she gets up, across the room, side on to her way from the table to the dresser and back, so she's seen going
          // for it rather than walking at the camera)
          P.stage.go(new V3(34, 27, -2), new V3(-12, 12, -8), 1100);      // (from the bed's side of the room: the table, the dresser and her way between them)
          await g.stand();
          const at = flat(gp()).add(new V3(0, 0, 8)); await g.goTo(at, yawTo(at, gp()));
          await g.reach('R', gp()); g.reach('L', gp().add(new V3(1.5, 0, 0))); g.hold(gift, 'front'); gift.panel = null; W.items.splice(W.items.indexOf(gift), 1);
          g.release('L'); await g.release('R');
          // (round the table, not through it: out to its side, then to Rose's)
          const red = P.motion.pos.clone(), to = red.clone().add(new V3(-12, 0, 1));      // (an arm's length and the parcel's, from her: not into her) await g.goTo(new V3(-17, 0, 2), null); await g.goTo(to, yawTo(to, red));
          await P.getUp(); await P.motion.face(yawTo(P.motion.pos, g.pos)); P.talk.settle(['red', 'gran']); await P.wait(0.6);
        },
        giveGift: async () => { const it = g.drop(); P.motion.hold(it, 'front'); await P.wait(0.8); },
        openGift: async () => { const it = P.motion.drop(); if (it) it.obj.visible = false; P.setOutfit('Hood down', true); await P.wait(0.6); },
        // (a full turn on the spot, slowly, to show it off)
        twirl: async () => { const m = P.motion, y = m.yaw; for (const k of [1, 2, 3]) await m.face(y + k * 2.1); await m.face(y); await P.wait(0.2); },
        seeOff: async () => { },
      };
      await P.converse(Story.grandmother(ctx), { shot: ['red', 'gran'] });
      w.complete('hulda.cloak');
      w.objective('Home before dark. Out through the door, and straight along the path.');
    });
  },
});

// ── The wood: the walk home, the light going as she goes.
World.scene('ch1.walk', {
  ownObjective: true,
  prepare(o, w) {
    outfit('Hood down', 'No cloak');      // (in her new cloak)
    let far = 0, picked = false, carved = w.q.done('peter.beech'), extra = 0, P = null, wood = null; const mused = new Set(), sat = new Set();
    const set0 = o.set; o.set = s => (wood = set0(s));
    const m = () => P.motion, think = (face, text) => P.talk.muse(text, { face });
    const sp = () => wood.spots, spotSay = k => { for (const [f, t] of Story.SPOTS[k]) think(f, t); };
    // The time: as far as she's come along the path (from a quarter to five to the last of the light), and more for dawdling.
    w.time(false);
    const start = Math.max(w.cal.minute, 16 * 60 + 45);
    o.place0 = o.place; o.place = P_ => { P = P_; if (o.place0) o.place0(P_); };
    // The things she can stop for (the stone and the fallen tree are seats, and come up on their own).
    o.actions = () => {
      const a = [], s = sp();
      if (!picked && !m().carry) a.push({ label: s.bluebells.label, at: s.bluebells.reach, run: async () => {
        const p = s.bluebells.reach.clone(); await m().goTo(flat(p).addScaledVector(flat(m().pos).sub(flat(p)).normalize(), 4), yawTo(m().pos, p));
        m().lookAt(p); await m().reach('R', p.clone().add(new V3(0, -1.2, 0))); picked = true; m().hold(posy(P), 'hang'); await m().release('R'); m().lookAt(null);
        spotSay('bluebells'); extra += 12; w.save.change(st => { if (!st.items.includes('bluebells')) st.items.push('bluebells'); }); w.rep.add('mischievous', 0.5, 'dawdling for bluebells'); } });
      if (!carved) a.push({ label: s.beech.label, at: s.beech.reach, run: async () => {
        const p = s.beech.reach.clone(); await m().goTo(flat(p).addScaledVector(s.beech.side3, -6), yawTo(flat(p).addScaledVector(s.beech.side3, -6), p));
        m().lookAt(p); await m().reach('L', p.clone().addScaledVector(s.beech.side3, -0.4)); spotSay('beech'); await P.wait(4.5); await m().release('L'); m().lookAt(null); carved = true; extra += 12; w.complete('peter.beech'); } });
      return a;
    };
    o.onFrame = dt => {
      if (!P) return;
      const pr = wood.progress(m().pos); far = Math.max(far, pr);
      const still = m().speed < 1 && !P.talk.playing, seated = P.sitting;
      if (still) extra += dt * (seated ? 1.6 : 0.5);
      const want = start + far * 170 + extra; if (want - w.cal.minute >= 1 && w.cal.day === 1) w.cal.advance(Math.floor(want - w.cal.minute));
      for (const [at, face, text] of Story.WALK) if (far >= at && !mused.has(at)) { mused.add(at); think(face, text); }
      for (const k of ['stream', 'log']) if (seated && seated === sp()[k].seat && !sat.has(k)) { sat.add(k); spotSay(k); }
    };
    // Out of the wood at the village end: home.
    o.leaving = ex => { if (ex.name === 'the village') w.complete('maren.walk'); };
    return o;
  },
  run(P, w) { w.objective('Home, along the path.'); },
});
// A posy of bluebells, to carry.
function posy(P) {
  const g = new THREE.Group(); P.stage.scene.add(g);
  for (let k = 0; k < 7; k++) { const a = k / 7 * 6.3, tip = new V3(Math.cos(a) * 0.5, 2.6 + (k % 3) * 0.3, Math.sin(a) * 0.5);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, tip.length(), 4), Toon.mat('#4e7a36')); st.position.copy(tip).multiplyScalar(0.5); st.quaternion.setFromUnitVectors(new V3(0, 1, 0), tip.clone().normalize()); g.add(st);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), Toon.mat(k % 2 ? '#5a6ad8' : '#7a7ae8')); h.position.copy(tip); g.add(h); }
  return { obj: g, name: 'the bluebells', grip: new V3(0, 0.6, 0), radius: 1 };
}

// ── Home, at dusk: in through the door, her mother by the hearth; she sees Rose's face, and they talk. Then the correction she's earned (a light
// one: home late through the wood, at dusk), there in the room, and after it, the two of them; the end of the chapter.
World.scene('ch1.homecoming', {
  ownObjective: true,
  prepare(o, w) {
    delete o.talk; delete o.actions;
    o.after = async kind => {
      if (kind !== 'homecoming') return; const P = w.P;
      w.rep.add('wilful', 1, 'home through the wood at dusk, after being told');
      const r = await Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: Story.homecomingCorrection, implement: 'hairbrush' }], fade: on => w.fade(on) });      // (the story's own correction, scripted: js/story.js)
      if (P !== w.P) return;
      await P.converse(Story.afterCorrection(r), { shot: ['red', 'mother'] });
      w.rep.settle('wilful'); if (r.rose) w.save.flag('rose-said', w.cal.day);
      w.complete('maren.homecoming');
      if (w.ui.card) w.ui.card(r);
    };
    return o;
  },
  run(P, w) { w.objective(''); P.act(async () => { await P.wait(1.4); await P.talkToMother(); }); },
});
})(typeof window !== 'undefined' ? window : globalThis);
