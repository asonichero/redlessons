// Red Lessons — the stage both pages use: a renderer with soft shadows, warm toon lighting, an orbiting camera, and the cottage (js/cottage.js),
// whose walls, roof and floor aren't drawn while the camera is outside them, so the room stays open to it from any side.
//
//   const st = Stage.create(view, { room: true });  st.scene.add(…);  st.start(dt => …)   (dt in seconds, each frame)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, srgb = h => new THREE.Color(h).convertSRGBToLinear();


function create(view, opts) {
  opts = opts || {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.setPixelRatio(Math.min(2, root.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  view.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(srgb('#2a1f1c'));
  const camera = new THREE.PerspectiveCamera(opts.fov || 34, 1, 0.5, 600);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 10; controls.maxDistance = 140; controls.minPolarAngle = 0.01; controls.maxPolarAngle = Math.PI - 0.01;      // (all the way round, over and under: the floor, like the walls, faces in, so from below it isn't drawn)
  // Light: a warm sky and a bounce off the floor, and the sun through the window, which casts the shadows.
  scene.add(new THREE.HemisphereLight(srgb('#fff4e4'), srgb('#8a6448'), 0.62));
  const sun = new THREE.DirectionalLight(srgb('#fff0d8'), 0.72); sun.position.set(-30, 60, 40); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 260 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.06; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  const cottage = opts.room !== false && root.Cottage ? root.Cottage.build(scene) : null;
  function resize() { const w = view.clientWidth || 800, h = view.clientHeight || 600; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  root.addEventListener('resize', resize); resize();
  let running = false, last = 0;
  // Cameras move smoothly to a new view.
  let tween = null;
  function go(pos, look, ms) {
    if (!ms) { camera.position.copy(pos); controls.target.copy(look); controls.update(); tween = null; return; }
    tween = { t0: performance.now(), ms, p0: camera.position.clone(), p1: pos.clone(), l0: controls.target.clone(), l1: look.clone() };
  }
  function start(each) {
    running = true; last = performance.now();
    const loop = now => {
      if (!running) return; if (api.held) { requestAnimationFrame(loop); return; } const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (tween) { const k = Math.min(1, (now - tween.t0) / tween.ms), e = k * k * (3 - 2 * k); camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.l0, tween.l1, e); if (k >= 1) tween = null; }
      if (each) each(dt); controls.update(); if (cottage) { cottage.tick(dt); cottage.update(camera); } draw(); requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  // A frame: first each figure's outer clothes as depth (so the parts under them show their colour only where they poke through), then the scene.
  function draw() { if (T && T.clipPass) T.clipPass(renderer, scene, camera); renderer.render(scene, camera); }
  function stop() { running = false; root.removeEventListener('resize', resize); renderer.dispose(); }
  // Characters cast shadows (their outlines do not); they take none themselves, which keeps their shading clean.
  const cast = rig => { for (const m of rig.meshes) m.castShadow = true; };
  // (held: the loop idles, for stepping frames by hand)
  const api = { renderer, scene, camera, controls, sun, resize, start, stop, go, cast, cottage, draw, held: false };
  return api;
}

root.Stage = { create };
})(typeof window !== 'undefined' ? window : globalThis);
