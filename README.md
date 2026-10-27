# Little Red’s Lessons

**Rose** is nineteen. As a girl she was Little Red to the whole village; she's still Red to her mother, her grandmother, and Peter, her oldest friend, lately something more, which pleases and confuses her. She lives with her mother, **Maren**, in a small cottage at the edge of the village; her father died of a fever one winter when she was very small. Her mother lives by piecework, mending, harvests, births and farm chores, wherever she's needed, and has been leaning on Rose more and more, to ready her for a life that needn't hang on a husband with a trade. Rose is easily distracted, wilful, reluctant to take on responsibility, and much loved. Her grandmother, **Hulda**, lives in the wood, a witch in all but name, valued for her charms and herbs, and she dotes on her.

The story opens on a visit to her grandmother. She's given a red cloak like the one she wore as a child, and called Little Red, and on the long walk home through the darkening wood she understands why it made her so happy: she isn't ready to be grown. Home late in the dusk, she and her mother talk frankly, and Rose finds she wants to be Little Red for a while, and that part of being Little Red is being held to account. Her mother is the first to take her in hand. Through the game she carries that identity into the village and beyond, shares it with others she learns to trust, and learns how being Little Red can help her to be Rose when the cloak comes off. She'll be the heroine of more than one fairytale, her own among them.

**The safe word is her name.** If she says "Rose" while she's being disciplined, she's Rose again, a grown woman who needs a different kind of care: everything stops at once, and her mother answers her as Rose. Her mother calls her Red, or Little Red, and never Rose while it lasts (a test checks this). Rose never uses her mother's or grandmother's names: they're Mama and Grandmother to her.

The look is a soft toon style (after *The Wind Waker HD* and *Mika and the Witch's Mountain*): grown-up bodies under larger-than-life heads, so faces carry big expressions. Everything is made in code: three.js, no build step, shapes and textures generated in the browser, synthesised sound, no asset files. It installs as a mobile web app.

## Run it

```
npm run serve        # http://localhost:8123/ opens chapter one (story.html); /lap.html is the correction test; /editor.html is the character editor; /rooms.html is the room editor
npm test             # the pain model, the discipline scripts and the looks
```

## The look (`js/toon.js`, `js/stage.js`)

- **Smooth, rounded characters** with two-band cel shading and a thin warm-brown outline (an inverted hull). The body is skinned to its skeleton, so the trunk, each arm, each leg and the neck are continuous surfaces that bend smoothly through the shoulders, elbows, waist, hips and knees, with the outline running unbroken across them. The bust is sculpted into the torso rather than set on it.
- **Painted faces:** eyes, lids, brows, mouth, blush and tears are drawn onto a thin layer that follows the face, and redrawn as the expression changes, so every feature morphs smoothly (the mouth from a smile through flat to a frown or open; the lids down over the eyes). The nose is a soft 3D slope with a painted shadow. Ten expressions, pushed further than life, ease from one to the next: calm, smile, shy, cheeky, pout, stern, surprised, wince, gritted, crying.
- **Hair:** a cap with a proper hairline and a fringe. Rose's long hair hangs from swinging pivots: two locks by her face and the back of it to her shoulder blades. It hangs with gravity, swings as she moves, and settles. Her mother wears hers in a bun, grey at one temple.
- **Clipping:** a covered part (skin under the skirt or in the boots, the drawers under the skirt, the blouse under the bodice, her mother's skirt behind her apron) keeps its own colour unless it pokes through what covers it; there, it's drawn in that layer's colour, so it reads as a fold of the cloth rather than something showing through. (Each frame, each figure's outer clothes are drawn on their own as depth first; a covered point in front of its layer's outer surface is one that has come through.)
- **Clothes:**
  - **Rose:** her grandmother's scarlet cloak, a capelet, longest at the back, edged in cream, with the hood down on her back or up over her hair. Under it, a cream blouse with puffed sleeves, a dark laced bodice, a skirt in the red of her cloak with a white hem, linen drawers, and boots.
  - **Her mother:** a plum bodice, a cream blouse, an apron and a long brown skirt, bare feet. Or her lavender "Fine" gown with gold bracelets.
  - **How the skirts move:** they are skinned to the legs, so they follow them. Seated, her mother's skirt is its own drape over her lap and knees.
- **Motion:** blinking, breathing, a standing idle (weight shifting from foot to foot, the head wandering), and springs on everything that reacts, so movement eases and settles instead of snapping.
- **The cottage** (`js/cottage.js`): one modest room. Wattle-and-daub walls limewashed white in an oak frame (sill, posts, rail, braces, wall plate), on a low stone foundation, under a thick thatch roof seen from inside (rafters, purlins, ridge beam, tie beams), with a gable at each end. A planked door with strap hinges, up on the foundation, with three stone steps down from it into the room (walked up and down: the figures step onto each),, a shuttered window letting a shaft of sun across the floor. A trestle table (jug, bowl, loaf) and two low stools; an iron-bound oak chest; a peg rail hung with dried herbs, lavender and wicker baskets; a stone hearth on the front wall, across from the pegs (a log fire on iron fire-dogs, its flames flickering and throwing a warm, wavering light across the room; an iron pot on a swinging crane, a kettle and fire irons on the hearthstone, a candlestick and jug on the mantel, logs stacked beside it, the chimney breast rising into the thatch); a raised bed nook with a straw mattress in ticking, a heavy woollen blanket, a patchwork quilt turned down, a bolster, and a curtain tied back. Walls, roof slopes and floor aren't drawn while the camera is outside them (each with whatever stands against it), so the room is open to the camera from any side, above or below.

## The world (`js/world.js`, `js/save.js`, `js/calendar.js`, `js/reputation.js`, `js/quests.js`, `js/questdata.js`)

The game is an open world with a saved game, following the quest plan (`docs/quest-plan.md`) and the build plan (`docs/build-plan.md`). So far the places are the cottage, the wood and her grandmother's cabin: the cottage door gives onto the wood's village end (until the village is built), the wood's far end leads back to the cabin door, and each way out is a way in somewhere else.

- **The saved game** (`js/save.js`): where she is and when, every quest step done and on which day, her reputation, trust and openness with each figure, what she's told Wolfe, what she carries. Kept in the browser on every change; **Continue** on the title takes it up where it was left.
- **The calendar** (`js/calendar.js`): the day and the time of day (dawn, morning, afternoon, evening, dusk, night), the light that goes with it, and the curfew bell at nine. A game minute passes for each second she's out and about (not while she's talking, or busy); sleeping (the bed, at home, from the evening on) moves on to the next morning. The day and time are top left, with the phase of the story.
- **Her reputation** (`js/reputation.js`): wilful, mischievous and naughty; trust and openness with each figure (0 doesn't know, 1 she's told them what being Little Red means, 2 she's asked them to take her in hand); how far it's known in the village; what she's told Wolfe, never shown.
- **The quests** (`js/quests.js`, the plan as data in `js/questdata.js`): every quest line's steps, the nine phases of the three acts, and the gates. A step is offered when its line has come to it, its phase is reached, its condition holds and its gate is open; going into a place plays the scene for the step on offer there. The pause menu's **Her days** shows where each line has got to. Every figure in the story is an adult (their ages are in the data, and a test holds to it).

So far chapter one (phase 1.1) is played through the world, and phase 1.2 opens the next morning with her mother agreeing her chores and the curfew. The rest of the plan's steps are in the data, waiting for their places and scenes.

## Chapter one: The Red Cloak (`story.html`, `js/chapter1.js`)

The scenes, played by the world as their steps come up:

1. **Her grandmother's cabin** (`js/cabin.js`): a log cabin built hard against a great oak, the trunk the back corner of the room, roots and all, with shelves of jars cut into it and two of its limbs running in under the roof as beams hung with herbs. A stone hearth, a rocking chair, a round table laid for tea, a dresser, a box bed under a patchwork quilt, a braided rug, a round window. It opens with tea and cake and being fussed; her grandmother fetches a parcel from the dresser and gives it to her: a red cloak like the one she wore as a girl. She puts it on, turns round to show it, and her grandmother calls her Little Red. Then she's free about the cabin until she goes out of the door.
2. **The wood** (`js/wood.js`): the long path home. Her thoughts come as she goes, without stopping her (the realisation, in her own words). Three places stop her: the bluebells (she picks a posy), the stream (she sits on the flat stone) and the old beech (the R and P). At each she can choose to stay longer: an armful of bluebells, a while thinking by the water about being responsible, a while with the carving and her memories of Peter. The time goes with the path (whatever her pace), each stop and each time she stays, so she's home in the dusk at the least, and well into it if she lingers; she can also sit on the fallen tree. At the edge of the wood the trees give way to a meadow, and over it the village, its windows lit.
   Home, she carries the bluebells in (a posy, or an armful): her mother's first clue that she didn't come straight home. Asked if she did, she can come clean or insist she did. Each place she stayed, and a lie, makes the correction heavier: the main part runs longer, her mother scolding her for each, before the hairbrush comes out (always twelve).
3. **The village** (`js/village.js`), on the way: out of the wood at the meadow gate and down the street to her own door. (See *The village*, below.)
4. **Home**, late in the dusk: it opens on her mother by the hearth, waiting, concerned, turned to the open door, as Rose comes in and down the steps in her cloak; then her mother sees her face at once, and the homecoming conversation. Then the correction, played there in the room (`js/correction.js`): a fade, the chair at the middle of the room and the lap scene in it, a Light correction scripted by `js/discipline.js`, her mother's lines in the conversation box over the smacks. The round camera button steps round the angles; the octagon, **ROSE** (or R), is her name, and stops it at once. Then the two of them by the fire, the end of the chapter, and on to the next morning.

The title screen can begin again, continue, or start chapter one at the wood or at home. Her grandmother, **Hulda**, is a third character: shorter and softer through the middle, grey all through her hair, a knitted shawl over her shoulders, laugh lines.

## The village (`js/village.js`)

The village from outside, built as the cottage and the cabin are (limewashed daub in an oak frame on a stone footing, thick thatch with its ridge capped, the same textures and ink) and at the same scale. One street runs through it, from the meadow gate in the north-west (and the wood beyond) to the east gate and the farms; the green lies south of it, with the well, the old lime tree with a bench round it, and the curfew bell on its frame, and a lane loops round the green's far side, with the lane south to the mill off it.

- **Maren's cottage**, nearest the wood: its walls are the room's own, so her door (on the west end), her windows and the hearth's chimney are where they are inside. Her door opens and she goes in; out of it, she's on the path to the street. Her vegetable garden is behind.
- **The inn** (Mistress Abney's): across the street from the green, two floors, its sign (a wheatsheaf) over the street, benches and a table, barrels, a lantern by the door.
- **The bakery** (Mistress Pennock's): at the green's east end, the bread oven a stone dome against its gable, a loaf on its sign, the window's board let down as a counter with loaves on it.
- **The forge** (Master Ferrier's): stone, its front open onto the lane, the hearth glowing inside, the anvil on its stump, the slack tub, a cart wheel.
- **The cottages**: next door to Maren's, the Thatchers' (Agnes's), the Dunns' (the Watchman's, a lantern by the door for his rounds), and four more; gardens of vegetables and flowers in hurdle fences.
- **Round it**: low stone walls along the street and lanes, an orchard, ploughed strips and a hayfield with its stacks, hedges, and trees thickening toward the wood. The east and south lanes end at gates, shut for now.

Only the outsides for now: her door is the one that opens. At dusk the windows and lanterns light. Outdoors the camera is kept out of the buildings, pulled in toward her when one is in the way. The still parts are merged by material once built, so the whole village draws in a couple of hundred calls.

## Conversations (`js/talk.js`, `js/story.js`)

Played the way *Mika and the Witch's Mountain* plays them: the two of them turn to each other, opened a little toward the camera as on a stage, and the camera settles on a view that holds both. The lines come up in a box at the foot of the screen with a portrait of whoever is speaking (her face, live, close up, with the expression the line calls for) and her name on a tab; Rose's on the left, the other speaker's on the right; narration is italic with no portrait. The words type out and are babbled in that voice. Click, Space, Enter or E finishes a line, then goes on; choices come up as buttons (or 1, 2, 3).

**Chapter one, the homecoming** (a first draft): in the cottage, talk to her mother (E). Rose puts on her grandmother's cloak; the conversation runs from her mother noticing her face, through what's weighing on her, her mother offering to carry everything, Rose's memory of the winter after her father died, to the question of being held to account, and her mother introducing the safe word. It ends with "Now, come here, young lady." (her cloak stays on: she keeps it on, through the correction and after, until bed, since taking it off would be to be Rose again), and the correction it earned follows there and then, in the same room (as in the story).

## Over the knee (`js/lap.js`), and the correction test (`lap.html`)

Her mother sits on a plain chair; Little Red lies face down across her lap, hips over her mother's right thigh, head and arms toward the floor on one side, legs on the other. Each cheek rolls round with its thigh while the hips stay put, so across the lap the back of the hips (and the drawers or trousers over it) is drawn in between the cheeks and the waist, and nothing stands up there like a tailbone (the Seat group's **Small of the back, over a lap** sets how far).

- **A smack:** her mother's hand lifts, holds raised (the wait builds dread), swings down along an arc, and lands with the palm flat on the middle of the cheek struck. It stays a moment on the skin, then comes back up for the next one or returns to rest above the small of her back. Her arm is solved every frame (shoulder and elbow bring the wrist into place, and the hand is turned flat to the skin), so it lands exactly wherever Little Red is, however she moves. With an implement (on the test page, **her hairbrush**), its face lands flat instead. Her mother's left hand rests between Little Red's shoulder blades.
- **The correction test** (`lap.html`), laid out like Climbing Toward Consequence's correction positions page, over the knee only:
  - **Who:** a corrector and who's across the lap, each chosen from the whole cast, as in the editor (the pair is remembered).
  - **The correction:** Smack, Run of any number, Stop, End the correction, and the safe word, named for whoever is across the lap (Rose for Red; their own where they have a profile; Red, the traffic light's, where they don't). Pace and strength step up and down. Space smacks; R is the safe word.
  - **Distress:** the meter, the band and the count; a summary when it ends.
  - **Implement:** the hand, and the corrector's own implement when they have one (Maren's hairbrush, Master Ferrier's strap, Red's own slipper for William, and so on). Anyone who isn't a corrector has the hand only.
  - **Side** (alternate, left, right), **clothes** (a skirt down or lifted, or trousers up or down; then the drawers), and the **wardrobe** for whichever of the two has outfits.
  - **Scripted:** a tier played with the corrector's own lines (js/discipline.js), the chosen implement coming out for the last stage.
  - **Camera** and **scene** (clear marks, sound, start again).
- **Her reactions** go through springs: a kick of the legs on the side struck, a lift of the head, and a wriggle that grows with her distress. Her face starts in a pout and follows the pain model's bands (pout, wince, gritted); each smack flickers it one on for a moment (pout to wince, wince to gritted, gritted to crying), and once she's reached the edge of resistance it's crying, held, and her voice is synthesised.
- **Clothes:** skirt down or lifted (gathered at her waist); with it lifted, drawers up or down (bunched above her knees). Cloth takes the edge off the sting.
- **Marks:** colour comes up on each cheek with the smacks, and tender skin hurts more.
- **Rose** (the button, or R): she says her name, and everything stops at once. Nothing more is struck, the arm comes back to rest, and her mother answers her as Rose.
- The story plays its corrections in its own scene (`js/correction.js` embeds this one). A story correction can be **scripted** as a dialogue between the two of them over the smacks, as Climbing Toward Consequence does (a turn's `script`: lines, runs of smacks, the clothes and implement changed as it goes); the tiers of `js/discipline.js` stay for the procedural ones. Only the safe word stops a scripted correction, never the pain model's "too harsh". A script can also have the giver's hand lift the skirt, draw the drawers down, or soothe (the palm in slow circles on each cheek, an implement passed to the other hand meanwhile), and send the one across the lap to fetch the implement: up off the lap, across the room as she is (her colour, her clothes and her hurt held where they were), back to present it, and told back into place. Counts come after each stroke lands. The first, the homecoming's, is `Story.homecomingCorrection`: about 130 smacks over three minutes, skirt down, lifted, then drawers down, and the hairbrush to finish, which she's sent to fetch from the chest, every stroke counted after it lands, her mother soothing her after, bringing her past the edge of her resistance.
- **After** (`lap.after(kind)`): sat up on the giver's lap, side on, her back to the giver's left and her legs over the right thigh. **Held**, in high distress: dressed as the correction left her, her head down in the giver's shoulder (or chest, if she sits too low to reach the shoulder), the giver's arms wrapped round her, the giver's head relaxed and facing forward, resting against hers; she shakes a little as she cries. **Upright**, after the safe word: dressed again, sitting up, the giver's left hand in the small of her back and the right on her far knee. The story's after-scene (`Correction.run`'s `after`) is played in whichever fits: upright after her name, held past the edge of her resistance (or too harsh), otherwise in the room as before. The correction test's **After** buttons show both.
- **Where the hand lands:** Shapes › Seat › *Where the hand lands* moves the landing (and the soothing) toward the thighs or the waist; the editor's *Hand landing* and *Soothing* poses hold the hand there to look at.
- **Cameras:** Side, Behind, the corrector's view, Above, the face across the lap, and the corrector's face (the corrector sits upright enough to read: looking down at the lap with the eyes and a little of the neck, not a hunch). The camera glides between them, and you can drag to orbit. The game's correction steps through the same angles, the corrector's face among them.

## About the cottage (`play.html`, `js/play.js`, `js/motion.js`)

Rose at home in the cottage, her mother by the hearth. **WASD** or the arrows walk her (relative to the camera), **Shift** runs, **E** does whatever's offered (in the gold chip at the bottom, which can be clicked too), **Q** lies down when she's sitting on the bed, the camera button (top right) or the wheel steps the camera between near, medium and far, **Esc** opens the menu (settings, the controls, her clothes, the other pages).

**The camera, between scenes:** indoors it's anchored at the middle of the room, not on her, at medium distance to begin with; outdoors it's anchored on her, she in the middle of the view, and goes with her. Either way, a drag moves it any way about the anchor, round it and up over it or down toward the floor (where it’s turned, it stays), and the camera button or the wheel for near, medium or far; on a touch screen, a pinch anywhere between near and far. Seen from the wood, any part of her grandmother's cabin between the camera and her is cut away while it's there.

The controls and menus (`js/hud.js`) are the same in every walking scene and follow Climbing Toward Consequence's: round glass buttons with line icons, and on a touch screen a stick under the left thumb, the action button under the right (labelled with what it'll do, greyed when there's nothing), the other action beside it and Run (held) above. The menu and the camera sit top right. Settings: the volumes, how quickly the words appear in a conversation, and whether lines go on by themselves.

- **Walking and running** (`js/motion.js`, written for any of the figures): a cycle played in place, in her own frame, as on a treadmill, timed to her speed. Each foot lands on its heel, rolls flat and up onto its ball to push off, then swings through; a foot on the ground goes back under her at exactly the speed she goes forward, and is held where it touched down until it lifts (however she turns over it), so nothing slides. The hips sit as high as the planted feet allow with those legs all but straight, easing down into each step as the heel takes the weight; they tilt toward the swinging leg, sway over the standing one and turn with the steps, and the spine levels and counter-turns the shoulders. The arms hang on springs, trailing and following through. Running is nearly three times walking pace, with time in the air: the heel tucks up, the knee drives through, the arms pump bent, she leans in. Turning on the spot she steps round; stopping, she steps her feet in under her.
- **Standing:** her weight on one straight leg, the hip on that side up and the other knee easy, that foot a little forward and turned out, the shoulders tilted back the other way; it changes legs every twelve seconds or so (the editor's figures stand the same way).
- **In the way:** walls and furniture (and the door, open) hold her back; she slides along them.
- **Things to do:** she walks to the right spot, turns, and reaches (crouching for low things):
  - open and shut **the door** (by its latch) and **the chest** (lifting the lid with both hands);
  - **take** a basket off its peg, or the jug, the bowl or the loaf off the table; carry it (a basket or the jug hangs from one hand, the bowl and the loaf in both); **put it** on the table, on the closed chest, in the open chest, back on an empty peg (baskets), or down on the floor;
  - **sit** on either stool or on the bed, **lie down** on the bed, and get up again.

## Corrections, generalised (`js/correction.js`, `js/correctors.js`, `js/implements.js`)

Anyone can take anyone in hand, in the room where the story is. `Correction.run(play, { corrector, turns, watchers, context, player })`:

- **The corrector** (`js/correctors.js`): who they are (a figure), their seat, the stat they mind, their lines in their own voice (drafts, to be written as the story is), and their own implement. Correctors use their hand, or their own second implement; there's no standard one. Which, and from when, is the story's to say (a turn's `implement`, `implementFrom`), never the tier's.
- **The implements** (`js/implements.js`, their pain in `js/pain.js`): Maren's hairbrush, Mistress Pennock's baker's paddle, Master Ferrier's strap, Mistress Abney's wooden spoon, Willie Winkie's use of Red's own slipper, from her hearth, Holt's switch, Mother Barrow's spurtle, Father Barrow's tawse, Mother Brannock's birch. Each is held in the hand, strikes with its own face, and marks and stings in its own way.
- **Turns**: subjects in turn across the lap, each with their tier; after a turn, to **the corner** if the story says (facing into it, hands on head, skirt as the story says), until their next turn or the end, then corner time, and the corrector's last word.
- **Watchers**: others in the room, seated on one of its seats or standing.
- **Safe words**, per subject and context: Red's is her own name, Rose (the octagon, or R), there only on her own turn; at the Shoe she's Rose, her word is Red, and the house's traffic lights add AMBER (or A), a check-in the corrector answers before going gentler. No corrector says the word except to answer it (a test holds every corrector's lines to it).
- The camera button steps round the lap's angles, the whole room, and whoever's in the corner.

The cottage page's menu has **Try a correction**: how much, her mother's hairbrush (not at all, at the end, throughout), her grandmother sitting or standing by, the corner after (skirt down or up).

## Discipline (`js/discipline.js`)

The **Correction** buttons run a scripted correction in four tiers. The corrector talks before each stage and between the runs. A tier says only what's on and how many; the implement is the story's (the hand, or the corrector's own from the stage the story chooses):

| Tier | Stages | Smacks |
|---|---|---|
| Token | over her skirt | 6 |
| Light | + skirt lifted | 20 |
| Firm | + drawers down | 34 |
| Severe | + a longer, harder last stage | 46 |

The subject's safe word (Red's is Rose) ends it there and then, and the corrector's last line is the gentle one, answering it. At "too harsh" they stop. `Discipline.run(lap, tier, { corrector, subject, context, implement, implementFrom, corner, say, sleep })` returns `{ hits, peak, stopped, tooHarsh, done, implement }`.

## The pain model (`js/pain.js`)

Each smack adds a sharp **sting** (fading in seconds) and a deep **ache** (fading over minutes). Distress is their sum against how much she can take. The implement, strength, pace, the wait with the arm raised, the clothing and how tender the skin already is all count. Her skirt and drawers each cushion the sting.

## Room editor (`rooms.html`)

The rooms, empty, to arrange: the cottage (the rug, the bed nook, the chest, the peg rail with its herbs and baskets, the trestle table and its two stools) and her grandmother's cabin (the rug, the rocking chair, the basket of wool, the round table, Red's stool and her grandmother's chair, the dresser, the box bed). The hearth, the door and the window are the walls', and stay. Click a piece of furniture to choose it (a box is drawn round it) and drag it across the floor, to the half unit (Alt for free); the arrows nudge it as the camera sees the floor (Shift for five), Q and E turn it by fifteen degrees, or type where it goes and how it's turned. Views from above and from each side; Rose standing in the room for the size of things. What's on a piece (the tea things on the table, the parcel on the dresser, the baskets on the pegs) goes with it, and so do where it's sat on, put things on and walked round; and a piece goes with the wall it stands nearest (hidden with it while the camera's outside it), or with the floor. The layout is kept in the browser and the game builds the room from it; **Copy layout** gives it as it is, to be set as the room's own (`ROOM` in `js/cottage.js` and `js/cabin.js`; the cabin's is as arranged in the editor).

## Character editor (`editor.html`, `js/looks.js`)

Any two of the cast stand side by side on a plain floor against a plain backdrop, idling and blinking: choose each from the **Left** and **Right** lists (the pair is remembered). All twenty-three are built: Rose, Maren and Hulda; Peter Fowler and his grandfather, Master Fowler; Tom and Master Ferrier; Mistress and Master Pennock; Mistress Abney and Bess; Master Halloran; William Dunn, the Watchman (his night watchman's garb: a short cape that leaves his arms free, set aside when he sits to correct her, and a tricorn hat) and Georgie, the miller's lad; Agnes; Holt; Wolfe (amber eyes, a long dark coat); Mother, Father and Wee Barrow; Lucy Locket; Mother Brannock and Kitty Fisher, of the Shoe. Each is built from a spec in `js/toon.js` (`SPECS`): sex, size and build, hair and beard, hat, top, waistcoat, jerkin or coat, sleeves, skirt, trousers or gown, apron, shawl, footwear, and their colours.

For each of the two you can pick:

- **Outfit:** Rose's is No cloak (the default), Hood down or Hood up; her mother's is Work or Fine.
- **Colours:** skin, hair, eyes and lips for anyone, and the colour of Rose's cloak. Choose from a row of swatches or pick any colour. **Back to their own colours** resets that one.
- **Face:** preview each expression.

**Skirts, trousers:** on, lifted (skirts) and down (trousers: heavier and looser than drawers, they fall and pool round the ankles, the waist and seat a loop of cloth joined round both, sagging a little between the legs), or off. **Drawers:** up or down, once the skirt or trousers are lifted, down or off. **Pose:** standing, or over the knee: the right one across the left one's knee, as the lap scene builds it; the hand landing on the left or right cheek, held still (Front is close on the seat), or soothing; and after, on the lap: held, or upright.

**Shapes and proportions:** every number the figures are built from, in groups (proportions, body widths, bust, seat, face, hair, clothes, outline and shading). These are everyone's baseline. **Characters** shows how each of the two on show differs from it: overall size, bust and skirt length where they have them, and shoulder, chest, waist and hip width, arm, leg and neck thickness, jaw, nose and eye size, and the seat's spacing, depth, width, the height of each cheek and roundness, as multipliers (1 is the baseline), and its height, moved up or down from the baseline's (0). The men's seats are narrower, shallower and less round by default, within their narrower hips, and their drawers, trousers and shirt tails follow. **Back to their own shape** undoes one character's changes. All of them are number boxes with step arrows (↑ ↓, Shift for ten steps). Changed values show in gold; each group resets on its own, and **Copy values** copies the ones you changed. They're kept in the browser and the lap scene uses them.

Views: front, side, back, faces, or turning. Changes are saved in the browser straight away, and every scene uses them.

## Files

| File | What it is |
|---|---|
| `js/toon.js` | The characters: the rig (bones), bodies, faces and expressions, hair, clothes, skinned skirts, marks; the chair |
| `js/stage.js` | Renderer, lights and shadows, the camera and its glides |
| `js/cottage.js` | The cottage: walls, frame, foundation, thatch, door and window, the furniture and everything hanging |
| `js/mocap.js`, `mocap.html` | Motion capture: Mixamo's idle, walk, run, strafes, turns and jump, converted from FBX and retargeted to the rig, played by `js/motion.js` under everything but sitting, lying, crouching, reaching, carrying and looking; the viewer plays one clip on one figure |
| `js/lap.js`, `lap.html` | Over the knee: the session, the corrector's arm solving, the reactions of whoever is across the lap, the cameras; the correction test |
| `js/motion.js` | Movement for any figure: walking and running with planted feet, turning, reaching, crouching, carrying, sitting, lying |
| `story.html`, `js/chapter1.js` | The game's page; chapter one's scenes (the cabin, the wood, home) |
| `js/world.js` | The places, the ways between them, and playing each step's scene; time, light and her place kept as she goes |
| `js/save.js`, `js/calendar.js`, `js/reputation.js` | The saved game; the day and time, curfew and light; her reputation, trust and openness |
| `js/quests.js`, `js/questdata.js` | The quest engine; the quest plan as data (people, phases, lines and steps, gates) |
| `docs/quest-plan.md`, `docs/build-plan.md` | The story's quest lines by phase; what they need from the code, and the milestones |
| `js/cabin.js` | Her grandmother's log cabin round the great oak |
| `js/wood.js` | The wood: the path, the trees, the spots, the stream, the village beyond, the failing light |
| `js/village.js` | The village from outside: the street and the green, the inn, the bakery, the forge and the cottages (Maren's with her own door), lanes, walls, gardens, fields, the light at dusk |
| `js/talk.js` | Conversations: the two-shot, the box, the live portrait, typing and voices, choices |
| `js/correction.js` | A correction in the story's own scene: any corrector, subjects in turn, watchers, the corner, the safe word by context |
| `js/correctors.js`, `js/implements.js` | Correctors and subjects (lines, implements, safe words, names, contexts); each corrector's own implement, its model and its marks |
| `js/story.js` | The story's conversations (chapter one: the homecoming, and after the correction) |
| `js/hud.js` | The controls and menus for the walking scenes: keys, the touch stick and buttons, the action chip, the camera button, the pause menu and settings, the controls sheet |
| `js/play.js`, `play.html` | About the cottage: the controls, the following camera, what's in the way, the things to do |
| `js/discipline.js` | The scripted correction: tiers, stages, her mother's lines |
| `js/pain.js` | The pain model |
| `js/looks.js`, `editor.html` | Outfits and colours, and the editor |
| `js/audio.js` | Smacks and her voice, all synthesised |
| `tests/` | `node --test` checks for the pain model, the discipline scripts and the looks |
| `manifest.webmanifest`, `sw.js`, `icons/` | The installable web app |
| `vendor/` | three.js r128 and OrbitControls |
