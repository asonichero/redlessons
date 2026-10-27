// Little Red’s Lessons — the story's conversations, as scripts for js/talk.js. Speakers: 'red' (Rose: Red to her mother, her grandmother and Peter; Little
// Red in her cloak), 'mother' (Maren, whom Rose only ever calls Mama) and 'gran' (Hulda, her grandmother). Faces are js/toon.js's expressions: calm, smile, shy, bashful, cheeky, pout,
// stern, surprised, wince, gritted, crying, concerned, sad.
//
// Chapter one, the homecoming: Red comes in late in the dusk from her grandmother's, through the wood, in the new red cloak her grandmother made
// her, and morose. Her mother sees it at once. (A first draft: the beats are the ones agreed; the words are for tuning.)
(function (root) {
'use strict';

// (ctx: what the scene knows of her way home: { walk: { bluebells, stream, beech } (1: she stayed there), bunch: 'posy' | 'armful' (the
// bluebells in her hands), clean(), lie() (run as she answers whether she came straight home) }. Without it: a posy, and nothing stayed for.)
const homecoming = ctx => { ctx = Object.assign({ walk: { bluebells: 0, stream: 0, beech: 0 }, bunch: 'posy', clean: () => {}, lie: () => {} }, ctx || {}); const big = ctx.bunch === 'armful'; return [
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'There you are! I was about to light the lantern and come looking for you.' },
  { who: 'red', face: 'shy', listen: { mother: 'concerned' }, text: 'I’m sorry. I lost track of the time.' },
  // (the bluebells in her hands: the first her mother knows that she didn't come straight home, whatever she says of it after)
  ...(big ? [
    { who: 'mother', face: 'surprised', listen: { red: 'shy' }, text: 'Red, that’s half the bluebell glade in your arms.' },
    { who: 'red', face: 'shy', listen: { mother: 'calm' }, text: 'They’re for you. I… got carried away.' },
    { who: 'mother', face: 'cheeky', listen: { red: 'shy' }, text: 'So I see.' },
  ] : [
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'And bluebells. From the glade off the wood path, I’d guess.' },
    { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: 'For you. You always liked them.' },
  ]),
  { who: 'mother', face: 'surprised', listen: { red: 'calm' }, text: '…Well, you’re home now. And with a fine new cloak! Your grandmother’s work?' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: 'She made it for me, like the one I used to have. When I turned round to show her, she called me Little Red like it was the very same one.' },
  { who: 'mother', face: 'smile', listen: { red: 'pout' }, text: 'She would. It suits you. It always did.' },
  { who: 'mother', face: 'calm', listen: { red: 'pout' }, text: 'Sit down. Tell me what’s sitting on you, because something is.' },
  { choose: [
    { text: 'It’s nothing. I’m just tired.', face: 'shy', then: [
      { who: 'mother', face: 'cheeky', listen: { red: 'pout' }, text: 'Red. I’ve known your “nothing” for nineteen years.' },
      { who: 'red', face: 'pout', text: '…Fine. It’s not nothing.' },
    ] },
    { text: 'I don’t want to be grown, Mama.', then: [
      { who: 'mother', face: 'surprised', listen: { red: 'shy' }, text: 'Oh. Well. That’s not nothing, is it?' },
    ] },
  ] },
  { who: 'red', face: 'pout', text: 'Everyone looks at me differently now. The baker’s wife asks after my prospects. Old Halloran calls me “Miss Rose”.' },
  { who: 'red', face: 'shy', text: 'And Peter… Peter looks at me like I’m a question he’s working up to asking.' },
  { who: 'red', face: 'wince', text: 'You hand me the mending, and the Hallorans’ calving, and I do it. I do. But it sits so heavy, Mama, all of it, all the time.' },
  { who: 'red', face: 'shy', text: 'And today, at Grandmother’s, when I put the cloak on… I felt light. Like before.' },
  { who: 'mother', face: 'calm', text: 'Before what, love?' },
  { who: 'red', face: 'shy', text: 'Before I had to be anybody.' },
  { who: 'mother', face: 'concerned', listen: { red: 'shy' }, text: 'Oh, Red.' },
  { who: 'mother', face: 'smile', text: 'Then be Little Red a while. I carried this house on my own before; I can carry it again. The mending will keep, and the Hallorans can find another pair of hands.' },
  { who: 'red', face: 'pout', listen: { mother: 'calm' }, text: 'No. That’s not… that isn’t it either.' },
  { who: 'mother', face: 'calm', text: 'Then tell me what it is.' },
  { who: 'red', face: 'shy', text: 'Do you remember the winter after Papa? I went out on the ice on the mill pond because Tom Ferrier dared me.' },
  { who: 'mother', face: 'cheeky', listen: { red: 'shy' }, text: 'I remember pulling you off it by your collar.' },
  { who: 'red', face: 'shy', listen: { mother: 'calm' }, text: 'And you brought me home, and you took me over your knee, and I howled the whole way through. And after, you held me by the fire until I fell asleep.' },
  { who: 'red', face: 'shy', listen: { mother: 'concerned' }, text: 'I’ve never felt so safe. Not before, not since. Somebody had hold of me. Somebody would stop me.' },
  { who: 'mother', face: 'pout', listen: { red: 'shy' }, text: '...' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Being Little Red. Is part of it being held to account?' },
  { choose: [
    { text: '…Yes.' },
    { text: 'Yes. I think it is.' },
  ] },
  { who: 'red', face: 'shy', listen: { mother: 'calm' }, text: '…Is that so strange?' },
  { who: 'mother', face: 'smile', text: 'No, love. It isn’t strange at all.' },
  { who: 'mother', face: 'calm', listen: { red: 'concerned' }, text: 'Then let’s start as we mean to go on. Your grandmother will have sent you home long before the light faded. So tell me, and tell me true. Did you come straight home?' },
  { choose: [
    { text: 'No, Mama. I stopped on the way.', face: 'shy', then: [
      { run: ctx.clean },
      ...confession(ctx.walk).map(t => ({ who: 'red', face: 'shy', listen: { mother: 'calm' }, text: t })),
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me true. That counts for something, and I’ll remember it.' },
    ] },
    { text: 'I came straight home, Mama. Truly.', face: 'shy', then: [
      { run: ctx.lie },
      { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: big ? 'With half the bluebell glade in your arms?' : 'With bluebells from the glade, a good way off the path?' },
      { who: 'red', face: 'wince', listen: { mother: 'stern' }, text: '…I stopped. I’m sorry. Only for moments. The bluebells, the stream, the old beech.' },
      ...(ctx.walk.bluebells || ctx.walk.stream || ctx.walk.beech ? [{ who: 'red', face: 'gritted', text: 'Well… Maybe more than a moment…' }] : []),      // (if she stayed at any of them)
      { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'I know you did. And now there’s a lie on top of the lateness, and that’s worse.' },
    ] },
  ] },
  { who: 'mother', face: 'calm', listen: { red: 'concerned' }, text: 'You lingered in the wood as dusk crept in. Alone. After I’ve told you a hundred times.' },
  { who: 'red', face: 'wince', text: 'It wasn’t so dark, Mama—' },
  { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'It was dark enough. Nothing happened, and that’s luck, and I won’t have you leaning on luck. You’ll not walk away from this one unscathed, Little Red.' },
  { who: 'mother', face: 'calm', text: 'But hear me first, because this matters more than the rest of it.' },
  { who: 'mother', face: 'calm', listen: { red: 'concerned' }, text: 'If it’s ever too much, not sore, not sorry, too much, you say your name. Your own name. Rose.' },
  { who: 'mother', face: 'calm', text: 'And then you’re Rose again, a grown woman, and I stop, and we sit and talk as two women do. No questions asked, and no shame in it. Ever.' },
  { who: 'red', face: 'shy', text: 'Rose.' },
  { who: 'mother', face: 'smile', text: 'That’s the one.' },
  { who: 'mother', face: 'stern', listen: { red: 'concerned' }, text: 'Now, come here, young lady.' },
]; };
// (what she owns to, coming clean: each place she stopped, in turn, and more where she stayed: the bluebells, if she only stopped there, are
// just how the stream's begins; and if she stayed nowhere, that the moments added up)
const confession = walk => {
  const said = [];
  if (walk.bluebells) said.push('The bluebells were so pretty, once I started I just kept on picking. There was always one bluer, just past the last.');
  said.push((walk.bluebells ? 'I' : 'After the bluebells, I') + ' sat on the flat stone by the stream' + (walk.stream ? ', thinking, far longer than I meant to.' : '.'));
  said.push('And at the old beech, where Peter carved our letters.' + (walk.beech ? ' I couldn’t make myself leave it.' : ''));
  if (!walk.bluebells && !walk.stream && !walk.beech) said.push('Only a moment at each. They added up.');
  return said;
};

// Chapter one opens at her grandmother's: the last of the afternoon, tea and cake at the round table, the old woman fussing, Rose letting her. Then
// the gift: a red cloak like the one she wore as a girl. She puts it on and turns round to show it, and her grandmother calls her Little Red.
// (ctx: the scene's moves, run in order: ctx.fetchGift, ctx.giveGift, ctx.openGift, ctx.twirl, ctx.seeOff.) Speakers: 'red' and 'gran'.
const grandmother = ctx => [
  { who: 'gran', face: 'smile', listen: { red: 'calm' }, text: 'Another slice. Go on. You’re all elbows and no supper.' },
  { who: 'red', face: 'cheeky', text: 'Grandmother, that’s my third.' },
  { who: 'gran', face: 'cheeky', listen: { red: 'smile' }, text: 'And who’s counting? Not me. My eyes are going.' },
  { who: 'red', face: 'smile', text: 'Your eyes miss nothing, and you know it.' },
  { who: 'gran', face: 'smile', text: 'They miss nothing that matters. Now. The village. Is the miller’s lad still mooning after the Thatcher girl?' },
  { who: 'red', face: 'cheeky', listen: { gran: 'surprised' }, text: 'Worse. He’s written her a poem. He rhymed “Agnes” with “magnets”.' },
  { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Magnets! Lord preserve us. I hope she let him down gently.' },
  { who: 'gran', face: 'calm', text: 'And your mother? Working herself to the bone, I suppose.' },
  { who: 'red', face: 'pout', text: 'She’s got me doing half of it now. The mending, the Hallorans’ cows, sitting up with Mistress Abney’s daughter…' },
  { who: 'gran', face: 'calm', listen: { red: 'shy' }, text: 'Has she, now? And how do you find it?' },
  { choose: [
    { text: 'Heavy.', then: [
      { who: 'gran', face: 'calm', listen: { red: 'shy' }, text: 'Mm. It is, at first. It sits heavy till you grow into it.' },
    ] },
    { text: 'Fine. It’s fine.', then: [
      { who: 'gran', face: 'stern', listen: { red: 'pout' }, text: '“Fine”, she says, with a face like a wet Sunday.' },
    ] },
  ] },
  { who: 'gran', face: 'smile', text: 'Well. You’re not to carry any of it in this house. In this house you’re my girl, and you’ll eat cake and let an old woman fuss.' },
  { who: 'red', face: 'bashful', listen: { gran: 'smile' }, text: 'I like being fussed.' },
  { who: 'gran', face: 'cheeky', text: 'I know you do. Which is why I’ve made you something. Stay there.' },
  { run: ctx.fetchGift },
  { who: 'gran', face: 'smile', listen: { red: 'surprised' }, text: 'Here. Go on, open it.' },
  { run: ctx.giveGift },
  { text: 'Inside the paper is a cloak of good red wool, lined and edged with cream, with a deep hood: the very twin of the one she wore when she was small.' },
  { run: ctx.openGift },
  { who: 'red', face: 'surprised', listen: { gran: 'smile' }, text: 'Grandmother… it’s just like my old one.' },
  { who: 'gran', face: 'smile', text: 'Like it, only bigger. I thought you might be missing it. There. Turn round, let me look at you.' },
  { run: ctx.twirl },
  { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Oh, look at you. Little Red.' },
  { who: 'red', face: 'smile', listen: { gran: 'smile' }, text: '…Little Red.' },
  { who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'Now. The light’s going, and your mother will skin us both if you’re late. Straight home, mind. Stay on the path.' },
  { who: 'red', face: 'cheeky', text: 'Straight home. On the path.' },
  { who: 'gran', face: 'cheeky', listen: { red: 'smile' }, text: 'I’ve heard that before. Off you go, Little Red.' },
  { run: ctx.seeOff },
];
// If she talks to her grandmother again before she goes.
const granAgain = () => [
  { who: 'gran', face: 'smile', listen: { red: 'shy' }, text: 'Still here? The light won’t wait for you, Little Red. Straight home.' },
];

// The walk home: what she thinks, at points along the path (how far along it, 0..1), and at the places she can stop.
const WALK = [
  [0.03, 'smile', 'Little Red. Nobody’s called me that since I was twelve.'],
  [0.09, 'shy', 'It smells like Grandmother’s chest. Lavender, and woodsmoke.'],
  [0.21, 'calm', 'When did everyone start wanting things from me?'],
  [0.29, 'pout', 'Mistress Abney asked me to sit up with her daughter through the night. As if I’d know what to do if something went wrong.'],
  [0.36, 'shy', 'I said yes. I always say yes. And then I lie awake.'],
  [0.66, 'shy', 'Grandmother always makes me feel better. Like being small. Like nothing was mine to carry.'],
  [0.73, 'pout', 'That’s it, isn’t it. Everyone’s decided I’m grown. And I’m not ready.'],
  [0.86, 'shy', 'It’s getting dark. I should hurry.'],
  [0.89, 'pout', '…I don’t want to hurry.'],
  [0.95, 'calm', 'There’s the village. The Hallorans’ roof, and the Abneys’, and ours.'],
  [0.985, 'pout', 'And there it all is again. Waiting for me.'],
];
const SPOTS = {
  log: [['calm', 'Just a little longer.'], ['pout', 'Just a little.']],
};
// The three places she stops (js/chapter1.js): her thoughts there, and the choice, to stay a while (the first) or go on. (ctx.linger: run as
// she chooses to stay; at the bluebells, she picks an armful.)
const STOPS = {
  bluebells: {
    first: [['smile', 'Bluebells. The whole glade of them, the way it was every spring.'], ['smile', 'We used to pick these by the armful. Mama would pretend to sneeze at them.']],
    stay: 'Just a few more.',
    stayed: [['smile', 'There’s always one bluer, just past the last.'], ['shy', 'There. An armful, like when I was small. She can’t be cross at an armful of bluebells.']],
    go: 'That’s enough. Home.',
    went: [['shy', 'She’ll like these.']],
  },
  stream: {
    first: [['cheeky', 'I used to catch frogs from here. I wonder if there are any out tonight?'], ['calm', 'I could sit here till the stars come out. Nobody would ask me for anything at all.']],
    stay: 'Sit a while longer.',
    stayed: [
      ['calm', 'Mama was nineteen once. By not much older she had a house, and a husband, and me.'],
      ['pout', 'Did she want it? Or did it just come, the way it’s all coming at me?'],
      ['shy', 'Responsible. Everyone says it as if it’s a thing you put on, like a cloak. I keep waiting for it to fit.'],
      ['shy', 'If I’m the one everyone leans on, who do I lean on?'],
      ['calm', '…The water doesn’t ask me to be anything.'],
    ],
    go: 'Up, and on.',
    went: [['shy', 'Mama will be watching the window.']],
  },
  beech: {
    first: [['shy', 'R and P. Peter carved it the summer we were nine. It’s grown so wide.'],
      ['shy', 'Peter used to just be Peter. Now he goes quiet when I look at him, and I go quiet back, and neither of us knows what comes next.'],
      ['calm', 'In this cloak, I don’t feel like anybody’s question.']],
    stay: 'Remember when he carved it.',
    stayed: [
      ['smile', 'He cut his thumb doing the P, and wouldn’t cry because I was watching. So I cried for him.'],
      ['smile', 'We used to race to this tree. He let me win, and swore blind he didn’t.'],
      ['shy', 'Now he holds doors for me, and calls me Rose, and doesn’t race anybody.'],
      ['pout', 'When did we stop? Nobody said. It just stopped.'],
      ['shy', '…Does he remember it?'],
    ],
    go: 'Leave it be.',
    went: [['shy', '…Does he remember it?']],
  },
};
const walkStop = (k, ctx) => { const S = STOPS[k], th = l => l.map(([face, text]) => ({ who: 'red', face, text, thought: true })); return [
  ...th(S.first),
  { choose: [{ text: S.stay, then: [{ run: ctx.linger }, ...th(S.stayed)] }, { text: S.go, then: th(S.went) }] },
]; };

// The first correction, the homecoming's, scripted as a dialogue between them over the smacks (js/correction.js runs it: S.say, S.step, S.set).
// Not a token: it's meant, and it's meant to be felt by a grown woman, in the words that Little Red needs. Across her lap, skirt down; then
// lifted; then her drawers down (her mother's hand at each); and last the hairbrush, which she's sent to fetch from the chest, for the wood,
// counted after each stroke; then her mother soothes her, the brush in her other hand. Her name stops it anywhere, and her mother answers that instead.
// How long she stayed in the wood, and whether she owned to it, make it heavier (how: { walk: { bluebells, stream, beech }, lingered, lied }):
// the main part runs longer, her mother scolding her for each place she stayed, and a lie answered on its own, before the hairbrush comes
// out. The hairbrush is always twelve.
const homecomingCorrection = async (S, how) => {
  how = Object.assign({ walk: { bluebells: 0, stream: 0, beech: 0 }, lingered: 0, lied: null }, how || {});
  const M = 'corrector', R = 'subject', more = 0.05 * how.lingered + (how.lied ? 0.1 : 0);
  // (a stroke, then her count; her mother's face as she hears it, where it changes)
  const count = async (n, face) => { await S.smacks(1); S.face(face); await S.say(R, n); };
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.5 + more, pace: 1.4 });
  await S.wait(0.8);
  await S.say(M, 'Settle now. Hands down, toward the floor. There.', 'calm');
  await S.say(R, 'Mama…');
  await S.say(M, 'You asked to be held to account, love. This is what it looks like. Not a pat, and not a game.');
  await S.step([M, 'Home before dark, I said. I’m sure your grandmother said the same. And yet the light was all but gone when you came through that door.', 'stern'], 8);
  await S.step([R, 'I know— I know!'], 6);
  await S.step([M, 'Through the wood. Alone. With the light going.'], 8);
  await S.smacks(8);
  await S.step([R, 'Mama, I’m sorry, I am!'], 4);
  await S.say(M, 'I believe you. Sorry doesn’t walk you home, though, does it?');
  // (the skirt up)
  await S.gesture('skirt'); await S.wait(0.4);
  await S.say(R, 'Mama!');
  await S.say(M, 'Hush. You’re not too grown for this, Little Red, and you’re not too grown for me.', 'calm');
  S.set({ strength: 1.75 + more, pace: 1.65 });
  await S.step([M, 'Anything could have been on that path. Anyone.', 'stern'], 10);
  await S.step([R, 'Ow— I stayed on the path, I did—'], 6);
  await S.step([M, 'You stayed on it in the dark. That’s the part I mind.'], 10);
  if (how.walk.bluebells) {      // (an armful of bluebells, picked as the light went)
    await S.step([M, 'And an armful of bluebells, picked while the light went.'], 8);
    await S.step([R, 'They were for you—'], 4);
    await S.step([M, 'I’d sooner have had you home.'], 8);
  }
  await S.smacks(10);
  await S.step([R, 'Please— I understand—'], 4);
  await S.say(M, 'Not yet, but nearly.', 'calm');
  // (her drawers down)
  await S.gesture('drawers'); await S.wait(0.5);
  await S.say(R, 'Mama, no, please—');
  await S.say(M, 'Yes. Because it matters, and because you need to remember it matters. Breathe.', 'stern');
  S.set({ strength: 2.0 + more, pace: 2 });
  await S.step([M, 'You lingered. Dawdled.'], 8);
  await S.step([M, 'You let the dusk come in around you.'], 8);
  if (how.walk.stream) {      // (sat by the stream, thinking)
    await S.step([M, 'Sat by that stream, I don’t doubt, dreaming, while I watched the window.'], 10);
    await S.step([R, 'I was only thinking, Mama—'], 4);
    await S.step([M, 'Then think at home, by the fire, where I can see you.'], 8);
  }
  if (how.walk.beech) {      // (at the old beech, with Peter's letters)
    await S.step([M, 'And whatever kept you at that old tree would have kept till morning. You mightn’t have.'], 10);
    await S.step([R, 'Mama, please—'], 4);
    await S.smacks(6);
  }
  await S.step([R, 'I’m sorry! I’m sorry, Mama!'], 6);
  await S.step([M, 'And you let me sit here, watching the window, with the lantern in my hand.'], 12);
  await S.smacks(10);
  // (a lie, answered on its own; owning up, owned)
  if (how.lied) {
    await S.say(M, 'And then you stood by my hearth and told me you came straight home.', 'stern');
    await S.say(R, 'I’m sorry I said it! I’m sorry!');
    await S.step([M, 'You can be late, and you can be foolish, and I’ll mend it. But you don’t lie to me, Little Red.'], 10);
    await S.step([M, 'Not ever.'], 8);
    await S.smacks(6);
  } else if (how.lied === false) await S.say(M, 'You told me the truth tonight. Remember that it counted.', 'calm');
  // (and the hairbrush, for the last of it: she counts every one; the one she doesn't count, she counts after)
  // (she's sent for it: off the lap, across the room to the chest, and back to give it to her, as she is)
  await S.fetch('hairbrush', {
    ask: [M, 'Up you get, Little Red. My hairbrush is in the chest. Fetch it for me.'],
    waitFace: 'concerned', presentFace: 'stern',
    present: [R, '…Here, Mama.'],
    back: [M, 'Good girl. Now back across my lap, Little Red.', 'smile'],
  });
  S.set({ strength: 1.85 + more, pace: 1 }); await S.wait(0.8);
  await S.say(M, 'You’ve twelve more coming. Count them for me, and then it’s finished.', 'stern');
  await S.say(R, '…Yes, Mama.');
  await count('One…'); await count('Two…'); await count('Three…'); await count('Owww, Four…', 'concerned');
  await count('Five…'); await count('Six, oh Mama…', 'calm'); await count('Seven…');
  await count('I’ll be good, Mama, I swear it!');
  await S.say(M, 'That’s what this is for, Little Red. To make sure of it. Do you need that one again?', 'stern');
  await S.say(R, 'No, Mama!');
  await S.say(M, 'Then count it, love.', 'calm');
  await S.say(R, 'Eight…');
  await count('Nine…');
  await count('Ten! I’m sorry, Mama!');
  await S.say(M, 'I know, love.', 'concerned');
  await count('Eleven!', 'stern');
  await count('Twelve.', 'stern');
  S.face('pout'); await S.wait(0.8);
  // (and the brush into her other hand, and her own laid on the sting, slowly, while she says it)
  await S.gesture('soothe', { hold: true });      // (it goes on until the scene fades)
  await S.say(M, 'There now. That’s done, and it stays done. You’re a good girl, Little Red. Just breathe. I’ve got you.', 'calm');
  await S.wait(2.4);
};

// After the correction (js/correction.js plays it, still in the chair): how it went decides it (Discipline.run's result). Taken all the way
// through, she's held on her mother's lap, her face in her mother's shoulder, as she was the winter of the mill pond; stopped with her name, she
// sits up on it, dressed again, as Rose, and they talk as two women. (Correction.run's after: the pose, 'held' or 'upright', goes with it.)
// (ctx, as js/correction.js plays it on the lap: beat() her mother holding her a moment, eyes closed; sitUp() Red sat up on the lap, her
// crying come down. Without them, played in the room, those steps are left out.)
const afterCorrection = (r, ctx) => (r && (r.rose || r.tooHarsh) ? [
  { who: 'mother', face: r.rose ? 'concerned' : 'shy', listen: { red: 'shy' }, text: r.rose ? 'Rose. I’m here. Breathe with me.' : 'That was more than I meant it to be. I’m sorry, love.' },
  { who: 'red', face: 'shy', text: 'I’m all right. It was just… a lot, all at once.' },
  { who: 'mother', face: 'calm', text: 'Then that’s what we talk about. Not the wood, not any of it. You.' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: 'Thank you for stopping.' },
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Always. That was the promise, and it holds. Come on. There’s soup, and the fire’s warm.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'crying' }, text: 'Hush, sweetheart. It’s over now. You’re my good Little Red again, and we’ll talk no more of the wood.' },
  { who: 'red', face: 'crying', listen: { mother: 'calm' }, text: 'I’m sorry, Mama.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'I know you are. Come here.' },
  { run: ctx && ctx.beat },      // (her mother's eyes close as she holds her, a beat)
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: 'Thank you.' },
  { run: ctx && ctx.sitUp },      // (Red sits up on her lap, her distress come down, smiling, tears still in her eyes)
  { who: 'mother', face: 'wistful', listen: { red: 'teary' }, text: 'You know I’ll always give you what you need, Little Red. Now, there’s soup over the hearth. Let’s get you fed and into bed, hm?' },
]).filter(l => !('run' in l) || l.run);

// Bedtime, the end of the homecoming: the two of them in her mother's bed, under the quilt, her mother's arm over her, watching the back of her
// head. Red's thoughts, as she lies there: what she asked for, what she got, and that it's a good thing, to be held again; to be Little Red.
// ([face, thought], in turn; 'sleep': where her mother's eyes close, asleep, as the next comes up. Stopped with her name, she thinks it through as Rose.)
// (how: what she said of the wood, if she was asked (how.lied: true or false): a thought on it, after the first of her others; if not asked, none)
const honesty = how => !how || how.lied == null ? [] : how.lied
  ? [['pout', 'I won’t lie to her again in a hurry. Though it did come easier, as Little Red. Like it wasn’t really me saying it.']]
  : [['shy', 'Mama was glad I told her the truth. But a part of me wanted to lie… and now I wonder what she’d have done if I had.']];
const bedtime = (r, how) => r && (r.rose || r.tooHarsh) ? [
  ['calm', 'I asked her to hold me to account. And when it was too much, I said my name, and she stopped. Just as she said she would.'],
  ['shy', 'She didn’t ask me why. She just made soup, and listened.'],
  ...honesty(how),
  ['calm', 'And now her arm’s round me, and her breathing at my back, slow, the way it was the winter of the mill pond.'],
  'sleep',
  ['smile', 'It’s a good thing, to know she’ll stop. It means I can let her start.'],
  ['smile', 'Little Red. Tomorrow, maybe.'],
] : [
  ['calm', 'I asked her to hold me to account. I thought I knew what that meant.'],
  ['shy', 'It meant her hand, and her hairbrush, and counting every one of them out loud.'],
  ...honesty(how),
  ['calm', 'And now her arm’s round me, and her breathing at my back, slow, the way it was the winter of the mill pond.'],
  'sleep',
  ['calm', 'Nobody wants anything from me tonight. Somebody has hold of me.'],
  ['smile', 'It’s a good thing. To be held again.'],
  ['smile', 'To be Little Red.'],
];

// Phase 1.2, the morning after: what's hers to do, agreed between them, nothing too grown. Mary's garden, small errands, and home by the curfew bell.
const chores = () => [
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Morning, Little Red. Sleep?' },
  { who: 'red', face: 'shy', text: 'Like a stone.' },
  { who: 'mother', face: 'calm', text: 'Good. Now, what we said last night. The Hallorans’ calving and the mending can go back to being mine. But you’ll not sit idle either.' },
  { who: 'mother', face: 'calm', text: 'The garden, every day: the weeds, wherever they’ve come up, and the vegetables seen to. That one’s yours.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'And my flowers watered. Watered, mind, and nothing else. Keep to the paths between the rows.' },
  { who: 'red', face: 'cheeky', text: 'Silver bells and cockle shells…' },
  { who: 'mother', face: 'smile', listen: { red: 'cheeky' }, text: 'And pretty maids all in a row. In a row, Little Red. Not trodden flat.' },
  { who: 'mother', face: 'calm', text: 'And when somebody asks something of us, I’ll ask you over breakfast if you’ll do it. Say yes, and it’s a promise: done, or at least begun, by when they want it.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Or say no. If it’s too much, if you can’t be anybody’s that day, tell me so, honestly, and that’s an end of it. It’s “won’t” I’ll mind, not “can’t”.' },
  { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'And home by the curfew bell. Nine o’clock, and not a minute past it.' },
  { choose: [
    { text: 'Yes, Mama.', then: [{ who: 'mother', face: 'smile', text: 'That’s my girl.' }] },
    { text: 'Nine? Agnes is allowed out till ten.', then: [
      { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'Agnes Thatcher isn’t Little Red. Nine.' },
      { who: 'red', face: 'pout', text: '…Yes, Mama.' },
    ] },
  ] },
  { who: 'mother', face: 'calm', text: 'And if anyone in the village asks after you, you tell them what you like, and only what you like. Who knows is yours to choose.' },
];
// ── Days and errands (js/chores.js plays them). Each errand: who it's for, what's asked over breakfast, the time it must be begun by, what
// happens where it's done, and what's said when it's brought home. Speakers 'mother' and 'red'; narration where someone isn't there to be
// seen: met, what's said when the one it's for is there to say it (js/villagers.js); there, the narration when they aren't.
const ERRANDS = {
  well: { title: 'Water from the well', by: '10:00', place: 'well', action: 'Draw a bucket of water', carry: 'bucket', home: true, mins: 15,
    ask: 'The butt’s low, and I’ll want water for the washing. Will you fetch a bucket from the well this morning, love?',
    there: [{ text: 'She winds the bucket down into the dark, and up again, heavy and slopping, and the green full of the morning round her.' },
      { who: 'red', face: 'calm', thought: true, text: 'Half the village has been at the well before me. I can tell by the wet on the stones.' }],
    back: { who: 'mother', face: 'smile', text: 'That’s the washing seen to. Thank you, love.' } },
  bread: { title: 'Bread from the bakery', by: '11:00', place: 'bakery', action: 'Ask for Mama’s loaves', carry: 'loaves', home: true, mins: 15, who: 'baker',
    ask: 'Master Pennock’s keeping two loaves back for us. Will you fetch them before he sells them out from under us?',
    met: [{ who: 'baker', face: 'smile', listen: { red: 'smile' }, text: 'Two of the best, Miss Rose, and warm through. You tell your mother they’re the best of the batch.' },
      { who: 'red', face: 'smile', thought: true, text: 'He says that every time. They smell like every morning I can remember.' }],
    there: [{ text: 'Master Pennock passes two loaves over the half-door, warm through the cloth, and says she’s to tell her mother they’re the best of the batch, which he says every time.' },
      { who: 'red', face: 'smile', thought: true, text: 'They smell like every morning I can remember.' }],
    back: { who: 'mother', face: 'smile', text: 'Still warm. He does look after us.' } },
  pot: { title: 'A pot to the forge for mending', by: '12:00', place: 'forge', action: 'Leave the pot with the smith', give: 'pot', mins: 15, who: 'smith',
    ask: 'The big pot’s sprung its handle again. Will you take it down to the forge before noon? Master Ferrier said he’d see to it.',
    met: [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Handle again? Leave it by the anvil. Tell your mother tomorrow.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'Eleven words. That’s a speech, for Master Ferrier.' }],
    there: [{ text: 'The forge is all heat and ringing. She sets the pot down by the anvil where the smith can see it, and he nods without stopping, which means yes.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'Tom’s nowhere about. Which means Tom’s somewhere he shouldn’t be.' }] },
  jug: { title: 'A jug from the inn', by: '17:00', place: 'inn', action: 'Ask for Mama’s jug', carry: 'jug', home: true, mins: 15, who: 'abney',
    ask: 'Mistress Abney’s promised me a jug of her small beer for supper. Will you go along for it this afternoon?',
    met: [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Your mother’s jug. There. And how is she? And how are you, Miss Rose?' },
      { who: 'red', face: 'calm', text: 'Well, thank you, Mistress Abney.' },
      { who: 'red', face: 'shy', thought: true, text: 'She always looks as if she knows something I haven’t said yet.' }],
    there: [{ text: 'Mistress Abney fills the jug herself, and asks after her mother, and after her, and looks at her a little longer than the question needs.' },
      { who: 'red', face: 'shy', thought: true, text: 'She always looks as if she knows something I haven’t said yet.' }],
    back: { who: 'mother', face: 'calm', text: 'On the table, love. Was she well?' } },
  dunns: { title: 'A basket for the Dunns', by: '15:00', place: 'dunns', action: 'Leave the basket at the Dunns’', give: 'basket', mins: 10, who: 'willie',
    ask: 'I’ve a pie for the Dunns: Master William’s been on his rounds all week. Will you take it over this afternoon? Quietly, mind. He’ll be sleeping.',
    there: [{ text: 'The shutters are closed upstairs. She leaves the basket on the step, under the cloth, and doesn’t knock.' },
      { who: 'red', face: 'smile', thought: true, text: 'Georgie and I used to play under that window, and Master William would lean out and pretend to growl at us.' }] },
  bakery: { title: 'Help at the bakery', by: '07:45', place: 'bakery', action: 'Go in to help Mistress Pennock', mins: 240, who: 'pennock', trust: 'pennock',
    ask: 'Mistress Pennock’s girl is poorly, and she’s short of hands. Will you go and help her this morning? She’s been baking since before it was light: she’ll want you straight after breakfast, by a quarter to eight.',
    met: [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Rose, love, you’re an angel. Sleeves up, apron on, and mind the oven: it bites.' },
      { text: 'All morning: flour to the elbows, the oven roaring, trays in and trays out, and Mistress Pennock talking the whole while, about everything and everyone.' },
      { who: 'red', face: 'smile', thought: true, text: 'She talks as if I were still twelve. It’s nicer than I thought it would be.' }],
    there: [{ text: 'All morning: flour to the elbows, the oven roaring, trays in and trays out, and Mistress Pennock talking the whole while, about everything and everyone.' },
      { who: 'red', face: 'smile', thought: true, text: 'She talks as if I were still twelve. It’s nicer than I thought it would be.' }] },
  inn: { title: 'Work at the inn', by: '14:00', place: 'inn', action: 'Go in to work for Mistress Abney', mins: 180, who: 'abney', trust: 'abney',
    ask: 'Mistress Abney could use you this afternoon: the carrier’s due, and Bess can’t be on her feet all day. Will you go along by two?',
    met: [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'There you are. Pots first, then the tables, then Bess, who’ll tell you she needs nothing. She’s lying.' },
      { text: 'The afternoon goes in pots and plates and the carrier’s men stamping in, and Bess sat by the fire, directing everyone, and Mistress Abney watching it all.' },
      { who: 'red', face: 'calm', thought: true, text: 'Nobody asked me for anything I couldn’t do. I didn’t know that could feel restful.' }],
    there: [{ text: 'The afternoon goes in pots and plates and the carrier’s men stamping in, and Bess sat by the fire, directing everyone, and Mistress Abney watching it all.' },
      { who: 'red', face: 'calm', thought: true, text: 'Nobody asked me for anything I couldn’t do. I didn’t know that could feel restful.' }] },
  flock: { title: 'Help Bo Peep pen the flock', by: '19:30', place: 'pinfold', action: 'Help pen the flock', mins: 30, who: 'halloran',
    ask: 'Halloran’s granddaughter could use another pair of hands bringing the flock in tonight. Will you meet her at the pinfold by half past seven?',
    there: [{ text: 'Bo Peep counts them through the gate, twice, and once more because one of them is always the same one, and they lean the gate shut together.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'The bell’s just there on the green. Somebody could ring it early, one night. Not me, of course.' }] },
};
// Over breakfast: her mother's word for the day, and the asking. errand: one of ERRANDS, or null (nothing asked: the day's her own).
// ctx: { temper ('wilful' | 'mischievous' | 'naughty' | null: what she's most known for lately), yes(), little(), wont() (run on each answer) }.
const breakfast = (errand, ctx) => {
  const hello = { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Morning, love. Porridge is on.' };
  if (!errand) return [hello, { who: 'mother', face: 'calm', text: 'Nobody’s asked anything of us today. The garden, and then the day’s your own.' }];
  const t = ctx.temper, by = ctx.byText;
  const YES = { wilful: 'Fine. Yes. I’ll do it.', mischievous: 'Yes, Mama. I’ll be quick. Mostly.', naughty: 'Yes, Mama.' }[t] || 'Yes, Mama.';
  const WONT = { wilful: 'No. I’ve had enough of being asked for things.', mischievous: 'Can’t it wait? I’d other plans. No.', naughty: 'Why me? Let them fetch it themselves.' }[t] || 'No. I don’t want to.';
  return [hello, { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: errand.ask },
    { choose: [
      { text: YES, face: 'smile', then: [{ run: ctx.yes }, { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'That’s my girl. By ' + by + ', mind.' }] },
      { text: 'Not today, Mama. I can’t be anybody’s today.', face: 'shy', then: [{ run: ctx.little },
        { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Then not today, love. I’ll let them know. Just the garden, and let the day be easy.' }] },
      { text: WONT, face: 'pout', then: [{ run: ctx.wont },
        { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'That’s not “can’t”, Red. That’s “won’t”. I’ll remember it.' }] },
    ] }];
};
// The third "won't" in a week: what her mother says, before she takes her in hand for it.
const enough = () => [
  { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'That’s three times this week, Little Red. Three times I’ve asked, and three times you’ve told me no, and not because you couldn’t.' },
  { who: 'red', face: 'shy', text: 'Mama…' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'This isn’t for any one thing. It’s to set you right. Come here.' },
];
// The maintenance correction: her hand only, not long, the shape of her days put back in place. (js/correction.js runs it: as the homecoming's.)
const maintenanceCorrection = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.3, pace: 1.3 });
  await S.wait(0.8);
  await S.say(M, 'Hands down. There. You know why.', 'calm');
  await S.step([M, 'The garden, each morning. That’s yours.', 'stern'], 8);
  await S.step([R, 'I know, Mama—'], 4);
  await S.step([M, 'What’s asked of you: done, or a no that’s honest. Not a sulk.'], 8);
  await S.smacks(6);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.5, pace: 1.5 });
  await S.step([M, 'And home by the bell.'], 8);
  await S.step([R, 'Yes, Mama!'], 4);
  await S.step([M, 'That’s the shape of your days, Little Red. It holds you. Let it.'], 10);
  await S.smacks(8);
  await S.say(M, 'There. That’s done, and you’re set right. Up you get.', 'calm');
  await S.wait(1.2);
};
const afterMaintenance = () => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Better?' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: '…Better.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Then off with you. The garden won’t weed itself.' },
];
// Her thoughts as she tends the garden (one pair a day, in turn).
const GARDEN = [
  [['calm', 'Weeds, water, and whatever’s ready. Mama’s list, every morning.'], ['smile', 'The beans have come on. Nobody needs me to be clever about beans.']],
  [['calm', 'Silver bells and cockle shells. Grandmother used to sing it at me when I was contrary.'], ['smile', 'I’m still contrary. The garden doesn’t mind.']],
  [['shy', 'There’s a slug on every leaf. I wonder if they have a Mama telling them to be home by nine.'], ['cheeky', 'Probably not. Lucky slugs.']],
  [['calm', 'My hands in the earth, and nobody watching. It’s the quietest hour of the day.'], ['calm', 'Then the day starts asking things of me.']],
];
// Back from a promise let slide: her own thought, when the time's gone by.
const broken = title => [['wince', 'Oh no. ' + title + '. I said I would, and I didn’t.']];

// ── The village's people (js/villagers.js): a word with each, by the time of day, and something else when they've already talked today.
// ctx: { part, day, first (never met in the game yet), today (already talked today), errand (her objective, if she's one), curfew, working (Tom,
// at the tub), potDone (her mother's pot left at the forge today) }.
// Most of the village calls her Miss Rose; Agnes and Georgie, who grew up with her, Rose; Tom, Ridley, when he isn't calling her worse.
const pickOf = (list, day) => list[((day || 0) % list.length + list.length) % list.length];
const VILLAGE = {
  agnes: {
    first: [{ who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: 'Rose Ridley, as I live and breathe! I was beginning to think your mother had you chained to the garden.' },
      { who: 'red', face: 'cheeky', text: 'Only on weekdays.' }],
    any: [
      [{ who: 'agnes', face: 'cheeky', listen: { red: 'calm' }, text: 'Georgie Dunn walked past the well four times this morning. Four. He hasn’t that much water to carry.' },
        { who: 'red', face: 'smile', text: 'Perhaps he’s very thirsty.' }, { who: 'agnes', face: 'bashful', text: 'Perhaps he is.' }],
      [{ who: 'agnes', face: 'calm', listen: { red: 'calm' }, text: 'Mother’s got Father up on the Hallorans’ roof again. I’m to keep out from under his feet, which suits me.' },
        { who: 'red', face: 'smile', text: 'So you’re keeping out from under them here.' }, { who: 'agnes', face: 'smile', text: 'Somebody has to mind the well.' }],
      [{ who: 'agnes', face: 'concerned', listen: { red: 'shy' }, text: 'You’ve got that look. The one where you’re thinking a thing and not saying it.' },
        { who: 'red', face: 'shy', text: 'I haven’t got a look.' }, { who: 'agnes', face: 'calm', text: 'You have. When you want to say it, I’m at the well. I’m always at the well.' }],
      [{ who: 'agnes', face: 'smile', listen: { red: 'calm' }, text: 'Mistress Pennock’s been at her lardy cakes again. You can smell them from here. I may die.' },
        { who: 'red', face: 'cheeky', text: 'Die nearer the bakery, then. She might take pity.' }],
    ],
    again: [{ who: 'agnes', face: 'cheeky', text: 'Back again? People will think you like me.' }],
    errand: [{ who: 'agnes', face: 'calm', listen: { red: 'shy' }, text: 'Don’t let me keep you. You’ve your errand face on.' }],
  },
  georgie: {
    first: [{ who: 'georgie', face: 'smile', listen: { red: 'smile' }, text: 'Rose! I’d have waved, only I’ve flour to the elbows and I’d have given you a cloud.' }],
    any: [
      [{ who: 'georgie', face: 'calm', listen: { red: 'calm' }, text: 'Miller let me off early. Said I was grinding my teeth louder than the stones.' },
        { who: 'red', face: 'cheeky', text: 'And you came straight here. To the green. Where the well is.' }, { who: 'georgie', face: 'bashful', text: 'It’s… a nice green.' }],
      [{ who: 'georgie', face: 'calm', listen: { red: 'calm' }, text: 'Father’s still abed. Up all night walking the lanes, then sleeps through the day like a cat. Mother says she married a lantern.' },
        { who: 'red', face: 'smile', text: 'He used to growl at us out of the window.' }, { who: 'georgie', face: 'smile', text: 'He still does. Only now he means it.' }],
      [{ who: 'georgie', face: 'bashful', listen: { red: 'calm' }, text: 'Rose. Does Agnes ever… say anything? About anybody?' },
        { who: 'red', face: 'cheeky', text: 'Agnes says a great deal about everybody, Georgie.' }, { who: 'georgie', face: 'pout', text: 'That’s no help at all.' }],
    ],
    again: [{ who: 'georgie', face: 'smile', text: 'Still here. The green’s not going anywhere, and nor am I.' }],
    late: [{ who: 'georgie', face: 'concerned', listen: { red: 'shy' }, text: 'Nearly the bell. I’d not be out when Father comes round, Rose. Not even you.' }],
  },
  tom: {
    first: [{ who: 'tom', face: 'cheeky', listen: { red: 'cheeky' }, text: 'Ridley! There she is. I’d begun to think you’d gone respectable on me.' },
      { who: 'red', face: 'cheeky', text: 'Never, Tom Ferrier. I’ve only been busy.' }, { who: 'tom', face: 'smile', text: 'Busy. That’s what the respectable ones say.' }],
    work: [{ who: 'tom', face: 'pout', listen: { red: 'calm' }, text: 'Can’t stop. Father’s eye is on me like a hawk on a hen.' },
      { who: 'smith', face: 'stern', text: 'That tub won’t fill itself, Tom.' }, { who: 'tom', face: 'cheeky', text: 'See? Hawk.' }],
    any: [
      [{ who: 'tom', face: 'cheeky', listen: { red: 'calm' }, text: 'Piper’s off at his nets again. All day with the birds, that one. I said he’ll grow feathers.' },
        { who: 'red', face: 'smile', text: 'Peter would look well in feathers.' }, { who: 'tom', face: 'smile', text: 'He’d look well in anything. It’s maddening.' }],
      [{ who: 'tom', face: 'smile', listen: { red: 'calm' }, text: 'Father let me shoe the Hallorans’ mare all by myself today. She only tried to kill me twice.' },
        { who: 'red', face: 'cheeky', text: 'Only twice? You’re getting good.' }],
      [{ who: 'tom', face: 'cheeky', listen: { red: 'cheeky' }, text: 'I’ve a plan, Ridley. A grand one. Not today. But it’s coming, and you’ll be in it.' },
        { who: 'red', face: 'smile', text: 'I always am.' }],
    ],
    again: [{ who: 'tom', face: 'cheeky', text: 'Can’t keep away, can you?' }],
  },
  smith: {
    any: [
      [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose.' }, { text: 'He nods, and goes back to his hammer. Master Ferrier was never one for more words than the work needs.' }],
      [{ who: 'smith', face: 'calm', listen: { red: 'calm' }, text: 'If you’re after Tom, he’s at the tub, and he’s staying at the tub.' }],
    ],
    after: [{ who: 'smith', face: 'calm', text: 'Your mother’s pot’s as good as new. Better. Tell her not to drop it on the hearthstone again.' }],
  },
  bess: {
    any: [
      [{ who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'Miss Rose. Come and sit a minute; I’m not allowed to do anything but sit, and it’s dull without somebody to watch.' }],
      [{ who: 'bess', face: 'calm', listen: { red: 'calm' }, text: 'Mother has me out here so she can see me from every window. As if the babe’s going to come running out on its own.' },
        { who: 'red', face: 'smile', text: 'Would it dare?' }, { who: 'bess', face: 'cheeky', text: 'Not with my mother watching.' }],
      [{ who: 'bess', face: 'calm', listen: { red: 'calm' }, text: 'Everybody in the village comes by this bench sooner or later. You learn a great deal, sitting.' },
        { who: 'red', face: 'shy', text: 'About whom?' }, { who: 'bess', face: 'smile', text: 'Oh, everyone.' }],
    ],
    again: [{ who: 'bess', face: 'smile', text: 'Still here. Still sitting. Still growing.' }],
  },
  abney: {
    any: [
      [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose. Your mother keeping well?' }, { who: 'red', face: 'calm', text: 'Yes, Mistress Abney.' },
        { who: 'abney', face: 'calm', text: 'And you?' }, { text: 'She waits for the answer, as if it might be a different one.' }],
      [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Carrier’s late again. If you see a cart on the road from the east gate, tell it I’m not getting any younger.' }],
      [{ who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'Bess. Bess! In the shade, girl, not in the sun.' }, { who: 'bess', face: 'pout', text: 'Yes, Mother.' }],
    ],
  },
  pennock: {
    any: [
      [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Rose, love! Look at you. Growing like a weed, and twice as pretty.' }, { who: 'red', face: 'bashful', text: 'Mistress Pennock…' },
        { who: 'pennock', face: 'smile', text: 'Don’t you “Mistress Pennock” me. I fed you crusts over this counter when you were knee-high.' }],
      [{ who: 'pennock', face: 'calm', listen: { red: 'calm' }, text: 'Somebody’s been at my windowsill pies again. I counted six and there were five. I’ll find out, mark me.' },
        { who: 'red', face: 'shy', thought: true, text: 'I don’t know anything about it. Yet.' }],
      [{ who: 'pennock', face: 'smile', listen: { red: 'calm' }, text: 'Tell your mother I’ve a bit of dripping put by for her. And you’re to eat something besides those berries in the wood.' }],
    ],
  },
  baker: {
    any: [
      [{ who: 'baker', face: 'smile', listen: { red: 'smile' }, text: 'Morning, Miss Rose. Oven’s hot and the dough’s up: all’s well with the world.' }],
      [{ who: 'baker', face: 'calm', listen: { red: 'calm' }, text: 'Tell the missus I’ve gone for flour, if she asks. And if she doesn’t ask, I’ve still gone for flour.' }],
    ],
  },
  willie: {
    any: [
      [{ who: 'willie', face: 'stern', listen: { red: 'shy' }, text: 'Miss Rose. The bell’s rung, or near enough. Home with you, now.' }, { who: 'red', face: 'shy', text: 'Yes, Sir.' }],
      [{ who: 'willie', face: 'calm', listen: { red: 'shy' }, text: 'Out late, Miss Rose. I’ll walk to the corner with you. No further, mind: I’ve a round to keep.' }, { who: 'red', face: 'shy', text: 'Thank you, Sir.' }],
    ],
    early: [{ who: 'willie', face: 'calm', listen: { red: 'calm' }, text: 'Evening, Miss Rose. I’m on my way round. Mind you’re in by the bell.' }, { who: 'red', face: 'calm', text: 'Yes, Sir.' }],
  },
};
// A word with one of them. (The smith says something else once he's had her mother's pot; Willie's word depends on the bell.)
const villager = (key, ctx) => {
  const V = VILLAGE[key]; if (!V) return [];
  if (key === 'willie') return ctx.curfew ? pickOf(V.any, ctx.day) : V.early;
  if (key === 'tom' && ctx.working) return V.work;
  if (key === 'smith' && ctx.potDone) return V.after;
  if (ctx.first && V.first) return V.first;
  if (key === 'georgie' && ctx.part === 'dusk' && V.late) return V.late;
  if (ctx.today && V.again) return V.again;
  const said = pickOf(V.any, ctx.day + (ctx.today ? 1 : 0));
  return ctx.errand && V.errand ? said.concat(V.errand) : said;
};

// ── Tom finds her, with something she ought to be doing: he keeps her, while the clock runs (ctx.mins(n): n minutes gone, each beat). She can
// get away early, or stay: then a chat (kind 'chat'), or a dare (the curfew bell, 'bell'; or a knock at the Dunns' door, 'knock').
// ctx: { kind, busy (she has something she ought to be doing), errand, first, mins(n), ringBell(), knock(), dared(), chatted() }
const tomStops = ctx => {
  const T = (face, text, red) => ({ who: 'tom', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, text }), M = n => ({ run: () => ctx.mins(n) });
  const hello = ctx.first ? T('cheeky', 'Ridley! There she is. Where are you off to with that face on?', 'cheeky') : T('cheeky', 'Ridley! Hold up. Where’s the fire?', 'cheeky');
  const out = ctx.busy ? [R('calm', 'Mama’s asked a thing of me, Tom, and I said I’d do it. I can’t stop.'), M(2), T('pout', 'Can’t stop. Listen to her. All right, all right. Off you go, good girl.', 'pout'), R('pout', 'Don’t you “good girl” me, Tom Ferrier.'), T('cheeky', 'Then come back when you’re bad again.', 'pout')]
    : [R('calm', 'Not today, Tom. I’ve done my work and I want my own company for a bit.'), M(2), T('pout', 'Your own company. Dull company, that.', 'calm'), R('cheeky', 'Better than yours.'), T('cheeky', 'Liar. Go on, then. I’ll find you tomorrow.', 'cheeky')];
  const away = (face, text) => ({ text: 'I really must go, Tom.', face: 'shy', then: [M(2), T(face, text, 'shy')] });
  let middle;
  if (ctx.kind === 'chat') middle = [
    T('calm', 'Father’s in a mood. Some fellow from over the hill brought a plough to mend and wouldn’t pay till it was done, and then wouldn’t pay when it was.'), M(5),
    R('calm', 'What did your father do?'), T('cheeky', 'Held onto the plough. Fellow’s been stood outside the forge since dinner, looking at it.', 'smile'), M(5),
    { choose: [away('pout', 'Go on, then. Spoil my story.'),
      { text: 'And then what?', face: 'smile', then: [M(8), T('smile', 'And then Mistress Pennock came by and told him what she thought of him, and he paid double to make her stop.', 'smile'),
        R('smile', 'She’d frighten anybody.'), M(6), T('calm', 'Not you, though. Nothing frightens you, Ridley.', 'shy'), R('shy', '…Plenty does, Tom.'), M(4),
        T('calm', 'Well. Not me, then. That’s something.', 'shy'), { run: ctx.chatted }] }] },
  ];
  else {
    const what = ctx.kind === 'bell' ? 'ring the curfew bell. Now, in broad day. Three strokes, and back here before anyone sees who.'
      : 'knock on the Dunns’ door. Master William’s asleep up there after his round. Three knocks, and back here before the shutter opens.';
    const did = ctx.kind === 'bell' ? [{ run: ctx.ringBell }, T('cheeky', 'Ha! Look at them all. Old Abney’s come out with her ladle. You’re a marvel, Ridley.', 'cheeky'), R('cheeky', 'They didn’t see. Did they see?'), M(4), T('smile', 'Course they didn’t. Probably.', 'wince')]
      : [{ run: ctx.knock }, { text: 'Above them, a shutter bangs open, and Master William’s voice comes down like weather.' }, T('cheeky', 'Run, run! Ha! Did you hear him? I’ve never heard a man growl like it.', 'cheeky'), R('wince', 'He’ll know it was me. He always knows.'), M(4), T('smile', 'Then he’ll know you’re brave.', 'wince')];
    middle = [
      T('cheeky', 'I’ve been waiting all day for somebody worth daring. I dare you to ' + what, 'surprised'), M(3),
      { choose: [
        { text: 'Done.', face: 'cheeky', then: did.concat([{ run: ctx.dared }, M(6)]) },
        { text: 'Not today, Tom.', face: 'shy', then: [M(2), T('pout', 'Not today. Coward. I’ll save it for you, then.', 'shy'), R('cheeky', 'Save it as long as you like.')] },
        away('cheeky', 'Coward. Off you go, then. I’ll think of something worse for next time.'),
      ] },
    ];
  }
  return [hello, M(3), { choose: [
    { text: 'I can’t stop, Tom. Truly.', face: 'shy', then: out },
    { text: 'Why? What’s it to you?', face: 'cheeky', then: [M(2)].concat(middle) },
  ] }];
};
// Her thought after, when he's kept her long: the clock, and her errand.
const tomCost = mins => mins >= 30 ? 'Half the hour gone, and Mama’s errand still waiting. Tom Ferrier, honestly.' : 'That was longer than I meant. I’d better get on.';

// ── Mama's garden (js/garden.js): her flowers trodden on, and what comes of it. Rows: the flower rows trodden ('the silver bells', …).
const mine = rows => rowsText(rows).replace(/\bthe /g, 'my ');
const rowsText = rows => rows.length > 1 ? rows.slice(0, -1).join(', ') + ' and ' + rows[rows.length - 1] : rows[0];
const FULL = { agnes: 'Agnes Thatcher', georgie: 'Georgie Dunn', tom: 'Tom Ferrier', smith: 'Master Ferrier', bess: 'Bess Abney', abney: 'Mistress Abney', pennock: 'Mistress Pennock', baker: 'Master Pennock', willie: 'Master William' };
// (her own thought, the moment it happens)
const trodden = row => pickOf(['Oh no. Mama’s ' + row.replace(/^the /, '') + '.', 'Oh— no, no. Off the path. Off ' + row + '.', 'That was ' + row + '. That was one of Mama’s.'], row.length);
// Nothing amiss: a word as she comes in. (tended: the garden done today)
const gardenFine = tended => [{ who: 'mother', face: 'smile', listen: { red: 'calm' }, text: tended ? 'I went round the garden at dusk. Not a flower out of its row. You’re a good gardener, love, when you put your mind to it.' : 'I went round the garden at dusk. My flowers are standing, at least. Mind the weeds tomorrow.' }];
// Trodden: her mother asks. ctx.own(), ctx.lie(): run on her answer.
const gardenAsk = (rows, n, ctx) => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'I went round the garden at dusk. ' + (n > 3 ? 'There’s a whole stretch of ' + mine(rows) + ' trodden flat, broken off and out of their rows.' : 'Some of ' + mine(rows) + ' are trodden down, broken off and out of their rows.') },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Was that you, Little Red?' },
  { choose: [
    { text: 'Yes, Mama. I stepped off the path. I’m sorry.', face: 'shy', then: [{ run: ctx.own }, { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me. That’s worth something. It doesn’t mend my flowers, though.' }] },
    { text: 'No, Mama. It must have been a cat. Or the Thatchers’ goat.', face: 'shy', then: [{ run: ctx.lie }] },
  ] },
];
// The lie, the same day, the petals still on her boots.
const gardenBoots = rows => [
  { text: 'Her mother’s eyes go down, to her boots, and stay there.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'A goat. And the goat walked in your boots, did it? There are petals off ' + mine(rows) + ' stuck all over them.' },
  { who: 'red', face: 'wince', text: 'Mama, I—' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Don’t. Don’t make it worse.' },
];
// Believed: her mother lets it lie, and Red has it to think about.
const gardenBelieved = () => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Hm. I’ll keep the gate latched, then.' },
  { who: 'red', face: 'shy', thought: true, text: 'She believed me. I wish she hadn’t.' },
];
// The next evening: someone in the village saw.
const gardenReport = r => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'I had a word with ' + (FULL[r.who] || 'someone') + ' today. In passing.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'They saw you in my garden. Walking straight through ' + rowsText(r.rows || ['my flowers']) + ', as if they were grass.' },
  { who: 'red', face: 'wince', text: 'Mama…' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'A cat, you said. The Thatchers’ goat. You stood there and looked at me and said it.' },
];
// Before it: what it's for.
const gardenTakeInHand = how => how.lied ? [
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'This is for my flowers, which you didn’t care about. And it’s for the lie, which is worse, because I do care about that.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Come here, Little Red.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Walk the paths, I said. My flowers took me years.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'You’ll learn to mind where you put your feet. Come here.' },
];
// The correction: her hand, for the carelessness; for a lie as well, longer, her drawers down, and the hairbrush to finish.
const gardenCorrection = async (S, how) => {
  const M = 'corrector', R = 'subject', lied = !!how.lied, more = lied ? 0.25 : 0;
  const count = async (n, face) => { await S.smacks(1); if (face) S.face(face); await S.say(R, n); };
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.35 + more, pace: 1.3 });
  await S.wait(0.8);
  await S.say(M, 'Hands down. You know what this is for.', 'calm');
  await S.step([M, 'Silver bells. Cockle shells. Pretty maids, all in a row.', 'stern'], 8);
  await S.step([R, 'I know, Mama—'], 4);
  await S.step([M, 'In a row, Little Red. Not under your boots.'], 8);
  await S.smacks(6);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.55 + more, pace: 1.5 });
  await S.step([M, 'The paths are there for a reason. You walk them slowly, and you look where you’re going.'], 10);
  await S.step([R, 'Ow— I will, I will—'], 4);
  await S.step([M, 'Somebody grew every one of those. Somebody knelt in the mud for them.'], 10);
  if (!lied) {
    await S.smacks(8);
    await S.say(M, 'There. You owned it, and that’s the end of it. Up you get.', 'calm');
    await S.wait(1.2); return;
  }
  await S.smacks(6);
  await S.gesture('drawers'); await S.wait(0.5);
  await S.say(R, 'Mama, please—');
  await S.say(M, 'You had your chance to tell me, and you told me a cat.', 'stern');
  S.set({ strength: 1.85, pace: 1.8 });
  await S.step([M, how.caught === 'witness' ? 'And I had to hear the truth from ' + (FULL[how.who] || 'a neighbour') + ', over a fence, like gossip.' : 'With the petals on your boots, Little Red. On your boots.'], 10);
  await S.step([R, 'I’m sorry! I’m sorry I said it!'], 6);
  await S.step([M, 'Flowers grow back. Trust takes longer.'], 10);
  await S.smacks(8);
  await S.fetch('hairbrush', {
    ask: [M, 'Up. The hairbrush, from the chest. You know where it is.'],
    waitFace: 'concerned', presentFace: 'stern',
    present: [R, '…Here, Mama.'],
    back: [M, 'Back over my knee.', 'stern'],
  });
  S.set({ strength: 1.8, pace: 1 }); await S.wait(0.8);
  await S.say(M, 'Six. Count them, and then it’s done with.', 'stern');
  await S.say(R, '…Yes, Mama.');
  await count('One…'); await count('Two…'); await count('Three…', 'concerned'); await count('Four…'); await count('Five…'); await count('Six… I’m sorry, Mama…', 'calm');
  await S.say(M, 'I know you are. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const afterGarden = how => how.lied ? [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'Come here. There. It’s finished, and I’m not cross any more.' },
  { who: 'red', face: 'teary', text: 'I should have said. The first time.' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'You should. Next time you will.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Better?' },
  { who: 'red', face: 'shy', text: 'Better. I’ll mind the paths.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'I know you will. I’ll show you how I set them straight again, tomorrow.' },
];

// Her mother, any other time: a word, by the time of day. (part: the calendar's)
const marenIdle = part => ({
  morning: [{ who: 'mother', face: 'smile', text: 'The garden won’t weed itself, love.' }],
  afternoon: [{ who: 'mother', face: 'calm', text: 'Back already? There’s bread on the board if you want it.' }],
  evening: [{ who: 'mother', face: 'calm', text: 'Supper soon. Wash your hands.' }],
  dusk: [{ who: 'mother', face: 'calm', text: 'Lamps soon. Are you in for the night?' }],
  night: [{ who: 'mother', face: 'smile', text: 'Bed, Little Red. It’s late.' }],
  dawn: [{ who: 'mother', face: 'surprised', text: 'Up before the birds? Who are you, and what have you done with my daughter?' }],
})[part] || [{ who: 'mother', face: 'calm', text: 'Yes, love?' }];
// Home after the curfew bell, against what was agreed.
const lateHome = () => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Past the bell. What did we agree?' },
  { who: 'red', face: 'shy', text: 'Home by nine.' },
  { who: 'mother', face: 'stern', text: 'Home by nine. I’ll remember this, Red, and so will you.' },
];

root.Story = { trodden, gardenFine, gardenAsk, gardenBoots, gardenBelieved, gardenReport, gardenTakeInHand, gardenCorrection, afterGarden, VILLAGE, villager, tomStops, tomCost, homecoming, homecomingCorrection, walkStop, STOPS, ERRANDS, breakfast, enough, maintenanceCorrection, afterMaintenance, GARDEN, broken, afterCorrection, bedtime, chores, marenIdle, lateHome, grandmother, granAgain, WALK, SPOTS };
})(typeof window !== 'undefined' ? window : globalThis);
