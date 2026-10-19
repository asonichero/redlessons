# Red Lessons

A blocky, open-world adult adventure from the Whisperwood, built on the engine of *Climbing Toward Consequence* (the Jack and the Beanstalk game, [asonichero/consequence](https://github.com/asonichero/consequence)).

The heroine is a grown woman who lives with her mother, the village baker, and has stopped coping with adult life. Grandmother gives her a waist-length red cloak. While she wears it she is small, and the village strikes a bargain with her: **no adult responsibility, but not no consequences.** Every villager keeps a book of their own terms; break one and it is written down, and when a book is full that villager calls her in to settle it. Take the cloak off and she is full height again, with a bakery to help run.

She has never heard the tale of Red Riding Hood. The Wolf, when he comes, will offer the one thing the village won't: to wipe the books clean.

## Status: milestone 1, the shell and the village hub

Built: the title screen over a drone view of the village, the content notice, settings, saves and the pause menu (all ported from the Jack game); the cast on the blocky rig; the opening cutscene (Grandmother gives the cloak and the village names its terms); the free-roam village with the ledger running; and the reckoning, where a giver calls her in and she owns up or lies.

Not yet: the correction scene itself. The lap scene in the Jack game is fitted to Jack's rig, with two hand-tuned pose sets; it needs refitting for the heroine before it can be ported. Until then a reckoning ends on a card that shows the tier and implement the engine chose.

## Run it

```
npm run serve        # http://localhost:8123/ opens the game
npm test             # the ledger and the pain model
```

## Controls

As in the Jack game: **WASD** or the arrows walk relative to the camera; **Shift** runs; **C** sneaks; **drag** turns the camera; **V** or the wheel zooms; **Space** jumps; **E** talks or acts; **Q** picks up and puts down. New here: **F** puts the cloak on or takes it off, and **L** opens the account book (there are buttons for both at the top left). On a touch screen the joystick and buttons are the Jack game's.

## The village

| Place | Who | Their terms |
|---|---|---|
| The bakery (north) | Mother | None. She keeps no book (see below). |
| The well (centre) | Grandmother | The truth; the evening bell |
| The mill (west) | The Miller | Errands; taking from the stall |
| The inn (east) | The Innkeeper | Manners; mess |
| The forest edge (south) | The Woodcutter | Keeping to the path |

What she can do in the hub so far: take a bun from the bread stall (taking), run into the apple crate and knock it over (mess; set it right with E), snap at the innkeeper or be civil (manners), take or refuse the miller's flour errand and deliver the sack to the bakery table within two minutes (errand), and leave the forest path past the woodcutter's marker (path). Out of the cloak, her mother asks for help at the bakery.

## The ledger (`js/ledger.js`)

Pure data and arithmetic, tested under Node. Terms are only written while she wears the cloak. Each breach goes in the enforcer's book, scaled by that villager's strictness; keeping a term builds their trust and takes a little off the book. A book comes **due** at the giver's patience. At the reckoning, an honest account settles the book at its own tier; a lie lifts it one tier and is written in Grandmother's book. The tiers are the Jack game's: Token, Light, Firm, Severe. Trust is tracked per villager and is meant to gate the world (shortcuts, rides, the deeper forest), as flight upgrades do in *Mika and the Witch's Mountain*.

## Design rules

- **The cloak changes her scale, not her age.** She is an adult woman in mind, voice, body and clothes at every size. Shrinking scales the model and nothing else.
- **Her mother is never a giver.** She is the story's emotional anchor. `Ledger.ANCHORS` lists her, and the ledger refuses to write in her book or let her settle one, even if a save is edited; the tests check this.
- **The heroine can't be called "Red".** That is the safe word. Her name is a placeholder (`HEROINE_NAME` in `js/cast.js`) until one is chosen.

## Files

| File | What it is | From the Jack game |
|---|---|---|
| `game.html`, `js/menus.js` | The shell: notice, title, settings, saves, pause menu | Adapted |
| `js/game.js` | The cutscene toolkit: shots, fades, waits, typed dialogue, choices, skipping | Ported (speaker names now come from the cast) |
| `js/audio.js` | Music, ambience, smacks, voices and the speech babble, all synthesised | Ported (voice pitches now come from the cast) |
| `js/touchui.js` | The touch controls | Ported unchanged |
| `js/pain.js` | The pain model behind the correction | Ported unchanged |
| `js/blocky.js` | The box-built character rig and skin painter | Ported unchanged (Jack's and Gerda's painters are still in it, unused) |
| `js/cast.js` | The heroine, her mother, Grandmother, the Woodcutter, the Miller, the Innkeeper; one painter driven by data; the cloak | New |
| `js/ledger.js` | The bargain: terms, givers, books, trust, tiers | New |
| `js/village.js` | The village hub, the opening, free roam, the talks and the reckoning | New |
| `tests/` | `node --test` checks for the ledger and the pain model | Ledger new; pain ported |

## Next

1. A female subject rig for the lap scene: refit the contact sites and the two pose sets (full size and cloak size) for the heroine, then port `lap.js` and plug it in where the settlement card is now.
2. A day clock, so the evening bell (curfew) can be broken and kept.
3. The forest path out to Grandmother's cottage, and the Wolf.
4. Trust unlocks: the routes and rides each villager opens.
