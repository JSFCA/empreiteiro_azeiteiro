# CLAUDE.md

Guidance for Claude Code (or any contributor) working in this repo.

## What this is

A browser 3D first-person shooter (player vs. one AI opponent, arena
combat, arrow keys + space). Plain HTML/CSS/JS with native ES modules.
See `README.md` for how to run it and the controls.

## Hard constraints — don't "fix" these

- **No build tooling.** No npm, no bundler, no transpiler. Keep it that
  way; don't introduce one for a small change.
- **Must be served over `http://`, never opened as `file://`.** Browsers
  block ES module imports from the local filesystem. `serve.py` +
  `Launch Game.command` exist specifically to make this a non-issue for
  the end user — don't remove them or suggest opening `index.html`
  directly.
- **Three.js is vendored at `js/vendor/three.module.js`, not loaded from
  a CDN.** This was a deliberate fix (an external CDN dependency + stale
  browser caching once caused a "Start button does nothing" bug that
  looked like a code issue but wasn't). Don't switch it back to an
  import-map/CDN import.
- **`serve.py` disables HTTP caching on purpose** (`Cache-Control:
  no-store`, etc.). This project got bitten once by a browser silently
  serving stale JS across reloads. Don't drop the no-cache headers.

## Editing opponent banter

Taunt lines live in `banter.txt` (project root), not in code. Format is
documented in the README and in comments at the top of the file itself.
`js/banter.js` parses it into three categories (`ON_HIT_PLAYER`,
`ON_TAKE_DAMAGE`, `ON_WIN`); if you add a new trigger point, add a
matching `[SECTION]` and call `randomBanter('SECTION')` from `main.js`.

## Testing in a browser automation tool

If you're verifying changes with a headless/automated browser tab:

- `requestAnimationFrame`-driven updates (the game loop) and CSS
  animations/transitions can appear frozen at time 0 in an automated tab
  that isn't focused/rendering normally. Taking a `screenshot` action
  tends to "pump" a frame forward — interleave screenshots after
  triggering state changes rather than trusting `wait`/timers alone.
- For manual state manipulation during testing, add a temporary
  `window.__debug = { ... }` hook in `main.js` exposing whatever you
  need (player/opponent refs, functions to call directly), verify, then
  **remove it** before finishing. Do a final hard-reload
  (`Cmd+Shift+R` equivalent) and confirm `typeof window.__debug ===
  'undefined'` plus no console errors as the closing check.
- Click coordinates from a screenshot can be unreliable in this
  environment; prefer `ref`-based clicks from `read_page`, or as a
  fallback call `.click()` directly via the JS-eval tool for functional
  verification.

## Code style in this repo

- No comments unless explaining a non-obvious *why* (see existing files
  for the tone/density to match).
- Decorative/non-gameplay additions (scenery, visual flourish) go in
  their own functions/files separate from collision/gameplay logic —
  e.g. `buildConstructionProps()` in `arena.js` is deliberately kept
  apart from the collidable `OBSTACLES` array.
