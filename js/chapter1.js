// Red Lessons — chapter one, The Red Cloak (story.html): three scenes, one after the other.
//
//  1. Her grandmother's cabin, late afternoon: tea and cake and being fussed; the gift of the cloak; "Little Red". Then she's free to look about,
//     until she goes out of the door for home.
//  2. The wood: the long path home, hers to walk (or run, or dawdle). Her thoughts come as she goes; she can stop to pick bluebells, sit by the
//     stream, find the carving on the old beech, sit on the fallen tree. The light goes as she walks, and faster when she dawdles. At the edge
//     of the wood the village comes into sight, and with it, everything she left there.
//  3. Home, late in the dusk: her mother sees her face at once, and the conversation (js/story.js, the homecoming), and a card on to the lap scene.
//
//   const ch = Chapter1.create(view, { prompt, objective, fade, card })   ch.start(scene?)   ch.P: the scene being played (js/play.js)
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3;
const flat = v => v.clone().setY(0), yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);

function create(view, ui) {
  let P = null, wood = null, dusk = 0.3, scene = null;
  const say = t => ui.objective && ui.objective(t);
  const wait = s => new Promise(r => setTimeout(r, s * 1000));
  async function go(name) {
    if (ui.fade) await ui.fade(true, { cabin: 'Grandmother’s', wood: 'The wood', home: 'Home' }[name]);
    if (P) { P.dispose(); P = null; }
    scene = name; say('');
    await ({ cabin, wood: walk, home })[name]();
    if (ui.fade) await ui.fade(false);
  }

  // ── 1. Her grandmother's.
  async function cabin() {
    if (root.Looks) { const l = Looks.load(); l.red.outfit = 'No cloak'; Looks.save(l); }      // (she came without it)
    P = Play.create(view, { set: s => Cabin.build(s), light: 0.3, prompt: ui.prompt,
      npc: { id: 'gran', key: 'gran', name: 'Grandmother', at: [-2, -15], yaw: 0, voice: 'gran', tint: '#5a6a3a', bg: '#e4e8d6' },
      start: { at: [-2, 7], yaw: Math.PI }, talk: () => Story.granAgain(),
      onExit: () => go('wood') });
    const W = P.world, stool = W.seats.find(s => s.name === 'the stool'), chair = W.seats.find(s => s.name === 'the chair');
    P.seatNow(stool); P.seatNow(chair, 'npc');
    P.act(async () => {
      await P.wait(1.2);
      const g = P.npcMotion, gift = W.gift, gp = () => gift.obj.position.clone().add(gift.grip);
      const ctx = {
        // (she gets up, goes to the dresser, takes the parcel down, and brings it round to Rose's side; Rose stands to take it)
        fetchGift: async () => {
          await g.stand();
          const at = flat(gp()).add(new V3(0, 0, 8)); await g.goTo(at, yawTo(at, gp()));
          await g.reach('R', gp()); g.reach('L', gp().add(new V3(1.5, 0, 0))); g.hold(gift, 'front'); gift.panel = null; W.items.splice(W.items.indexOf(gift), 1);
          g.release('L'); await g.release('R');
          const red = P.motion.pos.clone(), to = red.clone().add(new V3(7, 0, 1)); await g.goTo(to, yawTo(to, red));
          await P.getUp(); await P.motion.face(yawTo(P.motion.pos, g.pos)); P.talk.settle(['red', 'gran']); await P.wait(0.6);
        },
        giveGift: async () => { const it = g.drop(); P.motion.hold(it, 'front'); await P.wait(0.8); },
        openGift: async () => { const it = P.motion.drop(); if (it) it.obj.visible = false; P.setOutfit('Hood down', true); await P.wait(0.6); },
        // (a full turn on the spot, slowly, to show it off)
        twirl: async () => { const m = P.motion, y = m.yaw; for (const k of [1, 2, 3]) await m.face(y + k * 2.1); await m.face(y); await P.wait(0.2); },
        seeOff: async () => { },
      };
      await P.converse(Story.grandmother(ctx), { shot: ['red', 'gran'] });
      say('Home before dark. Out through the door, and straight along the path.');
    });
  }

  // ── 2. The wood.
  async function walk() {
    let far = 0, picked = false, carved = false; const mused = new Set(), sat = new Set();
    if (root.Looks) { const l = Looks.load(); if (l.red.outfit === 'No cloak') { l.red.outfit = 'Hood down'; Looks.save(l); } }      // (in her new cloak)
    P = Play.create(view, { set: s => (wood = Wood.build(s)), npc: null, light: dusk, followCam: true, prompt: ui.prompt,
      start: { at: [-12, 52], yaw: 0 }, camTurn: Math.PI, camBack: [78, 30], actions: () => actions(), onExit: () => go('home'), onFrame: dt => frame(dt) });
    say('Home, along the path. (Shift to run.)');
    const sp = wood.spots, m = () => P.motion, think = (face, text) => P.talk.muse(text, { face });
    const spotSay = k => { for (const [f, t] of Story.SPOTS[k]) think(f, t); };
    // The things she can stop for (the stone and the fallen tree are seats, and come up on their own).
    function actions() {
      const a = [];
      if (!picked && !m().carry) a.push({ label: sp.bluebells.label, at: sp.bluebells.reach, run: async () => {
        const p = sp.bluebells.reach.clone(); await m().goTo(flat(p).addScaledVector(flat(m().pos).sub(flat(p)).normalize(), 4), yawTo(m().pos, p));
        m().lookAt(p); await m().reach('R', p.clone().add(new V3(0, -1.2, 0))); picked = true; m().hold(posy(), 'hang'); await m().release('R'); m().lookAt(null);
        spotSay('bluebells'); dusk += 0.05; } });
      if (!carved) a.push({ label: sp.beech.label, at: sp.beech.reach, run: async () => {
        const p = sp.beech.reach.clone(); await m().goTo(flat(p).addScaledVector(sp.beech.side3, -6), yawTo(flat(p).addScaledVector(sp.beech.side3, -6), p));
        m().lookAt(p); await m().reach('L', p.clone().addScaledVector(sp.beech.side3, -0.4)); spotSay('beech'); await P.wait(4.5); await m().release('L'); m().lookAt(null); carved = true; dusk += 0.05; } });
      return a;
    }
    // A posy of bluebells, to carry.
    function posy() {
      const g = new THREE.Group(); P.stage.scene.add(g);
      for (let k = 0; k < 7; k++) { const a = k / 7 * 6.3, tip = new V3(Math.cos(a) * 0.5, 2.6 + (k % 3) * 0.3, Math.sin(a) * 0.5);
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, tip.length(), 4), Toon.mat('#4e7a36')); st.position.copy(tip).multiplyScalar(0.5); st.quaternion.setFromUnitVectors(new V3(0, 1, 0), tip.clone().normalize()); g.add(st);
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), Toon.mat(k % 2 ? '#5a6ad8' : '#7a7ae8')); h.position.copy(tip); g.add(h); }
      return { obj: g, name: 'the bluebells', grip: new V3(0, 0.6, 0), radius: 1 };
    }
    function frame(dt) {
      const pr = wood.progress(m().pos); far = Math.max(far, pr);
      // The light: with how far she's come, and more when she stands about (more still sitting); the posy and the carving cost a little each.
      const still = m().speed < 1 && !P.talk.playing, seated = P.sitting;
      dusk = Math.min(1, Math.max(dusk, 0.3 + 0.45 * far) + (still ? dt * (seated ? 0.006 : 0.0018) : 0));
      P.stage.setLight(dusk);
      for (const [at, face, text] of Story.WALK) if (far >= at && !mused.has(at)) { mused.add(at); think(face, text); }
      for (const k of ['stream', 'log']) if (seated && seated === sp[k].seat && !sat.has(k)) { sat.add(k); spotSay(k); }
    }
  }

  // ── 3. Home, at dusk: in through the door, her mother by the hearth; she sees Rose's face, and they talk.
  async function home() {
    P = Play.create(view, { light: Math.max(0.82, dusk), prompt: ui.prompt, start: { at: [-44, 31], yaw: Math.PI / 2 },
      after: (sc, picks) => { if (sc === 'homecoming' && ui.card) ui.card(); } });
    P.act(async () => { await P.wait(1.4); await P.talkToMother(); });
  }

  return { start: name => go(name || 'cabin'), get P() { return P; }, get scene() { return scene; }, get dusk() { return dusk; }, set dusk(v) { dusk = v; } };
}

root.Chapter1 = { create };
})(typeof window !== 'undefined' ? window : globalThis);
