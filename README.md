# Red Lessons

Red Riding Hood and Gerda in a soft toon style (after *The Wind Waker HD* and *Mika and the Witch's Mountain*): an over-the-knee discipline scene with a pain model, scripted corrections, and a simple character editor. Red Riding Hood is 21; Gerda is in her late thirties. Both are adults: grown-up bodies (waist, hips, bust, long legs) under larger-than-life heads, about 5.6 heads tall in all, so their faces can carry big, exaggerated expressions.

Everything is made in code: three.js, no build step, shapes and textures generated in the browser, synthesised sound, no asset files. It installs as a mobile web app.

**The safe word is "Red"**, which is also how people shorten her name. The page calls her Red Riding Hood, and Gerda never calls her "Red" in her lines (a test checks this).

## Run it

```
npm run serve        # http://localhost:8123/ opens the lap scene; /editor.html is the character editor; /play.html walks her round the cottage
npm test             # the pain model, the discipline scripts and the looks
```

## The look (`js/toon.js`, `js/stage.js`)

- **Smooth, rounded characters** with two-band cel shading and a thin warm-brown outline (an inverted hull). The body is skinned to its skeleton, so the trunk, each arm, each leg and the neck are continuous surfaces that bend smoothly through the shoulders, elbows, waist, hips and knees, with the outline running unbroken across them. The bust is sculpted into the torso rather than set on it.
- **Painted faces:** eyes, lids, brows, mouth, blush and tears are drawn onto a thin layer that follows the face, and redrawn as the expression changes, so every feature morphs smoothly (the mouth from a smile through flat to a frown or open; the lids down over the eyes). The nose is a soft 3D slope with a painted shadow. Ten expressions, pushed further than life, ease from one to the next: calm, smile, shy, cheeky, pout, stern, surprised, wince, gritted, crying.
- **Hair:** a cap with a proper hairline and a fringe. Red Riding Hood's long hair hangs from swinging pivots: two locks by her face and the back of it to her shoulder blades. It hangs with gravity, swings as she moves, and settles. Gerda wears hers in a bun, grey at one temple.
- **Clothes:**
  - **Red Riding Hood:** a scarlet capelet, longest at the back, edged in cream, with the hood down on her back or up over her hair. Under it, a cream blouse with puffed sleeves, a dark laced bodice, a blue skirt with a white hem, linen drawers, and boots.
  - **Gerda:** a plum bodice, a cream blouse, an apron and a long brown skirt, bare feet. Or her lavender "Fine" gown with gold bracelets.
  - **How the skirts move:** they are skinned to the legs, so they follow them. Seated, Gerda's skirt is its own drape over her lap and knees.
- **Motion:** blinking, breathing, a standing idle (weight shifting from foot to foot, the head wandering), and springs on everything that reacts, so movement eases and settles instead of snapping.
- **The cottage** (`js/cottage.js`): one modest room. Wattle-and-daub walls limewashed white in an oak frame (sill, posts, rail, braces, wall plate), on a low stone foundation, under a thick thatch roof seen from inside (rafters, purlins, ridge beam, tie beams), with a gable at each end. A planked door with strap hinges, a shuttered window letting a shaft of sun across the floor. A trestle table (jug, bowl, loaf) and two low stools; an iron-bound oak chest; a peg rail hung with dried herbs, lavender and wicker baskets; a raised bed nook with a straw mattress in ticking, a heavy woollen blanket, a patchwork quilt turned down, a bolster, and a curtain tied back. Walls, roof slopes and floor aren't drawn while the camera is outside them (each with whatever stands against it), so the room is open to the camera from any side, above or below.

## Over the knee (`lap.html`, `js/lap.js`)

Gerda sits on a plain chair. Red Riding Hood lies face down across her lap, hips over Gerda's right thigh, head and arms toward the floor on one side, legs on the other.

- **A smack:** Gerda's hand lifts, holds raised (the wait builds dread), swings down along an arc, and lands with the palm flat on the middle of the cheek struck. It stays a moment on the skin, then comes back up for the next one or returns to rest above the small of her back. Her arm is solved every frame (shoulder and elbow bring the wrist into place, and the hand is turned flat to the skin), so it lands exactly wherever Red Riding Hood is, however she moves. With the **paddle**, the blade lands flat instead. Gerda's left hand rests between Red Riding Hood's shoulder blades.
- **Controls:** Smack, Run of 10, Pace and Strength. Space smacks.
- **Her reactions** go through springs: a kick of the legs on the side struck, a lift of the head, and a wriggle that grows with her distress. Her face follows the pain model's bands (calm, wince, gritted, crying), and her voice is synthesised.
- **Clothes:** skirt down or lifted (gathered at her waist); with it lifted, drawers up or down (bunched above her knees). Cloth takes the edge off the sting.
- **Marks:** colour comes up on each cheek with the smacks, and tender skin hurts more.
- **Red** (the button, or R) stops everything at once. Nothing more is struck, and the arm comes back to rest.
- **Cameras:** Side, Behind, Gerda's view, Above, Her face. The camera glides between them, and you can drag to orbit.

## About the cottage (`play.html`, `js/play.js`, `js/motion.js`)

Red Riding Hood on her own in the cottage. **WASD** or the arrows walk her (relative to the camera), **Shift** runs, **E** does whatever's offered (shown at the bottom), **Q** lies down when she's sitting on the bed. Drag to look round her; the camera follows. On a phone: a stick, Run, Use and Lie.

- **Walking and running** (`js/motion.js`, written for any of the figures): the feet are placed, not swung. Each foot plants on the floor and stays put while she passes over it, then lifts and swings to where it'll next land, so they never slide, at any speed or round a turn. The legs are solved to reach them. The hips rise and fall twice a stride, sway over the standing foot and turn with the steps; the shoulders turn against them; the arms swing from where the feet really are. Running is a longer, quicker stride with less time on the ground: the heel kicks up behind, the arms bend, she leans in. She leans into speeding up and banks into turns. Standing, her weight shifts and she breathes; after turning on the spot she takes a small step to set her feet right.
- **In the way:** walls and furniture (and the door, open) hold her back; she slides along them.
- **Things to do:** she walks to the right spot, turns, and reaches (crouching for low things):
  - open and shut **the door** (by its latch) and **the chest** (lifting the lid with both hands);
  - **take** a basket off its peg, or the jug, the bowl or the loaf off the table; carry it (a basket or the jug hangs from one hand, the bowl and the loaf in both); **put it** on the table, on the closed chest, in the open chest, back on an empty peg (baskets), or down on the floor;
  - **sit** on either stool or on the bed, **lie down** on the bed, and get up again.

## Discipline (`js/discipline.js`)

The **Correction** buttons run a scripted correction in four tiers. Gerda talks before each stage and between the runs:

| Tier | Stages | Smacks |
|---|---|---|
| Token | hand, over her skirt | 6 |
| Light | + skirt lifted | 20 |
| Firm | + drawers down | 34 |
| Severe | + the paddle to finish | 44 |

Red ends it there and then, and Gerda's last line is the gentle one. At "too harsh" she stops. `Discipline.run(lap, tier, { say, sleep })` returns `{ hits, peak, red, tooHarsh, done }`.

## The pain model (`js/pain.js`)

Each smack adds a sharp **sting** (fading in seconds) and a deep **ache** (fading over minutes). Distress is their sum against how much she can take. The implement, strength, pace, the wait with the arm raised, the clothing and how tender the skin already is all count. Her skirt and drawers each cushion the sting.

## Character editor (`editor.html`, `js/looks.js`)

Red Riding Hood and Gerda stand side by side in the room, idling and blinking. You can pick:

- **Outfit:** hers is Hood down, Hood up or No cloak; Gerda's is Work or Fine.
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
| `js/lap.js`, `lap.html` | Over the knee: the session, Gerda's arm solving, Red Riding Hood's reactions, the cameras; its page |
| `js/motion.js` | Movement for any figure: walking and running with planted feet, turning, reaching, crouching, carrying, sitting, lying |
| `js/play.js`, `play.html` | About the cottage: the controls, the following camera, what's in the way, the things to do |
| `js/discipline.js` | The scripted correction: tiers, stages, Gerda's lines |
| `js/pain.js` | The pain model |
| `js/looks.js`, `editor.html` | Outfits and colours, and the editor |
| `js/audio.js` | Smacks and her voice, all synthesised |
| `tests/` | `node --test` checks for the pain model, the discipline scripts and the looks |
| `manifest.webmanifest`, `sw.js`, `icons/` | The installable web app |
| `vendor/` | three.js r128 and OrbitControls |
