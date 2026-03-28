import { GameManager } from '../game/GameManager';
import { GameState } from '../state/GameState';
import { Direction } from '../game/Snake';

const KEY_MAP: Record<string, typeof Direction[keyof typeof Direction]> = {
  ArrowUp:    Direction.UP,
  ArrowDown:  Direction.DOWN,
  ArrowLeft:  Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  s: Direction.DOWN,
  a: Direction.LEFT,
  d: Direction.RIGHT,
  W: Direction.UP,
  S: Direction.DOWN,
  A: Direction.LEFT,
  D: Direction.RIGHT,
};

export class KeyboardInput {
  private handleKeyDown: (e: KeyboardEvent) => void;
  private attached: boolean = false;

  constructor(private readonly gameManager: GameManager) {
    this.handleKeyDown = this.onKeyDown.bind(this);
  }

  attach(): void {
    if (this.attached) return;
    window.addEventListener('keydown', this.handleKeyDown);
    this.attached = true;
  }

  detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.attached = false;
  }

  private onKeyDown(e: KeyboardEvent): void {
    const state = this.gameManager.getState();

    // Direction keys
    const dir = KEY_MAP[e.key];
    if (dir) {
      e.preventDefault();
      if (state === GameState.IDLE) {
        // First directional input starts the game
        this.gameManager.startGame();
        this.gameManager.queueDirection(dir);
      } else if (state === GameState.PLAYING) {
        this.gameManager.queueDirection(dir);
      }
      return;
    }

    // Pause / Resume
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault();
      if (state === GameState.PLAYING || state === GameState.PAUSED) {
        this.gameManager.togglePause();
      }
      return;
    }

    // Start / Restart
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (state === GameState.IDLE) {
        this.gameManager.startGame();
      } else if (state === GameState.GAME_OVER) {
        this.gameManager.restartGame();
      }
      return;
    }
  }
}
