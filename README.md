# Empreiteiro Azeiteiro

A browser-based 3D first-person shooter: you vs. a single AI-controlled
opponent in a walled arena, built with plain HTML/CSS/JS and Three.js
(vendored locally — no build step, no npm, no external CDN calls).

## Requirements

- Python 3 (used only to run a local static file server)
- A modern browser (Chrome, Firefox, Edge, Safari)

## Running the game

**macOS — easiest way:** double-click `Launch Game.command`. It starts a
local server on a free port and opens the game in your default browser.
Leave its terminal window open while you play; closing it stops the server.

**Manually (any OS):**

```bash
python3 serve.py 8000
```

Then open `http://localhost:8000` in your browser.

> The game must be served over `http://` — opening `index.html` directly
> (`file://`) will not work, since browsers block ES module imports from
> the local filesystem.

## Controls

| Key | Action |
|-----|--------|
| Up / Down arrows | Move forward / backward |
| Left / Right arrows | Turn |
| Space | Shoot |

First to reduce the other's health to zero wins.

## Customizing opponent banter

The opponent's taunts live in `banter.txt` at the project root — a plain
text file, no code required. Edit it, save, and refresh the page (no
restart needed since it's loaded fresh on each page load).

Format:

```
# Lines starting with # are comments.
[ON_HIT_PLAYER]
One taunt per line, shouted when the opponent hits you.

[ON_TAKE_DAMAGE]
Shouted when you hit the opponent.

[ON_WIN]
Shouted when the opponent wins the match.
```

## Project structure

```
index.html         Page structure: canvas, HUD, overlays
css/style.css       HUD, crosshair, hit-flash, banter, and overlay styling
banter.txt          Editable opponent taunt lines
serve.py            No-cache local static file server
Launch Game.command Double-clickable launcher (macOS)
js/
  main.js           Scene setup, game loop, wires everything together
  inputManager.js   Tracks currently-held keys
  player.js         Player position, facing, health, movement/fire logic
  opponent.js        AI patrol/aim/fire behavior
  projectile.js       Shared projectile spawn/move/collision logic
  arena.js             Floor, walls, obstacles, collision helpers, scenery
  ui.js                 HUD, overlays, damage flash, banter display
  banter.js             Loads and parses banter.txt
  vendor/three.module.js  Vendored Three.js (r160)
```
