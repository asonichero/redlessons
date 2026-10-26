// Little Red’s Lessons — two in a bed, held still: the end of the homecoming (and the title's tableau, with a game saved). Maren and Red lie in the
// cottage's bed on their sides, facing into the room, the blanket over them to the shoulders: Maren nearest the wall, Red spooned in front of
// her, a little further down the bed, so that Maren's face is just behind and above the back of Red's head, which she watches; Maren's top arm
// over Red's waist. Both a little curled, the knees drawn up.
//
//   const b = Bed.scene(stage, world, { looks, big: 'gerda', small: 'red' })   (world: a set's, with a bed among its seats; Red's cloak off for bed)
//   b.big, b.small (their rigs: faces are theirs to set) · b.shot() → { pos, look } (the view of them from the room) · b.tick(dt) · b.remove()
(function (root) {
'use strict';
const THREE = root.THREE, T = root.Toon, V3 = THREE.Vector3, Q = THREE.Quaternion;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

function scene(stage, world, o) {
  o = o || {};
  const L = root.Lap, looks = o.looks || (root.Looks ? root.Looks.load() : {}), group = new THREE.Group(); stage.scene.add(group);
  const bed = world.seats.find(s => s.kind === 'bed'); if (!bed) throw new Error('Bed: no bed here');
  // The bed's lie: along it toward the head; across it, toward the room (away from the wall it stands against); its top.
  const along = bed.head.clone().sub(bed.feet).setY(0).normalize(), up = new V3(0, 1, 0);
  let front = new V3().crossVectors(up, along).normalize();
  const mid = bed.head.clone().lerp(bed.feet, 0.5).setY(0), B = world.bounds;
  const edge = p => B ? Math.min(p.x - B.x0, B.x1 - p.x, p.z - B.z0, B.z1 - p.z) : 0;
  if (B && edge(mid.clone().addScaledVector(front, 10)) < edge(mid.clone().addScaledVector(front, -10))) front.negate();      // (the wall's on the other side)
  const top = bed.feet.y + 0.7;      // (on the quilt)
  const left = new V3().crossVectors(along, front).normalize();      // (a figure lying on its right side: its left is up)
  const lie = new Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(left, along, front));

  // A figure, lying: its own frame turned so that its up runs along the bed and its front faces the room, its hip joint at the frame's origin.
  function lying(id, look) {
    const r = T.make(id, look || {}); const f = new THREE.Group(); f.add(r.root); group.add(f);
    r.root.position.y = -T.DIM.hipY * r.scaleW; f.quaternion.copy(lie);
    r.root.updateMatrixWorld(true);
    r.headOff = r.headGroup.getWorldPosition(new V3()).distanceTo(r.hips.getWorldPosition(new V3()));      // (hips to the middle of the head)
    if (stage.cast) stage.cast(r); r.frame = f; return r;
  }
  const bigLook = looks[o.big || 'gerda'], smallLook = Object.assign({}, looks[o.small || 'red'], { outfit: o.smallOutfit || 'No cloak' });      // (her cloak off for bed, at last)
  const big = lying(o.big || 'gerda', bigLook), small = lying(o.small || 'red', smallLook);
  big.setDress({ skirt: 'off' }); small.setDress({ skirt: 'off' });      // (their skirts off for bed: under the blanket, their drawers and shifts)
  // Where they lie: Maren's head on the bolster, toward the wall; Red in front of her, her head lower down the bed, under Maren's chin.
  const side = r => 3.3 * r.scaleW;      // (lying on a side, how high the hip joint is above what it lies on)
  const bh = bed.head.clone().setY(0);
  const across = d => mid.clone().setY(0).addScaledVector(front, d).addScaledVector(along, bh.clone().sub(mid).dot(along));      // (a line along the bed, d toward the room)
  const place = (r, d, down) => { const at = across(d).addScaledVector(along, -(r.headOff + down)); r.frame.position.copy(at).setY(top + side(r)); r.frame.updateMatrixWorld(true); };
  place(big, -4.2, 0.6); place(small, 1.4, 4.6 * big.scaleW);

  // Their poses (each in its own frame: as if standing, so a forward swing of a thigh draws the knee up toward the chest).
  const pose = (r, p) => {
    r.hips.rotation.set(0, 0, 0); r.torso.rotation.set(p.torso, 0, 0);
    for (const [s, sd] of [['L', 1], ['R', -1]]) { r['thigh' + s].rotation.set(p.thigh + (s === 'L' ? -0.12 : 0), 0, sd * 0.05); r['knee' + s].rotation.set(p.knee, 0, 0); r['ankle' + s].rotation.set(0.45, 0, 0); }
    r.neck.rotation.set(p.neck || 0, 0, 0); r.head.rotation.set(0, 0, 0);
    r.root.updateMatrixWorld(true);
  };
  pose(small, { torso: 0.16, thigh: -1.0, knee: 1.35, neck: 0.18 });
  pose(big, { torso: 0.1, thigh: -0.8, knee: 1.15, neck: 0.12 });
  // Red's hands drawn up together in front of her chest; Maren's lower arm under the bolster, her upper one over Red's waist.
  const sc = small.scaleW, bs = big.scaleW;
  const chest = small.torso.localToWorld(new V3(0, 5.2, 3.2));
  L.armIK(small, 'L', chest.clone().addScaledVector(along, 1.2 * sc).addScaledVector(up, 1.2 * sc), front.clone().addScaledVector(along, -0.5));
  L.armIK(small, 'R', chest.clone().addScaledVector(along, 2.4 * sc).addScaledVector(up, -1.6 * sc), front.clone().addScaledVector(along, -0.6));
  // (her lower arm lies forward on the bed, bent, the hand under the bolster by her face)
  L.armIK(big, 'R', big.headGroup.getWorldPosition(new V3()).addScaledVector(along, -1.0 * bs).addScaledVector(up, -3.4 * bs).addScaledVector(front, 3.0 * bs), front.clone().addScaledVector(along, -1).addScaledVector(up, -0.4));
  const waist = small.hips.localToWorld(new V3(0, 2.4, 2.6)).addScaledVector(up, 1.2 * sc);
  L.armIK(big, 'L', waist, front.clone().addScaledVector(along, -0.8).addScaledVector(up, 0.2));      // (the elbow forward and down the bed: the arm lying over her, not raised)
  { const h = big.handL, d = front.clone().addScaledVector(along, -0.3).normalize(); L.setWorldQuat(h, L.basis(up.clone().negate().multiplyScalar(big.palm.L), d.negate())); }      // (the hand flat over her)
  // Maren's face turned down a little toward the back of Red's head, watching it.
  { const at = small.headGroup.getWorldPosition(new V3()), n = big.neck; n.rotation.set(0, 0, 0); big.head.rotation.set(0, 0, 0); big.root.updateMatrixWorld(true);
    const l = at.clone().sub(n.getWorldPosition(new V3())).applyQuaternion(big.torso.getWorldQuaternion(new Q()).invert());
    const yaw = clamp(Math.atan2(l.x, l.z), -0.9, 0.9), pitch = clamp(Math.atan2(-l.y, Math.hypot(l.x, l.z)), -0.4, 0.8);
    n.rotation.set(pitch * 0.6, yaw * 0.7, 0); big.head.rotation.set(pitch * 0.35, yaw * 0.25, 0); big.root.updateMatrixWorld(true); }

  // ── The blanket: over the two of them from their feet to their shoulders, shaped over them (a height over the bed at each point, from the
  // round of their bodies there), and over the bed's edge on the room's side, hanging down.
  const blanket = (() => {
    const pts = []; const add = (r, b, local, rad) => pts.push({ c: r[b].localToWorld(local.clone()), r: rad * r.scaleW });
    for (const r of [big, small]) {
      add(r, 'hips', new V3(0, 0.5, 0), 4.6); add(r, 'torso', new V3(0, 3, 0), 4.4); add(r, 'torso', new V3(0, 6, 0.4), 4.2);
      for (const s of ['L', 'R']) { add(r, 'thigh' + s, new V3(0, -3.5, 0), 3.0); add(r, 'knee' + s, new V3(0, 0, 0), 2.4); add(r, 'knee' + s, new V3(0, -3.5, 0), 2.0); add(r, 'ankle' + s, new V3(0, 0, 0.6), 2.6); add(r, 'ankle' + s, new V3(0, -1.2, 2.0), 2.4); }
    }
    pts.push({ c: big.handL.localToWorld(new V3(0, -1, 0)), r: 1.3 * bs }, { c: big.elbowL.localToWorld(new V3(0, -2, 0)), r: 1.8 * bs });      // (her arm over Red, under it too)
    // (from the feet end of the bed to Red's shoulders; from the wall's side to past the room's edge, where it falls)
    const shoulder = small.torso.localToWorld(new V3(0, 7.0, 0)).sub(mid).dot(along) - 0.5, feetEnd = bed.feet.clone().sub(mid).dot(along) - 4.5;
    const halfW = 11.2, hang = 5.5, NA = 44, NC = 30;
    const geo = new THREE.PlaneGeometry(1, 1, NA, NC), pos = geo.attributes.position, H = [];
    for (let j = 0; j <= NC; j++) for (let i = 0; i <= NA; i++) {
      const a = feetEnd + (shoulder - feetEnd) * i / NA, c = -halfW + (2 * halfW + hang) * j / NC, p = mid.clone().addScaledVector(along, a).addScaledVector(front, c);
      let h = top + 0.5; for (const q of pts) { const d = Math.hypot(p.x - q.c.x, p.z - q.c.z); if (d < q.r) h = Math.max(h, q.c.y + Math.sqrt(q.r * q.r - d * d) + 0.35); }
      if (c > halfW) h = top + 0.5 - (c - halfW) * 1.5;      // (over the edge, falling)
      H.push({ p, h, c });
    }
    // (smoothed, so it lies as cloth over them, not as a skin)
    for (let pass = 0; pass < 3; pass++) { const h0 = H.map(v => v.h); for (let j = 1; j < NC; j++) for (let i = 1; i < NA; i++) { const k = j * (NA + 1) + i; if (H[k].c > halfW) continue; H[k].h = Math.max(top + 0.5, (h0[k] * 4 + h0[k - 1] + h0[k + 1] + h0[k - NA - 1] + h0[k + NA + 1]) / 8); } }
    H.forEach((v, k) => pos.setXYZ(k, v.p.x, v.h, v.p.z)); geo.computeVertexNormals();
    // (the patchwork quilt off the bed, its squares across it)
    const tex = root.Cottage.kit.textures().quilt.clone(); tex.needsUpdate = true; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1.6, 1.3);
    const m = new THREE.MeshToonMaterial({ color: 0xffffff, map: tex, gradientMap: T.mat('#ffffff').gradientMap, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, m); mesh.castShadow = mesh.receiveShadow = true; group.add(mesh);
    return mesh;
  })();
  void blanket;

  // The view of them: from the room, a little toward the foot of the bed and above, the two faces in it. (o.far: further back by that much;
  // o.right: the two of them set that far toward the right of the view, as a share of its width, for a menu down the left)
  function shot(o) {
    o = o || {};
    const hb = big.headGroup.getWorldPosition(new V3()), hs = small.headGroup.getWorldPosition(new V3()), m = hb.clone().lerp(hs, 0.5), k = o.far || 1;
    const pos = m.clone().addScaledVector(front, 30 * k).addScaledVector(along, -9 * k).add(new V3(0, 9 * k, 0)), look = m.clone().add(new V3(0, -2.5, 0)).addScaledVector(along, -2);
    if (o.right) { const d = look.clone().sub(pos), r = new V3().crossVectors(d, up).normalize(); look.addScaledVector(r, -o.right * d.length() * 0.8); }
    return { pos, look };
  }
  function tick(dt) { big.tick(dt); small.tick(dt); }
  function remove() { stage.scene.remove(group); }
  big.breath = 0.6; small.breath = 0.6;
  big.setExpr('wistful'); small.setExpr('calm');
  return { big, small, group, shot, tick, remove, front, along };
}

root.Bed = { scene };
})(typeof window !== 'undefined' ? window : globalThis);
