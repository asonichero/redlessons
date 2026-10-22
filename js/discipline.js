// Little Red’s Lessons — a correction, scripted: whoever takes her (or him) in hand (js/correctors.js) works through the stages of a tier across
// their lap (js/lap.js), talking between and over the smacks. The tiers are Climbing Toward Consequence's: Token, Light, Firm, Severe. A tier says
// only what they have on at each stage (skirt down or lifted, drawers up or down), how many, and how hard. The implement isn't the tier's: the
// hand, unless the story brings out the corrector's own (env.implement), from a stage it chooses (env.implementFrom; the last, by default).
//
//   const r = await Discipline.run(lap, 'firm', { corrector: 'maren', subject: 'red', context, implement: true | 'hairbrush', implementFrom: 2,
//     stages: [...] (in place of the tier's), say: (text, kind, i) => …, sleep: ms => … })
//   → { hits, peak, stopped, rose (the same), tooHarsh, done, implement }      (kind: start, stage, implement, during, amber, done, after or corner
//   (env.corner: they're going to the corner after), stop, harsh)
//   (lap.end() from outside closes it quietly: nothing more is struck or said)
//
// The safe word is the subject's (Red's is her own name, Rose; at the Shoe it's Red). Said at any point (lap.rose()), it ends at once, wherever
// it is, and the corrector's closing line answers it: the only line that says it. Where the house uses traffic lights, amber (lap.amber()) is a
// check-in: the corrector answers it, and goes gentler. At "too harsh" nothing more is struck and it stops.
(function (root) {
'use strict';
const C = root.Correctors || (typeof require === 'function' ? require('./correctors.js') : null);
const TIERS = ['token', 'light', 'firm', 'severe'];
const TIER_NAMES = { token: 'Token', light: 'Light', firm: 'Firm', severe: 'Severe' };
const SCRIPTS = {
  token:  [{ skirt: 'down', drawers: 'up', n: 6, str: 0.7 }],
  light:  [{ skirt: 'down', drawers: 'up', n: 10, str: 0.85 }, { skirt: 'up', drawers: 'up', n: 10, str: 0.85 }],
  firm:   [{ skirt: 'down', drawers: 'up', n: 10, str: 1 }, { skirt: 'up', drawers: 'up', n: 12, str: 1 }, { skirt: 'up', drawers: 'down', n: 12, str: 1 }],
  severe: [{ skirt: 'down', drawers: 'up', n: 10, str: 1 }, { skirt: 'up', drawers: 'up', n: 12, str: 1 }, { skirt: 'up', drawers: 'down', n: 12, str: 1.05 }, { skirt: 'up', drawers: 'down', n: 12, str: 1.1 }],
};
// (her mother's lines, as they were: the default corrector's)
const LINES = C ? C.CORRECTORS.maren.lines : {};
const total = tier => (SCRIPTS[tier] || []).reduce((a, s) => a + s.n, 0);
// The stage's line as it begins: what changes from the stage before (the first opens with the start line).
function stageKey(prev, s, implNow, implPrev) {
  if (!prev) return 'start';
  if (implNow && !implPrev) return 'implement';
  if (s.drawers === 'down' && prev.drawers !== 'down') return 'drawers';
  if (s.skirt === 'up' && prev.skirt !== 'up') return 'skirt';
  return null;
}

async function run(lap, tier, env) {
  env = env || {};
  const script = env.stages || SCRIPTS[tier]; if (!script) throw new Error('Discipline: unknown tier ' + tier);
  const c = typeof env.corrector === 'object' ? env.corrector : C.corrector(env.corrector || 'maren');
  const s = typeof env.subject === 'object' ? env.subject : C.subject(env.subject || 'red', env.context);
  const own = env.implement === true ? c.implement : env.implement || null, from = env.implementFrom == null ? script.length - 1 : env.implementFrom;
  const say = env.say || (() => {}), sleep = env.sleep || (ms => new Promise(r => setTimeout(r, ms)));
  const line = (k, i) => C.line(c, s, k, i);
  const tell = (k, i) => { const t = line(k, i); if (t) say(t, k, i || 0); return t; };
  const stopped = () => lap.st.rose || lap.st.ended || lap.pain.tooHarsh;      // (ended: the scene was closed under it)
  const idle = async () => { while (lap.busy() && !lap.st.rose && !lap.st.ended) await sleep(50); };
  let ease = 1;
  // (a check-in, where the house has one: answered, and gentler from then on)
  const checkIn = async () => { if (!lap.st.amber) return; lap.st.amber = false; ease *= 0.75; tell('amber'); await sleep(1800); };
  let prev = null, chat = 0, used = false;
  for (let k = 0; k < script.length; k++) {
    const st = script[k]; if (stopped()) break;
    const implNow = !!own && k >= from, implPrev = !!own && k - 1 >= from && k > 0;
    lap.set({ skirt: st.skirt, drawers: st.drawers, implement: implNow ? own : 'hand', strength: st.str * ease });
    if (implNow) used = true;
    const key = stageKey(prev, st, implNow, implPrev); if (key) { tell(key); await sleep(1600); }
    if (stopped()) break;
    // The stage in runs, with a word between them.
    let left = st.n;
    while (left > 0 && !stopped()) {
      const n = Math.min(left, 4 + (chat % 3));
      lap.run(n); await idle(); left -= n;
      await checkIn(); lap.set({ strength: st.str * ease });
      if (left > 0 && !stopped()) { tell('during', chat); chat++; await sleep(900); }
    }
    prev = st;
  }
  const word = !!lap.st.rose, tooHarsh = !word && !!lap.pain.tooHarsh, closed = !word && !tooHarsh && lap.st.ended, done = !word && !tooHarsh && !closed;
  const out = { hits: lap.st.hits, peak: lap.st.peak, stopped: word, rose: word, tooHarsh, done, implement: used ? own : null };
  if (closed) return out;
  tell(word ? 'stop' : tooHarsh ? 'harsh' : 'done');
  if (done) { await sleep(1800); tell(env.corner ? 'corner' : 'after'); }      // (or to the corner, first, when the story sends them there)
  lap.end();
  return out;
}

const api = { TIERS, TIER_NAMES, SCRIPTS, LINES, total, stageKey, run };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Discipline = api;
})(typeof window !== 'undefined' ? window : globalThis);
