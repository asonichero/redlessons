// Little Red’s Lessons — a correction, played where the story is (in the scene's own stage, as Climbing Toward Consequence plays its corrections in the
// game rather than on a page of their own): under a fade the cottage's chair is set at the middle of the room and the lap scene (js/lap.js,
// embedded) is put in it; her mother works through the tier (js/discipline.js), her lines in the conversation box over the smacks, her portrait
// beside them; then under another fade the room comes back, Rose standing before her, the marks still on her.
//
// The player has the camera (the round button, or C, steps round the angles; a drag looks about) and her name: the octagon, ROSE (or R). Said
// at any point, everything stops at once, and her mother's closing words are the gentle ones, to Rose.
//
//   const r = await Correction.run(play, { tier: 'light', fade: (on, text) => … })   →   Discipline.run's result: { hits, peak, rose, tooHarsh, done }
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
    '<button id="corrRose" title="Her name: it stops at once (R)" aria-label="Rose: stop"><span>ROSE</span></button>';
  document.body.appendChild(uiEl);
  const hint = document.createElement('div'); hint.id = 'corrHint'; hint.textContent = 'Her name stops it, at any moment: the sign, or R.'; document.body.appendChild(hint);
  return uiEl;
}

// Her mother's face for each kind of line (see js/discipline.js).
const FACES = { start: 'stern', stage: 'stern', during: ['calm', 'stern'], done: 'calm', after: 'smile', rose: 'shy', harsh: 'surprised' };
const ANGLES = ['side', 'behind', 'face', 'top'];

async function run(P, o) {
  o = o || {};
  const st = P.stage, talk = P.talk, fade = o.fade || (async () => {}), wait = s => P.wait(s), A = root.GameAudio;
  const el = ui(), hint = document.getElementById('corrHint');
  await fade(true);
  // (the two of them as they walk about, put aside; the lap scene in their place, at the middle of the room)
  const lap = root.Correction.current = root.Lap.create(null, { external: { scene: st.scene }, looks: root.Looks ? root.Looks.load() : undefined });      // (current: for a look in from outside)
  const walkers = [P.rig.root, P.npc.root]; walkers.forEach(r => { r.visible = false; });
  const untick = P.tick(dt => lap.update(dt));
  const motherRig = talk.cast.mother.rig; talk.cast.mother.rig = lap.gerda;
  document.body.classList.add('correcting');
  let angle = 0;
  const view = (name, ms) => { const v = lap.VIEWS[name](); st.go(v.pos, v.look, ms); };
  view(ANGLES[angle], 0);
  const camBtn = el.querySelector('#corrCam'), roseBtn = el.querySelector('#corrRose');
  const next = () => { angle = (angle + 1) % ANGLES.length; view(ANGLES[angle], 700); };
  const rose = () => { if (!lap.st.ended) lap.rose(); };
  camBtn.onclick = e => { e.stopPropagation(); next(); };
  roseBtn.onclick = e => { e.stopPropagation(); if (A && A.init) A.init(); rose(); };
  const keys = e => { if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return; if (e.code === 'KeyR') rose(); if (e.code === 'KeyC') next(); };
  addEventListener('keydown', keys);
  await wait(0.3); await fade(false);
  el.classList.add('on'); hint.classList.add('on'); setTimeout(() => hint.classList.remove('on'), 7000);
  let r;
  try {
    r = await root.Discipline.run(lap, o.tier || 'light', {
      say: (text, kind, k) => { const f = FACES[kind]; talk.caption('mother', text, { face: Array.isArray(f) ? f[(k || 0) % f.length] : f, wait }); },
      sleep: ms => wait(ms / 1000),
    });
    await wait(r.rose || r.tooHarsh ? 4.5 : 3.5);
  } finally {
    el.classList.remove('on'); hint.classList.remove('on'); removeEventListener('keydown', keys);
    await fade(true);
    talk.captionOff(); untick(); lap.end(); st.scene.remove(lap.stage);
    talk.cast.mother.rig = motherRig; walkers.forEach(r => { r.visible = true; });
    document.body.classList.remove('correcting');
  }
  // The room again: Rose on her feet before her mother, beside the chair, the marks under her skirt.
  const mo = P.npcMotion, me = P.motion, at = P.collide(new V3(-6, 0, 2), 3.6), to = P.collide(new V3(7, 0, 4), 3.4);
  mo.warp(at, Math.atan2(to.x - at.x, to.z - at.z)); me.warp(to, Math.atan2(at.x - to.x, at.z - to.z));
  P.setDress({ skirt: 'down', drawers: 'up', marks: Object.assign({}, lap.st.marks) });
  P.rig.setExpr(r.rose ? 'shy' : 'crying'); P.npc.setExpr(r.rose ? 'shy' : 'calm');
  P.talk.settle(['red', 'mother']);
  for (let i = 0; i < 90; i++) P.frame(1 / 60);      // (a moment passes in the dark: they've turned to each other, and her hair has settled after the move)
  await wait(0.3);
  await fade(false);
  return r;
}

root.Correction = { run, ui };
})(typeof window !== 'undefined' ? window : globalThis);
