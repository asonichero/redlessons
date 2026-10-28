// Little Red’s Lessons — the way to what's hers to do: a ring on the ground where it's done (or at the way out toward it, when it's somewhere
// else), and an arrow at the edge of the view pointing to it when it's out of sight. The first thing on her list decides it: the evening's
// matters, her mother's errand, the garden, Grandmother's herbs, Peter at the beech, the walk home.
//
//   const g = Guide.create(w); g.update(P) (each frame, from js/world.js) · Guide.goal(w, P) → { area, at } | null
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };

// Where the first thing on her list is done: a place, and in it a spot (a name in the place's spots, a point, or someone there).
function goal(w) {
  const q = w.q, cal = w.cal, off = r => q.stateOf && q.stateOf(r) === 'offered';
  if (off('maren.walk') || off('maren.homecoming')) return { area: 'home', who: 'mother' };      // (chapter one: home, along the path)
  { const V = w.P && w.P.villagers, d = V && V.dareObjective && V.dareObjective(); if (d) return /Back to Tom/.test(d) ? { area: 'village', who: 'tom' } : { area: 'village', spot: /bell/.test(d) ? 'bell' : 'dunnsDoor' }; }      // (Tom's dare, taken; and done, back to him)
  if (root.Evening && root.Evening.tableDue && root.Evening.tableDue(w)) return { area: 'home', spot: 'table' };
  if (root.Evening && root.Evening.objective(w)) return { area: 'home', who: 'mother' };
  if (root.Pie && root.Pie.objective(w)) return { area: 'home', who: 'mother' };
  if (root.AbneyPromise && root.AbneyPromise.objective(w)) return { area: 'inn', who: 'bess' };
  if (root.Peter && root.Peter.objective(w)) return { area: 'wood', spot: 'beech' };
  const ch = w.chores, e = ch && ch.on() && w.save.state.chores && w.save.state.chores.errand, E = e && root.Story.ERRANDS[e.id];
  if (E) {
    if (e.state === 'accepted' || e.state === 'broken') { if (E.needs === 'basket' && w.area === 'home' && !(w.P && w.P.motion.carry && w.P.motion.carry.kind === 'basket')) return { area: 'home', spot: 'pegs' };
      return { area: E.area || 'village', spot: E.place }; }      // (a shift: its door, in the village)
    if (e.state === 'carrying') return { area: 'home', who: 'mother' };
  }
  if (ch && ch.on() && !ch.gardenTended() && cal.minute < H('19:00')) return { area: 'village', spot: 'garden' };
  if (root.Herbs && root.Herbs.objective(w)) { const s = root.Herbs.stateOf(w); return s.asked && !s.have ? { area: 'wood', herb: s.asked } : { area: 'cabin', who: 'gran' }; }
  if (off('maren.chores')) return { area: 'home', who: 'mother' };
  return null;
}

// The way there, from where she is: the first way out on the shortest way round the places (js/world.js's AREAS).
function wayOut(AREAS, from, to) {
  const seen = { [from]: null }, Q = [from];
  while (Q.length) { const a = Q.shift(); if (a === to) break; const ex = (AREAS[a] && AREAS[a].exits) || {};
    for (const name in ex) { const b = ex[name].area; if (b in seen) continue; seen[b] = { a, name }; Q.push(b); } }
  if (!(to in seen)) return null; let at = to, step = null; while (seen[at]) { step = seen[at]; at = step.a; } return step && step.name;
}

// The point to show, in the place she's in.
function pointOf(w, P, g) {
  const W = P.world;
  if (g.area !== w.area) { const name = wayOut(w.AREAS, w.area, g.area); const ex = name && W.exits.find(e => e.name === name);
    if (!ex) return null; const gate = W.gate && W.gate.to === name && W.gate.at; return (gate || ex.at).clone(); }      // (a gate: at the gate itself, not past it)
  if (g.who === 'mother' || g.who === 'gran' || (g.who && P.npc && P.npc.key === g.who)) return P.npcMotion ? P.npcMotion.pos.clone() : null;
  if (g.who) { const f = P.figure(g.who); return f ? f.motion.pos.clone() : null; }
  if (g.herb) return W.herbs && W.herbs[g.herb] ? W.herbs[g.herb].clone() : null;
  if (g.spot === 'garden' && root.Garden && root.Garden.inside(P.motion.pos)) return null;      // (in the garden, its own marks show what's to do)
  if (g.spot === 'table') { const t = W.surfaces.find(s => s.name === 'the table'); return t ? new V3((t.x0 + t.x1) / 2, 0, (t.z0 + t.z1) / 2) : null; }
  if (g.spot === 'pegs') { const it = W.items.find(x => x.kind === 'basket' && x.peg); return it ? it.obj.position.clone() : null; }
  if (g.spot) { const s = (W.spots && W.spots[g.spot]) || (P.stage.cottage && P.stage.cottage.spots && P.stage.cottage.spots[g.spot]); return s ? s.at.clone() : null; }
  return null;
}

const CSS = `#guideArrow { position: fixed; z-index: 20; width: 34px; height: 34px; margin: -17px 0 0 -17px; pointer-events: none; display: none; filter: drop-shadow(0 1px 3px #000); }
#guideArrow svg { width: 100%; height: 100%; } #guideArrow.on { display: block; }
body.correcting #guideArrow, body.talking #guideArrow { display: none !important; }`;
function create(w) {
  let el = null, ring = null, ringP = null, t = 0;
  function dom() {
    if (el) return el; const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    el = document.createElement('div'); el.id = 'guideArrow'; el.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2 L21 20 L12 15 L3 20 Z" fill="#f2d27a" stroke="#3a2a1a" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    document.body.appendChild(el); return el;
  }
  function makeRing(P) {
    const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: 0xf2d27a, transparent: true, opacity: 0.8, depthWrite: false });
    const m = new THREE.Mesh(new THREE.RingGeometry(5, 6.4, 40), mat); m.rotation.x = -Math.PI / 2; m.position.y = 0.3; g.add(m);
    const m2 = new THREE.Mesh(new THREE.RingGeometry(7.6, 8.2, 40), mat.clone()); m2.rotation.x = -Math.PI / 2; m2.position.y = 0.3; g.add(m2);
    g.renderOrder = 5; P.stage.scene.add(g); return g;
  }
  function update(P, dt) {
    const a = dom(); if (!P || !P.stage) { a.classList.remove('on'); return; }
    if (ringP !== P) { ring = makeRing(P); ringP = P; }
    t += dt || 0.016;
    const g = goal(w), at = g && pointOf(w, P, g), busy = P.busy || (P.talk && P.talk.playing);
    ring.visible = !!at && !busy; if (!at || busy) { a.classList.remove('on'); return; }
    ring.position.set(at.x, 0, at.z); const s = 1 + 0.08 * Math.sin(t * 3); ring.scale.set(s, 1, s);
    // (the arrow: at the edge of the view, toward it, when it's out of sight or far off; none when it's near and in view)
    const cam = P.stage.camera, v = at.clone().setY(4).project(cam), behind = v.z > 1, near = P.motion.pos.distanceTo(at) < 40;
    const inView = !behind && Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.9;
    if (inView && near) { a.classList.remove('on'); return; }
    const W_ = innerWidth, H_ = innerHeight; let x = v.x, y = v.y; if (behind) { x = -x; y = -y; }
    let px, py, ang;
    if (inView) { px = (x + 1) / 2 * W_; py = (1 - y) / 2 * H_ - 30; ang = Math.PI; }      // (over it, pointing down at it)
    else { const k = 0.88 / Math.max(Math.abs(x), Math.abs(y), 1e-3); x *= k; y *= k; px = (x + 1) / 2 * W_; py = (1 - y) / 2 * H_; ang = Math.atan2(x, y); }
    a.style.left = px + 'px'; a.style.top = py + 'px'; a.style.transform = 'rotate(' + ang + 'rad)'; a.classList.add('on');
  }
  return { update };
}

const api = { create, goal, wayOut };
root.Guide = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
