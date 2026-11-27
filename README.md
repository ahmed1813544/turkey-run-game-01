# Gobble Dash — The Great Thanksgiving Escape

[![Make.fun bounty](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Rank](https://make.fun/badge/turkey-run-game-01/ahmed1813544/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Reward](https://make.fun/badge/turkey-run-game-01/ahmed1813544/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

An original 2D canvas turkey escape game for the [make.fun "Make the best turkey escape game" bounty](https://make.fun/bounty/turkey-run-game-01).

## The game

You are a turkey, and Thanksgiving dinner is coming for you. Run from the farmyard, through the barn, and across the farmhouse kitchen to the forest gate — with the farmer hot on your tail the whole way.

- **The farmer chases, searches and corners.** He closes in when you stumble, lunges when you trip, and stops to search the bushes when you vanish into a haystack.
- **Dodge the dangers:** fences, hay bales and kitchen clutter to jump, **falling carving knives** (watch for the red warning marker), and the **glowing oven** in the kitchen.
- **Collect corn** for score, **hide in haystacks and crates** (press Down) to lose the farmer, and keep an eye on the HUD: score, distance, lives, and how close the farmer is.
- **Three stages of rising difficulty:** the farmyard, the barn, then the farmhouse kitchen — reach the forest gate at 1,800 m to escape.
- **Complete flow:** title screen, a run in play with HUD, and an end screen for both outcomes — caught by the farmer, or escaped — with a restart button.
- **Sound:** all synthesized in code with WebAudio — gobbles, jumps, coin pings, knife clangs, and a cheerful music loop. No audio files.
- **Art:** every sprite is drawn in code on the canvas — the turkey, the farmer, the barn, the windmill, the kitchen and its big glowing oven. No image files.

## Controls

- **Arrows / WASD** — move (Left slows you down, Right hurries you)
- **Space / Up / W** — jump
- **Down / S** — hide in a nearby haystack or crate
- **Mouse** — click the Start / Run Again buttons; **Enter** works too

## Play it locally

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `game/index.html` plus its ES modules is the whole game.

## Repo layout

- `main.ts` — the hand-in program (Node 22, stdlib only): copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `game/` — the game: `index.html` and `src/` — `config.js` (tuning + stages), `audio.js` (synth SFX + music), `input.js` (keyboard + mouse), `turkey.js` (the player), `farmer.js` (the chaser AI), `hazards.js` (knives, oven, obstacles, corn), `levels.js` (stage scenery), `render.js` (all canvas drawing), `game.js` (loop + state machine), `main.js` (bootstrap).
- `screenshots/` — 3 screenshots of the game itself: title, a run in play, the end screen.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `serve.ts` — tiny static server for local play-testing.

## License

MIT — see [LICENSE](LICENSE).
