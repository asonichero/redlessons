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
  { who: 'red', face: 'surprised', thought: true, text: 'Red wool, lined with cream, and a deep hood. It’s the twin of the one I wore when I was small.' },
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
  S.set({ gazeWork: true });      // (her eyes on her work through the count: only the one she misses brings them up to her face)
  await count('One…'); await count('Two…'); await count('Three…'); await count('Owww, Four…', 'concerned');
  await count('Five…'); await count('Six, oh Mama…', 'calm'); await count('Seven…');
  await count('I’ll be good, Mama, I swear it!');
  S.set({ gazeWork: false });
  await S.say(M, 'That’s what this is for, Little Red. To make sure of it. Do you need that one again?', 'stern');
  await S.say(R, 'No, Mama!');
  await S.say(M, 'Then count it, love.', 'calm');
  await S.say(R, 'Eight…');
  S.set({ gazeWork: true });
  await count('Nine…');
  await count('Ten! I’m sorry, Mama!');
  await S.say(M, 'I know, love.', 'concerned');
  await count('Eleven!', 'stern');
  await count('Twelve.', 'stern');
  S.set({ gazeWork: false }); S.face('pout'); await S.wait(0.8);
  // (and the brush into her other hand, and her own laid on the sting, slowly, while she says it)
  await S.gesture('soothe', { hold: true });      // (it goes on until the scene fades)
  await S.say(M, 'There now. That’s done, and it stays done. You’re a good girl, Little Red. Just breathe. I’ve got you.', 'calm');
};      // (and the fade, as soon as that's said)

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
  well: { title: 'Water from the well', by: '10:00', place: 'well', action: 'Fill the little butt at the well', needs: 'butt', carry: 'butt', carryName: 'the water', pails: true, home: true, mins: 15,
    ask: 'The big butt’s low, and I’ll want water for the washing. Will you take the little one down to the well this morning, love, and fill it? Three pails does it.',
    there: [{ who: 'red', face: 'calm', thought: true, text: 'Down into the dark, and up again, heavy and slopping. My arms will know about this tomorrow.' },
      { who: 'red', face: 'calm', thought: true, text: 'Half the village has been at the well before me. I can tell by the wet on the stones.' }],
    back: { who: 'mother', face: 'smile', text: 'That’s the washing seen to. Thank you, love.' } },
  bread: { title: 'Bread from the bakery', by: '11:00', place: 'bakery', action: 'Ask for Mama’s loaves', needs: 'basket', carry: 'basket', carryName: 'the loaves', home: true, mins: 15, who: 'baker',
    ask: 'Master Pennock’s keeping two loaves back for us. Will you fetch them before he sells them out from under us?',
    met: [{ who: 'baker', face: 'smile', listen: { red: 'smile' }, text: 'Two of the best, Miss Rose, and warm through. You tell your mother they’re the best of the batch.' },
      { who: 'red', face: 'smile', thought: true, text: 'He says that every time. They smell like every morning I can remember.' }],
    there: [{ who: 'red', face: 'smile', thought: true, text: 'Warm through the cloth. “The best of the batch,” he says. He says it every time.' },
      { who: 'red', face: 'smile', thought: true, text: 'They smell like every morning I can remember.' }],
    back: { who: 'mother', face: 'smile', text: 'Still warm. He does look after us.' } },
  pot: { title: 'A pot to the forge for mending', by: '12:00', place: 'forge', action: 'Leave the pot with the smith', needs: 'pot', leave: 'pot', mins: 15, who: 'smith',
    ask: 'The big pot’s sprung its handle again. It’s on the chest: will you take it down to the forge before noon? Master Ferrier said he’d see to it.',
    met: [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Handle again? Leave it by the anvil. Tell your mother tomorrow.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'Eleven words. That’s a speech, for Master Ferrier.' }],
    there: [{ who: 'red', face: 'calm', thought: true, text: 'All heat and ringing in there. He nodded without stopping. That means yes.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'Tom’s nowhere about. Which means Tom’s somewhere he shouldn’t be.' }] },
  jug: { title: 'A jug from the inn', by: '17:00', place: 'inn', action: 'Ask for Mama’s jug', needs: 'basket', carry: 'basket', carryName: 'the jug', home: true, mins: 15, who: 'abney',
    ask: 'Mistress Abney’s promised me a jug of her small beer for supper. Will you go along for it this afternoon?',
    met: [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Your mother’s jug. There. And how is she? And how are you, Miss Rose?' },
      { who: 'red', face: 'calm', text: 'Well, thank you, Mistress Abney.' },
      { who: 'red', face: 'shy', thought: true, text: 'She always looks as if she knows something I haven’t said yet.' }],
    there: [{ who: 'red', face: 'shy', thought: true, text: 'She looked at me a little longer than the question needed.' },
      { who: 'red', face: 'shy', thought: true, text: 'She always looks as if she knows something I haven’t said yet.' }],
    back: { who: 'mother', face: 'calm', text: 'On the table, love. Was she well?' } },
  dunns: { title: 'A basket for the Dunns', by: '15:00', place: 'dunns', action: 'Leave the pie at the Dunns’', needs: 'basket', pie: true, mins: 10, who: 'willie',
    ask: 'I’ve a pie for the Dunns: Master William’s been on his rounds all week. Will you take it over this afternoon? Quietly, mind. He’ll be sleeping.',
    there: [{ who: 'red', face: 'calm', thought: true, text: 'Shutters closed upstairs: Master William’s asleep. On the step, then, and no knocking.' },
      { who: 'red', face: 'smile', thought: true, text: 'Georgie and I used to play under that window, and Master William would lean out and pretend to growl at us.' }] },
  bakery: { title: 'Help at the bakery', by: '13:00', place: 'bakery', action: 'Go in to help Mistress Pennock', mins: 170, who: 'pennock', trust: 'pennock', quest: 'pennock.helps', shift: 'bakery',      // (played inside: js/work.js)
    ask: 'Mistress Pennock’s girl is poorly, and she’s short of hands. The baking’s done by noon, but there’s the clearing down after, and tomorrow’s to get ready. Will you go and help her this afternoon? By one, she said.',
    met: [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Rose, love, you’re an angel. Sleeves up, apron on. It’s all the dull half of baking, I’m afraid.' }],
    there: [{ who: 'red', face: 'smile', thought: true, text: 'Flour to my elbows, and Mistress Pennock talking the whole afternoon, about everything and everyone.' }] },
  inn: { title: 'Work at the inn', by: '14:00', place: 'inn', action: 'Go in to work for Mistress Abney', mins: 180, who: 'abney', trust: 'abney', quest: 'abney.work', shift: 'inn',      // (played inside: js/work.js)
    ask: 'Mistress Abney could use you this afternoon: the carrier’s due, and Bess can’t be on her feet all day. Will you go along by two?',
    met: [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'There you are. Pots first, then the tables, then Bess, who’ll tell you she needs nothing. She’s lying.' },
      { who: 'red', face: 'calm', thought: true, text: 'Pots and plates, and the carrier’s men, and Bess directing everyone from her chair.' },
      { who: 'red', face: 'calm', thought: true, text: 'Nobody asked me for anything I couldn’t do. I didn’t know that could feel restful.' }],
    there: [{ who: 'red', face: 'calm', thought: true, text: 'Pots and plates, and the carrier’s men, and Bess directing everyone from her chair.' },
      { who: 'red', face: 'calm', thought: true, text: 'Nobody asked me for anything I couldn’t do. I didn’t know that could feel restful.' }] },
  eggs: { title: 'Eggs from the Fowlers’', by: '12:00', place: 'door', area: 'holding', action: 'Ask Master Fowler for the eggs', carry: 'basket', carryName: 'the eggs', needs: 'basket', home: true, mins: 20, who: 'fowler', trust: 'fowler',
    ask: 'Master Fowler’s hens are laying like they’re paid for it, and he’s promised me a dozen. Will you walk over to the Fowlers’ for them this morning? Take the basket.',
    met: [{ who: 'fowler', face: 'calm', listen: { red: 'calm' }, text: 'A dozen, and two over for your mother’s trouble. Mind them on the stile, girl.' },
      { who: 'red', face: 'smile', thought: true, text: 'Still warm, some of them. The hens look very pleased with themselves.' }],
    there: [{ who: 'red', face: 'smile', thought: true, text: 'A dozen and two over, waiting under a cloth by the door.' }],
    back: { who: 'mother', face: 'smile', text: 'Fourteen! He does spoil us. How was Master Fowler? And Peter?' } },
  flock: { title: 'Help Bo Peep pen the flock', by: '19:30', place: 'pinfold', action: 'Help pen the flock', mins: 30, who: 'halloran',
    ask: 'Halloran’s granddaughter could use another pair of hands bringing the flock in tonight. Will you meet her at the pinfold by half past seven?',
    there: [{ who: 'red', face: 'smile', thought: true, text: 'Counted twice, and once more for the one that always comes round again. All in.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'The bell’s just there on the green. Somebody could ring it early, one night. Not me, of course.' }] },
};
// Over breakfast: her mother's word for the day, and the asking. errand: one of ERRANDS, or null (nothing asked: the day's her own).
// ctx: { temper ('wilful' | 'mischievous' | 'naughty' | null: what she's most known for lately), yes(), little(), wont() (run on each answer) }.
const breakfast = (errand, ctx) => {
  const hello = { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'There. Bowls done, and you fed. Now then.' };
  // (the garden: hers today, or her mother's: ctx.garden 'maren' (she has the time) or 'after' (the day after a correction for it))
  const garden = ctx.garden === 'after' ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Leave the garden to me today. I’ll set my flowers straight myself.' }]
    : ctx.garden === 'maren' ? [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'I’ve a free morning, so the garden’s mine today. You needn’t go near it.' }]
    : ctx.rained ? [{ who: 'mother', face: 'calm', text: 'It rained in the night, so the flowers won’t want watering. Just the weeds and the beds.' }] : [];
  if (!errand) return [hello].concat(garden, [{ who: 'mother', face: 'calm', text: ctx.garden ? 'And nobody’s asked anything of us. The day’s your own.' : 'Nobody’s asked anything of us today. The garden, and then the day’s your own.' }]);
  const t = ctx.temper, by = ctx.byText;
  const YES = { wilful: 'Fine. Yes. I’ll do it.', mischievous: 'Yes, Mama. I’ll be quick. Mostly.', naughty: 'Yes, Mama.' }[t] || 'Yes, Mama.';
  const WONT = { wilful: 'No. I’ve had enough of being asked for things.', mischievous: 'Can’t it wait? I’d other plans. No.', naughty: 'Why me? Let them fetch it themselves.' }[t] || 'No. I don’t want to.';
  return [hello].concat(garden, [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: errand.ask },
    { choose: [
      { text: YES, face: 'smile', then: [{ run: ctx.yes }, { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'That’s my girl. By ' + by + ', mind.' }] },
      { text: 'Not today, Mama. I can’t be anybody’s today.', face: 'shy', then: [{ run: ctx.little },
        { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: ctx.garden ? 'Then not today, love. I’ll let them know. Let the day be easy.' : 'Then not today, love. I’ll let them know. Just the garden, and let the day be easy.' }] },
      { text: WONT, face: 'pout', then: [{ run: ctx.wont },
        { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'That’s not “can’t”, Red. That’s “won’t”. I’ll remember it.' }] },
    ] }]);
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
  peter: {
    any: [
      [{ who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Red! Grandad gave me the day. I said I’d buy thread, and I have, so the rest of it’s mine.' }, { who: 'red', face: 'smile', text: 'What will you do with it?' }, { who: 'peter', face: 'bashful', text: 'I hadn’t thought. This, maybe.' }],
      [{ who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'Georgie’s been mooning at the well again. Agnes pretends not to notice. It’s like watching two hens that both want the same worm.' }, { who: 'red', face: 'cheeky', text: 'Which of them’s the worm?' }, { who: 'peter', face: 'smile', text: 'That’s the question.' }],
      [{ who: 'peter', face: 'pout', listen: { red: 'cheeky' }, text: 'If you see Tom, I’m not here. He’s been at the Peter Piper again.' }],
    ],
    again: [{ who: 'peter', face: 'smile', text: 'Still here. Still not buying more thread.' }],
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
  if (key === 'abney' && ctx.brokenPromise) return [      // (the promise to sit with Bess, broken: until she's said sorry)
    { who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'Miss Rose.' },
    { who: 'red', face: 'wince', thought: true, text: 'Colder than the well. She didn’t even stop what she was doing.' },
    { who: 'red', face: 'wince', text: 'Mistress Abney, I’m sorry. About Bess. I should have come. I said I would, and I didn’t.' },
    { who: 'abney', face: 'calm', listen: { red: 'wince' }, text: 'You should have. She sat there till nine, watching the door.' },
    { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Well. You’ve said it to my face, and that’s something. Don’t make me need you again and find you wanting.' }];
  if (ctx.first && V.first) return V.first;
  if (key === 'georgie' && ctx.part === 'dusk' && V.late) return V.late;
  if (ctx.today && V.again) return V.again;
  const said = pickOf(V.any, ctx.day + (ctx.today ? 1 : 0));
  return ctx.errand && V.errand ? said.concat(V.errand) : said;
};

// ── Tom finds her, with something she ought to be doing: he keeps her, while the clock runs (ctx.mins(n): n minutes gone, each beat). She can
// get away early, or stay: then a chat (kind 'chat'), or a dare (the curfew bell, 'bell'; or a knock at the Dunns' door, 'knock').
// ctx: { kind, busy (she has something she ought to be doing), errand, first, mins(n), accept() (the dare taken: hers to do), chatted() }
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
    const did = [{ run: ctx.accept }, T('cheeky', ctx.kind === 'bell' ? 'Go on, then. I’ll be watching from here. Three, mind. Not two.' : 'Go on, then. I’ll be watching from the corner. Three knocks, and then run.', 'cheeky')];
    middle = [
      T('cheeky', 'I’ve been waiting all day for somebody worth daring. I dare you to ' + what, 'surprised'), M(3),
      { choose: [
        { text: 'Done.', face: 'cheeky', then: did },
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
// After the dare, Tom running up to her (kind: 'bell' | 'knock').
const tomDared = kind => kind === 'bell' ? [
  { who: 'tom', face: 'cheeky', listen: { red: 'cheeky' }, text: 'Ha! Look at them all, turning round like geese. You’re a marvel, Ridley.' },
  { who: 'red', face: 'cheeky', text: 'They didn’t see. Did they see?' },
  { who: 'tom', face: 'smile', listen: { red: 'wince' }, text: 'Course they didn’t. Probably.' },
] : [
  { who: 'tom', face: 'cheeky', listen: { red: 'wince' }, text: 'That’s his shutter! Run! Did you hear him? I’ve never heard a man growl like it.' },
  { who: 'red', face: 'wince', text: 'He’ll know it was me. He always knows.' },
  { who: 'tom', face: 'smile', listen: { red: 'wince' }, text: 'Then he’ll know you’re brave.' },
];
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
  { who: 'red', face: 'wince', thought: true, text: 'She’s looking at my boots.' },
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
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'They saw you in my garden. Walking straight through ' + (r.rows ? mine(r.rows) : 'my flowers') + ', as if they were grass.' },
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
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'You should. Next time you will. And leave the garden to me tomorrow; I’ll set my flowers straight.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Better?' },
  { who: 'red', face: 'shy', text: 'Better. I’ll mind the paths.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'I know you will. Leave the garden to me tomorrow: I’ll set my flowers straight myself.' },
];

// ── The pie (js/pie.js). Tom's idea, the board, Mistress Pennock out of her door, the forge, and what Red does then.
// The dare. ctx: { again (it went how it went, last time), mins(n), done(), no() }
const pieDare = ctx => {
  const T = (face, text, red) => ({ who: 'tom', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, text }), M = n => ({ run: () => ctx.mins(n) });
  const opening = ctx.again ? [
    T('cheeky', 'Ridley. Smell that? She’s had the pies out on the board since dinner.', 'surprised'), M(2),
    R('pout', 'Tom Ferrier. Last time you got Mistress Pennock and I got my mother.'),
    T('smile', 'Water under the bridge. And you’ve forgotten how good they were.', 'pout'),
    R('cheeky', 'We never got to taste them.'), T('cheeky', 'Then it’s high time we did.', 'cheeky'),
  ] : [
    T('cheeky', 'Ridley. Smell that? Mistress Pennock’s pies, out on the board to cool, and her inside with her back to the window.', 'surprised'), M(2),
    R('shy', 'Tom…'),
    T('cheeky', 'One pie. She bakes a dozen. She’ll never miss it. I dare you.', 'cheeky'),
  ];
  return opening.concat([M(2), { choose: [
    { text: 'Watch me.', face: 'cheeky', then: [{ run: ctx.done }] },
    { text: 'Not her pies, Tom. Not today.', face: 'shy', then: [{ run: ctx.no }, M(2), T('pout', 'Coward. Well, they’ll be there tomorrow, and the day after.', 'shy')] },
  ] }]);
};
// Mistress Pennock, out of her door before Red's turned round; and Tom, who thought he was out of sight.
const pieCaught = () => [
  { who: 'pennock', face: 'stern', listen: { red: 'surprised' }, text: 'Rose Ridley.' },
  { who: 'red', face: 'surprised', text: 'Mistress Pennock! I was only— it was—' },
  { who: 'pennock', face: 'stern', listen: { red: 'wince' }, text: 'You were only walking off up the street with my pie. I can see that. And you can come out from behind there, Tom Ferrier. I can see your boots.' },
  { who: 'tom', face: 'wince', listen: { red: 'wince' }, text: '…Afternoon, Mistress Pennock.' },
  { who: 'pennock', face: 'stern', listen: { red: 'shy' }, text: 'Give it here. Thank you. Now the pair of you, with me. We’re going to see your father, young Master Ferrier.' },
];
// At the forge: the smith leaves Tom to her; and Red's sent home, or she says what she wants to say. ctx: { again, obey(), tell() }
const pieForge = ctx => [
  { who: 'pennock', face: 'stern', listen: { red: 'shy' }, text: 'Master Ferrier. Your lad, and Maren Ridley’s girl, and one of my pies.' },
  { who: 'smith', face: 'stern', listen: { red: 'shy' }, text: ctx.again ? 'Again.' : 'Was it, now.' },
  { who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'I’ve this to finish before it cools, Mistress. Deal with him as you see fit. He knows you have my leave.' },
  { who: 'tom', face: 'wince', listen: { red: 'wince' }, text: 'Father—' },
  { who: 'smith', face: 'stern', text: 'You heard me.' },
  { who: 'pennock', face: 'stern', listen: { red: 'shy' }, text: 'As for you, Miss Rose: straight home to your mother. I’ll be speaking with her myself, and you can be sure she’ll hear all of it.' },
  { choose: [
    { text: 'Yes, Mistress Pennock.', face: 'shy', then: [{ run: ctx.obey }, { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Go on, then. Straight home, mind. Come along, Tom.' }] },
    { text: 'Mistress Pennock… may I say something? Just to you.', face: 'shy', then: [{ run: ctx.tell },
      { who: 'red', face: 'shy', listen: { pennock: 'calm' }, text: 'It was my hand on the pie, not his. Whatever you give Tom, I’ve earned it too.' },
      { who: 'red', face: 'shy', listen: { pennock: 'concerned' }, text: 'Mama takes me in hand, when I’ve earned it. I asked her to. And I think she’d want you to, for this. I’d rather it was you, now, than carry it home.' },
      { who: 'pennock', face: 'concerned', listen: { red: 'shy' }, text: 'Your mother does, does she. I did wonder, once or twice.' },
      { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Well. You were honest with me, and that took some doing. Then you’ll come along with us, and I’ll speak to your mother after.' }] },
  ] },
];
// In the bakery, before it.
const pieBakery = () => [
  { who: 'pennock', face: 'stern', listen: { red: 'shy' }, text: 'Tom first. You’ll stand there and see it, Rose, and then it’s your turn, as you asked.' },
  { who: 'red', face: 'shy', text: 'Yes, Mistress Pennock.' },
];
// Tom across her knee: he jokes, and stops joking; his word's his own, and he doesn't use it.
const pieTom = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.5, pace: 1.4 });
  await S.wait(0.6);
  await S.say(R, 'You know, Mistress Pennock, it was a very good pie.');
  await S.say(M, 'It was. And it’s still on my board, no thanks to you.', 'stern');
  await S.step([M, 'A dare, was it? Every time, Tom Ferrier. Every time it’s a dare.'], 8);
  await S.step([R, 'Ow— she didn’t have to take it!'], 4);
  await S.step([M, 'No. And you didn’t have to ask her. That’s what this is for.'], 8);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.8, pace: 1.6 });
  await S.step([M, 'You’re a grown man and a good smith’s apprentice, and you still can’t walk past a windowsill.'], 10);
  await S.step([R, 'I can walk past it— ow!— I just don’t—'], 4);
  await S.set({ implement: 'bakersPaddle', strength: 1.7, pace: 1 });
  await S.say(M, 'And now the paddle. Six.', 'stern');
  await S.smacks(6);
  await S.say(R, '…Fair.');
  await S.say(M, 'Into the corner, Tom. Hands on your head.', 'calm');
};
// Then Red: the same, as she asked, and a word for the asking.
const pieRed = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.4, pace: 1.35 });
  await S.wait(0.6);
  await S.say(M, 'Over you come, Rose. You asked for the same, and you’ll have it.', 'calm');
  await S.step([M, 'A pie is a morning’s work. Up before it’s light, the oven, the pastry, all of it.', 'stern'], 8);
  await S.step([R, 'I know— I’m sorry—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.7, pace: 1.6 });
  await S.step([M, 'And you’ll not let Tom Ferrier talk you into anything again without thinking twice. Not for a pie. Not for anything.'], 10);
  await S.step([R, 'Ow— no, Mistress Pennock—'], 4);
  await S.step([M, 'You told me the truth today, and that was brave. I’ll not forget it.'], 8);
  S.set({ implement: 'bakersPaddle', strength: 1.6, pace: 1 });
  await S.say(M, 'Six with the paddle, the same as he had. Then it’s done, and we’re even.', 'stern');
  await S.smacks(6);
  await S.say(M, 'There. Up you get, love.', 'calm');
  await S.wait(1.0);
};
// After: Mistress Pennock's word to her (r: how it went), and Tom sent home.
const pieAfter = r => r && r.rose ? [
  { who: 'pennock', face: 'concerned', listen: { red: 'shy' }, text: 'Sit a minute, Rose. There’s milk. You did right to stop me.' },
] : [
  { who: 'pennock', face: 'calm', listen: { red: 'teary' }, text: 'There. Done, and we’re even, the three of us. Tom can knead my dough for an hour, and then home with his ears ringing.' },
  { who: 'pennock', face: 'smile', listen: { red: 'shy' }, text: 'And you. Come and see me, any time. Not for pies. Just come.' },
  { who: 'red', face: 'shy', text: 'Thank you, Mistress Pennock.' },
  { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'I’ll walk up and see your mother this evening. She’ll hear it from me, all of it, the good part too.' },
];
// That evening, at home: Mistress Pennock's been.
const pieMotherKnows = () => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Mistress Pennock came by. She told me about the pie. And she told me what you asked her for.' },
  { who: 'red', face: 'shy', text: 'Are you cross?' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'About the pie, a little. About the rest, no. That was yours to tell, love, and you told it well.' },
];
// Sent home: her mother, as soon as she's in. ctx: { tell(), keep() }
const pieHome = ctx => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You’re home early. And you’ve a face like a wet Sunday. What is it?' },
  { choose: [
    { text: 'Mama… I took one of Mistress Pennock’s pies. On Tom’s dare. She caught us.', face: 'shy', then: [{ run: ctx.tell },
      { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Did she, now.' },
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me yourself. It counts. And it doesn’t change what the pie earned you.' }] },
    { text: 'Nothing, Mama. I’m just tired.', face: 'shy', then: [{ run: ctx.keep },
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Hm. Sit down, then. I’ll put the kettle on.' },
      { who: 'red', face: 'shy', thought: true, text: 'She’ll hear. Mistress Pennock said she’d tell her. Tomorrow, maybe.' }] },
  ] },
];
// A day on: her mother's had a visit.
const pieFoundOut = () => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Mistress Pennock came by this afternoon.' },
  { who: 'red', face: 'wince', text: 'Oh.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: '“Oh.” A pie off her board, on Tom Ferrier’s say-so, and the two of you marched to the forge. And you sat at my table last night and said you were tired.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Come here, Little Red.' },
];
// Her mother's correction for the pie: her hand, longer for keeping it back (how: { withheld }).
const pieMaren = async (S, how) => {
  const M = 'corrector', R = 'subject', more = how.withheld ? 0.25 : 0;
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.4 + more, pace: 1.35 });
  await S.wait(0.8);
  await S.say(M, 'A pie, Little Red. Off a neighbour’s board, in broad day.', 'stern');
  await S.step([M, 'Mistress Pennock fed you crusts over that counter when you were knee-high.'], 8);
  await S.step([R, 'I know, Mama—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.6 + more, pace: 1.55 });
  await S.step([M, 'And Tom Ferrier dares, and you jump. Every time.'], 10);
  await S.step([R, 'Ow— not every time—'], 4);
  await S.step([M, 'Often enough.'], 8);
  if (how.withheld) {
    await S.gesture('drawers'); await S.wait(0.5);
    await S.say(R, 'Mama—');
    await S.say(M, 'You let me hear it from a neighbour, a day late. That’s the part I mind most.', 'stern');
    S.set({ strength: 1.85, pace: 1.8 });
    await S.step([M, 'When you’ve done something, you come home and you tell me. You don’t make me find out.'], 12);
    await S.step([R, 'I’m sorry! I’m sorry, Mama!'], 6);
    await S.smacks(8);
  } else {
    await S.smacks(8);
  }
  await S.say(M, 'There. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const pieMarenAfter = how => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: how.withheld ? 'Next time you come straight to me. Yes?' : 'You told me yourself. That’s the bit I’ll remember.' },
  { who: 'red', face: 'shy', text: how.withheld ? 'Yes, Mama.' : 'I’m sorry about the pie.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Tomorrow you’ll go and say so to Mistress Pennock. Now wash your face.' },
];

// ── Evenings at home (js/evening.js). The Watchman's catch; home after the bell; what someone else has dealt with; supper.
// He finds her out after the bell (n: which time).
// Seen from across the green: he calls to her to stop where she is.
const willieCalls = n => [{ who: 'willie', face: 'stern', listen: { red: 'wince' }, text: n > 1 ? 'Miss Rose! Stop there.' : 'Miss Rose! Stop where you are, if you please.' }];
const willieCatch = n => n > 1 ? [
  { who: 'willie', face: 'stern', listen: { red: 'wince' }, text: 'Miss Rose. Again.' },
  { who: 'red', face: 'wince', text: 'I was just going home, Sir. Truly.' },
  { who: 'willie', face: 'calm', listen: { red: 'shy' }, text: 'Then we’re going the same way. After you.' },
] : [
  { who: 'willie', face: 'stern', listen: { red: 'surprised' }, text: 'Miss Rose. The bell’s rung, and here you are, still out.' },
  { who: 'red', face: 'shy', text: 'Sir— I lost track of the time. I’m going home now.' },
  { who: 'willie', face: 'calm', listen: { red: 'shy' }, text: 'You are. And I’ll walk with you, to your mother’s door. After you, Miss Rose.' },
];
// At her door: he hands her over.
const willieBrings = n => [
  { who: 'willie', face: 'calm', listen: { mother: 'stern' }, text: n > 1 ? 'Evening, Mistress Ridley. Miss Rose again, I’m afraid. On the green, past the bell.' : 'Evening, Mistress Ridley. I found Miss Rose out on the green, past the bell. I’ve walked her home.' },
  { who: 'mother', face: 'stern', listen: { willie: 'calm' }, text: 'Thank you, William. I’ll see to her.' },
  { who: 'willie', face: 'calm', listen: { mother: 'calm' }, text: 'I don’t doubt it. Goodnight, Mistress. Miss Rose.' },
  ];
// Home after the bell. (how.willie: brought home)
const curfewTalk = how => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: how.willie ? 'Brought home by the Watchman. Like a stray off the green.' : 'Do you know what time it is, Little Red? Because the bell does.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mama. I didn’t mean to be so late.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Nine o’clock, and not a minute past it. You agreed it, at this table. Come here.' },
];
const curfewCorrection = async (S, how) => {
  const M = 'corrector', R = 'subject', more = how.willie ? 0.2 : 0;
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.4 + more, pace: 1.35 });
  await S.wait(0.8);
  await S.say(M, 'Hands down. You know what this is for.', 'calm');
  await S.step([M, 'Nine o’clock. Not ten past. Not when you’ve finished whatever you’re about.', 'stern'], 8);
  await S.step([R, 'I know, Mama—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.65 + more, pace: 1.6 });
  await S.step([M, 'I sat here with the lamp, and listened for the latch, and it didn’t come.'], 10);
  await S.step([R, 'I’m sorry— ow— I’m sorry—'], 4);
  if (how.willie) {
    await S.step([M, 'And William Dunn walking you to my door, with half the street’s shutters open to watch.'], 10);
    await S.step([R, 'Mama, please—'], 4);
    await S.smacks(8);
  }
  await S.step([M, 'Home by the bell. Every night. That’s the shape of it.'], 8);
  await S.smacks(8);
  await S.say(M, 'There. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const curfewAfter = how => [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'There’s bread and cheese on the board, and then bed. Straight to bed.' },
  { who: 'red', face: 'shy', text: 'Yes, Mama.' },
].concat(how.willie ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'And you’ll thank Master William when you see him. He could have left you to the dark.' }] : []);
// What someone else has already dealt with (c: { what, by }): a reprieve. how: 'heard' (they told her), 'reported' (Red just did), 'late' (she
// heard of it in the village, Red having kept it back).
const DEALT = { pie: 'the pie', dare: 'the dare with Tom', abney: 'what you asked of her' };
const reprieve = (c, how) => {
  const who = FULL[c.by] || 'someone', what = DEALT[c.what] || c.what;
  if (c.what === 'pie' && how === 'heard') return pieMotherKnows();
  if (c.what === 'abney') return [
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Mistress Abney stopped by. She told me what you asked of her, and what she did about it.' },
    { who: 'red', face: 'shy', text: 'Are you cross?' },
    { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'No, love. I’m glad you’ve someone else to go to. It’s what I’d have wanted for you.' }];
  if (how === 'reported') return [
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me. ' + who + ' dealt with it, then, and that’s the end of it here. I’ll not take you in hand twice for one thing.' },
    { who: 'red', face: 'shy', text: 'Thank you, Mama.' }];
  if (how === 'late') return [
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'I heard about ' + what + ' today. And that ' + who + ' saw to you for it.' },
    { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Once is enough for one thing, so that’s the end of it. But I’d sooner have heard it from you.' }];
  return [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: who + ' came by about ' + what + '. You’ve had your correction for it, and that’s an end of it. Once is enough for one thing.' }];
};
// Something someone else dealt with, that her mother doesn't know of yet: Red can tell her. ctx: { tell() }
const reportIt = (c, ctx) => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You’re quiet tonight.' },
  { choose: [
    { text: 'Mama… ' + (FULL[c.by] || 'Someone') + ' took me in hand today. For ' + (DEALT[c.what] || c.what) + '.', face: 'shy', then: [{ run: ctx.tell }] },
    { text: 'It’s nothing, Mama.', face: 'shy', then: [{ who: 'mother', face: 'calm', text: 'Hm. If you say so.' }] },
  ] },
];
// Nothing owed tonight: will she help with supper? ctx: { yes(), little(), wont() }
const supper = ctx => [
  { who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'There you are. Will you help me with the supper, love? The potatoes want peeling, and the pot wants watching.' },
  { choose: [
    { text: 'Of course, Mama.', face: 'smile', then: [{ run: ctx.yes }] },
    { text: 'Could I just sit, Mama? I’m worn through.', face: 'shy', then: [{ run: ctx.little },
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Sit, then. You’ve had a long day of it.' }] },
    { text: 'Must I? I’ve done enough today.', face: 'pout', then: [{ run: ctx.wont },
      { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'That’s not tired, Red. That’s “won’t”. I’ll do it myself, and I’ll remember it.' }] },
  ] },
];

// Her day, caught up on (how: 'yes', over the potatoes; 'little', on the stool while her mother sees to the hearth; 'wont', stood, and
// questioned). day: { errand: { title, state, late } | null, garden: true | false | null, dare: 'bell' | 'knock' | null, peter, herb }.
const dayTalk = (how, day) => {
  const M = (face, text, red) => ({ who: 'mother', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, text });
  const low = t => t[0].toLowerCase() + t.slice(1), out = [];
  out.push(how === 'yes' ? M('smile', 'Now, then. Peel, and tell me your day.', 'smile') : how === 'little' ? M('calm', 'Sit there and tell me about it, then, while I see to this fire.', 'shy')
    : M('stern', 'And what was so hard about today, that you can’t peel a potato for your own supper?', 'pout'));
  if (how === 'wont') out.push(R('pout', 'Nothing. Everything. I don’t know.'), M('stern', 'Then you can tell me the nothing, and I’ll decide.', 'pout'));
  const e = day.errand;
  if (e && (e.state === 'done' || e.state === 'carrying')) out.push(R('calm', 'I saw to it: ' + low(e.title) + (e.late ? ', late. But I did it.' : '.')), e.late ? M('calm', 'Late’s better than never. Earlier, next time.') : M('smile', 'Good girl.', 'smile'));
  else if (e && e.state === 'broken') out.push(R('shy', 'I never got to it. ' + e.title + '.'), M('stern', 'No. I know. You said you would, Red.', 'shy'));
  else if (e && e.state === 'little') out.push(R('shy', 'I couldn’t do the errand. You know why.'), M('calm', 'I know. That’s allowed.', 'shy'));
  if (day.garden === true) out.push(R('smile', 'And the garden’s done.'), M('smile', 'I saw. The bells look pleased with themselves.', 'smile'));
  else if (day.garden === false) out.push(M('calm', 'And the garden?', 'shy'), R('shy', '…Tomorrow, Mama.'));
  if (day.herb) out.push(R('smile', 'Grandmother taught me ' + day.herb.name + '. What it’s for.'), M('smile', 'She taught me the same, at your age. I’d forgotten half of it.', 'smile'));
  if (day.peter) out.push(R('shy', 'I saw Peter, at the beech.'), M('smile', 'Did you, now.', 'shy'));
  if (day.dare) out.push(M('calm', day.dare === 'bell' ? 'Someone rang the curfew bell at noon, I hear. Half the green came out.' : 'Master William was woken this morning. Three knocks, and nobody there.', 'wince'), R('wince', 'Was he?'), M('stern', 'Hm.', 'wince'));
  if (out.length < 3) out.push(R('calm', 'Nothing much, Mama. A quiet sort of day.'), M('calm', 'Those are allowed too.'));
  out.push(how === 'wont' ? M('stern', 'Well. I hope tomorrow’s an easier day.', 'pout') : M('tender', 'You handled today well, love. I’m proud of you. I mean it.', 'shy'));
  out.push(M('calm', 'Set the table for supper, would you? And after supper, bed.'));
  return out;
};

// ── Work, played (js/work.js): the boss's word at the start, while each task is done ([text, face]: said as she works, nothing waits on it),
// the customers at the counter, and at the end.
const WORK = {
  bakery: {
    start: [
      { who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'There you are, love. Apron’s on the hook. Master Pennock’s been at it since four and he’s gone to his bed, so it’s you and me and the mess he’s left.' },
      { who: 'red', face: 'calm', text: 'Where do you want me?' },
      { who: 'pennock', face: 'calm', listen: { red: 'calm' }, text: 'The trough first, then the boards, then the oven. And tomorrow’s flour and the sponge before you go. I’ll tell you as we go.' },
    ],
    trough: ['Scrape it right into the corners. Leave a crust of old dough and tomorrow’s bread tastes of yesterday.', 'calm'],
    boards: ['Hot water and the brush, with the grain, not across it. My mother used to say you could tell a girl’s temper by her bread. I say by her boards.', 'smile'],
    ash: ['Rake it to the front and out into the bucket. Mind your sleeves: it holds its heat longer than you’d think.', 'stern'],
    racks: ['What’s left goes on the end shelf, for the Hallorans and the bargain hunters. Nothing’s wasted in this house.', 'calm'],
    sift: ['Through the fine sieve, and shake it, don’t press. Flour gets everywhere: in the cracks, in my hair, in Master Pennock’s moustache. He says it keeps him handsome.', 'smile'],
    sponge: ['A handful of this morning’s dough in the warm water, and the flour on top. Cover it, and by four tomorrow it’ll be up and wanting him.', 'calm'],
    sweep: ['And the floor, last thing, out of the door. Then we’re done, and you can sit.', 'smile'],
    end: [
      { who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'That’s us cleared, and tomorrow begun. You’ve good hands for it. Off you go, and take your mother a bun from me.' },
      { who: 'red', face: 'smile', text: 'Thank you, Mistress Pennock.' },
      { who: 'red', face: 'smile', thought: true, text: 'She talked the whole while, about everything and everyone. It was nicer than I thought it would be.' },
    ],
  },
};

// ── The Fowlers' (js/holding.js): Peter and his grandfather. Peter calls her Red, as he always has; Master Fowler, Miss Rose, or "girl" when
// he forgets himself. ctx: { first, today, day, part }
const FOWLERS = {
  peter: {
    first: [
      { who: 'peter', face: 'smile', listen: { red: 'shy' }, text: 'Red.' },
      { who: 'red', face: 'shy', thought: true, text: 'He’s smiling. And now he’s looking at his net, as if it might help.' },
      { who: 'red', face: 'shy', text: 'Hello, Peter.' },
      { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Grandad said you’d been to your grandmother’s. In the new cloak. He saw you go by the meadow.' },
      { who: 'red', face: 'smile', text: 'Your grandad sees everything.' },
      { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'He sees the wood. Everything else he hears from the hens.' },
    ],
    any: [
      [{ who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'Linnets in the meadow this morning, a whole charm of them. I let them be. Some days I just like to watch.' },
        { who: 'red', face: 'smile', text: 'A fowler who lets the birds go.' }, { who: 'peter', face: 'smile', text: 'Don’t tell Grandad.' }],
      [{ who: 'peter', face: 'pout', listen: { red: 'cheeky' }, text: 'Tom came by yesterday. “Peter Piper picked a peck.” Every time. Every single time.' },
        { who: 'red', face: 'cheeky', text: 'Did you?' }, { who: 'peter', face: 'smile', text: 'Pick a peck? I picked him up and put him in the duck pond. He went quiet for nearly an hour.' }],
      [{ who: 'peter', face: 'calm', listen: { red: 'shy' }, text: 'You can sit, if you like. The nets don’t mind being watched.' },
        { who: 'red', face: 'smile', thought: true, text: 'We sit, and he mends a tear with quick, sure fingers, and neither of us says much. It doesn’t need saying.' }],
    ],
    again: [{ who: 'peter', face: 'smile', text: 'Back again. I’m glad.' }],
  },
  fowler: {
    first: [
      { who: 'fowler', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose. You’ll be wanting the boy, I suppose. Everybody does.' },
      { who: 'red', face: 'shy', text: 'Good morning, Master Fowler.' },
      { who: 'fowler', face: 'stern', listen: { red: 'calm' }, text: 'How’s your grandmother keeping, out there? Tell her I asked. Tell her I said she’s a fool to live in that wood alone, and that I said it kindly.' },
    ],
    any: [
      [{ who: 'fowler', face: 'stern', listen: { red: 'calm' }, text: 'Something’s been at the edge of the wood at night. I’ve heard it. Not a fox: too heavy. You keep to the path, girl.' }],
      [{ who: 'fowler', face: 'calm', listen: { red: 'smile' }, text: 'Hulda and I go back further than either of us cares to count. She mended my leg once, when the doctor said it’d have to come off.' }],
      [{ who: 'fowler', face: 'smile', listen: { red: 'calm' }, text: 'The boy’s a good lad. Too good, sometimes. Hasn’t given me cause to take my stick to him in years. I almost miss it.' }],
    ],
    again: [{ who: 'fowler', face: 'calm', text: 'Still here? The hens will start charging you rent.' }],
  },
};
const fowlers = (key, ctx) => { const F = FOWLERS[key]; if (!F) return []; if (ctx.first) return F.first; if (ctx.today) return F.again; return pickOf(F.any, ctx.day); };

// ── Peter (js/peter.js). The first visit: Master Fowler at his gate (ctx.eggs: she's come for her mother's eggs); letting her in, and
// pointing out Peter (where: the nets, the coop, the pond); the first talk with Peter, and his grandfather sending him to walk her back; the
// two of them at the meadow gate.
const firstVisit = ctx => [
  { who: 'fowler', face: 'calm', listen: { red: 'shy' }, text: ctx.eggs ? 'Miss Rose, with Maren’s basket. You’ll be after the eggs. Fourteen, and don’t tell me they’re too many: the hens won’t hear of it.' : 'Miss Rose. Well. You’ve not come up this lane since you were knee-high and chasing my duck.' },
  { who: 'red', face: 'shy', text: ctx.eggs ? 'Thank you, Master Fowler. Mama sends her thanks.' : 'I’m sorry, Master Fowler. About the duck.' },
  { who: 'fowler', face: 'smile', listen: { red: 'smile' }, text: ctx.eggs ? 'She’d better.' : 'The duck forgave you. Eventually.' },
  { who: 'fowler', face: 'calm', listen: { red: 'calm' }, text: 'And your grandmother? Out there on her own, with the wood the way it’s been. I hear things at night, girl. At the edge of the trees. Too heavy for a fox.' },
  { who: 'red', face: 'calm', text: 'She’s well. She gave me her cloak.' },
  { who: 'fowler', face: 'concerned', listen: { red: 'shy' }, text: 'Did she now. Then she’s thinking of you, and not of herself, as usual. Tell her Fowler said she’s a stubborn old woman, and that he said it kindly.' },
];
const letIn = where => [
  { who: 'fowler', face: 'calm', listen: { red: 'shy' }, text: 'Well, don’t stand in the lane like a heron. In you come.' },
  { who: 'fowler', face: 'smile', listen: { red: 'shy' }, text: ({ nets: 'The boy’s at the nets, yonder, pretending to mend them.', coop: 'The boy’s round by the hens, pretending to be busy.', pond: 'The boy’s down by the pond, pretending he hasn’t seen you.' })[where] || 'The boy’s about somewhere. Pretending he hasn’t seen you.' },
  { who: 'fowler', face: 'calm', listen: { red: 'smile' }, text: 'Go on. He’s been looking up the lane since he heard the gate.' },
];
// (the first talk with Peter: shy, his net; then the linnets, Tom in the duck pond, and sitting by the nets)
const peterFirst = () => [
  { who: 'peter', face: 'smile', listen: { red: 'shy' }, text: 'Red.' },
  { who: 'red', face: 'shy', thought: true, text: 'He’s smiling. And now he’s looking at his net, as if it might help.' },
  { who: 'red', face: 'shy', text: 'Hello, Peter.' },
  { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Grandad said you’d been to your grandmother’s. In the new cloak. He saw you go by the meadow.' },
  { who: 'red', face: 'smile', text: 'Your grandad sees everything.' },
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'He sees the wood. Everything else he hears from the hens.' },
  { who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'Linnets in the meadow this morning, a whole charm of them. I had the net over them, and then I let them go. Some days I just like to watch.' },
  { who: 'red', face: 'smile', text: 'A fowler who lets the birds go.' },
  { who: 'peter', face: 'smile', listen: { red: 'cheeky' }, text: 'Don’t tell Grandad. Tom knows, and Tom’s told everyone. “Peter Piper picked a peck.” Every time. Every single time.' },
  { who: 'red', face: 'cheeky', text: 'Did you?' },
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Pick a peck? I picked him up and put him in the duck pond. He went quiet for nearly an hour.' },
  { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'You can sit, if you like. The nets don’t mind being watched.' },
  { who: 'red', face: 'smile', thought: true, text: 'We sit, and he mends a tear with quick, sure fingers, and neither of us says much. It doesn’t need saying.' },
];
const fowlerSends = () => [
  { who: 'fowler', face: 'calm', listen: { red: 'shy' }, text: 'Peter! The pair of you sat like two hens on a perch, and the morning going.' },
  { who: 'fowler', face: 'stern', listen: { red: 'shy' }, text: 'Walk Miss Rose back to the village. As far as the meadow gate, mind, and then straight back: those nets won’t mend themselves.' },
  { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Yes, Grandad.' },
];
const walkWithPeter = () => [
  { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'He likes you, you know. Grandad. He doesn’t tell people to tell people things unless he likes them.' },
  { who: 'red', face: 'smile', text: 'He called my grandmother stubborn.' },
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'That’s how you know.' },
  { who: 'peter', face: 'calm', listen: { red: 'shy' }, text: 'Red. The old beech, on the path. Where we carved it.' },
  { who: 'red', face: 'shy', text: 'I know where.' },
  { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'There’s a knot in it, at the height of your hand. If you looked in it, now and then. I might leave you something.' },
  { who: 'red', face: 'shy', thought: true, text: 'He went red to his ears. I think I did too.' },
];
// A note in the knot of the beech: the hour.
const peterNote = at => [
  { who: 'red', face: 'surprised', thought: true, text: 'Paper, folded small and tucked into the knot. A little damp at the edges.' },
  { who: 'red', face: 'shy', thought: true, text: '“The beech, at ' + at + '. If you can. P.”' },
];
// Meeting him there (n: how many times before; ctx.owed: she missed the last).
const beechMeeting = (n, ctx) => {
  const owed = ctx.owed ? [{ who: 'peter', face: 'calm', listen: { red: 'shy' }, text: 'You came. I waited, last time. Till the light went.' }, { who: 'red', face: 'shy', text: 'I’m sorry, Peter. I couldn’t.' }, { who: 'peter', face: 'smile', listen: { red: 'shy' }, text: 'You’re here now.' }] : [];
  const talks = [
    [{ who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'You found it, then.' }, { who: 'red', face: 'smile', text: 'You said the knot. I looked in the knot.' },
      { who: 'red', face: 'smile', thought: true, text: 'Our backs against the beech, under the carving, talking about nothing. The afternoon goes by over our heads.' }],
    [{ who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'Do you remember when we carved it? You held the knife wrong and I had to bind your thumb with my handkerchief.' },
      { who: 'red', face: 'cheeky', text: 'I remember you cried more than I did.' }, { who: 'peter', face: 'bashful', text: 'It was a very good handkerchief.' }],
    [{ who: 'peter', face: 'concerned', listen: { red: 'calm' }, text: 'You’re quieter than you were. Not sad. Just… somewhere else, some of the time.' },
      { who: 'red', face: 'shy', thought: true, text: 'He notices everything. That’s the trouble with Peter.' }, { who: 'red', face: 'shy', text: 'I’m right here.' }],
  ];
  return owed.concat(talks[n % talks.length]);
};

// ── The inn (js/inn.js): the afternoon's work, Bess calling it from her chair (js/work.js); Mistress Abney's promise (js/promise.js).
WORK.inn = {
  start: [
    { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'There you are. Pots first, then the tables, then Bess, who’ll tell you she needs nothing. She’s lying.' },
    { who: 'bess', face: 'cheeky', listen: { red: 'smile' }, text: 'I need nothing. I’ll tell you what to do, though. I’m very good at that, sitting down.' },
  ],
  pots: ['Scour them till you can see your face. Then a bit more: Mother can see a smear from the stairs.', 'cheeky'],
  tables: ['Wipe with the grain, not round and round. Round and round just moves it about.', 'calm'],
  fire: ['Two logs, crossed. Not three. Three and it roars, and then it sulks all evening.', 'calm'],
  ale: ['From the second barrel, not the first: the first’s for the gentry. The carrier’s men can’t tell, but Mother can.', 'cheeky'],
  tea: ['Oh, you angel. Sit a minute. No? Mother’s watching, isn’t she. She’s always watching.', 'smile'],
  sweep: ['Into the corners. The corners are where the dirt hides, and where Mother looks first.', 'calm'],
  customers: [
    { who: 'red', face: 'surprised', thought: true, text: 'Four of them, stamping in out of the road, smelling of horse and weather.' },
    { who: 'abney', face: 'stern', text: 'Boots on the mat. All of you. I don’t care how far you’ve come.' },
    { who: 'red', face: 'smile', thought: true, text: '“Miss”, and “love”, and once “pet”, from a man old enough to be my grandfather. He gave me a farthing.' },
    { who: 'red', face: 'smile', thought: true, text: 'Nobody asked me for anything I couldn’t do. I didn’t know that could feel restful.' },
  ],
  end: [
    { who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'That’ll do, Miss Rose. You work like your mother: quiet, and properly. I don’t say that to everyone.' },
    { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'She doesn’t say it to me.' },
    { who: 'abney', face: 'stern', text: 'You’re not supposed to be doing anything.' },
  ],
};
const abneyIdle = () => [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. Bess is by the fire, if you’ve come to see her. Don’t let her get up.' }];
// The asking. ctx: { yes() }
const abneyAsks = ctx => [
  { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. A favour, and I don’t ask them lightly.' },
  { who: 'abney', face: 'concerned', listen: { red: 'calm' }, text: 'I’m to the market town tomorrow with the carrier: there’s business there I can’t send anyone to. Bess mustn’t be alone, so near her time. Will you come at six, and sit with her till I’m back? Nine, at the latest.' },
  { choose: [
    { text: 'Of course, Mistress Abney. I’ll be here at six.', face: 'smile', then: [{ run: ctx.yes },
      { who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'Six. I’ll hold you to that, pet. I hold everyone to what they say.' }] },
    { text: 'I can’t tomorrow, Mistress Abney. I’m sorry.', face: 'shy', then: [
      { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Then you can’t, and you’ve said so honestly. I’ll manage. I may ask you another day.' }] },
  ] },
];
// About five that evening: who comes to find her. ctx: { go() }
const TEMPT = {
  tom: [{ who: 'tom', face: 'cheeky', listen: { red: 'surprised' }, text: 'Ridley! The best dare there’s ever been. Tonight, at the bell, Old Halloran’s ram. Don’t ask, it’s better if you see it. Come on!' }],
  agnes: [{ who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: 'Rose! Georgie’s going to read his poem at the pond. To me. In front of everyone. You have to come, I’ll die if you don’t.' }],
  peter: [{ who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Red. Grandad’s gone to bed early, and the linnets are coming in to roost in the meadow. I thought you might like to see. It’s only an hour.' }],
};
const tempted = (who, ctx) => (TEMPT[who] || []).concat([{ choose: [
  { text: 'I can’t. I promised Mistress Abney I’d sit with Bess.', face: 'shy', then: [{ who, face: 'pout', listen: { red: 'shy' }, text: who === 'tom' ? 'A promise. To Mistress Abney. You’ve gone soft, Ridley.' : who === 'agnes' ? 'Oh, you and your promises. I’ll tell you every word.' : 'Then you should keep it. Another time.' }] },
  { text: 'Just for a little while, then.', face: 'cheeky', then: [{ run: ctx.go }] },
] }]);
const temptedAfter = who => [
  { text: who === 'tom' ? 'It is, in the end, a very good dare, and the ram is very angry, and they run until they can’t for laughing.' : who === 'agnes' ? 'The poem is dreadful, and Agnes cries, and Georgie goes the colour of a beetroot, and it’s the best thing that’s happened all year.' : 'The linnets come in over the meadow in their hundreds, and settle, and Peter doesn’t say anything, and neither does she.' },
  { who: 'red', face: 'wince', thought: true, text: 'The light’s going. It must be long past half six. Bess. Oh, no. Bess.' },
];
// The evening by the fire with Bess.
const sitWithBess = () => [
  { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'You came. Mother said you would. She said it the way she says the sun will come up, as if she’d have words with it if it didn’t.' },
  { who: 'red', face: 'smile', text: 'I promised.' },
  { who: 'bess', face: 'calm', listen: { red: 'calm' }, text: 'Sit, then. Not on the stool: in the good chair. Mother isn’t here to see.' },
  { who: 'red', face: 'calm', thought: true, text: 'Bess talks about the babe, and not its father. I talk about the wood, and not other things. The fire does the rest.' },
  { who: 'bess', face: 'concerned', listen: { red: 'shy' }, text: 'You’re different lately. Not worse. Like someone who’s put something down that was heavy.' },
  { who: 'red', face: 'shy', thought: true, text: 'Everyone keeps noticing. I didn’t know it showed.' },
];
const abneyBack = () => [
  { who: 'abney', face: 'smile', listen: { red: 'smile' }, text: 'Still here. Both of you, and the fire in, and nothing burnt. Thank you, Miss Rose. That was a promise kept.' },
  { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Now: it’s past the bell, and I’ll not have William Dunn walking you home like a stray. I’ll walk you myself, and tell your mother why you’re late.' },
];
// Home, walked there by Mistress Abney.
const excusedHome = () => [{ who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Mistress Abney told me. Sat with Bess all evening, and kept your word to the minute. Bed, love. You’ve earned it.' }];
// A promise broken: the next evening, her mother's heard.
const promiseFoundOut = () => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Mistress Abney came by.' },
  { who: 'red', face: 'wince', text: 'Mama…' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'She came home from the market at nine and found Bess on her own by the fire. Near her time. Alone. Because you’d promised, and then you hadn’t come.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Come here, Little Red.' },
];
const promiseCorrection = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.55, pace: 1.4 });
  await S.wait(0.8);
  await S.say(M, 'A promise is the one thing you have that’s entirely yours to keep, Little Red.', 'stern');
  await S.step([M, 'You said yes. Nobody made you. You could have said no, and she’d have asked someone else.'], 8);
  await S.step([R, 'I know, Mama— I meant to—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.8, pace: 1.65 });
  await S.step([M, 'And Bess sat there alone, near her time, waiting for you, watching the door.'], 12);
  await S.step([R, 'I’m sorry! I’m sorry!'], 6);
  await S.gesture('drawers'); await S.wait(0.5);
  S.set({ strength: 1.95, pace: 1.85 });
  await S.step([M, 'When you give your word, you keep it. Even when something better comes along. Especially then.'], 12);
  await S.smacks(8);
  await S.say(M, 'There. It’s done. Tomorrow you go to the Wheatsheaf, and you say sorry to them both.', 'calm');
  await S.wait(1.2);
};
const promiseAfter = () => [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'Come here. There. A promise kept is worth more than you know. You’ll learn it.' },
  { who: 'red', face: 'teary', text: 'I’ll go first thing. I will.' },
];

// Mistress Pennock in her bakery, any other time.
const pennockIdle = () => [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Mind the oven, love. And don’t touch the board.' }];
// Her mother, any other time: a word, by the time of day. (part: the calendar's)
// ── Her mother in the day (js/chores.js's marenTalk). An errand still to do: a reminder (late: not too late).
const marenReminds = (e, by, late) => late ? [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'You said you’d see to it: ' + e.title.toLowerCase() + '. You’re late with it, but it’s not too late. Go on.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Don’t forget: ' + e.title.toLowerCase() + ', by ' + by + '.' },
  { who: 'red', face: 'smile', text: 'I won’t, Mama.' },
];
// How it went, an errand with nothing to bring home (ctx.told()): hers to say.
const marenAsks = (e, ctx) => [
  { who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'How did you get on? ' + e.title + '.' },
  { choose: [
    { text: 'Fine, Mama. All done, and in good time.', face: 'smile', then: [{ run: ctx.told }, { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'That’s my girl.' }] },
    { text: 'Done. Tom kept me talking on the way, though.', face: 'cheeky', then: [{ run: ctx.told }, { who: 'mother', face: 'calm', listen: { red: 'cheeky' }, text: 'He would. As long as it got done.' }] },
    { text: 'Done. It was harder than I thought.', face: 'shy', then: [{ run: ctx.told }, { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'Most things worth doing are. I’m glad you saw it through.' }] },
  ] },
];
// Nothing much: a word, as the day is.
const MAREN_CHAT = [
  [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Mistress Thatcher’s hens have stopped laying again. She swears it’s the weather. I swear it’s the fox.' }],
  [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'I’ve the Hallorans’ mending to finish before Sunday. If you see Bo Peep, tell her it’s near done.' }],
  [{ who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Your grandmother sent word she’s well. In her way: a sprig of rosemary on the step, and nobody saw who left it.' }],
  [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'There’s bread on the board if you’re hungry. Cut it straight, mind.' }],
  [{ who: 'mother', face: 'cheeky', listen: { red: 'cheeky' }, text: 'Agnes Thatcher was by. She says Georgie Dunn’s writing her a poem. She says it like it’s a threat.' }],
];
const marenChat = (day, part, ctx) => (ctx.asked ? [] : [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Nobody’s asked anything of us today.' }]).concat(MAREN_CHAT[(day * 3 + ({ morning: 0, afternoon: 1 })[part] || 0) % MAREN_CHAT.length]);
const marenGarden = () => [{ who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'And the garden won’t tend itself, love.' }];
const marenSupper = () => [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Be home for supper, mind. Six o’clock.' }];
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

// ── Before the first herb: her grandmother sees she's lighter (ctx: { tell(), keep() }). Little Red either way; told, glad, and on.
const huldaLighter = ctx => [
  { who: 'gran', face: 'calm', listen: { red: 'shy' }, text: 'Come here, let me look at you.' },
  { who: 'gran', face: 'smile', listen: { red: 'shy' }, text: 'You’re lighter, Little Red. Since the cloak. You walk in like someone’s taken a sack of meal off your back.' },
  { choose: [
    { text: 'Mama and I… when I’m wilful, she takes me in hand. Like when I was little. I asked her to, the night I came home in the cloak.', face: 'shy', then: [{ run: ctx.tell },
      { who: 'gran', face: 'tender', listen: { red: 'shy' }, text: 'Did you, now. Oh, love. I hoped the cloak might do something. I didn’t dare hope for that.' },
      { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Good. Good for the both of you. Everyone should have somewhere to set it all down.' }] },
    { text: 'It’s a good cloak, Grandmother.', face: 'smile', then: [{ run: ctx.keep },
      { who: 'gran', face: 'cheeky', listen: { red: 'smile' }, text: 'It is. And you’re a closed little book, as you always were. Never mind. I’ll read you when you’re ready.' }] },
  ] },
];
// ── Hulda's herb errands (js/herbs.js): asked for at the cabin (n: how many brought before), gathered in the wood, brought back and taught.
const herbAsk = (id, n) => ({
  yarrow: [
    { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Since you’re here, and have young legs: my yarrow’s run out, and Fowler’s forever cutting himself on those nets.' },
    { who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'There’s a stand of it in the meadow, west of the lane. Flat white heads, like a plate of lace, and leaves like little feathers. The heads, a good handful. Leave the roots.' },
    { who: 'red', face: 'smile', text: 'Flat and white, and feathers. I’ll find it.' },
  ],
  sorrel: [
    { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Another errand, if you’ll have it. Wood sorrel, on the bank of the stream. Three leaves, each folded like a heart, and small white flowers with purple veins in them.' },
    { who: 'gran', face: 'cheeky', listen: { red: 'shy' }, text: 'And taste one, when you find it. I want to see your face when you come back.' },
  ],
  comfrey: [
    { who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'One more. Comfrey, by the fallen tree, where the ground stays wet. Big rough leaves, hairy as a goat, and bells of purple hanging under.' },
    { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'The leaves, half a dozen of the best. They prickle: mind your fingers.' },
  ],
})[id].concat(n ? [] : [{ who: 'red', face: 'shy', thought: true, text: 'She hasn’t asked me to fetch for her since I was small. I didn’t know I’d missed it.' }]);
const herbGathered = id => ({
  yarrow: [{ who: 'red', face: 'smile', thought: true, text: 'A whole plate of white, in my hands. It smells like Grandmother’s cupboard. I must have walked past it a hundred times.' }],
  sorrel: [{ who: 'red', face: 'pout', thought: true, text: 'Sour! Sour as a scold. She knew. She’ll laugh at me.' }],
  comfrey: [{ who: 'red', face: 'pout', thought: true, text: 'Ow. They do prickle. Six of the best, as asked.' }],
})[id];
const herbGiven = (id, last) => ({
  yarrow: [
    { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Good girl. Yarrow: soldier’s woundwort, they call it. Bruise a leaf and lay it on a cut, and it stops the bleeding. Dried, in a tea, for a chill.' },
    { who: 'red', face: 'calm', text: 'For Master Fowler’s fingers.' },
    { who: 'gran', face: 'cheeky', listen: { red: 'smile' }, text: 'For anyone’s. But mostly his.' },
  ],
  sorrel: [
    { who: 'gran', face: 'cheeky', listen: { red: 'pout' }, text: 'There. That face. You tasted it.' },
    { who: 'red', face: 'pout', text: 'It’s sourer than a lemon.' },
    { who: 'gran', face: 'smile', listen: { red: 'shy' }, text: 'Cooling, for a fever. A sauce for fish. And, a leaf on the tongue, for knowing you’re awake. Some days that’s the most useful thing in the wood.' },
  ],
  comfrey: [
    { who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'Knitbone. Mash it, bind it on, for a sprain, or a bruise. You’d be surprised what a girl your age comes home with.' },
    { who: 'red', face: 'shy', thought: true, text: 'I don’t think I’d be surprised at all.' },
    { who: 'gran', face: 'smile', listen: { red: 'shy' }, text: 'I keep a pot of it made up. If you ever want some, and would rather not say what for, you only have to ask.' },
  ],
})[id].concat(last ? [
  { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'That’s three, and every one right. You’ve a good eye, Little Red. Your mother had it too, once, before she decided she hadn’t the time.' },
  { who: 'red', face: 'smile', thought: true, text: 'Woundwort, sorrel, knitbone. I’ll know them, now, wherever they grow.' },
] : []);
// The finger-post at the fork.
const signpost = () => [{ who: 'red', face: 'smile', thought: true, text: '“To the Fowlers’.” Peter’s, then: where he lives with his grandad, and the hens, and that duck.' }];
// The walk home, at the gap in the hedge to the Fowlers': not tonight.
const forkShut = () => 'Not that way. I’m late enough already, and Mama will be at the door.';
// ── Her diary's people: how each is with her, by their trust (and whether she's told them what she and her mother have). → { name, text }
const TRUST_WHO = { hulda: 'Grandmother', peter: 'Peter', fowler: 'Master Fowler', tom: 'Tom', smith: 'Master Ferrier', pennock: 'Mistress Pennock', baker: 'Master Pennock', abney: 'Mistress Abney', abneyDaughter: 'Bess', agnes: 'Agnes', georgie: 'Georgie', willie: 'Master William', holt: 'Holt' };
const villagerTrust = (who, t, open) => {
  const n = TRUST_WHO[who] || who;
  const text = who === 'hulda' ? (t >= 3 ? 'Grandmother has no secrets from her, and wants none from her.' : 'Grandmother dotes on her, and is teaching her a little of her craft.')
    : t < 0 ? n + ' is cool with her lately. Something wants mending.'
    : t < 1 ? n + ' knows her to nod to, and not much more.'
    : t < 2 ? n + ' is friendly enough, and glad to see her.'
    : t < 3 ? n + ' likes her, and is coming to rely on her.'
    : n + ' trusts her, and would do a good deal for her.';
  return { name: n, text: text + (open >= 2 ? ' Takes her in hand, as she asked.' : open >= 1 ? ' Knows what she and her mother have.' : ''), trust: t };
};
// Asked on the day, at the counter or the inn door: will she help this afternoon? (ctx.yes())
const shiftOffer = (who, ctx) => who === 'pennock' ? [
  { who: 'pennock', face: 'smile', listen: { red: 'calm' }, text: 'Rose, love. My girl’s still poorly. If you’ve nothing else on, would you help me clear down this afternoon? One o’clock.' },
  { choose: [
    { text: 'I’d be glad to, Mistress Pennock.', face: 'smile', then: [{ run: ctx.yes }, { who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Bless you. One, then, and not a minute after quarter past: the oven won’t wait.' }] },
    { text: 'Not today, I’m sorry.', face: 'shy', then: [{ who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Another day, then.' }] },
  ] },
] : [
  { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. I could use another pair of hands this afternoon, if they’re free. Two o’clock. It’s a quiet day: no carriers.' },
  { choose: [
    { text: 'Yes, Mistress Abney. Two o’clock.', face: 'smile', then: [{ run: ctx.yes }, { who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'Two. Not half past.' }] },
    { text: 'I can’t today, Mistress Abney.', face: 'shy', then: [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Then you can’t. Another time.' }] },
  ] },
];
// A shift let slide past its quarter of an hour's grace: they've managed without her.
const shiftMissed = e => [{ who: 'red', face: 'wince', thought: true, text: e.shift === 'bakery' ? 'Too late. Mistress Pennock will have started without me, and she won’t want me under her feet now.' : 'Too late. Mistress Abney will have managed, and she’ll have something to say about it.' }];
// Out of the door for the eggs with nothing to put them in.
const basketReminder = () => [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Rose! The eggs. In what, your apron? Take a basket off the pegs, love.' }];
// Her mother, as Red goes to the door without what the errand wants (need: 'basket' | 'pot' | 'butt'; holding: what's in her hands instead).
const needReminder = (need, holding) => {
  const hands = holding === 'basket' && need !== 'basket' && need !== 'pie' ? ' Hang that basket up first: you’ve only the two hands.' : holding && holding !== need && !(need === 'pie' && holding === 'basket') ? ' And put that down first.' : '';
  const say = { basket: 'Rose! In what, your apron? Take a basket off the pegs, love.', pot: 'Rose! The pot, for Master Ferrier. It’s on the chest.', butt: 'Rose! You’ll want the little butt to carry it in. By the hearth.', pie: 'Rose! The Dunns’ pie. Take a basket down, and I’ll put it in.' }[need] || 'Rose! You’ve forgotten something.';
  return [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: say + hands }];
};
// Asked again, after the first three (first: where it grows, reminded).
const herbAskAgain = (h, first) => [{ who: 'gran', face: 'smile', listen: { red: 'smile' }, text: first ? 'I’m out of ' + h.name.replace(/^the /, '') + ' again, love. You remember: ' + h.where + '.' : 'Some ' + h.name.replace(/^the /, '') + ' for me today, if you would.' }];
const herbThanks = id => [{ who: 'gran', face: 'smile', listen: { red: 'smile' }, text: ({ yarrow: 'Lovely. That’ll see Fowler’s fingers through another month of nets.', sorrel: 'Good. And you didn’t make a face this time. You’re learning.', comfrey: 'Good girl. Into the pot it goes, for whoever needs it.' })[id] }];
const herbLater = () => [{ who: 'gran', face: 'calm', listen: { red: 'smile' }, text: 'Come again another day, and I’ll find you something else to look for.' }];
const herbWaiting = h => [{ who: 'gran', face: 'cheeky', listen: { red: 'shy' }, text: 'Back already, and empty-handed? ' + h.name[0].toUpperCase() + h.name.slice(1) + ', ' + h.where + '. It won’t pick itself.' }];

// ── 1.3, Into the Wood (js/wood13.js, js/inhand.js): Holt at Hulda's; the stranger at the stream; Willie Winkie's blessing; Peter noticing; and
// the village's three taken up: Tom told, the smith's same standard, Mistress Pennock's trust, Mistress Abney taking her in hand.
// Holt at the cabin, the first time (ctx: { careful(), myself() }).
const holtMeet = ctx => [
  { who: 'gran', face: 'smile', listen: { red: 'surprised' }, text: 'Little Red! Come in, come in. You’ve caught me entertaining.' },
  { who: 'gran', face: 'cheeky', listen: { red: 'shy' }, text: 'This is Holt. He cuts my wood, and mends my roof, and pretends every time he’s only passing.' },
  { who: 'holt', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose.' },
  { who: 'red', face: 'shy', text: 'Good morning, Master Holt.' },
  { who: 'red', face: 'shy', thought: true, text: 'He’s very big, and very quiet. Like a tree that’s decided to sit down for a while.' },
  { who: 'holt', face: 'smile', listen: { red: 'shy' }, text: 'Your grandmother talks of you. More than of the roof, and the roof needs it.' },
  { who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'Holt walks this wood more than anyone living, love. If you’re ever in trouble out there, he’s the one to find.' },
  { who: 'holt', face: 'stern', listen: { red: 'calm' }, text: 'Keep to the path, and I’ll not need finding. There’s been a man about, these last weeks. Not a woodsman: good boots, and no business I can see.' },
  { who: 'holt', face: 'calm', listen: { red: 'shy' }, text: 'If you meet him, you’ve somewhere to be.' },
  { choose: [
    { text: 'I’ll be careful, Master Holt.', face: 'shy', then: [{ run: ctx.careful },
      { who: 'holt', face: 'smile', listen: { red: 'shy' }, text: 'Good lass.' }] },
    { text: 'I can look after myself.', face: 'pout', then: [{ run: ctx.myself },
      { who: 'holt', face: 'calm', listen: { red: 'pout' }, text: 'Most can. Till they can’t.' },
      { who: 'gran', face: 'cheeky', listen: { red: 'pout' }, text: 'She’s her mother’s daughter, Holt. You’ll not win that one.' }] },
  ] },
  { who: 'holt', face: 'calm', listen: { red: 'calm' }, text: 'I’ll be off. There’s an ash down by the stream that won’t split itself. Hulda.' },
  { who: 'gran', face: 'smile', listen: { red: 'calm' }, text: 'Off with you, then. Mind your back.' },
];
const holtGone = () => [
  { who: 'gran', face: 'cheeky', listen: { red: 'shy' }, text: 'Don’t mind his face. It’s the only one he has, and he means well with it.' },
  { who: 'red', face: 'shy', thought: true, text: 'A man in good boots, with no business. I’ll remember.' },
];
// The stranger at the stream (ctx: { cabin(), alone(), rose(), red() }: what she tells him).
const wolfeMeet = ctx => [
  { who: 'wolfe', face: 'smile', listen: { red: 'surprised' }, text: 'Ah. And I’d thought this wood had nothing better in it than squirrels.' },
  { who: 'wolfe', face: 'calm', listen: { red: 'shy' }, text: 'Forgive me. I’ve startled you. I’ve been walking so long on my own I’ve forgotten how to be civil.' },
  { who: 'red', face: 'shy', text: 'You’re not from the village.' },
  { who: 'wolfe', face: 'smile', listen: { red: 'shy' }, text: 'No. I’m not from anywhere much, lately. But you: you walk this path as if it were yours.' },
  { choose: [
    { text: 'My grandmother lives at the end of it.', face: 'smile', then: [{ run: ctx.cabin },
      { who: 'wolfe', face: 'surprised', listen: { red: 'smile' }, text: 'Does she! Out here, on her own? A brave woman.' },
      { choose: [
        { text: 'She likes it on her own.', face: 'smile', then: [{ run: ctx.alone }, { who: 'wolfe', face: 'smile', listen: { red: 'smile' }, text: 'I can understand that. Quiet is a precious thing.' }] },
        { text: 'She has friends enough.', face: 'calm', then: [{ who: 'wolfe', face: 'calm', listen: { red: 'calm' }, text: 'Of course she does. I meant nothing by it.' }] },
      ] }] },
    { text: 'I’m only walking.', face: 'calm', then: [{ who: 'wolfe', face: 'smile', listen: { red: 'calm' }, text: 'Only walking. Then we’ve something in common, you and I.' }] },
  ] },
  { who: 'wolfe', face: 'smile', listen: { red: 'shy' }, text: 'And what do they call you? The girl who walks the path.' },
  { choose: [
    { text: 'Rose.', face: 'calm', then: [{ run: ctx.rose }, { who: 'wolfe', face: 'smile', listen: { red: 'calm' }, text: 'Rose. Of course it is.' }] },
    { text: 'Red. Little Red, my grandmother says.', face: 'shy', then: [{ run: ctx.red }, { who: 'wolfe', face: 'smile', listen: { red: 'shy' }, text: 'Little Red. Yes. That suits you. I shan’t forget it.' }] },
  ] },
  { who: 'wolfe', face: 'calm', listen: { red: 'shy' }, text: 'I won’t keep you. The light goes early under these trees. But I’ll be about, a while. It’s a fine wood. I hope we meet again.' },
];
const wolfeGone = () => [{ who: 'red', face: 'shy', thought: true, text: 'He never said his name. And I never thought to ask it.' }];
// Willie Winkie's blessing: her mother, of an evening after his first catch (ctx: { yes(), no() }).
const willieBlessing = ctx => [
  { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Master William stopped me at the well this morning.' },
  { who: 'red', face: 'wince', text: 'Oh no.' },
  { who: 'mother', face: 'smile', listen: { red: 'wince' }, text: 'Not that. Or, not only that. He says, the next time he finds you out after the bell, and he says he will, he’d as soon see to it himself, here, at our hearth, as hand you over to me like a parcel. If you were willing. And if I was.' },
  { who: 'red', face: 'surprised', text: 'Master William?' },
  { who: 'mother', face: 'calm', listen: { red: 'surprised' }, text: 'He’s a fair man, love. Gruff. But fair. And he asked, which is more than most would. What do you think?' },
  { choose: [
    { text: 'If you trust him, Mama… I think I’d let him.', face: 'shy', then: [{ run: ctx.yes },
      { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'Then I’ll tell him yes. But it’s yours to say, every time. Your name stops him the same as it stops me.' }] },
    { text: 'I’d rather it was only ever you, Mama.', face: 'shy', then: [{ run: ctx.no },
      { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'Then it’s only me, and I’ll tell him so. He’ll understand. He asked so you could say no.' }] },
  ] },
];
// Peter notices she's changed (ctx: { all(), some(), none() }).
const peterNotices = ctx => [
  { who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'You’re different, lately. Not worse. You hold yourself different. As if something’s been settled.' },
  { who: 'red', face: 'shy', thought: true, text: 'He notices everything. That’s the trouble with Peter.' },
  { choose: [
    { text: 'Mama takes me in hand, when I’m wilful. Like when I was small. I asked her to.', face: 'shy', then: [{ run: ctx.all },
      { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Grandad used to, with me. Before I was grown. I missed it, after. I never said, to anyone.' },
      { who: 'peter', face: 'smile', listen: { red: 'shy' }, text: 'Thank you for telling me, Red. I’ll not tell a soul.' }] },
    { text: 'Mama and I have come to an understanding. That’s all.', face: 'calm', then: [{ run: ctx.some },
      { who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'That’s all? All right. I’ll not pry. It suits you, whatever it is.' }] },
    { text: 'I’m just the same, Peter.', face: 'pout', then: [{ run: ctx.none },
      { who: 'peter', face: 'sad', listen: { red: 'pout' }, text: 'If you say so.' },
      { who: 'red', face: 'shy', thought: true, text: 'He didn’t believe me. He was kind enough not to say.' }] },
  ] },
];
// Telling Tom (ctx: { tell(), not() }).
const tomTold = ctx => [
  { who: 'tom', face: 'cheeky', listen: { red: 'calm' }, text: 'You’ve been odd since the pie, Ridley. Odder.' },
  { choose: [
    { text: 'You know how your father deals with you? Mama does that with me. I asked her to.', face: 'shy', then: [{ run: ctx.tell },
      { who: 'tom', face: 'surprised', listen: { red: 'shy' }, text: 'You asked her.' },
      { who: 'tom', face: 'smile', listen: { red: 'shy' }, text: 'Huh. And here’s me thinking I was the only one daft enough. Does it help?' },
      { who: 'red', face: 'shy', text: 'It does.' },
      { who: 'tom', face: 'bashful', listen: { red: 'smile' }, text: 'Yeah. It does, doesn’t it. Tell anyone I said that and I’ll put you in the duck pond.' }] },
    { text: 'Odder? Thank you, Tom.', face: 'cheeky', then: [{ run: ctx.not }, { who: 'tom', face: 'cheeky', listen: { red: 'cheeky' }, text: 'Any time.' }] },
  ] },
];
// Asking the smith for the same standard as Tom (ctx: { ask(), not() }).
const smithAsk = ctx => [
  { who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose. If it’s the lad you want, he’s round the back, hiding from the bellows.' },
  { choose: [
    { text: 'It’s you, Master Ferrier. When Tom and I get into mischief… I’d sooner answer for it the same as he does. To you.', face: 'shy', then: [{ run: ctx.ask },
      { who: 'smith', face: 'surprised', listen: { red: 'shy' }, text: 'Would you, now.' },
      { who: 'smith', face: 'stern', listen: { red: 'shy' }, text: 'You know what you’re asking, lass? Same as my lad: no more, no less. Not for every scrape. For what you do together, when it wants answering.' },
      { who: 'red', face: 'shy', text: 'I know. Tom told me. Mama knows, too, how it is with us.' },
      { who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Then aye. The same standard. And your mother hears it from me, after, every time. Your name stops me dead, and I’ll not ask why.' }] },
    { text: 'Only passing, Master Ferrier.', face: 'calm', then: [{ run: ctx.not }, { who: 'smith', face: 'calm', listen: { red: 'calm' }, text: 'Then pass. Mind the sparks.' }] },
  ] },
];
// After a dare, once he's agreed: he's seen it. Then in his cottage, the two of them.
const smithCaught = kind => [
  { who: 'smith', face: 'stern', listen: { red: 'wince' }, text: kind === 'bell' ? 'The curfew bell, at noon. I heard it from the anvil, and I knew whose hand it was before it stopped.' : 'Master William’s shutter, and Master William’s voice, and the two of you running. I’ve ears, lad.' },
  { who: 'tom', face: 'wince', listen: { red: 'wince' }, text: 'It was only a bit of fun, Dad.' },
  { who: 'smith', face: 'stern', listen: { red: 'shy' }, text: 'Aye, and this’ll be a bit of fun an’ all. Home, the both of you. Same standard, Miss Rose, as you asked.' },
];
const smithIndoors = () => [
  { who: 'smith', face: 'stern', listen: { red: 'shy' }, text: 'Tom first. Rose, you’ll stand there. Then you.' },
  { who: 'red', face: 'shy', text: 'Yes, Master Ferrier.' },
];
const smithTom = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.7, pace: 1.3 });
  await S.wait(0.6);
  await S.say(R, 'Dad, it was one bell—');
  await S.say(M, 'One bell, and a green full of folk thinking it was a fire. Over.', 'stern');
  await S.step([M, 'You’re to be a smith. A smith minds what he strikes and when.'], 10);
  await S.step([R, 'Ow— yes, Dad—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ implement: 'strap', strength: 1.8, pace: 1 });
  await S.say(M, 'Six with the strap.', 'stern');
  await S.smacks(6);
  await S.say(M, 'Corner. Hands on your head.', 'calm');
};
const smithRed = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.5, pace: 1.3 });
  await S.wait(0.6);
  await S.say(M, 'Now you, lass. You asked for the same, and the same it is.', 'calm');
  await S.step([M, 'You’ve a good head on you. It’s no use to anyone if you leave it at home when Tom comes calling.', 'stern'], 10);
  await S.step([R, 'Ow— I know—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.7, pace: 1.5 });
  await S.step([M, 'Next time he dares you, you look at him, and you think of this, and you think of me.'], 10);
  await S.step([R, 'I will, Master Ferrier—'], 4);
  S.set({ implement: 'strap', strength: 1.6, pace: 1 });
  await S.say(M, 'Six, the same as him.', 'stern');
  await S.smacks(6);
  await S.say(M, 'There. Done. Up you get.', 'calm');
  await S.wait(1.0);
};
const smithAfter = r => r && r.rose ? [
  { who: 'smith', face: 'concerned', listen: { red: 'shy' }, text: 'That’s it, then. Done. Sit, lass, till you’re steady. No one minds.' },
] : [
  { who: 'smith', face: 'calm', listen: { red: 'teary' }, text: 'That’s that. Squared, the both of you. Tom, out of the corner and fetch the lass a cup of water.' },
  { who: 'tom', face: 'bashful', listen: { red: 'shy' }, text: 'Told you he was fair.' },
  { who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'I’ll walk up and see your mother tonight. She’ll hear it straight from me.' },
];
// Mistress Pennock, after an afternoon's work, once she trusts her: the key under the pot.
const pennockTrust = () => [
  { who: 'pennock', face: 'calm', listen: { red: 'calm' }, text: 'Rose. Sit down a minute. No, the loaves’ll keep.' },
  { who: 'pennock', face: 'smile', listen: { red: 'shy' }, text: 'You’ve been good to me, these afternoons. The dull half of the work, and never a sulk. And honest with me, when it would have been easier not to be.' },
  { who: 'pennock', face: 'concerned', listen: { red: 'shy' }, text: 'There’s a key to my back door, under the third pot along. If ever you need somewhere, any hour, and don’t want to say why, you let yourself in. There’s always bread.' },
  { who: 'red', face: 'shy', text: 'Mistress Pennock… thank you.' },
  { who: 'pennock', face: 'stern', listen: { red: 'smile' }, text: 'And if you ever need setting straight, you know where I am for that, too. Off you go.' },
];
// Mistress Abney, after an afternoon's work, once she trusts her (ctx: { tell(), not(), broken }).
const abneyOpen = ctx => [
  { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'You’re a good worker, Miss Rose. Better than good. But you’ve something on your mind these days, and it isn’t pots.' },
  { choose: [
    { text: 'Mistress Abney… at home, Mama takes me in hand, when I need it. I asked her to. I’d… I’d like to know where I stand with you, the same way.', face: 'shy', then: [{ run: ctx.tell },
      { who: 'abney', face: 'surprised', listen: { red: 'shy' }, text: 'Would you, pet.' },
      { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: ctx.broken ? 'You know what I mind most. You found that out the night you left my Bess on her own.' : 'You know what I mind most: a word given and not kept. Mischief I can laugh at.' },
      { who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'Then we’ll start as we mean to go on, you and I. Now, before you think better of it. And then you’ll know.' }] },
    { text: 'Only tired, Mistress Abney.', face: 'calm', then: [{ run: ctx.not }, { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Hm. Go on home, then, and rest.' }] },
  ] },
];
const abneyInHand = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.3, pace: 1.3 });
  await S.wait(0.6);
  await S.say(M, 'Over my knee, then. Bess, you’ll keep your remarks to yourself.', 'calm');
  await S.step([M, 'In this house a promise is a promise. Six o’clock means six o’clock.', 'stern'], 8);
  await S.step([R, 'Yes, Mistress Abney—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.5, pace: 1.45 });
  await S.step([M, 'Tom and his dares I’ll laugh at. Pots left half-scoured I’ll sigh at. A word broken, I’ll not have.'], 10);
  await S.step([R, 'Ow— I understand—'], 4);
  S.set({ implement: 'spoon', strength: 1.5, pace: 1 });
  await S.say(M, 'Six with my spoon, so you remember it.', 'stern');
  await S.smacks(6);
  await S.say(M, 'There. Now you know where you stand.', 'calm');
  await S.wait(1.0);
};
const abneyAfter = r => r && r.rose ? [
  { who: 'abney', face: 'concerned', listen: { red: 'shy' }, text: 'Hush, pet. It’s stopped. Sit by Bess, and I’ll fetch you something warm.' },
] : [
  { who: 'abney', face: 'smile', listen: { red: 'teary' }, text: 'That’s that. Now you know, and I know you know. Sit by the fire a minute.' },
  { who: 'bess', face: 'cheeky', listen: { red: 'shy' }, text: 'She’s been wanting to do that to someone for years, you know. You’ve made her day.' },
  { who: 'abney', face: 'stern', listen: { red: 'smile' }, text: 'Bess.' },
];

root.Story = { needReminder, shiftOffer, shiftMissed, herbAskAgain, herbThanks, villagerTrust, marenReminds, marenAsks, marenChat, marenGarden, marenSupper, willieCalls, dayTalk, tomDared, huldaLighter, signpost, forkShut, basketReminder, holtMeet, holtGone, wolfeMeet, wolfeGone, willieBlessing, peterNotices, tomTold, smithAsk, smithCaught, smithIndoors, smithTom, smithRed, smithAfter, pennockTrust, abneyOpen, abneyInHand, abneyAfter, herbAsk, herbGathered, herbGiven, herbLater, herbWaiting, letIn, peterFirst, fowlerSends, abneyIdle, abneyAsks, tempted, temptedAfter, sitWithBess, abneyBack, excusedHome, promiseFoundOut, promiseCorrection, promiseAfter, firstVisit, walkWithPeter, peterNote, beechMeeting, FOWLERS, fowlers, WORK, willieCatch, willieBrings, curfewTalk, curfewCorrection, curfewAfter, reprieve, reportIt, supper, pieDare, pieCaught, pieForge, pieBakery, pieTom, pieRed, pieAfter, pieMotherKnows, pieHome, pieFoundOut, pieMaren, pieMarenAfter, pennockIdle, trodden, gardenFine, gardenAsk, gardenBoots, gardenBelieved, gardenReport, gardenTakeInHand, gardenCorrection, afterGarden, VILLAGE, villager, tomStops, tomCost, homecoming, homecomingCorrection, walkStop, STOPS, ERRANDS, breakfast, enough, maintenanceCorrection, afterMaintenance, GARDEN, broken, afterCorrection, bedtime, chores, marenIdle, lateHome, grandmother, granAgain, WALK, SPOTS };
})(typeof window !== 'undefined' ? window : globalThis);
