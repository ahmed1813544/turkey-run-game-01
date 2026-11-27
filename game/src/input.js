// Gobble Dash: keyboard and mouse input, one file, one job.
// Tracks held keys, edge-triggered presses, and clicks on canvas buttons.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.clicks = [];
    this.anyKey = false;

    window.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (!event.repeat) {
        this.pressed.add(event.code);
        this.anyKey = true;
      }
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.clicks.push({
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      });
      this.anyKey = true;
    });
  }

  held(code) { return this.keys.has(code); }

  get left() { return this.held('ArrowLeft') || this.held('KeyA'); }
  get right() { return this.held('ArrowRight') || this.held('KeyD'); }
  get down() { return this.held('ArrowDown') || this.held('KeyS'); }
  get jumpHeld() { return this.held('ArrowUp') || this.held('KeyW') || this.held('Space'); }

  wasPressed(code) { return this.pressed.has(code); }
  get jumpPressed() {
    return this.wasPressed('Space') || this.wasPressed('ArrowUp') || this.wasPressed('KeyW');
  }
  get confirmPressed() {
    return this.wasPressed('Enter') || this.wasPressed('Space');
  }

  clickIn(rect) {
    for (let i = 0; i < this.clicks.length; i += 1) {
      const c = this.clicks[i];
      if (c.x >= rect.x && c.x <= rect.x + rect.w && c.y >= rect.y && c.y <= rect.y + rect.h) {
        this.clicks.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  endFrame() {
    this.pressed.clear();
    this.clicks.length = 0;
    this.anyKey = false;
  }
}
