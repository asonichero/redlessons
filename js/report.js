// Little Red’s Lessons — telling her mother her day, at dinner and at supper. Her mother asks; and Red tells her what she will, a thing at a
// time (each with its word between them, and then the choice again), or says there's nothing much (nothing else, once she's told one). Then
// whatever her mother has noticed for herself, and Red hasn't said, she asks about: the flowers she's been round, the loaf on the board, a
// dare the village is talking of, the errand; and Red owns up, or lies. What's told or asked at dinner isn't again at supper.
//
//   Report.run(P, w, { when: 'dinner' | 'supper' }) → the topics told and asked (ids) · Report.topics(P, w, when) (what there is)
// Kept in the save (state.report): { day, said: [ids] } (told or asked today).
(function (root) {
'use strict';
const H = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const M = (face, text, red) => ({ who: 'mother', face, listen: { red: red || 'calm' }, text });
const R = (face, text) => ({ who: 'red', face, listen: { mother: 'calm' }, text });
const stateOf = w => { const s = w.save.state.report; return s && s.day === w.cal.day ? s : { day: w.cal.day, said: [] }; };
const said = (w, id) => w.save.change(s => { const r = s.report && s.report.day === w.cal.day ? s.report : (s.report = { day: w.cal.day, said: [] }); if (!r.said.includes(id)) r.said.push(id); }, { report: true });
const clock = m => root.Calendar.clockOf(m).replace(/ in the (morning|afternoon|evening)| at night/, '');
// (a lie, found out at once: naughty, and her mother says so)
const lied = (w, why) => w.rep.add('naughty', 1, why);
const FULL = { pennock: 'Mistress Pennock', abney: 'Mistress Abney', smith: 'Master Ferrier', willie: 'Master William', hulda: 'Grandmother', agnes: 'Agnes', bess: 'Bess' };

// What there is to tell, now: each { id, label (her words, to choose), tell (the two of them, said) | own(P) (said, and what follows: async),
// noticed (her mother knows of it already), raise(P) (her mother asks, if it's not told: async) }.
function topics(P, w, when) {
  const S = root.Story, out = [], c = w.save.state.chores || {}, d = w.cal.day, E = S.ERRANDS, ch = w.chores, sup = when === 'supper';
  const e = c.day === d && c.errand && E[c.errand.id] ? Object.assign({ key: c.errand.id }, E[c.errand.id], c.errand) : null, st = e && e.state;
  // The errand: done, still to do (at dinner), or let slide.
  if (e && (st === 'done' || st === 'carrying') && !e.shift) out.push({ id: 'errand:done', label: 'I ' + e.did + (e.late ? '. Late, but I did it.' : '.'), noticed: true,
    tell: [e.late ? M('calm', 'Late’s better than never. Earlier, next time.') : M('smile', 'Good girl. That’s ' + e.it + ' seen to.', 'smile')],
    raise: [M('smile', 'I see ' + e.it + '’s seen to. Good girl.', 'smile')] });
  else if (e && e.shift && st === 'done') out.push({ id: 'errand:done', label: 'I ' + e.did + '.', noticed: false, tell: [M('smile', 'Good girl. They’ll have been glad of you.', 'smile')] });
  else if (e && st === 'accepted' && !sup) out.push({ id: 'errand:accepted', label: 'I’ve still to ' + e.todo + (e.mind ? '.' : ', by ' + clock(e.by) + '.'), noticed: true,
    tell: [M('calm', e.mind ? e.mind : 'By ' + clock(e.by) + ', then. Not a minute after.')], raise: [M('calm', 'You’ve still ' + e.it + ' to see to. ' + (e.mind ? e.mind : 'By ' + clock(e.by) + '.'))] });
  else if (e && (st === 'broken' || st === 'missed')) {
    const dry = e.key === 'well' && ch && ch.gardenDry && ch.gardenDry();
    out.push({ id: 'errand:' + st, label: e.key === 'dunns' && st === 'missed' ? 'The Dunns’ pie. I left it too late.' : 'I never got to ' + e.it + '. I’m sorry, Mama.', noticed: true,
      tell: [dry ? M('stern', 'No. And my flowers stood dry all day for it. One thing let slide runs on into the next. Thank you for saying so.', 'shy') : M('stern', 'No. You were told, and you let it slide. Thank you for saying so, at least.', 'shy')],
      raise: async P_ => { let ans = null;
        await P_.converse([M('stern', 'What about ' + e.it + '?', 'shy'), { choose: [
          { text: 'I didn’t get to it, Mama. I’m sorry.', face: 'shy', then: [{ run: () => { ans = 'own'; } }, M('stern', 'No. You were told, and you let it slide.', 'shy')] },
          { text: 'I did, Mama.', face: 'shy', then: [{ run: () => { ans = 'lie'; } }, M('stern', 'You did not. Don’t stand there and tell me you did. That’s worse than the forgetting.', 'wince')] } ] }], { shot: ['red', 'mother'] });
        if (ans === 'lie') lied(w, 'lying to Mama about ' + e.it); } });
  }
  // The garden: hers today, done or not.
  const G = root.Garden, gHers = ch && ch.on && ch.on() && G && !G.offToday(w);
  if (gHers) {
    const gp = G.progress(w), done = ch.gardenTended ? ch.gardenTended() : gp.done, dry = ch.gardenDry && ch.gardenDry();
    const trod = G.trodden ? G.trodden(w).length : 0;      // (her flowers trodden down, more than a slip: no praise for the rest of it)
    if (done && trod > 3) out.push({ id: 'garden:done', label: 'The weeding’s done, and the rows watered.', noticed: false, tell: [M('stern', 'The weeding. Yes.', 'shy')] });
    else if (done) out.push({ id: 'garden:done', label: 'The garden’s done.', noticed: sup, tell: [M('smile', sup ? 'I saw. The bells look pleased with themselves.' : 'Already? Good girl.', 'smile')], raise: [M('smile', 'I saw the garden’s done. The bells look pleased with themselves.', 'smile')] });
    else if (!sup && gp.begun) out.push({ id: 'garden:begun', label: 'I’ve made a start on the garden.', noticed: false, tell: [M('calm', 'Then finish it this afternoon.')] });
    else if (!sup) out.push({ id: 'garden:untouched', label: 'I haven’t got to the garden yet.', noticed: false, tell: [M('stern', 'Before dark, mind. I’ll look when I’m home.', 'shy')] });
    else if (sup) out.push({ id: 'garden:left', label: dry ? 'The flowers went without, Mama. The butt was dry.' : 'I didn’t get to the garden, Mama.', noticed: true,
      tell: [dry ? M('stern', 'No. For the water you were to bring. That’s the well’s to answer for, not the garden’s.', 'shy') : w.cal.minute >= H('19:00') ? M('stern', 'No. And now it’s too dark to.', 'shy') : M('stern', 'Then before the light goes. I’ll not ask twice.', 'shy')],
      raise: async P_ => { let ans = null;
        await P_.converse([M('calm', 'What about the garden?', 'shy'), { choose: [
          { text: dry ? 'All but the flowers. The butt was dry.' : 'I didn’t get to it, Mama.', face: 'shy', then: [{ run: () => { ans = 'own'; } }, dry ? M('stern', 'No. That’s the well’s to answer for.', 'shy') : M('stern', 'No. I could see that from the gate.', 'shy')] },
          { text: 'It’s done, Mama.', face: 'shy', then: [{ run: () => { ans = 'lie'; } }, M('stern', 'Is it. I walked past it on my way in, Little Red. I’ve eyes.', 'wince')] } ] }], { shot: ['red', 'mother'] });
        if (ans === 'lie') lied(w, 'lying to Mama about the garden'); } });
  }
  // Her flowers, trodden: hers to own up to; her mother's to ask about if she's seen (at dinner, those trodden today, on her way in; of an
  // evening, when she's been round the garden).
  if (G && G.trodden) {
    const ids = G.trodden(w), gs = G.stateOf(w), today = ids.some(id => gs.trampled[id] === d), look = sup && G.lookDue(w) && gs.evening !== d;
    const noticed = (!sup && today) || look;
    if (ids.length) out.push({ id: 'flowers', label: 'I trod on some of your flowers, Mama. I’m sorry.', noticed,
      own: async P_ => { await G.reckon(P_, w, { dinner: !sup, owned: true }); if (!sup) w.save.change(s => { s.garden.mended = d; }, { garden: true }); },
      raise: async P_ => { await G.reckon(P_, w, { dinner: !sup }); if (!sup) w.save.change(s => { s.garden.mended = d; }, { garden: true }); } });
    else if (look) out.push({ id: 'flowers', label: null, noticed: true, raise: async P_ => { await G.reckon(P_, w, {}); } });      // (been round, and found them standing)
  }
  // The loaf: off the board, or gone down, or gone; her mother sees the board at every meal.
  const L = root.Loaf, lk = L && L.tellable ? L.tellable(w) : null;
  if (lk) out.push({ id: 'loaf', label: lk === 'taken' ? 'I took the loaf off the board, Mama. It’s in my basket.' : lk === 'fed' ? 'Peter and I fed some of the loaf to the ducks.' : 'I took the loaf, and Peter and I fed it to the ducks.', noticed: true,
    own: async P_ => { await L.own(P_, w, lk); }, raise: async P_ => { await L.evening(P_, w, { table: true }); } });
  // The pie, the day Mistress Pennock sent her home: hers to tell; kept back, her mother hears it tomorrow.
  const Pie = root.Pie;
  if (Pie && Pie.tellable && Pie.tellable(w)) out.push({ id: 'pie', label: 'Mama… I took one of Mistress Pennock’s pies. On Tom’s dare. She caught us.', noticed: false,
    own: async P_ => { await Pie.own(P_, w); }, unsaid: () => Pie.keep(w) });
  // Corrected by someone else, today: hers to tell; if they've told her mother themselves, her mother says so; kept back, it's hers to carry.
  const Ev = root.Evening;
  for (const cc of (Ev && Ev.freshCorrections ? Ev.freshCorrections(w) : [])) out.push({ id: 'corrected:' + cc.id, label: (FULL[cc.by] || 'Someone') + ' took me in hand today, Mama.', noticed: !!cc.informs,
    own: async P_ => { await Ev.reprieveSaid(P_, w, cc, 'reported'); }, raise: async P_ => { await Ev.reprieveSaid(P_, w, cc, 'heard'); }, unsaid: () => Ev.reprieveSaid(P, w, cc, 'withheld') });
  // A promise to Mistress Abney, to sit with Bess: hers to tell her mother, before the evening comes (her hour lifted for it, and Master William told)
  { const AP = root.AbneyPromise, ps = AP && AP.stateOf ? AP.stateOf(w) : null;
    if (ps && ps.day && ps.day >= d && !ps.kept && !ps.broken && !ps.mamaTold) out.push({ id: 'promise', label: 'Mistress Abney’s asked me to sit with Bess ' + (ps.day > d ? 'tomorrow evening' : 'this evening') + ', till she’s back. I said I would.', noticed: false,
      tell: S.promiseToldMama(), after: () => { w.save.change(s => { s.promise.mamaTold = d; }, { promise: true }); w.save.flag('willie-told-promise', ps.day); } }); }
  // A dare the village is talking of: the bell rung in broad day (heard by dinner, or supper), a knock at the Dunns' (by supper).
  const fl = w.save.state.flags || {}, dare = fl['rang-bell'] === d ? 'bell' : fl['woke-willie'] === d ? 'knock' : null;
  if (dare) out.push({ id: 'dare', label: dare === 'bell' ? 'I rang the curfew bell, Mama. Tom dared me.' : 'I knocked at the Dunns’ and ran. Tom dared me.', noticed: dare === 'bell' || sup,
    tell: [M('stern', dare === 'bell' ? 'Half the green came out for that bell.' : 'You woke Master William, after his night on the lanes.', 'wince'), M('calm', 'Tom Ferrier’s idea, I don’t doubt. And your feet that did it. Thank you for telling me straight.', 'shy')],
    raise: async P_ => { let ans = null;
      await P_.converse([M('calm', dare === 'bell' ? 'Someone rang the curfew bell in broad day, I hear. Half the green came out.' : 'Somebody woke Master William today. Three knocks, and nobody there.', 'wince'), { choose: [
        { text: 'That was me, Mama. Tom dared me.', face: 'wince', then: [{ run: () => { ans = 'own'; } }, M('calm', 'I thought as much. Thank you for not making me drag it out of you.', 'shy')] },
        { text: 'Did they? Who’d do that?', face: 'shy', then: [{ run: () => { ans = 'lie'; } }, M('stern', 'Hm. Who indeed.', 'wince')] } ] }], { shot: ['red', 'mother'] });
      if (ans === 'lie') w.rep.add('naughty', 0.5, 'saying she didn’t know who did Tom’s dare'); } });
  // Good things, hers to tell or not: Grandmother's herb, Peter at the beech, the bread.
  const herb = root.Herbs && root.Herbs.stateOf(w).day === d ? root.Herbs.HERBS[root.Herbs.stateOf(w).n - 1] : null;
  if (herb) out.push({ id: 'herb', label: 'Grandmother showed me ' + herb.name + ' today, and what it’s good for.', noticed: false, tell: [M('smile', 'Did she, now. She taught me the same at your age. I’ve forgotten half of it.', 'smile')] });
  if (sup && fl['met-peter'] === d) out.push({ id: 'peter', label: 'I saw Peter, at the beech.', noticed: false, tell: [M('smile', 'Did you, now.', 'shy')] });
  const shop = L && L.shopping ? L.shopping(w) : null;
  if (sup && shop && shop.asked) { const eGood = !e || st === 'done' || st === 'carrying';
    if (shop.done) out.push({ id: 'shop', label: 'There’s a fresh loaf on the board, from Mistress Pennock.', noticed: true,
      tell: [e && eGood ? M('smile', 'Both, and the bread besides. I’m twice grateful, love.', 'smile') : M('calm', 'Thank you, love. That’s one thing I needn’t think about.')], raise: [M('smile', e && eGood ? 'A fresh loaf on the board, and the rest done. I’m twice grateful, love.' : 'There’s bread, I see. Thank you, love.', 'smile')],
      after: () => { if (e && eGood) w.rep.trusts('maren', 0.5); } });
    else out.push({ id: 'shop', label: 'I didn’t get to Mistress Pennock’s counter, Mama.', noticed: true, tell: [M('calm', eGood ? 'Never mind. You did what I asked first. Tomorrow, if she’s any left.' : 'Well. Tomorrow, then. Early.')], raise: [M('calm', 'No bread, I see. Never mind. Tomorrow, then.', 'shy')] }); }
  const done = stateOf(w).said;
  return out.filter(t => !done.includes(t.id));
}

// Her day, told: her mother's question, then Red's choices a thing at a time; and after, what her mother asks of her own.
async function run(P, w, o) {
  const when = (o && o.when) || 'supper', all = topics(P, w, when), told = [], shot = { shot: ['red', 'mother'] };
  let left = all.filter(t => t.label), n = 0;
  while (true) {
    let pick = null;
    const opts = left.map(t => ({ text: t.label, face: t.id === 'herb' || t.id === 'peter' || t.id.endsWith(':done') || t.id === 'shop' && /fresh/.test(t.label) ? 'smile' : 'shy', then: [{ run: () => { pick = t; } }] }));
    opts.push({ text: n ? 'Nothing else, Mama.' : 'Nothing much, Mama.', face: 'calm', then: [{ run: () => { pick = 'none'; } }] });
    await P.converse([{ choose: opts }], shot);
    if (!pick || pick === 'none') break;
    n++; told.push(pick); said(w, pick.id); left = left.filter(t => t !== pick);
    // (one thing that goes wrong in the telling doesn't end the rest of it: it's put aside, and the choice comes again)
    try { if (pick.own) await pick.own(P); else if (pick.tell) await P.converse([R(pick.id === 'herb' || pick.id.endsWith(':done') ? 'smile' : 'shy', pick.label)].concat((pick.tell || []).filter(Boolean)), shot);
      if (pick.after) pick.after(); } catch (err) { if (root.console) console.error('Report: ' + pick.id, err); }
    if (!left.length) break;
  }
  if (!n) await P.converse([M('calm', 'Nothing at all? Well. Those days are allowed too.')], shot);
  // (what she's noticed for herself, and hasn't been told)
  for (const t of all) {
    if (told.includes(t)) continue;
    if (t.noticed && t.raise) { said(w, t.id); if (typeof t.raise === 'function') await t.raise(P); else await P.converse(t.raise, shot); if (t.after) t.after(); }
    else if (t.unsaid) t.unsaid();
  }
  return told.map(t => t.id);
}

const api = { run, topics, stateOf };
root.Report = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
