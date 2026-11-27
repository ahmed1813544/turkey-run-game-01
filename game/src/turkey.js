// Gobble Dash: the turkey — the player. One file, one job.
// Holds position, jumping, hiding, stumble and the turkey's own animation.

import { GRAVITY, GROUND_Y, JUMP_SPEED } from './config.js';

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 220;
    this.y = GROUND_Y;
    this.vy = 0;
    this.width = 64;
    this.height = 58;
    this.onGround = true;
    this.hidden = false;
    this.hideTimer = 0;
    this.invulnerable = 0;
    this.stumble = 0;
    this.runCycle = 0;
    this.flap = 0;
    this.facing = 1;
  }

  get grounded() { return this.onGround; }

  jump(sounds) {
    if (!this.onGround || this.hidden) return false;
    this.vy = -JUMP_SPEED;
    this.onGround = false;
    this.flap = 0.35;
    sounds.jump();
    return true;
  }

  // Duck into a haystack or crate. While hidden the farmer loses the trail.
  hide() {
    if (!this.onGround || this.hidden) return false;
    this.hidden = true;
    this.hideTimer = 1.6;
    return true;
  }

  unhide() {
    this.hidden = false;
    this.hideTimer = 0;
  }

  hit() {
    this.stumble = 0.55;
    this.invulnerable = 1.4;
    this.unhide();
  }

  update(dt, speed, input, sounds) {
    if (this.invulnerable > 0) this.invulnerable -= dt;
    if (this.stumble > 0) this.stumble -= dt;
    if (this.flap > 0) this.flap -= dt;

    if (this.hidden) {
      this.hideTimer -= dt;
      if (this.hideTimer <= 0 || input.jumpPressed) this.unhide();
      return;
    }

    if (input.jumpPressed) this.jump(sounds);

    // Left slows the bird (and lets the farmer close in), right hurries it.
    let vx = speed;
    if (input.left) vx *= 0.55;
    if (input.right) vx *= 1.25;
    if (this.stumble > 0) vx *= 0.45;
    this.x += (vx - speed) * dt * 0.9;
    if (this.x < 90) this.x = 90;
    if (this.x > 620) this.x = 620;

    this.vy += GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    this.runCycle += dt * (this.onGround ? 11 : 4);
  }

  // Rough collision box, a little forgiving at the edges.
  get box() {
    return {
      x: this.x - 22,
      y: this.y - this.height + 8,
      w: 44,
      h: this.height - 8,
    };
  }
}
