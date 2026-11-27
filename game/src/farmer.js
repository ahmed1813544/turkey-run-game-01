// Gobble Dash: the farmer — the chaser. One file, one job.
// He runs behind the turkey, closes in when it stumbles, searches when it
// hides, and corners it at the end of a stage if it dawdles.

import { GROUND_Y } from './config.js';

export const FARMER_STATES = {
  CHASING: 'chasing',
  SEARCHING: 'searching',
  CORNERING: 'cornering',
};

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    // gap: how many pixels behind the turkey the farmer is. 0 means caught.
    this.gap = 260;
    this.state = FARMER_STATES.CHASING;
    this.searchTimer = 0;
    this.runCycle = 0;
    this.y = GROUND_Y;
    this.shoutTimer = 0;
  }

  get x() {
    // The turkey sits near x=220; the farmer trails by the gap.
    return 220 - this.gap;
  }

  get caught() { return this.gap <= 6; }

  get spotted() {
    return this.state === FARMER_STATES.CHASING && this.gap < 130;
  }

  update(dt, turkey, speed, stageIndex) {
    this.runCycle += dt * 12;
    if (this.shoutTimer > 0) this.shoutTimer -= dt;

    if (this.state === FARMER_STATES.SEARCHING) {
      this.searchTimer -= dt;
      // While he searches the bushes, the turkey slips further ahead.
      this.gap += speed * dt * 0.55;
      if (this.searchTimer <= 0) {
        this.state = FARMER_STATES.CHASING;
        this.gap = Math.min(this.gap, 240);
      }
      return;
    }

    // Base chase: he gains slowly when the turkey is hurt or slow, and the
    // turkey pulls away when it runs clean and fast.
    let drift = 14;
    if (turkey.stumble > 0) drift += 150;
    if (turkey.hidden) drift = 0;
    const turkeyBoost = turkey.x > 320 ? 26 : 0;
    this.gap -= (drift - turkeyBoost) * dt;

    // Later stages: a fitter, angrier farmer.
    this.gap -= stageIndex * 4 * dt;

    if (this.gap > 420) this.gap = 420;
    if (this.gap < 0) this.gap = 0;
  }

  // The turkey vanished into a haystack: the farmer stops and searches.
  loseTrail(sounds) {
    if (this.state !== FARMER_STATES.SEARCHING) {
      this.state = FARMER_STATES.SEARCHING;
      this.searchTimer = 2.2;
      this.shoutTimer = 1.2;
      sounds.spotted();
    }
  }

  // A stumble right in front of him: he lunges.
  lunge() {
    this.gap = Math.max(0, this.gap - 70);
    this.shoutTimer = 1.0;
  }

  get box() {
    return { x: this.x - 26, y: this.y - 96, w: 52, h: 96 };
  }
}
