// Gobble Dash: shared tuning constants and stage definitions.
// One file, one job: every number the rest of the game agrees on lives here.

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 452;
export const GRAVITY = 2400;
export const JUMP_SPEED = 880;
export const BASE_RUN_SPEED = 265;
export const MAX_LIVES = 3;

// Distance (in metres) where each stage begins. The kitchen ends at the
// forest gate; reaching it wins the game.
export const STAGES = [
  {
    id: 'farmyard',
    name: 'STAGE 1 — THE FARMYARD',
    start: 0,
    end: 600,
    sky: ['#ffd98a', '#ffb347'],
    ground: '#c98a3d',
    grass: '#7fae4c',
    accent: '#e2574c',
    spawnEvery: 1.15,
    knifeEvery: 3.4,
    cornEvery: 1.9,
  },
  {
    id: 'barn',
    name: 'STAGE 2 — THE BARN',
    start: 600,
    end: 1200,
    sky: ['#8a5a3b', '#5d3a26'],
    ground: '#a0714a',
    grass: '#8a6a3f',
    accent: '#f2c14e',
    spawnEvery: 0.95,
    knifeEvery: 2.7,
    cornEvery: 1.7,
  },
  {
    id: 'kitchen',
    name: 'STAGE 3 — THE FARMHOUSE KITCHEN',
    start: 1200,
    end: 1800,
    sky: ['#f7e3c0', '#e8b06a'],
    ground: '#b98a5e',
    grass: '#c96f4a',
    accent: '#ff7b2f',
    spawnEvery: 0.85,
    knifeEvery: 2.2,
    cornEvery: 1.6,
  },
];

export const ESCAPE_DISTANCE = 1800;

export function stageAt(distance) {
  for (let i = STAGES.length - 1; i >= 0; i -= 1) {
    if (distance >= STAGES[i].start) return STAGES[i];
  }
  return STAGES[0];
}

export function stageIndexAt(distance) {
  for (let i = STAGES.length - 1; i >= 0; i -= 1) {
    if (distance >= STAGES[i].start) return i;
  }
  return 0;
}
