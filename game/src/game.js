// Gobble Dash: the game loop and state machine. One file, one job.
// Owns the screens (title / playing / caught / escaped), the score, the
// distance, the farmer chase, hits, hiding, stage changes and the HUD data.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BASE_RUN_SPEED,
  MAX_LIVES,
  ESCAPE_DISTANCE,
  stageAt,
  stageIndexAt,
} from './config.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { HazardField } from './hazards.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import {
  drawBackground,
  drawTurkey,
  drawFarmer,
  drawHazards,
  drawHud,
  drawTitle,
  drawEnd,
} from './render.js';

export const START_BUTTON = { x: CANVAS_WIDTH / 2 - 130, y: 368, w: 260, h: 56 };
export const RESTART_BUTTON = { x: CANVAS_WIDTH / 2 - 130, y: 352, w: 260, h: 56 };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.field = new HazardField();
    this.screen = 'title';
    this.score = 0;
    this.distance = 0;
    this.lives = MAX_LIVES;
    this.cornCount = 0;
    this.bestScore = 0;
    this.time = 0;
    this.banner = '';
    this.bannerTimer = 0;
    this.bannerColor = '#fff';
    this.hideHint = false;
    this.lastStageIndex = 0;
    this.lastTime = 0;
    try {
      this.bestScore = Number(window.localStorage.getItem('gobble-dash-best') || 0) || 0;
    } catch {
      this.bestScore = 0;
    }
  }

  showBanner(text, color, seconds) {
    this.banner = text;
    this.bannerColor = color;
    this.bannerTimer = seconds;
  }

  startRun() {
    this.turkey.reset();
    this.farmer.reset();
    this.field.reset();
    this.screen = 'playing';
    this.score = 0;
    this.distance = 0;
    this.lives = MAX_LIVES;
    this.cornCount = 0;
    this.lastStageIndex = 0;
    this.banner = '';
    this.bannerTimer = 0;
    this.showBanner('RUN! THE FARMER IS COMING!', '#ffd98a', 2.2);
    this.sounds.unlock();
    this.sounds.startMusic();
    this.sounds.gobble();
  }

  endRun(escaped) {
    this.screen = escaped ? 'escaped' : 'caught';
    this.sounds.stopMusic();
    if (escaped) this.sounds.escaped();
    else this.sounds.caught();
    if (this.score > this.bestScore) {
      this.bestScore = Math.floor(this.score);
      try {
        window.localStorage.setItem('gobble-dash-best', String(this.bestScore));
      } catch {
        // Saving the best score is a nicety, not a requirement.
      }
    }
  }

  takeHit(kind) {
    if (this.turkey.invulnerable > 0) return;
    this.lives -= 1;
    this.turkey.hit();
    this.farmer.lunge();
    this.sounds.thud();
    if (kind === 'knife') this.sounds.clang();
    if (this.lives <= 0) {
      this.showBanner('CAUGHT!', '#e2574c', 1.4);
      this.endRun(false);
      return;
    }
    this.showBanner(kind === 'oven' ? 'OUCH! THE OVEN!' : kind === 'knife' ? 'OUCH! A KNIFE!' : 'OUCH! TRIPPED!', '#ff9a8a', 1.2);
  }

  updatePlaying(dt) {
    const stageIndex = stageIndexAt(this.distance);
    const stage = stageAt(this.distance);
    const speed = BASE_RUN_SPEED + stageIndex * 26 + Math.min(60, this.distance * 0.02);

    // Hiding: the farmer loses the trail while the turkey is out of sight.
    const spot = this.field.hideSpotNear(this.turkey);
    this.hideHint = Boolean(spot) && !this.turkey.hidden;
    if (this.input.down && spot && !this.turkey.hidden) {
      if (this.turkey.hide()) {
        this.farmer.loseTrail(this.sounds);
        this.sounds.hide();
        this.showBanner('HIDDEN! HE LOST YOU!', '#a8e063', 1.4);
      }
    }

    this.turkey.update(dt, speed, this.input, this.sounds);
    this.farmer.update(dt, this.turkey, speed, stageIndex);
    this.field.update(dt, speed, this.distance, stage, stageIndex, this.turkey, this.sounds);

    // Distance and score tick up as the bird runs (kept as a float so the
    // small per-frame trickle actually accumulates; the HUD floors it).
    this.distance += (speed * dt) / 14;
    this.score += speed * dt * 0.06;

    const gained = this.field.collectCorn(this.turkey, this.sounds);
    if (gained > 0) {
      this.score += gained;
      this.cornCount += gained / 25;
    }

    const hit = this.field.checkHits(this.turkey);
    if (hit) this.takeHit(hit);

    // The farmer caught up.
    if (this.farmer.caught && this.screen === 'playing') {
      this.showBanner('CAUGHT!', '#e2574c', 1.4);
      this.endRun(false);
      return;
    }

    // Spotted! warning when he gets close.
    if (this.farmer.spotted && this.bannerTimer <= 0) {
      this.showBanner('SPOTTED! RUN!', '#f2c14e', 0.9);
      this.sounds.spotted();
    }

    // Stage change fanfare.
    if (stageIndex !== this.lastStageIndex) {
      this.lastStageIndex = stageIndex;
      this.score += 150;
      this.showBanner(stage.name, '#ffd98a', 2.0);
      this.sounds.gobble();
    }

    // Escape: the forest gate at the end of the kitchen.
    if (this.distance >= ESCAPE_DISTANCE) {
      this.score += 500;
      this.endRun(true);
    }
  }

  update(dt) {
    this.time += dt;
    if (this.bannerTimer > 0) this.bannerTimer -= dt;

    if (this.screen === 'title') {
      if (this.input.confirmPressed || this.input.clickIn(START_BUTTON)) {
        this.startRun();
      }
    } else if (this.screen === 'playing') {
      this.updatePlaying(dt);
    } else if (this.screen === 'caught' || this.screen === 'escaped') {
      if (this.input.confirmPressed || this.input.clickIn(RESTART_BUTTON)) {
        this.startRun();
      }
    }
    this.input.endFrame();
  }

  draw() {
    const ctx = this.ctx;
    const stageIndex = stageIndexAt(this.distance);
    const stage = stageAt(this.distance);
    drawBackground(ctx, stage, stageIndex, this.distance, this.time);
    drawHazards(ctx, this.field, this.time);
    drawFarmer(ctx, this.farmer, this.time);
    drawTurkey(ctx, this.turkey, this.time);
    if (this.screen === 'playing') {
      drawHud(ctx, this);
    } else if (this.screen === 'title') {
      drawTitle(ctx, this.time);
    } else {
      drawEnd(ctx, this, this.time);
    }
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000 || 0.016);
    this.lastTime = now;
    this.update(dt);
    this.draw();
  }

  run() {
    const loop = (now) => {
      this.frame(now);
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  }
}
