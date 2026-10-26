// Little Red’s Lessons — a correction, played where the story is (in the scene's own stage, as Climbing Toward Consequence plays its corrections in the
// game rather than on a page of their own): under a fade the cottage's chair is set at the middle of the room and the lap scene (js/lap.js,
// embedded) is put in it; her mother works through the tier (js/discipline.js), her lines in the conversation box over the smacks, her portrait
// beside them; then under another fade the room comes back, Rose standing before her, the marks still on her.
//
// The player has the camera (the round button, or C, steps round the angles; a drag looks about) and her name: the octagon, ROSE (or R). Said
// at any point, everything stops at once, and her mother's closing words are the gentle ones, to Rose.
//
// Anyone can take anyone in hand (js/correctors.js): the corrector on their seat with their own implement, if the story brings it out; subjects in
// turn, each across the lap; others in the room watching, seated or standing; and the corner, after (or between) a turn, facing the wall, hands on
// head. The stop button is the player's own subject's word, there only on their turn (ROSE; at the Shoe, RED, with AMBER beside it to check in).
//
//   const r = await Correction.run(play, {
//     corrector: 'maren', context, player: 'red', fade: (on, text) => …,
//     turns: [{ subject: 'red', tier: 'light', implement: true | 'id', implementFrom, corner: true, cornerDress: { skirt: 'up' } }, …],
//     watchers: [{ who: 'gran', seat: 'the stool' } | { who: 'red', at: [x, z] }],      (who: a rig; seated on a seat of the room, or standing)
//     cornerTime: 20 })      (a turn's script: the story's own correction as a dialogue: see scripted())      (seconds, at the end, for those in the corner)
//   → the first turn's result (Discipline.run's: { hits, peak, stopped, rose, tooHarsh, done, implement }), and turns: every turn's
//   (still: Correction.run(play, { tier: 'light', fade }) — her mother, Red, the one turn)
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3;

const CSS = `
#corrUI { position: fixed; right: 76px; top: 10px; z-index: 36; display: none; flex-direction: row; align-items: center; gap: 12px; }
#corrUI.on { display: flex; }
#corrCam { width: 64px; height: 64px; margin: 0; padding: 0; border-radius: 50%; border: 3px solid #fff4e4; background: rgba(30,20,22,0.88); cursor: pointer; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 6px #000); }
#corrCam:hover { background: rgba(70,48,52,0.95); } #corrCam svg { width: 34px; height: 34px; fill: none; stroke: #fff; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
#corrRose { position: relative; width: 70px; height: 70px; margin: 0; padding: 0; border: 0; background: #fff; cursor: pointer; clip-path: polygon(29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%); filter: drop-shadow(0 2px 6px #000); }
#corrRose::before { content: ''; position: absolute; inset: 4px; background: #c4141c; clip-path: polygon(29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%); }
#corrRose span { position: relative; color: #fff; font: bold 16px Georgia, serif; letter-spacing: .06em; } #corrRose:hover::before { background: #e01c26; }
#corrRose[hidden], #corrAmber[hidden] { display: none; }
#corrAmber { width: 58px; height: 58px; margin: 0; padding: 0; border-radius: 50%; border: 3px solid #fff; background: #e09a1c; cursor: pointer; color: #fff; font: bold 12px Georgia, serif; letter-spacing: .05em; filter: drop-shadow(0 2px 6px #000); }
#corrAmber:hover { background: #f0aa2c; }
#corrHint { position: fixed; right: 12px; top: 84px; z-index: 36; max-width: 260px; font: italic 13px/1.4 Georgia, serif; color: #f3ead8; background: rgba(16,10,12,0.78); border: 1px solid #c9a84c;
  border-radius: 8px; padding: 6px 12px; opacity: 0; transition: opacity .6s; pointer-events: none; }
#corrHint.on { opacity: 1; }
body.correcting #hud .hb.t, body.correcting #hStick, body.correcting #hPrompt, body.correcting #hObj, body.correcting #hCam { display: none !important; }
@media (max-width: 640px) { #corrUI { right: 70px; } #corrCam { width: 52px; height: 52px; } #corrRose { width: 58px; height: 58px; } #corrRose span { font-size: 13px; } }
`;
let uiEl = null;
function ui() {
  if (uiEl) return uiEl;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  uiEl = document.createElement('div'); uiEl.id = 'corrUI';
  uiEl.innerHTML = '<button id="corrCam" title="Another angle (C)" aria-label="Camera"><svg viewBox="0 0 24 24"><path d="M3 8h4l1.6-2.4h6.8L17 8h4v11H3z"/><circle cx="12" cy="13.2" r="3.6"/></svg></button>' +
    '<button id="corrAmber" title="Amber: a check-in (A)" aria-label="Amber" hidden>AMBER</button><button id="corrRose" title="Her name: it stops at once (R)" aria-label="Stop"><span>ROSE</span></button>';
  document.body.appendChild(uiEl);
  const hint = document.createElement('div'); hint.id = 'corrHint'; hint.textContent = 'Her name stops it, at any moment: the sign, or R.'; document.body.appendChild(hint);
  return uiEl;
}

// The corrector's face for each kind of line (see js/discipline.js).
const FACES = { start: 'stern', stage: 'stern', implement: 'stern', during: ['calm', 'stern'], amber: 'shy', done: 'calm', after: 'smile', stop: 'shy', harsh: 'surprised' };
const ANGLES = ['side', 'behind', 'face', 'corrector', 'top', 'room', 'corner'];
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);

// Someone else in the room: a figure of their own, moved by js/motion.js, going with the scene (seated on one of its seats, or standing).
function figure(P, id, look) {
  const T = root.Toon, rig = T.make(id, look || {}); P.stage.scene.add(rig.root); if (P.stage.cast) P.stage.cast(rig);
  const m = root.Motion.create(rig, {}), untick = P.tick(dt => { m.update(dt, null); rig.tick(dt); });
  return { id, rig, m, remove() { untick(); P.stage.scene.remove(rig.root); } };
}
// (a figure in a corner, facing into it, hands on her head)
function toCorner(f, c) {
  f.m.warp(c.at, c.yaw); f.rig.root.position.copy(c.at); f.m.face(c.yaw);
  const top = s => () => { const h = f.rig.headGroup.getWorldPosition(new V3()), sc = f.rig.scaleW, y = f.m.yaw, side = new V3(Math.cos(y), 0, -Math.sin(y)), back = new V3(-Math.sin(y), 0, -Math.cos(y));
    return h.add(new V3(0, 1.9 * sc, 0)).addScaledVector(side, (s === 'L' ? 1 : -1) * 0.9 * sc).addScaledVector(back, 0.35 * sc); };
  f.m.reach('L', top('L')); f.m.reach('R', top('R'));
  f.rig.setExpr('shy');
}

async function run(P, o) {
  o = o || {};
  const st = P.stage, talk = P.talk, fade = o.fade || (async () => {}), wait = s => P.wait(s), A = root.GameAudio, Cs = root.Correctors;
  const el = ui(), hint = document.getElementById('corrHint'), looks = root.Looks ? root.Looks.load() : {};
  const c = Cs.corrector(o.corrector || 'maren'), player = o.player || 'red';
  const turns = o.turns || [{ subject: 'red', tier: o.tier || 'light', implement: o.implement, implementFrom: o.implementFrom }];
  await fade(true);
  // The two of them as they walk about, put aside; whoever watches, set in the room; the lap scene at the middle of it.
  const walkers = [P.rig.root, P.npc && P.npc.root].filter(Boolean); walkers.forEach(r => { r.visible = false; });
  const figs = [], cornerOf = {}, corners = (P.world.corners || []).slice();
  for (const w of o.watchers || []) {
    const sp = Cs.SUBJECTS[w.who] || {}, rid = w.rig || sp.rig || (w.who === 'gran' || w.who === 'hulda' ? 'gran' : w.who === 'maren' ? 'gerda' : 'red'), f = figure(P, rid, looks[rid]);
    const seat = w.seat && P.world.seats.find(x => x.name === w.seat);
    if (seat) { f.m.sit(seat); f.m.sitW = 1; } else { const at = new V3(w.at ? w.at[0] : -24, 0, w.at ? w.at[1] : 18); f.m.warp(at, yawTo(at, new V3())); f.rig.root.position.copy(at); }
    f.rig.setExpr(w.face || 'shy'); figs.push(f);
  }
  document.body.classList.add('correcting');
  const castKey = c.id === 'maren' && talk.cast.mother ? 'mother' : 'corrector', castWas = talk.cast[castKey];
  const camBtn = el.querySelector('#corrCam'), stopBtn = el.querySelector('#corrRose'), amberBtn = el.querySelector('#corrAmber');
  let lap = null, angle = 0, untick = null;
  // (the lap's own angles; the room, from beyond its front wall; and whoever's in a corner, from the room behind them)
  const cornered = () => Object.values(cornerOf)[0];
  const view = (name, ms) => {
    if (name === 'room') return st.go(new V3(-14, 48, 98), new V3(6, 6, -8), ms);
    if (name === 'corner') { const f = cornered(); if (!f) return; const c = f.corner.at, back = new V3(-Math.sin(f.corner.yaw), 0, -Math.cos(f.corner.yaw)); return st.go(c.clone().addScaledVector(back, 46).setY(30), c.clone().setY(15), ms); }
    if (lap) { const v = lap.VIEWS[name](); st.go(v.pos, v.look, ms); }
  };
  const next = () => { do angle = (angle + 1) % ANGLES.length; while ((ANGLES[angle] === 'corner' && !cornered()) || (!lap && ANGLES[angle] !== 'room' && ANGLES[angle] !== 'corner')); view(ANGLES[angle], 700); };
  let sub = null;
  const stop = () => { if (lap && sub && sub.id === player && !lap.st.ended) lap.rose(); };
  const amber = () => { if (lap && sub && sub.id === player && sub.lights) lap.amber(); };
  camBtn.onclick = e => { e.stopPropagation(); next(); };
  stopBtn.onclick = e => { e.stopPropagation(); if (A && A.init) A.init(); stop(); };
  amberBtn.onclick = e => { e.stopPropagation(); amber(); };
  const keys = e => { if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return; if (e.code === 'KeyR') stop(); if (e.code === 'KeyA') amber(); if (e.code === 'KeyC') next(); };
  addEventListener('keydown', keys);
  const results = []; let stoppedAll = false;
  // ── A scripted turn: the story's own correction, as a dialogue between the two of them over the smacks (Climbing Toward Consequence's way),
  // rather than the tier's procedure. t.script(S) is given:
  //   S.say(who, text, face)   a line, held to be read: who 'corrector' (or the corrector's own key) or 'subject' (the one across the lap)
  //   S.step(line, n)          a line said over a run of n smacks (the hand never waits for the words): line [who, text, face] or null
  //   S.smacks(n)              a run with nothing said;   S.after(line, n)   n smacks, then the line (a count, after each stroke lands)
//   S.gesture('skirt' | 'drawers' | 'soothe')   the giver's hand at the clothes, or soothing;   S.fetch(id, { ask, present, back })   sent for it
//     S.wait(secs);   S.set({ skirt, drawers, implement, strength, pace, side })
  //   S.lap, S.corrector, S.subject
  // Her word (the safe word) ends it at once ("too harsh" doesn't: the story's corrections are written to be what they are), wherever it's got to: the script stops there, and the corrector answers it.
  const STOP = { stop: true };
  async function fetchIt(id, o2, lap, line, subKey) {
    const say_ = l => l ? line(l[0], l[1], l[2]) : null, m = P.motion, r = P.rig, frame = lap.subjectRig.root.parent;
    if (o2.ask) await say_(o2.ask);
    await fade(true);
    lap.pause(true, { handsInLap: true }); frame.visible = false;      // (her hands in her lap while she waits)
    if (o2.waitFace) lap.giverRig.setExpr(o2.waitFace);
    const face = lap.subjectRig.expr || 'gritted';
    r.root.visible = true; P.setDress({ skirt: lap.st.skirt, drawers: lap.st.drawers, marks: Object.assign({}, lap.st.marks) }); r.setExpr(face);
    const castRig = talk.cast[subKey].rig; talk.cast[subKey].rig = r;
    // (on her feet beside the chair, facing her; the camera on the room, the chair and the chest both in it)
    const G = lap.giverRig, gp = G.root.getWorldPosition(new V3()), gf = new V3(0, 0, 1).applyQuaternion(G.root.getWorldQuaternion(new THREE.Quaternion())).setY(0).normalize();
    const before = P.collide(gp.clone().addScaledVector(gf, 13).setY(0), 3.4); m.warp(before, yawTo(before, gp)); r.root.position.copy(before);
    // (low, from the hearth, across the room: the chair, and the chest beyond it)
    const hearth = P.world.hearthCam || [4, 7, 34]; P.camHeld = true;
    st.go(new V3(hearth[0], hearth[1], hearth[2]), new V3(12, 11, -10), 0); for (let i = 0; i < 30; i++) P.frame(1 / 60);
    await fade(false);
    // (slowly across to it, rubbing her left cheek with her left hand: a moment's respite, and she makes the most of it)
    const rub = () => { const p = r.rear.L.getWorldPosition(new V3()), back = new V3(-Math.sin(m.yaw), 0, -Math.cos(m.yaw)), t = performance.now() / 1000;
      return p.addScaledVector(back, 0.9 * r.scaleW).add(new V3(0, Math.sin(t * 5) * 0.5 * r.scaleW, 0)); };
    const ch = P.world.chest, at = P.collide(ch.front.clone().add(new V3(0, 0, 6)).setY(0), 3.4);
    m.reach('L', rub); await m.goTo(at, Math.PI, { speed: 0.42 }); await m.release('L');      // (and back to the chest's lid, to open it)
    await P.useChest();
    // (in her left hand: held out on her mother's right, toward the camera at her shoulder)
    const brush = root.Implements ? root.Implements.model(id, r.palm ? r.palm.L : -1) : null; if (brush) { brush.position.y = -0.5; r.handL.add(brush); }
    await wait(0.5); await P.useChest();      // (and the lid shut on the rest)
    await m.goTo(before, yawTo(before, gp));
    if (o2.presentFace) G.setExpr(o2.presentFace);
    // (holding it out to her: the camera sweeping slowly round to her mother's right shoulder, Red's face and the brush held out both to us)
    { const sh = G.armR.getWorldPosition(new V3()), out = sh.clone().sub(gp).setY(0).normalize(), sc = G.scaleW;
      st.go(sh.clone().addScaledVector(out, 12 * sc).addScaledVector(gf, -12 * sc).add(new V3(0, 6 * sc, 0)), r.headGroup.getWorldPosition(new V3()).lerp(r.handL.getWorldPosition(new V3()), 0.7).add(new V3(0, -1.5 * sc, 0)), 3200); }
    m.reach('L', () => { const f = new V3(Math.sin(m.yaw), 0, Math.cos(m.yaw)), sd = new V3(Math.cos(m.yaw), 0, -Math.sin(m.yaw)); return r.root.position.clone().addScaledVector(f, 6.5 * r.scaleW).addScaledVector(sd, 1.5 * r.scaleW).add(new V3(0, 17 * r.scaleW, 0)); });      // (held out in front of her, at her chest)
    if (o2.present) await say_(o2.present); else await wait(1.2);
    if (o2.back) await say_(o2.back);
    await fade(true);
    m.release('L'); if (brush) r.handL.remove(brush); r.root.visible = false; P.camHeld = false; talk.cast[subKey].rig = castRig;
    frame.visible = true; lap.set({ implement: id }); view(ANGLES[angle], 0);
    await wait(0.3); lap.pause(false); await fade(false);
  }
  async function scripted(script, lap, c, sub, castKey) {
    const subKey = sub.id === player && talk.cast.red ? 'red' : 'subject', subWas = talk.cast[subKey];
    talk.cast[subKey] = Object.assign({ name: sub.names[0], side: 'left', voice: sub.rig === 'red' ? 'red' : 'gerda' }, subWas || {}, { rig: lap.subjectRig });
    lap.set({ noHarsh: true });      // (the story's own: only her word stops it, never the pain model's "too harsh")
    const ended = () => lap.st.rose || lap.st.ended;
    const keyOf = w => w === 'subject' || w === sub.id || w === 'red' && sub.id === player ? subKey : castKey;
    const line = (who, text, face) => talk.caption(keyOf(who), text.replace(/\{name\}/g, sub.names[0]).replace(/\{word\}/g, sub.word), { face, wait });
    const smacks = async n => { if (!n || ended()) return; lap.run(n); await wait(0.3); for (let i = 0; i < 900 && lap.busy() && !ended(); i++) await wait(0.1); };
    const S = { lap, corrector: c, subject: sub,
      say: async (who, text, face) => { if (ended()) throw STOP; await line(who, text, face); if (ended()) throw STOP; },
      step: async (l, n) => { if (ended()) throw STOP; await Promise.all([l ? line(l[0], l[1], l[2]) : null, smacks(n)]); if (ended()) throw STOP; },
      smacks: async n => { await smacks(n); if (ended()) throw STOP; },
      // (a stroke, and then the line: a count, or what's said in answer to it, once it's landed)
      after: async (l, n) => { await smacks(n == null ? 1 : n); if (ended()) throw STOP; if (l) await line(l[0], l[1], l[2]); if (ended()) throw STOP; },
      wait: async secs => { await wait(secs); if (ended()) throw STOP; },
      set: o2 => lap.set(o2),
      // (the giver's hand: lifting the skirt, drawing the drawers down, or soothing: see js/lap.js's gesture)
      face: f => { if (f) talk.face(castKey, f); },      // (the corrector's face, between lines; it stays until another is set)
      gesture: async (kind, o3) => { if (ended()) throw STOP; await lap.gesture(kind, o3); if (ended()) throw STOP; },
      // Sent to fetch the implement: up off the lap and across the room for it, as she is (the colour, the clothes and the hurt held as they
      // are), back to present it, and told back into place. o: { ask, present, back } — the lines, as [who, text, face].
      fetch: async (id, o2) => { if (ended()) throw STOP; await fetchIt(id, o2 || {}, lap, line, subKey); if (ended()) throw STOP; },
    };
    let done = false;
    try { await script(S); done = true; }
    catch (e) { if (e !== STOP) throw e; }
    const rose = !!lap.st.rose, tooHarsh = false;
    if (!done) { talk.captionOff(); await line('corrector', Cs.line(c, sub, 'stop') || '', 'shy'); }
    lap.end(); if (subWas) talk.cast[subKey] = subWas; else delete talk.cast[subKey];
    return { hits: lap.st.hits, peak: lap.st.peak, stopped: rose, rose, tooHarsh, done: done && !rose && !tooHarsh, implement: lap.st.implement !== 'hand' ? lap.st.implement : null };
  }
  try {
    for (let i = 0; i < turns.length && !stoppedAll; i++) {
      const t = turns[i]; sub = Cs.subject(t.subject || 'red', o.context);
      if (i > 0) await fade(true);
      // (whoever's turn it is comes out of the corner for it)
      if (cornerOf[sub.id]) { cornerOf[sub.id].remove(); corners.push(cornerOf[sub.id].corner); delete cornerOf[sub.id]; }
      if (lap) { untick(); lap.end(); st.scene.remove(lap.stage); }
      lap = root.Correction.current = root.Lap.create(null, { external: { scene: st.scene }, looks, giver: c.rig || 'gerda', subject: sub.rig || 'red', pitch: sub.pitch });      // (current: for a look in from outside)
      untick = P.tick(dt => lap.update(dt));
      talk.cast[castKey] = Object.assign({ name: c.name, side: 'right', voice: c.voice, tint: '#6a3a4a', bg: '#e6d8e6' }, castWas || {}, { rig: lap.giverRig });
      view(ANGLES[angle], 0);
      // (the stop button: the player's own word, on their own turn; amber beside it where the house has traffic lights)
      const mine = sub.id === player; stopBtn.hidden = !mine; amberBtn.hidden = !(mine && sub.lights);
      stopBtn.querySelector('span').textContent = sub.word.toUpperCase();
      hint.textContent = mine ? (sub.lights ? 'Red stops it, at any moment; amber checks in: the buttons, or R and A.' : 'Her name stops it, at any moment: the sign, or R.') : '';
      await wait(0.3); await fade(false);
      el.classList.add('on'); if (mine && i === 0) { hint.classList.add('on'); setTimeout(() => hint.classList.remove('on'), 7000); }
      const r = t.script ? await scripted(t.script, lap, c, sub, castKey) : await root.Discipline.run(lap, t.tier || 'light', {
        corrector: c, subject: sub, implement: t.implement, implementFrom: t.implementFrom, corner: !!(t.corner && corners.length),
        say: (text, kind, k) => { const f = FACES[kind]; talk.caption(castKey, text, { face: Array.isArray(f) ? f[(k || 0) % f.length] : f, wait }); },
        sleep: ms => wait(ms / 1000),
      });
      r.subject = sub.id; r.marks = Object.assign({}, lap.st.marks); results.push(r);
      if (r.stopped || r.tooHarsh) { stoppedAll = true; break; }
      // To the corner, after the turn (until their next, or the end), marks and all.
      if (t.corner && corners.length) {
        await wait(2.5); await fade(true);
        const f = figure(P, sub.rig || 'red', looks[sub.rig || 'red']), cn = corners.shift(); f.corner = cn; f.turn = t; f.sub = sub;
        f.rig.setDress(Object.assign({ skirt: 'down', drawers: 'up' }, t.cornerDress || {}, { marks: r.marks })); toCorner(f, cn);
        cornerOf[sub.id] = f; figs.push(f);
        lap.subjectRig.root.parent.visible = false;      // (off the lap: she's in the corner now; the corrector stays in her chair)
        if (i === turns.length - 1) { angle = ANGLES.indexOf('corner'); view('corner', 0); }
        await wait(0.4); await fade(false);
      }
    }
    // Corner time at the end, for whoever's still there.
    if (!stoppedAll && Object.keys(cornerOf).length) {
      stopBtn.hidden = amberBtn.hidden = true;
      await wait(o.cornerTime == null ? 12 : o.cornerTime);
      // (and out of it: the corrector's last word)
      const last = cornered(); if (last) { const l = Cs.line(c, last.sub, 'after'); if (l) await talk.caption(castKey, l, { face: 'smile', wait }); }
    } else await wait(results.length && (results[results.length - 1].stopped || results[results.length - 1].tooHarsh) ? 4.5 : 3.5);
  } finally {
    el.classList.remove('on'); hint.classList.remove('on'); removeEventListener('keydown', keys);
    await fade(true);
    talk.captionOff(); if (untick) untick(); if (lap) { lap.end(); st.scene.remove(lap.stage); }
    for (const f of figs) f.remove();
    if (castWas) talk.cast[castKey] = castWas; else delete talk.cast[castKey];
    walkers.forEach(r => { r.visible = true; });
    document.body.classList.remove('correcting');
  }
  // The room again: the player on her feet before her mother (when it's them), beside the chair, the marks under her skirt.
  const mine = results.find(r => r.subject === player), first = results[0] || {};
  if (P.npc && P.npcMotion) {
    const mo = P.npcMotion, me = P.motion, at = P.collide(new V3(-6, 0, 2), 3.6), to = P.collide(new V3(7, 0, 4), 3.4);
    mo.warp(at, Math.atan2(to.x - at.x, to.z - at.z)); me.warp(to, Math.atan2(at.x - to.x, at.z - to.z));
    if (mine) P.setDress({ skirt: 'down', drawers: 'up', marks: mine.marks });
    P.rig.setExpr(first.stopped ? 'shy' : 'crying'); P.npc.setExpr(first.stopped ? 'shy' : 'calm');
    P.talk.settle(['red', P.talk.cast.mother ? 'mother' : Object.keys(P.talk.cast).find(k => k !== 'red')]);
  }
  for (let i = 0; i < 90; i++) P.frame(1 / 60);      // (a moment passes in the dark: they've turned to each other, and hair has settled after the move)
  await wait(0.3);
  await fade(false);
  return Object.assign({}, first, { turns: results });
}

root.Correction = { run, ui, figure, toCorner };
})(typeof window !== 'undefined' ? window : globalThis);
