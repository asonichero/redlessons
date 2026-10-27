// Little Red’s Lessons — the world: the places Red goes (the cottage, the wood, her grandmother's cabin; the village and the rest to come), the
// way between them, and the game that carries on across them: the saved game (js/save.js), the calendar (js/calendar.js), her reputation
// (js/reputation.js) and the quests (js/quests.js, js/questdata.js).
//
// Going into a place builds it (js/play.js), puts her at the way she came in, and asks the quests what's on offer there: a step with a scene
// (registered with World.scene(name, { prepare(opts, w, step), run(P, w, step) })) is played. Time passes as she goes about (a game minute
// a second, not while she's talking or busy), the light follows it, and where she is is kept, so the game can be taken up again where it was left.
//
//   const w = World.create(view, { fade, objective, card, clock, hud })
//   w.newGame() · w.resume() · w.startAt('wood' | 'home' | 'village') (a new game, from there; the village: the morning after chapter one) · w.go(area, entry) · w.P (the place being played)
//   w.save · w.cal · w.rep · w.q · w.complete('line.step') · w.objective(text) · w.journal()
(function (root) {
'use strict';
const THREE = root.THREE, V3 = THREE.Vector3;
const SCENES = {};
const scene = (name, def) => { SCENES[name] = def; };

// Hulda, as she is in her cabin when she's not at the tea table.
const HULDA = { id: 'gran', key: 'gran', name: 'Grandmother', voice: 'gran', tint: '#5a6a3a', bg: '#e4e8d6' };

// The places: how each is built, who's there, the ways in (entries: where she stands, which way she faces) and the ways out (exits, by the name
// the place gives them: to where, and in by which way).
// Bess in her chair by the inn's fire (she's not to be on her feet), to talk to, and to work for.
function seatBess(P) {
  const seat = P.world.bessChair; if (!seat) return;
  const looks = root.Looks && root.Looks.load ? root.Looks.load() : {}, rig = root.Toon.make('abneyDaughter', looks.abneyDaughter || {}), motion = root.Motion.create(rig, {});
  const fw = new V3(Math.sin(seat.facing), 0, Math.cos(seat.facing)); motion.warp(seat.at.clone().setY(0).addScaledVector(fw, 0.5), seat.facing); motion.sit(seat); motion.sitW = 1;
  P.addFigure('bess', { rig, motion, cast: { name: 'Bess', voice: 'bess', tint: '#6a4a5a', bg: '#ecdde4' } });
  P.tick(dt => { motion.update(dt, null); rig.tick(dt); });
  const i = P.world.seats.indexOf(seat); if (i >= 0) P.world.seats.splice(i, 1);
}
const AREAS = {
  cabin: {
    name: 'Grandmother’s', music: 'hearth', set: s => root.Cabin.build(s), npc: () => Object.assign({ at: [-22, 17], yaw: Math.PI / 2 }, HULDA), talk: () => root.Story.granAgain(),      // (npc: by her rocking chair and the hearth, facing into the room)
    entries: { door: { at: [-10, 26], yaw: Math.PI }, chapter: { at: [-2, 7], yaw: Math.PI } },
    exits: { 'the wood': { area: 'wood', entry: 'cabin' } },
    // (once she has the cloak, its parcel is gone from the dresser)
    dress(P, w) { const g = P.world.gift; if (g && w.q.done('hulda.cloak')) { g.obj.visible = false; const i = P.world.items.indexOf(g); if (i >= 0) P.world.items.splice(i, 1); }
      if (root.IntoWood) root.IntoWood.cabin(P, w); },      // (Holt at the table, the first visit after the herbs: js/intowood.js)
  },
  wood: {
    name: 'The wood', music: 'wood', set: s => root.Wood.build(s), npc: null, followCam: true, camBack: [78, 30], outdoors: true,
    dress(P, w) { const ex = P.world.exits.find(e => e.name === 'the Fowlers’'); if (ex) ex.when = () => w.q.done('maren.walk');      // (not on chapter one's walk home: straight home, that night)
      let said = -99; P.world.forkShut = () => !w.q.done('maren.walk');
      P.world.onForkShut = () => { const t = performance.now() / 1000; if (t - said < 8 || !P.talk) return; said = t; P.talk.muse(root.Story.forkShut(), { face: 'wince' }); }; },
    entries: 'set',      // (the wood gives its own: from the cabin, from the village end)
    exits: { 'the village': { area: 'village', entry: 'wood' }, 'the cabin': { area: 'cabin', entry: 'door' }, 'the Fowlers’': { area: 'holding', entry: 'lane' } },
  },
  // The village (js/village.js): the green, the inn, the bakery, the forge, the cottages; her own door, and the lane back to the wood.
  village: {
    name: 'The village', music: 'village', set: s => root.Village.build(s), npc: null, followCam: true, camBack: [78, 30], outdoors: true,
    entries: 'set',      // (its own: in from the wood at the meadow gate; out of her door)
    exits: { 'the meadow': { area: 'wood', entry: 'village' }, 'the door': { area: 'home', entry: 'door' } },      // (the meadow: through the meadow gate, js/wood.js's far end)
  },
  // The Fowlers' smallholding (js/holding.js): where the meadow meets the wood, off the fork from the meadow. Peter and his grandfather.
  holding: {
    name: 'The Fowlers’', music: 'village', set: s => root.Holding.build(s), npc: null, followCam: true, camBack: [78, 30], outdoors: true,
    entries: 'set', exits: { 'the wood': { area: 'wood', entry: 'fowlers' } },
  },
  // The inn, inside (js/inn.js): the Wheatsheaf's taproom. Mistress Abney at her counter, Bess in her chair by the fire. (Where the afternoon's
  // work is worked (js/work.js), and the evening sat with Bess (js/promise.js: AbneyPromise).)
  inn: {
    name: 'The Wheatsheaf', music: 'hearth', set: s => root.Inn.build(s), npc: () => ({ id: 'abney', key: 'abney', name: 'Mistress Abney', at: [18, 2], yaw: 0, voice: 'abney', tint: '#4a4a6a', bg: '#e0e0ea' }),
    talk: () => root.Story.abneyIdle(),
    dress(P, w) { seatBess(P); if (root.Work) P.work = root.Work.attach(P, w); if (root.AbneyPromise) P.promise = root.AbneyPromise.inn(P, w); },
    entries: { door: { at: [4, 26], yaw: Math.PI } },
    exits: { 'the door': { area: 'village', entry: 'inn' } },
  },
  // The bakery, inside (js/bakery.js): Mistress Pennock's. (Where the morning's help is worked (js/work.js), and the pie's end.)
  bakery: {
    name: 'The bakery', music: 'home', set: s => root.Bakery.build(s), npc: () => ({ id: 'pennock', key: 'pennock', name: 'Mistress Pennock', at: [8, -4], yaw: Math.PI, voice: 'pennock', tint: '#8a5a3a', bg: '#f0e2d2' }),
    talk: () => root.Story.pennockIdle(),
    dress(P, w) { if (root.Work) P.work = root.Work.attach(P, w); },      // (the morning's work, if she's come to help)
    entries: { door: { at: [-22, 26], yaw: Math.PI } },
    exits: { 'the door': { area: 'village', entry: 'bakery' } },
  },
  // The Ferriers' cottage, in the mill lane (a cottage much like her own: js/cottage.js): where Master Ferrier takes Tom in hand, and Red with
  // him, once she's asked for the same standard (js/inhand.js).
  ferriers: {
    name: 'The Ferriers’', music: 'home', npc: () => ({ id: 'smith', key: 'smith', name: 'Master Ferrier', at: [-12, 20], yaw: Math.PI, voice: 'smith', tint: '#4a3a32', bg: '#e4dcd4' }),
    talk: () => [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Off home with you, lass. Your mother’ll be wanting you.' }],
    entries: { door: { at: [-44, 31], yaw: Math.PI / 2 } },
    exits: { 'the door': { area: 'village', entry: 'ferriers' } },
  },
  home: {
    name: 'Home', music: 'home', npc: undefined,      // (the cottage, and her mother: js/play.js's own)
    // (her cloak on its hook by the door, if she has one and isn't wearing it)
    dress(P, w) { const h = P.world.cloakHooks; if (h) h.setRed(w.q.done('hulda.cloak') && P.outfit === 'No cloak'); },
    entries: { door: { at: [-44, 31], yaw: Math.PI / 2 }, bed: { at: [-30, -10], yaw: Math.PI / 2 } },      // (bed: up, and out from it into the room, in the morning)
    exits: { 'the door': { area: 'village', entry: 'home' } },      // (out of her door into the village)
  },
};

const RATE = 2;      // (game minutes a second, while she's about: a day from seven to the bell in seven minutes)
function create(view, ui) {
  ui = ui || {};
  const save = root.Save.create(), cal = root.Calendar.create(save), rep = root.Reputation.create(save);
  let areaName = null, P = null, going = null, lightFn = null, timeOn = true, sinceSave = 0, sceneNow = null;
  const q = root.Quests.create(save, root.QuestData, { rep, cal, area: () => areaName });
  const fade = async (on, text) => { if (ui.fade) await ui.fade(on, text); };
  const w = {
    save, cal, rep, q, AREAS, SCENES,
    get P() { return P; }, get area() { return areaName; }, get scene() { return sceneNow; },
    fade, ui,
    complete(ref) { const r = q.complete(ref); refresh(); return r; },
    objective(t) { if (ui.quests) ui.quests(t ? [t] : []); else if (ui.objective) ui.objective(t); },      // (a scene's own, on its own)
    // (a scene may take over the light, or stop time passing, while it plays)
    light(fn) { lightFn = fn; }, time(on) { timeOn = on; },
    wait: s => (P ? P.wait(s) : new Promise(r => setTimeout(r, s * 1000))),
    go, newGame, resume, startAt, journal, refresh, morning, tableau, tableauMusic,
  };

  // The days: the garden and the errands (js/chores.js), once the chores are agreed.
  const chores = root.Chores ? root.Chores.create(w) : null; w.chores = chores;
  const guide = root.Guide && typeof document !== 'undefined' ? root.Guide.create(w) : null;

  // What to say she's about: the day's own (the errand, the garden), or the first step on offer here with a hint; or else, the main story's, or
  // the first begun line's, and where.
  function refresh() {
    if (ui.clock) ui.clock('Day ' + cal.day + ' · ' + cal.clock, q.phaseOf(q.phase()));
    if (sceneNow && sceneNow.ownObjective) return;
    // (everything that's hers now: the day's (the errand, the garden, the evening's matters), and the steps on offer that can be played yet (a
    // step with a scene, or one the place itself handles), those here first; the diary has the rest)
    const ready = s => s.hint && ((s.scene && SCENES[s.scene]) || s.talk);
    const steps = q.offered({ where: areaName }).filter(ready).concat(q.offered().filter(ready)).map(s => s.hint);
    const list = [...new Set((chores ? chores.objectives() : []).concat(steps))].slice(0, 4);
    if (ui.quests) ui.quests(list); else if (ui.objective) ui.objective(list[0] || '');
  }
  function journal() {
    const ph = q.phaseOf(q.phase());
    const today = chores && chores.journalLine();
    return { phase: ph, clock: 'Day ' + cal.day + ', ' + cal.clock, lines: (today ? [today] : []).concat(q.journal().map(j => Object.assign({}, j, { where: j.step && j.step.where }))) };
  }

  // ── Going somewhere: out of the place she's in (under a fade), the new one built, her put at the way in, and its scene, if one's on offer, played.
  async function go(name, entry, how) {      // (how.walked: she walked in, of her own accord, by a way out of the last place)
    if (going) return going;
    going = (async () => {
      const A = AREAS[name]; if (!A) throw new Error('World: no place ' + name);
      const step = q.offered({ where: name }).find(s => s.scene && SCENES[s.scene]);
      const sc = step ? SCENES[step.scene] : null;
      await fade(true, sc && sc.establish ? '' : A.name);
      const held = P && chores ? chores.carried(P) : null;      // (what's in her hands, to be in them still)
      if (P) { P.dispose(); P = null; }
      if (backdrop) { backdrop.dispose(); backdrop = null; }      // (the title's tableau)
      // (a scene can open on an establishing shot: another place seen from outside, without her, the camera easing in; then a fade, and the scene)
      if (sc && sc.establish) await establish(sc.establish, A.name);
      areaName = name; lightFn = null; timeOn = true; sceneNow = sc;
      let opts = baseOpts(name, entry);
      if (sc && sc.prepare) opts = sc.prepare(opts, w, step) || opts;
      P = root.Play.create(view, opts);
      if (opts.place) opts.place(P);
      if (A.dress) A.dress(P, w);
      if (chores) chores.dress(P, held);      // (whatever she's carrying, still in her hands)
      P.tick(dt => frame(dt));
      { const Au = root.GameAudio; if (Au && Au.startMusic && A.music) Au.startMusic({ theme: (sc && sc.music) || A.music }); }      // (each place its own music; a scene can have its own)
      save.change(s => { s.area = name; }, { area: name });
      refresh();
      if (sc && sc.run) sc.run(P, w, step);
      else if (name === 'home' && entry === 'door' && how && how.walked) homeAgain();
      // (under the fade, the scene's own first shot settles before it opens: its conversation under way, the camera on them)
      if (sc && sc.establish) { const t0 = performance.now(); while (performance.now() - t0 < 4000 && !(P.talk && P.talk.playing)) await new Promise(r => setTimeout(r, 50)); await new Promise(r => setTimeout(r, 150)); }
      await fade(false);
    })();
    try { await going; } finally { going = null; }
  }
  async function establish(e, title) {
    const E = shot(e), V = a => new V3(a[0], a[1], a[2]);
    { const Au = root.GameAudio; if (Au && Au.startMusic && e.music) Au.startMusic({ theme: e.music }); }      // (its own music, if it has one)
    E.stage.go(V(e.to), V(e.look), e.secs * 1000);
    await fade(false, title); await new Promise(r => setTimeout(r, Math.max(0, e.secs * 1000 - 1400)));
    await fade(true, ''); E.dispose();
  }
  // A place seen from outside, without her, the camera at the shot's start (e: an establishing shot: { area, entry, from, look }), held there.
  function shot(e) {
    const E = root.Play.create(view, Object.assign(baseOpts(e.area, e.entry), { onExit: null, followCam: false, camFree: true, light: cal.light() }));
    E.rig.root.visible = false; E.stage.controls.enabled = false; E.stage.controls.maxDistance = 1000; root.__establishing = E; if (E.npc) E.npc.root.visible = false;
    const V = a => new V3(a[0], a[1], a[2]);
    // (whatever stands between the camera and the cabin, a tree or a bush, is left out of the shot, from anywhere along its move)
    { const look = V(e.look), seg = (a, p, r) => { const d = look.clone().sub(a), t = THREE.MathUtils.clamp(p.clone().sub(a).dot(d) / d.lengthSq(), 0, 1); return t > 0.02 && t < 0.9 && a.clone().addScaledVector(d, t).distanceTo(p) < r + 3; };
      E.stage.scene.updateMatrixWorld(true);
      E.stage.scene.traverse(o => { if (!o.isMesh || !o.geometry) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const bs = o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld);
        if (bs.radius > 140) return; for (let q = o.parent; q; q = q.parent) if (q.userData && q.userData.cabin) return; for (let k = 0; k <= 4; k++) if (seg(V(e.from).lerp(V(e.to), k / 4), bs.center, bs.radius)) { o.visible = false; break; } }); }      // (never the cabin itself)
    E.stage.go(V(e.from), V(e.look), 0);
    return E;
  }
  // The title's tableau, behind its menu, as a still picture: with no game saved, the first frame of the opening (the first scene's establishing
  // shot); with one, the end of the homecoming: the two of them asleep in her mother's bed, at night (js/bed.js). The scene is set, let settle
  // (faces, hair) a moment by hand, drawn once and taken as a picture, and put away again. → a promise of the picture (a data URL).
  let backdrop = null;
  // (and the music that goes with it: the opening's, or bedtime's)
  function tableauMusic(kind) { return kind === 'saved' && root.Bed ? 'bed' : ((Object.values(SCENES).find(s => s.establish) || {}).establish || {}).music || null; }
  async function tableau(kind) {
    let E = null, b = null;
    if (kind === 'saved' && root.Bed) {
      E = root.Play.create(view, Object.assign(baseOpts('home', 'bed'), { onExit: null, camFree: true, light: 0.85 }));
      E.rig.root.visible = false; if (E.npc) E.npc.root.visible = false; E.stage.controls.enabled = false; E.camHeld = true;
      b = root.Bed.scene(E.stage, E.world); E.tick(dt => b.tick(dt)); const v = b.shot({ far: 1.5, right: 0.3 }); E.stage.go(v.pos, v.look, 0);      // (back, and to the right of the menu)
      b.big.setExpr('asleep', 60); b.small.setExpr('asleep', 60);
    } else {
      const first = Object.values(SCENES).find(s => s.establish); if (!first) return null;
      E = shot(first.establish);
    }
    backdrop = E; E.stage.held = true;      // (its own loop idle: stepped here instead)
    await new Promise(r => requestAnimationFrame(r));
    for (let i = 0; i < 45; i++) E.frame(1 / 30);
    E.stage.draw(); const url = E.stage.renderer.domElement.toDataURL('image/jpeg', 0.92);
    if (backdrop === E) { E.dispose(); backdrop = null; }
    return url;
  }
  function baseOpts(name, entry) {
    const A = AREAS[name], o = { set: A.set, followCam: A.followCam, camBack: A.camBack, noRun: !!A.noRun, light: cal.light() };      // (noRun: walking only: the wood, on her way home)
    if (A.npc !== undefined) o.npc = typeof A.npc === 'function' ? A.npc() : A.npc;
    // (where she comes in: the saved place, when taking the game up again; the way she came in; or the place's first)
    const saved = entry === 'saved' && save.state.at, list = A.entries === 'set' ? null : A.entries;
    let e = saved ? { at: [save.state.at[0], save.state.at[1]], yaw: save.state.at[2] } : list ? (list[entry] || list[Object.keys(list)[0]]) : null;
    if (!e && A.entries === 'set') o.place = P_ => { const es = P_.world.entries || {}, x = es[entry] || es[Object.keys(es)[0]]; if (x) { P_.motion.warp(new V3(x.at[0], 0, x.at[1]), x.yaw); P_.rig.root.position.set(x.at[0], 0, x.at[1]); placeCam(P_, x); } };
    if (e) o.start = { at: e.at, yaw: e.yaw };
    if (e && e.camTurn != null) o.camTurn = e.camTurn;
    o.onExit = ex => { const to = A.exits[ex.name]; if (!to) return;
      if (name === 'home' && chores && chores.forgot(P)) { P.act(() => chores.remind(P)); return false; }      // (out for the eggs without a basket: her mother calls her back)
      if (o.leaving) o.leaving(ex, to); go(to.area, to.entry, { walked: true }); };
    // Talking: whatever's on offer with whoever's here, or their word for the time of day.
    if (name === 'home') {
      let pending = null;
      o.talk = () => { pending = q.offered({ where: 'home', who: 'maren' }).find(s => s.ref === 'maren.chores') ? 'maren.chores' : null; return pending === 'maren.chores' ? root.Story.chores() : root.Story.marenIdle(cal.part); };
      o.after = async kind => { if (kind === 'talk' && pending === 'maren.chores') { save.flag('curfew-agreed'); w.complete('maren.chores'); } pending = null; };
      o.actions = () => sleepAction().concat(chores ? chores.actions(P, 'home') : []);
    } else if (A.talk) o.talk = A.talk;
    // (the village: the day's chores, and its people, about their days: js/villagers.js)
    if (name === 'village') { o.place = chain(o.place, P_ => { P_.villagers = root.Villagers ? root.Villagers.attach(P_, w) : null; P_.garden = root.Garden ? root.Garden.attach(P_, w) : null; });
      o.actions = () => (chores ? chores.actions(P, 'village') : []).concat(P && P.villagers ? P.villagers.actions() : [], gateAction()); }
    if (name === 'wood') { o.actions = () => gateAction().concat(P && P.herbs ? P.herbs.actions() : [], P && P.world.signpost ? [{ label: 'Read the signpost', at: P.world.signpost, run: () => P.converse(root.Story.signpost(), { shot: false, keepCamera: true }) }] : []); o.place = chain(o.place, P_ => { P_.peter = root.Peter ? root.Peter.wood(P_, w) : null; P_.herbs = root.Herbs ? root.Herbs.wood(P_, w) : null; P_.stranger = root.IntoWood ? root.IntoWood.wood(P_, w) : null; }); }      // (Hulda's herbs, gathered: js/herbs.js)
    if (name === 'cabin' && root.Herbs) o.talk = () => root.Herbs.talk(w);      // (her grandmother: the herb errands)      // (the beech: Peter's notes, and meeting him there)
    if (name === 'holding') { o.place = chain(o.place, P_ => { P_.fowlers = root.Holding ? root.Holding.people(P_, w) : null; }); o.actions = () => (P && P.fowlers ? P.fowlers.actions() : []).concat(chores ? chores.actions(P, 'holding') : []); }      // (and the eggs, when she's come for them)
    return o;
  }
  const chain = (a, b) => a ? P_ => { a(P_); b(P_); } : b;
  // The meadow gate (a set's world.gate: the village's, and the meadow's at the wood's far end): offered from close by, it's opened, and she
  // goes through it, out of the one place and into the other (by the exit just past it). Not while it's barred to her.
  function gateAction() {
    const P_ = P, g = P_ && P_.world.gate; if (!g) return [];
    if (g.barred && g.barred()) return [];      // (barred: the Watchman walking her home)
    return [{ label: 'Go through the gate', at: g.at.clone().setY(14), run: async () => { const m = P_.motion, yaw = Math.atan2(g.beyond.x - g.at.x, g.beyond.z - g.at.z);
      const hand = m.carry ? 'L' : 'R';      /* (a free hand for the latch: the bluebells, or a basket, in the other) */
      await m.goTo(g.at, yaw); m.reach(hand, g.at.clone().lerp(g.beyond, 0.4).setY(11)); await P_.wait(0.3); g.target = 1; await m.release(hand); await P_.wait(0.7); P_.exitBy(g.to); } }];      // (opened: through it, into the other place)
  }
  // (from the wood's own entries, the camera behind her as she comes in)
  function placeCam(P_, x) {
    const st = P_.stage, t = P_.motion.pos.clone().setY(20 * P_.rig.scaleW), y = x.yaw + (x.camTurn || 0), back = new V3(-Math.sin(y), 0, -Math.cos(y)).multiplyScalar(34);      // (camTurn: round from behind her, as the entry asks)
    st.controls.target.copy(t); st.camera.position.copy(t).add(back).setY(t.y + 8); st.controls.update();
  }
  // Home of her own accord: her mother's word with her (js/evening.js): after six, whatever's owed, then supper and bed; before, only what can't wait.
  function homeAgain() {
    const P_ = P; if (!root.Evening || !(chores && chores.on())) return;
    P_.act(() => root.Evening.home(P_, w));
  }
  // To bed, at home, from the evening on: the night passes, and it's the morning.
  function sleepAction() {
    const P_ = P; if (!P_ || !['evening', 'dusk', 'night'].includes(cal.part)) return [];
    const bed = P_.world.seats.find(s => s.kind === 'bed'); if (!bed) return [];
    return [{ label: 'Sleep until morning', at: bed.at, run: async () => { if (root.Evening && chores && chores.on()) await root.Evening.home(P_, w, { bed: true }); else await morning(); } }];      // (her mother's word with her first: js/evening.js; then the night)
  }

  // Each frame: time passing as she goes about, the light with it, her place kept every few seconds.
  function frame(dt) {
    if (!P) return;
    const idle = !P.busy && !(P.talk && P.talk.playing) && !document.body.classList.contains('correcting');
    if (timeOn && idle) { const d0 = cal.day, m0 = cal.minute; cal.tick(dt, RATE); if (cal.minute !== m0 || cal.day !== d0) refreshClock(); }
    if (chores && idle) chores.tick(P);      // (a promise let slide; the garden left)
    if (guide) guide.update(P, dt);      // (the way to what's hers to do: js/guide.js)
    P.stage.setLight(lightFn ? lightFn() : cal.light());
    { const Au = root.GameAudio; if (Au && Au.musicTheme === 'wood' && Au.nodes.musicFilter) Au.nodes.musicFilter.frequency.value = 2200 - 1400 * cal.light(); }      // (the wood's music darkening with the light)
    if ((sinceSave += dt) > 3 && idle) { sinceSave = 0; const m = P.motion; save.change(s => { s.at = [Math.round(m.pos.x * 10) / 10, Math.round(m.pos.z * 10) / 10, Math.round(m.yaw * 100) / 100]; }, { at: true }); }
  }
  let lastClock = ''; function refreshClock() { const c = 'Day ' + cal.day + ' · ' + cal.clock; if (c !== lastClock && ui.clock) { lastClock = c; ui.clock(c, q.phaseOf(q.phase())); } }

  // The next morning: the night passes (under a fade), and she's up, at home.
  // (and over breakfast her mother asks what's been asked of them: js/chores.js)
  async function morning(text) { await fade(true, text || ''); cal.sleep(); await go('home', 'bed'); const P_ = P; if (!P_) return;
    if (chores && chores.on()) P_.act(() => chores.breakfast(P_));
    else if (q.stateOf('maren.chores') === 'offered') P_.act(() => P_.talkToMother());      // (the first morning: straight to her mother, to agree what's hers to do)
  }

  // ── Starting.
  async function newGame() { save.reset(); await go('cabin', 'chapter'); }
  async function resume() { const a = save.state.area && AREAS[save.state.area] ? save.state.area : 'home'; await go(a, 'saved'); }
  // (a new game from a later point of chapter one: what came before it counted as done)
  async function startAt(where) {
    save.reset();
    if (where === 'wood' || where === 'home') { q.complete('hulda.cloak'); cal.until('17:00'); }
    if (where === 'home') { q.complete('maren.walk'); cal.until('19:40'); }
    // (the village: chapter one done, the next morning, out of her door)
    if (where === 'village') { q.complete('hulda.cloak'); q.complete('maren.walk'); q.complete('maren.homecoming'); save.change(s => { s.day = 2; s.minute = 10 * 60; }, { time: true }); }
    await go(where, where === 'wood' ? 'cabin' : where === 'village' ? 'home' : 'door');
  }
  q.on(() => refresh());
  return w;
}

const api = { create, scene, AREAS, SCENES };
root.World = api;
})(typeof window !== 'undefined' ? window : globalThis);
