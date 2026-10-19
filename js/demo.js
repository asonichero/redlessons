// The sandbox: a short opening cutscene, then free play in the meadow. Everything a game built on this engine would do is here in miniature:
//   a cutscene toolkit call (G.cut, G.shot, G.say, G.choose, G.fade), the player controller (js/player.js) with an action (E) and a pick-up (Q), the hero's cloak, hood and faces,
//   a prop that can be carried and put down, a conversation at the cottage door that takes control away and gives it back, and the HUD.
// Demo.create(G, world, red, basket, hud) returns { intro(), play(), stop(), reset(save), snapshot() }.
(function (root) {
'use strict';
const THREE = root.THREE, A = root.GameAudio, V3 = THREE.Vector3, v = (x, y, z) => new V3(x, y, z), SC = 0.95, SMALL = 0.36;   // full size, and the size the cloak shrinks her to
const FACES = { '1': 'smile', '2': 'wink', '3': 'pout', '4': 'gasp' };

function create(G, world, red, basket, hud) {
  const stump = world.items.stump, hut = world.hut, door = { x: hut.x, z: hut.z + hut.d / 2 + 14 };
  const st = { carrying: false, basketAt: { x: stump.x, y: stump.y, z: stump.z }, doorBasket: false };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  let P = null;

  const placeBasket = (x, y, z) => { st.basketAt = { x, y, z }; basket.position.set(x, y + 4.6, z); basket.rotation.set(0, 0.4, 0); };
  const basketNear = p => !st.carrying && dist(p, st.basketAt) < 20 && Math.abs(P.st.y - st.basketAt.y) < 14;
  const nearDoor = p => dist(p, door) < 26;

  function take() {                                                               // Q: pick the basket up, or put it down where we stand
    const p = P.st.pos;
    if (st.carrying) {
      const x = p.x + Math.sin(P.st.heading) * 8, z = p.z + Math.cos(P.st.heading) * 8, y = world.surfaceAt(x, z).top;
      red.hold(null); basket.parent && basket.parent.remove(basket); world.scene.add(basket); placeBasket(x, y, z); st.carrying = false; hud.toast('You put the basket down.');
    } else if (basketNear(p)) {
      world.scene.remove(basket); basket.rotation.set(0, 0, 0); red.hold(basket); st.carrying = true; hud.toast('You pick up the basket.');
    } else hud.toast('Nothing to pick up here.');
  }
  function act() {                                                                // E: knock at the door when beside it, otherwise put the cloak on or take it off
    if (nearDoor(P.st.pos)) { talk(); return; }
    red.setCloak(!red.cloakOn); A && A.chime(0.6); P.scaleTo(red.cloakOn ? SMALL : SC);
    hud.toast(red.cloakOn ? 'You put on the Starweave Mantle, and the meadow grows around you.' : 'You take off the mantle and are your own size again.');
  }
  function key(k) {
    if (FACES[k]) { red.setExpr(FACES[k]); setTimeout(() => { if (red.expr === FACES[k]) red.setExpr('smile'); }, 2600); }
    else if (k === 'h' || k === 'H') { if (!red.cloakOn) red.setCloak(true); red.setHood(!red.hoodUp); }
  }

  // A conversation at the door: play stops, the camera moves, the player makes a choice, and play starts again.
  async function talk() {
    const resume = P.st.active; P.stop(); hud.show(false); G.mode = 'cutscene'; document.body.classList.add('cutscene'); G.skipping = false;
    const sp = P.st.pos, toDoor = Math.atan2(door.x - sp.x, hut.z + hut.d / 2 - sp.z);
    red.root.rotation.y = toDoor; P.st.heading = toDoor;
    const fwd = v(Math.sin(toDoor), 0, Math.cos(toDoor)), side = v(Math.cos(toDoor), 0, -Math.sin(toDoor));
    await G.shot({ pos: v(sp.x, 22, sp.z).addScaledVector(side, 38).addScaledVector(fwd, 6), look: v(sp.x, 19, sp.z).addScaledVector(fwd, 2), fov: 38 }, 1.4, 'inOut');
    red.setExpr('smile'); await G.say('red', 'Hello? Is anybody home?');
    await G.wait(0.6); red.setExpr('gasp'); await G.say('narrator', 'Nobody answers. The door is shut, and the sandbox ends here.'); red.setExpr('smile');
    const pick = await G.choose('red', st.carrying ? ['Leave the basket on the step.', 'Never mind. Back to the meadow.'] : ['Never mind. Back to the meadow.']);
    if (st.carrying && pick === 0) { red.hold(null); st.carrying = false; world.scene.add(basket); placeBasket(door.x + 8, 0.2, hut.z + hut.d / 2 + 6); hud.toast('You leave the basket on the step.'); }
    red.setExpr('wink'); G.skipping = false; await G.fade(true, 0.5); P.st.pos.z = Math.max(P.st.pos.z, door.z); P.place(P.st.pos.x, P.st.pos.z, toDoor + Math.PI); await G.fade(false, 0.5); red.setExpr('smile');
    G.hideLine(); document.body.classList.remove('cutscene'); if (resume !== false) { P.start(); hud.show(true); }
  }

  const ensure = () => {
    if (P) return P;
    P = root.Player.create(G, { rig: red, world, scale: SC, onAct: act, onTake: take, onKey: key, onToast: t => hud.toast(t, 2200),
      onTick: () => {
        const p = P.st.pos, door_ = nearDoor(p), bn = basketNear(p), tu = P.touch;
        hud.objective(red.cloakOn ? 'Small as a flower: everything is huge. Take the mantle off (E) to be your own size.' : st.carrying ? 'Follow the path to the cottage. Put the mantle on (E) to see the meadow from below.' : 'Pick up the basket from the stump (Q), then follow the path to the cottage. The mantle (E) shrinks you.');
        hud.hint(door_ ? 'E: knock at the door' : bn ? 'Q: pick up the basket' : st.carrying ? 'Q: put the basket down' : '');
        if (tu) { tu.set('act', door_ ? { label: 'Knock', enabled: true } : { label: red.cloakOn ? 'Grow' : 'Shrink', enabled: true }); tu.set('drop', { label: st.carrying ? 'Put down' : 'Take', enabled: st.carrying || bn }); const b = P.st.grounded && !P.st.climb; tu.set('jump', { label: 'Jump', enabled: b }); }
        hud.tick();
      } });
    return P;
  };

  async function intro() {
    ensure(); G.mode = 'cutscene'; document.body.classList.add('cutscene'); G.setScene(world); G.drone = null; G.skipping = false;
    red.root.visible = true; red.setCloak(false, false); red.setHood(false); red.setExpr('smile'); red.hold(null); st.carrying = false; world.scene.add(basket); placeBasket(stump.x, stump.y, stump.z); P.scaleTo(SC, true);
    P.place(world.spawn.x, world.spawn.z, world.spawn.heading); red.motion.speed = 0;
    const face = { pos: v(world.spawn.x + 16, 26, world.spawn.z - 58), look: v(world.spawn.x, 21, world.spawn.z), fov: 36 };
    const wide = { pos: v(world.spawn.x - 60, 60, world.spawn.z - 90), look: v(world.spawn.x, 16, world.spawn.z - 10), fov: 50 };
    G.cut(wide); await G.fade(false, 1.6);
    await G.shot(face, 3.2, 'inOut'); red.setExpr('wink'); red.sparkle(24); A && A.chime(0.5);
    await G.say('red', 'Off we go, then!'); red.setExpr('smile');
    G.skipping = false; document.body.classList.remove('cutscene');
  }
  function play() { ensure().start(); hud.show(true); }
  function stop() { if (P) P.stop(); hud.show(false); }
  const snapshot = () => ({ x: P.st.pos.x, z: P.st.pos.z, heading: P.st.heading, cloak: red.cloakOn, hood: red.hoodUp, carrying: st.carrying, basket: st.basketAt });
  function restore(s) {
    ensure(); red.root.visible = true; red.setCloak(s.cloak !== false, false); red.setHood(!!s.hood); P.scaleTo(red.cloakOn ? SMALL : SC, true); red.hold(null); st.carrying = false; world.scene.add(basket);
    if (s.basket) placeBasket(s.basket.x, s.basket.y, s.basket.z);
    if (s.carrying) { world.scene.remove(basket); red.hold(basket); st.carrying = true; }
    P.place(s.x, s.z, s.heading);
  }
  return { intro, play, stop, restore, snapshot, state: st, get player() { return ensure(); }, talk };
}
root.Demo = { create };
})(typeof window !== 'undefined' ? window : globalThis);
