// Sound, all synthesised (no audio files): a soft pastoral score and a calm meadow theme, ambience (wind, birds), a few effects (footstep, chime, blip) and a speech
// babble for the cutscenes (a short vowel burst per word, pitched per speaker: add speakers to GameAudio.pitch).
// Browsers only start audio after a tap or key press: call GameAudio.init() from one (the title screen's buttons do).
(function (root) {
'use strict';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const A = { ctx: null, vols: { master: 0.8, music: 0.25, sfx: 0.8, voice: 0.7 }, nodes: {} };
try { const v = JSON.parse(localStorage.getItem('redlessons:volumes') || 'null'); if (v) Object.assign(A.vols, v); } catch (e) { /* no storage */ }

function noiseBuffer(ctx, seconds) {
  const n = Math.floor(ctx.sampleRate * seconds), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

A.init = function () {
  if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return A.ctx; }
  const Ctx = root.AudioContext || root.webkitAudioContext; if (!Ctx) return null;
  const ctx = A.ctx = new Ctx(), N = A.nodes;
  N.master = ctx.createGain(); N.master.connect(ctx.destination);
  N.music = ctx.createGain(); N.sfx = ctx.createGain(); N.voice = ctx.createGain(); N.amb = ctx.createGain();
  for (const g of [N.music, N.sfx, N.voice, N.amb]) g.connect(N.master);
  // A little room for the music and the voices: one soft feedback echo.
  N.echo = ctx.createDelay(1); N.echo.delayTime.value = 0.32; const fb = ctx.createGain(); fb.gain.value = 0.34; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
  N.echo.connect(lp); lp.connect(fb); fb.connect(N.echo); lp.connect(N.master);
  N.music.connect(N.echo);                                                  // (the echo is fed after the music's volume, so the slider and the ducking govern it too)
  N.noise = noiseBuffer(ctx, 3);
  A.setVol();
  return ctx;
};
A.setVol = function (k, v) {
  if (k) { A.vols[k] = clamp(v, 0, 1); try { localStorage.setItem('redlessons:volumes', JSON.stringify(A.vols)); } catch (e) { /* no storage */ } }
  const N = A.nodes; if (!A.ctx) return;
  N.master.gain.value = A.vols.master; N.music.gain.value = A.vols.music * 0.5; N.sfx.gain.value = A.vols.sfx; N.voice.gain.value = A.vols.voice * 1.1; N.amb.gain.value = A.vols.sfx * 0.16;      // (the dialogue sits well above the wind, the birds and the fire)
};

// ── Music: two short procedural themes. `A.startMusic({ theme })` begins one (or crossfades from the one that is playing); `A.stopMusic(secs)` fades it out. ──
//   pastoral: four slow chords on a warm triangle pad, a soft plucked line over them.   meadow: lydian, open and still, with high bells that ring on in the echo.
const CHORDS = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];             // Am, F, C, G
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const THEMES = {
  pastoral: { dt: 0.75, cut: 1500, play(step, t, tone) {
    const bar = Math.floor(step / 8) % 4, chord = CHORDS[bar], beat = step % 8;
    if (beat === 0) { for (const m of chord) tone(hz(m - 12), t, 6.2, 'triangle', 0.07); tone(hz(chord[0] - 24), t, 6.4, 'sine', 0.09); }
    if (beat % 2 === 0 || beat === 5) { const m = chord[[0, 1, 2, 1, 2, 0, 1, 2][beat]] + 12 + ((beat === 6) ? 12 : 0); tone(hz(m), t, 1.6, 'sine', 0.05); } } },
  meadow: { dt: 0.9, cut: 2600, play(step, t, tone, rnd) {
    const CH = [[48, 55, 59, 64], [50, 57, 62, 66], [52, 59, 62, 67], [50, 57, 62, 66 + 12 - 12]], bar = Math.floor(step / 8) % 4, chord = CH[bar], beat = step % 8, SC = [72, 74, 76, 78, 79, 81, 83, 84, 86, 88];       // C lydian
    if (beat === 0) { for (const m of chord) tone(hz(m), t, 7.4, 'sine', 0.045, 1.8); tone(hz(chord[0] - 12), t, 7.6, 'sine', 0.08, 1.8); }
    if (beat === 2 || beat === 5 || (beat === 7 && rnd() < 0.5)) { const m = SC[Math.floor(rnd() * SC.length)]; tone(hz(m), t, 4.2, 'sine', 0.05); tone(hz(m) * 2.76, t, 1.4, 'sine', 0.012); } } },
};
A.startMusic = function (opts) {
  if (!A.ctx) return; const want = (opts && opts.theme) || 'pastoral'; if (A.musicOn && A.musicTheme === want) return;
  if (A.musicOn) A.stopMusic(2.2);
  A.musicOn = true; A.musicTheme = want; const ctx = A.ctx, N = A.nodes, T = THEMES[want] || THEMES.pastoral; let step = 0, next = ctx.currentTime + 0.1, seed = 7 + want.length * 13;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const sess = ctx.createGain(); sess.gain.value = 1; const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = T.cut; filt.connect(sess); sess.connect(N.music);
  N.musicFilter = filt; A.musicSess = sess; let alive = true; A.musicStop = () => { alive = false; };
  const tone = (f, t, dur, type, peak, atk) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + (atk || Math.min(0.6, dur * 0.3))); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(filt); o.start(t); o.stop(t + dur + 0.05);
  };
  const tick = () => {
    if (!alive) return;
    while (next < ctx.currentTime + 1.5) { T.play(step, next, tone, rnd); next += T.dt; step++; }
    setTimeout(tick, 400);
  };
  tick();
};
A.stopMusic = function (fade = 1.5) {
  A.musicOn = false; A.musicTheme = null; if (A.musicStop) A.musicStop(); A.musicStop = null; if (!A.ctx || !A.musicSess) return;
  const g = A.musicSess.gain, t = A.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.0001, t + fade); A.musicSess = null;
};
A.duckMusic = function (to, secs = 1) { if (!A.ctx) return; const g = A.nodes.music, t = A.ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(Math.max(0.0001, A.vols.music * 0.5 * to), t + secs); };

// ── Ambience: wind (level 0..1), birds, a crackling fire. ─────────────────────────────────────────────────────────────────────────────────────
A.ambience = function (levels) {
  if (!A.ctx) return; const ctx = A.ctx, N = A.nodes; A.amb = Object.assign(A.amb || { wind: 0, birds: 0, fire: 0 }, levels);
  if (!N.windGain) {
    const src = ctx.createBufferSource(); src.buffer = N.noise; src.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.7;
    N.windGain = ctx.createGain(); N.windGain.gain.value = 0; src.connect(bp); bp.connect(N.windGain); N.windGain.connect(N.amb); src.start();
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 260; lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
    const fsrc = ctx.createBufferSource(); fsrc.buffer = N.noise; fsrc.loop = true; const flp = ctx.createBiquadFilter(); flp.type = 'lowpass'; flp.frequency.value = 220;
    N.fireGain = ctx.createGain(); N.fireGain.gain.value = 0; fsrc.connect(flp); flp.connect(N.fireGain); N.fireGain.connect(N.amb); fsrc.start();
    const chirp = () => {                                                         // birds and the fire's crackle: random little events
      const a = A.amb, t = ctx.currentTime;
      if (a.birds > 0.02 && Math.random() < 0.55) {
        const n = 1 + Math.floor(Math.random() * 3), f0 = 2200 + Math.random() * 1600;
        for (let i = 0; i < n; i++) { const o = ctx.createOscillator(), g = ctx.createGain(), s = t + i * 0.13; o.type = 'sine'; o.frequency.setValueAtTime(f0, s); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, s + 0.08);
          g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(0.05 * a.birds, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.1); o.connect(g); g.connect(N.amb); o.start(s); o.stop(s + 0.12); }
      }
      if (a.fire > 0.02) {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) { const s = t + Math.random() * 0.4, src2 = ctx.createBufferSource(); src2.buffer = N.noise; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500 + Math.random() * 2500;
          const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(0.12 * a.fire * Math.random(), s + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.04 + Math.random() * 0.05);
          src2.connect(hp); hp.connect(g); g.connect(N.amb); src2.start(s, Math.random()); src2.stop(s + 0.12); }
      }
      N.ambTimer = setTimeout(chirp, 220 + Math.random() * 700);
    };
    chirp();
  }
  const t = ctx.currentTime; N.windGain.gain.linearRampToValueAtTime(0.35 * A.amb.wind, t + 1.5); N.fireGain.gain.linearRampToValueAtTime(0.5 * A.amb.fire, t + 1.5);
};

// ── Speech babble: a vowel burst per word, so a line of dialogue is "spoken" over the length of its typing. who: a key of GameAudio.pitch ──
A.pitch = { red: 225, narrator: 150, wolf: 105 };
A.speak = function (who, text, seconds, opts) {   // opts.muffle: heard through a wall (louder in the filter, to carry); opts.vol scales it
  if (!A.init()) return { stop() {} }; const ctx = A.ctx, N = A.nodes, base = A.pitch[who] || 160, muffle = opts && opts.muffle;
  const words = text.split(/\s+/).filter(Boolean); let t = ctx.currentTime + 0.05; const step = seconds / Math.max(1, words.length), stopAt = t + seconds + 0.3, nodes = [];
  let dest = N.voice; if (muffle) { const m = ctx.createBiquadFilter(); m.type = 'lowpass'; m.frequency.value = (opts && opts.cutoff) || 520; m.connect(N.sfx); dest = m; }
  const vowels = [[700, 1100], [500, 1700], [350, 2300], [450, 800], [320, 900]];
  words.forEach((w, i) => {
    const s = t + i * step, len = clamp(0.05 + w.length * 0.018, 0.07, 0.2), v = vowels[(w.charCodeAt(0) + w.length) % vowels.length], q = /[?]$/.test(w) ? 1.18 : /[.!]$/.test(w) ? 0.88 : 1;
    const f0 = base * (0.92 + 0.16 * ((w.charCodeAt(w.length - 1) % 7) / 6)) * q;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, s); o.frequency.linearRampToValueAtTime(f0 * (q === 0.88 ? 0.9 : 1.05), s + len);
    g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(0.6 * (muffle ? 2 : 1) * ((opts && opts.vol) || 1), s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + len);
    for (const fc of v) { const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fc; f.Q.value = 4; const gg = ctx.createGain(); gg.gain.value = fc === v[0] ? 1 : 0.5; o.connect(f); f.connect(gg); gg.connect(g); }
    g.connect(dest); o.start(s); o.stop(s + len + 0.05); nodes.push(o);
  });
  return { stop() { for (const o of nodes) { try { o.stop(); } catch (e) { /* already stopped */ } } } };
};
// A footstep on the ground: a soft, short thump of filtered noise (surface 'grass' | 'stone' | 'wood').
A.step = function (surface, vol) {
  if (!A.init()) return; const ctx = A.ctx, N = A.nodes, t = ctx.currentTime, k = vol == null ? 0.5 : vol;
  const f = { grass: 700, stone: 2400, wood: 1300 }[surface] || 900, src = ctx.createBufferSource(); src.buffer = N.noise;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f; const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16 * k, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  src.connect(lp); lp.connect(g); g.connect(N.sfx); src.start(t, Math.random() * 2); src.stop(t + 0.12);
};
// A bright little chime (the cloak's sparkle): three rising bell tones.
A.chime = function (vol) {
  if (!A.init()) return; const ctx = A.ctx, t = ctx.currentTime, k = vol == null ? 0.5 : vol;
  [880, 1318.5, 1760].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(), s = t + i * 0.09; o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(0.09 * k, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.9); o.connect(g); g.connect(A.nodes.sfx); o.start(s); o.stop(s + 1); });
};
A.blip = function () { if (!A.init()) return; const ctx = A.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = 660; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); o.connect(g); g.connect(A.nodes.sfx); o.start(t); o.stop(t + 0.15); };

root.GameAudio = A;
})(typeof window !== 'undefined' ? window : globalThis);
