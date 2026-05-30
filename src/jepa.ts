/**
 * JEPA – weighted history predictor.
 *
 * The JEPA reads a room's weighted history and predicts the next vibe.
 * It uses an exponentially-weighted moving average.
 * Conservation holds by construction: prediction is always a convex
 * combination of past observations.
 */
export class Jepa {
  private history: number[] = [];
  private alpha: number;

  constructor(alpha: number = 0.3) {
    if (alpha <= 0 || alpha > 1) {
      throw new Error('alpha must be in (0, 1]');
    }
    this.alpha = alpha;
  }

  observe(vibe: number): void {
    this.history.push(vibe);
  }

  predict(): number {
    if (this.history.length === 0) return 0;
    const n = this.history.length;
    let total = 0;
    let weightSum = 0;
    for (let i = 0; i < n; i++) {
      const age = n - 1 - i;
      const w = this.alpha * Math.pow(1 - this.alpha, age);
      total += w * this.history[i];
      weightSum += w;
    }
    return weightSum === 0 ? 0 : total / weightSum;
  }

  surprise(observed: number): number {
    return Math.abs(observed - this.predict());
  }

  getHistory(): number[] {
    return [...this.history];
  }

  getObservationCount(): number {
    return this.history.length;
  }
}
