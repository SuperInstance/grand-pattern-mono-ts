import { Jepa } from './jepa';

/**
 * Room – a cell in the mono-vibe architecture.
 */
export class Room {
  id: string;
  vibe: number;
  jepa: Jepa;
  lastSurprise: number;

  constructor(id: string, vibe: number = 0, alpha: number = 0.3) {
    this.id = id;
    this.vibe = vibe;
    this.jepa = new Jepa(alpha);
    this.lastSurprise = 0;
    this.jepa.observe(vibe);
  }

  observe(newVibe: number): void {
    this.lastSurprise = this.jepa.surprise(newVibe);
    this.vibe = newVibe;
    this.jepa.observe(newVibe);
  }

  predict(): number {
    return this.jepa.predict();
  }
}
