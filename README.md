# Little Red’s Lessons

**Rose** is nineteen. As a girl she was Little Red to the whole village; she's still Red to her mother, her grandmother, and Peter, her oldest friend, lately something more, which pleases and confuses her. She lives with her mother, **Maren**, in a small cottage at the edge of the village; her father died of a fever one winter when she was very small. Her mother lives by piecework, mending, harvests, births and farm chores, wherever she's needed, and has been leaning on Rose more and more, to ready her for a life that needn't hang on a husband with a trade. Rose is easily distracted, wilful, reluctant to take on responsibility, and much loved. Her grandmother, **Hulda**, lives in the wood, a witch in all but name, valued for her charms and herbs, and she dotes on her.

The story opens on a visit to her grandmother. She's given a red cloak like the one she wore as a child, and called Little Red, and on the long walk home through the darkening wood she understands why it made her so happy: she isn't ready to be grown. Home late in the dusk, she and her mother talk frankly, and Rose finds she wants to be Little Red for a while, and that part of being Little Red is being held to account. Her mother is the first to take her in hand. Through the game she carries that identity into the village and beyond, shares it with others she learns to trust, and learns how being Little Red can help her to be Rose when the cloak comes off. She'll be the heroine of more than one fairytale, her own among them.

**The safe word is her name.** If she says "Rose" while she's being disciplined, she's Rose again, a grown woman who needs a different kind of care: everything stops at once, and her mother answers her as Rose. Her mother calls her Red, or Little Red, and never Rose while it lasts (a test checks this). Rose never uses her mother's or grandmother's names: they're Mama and Grandmother to her.

The look is a soft toon style (after *The Wind Waker HD* and *Mika and the Witch's Mountain*): grown-up bodies under larger-than-life heads, so faces carry big expressions. Everything is made in code: three.js, no build step, shapes and textures generated in the browser, synthesised sound, no asset files. It installs as a mobile web app.

## Run it

```
npm run serve        # http://localhost:8123/ opens chapter one (story.html); /lap.html is the lap scene; /play.html is the cottage to wander; /editor.html is the character editor
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
- **The cottage** (`js/cottage.js`): one modest room. Wattle-and-daub walls limewashed white in an oak frame (sill, posts, rail, braces, wall plate), on a low stone foundation, under a thick thatch roof seen from inside (rafters, purlins, ridge beam, tie beams), with a gable at each end. A planked door with strap hinges, a shuttered window letting a shaft of sun across the floor. A trestle table (jug, bowl, loaf) and two low stools; an iron-bound oak chest; a peg rail hung with dried herbs, lavender and wicker baskets; a stone hearth on the front wall, across from the pegs (a log fire on iron fire-dogs, its flames flickering and throwing a warm, wavering light across the room; an iron pot on a swinging crane, a kettle and fire irons on the hearthstone, a candlestick and jug on the mantel, logs stacked beside it, the chimney breast rising into the thatch); a raised bed nook with a straw mattress in ticking, a heavy woollen blanket, a patchwork quilt turned down, a bolster, and a curtain tied back. Walls, roof slopes and floor aren't drawn while the camera is outside them (each with whatever stands against it), so the room is open to the camera from any side, above or below.

## Chapter one: The Red Cloak (`story.html`, `js/chapter1.js`)

Three scenes, one after the other:

1. **Her grandmother's cabin** (`js/cabin.js`): a log cabin built hard against a great oak, the trunk the back corner of the room, roots and all, with shelves of jars cut into it and two of its limbs running in under the roof as beams hung with herbs. A stone hearth, a rocking chair, a round table laid for tea, a dresser, a box bed under a patchwork quilt, a braided rug, a round window. It opens with tea and cake and being fussed; her grandmother fetches a parcel from the dresser and gives it to her: a red cloak like the one she wore as a girl. She puts it on, turns round to show it, and her grandmother calls her Little Red. Then she's free about the cabin until she goes out of the door.
2. **The wood** (`js/wood.js`): the long path home, a minute and a half's walk if she doesn't dawdle. Her thoughts come as she goes, without stopping her (the realisation, in her own words). She can stop to pick bluebells (and carry them), sit on the flat stone by the stream, find the R and P carved in the old beech, sit on the fallen tree. The light goes from late gold to dusk as she walks, faster when she stands about, faster still sitting. At the edge of the wood the trees give way to a meadow, and over it the village, its windows lit.
3. **Home**, late in the dusk: her mother sees her face at once, and the homecoming conversation, and a card on to the lap scene.

The title screen can start at the wood or at home. Her grandmother, **Hulda**, is a third character: shorter and softer through the middle, grey all through her hair, a knitted shawl over her shoulders, laugh lines.

## Conversations (`js/talk.js`, `js/story.js`)

Played the way *Mika and the Witch's Mountain* plays them: the two of them turn to each other, opened a little toward the camera as on a stage, and the camera settles on a view that holds both. The lines come up in a box at the foot of the screen with a portrait of whoever is speaking (her face, live, close up, with the expression the line calls for) and her name on a tab; Rose's on the left, the other speaker's on the right; narration is italic with no portrait. The words type out and are babbled in that voice. Click, Space, Enter or E finishes a line, then goes on; choices come up as buttons (or 1, 2, 3).

**Chapter one, the homecoming** (a first draft): in the cottage, talk to her mother (E). Rose puts on her grandmother's cloak; the conversation runs from her mother noticing her face, through what's weighing on her, her mother offering to carry everything, Rose's memory of the winter after her father died, to the question of being held to account, and her mother introducing the safe word. It ends with "Cloak off, over the back of the chair, and come here", and a card leads to the lap scene for the correction it earned.

## Over the knee (`lap.html`, `js/lap.js`)

Her mother sits on a plain chair; Little Red lies face down across her lap, hips over her mother's right thigh, head and arms toward the floor on one side, legs on the other.

- **A smack:** her mother's hand lifts, holds raised (the wait builds dread), swings down along an arc, and lands with the palm flat on the middle of the cheek struck. It stays a moment on the skin, then comes back up for the next one or returns to rest above the small of her back. Her arm is solved every frame (shoulder and elbow bring the wrist into place, and the hand is turned flat to the skin), so it lands exactly wherever Little Red is, however she moves. With the **paddle**, the blade lands flat instead. Her mother's left hand rests between Little Red's shoulder blades.
- **Controls:** Smack, Run of 10, Pace and Strength. Space smacks.
- **Her reactions** go through springs: a kick of the legs on the side struck, a lift of the head, and a wriggle that grows with her distress. Her face follows the pain model's bands (calm, wince, gritted, crying), and her voice is synthesised.
- **Clothes:** skirt down or lifted (gathered at her waist); with it lifted, drawers up or down (bunched above her knees). Cloth takes the edge off the sting.
- **Marks:** colour comes up on each cheek with the smacks, and tender skin hurts more.
- **Rose** (the button, or R): she says her name, and everything stops at once. Nothing more is struck, the arm comes back to rest, and her mother answers her as Rose.
- From the story (`lap.html?scene=homecoming`): a card, then a Light correction, her cloak over the chair.
- **Cameras:** Side, Behind, Her mother's view, Above, Her face. The camera glides between them, and you can drag to orbit.

## About the cottage (`play.html`, `js/play.js`, `js/motion.js`)

Rose at home in the cottage, her mother by the hearth. **WASD** or the arrows walk her (relative to the camera), **Shift** runs, **E** does whatever's offered (in the gold chip at the bottom, which can be clicked too), **Q** lies down when she's sitting on the bed, **C** brings the camera in or takes it out, **Esc** opens the menu (settings, the controls, her clothes, the other pages). Drag to look round her; the camera follows.

The controls and menus (`js/hud.js`) are the same in every walking scene and follow Climbing Toward Consequence's: round glass buttons with line icons, and on a touch screen a stick under the left thumb, the action button under the right (labelled with what it'll do, greyed when there's nothing), the other action beside it and Run (held) above. The menu and the camera sit top right. Settings: the volumes, how quickly the words appear in a conversation, and whether lines go on by themselves.

- **Walking and running** (`js/motion.js`, written for any of the figures): a cycle played in place, in her own frame, as on a treadmill, timed to her speed. Each foot lands on its heel, rolls flat and up onto its ball to push off, then swings through; a foot on the ground goes back under her at exactly the speed she goes forward, and is held where it touched down until it lifts (however she turns over it), so nothing slides. The hips sit as high as the planted feet allow with those legs all but straight, easing down into each step as the heel takes the weight; they tilt toward the swinging leg, sway over the standing one and turn with the steps, and the spine levels and counter-turns the shoulders. The arms hang on springs, trailing and following through. Running is nearly three times walking pace, with time in the air: the heel tucks up, the knee drives through, the arms pump bent, she leans in. Turning on the spot she steps round; stopping, she steps her feet in under her.
- **Standing:** her weight on one straight leg, the hip on that side up and the other knee easy, that foot a little forward and turned out, the shoulders tilted back the other way; it changes legs every twelve seconds or so (the editor's figures stand the same way).
- **In the way:** walls and furniture (and the door, open) hold her back; she slides along them.
- **Things to do:** she walks to the right spot, turns, and reaches (crouching for low things):
  - open and shut **the door** (by its latch) and **the chest** (lifting the lid with both hands);
  - **take** a basket off its peg, or the jug, the bowl or the loaf off the table; carry it (a basket or the jug hangs from one hand, the bowl and the loaf in both); **put it** on the table, on the closed chest, in the open chest, back on an empty peg (baskets), or down on the floor;
  - **sit** on either stool or on the bed, **lie down** on the bed, and get up again.

## Discipline (`js/discipline.js`)

The **Correction** buttons run a scripted correction in four tiers. Her mother talks before each stage and between the runs:

| Tier | Stages | Smacks |
|---|---|---|
| Token | hand, over her skirt | 6 |
| Light | + skirt lifted | 20 |
| Firm | + drawers down | 34 |
| Severe | + the paddle to finish | 44 |

Her name, Rose, ends it there and then, and her mother's last line is the gentle one, to Rose. At "too harsh" she stops. `Discipline.run(lap, tier, { say, sleep })` returns `{ hits, peak, rose, tooHarsh, done }`.

## The pain model (`js/pain.js`)

Each smack adds a sharp **sting** (fading in seconds) and a deep **ache** (fading over minutes). Distress is their sum against how much she can take. The implement, strength, pace, the wait with the arm raised, the clothing and how tender the skin already is all count. Her skirt and drawers each cushion the sting.

## Character editor (`editor.html`, `js/looks.js`)

Rose and her mother stand side by side in the room, idling and blinking. You can pick:

- **Outfit:** hers is No cloak (the default), Hood down or Hood up; her mother's is Work or Fine.
- **Colours:** skin, hair, eyes and lips for both, and the colour of her cloak. Choose from a row of swatches or pick any colour.
- **Her face:** preview each expression.

**Shapes and proportions:** every number the figures are built from, in groups (proportions, each character's size, bust and skirt length, body widths, bust, seat, face, hair, clothes, outline and shading), as number boxes with step arrows (↑ ↓, Shift for ten steps). Changed values show in gold; each group resets on its own, and **Copy values** copies the ones you changed. They're kept in the browser and the lap scene uses them.

Views: front, side, back, faces, or turning. Changes are saved in the browser straight away, and the lap scene uses them. **Back to their own colours** resets both.

## Files

| File | What it is |
|---|---|
| `js/toon.js` | The characters: the rig (bones), bodies, faces and expressions, hair, clothes, skinned skirts, marks; the chair and the paddle |
| `js/stage.js` | Renderer, lights and shadows, the camera and its glides |
| `js/cottage.js` | The cottage: walls, frame, foundation, thatch, door and window, the furniture and everything hanging |
| `js/lap.js`, `lap.html` | Over the knee: the session, her mother's arm solving, Little Red's reactions, the cameras; its page |
| `js/motion.js` | Movement for any figure: walking and running with planted feet, turning, reaching, crouching, carrying, sitting, lying |
| `story.html`, `js/chapter1.js` | Chapter one: the cabin, the wood, home |
| `js/cabin.js` | Her grandmother's log cabin round the great oak |
| `js/wood.js` | The wood: the path, the trees, the spots, the stream, the village beyond, the failing light |
| `js/talk.js` | Conversations: the two-shot, the box, the live portrait, typing and voices, choices |
| `js/story.js` | The story's conversations (chapter one: the homecoming) |
| `js/hud.js` | The controls and menus for the walking scenes: keys, the touch stick and buttons, the action chip, the camera button, the pause menu and settings, the controls sheet |
| `js/play.js`, `play.html` | About the cottage: the controls, the following camera, what's in the way, the things to do |
| `js/discipline.js` | The scripted correction: tiers, stages, her mother's lines |
| `js/pain.js` | The pain model |
| `js/looks.js`, `editor.html` | Outfits and colours, and the editor |
| `js/audio.js` | Smacks and her voice, all synthesised |
| `tests/` | `node --test` checks for the pain model, the discipline scripts and the looks |
| `manifest.webmanifest`, `sw.js`, `icons/` | The installable web app |
| `vendor/` | three.js r128 and OrbitControls |
