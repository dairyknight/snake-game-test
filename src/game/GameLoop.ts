import { GameManager } from './GameManager';
import { GameState } from '../state/GameState';

// Score thresholds that increase speed (reduce tick interval)
// Every 50 points, speed increases. Min interval: 60ms.
const SPEED_TIERS = [
  { minScore: 0,   interval: 150 },
  { minScore: 50,  interval: 120 },
  { minScore: 100, interval: 100 },
  { minScore: 150, interval: 80 },
  { minScore: 200, interval: 65 },
  { minScore: 250, interval: 60 },
] as const;

export type DrawCallback = (interpolation: number) => void;

export class GameLoop {
  private rafId: number | null = null;
  private lastTimestamp: number = 0;
  private accumulated: number = 0;
  private running: boolean = false;

  constructor(
    private readonly gameManager: GameManager,
    private readonly draw: DrawCallback,
  ) {}

  getTickInterval(): number {
    const score = this.gameManager.getScore();
    for (let i = SPEED_TIERS.length - 1; i >= 0; i--) {
      if (score >= SPEED_TIERS[i].minScore) {
        return SPEED_TIERS[i].interval;
      }
    }
    return 150;
  }

  getSpeedTier(): number {
    const score = this.gameManager.getScore();
    for (let i = SPEED_TIERS.length - 1; i >= 0; i--) {
      if (score >= SPEED_TIERS[i].minScore) {
        return i + 1;
      }
    }
    return 1;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = 0;
    this.accumulated = 0;
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick(timestamp: number): void {
    if (!this.running) return;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const delta = Math.min(timestamp - this.lastTimestamp, 250); // cap at 250ms to avoid spiral of death
    this.lastTimestamp = timestamp;

    const state = this.gameManager.getState();

    if (state === GameState.PLAYING) {
      this.accumulated += delta;
      const tickInterval = this.getTickInterval();

      while (this.accumulated >= tickInterval) {
        this.accumulated -= tickInterval;
        this.gameManager.update();

        // Re-check state after update — game may have ended
        if (this.gameManager.getState() !== GameState.PLAYING) {
          this.accumulated = 0;
          break;
        }
      }
    } else if (state === GameState.GAME_OVER) {
      // Stop the loop when game is over
      this.accumulated = 0;
    } else {
      // IDLE or PAUSED — reset accumulator so ticks don't burst on resume
      this.accumulated = 0;
    }

    // Always draw (even when paused/idle, so overlays render correctly)
    const interpolation = state === GameState.PLAYING
      ? Math.min(this.accumulated / this.getTickInterval(), 1)
      : 0;
    this.draw(interpolation);

    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }
}
