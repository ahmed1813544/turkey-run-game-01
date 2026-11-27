// Gobble Dash: every sound is synthesized with WebAudio. No audio files.
// One file, one job: sound effects and the little Thanksgiving music loop.

export class SoundBank {
  constructor() {
    this.context = null;
    this.musicTimer = null;
    this.musicOn = false;
    this.step = 0;
  }

  unlock() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.context) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(this.context.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  noise(dur, vol, lowpass) {
    if (!this.context) return;
    const now = this.context.currentTime;
    const len = Math.max(1, Math.floor(this.context.sampleRate * dur));
    const buffer = this.context.createBuffer(1, len, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.start(now);
  }

  jump() { this.tone(320, 0.16, 'sine', 0.22, 640); }
  gobble() {
    this.tone(180, 0.09, 'square', 0.16, 120);
    setTimeout(() => this.tone(220, 0.09, 'square', 0.16, 140), 90);
    setTimeout(() => this.tone(160, 0.12, 'square', 0.16, 110), 180);
  }
  coin() { this.tone(880, 0.1, 'sine', 0.2, 1320); }
  thud() { this.noise(0.18, 0.3, 400); this.tone(90, 0.2, 'sine', 0.3, 50); }
  clang() { this.tone(1180, 0.25, 'triangle', 0.25, 300); this.noise(0.08, 0.2, 3000); }
  spotted() { this.tone(520, 0.12, 'sawtooth', 0.18, 780); this.tone(780, 0.14, 'sawtooth', 0.18, 1040); }
  caught() {
    this.tone(392, 0.2, 'sawtooth', 0.22, 370);
    this.tone(311, 0.2, 'sawtooth', 0.22, 294);
    this.tone(233, 0.45, 'sawtooth', 0.22, 180);
  }
  escaped() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => this.tone(n, 0.28, 'triangle', 0.22), i * 130));
  }
  hide() { this.noise(0.25, 0.15, 900); }

  // A cheerful little loop: bass note + melody note every eighth note.
  startMusic() {
    if (!this.context || this.musicOn) return;
    this.musicOn = true;
    const bass = [131, 131, 175, 196, 131, 131, 196, 165];
    const melody = [523, 659, 784, 659, 587, 659, 784, 880, 784, 659, 587, 523, 587, 659, 587, 523];
    this.musicTimer = setInterval(() => {
      if (!this.context) return;
      const beat = this.step % 8;
      const mel = melody[this.step % melody.length];
      this.tone(bass[beat], 0.22, 'triangle', 0.10);
      if (this.step % 2 === 0) this.tone(mel, 0.2, 'sine', 0.07);
      this.step += 1;
    }, 230);
  }

  stopMusic() {
    this.musicOn = false;
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
}
