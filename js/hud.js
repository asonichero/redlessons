// The on-screen HUD for play: an objective line at the top, a one-line hint near the bottom, and a toast for passing messages. Built once, on first use.
//   const hud = Hud.create();  hud.objective(text)  hud.hint(text | '')  hud.toast(text, ms)  hud.show(true | false)  hud.tick()  (call tick every frame so toasts fade)
// Key names in a line ("(E)", "(Q)") are dropped on touch screens, where the buttons say what they do (see Tips in js/touchui.js).
(function (root) {
'use strict';
function create() {
  const mk = (cls, parent) => { const e = document.createElement('div'); e.className = cls; parent.appendChild(e); return e; };
  const wrap = mk('hud', document.body), obj = mk('hobj', wrap), hint = mk('hhint', wrap), toast = mk('htoast', wrap);
  wrap.style.display = 'none'; let until = 0;
  const clean = t => root.Tips ? root.Tips.clean(t) : t;
  return {
    el: wrap,
    objective(t) { const s = clean(t || ''); if (obj.textContent !== s) obj.textContent = s; obj.style.display = s ? 'block' : 'none'; },
    hint(t) { const s = clean(t || ''); if (hint.textContent !== s) hint.textContent = s; hint.style.display = s ? 'block' : 'none'; },
    toast(t, ms = 3200) { toast.textContent = clean(t); toast.style.opacity = 1; until = performance.now() + ms; },
    show(on) { wrap.style.display = on ? 'block' : 'none'; document.body.classList.toggle('playing', on); },
    tick() { if (until && performance.now() > until) { toast.style.opacity = 0; until = 0; } },
  };
}
root.Hud = { create };
})(typeof window !== 'undefined' ? window : globalThis);
