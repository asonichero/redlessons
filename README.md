# Red Lessons

A blocky, open-world adult adventure from the Whisperwood, built on the engine of *Climbing Toward Consequence* (the Jack and the Beanstalk game, [asonichero/consequence](https://github.com/asonichero/consequence)).

The heroine is a grown woman who lives with her mother, the village baker, and has stopped coping with adult life. Grandmother gives her a waist-length red cloak. While she wears it she is small, and the village strikes a bargain with her: **no adult responsibility, but not no consequences.** Every villager keeps a book of their own terms; break one and it is written down, and when a book is full that villager calls her in to settle it. Take the cloak off and she is full height again, with a bakery to help run.

She has never heard the tale of Red Riding Hood. The Wolf, when he comes, will offer the one thing the village won't: to wipe the books clean.

## Status: milestone 2, over the knee

Built: the title screen over a drone view of the village, the content notice, settings, saves and the pause menu (all ported from the Jack game); the cast on the blocky rig; the opening cutscene (Grandmother gives the cloak and the village names its terms); the free-roam village with the ledger running; the reckoning, where a giver calls her in and she owns up or lies; and the correction that follows it, over the giver's knee.

## Over the knee (`js/lap.js`, `js/correction.js`, `lap.html`)

One position only: the giver seated on a plain chair, the heroine face down across their lap, hips over the right knee. It is the Jack game's lap scene cut down to that position and refitted for her:

- **Procedural, at any size.** The Jack game needed two hand-edited pose sets (Jack at 100% and 50%) blended by his size. Here the giver's arm is solved every frame (shoulder, elbow and wrist) so the hand lands on the middle of the cheek struck, and the paddle's blade lies flat on it, from full height down to the cloak's 55% (and to 50%, the position's limit). The giver sits nearly upright, turning a little into a strike on the far cheek: those are the Jack game's tuned values, baked in. Measured at contact, the hand lands exactly and the blade's middle within 0.6 units, for every giver, cheek and size.
- **Her clothes.** Skirt down, or lifted and gathered at the small of her back; her drawers up, or down to just above the knee. The seat block carries the skirt, the drawers or bare skin, and the marks, cheek by cheek. Cloth takes the edge off the sting (the pain model's cushions, with a skirt and drawers added).
- **The pain model** is the Jack game's, unchanged: distress bands drive her face (calm, wincing, gritted, crying), her kicks and her voice, and at "too harsh" nothing more is struck.
- **The scripts** (`js/correction.js`): Token is a few over the skirt; Light adds the skirt lifted; Firm adds her drawers down; Severe ends with the paddle. Each giver has their own lines for the start, the stages, the strokes and afterwards.
- **Red** (the button at top left, or R) stops everything at once, the giver lets her up, and the card says so. Nothing is held against her: the book was already settled.
- **`lap.html`** previews it: pick the giver, her size, the implement and clothes, smack or run ten, and look from the front, behind, the giver's view, above or at her face.

## Run it

```
npm run serve        # http://localhost:8123/ opens the game; /lap.html previews the over-the-knee scene
npm test             # the ledger and the pain model
```

## Controls

As in the Jack game: **WASD** or the arrows walk relative to the camera; **Shift** runs; **C** sneaks; **drag** turns the camera; **V** or the wheel zooms; **Space** jumps; **E** talks or acts; **Q** picks up and puts down. New here: **F** puts the cloak on or takes it off, and **L** opens the account book (there are buttons for both at the top left). On a touch screen the joystick and buttons are the Jack game's.

## The village

| Place | Who | Their terms |
|---|---|---|
| The bakery (north) | Mother | None. She keeps no book (see below). |
| The well (centre) | Grandmother | None. She passed her terms to the Innkeeper. |
| The mill (west) | The Miller | Errands; taking from the stall |
| The inn (east) | The Innkeeper | Manners; mess; the evening bell |
| The forest edge (south) | The Woodcutter | Keeping to the path |

What she can do in the hub so far: take a bun from the bread stall (taking), run into the apple crate and knock it over (mess; set it right with E), snap at the innkeeper or be civil (manners), take or refuse the miller's flour errand and deliver the sack to the bakery table within two minutes (errand), and leave the forest path past the woodcutter's marker (path). Out of the cloak, her mother asks for help at the bakery.

## The ledger (`js/ledger.js`)

Pure data and arithmetic, tested under Node. Terms are only written while she wears the cloak. Each breach goes in the enforcer's book, scaled by that villager's strictness; keeping a term builds their trust and takes a little off the book. A book comes **due** at the giver's patience. At the reckoning, an honest account settles the book at its own tier; a lie lifts it one tier and is written in Grandmother's book. The tiers are the Jack game's: Token, Light, Firm, Severe. Trust is tracked per villager and is meant to gate the world (shortcuts, rides, the deeper forest), as flight upgrades do in *Mika and the Witch's Mountain*.

## Design rules

- **The cloak changes her scale, not her age.** She is an adult woman in mind, voice, body and clothes at every size. Shrinking scales the model and nothing else.
- **Her mother is never a giver.** She is the story's emotional anchor. `Ledger.ANCHORS` lists her, and the ledger refuses to write in her book or let her settle one, even if a save is edited; the tests check this.
- **Family stay out of it.** Grandmother gave the cloak and passed her terms on (the evening bell and the truth go to the Innkeeper; a lie at a reckoning goes back in the book of whoever she lied to). She and the heroine's mother are both in `Ledger.ANCHORS`: no book, no reckoning, no part in a correction, and not present at one. Only the Woodcutter, the Miller and the Innkeeper give corrections (`Ledger.correctors()`).
- **The heroine can't be called "Red".** That is the safe word. Her name is a placeholder (`HEROINE_NAME` in `js/cast.js`) until one is chosen.

## Files

| File | What it is | From the Jack game |
|---|---|---|
| `game.html`, `js/menus.js` | The shell: notice, title, settings, saves, pause menu | Adapted |
| `js/game.js` | The cutscene toolkit: shots, fades, waits, typed dialogue, choices, skipping | Ported (speaker names now come from the cast) |
| `js/audio.js` | Music, ambience, smacks, voices and the speech babble, all synthesised | Ported (voice pitches now come from the cast) |
| `js/touchui.js` | The touch controls | Ported unchanged |
| `js/pain.js` | The pain model behind the correction | Ported (cushions for a skirt and drawers added) |
| `js/blocky.js` | The box-built character rig and skin painter | Ported unchanged (Jack's and Gerda's painters are still in it, unused) |
| `js/cast.js` | The heroine, her mother, Grandmother, the Woodcutter, the Miller, the Innkeeper; one painter driven by data; the cloak | New |
| `js/ledger.js` | The bargain: terms, givers, books, trust, tiers | New |
| `js/village.js` | The village hub, the opening, free roam, the talks and the reckoning | New |
| `js/lap.js`, `lap.html` | Over the knee: the giver's arm solve, her frame and seat block, the session, the cameras; its preview page | Refitted from the Jack game's lap scene (one position, procedural) |
| `js/correction.js` | The correction after a reckoning: the room, the tier scripts, the givers' lines, Red | New |
| `tests/` | `node --test` checks for the ledger (including who may correct) and the pain model | Ledger new; pain ported |

## The look (`js/toon.js`, `style.html`)

The village and its whole cast are in the toon style now, after the concept art: smooth rounded characters, soft three-band cel shading and a warm brown ink outline; flat cel-shaded buildings with outlined edges; rounded trees. The heroine wears the concept art's green tunic with belt and pouches, laced bracers, tan trousers and tall laced boots, with chestnut braids tied in red ribbon and the red cloak edged in gold and stitched with stars. She is about six and a half heads tall with a woman's face and figure, identical at every size. The men have broader builds; the woodcutter has a beard and a checked shirt, the miller a floury apron, Grandmother a shawl.

The rigs use the same joints as the blocky ones, so the village poses them with the same code, now with knees that bend as they walk and a breath at rest. Characters are kept light (about 15,000 triangles each, her 27,000) so the village runs on a phone.

`style.html` shows her at full height, cloaked, and cloaked at 55% beside the Innkeeper; `style.html?cast` lines up the whole cast.

**Still blocky:** the over-the-knee scene. It needs refitting to the toon rig, and to her new clothes (trousers rather than a skirt), next.

## Movement

In the cloak her pace barely drops (speed scales by 0.85 + 0.15 × her size, about 7% slower at 55%), and walking and running are both quicker than before.

## Next

0. Convert the over-the-knee scene to the toon rig and her trousers.
1. An aftermath beat after a correction (the Jack game stands Jack facing the wall), and the walk from the reckoning to the giver's house.
2. A day clock, so the evening bell (curfew) can be broken and kept.
3. The forest path out to Grandmother's cottage, and the Wolf.
4. Trust unlocks: the routes and rides each villager opens.
