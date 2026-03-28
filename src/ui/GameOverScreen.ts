import { GameManager } from '../game/GameManager';
import { GameState } from '../state/GameState';

export class GameOverScreen {
  private el: HTMLElement;
  private scoreEl: HTMLElement;

  constructor(private readonly gameManager: GameManager) {
    const { el, scoreEl } = this.createEl();
    this.el = el;
    this.scoreEl = scoreEl;
    document.body.appendChild(this.el);

    this.gameManager.events.on('stateChange', ({ to }) => {
      this.update(to);
    });

    this.gameManager.events.on('gameOver', ({ score }) => {
      this.scoreEl.textContent = String(score);
    });
  }

  private createEl(): { el: HTMLElement; scoreEl: HTMLElement } {
    const el = document.createElement('div');
    el.id = 'game-over-screen';
    el.classList.add('hidden');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Game Over');
    el.innerHTML = `
      <div class="screen-content">
        <h1>Game Over</h1>
        <p class="score-display">Score: <span id="final-score">0</span></p>
        <button id="btn-play-again" class="btn-primary" autofocus>Play Again</button>
        <p class="hint">or press <kbd>Space</kbd> / <kbd>Enter</kbd></p>
      </div>
    `;

    const btn = el.querySelector<HTMLButtonElement>('#btn-play-again')!;
    btn.addEventListener('click', () => {
      this.gameManager.restartGame();
    });

    const scoreEl = el.querySelector<HTMLElement>('#final-score')!;
    return { el, scoreEl };
  }

  private update(state: GameState): void {
    if (state === GameState.GAME_OVER) {
      // Small delay to let the game-over animation play first
      setTimeout(() => {
        this.el.classList.remove('hidden');
        this.el.querySelector<HTMLButtonElement>('#btn-play-again')?.focus();
      }, 600);
    } else {
      this.el.classList.add('hidden');
    }
  }
}
