import { GameManager } from '../game/GameManager';
import { GameState } from '../state/GameState';

export class PauseOverlay {
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
    el.id = 'pause-overlay';
    el.classList.add('hidden');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Paused');
    el.innerHTML = `
      <div class="screen-content">
        <h1>Paused</h1>
        <button id="btn-resume" class="btn-primary" autofocus>Resume</button>
        <p class="hint">or press <kbd>P</kbd> / <kbd>Esc</kbd></p>
      </div>
    `;

    const btn = el.querySelector<HTMLButtonElement>('#btn-resume')!;
    btn.addEventListener('click', () => {
      this.gameManager.resumeGame();
    });

    return el;
  }

  private update(state: GameState): void {
    if (state === GameState.PAUSED) {
      this.el.classList.remove('hidden');
      this.el.querySelector<HTMLButtonElement>('#btn-resume')?.focus();
    } else {
      this.el.classList.add('hidden');
    }
  }
}
