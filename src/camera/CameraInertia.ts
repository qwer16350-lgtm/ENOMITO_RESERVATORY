export class CameraInertia {
  vx = 0;
  vy = 0;

  stop() { this.vx = 0; this.vy = 0; }

  sample(dx: number, dy: number, elapsedMs: number) {
    const seconds = Math.max(8, elapsedMs) / 1000;
    this.vx = dx / seconds;
    this.vy = dy / seconds;
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > 1800) { this.vx *= 1800 / speed; this.vy *= 1800 / speed; }
  }

  step(deltaMs: number) {
    const seconds = Math.min(50, Math.max(0, deltaMs)) / 1000;
    const decay = Math.exp(-5 * seconds);
    const distance = (1 - decay) / 5;
    const movement = { x: this.vx * distance, y: this.vy * distance };
    this.vx *= decay; this.vy *= decay;
    if (Math.hypot(this.vx, this.vy) < 10) this.stop();
    return movement;
  }

  get active() { return this.vx !== 0 || this.vy !== 0; }
}
