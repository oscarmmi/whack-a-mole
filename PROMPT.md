Build a whack-a-mole game in THIS folder: C:\xampp\htdocs\whack-a-mole

A recruiter-ready browser mole game. Playable, polished, no backend.

## Game
- Call it "Hole Punch". Original neon moles, no licensed branding.
- 3×3 holes. A mole pops in a random empty hole for a short time. Click/tap a visible mole to score +1. Missed moles hide with no penalty. Keys 1–9 map to the grid.
- 30-second round. R restarts. Local best score in localStorage.

## UI
- Dark playfield, glowing holes, popping moles, large timer and score. Not a default Vite page. No Vue logo.
- 390px phone and 1280px desktop.

## Tests
- Vitest (pure logic): hitting a visible mole increments score and hides it; hitting an empty hole does not increment; when the timer hits 0 the round is over.
- `npm test` and `npm run build` must pass.

## GitHub
- Repo: https://github.com/oscarmmi/whack-a-mole
- Pages: https://oscarmmi.github.io/whack-a-mole/
- vite base `/whack-a-mole/`
- Commit: feat: add whack-a-mole
- First commit must `git add -A` so package.json, vite.config.ts, tsconfigs, src/main.ts, index.html, .gitignore, and .github/workflows/pages.yml ship with the game.
- gh repo edit --description "Hole Punch whack-a-mole in Vue 3 + TypeScript, playable on GitHub Pages." --add-topic vue --add-topic typescript --add-topic game --add-topic whack-a-mole --add-topic arcade
- Stop. Print the repo URL and Pages URL.
