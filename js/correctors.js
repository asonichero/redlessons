// Little Red’s Lessons — who takes whom in hand, as profiles for a correction (js/discipline.js, js/correction.js): each corrector's own
// implement (js/implements.js), the stat they mind (js/reputation.js), their seat, and their lines (drafts, but each in their own voice); each
// subject's safe word and what they're called while it lasts; and the contexts that change those (the Shoe: Rose is there as Rose, the house
// uses traffic lights, and her word to stop is Red).
//
// Lines: start, skirt, drawers, implement (as it comes out), during (between runs), amber (answering a check-in, where the house has one), done,
// corner (sending them there), after, stop (answering the safe word: the only line that may say it), harsh. {name} is what the subject is called by this corrector here;
// {word} is their safe word.
//
//   Correctors.corrector('maren') · Correctors.subject('red', 'shoe') → { …, word, names, lights } · Correctors.line(c, s, 'start', i) → text
(function (root) {
'use strict';

const CORRECTORS = {
  maren: { name: 'Mother', rig: 'gerda', voice: 'gerda', implement: 'hairbrush', minds: 'wilful', seat: 'chair', lines: {
    start: 'Over my knee, {name}. You know what this is for.',
    skirt: 'Skirt up. No, don’t give me that look. Up.',
    drawers: 'And these down. We’re not finished, and you know it.',
    implement: 'The hairbrush now. Then we’re square, you and I.',
    during: ['Hold still.', 'You’ll take this better than you took my good sense.', 'Breathe, Red. I’m not going anywhere, and neither are you.', 'Nearly there.', 'Every one of these is earned, and you know it.'],
    done: 'There. That’s done, and it stays done.',
    corner: 'Now the corner, {name}. Hands on your head, and think.',
    after: 'Up you get, slowly, my {name}. Come here. We’re all right.',
    stop: 'All right, love. It’s over, all of it. Sit up with me, slowly. Talk to me.',
    harsh: 'That’s enough. More than enough. Up you get.',
  } },
  pennock: { name: 'Mistress Pennock', rig: 'pennock', voice: 'gerda', implement: 'bakersPaddle', minds: 'naughty', seat: 'bench', lines: {
    start: 'Pies don’t walk off by themselves, {name}. Over you come.',
    skirt: 'Up with it. Flour washes out; lessons don’t.',
    drawers: 'Those too. I’ve three dozen loaves to see to and no patience left.',
    implement: 'And now the paddle. It’s seen more mischief than my oven has.',
    during: ['Still, I said.', 'A pie is a morning’s work, {name}.', 'You’ll thank me, one day. Not today.', 'Almost.'],
    done: 'There. Now we’re even.',
    corner: 'Into the corner with you, {name}, hands on your head, where I can see you.',
    after: 'Up. Wash your face, then you can help me knead. Idle hands.',
    stop: '{word}. Right you are, dear. That’s the end of it. Sit. I’ll fetch you some milk.',
    harsh: 'Enough, enough. I’ve gone too far. Up you get, dear.',
  } },
  smith: { name: 'Master Ferrier', rig: 'smith', voice: 'smith', implement: 'strap', minds: 'wilful', seat: 'bench', lines: {
    start: 'Same as Tom gets. Same rules, same reasons. Across.',
    skirt: 'Skirt up.',
    drawers: 'And down. Tom’d tell you there’s no arguing it.',
    implement: 'The strap now. Brace.',
    during: ['Still.', 'Steady.', 'You knew the rule.', 'Nearly done.'],
    done: 'Done. It’s forgotten.',
    corner: 'Corner. Hands on your head. Same as Tom.',
    after: 'Up. Shake it off, {name}. Back to work.',
    stop: '{word}. Stopped. That’s that. Sit a while.',
    harsh: 'Enough. That’s more than you were owed. Up.',
  } },
  abney: { name: 'Mistress Abney', rig: 'abney', voice: 'gerda', implement: 'spoon', minds: 'naughty', seat: 'chair', lines: {
    start: 'A promise is a promise, {name}. Over my knee.',
    skirt: 'Up with your skirts. I’ve seen worse in the taproom.',
    drawers: 'Down with those as well. Broken promises cost.',
    implement: 'Now my spoon. I keep it for promises.',
    during: ['Every promise you make, you keep.', 'Mind me.', 'Hush now.', 'Nearly there, pet.'],
    done: 'There. Promise kept, both of us.',
    corner: 'In the corner, pet, hands on your head. Have a think about promises.',
    after: 'Up, pet. Dry your eyes. The ale won’t pour itself.',
    stop: '{word}. Hush, now. It’s finished. Come and sit by me.',
    harsh: 'Oh, enough. That was too much of me. Up you come.',
  } },
  // (only ever Red, agreed between the two of them with her mother's blessing, and never on his round: he walks her home, and it's done there, by her
  // own fire, with her own slipper from the hearth)
  willie: { name: 'Sir', rig: 'willie', voice: 'smith', implement: 'slipper', minds: 'wilful', seat: 'chair', lines: {
    start: 'Past nine, {name}, and you still out on the lane. Your mother and I agreed what happens now. Come here.',
    skirt: 'Skirt up, lass. I’d sooner be sat by my own fire, and so would you.',
    drawers: 'And down. We said we’d do it properly, the three of us.',
    implement: 'Fetch me your slipper from the hearth. That one. Thank you.',
    during: ['Still now.', 'Are the children in their beds? Not this one, not yet.', 'I’ll not have you on that lane alone in the dark.', 'Last few, {name}.'],
    done: 'There. That’s done.',
    corner: 'Stand by the dresser, hands on your head, while I have a word with your mother.',
    after: 'Up you get. Come here, lass. Your mother’s putting the kettle on.',
    stop: '{word}. That’s it stopped, all of it. Sit by the fire with me a minute.',
    harsh: 'Enough. That was more than I meant. Come here.',
  } },
  holt: { name: 'Holt', rig: 'holt', voice: 'smith', implement: 'switch', minds: 'wilful', seat: 'log', lines: {
    start: 'You don’t keep a man like him a secret. Over my knee.',
    skirt: 'Up.',
    drawers: 'Down. You need to feel this one.',
    implement: 'I cut this on the way. I hoped I’d not need it.',
    during: ['Still.', 'Think about who you told what.', 'He was watching you, every time.', 'Last of it.'],
    done: 'Done. Now we go home.',
    corner: 'Over there, by the wall. Hands on your head. Think it through.',
    after: 'Up. I’ve got you. Lean on me.',
    stop: '{word}. That’s enough, then. I’m here. We walk when you’re ready.',
    harsh: 'Enough. Too much. I’m sorry. Up you get.',
  } },
  motherBarrow: { name: 'Mother Barrow', rig: 'motherBarrow', voice: 'gran', implement: 'spurtle', minds: 'naughty', seat: 'chair', scots: true, lines: {
    start: 'Ma porridge, ma chair, ma bed. Ower ma knee, {name}.',
    skirt: 'Up wi’ it.',
    drawers: 'Doon wi’ those an’ a’.',
    implement: 'An’ the spurtle. It’s stirred thicker heids than yours.',
    during: ['Bide still.', 'Ye dinnae help yersel’ tae folk’s hames.', 'Wheesht, noo.', 'Near done.'],
    done: 'There. That’s it by wi’.',
    corner: 'Intae the corner, {name}, hands on yer heid.',
    after: 'Up ye get, hen. Ye’ll hae a bowl, an’ we’ll talk.',
    stop: '{word}. Aye, that’s it stopped. Come here tae me.',
    harsh: 'Enough. That’s mair than ye’d earned. Up, hen.',
  } },
  fatherBarrow: { name: 'Father Barrow', rig: 'fatherBarrow', voice: 'smith', implement: 'tawse', minds: 'wilful', seat: 'chair', scots: true, lines: {
    start: 'The door was yours tae see tae. Ower ma knee.',
    skirt: 'Up.',
    drawers: 'Doon.',
    implement: 'The tawse. Ye ken why.',
    during: ['Still, noo.', 'This hoose is kept by a’ three o’ us.', 'Near done.'],
    done: 'Done. It’s by.',
    corner: 'Corner. Hands on yer heid.',
    after: 'Up. Come here.',
    stop: '{word}. That’s it stopped. Sit wi’ me.',
    harsh: 'Enough. Ower much. Up.',
  } },
  // (the bonus story only, Peter and the Wolf: in the main story Peter's steadiness means it's been years since he needed to)
  fowler: { name: 'Grandad', rig: 'fowler', voice: 'gran', implement: 'walkingStick', minds: 'wilful', seat: 'chair', bonus: true, lines: {
    start: 'I told thee, Peter. The meadow gate, shut, every time. Come here.',
    skirt: 'Up wi’ thy shirt.',
    drawers: 'And them down. Tha knows how this goes.',
    implement: 'Fetch me my stick. Aye, that one.',
    during: ['Still, lad.', 'What if a wolf had come out o’ that wood, eh?', 'Tha’s not too big for this yet.', 'Nearly done.'],
    done: 'There. That’s done wi’.',
    corner: 'Stand thee in that corner, hands on thy head, and think on.',
    after: 'Up, lad. Come here. I’d not have owt happen to thee, that’s all.',
    stop: '{word}. Right. That’s all of it stopped. Sit by me a while.',
    harsh: 'Nay, that’s more than I meant. Up tha gets.',
  } },
  brannock: { name: 'Mother Brannock', rig: 'brannock', voice: 'gran', implement: 'birch', minds: 'wilful', seat: 'chair', lines: {
    start: 'Young ladies under this roof keep its rules, {name}. Over my knee.',
    skirt: 'Skirt up, as the house does it.',
    drawers: 'And those down, as the house does it.',
    implement: 'And now the birch, as the house does it.',
    during: ['Colour?', 'Still.', 'The rules are the rules for every girl here.', 'Nearly done.'],
    amber: 'Amber. Thank you for telling me. Breathe. We go gentler now.',
    done: 'There. Now to bed.',
    corner: 'To the corner, as the house does it. Hands on your head.',
    after: 'Up, and to bed with you. Sleep well.',
    stop: '{word}. Stopped, all of it. Well done for saying. Sit with me.',
    harsh: 'Enough. That’s enough for anyone. Up.',
  } },
};

// The subjects: their safe word, what correctors call them, and their voice (the cry's pitch). Every one of them a grown woman or man.
const SUBJECTS = {
  red: { rig: 'red', pitch: 215, word: 'Rose', names: ['Little Red', 'Red'], player: true },
  tom: { rig: 'tom', pitch: 140, word: 'Bellows', names: ['young Master Ferrier', 'Tom'] },      // (his own word; he doesn't use it)
  lucy: { rig: 'lucy', pitch: 225, word: 'Red', names: ['Lucy'] },
  maren: { rig: 'gerda', pitch: 190, word: 'Maren', names: ['Maren'] },                          // (Holt, at her asking, in 3.1)
  motherBarrow: { rig: 'motherBarrow', pitch: 180, word: 'Honey', names: ['Mother'] },
  fatherBarrow: { rig: 'fatherBarrow', pitch: 120, word: 'Honey', names: ['Father'] },
  weeBarrow: { rig: 'weeBarrow', pitch: 150, word: 'Honey', names: ['wee cub', 'little cub'] },
  peter: { rig: 'peter', pitch: 135, word: 'Meadow', names: ['Peter', 'lad'] },      // (the bonus story)
};
// Where a context changes the subject: at the Shoe, she's Rose, and the house's traffic lights are everyone's words (Red to stop, amber to check in).
const CONTEXTS = {
  shoe: { red: { names: ['Rose'], word: 'Red', lights: true }, lucy: { lights: true } },
};

const corrector = id => { const c = CORRECTORS[id]; if (!c) throw new Error('Correctors: no corrector ' + id); return Object.assign({ id }, c); };
function subject(id, context) {
  const s = SUBJECTS[id]; if (!s) throw new Error('Correctors: no subject ' + id);
  return Object.assign({ id, lights: false }, s, (CONTEXTS[context] || {})[id] || {});
}
// A line, with what this subject is called here put in (i: which, for the lines that come in turn).
function line(c, s, key, i) {
  const v = c.lines[key]; if (v == null) return null;
  const t = Array.isArray(v) ? v[(i || 0) % v.length] : v;
  return t.replace(/\{name\}/g, s.names[(i || 0) % s.names.length]).replace(/\{word\}/g, s.word);
}

const api = { CORRECTORS, SUBJECTS, CONTEXTS, corrector, subject, line };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.Correctors = api;
})(typeof window !== 'undefined' ? window : globalThis);
