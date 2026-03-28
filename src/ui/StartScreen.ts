import { GameManager } from '../game/GameManager';
import { GameState } from '../state/GameState';

export class StartScreen {
  private el: HTMLElement;

  constructor(private readonly gameManager: GameManager) {
    this.el = this.createEl();
    document.body.appendChild(this.el);

    this.gameManager.events.on('stateChange', ({ to }) => {
      this.update(to);
    });
  }

  private createEl(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'start-screen';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Start Game');
    el.innerHTML = `
      <div class="screen-content">
        <h1>🐍 Snake</h1>
        <p class="subtitle">Use arrow keys or WASD to move</p>
        <button id="btn-start" class="btn-primary" autofocus>Start Game</button>
        <p class="hint">or press <kbd>Space</kbd> / <kbd>Enter</kbd></p>
      </div>
    `;

    const btn = el.querySelector<HTMLButtonElement>('#btn-start')!;
    btn.addEventListener('click', () => {
      this.gameManager.startGame();
    });

    return el;
  }

  private update(state: GameState): void {
    if (state === GameState.IDLE) {
      this.el.classList.remove('hidden');
      this.el.querySelector<HTMLButtonElement>('#btn-start')?.focus();
    } else {
      this.el.classList.add('hidden');
    }
  }
}
