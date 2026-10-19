// The screens around the game: the title (over a slow aerial view of the world), settings, the pause menu, and the wiring from them to the sandbox (js/demo.js).
(function (root) {
'use strict';
const $ = id => document.getElementById(id), A = root.GameAudio, THREE = root.THREE, V3 = THREE.Vector3;
const G = root.Game.create({ stage: $('stage'), fade: $('fade'), subs: $('subs'), subWho: $('subWho'), subText: $('subText') });
root.__game = G;
const world = root.World.build(), red = root.Blocky.makeRed(), basket = root.Blocky.makeBasket(), hud = root.Hud.create();
red.root.visible = false; world.scene.add(red.root); world.scene.add(basket);
const demo = root.Demo.create(G, world, red, basket, hud); root.__demo = demo; root.__world = world; root.__red = red;
const show = id => document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
const hideAll = () => document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));

// The title's backdrop: a slow orbit round the spawn point, with the hero standing there.
const orbit = t => ({ pos: new V3(world.spawn.x + Math.sin(t * 0.07) * 120, 58, world.spawn.z - 40 + Math.cos(t * 0.07) * 120), look: new V3(world.spawn.x, 18, world.spawn.z - 30), fov: 46 });
function toTitle() {
  demo.stop(); G.mode = 'title'; G.paused = false; G.skipping = false; G.hideLine(); document.body.classList.remove('cutscene', 'inplay');
  $('fade').style.transition = 'opacity .8s ease'; $('fade').style.opacity = 0;
  red.root.visible = true; red.setCloak(true, false); red.setHood(false); red.root.position.set(world.spawn.x, 0, world.spawn.z - 20); red.root.rotation.y = 0.4; red.root.scale.setScalar(0.95); red.hold(null);
  G.setScene(world); G.drone = orbit; $('bContinue').disabled = !G.loadSave(); show('title');
}
async function begin(save) {
  if (A) { A.init(); A.startMusic({ theme: 'pastoral' }); A.ambience({ wind: 0.4, birds: 0.7, fire: 0 }); }
  hideAll(); document.body.classList.add('inplay'); G.drone = null;
  $('fade').style.transition = 'opacity .5s ease'; $('fade').style.opacity = 1; await new Promise(r => setTimeout(r, 520));
  if (save) { demo.restore(save); G.setScene(world); G.mode = 'play'; $('fade').style.opacity = 0; demo.play(); }
  else { G.rerun = null; await demo.intro(); demo.play(); }
}
const persist = () => { if (G.mode === 'play') G.save(demo.snapshot()); };
$('bNew').onclick = () => begin(null);
$('bContinue').onclick = () => { const s = G.loadSave(); if (s) begin(s); };
$('bSettings').onclick = () => { fromPause = false; show('settings'); };
$('bBack').onclick = () => show(fromPause ? 'pmenu' : 'title');
$('bReset').onclick = () => { G.clearSave(); $('bContinue').disabled = true; };

// Settings.
const sliders = [['vMaster', 'master'], ['vMusic', 'music'], ['vSfx', 'sfx'], ['vVoice', 'voice']];
for (const [id, key] of sliders) { const el = $(id); el.value = Math.round(A.vols[key] * 100); el.oninput = () => A.setVol(key, el.value / 100); }
$('vSpeed').value = Math.round(G.settings.speed * 100); $('vSpeed').oninput = () => { G.settings.speed = $('vSpeed').value / 100; G.saveSettings(); };
$('cAuto').checked = G.settings.auto; $('cAuto').onchange = () => { G.settings.auto = $('cAuto').checked; G.saveSettings(); };
$('cSubs').checked = G.settings.subtitles; $('cSubs').onchange = () => { G.settings.subtitles = $('cSubs').checked; G.saveSettings(); };

// Pause: the menu button (or Escape) during play; Resume carries on exactly where it was.
let fromPause = false;
const pause = on => {
  if (on) { if (G.mode !== 'play' && G.mode !== 'cutscene') return; persist(); G.pause(true); show('pmenu'); document.body.classList.add('pm'); }
  else { G.pause(false); hideAll(); document.body.classList.remove('pm'); }
};
$('menuBtn').onclick = () => pause(true);
$('pmResume').onclick = () => pause(false);
$('pmSettings').onclick = () => { fromPause = true; show('settings'); };
$('pmTitle').onclick = () => { persist(); G.pause(false); document.body.classList.remove('pm'); toTitle(); };
root.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('settings').classList.contains('on')) pause(!$('pmenu').classList.contains('on')); });
$('skip').onclick = () => { if (G.mode === 'cutscene') G.skipping = true; };
root.addEventListener('pagehide', persist); setInterval(persist, 8000);

toTitle();
})(typeof window !== 'undefined' ? window : globalThis);
