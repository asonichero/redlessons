// Little Red’s Lessons — the story's conversations, as scripts for js/talk.js. Speakers: 'red' (Rose: Red to her mother, her grandmother and Peter; Little
// Red in her cloak), 'mother' (Maren, whom Rose only ever calls Mama) and 'gran' (Hulda, her grandmother). Faces are js/toon.js's expressions: calm, smile, shy, cheeky, pout,
// stern, surprised, wince, gritted, crying.
//
// Chapter one, the homecoming: Red comes in late in the dusk from her grandmother's, through the wood, in the new red cloak her grandmother made
// her, and morose. Her mother sees it at once. (A first draft: the beats are the ones agreed; the words are for tuning.)
(function (root) {
'use strict';

const homecoming = () => [
  { text: 'The light is nearly gone. The fire is the brightest thing in the cottage.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'There you are. I was about to light the lantern and come looking for you.' },
  { who: 'red', face: 'shy', text: 'I’m sorry. I lost track of the time.' },
  { who: 'mother', face: 'surprised', listen: { red: 'calm' }, text: '…That’s a face. And that’s a cloak. Your grandmother’s work?' },
  { who: 'red', face: 'shy', text: 'She made it for me. When I turned round to show her, she called me Little Red.' },
  { who: 'mother', face: 'smile', text: 'She would. It suits you. It always did.' },
  { who: 'mother', face: 'calm', text: 'Sit down. Tell me what’s sitting on you, because something is.' },
  { choose: [
    { text: 'It’s nothing. I’m just tired.', then: [
      { who: 'mother', face: 'stern', listen: { red: 'pout' }, text: 'Red. I’ve known your “nothing” for nineteen years.' },
      { who: 'red', face: 'pout', text: '…Fine. It’s not nothing.' },
    ] },
    { text: 'I don’t want to be grown, Mama.', then: [
      { who: 'mother', face: 'surprised', listen: { red: 'shy' }, text: 'Oh. Well. That’s not nothing, is it?' },
    ] },
  ] },
  { who: 'red', face: 'pout', text: 'Everyone looks at me differently now. The baker’s wife asks after my prospects. Old Halloran calls me “Miss Rose”.' },
  { who: 'red', face: 'shy', text: 'And Peter… Peter looks at me like I’m a question he’s working up to asking.' },
  { who: 'red', face: 'wince', text: 'You hand me the mending, and the Hallorans’ calving, and I do it. I do. But it sits so heavy, Mama, all of it, all the time.' },
  { who: 'red', face: 'shy', text: 'And today, at Grandmother’s, in this… I felt light. Like before.' },
  { who: 'mother', face: 'calm', text: 'Before what, love?' },
  { who: 'red', face: 'shy', text: 'Before I had to be anybody.' },
  { who: 'mother', face: 'shy', listen: { red: 'shy' }, text: 'Oh, Red.' },
  { who: 'mother', face: 'smile', text: 'Then be Little Red a while. I carried this house on my own before; I can carry it again. The mending will keep, and the Hallorans can find another pair of hands.' },
  { who: 'red', face: 'pout', listen: { mother: 'calm' }, text: 'No. That’s not… that isn’t it either.' },
  { who: 'mother', face: 'surprised', text: 'Then tell me what it is.' },
  { who: 'red', face: 'shy', text: 'Do you remember the winter after Papa? I went out on the ice on the mill pond because Tom Ferrier dared me.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'I remember pulling you off it by your collar.' },
  { who: 'red', face: 'shy', text: 'And you brought me home, and you took me over your knee, and I howled the whole way through. And after, you held me by the fire until I fell asleep.' },
  { who: 'red', face: 'shy', listen: { mother: 'shy' }, text: 'I’ve never felt so safe. Not before, not since. Somebody had hold of me. Somebody would stop me.' },
  { text: 'Her mother is quiet a long moment. Something in her face settles, the way a seam does when it finally lies flat.' },
  { who: 'mother', face: 'calm', listen: { red: 'shy' }, text: 'Being Little Red. Is part of it being held to account?' },
  { choose: [
    { text: '…Yes.' },
    { text: 'Yes. I think it is.' },
  ] },
  { who: 'red', face: 'shy', listen: { mother: 'calm' }, text: '…Is that so strange?' },
  { who: 'mother', face: 'smile', text: 'No, love. It isn’t strange at all.' },
  { who: 'mother', face: 'stern', listen: { red: 'surprised' }, text: 'Then let’s start as we mean to go on. You came home through the wood. At dusk. Alone. After I’ve told you a hundred times.' },
  { who: 'red', face: 'wince', text: 'It wasn’t so dark when I—' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'It was dark enough. Nothing happened, and that’s luck, and I won’t have you leaning on luck. You’ll not walk away from this one unscathed, Little Red.' },
  { who: 'mother', face: 'calm', text: 'But hear me first, because this matters more than the rest of it.' },
  { who: 'mother', face: 'calm', text: 'If it’s ever too much, not sore, not sorry, too much, you say your name. Your own name. Rose.' },
  { who: 'mother', face: 'calm', text: 'And then you’re Rose again, a grown woman, and I stop, and we sit and talk as two women do. No questions asked, and no shame in it. Ever.' },
  { who: 'red', face: 'shy', text: 'Rose.' },
  { who: 'mother', face: 'smile', text: 'That’s the one.' },
  { who: 'mother', face: 'stern', listen: { red: 'shy' }, text: 'Now. Cloak off, over the back of the chair, and come here.' },
];

// Chapter one opens at her grandmother's: the last of the afternoon, tea and cake at the round table, the old woman fussing, Rose letting her. Then
// the gift: a red cloak like the one she wore as a girl. She puts it on and turns round to show it, and her grandmother calls her Little Red.
// (ctx: the scene's moves, run in order: ctx.fetchGift, ctx.giveGift, ctx.openGift, ctx.twirl, ctx.seeOff.) Speakers: 'red' and 'gran'.
const grandmother = ctx => [
  { text: 'Deep in the wood, in her grandmother’s cabin under the great oak, the afternoon is going gold.' },
  { who: 'gran', face: 'smile', listen: { red: 'calm' }, text: 'Another slice. Go on. You’re all elbows and no supper.' },
  { who: 'red', face: 'cheeky', text: 'Grandmother, that’s my third.' },
  { who: 'gran', face: 'cheeky', listen: { red: 'smile' }, text: 'And who’s counting? Not me. My eyes are going.' },
  { who: 'red', face: 'smile', text: 'Your eyes miss nothing, and you know it.' },
  { who: 'gran', face: 'smile', text: 'They miss nothing that matters. Now. The village. Is the miller’s boy still mooning after the Thatcher girl?' },
  { who: 'red', face: 'cheeky', listen: { gran: 'surprised' }, text: 'Worse. He’s written her a poem. He rhymed “Agnes” with “magnets”.' },
  { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Magnets! Lord preserve us. I hope she let him down gently.' },
  { who: 'gran', face: 'calm', text: 'And your mother? Working herself to the bone, I suppose.' },
  { who: 'red', face: 'pout', text: 'She’s got me doing half of it now. The mending, the Hallorans’ cows, sitting up with Mistress Abney’s daughter…' },
  { who: 'gran', face: 'calm', listen: { red: 'shy' }, text: 'Has she, now. And how do you find it?' },
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
  { who: 'red', face: 'surprised', listen: { gran: 'smile' }, text: 'Grandmother… it’s like my old one.' },
  { who: 'gran', face: 'smile', text: 'Like it, only bigger. I thought you might be missing it. There. Turn round, let me look at you.' },
  { run: ctx.twirl },
  { who: 'gran', face: 'smile', listen: { red: 'smile' }, text: 'Oh, look at you. Little Red.' },
  { who: 'red', face: 'smile', listen: { gran: 'smile' }, text: '…Little Red.' },
  { text: 'Nobody has called her that in years. It sits on her the way the cloak does: warm, and exactly right.' },
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

// After the correction (js/correction.js): the two of them in the room by the fire. How it went decides it (Discipline.run's result): taken all
// the way through, her mother holds her, as she did the winter of the mill pond; stopped with her name, she's Rose, and they talk as two women.
const afterCorrection = r => r && (r.rose || r.tooHarsh) ? [
  { text: 'Her mother has her up on her feet and close before she quite knows how she got there.' },
  { who: 'mother', face: 'shy', listen: { red: 'shy' }, text: r.rose ? 'Rose. I’m here. Breathe with me.' : 'That was more than I meant it to be. I’m sorry, love.' },
  { who: 'red', face: 'shy', text: 'I’m all right. It was just… a lot, all at once.' },
  { who: 'mother', face: 'calm', text: 'Then that’s what we talk about. Not the wood, not any of it. You.' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: 'Thank you for stopping.' },
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Always. That was the promise, and it holds. Come on. There’s soup, and the fire’s warm.' },
] : [
  { text: 'It takes a while for the crying to run its course. Her mother waits it out, a hand on her back.' },
  { who: 'mother', face: 'calm', listen: { red: 'crying' }, text: 'There now. That’s done, and it stays done. No more about the wood.' },
  { who: 'red', face: 'crying', listen: { mother: 'calm' }, text: 'I’m sorry, Mama.' },
  { who: 'mother', face: 'smile', listen: { red: 'shy' }, text: 'I know you are. Come here.' },
  { text: 'Her mother holds her there by the fire until the shaking stops, the way she did the winter of the mill pond.' },
  { who: 'red', face: 'shy', listen: { mother: 'smile' }, text: '…Somebody had hold of me.' },
  { who: 'mother', face: 'smile', listen: { red: 'smile' }, text: 'Somebody always will. Now: soup, and bed. And that cloak hangs by the door, where I can see it.' },
];

root.Story = { homecoming, afterCorrection, grandmother, granAgain, WALK, SPOTS };
})(typeof window !== 'undefined' ? window : globalThis);
