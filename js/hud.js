// Little Red’s Lessons — the controls and menus for the walking scenes (story.html, play.html), after Climbing Toward Consequence's (its touchui.js
// and menus): round glass buttons with a pale ring and line icons, a gold chip for what she can do here, a pause menu, settings and a sheet of
// the controls.
//
//   Keys: WASD or arrows to walk, Shift (held) to run, E (or Space, Enter) to do what the chip offers, Q for the other thing (lie down, on a bed),
//   Esc for the menu, ? (or the keyboard button) for the controls. A drag goes round; the camera button, or the wheel, steps it near, medium or far.
//   Touch (or ?touch in the address): a stick under the left thumb; under the right, the action button (labelled with what it'll do, greyed when
//   there's nothing), the other action above it, and Run (held). Top right, the menu and the camera.
//   The chip is clickable (or tappable) too: each part of it does what its key does.
//
//   const hud = Hud.create({ get: () => play, scenes: [{ label, run }], links: [{ label, href }], extra: node, title: () => … })
//   hud.objective(text); hud.show(bool); hud.pause(bool); hud.settingsCard(back) (a node);  Hud.settings: { text, auto } (also read by js/talk.js)
(function (root) {
'use strict';
const KEY = 'little-red:settings:v1';
const settings = { text: 1, auto: false };
try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (e) { /* no storage */ }
const saveSettings = () => { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* no storage */ } };

const ICONS = {
  act: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10.5V5a1.5 1.5 0 0 1 3 0v5.5"/><path d="M14 10.5V6.5a1.5 1.5 0 0 1 3 0V15c0 3.6-2.4 6-5.6 6-2.4 0-4-1.2-5.2-3.4L4.4 13.6a1.4 1.4 0 0 1 2.4-1.4L8 13.8"/>',
  talk: '<path d="M4 5h16v10H10l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
  sit: '<path d="M7 4v9h10"/><path d="M7 13v7M17 13v7"/><path d="M7 9h9"/>',
  take: '<path d="M7 11V8a1.5 1.5 0 0 1 3 0v-1.5a1.5 1.5 0 0 1 3 0V8a1.5 1.5 0 0 1 3 0v6c0 4-2.5 6-5.5 6S6 17.5 6 14.5V12"/>',
  door: '<path d="M6 3h11v18H6z"/><path d="M14 12h.5"/>',
  down: '<path d="M12 4v11"/><path d="M7 10.5l5 5 5-5"/><path d="M5 20h14"/>',
  up: '<path d="M12 20V7"/><path d="M6.5 12.5 12 7l5.5 5.5"/><path d="M5 4h14"/>',
  lie: '<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3H10v5"/><circle cx="6.5" cy="11" r="1.6"/>',
  run: '<path d="M5 6l6 6-6 6"/><path d="M12 6l6 6-6 6"/>',
  camera: '<path d="M3 8h4l1.6-2.4h6.8L17 8h4v11H3z"/><circle cx="12" cy="13.2" r="3.6"/>',
  keys: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h1M10 10h1M14 10h1M18 10h1M7 14h10"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  diary: '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/><path d="M9 8h6M9 11h4"/>',
  basket: '<path d="M4 11h16l-1.6 8.2a1.6 1.6 0 0 1-1.6 1.3H7.2a1.6 1.6 0 0 1-1.6-1.3z"/><path d="M7.5 11a4.5 5.5 0 0 1 9 0"/><path d="M9 14v4M12 14v4M15 14v4"/>',
  down: '<path d="M12 4v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M5 20h14"/>',
};
const svg = k => '<svg viewBox="0 0 24 24">' + (ICONS[k] || ICONS.act) + '</svg>';
// (the icon and the short label for an action, from its words)
function iconFor(label) {
  const l = (label || '').toLowerCase();
  if (/^talk/.test(l)) return 'talk'; if (/^(sit|lie)/.test(l)) return 'sit'; if (/^get up/.test(l)) return 'up';
  if (/^(open|shut|close)/.test(l)) return 'door'; if (/^(take|pick)/.test(l)) return 'take'; if (/^(put|set|hang)/.test(l)) return 'down';
  return 'act';
}
const verb = label => { const w = (label || '').split(' '); return /^(get|set|put|pick|lie)$/i.test(w[0]) && w[1] && /^(up|down)$/i.test(w[1]) ? w[0] + ' ' + w[1] : w[0]; };

const CSS = `
#hud { position: fixed; inset: 0; pointer-events: none; z-index: 12; font-family: Georgia, 'Times New Roman', serif; color: #f3ead8; -webkit-touch-callout: none; user-select: none; -webkit-user-select: none; }
#hud.hide { display: none; }
#hud .hb { position: absolute; pointer-events: auto; margin: 0; padding: 0; border-radius: 50%; border: 2.5px solid rgba(255,244,228,0.85); background: rgba(30,20,22,0.72);
  color: #fff; display: none; flex-direction: column; align-items: center; justify-content: center; touch-action: none; -webkit-tap-highlight-color: transparent;
  font: 600 10.5px/1 Georgia, serif; letter-spacing: .02em; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.35); transition: transform .08s, background .15s, opacity .2s; }
#hud .hb svg { fill: none; stroke: #fff; stroke-width: 2.1; stroke-linejoin: round; stroke-linecap: round; }
#hud .hb span { margin-top: 2px; max-width: 92%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 3px #000; }
#hud .hb:hover { background: rgba(70,48,52,0.95); }
#hud .hb.down { background: rgba(110,60,64,0.95); transform: scale(0.94); }
#hud .hb.on { background: #7a2228; border-color: #f0d98a; }
#hud .hb.ready { border-color: #f0d98a; background: rgba(122,34,40,0.82); }
#hud .hb.off { opacity: 0.32; filter: grayscale(1); cursor: default; }
#hAct { right: 22px; bottom: 24px; width: 78px; height: 78px; } #hAct svg { width: 32px; height: 32px; }
#hAlt { right: 112px; bottom: 34px; width: 62px; height: 62px; } #hAlt svg { width: 26px; height: 26px; }
#hRun { right: 37px; bottom: 112px; width: 54px; height: 54px; } #hRun svg { width: 25px; height: 25px; }
#hMenu { right: 12px; top: 10px; width: 52px; height: 52px; display: flex !important; } #hMenu svg { width: 26px; height: 26px; stroke-width: 2.4; }
#hCam { right: 12px; top: 70px; width: 52px; height: 52px; display: flex !important; } #hCam svg { width: 27px; height: 27px; }
#hHelp { right: 12px; bottom: 12px; width: 46px; height: 46px; } #hHelp svg { width: 24px; height: 24px; }
#hStick { position: absolute; left: 22px; bottom: 26px; width: 130px; height: 130px; border-radius: 50%; background: rgba(30,20,22,0.45); border: 2px solid rgba(230,196,106,0.55);
  touch-action: none; display: none; pointer-events: auto; }
#hKnob { position: absolute; left: 50%; top: 50%; width: 56px; height: 56px; margin: -28px 0 0 -28px; border-radius: 50%; background: rgba(230,196,106,0.75); pointer-events: none; box-shadow: 0 2px 6px rgba(0,0,0,.4); }
#hud.touch #hStick { display: block; } #hud.touch .hb.t { display: flex; } #hud:not(.touch) #hHelp { display: flex; }
/* (what she can do here: a gold chip, each part clickable) */
#hPrompt { position: absolute; left: 50%; bottom: 34px; transform: translateX(-50%); display: none; gap: 18px; pointer-events: auto; white-space: nowrap; max-width: calc(100vw - 24px); }
#hPrompt.on { display: flex; }
#hPrompt .p { background: rgba(16,10,12,0.82); border: 1px solid #c9a84c; color: #f3e4b0; padding: 6px 14px 6px 8px; border-radius: 8px; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 9px;
  box-shadow: 0 2px 10px rgba(0,0,0,.35); overflow: hidden; text-overflow: ellipsis; }
#hPrompt .p:hover { background: rgba(60,36,30,0.92); border-color: #f0d98a; }
#hud kbd, #hSheet kbd { font: 600 13px Georgia, serif; background: #3a2c2e; color: #f3ead8; border: 1px solid #6a5658; border-bottom-width: 3px; border-radius: 5px; padding: 1px 7px; min-width: 10px; text-align: center; }
#hud.touch #hPrompt { bottom: 172px; } #hud.touch #hPrompt kbd { display: none; } #hud.touch #hPrompt .p { padding-left: 14px; font-size: 15px; }
#hObj { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); max-width: min(620px, calc(100vw - 150px)); text-align: center; font: italic clamp(13px, 1.9vw, 16px)/1.4 Georgia, serif;
  background: rgba(16,10,12,0.7); border: 1px solid #4a3a3c; border-radius: 8px; padding: 7px 16px; opacity: 0; transition: opacity .5s; }
#hObj.on { opacity: 1; }
/* (the day and the time, top left; the phase of the story under it) */
#hClock { position: absolute; top: 12px; left: 12px; font: 13px/1.3 Georgia, serif; color: #f3ead8; background: rgba(16,10,12,0.62); border: 1px solid #4a3a3c; border-radius: 8px; padding: 5px 11px; display: none; }
#hClock.on { display: block; } body.talking #hClock, body.correcting #hClock { opacity: 0; } #hClock i { display: block; font-size: 11px; color: #c9a88c; letter-spacing: .06em; }
@media (max-width: 640px) { #hClock { font-size: 11.5px; padding: 4px 8px; } #hObj { top: 52px; max-width: calc(100vw - 80px); } }
/* (what's hers to do, top left under the clock; the diary button by the clock opens the whole of it) */
#hTop { position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; max-width: min(360px, calc(100vw - 150px)); }
#hTop #hClock { position: static; } #hTopRow { display: flex; gap: 6px; align-items: stretch; }
#hDiary { pointer-events: auto; width: 40px; border-radius: 8px; border: 1px solid #4a3a3c; background: rgba(16,10,12,0.62); color: #f3ead8; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
#hDiary svg { width: 22px; height: 22px; fill: none; stroke: #f3e4b0; stroke-width: 1.6; } #hDiary:hover { background: rgba(60,40,44,0.8); }
#hQuests { display: none; font: italic 14px/1.35 Georgia, serif; color: #f6efe2; background: rgba(16,10,12,0.55); border: 1px solid #4a3a3c; border-radius: 8px; padding: 6px 11px; }
#hBasket { pointer-events: auto; width: 40px; border-radius: 8px; border: 1px solid #4a3a3c; background: rgba(16,10,12,0.62); color: #f3ead8; cursor: pointer; display: none; align-items: center; justify-content: center; padding: 0; }
#hBasket.on { display: flex; } #hBasket svg { width: 22px; height: 22px; fill: none; stroke: #f3e4b0; stroke-width: 1.6; } #hBasket:hover { background: rgba(60,40,44,0.8); }
#hBasketCard .bl { font: 16px/1.5 Georgia, serif; color: #f3ead8; margin: 8px 0 4px; padding: 0; list-style: none; } #hBasketCard .bl li::before { content: '❧ '; color: #c9a84c; }
#hBasketCard .none { font: italic 15px Georgia, serif; color: #c9a88c; }
#hQuests.on { display: block; } #hQuests div { margin: 2px 0; padding-left: 12px; text-indent: -12px; } #hQuests div::before { content: '❧ '; color: #c9a84c; font-style: normal; }
body.talking #hTop, body.correcting #hTop { opacity: 0; pointer-events: none; }
@media (max-width: 640px) { #hQuests { font-size: 12.5px; padding: 4px 8px; } #hDiary, #hBasket { width: 34px; } }
/* (a change of trust, above the conversation's box) */
#hTrust { position: fixed; left: 50%; bottom: 186px; transform: translateX(-50%); z-index: 22; display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none; }
#hTrust .tn { font: 15px/1.3 Georgia, serif; padding: 5px 14px; border-radius: 16px; background: rgba(16,10,12,0.78); border: 1px solid; transition: opacity 1s; filter: drop-shadow(0 1px 4px #000); }
#hTrust .tn.up { color: #9ee08a; border-color: #5aa04a; } #hTrust .tn.down { color: #f08a80; border-color: #b04a40; } #hTrust .tn.out { opacity: 0; }
@media (max-width: 640px) { #hTrust { bottom: 150px; } #hTrust .tn { font-size: 13px; } }
/* (the diary's tabs) */
.dtabs { display: flex; gap: 6px; margin: 0 0 8px; } .dtabs button { flex: 1; margin: 0; padding: 6px; font-size: 13px; } .dtabs button.on { background: #6a3a3e; border-color: #c9a84c; }
.hCard .journal .q.cool b { color: #f08a80; }
/* (the journal, in the pause menu) */
.hCard .journal .ph { font-size: 13px; color: #c9a88c; margin: 2px 0 6px; } .hCard .journal .q { margin: 7px 0; font-size: 14px; line-height: 1.4; }
.hCard .journal .q b { color: #f3e4b0; font-weight: normal; } .hCard .journal .q.main b { color: #e8504a; } .hCard .journal .q small { display: block; color: #c9b8a8; font-style: italic; }
.hCard .journal .q.paused, .hCard .journal .q.done { opacity: .55; } .hCard .journal .q .st { float: right; font-size: 11px; color: #a89888; letter-spacing: .05em; }
body.talking #hud .hb.t, body.talking #hStick, body.talking #hPrompt, body.talking #hHelp, body.talking #hObj { opacity: 0 !important; pointer-events: none !important; }
body.talking #hCam { opacity: .35; pointer-events: none; }
/* (on a touch screen her thoughts come up at the top, clear of the thumbs) */
body.touchmode .talk.muse { bottom: auto; top: 56px; }
@media (max-height: 440px) {
  #hAct { right: 18px; bottom: 18px; width: 68px; height: 68px; } #hAlt { right: 98px; bottom: 26px; width: 56px; height: 56px; } #hRun { right: 28px; bottom: 98px; width: 48px; height: 48px; }
  #hStick { width: 112px; height: 112px; left: 16px; bottom: 18px; } #hMenu, #hCam { width: 46px; height: 46px; } #hCam { top: 62px; } #hud.touch #hPrompt { bottom: 130px; }
}
/* ── The menus ── */
.hScreen { position: fixed; inset: 0; z-index: 50; display: none; align-items: center; justify-content: center; background: rgba(8,5,6,0.72); font: 15px/1.55 Georgia, 'Times New Roman', serif; color: #f3ead8; }
.hScreen.on { display: flex; }
.hCard { width: min(360px, 90vw); max-height: 90vh; overflow-y: auto; box-sizing: border-box; padding: 20px 24px 22px; background: rgba(24,16,18,0.95); border: 1px solid #5a4446; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,.6); }
.hCard h2 { margin: 0 0 6px; font-size: 20px; font-weight: normal; color: #e6c46a; letter-spacing: .05em; }
.hCard h3 { margin: 16px 0 2px; font-size: 13px; font-weight: normal; color: #c9a88c; letter-spacing: .12em; text-transform: uppercase; }
.hCard button, .hCard a.btn { display: block; width: 100%; box-sizing: border-box; margin: 9px 0 0; padding: 10px 16px; font: 16px Georgia, serif; color: #f3ead8; text-align: left; text-decoration: none;
  background: #33252a; border: 1px solid #6a5054; border-radius: 7px; cursor: pointer; }
.hCard button:hover, .hCard a.btn:hover, .hCard button:focus-visible { background: #4a3238; border-color: #c9a84c; outline: none; }
.hCard button.primary { background: #7a2228; border-color: #c9a84c; }
.hCard button.primary:hover { background: #8e2a30; }
.hCard .row { display: flex; flex-direction: column; gap: 2px; margin: 12px 0; }
.hCard .row label { display: flex; justify-content: space-between; font-size: 14px; color: #e8dccb; } .hCard .row label i { font-style: normal; color: #c9a88c; }
.hCard .check { display: flex; align-items: center; justify-content: space-between; margin: 12px 0; font-size: 14px; }
.hCard input[type=range] { width: 100%; margin: 0; accent-color: #c9a84c; } .hCard input[type=checkbox] { width: 18px; height: 18px; accent-color: #c9a84c; }
.hCard .tabs { display: flex; flex-wrap: wrap; gap: 4px; } .hCard .tabs button { width: auto; flex: 1; margin: 4px 0 0; padding: 6px 8px; font-size: 13px; text-align: center; }
.hCard .tabs button.on { background: #7a2228; border-color: #f0d98a; }
#hSheet table { border-collapse: collapse; width: 100%; } #hSheet td { padding: 5px 0; vertical-align: top; font-size: 14px; } #hSheet td:first-child { padding-right: 14px; white-space: nowrap; }
#hSheet .x { margin-top: 12px; font-size: 12.5px; opacity: .6; text-align: right; }
`;

function create(opts) {
  opts = opts || {};
  const P = () => (opts.get ? opts.get() : null);
  if (!document.getElementById('hud-css')) { const st = document.createElement('style'); st.id = 'hud-css'; st.textContent = CSS; document.head.appendChild(st); }
  const el = document.createElement('div'); el.id = 'hud';
  el.innerHTML = '<div id="hTop"><div id="hTopRow"><div id="hClock"></div><button id="hDiary" title="Her diary (J)" aria-label="Diary">' + svg('diary') + '</button><button id="hBasket" title="Her basket (B)" aria-label="Her basket">' + svg('basket') + '</button></div><div id="hQuests"></div></div><div id="hObj"></div><div id="hPrompt"></div><div id="hStick"><div id="hKnob"></div></div>' +
    '<button id="hMenu" class="hb" title="Menu (Esc)" aria-label="Menu">' + svg('menu') + '</button>' +
    '<button id="hCam" class="hb" title="Camera: near, medium or far" aria-label="Camera">' + svg('camera') + '</button>' +
    '<button id="hHelp" class="hb" title="Controls (?)" aria-label="Controls">' + svg('keys') + '</button>' +
    '<button id="hAct" class="hb t off">' + svg('act') + '<span>Do</span></button>' +
    '<button id="hAlt" class="hb t off">' + svg('lie') + '<span>Lie down</span></button>' +
    '<button id="hRun" class="hb t">' + svg('run') + '<span>Run</span></button>';
  document.body.appendChild(el);
  const $ = id => document.getElementById(id), prompt = $('hPrompt'), objEl = $('hObj');

  // ── Touch or mouse: the touch controls show on a touch screen until a mouse is used (and come back at a touch); ?touch forces them. ──
  const forced = /[?&]touch\b/.test(location.search);
  let touch = forced || (matchMedia('(pointer: coarse)').matches);
  const mode = t => { touch = forced || t; el.classList.toggle('touch', touch); document.body.classList.toggle('touchmode', touch); };
  mode(touch);
  addEventListener('pointerdown', e => { if (e.pointerType === 'touch') mode(true); else if (e.pointerType === 'mouse') mode(false); }, true);
  addEventListener('keydown', e => { if (/^(Key[WASDEQ]|Arrow|Shift)/.test(e.code)) mode(false); }, true);

  // ── The pause menu, settings, the controls sheet ──
  const screen = (id, html) => { const s = document.createElement('div'); s.className = 'hScreen'; s.id = id; s.innerHTML = '<div class="hCard">' + html + '</div>'; document.body.appendChild(s); return s; };
  const pauseEl = screen('hPause', '<h2>Paused</h2><button class="primary" data-k="resume">Resume</button><button data-k="settings">Settings</button><button data-k="controls">Controls</button>' +
    '<div class="journal"></div><div class="scenes"></div><div class="extra"></div><div class="links"></div><button data-k="title">Back to the title</button>');
  const pc = pauseEl.querySelector('.hCard');
  if (opts.scenes && opts.scenes.length) { const d = pc.querySelector('.scenes'); d.innerHTML = '<h3>Chapter one</h3>'; opts.scenes.forEach(s => { const b = document.createElement('button'); b.textContent = s.label; b.onclick = () => { pause(false); s.run(); }; d.appendChild(b); }); }
  if (opts.extra) { const d = pc.querySelector('.extra'); if (opts.extraTitle) d.innerHTML = '<h3>' + opts.extraTitle + '</h3>'; d.appendChild(opts.extra); }
  if (opts.links && opts.links.length) { const d = pc.querySelector('.links'); d.innerHTML = '<h3>Elsewhere</h3>' + opts.links.map(l => '<a class="btn" href="' + l.href + '">' + l.label + '</a>').join(''); }
  if (!opts.title) pc.querySelector('[data-k=title]').remove();
  const setEl = screen('hSettings', '');
  const sheet = screen('hSheet', '<h2>Controls</h2><table>' + [
    ['<kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrows', 'Walk'], ['<kbd>Shift</kbd> (hold)', 'Run'], ['<kbd>E</kbd> <kbd>Space</kbd> or <kbd>Enter</kbd>', 'Do what the gold chip offers'],
    ['<kbd>Q</kbd>', 'Put down what’s in her hands (or the other thing: lie down, on a bed)'], ['<kbd>B</kbd>, or the basket by the diary', 'What’s in her basket, while she’s carrying it'], ['The camera button, or the wheel', 'Camera: near, medium or far'], ['Drag', 'Go round'],
    ['In a conversation', '<kbd>Space</kbd>, <kbd>E</kbd> or a click: on; <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>: choose'], ['<kbd>J</kbd>, or the book by the clock', 'Her diary'], ['<kbd>Esc</kbd>', 'Menu']].map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') +
    '</table><p style="font-size:13px;color:#c9a88c;margin:12px 0 0">On a touch screen: the stick to walk, the round buttons to act and to run (hold); a finger on the view to go round, two to pinch nearer or further.</p><div class="x">Click anywhere or press Esc to close</div>');
  // The diary: the whole journal in a pop-up of its own (the game held while it's open). J, or the button by the clock.
  const diaryEl = screen('hDiaryCard', '<h2>Her diary</h2><div class="dtabs"><button data-tab="days" class="on">Her days</button><button data-tab="people">Her people</button></div><div class="journal"></div><div class="x">Esc, or click outside, to close</div>');
  let diaryTab = 'days';
  diaryEl.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); diaryTab = b.dataset.tab; diaryEl.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); drawJournal(diaryEl.querySelector('.journal'), diaryTab); }));
  let diaryHeld = null;
  // Her basket: what's in it, in a card of its own (B, or the basket by the diary, while she's carrying it).
  const basketEl = screen('hBasketCard', '<h2>Her basket</h2><div class="list"></div><div class="x">Esc, or click outside, to close</div>');
  let basketList = null, basketHeld = null;
  const drawBasket = () => { const box = basketEl.querySelector('.list'), esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
    box.innerHTML = basketList && basketList.length ? '<ul class="bl">' + basketList.map(t => '<li>' + esc(t[0].toUpperCase() + t.slice(1)) + '</li>').join('') + '</ul>' : '<p class="none">Nothing in it yet.</p>'; };
  function basketCard(on) {
    const p = P(), st = p && p.stage; if (on && !basketList) return; if (on === basketEl.classList.contains('on')) return;
    if (on) { drawBasket(); basketHeld = st ? st.held : null; if (st) st.held = true; } else if (st && basketHeld != null) st.held = basketHeld;
    basketEl.classList.toggle('on', on);
  }
  basketEl.addEventListener('click', e => { if (e.target === basketEl) basketCard(false); });
  addEventListener('keydown', e => { if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return; if (e.code === 'KeyB' && !document.body.classList.contains('talking')) basketCard(!basketEl.classList.contains('on')); else if (e.code === 'Escape' && basketEl.classList.contains('on')) { e.stopImmediatePropagation(); basketCard(false); } }, true);
  function diary(on) {
    const p = P(), st = p && p.stage; if (on === diaryEl.classList.contains('on')) return;
    if (on) { drawJournal(diaryEl.querySelector('.journal'), diaryTab); diaryHeld = st ? st.held : null; if (st) st.held = true; } else if (st && diaryHeld != null) st.held = diaryHeld;
    diaryEl.classList.toggle('on', on);
  }
  diaryEl.addEventListener('click', e => { if (e.target === diaryEl) diary(false); });      // (outside the card)
  addEventListener('keydown', e => { if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return; if (e.code === 'KeyJ' && !document.body.classList.contains('talking')) diary(!diaryEl.classList.contains('on')); else if (e.code === 'Escape' && diaryEl.classList.contains('on')) { e.stopPropagation(); diary(false); } }, true);
  let paused = false, wasHeld = false, audioWas = null;
  // The journal (opts.journal() → { phase, clock, lines: [{ name, main, state, step: { title, hint }, done, total }] }): where each line has got to.
  const STATE = { offered: '', waiting: 'waiting', gated: 'not yet', later: 'later', paused: 'paused', done: 'done' };
  // (tab: 'days', what's hers to do now and the story under way; 'people', how each of them is with her)
  function drawJournal(into, tab) {
    const d = into || pc.querySelector('.journal'); if (!opts.journal) return; const j = opts.journal(); if (!j) { d.innerHTML = ''; return; }
    const esc = t => String(t || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
    const head = '<div class="ph">' + esc(j.clock) + (j.phase ? ' · Act ' + j.phase.act + ', ' + esc(j.phase.name) : '') + '</div>';
    if (tab === 'people') { d.innerHTML = head + (j.people.length ? j.people.map(p => '<div class="q ' + (p.trust < 0 ? 'cool' : '') + '"><b>' + esc(p.name) + '</b><small>' + esc(p.text) + '</small></div>').join('') : '<div class="q"><small>No one yet.</small></div>'); return; }
    d.innerHTML = head + '<h3>Today</h3>' + (j.today.length ? j.today.map(t => '<div class="q"><b>' + esc(t) + '</b></div>').join('') : '<div class="q"><small>Nothing asked of her. The day’s her own.</small></div>') +
      (j.steps.length ? '<h3>Under way</h3>' + j.steps.map(s => '<div class="q"><b>' + esc(s.name) + '</b> — ' + esc(s.title) + '<small>' + esc(s.hint) + '</small></div>').join('') : '');
  }
  function pause(on) {
    if (on) drawJournal();
    if (on === paused) return; paused = on; const p = P(), st = p && p.stage;
    pauseEl.classList.toggle('on', on); if (!on) { setEl.classList.remove('on'); sheet.classList.remove('on'); }
    if (st) { if (on) { wasHeld = st.held; st.held = true; } else st.held = wasHeld; }
    const A = root.GameAudio; if (A && A.ctx) { if (on) { audioWas = A.ctx.state; A.ctx.suspend(); } else if (audioWas === 'running') A.ctx.resume(); }
    held.clear(); axes();
  }
  function settingsCard(back) {
    const A = root.GameAudio, v = A ? A.vols : { master: 0.8, music: 0.25, sfx: 0.8, voice: 0.7 };
    const slider = (k, label) => '<div class="row"><label>' + label + ' <i data-v="' + k + '">' + Math.round(v[k] * 100) + '</i></label><input type="range" min="0" max="100" data-vol="' + k + '" value="' + Math.round(v[k] * 100) + '"></div>';
    const speeds = [[0.6, 'Slow'], [1, 'Usual'], [1.6, 'Quick'], [9, 'At once']];
    const d = document.createElement('div');
    d.innerHTML = '<h2>Settings</h2><h3>Sound</h3>' + slider('master', 'All') + slider('music', 'Music') + slider('sfx', 'Sounds about her') + slider('voice', 'Voices') +
      '<h3>Conversations</h3><div class="row"><label>Words appear</label><div class="tabs">' + speeds.map(([s, l]) => '<button data-speed="' + s + '"' + (Math.abs(settings.text - s) < 0.01 ? ' class="on"' : '') + '>' + l + '</button>').join('') + '</div></div>' +
      '<div class="check"><span>Lines go on by themselves</span><input type="checkbox" data-auto' + (settings.auto ? ' checked' : '') + '></div>' +
      '<button class="primary" data-k="back">Back</button>';
    d.querySelectorAll('[data-vol]').forEach(r => r.addEventListener('input', () => { const k = r.dataset.vol, x = r.value / 100; if (A) A.setVol(k, x); else v[k] = x; d.querySelector('[data-v=' + k + ']').textContent = r.value; }));
    d.querySelectorAll('[data-speed]').forEach(b => b.onclick = () => { settings.text = +b.dataset.speed; saveSettings(); d.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('on', x === b)); });
    d.querySelector('[data-auto]').onchange = e => { settings.auto = e.target.checked; saveSettings(); };
    d.querySelector('[data-k=back]').onclick = back;
    return d;
  }
  function openSettings(back) { const c = setEl.querySelector('.hCard'); c.innerHTML = ''; c.appendChild(settingsCard(() => { setEl.classList.remove('on'); if (back) back(); })); setEl.classList.add('on'); }
  pauseEl.addEventListener('click', e => {
    const k = e.target.dataset && e.target.dataset.k; if (e.target === pauseEl) return pause(false);
    if (k === 'resume') pause(false); else if (k === 'settings') openSettings(); else if (k === 'controls') sheet.classList.add('on');
    else if (k === 'title' && opts.title) { pause(false); opts.title(); }
  });
  sheet.addEventListener('pointerdown', () => sheet.classList.remove('on'));
  $('hMenu').addEventListener('click', e => { e.stopPropagation(); pause(!paused); });
  $('hDiary').addEventListener('click', e => { e.stopPropagation(); diary(true); });
  $('hBasket').addEventListener('click', e => { e.stopPropagation(); basketCard(true); });
  $('hHelp').addEventListener('click', e => { e.stopPropagation(); sheet.classList.add('on'); });

  // ── The camera: in close, at the usual distance, or well back (the wheel still zooms between). ──
  const ZOOMS = [['Close', 0.55], ['Usual', 1], ['Far', 1.9]]; let zoom = 1, base = null;
  function stepCam() {
    const p = P(); if (!p || (p.talk && p.talk.playing) || document.body.classList.contains('correcting')) return; const st = p.stage, off = st.camera.position.clone().sub(st.controls.target);
    // (between scenes, the game's camera steps between its own three distances, near, medium and far: see js/play.js)
    if (p.follows) { p.camZoom = p.camZoom + 1; $('hCam').title = 'Camera: ' + p.FOLLOW_NAMES[p.camZoom]; return; }
    if (base == null || Math.abs(off.length() - base * ZOOMS[zoom][1]) > 2) { base = off.length() / ZOOMS[zoom][1]; }      // (the wheel moved it: start from there)
    zoom = (zoom + 1) % ZOOMS.length; const want = Math.max(st.controls.minDistance, Math.min(st.controls.maxDistance, base * ZOOMS[zoom][1]));
    st.go(st.controls.target.clone().add(off.setLength(want)), st.controls.target.clone(), 450);
    $('hCam').title = 'Camera: ' + ZOOMS[zoom][0];
  }
  $('hCam').addEventListener('click', e => { e.stopPropagation(); stepCam(); });

  // ── Keys ──
  const held = new Set(); let runBtn = false;
  function axes() {
    const p = P(); if (!p) return; const k = c => held.has(c) ? 1 : 0;
    if (sid == null) { p.input.move.x = k('KeyD') + k('ArrowRight') - k('KeyA') - k('ArrowLeft'); p.input.move.z = k('KeyW') + k('ArrowUp') - k('KeyS') - k('ArrowDown'); }
    p.input.run = held.has('ShiftLeft') || held.has('ShiftRight') || runBtn;
  }
  setInterval(axes, 200);      // (the scene can change under the keys)
  const typing = e => /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName) && e.target.type !== 'range' && e.target.type !== 'checkbox';
  addEventListener('keydown', e => {
    if (e.code === 'Escape') { if (sheet.classList.contains('on')) sheet.classList.remove('on'); else if (setEl.classList.contains('on')) setEl.classList.remove('on'); else if (!el.classList.contains('hide')) pause(!paused); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (paused || sheet.classList.contains('on')) { e.stopImmediatePropagation(); return; }      // (nothing reaches the game, nor the conversation, while the menu's up)
  }, true);
  addEventListener('keydown', e => {
    if (typing(e) || el.classList.contains('hide')) return;
    if (e.key === '?' || e.code === 'F1') { sheet.classList.add('on'); e.preventDefault(); return; }
    if (e.repeat) return; held.add(e.code); const p = P();
    if (p && ['KeyE', 'Space', 'Enter', 'NumpadEnter'].includes(e.code)) p.use();
    if (p && e.code === 'KeyQ') p.use(true);
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    axes();
  });
  addEventListener('keyup', e => { held.delete(e.code); axes(); });
  addEventListener('blur', () => { held.clear(); axes(); });

  // ── Touch: the stick and the buttons ──
  const stick = $('hStick'), knob = $('hKnob'); let sid = null;
  const stickAt = e => { const p = P(); if (!p) return; const r = stick.getBoundingClientRect(), rad = r.width / 2; let x = (e.clientX - r.left - rad) / rad, y = (e.clientY - r.top - rad) / rad; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    const dz = Math.hypot(x, y) < 0.15 ? 0 : 1; p.input.move.x = x * dz; p.input.move.z = -y * dz; knob.style.transform = `translate(${x * rad * 0.55}px, ${y * rad * 0.55}px)`; };
  stick.addEventListener('pointerdown', e => { sid = e.pointerId; stick.setPointerCapture(sid); stickAt(e); e.preventDefault(); e.stopPropagation(); });
  stick.addEventListener('pointermove', e => { if (e.pointerId === sid) stickAt(e); });
  const stickEnd = () => { sid = null; const p = P(); if (p) p.input.move.x = p.input.move.z = 0; knob.style.transform = ''; };
  stick.addEventListener('pointerup', stickEnd); stick.addEventListener('pointercancel', stickEnd);
  const press = (id, down, up) => { const b = $(id);
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (b.classList.contains('off')) return; b.classList.add('down'); try { b.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } if (root.GameAudio && GameAudio.init) GameAudio.init(); down(); });
    const end = () => { if (!b.classList.contains('down')) return; b.classList.remove('down'); if (up) up(); };
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('contextmenu', e => e.preventDefault()); };
  press('hAct', () => { const p = P(); if (p) p.use(); });
  press('hAlt', () => { const p = P(); if (p) p.use(true); });
  press('hRun', () => { runBtn = true; $('hRun').classList.add('on'); axes(); }, () => { runBtn = false; $('hRun').classList.remove('on'); axes(); });

  // ── Each frame: the chip and the buttons say what she can do now. ──
  const btn = (id, o) => { const b = $(id), sig = JSON.stringify(o); if (b._sig === sig) return; b._sig = sig;
    b.classList.toggle('off', !o.enabled); b.classList.toggle('ready', !!o.enabled && id === 'hAct'); b.innerHTML = svg(o.icon) + '<span>' + o.label + '</span>'; b.title = o.title || o.label; };
  let lastChip = '';
  function tick() {
    requestAnimationFrame(tick);
    const p = P(), o = p && p.offer;
    btn('hAct', o ? { icon: iconFor(o.label), label: verb(o.label), title: o.label, enabled: true } : { icon: 'act', label: 'Do', enabled: false });
    { const nr = !!(p && p.noRun); if ($('hRun')._nr !== nr) { $('hRun')._nr = nr; $('hRun').style.visibility = nr ? 'hidden' : ''; } }      // (no running there: no button for it)
    const a = p && p.alt;      // (what Q does: the offer's other thing, or put down what's in her hands)
    btn('hAlt', a ? { icon: a.down ? 'down' : 'lie', label: verb(a.label), title: a.label, enabled: true } : { icon: 'lie', label: 'Lie down', enabled: false });
    const chip = (o ? o.label : '') + '|' + (a ? a.label : '');
    if (chip !== lastChip) {
      lastChip = chip; prompt.innerHTML = '';
      if (o || a) { const part = (key, label, alt) => { const s = document.createElement('div'); s.className = 'p'; s.innerHTML = '<kbd>' + key + '</kbd>'; s.appendChild(document.createTextNode(label));
          s.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); const q = P(); if (q) q.use(alt); }); prompt.appendChild(s); };
        if (o) part('E', o.label, false); if (a) part('Q', a.label, true); }
      prompt.classList.toggle('on', !!(o || a));
    }
  }
  requestAnimationFrame(tick);

  return {
    el, settings, pause, openSettings, settingsCard, stepCam,
    get paused() { return paused; },
    objective(t) { if (t) objEl.textContent = t; objEl.classList.toggle('on', !!t); },
    // (what's hers to do now, a line each, top left)
    // A change of trust, just above where the conversation's box sits: green up, red down; two for the same person close together run as one.
    trust(who, n) {
      let box = $('hTrust'); if (!box) { box = document.createElement('div'); box.id = 'hTrust'; document.body.appendChild(box); }
      let el = [...box.children].find(c => c.dataset.who === who && Date.now() - c.dataset.at < 2500);
      if (el) { n += +el.dataset.n; el.remove(); }
      if (!n) return;
      el = document.createElement('div'); el.className = 'tn ' + (n > 0 ? 'up' : 'down'); el.dataset.who = who; el.dataset.n = n; el.dataset.at = Date.now();
      el.textContent = (n > 0 ? '▲ ' : '▼ ') + who + (n > 0 ? ' trusts you more' : ' trusts you less');
      box.appendChild(el); setTimeout(() => el.classList.add('out'), 3200); setTimeout(() => el.remove(), 4200);
    },
    quests(list) { const q = $('hQuests'), esc = t => String(t || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); list = list || []; const html = list.map(t => '<div>' + esc(t) + '</div>').join('');
      if (q.innerHTML !== html) q.innerHTML = html; q.classList.toggle('on', list.length > 0); objEl.classList.remove('on'); },
    diary,
    basket(list) { basketList = list; $('hBasket').classList.toggle('on', !!list); if (!list && basketEl.classList.contains('on')) basketCard(false); else if (basketEl.classList.contains('on')) drawBasket(); },      // (her basket, while she's carrying it: what's in it)
    clock(t, phase) { const c = $('hClock'); c.innerHTML = t ? t + (phase ? '<i>' + phase.name + '</i>' : '') : ''; c.classList.toggle('on', !!t); },
    show(on) { el.classList.toggle('hide', !on); if (!on) pause(false); },
  };
}

root.Hud = { create, settings, ICONS, svg };
})(typeof window !== 'undefined' ? window : globalThis);
