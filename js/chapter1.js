// Little Red’s Lessons — chapter one, The Red Cloak (phase 1.1 of the quest plan), as scenes the world plays (js/world.js) when their steps come up.
//
//  ch1.tea (Hulda's line: the red cloak), at her grandmother's, late afternoon: tea and cake and being fussed; the gift of the cloak; "Little
//     Red". Then she's free to look about, until she goes out of the door for home.
//  ch1.walk (Maren's: home before dark), the wood: the long path home, hers to walk (or run, or dawdle). Her thoughts come as she goes; she
//     stops at the bluebells, the stream and the carving on the old beech (Peter's line: the R and P), and at each can stay longer; she can sit
//     on the fallen tree. The time goes with the path, the stops and her staying; at the edge of the wood the village comes into sight, and with
//     it, everything she left there.
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
    // (on her way somewhere: if the table's in the way, out round its nearer side first, wherever the furniture stands)
    const round = async (mo, to) => { const tb = W.surfaces.find(s => s.name === 'the table'); if (!tb) return; const c = new V3((tb.x0 + tb.x1) / 2, 0, (tb.z0 + tb.z1) / 2), R = Math.max(tb.x1 - tb.x0, tb.z1 - tb.z0) / 2 + 9;
      const a = flat(mo.pos), v = flat(to).sub(a), t = Math.max(0, Math.min(1, c.clone().sub(a).dot(v) / (v.lengthSq() || 1))), near = a.clone().addScaledVector(v, t);
      if (near.distanceTo(c) >= R || t <= 0 || t >= 1) return; const out = near.clone().sub(c); if (out.lengthSq() < 1e-4) out.set(-v.z, 0, v.x); await mo.goTo(P.collide(c.clone().addScaledVector(out.normalize(), R), 3.6, 'npc'), null); };
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
          // (a wide shot from high in a corner of the room or the middle of a wall, whichever's at a good distance from the table and the dresser
          // and has Rose, sat at the table, out of the way: her way from the one to the other in it, side on as near as can be)
          const dr = W.surfaces.find(s => s.name === 'the dresser'), front = dr ? dr.front.clone().setY(0).normalize() : new V3(0, 0, 1);
          { const tb = W.surfaces.find(s => s.name === 'the table'), a = tb ? new V3((tb.x0 + tb.x1) / 2, 0, (tb.z0 + tb.z1) / 2) : new V3(), b = flat(gp()), mid = a.clone().lerp(b, 0.5);
            const B = W.bounds, I = 5, xs = [B.x0 + I, (B.x0 + B.x1) / 2, B.x1 - I], zs = [B.z0 + I, (B.z0 + B.z1) / 2, B.z1 - I], along = b.clone().sub(a).normalize(), redAt = flat(P.motion.pos);
            const seg = (p, q, x) => { const v = q.clone().sub(p), t = Math.max(0, Math.min(1, x.clone().sub(p).dot(v) / (v.lengthSq() || 1))); return p.clone().addScaledVector(v, t).distanceTo(x); };
            const blocks = c => seg(c, mid, redAt) < 9 || seg(a, b, c) < 16;      // (Rose in the line of it; or the camera on her grandmother's way, to be walked into)
            let best = null;
            for (const x of xs) for (const z of zs) { const c = P.collide(new V3(x, 0, z), 6); if (c.distanceTo(mid) < 20) continue;      // (out of the oak, the hearth and the furniture)
              const score = Math.abs(c.distanceTo(mid) - 42) + 30 * Math.abs(c.clone().sub(mid).normalize().dot(along)) + (blocks(c) ? 200 : 0) + (c.clone().sub(b).dot(front) < 0 ? 25 : 0);      // (side on; not through Rose; the dresser's front to it)
              if (!best || score < best.score) best = { c, score }; }
            P.stage.go(best.c.clone().setY(30), mid.clone().setY(11), 1100); }
          await g.stand();
          const at = flat(gp()).addScaledVector(front, 8); await round(g, at); await g.goTo(at, yawTo(at, gp()));      // (before the dresser, whichever way it faces)
          await g.reach('R', gp()); g.reach('L', gp().addScaledVector(new V3(-front.z, 0, front.x), 1.5)); g.hold(gift, 'front'); gift.panel = null; W.items.splice(W.items.indexOf(gift), 1);
          g.release('L'); await g.release('R');
          // (to Rose: an arm's length and the parcel's from her, coming from where she is: not into her)
          const red = P.motion.pos.clone(), to = P.collide(red.clone().add(flat(g.pos).sub(flat(red)).setLength(12)), 3.6, 'npc'); await round(g, to); await g.goTo(to, yawTo(to, red));
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

// ── The wood: the walk home, the light going as she goes. Three places she can't pass by: the bluebells, the stream, the old beech. At each
// she stops (the stop takes its time), and at each she can stay longer (a choice: more bluebells, longer by the water thinking, longer with
// Peter's carving and what it was); every time she stays, she's later home, and her mother's correction is the heavier for it. What she did
// is kept (flags.walk: { bluebells, stream, beech }, 1 for each she stayed at), and she comes home with the bluebells: a posy, or an armful.
const STOP_MINS = 15, LINGER_MINS = 25, PATH_MINS = 115;      // (game minutes: the whole path at any pace, each stop, each time she stays)
World.scene('ch1.walk', {
  ownObjective: true,
  prepare(o, w) {
    outfit('Hood down', 'No cloak');      // (in her new cloak)
    let far = 0, extra = 0, P = null, wood = null; const mused = new Set(), sat = new Set(), stopped = new Set(), walk = { bluebells: 0, stream: 0, beech: 0 };
    w.save.flag('walk', Object.assign({}, walk));
    const set0 = o.set; o.set = s => (wood = set0(s));
    const m = () => P.motion, think = (face, text) => P.talk.muse(text, { face });
    const sp = () => wood.spots;
    // The time: as far as she's come along the path (from a quarter to five), each stop, each time she stays, and any dawdling besides.
    w.time(false);
    const start = Math.max(w.cal.minute, 16 * 60 + 45);
    o.place0 = o.place; o.place = P_ => { P = P_; if (o.place0) o.place0(P_); };
    o.actions = () => [];      // (the stops come up on their own; the fallen tree is a seat, there to sit on or not)
    // A stop: there, the thing done, her thoughts; and the choice, to stay a while or go on.
    const linger = k => async () => { walk[k] = 1; extra += LINGER_MINS; w.save.flag('walk', Object.assign({}, walk)); w.rep.add('mischievous', 0.5, 'lingering in the wood: ' + k);
      if (k === 'bluebells') await pick(true); };
    const pick = async big => {
      const s = sp().bluebells, p = s.reach.clone(); m().lookAt(p);
      await m().reach('R', p.clone().add(new V3(0, -1.2, 0)));
      const was = m().carry; if (was) { m().drop(); P.stage.scene.remove(was.obj); }
      m().hold(posy(P, big), big ? 'front' : 'hang'); await m().release('R'); m().lookAt(null);
      w.save.change(st => { if (!st.items.includes('bluebells')) st.items.push('bluebells'); });
    };
    const stop = async k => {
      const s = sp()[k]; extra += STOP_MINS;
      if (k === 'bluebells') { const p = s.reach.clone(); await m().goTo(flat(p).addScaledVector(flat(m().pos).sub(flat(p)).normalize(), 4), yawTo(m().pos, p)); await pick(false); }
      if (k === 'stream') await P.sitOn(s.seat);
      if (k === 'beech') { const p = s.reach.clone(), at = flat(p).addScaledVector(s.side3, -6); await m().goTo(at, yawTo(at, p)); m().lookAt(p); await m().reach('L', p.clone().addScaledVector(s.side3, -0.4)); }
      await P.converse(Story.walkStop(k, { linger: linger(k) }), { shot: false, keepCamera: true });
      if (k === 'beech') { await m().release('L'); m().lookAt(null); w.complete('peter.beech'); }
      if (k === 'stream') await P.getUp();
    };
    o.onFrame = dt => {
      if (!P) return;
      const pr = wood.progress(m().pos); far = Math.max(far, pr);
      const still = m().speed < 1 && !P.talk.playing && !P.busy, seated = P.sitting;
      if (still) extra += dt * (seated ? 1.6 : 0.5);
      const want = start + far * PATH_MINS + extra; if (want - w.cal.minute >= 1 && w.cal.day === 1) { w.cal.advance(Math.floor(want - w.cal.minute)); w.refresh(); }
      for (const k of ['bluebells', 'stream', 'beech']) if (!stopped.has(k) && far >= sp()[k].t - 0.012 && !P.busy) { stopped.add(k); P.act(() => stop(k)); }
      for (const [at, face, text] of Story.WALK) if (far >= at && !mused.has(at) && !P.busy) { mused.add(at); think(face, text); }
      if (seated && seated === sp().log.seat && !sat.has('log')) { sat.add('log'); for (const [f, t] of Story.SPOTS.log) think(f, t); }
    };
    // Out of the wood at the village end: home.
    o.leaving = ex => { if (ex.name === 'the village') w.complete('maren.walk'); };
    return o;
  },
  run(P, w) { w.objective('Home, along the path.'); },
});
// Bluebells, to carry: a posy in one hand, or (big) an armful.
function posy(P, big) {
  const g = new THREE.Group(); P.stage.scene.add(g); const n = big ? 34 : 7, r = big ? 1.3 : 0.5;
  for (let k = 0; k < n; k++) { const a = k * 2.4, rr = r * Math.sqrt((k + 0.5) / n) * (big ? 1.4 : 1), tip = new V3(Math.cos(a) * rr, (big ? 2.2 : 2.6) + (k % 3) * 0.3, Math.sin(a) * rr);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, tip.length(), 4), Toon.mat('#4e7a36')); st.position.copy(tip).multiplyScalar(0.5); st.quaternion.setFromUnitVectors(new V3(0, 1, 0), tip.clone().normalize()); g.add(st);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), Toon.mat(k % 2 ? '#5a6ad8' : '#7a7ae8')); h.position.copy(tip); g.add(h); }
  if (big) { const s = new THREE.Group(); s.add(...g.children); s.scale.setScalar(1.6); g.add(s); }      // (an armful: the bunch bigger all over)
  return { obj: g, name: 'the bluebells', grip: new V3(0, big ? 1 : 0.6, 0), radius: big ? 3 : 1 };
}
// What the walk came to (flags.walk), and what she said of it: { walk, lingered (how many), bunch ('posy' | 'armful'), lied (true, false, or
// null, not asked) }.
const walkOf = w => { const walk = Object.assign({ bluebells: 0, stream: 0, beech: 0 }, w.save.state.flags.walk || {}), lied = w.save.state.flags['homecoming-lied'];
  return { walk, lingered: walk.bluebells + walk.stream + walk.beech, bunch: walk.bluebells ? 'armful' : 'posy', lied: lied == null ? null : !!lied }; };

// ── Bedtime, the end of the homecoming (and of the chapter): under a fade, the night, and the two of them in her mother's bed (js/bed.js), the
// camera from the room; Red's thoughts as she lies there (js/story.js's bedtime), her face in the box beside them; and it holds, for the card.
async function bedtime(P, w, r) {
  if (!root.Bed || !P.world.seats.some(s => s.kind === 'bed')) return;
  const st = P.stage, talk = P.talk;
  await w.fade(true);
  [P.rig.root, P.npc && P.npc.root].filter(Boolean).forEach(o => { o.visible = false; });
  P.camHeld = true; st.setLight(Math.max(st.time || 0, 0.85));      // (night, the fire low)
  const b = Bed.scene(st, P.world); P.tick(dt => b.tick(dt));
  const v = b.shot(); st.go(v.pos, v.look, 0);
  // (her cloak off for bed at last, and on its hook by the door: so it is in the morning)
  if (P.world.cloakHooks) P.world.cloakHooks.setRed(true);
  if (root.Looks) { const l = Looks.load(); l.red.outfit = 'No cloak'; Looks.save(l); }
  const castWas = talk.cast.red.rig; talk.cast.red.rig = b.small;
  await P.wait(0.6); await w.fade(false); await P.wait(2.2);
  // (her thoughts, gone on from as a conversation is; her mother drifts off first, before Red has done thinking; Red after her last thought)
  const script = []; let sleep = false;
  for (const l of Story.bedtime(r)) { if (l === 'sleep') { sleep = true; continue; }
    script.push({ who: 'red', face: l[0], text: l[1], thought: true, cue: sleep ? () => b.big.setExpr('asleep', 1.2) : null }); sleep = false; }
  await talk.play(script, { shot: false, keepCamera: true, hold: 1e9 });
  b.small.setExpr('asleep', 1.0); await P.wait(3.0);
  talk.cast.red.rig = castWas;      // (the bed stays as it is, under the card)
}

// ── Home, at dusk: in through the door, her mother by the hearth; she sees Rose's face, and they talk. Then the correction she's earned (a light
// one: home late through the wood, at dusk), there in the room, and after it, the two of them; the end of the chapter.
World.scene('ch1.homecoming', {
  ownObjective: true,
  prepare(o, w) {
    delete o.talk; delete o.actions;
    // (what the conversation knows of the walk: the bluebells she's carrying, and what she stayed for; and what she tells her mother of it)
    w.save.flag('homecoming-lied', null);
    o.homecoming = () => Object.assign(walkOf(w), { clean: () => w.save.flag('homecoming-lied', false), lie: () => w.save.flag('homecoming-lied', true) });
    o.after = async kind => {
      if (kind !== 'homecoming') return; const P = w.P;
      w.rep.add('wilful', 1, 'home through the wood at dusk, after being told');
      // (the story's own correction, scripted: js/story.js; and after it, on her mother's lap, held close or sat up as Rose)
      if (walkOf(w).lied) w.rep.add('naughty', 1, 'told her mother she came straight home');
      // (the bluebells, out of her hands and laid on the table, under the fade into it: they're there in the morning)
      const lay = () => { const it = P.motion.carry, tb = P.world.surfaces.find(x => x.name === 'the table'); if (!it) return; P.motion.drop();
        if (tb) { it.obj.position.set((tb.x0 + tb.x1) / 2, tb.y + 0.4, (tb.z0 + tb.z1) / 2); it.obj.rotation.set(0, 0.6, Math.PI / 2); } else it.obj.visible = false; };
      const how = walkOf(w);
      const r = await Correction.run(P, { corrector: 'maren', turns: [{ subject: 'red', script: S => Story.homecomingCorrection(S, how), implement: 'hairbrush' }], after: Story.afterCorrection,
        fade: async on => { await w.fade(on); if (on) lay(); } });
      if (P !== w.P) return;
      if (!r.afterPlayed) await P.converse(Story.afterCorrection(r), { shot: ['red', 'mother'] });
      w.rep.settle('wilful'); if (r.rose) w.save.flag('rose-said', w.cal.day);
      w.complete('maren.homecoming');
      await bedtime(P, w, r);
      if (w.ui.card) w.ui.card(r);
    };
    return o;
  },
  // It opens on her mother by the hearth, waiting, concerned, turned to the door; the door open, and Rose in it, in her grandmother's cloak, coming
  // in and down the steps. The camera to the side of the two of them, her mother's face to it, the doorway beyond. Then the shot gives way to
  // the conversation's own, as Rose comes over.
  run(P, w) {
    w.objective('');
    const W = P.world, dw = W.doorway, mo = P.npcMotion, st = P.stage;
    if (P.outfit === 'No cloak') P.setOutfit('Hood down', true);      // (built again in it: so her motion is taken after)
    if (W.cloakHooks) W.cloakHooks.setRed(false);      // (it's on her, not on its hook)
    const me = P.motion;
    me.hold(posy(P, walkOf(w).bunch === 'armful'), walkOf(w).bunch === 'armful' ? 'front' : 'hang');      // (the bluebells from the wood)
    if (W.door) { W.door.open = W.door.target = 1; }
    if (dw) { me.warp(dw.at, yawTo(dw.at, dw.foot)); P.rig.root.position.copy(dw.at); }
    if (mo && dw) { mo.warp(mo.pos, yawTo(mo.pos, dw.at)); P.mother.setExpr('concerned'); }
    // (the shot: from the side of the line between them, toward the room, a little round toward the door, so her face turned to it shows)
    if (mo && dw) { const a = flat(mo.pos), b = flat(dw.at), mid = a.clone().lerp(b, 0.5), d = b.clone().sub(a), sep = d.length(); d.normalize();
      let side = new V3(-d.z, 0, d.x); const B = W.bounds; if (B && mid.clone().addScaledVector(side, 30).z > B.z1) side.negate();
      // (far enough back to hold the two of them, her mother and the doorway with its steps, across the view)
      const cam = P.collide(mid.clone().addScaledVector(side, sep * 1.3).addScaledVector(d, sep * 0.12), 4).setY(26);
      P.camHeld = true; st.go(cam, a.clone().lerp(b, 0.55).setY(17), 0); }
    P.act(async () => {
      await P.wait(1.0);
      if (dw) { await me.goTo(dw.foot, yawTo(dw.foot, mo ? mo.pos : dw.foot)); if (W.door) W.door.target = 0; }      // (in, down the steps; the door swung to behind her)
      await P.wait(0.6); P.camHeld = false;
      await P.talkToMother();
    });
  },
});
})(typeof window !== 'undefined' ? window : globalThis);
