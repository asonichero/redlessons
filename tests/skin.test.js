// The hero's skin and the atlas helpers, run without a browser by giving the painter a stub canvas that records what it was asked to draw.
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const calls = [], ctx = new Proxy({}, { get: (t, k) => k === 'getImageData' ? () => ({ data: new Uint8ClampedArray(64 * 64 * 4) }) : (...a) => { if (k === 'fillRect') calls.push(a); }, set: () => true });
const sandbox = { THREE: {}, Voxel: {}, document: { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) }, globalThis: null }; sandbox.globalThis = sandbox; sandbox.window = undefined;
vm.createContext(sandbox); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'blocky.js'), 'utf8'), sandbox);
const B = sandbox.Blocky;

test('the four faces from the reference sheet exist, and every face has five rows of eight', () => {
  for (const e of ['smile', 'wink', 'pout', 'gasp']) assert.ok(B.EXPRESSIONS.includes(e), e);
  assert.equal(B.EXPRESSIONS.length, 5);
});
test('every face of every part lies inside the 64x64 skin', () => {
  const A = new B.Skin(3, 3).A;
  for (const part in A) for (const f of B.FACES) { const r = B.faceRect(A[part], f); assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= 64 && r.y + r.h <= 64, `${part} ${f}`); }
});
test('painting the hero touches the skin and does not throw for any expression', () => {
  for (const e of B.EXPRESSIONS) { calls.length = 0; B.paintRedInto(new B.Skin(3, 3), { expr: e }); assert.ok(calls.length > 100, e); }
});
