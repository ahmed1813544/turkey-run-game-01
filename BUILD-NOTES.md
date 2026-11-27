# BUILD-NOTES — Gobble Dash: The Great Thanksgiving Escape

- **Game:** Gobble Dash — The Great Thanksgiving Escape. A 2D canvas turkey escape game: run from the farmyard through the barn and the farmhouse kitchen to the forest gate while the farmer chases, searches and corners you; jump fences, hay bales and kitchen clutter, dodge falling carving knives (red warning marker) and glowing oven patches, collect corn for score, hide in haystacks/crates (Down) to lose the farmer. HUD shows score, distance, lives (hearts) and a farmer-proximity meter. Title screen, play, and both end screens (caught / escaped) with restart. All art drawn in code; all sound synthesized with WebAudio (SFX + music loop), no audio or image files.
- **How to run locally:** `node serve.ts`, then open http://localhost:8080. No build step, no network.
- **Screenshots** (real headless-Chromium renders of the game, 960×540 each):
  - `1-title.png` (119,316 B) — title screen, the cover
  - `2-play.png` (81,908 B) — farmyard run in play, turkey mid-jump, farmer closing in, HUD visible
  - `3-kitchen.png` (90,067 B) — kitchen stage in play, oven glow patches, farmer right behind
  - `4-caught.png` (79,080 B) — caught end screen with final score and Run Again button
  - The escaped end screen was also rendered and verified in the browser (not shipped as a screenshot).
- **Verification (2026-11-27, this session):**
  - Playtest in headless Chromium, no page errors: jump leaves the ground, score/distance grow, a passive turkey is caught by the farmer (~6 s), a forced knife hit costs a life (3→2), corn adds +25 score, hiding makes the farmer search and the gap grow, restart via Enter works, and jumping the distance to 1,800 m reaches the escaped end screen.
  - `main.ts` run twice with different MAKEFUN_OUTPUT_DIR values: `diff -r` reports BYTE-IDENTICAL; dossier.json present (551,067 B, under the 1.5 MiB cap); game/ + screenshots/ inside the output.
  - Built output served from its own files and played with no external requests (zero non-localhost requests, zero page errors).
  - Gate limits: game/ = 11 files, 54,009 B (limit 993 files / 48 MiB); index.html = 1,065 B (limit 1 MiB); 4 screenshots, each ≤ 119,316 B (limit 256 KiB), 960×540 (long side ≤ 1280, short side ≥ 480). vendor/makefun-game.ts is the kit copy unchanged (sha256 dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129).
- **Repo:** https://github.com/ahmed1813544/turkey-run-game-01 — public, commit 697aa4c00bb1aff8d1d4c5ea085a6b15545bdec3 (BUILD-NOTES.md added in a second commit, see git log), About homepage https://make.fun/bounty/turkey-run-game-01, topic `makefun`.
- **Session id:** agent-8841bd3a-a0cc-44b8-a29f-f6a442aadb36
- **Not done here (parent run):** kit CLI bundle / check / submit — the parent run does bundling and submission after this session's usage rows land.
