// Gobble Dash: hazards and pickups. One file, one job.
// Fences, hay bales and kitchen clutter to jump, falling carving knives,
// the glowing oven, corn to collect, and haystacks to hide in.

import { GROUND_Y, CANVAS_WIDTH } from './config.js';

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export class HazardField {
  constructor() {
    this.obstacles = [];
    this.knives = [];
    this.ovens = [];
    this.corns = [];
    this.hideSpots = [];
    this.spawnTimer = 0;
    this.knifeTimer = 2.5;
    this.cornTimer = 1.2;
  }

  reset() {
    this.obstacles = [];
    this.knives = [];
    this.ovens = [];
    this.corns = [];
    this.hideSpots = [];
    this.spawnTimer = 0.4;
    this.knifeTimer = 2.5;
    this.cornTimer = 1.0;
  }

  spawnObstacle(stageIndex) {
    const kinds = stageIndex === 2
      ? ['chair', 'pot', 'fence', 'crate']
      : stageIndex === 1
        ? ['haybale', 'fence', 'crate']
        : ['fence', 'haybale', 'crate'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const heights = { fence: 52, haybale: 46, crate: 58, chair: 50, pot: 40 };
    const widths = { fence: 34, haybale: 62, crate: 56, chair: 48, pot: 52 };
    this.obstacles.push({
      id: makeId(),
      kind,
      x: CANVAS_WIDTH + 60,
      y: GROUND_Y,
      w: widths[kind],
      h: heights[kind],
      passed: false,
    });
    // A haystack to hide in sometimes trails an obstacle.
    if (Math.random() < 0.45) {
      this.hideSpots.push({
        id: makeId(),
        kind: stageIndex === 2 ? 'crate' : 'haystack',
        x: CANVAS_WIDTH + 220,
        y: GROUND_Y,
        w: 74,
        h: 66,
      });
    }
  }

  spawnKnife() {
    const targetX = 260 + Math.random() * 560;
    this.knives.push({
      id: makeId(),
      x: targetX,
      y: -30,
      vy: 0,
      state: 'falling',
      warn: 0.7,
      stuck: 0,
    });
  }

  spawnOven() {
    this.ovens.push({
      id: makeId(),
      x: CANVAS_WIDTH + 80,
      y: GROUND_Y,
      w: 130,
      h: 46,
      flicker: Math.random() * 10,
    });
  }

  spawnCorn() {
    const n = 3 + Math.floor(Math.random() * 3);
    const baseX = CANVAS_WIDTH + 40;
    const high = Math.random() < 0.35;
    for (let i = 0; i < n; i += 1) {
      this.corns.push({
        id: makeId(),
        x: baseX + i * 42,
        y: high ? GROUND_Y - 150 : GROUND_Y - 42,
        taken: false,
        bob: Math.random() * 6,
      });
    }
  }

  update(dt, speed, distance, stage, stageIndex, turkey, sounds) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnObstacle(stageIndex);
      this.spawnTimer = stage.spawnEvery * (0.85 + Math.random() * 0.4);
    }
    this.knifeTimer -= dt;
    if (this.knifeTimer <= 0) {
      this.spawnKnife();
      this.knifeTimer = stage.knifeEvery * (0.85 + Math.random() * 0.4);
    }
    this.cornTimer -= dt;
    if (this.cornTimer <= 0) {
      this.spawnCorn();
      this.cornTimer = stage.cornEvery * (0.85 + Math.random() * 0.4);
    }
    // The kitchen stage adds glowing oven patches on the floor.
    if (stageIndex === 2 && Math.random() < dt * 0.5 && this.ovens.length < 2) {
      this.spawnOven();
    }

    const move = speed * dt;
    for (const o of this.obstacles) o.x -= move;
    for (const h of this.hideSpots) h.x -= move;
    for (const c of this.corns) { c.x -= move; c.bob += dt * 4; }
    for (const v of this.ovens) { v.x -= move; v.flicker += dt * 9; }

    this.obstacles = this.obstacles.filter((o) => o.x > -120);
    this.hideSpots = this.hideSpots.filter((h) => h.x > -120);
    this.corns = this.corns.filter((c) => c.x > -60 && !c.taken);
    this.ovens = this.ovens.filter((v) => v.x > -220);

    for (const k of this.knives) {
      if (k.state === 'falling') {
        k.warn -= dt;
        if (k.warn <= 0) {
          k.vy += 2600 * dt;
          k.y += k.vy * dt;
          if (k.y >= GROUND_Y - 8) {
            k.y = GROUND_Y - 8;
            k.state = 'stuck';
            k.stuck = 1.1;
            sounds.thud();
          }
        }
      } else if (k.state === 'stuck') {
        k.stuck -= dt;
        if (k.stuck <= 0) k.state = 'gone';
      }
    }
    this.knives = this.knives.filter((k) => k.state !== 'gone' && k.x > -60);
    for (const k of this.knives) k.x -= move * 0.35;
  }

  // Returns 'obstacle' | 'knife' | 'oven' | null when the turkey is hit.
  checkHits(turkey) {
    if (turkey.invulnerable > 0 || turkey.hidden) return null;
    const b = turkey.box;
    for (const o of this.obstacles) {
      const top = o.y - o.h;
      const overlapX = b.x + b.w > o.x - o.w / 2 + 6 && b.x < o.x + o.w / 2 - 6;
      const overlapY = b.y + b.h > top + 10;
      const lowEnough = b.y + b.h > top + 26;
      if (overlapX && overlapY && lowEnough && turkey.y > GROUND_Y - o.h - 6) {
        return 'obstacle';
      }
    }
    for (const k of this.knives) {
      if (k.state !== 'stuck' && k.state !== 'falling') continue;
      if (k.state === 'falling' && k.y < GROUND_Y - 120) continue;
      if (Math.abs(turkey.x - k.x) < 34 && b.y + b.h > GROUND_Y - 70) return 'knife';
    }
    for (const v of this.ovens) {
      if (turkey.x > v.x - v.w / 2 && turkey.x < v.x + v.w / 2 && turkey.y > GROUND_Y - 30) {
        return 'oven';
      }
    }
    return null;
  }

  collectCorn(turkey, sounds) {
    let gained = 0;
    const b = turkey.box;
    for (const c of this.corns) {
      if (c.taken) continue;
      const dx = c.x - (b.x + b.w / 2);
      const dy = (c.y + Math.sin(c.bob) * 4) - (b.y + b.h / 2);
      if (dx * dx + dy * dy < 42 * 42) {
        c.taken = true;
        gained += 25;
        sounds.coin();
      }
    }
    return gained;
  }

  // The nearest hide spot the turkey can duck into right now.
  hideSpotNear(turkey) {
    for (const h of this.hideSpots) {
      if (Math.abs(turkey.x - h.x) < 60 && turkey.onGround) return h;
    }
    return null;
  }
}
