// Gobble Dash: all canvas drawing. One file, one job.
// Every sprite is drawn in code — no image files anywhere.

import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, stageAt, ESCAPE_DISTANCE } from './config.js';
import { sceneryFor } from './levels.js';

const sceneryCache = new Map();

function scenery(stageIndex) {
  if (!sceneryCache.has(stageIndex)) sceneryCache.set(stageIndex, sceneryFor(stageIndex, 7 + stageIndex * 13));
  return sceneryCache.get(stageIndex);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground(ctx, stage, stageIndex, distance, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, stage.sky[0]);
  grad.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Sun with a sleepy autumn face.
  const sunX = 800 - (distance * 0.05) % 200;
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(sunX, 70, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.arc(sunX - 12, 62, 4, 0, Math.PI * 2);
  ctx.arc(sunX + 12, 62, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d98e2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sunX, 76, 12, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Drifting clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 4; i += 1) {
    const cx = ((i * 320 - distance * 0.12) % 1100 + 1100) % 1100 - 80;
    const cy = 60 + i * 34;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 52, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 34, cy + 6, 36, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Parallax hills.
  ctx.fillStyle = stageIndex === 1 ? '#6b4a2f' : '#8fae5a';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 60);
  for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
    ctx.lineTo(x, GROUND_Y - 60 - Math.sin((x + distance * 0.3) * 0.008) * 26);
  }
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Scenery, scrolling with the world.
  const items = scenery(stageIndex);
  const offset = (distance * 14) % 3400;
  for (const item of items) {
    let sx = item.x - offset;
    if (sx < -260) sx += 3400;
    if (sx > CANVAS_WIDTH + 60) continue;
    drawSceneryItem(ctx, item, sx, stageIndex, time);
  }

  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = 0; x < CANVAS_WIDTH; x += 90) {
    const gx = x - ((distance * 14) % 90);
    ctx.fillRect(gx, GROUND_Y + 22, 34, 5);
  }

  // The forest gate at the very end of the kitchen stage.
  const gateProgress = distance / ESCAPE_DISTANCE;
  if (gateProgress > 0.86) {
    const gx = CANVAS_WIDTH - (1 - gateProgress) * 2600;
    drawGate(ctx, gx);
  }
}

function drawGate(ctx, gx) {
  ctx.fillStyle = '#5d8a3c';
  ctx.beginPath();
  ctx.arc(gx, GROUND_Y - 120, 90, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(gx - 8, GROUND_Y - 120, 16, 120);
  ctx.fillStyle = '#2f6b2f';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FOREST', gx, GROUND_Y - 140);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('FREEDOM THIS WAY!', gx, GROUND_Y - 118);
}

function drawSceneryItem(ctx, item, x, stageIndex, time) {
  ctx.save();
  ctx.translate(x, 0);
  const s = item.size;
  if (item.kind === 'tree') {
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(-6 * s, GROUND_Y - 90 * s, 12 * s, 90 * s);
    ctx.fillStyle = stageIndex === 2 ? '#c96f4a' : '#e07b39';
    ctx.beginPath();
    ctx.arc(0, GROUND_Y - 105 * s, 42 * s, 0, Math.PI * 2);
    ctx.arc(-30 * s, GROUND_Y - 80 * s, 28 * s, 0, Math.PI * 2);
    ctx.arc(30 * s, GROUND_Y - 80 * s, 28 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'pumpkin') {
    ctx.fillStyle = '#e07b1f';
    ctx.beginPath();
    ctx.ellipse(0, GROUND_Y - 16 * s, 26 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d8a3c';
    ctx.fillRect(-3 * s, GROUND_Y - 40 * s, 6 * s, 10 * s);
  } else if (item.kind === 'fencepost') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-4 * s, GROUND_Y - 46 * s, 8 * s, 46 * s);
    ctx.fillRect(-22 * s, GROUND_Y - 38 * s, 44 * s, 6 * s);
  } else if (item.kind === 'bush') {
    ctx.fillStyle = '#5d8a3c';
    ctx.beginPath();
    ctx.arc(0, GROUND_Y - 14 * s, 24 * s, 0, Math.PI * 2);
    ctx.arc(20 * s, GROUND_Y - 10 * s, 18 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'barn') {
    ctx.fillStyle = '#a83226';
    ctx.fillRect(-90 * s, GROUND_Y - 130 * s, 180 * s, 130 * s);
    ctx.fillStyle = '#7c241a';
    ctx.beginPath();
    ctx.moveTo(-100 * s, GROUND_Y - 130 * s);
    ctx.lineTo(0, GROUND_Y - 190 * s);
    ctx.lineTo(100 * s, GROUND_Y - 130 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7e3c0';
    ctx.fillRect(-24 * s, GROUND_Y - 70 * s, 48 * s, 70 * s);
    ctx.strokeStyle = '#5d1a12';
    ctx.lineWidth = 4;
    ctx.strokeRect(-24 * s, GROUND_Y - 70 * s, 48 * s, 70 * s);
  } else if (item.kind === 'windmill') {
    ctx.fillStyle = '#8a6a3f';
    ctx.fillRect(-8 * s, GROUND_Y - 170 * s, 16 * s, 170 * s);
    ctx.save();
    ctx.translate(0, GROUND_Y - 175 * s);
    ctx.rotate(time * 0.6);
    ctx.fillStyle = '#f2e3c6';
    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-5 * s, -70 * s, 10 * s, 70 * s);
    }
    ctx.restore();
  } else if (item.kind === 'lantern') {
    ctx.strokeStyle = '#3a2415';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(0, 96 * s);
    ctx.stroke();
    const glow = 0.7 + Math.sin(time * 5 + x) * 0.3;
    ctx.fillStyle = `rgba(255,190,80,${glow})`;
    ctx.beginPath();
    ctx.arc(0, 112 * s, 16 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d3a26';
    ctx.fillRect(-10 * s, 96 * s, 20 * s, 6 * s);
  } else if (item.kind === 'sack') {
    ctx.fillStyle = '#c9a86a';
    ctx.beginPath();
    ctx.ellipse(0, GROUND_Y - 18 * s, 26 * s, 20 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8874f';
    ctx.fillRect(-8 * s, GROUND_Y - 42 * s, 16 * s, 10 * s);
  } else if (item.kind === 'bale') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(0, GROUND_Y - 22 * s, 24 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87c2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, GROUND_Y - 22 * s, 14 * s, 0, Math.PI * 2);
    ctx.stroke();
  } else if (item.kind === 'beam') {
    ctx.fillStyle = '#4a2f1c';
    ctx.fillRect(-30 * s, 40, 60 * s, 14 * s);
  } else if (item.kind === 'barndoor') {
    ctx.fillStyle = '#6b3a1c';
    ctx.fillRect(-70 * s, GROUND_Y - 170 * s, 140 * s, 170 * s);
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-70 * s, GROUND_Y - 170 * s, 140 * s, 12 * s);
    ctx.strokeStyle = '#3a2415';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 170 * s);
    ctx.lineTo(0, GROUND_Y);
    ctx.stroke();
  } else if (item.kind === 'window') {
    ctx.fillStyle = '#bfe3f2';
    ctx.fillRect(-34 * s, 90, 68 * s, 80 * s);
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 5;
    ctx.strokeRect(-34 * s, 90, 68 * s, 80 * s);
    ctx.beginPath();
    ctx.moveTo(0, 90);
    ctx.lineTo(0, 170);
    ctx.moveTo(-34 * s, 130);
    ctx.lineTo(34 * s, 130);
    ctx.stroke();
  } else if (item.kind === 'potrack') {
    ctx.fillStyle = '#5d5d5d';
    ctx.fillRect(-40 * s, 70, 80 * s, 6 * s);
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(-20 * s, 96 * s, 12 * s, 0, Math.PI * 2);
    ctx.arc(18 * s, 96 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'table') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-52 * s, GROUND_Y - 70 * s, 104 * s, 10 * s);
    ctx.fillRect(-46 * s, GROUND_Y - 60 * s, 8 * s, 60 * s);
    ctx.fillRect(38 * s, GROUND_Y - 60 * s, 8 * s, 60 * s);
    ctx.fillStyle = '#e2574c';
    ctx.beginPath();
    ctx.arc(0, GROUND_Y - 82 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'shelf') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-44 * s, 150, 88 * s, 8 * s);
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(-30 * s, 128, 14 * s, 22 * s);
    ctx.fillRect(-6 * s, 128, 14 * s, 22 * s);
    ctx.fillRect(18 * s, 128, 14 * s, 22 * s);
  } else if (item.kind === 'bigoven') {
    ctx.fillStyle = '#4a4a4a';
    roundRect(ctx, -70 * s, GROUND_Y - 150 * s, 140 * s, 150 * s, 10);
    ctx.fill();
    const glow = 0.6 + Math.sin(time * 6) * 0.25;
    ctx.fillStyle = `rgba(255,123,47,${glow})`;
    ctx.fillRect(-52 * s, GROUND_Y - 96 * s, 104 * s, 52 * s);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.strokeRect(-52 * s, GROUND_Y - 96 * s, 104 * s, 52 * s);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(-40 * s, GROUND_Y - 138 * s, 80 * s, 12 * s);
  }
  ctx.restore();
}

export function drawTurkey(ctx, turkey, time) {
  const x = turkey.x;
  const y = turkey.y;
  const legSwing = Math.sin(turkey.runCycle) * (turkey.onGround ? 9 : 2);
  const blink = turkey.invulnerable > 0 && Math.floor(time * 14) % 2 === 0;
  ctx.save();
  ctx.translate(x, y);
  if (blink) ctx.globalAlpha = 0.35;
  if (turkey.hidden) {
    // Peeking out of the hay: just eyes and a beak above the pile.
    ctx.fillStyle = '#6b4a1c';
    ctx.beginPath();
    ctx.ellipse(0, -14, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-6, -22, 5, 0, Math.PI * 2);
    ctx.arc(6, -22, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-6, -22, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -22, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e07b1f';
    ctx.beginPath();
    ctx.moveTo(-4, -16);
    ctx.lineTo(8, -14);
    ctx.lineTo(-4, -11);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  // Tail feathers, fanned.
  const featherColors = ['#c96f2e', '#e2574c', '#f2c14e', '#8a5a2b', '#d98e2b'];
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.32 - 0.15);
    ctx.fillStyle = featherColors[i + 2];
    ctx.beginPath();
    ctx.ellipse(-30, -34, 9, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Legs, running.
  ctx.strokeStyle = '#e07b1f';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(-6 + legSwing, 0);
  ctx.moveTo(6, -14);
  ctx.lineTo(6 - legSwing, 0);
  ctx.stroke();
  // Body.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, -30, 26, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a8703a';
  ctx.beginPath();
  ctx.ellipse(4, -26, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing, flapping when jumping.
  const wingLift = turkey.flap > 0 ? -14 : Math.sin(turkey.runCycle) * 3;
  ctx.fillStyle = '#6b4a1c';
  ctx.beginPath();
  ctx.ellipse(-12, -32 + wingLift, 14, 8, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Head.
  ctx.fillStyle = '#7a9cc6';
  ctx.beginPath();
  ctx.arc(20, -56, 13, 0, Math.PI * 2);
  ctx.fill();
  // Beak + wattle.
  ctx.fillStyle = '#e07b1f';
  ctx.beginPath();
  ctx.moveTo(30, -58);
  ctx.lineTo(42, -54);
  ctx.lineTo(30, -50);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e2574c';
  ctx.beginPath();
  ctx.ellipse(30, -46, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(23, -60, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(24.5, -60, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFarmer(ctx, farmer, time) {
  const x = farmer.x;
  const y = farmer.y;
  if (x < -80) return; // still off-screen to the left
  const legSwing = Math.sin(farmer.runCycle) * 11;
  ctx.save();
  ctx.translate(x, y);
  // Legs.
  ctx.strokeStyle = '#3a4a6b';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -44);
  ctx.lineTo(-5 + legSwing, 0);
  ctx.moveTo(5, -44);
  ctx.lineTo(5 - legSwing, 0);
  ctx.stroke();
  // Overalls.
  ctx.fillStyle = '#3a5a8a';
  roundRect(ctx, -18, -92, 36, 50, 6);
  ctx.fill();
  // Shirt + arm reaching forward.
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-18, -96, 36, 22);
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(12, -88);
  ctx.lineTo(30, -72 + Math.sin(farmer.runCycle) * 4);
  ctx.stroke();
  // Head + hat.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -106, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7e3c0';
  ctx.beginPath();
  ctx.ellipse(0, -118, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -136, 26, 18);
  // Angry eyes + moustache.
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(6, -108, 2.4, 0, Math.PI * 2);
  ctx.arc(13, -108, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, -98);
  ctx.lineTo(16, -98);
  ctx.stroke();
  // Shout bubble when searching.
  if (farmer.state === 'searching' && farmer.shoutTimer > 0) {
    ctx.fillStyle = '#fff';
    roundRect(ctx, 8, -178, 118, 34, 10);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('WHERE ARE YA?!', 16, -156);
  }
  ctx.restore();
}

export function drawHazards(ctx, field, time) {
  // Hide spots (haystacks / crates) first so the turkey can duck behind them.
  for (const h of field.hideSpots) {
    ctx.save();
    ctx.translate(h.x, h.y);
    if (h.kind === 'haystack') {
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.moveTo(-38, 0);
      ctx.quadraticCurveTo(-30, -66, 0, -66);
      ctx.quadraticCurveTo(30, -66, 38, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a87c2a';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 12, -60);
        ctx.lineTo(i * 12 + 6, -10);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(-37, -66, 74, 66);
      ctx.strokeStyle = '#5d3a1a';
      ctx.lineWidth = 3;
      ctx.strokeRect(-37, -66, 74, 66);
      ctx.beginPath();
      ctx.moveTo(-37, -66);
      ctx.lineTo(37, 0);
      ctx.moveTo(37, -66);
      ctx.lineTo(-37, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Oven glow patches on the kitchen floor.
  for (const v of field.ovens) {
    const glow = 0.55 + Math.sin(v.flicker) * 0.25;
    ctx.fillStyle = `rgba(255,123,47,${glow})`;
    ctx.beginPath();
    ctx.ellipse(v.x, GROUND_Y - 8, v.w / 2, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff5a1f';
    ctx.beginPath();
    ctx.ellipse(v.x, GROUND_Y - 4, v.w / 3, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', v.x, GROUND_Y - 34);
  }

  // Obstacles.
  for (const o of field.obstacles) {
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.kind === 'fence') {
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(-17, -o.h, 8, o.h);
      ctx.fillRect(9, -o.h, 8, o.h);
      ctx.fillRect(-20, -o.h + 8, 40, 7);
      ctx.fillRect(-20, -o.h + 26, 40, 7);
    } else if (o.kind === 'haybale') {
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.arc(0, -o.h / 2, o.h / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a87c2a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -o.h / 2, o.h / 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (o.kind === 'crate') {
      ctx.fillStyle = '#a8703a';
      ctx.fillRect(-o.w / 2, -o.h, o.w, o.h);
      ctx.strokeStyle = '#6b4a1c';
      ctx.lineWidth = 3;
      ctx.strokeRect(-o.w / 2, -o.h, o.w, o.h);
      ctx.beginPath();
      ctx.moveTo(-o.w / 2, -o.h);
      ctx.lineTo(o.w / 2, 0);
      ctx.stroke();
    } else if (o.kind === 'chair') {
      ctx.fillStyle = '#7a4a21';
      ctx.fillRect(-20, -o.h, 40, 8);
      ctx.fillRect(-20, -o.h, 6, o.h);
      ctx.fillRect(14, -o.h, 6, o.h);
      ctx.fillRect(-20, -o.h - 22, 6, 22);
      ctx.fillRect(14, -o.h - 22, 6, 22);
      ctx.fillRect(-20, -o.h - 22, 40, 6);
    } else if (o.kind === 'pot') {
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.ellipse(0, -o.h / 2, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.fillRect(-o.w / 2 - 6, -o.h + 6, 10, 6);
      ctx.fillRect(o.w / 2 - 4, -o.h + 6, 10, 6);
    }
    ctx.restore();
  }

  // Falling carving knives: warning marker, then the blade.
  for (const k of field.knives) {
    if (k.state === 'falling' && k.warn > 0) {
      const pulse = 0.5 + Math.sin(time * 16) * 0.5;
      ctx.fillStyle = `rgba(226,87,76,${pulse})`;
      ctx.beginPath();
      ctx.moveTo(k.x, GROUND_Y - 8);
      ctx.lineTo(k.x - 12, GROUND_Y - 30);
      ctx.lineTo(k.x + 12, GROUND_Y - 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e2574c';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', k.x, GROUND_Y - 36);
      continue;
    }
    ctx.save();
    ctx.translate(k.x, k.y);
    ctx.rotate(0.12);
    ctx.fillStyle = '#dfe6ea';
    ctx.beginPath();
    ctx.moveTo(-4, -46);
    ctx.lineTo(4, -46);
    ctx.lineTo(8, 6);
    ctx.lineTo(0, 16);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a97a3';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(-5, -62, 10, 18);
    ctx.restore();
  }

  // Corn pickups.
  for (const c of field.corns) {
    if (c.taken) continue;
    const bobY = c.y + Math.sin(c.bob) * 4;
    ctx.save();
    ctx.translate(c.x, bobY);
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 16, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d98e2b';
    for (let r = -1; r <= 1; r += 1) {
      ctx.beginPath();
      ctx.arc(r * 4, -6, 1.6, 0, Math.PI * 2);
      ctx.arc(r * 4, 0, 1.6, 0, Math.PI * 2);
      ctx.arc(r * 4, 6, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5d8a3c';
    ctx.beginPath();
    ctx.ellipse(0, -18, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawHud(ctx, game) {
  const stage = stageAt(game.distance);
  ctx.fillStyle = 'rgba(30,20,10,0.55)';
  roundRect(ctx, 12, 12, 320, 74, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`SCORE ${Math.floor(game.score)}`, 26, 42);
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(`DISTANCE ${Math.floor(game.distance)} m`, 26, 68);
  // Lives as hearts.
  for (let i = 0; i < 3; i += 1) {
    const x = 252 + i * 26;
    const y = 60;
    ctx.fillStyle = i < game.lives ? '#e2574c' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.arc(x + 11, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 4);
    ctx.lineTo(x + 16, y + 4);
    ctx.lineTo(x + 5, y + 15);
    ctx.closePath();
    ctx.fill();
  }
  // Stage + farmer proximity.
  ctx.fillStyle = 'rgba(30,20,10,0.55)';
  roundRect(ctx, CANVAS_WIDTH - 332, 12, 320, 74, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(stage.name, CANVAS_WIDTH - 318, 36);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('FARMER', CANVAS_WIDTH - 318, 62);
  const gapRatio = Math.max(0, Math.min(1, game.farmer.gap / 420));
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(CANVAS_WIDTH - 238, 50, 200, 14);
  ctx.fillStyle = gapRatio > 0.5 ? '#7fae4c' : gapRatio > 0.25 ? '#f2c14e' : '#e2574c';
  ctx.fillRect(CANVAS_WIDTH - 238, 50, 200 * gapRatio, 14);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(gapRatio > 0.5 ? 'FAR BEHIND' : gapRatio > 0.25 ? 'CLOSING IN…' : 'RIGHT BEHIND YOU!', CANVAS_WIDTH - 318, 74);

  // Flash banners: spotted / hit / stage change.
  if (game.banner) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, game.bannerTimer * 2);
    ctx.fillStyle = game.bannerColor;
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 6;
    ctx.strokeText(game.banner, CANVAS_WIDTH / 2, 150);
    ctx.fillText(game.banner, CANVAS_WIDTH / 2, 150);
    ctx.restore();
  }
  // "Press DOWN to hide" hint when a hide spot is near.
  if (game.hideHint) {
    ctx.fillStyle = 'rgba(30,20,10,0.7)';
    roundRect(ctx, CANVAS_WIDTH / 2 - 150, 176, 300, 34, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS DOWN TO HIDE IN THE HAY!', CANVAS_WIDTH / 2, 199);
  }
}

export function drawTitle(ctx, time) {
  ctx.fillStyle = 'rgba(60,30,5,0.45)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('A THANKSGIVING ESCAPE', CANVAS_WIDTH / 2, 92);
  const bob = Math.sin(time * 2) * 6;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 64px sans-serif';
  ctx.strokeStyle = '#7c241a';
  ctx.lineWidth = 10;
  ctx.strokeText('GOBBLE DASH', CANVAS_WIDTH / 2, 168 + bob);
  ctx.fillText('GOBBLE DASH', CANVAS_WIDTH / 2, 168 + bob);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('The farmer wants you for dinner. Run for the forest!', CANVAS_WIDTH / 2, 214);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = '#ffe9b8';
  ctx.fillText('Jump the fences and the falling carving knives. Grab the corn.', CANVAS_WIDTH / 2, 246);
  ctx.fillText('Dodge the glowing oven in the kitchen. Hide in the hay when he gets close.', CANVAS_WIDTH / 2, 270);
  ctx.fillText('Three stages: farmyard → barn → kitchen → freedom!', CANVAS_WIDTH / 2, 294);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('ARROWS / WASD to move  •  SPACE to jump  •  DOWN to hide  •  CLICK or ENTER to start', CANVAS_WIDTH / 2, 336);
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(226,87,76,${pulse})`;
  roundRect(ctx, CANVAS_WIDTH / 2 - 130, 368, 260, 56, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('▶  START THE ESCAPE', CANVAS_WIDTH / 2, 404);
  ctx.fillStyle = '#ffe9b8';
  ctx.font = '15px sans-serif';
  ctx.fillText('Best score is saved on this computer. Good luck, bird.', CANVAS_WIDTH / 2, 452);
}

export function drawEnd(ctx, game, time) {
  ctx.fillStyle = 'rgba(40,15,5,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  if (game.screen === 'escaped') {
    ctx.fillStyle = '#a8e063';
    ctx.font = 'bold 54px sans-serif';
    ctx.strokeStyle = '#2f6b2f';
    ctx.lineWidth = 8;
    ctx.strokeText('YOU ESCAPED!', CANVAS_WIDTH / 2, 150);
    ctx.fillText('YOU ESCAPED!', CANVAS_WIDTH / 2, 150);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('The turkey made it to the forest. No Thanksgiving dinner today!', CANVAS_WIDTH / 2, 196);
  } else {
    ctx.fillStyle = '#ff9a8a';
    ctx.font = 'bold 54px sans-serif';
    ctx.strokeStyle = '#5d1a12';
    ctx.lineWidth = 8;
    ctx.strokeText('CAUGHT!', CANVAS_WIDTH / 2, 150);
    ctx.fillText('CAUGHT!', CANVAS_WIDTH / 2, 150);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('The farmer got you… but every great escape deserves a second try.', CANVAS_WIDTH / 2, 196);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`FINAL SCORE  ${Math.floor(game.score)}`, CANVAS_WIDTH / 2, 252);
  ctx.font = '20px sans-serif';
  ctx.fillText(`Distance run: ${Math.floor(game.distance)} m   •   Corn collected: ${game.cornCount}`, CANVAS_WIDTH / 2, 286);
  if (game.score > game.bestScore && game.score > 0) {
    ctx.fillStyle = '#ffd98a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('★ NEW BEST SCORE! ★', CANVAS_WIDTH / 2, 320);
  } else if (game.bestScore > 0) {
    ctx.fillStyle = '#ffe9b8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Best score: ${Math.floor(game.bestScore)}`, CANVAS_WIDTH / 2, 320);
  }
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(226,87,76,${pulse})`;
  roundRect(ctx, CANVAS_WIDTH / 2 - 130, 352, 260, 56, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('↻  RUN AGAIN', CANVAS_WIDTH / 2, 388);
  ctx.fillStyle = '#ffe9b8';
  ctx.font = '15px sans-serif';
  ctx.fillText('Click the button or press ENTER', CANVAS_WIDTH / 2, 436);
}

export { drawBackground };
