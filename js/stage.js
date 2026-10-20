// Red Lessons — the stage both pages use: a renderer with soft shadows, warm toon lighting, an orbiting camera, and a cottage room (plank floor, a
// rug, plaster walls with a window full of sky and timber beams). The walls face inward, so whichever side the camera looks from, the wall
// between it and the characters is not drawn and the room stays open to it.
//
//   const st = Stage.create(view, { room: true });  st.scene.add(…);  st.start(dt => …)   (dt in seconds, each frame)
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, srgb = h => new THREE.Color(h).convertSRGBToLinear();

function canvasTex(w, h, paint, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
const toonMap = map => new THREE.MeshToonMaterial({ color: 0xffffff, map, gradientMap: T.mat('#ffffff').gradientMap });

function room(scene) {
  const g = new THREE.Group(); scene.add(g);
  // Floor: warm planks with dark seams and a little grain.
  const planks = canvasTex(256, 256, (x, w, h) => {
    const cols = ['#b9824e', '#ad7646', '#c08a56', '#a87044'];
    for (let i = 0; i < 8; i++) { x.fillStyle = cols[i % 4]; x.fillRect(0, i * 32, w, 32); x.fillStyle = 'rgba(80,44,20,0.12)'; for (let k = 0; k < 6; k++) x.fillRect(((i * 53 + k * 41) % w), i * 32 + 6 + k * 4, 40 + k * 7, 1); }
    x.fillStyle = '#6a4024'; for (let i = 0; i <= 8; i++) x.fillRect(0, i * 32 - 1, w, 2);
    for (let i = 0; i < 8; i++) x.fillRect(((i * 97) % w), i * 32, 2, 32);
  }, [6, 6]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), toonMap(planks)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  // A round rug under the chair.
  const rug = canvasTex(256, 256, (x, w, h) => {
    const ring = (r, c) => { x.fillStyle = c; x.beginPath(); x.ellipse(w / 2, h / 2, r, r, 0, 0, 7); x.fill(); };
    ring(127, '#7a2e2a'); ring(118, '#e0b860'); ring(110, '#9a3a30'); ring(80, '#c46a40'); ring(72, '#9a3a30'); ring(40, '#e0b860'); ring(34, '#7a2e2a');
    x.fillStyle = '#e0b860'; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; x.beginPath(); x.ellipse(w / 2 + Math.cos(a) * 95, h / 2 + Math.sin(a) * 95, 6, 6, 0, 0, 7); x.fill(); }
  });
  const rm = new THREE.Mesh(new THREE.CircleGeometry(24, 48), toonMap(rug)); rm.material.transparent = false; rm.rotation.x = -Math.PI / 2; rm.position.set(-1, 0.05, 4); rm.receiveShadow = true; g.add(rm);
  // Walls: plaster, a skirting board and a beam along the top; a window in the back wall.
  const plaster = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#efdcc0'; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${150 + (i % 3) * 20},110,70,0.05)`; x.fillRect((i * 37) % w, (i * 59) % h, 6, 4); } }, [4, 2]);
  const wallM = toonMap(plaster), wood = T.mat('#6e4626');
  const wall = (w, h, x, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallM); m.position.set(x, h / 2, z); m.rotation.y = ry; m.receiveShadow = true; g.add(m);
    for (const [y, hh] of [[1.2, 2.4], [h - 1.2, 2.4]]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), wood); b.position.set(x, y, z); b.rotation.y = ry; b.translateZ(0.05); g.add(b); }
    return m;
  };
  const H = 56;
  wall(120, H, 0, -26, 0); wall(120, H, 0, 50, Math.PI); wall(76, H, 44, 12, -Math.PI / 2); wall(76, H, -60, 12, Math.PI / 2);
  // The window: sky and a hill beyond, in a timber frame with a sill.
  const sky = canvasTex(128, 128, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ec4ee'); gr.addColorStop(1, '#d8f0fa'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; for (const [cx, cy, r] of [[30, 30, 14], [46, 26, 18], [62, 32, 12], [96, 48, 10], [108, 44, 13]]) { x.beginPath(); x.ellipse(cx, cy, r * 1.3, r * 0.7, 0, 0, 7); x.fill(); }
    x.fillStyle = '#7ab060'; x.beginPath(); x.ellipse(40, 140, 110, 50, 0, 0, 7); x.fill(); x.fillStyle = '#5e9a4c'; x.beginPath(); x.ellipse(120, 150, 90, 45, 0, 0, 7); x.fill();
  });
  const win = new THREE.Group(); win.position.set(-24, 26, -25.9); g.add(win);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), new THREE.MeshBasicMaterial({ map: sky })); win.add(glass);
  for (const [w, h, x, y] of [[17.6, 1.2, 0, 7.4], [17.6, 1.2, 0, -7.4], [1.2, 15.6, -8.4, 0], [1.2, 15.6, 8.4, 0], [0.7, 14, 0, 0], [16, 0.7, 0, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.8), wood); b.position.set(x, y, 0.3); win.add(b); }
  const sill = new THREE.Mesh(new THREE.BoxGeometry(19, 0.8, 2.4), wood); sill.position.set(0, -8.2, 1.1); win.add(sill);
  // A shaft of light from the window across the floor.
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(18, 30), new THREE.MeshBasicMaterial({ color: srgb('#fff2c8'), transparent: true, opacity: 0.16, depthWrite: false }));
  shaft.rotation.x = -Math.PI / 2; shaft.rotation.z = 0.35; shaft.position.set(-18, 0.08, -6); g.add(shaft);
  // A shelf with a jar or two, and a hanging lamp.
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 3), wood); shelf.position.set(18, 24, -24.4); g.add(shelf);
  for (const [x, c, r, h] of [[13, '#7aa0b8', 1.1, 2.6], [16, '#c8a050', 0.9, 2.0], [21, '#a84a3a', 1.3, 3.0]]) { const j = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), T.mat(c)); j.position.set(x, 24.4 + h / 2, -24.4); j.castShadow = true; g.add(j); }
  return g;
}

function create(view, opts) {
  opts = opts || {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.setPixelRatio(Math.min(2, root.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  view.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(srgb('#2a1f1c'));
  const camera = new THREE.PerspectiveCamera(opts.fov || 34, 1, 0.5, 600);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 10; controls.maxDistance = 140; controls.maxPolarAngle = Math.PI * 0.49;
  // Light: a warm sky and a bounce off the floor, and the sun through the window, which casts the shadows.
  scene.add(new THREE.HemisphereLight(srgb('#fff4e4'), srgb('#8a6448'), 0.62));
  const sun = new THREE.DirectionalLight(srgb('#fff0d8'), 0.72); sun.position.set(-30, 60, 40); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.06; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  if (opts.room !== false) room(scene);
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
      if (!running) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (tween) { const k = Math.min(1, (now - tween.t0) / tween.ms), e = k * k * (3 - 2 * k); camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.l0, tween.l1, e); if (k >= 1) tween = null; }
      if (each) each(dt); controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  function stop() { running = false; root.removeEventListener('resize', resize); renderer.dispose(); }
  // Characters cast shadows (their outlines do not); they take none themselves, which keeps their shading clean.
  const cast = rig => { for (const m of rig.meshes) m.castShadow = true; };
  return { renderer, scene, camera, controls, sun, resize, start, stop, go, cast };
}

root.Stage = { create };
})(typeof window !== 'undefined' ? window : globalThis);
