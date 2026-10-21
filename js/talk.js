// Red Lessons — conversations, played the way Mika and the Witch's Mountain plays them: the camera settles on a view that shows both of them, and the
// lines come up in a box at the foot of the screen, a portrait of whoever is speaking beside it (her face, live, close up, with the expression
// the line asks for), a name on a tab, the words typed out as they're said (and babbled, in that voice). Click, Space, Enter or E: finish the
// line, then the next. Choices come up as buttons (or 1, 2, 3).
//
//   const talk = Talk.create(stage, { cast: { red: { rig, name: 'Red', side: 'left', voice: 'red', tint: '#…' (name tab), bg: '#…' (portrait) }, mother: { … } } })
//   await talk.play([
//     { who: 'mother', face: 'stern', text: 'There you are.' },              // a line (face: one of js/toon.js's expressions)
//     { text: 'The fire cracks.' },                                            // narration: no portrait, no name
//     { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: '…' },    // (listen: how the others look while it's said)
//     { choose: [{ text: 'It’s nothing.', then: [ … ] }, { text: '…', then: [ … ] }] },     // a choice; its lines, then on
//     { run: async () => { … } },                                             // anything else, in order
//   ])                                                                          → the choices made, in order
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

const CSS = `
.talk { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); width: min(900px, calc(100vw - 32px)); display: none; z-index: 20;
  font: 18px/1.5 Georgia, 'Times New Roman', serif; color: #3a2a20; user-select: none; -webkit-user-select: none; }
.talk.on { display: block; }
.talk .box { position: relative; min-height: 132px; background: #f6ecd8; border: 3px solid #6b4a32; border-radius: 16px; box-shadow: 0 6px 24px rgba(0,0,0,.35);
  padding: 18px 24px 18px 24px; box-sizing: border-box; }
.talk.left .box { padding-left: 196px; } .talk.right .box { padding-right: 196px; }
.talk .frame { position: absolute; bottom: 10px; width: 160px; height: 176px; border: 3px solid #6b4a32; border-radius: 14px; background: transparent; display: none; }      /* (the portrait is drawn on the canvas under it) */
.talk.left .frame { left: 12px; display: block; } .talk.right .frame { right: 12px; display: block; }
.talk .name { position: absolute; top: -18px; padding: 2px 16px; background: var(--tint, #8a5a3a); color: #fff8ec; border: 3px solid #6b4a32; border-radius: 10px;
  font: bold 16px/1.4 Georgia, serif; letter-spacing: .02em; display: none; }
.talk.left .name { left: 200px; display: block; } .talk.right .name { right: 200px; display: block; }
.talk .text { min-height: 3em; white-space: pre-wrap; }
.talk.narr .text { font-style: italic; color: #5a4636; text-align: center; }
.talk .more { position: absolute; right: 18px; bottom: 8px; font-size: 14px; color: #8a6a50; animation: talkBob 1s ease-in-out infinite; }
.talk.right .more { right: 200px; }
@keyframes talkBob { 50% { transform: translateY(3px); } }
.talk .choices { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.talk .choices button { text-align: left; font: 17px/1.35 Georgia, serif; color: #3a2a20; background: #fffaf0; border: 2px solid #b08a68; border-radius: 10px;
  padding: 8px 14px; cursor: pointer; }
.talk .choices button:hover, .talk .choices button:focus { background: #f1dcc0; border-color: #6b4a32; outline: none; }
.talk .choices button b { color: #8a5a3a; margin-right: 8px; }
@media (max-width: 640px) {
  .talk { font-size: 16px; bottom: 10px; } .talk .box { min-height: 112px; padding: 14px 16px; }
  .talk.left .box { padding-left: 128px; } .talk.right .box { padding-right: 128px; }
  .talk .frame { width: 104px; height: 116px; } .talk.left .name { left: 132px; } .talk.right .name { right: 132px; } .talk.right .more { right: 132px; }
}`;

function create(stage, opts) {
  opts = opts || {};
  const cast = opts.cast || {};
  if (!document.getElementById('talk-css')) { const st = document.createElement('style'); st.id = 'talk-css'; st.textContent = CSS; document.head.appendChild(st); }
  const el = document.createElement('div'); el.className = 'talk';
  el.innerHTML = '<div class="box"><div class="frame"></div><div class="name"></div><div class="text"></div><div class="choices"></div><div class="more">▼</div></div>';
  document.body.appendChild(el);
  const $ = s => el.querySelector(s), frame = $('.frame'), nameEl = $('.name'), textEl = $('.text'), choicesEl = $('.choices'), moreEl = $('.more');
  const A = root.GameAudio;

  // ── The portrait: the speaker's face, close up, on her own colour, drawn after the scene each frame into a small target and copied into a
  // canvas in the frame (so it sits in the box, over it, like the rest of the box). ──
  const pcam = new THREE.PerspectiveCamera(20, 1, 0.5, 200), pcan = document.createElement('canvas'); frame.appendChild(pcan);
  pcan.style.cssText = 'width:100%;height:100%;display:block;border-radius:11px';
  const pctx = pcan.getContext('2d'), prt = new THREE.WebGLRenderTarget(4, 4); prt.texture.encoding = THREE.sRGBEncoding;
  let portrait = null, pbuf = null, pimg = null;      // (portrait: { who } while a line with a speaker is up)
  function drawPortrait(renderer, scene) {
    if (!portrait || !el.classList.contains('on')) return;
    const c = cast[portrait.who]; if (!c || !c.rig) return;
    const dpr = Math.min(2, root.devicePixelRatio || 1), w = Math.max(2, Math.round(frame.clientWidth * dpr)), h = Math.max(2, Math.round(frame.clientHeight * dpr));
    if (prt.width !== w || prt.height !== h) { prt.setSize(w, h); pcan.width = w; pcan.height = h; pbuf = new Uint8Array(w * h * 4); pimg = pctx.createImageData(w, h); }
    // (in front of her face, a little to her side, looking at it)
    const rig = c.rig, head = rig.headGroup.getWorldPosition(new V3()), q = rig.neck.getWorldQuaternion(new THREE.Quaternion());
    const fwd = new V3(0, 0, 1).applyQuaternion(q).setY(0).normalize(), side = new V3(fwd.z, 0, -fwd.x), sc = rig.scaleW;
    const at = head.clone().add(new V3(0, -1.2 * sc, 0));
    pcam.aspect = w / h; pcam.updateProjectionMatrix();
    pcam.position.copy(at).addScaledVector(fwd, 26 * sc).addScaledVector(side, (c.side === 'right' ? -1 : 1) * 7 * sc).add(new V3(0, 1.5 * sc, 0)); pcam.lookAt(at);
    // (everything but her hidden, her own colour behind her)
    const hidden = []; for (const o of scene.children) if (o !== rig.root && !o.isLight && o.visible) { o.visible = false; hidden.push(o); }
    const bg = scene.background, sAuto = renderer.shadowMap.autoUpdate, rt0 = renderer.getRenderTarget();
    scene.background = new THREE.Color(c.bg || '#e8d6b8').convertSRGBToLinear(); renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(prt); renderer.clear(); renderer.render(scene, pcam); renderer.setRenderTarget(rt0);
    for (const o of hidden) o.visible = true; scene.background = bg; renderer.shadowMap.autoUpdate = sAuto;
    renderer.readRenderTargetPixels(prt, 0, 0, w, h, pbuf);
    const d = pimg.data, row = w * 4; for (let y = 0; y < h; y++) d.set(pbuf.subarray((h - 1 - y) * row, (h - y) * row), y * row);      // (flipped: its rows run up)
    pctx.putImageData(pimg, 0, 0);
  }
  (stage.overlays || (stage.overlays = [])).push(drawPortrait);

  // ── The camera: side on to the two of them, far enough back to hold both, a little above, their heads in the upper part of the view (the
  // box covers the lower). It eases there, and back to where it was after. ──
  let saved = null;
  function settle(names) {
    const rigs = names.map(n => cast[n] && cast[n].rig).filter(Boolean); if (!rigs.length) return;
    const heads = rigs.map(r => r.headGroup.getWorldPosition(new V3())), mid = heads.reduce((a, b) => a.add(b), new V3()).divideScalar(heads.length);
    const sc = rigs[0].scaleW, cam = stage.camera;
    let across = heads.length > 1 ? heads[1].clone().sub(heads[0]).setY(0) : new V3(1, 0, 0); const sep = Math.max(across.length(), 6 * sc); across.normalize();
    let n = new V3(-across.z, 0, across.x); if (n.dot(cam.position.clone().sub(mid).setY(0)) < 0) n.negate();      // (from the side the camera's already on)
    // (far enough to hold the two of them across, with room either side, and from their heads to their waists in the part above the box)
    const tv = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), th = tv * cam.aspect;
    const dist = Math.max((sep / 2 + 10 * sc) / th, 15 * sc / tv);
    const look = mid.clone().add(new V3(0, -6 * sc, 0)), pos = mid.clone().addScaledVector(n, dist).add(new V3(0, 2 * sc, 0));
    if (opts.clamp) opts.clamp(pos);
    stage.go(pos, look, 900);
    // (each turns to the other, opened a little toward the camera, as on a stage, so both faces read)
    if (opts.turn && heads.length > 1) names.forEach((nm, k) => { const to = heads[1 - k].clone().sub(heads[k]).setY(0).normalize().lerp(n, 0.45).normalize(); opts.turn(nm, Math.atan2(to.x, to.z)); });
  }

  // ── Lines ──
  let typing = null, waiting = null, voice = null;
  const CPS = 42;      // (letters a second)
  function show(line) {
    const c = line.who ? cast[line.who] : null;
    el.classList.add('on'); el.classList.toggle('narr', !c); el.classList.toggle('left', !!c && c.side !== 'right'); el.classList.toggle('right', !!c && c.side === 'right');
    el.style.setProperty('--tint', c ? (c.tint || '#8a5a3a') : '#8a5a3a'); el.style.setProperty('--bg', c ? (c.bg || '#e8d6b8') : '#e8d6b8');
    nameEl.textContent = c ? c.name : ''; choicesEl.innerHTML = ''; moreEl.style.visibility = 'hidden';
    portrait = c ? { who: line.who } : null;
    if (c && line.face && c.rig.setExpr) c.rig.setExpr(line.face);
    if (line.listen) for (const k in line.listen) if (cast[k] && cast[k].rig.setExpr) cast[k].rig.setExpr(line.listen[k]);
    const text = line.text, secs = Math.max(0.4, text.length / CPS);
    if (voice) voice.stop(); voice = c && A && A.speak ? A.speak(c.voice || line.who, text, secs * 0.92) : null;
    return new Promise(res => {
      let i = 0; const t0 = performance.now();
      typing = { done: () => { i = text.length; textEl.textContent = text; typing = null; moreEl.style.visibility = 'visible'; waiting = res; if (voice) { voice.stop(); voice = null; } } };
      const step = () => { if (!typing) return; i = Math.min(text.length, Math.floor((performance.now() - t0) / 1000 * CPS)); textEl.textContent = text.slice(0, i); if (i >= text.length) typing.done(); else requestAnimationFrame(step); };
      textEl.textContent = ''; requestAnimationFrame(step);
    });
  }
  function choose(list) {
    moreEl.style.visibility = 'hidden';
    return new Promise(res => {
      choicesEl.innerHTML = '';
      list.forEach((ch, k) => { const b = document.createElement('button'); b.innerHTML = `<b>${k + 1}</b>`; b.appendChild(document.createTextNode(ch.text)); b.onclick = e => { e.stopPropagation(); pick(k); }; choicesEl.appendChild(b); });
      const pick = k => { picking = null; choicesEl.innerHTML = ''; res(k); };
      picking = pick;
    });
  }
  let picking = null;
  // Advance: finish the line being typed, or go on.
  function next() { if (A && A.init) A.init(); if (picking) return; if (typing) { typing.done(); return; } if (waiting) { const w = waiting; waiting = null; w(); } }
  el.addEventListener('click', next);
  const keys = e => {
    if (!el.classList.contains('on')) return;
    if (picking && /^Digit[1-9]$/.test(e.code)) { const k = +e.code.slice(5) - 1; if (k < choicesEl.children.length) picking(k); e.preventDefault(); return; }
    if (['Space', 'Enter', 'KeyE'].includes(e.code)) { next(); e.preventDefault(); e.stopImmediatePropagation(); }
  };
  root.addEventListener('keydown', keys, true);

  let playing = false;
  async function play(script, o) {
    o = o || {}; playing = true; const picks = []; document.body.classList.add('talking');      // (a page can hide its own controls meanwhile)
    saved = { pos: stage.camera.position.clone(), look: stage.controls.target.clone(), enabled: stage.controls.enabled };
    stage.controls.enabled = false;
    settle(o.shot || Object.keys(cast));
    const runList = async list => {
      for (const line of list) {
        if (line.run) { await line.run(); continue; }
        if (line.shot) { settle(line.shot); continue; }
        if (line.choose) {
          if (line.text || line.who) await show(line); else { el.classList.add('on'); textEl.textContent = ''; }
          const k = await choose(line.choose); picks.push(k);
          if (line.choose[k].then) await runList(line.choose[k].then);
          continue;
        }
        await show(line);
      }
    };
    try { await runList(script); }
    finally {
      el.classList.remove('on'); portrait = null; playing = false; document.body.classList.remove('talking'); if (voice) { voice.stop(); voice = null; }
      for (const k in cast) if (cast[k].rig.setExpr) cast[k].rig.setExpr('calm');
      if (o.keepCamera) stage.controls.enabled = saved.enabled; else { stage.go(saved.pos, saved.look, 900); setTimeout(() => { stage.controls.enabled = saved.enabled; }, 950); }
    }
    return picks;
  }
  return { play, settle, next, get playing() { return playing; }, el, cast };
}

root.Talk = { create };
})(typeof window !== 'undefined' ? window : globalThis);
