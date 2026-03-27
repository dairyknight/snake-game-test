import { GameManager } from '../game/GameManager'

export class StartScreen {
  private el: HTMLElement

  constructor(private gm: GameManager) {
    this.el = this.build()
    this.updateHighScore()

    const container = document.getElementById('game-container')
    if (container) {
      container.appendChild(this.el)
    }
  }

  private build(): HTMLElement {
    const el = document.createElement('div')
    el.className = 'overlay overlay--solid'
    el.setAttribute('role', 'region')
    el.setAttribute('aria-label', 'Start screen')

    const title = document.createElement('h1')
    title.textContent = 'SNAKE'

    const highScore = document.createElement('p')
    highScore.className = 'high-score-display'
    highScore.id = 'start-high-score'
    highScore.textContent = `Best: ${this.gm.scoreManager.highScore}`

    const hint = document.createElement('p')
    hint.className = 'hint-text'
    hint.textContent = 'Press SPACE or ↑↓←→ to start'

    const btnGroup = document.createElement('div')
    btnGroup.className = 'btn-group'

    const startBtn = document.createElement('button')
    startBtn.className = 'btn btn--primary'
    startBtn.textContent = 'Start Game'
    startBtn.addEventListener('click', () => this.gm.startGame())

    const clearBtn = document.createElement('button')
    clearBtn.className = 'btn btn--secondary'
    clearBtn.textContent = 'Clear High Score'
    clearBtn.addEventListener('click', () => {
      this.gm.scoreManager.clearHighScore()
      this.updateHighScore()
    })

    btnGroup.appendChild(startBtn)
    btnGroup.appendChild(clearBtn)

    el.appendChild(title)
    el.appendChild(highScore)
    el.appendChild(hint)
    el.appendChild(btnGroup)

    return el
  }

  updateHighScore(): void {
    const el = this.el.querySelector<HTMLElement>('#start-high-score')
    if (el) {
      el.textContent = `Best: ${this.gm.scoreManager.highScore}`
    }
  }

  setVisible(visible: boolean): void {
    if (visible) {
      this.el.classList.add('visible')
    } else {
      this.el.classList.remove('visible')
    }
  }
}
