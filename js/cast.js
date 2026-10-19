// Red Lessons — the cast. Everyone is an adult, built on the blocky rig from js/blocky.js (ported from Climbing Toward Consequence):
// a head, a torso, two arms and two legs, cut at the elbow and knee, textured from a 64x64 skin painted here pixel by pixel.
//
//  • The heroine (working name in HEROINE_NAME): a grown woman in her mid-twenties who lives above her mother's bakery. Her own clothes are a
//    woman's working dress: a rust-brown bodice over a cream chemise, a long moss skirt, boots. The cloak is a separate piece (makeCloak):
//    waist-length, scarlet, hooded. Shrinking changes her scale only; nothing else about her model, clothes or face changes with size.
//  • Her mother, the baker: the emotional anchor of the story. She is NOT one of the givers (see js/ledger.js) and never appears in a correction.
//  • Grandmother, who gives the cloak; the woodcutter; and the villagers who hold her to the terms (the miller, the innkeeper).
//
// One painter (paintPerson) covers everybody from a spec of colours and garments, so a new villager is a few lines of data, not a new function.
// Exposes root.Cast = { HEROINE_NAME, WHO, PITCH, SPECS, paintPerson, make, makeCloak, EXPR }.
(function (root) {
'use strict';
const B = root.Blocky, THREE = root.THREE;

// Placeholder name. (It can't be "Red": that is the safe word, and the two must never be confused in a line of dialogue.)
const HEROINE_NAME = 'Rosa';

// Dialogue: the name over a line and its colour; and each speaker's voice pitch for the babble (js/audio.js).
const WHO = {
  heroine: [HEROINE_NAME, '#f08a7a'], mother: ['Mother', '#e6c48a'], grandmother: ['Grandmother', '#c8b8e8'],
  woodcutter: ['The Woodcutter', '#a8c890'], miller: ['The Miller', '#d8d0c0'], innkeeper: ['The Innkeeper', '#e0a8c0'], wolf: ['The Wolf', '#9aa8b8'],
};
const PITCH = { heroine: 215, mother: 195, grandmother: 175, woodcutter: 112, miller: 125, innkeeper: 200, wolf: 98 };

// Faces, eight pixels across, rows 3 to 7 of the head's front (rows 0 to 2 are hair and brow line). Palette keys: S skin, s shade, b brow,
// W white, E iris, l lid, M lip, T teeth, m open mouth, n nose shadow, k highlight, F freckle.
const FACES = {
  calm:    ['SbbSSbbS', 'SWESSEWS', 'SFSnnSFS', 'SSsMMsSS', 'SSSSSSSS'],
  smile:   ['SbbSSbbS', 'SlESSElS', 'SFSnnSFS', 'SMsTTsMS', 'SSSSSSSS'],
  sulk:    ['SSbSSbSS', 'SWESSEWS', 'SFSnnSFS', 'SSMMMMSS', 'SSSsSSSS'],
  defiant: ['bbSSSSbb', 'SWESSEWS', 'SFSnnSFS', 'SsMMMMSS', 'SSSSSSSS'],
  wince:   ['SbbSSbbS', 'SlESSElS', 'SFSnnSFS', 'SMMMMMMS', 'SSSSSSSS'],
  gritted: ['SddSSddS', 'SddSSddS', 'SFSnnSFS', 'SMTTTTMS', 'SSSSSSSS'],
  crying:  ['SddSSddS', 'SddSSddS', 'SFSnnSFS', 'SMmmmmMS', 'SSMmmMSS'],
};
const EXPR = Object.keys(FACES);

// The specs. Colours are hex; garments: top ('bodice' | 'shirt' | 'shawl'), lower ('skirt' | 'trousers'), apron (bool), boots (bool), beard (bool), bun (bool).
const SPECS = {
  heroine: {
    female: true, bun: false, skin: '#efc6a4', skinSh: '#d6a786', hair: '#7a3420', hairHi: '#984428', hairDk: '#5a2416', iris: '#4f7a5a', lip: '#b8565a', freckles: true,
    top: 'bodice', chemise: '#efe7d4', bodice: '#7a4a2a', bodiceDk: '#5e3820', lace: '#e6d2a0',
    lower: 'skirt', skirt: '#5f6e3e', skirtDk: '#4b5830', boots: true, boot: '#4a2f1c', long: true,
  },
  mother: {
    female: true, bun: true, bunCols: ['#8a6a48', '#a4835c', '#6a4e34', '#8a6a48', '#c8c0b4'], skin: '#e8bf9c', skinSh: '#cfa07e', hair: '#8a6a48', hairHi: '#a4835c', hairDk: '#6a4e34', grey: '#c8c0b4', iris: '#6a7f5a', lip: '#a8606a',
    top: 'bodice', chemise: '#ece6d6', bodice: '#9a5a3a', bodiceDk: '#7a4428', lace: '#e6d7b0',
    lower: 'skirt', skirt: '#6a5a7a', skirtDk: '#54466a', apron: true, apronCol: '#f4efe4', flour: true, boots: true, boot: '#3a2616',
  },
  grandmother: {
    female: true, bun: true, bunCols: ['#e8e4dc', '#f6f2ea', '#cdc6ba', '#e8e4dc', '#ffffff'], skin: '#e6c0a2', skinSh: '#c9a084', hair: '#e8e4dc', hairHi: '#f6f2ea', hairDk: '#bdb6aa', iris: '#6a8aa8', lip: '#b07a80', lined: true,
    top: 'shawl', chemise: '#e9e2d0', shawl: '#8a2a2a', shawlDk: '#6a1e1e', bodice: '#3a4a5a', bodiceDk: '#2c3846',
    lower: 'skirt', skirt: '#3a4a5a', skirtDk: '#2c3846', boots: true, boot: '#2a1a10',
  },
  woodcutter: {
    female: false, skin: '#d9a982', skinSh: '#bd8c66', hair: '#3a2a1a', hairHi: '#54402a', hairDk: '#24180e', iris: '#5a6a3a', lip: '#9a5a50', beard: true,
    top: 'shirt', shirt: '#8a2a22', shirtDk: '#6a1e18', check: '#2a1a14', lower: 'trousers', trousers: '#4a4636', trousersDk: '#3a3628', belt: '#2a1a10', boots: true, boot: '#2a1a10',
  },
  miller: {
    female: false, skin: '#e2b896', skinSh: '#c69a78', hair: '#b8a888', hairHi: '#d0c4a8', hairDk: '#968868', iris: '#5a7a8a', lip: '#a8706a', beard: false, flour: true,
    top: 'shirt', shirt: '#e8e2d2', shirtDk: '#cfc7b4', lower: 'trousers', trousers: '#8a7a5a', trousersDk: '#6e6046', belt: '#4a3220', apron: true, apronCol: '#d8cfb8', boots: true, boot: '#3a2616',
  },
  innkeeper: {
    female: true, bun: true, bunCols: ['#2a1a14', '#3e2a20', '#1a100c', '#2a1a14', '#5a4030'], skin: '#c8956e', skinSh: '#a87850', hair: '#2a1a14', hairHi: '#3e2a20', hairDk: '#1a100c', iris: '#4a3020', lip: '#9a4a4a',
    top: 'bodice', chemise: '#f0e8d8', bodice: '#2a5a5a', bodiceDk: '#1e4444', lace: '#d8c890',
    lower: 'skirt', skirt: '#5a3a2a', skirtDk: '#462c1e', apron: true, apronCol: '#ece4d0', boots: true, boot: '#2a1a10',
  },
};

// Paint one person into a Blocky.Skin (3-pixel arms) from a spec, with an expression.
function paintPerson(k, spec, st) {
  const C = Object.assign({ white: '#f2f0ea', brow: spec.hairDk || '#3a2418', mouth: '#6a2a2a', teeth: '#f6f2ea', lid: spec.skinSh, line: spec.skinSh }, spec);
  st = Object.assign({ expr: 'calm' }, st);
  k.ctx.clearRect(0, 0, 64, 64);
  const pal = { H: C.hair, h: C.hairHi, d: C.hairDk, g: C.grey || C.hairHi, S: C.skin, s: C.skinSh, b: C.brow, W: C.white, E: C.iris, l: C.lid, M: C.lip, T: C.teeth, m: C.mouth, n: C.skinSh, k: C.skin,
    F: spec.freckles ? '#d29a78' : C.skin };

  // Head: hair over the top three rows, then the face.
  k.all('head', C.skin);
  const face = FACES[st.expr] || FACES.calm;
  k.grid('head', 'front', [spec.grey ? 'HHgHHhHH' : 'HHHHHHHH', 'HhHHHHhH', 'HSSSSSSH', ...face], pal);
  if (spec.lined) { k.px('head', 'front', 1, 4, C.skinSh); k.px('head', 'front', 6, 4, C.skinSh); }
  if (spec.beard) k.grid('head', 'front', ['dddMMddd', 'dddddddd'], { d: C.hairDk, M: C.lip }, 0, 6);
  if (st.blush) for (const [x, y] of [[1, 5], [2, 5], [5, 5], [6, 5]]) k.px('head', 'front', x, y, '#e8938a');
  k.fill('head', 'top', C.hair); k.fill('head', 'back', C.hair);
  for (const f of ['right', 'left']) { k.fill('head', f, C.skin); k.fill('head', f, C.hair, 0, 0, undefined, 3); }
  k.fill('head', 'right', C.hair, 0, 3, 3, spec.long ? 5 : 3); k.fill('head', 'left', C.hair, 5, 3, 3, spec.long ? 5 : 3);
  if (spec.beard) { k.fill('head', 'right', C.hairDk, 3, 5, 5, 3); k.fill('head', 'left', C.hairDk, 0, 5, 5, 3); }
  k.fill('head', 'bottom', spec.beard ? C.hairDk : C.skinSh);
  // Hat layer: fuller hair. Long hair (the heroine's) falls loose down the back of the head and past the jaw at the sides.
  k.fill('hat', 'top', C.hair); k.grid('hat', 'top', ['.h..h...', '..h..h..', '.h..h..h', 'h..h..h.'], { h: C.hairHi }, 0, 2);
  k.fill('hat', 'back', C.hair, 0, 0, undefined, spec.long ? 8 : 6); k.px('hat', 'back', 2, 2, C.hairHi); k.px('hat', 'back', 5, 4, C.hairHi);
  for (const f of ['right', 'left']) k.fill('hat', f, C.hair, 0, 0, undefined, 3);
  k.fill('hat', 'right', C.hair, 0, 3, 3, spec.long ? 5 : 2); k.fill('hat', 'left', C.hair, 5, 3, 3, spec.long ? 5 : 2);
  k.grid('hat', 'front', spec.long ? ['HHhHHHHH', 'HH....hH', 'H......H'] : ['HHhHHHHH', 'H.H..hH.'], { H: C.hair, h: C.hairHi });

  // Torso.
  if (spec.top === 'shirt') {
    k.all('body', C.shirt);
    if (C.check) for (let y = 0; y < 12; y += 3) for (const f of B.SIDES) k.fill('body', f, C.check, 0, y, undefined, 1);
    k.grid('body', 'front', ['ssSSSSss', 'sssSSsss'], { s: C.shirt, S: C.skin });
    if (C.check) k.fill('body', 'front', C.check, 3, 2, 2, 1);
    for (const f of B.SIDES) k.fill('body', f, C.belt, 0, 9, undefined, 1);
    k.fill('body', 'front', '#c9a84c', 3, 9, 2, 1);
    k.fill('body', 'bottom', C.trousers);
  } else {
    // A bodice laced over a chemise (the shawl-wearer has the shawl over her shoulders instead of the laced front).
    k.all('body', C.bodice);
    k.grid('body', 'front', ['WWSSSSWW', 'WWWSSWWW', 'pppcPcpp', 'ppppccpp', 'pppcPcpp', 'ppppccpp', 'pppcPcpp', 'pppppppp'],
      { W: C.chemise, S: C.skin, p: C.bodice, P: C.bodiceDk, c: C.lace || C.chemise });
    for (const f of ['back', 'right', 'left']) k.fill('body', f, C.chemise, 0, 0, undefined, 2);
    k.fill('body', 'top', C.chemise); k.fill('body', 'bottom', C.skirt);
    if (spec.top === 'shawl') {
      for (const f of B.SIDES) { k.fill('jacket', f, C.shawl, 0, 0, undefined, 5); k.fill('jacket', f, C.shawlDk, 0, 4, undefined, 1); }
      k.fill('jacket', 'front', C.shawl, 2, 5, 4, 2); k.px('jacket', 'front', 3, 7, C.shawlDk); k.px('jacket', 'front', 4, 7, C.shawlDk);    // knotted at the breastbone
      k.fill('jacket', 'front', C.skin, 3, 0, 2, 1);
    }
    // The skirt flaring from the hip (the outer layer of the torso's lowest rows; the rest is on the legs' overlays).
    for (const f of B.SIDES) { k.fill('jacket', f, C.skirt, 0, 9, undefined, 3); k.fill('jacket', f, C.skirtDk, 0, 11, undefined, 1); }
  }
  if (spec.apron) {
    for (const f of B.SIDES) k.fill('jacket', f, C.apronCol, 0, 8, undefined, 1);
    k.fill('jacket', 'front', C.apronCol, 1, 8, 6, 4);
    if (spec.flour) { k.px('jacket', 'front', 2, 10, '#ffffff'); k.px('jacket', 'front', 5, 9, '#ffffff'); k.px('jacket', 'front', 4, 11, '#ffffff'); }
  }

  // Arms: sleeves to the elbow (the chemise's or the shirt's), bare forearms.
  for (const side of ['rArm', 'lArm']) {
    k.all(side, C.skin);
    const sleeve = spec.top === 'shirt' ? C.shirt : spec.top === 'shawl' ? C.shawl : C.chemise, sleeveDk = spec.top === 'shirt' ? C.shirtDk : spec.top === 'shawl' ? C.shawlDk : (C.lace || C.chemise);
    k.band(side, sleeve, 0, 6); k.band(side, sleeveDk, 5, 1); k.fill(side, 'top', sleeve); k.fill(side, 'bottom', C.skinSh);
    if (spec.top === 'shirt' && C.check) for (let y = 0; y < 6; y += 3) k.band(side, C.check, y, 1);
    k.band(side, C.skinSh, 10, 1);
    if (spec.flour) { k.px(side, 'front', 1, 8, '#ffffff'); k.px(side, 'front', 0, 10, '#f4efe4'); }
  }

  // Legs: trousers, or bare legs under a skirt overlay that reaches the ankle; boots.
  for (const leg of ['rLeg', 'lLeg']) {
    if (spec.lower === 'trousers') {
      k.all(leg, C.trousers); k.band(leg, C.trousersDk, 6, 1); k.fill(leg, 'top', C.trousers);
    } else {
      k.all(leg, C.skin); k.fill(leg, 'top', C.skirtDk);
      const o = B.sideOuter(leg);
      for (const f of B.SIDES) { k.fill(o, f, C.skirt, 0, 0, undefined, 10); k.fill(o, f, C.skirtDk, 0, 9, undefined, 1); k.px(o, f, 1, 3, C.skirtDk); k.px(o, f, 2, 7, C.skirtDk); }
      if (spec.apron) { const ax = leg === 'rLeg' ? 1 : 0; k.fill(o, 'front', C.apronCol, ax, 0, 3, 6); }
    }
    if (spec.boots) { k.band(leg, C.boot, 9, 3); k.band(leg, '#22160c', 11, 1); k.fill(leg, 'bottom', '#22160c'); }
  }
  k.grain(spec.female ? 3301 : 4409, 5, [{ x: 8, y: 8, w: 8, h: 8 }]);
  return k;
}

// Build a character from a spec id. Returns the rig, with rig.setExpr(name) to repaint the face.
function make(id, st) {
  const spec = SPECS[id];
  const k = paintPerson(new B.Skin(3, 3), spec, st);
  const rig = B.buildCharacter(k, { armWidth: 3, bun: !!spec.bun, bunCols: spec.bunCols, skirt: spec.lower === 'skirt', bust: !!spec.female });
  rig.id = id; rig.spec = spec;
  rig.setExpr = (expr, extra) => { paintPerson(k, spec, Object.assign({ expr }, extra || {})); rig.tex.needsUpdate = true; };
  return rig;
}

// The cloak: waist-length, scarlet, hooded. A cape hung from the shoulders down the back to the waist, a collar, and a hood that lies back
// on the shoulders (hood up: rig.cloak.hood(true)). Built from boxes with a small painted wool texture, parented to the torso so it moves with her.
function makeCloak(rig) {
  const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
  let s = 91; for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { s = (s * 1103515245 + 12345) >>> 0; const r = (s >> 16) % 10; x.fillStyle = r < 6 ? '#b3202a' : r < 9 ? '#9a1a22' : '#c8343a'; x.fillRect(i, j, 1, 1); }
  x.fillStyle = '#7a1218'; x.fillRect(0, 15, 16, 1);                          // the hem, darker
  const tex = new THREE.CanvasTexture(c); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.encoding = THREE.sRGBEncoding;
  const mat = new THREE.MeshLambertMaterial({ map: tex }), lining = new THREE.MeshLambertMaterial({ color: 0x5a1218 });
  const g = new THREE.Group(); g.name = 'cloak';
  // The torso's block runs from y 0 to 12 in the torso group (its mesh is centred at 6). The cape hangs from the shoulders (y 12) to the waist (y 3).
  const cape = new THREE.Mesh(new THREE.BoxGeometry(10.2, 9.6, 0.8), mat); cape.position.set(0, 7.4, -2.6); g.add(cape);
  for (const sg of [1, -1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.6, 4.6), mat); side.position.set(sg * 5.1, 7.4, -0.4); g.add(side); }      // wrapping round the arms' outsides
  const collar = new THREE.Mesh(new THREE.BoxGeometry(10.4, 1.2, 5.6), mat); collar.position.set(0, 11.9, -0.1); g.add(collar);
  const clasp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.4), new THREE.MeshLambertMaterial({ color: 0xd9b24a })); clasp.position.set(0, 11.6, 2.75); g.add(clasp);
  // The hood: lying back, a soft fold behind the neck; up, a shell around the head (lined dark inside).
  const down = new THREE.Mesh(new THREE.BoxGeometry(7, 2.4, 3), mat); down.position.set(0, 12.6, -3.6); g.add(down);
  const up = new THREE.Group(); up.visible = false; rig.neck.add(up);
  const shell = [[9.4, 1, 9.4, 0, 8.5, 0], [9.4, 9, 1, 0, 4.2, -4.7], [1, 9, 9.4, 4.7, 4.2, 0], [1, 9, 9.4, -4.7, 4.2, 0]];
  for (const [w, h, d, px, py, pz] of shell) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [mat, mat, mat, mat, mat, lining]); m.position.set(px, py, pz); up.add(m); }
  rig.torso.add(g);
  const api = { group: g, hood(on) { up.visible = !!on; down.visible = !on; }, show(on) { g.visible = !!on; if (!on) { up.visible = false; down.visible = true; } } };
  rig.cloak = api; api.show(false);
  return api;
}

root.Cast = { HEROINE_NAME, WHO, PITCH, SPECS, FACES, EXPR, paintPerson, make, makeCloak };
})(typeof window !== 'undefined' ? window : globalThis);
