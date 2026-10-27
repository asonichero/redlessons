# Build plan

What the quest plan ([quest-plan.md](quest-plan.md)) needs from the code, mapped onto the files in the README, with Act 1 playable end to end as the first milestone.

## Systems to build

The game today is a linear chapter plus a free-roam cottage. The quest plan needs an open world with saved state, so most of the new work is systems, not scenes. Proposed new files are marked *new*.

| System | What it does | Where |
| --- | --- | --- |
| World and scene manager | Moves Red between cottage, village and wood; loads each area; keeps time and state across them | *new* `js/world.js`; reuses `play.js`, `motion.js`, `hud.js` |
| Save state | Quest steps, flags, stats, day and time, inventory; stored in the browser | *new* `js/save.js` |
| Quest and gate engine | Each quest line as steps with conditions; the gates table as data; tells the HUD what's on offer | *new* `js/quests.js`; quest data in *new* `js/questdata.js` |
| Reputation | Wilful, Mischievous, Naughty; raised by choices and actions; read by correctors and dialogue | *new* `js/reputation.js` |
| Openness | Per person and village-wide; whom Red has told; unlocks each figure taking her in hand | `js/reputation.js` |
| Wolfe's disclosure | Hidden tally of what Red has told Wolfe; feeds the forged note and the cabin scene | `js/reputation.js`, flags in `js/save.js` |
| Calendar and day/night | Days advance when quests need them; dusk and night in the village and wood; curfew | *new* `js/calendar.js`; light from `stage.js`, `wood.js` |
| Open-world correctors | Willie Winkie after curfew; Holt in the wood from 3.1; completed figures weighted by their stat | `js/quests.js` rules, scenes in `js/correction.js` |
| Dialogue conditions | Lines and choices shown by flags, stats and openness; choices that set them | `js/talk.js`, scripts in `js/story.js` (split per act as it grows) |
| Chores and errands | Mama's garden each morning; an errand on most days, asked for at breakfast and Red's to accept or decline (honestly, or obstinately, which is wilful: three obstinate refusals in a week and Maren gives a maintenance correction, which settles it); each accepted errand a promise with a time to begin by; its scenes off the clock (the day moves on when she's done) | *new* `js/chores.js` |
| Tests | Gate logic, stat changes, save and load, safe-word handling for every corrector | `tests/` |

## The correction scene

Today `js/discipline.js` and `js/correction.js` assume Maren is the one taking Red in hand, with "Rose" as the only safe word. Every corrector in the plan needs the same scene with their own body, seat, lines and response to the safe word.

- **Any corrector:** `Discipline.run` takes a corrector profile: who (a figure from `looks.js`), their seat (chair, stool, bench, a log in the wood), their lines per tier and stage, and the stat they weigh most.
- **Any subject:** the lap scene in `js/lap.js` works for whoever is across the lap, so Tom, Lucy and the Barrows can be corrected too, with their own reactions and voices.
- **Two at once:** the bakery (Tom and Red), the forge, the Shoe (Lucy then Red) and the Barrows (Mother Barrow, then Father Barrow correcting her and Wee Barrow). One corrector, subjects in turn, the other watching from a set position. A queue of `{ subject, tier }` in one scene.
- **Witnessed scenes:** Red watching Holt with Maren, or the Barrows with each other. The same scene with the player as onlooker, no Rose button for Red.
- **Safe words per context:**
  - Default: Red says "Rose"; everything stops and the corrector answers her as Rose.
  - The Shoe: Red is there as Rose, the house uses traffic lights, and her word to stop is "Red".
  - Tom: his own word, which he doesn't use. Lucy and the Barrows: their own, set in their scripts.
- **Names while it lasts:** the existing test that Maren never calls her Rose during a correction becomes a rule per context. Every corrector calls her Red or Little Red, except at the Shoe, where she's Rose.

## New characters

Rose, Maren and Hulda exist. Twenty more figures are needed (all now built in `js/toon.js`), each a look in `js/looks.js`, a voice in `js/audio.js` and a portrait for conversations; most can share the body rig in `js/toon.js` with new proportions and clothes.

| Character | First needed | Role | Corrects Red? |
| --- | --- | --- | --- |
| Peter Fowler | 1.1 | Oldest friend, steady; a fowler, living with his grandfather. Tom calls him Piper | No; peer accountability from 2.2 |
| Master Fowler | 1.1 | Peter's grandfather; an old friend of Hulda's | No (a corrector in the bonus story, of Peter) |
| Tom Ferrier | 1.1 | Partner in mischief, apprentice | No; corrected alongside her |
| The smith (Ferrier) | 1.2 | Tom's father and master | Yes, once she's told Tom |
| Mistress Pennock | 1.1 | Baker's wife | Yes, from the pie |
| The baker (Pennock) | 1.2 | Background at the bakery | No |
| Mistress Abney | 1.1 | Innkeeper | Yes, after disclosure |
| Abney's daughter | 1.1 | Sat up with; her confinement in 2.2 | No |
| Old Halloran | 1.1 | Farmer; Rose's quests | No |
| Willie Winkie (William Dunn) | 1.3 | The Watchman, on his rounds at night; Georgie's father. "In his nightgown" is read as his night watchman's garb: a short cape that leaves his arms free, and a tricorn hat. Red thinks of him as Master William, from when she and Georgie were close as children, and calls him Sir, for his office | Yes, from his second catch: Red alone, agreed with her and her mother, at her own hearth with her own slipper |
| Georgie Dunn | 1.1 | The miller's lad, apprenticed at the mill; village colour; the Watchman's son | No |
| Agnes Thatcher | 1.1 | Village colour, a confidante | No |
| Holt | 1.3 | The Woodsman | Yes, after his trust gate |
| Wolfe | 1.3 | The antagonist | No |
| Mother Barrow | 2.1 | The Barrows | Yes, at the trespass |
| Father Barrow | 2.1 | The Barrows | No; corrects the others |
| Wee Barrow | 2.1 | The Barrows; the household's little (Mother and Father call him their wee cub, or little cub) | No |
| Lucy Locket | 2.1 | Friend at the Shoe | No; corrected beside her |
| Mother Brannock | 2.2 | Runs the Shoe | Yes, at the Shoe, as Rose |
| Kitty Fisher | 2.2 | Longest resident of the Shoe (optional) | No |

The village's grown men go by Master and their surname (Master Ferrier the smith, Master Pennock the baker, Master Halloran, Master Fowler), Holt aside; other adults call Tom and Georgie "young Master Ferrier" and "young Master Dunn" when they mean business. Rose and Maren are Ridleys, the name Rose's late father left them: Maren is Mistress Ridley; Rose is Miss Rose to most of the village (as she is to Halloran), Miss Ridley when a villager means business (her counterpart to young Master Ferrier), and Rose Ridley in full when her mother is at her angriest. Only those let into what being Little Red means call her Little Red. The Barrows are a household of three, a hierarchical polycule, not a family; any or all of them can speak as Scots. Hulda needs an injured variant for 3.2, and Red needs her Rose look without the cloak for the Shoe and the finale.

## New locations

The cottage, Hulda's cabin and the path through the wood exist. The village is the biggest new build, and the wood has to become a place to explore rather than a path to walk.

| Location | First needed | What happens there | Builds on |
| --- | --- | --- | --- |
| The cottage's outside and Mary's garden | 1.2 | The daily chore loop | `js/cottage.js` |
| The village: lanes, green, the meadow edge | 1.1 | Walking between everything; curfew at night | `js/village.js` (outsides built: the street, the green, the inn, bakery, forge and cottages; interiors to come) |
| The bakery | 1.2 | Helping out; the pie | *new*, in `js/village.js` |
| The inn | 1.2 | Mistress Abney's work; the confinement in 2.2 | *new*, in `js/village.js` |
| The forge | 1.2 | Tom and the smith | *new*, in `js/village.js` |
| Halloran's farm | 1.1 | Rose's quests; perhaps the strays' fields | *new* |
| The Fowlers' smallholding | 1.1 | Peter and his grandfather at home: the nets, the coop, the meadow gate | *new*, at the meadow's edge |
| The wood, opened out | 1.3 | Paths branching off the existing one; the stream, beech and log | `js/wood.js` |
| The charcoal-burners' | 2.1 | Helping Holt | *new*, in the wood |
| The Barrows' house | 2.1 | The trespass and later visits | *new*, deeper in the wood |
| The Shoe | 2.2 | The night as Rose | *new*, edge of the village |
| Hulda's cabin, wrong | 2.3 | Wolfe waiting: cold hearth, things out of place | `js/cabin.js`, dressed differently |
| Hulda's hiding place | 3.2 | Where she's found | *new*, deepest in the wood |
| Where the village gathers | 3.3 | Wolfe before the village, faced as Rose | The green or the inn |

Each area needs a dusk and a night state for the curfew and for the danger in the wood.

## Milestones

Act 1 playable end to end comes first, because it needs almost every system. Acts 2 and 3 are then mostly content.

1. **Foundations.** World and scene manager, save state, calendar and day/night, quest and gate engine, reputation and openness. Chapter one runs inside the new world rather than as its own page.
2. **Correction, generalised.** Corrector profiles, any subject across the lap, two in a queue, witnessed scenes, safe words per context. Tests for each.
3. **The village.** Lanes and green, the bakery, inn and forge, the garden, the Fowlers' smallholding. Peter and his grandfather, Tom, the smith, Mistress Pennock, Mistress Abney, Halloran, Georgie and Agnes.
4. **Act 1 playable.** Every Act 1 step from the quest plan, Willie Winkie's first catch, Holt and Wolfe's first meetings, and the gate into Act 2.
5. **Act 2.** The opened-out wood, the charcoal-burners', the Barrows, the Shoe, Wolfe's hidden disclosure, the confinement, and the errand to the cabin.
6. **Act 3.** Holt and Maren, the search with a lead from every finished figure, Hulda's hiding place, the trap, and the gathering where Rose speaks.
7. **Polish.** Performance on phones, the installable app, balancing the stats and the pain model across correctors.
