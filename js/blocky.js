// Blocky characters: Minecraft-style figures made of a head, a torso, two arms and two legs, each a plain box textured from a 64x64 skin laid out like a Minecraft skin
// (base layer plus outer layer), except that the arms are 3x3 pixels, a little thinner than Minecraft's. Each leg is cut at the knee, and each arm at the elbow, so a
// limb reads as one straight block when it hangs and shows a bend when it is posed. The skins are painted here, pixel by pixel, rather than loaded.
// The hero is Red, an adult woman styled after Red Riding Hood (makeRed): a green tunic, tan trousers and boots, an auburn plait over each shoulder, and the red "Starweave Mantle", a
// waist-length hooded cloak whose gold stars glow (setCloak, setHood, the sparkle burst when it goes on). blocky.html shows her.
// Rig API:  rig.root (add it to a scene; 1 unit = 1 skin pixel, a standing figure is 32 tall)   B.setPose(rig, 'stand' | 'sit')   B.step(rig, dt) once a frame
//   rig.motion = { t, phase, speed, air, look, carry }   drives the walk cycle (see locomotion); rig.setExpr('smile' | 'wink' | 'pout' | 'gasp' | 'neutral')
//   rig.setCloak(on, burst)   rig.setHood(up)   rig.hold(prop | null)   rig.sparkle(n)
(function (root) {
'use strict';
const THREE = root.THREE, V = root.Voxel;

// ---------------------------------------------------------------------------------------------------------------------------
// Skin atlas (Minecraft 64x64 layout). Each part is a box of w x h x d pixels whose six faces are laid out from (u, v).
// ---------------------------------------------------------------------------------------------------------------------------
const atlas = (aw, ad) => {
  const P = (u, v, w, h, d) => ({ u, v, w, h, d });
  return {
    head: P(0, 0, 8, 8, 8), hat: P(32, 0, 8, 8, 8),
    body: P(16, 16, 8, 12, 4), jacket: P(16, 32, 8, 12, 4),
    rArm: P(40, 16, aw, 12, ad), rArmO: P(40, 32, aw, 12, ad), lArm: P(32, 48, aw, 12, ad), lArmO: P(48, 48, aw, 12, ad),
    rLeg: P(0, 16, 4, 12, 4), rLegO: P(0, 32, 4, 12, 4), lLeg: P(16, 48, 4, 12, 4), lLegO: P(0, 48, 4, 12, 4),
  };
};
// Rectangle (in skin pixels) of one face of a part. Faces are named as seen on the character: its right side is on the viewer's left.
const faceRect = (p, f) => {
  switch (f) {
    case 'front': return { x: p.u + p.d, y: p.v + p.d, w: p.w, h: p.h };
    case 'back': return { x: p.u + 2 * p.d + p.w, y: p.v + p.d, w: p.w, h: p.h };
    case 'right': return { x: p.u, y: p.v + p.d, w: p.d, h: p.h };
    case 'left': return { x: p.u + p.d + p.w, y: p.v + p.d, w: p.d, h: p.h };
    case 'top': return { x: p.u + p.d, y: p.v, w: p.w, h: p.d };
    case 'bottom': return { x: p.u + p.d + p.w, y: p.v, w: p.w, h: p.d };
  }
};
const SIDES = ['right', 'front', 'left', 'back'];
const FACES = ['right', 'front', 'left', 'back', 'top', 'bottom'];
const sideOuter = s => s + 'O';

class Skin {
  constructor(armWidth = 3, armDepth = 3) {
    this.A = atlas(armWidth, armDepth);
    this.canvas = document.createElement('canvas'); this.canvas.width = 64; this.canvas.height = 64;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }
  // Fill a rectangle of a face (x, y relative to the face's top-left; w, h default to the rest of the face).
  fill(part, face, color, x = 0, y = 0, w, h) {
    const r = faceRect(this.A[part], face);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(r.x + x, r.y + y, w === undefined ? r.w - x : w, h === undefined ? r.h - y : h);
  }
  px(part, face, x, y, color) { this.fill(part, face, color, x, y, 1, 1); }
  all(part, color) { for (const f of FACES) this.fill(part, f, color); }
  // The four sides of a part, rows y..y+h.
  band(part, color, y, h) { for (const f of SIDES) this.fill(part, f, color, 0, y, undefined, h); }
  // Pixel art: rows of characters, each looked up in pal ('.' leaves the pixel alone).
  grid(part, face, rows, pal, ox = 0, oy = 0) {
    rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = row[i]; if (c !== '.' && pal[c]) this.px(part, face, ox + i, oy + j, pal[c]); } });
  }
  // A little deterministic grain on every painted pixel (alpha untouched), so flat colours read as cloth, leather and skin.
  grain(seed, amount, skip) {
    const W = this.canvas.width, H = this.canvas.height, img = this.ctx.getImageData(0, 0, W, H), d = img.data;
    let s = seed >>> 0;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] === 0 || (skip && skip.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h))) continue;
      const k = (rnd() - 0.5) * 2 * amount;
      d[i] = Math.max(0, Math.min(255, d[i] + k)); d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + k)); d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + k));
    }
    this.ctx.putImageData(img, 0, 0);
  }
  texture() {
    const t = new THREE.CanvasTexture(this.canvas);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.encoding = THREE.sRGBEncoding;
    return t;
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// Red Riding Hood's skin. A green tunic belted over tan trousers, brown bracers and knee boots, auburn hair. (The cloak and the plaits are separate models, below.)
// ---------------------------------------------------------------------------------------------------------------------------
const RED = {
  skin: '#f0c9a4', skinSh: '#d6a883', skinHi: '#f7d6b6', blush: '#e8988a',
  hair: '#9a4f26', hairHi: '#b96b38', hairDk: '#703818', brow: '#6a3a1c', white: '#f6f2ea', iris: '#5a3a22', lip: '#c4706a', teeth: '#f8f4ec', mouth: '#7a3030',
  tunic: '#437040', tunicDk: '#2f5230', tunicHi: '#5a8a50', belt: '#5a3b22', buckle: '#e0b84a', pouch: '#80552e', pouchDk: '#5e3c1e',
  trousers: '#c8b48c', trousersDk: '#ab9770', boot: '#6c4526', bootHi: '#8a5c32', bootCuff: '#93673a', sole: '#3a2514', bracer: '#6d4a2a', bracerHi: '#8a6238',
  cloak: '#c8222a', cloakDk: '#9d161f', cloakHi: '#e03a3a', gold: '#e8b83a', goldHi: '#ffe27a', ribbon: '#d0202a',
};
// The four faces from the reference sheet (rows 3-7 of the head's front; rows 0-2 are the hair): a smile, a wink, a determined pout, a gasp.
const RED_FACES = {
  smile:   ['SbbSSbbS', 'SWESSEWS', 'SrSnnSrS', 'SSsMMsSS', 'SSSSSSSS'],
  neutral: ['SbbSSbbS', 'SWESSEWS', 'SrSnnSrS', 'SSSMMSSS', 'SSSSSSSS'],
  wink:    ['SbbSSbbS', 'SddSSEWS', 'SrSnnSrS', 'SMTTTTMS', 'SSSSSSSS'],
  pout:    ['SddSSddS', 'SEESSEES', 'SrSnnSrS', 'SSSmmSSS', 'SSSSSSSS'],
  gasp:    ['SbbSSbbS', 'WEWSSWEW', 'SrSnnSrS', 'SSSmmSSS', 'SSSmmSSS'],
};
const EXPRESSIONS = Object.keys(RED_FACES);
function paintRedInto(k, st) {
  st = Object.assign({ expr: 'smile' }, st); const C = RED;
  k.ctx.clearRect(0, 0, 64, 64);
  const pal = { H: C.hair, h: C.hairHi, d: C.brow, S: C.skin, s: C.skinSh, b: C.brow, W: C.white, E: C.iris, r: C.blush, M: C.lip, T: C.teeth, m: C.mouth, n: C.skinSh, k: C.skinHi };
  // Head: skin all over, then the hair, a centre parting, and the face from the current expression.
  k.all('head', C.skin);
  k.grid('head', 'front', ['HHHHHHHH', 'HhHHHHhH', 'HHHSSHHH', ...(RED_FACES[st.expr] || RED_FACES.smile)], pal);
  k.fill('head', 'top', C.hair); k.px('head', 'top', 3, 7, C.skin); k.px('head', 'top', 4, 7, C.skin);
  k.fill('head', 'back', C.hair); k.fill('head', 'back', C.hairDk, 0, 6, undefined, 2);
  for (const f of ['right', 'left']) { k.fill('head', f, C.skin); k.fill('head', f, C.hair, 0, 0, undefined, 3); }
  k.fill('head', 'right', C.hair, 0, 3, 3, 4); k.fill('head', 'left', C.hair, 5, 3, 3, 4);
  k.fill('head', 'right', C.hair, 7, 3, 1, 2); k.fill('head', 'left', C.hair, 0, 3, 1, 2);
  k.fill('head', 'right', C.skinSh, 4, 4, 1, 2); k.fill('head', 'left', C.skinSh, 3, 4, 1, 2);
  k.fill('head', 'bottom', C.skinSh);
  // Hat layer: the thicker hair, swept over the crown, with highlights and a fringe either side of the parting.
  k.fill('hat', 'top', C.hair); for (const [x, y] of [[1, 1], [5, 2], [2, 5], [6, 4], [4, 6]]) k.px('hat', 'top', x, y, C.hairHi);
  k.fill('hat', 'back', C.hair, 0, 0, undefined, 7); k.fill('hat', 'back', C.hairDk, 0, 6, undefined, 1); k.px('hat', 'back', 2, 2, C.hairHi); k.px('hat', 'back', 5, 3, C.hairHi);
  k.fill('hat', 'right', C.hair, 0, 0, undefined, 3); k.fill('hat', 'left', C.hair, 0, 0, undefined, 3);
  k.fill('hat', 'right', C.hair, 0, 3, 3, 3); k.fill('hat', 'left', C.hair, 5, 3, 3, 3);
  k.grid('hat', 'front', ['HHHhHHHH', 'HhHHHHhH', 'HHH..HHH'], { H: C.hair, h: C.hairHi });

  // Torso: a green tunic with a V neck and lacing; the belt, buckle, hip pouches and the tunic's flared hem are the outer layer.
  k.all('body', C.tunic);
  k.grid('body', 'front', ['ttSSSStt', 'tttSSttt', 'tttDDttt', 'tttLLttt', 'tttDDttt', 'tttLLttt'], { t: C.tunicHi, S: C.skin, D: C.tunicDk, L: C.tunic });
  k.fill('body', 'front', C.tunic, 0, 6); k.fill('body', 'front', C.tunicDk, 3, 3, 2, 1); k.fill('body', 'front', C.tunicDk, 3, 5, 2, 1);
  k.fill('body', 'back', C.tunic); k.fill('body', 'back', C.tunicHi, 0, 0, undefined, 1); k.fill('body', 'right', C.tunic); k.fill('body', 'left', C.tunic);
  k.fill('body', 'top', C.tunicHi); k.fill('body', 'bottom', C.tunicDk);
  for (const f of SIDES) {
    k.fill('jacket', f, C.belt, 0, 8, undefined, 2);                                                 // the belt, all the way round
    k.fill('jacket', f, C.tunic, 0, 10, undefined, 2); k.fill('jacket', f, C.tunicDk, 0, 11, undefined, 1);   // the hem flaring over the hips
  }
  k.fill('jacket', 'front', C.buckle, 3, 8, 2, 2); k.px('jacket', 'front', 3, 8, C.goldHi); k.px('jacket', 'front', 4, 9, '#a8872c');
  for (const [f, x] of [['front', 0], ['front', 6]]) { k.fill('jacket', f, C.pouch, x, 9, 2, 3); k.fill('jacket', f, C.pouchDk, x, 9, 2, 1); }
  for (const [f, x] of [['left', 0], ['right', 0]]) { k.fill('jacket', f, C.pouch, x + 1, 9, 2, 3); k.fill('jacket', f, C.pouchDk, x + 1, 9, 2, 1); k.px('jacket', f, x + 2, 10, C.buckle); }

  // Arms: short green sleeves, a brown leather bracer over the forearm, bare hands.
  for (const side of ['rArm', 'lArm']) {
    k.all(side, C.skin);
    k.band(side, C.tunic, 0, 5); k.band(side, C.tunicDk, 4, 1); k.fill(side, 'top', C.tunic); k.fill(side, 'bottom', C.skinSh);
    k.band(side, C.bracer, 6, 4); k.band(side, C.bracerHi, 6, 1); k.band(side, C.sole, 9, 1);
    k.band(side, C.skinHi, 10, 1); k.band(side, C.skinSh, 11, 1);
  }
  // Legs: tan trousers to the knee, knee-high brown boots with a folded cuff; the tunic's hem hangs over the top of each thigh.
  for (const leg of ['rLeg', 'lLeg']) {
    k.all(leg, C.trousers);
    k.band(leg, C.trousersDk, 5, 1); k.fill(leg, 'top', C.trousers);
    k.band(leg, C.bootCuff, 6, 1); k.band(leg, C.bootHi, 7, 1); k.band(leg, C.boot, 8, 3); k.band(leg, C.sole, 11, 1); k.fill(leg, 'bottom', C.sole);
    k.px(leg, 'front', 1, 9, C.bootHi); k.px(leg, 'front', 2, 8, C.bootHi); k.px(leg, 'front', 1, 7, C.sole); k.px(leg, 'front', 2, 7, C.sole);
    const o = sideOuter(leg); for (const f of SIDES) { k.fill(o, f, C.tunic, 0, 0, undefined, 2); k.fill(o, f, C.tunicDk, 0, 1, undefined, 1); } k.fill(o, 'top', C.tunic);
  }
  k.grain(1021, 5, [{ x: 8, y: 8, w: 8, h: 8 }]);
  return k;
}

// ---------------------------------------------------------------------------------------------------------------------------
// Geometry: a box whose faces read from the skin atlas. A limb is two of these (rows y0..y1 of the same limb), so the skin runs on
// unbroken across the knee or elbow. Faces that fall inside the joint are given one flat texel of the limb's own colour.
// ---------------------------------------------------------------------------------------------------------------------------
function boxGeo(part, pad, y0, y1, W = 64, H = 64) {
  const w = part.w, d = part.d;
  const g = new THREE.BoxGeometry(w + 2 * pad, (y1 - y0) + 2 * pad, d + 2 * pad);
  const uv = g.attributes.uv;
  const rect = (face, x0, ya, x1, yb) => {
    const i = face * 4;
    uv.setXY(i, x0 / W, 1 - ya / H); uv.setXY(i + 1, x1 / W, 1 - ya / H);
    uv.setXY(i + 2, x0 / W, 1 - yb / H); uv.setXY(i + 3, x1 / W, 1 - yb / H);
  };
  const texel = (face, sx, sy) => { for (let k = 0; k < 4; k++) uv.setXY(face * 4 + k, (sx + 0.5) / W, 1 - (sy + 0.5) / H); };
  const side = (face, f) => { const r = faceRect(part, f); rect(face, r.x, r.y + y0, r.x + r.w, r.y + y1); };
  side(0, 'left'); side(1, 'right'); side(4, 'front'); side(5, 'back');
  const fr = faceRect(part, 'front'), tp = faceRect(part, 'top'), bt = faceRect(part, 'bottom');
  if (y0 === 0) rect(2, tp.x, tp.y, tp.x + tp.w, tp.y + tp.h); else texel(2, fr.x + (fr.w >> 1), fr.y + y0);
  if (y1 === part.h) rect(3, bt.x, bt.y, bt.x + bt.w, bt.y + bt.h); else texel(3, fr.x + (fr.w >> 1), fr.y + y1 - 1);
  return g;
}

// ---------------------------------------------------------------------------------------------------------------------------
// The rig.
// ---------------------------------------------------------------------------------------------------------------------------
const POSES = {
  stand: { hipY: 12, lift: 0, thighX: 0, shinX: 0, spread: 0.02, armX: 0, armIn: -0.04, forearm: 0, headX: 0 },
  sit:   { hipY: 6,  lift: -2, thighX: -Math.PI / 2, shinX: Math.PI / 2, spread: 0.06, armX: -0.8, armIn: 0.14, forearm: 0, headX: 0.08 },
};

// opts: { armWidth }  Everything is in skin pixels (1 unit = 1 pixel); a standing figure is 32 tall.
function buildCharacter(skin, opts) {
  const aw = opts.armWidth, A = skin.A;
  const tex = skin.texture();
  const mat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.FrontSide });
  const root_ = new THREE.Group();
  const hips = new THREE.Group(); root_.add(hips);
  const rig = { root: root_, hips, state: Object.assign({}, POSES.stand), target: Object.assign({}, POSES.stand), skin, pose: 'stand', motion: { t: 0, phase: 0, speed: 0, air: false, look: 0, carry: false }, steppers: [] };

  const mesh = (part, outer, pad, y0 = 0, y1 = A[part].h) => {
    const m = new THREE.Mesh(boxGeo(A[part], 0, y0, y1), mat);
    const g = new THREE.Group(); g.add(m);
    if (outer) { const o = new THREE.Mesh(boxGeo(A[outer], pad, y0, y1), mat); g.add(o); }
    return g;
  };

  // Torso and head.
  rig.torso = new THREE.Group(); hips.add(rig.torso);
  const torsoMesh = mesh('body', 'jacket', 0.5); torsoMesh.position.y = 6; rig.torso.add(torsoMesh);
  // The pelvis: the bottom three rows of the torso, left behind with the hips when the torso turns or leans, so its base never comes away from the tops of the legs (a hair smaller than the torso's own, so it hides inside it when upright).
  const pelvis = mesh('body', 'jacket', 0.5, 9, 12); pelvis.position.y = 1.5; pelvis.scale.setScalar(0.992); hips.add(pelvis); rig.pelvis = pelvis;
  rig.neck = new THREE.Group(); rig.neck.position.y = 12; rig.torso.add(rig.neck);
  const headMesh = mesh('head', 'hat', 1); headMesh.position.y = 4; rig.neck.add(headMesh);

  // Arms: cut at the elbow (row 6 of 12) into an upper arm and a forearm, as the legs are cut at the knee. The forearm hangs from a wrist group that can turn about
  // the forearm's own axis (so the hand and anything held can be brought round).
  const shoulderX = 4 + aw / 2;
  for (const [key, sign, p, o] of [['armL', 1, 'lArm', 'lArmO'], ['armR', -1, 'rArm', 'rArmO']]) {
    const pivot = new THREE.Group(); pivot.position.set(sign * shoulderX, 10, 0); pivot.rotation.order = 'ZXY';
    const upper = mesh(p, o, 0.5, 0, 6); upper.position.y = -1; pivot.add(upper);
    const elbow = new THREE.Group(); elbow.position.y = -4; pivot.add(elbow);
    const wrist = new THREE.Group(); elbow.add(wrist);
    const fore = mesh(p, o, 0.5, 6, 12); fore.position.y = -3; wrist.add(fore);
    if (key === 'armR') { rig.elbow = elbow; rig.wrist = wrist; } else { rig.elbowL = elbow; rig.wristL = wrist; }
    rig.torso.add(pivot); rig[key] = pivot; pivot.userData.sign = sign;
  }

  // Legs: thigh from the hip, shin from the knee. Standing, the two meet flush; seated, the knee shows.
  for (const [key, sign, p, o] of [['legL', 1, 'lLeg', 'lLegO'], ['legR', -1, 'rLeg', 'rLegO']]) {
    const thigh = new THREE.Group(); thigh.position.x = sign * 2; thigh.rotation.order = 'ZXY';
    const tm = mesh(p, o, 0.5, 0, 6); tm.position.y = -3; thigh.add(tm);
    const knee = new THREE.Group(); knee.position.y = -6; thigh.add(knee);
    const sm = mesh(p, o, 0.5, 6, 12); sm.position.y = -3; knee.add(sm);
    hips.add(thigh); rig[key] = { thigh, knee, sign };
  }
  rig.apply = apply; rig.tex = tex; rig.after = r => locomotion(r, r.motion);
  apply.call(rig);
  return rig;
}

function apply() {
  const s = this.state;
  this.hips.position.y = s.hipY;
  this.torso.position.y = s.lift;
  this.neck.rotation.x = s.headX;
  for (const k of ['armL', 'armR']) {
    const a = this[k], sg = a.userData.sign;
    a.rotation.x = s.armX; a.rotation.z = -sg * s.armIn;
  }
  for (const k of ['legL', 'legR']) {
    const l = this[k];
    l.thigh.rotation.x = s.thighX; l.thigh.rotation.z = l.sign * s.spread; l.knee.rotation.x = s.shinX;
  }
  if (this.after) this.after(this);   // a scene's own additions to the pose (by default, the walk cycle)
}

// The walk cycle, driven by rig.motion: phase (advance it with distance walked), speed (units per second, scaled to the figure), air (jumping or climbing), look (head turn, radians),
// carry (the left arm bent to hold something), t (time, for the idle sway). While seated the legs are left alone.
function locomotion(r, a) {
  const k = Math.max(0, Math.min(1, a.speed / 20)), sw = Math.sin(a.phase) * k * 0.7, idle = 0.015 * Math.sin(a.t * 1.1), seated = r.pose === 'sit';
  if (!seated) { r.legL.thigh.rotation.x = sw; r.legR.thigh.rotation.x = -sw; r.legR.knee.rotation.x = 0; }
  r.armL.rotation.x = a.carry ? -0.35 : -sw * 0.8 + idle; r.armR.rotation.x = sw * 0.8 - idle;
  if (r.elbowL) r.elbowL.rotation.x = a.carry ? -1.25 : -0.1 - 0.35 * Math.max(0, -Math.sin(a.phase + 1)) * k;
  if (r.elbow) r.elbow.rotation.x = -0.1 - 0.35 * Math.max(0, Math.sin(a.phase + 1)) * k;
  if (a.air && !seated) {
    r.armR.rotation.x = -2.5; if (!a.carry) r.armL.rotation.x = -2.5;
    r.legL.thigh.rotation.x = -0.5; r.legR.thigh.rotation.x = 0.25; r.legR.knee.rotation.x = 0.5;
  }
  r.neck.rotation.y = a.look || 0; r.torso.rotation.z = 0.01 * Math.sin(a.t * 0.9);
  if (!seated) r.hips.position.y = 12 + Math.abs(Math.sin(a.phase)) * 0.5 * k;
}

function setPose(rig, name) {
  rig.target = Object.assign({}, POSES[name]); rig.pose = name;
  if (name !== 'sit' && rig.legL.knee.children[0].scale.y !== 1) for (const l of [rig.legL, rig.legR]) { const sm = l.knee.children[0]; sm.scale.y = 1; sm.position.y = -3; }   // (standing again: the shins are their own length)
}
// Sitting on something: the knee-to-foot blocks lengthen so that the feet reach the floor (floorY, in the world) from wherever the seat holds the knees. Call it once the pose has settled and the rig is in place.
function seatFeet(rig, floorY) {
  floorY = floorY || 0; const legs = [rig.legL, rig.legR], set = (l, k) => { const sm = l.knee.children[0]; sm.scale.y = k; sm.position.y = -3 * k; };
  legs.forEach(l => set(l, 1)); rig.root.updateMatrixWorld(true);
  for (const l of legs) {
    const kneeY = l.knee.getWorldPosition(new THREE.Vector3()).y, footY = l.knee.localToWorld(new THREE.Vector3(0, -6, 0)).y;
    if (kneeY - footY > 0.3 && footY > floorY + 0.05) set(l, (kneeY - floorY) / (kneeY - footY));
  }
}
function step(rig, dt) {
  const k = Math.min(1, dt * 9);
  for (const key in rig.target) rig.state[key] += (rig.target[key] - rig.state[key]) * k;
  rig.motion.t += dt;
  rig.apply();
  for (const f of rig.steppers) f(dt);
}

// ---------------------------------------------------------------------------------------------------------------------------
// The Starweave Mantle: a hood, and a waist-length cloak of red cloth edged in gold, with gold stars that glow. Stars and trim are painted onto 2-pixel-per-unit
// textures; a matching black-and-gold map is the emissive map, so the stars shine on their own and pulse a little (rig.glow sets the base).
// ---------------------------------------------------------------------------------------------------------------------------
const STAR5 = ['..#..', '.###.', '#####', '.###.', '.#.#.'], STAR3 = ['.#.', '###', '.#.'];
function cloakTextures(w, h, o) {
  const W = Math.round(w * 2), H = Math.round(h * 2), draw = (glow) => V.pixelTexture(W, H, (x) => {
    const rnd = V.rng(o.seed || 3);
    if (glow) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); }
    else {
      x.fillStyle = RED.cloak; x.fillRect(0, 0, W, H);
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const r = rnd(); if (r < 0.1) { x.fillStyle = r < 0.05 ? RED.cloakDk : RED.cloakHi; x.fillRect(i, j, 1, 1); } }
      for (let i = 0; i < W; i += 4) { x.fillStyle = RED.cloakDk; x.fillRect(i, H - 4, 1, 2); }                            // a few folds above the hem
    }
    const gold = (X, Y, ww, hh) => { if (!glow) { x.fillStyle = RED.gold; x.fillRect(X, Y, ww, hh); } };               // (the trim is lit by the sun like cloth; only the stars shine on their own)
    gold(0, H - 1, W, 1);                                                                                                // the hem
    if (o.edge === 'left') gold(0, 0, 1, H); if (o.edge === 'right') gold(W - 1, 0, 1, H);
    const star = (g, cx, cy, big) => { const rows = big ? STAR5 : STAR3; rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') { x.fillStyle = (i === (row.length >> 1) && j === (rows.length >> 1)) ? RED.goldHi : RED.gold; x.fillRect(cx - (row.length >> 1) + i, cy - (rows.length >> 1) + j, 1, 1); } }); };
    for (const [sx, sy, big] of o.stars || []) star(glow, sx, sy, big);
  });
  return { map: draw(false), glow: draw(true) };
}
function makeCloak() {
  const group = new THREE.Group(), mats = [], items = [];
  const panel = (w, h, d, o, x, y, z, rotY) => {
    const t = cloakTextures(o.tw || w, o.th || h, o), m = new THREE.MeshLambertMaterial({ map: t.map, emissive: 0xffffff, emissiveMap: t.glow, emissiveIntensity: 0.45 });
    mats.push(m); const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mesh.position.set(x, y, z); if (rotY) mesh.rotation.y = rotY; group.add(mesh); items.push(mesh); return mesh;
  };
  // The back (the great star between the shoulder blades), the two front panels (open down the middle), the sides over the arms, and a wider hem skirting the back.
  panel(15.6, 10.2, 1, { seed: 3, stars: [[16, 9, true], [6, 15, false], [25, 14, false], [9, 5, false], [23, 5, false], [16, 16, false]] }, 0, 7.3, -3.25);
  panel(17.2, 2.2, 1.6, { seed: 4, stars: [[6, 2, false], [17, 2, false], [28, 2, false]] }, 0, 3.0, -3.5);
  panel(6.6, 9.2, 0.9, { seed: 5, edge: 'left', stars: [[3, 12, false], [8, 14, true], [10, 8, false]] }, 4.3, 7.4, 3.0);
  panel(6.6, 9.2, 0.9, { seed: 6, edge: 'right', stars: [[10, 12, false], [5, 14, true], [3, 8, false]] }, -4.3, 7.4, 3.0);
  panel(0.9, 7.6, 6.2, { seed: 7, tw: 6.2, th: 7.6, stars: [[6, 9, false]] }, 7.9, 8.4, -0.3);
  panel(0.9, 7.6, 6.2, { seed: 8, tw: 6.2, th: 7.6, stars: [[6, 9, false]] }, -7.9, 8.4, -0.3);
  // The mantle over the shoulders, flat on either side of the neck.
  const cloth = V.lam(V.clothTexture(x => V.noise(x, RED.cloak, [RED.cloakDk, RED.cloakHi], 12, 0.12)));
  for (const s of [1, -1]) { const m = V.clothBox(3.0, 1.0, 7.2, cloth); m.position.set(s * 6.3, 12.25, -0.2); group.add(m); const t = V.clothBox(3.0, 0.3, 0.3, V.col(RED.gold)); t.position.set(s * 6.3, 12.55, 3.4); group.add(t); }
  const clasp = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.5), new THREE.MeshLambertMaterial({ color: new THREE.Color(RED.gold).convertSRGBToLinear(), emissive: new THREE.Color(RED.gold).multiplyScalar(0.35) }));
  clasp.position.set(0, 10.6, 3.6); group.add(clasp);
  return { group, mats, glow: 0.45 };
}
// The hood: up, it wraps the head (top, sides, back, a brim over the brow and a cowl round the neck); down, it hangs in a bundle behind the neck.
function makeHood() {
  const cloth = V.lam(V.clothTexture(x => V.noise(x, RED.cloak, [RED.cloakDk, RED.cloakHi], 21, 0.12))), gold = V.col(RED.gold);
  const up = new THREE.Group(), down = new THREE.Group(), add = (g, w, h, d, m, x, y, z) => { const b = V.clothBox(w, h, d, m); b.position.set(x, y, z); g.add(b); return b; };
  add(up, 11.2, 1.2, 11.4, cloth, 0, 9.3, -0.3); add(up, 1.2, 10, 11.4, cloth, 5.5, 4.4, -0.3); add(up, 1.2, 10, 11.4, cloth, -5.5, 4.4, -0.3);
  add(up, 11.2, 10, 1.2, cloth, 0, 4.4, -5.7); add(up, 11.2, 1.8, 1.4, cloth, 0, 8.4, 5.5);
  add(up, 1.4, 7.4, 1.6, cloth, 5.1, 3.9, 5.2); add(up, 1.4, 7.4, 1.6, cloth, -5.1, 3.9, 5.2);
  add(up, 12.4, 2.4, 11.4, cloth, 0, -0.5, -0.3);                                                                            // the cowl round the neck
  add(up, 11.2, 0.4, 0.3, gold, 0, 7.6, 6.3); add(up, 0.3, 7.4, 0.4, gold, 5.1, 3.9, 6.1); add(up, 0.3, 7.4, 0.4, gold, -5.1, 3.9, 6.1);   // gold edging along the face opening
  add(down, 10.6, 3.6, 4.4, cloth, 0, 0.6, -4.8).rotation.x = -0.3; add(down, 10.6, 0.4, 0.3, gold, 0, -1.1, -6.8);
  return { up, down };
}
function makeBraid(sign) {
  const C = RED, g = new THREE.Group(), segs = [];
  const hairM = [V.col(C.hair), V.col(C.hairHi), V.col(C.hairDk)];
  let parent = g;
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Group(); pivot.position.y = i ? -2.4 : 0; parent.add(pivot);
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.9 - i * 0.15, 2.8, 1.9 - i * 0.15), hairM[i % 2]); m.position.set((i % 2 ? 0.2 : -0.2) * sign, -1.3, 0); pivot.add(m);
    segs.push(pivot); parent = pivot;
  }
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1, 2.3), new THREE.MeshLambertMaterial({ color: new THREE.Color(C.ribbon).convertSRGBToLinear() })); ribbon.position.y = -3.1; parent.add(ribbon);
  const bow = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.9), ribbon.material); bow.position.set(0, -3.1, 1.3); parent.add(bow);
  const tuft = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.4), hairM[2]); tuft.position.y = -4.2; parent.add(tuft);
  return { group: g, segs };
}
// A wicker basket with a handle and a red-checked cloth over the goods; the handle sits on the forearm when held (rig.hold).
function makeBasket() {
  const g = new THREE.Group(), wick = V.lam(V.clothTexture(x => { V.noise(x, '#b8893c', ['#a07430', '#cfa050', '#8a6226'], 31, 0.5); x.fillStyle = '#7a561e'; for (let i = 0; i < 16; i += 4) x.fillRect(0, i, 16, 1); }));
  const body = V.clothBox(7, 4.6, 5, wick); body.position.y = -2.3; g.add(body);
  const cloth = V.lam(V.clothTexture(x => { x.fillStyle = '#f2ecdc'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#d0202a'; for (let i = 0; i < 16; i += 4) { x.fillRect(i, 0, 2, 16); x.fillRect(0, i, 16, 2); } }));
  const top = V.clothBox(7.4, 0.6, 5.4, cloth); top.position.y = 0.2; g.add(top);
  const lump = V.clothBox(4, 1.4, 3, cloth); lump.position.set(0.8, 1.1, 0); g.add(lump);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 4.4), wick); handle.position.set(0, 3.6, 0); g.add(handle);
  for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.8, 0.7), wick); p.position.set(0, 1.8, s * 2.1); g.add(p); }
  return g;
}

// Gold sparkles: little cubes that fly out, glitter and fall away. emitter.burst(origin, n); emitter.update(dt). Add emitter.root to a scene or to a rig.
function makeSparkles(max = 40) {
  const root_ = new THREE.Group(), pool = [], mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED.goldHi).convertSRGBToLinear(), transparent: true, depthWrite: false });
  for (let i = 0; i < max; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat.clone()); m.visible = false; root_.add(m); pool.push({ m, v: new THREE.Vector3(), life: 0, max: 1 }); }
  let rs = 5; const rnd = () => (rs = (rs * 1664525 + 1013904223) >>> 0) / 4294967296;
  return { root: root_,
    burst(origin, n = 20, radius = 8) {
      for (let i = 0; i < n; i++) { const p = pool.find(q => q.life <= 0); if (!p) break; const a = rnd() * Math.PI * 2, r = radius * (0.4 + 0.6 * rnd());
        p.m.position.set(origin.x + Math.cos(a) * r, origin.y + (rnd() - 0.3) * radius, origin.z + Math.sin(a) * r); p.v.set(Math.cos(a) * 5, 8 + rnd() * 10, Math.sin(a) * 5); p.life = p.max = 0.7 + rnd() * 0.7; p.m.visible = true; p.m.scale.setScalar(0.6 + rnd() * 0.9); }
    },
    update(dt) { for (const p of pool) { if (p.life <= 0) continue; p.life -= dt; if (p.life <= 0) { p.m.visible = false; continue; } p.v.y -= 9 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.y += dt * 4; p.m.material.opacity = Math.min(1, p.life / p.max * 2); } } };
}

function makeRed() {
  const skin = paintRedInto(new Skin(3, 3), { expr: 'smile' }), rig = buildCharacter(skin, { armWidth: 3 });
  rig.expr = 'smile'; rig.cloakOn = true; rig.hoodUp = false; rig.glow = 0.45;
  rig.setExpr = e => { if (!RED_FACES[e]) return; rig.expr = e; paintRedInto(rig.skin, { expr: e }); rig.tex.needsUpdate = true; };
  // The cloak, the hood, the plaits and the sparkles.
  const cloak = makeCloak(), hood = makeHood(), braids = [makeBraid(1), makeBraid(-1)], sparkles = makeSparkles();
  rig.torso.add(cloak.group); rig.neck.add(hood.up); rig.neck.add(hood.down); rig.root.add(sparkles.root);
  braids.forEach((b, i) => { b.group.position.set((i ? -1 : 1) * 5.1, 15.2, 3.4); rig.torso.add(b.group); });
  rig.cloak = cloak; rig.braids = braids; rig.sparkles = sparkles;
  const show = () => { cloak.group.visible = rig.cloakOn; hood.up.visible = rig.cloakOn && rig.hoodUp; hood.down.visible = rig.cloakOn && !rig.hoodUp; };
  rig.setCloak = (on, burst) => { const changed = on !== rig.cloakOn; rig.cloakOn = on; show(); if (burst !== false && changed) rig.sparkle(on ? 28 : 14); };
  rig.setHood = up => { rig.hoodUp = !!up; show(); };
  rig.sparkle = (n = 20) => sparkles.burst(new THREE.Vector3(0, 18, 0), n, 9);
  // Carrying something: it hangs from the left hand. rig.hold(basket) or rig.hold(null); set rig.motion.carry to bend the arm.
  rig.held = null; rig.hold = prop => { if (rig.held) rig.wristL.remove(rig.held); rig.held = prop; if (prop) { prop.position.set(0.4, -6.4, 1.6); rig.wristL.add(prop); } rig.motion.carry = !!prop; };
  // Per frame: the plaits swing with the walk, the stars pulse.
  let swing = 0;
  rig.steppers.push(dt => {
    const m = rig.motion, sp = Math.min(1, m.speed / 20); swing += dt;
    braids.forEach((b, i) => { const lag = Math.sin(m.phase * 1 + i * 0.6 + 0.8) * 0.22 * sp, idle = Math.sin(swing * 1.3 + i) * 0.03; b.segs.forEach((s, j) => { s.rotation.x = (lag + idle) * (0.5 + j * 0.25) + (m.air ? -0.25 : 0); s.rotation.z = Math.sin(swing * 0.9 + i + j) * 0.02; }); });
    const pulse = rig.glow * (0.8 + 0.2 * Math.sin(swing * 2.1)); for (const mt of cloak.mats) mt.emissiveIntensity = pulse;
    sparkles.update(dt);
  });
  show(); B_step_settle(rig);
  return rig;
}
function B_step_settle(rig) { for (let i = 0; i < 20; i++) step(rig, 0.1); }

root.Blocky = { Skin, EXPRESSIONS, RED, paintRedInto, makeRed, makeBasket, makeSparkles, makeCloak, makeHood, buildCharacter, locomotion, setPose, step, seatFeet, POSES, SIDES, FACES, sideOuter, boxGeo, faceRect };
})(typeof window !== 'undefined' ? window : globalThis);
