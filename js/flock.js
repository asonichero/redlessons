// Little Red’s Lessons — Bo Peep and her grandfather's flock. Every evening at five she brings them in from Halloran's farm: in at the east
// gate, along the street, and up the lane to the pinfold, where they're penned for the night (js/village.js's pinfold). Not an errand: some
// days they won't mind her, and scatter about the street's east end, and she runs to Red for help. Helping, Red goes after the strays (near
// enough, and each trots off back to the pinfold); Bo brings in what she can. Bo's eighteen, and young for it; she looks up to Rose.
//
//   const f = Flock.attach(P, w) (the village) → { actions(), goal() } · Flock.scatters(day) · Flock.goal(w) (for js/guide.js)
// Kept in the save (state.flock): { day, talked (a day), asked (a day: she came to Red), help ('yes' | 'no'), done (a day: all in) }.
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE && THREE.Vector3;
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
function hash(day, k) { let h = (day * 374761393 + k * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519); h ^= h >>> 13; return (h >>> 0) / 4294967296; }
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
const N = 9, IN = H('17:00'), WALK = 20, LATE = H('18:30');      // (nine of them; in at five, twenty minutes from the gate to the pen; by half past six, Bo's managed alone)
const CAST = { name: 'Bo', voice: 'bo', tint: '#8a5a6a', bg: '#f2e4ea' };
// (the way in: from the east gate along the street, up the lane to the pinfold's gate, and in)
const WAY = [[582, 52], [540, 40], [492, 26], [492, -12], [492, -48]];
const SCATTER_AT = 0.45, HOME = new V3(500, 0, 30), SPREAD = 85;
const scatters = day => day >= 3 && hash(day, 41) < 0.3;      // (about one evening in three, after the first few, they won't mind her)
let active = null;      // (the flock in the village being played, for the guide)

// A sheep, standing: woolly, black-faced, black-legged.
function sheep(T) {
  const g = new THREE.Group(), wool = T.mat('#ece6d6'), face = T.mat('#2e2a28');
  const add = (geo, mat, x, y, z, ink) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.add(new THREE.Mesh(T.hullGeo(geo, ink), T.INKM[0])); m.castShadow = true; g.add(m); return m; };
  const body = new THREE.Group(); g.add(body);
  const b = add(T.ell(3.2, 2.6, 4.4, 12, 8), wool, 0, 4.6, 0, 0.07); body.add(b);
  const hd = add(T.ell(1.1, 1.4, 1.7, 8, 6), face, 0, 5.8, 4.4, 0.05); body.add(hd);
  const legs = [];
  for (const [lx, lz] of [[-1.6, 2.4], [1.6, 2.4], [-1.6, -2.4], [1.6, -2.4]]) { const l = add(new THREE.CylinderGeometry(0.45, 0.4, 3.4, 6), face, lx, 1.7, lz, 0.03); legs.push(l); }
  return { obj: g, body, legs, phase: Math.random() * 6 };
}

function attach(P, w) {
  const W = P.world, S = root.Story, cal = w.cal, rep = w.rep, save = w.save, T = root.Toon;
  if (!W.spots || !T || !root.Motion) return null;
  const st = () => { const f = save.state.flock || (save.state.flock = { day: 0 }); if (f.day !== cal.day) { f.day = cal.day; f.asked = 0; f.help = null; f.done = 0; } return f; };
  const change = fn => save.change(s => { st(); fn(s.flock); }, { flock: true });
  if (save.state.trust && save.state.trust.bo == null) save.change(s => { s.trust.bo = 2; }, { trust: 'bo' });      // (she's looked up to Rose for years: two, before a word in the game)
  const way = WAY.map(([x, z]) => new V3(x, 0, z)), lens = []; let total = 0;
  for (let i = 1; i < way.length; i++) { const d = way[i].distanceTo(way[i - 1]); lens.push(d); total += d; }
  const along = s => { s = Math.max(0, Math.min(total, s)); for (let i = 0; i < lens.length; i++) { if (s <= lens[i]) return way[i].clone().lerp(way[i + 1], s / lens[i]); s -= lens[i]; } return way[way.length - 1].clone(); };
  const gate = way[3].clone(), pen = way[4].clone();

  // The sheep, and Bo: made when they're due in the village, gone when they're penned (the pinfold's own sheep shown then).
  let flock = null, bo = null, scattered = false, lost = 0, boBusy = false, boT = 0, thanking = false;
  function make() {
    flock = []; for (let k = 0; k < N; k++) { const s = sheep(T); P.stage.scene.add(s.obj); s.k = k; s.state = 'walk'; s.lat = (hash(cal.day, 100 + k) - 0.5) * 10; flock.push(s); }
    const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}, rig = T.make('bo', looks.bo || {}), motion = root.Motion.create(rig, { collide: (p, r) => P.collide(p, r, 'bo') });
    const at = along(0); motion.warp(at, yawTo(at, way[1])); rig.root.position.copy(at);
    P.addFigure('bo', { rig, motion, cast: CAST }); bo = { rig, motion }; P.tick(dt => { if (!bo || bo.rig !== rig) return; motion.update(dt, null); rig.tick(dt); });
  }
  function unmake() {
    if (flock) for (const s of flock) P.stage.scene.remove(s.obj); flock = null;
    if (bo) { P.removeFigure('bo'); bo = null; }
  }
  const penned = () => { const m = cal.minute, f = st(); return m >= IN + WALK + 2 && !(scattered && !f.done && m < LATE); };
  W.flockPenned = false;

  // Each moment: where they are along the way (by the clock), or out about the street, scattered; and the strays brought in.
  P.tick(dt => {
    const m = cal.minute, f = st(), sc = scatters(cal.day);
    W.flockPenned = m < H('5:30') || penned();      // (in the pen overnight; out at dawn)
    const due = thanking || m >= IN && m < IN + WALK + 6 && !(sc && f.done) || (sc && m >= IN + WALK * SCATTER_AT && m < LATE && !f.done);      // (thanking: kept till she's said it, and gone off)
    if (due && !flock) { make(); scattered = false; }
    if (!due && flock) { unmake(); return; }
    if (!flock) return;
    const prog = (m - IN + cal.frac()) / WALK;
    if (sc && !scattered && prog >= SCATTER_AT) scatter();
    for (const s of flock) {
      const o = s.obj;
      if (s.state === 'walk') { const p = along(prog * total + (N - s.k) * 7).add(new V3(s.lat, 0, 0)),      // (strung out ahead of her, the first already well in)
        d = p.clone().sub(o.position); if (d.lengthSq() > 0.01) o.rotation.y = Math.atan2(d.x, d.z); o.position.copy(p); trot(s, dt, 1); if (prog * total + (N - s.k) * 7 >= total) o.visible = false; }
      else if (s.state === 'loose') {
        const to = s.to, d = to.clone().sub(o.position).setY(0);
        if (d.length() > 1) { d.normalize(); o.position.addScaledVector(d, Math.min(26 * dt, o.position.distanceTo(to))); o.rotation.y = Math.atan2(d.x, d.z); trot(s, dt, 1.6); }
        else { trot(s, dt, 0); s.graze = (s.graze || 0) - dt; if (s.graze < 0) { s.graze = 4 + Math.random() * 6; s.to = P.collide(o.position.clone().add(new V3((Math.random() - 0.5) * 16, 0, (Math.random() - 0.5) * 16)), 4); } }
        if (f.help === 'yes' && !P.talk.playing && P.motion.pos.distanceTo(o.position) < 16) home_(s);      // (near enough: off she trots, home)
      }
      else if (s.state === 'home') {
        const to = s.path[0], d = to.clone().sub(o.position).setY(0);
        if (d.length() < 2) { s.path.shift(); if (!s.path.length) { s.state = 'in'; o.visible = false; lost--; if (!lost) allIn(); continue; } }
        d.normalize(); o.position.addScaledVector(d, 30 * dt); o.rotation.y = Math.atan2(d.x, d.z); trot(s, dt, 1.8);
      }
    }
    // (Bo: behind the flock on the way in; scattered, going after the strays one at a time, slower than Red)
    if (bo && !boBusy) {
      if (!scattered) { const p = prog > 1.05 ? along(0) : along(prog * total - 4); if (bo.motion.pos.distanceTo(p) > 1.5) bo.motion.goTo(P.collide(p, 3.2), null); }      // (penned, back out to the farm)
      else if (f.help && !P.talk.playing) { boT -= dt; if (boT < 0) { boT = 6; const s = nearestLoose(bo.motion.pos); if (s) { if (bo.motion.pos.distanceTo(s.obj.position) < 12) { home_(s); boT = f.help === 'yes' ? 14 : 8; } else bo.motion.goTo(P.collide(s.obj.position.clone().setY(0), 4), null, { run: true }); } } }
    }
    // (scattered, and Red about: Bo runs to her)
    if (scattered && !f.asked && bo && !P.busy && !boBusy && m < LATE) { boBusy = true; P.act(ask); }
  });
  function trot(s, dt, k) { s.phase += dt * 9 * k; const a = Math.sin(s.phase) * 0.5 * Math.min(1, k); s.legs[0].rotation.x = s.legs[3].rotation.x = a; s.legs[1].rotation.x = s.legs[2].rotation.x = -a; s.body.position.y = k ? Math.abs(Math.sin(s.phase)) * 0.4 : Math.sin(s.phase * 0.2) * 0.05; }
  function scatter() {
    scattered = true; lost = 0;
    for (const s of flock) { if (!s.obj.visible) { s.state = 'in'; continue; } s.state = 'loose'; lost++; const a = hash(cal.day, 200 + s.k) * Math.PI * 2, r = 30 + hash(cal.day, 300 + s.k) * SPREAD; s.to = P.collide(HOME.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r)), 4); }
    if (!lost) allIn();
  }
  const nearestLoose = p => { let best = null, bd = 1e9; for (const s of flock || []) if (s.state === 'loose') { const d = s.obj.position.distanceTo(p); if (d < bd) { bd = d; best = s; } } return best; };
  function home_(s) { s.state = 'home'; s.path = [gate.clone().add(new V3((Math.random() - 0.5) * 6, 0, 8)), gate.clone(), pen.clone()]; }
  async function ask() {
    const m = P.motion; change(x => { x.asked = cal.day; });
    const near = P.collide(m.pos.clone().setY(0).add(new V3(Math.sin(m.yaw) * 12, 0, Math.cos(m.yaw) * 12)), 3.2);
    await Promise.race([bo.motion.goTo(near, yawTo(near, m.pos), { run: true }), P.wait(12)]);
    bo.motion.face(yawTo(bo.motion.pos, m.pos)); await m.face(yawTo(m.pos, bo.motion.pos));
    let yes = false;
    await P.converse(S.boHelp({ yes: () => { yes = true; } }), { shot: ['red', 'bo'] });
    change(x => { x.help = yes ? 'yes' : 'no'; }); if (!yes) rep.trusts('bo', -0.25);
    boBusy = false; boT = 1; if (w.refresh) w.refresh();
  }
  async function allIn() {
    const f = st(); change(x => { x.done = cal.day; }); scattered = false;
    if (f.help !== 'yes' || !bo) return;
    boBusy = true; thanking = true;
    P.act(async () => {
      const m = P.motion, near = P.collide(m.pos.clone().setY(0).add(new V3(Math.sin(m.yaw) * 12, 0, Math.cos(m.yaw) * 12)), 3.2);
      await Promise.race([bo.motion.goTo(near, yawTo(near, m.pos), { run: true }), P.wait(10)]);
      bo.motion.face(yawTo(bo.motion.pos, m.pos)); await m.face(yawTo(m.pos, bo.motion.pos));
      await P.converse(S.boThanks(cal.day), { shot: ['red', 'bo'] });
      rep.trusts('bo', 0.5); if (w.refresh) w.refresh();
      await Promise.race([bo.motion.goTo(P.collide(along(0), 3.2), null), P.wait(5)]);      // (off home to the farm)
      thanking = false; boBusy = false;
    });
  }
  // (on the way in, a word with her: once a day)
  function actions() {
    const f = st(); if (!bo || scattered || boBusy || P.busy || f.talked === cal.day) return [];
    return [{ label: 'Talk to Bo', at: bo.motion.pos.clone().setY(18), run: async () => {
      change(x => { x.talked = cal.day; }); boBusy = true; const m = P.motion; await m.face(yawTo(m.pos, bo.motion.pos));
      await P.converse(S.boHello(cal.day), { shot: ['red', 'bo'] }); rep.trusts('bo', 0.5); boBusy = false; } }];
  }
  // (for the list and the guide: the strays still out, when she's said she'll help)
  function goal() { const f = st(); if (!scattered || f.help !== 'yes') return null; const s = nearestLoose(P.motion.pos); return s ? s.obj.position.clone() : null; }
  const objective = () => { const f = st(); return scattered && f.help === 'yes' && lost > 0 ? 'Help Bo bring in her strays: ' + lost + ' still loose.' : null; };
  const api = { actions, goal, objective, dispose: unmake, get sheep() { return flock; } };
  active = { P, api };
  return api;
}
const goal = w => active && w.P === active.P && w.area === 'village' ? active.api.goal() : null;
const objective = w => active && w.P === active.P && w.area === 'village' ? active.api.objective() : null;

const api = { attach, scatters, goal, objective, WAY, N };
root.Flock = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
