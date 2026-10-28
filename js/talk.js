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
//     { who: 'red', face: 'calm', thought: true, cue: () => …, text: '…' },  // (thought: unspoken, in italics, unvoiced; cue: run as it comes up)
//     { choose: [{ text: 'It’s nothing.', then: [ … ] }, { text: '…', then: [ … ] }] },     // a choice; its lines, then on
//     { run: async () => { … } },                                             // anything else, in order
//   ])                                                                          → the choices made, in order
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3, UP = new V3(0, 1, 0);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

const CSS = `
.talk { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); width: min(1180px, calc(100vw - 32px)); display: none; z-index: 20;      /* (across the window, up to a width: centred, with room either side, on a wide screen) */
  font: clamp(19px, 1.6vw + 6px, 27px)/1.42 Georgia, 'Times New Roman', serif; color: #2e2018; user-select: none; -webkit-user-select: none; }
.talk.on { display: block; }
/* (one line high, growing as the words need; translucent, so the scene shows through) */
.talk .box { position: relative; background: rgba(246,236,216,.8); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); border: 2px solid rgba(107,74,50,.85);
  border-radius: 18px; box-shadow: 0 6px 22px rgba(0,0,0,.3); padding: 16px 26px 18px; box-sizing: border-box; min-height: 104px; }
.talk.left .box { padding-left: 156px; } .talk.right .box { padding-right: 156px; }
.talk .frame { position: absolute; bottom: 6px; width: 132px; height: 144px; border: 2px solid rgba(107,74,50,.9); border-radius: 12px; background: transparent; display: none; overflow: hidden; }      /* (the portrait is drawn into it) */
.talk.left .frame { left: 10px; display: block; } .talk.right .frame { right: 10px; display: block; }
.talk .name { position: absolute; top: -18px; padding: 1px 14px; background: var(--tint, #8a5a3a); color: #fff8ec; border: 2px solid rgba(107,74,50,.9); border-radius: 8px;
  font: bold clamp(15px, 0.8vw + 8px, 19px)/1.5 Georgia, serif; letter-spacing: .02em; display: none; }
.talk.left .name { left: 156px; display: block; } .talk.right .name { right: 156px; display: block; }
.talk .text { min-height: 1.4em; white-space: pre-wrap; }
.talk.narr .text { font-style: italic; color: #4a3a2c; text-align: center; }
.talk.muse .text, .talk.thought .text { font-style: italic; color: #4a3a2c; } .talk.muse .more, .talk.cap .more { display: none; } .talk.cap { pointer-events: none; } .talk.muse { pointer-events: none; width: min(1000px, calc(100vw - 32px)); font-size: clamp(17px, 1.2vw + 6px, 23px); }
.talk .more { position: absolute; right: 14px; bottom: 4px; font-size: 14px; color: #8a6a50; animation: talkBob 1s ease-in-out infinite; }
.talk.right .more { right: 156px; }
@keyframes talkBob { 50% { transform: translateY(2px); } }
.talk .choices { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.talk .choices:empty { display: none; }
.talk .choices button { text-align: left; font: clamp(17px, 1.3vw + 6px, 24px)/1.3 Georgia, serif; color: #2e2018; background: rgba(255,250,240,.9); border: 2px solid #b08a68; border-radius: 9px;
  padding: 6px 12px; cursor: pointer; }
.talk .choices button:hover, .talk .choices button:focus { background: #f1dcc0; border-color: #6b4a32; outline: none; }
.talk .choices button b { color: #8a5a3a; margin-right: 8px; }
@media (max-width: 640px) {
  .talk { font-size: 17px; bottom: 8px; width: calc(100vw - 16px); } .talk.muse { width: calc(100vw - 16px); } .talk .box { padding: 10px 14px 12px; min-height: 84px; }
  .talk.left .box { padding-left: 92px; } .talk.right .box { padding-right: 92px; }
  .talk .frame { width: 76px; height: 84px; } .talk.left .name { left: 92px; } .talk.right .name { right: 92px; } .talk.right .more { right: 92px; }
  .talk .name { font-size: 14px; top: -14px; } .talk.muse { font-size: 16px; } .talk .choices button { font-size: 16px; padding: 6px 10px; }
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
    // (everything but her hidden, her own colour behind her: whatever isn't on the way down from the scene to her, wherever she stands in it)
    const chain = new Set(); for (let o = rig.root; o && o !== scene; o = o.parent) chain.add(o);
    const hidden = []; for (const o of [scene, ...chain]) if (o !== rig.root) for (const k of o.children) if (!chain.has(k) && k.visible) { k.visible = false; hidden.push(k); }
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
  let saved = null, giveBack = null;      // (giveBack: the camera's handing back after the last conversation, still to come)
  function settle(names, ms) {
    const rigs = names.map(n => cast[n] && cast[n].rig).filter(Boolean); if (!rigs.length) return;
    const heads = rigs.map(r => r.headGroup.getWorldPosition(new V3())), mid = heads.reduce((a, b) => a.add(b), new V3()).divideScalar(heads.length);
    const sc = rigs[0].scaleW, cam = stage.camera;
    let across = heads.length > 1 ? heads[1].clone().sub(heads[0]).setY(0) : new V3(1, 0, 0); const sep = Math.max(across.length(), 6 * sc); across.normalize();
    let n = new V3(-across.z, 0, across.x); if (n.dot(cam.position.clone().sub(mid).setY(0)) < 0) n.negate();      // (from the side the camera's already on)
    // (far enough to hold the two of them across, with room either side, and from their heads to their waists in the part above the box)
    const tv = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), th = tv * cam.aspect;
    const dist = Math.max((sep / 2 + 10 * sc) / th, 15 * sc / tv);
    let look = mid.clone().add(new V3(0, -6 * sc, 0)), pos = mid.clone().addScaledVector(n, dist).add(new V3(0, 2 * sc, 0));
    // With Red in it, the camera favours her: from the other's side (a little round toward them), so she faces it; but the two of them still
    // in the middle of the view, as far from its left edge as from its right. (The other's face is in their portrait, by the box.)
    const ri = names.indexOf('red');
    if (ri >= 0 && rigs.length > 1) {
      const R = heads[ri], O = heads[ri === 0 ? 1 : 0], toR = R.clone().sub(O).setY(0); if (toR.lengthSq() < 1e-6) toR.set(0, 0, 1); toR.normalize();
      const sideN = new V3(-toR.z, 0, toR.x); if (sideN.dot(cam.position.clone().sub(mid).setY(0)) < 0) sideN.negate();
      const A = 0.45, dir = sideN.clone().multiplyScalar(Math.cos(A)).addScaledVector(toR, -Math.sin(A)).normalize(), right = new V3().crossVectors(UP, dir).normalize();
      const half = Math.max(...heads.map(h => Math.abs(h.clone().sub(mid).dot(right)))) + 9 * sc, D = Math.max(half / th, 15 * sc / tv);
      look = mid.clone().add(new V3(0, -6 * sc, 0)); pos = mid.clone().addScaledVector(dir, D).add(new V3(0, 7 * sc, 0));      // (a little above them, looking down: over a table between them, not into its edge)
      // (centred as the camera sees them: the nearer looks bigger, so the middle between them on the screen is put in the middle of it)
      const c = cam.clone(); c.position.copy(pos); c.lookAt(look); c.updateMatrixWorld(true);
      const xm = heads.map(h => h.clone().project(c).x).reduce((a, b) => a + b, 0) / heads.length, shift = right.clone().multiplyScalar(-xm * th * D);
      look.add(shift); pos.add(shift);
      n = dir;
    }
    if (opts.clamp) {      // (kept out of whatever's solid: outdoors, the houses' walls; and if that would pull it in close, from the other side of them instead)
      const perp = new V3(-across.z, 0, across.x), mirror = p => { const v = p.clone().sub(mid); return mid.clone().add(v.addScaledVector(perp, -2 * v.dot(perp))); };
      const p1 = pos.clone(), l1 = look.clone(); opts.clamp(p1, l1); const d1 = p1.distanceTo(l1), d0 = pos.distanceTo(look);
      if (d1 < d0 * 0.85) { const p2 = mirror(pos), l2 = mirror(look); opts.clamp(p2, l2); if (p2.distanceTo(l2) > d1 + 1) { pos.copy(p2); look.copy(l2); n.copy(mirror(mid.clone().add(n)).sub(mid)); } else { pos.copy(p1); look.copy(l1); } }
      else { pos.copy(p1); look.copy(l1); }
    }
    stage.go(pos, look, ms == null ? 900 : ms);
    // (each turns to the other, opened a little toward the camera, as on a stage, so both faces read)
    if (opts.turn && heads.length > 1) names.forEach((nm, k) => { const to = heads[1 - k].clone().sub(heads[k]).setY(0).normalize().lerp(n, ri >= 0 ? 0.12 : 0.6).normalize(); opts.turn(nm, Math.atan2(to.x, to.z)); });      // (with Red, facing each other; otherwise opened toward us, as on a stage)
    // (and each looks at the other's face, turned a little toward us, so that even sitting square to one another their faces read from here)
    if (opts.look && rigs.length > 1) names.forEach((nm, k) => { const other = rigs[1 - k]; looking.add(nm);
      // (a little: a quarter of the way between them, sideways toward us, which turns the head some fifteen degrees, never round over a shoulder)
      opts.look(nm, () => { const me = rigs[k].headGroup.getWorldPosition(new V3()), h = other.headGroup.getWorldPosition(new V3()).add(new V3(0, -1.6 * other.scaleW, 0)), gap = h.distanceTo(me);      // (at the mouth: looking up at someone taller, she needn't tip her head right back)
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
    if (line.cue) line.cue();      // (anything to happen as it comes up)
    const c = speaker(line.who); el.classList.toggle('thought', !!line.thought);      // (thought: hers, unspoken, in italics: still a line to go on from)
    if (c) face(line.who, line.face);
    if (line.listen) for (const k in line.listen) face(k, line.listen[k]);
    const text = line.text, cps = CPS(), secs = Math.max(0.4, text.length / cps);
    if (voice) voice.stop(); voice = c && A && A.speak && !line.thought ? A.speak(c.voice || line.who, text, secs * 0.92) : null;      // (a thought isn't voiced)
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
  // (a click or tap anywhere goes on, not only on the box: anywhere but another button or link, which keep their own)
  root.document.addEventListener('click', e => { if (!el.classList.contains('on')) return; const t = e.target; if (!el.contains(t) && t.closest && t.closest('button, a, select, input, textarea')) return; next(); });
  const keys = e => {
    if (!el.classList.contains('on')) return;
    // (the number keys over the letters, or on the number pad; Enter either one)
    if (picking && /^(Digit|Numpad)[1-9]$/.test(e.code)) { const k = +e.code.slice(-1) - 1; if (k < choicesEl.children.length) picking(k); e.preventDefault(); return; }
    if (['Space', 'Enter', 'NumpadEnter', 'KeyE'].includes(e.code)) { next(); e.preventDefault(); e.stopImmediatePropagation(); }
  };
  root.addEventListener('keydown', keys, true);

  let playing = false;
  async function play(script, o) {
    o = o || {}; playing = true; el.classList.remove('muse'); const picks = []; document.body.classList.add('talking');      // (a page can hide its own controls meanwhile)
    // (if the last one's still handing the camera back, it's the player's: this one gives it back to them too, rather than keeping it held)
    const wasEnabled = giveBack ? (clearTimeout(giveBack), giveBack = null, true) : stage.controls.enabled;
    const mine = saved = { pos: stage.camera.position.clone(), look: stage.controls.target.clone(), enabled: wasEnabled };
    stage.controls.enabled = false;
    if (o.shot !== false) settle(o.shot || Object.keys(cast));      // (shot: false, the camera's left where the scene has put it)
    const runList = async list => {
      for (const line of list) {
        if (line.run) { el.classList.remove('on'); portrait = null; unlook(); await line.run(); continue; }      // (the box steps aside while things happen)
        if (line.shot) { settle(line.shot); continue; }
        if (line.choose) {
          if (line.text) await show(line); else { speaker(line.who || (cast.red ? 'red' : null)); textEl.textContent = ''; }      // (a choice on its own is hers to make: her portrait)
          const k = await choose(line.choose); picks.push(k);
          if (line.choose[k].face) face(line.who || 'red', line.choose[k].face);      // (a choice can set the chooser's face)
          if (line.choose[k].then) await runList(line.choose[k].then);
          continue;
        }
        await show(line);
      }
    };
    try { await runList(script); }
    finally {
      el.classList.remove('on', 'thought'); portrait = null; playing = false; document.body.classList.remove('talking'); if (voice) { voice.stop(); voice = null; }
      for (const k in cast) relax(k, o.hold || 9000); unlook();
      if (o.keepCamera) stage.controls.enabled = mine.enabled; else { stage.go(mine.pos, mine.look, 900); giveBack = setTimeout(() => { giveBack = null; stage.controls.enabled = mine.enabled; }, 950); }
    }
    return picks;
  }
  // A line said over something else going on (the correction: her mother talking as her hand falls): her portrait, her name, the words typed
  // out and voiced, then gone once they've had time to be read. Nothing waits on it, and nothing is clicked; a new one takes its place.
  let capN = 0;
  function caption(who, text, o) {
    o = o || {}; const n = ++capN, c = cast[who]; if (!c) return Promise.resolve();
    el.classList.remove('muse'); el.classList.add('cap'); speaker(who); face(who, o.face); choicesEl.innerHTML = '';
    const cps = CPS(), secs = Math.max(0.4, text.length / cps), t0 = performance.now();
    // (o.pitch: her words pitched where her cries are; o.speaking(secs): told how long they're voiced for)
    if (voice) voice.stop(); voice = A && A.speak ? A.speak(c.voice || who, text, secs * 0.92, o.pitch ? { pitch: o.pitch } : null) : null;
    if (o.speaking) o.speaking(secs * 0.92 + 0.15);
    const step = () => { if (n !== capN) return; const i = Math.min(text.length, Math.floor((performance.now() - t0) / 1000 * cps)); textEl.textContent = text.slice(0, i); if (i < text.length) requestAnimationFrame(step); };
    textEl.textContent = ''; requestAnimationFrame(step);
    // (o.wait: the scene's own clock, so that a line holds while the game is paused)
    const hold = secs + Math.max(1.6, text.length * 0.05);
    return (o.wait ? o.wait(hold) : new Promise(r => setTimeout(r, hold * 1000))).then(() => { if (n === capN) { el.classList.remove('on', 'cap'); portrait = null; } });
  }
  function captionOff() { capN++; el.classList.remove('on', 'cap'); portrait = null; if (voice) { voice.stop(); voice = null; } }

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
  return { play, settle, next, muse, caption, captionOff, face, relax, destroy, get playing() { return playing; }, el, cast };
}

root.Talk = { create };
})(typeof window !== 'undefined' ? window : globalThis);
