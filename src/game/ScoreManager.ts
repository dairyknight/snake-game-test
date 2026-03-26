import { EventEmitter } from '../utils/EventEmitter'

const LS_KEY = 'snake_high_score'

export interface ScoreManagerEvents {
  scoreChange: { currentScore: number; highScore: number }
  highScoreChange: { highScore: number }
}

const SPEED_THRESHOLDS: Array<{ min: number; interval: number }> = [
  { min: 200, interval: 75 },
  { min: 150, interval: 90 },
  { min: 100, interval: 110 },
  { min: 50, interval: 130 },
  { min: 0, interval: 150 },
]

export class ScoreManager {
  readonly events = new EventEmitter<ScoreManagerEvents>()

  private _currentScore = 0
  private _highScore = 0

  constructor() {
    const stored = localStorage.getItem(LS_KEY)
    if (stored !== null) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed)) {
        this._highScore = parsed
      }
    }
  }

  get currentScore(): number {
    return this._currentScore
  }

  get highScore(): number {
    return this._highScore
  }

  add(points: number): void {
    this._currentScore += points

    let highScoreChanged = false
    if (this._currentScore > this._highScore) {
      this._highScore = this._currentScore
      localStorage.setItem(LS_KEY, String(this._highScore))
      highScoreChanged = true
    }

    this.events.emit('scoreChange', {
      currentScore: this._currentScore,
      highScore: this._highScore,
    })

    if (highScoreChanged) {
      this.events.emit('highScoreChange', { highScore: this._highScore })
    }
  }

  reset(): void {
    this._currentScore = 0
  }

  clearHighScore(): void {
    this._highScore = 0
    localStorage.removeItem(LS_KEY)
  }

  getTickInterval(): number {
    for (const { min, interval } of SPEED_THRESHOLDS) {
      if (this._currentScore >= min) {
        return interval
      }
    }
    return 150
  }
}
