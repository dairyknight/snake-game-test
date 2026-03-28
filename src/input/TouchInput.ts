import { GameManager } from '../game/GameManager';
import { GameState } from '../state/GameState';
import { Direction } from '../game/Snake';

const SWIPE_THRESHOLD = 30; // px

export class TouchInput {
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private handleTouchStart: (e: TouchEvent) => void;
  private handleTouchEnd: (e: TouchEvent) => void;
  private attached: boolean = false;

  constructor(
    private readonly gameManager: GameManager,
    private readonly target: HTMLElement = document.body,
  ) {
    this.handleTouchStart = this.onTouchStart.bind(this);
    this.handleTouchEnd = this.onTouchEnd.bind(this);
  }

  attach(): void {
    if (this.attached) return;
    this.target.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.target.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.attached = true;
  }

  detach(): void {
    this.target.removeEventListener('touchstart', this.handleTouchStart);
    this.target.removeEventListener('touchend', this.handleTouchEnd);
    this.attached = false;
  }

  private onTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    e.preventDefault();
  }

  private onTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return; // Too small

    const state = this.gameManager.getState();
    if (state !== GameState.PLAYING && state !== GameState.IDLE) return;

    let dir: typeof Direction[keyof typeof Direction];
    if (absDx > absDy) {
      dir = dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      dir = dy > 0 ? Direction.DOWN : Direction.UP;
    }

    if (state === GameState.IDLE) {
      this.gameManager.startGame();
    }
    this.gameManager.queueDirection(dir);
    e.preventDefault();
  }
}
