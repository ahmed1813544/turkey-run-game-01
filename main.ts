// Gobble Dash: the hand-in program for turkey-run-game-01 (Node 22, stdlib only).
// It copies this repository's game/ and screenshots/ into the output directory
// named by MAKEFUN_OUTPUT_DIR (default /output) and writes /output/dossier.json
// with buildDossier from the vendored make.fun library. The game itself is plain
// static files: game/index.html plus its ES modules, no library, no network.
// Deterministic by construction: it only copies files and writes the dossier the
// library derives from them, so two runs over the same repository write the
// same bytes every time.
//
// Run it outside the grader like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
