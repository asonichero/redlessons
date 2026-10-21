// Red Lessons — the story's conversations, as scripts for js/talk.js. Speakers: 'red' (Rose: Red to her mother, her grandmother and Peter; Little
// Red in her cloak) and 'mother' (Maren, whom Rose only ever calls Mama). Faces are js/toon.js's expressions: calm, smile, shy, cheeky, pout,
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

root.Story = { homecoming };
})(typeof window !== 'undefined' ? window : globalThis);
