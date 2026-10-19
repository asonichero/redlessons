// Voxel helpers: small pixel-art textures and boxes whose faces show a repeating texture at one skin pixel per world unit, so cloth on a prop matches the cloth on a skin.
//   Voxel.clothTexture(draw)            a 16x16 repeating texture; draw(ctx, canvas) paints it
//   Voxel.clothBox(w, h, d, material)   a box that tiles that texture at 1 pixel per unit
//   Voxel.noise(ctx, base, tones, seed, density)   fills a 16x16 with a colour and a little deterministic grain (for clothTexture)
//   Voxel.lam(texture), Voxel.col(hex)  Lambert materials (textured, or a flat sRGB colour)
//   Voxel.rng(seed)                     a seeded random, so a world looks the same every time
(function (root) {
'use strict';
const THREE = root.THREE;

function clothTexture(draw) {
  const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'); draw(x, c);
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding;
  return t;
}
function clothBox(w, h, d, mat) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / 16, uv.getY(i) * dims[f][1] / 16); }
  return new THREE.Mesh(g, mat);
}
const noise = (x, base, tones, seed, density = 0.3) => {
  x.fillStyle = base; x.fillRect(0, 0, 16, 16); let s = seed;
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { s = (s * 1103515245 + 12345) >>> 0; const r = ((s >> 16) % 1000) / 1000; if (r < density) { x.fillStyle = tones[(s >> 8) % tones.length]; x.fillRect(i, j, 1, 1); } }
};
// A texture of any size, stretched once over a box face (not repeated): paint it with draw(ctx, w, h).
function pixelTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.encoding = THREE.sRGBEncoding;
  return t;
}
const lam = tex => new THREE.MeshLambertMaterial({ map: tex });
const col = hex => new THREE.MeshLambertMaterial({ color: new THREE.Color(hex).convertSRGBToLinear() });
const rng = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

root.Voxel = { clothTexture, clothBox, noise, pixelTexture, lam, col, rng };
})(typeof window !== 'undefined' ? window : globalThis);
