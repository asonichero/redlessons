// Red Lessons — the screens around the story: the content notice, the title, settings, the pause menu; and the flow from the opening into the
// village and back to it after each reckoning. (Ported from the Jack game's menus.js, cut down to the one hub.)
(function (root) {
'use strict';
const $ = id => document.getElementById(id), A = root.GameAudio, V = root.Village;
const G = root.Game.create({ stage: $('stage'), fade: $('fade'), subs: $('subs'), subWho: $('subWho'), subText: $('subText') });
root.__game = G;
let W = V.build(G);
const show = id => document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
const hideAll = () => document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
const wake = () => { if (A) { A.init(); A.startMusic(); A.ambience({ wind: 0.4, birds: 0.6, fire: 0 }); } };

G.setScene(W); G.drone = V.DRONE; G.mode = 'title';
const toTitle = () => { G.mode = 'title'; G.setScene(W); G.drone = V.DRONE; G.skipping = false; G.hideLine(); document.body.classList.remove('cutscene'); $('fade').style.transition = 'opacity .8s ease'; $('fade').style.opacity = 0; $('bContinue').disabled = !G.loadSave(); show('title'); };

if (G.store.get(G.NOTICE_KEY, false)) toTitle(); else { G.mode = 'notice'; show('notice'); }
$('noticeYes').onclick = () => { G.store.set(G.NOTICE_KEY, true); wake(); toTitle(); };
$('noticeNo').onclick = () => { location.href = 'about:blank'; };

async function newGame() {
  hideAll(); wake(); G.drone = null; W = V.build(G); G.setScene(W);
  $('fade').style.transition = 'none'; $('fade').style.opacity = 1; await new Promise(r => setTimeout(r, 60));
  await V.opening(G, W);
  G.skipping = false;
  const L = root.Ledger.create(); L.wearing = true;
  G.save({ step: 'village', ledger: L.state });
  await hub(L);
}
async function hub(L, saved) {
  hideAll(); wake(); G.mode = 'play'; G.drone = null; G.setScene(W);
  $('fade').style.transition = 'opacity .8s ease'; $('fade').style.opacity = 0;
  const r = await V.play(G, W, L, saved);
  if (r.quit) { location.reload(); return; }
  if (r.call) {
    const res = await V.reckoning(G, W, L, r.call);
    G.save({ step: 'village', ledger: L.state });
    // A book with something in it, settled with a giver who corrects, is settled over their knee (at whatever size she is now).
    let out = null;
    if (res.tier !== 'none' && root.Ledger.correctors().includes(r.call)) {
      out = await root.Correction.run(G, { giver: r.call, tier: res.tier, size: L.wearing ? V.CLOAK_SCALE : 1 });
    }
    await card(res, r.call, out);
    const sv = (G.loadSave() || {}).hub || null;
    await hub(L, sv ? { pos: new root.THREE.Vector3(sv.pos.x, 0, sv.pos.z), errand: sv.errand === 'sack' ? null : sv.errand } : null);
  }
}
// The settlement card, after the reckoning (and the correction, if there was one).
function card(res, g, out) {
  return new Promise(resolve => {
    const G_ = root.Ledger.GIVERS[g], name = G_.name, T = { none: 'Nothing owed', token: 'Token', light: 'Light', firm: 'Firm', severe: 'Severe' }[res.tier];
    $('setTitle').textContent = 'Settled with ' + name;
    const how = res.lied ? 'She lied about it, which lifted it a tier and went in Grandmother’s book.' : 'She owned up, which mends a little trust.';
    const what = res.tier === 'none' ? 'Nothing was owed.' : G_.kin ? `${T}, settled in words: family keep a book, but they don’t correct.`
      : out ? (out.red ? `${T}. Stopped with Red after ${out.hits}; nothing more was asked of her.` : `${T}: ${out.hits} across ${name.replace(/^The /, 'the ')}’s knee.`) : T + '.';
    $('setText').textContent = what + ' ' + how;
    show('settle'); G.mode = 'end'; $('fade').style.transition = 'none'; $('fade').style.opacity = 0;
    $('setBack').onclick = () => { hideAll(); resolve(); };
  });
}

$('bNew').onclick = () => { if (G.loadSave() && !confirm('Start a new game? Your saved game will be replaced.')) return; G.clearSave(); newGame(); };
$('bContinue').onclick = () => { const sv = G.loadSave(); if (!sv || !sv.ledger) return; const L = root.Ledger.create(sv.ledger); const h = sv.hub; hub(L, h ? { pos: new root.THREE.Vector3(h.pos.x, 0, h.pos.z), carrying: false, errand: h.errand === 'sack' ? null : h.errand } : null); };
$('bSettings').onclick = () => { wake(); show('settings'); };
$('bBack').onclick = () => { G.saveSettings(); if (pmOpen()) pmBack(); else show('title'); };
$('skip').onclick = () => { G.skipping = true; };
$('bReset').onclick = () => { if (confirm('Delete your saved game?')) { G.clearSave(); $('bContinue').disabled = true; } };

// The pause menu (the Menu button, or Escape).
const setCard = $('settings').firstElementChild, pm = $('pmenu');
const pmOpen = () => pm.classList.contains('on');
const playable = () => ['play', 'cutscene'].includes(G.mode) && !document.querySelector('.screen.on:not(#pmenu)');
let pmWas = false;
function pmShow() { if (pmOpen() || !playable()) return; pmWas = G.paused; G.pause(true); pmBack(); pm.classList.add('on'); }
function pmBack() { if (setCard.parentNode === pm) $('settings').appendChild(setCard); $('pmMain').style.display = ''; }
function pmHide() { pm.classList.remove('on'); pmBack(); if (!pmWas) G.pause(false); }
$('menuBtn').onclick = pmShow; $('pmResume').onclick = pmHide;
$('pmSettings').onclick = () => { $('pmMain').style.display = 'none'; pm.appendChild(setCard); };
$('pmTitle').onclick = () => { if (confirm('Return to the title? Your game is saved.')) location.reload(); };
root.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (pmOpen()) { pmHide(); e.preventDefault(); } else if (playable()) { pmShow(); e.preventDefault(); } });
setInterval(() => document.body.classList.toggle('inplay', playable() && !pmOpen()), 150);

const vol = [['vMaster', 'master'], ['vMusic', 'music'], ['vSfx', 'sfx'], ['vVoice', 'voice']];
vol.forEach(([id, k]) => { const el = $(id); el.value = Math.round(A.vols[k] * 100); el.oninput = () => { A.init(); A.setVol(k, el.value / 100); if (k === 'voice') A.speak('mother', 'Home before the bell, love.', 1); }; });
$('vSpeed').value = Math.round(G.settings.speed * 100); $('vSpeed').oninput = () => { G.settings.speed = $('vSpeed').value / 100; G.saveSettings(); };
$('cAuto').checked = G.settings.auto; $('cAuto').onchange = () => { G.settings.auto = $('cAuto').checked; G.saveSettings(); };
$('cSubs').checked = G.settings.subtitles; $('cSubs').onchange = () => { G.settings.subtitles = $('cSubs').checked; G.saveSettings(); };
})(window);
