// Little Red’s Lessons — the small tasks done close to (js/work.js's bakery): seen as she sees them, the work under her hands.
//   • Scrubbing the boards: the kneading table close to, crusts of dried dough on it and the scraper in her hand; each crust clicked (or
//     touched) to scrape it off. Then the scraper's a cloth, and she wipes the board till she's been over all of it.
//   • Setting the sponge: the dough on the board, her hands in it, and the beat: a ring closing on the mark, the act pressed (or clicked, or
//     touched) as it meets it. Kneaded in time, it'll rise; out of it, it won't, much (found in the morning).
//
//   MiniGame.scrub(P, at) → Promise({ crusts, wiped }) · MiniGame.knead(P, at) → Promise({ quality: 0..1 })
//   at: { at (where she stands), look (the board's middle, its height), yaw (the way she faces it) }
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;

const CSS = `#mgHint { position: fixed; left: 50%; top: 14px; transform: translateX(-50%); z-index: 40; padding: 8px 16px; border-radius: 10px; background: rgba(24,16,18,0.85); color: #f3ead8; font: 15px Georgia, serif; pointer-events: none; text-align: center; }
#mgBeat { position: fixed; left: 50%; bottom: 120px; width: 0; height: 0; z-index: 40; pointer-events: none; }
#mgBeat .mark, #mgBeat .ring { position: absolute; border-radius: 50%; transform: translate(-50%, -50%); }
#mgBeat .mark { width: 64px; height: 64px; border: 4px solid #f0d98a; background: rgba(240,217,138,0.15); }
#mgBeat .ring { border: 4px solid #f3ead8; } #mgBeat .mark.hit { background: rgba(140,210,120,0.6); } #mgBeat .mark.miss { background: rgba(220,90,80,0.55); }`;
function ui() { if (!document.getElementById('mgCss')) { const s = document.createElement('style'); s.id = 'mgCss'; s.textContent = CSS; document.head.appendChild(s); }
  const hint = document.createElement('div'); hint.id = 'mgHint'; document.body.appendChild(hint); return hint; }

// (seen from her eyes, over the board: the camera close, her own figure out of the way, the controls not turning it)
function close(P, at) {
  const st = P.stage, f = new V3(Math.sin(at.yaw), 0, Math.cos(at.yaw)), eye = at.look.clone().addScaledVector(f, -13).add(new V3(0, 15, 0));
  const was = { held: P.camHeld, vis: P.rig.root.visible, ctl: st.controls.enabled };
  P.camHeld = true; st.go(eye, at.look.clone(), 500); st.controls.enabled = false; P.rig.root.visible = false;
  return () => { P.camHeld = was.held; st.controls.enabled = was.ctl; P.rig.root.visible = was.vis; };
}
// (where the pointer meets the board: the table's top, as a plane)
function onBoard(P, e, y) {
  const r = P.stage.renderer.domElement.getBoundingClientRect(), nd = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  const ray = new THREE.Raycaster(); ray.setFromCamera(nd, P.stage.camera); const hit = new V3();
  return ray.ray.intersectPlane(new THREE.Plane(new V3(0, 1, 0), -y), hit) ? hit : null;
}
const listen = (el, map) => { for (const k in map) el.addEventListener(k, map[k]); return () => { for (const k in map) el.removeEventListener(k, map[k]); }; };

// ── Scrubbing the boards.
function scrub(P, at) {
  const T = root.Toon, scene = P.stage.scene, y = at.look.y + 0.2, f = new V3(Math.sin(at.yaw), 0, Math.cos(at.yaw)), side = new V3(f.z, 0, -f.x);
  const P_ = (u, v) => at.look.clone().setY(y).addScaledVector(side, u).addScaledVector(f, v);
  const g = new THREE.Group(); scene.add(g); const back = close(P, at), hint = ui(), cv = P.stage.renderer.domElement;
  // (the crusts: six to nine, dried dough stuck to the board)
  const crusts = []; const n = 6 + Math.floor(Math.random() * 4);
  for (let k = 0; k < n; k++) { const m = new THREE.Mesh(T.ell(1.3 + Math.random() * 0.7, 0.45, 1.0 + Math.random() * 0.6, 9, 5), T.mat('#c49a5e')); m.add(new THREE.Mesh(T.hullGeo(m.geometry, 0.06), T.INKM[0])); m.position.copy(P_((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 6)); m.rotation.y = Math.random() * 6; g.add(m); crusts.push(m); }
  // (the scraper, and then the cloth, under the pointer)
  const scraper = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 1.4), T.mat('#8a8e92')); scraper.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.5).translate(0, 0.5, -0.6), T.mat('#8a6a42'))); g.add(scraper);
  const cloth = new THREE.Mesh(T.ell(1.6, 0.4, 1.3, 9, 5), T.mat('#e8e0d0')); cloth.visible = false; g.add(cloth);
  // (the wiping: the board in a grid, each part smeared till the cloth's been over it)
  const cells = []; for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const q = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.2), new THREE.MeshBasicMaterial({ color: '#c8b48a', transparent: true, opacity: 0.55, depthWrite: false })); q.rotation.x = -Math.PI / 2; q.rotation.z = -at.yaw; q.position.copy(P_(-7.5 + i * 3, -2.2 + j * 2.2)).setY(y - 0.1); q.visible = false; g.add(q); cells.push(q); }
  api.now = { crusts, cells };      // (for a look in from outside: tests)
  return new Promise(res => {
    let phase = 'scrape', down = false;
    const say = () => { hint.textContent = phase === 'scrape' ? 'Scrape off the dried dough: click or touch each crust (' + crusts.length + ' left)' : 'Wipe the board down: drag the cloth over all of it'; };
    say();
    const move = e => { const h = onBoard(P, e, y); if (!h) return; (phase === 'scrape' ? scraper : cloth).position.copy(h).setY(y + 0.3);
      if (phase === 'wipe' && down) for (const q of cells) if (q.visible && q.position.distanceTo(h.clone().setY(q.position.y)) < 2) { q.material.opacity -= 0.2; if (q.material.opacity < 0.08) q.visible = false; }
      if (phase === 'wipe' && !cells.some(q => q.visible)) finish(); };
    const press = e => { down = true; const h = onBoard(P, e, y); if (!h) return; move(e);
      if (phase === 'scrape') { const c = crusts.find(c => c.position.distanceTo(h.clone().setY(c.position.y)) < 2.2); if (!c) return;
        c.scale.multiplyScalar(0.5); setTimeout(() => { g.remove(c); }, 160); crusts.splice(crusts.indexOf(c), 1); say();
        if (!crusts.length) { phase = 'wipe'; scraper.visible = false; cloth.visible = true; for (const q of cells) q.visible = true; say(); } } };
    const up = () => { down = false; };
    const off = listen(cv, { pointermove: move, pointerdown: press, pointerup: up, pointerleave: up });
    let done = false;
    function finish() { if (done) return; done = true; off(); hint.textContent = 'There. Clean as a whistle.'; setTimeout(() => { hint.remove(); scene.remove(g); back(); res({ crusts: n, wiped: true }); }, 700); }
  });
}

// ── Setting the sponge: kneaded to the beat.
function knead(P, at) {
  const T = root.Toon, scene = P.stage.scene, y = at.look.y + 0.2, f = new V3(Math.sin(at.yaw), 0, Math.cos(at.yaw)), side = new V3(f.z, 0, -f.x);
  const g = new THREE.Group(); scene.add(g); const back = close(P, at), hint = ui(), cv = P.stage.renderer.domElement;
  const dough = new THREE.Mesh(T.ell(3.2, 1.6, 2.6, 14, 8), T.mat('#efe0c4')); dough.position.copy(at.look).setY(y + 1.3); g.add(dough);
  const skin = T.mat('#f1c9a8'), hands = [-1, 1].map(s => { const h = new THREE.Mesh(T.ell(1.1, 0.6, 1.5, 10, 6), skin); g.add(h); return { h, s }; });
  const place = sq => { for (const { h, s } of hands) h.position.copy(dough.position).addScaledVector(side, s * 1.6).addScaledVector(f, -1.2).setY(y + 2.7 - sq * 1.4); };
  place(0);
  const beat = document.createElement('div'); beat.id = 'mgBeat'; beat.innerHTML = '<div class="mark"></div><div class="ring"></div>'; document.body.appendChild(beat);
  const mark = beat.querySelector('.mark'), ring = beat.querySelector('.ring');
  hint.textContent = 'Knead it to the beat: press (E, click or touch) as the ring meets the circle';
  const N = 8, GAP = 1.0, WIN = 0.2;
  return new Promise(res => {
    let t = -1.2, k = 0, hits = 0, pressed = -1, sq = 0, done = false;
    const tap = () => { if (done || k >= N) return; const at_ = (k + 1) * GAP, d = Math.abs(t - at_); if (pressed === k) return; pressed = k;
      const ok = d <= WIN; if (ok) hits++; sq = 1; mark.className = 'mark ' + (ok ? 'hit' : 'miss'); setTimeout(() => { mark.className = 'mark'; }, 220); };
    const key = e => { if (['KeyE', 'Space', 'Enter'].includes(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); tap(); } };
    addEventListener('keydown', key, true); const off = listen(cv, { pointerdown: tap });
    let last = performance.now();
    const step = () => { if (done) return; const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      const next = (k + 1) * GAP, left = next - t, r = 64 + Math.max(0, left) * 150; ring.style.width = ring.style.height = r + 'px';
      if (t > next + WIN) { if (pressed !== k) { mark.className = 'mark miss'; setTimeout(() => { mark.className = 'mark'; }, 220); } k++; }
      sq = Math.max(0, sq - dt * 4); place(sq); dough.scale.set(1 + sq * 0.12, 1 - sq * 0.2, 1 + sq * 0.12);
      if (k >= N) { done = true; removeEventListener('keydown', key, true); off(); const q = hits / N;
        hint.textContent = q >= 0.75 ? 'Smooth and springy. That’ll rise.' : q >= 0.5 ? 'It’ll do. Not my best.' : 'Lumpy. That won’t rise much.'; beat.remove();
        setTimeout(() => { hint.remove(); scene.remove(g); back(); res({ quality: q }); }, 900); return; }
      requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

const api = { scrub, knead };
root.MiniGame = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
