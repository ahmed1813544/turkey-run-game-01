// Gobble Dash: bootstrap. One file, one job.
// Wires the canvas to the game and honours the debug query parameters the
// maker uses for screenshots (?screen=title|play|caught|escaped&stage=1|2|3).

import { Game } from './game.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const game = new Game(canvas);
window.__game = game; // handy for debugging and automated playtests

const params = new URLSearchParams(window.location.search);
const screen = params.get('screen');
const stage = Number(params.get('stage') || 1);
if (screen === 'play' || screen === 'caught' || screen === 'escaped') {
  game.startRun();
  // Jump the run into the requested stage for the screenshot.
  if (stage === 2) game.distance = 640;
  if (stage === 3) game.distance = 1240;
  if (stage === 3) game.farmer.gap = 280;
  if (screen === 'caught') {
    game.lives = 1;
    game.score = 1240;
    game.distance = 380;
    game.endRun(false);
  }
  if (screen === 'escaped') {
    game.score = 4860;
    game.cornCount = 34;
    game.distance = 1800;
    game.endRun(true);
  }
  if (screen === 'play') {
    game.score = 1240;
    game.cornCount = 12;
    game.farmer.gap = 260;
    game.turkey.x = 300;
  }
}

game.run();
