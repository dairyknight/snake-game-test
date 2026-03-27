import { GameManager } from '../game/GameManager'

export class PauseOverlay {
  private el: HTMLElement

  constructor(private gm: GameManager) {
    this.el = this.build()

    const container = document.getElementById('game-container')
    if (container) {
      container.appendChild(this.el)
    }
  }

  private build(): HTMLElement {
    const el = document.createElement('div')
    el.className = 'overlay overlay--pause'
    el.setAttribute('role', 'region')
    el.setAttribute('aria-label', 'Game paused')

    const title = document.createElement('p')
    title.className = 'paused-title'
    title.textContent = 'PAUSED'

    const hint = document.createElement('p')
    hint.className = 'hint-text'
    hint.textContent = 'Press P or Esc to resume'

    const btnGroup = document.createElement('div')
    btnGroup.className = 'btn-group'

    const resumeBtn = document.createElement('button')
    resumeBtn.className = 'btn btn--resume'
    resumeBtn.textContent = 'Resume'
    resumeBtn.addEventListener('click', () => this.gm.resumeGame())

    btnGroup.appendChild(resumeBtn)

    el.appendChild(title)
    el.appendChild(hint)
    el.appendChild(btnGroup)

    return el
  }

  setVisible(visible: boolean): void {
    if (visible) {
      this.el.classList.add('visible')
      // Focus Resume button when paused for keyboard accessibility
      const btn = this.el.querySelector<HTMLButtonElement>('button')
      if (btn) btn.focus()
    } else {
      this.el.classList.remove('visible')
    }
  }
}
