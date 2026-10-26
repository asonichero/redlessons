// Little Red’s Lessons — the story's conversations, as scripts for js/talk.js. Speakers: 'red' (Rose: Red to her mother, her grandmother and Peter; Little
// Red in her cloak), 'mother' (Maren, whom Rose only ever calls Mama) and 'gran' (Hulda, her grandmother). Faces are js/toon.js's expressions: calm, smile, shy, cheeky, pout,
// stern, surprised, wince, gritted, crying, concerned, sad.
//
// Chapter one, the homecoming: Red comes in late in the dusk from her grandmother's, through the wood, in the new red cloak her grandmother made
// her, and morose. Her mother sees it at once. (A first draft: the beats are the ones agreed; the words are for tuning.)
(function (root) {
'use strict';

const homecoming = () => [
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'There you are! I was about to light the lantern and come looking for you.' },
  { who: 'red', face: 'shy', listen: { mother: 'concerned' }, text: 'I’m sorry. I lost track of the time.' },
  { who: 'mother', face: 'surprised', listen: { red: 'calm' }, text: '…Well, you’re home now. And with a fine new cloak! Your grandmother’s work?' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: 'She made it for me, like the one I used to have. When I turned round to show her, she called me Little Red.' },
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
  { who: 'mother', face: 'calm', listen: { red: 'concerned' }, text: 'Then let’s start as we mean to go on. Your Grandmother will have sent you home long before the light faded, and yet you lingered in the wood, as dusk crept in. Alone. After I’ve told you a hundred times.' },
  { who: 'red', face: 'wince', text: 'It wasn’t so dark, Mama—' },
  { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'It was dark enough. Nothing happened, and that’s luck, and I won’t have you leaning on luck. You’ll not walk away from this one unscathed, Little Red.' },
  { who: 'mother', face: 'calm', text: 'But hear me first, because this matters more than the rest of it.' },
  { who: 'mother', face: 'calm', listen: { red: 'concerned' }, text: 'If it’s ever too much, not sore, not sorry, too much, you say your name. Your own name. Rose.' },
  { who: 'mother', face: 'calm', text: 'And then you’re Rose again, a grown woman, and I stop, and we sit and talk as two women do. No questions asked, and no shame in it. Ever.' },
  { who: 'red', face: 'shy', text: 'Rose.' },
  { who: 'mother', face: 'smile', text: 'That’s the one.' },
  { who: 'mother', face: 'stern', listen: { red: 'concerned' }, text: 'Now, come here, young lady.' },
];

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
  { who: 'red', face: 'shy', listen: { gran: 'smile' }, text: 'I like being fussed.' },
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
  [0.47, 'shy', 'Peter used to just be Peter. Now he goes quiet when I look at him, and I go quiet back, and neither of us knows what comes next.'],
  [0.55, 'calm', 'In this cloak, I don’t feel like anybody’s question.'],
  [0.66, 'shy', 'At the table, with Grandmother fussing and me letting her. Like being small. Like nothing was mine to carry.'],
  [0.73, 'pout', 'That’s it, isn’t it. Everyone’s decided I’m grown. And I’m not ready.'],
  [0.86, 'shy', 'It’s getting dark. I should hurry.'],
  [0.89, 'pout', '…I don’t want to hurry.'],
  [0.95, 'calm', 'There’s the village. The Hallorans’ roof, and the Abneys’, and ours.'],
  [0.985, 'pout', 'And there it all is again. Waiting for me.'],
];
const SPOTS = {
  bluebells: [['smile', 'We used to pick these by the armful. Mama would pretend to sneeze at them.'], ['shy', 'She’ll like these.']],
  stream: [['calm', 'I could sit here till the stars come out. Nobody would ask me for anything at all.']],
  beech: [['shy', 'R and P. Peter carved it the summer we were nine. It’s grown so wide.'], ['shy', '…Does he remember it?']],
  log: [['calm', 'Just a little longer.'], ['pout', 'Just a little.']],
};

// The first correction, the homecoming's, scripted as a dialogue between them over the smacks (js/correction.js runs it: S.say, S.step, S.set).
// Not a token: it's meant, and it's meant to be felt by a grown woman, in the words that Little Red needs. Across her lap, skirt down; then
// lifted; then her drawers down (her mother's hand at each); and last the hairbrush, which she's sent to fetch from the chest, for the wood,
// counted after each stroke; then her mother soothes her, the brush in her other hand. Her name stops it anywhere, and her mother answers that instead.
const homecomingCorrection = async S => {
  const M = 'corrector', R = 'subject';
  // (a stroke, then her count; her mother's face as she hears it, where it changes)
  const count = async (n, face) => { await S.smacks(1); S.face(face); await S.say(R, n); };
  S.set({ skirt: 'down', drawers: 'up', implement: 'hand', strength: 1.5, pace: 1.4 });
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
  S.set({ strength: 1.75, pace: 1.65 });
  await S.step([M, 'Anything could have been on that path. Anyone.', 'stern'], 10);
  await S.step([R, 'Ow— I stayed on the path, I did—'], 6);
  await S.step([M, 'You stayed on it in the dark. That’s the part I mind.'], 10);
  await S.smacks(10);
  await S.step([R, 'Please— I understand—'], 4);
  await S.say(M, 'Not yet, but nearly.', 'calm');
  // (her drawers down)
  await S.gesture('drawers'); await S.wait(0.5);
  await S.say(R, 'Mama, no, please—');
  await S.say(M, 'Yes. Because it matters, and because you need to remember it matters. Breathe.', 'stern');
  S.set({ strength: 2.0, pace: 2 });
  await S.step([M, 'You lingered. Dawdled.'], 8);
  await S.step([M, 'You let the dusk come in around you.'], 8);
  await S.step([R, 'I’m sorry! I’m sorry, Mama!'], 6);
  await S.step([M, 'And you let me sit here, watching the window, with the lantern in my hand.'], 12);
  await S.smacks(10);
  // (and the hairbrush, for the last of it: she counts every one; the one she doesn't count, she counts after)
  // (she's sent for it: off the lap, across the room to the chest, and back to give it to her, as she is)
  await S.fetch('hairbrush', {
    ask: [M, 'Up you get, Little Red. My hairbrush is in the chest. Fetch it for me.'],
    waitFace: 'concerned', presentFace: 'stern',
    present: [R, '…Here, Mama.'],
    back: [M, 'Good girl. Now back across my lap, Little Red.', 'smile'],
  });
  S.set({ strength: 1.85, pace: 1 }); await S.wait(0.8);
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
const afterCorrection = r => r && (r.rose || r.tooHarsh) ? [
  { who: 'mother', face: r.rose ? 'concerned' : 'shy', listen: { red: 'shy' }, text: r.rose ? 'Rose. I’m here. Breathe with me.' : 'That was more than I meant it to be. I’m sorry, love.' },
  { who: 'red', face: 'shy', text: 'I’m all right. It was just… a lot, all at once.' },
  { who: 'mother', face: 'calm', text: 'Then that’s what we talk about. Not the wood, not any of it. You.' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: 'Thank you for stopping.' },
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Always. That was the promise, and it holds. Come on. There’s soup, and the fire’s warm.' },
] : [
  { who: 'mother', face: 'calm', listen: { red: 'crying' }, text: 'Hush, sweetheart. It’s over now. You’re my good Little Red again, and we’ll talk no more of the wood.' },
  { who: 'red', face: 'crying', listen: { mother: 'calm' }, text: 'I’m sorry, Mama.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'I know you are. Come here.' },
];

// Phase 1.2, the morning after: what's hers to do, agreed between them, nothing too grown. Mary's garden, small errands, and home by the curfew bell.
const chores = () => [
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'Morning, Little Red. Sleep?' },
  { who: 'red', face: 'shy', text: 'Like a stone.' },
  { who: 'mother', face: 'calm', text: 'Good. Now, what we said last night. The Hallorans’ calving and the mending can go back to being mine. But you’ll not sit idle either.' },
  { who: 'mother', face: 'calm', text: 'Mary’s garden, each morning: weeds, water, and whatever’s ready to pick. Errands when I ask, and done when I ask.' },
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

root.Story = { homecoming, homecomingCorrection, afterCorrection, chores, marenIdle, lateHome, grandmother, granAgain, WALK, SPOTS };
})(typeof window !== 'undefined' ? window : globalThis);
