// Little Red’s Lessons — conversations, played the way Mika and the Witch's Mountain plays them: the camera settles on a view that shows both of them, and the
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
.talk { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); width: min(820px, calc(100vw - 24px)); display: none; z-index: 20;
  font: 17px/1.4 Georgia, 'Times New Roman', serif; color: #2e2018; user-select: none; -webkit-user-select: none; }
.talk.on { display: block; }
/* (one line high, growing as the words need; translucent, so the scene shows through) */
.talk .box { position: relative; background: rgba(246,236,216,.8); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); border: 2px solid rgba(107,74,50,.85);
  border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,.25); padding: 9px 18px; box-sizing: border-box; }
.talk.left .box { padding-left: 112px; } .talk.right .box { padding-right: 112px; }
.talk .frame { position: absolute; bottom: 4px; width: 92px; height: 100px; border: 2px solid rgba(107,74,50,.9); border-radius: 12px; background: transparent; display: none; overflow: hidden; }      /* (the portrait is drawn into it) */
.talk.left .frame { left: 8px; display: block; } .talk.right .frame { right: 8px; display: block; }
.talk .name { position: absolute; top: -14px; padding: 0 12px; background: var(--tint, #8a5a3a); color: #fff8ec; border: 2px solid rgba(107,74,50,.9); border-radius: 8px;
  font: bold 14px/1.5 Georgia, serif; letter-spacing: .02em; display: none; }
.talk.left .name { left: 112px; display: block; } .talk.right .name { right: 112px; display: block; }
.talk .text { min-height: 1.4em; white-space: pre-wrap; }
.talk.narr .text { font-style: italic; color: #4a3a2c; text-align: center; }
.talk.muse .text { font-style: italic; color: #4a3a2c; } .talk.muse .more { display: none; } .talk.muse { pointer-events: none; width: min(560px, calc(100vw - 24px)); font-size: 15px; }
.talk .more { position: absolute; right: 10px; bottom: 2px; font-size: 11px; color: #8a6a50; animation: talkBob 1s ease-in-out infinite; }
.talk.right .more { right: 112px; }
@keyframes talkBob { 50% { transform: translateY(2px); } }
.talk .choices { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.talk .choices:empty { display: none; }
.talk .choices button { text-align: left; font: 16px/1.3 Georgia, serif; color: #2e2018; background: rgba(255,250,240,.9); border: 2px solid #b08a68; border-radius: 9px;
  padding: 6px 12px; cursor: pointer; }
.talk .choices button:hover, .talk .choices button:focus { background: #f1dcc0; border-color: #6b4a32; outline: none; }
.talk .choices button b { color: #8a5a3a; margin-right: 8px; }
@media (max-width: 640px) {
  .talk { font-size: 15px; bottom: 8px; width: calc(100vw - 16px); } .talk .box { padding: 7px 12px; }
  .talk.left .box { padding-left: 76px; } .talk.right .box { padding-right: 76px; }
  .talk .frame { width: 60px; height: 66px; } .talk.left .name { left: 76px; } .talk.right .name { right: 76px; } .talk.right .more { right: 76px; }
  .talk .name { font-size: 12px; top: -12px; } .talk.muse { font-size: 14px; } .talk .choices button { font-size: 14px; padding: 5px 10px; }
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
  const pctx = pcan.getContext('2d'), big = document.createElement('canvas'), bctx = big.getContext('2d'), prt = new THREE.WebGLRenderTarget(4, 4); prt.texture.encoding = THREE.sRGBEncoding;
  // (her own light, the same wherever she is: a soft sky and a warm key from above and to the front, as a painter would set it; the scene's own
  // lights, its fog and its shadows are put aside while she's drawn)
  const srgb = h => new THREE.Color(h).convertSRGBToLinear();
  const pHemi = new THREE.HemisphereLight(srgb('#fff6ea'), srgb('#8a6a58'), 0.5), pKey = new THREE.DirectionalLight(srgb('#fff0dc'), 0.56), pFill = new THREE.DirectionalLight(srgb('#e4eaff'), 0.12);
  const plights = [pHemi, pKey, pKey.target, pFill, pFill.target];
  let portrait = null, pbuf = null, pimg = null;      // (portrait: { who } while a line with a speaker is up)
  function drawPortrait(renderer, scene) {
    if (!portrait || !el.classList.contains('on')) return;
    const c = cast[portrait.who]; if (!c || !c.rig) return;
    // (drawn at twice the size and scaled down, so the fine lines of her face — lashes, brows, the set of the mouth — read as they do close to)
    const dpr = Math.min(2, root.devicePixelRatio || 1), cw = Math.max(2, Math.round(frame.clientWidth * dpr)), ch = Math.max(2, Math.round(frame.clientHeight * dpr));
    const ss = dpr >= 2 ? 1.5 : 2, w = Math.round(cw * ss), h = Math.round(ch * ss);
    if (prt.width !== w || prt.height !== h) { prt.setSize(w, h); big.width = w; big.height = h; pbuf = new Uint8Array(w * h * 4); pimg = bctx.createImageData(w, h); }
    if (pcan.width !== cw || pcan.height !== ch) { pcan.width = cw; pcan.height = ch; }
    // (in front of her face, a little to her side, looking at it)
    const rig = c.rig, head = rig.headGroup.getWorldPosition(new V3()), q = rig.neck.getWorldQuaternion(new THREE.Quaternion());
    const fwd = new V3(0, 0, 1).applyQuaternion(q).setY(0).normalize(), side = new V3(fwd.z, 0, -fwd.x), sc = rig.scaleW, sd = c.side === 'right' ? -1 : 1;
    const at = head.clone().add(new V3(0, -1.2 * sc, 0));
    pcam.aspect = w / h; pcam.updateProjectionMatrix();
    pcam.position.copy(at).addScaledVector(fwd, 26 * sc).addScaledVector(side, sd * 7 * sc).add(new V3(0, 1.5 * sc, 0)); pcam.lookAt(at);
    pKey.position.copy(at).addScaledVector(fwd, 30).addScaledVector(side, sd * 22).add(new V3(0, 34, 0)); pKey.target.position.copy(at);
    pFill.position.copy(at).addScaledVector(fwd, 20).addScaledVector(side, -sd * 26).add(new V3(0, 6, 0)); pFill.target.position.copy(at);
    // (everything but her hidden, her own colour behind her)
    const hidden = []; for (const o of scene.children) if (o !== rig.root && o.visible) { o.visible = false; hidden.push(o); }
    for (const l of plights) scene.add(l);
    const bg = scene.background, fog = scene.fog, sAuto = renderer.shadowMap.autoUpdate, rt0 = renderer.getRenderTarget();
    scene.background = new THREE.Color(c.bg || '#e8d6b8').convertSRGBToLinear(); scene.fog = null; renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(prt); renderer.clear(); renderer.render(scene, pcam); renderer.setRenderTarget(rt0);
    for (const l of plights) scene.remove(l);
    for (const o of hidden) o.visible = true; scene.background = bg; scene.fog = fog; renderer.shadowMap.autoUpdate = sAuto;
    renderer.readRenderTargetPixels(prt, 0, 0, w, h, pbuf);
    const d = pimg.data, row = w * 4; for (let y = 0; y < h; y++) d.set(pbuf.subarray((h - 1 - y) * row, (h - y) * row), y * row);      // (flipped: its rows run up)
    bctx.putImageData(pimg, 0, 0); pctx.imageSmoothingEnabled = true; pctx.imageSmoothingQuality = 'high'; pctx.drawImage(big, 0, 0, cw, ch);
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
    if (opts.turn && heads.length > 1) names.forEach((nm, k) => { const to = heads[1 - k].clone().sub(heads[k]).setY(0).normalize().lerp(n, 0.6).normalize(); opts.turn(nm, Math.atan2(to.x, to.z)); });
    // (and each looks at the other's face, turned a little toward us, so that even sitting square to one another their faces read from here)
    if (opts.look && rigs.length > 1) names.forEach((nm, k) => { const other = rigs[1 - k]; looking.add(nm);
      // (a little: a quarter of the way between them, sideways toward us, which turns the head some fifteen degrees, never round over a shoulder)
      opts.look(nm, () => { const me = rigs[k].headGroup.getWorldPosition(new V3()), h = other.headGroup.getWorldPosition(new V3()), gap = h.distanceTo(me);
        const toCam = pos.clone().sub(h).setY(0), along = h.clone().sub(me).setY(0).normalize(); toCam.addScaledVector(along, -toCam.dot(along));
        return toCam.lengthSq() > 1e-6 ? h.addScaledVector(toCam.normalize(), 0.25 * gap) : h; }); });
  }
  const looking = new Set();
  function unlook() { if (opts.look) for (const nm of looking) opts.look(nm, null); looking.clear(); }

  // ── Faces: a line sets the speaker's (and the listeners'); a look stays after the words have gone, as it would, and only eases back to her
  // resting face a good while later, if nothing has changed it since. ──
  const rest = {};
  function face(who, name) { const c = cast[who]; if (!c || !c.rig.setExpr || !name) return; clearTimeout(rest[who]); c.rig.setExpr(name); }
  function relax(who, ms) {
    const c = cast[who]; if (!c || !c.rig.setExpr) return; clearTimeout(rest[who]); const was = c.rig.expr;
    rest[who] = setTimeout(() => { if (c.rig.expr === was && !playing) c.rig.setExpr('calm'); }, ms);
  }

  // ── Lines ──
  let typing = null, waiting = null, voice = null;
  const CPS = () => 42 * ((root.Hud && Hud.settings.text) || 1);      // (letters a second; the settings can quicken or slow it)
  let autoT = null;
  function show(line) {
    const c = speaker(line.who);
    if (c) face(line.who, line.face);
    if (line.listen) for (const k in line.listen) face(k, line.listen[k]);
    const text = line.text, cps = CPS(), secs = Math.max(0.4, text.length / cps);
    if (voice) voice.stop(); voice = c && A && A.speak ? A.speak(c.voice || line.who, text, secs * 0.92) : null;
    return new Promise(res => {
      let i = 0; const t0 = performance.now();
      typing = { done: () => { i = text.length; textEl.textContent = text; typing = null; moreEl.style.visibility = 'visible'; waiting = res; if (voice) { voice.stop(); voice = null; }
        // (if the settings say so, the line goes on by itself once it's had time to be read)
        if (root.Hud && Hud.settings.auto) { clearTimeout(autoT); const go = () => { if (waiting !== res) return; if (document.querySelector('.hScreen.on')) { autoT = setTimeout(go, 500); return; } next(); };      // (not while a menu's up)
          autoT = setTimeout(go, Math.max(1400, text.length * 55)); } } };
      const step = () => { if (!typing) return; i = Math.min(text.length, Math.floor((performance.now() - t0) / 1000 * cps)); textEl.textContent = text.slice(0, i); if (i >= text.length) typing.done(); else requestAnimationFrame(step); };
      textEl.textContent = ''; requestAnimationFrame(step);
    });
  }
  // (the box set for whoever's speaking: her side, her name, her portrait; or for narration)
  function speaker(who) {
    const c = who ? cast[who] : null;
    el.classList.add('on'); el.classList.toggle('narr', !c); el.classList.toggle('left', !!c && c.side !== 'right'); el.classList.toggle('right', !!c && c.side === 'right');
    el.style.setProperty('--tint', c ? (c.tint || '#8a5a3a') : '#8a5a3a'); el.style.setProperty('--bg', c ? (c.bg || '#e8d6b8') : '#e8d6b8');
    nameEl.textContent = c ? c.name : ''; choicesEl.innerHTML = ''; moreEl.style.visibility = 'hidden';
    portrait = c ? { who } : null;
    return c;
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
    o = o || {}; playing = true; el.classList.remove('muse'); const picks = []; document.body.classList.add('talking');      // (a page can hide its own controls meanwhile)
    saved = { pos: stage.camera.position.clone(), look: stage.controls.target.clone(), enabled: stage.controls.enabled };
    stage.controls.enabled = false;
    settle(o.shot || Object.keys(cast));
    const runList = async list => {
      for (const line of list) {
        if (line.run) { el.classList.remove('on'); portrait = null; unlook(); await line.run(); continue; }      // (the box steps aside while things happen)
        if (line.shot) { settle(line.shot); continue; }
        if (line.choose) {
          if (line.text) await show(line); else { speaker(line.who || (cast.red ? 'red' : null)); textEl.textContent = ''; }      // (a choice on its own is hers to make: her portrait)
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
      for (const k in cast) relax(k, o.hold || 9000); unlook();
      if (o.keepCamera) stage.controls.enabled = saved.enabled; else { stage.go(saved.pos, saved.look, 900); setTimeout(() => { stage.controls.enabled = saved.enabled; }, 950); }
    }
    return picks;
  }
  // Thoughts, as she walks: her portrait and her words in the box, in italics, without stopping her or moving the camera; each stays long enough
  // to read and goes. They queue. (A conversation coming on clears them.)
  let museQ = Promise.resolve(), museN = 0;
  function muse(text, o) {
    o = o || {}; const n = ++museN, asked = performance.now();
    museQ = museQ.then(() => new Promise(res => {
      if (playing || (o.fresh !== false && performance.now() - asked > 9000)) return res();      // (a thought that's waited too long has passed)
      const c = cast[o.who || 'red'];
      el.classList.add('on', 'muse'); el.classList.remove('narr'); el.classList.toggle('left', c.side !== 'right'); el.classList.toggle('right', c.side === 'right');
      el.style.setProperty('--tint', c.tint || '#8a5a3a'); nameEl.textContent = c.name; choicesEl.innerHTML = ''; moreEl.style.visibility = 'hidden';
      portrait = { who: o.who || 'red' }; face(o.who || 'red', o.face);
      textEl.textContent = text;
      setTimeout(() => { if (!playing) { el.classList.remove('on', 'muse'); portrait = null; if (o.face) relax(o.who || 'red', 7000); } res(); }, o.ms || 1500 + text.length * 45);
    }));
    return museQ.then(() => n);
  }
  // (done with: its box, its keys)
  function destroy() { root.removeEventListener('keydown', keys, true); el.remove(); clearTimeout(autoT); for (const k in rest) clearTimeout(rest[k]); if (voice) voice.stop(); if (playing) document.body.classList.remove('talking'); playing = false; }
  return { play, settle, next, muse, face, relax, destroy, get playing() { return playing; }, el, cast };
}

root.Talk = { create };
})(typeof window !== 'undefined' ? window : globalThis);
