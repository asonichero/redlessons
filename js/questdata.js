// Little Red’s Lessons — the quest plan (docs/quest-plan.md) as data for js/quests.js: the people, the nine phases of the three acts, every quest
// line's steps, and the gates. Wolfe is the main story; every other line feeds it.
//
// Each step: id, phase (where in the story it can first come up), title (the journal's), hint (the objective shown while it's on offer), where
// (the area it happens in: js/world.js), who (the figure it's with), scene (what js/world.js plays for it, when there is one yet), and optionally
// when (a condition: see js/quests.js), gate (a gate that must be open), optional (the line goes on without it), talk (it's played by talking to
// who, in the place: js/world.js handles it).
// Areas: home (the cottage), cabin (Hulda's), wood, village, garden, bakery, inn, forge, farm, charcoal (the charcoal-burners'), barrows, shoe,
// hideout (where Hulda hides), green (where the village gathers).
(function (root) {
'use strict';

// Everyone in the story. All of them are adults; those who are ever taken in hand are grown women and men, there by their own choosing.
const PEOPLE = {
  red: { name: 'Rose', called: 'Red', age: 19 }, maren: { name: 'Maren', called: 'Mother', age: 38 }, hulda: { name: 'Hulda', called: 'Grandmother', age: 71 },
  peter: { name: 'Peter', age: 21 }, tom: { name: 'Tom Ferrier', age: 20 }, smith: { name: 'Ferrier', called: 'the smith', age: 46 },
  pennock: { name: 'Mistress Pennock', age: 44 }, baker: { name: 'Master Pennock', called: 'the baker', age: 47 },
  abney: { name: 'Mistress Abney', age: 52 }, abneyDaughter: { name: 'Bess Abney', age: 26 }, halloran: { name: 'Old Halloran', age: 66 },
  willie: { name: 'Willie Winkie', called: 'the night crier', age: 40 }, georgie: { name: 'Georgie Dunn', age: 19 }, agnes: { name: 'Agnes Thatcher', age: 19 },
  holt: { name: 'Holt', called: 'the woodsman', age: 41 }, wolfe: { name: 'Wolfe', age: 36 },
  motherBarrow: { name: 'Mother Barrow', age: 45 }, fatherBarrow: { name: 'Father Barrow', age: 48 }, masterBarrow: { name: 'Master Barrow', age: 22 },
  lucy: { name: 'Lucy Locket', age: 20 }, brannock: { name: 'Mother Brannock', age: 58 }, kitty: { name: 'Kitty Fisher', age: 24 },
};

const phases = [
  { id: '1.1', act: 1, actName: 'Little Red', name: 'The Cloak', requires: true },
  { id: '1.2', act: 1, actName: 'Little Red', name: 'The Village', requires: { done: 'maren.homecoming' } },
  { id: '1.3', act: 1, actName: 'Little Red', name: 'Into the Wood', requires: { all: [{ done: 'tom.pie' }, { done: 'abney.promise' }, { done: 'hulda.errands' }] } },
  { id: '2.1', act: 2, actName: 'Further In', name: 'Further In', requires: { gate: 'act1' } },
  { id: '2.2', act: 2, actName: 'Further In', name: 'The Shoe', requires: { all: [{ done: 'barrows.talk' }, { done: 'hulda.last' }, { done: 'shoe.lucy' }] } },
  { id: '2.3', act: 2, actName: 'Further In', name: 'The Errand', requires: { all: [{ done: 'shoe.night' }, { done: 'abney.confinement' }, { gate: 'holt' }] } },
  { id: '3.1', act: 3, actName: 'Rose', name: 'The Reckoning', requires: { gate: 'act2' } },
  { id: '3.2', act: 3, actName: 'Rose', name: 'The Search', requires: { done: 'maren.reckoning' } },
  { id: '3.3', act: 3, actName: 'Rose', name: 'Justice', requires: { gate: 'finale' } },
];

// (a step: s(id, phase, title, where, who, more))
const s = (id, phase, title, where, who, more) => Object.assign({ id, phase, title, where, who }, more || {});

const lines = [
  { id: 'wolfe', name: 'Wolfe', main: true, steps: [
    s('meet', '1.3', 'A stranger at the stream', 'wood', 'wolfe', { hint: 'Someone is by the stream.', when: { part: ['afternoon', 'evening'] } }),
    s('chance', '2.1', 'Chance meetings', 'wood', 'wolfe', { hint: 'He seems to be wherever she walks alone.' }),
    s('learns', '2.2', 'What he learns', 'wood', 'wolfe', { gate: 'silence' }),
    s('note', '2.3', 'A note from Grandmother', 'home', 'maren', { gate: 'note', hint: 'A note has come.' }),
    s('cabin', '2.3', 'Cake and wine at the cabin', 'cabin', 'wolfe', { hint: 'Take the cake and wine to her grandmother’s.' }),
    s('hunted', '3.2', 'Hunted', null, null),
    s('justice', '3.3', 'Before the village', 'green', 'wolfe'),
  ] },
  { id: 'maren', name: 'Maren', steps: [
    s('walk', '1.1', 'Home before dark', 'wood', 'maren', { hint: 'Home, along the path.', scene: 'ch1.walk' }),
    s('homecoming', '1.1', 'The homecoming', 'home', 'maren', { hint: 'Home. Her mother is waiting.', scene: 'ch1.homecoming' }),
    s('chores', '1.2', 'Chores agreed', 'home', 'maren', { hint: 'Talk to her mother about what’s hers to do.', talk: true }),
    s('willie', '1.3', 'Willie Winkie’s blessing', 'home', 'maren', { when: { flag: 'willie-catch-1' } }),
    s('mending', '2.2', 'The mending for the Shoe', 'home', 'maren'),
    s('confinement', '2.2', 'Weeks at the Abneys’', 'inn', 'maren'),
    s('note', '2.3', 'Sent with the note', 'home', 'maren', { when: { done: 'wolfe.note' } }),
    s('reckoning', '3.1', 'Maren’s apologies', 'home', 'maren'),
    s('stands', '3.3', 'Stands with Rose', 'green', 'maren'),
  ] },
  { id: 'hulda', name: 'Hulda', paused: [['2.2', '3.1']], steps: [
    s('cloak', '1.1', 'The red cloak', 'cabin', 'hulda', { hint: 'Tea at her grandmother’s.', scene: 'ch1.tea' }),
    s('errands', '1.2', 'Herb errands', 'wood', 'hulda', { hint: 'Gather what her grandmother asked for.' }),
    s('holt', '1.3', 'Holt, at Hulda’s', 'cabin', 'holt'),
    s('last', '2.1', 'The last visit', 'cabin', 'hulda'),
    s('signs', '3.2', 'Her signs', 'wood', null),
    s('found', '3.2', 'Hulda found', 'hideout', 'hulda'),
    s('trap', '3.3', 'The trap', 'cabin', 'hulda'),
  ] },
  { id: 'peter', name: 'Peter', paused: [['2.1', '2.1']], steps: [
    s('beech', '1.1', 'The R and P on the beech', 'wood', null, { optional: true, hint: 'The old beech, by the path.' }),
    s('friends', '1.2', 'Meetings at the beech', 'wood', 'peter'),
    s('notices', '1.3', 'He notices she’s changed', 'village', 'peter'),
    s('equals', '2.2', 'Holding each other to account', 'wood', 'peter', { gate: 'peter' }),
    s('uneasy', '2.3', 'Uneasy about the stranger', 'village', 'peter'),
    s('silence', '3.2', 'Something wrong with Hulda’s silence', 'village', 'peter'),
    s('stands', '3.3', 'Stands with her', 'green', 'peter'),
  ] },
  { id: 'tom', name: 'Tom and the smith', steps: [
    s('meet', '1.1', 'Tom', 'village', 'tom', { optional: true }),
    s('dares', '1.2', 'Dares', 'village', 'tom'),
    s('pie', '1.2', 'The pie', 'bakery', 'pennock', { hint: 'Tom has an idea about Mistress Pennock’s pies.' }),
    s('told', '1.2', 'Telling Tom', 'forge', 'tom', { optional: true, when: { trust: 'tom', gte: 3 } }),
    s('smith', '1.3', 'By the same standard as Tom', 'forge', 'smith', { gate: 'smith' }),
    s('lock', '3.2', 'A lock or a chain', 'forge', 'smith'),
  ] },
  { id: 'pennock', name: 'Mistress Pennock', steps: [
    s('prospects', '1.1', 'Her prospects', 'village', 'pennock', { optional: true }),
    s('helps', '1.2', 'At the bakery', 'bakery', 'pennock'),
    s('pie', '1.2', 'Asking to share Tom’s correction', 'bakery', 'pennock', { when: { done: 'tom.pie' } }),
    s('trust', '1.3', 'Trust', 'bakery', 'pennock'),
    s('cake', '2.3', 'The cake', 'bakery', 'pennock'),
    s('who', '3.2', 'Who ordered the cake', 'bakery', 'pennock'),
  ] },
  { id: 'abney', name: 'Mistress Abney', steps: [
    s('asks', '1.1', 'Sitting up with her daughter', 'inn', 'abney', { optional: true }),
    s('work', '1.2', 'Work at the inn', 'inn', 'abney'),
    s('promise', '1.2', 'A promise', 'inn', 'abney'),
    s('inhand', '1.3', 'Taken in hand', 'inn', 'abney', { gate: 'abney' }),
    s('confinement', '2.2', 'Her daughter’s confinement', 'inn', 'abneyDaughter'),
    s('wine', '2.3', 'The wine', 'inn', 'abney'),
    s('gossip', '3.2', 'Travellers’ gossip', 'inn', 'abney'),
  ] },
  { id: 'holt', name: 'Holt', steps: [
    s('meet', '1.3', 'The woodsman', 'cabin', 'holt', { when: { done: 'hulda.holt' } }),
    s('work', '2.1', 'Work at the charcoal-burners’', 'charcoal', 'holt'),
    s('told', '2.1', 'Telling Holt', 'charcoal', 'holt', { when: { trust: 'holt', gte: 3 } }),
    s('cabin', '2.3', 'At the cabin', 'cabin', 'holt', { when: { done: 'wolfe.cabin' } }),
    s('maren', '3.1', 'Holding Maren to account', 'home', 'holt'),
    s('tracks', '3.2', 'Tracking', 'wood', 'holt'),
    s('trap', '3.3', 'At the trap', 'cabin', 'holt'),
  ] },
  { id: 'barrows', name: 'The Barrows', steps: [
    s('strays', '2.1', 'Bo Peep’s strays', 'wood', null),
    s('house', '2.1', 'An empty house', 'barrows', null),
    s('found', '2.1', 'Found out', 'barrows', 'motherBarrow'),
    s('talk', '2.1', 'All four of them', 'barrows', 'fatherBarrow'),
    s('visits', '2.2', 'Return visits', 'barrows', 'motherBarrow', { optional: true }),
    s('safehouse', '3.2', 'A safe house', 'barrows', 'fatherBarrow'),
  ] },
  { id: 'shoe', name: 'The Shoe', steps: [
    s('lucy', '2.1', 'Lucy, again', 'village', 'lucy'),
    s('mending', '2.2', 'The mending, as Rose', 'shoe', 'brannock', { gate: 'shoe' }),
    s('night', '2.2', 'A night at the Shoe', 'shoe', 'brannock'),
    s('visit', '2.2', 'Visiting Lucy', 'shoe', 'lucy', { optional: true }),
    s('turned', '3.2', 'Turned away', 'shoe', 'brannock'),
  ] },
  { id: 'halloran', name: 'Old Halloran', steps: [
    s('calving', '1.1', 'The calving', 'farm', 'halloran', { optional: true }),
    s('work', '2.1', 'More of the farm', 'farm', 'halloran', { optional: true }),
    s('stands', '3.3', 'The first to stand with Rose', 'green', 'halloran', { gate: 'halloran' }),
  ] },
  { id: 'willie', name: 'Willie Winkie', steps: [
    s('first', '1.3', 'Caught after curfew', 'village', 'willie', { optional: true, when: { curfew: true } }),
    s('offer', '2.1', 'His offer', 'village', 'willie', { optional: true, gate: 'willie' }),
    s('saw', '3.3', 'A figure in the wood at night', 'village', 'willie'),
  ] },
];

// The gates (the plan's twelve: the middle-tier figures each have their own, as Holt does). The three act gates are hard; the rest open single lines.
const gates = [
  { id: 'act1', name: 'Act 1 to Act 2', hard: true, requires: { all: [{ done: 'tom.smith' }, { done: 'pennock.trust' }, { done: 'abney.inhand' }, { done: 'holt.meet' }, { done: 'wolfe.meet' }] } },
  { id: 'act2', name: 'Act 2 to Act 3', hard: true, requires: { done: 'wolfe.cabin' } },
  { id: 'finale', name: 'The finale', hard: true, requires: { done: 'hulda.found' } },
  { id: 'smith', name: 'The smith takes her in hand', requires: { open: 'tom', gte: 1 } },
  { id: 'peter', name: 'Peter resumes', requires: { done: 'barrows.found' } },
  { id: 'shoe', name: 'The Shoe', requires: { all: [{ done: 'shoe.lucy' }, { done: 'maren.mending' }] } },
  { id: 'silence', name: 'Hulda’s silence', requires: { done: 'abney.confinement' } },
  { id: 'note', name: 'The forged note', requires: { any: [{ disclosure: { gte: 4 } }, { flag: 'hulda-letters' }] } },
  { id: 'willie', name: 'Willie Winkie’s offer', requires: { all: [{ flag: 'willie-catch-2' }, { village: { gte: 0.5 } }, { flag: 'maren-blesses-willie' }] } },
  { id: 'villagers', name: 'Rotating villagers', requires: { village: { gte: 0.6 } } },
  { id: 'abney', name: 'Mistress Abney takes her in hand', requires: { all: [{ trust: 'abney', gte: 3 }, { open: 'abney', gte: 1 }] } },
  { id: 'holt', name: 'Holt’s trust', requires: { all: [{ trust: 'holt', gte: 3 }, { open: 'holt', gte: 1 }] } },
  { id: 'halloran', name: 'Halloran at the end', requires: { flag: 'rose-standing' } },
];

const api = { PEOPLE, phases, lines, gates };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.QuestData = api;
})(typeof window !== 'undefined' ? window : globalThis);
