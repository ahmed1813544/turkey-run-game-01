// Gobble Dash: level scenery. One file, one job.
// What each stage looks like in the background: farmyard, barn, kitchen.
// Scenery is generated from a seed so a stage always looks the same.

export function sceneryFor(stageIndex, seed) {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const items = [];
  if (stageIndex === 0) {
    // Farmyard: red barn, windmill, fence posts, pumpkins, trees.
    for (let i = 0; i < 26; i += 1) {
      const kind = ['tree', 'pumpkin', 'fencepost', 'bush'][Math.floor(rand() * 4)];
      items.push({ kind, x: i * 240 + rand() * 120, size: 0.8 + rand() * 0.5 });
    }
    items.push({ kind: 'barn', x: 420, size: 1 });
    items.push({ kind: 'windmill', x: 1500, size: 1 });
    items.push({ kind: 'barn', x: 2600, size: 0.9 });
  } else if (stageIndex === 1) {
    // Barn: beams, hanging lanterns, hay bales, sacks, a big door.
    for (let i = 0; i < 22; i += 1) {
      const kind = ['lantern', 'sack', 'bale', 'beam'][Math.floor(rand() * 4)];
      items.push({ kind, x: i * 260 + rand() * 120, size: 0.8 + rand() * 0.5 });
    }
    items.push({ kind: 'barndoor', x: 900, size: 1 });
    items.push({ kind: 'barndoor', x: 2400, size: 1 });
  } else {
    // Kitchen: checkered wall, window, table, hanging pots, the big oven.
    for (let i = 0; i < 22; i += 1) {
      const kind = ['window', 'potrack', 'table', 'shelf'][Math.floor(rand() * 4)];
      items.push({ kind, x: i * 260 + rand() * 120, size: 0.8 + rand() * 0.5 });
    }
    items.push({ kind: 'bigoven', x: 700, size: 1 });
    items.push({ kind: 'bigoven', x: 2100, size: 1 });
    items.push({ kind: 'gate', x: 3200, size: 1 });
  }
  return items;
}

// The forest gate at the end of the kitchen stage: the escape.
export const GATE_X = 3300;
