// Where a correction's played (js/corrlayout.js): each room's own giver's seat, unless the room editor's moved it (never the glade's, which
// is fixed); the editor's places for those watching (three at most), and its corner, if it's set one.
const test = require('node:test'), assert = require('node:assert/strict');
const mem = {}; globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const CL = require('../js/corrlayout.js');

test('the room’s own places for watchers and its corner, until the editor changes them (a corner taken away stays away)', () => {
  const room = { corr: { key: 'inn', giver: { x: 0, z: 4, yaw: 0 }, watchers: [{ x: 26.5, z: 29.5 }, { x: -51, z: 6 }], corner: { x: -34, z: -30, yaw: 3.142 } } };
  assert.deepEqual(CL.get(room).watchers, [{ x: 26.5, z: 29.5 }, { x: -51, z: 6 }]); assert.deepEqual(CL.get(room).corner, { x: -34, z: -30, yaw: 3.142 });
  CL.save('inn', { watchers: [{ x: 1, z: 1 }], corner: null }); assert.deepEqual(CL.get(room).watchers, [{ x: 1, z: 1 }]); assert.equal(CL.get(room).corner, null);
  CL.reset('inn'); assert.equal(CL.get(room).watchers.length, 2);
});

test('the room’s own seat, until the editor moves it; the glade’s never moves', () => {
  const room = { corr: { key: 'bakery', giver: { x: 0, z: 3, yaw: 0 }, seat: 'bench', hide: ['the bench'] } };
  assert.deepEqual(CL.get(room).at, { x: 0, z: 3, yaw: 0 }); assert.equal(CL.get(room).seat, 'bench'); assert.deepEqual(CL.get(room).watchers, []); assert.equal(CL.get(room).corner, null);
  CL.save('bakery', { giver: { x: 10, z: -4, yaw: 1 }, watchers: [{ x: 1, z: 2 }, { x: 3, z: 4 }, { x: 5, z: 6 }, { x: 7, z: 8 }], corner: { x: -30, z: 20, yaw: 2 } });
  const g = CL.get(room); assert.deepEqual(g.at, { x: 10, z: -4, yaw: 1 }); assert.equal(g.watchers.length, CL.MAX_WATCHERS); assert.deepEqual(g.corner, { x: -30, z: 20, yaw: 2 });
  const glade = { corr: { key: 'glade', giver: { x: 5, z: 900, yaw: 0.5 }, seat: 'log', fixed: true } };
  CL.save('glade', { giver: { x: 0, z: 0, yaw: 0 }, watchers: [{ x: 1, z: 901 }] });
  assert.deepEqual(CL.get(glade).at, { x: 5, z: 900, yaw: 0.5 }, 'fixed: the fallen tree'); assert.deepEqual(CL.get(glade).watchers, [{ x: 1, z: 901 }]);
  CL.reset('bakery'); assert.deepEqual(CL.get(room).at, { x: 0, z: 3, yaw: 0 });
  assert.equal(CL.get({}), null, 'no correction in a room without one');
});
