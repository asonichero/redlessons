# Red: a blocky adventure engine

A small third-person adventure engine in the blocky, Minecraft-style look (three.js r128, no build step, procedural pixel textures, synthesised sound, no asset files), with Red as its hero, drawn from the character sheet: a green tunic, tan trousers and boots, two auburn plaits with red ribbons, a basket, and the red hooded **Starweave Mantle**, a waist-length cloak with glowing gold stars. It installs as a mobile web app.

This started as a clone of another game's engine; the story, scenes, cast and all adult content were removed, and the hero was rebuilt from scratch. What is left is the engine and a small sandbox to try it in.

## Run it

```
npm run serve        # http://localhost:8123/
npm test             # file checks and skin checks
```

`index.html` is the game (title, then the sandbox); `blocky.html` is the model viewer (faces, cloak, hood, poses, basket, walk cycle, the skin itself).

## The sandbox

A short opening cutscene, then free play in a meadow: a winding path to a cottage, a forest, flowers, rocks and a log to jump on, a tall rock to climb, a stump with a basket on it.

| Key | Does |
|---|---|
| WASD / arrows | Walk, relative to the camera (the hero turns to go where it points) |
| Shift / C or X | Run / toggle sneaking |
| Space | Jump; beside the tall rock and facing it, climb |
| E | Put the cloak on or off (a sparkle burst); at the cottage door, knock (a conversation) |
| Q | Pick up the basket, or put it down |
| H | Hood up or down |
| 1 2 3 4 | Smile, wink, pout, gasp |
| Drag, wheel / V | Turn the camera, zoom |
| Esc | Pause |

On a touch screen there is a stick and buttons for the same things.

## The engine

| File | What it is |
|---|---|
| `js/blocky.js` | The character rig and the hero: skin painter, limbs cut at knee and elbow, poses, walk cycle, cloak, hood, plaits, basket, sparkles |
| `js/voxel.js` | Pixel-texture and box helpers shared by the models and the world |
| `js/game.js` | The shell and the cutscene toolkit: `G.shot`, `G.say`, `G.choose`, `G.caption`, `G.fade`, `G.wait`, skipping, pause, settings, saves |
| `js/player.js` | The third-person controller: movement, jump, climb, collisions against a list of boxes, orbit camera, footsteps |
| `js/world.js` | The sandbox world, and the shape of a level: meshes plus a `solids` list of boxes |
| `js/touchui.js`, `js/hud.js` | Touch controls; the objective, hint and toast |
| `js/audio.js` | Music, ambience, footsteps, a chime and a speech babble, all synthesised |
| `js/demo.js`, `js/main.js` | The sandbox's logic; the title, settings and pause screens |

Making a new game means a new `world` (meshes and boxes), a `Demo`-like script of cutscenes and play, and speakers added to `G.cast` and `GameAudio.pitch`.

### The hero

`Blocky.makeRed()` returns a rig. Everything is in skin pixels; a standing figure is 32 tall.

```js
const red = Blocky.makeRed();  scene.add(red.root);
red.setExpr('wink');  red.setCloak(false);  red.setHood(true);  red.hold(Blocky.makeBasket());
Blocky.setPose(red, 'sit');                  // or 'stand'
red.motion.speed = 26; red.motion.phase += dt * 11;   // drives the walk cycle
Blocky.step(red, dt);                        // once a frame
```

The skin is a 64x64 in the Minecraft layout (with 3x3 arms), painted pixel by pixel in `paintRedInto`; change `Blocky.RED` to recolour her. The cloak's stars shine through an emissive map and pulse; `red.glow` sets how brightly.
