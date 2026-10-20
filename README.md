# Red Lessons

Jack and Gerda, the over-the-knee discipline scene and the pain model, taken from *Climbing Toward Consequence* ([asonichero/consequence](https://github.com/asonichero/consequence)), with a simple character editor. Jack is 21; Gerda is in her late thirties. Both are adults.

Everything is blocky (three.js, no build step, procedural pixel textures and synthesised sound, no asset files) and installs as a mobile web app.

**What was left out.** The Jack game's scaling mechanic: Jack no longer shrinks. He is always at his full size (95% of the model's scale, so Gerda is about 105% of him). The second set of poses made at half his size, the blend between the two sets and the size slider are gone, and so is the rule that a smaller Jack feels each smack more. The rest of that game's cast (his mother, the peddler, the merchant) is not here, and neither is the earlier Red Lessons village with its heroine and villagers.

## Run it

```
npm run serve        # http://localhost:8123/ opens the lap scene; /editor.html is the character editor
npm test             # the pain model, the discipline scripts and the looks
```

## Over the knee (`lap.html`, `js/lap.js`)

Gerda sits on a plain chair; Jack lies face down across her lap, hips over her right knee, head and arms toward the floor on her left. This is the Jack game's discipline engine cut down to that one position:

- **A smack** is a lift, a hold with the arm raised (the wait builds dread), the strike, and a short hold on the skin that keeps stinging. **Run of 10** goes straight from contact back up to raised. **Pace** and **Strength** have three steps each. Space smacks.
- **Gerda's arm** (shoulder, elbow and wrist) is solved every frame, so the end of her hand lands exactly on the middle of the cheek struck. With the paddle, the blade's middle lands within 0.7 units of it, and the blade lies flat on the angle of his seat. Her torso uses the Jack game's hand-tuned poses, baked in: nearly upright, leaning back as the arm goes up, and turning a little into a strike on the far cheek. Her left hand rests between his shoulder blades.
- **Jack's clothes**: trousers up or down; with them down, drawers up or down. The glutes block (bridging his back and his folded thighs) shows trousers, drawers or bare skin, and the trousers bunch at his knees when they are down. Cloth takes the edge off the sting only.
- **Marks**: bare skin colours up cheek by cheek, and tender skin hurts more.
- **The pain model** turns each smack into his distress. Its bands (composed, flinching, struggling, close to the edge, past it, too harsh) drive his kicks, his wriggling, his voice and his face (grin, wince, gritted, crying). At "too harsh" nothing more is struck.
- **Red** (the button, or R) stops everything at once.
- Cameras: Side, Behind, Gerda's view, Above, His face. You can also drag to orbit.

## Discipline (`js/discipline.js`)

The **Correction** buttons run a scripted correction in the Jack game's four tiers. Gerda talks before each stage and between the runs:

| Tier | Stages | Smacks |
|---|---|---|
| Token | hand over his trousers | 6 |
| Light | + trousers down | 20 |
| Firm | + drawers down | 34 |
| Severe | + the paddle to finish | 44 |

Red ends it there and then, and her last line is the gentle one. At "too harsh" she stops. `Discipline.run(lap, tier, { say, sleep })` returns `{ hits, peak, red, tooHarsh, done }`.

## The pain model (`js/pain.js`)

This is the Jack game's model, unchanged. Each smack adds a sharp **sting** (fading in seconds) and a deep **ache** (fading over minutes). Distress is their sum against how much he can take. The implement, strength, pace, the wait with the arm raised, the clothing and how tender the skin already is all count. Jack's tolerance is 1 and his resilience 0.7, as in that game, so he reaches the edge slowly.

## Character editor (`editor.html`, `js/looks.js`)

Jack and Gerda stand side by side, and you can pick:

- **Outfit**: Jack's Outdoor, Day, Soft or Fine; Gerda's Work or Fine.
- **Skin, hair and eyes** for both, plus Gerda's **lips**: a row of swatches, or any colour. Shading, highlights, brows and Gerda's bun follow the chosen colour.
- **His face**: preview Jack's eight expressions.

Changes are saved in the browser straight away, and the lap scene uses them. **Back to their own colours** resets both. A colour left at its default paints exactly as the model was drawn. Views: front, side, back, or turning.

## Files

| File | What it is | From the Jack game |
|---|---|---|
| `js/blocky.js` | Jack and Gerda: box-built models, painted skins, wardrobes, the chair | Ported (a colour override added for the editor) |
| `js/pain.js` | The pain model | Ported unchanged |
| `js/audio.js` | Smacks, voices and the rest, all synthesised | Ported |
| `js/lap.js`, `lap.html` | Over the knee: Gerda's arm solve, Jack's frame and glutes block, the session, the cameras; its viewer | Refitted: one position, full size only, poses baked in |
| `js/discipline.js` | The scripted correction: tiers, stages, Gerda's lines | New (the tiers are the Jack game's) |
| `js/looks.js`, `editor.html` | Outfits and colours, and the editor | New |
| `tests/` | `node --test` checks for the pain model, the discipline scripts and the looks | Pain ported; the rest new |
| `manifest.webmanifest`, `sw.js`, `icons/` | The installable web app | Ported |
| `vendor/` | three.js r128 and OrbitControls | Ported |
