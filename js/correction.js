// Red Lessons — the correction: what a reckoning comes to when a book is settled with one of the givers who correct (never kin, never her mother).
// It plays in a plain room (the giver's back parlour): the giver seated, the heroine across their lap (js/lap.js), at the size she is (in the cloak, the
// cloak's), and runs a script for the tier the ledger chose: how many, with what, and over what. The giver talks between and over the smacks.
//
//   const r = await Correction.run(G, { giver, tier, size, implement });   →   { hits, peak, red, tooHarsh }
//
// Red ends it at once (the button on screen, or the R key). Nothing is held against her for it: the ledger was settled before this began.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3, $ = id => document.getElementById(id);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// The scripts, by tier. Each stage: what she has on (skirt down or lifted, drawers up or down), the implement, how many, and the strength.
const SCRIPTS = {
  token:  [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 6, str: 0.7 }],
  light:  [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 10, str: 0.85 }, { skirt: 'up', drawers: 'up', impl: 'hand', n: 10, str: 0.85 }],
  firm:   [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 10, str: 1 }, { skirt: 'up', drawers: 'up', impl: 'hand', n: 12, str: 1 }, { skirt: 'up', drawers: 'down', impl: 'hand', n: 12, str: 1 }],
  severe: [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 10, str: 1 }, { skirt: 'up', drawers: 'up', impl: 'hand', n: 12, str: 1 }, { skirt: 'up', drawers: 'down', impl: 'hand', n: 12, str: 1.05 }, { skirt: 'up', drawers: 'down', impl: 'paddle', n: 10, str: 1 }],
};

// What each giver says. Missing lines fall back to the defaults. {N} is her name.
const LINES = {
  default: {
    start: 'Over you go. You know why.',
    lift: 'Skirt up, {N}. Lie still while I see to it.',
    drawers: 'And these down. We’re not finished.',
    paddle: 'The paddle now. Then we’re square.',
    during: ['Every one of these is written in my book.', 'Free of responsibility. Not free of this.', 'Keep still.', 'Nearly there.'],
    done: 'There. That’s settled, and it stays settled.',
    after: 'Up you get, slowly. Nobody will mention it again.',
    red: 'Red. All right. It’s over; up you come, gently. Nothing more.',
    harsh: 'That’s enough. More than enough.',
  },
  innkeeper: {
    start: 'Manners and mess, love. Over my knee, and we’ll start with the manners.',
    during: ['You don’t speak to people like that in my house.', 'And the apples. Every one of them.', 'Keep still, now.', 'Almost done.'],
    after: 'Up you get. Come by tomorrow and say good morning to me properly.',
  },
  miller: {
    start: 'Two errands and a bun off my stall. Across my lap.',
    during: ['A favour asked is a favour owed.', 'The flour doesn’t carry itself.', 'Steady.', 'That’s the last of the errands.'],
    after: 'Up. The next sack I give you, you carry. Understood?',
  },
  woodcutter: {
    start: 'Off the path. Twice. Over you go.',
    during: ['There are things in that wood that would not stop at this.', 'The path is marked for a reason.', 'Still, now.', 'Nearly through.'],
    after: 'Up you get. Next time you go in, you keep to the red ribbon.',
  },
};
const line = (g, k, i) => { const L = Object.assign({}, LINES.default, LINES[g] || {}), v = L[k]; return (Array.isArray(v) ? v[i % v.length] : v).replace('{N}', root.Cast.HEROINE_NAME); };

// The room: a back parlour, plank floor, plaster walls, a window, a lamp.
function room() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a1214');
  scene.add(new THREE.HemisphereLight(0xffeedd, 0x403028, 0.55));
  const lamp = new THREE.PointLight(0xffc888, 0.9, 160); lamp.position.set(30, 34, 30); scene.add(lamp);
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.35); sun.position.set(-40, 60, 50); scene.add(sun);
  const tex = (cols, rep) => { const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'); let s = 41; for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { s = (s * 1103515245 + 12345) >>> 0; x.fillStyle = cols[(s >>> 16) % cols.length]; x.fillRect(i, j, 1, 1); } const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.encoding = THREE.sRGBEncoding; return new THREE.MeshLambertMaterial({ map: t }); };
  const floorY = -root.Blocky.CHAIR.legH;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), tex(['#6a4a30', '#5e4028', '#745236'], 10)); floor.rotation.x = -Math.PI / 2; floor.position.y = floorY; scene.add(floor);
  const wall = tex(['#e8dcc4', '#ddd0b4', '#efe4ce'], 6);
  const w1 = new THREE.Mesh(new THREE.PlaneGeometry(140, 70), wall); w1.position.set(0, floorY + 35, -40); scene.add(w1);
  const w2 = new THREE.Mesh(new THREE.PlaneGeometry(140, 70), wall); w2.position.set(70, floorY + 35, 30); w2.rotation.y = -Math.PI / 2; scene.add(w2);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f0').convertSRGBToLinear() })); win.position.set(-20, floorY + 40, -39.8); scene.add(win);
  for (const x of [-20]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 18, 0.6), new THREE.MeshLambertMaterial({ color: 0x5a3e26 })); bar.position.set(x, floorY + 40, -39.5); scene.add(bar); }
  return scene;
}

async function run(G, o) {
  const scene = room(), lap = root.Lap.create(null, { external: { scene }, giver: o.giver, size: o.size || 1 });
  const g = o.giver, script = SCRIPTS[o.tier] || SCRIPTS.light, res = { hits: 0, peak: 0, red: false, tooHarsh: false };
  if (!root.Ledger.correctors().includes(g)) throw new Error('Correction: ' + g + ' does not give corrections');
  G.setScene({ scene, update: dt => lap.update(dt) });
  G.mode = 'cutscene'; document.body.classList.add('cutscene', 'correcting');
  const V = lap.VIEWS, shot = (n, secs) => { const v = V[n](); return G.shot({ pos: v.pos, look: v.look, fov: 40 }, secs || 0); };
  // Red: the button, or R. It stops everything at once.
  let redHit = false;
  const red = () => { if (redHit) return; redHit = true; res.red = true; lap.red(); G.skipping = false; };
  const onKey = e => { if (e.key === 'r' || e.key === 'R') { e.preventDefault(); red(); } };
  root.addEventListener('keydown', onKey); $('redBtn').onclick = e => { e.stopPropagation(); red(); }; $('redBtn').style.display = 'flex';
  // While it runs, the skip button is hidden: a correction is not skipped past, it is stopped (with Red).
  const skipWas = $('skip').style.visibility; $('skip').style.visibility = 'hidden';
  let during = 0;
  lap.on((type, d) => {
    if (type === 'hit') { res.hits = d.hits; res.peak = Math.max(res.peak, d.distress); if (d.hits % 7 === 3) G.caption(g, line(g, 'during', during++)); }
    if (type === 'tooHarsh') res.tooHarsh = true;
  });
  const waitIdle = () => new Promise(r => { const iv = setInterval(() => { if (!lap.busy() || redHit) { clearInterval(iv); r(); } }, 50); });
  try {
    lap.set({ skirt: 'down', drawers: 'up', implement: 'hand', size: o.size || 1 }); lap.update(0.016);
    $('fade').style.transition = 'none'; $('fade').style.opacity = 1;
    await shot('side'); await G.fade(false, 1.2);
    await G.say(g, line(g, 'start'));
    for (let i = 0; i < script.length && !redHit && !res.tooHarsh; i++) {
      const s = script[i], prev = script[i - 1];
      if (prev && s.skirt === 'up' && prev.skirt === 'down') { await G.say(g, line(g, 'lift')); }
      if (prev && s.drawers === 'down' && prev.drawers === 'up') { await G.say(g, line(g, 'drawers')); }
      if (prev && s.impl === 'paddle' && prev.impl !== 'paddle') { await G.say(g, line(g, 'paddle')); }
      if (redHit) break;
      lap.set({ skirt: s.skirt, drawers: s.drawers, implement: s.impl, strength: s.str, pace: 1 });
      await shot(i === 0 ? 'side' : 'behind', 1.2);
      if (redHit) break;
      lap.run(s.n); await waitIdle();
      if (!redHit) await G.wait(0.6);
    }
    G.captionOff();
    if (redHit) { await shot('face', 0.8); await G.say(g, line(g, 'red')); }
    else if (res.tooHarsh) { await G.say(g, line(g, 'harsh')); }
    else { await shot('face', 1.4); await G.say(g, line(g, 'done')); }
    await G.say(g, line(g, 'after'));
    await G.fade(true, 1.2);
  } finally {
    root.removeEventListener('keydown', onKey); $('redBtn').style.display = 'none'; $('skip').style.visibility = skipWas;
    document.body.classList.remove('cutscene', 'correcting');
  }
  return res;
}

root.Correction = { run, SCRIPTS, LINES };
})(window);
