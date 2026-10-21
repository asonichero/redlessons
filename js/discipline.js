// Little Red’s Lessons — a correction, scripted: her mother takes Little Red across her lap (js/lap.js) and works through the stages of a tier, talking between
// and over the smacks. The tiers are Climbing Toward Consequence's: Token, Light, Firm, Severe. Each stage says what she has on (skirt down or lifted,
// drawers up or down), the implement, how many, and how hard.
//
//   const r = await Discipline.run(lap, 'firm', { say: (text, kind) => …, sleep: ms => … })   (kind: start, stage, during, done, after, rose, harsh)   →   { hits, peak, rose, tooHarsh, done }
//   (lap.end() from outside closes it quietly: nothing more is struck or said)
//
// The safe word is her own name. If she says "Rose" (lap.rose()) she's Rose again, a grown woman who needs a different kind of care: it ends at once,
// wherever it is, and her mother's closing line is the gentle one, to Rose. Her mother calls her Red, or Little Red, and never Rose while it lasts.
// At "too harsh" nothing more is struck and she stops.
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
// What her mother says: practical, warm, and she means it.
const LINES = {
  start: 'Over my knee, Little Red. You know what this is for.',
  skirt: 'Skirt up. No, don’t give me that look. Up.',
  drawers: 'And these down. We’re not finished, and you know it.',
  paddle: 'The paddle now. Then we’re square, you and I.',
  during: ['Hold still.', 'You’ll take this better than you took my good sense.', 'Breathe, Red. I’m not going anywhere, and neither are you.', 'Nearly there.', 'Every one of these is earned, and you know it.'],
  done: 'There. That’s done, and it stays done.',
  after: 'Up you get, slowly, my Little Red. Come here. We’re all right.',
  rose: 'Rose. All right, love. It’s over, all of it. Sit up with me, slowly. Talk to me.',
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
  const stopped = () => lap.st.rose || lap.st.ended || lap.pain.tooHarsh;      // (ended: the scene was closed under it)
  const idle = async () => { while (lap.busy() && !lap.st.rose && !lap.st.ended) await sleep(50); };
  let prev = null, chat = 0;
  for (const s of script) {
    if (stopped()) break;
    lap.set({ skirt: s.skirt, drawers: s.drawers, implement: s.impl, strength: s.str });
    const l = stageLine(prev, s); if (l) { say(l, prev ? 'stage' : 'start'); await sleep(1600); }
    if (stopped()) break;
    // The stage in runs, with a word from her between them.
    let left = s.n;
    while (left > 0 && !stopped()) {
      const n = Math.min(left, 4 + (chat % 3));
      lap.run(n); await idle(); left -= n;
      if (left > 0 && !stopped()) { say(line('during', chat), 'during', chat); chat++; await sleep(900); }
    }
    prev = s;
  }
  const rose = !!lap.st.rose, tooHarsh = !rose && !!lap.pain.tooHarsh, closed = !rose && !tooHarsh && lap.st.ended, done = !rose && !tooHarsh && !closed;
  if (closed) return { hits: lap.st.hits, peak: lap.st.peak, rose, tooHarsh, done };
  say(rose ? line('rose') : tooHarsh ? line('harsh') : line('done'), rose ? 'rose' : tooHarsh ? 'harsh' : 'done');
  if (done) { await sleep(1800); say(line('after'), 'after'); }
  lap.end();
  return { hits: lap.st.hits, peak: lap.st.peak, rose, tooHarsh, done };
}

const api = { TIERS, TIER_NAMES, SCRIPTS, LINES, total, stageLine, run };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Discipline = api;
})(typeof window !== 'undefined' ? window : globalThis);
