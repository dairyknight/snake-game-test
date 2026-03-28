import { EventEmitter } from '../utils/EventEmitter';
import { GameState } from '../state/GameState';

export type GameEvents = {
  stateChange: { from: GameState; to: GameState };
  scoreUpdate: { score: number; highScore: number };
  foodEaten: void;
  gameOver: { score: number };
};

export class GameManager {
  private state: GameState = GameState.IDLE;
  readonly events = new EventEmitter<GameEvents>();

  getState(): GameState {
    return this.state;
  }

  private transition(to: GameState): void {
    const from = this.state;
    this.state = to;
    this.events.emit('stateChange', { from, to });
  }

  startGame(): void {
    if (this.state === GameState.IDLE) {
      this.transition(GameState.PLAYING);
    }
  }

  pauseGame(): void {
    if (this.state === GameState.PLAYING) {
      this.transition(GameState.PAUSED);
    }
  }

  resumeGame(): void {
    if (this.state === GameState.PAUSED) {
      this.transition(GameState.PLAYING);
    }
  }

  togglePause(): void {
    if (this.state === GameState.PLAYING) {
      this.pauseGame();
    } else if (this.state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  endGame(): void {
    if (this.state === GameState.PLAYING) {
      this.transition(GameState.GAME_OVER);
      this.events.emit('gameOver', { score: 0 });
    }
  }

  restartGame(): void {
    if (this.state === GameState.GAME_OVER || this.state === GameState.IDLE) {
      this.transition(GameState.IDLE);
    }
  }

  update(): void {
    // Called each logical tick — will be expanded in later phases
  }

  getScore(): number {
    return 0; // Will be wired to ScoreManager in Phase 5
  }
}
