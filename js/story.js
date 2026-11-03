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
  { who: 'gran', face: 'tender', listen: { red: 'shy' }, text: 'And Little Red. Come back and see me. Soon. Whenever it all sits too heavy, or for no reason at all. The kettle’s always on, and I’ll always be glad.' },
  { who: 'red', face: 'shy', listen: { gran: 'tender' }, text: 'I will, Grandmother.' },
  { who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'Now. The light’s going, and your mother will skin us both if you’re late. Straight home, mind. Stay on the path.' },
  { who: 'red', face: 'cheeky', text: 'Straight home. On the path.' },
  { who: 'gran', face: 'cheeky', listen: { red: 'smile' }, text: 'I’ve heard that before. Off you go, Little Red.' },
  { run: ctx.seeOff },
];
// If she talks to her grandmother again before she goes.
// A slice of her cake, at her table, once a day.
const granCake = () => [
  { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Sit. There’s a slice with your name on it, and I’ll not have it go stale.' },
  { who: 'red', face: 'smile', thought: true, text: 'Honey cake, still a little warm. The kettle singing. Nobody wanting anything of me.' },
  { who: 'gran', face: 'cheeky', listen: { red: 'smile' }, text: 'There. Some colour in your cheeks. You came in looking like a wet week.' },
];
// A social call (js/herbs.js's call): her greeting (since: days since Red was last up; knows: she's told her what she and her mother have),
// and then, help or visit? (ctx.help(), ctx.visit())
const granCall = (since, knows, ctx) => [
  { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: since >= 5 ? 'Well! I’d begun to think the wood had swallowed you. Come here and let me look at you.' : since >= 2 ? 'There she is. A few days, and you look taller. Come in, come in.' : 'Back again so soon? Not that I’m complaining. Shut the door, love, the draught.' },
  { who: 'gran', face: knows ? 'cheeky' : 'calm', listen: { red: 'shy' }, text: knows ? 'And sitting down without wincing, I see. Your mother’s going easy on you, or you’re being good. I know which I’d wager on.' : 'You look well. Something’s agreeing with you, down in that village.' },
  { who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'Now. Are you here to make yourself useful, or just to sit with an old woman?' },
  { choose: [
    { text: 'To help, Grandmother. Is there anything you need?', face: 'smile', then: [{ run: ctx.help }] },
    { text: 'Just to visit, if that’s all right.', face: 'shy', then: [{ run: ctx.visit }, { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'All right? It’s the best thing anyone’s said to me all week. Sit. I’ll put the kettle on.' }] },
  ] },
];
// Tea at her grandmother's: the village's news, as Red tells it (items: from js/herbs.js's news; knows: she can say what she and her mother
// have, and the rest that goes with it).
const granTea = (items, knows) => {
  const G = (face, text, red) => ({ who: 'gran', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, listen: { gran: 'calm' }, text }), out = [];
  out.push({ text: 'The kettle sings. Two cups, the good ones, and the honey jar her grandmother says is for visitors.' });
  const said = {
    fair: [R('smile', 'The fair’s coming, Grandmother. Mama’s making me a new dress for it.'), G('smile', 'Is she, now. Then you’ll be the prettiest thing on the green, and I’ll come down to see it.', 'smile')],
    fairDone: [R('smile', 'The fair was wonderful. I danced till my feet hurt.'), G('smile', 'So I heard. Your mother says you hardly sat down all day.', 'smile')],
    agnes: [R('cheeky', 'Agnes Thatcher and Georgie Dunn are walking out. Properly.'), G('smile', 'About time. That boy’s been mooning at her since he could walk.', 'cheeky')],
    agnesKnows: [R('shy', 'Agnes and Georgie are walking out. And she… keeps him in line. The way Mama does me.'), G('cheeky', 'Does she, now. Good for Agnes. That boy always did need someone to say whoa.', 'shy')],
    peter: [R('bashful', 'I saw Peter Fowler, at the beech.'), G('cheeky', 'Did you. And did Peter Fowler see you? I expect he did.', 'bashful')],
    bell: [R('wince', 'Somebody rang the curfew bell in broad day. Half the green came out.'), G('cheeky', 'Somebody. Hm. Somebody with red hair, I’d wager.', 'wince')],
    bess: [R('calm', 'Bess Abney’s near her time. Mistress Abney won’t let her lift a cup.'), G('calm', 'Quite right. I’ll send down some raspberry leaf. Remind me before you go.')],
  };
  for (const it of items) {
    if (it.startsWith('corrected:')) { const who = ({ pennock: 'Mistress Pennock', abney: 'Mistress Abney', smith: 'Master Ferrier', agnes: 'Agnes', willie: 'Master William' })[it.slice(10)] || 'someone';
      out.push(R('shy', who + ' took me in hand, this week. I’d asked for it, Grandmother. Truly.'), G('tender', 'Did you. Then you’ve more people looking out for you than you know, Little Red. That’s no bad thing.', 'shy')); continue; }
    if (said[it]) out.push(...said[it]);
  }
  out.push(G('smile', 'Well. That’s my news for the week, and better than I’d have had otherwise. Off you go, now, and give your mother my love.', 'smile'));
  return out;
};
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
// Bed, of an evening (js/evening.js): her mother's arm over her, the fire low; Red's thoughts on the day as it went ([face, thought]; 'sleep':
// her mother's eyes close as the next comes up). o: { day (the supper's account of it: errand, garden, herb, peter, dare, noDinner, late), kind
// (tonight's correction, if any), r (how it went) }
const nightThoughts = o => {
  const d = o.day || {}, r = o.r, e = d.errand && ERRANDS[d.errand.id], st = d.errand && d.errand.state, out = [];
  const fairNight = o.kind === 'dress' || /^fair/.test(o.kind || '');
  if (o.kind === 'fairClean') out.push(['smile', 'Not a mark on it, all day. She looked at me like I was the fair.']);
  else if (o.kind === 'fairOwned') out.push(['calm', 'A mark on the hem, and I told her, and she just said thank you. We’ll mend it in the morning.']);
  if (fairNight) out.push(['smile', 'The fiddle going, and the lanterns, and everyone out on the green.'], ['wince', 'And Agnes’s face, when Georgie ran. In front of everyone. I keep seeing it.']);
  if (o.kind === 'kept') out.push(['smile', 'Bess asleep in her chair before the carrier came, and her mother’s face when she saw her. Better than well, she said.'], ['calm', 'A promise kept. It feels like something I made with my hands.']);      // (home after sitting with Bess: nothing to be set right for)
  else if (o.kind && !/^fair/.test(o.kind)) {
    out.push(r && r.rose ? ['shy', 'I said my name, and she stopped. Straight away, the way she promised.']
      : r && (r.tooHarsh || r.peak >= 1) ? ['teary', 'It still stings. But she held me after till I’d cried it all out, and that’s the bit I’ll remember.']
      : ['shy', 'It still stings. Less than it did.']);
    out.push({ maintenance: ['calm', 'Three things, and I let every one of them slide. Tomorrow I won’t. I’ll do them first, before anything.'],
      curfew: ['calm', 'Nine o’clock. The bell’s at ten, but mine’s at nine. I’ll remember.'],
      pie: ['pout', 'Tom Ferrier never gets caught. I always do. Maybe that’s the lesson.'],
      promise: ['shy', 'Bess, by the fire, watching the door for me. I’ll go first thing and say sorry.'],
      wood: ['shy', 'The path in the half dark, and every root a hand. Out before dusk. She’s right.'],
      dress: ['shy', 'Tomorrow we’ll wash it, she said. Together. Dresses can be mended.'],
      fairClean: ['smile', 'Not a mark on it, all day. She looked at me like I was the fair.'],
      fairOwned: ['calm', 'A mark on the hem, and I told her, and she just said thank you. We’ll mend it in the morning.'],
      garden: ['shy', 'Her flowers. I’ll mind the paths.'], loaf: ['cheeky', 'The ducks, though. Peter laughing at the brown one. I can’t be sorry about all of it.'] }[o.kind] || ['calm', 'It’s done with, anyway. She said so.']);
  } else if (/^fair/.test(o.kind || '')) { /* (the fair's own, above) */ } else if ((!e || st === 'done' || st === 'carrying') && d.garden !== false && !d.noDinner && !d.dare && !d.late) out.push(['smile', 'She said she was proud of me. She meant it, too: I could tell.']);
  else if (e && st === 'broken') out.push(['shy', 'I let ' + e.it + ' slide. She didn’t say much. That’s almost worse.']);
  else out.push(['calm', 'Not my best day. Not my worst, either.']);
  if (d.herb) out.push(['smile', d.herb.name.charAt(0).toUpperCase() + d.herb.name.slice(1) + '. I’ll remember what Grandmother said about it, I will.']);
  if (d.peter) out.push(['shy', 'Peter, at the beech. I wonder if he’ll be there tomorrow.']);
  out.push(['calm', 'Her arm’s heavy over me, and the fire’s just embers.'], 'sleep', ['smile', o.kind && o.kind !== 'kept' ? 'I’ll be good tomorrow. Probably.' : 'Tomorrow, then.']);
  return out;
};

// Phase 1.2, the morning after: what's hers to do, agreed between them, nothing too grown. Mary's garden, small errands, and home by the curfew bell.
const chores = () => [
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Morning, Little Red. Sleep?' },
  { who: 'red', face: 'shy', text: 'Like a stone.' },
  { who: 'mother', face: 'calm', text: 'Good. Now, what we said last night. The Hallorans’ fields and the mending can go back to being mine. But you’ll not sit idle either.' },
  { who: 'mother', face: 'calm', text: 'The garden, every day: the weeds, wherever they’ve come up, and the vegetables seen to. That one’s yours.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'And my flowers watered. Watered, mind, and nothing else. Keep to the paths between the rows.' },
  { who: 'red', face: 'cheeky', text: 'Silver bells and cockle shells…' },
  { who: 'mother', face: 'smile', listen: { red: 'cheeky' }, text: 'And pretty maids all in a row. In a row, Little Red. Not trodden flat.' },
  { who: 'mother', face: 'calm', text: 'And when somebody wants something of us, I’ll tell you over breakfast what’s yours to do, and by when. You needn’t weigh it up. That’s mine to do now.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Done, or at least begun, by the time I give you. Let it slide, and you’ll hear about it.' },
  { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'I’ll be up at the Hallorans’ most days, it being planting time. Home for dinner at half past twelve, and so will you be.' },
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
    it: 'the water', todo: 'fill the little butt at the well', did: 'filled the little butt at the well',
    ask: 'The big butt’s low, and I’ll want water for the washing. Take the little one down to the well this morning, love, and fill it. Three pails does it.',
    there: [{ who: 'red', face: 'calm', thought: true, text: 'Down into the dark, and up again, heavy and slopping. My arms will know about this tomorrow.' },
      { who: 'red', face: 'calm', thought: true, text: 'Half the village has been at the well before me. I can tell by the wet on the stones.' }],
    back: { who: 'mother', face: 'smile', text: 'That’s the washing seen to. Thank you, love.' } },
  bread: { title: 'Bread from the bakery', by: '11:00', place: 'bakery', action: 'Ask for Mama’s loaves', needs: 'basket', carry: 'basket', carryName: 'the loaves', home: true, mins: 15, who: 'baker',
    it: 'the loaves', todo: 'fetch the loaves from the bakery', did: 'fetched the loaves from Master Pennock',
    ask: 'Master Pennock’s keeping two loaves back for us. Fetch them before he sells them out from under us.',
    met: [{ who: 'baker', face: 'smile', listen: { red: 'smile' }, text: 'Two of the best, Miss Rose, and warm through. You tell your mother they’re the best of the batch.' },
      { who: 'red', face: 'smile', thought: true, text: 'He says that every time. They smell like every morning I can remember.' }],
    there: [{ who: 'red', face: 'smile', thought: true, text: 'Warm through the cloth. “The best of the batch,” he says. He says it every time.' },
      { who: 'red', face: 'smile', thought: true, text: 'They smell like every morning I can remember.' }],
    back: { who: 'mother', face: 'smile', text: 'Still warm. He does look after us.' } },
  pot: { title: 'A pot to the forge for mending', by: '12:00', place: 'forge', action: 'Leave the pot with the smith', needs: 'pot', leave: 'pot', mins: 15, who: 'smith',
    it: 'the pot', todo: 'take the pot down to the forge', did: 'took the pot down to Master Ferrier',
    ask: 'The big pot’s sprung its handle again. It’s on the hearth: take it down to the forge before noon. Master Ferrier said he’d see to it.',
    met: [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Handle again? Leave it by the anvil. Tell your mother tomorrow.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'Eleven words. That’s a speech, for Master Ferrier.' }],
    there: [{ who: 'red', face: 'calm', thought: true, text: 'All heat and ringing in there. He nodded without stopping. That means yes.' },
      { who: 'red', face: 'cheeky', thought: true, text: 'Tom’s nowhere about. Which means Tom’s somewhere he shouldn’t be.' }] },
  potback: { title: 'The pot back from the forge', by: '17:00', place: 'forge', action: 'Ask Master Ferrier for Mama’s pot', needs: 'basket', carry: 'basket', carryName: 'the pot', home: true, mins: 10, who: 'smith',
    it: 'the pot', todo: 'fetch the pot back from the forge', did: 'fetched the pot back from Master Ferrier',
    ask: 'That pot’s been sat at the forge three days, and Master Ferrier with no room to turn round. Fetch it home today, love: your basket, and mind, it’s heavy.',
    met: [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Your mother’s pot. Handle’s riveted. It’ll outlast the both of us.' },
      { who: 'red', face: 'smile', thought: true, text: 'Heavier than when it went. Or I’m tireder.' }],
    there: [{ who: 'red', face: 'calm', thought: true, text: 'By the anvil, where he said. Riveted, and the handle stands up on its own.' }],
    back: { who: 'mother', face: 'smile', text: 'There it is. On the hearth with it, love. Thank you.' } },
  jug: { title: 'A jug from the inn', by: '17:00', place: 'inn', action: 'Ask for Mama’s jug', needs: 'basket', carry: 'basket', carryName: 'the jug', home: true, mins: 15, who: 'abney',
    it: 'the jug', todo: 'fetch the jug from the inn', did: 'fetched the jug from Mistress Abney',
    ask: 'Mistress Abney’s promised me a jug of her small beer for supper. Go along for it this afternoon, and take your basket.',
    met: [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Your mother’s jug. There. And how is she? And how are you, Miss Rose?' },
      { who: 'red', face: 'calm', text: 'Well, thank you, Mistress Abney.' },
      { who: 'red', face: 'shy', thought: true, text: 'She always looks as if she knows something I haven’t said yet.' }],
    there: [{ who: 'red', face: 'shy', thought: true, text: 'She looked at me a little longer than the question needed.' },
      { who: 'red', face: 'shy', thought: true, text: 'She always looks as if she knows something I haven’t said yet.' }],
    back: { who: 'mother', face: 'calm', text: 'On the table, love. Was she well?' } },
  dunns: { title: 'A basket for the Dunns', from: '15:00', by: '20:45', fails: true, place: 'dunns', action: 'Knock at the Dunns’', needs: 'basket', pie: true, mins: 10, who: 'willie',
    it: 'the pie', todo: 'take the pie to the Dunns', did: 'took the pie to Master William',
    ask: 'I’ve a pie for the Dunns: Master William’s been on his rounds all week. Take it over in your basket. Not before three, mind: he sleeps the day, poor man. And before he goes out to the bell, or it’ll sit on the step all night for the cats.',
    mind: 'After three, mind, and before he’s out to the bell.',
    early: [{ who: 'red', face: 'shy', thought: true, text: 'Nothing. The shutters are still closed upstairs: he’s asleep. Not before three, Mama said.' }],
    gone: [{ who: 'red', face: 'wince', thought: true, text: 'Nobody. He’s gone out to the bell already, and Georgie’s not back. I left it too late.' }],
    met: [{ who: 'willie', face: 'stern', listen: { red: 'shy' }, text: 'If that’s young Ferrier at his knocking again, I’ll— oh. Miss Rose.' },
      { who: 'red', face: 'smile', listen: { willie: 'calm' }, text: 'Only me, Master William. Mama sent a pie. For all your nights on the rounds.' },
      { give: 'pie' },      // (played: the pie out of her basket and into his hands)
      { who: 'willie', face: 'smile', listen: { red: 'smile' }, text: 'A pie?' },
      { who: 'willie', face: 'smile', listen: { red: 'smile' }, text: 'Your mother’s a saint, Miss Rose. Tell her so from me.' },
      { who: 'red', face: 'cheeky', listen: { willie: 'smile' }, text: 'Georgie will want half of it.' },
      { who: 'willie', face: 'calm', listen: { red: 'smile' }, text: 'Georgie can want. Off you go, now. Some of us have a night’s walking ahead.' }],
    after: [{ who: 'red', face: 'smile', thought: true, text: 'Georgie and I used to play under that window, and he would lean out and pretend to growl at us.' }],
    there: [{ who: 'red', face: 'calm', thought: true, text: 'Master William took the pie at the door, half asleep, and called Mama a saint.' }] },
  bakery: { title: 'Help at the bakery', by: '13:00', place: 'bakery', action: 'Go in to help Mistress Pennock', mins: 170, who: 'pennock', trust: 'pennock', quest: 'pennock.helps', shift: 'bakery',      // (played inside: js/work.js)
    it: 'Mistress Pennock’s clearing down', todo: 'help at the bakery', did: 'did Mistress Pennock’s clearing down',
    ask: 'Mistress Pennock has the mill run to do this afternoon, and Master Pennock’s abed, so there’s nobody for the clearing down. You’re to do it for her. She’ll give you the list at one.',
    met: [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Rose, love, you’re an angel. Sleeves up, apron on. It’s all the dull half of baking, I’m afraid.' }],
    there: [{ who: 'red', face: 'smile', thought: true, text: 'Flour to my elbows, and Mistress Pennock talking the whole afternoon, about everything and everyone.' }] },
  inn: { title: 'Work at the inn', by: '16:00', place: 'inn', action: 'Go in to work for Mistress Abney', mins: 180, who: 'abney', trust: 'abney', quest: 'abney.work', shift: 'inn',      // (played inside: js/work.js)
    it: 'the inn', todo: 'help Bess at the inn', did: 'worked the evening at the inn',
    ask: 'Mistress Abney’s off to Ashby this evening, and the carrier’s due, so you’re to help Bess at the inn. She’s not to be on her feet. Be there by four. It’ll be a long one: straight home after, mind.',
    there: [{ who: 'red', face: 'calm', thought: true, text: 'Ale and stew for the carrier’s men, and Bess directing it all from her chair.' }] },      // (played inside: these only if it can't be)
  eggs: { title: 'Eggs from the Fowlers’', by: '12:00', place: 'door', area: 'holding', action: 'Ask Master Fowler for the eggs', carry: 'basket', carryName: 'the eggs', needs: 'basket', home: true, mins: 20, who: 'fowler', trust: 'fowler',
    it: 'the eggs', todo: 'fetch the eggs from the Fowlers’', did: 'fetched the eggs from the Fowlers’',
    ask: 'Master Fowler’s hens are laying like they’re paid for it, and he’s promised me a dozen. Walk over to the Fowlers’ for them this morning, and take your basket.',
    met: [{ who: 'fowler', face: 'calm', listen: { red: 'calm' }, text: 'A dozen, and two over for your mother’s trouble. Mind them on the stile, girl.' },
      { who: 'red', face: 'smile', thought: true, text: 'Still warm, some of them. The hens look very pleased with themselves.' }],
    there: [{ who: 'red', face: 'smile', thought: true, text: 'A dozen and two over, waiting under a cloth by the door.' }],
    back: { who: 'mother', face: 'smile', text: 'Fourteen! He does spoil us. How was Master Fowler? And Peter?' } },
};
// Over breakfast: her mother's word for the day, and what's Red's to do. errand: one of ERRANDS, or null (nothing wanted: the day's her own).
// ctx: { temper ('wilful' | 'mischievous' | 'naughty' | null: what she's most known for lately), byText, garden, rained, yes() (run as she's given it) }.
// The fair's fortnight (js/fair.js), as her mother says it at breakfast, in place of where she'll be: the planting's last day; the week of the
// dress (its first session, the others, the days between, the fitting); and the day itself.
const fairBreakfast = kind => ({
  last: 'Last of the beans in today, up at the Hallorans’, and then that’s the planting done for the year. I’ll be home for dinner.',
  lay: 'It’s Lay day, and the planting’s in. A week tomorrow, near enough, it’s the fair.',
  first: 'No Hallorans’ for me this week: the planting’s in. And I’ve a length of blue cloth I’ve been keeping back, since before your father… well. You’re to have a new dress for the fair. I’m at it this morning, so keep out from under my feet.',
  session: 'The dress again this morning. No peeking over my shoulder: you’ll see it when it’s done.',
  rest: 'No needle today: my eyes want a rest. I’ll be about the house, and in and out of the garden.',
  fitting: 'The dress this afternoon, and I want you home at four to try it on, so I can pin the hem. Four, Little Red. Not ten past.',
  mend: 'The dress, this morning, you and I: a wash, and the hem seen to, and it’ll be as good as it was. Then the day’s your own.',
  fair: 'Fair day! I’m down on the green with the flowers from first thing, and your grandmother’s coming in with her remedies, beside me. No garden, no errand. But there’ll be plenty wanting fetching, and I’ll want you when I call. And you’re in your new dress, so mind it.',
})[kind] || null;
// The fair, told her: the morning the planting's done (a Baking day), and the fair a week today. How it's been, being Little Red; whether
// she'll go as Little Red or as Rose; and the new dress.
const fairAnnounce = () => [
  { who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'And one more thing, before you’re off. A week today, it’s the fair.' },
  { who: 'red', face: 'surprised', listen: { mother: 'smile' }, text: 'The fair! Already?' },
  { who: 'mother', face: 'calm', listen: { red: 'smile' }, text: 'Already. The beans are in, and the green will be all stalls and ribbons by next Baking day.' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'It’s set me thinking. How has it been, love? Being Little Red. The truth, now.' },
  { who: 'red', face: 'shy', listen: { mother: 'tender' }, text: 'Lighter, Mama. I didn’t think it would be. Happier.' },
  { who: 'red', face: 'bashful', listen: { mother: 'smile' }, text: 'Even on the days I can’t sit down without remembering why. Maybe more, those days.' },
  { who: 'mother', face: 'smile', listen: { red: 'bashful' }, text: 'I’d noticed. You laugh more. You sleep, too.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'And at the fair? Will you go as Little Red, do you think, or as Rose?' },
  { who: 'red', face: 'shy', listen: { mother: 'calm' }, text: 'I don’t know yet, Mama. I keep changing my mind.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Then you’ve a week to know it. And whichever she is, she’ll have a fine new dress for it. I’ve had the cloth put by since winter.' },
  { who: 'red', face: 'smile', listen: { mother: 'smile' }, text: 'A new dress? Oh, Mama. Thank you!' },
  { who: 'mother', face: 'cheeky', listen: { red: 'smile' }, text: 'Thank me by standing still for the pins. Go on, now.' },
];
// The fitting (js/fair.js): her mother calls her over (late: she's kept her waiting), and into the dress, stood in the middle of the room, her
// mother down at the hem with her pins.
// Bess, after Red's had her dress fitted: her own new frock, as a girl, and the hearth. Hers, told as hers: not a warning.
const bessFrock = () => [
  { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'You’ve a look about you. Don’t tell me: your mother’s made you something for the fair.' },
  { who: 'red', face: 'smile', text: 'Blue. She kept the cloth back for years. She pinned the hem this afternoon.' },
  { who: 'bess', face: 'wistful', listen: { red: 'calm' }, text: 'I had a new frock once, for the Whitsun dancing. Yellow, with a sash. I was nine. Mother sewed it a fortnight of evenings.' },
  { who: 'bess', face: 'cheeky', listen: { red: 'smile' }, text: 'And the night before, I put it on to see, and sat down by that hearth there in it, close as you like, to warm my toes. Cinders all down the front, and the hem singed.' },
  { who: 'red', face: 'wince', text: 'Oh, Bess.' },
  { who: 'bess', face: 'smile', listen: { red: 'shy' }, text: 'Oh, Bess, indeed. Mother found me picking the cinders out with a pin, crying. I couldn’t sit down at the dancing either, and that wasn’t the cinders.' },
  { who: 'bess', face: 'calm', listen: { red: 'smile' }, text: 'She let the hem down, after, and nobody knew but us. I wore it two more summers.' },
];
const fittingCall = late => late ? [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Four o’clock, I said. I’ve sat here with it in my lap for the best part of an hour.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mama. I lost the time.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Well, you’re here. Come on, then. Arms up.' },
] : [
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'There you are, and on the hour. Come here, then. Arms up, and mind the pins.' },
];
const fitting = late => [
  { who: 'red', face: 'smile', thought: true, text: 'It’s blue. Forget-me-not blue, and soft, and it smells of the cupboard she kept the cloth in.' },
  { who: 'mother', face: 'calm', listen: { red: 'smile' }, text: 'Stand still. Turn. A bit more. Stand still, I said, I’ve pins in my mouth.' },
  { who: 'red', face: 'smile', listen: { mother: 'calm' }, text: 'Mama, it’s beautiful.' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'It’s a dress. It’ll be beautiful when the hem’s straight.' },
  { who: 'mother', face: 'wistful', listen: { red: 'shy' }, text: 'The first new thing you’ve had in, oh, years. I should have done it sooner.' },
  { who: 'red', face: 'shy', text: 'I didn’t need anything.' },
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Need’s got nothing to do with it.' },
].concat(late ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'I’ll be at the hem by candlelight now, to have it ready. Next time I say four, it’s four.' }] : [],
  [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'There. It’ll be ready for the morning. Off with it, carefully, before you breathe on it.' },
   { who: 'red', face: 'smile', thought: true, text: 'Tomorrow. The fair, and the dress. Don’t spoil it, Rose.' }]);
const breakfast = (errand, ctx) => {
  const hello = { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'There. Bowls done, and you fed. Now then.' };
  // (her own day: out at the farm, or needlework at home for the morning or the afternoon (ctx.needle))
  const away = ctx.fair ? ctx.fair : ctx.lay ? 'It’s Lay day, so no Hallorans’ for me, and nothing for you but the garden. I’ll walk up to your grandmother’s this afternoon, and be back by five. Even the fields get a rest.' : ctx.allDay ? 'I’m at the Hallorans’ all day today, and I’ll not be home for dinner: the planting’s behind. There’ll be bread and cheese out on the table, whenever you want it.' : ctx.needle === 'morning' ? 'I’ve needlework this morning, so I’m home till dinner, then up at the Hallorans’ after.' : ctx.needle === 'afternoon' ? 'I’m up at the Hallorans’ this morning, and home with my needlework this afternoon.' : 'I’m up at the Hallorans’ all day, setting the beans. I’ll be home for dinner at half past twelve, and so will you.';
  const mine = ctx.agreed ? [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: away }] : [];
  // (the garden: hers today, or her mother's: ctx.garden 'maren' (she has the time) or 'after' (the day after a correction for it))
  const garden = ctx.garden === 'after' ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Leave the garden to me today. I’ll set my flowers straight myself.' }]
    : ctx.garden === 'maren' ? [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: ctx.fair ? 'And the garden’s mine today: I’ll see to it between times. You needn’t go near it.' : 'And the garden’s mine today: I’ll see to it before I go up. You needn’t go near it.' }]
    : ctx.rained ? [{ who: 'mother', face: 'calm', text: 'It rained in the night, so the flowers won’t want watering. Just the weeds and the beds.' }] : [];
  if (!errand && ctx.lay) return [hello].concat(mine, garden);      // (Lay day: said already)
  if (ctx.fairDay) return [hello].concat(mine);      // (fair day: said already)
  if (!errand) return [hello].concat(mine, garden, [{ who: 'mother', face: 'calm', text: ctx.garden ? 'And nobody’s asked anything of us. The day’s your own.' : 'Nobody’s asked anything of us today. The garden, and then the day’s your own.' }]);
  // (not asked: given. Her yes is how she's been lately: a sulk, a grin, or meek)
  const t = ctx.temper, by = ctx.byText;
  const [face, YES] = { wilful: ['pout', 'Yes, Mama.'], mischievous: ['cheeky', 'Yes, Mama. I’ll be quick. Mostly.'], naughty: ['shy', 'Yes, Mama. I will. Properly.'] }[t] || ['smile', 'Yes, Mama.'];
  // (again: yesterday's, left undone, asked again before anything new)
  const again = ctx.again ? [{ who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Yesterday’s still wants doing. It doesn’t go away because it wasn’t done; it waits. So, again:' }] : [];
  return [hello].concat(mine, garden, again, [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: errand.ask }, { run: ctx.yes },
    { who: 'red', face, text: YES },
    { who: 'mother', face: 'smile', listen: { red: face }, text: (t === 'wilful' ? 'And without the face, next time. ' : 'That’s my girl. ') + (errand.mind || 'By ' + aloud(by) + ', mind.') }]);
};
// The third promise let slide in a week: what her mother says, when Red's home, of what's to come after supper.
const enough = () => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'That’s three times this week, Little Red. Three things I gave you to do, and three times you let them slide.' },
  { who: 'red', face: 'shy', text: 'Mama…' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'This isn’t for any one thing. It’s to set you right, and we’ll see to it tonight, after supper.' },
];
// (a correction owed out of her hearing: raised when she's home, before supper)
// (ago: days since it was earned; not today's, and her mother says when)
const owedRaise = (kind, ago) => kind === 'maintenance' ? enough() : kind === 'wood' ? [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: ago ? (ago === 1 ? 'Yesterday, you were in the wood after dusk, and with the rest of the night it was, it’s not been seen to.' : 'The other evening, you were in the wood after dusk, and it’s not been seen to yet.') + ' Don’t think I’d forgotten.' : 'You were in the wood after dusk. I could see the light going from the step, and no sign of you.' },
  { who: 'red', face: 'shy', text: 'I know, Mama. I meant to be out of it.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Out of the wood before the light goes. That’s been the rule since you could walk. We’ll see to it after supper.' }] : [];
// The maintenance correction: her hand only, not long, the shape of her days put back in place. (js/correction.js runs it: as the homecoming's.)
// ── What her mother holds against her besides (S.held: how naughty, how wilful she's found her lately, short of the week's three that make a
// maintenance correction): not let go with the rest. Any of it, and it's her drawers down for the last of it, if they aren't already; the more
// of it, the longer. Said before the last word, and before any hairbrush: once the brush is out it's the brush to the end.
const marenReckon = async (S, how) => {
  const M = 'corrector', R = 'subject', held = S.held || 0, brush = !!(how && how.willie && !how.brushed);
  if (held < 1 && !brush) return;
  const naughty = (() => { const W_ = root.__world; return W_ && W_.rep ? W_.rep.stat('naughty') >= W_.rep.stat('wilful') : true; })();
  if (S.lap.st.drawers !== 'down') {
    await S.say(M, held >= 1 ? (naughty ? 'And that’s not the half of it, is it. The mischief you’ve been up to lately, one thing after another.' : 'And that’s not the half of it. The answering back, the things let slide, the face you pull when I ask.') : 'And you were brought to my door by the Watchman. That’s not the end of it yet.', 'stern');
    await S.gesture('drawers'); await S.wait(0.5);
    await S.say(R, 'Mama, no— please—');
    await S.say(M, 'Yes. All of it, Little Red, not only tonight’s.', 'stern');
  }
  if (held >= 1) {
    S.set({ strength: 1.8 + Math.min(held, 8) * 0.03, pace: 1.7 });
    const n = 6 + Math.round(Math.min(held, 8) * 2);
    await S.step([M, naughty ? 'You know better. You’ve known better all along, and you’ve done it anyway.' : 'When I tell you a thing, it’s to be done. Not argued, not put off, not forgotten.'], Math.ceil(n / 2));
    await S.step([R, 'I know— ow— I’ll be better, Mama—'], 4);
    await S.step([M, 'You will. This is to help you remember it, the next time.'], Math.floor(n / 2));
  }
};
// ── The close of any of her mother's: what she holds against her besides (marenReckon), what else is owed tonight (how.also), all by hand;
// and then the hairbrush, last of all, never the hand after it: the correction's own (own: { ask, run(S) }), and for being brought home by the
// Watchman (how.willie) a spell of it besides, not counted, before the correction's own. One fetch for both.
const marenClose = async (S, how, own) => {
  const M = 'corrector', R = 'subject';
  await marenReckon(S, how);      // (what else she's holding against her, besides this: js/correction.js's S.held)
  if (how && how.also) await how.also(S);      // (anything else owed tonight, by hand, before the brush)
  const watch = !!(how && how.willie && !how.brushed);
  if (!own && !watch) return;
  if (S.lap.st.drawers !== 'down') { await S.gesture('drawers'); await S.wait(0.5); }
  if (S.lap.st.implement !== 'hairbrush') await S.fetch('hairbrush', {
    ask: own && own.ask ? own.ask : [M, 'Up you get. The hairbrush, from the chest. For Master William’s walk to my door.'],
    waitFace: 'concerned', presentFace: 'stern',
    present: [R, '…Here, Mama.'],
    back: own && own.back ? own.back : [M, 'Back over my knee, Little Red.', 'stern'],
  });
  if (watch) {
    S.set({ strength: 1.85, pace: 1.15 }); await S.wait(0.8);
    await S.say(M, own ? 'These first, and you’ll not count them. For whose lantern brought you home.' : 'You’ll not count these. Just take them, and think about whose lantern brought you home.', 'stern');
    await S.step([R, 'Mama— oh—'], 6);
    await S.step([M, 'Out past the bell, where anything might find you. Home on a Watchman’s arm.'], 6);
    await S.smacks(2);
  }
  if (own) await own.run(S);
};
// ── The week, on Lay day mornings (js/chores.js's weekly): k = { items: [{ d, st, n, why }], score, wilful, naughty, corrected }.
// (what she did, as her mother tells it back: the week's reasons, most weighed first, each once)
const weekWhys = (k, st, max) => { const seen = new Set(); return (k.items || []).filter(e => e.st === st && e.n > 0 && e.why).sort((a, b) => b.n - a.n)
  .filter(e => { const t = e.why.toLowerCase(); if (seen.has(t)) return false; seen.add(t); return true; }).slice(0, max || 3).map(e => e.why.charAt(0).toUpperCase() + e.why.slice(1) + '.'); };
const GIVERS = { maren: 'me', pennock: 'Mistress Pennock', abney: 'Mistress Abney', smith: 'Master Ferrier', willie: 'Master William', hulda: 'your grandmother', agnes: 'Agnes' };
const weekDue = k => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Stay sat a moment, love. It’s Lay day, and we’ll look at the week, you and I.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: k.corrected > 1 ? 'You’ve been taken in hand ' + (k.corrected === 2 ? 'twice' : k.corrected + ' times') + ' since last Lay day, and still it’s been one thing after another.' : 'It’s been one thing after another this week. You know it has.' },
  { who: 'red', face: 'shy', text: '…Yes, Mama.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Then we’ll set you right, this morning, and you’ll start the week clean. All of it, so you know what it was for.' },
];
const weekGood = () => [
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Lay day. And a good week, love: what I asked, done; nothing I’ve had to see to. I noticed. I always notice.' },
  { who: 'red', face: 'smile', text: 'Thank you, Mama.' },
];
const weekFine = k => [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Lay day. Not a bad week, and not the best you’ve had. ' + (k.naughty >= 1 ? 'Mind what’s not yours, this week.' : 'A little less of your own way, this week.') }];
const weekClose = k => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Lay day. I’ll say it plainly: that week came close. Another like it and you know how next Lay day starts.' },
  { who: 'red', face: 'shy', text: 'Yes, Mama. I know.' },
];
// (midweek, at supper, nearing the line)
const weekWarn = k => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: k.due ? 'And I’ll tell you now, so it’s no surprise: Lay day morning, you and I have a reckoning coming. You’ve earned it already.' : 'And mind yourself, the rest of this week. You’re near enough to a Lay day reckoning as it is.' },
  { who: 'red', face: 'shy', text: '…Yes, Mama.' },
];
// The maintenance correction: Lay day morning, the week gone through as it's given, a part of it at each stage: her skirt lifted, for what
// she let slide (the wilful); her drawers down, for what cost someone else (the naughty); and the hairbrush, which she's sent to fetch, for
// the corrections she needed besides and the week as a whole. Each longer than an evening's.
const maintenanceCorrection = async (S, how) => {
  const M = 'corrector', R = 'subject', k = (how && how.week) || { items: [], corrected: 0 };
  const wil = weekWhys(k, 'wilful', 3), nau = weekWhys(k, 'naughty', 3), givers = [...new Set((k.items || []).filter(e => e.st === 'corrected').map(e => GIVERS[e.why] || 'someone'))];
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.45, pace: 1.4 });
  await S.wait(0.8);
  await S.say(M, 'Hands down. There. We’ll take it in order, and you’ll hear every bit of it.', 'calm');
  await S.gesture('skirt'); await S.wait(0.4);
  // (her skirt lifted: what she let slide)
  await S.step([M, 'The shape of your days, first. What I ask, done, and done in time.', 'stern'], 10);
  for (const t of wil.length ? wil : ['What I asked, let slide.']) { await S.step([M, t, 'stern'], 8); await S.smacks(5); }
  await S.step([R, 'I know, Mama— I know—'], 6);
  await S.smacks(8);
  // (her drawers down: what cost somebody else)
  await S.gesture('drawers'); await S.wait(0.5);
  await S.say(R, 'Mama—');
  await S.say(M, 'Yes. ' + (nau.length ? 'Now what cost somebody else.' : 'You’ve kept your hands to what’s yours, this week, mostly. That’s something. But it’s not all.'), 'stern');
  S.set({ strength: 1.75, pace: 1.65 });
  for (const t of nau) { await S.step([M, t, 'stern'], 10); await S.smacks(5); }
  await S.step([R, 'Ow— Mama, I’m sorry—'], 6);
  await S.step([M, 'Sorry’s a start. It’s not the end of it.'], 10);
  await S.smacks(8);
  if (how && how.also) await how.also(S);      // (anything else owed tonight, by hand, before the brush)
  // (the hairbrush, fetched: the corrections that didn't hold, and the week as a whole; the last of it)
  await S.fetch('hairbrush', {
    ask: [M, 'Up you get, Little Red. My hairbrush, from the chest. You know where it is.'],
    waitFace: 'concerned', presentFace: 'stern',
    present: [R, '…Here, Mama.'],
    back: [M, 'Back across my knee. The last of it.', 'stern'],
  });
  S.set({ strength: 1.85, pace: 1.1 }); await S.wait(0.8);
  if (givers.length) await S.step([M, 'Taken in hand by ' + (givers.length > 1 ? givers.slice(0, -1).join(', ') + ' and ' + givers[givers.length - 1] : givers[0]) + ', and it didn’t hold. This is so that it does.', 'stern'], 8);
  await S.step([M, 'It’s not one thing. It’s the week. Letting it run away from you, a day at a time.', 'stern'], 8);
  await S.step([R, 'I’ll be better— I will—'], 4);
  await S.step([M, 'That’s the shape of your days, Little Red. It holds you. Let it.'], 8);
  await S.smacks(4);
  await S.say(M, 'There. That’s done, and you’re set right. A clean week from today. Up you get.', 'calm');
  await S.wait(1.2);
};
const afterMaintenance = () => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Better?' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: '…Better.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Good. Then it’s done with, and tomorrow’s a new one.' },
];
// Her thoughts as she tends the garden (one pair a day, in turn).
const GARDEN = [
  [['calm', 'Weeds, water, and whatever’s ready. Mama’s list, every morning.'], ['smile', 'The beans have come on. Nobody needs me to be clever about beans.']],
  [['calm', 'Silver bells and cockle shells. Grandmother used to sing it at me when I was contrary.'], ['smile', 'I’m still contrary. The garden doesn’t mind.']],
  [['shy', 'There’s a slug on every leaf. I wonder if they have a Mama telling them to be home by nine.'], ['cheeky', 'Probably not. Lucky slugs.']],
  [['calm', 'My hands in the earth, and nobody watching. It’s the quietest hour of the day.'], ['calm', 'Then the day starts asking things of me.']],
];
// Back from a promise let slide: her own thought, when the time's gone by.
const broken = e => [['wince', 'Oh no. I was to ' + e.todo + ', and I never did.']];

// ── The village's people (js/villagers.js): a word with each, by the time of day, and something else when they've already talked today.
// ctx: { part, day, first (never met in the game yet), today (already talked today), errand (her objective, if she's one), curfew, working (Tom,
// at the tub), tomAtTub (for his father: Tom at it now, not off), potDone (her mother's pot left at the forge today) }.
// Most of the village calls her Miss Rose; Agnes and Georgie, who grew up with her, Rose; Tom, Ridley, when he isn't calling her worse.
// (a time as it's said aloud: '11 o’clock', not '11 o’clock in the morning')
const aloud = t => String(t || '').replace(/ (in the (morning|afternoon|evening)|at night)$/, '');
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
      [{ who: 'georgie', face: 'calm', listen: { red: 'calm' }, text: 'Father’s still abed. Up all night walking the lanes, then sleeps through the day like a cat. Mother used to say she married a lantern.' },
        { who: 'red', face: 'smile', text: 'He used to growl at us out of the window.' }, { who: 'georgie', face: 'smile', text: 'He still does. Only now he means it.' }],
      [{ who: 'georgie', face: 'bashful', listen: { red: 'calm' }, text: 'Rose. Does Agnes ever… say anything? About anybody?' },
        { who: 'red', face: 'cheeky', text: 'Agnes says a great deal about everybody, Georgie.' }, { who: 'georgie', face: 'pout', text: 'That’s no help at all.' }],
    ],
    again: [{ who: 'georgie', face: 'smile', text: 'Still here. The green’s not going anywhere, and nor am I.' }],
    lay: [{ who: 'georgie', face: 'bashful', listen: { red: 'calm' }, text: 'No mill today. I don’t know what to do with my hands. Agnes said I could hold hers. She was joking. Was she joking?' },
      { who: 'red', face: 'cheeky', text: 'Ask her, Georgie.' }, { who: 'georgie', face: 'pout', text: 'I can’t ask her that.' }],
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
    lay: [{ who: 'tom', face: 'cheeky', listen: { red: 'smile' }, text: 'Lay day, Ridley! Forge cold, Father asleep in his chair, and the whole day ours.' },
      { who: 'red', face: 'cheeky', text: 'Ours?' }, { who: 'tom', face: 'smile', text: 'Well. Mine. You can borrow some.' }],
  },
  smith: {
    any: [
      [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose.' }, { text: 'He nods, and goes back to his hammer. Master Ferrier was never one for more words than the work needs.' }],
      [{ who: 'smith', face: 'calm', listen: { red: 'calm' }, text: 'If you’re after Tom, he’s at the tub, and he’s staying at the tub.' }],
    ],
    off: [{ who: 'smith', face: 'calm', listen: { red: 'calm' }, text: 'If you’re after Tom, he’s not at the tub today. Off somewhere he oughtn’t be, I don’t doubt.' }],
    after: [{ who: 'smith', face: 'calm', text: 'Your mother’s pot’s as good as new. Better. Tell her not to drop it on the hearthstone again.' }],
  },
  bess: {
    any: [
      [{ who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'There. Isn’t this better than rushing about? I’m not allowed to do anything but sit, and it’s dull without somebody to watch.' }],
      [{ who: 'bess', face: 'calm', listen: { red: 'calm' }, text: 'Mother has me out here so she can see me from every window. As if the babe’s going to come running out on its own.' },
        { who: 'red', face: 'smile', text: 'Would it dare?' }, { who: 'bess', face: 'cheeky', text: 'Not with my mother watching.' }],
      [{ who: 'bess', face: 'calm', listen: { red: 'calm' }, text: 'Everybody in the village comes by this bench sooner or later. You learn a great deal, sitting.' },
        { who: 'red', face: 'shy', text: 'About whom?' }, { who: 'bess', face: 'smile', text: 'Oh, everyone.' }],
    ],
    again: [{ who: 'bess', face: 'smile', text: 'Still here. Still sitting. Still growing.' }],
  },
  abney: {
    first: [{ who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'Miss Rose. Now, you’re a sensible girl. Bess is near her time, and some nights I’ve the carriers in till all hours. Would you sit up with her, one of these nights, if I asked? Just to be there.' },
      { who: 'red', face: 'shy', listen: { abney: 'calm' }, text: 'If you asked, Mistress Abney. I don’t know that I’d know what to do.' },
      { who: 'abney', face: 'smile', listen: { red: 'shy' }, text: 'Nobody does, the first time. Being there’s most of it.' }],
    carrier: [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Carrier’s day. I’ll have the yard full of horses and the house full of men by five, and Bess wanting to wait on them all.' }],
    any: [
      [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose. Your mother keeping well?' }, { who: 'red', face: 'calm', text: 'Yes, Mistress Abney.' },
        { who: 'abney', face: 'calm', text: 'And you?' }, { text: 'She waits for the answer, as if it might be a different one.' }],
      [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Carrier’s late again. If you see a cart on the road from the east gate, tell it I’m not getting any younger.' }],
      [{ who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'Bess. Bess! In the shade, girl, not in the sun.' }, { who: 'bess', face: 'pout', text: 'Yes, Mother.' }],
    ],
  },
  pennock: {
    first: [{ who: 'pennock', face: 'smile', listen: { red: 'shy' }, text: 'Miss Rose! Let me look at you. Twenty, near enough, and still at home with your mother. Have you any prospects, dear? A young man? A trade?' },
      { who: 'red', face: 'shy', listen: { pennock: 'smile' }, text: 'Not… as such, Mistress Pennock.' },
      { who: 'pennock', face: 'smile', listen: { red: 'shy' }, text: 'Well. There’s time. Come and help me of an afternoon, and you’ll have a trade at least.' }],
    baking: [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Baking day, love! Double of everything for tomorrow. Don’t lean on anything, it’s all still warm.' }],
    any: [
      [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Rose, love! Look at you. Growing like a weed, and twice as pretty.' }, { who: 'red', face: 'bashful', text: 'Mistress Pennock…' },
        { who: 'pennock', face: 'smile', text: 'Don’t you “Mistress Pennock” me. I fed you crusts over this counter when you were knee-high.' }],
      [{ who: 'pennock', face: 'calm', listen: { red: 'calm' }, text: 'Somebody’s been at my windowsill pies. I counted six and there were five. I’ll find out, mark me.' },
        { who: 'red', face: 'shy', thought: true, text: 'Tom. It has to be Tom.' }],
      [{ who: 'pennock', face: 'smile', listen: { red: 'calm' }, text: 'Tell your mother I’ve a bit of dripping put by for her. And you’re to eat something besides those berries in the wood.' }],
    ],
  },
  baker: {
    baking: [{ who: 'baker', face: 'smile', listen: { red: 'smile' }, text: 'Baking day, Miss Rose: double of everything, and I’ve been at it since three. Lay day’s bread doesn’t bake itself.' }],
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
    lay: [{ who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Grandad says the birds can keep their own Lay day. So here I am, with nothing to mend.' },
      { who: 'red', face: 'smile', text: 'What will you do with it?' }, { who: 'peter', face: 'bashful', text: 'I hadn’t thought. This, maybe.' }],
    down: [{ who: 'peter', face: 'calm', listen: { red: 'smile' }, text: 'Red! Birds for Mistress Abney, and Grandad wants thread. I’ve an hour, if I’m quick about the thread.' }],
  },
  willie: {
    any: [
      [{ who: 'willie', face: 'stern', listen: { red: 'shy' }, text: 'Miss Rose. The bell’s rung, or near enough. Home with you, now.' }, { who: 'red', face: 'shy', text: 'Yes, Sir.' }],
      [{ who: 'willie', face: 'calm', listen: { red: 'shy' }, text: 'Out late, Miss Rose. Straight home, now. I’ll be round your way within the hour, and I’d sooner not find you.' }, { who: 'red', face: 'shy', text: 'Yes, Sir.' }],
    ],
    early: [{ who: 'willie', face: 'calm', listen: { red: 'calm' }, text: 'Evening, Miss Rose. I’m on my way to the bell. Mind you’re in before it.' }, { who: 'red', face: 'calm', text: 'Yes, Sir.' }],
  },
};
// A word with one of them. (The smith says something else once he's had her mother's pot; Willie's word depends on the bell.)
// The fair's week (js/fair.js): everyone who works is busy getting ready, and says so. (key → a conversation; the first talk of the day)
const FAIR_WEEK = {
  agnes: [{ who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: 'Father’s had me splitting hurdles for the pens since dawn. The whole green’s to be cleared by Fifth day. And I’ve nothing to wear, Rose, nothing.' }, { who: 'red', face: 'smile', text: 'You’ve your green.' }, { who: 'agnes', face: 'pout', text: 'Everyone’s seen my green.' }],
  georgie: [{ who: 'georgie', face: 'calm', listen: { red: 'calm' }, text: 'Miller’s got me grinding for the bakery day and night. Twice the flour, for the fair. My arms have forgotten they were ever arms.' }, { who: 'red', face: 'cheeky', text: 'Will you dance, after?' }, { who: 'georgie', face: 'bashful', text: 'If my arms come back. And if… well. If.' }],
  tom: [{ who: 'tom', face: 'pout', listen: { red: 'cheeky' }, text: 'Every hinge and hook in the village wants seeing to before the stalls go up, and guess who’s on the bellows. No dares this week, Red. I’m too tired to be wicked.' }],
  smith: [{ who: 'smith', face: 'stern', listen: { red: 'shy' }, text: 'Stall hooks. Hurdle pins. A spit for the Wheatsheaf. Fair week.' }],
  bess: [{ who: 'bess', face: 'cheeky', listen: { red: 'smile' }, text: 'Mother’s turned out every room in the house for the visitors and won’t let me lift a duster. I’ve been sat here counting the cobwebs she’s missed. Eleven.' }],
  abney: [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Fair week, Miss Rose. Every bed aired and a brew a day. If you’ve hands free of an afternoon, I’ll find them something.' }],
  pennock: [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Love! Fair week. We’re baking for the whole county and Master Pennock’s asleep on his feet. Gingerbread, Rose. Trays of it. Come and help me sell this morning’s and I’ll love you forever.' }],
  baker: [{ who: 'baker', face: 'calm', listen: { red: 'smile' }, text: 'Up at two, Miss Rose, every night this week. The oven never goes cold. Fair week’s the best week of the year, they tell me. I wouldn’t know: I’m always asleep for it.' }],
  peter: [{ who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Grandad’s got me netting larks for the Wheatsheaf’s pies. For the fair.' }, { who: 'peter', face: 'bashful', text: 'Will you be at the dancing, Red? Only, I thought… I might be.' }],
  willie: [{ who: 'willie', face: 'calm', listen: { red: 'calm' }, text: 'Fair night’s the one night the bell waits till ten, Miss Rose. Doesn’t mean I won’t be about.' }],
};
const villager = (key, ctx) => {
  const V = VILLAGE[key]; if (!V) return [];
  if (key === 'willie') return ctx.curfew ? pickOf(V.any, ctx.day) : V.early;
  if (key === 'tom' && ctx.working) return V.work;
  if (key === 'smith' && ctx.potDone) return V.after;
  if (key === 'pennock' && ctx.pieTaken) { const said = pickOf(V.any.filter(l => !/windowsill/.test(l[0].text)), ctx.day); return ctx.today && V.again ? V.again : said; }      // (after the pie: not that one)
  if (key === 'abney' && ctx.brokenPromise) return [      // (the promise to sit with Bess, broken: until she's said sorry)
    { who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'Miss Rose.' },
    { who: 'red', face: 'wince', thought: true, text: 'Colder than the well. She didn’t even stop what she was doing.' },
    { who: 'red', face: 'wince', text: 'Mistress Abney, I’m sorry. About Bess. I should have come. I said I would, and I didn’t.' },
    { who: 'abney', face: 'calm', listen: { red: 'wince' }, text: 'You should have. She sat there till nine, watching the door.' },
    { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Well. You’ve said it to my face, and that’s something. Don’t make me need you again and find you wanting.' }];
  if (ctx.first && V.first) return V.first;
  if (key === 'georgie' && ctx.part === 'dusk' && V.late) return V.late;
  // (the week: Lay day for the lads; Baking day at the bakery; Carrier's day at the inn; Peter down on an errand)
  if (!ctx.today && ctx.fairWeek && FAIR_WEEK[key]) return FAIR_WEEK[key];      // (the fair's week: getting ready)
  if (!ctx.today && ctx.wd === 7 && V.lay) return V.lay;
  if (!ctx.today && ctx.wd === 6 && V.baking) return V.baking;
  if (!ctx.today && ctx.wd === 4 && V.carrier) return V.carrier;
  if (!ctx.today && key === 'peter' && ctx.wd !== 7 && V.down) return V.down;
  if (ctx.today && V.again) return V.again;
  const said = pickOf(V.any, ctx.day + (ctx.today ? 1 : 0));
  if (key === 'smith' && !ctx.tomAtTub && /at the tub/.test(said.map(l => l.text).join(' '))) return V.off;      // (Tom's day off, or done at the tub: not at it)
  return ctx.errand && V.errand ? said.concat(V.errand) : said;
};

// ── Tom finds her, with something she ought to be doing: he keeps her, while the clock runs (ctx.mins(n): n minutes gone, each beat). She can
// get away early, or stay: then a chat (kind 'chat'), or a dare (the curfew bell, 'bell'; or a knock at the Dunns' door, 'knock').
// ctx: { kind, busy (she has something she ought to be doing), errand, first, mins(n), accept() (the dare taken: hers to do), chatted() }
const tomStops = ctx => {
  const T = (face, text, red) => ({ who: 'tom', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, text }), M = n => ({ run: () => ctx.mins(n) });
  const hello = ctx.first ? T('cheeky', 'Ridley! There she is. Where are you off to with that face on?', 'cheeky') : T('cheeky', 'Ridley! Hold up. Where’s the fire?', 'cheeky');
  const out = ctx.busy ? [R('calm', 'Mama’s given me a thing to do, Tom, and it’s to be done. I can’t stop.'), M(2), T('pout', 'Can’t stop. Listen to her. All right, all right. Off you go, good girl.', 'pout'), R('pout', 'Don’t you “good girl” me, Tom Ferrier.'), T('cheeky', 'Then come back when you’re bad again.', 'pout')]
    : [R('calm', 'Not today, Tom. I’ve done my work and I want my own company for a bit.'), M(2), T('pout', 'Your own company. Dull company, that.', 'calm'), R('cheeky', 'Better than yours.'), T('cheeky', 'Liar. Go on, then. I’ll find you tomorrow.', 'cheeky')];
  const away = (face, text) => ({ text: 'I really must go, Tom.', face: 'shy', then: [M(2), T(face, text, 'shy')] });
  let middle;
  if (ctx.kind === 'chat') middle = TOM_CHATS[(ctx.chats || 0) % TOM_CHATS.length](T, R, M, away, ctx);      // (a different story each time he has one: js/villagers.js counts them)
  else {
    const what = ctx.kind === 'bell' ? 'ring the curfew bell. Now, in broad day. Three strokes, and back here before anyone sees who.'
      : 'knock on the Dunns’ door. Master William’s asleep up there after his round. Three knocks, and back here before the shutter opens.';
    const did = [{ run: ctx.accept }, T('cheeky', ctx.kind === 'bell' ? 'Go on, then. I’ll be watching from here. Three, mind. Not two.' : 'Go on, then. I’ll be watching from the corner. Three knocks, and then run.', 'cheeky')];
    middle = [
      T('cheeky', 'I’ve been waiting all day for somebody worth daring. I dare you to ' + what, 'surprised'), M(3),
      ...(ctx.afterPie ? [R('shy', 'Tom. The last time I took one of your dares, I ended up over Mistress Pennock’s knee. And so did you.'), M(1),
        T('pout', 'This isn’t pies. Nobody’s marching anyone anywhere for this.', 'shy'), R('shy', '…That isn’t how it works, and you know it.'), M(1),
        T('calm', 'Then don’t. I’ll not think less of you. Much.', 'shy')] : []),
      { choose: [
        { text: 'Done.', face: 'cheeky', then: did },
        { text: 'Not today, Tom.', face: 'shy', then: [M(2), T('pout', 'Not today. Coward. I’ll save it for you, then.', 'shy'), R('cheeky', 'Save it as long as you like.')] },
        away('cheeky', 'Coward. Off you go, then. I’ll think of something worse for next time.'),
      ] },
    ];
  }
  return [hello].concat(ctx.fairLine && FAIR_WEEK.tom ? FAIR_WEEK.tom : [], [M(3), { choose: [      // (fairLine: the fair's week, his word on it first, the first time she sees him that day)
    { text: 'I can’t stop, Tom. Truly.', face: 'shy', then: out },
    { text: 'Why? What’s it to you?', face: 'cheeky', then: [M(2)].concat(middle) },
  ] }]);
};
// (his stories, in turn: each its own, and a little more of him in each)
const TOM_CHATS = [
  (T, R, M, away, ctx) => [
    T('calm', 'Father’s in a mood. Some fellow from over the hill brought a plough to mend and wouldn’t pay till it was done, and then wouldn’t pay when it was.'), M(5),
    R('calm', 'What did your father do?'), T('cheeky', 'Held onto the plough. Fellow’s been stood outside the forge since dinner, looking at it.', 'smile'), M(5),
    { choose: [away('pout', 'Go on, then. Spoil my story.'),
      { text: 'And then what?', face: 'smile', then: [M(8), T('smile', 'And then Mistress Pennock came by and told him what she thought of him, and he paid double to make her stop.', 'smile'),
        R('smile', 'She’d frighten anybody.'), M(6), T('calm', 'Not you, though. Nothing frightens you, Ridley.', 'shy'), R('shy', '…Plenty does, Tom.'), M(4),
        T('calm', 'Well. Not me, then. That’s something.', 'shy'), { run: ctx.chatted }] }] },
  ],
  (T, R, M, away, ctx) => [
    T('cheeky', 'Georgie Dunn fell in the millpond this morning. All the way in. Hat and all.', 'surprised'), M(4),
    R('surprised', 'He never did. How?'), T('smile', 'Leaning over to see a pike he swore was there. There wasn’t a pike. There was Georgie, and then there wasn’t.', 'smile'), M(5),
    { choose: [away('pout', 'You’ll miss the best of it. Suit yourself.'),
      { text: 'Did you pull him out?', face: 'smile', then: [M(6), T('calm', 'Course I did. After I’d had a good look. He’d have done the same.', 'smile'),
        R('cheeky', 'He’d have pulled you out straight away, Tom Ferrier.'), M(4), T('shy', 'Aye. He would. Don’t tell him I said so.', 'smile'), R('smile', 'I’ll tell everyone.'), M(3),
        T('cheeky', 'Then I’ll tell them about the bell.', 'wince'), { run: ctx.chatted }] }] },
  ],
  (T, R, M, away, ctx) => [
    T('calm', 'Father let me draw a bar out on my own today. Start to end. Didn’t say a word the whole while.'), M(4),
    R('smile', 'Was it any good?'), T('pout', 'He looked at it a long time. Then he put it in the scrap.', 'shy'), M(5),
    { choose: [away('calm', 'No. Go on. It’s only a bar.'),
      { text: 'Oh, Tom. What did he say?', face: 'shy', then: [M(6), T('calm', '“Again.” That’s all. But he stood by while I did it, and that’s more than he ever did for his other apprentices.', 'calm'),
        R('smile', 'Then he thinks you’re worth the standing by.'), M(4), T('shy', 'Maybe. You’d say that to cheer a dog up, though.', 'smile'), R('cheeky', 'I would not. Dogs don’t need it.'), M(3),
        T('smile', 'Ha. All right. Thanks, Ridley.', 'smile'), { run: ctx.chatted }] }] },
  ],
  (T, R, M, away, ctx) => [
    T('cheeky', 'Guess who’s been sent round every door with the hiring notice for the Hallorans. Me. Every door. Twice, because Mistress Thatcher wasn’t in.', 'pout'), M(4),
    R('cheeky', 'You poor lamb.'), T('pout', 'Laugh. Bess Abney made me read it out to her, all of it, and then asked what half the words meant.', 'smile'), M(5),
    { choose: [away('pout', 'Fine. I’ll tell somebody who cares.'),
      { text: 'And did you know what they meant?', face: 'cheeky', then: [M(6), T('shy', '…Some. I made the others up. She knew, too. She let me.', 'shy'),
        R('smile', 'That’s Bess.'), M(4), T('calm', 'She’s all right, Bess. You’re all right, an’ all.', 'shy'), R('shy', 'Tom.'), M(3),
        T('cheeky', 'Don’t make anything of it.', 'smile'), { run: ctx.chatted }] }] },
  ],
];
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
const gardenFine = tended => [{ who: 'mother', face: 'smile', listen: { red: 'calm' }, text: tended ? 'I went round the garden when I came in. Not a flower out of its row. You’re a good gardener, love, when you put your mind to it.' : 'I went round the garden when I came in. My flowers are standing, at least. Mind the weeds tomorrow.' }];
// Trodden: her mother asks (of an evening, or at dinner: ctx.dinner, after the rest of the morning's told; js/maren.js). ctx.own(), ctx.lie(): run on her answer.
const gardenAsk = (rows, n, ctx) => [
  { who: 'mother', face: ctx.degree === 'wanton' ? 'wince' : 'stern', listen: { red: 'shy' }, text: (ctx.dinner ? 'And I came in past my flowers. ' : 'I went round the garden when I came in. ') + (ctx.degree === 'wanton' ? 'Every bed. Every one, trampled flat, near enough all of them broken off. It looks as if the Thatchers’ goat had a dance in it.' : n > 3 ? 'There’s a whole stretch of ' + mine(rows) + ' trodden flat, broken off and out of their rows.' : 'Some of ' + mine(rows) + ' are trodden down, broken off and out of their rows.') },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Was that you, Little Red?' },
  { choose: [
    { text: 'Yes, Mama. I stepped off the path. I’m sorry.', face: 'shy', then: [{ run: ctx.own }, { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me. That’s worth something. It doesn’t mend my flowers, though.' }] },
    { text: 'No, Mama. It must have been a cat. Or the Thatchers’ goat.', face: 'shy', then: [{ run: ctx.lie }] },
  ] },
];
// Said herself, before she was asked: her mother's answer.
const gardenOwned = (rows, degree) => degree === 'wanton' ? [
  { who: 'mother', face: 'wince', listen: { red: 'shy' }, text: 'You did. I came past them. Every bed, Little Red.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'That’s not a slip, nor two. That’s not caring where you put your feet, bed after bed, and knowing it. Thank you for telling me. It doesn’t make it less.' },
] : [{ who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Did you. ' + (rows && rows.length ? mine(rows).charAt(0).toUpperCase() + mine(rows).slice(1) : 'My flowers') + '. Thank you for telling me before I found it myself. That’s worth something. It doesn’t mend them, though.' }];
// (a cat, through every bed in the garden: not believed)
const gardenWantonLie = () => [
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'A cat. Through every bed in my garden, one after another, and every flower in it broken at the same height as your boots.' },
  { who: 'red', face: 'wince', text: 'Mama—' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Don’t. Whatever made you do it, don’t add a lie to it.' },
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
const gardenTakeInHand = how => how.degree === 'wanton' && !how.lied ? [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Not a slip. Bed after bed of them, and you walking on.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'You’ll answer for every one, and for not caring. Come here, Little Red.' },
] : how.lied ? [
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'This is for my flowers, which you didn’t care about. And it’s for the lie, which is worse, because I do care about that.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Come here, Little Red.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Walk the paths, I said. My flowers took me years.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'You’ll learn to mind where you put your feet. Come here.' },
];
// (her garden, wantonly trodden, bed after bed: one of the very few times her mother's hurt by what she's done, and says so; the hairbrush,
// not counted, and on till she's truly sorry. lied: the lie on top of it)
const wantonBrush = async (S, lied) => {
  const M = 'corrector', R = 'subject';
  S.set({ strength: 1.85, pace: 1.05 }); await S.wait(0.8);
  await S.say(M, 'I’m not counting these. I’ll stop when you understand, and not before.', 'wince');
  await S.step([M, 'Your grandmother gave me the first of those bells. The spring you were born. I carried them home in my apron.', 'wince'], 6);
  await S.step([R, 'Mama— I didn’t—'], 3);
  await S.step([M, 'The cockle shells I grew from seed. Three summers before they’d flower. Three.', 'wince'], 6);
  await S.step([M, 'I knelt in that mud every evening you were small, while you played on the path. You knew which ones were which before you could say their names.', 'wince'], 7);
  await S.step([R, 'I’m sorry—'], 3);
  await S.step([M, 'You were cross. I know. And you put your boots through every one of them, and you kept going.' + (lied ? ' And then you looked at me and said a cat.' : ''), 'stern'], 8);
  await S.step([R, 'Mama, please— I know— I know it was wicked—'], 4);
  await S.step([M, 'It wasn’t the flowers, Little Red. It was you not caring that they were mine.', 'wince'], 8);
  await S.step([R, 'I do care— I do— I’m so sorry, Mama, I’m so sorry—'], 6);
  await S.step([M, 'Then feel it. All of it.', 'stern'], 8);
  await S.smacks(6);
  await S.step([R, 'I’ll put them right. Every one I can. I’ll kneel in the mud with you. Please, Mama. I’m truly sorry. Truly.'], 4);
  S.set({ pace: 0.7 });
  await S.step([M, 'I know you are. I can hear it.', 'concerned'], 3);
};
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
  // (more than a slip: careless, her drawers down for the rest; wanton, bed after bed, and the hairbrush after, twelve, counted)
  const dg = how.degree || 'slip';
  if (!lied && dg !== 'slip') {
    await S.smacks(6);
    await S.gesture('drawers'); await S.wait(0.5);
    await S.say(R, 'Mama—');
    await S.say(M, dg === 'wanton' ? 'Yes. Every bed in it, Little Red. Every one.' : 'Yes. Not one or two. A whole stretch of them.', 'stern');
    S.set({ strength: 1.8, pace: 1.7 });
    await S.step([M, dg === 'wanton' ? 'One you might not see. Two, three. But you walked on, and on, and you knew.' : 'You weren’t looking where you went. Not once.'], dg === 'wanton' ? 14 : 10);
    await S.step([R, 'I’m sorry— I’m sorry, Mama—'], 6);
    await S.smacks(dg === 'wanton' ? 10 : 6);
    await marenClose(S, how, dg === 'wanton' ? { ask: [M, 'Up. The hairbrush, from the chest.'], back: [M, 'Back over my knee.', 'stern'], run: S2 => wantonBrush(S2) } : null);
    await S.say(M, 'There. You owned it, and it’s answered. Up you get.', 'calm');
    await S.wait(1.2); return;
  }
  if (!lied) {
    await S.smacks(8);
    await marenClose(S, how);
    await S.say(M, 'There. You owned it, and that’s the end of it. Up you get.', 'calm');
    await S.wait(1.2); return;
  }
  await S.smacks(6);
  await S.gesture('drawers'); await S.wait(0.5);
  await S.say(R, 'Mama, please—');
  await S.say(M, 'You had your chance to tell me, and you told me a cat.', 'stern');
  S.set({ strength: 1.85, pace: 1.8 });
  await S.step([M, how.caught === 'plain' ? 'A cat, you said. Through every bed I have.' : how.caught === 'witness' ? 'And I had to hear the truth from ' + (FULL[how.who] || 'a neighbour') + ', over a fence, like gossip.' : 'With the petals on your boots, Little Red. On your boots.'], 10);
  await S.step([R, 'I’m sorry! I’m sorry I said it!'], 6);
  await S.step([M, 'Flowers grow back. Trust takes longer.'], 10);
  await S.smacks(8);
  // (and the hairbrush, last: six, counted; or, for the wanton, until she's truly sorry)
  await marenClose(S, how, { ask: [M, 'Up. The hairbrush, from the chest. You know where it is.'], back: [M, 'Back over my knee.', 'stern'], run: async S2 => {
    S2.set({ strength: 1.8, pace: 1 }); await S2.wait(0.8);
    if (dg === 'wanton') { await wantonBrush(S2, true); return; }
    await S2.say(M, 'Six. Count them, and then it’s done with.', 'stern');
    await S2.say(R, '…Yes, Mama.');
    const nums = ['One…', 'Two…', 'Three…', 'Four…', 'Five…', 'Six… I’m sorry, Mama…'];
    for (let k = 0; k < nums.length; k++) await count(nums[k], k === 2 ? 'concerned' : k === nums.length - 1 ? 'calm' : null); } });
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
      { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Just to me. Hm.' },
      { who: 'pennock', face: 'stern', listen: { tom: 'wince' }, text: 'Tom Ferrier: on to my bakery, and wait for me there. Don’t touch a thing.' },
      { who: 'tom', face: 'pout', listen: { pennock: 'stern' }, text: 'Yes, Mistress Pennock.' }] },
  ] },
];
// (a few steps off from the anvil, the two of them: she says it)
const pieAside = () => [{ who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Over here, then, out of the din. Go on.' }];
const pieTell = () => [
  { who: 'red', face: 'shy', listen: { pennock: 'calm' }, text: 'It was my hand on the pie, not his. Whatever you give Tom, I’ve earned it too.' },
  { who: 'red', face: 'shy', listen: { pennock: 'concerned' }, text: 'Mama takes me in hand, when I’ve earned it. I asked her to. And I think she’d want you to, for this. I’d rather it was you, now, than carry it home.' },
  { who: 'pennock', face: 'concerned', listen: { red: 'shy' }, text: 'Your mother does, does she. I did wonder, once or twice.' },
  { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Well. You were honest with me, and that took some doing. Then you’ll come along to the bakery, and I’ll speak to your mother after.' },
];
// In the bakery, before it.
const pieBakery = () => [
  { who: 'pennock', face: 'stern', listen: { red: 'shy' }, text: 'Tom first. You’ll stand there and see it, Rose, and then it’s your turn, as you asked.' },
  { who: 'red', face: 'shy', text: 'Yes, Mistress Pennock.' },
];
// Tom across her knee: he jokes, and stops joking; his word's his own, and he doesn't use it.
const pieTom = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'up', drawers: 'up', implement: 'hand', strength: 1.5, pace: 1.4 });      // (his trousers down from the start: for a man, the skirt's state is his trousers')
  await S.wait(0.6);
  await S.say(R, 'You know, Mistress Pennock, it was a very good pie.');
  await S.say(M, 'It was. And it’s still on my board, no thanks to you.', 'stern');
  await S.step([M, 'A dare, was it? Every time, Tom Ferrier. Every time it’s a dare.'], 8);
  await S.step([R, 'Ow— she didn’t have to take it!'], 4);
  await S.step([M, 'No. And you didn’t have to ask her. That’s what this is for.'], 8);
  S.set({ strength: 1.8, pace: 1.6 });
  await S.step([M, 'You’re a grown man and a good smith’s apprentice, and you still can’t walk past a windowsill.'], 10);
  await S.step([R, 'I can walk past it— ow!— I just don’t—'], 4);
  await S.gesture('drawers'); await S.wait(0.5);
  await S.say(R, 'Mistress Pennock! Not— she’s standing right there—', 'wince');
  await S.say(M, 'She is. And you’ll remember that, the next time you think of mischief, and think twice. That’s what it’s for.', 'stern');
  S.set({ strength: 1.9, pace: 1.7 });
  await S.step([M, 'Every time it’s a dare. Not any more.'], 8);
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
  await S.gesture('drawers'); await S.wait(0.5);
  await S.say(R, 'Mistress Pennock—', 'wince');
  await S.say(M, 'The same as Tom, Rose. You asked for it.', 'calm');
  S.set({ strength: 1.8, pace: 1.6 });
  await S.step([M, 'Not for a pie. Not for anything.'], 8);
  S.set({ implement: 'bakersPaddle', strength: 1.6, pace: 1 });
  await S.say(M, 'Six with the paddle, the same as he had. Then it’s done, and we’re even.', 'stern');
  await S.smacks(6);
  await S.say(M, 'There. Up you get, love.', 'calm');
  await S.wait(1.0);
};
// Back from the mill, and the list not done (left: what's still to do; confided: Red's told her what she and her mother have, so she'll see to
// it as Maren would).
const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
const pennockShort = (left, confided) => confided ? [
  { who: 'pennock', face: 'stern', listen: { red: 'shy' }, text: 'Rose. ' + left[0][0].toUpperCase() + left[0].slice(1) + (left.length > 1 ? ', and ' + NUM[left.length - 1] + ' more besides,' : '') + ' not done. Three hours and a half I gave you.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mistress Pennock. I didn’t— the time went.' },
  { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'It does, when you let it. You asked me to treat you as your mother would. So I shall. Come here.' },
] : [
  { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Oh. ' + left[0][0].toUpperCase() + left[0].slice(1) + (left.length > 1 ? ', and ' + NUM[left.length - 1] + ' more,' : '') + ' still to do.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mistress Pennock. I ran out of time.' },
  { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Well. I’ll see to it myself. Run along home, love.' },
  { who: 'red', face: 'wince', thought: true, text: 'She didn’t say anything else. That was worse.' },
];
// Over her knee by the trough, for the list not done.
const pennockShortRed = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.3, pace: 1.3 });
  await S.wait(0.6);
  await S.say(M, 'Over you come. When I leave you with my bakery, I need to know it’ll be done.', 'calm');
  await S.step([M, 'Not half done. Not done if the time allows. Done.', 'stern'], 8);
  await S.step([R, 'Yes, Mistress Pennock—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.6, pace: 1.5 });
  await S.step([M, 'You’re quick when you want to be. I’ve seen it. So next time you’ll want to.'], 10);
  await S.step([R, 'Ow— I will—'], 4);
  await S.say(M, 'There. That’s all. Up you get, love.', 'calm');
  await S.wait(1.0);
};
const pennockShortAfter = r => r && r.rose ? [
  { who: 'pennock', face: 'concerned', listen: { red: 'shy' }, text: 'Sit a minute, Rose. You did right to stop me. We’ll say no more about it.' },
] : [
  { who: 'pennock', face: 'calm', listen: { red: 'teary' }, text: 'There. Done with. Now help me finish, the two of us, and then home.' },
  { who: 'pennock', face: 'smile', listen: { red: 'shy' }, text: 'And I’ll still want you next time. Don’t think I won’t.' },
  { who: 'red', face: 'shy', text: 'Thank you, Mistress Pennock.' },
];
// After: Mistress Pennock's word to her (r: how it went), and Tom sent home.
const pieAfter = r => r && r.rose ? [
  { who: 'pennock', face: 'concerned', listen: { red: 'shy' }, text: 'Sit a minute, Rose. There’s milk. You did right to stop me.' },
] : [
  { who: 'pennock', face: 'calm', listen: { red: 'teary' }, text: 'There. Done, and we’re even, the three of us. Tom, you’ll knead my dough for an hour, and then home with your ears ringing.' },
  { who: 'tom', face: 'pout', listen: { pennock: 'calm' }, text: 'Yes, Mistress Pennock.' },
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
// Sent home: her mother, as soon as she's in (ctx.early: before supper's time). ctx: { early, tell(), keep() }
const pieHome = ctx => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: (ctx.early ? 'You’re home early. And you’ve' : 'You’ve') + ' a face like a wet Sunday. What is it?' },
  { choose: [
    { text: 'Mama… I took one of Mistress Pennock’s pies. On Tom’s dare. She caught us.', face: 'shy', then: [{ run: ctx.tell },
      { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Did she, now.' },
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me yourself. It counts. And it doesn’t change what the pie earned you.' }] },      // (and when it'll be seen to: js/evening.js's owe)
    { text: 'Nothing, Mama. I’m just tired.', face: 'shy', then: [{ run: ctx.keep },
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Hm. Sit down, then. I’ll put the kettle on.' },
      { who: 'red', face: 'shy', thought: true, text: 'She’ll hear. Mistress Pennock said she’d tell her. Tomorrow, maybe.' }] },
  ] },
];
// Told herself, in her day's telling: her mother's answer.
const pieOwned = () => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Did she, now.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me yourself. It counts. And it doesn’t change what the pie earned you.' },
];
// A day on: her mother's had a visit.
const pieFoundOut = () => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Mistress Pennock had a word with me today.' },
  { who: 'red', face: 'wince', text: 'Oh.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: '“Oh.” A pie off her board, on Tom Ferrier’s say-so, and the two of you marched to the forge. And you sat at my table last night and said you were tired.' },
];
// Her mother's correction for the pie: her hand, longer for keeping it back (how: { withheld }).
// ── The loaf (js/loaf.js): her mother's, off the board; the ducks, with Peter. what: 'the loaf' (from home) | 'the loaves' (the bakery's)
// (Peter at the pond, with nothing to give them: the idea, planted)
const ducksWish = () => [
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Red. Look at them. The brown one’s been chasing the white one round the reeds all morning.' },
  { who: 'red', face: 'smile', text: 'What did the white one do?' },
  { who: 'peter', face: 'calm', listen: { red: 'cheeky' }, text: 'Nothing, as far as I can see. That’s ducks for you.' },
  { who: 'peter', face: 'bashful', listen: { red: 'smile' }, text: 'I’d feed them, if I’d thought to bring a crust. Grandad says bread’s for people. Grandad’s never seen a duck’s face when it gets some.' },
  { who: 'red', face: 'cheeky', thought: true, text: 'There’s bread at home. On the board.' },
];
// (bread in her basket: he's seen it)
const ducksAsk = (what, ctx) => what === 'the heel' ? [
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Is that a crust in your basket, Red?' },
  { who: 'red', face: 'smile', listen: { peter: 'smile' }, text: 'The heel of the loaf. Mama gave it me, for the ducks. Honestly given, this time.' },
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Then come on. Before the brown one sees us.' },
  { run: ctx.yes },
] : [
  { who: 'peter', face: 'smile', listen: { red: 'shy' }, text: what === 'the loaves' ? 'Is that Master Pennock’s bread? It smells like it. Oh, Red, the ducks would think it was the fair.' : what === 'a fresh loaf' ? 'Is that one of Mistress Pennock’s? Still warm, I bet. Oh, Red, the ducks would think it was the fair.' : 'Is that a loaf in your basket? Oh, Red. The ducks would think it was the fair.' },
  { choose: [
    { text: 'Just a little, then.', face: 'cheeky', then: [{ run: ctx.yes }, { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Come on, then. Before they see us and riot.' }] },
    { text: 'I can’t. It’s Mama’s.', face: 'shy', then: [{ who: 'peter', face: 'calm', listen: { red: 'shy' }, text: 'No. Course not. Another time.' }] },
  ] },
];
const ducksFed = (what, part) => [
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Not all at once! Little bits. Look, the small one never gets any. Throw it to the small one.' },
  { who: 'red', face: 'smile', listen: { peter: 'smile' }, text: 'Here, little one! Here! Oh, the brown one’s got it again.' },
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'He’s a bully. Grandad would say he’s got prospects.' },
  { who: 'red', face: 'smile', listen: { peter: 'smile' }, text: 'Another bit. And another. Oh, they’re so pleased.' },
  part ? { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'That’s half of it gone, Red. You’d best keep the rest. For your mother.' }
    : { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: what === 'the loaves' ? 'That’s… that’s all of it, Red. Both of them.' : 'That’s the last of it.' },
];
const ducksAfter = (what, part) => what === 'the heel' ? 'Every crumb of the heel, and nobody’s loaf but theirs. That felt better.' : part && what === 'a fresh loaf' ? 'A good piece off the fresh loaf. It’ll go on the board like that, and she’ll see it’s not whole.' : part ? 'Half Mama’s loaf. Back on the board with the rest, and she’ll see it’s gone down.' : what === 'the loaves' ? 'Both loaves. Gone. Mama sent me for those.' : 'Every crumb of it. Mama’s supper loaf.';
// Owned up to, before she was asked (kind: 'taken' | 'fed' | 'ducks'): her mother's answer.
const loafOwned = kind => kind === 'taken' ? [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Then it goes back on the board, now. And you don’t take what isn’t yours, even in this house.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You told me yourself, before I missed it. That counts.' },
] : [
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: kind === 'ducks' ? 'All of it. My bread, to the ducks.' : 'Half my loaf, to the ducks.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me before I had to ask. You’ll still answer for the bread, this evening.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You could have waited, you know, and had the heel. From now on, when it’s down to the heel, it’s yours for them. No need to take what isn’t.' },
];
// The loaf back on the board, gone down since she cut from it: what happened to it? (ctx.hungry(): the lie; ctx.ducks(): the truth)
const loafDiminished = (ctx, fresh) => [      // (fresh: the loaf just home from Mistress Pennock's counter, not whole)
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: fresh ? 'This is the loaf from Mistress Pennock’s? It’s not whole. There’s a good piece gone off the end of it, and it’s not been cut. Rose?' : 'This loaf’s gone down since I last cut it. A good deal down. Rose?' },
  { choose: [
    { text: 'I was hungry, Mama. I had some.', face: 'shy', then: [{ run: ctx.hungry },
      { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: fresh ? 'On the way home, off a loaf that was for all of us, and not a word to me. You know better than that.' : 'Half a loaf, between meals, and not a word to me. You know better than that.' },
      { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'You eat at the table, when it’s put in front of you. Not whenever you fancy. That’s wilful, and I’ll count it so.' },
      { who: 'red', face: 'shy', text: 'Yes, Mama.' },
      { who: 'red', face: 'wince', thought: true, text: 'The ducks had it. And now I’ve a lie to carry about besides.' }] },
    { text: 'I fed it to the ducks, Mama. With Peter.', face: 'wince', then: [{ run: ctx.ducks },
      { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: fresh ? 'To the ducks. A loaf I paid for, before it was even through my door.' : 'To the ducks. My bread, off my board, to the ducks.' },
      { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Thank you for the truth. You’ll still answer for the bread, this evening.' },
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You could have waited, you know, and had the heel. From now on, when it’s down to the heel, it’s yours for them. No need to take what isn’t.' }] },
  ] },
];
// (a morning the heel's all that's left, and it's hers for the ducks: in her basket)
const heelGiven = () => [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'The heel’s in your basket, love. For your ducks. Mind you share it with Peter Fowler.' }];
// The loaf down to the heel, at a meal: another from Mistress Pennock, at her counter. (morning: there's time today)
const loafOut = morning => [
 { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'That’s the heel of the loaf. ' + (morning === 'first' ? 'And no baking till First day, so the heel it is till then. First thing First day, love, Mistress Pennock’s counter.' : morning ? 'Take your basket to Mistress Pennock’s counter this morning, love, and ask her for another, before she’s sold out.' : 'Go along to Mistress Pennock’s counter in the morning, love, and ask her for another. Early, before she’s sold out.') },
  { who: 'red', face: 'calm', listen: { mother: 'calm' }, text: 'Yes, Mama.' },
];
// Over breakfast, the shopping, on top of the day's errand (errand: there is one; or not): not an errand of its own, only a kindness if done.
const shopAsk = errand => [
  { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: (errand ? 'And on top of that: ' : 'One thing, though: ') + 'we’re down to the heel of the loaf. If you’re passing Mistress Pennock’s counter, bring us a fresh one. Before noon, while she’s some left.' },
  { who: 'red', face: 'calm', listen: { mother: 'calm' }, text: 'Yes, Mama.' },
];
// At the counter: a loaf for Mama.
const loafCounter = () => [
  { who: 'red', face: 'smile', listen: { pennock: 'smile' }, text: 'A loaf for Mama, please, Mistress Pennock.' },
  { who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Here, love: the brownest on the board. Put it on our slate. Mind it doesn’t walk off on the way home.' },
  { who: 'red', face: 'cheeky', thought: true, text: 'Warm through the cloth. Straight home with it. Mostly straight.' },
];
// Her mother, before supper: the loaf's gone off the board. (ctx.back: Red owns up, and puts it back; otherwise she says she doesn't know)
const loafAsk = ctx => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'The loaf’s gone off the board. I left it there for supper. You don’t know anything about it, I suppose?' },
  { choose: [
    { text: 'I took it, Mama. It’s here, in my basket.', face: 'shy', then: [{ run: ctx.back },
      { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Then put it back on the board. And don’t take what isn’t yours, even in this house.' },
      { who: 'red', face: 'shy', text: 'Yes, Mama. I’m sorry.' },
      { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You owned up to it. That counts.' }] },
    { text: 'No, Mama. I don’t know.', face: 'shy', then: [
      { who: 'mother', face: 'calm', listen: { red: 'wince' }, text: 'Hm. Then the mice are bolder than I thought.' },
      { who: 'red', face: 'wince', thought: true, text: 'It’s right there in my basket. Under the cloth.' }] },
  ] },
];
// (gone: given to the ducks, or lost)
const loafGone = ducks => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'The loaf’s gone off the board. I left it there for supper. You don’t know anything about it, I suppose?' },
  { who: 'red', face: 'shy', listen: { mother: 'stern' }, text: ducks ? 'I took it, Mama. And Peter and I… fed it to the ducks.' : 'I took it, Mama. And now I don’t know where it is.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: ducks ? 'To the ducks.' : 'You took it, and lost it.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Then it’s supper without bread.' },
].concat(ducks ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You could have waited, you know, and had the heel. From now on, when it’s down to the heel, it’s yours for them. No need to take what isn’t.' }] : []);
const loavesGone = () => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'And Master Pennock’s loaves? He was keeping them back for us.' },
  { who: 'red', face: 'shy', listen: { mother: 'stern' }, text: 'I had them, Mama. I did fetch them. And then Peter and I… fed them to the ducks.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Both of them. Two days’ bread, to the ducks.' },
];
const loafCorrection = async (S, how) => {
  const M = 'corrector', R = 'subject', more = how.bakery ? 0.2 : 0;
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.4 + more, pace: 1.35 });
  await S.wait(0.8);
  await S.say(M, how.bakery ? 'Two loaves, Little Red. That I sent you for.' : how.fresh ? 'A fresh loaf, Little Red. Off Mistress Pennock’s counter, and half of it never through my door.' : 'The loaf off my board, Little Red. That you knew was for supper.', 'stern');
  await S.step([M, how.fresh ? 'Fetched for the house, and shared out on the way. That’s the first of it.' : 'Taken without asking. That’s the first of it.'], 8);
  await S.step([R, 'I know, Mama—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.6 + more, pace: 1.55 });
  await S.step([M, how.ducks ? 'And thrown to the ducks, because a boy smiled at you by the pond.' : 'And lost, because you didn’t think about it at all.'], 10);
  await S.step([R, 'It wasn’t— ow— it wasn’t like that—'], 4);
  await S.step([M, 'Bread costs. Somebody baked it, and somebody paid for it, and neither of them was you.'], 10);
  await S.smacks(6);
  await marenClose(S, how);
  await S.say(M, 'There. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const loafAfter = how => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Better?' },
  { who: 'red', face: 'shy', text: how.ducks ? 'Better. The ducks did enjoy it, though.' : 'Better. I’m sorry about the bread.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: how.ducks ? 'I’m sure they did. Next time, ask me for the heel of yesterday’s, and you can both go. Now, bed.' : 'I know. Now, bed.' },
];
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
  await marenClose(S, how);
  await S.say(M, 'There. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const pieMarenAfter = how => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: how.withheld ? 'Next time you come straight to me. Yes?' : 'You told me yourself. That’s the bit I’ll remember.' },
  { who: 'red', face: 'shy', text: how.withheld ? 'Yes, Mama.' : 'I’m sorry about the pie.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Tomorrow you’ll go and say so to Mistress Pennock. Now, bed.' },
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
// Lay night: Georgie on his father's watch, finding her out past ten. He grew up with her; he isn't sure of her hour, nor of himself.
const georgieCalls = n => [{ who: 'georgie', face: 'concerned', listen: { red: 'wince' }, text: n > 1 ? 'Rose! Not again. Rose, stop, please.' : 'Rose? Rose! Is that— it’s past ten. You oughtn’t— stop there, will you?' }];
const georgieCatch = n => n > 1 ? [
  { who: 'georgie', face: 'pout', listen: { red: 'shy' }, text: 'You know I have to. It’s Father’s lantern. If he found out I’d let you by…' },
  { who: 'red', face: 'shy', text: 'I know, Georgie. Go on, then.' },
  { who: 'georgie', face: 'bashful', listen: { red: 'shy' }, text: 'After you. Sorry. Again.' },
] : [
  { who: 'georgie', face: 'bashful', listen: { red: 'surprised' }, text: 'I’m to walk you home. That’s what Father does, so. I’m sorry. I am.' },
  { who: 'red', face: 'cheeky', text: 'Georgie Dunn, you’re enjoying this.' },
  { who: 'georgie', face: 'pout', listen: { red: 'cheeky' }, text: 'I’m not! I’m really not. Just… walk, would you? Before anyone sees.' },
];
const georgieBrings = n => [
  { who: 'georgie', face: 'bashful', listen: { mother: 'stern' }, text: 'Evening, Mistress Ridley. I’ve— I’m on the watch tonight, for Father. I found Rose out. Past ten.' },
  { who: 'mother', face: 'stern', listen: { georgie: 'bashful' }, text: 'Thank you, Georgie. I’ll see to her.' },
  { who: 'georgie', face: 'shy', listen: { mother: 'calm' }, text: n > 1 ? 'I won’t tell Father. Not this time either. Goodnight, Mistress.' : 'I won’t tell Father. If that’s— I mean. Goodnight, Mistress. Rose.' },
];
// At her door: he hands her over.
const willieBrings = n => [
  { who: 'willie', face: 'calm', listen: { mother: 'stern' }, text: n > 1 ? 'Evening, Mistress Ridley. Miss Rose again, I’m afraid. On the green, past the bell.' : 'Evening, Mistress Ridley. I found Miss Rose out on the green, past the bell. I’ve walked her home.' },
  { who: 'mother', face: 'stern', listen: { willie: 'calm' }, text: 'Thank you, William. I’ll see to her.' },
  { who: 'willie', face: 'calm', listen: { mother: 'calm' }, text: 'I don’t doubt it. Goodnight, Mistress.' },
  { who: 'red', face: 'shy', listen: { willie: 'calm' }, text: n > 1 ? 'I’m sorry, Master William. Again. You’d better things to do than walk me home.' : 'I’m sorry, Master William. For being out past the bell, and keeping you from your round to bring me home.' },
  { who: 'willie', face: 'calm', listen: { red: 'shy' }, text: n > 1 ? 'I had. Mind it’s the last time. Goodnight, Miss Rose.' : 'Said, and taken. Mind the bell, after this. Goodnight, Miss Rose.' },
  ];
// Home after the bell. (how.willie: brought home)
const curfewTalk = how => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: how.by === 'georgie' ? 'Brought home by Georgie Dunn. Georgie, Little Red, who you used to make eat worms.' : how.willie ? 'Brought home by the Watchman. Like a stray off the green.' : 'Do you know what time it is, Little Red? Because the bell does.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mama. I didn’t mean to be so late.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Nine o’clock, and not a minute past it. You agreed it, at this table.' },
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
    await S.step([M, how.by === 'georgie' ? 'And Georgie Dunn, on his father’s watch, walking you to my door. He could barely look at me.' : 'And William Dunn walking you to my door, with half the street’s shutters open to watch.'], 10);
    await S.step([R, 'Mama, please—'], 4);
    await S.smacks(8);
  }
  await S.step([M, 'Home by the bell. Every night. That’s the shape of it.'], 8);
  await S.smacks(8);
  await marenClose(S, how);
  await S.say(M, 'There. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const curfewAfter = how => [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'There. Nine o’clock, from now on. I want you where I can find you when it’s dark.' },
  { who: 'red', face: 'shy', text: 'Yes, Mama.' },
].concat(how.by === 'georgie' ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'And you’ll go easy on Georgie, when you see him. He did right, and it cost him.' }]
  : how.willie ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'And you’ll thank Master William when you see him. He could have left you to the dark.' }] : [],
  [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'There’s bread and cheese on the board, if you want it. Then bed.' }]);
// What someone else has already dealt with (c: { what, by }): a reprieve. how: 'heard' (they told her), 'reported' (Red just did), 'late' (she
// heard of it in the village, Red having kept it back).
const DEALT = { pie: 'the pie', dare: 'the dare with Tom', abney: 'what you asked of her', shift: 'the work left undone' };
const dealt = c => c.what === 'shift' ? (c.by === 'abney' ? 'the evening at the inn' : 'her list, left half done') : DEALT[c.what] || c.what;
// (a reprieve for one thing, and something else still owed tonight: that isn't let go with it)
const reprieveNotAll = kind => [{ who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'That’s that one seen to. It doesn’t see to ' + ({ garden: 'my flowers', loaf: 'my loaf', curfew: 'the bell', maintenance: 'the rest of your week', promise: 'your word to Mistress Abney', dress: 'that dress', wood: 'the wood' }[kind] || 'the other thing') + ', mind. That’s still to come, tonight.' }];
const reprieve = (c, how) => {
  const who = FULL[c.by] || 'someone', what = dealt(c);
  if (c.what === 'pie' && how === 'heard') return pieMotherKnows();
  if (c.what === 'abney') return [
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Mistress Abney had a word with me. She told me what you asked of her, and what she did about it.' },
    { who: 'red', face: 'shy', text: 'Are you cross?' },
    { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'No, love. I’m glad you’ve someone else to go to. It’s what I’d have wanted for you.' }];
  if (how === 'reported') return [
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me. ' + who + ' dealt with it, then, and that’s the end of it here. I’ll not take you in hand twice for one thing.' },
    { who: 'red', face: 'shy', text: 'Thank you, Mama.' }];
  if (how === 'late') return [
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'I heard about ' + what + ' today. And that ' + who + ' saw to you for it.' },
    { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Once is enough for one thing, so that’s the end of it. But I’d sooner have heard it from you.' }];
  return [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: who + ' had a word with me about ' + what + '. You’ve had your correction for it, and that’s an end of it. Once is enough for one thing.' }];
};
// Something someone else dealt with, that her mother doesn't know of yet: Red can tell her. ctx: { tell() }
const reportIt = (c, ctx) => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'You’re quiet tonight.' },
  { choose: [
    { text: 'Mama… ' + (FULL[c.by] || 'Someone') + ' took me in hand today. For ' + dealt(c) + '.', face: 'shy', then: [{ run: ctx.tell }] },
    { text: 'It’s nothing, Mama.', face: 'shy', then: [{ who: 'mother', face: 'calm', text: 'Hm. If you say so.' }] },
  ] },
];
// A correction of her mother's, owed (js/evening.js): when it's raised, a line for when it'll be seen to (early: before six, when she's come
// home early with it); and at the evening's end, the word for it now. The garden has its own.
const owedLater = (kind, early) => [{ who: 'mother', face: 'stern', listen: { red: 'shy' }, text: early ? 'This evening, after supper, you and I will see to it. Not before, and not forgotten.' : kind === 'curfew' ? 'Sit down and tell me your day first. Then you and I will settle this.' : 'Supper first. We’ll see to this after, you and I.' }];
// Stood before her, after supper: what it's for, said plainly, before it's given. (garden: its own, js/garden.js's gardenTakeInHand)
const OWED_FOR = {
  maintenance: () => 'Three things this week I gave you to do, and three you let slide. Not one of them was hard. You just didn’t.',
  curfew: how => how.by === 'georgie' ? 'Out after the bell, and Georgie Dunn had to walk you to my door. Keeping his father’s watch for the one night, and you made him spend it on you.'
    : how.willie ? 'Out after the bell, and brought to my door by the Watchman. He’d a round to walk, and you made him walk it with you.' : 'In after the bell. Nine o’clock is your hour, and you know it.',
  pie: how => how.withheld ? 'The pie off Mistress Pennock’s board. And then not a word to me, so I had it from a neighbour.' : 'The pie off Mistress Pennock’s board. You told me yourself, and I’m glad of that. But it was still taken.',
  promise: () => 'You gave Mistress Abney your word, and you didn’t keep it. Bess sat there waiting for you.',
  dress: how => how.hid ? 'The dress. Spoiled, and then hidden from me, as if I’d not see it.' : 'The dress your mother made you, a week of evenings, and spoiled in a day.',
  wood: () => 'In the wood after dusk. Out of it before the light goes: that’s been the rule since you could walk, and it’s not for nothing.',
  loaf: how => how.bakery ? 'Master Pennock’s loaves, that I sent you for, thrown to the ducks. That was our bread for two days.' : how.ducks ? 'The loaf off my board, taken without asking, and thrown to the ducks.' : 'The loaf off my board, taken without asking, and lost.',
};
// (something else owed besides, folded into tonight's: said over her before the end. ago: days since)
const ALSO_FOR = { wood: 'staying in the wood after dusk', garden: 'my flowers', loaf: (how) => how && how.ducks ? 'my bread, to the ducks' : 'my loaf', curfew: 'coming in past the bell', pie: 'the pie', promise: 'your word to Mistress Abney', dress: 'that dress', maintenance: 'the rest of your week' };
const owedAlso = (kind, how, ago) => { const a = ALSO_FOR[kind], why = typeof a === 'function' ? a(how) : a || 'the other thing'; return 'And this is for ' + why + (ago ? (ago === 1 ? ', yesterday' : ', the other day') : '') + '. That’s not forgotten either.'; };
const owedNow = (kind, how) => !OWED_FOR[kind] ? [] : [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Now, then. You know what’s owed.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: OWED_FOR[kind](how || {}) },
  { who: 'red', face: 'shy', listen: { mother: 'stern' }, text: 'Yes, Mama.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Then come here, Little Red, and we’ll put it behind us.' },
];
// After an evening correction: the bread and cheese on the board, if she wants it, and bed; at the door after nine, her mother.
// ── Dinner, at half past twelve (js/maren.js): her mother back from the farm, the two of them at the table; her word on the morning. Never a
// correction there: only what she's seen, and what's to come of it if it's not put right. r: { garden ('done' | 'begun' | 'untouched' |
// null: not Red's today), errand ({ id, state, by } | null), trodden (her flowers, today), needle ('morning' | 'afternoon' | null) }
// how: 'arrived' (in from the farm, and glad to find her home) or 'home' (at her needlework, and it's time).
const dinnerCall = how => how === 'arrived' ? [
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'There you are! I hoped you’d be in. Plates down, love, and sit: my back’s been bent over beans all morning.' },
] : [{ who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'That’s enough of this seam for now. Dinner, love. Plates down, and sit.' }];
// At the table: Red's morning, as she tells it, and then her mother's word on it. r: { garden, errand: { id, state, by } | null, trodden, herb,
// needle }
const dinner = r => {
  const M = (face, text, red) => ({ who: 'mother', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, listen: { mother: 'calm' }, text }), out = [];
  out.push(M('smile', 'Well, then. Tell me your morning.', 'calm'));
  if (r.given) out.push(...r.given);      // (what she's brought home, handed across the table first)
  // (hers first: what she's done, and not)
  const e = r.errand && ERRANDS[r.errand.id], st = r.errand && r.errand.state, told = [];
  if (e && (st === 'done' || st === 'carrying')) told.push('I ' + e.did + '.');
  else if (e && st === 'accepted') told.push('I’ve still to ' + e.todo + (e.mind ? '.' : ', by ' + aloud(r.errand.by) + '.'));
  else if (e && (st === 'broken' || st === 'missed')) told.push('I didn’t get to ' + e.it + ' in time.');
  if (r.garden === 'done') told.push('And the garden’s done.'); else if (r.garden === 'begun') told.push('I’ve made a start on the garden.'); else if (r.garden === 'untouched') told.push('I haven’t got to the garden yet.');
  if (r.herb) told.push('Grandmother sent me for ' + r.herb.name + '.');
  out.push(R(told.length ? 'calm' : 'shy', told.length ? told.join(' ') : 'Nothing much yet, Mama. It’s been a quiet morning.'));
  // (then hers: her word on each)
  if (e && (st === 'done' || st === 'carrying')) out.push(M('smile', 'Good girl. That’s ' + e.it + ' seen to.', 'smile'));
  else if (e && st === 'accepted') out.push(M('calm', e.mind ? e.mind : 'By ' + aloud(r.errand.by) + ', then. Not a minute after.'));
  else if (e && (st === 'broken' || st === 'missed')) out.push(M('stern', 'No. It’s too late for it now, isn’t it. We’ll talk about it tonight.', 'shy'));
  if (r.garden === 'untouched') out.push(M('stern', 'Before dark, mind. I’ll look when I’m home.', 'shy'));
  else if (r.garden === 'begun') out.push(M('calm', 'Then finish it this afternoon.'));
  if (r.herb) out.push(M('smile', 'Did she, now. She’s teaching you, then.', 'smile'));
  if (!r.trodden && !r.later) out.push(...dinnerEnd(r));      // (her flowers trodden, the loaf: she asks about them first, js/garden.js, js/loaf.js, and then this)
  return out;
};
const dinnerEnd = r => [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: ({
  needle: 'I’ve my needlework this afternoon, so I’ll be here if you want me.',
  dress: 'And this afternoon it’s your dress again. Don’t wander far. Supper at six.',
  homeWeek: 'I’m home this afternoon: the fair’s week, and a deal to do. Supper at six.',
  gran: 'I’m up to your grandmother’s this afternoon. Back by five, and supper at six.',
  farm: 'And back up to the Hallorans’ for me. Supper at six.',
})[r.after || (r.needle === 'afternoon' ? 'needle' : 'farm')] }];
const leftForMama = key => key === 'well' ? 'The water butt back by the hearth, full. Mama will see it when she’s home.' : 'On the table, for Mama when she’s home.';
// How she's holding up (js/capacity.js), as she crosses each line: k 'low', 'worn', 'spent'; out: out of doors.
const capacityThought = (k, out) => k === 'low' ? (out ? 'I’m flagging. A sit somewhere quiet would help. Or home, for a bit.' : 'I’m flagging. A sit by the hearth, maybe.')
  : k === 'worn' ? 'Everything’s heavy. My feet, my basket, my head. I need to stop.' : 'I can’t. I just can’t, any more today.';
// Will she help with supper? ctx: { owed (colouring it), late (in after the bell), low (worn through: she may say so), yes(), little(), late() }
// (called to the table first: supperCall; then, sat at it across from each other, the bowl between them)
const breadEaten = () => [{ who: 'red', face: 'shy', thought: true, text: 'Bread and cheese, standing up, and the house very quiet. It helps, a bit.' }];
const curfewStern = () => [{ who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'And where do you think you’re going? Bed, Little Red. Now.' }, { who: 'red', face: 'shy', text: 'Yes, Mama.' }];
// (brought home by Master William, who's seen to it himself on the way, as her mother let him: she only hears of it)
const willieDealt = () => [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'Master William tells me he’s dealt with it. Has he?' },
  { who: 'red', face: 'teary', text: 'Yes, Mama.' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'Then that’s the end of it from me. There’s bread and cheese on the board, if you want it. Then bed.' },
];
const supperCall = ctx => ctx.late ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Supper’s long since eaten. Come and sit down at the table.' }]
  : ctx.owed ? [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Come and sit. The potatoes still want peeling, whatever else.' }]
  : ctx.home ? [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Six o’clock, love. Leave that, and come and sit with me. Supper wants starting.' }]
  : [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'There you are! Come and sit with me, love. Supper wants starting.' }];
const supper = ctx => ctx.late ? [{ run: ctx.late }] : [      // (late: supper long since eaten; she's sat down, and her day asked after)
  ctx.owed ? { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Here. There’s a knife by you. Will you help me with them?' }
    : { who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'There’s a knife by you. Will you help me with these, love?' },
].concat(ctx.low ? [{ choose: [      // (worn through, she may say so: js/capacity.js. Otherwise, of course she will)
  { text: 'Of course, Mama.', face: 'smile', then: [{ run: ctx.yes }] },
  { text: 'Could I just sit with you, Mama? I’m worn through.', face: 'shy', then: [{ run: ctx.little },
    { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Sit, then. You’ve had a long day of it.' }] },
] }] : [{ who: 'red', face: 'smile', text: 'Of course, Mama.' }, { run: ctx.yes }]);


// Her day, caught up on (how: 'yes', over the potatoes; 'little', on the stool while her mother sees to the hearth; 'late', in after the bell,
// sat down). day: { owed (a correction to come, after), late, dusk (the light gone: past doing the garden), noDinner, errand: { id, state, late }
// | null, garden: true | false | null (not hers today), dare: 'bell' | 'knock' | null, peter, herb }.
// ── Evenings on the green (js/green.js): Tom, Agnes or Peter asks her along (which: the evening's turn, three each); and how it went.
const EVENING = {
  tom: [
    [{ who: 'tom', face: 'cheeky', listen: { red: 'surprised' }, text: 'Ridley! Old Halloran’s ram’s in the pinfold tonight with Bo’s ewes. I’ve a turnip and a theory. Are you coming?' }],
    [{ who: 'tom', face: 'smile', listen: { red: 'cheeky' }, text: 'Stones. The pond. Seven skips, I did, last night, and nobody saw. Come and see me do it again, or do it better, if you dare.' }],
    [{ who: 'tom', face: 'cheeky', listen: { red: 'smile' }, text: 'Up the lime with me. You can see the carrier’s lamp coming down the hill road from the top. Unless you’ve gone soft.' }],
  ],
  agnes: [
    [{ who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: 'Rose! Georgie’s going to read his poem at the pond. To me. In front of everyone. You have to come, I’ll die if you don’t.' }],
    [{ who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: 'Sit with me a while? Under the lime, before the light goes. I’ll do your hair. You never let anyone do your hair.' }],
    [{ who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: 'The Hallorans’ cow’s calved, Bo says. Up at the pinfold gate, if we’re quick, before they shut it in. Come on!' }],
  ],
  peter: [
    [{ who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Red. The linnets are coming in to roost in the meadow. I thought you might like to see. It’s only an hour.' }],
    [{ who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'There’s a barn owl in the Hallorans’ barn. She comes out about now. If we’re still, she might not mind us.' }],
    [{ who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'The nightjar’s back on the common. You hear it before you see it, if you see it at all. Will you come and listen?' }],
  ],
};
const EVENING_OUT = {
  tom: ['It is, in the end, a very good theory, and the ram is very angry, and they run until they can’t for laughing.', 'Tom skims eight. Then she skims nine, and he swears it was eight and a half, and they argue it till the light goes.', 'From the top of the lime the carrier’s lamp comes swinging down the hill road, tiny, then bigger, and Tom says one day he’ll go wherever it goes.'],
  agnes: ['The poem is dreadful, and Agnes laughs till she cries, and Georgie goes the colour of a beetroot, and it’s the best thing that’s happened all year.', 'Agnes plaits her hair, and unplaits it, and plaits it again, and tells her every secret in the village, and one of her own.', 'The calf’s all legs, and Bo lets them in to see, and Agnes names it before Bo can stop her. It’s called Rose, now. Bo says it suits.'],
  peter: ['The linnets come in over the meadow in their hundreds, and settle, and Peter doesn’t say anything, and neither does she.', 'They wait in the hay, and the owl comes, white as a ghost, and turns her head and looks at them, and goes. Peter lets out the breath he was holding.', 'They lie in the heather with their eyes shut, and it churrs, on and on, like a spinning wheel, and Peter’s hand is near hers in the dark, not touching.'],
};
const eveningAsk = (key, which, ctx) => (EVENING[key] || [])[which].concat([{ choose: [
  { text: 'Yes! For a bit.', face: 'cheeky', then: [{ run: ctx.go }] },
  { text: 'Not tonight.', face: 'shy', then: [{ who: key, face: 'pout', listen: { red: 'shy' }, text: key === 'tom' ? 'Your loss, Ridley.' : key === 'agnes' ? 'Oh, you. Another night, then.' : 'Another night, then.' }] },
] }]);
const eveningOut = (key, which) => [{ text: EVENING_OUT[key][which] }, { who: 'red', face: 'smile', thought: true, text: 'The light’s nearly gone. Home, before the bell.' }];
// Her mother, at supper, when there's time before the bell: her friends out on the green (she passed them, coming in), if Red's not seen them;
// and her grandmother, if it's been a while.
const friendsOut = () => [{ who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'Have you seen your friends today? I passed Agnes and the Dunn lad on the bench by the lime, coming in, and Tom Ferrier at the pond, making a nuisance of himself. Go and find them, if you like, before you wash. Home by nine.' }];
const granAsk = days => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'When were you last up at your grandmother’s?' },
  { who: 'red', face: 'shy', text: days > 6 ? 'I… don’t know. A week? More.' : 'A few days. Four. Five?' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Go up and see her, soon. Out of the wood by dusk, mind. She’d never say so, but she counts the days.' },
];
// ── Fair day on the green (js/fairday.js): a word with each of the fair's own people (their errands: fairAsk, below).
const FAIR_TALK = {
  mother: [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Look at you. Turn round. Oh, it hangs beautifully. Mind it, love: the green’s all hooves and cinders today.' }],
  gran: [{ who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Blue! Your mother’s outdone herself. Come here and let me see you. And then go and enjoy yourself, Little Red: it’s fair day.' }],
  thatcherWife: [{ who: 'thatcherWife', face: 'smile', listen: { red: 'smile' }, text: 'Miss Rose! Ribbons, laces, a gilt brooch from Ashby. Agnes has had her eye on the green ribbon since dawn and thinks I haven’t noticed.' }],
  miller: [{ who: 'miller', face: 'smile', listen: { red: 'smile' }, text: 'Not now, lass, I’m between the jig and the reel. Come back when it’s dark and there’s dancing. And tell that apprentice of mine I can see him from here.' }],
  thatcher: [{ who: 'thatcher', face: 'calm', listen: { red: 'calm' }, text: 'Morning, Miss Rose. Forty hurdles I split for these pens, and Agnes split twelve and says it was twenty. Mind the gate: they’re not all as good-tempered as Bo’s.' }],
  halloran: [{ who: 'halloran', face: 'smile', listen: { red: 'smile' }, text: 'Now then, Miss Rose. Planting in, and not a day too soon. Your mother’s a grand worker. Gradely lass, that. Tell her I said.' }],
  boFather: [{ who: 'boFather', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. Bo’s told us all about you. Every evening. Rose says this, Rose did that. You’d think you hung the moon.' }],
  boMother: [{ who: 'boMother', face: 'smile', listen: { red: 'smile' }, text: 'You’ll keep an eye on our Bo today? She’s never been to a fair with no flock to mind. She doesn’t know what to do with her hands.' }],
  carrierNed: [{ who: 'carrierNed', face: 'smile', listen: { red: 'smile' }, text: 'Little Miss Inn-shift! We came back for it, all three. Wouldn’t miss this fair for the king’s own.' }],
  carrierAmos: [{ who: 'carrierAmos', face: 'calm', listen: { red: 'calm' }, text: 'Robert used to dance the whole night through, at this fair. Bess with him. I’ll take her a cup of something, after.' }],
  carrierKit: [{ who: 'carrierKit', face: 'bashful', listen: { red: 'cheeky' }, text: 'Is there… does Agnes Thatcher have anyone to dance with, do you know? Only asking.' }],
};
const fairTalk = (key, ctx) => FAIR_TALK[key] || [];
// The dress, the first time each of them sees her in it on fair day (js/fairday.js). ctx: open (they know what being Little Red means),
// caught (Master William's had her once after curfew), easy (Peter: he trusts her well enough not to stammer). Those who know (or half know)
// allude; the rest are fond.
const fairDress = (key, ctx) => {
  const c = ctx || {};
  switch (key) {
    case 'pennock': return c.open ? [
      { who: 'pennock', face: 'smile', listen: { red: 'shy' }, text: 'Well, look at you. A week of your mother’s evenings, that, and every stitch shows it.' },
      { who: 'pennock', face: 'stern', listen: { red: 'shy' }, text: 'Keep it off my oven door, Little Red. I’d hate to have to tell her you’d been sitting in my cinders.' },
    ] : [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Miss Rose! Blue suits you. Your mother’s a wonder with a needle. Here: a crumb of gingerbread, for luck. Mind it doesn’t go down the front.' }];
    case 'baker': return [{ who: 'baker', face: 'smile', listen: { red: 'smile' }, text: 'Now there’s a dress. The wife’s been on about it all week, and she was right.' }];
    case 'abney': return c.open ? [
      { who: 'abney', face: 'smile', listen: { red: 'smile' }, text: 'There’s a dress with a week of evenings in it. You’re a picture, child.' },
      { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Your mother’ll want it home the way it left, Little Red. I know I would, in her place. And so would you, after.' },
    ] : [{ who: 'abney', face: 'smile', listen: { red: 'smile' }, text: 'Oh, Miss Rose, you’re a picture. My Robert would have had you round the green twice in that, and Bess with you. Go and show her, if you get a minute.' }];
    case 'smith': return c.open ? [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Hm. Blue. Stay out of my forge today, Little Red. Cinders don’t come out, and you know as well as Tom what follows them.' }]
      : [{ who: 'smith', face: 'calm', listen: { red: 'smile' }, text: 'Hm. Smart. Your mother’s work? Keep clear of the forge in that.' }];
    case 'tom': return c.open ? [
      { who: 'tom', face: 'cheeky', listen: { red: 'pout' }, text: 'Ridley! All in blue! A ha’penny says it’s not blue by tea.' },
      { who: 'tom', face: 'smile', listen: { red: 'shy' }, text: 'Not that I’d want to be you when your mother sees it if it isn’t. I’d know.' },
    ] : [{ who: 'tom', face: 'cheeky', listen: { red: 'pout' }, text: 'Ridley! You look like a— no. You look nice, actually. Don’t tell anyone I said.' }];
    case 'willie': return c.open ? [{ who: 'willie', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose. A fine dress. Home in it clean, and by ten, and your mother and I need never discuss it.' }]
      : c.caught ? [{ who: 'willie', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose. Very fine. Ten tonight, mind: and I’ll know that blue at fifty yards.' }]
      : [{ who: 'willie', face: 'smile', listen: { red: 'smile' }, text: 'Miss Rose. Very fine. Your mother’s work, I’ll wager. Enjoy the day.' }];
    case 'agnes': return [
      { who: 'agnes', face: 'surprised', listen: { red: 'smile' }, text: 'Rose! Oh, the blue! Turn round. Oh, and a bow at the back!' },
      { who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: 'I had one just like it when I was small. Blue, with a white collar; Mam made it for the Whitsun dancing. I wore it till my elbows came through, and cried when it went for rags.' },
    ];
    case 'georgie': return [{ who: 'georgie', face: 'bashful', listen: { red: 'smile' }, text: 'Miss— Rose. That’s a grand dress. Has Agnes seen it? She’ll want one.' }];
    case 'peter': return c.easy ? [
      { who: 'peter', face: 'surprised', listen: { red: 'shy' }, text: 'Red. Look at you.' },
      { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'You look… lovely. You do. Don’t laugh. I’m not— I mean it.' },
    ].concat(c.open ? [{ who: 'peter', face: 'bashful', listen: { red: 'smile' }, text: 'Keep it out of the pond. I’ll not be the reason it isn’t blue tonight.' }] : [])
      : [
      { who: 'peter', face: 'surprised', listen: { red: 'shy' }, text: 'Red. You’re… that’s… blue. It’s blue.' },
      { who: 'red', face: 'smile', listen: { peter: 'bashful' }, text: 'It is.' },
      { who: 'peter', face: 'bashful', listen: { red: 'smile' }, text: 'It suits— I mean you look— I have to go and see about a— Grandad. Something of Grandad’s. Sorry.' },
      { who: 'red', face: 'smile', thought: true, text: 'He’s gone the colour of Tom’s ears. He’s not even moved.' },
    ];
    case 'bo': return [{ who: 'bo', face: 'smile', listen: { red: 'smile' }, text: 'Rose, you look like a bluebell! A whole one! Can I touch the collar? I’ll not mark it. My hands are clean, look.' }];
    case 'halloran': return [{ who: 'halloran', face: 'smile', listen: { red: 'smile' }, text: 'Well now. Miss Rose, in her Sunday best and better. Your father’d have been proud to walk you down this green.' }];
    case 'thatcherWife': return [{ who: 'thatcherWife', face: 'smile', listen: { red: 'smile' }, text: 'That collar! Your mother never bought that lace in Ashby; she’s turned it herself. Agnes, come and look at Rose’s collar.' }];
    case 'bess': return c.open && c.frockTold ? [{ who: 'bess', face: 'smile', listen: { red: 'shy' }, text: 'And look at you. Blue. Mine was yellow. Keep yours further from the hearth than I kept mine, Little Red: you know how mine ended.' }]
      : [{ who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'And look at you. Blue, and a sash. Turn round, so I can see the bow. Oh, Rose.' }];
    default: return [];
  }
};
// Fair day's errands (js/fairday.js): asked (ctx.yes: she'll do it, for the ones she may turn down), and given.
const OPT = (ctx, yes, no) => [{ choose: [{ text: yes, face: 'smile', then: [{ run: ctx.yes }] }, { text: no, face: 'shy', then: [] }] }];
const fairAsk = (id, ctx) => ({
  flowers: [{ who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'I’m half sold out already, and it’s not nine. Run home and cut me more from the garden, love: the maids and the shells, a good armful. There are gaps where I cut this morning: reach in from them, and mind your hem.' }, { who: 'red', face: 'smile', text: 'Yes, Mama.' }],
  purse: [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'I’ve no change left, and everyone wants change. My purse is in the chest at home, under the linen. Bring it, would you?' }, { who: 'red', face: 'smile', text: 'Yes, Mama.' }],
  dinner: [{ who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'And while you’re at it: my dinner. Bread and cheese on the table, wrapped, and the little jug. I’ll not leave the stall to fetch it, or I’ll come back to nothing.' }, { who: 'red', face: 'smile', text: 'Yes, Mama.' }],
  yarrow: [{ who: 'gran', face: 'calm', listen: { red: 'calm' }, text: 'Little Red. I’ve sold every scrap of yarrow I brought. Fetch me more, from the meadow, where I showed you. Out by dusk, mind, though you’ll be long back by then.' }, { who: 'red', face: 'smile', text: 'Yes, Grandmother.' }],
  hooks: [{ who: 'smith', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. The stall hooks. On the bench in the back of the forge. I’m not leaving this cup.' }].concat(OPT(ctx, 'I’ll fetch them, Master Ferrier.', 'I can’t just now, sorry.'), [{ who: 'smith', face: 'calm', listen: { red: 'calm' }, text: 'Mind the hearth. Cinders.' }]),
  ewe: [{ who: 'bo', face: 'pout', listen: { red: 'shy' }, text: 'Rose! One of mine’s out. The old ewe. She’s in your mother’s cabbages, I can see her from here, and I can’t leave the rest or they’ll all go.' }].concat(OPT(ctx, 'I’ll get her for you, Bo.', 'I can’t, Bo, I’m sorry.'), [{ who: 'bo', face: 'smile', listen: { red: 'smile' }, text: 'Oh, Rose. Go round by the paths, she won’t run if you’re slow.' }]),
  fairing: [{ who: 'thatcherWife', face: 'smile', listen: { red: 'smile' }, text: 'Miss Rose. Will you take this to Bess Abney, from me? A ribbon, for the baby’s cap, when it comes. She can’t get out to see the fair, poor lamb, so a bit of the fair should go to her.' }].concat(OPT(ctx, 'Of course, Mistress Thatcher.', 'I can’t today, I’m sorry.')),
})[id] || [];
const fairGive = id => ({
  flowers: [{ who: 'red', face: 'smile', listen: { mother: 'smile' }, text: 'The maids and the shells, Mama. An armful.' }, { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Look at them. Into the buckets with them, and they’ll be gone by noon. Bless you.' }],
  purse: [{ who: 'red', face: 'calm', listen: { mother: 'calm' }, text: 'Your purse, Mama.' }, { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Good girl. Now I can give Master Halloran his ha’penny back, and he can stop looking at me.' }],
  dinner: [{ who: 'red', face: 'smile', listen: { mother: 'smile' }, text: 'Your dinner, Mama. And the jug.' }, { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Oh, I could eat the cloth. Take a bit of the cheese yourself. Go on.' }],
  yarrow: [{ who: 'red', face: 'smile', listen: { gran: 'smile' }, text: 'Yarrow, Grandmother. The best I could find.' }, { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'And every one right. Soldier’s woundwort, for a fair full of soldiers of the field. You’re a treasure.' }],
  hooks: [{ who: 'red', face: 'calm', listen: { smith: 'calm' }, text: 'Your hooks, Master Ferrier.' }, { who: 'smith', face: 'smile', listen: { red: 'smile' }, text: 'Hm. Good lass.' }],
  fairing: [{ who: 'red', face: 'smile', listen: { bess: 'smile' }, text: 'From Mistress Thatcher, Bess. A ribbon, for the baby’s cap. A bit of the fair.' }, { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'Oh, look at it. Yellow. Tell her thank you. And sit a minute, and tell me everything. Who’s dancing with who?' }],
})[id] || [];
const fairEwe = () => [{ text: 'The old ewe lifts her head from the cabbages, chewing, and considers her; then lets herself be led, round by the paths, out of the gate and back to Bo’s pens.' }];
// The dancing (js/fairday.js): Peter asks (easy: he trusts her well enough not to stammer), they dance; and Georgie's kiss (step 0: the green;
// 1: the kiss; 2: Tom and the lads, and Georgie running; 3: Agnes, after).
const fairDanceAsk = (easy, ctx) => (easy ? [
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'Red. The Miller’s starting a reel. Dance with me?' },
] : [
  { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'Red. I— the Miller’s… there’s a reel. If you… only if you want. I’m not much good. At reels.' },
]).concat([{ choose: [
  { text: 'I’d love to.', face: 'smile', then: [{ run: ctx.yes }] },
  { text: 'Not just now, Peter.', face: 'shy', then: [{ who: 'peter', face: 'calm', listen: { red: 'shy' }, text: 'No. Course not. Later, maybe.' }] },
] }]);
const fairDance = easy => easy ? [
  { text: 'The fiddle goes up, and they go round, and Peter knows the steps better than he lets on; and she’s laughing before the first turn’s done.' },
  { who: 'peter', face: 'smile', listen: { red: 'smile' }, text: 'You’ve flour on your nose. From the gingerbread.' },
  { who: 'red', face: 'cheeky', listen: { peter: 'smile' }, text: 'I have not.' },
  { who: 'peter', face: 'smile', listen: { red: 'shy' }, text: 'You have. I like it.' },
] : [
  { text: 'The fiddle goes up, and they go round, and Peter treads on her foot twice and says sorry three times; and then he stops counting under his breath, and it’s easier.' },
  { who: 'red', face: 'smile', listen: { peter: 'bashful' }, text: 'You’re better at reels than you said.' },
  { who: 'peter', face: 'bashful', listen: { red: 'smile' }, text: 'I’ve been practising. With Grandad’s broom. Don’t tell anyone.' },
];
const fairKiss = step => [
  [{ text: 'Across the ground, Agnes is dancing with the carrier’s lad, laughing, her green ribbon flying. Georgie Dunn’s at the edge, very red, watching her. Then he isn’t at the edge any more.' }],
  [{ text: 'He has her by the shoulders before she knows he’s there, and kisses her, full on the mouth, there in front of the whole green. She hadn’t asked him to. Everyone sees it.' },
   { who: 'agnes', face: 'surprised', listen: { georgie: 'bashful' }, text: 'Georgie—' }],
  [{ who: 'tom', face: 'cheeky', listen: { georgie: 'shy' }, text: 'Oho! Dunn! Look at Dunn! Lads! Come and see what Dunn’s about!' },
   { text: 'Tom and the lads come over roaring, and Georgie looks at them, and at Agnes, crying now, and runs. Down the mill lane, and gone, and leaves her standing there.' }],
  [{ who: 'agnes', face: 'crying', listen: { red: 'wince' }, text: 'Don’t. Rose, don’t. Everyone saw. Everyone.' },
   { who: 'red', face: 'wince', thought: true, text: 'Her face, in front of the whole village. And him gone, as if it had been nothing to do with him.' }],
][step] || [];
// ── Agnes and Georgie, after the fair (js/agnes.js).
// (Agnes, up by the pinfold, the first time Red finds her there: heard, Red wasn't there to see it, and Tom's told the whole village)
const agnesFound = heard => [
  { text: 'Agnes is sitting on the pinfold wall with her back to the village, watching Bo’s ewes as if they were the most interesting thing in the world.' },
  { who: 'red', face: 'shy', listen: { agnes: 'pout' }, text: heard ? 'Agnes. I heard. Tom’s told everyone, the toad. I wasn’t there; I wish I had been.' : 'Agnes. I’ve looked everywhere. You’ve not been at the well.' },
  { who: 'agnes', face: 'pout', listen: { red: 'shy' }, text: 'Everyone at the well saw. Everyone at the well will want to talk about it. So I’m talking to sheep.' },
  { who: 'agnes', face: 'sad', listen: { red: 'shy' }, text: 'He came to the door last night. His mother sent him, I’d say. I didn’t open it. What would he say? Sorry? Sorry’s a word, Rose. It took him one breath.' },
  { who: 'red', face: 'calm', listen: { agnes: 'sad' }, text: 'What would you want, then? If you could have anything.' },
  { who: 'agnes', face: 'sad', listen: { red: 'calm' }, text: 'I want him to feel it. What I felt, stood there with my face burning and the whole green laughing and him gone. I want him to know it, not say he does.' },
  { who: 'agnes', face: 'pout', listen: { red: 'shy' }, text: 'And I don’t know how that could ever be. So. Sheep.' },
];
const agnesAway = told => [[
  { who: 'agnes', face: 'calm', listen: { red: 'smile' }, text: told ? 'I keep thinking about what you told me. About asking for it. About the word. I don’t know, Rose. It’d have to be him that asked.' : 'Still here. The ewes don’t ask me anything. I like that in a ewe.' },
]][0];
// (trusting her enough, Red can tell her: what being Little Red means, and what makes it work)
const agnesTell = ctx => [
  { who: 'agnes', face: 'calm', listen: { red: 'shy' }, text: 'You’ve gone quiet. You’ve been quiet since spring, if I’m honest. Different. Not worse. As if you’d put something down.' },
  { choose: [
    { text: 'Tell her what being Little Red means.', face: 'shy', then: [
      { who: 'red', face: 'shy', listen: { agnes: 'surprised' }, text: 'I asked Mama for something. To be held to things again, the way I was when I was small. When I let things slide, or I’m wilful, she takes me in hand. Properly.' },
      { who: 'agnes', face: 'surprised', listen: { red: 'shy' }, text: 'Your mother— You asked her?' },
      { who: 'red', face: 'calm', listen: { agnes: 'surprised' }, text: 'That’s the whole of it: it’s asked for. Nobody does it to you. And there’s a word, mine, and if I say it, it stops, that moment, no questions. And the after matters as much as the rest. More, some days.' },
      { who: 'red', face: 'calm', listen: { agnes: 'calm' }, text: 'Then it’s done. Gone. Not hanging over you for weeks. It’s why I’ve been lighter.' },
      { who: 'agnes', face: 'calm', listen: { red: 'calm' }, text: 'Asked for. A word that stops it. And the after.' },
      { who: 'agnes', face: 'calm', listen: { red: 'shy' }, text: 'Thank you for telling me, Rose. I’ll not say a word to anyone. I’m only… thinking.' },
      { run: ctx.tell } ] },
    { text: 'Not yet.', face: 'shy', then: [{ who: 'red', face: 'shy', listen: { agnes: 'calm' }, text: 'It’s just spring. I’ll tell you one day.' }, { who: 'agnes', face: 'smile', listen: { red: 'shy' }, text: 'I’ll hold you to that.' }] },
  ] },
];
// (Georgie, ashamed: Red puts it to him plainly, or leaves it)
const georgieAshamed = ctx => [
  { who: 'georgie', face: 'shy', listen: { red: 'calm' }, text: 'Rose. You’ll have heard what I am, then. Everyone has.' },
  { who: 'georgie', face: 'sad', listen: { red: 'calm' }, text: 'I wasn’t thinking. The fiddle and the lanterns and her laughing, and I just— and then Tom, and I ran. I ran, Rose. I left her there. That’s worse than the kiss and I know it.' },
  { choose: [
    { text: 'Put it to him plainly.', face: 'calm', then: [
      { who: 'red', face: 'calm', listen: { georgie: 'shy' }, text: 'She doesn’t want sorry, Georgie. She wants you to feel it the way she did. Stood there, small, with everyone looking.' },
      { who: 'red', face: 'calm', listen: { georgie: 'surprised' }, text: 'If you meant it, you could ask her to hold you to account. Ask, mind: it’s yours to ask and hers to say. You’d have a word that stops it. And then it’s done, and put down.' },
      { run: ctx.put } ] },
    { text: 'Leave it for now.', face: 'shy', then: [{ who: 'red', face: 'shy', listen: { georgie: 'sad' }, text: 'Give her time, Georgie.' }] },
  ] },
];
const georgieChooses = yes => yes ? [
  { who: 'georgie', face: 'shy', listen: { red: 'calm' }, text: 'Hold me to account. Agnes.' },
  { who: 'georgie', face: 'calm', listen: { red: 'calm' }, text: 'That night on the watch, when I walked you home, you didn’t laugh at me once. I think I can do this if you’re there when I ask her. Will you come?' },
] : [
  { who: 'georgie', face: 'sad', listen: { red: 'calm' }, text: 'I can’t, Rose. I can’t ask her for that. I’ll say sorry. Properly, to her face, not through a door. That’s what I’ve got.' },
];
const georgieSorry = () => [
  { who: 'georgie', face: 'sad', listen: { agnes: 'pout' }, text: 'Agnes. I’m sorry. For the kiss, that you never asked for. For running. Most for running.' },
  { who: 'agnes', face: 'calm', listen: { georgie: 'sad' }, text: 'Thank you, Georgie.' },
  { text: 'She means it, and it’s civil, and it isn’t enough, and all three of them know it.' },
  { who: 'agnes', face: 'calm', listen: { red: 'shy' }, text: 'I’ll be back at the well tomorrow, Rose. I’ve hid long enough.' },
];
const agnesTerms = ctx => [
  { who: 'georgie', face: 'shy', listen: { agnes: 'surprised' }, text: 'Agnes. I’m not here to say sorry. I’m here to ask you to hold me to account for it. If you will.' },
  { who: 'agnes', face: 'surprised', listen: { georgie: 'shy' }, text: 'Hold you…' },
  { who: 'agnes', face: 'calm', listen: { red: 'calm' }, text: 'Like Rose told me. Asked for.' },
  { who: 'red', face: 'calm', listen: { agnes: 'calm' }, text: 'Then we’ll set it, the three of us, so nobody’s guessing. Where, first. Not the village.' },
  { who: 'agnes', face: 'calm', listen: { red: 'calm' }, text: 'The wood. Off the herb path, by the fallen tree. Nobody comes there but you and your grandmother.' },
  { who: 'red', face: 'calm', listen: { georgie: 'shy' }, text: 'Tomorrow, after dinner. And you need a word, Georgie. Yours. You say it, it stops, then and there.' },
  { who: 'georgie', face: 'shy', listen: { red: 'calm' }, text: '…Millstone. It’s what I think of when I want to be still.' },
  { who: 'agnes', face: 'shy', listen: { red: 'shy' }, text: 'And you, Rose. Will you be there? I don’t think I can, on my own. Not the first time.' },
  { choose: [
    { text: 'I’ll be there.', face: 'calm', then: [{ who: 'red', face: 'calm', listen: { agnes: 'shy' }, text: 'I’ll be there. Off to the side. You won’t be on your own.' }, { run: ctx.there }] },
    { text: 'It should be the two of you.', face: 'shy', then: [{ who: 'red', face: 'shy', listen: { agnes: 'shy' }, text: 'It should be just the two of you, I think. You’ll know what to do. Tell me after, if you want.' }, { run: ctx.notThere }] },
  ] },
];
const agnesWaiting = red => [{ who: 'agnes', face: 'shy', listen: { red: 'calm' }, text: red ? 'Tomorrow, after dinner. The fallen tree. I keep going hot and cold about it. You’ll come?' : 'Tomorrow, after dinner. I keep going hot and cold about it. I’ll tell you how it went.' }];
const woodBefore = () => [
  { text: 'Agnes and Georgie are standing a little way off the path, past the fallen tree, not looking at each other. Agnes has her father’s legget under her arm.' },
  { who: 'agnes', face: 'shy', listen: { red: 'calm' }, text: 'You came. Good. I nearly didn’t.' },
  { who: 'georgie', face: 'shy', listen: { red: 'calm' }, text: 'I nearly didn’t either.' },
  { who: 'red', face: 'calm', listen: { georgie: 'shy' }, text: 'Your word, Georgie?' },
  { who: 'georgie', face: 'calm', listen: { red: 'calm' }, text: 'Millstone.' },
  { who: 'red', face: 'calm', listen: { agnes: 'shy' }, text: 'Then I’ll be over there. It’s yours, the two of you.' },
];
// (the correction itself: Agnes's, at his asking. Hers is the hand, and the legget to finish)
const agnesGeorgie = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.2, pace: 1.1 });
  await S.wait(0.8);
  await S.say(M, 'I don’t know how to do this. I only know how it felt.', 'shy');
  await S.step([M, 'You kissed me in front of the whole green, Georgie Dunn.', 'stern'], 8);
  await S.step([R, 'I know— I know I did—'], 4);
  await S.step([M, 'And I never asked you to.', 'stern'], 8);
  await S.gesture('skirt'); await S.wait(0.5);
  S.set({ strength: 1.4, pace: 1.3 });
  await S.say(M, 'Everyone saw me. So.', 'stern');
  await S.step([M, 'I stood there with my face on fire, and the lads roaring, and you’d gone.', 'stern'], 10);
  await S.step([R, 'Agnes— ow— I’m sorry I ran—'], 5);
  await S.step([M, 'You left me standing there!', 'stern'], 10);
  S.set({ implement: 'legget', strength: 1.3, pace: 0.9 });
  await S.say(M, 'Dad’s legget. Six. Then it’s done.', 'stern');
  await S.after([R, 'One—'], 1); await S.after([R, 'Two—'], 1); await S.after([R, 'Three—'], 1);
  await S.after([R, 'Four— I’m sorry—'], 1); await S.after([R, 'Five—'], 1); await S.after([R, 'Six.'], 1);
  await S.say(M, 'There. That’s it. That’s all of it.', 'calm');
};
const agnesGeorgieAfter = rose => [
  { text: rose ? 'He said it, and it stopped, there and then, and she had hold of him before the word was finished.' : 'After, they sit on the trunk together, his head on her shoulder, her arm round him, both of them crying and pretending not to.' },
  { who: 'georgie', face: 'teary', listen: { agnes: 'calm' }, text: 'I felt it. I did. I’m sorry, Agnes.' },
  { who: 'agnes', face: 'teary', listen: { georgie: 'teary' }, text: 'I know. I know you are, now. It’s done. It’s put down.' },
];
// (and before she goes: a word to Georgie, if she'll give it, and Agnes tells him why she can; or she goes quietly. ctx.tell())
const georgieCommiserate = ctx => [
  { choose: [
    { text: 'Georgie… for what it’s worth, I know how that feels.', face: 'shy', then: [{ run: ctx.tell },
      { who: 'georgie', face: 'teary', listen: { red: 'shy' }, text: 'You… what?' },
      { who: 'agnes', face: 'calm', listen: { georgie: 'teary' }, text: 'She does. It’s hers to tell, not mine, but she does. Better than you, Georgie Dunn.' },
      { who: 'red', face: 'shy', listen: { georgie: 'shy' }, text: 'Mama takes me in hand, when I’ve earned it. I asked her to. It helps, after. It does.' },
      { who: 'georgie', face: 'bashful', listen: { red: 'shy' }, text: 'Rose Ridley. And there was me thinking you’d laugh.' },
      { who: 'red', face: 'smile', listen: { georgie: 'bashful' }, text: 'Never at this.' }] },
    { text: 'Say nothing, and leave them be.', face: 'calm', then: [] },
  ] },
  { who: 'agnes', face: 'calm', listen: { red: 'smile' }, text: 'Go on, Rose. We’re all right. Thank you. I mean it.' },
];
// Georgie in the village, after Agnes has had him in hand, Red not having said she knows: something in how he sits, or stands, or won't;
// and her chance to say it now. (n: which time; ctx.tell())
const georgieHint = (n, ctx) => [
  [{ who: 'georgie', face: 'wince', listen: { red: 'calm' }, text: 'No, I’ll stand, thanks. I’ve been sat at the mill all morning.' }, { who: 'red', face: 'shy', thought: true, text: 'He hasn’t. He’s been at the well with Agnes since nine.' }],
  [{ who: 'georgie', face: 'bashful', listen: { red: 'calm' }, text: 'Don’t ask. Agnes and me had words, is all. Well. She had words.' }],
  [{ who: 'georgie', face: 'wince', listen: { red: 'calm' }, text: 'Careful how you clap a man on the back, Rose. Or anywhere, today.' }],
][n % 3].concat([{ choose: [
  { text: 'Georgie. I know how it feels. Truly.', face: 'shy', then: [{ run: ctx.tell },
    { who: 'georgie', face: 'surprised', listen: { red: 'shy' }, text: 'You do?' },
    { who: 'red', face: 'shy', listen: { georgie: 'surprised' }, text: 'Mama takes me in hand. I asked her to. So whatever Agnes gave you, I’ve had the like, and you’ll live.' },
    { who: 'georgie', face: 'bashful', listen: { red: 'shy' }, text: '…Huh. Well. That’s a comfort, somehow. Don’t tell Agnes I said so.' }] },
  { text: 'Say nothing.', face: 'calm', then: [{ who: 'red', face: 'calm', thought: true, text: 'Not today. It’s his, not mine.' }] },
] }]);
// The Thatchers at the door with her mother, as Red comes in for her dinner, after the fair: fond, as of her when she was small; and her
// mother, when they've gone, asks if she minds them knowing. (She doesn't. Shyly.)
const thatchersCall = () => [
  { who: 'thatcherWife', face: 'smile', listen: { red: 'shy' }, text: 'Here she is. Rose, love, you were a picture at the fair. I said to Maren, she walks like she did at six, all chin, and twice as pleased with herself.' },
  { who: 'thatcher', face: 'smile', listen: { red: 'shy' }, text: 'She’s settled. That’s what it is. Like our Agnes, lately. Something’s settled.' },
  { who: 'thatcherWife', face: 'calm', listen: { mother: 'smile' }, text: 'Well, we’ll leave you to your dinner. Maren. Rose.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'They’ve eyes, the Thatchers. And they’re fond of you, and they’ve Agnes, who they know is happier than she was. Would you mind them knowing, love? Why?' },
  { who: 'red', face: 'shy', listen: { mother: 'calm' }, text: '…No, Mama. I wouldn’t mind. Not them.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Then I’ll save you the blushes, and have a word with Mistress Thatcher next time I see her. You needn’t say a thing.' },
  { who: 'red', face: 'smile', thought: true, text: 'It’ll be nice for Mama to have someone to talk to about it, besides me. I have so many.' },
];
const woodLeaving = () => 'Asked for, a word, and the after. They’ll be all right.';
// (Agnes, back at the well, the first time after: yes (and whether Red was there, or meant to be and wasn't), or no)
const agnesBack = (how, missed, meant) => how === 'yes' ? [
  { who: 'agnes', face: 'smile', listen: { red: 'smile' }, text: missed ? 'We waited for you a while, by the fallen tree. Then we didn’t. It’s done, Rose. It’s put down. He walked me home after, and he didn’t run.' : meant ? 'Back at the well. Everything’s just the same and nothing is. He walked me home after. Thank you, Rose.' : 'It’s done. You were right: just the two of us. He walked me home after, and he didn’t run.' },
  { who: 'agnes', face: 'cheeky', listen: { red: 'shy' }, text: 'And now I know your secret, I’ll have yours out of you about Peter Fowler. Don’t think I won’t.' },
] : [
  { who: 'agnes', face: 'calm', listen: { red: 'calm' }, text: 'Back at the well. Georgie nods to me, and I nod back. It’s quieter than it was. Maybe that’s all it’ll ever be.' },
];
// The fair's night (js/evening.js): her mother, in from her stall, and the dress. kind: 'clean' | 'marked' (a little: ctx.own, Red owns it)
// | 'spoilt'.
const fairHome = (kind, ctx) => kind === 'clean' ? [
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Well. Let me look at you.' },
  { who: 'red', face: 'shy', thought: true, text: 'She doesn’t say anything for a long moment. Just looks: the hem, the sleeves, the blue.' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'Not a mark on it. All day, through all of that. I’m proud of you, love. Truly.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: kind === 'spoilt' ? 'Rose. Come into the light.' : 'Well. Let me look at you.' },
  { choose: [
    { text: kind === 'spoilt' ? 'I know, Mama. I’m sorry. I spoiled it.' : 'There’s a mark on the hem, Mama. I’m sorry.', face: 'shy', then: [{ run: ctx.own }] },
    { text: 'It’s fine, Mama. It was a lovely day.', face: 'shy', then: [] },
  ] },
];
const fairOwned = () => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Hm. So there is. Thank you for telling me.' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'We’ll wash it and see to the hem in the morning, the two of us. It’ll come out. Now, bed: you’re asleep on your feet.' },
];
const fairFound = () => [
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Fine, is it. And what’s this, on the hem? And this?' },
  { who: 'red', face: 'wince', text: 'Mama—' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'You stood there and told me it was fine.' },
];
const dressCorrection = async (S, how) => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.35, pace: 1.3 });
  await S.wait(0.8);
  await S.say(M, 'A week of evenings, that dress. And the cloth kept back all those years.', 'stern');
  await S.step([M, 'I told you to mind it. Hooves and cinders, I said.'], 8);
  await S.step([R, 'I know, Mama—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.55, pace: 1.5 });
  if (how.hid) { await S.step([M, 'And then to stand there and tell me it was fine.'], 10); await S.step([R, 'I’m sorry! I didn’t want you to be sad—'], 4); }
  else await S.step([M, 'The quick way, every time. The quick way’s what spoils things.'], 10);
  await S.smacks(how.spoilt ? 8 : 6);
  await marenClose(S, how);
  await S.say(M, 'There. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const dressAfter = how => [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'Better?' },
  { who: 'red', face: 'teary', text: how.hid ? 'Better. I should have just said.' : 'Better. I’m sorry about the dress.' },
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'In the morning we’ll wash it, you and I, and mend what wants mending. Dresses can be mended. Now, bed.' },
];
const dayTalk = (how, day) => {
  const M = (face, text, red) => ({ who: 'mother', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, text }), out = [];
  out.push(how === 'yes' ? M('smile', 'Now, then. Peel, and tell me your day.', 'smile') : how === 'little' ? M('calm', 'Sit there and tell me about it, then, while I do these.', 'shy')
    : M('calm', day.owed ? 'Go on, then. Tell me your day.' : 'Supper’s long since eaten. Sit down and tell me your day.', 'shy'));
  if (day.noDinner) out.push(M('calm', 'You weren’t home for dinner. It sat on the board till I had to go back up.', 'shy'), R('shy', 'I’m sorry, Mama. I lost track of the time.'));
  return out;      // (then her day, told as she will, and what her mother's noticed asked about: js/report.js; then dayEnd)
};
// After her day's told: her mother's word on it (proud, if it was all as it should be), and what's next.
const dayEnd = (how, day) => {
  const M = (face, text, red) => ({ who: 'mother', face, listen: { red: red || 'calm' }, text }), R = (face, text) => ({ who: 'red', face, text }), out = [];
  const e = day.errand && ERRANDS[day.errand.id], st = day.errand && day.errand.state;
  const good = (!e || st === 'done' || st === 'carrying') && day.garden !== false && !day.noDinner && !day.owed && !day.late && !day.dare;
  if (good) out.push(M('tender', 'You’ve done well today, love. I’m proud of you. I mean it.', 'shy'));
  else if (!day.owed) out.push(M('calm', 'Well. Tomorrow’s another day.', 'shy'));
  if (day.gran) out.push(...granAsk(day.gran));      // (a while since she was up at her grandmother's)
  if (day.friends) out.push(...friendsOut());      // (time before the bell, and she's not seen them today)
  if (day.owed) out.push(M('stern', 'And what’s owed, you and I will see to after supper. Now go and wash your hands for it.', 'shy'), R('shy', 'Yes, Mama.'));      // (and it's closed: a wash, supper, and then it)
  else if (!day.late) out.push(M('calm', 'Supper in a little while. Wash your hands at the basin when you’re ready for it.'));
  else out.push(M('calm', 'Bed soon. It’s been a long day.'));
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
    // (asked for at breakfast: the mill run's hers today, so it's the list, and Red left to it)
    list: [
      { who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'There you are, love, and on the hour. I’ve the mill run to do, and Master Pennock’s in his bed, so it’s you and the list.' },
      { who: 'pennock', face: 'calm', listen: { red: 'calm' }, text: 'The trough, the boards, the oven raked, the racks cleared, tomorrow’s flour sifted, the sponge set, and the floor. I’ll be back by half past three.' },
      { who: 'red', face: 'calm', text: 'All of it, by then?' },
      { who: 'pennock', face: 'smile', listen: { red: 'shy' }, text: 'All of it, by then. You’ll manage. No dawdling at the window, mind: I’ll know.' },
    ],
    // (picked up at the counter: a head start for her, while she's still selling)
    picked: [
      { who: 'red', face: 'calm', thought: true, text: 'Her list’s chalked on the board by the door. The trough, the boards, the racks, the floor.' },
      { who: 'red', face: 'smile', thought: true, text: 'As much of it as I can before she’s done at the counter.' },
    ],
    waiting: [{ who: 'red', face: 'smile', thought: true, text: 'All done, and not a sound of her yet. I’ll sit by the oven where it’s warm, and wait.' }],
    pickedGood: [
      { who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Well! Look at this. You’ve had half my afternoon off me already. Bless you, Rose.' },
      { who: 'pennock', face: 'calm', listen: { red: 'smile' }, text: 'Off you go, love. I’ll finish. Take a bun for your trouble.' },
    ],
    pickedSome: [
      { who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: 'Every bit helps, love. Off you go: I’ll see to the rest.' },
    ],
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
      [{ who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'The swallows are back under the eaves. Grandad pretends he doesn’t count them every year.' },
        { who: 'red', face: 'smile', text: 'And you?' }, { who: 'peter', face: 'smile', text: 'Every year. Seven pairs. Don’t tell him.' }],
      [{ who: 'peter', face: 'pout', listen: { red: 'cheeky' }, text: 'Tom came by again yesterday. Same rhyme. I’ve started saying it along with him. It ruins it for him completely.' },
        { who: 'red', face: 'cheeky', text: 'Peter Fowler, that’s cruel.' }, { who: 'peter', face: 'smile', text: 'It’s the kindest thing I’ve ever done for Tom.' }],
      [{ who: 'peter', face: 'calm', listen: { red: 'shy' }, text: 'Sit a while, if you like. The nets go quicker with company.' },
        { who: 'red', face: 'smile', thought: true, text: 'We sit, and he mends a tear with quick, sure fingers, and neither of us says much. It doesn’t need saying.' }],
    ],
    again: [{ who: 'peter', face: 'smile', text: 'Back again. I’m glad.' }],
  },
  fowler: {
    first: [
      { who: 'fowler', face: 'calm', listen: { red: 'shy' }, text: 'Miss Rose. You’ll be wanting the boy, I suppose. Everybody does.' },
      { who: 'red', face: 'shy', text: 'Good day, Master Fowler.' },
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
// Passing the beech, a note in it (not yet looked for): what Peter said, at the meadow gate.
const beechPassing = () => 'The old beech. “A knot in it, at the height of your hand. I might leave you something.”';
// At the Fowlers', a note left in the beech that she hasn't read: he asks, shyly, if she's looked.
const peterAsksNote = () => [
  { who: 'peter', face: 'bashful', listen: { red: 'calm' }, text: 'Have you… been by the old beech today? At all?' },
  { who: 'red', face: 'shy', text: 'Not yet. Why?' },
  { who: 'peter', face: 'bashful', listen: { red: 'shy' }, text: 'No reason. Only, you might. Look, I mean. In the knot.' },
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
      { who: 'red', face: 'smile', thought: true, text: 'Our backs against the beech, under the carving, talking about nothing. The time goes by over our heads.' }],
    [{ who: 'peter', face: 'calm', listen: { red: 'calm' }, text: 'Do you remember when we carved it? You held the knife wrong and I had to bind your thumb with my handkerchief.' },
      { who: 'red', face: 'cheeky', text: 'I remember you cried more than I did.' }, { who: 'peter', face: 'bashful', text: 'It was a very good handkerchief.' }],
    [{ who: 'peter', face: 'concerned', listen: { red: 'calm' }, text: 'You’re quieter than you were. Not sad. Just… somewhere else, some of the time.' },
      { who: 'red', face: 'shy', thought: true, text: 'He notices everything. That’s the trouble with Peter.' }, { who: 'red', face: 'shy', text: 'I’m right here.' }],
  ];
  return owed.concat(talks[n % talks.length]);
};

// ── The inn (js/inn.js): the afternoon's work, Bess calling it from her chair (js/work.js); Mistress Abney's promise (js/promise.js).
WORK.inn = {
  // (asked for at breakfast: Mistress Abney out till seven, and Bess to run it from her chair)
  list: [
    { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'There you are, pet. I’m to Ashby for the brewer, and I’ll not be back before seven. Bess has the house.' },
    { who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'The carrier’s lot are in about five, wanting ale and stew. You’re her legs. She stays in that chair. Whatever she tells you.' },
    { who: 'bess', face: 'cheeky', listen: { abney: 'stern' }, text: 'I’ll be good, Mother. I’ll be a cushion with a face.' },
    { who: 'abney', face: 'calm', listen: { bess: 'cheeky' }, text: 'See you are. Seven, Miss Rose.' },
  ],
  // (offered on the day by Mistress Abney: an afternoon's tidying while she turns out the rooms upstairs; down again when the time's up)
  short: [
    { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'There you are, pet. I’ve the rooms upstairs to turn out, and they won’t turn themselves. Down here’s yours: the fire, the tables, the pots, the floor.' },
    { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'And there’s tea steeping on the bar for Bess, who’ll tell you she needs nothing. She’s lying.' },
    { who: 'bess', face: 'cheeky', listen: { abney: 'calm' }, text: 'I need nothing. I’ll tell her what to do, though. I’m very good at that, sitting down.' },
    { who: 'abney', face: 'stern', listen: { bess: 'cheeky' }, text: 'Two hours, Miss Rose. I’ll know what’s been done.' },
  ],
  pots: ['Scour them till you can see your face. Then a bit more: Mother can see a smear from the stairs.', 'cheeky'],
  tables: ['Wipe with the grain, not round and round. Round and round just moves it about.', 'calm'],
  fire: ['Two logs, crossed. Not three. Three and it roars, and then it sulks all evening.', 'calm'],
  bowls: ['A bowl and a spoon at each place, and the loaf on the board. They’ll tear it, they always tear it.', 'calm'],
  after: ['Leave the bench by the door: one of them always sleeps it off there. Mother charges him for the bench.', 'smile'],
  tea: ['Oh, you angel. Mother lets it stew till it’s black. This is how tea’s meant to be.', 'smile'],
  sweep: ['Into the corners. The corners are where the dirt hides, and where Mother looks first.', 'calm'],
  waiting: [{ who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'All done, and Mother not back. Sit down before you fall down. She’ll be in any minute, and she’ll want to see you sat.' }],
  // (the carrier's men: in at five, their orders called, their thanks)
  inNed: 'Evening, Bess! And who’s this, then? You’ve a new girl.',
  inBess: 'Rose Ridley, and you’ll be civil to her, Ned Hobb, or you’ll answer to me.',
  calls: { 'ned:ale': 'Ale here, miss! I’ve a road’s worth of dust in me.', 'amos:stew': 'Is there stew, love? I could eat the horse, and he’s a good horse.', 'kit:ale': 'Ale, if you please. And one for the horse, he says.',
    'ned:stew': 'Stew now, miss! And none of that ladle-shaking, a proper bowl.', 'amos:ale': 'Another ale for an old man, if you’re passing, pet.', 'kit:stew': 'Is there more of that stew? It smells like home.' },
  hint: { ale: 'Ale’s from the second barrel, love, not the first. Jugs are by it.', stew: 'Stew’s in the pot on the hook. Bowls are on their table.' },
  thanks: ['There’s a girl.', 'Bless you, pet.', 'Ta, miss.', 'Now that’s a bowl.', 'You’re quicker than Bess ever was.', 'Smells like my mother’s.', 'Here’s a farthing for your trouble. Don’t tell Mistress Abney.'],
  // (old Amos, the evening's third order: he knew him)
  robert: ['That’s Rob Shafto’s girl by the fire, isn’t it? We all liked Rob. Bad business, that bend by the river.', 'Rob Shafto. Her husband. I didn’t know they’d known him. Of course they knew him: he drove the cart.'],
  // (a man kept waiting too long: Bess up out of her chair to see to it herself)
  up: 'Oh, sit down yourself, Rose, I’ll get it. I’m not made of glass.',
  upRed: ['She’s on her feet. Mistress Abney said, whatever she tells me. She’s on her feet.', 'Again. She’s up again, and it’s because I was slow.'],
  // (Mistress Abney back: Bess up the once, and let go)
  endOnce: [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Amos says Bess was up the once. Once. I’ll not make a song of once.' }],
  end: [
    { who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'That’ll do, Miss Rose. You work like your mother: quiet, and properly. I don’t say that to everyone.' },
    { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'She doesn’t say it to me.' },
    { who: 'abney', face: 'stern', text: 'You’re not supposed to be doing anything.' },
  ],
  // (Bess's story: one piece a shift, sat with her in a lull)
  bess: [
    [{ who: 'bess', face: 'smile', listen: { red: 'calm' }, text: 'Sit, sit. Mother’s out of the room, and nobody’s wanting anything. We’ve the place to ourselves.' },
      { who: 'red', face: 'shy', text: 'Should you be in charge, Bess? Your mother said—' },
      { who: 'bess', face: 'cheeky', listen: { red: 'shy' }, text: 'Mother said I’m not to stand. She never said I’m not to give orders.' },
      { who: 'bess', face: 'calm', listen: { red: 'smile' }, text: 'Oh. Feel that? It kicks when there’s work being done that it can’t help with. It’ll be an Abney, this one.' }],
    [{ who: 'bess', face: 'smile', listen: { red: 'calm' }, text: 'You used to hide under that table, you know. When your mother came in for you of an evening. Six years old, and you’d sooner be under a table at the Wheatsheaf than go home to bed.' },
      { who: 'red', face: 'shy', text: 'I don’t remember that.' },
      { who: 'bess', face: 'smile', listen: { red: 'shy' }, text: 'I do. I was fourteen, and I thought you were the funniest thing in the village.' },
      { who: 'bess', face: 'calm', listen: { red: 'calm' }, text: 'They’ve all gone now. Jack’s at the mill in Ashby, Meg married over the hill, Ned went for a soldier. I was the last to go, and the first back.' }],
    [{ who: 'bess', face: 'calm', listen: { red: 'calm' }, text: 'He drove the carrier’s cart, my Robert. Thursdays he’d come in that door shaking the rain off, and before his coat was off he’d be calling for Curly Locks.' },
      { who: 'red', face: 'smile', text: 'Curly Locks?' },
      { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'My hair curled, then. He said I’d never wash a dish again, once I was his. He lied about that.' },
      { who: 'red', face: 'calm', thought: true, text: 'She laughs, and it isn’t a sad laugh. Not only.' },
      { who: 'bess', face: 'calm', listen: { red: 'shy' }, text: 'Ice on the river road, last winter. I found out about this one a month after. Mother thinks I’m grieving myself into the grave. I’m not. It’s the best thing he ever left me.' }],
    [{ who: 'bess', face: 'cheeky', listen: { red: 'calm' }, text: 'Mother’s sent for a woman from Ashby for when it comes. As if I’ll need more than her and a kettle.' },
      { who: 'red', face: 'shy', text: 'Are you frightened?' },
      { who: 'bess', face: 'calm', listen: { red: 'shy' }, text: 'Of what? Of something every woman in this village has done?' },
      { who: 'red', face: 'shy', thought: true, text: 'She looks at the fire a little too long before she says it.' }],
    [{ who: 'bess', face: 'concerned', listen: { red: 'calm' }, text: 'You’ve changed, you know. You used to decide everything for everyone, like a little mother. Now you let things be decided.' },
      { who: 'red', face: 'shy', text: 'Is that bad?' },
      { who: 'bess', face: 'smile', listen: { red: 'shy' }, text: 'It suits you. Don’t ask me how I noticed. I sit; I notice.' }],
    [{ who: 'red', face: 'calm', thought: true, text: 'Bess hums to the baby while I sit with her. Bye, baby bunting, Daddy’s gone a-hunting. She stops after the second line, every time.' }],
  ],
  bessAgain: [
    [{ who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'Sit a minute. My feet are the size of loaves, and nobody will let me look at them.' }],
    [{ who: 'bess', face: 'cheeky', listen: { red: 'calm' }, text: 'Ned’s been sweet on Agnes Thatcher’s mother for twenty years. Don’t tell anyone. Tell everyone.' }],
  ],
};
// Bess, in a lull, with nobody waiting and her mother out of the room: will Red sit a minute? (ctx.yes(): she does, on the bench nearest)
const bessOffer = ctx => [
  { who: 'bess', face: 'smile', listen: { red: 'calm' }, text: 'Rose. Sit a minute? The bench is right there, and I’m sick of my own company.' },
  { choose: [
    { text: 'Just for a minute, then.', face: 'smile', then: [{ run: ctx.yes }] },
    { text: 'I’d better get on, Bess.', face: 'shy', then: [{ who: 'bess', face: 'cheeky', listen: { red: 'shy' }, text: 'Go on, then, you diligent thing. I’ll be here.' }] },
  ] },
];
// (sat with her: another piece of it, or she remembers she should get on)
const bessStay = ctx => [{ choose: [
  { text: 'Go on. Tell me more.', face: 'smile', then: [{ run: ctx.yes }] },
  { text: 'I should get on, Bess. There’s work waiting.', face: 'shy', then: [{ who: 'bess', face: 'smile', listen: { red: 'shy' }, text: 'She will. Go on. And thank you for sitting.' }] },
] }];
// Mistress Abney down from the rooms, her afternoon looked over: more than half of it done; half; less, idle (and, once Red's confided in her,
// naughty: taken in hand). left: what's still to do.
const abneyShortGood = () => [
  { who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'Well. That’s the most of it, and done properly. Thank you, pet. Off home with you.' },
  { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'She means she’s pleased. That’s how she sounds pleased.' },
];
const abneyShortHalf = () => [
  { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Half. I asked for an afternoon, and I’ve half of one. Well. It’s more than I had. Off you go.' },
];
const abneyIdled = (left, confided) => [
  { who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'Two hours, and ' + (left[0] || 'the work') + (left.length > 1 ? ', and ' + (NUM[left.length - 1] || 'more') + ' more besides,' : '') + ' still not touched. I don’t pay girls to warm my benches.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mistress Abney.' },
].concat(confided ? [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'You asked me to hold you to things, pet, as your mother would. Idle hands, then. Come here.' }]
  : [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'I’ll not ask you again in a hurry. Go on home.' }, { who: 'red', face: 'wince', thought: true, text: 'Mistress Pennock would have laughed it off. Mistress Abney doesn’t laugh things off.' }]);
const abneyIdledRed = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.35, pace: 1.3 });
  await S.wait(0.6);
  await S.say(M, 'When I leave you a room to see to, I need to know it’ll be seen to.', 'stern');
  await S.step([M, 'Not half of it. Not when you’ve had a sit and a chat. Seen to.'], 8);
  await S.step([R, 'Yes, Mistress Abney—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.6, pace: 1.5 });
  await S.step([M, 'You work like your mother when you’ve a mind to. So have a mind to.'], 10);
  await S.step([R, 'I will— I will—'], 4);
  await S.smacks(6);
  await S.say(M, 'There. Done. Up you get.', 'calm');
  await S.wait(1.0);
};
// Mistress Abney back from Ashby to an evening not seen to: the list not done (left), or Bess on her feet (up, times). confided: she's to
// treat Red as her mother would.
const abneyShort = (left, confided, up) => [
  up >= 2 ? { who: 'abney', face: 'stern', listen: { red: 'shy' }, text: 'Bess was on her feet. ' + (up > 2 ? (NUM[up] || 'many')[0].toUpperCase() + (NUM[up] || 'many').slice(1) + ' times' : 'Twice') + ', Amos says, and the men left waiting.' }
    : { who: 'abney', face: 'stern', listen: { red: 'shy' }, text: (left[0] || 'the work')[0].toUpperCase() + (left[0] || 'the work').slice(1) + (left.length > 1 ? ', and more besides,' : '') + ' not done, and me back at seven as I said.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mistress Abney. I couldn’t keep up.' },
].concat(confided ? [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'You asked me to hold you to things, pet, as your mother would. So I shall. Come here.' }]
  : [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Then you’ll keep up next time. I can’t have her lifting pots. Not now.' },
    { who: 'red', face: 'wince', thought: true, text: 'She isn’t angry. She’s frightened. That’s worse.' }]);
const abneyShortRed = async S => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.35, pace: 1.3 });
  await S.wait(0.6);
  await S.say(M, 'When I leave you with my daughter, I need to know she’ll stay sat.', 'stern');
  await S.step([M, 'Not up and down after the men because you dawdled at the barrels.'], 8);
  await S.step([R, 'Yes, Mistress Abney—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.6, pace: 1.5 });
  await S.step([M, 'She’s all I have left at home, pet. Her and what she’s carrying.'], 10);
  await S.step([R, 'I know— I’m sorry—'], 4);
  await S.smacks(6);
  await S.say(M, 'There. Done. Up you get.', 'calm');
  await S.wait(1.0);
};
const abneyShortAfter = r => r && r.rose ? [
  { who: 'abney', face: 'concerned', listen: { red: 'shy' }, text: 'Hush, pet. It’s stopped. Sit by Bess a minute.' },
] : [
  { who: 'abney', face: 'calm', listen: { red: 'teary' }, text: 'Now go and sit with her a minute. She’ll want to tell you it wasn’t your fault.' },
  { who: 'bess', face: 'smile', listen: { red: 'teary' }, text: 'It wasn’t your fault.' },
  { who: 'abney', face: 'stern', listen: { bess: 'smile' }, text: 'It was, a little.' },
];
const abneyIdle = () => [{ who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. Bess is by the fire, if you’ve come to see her. Don’t let her get up.' }];
// The asking. ctx: { yes() }
const abneyAsks = ctx => [
  { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. A favour, and I don’t ask them lightly.' },
  { who: 'abney', face: 'concerned', listen: { red: 'calm' }, text: 'I’m to the market town tomorrow with the carrier: there’s business there I can’t send anyone to. Bess mustn’t be alone, so near her time. Will you come at six, and sit with her till I’m back? Nine, at the latest.' },
  { choose: [
    { text: 'Of course, Mistress Abney. I’ll be here at six.', face: 'smile', then: [{ run: ctx.yes },
      { who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'Six. I’ll hold you to that, pet. I hold everyone to what they say.' },
      { who: 'red', face: 'shy', listen: { abney: 'calm' }, text: 'Only… Mama has me home by nine. It’s my hour.' },
      { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'And I’ll be back by nine, or near it, and I’ll walk you to your door myself and square it with her. But you tell her too, mind. It’s yours to tell.' }] },
    { text: 'I can’t tomorrow, Mistress Abney. I’m sorry.', face: 'shy', then: [
      { who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Then you can’t, and you’ve said so honestly. I’ll manage. I may ask you another day.' }] },
  ] },
];
// Told her mother, at dinner or supper (js/report.js): her mother's word on it, and Master William told, so he knows she's about after nine.
const promiseToldMama = () => [
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Did she. Then you’ll go, and you’ll stay with Bess till her mother’s back, however late that is.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Your hour’s lifted for it, that night. I’ll have a word with Master William, so he knows you’re about after nine, and sees you home safe if she’s held up.' },
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
  { who: 'red', face: 'calm', thought: true, text: 'Bess talks about the babe, and sometimes about Robert. I talk about the wood, and not other things. The fire does the rest.' },
  { who: 'bess', face: 'concerned', listen: { red: 'shy' }, text: 'You’re different lately. Not worse. Like someone who’s put something down that was heavy.' },
  { who: 'red', face: 'shy', thought: true, text: 'Everyone keeps noticing. I didn’t know it showed.' },
];
const abneyBack = () => [
  { who: 'abney', face: 'smile', listen: { red: 'smile' }, text: 'Still here. Both of you, and the fire in, and nothing burnt. Thank you, Miss Rose. That was a promise kept.' },
  { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Now: it’s past the bell, and I’ll not have William Dunn walking you home like a stray. I’ll walk you myself, and tell your mother why you’re late.' },
];
// Home, walked there by Mistress Abney: she comes in with her, tells her mother (if Red hadn't) and how she did, and owns the hour. (told:
// Red told her mother of it herself, beforehand)
const abneyHome = told => [
  { who: 'abney', face: 'smile', listen: { mother: 'surprised' }, text: 'Evening, Mistress Ridley. I’ve brought your Rose home, and the hour’s my doing, not hers, so don’t be hard on her for it.' },
].concat(told ? [
  { who: 'mother', face: 'smile', listen: { abney: 'smile' }, text: 'She told me she’d promised you. I’m glad she kept to it.' },
] : [
  { who: 'abney', face: 'calm', listen: { mother: 'surprised' }, text: 'She sat with my Bess tonight, while I was at the market. Promised me she would, and I don’t suppose she said a word of it to you.' },
  { who: 'mother', face: 'surprised', listen: { red: 'shy' }, text: 'She did not. Did she, now.' },
], [
  { who: 'abney', face: 'smile', listen: { mother: 'smile' }, text: 'Kept the fire in, kept Bess’s feet up, made her a posset, and never once looked at the door. Bess was easier than I’ve seen her all week. She did well, Maren. Better than well.' },
  { who: 'abney', face: 'calm', listen: { mother: 'smile' }, text: 'I’m sorry to keep her so late. The carrier dawdled, as the carrier does.' },
  { who: 'mother', face: 'smile', listen: { abney: 'smile' }, text: 'Don’t be sorry. That’s what a promise is for. Thank you for bringing her to the door.' },
  { who: 'abney', face: 'smile', listen: { red: 'shy' }, text: 'Goodnight, then. Goodnight, Rose. And thank you.' },
  { who: 'red', face: 'shy', listen: { abney: 'smile' }, text: 'Goodnight, Mistress Abney.' },
]);
// (and then her day, stood by the hearth: the hour's too late for supper at the table)
const excusedDay = () => [
  { who: 'mother', face: 'tender', listen: { red: 'shy' }, text: 'Well. Look at you. Sat with Bess all evening, and kept your word to the minute.' },
  { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'It’s too late to sit down to supper. There’s bread and cheese when you want it. But tell me the rest of your day first, before you’re asleep on your feet.' },
];
const excusedEnd = owed => owed ? [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'And what’s owed from today, late or not, we’ll see to now, before bed. Tonight’s good doesn’t undo the rest.' },
  { who: 'red', face: 'shy', text: 'Yes, Mama.' },
] : [{ who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Bed, love. You’ve earned it.' }];
// A promise broken: the next evening, her mother's heard.
const promiseFoundOut = () => [
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Mistress Abney had a word with me today.' },
  { who: 'red', face: 'wince', text: 'Mama…' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'She came home from the market at nine and found Bess on her own by the fire. Near her time. Alone. Because you’d promised, and then you hadn’t come.' },
];
const promiseCorrection = async (S, how) => {
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
  await marenClose(S, how);
  await S.say(M, 'There. It’s done. Tomorrow you go to the Wheatsheaf, and you say sorry to them both.', 'calm');
  await S.wait(1.2);
};
// The wood after dusk: her mother's correction for it, and after.
const woodCorrection = async (S, how) => {
  const M = 'corrector', R = 'subject';
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.45, pace: 1.4 });
  await S.wait(0.8);
  await S.say(M, 'Out of the wood before the light goes. Say it.', 'stern');
  await S.say(R, 'Out of the wood before the light goes.');
  await S.step([M, 'You know what’s in there after dark. Or rather you don’t, and neither do I.'], 8);
  await S.step([R, 'I know, Mama—'], 4);
  await S.gesture('skirt'); await S.wait(0.4);
  S.set({ strength: 1.65, pace: 1.6 });
  await S.step([M, 'I stood on that step and watched the edge of the trees, and the light going, and you not coming.'], 10);
  await S.smacks(8);
  await marenClose(S, how);
  await S.say(M, 'There. It’s done. Up you get.', 'calm');
  await S.wait(1.2);
};
const woodAfter = () => [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'Come here. Out before dusk, from now on. Your grandmother would say the same.' },
  { who: 'red', face: 'teary', text: 'She would. She’d say it twice.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'She would. Now, bed.' },
];
const promiseAfter = () => [
  { who: 'mother', face: 'calm', listen: { red: 'teary' }, text: 'Come here. There. A promise kept is worth more than you know. You’ll learn it.' },
  { who: 'red', face: 'teary', text: 'I’ll go first thing. I will.' },
];

// Mistress Pennock in her bakery, any other time.
const pennockIdle = () => [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Mind the oven, love. And don’t touch the board.' }];
// Her mother, any other time: a word, by the time of day. (part: the calendar's)
// ── Her mother in the day (js/chores.js's marenTalk). An errand still to do: a reminder (late: not too late).
const marenReminds = (e, by, late, told) => late ? [
  { run: told },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'You were to ' + e.todo + ', Rose. It’s too late for it now. I had to manage without.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mama.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Don’t forget, you’re to ' + e.todo + (e.mind ? '. ' + e.mind : ', by ' + aloud(by) + '.') },
  { who: 'red', face: 'smile', text: 'I won’t, Mama.' },
];
// Bo Peep, bringing the flock in at five (js/flock.js): eighteen, and young for it; she looks up to Rose. A word on the way in (day: which);
// the evening they scatter, running to Red for help (ctx.yes()); and after, all in.
const boHello = day => {
  const B = (face, text, red) => ({ who: 'bo', face, listen: { red: red || 'smile' }, text }), R = (face, text) => ({ who: 'red', face, text });
  const talks = [
    [B('smile', 'Rose! Look, they’re all walking in a line tonight. Like soldiers. Grandad says it’s because they’re tired, but I think it’s me.'), R('smile', 'It’s you, Bo.'), B('smile', 'It’s a little bit me.')],
    [B('shy', 'Do you think I’m too old for the ribbon on the crook? Agnes says I am.', 'calm'), R('calm', 'I think the sheep like it.'), B('smile', 'They do. The brown one follows it.')],
    [B('calm', 'Grandad’s leg’s bad again. He says it’s the weather. It’s always the weather, with Grandad.', 'calm'), R('calm', 'Give him my love.'), B('smile', 'He’ll pretend not to be pleased. He will be, though.')],
    [B('smile', 'I want to be like you, when I’m nineteen. Everyone says “Rose is a good girl” in the special voice.', 'shy'), R('shy', 'They don’t say it in a special voice.'), B('cheeky', 'They do. I’ve been practising it.', 'smile')],
    [B('calm', 'Nine in, nine out, nine in again. I count them every time. I’m always afraid it’ll be eight.', 'calm'), R('smile', 'It never is.'), B('smile', 'Not yet.')],
  ];
  return talks[((day % talks.length) + talks.length) % talks.length];
};
const boHelp = ctx => [
  { who: 'bo', face: 'wince', listen: { red: 'surprised' }, text: 'Rose! Oh, Rose, they won’t mind me. Something spooked the brown one, and then they all went, and they’re everywhere, and Grandad will say I’m too young for it…' },
  { choose: [
    { text: 'Hush, Bo. I’ll help. You take the ones by the gate.', face: 'smile', then: [{ run: ctx.yes }, { who: 'bo', face: 'smile', listen: { red: 'smile' }, text: 'Oh, thank you! Just get near them. They know they’re in the wrong: they’ll go.' }] },
    { text: 'I can’t, Bo. I’m sorry. I’m wanted.', face: 'shy', then: [{ who: 'bo', face: 'shy', listen: { red: 'shy' }, text: 'No. No, of course. I’ll manage. I always manage. Mostly.' }] },
  ] },
];
const boThanks = day => [
  { who: 'bo', face: 'smile', listen: { red: 'smile' }, text: 'Nine! All nine. I counted twice. Oh, Rose, you’re the best person in the whole village.' },
  { who: 'red', face: 'smile', text: 'They’d have come for you in the end, Bo.' },
  { who: 'bo', face: 'smile', listen: { red: 'smile' }, text: day % 2 ? 'I shan’t tell Grandad. Not about the scattering. Only that you helped.' : 'When I’m nineteen I’m going to be exactly like you. Except better at sheep.' },
];
// At her grandmother's door: she knocks, and her grandmother calls her in from inside (as in the tale).
const granCallsIn = () => [
  { who: 'gran', text: 'Who’s that knocking?' },
  { who: 'red', face: 'smile', text: 'It’s me, Grandmother.' },
  { who: 'gran', text: 'Then lift the latch, my love, and come in. I’m too comfortable to get up.' },
];
// Bess on her bench by the inn door: come and sit (ctx.sit(): she does). Sitting, they talk; not, no harm done.
const bessInvite = ctx => [
  { who: 'bess', face: 'smile', listen: { red: 'smile' }, text: 'Miss Rose. Come and sit a minute?' },
  { choose: [
    { text: 'Sit beside her.', face: 'smile', then: [{ run: ctx.sit }] },
    { text: 'I can’t stop, Bess. Another time.', face: 'shy', then: [{ who: 'bess', face: 'calm', listen: { red: 'shy' }, text: 'Another time, then. I’ll be here. I’m always here.' }] },
  ] },
];
// After nine, at the door with supper still to come: her mother, gently.
const curfewNudge = () => [
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Rose. It’s gone nine, love. You know where you’re to be after nine.' },
  { who: 'red', face: 'shy', text: 'I know, Mama. I wasn’t going far.' },
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Not tonight you’re not. Wash your hands. Supper’s near done.' },
];
// Agnes Thatcher at the well, while Red fills the little butt (n: the how-many'th time, from 0): the village's news, as Agnes has it.
const agnesWell = n => {
  const A = (face, text, red) => ({ who: 'agnes', face, listen: { red: red || 'smile' }, text }), R = (face, text) => ({ who: 'red', face, text });
  const talks = [
    [A('smile', 'Rose! Here, I’ll wind, you hold. No? Suit yourself, then: I’ll talk instead, and you can wind.'), R('smile', 'You always talk instead, Agnes.'),
      A('cheeky', 'Georgie’s written me another. A poem. He’s found something to rhyme with Thatcher.', 'cheeky'), R('cheeky', 'What?'), A('smile', '“Catch her.” I’ll let him think about whether that’s romantic.')],
    [A('calm', 'Your mother’s butt again? You’re a good daughter. I’m a good daughter too, mostly, when anyone’s looking.', 'smile'), R('smile', 'And when they aren’t?'),
      A('cheeky', 'Then I’m at the well, talking to you.', 'cheeky'), A('calm', 'Mother says there’s been a stranger on the wood road. Tall, and very polite. She says polite like it’s a thing you catch.', 'calm')],
    [A('smile', 'Two pails in and you’ve not said a word. Is it Peter?', 'shy'), R('shy', 'It is not Peter.'), A('cheeky', 'It’s a little bit Peter.', 'shy'), R('shy', 'Wind your own bucket, Agnes.'),
      A('smile', 'There. That’s the Rose I know.')],
    [A('calm', 'Ten, the bell says, and ten, Mother says. The bell and Mother: the only two things in this village that agree.', 'calm'), R('pout', 'Mine says nine. Still.'),
      A('smile', 'You’re Little Red, love. They’ll keep you nine till you’re married.', 'pout'), R('cheeky', 'Then I’ll marry someone who keeps late hours.')],
    [A('cheeky', 'Did you hear Tom rang the bell in broad day? Or someone did. Mother says it was Tom. Mother says everything’s Tom.', 'cheeky'), R('cheeky', 'Sometimes it is Tom.'),
      A('smile', 'Mostly it’s Tom.')],
    [A('calm', 'Bo Peep lost three of them in the Hallorans’ beans last week. She cried, and then she laughed, and then the beans were gone.', 'smile'), R('smile', 'Poor Bo.'),
      A('smile', 'Poor beans. She’s sweet on you, you know. Not like that: like a little sister. She copies how you do your hair.', 'shy')],
  ];
  return talks[n % talks.length];
};
// An errand that couldn't be done late (the Dunns' pie, Master William gone out): her mother, with the basket and what's still in it.
const marenMissed = (e, ctx) => [
  { run: ctx.told },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'The pie’s still in the basket, Rose. He’ll have gone out to the bell an hour since.' },
  { who: 'red', face: 'shy', text: 'I’m sorry, Mama. I left it too late.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Well. We’ll have it ourselves, and I’ll bake him another. Don’t make me bake twice again.' },
];
// How it went, an errand with nothing to bring home (ctx.told()): hers to say.
const marenAsks = (e, ctx) => [
  { who: 'mother', face: 'smile', listen: { red: 'calm' }, text: 'How did you get on with ' + e.it + '?' },
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
// (only the flowers left, and the butt dry: the water's what's wanted)
const marenGardenDry = () => [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'My flowers want water, and the butt’s dry. You know where the well is.' }];
const marenSupper = () => [{ who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Be home for supper, mind. Six o’clock.' }];
const marenIdle = part => ({
  morning: [{ who: 'mother', face: 'smile', text: 'The garden won’t weed itself, love.' }],
  afternoon: [{ who: 'mother', face: 'calm', text: 'Back already? There’s bread on the board if you want it.' }],
  evening: [{ who: 'mother', face: 'calm', text: 'Supper soon. Wash your hands.' }],
  dusk: [{ who: 'mother', face: 'calm', text: 'Lamps soon. Are you in for the night?' }],
  night: [{ who: 'mother', face: 'smile', text: 'Bed, Little Red. It’s late.' }],
  dawn: [{ who: 'mother', face: 'surprised', text: 'Up before the birds? Who are you, and what have you done with my daughter?' }],
})[part] || [{ who: 'mother', face: 'calm', text: 'Yes, love?' }];

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
const TRUST_WHO = { hulda: 'Grandmother', peter: 'Peter', fowler: 'Master Fowler', tom: 'Tom', smith: 'Master Ferrier', pennock: 'Mistress Pennock', baker: 'Master Pennock', abney: 'Mistress Abney', abneyDaughter: 'Bess', bess: 'Bess', agnes: 'Agnes', georgie: 'Georgie', willie: 'Master William', holt: 'Holt', bo: 'Bo' };
const villagerTrust = (who, t, open) => {
  const n = TRUST_WHO[who] || who;
  const text = who === 'bo' && t >= 2 ? (t >= 3 ? 'Bo thinks the world of her, and comes to her first when the flock won’t mind.' : 'Bo looks up to her, the way you look up to someone a year or two ahead.')
    : who === 'hulda' ? (t >= 3 ? 'Grandmother has no secrets from her, and wants none from her.' : 'Grandmother dotes on her, and is teaching her a little of her craft.')
    : t < 0 ? n + ' is cool with her lately. Something wants mending.'
    : t < 1 ? n + ' knows her to nod to, and not much more.'
    : t < 2 ? n + ' is friendly enough, and glad to see her.'
    : t < 3 ? n + ' likes her, and is coming to rely on her.'
    : n + ' trusts her, and would do a good deal for her.';
  return { name: n, text: text + (open >= 2 ? ' Takes her in hand, as she asked.' : open >= 1 ? ' Knows what she and her mother have.' : ''), trust: t };
};
// Asked on the day, at the counter or the inn door: will she help this afternoon? (ctx.yes())
// Out of the bakery's door with the head start not finished, Mistress Pennock still at her counter (js/work.js's outside): Red's sorry, and
// she's not sorry Red came at all. (done: how many of the list she did; minute: the time, for why she's off)
// The loaf off the board, with her mother in the house: seen; or, sat at her needlework, heard (sewing). Put back.
const loafStopped = sewing => (sewing ? [
  { text: 'The board scrapes on the table. Across the room, the needle stops.' },
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Rose. That’s the loaf for supper you’ve your hand on. I can hear it from here.' },
] : [
  { who: 'mother', face: 'stern', listen: { red: 'wince' }, text: 'Rose. That’s the loaf for supper. Where do you think that’s going?' },
]).concat([
  { who: 'red', face: 'wince', listen: { mother: 'stern' }, text: 'Nowhere, Mama. I was only—' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Back on the board, please. And keep your hands off it.' },
  { who: 'red', face: 'shy', thought: true, text: 'Back it goes.' },
]);
// The pot fetched from the forge, of her own accord (js/chores.js's fetchPot)
const potFetched = () => [{ who: 'smith', face: 'calm', listen: { red: 'shy' }, text: 'Your mother’s pot. Riveted. Mind your back.' }, { who: 'red', face: 'smile', thought: true, text: 'Heavy. Home with it, and on the hearth.' }];
const shiftLeft = (done, minute) => [
  { who: 'red', face: 'shy', listen: { pennock: 'surprised' }, text: 'Mistress Pennock, I’m sorry. I have to go: Mama’s home for her dinner at half past, and I said I’d be there.' },
  { who: 'red', face: 'shy', listen: { pennock: 'calm' }, text: done ? 'I’ve done what I could of the list. Not all of it.' : 'I never got properly started. I’m sorry.' },
  { who: 'pennock', face: done ? 'smile' : 'calm', listen: { red: 'shy' }, text: done ? 'Go on, love. What’s done is done, and it’s more than I’d have had. Your mother first.' : 'Then off you go, and no harm done. Your mother first.' },
];
const shiftOffer = (who, ctx) => ctx.fairWeek ? (who === 'pennock' ? [
  { who: 'pennock', face: 'smile', listen: { red: 'calm' }, text: 'Rose, love, you’re a godsend if you’ve the morning free. The clearing down, while I sell: with the fair baking, there’s twice of it. Will you?' },
  { choose: [
    { text: 'Of course, Mistress Pennock.', face: 'smile', then: [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Bless you. The list’s on the board. Mind the gingerbread: it’s counted.' }, { run: ctx.yes }] },
    { text: ctx.late ? 'Not today: I’d miss Mama’s dinner.' : 'Not today, I’m sorry.', face: 'shy', then: (ctx.late ? [{ who: 'red', face: 'shy', thought: true, text: 'Start now, and I’ll never be home by half past. Mama would be sat there with two bowls.' }] : []).concat([{ who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: ctx.late ? 'No, you’d not make it, would you. Off home, then. Another day this week, if you can.' : 'Another day this week, then, if you can. Every day, if you like.' }]) },
  ] },
] : [
  { who: 'abney', face: 'calm', listen: { red: 'calm' }, text: 'Miss Rose. Two o’clock, if you can: the rooms want airing for the fair, and Bess isn’t to lift a thing.' },
  { choose: [
    { text: 'Yes, Mistress Abney. Two o’clock.', face: 'smile', then: [{ run: ctx.yes }, { who: 'abney', face: 'calm', listen: { red: 'smile' }, text: 'Two. Not half past. Fair week waits for nobody.' }] },
    { text: 'I can’t today, Mistress Abney.', face: 'shy', then: [{ who: 'abney', face: 'calm', listen: { red: 'shy' }, text: 'Then you can’t. I’ll ask again tomorrow.' }] },
  ] },
]) : who === 'pennock' ? [
  { who: 'pennock', face: 'smile', listen: { red: 'calm' }, text: 'Rose, love. If you’ve nothing else on: would you go through and make a start on the clearing down, while I sell this lot? A head start’s worth an hour to me.' },
  { choose: [
    { text: 'I’d be glad to, Mistress Pennock.', face: 'smile', then: [{ who: 'pennock', face: 'smile', listen: { red: 'smile' }, text: 'Bless you. The list’s on the board. As much as you can, love, and I’ll be in when I’m sold out.' }, { run: ctx.yes }] },
    { text: ctx.late ? 'Not today: I’d miss Mama’s dinner.' : 'Not today, I’m sorry.', face: 'shy', then: (ctx.late ? [{ who: 'red', face: 'shy', thought: true, text: 'Start now, and I’ll never be home by half past. Mama would be sat there with two bowls.' }] : []).concat([{ who: 'pennock', face: 'calm', listen: { red: 'shy' }, text: ctx.late ? 'No, you’d not make it, would you. Off home with you, then. Another day.' : 'Another day, then.' }]) },
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
const basketReminder = () => [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Rose! The eggs. In what, your apron? Take your basket off its peg, love.' }];
// Her hands full, going for something else (it: what she has).
const handsFull = it => it && it.kind === 'basket' ? 'I’ll have to put my basket down first.' : 'I’ll have to put ' + (it ? it.name : 'this') + ' down first.';
// Going to collect something that wants her basket, without it: where she left it (area: the place she put it down, or null: on its peg at
// home; here: in this very place).
const basketLeft = (area, here) => { const P_ = { village: 'in the village', wood: 'in the wood', holding: 'at the Fowlers’', cabin: 'at Grandmother’s' };
  return [{ who: 'red', face: 'wince', thought: true, text: 'And carry it in what? ' + (area ? (here ? 'My basket’s back there, where I put it down.' : 'I left my basket ' + (P_[area] || 'behind') + '.') : 'My basket’s on its peg at home.') }]; };
// Her mother, as Red goes to the door without what the errand wants (need: 'basket' | 'pot' | 'butt'; holding: what's in her hands instead).
const needReminder = (need, holding) => {
  const hands = holding === 'basket' && need !== 'basket' && need !== 'pie' ? ' Put your basket down first: you’ve only the two hands.' : holding && holding !== need && !(need === 'pie' && holding === 'basket') ? ' And put that down first.' : '';
  const say = { basket: 'Rose! In what, your apron? Take your basket off its peg, love.', pot: 'Rose! The pot, for Master Ferrier. It’s on the hearth.', butt: 'Rose! You’ll want the little butt to carry it in. By the hearth.', pie: 'Rose! The Dunns’ pie. Take your basket down, and I’ll put it in.' }[need] || 'Rose! You’ve forgotten something.';
  return [{ who: 'mother', face: 'calm', listen: { red: 'shy' }, text: say + hands }];
};
// (the same, her mother out at the farm: her own thought at the door)
const needThought = need => ({ basket: 'My basket. I’ll want it for this.', pot: 'The pot, for Master Ferrier. On the hearth.', butt: 'The little butt, to carry the water in. By the hearth.', pie: 'Mama’s pie for the Dunns. My basket first, and it goes in that.' })[need] || 'I’ve forgotten something. What was it?';
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
  { who: 'red', face: 'shy', text: 'Good day, Master Holt.' },
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
// After his first catch: her mother's spoken with Master William, and told him her hour. (His offer to see to it himself comes later, in
// Act 2, with her mother's blessing then: docs/quest-plan.md.)
const willieBlessing = ctx => [
  { who: 'mother', face: 'calm', listen: { red: 'calm' }, text: 'Master William stopped me this morning, on his way home from his round.' },
  { who: 'red', face: 'wince', text: 'Oh no.' },
  { who: 'mother', face: 'calm', listen: { red: 'wince' }, text: 'Not to complain. I filled him in, that’s all. Your hour’s nine, not the village’s ten: I told him so.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'So he’ll be looking out for you from nine, now, bell or no bell. And he’ll walk you to my door, the same as before.' },
  { who: 'red', face: 'shy', text: '…Yes, Mama.' },
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
// After a dare, once he's agreed: he's seen it. Then in the forge, the two of them.
const smithCaught = kind => [
  { who: 'smith', face: 'stern', listen: { red: 'wince' }, text: kind === 'bell' ? 'The curfew bell, in broad day. I heard it from the anvil, and I knew whose hand it was before it stopped.' : 'Master William’s shutter, and Master William’s voice, and the two of you running. I’ve ears, lad.' },
  { who: 'tom', face: 'wince', listen: { red: 'wince' }, text: 'It was only a bit of fun, Dad.' },
  { who: 'smith', face: 'stern', listen: { red: 'shy' }, text: 'Aye, and this’ll be a bit of fun an’ all. Into the forge, the both of you. Same standard, Miss Rose, as you asked.' },
];
const smithIndoors = () => [
  { who: 'smith', face: 'stern', listen: { red: 'shy' }, text: 'Tom first. Fetch the bench out, lad. Rose, you’ll stand there by the tub. Then you.' },
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
  await S.step([M, 'In this house a promise is a promise. When I say six, I mean six.', 'stern'], 8);
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

root.Story = { abneyHome, excusedDay, excusedEnd, promiseToldMama, gardenWantonLie, granCall, granTea, fairAnnounce, heelGiven, dayEnd, pieOwned, loafOwned, gardenOwned, weekDue, weekGood, weekFine, weekClose, weekWarn, owedAlso, shopAsk, georgieCommiserate, georgieHint, thatchersCall, pieAside, pieTell, reprieveNotAll, loafDiminished, loafOut, loafCounter, dinnerEnd, bessOffer, bessStay, abneyShortGood, abneyShortHalf, abneyIdled, abneyIdledRed, georgieCalls, georgieCatch, georgieBrings, needThought, abneyShort, abneyShortRed, abneyShortAfter, dinnerCall, dinner, leftForMama, capacityThought, owedRaise, owedLater, ducksWish, ducksAsk, ducksFed, ducksAfter, loafAsk, loafGone, loavesGone, loafCorrection, loafAfter, bessFrock, fairBreakfast, fittingCall, fitting, woodCorrection, woodAfter, eveningAsk, eveningOut, friendsOut, granAsk, granCake, fairDanceAsk, fairDance, fairKiss, fairDress, agnesFound, agnesAway, agnesTell, georgieAshamed, georgieChooses, georgieSorry, agnesTerms, agnesWaiting, woodBefore, agnesGeorgie, agnesGeorgieAfter, woodLeaving, agnesBack, fairHome, fairOwned, fairFound, dressCorrection, dressAfter, fairTalk, fairAsk, fairGive, fairEwe, owedNow, supperCall, nightThoughts, breadEaten, curfewStern, willieDealt, peterAsksNote, beechPassing, bessInvite, handsFull, basketLeft, granCallsIn, pennockShort, pennockShortRed, pennockShortAfter, curfewNudge, boHello, boHelp, boThanks, agnesWell, marenMissed, needReminder, shiftOffer, shiftLeft, loafStopped, potFetched, shiftMissed, herbAskAgain, herbThanks, villagerTrust, marenReminds, marenAsks, marenChat, marenGarden, marenGardenDry, marenSupper, willieCalls, dayTalk, tomDared, huldaLighter, signpost, forkShut, basketReminder, holtMeet, holtGone, wolfeMeet, wolfeGone, willieBlessing, peterNotices, tomTold, smithAsk, smithCaught, smithIndoors, smithTom, smithRed, smithAfter, pennockTrust, abneyOpen, abneyInHand, abneyAfter, herbAsk, herbGathered, herbGiven, herbLater, herbWaiting, letIn, peterFirst, fowlerSends, abneyIdle, abneyAsks, tempted, temptedAfter, sitWithBess, abneyBack, promiseFoundOut, promiseCorrection, promiseAfter, firstVisit, walkWithPeter, peterNote, beechMeeting, FOWLERS, fowlers, WORK, willieCatch, willieBrings, curfewTalk, curfewCorrection, curfewAfter, reprieve, reportIt, supper, pieDare, pieCaught, pieForge, pieBakery, pieTom, pieRed, pieAfter, pieMotherKnows, pieHome, pieFoundOut, pieMaren, pieMarenAfter, pennockIdle, trodden, gardenFine, gardenAsk, gardenBoots, gardenBelieved, gardenReport, gardenTakeInHand, gardenCorrection, afterGarden, VILLAGE, villager, tomStops, tomCost, homecoming, homecomingCorrection, walkStop, STOPS, ERRANDS, breakfast, enough, maintenanceCorrection, afterMaintenance, GARDEN, broken, afterCorrection, bedtime, chores, marenIdle, grandmother, granAgain, WALK, SPOTS };
})(typeof window !== 'undefined' ? window : globalThis);
