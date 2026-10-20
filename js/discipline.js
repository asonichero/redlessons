// Red Lessons — a correction, scripted: Gerda takes Red Riding Hood across her lap (js/lap.js) and works through the stages of a tier, talking between and over
// the smacks. The tiers are Climbing Toward Consequence's: Token, Light, Firm, Severe. Each stage says what she has on (skirt down or lifted, drawers
// up or down), the implement, how many, and how hard. Gerda never calls her "Red": that word is the safe word.
//
//   const r = await Discipline.run(lap, 'firm', { say: text => …, sleep: ms => … })   →   { hits, peak, red, tooHarsh, done }
//   (lap.end() from outside closes it quietly: nothing more is struck or said)
//
// Red (lap.red()) ends it at once, wherever it is, and her closing line is the gentle one. At "too harsh" nothing more is struck and she stops.
(function (root) {
'use strict';
const TIERS = ['token', 'light', 'firm', 'severe'];
const TIER_NAMES = { token: 'Token', light: 'Light', firm: 'Firm', severe: 'Severe' };
const SCRIPTS = {
  token:  [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 6, str: 0.7 }],
  light:  [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 10, str: 0.85 }, { skirt: 'up', drawers: 'up', impl: 'hand', n: 10, str: 0.85 }],
  firm:   [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 10, str: 1 }, { skirt: 'up', drawers: 'up', impl: 'hand', n: 12, str: 1 }, { skirt: 'up', drawers: 'down', impl: 'hand', n: 12, str: 1 }],
  severe: [{ skirt: 'down', drawers: 'up', impl: 'hand', n: 10, str: 1 }, { skirt: 'up', drawers: 'up', impl: 'hand', n: 12, str: 1 }, { skirt: 'up', drawers: 'down', impl: 'hand', n: 12, str: 1.05 }, { skirt: 'up', drawers: 'down', impl: 'paddle', n: 10, str: 1 }],
};
// What Gerda says: practical, warm, and she means it.
const LINES = {
  start: 'Over my knee, young lady. You know what this is for.',
  skirt: 'Skirt up. No, don’t give me that look. Up.',
  drawers: 'And these down. We’re not finished, and you know it.',
  paddle: 'The paddle now. Then we’re square, you and I.',
  during: ['Hold still.', 'You’ll take this better than you took my good nature.', 'Breathe. I’m not going anywhere, and neither are you.', 'Nearly there.', 'Every one of these is earned, and you know it.'],
  done: 'There. That’s done, and it stays done.',
  after: 'Up you get, slowly. Come here. We’re all right.',
  red: 'Red. All right, love, that’s it. It’s over. Up you come, gently.',
  harsh: 'That’s enough. More than enough. Up you get.',
};
const line = (k, i) => { const v = LINES[k]; return Array.isArray(v) ? v[(i || 0) % v.length] : v; };
// The stage's line as it begins: what changes from the stage before (the first stage opens with the start line).
function stageLine(prev, s) {
  if (!prev) return line('start');
  if (s.impl === 'paddle' && prev.impl !== 'paddle') return line('paddle');
  if (s.drawers === 'down' && prev.drawers !== 'down') return line('drawers');
  if (s.skirt === 'up' && prev.skirt !== 'up') return line('skirt');
  return null;
}
const total = tier => (SCRIPTS[tier] || []).reduce((a, s) => a + s.n, 0);

async function run(lap, tier, env) {
  const script = SCRIPTS[tier]; if (!script) throw new Error('Discipline: unknown tier ' + tier);
  env = env || {};
  const say = env.say || (() => {}), sleep = env.sleep || (ms => new Promise(r => setTimeout(r, ms)));
  const stopped = () => lap.st.red || lap.st.ended || lap.pain.tooHarsh;      // (ended: the scene was closed under it)
  const idle = async () => { while (lap.busy() && !lap.st.red && !lap.st.ended) await sleep(50); };
  let prev = null, chat = 0;
  for (const s of script) {
    if (stopped()) break;
    lap.set({ skirt: s.skirt, drawers: s.drawers, implement: s.impl, strength: s.str });
    const l = stageLine(prev, s); if (l) { say(l); await sleep(1600); }
    if (stopped()) break;
    // The stage in runs, with a word from her between them.
    let left = s.n;
    while (left > 0 && !stopped()) {
      const n = Math.min(left, 4 + (chat % 3));
      lap.run(n); await idle(); left -= n;
      if (left > 0 && !stopped()) { say(line('during', chat++)); await sleep(900); }
    }
    prev = s;
  }
  const red = !!lap.st.red, tooHarsh = !red && !!lap.pain.tooHarsh, closed = !red && !tooHarsh && lap.st.ended, done = !red && !tooHarsh && !closed;
  if (closed) return { hits: lap.st.hits, peak: lap.st.peak, red, tooHarsh, done };
  say(red ? line('red') : tooHarsh ? line('harsh') : line('done'));
  if (done) { await sleep(1800); say(line('after')); }
  lap.end();
  return { hits: lap.st.hits, peak: lap.st.peak, red, tooHarsh, done };
}

const api = { TIERS, TIER_NAMES, SCRIPTS, LINES, total, stageLine, run };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Discipline = api;
})(typeof window !== 'undefined' ? window : globalThis);
