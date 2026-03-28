const HIGH_SCORE_KEY = 'snake_high_score';
const POINTS_PER_FOOD = 10;

export class ScoreManager {
  private currentScore: number = 0;
  private _highScore: number = 0;

  constructor() {
    this.loadHighScore();
  }

  private loadHighScore(): void {
    try {
      const stored = typeof localStorage !== 'undefined'
        ? localStorage.getItem(HIGH_SCORE_KEY)
        : null;
      if (stored !== null) {
        this._highScore = parseInt(stored, 10) || 0;
      }
    } catch {
      // localStorage not available (e.g., test env)
    }
  }

  private saveHighScore(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(HIGH_SCORE_KEY, String(this._highScore));
      }
    } catch {
      // ignore
    }
  }

  get score(): number {
    return this.currentScore;
  }

  get highScore(): number {
    return this._highScore;
  }

  add(points: number = POINTS_PER_FOOD): void {
    this.currentScore += points;
    if (this.currentScore > this._highScore) {
      this._highScore = this.currentScore;
      this.saveHighScore();
    }
  }

  reset(): void {
    this.currentScore = 0;
    // highScore persists
  }

  clearHighScore(): void {
    this._highScore = 0;
    this.saveHighScore();
  }
}
